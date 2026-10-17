import type { CaseId, SampleId } from './identifiers.js';
import type { AIMessage } from './messages.js';
import type { AIExecutionResult } from './execution.js';
import type { EvaluatorResult } from './evaluator.js';

/** One execution of a case. Repeated samples stay separate and are not overwritten by aggregates. */
export interface ConversationTurnResult {
  turnId: string;
  index: number;
  messages: AIMessage[];
  execution: AIExecutionResult;
  evaluatorResults: EvaluatorResult[];
}

export interface EvaluationSample {
  sampleId: SampleId;
  sampleIndex: number;
  caseId: CaseId;
  requestHash: string;
  execution: AIExecutionResult;
  turns?: ConversationTurnResult[];
  evaluatorResults: EvaluatorResult[];
  status: 'pass' | 'fail' | 'error' | 'review';
  startedAt: string;
  completedAt: string;
}
