import type { ExecutionPolicy } from '../policy.js';
import { DEFAULT_EXECUTION_POLICY } from '../policy.js';
import type { AIErrorCode } from '../errors.js';
import type { AIExecutionResult } from '../execution.js';

const INFRASTRUCTURE_RETRY_CODES = new Set<AIErrorCode>([
  'RATE_LIMIT_ERROR',
  'NETWORK_ERROR',
  'TIMEOUT_ERROR',
  'PROVIDER_UNAVAILABLE',
  'PROVIDER_RESPONSE_ERROR',
]);

export function mergeExecutionPolicy(
  ...layers: Array<Partial<ExecutionPolicy> | undefined>
): ExecutionPolicy {
  return layers.reduce<ExecutionPolicy>((policy, layer) => {
    if (!layer) {
      return policy;
    }
    return {
      ...policy,
      ...layer,
      retry: {
        ...policy.retry,
        ...layer.retry,
      },
    };
  }, DEFAULT_EXECUTION_POLICY);
}

/** A completed model answer is a sample, not an infrastructure failure. */
export function isInfrastructureRetry(result: AIExecutionResult): boolean {
  if (result.status !== 'failed' || !result.error?.retryable) {
    return false;
  }
  return INFRASTRUCTURE_RETRY_CODES.has(result.error.code);
}

export function retryDelayMs(policy: ExecutionPolicy, retryIndex: number): number {
  const grown = policy.retry.initialDelayMs * policy.retry.backoffMultiplier ** retryIndex;
  const capped = Math.min(policy.retry.maxDelayMs, grown);
  if (!policy.retry.jitter) {
    return capped;
  }
  return Math.round(capped * (0.5 + Math.random() * 0.5));
}
