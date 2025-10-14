/**
 * klassi Automated Testing Tool
 * Created by Larry Goddard
 */
const fs = require('fs-extra');
const path = require('path');
const reporter = require('klassijs-cucumber-html-reporter');
const jUnit = require('cucumber-junit');
const pactumJs = require('pactum');

const s3Upload = require('../s3Upload');
const getRemote = require('../getRemote');
const remoteService = getRemote(settings.remoteService);
const browserName = global.remoteConfig || BROWSER_NAME;

let resp;
let obj;

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
      console.error('IpAddr func err: ', err.message);
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
      await sleep(DELAY_3s);
      // eslint-disable-next-line no-undef
      if (!isCI) {
        await fs.copySync(jsonDir, jsonComDir);
        let jsonfile = path.resolve(paths.reports, browserName, envName + 'Combine', `${reportName}-${dateTime}.json`);
        await sleep(DELAY_300ms);
        if (resultingString === '@s3load') {
          fs.remove(jsonfile, (err) => {
            if (err) return console.error(err);
          });
          await sleep(DELAY_500ms);
          await reporter.generate(reportOptions);
          await sleep(DELAY_3s).then(async () => {
            await s3Upload.s3Upload();
            await sleep(DELAY_5s);
          });
        } else {
          await sleep(DELAY_500ms);
          await reporter.generate(reportOptions);
        }
      }
      /** grab the file data for xml creation */
      let jsonFile = path.resolve(paths.reports, browserName, envName, `${reportName}-${dateTime}.json`);
      const reportRaw = fs.readFileSync(jsonFile).toString().trim();

      const xmlReport = jUnit(reportRaw);
      const junitOutputPath = path.resolve(
        path.resolve(paths.reports, browserName, envName, `${reportName}-${dateTime}.xml`),
      );
      fs.writeFileSync(junitOutputPath, xmlReport);
    }
  },
};
