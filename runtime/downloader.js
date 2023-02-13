/**
 * OUP Automated Testing Tool
 * Created by Larry Goddard
 */
const fs = require('fs');
const request = require('got');

module.exports = {
  /**
   * Download functionality and logic for all file types
   * @param url, @param dest, @param cb
   * @param dest
   * @param cb
   */
  fileDownload(url, dest, cb) {
    const file = fs.createWriteStream(dest);
    const sendReq = request.get(url);
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
