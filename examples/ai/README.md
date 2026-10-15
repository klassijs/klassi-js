# AI evaluation examples

The user guide is [docs/ai-evaluation.md](../../docs/ai-evaluation.md).

A JavaScript program can build the same suite without the CLI. `examples/ai/evaluate.mjs` uses `aiCase`, `aiSuite`, `createAdapterRegistry`, and `runAiEvaluation` from `@klassijs/ai-cli`. That public contract is version 1.0.0 and does not name a model provider. Register the adapter yourself, including `FakeAIAdapter` from `@klassijs/ai-core/testing` for a local run.

```bash
node examples/ai/evaluate.mjs
```

CI examples, exit codes, secret injection, and report publishing are in `examples/ci/README.md`.

`example` runs locally through the fake adapter:

```bash
pnpm klassi ai:evaluate --suite example
```

`azure-openai` calls an Azure OpenAI deployment through `AIPlatformAdapter`, scores the reply with the deterministic exact-match evaluator, stores the normalized evidence, applies the quality gate, and writes JSON and Markdown reports.

```bash
pnpm klassi ai:evaluate --suite azure-openai --platform azure-openai
```

Set these environment variables before running it. The values stay in the environment. Do not commit them.

```text
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_DEPLOYMENT
```

The suite asks the deployment to reply with the exact word `hello`. Exit 0 means the quality gate passed. Exit 1 means the run finished and the reply did not match. Exit 2 means the endpoint, key, or deployment is not configured. The command does not call Azure when that configuration is missing, so CI can run the rest of the suite without credentials.

`azure-judge` adds a relevance judge on a second deployment, `AZURE_OPENAI_JUDGE_DEPLOYMENT`. The target and the judge are separate adapter instances. The judge must return JSON with a score from 0 to 1 and a reason. That evidence is stored with the sample.

`security` is the adversarial regression suite. Each case is an attack, and the scripted reply is the secure behaviour. Prompt injection and sensitive disclosure are critical. Unsafe tool use and restricted-information leakage are high. A critical failure still fails the quality gate when the other scores pass. Each control is mapped to OWASP GenAI, the NIST AI Risk Management Framework, and the NIST Generative AI Profile as evidence alignment. The mapping is not a certification.

```bash
pnpm klassi ai:evaluate --suite security
```

```bash
pnpm klassi ai:evaluate --suite azure-judge --platform azure-openai
```
