import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Baseline, EvaluationSuite } from '@klassijs/ai-core';
import { ZodError } from 'zod';
import { parse } from 'yaml';
import { hashDataset } from './canonical.js';
import { DatasetValidationError, type DatasetValidationIssue } from './errors.js';
import { aiConfigurationSchema, baselineSchema, evaluationSuiteSchema } from './schemas.js';

export interface LoadedSuite {
  suite: EvaluationSuite;
  datasetHash: string;
}

function issuesFromZod(error: ZodError): DatasetValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.map(String).join('.') : '<root>',
    message: issue.message,
  }));
}

function parseWith<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: ZodError } }, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new DatasetValidationError(issuesFromZod(parsed.error));
  }
  return parsed.data;
}

export function parseEvaluationSuite(value: unknown): EvaluationSuite {
  return parseWith(evaluationSuiteSchema, value);
}

export function parseBaseline(value: unknown): Baseline {
  return parseWith(baselineSchema, value);
}

export function parseAIConfiguration(value: unknown): unknown {
  return parseWith(aiConfigurationSchema, value);
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    throw new DatasetValidationError([{ path: '<root>', message }]);
  }
}

function parseYaml(text: string): unknown {
  try {
    return parse(text, { maxAliasCount: 50, uniqueKeys: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid YAML';
    throw new DatasetValidationError([{ path: '<root>', message }]);
  }
}

export function loadSuiteFromJson(text: string): LoadedSuite {
  const suite = parseEvaluationSuite(parseJson(text));
  return { suite, datasetHash: hashDataset(suite) };
}

export function loadSuiteFromYaml(text: string): LoadedSuite {
  const suite = parseEvaluationSuite(parseYaml(text));
  return { suite, datasetHash: hashDataset(suite) };
}

export async function loadSuiteFile(filePath: string): Promise<LoadedSuite> {
  const text = await readFile(filePath, 'utf8');
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.json') {
    return loadSuiteFromJson(text);
  }
  if (extension === '.yaml' || extension === '.yml') {
    return loadSuiteFromYaml(text);
  }
  throw new DatasetValidationError([
    { path: '<root>', message: `Unsupported dataset extension "${extension || '(none)'}". Use .json, .yaml, or .yml` },
  ]);
}
