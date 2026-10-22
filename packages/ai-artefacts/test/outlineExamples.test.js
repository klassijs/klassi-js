import assert from 'node:assert/strict';
import test from 'node:test';
import { extraNavUrls, navRowsFromNodes } from '../dist/outlineExamples.js';

const nodes = [
  { tag: 'h1', text: 'Welcome to the Klassi Brand', pageUrl: 'https://klassi.co.uk/' },
  { tag: 'a', text: 'Home', href: '/', inNav: true, pageUrl: 'https://klassi.co.uk/' },
  { tag: 'a', text: 'Contact Us', href: '/contact', inNav: true, pageUrl: 'https://klassi.co.uk/' },
  { tag: 'h1', text: 'Get in Touch', pageUrl: 'https://klassi.co.uk/contact' },
];

test('menu links become destination URLs and heading rows', () => {
  assert.deepEqual(extraNavUrls(nodes, ['https://klassi.co.uk/']), ['https://klassi.co.uk/contact']);
  assert.deepEqual(navRowsFromNodes(nodes, 'https://klassi.co.uk/'), [
    { navigation_link: 'Home', main_heading: 'Welcome to the Klassi Brand', href: 'https://klassi.co.uk/' },
    { navigation_link: 'Contact Us', main_heading: 'Get in Touch', href: 'https://klassi.co.uk/contact' },
  ]);
});
