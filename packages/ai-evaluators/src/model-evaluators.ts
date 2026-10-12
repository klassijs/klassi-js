import { createEvaluatorRegistry, type InMemoryEvaluatorRegistry } from '@klassijs/ai-core';
import { createModelEvaluator } from './judge.js';
import { judgePrompts } from './judge-prompts.js';

export const modelEvaluators = judgePrompts.map((prompt) => createModelEvaluator(prompt.id, prompt.id));

export function registerModelEvaluators(registry: InMemoryEvaluatorRegistry = createEvaluatorRegistry()): InMemoryEvaluatorRegistry {
  for (const evaluator of modelEvaluators) {
    registry.register(evaluator);
  }
  return registry;
}
