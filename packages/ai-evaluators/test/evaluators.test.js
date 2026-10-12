import assert from 'node:assert/strict';
import test from 'node:test';
import { registerDeterministicEvaluators } from '../dist/index.js';

function execution(overrides = {}) {
  return {
    id: 'result-1',
    adapterId: 'fake',
    status: 'completed',
    output: { text: 'The return window is 14 days.', structured: { allowed: false, days: 14 } },
    citations: [{ id: 'policy', uri: 'https://help.example/returns', title: 'Returns' }],
    toolCalls: [{ id: 'call-1', name: 'lookupPolicy', arguments: { sku: 'A1' }, status: 'completed' }],
    timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.020Z', latencyMs: 20 },
    ...overrides,
  };
}

function context(result, config, adapters) {
  return {
    run: { runId: 'run-1', suiteId: 'suite-1', startedAt: '2026-01-01T00:00:00.000Z' },
    evaluationCase: { id: 'case-1', name: 'case', target: { adapter: 'fake' }, input: { messages: [] }, evaluators: [] },
    sample: {
      sampleId: 'sample-1',
      sampleIndex: 0,
      caseId: 'case-1',
      requestHash: 'hash',
      execution: result,
      evaluatorResults: [],
      status: 'review',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:00:00.020Z',
    },
    result,
    config,
    adapters,
    evidence: { async write() { return 'artifact'; } },
  };
}

test('deterministic evaluators score a fake response without resolving a judge', async () => {
  const registry = registerDeterministicEvaluators();
  let judgeLookups = 0;
  const adapters = {
    register() {},
    has() { return false; },
    get() {
      judgeLookups += 1;
      throw new Error('judge lookup');
    },
    list() { return []; },
  };
  const result = execution();
  const cases = [
    ['exact-match', { expected: 'The return window is 14 days.' }, 'pass'],
    ['contains', { text: '14 days' }, 'pass'],
    ['not-contains', { text: 'lifetime warranty' }, 'pass'],
    ['regex', { pattern: 'window is \\d+ days' }, 'pass'],
    ['json-schema', { schema: { type: 'object', required: ['allowed'], properties: { allowed: { type: 'boolean' } } } }, 'pass'],
    ['json-path', { path: '$.days', equals: 14 }, 'pass'],
    ['required-keywords', { keywords: ['return', '14 days'] }, 'pass'],
    ['forbidden-keywords', { keywords: ['password'] }, 'pass'],
    ['citation-presence', { required: ['policy'] }, 'pass'],
    ['allowed-citation-domain', { domains: ['help.example'] }, 'pass'],
    ['tool-called', { name: 'lookupPolicy' }, 'pass'],
    ['tool-not-called', { name: 'deleteAccount' }, 'pass'],
    ['tool-arguments', { name: 'lookupPolicy', arguments: { sku: 'A1' } }, 'pass'],
    ['refusal-detection', { expectRefusal: false }, 'pass'],
    ['latency', { maxLatencyMs: 50 }, 'pass'],
  ];

  for (const [id, config, status] of cases) {
    const evaluator = registry.resolve({ id, type: 'deterministic' });
    const scored = await evaluator.evaluate(context(result, config, adapters));
    assert.equal(scored.status, status, id);
    assert.equal(scored.evaluatorId, id);
    assert.equal(scored.evaluatorVersion, '1.0.0');
    assert.equal(typeof scored.score, 'number');
  }

  const mismatch = await registry.get('exact-match').evaluate(context(result, { expected: '30 days' }, adapters));
  assert.equal(mismatch.status, 'fail');
  assert.equal(mismatch.score, 0);
  assert.equal(judgeLookups, 0);
  assert.equal(registry.list().every((item) => item.kind === 'deterministic'), true);
});
