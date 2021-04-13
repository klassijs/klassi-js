/**
 Klassi Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2016 - Larry Goddard <larryg@klassitech.co.uk>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

module.exports = {
    /**
     * this is for your environment setups
     */
    "environment": {
        "dev": {
            "envName": "DEVELOPMENT",
            "web_url": "https://duckduckgo.com/",
            "api_base_url": "http://httpbin.org/"
        },

        "test": {
            "envName": "TEST",
            "web_url" :"https://duckduckgo.com/",
            "api_base_url": "http://httpbin.org/"
        },

        "uat": {
            "envName": "UAT",
            "web_url": ""
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
         *  if you are using Browserstack
         */
        "bslocal": {
            "localIdentifier": "",
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
