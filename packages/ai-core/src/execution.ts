import type { GeneratedArtifact } from './artefacts.js';
import type { AdapterId, CaseId, RunId, SampleId, SuiteId } from './identifiers.js';
import type { NormalizedExecutionError } from './errors.js';
import type { AIMessage } from './messages.js';

export interface AIUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cachedInputTokens?: number;
  reasoningTokens?: number;
  estimatedCost?: number;
  currency?: string;
}

export interface NormalizedToolCall {
  id: string;
  name: string;
  arguments?: unknown;
  result?: unknown;
  status?: 'requested' | 'completed' | 'failed';
}

export interface NormalizedCitation {
  id?: string;
  title?: string;
  uri?: string;
  sourceId?: string;
  startIndex?: number;
  endIndex?: number;
  metadata?: Record<string, unknown>;
}

export interface NormalizedSafetyResult {
  category: string;
  action?: 'allow' | 'block' | 'review';
  severity?: 'info' | 'low' | 'medium' | 'high' | 'critical';
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface AIResponseFormat {
  type: 'text' | 'json';
  schema?: Record<string, unknown>;
}

export interface AIToolDefinition {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  /** Function tools omit this. Hosted tools such as web_search are sent as the provider tool type. */
  type?: 'function' | 'web_search' | 'web_search_preview' | 'file_search';
  vectorStoreIds?: string[];
}

export type AIToolChoice = 'auto' | 'none' | 'required' | { type: 'tool'; name: string };

export interface AIExecutionRequest {
  messages: AIMessage[];
  model?: string;
  deployment?: string;
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  seed?: number;
  responseFormat?: AIResponseFormat;
  tools?: AIToolDefinition[];
  toolChoice?: AIToolChoice;
  metadata?: Record<string, unknown>;
  /** Escape hatch for adapter authors. Core evaluators and gates must not read this. */
  providerOptions?: Record<string, unknown>;
}

export interface EvidenceWriter {
  write(artifact: { name: string; body: unknown }): Promise<string>;
}

export interface KlassiLogger {
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, metadata?: Record<string, unknown>): void;
}

/** Credentials must not be placed on this context. */
export interface ExecutionContext {
  runId: RunId;
  suiteId: SuiteId;
  caseId: CaseId;
  sampleId: SampleId;
  startedAt: string;
  deadline?: string;
  signal?: AbortSignal;
  evidence: EvidenceWriter;
  logger: KlassiLogger;
  metadata?: Record<string, unknown>;
}

export interface AIExecutionResult {
  id: string;
  adapterId: AdapterId;
  status: 'completed' | 'incomplete' | 'blocked' | 'failed';
  output: {
    text?: string;
    messages?: AIMessage[];
    structured?: unknown;
  };
  /** Engineering artefacts extracted from the reply. Evaluators may score these as well as prose. */
  artefacts?: GeneratedArtifact[];
  toolCalls?: NormalizedToolCall[];
  citations?: NormalizedCitation[];
  usage?: AIUsage;
  timing: {
    startedAt: string;
    completedAt: string;
    latencyMs: number;
    firstTokenLatencyMs?: number;
  };
  model?: {
    requested?: string;
    deployment?: string;
    providerModel?: string;
    providerVersion?: string;
  };
  safety?: NormalizedSafetyResult[];
  finishReason?: string;
  /** Redacted provider payload. Core evaluators must not depend on this field. */
  native?: unknown;
  error?: NormalizedExecutionError;
}
