/**
 KlassiTech Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2019 - Larry Goddard <larryg@klassitech.co.uk>
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
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
