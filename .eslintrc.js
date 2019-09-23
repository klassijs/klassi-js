'use strict';

module.exports = {
  
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  
  extends: [
    'eslint:recommended',
  ],
  
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    ecmaFeatures: {
      'jsx': true
    }
  },
  
  rules: {
    indent: [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    quotes: [
      'error',
      'single'
    ],
    semi: [
      'error',
      'always'
    ],
    'no-console': [
      0,
      'error'
    ],
    exclude: [
      '../node_modules',
      'log',
      'features',
      'reports',
      'artifact'
    ],
    files: [
      './globals.d.ts'
    ]
  },
  
  globals: {
    Given: true,
    When: true,
    Then: true,
    helpers:false,
    driver:false,
    browser: false,
    log: false,
    date: false,
    startDateTime: false,
    endDateTime: false,
    browserName: false,
    reportName: false,
    projectName: false,
    settings: false,
    envConfig: true,
    request: true,
    assert: true,
    expect: true,
    shared: true,
    gotApi: true,
    DELAY_100ms: false,
    DELAY_200ms: false,
    DELAY_300ms: false,
    DELAY_500ms: false,
    DELAY_1s: false,
    DELAY_2s: false,
    DELAY_3s: false,
    DELAY_5s: false,
    DELAY_10s: false,
    DELAY_15s: false,
    DELAY_20s: false,
    noImplicitAny: true,
    noImplicitThis: true,
    strictNullChecks: true,
    strictFunctionTypes: false,
    baseUrl: './',
    noEmit: true,
    forceConsistentCasingInFileNames: true
  }
  
};