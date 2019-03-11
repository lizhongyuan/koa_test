'use strict';

let sensorData1 = {
    battery : 100,
    installed : false,
    smoke : false,
    interval : 21600
};

let sensorTypes1 = [
    "smoke",
    "installed"
]

let sensorData2 = {
    "drop" : 10,
    "customer" : "090a",
    "interval" : 600,
};

let sensorTypes2 = [
    "drop",
]

const sensorValid1 = Object.keys(sensorData1).some(item => sensorTypes1.includes(item));
const sensorValid2 = Object.keys(sensorData2).some(item => sensorTypes2.includes(item));

console.log(sensorValid1);
console.log(sensorValid2);
