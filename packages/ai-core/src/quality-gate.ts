import type { CaseId } from './identifiers.js';
import type { EvaluationSample } from './sample.js';
import type { EvidenceWriter } from './execution.js';
import type { QualityGate } from './evaluation.js';
import type { EvaluatorResult } from './evaluator.js';
import { aggregateSuite, summarizeNumbers, summarizeStatuses, type AggregateStatus } from './aggregation.js';
import { budgetTokenTotal, summarizeUsage, type CostTable } from './usage.js';

/** A case is critical when its tags include this value. */
export const CRITICAL_CASE_TAG = 'critical';

export interface QualityGateCheck {
  id: string;
  status: 'pass' | 'fail';
  reason: string;
  actual?: number;
  limit?: number;
}

export interface QualityGateDecision {
  status: 'pass' | 'fail';
  checks: QualityGateCheck[];
  /** True when a configured critical security limit failed. A high average score does not remove it. */
  criticalSecurityFailure: boolean;
}

export interface QualityGateEvidence {
  name: 'quality-gate';
  body: QualityGateDecision;
  ref?: string;
}

export interface QualityGateResult {
  decision: QualityGateDecision;
  evidence: QualityGateEvidence;
}

export interface QualityGateCase {
  id: CaseId;
  tags?: string[];
}

export interface QualityGateInput {
  gate: QualityGate;
  samples: readonly EvaluationSample[];
  cases?: readonly QualityGateCase[];
  costTable?: CostTable;
  evidence?: EvidenceWriter;
}

export async function evaluateQualityGate(input: QualityGateInput): Promise<QualityGateResult> {
  const checks = collectChecks(input.gate, input.samples, input.cases ?? [], input.costTable);
  const decision: QualityGateDecision = {
    status: checks.some((check) => check.status === 'fail') ? 'fail' : 'pass',
    checks,
    criticalSecurityFailure: checks.some((check) => check.id === 'security.maximumCriticalViolations' && check.status === 'fail'),
  };
  const evidence: QualityGateEvidence = { name: 'quality-gate', body: decision };
  if (input.evidence) {
    evidence.ref = await input.evidence.write({ name: evidence.name, body: decision });
  }
  return { decision, evidence };
}

function collectChecks(gate: QualityGate, samples: readonly EvaluationSample[], cases: readonly QualityGateCase[], costTable?: CostTable): QualityGateCheck[] {
  const suite = aggregateSuite(samples);
  const checks: QualityGateCheck[] = [];
  if (gate.overall?.minimumScore !== undefined) {
    checks.push(atLeast('overall.minimumScore', suite.scores.mean, gate.overall.minimumScore, 'overall score'));
  }
  if (gate.overall?.minimumPassRate !== undefined) {
    checks.push(atLeast('overall.minimumPassRate', suite.counts.passRate, gate.overall.minimumPassRate, 'overall pass rate'));
  }
  for (const evaluatorId of Object.keys(gate.evaluators ?? {}).sort((left, right) => left.localeCompare(right))) {
    const limits = gate.evaluators?.[evaluatorId];
    if (!limits) {
      continue;
    }
    const stats = evaluatorStats(samples, evaluatorId);
    if (limits.minimumScore !== undefined) {
      checks.push(atLeast(`evaluators.${evaluatorId}.minimumScore`, stats.scores.mean, limits.minimumScore, `${evaluatorId} score`));
    }
    if (limits.maximumScore !== undefined) {
      checks.push(atMost(`evaluators.${evaluatorId}.maximumScore`, stats.scores.mean, limits.maximumScore, `${evaluatorId} score`));
    }
    if (limits.minimumPassRate !== undefined) {
      checks.push(atLeast(`evaluators.${evaluatorId}.minimumPassRate`, stats.counts.passRate, limits.minimumPassRate, `${evaluatorId} pass rate`));
    }
  }
  if (gate.criticalCases) {
    checks.push(criticalPassRate(samples, cases, gate.criticalCases.minimumPassRate));
  }
  if (gate.security) {
    checks.push(atMost('security.maximumCriticalViolations', violationCount(samples, 'critical'), gate.security.maximumCriticalViolations, 'critical security violations'));
    if (gate.security.maximumHighViolations !== undefined) {
      checks.push(atMost('security.maximumHighViolations', violationCount(samples, 'high'), gate.security.maximumHighViolations, 'high security violations'));
    }
  }
  if (gate.performance?.p95LatencyMs !== undefined) {
    checks.push(atMost('performance.p95LatencyMs', suite.latency.p95, gate.performance.p95LatencyMs, 'P95 latency'));
  }
  if (gate.budget) {
    const usage = summarizeUsage(samples, costTable);
    if (gate.budget.maximumTotalTokens !== undefined) {
      checks.push(atMost('budget.maximumTotalTokens', budgetTokenTotal(usage, 'totalTokens'), gate.budget.maximumTotalTokens, 'total tokens'));
    }
    if (gate.budget.maximumInputTokens !== undefined) {
      checks.push(atMost('budget.maximumInputTokens', budgetTokenTotal(usage, 'inputTokens'), gate.budget.maximumInputTokens, 'input tokens'));
    }
    if (gate.budget.maximumOutputTokens !== undefined) {
      checks.push(atMost('budget.maximumOutputTokens', budgetTokenTotal(usage, 'outputTokens'), gate.budget.maximumOutputTokens, 'output tokens'));
    }
    if (gate.budget.maximumRequests !== undefined) {
      checks.push(atMost('budget.maximumRequests', usage.requests, gate.budget.maximumRequests, 'request count'));
    }
    if (gate.budget.maximumEstimatedCost !== undefined) {
      checks.push(atMost('budget.maximumEstimatedCost', usage.estimatedCost, gate.budget.maximumEstimatedCost, 'estimated cost'));
    }
  }
  if (gate.stability?.minimumPassRate !== undefined) {
    checks.push(atLeast('stability.minimumPassRate', suite.counts.passRate, gate.stability.minimumPassRate, 'stability pass rate'));
  }
  if (gate.stability?.maximumScoreStdDev !== undefined) {
    checks.push(atMost('stability.maximumScoreStdDev', suite.scores.standardDeviation, gate.stability.maximumScoreStdDev, 'score standard deviation'));
  }
  if (gate.infrastructure?.maximumErrorRate !== undefined) {
    const errorRate = suite.counts.count === 0 ? undefined : suite.counts.errorCount / suite.counts.count;
    checks.push(atMost('infrastructure.maximumErrorRate', errorRate, gate.infrastructure.maximumErrorRate, 'infrastructure error rate'));
  }
  return checks;
}

function criticalPassRate(samples: readonly EvaluationSample[], cases: readonly QualityGateCase[], minimumPassRate: number): QualityGateCheck {
  const criticalIds = new Set(cases.filter((item) => item.tags?.includes(CRITICAL_CASE_TAG)).map((item) => item.id));
  if (criticalIds.size === 0) {
    return { id: 'criticalCases.minimumPassRate', status: 'fail', limit: minimumPassRate, reason: 'no critical cases were present' };
  }
  const aggregate = aggregateSuite(samples.filter((sample) => criticalIds.has(sample.caseId)));
  return atLeast('criticalCases.minimumPassRate', aggregate.counts.passRate, minimumPassRate, 'critical case pass rate');
}

function evaluatorStats(samples: readonly EvaluationSample[], evaluatorId: string): { counts: ReturnType<typeof summarizeStatuses>; scores: ReturnType<typeof summarizeNumbers> } {
  const results = samples.flatMap((sample) => sample.evaluatorResults.filter((result) => result.evaluatorId === evaluatorId));
  return {
    counts: summarizeStatuses(results.map((result) => result.status).filter(isAggregateStatus)),
    scores: summarizeNumbers(results.map((result) => result.score)),
  };
}

function violationCount(samples: readonly EvaluationSample[], severity: 'critical' | 'high'): number {
  return samples.reduce((count, sample) => count + sample.evaluatorResults.filter((result) => isViolation(result, severity)).length, 0);
}

function isViolation(result: EvaluatorResult, severity: 'critical' | 'high'): boolean {
  return result.status === 'fail' && result.severity === severity;
}

function atLeast(id: string, actual: number | undefined, limit: number, label: string): QualityGateCheck {
  if (actual === undefined) {
    return { id, status: 'fail', limit, reason: `${label} is unavailable` };
  }
  const passed = actual >= limit;
  return { id, status: passed ? 'pass' : 'fail', actual, limit, reason: passed ? `${label} met the minimum` : `${label} is below the minimum` };
}

function atMost(id: string, actual: number | undefined, limit: number, label: string): QualityGateCheck {
  if (actual === undefined) {
    return { id, status: 'fail', limit, reason: `${label} is unavailable` };
  }
  const passed = actual <= limit;
  return { id, status: passed ? 'pass' : 'fail', actual, limit, reason: passed ? `${label} met the maximum` : `${label} is above the maximum` };
}

function isAggregateStatus(status: string): status is AggregateStatus {
  return status === 'pass' || status === 'fail' || status === 'error' || status === 'review';
}
