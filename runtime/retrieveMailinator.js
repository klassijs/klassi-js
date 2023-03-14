/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
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
    console.log('Retrieving all emails...');
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

  console.log('Email retrieved');

  const verificationCode = verificationEmailBody.match(/Código de verificación: (\d+)/g)[0].match(/\d+/g)[0];
  await helpers.apiCall(options.url, 'DELETE', options.headers.Authorization, null);
  return verificationCode;
};

module.exports = getVerificationCode;
