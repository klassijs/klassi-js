export type {
  AdapterId,
  BaselineId,
  CaseId,
  EvaluatorId,
  RunId,
  SampleId,
  SuiteId,
} from './identifiers.js';

export type { AIContentPart, AIImagePart, AIMessage, AIMessageRole, AITextPart } from './messages.js';

export { AIEvaluationError } from './errors.js';
export type { AIErrorCode, NormalizedExecutionError } from './errors.js';

export { DEFAULT_EXECUTION_POLICY } from './policy.js';
export type { ExecutionPolicy } from './policy.js';

export type {
  EvaluationCase,
  EvaluationExpectations,
  EvaluationSuite,
  EvaluationTarget,
  EvaluatorBinding,
  QualityGate,
} from './evaluation.js';

export type {
  AIExecutionRequest,
  AIExecutionResult,
  AIResponseFormat,
  AIToolChoice,
  AIToolDefinition,
  AIUsage,
  EvidenceWriter,
  ExecutionContext,
  KlassiLogger,
  NormalizedCitation,
  NormalizedSafetyResult,
  NormalizedToolCall,
} from './execution.js';

export { ADAPTER_CAPABILITY_KEYS } from './adapter.js';
export type {
  AdapterCapabilities,
  AdapterDescriptor,
  AdapterHealth,
  AdapterHealthContext,
  AIPlatformAdapter,
  ProviderEvidence,
} from './adapter.js';

export { createAdapterRegistry, InMemoryAdapterRegistry, validateAdapterCapabilities } from './registry.js';
export type { AdapterRegistry } from './registry.js';

export type { EvaluationSample } from './sample.js';

export {
  assertBuiltinQualityScore,
  BUILTIN_QUALITY_SCORE_MAX,
  BUILTIN_QUALITY_SCORE_MIN,
  createEvaluatorResult,
  EVALUATOR_STATUSES,
  isBehaviouralEvaluatorStatus,
  isInfrastructureEvaluatorStatus,
} from './evaluator.js';
export type {
  Evaluator,
  EvaluatorContext,
  EvaluatorDescriptor,
  EvaluatorKind,
  EvaluatorResult,
  EvaluatorStatus,
  NormalizedEvaluatorError,
  RunContext,
} from './evaluator.js';

export { createEvaluatorRegistry, InMemoryEvaluatorRegistry } from './evaluator-registry.js';
export type { EvaluatorRegistry } from './evaluator-registry.js';

export type { Baseline, BaselineCaseResult } from './baseline.js';
export { compareBaselines, createBaseline, DEFAULT_COMPARISON_THRESHOLDS } from './baseline-compare.js';
export type { BaselineComparison, CaseComparison, ComparisonThresholds, ComparisonVerdict, MetricComparison } from './baseline-compare.js';

export {
  aggregateCase,
  aggregateSample,
  aggregateStatus,
  aggregateSuite,
  PASS_RATE,
  PERCENTILE_ALGORITHM,
  percentile,
  STANDARD_DEVIATION,
  summarizeNumbers,
  summarizeStatuses,
} from './aggregation.js';
export type { AggregateStatus, CaseAggregate, NumericSummary, SampleAggregate, StatusCounts, SuiteAggregate } from './aggregation.js';

export { CRITICAL_CASE_TAG, evaluateQualityGate } from './quality-gate.js';
export type {
  QualityGateCase,
  QualityGateCheck,
  QualityGateDecision,
  QualityGateEvidence,
  QualityGateInput,
  QualityGateResult,
} from './quality-gate.js';

export { createRunId, createSampleId } from './orchestration/ids.js';
export { isInfrastructureRetry, mergeExecutionPolicy, retryDelayMs } from './orchestration/policy.js';
export { planSuite } from './orchestration/plan.js';
export type { PlannedSample } from './orchestration/plan.js';
export { runEvaluation } from './orchestration/run.js';
export type { AttemptRecord, EvaluationRun, RunEvaluationOptions, SampleRecord } from './orchestration/run.js';
