import type { EvaluatorId, RunId, SuiteId } from './identifiers.js';
import type { AIErrorCode } from './errors.js';
import { AIEvaluationError } from './errors.js';
import type { EvaluationCase, EvaluationExpectations } from './evaluation.js';
import type { AIExecutionResult, EvidenceWriter } from './execution.js';
import type { AdapterRegistry } from './registry.js';
import type { EvaluationSample } from './sample.js';

/** Run identity available to evaluators. Credentials are not part of this context. */
export interface RunContext {
  runId: RunId;
  suiteId: SuiteId;
  startedAt: string;
  metadata?: Record<string, unknown>;
}

export type EvaluatorKind = 'deterministic' | 'model' | 'human' | 'platform';

/**
 * pass and fail are behavioural outcomes of the system under test.
 * error is an infrastructure failure of the evaluator and is not a behavioural fail.
 * skipped means the evaluator did not run.
 * review means a person or policy still has to decide.
 */
export type EvaluatorStatus = 'pass' | 'fail' | 'error' | 'skipped' | 'review';

export const EVALUATOR_STATUSES: readonly EvaluatorStatus[] = ['pass', 'fail', 'error', 'skipped', 'review'];

/** Built-in Klassi quality scores use this closed range. */
export const BUILTIN_QUALITY_SCORE_MIN = 0;
export const BUILTIN_QUALITY_SCORE_MAX = 1;

export interface NormalizedEvaluatorError {
  code: AIErrorCode;
  message: string;
}

export interface EvaluatorResult {
  evaluatorId: EvaluatorId;
  evaluatorVersion: string;
  status: EvaluatorStatus;
  score?: number;
  threshold?: number;
  severity?: 'info' | 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  metrics?: Record<string, number | string | boolean | null>;
  evidenceRefs?: string[];
  metadata?: Record<string, unknown>;
  error?: NormalizedEvaluatorError;
}

export interface EvaluatorContext<TConfig = unknown> {
  run: RunContext;
  evaluationCase: EvaluationCase;
  sample: EvaluationSample;
  result: AIExecutionResult;
  config: TConfig;
  expectations?: EvaluationExpectations;
  adapters: AdapterRegistry;
  evidence: EvidenceWriter;
}

export interface Evaluator<TConfig = unknown> {
  readonly id: EvaluatorId;
  readonly name: string;
  readonly version: string;
  readonly kind: EvaluatorKind;
  evaluate(context: EvaluatorContext<TConfig>): Promise<EvaluatorResult>;
}

export interface EvaluatorDescriptor {
  id: EvaluatorId;
  name: string;
  version: string;
  kind: EvaluatorKind;
}

export function isBehaviouralEvaluatorStatus(status: EvaluatorStatus): boolean {
  return status === 'pass' || status === 'fail' || status === 'review';
}

export function isInfrastructureEvaluatorStatus(status: EvaluatorStatus): boolean {
  return status === 'error';
}

export function assertBuiltinQualityScore(score: number): void {
  if (!Number.isFinite(score) || score < BUILTIN_QUALITY_SCORE_MIN || score > BUILTIN_QUALITY_SCORE_MAX) {
    throw new AIEvaluationError('EVALUATOR_ERROR', 'Built-in quality scores must be between 0.0 and 1.0');
  }
}

/** Stamps the evaluator id and version onto a shared result model. */
export function createEvaluatorResult(
  evaluator: Pick<Evaluator, 'id' | 'version'>,
  result: Omit<EvaluatorResult, 'evaluatorId' | 'evaluatorVersion'>,
): EvaluatorResult {
  if (result.score !== undefined) {
    assertBuiltinQualityScore(result.score);
  }
  if (result.status === 'error' && !result.error) {
    throw new AIEvaluationError('EVALUATOR_ERROR', 'Evaluator infrastructure errors must include an error');
  }
  if ((result.status === 'pass' || result.status === 'fail') && result.error) {
    throw new AIEvaluationError(
      'EVALUATOR_ERROR',
      'Behavioural pass/fail results must not carry an infrastructure error',
    );
  }

  return {
    evaluatorId: evaluator.id,
    evaluatorVersion: evaluator.version,
    ...result,
  };
}
