/**
 * OUP Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';
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
  pageView: async elemId => {
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
  clickHiddenElement: function(cssSelector, textToMatch) {
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
      let txtProp = 'textContent' in document ? 'textContent' : 'innerText';
      
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
    return browser.$$(
      cssSelector,
      clickElementInDom,
      textToMatch.toLowerCase().trim
    );
  },
  
  /**
   * Generates a random 13 digit number
   * @param length
   * @returns {number}
   */
  randomNumberGenerator: function(length = 13) {
    let baseNumber = Math.pow(10, length - 1);
    let number = Math.floor(Math.random() * baseNumber);
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
  generateRandomInteger: function(range) {
    return Math.floor(Math.random() * Math.floor(range));
  },
  
  /**
   * This method is useful for dropdown boxes as some of them have default 'Please select' option on index 0
   *
   * @param range
   * @returns randomNumber excluding index 0
   */
  getRandomIntegerExcludeFirst: function(range) {
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
  stringToDate: function(_date, _format, _delimiter) {
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
  
  getCurrentDateFormatted: function() {
    return helpers
      .getCurrentDateTime()
      .replace(/\//g, '')
      .replace(/:/g, '')
      .replace(' ', '');
  },
  
  /**
   * Get the text of an Element
   * @param selector
   * @returns text
   */
  getElementText: async function(selector) {
    let elem = await browser.$(selector);
    await elem.waitForExist(DELAY_10s);
    let text = await elem.getText();
    await text;
  },
  
  /**
   * Get the href link from an element
   * @param selector
   * @returns {String|String[]|*|string}
   */
  getLink: async function(selector) {
    let elem = await browser.$(selector);
    await elem.getAttribute('href');
  },
  
  waitAndClick: async function(selector) {
    try {
      let elem = await browser.$(selector);
      await elem.waitForDisplayed(DELAY_3s);
      await elem.waitForEnabled(DELAY_1s);
      await elem.click();
      await browser.pause(DELAY_500ms);
    } catch (err) {
      log.error(err.message);
      throw err;
    }
  },
  
  waitAndSetValue: async function(selector, value) {
    try {
      let elem = await browser.$(selector);
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
  reformatDateString: function(dateString) {
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
  sortByDate: function(array) {
    array.sort(function(a, b) {
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
  getElementFromFrame: async function(frame_name, selector) {
    let frame = await browser.$(frame_name);
    await browser.switchToFrame(frame.value);
    await browser.$(selector).getHTML();
    return browser;
  },
  
  /**
   * This will assert 'equal' text being returned
   * @param selector
   * @param expectedText
   */
  assertText: async function(selector, expected) {
    let elem = await browser.$(selector);
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
  expectToIncludeText: async function(selector, expectedText) {
    let actual = await browser.$(selector);
    await actual.getText();
    expect(actual).to.include(expectedText);
    return this;
  },
  
  /**
   *
   * @param expected
   */
  assertUrl: async function(expected) {
    let actual = await browser.getUrl();
    assert.equal(actual, expected);
  },
  
  filterItem: async function(itemToFilter) {
    try {
      let elem = await browser.$(shared.adminData.filter.filterInput);
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
  
  filterItemAndClick: async function(itemToFilter) {
    try {
      await helpers.filterItem(itemToFilter);
      await browser.pause(DELAY_3s);
      let elem = await browser.$(shared.adminData.filter.filteredItem);
      await elem.click();
      await browser.pause(DELAY_3s);
    } catch (err) {
      log.error(err.message);
      throw err;
    }
  }
};
