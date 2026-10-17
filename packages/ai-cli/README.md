# @klassijs/ai-cli

`ai:evaluate` is a command on the existing Klassi CLI.

```bash
pnpm klassi ai:evaluate --suite example
pnpm klassi ai:evaluate --suite azure-openai --platform azure-openai
pnpm klassi ai:evaluate --suite azure-judge --platform azure-openai
pnpm klassi ai:baseline --suite example --output baseline.json
pnpm klassi ai:compare --suite example --baseline baseline.json
pnpm klassi ai:doctor --platform azure-openai
```

The `example` suite uses the fake adapter. The `azure-openai` suite uses the Azure adapter and needs `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, and `AZURE_OPENAI_DEPLOYMENT`. Missing Azure configuration exits 2 without calling the provider. Exit codes follow the technical specification: 0 passed, 1 quality gate failed, 2 configuration or dataset error, 3 execution failure, 4 evaluator failure, 5 reporting failure, 6 internal error.
