"use strict";


let opt1 = {
    a: 1,
    b: 2,
    c: 3,
};

let opt2 = {
    b: "b",
    d: "d",
};

let opt3 = {
    e: 5,
};

let Json = Object.assign({}, opt1, opt2, opt3);
console.log(Json);

let opt0 = { a: 1 };
let addOpt = { b:2, c:3 };

Object.assign(opt3, addOpt);
console.log(opt0);
console.log(addOpt);


