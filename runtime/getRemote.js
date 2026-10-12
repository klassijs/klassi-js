/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard
 */
function noop() {
	console.info('"If you\'re seeing this, you\'re trying to run a non-existent remoteService"');
}

module.exports = function getRemote(remoteService) {
	const remote = {};
	const normalized = (remoteService && String(remoteService).trim().toLowerCase()) || '';

	if (!normalized || normalized === 'local' || normalized === 'disabled') {
		remote.type = 'disabled';
		remote.after = noop;
	} else if (normalized === 'lambdatest') {
		// Lazy-load so non-Cucumber flows (e.g. lightweight s3 dispatch) do not
		// register Cucumber hooks during module initialization.
		const lambdatest = require('./remotes/lambdatest');
		remote.type = 'lambdatest';
		remote.after = lambdatest.submitResults;
	} else if (normalized === 'sourcelabs' || normalized === 'saucelabs') {
		remote.type = 'sourcelabs';
		remote.after = noop;
	} else if (normalized === 'browserstack' || normalized === 'browser stack') {
		remote.type = 'browserstack';
		remote.after = noop;
	} else {
		console.info(`Unknown remote service "${remoteService}". Use: lambdatest | sourcelabs | browserstack | local`);
		remote.type = 'unknown';
		remote.after = noop;
	}
	return remote;
};
