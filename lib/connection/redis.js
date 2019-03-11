'use strict';

// const config = require('config');
const IORedis = require('ioredis');

let options = {
    /*
    port: config.redis.port,
    host: config.redis.host,
    db: config.redis.databaseIndex
    */
    port: 6379,
    host: 'localhost',
    db: 0,
};

/*
if (config.redis.password) {
    options.password = config.redis.password;
}
*/

const Redis = new IORedis(options);

/*
 * redis服务 new
 */
module.exports = Redis;