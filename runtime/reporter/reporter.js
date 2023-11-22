/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const fs = require('fs-extra');
const path = require('path');
const reporter = require('klassijs-cucumber-html-reporter');
const browserName = settings.remoteConfig || BROWSER_NAME;

module.exports = {

  async reporter() {
    const envName = env.envName.toLowerCase();

    if (paths.reports && fs.existsSync(paths.reports)) {
      let jsonDir = path.resolve(paths.reports, browserName, envName);
      global.startDateTime = helpers.getStartDateTime();
      global.endDateTime = helpers.getEndDateTime();

      const reportOptions = {
        theme: 'simple',
        jsonDir: jsonDir,
        output: path.resolve(paths.reports, browserName, envName, `${reportName}-${dateTime}.html`),
        reportSuiteAsScenarios: true,
        launchReport: !settings.disableReport,
        ignoreBadJsonFile: true,
        metadata: {
          'Test Started': startDateTime,
          Environment: env.envName,
          Browser: browserName,
          Platform: process.platform,
          'Test Completion': endDateTime,
        },
        brandTitle: `${reportName} ${dateTime}`,
        name: `${projectName} ${browserName} ${envName}`,
      };
      await browser.pause(DELAY_2s);
      await reporter.generate(reportOptions);
    }
  },
};
