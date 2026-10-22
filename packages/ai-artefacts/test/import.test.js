import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fetchBundle, importTestGenieBundle, readBundle } from '../dist/import-test-genie.js';

const bundle = {
  contractVersion: '1.0.0',
  generationId: 'gen-1',
  generatedAt: '2026-10-19T00:00:00.000Z',
  sourceSystem: 'test-genie-repo',
  requirements: [{ id: 'BR-1', statement: 'The date parser accepts an ISO value.' }],
  acceptanceTests: [{ id: 'AT-1', requirementId: 'BR-1', statement: 'A valid date is accepted.' }],
  testCases: [{
    id: 'TC-1',
    acceptanceTestId: 'AT-1',
    title: 'Parse a date',
    preconditions: ['A date string is available'],
    steps: [{ action: 'the user submits 2026-10-19', expected: 'the date is accepted' }],
    coverage: ['positive', 'negative', 'boundary'],
  }],
};

test('a folder bundle is verified and written as Cucumber files', async () => {
  const folder = await mkdtemp(path.join(tmpdir(), 'wdrive-'));
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const { writeFile } = await import('node:fs/promises');
  await writeFile(path.join(folder, 'bundle.json'), JSON.stringify(bundle));
  const result = await importTestGenieBundle(await readBundle(folder), out);
  assert.equal(result.outcome, 'VERIFIED');
  assert.equal(result.sourceSystem, 'test-genie-repo');
  assert.match(await readFile(result.imported[0].feature, 'utf8'), /Feature: Parse a date/);
  assert.match(await readFile(result.imported[0].steps, 'utf8'), /async function/);
  assert.match(await readFile(result.imported[0].pageObject, 'utf8'), /unbound:/);
});

test('every scenario in a bundle is written into one feature file', async () => {
  const folder = await mkdtemp(path.join(tmpdir(), 'wdrive-'));
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const { writeFile } = await import('node:fs/promises');
  const second = {
    ...bundle,
    title: 'Date parsing',
    testCases: [
      ...bundle.testCases,
      { ...bundle.testCases[0], id: 'TC-2', title: 'Reject a date' },
    ],
  };
  await writeFile(path.join(folder, 'bundle.json'), JSON.stringify(second));
  const result = await importTestGenieBundle(await readBundle(folder), out);
  assert.equal(result.imported.length, 2);
  assert.equal(result.imported[0].feature, result.imported[1].feature);
  const feature = await readFile(result.imported[0].feature, 'utf8');
  assert.match(feature, /Feature: Date parsing/);
  assert.equal(feature.split('\n').filter((line) => line.trim().startsWith('Scenario:')).length, 2);
});

test('scenarios stay inside the feature they were exported from', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const grouped = {
    ...bundle,
    features: [
      { id: 'TG-001', title: 'TG-001' },
      { id: 'TG-002', title: 'TG-002' },
    ],
    testCases: [
      { ...bundle.testCases[0], id: 'TC-001', featureId: 'TG-001', title: 'Parse a date' },
      { ...bundle.testCases[0], id: 'TC-002', acceptanceTestId: 'AT-1', featureId: 'TG-001', title: 'Reject a date' },
      { ...bundle.testCases[0], id: 'TC-003', acceptanceTestId: 'AT-1', featureId: 'TG-002', title: 'Show the endpoint' },
    ],
  };
  const result = await importTestGenieBundle(grouped, out);
  const files = [...new Set(result.imported.map((item) => item.feature))];
  assert.deepEqual(files.map((file) => path.basename(file)), ['TG-001.feature', 'TG-002.feature']);
  const first = await readFile(files[0], 'utf8');
  const second = await readFile(files[1], 'utf8');
  assert.equal(first.split('\n').filter((line) => line.trim().startsWith('Scenario:')).length, 2);
  assert.match(second, /Scenario: Show the endpoint/);
  assert.doesNotMatch(second, /Scenario: Parse a date/);
});

test('placeholder navigation examples are replaced from the harvested menu', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const outlined = {
    ...bundle,
    testCases: [{
      ...bundle.testCases[0],
      title: 'Visitor selects a navigation link and opens the corresponding page displaying the correct main heading',
      page: { name: 'app', url: 'https://klassi.co.uk' },
      steps: [{
        action: 'a visitor is on any public page the visitor selects the "<navigation_link>" navigation link',
        expected: 'the corresponding "<page_name>" page opens and displays its correct main heading as "<main_heading>"',
      }],
      examples: {
        headers: ['navigation_link', 'page_name', 'main_heading'],
        rows: [{ navigation_link: 'example1', page_name: 'example2', main_heading: 'example3' }],
      },
    }],
  };
  const result = await importTestGenieBundle(outlined, out, {
    bindLocators: true,
    env: { PRODUCT_BASE_URL: 'https://klassi.co.uk' },
    harvestDom: async (urls) => {
      if (String(urls[0]).includes('/contact')) {
        return [{ tag: 'h1', text: 'Get in Touch' }, { tag: 'a', text: 'Contact Us', href: '/contact', inNav: true }];
      }
      return [
        { tag: 'h1', text: 'Welcome to the Klassi Brand' },
        { tag: 'a', text: 'Contact Us', href: '/contact', inNav: true },
        { tag: 'a', text: 'Home', href: '/', inNav: true },
      ];
    },
  });
  const feature = await readFile(result.imported[0].feature, 'utf8');
  const steps = await readFile(result.imported[0].steps, 'utf8');
  const pageObject = await readFile(result.imported[0].pageObject, 'utf8');
  assert.match(feature, /Scenario Outline: Visitor selects a navigation link from the menu/);
  assert.match(feature, /When the visitor selects the "<navigation_link>" navigation link/);
  assert.match(feature, /Then the "<heading>" heading is displayed/);
  assert.match(feature, /\| Contact Us \| Get in Touch \|/);
  assert.match(feature, /\| Home \| Welcome to the Klassi Brand \|/);
  assert.doesNotMatch(feature, /page opens|example1|example2|example3|any public page/);
  assert.match(steps, /the visitor selects the \{string\} navigation link/);
  assert.match(steps, /page\.selectNavigation/);
  assert.match(pageObject, /nav a\[href=\\"\/contact\\"\]/);
  assert.match(pageObject, /\/\/h1\[normalize-space\(\)=\\"Get in Touch\\"\]/);
  assert.match(pageObject, /selectNavigation/);
  assert.doesNotMatch(pageObject, /unbound:|pause\(0\)|\.display-4/);
  assert.equal(result.findings.some((item) => item.includes('menu test')), true);
});

test('examples on a test case are written into the scenario outline', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const outlined = {
    ...bundle,
    testCases: [{
      ...bundle.testCases[0],
      title: 'Select a workflow',
      examples: {
        headers: ['workflow', 'pipeline'],
        rows: [
          { workflow: 'Journals', pipeline: 'JATS2SCJATS' },
          { workflow: 'Books', pipeline: 'BITS' },
        ],
      },
    }],
  };
  const result = await importTestGenieBundle(outlined, out);
  const feature = await readFile(result.imported[0].feature, 'utf8');
  assert.match(feature, /Scenario Outline: Select a workflow/);
  assert.match(feature, /Examples:/);
  assert.match(feature, /\| workflow \| pipeline \|/);
  assert.match(feature, /\| Journals \| JATS2SCJATS \|/);
  assert.match(feature, /\| Books \| BITS \|/);
});

test('a bound target is written into the page object and step def', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const bound = {
    ...bundle,
    testCases: [{
      ...bundle.testCases[0],
      page: { name: 'app', url: 'https://app.example.com/login' },
      steps: [{
        action: 'the user clicks the login button',
        expected: 'the dashboard is shown',
        target: { name: 'loginButton', type: 'button', find: { by: 'testid', value: 'login-submit' } },
      }],
    }],
  };
  const result = await importTestGenieBundle(bound, out);
  const pageObject = await readFile(result.imported[0].pageObject, 'utf8');
  const steps = await readFile(result.imported[0].steps, 'utf8');
  assert.doesNotMatch(pageObject, /async loginButton\(|waitAndClick/);
  assert.match(steps, /helpers\.waitAndClick\('\[data-testid="login-submit"\]'\)/);
  assert.equal(result.findings.some((item) => item.startsWith('Unbound step:')), false);
});

test('an unbound UI step is reported and stays a stub', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const result = await importTestGenieBundle(bundle, out);
  assert.equal(result.findings.some((item) => item.startsWith('Unbound step:')), true);
  assert.match(await readFile(result.imported[0].pageObject, 'utf8'), /unbound:/);
});

test('an API step does not invent a locator', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const api = {
    ...bundle,
    testCases: [{
      ...bundle.testCases[0],
      title: 'Create an order',
      steps: [{
        action: 'I send a POST request to /orders',
        expected: 'the response status should be 201',
        api: { method: 'POST', path: '/orders', expectedStatus: 201 },
      }],
    }],
  };
  const result = await importTestGenieBundle(api, out);
  const pageObject = await readFile(result.imported[0].pageObject, 'utf8');
  assert.equal(result.findings.some((item) => item.startsWith('Unbound step:')), false);
  assert.doesNotMatch(pageObject, /fetch\(|apiCall/);
  assert.match(await readFile(result.imported[0].steps, 'utf8'), /helpers\.apiCall\(/);
  assert.match(await readFile(result.imported[0].steps, 'utf8'), /POST/);
  assert.match(await readFile(result.imported[0].steps, 'utf8'), /\/orders/);
  assert.doesNotMatch(pageObject, /data-testid|aria\//);
});

test('browser harvest binds the displayed logo from the rendered DOM', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const home = {
    ...bundle,
    testCases: [{
      ...bundle.testCases[0],
      title: 'Visitor sees the home page',
      page: { name: 'app', url: 'https://klassi.co.uk' },
      steps: [{
        action: 'a visitor opens the website',
        expected: 'the Klassi logo is displayed',
      }],
    }],
  };
  const result = await importTestGenieBundle(home, out, {
    bindLocators: true,
    env: { PRODUCT_BASE_URL: 'https://klassi.co.uk' },
    harvestDom: async (urls) => {
      assert.equal(urls[0], 'https://klassi.co.uk');
      return [{ tag: 'img', text: 'klassi trademark logo' }];
    },
  });
  const pageObject = await readFile(result.imported[0].pageObject, 'utf8');
  assert.match(pageObject, /async klassiLogo\(/);
  assert.match(pageObject, /img\[alt="klassi trademark logo"\]/);
  assert.doesNotMatch(pageObject, /\$\('=Klassi logo'\)/);
  assert.match(pageObject, /waitForDisplayed/);
  assert.equal(result.findings.some((item) => item.includes('Harvested 1 DOM node')), true);
});

test('live bind upgrades a label target from the product HTML', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const html = '<button data-testid="login-submit" aria-label="login">Sign in</button>';
  const fetchImpl = async (url) => {
    assert.match(String(url), /login/);
    return new Response(html, { status: 200 });
  };
  const labelled = {
    ...bundle,
    testCases: [{
      ...bundle.testCases[0],
      page: { name: 'app', url: '/login' },
      steps: [{
        action: 'the user clicks the login button',
        expected: 'the dashboard is shown',
        target: { name: 'loginButton', type: 'button', find: { by: 'label', value: 'login' } },
      }],
    }],
  };
  const result = await importTestGenieBundle(labelled, out, {
    bindLocators: true,
    env: { PRODUCT_BASE_URL: 'https://app.example.com' },
    fetch: fetchImpl,
  });
  assert.match(await readFile(result.imported[0].steps, 'utf8'), /helpers\.waitAndClick\('\[data-testid="login-submit"\]'\)/);
});

test('a homepage open and displayed steps become a url and waitForDisplayed', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const home = {
    ...bundle,
    testCases: [{
      ...bundle.testCases[0],
      title: 'Visitor sees the home page',
      steps: [{
        action: 'a visitor opens https://klassi.co.uk the page finishes loading',
        expected: 'the Klassi logo is displayed the welcome heading is displayed the KlassiTech card is displayed the TestGenie card is displayed there is no blank page or application error',
      }],
    }],
  };
  const result = await importTestGenieBundle(home, out);
  const feature = await readFile(result.imported[0].feature, 'utf8');
  const pageObject = await readFile(result.imported[0].pageObject, 'utf8');
  const steps = await readFile(result.imported[0].steps, 'utf8');
  assert.match(feature, /Background:\s*\n\s*Given a visitor opens the website/);
  assert.doesNotMatch(feature, /https:\/\//);
  assert.doesNotMatch(steps, /https:\/\//);
  assert.doesNotMatch(pageObject, /https:\/\//);
  assert.doesNotMatch(feature.split('Scenario:')[1] || '', /When a visitor opens/);
  assert.match(steps, /Given\('a visitor opens the website'/);
  assert.match(steps, /helpers\.loadPage\(env\.base_url\)/);
  assert.doesNotMatch(steps, /page\.openPage|helpers\.loadPage.*openPage/);
  assert.doesNotMatch(pageObject, /async openPage\(|deleteCookies|browser\.url\(/);
  assert.doesNotMatch(pageObject, /\$\('=Klassi logo'\)/);
  assert.match(pageObject, /async klassiLogo\(/);
  assert.doesNotMatch(pageObject, /async step1\(\)/);
});

test('an existing feature keeps its cases but loses the product URL', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const { mkdir, writeFile } = await import('node:fs/promises');
  const existing = path.join(out, 'features', 'TG-001.feature');
  await mkdir(path.dirname(existing), { recursive: true });
  await writeFile(existing, 'Feature: Home\n  Background:\n    Given a visitor opens https://klassi.co.uk\n');
  const result = await importTestGenieBundle({
    ...bundle,
    features: [{ id: 'TG-001', title: 'TG-001' }],
    testCases: [{ ...bundle.testCases[0], featureId: 'TG-001' }],
  }, out);
  assert.deepEqual(result.skipped, ['TG-001']);
  const kept = await readFile(existing, 'utf8');
  assert.match(kept, /Given a visitor opens the website/);
  assert.doesNotMatch(kept, /https:\/\//);
});

test('an existing synthetic outline is rewritten from the live menu', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const { mkdir, writeFile } = await import('node:fs/promises');
  const existing = path.join(out, 'features', 'TG-001.feature');
  await mkdir(path.dirname(existing), { recursive: true });
  await writeFile(existing, [
    'Feature: Home',
    '  Scenario Outline: Visitor selects a navigation link',
    '    When a visitor is on any public page the visitor selects the "<navigation_link>" navigation link',
    '    Then the corresponding "<page_name>" page opens and displays its correct main heading as "<main_heading>"',
    '    Examples:',
    '      | navigation_link | page_name | main_heading |',
    '      | example1 | example2 | example3 |',
    '',
  ].join('\n'));
  const result = await importTestGenieBundle({
    ...bundle,
    features: [{ id: 'TG-001', title: 'TG-001' }],
    testCases: [{
      ...bundle.testCases[0],
      featureId: 'TG-001',
      title: 'Visitor selects a navigation link',
      page: { name: 'app', url: 'https://klassi.co.uk' },
      steps: [{
        action: 'a visitor is on any public page the visitor selects the "<navigation_link>" navigation link',
        expected: 'the corresponding "<page_name>" page opens and displays its correct main heading as "<main_heading>"',
      }],
      examples: {
        headers: ['navigation_link', 'page_name', 'main_heading'],
        rows: [{ navigation_link: 'example1', page_name: 'example2', main_heading: 'example3' }],
      },
    }],
  }, out, {
    bindLocators: true,
    env: { PRODUCT_BASE_URL: 'https://klassi.co.uk' },
    harvestDom: async (urls) => {
      if (String(urls[0]).includes('/contact')) {
        return [{ tag: 'h1', text: 'Get in Touch' }];
      }
      return [
        { tag: 'h1', text: 'Welcome to the Klassi Brand' },
        { tag: 'a', text: 'Contact Us', href: '/contact', inNav: true },
      ];
    },
  });
  assert.equal(result.skipped.length, 0);
  assert.equal(result.imported.length, 1);
  const rewritten = await readFile(existing, 'utf8');
  assert.match(rewritten, /Scenario Outline: Visitor selects a navigation link from the menu/);
  assert.match(rewritten, /When the visitor selects the "<navigation_link>" navigation link/);
  assert.match(rewritten, /Then the "<heading>" heading is displayed/);
  assert.match(rewritten, /\| Contact Us \| Get in Touch \|/);
  assert.doesNotMatch(rewritten, /page opens|example1|any public page/);
});

test('an existing TG feature file is left in place', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const { mkdir, writeFile } = await import('node:fs/promises');
  const existing = path.join(out, 'features', 'TG-001.feature');
  await mkdir(path.dirname(existing), { recursive: true });
  await writeFile(existing, 'Feature: Keep this file\n');
  const result = await importTestGenieBundle({
    ...bundle,
    features: [{ id: 'TG-001', title: 'TG-001' }],
    testCases: [{ ...bundle.testCases[0], featureId: 'TG-001' }],
  }, out);
  assert.deepEqual(result.skipped, ['TG-001']);
  assert.equal(result.imported.length, 0);
  assert.equal(await readFile(existing, 'utf8'), 'Feature: Keep this file\n');
});

test('a rejected bundle does not write Cucumber files', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'klassi-import-'));
  const rejected = { ...bundle, acceptanceTests: [{ id: 'AT-9', requirementId: 'missing', statement: 'orphan' }] };
  const result = await importTestGenieBundle(rejected, out);
  assert.equal(result.outcome, 'REJECTED');
  assert.equal(result.imported.length, 0);
});

test('a SaaS generation is fetched with the bearer token', async () => {
  const server = createServer((request, response) => {
    if (request.headers.authorization !== 'Bearer secret-token') {
      response.writeHead(401);
      response.end();
      return;
    }
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ...bundle, sourceSystem: 'test-genie-saas' }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  try {
    const payload = await fetchBundle('gen-1', { TEST_GENIE_URL: `http://127.0.0.1:${port}`, TEST_GENIE_TOKEN: 'secret-token' });
    assert.equal(payload.sourceSystem, 'test-genie-saas');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
