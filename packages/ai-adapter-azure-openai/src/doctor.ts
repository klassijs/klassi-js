import { AIEvaluationError, type AdapterHealth } from '@klassijs/ai-core';
import { AzureOpenAIAdapter } from './adapter.js';
import { AZURE_ADAPTER_ID, defaultAzureProfile, type AzureOpenAIAdapterProfile } from './profile.js';
import { inspectAzureProfile } from './resolve.js';

export interface AzureDoctorOptions {
  platform: string;
  env?: NodeJS.ProcessEnv;
  fetch?: typeof fetch;
  tokenProvider?: () => Promise<string>;
  profile?: AzureOpenAIAdapterProfile;
  write?: (line: string) => void;
}

export async function runAzureDoctor(options: AzureDoctorOptions): Promise<number> {
  const write = options.write ?? ((line: string) => console.log(line));
  if (options.platform !== AZURE_ADAPTER_ID) {
    write(`Unknown AI platform "${options.platform}". Supported platform: ${AZURE_ADAPTER_ID}`);
    return 2;
  }

  try {
    const adapter = new AzureOpenAIAdapter({
      profile: options.profile ?? defaultAzureProfile,
      env: options.env,
      fetch: options.fetch,
      tokenProvider: options.tokenProvider,
    });
    const health = await adapter.healthCheck({});
    write(`${AZURE_ADAPTER_ID}: ${health.status}`);
    for (const check of health.checks ?? []) {
      write(formatCheck(check));
    }
    return doctorExitCode(health);
  } catch (error) {
    write(error instanceof AIEvaluationError ? error.message : 'Azure configuration is invalid');
    return 2;
  }
}

function formatCheck(check: NonNullable<AdapterHealth['checks']>[number]): string {
  return check.message ? `${check.name}: ${check.status} — ${check.message}` : `${check.name}: ${check.status}`;
}

function doctorExitCode(health: AdapterHealth): number {
  if (health.status === 'healthy') {
    return 0;
  }
  const configFailed = (health.checks ?? []).some((check) => check.status === 'fail' && check.name !== 'reachability');
  return configFailed ? 2 : 3;
}

export function azureConfigurationIssues(env: NodeJS.ProcessEnv = process.env, profile: AzureOpenAIAdapterProfile = defaultAzureProfile): string[] {
  try {
    const inspected = inspectAzureProfile(profile, env);
    return inspected.checks.filter((check) => check.status === 'fail').map((check) => (check.message ? `${check.name}: ${check.message}` : check.name));
  } catch (error) {
    return [error instanceof Error ? error.message : 'Azure configuration is invalid'];
  }
}
