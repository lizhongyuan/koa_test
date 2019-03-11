const async = require('async');







function water1(data, cb) {
  async.waterfall([
    func1,
    func2,
    func3
  ], function (err, result) {
    console.log('water1 get result:', result);
    cb(err, result);
  });
}

function water2(cb) {
  async.waterfall([
    func1,
    water1
  ], finish2)
}

// water1(123, ()=> {});
water2(()=> {});


function func1(callback) {
  callback(null, 'one');
}

function func2(arg1, callback) {
  callback(null, 'three');
}

function func3(arg1, callback) {
  callback(null, 'done');
}

function finish2(err, result) {
  if (err) {
    console.log(err.toString());
  } else {
    console.log('water2 finish, get result:', result);
  }
}