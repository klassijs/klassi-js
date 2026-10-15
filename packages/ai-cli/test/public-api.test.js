import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { AI_PUBLIC_API_VERSION, AI_PUBLIC_CONTRACTS, aiCase, aiSuite } from '../dist/index.js';
import { DatasetValidationError } from '@klassijs/ai-datasets';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(packageRoot, '../..');

test('the 1.0 public contracts are declared and do not name a provider', async () => {
  const declarations = await readFile(path.join(packageRoot, 'dist/index.d.ts'), 'utf8');
  const source = await readFile(path.join(packageRoot, 'src/public.ts'), 'utf8');

  assert.equal(AI_PUBLIC_API_VERSION, '1.0.0');
  for (const name of AI_PUBLIC_CONTRACTS) {
    assert.equal(declarations.includes(name), true, name);
  }
  assert.equal(source.includes('azure'), false);
  assert.equal(source.includes('openai'), false);
  assert.equal(source.includes('@azure'), false);
  assert.equal(source.includes('anthropic'), false);
  assert.equal(source.includes('bedrock'), false);
});

test('aiCase and aiSuite reject an incomplete definition before execution', () => {
  assert.throws(() => aiCase({ id: 'greeting-001' }), DatasetValidationError);
  const evaluationCase = aiCase({
    id: 'greeting-001',
    name: 'Greeting',
    target: { adapter: 'fake' },
    input: { messages: [{ role: 'user', content: 'Say hello' }] },
    evaluators: [{ id: 'exact-match', type: 'deterministic', config: { expected: 'hello' } }],
  });
  const suite = aiSuite({
    id: 'javascript-example',
    name: 'JavaScript example',
    version: '1.0.0',
    cases: [evaluationCase],
    qualityGate: { overall: { minimumPassRate: 1 } },
  });
  assert.equal(suite.cases[0].id, 'greeting-001');
});

test('the JavaScript example runs through the public runner', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'klassi-ai-api-'));
  const result = await runNode([path.join(repoRoot, 'examples/ai/evaluate.mjs'), output]);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /exit: 0/);
});

function runNode(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: repoRoot, env: { ...process.env, CI: 'true' } });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}
