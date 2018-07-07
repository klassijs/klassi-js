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

	// Waits 3 seconds to load the login page
	await driver.waitForVisible( shared.loginData.elements.loginUsernameField, 3000 );

	// username
    await driver.clearElement( shared.loginData.elements.loginUsernameField );
    await driver.addValue( shared.loginData.elements.loginUsernameField, apiHelpers.currentUser.username );

    // password
    await driver.clearElement( shared.loginData.elements.loginPasswordField );
    await driver.addValue( shared.loginData.elements.loginPasswordField, apiHelpers.currentUser.password );

    // click on the sign in button
    await driver.click( shared.loginData.elements.signInButton );

    // Waits 6 seconds to load the homepage.
    await driver.waitForVisible( shared.loginData.elements.mainNavBar , 8000 );
  },

  tearDown: async function() {
	  // Delete listings.
	  apiHelpers.deleteCreatedListings();

	  // Delete user.
	  apiHelpers.deleteCreatedUser();
  }
};
