import type { AdapterId } from './identifiers.js';
import type { AIExecutionRequest, AIExecutionResult, ExecutionContext } from './execution.js';

export interface AdapterCapabilities {
  text: boolean;
  images: boolean;
  streaming: boolean;
  structuredOutput: boolean;
  toolCalling: boolean;
  multiTurn: boolean;
  usage: boolean;
  contentSafetyMetadata: boolean;
  seed: boolean;
}

export const ADAPTER_CAPABILITY_KEYS: readonly (keyof AdapterCapabilities)[] = [
  'text',
  'images',
  'streaming',
  'structuredOutput',
  'toolCalling',
  'multiTurn',
  'usage',
  'contentSafetyMetadata',
  'seed',
];

export interface AdapterHealthContext {
  profile?: string;
  signal?: AbortSignal;
}

export interface AdapterHealth {
  status: 'healthy' | 'unhealthy';
  checkedAt: string;
  message?: string;
  checks?: Array<{
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }>;
}

export interface ProviderEvidence {
  adapterId: AdapterId;
  capturedAt: string;
  redacted: true;
  payload?: Record<string, unknown>;
}

export interface AIPlatformAdapter {
  readonly id: AdapterId;
  readonly name: string;
  readonly version: string;
  capabilities(): Promise<AdapterCapabilities>;
  healthCheck(context: AdapterHealthContext): Promise<AdapterHealth>;
  execute(request: AIExecutionRequest, context: ExecutionContext): Promise<AIExecutionResult>;
  collectEvidence?(result: AIExecutionResult, context: ExecutionContext): Promise<ProviderEvidence>;
}

export interface AdapterDescriptor {
  id: AdapterId;
  name: string;
  version: string;
}
