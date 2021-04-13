let res;

module.exports = {
  /**
   * making a call to the Api
   */
  getCall: async () => {
    // eslint-disable-next-line no-undef
    const url = env.api_base_url;
    const method = 'GET';

    res = await helpers.apiCall(url, method);
  },
  /**
   * Getting the Response Timing
   */
  resTime: async () => {
    console.log(res.timings.response);
  },
  /**
   * Getting the Status Code
   */
  staCode: async () => {
    await browser.pause(DELAY_200ms);
    expect(res.statusCode).to.equal(200);
    console.log(res.statusCode);
  },
  /**
   * Getting the Content of the API
   */
  contApi: async () => {
    await browser.pause(DELAY_200ms);
    console.log(res.body);
  },
};
