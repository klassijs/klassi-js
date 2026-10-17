# AI evaluation in CI

Run the local example on every build. It uses the fake adapter and does not need credentials.

```bash
pnpm install --frozen-lockfile
pnpm klassi ai:evaluate --suite example --output ai-reports/example
```

Node.js 22 and pnpm 11.10.0 match the repository CI images. Copy `github-actions.yml` to `.github/workflows/ai-evaluation.yml`, or `azure-pipelines.yml` to the repository root.

## Exit codes

| Code | Meaning | What CI should do |
| --- | --- | --- |
| 0 | Quality gate passed | Continue |
| 1 | The run finished and the quality gate failed | Fail the job. This is a result failure. |
| 2 | The suite or platform configuration is invalid | Fail the job. Missing Azure variables exit here, before any network call. |
| 3 | Execution infrastructure failed | Fail the job. The provider was unavailable, the health check failed, or a sample did not complete. |
| 4 | An evaluator failed as infrastructure | Fail the job |
| 5 | Evidence or report writing failed | Fail the job |
| 6 | Internal error | Fail the job |

The example pipelines prove exit 1 by scoring the example suite against the word `goodbye`. Exit 3 is the provider-outage path: a scripted HTTP 503 from Azure is an infrastructure failure, and the API key is not written to the log.

## Secrets

Development reads `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`, and `AZURE_OPENAI_JUDGE_DEPLOYMENT` from `.env`. Do not commit that file.

CI injects the same variable names from the platform secret store:

- GitHub Actions: repository secrets referenced as `${{ secrets.AZURE_OPENAI_API_KEY }}`. GitHub masks the values in logs. Do not echo them.
- Azure DevOps: secret variables in the `klassi-ai` variable group, mapped with `$(AZURE_OPENAI_API_KEY)`. Mark the variables secret. Do not print them with `echo` or a pipeline debug command.

Production can load those same variables from AWS Parameter Store before the process starts. Klassi reads the environment. It does not call Parameter Store itself.

A missing secret exits 2 and does not call Azure. A live Azure step skips itself when `AZURE_OPENAI_API_KEY` is empty, so forks and pull requests without secrets still run the fake suite.

## Reports

Both examples publish the `ai-reports` directory after the job, including when the gate fails. That directory contains `report.json`, `report.md`, `report.html`, `junit.xml`, `report.sarif`, and `telemetry.jsonl`. Telemetry does not include prompts or responses.
