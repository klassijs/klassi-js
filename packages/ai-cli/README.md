# @klassijs/ai-cli

`ai:evaluate` is a command on the existing Klassi CLI.

```bash
pnpm klassi ai:evaluate --suite example
pnpm klassi ai:baseline --suite example --output baseline.json
pnpm klassi ai:compare --suite example --baseline baseline.json
pnpm klassi ai:doctor --platform azure-openai
```

The example suite uses the fake adapter. It does not call a model provider. Exit codes follow the technical specification: 0 passed, 1 quality gate failed, 2 configuration or dataset error, 3 execution failure, 4 evaluator failure, 5 reporting failure, 6 internal error.
