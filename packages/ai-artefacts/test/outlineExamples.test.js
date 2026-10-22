import assert from 'node:assert/strict';
import test from 'node:test';
import { extraNavUrls, fillOutlineExamples, mergeDomExamples, navRowsFromNodes, needsDomExamples } from '../dist/outlineExamples.js';

const outlineCase = {
  id: 'TC-1',
  acceptanceTestId: 'AT-1',
  title: 'Visitor selects a navigation link and opens the corresponding page displaying the correct main heading',
  preconditions: ['ready'],
  coverage: ['positive', 'negative', 'boundary'],
  steps: [{
    action: 'the visitor selects the "<navigation_link>" navigation link',
    expected: 'the "<page_name>" page displays "<main_heading>"',
  }],
  examples: {
    headers: ['navigation_link', 'page_name', 'main_heading'],
    rows: [{ navigation_link: 'example1', page_name: 'example2', main_heading: 'example3' }],
  },
};

test('placeholder navigation examples are filled from the menu and page headings', () => {
  assert.equal(needsDomExamples(outlineCase), true);
  const nodes = [
    { tag: 'h1', text: 'Welcome to the Klassi Brand', pageUrl: 'https://klassi.co.uk/' },
    { tag: 'a', text: 'Home', href: '/', inNav: true, pageUrl: 'https://klassi.co.uk/' },
    { tag: 'a', text: 'Contact Us', href: '/contact', inNav: true, pageUrl: 'https://klassi.co.uk/' },
    { tag: 'h1', text: 'Get in Touch', pageUrl: 'https://klassi.co.uk/contact' },
  ];
  assert.deepEqual(extraNavUrls(nodes, ['https://klassi.co.uk/']), ['https://klassi.co.uk/contact']);
  const [filled] = fillOutlineExamples([outlineCase], navRowsFromNodes(nodes, 'https://klassi.co.uk/'));
  assert.deepEqual(filled.examples.rows, [
    { navigation_link: 'Home', page_name: 'Home', main_heading: 'Welcome to the Klassi Brand' },
    { navigation_link: 'Contact Us', page_name: 'Contact Us', main_heading: 'Get in Touch' },
  ]);
});

test('real examples are left alone', () => {
  const workflow = {
    ...outlineCase,
    title: 'Select a workflow',
    steps: [{ action: 'the user chooses <workflow>', expected: 'the pipeline is <pipeline>' }],
    examples: {
      headers: ['workflow', 'pipeline'],
      rows: [{ workflow: 'Journals', pipeline: 'JATS2SCJATS' }],
    },
  };
  assert.equal(needsDomExamples(workflow), false);
  const [kept] = fillOutlineExamples([workflow], [{
    navigation_link: 'Home',
    page_name: 'Home',
    main_heading: 'Welcome',
    href: 'https://klassi.co.uk/',
  }]);
  assert.deepEqual(kept.examples.rows, [{ workflow: 'Journals', pipeline: 'JATS2SCJATS' }]);
});

test('mergeDomExamples replaces dummy rows and leaves real tables', () => {
  const current = [
    '    Examples:',
    '      | navigation_link | page_name | main_heading |',
    '      | example1 | example2 | example3 |',
    '',
  ].join('\n');
  const next = [
    '    Examples:',
    '      | navigation_link | page_name | main_heading |',
    '      | Contact Us | Contact Us | Get in Touch |',
    '',
  ].join('\n');
  assert.match(mergeDomExamples(current, next), /Contact Us \| Contact Us \| Get in Touch/);
  assert.doesNotMatch(mergeDomExamples(current, next), /example1/);
  const real = '    Examples:\n      | workflow | pipeline |\n      | Journals | JATS2SCJATS |\n';
  assert.equal(mergeDomExamples(real, next), real);
});
