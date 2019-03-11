'use strict';

const Promise = require('bluebird');


async function test1() {
    // throw new Error('aaa');

    /*
    return new Promise((resolve, reject) => {
        reject('bbb');
    });
    */

    //throw 'bbb';
    // console.log('bbbb');

    throw 0x1111;
}

test1()
    .then(res => {
        console.log('res:', res);
    }, err => {
        //console.log('err:', err);
        // console.log(new Buffer(String(err)).toString('hex'));
        console.log(err.toString(16));
    });
