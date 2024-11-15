/**
 * klassi Automated Testing Tool
 * Created by Larry Goddard
 */
const pactumJs = require('pactum');

/**
 * setting the envConfig variables for file list
 */
const ltUrl = process.env.LAMBDATEST_API_URL;
const ltUsername = process.env.LAMBDATEST_USERNAME;
const ltKey = process.env.LAMBDATEST_ACCESS_KEY;

let res;
let videoID;
let url;

module.exports = {
  getVideoList: async () => {
    const { sessionId } = browser;
    url = `https://${ltUrl}/sessions/${sessionId}/video`;
    res = await pactumJs.spec().get(url).withAuth(ltUsername, ltKey).expectStatus(200).toss();
    videoID = res.body.url;
    return videoID;
  },

  getVideoId: async () => {
    console.log('this is the failed test video link ', videoID);
    return videoID;
  },
};
