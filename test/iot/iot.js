"use strict";

const https = require('https');
const crypto = require('crypto');


function getSignature(appSecret, nonce, method, url, body){
    var original = nonce + method + url + JSON.stringify(body);
    return crypto.createHmac('SHA256', appSecret) .update(new Buffer(original)).digest('base64');
}

let appID = 'k42RZX1zSElE';
let appSecret = 'cogszUphFTb72ljdRBDvKKDlKo2oWbk2';
let method = 'GET';
let url = 'https://iot-api.sensoro.com/developers/station/list';
let nonce = Date.now();
let body = {};
let signature = getSignature(appSecret, nonce, method, url, body);

let opt = {
    method: method,
    host: 'mocha-iot-api.sensoro.com',
    path: '/developers/station/list',
    port: 443,
    headers: {
        'X-ACCESS-ID': appID,
        'X-ACCESS-NONCE': nonce,
        'X-ACCESS-SIGNATURE': signature
    },
};

console.log(opt);

let req = https.request(opt, (res) => {
    if(res) {
        console.log(res);
    }
    
    res.on('data', (data) => {
        console.log(data.toString());
    })
})

req.end();


/*
urllib.request(url, opt, (err, data, res) => {
    if(err) {
        console.log("err")
    }
    console.log(res.statusCode);
    console.log(res.headers);
    console.log(data.toString());
});
*/


let options = {
    host: 'mocha-iot-api.sensoro.com',
    port: 443,
    path: '/developers/station/list',
    method: 'GET',
    headers: {
        'x-access-id':'OUWzdrnSGpIj',
        'x-access-nonce': '123',
        'x-access-signature':'0U67yLakYPDm00In/ITy1k3JPocm+ZLoG7Zp7gGqQD0='
    }
}

/*
https.get(options, (res) => {
    console.log(res.statusCode);
    
    res.on('data', (data) => {
        console.log(data);
    })
})
*/