Given('I am logged into the Site', async () => {
  await helpers.loadPage('https://test.account.oup.com/', 20);
  await pageObjects.testApi.getAuthToken();
});

Then('I make a GET call to an endPoint and get a statusCode of {int}', (code) => pageObjects.testApi.getCall(code));

Then('I do a POST to an endPoint and invite a user', () => pageObjects.testApi.postCall());

Then('I do a PUT to an endPoint and edit a user', () => pageObjects.testApi.putCall());

Then('I do a DELETE to an endPoint and delete a user', () => pageObjects.testApi.deleteCall());
