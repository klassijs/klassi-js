[![STAT](https://nodei.co/npm/klassi-cucumber-js.png?download=true)](https://nodei.co/npm/klassi-cucumber-js/)

# klassi-cucumber-js [![Run Status](https://api.shippable.com/projects/585832b28171491100bb123f/badge?branch=master)](https://app.shippable.com/projects/585832b28171491100bb123f) [![Build Status](https://travis-ci.org/larryg01/klassi-cucumber-js.svg?branch=master)](https://travis-ci.org/larryg01/klassi-cucumber-js)

  A platform independent debuggable BDD Javascript testing framework. It's simple, easy to use and not dependant to 
  any other tool or library. It's built with [nodeJs](https://nodejs.org/en/), [webdriver.io (the Selenium 2.0 
  bindings for NodeJS)](http://webdriver.io/) and [cucumber-js](https://github.com/cucumber/cucumber-js "view 
  cucumber js documentation") complete with integrated API Testing. 


## Installation

```bash
git-clone-ssh: git@github.com:larryg01/klassi-cucumber-js.git
git-clone-http: https://github.com/larryg01/klassi-cucumber-js.git
download: https://github.com/larryg01/klassi-cucumber-js/archive/development.zip
npm i klassi-cucumber-js 


# To run your test locally, you'll need a local selenium server running, you can install and
# launch a selenium standalone server with chrome, firefox and phantomjs drivers via the 
# following commands in a separate terminal:

npm install selenium-standalone@latest -g --save-dev
selenium-standalone install
selenium-standalone start
```

## Usage

```bash
# run 'npm install' in a terminal window from within the project folder
node ./node_modules/klassi-cucumber-js/index.js -s ./step-definitions
or
node index.js -d -t @search
```

### Options

```bash
-h, --help                   output usage information
-v, --version                output the version number
-s, --steps <path>           path to step definitions. defaults to ./step-definitions
-p, --pageObjects <path>     path to page objects. defaults to ./page-objects
-o, --sharedObjects [paths]  path to shared objects - repeatable. defaults to ./shared-objects
-b, --browser <path>         name of browser to use. defaults to chrome
-r, --reports <path>         output path to save reports. defaults to ./reports
-d, --disableTestReport [optional]  disables the test report from opening after test completion
-t, --tags <tagName>         name of tag to run
-c, --context <path>        contextual root path for project-specific features, steps, objects etc
-f, --featuresPath <path>   path to feature definitions. defaults to ./features
-e, --email [optional]      sends email reports to stakeholders
-n, --environment [<path>]  name of environment to run the framework/test in. default to dev
-g, --reportName [optional] basename for report files e.g. use report for report.json
-x, --extraSettings [optional]  further piped configs split with pipes
-w, --remoteService [optional]  which remote driver service, if any, should be used e.g. browserstack
```

By default tests are run using Google Chrome, to run tests using another browser supply the name of that browser along with the `-b` switch. Available options are:

| Browser | Example |
| :--- | :--- |
| Chrome | `-b chrome` |
| Firefox | `-b firefox` |

### Feature files

A feature file is a [Business Readable, Domain Specific Language](http://martinfowler.com/bliki/BusinessReadableDSL.html) file that lets you describe software’s behaviour without detailing how that behaviour is implemented. Feature files are written using the [Gherkin syntax](https://github.com/cucumber/cucumber/wiki/Gherkin) and must live in a folder named **features** within the root of your project.

```gherkin
duckDuckGo-search.feature

Feature: Searching for apps with duckduckgo
  As an internet user
  In order to find out more about certain user apps
  I want to be able to search for information about the required apps

  Background:
    Given The user arrives on the duckduckgo search page

  Scenario Outline: User inputs some search data
    When they input <searchword>
    Then they should see some results

    Examples:
      |searchword |
      |britian's got talent |
      |angry birds          |

```

The browser automatically closes after each scenario to ensure the next scenario uses a fresh browser environment.

### Step definitions

Step definitions act as the glue between features files and the actual system under test.

_To avoid confusion **always** return a JavaScript promise after your step definition in order to let cucumber know 
when your task has completed._

```javascript
// ./step-definitions/duckDuckGo-search-steps.js

  Then(/^they should see some results$/, function() {
     /** return the promise of an element to the following then */
     return page.duckDuckGoSearch.searchResult();
  });
```
The following variables are available within the ```Given()```, ```When()``` and ```Then()``` functions:

| Variable | Description |
| :--- | :---  |
| `driver`     | an instance of [web driver](http://webdriver.io/guide/services/selenium-standalone.html) (_the browser_) |
| `webdriverio`| the raw [webdriver](http://webdriver.io/api.html) module, providing access to static properties/methods |
| `page`       | collection of **page** objects loaded from disk and keyed by filename |
| `shared`     | collection of **shared** objects loaded from disk and keyed by filename |
| `helpers`    | a collection of [helper methods](runtime/helpers.js) _things webdriver.io does not provide but really should!_ |
| `expect`     | instance of [chai expect](http://chaijs.com/api/bdd/) to ```expect('something').to.equal('something')``` |
| `assert`     | instance of [chai assert](http://chaijs.com/api/assert/) to ```assert.isOk('everything', 'everything is ok')``` |
| `trace`      | handy trace method to log console output with increased visibility |
| `fs`         | exposes fs (file system) for use globally |
| `dir`        | exposes dir for getting an array of files, subdirectories or both |
| `request`    | exposes the request-promise for API testing | ```use for making API calls``` |
| `date`       | exposes the date method for logs and reports  |
| `log`        | exposes the log method for output to files and emailing  |
| `envConfig`  | exposes the global environment configuration file  | ```for use when changing environment types (i.e. dev, test, preprod)``` |


### Page objects

Page objects are accessible via a global ```page``` object and are automatically loaded from ```./page-objects``` _(or the path specified using the ```-p``` switch)_. Page objects are exposed via a camel-cased version of their filename, for example ```./page-objects/duckDuckGoSearch.js``` becomes ```page.duckDuckGoSearch```.

Page objects also have access to the same runtime variables available to step definitions.

An example page object:

```javascript
// ./page-objects/duckDuckGoSearch.js

module.exports = {

  /** test searching for inputted data
   */
  url: 'https://duckduckgo.com/',
    
  /** enters a search term into duckduckgo search box and presses enter
   * @param {string} searchWord
   * @returns {Promise} a promise to enter the search values
   */
  performSearch: async function (searchWord) {
    let selector = shared.searchData.elem.searchInput;
    await driver.click(selector).keys(searchWord);
      
    let title = await driver.getTitle(selector);
    log.info('this is the page title:- ' + title);
      
    await driver.click(shared.searchData.elem.searchBtn);
    log.info('Search function completed');
  },
};
```

And its usage within a step definition:

```js
// ./step-definitions/duckDuckGo-search-steps.js

  Given(/^The user arrives on the duckduckgo search page$/, function() {
     return helpers.loadPage(shared.searchData.url, 10);
  });
      
  When(/^they input (.*)$/, function(searchWord) {
     return page.duckDuckGoSearch.performSearch(searchWord);
  });
```

### CSS regression functionality with [webdriverCSS](https://github.com/webdriverio/webdrivercss)

Automatic visual regression testing, gives the ability to take and save fullpage screenshots or of specific parts of the application / page under test.

You will need to have GraphicsMagick preinstalled on your system because WebdriverCSS uses it for image processing. To install GraphicsMagick follow the [instructions here](https://github.com/webdriverio/webdrivercss#install) .

```js
// ./runtime/helpers.js

cssImages: async function(pageName){
  await driver.webdrivercss(pageName, {
    name: '',
    elem: ''
  })
}
```
And its usage within a step definition:

```js
  Then(/^they should see some results$/, async function() {
    /** return the promise of an element to the following then */
    await page.duckDuckGoSearch.searchResult();
     /** Take an image of the page under test */
    await helpers.cssImages('search');
  });
```
### API Testing functionality with [request-promise](https://github.com/request/request-promise)
Getting data from a JSON REST API
```js
// ./runtime/helpers.js
 getAPI: function (endpoint) {
    let endPoint = (endpoint);
    
    let options = {
        method: 'GET',
        url: endPoint,
        json: true,
        simple: false,
        resolveWithFullResponse: true,
    };
    
    return request(options)
    .then(function (response, err) {
        if (err) {
           // API call failed
        }
        // API call is successful
    });
 },
```

### Shared objects

Shared objects allow you to share anything from test data to helper methods throughout your project via a global ```shared``` object. Shared objects are automatically loaded from ```./shared-objects``` _(or the path specified using the ```-o``` switch)_ and made available via a camel-cased version of their filename, for example ```./shared-objects/test-data.js``` becomes ```shared.testData```.

Shared objects also have access to the same runtime variables available to step definitions.

An example shared object:

```javascript
// ./shared-objects/test-data.js

module.exports = {
  username: "import-test-user",
  password: "import-test-pa**word"
}
```

And its usage within a step definition:

```js
  Given(/^I am logged in"$/, function () {
    driver.setValue('usn', shared.testData.username);
    driver.setValue('pass', shared.testData.password);
  });
```

### Reports

HTML and JSON reports are automatically generated and stored in the default `./reports` folder. This location can be changed by providing a new path using the `-r` command line switch:

![Cucumber HTML report](runtime/img/cucumber-html-report.png)

### Event handlers

You can register event handlers for the following events within the cucumber lifecycle.

const {After, Before, AfterAll, BeforeAll} = require('cucumber');

| Event          | Example                                                     |
|----------------|-------------------------------------------------------------|
| Before    | ```Before(function() { // This hook will be executed before all scenarios}) ```  |
| After     | ```After(function() {// This hook will be executed after all scenarios});```    |
| BeforeAll | ```BeforeAll(function() {// perform some shared setup});``` |
| AfterAll  | ```AfterAll(function() {// perform some shared teardown});```  |

## How to debug

Most webdriverio methods return a [JavaScript Promise](https://spring.io/understanding/javascript-promises "view JavaScript promise introduction") that is resolved when the method completes. The easiest way to step in with a debugger is to add a ```.then``` method to a selenium function and place a ```debugger``` statement within it, for example:

```js
  When(/^I search DuckDuckGo for "([^"]*)"$/, function (searchQuery, done) {
    driver.element('#search_form_input_homepage').then(function(input) {
      expect(input).to.exist;
      debugger; // <<- your IDE should step in at this point, with the browser open
      return input;
    })
    .then(function(input){
       input.setValue(selector, searchQuery);
       input.setValue(selector, 'Enter');

       done(); // <<- let cucumber know you're done
    });
  });
```

## Default directory structure

You can use the framework without any command line arguments if your application uses the following folder structure:
```
.
├── features
│   └── duckDuckGo-search.feature
├── step_definitions
│   └── duckDuckGo-search-steps.js
├── page-objects
│   └── duckDuckGoSearch.js
└── shared-objects
│   ├── test-data.js
│   └── stuff.json
└── reports
    ├── cucumber-report.json
    └── cucumber-report.html
```

## Bugs

Please raise bugs via the [klassi-cucumber-js issue tracker](https://github.com/larryg01/klassi-cucumber-js/issues) and, if possible, please provide enough information to allow the bug to be 
reproduced.

## Contributing

Anyone can contribute to this project simply by [opening an issue here](https://github.com/larryg01/klassi-cucumber-js/issues) or fork the project and issue a pull request with suggested improvements. In lieu of a formal styleguide, please take care to maintain the existing coding style.

## Credits

[klassi-cucumber-js](https://github.com/larryg01/klassi-cucumber-js) was forked from [John Doherty's](https://www.linkedin.com/in/john-i-doherty), [selenium-cucumber-js](https://github.com/john-doherty/selenium-cucumber-js) and as of December 2016 it has been completely independent of the that project. Since the fork many changes and improvements have been made, most notably the complete switch from [selenium webdriver](https://github.com/SeleniumHQ/selenium) to [webdriverio](http://webdriver.io/) but still using the open development model without breaking the utilities operation.
 

## License

[MIT License](LICENSE) &copy; [Larry Goddard](https://uk.linkedin.com/in/larryg)
