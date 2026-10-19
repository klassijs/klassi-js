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
