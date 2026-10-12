import type { CaseId, SampleId } from './identifiers.js';
import type { AIExecutionResult } from './execution.js';
import type { EvaluatorResult } from './evaluator.js';

/** One execution of a case. Repeated samples stay separate and are not overwritten by aggregates. */
export interface EvaluationSample {
  sampleId: SampleId;
  sampleIndex: number;
  caseId: CaseId;
  requestHash: string;
  execution: AIExecutionResult;
  evaluatorResults: EvaluatorResult[];
  status: 'pass' | 'fail' | 'error' | 'review';
  startedAt: string;
  completedAt: string;
}
