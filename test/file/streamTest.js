'use strict';

const fs = require('fs');
const through2 = require('through2');

fs.createReadStream('test1.txt')
    .pipe(through2(function (chunk, enc, callback) {
        for (var i = 0; i < chunk.length; i++)
            if (chunk[i] == 97)
                chunk[i] = 122 // swap 'a' for 'z'
        
        this.push(chunk);
        
        callback();
    }))
    .pipe(fs.createWriteStream('out.txt'))
    .on('finish', function () {
        //doSomethingSpecial()
        console.log('finish')
    })
