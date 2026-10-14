import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createAdapterRegistry } from '@klassijs/ai-core';
import { FakeAIAdapter } from '@klassijs/ai-core/testing';
import { getJudgePrompt, registerModelEvaluators } from '../dist/index.js';

const fixture = JSON.parse(await readFile(new URL('./fixtures/judge-calibration.json', import.meta.url), 'utf8'));

test('judge calibration fixtures use versioned prompts and reject invalid scores', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const declared = { ...packageJson.dependencies, ...packageJson.devDependencies };
  assert.equal(declared['@azure/identity'], undefined);
  assert.equal(declared['@klassijs/ai-adapter-azure-openai'], undefined);

  for (const row of fixture) {
    const prompt = getJudgePrompt(row.evaluator);
    assert.equal(prompt.version, '1.0.0');
    const judge = new FakeAIAdapter({ id: 'calibration-judge' });
    judge.useScript({ kind: 'success', text: row.output });
    const adapters = createAdapterRegistry();
    adapters.register(judge);
    const evidence = [];
    const scored = await registerModelEvaluators().get(row.evaluator).evaluate({
      run: { runId: 'run-1', suiteId: 'suite-1', startedAt: '2026-01-01T00:00:00.000Z' },
      evaluationCase: {
        id: 'case-1',
        name: 'case',
        target: { adapter: 'target' },
        input: { messages: [{ role: 'user', content: 'Say hello' }] },
        evaluators: [{ id: row.evaluator, type: 'model', threshold: row.threshold, judge: { adapter: 'calibration-judge', profile: 'judge' } }],
      },
      sample: sample(),
      result: execution(),
      config: {},
      adapters,
      evidence: { async write(artifact) { evidence.push(artifact); return artifact.name; } },
    });

    assert.equal(scored.status, row.status);
    assert.equal(scored.score, row.score);
    assert.equal(evidence[0].body.promptId, row.evaluator);
    assert.equal(evidence[0].body.promptVersion, '1.0.0');
    assert.equal(scored.metadata.judgeAdapterId, 'calibration-judge');
  }
});

function execution() {
  return {
    id: 'result-1',
    adapterId: 'target',
    status: 'completed',
    output: { text: 'hello' },
    timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.020Z', latencyMs: 20 },
  };
}

function sample() {
  return {
    sampleId: 'sample-1',
    sampleIndex: 0,
    caseId: 'case-1',
    requestHash: 'hash',
    execution: execution(),
    evaluatorResults: [],
    status: 'review',
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:00:00.020Z',
  };
}
