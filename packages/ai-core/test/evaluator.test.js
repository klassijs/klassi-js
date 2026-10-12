import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AIEvaluationError,
  createEvaluatorRegistry,
  createEvaluatorResult,
  isBehaviouralEvaluatorStatus,
  isInfrastructureEvaluatorStatus,
} from '../dist/index.js';

function evaluator(id, kind) {
  return {
    id,
    name: id,
    version: '1.0.0',
    kind,
    async evaluate() {
      return createEvaluatorResult(this, {
        status: kind === 'model' ? 'review' : 'pass',
        score: 1,
        reason: kind,
      });
    },
  };
}

test('deterministic and model evaluators share one result model', async () => {
  const registry = createEvaluatorRegistry();
  registry.register(evaluator('exact-match', 'deterministic'));
  registry.register(evaluator('groundedness', 'model'));

  const deterministic = await registry.resolve({ id: 'exact-match', type: 'deterministic' }).evaluate();
  const model = await registry.resolve({ id: 'groundedness', type: 'model' }).evaluate();

  assert.equal(deterministic.status, 'pass');
  assert.equal(deterministic.evaluatorVersion, '1.0.0');
  assert.equal(model.status, 'review');
  assert.equal(model.evaluatorId, 'groundedness');
  assert.equal(typeof model.score, 'number');
});

test('evaluator registry rejects duplicates and resolves by binding kind', () => {
  const registry = createEvaluatorRegistry();
  registry.register(evaluator('exact-match', 'deterministic'));

  assert.throws(() => registry.register(evaluator('exact-match', 'deterministic')), (error) => {
    assert.ok(error instanceof AIEvaluationError);
    assert.equal(error.code, 'CONFIG_ERROR');
    return true;
  });

  assert.throws(() => registry.resolve({ id: 'exact-match', type: 'model' }), (error) => {
    assert.ok(error instanceof AIEvaluationError);
    assert.equal(error.code, 'CONFIG_ERROR');
    return true;
  });

  const other = createEvaluatorRegistry();
  assert.throws(() => other.get('exact-match'), (error) => {
    assert.ok(error instanceof AIEvaluationError);
    assert.equal(error.code, 'EVALUATOR_ERROR');
    return true;
  });

  assert.deepEqual(registry.list(), [
    { id: 'exact-match', name: 'exact-match', version: '1.0.0', kind: 'deterministic' },
  ]);
});

test('infrastructure errors stay distinct from behavioural failures', () => {
  const exact = { id: 'exact-match', version: '1.0.0' };

  const failure = createEvaluatorResult(exact, { status: 'fail', score: 0, reason: 'text did not match' });
  const infrastructure = createEvaluatorResult(exact, {
    status: 'error',
    error: { code: 'EVALUATOR_ERROR', message: 'judge adapter was unavailable' },
  });

  assert.equal(isBehaviouralEvaluatorStatus(failure.status), true);
  assert.equal(isInfrastructureEvaluatorStatus(failure.status), false);
  assert.equal(failure.error, undefined);
  assert.equal(isInfrastructureEvaluatorStatus(infrastructure.status), true);
  assert.equal(infrastructure.status, 'error');
  assert.notEqual(infrastructure.status, 'fail');

  assert.throws(
    () => createEvaluatorResult(exact, { status: 'fail', error: { code: 'EVALUATOR_ERROR', message: 'no' } }),
    (error) => error instanceof AIEvaluationError && error.code === 'EVALUATOR_ERROR',
  );
  assert.throws(
    () => createEvaluatorResult(exact, { status: 'pass', score: 1.2 }),
    (error) => error instanceof AIEvaluationError && error.code === 'EVALUATOR_ERROR',
  );
});
