Before(async () => {
  await helpers.installMobileApp(env.appName, env.appPath);
});

After(async () => {
  await helpers.uninstallMobileApp(env.appName, env.appPath);
});

Given(/^The user launches the application$/, async () => {
  await browser.activateApp(env.appName);
  if (settings.remoteService === 'lambdatest') {
    await browser.setOrientation('LANDSCAPE');
    await browser.switchContext('NATIVE_APP');
  }
});

Given(/^They open the navbar$/, async () => {
  const navbarBtn = await browser.$(sharedObjects.android.elem.navbarBtn);
  await navbarBtn.waitForDisplayed({ timeout: DELAY_10s });
  await navbarBtn.click();
});

When(/^They click on Sign in$/, async () => {
  const signInBtn = await browser.$(sharedObjects.android.elem.signInBtn);
  await signInBtn.waitForDisplayed({ timeout: DELAY_10s });
  await signInBtn.click();
});

When(/^They click on Free samples$/, async () => {
  const freeSamplesBtn = await browser.$(sharedObjects.android.elem.freeSamplesBtn);
  await freeSamplesBtn.waitForDisplayed({ timeout: DELAY_10s });
  await freeSamplesBtn.click();
});

When(/^They click on Register$/, async () => {
  const registerBtn = await browser.$(sharedObjects.android.elem.registerBtn);
  await registerBtn.waitForDisplayed({ timeout: DELAY_10s });
  await registerBtn.click();
});

When(/^Enter the correct credentials$/, async () => {
  const usernameInput = await browser.$(sharedObjects.android.elem.usernameInput);
  const passwordInput = await browser.$(sharedObjects.android.elem.passwordInput);
  await usernameInput.waitForDisplayed({ timeout: DELAY_30s });
  await usernameInput.setValue(sharedObjects.android.credentials.email);
  await passwordInput.setValue(sharedObjects.android.credentials.password);
  const submitBtn = await browser.$(sharedObjects.android.elem.submitBtn);
  await submitBtn.click();
});

Then(/^The user logs in correctly into the application$/, async () => {
  const closeWelcomeModalBtn = await browser.$(sharedObjects.android.elem.closeWelcomeModalBtn);
  await browser.pause(DELAY_5s);
  await closeWelcomeModalBtn.waitForDisplayed({ timeout: DELAY_15s });
  await closeWelcomeModalBtn.click();
  const myBooksText = await browser.$(sharedObjects.android.elem.myBooksText);
  await myBooksText.waitForDisplayed({ timeout: DELAY_10s });
});

Then(/^The user navigates to the free samples screen when not logged in$/, async () => {
  const freeSamplesText = await browser.$(sharedObjects.android.elem.freeSamplesText);
  await freeSamplesText.waitForDisplayed({ timeout: DELAY_15s });
});
