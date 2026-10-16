import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const forbidden = [
  '@azure/openai',
  'openai',
  '@anthropic-ai/sdk',
  '@google/generative-ai',
  '@aws-sdk/client-bedrock-runtime',
  '@azure/identity',
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await sourceFiles(fullPath)));
    } else if (entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = await sourceFiles(root);
const violations = [];

for (const file of files) {
  const source = await readFile(file, 'utf8');
  for (const name of forbidden) {
    if (source.includes(name)) {
      violations.push(`${path.relative(root, file)} references ${name}`);
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exit(1);
}
