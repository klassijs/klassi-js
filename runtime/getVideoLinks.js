/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard
 */
const pactumJs = require('pactum');

const MAX_ATTEMPTS = 8;
const DELAY_MS = 2000;
const MAX_EMBED_BYTES = 20 * 1024 * 1024;

let lastVideo = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasUserinfo(value) {
  return /https?:\/\/[^/?#]+@/.test(String(value || ''));
}

function dashboardUrl(video) {
  if (video?.viewUrl && !hasUserinfo(video.viewUrl)) return video.viewUrl;
  const fromBundler = String(video?.url || '').match(/\/bundler\/([^/]+)\//);
  const id = fromBundler?.[1] || video?.sessionId;
  return id ? `https://automation.lambdatest.com/logs/?testID=${encodeURIComponent(id)}` : '';
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
  const sessionId = global.browser.sessionId;
  const url = `https://${base}/sessions/${sessionId}/video`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const res = await pactumJs.spec().get(url).withAuth(user, key).toss();
      const fileUrl = res.body && res.body.url;
      if (res.statusCode === 200 && fileUrl) {
        const viewUrl = res.body.view_video_url && !hasUserinfo(res.body.view_video_url)
          ? res.body.view_video_url
          : '';
        lastVideo = { url: fileUrl, viewUrl, sessionId };
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

async function downloadMp4(video) {
  if (!video?.url) return null;
  try {
    const res = await fetch(video.url);
    if (!res.ok) return null;
    const type = String(res.headers.get('content-type') || '');
    if (type.includes('json') || type.includes('text/html')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100 || buf.length > MAX_EMBED_BYTES) return null;
    return buf;
  } catch {
    return null;
  }
}

function reportHtml(video, mp4) {
  if (!video || !video.url) return '';
  const parts = [];
  if (mp4) {
    parts.push(
      `video:\n <video width='640' height='360' controls> <source src=data:video/mp4;base64,${mp4.toString('base64')} type=video/mp4> </video>`,
    );
  } else if (/\.mp4(\?|$)/i.test(video.url) && !hasUserinfo(video.url)) {
    parts.push(
      `video:\n <video width='640' height='360' controls> <source src=${video.url} type=video/mp4> </video>`,
    );
  }
  const href = dashboardUrl(video);
  if (href) {
    parts.push(
      `<a href="${href}" target="lt-session-video" rel="noopener noreferrer" `
      + `onclick="window.open(this.href,'lt-session-video','popup=yes,width=1024,height=640,scrollbars=yes,resizable=yes');return false;">`
      + 'Play session video</a>',
    );
  }
  return parts.join('\n');
}

module.exports = {
  getVideoList,
  getVideoId,
  downloadMp4,
  reportHtml,
};
