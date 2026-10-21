import type { TestGenieCase, TestGenieFind, TestGenieStep, TestGenieTarget } from './test-genie.js';

export interface DomNode {
  tag?: string;
  testid?: string;
  name?: string;
  id?: string;
  aria?: string;
  text?: string;
}

export function harvestInteractiveNodes(html: string): DomNode[] {
  const nodes: DomNode[] = [];
  const tagRe = /<(input|button|select|textarea|a|label|h1|h2|h3|img|article)\b([^>]*)>(?:([^<]*))?/gi;
  let match = tagRe.exec(html);
  while (match) {
    const attrs = match[2] ?? '';
    const text = String(match[3] || attr(attrs, 'alt') || attr(attrs, 'value') || attr(attrs, 'placeholder') || '')
      .replace(/\s+/g, ' ')
      .trim();
    nodes.push({
      tag: match[1]?.toLowerCase(),
      testid: attr(attrs, 'data-testid'),
      name: attr(attrs, 'name'),
      id: attr(attrs, 'id'),
      aria: attr(attrs, 'aria-label'),
      text: text || undefined,
    });
    match = tagRe.exec(html);
  }
  return nodes.filter((node) => node.testid || node.name || node.id || node.aria || node.text);
}

export function bindCasesToNodes(cases: TestGenieCase[], nodes: DomNode[]): TestGenieCase[] {
  return cases.map((testCase) => ({
    ...testCase,
    steps: testCase.steps.map((step) => bindStep(step, nodes)),
  }));
}

export function resolveProductUrl(pageUrl: string | undefined, env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = String(pageUrl || env.PRODUCT_START_PATH || '/').trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(env.PRODUCT_BASE_URL || '').replace(/\/+$/, '');
  if (!base) return null;
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

export async function loginProduct(env: NodeJS.ProcessEnv, fetchImpl: typeof fetch = fetch): Promise<string> {
  const loginUrl = String(env.PRODUCT_LOGIN_URL || '').trim();
  const user = String(env.PRODUCT_USER || '').trim();
  const password = String(env.PRODUCT_PASSWORD || '').trim();
  if (!loginUrl || !user || !password) return '';
  const response = await fetchImpl(loginUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: user, email: user, password }).toString(),
    redirect: 'manual',
  });
  return cookieHeader(response);
}

export async function fetchProductHtml(
  url: string,
  cookie: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const response = await fetchImpl(url, { headers: cookie ? { cookie } : undefined });
  if (!response.ok) {
    throw new Error(`Product page returned HTTP ${response.status}`);
  }
  return response.text();
}

function bindStep(step: TestGenieStep, nodes: DomNode[]): TestGenieStep {
  if (step.api) return step;
  const needle = normalize(step.target?.find.value || '');
  if (!needle) return step;
  const hit = nodes
    .map((node) => ({ node, score: matchScore(node, needle) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)[0]?.node;
  if (!hit) return step;
  const find = preferFind(hit);
  if (!find) return step;
  const target: TestGenieTarget = {
    name: step.target?.name || 'element',
    type: step.target?.type || (hit.tag === 'input' || hit.tag === 'textarea' || hit.tag === 'select' ? 'input' : 'button'),
    find,
  };
  return { ...step, target };
}

function preferFind(node: DomNode): TestGenieFind | null {
  if (node.testid) return { by: 'testid', value: node.testid };
  if (node.aria) return { by: 'label', value: node.aria };
  if (node.name) return { by: 'name', value: node.name };
  if (node.id) return { by: 'id', value: node.id };
  if (node.text) return { by: 'text', value: node.text };
  return null;
}

function matchScore(node: DomNode, needle: string): number {
  const fields = [node.testid, node.aria, node.text, node.name, node.id].map(normalize).filter(Boolean);
  if (fields.includes(needle)) return 2;
  if (fields.some((field) => field.includes(needle) || needle.includes(field))) return 1;
  return 0;
}

function normalize(value: string | undefined): string {
  return String(value || '').trim().toLowerCase();
}

function attr(attrs: string, name: string): string | undefined {
  const match = attrs.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match?.[1];
}

function cookieHeader(response: Response): string {
  const many = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
  if (many.length > 0) {
    return many.map((item) => item.split(';', 1)[0]).filter(Boolean).join('; ');
  }
  const single = response.headers.get('set-cookie');
  return single ? single.split(';', 1)[0] : '';
}
