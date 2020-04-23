/**
 Klassi Automated Testing Tool
 Created by Larry Goddard
 Copyright © klassitech 2016 - Larry Goddard <larryg@klassitech.co.uk>

 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';
const fs = require('fs-extra');

module.exports = {
  /**
   * ========== All operational functions ==========
   */

  /**
   * returns a promise that is called when the url has loaded and the body element is present
   * @param {string} url to load
   * @returns {Promise}
   * @example
   *      helpers.loadPage('http://www.google.co.uk');
   */
  loadPage: function(url, seconds) {
    /**
     * Wait function - measured in seconds for pauses during tests to give time for processes such as
     * a page loading or the user to see what the test is doing
     * @param seconds
     * @type {number}
     */
    let timeout = seconds ? seconds * 1000 : cucumberTimeout;
    /**
     * load the url and wait for it to complete
     */
    this.getUserAgent();
    browser.url(url, function() {
      /**
       * now wait for the body element to be present
       */
      browser.waitUntil(browser.$('body'), timeout);
    });
  },

  /**
   *
   * @returns {Promise<void>}
   */
  getUserAgent: async function() {
    let script = await browser.execute(() => window.navigator.userAgent);
    await this.writeTextFile('../shared-objects/docs/userAgent.txt', script);
    await browser.pause(DELAY_100ms);
  },

  /**
   * writeTextFile write data to file on hard drive
   * @param filepath
   * @param output
   */
  writeTextFile: async function(filepath, output) {
    try {
      await fs.truncate(filepath, 0);
      await fs.writeFile(filepath, output);
    } catch (err) {
      if (err) {
        log.error('Error in writing file ' + err.message);
        throw err;
      }
    }
  },

  /**
   * Visual comparison function
   * @param fileName
   * @returns {Promise<void>}
   */
  compareImage: async fileName => {
    const verify = require('./imageCompare');
    await verify.assertion(fileName);
    await verify.value();
    await verify.pass();
  },

  /**
   * hideElemements hide elements
   * @param selectors
   */
  hideElements: async function(selectors) {
    // if arg is no array make it one
    selectors = typeof selectors == 'string' ? [selectors] : selectors;
    for (let i = 0; i < selectors.length; i++) {
      const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '0')`;
      await browser.execute(script);
    }
  },

  /**
   * showElemements show elements
   * @param selectors
   */
  showElements: async function(selectors) {
    // if arg is no array make it one
    selectors = typeof selectors == 'string' ? [selectors] : selectors;
    for (let i = 0; i < selectors.length; i++) {
      const script = `document.querySelectorAll('${selectors[i]}').forEach(element => element.style.opacity = '1')`;
      await browser.execute(script);
    }
  },

  /**
   * Get the current date dd-mm-yyyy
   * @returns {string|*}
   */
  currentDate: function() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();

    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    return yyyy + '-' + mm + '-' + dd;
  },

  reportDate: function() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();
    let hours = today.getHours();
    let minutes = today.getMinutes();

    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    return (
      dd + '-' + mm + '-' + yyyy + '-' + hours + minutes
    );
  },

  /**
   * Get current date and time dd/mm/yyy 00:00:00
   */
  getCurrentDateTime: function() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();

    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return (
      yyyy + '-' + mm + '-' + dd + '-' + hours + ':' + minutes + ':' + seconds
    );
  },

  getEndDateTime: function() {
    let eDate = this.getCurrentDateTime();
    return eDate;
  },

  getStartDateTime: function() {
    let sDate = this.getCurrentDateTime();
    return sDate;
  },

  klassiReporter: function(err) {
    let reporter = require('./reporter/reporter').reporter();
    if (err) {
      log.error('There is a reporting system error: ' + err.stack);
      throw err;
    }
    return reporter;
  },

  /**
   * ========== EMAIL FUNCTIONALITY ==========
   */
  /**
   *   Sends an Email to the concerned users with the log and the test report
   */
  klassiEmail: function(err) {
    let mailer = require('./mailer').klassiSendMail();
    if (err) {
      log.error('This is a Email system error: ' + err.stack);
      throw err;
    }
    return mailer;
  },

  /**
   *  API call for GET, PUT, POST and DELETE functionality
   * @param url
   * @param method
   * @param body
   * @param fileName
   * @param statusCode
   * @type {{ GET: receive all info, POST: create, PUT: edit / update, DELETE: remove info }},
   */
  apiCall: function(url, method, body, fileName, statusCode) {
    let options = {
      url: url,
      method: method,
      body: body,
      json: true,
      time: true,
      resolveWithFullResponse: true
    };

    return gotApi(options).then(async function(res) {
      if (statusCode != null) {
        assert.equal(res.statusCode, statusCode);
        log.info('API Response time : ' + res.timings.response);
      }

      if (method === 'GET') {
        return res;
      }

      if (
        (method === 'DELETE' && fileName != null) ||
        (method === 'PUT' && fileName != null)
      ) {
        return fs.readFileSync(fileName, 'utf8', function(err) {
          if (err) {
            log.error(err.message);
          }
        });
      }

      if (method === 'POST' && fileName != null) {
        let data = res.body.adminDoc;
        let doc_Id = data.replace(/.*documents\/([^/]+)\/properties.*/, '$1');
        await helpers.writeTextFile(fileName, doc_Id, function(err) {
          if (err) {
            log.error(err.message);
          }
        });
        log.info('====== DocId API ===== ' + doc_Id);

        await doc_Id;
      }
      return res;
    });
  },
};
