const { remote } = require('webdriverio');

let defaults = {};

/**
 * create the web browser based on globals set in index.js
 * @returns {{}}
 */
module.exports = async function iOSDriver(options) {
  defaults = {
    logLevel: 'error',
    port: 4723,
    path: '/wd/hub',
    capabilities: {
      platformName: 'iOS',
      platformVersion: '15.2',
      deviceName: 'iPhone 13',
      noReset: true,
      fullReset: false,
      automationName: 'XCUITest',
      console: true,
    },
  };

  // Add proxy based on env var.
  const useProxy = process.env.USE_PROXY || false;

  if (useProxy) {
    defaults.capabilities.proxy = {
      httpProxy: 'http://ouparray.oup.com:8080',
      proxyType: 'MANUAL',
      autodetect: false,
    };
  }

  const extendedOptions = Object.assign(defaults, options);
  global.browser = await remote(extendedOptions);
  return browser;
};
