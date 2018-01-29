'use strict';

module.exports = function () {
  
  this.Given(/^That I capture the response time$/, function () {
    return page.getMethod.resTime()
  });
  
  this.Then(/^I expect status code of '(\d+)'$/, function (stcode) {
    return page.getMethod.staCode(stcode);
  });
  
  this.Then(/^I return the content of the API$/, function () {
    return page.getMethod.contApi();
  });
  
  this.Then(/^That I verify the data type of the API$/, function () {
    return page.getMethod.apiDataType();
  });
  
  this.Then(/^That I verify the status codes and content of the API$/, function () {
    return page.getMethod.contCode();
  });
  
};
