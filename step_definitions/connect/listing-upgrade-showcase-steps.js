let {Given,When,Then, After} = require('cucumber');
let loginPage = require('../../page-objects/connect/loginPage');
let navigationPage = require( '../../page-objects/connect/navigationPage');
let listingUpgradeToShowcaseFlow = require( '../../page-objects/connect/listingUpgradeToShowcaseFlow');

let page = ({loginPage,navigationPage,listingUpgradeToShowcaseFlow});

	Given(/^"(.*)" is logged in$/, async function( persona ) {
		return page.loginPage.loginAs( persona );
	});

	Given('picks one listing to upgrade', async function () {
		return page.navigationPage.goToMyListings();
	});

	When('he buys a Showcase Upgrade', function () {
        return page.listingUpgradeToShowcaseFlow.upgradeTheListing();
	});

	When('visits the listing page', function () {
		return page.listingUpgradeToShowcaseFlow.clickOnShowcasedItem();
	});

	Then('he sees the Showcase website', function () {
		return page.listingUpgradeToShowcaseFlow.seesTheShowcasedWebsite();
	});

  After(function() {
	return page.loginPage.tearDown();
  });
