import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createRunReport, writeRunReports } from '../dist/index.js';

function sample(status, output) {
  return {
    sampleId: 'run:refund:0',
    sampleIndex: 0,
    caseId: 'refund-policy-001',
    requestHash: 'hash',
    execution: {
      id: 'result',
      adapterId: 'fake',
      status: 'completed',
      output: { text: output },
      timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.010Z', latencyMs: 10 },
      native: { provider: 'must-not-leak' },
    },
    evaluatorResults: [
      { evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status, score: status === 'pass' ? 1 : 0, reason: output },
      ...(status === 'fail' ? [{ evaluatorId: 'prompt-injection', evaluatorVersion: '1.0.0', status: 'fail', severity: 'critical', score: 0, reason: output, metadata: { owasp: 'LLM01:2025' } }] : []),
    ],
    status,
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:00:00.010Z',
  };
}

const gate = { status: 'fail', checks: [{ id: 'overall.minimumScore', status: 'fail', reason: 'overall score is below the minimum' }], criticalSecurityFailure: false };

test('json and markdown come from the normalised result and escape model output', async () => {
  const output = 'answer <script>alert(1)</script>';
  const report = createRunReport({
    run: { runId: 'run-1', startedAt: '2026-01-01T00:00:00.000Z' },
    suite: { id: 'support-release', name: 'Support release', version: '1.0.0', cases: [{ id: 'refund-policy-001', name: 'Refund "policy"' }] },
    samples: [sample('fail', output)],
    gate,
  });
  const directory = await mkdtemp(path.join(tmpdir(), 'klassi-report-'));
  const artifacts = await writeRunReports(report, directory);
  const json = JSON.parse(await readFile(path.join(directory, 'report.json'), 'utf8'));
  const markdown = await readFile(path.join(directory, 'report.md'), 'utf8');
  const html = await readFile(path.join(directory, 'report.html'), 'utf8');
  const cucumber = JSON.parse(await readFile(path.join(directory, 'cucumber.json'), 'utf8'));
  const junit = await readFile(path.join(directory, 'junit.xml'), 'utf8');
  const sarifText = await readFile(path.join(directory, 'report.sarif'), 'utf8');
  const sarif = JSON.parse(sarifText);

  assert.equal(json.status, 'fail');
  assert.equal(json.cases[0].samples[0].output, output);
  assert.equal(JSON.stringify(json).includes('must-not-leak'), false);
  assert.equal(markdown.includes('Refund'), true);
  assert.equal(markdown.includes('<script>'), false);
  assert.equal(markdown.includes('&lt;script&gt;'), true);
  assert.equal(html.includes('<script'), false);
  assert.equal(html.includes('&lt;script&gt;'), true);
  assert.equal(html.includes('Content-Security-Policy'), true);
  assert.equal(html.includes('not a certification'), true);
  assert.equal(cucumber[0].keyword, 'Feature');
  assert.equal(cucumber[0].elements[0].steps[0].name, output);
  assert.equal(cucumber[0].elements[0].steps[0].result.status, 'failed');
  assert.equal(junit.includes('<testsuite'), true);
  assert.equal(junit.includes('<failure'), true);
  assert.equal(junit.includes('&quot;policy&quot;'), true);
  assert.equal(junit.includes('<script>'), false);
  assert.equal(sarif.version, '2.1.0');
  assert.equal(sarif.runs[0].results.length, 1);
  assert.equal(sarif.runs[0].results[0].ruleId, 'prompt-injection');
  assert.equal(sarif.runs[0].results[0].level, 'error');
  assert.equal(sarif.runs[0].results[0].message.text, output);
  assert.match(sarif.runs[0].properties.statement, /not a certification/);
  assert.equal(sarifText.includes('<script'), false);
  assert.deepEqual(artifacts.map((artifact) => artifact.format), ['json', 'markdown', 'html', 'cucumber-json', 'junit', 'sarif']);
});

test('token totals are reported when price data is missing', async () => {
  const priced = sample('pass', 'answer');
  priced.execution.model = { deployment: 'target' };
  priced.execution.usage = { inputTokens: 2, outputTokens: 3, totalTokens: 5 };
  const report = createRunReport({
    run: { runId: 'run-1', startedAt: '2026-01-01T00:00:00.000Z' },
    suite: { id: 'support-release', name: 'Support release', version: '1.0.0', cases: [{ id: 'refund-policy-001', name: 'Refund policy' }] },
    samples: [priced],
    gate,
    costTable: { version: '2026-01', currency: 'USD', prices: [{ match: 'other', inputPerMillion: 1, outputPerMillion: 1 }] },
  });
  const directory = await mkdtemp(path.join(tmpdir(), 'klassi-report-'));
  await writeRunReports(report, directory);
  const markdown = await readFile(path.join(directory, 'report.md'), 'utf8');

  assert.equal(report.usage.totalTokens, 5);
  assert.equal(report.usage.estimatedCost, undefined);
  assert.deepEqual(report.usage.unpricedModels, ['target']);
  assert.equal(markdown.includes('Total tokens: 5'), true);
  assert.equal(markdown.includes('Price data missing for: target'), true);
  assert.equal(markdown.includes('Estimated cost:'), false);
  assert.equal(markdown.includes('not a certification'), true);
});
