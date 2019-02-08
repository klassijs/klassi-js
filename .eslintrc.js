module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2018,
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  },
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-console": [
      0,
      "error"
    ],
    "exclude": [
      "../node_modules",
      "log",
      "features",
      "cssImages",
      "reports",
      "artifact"
    ],
    "files": [
      "./globals.d.ts"
    ],
  },
  "globals": {
    "Given": false,
    "When": false,
    "Then": false,
    "helpers":false,
    "driver":false,
    "log": false,
    "date": false,
    "startDateTime": false,
    "endDateTime": false,
    "browserName": false,
    "reportName": false,
    "projectName": false,
    "settings": false,
    "globals": false,
    "DELAY_500_MILLISECOND": false,
    "SHORT_DELAY_MILLISECOND": false,
    "MID_DELAY_MILLISECOND": false,
    "LONG_DELAY_MILLISECOND": false,
    "EXTRA_LONG_DELAY_MILLISECOND": false,
    "DELAY_3_SECOND": false,
    "DELAY_10_SECOND": false,
    "DELAY_15_SECOND": false,
    "DELAY_20_SECOND": false,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": false,
    "baseUrl": "./",
    "noEmit": true,
    "forceConsistentCasingInFileNames": true
  }
};