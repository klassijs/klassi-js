#!/usr/bin/env node
/**
 * Import a Test Genie bundle from wDrive into the current project.
 *
 * Usage:
 *   node node_modules/klassi-js/runtime/scripts/import-wdrive.js
 *   node node_modules/klassi-js/runtime/scripts/import-wdrive.js --dir /path/to/wDrive --out .
 *
 * Defaults:
 *   --dir  process.env.KLASSI_WDRIVE
 *   --out  process.cwd()
 */
const path = require('node:path');
const { runKlassi } = require('./run-klassi');

function option(name, fallback) {
	const index = process.argv.indexOf(name);
	if (index === -1 || index + 1 >= process.argv.length) {
		return fallback;
	}
	return process.argv[index + 1];
}

async function main() {
	const out = path.resolve(option('--out', process.cwd()));
	const dir = option('--dir', process.env.KLASSI_WDRIVE || '');
	const file = option('--file', '');
	const args = ['ai:import', '--out', out];
	if (file) {
		args.push('--file', path.resolve(file));
	} else if (dir) {
		args.push('--dir', path.resolve(dir));
	}
	const result = await runKlassi(args, { projectRoot: out });
	process.exit(result.code);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(6);
});
