/**
 klassi-js
 Copyright © 2016 - Larry Goddard
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
};
