'use strict';

let getMethod = require('../page-objects/getMethod');
let page = { getMethod };

Given(/^That I make a GET call to an endPoint$/, async () => {
  await page.getMethod.getCall();
});

When(/^That I capture the response time$/, async () => {
  await page.getMethod.resTime();
});

Then(/^I expect status code of '(\d+)'$/, async (stcode) => {
  await page.getMethod.staCode(stcode);
});

Then(/^I return the content of the API$/, async () => {
  await page.getMethod.contApi();
});
