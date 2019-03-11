'use strict';


const rp = require('request-promise');


const options = {};

options.method = 'POST';
options.uri = 'http://127.0.0.1:9450/login';
options.uri = 'http://kintergration01.chinacloudapp.cn:9530/login';

options.body = {
  login: 'liukai1',
  pwd: '123sap'
};

options.json = true;



/*
options.headers = {
  authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHBpcnlEYXRlIjoiMjAxOS0wMS0yNVQwNTo1OToxMCswMDowMCJ9.6AuBNMd7C-IKLX_Xj9pCTh6gLOsR3G20NXDFC3pHaTU'
};
*/

rp(options)
  .then(res => {
    console.log(res);
  }, err => {
    console.log(err);
  });