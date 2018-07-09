'use strict';

let listingUpgradeToShowcaseData = require( '../../shared-objects/connect/listingUpgradeToShowcaseData' );

let shared = ({listingUpgradeToShowcaseData});

module.exports = {
	upgradeTheListing: async function(){
		// Click on the Upgrade button
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.upgradeButton , 4000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.upgradeButton );

		// Click on Choose button
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.chooseThisPlanButton , 6000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.chooseThisPlanButton );

		// Click on the Checkout button
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.checkoutButton , 6000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.checkoutButton );

		// Fill the information field
	    // Filling the payment method form
        // First name
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.firstName , 3000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.firstName , shared.listingUpgradeToShowcaseData.paymentInfo.firstName );

        // Last name
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.lastName, 1000);
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.lastName , shared.listingUpgradeToShowcaseData.paymentInfo.lastName );

        // Card number
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.cardNumber, 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.cardNumber , shared.listingUpgradeToShowcaseData.paymentInfo.cardNumber );

        // CVV
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.cvv , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.cvv , shared.listingUpgradeToShowcaseData.paymentInfo.cvv );

        // MM
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.month , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.month , shared.listingUpgradeToShowcaseData.paymentInfo.month );

        // YYYY
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.year , 1000 );
		await driver.addValue( shared.listingUpgradeToShowcaseData.elements.year , shared.listingUpgradeToShowcaseData.paymentInfo.year );

        // Address line 1
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.addressLine1 , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.addressLine1 , shared.listingUpgradeToShowcaseData.paymentInfo.addressline1 );

        // Address line 2
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.addressLine2 , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.addressLine2, shared.listingUpgradeToShowcaseData.paymentInfo.addressLine2 );

        // city
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.city , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.city , shared.listingUpgradeToShowcaseData.paymentInfo.city );

        // State
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.state , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.state , shared.listingUpgradeToShowcaseData.paymentInfo.state );

        // country
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.country , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.country , shared.listingUpgradeToShowcaseData.paymentInfo.country );

        // PostCode
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.postCode , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.postCode , shared.listingUpgradeToShowcaseData.paymentInfo.postCode );

		// Click on Confirm button
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.confirmButton , 4000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.confirmButton );

		// A success alert must appears
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.purchaseSuccessAlert , 8000 );

		// Click on the "X" icon to close the modal
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.closePurchaseModal , 4000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.closePurchaseModal );
	},

	clickOnShowcasedItem: async function(){
		// Click on the Showcased Item
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.showcasedItem , 4000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.showcasedItem );
	},

	seesTheShowcasedWebsite: async function(){
		// Waits one minute to have the listing provisioned in the Showcase side
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.descriptionMeasurents , 60000 );
	}
};
