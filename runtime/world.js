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
'use strict';

/**
 * world.js is loaded by the cucumber framework before loading the step definitions and feature files
 * it sets all the globals
 * it is responsible for setting up and exposing the browser/expect/assert etc required within each step
 * definition
 */
const fs = require('fs-extra');
const requireDir = require('require-dir');
const merge = require('merge');
const chalk = require('chalk');
const dir = require('node-dir');
const chai = require('chai');
const apiGot = require('got');
const program = require('commander');

const assert = chai.assert;
const expect = chai.expect;
const log = require('./logger').klassiLog();
const getRemote = require('./getRemote.js');

let cp_path;
if (program.aces) {
  cp_path = '../projects/' + projectName + '/test/settings/helpers.js';
} else {
  cp_path = '../projects/' + projectName + '/settings/helpers.js';
}
const helpers = require(cp_path);

/**
 * Adding logging
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
 * @type {*|(function(): driver)}
 */
let ChromeDriver = require('./chromeDriver'),
  FirefoxDriver = require('./firefoxDriver'),
  BrowserStackDriver = require('./browserStackDriver');
let remoteService = getRemote(global.settings.remoteService);

let browser = {};

/**
 * create the web browser based on global let set in index.js
 * @returns {{}}
 */
async function getDriverInstance() {
  let browsers = global.settings.BROWSER_NAME;
  let options = {};
  if (remoteService && remoteService.type === 'browserstack') {
    let configType = global.settings.remoteConfig;
    assert.isString(
      configType,
      'BrowserStack requires a config type e.g. win10-chrome'
    );
    browser = BrowserStackDriver(options, configType);
    return browser;
  }
  assert.isNotEmpty(browsers, 'Browser Name must be defined');
  switch (browsers || '') {
  case 'firefox':
    browser = FirefoxDriver(options);
    break;
  case 'chrome':
    browser = ChromeDriver(options);
    break;
  default:
    browser = ChromeDriver(options);
    break;
  }
  return browser;
}

let envName = global.envName;
let environ;

if (program.aces) {
  environ = require('../projects/' + projectName + '/test/configs/envConfig');
} else {
  environ = require('../projects/' + projectName + '/configs/envConfig');
}

/**
 * for the environment variables
 */
switch (envName || '') {
case 'dev':
  global.envConfig = environ.dev;
  break;
case 'uat':
  global.envConfig = environ.uat;
  break;
case 'prod':
  global.envConfig = environ.prod;
  break;
case 'test':
  global.envConfig = environ.test;
  break;
default:
  global.envConfig = environ.test;
  break;
}

/**
 * Global timeout
 * @type {number}
 */
global.DELAY_100ms = 100; // 100 millisecond delay
global.DELAY_200ms = 200; // 200 millisecond delay
global.DELAY_300ms = 300; // 300 millisecond delay
global.DELAY_500ms = 500; // 500 millisecond delay
global.DELAY_1s = 1000; // 1 second delay
global.DELAY_2s = 2000; // 2 second delay
global.DELAY_3s = 3000; // 3 second delay
global.DELAY_5s = 5000; // 5 second delay
global.DELAY_10s = 10000; // 10 second delay
global.DELAY_15s = 15000; // 15 second delay
global.DELAY_20s = 20000; // 20 second delay

function consoleInfo() {
  let args = [].slice.call(arguments),
    output = chalk.bgBlue.white('\n>>>>> \n' + args + '\n<<<<<\n');
  console.log(output);
}

/**
 * All Global variables
 * @constructor
 */
const { Before, After, AfterAll, Status } = require('cucumber');
const { Given, When, Then } = require('cucumber');

global.Given = Given;
global.When = When;
global.Then = Then;

function World() {
  /**
   * create a list of variables to expose globally and therefore accessible within each step definition
   * @type {{browser: null, webdriverio, expect: *, assert: (*), trace: consoleInfo,
   * log: log, page: {}, shared: {}}}
   */
  let runtime = {
    browser: {}, // the browser object
    expect: global.expect, // expose chai expect to allow variable testing
    assert: global.assert, // expose chai assert to allow variable testing
    fs: fs, // expose fs (file system) for use globally
    dir: dir, // expose dir for getting an array of files, subdirectories or both
    trace: consoleInfo, // expose an info method to log output to the console in a readable/visible format
    page: [], // empty page objects placeholder
    shared: {}, // empty shared objects placeholder
    log: global.log, // expose the log method for output to files for emailing
    downloader: global.downloader, // exposes the downloader for global usage
    gotApi: global.gotApi, // exposes the request-promise for API testing
    date: global.date // expose the date method for logs and reports
  };
  /**
   *  expose properties to step definition methods via global variables
   */
  Object.keys(runtime).forEach(function(key) {
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
    let allDirs = {};
    /**
     * first require directories into objects by directory
     */
    global.paths.sharedObjects.forEach(function(itemPath) {
      if (fs.existsSync(itemPath)) {
        let dir = requireDir(itemPath, { camelcase: true });
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
 * export the "World" required by cucumber to allow it to expose methods within step def's
 */
this.World = World;

/**
 * set the default timeout for all tests
 */
const { setDefaultTimeout } = require('cucumber');

/** Add timeout based on env var. */
const globalTimeout = process.env.CUCUMBER_TIMEOUT || 120000;
setDefaultTimeout(globalTimeout);

/**
 * start recording of the Test run time
 */
global.startDateTime = require('./confSettings').getStartDateTime();

/**
 * create the browser before scenario if it's not instantiated
 */
Before(async function() {
  let world=this;
  global.cucumberThis=world;
  global.browser = getDriverInstance();
  return browser;
});

// /**
//  * send email with the report to stakeholders after test run
//  */
// AfterAll(function() {
//   let browser = global.browser;
//   let helpers = require('./confSettings');
//   if (program.email) {
//     browser.pause(DELAY_3s).then(function() {
//       return helpers.klassiEmail();
//     });
//   }
// });

/**
 * compile and generate a report at the END of the test run to be send by Email
 * send email with the report to stakeholders after test run
 */
AfterAll(async function() {
  let browser = global.browser;
  let confSettings = require('./confSettings');
  // TODO: create and add a method here to append the "metadata information" to the .json file before the reporter
  //  ingests it
  // fs.readFile( path.resolve(global.reports, browserName + ' ' + projectName + ' ' + settings.reportName + '-' + dateTime + '.json', function (data) {
  //   let metaDataFile = require('../runtime/scripts/reporter/metaData');
  //   let json = JSON.parse(data);
  //   json.push(data + metaDataFile);
  //   fs.writeFile(path.resolve(global.reports, browserName + ' ' + projectName + ' ' + settings.reportName + '-' + dateTime + '.json', JSON.stringify(json), function (err) {
  //     if (err) throw err;
  //     console.log('The "data to append" was appended to the file!!');
  //   })
  //   );
  // })
  // );
  await browser.pause(DELAY_300ms);
  await confSettings.klassiReporter();
  browser.pause(DELAY_5s).then(function(){
    if (remoteService && remoteService.type === 'browserstack') {
      return confSettings.s3Upload();
    }
  });
  if (program.email) {
    browser.pause(DELAY_5s).then(function() {
      return confSettings.klassiEmail();
    });
  }
});

// /**
//  * compile and generate a report at the END of the test run to be send by Email
//  */
// AfterAll(function() {
//   let browser = global.browser;
//   let confSettings = require('./confSettings');
//   browser.pause(DELAY_300ms);
//   confSettings.klassiReporter();
// });

/**
 *  executed after each scenario (always closes the browser to ensure fresh tests)
 */
After(function(scenario) {
  let browser = global.browser;
  if (scenario.result.status === Status.FAILED) {
    if (remoteService && remoteService.type === 'browserstack') {
      return browser.deleteSession();
    } else {
      // Comment out to do nothing | leave browser open
      return browser.deleteSession();
    }
  } else {
    if (remoteService && remoteService.type !== 'browserstack') {
      // Comment out to do nothing | leave browser open
      return browser.deleteSession();
    } else {
      return browser.deleteSession();
    }
  }
});

/**
 * get executed only if there is an error within a scenario
 */
After(function(scenario) {
  let browser = global.browser;
  let world = this;
  if (scenario.result.status === Status.FAILED) {
    return browser.takeScreenshot().then(function(screenShot) {
      world.attach(screenShot, 'image/png');
    });
  }
});
