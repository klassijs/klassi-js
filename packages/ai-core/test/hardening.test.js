import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(packageRoot, '../..');
const forbidden = ['@azure/', "'openai'", '"openai"', '@anthropic-ai/', '@aws-sdk/', 'node:http', 'node:https', 'undici', 'node-fetch', 'fetch('];

test('ai-core has no runtime dependency and its sources do not call a provider or the network', async () => {
  const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.equal(manifest.dependencies, undefined);
  const files = [...(await sourceFiles(path.join(packageRoot, 'src'))), ...(await sourceFiles(path.join(packageRoot, 'test')))].filter((file) => path.basename(file) !== 'hardening.test.js');
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const name of forbidden) {
      assert.equal(source.includes(name), false, `${path.relative(packageRoot, file)} includes ${name}`);
    }
  }
});

test('the developer environment file is not tracked', async () => {
  const tracked = await git(['ls-files', '.env']);
  assert.equal(tracked, '');
});

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await sourceFiles(fullPath)));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

function git(args) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: repoRoot }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}
