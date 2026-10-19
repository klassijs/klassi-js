import { createEvaluatorRegistry, createEvaluatorResult, type Evaluator, type EvaluatorContext, type InMemoryEvaluatorRegistry } from '@klassijs/ai-core';
import { verifyArtefact } from './verify.js';

export const artefactEvaluator: Evaluator = {
  id: 'artefact',
  name: 'Artefact verification',
  version: '1.0.0',
  kind: 'deterministic',
  async evaluate(context: EvaluatorContext) {
    const artefacts = context.result.artefacts ?? [];
    if (artefacts.length === 0) {
      return createEvaluatorResult(artefactEvaluator, { status: 'fail', score: 0, reason: 'No artefact was extracted' });
    }
    const results = [];
    for (const artefact of artefacts) {
      results.push(await verifyArtefact(artefact));
    }
    const passed = results.every((result) => result.status === 'pass');
    return createEvaluatorResult(artefactEvaluator, {
      status: passed ? 'pass' : 'fail',
      score: passed ? 1 : 0,
      reason: passed ? 'Artefact passed verification' : results.flatMap((result) => result.findings.map((finding) => finding.message)).join('; '),
      metadata: { evidence: results.map((result) => result.evidence) },
    });
  },
};

export function registerArtefactEvaluators(registry: InMemoryEvaluatorRegistry = createEvaluatorRegistry()): InMemoryEvaluatorRegistry {
  registry.register(artefactEvaluator);
  return registry;
}
