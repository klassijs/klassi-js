import assert from 'node:assert/strict';
import test from 'node:test';
import { bindCasesToNodes, findFromNode, harvestInteractiveNodes, loginProduct, resolveProductUrl } from '../dist/locatorBind.js';

test('harvest prefers data-testid on interactive nodes', () => {
  const nodes = harvestInteractiveNodes('<form><button data-testid="login-submit" aria-label="login">Sign in</button></form>');
  assert.equal(nodes[0].testid, 'login-submit');
  assert.equal(nodes[0].aria, 'login');
});

test('harvest reads menu links from nav', () => {
  const nodes = harvestInteractiveNodes('<header><nav><a href="/">Home</a><a href="/contact">Contact Us</a></nav></header><h1>Welcome</h1><footer><a href="https://linkedin.com">LinkedIn</a></footer>');
  const contact = nodes.find((node) => node.text === 'Contact Us');
  assert.equal(contact.href, '/contact');
  assert.equal(contact.inNav, true);
  assert.equal(nodes.find((node) => node.text === 'LinkedIn')?.inNav, false);
});

test('bind matches Klassi logo to trademark alt text in the DOM', () => {
  const nodes = harvestInteractiveNodes('<img alt="klassi trademark logo" />');
  const [bound] = bindCasesToNodes([{
    id: 'TC-1',
    acceptanceTestId: 'AT-1',
    title: 'Home',
    preconditions: ['ready'],
    coverage: ['positive', 'negative', 'boundary'],
    steps: [{
      action: 'the Klassi logo is displayed',
      expected: 'the Klassi logo is displayed',
      target: { name: 'klassiLogo', type: 'link', find: { by: 'text', value: 'Klassi logo' } },
    }],
  }], nodes);
  assert.deepEqual(bound.steps[0].target.find, { by: 'css', value: 'img[alt="klassi trademark logo"]', fromDom: true });
  assert.equal(bound.steps[0].target.name, 'klassiLogo');
});

test('bind keeps method names and uses DOM locators for heading and cards', () => {
  const nodes = harvestInteractiveNodes('<h1>Welcome to the Klassi Brand</h1><img alt="Klassi trademark logo" /><h3>KlassiTech</h3><h3>TestGenie</h3>');
  const [bound] = bindCasesToNodes([{
    id: 'TC-1',
    acceptanceTestId: 'AT-1',
    title: 'Home',
    preconditions: ['ready'],
    coverage: ['positive', 'negative', 'boundary'],
    steps: [
      { action: 'the Klassi logo is displayed', expected: 'the Klassi logo is displayed', target: { name: 'klassiLogo', type: 'link', find: { by: 'text', value: 'Klassi logo', fromDom: false } } },
      { action: 'the welcome heading is displayed', expected: 'the welcome heading is displayed', target: { name: 'welcomeHeading', type: 'link', find: { by: 'text', value: 'welcome heading', fromDom: false } } },
      { action: 'the KlassiTech card is displayed', expected: 'the KlassiTech card is displayed', target: { name: 'klassitechCard', type: 'link', find: { by: 'text', value: 'KlassiTech card', fromDom: false } } },
      { action: 'the TestGenie card is displayed', expected: 'the TestGenie card is displayed', target: { name: 'testgenieCard', type: 'link', find: { by: 'text', value: 'TestGenie card', fromDom: false } } },
    ],
  }], nodes);
  assert.equal(bound.steps[0].target.name, 'klassiLogo');
  assert.deepEqual(bound.steps[0].target.find, { by: 'css', value: 'img[alt="Klassi trademark logo"]', fromDom: true });
  assert.equal(bound.steps[1].target.name, 'welcomeHeading');
  assert.deepEqual(bound.steps[1].target.find, { by: 'css', value: 'h1=Welcome to the Klassi Brand', fromDom: true });
  assert.equal(bound.steps[2].target.name, 'klassitechCard');
  assert.deepEqual(bound.steps[2].target.find, { by: 'css', value: 'h3=KlassiTech', fromDom: true });
  assert.equal(bound.steps[3].target.name, 'testgenieCard');
  assert.deepEqual(bound.steps[3].target.find, { by: 'css', value: 'h3=TestGenie', fromDom: true });
});

test('harvest reads headings and image alt text', () => {
  const nodes = harvestInteractiveNodes('<h1>Welcome</h1><img alt="Klassi logo" /><article>KlassiTech</article>');
  assert.equal(nodes.some((node) => node.text === 'Welcome'), true);
  assert.equal(nodes.some((node) => node.text === 'Klassi logo'), true);
  assert.equal(nodes.some((node) => node.text === 'KlassiTech'), true);
});

test('the standard locator order uses ID then name then unique content, never a shared class', () => {
  assert.deepEqual(findFromNode({ id: 'contact', name: 'contact', className: 'nav-item', tag: 'a', text: 'Contact Us' }), { by: 'id', value: 'contact' });
  assert.deepEqual(findFromNode({ name: 'email', tag: 'input' }), { by: 'name', value: 'email' });
  assert.deepEqual(findFromNode({ className: 'display-4 fw-bold text-light', tag: 'h1', text: 'About Us' }), { by: 'css', value: 'h1=About Us' });
  assert.deepEqual(findFromNode({ className: 'hero-title', tag: 'h1', text: 'Welcome' }), { by: 'css', value: 'h1=Welcome' });
  assert.deepEqual(findFromNode({ tag: 'a', text: 'Contact Us', href: '/contact' }), { by: 'link', value: 'Contact Us' });
  assert.deepEqual(findFromNode({ tag: 'img', alt: 'klassi trademark logo' }), { by: 'css', value: 'img[alt="klassi trademark logo"]' });
  assert.deepEqual(findFromNode({ tag: 'article', text: 'KlassiTech' }), { by: 'xpath', value: '//article[normalize-space()="KlassiTech"]' });
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
  assert.deepEqual(bound.steps[0].target.find, { by: 'testid', value: 'login-submit', fromDom: true });
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
