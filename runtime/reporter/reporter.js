/**
 * OUP Automated Testing Tool
 * Created by Larry Goddard
 */
const fs = require('fs-extra');
const path = require('path');
const reporter = require('klassijs-cucumber-html-reporter');
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
      console.log('IpAddr func err: ', err.message);
    }

    if (paths.reports && fs.existsSync(paths.reports)) {
      let jsonDir = path.resolve(paths.reports, browserName, envName);
      let jsonComDir = path.resolve(paths.reports, browserName, envName + 'Combine');

      global.endDateTime = helpers.getEndDateTime();

      const reportOptions = {
        theme: 'hierarchy',
        jsonDir: jsonComDir,
        output: path.resolve(paths.reports, browserName, envName, `${reportName}-${dateTime}.html`),
        reportSuiteAsScenarios: true,
        launchReport: !settings.disableReport,
        ignoreBadJsonFile: true,
        metadata: {
          // 'Test Started': startDateTime, TODO: See if i can carry the time from one state to the other
          Environment: env.envName,
          IpAddress: obj.query,
          Browser: browserName,
          Location: `${obj.city} ${obj.regionName}`,
          Platform: process.platform,
          'Test Completion': endDateTime,
          Executed: remoteService && remoteService.type === 'lambdatest' ? 'Remote' : 'Local',
        },
        brandTitle: `${reportName} ${dateTime}`,
        name: `${projectName} ${browserName} ${envName}`,
      };
      await safePause(DELAY_3s);
      // eslint-disable-next-line no-undef
      if (!isCI) {
        await fs.copySync(jsonDir, jsonComDir);
        let jsonfile = path.resolve(paths.reports, browserName, envName + 'Combine', `${reportName}-${dateTime}.json`);
        await safePause(DELAY_300ms);
        if (resultingString === '@s3load') {
          fs.remove(jsonfile, (err) => {
            if (err) return console.error(err);
          });
          await safePause(DELAY_500ms);
          await reporter.generate(reportOptions);
          await safePause(DELAY_3s).then(async () => {
            await s3Upload.s3Upload();
            await safePause(DELAY_5s);
          });
        } else {
          await safePause(DELAY_500ms);
          await reporter.generate(reportOptions);
        }
      }
    }
  },
};
