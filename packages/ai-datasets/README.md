# @klassijs/ai-datasets

Runtime validation and loading for Klassi-JS AI evaluation datasets.

JSON and YAML suites are validated with Zod before they can be executed. The same suite produces the same SHA-256 hash after canonical JSON serialization. Configuration refers to environment variable names and does not accept embedded secrets.

```bash
pnpm --filter @klassijs/ai-datasets test
```
