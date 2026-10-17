import {
  type AdapterCapabilities,
  type AdapterHealth,
  type AdapterHealthContext,
  type AIErrorCode,
  type AIExecutionRequest,
  type AIExecutionResult,
  type AIPlatformAdapter,
  type ExecutionContext,
  type ProviderEvidence,
} from '@klassijs/ai-core';
import { mapRequest, mapResponse, requestHasImage } from './map.js';
import { assertHttpProfile, httpStatusError, type HttpAdapterProfile } from './profile.js';
import { redactText, redactValue } from './redact.js';

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

export interface HttpAIAdapterOptions {
  id?: string;
  profile: HttpAdapterProfile;
  fetch?: typeof fetch;
  redactValues?: string[];
}

export class HttpAIAdapter implements AIPlatformAdapter {
  readonly id: string;
  readonly name = 'HTTP AI adapter';
  readonly version = '0.1.0';
  readonly profile: HttpAdapterProfile;

  private readonly fetchImpl: typeof fetch;
  private readonly redactValues: string[];

  constructor(options: HttpAIAdapterOptions) {
    assertHttpProfile(options.profile);
    this.id = options.id ?? 'http';
    this.profile = options.profile;
    this.fetchImpl = options.fetch ?? fetch;
    this.redactValues = options.redactValues ?? [];
  }

  async capabilities(): Promise<AdapterCapabilities> {
    return CAPABILITIES;
  }

  async healthCheck(context: AdapterHealthContext): Promise<AdapterHealth> {
    const checkedAt = new Date().toISOString();
    try {
      const response = await this.fetchImpl(this.profile.endpoint, {
        method: 'GET',
        headers: this.headers(),
        signal: context.signal,
      });
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        checkedAt,
        checks: [{ name: 'endpoint', status: response.ok ? 'pass' : 'fail', message: `HTTP ${response.status}` }],
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        checkedAt,
        message: error instanceof Error ? redactText(error.message, this.secrets()) : 'Health check failed',
        checks: [{ name: 'endpoint', status: 'fail' }],
      };
    }
  }

  async execute(request: AIExecutionRequest, context: ExecutionContext): Promise<AIExecutionResult> {
    if (context.signal?.aborted) {
      return this.failure(context, 0, 'TIMEOUT_ERROR', 'Execution aborted', false);
    }
    if (requestHasImage(request)) {
      return this.failure(context, 0, 'ADAPTER_CAPABILITY_ERROR', 'Adapter does not support image content', false);
    }

    const started = Date.now();
    const controller = new AbortController();
    let abortReason: 'caller' | 'timeout' | undefined;
    const timeoutMs = this.profile.timeoutMs ?? 30_000;
    const timer = setTimeout(() => {
      abortReason = abortReason ?? 'timeout';
      controller.abort();
    }, timeoutMs);
    const onAbort = () => {
      abortReason = 'caller';
      controller.abort();
    };
    context.signal?.addEventListener('abort', onAbort);

    try {
      const response = await this.fetchImpl(this.profile.endpoint, {
        method: this.profile.method ?? 'POST',
        headers: { 'content-type': 'application/json', ...this.headers() },
        body: JSON.stringify(mapRequest(request, this.profile)),
        signal: controller.signal,
      });
      const raw = await response.text();
      const latencyMs = Date.now() - started;
      const parsed = parseBody(raw);
      const mapped = mapResponse(parsed ?? raw, this.profile);
      if (!response.ok) {
        const classified = httpStatusError(response.status);
        const message = redactText(mapped.text || raw || `HTTP ${response.status}`, this.secrets());
        return this.failure(context, mapped.latencyMs ?? latencyMs, classified.code, message, classified.retryable, mapped.providerCode ?? String(response.status));
      }
      const native = redactValue({ status: response.status, body: parsed ?? raw }, this.secrets());
      return {
        id: `${this.id}-completed`,
        adapterId: this.id,
        status: 'completed',
        output: {
          ...(mapped.text !== undefined ? { text: mapped.text } : {}),
          ...(mapped.structured !== undefined ? { structured: mapped.structured } : {}),
        },
        ...(mapped.toolCalls ? { toolCalls: mapped.toolCalls } : {}),
        ...(mapped.citations ? { citations: mapped.citations } : {}),
        ...(mapped.usage ? { usage: mapped.usage } : {}),
        ...(mapped.safety ? { safety: mapped.safety } : {}),
        ...(mapped.finishReason ? { finishReason: mapped.finishReason } : {}),
        timing: timing(context.startedAt, mapped.latencyMs ?? latencyMs),
        native,
      };
    } catch (error) {
      const latencyMs = Date.now() - started;
      if (abortReason === 'caller' || context.signal?.aborted) {
        return this.failure(context, latencyMs, 'TIMEOUT_ERROR', 'Execution aborted', false);
      }
      if (abortReason === 'timeout' || isAbortError(error)) {
        return this.failure(context, latencyMs, 'TIMEOUT_ERROR', 'HTTP request timed out', true);
      }
      const message = error instanceof Error ? error.message : 'HTTP request failed';
      return this.failure(context, latencyMs, 'NETWORK_ERROR', redactText(message, this.secrets()), true);
    } finally {
      clearTimeout(timer);
      context.signal?.removeEventListener('abort', onAbort);
    }
  }

  async collectEvidence(result: AIExecutionResult, context: ExecutionContext): Promise<ProviderEvidence> {
    return {
      adapterId: this.id,
      capturedAt: result.timing.completedAt,
      redacted: true,
      payload: redactValue({ caseId: context.caseId, native: result.native, error: result.error }, this.secrets()) as Record<string, unknown>,
    };
  }

  private headers(): Record<string, string> {
    const headers = { ...this.profile.headers };
    const apiKey = this.profile.apiKeyEnv ? process.env[this.profile.apiKeyEnv] : undefined;
    if (apiKey && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
    return headers;
  }

  private secrets(): string[] {
    const apiKey = this.profile.apiKeyEnv ? process.env[this.profile.apiKeyEnv] : undefined;
    return apiKey ? [...this.redactValues, apiKey] : [...this.redactValues];
  }

  private failure(
    context: ExecutionContext,
    latencyMs: number,
    code: AIErrorCode,
    message: string,
    retryable: boolean,
    providerCode?: string,
  ): AIExecutionResult {
    return {
      id: `${this.id}-failed`,
      adapterId: this.id,
      status: 'failed',
      output: {},
      timing: timing(context.startedAt, latencyMs),
      error: {
        code,
        message,
        retryable,
        ...(providerCode ? { providerCode } : {}),
      },
    };
  }
}

function timing(startedAt: string, latencyMs: number): AIExecutionResult['timing'] {
  return {
    startedAt,
    completedAt: new Date(Date.parse(startedAt) + latencyMs).toISOString(),
    latencyMs,
  };
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

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
