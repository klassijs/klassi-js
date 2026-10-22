import type { TestGenieCase, TestGenieFind, TestGenieStep, TestGenieTarget } from './test-genie.js';

export interface DomNode {
  tag?: string;
  testid?: string;
  name?: string;
  id?: string;
  aria?: string;
  alt?: string;
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
      alt: attr(attrs, 'alt'),
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
  if (!hit) {
    if (step.target?.find.fromDom === false) {
      return { ...step, target: { ...step.target, find: { by: 'text', value: '', fromDom: false } } };
    }
    return step;
  }
  const find = preferFind(hit);
  if (!find) return step;
  const target: TestGenieTarget = {
    name: step.target?.name || 'element',
    type: step.target?.type || (hit.tag === 'input' || hit.tag === 'textarea' || hit.tag === 'select' ? 'input' : 'button'),
    find: { ...find, fromDom: true },
  };
  return { ...step, target };
}

function preferFind(node: DomNode): TestGenieFind | null {
  if (node.testid) return { by: 'testid', value: node.testid };
  const alt = node.alt || (node.tag === 'img' ? node.text : undefined);
  if (node.tag === 'img' && alt) {
    return { by: 'css', value: `img[alt="${escapeAttr(alt)}"]` };
  }
  if (node.tag && /^h[1-6]$/.test(node.tag) && node.text) {
    const plain = node.text.replace(/[™®©]/g, '').replace(/\s+/g, ' ').trim();
    const selector = plain !== node.text ? `${node.tag}*=${plain}` : `${node.tag}=${node.text}`;
    return { by: 'css', value: selector };
  }
  if (node.aria) return { by: 'label', value: node.aria };
  if (node.name) return { by: 'name', value: node.name };
  if (node.id) return { by: 'id', value: node.id };
  if (node.text) return { by: 'text', value: node.text };
  return null;
}

export function matchScore(node: DomNode, needle: string): number {
  const fields = [node.testid, node.aria, node.alt, node.text, node.name, node.id].map(normalize).filter(Boolean);
  if (fields.includes(normalize(needle))) return 4;
  const wanted = contentTokens(needle);
  const role = tokens(needle).find((token) => Boolean(ROLE_TAGS[token]));
  let score = 0;
  if (wanted.length > 0 && fields.some((field) => wanted.every((token) => tokens(field).includes(token) || field.includes(token)))) {
    score += 2;
  } else if (wanted.length > 0 && fields.some((field) => wanted.some((token) => field.includes(token)))) {
    score += 1;
  }
  if (role && ROLE_TAGS[role].includes(node.tag || '')) {
    score += 1;
  }
  return score;
}

function normalize(value: string | undefined): string {
  return String(value || '').trim().toLowerCase();
}

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'and', 'of', 'for']);
const ROLE_TAGS: Record<string, string[]> = {
  logo: ['img', 'svg'],
  heading: ['h1', 'h2', 'h3', 'h4'],
  title: ['h1', 'h2'],
  card: ['article', 'h3', 'section', 'img'],
  image: ['img', 'svg'],
  button: ['button'],
  link: ['a'],
};

function contentTokens(value: string): string[] {
  return tokens(value).filter((token) => !ROLE_TAGS[token]);
}

function tokens(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOP.has(token));
}

function escapeAttr(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
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
