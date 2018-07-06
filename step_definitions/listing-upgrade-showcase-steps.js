let {Given,When,Then, After} = require('cucumber');
let loginPage = require('../page-objects/connect/loginPage');
let myListing = require( '../page-objects/connect/myListings');

let page = ({loginPage,myListing});

	Given(/^Ricardo is logged in$/, async function() {
		return page.loginPage.loginAs();
	});

	Given('picks one listing to upgrade', async function () {
		return page.myListing.goToMyListings();
		return page.myListing.clickOnUpgradeButton();
	});

	When('he buys a Showcase Upgrade', function () {
        return page.myListing.upgradeTheListing();
	});

	When('visits the listing page', function () {
		return page.myListing.clickOnShowcasedItem();
	});

	Then('he sees the Showcase website', function () {
		return page.myListing.seesTheShowcasedWebsite();
	});

  After(function() {
	return page.loginPage.tearDown();
  });
