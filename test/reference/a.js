console.log(' 开始加载 A 模块');


var b = require('./b.js');


console.log('in a, b is ', b);


exports.func = function() {
    console.log('调用 A 模块成功');
};


console.log('A 模块加载完毕');