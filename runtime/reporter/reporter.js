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
const getRemote = require('../getRemote');
const confSettings = require('../confSettings');

const remoteService = getRemote(global.settings.remoteService);
const browserName = global.settings.remoteConfig || global.BROWSER_NAME;
let resp;

module.exports = {
  ipAddr: async () => {
    const endPoint = 'http://ip-api.com/json';
    resp = await confSettings.apiCall(endPoint, 'GET');
    await resp;
  },

  async reporter() {
    let iPData;
    try {
      await this.ipAddr();
      iPData = await resp.body;
    } catch (err) {
      console.log(err);
      iPData = {};
    }

    if (global.paths.reports && fs.existsSync(global.paths.reports)) {
      global.endDateTime = confSettings.getEndDateTime();

      const reportOptions = {
        theme: 'bootstrap',
        jsonFile: path.resolve(global.paths.reports, browserName, `${projectName} ${reportName}-${dateTime}.json`),
        output: path.resolve(global.paths.reports, browserName, `${projectName} ${reportName}-${dateTime}.html`),
        reportSuiteAsScenarios: true,
        launchReport: !global.settings.disableReport,
        ignoreBadJsonFile: true,
        metadata: {
          'Test Started': startDateTime,
          Environment: envConfig.envName,
          IpAddress: iPData.query,
          Browser: browserName,
          Location: `${iPData.city} ${iPData.regionName}`,
          Platform: process.platform,
          'Test Completion': endDateTime,
          Executed: remoteService && remoteService.type === 'browserstack' ? 'Remote' : 'Local',
        },
        brandTitle: `${projectName} ${reportName}-${dateTime}`,
        name: `${projectReportName} ${browserName}`,
      };
      // eslint-disable-next-line func-names
      browser.pause(DELAY_3s).then(function () {
        reporter.generate(reportOptions);
      });
    }
  },
};
