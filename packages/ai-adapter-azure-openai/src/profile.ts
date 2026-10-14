import { AIEvaluationError } from '@klassijs/ai-core';

export interface AzureOpenAICredentialConfig {
  type: 'api-key';
  apiKeyEnv: string;
}

/** Environment variable names and non-secret settings. Credential values are resolved later. */
export interface AzureOpenAIAdapterProfile {
  endpoint?: string;
  endpointEnv?: string;
  deployment?: string;
  deploymentEnv?: string;
  credential: AzureOpenAICredentialConfig;
  executionApi?: 'responses' | 'chat-completions';
  timeoutMs?: number;
  maxRetries?: number;
  providerOptions?: Record<string, unknown>;
}

export const AZURE_ADAPTER_ID = 'azure-openai';
export const AZURE_JUDGE_ADAPTER_ID = 'azure-openai-judge';
export const AZURE_ADAPTER_VERSION = '0.1.0';

export const defaultAzureProfile: AzureOpenAIAdapterProfile = {
  endpointEnv: 'AZURE_OPENAI_ENDPOINT',
  deploymentEnv: 'AZURE_OPENAI_DEPLOYMENT',
  credential: { type: 'api-key', apiKeyEnv: 'AZURE_OPENAI_API_KEY' },
  executionApi: 'responses',
  timeoutMs: 30_000,
};

export const judgeAzureProfile: AzureOpenAIAdapterProfile = {
  endpointEnv: 'AZURE_OPENAI_ENDPOINT',
  deploymentEnv: 'AZURE_OPENAI_JUDGE_DEPLOYMENT',
  credential: { type: 'api-key', apiKeyEnv: 'AZURE_OPENAI_API_KEY' },
  executionApi: 'responses',
  timeoutMs: 30_000,
};

const ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function assertAzureProfile(profile: AzureOpenAIAdapterProfile): void {
  if (!profile.endpoint && !profile.endpointEnv) {
    throw new AIEvaluationError('CONFIG_ERROR', 'Azure adapter requires an endpoint or endpointEnv');
  }
  if (profile.endpointEnv !== undefined && !ENV_NAME.test(profile.endpointEnv)) {
    throw new AIEvaluationError('CONFIG_ERROR', 'Azure adapter endpointEnv must be an environment variable name');
  }
  if (profile.deploymentEnv !== undefined && !ENV_NAME.test(profile.deploymentEnv)) {
    throw new AIEvaluationError('CONFIG_ERROR', 'Azure adapter deploymentEnv must be an environment variable name');
  }
  if (!profile.deployment && !profile.deploymentEnv) {
    throw new AIEvaluationError('CONFIG_ERROR', 'Azure adapter requires a deployment or deploymentEnv');
  }
  if (profile.timeoutMs !== undefined && (!Number.isInteger(profile.timeoutMs) || profile.timeoutMs < 1)) {
    throw new AIEvaluationError('CONFIG_ERROR', 'Azure adapter timeoutMs must be a positive integer');
  }
  if (profile.maxRetries !== undefined && (!Number.isInteger(profile.maxRetries) || profile.maxRetries < 0)) {
    throw new AIEvaluationError('CONFIG_ERROR', 'Azure adapter maxRetries must be a non-negative integer');
  }
  if (profile.executionApi !== undefined && profile.executionApi !== 'responses' && profile.executionApi !== 'chat-completions') {
    throw new AIEvaluationError('CONFIG_ERROR', 'Azure adapter executionApi must be responses or chat-completions');
  }
  if (profile.credential?.type !== 'api-key' || !ENV_NAME.test(profile.credential.apiKeyEnv)) {
    throw new AIEvaluationError('CONFIG_ERROR', 'Azure adapter apiKeyEnv must be an environment variable name');
  }
}
