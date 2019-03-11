"use strict";

let arr = [];

function test() {
    console.log("abc")
}

let test2 = function (...args) {
    let curIns = new test(...args);
    arr.push(1);
    return curIns;
}

test2();

console.log(arr)
