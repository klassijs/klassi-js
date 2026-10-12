import type { Evaluator } from '@klassijs/ai-core';
import { defineEvaluator, failedConfig, scored } from './support.js';

const SUPPORTED_SCHEMA_KEYS = new Set(['type', 'required', 'properties', 'enum', 'const', 'items']);

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function matchesSchema(value: unknown, schema: Record<string, unknown>): string | undefined {
  const unsupported = Object.keys(schema).filter((key) => !SUPPORTED_SCHEMA_KEYS.has(key));
  if (unsupported.length > 0) {
    return `unsupported schema keyword ${unsupported.join(', ')}`;
  }
  if ('const' in schema && !same(value, schema.const)) {
    return 'value did not equal const';
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((item) => same(item, value))) {
    return 'value was outside enum';
  }
  if (typeof schema.type === 'string') {
    const actual = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    if (actual !== schema.type) {
      return `expected ${schema.type} but received ${actual}`;
    }
  }
  if (schema.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const required = Array.isArray(schema.required) ? schema.required.filter((item): item is string => typeof item === 'string') : [];
    const missing = required.filter((key) => !(key in record));
    if (missing.length > 0) {
      return `missing ${missing.join(', ')}`;
    }
    const properties = schema.properties;
    if (properties && typeof properties === 'object') {
      for (const [key, child] of Object.entries(properties)) {
        if (key in record && child && typeof child === 'object') {
          const reason = matchesSchema(record[key], child as Record<string, unknown>);
          if (reason && reason.startsWith('unsupported')) {
            return reason;
          }
          if (reason) {
            return `${key}: ${reason}`;
          }
        }
      }
    }
  }
  if (schema.type === 'array' && Array.isArray(value) && schema.items && typeof schema.items === 'object') {
    for (const [index, item] of value.entries()) {
      const reason = matchesSchema(item, schema.items as Record<string, unknown>);
      if (reason) {
        return `[${index}]: ${reason}`;
      }
    }
  }
  return undefined;
}

function readPath(value: unknown, expression: string): { found: boolean; value?: unknown } {
  if (!expression.startsWith('$')) {
    return { found: false };
  }
  const tokens = expression
    .slice(1)
    .split(/\.|\[|\]/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  let current = value;
  for (const token of tokens) {
    if (current === null || current === undefined) {
      return { found: false };
    }
    const index = Number(token);
    if (Array.isArray(current) && Number.isInteger(index) && String(index) === token) {
      current = current[index];
      continue;
    }
    if (typeof current === 'object' && token in current) {
      current = (current as Record<string, unknown>)[token];
      continue;
    }
    return { found: false };
  }
  return { found: true, value: current };
}

export const jsonSchema: Evaluator = defineEvaluator('json-schema', 'JSON schema', async (context) => {
  const schema = context.config && typeof context.config === 'object' ? (context.config as { schema?: unknown }).schema : undefined;
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return failedConfig(jsonSchema, 'json-schema requires config.schema');
  }
  const reason = matchesSchema(context.result.output.structured, schema as Record<string, unknown>);
  if (reason?.startsWith('unsupported')) {
    return failedConfig(jsonSchema, reason);
  }
  return scored(jsonSchema, reason === undefined, reason ?? 'structured output matched the schema');
});

export const jsonPath: Evaluator = defineEvaluator('json-path', 'JSON path', async (context) => {
  const expression = readStringPath(context.config);
  if (!expression) {
    return failedConfig(jsonPath, 'json-path requires config.path');
  }
  const found = readPath(context.result.output.structured, expression);
  const expected = context.config && typeof context.config === 'object' ? (context.config as { equals?: unknown }).equals : undefined;
  if (!found.found) {
    return scored(jsonPath, false, `path ${expression} was missing`);
  }
  if (expected !== undefined && !same(found.value, expected)) {
    return scored(jsonPath, false, `path ${expression} did not equal the expected value`);
  }
  return scored(jsonPath, true, `path ${expression} was present`);
});

function readStringPath(config: unknown): string | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const value = (config as { path?: unknown }).path;
  return typeof value === 'string' ? value : undefined;
}
