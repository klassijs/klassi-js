import { FakeAIAdapter, registerAdapterContractTests } from '../dist/testing/index.js';

const secret = 'super-secret-token';

registerAdapterContractTests({
  name: 'FakeAIAdapter',
  secret,
  createAdapter() {
    return new FakeAIAdapter({ redactValues: [secret] });
  },
});
