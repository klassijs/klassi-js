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
    await helpers.takeImage(`${image}_1-0.png`);
    elem = await browser.$(sharedObjects.searchData.elem.searchInput);
    await elem.setValue(searchWord);
    if (browserName === 'iexplorer') {
      // do nothing
    } else {
      /** Accessibility verification */
      await accessibilityLib.getAccessibilityReport(`SearchPage-${searchWord}`);
      await helpers.takeImage(`${image}_1-1.png`, sharedObjects.searchData.elem.leftBadge);
    }

    const title = await browser.getTitle();
    console.log(`this is checking whats being returned:- ${title}`);
    elem = await browser.$(sharedObjects.searchData.elem.searchBtn);
    await elem.click();
    await browser.pause(DELAY_2s);
    console.log('Search function completed');
    if (browserName === 'iexplorer') {
      // do nothing
    } else {
      /** Accessibility verification */
      await accessibilityLib.getAccessibilityReport(`SearchPage-${searchWord}`);
      /** Accessibility Total error count/violations */
      // eslint-disable-next-line no-undef
      cucumberThis.attach(`Accessibility Error Count : ${accessibilityLib.getAccessibilityTotalError()}`);
      await helpers.compareImage(`${image}_1-1.png`);
    }
    await helpers.compareImage(`${image}_1-0.png`);
    console.log('images have been compared');
    return image;
  },
  searchResult: async () => {
    /** return the promise of an element to the following then */
    // eslint-disable-next-line no-shadow
    const elem = await browser.$(sharedObjects.searchData.elem.resultLink);
    if (browserName === 'iexplorer') {
      // do nothing
    } else {
      await helpers.takeImage(`${image}_1-2.png`, sharedObjects.searchData.elem.leftBadge);
    }
    await browser.pause(DELAY_1s);
    /** verify this element has children */
    console.log(elem); // prints to a log
    expect(elem.length).to.not.equal(0);
    if (browserName === 'iexplorer') {
      // do nothing
    } else {
      await helpers.compareImage(`${image}_1-2.png`);
    }
  },
};
