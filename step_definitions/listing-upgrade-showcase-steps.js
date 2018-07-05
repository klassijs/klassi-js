let {Given, After} = require('cucumber');
let loginPage = require('../page-objects/connect/loginPage');
let page = ({loginPage});

  Given(/^Ricardo is logged in$/, async function() {
    return page.loginPage.loginAs();
  });

  After(function() {
	return page.loginPage.tearDown();
  });
