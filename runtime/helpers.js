/**
 * klassi Automated Testing Tool
 * Created by Larry Goddard
 */
const fs = require('fs-extra');
const path = require('path');
const pactumJs = require('pactum');
// const urlData = require('../shared-objects/urlData.json').URLs;
const loadConfig = require('./configLoader');
// const testData = require('../shared-objects/testdata.json');
const { EOL, os } = require('os');

// const envName = env.envName.toLowerCase();

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
    cucumberThis.attach(`loaded url: ${url}`);
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
   * append / add data to file on hard drive
   * @param filepath
   * @param output
   * @returns {Promise<void>}
   */
  appendToTxtFile: async (filepath, output) => {
    try {
      await fs.openSync(filepath, 'a');
      await fs.appendFileSync(filepath, output + '\r\n');
      await fs.appendFileSync(filepath, EOL);
    } catch (err) {
      console.error(`Error in writing file ${err.message}`);
      throw err;
    }
  },

  /**
   * This is to read the content of a text file
   * @param filepath
   * @returns {Promise<unknown>}
   */
  readFromFile: (filepath) =>
    new Promise((resolve) => {
      fs.readFile(filepath, 'utf-8', (err, data) => {
        data = data.toString();
        resolve(data);
        // console.log('Success - the file content ', data);
      });
    }),

  /**
   * This is to read the content of a Json file
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
      // console.log('Success - the content: ', fileContent);
    } catch (err) {
      console.error('This Happened: ', err);
    }
  },

  // writeToUrlsData: async (data) => {
  //   await module.exports.writeToJson('./shared-objects/urlData.json', data); // Need to check if it is pointing to the right file
  // },

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

  /**
   * Get the current date in yyyy-mm-dd format for the s3 bucket folder
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

  emailReportDateTime() {
    const $today = new Date();
    const $yesterday = $today;
    $yesterday.setDate($today.getDate() - 1);
    let dd = $yesterday.getDate();
    let mm = $yesterday.getMonth() + 1; // January is 0!
    const yyyy = $yesterday.getFullYear();
    let hours = $yesterday.getHours();
    let minutes = $yesterday.getMinutes();
    let seconds = $yesterday.getSeconds();

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
    return `${dd}-${mm}-${yyyy}-${hours}${minutes}${seconds}`;
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

  oupReporter() {
    try {
      return require('./reporter/reporter').reporter();
    } catch (err) {
      console.error(`This is the Reporting System error: ${err.stack}`);
      throw err;
    }
  },

  /**
   * ========== EMAIL FUNCTIONALITY ==========
   *   Sends an Email to the concerned users with the log and the test report
   */
  oupEmail() {
    try {
      return require('./mailer').oupSendMail();
    } catch (err) {
      console.error(`This is the Email System error: ${err.stack}`);
      throw err;
    }
  },

  /**
   * API call for GET, PUT, POST and DELETE functionality using PactumJS for API testing
   * @param url
   * @param method
   * @param auth
   * @param body
   * @param form
   * @param expectedStatusCode
   * @returns {Promise<*>}
   */
  apiCall: async (url, method, auth = null, form = null, body = null, expectedStatusCode = null) => {
    const options = {
      url,
      method,
      auth,
      headers: {
        Authorization: `${auth}`,
      },
      form,
      body,
      expectedStatusCode,
    };
    if (method === 'GET') {
      resp = await pactumJs
        .spec()
        .get(options.url)
        .withHeaders(options.headers)
        .withRequestTimeout(DELAY_15s)
        .expectStatus(expectedStatusCode)
        .toss();
      getMethod = resp;
    }

    if (method === 'PUT') {
      resp = await pactumJs
        .spec()
        .put(options.url)
        .withHeaders(options.headers)
        .withBody(options.body)
        .withRequestTimeout(DELAY_10s)
        .expectStatus(expectedStatusCode);
      getMethod = resp;
    }

    if (method === 'POST') {
      resp = await pactumJs
        .spec()
        .post(options.url)
        .withHeaders(options.headers)
        .withBody(options.body)
        .withForm(options.form)
        .withRequestTimeout(DELAY_10s)
        .expectStatus(expectedStatusCode);
      getMethod = resp;
    }

    if (method === 'DELETE') {
      resp = await pactumJs
        .spec()
        .post(options.url)
        .withHeaders(options.headers)
        .withBody(options.body)
        .withRequestTimeout(DELAY_10s)
        .expectStatus(expectedStatusCode);
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

  // /**
  //  * This will assert text being returned
  //  * @param selector
  //  * @param expected
  //  */
  // assertText: async (selector, expected) => {
  //   let actual = await browser.$(selector);
  //   await actual.getText();
  //   actual = actual.trim();
  //   await helpers.expectAdv('equal', actual, expected);
  //   // assert.equal(actual, expected);
  //   return this;
  // },
  //
  // /**
  //  * This will assert text being returned includes
  //  * @param selector
  //  * @param expectedText
  //  */
  // expectToIncludeText: async (selector, expectedText) => {
  //   const actual = await browser.$(selector);
  //   await actual.getText();
  //   await helpers.expectAdv('include', elem.length, 0);
  //   expect(actual).to.include(expectedText);
  //   return this;
  // },

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
    // assert.equal(actual, expected);
    await helpers.expectAdv('equal', actual, expected);
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
      '[class="e-f-o"] > div:nth-child(2) > [class="dd-Va g-c-wb g-eg-ua-Uc-c-za g-c-Oc-td-jb-oa g-c"]',
    );
    await elem.isExisting();
    await elem.click();

    await browser.pause(2000);
    elem = await browser.$('.//a[@href="#Add extension"]');
    await elem.isExisting();
    await elem.click();
    await helpers.loadPage(`chrome-extension://${modID}/popup.html`);

    await browser.pause(5000);
    await helpers.waitAndSetValue('(//input[@class="mdc-text-field__input "])[1]', username);
    await helpers.waitAndSetValue('(//input[@class="mdc-text-field__input "])[2]', password);
    await helpers.waitAndClick('//button[@title="Lock to tab"]');
  },

  // installMobileApp: async (appName, appPath) => {
  //   if (env.envName === 'android' || env.envName === 'ios') {
  //     if (!(await browser.isAppInstalled(appName))) {
  //       console.log('Installing application...');
  //       await browser.installApp(appPath);
  //       // assert.isTrue(await browser.isAppInstalled(appName), 'The app was not installed correctly.');
  //       await helpers.expectAdv(
  //         'isTrue',
  //         await browser.isAppInstalled(appName),
  //         null,
  //         'The app was not installed correctly.',
  //       );
  //     } else {
  //       console.log(`The app ${appName} was already installed on the device, skipping installation...`);
  //       await browser.terminateApp(appName);
  //     }
  //   }
  // },

  // uninstallMobileApp: async (appName) => {
  //   if (env.envName === 'android' || env.envName === 'ios') {
  //     if (await browser.isAppInstalled(appName)) {
  //       console.log(`Uninstalling application ${appName}...`);
  //       await browser.removeApp(appName);
  //       await helpers.expectAdv(
  //         'isNotTrue',
  //         await browser.isAppInstalled(appName),
  //         null,
  //         'The app was not uninstalled correctly.',
  //       );
  //       // assert.isNotTrue(await browser.isAppInstalled(appName), 'The app was not uninstalled correctly.');
  //     } else {
  //       console.log(`The app ${appName} was already uninstalled fron the device, skipping...`);
  //     }
  //   }
  // },

  // // TODO: make this more generic
  // /**
  //  * This is to write content to a json file
  //  * @returns {Promise<void>}
  //  */
  // write: async () => {
  //   await module.exports.writeToJson('./shared-objects/testdata.json', testData);
  // },

  // convertJsonToExcel: () => {
  //   let dataObj;
  //   let XLSX;
  //   const arr = [];
  //   for (dataObj of urlData) {
  //     const key = Object.keys(dataObj)[0];
  //     const { url } = dataObj[key];
  //     const { refresh1 } = dataObj[key];
  //     const { refresh2 } = dataObj[key];
  //     const { average } = dataObj[key];
  //
  //     const obj = {
  //       data: key,
  //       url,
  //       refresh1,
  //       refresh2,
  //       average,
  //     };
  //     arr.push(obj);
  //   }
  //
  //   const workSheet = XLSX.utils.json_to_sheet(arr);
  //   const workBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workBook, workSheet, 'WayFlees');
  //   // buffer is to handle large amount of data
  //   XLSX.write(workBook, { bookType: 'xlsx', type: 'buffer' });
  //   // convert workbook data into Binary string
  //   XLSX.write(workBook, { bookType: 'xlsx', type: 'binary' });
  //   XLSX.writeFile(workBook, path.resolve(`./reports/${browserName}/${envName}/urlData.xlsx`));
  // },

  // executeTime: async (endDate, startDate, message) => {
  //   const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
  //   testData.executeTime.time = seconds.toString().replace('-', '');
  //   await module.exports.write();
  //   cucumberThis.attach(`${message + testData.executeTime.time} seconds`);
  // },

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

  // /**
  //  * This function makes using expect easier by just passing the assertion type and values
  //  * it will not fail the test right away but allow the other expects to be executed
  //  * @param assertionType {string}
  //  * @param actual {any}
  //  * @param expected {any}
  //  * @param message {string}
  //  * @param operator {any}
  //  * @returns {Promise<void>}
  //  */
  // expectAdv: async (assertionType, actual, expected = '', message = '', operator = '') => {
  //   const softAssert = expect;
  //   let errmsg;
  //   try {
  //     const getAssertionType = {
  //       equal: () => softAssert(actual).to.equal(expected),
  //       contain: () => softAssert(actual).to.contain(expected),
  //       exist: () => softAssert(actual, message).to.exist,
  //       exists: () => assert.exists(actual, message),
  //       doesNotExist: () => softAssert(actual, message).to.not.exist,
  //       doesNotContain: () => softAssert(actual).to.not.contain(expected),
  //       oneOf: () => softAssert(actual).to.be.oneOf(expected),
  //       toInclude: () => softAssert(actual).to.include(expected),
  //       include: () => assert.include(actual, expected),
  //       isTrue: () => assert.isTrue(actual, message),
  //       isFalse: () => assert.isFalse(actual, message),
  //       notEqual: () => softAssert(actual).to.not.equal(expected, message),
  //       fail: () => assert.fail(actual, expected, message, operator),
  //       isAbove: () => assert.isAbove(actual, expected, message),
  //       toBeDisplayed: () => softAssert(actual).toBeDisplayed(),
  //
  //       default: () => console.info('Invalid assertion type: =======>>>>>>>>>>> ', assertionType),
  //     };
  //     (getAssertionType[assertionType] || getAssertionType['default'])();
  //     errmsg = `Assertion Passes: Valid Assertion Type = ${assertionType}`;
  //     cucumberThis.attach(`<div style="color:green;"> ${errmsg} </div>`);
  //   } catch (err) {
  //     const filteredActual = actual.replace(/[<>]/g, '');
  //     errmsg =
  //       `Assertion Failure: Invalid Assertion Type = ${assertionType}` +
  //       '\n' +
  //       `Assertion failed: expected ${filteredActual} to ${assertionType} ${expected}`;
  //     cucumberThis.attach(`<div style="color:red;"> ${errmsg} </div>`);
  //   }
  // },
  // // TODO: add function to record failed assertions and pass it to the end so that the test fails.
  // /**
  //  * This function makes using assert easier by just passing the assertion type and values
  //  * it will not fail the test right away but allow the other asserts to be executed
  //  * @param assertionType {string}
  //  * @param actual {mixed}
  //  * @param expected {any}
  //  * @param message {string}
  //  * @param operator {any}
  //  * @returns {Promise<void>}
  //  */
  // assertAdv: async (assertionType, actual, expected = '', message = '', operator = '') => {
  //   await helpers.expectAdv(assertionType, actual, expected, message, operator);
  // },

  switchWindowTabs: async (tabId) => {
    const handles = await browser.getWindowHandles();
    if (handles.length > tabId) {
      await browser.switchToWindow(handles[tabId]);
      await browser.pause(DELAY_1s);
    }
  },

  /**
   * Function to verify if a file has been downloaded
   * @param {string} fileName Filename with extension
   * @param {number} timeout Maximum wait time for the file to be downloaded, default value is set to 5 seconds
   * @param {number} interval Wait time between every iteration to recheck the file download, default value is set to 500 ms
   */
  async verifyDownload(fileName, timeout = DELAY_5s, interval = DELAY_500ms) {
    let value = settings.remoteService === 'lambdatest' ? 0 : 1;
    let path;
    if (value === 1) {
      // The below path points to the default downloads folder, if the folder is in some other location, it has to be configured.
      let home = os.homedir();
      path = home + `/Downloads/${fileName}`;
    }
    let isFileDownloaded = false;
    let timeoutInSeconds = timeout / DELAY_1s;
    let intervalInSeconds = interval / DELAY_1s;

    loop: for (let i = 1; i <= timeoutInSeconds / intervalInSeconds; i++) {
      switch (value) {
        case 0:
          if (await browser.execute(`lambda-file-exists=${fileName}`)) {
            isFileDownloaded = true;
            break loop;
          }
          break;
        case 1:
          if (fs.existsSync(path)) {
            isFileDownloaded = true;
            break loop;
          }
      }
      await browser.pause(interval);
    }
    assert.isTrue(isFileDownloaded, `File '${fileName}' is still not downloaded after ${timeout} ms`);
  },

  /**
   * Function to upload one or more files
   * @param {string|string[]} filePaths files to be uploaded with extension
   * @param {string} locator element having attribute type='file'
   */
  async uploadFiles(filePaths, locator) {
    if (typeof filePaths === 'string') {
      filePaths = [filePaths];
    } else if (!Array.isArray(filePaths)) {
      throw `Expected 'string|string[]' but '${typeof filePaths}' was passed`;
    } else if (filePaths.length === 0) {
      throw 'Empty array was passed';
    }
    elem = await browser.$(locator);
    await elem.waitForExist({ DELAY_5s });
    let remoteFilePath = [];
    for (let filePath of filePaths) {
      remoteFilePath.push(await browser.uploadFile(filePath));
    }
    await elem.addValue(remoteFilePath.join('\n'));
  },

  /**
   * Function to get the displayed element among multiple matches
   * @param {string} locator
   * @returns Displayed element
   */
  async returnDisplayedElement(locator) {
    elem = await browser.$(locator);
    await elem.waitForExist();
    let elems = await browser.$$(locator);
    for (let elem of elems) {
      if (await elem.isDisplayed()) return elem;
    }
    return null;
  },
};
