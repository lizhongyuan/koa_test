console.log(' 开始加载 B 模块');


var A = require('./a.js');


console.log('in b, a is ', A);


exports.callAmodule = function() {
    A.func();
}


console.log('B 模块加载完毕');