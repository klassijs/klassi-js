/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard
 *
 * Optional env overrides for tuning:
 *   LT_CONNECTION_RETRY_TIMEOUT  - connection timeout ms (default 120000)
 *   LT_CONNECTION_RETRY_COUNT   - WebdriverIO connection retries (default 4)
 *   LT_WAITFOR_TIMEOUT          - waitforTimeout ms (default 10000)
 *   LT_SESSION_RETRY_ATTEMPTS   - session creation retries (default 3)
 *   LT_SESSION_RETRY_DELAY_MS   - base delay for exponential backoff (default 10000)
 */
const { remote } = require('webdriverio');
const { Before } = require('@cucumber/cucumber');
const lambdatest = require('klassi-js/runtime/remotes/lambdatest');
const fs = require('fs-extra');
const path = require('path');

const CHROME_EXTENSION_PATH = path.resolve(__dirname, '../scripts/extensions/modHeader_3_1_22_0.crx');

function getChromeExtensionOpts() {
	if (!fs.pathExistsSync(CHROME_EXTENSION_PATH)) {
		return null;
	}
	const modHeader = fs.readFileSync(CHROME_EXTENSION_PATH, { encoding: 'base64' });
	return {
		'LT:Options': {
			'goog:chromeOptions': {
				// extensions: [modHeader],
			},
		},
	};
}

let config;
let isApiTest;

const apiTagsData = JSON.parse(
	fs.readFileSync(path.resolve(__dirname, '../scripts/tagList.json'))
);

const apiTags = global.tagNames;

/**
 * Capture scenario tags
 */
Before(async (scenario) => {
	try {
		const scenarioTags = scenario.pickle.tags.map(tag =>
			tag.name.replace('@', '').toLowerCase()
		);

		global.executionTag = scenarioTags[0] || 'local';
		global.executionTags = scenarioTags.length ? scenarioTags : ['local'];

		const tagList = (apiTagsData.tagNames && apiTags || [])
			.map(tag => tag.replace('@', '').toLowerCase());

		isApiTest = scenarioTags.some(tag => tagList.includes(tag));

	} catch (error) {
		console.error('Error in Before hook: ', error);
	}
});

module.exports = async function lambdatestDriver(options, configType) {

	if (configType.includes(',')) {
		const browserArray = configType.split(',');

		for (const browserItem of browserArray) {
			await browserExecute(options, browserItem);
		}
	} else {
		return await browserExecute(options, configType);
	}
};

const browserExecute = async (options, configTypeA) => {

	const provider = process.env.CLOUD_PROVIDER || 'lambdatest';

	/**
	 * Allow framework to switch between providers
	 */
	if (provider !== 'lambdatest') {
		console.log(`Cloud provider switched to ${provider}. Lambdatest driver bypassed.`);
		return;
	}

	const loadConfig = require('klassi-js/runtime/configLoader');
	const browserCaps = loadConfig(`./lambdatest/${configTypeA}.json`);

	const credentials = lambdatest.getCredentials();
	const { user, key } = credentials;
	if (!user || !key) {
		throw new Error(
			'LambdaTest credentials missing. Set LAMBDATEST_USERNAME and LAMBDATEST_ACCESS_KEY in .env or CI.'
		);
	}

	config = browserCaps;

	const buildNameFromConfig = configTypeA.replace(/-/g, ' ');

	/**
	 * ===== Execution metadata =====
	 */

	const tag = global.executionTag || 'local';
	const scenarioTags = global.executionTags || [tag];

	const branch =
		process.env.GIT_BRANCH ||
		process.env.GITHUB_REF_NAME ||
		process.env.CIRCLE_BRANCH ||
		'local';

	const buildNumber =
		process.env.CIRCLE_BUILD_NUM ||
		process.env.GITHUB_RUN_NUMBER ||
		Date.now();

	/**
	 * ==============================
	 * LambdaTest buildTags: run type (from job name) + branch + job, so filtering by "integration" shows only integration runs, not regression.
	 */

	const circleJob = process.env.CIRCLE_JOB || '';
	const runType =
		circleJob.startsWith('integration_test') ? 'integration'
			: circleJob.startsWith('regression_test') || circleJob.startsWith('acceptance_test') ? 'regression'
				: circleJob.startsWith('release_test') ? 'release'
					: (tag || 'ci');

	const baseBuildTags = [runType, branch];

	if (process.env.CI || process.env.CIRCLE_CI) {
		const { CIRCLE_BUILD_NUM, CIRCLE_JOB, CIRCLE_USERNAME } = process.env;
		const projectName = global.projectName || config.projectName || 'klassi-js';
		const displayUser = CIRCLE_USERNAME || process.env.LAMBDATEST_USERNAME || CIRCLE_JOB || 'CI';
		config.tunnelName = process.env.TUNNEL_NAME;
		config.build = `${projectName} - CircleCI Build No. #${CIRCLE_BUILD_NUM} for ${displayUser}. Job: ${CIRCLE_JOB || 'ci'}`;
		config.buildTags = [...baseBuildTags, CIRCLE_JOB || 'ci'];
	} else {
		const buildName = `${config.projectName || 'klassi-js'} | ${buildNameFromConfig} | ${tag} | ${branch}`;
		config.build = buildName;
		config.tunnelName = 'klassitunnel';
		config.buildTags = baseBuildTags;
	}

	/**
	 * Optional Chrome extension support (only when using Chrome and extension file exists)
	 */
	if (configTypeA.includes('chrome')) {
		const chromeExt = getChromeExtensionOpts();
		if (chromeExt && chromeExt['LT:Options']) {
			config = { ...config, ...chromeExt['LT:Options'] };
		}
	}

	const capabilities = {
		'LT:Options': {
			...config,
			user: user,
			accessKey: key,
		},
	};

	const connectionRetryTimeout = Number(process.env.LT_CONNECTION_RETRY_TIMEOUT) || 120000;
	const connectionRetryCount = Number(process.env.LT_CONNECTION_RETRY_COUNT) || 4;

	options = {
		updateJob: false,
		exclude: [],
		logLevel: 'silent',
		coloredLogs: true,
		waitforTimeout: Number(process.env.LT_WAITFOR_TIMEOUT) || 10000,
		connectionRetryTimeout,
		connectionRetryCount,
		protocol: 'https',
		hostname: 'hub.lambdatest.com',
		port: 443,
		path: '/wd/hub',
		capabilities: capabilities,
	};

	const maxAttempts = Number(process.env.LT_SESSION_RETRY_ATTEMPTS) || 3;
	const baseRetryDelayMs = Number(process.env.LT_SESSION_RETRY_DELAY_MS) || 10000;
	const isRetryable = (err) =>
		err.message && (
			err.message.includes('UND_ERR_HEADERS_TIMEOUT') ||
			err.message.includes('aborted due to timeout') ||
			err.message.includes('ECONNRESET') ||
			err.message.includes('ETIMEDOUT')
		);

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			global.browser = await remote(options);
			return global.browser;
		} catch (error) {
			const canRetry = attempt < maxAttempts && isRetryable(error);
			if (canRetry) {
				const delayMs = baseRetryDelayMs * Math.pow(1.5, attempt - 1);
				console.warn(
					`[lambdatestDriver] Session attempt ${attempt}/${maxAttempts} failed (${error.message}). Retrying in ${(delayMs / 1000).toFixed(0)}s...`
				);
				await new Promise((r) => setTimeout(r, delayMs));
			} else {
				console.error('Error in lambdatestDriver:', error);
				console.error('Stack trace:', error.stack);
				throw error;
			}
		}
	}
};
