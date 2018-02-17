module.exports = {
  
  /** enters a search term into ebay's search box and presses enter
   * @param {string} searchWord
   * @returns {Promise} a promise to enter the search values
   */
  performSearch: function (searchWord) {
      let selector = shared.searchData.elem.searchInput;
    return driver.click(selector).keys(searchWord).then(function(){
      return driver.getTitle(selector).then(function (title) {
        log.info('this is checking whats being returned:- ' + title);
        return driver.click(shared.searchData.elem.searchBtn).then(function () {
          log.info('Search function completed');
        })
      })
    })
  },
  
  searchResult: function () {
      /** return the promise of an element to the following then */
      return driver.element(shared.searchData.elem.resultLink).then(function(elements){
          /** verify this element has children */
          console.log(elements);
          expect(elements.length).to.not.equal(0);
      }).then(function(){
          // return helpers.cssImages('search')
      })
  }

};