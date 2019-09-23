'use strict';

let duckDuckGoSearch = require('projects/example-test-suite/page-objects/duckDuckGoSearch');
let searchData = require('projects/example-test-suite/shared-objects/searchData');

let shared = { searchData };
let page = { duckDuckGoSearch };

Given(/^The user arrives on the duckduckgo search page$/, async () => {
  await helpers.loadPage(shared.searchData.url, 10);
});

When(/^they input (.*)$/, async (searchWord) => {
  /** use a method on the page object which also returns a promise */
  await page.duckDuckGoSearch.performSearch(searchWord);
});

Then(/^they should see some results$/, async () => {
  /** return the promise of an element to the following then */
  await page.duckDuckGoSearch.searchResult();
});
