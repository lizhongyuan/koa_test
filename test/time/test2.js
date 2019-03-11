'use strict';

const moment = require('moment');

let isoStr = moment(1529510399999).toISOString();


console.log(isoStr);

console.log(moment(Date.now()).toISOString());
console.log(moment(Date.now()).valueOf());
console.log(Date.now());



/*
if (ctx.request.query.endTime) {
    condition.createdTime.$lte = new Date(Number(ctx.request.query.endTime));
}
*/

const a = {};
a.b = 1;
console.log(a)
