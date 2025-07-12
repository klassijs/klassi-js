/**
 * OUP Automated Testing Tool
 * Created by Larry Goddard
 */
const options = {
  headers: {
    Authorization: sharedObjects.salesforceData.credentials.mailinator.apiKey,
  },
  throwHttpErrors: true,
  simple: false,
  allowGetBody: true,
  resolveWithFullResponse: true,
};

const retrieveAllEmails = async (inbox) => {
  try {
    options.url = `${env.mailinatorApiBaseUrl}/${inbox}`;
    const response = await helpers.apiCall(options.url, 'GET', options.headers.Authorization, null);

    return response.body.msgs;
  } catch (e) {
    console.error(e);
  }
};

const getVerificationCode = async (inbox) => {
  let messageId;
  let allCurrentReceivedEmails = [];

  while (allCurrentReceivedEmails.length < 1) {
    try {
      allCurrentReceivedEmails = await retrieveAllEmails(inbox);
    } catch (e) {
      console.error(e);
    }
  }

  messageId = allCurrentReceivedEmails[allCurrentReceivedEmails.length - 1].id;
  options.url = `${env.mailinatorApiBaseUrl}/${inbox}/messages/${messageId}`;

  const verificationEmail = await helpers.apiCall(options.url, 'GET', options.headers.Authorization, null);
  const verificationEmailBody = verificationEmail.parts[0].body;
  const verificationCode = verificationEmailBody.match(/Código de verificación: (\d+)/g)[0].match(/\d+/g)[0];
  await helpers.apiCall(options.url, 'DELETE', options.headers.Authorization, null);
  return verificationCode;
};

module.exports = getVerificationCode;
