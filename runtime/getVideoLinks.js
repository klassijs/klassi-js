/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard
 */
const pactumJs = require('pactum');

let videoID;

module.exports = {
  getVideoList: async () => {
    if (typeof global.browser === 'undefined' || !global.browser.sessionId) {
      console.warn('Browser or sessionId is not available, skipping video link retrieval');
      return null;
    }
    const { sessionId } = global.browser;
    const base = String(process.env.LAMBDATEST_API_URL || '').trim();
    const user = process.env.LAMBDATEST_USERNAME;
    const key = process.env.LAMBDATEST_ACCESS_KEY;
    if (!base) {
      console.warn('LAMBDATEST_API_URL is not set, skipping video link retrieval');
      return null;
    }
    const url = `https://${base}/sessions/${sessionId}/video`;
    const res = await pactumJs.spec().get(url).withAuth(user, key).expectStatus(200).toss();
    videoID = res.body.url;
    return videoID;
  },

  getVideoId: async () => {
    return videoID;
  },
};
