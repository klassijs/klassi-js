import type { EvaluatorBinding } from './evaluation.js';
import type { Evaluator, EvaluatorDescriptor } from './evaluator.js';
import { AIEvaluationError } from './errors.js';
import type { EvaluatorId } from './identifiers.js';

export interface EvaluatorRegistry {
  register(evaluator: Evaluator): void;
  has(id: EvaluatorId): boolean;
  get(id: EvaluatorId): Evaluator;
  resolve(binding: EvaluatorBinding): Evaluator;
  list(): EvaluatorDescriptor[];
}

/**
 * Evaluator lookup for tests and for application composition.
 * The public API does not require a process-wide singleton.
 */
export class InMemoryEvaluatorRegistry implements EvaluatorRegistry {
  private readonly evaluators = new Map<EvaluatorId, Evaluator>();

  register(evaluator: Evaluator): void {
    if (!evaluator.id || !evaluator.id.trim()) {
      throw new AIEvaluationError('CONFIG_ERROR', 'Evaluator id is required');
    }
    if (!evaluator.version || !evaluator.version.trim()) {
      throw new AIEvaluationError('CONFIG_ERROR', `Evaluator "${evaluator.id}" requires a version`);
    }
    if (this.evaluators.has(evaluator.id)) {
      throw new AIEvaluationError('CONFIG_ERROR', `Evaluator "${evaluator.id}" is already registered`);
    }
    this.evaluators.set(evaluator.id, evaluator);
  }

  has(id: EvaluatorId): boolean {
    return this.evaluators.has(id);
  }

  get(id: EvaluatorId): Evaluator {
    const evaluator = this.evaluators.get(id);
    if (!evaluator) {
      throw new AIEvaluationError('EVALUATOR_ERROR', `Evaluator "${id}" is not registered`);
    }
    return evaluator;
  }

  resolve(binding: EvaluatorBinding): Evaluator {
    const evaluator = this.get(binding.id);
    if (evaluator.kind !== binding.type) {
      throw new AIEvaluationError(
        'CONFIG_ERROR',
        `Evaluator "${binding.id}" is ${evaluator.kind}, not ${binding.type}`,
      );
    }
    return evaluator;
  }

  list(): EvaluatorDescriptor[] {
    return [...this.evaluators.values()].map((evaluator) => ({
      id: evaluator.id,
      name: evaluator.name,
      version: evaluator.version,
      kind: evaluator.kind,
    }));
  }
}

export function createEvaluatorRegistry(): InMemoryEvaluatorRegistry {
  return new InMemoryEvaluatorRegistry();
}
