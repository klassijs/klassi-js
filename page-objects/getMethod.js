"use strict";

let apiData = require('../shared-objects/apiData');
let shared = ({apiData});

let res;

module.exports = {
  
  /**
   * making a call to the Api
   */
  getCall: async function () {
      let endPoint = (envConfig.url.api_base_url + shared.apiData.url.baseUrl);
      res = await helpers.apiCall(endPoint, 'GET');
  },
  
  /**
   * Getting the Response Timing
   */
  resTime: async function () {
      // log.info(res.timings.response);
      console.log(res.timings.response);
  },
  
  /**
   * Getting the Status Code
   */
  staCode: async function () {
    driver.pause(SHORT_DELAY_MILLISECOND);
    expect(res.statusCode).to.equal(200);
    console.log(res.statusCode)
    
  },
  
  /**
   * Getting the Content of the API
   */
  contApi: async function () {
    driver.pause(SHORT_DELAY_MILLISECOND);
    // log.info('content:- ', res.body);
    console.log(res.body);
  },
  
  
};
