import type { Evaluator } from '@klassijs/ai-core';
import { defineEvaluator, failedConfig, outputText, readString, readStringList, scored } from './support.js';

export const exactMatch: Evaluator = defineEvaluator('exact-match', 'Exact match', async (context) => {
  const expected = readString(context.config, 'expected');
  if (expected === undefined) {
    return failedConfig(exactMatch, 'exact-match requires config.expected');
  }
  const actual = outputText(context.result);
  return scored(exactMatch, actual === expected, actual === expected ? 'text matched' : 'text did not match');
});

export const contains: Evaluator = defineEvaluator('contains', 'Contains', async (context) => {
  const text = readString(context.config, 'text');
  if (text === undefined) {
    return failedConfig(contains, 'contains requires config.text');
  }
  const found = outputText(context.result).includes(text);
  return scored(contains, found, found ? 'text was present' : 'text was missing');
});

export const notContains: Evaluator = defineEvaluator('not-contains', 'Not contains', async (context) => {
  const text = readString(context.config, 'text');
  if (text === undefined) {
    return failedConfig(notContains, 'not-contains requires config.text');
  }
  const found = outputText(context.result).includes(text);
  return scored(notContains, !found, found ? 'forbidden text was present' : 'forbidden text was absent');
});

export const regexMatch: Evaluator = defineEvaluator('regex', 'Regular expression', async (context) => {
  const pattern = readString(context.config, 'pattern');
  if (pattern === undefined) {
    return failedConfig(regexMatch, 'regex requires config.pattern');
  }
  let expression: RegExp;
  try {
    expression = new RegExp(pattern, readString(context.config, 'flags'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid regular expression';
    return failedConfig(regexMatch, message);
  }
  const matched = expression.test(outputText(context.result));
  return scored(regexMatch, matched, matched ? 'pattern matched' : 'pattern did not match');
});

export const requiredKeywords: Evaluator = defineEvaluator('required-keywords', 'Required keywords', async (context) => {
  const keywords = readStringList(context.config, 'keywords');
  if (!keywords) {
    return failedConfig(requiredKeywords, 'required-keywords requires config.keywords');
  }
  const text = outputText(context.result);
  const missing = keywords.filter((keyword) => !text.includes(keyword));
  return scored(requiredKeywords, missing.length === 0, missing.length === 0 ? 'all keywords were present' : `missing ${missing.join(', ')}`);
});

export const forbiddenKeywords: Evaluator = defineEvaluator('forbidden-keywords', 'Forbidden keywords', async (context) => {
  const keywords = readStringList(context.config, 'keywords');
  if (!keywords) {
    return failedConfig(forbiddenKeywords, 'forbidden-keywords requires config.keywords');
  }
  const text = outputText(context.result);
  const found = keywords.filter((keyword) => text.includes(keyword));
  return scored(forbiddenKeywords, found.length === 0, found.length === 0 ? 'no forbidden keywords were present' : `found ${found.join(', ')}`);
});
