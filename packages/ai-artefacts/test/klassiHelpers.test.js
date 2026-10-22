import assert from 'node:assert/strict';
import test from 'node:test';
import { helperForStep } from '../dist/klassiHelpers.js';

const testCase = {
  id: 'TC-1',
  acceptanceTestId: 'AT-1',
  title: 'Home',
  preconditions: ['ready'],
  coverage: ['positive', 'negative', 'boundary'],
  page: { name: 'app', url: 'https://klassi.co.uk' },
  steps: [],
};

test('a navigate step uses helpers.loadPage and does not need a page-object method', () => {
  const helper = helperForStep({ action: 'a visitor opens https://klassi.co.uk', expected: 'the page is ready' }, testCase, null);
  assert.equal(helper.name, 'loadPage');
  assert.equal(helper.expression, 'await helpers.loadPage(env.base_url)');
});

test('a click step uses helpers.waitAndClick', () => {
  const helper = helperForStep({
    action: 'the user clicks the login button',
    expected: 'shown',
    target: { name: 'loginButton', type: 'button', find: { by: 'testid', value: 'login-submit' } },
  }, testCase, '[data-testid="login-submit"]');
  assert.equal(helper.name, 'waitAndClick');
  assert.match(helper.expression, /helpers\.waitAndClick\('\[data-testid="login-submit"\]'\)/);
});

test('an API step uses helpers.apiCall', () => {
  const helper = helperForStep({
    action: 'I send a POST request to /orders',
    expected: '201',
    api: { method: 'POST', path: '/orders', expectedStatus: 201 },
  }, testCase, null);
  assert.equal(helper.name, 'apiCall');
  assert.match(helper.expression, /helpers\.apiCall\(/);
});

test('an API step never writes the product URL into the test', () => {
  const helper = helperForStep({
    action: 'I send a GET request',
    expected: '200',
    api: { method: 'GET', path: 'https://klassi.co.uk/orders', expectedStatus: 200 },
  }, testCase, null);
  assert.match(helper.expression, /\/orders/);
  assert.doesNotMatch(helper.expression, /https:\/\//);
});

test('a displayed check has no helper so a page-object method can be created', () => {
  const helper = helperForStep({
    action: 'the Klassi logo is displayed',
    expected: 'the Klassi logo is displayed',
    target: { name: 'klassiLogo', type: 'link', find: { by: 'text', value: 'Klassi logo' } },
  }, testCase, '=Klassi logo');
  assert.equal(helper, null);
});
