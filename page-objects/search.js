const {compareImage, takeImage} = require('klassijs-visual-validation');
const { softAssert } = require('klassijs-soft-assert');

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
    await takeImage(`${image}_1-0.png`);
    await compareImage(`${image}_1-0.png`);
    await elem.addValue(searchWord);
    elem = sharedObjects.searchData.elem.leftBadge;

    await takeImage(`${image}_1-1.png`, null, sharedObjects.searchData.elem.leftBadge);
    await compareImage(`${image}_1-1.png`);
    const title = await browser.getTitle();
    console.log(`checking what title being returned:- ${title}`);
    await softAssert(title, 'tohavetext', 'privacies');
    await browser.keys('\uE007');
  },
  searchResult: async (searchWord) => {
    image = searchWord;
    /** return the promise of an element to the following then */
    elem = await browser.$(sharedObjects.searchData.elem.resultLink);
    await softAssert(elem.elementId,'toNotEqual', null );
    await browser.pause(DELAY_1s);
  },
};
