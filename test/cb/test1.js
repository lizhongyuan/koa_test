const async = require('async');


// function funcA(data, cb) {
function funcA(cb) {

  console.log('funcA');

  setTimeout(() => {
    cb(null, '1234');
  }, 1000);
}

function cb1(data, cb) {
  
  console.log('cb1');

  setTimeout(() => {
    cb(null, data);
  }, 2000);
}

function cb2(data, cb) {

  console.log('cb2');
  
  setTimeout(() => {
    cb(null, data);
  }, 3000);
}

function cb3(data, cb) {
  
  console.log('cb3');
  
  setTimeout(() => {
    cb(null, data);
  }, 4000);
}


async.waterfall([ funcA, cb1, cb2, cb3 ], (err, data) => {
  if (err) {
    console.log(err.toString());
  } else {
    console.log('data:', data)
  }
});
