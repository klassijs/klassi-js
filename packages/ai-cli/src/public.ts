import { createAdapterRegistry } from '@klassijs/ai-core';
import type { EvaluationCase, EvaluationSuite } from '@klassijs/ai-core';
import { parseEvaluationCase, parseEvaluationSuite } from '@klassijs/ai-datasets';
import { runAiEvaluation } from './evaluate.js';

/** Frozen public contract. Later phases may add exports, but these names and this version stay stable. */
export const AI_PUBLIC_API_VERSION = '1.0.0';

export const AI_PUBLIC_CONTRACTS = ['aiSuite', 'aiCase', 'createAdapterRegistry', 'runAiEvaluation'] as const;

export function aiCase(input: unknown): EvaluationCase {
  return parseEvaluationCase(input);
}

export function aiSuite(input: unknown): EvaluationSuite {
  return parseEvaluationSuite(input);
}

export { createAdapterRegistry, runAiEvaluation };
