/**
 * Run a Klassi AI CLI command from a consumer project.
 * Uses the bundled AI API shipped with klassi-js.
 */
const path = require('node:path');
const dotenv = require('dotenv');

function resolveProjectRoot(projectRoot) {
	return path.resolve(projectRoot || process.cwd());
}

async function runAiCli(args, options = {}) {
	const projectRoot = resolveProjectRoot(options.projectRoot);
	dotenv.config({ path: path.join(projectRoot, '.env') });
	const { execute } = require('../ai/api.cjs');
	const stdout = [];
	const stderr = [];
	const write = process.stdout.write.bind(process.stdout);
	const writeError = process.stderr.write.bind(process.stderr);
	process.stdout.write = (chunk, ...rest) => {
		stdout.push(String(chunk));
		return write(chunk, ...rest);
	};
	process.stderr.write = (chunk, ...rest) => {
		stderr.push(String(chunk));
		return writeError(chunk, ...rest);
	};
	try {
		const code = await execute(['node', 'klassi', ...args]);
		return { code, stdout: stdout.join(''), stderr: stderr.join('') };
	} finally {
		process.stdout.write = write;
		process.stderr.write = writeError;
	}
}

module.exports = { runAiCli, resolveProjectRoot };
