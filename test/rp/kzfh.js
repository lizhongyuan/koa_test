'use strict';


const rp = require('request-promise');


const options = {};

options.method = 'POST';
// options.uri = 'http://127.0.0.1:6010/shell/kzfh/list';
options.uri = 'http://127.0.0.1:9450/kzfh/list';
options.headers = {
    authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHBpcnlEYXRlIjoiMjAxOS0wMS0yNVQwNTo1OToxMCswMDowMCJ9.6AuBNMd7C-IKLX_Xj9pCTh6gLOsR3G20NXDFC3pHaTU'
};

rp(options)
  .then(res => {
    console.log(res);
  }, err => {
    console.log(err);
  })