'use strict';

let { Redis } = require('../../connection');

Redis.config('set', 'notify-keyspace-events', 'KEA');

let sub = function sub(channel) {
    Redis.subscribe(channel, (err) => {
        if(err) {
            console.log(err);
        }
    });
};

let pub = function pub(channel, key) {
    Redis.publish(channel, key)
};

Redis.on('message', (channel, key) => {
    console.log(channel, key);
})

let expire_channel = '__keyevent@0__:expired'

sub('test');
sub('test2');
sub(expire_channel);

pub('test', 123);