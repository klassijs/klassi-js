import {
  type AdapterCapabilities,
  type AdapterHealth,
  type AdapterHealthContext,
  type AIExecutionRequest,
  type AIErrorCode,
  type AIExecutionResult,
  type AIPlatformAdapter,
  type ExecutionContext,
  type ProviderEvidence,
} from '@klassijs/ai-core';
import { isContentFilter, mapAzureCall, mapAzureOutput, providerError, requestHasImage, statusError } from './map.js';
import { AZURE_ADAPTER_ID, AZURE_ADAPTER_VERSION, assertAzureProfile, type AzureOpenAIAdapterProfile } from './profile.js';
import { redactText, redactValue } from './redact.js';
import { inspectAzureProfile, safeHealthMessage, type ResolvedAzureTarget } from './resolve.js';

const CAPABILITIES: AdapterCapabilities = {
  text: true,
  images: false,
  streaming: false,
  structuredOutput: true,
  toolCalling: true,
  multiTurn: true,
  usage: true,
  contentSafetyMetadata: true,
  seed: true,
};

export interface AzureOpenAIAdapterOptions {
  id?: string;
  profile: AzureOpenAIAdapterProfile;
  env?: NodeJS.ProcessEnv;
  fetch?: typeof fetch;
  now?: () => number;
}

export class AzureOpenAIAdapter implements AIPlatformAdapter {
  readonly id: string;
  readonly name = 'Azure OpenAI';
  readonly version = AZURE_ADAPTER_VERSION;
  readonly profile: AzureOpenAIAdapterProfile;

  readonly #env: NodeJS.ProcessEnv;
  readonly #fetch: typeof fetch;
  readonly #now: () => number;

  constructor(options: AzureOpenAIAdapterOptions) {
    assertAzureProfile(options.profile);
    this.id = options.id ?? AZURE_ADAPTER_ID;
    this.profile = options.profile;
    this.#env = options.env ?? process.env;
    this.#fetch = options.fetch ?? fetch;
    this.#now = options.now ?? Date.now;
  }

  async capabilities(): Promise<AdapterCapabilities> {
    return CAPABILITIES;
  }

  async healthCheck(context: AdapterHealthContext): Promise<AdapterHealth> {
    const checkedAt = new Date().toISOString();
    const inspected = inspectAzureProfile(this.profile, this.#env);
    const checks = [...(inspected.checks ?? [])];
    if (!inspected.resolved) {
      return { status: 'unhealthy', checkedAt, checks };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), inspected.resolved.timeoutMs);
    const onAbort = () => controller.abort();
    context.signal?.addEventListener('abort', onAbort);
    try {
      const headers = await this.authorizationHeaders(inspected.resolved);
      const response = await this.#fetch(`${inspected.resolved.endpoint}/openai/v1/models`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      await response.body?.cancel();
      if (response.ok) {
        checks.push({ name: 'reachability', status: 'pass', message: 'v1 models endpoint responded' });
        return { status: 'healthy', checkedAt, checks: redactChecks(checks, inspected.resolved.secrets) };
      }
      const failure = response.status === 401 ? 'authentication was rejected' : response.status === 403 ? 'authorization was rejected' : `HTTP ${response.status}`;
      checks.push({ name: 'reachability', status: 'fail', message: failure });
      return { status: 'unhealthy', checkedAt, checks: redactChecks(checks, inspected.resolved.secrets) };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Health check failed';
      checks.push({ name: 'reachability', status: 'fail', message: safeHealthMessage(message, inspected.resolved.secrets) });
      return { status: 'unhealthy', checkedAt, checks: redactChecks(checks, inspected.resolved.secrets) };
    } finally {
      clearTimeout(timer);
      context.signal?.removeEventListener('abort', onAbort);
    }
  }

  async execute(request: AIExecutionRequest, context: ExecutionContext): Promise<AIExecutionResult> {
    if (requestHasImage(request)) {
      return this.failure(context, 0, [], 'ADAPTER_CAPABILITY_ERROR', 'Adapter does not support image content', false);
    }
    if (context.signal?.aborted) {
      return this.failure(context, 0, [], 'TIMEOUT_ERROR', 'Execution aborted', false);
    }
    const inspected = inspectAzureProfile(this.profile, this.#env);
    if (!inspected.resolved) {
      const message = inspected.checks.find((check) => check.status === 'fail')?.message ?? 'Azure configuration is incomplete';
      return this.failure(context, 0, [], 'CONFIG_ERROR', message, false);
    }

    const resolved = inspected.resolved;
    const started = this.#now();
    const controller = new AbortController();
    let abortReason: 'caller' | 'timeout' | undefined;
    const timer = setTimeout(() => {
      abortReason = abortReason ?? 'timeout';
      controller.abort();
    }, attemptBudgetMs(context, resolved.timeoutMs));
    const onAbort = () => {
      abortReason = 'caller';
      controller.abort();
    };
    context.signal?.addEventListener('abort', onAbort);

    try {
      const call = mapAzureCall(request, resolved);
      const headers = await this.authorizationHeaders(resolved);
      const response = await this.#fetch(`${resolved.endpoint}${call.path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(call.body),
        signal: controller.signal,
      });
      const raw = await response.text();
      const latencyMs = Math.max(0, this.#now() - started);
      const parsed = parseBody(raw);
      if (!response.ok) {
        const classified = statusError(response.status);
        const details = providerError(parsed ?? raw);
        if (isContentFilter(details.message, details.providerCode)) {
          return this.blocked(context, latencyMs, details.message || 'Azure content filter blocked the prompt', resolved.secrets, redactValue({ status: response.status, body: parsed ?? raw }, resolved.secrets));
        }
        const retryAfterMs = classified.code === 'RATE_LIMIT_ERROR' ? retryAfter(response.headers.get('retry-after')) : undefined;
        return this.failure(
          context,
          latencyMs,
          resolved.secrets,
          classified.code,
          details.message || `HTTP ${response.status}`,
          classified.retryable,
          details.providerCode ?? String(response.status),
          retryAfterMs,
          redactValue({ status: response.status, body: parsed ?? raw }, resolved.secrets),
        );
      }
      const mapped = mapAzureOutput(parsed);
      const native = redactValue({ status: response.status, body: parsed ?? raw }, resolved.secrets);
      return {
        id: mapped.id ?? `${this.id}-completed`,
        adapterId: this.id,
        status: mapped.status,
        output: {
          ...(mapped.text !== undefined ? { text: mapped.text } : {}),
          ...(mapped.structured !== undefined ? { structured: mapped.structured } : {}),
        },
        ...(mapped.toolCalls ? { toolCalls: mapped.toolCalls } : {}),
        ...(mapped.citations ? { citations: mapped.citations } : {}),
        ...(mapped.usage ? { usage: mapped.usage } : {}),
        ...(mapped.safety ? { safety: mapped.safety } : {}),
        ...(mapped.finishReason ? { finishReason: mapped.finishReason } : {}),
        timing: timing(context.startedAt, latencyMs),
        model: {
          requested: call.requested,
          deployment: call.deployment,
          ...(mapped.providerModel ? { providerModel: mapped.providerModel } : {}),
        },
        native,
      };
    } catch (error) {
      const latencyMs = Math.max(0, this.#now() - started);
      if (abortReason === 'caller' || context.signal?.aborted) {
        return this.failure(context, latencyMs, resolved.secrets, 'TIMEOUT_ERROR', 'Execution aborted', false);
      }
      if (abortReason === 'timeout' || isAbortError(error)) {
        return this.failure(context, latencyMs, resolved.secrets, 'TIMEOUT_ERROR', 'Azure request timed out', true);
      }
      const message = error instanceof Error ? error.message : 'Azure request failed';
      return this.failure(context, latencyMs, resolved.secrets, 'NETWORK_ERROR', message, true);
    } finally {
      clearTimeout(timer);
      context.signal?.removeEventListener('abort', onAbort);
    }
  }

  async collectEvidence(result: AIExecutionResult, context: ExecutionContext): Promise<ProviderEvidence> {
    const secrets = inspectAzureProfile(this.profile, this.#env).resolved?.secrets ?? [];
    return {
      adapterId: this.id,
      capturedAt: result.timing.completedAt,
      redacted: true,
      payload: redactValue({ caseId: context.caseId, native: result.native, error: result.error }, secrets) as Record<string, unknown>,
    };
  }

  private blocked(context: ExecutionContext, latencyMs: number, message: string, secrets: readonly string[], native?: unknown): AIExecutionResult {
    const text = redactText(message, secrets);
    return {
      id: `${this.id}-blocked`,
      adapterId: this.id,
      status: 'blocked',
      output: { text },
      safety: [{ category: 'content-filter', action: 'block', severity: 'high' }],
      finishReason: 'content_filter',
      timing: timing(context.startedAt, latencyMs),
      ...(native !== undefined ? { native } : {}),
    };
  }

  private failure(
    context: ExecutionContext,
    latencyMs: number,
    secrets: readonly string[],
    code: AIErrorCode,
    message: string,
    retryable: boolean,
    providerCode?: string,
    retryAfterMs?: number,
    native?: unknown,
  ): AIExecutionResult {
    return {
      id: `${this.id}-failed`,
      adapterId: this.id,
      status: 'failed',
      output: {},
      timing: timing(context.startedAt, latencyMs),
      ...(native !== undefined ? { native } : {}),
      error: {
        code,
        message: redactText(message, secrets),
        retryable,
        ...(providerCode ? { providerCode } : {}),
        ...(retryAfterMs !== undefined ? { retryAfterMs } : {}),
      },
    };
  }

  async authorizationHeaders(resolved: ResolvedAzureTarget): Promise<Record<string, string>> {
    return { 'api-key': resolved.authorization.apiKey };
  }
}

function timing(startedAt: string, latencyMs: number): AIExecutionResult['timing'] {
  return {
    startedAt,
    completedAt: new Date(Date.parse(startedAt) + latencyMs).toISOString(),
    latencyMs,
  };
}

function attemptBudgetMs(context: ExecutionContext, fallbackMs: number): number {
  const deadline = Date.parse(context.deadline ?? '');
  const started = Date.parse(context.startedAt);
  if (!Number.isFinite(deadline) || !Number.isFinite(started)) {
    return fallbackMs;
  }
  return Math.max(1, deadline - started);
}

function parseBody(raw: string): unknown {
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function retryAfter(header: string | null): number | undefined {
  if (!header) {
    return undefined;
  }
  const seconds = Number(header);
  if (!Number.isFinite(seconds) || seconds < 0) {
    return undefined;
  }
  return Math.round(seconds * 1000);
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function redactChecks(checks: NonNullable<AdapterHealth['checks']>, secrets: readonly string[]): NonNullable<AdapterHealth['checks']> {
  return checks.map((check) => ({
    ...check,
    ...(check.message ? { message: redactText(check.message, secrets) } : {}),
  }));
}
