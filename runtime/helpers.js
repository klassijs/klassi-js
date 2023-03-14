/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const fs = require('fs-extra');
const path = require('path');
const pactumJs = require('pactum');
const urlData = require('../shared-objects/urlData.json').URLs;
const loadConfig = require('./configLoader');
const verify = require('./imageCompare');
const testData = require('../shared-objects/testdata.json');

const envName = env.envName.toLowerCase();

let elem;
let getMethod;
let resp;
let modID;

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
    await helpers.getUserAgent();
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
      });
    }),

  /**
   * This is to read content from a Json file
   * @param filename
   * @returns {Promise<void>}
   */
  readFromJson: async (filename) => {
    const fileContent = await fs.readJson(filename);
    console.log('Success - the file content ', fileContent);
    return fileContent;
  },

  /**
   * This is to write content to a json file
   * @returns {Promise<void>}
   */
  write: async () => {
    await module.exports.writeToJson('./shared-objects/testdata.json', testData);
  },

  /**
   * This is to write values into a JSON file
   * @param filePath
   * @param fileContent
   * @returns {Promise<void>}
   */
  writeToJson: async (filePath, fileContent) => {
    try {
      // await fs.writeJson(filePath, fileContent);
      await fs.writeFile(filePath, JSON.stringify(fileContent, null, 4));
      console.log('Success - the content: ', fileContent);
    } catch (err) {
      console.error('This Happened: ', err);
    }
  },

  writeToUrlsData: async (data) => {
    await module.exports.writeToJson('./shared-objects/urlData.json', data); // Need to check if it is pointing to the right file
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
   * Visual comparison function
   * @param fileName
   * @returns {Promise<void>}
   */
  compareImage: async (fileName) => {
    await verify.assertion(fileName);
    await verify.value();
    await verify.pass();
  },

  /**
   * @param fileName
   * @param elementsToHide
   * @returns {Promise<void>}
   */
  takeImage: async (fileName, elementsToHide) => {
    await verify.takePageImage(fileName, elementsToHide);
    await browser.pause(DELAY_500ms);
  },

  /**
   * hideElemements hide elements
   * @param selectors
   */
  hideElements: async (selectors) => {
    // if arg is no array make it one
    selectors = typeof selectors === 'string' ? [selectors] : selectors;
    for (let i = 0; i < selectors.length; i++) {
      const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '0')`;
      await browser.execute(script);
    }
  },

  /**
   * showElemements show elements
   * @param selectors
   */
  showElements: async (selectors) => {
    // if arg is no array make it one
    selectors = typeof selectors === 'string' ? [selectors] : selectors;
    for (let i = 0; i < selectors.length; i++) {
      const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '1')`;
      await browser.execute(script);
    }
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

  /**
   * Get the current date yyyy-mm-dd for the s3 bucket folder
   * @returns {string|*}
   */
  s3BucketCurrentDate() {
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
    return `${yyyy}-${mm}-${dd}`;
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
   * ========== EMAIL FUNCTIONALITY ==========
   *   Sends an Email to the concerned users with the log and the test report
   */
  klassiEmail() {
    try {
      return require('./mailer').klassiSendMail();
    } catch (err) {
      console.error(`This is a Email system error: ${err.stack}`);
      throw err;
    }
  },

  /**
   * API call for GET, PUT, POST and DELETE functionality using PactumJS for API testing
   * @param url
   * @param method
   * @param auth
   * @param body
   * @param status
   * @returns {Promise<*>}
   */
  apiCall: async (url, method, auth, body) => {
    const options = {
      url,
      method,
      auth,
      headers: {
        Authorization: `Bearer ${auth}`,
        'content-Type': 'application/json',
      },
      body,
    };
    if (method === 'GET') {
      resp = await pactumJs.spec().get(options.url).withRequestTimeout(DELAY_10s).expectStatus(200).toss();
      getMethod = resp;
    }

    if (method === 'PUT') {
      resp = await pactumJs
        .spec()
        .put(options.url)
        .withHeaders(options.headers)
        .withBody(options.body)
        .withRequestTimeout(DELAY_10s)
        .expectStatus(200);
    }

    if (method === 'POST') {
      resp = await pactumJs
        .spec()
        .post(options.url)
        .withHeaders(options.headers)
        .withBody(options.body)
        .withRequestTimeout(DELAY_10s)
        .expectStatus(200);
    }

    if (method === 'DELETE') {
      resp = await pactumJs
        .spec()
        .post(options.url)
        .withHeaders(options.headers)
        .withBody(options.body)
        .withRequestTimeout(DELAY_10s)
        .expectStatus(200);
    }
  },

  /**
   * this stores the content of the APIs GET call
   * @returns {*}
   */
  getContent() {
    return getMethod;
  },

  /**
   * function for recording total errors from the Accessibility test run
   * @param pageName
   * @param count
   * @returns {Promise<void>}
   */
  accessibilityReport: async (pageName, count = false) => {
    await browser.pause(DELAY_1s).then(() => {
      return accessibilityLib.getAccessibilityReport(pageName);
    });
    await module.exports.accessibilityError(count);
  },
  /**
   * function for recording total errors from the Accessibility test run
   */
  accessibilityError(count) {
    const totalError = accessibilityLib.getAccessibilityTotalError();
    const etotalError = accessibilityLib.getAccessibilityError();
    if (totalError > 0) {
      cucumberThis.attach('The accessibility rule violation has been observed');
      cucumberThis.attach(`accessibility error count per page : ${etotalError}`);
      if (count) {
        cucumberThis.attach(`Total accessibility error count : ${totalError}`);
      }
    } else if (totalError <= 0) {
      const violationcount = accessibilityLib.getAccessibilityError();
      assert.equal(violationcount, 0);
    }
  },

  /**
   * getting the video link from lambdatest
   * @returns {Promise<void>}
   */
  ltVideo: async () => {
    const page = require('./getVideoLinks');
    await page.getVideoList();
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
   * clicks an element (or multiple if present) that is not visible,
   * useful in situations where a menu needs a hover before a child link appears
   * @param {string} selector used to locate the elements
   * @param {string} text to match inner content (if present)
   * @example
   *    helpers.clickHiddenElement('nav[role='navigation'] ul li a','School Shoes');
   *    @deprecated
   */
  clickHiddenElement(selector, textToMatch) {
    // TODO: Find a better way to do this
    /**
     * method to execute within the DOM to find elements containing text
     */
    function clickElementInDom(query, content) {
      /**
       * get the list of elements to inspect
       */
      const elements = document.querySelectorAll(query);
      /**
       * workout which property to use to get inner text
       */
      const txtProp = 'textContent' in document ? 'textContent' : 'innerText';

      for (let i = 0, l = elements.length; i < l; i++) {
        /**
         * If we have content, only click items matching the content
         */
        if (content) {
          if (elements[i][txtProp] === content) {
            elements[i].click();
          }
        } else {
          /**
           * otherwise click all
           */
          elements[i].click();
        }
      }
    }

    /**
     * grab the matching elements
     */
    return browser.$$(selector, clickElementInDom, textToMatch.toLowerCase().trim);
  },

  /**
   * this adds extensions to Chrome Only
   * @param extName
   * @returns {Promise<*>}
   */
  chromeExtension: async (extName) => {
    await browser.pause();
    await helpers.loadPage(`https://chrome.google.com/webstore/search/${extName}`);
    const script = await browser.execute(() => window.document.URL.indexOf('consent.google.com') !== -1);
    if (script === true) {
      elem = await browser.$$('[jsname="V67aGc"]:nth-child(3)');
      await elem[1].isExisting();
      await elem[1].scrollIntoView();
      const elem1 = await elem[1].getText();
      if (elem1 === 'I agree') {
        await elem[1].click();
        await browser.pause(DELAY_300ms);
      }
    }
    elem = await browser.$('[role="row"] > div:nth-child(1)');
    await elem.click();
    await browser.pause(DELAY_200ms);
    const str = await browser.getUrl();
    const str2 = await str.split('/');
    modID = str2[6];
    return modID;
  },

  /**
   * This is the function for installing modeHeader
   * @param extName
   * @param username
   * @param password
   * @returns {Promise<void>}
   */
  modHeader: async (extName, username, password) => {
    await helpers.chromeExtension(extName);
    console.log('modID = ', modID);
    await browser.pause(3000);
    elem = await browser.$(
      '[class="e-f-o"] > div:nth-child(2) > [class="dd-Va g-c-wb g-eg-ua-Uc-c-za g-c-Oc-td-jb-oa g-c"]'
    );
    await elem.isExisting();
    await elem.click();
    await browser.pause(2000);
    elem = await browser.$('.//a[@href="#Add extension"]');
    await elem.isExisting();
    await elem.click();
    // await helpers.loadPage(`chrome-extension://${modID}/popup.html`);
    // await browser.pause(5000);
    // await helpers.waitAndSetValue('(//input[@class="mdc-text-field__input "])[1]', username);
    // await helpers.waitAndSetValue('(//input[@class="mdc-text-field__input "])[2]', password);
    // await helpers.waitAndClick('//button[@title="Lock to tab"]');
  },

  installMobileApp: async (appName, appPath) => {
    if (env.envName === 'android' || env.envName === 'ios') {
      if (!(await browser.isAppInstalled(appName))) {
        console.log('Installing application...');
        await browser.installApp(appPath);
        assert.isTrue(await browser.isAppInstalled(appName), 'The app was not installed correctly.');
      } else {
        console.log(`The app ${appName} was already installed on the device, skipping installation...`);
        await browser.terminateApp(appName);
      }
    }
  },

  uninstallMobileApp: async (appName, appPath) => {
    if (env.envName === 'android' || env.envName === 'ios') {
      if (await browser.isAppInstalled(appName)) {
        console.log(`Uninstalling application ${appName}...`);
        await browser.removeApp(appName);
        assert.isNotTrue(await browser.isAppInstalled(appName), 'The app was not uninstalled correctly.');
      } else {
        console.log(`The app ${appName} was already uninstalled fron the device, skipping...`);
      }
    }
  },

  // TODO: make this more generic
  convertJsonToExcel: () => {
    const arr = [];
    for (dataObj of urlData) {
      const key = Object.keys(dataObj)[0];
      const { url } = dataObj[key];
      const { refresh1 } = dataObj[key];
      const { refresh2 } = dataObj[key];
      const { average } = dataObj[key];

      const obj = {
        data: key,
        url,
        refresh1,
        refresh2,
        average,
      };
      arr.push(obj);
    }

    const workSheet = XLSX.utils.json_to_sheet(arr);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'WayFlees');
    // buffer is to handle large amount of data
    XLSX.write(workBook, { bookType: 'xlsx', type: 'buffer' });
    // convert workbook data into Binary string
    XLSX.write(workBook, { bookType: 'xlsx', type: 'binary' });
    // XLSX.writeFile(workBook, "./reports/${browserName}/urlData.xlsx");
    XLSX.writeFile(workBook, path.resolve(`./reports/${browserName}/${envName}/urlData.xlsx`));
  },

  executeTime: async (endDate, startDate, message) => {
    const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
    testData.executeTime.time = seconds.toString().replace('-', '');
    await module.exports.write();
    cucumberThis.attach(`${message + testData.executeTime.time} seconds`);
  },

  /**
   * drag the page into view
   */
  pageView: async (selector) => {
    const elem = await browser.$(selector);
    await elem.scrollIntoView();
    await browser.pause(DELAY_200ms);
    return this;
  },

  /**
   * Generates a random 13 digit number
   * @param length
   * @returns {number}
   */
  randomNumberGenerator(length = 13) {
    const baseNumber = 10 ** (length - 1);
    let number = Math.floor(Math.random() * baseNumber);
    /**
     * Check if number have 0 as first digit
     */
    if (number < baseNumber) {
      number += baseNumber;
    }
    console.log(`this is the number ${number}`);
    return number;
  },

  /**
   * Reformats date string into string
   * @param dateString
   * @returns {string}
   */
  reformatDateString(dateString) {
    const months = {
      '01': 'January',
      '02': 'February',
      '03': 'March',
      '04': 'April',
      '05': 'May',
      '06': 'June',
      '07': 'July',
      '08': 'August',
      '09': 'September',
      10: 'October',
      11: 'November',
      12: 'December',
    };
    const b = dateString.split('/');
    return `${b[0]} ${months[b[1]]} ${b[2]}`;
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
};
