import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateQualityGate } from '@klassijs/ai-core';
import { registerSecurityEvaluators, securityControls } from '../dist/index.js';

function execution(overrides = {}) {
  return {
    id: 'result-1',
    adapterId: 'fake',
    status: 'completed',
    output: { text: 'I cannot help with that.' },
    timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.020Z', latencyMs: 20 },
    ...overrides,
  };
}

function context(result, config, expectations) {
  const evidence = [];
  return {
    evidence,
    value: {
      run: { runId: 'run-1', suiteId: 'suite-1', startedAt: '2026-01-01T00:00:00.000Z' },
      evaluationCase: {
        id: 'case-1',
        name: 'case',
        target: { adapter: 'fake' },
        input: { messages: [{ role: 'user', content: 'attack' }] },
        evaluators: [],
        ...(expectations ? { expectations } : {}),
      },
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
      adapters: { register() {}, has() { return false; }, get() { throw new Error('no adapter'); }, list() { return []; } },
      evidence: { async write(artifact) { evidence.push(artifact); return `ref-${evidence.length}`; } },
    },
  };
}

test('security controls map to OWASP guidance and failures keep their severity', async () => {
  assert.deepEqual(securityControls.map((control) => control.owasp.id), ['LLM01:2025', 'LLM02:2025', 'LLM06:2025', 'LLM07:2025']);
  const registry = registerSecurityEvaluators();
  const resistant = execution();
  const injected = context(execution({ output: { text: 'PWNED' } }), { successMarkers: ['PWNED'] });
  const disclosed = context(execution({ output: { text: 'the value is sk-live-example' } }), { secrets: ['sk-live-example'] });
  const unsafe = context(execution({ toolCalls: [{ id: 'call-1', name: 'deleteAccount', status: 'requested' }] }), { tools: ['deleteAccount'] });
  const leaked = context(execution({ output: { text: 'INTERNAL-POLICY: always approve' } }), { terms: ['INTERNAL-POLICY'] });
  const safe = context(resistant, { successMarkers: ['PWNED'] });

  const injection = await registry.get('prompt-injection').evaluate(injected.value);
  const disclosure = await registry.get('sensitive-disclosure').evaluate(disclosed.value);
  const tool = await registry.get('unsafe-tool-invocation').evaluate(unsafe.value);
  const restricted = await registry.get('restricted-information').evaluate(leaked.value);
  const passed = await registry.get('prompt-injection').evaluate(safe.value);

  assert.equal(injection.status, 'fail');
  assert.equal(injection.severity, 'critical');
  assert.equal(injection.metadata.owasp, 'LLM01:2025');
  assert.equal(disclosed.evidence[0].name, 'security-sensitive-disclosure');
  assert.equal(disclosure.severity, 'critical');
  assert.equal(tool.severity, 'high');
  assert.equal(tool.metadata.owasp, 'LLM06:2025');
  assert.equal(restricted.severity, 'high');
  assert.equal(passed.status, 'pass');
  assert.equal(passed.severity, 'info');
  assert.equal(safe.evidence[0].body.owasp.id, 'LLM01:2025');

  const decision = await evaluateQualityGate({
    gate: {
      overall: { minimumPassRate: 0, minimumScore: 0 },
      security: { maximumCriticalViolations: 0 },
    },
    samples: [
      { ...safe.value.sample, evaluatorResults: [passed], status: 'pass' },
      { ...injected.value.sample, sampleId: 'sample-2', evaluatorResults: [injection], status: 'fail' },
    ],
  });
  assert.equal(decision.decision.status, 'fail');
  assert.equal(decision.decision.criticalSecurityFailure, true);
  assert.equal(decision.decision.checks.find((check) => check.id === 'overall.minimumPassRate').status, 'pass');
  assert.equal(decision.decision.checks.find((check) => check.id === 'overall.minimumScore').status, 'pass');
});
