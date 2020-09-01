/**
 Klassi Automated Testing Tool
 Created by Larry Goddard
 */
/**
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
let elem;

module.exports = {
  /**
   * ========== All operational functions ==========
   */
  /**
   * Drag and Drop and item around a site
   */
  // getCoordsForElement: async function(elementId) => {
  //   const rect = await browser.getElementRect(elementId);
  //   const X = parseInt(rect.x + (rect.width / 2), 10);
  //   const Y = parseInt(rect.y + (rect.height / 2), 10);
  //   return [X, Y];
  // const [sourceX, sourceY] = getCoordsForElement(element.elementId);
  // };
  moveDragger: async (elem, x, y) => {
    await elem.waitForExist(DELAY_2s);
    await elem.moveTo();
    // TODO: have to find a workaround for Firefox as 'buttonDown' dont work, so would assume that 'buttonUp' dont work either.
    await elem.buttonDown(); // chrome
    await elem.moveTo(x, y);
    await browser.pause(DELAY_300ms);
    await elem.buttonUp();
  },

  /**
   * drag the page into view
   */
  pageView: async (elemId) => {
    await elem.scrollIntoView(elemId);
    await browser.pause(DELAY_200ms);
    return this;
  },

  /**
   * clicks an element (or multiple if present) that is not visible,
   * useful in situations where a menu needs a hover before a child link appears
   * @param {string} css selector used to locate the elements
   * @param {string} text to match inner content (if present)
   * @example
   *    helpers.clickHiddenElement('nav[role='navigation'] ul li a','School Shoes');
   */
  clickHiddenElement(cssSelector, textToMatch) {
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
    return browser.$$(cssSelector, clickElementInDom, textToMatch.toLowerCase().trim);
  },

  /**
   * Generates a random 13 digit number
   * @param length
   * @returns {number}
   */
  randomNumberGenerator(length = 13) {
    const baseNumber = Math.pow(10, length - 1);
    let number = Math.floor(Math.random() * baseNumber);
    /**
     * Check if number have 0 as first digit
     */
    if (number < baseNumber) {
      number += baseNumber;
    }
    log.info(`this is the number ${number}`);
    return number;
  },

  /**
   * Generate random integer from a given range
   */
  generateRandomInteger(range) {
    return Math.floor(Math.random() * Math.floor(range));
  },

  /**
   * This method is useful for dropdown boxes as some of them have default 'Please select' option on index 0
   *
   * @param range
   * @returns randomNumber excluding index 0
   */
  getRandomIntegerExcludeFirst(range) {
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
   * @param _format : 'dd/MM/yyyy', 'mm/dd/yyyy', 'mm-dd-yyyy'
   * @param _delimiter
   * @returns {Date}
   *
   * Example use
   *
   * stringToDate('17/9/2014','dd/MM/yyyy','/');
   * stringToDate('9/17/2014','mm/dd/yyyy','/')
   * stringToDate('9-17-2014','mm-dd-yyyy','-')
   */
  stringToDate(_date, _format, _delimiter) {
    const formatLowerCase = _format.toLowerCase();
    const formatItems = formatLowerCase.split(_delimiter);
    const dateItems = _date.split(_delimiter);
    const monthIndex = formatItems.indexOf('mm');
    const dayIndex = formatItems.indexOf('dd');
    const yearIndex = formatItems.indexOf('yyyy');
    let month = parseInt(dateItems[monthIndex]);
    month -= 1;
    return new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
  },

  getCurrentDateFormatted() {
    return helpers.getCurrentDateTime().replace(/\//g, '').replace(/:/g, '').replace(' ', '');
  },
  /**
   * Get the text of an Element
   * @param selector
   * @returns text
   */
  async getElementText(selector) {
    const elem = await browser.$(selector);
    await elem.waitForExist(DELAY_10s);
    const text = await elem.getText();
    await text;
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
      log.error(err.message);
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
      log.error(err.message);
      throw err;
    }
  },

  /**
   * ========== For all ASSERTIONS functions ==========
   */
  /**
   *  Reformats date string into string
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
   *  Sorts results by date
   * @param array
   * @returns {*}
   */
  sortByDate(array) {
    array.sort(function (a, b) {
      const sentDateA = a.split('/');
      const c = new Date(sentDateA[2], sentDateA[1], sentDateA[0]);
      const sentDateB = b.split('/');
      const d = new Date(sentDateB[2], sentDateB[1], sentDateB[0]);
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
  async getElementFromFrame(frame_name, selector) {
    const frame = await browser.$(frame_name);
    await browser.switchToFrame(frame.value);
    await browser.$(selector).getHTML();
    return browser;
  },

  /**
   * This will assert 'equal' text being returned
   * @param selector
   * @param expectedText
   */
  async assertText(selector, expected) {
    const elem = await browser.$(selector);
    await elem.waitForEnabled(DELAY_5s);
    let actual = await browser.$(selector);
    await actual.getText();
    actual = actual.trim();
    assert.equal(actual, expected);
    return this;
  },

  /**
   *
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
   *
   * @param expected
   */
  async assertUrl(expected) {
    const actual = await browser.getUrl();
    assert.equal(actual, expected);
  },

  async filterItem(itemToFilter) {
    try {
      const elem = await browser.$(shared.adminData.filter.filterInput);
      await elem.waitForExist(DELAY_5s);
      await elem.waitForEnabled(DELAY_5s);
      await browser.pause(DELAY_500ms);
      await elem.click();
      await browser.setValue(itemToFilter);
    } catch (err) {
      log.error(err.message);
      throw err;
    }
  },

  async filterItemAndClick(itemToFilter) {
    try {
      await helpers.filterItem(itemToFilter);
      await browser.pause(DELAY_3s);
      const elem = await browser.$(shared.adminData.filter.filteredItem);
      await elem.click();
      await browser.pause(DELAY_3s);
    } catch (err) {
      log.error(err.message);
      throw err;
    }
  },
};
