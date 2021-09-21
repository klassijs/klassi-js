/**
 klassi-js
 Copyright © 2016 - Larry Goddard

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
const fs = require('fs-extra');
const chalk = require('chalk');
const chai = require('chai');
const apiGot = require('got');
const program = require('commander');
const merge = require('merge');
const requireDir = require('require-dir');
let dir = require('node-dir');

const { Before, After, AfterAll, Status } = require('@cucumber/cucumber');
const { Given, When, Then, And, But } = require('@cucumber/cucumber');
const getRemote = require('./getRemote.js');

/**
 * all assertions for variable testing
 */
const { assert } = chai;
const { expect } = chai;
global.assert = assert;
global.expect = expect;

/**
 * This is the Global date functionality
 */
global.date = require('./helpers').currentDate();

/**
 * for all API test calls
 * @type {Function}
 */
global.gotApi = apiGot;

/**
 * for the Download of all file types
 */
global.downloader = require('./downloader.js');

/**
 * Environment variables
 * @type {*|(function(): browser)}
 */
const ChromeDriver = require('./chromeDriver');
const FirefoxDriver = require('./firefoxDriver');
const BrowserStackDriver = require('./browserStackDriver');
const LambdaTestDriver = require('./lambdatestDriver');

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
  if (remoteService && remoteService.type === 'lambdatest') {
    const configType = global.settings.remoteConfig;
    assert.isString(configType, 'LambdaTest requires a config type e.g. chrome.json');
    browser = LambdaTestDriver(options, configType);
    return browser;
  }
  assert.isNotEmpty(browsers, 'Browser must be defined');

  switch (browsers || '') {
  case 'firefox':
    {
      browser = FirefoxDriver(options);
    }
    break;

  case 'chrome':
    {
      browser = ChromeDriver(options);
    }
    break;

  default: {
    browser = ChromeDriver(options);
  }
  }
  return browser;
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

function World() {
  /**
   * create a list of variables to expose globally and therefore accessible within each step definition
   * @type {{date: (string|*|date), expect: Chai.ExpectStatic, shared: {}, trace: consoleInfo, assert: ((function(Philosophical, (String|Function), (String|Function), Mixed, Mixed, Boolean))|chai.assert|chai.assert), page: [], gotApi: Function, dir, fs: ({mkdirpSync: function(*=, *=): (*), ensureFileSync: function(*=): (undefined), createSymlinkSync: function(*=, *=, *=): (any), emptydirSync: function(*=): (undefined|undefined), moveSync: function(*=, *=, *=): undefined, ensureDirSync: function(*=, *=): (*), createFile: *, createLink: *, ensureLinkSync: function(*=, *=): (any), writeJson: *, readJsonSync: *, ensureSymlink: *, emptyDir: *, mkdirsSync: function(*=, *=): (*), writeJsonSync: *, copy: *, readJson: *, ensureFile: *, ensureSymlinkSync: function(*=, *=, *=): (any), move: *, ensureLink: *, createSymlink: *, ensureDir: *, copySync: function(*=, *=, *=): undefined|void, emptyDirSync: function(*=): (undefined|undefined), mkdirp: *, createFileSync: function(*=): (undefined), emptydir: *, mkdirs: *, createLinkSync: function(*=, *=): (any)}|{emptyDirSync: function(*=): (undefined|undefined), copySync: function(*=, *=, *=): undefined|void, emptyDir: *, emptydir: *, emptydirSync: function(*=): (undefined|undefined), copy: *}), downloader: {fileDownload(*=, *=, *=): void}}}
   */
  const runtime = {
    expect: global.expect, // expose chai expect to allow variable testing
    assert: global.assert, // expose chai assert to allow variable testing
    fs, // expose fs (file system) for use globally
    dir, // expose dir for getting an array of files, subdirectories or both
    // eslint-disable-next-line max-len
    trace: consoleInfo, // expose an info method to log output to the console in a readable/visible format
    page: [], // empty page objects placeholder
    shared: {}, // empty shared objects placeholder
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
// eslint-disable-next-line import/order,import/no-extraneous-dependencies
const { setDefaultTimeout } = require('@cucumber/cucumber');

const globalTimeout = process.env.CUCUMBER_TIMEOUT || 180000;
setDefaultTimeout(globalTimeout);
global.timeout = globalTimeout;

/**
 * start recording of the Test run time
 */
global.startDateTime = require('./helpers').getStartDateTime();

/**
 * create the browser before scenario if it's not instantiated and
 * also exposing the world object in global variable 'cucumberThis' so that
 * it can be used in arrow functions
 */
// eslint-disable-next-line func-names
Before(function () {
  global.cucumberThis = this;
  global.browser = getDriverInstance();
  return browser;
});

global.status = 0;

/**
 * compile and generate a report at the END of the test run to be send by Email
 * send email with the report to stakeholders after test run
 */
AfterAll(async () => {
  // eslint-disable-next-line no-shadow
  const { browser } = global;
  await helpers.klassiReporter();
  try {
    browser.pause(DELAY_5s);
    if (
      (remoteService && remoteService.type === 'browserstack' && program.opts().email) ||
      (remoteService && remoteService.type === 'lambdatest' && program.opts().email)
    ) {
      browser.pause(DELAY_5s).then(async () => {
        await helpers.s3Upload();
        browser.pause(DELAY_10s).then(() => {
          process.exit(global.status);
        });
      });
    } else if (
      (remoteService && remoteService.type === 'browserstack') ||
      (remoteService && remoteService.type === 'lambdatest')
    ) {
      browser.pause(DELAY_5s).then(async () => {
        process.exit(global.status);
      });
    } else if (program.opts().email) {
      browser.pause(DELAY_5s).then(async () => {
        await helpers.klassiEmail();
        browser.pause(DELAY_3s).then(async () => {
          process.exit(global.status);
        });
      });
    }
  } catch (err) {
    console.log(err.message);
  }
});

/**
 * BrowserStack || LambdaTest Only
 * executed ONLY on failure of a scenario to get the video link
 * from browserstack || lambdatest when it fails for the report
 */
After(async (scenario) => {
  if (scenario.result.status === Status.FAILED && remoteService && remoteService.type === 'browserstack') {
    await helpers.bsVideo();
    console.log('video link capture is running.......');
    // eslint-disable-next-line no-undef
    const vidLink = await videoLib.getVideoId();
    // eslint-disable-next-line no-undef
    cucumberThis.attach(
      `video: <video width='320' height='240' controls autoplay> <source src='${vidLink}' type=video/mp4> </video>`
    );
  } else if (scenario.result.status === Status.FAILED && remoteService && remoteService.type === 'lambdatest') {
    await helpers.ltVideo();
    console.log('video link capture is running.......');
    // eslint-disable-next-line no-undef
    const vidLink = await videoLib.getVideoId();
    // eslint-disable-next-line no-undef
    cucumberThis.attach(
      `video: <video width='320' height='240' controls autoplay> <source src='${vidLink}' type=video/mp4> </video>`
    );
  }
});

/**
 * This is to control closing the browser or keeping it open after each scenario
 * @returns {Promise<void|Request<LexRuntime.DeleteSessionResponse, AWSError>|Request<LexRuntimeV2.DeleteSessionResponse, AWSError>>}
 */
// eslint-disable-next-line func-names
this.closebrowser = function () {
  // eslint-disable-next-line no-shadow
  const { browser } = global;
  switch (global.closeBrowser) {
  case 'no':
    return Promise.resolve();
  default:
    if (browser) {
      return browser.deleteSession();
    }
    return Promise.resolve();
  }
};

/**
 * executed after each scenario - always closes the browser to ensure clean browser not cached)
 */
After(async (scenario) => {
  if (scenario.result.status === Status.FAILED || scenario.result.status === Status.PASSED) {
    if (
      (remoteService && remoteService.type === 'browserstack') ||
      (remoteService && remoteService.type === 'lambdatest')
    ) {
      return this.closebrowser();
    }
  }
  console.log(scenario.result.status);
  return this.closebrowser();
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
    global.status = 1;
    return browser.takeScreenshot().then((screenShot) => {
      // screenShot is a base-64 encoded PNG
      world.attach(screenShot, 'image/png');
    });
  }
});
