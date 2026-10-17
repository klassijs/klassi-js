import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { aggregateStatus, aggregateSuite, CONTROL_ALIGNMENT_STATEMENT, summarizeUsage, type AggregateStatus, type ControlReference, type CostTable, type EvaluationSample, type NumericSummary, type QualityGateDecision, type StatusCounts, type UsageSummary } from '@klassijs/ai-core';

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
  usage: UsageSummary;
  assurance: {
    alignment: 'evidence';
    statement: string;
    controls: Array<ControlReference & { evaluatorId: string; status: string }>;
  };
  security: {
    criticalSecurityFailure: boolean;
    violations: Array<{ evaluatorId: string; severity: string; owasp?: string; reason?: string }>;
  };
  cases: ReportCase[];
}

export interface ReportArtifact {
  format: 'json' | 'markdown' | 'html' | 'cucumber-json' | 'junit' | 'sarif';
  path: string;
}

export function createRunReport(input: {
  run: { runId: string; startedAt: string };
  suite: ReportSuite;
  samples: readonly EvaluationSample[];
  gate: QualityGateDecision;
  costTable?: CostTable;
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
    usage: summarizeUsage(input.samples, input.costTable),
    assurance: { alignment: 'evidence', statement: CONTROL_ALIGNMENT_STATEMENT, controls: assuranceControls(input.samples) },
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
  lines.push('', '## Usage', '', `Requests: ${report.usage.requests}`);
  lines.push(`Input tokens: ${formatTokens(report.usage.inputTokens)}`);
  lines.push(`Output tokens: ${formatTokens(report.usage.outputTokens)}`);
  lines.push(`Total tokens: ${formatTokens(report.usage.totalTokens)}`);
  if (report.usage.estimatedCost !== undefined) {
    lines.push(`Estimated cost: ${report.usage.estimatedCost} ${escapeUntrusted(report.usage.currency ?? '')} (${escapeUntrusted(report.usage.costTableVersion ?? '')})`);
  }
  if (report.usage.unpricedModels.length > 0) {
    lines.push(`Price data missing for: ${report.usage.unpricedModels.map((model) => escapeUntrusted(model)).join(', ')}`);
  }
  if (report.usage.samplesMissingUsage > 0) {
    lines.push(`Samples missing usage: ${report.usage.samplesMissingUsage}`);
  }
  lines.push('', '## Security', '', escapeUntrusted(report.assurance.statement), '', `Critical security failure: ${report.security.criticalSecurityFailure}`);
  for (const control of report.assurance.controls) {
    lines.push(`- ${escapeUntrusted(control.evaluatorId)} ${escapeUntrusted(control.status)}: ${escapeUntrusted(control.framework)} ${escapeUntrusted(control.id)}`);
  }
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

/** Self-contained HTML. Model text is escaped and the page does not execute it. */
export function renderHtml(report: EvaluationRunReport): string {
  const cases = report.cases.map((item) => {
    const samples = item.samples.map((sample) => {
      const evaluators = sample.evaluators.map((evaluator) => `<li>${escapeHtml(evaluator.evaluatorId)} ${escapeHtml(evaluator.evaluatorVersion)}: ${escapeHtml(evaluator.status)}${evaluator.reason === undefined ? '' : ` — ${escapeHtml(evaluator.reason)}`}</li>`).join('');
      return `<li>sample ${sample.sampleIndex}: ${escapeHtml(sample.status)} (${sample.latencyMs}ms)<p>${escapeHtml(sample.output)}</p><ul>${evaluators}</ul></li>`;
    }).join('');
    return `<section><h2>${escapeHtml(item.name)}</h2><p>Status: ${escapeHtml(item.status)}</p><ul>${samples}</ul></section>`;
  }).join('');
  const violations = report.security.violations.length === 0
    ? '<li>no critical or high violations</li>'
    : report.security.violations.map((violation) => `<li>${escapeHtml(violation.severity)} ${escapeHtml(violation.evaluatorId)}${violation.owasp === undefined ? '' : ` ${escapeHtml(violation.owasp)}`}${violation.reason === undefined ? '' : `: ${escapeHtml(violation.reason)}`}</li>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>${escapeHtml(report.suite.name)}</title>
<style>body{font-family:sans-serif;margin:2rem} code{white-space:pre-wrap}</style>
</head>
<body>
<h1>${escapeHtml(report.suite.name)}</h1>
<p>Status: ${escapeHtml(report.status)}</p>
<p>Run: ${escapeHtml(report.runId)}</p>
<h2>Security</h2>
<p>${escapeHtml(report.assurance.statement)}</p>
<ul>${violations}</ul>
${cases}
</body>
</html>
`;
}

/** SARIF 2.1.0 for critical and high security findings. Other scores stay in the evaluation report. */
export function renderSarif(report: EvaluationRunReport): string {
  const rules = [...new Map(report.security.violations.map((violation) => [violation.evaluatorId, violation])).values()].map((violation) => ({
    id: violation.evaluatorId,
    shortDescription: { text: violation.owasp ?? violation.evaluatorId },
    help: { text: report.assurance.statement },
    properties: { severity: violation.severity, ...(violation.owasp === undefined ? {} : { owasp: violation.owasp }) },
  }));
  const results = report.security.violations.map((violation) => ({
    ruleId: violation.evaluatorId,
    level: violation.severity === 'critical' ? 'error' : 'warning',
    message: { text: violation.reason ?? violation.evaluatorId },
    locations: [{ physicalLocation: { artifactLocation: { uri: `${report.suite.id}.json` } } }],
  }));
  const document = {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [{
      tool: { driver: { name: 'Klassi AI evaluation', version: report.suite.version, informationUri: 'https://github.com/klassijs/klassi-js', rules } },
      properties: { alignment: report.assurance.alignment, statement: report.assurance.statement },
      results,
    }],
  };
  return `${JSON.stringify(document, null, 2).replace(/</g, '\\u003c')}\n`;
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
  formats: readonly ReportArtifact['format'][] = ['json', 'markdown', 'html', 'cucumber-json', 'junit', 'sarif'],
): Promise<ReportArtifact[]> {
  await mkdir(outputDir, { recursive: true });
  const files: Array<[ReportArtifact['format'], string, string]> = [
    ['json', 'report.json', `${JSON.stringify(report, null, 2)}\n`],
    ['markdown', 'report.md', renderMarkdown(report)],
    ['html', 'report.html', renderHtml(report)],
    ['cucumber-json', 'cucumber.json', renderCucumberJson(report)],
    ['junit', 'junit.xml', renderJUnit(report)],
    ['sarif', 'report.sarif', renderSarif(report)],
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

function assuranceControls(samples: readonly EvaluationSample[]): EvaluationRunReport['assurance']['controls'] {
  return samples.flatMap((sample) => sample.evaluatorResults.flatMap((result) => {
    const controls = result.metadata?.controls;
    if (!Array.isArray(controls)) {
      return [];
    }
    return controls.flatMap((control) => {
      if (!control || typeof control !== 'object') {
        return [];
      }
      const reference = control as Partial<ControlReference>;
      if ((reference.framework !== 'nist-ai-rmf' && reference.framework !== 'nist-genai-profile' && reference.framework !== 'owasp-genai') || typeof reference.id !== 'string' || typeof reference.name !== 'string') {
        return [];
      }
      return [{ evaluatorId: result.evaluatorId, status: result.status, framework: reference.framework, id: reference.id, name: reference.name }];
    });
  }));
}

function formatTokens(value: number | undefined): string {
  return value === undefined ? 'unavailable' : String(value);
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

function escapeHtml(value: string): string {
  return escapeUntrusted(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeXml(value: string): string {
  return escapeHtml(value);
}
