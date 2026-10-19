import { createHash } from 'node:crypto';

export const TEST_GENIE_CONTRACT_VERSION = '1.0.0';

export type VerificationOutcome = 'REJECTED' | 'REVIEW_REQUIRED' | 'VERIFIED';

export interface TestGenieRequirement {
  id: string;
  statement: string;
}

export interface TestGenieAcceptanceTest {
  id: string;
  requirementId: string;
  statement: string;
}

export interface TestGenieStep {
  action: string;
  expected: string;
}

export interface TestGenieFeature {
  id: string;
  title: string;
}

export interface TestGenieCase {
  id: string;
  acceptanceTestId: string;
  featureId?: string;
  title: string;
  preconditions: string[];
  steps: TestGenieStep[];
  coverage: Array<'positive' | 'negative' | 'boundary'>;
}

export interface TestGenieDocument {
  id: string;
  hash?: string;
}

export interface TestGenieBundle {
  contractVersion: string;
  generationId: string;
  generatedAt: string;
  sourceSystem?: 'test-genie-repo' | 'test-genie-saas' | string;
  title?: string;
  features?: TestGenieFeature[];
  sourceDocument?: TestGenieDocument;
  requirements: TestGenieRequirement[];
  acceptanceTests: TestGenieAcceptanceTest[];
  testCases: TestGenieCase[];
}

export interface TestArtifactProvider {
  readonly id: string;
  readonly contractVersion: string;
  load(payload: unknown): TestGenieBundle;
}

export interface TestGenieVerification {
  outcome: VerificationOutcome;
  findings: string[];
}

const AMBIGUOUS = /^(should work|tbd|todo|n\/a)?$/i;

export class TestGenieArtifactProvider implements TestArtifactProvider {
  readonly id = 'test-genie';
  readonly contractVersion = TEST_GENIE_CONTRACT_VERSION;

  load(payload: unknown): TestGenieBundle {
    const bundle = payload as Partial<TestGenieBundle>;
    if (bundle.contractVersion !== this.contractVersion) {
      throw new Error(`Unsupported Test Genie contract version "${String(bundle.contractVersion)}"`);
    }
    if (!bundle.generationId || !bundle.generatedAt) {
      throw new Error('Test Genie generation id and timestamp are required');
    }
    if (bundle.sourceDocument?.hash && !/^[a-f0-9]{64}$/i.test(bundle.sourceDocument.hash)) {
      throw new Error('Source document hash must be SHA-256');
    }
    return {
      contractVersion: bundle.contractVersion,
      generationId: bundle.generationId,
      generatedAt: bundle.generatedAt,
      sourceSystem: bundle.sourceSystem,
      title: bundle.title,
      features: bundle.features,
      sourceDocument: bundle.sourceDocument,
      requirements: bundle.requirements ?? [],
      acceptanceTests: bundle.acceptanceTests ?? [],
      testCases: bundle.testCases ?? [],
    };
  }
}

export function verifyTestGenieBundle(bundle: TestGenieBundle, requiredCoverage = false): TestGenieVerification {
  const findings: string[] = [];
  const requirementIds = new Set(bundle.requirements.map((item) => item.id));
  const acceptanceIds = new Set(bundle.acceptanceTests.map((item) => item.id));
  const seenCases = new Set<string>();

  for (const acceptance of bundle.acceptanceTests) {
    if (!requirementIds.has(acceptance.requirementId)) {
      findings.push(`Acceptance test ${acceptance.id} has no requirement`);
    }
  }
  for (const testCase of bundle.testCases) {
    if (seenCases.has(testCase.id)) {
      findings.push(`Duplicate test case ${testCase.id}`);
    }
    seenCases.add(testCase.id);
    if (!acceptanceIds.has(testCase.acceptanceTestId)) {
      findings.push(`Test case ${testCase.id} has no acceptance test`);
    }
    if (testCase.preconditions.length === 0) {
      findings.push(`Test case ${testCase.id} has no preconditions`);
    }
    if (testCase.steps.length === 0 || testCase.steps.some((step) => step.action.trim().length === 0 || step.expected.trim().length === 0)) {
      findings.push(`Test case ${testCase.id} needs steps and expected results`);
    }
    if (testCase.steps.some((step) => AMBIGUOUS.test(step.expected.trim()))) {
      findings.push(`Test case ${testCase.id} has ambiguous expected behaviour`);
    }
    if (requiredCoverage) {
      for (const kind of ['positive', 'negative', 'boundary'] as const) {
        if (!testCase.coverage.includes(kind)) {
          findings.push(`Test case ${testCase.id} is missing ${kind} coverage`);
        }
      }
    }
  }

  const titles = bundle.testCases.map((item) => item.title.trim().toLowerCase());
  if (new Set(titles).size !== titles.length) {
    findings.push('Conflicting test cases share a title');
  }

  if (findings.some((item) => item.includes('no requirement') || item.includes('no acceptance') || item.includes('Duplicate'))) {
    return { outcome: 'REJECTED', findings };
  }
  if (findings.length > 0) {
    return { outcome: 'REVIEW_REQUIRED', findings };
  }
  return { outcome: 'VERIFIED', findings: [] };
}

export function assertReadyForCodeGeneration(verification: TestGenieVerification): void {
  if (verification.outcome !== 'VERIFIED') {
    throw new Error(`Unverified artefacts cannot enter code generation (${verification.outcome})`);
  }
}

export interface RegenerationRecord {
  generationId: string;
  outcome: VerificationOutcome;
  findings: string[];
}

export function recordRegeneration(history: RegenerationRecord[], next: RegenerationRecord, maxAttempts: number): RegenerationRecord[] {
  if (history.length >= maxAttempts) {
    throw new Error(`Regeneration stopped after ${maxAttempts} attempts`);
  }
  return [...history, next];
}

export function sourceHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}
