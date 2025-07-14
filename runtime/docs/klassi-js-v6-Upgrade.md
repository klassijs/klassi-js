# OAF v6.0.0 Upgrade Guide
#  Overview

This document provides a comprehensive guide to upgrading a project to OAF v6.0.0. The process involves updating assertion types, modifying how assertions are used, upgrading dependencies, and making necessary configuration changes.

By following this guide, you ensure that your project remains compatible with OAF v6.0.0 while maintaining best practices.

##  Assertion Types

OAF v6.0.0 introduces a structured set of assertion types that should be used for validation in your project. Documentation is here. Below is a complete list of valid assertion types:

Table : Valid Assertion Types

| Assertion Types | Assertion Types | Assertion Types | Assertion Types |
|:----------------|:----------------|:----------------|:----------------|
| equals          | tobeenabled     | tobeclickable   | isOK            |
| tohavetitle     | isNull          | toexist         | isArray         |
| contains        | tobeselected    | isTrue          | exists          |
| tohaveurl       | notExists       | match           | isdisabled      |
| doesexist       | tobechecked     | isenabled       | include         |
| tohavetext      | isUndefined     | tobeexisting    | equal           |
| doesnotexist    | tohavehtml      | isFalse         | tobedisplayed   |
| containstext    | isString        | lengthOf        | tobepresent     |
| isnotenabled    | tobefocused     | notEqual        | tobedisabled    |
| toNotEqual      | typeOf          | notInclude      | doesnotcontain  |


## Why Update Assertions?
OAF v6.0.0 introduces softAssert, which provides better error handling and allows test execution to continue even if an assertion fails. All failures will be shown/reported at the end of the test run.

#### Key Differences:

softAssert is now used instead of assert  
Assertion types must be passed as strings (e.g., 'isTrue', 'equal')  
The format improves readability and test maintainability

Old Format (Before Upgrade, in previous versions, assertions were written using assert):
```javascript
await assert.isTrue(await var1.includes(testData.errorMessage.invalidISBN));

await assert.equal(await elem.getText(), testData.userRole.editorRole);
```
New Format (After Upgrade to OAF v6.0.0, assertions should be written using softAssert):
```javascript
await softAssert(await var1.includes(testData.errorMessage.invalidISBN), 'isTrue');

await softAssert(await elem.getText(), 'equal', testData.userRole.editorRole);
```

# Visual-Validation Usage Updates
### Why Update Visual Validation?

OAF v6.0.0 upgrades visual-validation, which provides better error handling and allows test execution to continue even if an image validation fails. There is no update needed for existing code base its just works out of the box. All failures will be shown / reported at the end of the test run.


# Project Upgrade Steps
### Create a New Branch

Before making any changes, create a new branch from develop to manage the upgrade process.

Commands:

```javascript
git checkout develop

git pull origin develop

git checkout -b upgrade-oaf-v6
```

This ensures that your changes are isolated and do not affect the main development branch until they are fully tested and reviewed.

### Remove Outdated Files

Certain files need to be deleted before proceeding with the upgrade:

```javascript
rm -rf yarn.lock node_modules .eslintrc
```
Why?


yarn.lock: Removing this ensures fresh dependencies are installed.  
node_modules: Deleting this prevents conflicts with older versions.  
.eslintrc: The linting configuration might be outdated and needs to be refreshed.  


### Updating package.json

The package.json file should be updated to include the latest dependencies and scripts required for OAF v6.0.0. you can just copy the package.json from oaf-example-project taking care to make a note of dependencies that you are using in your project that’s not a part of OAF 

Key Changes:

Update dependencies and scripts to match oaf-example-project.

Add new contributors if applicable.

```json

"version": "6.0.0",
  "license": "MIT",
  "creator": {
  "name": "Larry Goddard",
    "email": "larryg@klassitech.co.uk",
    "linkedin": "https://linkedin.com/in/larryg",
    "youtube": "https://youtube.com/@LarryG_01"
},

"engines": {
  "node": ">=20",
    "pnpm": ">=9"
},

"scripts": {
  "dev": "node ./node_modules/OAF/index.js --disableReport --tags",
    "ltlocal": "node ./node_modules/OAF/index.js --disableReport --remoteService lambdatest --extraSettings",
    "predev": "pnpm delete-dev",
    "delete-dev": "rimraf ./reports ./artifacts ./visual-regression-baseline eng.traineddata",
    "============================================": "=======================================================",
    "================ NOTE": "PLEASE DO NOT MAKE ANY CHANGES TO THE SCRIPTS BELOW THIS LINE ================",
    "===========================================": "========================================================",
    "preinstall": "npx only-allow pnpm",
    "pkgcheck": "pnpm install --frozen-lockfile",
    "lint": "pnpm lint-staged && pnpm lint:gherkin",
    "lint:gherkin": "gherkin-lint -c node_modules/OAF/runtime/coding-standards/gherkin/gherkin-lint.json '**/*.feature'",
    "lint-branch-name": "pnpm branch-name-lint ./branchnamelinter.config.json",
    "ciltuat": "node ./node_modules/OAF/index.js --disableReport --isCI --tags @regression --remoteService lambdatest --extraSettings",
    "ciltdev": "node ./node_modules/OAF/index.js --disableReport --isCI --tags @integration --remoteService lambdatest --extraSettings",
    "cilts3r": "node ./node_modules/OAF/index.js --disableReport --tags @s3 --remoteService lambdatest --extraSettings",
    "cilts3load": "node ./node_modules/OAF/index.js --disableReport --tags @s3load --remoteService lambdatest --extraSettings"
},

"dependencies": {
  "OAF": "github:OUP/OAF#develop",
    "klassijs-astellen": "^1.0.0",
    "klassijs-soft-assert": "^1.2.1"
},

"devDependencies": {
  "@commitlint/cli": "^19.8.0",
    "@commitlint/config-conventional": "^19.8.0",
    "branch-name-lint": "^2.1.1",
    "gherkin-lint": "^4.2.4",
    "husky": "^9.1.7",
    "lint-staged": "^15.5.0",
    "rimraf": "^6.0.1"
},

"lint-staged": {
  "**/*.js": "eslint --quiet --fix --config node_modules/OAF/runtime/coding-standards/eslint/eslint.config.js"
}
```

Ensure All Dependencies Are Installed  
If you have any additional dependencies, ensure they are re-added.

Example:  
"form-data": "^4.0.2"

### Updating branchnamelinter.config.json

Ensure the file enforces proper branch naming conventions.

New Configuration

```json
    {
      "branchNameLinter": {
        "prefixes": [
          "testfix",
          "automation",
          "feature"
        ],
        "suggestions": {
          "fix": "testfix",
          "auto": "automation",
          "feat": "feature"
        },
        "disallowed": [
          "master",
          "main",
          "develop",
          "staging"
        ],
        "separator": "/",
        "msgBranchBanned": "Branches with the name \"%s\" are not allowed.",
        "msgBranchDisallowed": "Pushing to \"%s\" is not allowed, use git-flow.",
        "msgPrefixNotAllowed": "Branch prefix \"%s\" is not allowed.",
        "msgPrefixSuggestion": "Instead of \"%s\" try \"%s\".",
        "msgseparatorRequired": "Branch \"%s\" must contain a separator \"%s\"."
      }
    }
```
This helps maintain consistency in branch naming and avoids using restricted branch names.


### Updating .gitigmore

Ensure the .gitignore file includes all necessary exclusions:

```gitignore
# Dependency directories
node_modules
log

# Files and Directory
# project folders
reports
artifacts

# IntelliJ project files
.idea
.DS_Store
out
gen

# vscode files
.vscode

# Logs
pnpm-debug.log*

# dotenv environment variables file
.env
.env.*

# OCR file
eng.traineddata
```

This prevents unnecessary files from being committed to the repository.

### Updating Husky Hooks (.husky folder)

Husky helps enforce code quality by running checks before committing.

Commit Message Hook (commit-msg)

```sh
#!/usr/bin/env sh
npx --no -- commitlint --edit "${1}"
pnpm lint-branch-name
```

Pre-Commit Hook (pre-commit)
```sh
#!/usr/bin/env sh
pnpm lint
```

These scripts ensure commits follow proper formatting and branch names comply with naming rules.

### Updating CircleCI Configuration 

Replace .circleci/config.yml with the latest version from:  
please make a note of your project cron job time and replace 'projectName' with your project GitHub name.
```shell
OAF/oaf-example-project/.circleci/config.yml (develop branch)
```
This ensures that the CI/CD pipeline remains up to date.

### Updating LambdaTest Browser Versions 
Update the browser versions in the browser configuration file with the latest-2 version number (NOTE: use actual numbers i.e '132' and not 'latest-2')
```shell
Ensure to update the browser versions to the latest-2 in the folder.  

cp -r OAF/oaf-example-project/lambdatest ./lambdatest 
```
### Upgrading Node.js Version 

Ensure your project is using the required Node.js version:
```shell
node -v
```
If needed, install and use the correct version:  
nvm install 20  
nvm use 20  

### Installing Dependencies

Once all changes have been made, install dependencies:
```shell
pnpm install
```
This ensures all required packages are properly set up.

### Running the Updated Project

Local Execution  
Run the project locally using:
```shell
pnpm dev @tagname
```
LambdaTest Execution  
To run tests in LambdaTest:
```shell
pnpm ltlocal browserName --tags @tagName
```


### Assertion upgrades

This will take a while so it can be done over time, please go back to Point 2 and follow the instructions there. Read the README for [klassijs-soft-assert](https://github.com/klassijs/klassijs-soft-assert) so you can update all your assertions in your existing code.



### NOTE:

By following this structured guide, your project will be successfully upgraded to OAF v6.0.0.  
This ensures improved assertion handling, an optimized test framework, and a well-maintained codebase.  
For any issues, compare your changes with [oaf-example-project](https://github.com/OUP/oaf-example-project) or seek help from the contributors. 
