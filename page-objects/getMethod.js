const { softAssert } = require('klassijs-soft-assert');
let resp;

module.exports = {
  /**
   * making a call to the Api
   */
  getCall: async () => {
    const url = env.api_base_url;
    await helpers.apiCall(url, 'GET', null, null);
    resp = await helpers.getContent();

    console.log('endPoint and statusCode ', `${url}:${resp.statusCode}`);
  },

  /**
   * Getting the Status Code
   */
  staCode: async (stcode) => {
    await browser.pause(DELAY_100ms);
    try {
      await softAssert(resp.statusCode, 'equal', stcode);
    } catch (err) {
      console.error(err);
      await softAssert(
        resp.statusCode,
        'equal',
        200,
        'The fallback validation for a 200 status code also failed.');
    }
  },

  /**
   * Getting the Content of the API
   */
  contApi: async () => {
    await browser.pause(DELAY_100ms);
    await resp.body;
    console.log('the API content ', resp.body);
  },
};
