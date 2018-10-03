'use strict';

let duckDuckGoSearch = require('../page-objects/duckDuckGoSearch');
let searchData = require('../shared-objects/searchData');

let shared = ({searchData});
let page = ({duckDuckGoSearch});


Given(/^The user arrives on the duckduckgo search page$/, function() {
  return helpers.loadPage(shared.searchData.url, 10);
});

When(/^they input (.*)$/, function(searchWord) {
  /** use a method on the page object which also returns a promise */
  return page.duckDuckGoSearch.performSearch(searchWord);
});

Then(/^they should see some results$/, function() {
  /** return the promise of an element to the following then */
  return page.duckDuckGoSearch.searchResult();
});
