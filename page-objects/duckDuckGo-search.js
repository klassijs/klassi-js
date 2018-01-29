module.exports = {

  /** test searching for inputted data
   */
  url: 'https://duckduckgo.com/',

  /** enters a search term into ebay's search box and presses enter
   * @param {string} searchWord
   * @returns {Promise} a promise to enter the search values
   */
  performSearch: function (searchWord) {
      let elements = {
          searchInput: ('#search_form_input_homepage'),
          searchResultLink: ('div.g > h3 > a')
          };

      let selector = elements.searchInput;

    return driver.setValue(selector, searchWord).then(function(){
      "use strict";
      return driver.getTitle(selector).then(function (title) {
        log.info('this is checking whats being returned:- ' + title);
      }).then(function () {

        return driver.click('#search_button_homepage').then(function () {
          log.info('Search function completed');
        });
      })
    });
  }

};