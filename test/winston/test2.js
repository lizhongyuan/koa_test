const winston = require("winston");

var logger = new (winston.Logger)({
    transports: [
        new winston.transports.File({
            name: 'info-file',
            filename: 'filelog-info.log',
            level: 'info'
        }),
        new winston.transports.File({
            name: 'test-info',
            filename: 'testinfo.log',
        }),
        new winston.transports.File({
            name: 'error-file',
            filename: 'filelog-error.log',
            level: 'error'
        })
    ]
});

logger.info("test replace config");
logger.error("test replace config");
