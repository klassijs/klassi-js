/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const fs = require('fs-extra');
const path = require('path');

const envName = env.envName.toLowerCase();

let elem;

module.exports = {
  /**
   * returns a promise that is called when the url has loaded and the body element is present
   * @param {string} url to load
   * @param seconds
   * @returns {Promise}
   * @example
   *      helpers.loadPage('http://www.duckduckgo.com', 5);
   */
  loadPage: async (url, seconds) => {
    /**
     * Wait function - measured in seconds for pauses during tests to give time for processes such as
     * a page loading or the user to see what the test is doing
     * @param seconds
     * @type {number}
     */
    const timeout = seconds || global.timeout;
    /**
     * load the url and wait for it to complete
     */
    await browser.url(url, async () => {
      /**
       * now wait for the body element to be present
       */
      await browser.waitUntil(async () => await browser.execute(() => document.readyState === 'complete'), {
        timeoutMsg: `The web page is still not loaded after ${timeout} seconds`,
      });
    });
    /**
     * grab the userAgent details from the loaded url
     */
    // await helpers.getUserAgent();
    cucumberThis.attach(`loaded url: ${url}`);
  },

  /**
   * @returns {Promise<void>}
   */
  getUserAgent: async () => {
    const script = await browser.execute(() => window.navigator.userAgent);
    const file = path.resolve('./shared-objects/docs/userAgent.txt');
    await helpers.writeToTxtFile(file, script);
    await browser.pause(DELAY_100ms);
  },

  /**
   * writeTextFile write data to file on hard drive
   * @param filepath
   * @param output
   */
  writeToTxtFile: async (filepath, output) => {
    try {
      await fs.truncate(filepath, 0);
      await fs.writeFileSync(filepath, output);
    } catch (err) {
      console.error(`Error in writing file ${err.message}`);
      throw err;
    }
  },

  /**
   * @param filepath
   * @returns {Promise<unknown>}
   */
  readFromFile: (filepath) =>
    new Promise((resolve, reject) => {
      fs.readFile(filepath, 'utf-8', (err, data) => {
        data = data.toString();
        resolve(data);
        // console.log('Success - the file content ', data);
      });
    }),

  /**
   * This is to read content from a Json file
   * @param filename
   * @returns {Promise<void>}
   */
  readFromJson: async (filename) => {
    const fileContent = await fs.readJson(filename);
    // console.log('Success - the file content ', fileContent);
    return fileContent;
  },

  /**
   * This is to write values into a JSON file
   * @param filePath
   * @param fileContent
   * @returns {Promise<void>}
   */
  writeToJson: async (filePath, fileContent) => {
    try {
      await fs.writeFile(filePath, JSON.stringify(fileContent, null, 4));
      console.log('Success - the content: ', fileContent);
    } catch (err) {
      console.error('This Happened: ', err);
    }
  },

  /**
   * This is to merge content of json files
   * @param filePath
   * @param file
   * @returns {Promise<void>}
   */
  mergeJson: async (filePath, file) => {
    const fileA = loadConfig(filePath);
    return Object.assign(fileA, file);
  },

  /**
   * Get the current date dd-mm-yyyy
   * @returns {string|*}
   */
  currentDate() {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; // January is 0!
    const yyyy = today.getFullYear();

    if (dd < 10) {
      dd = `0${dd}`;
    }
    if (mm < 10) {
      mm = `0${mm}`;
    }
    return `${dd}-${mm}-${yyyy}`;
  },

  reportDateTime() {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; // January is 0!
    const yyyy = today.getFullYear();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    let milliseconds = today.getMilliseconds();

    if (dd < 10) {
      dd = `0${dd}`;
    }
    if (mm < 10) {
      mm = `0${mm}`;
    }
    if (hours < 10) {
      hours = `0${hours}`;
    }
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    if (milliseconds < 10) {
      milliseconds = `0${milliseconds}`;
    }
    return `${dd}-${mm}-${yyyy}-${hours}${minutes}${seconds}${milliseconds}`;
  },

  /**
   * Get current date and time dd-mm-yyyy 00:00:00
   */
  getCurrentDateTime() {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; // January is 0!
    const yyyy = today.getFullYear();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();

    if (dd < 10) {
      dd = `0${dd}`;
    }
    if (mm < 10) {
      mm = `0${mm}`;
    }
    if (hours < 10) {
      hours = `0${hours}`;
    }
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${dd}-${mm}-${yyyy}-${hours}:${minutes}:${seconds}`;
  },

  getEndDateTime() {
    return this.getCurrentDateTime();
  },

  getStartDateTime() {
    return this.getCurrentDateTime();
  },

  klassiReporter() {
    try {
      return require('./reporter/reporter').reporter();
    } catch (err) {
      console.error(`There is a reporting system error: ${err.stack}`);
      throw err;
    }
  },

  /**
   * Get the href link from an element
   * @param selector
   * @returns {String|String[]|*|string}
   */
  getLink: async (selector) => {
    elem = await browser.$(selector);
    await elem.getAttribute('href');
  },

  waitAndClick: async (selector) => {
    try {
      elem = await browser.$(selector);
      await elem.isExisting();
      await elem.click();
      await browser.pause(DELAY_500ms);
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  },

  waitAndSetValue: async (selector, value) => {
    try {
      elem = await browser.$(selector);
      await elem.isExisting();
      await browser.pause(DELAY_500ms);
      await elem.addValue(value);
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  },

  /**
   * This will assert text being returned
   * @param selector
   * @param expected
   */
  assertText: async (selector, expected) => {
    let actual = await browser.$(selector);
    await actual.getText();
    actual = actual.trim();
    assert.equal(actual, expected);
    return this;
  },

  /**
   * This will assert text being returned includes
   * @param selector
   * @param expectedText
   */
  expectToIncludeText: async (selector, expectedText) => {
    const actual = await browser.$(selector);
    await actual.getText();
    expect(actual).to.include(expectedText);
    return this;
  },

  /**
   * function to get element from frame or frameset
   * @param frameName
   * @param selector
   * @returns {Promise.<TResult>}
   */
  getElementFromFrame: async (frameName, selector) => {
    const frame = await browser.$(frameName);
    await browser.switchToFrame(frame.value);
    await browser.$(selector).getHTML();
    return browser;
  },

  /**
   * @param expected
   */
  assertUrl: async (expected) => {
    const actual = await browser.getUrl();
    assert.equal(actual, expected);
  },

  /**
   * Generate random integer from a given range
   */
  generateRandomInteger(range) {
    return Math.floor(Math.random() * Math.floor(range));
  },

  /**
   * This method is useful for dropdown boxes as some of them have default 'Please select' option on index 0
   * @param range
   * @returns randomNumber excluding index 0
   */
  getRandomIntegerExcludeFirst(range) {
    let randomNumber = this.generateRandomInteger(range);
    if (randomNumber <= 1) {
      randomNumber += 2;
    }
    return randomNumber;
  },


  /**
   * Sorts results by date
   * @param array
   * @returns {*}
   */
  sortByDate(array) {
    array.sort((a, b) => {
      const sentDateA = a.split('/');
      const c = new Date(sentDateA[2], sentDateA[1], sentDateA[0]);
      const sentDateB = b.split('/');
      const d = new Date(sentDateB[2], sentDateB[1], sentDateB[0]);
      return d - c;
    });
    return array;
  },

  filterItem: async (selector, itemToFilter) => {
    try {
      const elem = await browser.$(selector);
      await elem.waitForExist(DELAY_5s);
      await elem.waitForEnabled(DELAY_5s);
      await browser.pause(DELAY_500ms);
      await elem.click();
      await browser.setValue(itemToFilter);
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  },

  filterItemAndClick: async (selector) => {
    try {
      await this.filterItem('itemToFilter');
      await browser.pause(DELAY_3s);
      const elem = await browser.$(selector);
      await elem.click();
      await browser.pause(DELAY_3s);
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  },

  /**
   * This generates the Date for uploading and retrieving the reports from s3
   * @returns {Date}
   */
  formatDate() {
    const $today = new Date();
    let $yesterday = new Date($today);
    if (s3Date === true) {
      $yesterday.setDate($today.getDate()); // for testing sending today's report.
    } else {
      $yesterday.setDate($today.getDate() - 1); // Also send last night reports, setDate also supports negative values, which cause the month to rollover.
    }
    let $dd = $yesterday.getDate();
    let $mm = $yesterday.getMonth() + 1; // January is 0!
    const $yyyy = $yesterday.getFullYear();
    if ($dd < 10) {
      $dd = `0${$dd}`;
    }
    if ($mm < 10) {
      $mm = `0${$mm}`;
    }
    $yesterday = `${$yyyy}-${$mm}-${$dd}`;
    return $yesterday;
  },

  /**
   * this uploads a file from local system or project folder
   * @param selector
   * @param filePath
   * @returns {Promise<void>}
   */
  fileUpload: async (selector, filePath) => {
    elem = await browser.$(selector);
    await elem.isExisting();
    const remoteFilePath = await browser.uploadFile(filePath);
    await elem.addValue(remoteFilePath);
  },

  /**
   * This function makes using expect easier by just passing the assertion type and values
   * it will not fail the test right away but allow the other expects to be executed
   * @param assertionType {string}
   * @param actual {any}
   * @param expected {any}
   * @param message {string}
   * @param operator {any}
   * @returns {Promise<void>}
   */
  expectAdv: async (assertionType, actual, expected = '', message = '', operator = '') => {
    const softAssert = expect;
    let errmsg;
    try {
      const getAssertionType = {
        equal: () => softAssert(actual).to.equal(expected),
        contain: () => softAssert(actual).to.contain(expected),
        exist: () => softAssert(actual, message).to.exist,
        exists: () => assert.exists(actual, message),
        doesNotExist: () => softAssert(actual, message).to.not.exist,
        doesNotContain: () => softAssert(actual).to.not.contain(expected),
        toBeOneOf: () => softAssert(actual).to.be.oneOf(expected),
        toInclude: () => softAssert(actual).to.include(expected),
        include: () => assert.include(actual, expected),
        isTrue: () => assert.isTrue(actual, message),
        isFalse: () => assert.isFalse(actual, message),
        toNotEqual: () => softAssert(actual).to.not.equal(expected, message),
        fail: () => assert.fail(actual, expected, message, operator),
        isAbove: () => assert.isAbove(actual, expected, message),
        toBeDisplayed: () => softAssert(actual).toBeDisplayed(),

        default: () => console.info('Invalid assertion type: =======>>>>>>>>>>> ', assertionType),
      };
      (getAssertionType[assertionType] || getAssertionType['default'])();
      errmsg = `Assertion Passes: Valid Assertion Type = ${assertionType}`;
      cucumberThis.attach(`<div style="color:green;"> ${errmsg} </div>`);
    } catch (err) {
      const filteredActual = actual.replace(/[<>]/g, '');
      errmsg =
        `Assertion Failure: Invalid Assertion Type = ${assertionType}` +
        '\n' +
        `Assertion failed: expected ${filteredActual} to ${assertionType} ${expected}`;
      cucumberThis.attach(`<div style="color:red;"> ${errmsg} </div>`);
    }
  },
  // TODO: add function to record failed assertions and pass it to the end so that the test fails.
  /**
   * This function makes using assert easier by just passing the assertion type and values
   * it will not fail the test right away but allow the other asserts to be executed
   * @param assertionType {string}
   * @param actual {mixed}
   * @param expected {any}
   * @param message {string}
   * @param operator {any}
   * @returns {Promise<void>}
   */
  assertAdv: async (assertionType, actual, expected = '', message = '', operator = '') => {
    await helpers.expectAdv(assertionType, actual, expected, message, operator);
  },
};
