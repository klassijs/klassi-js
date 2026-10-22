import type { TestGenieCase, TestGenieExamples } from './test-genie.js';
import type { DomNode } from './locatorBind.js';

export interface NavExampleRow {
  navigation_link: string;
  page_name: string;
  main_heading: string;
  href: string;
}

const MAX_NAV = 8;
const SKIP_LINK = /^(skip|cookie|privacy|terms|login|log in|sign in|sign up|register|twitter|x|linkedin|facebook|instagram|youtube|github|email|mail|rss)$/i;
const SKIP_HREF = /^(mailto:|tel:|javascript:)/i;

export function isPlaceholderExamples(examples?: TestGenieExamples): boolean {
  if (!examples || examples.headers.length === 0 || examples.rows.length === 0) return true;
  return examples.rows.every((row) => examples.headers.every((header) => {
    const value = String(row[header] ?? '').trim();
    return !value || /^example\d+$/i.test(value);
  }));
}

export function needsDomExamples(testCase: TestGenieCase): boolean {
  if (!isPlaceholderExamples(testCase.examples)) return false;
  const headers = testCase.examples?.headers ?? [];
  if (headers.some((header) => /nav|link|page|heading|menu|title/i.test(header))) return true;
  const blob = [testCase.title, ...testCase.steps.map((step) => `${step.action} ${step.expected}`)].join(' ');
  return /navigation|nav(?:igation)? link|menu|main heading|page_name|<[^>]+>/.test(blob);
}

export function headingFromNodes(nodes: DomNode[]): string {
  const heading = nodes.find((node) => node.tag === 'h1' && node.text)
    || nodes.find((node) => node.tag === 'h2' && node.text);
  return String(heading?.text || '').replace(/\s+/g, ' ').trim();
}

export function navLinksFromNodes(nodes: DomNode[]): DomNode[] {
  const links = nodes.filter(isMenuLink);
  const inMenu = links.filter((node) => node.inNav);
  const chosen = inMenu.length > 0 ? inMenu : links;
  const seen = new Set<string>();
  const unique: DomNode[] = [];
  for (const node of chosen) {
    const key = `${normalize(node.text)}|${normalizeHref(node.href)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(node);
    if (unique.length >= MAX_NAV) break;
  }
  return unique;
}

export function extraNavUrls(nodes: DomNode[], homeUrls: string[]): string[] {
  const home = homeUrls[0] || '';
  const known = new Set(homeUrls.map(normalizeHref).filter(Boolean));
  const extras: string[] = [];
  for (const link of navLinksFromNodes(nodes)) {
    const href = resolveHref(link.href || '', home);
    if (!href || known.has(normalizeHref(href))) continue;
    if (home && !sameOrigin(href, home)) continue;
    extras.push(href);
    known.add(normalizeHref(href));
  }
  return extras;
}

export function navRowsFromNodes(nodes: DomNode[], homeUrl: string): NavExampleRow[] {
  return navLinksFromNodes(nodes).map((link) => {
    const name = String(link.text || '').replace(/\s+/g, ' ').trim();
    const href = resolveHref(link.href || '', homeUrl);
    return {
      navigation_link: name,
      page_name: name,
      main_heading: headingFor(nodes, href, homeUrl) || name,
      href,
    };
  });
}

export function fillOutlineExamples(cases: TestGenieCase[], rows: NavExampleRow[]): TestGenieCase[] {
  if (rows.length === 0) return cases;
  return cases.map((testCase) => {
    if (!needsDomExamples(testCase)) return testCase;
    const headers = testCase.examples?.headers?.length
      ? testCase.examples.headers
      : ['navigation_link', 'page_name', 'main_heading'];
    return {
      ...testCase,
      examples: {
        headers,
        rows: rows.map((row) => mapExampleRow(headers, row)),
      },
    };
  });
}

export function resolveHref(href: string, base: string): string {
  const raw = String(href || '').trim();
  if (!raw) return '';
  try {
    return new URL(raw, base || 'https://example.invalid/').toString();
  } catch {
    return raw;
  }
}

export function mergeDomExamples(current: string, next: string): string {
  if (!hasDummyExampleCells(current)) return current;
  const tables = [...next.matchAll(/[ \t]*Examples:\n(?:[ \t]*\|.+\|\n)+/g)].map((match) => match[0]);
  if (tables.length === 0 || tables.every((table) => hasDummyExampleCells(table))) return current;
  let index = 0;
  return current.replace(/[ \t]*Examples:\n(?:[ \t]*\|.+\|\n)+/g, (block) => {
    if (!hasDummyExampleCells(block)) return block;
    return tables[index++] || block;
  });
}

function hasDummyExampleCells(text: string): boolean {
  return /\|\s*example\d+\s*\|/i.test(text);
}

export function normalizeHref(value: string | undefined): string {
  return String(value || '').trim().replace(/\/+$/, '').toLowerCase();
}

function headingFor(nodes: DomNode[], href: string, homeUrl: string): string {
  const dest = normalizeHref(href);
  const home = normalizeHref(homeUrl);
  const scoped = nodes.filter((node) => node.pageUrl && normalizeHref(node.pageUrl) === dest);
  if (scoped.length > 0) return headingFromNodes(scoped);
  if (dest && dest === home) return headingFromNodes(nodes.filter((node) => !node.pageUrl || normalizeHref(node.pageUrl) === home));
  return '';
}

function mapExampleRow(headers: string[], row: NavExampleRow): Record<string, string> {
  const values = [row.navigation_link, row.page_name, row.main_heading];
  const mapped: Record<string, string> = {};
  headers.forEach((header, index) => {
    const key = header.toLowerCase().replace(/\s+/g, '_');
    if (/nav|link|menu/.test(key)) mapped[header] = row.navigation_link;
    else if (/heading|title/.test(key)) mapped[header] = row.main_heading;
    else if (/page/.test(key)) mapped[header] = row.page_name;
    else mapped[header] = values[index] || row.navigation_link;
  });
  return mapped;
}

function isMenuLink(node: DomNode): boolean {
  if (node.tag !== 'a') return false;
  const text = String(node.text || '').replace(/\s+/g, ' ').trim();
  const href = String(node.href || '').trim();
  if (!text || text.length > 48) return false;
  if (SKIP_LINK.test(text) || /logo|trademark|[™®]/.test(text)) return false;
  if (SKIP_HREF.test(href) || href === '#' || href.startsWith('#') || href.startsWith('?')) return false;
  return Boolean(href || node.inNav);
}

function sameOrigin(url: string, base: string): boolean {
  try {
    return new URL(url).origin === new URL(base).origin;
  } catch {
    return false;
  }
}

function normalize(value: string | undefined): string {
  return String(value || '').trim().toLowerCase();
}
