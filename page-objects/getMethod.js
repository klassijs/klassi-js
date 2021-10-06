const pactum = require('pactum');

const spec = pactum.spec();
const url = env.api_base_url;

let resp;

module.exports = {
  /**
   * making a call to the Api
   */
  getCall: async () => {
    resp = await spec.get(`${url}`).expectStatus(200);
  },

  /**
   * Getting the Content of the API
   */
  contApi: async () => {
    resp = await spec.toss();
    await browser.pause(DELAY_200ms);
    console.log('the content ', resp.body);
  },

  /**
   * Getting the Status Code
   */
  staCode: async () => {
    const status = resp.statusCode;
    console.log('the status code: ', status);
  },
};
