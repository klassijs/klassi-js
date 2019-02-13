/**
 KlassiTech Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2019 - Larry Goddard <larryg@klassitech.co.uk>
 
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
'use strict';
const fs = require('fs');
let log = global.log;

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
  loadPage: function (url, seconds) {
    /**
     * Wait function - measured in seconds for pauses during tests to give time for processes such as
     * a page loading or the user to see what the test is doing
     * @param seconds
     * @type {number}
     */
    let timeout = (seconds) ? (seconds * 1000) : DEFAULT_TIMEOUT;

    /**
     * load the url and wait for it to complete
     */
    return driver.url(url, function () {

      /**
       * now wait for the body element to be present
       */
      return driver.waitUntil(driver.element('body'), timeout);
    });
  },

  /**
     * Images of each page for css responsive testing
     * @returns {*|{screenshotRoot, failedComparisonsRoot, misMatchTolerance, screenWidth}}
     */
  cssImages: function (pageName) {
    return driver.webdrivercss(pageName, {
      name: '',
      elem: ''
    });
  },
  
  /**
   * Visual comparison function
   * @param fileName
   * @returns {Promise<void>}
   */
  compareImage: async function(fileName){
    const verify = require('./imageCompare');
    await verify.assertion(fileName);
    await verify.value();
    await verify.pass();
  },
    
  /**
     * writeTextFile write data to file on hard drive
     * @param  string  filepath   Path to file on hard drive
     * @param  string   output     Data to be written
     */
  writeTextFile: function (filepath, output) {
    try {
      fs.writeFile(filepath, output, (err) => {
        if (err) {
          log.error(err.message);
        }
      });
      log.info('File has been written successfully');
    } catch (err) {
      if (err){
        log.info('Error in writing file ' + err.message);
        throw err;
      }
    }
  },

  /**
     * clicks an element (or multiple if present) that is not visible,
     * useful in situations where a menu needs a hover before a child link appears
     * @param {string} css selector used to locate the elements
     * @param {string} text to match inner content (if present)
     * @example
     *    helpers.clickHiddenElement('nav[role="navigation"] ul li a','School Shoes');
     */
  clickHiddenElement: function (cssSelector, textToMatch) {
    /**
         * method to execute within the DOM to find elements containing text
         */
    function clickElementInDom(query, content) {
      /**
         * get the list of elements to inspect
         */
      let elements = document.querySelectorAll(query);
      /**
         * workout which property to use to get inner text
         */
      let txtProp = ('textContent' in document) ? 'textContent' : 'innerText';

      for (let i = 0, l = elements.length; i < l; i++) {
        /**
                 * If we have content, only click items matching the content
                 */
        if (content) {
          if (elements[i][txtProp] === content) {
            elements[i].click();
          }
        }
        /**
           * otherwise click all
           */
        else {
          elements[i].click();
        }
      }
    }
    /**
       * grab the matching elements
       */
    return driver.elements(cssSelector, clickElementInDom, textToMatch.toLowerCase().trim);
  },
  
  /**
   * Generates a random 13 digit number
   * @param length
   * @returns {number}
   */
  randomNumberGenerator: function(length=13) {
    let baseNumber = Math.pow(10, length -1 );
    let number = Math.floor(Math.random()*baseNumber);
    /**
     * Check if number have 0 as first digit
     */
    if (number < baseNumber) {
      number += baseNumber;
    }
    log.info('this is the number ' + number);
    return number;
  },
  
  /**
     * Generate random integer from a given range
     */
  generateRandomInteger: function (range) {
    return Math.floor(Math.random() * Math.floor(range));
  },

  /**
     * This method is useful for dropdown boxes as some of them have default "Please select" option on index 0
     *
     * @param range
     * @returns randomNumber excluding index 0
     */
  getRandomIntegerExcludeFirst: function (range) {
    let randomNumber = helpers.generateRandomInteger(range);

    if (randomNumber <= 1) {
      randomNumber += 2;
    }
    return randomNumber;
  },

  /**
     * Converting String date into the Date format
     *
     * @param _date : String date that user passes in
     * @param _format : "dd/MM/yyyy", "mm/dd/yyyy", "mm-dd-yyyy"
     * @param _delimiter
     * @returns {Date}
     *
     * Example use
     *
     * stringToDate("17/9/2014","dd/MM/yyyy","/");
     * stringToDate("9/17/2014","mm/dd/yyyy","/")
     * stringToDate("9-17-2014","mm-dd-yyyy","-")
     */
  stringToDate: function (_date, _format, _delimiter) {
    let formatLowerCase = _format.toLowerCase();
    let formatItems = formatLowerCase.split(_delimiter);
    let dateItems = _date.split(_delimiter);
    let monthIndex = formatItems.indexOf('mm');
    let dayIndex = formatItems.indexOf('dd');
    let yearIndex = formatItems.indexOf('yyyy');
    let month = parseInt(dateItems[monthIndex]);
    month -= 1;
    return new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
  },
    
  /**
     * Get the current date dd-mm-yyyy
     * @returns {string|*}
     */
  currentDate: function () {
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
  
    return yyyy + '-' + mm + '-' + dd ;
  },

  /**
     * Get current date and time dd/mm/yyy 00:00:00
     */
  getCurrentDateTime: function () {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds= today.getSeconds();
      
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
      
    if (hours < 10){
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return dd + '-' + mm + '-' + yyyy + '-' + hours + ':' + minutes + ':' + seconds;
  },
  
  getEndDateTime: function () {
    let eDate = this.getCurrentDateTime();
    return eDate;
  },
  
  getStartDateTime: function () {
    let sDate = this.getCurrentDateTime();
    return sDate;
  },
  
  getCurrentDateFormatted: function () {
    return helpers.getCurrentDateTime().replace(/\//g, '').replace(/:/g, '').replace(' ', '');
  },

  /**
     * Get the text of an Element
     * @param selector
     * @returns text
     */
  getElementText: function (selector) {
    return driver.waitForExist(selector, 10000).pause(3000).then(function () {
      return driver.getText(selector).then(function (text) {
        return text;
      });
    });
  },

  /**
     * Get the href link from an element
     * @param selector
     * @returns {String|String[]|*|string}
     */
  getLink: function (selector) {
    return driver.getAttribute(selector, 'href');
  },
  
  waitAndClick: async function (selector) {
    try {
      await driver.waitForVisible(selector, MID_DELAY_MILLISECOND);
      await driver.waitForEnabled(selector, SHORT_DELAY_MILLISECOND);
      await driver.click(selector);
      await driver.pause(DELAY_500_MILLISECOND);
    }
    catch (err) {
      log.error(err.message);
      throw err;
    }
  },
  
  waitAndSetValue: async function (selector, value) {
    try{
      await driver.waitForEnabled(selector, MID_DELAY_MILLISECOND);
      await driver.click(selector);
      await driver.pause(DELAY_500_MILLISECOND);
      await driver.keys(value);
    }
    catch (err) {
      log.error(err.message);
      throw err;
    }
  },
  
  /**
 * ========== EMAIL FUNCTIONALITY ==========
 */
  /**
     *   Sends an Email to the concerned users with the log and the test report
     */
  klassiEmail: function (err) {
    let mailer = require('../runtime/mailer').klassiSendMail();
    if(err) {
      log.error('This is a Email system error: ' + err.stack);
      throw err;
    }
    return mailer;
  },
  
  /**
   * ========== For all ASSERTIONS functions ==========
   */
  /**
   *  Reformats date string into string
   * @param dateString
   * @returns {string}
   */
  reformatDateString: function (dateString) {
    let months = {
      '01': 'January',
      '02': 'February',
      '03': 'March',
      '04': 'April',
      '05': 'May',
      '06': 'June',
      '07': 'July',
      '08': 'August',
      '09': 'September',
      '10': 'October',
      '11': 'November',
      '12': 'December'
    };
    let b = dateString.split('/');
    return b[0] + ' ' + months[b[1]] + ' ' + b[2];
  },

  /**
     *  Sorts results by date
     * @param array
     * @returns {*}
     */
  sortByDate: function (array) {
    array.sort(function (a, b) {
      let sentDateA = a.split('/');
      let c = new Date(sentDateA[2], sentDateA[1], sentDateA[0]);
      let sentDateB = b.split('/');
      let d = new Date(sentDateB[2], sentDateB[1], sentDateB[0]);
      return d - c;
    });
    return array;
  },

  /**
     * function to get element from frame or frameset
     * @param frame_name
     * @param selector
     * @returns {Promise.<TResult>}
     */
  getElementFromFrame: function (frame_name, selector) {
    let frame = driver.element(frame_name);
    driver.frame(frame.value);
    driver.getHTML(selector);
    return driver;
  },

  /**
     * This will assert 'equal' text being returned
     * @param selector
     * @param expectedText
     */
  assertText: async function (selector, expected) {
    await driver.waitForEnabled(selector, DELAY_10_SECOND);
    let actual = await driver.getText(selector);
    actual = actual.trim();
    assert.equal(actual, expected);
    return this;
  },
  
  /**
   *
   * @param selector
   * @param expectedText
   */
  expectToIncludeText: async function (selector, expectedText) {
    let actual = await driver.getText(selector);
    expect(actual).to.include(expectedText);
    return this;
  },
  
  /**
   *
   * @param expected
   */
  assertUrl: async function (expected) {
    let actual = await driver.getUrl();
    assert.equal(actual, expected);
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
  apiCall: function (url, method, body, fileName, statusCode) {
    
    let options = {
      url: url,
      method: method,
      body: body,
      // proxy:'http://proxyServer.com:8080', // if needed
      json: true,
      time: true,
      resolveWithFullResponse: true,
    };
  
    return request(options)
      .then(async function (res) {
        if (statusCode != null) {
          assert.equal(res.statusCode, statusCode);
          log.info('API Response time : ' + res.timings.response);
        }
      
        if (method === 'GET') {
          return res;
        }
      
        if (method === 'DELETE' && fileName != null || method === 'PUT' && fileName != null) {
          return fs.readFileSync(fileName, 'utf8', function (err) {
            if (err){
              log.error(err.message);
            }
          });
        }
      
        if (method === 'POST' && fileName != null) {
          let data = res.body.adminDoc;
          let doc_Id = data.replace(/.*documents\/([^\/]+)\/properties.*/, '$1');
          await helpers.writeTextFile(fileName, doc_Id, function (err) {
            if (err){
              log.error(err.message);
            }
          });
          log.info('====== DocId API ===== ' + doc_Id);
        
          await doc_Id;
        }
        return res;
      });
  },
  
  filterItem: async function (itemToFilter) {
    try{
      await driver.waitForExist(shared.adminData.filter.filterInput, LONG_DELAY_MILLISECOND);
      await driver.waitForEnabled(shared.adminData.filter.filterInput, LONG_DELAY_MILLISECOND);
      await driver.pause(DELAY_500_MILLISECOND);
      await driver.click(shared.adminData.filter.filterInput);
      await driver.keys(itemToFilter);
    }
    catch (err) {
      log.error(err.message);
      throw err;
    }
  },
  
  filterItemAndClick: async function (itemToFilter) {
    try{
      await helpers.filterItem(itemToFilter);
      await driver.pause(MID_DELAY_MILLISECOND);
      await driver.click(shared.adminData.filter.filteredItem);
      await driver.pause(MID_DELAY_MILLISECOND);
    }
    catch (err) {
      if (err) {
        log.error(err.message);
        throw err;
      }
    }
  },
  
};
