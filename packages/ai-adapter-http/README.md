# @klassijs/ai-adapter-http

A provider-neutral HTTP adapter. It posts a normalised execution request to a configured endpoint and returns `AIExecutionResult`.

The profile accepts an `http` or `https` endpoint, optional headers, a timeout, and an `apiKeyEnv` environment variable name. The key is read when the request is sent and is redacted from native evidence.
