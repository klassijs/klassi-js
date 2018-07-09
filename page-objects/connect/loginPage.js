/**
 * Login page.
 *
 * @package connect
 */

'use strict';

// The elements to be selected by methods.
let loginPageData = require('../../shared-objects/connect/loginPageData');
let personasData = require('../../shared-objects/connect/personasData');
let listingsData = require('../../shared-objects/connect/listingsData');

// API resources.
let user = require('../../shared-objects/connect/api/user');
let listing = require('../../shared-objects/connect/api/listing');

let shared = ({loginPageData, personasData, listingsData});

module.exports = {
	/**
	 * Handle the login process.
	 *
	 * @param {object} persona Persona data.
	 */
  	loginAs: async function( persona ) {

		// Check if the Persona exists, else fail the test.
		if ( ! personasData.hasOwnProperty( persona ) ) {
			// Get available personas.
			const availablePersonas = Object.keys( personasData );
			throw new Error('The persona "' + persona + '" do not exist, available personas: \n - ' + availablePersonas.join('\n - '));
		}

		// Get persona data.
		const personaData = shared.personasData[ persona ];

		// Create the user.
		user.create( personaData );

		// Create the listings if available inside Persona.Listings.
		if ( personaData.hasOwnProperty( 'Listings' ) && personaData.Listings.length > 0 ) {
			// Loop the listings and add them.
			personaData.Listings.map( ( item ) => {
				listing.create( item, user );
			} );
		}

		// Go to the login page.
		await driver.url( shared.loginPageData.url );

		// Waits 3 seconds for the username field appears to ensure that the page loaded.
		await driver.waitForVisible( shared.loginPageData.elements.loginUsernameField, 3000 );

		// Clear the username field and fill it with the persona`s username.
		await driver.clearElement( shared.loginPageData.elements.loginUsernameField );
		await driver.addValue( shared.loginPageData.elements.loginUsernameField, user.getUsername() );

		// Clear the password field and fill it with the persona`s password.
		await driver.clearElement( shared.loginPageData.elements.loginPasswordField );
		await driver.addValue( shared.loginPageData.elements.loginPasswordField, user.getPassword() );

		// Click on the Sign in button.
		await driver.click( shared.loginPageData.elements.signInButton );

		// Waits 6 seconds to load the homepage.
		await driver.waitForVisible( shared.loginPageData.elements.mainNavBar , 10000 );
	},

	/**
	* Functions called after the test ran.
	*/
  	tearDown: async function() {
		// Delete the created listings.
		listing.delete( user );

		// Delete the created user.
		user.delete();
  	}
};
