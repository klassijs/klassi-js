/**
 * Klassi Automated Testing Tool
 * Created by Larry Goddard
 * Contributors:
 */
'use strict';

const path = require('path'),
    fse = require('fs-extra-promise'),
    winston = require('winston');

module.exports = {

    oupLog: function () {
        let MyDate = new Date();
        let date;

        MyDate.setDate(MyDate.getDate());
        date = ('-' + '0' + MyDate.getDate()).slice(-2) + '-' + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-' + MyDate.getFullYear() + ('-' + MyDate.getHours() + ':' + MyDate.getMinutes() );

        let infoJsonFile = path.join('./log/infoLog/', date + '.json').replace(/ /gi, ''),
            errorJsonFile = path.join('./log/errorLog/', date + '.json').replace(/ /gi, '');

        fse.ensureFile(infoJsonFile, function (err) {
            if(err){
                console.log('The infoLog Folder has NOT been created: ' + err);
            }
        });

        fse.ensureFile(errorJsonFile, function (err) {
            if(err){
                console.log('The errorLog Folder has NOT been created: ' + err);
            }
        });

        /**
         * Log files are raised and sent to the relevant files
         */
        const logger = (winston.createLogger({
            level: 'verbose',
            transports: [
                new winston.transports.Console({
                    colorize: 'all',
                    timestamp: true,
                    prettyPrint: true
                }),
                new winston.transports.File({
                    name: 'info-file',
                    filename: infoJsonFile,
                    level: 'info',
                    json: false,
                    prettyPrint: true
                }),
                new winston.transports.File({
                    name: 'error-file',
                    filename: errorJsonFile,
                    level: 'error',
                    json: false,
                    prettyPrint: true
                })
            ]
        }));
        return logger;
    }
};
