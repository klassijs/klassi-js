'use strict';

const shared = require('../shared-objects/apiData');
const helpers = require('../../../runtime/helpers');

let log = global.log;
let res;

module.exports = {
  /**
   * making a call to the Api
   */
  getCall: async() => {
    let endPoint = shared.url.api_base_url + shared.url.method;
    res = await helpers.apiCall(endPoint, 'GET');
  },
  /**
   * Getting the Response Timing
   */
  resTime: async function() {
    log.info(res.timings.response);
  },
  /**
   * Getting the Status Code
   */
  staCode: async function() {
    browser.pause(DELAY_1s);
    expect(res.statusCode).to.equal(200);
    log.info(res.statusCode);
  },
  /**
   * Getting the Content of the API
   */
  contApi: async function() {
    browser.pause(DELAY_1s);
    log.info(res.body);
  }
};
