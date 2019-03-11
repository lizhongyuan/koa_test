'use strict';

const urllib = require('urllib');
const crypto = require('crypto');
const https = require('https');


function encrypt(secret, data) {
    return crypto.createHmac('SHA256', secret).update(data).digest('base64');
}

function getSignature(appSecret, nonce, method, url, body){
    let original = nonce + method + url + JSON.stringify(body);
    return crypto.createHmac('SHA256', appSecret) .update(new Buffer(original)).digest('base64');
}

// 正确的options
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

// 失败的options2
let now = (new Date()).getTime();
let _query = '?page=1&count=100';
let appSecret = 'cogszUphFTb72ljdRBDvKKDlKo2oWbk2';
// let data = `${now}GEThttps://mocha-iot-api.sensoro.com/developers/station/list${_query}{}`
// let signature = encrypt(appSecret, data);

function getSignature(appSecret, nonce, method, url, body){
    var original = nonce + method + url + JSON.stringify(body);
    return crypto.createHmac('SHA256', appSecret) .update(new Buffer(original)).digest('base64');
}

let appID = 'k42RZX1zSElE';
let method = 'GET';
//let url = 'https://iot-api.sensoro.com/developers/station/list';
let url = 'https://iot-api.sensoro.com/developers/station/list?page=1&count=100';
let nonce = Date.now();
let body = {};
/*
let body = {
    page: 1,
    count: 100
};
*/
let signature = getSignature(appSecret, nonce, method, url, body);

let opt = {
    method: method,
    headers: {
        'X-ACCESS-ID': appID,
        'X-ACCESS-NONCE': nonce,
        'X-ACCESS-SIGNATURE': signature
    }
};

urllib.request(url, opt, (err, data, res) => {
    if(err) {
        console.log("err")
    }
    
    console.log(res.statusCode);
    console.log(res.headers);
    console.log(data.toString());
    
})

let options2 = {
    host: 'mocha-iot-api.sensoro.com',
    port: 443,
    path: '/developers/station/list?page=1&count=100',
    method: 'GET',
    headers: {
        'x-access-id':'k42RZX1zSElE',
        'x-access-nonce': String(now),
        'x-access-signature': String(signature)
    }
}

https.get(options, (res) => {
    console.log('test1 res.statusCode:', res.statusCode);

    res.on('data', (data) => {
        console.log(data.toString());
    })
});

/*
https.get(options2, (res) => {
    console.log('test2 res.statusCode:', res.statusCode);

    res.on('data', (data) => {
        console.log(data.toString());
    })
});
*/

