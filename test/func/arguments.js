const util = require('util');

function show(...args) {
    console.log(arguments);
    
    let a = util.format('%s:%s', 'abc', 'lzy');
    console.log(a);
    
    let b = util.format('1234')
    console.log(b);
}

show(1, 2, 3);