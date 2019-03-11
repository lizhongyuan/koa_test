let now = Date.now();

new Promise((resolve, reject) => {
    setTimeout(() => {
        // resolve();
    }, 1000);
})
.then(() => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 2000);
    });
})
.then(res => {
    let now2 = Date.now();
    console.log(now2 - now);
});