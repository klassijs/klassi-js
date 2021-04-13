/**
 * setting the envConfig variables for file list
 */
const bsUrl = process.env.BROWSERSTACK_API_URL || bssecrets.crossBrowserUrl;
const username = process.env.BROWSERSTACK_USERNAME || bssecrets.userName || dataconfig.bslocal.userName;
const key = process.env.BROWSERSTACK_ACCESS_KEY || bssecrets.accessKey || dataconfig.bslocal.accessKey;

const ltUrl = process.env.LAMBDATEST_API_URL || ltsecrets.crossBrowserUrl;
const ltUsername = process.env.LAMBDATEST_USERNAME || ltsecrets.userName || dataconfig.ltlocal.userName;
const ltKey = process.env.LAMBDATEST_ACCESS_KEY || ltsecrets.accessKey || dataconfig.ltlocal.accessKey;

const method = 'GET';
let res;
let videoID;

module.exports = {
  /**
   * making a call to the Api to get Browserstack video links
   */
  getBsVideoLink: async () => {
    // eslint-disable-next-line camelcase
    const session_id = browser.sessionId;
    // eslint-disable-next-line camelcase
    const url = `https://${username}:${key}${bsUrl}/sessions/${session_id}`;
    res = await helpers.apiCall(url, method);
    videoID = res.body.automation_session.video_url;
    return videoID;
  },

  /**
   * making a call to the Api to get lambdatest video links
   * @returns {Promise<*>}
   */
  getLtVideoLink: async () => {
    // eslint-disable-next-line camelcase
    const session_id = browser.sessionId;
    // eslint-disable-next-line camelcase
    const url = `https://${ltUsername}:${ltKey}${ltUrl}/sessions/${session_id}/video`;
    res = await helpers.apiCall(url, method);
    videoID = res.body.url;
    return videoID;
  },

  getVideoId() {
    return videoID;
  },
};
