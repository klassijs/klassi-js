import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { execute } from '../dist/index.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

test('ai:evaluate runs the example suite through the fake adapter', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const code = await execute(['node', 'klassi', 'ai:evaluate', '--suite', path.join(repoRoot, 'examples/ai/example.json'), '--output', output, '--samples', '1', '--concurrency', '1']);
  const reportPath = await findReport(output);

  assert.equal(code, 0);
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  assert.equal(report.status, 'pass');
  assert.equal(report.cases[0].samples[0].evaluators[0].status, 'pass');
  assert.equal(report.cases[0].samples[0].output, 'hello');
});

test('a quality-gate failure and a missing suite use the documented exit codes', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const source = JSON.parse(await readFile(path.join(repoRoot, 'examples/ai/example.json'), 'utf8'));
  source.cases[0].evaluators[0].config.expected = 'goodbye';
  const failingSuite = path.join(output, 'failing.json');
  await writeFile(failingSuite, JSON.stringify(source));
  const gateFailure = await execute(['node', 'klassi', 'ai:evaluate', '--suite', failingSuite, '--output', output]);
  const missingCase = await execute(['node', 'klassi', 'ai:evaluate', '--suite', failingSuite, '--output', output, '--case', 'missing-case']);
  const missing = await execute(['node', 'klassi', 'ai:evaluate', '--suite', 'does-not-exist', '--output', output]);
  const usage = await execute(['node', 'klassi', 'ai:evaluate']);

  assert.equal(gateFailure, 1);
  assert.equal(missingCase, 2);
  assert.equal(missing, 2);
  assert.equal(usage, 2);
});

test('the klassi command reaches ai:evaluate without starting Cucumber', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const result = await runNode(['index.js', 'ai:evaluate', '--suite', 'example', '--output', output]);

  assert.equal(result.code, 0);
  assert.match(result.stdout, /Example: pass/);
  assert.match(result.stdout, /exit: 0/);
  assert.equal(result.stdout.includes('Test run completed'), false);
});

test('ai:baseline saves the run and ai:compare reports a dataset mismatch', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const suite = path.join(repoRoot, 'examples/ai/example.json');
  const baselinePath = path.join(output, 'baseline.json');
  const saved = await execute(['node', 'klassi', 'ai:baseline', '--suite', suite, '--output', baselinePath]);
  const same = await execute(['node', 'klassi', 'ai:compare', '--suite', suite, '--baseline', baselinePath, '--output', output, '--latency-delta', '1000']);
  const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));

  assert.equal(saved, 0);
  assert.equal(baseline.suiteVersion, '1.0.0');
  assert.match(baseline.datasetHash, /^[a-f0-9]{64}$/);
  assert.equal(typeof baseline.sourceRunId, 'string');
  assert.equal(baseline.caseResults['greeting-001'].status, 'pass');
  assert.equal(same, 0);

  baseline.datasetHash = 'b'.repeat(64);
  const changed = path.join(output, 'changed.json');
  await writeFile(changed, JSON.stringify(baseline));
  const mismatched = await execute(['node', 'klassi', 'ai:compare', '--suite', suite, '--baseline', changed, '--output', output, '--latency-delta', '1000']);
  assert.equal(mismatched, 2);
});

function runNode(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: repoRoot });
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

async function findReport(root) {
  const { readdir } = await import('node:fs/promises');
  const runs = path.join(root, '.klassi', 'ai', 'runs');
  const entries = await readdir(runs);
  return path.join(runs, entries[0], 'report.json');
}
