module.exports = {
	// URL
	url: 'https://v2-staging.proxiopro.com/',

	// Selectors present in the login page.
    elements: {
        myAccountDropdown: '#dropdown-user a',
	    logoutButton: '.pad-all a',
	    loginUsernameField: '#username',
	    loginPasswordField: '#password',
	    signInButton: 'button[value="Login"]',
	    navbar: '.navbar-content',
	    mainNavBar: '#mainnav-menu'
	},
};
