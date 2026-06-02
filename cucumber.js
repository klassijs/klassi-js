 /**
 *  * klassi-js
 *  * Copyright © 2016 - Larry Goddard
 */
const path = require('path');
const fs = require('fs');

/* ---------------------------------------------------
 * Combine-run detection (SINGLE SOURCE OF TRUTH)
 * --------------------------------------------------- */
const isCombineRun = env.envName.toLowerCase() === 'testCombine';

/* ---------------------------------------------------
 * Feature / Scenario path injection
 * --------------------------------------------------- */
const splitFeatureFiles = (value) =>
	(value || '')
		.split(',')
		.map(s => s.trim())
		.filter(Boolean);

const featureFiles =
	splitFeatureFiles(process.env.FEATURE_FILES).length > 0
		? splitFeatureFiles(process.env.FEATURE_FILES)
		: splitFeatureFiles(
			process.argv.find(arg => arg.startsWith('--featureFiles='))?.split('=')[1]
		).length > 0
			? splitFeatureFiles(
				process.argv.find(arg => arg.startsWith('--featureFiles='))?.split('=')[1]
			)
			: (() => {
				const optionIndex = process.argv.findIndex(arg => arg === '--featureFiles');
				return optionIndex >= 0
					? splitFeatureFiles(process.argv[optionIndex + 1])
					: Array.isArray(global.featureFiles)
						? global.featureFiles.map(String).map(s => s.trim()).filter(Boolean)
						: [];
			})();

const resolvedPaths =
	featureFiles.length > 0
		? featureFiles
		: ['features/**/*.feature'];

/* ---------------------------------------------------
 * Report paths
 * --------------------------------------------------- */
const envName = env.envName.toLowerCase();
const baseReportDir = path.resolve(
	__dirname,
	paths.reports,
	browserName,
	envName
);

const junitPath = path.join(baseReportDir, `${reportName}-${dateTime}.xml`);
const jsonPath  = path.join(baseReportDir, `${reportName}-${dateTime}.json`);

/* ---------------------------------------------------
 * Reporter path resolution (node‑safe)
 * --------------------------------------------------- */
let formatPaths = [];

if (!isCombineRun) {
	const nodeIndex = process.env.CIRCLE_NODE_INDEX;
	const nodeDir = `node_${nodeIndex}`;
	const nodeReportDir = path.join(baseReportDir, nodeDir);

	fs.mkdirSync(nodeReportDir, { recursive: true });

	formatPaths = [
		path.join(nodeReportDir, path.basename(junitPath)),
		path.join(nodeReportDir, path.basename(jsonPath)),
	];
}



/* ---------------------------------------------------
 * Cucumber formatter configuration (SAFE)
 * --------------------------------------------------- */
const formats = ['@cucumber/pretty-formatter'];

/**
 * JUnit MUST be disabled during combine runs
 * This ensures CircleCI only ever uses ONE JUnit source
 */
if (!isCombineRun && formatPaths[0]) {
	formats.push(`junit:${formatPaths[0]}`);
}

/**
 * JSON only needed for non-combine runs
 * (combine run uses existing JSON to build HTML)
 */
if (!isCombineRun && formatPaths[1]) {
	formats.push(`json:${formatPaths[1]}`);
}

/* ---------------------------------------------------
 * Cucumber options
 * --------------------------------------------------- */
const options = {
	default: {
		dryRun: false,
		paths: resolvedPaths,
		require: [
			'node_modules/klassi-js/runtime/world.js',
			'step_definitions/**/*.js',
		],
		tags: global.resultingString,
		format: formats,
		formatOptions: {
			colorsEnabled: true,
		},
	},

	/**
	 * Allow API‑only tags to run quietly
	 */
	filterQuietTags: async () => {
		const filePath = path.resolve(
			global.projectRootPath,
			'./runtime/scripts/tagList.json'
		);
		const filelist = await helpers.readFromJson(filePath);
		return [...filelist.tagNames, ...tagNames];
	},
};

/* ---------------------------------------------------
 * CI‑only overrides
 * --------------------------------------------------- */
if (process.env.KLASSIJS_DRY_RUN === 'true') {
	options.default.dryRun = true;
}

/**
 * Dry‑run JSON discovery mode
 * (used ONLY for feature/scenario discovery)
 */
if (!isCombineRun && process.env.KLASSIJS_EMIT_JSON) {
	options.default.format = [
		`json:${process.env.KLASSIJS_EMIT_JSON}`,
	];
}

module.exports = options;
