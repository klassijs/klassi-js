Steps taken to upgrade all projects that's using klassi-js as a dependency:

- Unzip and Add these files [**klassijs-baseFiles**](baseFiles.zip) to the base of your repository:
    - cucumber.js
    - .dataConfigrc.js /// update the project details from the .envConfigrc.js
    - branchnamelinter.config.json
    - commitlint.config.js
    - .husky folder
    - .versionrc.json file /// change the project name in the url at the bottom of this file
- delete the  details from the .envConfigrc.js thats in the .dataConfigrc.js file
  <br><br>
- Changes to the package.json:
     - install these nodes as devDependencies: 
    ```json
      "devDependencies": {
          "@commitlint/cli": "^17.2.0",
          "@commitlint/config-conventional": "^17.2.0",
          "branch-name-lint": "^2.1.1",
          "eslint": "^8.34.0",
          "eslint-plugin-import": "^2.27.5",
          "eslint-plugin-prettier": "^4.2.1",
          "husky": "^8.0.0",
          "is-ci": "^3.0.1",
          "lint-staged": "^13.0.3",
          "standard-version": "^https://github.com/klassijs/standard-version"
      }
    ```
      - Copy and Add this to package.json below devDependencies

    ```json
      "lint-staged": {
        "*.js": [
          "eslint --quiet --fix" 
        ]
      }
    ```
      - Copy and Add these scripts to the scripts section of the package.json 
    ```json
      "prepare": "is-ci || husky install",
      "lint-branch-name": "yarn run branch-name-lint ./branchnamelinter.config.json",
      "changelog": "standard-version --skip.commit --skip.tag",
      "changelog:patch": "standard-version --release-as patch --skip.commit --skip.tag",
      "changelog:minor": "standard-version --release-as minor --skip.commit --skip.tag",
      "changelog:major": "standard-version --release-as major --skip.commit --skip.tag"
    ```
      - Change s3report script name to `cilts3r`
   
- Change these to lines in: 
  - .circleci/config.yml:
      - yarn install --network-concurrency 1
      - Docker image: cimg/node:18.12.1-browsers
