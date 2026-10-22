import type { TestGenieCase } from './test-genie.js';
import { selectorFromTarget } from './bdd.js';
import { findFromNode, type DomNode } from './locatorBind.js';
import { navLinksFromNodes, normalizeHref, type NavExampleRow } from './outlineExamples.js';

export function isNavCase(testCase: TestGenieCase): boolean {
  const blob = caseBlob(testCase);
  if (isNegativeDomGuess(blob)) return false;
  return /navigation link|nav link|\bmenu\b|main heading/i.test(blob)
    || Boolean(testCase.examples?.headers.some((header) => /nav|link|page_name|main_heading|heading/i.test(header)));
}

export function isUnverifiableFromDom(testCase: TestGenieCase): boolean {
  return isNegativeDomGuess(caseBlob(testCase));
}

export function realizeCasesFromDom(cases: TestGenieCase[], nodes: DomNode[], rows: NavExampleRow[]): TestGenieCase[] {
  let wroteNav = false;
  return cases.flatMap((testCase) => {
    if (isUnverifiableFromDom(testCase)) return [];
    if (isNavCase(testCase) && rows.length > 0) {
      if (wroteNav) return [];
      wroteNav = true;
      return [navOutlineFromRows(testCase, rows, nodes)];
    }
    return [testCase];
  });
}

export function isSyntheticSuite(feature: string, steps = '', pageObject = ''): boolean {
  const blob = `${feature}\n${steps}\n${pageObject}`;
  const individualMenu = /Scenario: Visitor opens .+ from the menu/.test(feature)
    || /Scenario Outline: Visitor opens <navigation_link> from the menu/.test(feature);
  return /\|\s*example\d+\s*\|/i.test(blob)
    || /unbound:/i.test(pageObject)
    || /pause\(0\)/.test(pageObject)
    || /a visitor is on any public page/i.test(blob)
    || /": "=[^"]+"/.test(pageObject)
    || /h[1-6]\*?=/.test(pageObject)
    || /\.display-/.test(pageObject)
    || individualMenu;
}

function navOutlineFromRows(testCase: TestGenieCase, rows: NavExampleRow[], nodes: DomNode[]): TestGenieCase {
  const locators = locatorsFromHarvest(rows, nodes);
  return {
    ...testCase,
    title: 'Visitor selects a navigation link from the menu',
    locators,
    steps: [
      {
        action: 'the visitor selects the "<navigation_link>" navigation link',
        expected: 'the "<heading>" heading is displayed',
      },
    ],
    examples: {
      headers: ['navigation_link', 'heading'],
      rows: rows
        .map((row) => ({ navigation_link: row.navigation_link, heading: row.main_heading }))
        .filter((row) => locators.menus?.[row.navigation_link] && locators.headings?.[row.heading]),
    },
  };
}

function locatorsFromHarvest(rows: NavExampleRow[], nodes: DomNode[]): NonNullable<TestGenieCase['locators']> {
  const links = navLinksFromNodes(nodes);
  const menus: Record<string, string> = {};
  const headings: Record<string, string> = {};
  for (const row of rows) {
    const link = links.find((node) => normalize(node.text) === normalize(row.navigation_link));
    const menu = locatorFromHarvestedNode(link);
    if (menu) menus[row.navigation_link] = menu;
    const destNodes = nodes.filter((node) => node.pageUrl && normalizeHref(node.pageUrl) === normalizeHref(row.href));
    const headingNode = destNodes.find((node) => node.text && normalize(node.text) === normalize(row.main_heading) && /^h[1-6]$/.test(node.tag || ''))
      || destNodes.find((node) => node.tag === 'h1' || node.tag === 'h2');
    const heading = locatorFromHarvestedNode(headingNode);
    if (heading) headings[row.main_heading] = heading;
  }
  return { menus, headings };
}

function locatorFromHarvestedNode(node: DomNode | undefined): string {
  if (!node) return '';
  const find = findFromNode(node);
  if (!find) return '';
  return selectorFromTarget({
    name: 'element',
    type: node.tag === 'a' ? 'link' : 'button',
    find: { ...find, fromDom: true },
  }) || '';
}

function caseBlob(testCase: TestGenieCase): string {
  return [testCase.title, ...testCase.steps.map((step) => `${step.action} ${step.expected}`)].join(' ');
}

function isNegativeDomGuess(blob: string): boolean {
  return /\b(fail|fails|failed|error|unavailable|not available|network issues?|blank page|application error)\b/i.test(blob);
}

function normalize(value: string | undefined): string {
  return String(value || '').trim().toLowerCase();
}
