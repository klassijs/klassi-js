const shared = require('../shared-objects/searchData');
const verify = require('../../../runtime/imageCompare');
const confSettings = require('../../../runtime/confSettings');

const { log } = global;
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
    await verify.saveScreenshot(`${image}_1-0.png`);
    elem = await browser.$(shared.elem.searchInput);
    await elem.setValue(searchWord);
    /** Accessibility verification */
    await accessibilityLib.getAccessibilityReport(`SearchPage-${searchWord}`);
    await verify.saveScreenshot(`${image}_1-1.png`, shared.elem.leftBadge);
    const title = await browser.getTitle();
    log.info(`this is checking whats being returned:- ${title}`);
    elem = await browser.$(shared.elem.searchBtn);
    await elem.click();
    await browser.pause(DELAY_3s);
    log.info('Search function completed');
    /** Accessibility verification */
    await accessibilityLib.getAccessibilityReport(`SearchPage-${searchWord}`);
    /** Accessibility Total error count/violations */
    // eslint-disable-next-line no-undef
    cucumberThis.attach(`Accessibility Error Count : ${accessibilityLib.getAccessibilityTotalError()}`);
    await confSettings.compareImage(`${image}_1-0.png`);
    await confSettings.compareImage(`${image}_1-1.png`);
    log.info('images have been compared');
    return image;
  },
  searchResult: async () => {
    /** return the promise of an element to the following then */
    const elem = await browser.$(shared.elem.resultLink);
    await verify.saveScreenshot(`${image}_1-2.png`, shared.elem.leftBadge);
    await browser.pause(DELAY_1s);
    /** verify this element has children */
    log.info(elem); // prints to a log
    expect(elem.length).to.not.equal(0);
    await confSettings.compareImage(`${image}_1-2.png`);
  },
};
