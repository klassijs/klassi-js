<p align="center">
    <h1 align="center" font-size: 2.5em > klassi-js <br>
    <a href="https://github.com/klassijs/klassi-js/">
        <img alt="Klassi-Js" src="./runtime/img/klassiLogo.png">
    </a> </h1> </p>

<p align="center">
    <a href="https://github.com/klassijs/klassi-js/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/klassijs/klassi-js">
    </a> 
    <a href="https://gitter.im/klassijs/klassi-js">
    <img alt="Gitter" src="https://badges.gitter.im/klassijs/klassi-js.svg">
    </a>
    <a href="https://webdriver.io/">
    <img alt="WebdriverIO" src="https://img.shields.io/badge/tested%20with-webdriver.io-%23ea5906">
    </a>
    <a href="https://webdriver.io/docs/api.html">
    <img alt="WebdriverIO" src="https://img.shields.io/badge/webdriverio-docs-40b5a4">
    </a> <br>
klassi-Js is a debuggable BDD (Behavior-Driven Development) JavaScript test automation framework, Built on <a href="http://webdriver.io/"> webdriver.io <a/> (Next-gen browser and mobile automation test framework for Node.js)</a> and <a href="https://github.com/cucumber/cucumber-js"> cucumber-js </a> and distinguished by its integration of AI for advanced debugging functionalities. This incorporation of artificial intelligence elevates the framework's capabilities, providing a streamlined and efficient approach to test automation.
</p>
 

## Installation

```bash
yarn add klassi-js
 
npm install klassi-js
```

## Usage

```bash
node ./node_modules/klassi-js/index.js
```

## Options

```bash
--help                              output usage information
--version                           output the version number
--browser <name>                    name of browser to use (chrome, firefox). defaults to chrome
--tags <@tagName>                   name of cucumber tags to run - Multiple TAGS usage (@tag1,@tag2)
--exclude <@tagName>                name of cucumber tags to exclude - Multiple TAGS usage(@tag3,@tag5)
--steps <path>                      path to step definitions. defaults to ./step-definitions
--featureFiles <path>               path to feature definitions. defaults to ./features
--pageObjects <path>                path to page objects. defaults to ./page-objects
--sharedObjects <paths>             path to shared objects - repeatable. defaults to ./shared-objects
--reports <path>                    output path to save reports. defaults to ./reports
--env <path>                        name of environment to run the framework/test in. default to dev
--reportName <optional>             name of what the report would be called i.e. 'Automated Test'

```
## Options Usage
```bash
  --tags @tagName || will execute the scenarios tagged with the values provided.
  --featureFiles features/example.feature,features/example1.feature || provide specific feature files containing the scenarios to be executed. If multiple are necessary, separate them with a comma (no blank space in between).
```

## Directory Structure
You can use the framework without any command line arguments if your application uses the following folder structure, to help with the built in functionality usage.

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
└── reports  # folder and content gets created automatically at runtime
    └── chrome
        ├── reportName-01-01-1900-235959.html
        └── reportName-01-01-1900-235959.json
.envConfigrc.js # this file will contain all your environment variables (i.e. dev, test, prod etc.,)
.dataConfigrc.js # this file will contain all your project variables #projectName, emailAddresses
.env # this file contains all config username and passcode and should be listed in the gitignore file
cucumber.js # the cucumber configuration file
```

## Step definitions
The following variables are available within the ```Given()```, ```When()``` and ```Then()``` functions:

| Variable | Description |
| :--- | :---  |
| `browser`     | an instance of [webdriverio](https://webdriver.io/docs/setuptypes.html) (_the browser_) |
| `pageObjects`       | collection of **page** objects loaded from disk and keyed by filename |
| `sharedObjects`     | collection of **shared** objects loaded from disk and keyed by filename |
| `helpers`    | a collection of [helper methods](runtime/helpers.js) _things webdriver.io does not provide but really should!_ |
| `expect`     | instance of [chai expect](https://www.chaijs.com/api/bdd/) to ```expect('something').to.equal('something')``` |
| `assert`     | instance of [chai assert](https://www.chaijs.com/api/assert/) to ```assert.isOk('everything', 'everything is ok')``` |
| `trace`      | handy trace method to log console output with increased visibility |


## Helpers
Klassi-js contains a few helper methods to help along the way, these methods are:
```js
// Load a URL, returning only when the <body> tag is present
await helpers.loadPage('https://duckduckgo.com', 10);

// writing content to a text file
await helpers.writeToTxtFile(filepath, output);

// reading content froma text file
await helpers.readFromFile(filepath);

// applying the current date to files
await helpers.currentDate();

// get current date and time (dd-mm-yyyy-00:00:00)
await helpers.getCurrentDateTime();

// clicks an element (or multiple if present) that is not visible, useful in situations where a menu needs a hover before a child link appears
await helpers.clickHiddenElement(selector, textToMatch);

// Get the href link from an element
await helpers.getLink(selector);

//wait until and element is visible and click it
await helpers.waitAndClick(selector);

// wait until element to be in focus and set the value
await helpers.waitAndSetValue(selector, value);

// function to get element from frame or frameset
await helpers.getElementFromFrame(frameName, selector);

//Sorts results by date
await helpers.sortByDate();

//this filters an item from a list of items
await helpers.filterItem();

//this filters an item from a list of items and clicks on it
await helpers.filterItemAndClick();

//this uploads a file from local system or project folder. Helpful to automate uploading a file when there are system dialogues exist.
await helpers.fileUpload();
```

## Test Execution Reports

HTML and JSON reports will be automatically generated and stored in the default `./reports` folder. This location can be
 changed by providing a new path using the `--reports` command line switch:

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
To see a demo of the framework without installing it, use this link [HERE](https://github.com/klassijs/klassi-example-test-suite)

## Bugs

Please raise bugs via the [klassi-js issue tracker](https://github.com/klassijs/klassi-js/issues), please provide enough information for bug reproduction.

## Contributing

Anyone can contribute to this project, PRs are welcome. In lieu of a formal styleguide, please take care to maintain the existing coding style.

## Credits

[John Doherty](https://www.linkedin.com/in/john-i-doherty)


## License

Licenced under [MIT License](LICENSE) &copy; 2016 [Larry Goddard](https://www.linkedin.com/in/larryg)
