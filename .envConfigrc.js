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
module.exports = {
  /**
   * this is for your environment setups
   */
  environment: {
    dev: {
      envName: "DEVELOPMENT",
      web_url: "https://duckduckgo.com/",
      web_utam_url: "https://google.com/",
      siteBaseUrl: "https://test.account.oup.com",
      apiBaseUrl: "/api/",
      api_base_url: "http://httpbin.org/get",
      salesforceInstanceUrl:
        "https://oxforduniversitypressespaa-dev-ed.my.salesforce.com",
      mailinatorApiBaseUrl:
        "https://mailinator.com/api/v2/domains/public/inboxes",
    },

    test: {
      envName: "TEST",
      web_url: "https://duckduckgo.com/",
      web_utam_url: "https://google.com/",
      siteBaseUrl: "https://test.account.oup.com",
      apiBaseUrl: "/api/",
      api_base_url: "http://httpbin.org/get",
      salesforceInstanceUrl:
        "https://oxforduniversitypressespaa-dev-ed.my.salesforce.com",
      mailinatorApiBaseUrl:
        "https://mailinator.com/api/v2/domains/public/inboxes",
    },

    android: {
      envName: "android",
      appName: "oxford.learners.bookshelf.canary",
      appPath:
        "https://olb-android-release.s3-accelerate.amazonaws.com/test/olb-5.9.3-canary.apk",
    },

    ios: {
      envName: "ios",
      appName: "io.appium.TestApp",
      appPath: "http://appium.github.io/appium/assets/TestApp9.4.app.zip",
    },
  },
  //
  // dataConfig: {
  //   projectName: "klassi-js",
  //   s3FolderName: "klassi-js",
  //
  //   emailData: {
  //     nameList: "QaAutoTest <qaautotest@oup.com>",
  //     AccessibilityReport: "Yes",
  //     SES_REGION: "eu-west-1",
  //   },
  //
  //   s3Data:{
  //     S3_BUCKET: "test-app-automated-reports",
  //     S3_REGION: "eu-west-2",
  //     S3_DOMAIN_NAME: "http://test-app-automated-reports.s3.eu-west-2.amazonaws.com"
  //   }
  // },
};
