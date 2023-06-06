# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [5.2.0](https://github.com/klassijs/klassi-js/compare/v5.0.0...v5.2.0) (2023-06-06)


### Features

* added new features and refactor s3Upload ([c53736d](https://github.com/klassijs/klassi-js/commit/c53736d5d9ae1c805cc9b985a9eb6657bf762fa5))
* added new features and refactor s3Upload ([5aaa175](https://github.com/klassijs/klassi-js/commit/5aaa1750e2f6cb605914f78d269e58e429f10815))


### Bug Fixes

* added the necessary files needed for the upgrade ([97226b7](https://github.com/klassijs/klassi-js/commit/97226b79526fdf47994943926842aa0c17d806e0))
* minor refactoring remove test folders ([38facee](https://github.com/klassijs/klassi-js/commit/38facee9f8e84ba1ced55bf12aa01c61ace4dcb0))
* updated helper and mailer files ([0ea021b](https://github.com/klassijs/klassi-js/commit/0ea021b854e5ce0d5979f9dac5e371a25e02dcf0))

## 5.0.0 (2023-03-13)

### Features

* **Automatic changelog:** changelog creation automated using standard-version
* **AWS v3 upgrade:** upgrading s3upload and s3reportProcessor
* bumped the Node version requirements to v18.12.1
* upgraded to WebdriverIO v8
* upgraded to Cucumber v8
* automatic test skip using @wip, @skip or a custom tag
* dry run option added to validate that the code is correctly structured 
without actually asserting the business logic
* commit and branch linting implemented and integrated into the git hooks using Husky
* changelog automation implemented using standard-version


### Bug Fixes


* **Automatic Changelog:** updated the commit url in the versionrc
* **Feature files:** fixed implementation of --featureFiles using cucumber.js file
* Changed the package URLs to make them compatible with Windows (whether SSH or HTTPS)
* Added two Windows-specific rules to ESLint config
* fixed the accessibility report implementation
* closeBrowser option changed to browserOpen 

### Refactors

* **CI:** refactored the S3 report scripts
* **Reports:** cucumber-html-reporter version changed to our own, and became owners of the project
* **s3:** changed the folder structure on the s3 bucket to (yyyy-mm-dd)
* envConfigrc file split into dataConfigrc and envConfigrc
