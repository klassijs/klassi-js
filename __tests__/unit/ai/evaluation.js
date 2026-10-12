const { mkdtemp, readFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');

describe('ai evaluation', () => {
  let core;
  let datasets;
  let testing;
  let evaluators;

  beforeAll(async () => {
    core = await import('@klassijs/ai-core');
    datasets = await import('@klassijs/ai-datasets');
    testing = await import('@klassijs/ai-core/testing');
    evaluators = await import('@klassijs/ai-evaluators');
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

  it('scores a fake response with a deterministic evaluator and does not resolve a judge', async () => {
    const adapter = new testing.FakeAIAdapter();
    adapter.useScript({ kind: 'success', text: 'The return window is 14 days.' });
    const adapters = core.createAdapterRegistry();
    adapters.register(adapter);
    const run = await core.runEvaluation({
      registry: adapters,
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
          },
        ],
      },
    });
    const registry = evaluators.registerDeterministicEvaluators();
    let judgeLookups = 0;
    const judges = {
      register() {},
      has() { return false; },
      get() {
        judgeLookups += 1;
        throw new Error('judge lookup');
      },
      list() { return []; },
    };
    const scored = await registry.resolve({ id: 'exact-match', type: 'deterministic' }).evaluate({
      run: run.run,
      evaluationCase: {
        id: 'refund-policy-001',
        name: 'Refund policy',
        target: { adapter: 'fake' },
        input: { messages: [{ role: 'user', content: 'Can I return an item after 20 days?' }] },
        evaluators: [{ id: 'exact-match', type: 'deterministic' }],
      },
      sample: run.samples[0].sample,
      result: run.samples[0].sample.execution,
      config: { expected: 'The return window is 14 days.' },
      adapters: judges,
      evidence: { async write() { return 'artifact'; } },
    });

    expect(scored.status).toBe('pass');
    expect(scored.score).toBe(1);
    expect(scored.evaluatorId).toBe('exact-match');
    expect(judgeLookups).toBe(0);
  });

  it('aggregates repeated samples without turning a missing score into zero', () => {
    const samples = [0, 1].map((index) => ({
      sampleId: `run:refund-policy-001:${index}`,
      sampleIndex: index,
      caseId: 'refund-policy-001',
      requestHash: 'hash',
      execution: {
        id: `result-${index}`,
        adapterId: 'fake',
        status: 'completed',
        output: { text: 'answer' },
        timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.010Z', latencyMs: 10 + index },
      },
      evaluatorResults: index === 0
        ? [{ evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'pass', score: 1 }]
        : [{ evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'fail' }],
      status: 'review',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:00:00.010Z',
    }));

    const suite = core.aggregateSuite(samples);

    expect(core.PERCENTILE_ALGORITHM).toBe('hyndman-fan-type-7');
    expect(suite.counts).toEqual({ count: 2, passCount: 1, failCount: 1, errorCount: 0, reviewCount: 0, passRate: 0.5 });
    expect(suite.scores.count).toBe(1);
    expect(suite.scores.mean).toBe(1);
    expect(suite.cases[0].latency.p95).toBe(core.percentile([10, 11], 0.95));
  });

  it('fails a quality gate on a critical security violation when the average score passes', async () => {
    const sample = {
      sampleId: 'run:refund-policy-001:0',
      sampleIndex: 0,
      caseId: 'refund-policy-001',
      requestHash: 'hash',
      execution: {
        id: 'result',
        adapterId: 'fake',
        status: 'completed',
        output: { text: 'answer' },
        timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.010Z', latencyMs: 10 },
      },
      evaluatorResults: [
        { evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'pass', score: 1 },
        { evaluatorId: 'security', evaluatorVersion: '1.0.0', status: 'fail', severity: 'critical', score: 0 },
      ],
      status: 'fail',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:00:00.010Z',
    };
    const gate = await core.evaluateQualityGate({
      gate: { overall: { minimumScore: 0.5 }, security: { maximumCriticalViolations: 0 } },
      samples: [sample],
    });

    expect(gate.decision.status).toBe('fail');
    expect(gate.decision.criticalSecurityFailure).toBe(true);
    expect(gate.evidence.name).toBe('quality-gate');
  });

  it('writes a canonical JSON report and a markdown report from the normalised result', async () => {
    const reporters = await import('@klassijs/ai-reporters');
    const report = reporters.createRunReport({
      run: { runId: 'run-1', startedAt: '2026-01-01T00:00:00.000Z' },
      suite: { id: 'support-release', name: 'Support release', version: '1.0.0', cases: [{ id: 'refund-policy-001', name: 'Refund policy' }] },
      samples: [],
      gate: { status: 'pass', checks: [], criticalSecurityFailure: false },
    });
    const directory = await mkdtemp(path.join(tmpdir(), 'klassi-report-'));
    await reporters.writeRunReports(report, directory);
    const json = JSON.parse(await readFile(path.join(directory, 'report.json'), 'utf8'));
    const markdown = await readFile(path.join(directory, 'report.md'), 'utf8');
    const cucumber = JSON.parse(await readFile(path.join(directory, 'cucumber.json'), 'utf8'));

    expect(json.suite.id).toBe('support-release');
    expect(markdown).toContain('Support release');
    expect(cucumber[0].keyword).toBe('Feature');
  });
});
