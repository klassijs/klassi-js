import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { generateBdd } from './bdd.js';
import { TestGenieArtifactProvider, verifyTestGenieBundle, type TestGenieBundle, type TestGenieVerification } from './test-genie.js';

export interface ImportedArtefact {
  id: string;
  requirementId: string;
  acceptanceTestId: string;
  feature: string;
  steps: string;
  pageObject: string;
}

export interface ImportResult {
  generationId: string;
  sourceSystem?: string;
  outcome: TestGenieVerification['outcome'];
  findings: string[];
  imported: ImportedArtefact[];
}

const provider = new TestGenieArtifactProvider();

export async function readBundle(fileOrDir: string): Promise<unknown> {
  const info = await stat(fileOrDir);
  const file = info.isDirectory() ? path.join(fileOrDir, 'bundle.json') : fileOrDir;
  return JSON.parse(await readFile(file, 'utf8')) as unknown;
}

export async function fetchBundle(generationId: string, env: NodeJS.ProcessEnv = process.env): Promise<unknown> {
  const base = env.TEST_GENIE_URL;
  const token = env.TEST_GENIE_TOKEN;
  if (!base || !token) {
    throw new Error('TEST_GENIE_URL and TEST_GENIE_TOKEN are required');
  }
  const url = new URL(`/v1/generations/${encodeURIComponent(generationId)}`, base.endsWith('/') ? base : `${base}/`);
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!response.ok) {
    throw new Error(`Test Genie returned HTTP ${response.status}`);
  }
  return response.json() as Promise<unknown>;
}

export async function importTestGenieBundle(payload: unknown, outDir: string): Promise<ImportResult> {
  const bundle = provider.load(payload);
  const verification = verifyTestGenieBundle(bundle, true);
  const imported = verification.outcome === 'VERIFIED' ? await writeBundle(bundle, verification, outDir) : [];
  await mkdir(path.join(outDir, '.klassi', 'test-genie'), { recursive: true });
  await writeFile(
    path.join(outDir, '.klassi', 'test-genie', `${safeName(bundle.generationId)}.json`),
    JSON.stringify({ generationId: bundle.generationId, sourceSystem: bundle.sourceSystem, outcome: verification.outcome, findings: verification.findings, imported }, null, 2),
  );
  return { generationId: bundle.generationId, sourceSystem: bundle.sourceSystem, outcome: verification.outcome, findings: verification.findings, imported };
}

async function writeBundle(bundle: TestGenieBundle, verification: TestGenieVerification, outDir: string): Promise<ImportedArtefact[]> {
  const imported: ImportedArtefact[] = [];
  for (const testCase of bundle.testCases) {
    const acceptance = bundle.acceptanceTests.find((item) => item.id === testCase.acceptanceTestId);
    if (!acceptance) {
      continue;
    }
    const plan = generateBdd(testCase, verification, { requirementId: acceptance.requirementId, acceptanceTestId: acceptance.id });
    const name = safeName(testCase.id);
    const feature = path.join(outDir, 'features', `${name}.feature`);
    const steps = path.join(outDir, 'step_definitions', `${name}-steps.js`);
    const pageObject = path.join(outDir, 'page-objects', `${name}.js`);
    await mkdir(path.dirname(feature), { recursive: true });
    await mkdir(path.dirname(steps), { recursive: true });
    await mkdir(path.dirname(pageObject), { recursive: true });
    await writeFile(feature, plan.feature);
    await writeFile(steps, plan.steps);
    await writeFile(pageObject, plan.pageObject);
    imported.push({ id: testCase.id, requirementId: acceptance.requirementId, acceptanceTestId: acceptance.id, feature, steps, pageObject });
  }
  return imported;
}

function safeName(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, '_');
}
