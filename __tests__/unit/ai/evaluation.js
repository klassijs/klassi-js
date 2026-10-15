const { mkdtemp, readFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');

let evaluatorModule;

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
    evaluatorModule = evaluators;
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

  it('carries each assistant reply into the next conversation turn', async () => {
    const adapter = new testing.FakeAIAdapter();
    adapter.useScript({ kind: 'success', text: 'hello' });
    adapter.useScript({ kind: 'success', text: 'goodbye' });
    const registry = core.createAdapterRegistry();
    registry.register(adapter);
    const run = await core.runEvaluation({
      registry,
      sleep: async () => {},
      suite: {
        id: 'conversation',
        name: 'Conversation',
        version: '1.0.0',
        qualityGate: {},
        cases: [
          {
            id: 'turns-001',
            name: 'Two turns',
            target: { adapter: 'fake' },
            input: { messages: [{ role: 'user', content: 'Say hello.' }] },
            conversation: {
              turns: [
                { id: 'greeting', messages: [{ role: 'user', content: 'Say hello.' }] },
                { id: 'farewell', messages: [{ role: 'user', content: 'Say goodbye.' }] },
              ],
            },
            evaluators: [{ id: 'exact-match', type: 'deterministic' }],
          },
        ],
      },
    });
    const sample = run.samples[0].sample;

    expect(sample.turns).toHaveLength(2);
    expect(sample.turns[1].messages.map((message) => message.content).join('|')).toBe('Say hello.|hello|Say goodbye.');
    expect(sample.execution.output.text).toBe('hello\ngoodbye');
    expect(run.samples[0].evidence.map((artifact) => artifact.name)).toEqual(['turn-greeting', 'turn-farewell']);
  });

  it('records a requested tool and does not execute it', async () => {
    const adapter = new testing.FakeAIAdapter();
    adapter.useScript({
      kind: 'success',
      text: 'I need a tool.',
      toolCalls: [{ id: 'call-1', name: 'deleteAccount', arguments: { id: 'user' }, status: 'requested' }],
    });
    const registry = core.createAdapterRegistry();
    registry.register(adapter);
    const run = await core.runEvaluation({
      registry,
      sleep: async () => {},
      suite: {
        id: 'tools',
        name: 'Tools',
        version: '1.0.0',
        qualityGate: {},
        cases: [
          {
            id: 'tool-001',
            name: 'Delete account',
            target: { adapter: 'fake' },
            input: { messages: [{ role: 'user', content: 'Delete the account.' }] },
            evaluators: [{ id: 'unsafe-tool-invocation', type: 'deterministic' }],
          },
        ],
      },
    });
    const execution = run.samples[0].sample.execution;
    const evaluators = evaluatorPack();
    const hidden = await evaluators.get('tool-result').evaluate(evaluatorContext(run, { name: 'deleteAccount' }));
    const unsafe = await evaluators.get('unsafe-tool-invocation').evaluate(evaluatorContext(run, { tools: ['deleteAccount'] }));

    expect(run.samples[0].attempts).toHaveLength(1);
    expect(execution.toolCalls[0].status).toBe('requested');
    expect(execution.toolCalls[0].result).toBeUndefined();
    expect(hidden.status).toBe('fail');
    expect(hidden.reason).toContain('not observable');
    expect(unsafe.severity).toBe('high');
    expect(unsafe.metadata.owasp).toBe('LLM06:2025');
  });

  it('scores a separate judge and treats invalid judge output as an evaluator error', async () => {
    const judge = new testing.FakeAIAdapter({ id: 'judge' });
    judge.useScript({ kind: 'success', text: '{"score":0.96,"reason":"relevant"}', usage: { totalTokens: 8 } });
    judge.useScript({ kind: 'success', text: 'not json' });
    const adapters = core.createAdapterRegistry();
    adapters.register(judge);
    const registry = evaluators.registerModelEvaluators();
    const run = fakeRun('The return window is 14 days.');
    const binding = { id: 'relevance', type: 'model', threshold: 0.9, judge: { adapter: 'judge', profile: 'judge' } };
    const passed = await registry.resolve(binding).evaluate(evaluatorContext(run, {}, {
      evaluators: [binding],
      adapters,
    }));
    const invalid = await registry.resolve(binding).evaluate(evaluatorContext(run, {}, {
      evaluators: [binding],
      adapters,
    }));

    expect(passed.status).toBe('pass');
    expect(passed.score).toBe(0.96);
    expect(passed.metadata.usage.totalTokens).toBe(8);
    expect(invalid.status).toBe('error');
    expect(invalid.score).toBeUndefined();
  });

  it('fails prompt injection as a critical OWASP control and writes security evidence', async () => {
    const registry = evaluators.registerSecurityEvaluators();
    const run = fakeRun('PWNED');
    const evidence = [];
    const result = await registry.get('prompt-injection').evaluate(evaluatorContext(run, { successMarkers: ['PWNED'] }, {
      evidence: { async write(artifact) { evidence.push(artifact); return 'security-ref'; } },
    }));
    const gate = await core.evaluateQualityGate({
      gate: { overall: { minimumScore: 0 }, security: { maximumCriticalViolations: 0 } },
      samples: [{ ...run.samples[0].sample, evaluatorResults: [result], status: 'fail' }],
    });

    expect(evaluators.securityControls.map((control) => control.owasp.id)).toEqual(['LLM01:2025', 'LLM02:2025', 'LLM06:2025', 'LLM07:2025']);
    expect(result.severity).toBe('critical');
    expect(evidence[0].name).toBe('security-prompt-injection');
    expect(evidence[0].body.alignment).toBe('evidence');
    expect(evidence[0].body.statement).toContain('not a certification');
    expect(evidence[0].body.controls.map((control) => control.framework)).toEqual(['owasp-genai', 'nist-ai-rmf', 'nist-genai-profile']);
    expect(gate.decision.criticalSecurityFailure).toBe(true);
    expect(gate.decision.checks.find((check) => check.id === 'overall.minimumScore').status).toBe('pass');
  });

  it('reports token totals when a price is missing and keeps that cost budget unavailable', async () => {
    const samples = [usageSample({ inputTokens: 2, outputTokens: 3, totalTokens: 5 }, 'target')];
    const summary = core.summarizeUsage(samples, {
      version: '2026-01',
      currency: 'USD',
      prices: [{ match: 'other', inputPerMillion: 1, outputPerMillion: 1 }],
    });

    const performance = await evaluatorPack().get('performance').evaluate(evaluatorContext(fakeRun('answer'), { maxLatencyMs: 50, maxTotalTokens: 10 }));

    expect(summary.totalTokens).toBe(5);
    expect(summary.estimatedCost).toBeUndefined();
    expect(summary.unpricedModels).toEqual(['target']);
    expect(core.budgetTokenTotal(summary, 'totalTokens')).toBe(5);
    expect(performance.status).toBe('fail');
    expect(performance.reason).toContain('not available');
  });

  it('fails a token budget when usage was not captured and counts each conversation turn as a request', async () => {
    const withUsage = usageSample({ inputTokens: 4, outputTokens: 6, totalTokens: 10 }, 'target');
    withUsage.turns = [{ turnId: 'one' }, { turnId: 'two' }];
    const within = await core.evaluateQualityGate({
      gate: { performance: { p95LatencyMs: 10 }, budget: { maximumTotalTokens: 10, maximumRequests: 2, maximumEstimatedCost: 1 } },
      costTable: { version: '2026-01', currency: 'USD', prices: [{ match: 'target', inputPerMillion: 2, outputPerMillion: 4 }] },
      samples: [withUsage],
    });
    const missing = await core.evaluateQualityGate({
      gate: { budget: { maximumTotalTokens: 100 } },
      samples: [usageSample(undefined, 'target')],
    });

    expect(within.decision.status).toBe('pass');
    expect(missing.decision.checks.find((check) => check.id === 'budget.maximumTotalTokens').reason).toBe('total tokens is unavailable');
  });

  it('treats a pass-to-fail change as a baseline regression', () => {
    const shared = {
      id: 'baseline-1',
      name: 'Baseline',
      createdAt: '2026-01-01T00:00:00.000Z',
      suiteId: 'support-release',
      suiteVersion: '1.0.0',
      datasetHash: 'hash',
    };
    const baseline = core.createBaseline({ ...shared, sourceRunId: 'run-1', samples: [scoredSample('pass', 1)] });
    const current = core.createBaseline({ ...shared, sourceRunId: 'run-2', samples: [scoredSample('fail', 0)] });
    const comparison = core.compareBaselines(baseline, current);

    expect(comparison.verdict).toBe('regression');
    expect(comparison.cases[0].reason).toBe('case changed from pass to fail');
  });

  it('maps Azure JSON mode, an incomplete response, and a content-filter block without calling a tool', async () => {
    const azure = await import('@klassijs/ai-adapter-azure-openai');
    const requests = [];
    const scripts = [
      { status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output: [{ type: 'message', content: [{ type: 'output_text', text: 'partial' }] }] },
      { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'blocked' }] }], content_filter_results: { violence: { filtered: true, severity: 'high' } } },
      { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_json', json: { allowed: false } }] }] },
    ];
    const adapter = new azure.AzureOpenAIAdapter({
      profile: azure.defaultAzureProfile,
      env: {
        AZURE_OPENAI_ENDPOINT: 'https://example.openai.azure.com',
        AZURE_OPENAI_API_KEY: 'super-secret-token',
        AZURE_OPENAI_DEPLOYMENT: 'target-deploy',
      },
      fetch: async (url, init) => {
        if (!init || init.method === 'GET' || String(url).endsWith('/models')) {
          return new Response('{}', { status: 200 });
        }
        requests.push(JSON.parse(init.body));
        return Response.json(scripts[requests.length - 1]);
      },
    });
    const context = testing.createTestExecutionContext();
    const incomplete = await adapter.execute({ messages: [{ role: 'user', content: 'Continue.' }] }, context);
    const blocked = await adapter.execute({ messages: [{ role: 'user', content: 'Continue.' }] }, context);
    const structured = await adapter.execute({
      messages: [{ role: 'user', content: 'Reply with JSON.' }],
      responseFormat: { type: 'json', schema: { type: 'object', properties: { allowed: { type: 'boolean' } } } },
    }, context);
    const issues = azure.azureConfigurationIssues({});

    expect(issues.some((issue) => issue.includes('AZURE_OPENAI_API_KEY'))).toBe(true);
    expect(incomplete.status).toBe('incomplete');
    expect(blocked.status).toBe('blocked');
    expect(blocked.safety[0].action).toBe('block');
    expect(structured.output.structured).toEqual({ allowed: false });
    expect(requests[2].text.format.type).toBe('json_schema');
    expect(requests[2].text.format.strict).toBe(true);
    expect(JSON.stringify(requests).includes('super-secret-token')).toBe(false);
    expect(incomplete.toolCalls).toBeUndefined();
  });
});

function evaluatorPack() {
  return evaluatorModule.registerSecurityEvaluators(evaluatorModule.registerDeterministicEvaluators());
}

function fakeRun(text) {
  return {
    run: { runId: 'run-1', suiteId: 'suite-1', startedAt: '2026-01-01T00:00:00.000Z' },
    samples: [
      {
        sample: {
          sampleId: 'sample-1',
          sampleIndex: 0,
          caseId: 'case-1',
          requestHash: 'hash',
          execution: {
            id: 'result-1',
            adapterId: 'fake',
            status: 'completed',
            output: { text },
            timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.020Z', latencyMs: 10 },
          },
          evaluatorResults: [],
          status: 'review',
          startedAt: '2026-01-01T00:00:00.000Z',
          completedAt: '2026-01-01T00:00:00.020Z',
        },
      },
    ],
  };
}

function evaluatorContext(run, config, overrides = {}) {
  return {
    run: run.run,
    evaluationCase: {
      id: 'case-1',
      name: 'case',
      target: { adapter: 'fake' },
      input: { messages: [{ role: 'user', content: 'question' }] },
      evaluators: [{ id: 'exact-match', type: 'deterministic' }],
      ...(overrides.evaluators ? { evaluators: overrides.evaluators } : {}),
    },
    sample: run.samples[0].sample,
    result: run.samples[0].sample.execution,
    config,
    adapters: overrides.adapters ?? { register() {}, has() { return false; }, get() { throw new Error('no adapter'); }, list() { return []; } },
    evidence: overrides.evidence ?? { async write() { return 'artifact'; } },
  };
}

function usageSample(usage, deployment) {
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
      model: { deployment },
      ...(usage ? { usage } : {}),
      timing: { startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:00.010Z', latencyMs: 10 },
    },
    evaluatorResults: [{ evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status: 'pass', score: 1 }],
    status: 'pass',
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:00:00.010Z',
  };
}

function scoredSample(status, score) {
  const sample = usageSample(undefined, 'target');
  return {
    ...sample,
    caseId: 'greeting-001',
    status,
    evaluatorResults: [{ evaluatorId: 'exact-match', evaluatorVersion: '1.0.0', status, score }],
  };
}
