import assert from 'node:assert/strict';
import test from 'node:test';
import { createAdapterRegistry } from '@klassijs/ai-core';
import { FakeAIAdapter } from '@klassijs/ai-core/testing';
import { getJudgePrompt, registerModelEvaluators } from '../dist/index.js';

function execution(text) {
  return {
    id: 'result-1',
    adapterId: 'target',
    status: 'completed',
    output: { text },
    timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.020Z', latencyMs: 20 },
    model: { requested: 'target-model' },
    usage: { totalTokens: 4 },
  };
}

function evaluationCase(judgeAdapter) {
  return {
    id: 'case-1',
    name: 'case',
    target: { adapter: 'target' },
    input: { messages: [{ role: 'user', content: 'Can I return this?' }] },
    evaluators: [{ id: 'groundedness', type: 'model', threshold: 0.9, judge: { adapter: judgeAdapter, profile: 'primary' } }],
  };
}

test('a model evaluator resolves a separate judge adapter and validates its score', async () => {
  const target = new FakeAIAdapter({ id: 'target' });
  const judge = new FakeAIAdapter({ id: 'judge' });
  judge.useScript({ kind: 'success', text: '{"score":0.96,"reason":"supported by the source"}', latencyMs: 12, usage: { totalTokens: 8 } });
  const adapters = createAdapterRegistry();
  adapters.register(target);
  adapters.register(judge);
  const evidence = [];
  const scored = await registerModelEvaluators().resolve({ id: 'groundedness', type: 'model' }).evaluate({
    run: { runId: 'run-1', suiteId: 'suite-1', startedAt: '2026-01-01T00:00:00.000Z' },
    evaluationCase: evaluationCase('judge'),
    sample: {
      sampleId: 'sample-1',
      sampleIndex: 0,
      caseId: 'case-1',
      requestHash: 'hash',
      execution: execution('The return window is 14 days.'),
      evaluatorResults: [],
      status: 'review',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:00:00.020Z',
    },
    result: execution('The return window is 14 days.'),
    config: {},
    adapters,
    evidence: { async write(artifact) { evidence.push(artifact); return artifact.name; } },
  });

  assert.equal(scored.status, 'pass');
  assert.equal(scored.score, 0.96);
  assert.equal(scored.metadata.judgeAdapterId, 'judge');
  assert.equal(scored.metadata.judgeAdapterVersion, judge.version);
  assert.equal(scored.metadata.judgeProfile, 'primary');
  assert.equal(scored.metadata.promptId, 'groundedness');
  assert.equal(scored.metadata.promptVersion, getJudgePrompt('groundedness').version);
  assert.equal(scored.metadata.latencyMs, 12);
  assert.equal(scored.metadata.usage.totalTokens, 8);
  assert.equal(evidence[0].name, 'judge-groundedness');
  assert.equal(evidence[0].body.parsedScore, 0.96);
  assert.equal(typeof evidence[0].body.requestHash, 'string');
});

test('a replacement judge adapter is used without changing the evaluator', async () => {
  const replacement = new FakeAIAdapter({ id: 'replacement-judge' });
  replacement.useScript({ kind: 'success', text: '{"score":0.2,"reason":"not grounded"}' });
  const adapters = createAdapterRegistry();
  adapters.register(replacement);
  const scored = await registerModelEvaluators().get('groundedness').evaluate({
    run: { runId: 'run-1', suiteId: 'suite-1', startedAt: '2026-01-01T00:00:00.000Z' },
    evaluationCase: evaluationCase('replacement-judge'),
    sample: {
      sampleId: 'sample-1',
      sampleIndex: 0,
      caseId: 'case-1',
      requestHash: 'hash',
      execution: execution('answer'),
      evaluatorResults: [],
      status: 'review',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:00:00.020Z',
    },
    result: execution('answer'),
    config: {},
    adapters,
    evidence: { async write() { return 'judge-groundedness'; } },
  });

  assert.equal(scored.status, 'fail');
  assert.equal(scored.score, 0.2);
  assert.equal(scored.metadata.judgeAdapterId, 'replacement-judge');
});

test('invalid judge output is an evaluator error and does not become a score', async () => {
  const judge = new FakeAIAdapter({ id: 'judge' });
  judge.useScript({ kind: 'success', text: 'not json' });
  const adapters = createAdapterRegistry();
  adapters.register(judge);
  const scored = await registerModelEvaluators().get('relevance').evaluate({
    run: { runId: 'run-1', suiteId: 'suite-1', startedAt: '2026-01-01T00:00:00.000Z' },
    evaluationCase: {
      id: 'case-1',
      name: 'case',
      target: { adapter: 'target' },
      input: { messages: [{ role: 'user', content: 'question' }] },
      evaluators: [{ id: 'relevance', type: 'model', judge: { adapter: 'judge' } }],
    },
    sample: {
      sampleId: 'sample-1',
      sampleIndex: 0,
      caseId: 'case-1',
      requestHash: 'hash',
      execution: execution('answer'),
      evaluatorResults: [],
      status: 'review',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:00:00.020Z',
    },
    result: execution('answer'),
    config: {},
    adapters,
    evidence: { async write() { return 'judge-relevance'; } },
  });

  assert.equal(scored.status, 'error');
  assert.equal(scored.score, undefined);
  assert.equal(scored.error.code, 'EVALUATOR_ERROR');
});
