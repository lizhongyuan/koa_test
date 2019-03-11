"use strict";

let a = {};

a = {
    c:3,
    b:2,
    a:a
};

console.log(JSON.stringify(a));
