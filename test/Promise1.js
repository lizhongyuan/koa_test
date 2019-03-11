const Promise = require('bluebird');

function test() {
    return new Promise((resolve, reject) => {
        Promise.resolve()
            .then(() => {
                console.log(1);
                // resolve(1);
                reject(1);
            })
            .then(() => {
                console.log(2)
            });
    })
}

test()
.then(res => {
    console.log(res)
}, err => {
    console.log(err)
})