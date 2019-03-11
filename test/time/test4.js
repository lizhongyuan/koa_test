
const moment = require('moment');

let getDateByTs = function getDateByTs(ms) {
    let date = moment(ms).format('YYYY-MM-DD');
    return date;
}

let buildExcelFileName = function buildExcelFileName(start, end) {
    let prefix = '失联数据';
    let startDate = getDateByTs(start);
    let endDate = getDateByTs(end);
    let to = '至';
    
    let fileName = prefix + startDate + to + endDate;
    
    return fileName;
};

console.log(buildExcelFileName(1535447100063, 1535449100063))