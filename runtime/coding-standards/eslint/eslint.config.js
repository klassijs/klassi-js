const js = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,

  {
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },

    rules: {
      // Merge import plugin recommended rule sets
      ...(importPlugin.configs.errors?.rules ?? {}),
      ...(importPlugin.configs.warnings?.rules ?? {}),

      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          printWidth: 120,
          endOfLine: 'auto',
        },
      ],

      // custom rules
      'no-const-assign': 'error',
      'no-this-before-super': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-vars': 'warn',
      'constructor-super': 'error',
      'valid-typeof': 'error',
      'no-console': 'off',

      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      indent: ['error', 2, { SwitchCase: 1 }],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },

    languageOptions: {
      ecmaVersion: 'latest',
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
        And: true,
        But: true,
        After: true,
        AfterAll: true,
        AfterStep: true,
        Before: true,
        BeforeAll: true,
        BeforeStep: true,
        helpers: true,
        browser: true,
        env: true,
        isCI: true,
        date: true,
        dateTime: true,
        startDateTime: true,
        endDateTime: true,
        sharedObjects: true,
        pageObjects: true,
        accessibilityLib: true,
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
        DELAY_100ms: true,
        DELAY_200ms: true,
        DELAY_300ms: true,
        DELAY_500ms: true,
        DELAY_750ms: true,
        DELAY_1s: true,
        DELAY_2s: true,
        DELAY_3s: true,
        DELAY_5s: true,
        DELAY_7s: true,
        DELAY_8s: true,
        DELAY_10s: true,
        DELAY_15s: true,
        DELAY_20s: true,
        DELAY_30s: true,
        DELAY_40s: true,
        DELAY_1m: true,
        DELAY_2m: true,
        DELAY_3m: true,
        dataconfig: true,
        fs: true,
        __dirname: true,
        cucumberThis: true,
      },
    },
  },

  {
    files: ['index.js'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },

  // disable conflicting ESLint formatting rules:
  prettierConfig,
];
