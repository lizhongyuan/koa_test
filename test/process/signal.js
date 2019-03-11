
process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
 
    
    process.exit();
});

process.on('USR1', function() {
    console.log("Caught USR1 signal");
    
    process.exit();
})


setTimeout(() => {
    console.log('20s');
}, 20000);