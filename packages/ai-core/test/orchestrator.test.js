import assert from 'node:assert/strict';
import test from 'node:test';
import { createAdapterRegistry, runEvaluation } from '../dist/index.js';
import { FakeAIAdapter } from '../dist/testing/index.js';

function recordingAdapter(requests) {
  return {
    id: 'fake',
    name: 'recording',
    version: '0.0.0',
    async capabilities() {
      return { text: true, images: false, streaming: false, structuredOutput: true, toolCalling: false, multiTurn: true, usage: false, contentSafetyMetadata: false, seed: false };
    },
    async healthCheck() {
      return { status: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' };
    },
    async execute(request) {
      requests.push(request);
      return {
        id: 'recorded',
        adapterId: 'fake',
        status: 'completed',
        output: { text: 'hello' },
        timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.000Z', latencyMs: 1 },
      };
    },
  };
}

function suite(overrides = {}) {
  return {
    id: 'support-release',
    name: 'Support release',
    version: '1.0.0',
    cases: [
      {
        id: 'refund-policy-001',
        name: 'Refund policy',
        target: { adapter: 'fake', profile: 'target' },
        input: { messages: [{ role: 'user', content: 'Can I return an item after 20 days?' }] },
        evaluators: [{ id: 'exact-match', type: 'deterministic' }],
        execution: { samples: 1, timeoutMs: 1000, retry: { maxInfrastructureRetries: 2, initialDelayMs: 0, jitter: false } },
        ...overrides,
      },
    ],
    qualityGate: {},
  };
}

test('a fake adapter executes one case and one sample', async () => {
  const adapter = new FakeAIAdapter();
  adapter.useScript({ kind: 'success', text: 'The return window is 14 days.' });
  const registry = createAdapterRegistry();
  registry.register(adapter);

  const run = await runEvaluation({ registry, suite: suite(), sleep: async () => {} });

  assert.equal(run.health[0].health.status, 'healthy');
  assert.equal(run.samples.length, 1);
  assert.equal(run.samples[0].attempts.length, 1);
  assert.equal(run.samples[0].sample.execution.output.text, 'The return window is 14 days.');
  assert.equal(run.samples[0].sample.status, 'review');
  assert.match(run.run.runId, /^[0-9a-f]{28}$/);
});

test('samples stay separate and a completed answer is not retried', async () => {
  const adapter = new FakeAIAdapter();
  adapter.useScript({ kind: 'success', text: 'wrong answer' });
  adapter.useScript({ kind: 'success', text: 'another answer' });
  const registry = createAdapterRegistry();
  registry.register(adapter);

  const run = await runEvaluation({
    registry,
    suite: suite({ execution: { samples: 2, retry: { maxInfrastructureRetries: 2, initialDelayMs: 0, jitter: false } } }),
    sleep: async () => {},
  });

  assert.equal(run.samples.length, 2);
  assert.equal(run.samples[0].sample.sampleIndex, 0);
  assert.equal(run.samples[1].sample.sampleIndex, 1);
  assert.notEqual(run.samples[0].sample.sampleId, run.samples[1].sample.sampleId);
  assert.equal(run.samples[0].attempts.length, 1);
  assert.equal(run.samples[1].attempts.length, 1);
  assert.equal(run.samples[0].sample.execution.output.text, 'wrong answer');
  assert.equal(run.samples[1].sample.execution.output.text, 'another answer');
});

test('infrastructure failures are retried and recorded, behavioural provider errors are not', async () => {
  const adapter = new FakeAIAdapter();
  adapter.useScript({ kind: 'rate-limit' });
  adapter.useScript({ kind: 'success', text: 'recovered' });
  const registry = createAdapterRegistry();
  registry.register(adapter);

  const retried = await runEvaluation({ registry, suite: suite(), sleep: async () => {} });
  assert.equal(retried.samples[0].attempts.length, 2);
  assert.equal(retried.samples[0].attempts[0].retried, true);
  assert.equal(retried.samples[0].attempts[0].result.error.code, 'RATE_LIMIT_ERROR');
  assert.equal(retried.samples[0].attempts[1].retried, false);
  assert.equal(retried.samples[0].sample.execution.output.text, 'recovered');
  assert.equal(retried.samples[0].evidence.length, 1);

  const failing = new FakeAIAdapter();
  failing.useScript({ kind: 'provider-failure', providerCode: 'simulated-500' });
  const failingRegistry = createAdapterRegistry();
  failingRegistry.register(failing);
  const once = await runEvaluation({ registry: failingRegistry, suite: suite(), sleep: async () => {} });
  assert.equal(once.samples[0].attempts.length, 1);
  assert.equal(once.samples[0].sample.status, 'error');
});

test('an aborted run and a hung adapter are bounded by timeout', async () => {
  const adapter = new FakeAIAdapter();
  adapter.useScript({ kind: 'success', text: 'should not run' });
  const registry = createAdapterRegistry();
  registry.register(adapter);
  const controller = new AbortController();
  controller.abort();

  const aborted = await runEvaluation({ registry, suite: suite(), signal: controller.signal, sleep: async () => {} });
  assert.equal(aborted.samples.length, 0);

  const hanging = {
    id: 'fake',
    name: 'hanging',
    version: '0.0.0',
    async capabilities() {
      return {
        text: true,
        images: false,
        streaming: false,
        structuredOutput: false,
        toolCalling: false,
        multiTurn: false,
        usage: false,
        contentSafetyMetadata: false,
        seed: false,
      };
    },
    async healthCheck() {
      return { status: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' };
    },
    execute() {
      return new Promise(() => {});
    },
  };
  const hangRegistry = createAdapterRegistry();
  hangRegistry.register(hanging);
  const timed = await runEvaluation({
    registry: hangRegistry,
    suite: suite({ execution: { timeoutMs: 30, retry: { maxInfrastructureRetries: 0, initialDelayMs: 0, jitter: false } } }),
    sleep: async () => {},
  });
  assert.equal(timed.samples[0].sample.execution.error.code, 'TIMEOUT_ERROR');
  assert.equal(timed.samples[0].sample.execution.error.retryable, true);
  assert.equal(timed.samples[0].attempts.length, 1);
});

test('concurrency limits overlapping sample execution', async () => {
  let active = 0;
  let maxActive = 0;
  const adapter = {
    id: 'fake',
    name: 'pool',
    version: '0.0.0',
    async capabilities() {
      return {
        text: true,
        images: false,
        streaming: false,
        structuredOutput: false,
        toolCalling: false,
        multiTurn: false,
        usage: false,
        contentSafetyMetadata: false,
        seed: false,
      };
    },
    async healthCheck() {
      return { status: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' };
    },
    async execute() {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 20));
      active -= 1;
      return {
        id: 'ok',
        adapterId: 'fake',
        status: 'completed',
        output: { text: 'ok' },
        timing: {
          startedAt: '2026-01-01T00:00:00.000Z',
          completedAt: '2026-01-01T00:00:00.020Z',
          latencyMs: 20,
        },
      };
    },
  };
  const registry = createAdapterRegistry();
  registry.register(adapter);

  await runEvaluation({
    registry,
    suite: suite({
      execution: {
        samples: 2,
        concurrency: 1,
        timeoutMs: 1000,
        retry: { maxInfrastructureRetries: 0, initialDelayMs: 0, jitter: false },
      },
    }),
    sleep: async () => {},
  });

  assert.equal(maxActive, 1);
});

test('a conversation carries each assistant reply into the next turn', async () => {
  const adapter = new FakeAIAdapter();
  adapter.useScript({ kind: 'success', text: 'hello' });
  adapter.useScript({ kind: 'success', text: 'goodbye' });
  const registry = createAdapterRegistry();
  registry.register(adapter);

  const run = await runEvaluation({
    registry,
    suite: suite({
      conversation: {
        turns: [
          { id: 'greeting', messages: [{ role: 'user', content: 'Say hello.' }] },
          { id: 'farewell', messages: [{ role: 'user', content: 'Say goodbye.' }] },
        ],
      },
    }),
    sleep: async () => {},
  });

  const sample = run.samples[0].sample;
  assert.equal(sample.turns.length, 2);
  assert.equal(sample.turns[0].execution.output.text, 'hello');
  assert.equal(sample.turns[1].messages.map((message) => message.content).join('|'), 'Say hello.|hello|Say goodbye.');
  assert.equal(sample.execution.output.text, 'hello\ngoodbye');
  assert.deepEqual(run.samples[0].evidence.map((artifact) => artifact.name), ['turn-greeting', 'turn-farewell']);
});

test('a declared schema is requested as JSON on one turn and on every conversation turn', async () => {
  const schema = { type: 'object', properties: { allowed: { type: 'boolean' } } };
  const requests = [];
  const registry = createAdapterRegistry();
  registry.register(recordingAdapter(requests));

  await runEvaluation({
    registry,
    suite: suite({ expectations: { expectedSchema: schema } }),
    sleep: async () => {},
  });
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0].responseFormat, { type: 'json', schema });

  requests.length = 0;
  await runEvaluation({
    registry,
    suite: suite({
      expectations: { expectedSchema: schema },
      conversation: {
        turns: [
          { id: 'greeting', messages: [{ role: 'user', content: 'Say hello.' }] },
          { id: 'farewell', messages: [{ role: 'user', content: 'Say goodbye.' }] },
        ],
      },
    }),
    sleep: async () => {},
  });
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[0].responseFormat, { type: 'json', schema });
  assert.deepEqual(requests[1].responseFormat, { type: 'json', schema });
});

test('an explicit JSON flag requests JSON output without a schema', async () => {
  const requests = [];
  const registry = createAdapterRegistry();
  registry.register(recordingAdapter(requests));
  await runEvaluation({
    registry,
    suite: suite({ metadata: { json: true } }),
    sleep: async () => {},
  });
  assert.deepEqual(requests[0].responseFormat, { type: 'json' });
});

test('a model-requested tool is recorded and is not executed', async () => {
  const adapter = new FakeAIAdapter();
  adapter.useScript({
    kind: 'success',
    text: 'I need a tool.',
    toolCalls: [{ id: 'call-1', name: 'deleteAccount', arguments: { id: 'user' }, status: 'requested' }],
  });
  const registry = createAdapterRegistry();
  registry.register(adapter);

  const run = await runEvaluation({ registry, suite: suite(), sleep: async () => {} });
  const call = run.samples[0].sample.execution.toolCalls?.[0];

  assert.equal(run.samples[0].attempts.length, 1);
  assert.equal(call?.name, 'deleteAccount');
  assert.equal(call?.status, 'requested');
  assert.equal(call?.result, undefined);
});

test('a case handler records the tool result and a thrown handler is a failed call', async () => {
  const requests = [];
  const registry = createAdapterRegistry();
  registry.register({
    id: 'fake',
    name: 'recording',
    version: '0.0.0',
    async capabilities() {
      return { text: true, images: false, streaming: false, structuredOutput: true, toolCalling: true, multiTurn: true, usage: false, contentSafetyMetadata: false, seed: false };
    },
    async healthCheck() {
      return { status: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' };
    },
    async execute(request) {
      requests.push(request);
      return {
        id: 'recorded',
        adapterId: 'fake',
        status: 'completed',
        output: { text: '' },
        toolCalls: [
          { id: 'call-1', name: 'lookupTicket', arguments: { ticketId: 'KL-1008' }, status: 'requested' },
          { id: 'call-2', name: 'brokenTool', arguments: {}, status: 'requested' },
        ],
        timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.000Z', latencyMs: 1 },
      };
    },
  });

  const run = await runEvaluation({
    registry,
    suite: suite({
      metadata: {
        tools: [
          { name: 'lookupTicket', type: 'function', execute: (args) => ({ ticketId: args.ticketId, status: 'open' }) },
          { name: 'web_search', type: 'web_search' },
          { name: 'brokenTool', execute: () => { throw new Error('tool failed'); } },
        ],
      },
    }),
    sleep: async () => {},
  });
  const calls = run.samples[0].sample.execution.toolCalls;

  assert.deepEqual(requests[0].tools.map((tool) => tool.name), ['lookupTicket', 'web_search', 'brokenTool']);
  assert.equal(requests[0].tools[0].execute, undefined);
  assert.equal(requests[0].tools[1].type, 'web_search');
  assert.equal(calls[0].status, 'completed');
  assert.deepEqual(calls[0].result, { ticketId: 'KL-1008', status: 'open' });
  assert.equal(calls[1].status, 'failed');
  assert.equal(calls[1].result, undefined);
});

test('one hundred samples finish locally without a provider call', async () => {
  const adapter = new FakeAIAdapter();
  const registry = createAdapterRegistry();
  registry.register(adapter);
  const started = Date.now();
  const run = await runEvaluation({
    registry,
    suite: suite({
      execution: { samples: 100, concurrency: 10, timeoutMs: 1000, retry: { maxInfrastructureRetries: 0, initialDelayMs: 0, jitter: false } },
    }),
    sleep: async () => {},
  });

  assert.equal(run.samples.length, 100);
  assert.equal(run.samples.every((record) => record.attempts.length === 1 && record.sample.status === 'review'), true);
  assert.equal(Date.now() - started < 2000, true);
});
