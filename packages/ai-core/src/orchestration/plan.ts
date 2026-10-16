import type { EvaluationCase, EvaluationSuite } from '../evaluation.js';
import type { RunId, SampleId } from '../identifiers.js';
import type { ExecutionPolicy } from '../policy.js';
import { createSampleId } from './ids.js';
import { mergeExecutionPolicy } from './policy.js';

export interface PlannedSample {
  evaluationCase: EvaluationCase;
  sampleIndex: number;
  sampleId: SampleId;
  policy: ExecutionPolicy;
}

export function planCaseSamples(
  evaluationCase: EvaluationCase,
  runId: RunId,
  policy: ExecutionPolicy,
): PlannedSample[] {
  return Array.from({ length: policy.samples }, (_value, sampleIndex) => ({
    evaluationCase,
    sampleIndex,
    sampleId: createSampleId(runId, evaluationCase.id, sampleIndex),
    policy,
  }));
}

export function planSuite(
  suite: EvaluationSuite,
  runId: RunId,
  cli?: Partial<ExecutionPolicy>,
): PlannedSample[] {
  return suite.cases.flatMap((evaluationCase) => {
    const policy = mergeExecutionPolicy(suite.defaults?.execution, evaluationCase.execution, cli);
    return planCaseSamples(evaluationCase, runId, policy);
  });
}
