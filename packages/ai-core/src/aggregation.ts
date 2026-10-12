import type { CaseId, SampleId } from './identifiers.js';
import type { EvaluationSample } from './sample.js';

/** Sample and evaluator statuses that participate in pass/fail/error/review counts. */
export type AggregateStatus = 'pass' | 'fail' | 'error' | 'review';

/**
 * Hyndman and Fan type 7, the linear interpolation used by Excel PERCENTILE.INC
 * and NumPy's default percentile.
 *
 * For a sorted sample x of length n and a percentile p in [0, 1], using 1-based ranks:
 * h = 1 + (n - 1) * p
 * value = x[floor(h)] + (h - floor(h)) * (x[ceil(h)] - x[floor(h)])
 *
 * The input is copied and sorted. An empty sample returns undefined.
 */
export const PERCENTILE_ALGORITHM = 'hyndman-fan-type-7' as const;

/**
 * Population standard deviation: the square root of the average squared distance from the mean.
 * A single finite value has deviation 0. An empty sample leaves the field unset.
 */
export const STANDARD_DEVIATION = 'population' as const;

/**
 * Pass rate is passCount / (passCount + failCount).
 * Error and review are excluded from the denominator. When there is no behavioural outcome the rate is unset.
 */
export const PASS_RATE = 'pass-over-pass-and-fail' as const;

/** error outranks fail, which outranks review, which outranks pass. */
const STATUS_PRECEDENCE: readonly AggregateStatus[] = ['error', 'fail', 'review', 'pass'];

export interface StatusCounts {
  count: number;
  passCount: number;
  failCount: number;
  errorCount: number;
  reviewCount: number;
  /** Unset when no sample or evaluator result was pass or fail. */
  passRate?: number;
}

export interface NumericSummary {
  /** Count of finite numbers. Missing values are excluded and are not counted as zero. */
  count: number;
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  standardDeviation?: number;
  p50?: number;
  p90?: number;
  p95?: number;
  p99?: number;
}

export interface SampleAggregate {
  sampleId: SampleId;
  caseId: CaseId;
  sampleIndex: number;
  status: AggregateStatus;
  counts: StatusCounts;
  scores: NumericSummary;
}

export interface CaseAggregate {
  caseId: CaseId;
  counts: StatusCounts;
  scores: NumericSummary;
  latency: NumericSummary;
  samples: SampleAggregate[];
}

export interface SuiteAggregate {
  counts: StatusCounts;
  scores: NumericSummary;
  latency: NumericSummary;
  cases: CaseAggregate[];
}

export function percentile(values: readonly number[], p: number): number | undefined {
  const sorted = finiteNumbers(values).sort(ascending);
  if (sorted.length === 0) {
    return undefined;
  }
  if (p <= 0) {
    return sorted[0];
  }
  if (p >= 1) {
    return sorted[sorted.length - 1];
  }
  const rank = 1 + (sorted.length - 1) * p;
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  const lowerValue = sorted[lower - 1];
  const upperValue = sorted[upper - 1];
  return lowerValue + (rank - lower) * (upperValue - lowerValue);
}

export function summarizeStatuses(statuses: readonly AggregateStatus[]): StatusCounts {
  const counts = {
    count: statuses.length,
    passCount: statuses.filter((status) => status === 'pass').length,
    failCount: statuses.filter((status) => status === 'fail').length,
    errorCount: statuses.filter((status) => status === 'error').length,
    reviewCount: statuses.filter((status) => status === 'review').length,
  };
  const behavioural = counts.passCount + counts.failCount;
  return behavioural === 0 ? counts : { ...counts, passRate: counts.passCount / behavioural };
}

export function summarizeNumbers(values: ReadonlyArray<number | null | undefined>): NumericSummary {
  const sorted = finiteNumbers(values).sort(ascending);
  if (sorted.length === 0) {
    return { count: 0 };
  }
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const variance = sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / sorted.length;
  return {
    count: sorted.length,
    mean,
    median: percentile(sorted, 0.5),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    standardDeviation: Math.sqrt(variance),
    p50: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
  };
}

export function aggregateStatus(statuses: readonly AggregateStatus[]): AggregateStatus {
  for (const status of STATUS_PRECEDENCE) {
    if (statuses.includes(status)) {
      return status;
    }
  }
  return 'review';
}

export function aggregateSample(sample: EvaluationSample): SampleAggregate {
  const statuses = sample.evaluatorResults.map((result) => result.status).filter(isAggregateStatus);
  return {
    sampleId: sample.sampleId,
    caseId: sample.caseId,
    sampleIndex: sample.sampleIndex,
    status: statuses.length === 0 ? sample.status : aggregateStatus(statuses),
    counts: summarizeStatuses(statuses),
    scores: summarizeNumbers(sample.evaluatorResults.map((result) => result.score)),
  };
}

export function aggregateCase(caseId: CaseId, samples: readonly EvaluationSample[]): CaseAggregate {
  const ordered = [...samples].sort(bySample);
  const aggregated = ordered.map(aggregateSample);
  return {
    caseId,
    counts: summarizeStatuses(aggregated.map((sample) => sample.status)),
    scores: summarizeNumbers(ordered.flatMap((sample) => sample.evaluatorResults.map((result) => result.score))),
    latency: summarizeNumbers(ordered.map((sample) => sample.execution.timing.latencyMs)),
    samples: aggregated,
  };
}

export function aggregateSuite(samples: readonly EvaluationSample[]): SuiteAggregate {
  const caseIds = [...new Set(samples.map((sample) => sample.caseId))].sort((left, right) => left.localeCompare(right));
  const cases = caseIds.map((caseId) => aggregateCase(caseId, samples.filter((sample) => sample.caseId === caseId)));
  const ordered = [...samples].sort(bySample);
  return {
    counts: summarizeStatuses(cases.flatMap((item) => item.samples.map((sample) => sample.status))),
    scores: summarizeNumbers(ordered.flatMap((sample) => sample.evaluatorResults.map((result) => result.score))),
    latency: summarizeNumbers(ordered.map((sample) => sample.execution.timing.latencyMs)),
    cases,
  };
}

function finiteNumbers(values: ReadonlyArray<number | null | undefined>): number[] {
  return values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
}

function ascending(left: number, right: number): number {
  return left - right;
}

function bySample(left: EvaluationSample, right: EvaluationSample): number {
  return left.sampleIndex - right.sampleIndex || left.sampleId.localeCompare(right.sampleId);
}

function isAggregateStatus(status: string): status is AggregateStatus {
  return status === 'pass' || status === 'fail' || status === 'error' || status === 'review';
}
