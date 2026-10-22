import type { TestGenieCase, TestGenieStep } from './test-genie.js';
import { isDisplayed, isNavigate, urlFromCase } from './uiSteps.js';

export interface KlassiHelperCall {
  name: 'loadPage' | 'waitAndClick' | 'waitAndSetValue' | 'apiCall';
  expression: string;
}

export function helperForStep(
  step: TestGenieStep,
  testCase: TestGenieCase,
  selector: string | null,
): KlassiHelperCall | null {
  if (step.api) {
    const route = step.api.path.startsWith('/') || /^https?:\/\//i.test(step.api.path) ? step.api.path : `/${step.api.path}`;
    const urlExpr = /^https?:\/\//i.test(route)
      ? `'${escapeQuote(route)}'`
      : `(process.env.PRODUCT_API_URL || '') + '${escapeQuote(route)}'`;
    const expected = Number.isFinite(step.api.expectedStatus) ? step.api.expectedStatus : 200;
    return {
      name: 'apiCall',
      expression: `await helpers.apiCall(${urlExpr}, '${escapeQuote(step.api.method || 'GET')}', null, null, null, ${expected})`,
    };
  }
  const pageUrl = urlFromCase(testCase, step);
  if (pageUrl && isNavigate(step.action) && !selector) {
    return { name: 'loadPage', expression: `await helpers.loadPage('${escapeQuote(pageUrl)}')` };
  }
  if (!selector) {
    return null;
  }
  if (isDisplayed(step.action)) {
    return null;
  }
  if (step.target?.type === 'input' || step.target?.type === 'select') {
    return { name: 'waitAndSetValue', expression: `await helpers.waitAndSetValue('${escapeQuote(selector)}', '')` };
  }
  return { name: 'waitAndClick', expression: `await helpers.waitAndClick('${escapeQuote(selector)}')` };
}

function escapeQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
