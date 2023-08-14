/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const { setDefaultTimeout, Before } = require('@cucumber/cucumber');
const getRemote = require('./getRemote');
const { filterQuietTags } = require('../cucumber');

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
  let browsers = BROWSER_NAME;
  const options = {};
  if (remoteService && remoteService.type === 'lambdatest') {
    const configType = global.settings.remoteConfig;
    assert.isString(configType, 'LambdaTest requires a config type e.g. chrome.json');
    browser = LambdaTestDriver(options, configType);
    return browser;
  }
  assert.isNotEmpty(browsers, 'Browser must be defined');

  const getBrowser = {
    firefox: () => (browser = FirefoxDriver(options)),
    android: () => (browser = AndroidDriver(options)),
    ios: () => (browser = iOSDriver(options)),
    chrome: () => (browser = ChromeDriver(options)),
    default: () => (browser = ChromeDriver(options)),
  };
  (getBrowser[browsers] || getBrowser['default'])();
  return browser;
}

/**
 * set the default timeout for all tests
 */
const globalTimeout = process.env.CUCUMBER_TIMEOUT || 180000;
setDefaultTimeout(globalTimeout);
global.timeout = globalTimeout;

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

/**
 * start recording of the Test run time
 */
global.startDateTime = helpers.getStartDateTime();

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
    // eslint-disable-next-line no-undef
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
    scenario.result.status === Status.SKIPPED ||
    scenario.result.status === Status.UNKNOWN ||
    scenario.result.status === Status.AMBIGUOUS ||
    scenario.result.status === Status.UNDEFINED ||
    scenario.result.status === Status.PENDING
  ) {
    if (remoteService && remoteService.type === 'lambdatest') {
      if (scenario.result.status === 'FAILED') {
        await browser.execute('lambda-status=failed');
      } else if (scenario.result.status === Status.PASSED) {
        await browser.execute('lambda-status=passed');
      } else if (scenario.result.status === Status.SKIPPED) {
        await browser.execute('lambda-status=skipped');
      } else if (scenario.result.status === Status.UNKNOWN) {
        await browser.execute('lambda-status=unknown');
      } else if (scenario.result.status === Status.AMBIGUOUS) {
        await browser.execute('lambda-status=ignored');
      } else if (scenario.result.status === Status.UNDEFINED) {
        await browser.execute('lambda-status=error');
      } else if (scenario.result.status === Status.PENDING) {
        await browser.execute('lambda-status=skipped');
      }
      return this.browserOpen();
    }
  }
  return this.browserOpen();
});

/**
 * get executed only if there is an error within a scenario
 * will not take an image if it's an API test
 */
After(async function (scenario) {
  const { browser } = global;
  const world = this;
  let result = await filterQuietTags();
  const taglist = resultingString.split(',');
  if (!taglist.some((tag) => result.includes(tag)) && scenario.result.status === Status.FAILED) {
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
