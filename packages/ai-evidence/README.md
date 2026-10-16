# @klassijs/ai-evidence

Writes a Klassi-JS AI evaluation run to `.klassi/ai/runs/<run-id>/`.

Request, response, execution, and evaluator files are redacted before they are saved. The store then writes `manifest.sha256` with a SHA-256 hash of each artifact.
