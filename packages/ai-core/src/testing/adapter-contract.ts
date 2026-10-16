import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAdapterCapabilities } from '../registry.js';
import type { AIPlatformAdapter, ProviderEvidence } from '../adapter.js';
import type { AIExecutionResult, ExecutionContext } from '../execution.js';
import { assertNoSecrets } from './fake-adapter.js';
import { createTestExecutionContext, textRequest, type AdapterScript } from './scripts.js';

export interface ContractTestAdapter extends AIPlatformAdapter {
  useScript(script: AdapterScript): void;
  collectEvidence(result: AIExecutionResult, context: ExecutionContext): Promise<ProviderEvidence>;
}

export interface AdapterContractOptions {
  name: string;
  createAdapter: () => ContractTestAdapter;
  secret?: string;
}

/**
 * Registers the shared adapter contract tests.
 * A later provider adapter can reuse this by supplying a scripted test double with the same useScript method.
 */
export function registerAdapterContractTests(options: AdapterContractOptions): void {
  const secret = options.secret ?? 'super-secret-token';

  function subject(script?: AdapterScript): { adapter: ContractTestAdapter; context: ReturnType<typeof createTestExecutionContext> } {
    const adapter = options.createAdapter();
    if (script) {
      adapter.useScript(script);
    }
    return { adapter, context: createTestExecutionContext() };
  }

  test(`${options.name} keeps a stable identity and declares capabilities`, async () => {
    const { adapter } = subject();
    assert.equal(adapter.id, adapter.id);
    assert.ok(adapter.name.length > 0);
    assert.ok(adapter.version.length > 0);
    const capabilities = await adapter.capabilities();
    validateAdapterCapabilities(capabilities);
    const health = await adapter.healthCheck({});
    assert.equal(health.status, 'healthy');
  });

  test(`${options.name} returns a normalised text response with usage, latency, citations, tools, and safety`, async () => {
    const { adapter, context } = subject({
      kind: 'success',
      text: 'The return window is 14 days.',
      structured: { allowed: false },
      latencyMs: 15,
      usage: { inputTokens: 4, outputTokens: 6, totalTokens: 10 },
      citations: [{ id: 'policy', title: 'Returns', uri: 'https://example.test/returns' }],
      toolCalls: [{ id: 'call-1', name: 'lookupPolicy', status: 'completed' }],
      safety: [{ category: 'violence', action: 'allow', severity: 'info' }],
      finishReason: 'stop',
    });

    const result = await adapter.execute(textRequest(`token ${secret}`), context);
    assert.equal(result.status, 'completed');
    assert.equal(result.output.text, 'The return window is 14 days.');
    assert.deepEqual(result.output.structured, { allowed: false });
    assert.equal(result.timing.latencyMs, 15);
    assert.equal(result.usage?.totalTokens, 10);
    assert.equal(result.citations?.[0]?.id, 'policy');
    assert.equal(result.toolCalls?.[0]?.name, 'lookupPolicy');
    assert.equal(result.safety?.[0]?.action, 'allow');
    assert.equal(result.finishReason, 'stop');
    assertNoSecrets(result.native, [secret]);
    assertNoSecrets(await adapter.collectEvidence(result, context), [secret]);
  });

  test(`${options.name} normalises timeout, rate limit, provider failure, and authentication errors`, async () => {
    const timeout = subject({ kind: 'timeout' });
    const timedOut = await timeout.adapter.execute(textRequest(), timeout.context);
    assert.equal(timedOut.status, 'failed');
    assert.equal(timedOut.error?.code, 'TIMEOUT_ERROR');
    assert.equal(timedOut.error?.retryable, true);

    const limited = subject({ kind: 'rate-limit' });
    const rateLimited = await limited.adapter.execute(textRequest(), limited.context);
    assert.equal(rateLimited.error?.code, 'RATE_LIMIT_ERROR');
    assert.equal(rateLimited.error?.retryable, true);

    const failed = subject({ kind: 'provider-failure', providerCode: 'simulated-500' });
    const providerFailed = await failed.adapter.execute(textRequest(), failed.context);
    assert.equal(providerFailed.error?.code, 'PROVIDER_RESPONSE_ERROR');
    assert.equal(providerFailed.error?.providerCode, 'simulated-500');
    assert.equal(providerFailed.error?.retryable, false);

    const auth = subject({ kind: 'authentication', message: `rejected ${secret}` });
    const unauthenticated = await auth.adapter.execute(textRequest(), auth.context);
    assert.equal(unauthenticated.error?.code, 'AUTHENTICATION_ERROR');
    assert.equal(unauthenticated.error?.retryable, false);
    assertNoSecrets(unauthenticated.error, [secret]);
  });

  test(`${options.name} honours abort and rejects unsupported image content before the script runs`, async () => {
    const controller = new AbortController();
    controller.abort();
    const aborted = subject({ kind: 'success', text: 'should not run' });
    const abortedResult = await aborted.adapter.execute(textRequest(), createTestExecutionContext({ signal: controller.signal }));
    assert.equal(abortedResult.error?.code, 'TIMEOUT_ERROR');
    assert.equal(abortedResult.error?.message, 'Execution aborted');

    const next = await aborted.adapter.execute(textRequest(), createTestExecutionContext());
    assert.equal(next.output.text, 'should not run');

    const images = subject({ kind: 'success', text: 'unused' });
    const blocked = await images.adapter.execute(
      { messages: [{ role: 'user', content: [{ type: 'image', uri: 'https://example.test/a.png' }] }] },
      images.context,
    );
    assert.equal(blocked.error?.code, 'ADAPTER_CAPABILITY_ERROR');
    const afterBlock = await images.adapter.execute(textRequest(), createTestExecutionContext());
    assert.equal(afterBlock.output.text, 'unused');
  });
}

export function assertAdapterIdentity(adapter: AIPlatformAdapter): void {
  assert.equal(typeof adapter.id, 'string');
  assert.equal(typeof adapter.name, 'string');
  assert.equal(typeof adapter.version, 'string');
}
