'use strict';

let myListingData = require( '../../shared-objects/myListingsData' );

let shared = {myListingData}

module.exports = {
  	goToMyListings: async function(){
		// Go to My Listings
		// Click on the menu item "Search For Properties"
		await driver.waitForVisible( shared.myListingData.elements.searchForPropertiesMenu , 4000 );
		await driver.click( shared.myListingData.elements.searchForPropertiesMenu );

		// Click on the "My Listings" tab
		await driver.waitForVisible( shared.myListingData.elements.myListingsTab , 4000 );
		await driver.click( shared.myListingData.elements.myListingsTab );
  	},

  	clickOnUpgradeButton: async function(){
		// Click on the Upgrade button
		await driver.waitForVisible( shared.myListingData.elements.upgradeButton , 4000 );
		await driver.click( shared.myListingData.elements.upgradeButton );
  	},

	upgradeTheListing: async function(){
		// Click on the Upgrade button
		await driver.waitForVisible( shared.myListingData.elements.upgradeButton , 4000 );
		await driver.click( shared.myListingData.elements.upgradeButton );

		// Click on Choose button
		await driver.waitForVisible( shared.myListingData.elements.chooseThisPlanButton , 6000 );
		await driver.click( shared.myListingData.elements.chooseThisPlanButton );
		await driver.pause( 1200 );

		// Click on the Checkout button
		await driver.waitForVisible( shared.myListingData.elements.checkoutButton , 6000 );
		await driver.click( shared.myListingData.elements.checkoutButton );
		await driver.pause( 1200 );

		// Fill the information field
	    // Filling the payment method form
        // First name
        await driver.waitForVisible( shared.myListingData.elements.firstName , 1600 );
        await driver.addValue( shared.myListingData.elements.firstName , shared.myListingData.paymentInfo.firstName );

        // Last name
        await driver.pause( 1000 );
        await driver.addValue( shared.myListingData.elements.lastName , shared.myListingData.paymentInfo.lastName );

        // Card number
        await driver.pause( 1000 );
        await driver.addValue( shared.myListingData.elements.cardNumber , shared.myListingData.paymentInfo.cardNumber );

        // CVV
        await driver.pause( 1000 );
        await driver.addValue( shared.myListingData.elements.cvv , shared.myListingData.paymentInfo.cvv );

        // MM
        await driver.pause( 1000 );
        await driver.addValue( shared.myListingData.elements.month , shared.myListingData.paymentInfo.month );

        // YYYY
        await driver.pause( 1000 );
		await driver.addValue( shared.myListingData.elements.year , shared.myListingData.paymentInfo.year );

        // Address line 1
        await driver.pause( 1000 );
        await driver.addValue( shared.myListingData.elements.addressLine1 , shared.myListingData.paymentInfo.addressline1 );

        // Address line 2
        await driver.pause( 1000 );
        await driver.addValue( shared.myListingData.elements.addressLine2, shared.myListingData.paymentInfo.addressLine2 );

        // city
        await driver.pause( 1000 );
        await driver.addValue( shared.myListingData.elements.city , shared.myListingData.paymentInfo.city );

        // State
        await driver.pause( 1000 );
        await driver.addValue( shared.myListingData.elements.state , shared.myListingData.paymentInfo.state );

        // country
        await driver.pause( 1000 );
        await driver.addValue( shared.myListingData.elements.country , shared.myListingData.paymentInfo.country );

        // PostCode
        await driver.pause( 1000 );
        await driver.addValue( shared.myListingData.elements.postCode , shared.myListingData.paymentInfo.postCode );

		// Click on Confirm button
		await driver.waitForVisible( shared.myListingData.elements.confirmButton , 4000 );
		await driver.click( shared.myListingData.elements.confirmButton );

		// A success alert must appears
		await driver.waitForVisible( shared.myListingData.elements.purchaseSuccessAlert , 8000 );

		// Click on the "X" icon to close the modal
		await driver.waitForVisible( shared.myListingData.elements.closePurchaseModal , 4000 );
		await driver.click( shared.myListingData.elements.closePurchaseModal );
	},

	clickOnShowcasedItem: async function(){
		// Click on the Showcased Item
		await driver.waitForVisible( shared.myListingData.elements.showcasedItem , 4000 );
		await driver.click( shared.myListingData.elements.showcasedItem );
	},

	seesTheShowcasedWebsite: async function(){
		// Waits one minute to have the listing provisioned in the Showcase side
		await driver.waitForVisible( shared.myListingData.elements.descriptionMeasurents , 60000 );
	}
};
