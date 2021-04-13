const wdio = require('webdriverio');
const lambdaTunnel = require('@lambdatest/node-tunnel');

// eslint-disable-next-line new-cap
const tunnelInstance = new lambdaTunnel();
wdio.tunnelInstance = tunnelInstance;
const { dataconfig } = global;

const tunnelArguments = {
  user: process.env.LAMBDATEST_USERNAME || dataconfig.ltlocal.userName || ltsecrets.userName,
  key: process.env.LAMBDATEST_ACCESS_KEY || dataconfig.ltlocal.accessKey || ltsecrets.accessKey,
  infoAPIPort: 8000,
  tunnelName: 'lttunnel',
};

(async () => {
  try {
    await tunnelInstance.start(tunnelArguments);
    console.log('Tunnel is Running Successfully 5');
    const tunnelRunningStatus = tunnelInstance.isRunning();
    console.log(`Tunnel is Running ? ${tunnelRunningStatus}`);
    const tunnelName = await tunnelInstance.getTunnelName();
    console.log(`Tunnel Name : ${tunnelName}`);
  } catch (error) {
    console.log(error);
  }
})();
