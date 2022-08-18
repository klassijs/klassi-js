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
const program = require('commander');
const AWS = require('aws-sdk');
const readdir = require('recursive-readdir');
const async = require('async');
const pactumJs = require('pactum');
// eslint-disable-next-line import/no-extraneous-dependencies
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

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
  async loadPage(url, seconds) {
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
    await this.getUserAgent();
    cucumberThis.attach(`loaded url: ${url}`);
  },

  /**
   * @returns {Promise<void>}
   */
  async getUserAgent() {
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
      await fs.writeFile(filepath, output);
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
   * Visual comparison function
   * @param fileName
   * @returns {Promise<void>}
   */
  compareImage: async (fileName) => {
    // eslint-disable-next-line global-require
    const verify = require('./imageCompare');
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
    const verify = require('./imageCompare');
    await verify.takeScreenshot(fileName, elementsToHide);
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

  /**
   * Returns number of diff pixels between images
   * @param {string} fileName1 - name of the file
   * @param {string} fileName2 - name of the file
   * @returns
   */
  imagePixelMatch: async (fileName1, fileName2) => {
    const img1 = PNG.sync.read(
      fs.readFileSync(`./artifacts/visual-regression/original/chrome/positive/${fileName1}.png`)
    );
    const img2 = PNG.sync.read(
      fs.readFileSync(`./artifacts/visual-regression/original/chrome/positive/${fileName2}.png`)
    );
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    return pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
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

  klassiReporter(err) {
    // eslint-disable-next-line global-require
    const reporter = require('./reporter/reporter').reporter();
    if (err) {
      console.error(`There is a reporting system error: ${err.stack}`);
      throw err;
    }
    return reporter;
  },

  /**
   * ========== EMAIL FUNCTIONALITY ==========
   *   Sends an Email to the concerned users with the log and the test report
   */
  klassiEmail(err) {
    // eslint-disable-next-line global-require
    const mailer = require('./mailer').klassiSendMail();
    if (err) {
      console.error(`This is a Email system error: ${err.stack}`);
      throw err;
    }
    return mailer;
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
  apiCall: async (url, method, auth, body, status) => {
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
      status = resp.statusCode;
    }

    if (method === 'POST') {
      resp = await pactumJs
        .spec()
        .post(options.url)
        .withHeaders(options.headers)
        .withBody(options.body)
        .withRequestTimeout(DELAY_10s)
        .expectStatus(200);
      status = resp.statusCode;
    }

    if (method === 'DELETE') {
      resp = await pactumJs
        .spec()
        .post(options.url)
        .withHeaders(options.headers)
        .withBody(options.body)
        .withRequestTimeout(DELAY_10s)
        .expectStatus(200);
      status = resp.statusCode;
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
   * function to upload the test report run folder to an s3 - AWS
   */
  s3Upload() {
    const browserName = global.settings.remoteConfig || global.BROWSER_NAME;
    // eslint-disable-next-line no-undef
    const s3Data = dataconfig.awsConfig;
    // eslint-disable-next-line no-undef
    const folderName = `/${date}/${dataconfig.s3FolderName}/reports`;
    const BUCKET = s3Data.BUCKET_NAME + folderName;
    const KEY = process.env.AWS_ID || s3Data.ID;
    const SECRET = process.env.AWS_SECRET || s3Data.SECRET;
    let cpPath;
    if (program.opts().aces) {
      cpPath = path.resolve('./test/reports');
    } else {
      cpPath = path.resolve('./reports');
    }
    const rootFolder = cpPath;
    const uploadFolder = `./${browserName}`;
    let data1;

    const s3 = new AWS.S3({
      signatureVersion: 'v4',
      accessKeyId: KEY,
      secretAccessKey: SECRET,
    });

    function getFiles(dirPath) {
      return fs.existsSync(dirPath) ? readdir(dirPath) : [];
    }

    async function deploy(upload) {
      const filesToUpload = await getFiles(path.resolve(rootFolder, upload));
      return new Promise((resolve, reject) => {
        async.eachOfLimit(
          filesToUpload,
          10,
          async.asyncify(async (file) => {
            const Key = file.replace(`${rootFolder}/`, '');
            console.log(`uploading: [${Key}]`);
            return new Promise((res, rej) => {
              s3.upload(
                {
                  Key,
                  Bucket: BUCKET,
                  Body: fs.readFileSync(file),
                  ContentType: 'text/html',
                },
                // eslint-disable-next-line consistent-return
                async (err, data) => {
                  if (err) {
                    return rej(new Error(err));
                  }
                  res({ result: true });
                  if (data) {
                    data1 = await data;
                  }
                }
              );
            });
          }),
          // eslint-disable-next-line consistent-return
          (err) => {
            if (err) {
              return reject(new Error(err));
            }
            resolve({ result: true });
          }
        );
      });
    }
    deploy(uploadFolder)
      .then(() => {
        console.log('Files uploaded successfully, report folder pushed to s3');
      })
      .catch((err) => {
        console.error(err.message);
        process.exit(0);
      });
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
    await page.getLtVideoLink();
  },

  /**
   * Get the href link from an element
   * @param selector
   * @returns {String|String[]|*|string}
   */
  async getLink(selector) {
    const elem = await browser.$(selector);
    await elem.getAttribute('href');
  },

  async waitAndClick(selector) {
    try {
      const elem = await browser.$(selector);
      await elem.waitForDisplayed(DELAY_3s);
      await elem.waitForEnabled(DELAY_1s);
      await elem.click();
      await browser.pause(DELAY_500ms);
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  },

  async waitAndSetValue(selector, value) {
    try {
      const elem = await browser.$(selector);
      await elem.waitForEnabled(DELAY_3s);
      await elem.click();
      await browser.pause(DELAY_500ms);
      await elem.setValue(value);
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
  async assertText(selector, expected) {
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
  async expectToIncludeText(selector, expectedText) {
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
  async getElementFromFrame(frameName, selector) {
    const frame = await browser.$(frameName);
    await browser.switchToFrame(frame.value);
    await browser.$(selector).getHTML();
    return browser;
  },

  /**
   * @param expected
   */
  async assertUrl(expected) {
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
    await browser.pause();
    await helpers.loadPage(`chrome-extension://${modID}/popup.html`);
    await helpers.waitAndSetValue('(//input[@class="mdc-text-field__input "])[1]', username);
    await helpers.waitAndSetValue('(//input[@class="mdc-text-field__input "])[2]', password);
    await helpers.waitAndClick('//button[@title="Lock to tab"]');
  },

  installMobileApp: async (appName, appPath) => {
    if (env.envName === 'ANDROID' || env.envName === 'IOS') {
      if (!browser.isAppInstalled(appName)) {
        // if (!browser.getUrl(appName)) {
        console.log('Installing application...');
        await browser.installApp(appPath);
        assert.isTrue(browser.isAppInstalled(appName), 'The app was not installed correctly.');
      } else {
        console.log(`The app ${appName} was already installed on the device, skipping installation...`);
        await browser.terminateApp(appName);
      }
    }
  },

  uninstallMobileApp: async (appName, appPath) => {
    if (env.envName === 'ANDROID' || env.envName === 'IOS') {
      if (browser.isAppInstalled(appName)) {
        console.log(`Uninstalling application ${appName}...`);
        await browser.removeApp(appName);
        assert.isNotTrue(browser.isAppInstalled(appName), 'The app was not uninstalled correctly.');
      } else {
        console.log(`The app ${appName} was already uninstalled fron the device, skipping...`);
      }
    }
  },

  addImageToReport: async () => {
    await browser.takeScreenshot().then((image) => {
      // screenShot is a base-64 encoded PNG
      cucumberThis.attach(image, 'image/png');
    });
  },
};
