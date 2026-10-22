/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard
 */
const pactumJs = require('pactum');

let res;
let videoID;
let url;

module.exports = {
  getVideoList: async () => {
    if (typeof global.browser === 'undefined' || !global.browser.sessionId) {
      console.warn('Browser or sessionId is not available, skipping video link retrieval');
      return null;
    }
    const { sessionId } = global.browser;
    const user = String(process.env.LAMBDATEST_USERNAME || '').trim();
    const key = String(process.env.LAMBDATEST_ACCESS_KEY || '').trim();
    const ltUrl = String(process.env.LAMBDATEST_API_URL || '').trim();
    if (!user || !key || !ltUrl) {
      console.warn(
        'LambdaTest video lookup skipped: LAMBDATEST_USERNAME, LAMBDATEST_ACCESS_KEY, or LAMBDATEST_API_URL is missing',
      );
      return null;
    }
    url = `https://${ltUrl}/sessions/${sessionId}/video`;
    res = await pactumJs
      .spec()
      .get(url)
      .withHeaders('Authorization', `Basic ${Buffer.from(`${user}:${key}`).toString('base64')}`)
      .withRequestTimeout(15000)
      .expectStatus(200)
      .toss();
    videoID = res.body.url;
    return videoID;
  },

  getVideoId: async () => {
    console.log('this is the failed test video link ', videoID);
    return videoID;
  },
};
