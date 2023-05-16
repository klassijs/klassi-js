/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const fs = require('fs-extra');
const path = require('path');
const reporter = require('klassijs-cucumber-html-reporter');
const jUnit = require('cucumber-junit');
const pactumJs = require('pactum');

const getRemote = require('../getRemote');
const remoteService = getRemote(settings.remoteService);
const browserName = settings.remoteConfig || BROWSER_NAME;

let resp;
let obj;

module.exports = {
  ipAddr: async () => {
    const endPoint = 'http://ip-api.com/json';
    resp = await pactumJs.spec().get(endPoint).toss();
    await resp;
  },

  async reporter() {
    const envName = env.envName.toLowerCase();
    try {
      await this.ipAddr();
      obj = await resp.body;
    } catch (err) {
      obj = {};
      console.log('IpAddr func err: ', err.message);
    }

    if (paths.reports && fs.existsSync(paths.reports)) {
      let jsonDir = path.resolve(paths.reports, browserName, envName);
      let jsonComDir = path.resolve(paths.reports, browserName, envName + 'Combine');

      global.endDateTime = helpers.getEndDateTime();

      const reportOptions = {
        theme: 'hierarchy',
        jsonDir: jsonComDir,
        output: path.resolve(paths.reports, browserName, envName, `${reportName}-${dateTime}.html`),
        reportSuiteAsScenarios: true,
        launchReport: !settings.disableReport,
        ignoreBadJsonFile: true,
        metadata: {
          'Test Started': startDateTime,
          Environment: env.envName,
          IpAddress: obj.query,
          Browser: browserName,
          Location: `${obj.city} ${obj.regionName}`,
          Platform: process.platform,
          'Test Completion': endDateTime,
          Executed: remoteService && remoteService.type === 'lambdatest' ? 'Remote' : 'Local',
        },
        brandTitle: `${reportName} ${dateTime}`,
        name: `${projectName} ${browserName} ${envName}`,
      };
      await browser.pause(DELAY_3s);
      // eslint-disable-next-line no-undef
      if (!isCI) {
        await fs.copySync(jsonDir, jsonComDir);
        await browser.pause(DELAY_1s);
        await reporter.generate(reportOptions);
      }
      /** grab the file data for xml creation */
      let jsonFile = path.resolve(paths.reports, browserName, envName, `${reportName}-${dateTime}.json`);
      const reportRaw = fs.readFileSync(jsonFile).toString().trim();
      // eslint-disable-next-line ui-testing/missing-assertion-in-test
      const xmlReport = jUnit(reportRaw);
      const junitOutputPath = path.resolve(
        path.resolve(paths.reports, browserName, envName, `${reportName}-${dateTime}.xml`)
      );
      fs.writeFileSync(junitOutputPath, xmlReport);
    }
  },
};
