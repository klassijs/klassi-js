import assert from 'node:assert/strict';
import test from 'node:test';
import { compareBaselines, createBaseline } from '../dist/index.js';

function sample(caseId, status, score, latencyMs = 10) {
  return {
    sampleId: `run:${caseId}:0`,
    sampleIndex: 0,
    caseId,
    requestHash: 'hash',
    execution: {
      id: caseId,
      adapterId: 'fake',
      status: 'completed',
      output: { text: 'answer' },
      timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.010Z', latencyMs },
    },
    evaluatorResults: [{ evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status, ...(score === undefined ? {} : { score }) }],
    status,
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:00:00.010Z',
  };
}

function baseline(samples, overrides = {}) {
  return createBaseline({
    id: 'baseline-1',
    name: 'Example',
    createdAt: '2026-01-01T00:00:00.000Z',
    suiteId: 'example',
    suiteVersion: '1.0.0',
    datasetHash: 'a'.repeat(64),
    sourceRunId: 'run-1',
    samples,
    ...overrides,
  });
}

test('a baseline keeps the source run, suite version, dataset hash, and case results', () => {
  const saved = baseline([sample('greeting-001', 'pass', 1)]);

  assert.equal(saved.sourceRunId, 'run-1');
  assert.equal(saved.suiteId, 'example');
  assert.equal(saved.suiteVersion, '1.0.0');
  assert.equal(saved.datasetHash, 'a'.repeat(64));
  assert.equal(saved.caseResults['greeting-001'].status, 'pass');
  assert.equal(saved.caseResults['greeting-001'].score, 1);
  assert.equal(saved.metrics.passRate, 1);
  assert.equal(saved.metrics.meanScore, 1);
});

test('comparison reports regression, improvement, new and removed cases, and refuses a different dataset', () => {
  const saved = baseline([sample('greeting-001', 'pass', 1), sample('removed-001', 'pass', 1)]);
  const current = baseline([sample('greeting-001', 'fail', 0.8), sample('added-001', 'pass', 1)], { sourceRunId: 'run-2' });
  const comparison = compareBaselines(saved, current, { scoreDelta: 0.05, passRateDelta: 0.05, latencyMsDelta: 1000 });

  assert.equal(comparison.verdict, 'regression');
  assert.equal(comparison.cases.find((item) => item.caseId === 'greeting-001').verdict, 'regression');
  assert.equal(comparison.cases.find((item) => item.caseId === 'added-001').verdict, 'new case');
  assert.equal(comparison.cases.find((item) => item.caseId === 'removed-001').verdict, 'removed case');

  const recovered = compareBaselines(
    baseline([sample('greeting-001', 'fail', 0.4)]),
    baseline([sample('greeting-001', 'pass', 1)], { sourceRunId: 'run-2' }),
    { scoreDelta: 0.05, passRateDelta: 0.05, latencyMsDelta: 1000 },
  );
  assert.equal(recovered.verdict, 'improvement');

  const changedDataset = compareBaselines(saved, baseline([sample('greeting-001', 'fail', 0)], { datasetHash: 'b'.repeat(64) }));
  assert.equal(changedDataset.comparable, false);
  assert.equal(changedDataset.verdict, 'not comparable');
  assert.equal(changedDataset.cases.length, 0);
});

test('a missing score is not treated as zero', () => {
  const saved = baseline([sample('greeting-001', 'pass', undefined)]);
  const current = baseline([sample('greeting-001', 'pass', 0)], { sourceRunId: 'run-2' });
  const comparison = compareBaselines(saved, current);

  assert.equal(saved.caseResults['greeting-001'].score, undefined);
  assert.equal(saved.metrics.meanScore, undefined);
  assert.equal(comparison.cases[0].verdict, 'not comparable');
  assert.equal(comparison.verdict, 'not comparable');
});
