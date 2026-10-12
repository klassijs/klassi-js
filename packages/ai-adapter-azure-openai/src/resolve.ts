import type { AdapterHealth } from '@klassijs/ai-core';
import { assertAzureProfile, type AzureOpenAIAdapterProfile } from './profile.js';
import { redactText } from './redact.js';

export interface ResolvedAzureTarget {
  endpoint: string;
  deployment: string;
  executionApi: 'responses' | 'chat-completions';
  timeoutMs: number;
  secrets: string[];
  authorization: { type: 'api-key'; apiKey: string } | { type: 'entra' };
}

type HealthCheck = NonNullable<AdapterHealth['checks']>[number];

export function inspectAzureProfile(profile: AzureOpenAIAdapterProfile, env: NodeJS.ProcessEnv): { checks: HealthCheck[]; resolved?: ResolvedAzureTarget } {
  assertAzureProfile(profile);
  const checks: HealthCheck[] = [];
  const endpoint = readSetting(profile.endpoint, profile.endpointEnv, env);
  const deployment = readSetting(profile.deployment, profile.deploymentEnv, env);
  const endpointCheck = validateEndpoint(endpoint);
  checks.push(endpointCheck.check);
  checks.push(deployment.value ? { name: 'deployment', status: 'pass', message: 'deployment is configured' } : { name: 'deployment', status: 'fail', message: deployment.message });

  const credential = resolveCredential(profile, env);
  checks.push(credential.check);
  const executionApi = profile.executionApi ?? 'responses';
  checks.push({ name: 'api-surface', status: 'pass', message: `v1/${executionApi}` });

  if (!endpointCheck.endpoint || !deployment.value || !credential.authorization) {
    return { checks };
  }
  return {
    checks,
    resolved: {
      endpoint: endpointCheck.endpoint,
      deployment: deployment.value,
      executionApi,
      timeoutMs: profile.timeoutMs ?? 30_000,
      secrets: credential.secrets,
      authorization: credential.authorization,
    },
  };
}

function readSetting(literal: string | undefined, envName: string | undefined, env: NodeJS.ProcessEnv): { value?: string; message: string } {
  if (literal && literal.trim()) {
    return { value: literal.trim(), message: 'configured' };
  }
  if (!envName) {
    return { message: 'is not configured' };
  }
  const value = env[envName];
  if (!value || !value.trim()) {
    return { message: `${envName} is not set` };
  }
  return { value: value.trim(), message: 'configured' };
}

function validateEndpoint(setting: { value?: string; message: string }): { check: HealthCheck; endpoint?: string } {
  if (!setting.value) {
    return { check: { name: 'endpoint', status: 'fail', message: setting.message.startsWith('AZURE_') || setting.message.includes(' is not set') ? setting.message : 'endpoint is not configured' } };
  }
  let url: URL;
  try {
    url = new URL(setting.value);
  } catch {
    return { check: { name: 'endpoint', status: 'fail', message: 'endpoint must be an https URL' } };
  }
  if (url.username || url.password || url.search) {
    return { check: { name: 'endpoint', status: 'fail', message: 'endpoint must not include credentials' } };
  }
  if (url.protocol !== 'https:') {
    return { check: { name: 'endpoint', status: 'fail', message: 'endpoint must be an https URL' } };
  }
  return { check: { name: 'endpoint', status: 'pass', message: 'https endpoint is configured' }, endpoint: url.origin + url.pathname.replace(/\/$/, '') };
}

function resolveCredential(profile: AzureOpenAIAdapterProfile, env: NodeJS.ProcessEnv): { check: HealthCheck; authorization?: ResolvedAzureTarget['authorization']; secrets: string[] } {
  if (profile.credential.type === 'entra') {
    return { check: { name: 'credential', status: 'pass', message: 'using DefaultAzureCredential' }, authorization: { type: 'entra' }, secrets: [] };
  }
  const envName = profile.credential.apiKeyEnv;
  const apiKey = env[envName];
  if (!apiKey || !apiKey.trim()) {
    return { check: { name: 'credential', status: 'fail', message: `${envName} is not set` }, secrets: [] };
  }
  return {
    check: { name: 'credential', status: 'pass', message: `using ${envName}` },
    authorization: { type: 'api-key', apiKey },
    secrets: [apiKey],
  };
}

export function safeHealthMessage(message: string, secrets: readonly string[]): string {
  return redactText(message, secrets);
}
