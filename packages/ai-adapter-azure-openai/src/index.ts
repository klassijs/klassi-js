export {
  AZURE_ADAPTER_ID,
  AZURE_JUDGE_ADAPTER_ID,
  AZURE_ADAPTER_VERSION,
  assertAzureProfile,
  defaultAzureProfile,
  judgeAzureProfile,
  type AzureOpenAIAdapterProfile,
  type AzureOpenAICredentialConfig,
} from './profile.js';
export { AzureOpenAIAdapter, type AzureOpenAIAdapterOptions } from './adapter.js';
export { runAzureDoctor, azureConfigurationIssues, type AzureDoctorOptions } from './doctor.js';
