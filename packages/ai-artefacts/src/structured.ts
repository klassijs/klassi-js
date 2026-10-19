import ts from 'typescript';
import { parse as parseYaml } from 'yaml';
import type { ArtifactType, GeneratedArtifact } from '@klassijs/ai-core';
import { forbiddenFindings, repositoryLint, type StaticFinding } from './source-checks.js';

export function typescriptFindings(content: string): StaticFinding[] {
  const fileName = 'artefact.ts';
  const options: ts.CompilerOptions = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022 };
  const host = ts.createCompilerHost(options);
  const read = host.readFile.bind(host);
  const exists = host.fileExists.bind(host);
  const getSourceFile = host.getSourceFile.bind(host);
  host.fileExists = (name) => name === fileName || exists(name);
  host.readFile = (name) => (name === fileName ? content : read(name));
  host.getSourceFile = (name, languageVersion) => {
    if (name === fileName) {
      return ts.createSourceFile(name, content, languageVersion, true, ts.ScriptKind.TS);
    }
    return getSourceFile(name, languageVersion);
  };
  const program = ts.createProgram({ rootNames: [fileName], options, host });
  const findings = ts.getPreEmitDiagnostics(program).flatMap((diagnostic) => {
    if (diagnostic.file && diagnostic.file.fileName !== fileName) {
      return [];
    }
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    return message.length > 0 ? [{ code: 'typescript' as const, severity: 'high' as const, message, deterministic: true as const }] : [];
  });
  return [...findings, ...forbiddenFindings(content)];
}

export function jsonFindings(content: string, schema?: Record<string, unknown>): StaticFinding[] {
  try {
    const value = JSON.parse(content) as unknown;
    return schema ? schemaFindings(value, schema) : [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [{ code: 'json', severity: 'high', message, deterministic: true }];
  }
}

export function yamlFindings(content: string, schema?: Record<string, unknown>): StaticFinding[] {
  try {
    const value = parseYaml(content, { schema: 'core', maxAliasCount: 10 }) as unknown;
    return schema ? schemaFindings(value, schema) : [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [{ code: 'yaml', severity: 'high', message, deterministic: true }];
  }
}

export function valuePolicyFindings(content: string, type: 'json' | 'yaml', required?: Record<string, unknown>, forbidden: string[] = []): StaticFinding[] {
  const parsed = type === 'json' ? jsonFindings(content) : yamlFindings(content);
  if (parsed.length > 0) {
    return parsed;
  }
  const value = (type === 'json' ? JSON.parse(content) : parseYaml(content, { schema: 'core', maxAliasCount: 10 })) as Record<string, unknown>;
  const findings: StaticFinding[] = [];
  for (const [key, expected] of Object.entries(required ?? {})) {
    if (value[key] !== expected) {
      findings.push({ code: 'required-value', severity: 'high', message: `${key} did not equal the required value`, deterministic: true });
    }
  }
  for (const key of forbidden) {
    if (key in value) {
      findings.push({ code: 'forbidden-value', severity: 'high', message: `${key} is forbidden`, deterministic: true });
    }
  }
  return findings;
}

export function referenceFindings(content: string, type: 'json' | 'yaml', references: { path: string; equals: string }[]): StaticFinding[] {
  if (references.length === 0) {
    return [];
  }
  let value: unknown;
  try {
    value = type === 'json' ? (JSON.parse(content) as unknown) : (parseYaml(content, { schema: 'core', maxAliasCount: 10 }) as unknown);
  } catch {
    return [];
  }
  return references.flatMap((reference) => {
    const left = readPath(value, reference.path);
    const right = readPath(value, reference.equals);
    if (JSON.stringify(left) !== JSON.stringify(right)) {
      return [{ code: 'reference', severity: 'medium' as const, message: `${reference.path} did not match ${reference.equals}`, deterministic: true as const }];
    }
    return [];
  });
}

export function profileFindings(artefact: GeneratedArtifact, options?: { disposableDatabase?: boolean }): StaticFinding[] {
  const content = artefact.content;
  switch (artefact.type) {
    case 'openapi':
      return openApiFindings(content);
    case 'sql':
      return sqlFindings(content, options?.disposableDatabase === true);
    case 'infrastructure':
      return infrastructureFindings(content);
    case 'documentation':
      return /^#\s+\S/m.test(content) ? [] : [{ code: 'documentation', severity: 'medium', message: 'documentation needs a heading', deterministic: true }];
    case 'requirements':
      return /\bBR-\d+\b/.test(content) && content.trim().length > 8
        ? []
        : [{ code: 'requirements', severity: 'high', message: 'a requirement needs a BR id and a statement', deterministic: true }];
    case 'architecture':
      return /\b(component|decision)\b/i.test(content)
        ? []
        : [{ code: 'architecture', severity: 'medium', message: 'architecture text needs a component or a decision', deterministic: true }];
    default:
      return [];
  }
}

function openApiFindings(content: string): StaticFinding[] {
  const parsed = content.trim().startsWith('{') ? jsonFindings(content) : yamlFindings(content);
  if (parsed.length > 0) {
    return parsed;
  }
  const value = (content.trim().startsWith('{') ? JSON.parse(content) : parseYaml(content, { schema: 'core', maxAliasCount: 10 })) as Record<string, unknown>;
  if (typeof value.openapi !== 'string' && typeof value.swagger !== 'string') {
    return [{ code: 'openapi', severity: 'high', message: 'OpenAPI document needs an openapi or swagger version', deterministic: true }];
  }
  return [];
}

function sqlFindings(content: string, disposableDatabase: boolean): StaticFinding[] {
  const findings: StaticFinding[] = [];
  if (/\b(drop\s+database|grant\s+|copy\s+|attach\s+)/i.test(content)) {
    findings.push({ code: 'sql', severity: 'critical', message: 'SQL statement is outside the static policy', deterministic: true });
  }
  if (!disposableDatabase && /^\s*(insert|update|delete)\b/i.test(content)) {
    findings.push({ code: 'sql-execution', severity: 'high', message: 'SQL execution requires a disposable database', deterministic: true });
  }
  return findings;
}

function infrastructureFindings(content: string): StaticFinding[] {
  if (/\b(terraform\s+apply|kubectl\s+apply|pulumi\s+up|deploy)\b/i.test(content)) {
    return [{ code: 'infrastructure', severity: 'critical', message: 'apply and deploy are prohibited', deterministic: true }];
  }
  return [];
}

function schemaFindings(value: unknown, schema: Record<string, unknown>): StaticFinding[] {
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return [{ code: 'schema', severity: 'high', message: 'expected an object', deterministic: true }];
    }
    const record = value as Record<string, unknown>;
    const required = Array.isArray(schema.required) ? schema.required.filter((item): item is string => typeof item === 'string') : [];
    return required.filter((key) => !(key in record)).map((key) => ({
      code: 'schema',
      severity: 'high' as const,
      message: `missing ${key}`,
      deterministic: true as const,
    }));
  }
  return [];
}

function readPath(value: unknown, expression: string): unknown {
  return expression.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, value);
}

export function deterministicFor(artefact: GeneratedArtifact): StaticFinding[] {
  if (artefact.type === 'javascript' || artefact.type === 'test' || artefact.type === 'step-definition' || artefact.type === 'page-object') {
    return repositoryLint(artefact.content);
  }
  if (artefact.type === 'typescript') {
    return typescriptFindings(artefact.content);
  }
  return [];
}

export function isExecutableType(type: ArtifactType): boolean {
  return type === 'javascript' || type === 'test';
}
