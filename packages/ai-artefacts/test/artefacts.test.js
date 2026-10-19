import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateQualityGate } from '@klassijs/ai-core';
import { parseEvaluationCase } from '@klassijs/ai-datasets';
import {
  TestGenieArtifactProvider,
  artefactBaseline,
  artefactEvaluator,
  assertReadyForCodeGeneration,
  assertSandboxPolicy,
  bddFromVerified,
  createArtifactSandbox,
  extractArtefacts,
  recordRegeneration,
  registerArtefactEvaluators,
  reportByType,
  sameRulesRegardlessOfOrigin,
  traceSuite,
  verifyArtefact,
  verifyExistingSuite,
  verifyTestGenieBundle,
} from '../dist/index.js';

const provider = new TestGenieArtifactProvider();

function bundle(overrides = {}) {
  return provider.load({
    contractVersion: '1.0.0',
    generationId: 'gen-1',
    generatedAt: '2026-10-19T00:00:00.000Z',
    sourceDocument: { id: 'doc-1', hash: 'a'.repeat(64) },
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
    ...overrides,
  });
}

test('a case can declare an artefact type and fenced output is extracted', () => {
  const evaluationCase = parseEvaluationCase({
    id: 'artefact-001',
    name: 'Source',
    target: { adapter: 'fake' },
    input: { messages: [{ role: 'user', content: 'Write the function' }] },
    evaluators: [{ id: 'artefact', type: 'deterministic' }],
    artefact: { type: 'javascript' },
  });
  assert.equal(evaluationCase.artefact.type, 'javascript');
  const extracted = extractArtefacts('```js\nmodule.exports = 1;\n```', 'javascript');
  assert.equal(extracted[0].type, 'javascript');
  assert.equal(extracted[0].hash.length, 64);
});

test('the sandbox denies network, files, and secrets, and does not keep state', async () => {
  assert.throws(() => assertSandboxPolicy({ timeoutMs: 100, maxOutputBytes: 100, allowNetwork: true, allowFilesystem: false, inheritSecrets: false }), /network/);
  process.env.AZURE_OPENAI_API_KEY = 'super-secret-token';
  const sandbox = createArtifactSandbox({ timeoutMs: 500, maxOutputBytes: 1000, allowNetwork: false, allowFilesystem: false, inheritSecrets: false });
  const result = await sandbox.run({ code: "module.exports = function (value) { return value; };", test: "assert.equal(module.exports('ok'), 'ok');" });
  assert.equal(result.ok, true);
  assert.equal(result.envKeys.includes('AZURE_OPENAI_API_KEY'), false);
  const blocked = await sandbox.run({ code: "require('node:fs').readFileSync('/etc/passwd')" });
  assert.equal(blocked.ok, false);
  await sandbox.dispose();
  await assert.rejects(() => sandbox.run({ code: 'module.exports = 1;' }), /disposed/);
  delete process.env.AZURE_OPENAI_API_KEY;
});

test('javascript, typescript, json, yaml, and profiles are verified deterministically before a judge', async () => {
  const source = await verifyArtefact({ id: 'js', type: 'javascript', content: 'module.exports = function (value) { return value; };' }, { tests: "assert.equal(module.exports('a'), 'a');", expectedPass: true });
  assert.equal(source.status, 'pass');
  assert.equal(source.evidence.verifierId.includes('klassi-artefact-verifier'), true);
  const unsafe = await verifyArtefact({ id: 'bad', type: 'javascript', content: 'eval("1")' });
  assert.equal(unsafe.status, 'fail');
  const typed = await verifyArtefact({ id: 'ts', type: 'typescript', content: 'export const value: string = 1;' });
  assert.equal(typed.status, 'fail');
  const json = await verifyArtefact({ id: 'json', type: 'json', content: '{"id":"BR-1","owner":"BR-1"}' }, { schema: { type: 'object', required: ['id'] }, requiredValues: { id: 'BR-1' }, references: [{ path: 'id', equals: 'owner' }] });
  assert.equal(json.status, 'pass');
  const yaml = await verifyArtefact({ id: 'yaml', type: 'yaml', content: 'id: BR-1\n' }, { forbiddenValues: ['password'] });
  assert.equal(yaml.status, 'pass');
  const sql = await verifyArtefact({ id: 'sql', type: 'sql', content: 'DELETE FROM accounts;' });
  assert.equal(sql.findings.some((finding) => finding.message.includes('disposable database')), true);
  const infra = await verifyArtefact({ id: 'infra', type: 'infrastructure', content: 'terraform apply' });
  assert.equal(infra.status, 'fail');
  const grounded = await verifyArtefact({ id: 'doc', type: 'documentation', content: '# Parser\nThe parser accepts ISO dates.' }, {
    semantic: { async execute() { return { output: { structured: { excerpt: 'ISO dates', score: 0.9 } } }; } },
  });
  assert.equal(grounded.findings.some((finding) => finding.deterministic === false), false);
  assert.equal(grounded.findings[0] === undefined || grounded.findings[0].deterministic === true, true);
});

test('generated tests catch missing assertions, always-pass checks, and known defects', async () => {
  const missing = await verifyArtefact({ id: 'test', type: 'test', content: 'Given the user is signed in' });
  assert.equal(missing.findings.some((finding) => finding.code === 'missing-assertion'), true);
  const always = await verifyArtefact({ id: 'always', type: 'test', content: 'Scenario: loose\nThen the page loads\nassert.equal(true, true)' });
  assert.equal(always.findings.some((finding) => finding.code === 'always-pass'), true);
  const defect = await verifyArtefact(
    { id: 'defect', type: 'javascript', content: 'module.exports = function () { return 1; };' },
    { tests: 'assert.equal(module.exports(), 2);', knownDefect: true },
  );
  assert.equal(defect.status, 'pass');
  const gate = await evaluateQualityGate({
    gate: { overall: { minimumPassRate: 1 } },
    samples: [{
      sampleId: 'sample-1',
      sampleIndex: 0,
      caseId: 'case-1',
      requestHash: 'hash',
      status: sourceStatus(missing),
      startedAt: '2026-10-19T00:00:00.000Z',
      completedAt: '2026-10-19T00:00:01.000Z',
      execution: { id: 'run', adapterId: 'fake', status: 'completed', output: {}, timing: { startedAt: '2026-10-19T00:00:00.000Z', completedAt: '2026-10-19T00:00:01.000Z', latencyMs: 1 } },
      evaluatorResults: [{ evaluatorId: 'artefact', evaluatorVersion: '1.0.0', status: 'fail', score: 0 }],
    }],
  });
  assert.equal(gate.decision.status, 'fail');
});

test('Test Genie artefacts are verified before BDD generation and stay traceable', () => {
  const verified = verifyTestGenieBundle(bundle(), true);
  assert.equal(verified.outcome, 'VERIFIED');
  const rejected = verifyTestGenieBundle(bundle({ acceptanceTests: [{ id: 'AT-9', requirementId: 'missing', statement: 'orphan' }] }));
  assert.equal(rejected.outcome, 'REJECTED');
  assert.throws(() => assertReadyForCodeGeneration(rejected), /cannot enter code generation/);
  const plan = bddFromVerified(bundle(), verified, 'TC-1');
  assert.equal(plan.runner, 'klassi-cucumber');
  assert.equal(plan.browser, 'webdriverio-standalone');
  assert.match(plan.feature, /@BR-1 @AT-1 @TC-1/);
  assert.match(plan.steps, /async function/);
  assert.match(plan.pageObject, /global\.browser/);
  assert.doesNotMatch(plan.pageObject, /wdio\.conf/);
  const trace = traceSuite([{ name: 'Parse a date', status: 'fail', tags: ['BR-1', 'AT-1', 'TC-1'] }]);
  assert.equal(trace.byRequirement('BR-1')[0].testCaseId, 'TC-1');
  assert.equal(trace.failedRequirement('Parse a date').requirementId, 'BR-1');
  assert.throws(() => recordRegeneration([{ generationId: 'gen-1', outcome: 'REJECTED', findings: [] }], { generationId: 'gen-2', outcome: 'REVIEW_REQUIRED', findings: [] }, 1), /stopped/);
});

test('human and AI artefacts use the same rules and provenance stays separate', async () => {
  const feature = 'Feature: Dates\n\n  Scenario: Parse a date\n    When the user submits a date\n    Then the date is accepted\n';
  const human = await verifyArtefact({ id: 'human', type: 'gherkin', content: feature, provenance: { origin: 'human', authorId: 'engineer' } });
  const ai = await verifyArtefact({ id: 'ai', type: 'gherkin', content: feature, provenance: { origin: 'ai', sourceSystem: 'assistant' } });
  assert.equal(sameRulesRegardlessOfOrigin(human, ai), true);
  assert.equal(human.provenance.origin, 'human');
  assert.equal(ai.provenance.origin, 'ai');
  const suite = await verifyExistingSuite({ artefacts: [human.provenance ? { id: 'human', type: 'gherkin', content: feature, provenance: human.provenance } : { id: 'human', type: 'gherkin', content: feature }] });
  assert.equal(suite.status, 'pass');
  const registry = registerArtefactEvaluators();
  assert.equal(registry.resolve({ id: 'artefact', type: 'deterministic' }).id, artefactEvaluator.id);
  const report = reportByType([{ ...human, type: 'gherkin' }, { ...ai, type: 'gherkin' }]);
  assert.equal(report.gherkin.pass, 2);
  const baseline = artefactBaseline([human, ai]);
  assert.equal(artefactBaseline([human, ai]).hash, baseline.hash);
});

function sourceStatus(result) {
  return result.status;
}
