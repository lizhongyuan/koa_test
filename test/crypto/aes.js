var b = new Buffer('JavaScript');
var s = b.toString('base64');
console.log(s);
// SmF2YVNjcmlwdA==


var b2 = new Buffer('SmF2YVNjcmlwdA==', 'base64')
var s2 = b2.toString();
console.log(s2);
// JavaScript