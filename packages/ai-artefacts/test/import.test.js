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
  assert.match(await readFile(result.imported[0].pageObject, 'utf8'), /global\.browser/);
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
