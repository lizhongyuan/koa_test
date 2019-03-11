const io = require('socket.io-client');

var socket = io('http://127.0.0.1:8081');


socket.on('connect', () => {
    console.log('socket.id:', socket.id);

    socket.emit('message', 'what?');
});


socket.on('message', (message) => {
    console.log(message);
});