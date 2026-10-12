import type { AIExecutionRequest, ExecutionContext } from '../execution.js';
import type { AIUsage, NormalizedCitation, NormalizedSafetyResult, NormalizedToolCall } from '../execution.js';

export interface SuccessScript {
  kind: 'success';
  text?: string;
  structured?: unknown;
  toolCalls?: NormalizedToolCall[];
  citations?: NormalizedCitation[];
  usage?: AIUsage;
  latencyMs?: number;
  safety?: NormalizedSafetyResult[];
  finishReason?: string;
}

export interface TimeoutScript {
  kind: 'timeout';
  latencyMs?: number;
}

export interface RateLimitScript {
  kind: 'rate-limit';
  latencyMs?: number;
}

export interface ProviderFailureScript {
  kind: 'provider-failure';
  message?: string;
  providerCode?: string;
}

export interface AuthenticationScript {
  kind: 'authentication';
  message?: string;
}

export type AdapterScript = SuccessScript | TimeoutScript | RateLimitScript | ProviderFailureScript | AuthenticationScript;

export interface ScriptableAdapter {
  useScript(script: AdapterScript): void;
}

export function createTestExecutionContext(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    runId: 'run-1',
    suiteId: 'suite-1',
    caseId: 'case-1',
    sampleId: 'sample-1',
    startedAt: '2026-01-01T00:00:00.000Z',
    evidence: {
      async write() {
        return 'artifact-1';
      },
    },
    logger: {
      debug() {},
      info() {},
      warn() {},
      error() {},
    },
    ...overrides,
  };
}

export function textRequest(text = 'hello'): AIExecutionRequest {
  return { messages: [{ role: 'user', content: text }] };
}
