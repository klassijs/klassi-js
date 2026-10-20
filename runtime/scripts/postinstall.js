#!/usr/bin/env node
/**
 * Consumer post-install hook. Call it the same way as Cucumber:
 *
 *   "postinstall": "node ./node_modules/klassi-js/runtime/scripts/postinstall.js"
 *
 * When klassijs-AI is present in the project, its workspace dependencies are installed.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { resolveProjectRoot } = require('./run-ai-cli');

function projectRootFromInstall() {
	return resolveProjectRoot(process.env.INIT_CWD || process.cwd());
}

function runPostinstall(options = {}) {
	const projectRoot = resolveProjectRoot(options.projectRoot || projectRootFromInstall());
	const klassijsAiPath = path.join(projectRoot, 'node_modules', 'klassijs-AI');

	if (!fs.existsSync(klassijsAiPath)) {
		console.log('ℹ️  klassijs-AI not found, skipping post-install');
		return 0;
	}

	console.log('📦 Found klassijs-AI, installing workspace dependencies...');
	execSync('pnpm install', {
		stdio: 'inherit',
		cwd: klassijsAiPath,
	});
	console.log('✅ klassijs-AI workspace dependencies installed successfully!');
	return 0;
}

if (require.main === module) {
	try {
		process.exit(runPostinstall());
	} catch (error) {
		console.error('❌ Error installing klassijs-AI dependencies:', error.message);
		process.exit(1);
	}
}

module.exports = { runPostinstall, projectRootFromInstall };
