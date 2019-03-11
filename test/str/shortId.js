'use strict';

let shortid = require('shortid');

console.log(shortid.generate());

let ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';

let ID_LENGTH = 8;

let generate = function() {
    let rtn = '';
    for (let i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}

let str = generate();

console.log(str);