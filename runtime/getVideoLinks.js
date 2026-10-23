/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard
 */
const pactumJs = require('pactum');

let videoID;

function ltGet(url, user, key) {
  return pactumJs
    .spec()
    .get(url)
    .withHeaders('Authorization', `Basic ${Buffer.from(`${user}:${key}`).toString('base64')}`)
    .withRequestTimeout(15000)
    .toss();
}

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

    try {
      for (let attempt = 1; attempt <= 4; attempt++) {
        const listRes = await ltGet(`https://${ltUrl}/sessions?limit=50`, user, key);
        const rows = (listRes.body && listRes.body.data) || [];
        const match = rows.find((row) => row.session_id === sessionId || row.test_id === sessionId);
        if (match && match.video_url) {
          videoID = match.video_url;
          return videoID;
        }
        if (attempt < 4) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
      videoID = null;
      return null;
    } catch (err) {
      console.warn('LambdaTest video lookup failed');
      videoID = null;
      return null;
    }
  },

  getVideoId: async () => {
    // console.log('this is the failed test video link ', videoID);
    return videoID;
  },
};
