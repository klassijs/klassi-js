/**
 * API Resource Listing.
 *
 * @package connect
 */

// Import the function to make requests to API.
const request = require('./request');

module.exports = {
	/**
	 * Store the listings IDs created by the user.
	 */
	listings: [],

	/**
	 * Create a listing with specific listing data.
	 *
	 * @param object listingData listing's information.
	 */
	create( listingsData, user ) {
		// Get user token.
		const userToken = user.getToken();

		// Create the listing.
		const requestListing = request( 'POST', '/listings/', userToken, listingsData );

		// Failed.
		if ( ! requestListing ) {
			throw new Error('Error to create Listing!');
		}

		// Store the listing IDs.
		this.listings.push( requestListing.Id );
	},

	/**
	* Delete listings created by API.
	*/
	delete( user ) {
		// Get user token.
		const userToken = user.getToken();

		// Delete each listing.
		this.listings.map(function(listingId) {
			// Delete the listing.
			const requestDelete = request( 'DELETE', '/listings/' + listingId + '/', userToken );

			// Listing could not be deleted.
			if ( ! requestDelete ) {
				throw new Error('Listing could not be deleted! ID:' + listingId );
			}
		});
	},

};
