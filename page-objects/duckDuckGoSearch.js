let image;
let elem;

module.exports = {
  /**
   * enters a search term into ebay's search box and presses enter
   * @param {string} searchWord
   * @returns {Promise} a promise to enter the search values
   */
  performSearch: async (searchWord) => {
    image = searchWord;
    elem = await browser.$(sharedObjects.searchData.elem.searchInput);
    await elem.addValue(searchWord);
    await helpers.takeImage(`${image}_1-0.png`);
    /** Accessibility verification */
    await accessibilityLib.getAccessibilityReport(`SearchPage-${searchWord}`);
    await helpers.takeImage(`${image}_1-1.png`, sharedObjects.searchData.elem.leftBadge);
    const title = await browser.getTitle();
    // console.log(`this is checking whats being returned:- ${title}`);
    elem = await browser.$(sharedObjects.searchData.elem.searchBtn);
    await elem.click();
    await browser.pause(DELAY_1s);
    // console.log('Search function completed');

    /** Accessibility verification */
    await accessibilityLib.getAccessibilityReport(`SearchPage-${searchWord}`);
    /** Accessibility Total error count/violations */
    // eslint-disable-next-line no-undef
    cucumberThis.attach(`Accessibility Error Count : ${accessibilityLib.getAccessibilityTotalError()}`);
    await helpers.compareImage(`${image}_1-0.png`);
    await helpers.compareImage(`${image}_1-1.png`);
    return image;
  },
  searchResult: async () => {
    /** return the promise of an element to the following then */
    elem = await browser.$(sharedObjects.searchData.elem.resultLink);
    await helpers.takeImage(`${image}-results_1-2.png`, sharedObjects.searchData.elem.leftBadge);
    await browser.pause(DELAY_1s);
    /** verify this element has children */
    expect(elem.length).to.not.equal(0);
    await helpers.compareImage(`${image}-results_1-2.png`);
  },
};
