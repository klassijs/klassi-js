/**
 * Run Klassi AI CLI commands from a consumer project.
 * Same idea as `node node_modules/klassi-js/index.js` for Cucumber:
 * call this from the project root (or pass projectRoot).
 *
 *   const { runKlassi, root } = require('klassi-js/runtime/scripts/run-klassi');
 *   await runKlassi(['ai:evaluate', '--suite', './suite.json']);
 */
const path = require('node:path');
const { runAiCli, resolveProjectRoot } = require('./run-ai-cli');

const root = resolveProjectRoot(process.cwd());

async function runKlassi(args, options = {}) {
	return runAiCli(args, {
		projectRoot: options.projectRoot || root,
	});
}

module.exports = { root, runKlassi, resolveProjectRoot };
