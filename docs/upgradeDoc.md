Steps taken to upgrade all projects:

- Add base base files from example-test-suite (because the configuration is a bit different in OAF):
    - cucumber.js
    - dataConfigrc.js // update the project details
    - branchnamelinter.config.json
    - commitlint.config.js
    - .husky folder
    - .versionrc.json file // change the project details in the url
- Change envConfigrc.json.
  - Change package.json:
      - install: 
    ``` json
         "devDependencies": {
          "@commitlint/cli": "^17.2.0",
          "@commitlint/config-conventional": "^17.2.0",
          "branch-name-lint": "^2.1.1",
          "eslint": "^8.34.0",
          "eslint-plugin-import": "^2.27.5",
          "eslint-plugin-prettier": "^4.2.1",
          "husky": "^8.0.0",  "is-ci": "^3.0.1",  "lint-staged": "^13.0.3", "standard-version": "^9.5.0" }`
      ```
      - Add to package.json `"lint-staged": {  "*.js": [    "eslint --quiet --fix"  ]}`
      - Add scripts `"prepare": "is-ci || husky install","lint-branch-name": "yarn run branch-name-lint ./branchnamelinter.config.json", "changelog": "standard-version --skip.commit --skip.tag","changelog:patch": "standard-version --release-as patch --skip.commit --skip.tag","changelog:minor": "standard-version --release-as minor --skip.commit --skip.tag","changelog:major": "standard-version --release-as major --skip.commit --skip.tag"`
      - Change s3report script name to \`cilts3r\`
      - Point OAF to #v5.1.1 branch
- Change .circleci/config.yml:
    - yarn install --network-concurrency 1
    - `- image: cimg/node:18.12.1-browsers`
- Lambdatest folder:
    - copy the content to update all browsers