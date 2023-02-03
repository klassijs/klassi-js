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
const path = require('path');
const AWS = require('aws-sdk');
const fs = require('fs-extra');
const readdir = require('recursive-readdir');
const async = require('async');

/**
 * function to upload the test report run folder to an s3 - AWS
 */
module.exports = {
  s3Upload: async () => {
    const browserName = global.settings.remoteConfig || global.BROWSER_NAME;
    const folderName = `/${date}/${dataconfig.s3FolderName}/reports`;
    const BUCKET = s3Data.S3_BUCKET + folderName;
    const KEY = process.env.S3_KEY;
    const SECRET = process.env.S3_SECRET;

    const rootFolder = path.resolve('./reports');
    const uploadFolder = `./${browserName}`;

    const s3 = new AWS.S3({
      signatureVersion: 'v4',
      accessKeyId: KEY,
      secretAccessKey: SECRET,
    });

    function mybucketList() {
      return new Promise((resolve, reject) => {
        s3.listBuckets(function (err, data) {
          if (err) {
            console.log('Error', err);
          } else {
            let resp = data.Buckets;
            resolve(resp);
          }
        });
      });
    }
    function getFiles(dirPath) {
      return fs.existsSync(dirPath) ? readdir(dirPath) : [];
    }
    async function deploy(upload) {
      const filesToUpload = await getFiles(path.resolve(rootFolder, upload));
      return new Promise((resolve, reject) => {
        async.eachOfLimit(
          filesToUpload,
          30,
          async.asyncify(async (file) => {
            const Key = file.replace(`${rootFolder}/`, '');
            console.log(`uploading: [${Key}]`);
            return new Promise((res, rej) => {
              s3.upload(
                {
                  Key,
                  Bucket: BUCKET,
                  Body: fs.readFileSync(file),
                  ContentType: 'text/html',
                },
                async (err, data) => {
                  if (err) {
                    return rej(new Error(err));
                  }
                  res({ result: true });
                  if (data) {
                    const data1 = await data;
                  }
                }
              );
            });
          }),
          (err) => {
            if (err) {
              return reject(new Error(err));
            }
            resolve({ result: true });
          }
        );
      });
    }
    mybucketList().then((resp) => {
      const bucketExists = resp.some((bucket) => bucket.Name === s3Data.S3_BUCKET);
      if (!bucketExists) {
        console.log('the bucket does not exist');
        return;
      }
      deploy(uploadFolder)
        .then(() => {
          console.log('Files uploaded successfully, report folder pushed to s3');
        })
        .catch((err) => {
          console.error(err.message);
        });
    });
  },
};
