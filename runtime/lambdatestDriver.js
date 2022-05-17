/**
 klassi-js
 Copyright © 2016 - Larry Goddard

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
const wdio = require('webdriverio');
const fs = require('fs-extra');
const path = require('path');
const { Before } = require('@cucumber/cucumber');
const { UtamWdioService } = require('wdio-utam-service');
const loadConfig = require('./configLoader');
const lambdatest = require('./remotes/lambdatest');
const utamConfig = require('../utam.config');

const modHeader = fs.readFileSync(path.resolve(__dirname, './scripts/extensions/modHeader_3_1_22_0.crx'), {
  encoding: 'base64',
});
const chExt = {
  'goog:chromeOptions': {
    extensions: [modHeader],
  },
};

let defaults;
let config;

let isUTAMTest;

Before((scenario) => {
  isUTAMTest = scenario.pickle.tags.some((tag) => tag.name.includes('utam'));
});

module.exports = async function lambdatestDriver(options, configType) {
  const browserCapabilities = loadConfig(`./lambdatest/${configType}.json`);
  if (projectName === 'OAF' && browserName === 'chrome') {
    config = Object.assign(browserCapabilities, chExt);
  } else {
    config = browserCapabilities;
  }

  const credentials = lambdatest.getCredentials();
  const { user } = credentials;
  const { key } = credentials;

  // lambdatest will do this anyway, this is to make it explicit
  const buildNameFromConfig = configType.replace(/-/g, ' ');

  if (process.env.CI || process.env.CIRCLE_CI) {
    if (projectName !== 'OAF' && browserName !== 'chrome') {
      config.tunnelName = process.env.TUNNEL_NAME;
      const { CIRCLE_BUILD_NUM, CIRCLE_JOB, CIRCLE_USERNAME } = process.env;
      config.build = `${global.projectName} - CircleCI Build No. #${CIRCLE_BUILD_NUM} for ${CIRCLE_USERNAME}. Job: ${CIRCLE_JOB}`;
    }
  } else if (!config.build) {
    if (projectName !== 'OAF' && browserName !== 'chrome') {
      // configs can define their own build name or it is inferred from the configType
      config.build = buildNameFromConfig;
      config.tunnelName = 'lttunnel';
    }
  }

  defaults = {
    user,
    key,

    updateJob: false,
    exclude: [],
    maxInstances: 10,
    capabilities: config,
    logLevel: 'silent',
    coloredLogs: true,
    screenshotPath: './errorShots/',
    baseUrl: '',
    waitforTimeout: 10000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    path: '/wd/hub',
    hostname: 'hub.lambdatest.com',
    port: 80,
  };

  const extendedOptions = Object.assign(defaults, options);
  if (config.logLevel) {
    // OPTIONS: verbose | silent | command | data | result
    extendedOptions.logLevel = config.logLevel;
  }
  global.browser = await wdio.remote(extendedOptions);
  if (isUTAMTest) {
    const utamInstance = new UtamWdioService(utamConfig, extendedOptions.capabilities, extendedOptions);
    await utamInstance.before(extendedOptions.capabilities);
  }
  return browser;
};
