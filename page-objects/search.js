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
    elem = await browser.$(sharedObjects.searchData.elem.searchInput);
    await helpers.takeImage(`${image}_1-0.png`, null);
    await helpers.compareImage(`${image}_1-0.png`);
    await helpers.accessibilityReport(`SearchPage1-${searchWord}`);
    await elem.addValue(searchWord);
    await helpers.accessibilityReport(`SearchPage4-${searchWord}`);
    /** Accessibility verification */
    await helpers.takeImage(`${image}_1-1.png`, sharedObjects.searchData.elem.leftBadge);
    const title = await browser.getTitle();
    console.log('checking what title being returned:- ', title);
    await helpers.compareImage(`${image}_1-1.png`);
    await browser.keys('\uE007');
    /** Accessibility verification */
    await helpers.accessibilityReport(`SearchPage2-${searchWord}`);
    return image;
  },

  searchResult: async (searchWord) => {
    image = searchWord;
    /** return the promise of an element to the following then */
    elem = await browser.$(sharedObjects.searchData.elem.resultLink);
    await helpers.takeImage(`${image}-results_1-2.png`, sharedObjects.searchData.elem.leftBadge);
    await browser.pause(DELAY_1s);
    await helpers.accessibilityReport(`SearchPage3-${searchWord}`, true);
    /** verify this element has children */
    expect(elem.length).to.not.equal(0);
    await helpers.compareImage(`${image}-results_1-2.png`);
  },
};
