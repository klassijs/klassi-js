import type { Evaluator } from '@klassijs/ai-core';
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
