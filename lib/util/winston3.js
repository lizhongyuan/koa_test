'use strict';


const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, prettyPrint } = format;
const moment = require('moment');


const DailyRotateFile = require('winston-daily-rotate-file');


const Date_Format = 'YYYY-MM-DD HH:mm:ss.SSS';
let getTimestamp = function () {
    return moment().format(Date_Format);
};


let myFormat = printf(info => {

    let timestamp;

    if (!info.timestamp) {
        timestamp = getTimestamp();
    }
    else {
        timestamp = info.timestamp;
    }

    return `${timestamp} ${info.level}: ${info.message}`;
});


let opts = {
    level: 'info',
    filename: 'test2.log',
    format: myFormat,
}


let consoleTransport = new winston.transports.Console({
    level: 'info',
    filename: 'test2.log',
    format: myFormat,
})


let appTransport = new DailyRotateFile(opts);
appTransport.on('rotate', function(oldFilename, newFilename) {
    console.log('oldFilename:', oldFilename);
    console.log('newFilename:', newFilename);
});


const logger = winston.createLogger({
    transports: [
        appTransport,
        consoleTransport
    ]
});


logger.log({
    level: 'info',
    message: "test2",
})
