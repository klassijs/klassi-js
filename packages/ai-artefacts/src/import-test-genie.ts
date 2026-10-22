import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { featureFromCases, pageObjectFromFeature, stepsFromCases, unboundSteps } from './bdd.js';
import { expandUiSteps, stripProductUrls, urlFromCase } from './uiSteps.js';
import { bindCasesToNodes, fetchProductHtml, harvestInteractiveNodes, loginProduct, resolveProductUrl } from './locatorBind.js';
import { extraNavUrls, mergeDomExamples, navRowsFromNodes, normalizeHref } from './outlineExamples.js';
import { isSyntheticSuite, realizeCasesFromDom } from './realizeFromDom.js';
import { TestGenieArtifactProvider, verifyTestGenieBundle, type TestGenieBundle, type TestGenieCase, type TestGenieVerification } from './test-genie.js';

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
  skipped: string[];
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

export async function importTestGenieBundle(
  payload: unknown,
  outDir: string,
  options: {
    bindLocators?: boolean;
    env?: NodeJS.ProcessEnv;
    fetch?: typeof fetch;
    harvestDom?: (urls: string[], env: NodeJS.ProcessEnv) => Promise<import('./locatorBind.js').DomNode[]>;
  } = {},
): Promise<ImportResult> {
  const bundle = provider.load(payload);
  const env = options.env ?? process.env;
  const shouldBind = options.bindLocators === true;
  let boundCases = bundle.testCases.map(expandUiSteps);
  const productUrl = boundCases.map((testCase) => urlFromCase(testCase)).find(Boolean) || String(env.PRODUCT_BASE_URL || '').replace(/\/+$/, '');
  if (productUrl) {
    boundCases = boundCases.map((testCase) => (
      testCase.page || testCase.steps.every((step) => step.api)
        ? testCase
        : expandUiSteps({ ...testCase, page: { name: 'app', url: productUrl } })
    ));
  }
  const bindFindings: string[] = [];
  if (shouldBind) {
    const bound = await bindBundleToProduct(boundCases, env, options);
    boundCases = bound.cases;
    bindFindings.push(...bound.findings);
  }
  const verification = verifyTestGenieBundle({ ...bundle, testCases: boundCases }, true);
  const written = verification.outcome === 'VERIFIED'
    ? await writeBundle({ ...bundle, testCases: boundCases }, verification, outDir, env.PRODUCT_BASE_URL || '')
    : { imported: [], skipped: [], unbound: [] };
  const findings = [...verification.findings, ...bindFindings, ...written.unbound];
  await mkdir(path.join(outDir, '.klassi', 'test-genie'), { recursive: true });
  await writeFile(
    path.join(outDir, '.klassi', 'test-genie', `${safeName(bundle.generationId)}.json`),
    JSON.stringify({ generationId: bundle.generationId, sourceSystem: bundle.sourceSystem, outcome: verification.outcome, findings, imported: written.imported, skipped: written.skipped }, null, 2),
  );
  return { generationId: bundle.generationId, sourceSystem: bundle.sourceSystem, outcome: verification.outcome, findings, imported: written.imported, skipped: written.skipped };
}

async function writeBundle(
  bundle: TestGenieBundle,
  verification: TestGenieVerification,
  outDir: string,
  fallbackUrl = '',
): Promise<{ imported: ImportedArtefact[]; skipped: string[]; unbound: string[] }> {
  const cases = bundle.testCases.flatMap((testCase) => {
    const acceptance = bundle.acceptanceTests.find((item) => item.id === testCase.acceptanceTestId);
    return acceptance ? [{ testCase, acceptance }] : [];
  });
  const productUrl = cases.map(({ testCase }) => urlFromCase(expandUiSteps(testCase))).find(Boolean) || String(fallbackUrl || '').replace(/\/+$/, '');
  const imported: ImportedArtefact[] = [];
  const skipped: string[] = [];
  const unbound: string[] = [];
  for (const group of featureGroups(bundle, cases)) {
    const uiUrl = group.cases.every(({ testCase }) => testCase.steps.length > 0 && testCase.steps.every((step) => step.api))
      ? ''
      : productUrl;
    const featureText = featureFromCases(group.title, group.cases.map(({ testCase, acceptance }) => ({
      testCase,
      trace: { requirementId: acceptance.requirementId, acceptanceTestId: acceptance.id },
    })), verification, { productUrl: uiUrl });
    const name = safeName(group.id);
    const feature = path.join(outDir, 'features', `${name}.feature`);
    const steps = path.join(outDir, 'step_definitions', `${name}-steps.js`);
    const pageObject = path.join(outDir, 'page-objects', `${name}.js`);
    if (existsSync(feature) || existsSync(steps) || existsSync(pageObject)) {
      const existing = [
        existsSync(feature) ? await readFile(feature, 'utf8') : '',
        existsSync(steps) ? await readFile(steps, 'utf8') : '',
        existsSync(pageObject) ? await readFile(pageObject, 'utf8') : '',
      ];
      if (!isSyntheticSuite(existing[0], existing[1], existing[2])) {
        await refreshExistingFeature(feature, featureText);
        await stripUrlsInFile(steps);
        await stripUrlsInFile(pageObject);
        skipped.push(group.id);
        continue;
      }
    }
    await mkdir(path.dirname(feature), { recursive: true });
    await mkdir(path.dirname(steps), { recursive: true });
    await mkdir(path.dirname(pageObject), { recursive: true });
    const caseList = group.cases.map(({ testCase }) => testCase);
    await writeFile(feature, stripProductUrls(featureText));
    await writeFile(steps, stripProductUrls(stepsFromCases(featureText, `../page-objects/${name}`, caseList)));
    await writeFile(pageObject, stripProductUrls(pageObjectFromFeature(featureText, caseList)));
    unbound.push(...unboundSteps(caseList));
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
  return { imported, skipped, unbound };
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

async function refreshExistingFeature(file: string, featureText: string): Promise<void> {
  if (!existsSync(file)) return;
  const current = await readFile(file, 'utf8');
  const next = stripProductUrls(mergeDomExamples(current, featureText));
  if (next !== current) {
    await writeFile(file, next);
  }
}

async function stripUrlsInFile(file: string): Promise<void> {
  if (!existsSync(file)) return;
  const current = await readFile(file, 'utf8');
  const next = stripProductUrls(current);
  if (next !== current) {
    await writeFile(file, next);
  }
}

async function bindBundleToProduct(
  cases: TestGenieCase[],
  env: NodeJS.ProcessEnv,
  options: {
    fetch?: typeof fetch;
    harvestDom?: (urls: string[], env: NodeJS.ProcessEnv) => Promise<import('./locatorBind.js').DomNode[]>;
  },
): Promise<{ cases: TestGenieCase[]; findings: string[] }> {
  const urls = [...new Set(cases.map((item) => resolveProductUrl(item.page?.url, env)).filter((item): item is string => Boolean(item)))];
  if (urls.length === 0) {
    return { cases, findings: ['Product URL is missing; locators were not harvested'] };
  }
  const findings: string[] = [];
  try {
    const nodes = await harvestPages(urls, env, options, true);
    const allNodes = await withNavPages(nodes, urls, env, options);
    const rows = navRowsFromNodes(allNodes, urls[0] || '');
    const bound = realizeCasesFromDom(bindCasesToNodes(cases, allNodes), allNodes, rows);
    findings.push(`Harvested ${allNodes.length} DOM node${allNodes.length === 1 ? '' : 's'} from ${urls.length} page${urls.length === 1 ? '' : 's'}`);
    if (rows.length > 0) {
      findings.push(`Wrote ${rows.length} menu test${rows.length === 1 ? '' : 's'} from the live DOM`);
    }
    return { cases: bound, findings };
  } catch (error) {
    findings.push(error instanceof Error ? error.message : String(error));
    return { cases, findings };
  }
}

async function harvestPages(
  urls: string[],
  env: NodeJS.ProcessEnv,
  options: {
    fetch?: typeof fetch;
    harvestDom?: (urls: string[], env: NodeJS.ProcessEnv) => Promise<import('./locatorBind.js').DomNode[]>;
  },
  followNav = false,
): Promise<import('./locatorBind.js').DomNode[]> {
  if (options.harvestDom) {
    const nodes = [];
    for (const url of urls) {
      nodes.push(...(await options.harvestDom([url], env)).map((node) => ({ ...node, pageUrl: node.pageUrl || url })));
    }
    return nodes;
  }
  if (options.fetch) {
    const cookie = await loginProduct(env, options.fetch);
    const nodes = [];
    for (const url of urls) {
      nodes.push(...harvestInteractiveNodes(await fetchProductHtml(url, cookie, options.fetch)).map((node) => ({ ...node, pageUrl: url })));
    }
    return nodes;
  }
  return harvestFromBrowser(urls, env, followNav);
}

async function withNavPages(
  nodes: import('./locatorBind.js').DomNode[],
  urls: string[],
  env: NodeJS.ProcessEnv,
  options: {
    fetch?: typeof fetch;
    harvestDom?: (urls: string[], env: NodeJS.ProcessEnv) => Promise<import('./locatorBind.js').DomNode[]>;
  },
): Promise<import('./locatorBind.js').DomNode[]> {
  const extras = extraNavUrls(nodes, urls).filter((url) => !nodes.some((node) => normalizeHref(node.pageUrl) === normalizeHref(url)));
  if (extras.length === 0) return nodes;
  return [...nodes, ...await harvestPages(extras, env, options)];
}

async function harvestFromBrowser(urls: string[], env: NodeJS.ProcessEnv, followNav = false) {
  const { harvestProductWithBrowser } = await import('./browserHarvest.js');
  return harvestProductWithBrowser(urls, { env, followNav });
}
