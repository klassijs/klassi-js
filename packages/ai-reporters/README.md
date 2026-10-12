# @klassijs/ai-reporters

Reports are derived from the normalised evaluation result.

`report.json` is the canonical machine-readable report. `report.md` is the human-readable summary. Model output is escaped before it is written into Markdown or JUnit XML.

`cucumber.json` and `junit.xml` use the same shapes the existing Klassi reporter already consumes. Cucumber writes those formats during UI runs, and `runtime/reporter/reporter.js` turns the JSON into HTML. This package does not add a second HTML renderer.
