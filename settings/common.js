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
module.exports = {
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
    const baseNumber = Math.pow(10, length - 1);
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

  async filterItem(selector, itemToFilter) {
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

  async filterItemAndClick(selector) {
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
};
