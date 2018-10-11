'use strict';

const searchData = require('../shared-objects/searchData'),
  verify = require('../runtime/imageCompare'),
  shared = ({searchData});

let log = global.log;
let image = 'searchPage';

module.exports = {
  
  /**
   * enters a search term into ebay's search box and presses enter
   * @param {string} searchWord
   * @returns {Promise} a promise to enter the search values
   */
  performSearch: async function (searchWord) {
    
    await verify.saveScreenshot(`${image}1-0.png`);
    
    let selector = shared.searchData.elem.searchInput;
    await driver.click(selector).keys(searchWord);
    await verify.saveScreenshot(`${image}1-1.png`);
    
    let title = await driver.getTitle(selector);
    log.info('this is checking whats being returned:- ' + title);
  
    await driver.click(shared.searchData.elem.searchBtn);
    await driver.pause(DELAY_3_SECOND);
    log.info('Search function completed');
    await helpers.compareImage(`${image}1-0.png`);
    await helpers.compareImage(`${image}1-1.png`);
    
    log.info('images have been compared');
  },
  
  searchResult: async function() {
  /** return the promise of an element to the following then */
    let elements = await driver.element(shared.searchData.elem.resultLink);
    /** verify this element has children */
    log.info(elements); // prints to a log

    expect(elements.length).to.not.equal(0);
    await helpers.cssImages('search');
  }
};