import test from 'node:test';
import { createAdapterRegistry, runEvaluation } from '@klassijs/ai-core';
import { AzureOpenAIAdapter, defaultAzureProfile } from '../dist/index.js';

const configured = Boolean(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_DEPLOYMENT);

test('executes against Azure when credentials are configured', { skip: configured ? false : 'Azure credentials are not configured' }, async () => {
  const adapter = new AzureOpenAIAdapter({ profile: defaultAzureProfile });
  const health = await adapter.healthCheck({});
  if (health.status !== 'healthy') {
    throw new Error(health.checks?.map((check) => `${check.name}: ${check.status}`).join(', ') ?? 'Azure health check failed');
  }
  const result = await adapter.execute(
    { messages: [{ role: 'user', content: 'Reply with the single word hello.' }] },
    {
      runId: 'run-azure',
      suiteId: 'suite-azure',
      caseId: 'case-azure',
      sampleId: 'sample-azure',
      startedAt: new Date().toISOString(),
      evidence: { async write() { return 'evidence'; } },
      logger: { debug() {}, info() {}, warn() {}, error() {} },
    },
  );
  if (result.status !== 'completed' || !result.output.text) {
    throw new Error(result.error?.message ?? 'Azure execution did not return text');
  }
});

test('a multi-turn Azure conversation completes when credentials are configured', { skip: configured ? false : 'Azure credentials are not configured' }, async () => {
  const adapter = new AzureOpenAIAdapter({ profile: defaultAzureProfile });
  const registry = createAdapterRegistry();
  registry.register(adapter);
  const run = await runEvaluation({
    registry,
    suite: {
      id: 'azure-conversation',
      name: 'Azure conversation',
      version: '1.0.0',
      cases: [{
        id: 'turns-001',
        name: 'Two turns',
        target: { adapter: 'azure-openai' },
        input: { messages: [{ role: 'user', content: 'Reply with the single word one.' }] },
        conversation: {
          turns: [
            { id: 'first', messages: [{ role: 'user', content: 'Reply with the single word one.' }] },
            { id: 'second', messages: [{ role: 'user', content: 'Reply with the single word two.' }] },
          ],
        },
        evaluators: [{ id: 'exact-match', type: 'deterministic' }],
        execution: { samples: 1, retry: { maxInfrastructureRetries: 0 } },
      }],
      qualityGate: {},
    },
    sleep: async () => {},
  });
  const turns = run.samples[0]?.sample.turns ?? [];
  if (turns.length !== 2 || turns.some((turn) => turn.execution.status !== 'completed' || !turn.execution.output.text)) {
    throw new Error('Azure multi-turn conversation did not complete both turns');
  }
});
