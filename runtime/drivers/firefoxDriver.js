/**
 * Klassi-js Automated Testing Tool
 * Created by Larry Goddard
 */
const { remote } = require('webdriverio');
const { Before } = require('@cucumber/cucumber');
const { filterQuietTags } = require('../.././cucumber.js');

let defaults = {};
let isApiTest;
let useProxy = false;

Before(async () => {
  let result = await filterQuietTags();
  const taglist = resultingString.split(',');
  isApiTest = taglist.some((tag) => result.includes(tag));
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
        args: ['--headless', '--disable-popup-blocking', '--disable-gpu'],
      },
    },
  };

  if (options.headless || isApiTest ? '--headless' : '') {
    defaults.capabilities['moz:firefoxOptions'].args.push('--headless', '--disable-popup-blocking', '--disable-gpu');
  }

  if (useProxy) {
    defaults.capabilities.proxy = {
      httpProxy: 'http://ouparray.oup.com:8080',
      proxyType: 'MANUAL',
      autodetect: false,
    };
  }
  const extendedOptions = Object.assign(defaults, options);
  global.browser = await remote(extendedOptions);
  await browser.setWindowSize(1280, 1024);
};
