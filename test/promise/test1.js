const Promise = require("bluebird");
Promise.config({
    cancellation:true
});


Promise.resolve()
    .then(() => {
        console.log(1)
    })
    .then(() => {
        console.log(2)
    })
    .then(() => {
        console.log(3)
    })
    .then(() => {
        console.log(4)
    })
    .then(() => {
        console.log(5)
    })
    .then(() => {
        console.log(6)
    })
    .then(() => {
        console.log(7)
    })
