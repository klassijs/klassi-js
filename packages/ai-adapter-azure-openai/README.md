# @klassijs/ai-adapter-azure-openai

Azure OpenAI adapter for Klassi-JS. The API key is read from an environment variable at call time. Development uses `.env`. Production supplies the same variable from AWS Parameter Store. The value is not stored on the adapter or written into evidence.

`ai:doctor --platform azure-openai` checks the endpoint, deployment, credential, v1 API surface, and a GET to `/openai/v1/models`. Execution posts to `/openai/v1/responses` unless the profile selects chat completions. Credential values are read from environment variables at call time and are redacted from results and evidence.
