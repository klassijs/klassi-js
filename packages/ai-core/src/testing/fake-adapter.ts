import type { AdapterCapabilities, AdapterHealth, AdapterHealthContext, AIPlatformAdapter, ProviderEvidence } from '../adapter.js';
import { AIEvaluationError, type AIErrorCode } from '../errors.js';
import type { AIExecutionRequest, AIExecutionResult, ExecutionContext } from '../execution.js';
import type { AdapterId } from '../identifiers.js';
import type { AdapterScript } from './scripts.js';

const DEFAULT_CAPABILITIES: AdapterCapabilities = {
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

export interface FakeAIAdapterOptions {
  id?: AdapterId;
  capabilities?: Partial<AdapterCapabilities>;
  redactValues?: string[];
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    if (signal?.aborted) {
      clearTimeout(timer);
      resolve();
      return;
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function redactString(value: string, secrets: string[]): string {
  let output = value.replace(/Bearer\s+\S+/g, 'Bearer [REDACTED]');
  for (const secret of secrets) {
    if (secret) {
      output = output.split(secret).join('[REDACTED]');
    }
  }
  return output;
}

function redactValue(value: unknown, secrets: string[]): unknown {
  if (typeof value === 'string') {
    return redactString(value, secrets);
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, secrets));
  }
  if (value && typeof value === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      redacted[key] = redactValue(entry, secrets);
    }
    return redacted;
  }
  return value;
}

function requestHasImage(request: AIExecutionRequest): boolean {
  return request.messages.some((message) => {
    return Array.isArray(message.content) && message.content.some((part) => part.type === 'image');
  });
}

function failedResult(
  adapterId: string,
  startedAt: string,
  latencyMs: number,
  code: AIErrorCode,
  message: string,
  retryable: boolean,
  providerCode?: string,
): AIExecutionResult {
  const completedAt = new Date(Date.parse(startedAt) + latencyMs).toISOString();
  return {
    id: `${adapterId}-failed`,
    adapterId,
    status: 'failed',
    output: {},
    timing: { startedAt, completedAt, latencyMs },
    error: { code, message, retryable, ...(providerCode ? { providerCode } : {}) },
  };
}

/** Scripted adapter for core tests. It does not call a model provider. */
export class FakeAIAdapter implements AIPlatformAdapter {
  readonly id: AdapterId;
  readonly name = 'Fake AI adapter';
  readonly version = '0.1.0';

  private readonly capabilitiesValue: AdapterCapabilities;
  private readonly redactValues: string[];
  private readonly scripts: AdapterScript[] = [];

  constructor(options: FakeAIAdapterOptions = {}) {
    this.id = options.id ?? 'fake';
    this.capabilitiesValue = { ...DEFAULT_CAPABILITIES, ...options.capabilities };
    this.redactValues = options.redactValues ?? [];
  }

  useScript(script: AdapterScript): void {
    this.scripts.push(script);
  }

  async capabilities(): Promise<AdapterCapabilities> {
    return this.capabilitiesValue;
  }

  async healthCheck(context: AdapterHealthContext): Promise<AdapterHealth> {
    return {
      status: 'healthy',
      checkedAt: '2026-01-01T00:00:00.000Z',
      checks: [{ name: context.profile ?? 'scripted-adapter', status: 'pass' }],
    };
  }

  async execute(request: AIExecutionRequest, context: ExecutionContext): Promise<AIExecutionResult> {
    if (context.signal?.aborted) {
      return failedResult(this.id, context.startedAt, 0, 'TIMEOUT_ERROR', 'Execution aborted', false);
    }

    if (requestHasImage(request) && !this.capabilitiesValue.images) {
      return failedResult(
        this.id,
        context.startedAt,
        0,
        'ADAPTER_CAPABILITY_ERROR',
        'Adapter does not support image content',
        false,
      );
    }

    const script = this.scripts.shift() ?? { kind: 'success', text: '' };
    const latencyMs = 'latencyMs' in script ? script.latencyMs ?? 0 : 0;
    await wait(latencyMs, context.signal);

    if (context.signal?.aborted) {
      return failedResult(this.id, context.startedAt, latencyMs, 'TIMEOUT_ERROR', 'Execution aborted', false);
    }

    if (script.kind === 'timeout') {
      return failedResult(this.id, context.startedAt, latencyMs, 'TIMEOUT_ERROR', 'Scripted timeout', true);
    }
    if (script.kind === 'rate-limit') {
      return failedResult(this.id, context.startedAt, latencyMs, 'RATE_LIMIT_ERROR', 'Scripted rate limit', true);
    }
    if (script.kind === 'authentication') {
      return failedResult(
        this.id,
        context.startedAt,
        latencyMs,
        'AUTHENTICATION_ERROR',
        redactString(script.message ?? 'Authentication failed', this.redactValues),
        false,
      );
    }
    if (script.kind === 'provider-failure') {
      return failedResult(
        this.id,
        context.startedAt,
        latencyMs,
        'PROVIDER_RESPONSE_ERROR',
        redactString(script.message ?? 'Provider request failed', this.redactValues),
        false,
        script.providerCode,
      );
    }

    const native = redactValue({ request }, this.redactValues);
    return {
      id: `${this.id}-completed`,
      adapterId: this.id,
      status: 'completed',
      output: {
        ...(script.text !== undefined ? { text: script.text } : {}),
        ...(script.structured !== undefined ? { structured: script.structured } : {}),
      },
      ...(script.toolCalls ? { toolCalls: script.toolCalls } : {}),
      ...(script.citations ? { citations: script.citations } : {}),
      ...(script.usage ? { usage: script.usage } : {}),
      ...(script.safety ? { safety: script.safety } : {}),
      ...(script.finishReason ? { finishReason: script.finishReason } : {}),
      timing: {
        startedAt: context.startedAt,
        completedAt: new Date(Date.parse(context.startedAt) + latencyMs).toISOString(),
        latencyMs,
      },
      native,
    };
  }

  async collectEvidence(result: AIExecutionResult, context: ExecutionContext): Promise<ProviderEvidence> {
    return {
      adapterId: this.id,
      capturedAt: result.timing.completedAt,
      redacted: true,
      payload: redactValue({ caseId: context.caseId, native: result.native }, this.redactValues) as Record<string, unknown>,
    };
  }
}

export function assertNoSecrets(value: unknown, secrets: string[]): void {
  const serialised = JSON.stringify(value);
  for (const secret of secrets) {
    if (secret && serialised.includes(secret)) {
      throw new AIEvaluationError('EVIDENCE_ERROR', 'Redacted evidence still contains a secret');
    }
  }
}
