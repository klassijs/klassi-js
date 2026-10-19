import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { featureFromCases, pageObjectFromFeature, stepsFromFeature } from './bdd.js';
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
  const cases = bundle.testCases.flatMap((testCase) => {
    const acceptance = bundle.acceptanceTests.find((item) => item.id === testCase.acceptanceTestId);
    return acceptance ? [{ testCase, acceptance }] : [];
  });
  const imported: ImportedArtefact[] = [];
  for (const group of featureGroups(bundle, cases)) {
    const featureText = featureFromCases(group.title, group.cases.map(({ testCase, acceptance }) => ({
      testCase,
      trace: { requirementId: acceptance.requirementId, acceptanceTestId: acceptance.id },
    })), verification);
    const name = safeName(group.id);
    const feature = path.join(outDir, 'features', `${name}.feature`);
    const steps = path.join(outDir, 'step_definitions', `${name}-steps.js`);
    const pageObject = path.join(outDir, 'page-objects', `${name}.js`);
    await mkdir(path.dirname(feature), { recursive: true });
    await mkdir(path.dirname(steps), { recursive: true });
    await mkdir(path.dirname(pageObject), { recursive: true });
    await writeFile(feature, featureText);
    await writeFile(steps, stepsFromFeature(featureText));
    await writeFile(pageObject, pageObjectFromFeature(featureText));
    for (const { testCase, acceptance } of group.cases) {
      imported.push({
        id: testCase.id,
        requirementId: acceptance.requirementId,
        acceptanceTestId: acceptance.id,
        feature,
        steps,
        pageObject,
      });
    }
  }
  return imported;
}

function featureGroups(
  bundle: TestGenieBundle,
  cases: Array<{ testCase: TestGenieBundle['testCases'][number]; acceptance: TestGenieBundle['acceptanceTests'][number] }>,
) {
  const titles = new Map((bundle.features ?? []).map((feature) => [feature.id, feature.title]));
  const groups = new Map<string, { id: string; title: string; cases: typeof cases }>();
  const ungrouped: typeof cases = [];
  for (const item of cases) {
    const id = item.testCase.featureId;
    if (!id) {
      ungrouped.push(item);
      continue;
    }
    const group = groups.get(id) ?? { id, title: titles.get(id) || id, cases: [] };
    group.cases.push(item);
    groups.set(id, group);
  }
  if (ungrouped.length > 0) {
    const title = bundle.title?.trim() || (ungrouped.length === 1 ? ungrouped[0].testCase.title : 'Imported tests');
    groups.set(title, { id: title, title, cases: ungrouped });
  }
  return [...groups.values()];
}

function safeName(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, '_');
}
