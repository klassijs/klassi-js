"use strict";
const searchData = require("../shared-objects/searchData"),
  verify = require("../../../runtime/imageCompare"),
  shared = { searchData };

let expect = global.expect;
let log = global.log;
let image;

module.exports = {
  /**
   * enters a search term into ebay's search box and presses enter
   * @param {string} searchWord
   * @returns {Promise} a promise to enter the search values
   */
  performSearch: async function(searchWord) {
    image = searchWord;
    // await helpers.getUserAgent();
    await verify.saveScreenshot(`${image}_1-0.png`);
    let elem = await browser.$(shared.searchData.elem.searchInput);
    await elem.setValue(searchWord);
    await verify.saveScreenshot(
      `${image}_1-1.png`,
      shared.searchData.elem.leftBadge
    );

    let title = await browser.getTitle();
    log.info("the title being returned:- " + title);
    let searchBtn = await browser.$(shared.searchData.elem.searchBtn);
    await searchBtn.click();
    await browser.pause(DELAY_1s);
    // await helpers.compareImage(`${image}_1-0.png`);
    // await helpers.compareImage(`${image}_1-1.png`);
    return image;
  },

  searchResult: async function() {
    // image = searchWord;
    /** return the promise of an element to the following then */
    let elem = await browser.$(shared.searchData.elem.resultLink);
    await verify.saveScreenshot(
      `${image}_1-2.png`,
      shared.searchData.elem.leftBadge
    );
    await browser.pause(DELAY_1s);
    /** verify this element has children */
    log.info(elem); // prints to a log
    expect(elem.length).to.not.equal(0);
    // await helpers.compareImage(`${image}_1-2.png`);
  }
};
