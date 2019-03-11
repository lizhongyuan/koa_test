'use strict';


const IORedis = require('ioredis');


const options = {
  port: 6379,
  host: '127.0.0.1',
  db: 0,
};

const Redis = new IORedis(options);


module.exports = Redis;
