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
let browserName = global.settings.remoteConfig || global.BROWSER_NAME;
let resp;

module.exports = {
  ipAddr: async() => {
    let endPoint = 'http://ip-api.com/json';
    resp = await confSettings.apiCall(endPoint, 'GET');
    await resp;
  },
  
  reporter: async function() {
    await this.ipAddr();
    let iPData = await resp.body;
    
    if (global.paths.reports && fs.existsSync(global.paths.reports)) {
      global.endDateTime = confSettings.getEndDateTime();
      
      let reportOptions = {
        theme: 'bootstrap',
        jsonFile: path.resolve(
          global.paths.reports, browserName,
          projectName + ' ' + reportName + '-' + dateTime + '.json'
        ),
        output: path.resolve(
          global.paths.reports, browserName,
          projectName + ' ' + reportName + '-' + dateTime + '.html'
        ),
        reportSuiteAsScenarios: true,
        launchReport: !global.settings.disableReport,
        ignoreBadJsonFile: true,
        metadata: {
          'Test Started': startDateTime,
          Environment: envConfig.envName,
          IpAddress: iPData.query,
          Browser: browserName,
          Location: iPData.city + ' ' + iPData.regionName,
          Platform: process.platform,
          'Test Completion': endDateTime,
          Executed:
            remoteService && remoteService.type === 'browserstack'
              ? 'Remote'
              : 'Local'
        },
        brandTitle: projectName + ' ' + reportName + '-' + date,
        name: projectReportName + ' ' + browserName
      };
      browser.pause(DELAY_3s).then(function() {
        reporter.generate(reportOptions);
      });
    }
  }
};
