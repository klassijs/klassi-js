/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';

const webdriverio = require('webdriverio'),
  firefox = require('geckodriver');

/** createUrl the web browser based on globals set in index.js
 * @returns {{}}
 */
module.exports = function firefoxDriver(options) {

  const defaults = {
    desiredCapabilities: {
      browserName: 'firefox',
      javascriptEnabled: true,
      acceptSslCerts: true,
      setFirefoxOptions: {
        args: ['--headless'],
        // 'geckodriver.firefox.bin': firefox.path,
      },
      'geckodriver.firefox.bin': firefox.path
    }
  };

  // Add proxy based on env var.
  const useProxy = process.env.USE_PROXY || false;

  if ( useProxy ) {
    defaults.desiredCapabilities.proxy = {
      httpProxy: 'http://ouparray.oup.com:8080',
      // sslProxy: '',
      proxyType: 'MANUAL',
      autodetect: false
    };
  }
  
  const extendedOptions = Object.assign(defaults, options);
  
  let driver = new webdriverio.remote(extendedOptions).init();
  
  driver.then(function () {
    /** sets the browser window size to maximum
     */
    driver.windowHandleMaximize();
  });
  
  return driver;
};
