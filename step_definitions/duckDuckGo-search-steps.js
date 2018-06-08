module.exports = function (){

    this.Given(/^The user arrives on the duckduckgo search page$/, function() {
        return helpers.loadPage(shared.searchData.url, 10);
    });

    this.When(/^they input (.*)$/, function(searchWord) {
        /** use a method on the page object which also returns a promise */
        return page.duckDuckGoSearch.performSearch(searchWord);
    });

    this.Then(/^they should see some results$/, function() {
        /** return the promise of an element to the following then */
        return page.duckDuckGoSearch.searchResult();
    });

};