Given('That I make a GET call to an endPoint', async () => {
  await pageObjects.getMethod.getCall();
});

When(/^That I capture the response time$/, async () => {
  await pageObjects.getMethod.resTime();
});

Then(/^I expect status code of '(\d+)'$/, async (stcode) => {
  await pageObjects.getMethod.staCode(stcode);
});

Then(/^I return the content of the API$/, async () => {
  await pageObjects.getMethod.contApi();
});
