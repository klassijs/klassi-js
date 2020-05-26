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
// const reporter = require('multiple-cucumber-html-reporter');
const reporter = require('cucumber-html-reporter');
const getRemote = require('../getRemote');

let remoteService = getRemote(global.settings.remoteService);
let reportOptions;
let { metadata } = require('./metaData');

module.exports = {
  reporter: function() {
    let helpers = require('../confSettings');
    if (global.paths.reports && fs.existsSync(global.paths.reports)) {
      global.endDateTime = helpers.getEndDateTime();

      // Single reporter
      reportOptions = {
        theme: 'bootstrap',
        jsonFile: path.resolve(
          global.paths.reports,
          browserName, projectName + ' ' + global.reportName + '-' + date + '.json'
        ),
        output: path.resolve(
          global.paths.reports,
          browserName, projectName + ' ' + global.reportName + '-' + date + '.html'
        ),
        reportSuiteAsScenarios: true,
        launchReport: !global.settings.disableReport,
        ignoreBadJsonFile: true,
        metadata: {
          'Test Started': startDateTime,
          'Test Completion': endDateTime,
          Platform: process.platform,
          Environment: global.envConfig.envName,
          Browser: global.settings.remoteConfig || global.browserName,
          Executed:
            remoteService && remoteService.type === 'browserstack'
              ? 'Remote'
              : 'Local'
        },
        
        brandTitle: projectReportName + ' ' + reportName + '-' + date,
        name: projectReportName
      };

      // TODO: WIP for new style reporter
      // reportOptions = {
      //   jsonDir: path.resolve(global.paths.reports),
      //
      //   reportPath: path.resolve(
      //     global.paths.reports, browserName + '-' + date
      //   ),
      //   // saveCollectedJSON: true,
      //
      //   disableLog: false,
      //   pageTitle: 'Automation Report',
      //   reportName: 'Test Automation Report' + '-' + date, // TODO: make reportName global
      //   openReportInBrowser: !global.settings.disableReport,
      //
      //   customMetadata: true,
      //   metadata: metadata, // TODO: WIP for the new reporter
      //   displayDuration: true,
      //   customData: {
      //     title: 'Test Run Info',
      //     data: [
      //       {
      //         label: 'Project',
      //         value: projectName
      //       },
      //       {
      //         label: 'Environment',
      //         value: global.envConfig.envName
      //       },
      //       {
      //         label: 'Platform',
      //         value: process.platform
      //       },
      //       {
      //         label: 'Executed',
      //         value:
      //           remoteService && remoteService.type === 'browserstack'
      //             ? 'Remote'
      //             : 'Local'
      //       },
      //       {
      //         label: 'Execution Start Time',
      //         value: startDateTime
      //       },
      //       {
      //         label: 'Execution End Time',
      //         value: endDateTime
      //       }
      //     ]
      //   }
      // };
      browser.pause(DELAY_2s).then(function() {
        reporter.generate(reportOptions);
        browser.pause(DELAY_1s);
      });
    }
  }
};
