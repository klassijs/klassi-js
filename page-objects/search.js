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

    // await helpers.accessibilityReport(`SearchPage1-${searchWord}`);
    // /** This takes an image of an element on a page */
    // await helpers.takeImage(`${image}_inputBox.png`, sharedObjects.searchData.elem.searchInput);
    // /** This takes an image of the whole page */
    // await helpers.takeImage(`${image}_1-0.png`);
    //
    // await helpers.compareImage(`${image}_inputBox.png`);
    // await helpers.compareImage(`${image}_1-0.png`);
    /** This reads the text on an image */
    // await helpers.readTextFromImage(`${image}_1-0.png`);
    await elem.addValue(searchWord);
    /** Accessibility verification */
    // await helpers.accessibilityReport(`SearchPage2-${searchWord}`);
    // await helpers.takeImage(`${image}_1-1.png`, null, sharedObjects.searchData.elem.leftBadge);
    const title = await browser.getTitle();
    console.log('checking what title being returned:- ================> ', title);
    // await helpers.compareImage(`${image}_1-1.png`);
    // await helpers.readTextFromImage(`${image}_1-1.png`);
    await browser.keys('\uE007');
  },

  searchResult: async (searchWord) => {
    image = searchWord;
    /** return the promise of an element to the following then */
    // await helpers.accessibilityReport(`SearchPage3-${searchWord}`);
    elem = await browser.$(sharedObjects.searchData.elem.resultLink);
    // await helpers.takeImage(`${image}-results_1-2.png`, null, sharedObjects.searchData.elem.leftBadge);
    await browser.pause(DELAY_1s);
    /** Accessibility verification */
    // await helpers.accessibilityReport(`SearchPage4-${searchWord}`, true);
    /** verify this element has children */
    // await helpers.compareImage(`${image}-results_1-2.png`);
    await helpers.expectAdv('toNotEqual', elem.length, 0);
    // expect(elem.length).to.not.equal(0);
  },
};
