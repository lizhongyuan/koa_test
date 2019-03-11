'use strict';


const crypto = require('crypto');

const token = 'spACaoYz7lceM82H7Cx3rm';
const timestamp = '1548745360';
const nonce = '1548039003';
const echostr = '7A/zVTmZ9V+xyd5HqoZVm/94PnA4EREBllY56lGzcVbKxyUfZEOyuM2IXTkmHYNwz9nN60qKZF265u8UMiKTRA==';

/*
console.log(nonce < timestamp);
console.log(timestamp < echostr);
console.log(echostr < token);
*/

// let addStr = '﻿154803900315487453607A/zVTmZ9V+xyd5HqoZVm/94PnA4EREBllY56lGzcVbKxyUfZEOyuM2IXTkmHYNwz9nN60qKZF265u8UMiKTRA==spACaoYz7lceM82H7Cx3rm';
let addStr = nonce + timestamp + echostr + token;

// let sha1 = crypto.createHmac('sha1', 'spACaoYz7lceM82H7Cx3rm');
// let sha1 = crypto.createHmac('sha1');
let sha1 = crypto.createHash('sha1');

let sign = sha1.update(addStr)
               .digest('hex');
               //.digest('utf-8');


var CryptoJS = require('crypto-js');

let sign2 = CryptoJS.HmacSHA1('sha1', addStr).toString();

console.log(sign);

const msg_signature = '30464eac0656054fbf11472f90a8f6952e71847f';



const corpid = 'wx880defec936e8664';
const encodingAesKey = '6TtfwQiphy8ykvUxm9UtiK2qFlb5MNtjF7tuv9erHwk';

const b = new Buffer(echostr, 'base64');
const str = b.toString('hex');

const AesKey = (new Buffer(encodingAesKey + '=', 'base64')).toString();

// console.log(str);
console.log(AesKey);

var decrypt = function (a, b, crypted){
    crypted = new Buffer(crypted, 'base64');
    var decipher = crypto.createDecipheriv('aes-128-cbc', a, b);
    var decoded = decipher.update(crypted,'base64','utf8');
    decoded += decipher.final('utf8');
    return decoded;
};


