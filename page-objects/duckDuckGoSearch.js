'use strict';

const searchData = require('../shared-objects/searchData'),
  verify = require('../runtime/imageCompare'),
  shared = ({searchData});

let expect = global.expect;
let log = global.log;
let image;

module.exports = {
  
  /**
   * enters a search term into ebay's search box and presses enter
   * @param {string} searchWord
   * @returns {Promise} a promise to enter the search values
   */
  performSearch: async function (searchWord) {
    image = searchWord;
    await verify.saveScreenshot(`${image}_1-0.png`);
    
    let selector = await driver.$(shared.searchData.elem.searchInput);
    await selector.setValue(searchWord);
    await verify.saveScreenshot(`${image}_1-1.png`);
    
    let title = await driver.getTitle();
    log.info('the title being returned:- ' + title);
  
    let searchBtn = await driver.$(shared.searchData.elem.searchBtn);
    await searchBtn.click();
    await driver.pause(DELAY_1_SECOND);
    await verify.saveScreenshot(`${image}_1-2.png`);
    await driver.pause(DELAY_1_SECOND);
    await helpers.compareImage(`${image}_1-0.png`);
    await helpers.compareImage(`${image}_1-1.png`);
    await helpers.compareImage(`${image}_1-2.png`);
  },
  
  searchResult: async function(searchWord) {
    image = searchWord;
    /** return the promise of an element to the following then */
    let elem = driver.$(shared.searchData.elem.resultLink);
    /** verify this element has children */
    console.log('this is it ' + elem);
    log.info(elem); // prints to a log

    expect(elem.length).to.not.equal(0);
    // await helpers.cssImages('search');
  }
};