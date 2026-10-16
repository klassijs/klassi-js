import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  DatasetValidationError,
  hashDataset,
  loadSuiteFile,
  loadSuiteFromJson,
  loadSuiteFromYaml,
  parseAIConfiguration,
} from '../dist/index.js';

const fixtures = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fixtures');

test('JSON and YAML suites load to the same canonical hash', async () => {
  const json = await loadSuiteFile(path.join(fixtures, 'valid-suite.json'));
  const yaml = await loadSuiteFile(path.join(fixtures, 'valid-suite.yaml'));

  assert.equal(json.suite.id, 'support-release');
  assert.equal(json.suite.cases[0].target.adapter, 'azure-openai');
  assert.equal(yaml.suite.cases[0].evaluators[0].type, 'model');
  assert.equal(json.datasetHash, yaml.datasetHash);
  assert.equal(json.datasetHash, hashDataset(json.suite));
  assert.match(json.datasetHash, /^[a-f0-9]{64}$/);
});

test('key order does not change the dataset hash', () => {
  const first = hashDataset({ id: 'suite', name: 'Suite', version: '1' });
  const second = hashDataset({ version: '1', name: 'Suite', id: 'suite' });
  assert.equal(first, second);
});

test('an invalid suite fails before a suite object is returned', async () => {
  const text = await readFile(path.join(fixtures, 'invalid-suite.json'), 'utf8');
  assert.throws(
    () => loadSuiteFromJson(text),
    (error) => {
      assert.ok(error instanceof DatasetValidationError);
      assert.ok(error.issues.some((issue) => issue.path === 'qualityGate'));
      assert.ok(error.issues.some((issue) => issue.path.includes('evaluators') && issue.path.includes('type')));
      return true;
    },
  );
});

test('malformed YAML fails with a root path', () => {
  assert.throws(
    () => loadSuiteFromYaml('cases: [\n'),
    (error) => error instanceof DatasetValidationError && error.issues[0].path === '<root>',
  );
});

test('AI configuration accepts environment variable names and rejects embedded secrets', () => {
  const config = parseAIConfiguration({
    ai: {
      adapters: {
        'azure-openai': {
          profiles: {
            target: {
              endpointEnv: 'AZURE_OPENAI_ENDPOINT',
              deploymentEnv: 'AZURE_OPENAI_DEPLOYMENT',
              credential: { type: 'api-key', apiKeyEnv: 'AZURE_OPENAI_API_KEY' },
            },
          },
        },
      },
      judges: { default: { adapter: 'azure-openai', profile: 'judge' } },
    },
  });
  assert.equal(config.ai.adapters['azure-openai'].profiles.target.credential.apiKeyEnv, 'AZURE_OPENAI_API_KEY');

  assert.throws(
    () =>
      parseAIConfiguration({
        ai: {
          adapters: {
            'azure-openai': {
              profiles: {
                target: { credential: { type: 'api-key', apiKeyEnv: 'sk-live-secret' } },
              },
            },
          },
        },
      }),
    (error) => error instanceof DatasetValidationError && error.issues[0].path.includes('apiKeyEnv'),
  );
});
