import test from 'node:test';
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
