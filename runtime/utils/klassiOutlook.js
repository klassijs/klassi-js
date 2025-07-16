require('dotenv').config();
const pactumJs = require('pactum');
const qs = require('qs');

const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
// const userEmail = 'QAE.TestAccounts@klassi.co.uk'; // This email address is for user with shared mailbox.
const userEmail = 'qaAutoTest@klassi.co.uk'; // This email address is for user with own mailbox.

const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${userEmail}/messages`;

let emailData = 'Han.Solo@klassi.co.uk';

async function getAccessToken() {
  const data = {
    client_id: clientId,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  };

  const response = await pactumJs.spec()
    .post(tokenEndpoint)
    .withHeaders('Content-Type', 'application/x-www-form-urlencoded')
    .withBody(qs.stringify(data))
    .expectStatus(200);

  const accessToken = response.body.access_token;

  if (!accessToken.includes('.')) {
    throw new Error('Invalid token format: Token must be in JWS format (header.payload.signature)');
  }
  return accessToken;
}

async function getEmails(accessToken) {
  const response = await pactumJs.spec()
    .get(`${graphEndpoint}?$top=50`)
    .withHeaders({
      Authorization: `Bearer ${accessToken}`,
    })
    .expectStatus(200);

  if (userEmail === 'qaAutoTest@klassi.co.uk') {
    return response.body.value.map(email => ({
      subject: email.subject,
      body: email.body.content,
    }));
  } else {
    return response.body.value.map(email => ({
      subject: email.subject,
      body: email.body.content,
      to: email.toRecipients.map(recipient => recipient.emailAddress.address),
    }));
  }
}

(async () => {
  let match;
  try {
    const token = await getAccessToken();
    const emails = await getEmails(token);
    // console.log( 'Filtered Emails  ===================== ' , JSON.stringify(emails, null, 2));
    for ( const email of emails) {
      if (email.subject.includes('Test Automated Report-01-06-2025-044643')) { // Adjust subject to be generic
        console.log('this is the email we are looking for' + email.body);

        match = email.body.match(/\bautomated\b/); // Adjust regex to be more generic
        if (match) {
          console.log(match[0]);
        } else {
          console.log('No match found.');
        }

        return match[0];

      } else if (Array.isArray(email.to)) {
        const recipients = email.to.map(recipient => recipient);
        for (const recipient of recipients ) {
          if (recipient === emailData) {
            console.log('Recipient =========== we are here :');
            console.log('this is the email we are looking for === ' + email.subject);
            console.log('this is the email we are looking for === ' + email.body);
            for (const email of emails) {
              if (email.body.includes(5265897)) { // to be generic
                match = email.body.match(/\b5265897\b/); // to be generic

                if (match) {
                  console.log(match[0]);
                } else {
                  console.log('No match found.');
                }

                return match[0];
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
})();
