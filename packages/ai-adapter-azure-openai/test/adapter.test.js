import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { AzureOpenAIAdapter, defaultAzureProfile, runAzureDoctor } from '../dist/index.js';

const secret = 'super-secret-token';
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readyEnv() {
  return {
    AZURE_OPENAI_ENDPOINT: 'https://example.openai.azure.com',
    AZURE_OPENAI_DEPLOYMENT: 'support-eval',
    AZURE_OPENAI_API_KEY: secret,
  };
}

test('doctor reports missing configuration and does not call the network', async () => {
  let called = false;
  const lines = [];
  const code = await runAzureDoctor({
    platform: 'azure-openai',
    env: {},
    fetch: async () => {
      called = true;
      return new Response(null, { status: 200 });
    },
    write: (line) => lines.push(line),
  });
  const output = lines.join('\n');

  assert.equal(code, 2);
  assert.equal(called, false);
  assert.match(output, /AZURE_OPENAI_ENDPOINT is not set/);
  assert.match(output, /AZURE_OPENAI_DEPLOYMENT is not set/);
  assert.match(output, /AZURE_OPENAI_API_KEY is not set/);
  assert.equal(output.includes(secret), false);
});

test('a configured API key reaches the v1 models endpoint and stays out of the health result', async () => {
  let requestUrl = '';
  let apiKey = '';
  const adapter = new AzureOpenAIAdapter({
    profile: defaultAzureProfile,
    env: readyEnv(),
    fetch: async (input, init) => {
      requestUrl = String(input);
      apiKey = new Headers(init?.headers).get('api-key') ?? '';
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    },
  });
  const health = await adapter.healthCheck({});
  const serialized = JSON.stringify({ health, adapter: { id: adapter.id, profile: adapter.profile } });

  assert.equal(health.status, 'healthy');
  assert.equal(requestUrl, 'https://example.openai.azure.com/openai/v1/models');
  assert.equal(apiKey, secret);
  assert.equal(serialized.includes(secret), false);
  assert.equal(adapter.profile.credential.type, 'api-key');
});

test('authentication and credential-bearing errors are reported without the secret', async () => {
  const rejected = new AzureOpenAIAdapter({
    profile: defaultAzureProfile,
    env: readyEnv(),
    fetch: async () => new Response(`denied ${secret}`, { status: 401 }),
  });
  const unhealthy = await rejected.healthCheck({});
  assert.equal(unhealthy.status, 'unhealthy');
  assert.match(unhealthy.checks.find((check) => check.name === 'reachability').message, /authentication was rejected/);
  assert.equal(JSON.stringify(unhealthy).includes(secret), false);

  const leaked = new AzureOpenAIAdapter({
    profile: defaultAzureProfile,
    env: readyEnv(),
    fetch: async () => {
      throw new Error(`socket failed ${secret}`);
    },
  });
  const failed = await leaked.healthCheck({});
  assert.match(failed.checks.find((check) => check.name === 'reachability').message, /\[REDACTED\]/);
  assert.equal(JSON.stringify(failed).includes(secret), false);
});

test('an endpoint that embeds credentials fails before a request', async () => {
  let called = false;
  const lines = [];
  const code = await runAzureDoctor({
    platform: 'azure-openai',
    env: { AZURE_OPENAI_ENDPOINT: `https://user:${secret}@example.openai.azure.com`, AZURE_OPENAI_DEPLOYMENT: 'support-eval', AZURE_OPENAI_API_KEY: secret },
    fetch: async () => {
      called = true;
      return new Response(null, { status: 200 });
    },
    write: (line) => lines.push(line),
  });

  assert.equal(code, 2);
  assert.equal(called, false);
  assert.match(lines.join('\n'), /endpoint must not include credentials/);
  assert.equal(lines.join('\n').includes(secret), false);
});

test('Entra uses a separate token provider and redacts the bearer token', async () => {
  const token = 'entra-access-token';
  let authorization = '';
  const lines = [];
  const code = await runAzureDoctor({
    platform: 'azure-openai',
    profile: {
      endpointEnv: 'AZURE_OPENAI_ENDPOINT',
      deploymentEnv: 'AZURE_OPENAI_DEPLOYMENT',
      credential: { type: 'entra', credential: 'default' },
    },
    env: { AZURE_OPENAI_ENDPOINT: 'https://example.openai.azure.com/', AZURE_OPENAI_DEPLOYMENT: 'judge' },
    tokenProvider: async () => token,
    fetch: async (_input, init) => {
      authorization = new Headers(init?.headers).get('authorization') ?? '';
      throw new Error(`unauthorized ${token}`);
    },
    write: (line) => lines.push(line),
  });
  const output = lines.join('\n');

  assert.equal(code, 3);
  assert.equal(authorization, `Bearer ${token}`);
  assert.match(output, /using DefaultAzureCredential/);
  assert.match(output, /\[REDACTED\]/);
  assert.equal(output.includes(token), false);
});

test('execute maps a responses payload and redacts secrets from evidence', async () => {
  let requestBody = '';
  const adapter = new AzureOpenAIAdapter({
    profile: defaultAzureProfile,
    env: readyEnv(),
    async fetch(_input, init) {
      requestBody = String(init?.body ?? '');
      return Response.json({
        id: 'resp_1',
        model: 'provider-model',
        status: 'completed',
        output_text: `hello ${secret}`,
        output: [{ type: 'message', content: [{ type: 'output_text', text: 'hello' }] }],
        usage: { input_tokens: 3, output_tokens: 1, total_tokens: 4 },
      });
    },
  });
  const context = {
    runId: 'run-1',
    suiteId: 'suite-1',
    caseId: 'case-1',
    sampleId: 'sample-1',
    startedAt: '2026-01-01T00:00:00.000Z',
    evidence: { async write() { return 'evidence'; } },
    logger: { debug() {}, info() {}, warn() {}, error() {} },
  };
  const result = await adapter.execute({ messages: [{ role: 'user', content: secret }], deployment: 'case-deployment', model: 'logical-target' }, context);
  const evidence = await adapter.collectEvidence(result, context);

  assert.equal(result.status, 'completed');
  assert.equal(result.output.text, 'hello');
  assert.equal(result.model.deployment, 'case-deployment');
  assert.equal(result.model.requested, 'logical-target');
  assert.equal(result.model.providerModel, 'provider-model');
  assert.equal(result.usage.totalTokens, 4);
  assert.equal(JSON.parse(requestBody).model, 'case-deployment');
  assert.equal(JSON.stringify(result.native).includes(secret), false);
  assert.equal(JSON.stringify(evidence).includes(secret), false);
  assert.equal(evidence.redacted, true);
});

test('a rate limit exposes a safe retry hint', async () => {
  const adapter = new AzureOpenAIAdapter({
    profile: defaultAzureProfile,
    env: readyEnv(),
    fetch: async () => new Response(`limited ${secret}`, { status: 429, headers: { 'retry-after': '2' } }),
  });
  const result = await adapter.execute(
    { messages: [{ role: 'user', content: 'hello' }] },
    {
      runId: 'run-1',
      suiteId: 'suite-1',
      caseId: 'case-1',
      sampleId: 'sample-1',
      startedAt: '2026-01-01T00:00:00.000Z',
      evidence: { async write() { return 'evidence'; } },
      logger: { debug() {}, info() {}, warn() {}, error() {} },
    },
  );

  assert.equal(result.error.code, 'RATE_LIMIT_ERROR');
  assert.equal(result.error.retryable, true);
  assert.equal(result.error.retryAfterMs, 2000);
  assert.equal(JSON.stringify(result).includes(secret), false);
});

test('ai-core does not depend on the Azure identity client', async () => {
  const core = JSON.parse(await readFile(path.join(packageRoot, '../ai-core/package.json'), 'utf8'));
  const declared = { ...core.dependencies, ...core.devDependencies };
  assert.equal(declared['@azure/identity'], undefined);
  assert.equal(declared['@azure/openai'], undefined);
  assert.equal(declared.openai, undefined);
});
