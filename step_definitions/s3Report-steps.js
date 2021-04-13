const s3File = require('../runtime/s3ReportProcessor');

Then(/^Compiling and sending the resulting test report data$/, async () => {
  /** process the files in s3 bucket and sends an email with all html links */
  await s3File.s3Processor();
});
