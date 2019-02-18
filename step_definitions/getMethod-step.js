// 'use strict';

let getMethod = require('../page-objects/getMethod');
let page = ({getMethod});

Given(/^That I make a GET call to an endPoint$/, function () {
  return page.getMethod.getCall();
});

When(/^That I capture the response time$/, function () {
  return page.getMethod.resTime();
});

Then(/^I expect status code of '(\d+)'$/, function (stcode) {
  return page.getMethod.staCode(stcode);
});

Then(/^I return the content of the API$/, function () {
  return page.getMethod.contApi();
});
  
