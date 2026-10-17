import { AIEvaluationError, type AIErrorCode } from '@klassijs/ai-core';

/** Provider-neutral profile for a custom HTTP AI endpoint. Secrets are environment variable names, not values. */
export interface HttpAdapterProfile {
  endpoint: string;
  method?: 'POST';
  headers?: Record<string, string>;
  timeoutMs?: number;
  apiKeyEnv?: string;
  requestTemplate?: 'messages' | 'prompt';
  responseMapping?: {
    text?: string;
    structured?: string;
    finishReason?: string;
  };
}

export function assertHttpProfile(profile: HttpAdapterProfile): void {
  let url: URL;
  try {
    url = new URL(profile.endpoint);
  } catch {
    throw new AIEvaluationError('CONFIG_ERROR', 'HTTP adapter endpoint must be an absolute URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new AIEvaluationError('CONFIG_ERROR', 'HTTP adapter endpoint must use http or https');
  }
  if (profile.timeoutMs !== undefined && (!Number.isInteger(profile.timeoutMs) || profile.timeoutMs < 1)) {
    throw new AIEvaluationError('CONFIG_ERROR', 'HTTP adapter timeoutMs must be a positive integer');
  }
  if (profile.apiKeyEnv !== undefined && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(profile.apiKeyEnv)) {
    throw new AIEvaluationError('CONFIG_ERROR', 'HTTP adapter apiKeyEnv must be an environment variable name');
  }
}

export function httpStatusError(status: number): { code: AIErrorCode; retryable: boolean } {
  if (status === 401) {
    return { code: 'AUTHENTICATION_ERROR', retryable: false };
  }
  if (status === 403) {
    return { code: 'AUTHORIZATION_ERROR', retryable: false };
  }
  if (status === 408 || status === 504) {
    return { code: 'TIMEOUT_ERROR', retryable: true };
  }
  if (status === 429) {
    return { code: 'RATE_LIMIT_ERROR', retryable: true };
  }
  if (status === 503) {
    return { code: 'PROVIDER_UNAVAILABLE', retryable: true };
  }
  return { code: 'PROVIDER_RESPONSE_ERROR', retryable: false };
}
