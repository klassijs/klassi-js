let image;
let elem;

module.exports = {
  /**
   * enters a search term into ebay's search box and presses enter
   * @param {string} searchWord
   * @returns {Promise} a promise to enter the search values
   */
  performWebSearch: async (searchWord) => {
    image = searchWord;
    elem = await browser.$(sharedObjects.searchData.elem.searchInput);
    await helpers.takeImage(`${image}_1-0.png`);
    await helpers.compareImage(`${image}_1-0.png`);
    await elem.addValue(searchWord);
    /** Accessibility verification */
    // eslint-disable-next-line no-undef
    await accessibilityLib.getAccessibilityReport(`SearchPage-${searchWord}`);
    await helpers.takeImage(`${image}_1-1.png`, sharedObjects.searchData.elem.leftBadge);
    const title = await browser.getTitle();
    console.log(`checking what title being returned:- ${title}`);
    await helpers.compareImage(`${image}_1-1.png`);
    await browser.keys('Enter');
    // eslint-disable-next-line no-undef
    /** Accessibility verification */
    // eslint-disable-next-line no-undef
    await accessibilityLib.getAccessibilityReport(`SearchPage-${searchWord}`);
    /** Accessibility Total error count/violations */
    // eslint-disable-next-line no-undef
    cucumberThis.attach(`Accessibility Error Count : ${accessibilityLib.getAccessibilityTotalError()}`);
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
