/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const fs = require('fs');
const path = require('path');
const reporter = require('cucumber-html-reporter');
const jUnit = require('cucumber-junit');
const pactumJs = require('pactum');
const getRemote = require('../getRemote');

const remoteService = getRemote(settings.remoteService);
const browserName = settings.remoteConfig || BROWSER_NAME;

let resp;
let obj;

module.exports = {
  ipAddr: async () => {
    const endPoint = 'http://ip-api.com/json/';
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

    let jsonFile = path.resolve(paths.reports, browserName, envName, `${reportName}-${dateTime}.json`);

    if (paths.reports && fs.existsSync(paths.reports)) {
      global.startDateTime = helpers.getStartDateTime();
      global.endDateTime = helpers.getEndDateTime();

      const reportOptions = {
        theme: 'hierarchy',
        jsonFile,
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
        name: `${projectName} ${browserName} ${env.envName}`,
      };
      await browser.pause(DELAY_3s);
      await reporter.generate(reportOptions);

      /** grab the file data for xml creation */
      const reportRaw = fs.readFileSync(jsonFile).toString().trim();
      const xmlReport = jUnit(reportRaw);
      const junitOutputPath = path.resolve(
        path.resolve(paths.reports, browserName, envName, `${reportName}-${dateTime}.xml`)
      );
      fs.writeFileSync(junitOutputPath, xmlReport);
    }
  },
};
