'use strict';

const util = require('util');

/*
let float2Percent = function float2Percent(num) {
    return util.format('%s%%', num * 100);
};
*/

function formatFloat(src, pos)
{
    return Math.round(src * Math.pow(10, pos))/Math.pow(10, pos);
}

let float2Percent = function float2Percent(num) {
    let divisor = Math.round(num * Math.pow(10, 4));
    let dividend = Math.pow(10, 2)
    let value = divisor / dividend;
    return util.format('%s%%', value);
};

let buildMinSecStr = function buildMinSecStr(sec) {
    // sec = Math.round(sec);
    sec = parseInt(Math.round(sec));

    if (sec < 0) {
        return '参数错误, 小于0';
    }
    if ( sec === 0) {
        return '0秒';
    }

    let rest;

    let d = parseInt(sec / ( 24 * 60 * 60 ));
    rest = sec - d * (24 * 60 * 60);

    let h = parseInt(rest / (60 * 60));
    rest = rest - h * (60 * 60);

    let m = parseInt(rest / 60);
    rest = rest - m * 60;

    let s = rest;

    // let str = d + "天" + h + "小时" + m + "分" + s + "秒";
    let str = "";
    if(d !== 0) {
        str += (d + '天');
    }
    if(h !== 0) {
        str += (h + '小时');
    }
    if(m !== 0) {
        str += (m + '分钟');
    }
    if(s !== 0) {
        str += (m + '秒');
    }

    return str;
};


console.log(buildMinSecStr(186400.25));
console.log(buildMinSecStr(0));
console.log(buildMinSecStr(60));
console.log(buildMinSecStr(-1));
// console.log(float2Percent(0.99999999));
//console.log(formatFloat(0.8999999999999, 2));
// console.log(formatFloat(0.009014248328002326, 4));
console.log(float2Percent(0.009014248328002326));
