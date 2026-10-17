import assert from 'node:assert/strict';
import { mkdtemp, readFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { AIEvaluationError } from '@klassijs/ai-core';
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

test('parent-directory ids stay inside the evidence root', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'klassi-evidence-'));
  const store = new FileEvidenceStore(root);
  const bundle = await store.save({
    run: { runId: '..', suiteId: 'suite', startedAt: '2026-01-01T00:00:00.000Z' },
    suite: { suiteId: 'suite', name: 'Suite', version: '1.0.0' },
    cases: [{ caseId: '..', name: 'Escape', targetAdapter: 'fake' }],
    samples: [
      {
        sampleId: '..',
        caseId: '..',
        request: { messages: [] },
        response: { text: 'kept' },
        execution: { status: 'completed' },
      },
    ],
  });
  const writerPath = await store.writer('..', { sampleId: '..', caseId: '..' }).write({ name: '../../secret', body: { text: 'kept' } });
  for (const filePath of [bundle.samples[0].requestPath, writerPath]) {
    const relative = path.relative(root, filePath);
    assert.equal(relative.startsWith('..'), false);
    assert.equal(path.isAbsolute(relative), false);
  }
  assert.equal((await readFile(bundle.samples[0].responsePath, 'utf8')).includes('kept'), true);
});

test('an artifact over the size limit is refused before it is written', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'klassi-evidence-'));
  const store = new FileEvidenceStore(root, 64);
  await assert.rejects(
    () => store.save({
      run: { runId: 'run-1', suiteId: 'suite', startedAt: '2026-01-01T00:00:00.000Z' },
      suite: { suiteId: 'suite', name: 'Suite', version: '1.0.0' },
      cases: [],
      samples: [
        {
          sampleId: 'sample-1',
          caseId: 'case-1',
          request: { messages: [{ role: 'user', content: 'x'.repeat(200) }] },
          response: { text: 'kept' },
          execution: { status: 'completed' },
        },
      ],
    }),
    (error) => error instanceof AIEvaluationError && error.code === 'EVIDENCE_ERROR',
  );
  await assert.rejects(() => access(path.join(root, '.klassi', 'ai', 'runs', 'run-1', 'cases', 'case-1', 'samples', 'sample-1', 'request.json')));
});
