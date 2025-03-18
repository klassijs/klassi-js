/**
 * This module will clear the local report forlder based on different folder
 * Implemented by Sudipta Bhunia
 */
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  backupReport: () => {
    const rootBackupFolder = path.resolve(settings.projectRoot, './reportBackup');
    let dateTime = new Date();
    try {
      let newFolderName = `${dateTime
        .toISOString()
        .slice(0, 10)} ${dateTime.getHours()}-${dateTime.getMinutes()}-${dateTime.getSeconds()}`;
      const reportBackupFolder = `${rootBackupFolder}/${newFolderName}`;
      if (!fs.existsSync(rootBackupFolder)) {
        fs.mkdirSync(rootBackupFolder);
      }

      if (!fs.existsSync(reportBackupFolder)) {
        fs.mkdirSync(reportBackupFolder);
      }
      fs.copySync('reports', reportBackupFolder);
      fs.rmSync('reports', { recursive: true });
      console.info(`report back-up  taken in ${reportBackupFolder}`);
    } catch (err) {
      console.error('Error during report back-up process / nothing availabe for back-up');
    }
  },
  clearReport: () => {
    const reportFolder = path.resolve(settings.projectRoot, './reports');
    try {
      fs.rmSync(reportFolder, { recursive: true });
    } catch (err) {
      console.error('Unable to clear local reports folder');
    }
  },
};
