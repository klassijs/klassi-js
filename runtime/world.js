/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const { setDefaultTimeout, Before } = require('@cucumber/cucumber');

/**
 * This is the Global date functionality
 */
global.date = helpers.currentDate();

/**
 * Driver environment variables
 * @type {function(*): {}}
 */
const ChromeDriver = require('./drivers/chromeDriver');

let driver = {};
global.world = this;

/**
 * create the web browser based on global let set in index.js
 * @returns {{}}
 */
async function getDriverInstance() {
  let browsers = BROWSER_NAME;
  const options = {};
  const getBrowser = {
    chrome: () => (driver = ChromeDriver(options)),
    default: () => (driver = ChromeDriver(options)),
  };
  (getBrowser[browsers] || getBrowser['default'])();
  return driver;
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
  global.driver = getDriverInstance();
  return driver;
});

/**
 * start recording of the Test run time
 */
global.startDateTime = helpers.getStartDateTime();

/**
 * This is to control closing the browser or keeping it open after each scenario
 * @returns {Promise<void>|*}
 */
After(async (scenario) => {
  if (
      scenario.result.status === Status.FAILED ||
      scenario.result.status === Status.PASSED ||
      scenario.result.status === Status.SKIPPED
  )
    if (global.browserOpen === false) {
      return browser.deleteSession();
    } else {
      return Promise.resolve();
    }
})

/**
 * get executed only if there is an error within a scenario
 * will not take an image if it's an API test
 */
After(async function (scenario) {
  const { browser } = global;
  const world = this;
  if (scenario.result.status === Status.FAILED) {
    return browser.takeScreenshot().then((screenShot) => {
      // screenShot is a base-64 encoded PNG
      world.attach(screenShot, 'image/png');
    });
  }
});
