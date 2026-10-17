import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateQualityGate } from '../dist/index.js';

function sample(overrides) {
  return {
    sampleId: 'run:case:0',
    sampleIndex: 0,
    caseId: 'refund-policy-001',
    requestHash: 'hash',
    execution: {
      id: 'result',
      adapterId: 'fake',
      status: 'completed',
      output: { text: 'answer' },
      timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.010Z', latencyMs: 10 },
    },
    evaluatorResults: [{ evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'pass', score: 1 }],
    status: 'pass',
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:00:00.010Z',
    ...overrides,
  };
}

const gate = {
  overall: { minimumScore: 0.5, minimumPassRate: 0.5 },
  evaluators: { 'exact-match': { minimumScore: 0.5, maximumScore: 1, minimumPassRate: 0.5 } },
  criticalCases: { minimumPassRate: 1 },
  security: { maximumCriticalViolations: 0, maximumHighViolations: 0 },
  performance: { p95LatencyMs: 10 },
  stability: { minimumPassRate: 0.5, maximumScoreStdDev: 0 },
  infrastructure: { maximumErrorRate: 0 },
};

test('boundary values pass and the same inputs produce the same decision', async () => {
  const samples = [
    sample({}),
    sample({
      sampleId: 'run:case:1',
      sampleIndex: 1,
      caseId: 'safety-001',
      evaluatorResults: [{ evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'pass', score: 1 }],
    }),
  ];
  const cases = [
    { id: 'refund-policy-001', tags: ['critical'] },
    { id: 'safety-001', tags: ['critical'] },
  ];
  const written = [];
  const first = await evaluateQualityGate({
    gate,
    samples,
    cases,
    evidence: { async write(artifact) { written.push(artifact); return 'quality-gate.json'; } },
  });
  const second = await evaluateQualityGate({ gate, samples: [...samples].reverse(), cases: [...cases].reverse() });

  assert.equal(first.decision.status, 'pass');
  assert.equal(first.decision.criticalSecurityFailure, false);
  assert.deepEqual(first.decision, second.decision);
  assert.equal(written[0].name, 'quality-gate');
  assert.equal(written[0].body.status, 'pass');
  assert.equal(first.evidence.ref, 'quality-gate.json');
});

test('a value on the failing side of a limit fails that check', async () => {
  const failed = sample({
    evaluatorResults: [
      { evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'fail', score: 0 },
      { evaluatorId: 'verbosity', evaluatorVersion: '1.0.0', status: 'fail', score: 1 },
      { evaluatorId: 'security', evaluatorVersion: '1.0.0', status: 'fail', severity: 'critical', score: 0 },
      { evaluatorId: 'disclosure', evaluatorVersion: '1.0.0', status: 'fail', severity: 'high', score: 0 },
    ],
    execution: {
      id: 'result',
      adapterId: 'fake',
      status: 'failed',
      output: {},
      timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.010Z', latencyMs: 10 },
    },
  });
  const errored = sample({
    sampleId: 'run:case:1',
    sampleIndex: 1,
    evaluatorResults: [{ evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'error', error: { code: 'EVALUATOR_ERROR', message: 'unavailable' } }],
  });
  const result = await evaluateQualityGate({
    gate: {
      overall: { minimumScore: 0.5, minimumPassRate: 0.5 },
      evaluators: {
        'exact-match': { minimumScore: 0.5, minimumPassRate: 1 },
        verbosity: { maximumScore: 0.5 },
      },
      criticalCases: { minimumPassRate: 1 },
      security: { maximumCriticalViolations: 0, maximumHighViolations: 0 },
      performance: { p95LatencyMs: 9 },
      stability: { minimumPassRate: 1, maximumScoreStdDev: 0 },
      infrastructure: { maximumErrorRate: 0 },
    },
    cases: [{ id: 'refund-policy-001', tags: ['critical'] }],
    samples: [failed, errored],
  });
  const status = Object.fromEntries(result.decision.checks.map((check) => [check.id, check.status]));

  assert.equal(result.decision.status, 'fail');
  assert.equal(status['overall.minimumScore'], 'fail');
  assert.equal(status['overall.minimumPassRate'], 'fail');
  assert.equal(status['evaluators.exact-match.minimumScore'], 'fail');
  assert.equal(status['evaluators.exact-match.minimumPassRate'], 'fail');
  assert.equal(status['evaluators.verbosity.maximumScore'], 'fail');
  assert.equal(status['criticalCases.minimumPassRate'], 'fail');
  assert.equal(status['security.maximumCriticalViolations'], 'fail');
  assert.equal(status['security.maximumHighViolations'], 'fail');
  assert.equal(status['performance.p95LatencyMs'], 'fail');
  assert.equal(status['stability.minimumPassRate'], 'fail');
  assert.equal(status['stability.maximumScoreStdDev'], 'fail');
  assert.equal(status['infrastructure.maximumErrorRate'], 'fail');
});

test('a critical security failure is not cancelled by a perfect average score', async () => {
  const result = await evaluateQualityGate({
    gate: {
      overall: { minimumScore: 0.5 },
      security: { maximumCriticalViolations: 0 },
    },
    samples: [
      sample({
        evaluatorResults: [
          { evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'pass', score: 1 },
          { evaluatorId: 'security', evaluatorVersion: '1.0.0', status: 'fail', severity: 'critical', score: 0 },
        ],
      }),
    ],
  });

  assert.equal(result.decision.checks.find((check) => check.id === 'overall.minimumScore').status, 'pass');
  assert.equal(result.decision.checks.find((check) => check.id === 'overall.minimumScore').actual, 0.5);
  assert.equal(result.decision.criticalSecurityFailure, true);
  assert.equal(result.decision.status, 'fail');
});

test('a missing score does not pass a minimum as zero', async () => {
  const result = await evaluateQualityGate({
    gate: { overall: { minimumScore: 0 } },
    samples: [sample({ evaluatorResults: [{ evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'pass' }] })],
  });

  assert.equal(result.decision.status, 'fail');
  assert.equal(result.decision.checks[0].actual, undefined);
  assert.equal(result.decision.checks[0].reason, 'overall score is unavailable');
});
