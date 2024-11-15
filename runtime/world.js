/**
 * Klassi-js Automated Testing Tool
 * Created by Larry Goddard
 */
const { setDefaultTimeout, Before } = require('@cucumber/cucumber');
const { astellen } = require('klassijs-astellen');
const { throwCollectedErrors } = require('klassijs-assertion-tool');
const data = require('./helpers');
const { filterQuietTags } = require('../cucumber');
const { getTagsFromFeatureFiles } = require('../index');

/**
 * This is the Global date functionality
 */
global.date = data.currentDate();

/**
 * Driver environment variables
 * @type {function(*): {}}
 */
const ChromeDriver = require('./drivers/chromeDriver');
const FirefoxDriver = require('./drivers/firefoxDriver');
const LambdaTestDriver = require('./drivers/lambdatestDriver');

let driver = {};
global.world = this;

/**
 * create the web browser based on global let set in index.js
 * @returns {{}}
 */
async function getDriverInstance() {
  let browser = BROWSER_NAME;
  astellen.set('BROWSER_NAME', BROWSER_NAME);
  const options = {};
  const getBrowser = {
    firefox: () => (driver = FirefoxDriver(options)),
    chrome: () => (driver = ChromeDriver(options)),
    default: () => (driver = ChromeDriver(options)),
  };
  (getBrowser[browser] || getBrowser['default'])();
  return driver;
}

/**
 * set the default timeout for all tests
 */
const globalTimeout = process.env.CUCUMBER_TIMEOUT || 300000;
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
global.startDateTime = data.getStartDateTime();

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
        `This scenario was skipped automatically by using the @wip, @skip or a custom tag "${tag.name}" provided at runtime.`,
      );
      return 'skipped';
    }
  }
});

/**
 * This is to control closing the browser or keeping it open after each scenario
 * @returns {Promise<void>|*}
 */
this.browserOpen = function () {
  if (global.browserOpen === false) {
    return browser.deleteSession();
  } else {
    return Promise.resolve();
  }
};


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
   return this.browserOpen();
})

After(async function () {
  // Pass the total assertion errors after each scenario to the report
  await throwCollectedErrors();
});

/**
 * get executed only if there is an error within a scenario
 * will not take an image if it's an API test
 */
After(async function (scenario) {
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

  const correctFeatureTags = getTagsFromFeatureFiles();
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
