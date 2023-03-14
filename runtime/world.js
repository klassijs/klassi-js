/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const fs = require('fs-extra');
const merge = require('merge');
const requireDir = require('require-dir');
const getRemote = require('./getRemote');
// const helpers = require('./helpers');

/**
 * This is the Global date functionality
 */
global.date = helpers.currentDate();

/**
 * Driver environment variables
 * @type {function(*): {}}
 */
const ChromeDriver = require('./drivers/chromeDriver');
const FirefoxDriver = require('./drivers/firefoxDriver');
const AndroidDriver = require('./drivers/androidDriver');
const iOSDriver = require('./drivers/iosDriver');
const LambdaTestDriver = require('./drivers/lambdatestDriver');

const remoteService = getRemote(global.settings.remoteService);

let browser = {};

/**
 * create the web browser based on global let set in index.js
 * @returns {{}}
 */
async function getDriverInstance() {
  // const browsers = global.settings.BROWSER_NAME;
  const browsers = BROWSER_NAME;
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
   * @type {{date: (value?: string) => object, expect: *, shared: {}, assert: ((function( (String|Function), (String|Function), Boolean))|((value: unknown, message?: string) => asserts value)|((value: unknown, message?: string) => asserts value)|*), page: *[]}}
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
global.startDateTime = helpers.getStartDateTime();

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
 * This verifies that the current scenario to be run includes the @wip or @skip tags
 * and skips the test if that's the case.
 */
Before((scenario) => {
  const correctMultipleTags = module.exports.skipTagValidation();
  for (const tag of scenario.pickle.tags) {
    if (
      tag.name === '@wip' ||
        tag.name === '@skip' ||
        (correctMultipleTags && correctMultipleTags.includes(tag.name))
    ) {
      cucumberThis.attach(
        `This scenario was skipped automatically by using the @wip, @skip or a custom tag "${tag.name}" provided at runtime.`
      );
      return 'skipped';
    }
  }
});

/**
 * LambdaTest Only
 * executed ONLY on failure of a scenario to get the video link
 * from lambdatest when it fails for the report
 */
After(async (scenario) => {
  if (scenario.result.status === Status.FAILED && remoteService && remoteService.type === 'lambdatest') {
    await helpers.ltVideo();
    const vidLink = await videoLib.getVideoId();
    cucumberThis.attach(
      `video:\n <video width='320' height='240' controls autoplay> <source src=${vidLink} type=video/mp4> </video>`
    );
  }
});

/**
 * This is to control closing the browser or keeping it open after each scenario
 * @returns {Promise<void>|*}
 */
this.browserOpen = function () {
  const { browser } = global;
  if (global.browserOpen === false) {
    return browser.deleteSession();
  } else {
    return Promise.resolve();
  }
};

/**
 * executed after each scenario - always closes the browser to ensure clean browser not cached)
 */
After(async (scenario) => {
  const { browser } = global;
  if (
    scenario.result.status === Status.FAILED ||
      scenario.result.status === Status.PASSED ||
      scenario.result.status === Status.SKIPPED
  ) {
    if (remoteService && remoteService.type === 'lambdatest') {
      if (scenario.result.status === 'FAILED') {
        await browser.execute('lambda-status=failed');
      } else if (scenario.result.status === Status.PASSED) {
        await browser.execute('lambda-status=passed');
      } else if (scenario.result.status === Status.SKIPPED) {
        await browser.execute('lambda-status=skipped');
      }
      return this.browserOpen();
    }
  }
  return this.browserOpen();
});

/**
 * get executed only if there is an error within a scenario
 */
After(function (scenario) {
  const { browser } = global;
  const world = this;
  if (scenario.result.status === Status.FAILED) {
    // global.status = 1;
    return browser.takeScreenshot().then((screenShot) => {
      // screenShot is a base-64 encoded PNG
      world.attach(screenShot, 'image/png');
    });
  }
});

/**
 * this allows for the skipping of scenarios based on tags
 * @returns {*|null}
 */
function skipTagValidation() {
  let multipleTags;
  if (!skipTag || skipTag.length === 0) {
    return null;
  }
  // eslint-disable-next-line no-undef
  const correctFeatureTags = getTagsFromFeatureFiles;
  multipleTags = skipTag.split(',');
  const correctTags = [];
  for (const tag of multipleTags) {
    if (!tag || tag.length === 0) {
      continue;
    }
    if (tag[0] !== '@') {
      console.error(`Error: the tag should start with an @ symbol. The skipTag provided was "${tag}". `);
      continue;
    }
    if (!correctFeatureTags.includes(tag)) {
      console.error('Error: the requested tag does not exist ===> ', tag);
      continue;
    }
    correctTags.push(tag);
  }
  return correctTags.length !== 0 ? correctTags : null;
}

module.exports = { skipTagValidation };
