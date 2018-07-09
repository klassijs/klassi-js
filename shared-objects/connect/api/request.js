/**
 * API Request.
 *
 * @package connect
 */

const request = require('sync-request');

// Set the API key and Endpoint.
const API_KEY = '57c89576caf7472e1760ed79';
const API_ENDPOINT = 'https://v2apistaging.azurewebsites.net/v2';

/**
 * Make request to API.
 *
 * @param {string} method The request method (GET, POST, UPDATE, DELETE).
 * @param {string} endpoint The endpoint to be accessed. E.g.: /sessions/
 * @param {string | bool} token Optional token string, if required by the operation. Set as false, if not required.
 * @param {Object} body Optional body, if required by the operation.
 */
module.exports = function( method, endpoint, token, body ) {
	// Ensure endpoint starts and ends with /.
	if ( endpoint[0] != '/' ) {
		endpoint = '/' + endpoint;
	}

	// Remove last /.
	if ( endpoint[ endpoint.length - 1 ] == '/' ) {
		endpoint = endpoint.substr(0, endpoint.length - 1);
	}

	// Build request URL.
	let url = API_ENDPOINT + endpoint + '?api_key=' + API_KEY;

	// Adds token, if available.
	if ( typeof token === typeof '' ) {
		url = url + '&token=' + token;
	}

	// Request body.
	let requestBody = {};

	if ( typeof body === typeof {} ) {
		requestBody.json = body;
	}

	// Do the request.
	const theRequest = request( method, url, requestBody );

	// If success....
	if ( theRequest.statusCode == '201' || theRequest.statusCode == '200' ) {
		// Return request body.
		return JSON.parse( theRequest.getBody('utf8') );
	}

	// If something goes wrong, return false.
	return false;
}
