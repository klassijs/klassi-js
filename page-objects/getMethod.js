let resp;

module.exports = {
  /**
   * making a call to the Api
   */
  getCall: async () => {
    const url = env.api_base_url;
    await helpers.apiCall(url, 'GET');
    resp = await helpers.getContent();
    // console.log('endPoint and statusCode ', `${url}:${resp.statusCode}`);
  },
  /**
   * Getting the Status Code
   */
  staCode: async () => {
    await browser.pause(DELAY_100ms);
    expect(resp.statusCode).to.equal(200);
    // console.log('the status code ', resp.statusCode);
  },
  /**
   * Getting the Content of the API
   */
  contApi: async () => {
    await browser.pause(DELAY_100ms);
    await resp.body;
    // console.log('the API content ', resp.body);
  },
};
