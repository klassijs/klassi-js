import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { aggregateStatus, aggregateSuite, type AggregateStatus, type EvaluationSample, type NumericSummary, type QualityGateDecision, type StatusCounts } from '@klassijs/ai-core';

export interface ReportSuite {
  id: string;
  name: string;
  version: string;
  cases: Array<{ id: string; name: string }>;
}

export interface ReportEvaluator {
  evaluatorId: string;
  evaluatorVersion: string;
  status: string;
  score?: number;
  severity?: string;
  owasp?: string;
  reason?: string;
}

export interface ReportSample {
  sampleId: string;
  sampleIndex: number;
  status: AggregateStatus;
  latencyMs: number;
  output: string;
  evaluators: ReportEvaluator[];
}

export interface ReportCase {
  id: string;
  name: string;
  status: AggregateStatus;
  counts: StatusCounts;
  scores: NumericSummary;
  samples: ReportSample[];
}

/** Canonical machine-readable run report. It contains no provider-native payload. */
export interface EvaluationRunReport {
  runId: string;
  suite: { id: string; name: string; version: string };
  startedAt: string;
  status: 'pass' | 'fail';
  counts: StatusCounts;
  scores: NumericSummary;
  latency: NumericSummary;
  gate: QualityGateDecision;
  security: {
    criticalSecurityFailure: boolean;
    violations: Array<{ evaluatorId: string; severity: string; owasp?: string; reason?: string }>;
  };
  cases: ReportCase[];
}

export interface ReportArtifact {
  format: 'json' | 'markdown' | 'cucumber-json' | 'junit';
  path: string;
}

export function createRunReport(input: {
  run: { runId: string; startedAt: string };
  suite: ReportSuite;
  samples: readonly EvaluationSample[];
  gate: QualityGateDecision;
}): EvaluationRunReport {
  const aggregate = aggregateSuite(input.samples);
  const names = new Map(input.suite.cases.map((item) => [item.id, item.name]));
  const violations = input.samples.flatMap((sample) => sample.evaluatorResults.filter((result) => result.status === 'fail' && (result.severity === 'critical' || result.severity === 'high')).map((result) => ({
    evaluatorId: result.evaluatorId,
    severity: result.severity ?? 'high',
    ...(typeof result.metadata?.owasp === 'string' ? { owasp: result.metadata.owasp } : {}),
    ...(result.reason === undefined ? {} : { reason: result.reason }),
  })));
  return {
    runId: input.run.runId,
    suite: { id: input.suite.id, name: input.suite.name, version: input.suite.version },
    startedAt: input.run.startedAt,
    status: input.gate.status,
    counts: aggregate.counts,
    scores: aggregate.scores,
    latency: aggregate.latency,
    gate: input.gate,
    security: { criticalSecurityFailure: input.gate.criticalSecurityFailure, violations },
    cases: aggregate.cases.map((item) => ({
      id: item.caseId,
      name: names.get(item.caseId) ?? item.caseId,
      status: aggregateStatus(item.samples.map((sample) => sample.status)),
      counts: item.counts,
      scores: item.scores,
      samples: item.samples.map((sample) => {
        const source = input.samples.find((candidate) => candidate.sampleId === sample.sampleId);
        return {
          sampleId: sample.sampleId,
          sampleIndex: sample.sampleIndex,
          status: sample.status,
          latencyMs: source?.execution.timing.latencyMs ?? 0,
          output: source?.execution.output.text ?? '',
          evaluators: (source?.evaluatorResults ?? []).map((result) => ({
            evaluatorId: result.evaluatorId,
            evaluatorVersion: result.evaluatorVersion,
            status: result.status,
            ...(result.score === undefined ? {} : { score: result.score }),
            ...(result.severity === undefined ? {} : { severity: result.severity }),
            ...(typeof result.metadata?.owasp === 'string' ? { owasp: result.metadata.owasp } : {}),
            ...(result.reason === undefined ? {} : { reason: result.reason }),
          })),
        };
      }),
    })),
  };
}

export function escapeUntrusted(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/```/g, '`\u200b``');
}

export function renderMarkdown(report: EvaluationRunReport): string {
  const lines = [
    `# ${escapeUntrusted(report.suite.name)}`,
    '',
    `Status: ${report.status}`,
    `Run: ${escapeUntrusted(report.runId)}`,
    `Pass rate: ${formatRate(report.counts.passRate)}`,
    `Mean score: ${formatNumber(report.scores.mean)}`,
    '',
    '## Gate',
    '',
  ];
  for (const check of report.gate.checks) {
    lines.push(`- ${check.status} ${escapeUntrusted(check.id)}: ${escapeUntrusted(check.reason)}`);
  }
  if (report.gate.checks.length === 0) {
    lines.push('- no checks configured');
  }
  lines.push('', '## Security', '', `Critical security failure: ${report.security.criticalSecurityFailure}`);
  if (report.security.violations.length === 0) {
    lines.push('- no critical or high violations');
  }
  for (const violation of report.security.violations) {
    const control = violation.owasp === undefined ? '' : ` ${escapeUntrusted(violation.owasp)}`;
    const reason = violation.reason === undefined ? '' : `: ${escapeUntrusted(violation.reason)}`;
    lines.push(`- ${escapeUntrusted(violation.severity)} ${escapeUntrusted(violation.evaluatorId)}${control}${reason}`);
  }
  for (const item of report.cases) {
    lines.push('', `## ${escapeUntrusted(item.name)}`, '', `Status: ${item.status}`, '');
    for (const sample of item.samples) {
      lines.push(`- sample ${sample.sampleIndex}: ${sample.status} (${sample.latencyMs}ms)`);
      lines.push(`  Output: ${escapeUntrusted(sample.output)}`);
      for (const evaluator of sample.evaluators) {
        const score = evaluator.score === undefined ? '' : ` ${evaluator.score}`;
        const severity = evaluator.severity === undefined ? '' : ` ${escapeUntrusted(evaluator.severity)}`;
        const reason = evaluator.reason === undefined ? '' : ` — ${escapeUntrusted(evaluator.reason)}`;
        lines.push(`  - ${escapeUntrusted(evaluator.evaluatorId)} ${escapeUntrusted(evaluator.evaluatorVersion)}: ${evaluator.status}${severity}${score}${reason}`);
      }
    }
  }
  return `${lines.join('\n')}\n`;
}

/** Cucumber JSON document consumed by the existing Klassi HTML reporter. */
export function renderCucumberJson(report: EvaluationRunReport): string {
  const feature = {
    keyword: 'Feature',
    name: report.suite.name,
    description: `Quality gate ${report.status}`,
    uri: `${report.suite.id}.feature`,
    id: report.suite.id,
    tags: [],
    elements: report.cases.map((item) => ({
      keyword: 'Scenario',
      name: item.name,
      id: item.id,
      type: 'scenario',
      tags: [],
      steps: item.samples.map((sample) => ({
        keyword: 'When ',
        name: sample.output,
        result: {
          status: cucumberStatus(sample.status),
          duration: sample.latencyMs * 1_000_000,
          ...(sample.status === 'fail' || sample.status === 'error' ? { error_message: sample.evaluators.map((evaluator) => evaluator.reason).filter(Boolean).join('\n') } : {}),
        },
      })),
    })),
  };
  return `${JSON.stringify([feature], null, 2)}\n`;
}

/** JUnit XML in the same testcase shape the Cucumber JUnit formatter already writes. */
export function renderJUnit(report: EvaluationRunReport): string {
  const failures = report.cases.filter((item) => item.status === 'fail').length;
  const errors = report.cases.filter((item) => item.status === 'error').length;
  const skipped = report.cases.filter((item) => item.status === 'review').length;
  const time = report.cases.reduce((sum, item) => sum + item.samples.reduce((sampleSum, sample) => sampleSum + sample.latencyMs, 0), 0) / 1000;
  const cases = report.cases.map((item) => {
    const seconds = item.samples.reduce((sum, sample) => sum + sample.latencyMs, 0) / 1000;
    const open = `<testcase classname="${escapeXml(report.suite.id)}" name="${escapeXml(item.name)}" time="${seconds.toFixed(3)}">`;
    if (item.status === 'fail') {
      return `${open}<failure message="${escapeXml(item.status)}">${escapeXml(failureText(item))}</failure></testcase>`;
    }
    if (item.status === 'error') {
      return `${open}<error message="${escapeXml(item.status)}">${escapeXml(failureText(item))}</error></testcase>`;
    }
    if (item.status === 'review') {
      return `${open}<skipped message="review"></skipped></testcase>`;
    }
    return `${open}</testcase>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="${escapeXml(report.suite.name)}" tests="${report.cases.length}" failures="${failures}" errors="${errors}" skipped="${skipped}" time="${time.toFixed(3)}">\n${cases.join('\n')}\n</testsuite>\n`;
}

export async function writeRunReports(
  report: EvaluationRunReport,
  outputDir: string,
  formats: readonly ReportArtifact['format'][] = ['json', 'markdown', 'cucumber-json', 'junit'],
): Promise<ReportArtifact[]> {
  await mkdir(outputDir, { recursive: true });
  const files: Array<[ReportArtifact['format'], string, string]> = [
    ['json', 'report.json', `${JSON.stringify(report, null, 2)}\n`],
    ['markdown', 'report.md', renderMarkdown(report)],
    ['cucumber-json', 'cucumber.json', renderCucumberJson(report)],
    ['junit', 'junit.xml', renderJUnit(report)],
  ];
  const selected = new Set(formats);
  const artifacts: ReportArtifact[] = [];
  for (const [format, name, body] of files.filter(([format]) => selected.has(format))) {
    const filePath = path.join(outputDir, name);
    await writeFile(filePath, body, 'utf8');
    artifacts.push({ format, path: filePath });
  }
  return artifacts;
}

function formatRate(value: number | undefined): string {
  return value === undefined ? 'unavailable' : `${Math.round(value * 100)}%`;
}

function formatNumber(value: number | undefined): string {
  return value === undefined ? 'unavailable' : String(value);
}

function cucumberStatus(status: AggregateStatus): 'passed' | 'failed' | 'pending' {
  if (status === 'pass') {
    return 'passed';
  }
  if (status === 'review') {
    return 'pending';
  }
  return 'failed';
}

function failureText(item: ReportCase): string {
  return item.samples.flatMap((sample) => sample.evaluators.map((evaluator) => evaluator.reason).filter((reason): reason is string => Boolean(reason))).join('\n');
}

function escapeXml(value: string): string {
  return escapeUntrusted(value).replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
