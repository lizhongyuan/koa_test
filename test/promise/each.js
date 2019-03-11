
const Promise = require('bluebird');

let aaa = [1, 2, 3];

Promise.each(aaa, func);


async function func(item) {
    console.log(item)
    return item;
}

