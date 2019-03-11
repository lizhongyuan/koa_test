

const moment = require('moment');


// let format = 'YYYYMMDDHHmm';
let format = 'YYYY-MM-DD HH:mm:ss';
let str1 = moment().utcOffset(60 * 8).format(format).toString();
let str2 = moment("2058-05-27T16:00:00.000+0000").utcOffset(60 * 8).format(format);
let str3= moment("2058-05-27T16:00:00.000+0000").format(format);


console.log(str1);
console.log(str2);
console.log(str3);
