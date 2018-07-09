'use strict';
let loginPageData = require('../../shared-objects/connect/loginPageData');
let personasData = require('../../shared-objects/connect/personasData');
let listingsData = require('../../shared-objects/connect/listingsData');
let apiHelpers = require('../../shared-objects/connect/apiHelpers');

let shared = ({loginPageData, personasData, listingsData});

module.exports = {
  loginAs: async function( persona ) {

	// @TODO: thrown error if persona not exists.

    // Create user
	apiHelpers.createUser( shared.personasData[ persona ] );

	// Create the first listing
	apiHelpers.addListing( shared.listingsData.listingsData[0] );

	// Create the second listing
	apiHelpers.addListing( shared.listingsData.listingsData[1] );

    // Go to the login page
	await driver.url( shared.loginPageData.url );

	// Waits 3 seconds to load the login page
	await driver.waitForVisible( shared.loginPageData.elements.loginUsernameField, 3000 );

	// username
    await driver.clearElement( shared.loginPageData.elements.loginUsernameField );
    await driver.addValue( shared.loginPageData.elements.loginUsernameField, apiHelpers.currentUser.username );

    // password
    await driver.clearElement( shared.loginPageData.elements.loginPasswordField );
    await driver.addValue( shared.loginPageData.elements.loginPasswordField, apiHelpers.currentUser.password );

    // click on the sign in button
    await driver.click( shared.loginPageData.elements.signInButton );

    // Waits 6 seconds to load the homepage.
    await driver.waitForVisible( shared.loginPageData.elements.mainNavBar , 8000 );
  },

  tearDown: async function() {
	  // Delete listings.
	  apiHelpers.deleteCreatedListings();

	  // Delete user.
	  apiHelpers.deleteCreatedUser();
  }
};
