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
const path = require('path');
// const AWS = require('aws-sdk');
// const readdir = require('recursive-readdir');
// const async = require('async');
// const { PNG } = require('pngjs');
// const pixelmatch = require('pixelmatch');
const pactumJs = require('pactum');
// const XLSX = require('xlsx');
// const ndjsonToJson = require('ndjson-to-json');

const urlData = require('../shared-objects/urlData.json').URLs;
const loadConfig = require('./configLoader');
const verify = require('./imageCompare');
const testData = require('../shared-objects/testdata.json');

const envName = global.env.envName.toLowerCase();

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
      browser.waitUntil(browser.$('body'), timeout);
    });
    /**
     * grab the userAgent details from the loaded url
     */
    await helpers.getUserAgent();
    // eslint-disable-next-line no-undef
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
      // await fs.appendFile(filepath, output);
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
        // eslint-disable-next-line no-param-reassign
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
   * @param fileContent
   * @param filePath
   * @returns {Promise<void>}
   */
  write: async () => {
    await module.exports.writeToJson('./shared-objects/testdata.json', testData);
  },

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
    // eslint-disable-next-line global-require
    // const verify = require('./imageCompare');
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
    // eslint-disable-next-line global-require
    // const verify = require('./imageCompare');
    await verify.takePageImage(fileName, elementsToHide);
  },

  /**
   * hideElemements hide elements
   * @param selectors
   */
  hideElements: async (selectors) => {
    // if arg is no array make it one
    // eslint-disable-next-line no-param-reassign
    selectors = typeof selectors === 'string' ? [selectors] : selectors;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < selectors.length; i++) {
      const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '0')`;
      // eslint-disable-next-line no-await-in-loop
      await browser.execute(script);
    }
  },

  /**
   * showElemements show elements
   * @param selectors
   */
  showElements: async (selectors) => {
    // if arg is no array make it one
    // eslint-disable-next-line no-param-reassign
    selectors = typeof selectors === 'string' ? [selectors] : selectors;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < selectors.length; i++) {
      const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '1')`;
      // eslint-disable-next-line no-await-in-loop
      await browser.execute(script);
    }
  },

  // /**
  //  * Returns number of diff pixels between images
  //  * @param {string} fileName1 - name of the file
  //  * @param {string} fileName2 - name of the file
  //  * @returns
  //  */
  // imagePixelMatch: async (fileName1, fileName2) => {
  //   const img1 = PNG.sync.read(
  //     fs.readFileSync(`./artifacts/visual-regression/original/${browserName}/positive/${fileName1}.png`)
  //   );
  //   const img2 = PNG.sync.read(
  //     fs.readFileSync(`./artifacts/visual-regression/original/${browserName}/positive/${fileName2}.png`)
  //   );
  //   const { width, height } = img1;
  //   const diff = new PNG({ width, height });
  //   return pixelmatch(img1.data, img2.data, diff.data, width, height, {
  //     threshold: 0.1,
  //   });
  // },

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

  reportDate() {
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
      // eslint-disable-next-line global-require
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
      // eslint-disable-next-line global-require
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
      resp = await pactumJs
        .spec()
        .get(options.url)
        // .withHeaders(options.headers)
        .withRequestTimeout(DELAY_10s)
        .expectStatus(200)
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
   */
  accessibilityError() {
    const totalError = accessibilityLib.getAccessibilityTotalError();
    if (totalError > 0) {
      cucumberThis.attach('The accessibility rule violation has been observed');
      cucumberThis.attach(`Total accessibility error count :${totalError}`);
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
    // eslint-disable-next-line global-require
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
      await elem.waitForDisplayed(DELAY_3s);
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
      await elem.waitForExist({ timeout: DELAY_3s });
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
   */
  clickHiddenElement(selector, textToMatch) {
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

      // eslint-disable-next-line no-plusplus
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
   * @param extName
   * @returns {Promise<*>}
   */
  modHeaderElement: async (extName) => {
    await browser.pause();
    await helpers.loadPage(`https://chrome.google.com/webstore/search/${extName}`);
    const script = await browser.execute(() => window.document.URL.indexOf('consent.google.com') !== -1);
    if (script === true) {
      elem = await browser.$$('[jsname="V67aGc"]:nth-child(3)');
      await elem[1].waitForExist();
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
    // eslint-disable-next-line prefer-destructuring
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
    await helpers.modHeaderElement(extName);
    console.log('modID = ', modID);
    await browser.pause(3000);
    elem = await browser.$(
      '[class="e-f-o"] > div:nth-child(2) > [class="dd-Va g-c-wb g-eg-ua-Uc-c-za g-c-Oc-td-jb-oa g-c"]'
    );
    await elem.isDisplayed();
    await elem.click();
    await browser.pause(2000);
    // elem = await browser.getWindowHandles();
    // console.log('This is the windows ===> ', elem);
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
};
