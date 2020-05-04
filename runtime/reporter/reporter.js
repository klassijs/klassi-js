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
'use strict';

const fs = require('fs-extra');
const path = require('path');
const reporter = require('cucumber-html-reporter');
const getRemote = require('../getRemote');
const confSettings = require('../confSettings');

let remoteService = getRemote(global.settings.remoteService);
let reportOptions, res;

module.exports = {
  ipAddr: async() => {
    let endPoint = 'http://ip-api.com/json';
    // let endPoint = 'https://ipinfo.io/json';
    // let endPoint = 'http://www.geoplugin.net/json.gp';
    res = await confSettings.apiCall(endPoint, 'GET');
    await res;
  },

  reporter: async function() {
    let helpers = require('../confSettings');
    await this.ipAddr();
    let iPData = await res.body;

    if (global.paths.reports && fs.existsSync(global.paths.reports)) {
      global.endDateTime = helpers.getEndDateTime();

      reportOptions = {
        theme: 'bootstrap',
        jsonFile: path.resolve(
          global.paths.reports, BROWSER_NAME,
          projectName + ' ' + global.reportName + '-' + dateTime + '.json'
        ),
        output: path.resolve(
          global.paths.reports, BROWSER_NAME,
          projectName + ' ' + global.reportName + '-' + dateTime + '.html'
        ),
        reportSuiteAsScenarios: true,
        launchReport: !global.settings.disableReport,
        ignoreBadJsonFile: true,
        metadata: {
          'Test Started': startDateTime,
          Environment: envConfig.envName,
          IpAddress: iPData.query,
          Browser: global.settings.remoteConfig || BROWSER_NAME,
          Location: iPData.city + ' ' + iPData.regionName,
          Platform: process.platform,
          'Test Completion': endDateTime,
          Executed:
            remoteService && remoteService.type === 'browserstack'
              ? 'Remote'
              : 'Local'
        },
        brandTitle: projectReportName + ' ' + reportName + '-' + date,
        name: projectReportName
      };
      browser.pause(DELAY_2s).then(async() => {
        await reporter.generate(reportOptions);
        await browser.pause(DELAY_1s);
      });
    }
  }
};
