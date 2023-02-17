/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
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
    console.log('this is the video link ', videoID);
    return videoID;
  },
};
