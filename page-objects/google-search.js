module.exports = {

    /** test searching for inputted data
     */
    url: 'http://google.co.uk',
    elements: {
        searchInput: ('q'),
        searchResultLink: ('div.g > h3 > a')
    },

    /** enters a search term into Google's search box and presses enter
     * @param {string} searchQuery
     * @returns {Promise} a promise to enter the search values
     */
    performSearch: function (searchQuery) {

        var selector = page.googleSearch.elements.searchInput;

        /** return a promise so the calling function knows the task has completed */
        return driver.elements(selector, driver.keys(searchQuery).keys('Enter')).pause(200);
    }
};