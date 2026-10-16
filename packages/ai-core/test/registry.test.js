import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createAdapterRegistry,
  DEFAULT_EXECUTION_POLICY,
  validateAdapterCapabilities,
  AIEvaluationError,
} from '../dist/index.js';

const textOnlyCapabilities = {
  text: true,
  images: false,
  streaming: false,
  structuredOutput: false,
  toolCalling: false,
  multiTurn: true,
  usage: true,
  contentSafetyMetadata: false,
  seed: false,
};

function fakeAdapter(id = 'fake') {
  return {
    id,
    name: 'Fake adapter',
    version: '0.0.0',
    async capabilities() {
      return textOnlyCapabilities;
    },
    async healthCheck() {
      return { status: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' };
    },
    async execute(request) {
      return {
        id: 'result-1',
        adapterId: id,
        status: 'completed',
        output: { text: 'ok', messages: request.messages },
        timing: {
          startedAt: '2026-01-01T00:00:00.000Z',
          completedAt: '2026-01-01T00:00:00.010Z',
          latencyMs: 10,
        },
      };
    },
  };
}

test('execution policy defaults match the technical specification', () => {
  assert.deepEqual(DEFAULT_EXECUTION_POLICY, {
    samples: 1,
    concurrency: 1,
    timeoutMs: 30000,
    retry: {
      maxInfrastructureRetries: 2,
      initialDelayMs: 500,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      jitter: true,
    },
    failFast: false,
  });
});

test('registry rejects a duplicate adapter id', () => {
  const registry = createAdapterRegistry();
  registry.register(fakeAdapter());
  assert.throws(() => registry.register(fakeAdapter()), (error) => {
    assert.ok(error instanceof AIEvaluationError);
    assert.equal(error.code, 'CONFIG_ERROR');
    return true;
  });
});

test('registry lookup of an unknown adapter fails without using a global singleton', () => {
  const first = createAdapterRegistry();
  const second = createAdapterRegistry();
  first.register(fakeAdapter('one'));

  assert.equal(second.has('one'), false);
  assert.throws(() => second.get('one'), (error) => {
    assert.ok(error instanceof AIEvaluationError);
    assert.equal(error.code, 'ADAPTER_NOT_FOUND');
    return true;
  });
  assert.deepEqual(first.list(), [{ id: 'one', name: 'Fake adapter', version: '0.0.0' }]);
});

test('capability validation rejects an incomplete declaration', () => {
  assert.throws(
    () => validateAdapterCapabilities({ text: true }),
    (error) => error instanceof AIEvaluationError && error.code === 'ADAPTER_CAPABILITY_ERROR',
  );
});

test('requireCapability fails before execution when the adapter cannot do the work', async () => {
  const registry = createAdapterRegistry();
  registry.register(fakeAdapter());
  await assert.rejects(registry.requireCapability('fake', 'images'), (error) => {
    assert.ok(error instanceof AIEvaluationError);
    assert.equal(error.code, 'ADAPTER_CAPABILITY_ERROR');
    return true;
  });
  await assert.doesNotReject(registry.requireCapability('fake', 'text'));
});

test('a registered adapter returns a normalised execution result', async () => {
  const registry = createAdapterRegistry();
  registry.register(fakeAdapter());
  const result = await registry.get('fake').execute(
    { messages: [{ role: 'user', content: 'hello' }] },
    {
      runId: 'run',
      suiteId: 'suite',
      caseId: 'case',
      sampleId: 'sample',
      startedAt: '2026-01-01T00:00:00.000Z',
      evidence: { async write() { return 'artifact'; } },
      logger: { debug() {}, info() {}, warn() {}, error() {} },
    },
  );

  assert.equal(result.status, 'completed');
  assert.equal(result.output.text, 'ok');
  assert.equal(result.adapterId, 'fake');
  assert.equal(result.native, undefined);
});
