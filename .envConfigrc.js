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
    "environment": {
        "dev": {
            "envName": "DEVELOPMENT",
            "web_url": "https://duckduckgo.com/",
            "web_utam_url": "https://google.com/",
            "api_base_url": "http://httpbin.org/get"
        },

        "test": {
            "envName": "TEST",
            "web_url" :"https://duckduckgo.com/",
            "web_utam_url" :"https://google.com/",
            "api_base_url": "http://httpbin.org/get"
            // "api_base_url": "http://ip-api.com/json"
        },

        "uat": {
            "envName": "UAT",
            "web_url": ""
        },

        "android": {
            "envName": "android",
            "appName": "oxford.learners.bookshelf.canary",
            "appPath": "https://olb-android-release.s3-accelerate.amazonaws.com/test/olb-5.9.3-canary.apk"
        },

        "ios": {
            "envName": "ios",
            "appName": "io.appium.TestApp",
            "appPath": "http://appium.github.io/appium/assets/TestApp9.4.app.zip"
        }
    },

    "dataConfig": {
        "projectName": "Klassi Automated Test",

        "emailData": {
            "nameList": 'QaAutoTest <test@test.com>',
            "AccessibilityReport": "Yes"
        },

        /**
         *  if you are using lambdatest
         */
        "ltlocal": {
            "userName": "",
            "accessKey": ""
        },

        /**
         * if you are using AWS for storing and processing reports
         * else this can be deleted
         */
        "awsConfig": {
            "s3FolderName": "", // This must match your Github Repo Name exactly (minus the .git)
            "ID": "",
            "SECRET": "",
            "REGION": "",
            "BUCKET_NAME": "",
            "DOMAIN_NAME": ""
        },

    },
}
