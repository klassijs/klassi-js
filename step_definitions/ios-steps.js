Before(async () => {
  await helpers.installMobileApp(env.appName, env.appPath);
});

After(async () => {
  await helpers.uninstallMobileApp(env.appName, env.appPath);
});

Given(/^The APP was installed correctly$/, async () => {
  await browser.activateApp(env.appName);
  expect(await browser.isAppInstalled(env.appName)).to.equal(true, `The app ${env.appName} was installed correctly.`);
});
