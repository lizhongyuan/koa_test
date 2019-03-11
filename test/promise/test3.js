'use strict';


let p1 = new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, 1000)
})


p1();

