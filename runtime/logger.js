/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';

const path = require('path'),
    fse = require('fs-extra-promise'),
    winston = require('winston');

module.exports = {

    oupLog: function () {
        let infoJsonFile = path.join('./log/infoLog/' + global.reportName + '-' + (helpers.getCurrentDateTime()) + '.json').replace(/ /gi, ''),
            errorJsonFile = path.join('./log/errorLog/' + global.reportName + '-' + (helpers.getCurrentDateTime()) + '.json').replace(/ /gi, '');
        
        fse.ensureFile(infoJsonFile, function (err) {
            if(err){
                log.error('The infoLog File has NOT been created: ' + err.stack);
            }
        });

        fse.ensureFile(errorJsonFile, function (err) {
            if(err){
                log.error('The errorLog File has NOT been created: ' + err.stack);
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
