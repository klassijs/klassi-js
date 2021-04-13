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
