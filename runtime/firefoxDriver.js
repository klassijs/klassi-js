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
module.exports = function firefoxDriver(){
  
  let driver = new webdriverio.remote({
    desiredCapabilities: {
      browserName: 'firefox',
      javascriptEnabled: true,
      acceptSslCerts: true,
      setFirefoxOptions: {
        args: ['--headless']
      },
      'geckodriver.firefox.bin': firefox.path
    }
  }).init().then(function () {
    /** sets the browser window size to maximum
     */
    driver.windowHandleMaximize();
  });
  
  return driver;
};
