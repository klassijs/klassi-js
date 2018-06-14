"use strict";

let getMethod = require('../page-objects/getMethod');
let apiData = require('../shared-objects/apiData');

let shared = ({apiData});
let page = ({getMethod});

let res;

module.exports = {
  
  /**
   * Getting the Response Timing
   */
  resTime: async function () {
      let endPoint = (envConfig.url.api_base_url + shared.apiData.url.baseUrl);
      res =  await helpers.apiCall(endPoint, 'GET');
      log.info(res);
  },
  
  /**
   * Getting the Status Code
   */
  staCode: async function () {
    driver.pause(SHORT_DELAY_MILLISECOND);
    expect(res.statusCode).to.equal(200);
    
  },
  
  /**
   * Getting the Content of the API
   */
  contApi: async function () {
    driver.pause(SHORT_DELAY_MILLISECOND);
    log.info('content:- ', res.body);
  },
  
  
};
