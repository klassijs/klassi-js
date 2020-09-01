const shared = require('../shared-objects/apiData');
const confSettings = require('../../../runtime/confSettings');

const { log } = global;
let res;

module.exports = {
  /**
   * making a call to the Api
   */
  getCall: async () => {
    const baseUrl = shared.url.api_base_url;
    const url = baseUrl;
    const method = 'get';

    res = await confSettings.apiCall(url + method);
  },
  /**
   * Getting the Response Timing
   */
  resTime: async () => {
    log.info(res.timings.response);
    console.log(res.timings.response);
  },
  /**
   * Getting the Status Code
   */
  staCode: async () => {
    browser.pause(DELAY_200ms);
    expect(res.statusCode).to.equal(200);
    log.info(res.statusCode);
    console.log(res.statusCode);
  },
  /**
   * Getting the Content of the API
   */
  contApi: async () => {
    browser.pause(DELAY_200ms);
    log.info(res.body);
    console.log(res.body);
  },
};
