# AI evaluation examples

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
