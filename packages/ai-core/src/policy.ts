export interface ExecutionPolicy {
  samples: number;
  concurrency: number;
  timeoutMs: number;
  retry: {
    maxInfrastructureRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    jitter: boolean;
  };
  failFast: boolean;
}

/** Initial defaults from the technical specification. Configuration may replace them. */
export const DEFAULT_EXECUTION_POLICY: ExecutionPolicy = {
  samples: 1,
  concurrency: 1,
  timeoutMs: 30000,
  retry: {
    maxInfrastructureRetries: 2,
    initialDelayMs: 500,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    jitter: true,
  },
  failFast: false,
};
