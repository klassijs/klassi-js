module.exports = function (){

    this.When(/^I search Google for "([^"]*)"$/, function (searchQuery){

        return helpers.loadPage(page.googleSearch.url, 10).then(function(){

            /** use a method on the page object which also returns a promise */
            return page.googleSearch.performSearch(searchQuery);
        })
    });

    this.Then(/^I should see some results$/, function(){

        /** driver waitUntil returns a promise so return that */
        return driver.waitUntil(driver.element('div.g'), 10).then(function(){

            /** return the promise of an element to the following then */
            return driver.element('div.g')
        })
        .then(function(elements){

            /** verify this element has children */
            expect(elements.length).to.not.equal(0);
        })
    });
};