const program = require('commander');
const confSettings = require('./confSettings');
const secrets = require('./scripts/secrets/browserstack.json');

let bsProjectname;

/** setting the envConfig variables for file list */
if (program.aces) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  bsProjectname = require(`../projects/${projectName}/test/configs/envConfig.json`);
} else {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  bsProjectname = require(`../projects/${projectName}/configs/envConfig.json`);
}

const key = secrets.BROWSERSTACK_ACCESS_KEY;
const username = secrets.BROWSERSTACK_USERNAME;
const bsUrl = secrets.BROWSERSTACK_URL;

const method = 'GET';
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
    const url = `https://${username}:${key}${bsUrl}/projects.json`;
    res = await confSettings.apiCall(url, method);
    projectID = res.body;
    let i;
    // eslint-disable-next-line no-plusplus
    for (i = 0; i < projectID.length; i++) {
      const projectname = projectID[i].name;
      // eslint-disable-next-line no-await-in-loop
      await projectname;
      if (projectname === bsProjectname.bsProjectName) {
        projectID = projectID[i].id;
      }
    }
    await projectID;
  },

  getProjectDetails: async () => {
    // this returns a list of all builds in the project
    const url = `https://${username}:${key}${bsUrl}/projects/${projectID}.json`;
    // const method = 'GET';

    res = await confSettings.apiCall(url, method);
    buildID = res.body.project.builds[0].hashed_id;
    return buildID;
  },

  getSessionID: async () => {
    // this get the sessions for the video links
    const url = `https://${username}:${key}${bsUrl}/builds/${buildID}/sessions.json`;
    // const method = 'GET';

    res = await confSettings.apiCall(url, method);
    videoID = res.body[0].automation_session.video_url;
    return videoID;
  },

  getVideoId() {
    return videoID;
  },
};
