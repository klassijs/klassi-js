/**
 * Klassi-js Automated Testing Tool
 * Created by Larry Goddard
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
