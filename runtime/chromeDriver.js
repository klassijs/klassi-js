/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';

const webdriverio = require('webdriverio'),
  chromedriver = require('chromedriver');

/**
 * create the web browser based on globals set in index.js
 * @returns {{}}
 */
module.exports = function chromeDriver(options){
  
  const defaults = {
    desiredCapabilities: {
      browserName: 'chrome',
      javascriptEnabled: true,
      acceptSslCerts: true,
      chromeOptions: {
        // args: ['--headless',
        // ],
      },
      path: chromedriver.path
    }
  };

  // Add proxy based on env var.
  const useProxy = process.env.USE_PROXY || false;

  if ( useProxy ) {
    defaults.desiredCapabilities.proxy = {
      httpProxy: 'http://domain.com:8080',
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
