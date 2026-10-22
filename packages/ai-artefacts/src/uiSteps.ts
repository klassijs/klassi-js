import type { TestGenieCase, TestGenieStep, TestGenieTarget } from './test-genie.js';

export const OPEN_WEBSITE_STEP = 'a visitor opens the website';

export function isNavigate(text: string): boolean {
  return /\b(opens?|visits?|goes to|navigates? to|loads?)\b/i.test(text) || /https?:\/\//i.test(text);
}

export function isDisplayed(text: string): boolean {
  return /\b(?:is|are)\s+(?:displayed|shown|visible)\b/i.test(text);
}

export function urlFromText(text: string): string {
  return String(text || '').match(/https?:\/\/[^\s"'<>]+/i)?.[0] || '';
}

export function hideProductUrl(text: string): string {
  return stripProductUrls(String(text || ''));
}

export function stripProductUrls(text: string): string {
  return String(text || '')
    .replace(/\b(?:a visitor |the user |I )?(?:opens?|visits?|goes to|navigates? to|loads?)\s+https?:\/\/[^\s"'<>]+/gi, OPEN_WEBSITE_STEP)
    .replace(/https?:\/\/[^\s"'<>]+/gi, 'the website')
    .replace(/([^ \n]) {2,}/g, '$1 ')
    .replace(/[ \t]+\n/g, '\n');
}

export function visibleTargets(text: string): TestGenieTarget[] {
  const targets: TestGenieTarget[] = [];
  const seen = new Set<string>();
  const parts = String(text || '').split(/\s+(?:is|are)\s+(?:displayed|shown|visible)\b/i);
  for (let index = 0; index < parts.length - 1; index += 1) {
    const chunk = String(parts[index] || '').replace(/\s+/g, ' ').trim();
    const match = chunk.match(/.*\bthe\s+((?:[A-Za-z][\w&'-]*)(?:\s+[A-Za-z][\w&'-]*){0,2})\s*$/i);
    const noun = match ? match[1].trim() : '';
    const key = noun.toLowerCase();
    if (!noun || key === 'page' || key === 'it' || /finishes loading|page is ready/.test(key) || seen.has(key)) {
      continue;
    }
    seen.add(key);
    targets.push({
      name: toName(noun) || 'element',
      type: /\b(heading|title|logo|card|image|link)\b/i.test(noun) ? 'link' : 'button',
      find: { by: 'text', value: noun, fromDom: false },
    });
  }
  return targets;
}

export function urlFromCase(testCase: TestGenieCase, step?: TestGenieStep): string {
  return testCase.page?.url || urlFromText(step?.action || '') || urlFromText(testCase.steps.map((item) => item.action).join(' '));
}

export function expandUiSteps(testCase: TestGenieCase): TestGenieCase {
  const blob = testCase.steps
    .filter((step) => !step.target && !step.api)
    .map((step) => `${step.action} ${step.expected}`)
    .join(' ');
  const visibles = visibleTargets(blob);
  const url = urlFromCase(testCase);
  const steps: TestGenieStep[] = [];
  if (url && !testCase.steps.some((step) => isNavigate(step.action))) {
    steps.push({ action: OPEN_WEBSITE_STEP, expected: 'the page is ready' });
  }
  for (const step of testCase.steps) {
    if (step.api || step.target || /<[^>]+>/.test(`${step.action} ${step.expected}`)) {
      steps.push(step);
      continue;
    }
    if (isNavigate(step.action) && url) {
      if (!steps.some((item) => isNavigate(item.action))) {
        steps.push({
          action: OPEN_WEBSITE_STEP,
          expected: step.expected && !isDisplayed(step.expected) ? step.expected : 'the page is ready',
        });
      }
      continue;
    }
    if (visibleTargets(`${step.action} ${step.expected}`).length > 0) continue;
    steps.push(step);
  }
  for (const target of visibles) {
    if (steps.some((step) => {
      const name = String(step.target?.name || '').toLowerCase();
      const value = String(step.target?.find.value || '').toLowerCase();
      const action = String(step.action || '').toLowerCase();
      return name === target.name.toLowerCase()
        || value === target.find.value.toLowerCase()
        || action.includes(target.find.value.toLowerCase());
    })) {
      continue;
    }
    steps.push({
      action: `the ${target.find.value} is displayed`,
      expected: `the ${target.find.value} is displayed`,
      target,
    });
  }
  return {
    ...testCase,
    steps: steps.length > 0 ? steps : testCase.steps,
    page: testCase.page || (url ? { name: 'app', url } : undefined),
  };
}

export function methodName(step: TestGenieStep, fallback: string): string {
  if (step.target?.name) return step.target.name;
  if (step.api) return 'callApi';
  if (isNavigate(step.action)) return 'openPage';
  return fallback;
}

export function toName(label: string): string {
  const words = String(label || '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5);
  if (words.length === 0) return '';
  return words[0].toLowerCase() + words.slice(1).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
}
