


function urlPathToData(url_path) {
    // var data = url_path.replace(/aaa/g, '_');
    var data = url_path.replace(/No data/g, '无数据');
    // return data + '_handler';
    return data;
}


console.log(urlPathToData('aaabbbaaa'));
console.log(urlPathToData('No data'));

