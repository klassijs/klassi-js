// Allow to use the Given,When,Then and After functions.
let { Given,When,Then, After } = require('cucumber');

// Get the loginPage methods.
let loginPage = require('../../page-objects/connect/loginPage');

// Get the navigationPage methods.
let navigationPage = require( '../../page-objects/connect/navigationPage');

// Get the listingUpgradeToshowCase Flow.
let listingUpgradeToShowcaseFlow = require( '../../page-objects/connect/listingUpgradeToShowcaseFlow');

let page = ({ loginPage, navigationPage, listingUpgradeToShowcaseFlow });

	Given(/^"(.*)" is logged in$/, async function( persona ) {
		// LoginAs the persona described at the .feature file.
		return page.loginPage.loginAs( persona );
	});

	Given('picks one listing to upgrade', async function () {
		// Go to My listings page
		return page.navigationPage.goToMyListings();
	});

	When('he buys a Showcase Upgrade', function () {
		// Upgrade the Listing flow
        return page.listingUpgradeToShowcaseFlow.upgradeTheListing();
	});

	When('visits the listing page', function () {
		// Click on the showcased item.
		return page.listingUpgradeToShowcaseFlow.clickOnShowcasedItem();
	});

	Then('he sees the Showcase website', function () {
		// Acess the listing at the Showcase website.
		return page.listingUpgradeToShowcaseFlow.seesTheShowcasedWebsite();
	});

	After(function() {
		return page.loginPage.tearDown();
	});
