'use strict';


const redis = require('../connection/index').Redis;

const oneDaySecond = 24 * 60 * 60;


exports.get = async function get(key) {
  const res = await redis.get(key);
  if (!res) {
    return null;
  }

  return JSON.parse(res);
};


exports.set = async function set(key, value, maxAge = oneDaySecond) {
  value = JSON.stringify(value);
  await redis.setex(key, maxAge, value);
};


exports.destroy = async function destroy(key) {
  await redis.del(key);
};
