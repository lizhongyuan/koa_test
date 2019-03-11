'use strict';

const Promsie = require('bluebird');

function buildPromise(num) {
    return new Promise((resolve, reject) => {
        resolve(num);
    })
}

let arr = [
    buildPromise(1),
    buildPromise(2),
    buildPromise(3)
]

for( let i = 0; i < arr.length; i++) {
    setTimeout( ()=> {
        arr[i]
    }, 0)
}

/*
async function main() {
    function next(i, length) {
        return arr[i].then( res => {
            console.log(res);
            
            if( i < length - 1) {
                return next(i + 1, length);
            }
        })
    }
    
    return next(0, 3);
}
main()
*/


