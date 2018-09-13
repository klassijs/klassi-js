/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
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
    host: 'hub.browserstack.com'
    
  };
  
  const extendedOptions = Object.assign(defaults, options);
  
  if (config.logLevel){
    // OPTIONS: verbose | silent | command | data | result
    extendedOptions.logLevel = config.logLevel;
  }
  
  let driver = new webdriverio.remote(extendedOptions).init();
  
  return driver;
};
