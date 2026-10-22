import assert from 'node:assert/strict';
import test from 'node:test';
import { isSyntheticSuite, realizeCasesFromDom } from '../dist/realizeFromDom.js';

const navCase = {
  id: 'TC-6',
  acceptanceTestId: 'AT-6',
  title: 'Visitor selects a navigation link and opens the corresponding page displaying the correct main heading',
  preconditions: ['ready'],
  coverage: ['positive', 'negative', 'boundary'],
  steps: [{
    action: 'a visitor is on any public page the visitor selects the "<navigation_link>" navigation link',
    expected: 'the corresponding "<page_name>" page opens and displays its correct main heading as "<main_heading>"',
  }],
  examples: {
    headers: ['navigation_link', 'page_name', 'main_heading'],
    rows: [{ navigation_link: 'example1', page_name: 'example2', main_heading: 'example3' }],
  },
};

const rows = [
  { navigation_link: 'Home', main_heading: 'Welcome to the Klassi Brand', href: 'https://klassi.co.uk/' },
  { navigation_link: 'Contact Us', main_heading: 'Get in Touch', href: 'https://klassi.co.uk/contact' },
];

const nodes = [
  { tag: 'h1', text: 'Welcome to the Klassi Brand', pageUrl: 'https://klassi.co.uk/' },
  { tag: 'a', text: 'Home', href: '/', inNav: true, pageUrl: 'https://klassi.co.uk/' },
  { tag: 'a', text: 'Contact Us', href: '/contact', inNav: true, pageUrl: 'https://klassi.co.uk/' },
  { tag: 'h1', text: 'Get in Touch', pageUrl: 'https://klassi.co.uk/contact' },
];

test('a nav outline stays one scenario outline with locators from the DOM', () => {
  const realized = realizeCasesFromDom([
    navCase,
    { ...navCase, id: 'TC-7', title: 'Visitor attempts to select a navigation link that is not available' },
  ], nodes, rows);
  assert.equal(realized.length, 1);
  assert.equal(realized[0].title, 'Visitor selects a navigation link from the menu');
  assert.deepEqual(realized[0].examples?.headers, ['navigation_link', 'heading']);
  assert.deepEqual(realized[0].examples?.rows, [
    { navigation_link: 'Home', heading: 'Welcome to the Klassi Brand' },
    { navigation_link: 'Contact Us', heading: 'Get in Touch' },
  ]);
  assert.equal(realized[0].locators?.menus.Home, 'nav a[href="/"]');
  assert.equal(realized[0].locators?.menus['Contact Us'], 'nav a[href="/contact"]');
  assert.equal(realized[0].locators?.headings['Get in Touch'], '//h1[normalize-space()="Get in Touch"]');
  assert.equal(realized[0].locators?.headings['Welcome to the Klassi Brand'], '//h1[normalize-space()="Welcome to the Klassi Brand"]');
});

test('invented failure cases are not written from the DOM', () => {
  const realized = realizeCasesFromDom([{
    ...navCase,
    id: 'TC-2',
    title: 'Homepage fails to load properly with application error',
    steps: [{ action: 'a visitor opens the website', expected: 'the page is ready' }],
    examples: undefined,
  }], nodes, []);
  assert.deepEqual(realized, []);
});

test('synthetic suites are the dummy outline and unbound stubs', () => {
  assert.equal(isSyntheticSuite('Examples:\n      | example1 | example2 | example3 |\n'), true);
  assert.equal(isSyntheticSuite('', '', '  // unbound: click the link\n  async step1() {\n    await global.browser.pause(0);\n  }'), true);
  assert.equal(isSyntheticSuite('Feature: Home\n  Scenario: Visitor opens Contact Us from the menu\n'), true);
  assert.equal(isSyntheticSuite('', '', '  async welcomeHeading() {\n    await global.browser.$(\'.display-4\').waitForDisplayed();\n  }'), true);
  assert.equal(isSyntheticSuite('Feature: Home\n  Scenario Outline: Visitor selects a navigation link from the menu\n    Examples:\n      | Home | Welcome |\n'), false);
  assert.equal(isSyntheticSuite('Feature: Home\n  Scenario: Visitor sees the logo\n    Then the Klassi logo is displayed\n'), false);
});
