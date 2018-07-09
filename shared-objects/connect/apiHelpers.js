const request = require('sync-request');

const API_KEY = '57c89576caf7472e1760ed79';
const API_ENDPOINT = 'https://v2apistaging.azurewebsites.net/v2';

module.exports = {
	/**
     * Store the User info.
     */
    currentUser: {
        username: '',
        password: '',
        userId:   '',
	},

	/**
	 * Store created listings.
	 */
	listings: [],

	/**
     * Get user Token
    */
	getUserToken() {
		// Get the required token.
		const getToken = request( 'POST', API_ENDPOINT + '/sessions/?api_key=' + API_KEY, {
			json: {
				Login: this.currentUser.username,
				Password: this.currentUser.password,
			}
		} );

		if ( getToken.statusCode != '201' ) {
			throw new Error('Could not get Token for user ID:' + this.currentUser.userId );
		}

		const getTokenBody = JSON.parse( getToken.getBody('utf8') );

		const userToken = getTokenBody.Token;

		return userToken;
	},

	/**
     * Get user Token and delete the user if the token already exist
    */
   deleteUserIfItAlreadyExist() {
	   // Get the required token.
		const getToken = request( 'POST', API_ENDPOINT + '/sessions/?api_key=' + API_KEY, {
			json: {
				Login: this.currentUser.username,
				Password: this.currentUser.password,
			}
		} );

		// It do not exists... proceed!
		if ( getToken.statusCode != '201' ) {
			return;
		}

		// Else, the user exists and should be deleted.
		const getTokenBody = JSON.parse( getToken.getBody('utf8') );

		const userToken = getTokenBody.Token;
		const userId	= getTokenBody.User.Id;

		// Delete the user.
        const deleteUser = request( 'DELETE', API_ENDPOINT + '/users/' + userId + '/?api_key=' + API_KEY + '&token=' + userToken );

        // User could not be deleted
        if ( deleteUser.statusCode != '200' ) {
            throw new Error('User could not be deleted! ID:' + userId );
        }
	},

	/**
     * Create a user with specific user data.
     *
     * @param object userData User's information.
     */
    createUser( persona ) {
		// Set the current credentials.
		this.currentUser.username = persona.Email;
		this.currentUser.password = persona.Password;

		// Ensure to delete user if already exists.
		this.deleteUserIfItAlreadyExist();

        // Create the user.
        const createUser = request( 'POST', API_ENDPOINT + '/users/?api_key=' + API_KEY, {
            json: persona
        } );

        // User created with success.
        if ( createUser.statusCode == '201' ) {
            const userInformation = JSON.parse( createUser.getBody('utf8') );
            this.currentUser.userId = userInformation.Id;
        } else {
            throw new Error('User could not be created!');
        }
	},

	/**
     * Delete user created by API.
     */
    deleteCreatedUser() {
        // Get user token.
        const userToken = this.getUserToken();

        // Delete the user.
        const deleteUser = request( 'DELETE', API_ENDPOINT + '/users/' + this.currentUser.userId + '/?api_key=' + API_KEY + '&token=' + userToken );

        // User could not be deleted
        if ( deleteUser.statusCode != '200' ) {
            throw new Error('User could not be deleted! ID:' + this.currentUser.userId );
        }
	},

	/**
	 * Create a listing with specific listing data.
	 *
	 * @param object listingData listing's information.
	 */
	addListing( listingData ) {
		// Get user token.
		const userToken = this.getUserToken();

		// Create the listing.
		const addListing = request( 'POST', API_ENDPOINT + '/listings/?api_key=' + API_KEY + '&token=' + userToken, {
			json: listingData
		} );

		// Listing created with success.
		if ( addListing.statusCode == '201' ) {
			// Store the listing ID.
			const listingInformation = JSON.parse( addListing.getBody('utf8') );

			this.listings.push(listingInformation.Id);
		} else {
			throw new Error('User could not be created!');
		}
	},

	/**
	 * Delete listings created by API.
	 */
	deleteCreatedListings() {
		// Get user token.
		const userToken = this.getUserToken();

		this.listings.map(function(listingId) {
			// Delete the listings.
			const deleteListing = request( 'DELETE', API_ENDPOINT + '/listings/' + listingId + '/?api_key=' + API_KEY + '&token=' + userToken );

			// Listing could be not deleted
			if ( deleteListing.statusCode != '200' ) {
				throw new Error('Listing could not be deleted! ID:' + listingId );
			}
		});
	},

};
