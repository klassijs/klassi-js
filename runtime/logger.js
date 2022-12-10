// /**
//  klassi-js
//  Copyright © 2016 - Larry Goddard
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//  SOFTWARE.
//  */
// const path = require('path');
// const fs = require('fs-extra');
// // const winston = require('winston');
//
// module.exports = {
//   klassiLog() {
//     const MyDate = new Date();
//     let date;
//
//     MyDate.setDate(MyDate.getDate());
//     // eslint-disable-next-line prefer-const,no-useless-concat
//     date = `${`${'-' + '0'}${MyDate.getDate()}`.slice(-2)}-${`0${MyDate.getMonth() + 1}`.slice(
//       -2
//     )}-${MyDate.getFullYear()}`;
//     const infoJsonFile = path.join(`./log/infoLog/${reportName}-${date}.json`).replace(/ /gi, '');
//     const errorJsonFile = path.join(`./log/errorLog/${reportName}-${date}.json`).replace(/ /gi, '');
//
//     fs.ensureFile(infoJsonFile, (err) => {
//       if (err) {
//         log.error(`The infoLog File has NOT been created: ${err.stack}`);
//       }
//     });
//
//     fs.ensureFile(errorJsonFile, (err) => {
//       if (err) {
//         log.error(`The errorLog File has NOT been created: ${err.stack}`);
//       }
//     });
//
//     /**
//      * Log files are raised and sent to the relevant files
//      */
//     const logger = winston.createLogger({
//       level: 'info',
//       format: winston.format.json(),
//       defaultMeta: { service: 'user-service' },
//       transports: [
//         // new winston.transports.Console({}),
//         new winston.transports.File({
//           name: 'info-file',
//           filename: infoJsonFile,
//           level: 'info',
//         }),
//         new winston.transports.File({
//           name: 'error-file',
//           filename: errorJsonFile,
//           level: 'error',
//         }),
//       ],
//     });
//     if (process.env.NODE_ENV !== 'prod') {
//       logger.add(
//         new winston.transports.Console({
//           format: winston.format.simple(),
//         })
//       );
//     }
//     return logger;
//   },
// };
