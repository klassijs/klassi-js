import type { AIExecutionRequest, AIMessage, AIUsage, NormalizedCitation, NormalizedSafetyResult, NormalizedToolCall } from '@klassijs/ai-core';
import type { HttpAdapterProfile } from './profile.js';

export function mapRequest(request: AIExecutionRequest, profile: HttpAdapterProfile): Record<string, unknown> {
  if (profile.requestTemplate === 'prompt') {
    return { prompt: messageText(request.messages) };
  }
  return omitEmpty({
    messages: request.messages,
    model: request.model,
    temperature: request.temperature,
    topP: request.topP,
    maxOutputTokens: request.maxOutputTokens,
    seed: request.seed,
    responseFormat: request.responseFormat,
    tools: request.tools,
    toolChoice: request.toolChoice,
  });
}

export interface MappedResponse {
  text?: string;
  structured?: unknown;
  usage?: AIUsage;
  citations?: NormalizedCitation[];
  toolCalls?: NormalizedToolCall[];
  safety?: NormalizedSafetyResult[];
  finishReason?: string;
  latencyMs?: number;
  providerCode?: string;
}

export function mapResponse(body: unknown, profile: HttpAdapterProfile): MappedResponse {
  if (!body || typeof body !== 'object') {
    return typeof body === 'string' ? { text: body } : {};
  }
  const record = body as Record<string, unknown>;
  const mapped = mapCommonPayload(record);
  const textPath = profile.responseMapping?.text;
  const structuredPath = profile.responseMapping?.structured;
  const finishPath = profile.responseMapping?.finishReason;
  return {
    ...mapped,
    ...(textPath ? { text: asString(readPath(record, textPath)) ?? mapped.text } : {}),
    ...(structuredPath ? { structured: readPath(record, structuredPath) } : {}),
    ...(finishPath ? { finishReason: asString(readPath(record, finishPath)) ?? mapped.finishReason } : {}),
  };
}

export function messageText(messages: AIMessage[]): string {
  return messages
    .map((message) => (typeof message.content === 'string' ? message.content : message.content.filter((part) => part.type === 'text').map((part) => part.text).join('')))
    .filter((text) => text.length > 0)
    .join('\n');
}

export function requestHasImage(request: AIExecutionRequest): boolean {
  return request.messages.some((message) => Array.isArray(message.content) && message.content.some((part) => part.type === 'image'));
}

function mapCommonPayload(record: Record<string, unknown>): MappedResponse {
  const choice = firstChoice(record);
  const content = choice?.message && typeof choice.message === 'object' ? (choice.message as { content?: unknown; tool_calls?: unknown }).content : undefined;
  const toolCalls = normalizeToolCalls(record.toolCalls) ?? normalizeToolCalls((choice?.message as { tool_calls?: unknown } | undefined)?.tool_calls);
  return {
    text: asString(record.text) ?? asString((record.output as { text?: unknown } | undefined)?.text) ?? asString(content),
    structured: record.structured ?? (record.output as { structured?: unknown } | undefined)?.structured,
    usage: normalizeUsage(record.usage),
    citations: Array.isArray(record.citations) ? (record.citations as NormalizedCitation[]) : undefined,
    toolCalls,
    safety: Array.isArray(record.safety) ? (record.safety as NormalizedSafetyResult[]) : undefined,
    finishReason: asString(record.finishReason) ?? asString(choice?.finish_reason),
    latencyMs: typeof record.latencyMs === 'number' ? record.latencyMs : undefined,
    providerCode: asString(record.code) ?? asString(record.providerCode) ?? asString((record.error as { code?: unknown } | undefined)?.code),
  };
}

function firstChoice(record: Record<string, unknown>): { message?: unknown; finish_reason?: unknown } | undefined {
  const choices = record.choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== 'object') {
    return undefined;
  }
  return choices[0] as { message?: unknown; finish_reason?: unknown };
}

function normalizeUsage(value: unknown): AIUsage | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const usage = value as Record<string, unknown>;
  const mapped = {
    inputTokens: numberOr(usage.inputTokens, usage.prompt_tokens),
    outputTokens: numberOr(usage.outputTokens, usage.completion_tokens),
    totalTokens: numberOr(usage.totalTokens, usage.total_tokens),
  };
  return mapped.inputTokens === undefined && mapped.outputTokens === undefined && mapped.totalTokens === undefined ? undefined : mapped;
}

function normalizeToolCalls(value: unknown): NormalizedToolCall[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value.map((item) => {
    const call = item as { id?: unknown; name?: unknown; status?: unknown; arguments?: unknown; function?: { name?: unknown; arguments?: unknown } };
    const name = asString(call.name) ?? asString(call.function?.name) ?? 'tool';
    return {
      id: asString(call.id) ?? name,
      name,
      ...(call.arguments !== undefined ? { arguments: call.arguments } : {}),
      ...(call.function?.arguments !== undefined ? { arguments: call.function.arguments } : {}),
      ...(call.status === 'requested' || call.status === 'completed' || call.status === 'failed' ? { status: call.status } : {}),
    };
  });
}

function readPath(value: unknown, expression: string): unknown {
  return expression.split('.').reduce<unknown>((current, token) => {
    if (!current || typeof current !== 'object' || !(token in current)) {
      return undefined;
    }
    return (current as Record<string, unknown>)[token];
  }, value);
}

function omitEmpty(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function numberOr(first: unknown, second: unknown): number | undefined {
  if (typeof first === 'number') {
    return first;
  }
  return typeof second === 'number' ? second : undefined;
}
