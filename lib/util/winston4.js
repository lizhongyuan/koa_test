'use strict';


const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, prettyPrint } = format;
const stringify = require('fast-safe-stringify');
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


const formatter = printf(function (options) {
    let meta = this.meta
    let timestamp = getTimestamp();
  
    /*
    // serialize Error meta
    if (meta instanceof Error) {
        meta = serializeError(meta)
    }
    */
    
    let metaStr = stringify(meta);
    
    // handle meta
    if (meta && Object.keys(meta).length > 0) {
        return `${timestamp} ${options.level} ${options.message} ${metaStr}`
    }
    
    return `${timestamp} ${options.level} ${options.message}`
});

let opts = {
    level: 'info',
    filename: 'test2.log',
    //format: myFormat,
    format: formatter,
}


let consoleTransport = new winston.transports.Console({
    level: 'info',
    filename: 'test2.log',
    format: myFormat,
})


let appTransport = new DailyRotateFile(opts);
/*
appTransport.on('rotate', function(oldFilename, newFilename) {
    console.log('oldFilename:', oldFilename);
    console.log('newFilename:', newFilename);
});
*/


const logger = winston.createLogger({
    format: format.combine(
        format.splat(),
    ),
    transports: [
        appTransport,
        consoleTransport
    ]
});

/*
logger.log({
    level: 'info',
    message: "test2",
});
*/

logger.info('I see');
