const js = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');
const pluginImport = require('eslint-plugin-import');

module.exports = [
  js.configs.recommended,
  {
    plugins: {
      import: require('eslint-plugin-import'),
      prettier: require('eslint-plugin-prettier'),
    },

    rules: Object.assign(
      {},
      js.configs.recommended.rules,
      prettierConfig.rules,
      pluginImport.configs.errors.rules,
      pluginImport.configs.warnings.rules,
      {
        'prettier/prettier': [
          'warn',
          {
            singleQuote: true,
            printWidth: 120,
            endOfLine: 'auto',
          },
        ],
        'no-const-assign': 'warn',
        'no-this-before-super': 'warn',
        'no-undef': 'warn',
        'no-unreachable': 'warn',
        'no-unused-vars': 'warn',
        'constructor-super': 'warn',
        'valid-typeof': 'warn',
        'no-console': [0, 'error'],
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        indent: ['error', 2, { SwitchCase: 1 }],
        semi: ['error', 'always'],
        quotes: ['error', 'single'],
      },
    ),

    languageOptions: {
      ecmaVersion: 'latest', // Use latest ECMAScript version
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          dynamicImport: true,
        },
      },
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Given: true,
        When: true,
        Then: true,
        BeforeStep: true,
        After: true,
        AfterAll: true,
        AfterStep: true,
        helpers: true,
        browser: true,
        env: true,
        date: true,
        dateTime: true,
        startDateTime: true,
        endDateTime: true,
        browserName: true,
        BROWSER_NAME: true,
        reportName: true,
        projectName: true,
        settings: true,
        Status: true,
        envConfig: true,
        assert: true,
        expect: true,
        console: true,
        require: true,
        process: true,
        module: true,
        global: true,
      },
    },
  },
  {
    files: ['index.js'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];
