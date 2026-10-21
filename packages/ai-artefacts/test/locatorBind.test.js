import assert from 'node:assert/strict';
import test from 'node:test';
import { bindCasesToNodes, harvestInteractiveNodes, loginProduct, resolveProductUrl } from '../dist/locatorBind.js';

test('harvest prefers data-testid on interactive nodes', () => {
  const nodes = harvestInteractiveNodes('<form><button data-testid="login-submit" aria-label="login">Sign in</button></form>');
  assert.equal(nodes[0].testid, 'login-submit');
  assert.equal(nodes[0].aria, 'login');
});

test('harvest reads headings and image alt text', () => {
  const nodes = harvestInteractiveNodes('<h1>Welcome</h1><img alt="Klassi logo" /><article>KlassiTech</article>');
  assert.equal(nodes.some((node) => node.text === 'Welcome'), true);
  assert.equal(nodes.some((node) => node.text === 'Klassi logo'), true);
  assert.equal(nodes.some((node) => node.text === 'KlassiTech'), true);
});

test('bind upgrades a matching label to data-testid', () => {
  const nodes = harvestInteractiveNodes('<button data-testid="login-submit" aria-label="login">Sign in</button>');
  const [bound] = bindCasesToNodes([{
    id: 'TC-1',
    acceptanceTestId: 'AT-1',
    title: 'Sign in',
    preconditions: ['ready'],
    coverage: ['positive', 'negative', 'boundary'],
    steps: [{
      action: 'the user clicks the login button',
      expected: 'shown',
      target: { name: 'loginButton', type: 'button', find: { by: 'label', value: 'login' } },
    }],
  }], nodes);
  assert.deepEqual(bound.steps[0].target.find, { by: 'testid', value: 'login-submit' });
});

test('resolveProductUrl joins the product base', () => {
  assert.equal(resolveProductUrl('/login', { PRODUCT_BASE_URL: 'https://klassi.co.uk' }), 'https://klassi.co.uk/login');
  assert.equal(resolveProductUrl('https://klassi.co.uk/app', { PRODUCT_BASE_URL: 'https://other.test' }), 'https://klassi.co.uk/app');
});

test('login posts credentials and returns the session cookie', async () => {
  const fetchImpl = async (url, init) => {
    assert.equal(String(url), 'https://klassi.co.uk/login');
    assert.equal(init.method, 'POST');
    assert.match(String(init.body), /username=tester/);
    assert.match(String(init.body), /password=secret/);
    return new Response('', {
      status: 302,
      headers: { 'set-cookie': 'session=abc; Path=/; HttpOnly' },
    });
  };
  const cookie = await loginProduct({
    PRODUCT_LOGIN_URL: 'https://klassi.co.uk/login',
    PRODUCT_USER: 'tester',
    PRODUCT_PASSWORD: 'secret',
  }, fetchImpl);
  assert.equal(cookie, 'session=abc');
});
