# @klassijs/ai-adapter-azure-openai

Azure OpenAI adapter for Klassi-JS. This package owns the Azure endpoint, deployment, API-key, and Entra credential resolution. Credential values are read from environment variables at health-check time and are not stored on the adapter, the execution context, or doctor output.

`ai:doctor --platform azure-openai` checks the endpoint, deployment, credential, v1 API surface, and a GET to `/openai/v1/models`. Execution posts to `/openai/v1/responses` unless the profile selects chat completions. Credential values are read from environment variables at call time and are redacted from results and evidence.
