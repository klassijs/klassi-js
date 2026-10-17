import { aiCase, aiSuite, createAdapterRegistry, runAiEvaluation } from '@klassijs/ai-cli';
import { FakeAIAdapter } from '@klassijs/ai-core/testing';

const output = process.argv[2];
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
const registry = createAdapterRegistry();
const adapter = new FakeAIAdapter();
adapter.useScript({ kind: 'success', text: 'hello' });
registry.register(adapter);

const outcome = await runAiEvaluation({
  suite,
  registry,
  ...(output ? { output } : {}),
  reporters: ['json'],
  samples: 1,
  concurrency: 1,
});
process.exit(outcome.code);
