'use strict';
let loginData = require('../../shared-objects/loginData');
let apiHelpers = require('../../shared-objects/apiHelpers');

let shared = ({loginData});

module.exports = {
  loginAs: async function() {

    // Create user
	apiHelpers.createUser( shared.loginData.userData );

	// Create the first listing
	apiHelpers.addListing( shared.loginData.listingsData[0] );

	// Create the second listing
	apiHelpers.addListing( shared.loginData.listingsData[1] );

    // Go to the login page
    await driver.url( shared.loginData.url );

    // username
    await driver.waitForVisible( shared.loginData.elements.loginUsernameField, 3000 );
    await driver.clearElement( shared.loginData.elements.loginUsernameField );
    await driver.addValue( shared.loginData.elements.loginUsernameField, apiHelpers.currentUser.username );

    // password
    await driver.waitForVisible( shared.loginData.elements.loginPasswordField, 3000 );
    await driver.clearElement( shared.loginData.elements.loginPasswordField );
    await driver.addValue( shared.loginData.elements.loginPasswordField, apiHelpers.currentUser.password );

    // click on the sign in button
    await driver.click( shared.loginData.elements.signInButton );
    await driver.pause( 6000 );

    // Check if Ricardo is logged
    await driver.waitForVisible( shared.loginData.elements.mainNavBar , 3000 );
  },

  tearDown: async function() {
	  // Delete listings.
	  apiHelpers.deleteCreatedListings();

	  // Delete user.
	  apiHelpers.deleteCreatedUser();
  }
};
