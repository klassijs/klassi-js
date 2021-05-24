<p align="center">
    <h1 align="center" font-size: 2.5em > klassi-js <br>
    <a href="https://github.com/larryg01/klassi-js/">
        <img alt="Klassi-Js" src="./runtime/img/klassiLogo.png">
    </a> </h1> </p>

<p align="center">
    <a href ="https://travis-ci.org/larryg01/klassi-js">
    <img alt="Build Status" src="https://travis-ci.org/larryg01/klassi-js.svg?branch=master">
    </a> 
    <a href="https://github.com/larryg01/klassi-js/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/larryg01/klassi-js">
    </a> 
    <a href="https://gitter.im/klassi-js/klassi-js">
    <img alt="Gitter" src="https://badges.gitter.im/klassi-js/klassi-js.svg">
    </a>
    <a href="https://webdriver.io/">
    <img alt="WebdriverIO" src="https://img.shields.io/badge/tested%20with-webdriver.io-%23ea5906">
    </a>
    <a href="https://webdriver.io/docs/api.html">
    <img alt="WebdriverIO" src="https://img.shields.io/badge/webdriverio-docs-40b5a4">
    </a> <br>
  klassi-Js is a debuggable BDD Javascript test automation framework. Built on [webdriver.io (the Selenium 2.0 bindings for NodeJS)](http://webdriver.io/) and [cucumber-js](https://github.com/cucumber/cucumber-js "view cucumber js documentation") with integrated Visual, accessibility and API Testing, your test can run locally or in the cloud using Lambdatest, BrowserStack or Sauce Labs 
</p>
 

## Installation

```bash
yarn add klassi-js
 
npm install klassi-js
```

## Usage

```bash
node ./node_modules/klassi-js/index.js # path to the module within your project
```

## Options

```bash
--help                              output usage information
--version                           output the version number
--browser <name>                    name of browser to use (chrome, firefox). defaults to chrome
--tags <@tagName>                   name of cucumber tags to run - Multiple TAGS usage
--steps <path>                      path to step definitions. defaults to ./step-definitions
--featureFiles <path>               path to feature definitions. defaults to ./features
--pageObjects <path>                path to page objects. defaults to ./page-objects
--sharedObjects <paths>             path to shared objects - repeatable. defaults to ./shared-objects
--reports <path>                    output path to save reports. defaults to ./reports
--disableReport                     disables the test report from opening after test completion
--email                             sends email reports to stakeholders
--env <path>                        name of environment to run the framework/test in. default to dev
--reportName <optional>             name of what the report would be called i.e. 'Automated Test'
--remoteService <optional>          which remote driver service, if any, should be used e.g. browserstack
--extraSettings <optional>          further piped configs split with pipes
--updateBaselineImages              automatically update the baseline image after a failed comparison or new images
--wdProtocol                        the switch to change the browser option from using devtools to webdriver
--closeBrowser <optional>           this closes the browser after each scenario, defaults to always, use 'no' if you want to want to keep the  browser open
```

## Directory Structure
To help with usage of the built in functionality, we have added a .envConfigrc.js file at the base of the project. You can check out the [template here](https://github.com/larryg01/klassi-test-suite)

```bash
.
└── features
    └── search.feature
└── page-objects
    └── search.js
└── shared-objects
    └── searchData.js
└── step_definitions
    └── search-steps.js
└── reports  # folder and content gets created automatically on test run
    └── chrome
        ├── reportName-01-01-1900-235959.html
        └── reportName-01-01-1900-235959.json
.envConfigrc.js # this file will contain all your environment variables #projectName, emailAddresses, environments, browserstack/lambdatest config
```

## Step definitions
The following variables are available within the ```Given()```, ```When()``` and ```Then()``` functions:

| Variable | Description |
| :--- | :---  |
| `browser`     | an instance of [webdriverio](https://webdriver.io/docs/setuptypes.html) (_the browser_) |
| `wdio`| the raw [webdriverio](https://webdriver.io/docs/api.html) module, providing access to static properties/methods |
| `pageObjects`       | collection of **page** objects loaded from disk and keyed by filename |
| `sharedObjects`     | collection of **shared** objects loaded from disk and keyed by filename |
| `helpers`    | a collection of [helper methods](runtime/helpers.js) _things webdriver.io does not provide but really should!_ |
| `expect`     | instance of [chai expect](https://www.chaijs.com/api/bdd/) to ```expect('something').to.equal('something')``` |
| `assert`     | instance of [chai assert](https://www.chaijs.com/api/assert/) to ```assert.isOk('everything', 'everything is ok')``` |
| `trace`      | handy trace method to log console output with increased visibility |
| `got`    | exposes the GOT subroutine for API testing | ```use for making API calls``` |


## Helpers
Klassi-js contains a few helper methods to help along the way, these methods are:
```js
// Load a URL, returning only when the <body> tag is present
await helpers.loadPage('https://duckduckgo.com', 10);

// take image for comparisson
await helpers.takeImage('flower_1-0.png', 'div.badge-link--serp.ddg-extension-hide.js-badge-link');

// compare taken image with baseline image
await helpers.compareImage('flower_1-0.png');

// get the content of an endpoint
await helpers.apiCall('http://httpbin.org/', 'get');

// writing content to a text file
await helpers.writeToTxtFile(filepath, output);

// reading content froma text file
await helpers.readFromFile(filepath);

// applying the current date to files
await helpers.currentDate();

// get current date and time (dd-mm-yyyy-00:00:00)
await helpers.getCurrentDateTime()

// clicks an element (or multiple if present) that is not visible, useful in situations where a menu needs a hover before a child link appears
await helpers.clickHiddenElement(selector, textToMatch)

// This method is useful for dropdown boxes as some of them have default 'Please select' option on index 0
await helpers.getRandomIntegerExcludeFirst(range)

// Get the href link from an element
await helpers.getLink(selector)

//wait until and element is visible and click it
await helpers.waitAndClick(selector)

// wait until element to be in focus and set the value
await helpers.waitAndSetValue(selector, value)

// function to get element from frame or frameset
await helpers.getElementFromFrame(frameName, selector)

// This will assert 'equal' text being returned
await helpers.assertText(selector, expected)

// This will assert text being returned includes
await helpers.expectToIncludeText(selector, expectedText)

// this asserts that the returned url is the correct one
await helpers.assertUrl(expected)
```

## Browser usage
By default, the test run using Google Chrome/devtools protocol, to run tests using another browser locally you'll need a local selenium server running, supply the browser name along with the `--wdProtocol --browser` switch

| Browser | Example |
| :--- | :--- |
| Chrome | `--wdProtocol --browser chrome` |
| Firefox | `--wdProtocol --browser firefox` |

All other browser configurations are available via 3rd party services (i.e. browserstack | lambdatest)

Selenium Standalone Server installation
```bash
yarn global add selenium-standalone@latest
selenium-standalone install && selenium-standalone start
```

## Visual Regression with [Resemble JS](https://github.com/rsmbl/Resemble.js)

Visual regression testing, the ability to compare a whole page screenshots or of specific parts of the application / page under test.
If there is dynamic content (i.e. a clock), hide this element by passing the selector (or an array of selectors) to the takeImage function.
```js
// usage within page-object file:
  await helpers.takeImage(fileName, [elementsToHide, elementsToHide]);
  await helpers.compareImage(fileName);
```

## API Testing with [got](https://github.com/sindresorhus/got#readme)
Getting data from a JSON REST API
```js
 function apiCall(url, method, auth, body, fileName, fileData, statusCode) {
    let endPoint = ('http://endpoint.com');

    let options = {
        url: endPoint,
        method: 'GET' || 'PUT' || 'POST' || 'DELETE',
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    };

    return gotApi(options)

    if ('GET') {
       return res;
    }
    if ('DELETE' && fileName != null || 'PUT' && fileName != null) {
        return fs.readFileSync(fileName, 'utf8');
    }
    if ('POST' && fileName != null) {
        return res.json().then(async function (res) {
          const data = await res.id;
          await fs.writeFileSync(fileName, data);
        });
    }
 }
```
## Accessibility Testing with [Axe](https://www.deque.com/axe/)
Automated accessibility testing feature has been introduced using the Axe-Core OpenSource library.

### Sample code
All the accessibility fuctions can be accessed through the global variable ``` accessibilityLib ```.
| function          | Description                                                     |
|----------------------------|-----------------------------------------------------------------|
| ``` accessibilityLib.getAccessibilityReport('PageName')```| generates the accessibility report with the given page name |
| ``` accessibilityLib.getAccessibilityError()``` | returns the total number of error count for a particular page. |
| ``` accessibilityLib.getAccessibilityTotalError() ``` | returns the total number of error count for all the pages in a particilar execution |

```js
// usage within page-object file:
When('I run the accesibility analysis for {string}', async function (PageName) {
  // After navigating to a particular page, just call the function to generate the accessibility report
  await accessibilityLib.getAccessibilityReport(PageName);
});

Then('there should not be any violation in the accessibility report', function () {
// This will return the total accessibility error count for a particular page.
let violationcount=accessibilityLib.getAccessibilityError();
assert.equal(violationcount, 0);
});
```

## Test Execution Reports

HTML and JSON reports will be automatically generated and stored in the default `./reports` folder. This location can be
 changed by providing a new path using the `--reports` command line switch:

![Cucumber HTML report](runtime/img/cucumber-html-report.png)

## Accessibility Report

HTML and JSON reports will be automatically generated and stored in the default `./reports/accessibility`  folder.This location can be changed by providing a new path using the `--reports` command line switch:

![Aceessibility HTML report](./runtime/img/accessibility-html-report.png)

## Event handlers

You can register event handlers for the following events within the cucumber lifecycle.

const {After, Before, AfterAll, BeforeAll, BeforeStep, AfterStep} = require('@cucumber/cucumber');

| Event          | Example                                                     |
|----------------|-------------------------------------------------------------|
| Before     | ```Before(function() { // This hook will be executed before all scenarios}) ```  |
| After      | ```After(function() {// This hook will be executed after all scenarios});```    |
| BeforeAll  | ```BeforeAll(function() {// perform some shared setup});``` |
| AfterAll   | ```AfterAll(function() {// perform some shared teardown});```  |
| BeforeStep | ```BeforeStep(function() {// This hook will be executed before all steps in a scenario with tagname;``` |
| AfterStep  | ```AfterStep(function() {// This hook will be executed after all steps, and take a screenshot on step failure;```  |

## How to debug

Most webdriverio methods return a [JavaScript Promise](https://spring.io/understanding/javascript-promises "view JavaScript promise introduction") that is resolved when the method completes. The easiest way to step in with a debugger is to add a ```.then``` method to the function and place a ```debugger``` statement within it, for example:

```js
  When(/^I search DuckDuckGo for "([^"]*)"$/, function (searchQuery, done) {
    elem = browser.$('#search_form_input_homepage').then(function(input) {
      expect(input).to.exist;
      debugger; // <<- your IDE should step in at this point, with the browser open
      return input;
    })
       done(); // <<- let cucumber know you're done
  });
```
## Demo
To demo the framework without installing it into your project use the following commands:
```js
 # download this example code
  git clone https://github.com/larryg01/klassi-js.git

 # browser to the new directory
  cd klassi-js

 # run the search feature
  yarn install
  node index.js --tags @search
```

## Bugs

Please raise bugs via the [klassi-js issue tracker](https://github.com/larryg01/klassi-js/issues), please provide enough information for bug reproduction.

## Contributing

Anyone can contribute to this project, PRs are welcome. In lieu of a formal styleguide, please take care to maintain the existing coding style.

## Credits

[John Doherty](https://www.linkedin.com/in/john-i-doherty)


## License

Licenced under [Apache License](LICENSE) &copy; 2016 [Larry Goddard](https://www.linkedin.com/in/larryg)
