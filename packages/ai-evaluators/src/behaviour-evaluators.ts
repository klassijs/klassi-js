import type { Evaluator, EvaluatorContext } from '@klassijs/ai-core';
import { matchesSchema } from './structured-evaluators.js';
import { defineEvaluator, failedConfig, outputText, readNumber, readString, readStringList, scored } from './support.js';

function citationLabels(context: { result: { citations?: Array<{ id?: string; uri?: string; title?: string }> } }): string[] {
  return (context.result.citations ?? []).flatMap((citation) => [citation.id, citation.uri, citation.title].filter((value): value is string => Boolean(value)));
}

export const citationPresence: Evaluator = defineEvaluator('citation-presence', 'Citation presence', async (context) => {
  const required = readStringList(context.config, 'required') ?? [];
  const labels = citationLabels(context);
  if (required.length === 0) {
    return scored(citationPresence, labels.length > 0, labels.length > 0 ? 'at least one citation was present' : 'no citations were present');
  }
  const missing = required.filter((item) => !labels.includes(item));
  return scored(citationPresence, missing.length === 0, missing.length === 0 ? 'required citations were present' : `missing ${missing.join(', ')}`);
});

export const allowedCitationDomain: Evaluator = defineEvaluator('allowed-citation-domain', 'Allowed citation domain', async (context) => {
  const domains = readStringList(context.config, 'domains');
  if (!domains) {
    return failedConfig(allowedCitationDomain, 'allowed-citation-domain requires config.domains');
  }
  const uris = (context.result.citations ?? []).map((citation) => citation.uri).filter((uri): uri is string => Boolean(uri));
  if (uris.length === 0) {
    return scored(allowedCitationDomain, false, 'no citation URIs were present');
  }
  const blocked = uris.filter((uri) => {
    try {
      return !domains.includes(new URL(uri).hostname);
    } catch {
      return true;
    }
  });
  return scored(allowedCitationDomain, blocked.length === 0, blocked.length === 0 ? 'citation domains were allowed' : `blocked ${blocked.join(', ')}`);
});

export const toolCalled: Evaluator = defineEvaluator('tool-called', 'Tool called', async (context) => {
  const name = readString(context.config, 'name');
  if (!name) {
    return failedConfig(toolCalled, 'tool-called requires config.name');
  }
  const called = (context.result.toolCalls ?? []).some((call) => call.name === name);
  return scored(toolCalled, called, called ? `${name} was called` : `${name} was not called`);
});

export const toolNotCalled: Evaluator = defineEvaluator('tool-not-called', 'Tool not called', async (context) => {
  const name = readString(context.config, 'name');
  if (!name) {
    return failedConfig(toolNotCalled, 'tool-not-called requires config.name');
  }
  const called = (context.result.toolCalls ?? []).some((call) => call.name === name);
  return scored(toolNotCalled, !called, called ? `${name} was called` : `${name} was not called`);
});

export const toolArguments: Evaluator = defineEvaluator('tool-arguments', 'Tool arguments', async (context) => {
  const name = readString(context.config, 'name');
  const expected = context.config && typeof context.config === 'object' ? (context.config as { arguments?: unknown }).arguments : undefined;
  if (!name || expected === undefined) {
    return failedConfig(toolArguments, 'tool-arguments requires config.name and config.arguments');
  }
  const call = (context.result.toolCalls ?? []).find((item) => item.name === name);
  if (!call) {
    return scored(toolArguments, false, `${name} was not called`);
  }
  const matched = JSON.stringify(call.arguments) === JSON.stringify(expected);
  return scored(toolArguments, matched, matched ? `${name} arguments matched` : `${name} arguments did not match`);
});

export const expectedTools: Evaluator = defineEvaluator('expected-tools', 'Expected tools', async (context) => {
  const names = listedNames(context, 'expectedTools');
  if (!names) {
    return failedConfig(expectedTools, 'expected-tools requires config.names or expectations.expectedTools');
  }
  const called = toolNames(context);
  const missing = names.filter((name) => !called.includes(name));
  return scored(expectedTools, missing.length === 0, missing.length === 0 ? 'expected tools were selected' : `missing ${missing.join(', ')}`);
});

export const forbiddenTools: Evaluator = defineEvaluator('forbidden-tools', 'Forbidden tools', async (context) => {
  const names = listedNames(context, 'forbiddenTools');
  if (!names) {
    return failedConfig(forbiddenTools, 'forbidden-tools requires config.names or expectations.forbiddenTools');
  }
  const called = toolNames(context).filter((name) => names.includes(name));
  return scored(forbiddenTools, called.length === 0, called.length === 0 ? 'forbidden tools were not selected' : `called ${called.join(', ')}`);
});

export const toolCallCount: Evaluator = defineEvaluator('tool-call-count', 'Tool call count', async (context) => {
  const count = readNumber(context.config, 'count');
  const min = readNumber(context.config, 'min');
  const max = readNumber(context.config, 'max');
  if (count === undefined && min === undefined && max === undefined) {
    return failedConfig(toolCallCount, 'tool-call-count requires config.count, config.min, or config.max');
  }
  const actual = (context.result.toolCalls ?? []).length;
  const passed = (count === undefined || actual === count) && (min === undefined || actual >= min) && (max === undefined || actual <= max);
  return scored(toolCallCount, passed, passed ? `tool call count ${actual} matched` : `tool call count ${actual} did not match`);
});

export const toolArgumentSchema: Evaluator = defineEvaluator('tool-argument-schema', 'Tool argument schema', async (context) => {
  const name = readString(context.config, 'name');
  const schema = context.config && typeof context.config === 'object' ? (context.config as { schema?: unknown }).schema : undefined;
  if (!name || !schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return failedConfig(toolArgumentSchema, 'tool-argument-schema requires config.name and config.schema');
  }
  const call = (context.result.toolCalls ?? []).find((item) => item.name === name);
  if (!call) {
    return scored(toolArgumentSchema, false, `${name} was not called`);
  }
  const reason = matchesSchema(call.arguments, schema as Record<string, unknown>);
  if (reason?.startsWith('unsupported')) {
    return failedConfig(toolArgumentSchema, reason);
  }
  return scored(toolArgumentSchema, reason === undefined, reason ?? `${name} arguments matched the schema`);
});

export const requiredToolArguments: Evaluator = defineEvaluator('required-tool-arguments', 'Required tool arguments', async (context) => {
  const name = readString(context.config, 'name');
  const expected = context.config && typeof context.config === 'object' ? (context.config as { arguments?: unknown }).arguments : undefined;
  if (!name || !expected || typeof expected !== 'object' || Array.isArray(expected)) {
    return failedConfig(requiredToolArguments, 'required-tool-arguments requires config.name and config.arguments');
  }
  const call = (context.result.toolCalls ?? []).find((item) => item.name === name);
  if (!call) {
    return scored(requiredToolArguments, false, `${name} was not called`);
  }
  if (!call.arguments || typeof call.arguments !== 'object' || Array.isArray(call.arguments)) {
    return scored(requiredToolArguments, false, `${name} arguments were not an object`);
  }
  const actual = call.arguments as Record<string, unknown>;
  const missing = Object.entries(expected).filter(([key, value]) => JSON.stringify(actual[key]) !== JSON.stringify(value));
  return scored(requiredToolArguments, missing.length === 0, missing.length === 0 ? `${name} required arguments matched` : `${name} missing ${missing.map(([key]) => key).join(', ')}`);
});

export const toolResult: Evaluator = defineEvaluator('tool-result', 'Tool result', async (context) => {
  const name = readString(context.config, 'name');
  if (!name) {
    return failedConfig(toolResult, 'tool-result requires config.name');
  }
  const call = (context.result.toolCalls ?? []).find((item) => item.name === name);
  if (!call) {
    return scored(toolResult, false, `${name} was not called`);
  }
  if (call.result === undefined) {
    return scored(toolResult, false, `${name} action result was not observable`);
  }
  const expectedStatus = readString(context.config, 'status');
  if (expectedStatus && call.status !== expectedStatus) {
    return scored(toolResult, false, `${name} status was ${call.status ?? 'unset'}`);
  }
  const expected = context.config && typeof context.config === 'object' && 'equals' in context.config ? (context.config as { equals?: unknown }).equals : undefined;
  if (expected !== undefined && JSON.stringify(call.result) !== JSON.stringify(expected)) {
    return scored(toolResult, false, `${name} action result did not match`);
  }
  return scored(toolResult, true, `${name} action result was observable`);
});

function toolNames(context: EvaluatorContext): string[] {
  return (context.result.toolCalls ?? []).map((call) => call.name);
}

function listedNames(context: EvaluatorContext, expectationKey: 'expectedTools' | 'forbiddenTools'): string[] | undefined {
  const configured = readStringList(context.config, 'names');
  if (configured && configured.length > 0) {
    return configured;
  }
  const expected = context.evaluationCase.expectations?.[expectationKey];
  return expected && expected.length > 0 ? expected : undefined;
}

export const refusalDetection: Evaluator = defineEvaluator('refusal-detection', 'Refusal detection', async (context) => {
  const patterns = readStringList(context.config, 'patterns') ?? ["I can't", 'I cannot', 'I am unable'];
  const expectRefusal = Boolean(context.config && typeof context.config === 'object' && (context.config as { expectRefusal?: unknown }).expectRefusal);
  const text = outputText(context.result);
  const refused = patterns.some((pattern) => text.includes(pattern));
  const passed = expectRefusal ? refused : !refused;
  return scored(refusalDetection, passed, passed ? 'refusal behaviour matched' : 'refusal behaviour did not match');
});

export const latency: Evaluator = defineEvaluator('latency', 'Latency', async (context) => {
  const maxLatencyMs = readNumber(context.config, 'maxLatencyMs');
  if (maxLatencyMs === undefined) {
    return failedConfig(latency, 'latency requires config.maxLatencyMs');
  }
  const actual = context.result.timing.latencyMs;
  return scored(latency, actual <= maxLatencyMs, actual <= maxLatencyMs ? `latency ${actual}ms was within ${maxLatencyMs}ms` : `latency ${actual}ms exceeded ${maxLatencyMs}ms`);
});
