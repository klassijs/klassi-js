# @klassijs/ai-core

Provider-neutral contracts for Klassi-JS AI evaluation.

This package defines evaluation cases, suites, execution results, and `AIPlatformAdapter`. It does not import a model provider SDK. Azure OpenAI and every other provider belong in their own adapter packages.

`@klassijs/ai-core/testing` exports `FakeAIAdapter` and `registerAdapterContractTests` for offline contract tests. Those tests do not use network access or provider credentials.

A quality gate reads those aggregates. A case tagged `critical` is included in the critical-case pass rate. A configured critical security violation fails the gate even when the average score is high. The decision is written as a `quality-gate` evidence artifact.

Aggregation keeps each sample intact. Percentiles use Hyndman and Fan type 7: for a sorted sample of length n and percentile p, rank h = 1 + (n - 1) * p, then linearly interpolate between the surrounding values. Standard deviation is the population figure (divide by n). Pass rate is passes divided by passes plus fails. A missing score is left out of the numeric summary and is not treated as zero.

```bash
pnpm ai:build
pnpm ai:test
pnpm ai:lint
pnpm ai:typecheck
```
