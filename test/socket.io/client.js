
var socket = require('socket.io-client')('http://localhost:3154');

// var socket = io.connect('http://localhost:3154');

socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});

/*
socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});
*/