let image;
let elem;

module.exports = {
  /**
   * enters a search term into duckduckgo's search box and presses enter
   * @param {string} searchWord
   * @returns {Promise} a promise to enter the search values
   */
  performWebSearch: async (searchWord) => {
    image = searchWord;
    elem = await browser.$(sharedObjects.searchData.elem.messageBox); // this is the xPath check point
    elem = await browser.$(sharedObjects.searchData.elem.searchInput);

    await elem.addValue(searchWord);
    const title = await browser.getTitle();
    console.log('checking what title being returned:- ================> ', title);
    await browser.keys('\uE007');
  },

  searchResult: async (searchWord) => {
    image = searchWord;
    /** return the promise of an element to the following then */
    elem = await browser.$(sharedObjects.searchData.elem.resultLink);
    await browser.pause(DELAY_1s);
    await helpers.expectAdv('toNotEqual', elem.length, 0);
  },
};
