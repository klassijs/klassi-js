/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const wdio = require('webdriverio');
const { Before } = require('@cucumber/cucumber');
const { UtamWdioService } = require('wdio-utam-service');
const fs = require('fs-extra');
const path = require('path');
const loadConfig = require('../configLoader');
const lambdatest = require('../remotes/lambdatest');
const utamConfig = require('../utam.config');

const modHeader = fs.readFileSync(path.resolve(__dirname, '../scripts/extensions/modHeader_3_1_22_0.crx'), {
  encoding: 'base64',
});

const chExt = {
  'LT:Options': {
    'goog:chromeOptions': {
      extensions: [modHeader],
    },
  },
};

let isUTAMTest;
let config;

Before((scenario) => {
  isUTAMTest = scenario.pickle.tags.some((tag) => tag.name.includes('utam'));
});

module.exports = async function lambdatestDriver(options, configType) {
  const browserCaps = loadConfig(`./lambdatest/${configType}.json`);
  const credentials = lambdatest.getCredentials();
  const { user } = credentials;
  const { key } = credentials;
  if (browserName === 'chrome') {
    config = Object.assign(browserCaps, [chExt]);
  } else {
    config = browserCaps;
  }
  /** lambdatest will do this anyway, this is to make it explicit */
  const buildNameFromConfig = configType.replace(/-/g, ' ');

  if (process.env.CI || process.env.CIRCLE_CI) {
    config.tunnelName = process.env.TUNNEL_NAME;
    const { CIRCLE_BUILD_NUM, CIRCLE_JOB, CIRCLE_USERNAME } = process.env;
    config.build = `${global.projectName} - CircleCI Build No. #${CIRCLE_BUILD_NUM} for ${CIRCLE_USERNAME}. Job: ${CIRCLE_JOB}`;
  } else {
    /** configs can define their own build name or it is inferred from the configType */
    config.build = `${projectName}-${buildNameFromConfig}`;
    config.tunnelName = 'klassitunnel';
  }

  const defaults = {
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
    await utamInstance.before(extendedOptions.capabilities, null, browser);
  }
  return browser;
};
