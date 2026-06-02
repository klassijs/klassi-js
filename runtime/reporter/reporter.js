/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard
 */
const fs = require('fs-extra');
const path = require('path');
const pactumJs = require('pactum');
const s3Upload = require('../s3Upload');
const getRemote = require('../getRemote');
const remoteService = getRemote(settings.remoteService);
const browserName = global.remoteConfig || BROWSER_NAME;

let resp;
let obj;

/**
 * Helper function to pause if browser exists, otherwise use setTimeout
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise}
 */
async function safePause(delay) {
  if (typeof global.browser !== 'undefined' && global.browser.pause) {
    return await global.browser.pause(delay);
  }
  // Fallback to setTimeout if browser doesn't exist
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Remove malformed/empty cucumber json artifacts before report generation.
 * This avoids intermittent reporter parse failures like:
 * "Unexpected end of JSON input".
 * @param {string} jsonDirPath
 * @returns {Promise<void>}
 */
async function sanitizeJsonFiles(jsonDirPath) {
  if (!fs.existsSync(jsonDirPath)) {
    return;
  }

  const walk = async (dir) => {
    const entries = await fs.readdir(dir);
    for (const entry of entries) {
      const entryPath = path.resolve(dir, entry);
      const stat = await fs.stat(entryPath);
      if (stat.isDirectory()) {
        await walk(entryPath);
        continue;
      }

      if (!entry.endsWith('.json')) {
        continue;
      }

      try {
        const raw = await fs.readFile(entryPath, 'utf8');
        if (!raw || !raw.trim()) {
          await fs.remove(entryPath);
          console.warn(`Removed empty report json file: ${entryPath}`);
          continue;
        }
        JSON.parse(raw);
      } catch (err) {
        await fs.remove(entryPath);
        console.warn(`Removed invalid report json file: ${entryPath} (${err.message})`);
      }
    }
  };

  await walk(jsonDirPath);
}

/**
 * Wait until JSON files stop changing size.
 * Prevents copying partially-written report files.
 * @param {string} dir
 * @param {number} attempts
 * @param {number} interval
 */
async function waitForStableFiles(dir, attempts = 10, interval = 1000) {
	let previous = new Map();

	for (let i = 0; i < attempts; i++) {
		const current = new Map();

		if (!fs.existsSync(dir)) {
			throw new Error(`Report directory does not exist: ${dir}`);
		}

		const walk = async (currentDir) => {
			const files = await fs.readdir(currentDir);

			for (const file of files) {
				const fullPath = path.resolve(currentDir, file);
				const stat = await fs.stat(fullPath);

				if (stat.isDirectory()) {
					await walk(fullPath);
					continue;
				}

				if (!file.endsWith('.json')) {
					continue;
				}

				current.set(fullPath, stat.size);
			}
		};

		await walk(dir);

		let stable = previous.size > 0;

		for (const [file, size] of current.entries()) {
			if (previous.get(file) !== size) {
				stable = false;
				break;
			}
		}

		if (stable) {
			console.log('JSON report files stabilized');
			return;
		}

		previous = current;

		console.log(
			`Waiting for report files to stabilize (${i + 1}/${attempts})`
		);

		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	throw new Error('JSON report files never stabilized');
}

/**
 * Load HTML reporter in environments where dynamic import may be unavailable
 * (e.g. Jest without vm modules), while keeping runtime behavior unchanged.
 * @returns {Promise<{generate: Function}>}
 */
async function loadHtmlReporter() {
  try {
    return await import('klassijs-cucumber-html-reporter');
  } catch (err) {
    if (
      err &&
      (err.code === 'ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG' ||
        (err.message && err.message.includes('without --experimental-vm-modules')))
    ) {
      return require('klassijs-cucumber-html-reporter');
    }
    throw err;
  }
}

module.exports = {
  ipAddr: async () => {
    const endPoint = 'http://ip-api.com/json';
    resp = await pactumJs.spec().get(endPoint).toss();
    await resp;
  },

	async reporter() {
		const envName = env.envName.toLowerCase();

		try {
			await this.ipAddr();
			obj = await resp.body;
		} catch (err) {
			obj = {};
			console.log('IpAddr func err:', err.message);
		}

		if (!(paths.reports && fs.existsSync(paths.reports))) {
			return;
		}

		const jsonDir = path.resolve(
			paths.reports,
			browserName,
			envName
		);

		const jsonComDir = path.resolve(
			paths.reports,
			browserName,
			`${envName}Combine`
		);

		global.endDateTime = helpers.getEndDateTime();

		const reportOptions = {
			theme: 'bootstrap',
			jsonDir: jsonComDir,
			output: path.resolve(
				paths.reports,
				browserName,
				envName,
				`${reportName}-${dateTime}.html`
			),
			reportSuiteAsScenarios: true,
			launchReport: !settings.disableReport,
			ignoreBadJsonFile: true,
			metadata: {
				Environment: env.envName,
				IpAddress: obj.query,
				Browser: browserName,
				Location: `${obj.city} ${obj.regionName}`,
				Platform: process.platform,
				'Test Completion': endDateTime,
				Executed:
					remoteService &&
					remoteService.type === 'lambdatest'
						? 'Remote'
						: 'Local',
			},
			brandTitle: `${reportName} ${dateTime}`,
			name: `${projectName} ${browserName} ${envName}`,
		};

		// eslint-disable-next-line no-undef
		if (isCI) {
			return;
		}

		try {
			const { generate } = await loadHtmlReporter();

			/**
			 * CRITICAL:
			 * wait until cucumber/json writers finish
			 */
			await waitForStableFiles(jsonDir);

			/**
			 * Always start clean
			 */
			await fs.emptyDir(jsonComDir);

			/**
			 * Copy ONLY stable files
			 */
			await fs.copy(jsonDir, jsonComDir);

			/**
			 * Final validation
			 */
			await sanitizeJsonFiles(jsonComDir);

			/**
			 * Remove self-generated report json if needed
			 */
			if (resultingString === '@s3load') {
				const jsonfile = path.resolve(
					jsonComDir,
					`${reportName}-${dateTime}.json`
				);

				if (await fs.pathExists(jsonfile)) {
					await fs.remove(jsonfile);
				}
			}

			/**
			 * Generate HTML report
			 */
			await generate(reportOptions);

			const htmlJsonFile = path.resolve(
				paths.reports,
				browserName,
				envName,
				`${reportName}-${dateTime}.html.json`
			);
			if (await fs.pathExists(htmlJsonFile)) {
				await fs.remove(htmlJsonFile);
				// console.log(`Removed unwanted sidecar file: ${htmlJsonFile}`);
			}

			console.log('HTML report generated successfully');

			/**
			 * Upload to S3 if enabled
			 */
			if (resultingString === '@s3load') {
				await s3Upload.s3Upload();
				console.log('S3 upload completed');
			}
		} catch (err) {
			console.error('Reporter generation failed:', err);
			throw err;
		}
	}

};
