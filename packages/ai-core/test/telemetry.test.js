import assert from 'node:assert/strict';
import test from 'node:test';
import { createAdapterRegistry, createTelemetryCollector, openTelemetrySink, runEvaluation, sanitizeTelemetry } from '../dist/index.js';
import { FakeAIAdapter } from '../dist/testing/index.js';

test('lifecycle telemetry keeps correlation ids and drops prompt text', async () => {
  const adapter = new FakeAIAdapter();
  adapter.useScript({ kind: 'success', text: 'hello' });
  const registry = createAdapterRegistry();
  registry.register(adapter);
  const collected = createTelemetryCollector();
  const attributes = [];
  const tracer = openTelemetrySink({
    startSpan(name) {
      const span = { name, values: {} };
      attributes.push(span);
      return {
        setAttribute(key, value) { span.values[key] = value; },
        end() {},
      };
    },
  });
  const telemetry = { emit(event) { collected.sink.emit(event); tracer.emit(event); } };

  await runEvaluation({
    registry,
    telemetry,
    sleep: async () => {},
    suite: {
      id: 'support-release',
      name: 'Support release',
      version: '1.0.0',
      qualityGate: {},
      cases: [{
        id: 'greeting-001',
        name: 'Greeting',
        target: { adapter: 'fake' },
        input: { messages: [{ role: 'user', content: 'Say hello' }] },
        evaluators: [{ id: 'exact-match', type: 'deterministic' }],
      }],
    },
  });

  const names = collected.events.map((event) => event.name);
  assert.deepEqual(names, ['run.started', 'case.started', 'sample.started', 'adapter.call', 'sample.completed', 'case.completed', 'run.completed']);
  assert.equal(collected.events.every((event) => event.runId === collected.events[0].runId), true);
  assert.equal(collected.events[2].caseId, 'greeting-001');
  assert.equal(collected.events[2].sampleId, collected.events[3].sampleId);
  assert.equal(collected.events[3].adapterId, 'fake');
  assert.equal(JSON.stringify(collected.events).includes('Say hello'), false);
  assert.equal(JSON.stringify(attributes).includes('Say hello'), false);
  assert.equal(attributes[3].values['adapter.id'], 'fake');

  const stripped = sanitizeTelemetry({ name: 'adapter.call', runId: 'run-1', suiteId: 'suite-1', messages: 'Say hello', output: 'hello' });
  assert.equal(stripped.messages, undefined);
  assert.equal(stripped.output, undefined);
});
