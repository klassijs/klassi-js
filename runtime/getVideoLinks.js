/**
 klassi-js
 Copyright © 2016 - Larry Goddard

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
const pactumJs = require('pactum');

const spec = pactumJs.spec();
/**
 * setting the envConfig variables for file list
 */
let username;
let key;
let ltUsername;
let ltKey;

if (username) {
  // eslint-disable-next-line no-unused-expressions
  process.env.BROWSERSTACK_USERNAME || bssecrets.userName || dataconfig.bslocal.userName;
}
if (ltUsername) {
  // eslint-disable-next-line no-unused-expressions
  process.env.LAMBDATEST_USERNAME || ltsecrets.userName || dataconfig.ltlocal.userName;
}

if (key) {
  // eslint-disable-next-line no-unused-expressions
  process.env.BROWSERSTACK_ACCESS_KEY || bssecrets.accessKey || dataconfig.bslocal.accessKey;
}

if (ltKey) {
  // eslint-disable-next-line no-unused-expressions
  process.env.LAMBDATEST_ACCESS_KEY || ltsecrets.accessKey || dataconfig.ltlocal.accessKey;
}

const bsUrl = process.env.BROWSERSTACK_API_URL || bssecrets.crossBrowserUrl;
const ltUrl = process.env.LAMBDATEST_API_URL || ltsecrets.crossBrowserUrl;

// const method = 'GET';
let res;
let url;
let videoID;

module.exports = {
  /**
   * making a call to the Api to get Browserstack video links
   */
  getBsVideoLink: async () => {
    const { sessionId } = browser;
    url = `https://${bsUrl}/sessions/${sessionId}`;
    // url = `https://${username}:${key}${bsUrl}/sessions/${sessionId}`;
    await spec.get(url).withAuth(username, key).expectStatus(200);
    res = await spec.toss();
    // res = await helpers.apiCall(url, method);
    // const obj = JSON.parse(res.body);
    // videoID = obj.video_url;
    videoID = res.body.url;
    return videoID;
  },

  /**
   * making a call to the Api to get lambdatest video links
   * @returns {Promise<*>}
   */
  getLtVideoLink: async () => {
    const { sessionId } = browser;
    url = `https://${ltUrl}/sessions/${sessionId}/video`;
    await spec.get(url).withAuth(ltUsername, ltKey).expectStatus(200);
    res = await spec.toss();
    // console.log('this is the res ', res.body);
    videoID = res.body.url;
    return videoID;
  },

  getVideoId() {
    return videoID;
  },
};
