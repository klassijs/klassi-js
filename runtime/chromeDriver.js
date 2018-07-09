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
      //#proxy: {
      //  httpProxy: 'http://domain.com:8080',
      //  proxyType: 'MANUAL',
      //  autodetect: false
      //},
      javascriptEnabled: true,
      acceptSslCerts: true,
      chromeOptions: {
        // args: ['--headless',
        // ],
      },
      path: chromedriver.path
    }
  };
  
  const extendedOptions = Object.assign(defaults, options);
  
  let driver = new webdriverio.remote(extendedOptions).init();
  
  driver.then(function () {
    /** sets the browser window size to maximum
     */
    driver.windowHandleMaximize();
  });
  
  return driver;
};
