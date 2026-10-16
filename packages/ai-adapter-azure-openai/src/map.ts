import type {
  AIErrorCode,
  AIExecutionRequest,
  AIMessage,
  AIToolChoice,
  AIUsage,
  NormalizedCitation,
  NormalizedSafetyResult,
  NormalizedToolCall,
} from '@klassijs/ai-core';

export interface AzureCall {
  path: string;
  body: Record<string, unknown>;
  deployment: string;
  requested: string;
}

export interface AzureMappedOutput {
  id?: string;
  status: 'completed' | 'incomplete' | 'blocked' | 'failed';
  text?: string;
  structured?: unknown;
  toolCalls?: NormalizedToolCall[];
  citations?: NormalizedCitation[];
  usage?: AIUsage;
  safety?: NormalizedSafetyResult[];
  finishReason?: string;
  providerModel?: string;
}

const SECRET_OPTION_KEYS = new Set(['api-key', 'api_key', 'authorization']);

export function mapAzureCall(request: AIExecutionRequest, target: { deployment: string; executionApi: 'responses' | 'chat-completions' }): AzureCall {
  const deployment = request.deployment?.trim() || target.deployment;
  const requested = request.model?.trim() || deployment;
  if (target.executionApi === 'chat-completions') {
    return { path: '/openai/v1/chat/completions', deployment, requested, body: chatBody(request, deployment) };
  }
  return { path: '/openai/v1/responses', deployment, requested, body: responsesBody(request, deployment) };
}

export function mapAzureOutput(body: unknown): AzureMappedOutput {
  if (!body || typeof body !== 'object') {
    return { status: 'completed', ...(typeof body === 'string' && body ? { text: body } : {}) };
  }
  const record = body as Record<string, unknown>;
  if (Array.isArray(record.choices)) {
    return mapChatOutput(record);
  }
  return mapResponsesOutput(record);
}

export function providerError(body: unknown): { message?: string; providerCode?: string } {
  if (!body || typeof body !== 'object') {
    return typeof body === 'string' && body ? { message: body } : {};
  }
  const error = (body as { error?: unknown }).error;
  if (!error || typeof error !== 'object') {
    return { providerCode: asString((body as { code?: unknown }).code) };
  }
  const record = error as { message?: unknown; code?: unknown };
  return { message: asString(record.message), providerCode: asString(record.code) };
}

export function requestHasImage(request: AIExecutionRequest): boolean {
  return request.messages.some((message) => Array.isArray(message.content) && message.content.some((part) => part.type === 'image'));
}

function responsesBody(request: AIExecutionRequest, deployment: string): Record<string, unknown> {
  return omitEmpty({
    model: deployment,
    input: request.messages.map(responsesMessage),
    temperature: request.temperature,
    top_p: request.topP,
    max_output_tokens: request.maxOutputTokens,
    seed: request.seed,
    tools: request.tools?.map((tool) => omitEmpty({ type: 'function', name: tool.name, description: tool.description, parameters: tool.parameters })),
    tool_choice: responsesToolChoice(request.toolChoice),
    text: responseTextFormat(request),
    ...safeOptions(request.providerOptions),
  });
}

function chatBody(request: AIExecutionRequest, deployment: string): Record<string, unknown> {
  return omitEmpty({
    model: deployment,
    messages: request.messages.map(chatMessage),
    temperature: request.temperature,
    top_p: request.topP,
    max_completion_tokens: request.maxOutputTokens,
    seed: request.seed,
    tools: request.tools?.map((tool) => ({
      type: 'function',
      function: omitEmpty({ name: tool.name, description: tool.description, parameters: tool.parameters }),
    })),
    tool_choice: chatToolChoice(request.toolChoice),
    response_format: chatResponseFormat(request),
    ...safeOptions(request.providerOptions),
  });
}

function responsesMessage(message: AIMessage): Record<string, unknown> {
  if (message.role === 'tool') {
    return { type: 'function_call_output', call_id: message.toolCallId ?? message.name ?? 'tool', output: messageText(message) };
  }
  return { role: message.role, content: messageText(message) };
}

function chatMessage(message: AIMessage): Record<string, unknown> {
  return omitEmpty({
    role: message.role === 'developer' ? 'system' : message.role,
    content: messageText(message),
    ...(message.role === 'tool' ? { tool_call_id: message.toolCallId ?? message.name } : {}),
  });
}

function messageText(message: AIMessage): string {
  if (typeof message.content === 'string') {
    return message.content;
  }
  return message.content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

function mapResponsesOutput(record: Record<string, unknown>): AzureMappedOutput {
  const output = Array.isArray(record.output) ? record.output : [];
  const texts: string[] = [];
  const citations: NormalizedCitation[] = [];
  const toolCalls: NormalizedToolCall[] = [];
  let structured: unknown;
  for (const item of output) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const entry = item as Record<string, unknown>;
    if (entry.type === 'function_call') {
      toolCalls.push(toolCall(entry.call_id ?? entry.id, entry.name, entry.arguments));
      continue;
    }
    const content = Array.isArray(entry.content) ? entry.content : [];
    for (const part of content) {
      if (!part || typeof part !== 'object') {
        continue;
      }
      const block = part as Record<string, unknown>;
      if (block.type === 'output_json') {
        structured = block.json ?? parseJson(asString(block.text));
      }
      const text = asString(block.text) ?? asString(block.refusal);
      if (text) {
        texts.push(text);
      }
      citations.push(...citationsFrom(block.annotations));
    }
  }
  const text = texts.join('') || asString(record.output_text);
  const safety = safetyFrom(record.content_filter_results);
  const incomplete = record.incomplete_details && typeof record.incomplete_details === 'object' ? asString((record.incomplete_details as { reason?: unknown }).reason) : undefined;
  const providerStatus = asString(record.status);
  return {
    id: asString(record.id),
    status: outputStatus(providerStatus, safety, incomplete),
    ...(text ? { text } : {}),
    ...(structured !== undefined ? { structured } : {}),
    ...(toolCalls.length > 0 ? { toolCalls } : {}),
    ...(citations.length > 0 ? { citations } : {}),
    ...(normalizeUsage(record.usage) ? { usage: normalizeUsage(record.usage) } : {}),
    ...(safety.length > 0 ? { safety } : {}),
    finishReason: incomplete ?? (providerStatus === 'incomplete' ? 'incomplete' : 'stop'),
    ...(asString(record.model) ? { providerModel: asString(record.model) } : {}),
  };
}

function mapChatOutput(record: Record<string, unknown>): AzureMappedOutput {
  const choice = Array.isArray(record.choices) && record.choices[0] && typeof record.choices[0] === 'object' ? (record.choices[0] as Record<string, unknown>) : undefined;
  const message = choice?.message && typeof choice.message === 'object' ? (choice.message as Record<string, unknown>) : undefined;
  const content = message?.content;
  let text = '';
  let structured: unknown;
  if (typeof content === 'string') {
    text = content;
    structured = parseJson(content);
  } else if (Array.isArray(content)) {
    const texts: string[] = [];
    for (const part of content) {
      if (!part || typeof part !== 'object') {
        continue;
      }
      const block = part as Record<string, unknown>;
      if (typeof block.json === 'object' && block.json !== null) {
        structured = block.json;
      }
      const partText = asString(block.text);
      if (partText) {
        texts.push(partText);
      }
    }
    text = texts.join('');
  }
  const toolCalls = Array.isArray(message?.tool_calls)
    ? message.tool_calls.map((call) => {
        const recordCall = call as Record<string, unknown>;
        const fn = recordCall.function && typeof recordCall.function === 'object' ? (recordCall.function as Record<string, unknown>) : undefined;
        return toolCall(recordCall.id, fn?.name ?? recordCall.name, fn?.arguments ?? recordCall.arguments);
      })
    : [];
  const citations = [
    ...citationsFrom(Array.isArray(content) ? content.flatMap((part) => (part && typeof part === 'object' ? (part as { annotations?: unknown }).annotations ?? [] : [])) : []),
    ...citationsFromContext(message?.context),
  ];
  const safety = safetyFrom(choice?.content_filter_results ?? record.content_filter_results);
  const finishReason = asString(choice?.finish_reason) ?? 'stop';
  return {
    id: asString(record.id),
    status: finishReason === 'content_filter' || safety.some((item) => item.action === 'block') ? 'blocked' : finishReason === 'length' ? 'incomplete' : 'completed',
    ...(text ? { text } : {}),
    ...(structured !== undefined ? { structured } : {}),
    ...(toolCalls.length > 0 ? { toolCalls } : {}),
    ...(citations.length > 0 ? { citations } : {}),
    ...(normalizeUsage(record.usage) ? { usage: normalizeUsage(record.usage) } : {}),
    ...(safety.length > 0 ? { safety } : {}),
    finishReason,
    ...(asString(record.model) ? { providerModel: asString(record.model) } : {}),
  };
}

function outputStatus(providerStatus: string | undefined, safety: NormalizedSafetyResult[], incomplete: string | undefined): AzureMappedOutput['status'] {
  if (safety.some((item) => item.action === 'block')) {
    return 'blocked';
  }
  if (providerStatus === 'incomplete' || incomplete) {
    return 'incomplete';
  }
  if (providerStatus === 'failed') {
    return 'failed';
  }
  return 'completed';
}

function toolCall(id: unknown, name: unknown, rawArguments: unknown): NormalizedToolCall {
  const toolName = asString(name) ?? 'tool';
  const parsed = typeof rawArguments === 'string' ? parseJson(rawArguments) ?? rawArguments : rawArguments;
  return {
    id: asString(id) ?? toolName,
    name: toolName,
    ...(parsed !== undefined ? { arguments: parsed } : {}),
    status: 'completed',
  };
}

function citationsFromContext(value: unknown): NormalizedCitation[] {
  if (!value || typeof value !== 'object') {
    return [];
  }
  const citations = (value as { citations?: unknown }).citations;
  if (!Array.isArray(citations)) {
    return [];
  }
  return citations.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return [];
    }
    const citation = item as Record<string, unknown>;
    return [{
      ...(asString(citation.id) ? { id: asString(citation.id) } : {}),
      ...(asString(citation.title) ? { title: asString(citation.title) } : {}),
      ...(asString(citation.url) ?? asString(citation.uri) ? { uri: asString(citation.url) ?? asString(citation.uri) } : {}),
    }];
  });
}

function citationsFrom(value: unknown): NormalizedCitation[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return [];
    }
    const annotation = item as Record<string, unknown>;
    if (annotation.type !== 'url_citation' && annotation.type !== 'file_citation') {
      return [];
    }
    return [{
      ...(asString(annotation.id) ? { id: asString(annotation.id) } : {}),
      ...(asString(annotation.title) ? { title: asString(annotation.title) } : {}),
      ...(asString(annotation.url) ? { uri: asString(annotation.url) } : {}),
    }];
  });
}

function safetyFrom(value: unknown): NormalizedSafetyResult[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([category, detail]) => {
    if (!detail || typeof detail !== 'object') {
      return [];
    }
    const record = detail as { filtered?: unknown; severity?: unknown };
    const severity = mapSeverity(asString(record.severity));
    return [{
      category,
      action: record.filtered === true ? 'block' : 'allow',
      ...(severity ? { severity } : {}),
    }];
  });
}

function mapSeverity(value: string | undefined): NormalizedSafetyResult['severity'] | undefined {
  if (value === 'safe') {
    return 'info';
  }
  if (value === 'info' || value === 'low' || value === 'medium' || value === 'high' || value === 'critical') {
    return value;
  }
  return undefined;
}

function normalizeUsage(value: unknown): AIUsage | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const usage = value as Record<string, unknown>;
  const inputDetails = usage.input_tokens_details && typeof usage.input_tokens_details === 'object' ? (usage.input_tokens_details as Record<string, unknown>) : undefined;
  const outputDetails = usage.output_tokens_details && typeof usage.output_tokens_details === 'object' ? (usage.output_tokens_details as Record<string, unknown>) : undefined;
  const mapped: AIUsage = omitEmpty({
    inputTokens: numberOr(usage.inputTokens, usage.input_tokens, usage.prompt_tokens),
    outputTokens: numberOr(usage.outputTokens, usage.output_tokens, usage.completion_tokens),
    totalTokens: numberOr(usage.totalTokens, usage.total_tokens),
    cachedInputTokens: numberOr(usage.cachedInputTokens, inputDetails?.cached_tokens),
    reasoningTokens: numberOr(usage.reasoningTokens, outputDetails?.reasoning_tokens),
  });
  return Object.keys(mapped).length > 0 ? mapped : undefined;
}

function responseTextFormat(request: AIExecutionRequest): Record<string, unknown> | undefined {
  if (request.responseFormat?.type !== 'json') {
    return undefined;
  }
  if (request.responseFormat.schema) {
    return { format: { type: 'json_schema', name: 'result', schema: request.responseFormat.schema, strict: true } };
  }
  return { format: { type: 'json_object' } };
}

function chatResponseFormat(request: AIExecutionRequest): Record<string, unknown> | undefined {
  if (request.responseFormat?.type !== 'json') {
    return undefined;
  }
  if (request.responseFormat.schema) {
    return { type: 'json_schema', json_schema: { name: 'result', schema: request.responseFormat.schema, strict: true } };
  }
  return { type: 'json_object' };
}

function responsesToolChoice(choice: AIToolChoice | undefined): unknown {
  if (!choice || typeof choice === 'string') {
    return choice;
  }
  return { type: 'function', name: choice.name };
}

function chatToolChoice(choice: AIToolChoice | undefined): unknown {
  if (!choice || typeof choice === 'string') {
    return choice;
  }
  return { type: 'function', function: { name: choice.name } };
}

function safeOptions(options: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!options) {
    return {};
  }
  return Object.fromEntries(Object.entries(options).filter(([key]) => !SECRET_OPTION_KEYS.has(key.toLowerCase())));
}

function omitEmpty<T extends Record<string, unknown>>(record: T): T {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined)) as T;
}

function parseJson(value: string | undefined): unknown {
  if (!value) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function numberOr(...values: unknown[]): number | undefined {
  return values.find((value): value is number => typeof value === 'number' && Number.isFinite(value));
}

export function isContentFilter(message: string | undefined, providerCode: string | undefined): boolean {
  if (providerCode === 'content_filter') {
    return true;
  }
  return typeof message === 'string' && /content management policy|content filter/i.test(message);
}

export function statusError(status: number): { code: AIErrorCode; retryable: boolean } {
  if (status === 401) {
    return { code: 'AUTHENTICATION_ERROR', retryable: false };
  }
  if (status === 403) {
    return { code: 'AUTHORIZATION_ERROR', retryable: false };
  }
  if (status === 408 || status === 504) {
    return { code: 'TIMEOUT_ERROR', retryable: true };
  }
  if (status === 429) {
    return { code: 'RATE_LIMIT_ERROR', retryable: true };
  }
  if (status === 503) {
    return { code: 'PROVIDER_UNAVAILABLE', retryable: true };
  }
  if (status >= 400 && status < 500) {
    return { code: 'PROVIDER_REQUEST_ERROR', retryable: false };
  }
  return { code: 'PROVIDER_RESPONSE_ERROR', retryable: false };
}
