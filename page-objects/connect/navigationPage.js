/**
 * Navigation at homepage.
 *
 * @package connect
 */
'use strict';

// The elements to be selected by methods.
let navigationPageData = require( '../../shared-objects/connect/navigationPageData' );

let shared = ({navigationPageData});

module.exports = {
  	goToMyListings: async function(){

		// Click on the Search For Properties menu item.
		await driver.click( shared.navigationPageData.elements.searchForPropertiesMenu );

		// Waits 4 seconds for My Listings tab appears and click it.
		await driver.waitForVisible( shared.navigationPageData.elements.myListingsTab , 4000 );
		await driver.click( shared.navigationPageData.elements.myListingsTab );
	},
};
