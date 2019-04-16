'use strict';


function b1(externalParams, deliveredParams, throwError) {

  // const deliveredType = deliveredParams.type ? deliveredParams.type : 'no';

  console.log('b1');
  return new Promise((resolve, reject) => {
    resolve({
      // deliverType: deliveredType,
      type: 'b',
      data: 'b1'
    })
  });

}


function b2(externalParams, deliveredParams, throwError) {

  // const deliveredType = deliveredParams.type ? deliveredParams.type : 'no';

  console.log('b2');
  return new Promise((resolve, reject) => {
    resolve({
      // deliverType: deliveredType,
      type: 'b',
      data: 'b2'
    })
  });

}


module.exports = {
  b1,
  b2
};
