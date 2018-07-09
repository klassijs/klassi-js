'use strict';

let navigationPageData = require( '../../shared-objects/connect/navigationPageData' );

let shared = ({navigationPageData});

module.exports = {
  	goToMyListings: async function(){
		// Go to My Listings
		// Click on the menu item "Search For Properties"
		await driver.click( shared.navigationPageData.elements.searchForPropertiesMenu );

		// Click on the "My Listings" tab
		await driver.waitForVisible( shared.navigationPageData.elements.myListingsTab , 4000 );
		await driver.click( shared.navigationPageData.elements.myListingsTab );
	},
};
