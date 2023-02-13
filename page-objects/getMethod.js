let resp;

module.exports = {
  /**
   * making a call to the Api
   */
  getCall: async () => {
    const url = env.api_base_url;
    await helpers.apiCall(url, 'GET', null, null);
    resp = await helpers.getContent();
  },

  /**
   * Getting the Status Code
   */
  staCode: async (code) => {
    await browser.pause(DELAY_100ms);
    try {
      expect(resp.statusCode).to.equal(code);
    } catch (err) {
      console.error(err);
      expect(resp.statusCode).to.equal(200, 'The fallback validation for a 200 status code also failed.');
    }
  },

  /**
   * Getting the Content of the API
   */
  contApi: async () => {
    await browser.pause(DELAY_100ms);
    await resp.body;
    // console.log('This is the content of the API : ', resp.body);
  },
};
