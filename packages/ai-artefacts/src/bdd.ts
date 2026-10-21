import type { TestGenieCase } from './test-genie.js';
import { assertReadyForCodeGeneration, type TestGenieVerification } from './test-genie.js';
import { forbiddenFindings, type StaticFinding } from './source-checks.js';
import { expandUiSteps, isDisplayed, isNavigate, methodName, urlFromCase } from './uiSteps.js';

export interface GherkinArtefact {
  feature: string;
  steps: string;
  pageObject: string;
}

export interface StepUse {
  keyword: string;
  text: string;
}

const STEP_KEYWORDS = ['Given', 'When', 'Then', 'And', 'But'];

export function featureFromTestCase(testCase: TestGenieCase, verification: TestGenieVerification, trace: { requirementId: string; acceptanceTestId: string }): string {
  return featureFromCases(testCase.title, [{ testCase, trace }], verification);
}

export function featureFromCases(
  title: string,
  cases: Array<{ testCase: TestGenieCase; trace: { requirementId: string; acceptanceTestId: string } }>,
  verification: TestGenieVerification,
): string {
  assertReadyForCodeGeneration(verification);
  const scenarios = cases.map(({ testCase, trace }) => scenarioBlock(testCase, trace));
  return [`Feature: ${title}`, '', scenarios.join('\n\n'), ''].join('\n');
}

export function verifyGherkin(content: string): StaticFinding[] {
  const findings: StaticFinding[] = [];
  const lines = content.split('\n').map((line) => line.trim()).filter((line) => line.length > 0 && !line.startsWith('#'));
  if (!lines.some((line) => line.startsWith('Feature:'))) {
    findings.push({ code: 'gherkin', severity: 'high', message: 'Feature is missing', deterministic: true });
  }
  const scenarios = lines.filter((line) => line.startsWith('Scenario:') || line.startsWith('Scenario Outline:'));
  if (scenarios.length === 0) {
    findings.push({ code: 'gherkin', severity: 'high', message: 'Scenario is missing', deterministic: true });
  }
  const names = scenarios.map((line) => line.replace(/^Scenario( Outline)?:\s*/, ''));
  if (new Set(names).size !== names.length) {
    findings.push({ code: 'gherkin', severity: 'medium', message: 'Duplicate scenario names', deterministic: true });
  }
  const outlines = lines.some((line) => line.startsWith('Scenario Outline:'));
  if (outlines && !lines.some((line) => line.startsWith('Examples:'))) {
    findings.push({ code: 'gherkin', severity: 'high', message: 'Scenario Outline needs an Examples table', deterministic: true });
  }
  for (const line of lines) {
    const keyword = STEP_KEYWORDS.find((item) => line.startsWith(`${item} `));
    if (!keyword && /^(Given|When|Then|And|But)$/.test(line)) {
      findings.push({ code: 'gherkin', severity: 'high', message: 'A step is missing its expected behaviour', deterministic: true });
    }
  }
  if (!lines.some((line) => line.startsWith('Then '))) {
    findings.push({ code: 'gherkin', severity: 'high', message: 'Scenario has no Then step', deterministic: true });
  }
  return findings;
}

export function stepsFromFeature(feature: string): string {
  const lines = [];
  const seen = new Set<string>();
  for (const step of featureSteps(feature)) {
    const keyword = step.keyword === 'And' || step.keyword === 'But' ? 'Then' : step.keyword;
    const key = `${keyword}:${step.text}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    lines.push(`${keyword}('${escapeQuote(step.text)}', async function () {`, '  return undefined;', '});', '');
  }
  return lines.join('\n');
}

export function pageObjectFromFeature(feature: string, cases: TestGenieCase[] = []): string {
  const fromCases = pageMethodsFromCases(cases.length > 0 ? cases.map(expandUiSteps) : casesFromFeature(feature));
  return `module.exports = {\n${fromCases.join(',\n')}\n};\n`;
}

export function stepsFromCases(feature: string, pageObjectPath: string, cases: TestGenieCase[] = []): string {
  const methods = methodIndex(cases);
  const lines = [];
  const seen = new Set<string>();
  for (const step of featureSteps(feature)) {
    const keyword = step.keyword === 'And' || step.keyword === 'But' ? 'Then' : step.keyword;
    const key = `${keyword}:${step.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const method = methods.get(step.text);
    const body = method ? `  await page.${method}();` : '  return undefined;';
    lines.push(`${keyword}('${escapeQuote(step.text)}', async function () {`, body, '});', '');
  }
  const header = methods.size > 0 ? `const page = require('${pageObjectPath}');\n\n` : '';
  return `${header}${lines.join('\n')}`;
}

export function selectorFromTarget(target: TestGenieCase['steps'][number]['target']): string | null {
  const by = target?.find?.by;
  const value = String(target?.find?.value || '').trim();
  if (!by || !value) return null;
  if (by === 'testid') return `[data-testid="${escapeAttr(value)}"]`;
  if (by === 'name') return `[name="${escapeAttr(value)}"]`;
  if (by === 'id') return `#${value.replace(/[^A-Za-z0-9_-]/g, '')}`;
  if (by === 'text') return `=${value}`;
  return `aria/${value}`;
}

export function unboundSteps(cases: TestGenieCase[]): string[] {
  return cases.flatMap((testCase) => expandUiSteps(testCase).steps.flatMap((step) => {
    if (step.api) return [];
    if (selectorFromTarget(step.target)) return [];
    if (urlFromCase(testCase, step) && isNavigate(step.action)) return [];
    return step.action ? [`Unbound step: ${step.action}`] : [];
  }));
}

function pageMethodsFromCases(cases: TestGenieCase[]): string[] {
  const methods: string[] = [];
  const seen = new Set<string>();
  for (const testCase of cases) {
    expandUiSteps(testCase).steps.forEach((step) => {
      const name = methodName(step, `step${methods.length + 1}`);
      if (seen.has(name)) return;
      seen.add(name);
      const selector = selectorFromTarget(step.target);
      const pageUrl = urlFromCase(testCase, step);
      if (step.api) {
        const path = step.api.path.startsWith('/') || /^https?:\/\//i.test(step.api.path) ? step.api.path : `/${step.api.path}`;
        const urlExpr = /^https?:\/\//i.test(path)
          ? `'${escapeQuote(path)}'`
          : `(process.env.PRODUCT_API_URL || '') + '${escapeQuote(path)}'`;
        const expected = Number.isFinite(step.api.expectedStatus) ? step.api.expectedStatus : 200;
        methods.push(`  // ${step.action}\n  async ${name}() {\n    const response = await fetch(${urlExpr}, { method: '${escapeQuote(step.api.method || 'GET')}' });\n    if (response.status !== ${expected}) throw new Error('Expected ${expected}, got ' + response.status);\n  }`);
        return;
      }
      if (pageUrl && isNavigate(step.action) && !selector) {
        methods.push(`  // ${step.action}\n  async ${name}() {\n    await global.browser.url('${escapeQuote(pageUrl)}');\n  }`);
        return;
      }
      if (!selector) {
        methods.push(`  // unbound: ${step.action || testCase.title}\n  async ${name}() {\n    await global.browser.pause(0);\n  }`);
        return;
      }
      const command = isDisplayed(`${step.action} ${step.expected}`)
        ? 'waitForDisplayed()'
        : step.target?.type === 'input' || step.target?.type === 'select'
          ? `setValue('')`
          : 'click()';
      methods.push(`  // ${step.action}\n  async ${name}() {\n    await global.browser.$('${escapeQuote(selector)}').${command};\n  }`);
    });
  }
  return methods;
}

function methodIndex(cases: TestGenieCase[]): Map<string, string> {
  const methods = new Map<string, string>();
  for (const testCase of cases) {
    for (const step of expandUiSteps(testCase).steps) {
      const name = methodName(step, '');
      if (!name || !step.action) continue;
      methods.set(step.action, name);
    }
  }
  return methods;
}

function casesFromFeature(feature: string): TestGenieCase[] {
  const uses = featureSteps(feature);
  if (uses.length === 0) return [];
  const action = uses.filter((item) => item.keyword === 'Given' || item.keyword === 'When').map((item) => item.text).join(' ');
  const expected = uses.filter((item) => item.keyword === 'Then' || item.keyword === 'And').map((item) => item.text).join(' ');
  return [expandUiSteps({
    id: 'TC-feature',
    acceptanceTestId: 'AT-feature',
    title: 'Imported feature',
    preconditions: ['The system is available'],
    coverage: ['positive', 'negative', 'boundary'],
    steps: [{ action: action || expected, expected: expected || 'the page is ready' }],
  })];
}

function escapeAttr(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function verifySteps(feature: string, steps: string): StaticFinding[] {
  const findings: StaticFinding[] = [...forbiddenFindings(steps)];
  const defined = definedStepPatterns(steps);
  const used = featureSteps(feature);
  for (const step of used) {
    const matches = defined.filter((pattern) => stepMatches(pattern, step.text));
    if (matches.length === 0) {
      findings.push({ code: 'undefined-step', severity: 'high', message: `Undefined step: ${step.text}`, deterministic: true });
    }
    if (matches.length > 1) {
      findings.push({ code: 'ambiguous-step', severity: 'high', message: `Ambiguous step: ${step.text}`, deterministic: true });
    }
  }
  for (const pattern of defined) {
    if (!used.some((step) => stepMatches(pattern, step.text))) {
      findings.push({ code: 'unused-step', severity: 'low', message: `Unused step: ${pattern}`, deterministic: true });
    }
  }
  if (defined.some((pattern) => pattern.includes('{int}') && !/\{int\}/.test(pattern))) {
    findings.push({ code: 'step-parameter', severity: 'medium', message: 'Integer parameter is malformed', deterministic: true });
  }
  if (!/async function/.test(steps)) {
    findings.push({ code: 'step-async', severity: 'medium', message: 'Step definitions must be asynchronous', deterministic: true });
  }
  return findings;
}

export function verifyPageObject(content: string): StaticFinding[] {
  const findings = [...forbiddenFindings(content)];
  if (/\b(Given|When|Then)\s*\(/.test(content)) {
    findings.push({ code: 'page-object', severity: 'medium', message: 'Page Object must not declare Cucumber steps', deterministic: true });
  }
  if (!/global\.browser/.test(content)) {
    findings.push({ code: 'page-object', severity: 'high', message: 'Page Object must use the Klassi browser abstraction', deterministic: true });
  }
  return findings;
}

export function generateBdd(testCase: TestGenieCase, verification: TestGenieVerification, trace: { requirementId: string; acceptanceTestId: string }): GherkinArtefact {
  const feature = featureFromTestCase(testCase, verification, trace);
  return { feature, steps: stepsFromCases(feature, '../page-objects/feature', [testCase]), pageObject: pageObjectFromFeature(feature, [testCase]) };
}

export interface ScenarioResult {
  name: string;
  status: 'pass' | 'fail' | 'error';
  tags: string[];
}

export interface TraceLink {
  requirementId?: string;
  acceptanceTestId?: string;
  testCaseId?: string;
  scenario: string;
  status: ScenarioResult['status'];
}

export function traceExecution(results: ScenarioResult[]): TraceLink[] {
  return results.map((result) => ({
    requirementId: tagged(result.tags, 'BR-'),
    acceptanceTestId: tagged(result.tags, 'AT-'),
    testCaseId: tagged(result.tags, 'TC-'),
    scenario: result.name,
    status: result.status,
  }));
}

export function evidenceForRequirement(links: TraceLink[], requirementId: string): TraceLink[] {
  return links.filter((link) => link.requirementId === requirementId);
}

export function requirementForScenario(links: TraceLink[], scenario: string): TraceLink | undefined {
  return links.find((link) => link.scenario === scenario && link.status === 'fail');
}

export function cucumberPlan(artefacts: GherkinArtefact): { feature: string; steps: string; pageObject: string; runner: 'klassi-cucumber'; browser: 'webdriverio-standalone' } {
  return { ...artefacts, runner: 'klassi-cucumber', browser: 'webdriverio-standalone' };
}

function scenarioBlock(testCase: TestGenieCase, trace: { requirementId: string; acceptanceTestId: string }): string {
  const tags = [
    `@${trace.requirementId.startsWith('BR-') ? trace.requirementId : `BR-${trace.requirementId}`}`,
    `@${trace.acceptanceTestId.startsWith('AT-') ? trace.acceptanceTestId : `AT-${trace.acceptanceTestId}`}`,
    `@${testCase.id.startsWith('TC-') ? testCase.id : `TC-${testCase.id}`}`,
  ];
  const steps = testCase.steps.flatMap((step, index) => {
    const assertionOnly = step.action === step.expected || (isDisplayed(step.action) && !isNavigate(step.action) && !step.api);
    if (assertionOnly) return [`${index === 0 ? 'Then' : 'And'} ${step.expected}`];
    return [`${index === 0 ? 'When' : 'And'} ${step.action}`, `Then ${step.expected}`];
  }).join('\n    ');
  const examples = exampleTable(testCase.examples);
  const keyword = examples ? 'Scenario Outline' : 'Scenario';
  return [`  ${tags.join(' ')}`, `  ${keyword}: ${testCase.title}`, `    ${steps}`, examples].filter(Boolean).join('\n');
}

function exampleTable(examples: TestGenieCase['examples']): string {
  if (!examples || examples.headers.length === 0 || examples.rows.length === 0) return '';
  const header = `      | ${examples.headers.join(' | ')} |`;
  const rows = examples.rows.map((row) => `      | ${examples.headers.map((name) => row[name] ?? '').join(' | ')} |`);
  return ['    Examples:', header, ...rows].join('\n');
}

function featureSteps(feature: string): StepUse[] {
  return feature
    .split('\n')
    .map((line) => line.trim())
    .flatMap((line) => {
      const keyword = STEP_KEYWORDS.find((item) => line.startsWith(`${item} `));
      return keyword ? [{ keyword, text: line.slice(keyword.length).trim() }] : [];
    });
}

function definedStepPatterns(steps: string): string[] {
  const patterns: string[] = [];
  const call = /\b(?:Given|When|Then)\(\s*(['"`])/g;
  let match = call.exec(steps);
  while (match) {
    const quote = match[1] ?? "'";
    let index = call.lastIndex;
    let text = '';
    while (index < steps.length) {
      const char = steps[index] ?? '';
      if (char === '\\') {
        text += steps[index + 1] ?? '';
        index += 2;
        continue;
      }
      if (char === quote) {
        patterns.push(text);
        call.lastIndex = index + 1;
        break;
      }
      text += char;
      index += 1;
    }
    match = call.exec(steps);
  }
  return patterns;
}

function stepMatches(pattern: string, text: string): boolean {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = escaped.replace(/\\\{string\\\}/g, '.*').replace(/\\\{int\\\}/g, '\\d+').replace(/\\\{float\\\}/g, '\\d+(?:\\.\\d+)?');
  return new RegExp(`^${expression}$`).test(text);
}

function tagged(tags: string[], prefix: string): string | undefined {
  return tags.map((tag) => tag.replace(/^@/, '')).find((tag) => tag.startsWith(prefix));
}

function escapeQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
