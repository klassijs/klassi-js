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

const webdriverio = require('webdriverio');
const loadConfig = require('./configLoader.js');
const browserstack = require('./remotes/browserstack.js');

module.exports = function browserstackDriver(options,configType){

  let config = loadConfig(`./browserstack/${configType}.json`);
  let credentials = browserstack.getCredentials();
  
  let user = credentials.user;
  let key = credentials.key;
  
  let buildNameFromConfig = configType.replace(/-/g,' '); // BrowserStack will do this anyway, this is to make it explicit
  
  // configs can define their own build name or it is inferred from the configType
  if (!config.build){
    config.build = buildNameFromConfig;
  }
  
  const defaults = {
    
    user: user,
    key: key,

    updateJob: false,
    exclude: [],
    maxInstances: 10,

    desiredCapabilities: config,

    coloredLogs: true,
    screenshotPath: './errorShots/',
    baseUrl: '',
    waitforTimeout: 10000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    host: 'hub.browserstack.com',
    port: 80
  };
  
  const extendedOptions = Object.assign(defaults, options);
  
  if (config.logLevel){
    // OPTIONS: verbose | silent | command | data | result
    extendedOptions.logLevel = config.logLevel;
  }
  
  let driver = new webdriverio.remote(extendedOptions).init().then(function () {
    // do some thing
  });
  
  return driver;
};
