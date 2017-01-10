module.exports = function (){

    this.Given(/^I am on klassifashion home page$/, function () {

        return helpers.loadPage(page.klassiFashion.url, 10).then(function(){

            /** Take an image of the page under test */
            return helpers.cssImages(page.klassiFashion.cssImage.name)
        })
    });

    this.When(/^I click navigation item "([^"]*)"$/, function (linkTitle) {

        return page.klassiFashion.mouseOverNavItem(linkTitle)
    });

    this.When(/^I click product item "([^"]*)"$/, function (productTitle) {

        return page.klassiFashion.clickProductItem(productTitle).then(function(){

            return helpers.cssImages(page.klassiFashion.hoverAndClick.name)
        })
    });

    this.Then(/^I should see the product details with title "([^"]*)"$/, function (pageTitle) {

        return page.klassiFashion.titleContains(pageTitle);
    });

};