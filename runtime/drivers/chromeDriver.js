/**
 * OUP Automated Testing Tool
 * Created by Larry Goddard
 */
const { remote } = require('webdriverio');
const { Before } = require('@cucumber/cucumber');
const { filterQuietTags } = require('../.././cucumber.js');

let defaults = {};
let isApiTest;
let useProxy = false;

// chromedriver.start();

Before(async () => {
  let result = await filterQuietTags();
  const taglist = resultingString.split(',');
  isApiTest = taglist.some((tag) => result.includes(tag));
});

/**
 * create the web browser based on globals set in index.js
 * @returns {{}}
 */
module.exports = async function chromeDriver(options) {
  defaults = {
    logLevel: 'error',
    path: '/',
    automationProtocol: 'webdriver',
    capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-popup-blocking',
          'allow-file-access-from-files',
          'use-fake-device-for-media-stream',
          'use-fake-ui-for-media-stream',
        ],
      },
    },
  };

  if (options.headless || isApiTest) {
    defaults.capabilities['goog:chromeOptions'].args.push('--headless', '--disable-extensions');
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

// process.on('exit', async () => {
//   await browser.pause(DELAY_3s).then(() => {
//     console.log('Browser closed successfully');
//     chromedriver.stop();
//   });
// });
