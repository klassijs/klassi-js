# @klassijs/ai-evaluators

Evaluators for Klassi-JS.

Deterministic evaluators score a normalised execution result and do not resolve a judge.

Model evaluators resolve a judge through `AdapterRegistry.get`. Each category has a versioned prompt. The judge must return JSON `{ "score": 0 to 1, "reason": "..." }`. Invalid output is an evaluator error and is not scored. The target adapter and the judge adapter are separate registry entries.
