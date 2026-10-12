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

test('execute does not copy credentials into the result or evidence', async () => {
  const adapter = new AzureOpenAIAdapter({ profile: defaultAzureProfile, env: readyEnv(), fetch: async () => new Response(null, { status: 200 }) });
  const result = await adapter.execute(
    { messages: [{ role: 'user', content: secret }] },
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
  const evidence = await adapter.collectEvidence(result, {
    runId: 'run-1',
    suiteId: 'suite-1',
    caseId: 'case-1',
    sampleId: 'sample-1',
    startedAt: '2026-01-01T00:00:00.000Z',
    evidence: { async write() { return 'evidence'; } },
    logger: { debug() {}, info() {}, warn() {}, error() {} },
  });

  assert.equal(result.status, 'failed');
  assert.equal(result.error.code, 'PROVIDER_UNAVAILABLE');
  assert.equal(JSON.stringify(result).includes(secret), false);
  assert.equal(JSON.stringify(evidence).includes(secret), false);
  assert.equal(evidence.redacted, true);
});

test('ai-core does not depend on the Azure identity client', async () => {
  const core = JSON.parse(await readFile(path.join(packageRoot, '../ai-core/package.json'), 'utf8'));
  const declared = { ...core.dependencies, ...core.devDependencies };
  assert.equal(declared['@azure/identity'], undefined);
  assert.equal(declared['@azure/openai'], undefined);
  assert.equal(declared.openai, undefined);
});
