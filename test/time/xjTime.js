'use strict';


const moment = require('moment');



// let format = "YYYY.MM.DD HH:MM:SS.SSS";
let format = "YYYYMMDDHHMMSSSSS";
let str = moment().format(format).toString();

console.log(str);

let createTaskIdentifier = function createTaskIdentifier(timeZone) {
    
    let prefix = 'XJ';
    
    let format = 'YYYYMMDDHHMMSSSSS';
    let curTimeStr = moment().utcOffset(60 * timeZone).format(format).toString();
    
    let str = prefix + curTimeStr + String(timeZone);
    
    return str;
}


console.log(createTaskIdentifier(8));