# @klassijs/ai-core

Provider-neutral contracts for Klassi-JS AI evaluation.

This package defines evaluation cases, suites, execution results, and `AIPlatformAdapter`. It does not import a model provider SDK. Azure OpenAI and every other provider belong in their own adapter packages.

`@klassijs/ai-core/testing` exports `FakeAIAdapter` and `registerAdapterContractTests` for offline contract tests. Those tests do not use network access or provider credentials.

```bash
pnpm ai:build
pnpm ai:test
pnpm ai:lint
pnpm ai:typecheck
```
