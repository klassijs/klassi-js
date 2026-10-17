import assert from 'node:assert/strict';
import test from 'node:test';
import { aggregateSuite, PERCENTILE_ALGORITHM, percentile, summarizeNumbers } from '../dist/index.js';

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
    evaluatorResults: [],
    status: 'review',
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:00:00.010Z',
    ...overrides,
  };
}

test('percentiles use Hyndman-Fan type 7 and stay deterministic', () => {
  assert.equal(PERCENTILE_ALGORITHM, 'hyndman-fan-type-7');
  const values = [40, 10, 30, 20];
  assert.equal(percentile(values, 0.5), 25);
  assert.equal(percentile(values, 0.9), 37);
  assert.equal(percentile(values, 0.95), 38.5);
  assert.ok(Math.abs(percentile(values, 0.99) - 39.7) < 1e-10);
  assert.equal(percentile([], 0.95), undefined);
  assert.deepEqual(values, [40, 10, 30, 20]);
});

test('missing scores stay missing', () => {
  const summary = summarizeNumbers([1, undefined, null, Number.NaN]);

  assert.equal(summary.count, 1);
  assert.equal(summary.mean, 1);
  assert.equal(summary.min, 1);
  assert.equal(summary.max, 1);
  assert.equal(summary.standardDeviation, 0);
  assert.deepEqual(summarizeNumbers([undefined, null]), { count: 0 });
});

test('repeated samples aggregate to the same case and suite figures in either order', () => {
  const first = sample({
    sampleId: 'run:case:0',
    sampleIndex: 0,
    evaluatorResults: [
      { evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'pass', score: 1 },
      { evaluatorId: 'latency', evaluatorVersion: '1.0.0', status: 'pass' },
    ],
    execution: {
      id: 'a',
      adapterId: 'fake',
      status: 'completed',
      output: {},
      timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.010Z', latencyMs: 10 },
    },
  });
  const second = sample({
    sampleId: 'run:case:1',
    sampleIndex: 1,
    status: 'fail',
    evaluatorResults: [{ evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'fail', score: 0 }],
    execution: {
      id: 'b',
      adapterId: 'fake',
      status: 'completed',
      output: {},
      timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.040Z', latencyMs: 40 },
    },
  });
  const errored = sample({
    sampleId: 'run:other:0',
    sampleIndex: 0,
    caseId: 'other',
    evaluatorResults: [{ evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'error', error: { code: 'EVALUATOR_ERROR', message: 'unavailable' } }],
    execution: {
      id: 'c',
      adapterId: 'fake',
      status: 'failed',
      output: {},
      timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.005Z', latencyMs: 5 },
    },
  });

  const forward = aggregateSuite([first, second, errored]);
  const reversed = aggregateSuite([errored, second, first]);

  assert.deepEqual(forward, reversed);
  const refund = forward.cases.find((item) => item.caseId === 'refund-policy-001');
  const other = forward.cases.find((item) => item.caseId === 'other');
  assert.equal(refund.samples[0].status, 'pass');
  assert.equal(refund.samples[0].scores.count, 1);
  assert.equal(refund.samples[0].scores.mean, 1);
  assert.equal(refund.counts.passCount, 1);
  assert.equal(refund.counts.failCount, 1);
  assert.equal(refund.counts.passRate, 0.5);
  assert.equal(refund.scores.mean, 0.5);
  assert.equal(refund.latency.min, 10);
  assert.equal(refund.latency.max, 40);
  assert.equal(forward.counts.passCount, 1);
  assert.equal(forward.counts.failCount, 1);
  assert.equal(forward.counts.errorCount, 1);
  assert.equal(forward.counts.reviewCount, 0);
  assert.equal(forward.counts.passRate, 0.5);
  assert.equal(other.counts.passRate, undefined);
  assert.equal(other.scores.count, 0);
  assert.equal(other.samples[0].status, 'error');
});
