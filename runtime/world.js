/**
 Klassi Automated Testing Tool
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
const fs = require('fs-extra');
const chalk = require('chalk');
let dir = require('node-dir');
const chai = require('chai');
const apiGot = require('got');
const program = require('commander');
const merge = require('merge');
const requireDir = require('require-dir');
const { Before, After, AfterAll, Status } = require('cucumber');
const { Given, When, Then, And, But } = require('cucumber');
const getRemote = require('./getRemote.js');

const { assert } = chai;
const { expect } = chai;
const log = require('./logger').klassiLog();

let cpPath;
if (program.aces) {
  cpPath = `../projects/${projectName}/test/settings/helpers`;
} else {
  cpPath = `../projects/${projectName}/settings/helpers`;
}
// eslint-disable-next-line import/no-dynamic-require
const helpers = require(cpPath);

/**
 * Adding logging adn helpers
 */
global.log = log;
global.helpers = helpers;

/**
 * This is the Global date functionality
 */
global.date = require('./confSettings').currentDate();

/**
 * for all API test calls
 * @type {Function}
 */
global.gotApi = apiGot;

/**
 *  for the Download of all file types
 */
global.downloader = require('./downloader.js');

/**
 * for all assertions for variable testing
 */
global.assert = assert;
global.expect = expect;

/**
 * Environment variables
 * @type {*|(function(): browser)}
 */
const ChromeDriver = require('./chromeDriver');
const FirefoxDriver = require('./firefoxDriver');
const BrowserStackDriver = require('./browserStackDriver');

const remoteService = getRemote(global.settings.remoteService);

let browser = {};

/**
 * create the web browser based on global let set in index.js
 * @returns {{}}
 */
async function getDriverInstance() {
  const browsers = global.settings.BROWSER_NAME;
  const options = {};
  if (remoteService && remoteService.type === 'browserstack') {
    const configType = global.settings.remoteConfig;
    assert.isString(configType, 'BrowserStack requires a config type e.g. chrome.json');
    browser = BrowserStackDriver(options, configType);
    return browser;
  }
  assert.isNotEmpty(browsers, 'Browser must be defined');
  // eslint-disable-next-line default-case
  switch (browsers || '') {
  case 'firefox':
    // eslint-disable-next-line no-lone-blocks
    {browser = FirefoxDriver(options);} break;
  case 'chrome':
    // eslint-disable-next-line no-lone-blocks
    {browser = ChromeDriver(options);} break;
  default:
  {browser = ChromeDriver(options);}
  }
  return browser;
}

const { envName } = global;
let environ;

if (program.aces) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  environ = require(`../projects/${projectName}/test/configs/envConfig`);
} else {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  environ = require(`../projects/${projectName}/configs/envConfig`);
}

/**
 * for the environment variables
 */
switch (envName || '') {
case 'dev':
  // eslint-disable-next-line no-lone-blocks
  {global.envConfig = environ.dev;} break;
case 'test':
  // eslint-disable-next-line no-lone-blocks
  {global.envConfig = environ.test;} break;
case 'uat':
  // eslint-disable-next-line no-lone-blocks
  {global.envConfig = environ.uat;} break;
case 'preprod':
  // eslint-disable-next-line no-lone-blocks
  {global.envConfig = environ.preprod;} break;
case 'prod':
  // eslint-disable-next-line no-lone-blocks
  {global.envConfig = environ.prod;} break;
default:
  // eslint-disable-next-line no-lone-blocks
  {global.envConfig = environ.test;} break;
}

/**
 * Global timeout
 * @type {number}
 */
global.DELAY_100ms = 100; // 100 millisecond delay
global.DELAY_200ms = 200; // 200 millisecond delay
global.DELAY_300ms = 300; // 300 millisecond delay
global.DELAY_500ms = 500; // 500 millisecond delay
global.DELAY_7500ms = 7500; // 7500 milliseconds delay
global.DELAY_1s = 1000; // 1 second delay
global.DELAY_2s = 2000; // 2 second delay
global.DELAY_3s = 3000; // 3 second delay
global.DELAY_5s = 5000; // 5 second delay
global.DELAY_7s = 7000; // 7 second delay
global.DELAY_8s = 8000; // 8 seconds delay
global.DELAY_10s = 10000; // 10 second delay
global.DELAY_15s = 15000; // 15 second delay
global.DELAY_20s = 20000; // 20 second delay
global.DELAY_1m = 60000; // 1 minute delay
global.DELAY_2m = 120000; // 2 minutes delay
global.DELAY_3m = 180000; // 3 minutes delay
global.DELAY_5m = 300000; // 5 minutes delay

function consoleInfo() {
  // eslint-disable-next-line prefer-rest-params
  const args = [].slice.call(arguments);
  const output = chalk.bgBlue.white(`\n>>>>> \n${args}\n<<<<<\n`);
  console.log(output);
}

/**
 * All Global variables
 * @constructor
 */
global.Given = Given;
global.When = When;
global.Then = Then;
global.And = And;
global.But = But;

function World({ attach, parameters }) {
  this.attach = attach;
  this.parameters = parameters;
  /**
   * create a list of variables to expose globally and therefore accessible within each step definition
   * @type {{browser: null, webdriverio, webdrivercss: *, expect: *, assert: (*), trace: consoleInfo,
   * log: log, page: {}, shared: {}}}
   */
  const runtime = {
    browser: {}, // the browser object
    expect: global.expect, // expose chai expect to allow variable testing
    assert: global.assert, // expose chai assert to allow variable testing
    fs, // expose fs (file system) for use globally
    dir, // expose dir for getting an array of files, subdirectories or both
    trace: consoleInfo, // expose an info method to log output to the console in a readable/visible format
    page: [], // empty page objects placeholder
    shared: {}, // empty shared objects placeholder
    log: global.log, // expose the log method for output to files for emailing
    downloader: global.downloader, // exposes the downloader for global usage
    gotApi: global.gotApi, // exposes GOT for API testing
    date: global.date, // expose the date method for logs and reports
  };
  /**
   *  expose properties to step definition methods via global variables
   */
  Object.keys(runtime).forEach((key) => {
    /** make property/method available as a global (no this. prefix required)
     */
    global[key] = runtime[key];
  });
  /**
   * import page objects (after global lets have been created)
   */
  if (global.paths.pageObjects && fs.existsSync(global.paths.pageObjects)) {
    /** require all page objects using camelcase as object names
     */
    runtime.page = requireDir(global.paths.pageObjects, { camelcase: true });
    /**
     * expose globally
     * @type {{}}
     */
    global.page = runtime.page;
  }
  /**
   * import shared objects from multiple paths (after global lets have been created)
   */
  if (
    global.paths.sharedObjects &&
    Array.isArray(global.paths.sharedObjects) &&
    global.paths.sharedObjects.length > 0
  ) {
    const allDirs = {};
    /**
     * first require directories into objects by directory
     */
    global.paths.sharedObjects.forEach((itemPath) => {
      if (fs.existsSync(itemPath)) {
        dir = requireDir(itemPath, { camelcase: true });
        merge(allDirs, dir);
      }
    });
    /** if we managed to import some directories, expose them
     */
    if (Object.keys(allDirs).length > 0) {
      /** expose globally
       * @type {{}}
       */
      global.shared = allDirs;
    }
  }
}

/**
 * export the 'World' required by cucumber to allow it to expose methods within step def's
 */
this.World = World;

/**
 * set the default timeout for all tests
 */
// eslint-disable-next-line import/order
const { setDefaultTimeout } = require('cucumber');

/**
 * Add timeout based on env var.
 */
const globalTimeout = process.env.CUCUMBER_TIMEOUT || 300000;
setDefaultTimeout(globalTimeout);

/**
 * start recording of the Test run time
 */
global.startDateTime = require('./confSettings').getStartDateTime();

/**
 * create the browser before scenario if it's not instantiated and
 * also exposing the world object in global bariable 'cucumberThis' so that
 * it can be used in arrow fuctions
 */
// eslint-disable-next-line func-names
Before(function () {
  const world = this;
  global.cucumberThis = world;
  global.browser = getDriverInstance();
  return browser;
});

/**
 * compile and generate a report at the END of the test run to be send by Email
 * send email with the report to stakeholders after test run
 */
AfterAll(async () => {
  // eslint-disable-next-line no-shadow
  const { browser } = global;
  // eslint-disable-next-line global-require
  const confSettings = require('./confSettings');
  await browser.pause(DELAY_300ms);
  await confSettings.oupReporter();
  browser.pause(DELAY_5s).then(async () => {
    if (remoteService && remoteService.type === 'browserstack' && program.email) {
      // await confSettings.s3Upload();
    } else if (program.email) {
      browser.pause(DELAY_3s).then(() => confSettings.klassiEmail());
    }
  });
});

/**
 *  executed after each scenario (always closes the browser to ensure fresh tests)
 */
After(async (scenario) => {
  // eslint-disable-next-line no-shadow
  const { browser } = global;
  if (scenario.result.status === Status.FAILED) {
    if (remoteService && remoteService.type === 'browserstack') {
      await browser.deleteSession();
    } else {
      // Comment out to leave the browser open after test run
      console.log(scenario.result.status);
      await browser.deleteSession();
    }
  } else if (remoteService && remoteService.type !== 'browserstack') {
    // Comment out to leave the browser open after test run
    console.log(scenario.result.status);
    await browser.deleteSession();
  } else {
    console.log(scenario.result.status);
    await browser.deleteSession();
  }
});

/**
 * get executed only if there is an error within a scenario
 */
// eslint-disable-next-line consistent-return,func-names
After(function (scenario) {
  // eslint-disable-next-line no-shadow
  const { browser } = global;
  const world = this;
  if (scenario.result.status === Status.FAILED) {
    // eslint-disable-next-line func-names
    return browser.takeScreenshot().then(function (screenShot) {
      // screenShot is a base-64 encoded PNG
      world.attach(screenShot, 'image/png');
    });
  }
});
