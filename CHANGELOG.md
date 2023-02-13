# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 5.0.0 (2023-02-15)

### Features

* bumped the Node version requirements to v18.12.1
* upgraded to WebdriverIO v8
* upgraded to Cucumber v8
* automatic test skip using @wip, @skip or a custom tag
* dry run option added to validate that the code is correctly structured 
without actually asserting the business logic
* commit and branch linting implemented and integrated into the git hooks using Husky
* changelog automation implemented using standard-version


### Bug Fixes

* fixed the accessibility report implementation
* closeBrowser option changed to browserOpen 

### Refactors

* **CI:** refactored the S3 report scripts
* **Reports:** cucumber-html-reporter version changed to our own, and became owners of the project
* **s3:** changed the folder structure on the s3 bucket to (yyyy-mm-dd)
* envConfigrc file split into dataConfigrc and envConfigrc
