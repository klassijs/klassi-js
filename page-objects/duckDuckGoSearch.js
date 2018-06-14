'use strict';
let searchData = require('../shared-objects/searchData');

let shared = ({searchData});

module.exports = {
  
  /** enters a search term into ebay's search box and presses enter
   * @param {string} searchWord
   * @returns {Promise} a promise to enter the search values
   */
performSearch: async function (searchWord) {
  let selector = shared.searchData.elem.searchInput;
  await driver.click(selector).keys(searchWord);
  
  let title = await driver.getTitle(selector);
  log.info('this is checking whats being returned:- ' + title);
  
  await driver.click(shared.searchData.elem.searchBtn);
  log.info('Search function completed');
},
  
  searchResult: async function () {
    /** return the promise of an element to the following then */
    let elements = await driver.element(shared.searchData.elem.resultLink);
        /** verify this element has children */
      log.info(elements); // prints to a log
    
      expect(elements.length).to.not.equal(0);
      await helpers.cssImages('search')
  
    }
};