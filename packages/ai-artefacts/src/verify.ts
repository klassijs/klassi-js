import type { ArtifactProvenance, GeneratedArtifact } from '@klassijs/ai-core';
import { DEFAULT_ARTIFACT_EXECUTION_POLICY, type ArtifactExecutionPolicy } from '@klassijs/ai-core';
import { cucumberPlan, evidenceForRequirement, generateBdd, requirementForScenario, traceExecution, verifyGherkin, verifyPageObject, verifySteps, type ScenarioResult } from './bdd.js';
import { createArtifactSandbox, artefactHash } from './sandbox.js';
import { deterministicFor, isExecutableType, jsonFindings, profileFindings, referenceFindings, valuePolicyFindings, yamlFindings } from './structured.js';
import { forbiddenFindings, type StaticFinding } from './source-checks.js';
import { assertReadyForCodeGeneration, type TestGenieBundle, type TestGenieVerification } from './test-genie.js';

export interface SemanticJudge {
  execute(input: { messages: Array<{ role: 'user'; content: string }> }): Promise<{ output: { text?: string; structured?: unknown } }>;
}

export interface VerifyOptions {
  tests?: string;
  schema?: Record<string, unknown>;
  requiredValues?: Record<string, unknown>;
  forbiddenValues?: string[];
  references?: { path: string; equals: string }[];
  disposableDatabase?: boolean;
  expectedPass?: boolean;
  knownDefect?: boolean;
  negativeText?: string;
  semantic?: SemanticJudge;
  policy?: ArtifactExecutionPolicy;
}

export interface VerificationResult {
  status: 'pass' | 'fail';
  findings: StaticFinding[];
  provenance?: ArtifactProvenance;
  evidence: {
    artefactHash: string;
    verifierId: string;
    sandboxId?: string;
    policy: ArtifactExecutionPolicy;
  };
}

const VERIFIER_ID = 'klassi-artefact-verifier-1.0.0';

export async function verifyArtefact(artefact: GeneratedArtifact, options: VerifyOptions = {}): Promise<VerificationResult> {
  const policy = options.policy ?? DEFAULT_ARTIFACT_EXECUTION_POLICY;
  const deterministic = collectDeterministic(artefact, options);
  const semantic = options.semantic ? await semanticFindings(artefact, options.semantic) : [];
  const executable = isExecutableType(artefact.type) && options.tests ? await executeSuppliedTest(artefact.content, options) : [];
  const findings = [...deterministic, ...executable, ...semantic];
  return {
    status: findings.some((finding) => finding.severity === 'medium' || finding.severity === 'high' || finding.severity === 'critical') ? 'fail' : 'pass',
    findings,
    provenance: artefact.provenance,
    evidence: {
      artefactHash: artefact.hash ?? artefactHash(artefact.content),
      verifierId: VERIFIER_ID,
      sandboxId: executable.length > 0 || options.tests ? 'worker' : undefined,
      policy,
    },
  };
}

function collectDeterministic(artefact: GeneratedArtifact, options: VerifyOptions): StaticFinding[] {
  const findings = [...deterministicFor(artefact), ...profileFindings(artefact, options)];
  if (artefact.type === 'json') {
    findings.push(...jsonFindings(artefact.content, options.schema), ...valuePolicyFindings(artefact.content, 'json', options.requiredValues, options.forbiddenValues), ...referenceFindings(artefact.content, 'json', options.references ?? []));
  }
  if (artefact.type === 'yaml') {
    findings.push(...yamlFindings(artefact.content, options.schema), ...valuePolicyFindings(artefact.content, 'yaml', options.requiredValues, options.forbiddenValues), ...referenceFindings(artefact.content, 'yaml', options.references ?? []));
  }
  if (artefact.type === 'gherkin') {
    findings.push(...verifyGherkin(artefact.content));
  }
  if (artefact.type === 'test') {
    findings.push(...generatedTestFindings(artefact.content, options));
  }
  if (artefact.type === 'page-object') {
    findings.push(...verifyPageObject(artefact.content));
  }
  return findings;
}

function generatedTestFindings(content: string, options: VerifyOptions): StaticFinding[] {
  const findings: StaticFinding[] = [];
  const hasScenario = /Scenario:/.test(content);
  const hasStep = /\b(Given|When|Then)\b/.test(content);
  if (!hasScenario && !hasStep) {
    findings.push({ code: 'discovery', severity: 'high', message: 'Generated test was not discovered', deterministic: true });
  }
  if (/assert\.(ok|equal|strictEqual)\(\s*true\s*,\s*true\s*\)/.test(content) || /expect\(true\)\.to\.equal\(true\)/.test(content)) {
    findings.push({ code: 'always-pass', severity: 'high', message: 'Test asserts true against true', deterministic: true });
  }
  if (hasStep && !/Then\s+\S+/.test(content) && !/\bassert\./.test(content)) {
    findings.push({ code: 'missing-assertion', severity: 'high', message: 'Test has no assertion', deterministic: true });
  }
  if (options.negativeText && !content.includes(options.negativeText)) {
    findings.push({ code: 'negative-case', severity: 'high', message: 'Configured negative case is missing', deterministic: true });
  }
  return findings;
}

async function executeSuppliedTest(code: string, options: VerifyOptions): Promise<StaticFinding[]> {
  if (forbiddenFindings(code).length > 0) {
    return [];
  }
  const sandbox = createArtifactSandbox(options.policy);
  try {
    const result = await sandbox.run({ code, test: options.tests });
    if (result.envKeys.includes('AZURE_OPENAI_API_KEY')) {
      return [{ code: 'sandbox', severity: 'critical', message: 'Sandbox inherited a provider secret', deterministic: true }];
    }
    if (options.knownDefect) {
      return result.ok ? [{ code: 'known-defect', severity: 'high', message: 'Known defect was not detected', deterministic: true }] : [];
    }
    if (options.expectedPass !== false && !result.ok) {
      return [{ code: 'unit-test', severity: 'high', message: result.message ?? 'Supplied test failed', deterministic: true }];
    }
    return [];
  } finally {
    await sandbox.dispose();
  }
}

async function semanticFindings(artefact: GeneratedArtifact, judge: SemanticJudge): Promise<StaticFinding[]> {
  const response = await judge.execute({
    messages: [{ role: 'user', content: `Quote an excerpt from this artefact and score it.\n${artefact.content}` }],
  });
  const structured = response.output.structured as { excerpt?: string; score?: number } | undefined;
  const excerpt = structured?.excerpt ?? '';
  if (!artefact.content.includes(excerpt) || excerpt.length === 0) {
    return [{ code: 'semantic', severity: 'medium', message: 'Semantic check was not grounded in the source', deterministic: false }];
  }
  if (typeof structured?.score === 'number' && structured.score < 0.5) {
    return [{ code: 'semantic', severity: 'medium', message: 'Semantic check scored the artefact below 0.5', deterministic: false }];
  }
  return [];
}

export interface SuiteVerification {
  status: 'pass' | 'fail';
  results: VerificationResult[];
}

export async function verifyExistingSuite(input: { artefacts: GeneratedArtifact[]; feature?: string; steps?: string }): Promise<SuiteVerification> {
  const results: VerificationResult[] = [];
  for (const artefact of input.artefacts) {
    results.push(await verifyArtefact(artefact));
  }
  if (input.feature && input.steps) {
    const stepFindings = verifySteps(input.feature, input.steps);
    results.push({
      status: stepFindings.some((finding) => finding.severity === 'medium' || finding.severity === 'high' || finding.severity === 'critical') ? 'fail' : 'pass',
      findings: stepFindings,
      evidence: { artefactHash: artefactHash(input.steps), verifierId: VERIFIER_ID, policy: DEFAULT_ARTIFACT_EXECUTION_POLICY },
    });
  }
  return { status: results.every((result) => result.status === 'pass') ? 'pass' : 'fail', results };
}

export function sameRulesRegardlessOfOrigin(left: VerificationResult, right: VerificationResult): boolean {
  return left.status === right.status && JSON.stringify(left.findings) === JSON.stringify(right.findings);
}

export function reportByType(results: Array<VerificationResult & { type: string }>): Record<string, { pass: number; fail: number }> {
  const report: Record<string, { pass: number; fail: number }> = {};
  for (const result of results) {
    const bucket = report[result.type] ?? { pass: 0, fail: 0 };
    bucket[result.status] += 1;
    report[result.type] = bucket;
  }
  return report;
}

export function artefactBaseline(results: VerificationResult[]): { hash: string; statuses: string[] } {
  const statuses = results.map((result) => result.status);
  return { hash: artefactHash(JSON.stringify(statuses)), statuses };
}

export function bddFromVerified(bundle: TestGenieBundle, verification: TestGenieVerification, testCaseId: string) {
  assertReadyForCodeGeneration(verification);
  const testCase = bundle.testCases.find((item) => item.id === testCaseId);
  const acceptance = bundle.acceptanceTests.find((item) => item.id === testCase?.acceptanceTestId);
  if (!testCase || !acceptance) {
    throw new Error('Verified test case was not found');
  }
  const generated = generateBdd(testCase, verification, { requirementId: acceptance.requirementId, acceptanceTestId: acceptance.id });
  return cucumberPlan(generated);
}

export function traceSuite(results: ScenarioResult[]) {
  const links = traceExecution(results);
  return {
    links,
    byRequirement: (requirementId: string) => evidenceForRequirement(links, requirementId),
    failedRequirement: (scenario: string) => requirementForScenario(links, scenario),
  };
}
