import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { FileEvidenceStore, hashEvidence } from '../dist/index.js';

const secret = 'super-secret-token';

test('a sample is traced to redacted request, response, execution, and evaluator files', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'klassi-evidence-'));
  const store = new FileEvidenceStore(root);
  const bundle = await store.save({
    secrets: [secret],
    patterns: [/project-secret-\d+/g],
    run: { runId: 'run-1', suiteId: 'support-release', startedAt: '2026-01-01T00:00:00.000Z' },
    suite: { suiteId: 'support-release', name: 'Support release', version: '1.0.0' },
    cases: [{ caseId: 'refund-policy-001', name: 'Refund policy', targetAdapter: 'fake' }],
    samples: [
      {
        sampleId: 'run-1:refund-policy-001:0',
        caseId: 'refund-policy-001',
        request: {
          messages: [{ role: 'user', content: `token ${secret}` }],
          headers: { Authorization: `Bearer ${secret}`, Cookie: 'session=abc' },
        },
        response: { text: `echo ${secret}`, note: 'project-secret-42' },
        execution: { status: 'completed', output: { text: 'The return window is 14 days.' } },
        evaluators: [{ evaluatorId: 'exact-match', result: { status: 'fail', reason: secret } }],
      },
    ],
  });

  const writer = store.writer('run-1', { sampleId: 'run-1:refund-policy-001:0', caseId: 'refund-policy-001' }, { secrets: [secret] });
  const writerPath = await writer.write({ name: 'note', body: { token: secret } });
  const writerFile = await readFile(writerPath, 'utf8');
  assert.equal(writerFile.includes(secret), false);

  const request = await readFile(bundle.samples[0].requestPath, 'utf8');
  const response = await readFile(bundle.samples[0].responsePath, 'utf8');
  const execution = await readFile(bundle.samples[0].executionPath, 'utf8');
  const evaluator = await readFile(bundle.evaluations[0].path, 'utf8');
  const manifest = await readFile(path.join(root, '.klassi', 'ai', 'runs', 'run-1', 'manifest.sha256'), 'utf8');
  const persisted = `${request}\n${response}\n${execution}\n${evaluator}\n${manifest}`;

  assert.equal(persisted.includes(secret), false);
  assert.equal(persisted.includes('Bearer '), false);
  assert.equal(persisted.includes('session=abc'), false);
  assert.equal(persisted.includes('project-secret-42'), false);
  assert.equal(execution.includes('The return window is 14 days.'), true);
  assert.equal(bundle.hashes.algorithm, 'sha256');
  assert.equal(bundle.hashes.artifacts.length > 0, true);
  assert.match(bundle.hashes.artifacts[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal(manifest.includes(bundle.hashes.artifacts[0].sha256), true);
});

test('canonical evidence hashing ignores object key order', () => {
  assert.equal(hashEvidence({ b: 1, a: secret }), hashEvidence({ a: secret, b: 1 }));
});
