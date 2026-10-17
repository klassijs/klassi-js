import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { execute, evaluateSuite } from '../dist/index.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

test('ai:evaluate runs the example suite through the fake adapter', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const code = await execute(['node', 'klassi', 'ai:evaluate', '--suite', path.join(repoRoot, 'examples/ai/example.json'), '--output', output, '--samples', '1', '--concurrency', '1']);
  const reportPath = await findReport(output);

  assert.equal(code, 0);
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  const telemetry = await readFile(reportPath.replace(/report\.json$/, 'telemetry.jsonl'), 'utf8');
  assert.equal(report.status, 'pass');
  assert.equal(telemetry.includes('Say hello'), false);
  assert.equal(telemetry.includes('"name":"adapter.call"'), true);
  assert.equal(telemetry.includes('"name":"evaluator.completed"'), true);
  assert.equal(telemetry.includes('"name":"gate.completed"'), true);
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

test('a provider outage is an infrastructure failure and does not print the API key', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const errors = [];
  const original = console.error;
  console.error = (message) => errors.push(String(message));
  try {
    const outcome = await evaluateSuite({
      suite: path.join(repoRoot, 'examples/ai/azure-openai.json'),
      output,
      reporters: ['json'],
      samples: 1,
      concurrency: 1,
      platform: 'azure-openai',
      env: {
        AZURE_OPENAI_ENDPOINT: 'https://example.openai.azure.com',
        AZURE_OPENAI_API_KEY: 'super-secret-token',
        AZURE_OPENAI_DEPLOYMENT: 'target-deploy',
      },
      fetch: async () => new Response('unavailable', { status: 503 }),
    });
    assert.equal(outcome.code, 3);
    assert.equal(errors.join('\n').includes('super-secret-token'), false);
  } finally {
    console.error = original;
  }
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

test('ai:doctor checks Azure configuration without starting Cucumber', async () => {
  const unknown = await execute(['node', 'klassi', 'ai:doctor', '--platform', 'other']);
  const missing = await runNode(['index.js', 'ai:doctor', '--platform', 'azure-openai'], {
    AZURE_OPENAI_ENDPOINT: '',
    AZURE_OPENAI_DEPLOYMENT: '',
    AZURE_OPENAI_API_KEY: '',
  });

  assert.equal(unknown, 2);
  assert.equal(missing.code, 2);
  assert.match(missing.stdout, /AZURE_OPENAI_ENDPOINT is not set/);
  assert.equal(missing.stdout.includes('Test run completed'), false);
});

test('the azure example suite scores a deterministic result and writes reports', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const secret = 'super-secret-token';
  const env = {
    AZURE_OPENAI_ENDPOINT: 'https://example.openai.azure.com',
    AZURE_OPENAI_DEPLOYMENT: 'support-eval',
    AZURE_OPENAI_API_KEY: secret,
  };
  const passed = await evaluateSuite({
    suite: 'azure-openai',
    cwd: repoRoot,
    output,
    samples: 1,
    concurrency: 1,
    reporters: ['json', 'markdown'],
    platform: 'azure-openai',
    env,
    fetch: azureFetch('hello'),
  });
  const executionPath = await findNamed(passed.outputDir, 'execution.json');
  const execution = JSON.parse(await readFile(executionPath, 'utf8'));
  const report = JSON.parse(await readFile(path.join(passed.outputDir, 'report.json'), 'utf8'));
  const markdown = await readFile(path.join(passed.outputDir, 'report.md'), 'utf8');

  assert.equal(passed.code, 0);
  assert.equal(report.status, 'pass');
  assert.equal(report.cases[0].samples[0].evaluators[0].status, 'pass');
  assert.equal(execution.output.text, 'hello');
  assert.equal(execution.model.deployment, 'support-eval');
  assert.match(markdown, /hello/);
  assert.equal(JSON.stringify(execution).includes(secret), false);

  const failed = await evaluateSuite({
    suite: 'azure-openai',
    cwd: repoRoot,
    output,
    reporters: ['json'],
    platform: 'azure-openai',
    env,
    fetch: azureFetch('goodbye'),
  });
  const unconfigured = await evaluateSuite({
    suite: 'azure-openai',
    cwd: repoRoot,
    output,
    reporters: ['json'],
    platform: 'azure-openai',
    env: {},
    fetch: async () => {
      throw new Error('network should not be called');
    },
  });

  assert.equal(failed.code, 1);
  assert.equal(unconfigured.code, 2);

  const cli = await runNode(['index.js', 'ai:evaluate', '--suite', 'azure-openai', '--platform', 'azure-openai', '--output', output], {
    AZURE_OPENAI_ENDPOINT: '',
    AZURE_OPENAI_DEPLOYMENT: '',
    AZURE_OPENAI_API_KEY: '',
  });
  assert.equal(cli.code, 2);
  assert.match(cli.stderr, /AZURE_OPENAI_ENDPOINT is not set/);
  assert.equal(cli.stdout.includes('Test run completed'), false);
});

test('the azure judge deployment is separate and its evidence is stored', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const secret = 'super-secret-token';
  const models = [];
  const env = {
    AZURE_OPENAI_ENDPOINT: 'https://example.openai.azure.com',
    AZURE_OPENAI_DEPLOYMENT: 'target-deploy',
    AZURE_OPENAI_JUDGE_DEPLOYMENT: 'judge-deploy',
    AZURE_OPENAI_API_KEY: secret,
  };
  const passed = await evaluateSuite({
    suite: 'azure-judge',
    cwd: repoRoot,
    output,
    samples: 1,
    concurrency: 1,
    reporters: ['json', 'markdown'],
    platform: 'azure-openai',
    env,
    fetch: async (url, init) => {
      if (init?.method === 'GET' || String(url).endsWith('/models')) {
        return new Response('ok', { status: 200 });
      }
      const body = JSON.parse(String(init?.body ?? '{}'));
      models.push(body.model);
      const text = body.model === 'judge-deploy' ? '{"score":0.95,"reason":"relevant"}' : 'hello';
      return Response.json({
        id: 'resp',
        model: body.model,
        status: 'completed',
        output: [{ type: 'message', content: [{ type: 'output_text', text }] }],
      });
    },
  });
  const judgeEvidence = JSON.parse(await readFile(await findNamed(passed.outputDir, 'judge-relevance.json'), 'utf8'));

  assert.equal(passed.code, 0);
  assert.deepEqual(models, ['target-deploy', 'judge-deploy']);
  assert.equal(judgeEvidence.parsedScore, 0.95);
  assert.equal(judgeEvidence.promptVersion, '1.0.0');
  assert.equal(JSON.stringify(judgeEvidence).includes(secret), false);

  const missingJudge = await evaluateSuite({
    suite: 'azure-judge',
    cwd: repoRoot,
    output,
    reporters: ['json'],
    platform: 'azure-openai',
    env: { ...env, AZURE_OPENAI_JUDGE_DEPLOYMENT: '' },
    fetch: async () => {
      throw new Error('network should not be called');
    },
  });
  assert.equal(missingJudge.code, 2);
});

function azureFetch(text) {
  return async (url, init) => {
    if (init?.method === 'GET' || String(url).endsWith('/models')) {
      return new Response('ok', { status: 200 });
    }
    return Response.json({
      id: 'resp_example',
      model: 'provider-model',
      status: 'completed',
      output: [{ type: 'message', content: [{ type: 'output_text', text }] }],
    });
  };
}

async function findNamed(directory, name) {
  const found = await walk(directory, name);
  if (!found) {
    throw new Error(`${name} was not written`);
  }
  return found;
}

async function walk(directory, name) {
  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const found = await walk(fullPath, name);
      if (found) {
        return found;
      }
    } else if (entry.name === name) {
      return fullPath;
    }
  }
  return undefined;
}

function runNode(args, envOverrides = {}) {
  const env = { ...process.env, ...envOverrides };
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: repoRoot, env });
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

test('turn evaluators and the conversation evaluator both score a multi-turn case', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const suitePath = path.join(output, 'conversation.json');
  await writeFile(suitePath, JSON.stringify({
    id: 'conversation',
    name: 'Conversation',
    version: '1.0.0',
    cases: [{
      id: 'turns-001',
      name: 'Two turns',
      target: { adapter: 'fake' },
      input: { messages: [{ role: 'user', content: 'Say hello.' }] },
      conversation: {
        turns: [
          { id: 'greeting', messages: [{ role: 'user', content: 'Say hello.' }], evaluators: [{ id: 'exact-match', type: 'deterministic', config: { expected: 'hello' } }] },
          { id: 'farewell', messages: [{ role: 'user', content: 'Say goodbye.' }], evaluators: [{ id: 'exact-match', type: 'deterministic', config: { expected: 'goodbye' } }] },
        ],
      },
      evaluators: [{ id: 'exact-match', type: 'deterministic', config: { expected: 'hello\ngoodbye' } }],
      execution: { samples: 1 },
    }],
    qualityGate: { overall: { minimumPassRate: 1 } },
    metadata: { fakeResponses: ['hello', 'goodbye'] },
  }));

  const outcome = await evaluateSuite({ suite: suitePath, output, reporters: ['json'], samples: 1, concurrency: 1 });
  const turnFile = await findNamed(path.join(output, '.klassi'), 'turn-greeting.json');
  const turn = JSON.parse(await readFile(turnFile, 'utf8'));

  assert.equal(outcome.code, 0);
  assert.equal(outcome.samples[0].execution.output.text, 'hello\ngoodbye');
  assert.equal(outcome.samples[0].evaluatorResults.length, 3);
  assert.equal(turn.response, 'hello');
  assert.equal(turn.evaluatorResults[0].status, 'pass');
});

test('the security suite records a passing control and a critical disclosure still fails the gate', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const secure = await evaluateSuite({
    suite: path.join(repoRoot, 'examples/ai/security.json'),
    output,
    reporters: ['json', 'markdown'],
    samples: 1,
    concurrency: 1,
  });
  const evidence = JSON.parse(await readFile(await findNamed(path.join(output, '.klassi'), 'security-prompt-injection.json'), 'utf8'));
  const report = JSON.parse(await readFile(await findReport(output), 'utf8'));

  assert.equal(secure.code, 0);
  assert.equal(evidence.owasp.id, 'LLM01:2025');
  assert.equal(report.security.violations.length, 0);

  const leakedOutput = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const leakedSuite = path.join(leakedOutput, 'leaked.json');
  const leaked = JSON.parse(await readFile(path.join(repoRoot, 'examples/ai/security.json'), 'utf8'));
  leaked.cases = [leaked.cases[1]];
  leaked.cases[0].metadata.fakeResponse = 'the value is sk-live-example';
  leaked.qualityGate.overall.minimumPassRate = 0;
  await writeFile(leakedSuite, JSON.stringify(leaked));
  const failed = await evaluateSuite({ suite: leakedSuite, output: leakedOutput, reporters: ['json'], samples: 1, concurrency: 1 });
  const failedReport = JSON.parse(await readFile(await findReport(leakedOutput), 'utf8'));

  assert.equal(failed.code, 1);
  assert.equal(failedReport.security.criticalSecurityFailure, true);
  assert.equal(failedReport.security.violations[0].severity, 'critical');
  assert.equal(failedReport.security.violations[0].owasp, 'LLM02:2025');
});

test('a configured API key echoed by the model is removed from the report and evidence', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'klassi-ai-'));
  const output = path.join(root, 'reports');
  const secret = 'super-secret-token';
  const suitePath = path.join(root, 'echo.json');
  await writeFile(suitePath, JSON.stringify({
    id: 'redaction',
    name: 'Redaction',
    version: '1.0.0',
    metadata: { fakeResponse: `hello ${secret}` },
    cases: [
      {
        id: 'greeting-001',
        name: 'Greeting',
        target: { adapter: 'fake' },
        input: { messages: [{ role: 'user', content: `Say hello ${secret}` }] },
        evaluators: [{ id: 'exact-match', type: 'deterministic', config: { expected: 'hello' } }],
      },
    ],
    qualityGate: { overall: { minimumPassRate: 0 } },
  }));
  const outcome = await evaluateSuite({
    suite: suitePath,
    output,
    reporters: ['json', 'markdown', 'html'],
    samples: 1,
    concurrency: 1,
    env: { AZURE_OPENAI_API_KEY: secret },
  });
  const persisted = await readTree(output);

  assert.equal(outcome.code, 0);
  assert.equal(persisted.includes(secret), false);
  assert.equal(persisted.includes('[REDACTED]'), true);
});

async function readTree(directory) {
  let text = '';
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    text += entry.isDirectory() ? await readTree(fullPath) : await readFile(fullPath, 'utf8');
  }
  return text;
}
