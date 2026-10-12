import {
  type AdapterCapabilities,
  type AdapterHealth,
  type AdapterHealthContext,
  type AIExecutionRequest,
  type AIExecutionResult,
  type AIPlatformAdapter,
  type ExecutionContext,
  type ProviderEvidence,
} from '@klassijs/ai-core';
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

const ENTRA_SCOPE = 'https://cognitiveservices.azure.com/.default';

export interface AzureOpenAIAdapterOptions {
  profile: AzureOpenAIAdapterProfile;
  env?: NodeJS.ProcessEnv;
  fetch?: typeof fetch;
  tokenProvider?: () => Promise<string>;
}

export class AzureOpenAIAdapter implements AIPlatformAdapter {
  readonly id = AZURE_ADAPTER_ID;
  readonly name = 'Azure OpenAI';
  readonly version = AZURE_ADAPTER_VERSION;
  readonly profile: AzureOpenAIAdapterProfile;

  readonly #env: NodeJS.ProcessEnv;
  readonly #fetch: typeof fetch;
  readonly #tokenProvider?: () => Promise<string>;

  constructor(options: AzureOpenAIAdapterOptions) {
    assertAzureProfile(options.profile);
    this.profile = options.profile;
    this.#env = options.env ?? process.env;
    this.#fetch = options.fetch ?? fetch;
    this.#tokenProvider = options.tokenProvider;
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

    try {
      const headers = await this.authorizationHeaders(inspected.resolved);
      const response = await this.#fetch(`${inspected.resolved.endpoint}/openai/v1/models`, {
        method: 'GET',
        headers,
        signal: context.signal ?? AbortSignal.timeout(inspected.resolved.timeoutMs),
      });
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
    }
  }

  async execute(_request: AIExecutionRequest, context: ExecutionContext): Promise<AIExecutionResult> {
    const completedAt = new Date().toISOString();
    return {
      id: `${this.id}-not-implemented`,
      adapterId: this.id,
      status: 'failed',
      output: {},
      timing: { startedAt: context.startedAt, completedAt, latencyMs: 0 },
      error: { code: 'PROVIDER_UNAVAILABLE', message: 'Azure execution is not implemented', retryable: false },
    };
  }

  async collectEvidence(result: AIExecutionResult, _context: ExecutionContext): Promise<ProviderEvidence> {
    return {
      adapterId: this.id,
      capturedAt: new Date().toISOString(),
      redacted: true,
      payload: redactValue({ status: result.status }, []) as Record<string, unknown>,
    };
  }

  async authorizationHeaders(resolved: ResolvedAzureTarget): Promise<Record<string, string>> {
    if (resolved.authorization.type === 'api-key') {
      return { 'api-key': resolved.authorization.apiKey };
    }
    const token = this.#tokenProvider ? await this.#tokenProvider() : await acquireEntraToken(resolved.timeoutMs);
    resolved.secrets.push(token);
    return { authorization: `Bearer ${token}` };
  }
}

async function acquireEntraToken(timeoutMs: number): Promise<string> {
  const identity = (await import('@azure/identity')) as {
    DefaultAzureCredential: new () => { getToken(scope: string): Promise<{ token: string } | null> };
  };
  const credential = new identity.DefaultAzureCredential();
  const token = await Promise.race([
    credential.getToken(ENTRA_SCOPE),
    new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Entra token request timed out')), timeoutMs);
    }),
  ]);
  if (!token?.token) {
    throw new Error('Entra credential did not return a token');
  }
  return token.token;
}

function redactChecks(checks: NonNullable<AdapterHealth['checks']>, secrets: readonly string[]): NonNullable<AdapterHealth['checks']> {
  return checks.map((check) => ({
    ...check,
    ...(check.message ? { message: redactText(check.message, secrets) } : {}),
  }));
}
