import { createEvaluatorResult, type AIExecutionResult, type Evaluator, type EvaluatorContext, type EvaluatorResult } from '@klassijs/ai-core';

export const EVALUATOR_VERSION = '1.0.0';

export function outputText(result: AIExecutionResult): string {
  if (typeof result.output.text === 'string') {
    return result.output.text;
  }
  const assistant = result.output.messages?.find((message) => message.role === 'assistant');
  if (!assistant) {
    return '';
  }
  if (typeof assistant.content === 'string') {
    return assistant.content;
  }
  return assistant.content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export function scored(evaluator: Pick<Evaluator, 'id' | 'version'>, passed: boolean, reason: string): EvaluatorResult {
  return createEvaluatorResult(evaluator, {
    status: passed ? 'pass' : 'fail',
    score: passed ? 1 : 0,
    reason,
  });
}

export function failedConfig(evaluator: Pick<Evaluator, 'id' | 'version'>, message: string): EvaluatorResult {
  return createEvaluatorResult(evaluator, {
    status: 'error',
    error: { code: 'EVALUATOR_ERROR', message },
  });
}

export function readString(config: unknown, key: string): string | undefined {
  if (!config || typeof config !== 'object' || !(key in config)) {
    return undefined;
  }
  const value = (config as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

export function readStringList(config: unknown, key: string): string[] | undefined {
  if (!config || typeof config !== 'object' || !(key in config)) {
    return undefined;
  }
  const value = (config as Record<string, unknown>)[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    return undefined;
  }
  return value;
}

export function readNumber(config: unknown, key: string): number | undefined {
  if (!config || typeof config !== 'object' || !(key in config)) {
    return undefined;
  }
  const value = (config as Record<string, unknown>)[key];
  return typeof value === 'number' ? value : undefined;
}

export function defineEvaluator(id: string, name: string, evaluate: (context: EvaluatorContext) => Promise<EvaluatorResult>): Evaluator {
  return { id, name, version: EVALUATOR_VERSION, kind: 'deterministic', evaluate };
}
