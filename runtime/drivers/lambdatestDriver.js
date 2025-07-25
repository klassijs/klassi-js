/**
 * klassi Automated Testing Tool
 * Created by Larry Goddard
 */
const { remote } = require('webdriverio');
const { Before } = require('@cucumber/cucumber');
const loadConfig = require('../configLoader');
const lambdatest = require('../remotes/lambdatest');
const fs = require('fs-extra');
const path = require('path');

let config;
let isApiTest;

const apiTagsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../scripts/tagList.json')));
const apiTags = global.tagNames;

Before(async (scenario) => {
  try {
    const scenarioTags = scenario.pickle.tags.map(tag => tag.name.replace('@', '').toLowerCase());
    const tagList = (apiTagsData.tagNames && apiTags || []).map(tag => tag.replace('@', '').toLowerCase());
    isApiTest = scenarioTags.some(tag => tagList.includes(tag));
  } catch (error) {
    console.error('Error in Before hook: ', error);
  }
});

module.exports = async function lambdatestDriver(options, configType) {
  if (configType.length > 1) {
    const browserArray = configType.split(',');
    for (const browserItem of browserArray) {
      await browserExecute(options, browserItem);
    }
  }
};

const browserExecute = async (options, configTypeA) => {
  const browserCaps = loadConfig(`./lambdatest/${configTypeA}.json`);
  const credentials = lambdatest.getCredentials();
  const { user, key } = credentials;

  config = browserCaps;

  /** lambdatest will do this anyway, this is to make it explicit */
  const buildNameFromConfig = configTypeA.replace(/-/g, ' ');

  if (process.env.CI || process.env.CIRCLE_CI) {
    config.tunnelName = process.env.TUNNEL_NAME;
    const { CIRCLE_BUILD_NUM, CIRCLE_JOB, CIRCLE_USERNAME } = process.env;
    config.build = `${global.projectName} - CircleCI Build No. #${CIRCLE_BUILD_NUM} for ${CIRCLE_USERNAME}. Job: ${CIRCLE_JOB}`;
    config.buildTags.push(`${CIRCLE_JOB}`);
  } else {
    config.build = `${projectName}-${buildNameFromConfig}`;
    config.tunnelName = process.env.TUNNEL_NAME || 'klassitunnel';
  }

  const capabilities = {
    'LT:Options': {
      ...config,
      user: user,
      accessKey: key,
    },
  };

  options = {
    updateJob: false,
    exclude: [],
    logLevel: 'silent',
    coloredLogs: true,
    waitforTimeout: 10000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    protocol: 'https',
    hostname: 'hub.lambdatest.com',
    port: 443,
    path: '/wd/hub',
    capabilities: capabilities,
  };

  try {
    global.browser = await remote(options);
  } catch (error) {
    console.error('Error in lambdatestDriver:', error);
    throw error;
  }
};
