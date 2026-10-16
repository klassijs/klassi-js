const { mkdtemp, readFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');

describe('ai evaluation', () => {
  let core;
  let datasets;
  let testing;

  beforeAll(async () => {
    core = await import('@klassijs/ai-core');
    datasets = await import('@klassijs/ai-datasets');
    testing = await import('@klassijs/ai-core/testing');
  });

  it('registers one adapter and rejects a duplicate id', () => {
    const registry = core.createAdapterRegistry();
    const adapter = new testing.FakeAIAdapter();

    registry.register(adapter);

    expect(registry.get('fake').name).toBe('Fake AI adapter');
    expect(() => registry.register(adapter)).toThrow(core.AIEvaluationError);
  });

  it('keeps an evaluator infrastructure error distinct from a behavioural fail', () => {
    const evaluator = { id: 'exact-match', version: '1.0.0' };
    const failure = core.createEvaluatorResult(evaluator, { status: 'fail', score: 0, reason: 'text did not match' });
    const infrastructure = core.createEvaluatorResult(evaluator, {
      status: 'error',
      error: { code: 'EVALUATOR_ERROR', message: 'judge adapter was unavailable' },
    });

    expect(core.isBehaviouralEvaluatorStatus(failure.status)).toBe(true);
    expect(failure.error).toBeUndefined();
    expect(core.isInfrastructureEvaluatorStatus(infrastructure.status)).toBe(true);
    expect(infrastructure.status).not.toBe('fail');
  });

  it('loads the same suite from JSON and YAML and hashes them the same way', async () => {
    const fixtures = path.resolve(__dirname, '../../../packages/ai-datasets/fixtures');
    const json = await datasets.loadSuiteFile(path.join(fixtures, 'valid-suite.json'));
    const yaml = await datasets.loadSuiteFile(path.join(fixtures, 'valid-suite.yaml'));

    expect(json.suite.id).toBe('support-release');
    expect(yaml.suite.cases[0].evaluators[0].type).toBe('model');
    expect(json.datasetHash).toBe(yaml.datasetHash);
    expect(json.datasetHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('rejects an invalid suite before execution', async () => {
    const text = await readFile(path.resolve(__dirname, '../../../packages/ai-datasets/fixtures/invalid-suite.json'), 'utf8');

    expect(() => datasets.loadSuiteFromJson(text)).toThrow(datasets.DatasetValidationError);
  });

  it('runs one fake-adapter sample and does not retry a completed answer', async () => {
    const adapter = new testing.FakeAIAdapter();
    adapter.useScript({ kind: 'success', text: 'wrong answer' });
    adapter.useScript({ kind: 'success', text: 'second sample' });
    const registry = core.createAdapterRegistry();
    registry.register(adapter);

    const run = await core.runEvaluation({
      registry,
      sleep: async () => {},
      suite: {
        id: 'support-release',
        name: 'Support release',
        version: '1.0.0',
        qualityGate: {},
        cases: [
          {
            id: 'refund-policy-001',
            name: 'Refund policy',
            target: { adapter: 'fake' },
            input: { messages: [{ role: 'user', content: 'Can I return an item after 20 days?' }] },
            evaluators: [{ id: 'exact-match', type: 'deterministic' }],
            execution: { samples: 2, retry: { maxInfrastructureRetries: 2, initialDelayMs: 0, jitter: false } },
          },
        ],
      },
    });

    expect(run.samples).toHaveLength(2);
    expect(run.samples[0].attempts).toHaveLength(1);
    expect(run.samples[1].attempts).toHaveLength(1);
    expect(run.samples[0].sample.sampleId).not.toBe(run.samples[1].sample.sampleId);
    expect(run.samples[0].sample.execution.output.text).toBe('wrong answer');
    expect(run.samples[1].sample.execution.output.text).toBe('second sample');
  });

  it('redacts secrets before writing evidence', async () => {
    const evidence = await import('@klassijs/ai-evidence');
    const secret = 'super-secret-token';
    const root = await mkdtemp(path.join(tmpdir(), 'klassi-evidence-'));
    const store = new evidence.FileEvidenceStore(root);
    const bundle = await store.save({
      secrets: [secret],
      run: { runId: 'run-1', suiteId: 'support-release', startedAt: '2026-01-01T00:00:00.000Z' },
      suite: { suiteId: 'support-release', name: 'Support release', version: '1.0.0' },
      cases: [{ caseId: 'refund-policy-001', name: 'Refund policy', targetAdapter: 'fake' }],
      samples: [
        {
          sampleId: 'sample-1',
          caseId: 'refund-policy-001',
          request: { headers: { Authorization: `Bearer ${secret}` }, content: secret },
          response: { text: 'ok' },
          execution: { status: 'completed' },
        },
      ],
    });
    const request = await readFile(bundle.samples[0].requestPath, 'utf8');

    expect(request.includes(secret)).toBe(false);
    expect(bundle.hashes.artifacts.length).toBeGreaterThan(0);
  });
});
