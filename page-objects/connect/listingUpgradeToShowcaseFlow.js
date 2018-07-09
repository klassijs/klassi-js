/**
 * Upgrade a Listing to Showcase Flow.
 *
 * @package connect
 */

'use strict';

/**
	* The elements to be selected by methods.
*/
let listingUpgradeToShowcaseData = require( '../../shared-objects/connect/listingUpgradeToShowcaseData' );
let shared = ({listingUpgradeToShowcaseData});

module.exports = {
	upgradeTheListing: async function(){
		/**
			* Waits 4 seconds for the upgrade button appears and click it.
		*/
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.upgradeButton , 4000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.upgradeButton );

		/**
		* Waits 6 seconds for the choose plan button appears and click it.
		*/
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.chooseThisPlanButton , 6000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.chooseThisPlanButton );

		/**
			* Waits 6 seconds for the checkout button appears and click it.
		*/
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.checkoutButton , 6000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.checkoutButton );

		/**
			* Waits 3 seconds for the first name field appears and click it.
		*/
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.firstName , 3000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.firstName , shared.listingUpgradeToShowcaseData.paymentInfo.firstName );

        /**
			* Waits 1 seconds to fill the lastName field.
		*/
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.lastName, 1000);
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.lastName , shared.listingUpgradeToShowcaseData.paymentInfo.lastName );

        /**
			* Waits 1 seconds to fill the card number field.
		*/
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.cardNumber, 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.cardNumber , shared.listingUpgradeToShowcaseData.paymentInfo.cardNumber );

        /**
			* Waits 1 seconds to fill the CVV field.
		*/
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.cvv , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.cvv , shared.listingUpgradeToShowcaseData.paymentInfo.cvv );

        /**
			* Waits 1 seconds to fill the month field.
		*/
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.month , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.month , shared.listingUpgradeToShowcaseData.paymentInfo.month );

        /**
			* Waits 1 seconds to fill the year field.
		*/
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.year , 1000 );
		await driver.addValue( shared.listingUpgradeToShowcaseData.elements.year , shared.listingUpgradeToShowcaseData.paymentInfo.year );

        /**
			* Waits 1 seconds to fill the address line 1 field.
		*/
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.addressLine1 , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.addressLine1 , shared.listingUpgradeToShowcaseData.paymentInfo.addressline1 );

        /**
			* Waits 1 seconds to fill the address line 2 field.
		*/
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.addressLine2 , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.addressLine2, shared.listingUpgradeToShowcaseData.paymentInfo.addressLine2 );

        /**
			* Waits 1 seconds to fill the city field.
		*/
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.city , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.city , shared.listingUpgradeToShowcaseData.paymentInfo.city );

        /**
			* Waits 1 seconds to fill the state field.
		*/
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.state , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.state , shared.listingUpgradeToShowcaseData.paymentInfo.state );

        /**
			* Waits 1 seconds to fill the country field.
		*/
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.country , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.country , shared.listingUpgradeToShowcaseData.paymentInfo.country );

        /**
			* Waits 1 seconds to fill the postcode field.
		*/
        await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.postCode , 1000 );
        await driver.addValue( shared.listingUpgradeToShowcaseData.elements.postCode , shared.listingUpgradeToShowcaseData.paymentInfo.postCode );

        /**
			* Waits 4 seconds to click on the confirm button.
		*/
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.confirmButton , 4000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.confirmButton );

        /**
			* Waits 8 seconds for the success alert appears.
		*/
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.purchaseSuccessAlert , 8000 );

        /**
			* Waits 4 seconds to click on the "x" icon and close the modal.
		*/
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.closePurchaseModal , 4000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.closePurchaseModal );
	},

	clickOnShowcasedItem: async function(){
		/**
			* Waits 4 seconds to click on the showcased listing.
		*/
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.showcasedItem , 4000 );
		await driver.click( shared.listingUpgradeToShowcaseData.elements.showcasedItem );
	},

	seesTheShowcasedWebsite: async function(){
		/**
			* Waits 1 minute to have the listing provisioned in the Showcase side
		*/
		await driver.waitForVisible( shared.listingUpgradeToShowcaseData.elements.descriptionMeasurents , 60000 );
	}
};
