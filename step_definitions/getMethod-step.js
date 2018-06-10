'use strict';

let {Given, Then, When} = require('cucumber');
let getMethod = require('../page-objects/getMethod');

let page = ({getMethod});

  Given(/^That I capture the response time$/, function () {
    return page.getMethod.resTime()
  });
  
  When(/^I expect status code of '(\d+)'$/, function (stcode) {
    return page.getMethod.staCode(stcode);
  });
  
  Then(/^I return the content of the API$/, function () {
    return page.getMethod.contApi();
  });
  
