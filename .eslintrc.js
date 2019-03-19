'use strict';

// prettier.config.js or .prettierrc.js
module.exports = {
  
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  
  extends: [
    // 'eslint:recommended',
    'prettier',
    'plugin:prettier/recommended'
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
    ],
    'prettier/prettier': [
      2,
      'error',
      {
        singleQuote: true
      }
    ],
  },
  
  globals: {
    Given: true,
    When: true,
    Then: true,
    helpers:false,
    driver:false,
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
    DELAY_100_MILLISECOND: false,
    DELAY_200_MILLISECOND: false,
    DELAY_300_MILLISECOND: false,
    DELAY_500_MILLISECOND: false,
    DELAY_1_SECOND: true,
    DELAY_3_SECOND: true,
    DELAY_5_SECOND: false,
    DELAY_10_SECOND: false,
    DELAY_15_SECOND: false,
    DELAY_20_SECOND: false,
    noImplicitAny: true,
    noImplicitThis: true,
    strictNullChecks: true,
    strictFunctionTypes: false,
    baseUrl: './',
    noEmit: true,
    forceConsistentCasingInFileNames: true
  }
  
};