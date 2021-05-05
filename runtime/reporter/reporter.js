/**
 Klassi Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2016 - Larry Goddard <larryg@klassitech.co.uk>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
const fs = require('fs-extra');
const path = require('path');
const reporter = require('cucumber-html-reporter');
const jUnit = require('cucumber-junit');
const getRemote = require('../getRemote');

const remoteService = getRemote(global.settings.remoteService);
const browserName = global.settings.remoteConfig || global.BROWSER_NAME;
let resp;

module.exports = {
  ipAddr: async () => {
    const endPoint = 'http://ip-api.com/json';
    resp = await helpers.apiCall(endPoint, 'GET');
    await resp;
  },

  async reporter() {
    let iPData;
    try {
      await this.ipAddr();
      iPData = await resp.body;
    } catch (err) {
      iPData = {};
      console.log('IP addr func err: ', err.message);
    }

    const jsonFile = path.resolve(global.paths.reports, browserName, `${reportName}-${dateTime}.json`);

    if (global.paths.reports && fs.existsSync(global.paths.reports)) {
      global.endDateTime = helpers.getEndDateTime();

      const reportOptions = {
        theme: 'bootstrap',
        jsonFile,
        output: path.resolve(global.paths.reports, browserName, `${reportName}-${dateTime}.html`),
        reportSuiteAsScenarios: true,
        launchReport: !global.settings.disableReport,
        ignoreBadJsonFile: true,
        metadata: {
          'Test Started': startDateTime,
          // eslint-disable-next-line no-undef
          Environment: env.envName,
          IpAddress: iPData.query,
          Browser: browserName,
          Location: `${iPData.city} ${iPData.regionName}`,
          Platform: process.platform,
          'Test Completion': endDateTime,
          Executed:
            (remoteService && remoteService.type === 'browserstack') ||
            (remoteService && remoteService.type === 'lambdatest')
              ? 'Remote'
              : 'Local',
        },
        brandTitle: `${reportName}-${dateTime}`,
        name: `${projectName} ${browserName}`,
      };
      // eslint-disable-next-line func-names
      browser.pause(DELAY_3s).then(() => {
        reporter.generate(reportOptions);

        // grab the file data for xml creation
        const reportRaw = fs.readFileSync(jsonFile).toString().trim();
        const xmlReport = jUnit(reportRaw);
        const junitOutputPath = path.resolve(
          path.resolve(global.paths.reports, browserName, `${reportName}-${dateTime}.xml`)
        );

        fs.writeFileSync(junitOutputPath, xmlReport);
      });
    }
  },
};
