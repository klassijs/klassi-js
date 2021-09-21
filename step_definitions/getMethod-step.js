Given('That I make a GET call to an endPoint', async () => {
  await pageObjects.getMethod.getCall();
});

Then(/^I expect status code of '(\d+)'$/, async (code) => {
  await pageObjects.getMethod.staCode(code);
});

Then(/^I return the content of the API$/, async () => {
  await pageObjects.getMethod.contApi();
});
