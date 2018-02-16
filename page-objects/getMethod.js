"use strict";

module.exports = {
  
  /**
   * Getting the Response Timing
   */
  resTime: function () {
      let endPoint = (envConfig.api_base_url + shared.apiData.url.baseUrl);
    return helpers.getAPI(endPoint);
  },
  
  /**
   * Getting the Status Code
   */
  staCode: function () {
    return page.getMethod.resTime().then(function (res, err) {
      if (err) {
        log.error('Help am Drowning ', err);
      }
      else if (expect(res.statusCode).to.equal(200)) {
        log.info(res.statusCode);
      } else {
        log.error('Assert error - ', res.AssertionError);
      }
    })
  },
  
  /**
   * Getting the Content of the API
   */
  contApi: function () {
    driver.timeouts(3000);
    return page.getMethod.resTime().then(function (res, err) {
      if (err){
        log.error('Help am Drowning ', err);
      }else {
        log.info('content:- ', res.body);
      }
    })
  },
  
  
};
