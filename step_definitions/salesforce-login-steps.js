/* eslint-disable global-require */
const { nanoid } = require('nanoid');

let Salesforce;
let AccountCreationForm;

try {
  Salesforce = require('../page-objects/__utam__/compiledUTAM/salesforce');
  AccountCreationForm = require('../page-objects/__utam__/compiledUTAM/accountCreationForm');
  // eslint-disable-next-line no-empty
} catch (err) {}
const getVerificationCode = require('../settings/retrieveMailinator');

Given(/^The user navigates to their Salesforce instance$/, async () => {
  await helpers.loadPage(env.salesforceInstanceUrl, 10);
  await utam.load(Salesforce);
});

When(/^They log into the instance$/, async () => {
  let salesforce = await utam.load(Salesforce);
  await salesforce.login(
    sharedObjects.salesforceData.credentials.salesforce.username,
    sharedObjects.salesforceData.credentials.salesforce.password
  );

  await salesforce.waitForAbsence();
  const verificationCodePage = await browser.$('input[id="emc"]');
  if (await verificationCodePage.isExisting()) {

    salesforce = await utam.load(Salesforce);

    const confirmIdentityInput = await salesforce.getConfirmIdentityInput();

    const submitIdentityBtn = await salesforce.getSubmitIdentityBtn();

    const verificationCode = await getVerificationCode('oxford.automation');

    await confirmIdentityInput.clearAndType(verificationCode);
    await submitIdentityBtn.click();
    await salesforce.waitForAbsence();
  }
});

Then(/^The user accesses the form to create a new account$/, async () => {
  await helpers.loadPage(`${env.salesforceInstanceUrl}/lightning/o/Account/list?filterName=Recent`, 10);
});

Then(/^They create a new client account$/, async () => {
  const newAccountBtn = await browser.$(sharedObjects.salesforceData.elem.newAccountBtn);
  await newAccountBtn.waitForDisplayed({ timeout: DELAY_10s });
  await newAccountBtn.click();

  const accountFormModal = await browser.$(sharedObjects.salesforceData.elem.accountFormModal);
  await accountFormModal.waitForDisplayed({ timeout: DELAY_10s });
  await browser.pause(DELAY_5s);

  let accountCreationForm = await utam.load(AccountCreationForm);
  accountCreationForm = await utam.load(AccountCreationForm);
  const accountNameInput = await accountCreationForm.getAccountNameInput();
  await accountNameInput.clearAndType(`Test Account ${nanoid(15)}`);

  const saveBtn = await accountCreationForm.getSaveBtn();
  await saveBtn.click();
});
