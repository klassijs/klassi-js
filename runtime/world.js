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
const program = require('commander');
const merge = require('merge');
const requireDir = require('require-dir');
const s3Upload = require('./s3Upload');
const getRemote = require('./getRemote');

/**
 * This is the Global date functionality
 */
global.date = require('./helpers').currentDate();

/**
 * for the Download of all file types
 */
global.downloader = require('./downloader');

/**
 * Driver environment variables
 * @type {function(*): {}}
 */
const ChromeDriver = require('./chromeDriver');
const FirefoxDriver = require('./firefoxDriver');
const AndroidDriver = require('./androidDriver');
const iOSDriver = require('./iosDriver');
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

    case 'android':
      {
        browser = AndroidDriver(options);
      }
      break;

    case 'ios':
      {
        browser = iOSDriver(options);
      }
      break;

    default: {
      browser = ChromeDriver(options);
    }
  }
  return browser;
}

function World() {
  /**
   * create a list of variables to expose globally and therefore accessible within each step definition
   * @type {{date: (value?: string) => object, expect: *, shared: {}, assert: ((function(Philosophical, (String|Function), (String|Function), Comprehend.SentimentScore.Mixed, Comprehend.SentimentScore.Mixed, Boolean))|((value: unknown, message?: string) => asserts value)|((value: unknown, message?: string) => asserts value)|*), page: *[]}}
   */
  const runtime = {
    expect: global.expect, // expose chai expect to allow variable testing
    assert: global.assert, // expose chai assert to allow variable testing
    page: [], // empty page objects placeholder
    shared: {}, // empty shared objects placeholder
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
        const dir = requireDir(itemPath, { camelcase: true });
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
Before(function () {
  global.cucumberThis = this;
  global.browser = getDriverInstance();
  return browser;
});

global.status = 0;

/**
 * executed before each scenario
 */
Before(async (scenario) => {
  const { browser } = global;
  if (remoteService && remoteService.type === 'lambdatest') {
    await browser.execute(`lambda-name=${scenario.pickle.name}`);
  }
});

/**
 * compile and generate a report at the END of the test run to be send by Email
 * send email with the report to stakeholders after test run
 */
AfterAll(async () => {
  const { browser } = global;
  try {
    browser.pause(DELAY_5s);
    if (remoteService && remoteService.type === 'lambdatest' && program.opts().email) {
      browser.pause(DELAY_5s).then(async () => {
        await s3Upload.s3Upload();
        browser.pause(DELAY_30s).then(() => {
          process.exit(global.status);
        });
      });
    } else if (remoteService && remoteService.type === 'lambdatest') {
      browser.pause(DELAY_5s).then(async () => {
        process.exit(global.status);
      });
    } else if (program.opts().email) {
      browser.pause(DELAY_5s).then(async () => {
        await helpers.klassiEmail();
        browser.pause(DELAY_3s);
      });
    }
  } catch (err) {
    console.log(err.message);
  }
});

/**
 * LambdaTest Only
 * executed ONLY on failure of a scenario to get the video link
 * from lambdatest when it fails for the report
 */
After(async (scenario) => {
  // eslint-disable-next-line no-undef
  if (scenario.result.status === Status.FAILED && remoteService && remoteService.type === 'lambdatest') {
    await helpers.ltVideo();
    // eslint-disable-next-line no-undef
    const vidLink = await videoLib.getVideoId();
    // eslint-disable-next-line no-undef
    cucumberThis.attach(
      `video:\n <video width='320' height='240' controls autoplay> <source src=${vidLink} type=video/mp4> </video>`
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
  // eslint-disable-next-line no-shadow
  const { browser } = global;
  if (scenario.result.status === Status.FAILED || scenario.result.status === Status.PASSED) {
    if (remoteService && remoteService.type === 'lambdatest') {
      if (scenario.result.status === 'FAILED') {
        await browser.execute('lambda-status=failed');
      } else if (scenario.result.status === Status.PASSED) {
        await browser.execute('lambda-status=passed');
      }
      return this.closebrowser();
    }
  }
  return this.closebrowser();
});

/**
 * get executed only if there is an error within a scenario
 */
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
