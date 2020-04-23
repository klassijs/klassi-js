'use strict';

const shared = require('../shared-objects/searchData');
const verify = require('../../../runtime/imageCompare');
const helpers = require('../../../runtime/confSettings');

let log = global.log;
let image, elem;

module.exports = {
  /**
   * enters a search term into ebay's search box and presses enter
   * @param {string} searchWord
   * @returns {Promise} a promise to enter the search values
   */
  performSearch: async function(searchWord) {
    image = searchWord;
    await verify.saveScreenshot(`${image}_1-0.png`, shared.elem.leftBadge);
    elem = await browser.$(shared.elem.searchInput);
    await elem.setValue(searchWord);
    /** Accessibility verification */
    await accessibilityLib.getAccessibilityReport('SearchPage-'+searchWord);
    await verify.saveScreenshot(
      `${image}_1-1.png`,
      shared.elem.leftBadge
    );

    let title = await browser.getTitle();
    log.info('the title being returned:- ' + title);
    elem = await browser.$(shared.elem.searchBtn);
    await elem.click();
    await browser.pause(DELAY_1s);
    /** Accessibility verification */
    await accessibilityLib.getAccessibilityReport('SearchPage-'+searchWord);
    /** Accessibility Total error count/violations */
    cucumberThis.attach('Accessibility Error Count : '+ accessibilityLib.getAccessibilityTotalError());
    await helpers.compareImage(`${image}_1-0.png`);
    await helpers.compareImage(`${image}_1-1.png`);
    return image;
  },

  searchResult: async function() {
    /** return the promise of an element to the following then */
    elem = await browser.$(shared.elem.resultLink);
    await verify.saveScreenshot(
      `${image}_1-2.png`,
      shared.elem.leftBadge
    );
    await browser.pause(DELAY_1s);
    /** verify this element has children */
    log.info(elem); // prints to a log
    expect(elem.length).to.not.equal(0);
    await helpers.compareImage(`${image}_1-2.png`);
  }
};
