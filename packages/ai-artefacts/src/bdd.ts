import type { TestGenieCase } from './test-genie.js';
import { assertReadyForCodeGeneration, type TestGenieVerification } from './test-genie.js';
import { forbiddenFindings, type StaticFinding } from './source-checks.js';

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
  assertReadyForCodeGeneration(verification);
  const tags = [
    `@${trace.requirementId.startsWith('BR-') ? trace.requirementId : `BR-${trace.requirementId}`}`,
    `@${trace.acceptanceTestId.startsWith('AT-') ? trace.acceptanceTestId : `AT-${trace.acceptanceTestId}`}`,
    `@${testCase.id.startsWith('TC-') ? testCase.id : `TC-${testCase.id}`}`,
  ];
  const steps = testCase.steps.map((step, index) => `${index === 0 ? 'When' : 'And'} ${step.action}\n    Then ${step.expected}`).join('\n    ');
  return [`${tags.join(' ')}`, `Feature: ${testCase.title}`, '', `  Scenario: ${testCase.title}`, `    ${steps}`, ''].join('\n');
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
  const uses = featureSteps(feature);
  const lines = ["const { Given, When, Then } = require('@cucumber/cucumber');", ''];
  for (const step of uses) {
    const keyword = step.keyword === 'And' || step.keyword === 'But' ? 'Then' : step.keyword;
    lines.push(`${keyword}('${escapeQuote(step.text)}', async function () {`, '  return undefined;', '});', '');
  }
  return lines.join('\n');
}

export function pageObjectFromFeature(feature: string): string {
  const uses = featureSteps(feature).filter((item) => item.keyword === 'When' || item.keyword === 'Then');
  const methods = uses.map((item, index) => `  // ${item.text}\n  async step${index + 1}() {\n    await global.browser.pause(0);\n  }`);
  return `module.exports = {\n${methods.join(',\n')}\n};\n`;
}

export function verifySteps(feature: string, steps: string): StaticFinding[] {
  const findings: StaticFinding[] = [...forbiddenFindings(steps)];
  const defined = [...steps.matchAll(/\b(Given|When|Then)\('([^']+)'/g)].map((match) => match[2] ?? '');
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
  return { feature, steps: stepsFromFeature(feature), pageObject: pageObjectFromFeature(feature) };
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

function featureSteps(feature: string): StepUse[] {
  return feature
    .split('\n')
    .map((line) => line.trim())
    .flatMap((line) => {
      const keyword = STEP_KEYWORDS.find((item) => line.startsWith(`${item} `));
      return keyword ? [{ keyword, text: line.slice(keyword.length).trim() }] : [];
    });
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
