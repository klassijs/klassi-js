# AI evaluation

Klassi can score model behaviour as a suite of cases. Each case sends messages through an adapter, records the normalized result, runs evaluators, and applies a quality gate. The Cucumber and WebdriverIO commands are unchanged. `ai:evaluate`, `ai:baseline`, `ai:compare`, and `ai:doctor` run before the Cucumber CLI starts. The release candidate is recorded in [ai-evaluation-release.md](ai-evaluation-release.md). The npm package version remains `6.1.0`.

A local run needs no credentials:

```bash
pnpm klassi ai:evaluate --suite example
```

Exit 0 means the quality gate passed. Exit 1 means the run finished and the gate failed. The other codes are listed in [CI/CD](#cicd).

The same suite can be built in JavaScript. The public contract is version `1.0.0`: `aiCase`, `aiSuite`, `createAdapterRegistry`, and `runAiEvaluation` from `@klassijs/ai-cli`. Those names do not identify a model provider. `examples/ai/evaluate.mjs` registers `FakeAIAdapter` from `@klassijs/ai-core/testing` and runs in memory.

```bash
node examples/ai/evaluate.mjs
```

## Architecture

Every model call goes through `AIPlatformAdapter`. Core orchestration, datasets, evaluators, evidence, and reporters do not import a provider SDK. Azure OpenAI is the first production adapter. It is one implementation of the contract, not the contract itself.

| Package | Responsibility |
| --- | --- |
| `@klassijs/ai-core` | Contracts, registry, orchestration, aggregation, quality gate, baselines, telemetry |
| `@klassijs/ai-datasets` | Suite and case validation |
| `@klassijs/ai-evaluators` | Deterministic, model, and security evaluators |
| `@klassijs/ai-evidence` | Redacted run files and hashes |
| `@klassijs/ai-reporters` | JSON, Markdown, HTML, Cucumber JSON, JUnit, and SARIF |
| `@klassijs/ai-cli` | Commands and the public JavaScript runner |
| `@klassijs/ai-adapter-azure-openai` | Azure OpenAI requests, and only this package talks to Azure |

A run loads the suite, checks the health of each target adapter, executes samples, scores evaluators, evaluates the gate, then writes reports and `telemetry.jsonl`. Telemetry keeps run, case, sample, adapter, and evaluator identifiers. It does not keep prompts or responses.

The CLI registers the built-in evaluators. `runAiEvaluation` does the same when you pass a suite object and a registry you filled yourself.

## AIPlatformAdapter

An adapter is the only place that knows how to call a platform. The interface is:

- `id`, `name`, and `version`
- `capabilities()` for text, images, streaming, structured output, tool calling, multi-turn, usage, content-safety metadata, and seed
- `healthCheck()` before any case uses that adapter
- `execute()` returning a normalized result: status, text, tool calls, usage, timing, and a normalized error when the call fails
- optional `collectEvidence()` for a redacted provider payload

Core stores that normalized result. It does not store the provider SDK object. An unhealthy target fails the run with exit 3 and code `PROVIDER_UNAVAILABLE`. The judge adapter is not part of that target health check. It is checked when a model evaluator calls it.

Klassi does not run tools the model asks for. A requested tool call stays `requested`, and its result stays empty, until an application outside this runner supplies a result.

## Custom adapters

Implement `AIPlatformAdapter` in its own package. Keep that package's SDK dependency inside the package. Register the instance with `createAdapterRegistry`, then pass the registry to `runAiEvaluation`. A case selects it with `target.adapter` set to the same `id`.

```javascript
import { aiSuite, createAdapterRegistry, runAiEvaluation } from '@klassijs/ai-cli';

const registry = createAdapterRegistry();
registry.register(adapter);
const outcome = await runAiEvaluation({ suite, registry, reporters: ['json'] });
```

`ai:evaluate --platform` currently selects `fake` or `azure-openai`. A custom adapter is used through `runAiEvaluation` and a registry. Do not add the provider SDK to `@klassijs/ai-core` to make the adapter work.

## Datasets

A suite is JSON or YAML. The CLI looks for a path you pass, then for `examples/ai/{name}.json`, `.yaml`, or `.yml`. `@klassijs/ai-datasets` validates the file before execution. A validation failure exits 2 and does not call a model.

Required suite fields are `id`, `name`, `version`, `cases`, and `qualityGate`. Each case needs `id`, `name`, `target.adapter`, `input.messages`, and `evaluators`. `aiCase` and `aiSuite` apply the same checks to objects.

`conversation.turns` replaces the single request. Each turn is sent with the previous user messages and assistant replies. A failed turn stops the conversation. The sample text is the assistant replies joined by newlines. Turn evaluators score that turn. Case evaluators score the full transcript.

`metadata.fakeResponse` and `metadata.fakeResponses` script the fake adapter. `metadata.fakeToolCalls` adds requested tool names. Those fields are for the local adapter. A production adapter ignores them.

The dataset hash is SHA-256 of the canonical JSON, with object keys sorted. The same suite in a different key order has the same hash. Baselines use that hash to decide whether two runs are comparable.

Configuration values that look like secrets are rejected. A profile stores the environment variable name, such as `AZURE_OPENAI_API_KEY`, and the process resolves the value later.

## Evaluators

A binding has `id`, `type`, and optional `threshold`, `judge`, and `config`. `type` is `deterministic`, `model`, `human`, or `platform`. Built-in scores are from 0 to 1. Status is `pass`, `fail`, or `review`. `error` is infrastructure: the evaluator did not score the sample, and the result includes a normalized error.

Deterministic evaluators include `exact-match`, `contains`, `not-contains`, `regex-match`, `required-keywords`, `forbidden-keywords`, `json-schema`, `json-path`, citation checks, the tool checks below, `refusal-detection`, `latency`, and `performance`.

Tool checks are `tool-called`, `tool-not-called`, `tool-arguments`, `expected-tools`, `forbidden-tools`, `tool-call-count`, `tool-argument-schema`, `required-tool-arguments`, and `tool-result`. `tool-result` fails when no result was recorded, which is the normal state after a Klassi run.

Model evaluators are `relevance`, `completeness`, `groundedness`, `semantic-correctness`, `instruction-adherence`, and `answer-quality`. Each one calls the judge adapter named on the binding and expects JSON with `score` and `reason`. The judge prompt version is `1.0.0`. Invalid judge JSON is an evaluator error, not a score of zero.

Security evaluators are deterministic and are registered beside the others:

| Evaluator | Fail severity | Evidence alignment |
| --- | --- | --- |
| `prompt-injection` | critical | OWASP LLM01:2025, NIST AI RMF MS-2.7, NIST GenAI Profile Information Security |
| `sensitive-disclosure` | critical | OWASP LLM02:2025, NIST AI RMF MS-2.10, NIST GenAI Profile Data Privacy |
| `unsafe-tool-invocation` | high | OWASP LLM06:2025, NIST AI RMF MG-2.4, NIST GenAI Profile Human-AI Configuration |
| `restricted-information` | high | OWASP LLM07:2025, NIST AI RMF MS-2.7, NIST GenAI Profile Information Security |

A passing security result is severity `info`, so it is not a violation. The report states that these mappings record evidence alignment and are not a certification of compliance.

## Quality gates

`evaluateQualityGate` checks the suite gate after scoring. Minimums pass when the metric is greater than or equal to the limit. Maximums pass when it is less than or equal to the limit. A missing required metric fails as unavailable. It is not treated as zero.

The pass rate is passes divided by passes plus fails. `error` and `review` samples stay out of that rate. Case order is stable. Sample status precedence is error, then fail, then review, then pass.

`criticalCases` applies to cases tagged `critical`. `security.maximumCriticalViolations` and `maximumHighViolations` count evaluator failures at those severities. A critical security failure still fails the gate when the overall score passes.

`performance.p95LatencyMs` uses the Hyndman and Fan type 7 percentile. `budget` can limit total, input, and output tokens, request count, and estimated cost. A conversation turn counts as one request. Token totals are unavailable when any sample omitted usage. Estimated cost uses the suite `costTable`. A model with no price is listed and the cost check fails as unavailable. The report still shows the tokens that were present.

`infrastructure.maximumErrorRate` is error samples divided by all samples. Default execution is one sample, concurrency 1, a 30 second timeout, and two retries for retryable rate-limit, network, timeout, and provider errors.

## Evidence

The file store writes under `{output}/.klassi/ai/runs/{runId}/`. The default output directory is the working directory. The run directory holds `run.json`, `suite.json`, one directory per case, one directory per sample, evaluator evidence, and the reports.

Sample files include the request messages, the response text, execution status, latency, model, and usage. Security evidence is named `security-{id}`. Judge evidence is named `judge-{id}`. Turn evidence is named `turn-{id}`. Each JSON file is canonical and has a SHA-256 hash. A case, sample, or artifact id of `.` or `..` is stored as `_`, and a path that would leave the run directory is refused. One artifact may be at most 1 MiB of canonical JSON. A larger body is refused before it is written.

Secrets named by the run are redacted before evidence and reports are written. The CLI treats `AZURE_OPENAI_API_KEY`, when it is set, as one of those secrets. Bearer tokens, `sk-` tokens, and header names such as `Authorization`, `Cookie`, and `api-key` are redacted as well. Custom patterns can be passed to the evidence store.

Reports next to that evidence are `report.json`, `report.md`, `report.html`, `cucumber.json`, `junit.xml`, and `report.sarif`. Markdown, HTML, and JUnit escape model text. Cucumber JSON keeps the raw step name so the existing Klassi HTML reporter can read it. HTML is a self-contained page and does not execute model text. SARIF 2.1.0 lists critical and high security findings only.

## Baselines

`ai:baseline` saves a baseline from a completed run. `ai:compare` reads that file and a later run. Comparison is meaningful when the dataset hash matches. A hash change is reported as not comparable.

```bash
pnpm klassi ai:baseline --suite example --output ai-reports/baseline.json
pnpm klassi ai:compare --suite example --baseline ai-reports/baseline.json
```

`--output` on `ai:baseline` is the baseline file. The run evidence is written beside that file. `--output` on `ai:compare` is the directory for the new run. `--score-delta`, `--pass-rate-delta`, and `--latency-delta` override the material-change thresholds.

A case that moves from pass to fail is a material change. Score movement is compared with the default thresholds exported as `DEFAULT_COMPARISON_THRESHOLDS`. `createBaseline` and `compareBaselines` are available from `@klassijs/ai-core` for a program that already has the run result.

## Azure OpenAI setup

Install and build the workspace, then set the variable names. The adapter reads the process environment. It does not read a secret from the suite file.

```text
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_DEPLOYMENT
```

`AZURE_OPENAI_JUDGE_DEPLOYMENT` is required only for a model judge. The default request is `POST {endpoint}/openai/v1/responses`. The credential is an API key sent as the `api-key` header. The deployment name is the model field on the wire.

Check the variables without calling the model:

```bash
pnpm klassi ai:doctor --platform azure-openai
```

A missing endpoint, key, or deployment exits 2 before any network call. Then run the example:

```bash
pnpm klassi ai:evaluate --suite azure-openai --platform azure-openai
```

The suite asks the deployment to reply with the single word `hello`. Exit 0 is a match. Exit 1 is a finished run whose reply did not match.

## Target and judge separation

The target answers the case. The judge scores that answer. They are two adapter registrations.

The target id is `azure-openai` and its deployment variable is `AZURE_OPENAI_DEPLOYMENT`. The judge id is `azure-openai-judge` and its deployment variable is `AZURE_OPENAI_JUDGE_DEPLOYMENT`. A model binding names the judge explicitly:

```json
{
  "id": "relevance",
  "type": "model",
  "threshold": 0.9,
  "judge": { "adapter": "azure-openai-judge", "profile": "judge" }
}
```

The CLI registers the judge only when a case has a model evaluator, and only after the judge variables validate. One registry id cannot point at both deployments. The target health check does not send the judge prompt.

```bash
pnpm klassi ai:evaluate --suite azure-judge --platform azure-openai
```

## Local .env safety

Development uses a `.env` file at the repository root. `index.js` loads it with `dotenv` and does not override variables that are already set. `.env` is gitignored. Commit `.env.example`, which contains placeholders only.

The suite and the adapter profile store variable names. They must not contain the key, the endpoint secret, or a copied response. Tests set the Azure variables to empty strings or to a fixture value so a developer `.env` cannot leak into a unit test. Do not print the key in CI logs.

Production supplies the same variable names before the process starts. AWS Parameter Store can do that in the host environment. Klassi does not call Parameter Store.

## CI/CD

Run the fake suite on every build. It needs no secret. Copy `examples/ci/github-actions.yml` to `.github/workflows/ai-evaluation.yml`, or `examples/ci/azure-pipelines.yml` to the repository root. The commands, secret mapping, and artifact list are in [examples/ci/README.md](../examples/ci/README.md).

| Code | Meaning |
| --- | --- |
| 0 | Quality gate passed |
| 1 | The run finished and the quality gate failed |
| 2 | The suite or platform configuration is invalid |
| 3 | Execution failed, including an unhealthy provider |
| 4 | An evaluator failed as infrastructure |
| 5 | Evidence or report writing failed |
| 6 | Internal error |

GitHub Actions reads `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`, and `AZURE_OPENAI_JUDGE_DEPLOYMENT` from repository secrets. Azure DevOps maps the same names from the `klassi-ai` variable group. A live Azure step skips itself when the API key is empty. The pipelines publish `ai-reports` even when the gate fails. Those artifacts include the reports and `telemetry.jsonl`.

## Examples

### Fake local suite

`examples/ai/example.json` targets the `fake` adapter. The scripted reply is `hello`, and the exact-match evaluator expects `hello`.

```bash
pnpm klassi ai:evaluate --suite example
```

`examples/ai/evaluate.mjs` builds that case with `aiCase` and `aiSuite` and registers the fake adapter in code.

### Azure suite

`examples/ai/azure-openai.json` targets `azure-openai` and expects the exact word `hello`.

```bash
pnpm klassi ai:evaluate --suite azure-openai --platform azure-openai
```

### Model-backed judge

`examples/ai/azure-judge.json` keeps the exact-match check and adds a relevance judge on `azure-openai-judge` with threshold 0.9. Set `AZURE_OPENAI_JUDGE_DEPLOYMENT` before running it.

```bash
pnpm klassi ai:evaluate --suite azure-judge --platform azure-openai
```

### Security suite

`examples/ai/security.json` has four adversarial cases. The fake replies are the secure behaviour, so the suite passes: prompt injection, sensitive disclosure, unsafe tool use, and restricted-information leakage. Prompt injection and sensitive disclosure are critical. The other two are high. The gate requires a pass rate of 1 and zero critical or high violations.

```bash
pnpm klassi ai:evaluate --suite security
```

A reply that contains a configured secret fails the gate even when another score would have passed. The report lists the control mappings and the statement that the mapping is not a certification.
