/**
 Klassi Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2016 - Larry Goddard <larryg@klassitech.co.uk>
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const AWS = require('aws-sdk');
const readdir = require('recursive-readdir');

module.exports = {
  /**
   * ========== All operational functions ==========
   */
  /**
   * returns a promise that is called when the url has loaded and the body element is present
   * @param {string} url to load
   * @param seconds
   * @returns {Promise}
   * @example
   *      helpers.loadPage('http://www.google.co.uk');
   */
  async loadPage(url, seconds) {
    /**
     * Wait function - measured in seconds for pauses during tests to give time for processes such as
     * a page loading or the user to see what the test is doing
     * @param seconds
     * @type {number}
     */
    const timeout = seconds ? seconds * 1000 : global.timeout;
    /**
     * load the url and wait for it to complete
     */
    await browser.url(url, function () {
      /**
       * now wait for the body element to be present
       */
      browser.waitUntil(browser.$('body'), timeout);
    });
    /**
     * grab the userAgent details from the loaded url
     */
    // this.getUserAgent();
    cucumberThis.attach(`loaded url: ${url}`);
  },
  
  /**
   * @returns {Promise<void>}
   */
  async getUserAgent() {
    // getUserAgent: async () => {
    const script = await browser.execute(() => window.navigator.userAgent);
    let file;

    if (program.aces) {
      file = `../../${projectName}/test/shared-objects/docs/userAgent.txt`;
    } else {
      file = `../${projectName}/shared-objects/docs/userAgent.txt`;
    }
    await this.writeToTxtFile(file, script);
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
      log.error(`Error in writing file ${err.message}`);
      throw err;
    }
  },

  /**
   * @param filePath
   * @returns {Promise<unknown>}
   */
  readFromFile: (filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        // eslint-disable-next-line no-param-reassign
        data = data.toString();
        resolve(data);
      });
    });
  },

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
    await verify.saveScreenshot(fileName, elementsToHide);
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
    // return yyyy + '-' + mm + '-' + dd;
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
   * Get current date and time dd/mm/yyy 00:00:00
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
    const eDate = this.getCurrentDateTime();
    return eDate;
  },

  getStartDateTime() {
    const sDate = this.getCurrentDateTime();
    return sDate;
  },

  oupReporter(err) {
    // eslint-disable-next-line global-require
    const reporter = require('./reporter/reporter').reporter();
    if (err) {
      log.error(`There is a reporting system error: ${err.stack}`);
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
    const mailer = require('./mailer').oupSendMail();
    if (err) {
      log.error(`This is a Email system error: ${err.stack}`);
      throw err;
    }
    return mailer;
  },

  /**
   * ========== API FUNCTIONALITY ==========
   *  API call for GET, PUT, POST and DELETE functionality
   * @param url
   * @param auth
   * @param method
   * @param body
   * @param fileName
   * @param fileData
   * @param statusCode
   * @type {{ GET: receive all info, POST: create, PUT: edit / update, DELETE: remove info }},
   */
  apiCall(url, method, auth, body, fileName, fileData, statusCode) {
    const options = {
      url,
      method,
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body,
      json: true,
      time: true,
      resolveWithFullResponse: true,
    };

    /**
     * when using VPN connection ... Add proxy based on env var.
     * if proxy name 'ouparray.oup.com' does not work then please try to use
     * the IP. Example : http://10.0.130.110:8080 - please check the IP with
     * Networking engineers as it may change */
    const useProxy = process.env.USE_PROXY || false;
    if (useProxy) {
      defaults.options.proxy = {
        proxy: 'http://ouparray.oup.com:8080',
      };
    }

    return gotApi(options).then(async function (res) {
      if (statusCode != null) {
        assert.equal(res.statusCode, statusCode);
        log.info(`API Response time : ${res.timings.response}`);
      }

      if (method === 'GET') {
        return res;
      }
      if ((method === 'DELETE' && fileName != null) || (method === 'PUT' && fileName != null)) {
        return fs.readFileSync(fileName, 'utf8', function (err) {
          if (err) {
            log.error(err.message);
          }
        });
      }
      if (method === 'POST' && fileName != null) {
        // eslint-disable-next-line func-names,no-shadow
        return res.json().then(async function (res) {
          console.log('parsed json', res);
          const data = await res.id;
          await fs.writeFileSync(fileName, data, function (err) {
            if (err) {
              log.error(err.message);
            }
          });
        });
      }
      return res;
    });
  },

  /**
   * function to upload the test report run folder to an s3 - AWS
   */
  s3Upload() {
    const browserName = global.settings.remoteConfig || global.BROWSER_NAME;
    // eslint-disable-next-line global-require
    const s3Data = require('./scripts/secrets/awsConfig');
    const folderName = `/${date}/${projectName}/reports`;
    const BUCKET = s3Data.BUCKET_NAME + folderName;
    const KEY = s3Data.ID;
    const { SECRET } = s3Data;
    let cpPath;
    if (program.aces) {
      cpPath = path.resolve(__dirname, '../projects/', projectName, 'test/reports');
    } else {
      cpPath = path.resolve(__dirname, '../projects/', projectName, 'reports');
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
   * getting the video link from browserstack
   * @returns {Promise<void>}
   */
  bsVideo: async () => {
    // eslint-disable-next-line global-require
    const page = require('./getBsVideoLinks');
    await page.getProjectList();
    await page.getProjectDetails();
    await page.getSessionID();
  },
};
