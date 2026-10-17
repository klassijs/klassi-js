import type { Baseline, BaselineCaseResult } from './baseline.js';
import { aggregateStatus, aggregateSuite } from './aggregation.js';
import type { EvaluationSample } from './sample.js';

export interface ComparisonThresholds {
  /** Absolute score change that counts as material. */
  scoreDelta: number;
  /** Absolute pass-rate change that counts as material. */
  passRateDelta: number;
  /** Absolute P95 latency change, in milliseconds, that counts as material. */
  latencyMsDelta: number;
}

export const DEFAULT_COMPARISON_THRESHOLDS: ComparisonThresholds = {
  scoreDelta: 0.05,
  passRateDelta: 0.05,
  latencyMsDelta: 0,
};

export type ComparisonVerdict = 'improvement' | 'no material change' | 'regression' | 'new case' | 'removed case' | 'not comparable';

export interface CaseComparison {
  caseId: string;
  verdict: ComparisonVerdict;
  baseline?: BaselineCaseResult;
  current?: BaselineCaseResult;
  reason: string;
}

export interface MetricComparison {
  name: string;
  verdict: ComparisonVerdict;
  baseline?: number;
  current?: number;
  reason: string;
}

export interface BaselineComparison {
  verdict: ComparisonVerdict;
  comparable: boolean;
  reason: string;
  cases: CaseComparison[];
  metrics: MetricComparison[];
}

export function createBaseline(input: {
  id: string;
  name: string;
  createdAt: string;
  suiteId: string;
  suiteVersion: string;
  datasetHash: string;
  sourceRunId: string;
  samples: readonly EvaluationSample[];
}): Baseline {
  const aggregate = aggregateSuite(input.samples);
  const metrics: Record<string, number> = {};
  if (aggregate.counts.passRate !== undefined) {
    metrics.passRate = aggregate.counts.passRate;
  }
  if (aggregate.scores.mean !== undefined) {
    metrics.meanScore = aggregate.scores.mean;
  }
  if (aggregate.latency.p95 !== undefined) {
    metrics.p95LatencyMs = aggregate.latency.p95;
  }
  const caseResults: Record<string, BaselineCaseResult> = {};
  for (const item of aggregate.cases) {
    const result: BaselineCaseResult = { status: aggregateStatus(item.samples.map((sample) => sample.status)) };
    if (item.scores.mean !== undefined) {
      result.score = item.scores.mean;
    }
    caseResults[item.caseId] = result;
  }
  return {
    id: input.id,
    name: input.name,
    createdAt: input.createdAt,
    suiteId: input.suiteId,
    suiteVersion: input.suiteVersion,
    datasetHash: input.datasetHash,
    sourceRunId: input.sourceRunId,
    metrics,
    caseResults,
  };
}

export function compareBaselines(baseline: Baseline, current: Baseline, thresholds: ComparisonThresholds = DEFAULT_COMPARISON_THRESHOLDS): BaselineComparison {
  if (baseline.suiteId !== current.suiteId || baseline.datasetHash !== current.datasetHash) {
    return {
      verdict: 'not comparable',
      comparable: false,
      reason: baseline.suiteId !== current.suiteId ? 'suite id differs' : 'dataset hash differs',
      cases: [],
      metrics: [],
    };
  }
  const caseIds = [...new Set([...Object.keys(baseline.caseResults), ...Object.keys(current.caseResults)])].sort((left, right) => left.localeCompare(right));
  const cases = caseIds.map((caseId) => compareCase(caseId, baseline.caseResults[caseId], current.caseResults[caseId], thresholds));
  const metrics = [
    compareMetric('passRate', baseline.metrics.passRate, current.metrics.passRate, thresholds.passRateDelta, 'lower'),
    compareMetric('meanScore', baseline.metrics.meanScore, current.metrics.meanScore, thresholds.scoreDelta, 'lower'),
    compareMetric('p95LatencyMs', baseline.metrics.p95LatencyMs, current.metrics.p95LatencyMs, thresholds.latencyMsDelta, 'higher'),
  ].filter((item): item is MetricComparison => item !== undefined);
  return {
    verdict: overallVerdict(cases, metrics),
    comparable: true,
    reason: 'dataset hash matches',
    cases,
    metrics,
  };
}

function compareCase(caseId: string, baseline: BaselineCaseResult | undefined, current: BaselineCaseResult | undefined, thresholds: ComparisonThresholds): CaseComparison {
  if (!baseline) {
    return { caseId, verdict: 'new case', ...(current ? { current } : {}), reason: 'case is not in the baseline' };
  }
  if (!current) {
    return { caseId, verdict: 'removed case', baseline, reason: 'case is not in the current run' };
  }
  if (baseline.status === 'error' || baseline.status === 'review' || current.status === 'error' || current.status === 'review') {
    return { caseId, verdict: 'not comparable', baseline, current, reason: 'a case result is error or review' };
  }
  if (baseline.status === 'pass' && current.status === 'fail') {
    return { caseId, verdict: 'regression', baseline, current, reason: 'case changed from pass to fail' };
  }
  if (baseline.status === 'fail' && current.status === 'pass') {
    return { caseId, verdict: 'improvement', baseline, current, reason: 'case changed from fail to pass' };
  }
  if (baseline.score === undefined || current.score === undefined) {
    return { caseId, verdict: 'not comparable', baseline, current, reason: 'a case score is missing' };
  }
  if (baseline.score - current.score > thresholds.scoreDelta) {
    return { caseId, verdict: 'regression', baseline, current, reason: 'score fell by more than the threshold' };
  }
  if (current.score - baseline.score > thresholds.scoreDelta) {
    return { caseId, verdict: 'improvement', baseline, current, reason: 'score rose by more than the threshold' };
  }
  return { caseId, verdict: 'no material change', baseline, current, reason: 'score stayed within the threshold' };
}

function compareMetric(name: string, baseline: number | undefined, current: number | undefined, threshold: number, worse: 'lower' | 'higher'): MetricComparison | undefined {
  if (baseline === undefined || current === undefined) {
    return undefined;
  }
  const regressed = worse === 'lower' ? baseline - current > threshold : current - baseline > threshold;
  const improved = worse === 'lower' ? current - baseline > threshold : baseline - current > threshold;
  if (regressed) {
    return { name, verdict: 'regression', baseline, current, reason: `${name} moved beyond the threshold` };
  }
  if (improved) {
    return { name, verdict: 'improvement', baseline, current, reason: `${name} moved beyond the threshold` };
  }
  return { name, verdict: 'no material change', baseline, current, reason: `${name} stayed within the threshold` };
}

function overallVerdict(cases: CaseComparison[], metrics: MetricComparison[]): ComparisonVerdict {
  const verdicts = [...cases.map((item) => item.verdict), ...metrics.map((item) => item.verdict)];
  if (verdicts.includes('regression')) {
    return 'regression';
  }
  if (verdicts.includes('not comparable')) {
    return 'not comparable';
  }
  if (verdicts.includes('improvement')) {
    return 'improvement';
  }
  return 'no material change';
}
