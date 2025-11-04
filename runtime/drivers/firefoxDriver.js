/**
 * klassi Automated Testing Tool
 * Created by Larry Goddard
 */
const { remote } = require('webdriverio');
const { Before } = require('@cucumber/cucumber');
const fs = require('fs-extra');
const path = require('path');

const apiTagsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../scripts/tagList.json')));

let defaults = {};
let isApiTest;
let useProxy = false;

Before(async (scenario) => {
  try {
    const scenarioTags = scenario.pickle.tags.map(tag => tag.name.replace('@', '').toLowerCase());
    const tagList = (apiTagsData.tagNames || []).map(tag => tag.replace('@', '').toLowerCase());
    isApiTest = scenarioTags.some(tag => tagList.includes(tag));
  } catch (error) {
    console.error('Error in Before hook: ', error);
  }
});

/**
 * create the web browser based on globals set in index.js
 * @returns {{}}
 */
module.exports = async function firefoxDriver(options) {
  defaults = {
    logLevel: 'error',
    path: '/',
    capabilities: {
      browserName: 'firefox',
      'moz:firefoxOptions': {
        args: ['--disable-popup-blocking', '--disable-gpu'],
      },
    },
  };

  if (isApiTest) {
    defaults.capabilities['moz:firefoxOptions'].args.push('--headless', '--disable-popup-blocking', '--disable-gpu');
  }

  if (useProxy) {
    defaults.capabilities.proxy = {
      httpProxy: 'http://klassiarray.klassi.co.uk:8080',
      proxyType: 'MANUAL',
      autodetect: false,
    };
  }
  const extendedOptions = Object.assign(defaults, options);
  global.browser = await remote(extendedOptions);
  await global.browser.setWindowSize(1280, 1024);
  return global.browser;
};
