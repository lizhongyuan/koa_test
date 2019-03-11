"use strict";

const winston = require("winston");

// old
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

logger.info("info log");
logger.error("error log");
