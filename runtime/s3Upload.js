/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard
 */
const path = require('path');
const fs = require('fs-extra');
const readdir = require('recursive-readdir');
const async = require('async');
const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * function to upload the test report folder to an s3 Bucket - AWS
 */
module.exports = {
  s3Upload: async () => {
    let envName = env.envName.toLowerCase();
    let date = require('./helpers').s3BucketCurrentDate();
    const browserName = global.remoteConfig || BROWSER_NAME;
    const rootFolder = path.resolve('./reports');
    const folderName = `${date}/${dataconfig.s3FolderName}/reports/`;
    const BUCKET = s3Data.S3_BUCKET;
    const S3_KEY = process.env.S3_KEY;
    const S3_SECRET = process.env.S3_SECRET;
    const uploadFolder = `./${browserName}/`;

    const s3Client = new S3Client({
      region: s3Data.S3_REGION,
      credentials: {
        accessKeyId: S3_KEY,
        secretAccessKey: S3_SECRET,
      },
    });

    async function sendWithRetry(command, actionLabel, maxAttempts = 3) {
      let lastError;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await s3Client.send(command);
        } catch (err) {
          lastError = err;
          const isLastAttempt = attempt === maxAttempts;
          console.error(`Error during ${actionLabel} (attempt ${attempt}/${maxAttempts}):`, err.message);
          if (isLastAttempt) {
            throw err;
          }
          await wait(attempt * 500);
        }
      }
      throw lastError;
    }

    async function mybucketList() {
      try {
        const data = await sendWithRetry(new ListBucketsCommand({}), 'list buckets');
        return data.Buckets; // For unit tests.
      } catch (err) {
        console.error('Error ', err.message);
      }
    }

    async function filesToRemove() {
      const filePath = rootFolder + '/' + browserName + '/' + envName;
      const filelist = fs.readdirSync(filePath);
      // console.log('this is the list of files ============> ', filelist);
      for (let i = 0; i < filelist.length; i++) {
        let filename = filelist[i];

        if (filename.endsWith('.html.json')) {
          fs.removeSync(path.resolve(filePath, filename));
        }
      }
    }

    let dirToRemove = rootFolder + '/' + browserName + '/' + envName + 'Combine';
    async function getFiles(dirPath) {
      if (await fs.existsSync(dirToRemove)) {
        await fs.rmSync(dirToRemove, { recursive: true });
      }
      return fs.existsSync(dirPath) ? readdir(dirPath) : [];
    }

    async function deploy(upload) {
      await filesToRemove();
      const filesToUpload = await getFiles(path.resolve(rootFolder, upload));
      await async.eachOfLimit(filesToUpload, 20, async (file) => {

	      const normalizedPath = file.replace(/\\/g, '/');

	      // Skip node_* worker artifacts
	      if (normalizedPath.includes('/node_')) {
		      console.log(`Skipping node artifact: [${normalizedPath}]`);
		      return;
	      }

        const Key = await file.replace(`${rootFolder}/`, '');
        console.log(`uploading: [${Key}]`);
        const uploadParams = {
          Bucket: BUCKET,
          Key: folderName + Key,
          Body: fs.readFileSync(file),
        };
        try {
          await sendWithRetry(new PutObjectCommand(uploadParams), `upload ${Key}`);
        } catch (err) {
          console.error('Error ', err.message);
        }
      });
    }
    const mybucket = await mybucketList();
    if (!mybucket || !Array.isArray(mybucket)) {
      console.error('Error ', 'Could not retrieve bucket list');
      return;
    }
    const bucketExists = mybucket.some((bucket) => bucket.Name === s3Data.S3_BUCKET);
    if (!bucketExists) {
      console.log('The s3 bucket does not exist');
      return;
    }
    try {
      await deploy(uploadFolder);
      console.log('Report files uploaded successfully to s3 Bucket');
    } catch (err) {
      console.error('Error ', err.message);
    }
  },
};
