/**
 KlassiTech Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2016 - Larry Goddard <larryg@klassitech.co.uk>
 
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

const wdio = require('webdriverio');

/**
 * create the web browser based on globals set in index.js
 * @returns {{}}
 */
module.exports = async function firefoxDriver(options) {
  const defaults = {
    logLevel: 'error',
    capabilities: {
      browserName: 'firefox'
    }
  };

  // Add proxy based on env var.
  const useProxy = process.env.USE_PROXY || false;

  if (useProxy) {
    defaults.capabilities.proxy = {
      httpProxy: 'http://domain.com:8080', // input the correct proxy name
      proxyType: 'MANUAL',
      autodetect: false
    };
  }
  const extendedOptions = Object.assign(defaults, options);
  global.driver = await wdio.remote(extendedOptions);
  return driver;
};
