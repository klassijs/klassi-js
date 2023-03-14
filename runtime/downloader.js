/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const fs = require('fs');

module.exports = {
  /**
   * Download functionality and logic for all file types
   * @param url, @param dest, @param cb
   * @param dest
   * @param cb
   */
  fileDownload: async (url, dest, cb) => {
    const file = fs.createWriteStream(dest);
    const sendReq = await helpers.apiCall(url, 'GET', null, null);
    /**
     * verify response code
     */
    // eslint-disable-next-line consistent-return
    sendReq.on('response', (response) => {
      if (response.statusCode !== 200) {
        return cb(`Response status was ${response.statusCode}`);
      }
    });
    /**
     * check for request errors
     */
    // eslint-disable-next-line consistent-return
    sendReq.on('error', (err) => {
      fs.unlink(dest);

      if (cb) {
        return cb(err.message);
      }
    });

    sendReq.pipe(file);

    file.on('finish', () => {
      file.close(cb); // close() is async, call cb after close completes.
    });

    // eslint-disable-next-line consistent-return
    file.on('error', (err) => {
      // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)

      if (cb) {
        return cb(err.message);
      }
    });
  },
};
