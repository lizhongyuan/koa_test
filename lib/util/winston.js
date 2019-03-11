'use strict';


const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, prettyPrint } = format;

let globalTransports = [];

let logTransport = new winston.transports.File({filename: 'test.log', level:'info'});

globalTransports.push(logTransport);

/*
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({filename: 'test.log', level:'info'}),
    ]
})
*/

const myFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

const formatter = function (options) {
    
    /*
    let meta = this.meta
    
    // serialize Error meta
    if (meta instanceof Error) {
        meta = serializeError(meta)
    }
    */
    
    // handle meta
    if (Object.keys(meta).length > 0) {
        return timestamp() + ' ' + options.level + ' ' + options.message + ' ' + stringify(meta)
    }
    
    return timestamp() + ' ' + options.level + ' ' + options.message
};

const logger = createLogger({
    /*
    format: combine(
        label({ label: 'right meow!' }),
        timestamp(),
        myFormat
        // prettyPrint()
    ),
    */
    format: myFormat,
    
    transports: globalTransports,
});

logger.info('hello');

/*
logger.log({
    level: 'info',
    message: 'hello',
})
*/