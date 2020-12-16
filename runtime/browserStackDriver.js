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
const wdio = require('webdriverio');
const loadConfig = require('./configLoader');
const browserstack = require('./remotes/browserstack.js');

module.exports = async function browserstackDriver(options, configType) {
  const config = loadConfig(`./browserstack/${configType}.json`);
  const credentials = browserstack.getCredentials();
  const { user } = credentials;
  const { key } = credentials;
  const buildNameFromConfig = configType.replace(/-/g, ' '); // BrowserStack will do this anyway, this is to make it explicit

  if (process.env.CI || process.env.CIRCLE_CI) {
    const { CIRCLE_BUILD_NUM, CIRCLE_JOB, CIRCLE_USERNAME } = process.env;

    config.build = `CircleCI Build No. #${CIRCLE_BUILD_NUM} for ${CIRCLE_USERNAME}. Job: ${CIRCLE_JOB}`;
  } else if (!config.build) {
    // configs can define their own build name or it is inferred from the configType
    config.build = buildNameFromConfig;
  }

  const defaults = {
    user,
    key,

    updateJob: false,
    exclude: [],
    maxInstances: 10,
    capabilities: config,

    coloredLogs: true,
    screenshotPath: './errorShots/',
    baseUrl: '',
    waitforTimeout: 10000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    host: 'hub.browserstack.com',
  };

  const extendedOptions = Object.assign(defaults, options);
  if (config.logLevel) {
    // OPTIONS: verbose | silent | command | data | result
    extendedOptions.logLevel = config.logLevel;
  }
  global.browser = await wdio.remote(extendedOptions);
  return browser;
};

