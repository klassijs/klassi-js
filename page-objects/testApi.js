const fs = require('fs-extra');
const loadConfig = require('../runtime/configLoader');
const sharedData = require('../shared-objects/api/endPointsData');

let elem;
let auth;
let links;
let resp;
let status;

const apiGetEndPoints = sharedData.getModules;
const apiPostEndPoints = sharedData.postModules;
const apiDeleteEndPoints = sharedData.deleteModule;
const apiPutEndPoints = sharedData.putModule;

const filePath = './shared-objects/api/userDataID.json';
const jsonBody = loadConfig('./shared-objects/api/payloadData.json');

module.exports = {
  getAuthToken: async () => {
    elem = await browser.$('[id="signIn"]');
    await elem.waitForExist({ timeout: DELAY_20s });
    await elem.click();
    elem = await browser.$('[id="teach_email"]');
    await elem.waitForDisplayed({ timeout: DELAY_10s });
    await elem.setValue('testaces12+CES171@gmail.com');
    // await elem.setValue('qaautotest@oup.com'); admin powers
    elem = await browser.$('[id="teach_password"]');
    await elem.setValue('Oxford1');
    // await elem.setValue('q%q?syGKG#?5_g+t');
    elem = await browser.$('[id="teach_btn-login"]');
    await elem.click();
    await browser.pause(DELAY_5s);

    // getting orgID of logged in user
    elem = await browser.$('#tabButton1');
    await elem.waitForDisplayed({ timeout: DELAY_10s });
    await elem.click();
    elem = await browser.$('[id="searchResults"]  > [class="xFhK gin-top2"]:nth-child(1) [class="_3Nh2"]');
    await elem.waitForDisplayed({ timeout: DELAY_3s });
    await elem.click({ timeout: DELAY_3s });
    const str = await browser.getUrl();
    const str2 = await str.split('/');
    const orgID = str2[4];

    // writing to a json file
    const orgId = { orgId: orgID };
    console.log('this is the orgID ', orgId);
    const comboFile = await helpers.mergeJson(filePath, orgId);
    await fs.writeFile(filePath, JSON.stringify(comboFile, null, '\t'));
    // await helpers.writeToJson(filePath, { orgId: orgID });
    console.log('this is the file combo 1 ', comboFile);
    await browser.pause(DELAY_3s);

    // getting the auth token
    const localStorage = await browser.execute(() => window.localStorage.getItem('ces-creds'));
    const obj = JSON.parse(localStorage);
    // console.log('this is the oidcIdToken ', obj.oidcIdToken);

    auth = obj.oidcIdToken;
    const authToken = { authToken: auth };
    // const comboFile = await helpers.mergeJson(filePath, authToken);
    // await fs.writeFile(filePath, JSON.stringify(comboFile, null, '\t'));
    await browser.pause(DELAY_2s);
  },

  getCall: async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (links of apiGetEndPoints) {
      const url = env.siteBaseUrl + env.apiBaseUrl + links;
      // eslint-disable-next-line no-await-in-loop
      await helpers.apiCall(url, 'GET', auth);
    }
  },

  postCall: async () => {
    const body = jsonBody.postPayload;
    const orgID = loadConfig(filePath).orgId;
    for (links of apiPostEndPoints) {
      const url = `${env.siteBaseUrl + env.apiBaseUrl}edu/org/${orgID}/${links}`;
      resp = await helpers.apiCall(url, 'POST', auth, body, status);
      console.log('this is the result ', resp);
      const userID = resp.data.userId;
      const userId = { userId: userID };
      const comboFile = await helpers.mergeJson(filePath, userId);
      await fs.writeFile(filePath, JSON.stringify(comboFile, null, '\t'));
      console.log(`apiEndPoint with statusCode: ${url}: ${resp.status}`);
      // cucumberThis.attach(`apiEndPoint with statusCode: ${url}: ${status}`);
    }
  },

  putCall: async () => {
    const body = jsonBody.putPayload;
    const orgID = loadConfig(filePath);
    for (links of apiPutEndPoints) {
      const url = `${env.siteBaseUrl + env.apiBaseUrl}edu/org/${orgID.orgId}/${links}/${orgID.userId}`;
      resp = await helpers.apiCall(url, 'PUT', auth, body);
      console.log(`apiEndPoint with statusCode: ${url}: ${resp.status}`);
      console.log(`apiEndPoint with change status: ${url}: ${resp.roleName}`);
      // cucumberThis.attach(`apiEndPoint with statusCode: ${url}: ${resp.status}`);
      // cucumberThis.attach(`apiEndPoint with change status: ${url}: ${resp.roleName}`);
    }
  },

  deleteCall: async () => {
    const orgID = loadConfig(filePath);
    const body = {
      orgId: orgID.orgId,
      userIdAndRoleNamePairs: [{ userId: orgID.userId, roleName: 'TEACHER' }],
      notifyUsers: false,
    };
    for (links of apiDeleteEndPoints) {
      const url = `${env.siteBaseUrl + env.apiBaseUrl}edu/org/${orgID.orgId}/${links}`;
      resp = await helpers.apiCall(url, 'DELETE', auth, body);
      console.log('delete resp value: ', resp.data);
    }
  },
};
