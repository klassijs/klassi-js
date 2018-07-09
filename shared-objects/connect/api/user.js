/**
 * API Resource User.
 *
 * @package connect
 */

// Import the function to make requests to API.
const request = require('./request');

module.exports = {
	/**
	 * Store the current user information.
	 */
    currentUser: {
        username: '',
        password: '',
        userId:   '',
	},

	/**
	 * Get the username.
	 */
	getUsername() {
		return this.currentUser.username;
	},

	/**
	 * Get the password.
	 */
	getPassword() {
		return this.currentUser.password;
	},

	/**
	 * Get the user ID.
	 */
	getID() {
		return this.currentUser.userId;
	},

	/**
	* Get user Token
    */
	getToken() {
		// Check if current user is set.
		if ( this.getUsername() == '' ) {
			throw new Error('Username is not set. Can not retrieve token without credentials.' );
		}

		const tokenRequest = request( 'POST', '/sessions/', false, {
			Login: this.getUsername(),
			Password: this.getPassword(),
		} );

		// Failed.
		if ( ! tokenRequest ) {
			throw new Error('Could not get Token for user ID:' + this.getID() );
		}

		// Set current userID.
		this.currentUser.userId = tokenRequest.User.Id;

		// Return the token.
		return tokenRequest.Token;
	},

	/**
	* Get user Token and delete the user if the token exists.
    */
   	deleteIfExists() {
		// Get token.
		const tokenRequest = request( 'POST', '/sessions/', false, {
			Login: this.getUsername(),
			Password: this.getPassword(),
		} );

		// If not false (user already exists).
		if ( tokenRequest != false ) {
			// Delete the user.
			const userRequest = request( 'DELETE', '/users/' + tokenRequest.User.Id, tokenRequest.Token );

			// User could not be deleted
			if ( ! userRequest ) {
				throw new Error('User could not be deleted! ID:' + tokenRequest.User.Id );
			}
		}
	},

	/**
     * Create an user with specific user data.
     *
     * @param object userData User's information.
    */
    create( persona ) {
		// Set currentUser from persona.
		this.currentUser.username = persona.Email;
		this.currentUser.password = persona.Password;

		// Delete the user if it already exists.
		this.deleteIfExists();

		const userRequest = request( 'POST', '/users/', false, persona );

		// Failed.
		if ( ! userRequest ) {
			throw new Error('User could not be created!');
		}

		// Set currentUser ID.
		this.currentUser.userId = userRequest.Id;
	},

	/**
	* Delete user..
    */
    delete() {
		// Get token.
		const theToken = this.getToken();

		// Delete the user.
		const userRequest = request( 'DELETE', '/users/' + this.getID(), theToken );

        // User could not be deleted
        if ( ! userRequest ) {
            throw new Error('User could not be deleted! ID:' + this.getID() );
		}
	},
};
