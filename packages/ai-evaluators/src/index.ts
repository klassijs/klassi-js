import { createEvaluatorRegistry, type Evaluator, type InMemoryEvaluatorRegistry } from '@klassijs/ai-core';
import { allowedCitationDomain, citationPresence, expectedTools, forbiddenTools, latency, refusalDetection, requiredToolArguments, toolArgumentSchema, toolArguments, toolCallCount, toolCalled, toolNotCalled, toolResult } from './behaviour-evaluators.js';
import { jsonPath, jsonSchema } from './structured-evaluators.js';
import { modelEvaluators, registerModelEvaluators } from './model-evaluators.js';
import { getJudgePrompt, judgePrompts } from './judge-prompts.js';
import { registerSecurityEvaluators, securityControls, securityEvaluators } from './security-evaluators.js';
import { contains, exactMatch, forbiddenKeywords, notContains, regexMatch, requiredKeywords } from './text-evaluators.js';

export const deterministicEvaluators: Evaluator[] = [
  exactMatch,
  contains,
  notContains,
  regexMatch,
  jsonSchema,
  jsonPath,
  requiredKeywords,
  forbiddenKeywords,
  citationPresence,
  allowedCitationDomain,
  toolCalled,
  toolNotCalled,
  toolArguments,
  expectedTools,
  forbiddenTools,
  toolCallCount,
  toolArgumentSchema,
  requiredToolArguments,
  toolResult,
  refusalDetection,
  latency,
];

export { getJudgePrompt, judgePrompts, modelEvaluators, registerModelEvaluators };
export { registerSecurityEvaluators, securityControls, securityEvaluators };

export function registerDeterministicEvaluators(registry: InMemoryEvaluatorRegistry = createEvaluatorRegistry()): InMemoryEvaluatorRegistry {
  for (const evaluator of deterministicEvaluators) {
    registry.register(evaluator);
  }
  return registry;
}
