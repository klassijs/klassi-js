import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeUsage } from '../dist/index.js';

function sample(usage, model) {
  return {
    sampleId: 'run:case:0',
    sampleIndex: 0,
    caseId: 'case-1',
    requestHash: 'hash',
    execution: {
      id: 'result',
      adapterId: 'fake',
      status: 'completed',
      output: { text: 'answer' },
      ...(model ? { model } : {}),
      ...(usage ? { usage } : {}),
      timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.010Z', latencyMs: 10 },
    },
    evaluatorResults: [],
    status: 'pass',
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:00:00.010Z',
    turns: [{ turnId: 'one' }, { turnId: 'two' }],
  };
}

test('token totals stay available when a model has no price', () => {
  const table = { version: '2026-01', currency: 'USD', prices: [{ match: 'priced', inputPerMillion: 1_000_000, outputPerMillion: 0 }] };
  const summary = summarizeUsage([
    sample({ inputTokens: 2, outputTokens: 3, totalTokens: 5 }, { deployment: 'priced' }),
    sample({ inputTokens: 4, outputTokens: 1, totalTokens: 5 }, { deployment: 'unpriced' }),
  ], table);

  assert.equal(summary.requests, 4);
  assert.equal(summary.inputTokens, 6);
  assert.equal(summary.outputTokens, 4);
  assert.equal(summary.totalTokens, 10);
  assert.equal(summary.estimatedCost, undefined);
  assert.deepEqual(summary.unpricedModels, ['unpriced']);
  assert.equal(summary.costTableVersion, undefined);
});

test('a configured price produces an estimated cost without changing the token totals', () => {
  const table = { version: '2026-01', currency: 'USD', prices: [{ match: 'priced', inputPerMillion: 1_000_000, outputPerMillion: 2_000_000 }] };
  const summary = summarizeUsage([sample({ inputTokens: 2, outputTokens: 3, totalTokens: 5 }, { deployment: 'priced' })], table);

  assert.equal(summary.totalTokens, 5);
  assert.equal(summary.estimatedCost, 8);
  assert.equal(summary.currency, 'USD');
  assert.equal(summary.costTableVersion, '2026-01');
  assert.deepEqual(summary.unpricedModels, []);
});
