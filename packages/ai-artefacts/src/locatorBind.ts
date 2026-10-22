import type { TestGenieCase, TestGenieFind, TestGenieStep, TestGenieTarget } from './test-genie.js';

export interface DomNode {
  tag?: string;
  testid?: string;
  name?: string;
  id?: string;
  className?: string;
  aria?: string;
  alt?: string;
  text?: string;
  href?: string;
  inNav?: boolean;
  pageUrl?: string;
}

export function harvestInteractiveNodes(html: string): DomNode[] {
  const navKeys = new Set(
    navSections(html).flatMap((section) => readNodes(section).filter((node) => node.tag === 'a').map(navKey)),
  );
  return readNodes(html).map((node) => (
    node.tag === 'a' ? { ...node, inNav: navKeys.has(navKey(node)) } : node
  ));
}

function readNodes(html: string): DomNode[] {
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
      className: attr(attrs, 'class'),
      aria: attr(attrs, 'aria-label'),
      alt: attr(attrs, 'alt'),
      text: text || undefined,
      href: match[1]?.toLowerCase() === 'a' ? attr(attrs, 'href') : undefined,
    });
    match = tagRe.exec(html);
  }
  return nodes.filter((node) => node.testid || node.name || node.id || node.className || node.aria || node.text || node.href);
}

function navSections(html: string): string[] {
  const sections: string[] = [];
  const named = /<(nav|header)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match = named.exec(html);
  while (match) {
    sections.push(match[2] || '');
    match = named.exec(html);
  }
  const role = /<[^>]+role=["']navigation["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/gi;
  match = role.exec(html);
  while (match) {
    sections.push(match[1] || '');
    match = role.exec(html);
  }
  return sections;
}

function navKey(node: DomNode): string {
  return `${String(node.href || '').trim().toLowerCase()}|${String(node.text || '').trim().toLowerCase()}`;
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
  const find = findFromNode(hit);
  if (!find) return step;
  const target: TestGenieTarget = {
    name: step.target?.name || 'element',
    type: step.target?.type || (hit.tag === 'input' || hit.tag === 'textarea' || hit.tag === 'select' ? 'input' : 'button'),
    find: { ...find, fromDom: true },
  };
  return { ...step, target };
}

export function findFromNode(node: DomNode): TestGenieFind | null {
  const id = String(node.id || '').trim();
  if (node.testid) return { by: 'testid', value: node.testid };
  if (id && !AUTO_ID.test(id)) return { by: 'id', value: id };
  const name = String(node.name || '').trim();
  if (name) return { by: 'name', value: name };
  if (node.aria) return { by: 'label', value: node.aria };
  const css = cssFromNode(node);
  if (css) return { by: 'css', value: css };
  const xpath = xpathFromNode(node);
  if (xpath) return { by: 'xpath', value: xpath };
  const className = usefulClass(node.className);
  if (className) return { by: 'class', value: className };
  if (node.tag && !GENERIC_TAGS.has(node.tag)) return { by: 'tag', value: node.tag };
  return null;
}

const GENERIC_TAGS = new Set(['a', 'div', 'span', 'p', 'li', 'ul', 'section', 'article', 'img', 'svg', 'label']);
const AUTO_ID = /^(ember|react|vue|ng-|:)/i;
const UTILITY_CLASS = /^(text-|mb-|mt-|ml-|mr-|ms-|me-|p-|px-|py-|pt-|pb-|pl-|pr-|d-|col-|row-|w-|h-|flex|justify-|align-|container$|col$|row$|show$|hide$|active$|collapsed$|display-|fw-|fs-|lh-|btn|nav-link|nav-item|navbar-|form-|card|badge|alert|rounded|shadow|border|bg-|img-|visually-|sr-only|fade$|offcanvas|dropdown|list-group|sticky-|fixed-|position-|overflow-)/i;

function usefulClass(className: string | undefined): string | undefined {
  return String(className || '')
    .split(/\s+/)
    .map((item) => item.trim())
    .find((item) => item.length > 1 && !UTILITY_CLASS.test(item) && !/[:/]/.test(item));
}

function cssFromNode(node: DomNode): string | undefined {
  const alt = node.alt || (node.tag === 'img' ? node.text : undefined);
  if (node.tag === 'img' && alt) return `img[alt="${escapeAttr(alt)}"]`;
  if (node.tag === 'a') {
    const href = hrefFromNode(node);
    if (href) return `${node.inNav ? 'nav a' : 'a'}[href="${escapeAttr(href)}"]`;
  }
  return undefined;
}

function xpathFromNode(node: DomNode): string | undefined {
  const text = String(node.text || '').replace(/\s+/g, ' ').trim();
  const tag = node.tag || '*';
  const scope = node.inNav && tag === 'a' ? '//nav//' : '//';
  if (text) {
    const plain = text.replace(/[™®©]/g, '').replace(/"/g, '');
    if (plain !== text) return `${scope}${tag}[contains(normalize-space(), "${escapeAttr(plain)}")]`;
    return `${scope}${tag}[normalize-space()="${escapeAttr(text)}"]`;
  }
  if (node.alt) return `${scope}${tag}[@alt="${escapeAttr(node.alt)}"]`;
  const href = hrefFromNode(node);
  if (href) return `${scope}${tag}[@href="${escapeAttr(href)}"]`;
  return undefined;
}

function hrefFromNode(node: DomNode): string | undefined {
  const href = String(node.href || '').trim();
  if (!href || href === '#' || SKIP_HREF.test(href)) return undefined;
  if (/^https?:\/\//i.test(href)) {
    try {
      return new URL(href).pathname || '/';
    } catch {
      return href;
    }
  }
  return href;
}

const SKIP_HREF = /^(mailto:|tel:|javascript:)/i;

export function matchScore(node: DomNode, needle: string): number {
  const fields = [node.testid, node.aria, node.alt, node.text, node.name, node.id, node.className].map(normalize).filter(Boolean);
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
