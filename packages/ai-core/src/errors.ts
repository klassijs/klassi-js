export type AIErrorCode =
  | 'CONFIG_ERROR'
  | 'DATASET_ERROR'
  | 'ADAPTER_NOT_FOUND'
  | 'ADAPTER_CAPABILITY_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_REQUEST_ERROR'
  | 'PROVIDER_RESPONSE_ERROR'
  | 'NORMALIZATION_ERROR'
  | 'EVALUATOR_ERROR'
  | 'EVIDENCE_ERROR'
  | 'REPORTER_ERROR'
  | 'BASELINE_ERROR'
  | 'QUALITY_GATE_FAILURE'
  | 'SECURITY_FAILURE'
  | 'INTERNAL_ERROR';

export interface NormalizedExecutionError {
  code: AIErrorCode;
  message: string;
  retryable: boolean;
  providerCode?: string;
}

export class AIEvaluationError extends Error {
  readonly code: AIErrorCode;

  constructor(code: AIErrorCode, message: string) {
    super(message);
    this.name = 'AIEvaluationError';
    this.code = code;
  }
}
