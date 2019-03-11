'use strict';


const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, prettyPrint } = format;


let globalTransports = [];


let logTransport = new winston.transports.File({filename: 'test.log', level:'info'});
let consoleTransport = new winston.transports.Console();


globalTransports.push(logTransport);
globalTransports.push(consoleTransport);


const myFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});


const logger = createLogger({
    format: combine(
        label({ label: 'right meow!' }),
        timestamp(),
        myFormat
    ),
    transports: globalTransports,
});


logger.log({
    level: 'info',
    message: 'hello',
})



