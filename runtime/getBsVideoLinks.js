const program = require('commander');
const confSettings = require('./confSettings');
const secrets = require('./scripts/secrets/browserstack.json');

let bsProjectName;

/** setting the envConfig variables for file list */
if (program.aces) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  bsProjectName = require(`../projects/${projectName}/test/configs/envConfig.json`);
} else {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  bsProjectName = require(`../projects/${projectName}/configs/envConfig.json`);
}

const key = secrets.BROWSERSTACK_ACCESS_KEY;
const username = secrets.BROWSERSTACK_USERNAME;

let res;
let projectID;
let buildID;
let videoID;

module.exports = {
  /**
   * making a call to the Api
   */
  getProjectList: async () => {
    // this returns a list of projects and filter out the required one
    const url = `https://${username}:${key}@api.browserstack.com/automate/projects.json`;
    const method = 'GET';
    console.log('this is the url ', url);
    res = await confSettings.apiCall(url, method);
    projectID = res.body;
    let i;
    // eslint-disable-next-line no-plusplus
    for (i = 0; i < projectID.length; i++) {
      const projectName1 = projectID[i].name;
      // eslint-disable-next-line no-await-in-loop
      await projectName1;
      if (projectName1 === bsProjectName.bsProjectName) {
        projectID = projectID[i].id;
      }
    }
    await projectID;
  },

  getProjectDetails: async () => {
    // this returns a list of all builds in the project
    const url = `https://${username}:${key}@api.browserstack.com/automate/projects/${projectID}.json`;
    const method = 'GET';

    res = await confSettings.apiCall(url, method);
    buildID = res.body.project.builds[0].hashed_id;
    await buildID;
  },

  getSessionID: async () => {
    // this get the sessions for the video links
    const url = `https://${username}:${key}@api.browserstack.com/automate/builds/${buildID}/sessions.json`;
    const method = 'GET';

    res = await confSettings.apiCall(url, method);
    videoID = res.body[0].automation_session.video_url;
    await videoID;
  },

  getVideoId: async () => {
    const newVideoID = await videoID;
    return newVideoID;
  },
};
