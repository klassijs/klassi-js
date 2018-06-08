/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';

/**
 * Functionality for sending test results via email
 * @type {exports|module.exports}
 */
const nodemailer = require('nodemailer');

module.exports = {
    klassiSendMail: function () {
        let devTeam = (shared.emailList.nameList);
        /**
         * Email relay server connections
         */

        let transporter = nodemailer.createTransport({
            host: shared.emailList.auth.host,
            port: 465,
            secure: true,
            auth: {
                user: shared.emailList.auth.user,
                pass: shared.emailList.auth.pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        let mailOptions = {
            to: devTeam,
            from: 'Klassi-QATEST <email@email.com>',
            subject: global.reportName,
            alternative: true,
            attachments: [
                {
                    filename: global.reportName + '-' + date + '.html',
                    path: './reports/' + global.reportName + '-' + date + '.html'
                }
            ],
            html: '<b>Please find attached the automated test results</b>',
        };
        
        /**
         *  sends the message and get a callback with an error or details of the message that was sent
         */
        try {
           transporter.sendMail(mailOptions, function (err) {
                if (err) {
                    log.error('Result Email CANNOT be sent: ' + err.stack);
                }
                else {
                    log.info('Results Email successfully sent');
                    process.exit();
                }
            })
        }
        catch (err) {
            log.info('This is a system error: ', err.stack);
        }
    }
};