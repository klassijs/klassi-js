/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard
 */
const pactumJs = require('pactum');

const MAX_ATTEMPTS = 8;
const DELAY_MS = 2000;

let lastVideo = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getVideoList() {
  if (typeof global.browser === 'undefined' || !global.browser.sessionId) {
    console.warn('Browser or sessionId is not available, skipping video link retrieval');
    return null;
  }
  const user = process.env.LAMBDATEST_USERNAME;
  const key = process.env.LAMBDATEST_ACCESS_KEY;
  const base = String(process.env.LAMBDATEST_API_URL || '').trim();
  if (!base) {
    console.warn('LAMBDATEST_API_URL is not set, skipping video link retrieval');
    return null;
  }
  const url = `https://${base}/sessions/${global.browser.sessionId}/video`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const res = await pactumJs.spec().get(url).withAuth(user, key).toss();
      const fileUrl = res.body && res.body.url;
      if (res.statusCode === 200 && fileUrl) {
        lastVideo = {
          url: fileUrl,
          viewUrl: res.body.view_video_url || fileUrl,
        };
        return lastVideo;
      }
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        console.warn('LambdaTest video was not available', error instanceof Error ? error.message : error);
        lastVideo = null;
        return null;
      }
    }
    await sleep(DELAY_MS);
  }
  lastVideo = null;
  return null;
}

async function getVideoId() {
  return lastVideo;
}

module.exports = {
  getVideoList,
  getVideoId,
};
