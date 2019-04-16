'use strict';


function c1(externalParams, deliveredParams, throwError) {

  // const deliveredType = deliveredParams.type ? deliveredParams.type : 'no';

  console.log('c1');
  return new Promise((resolve, reject) => {
    resolve({
      // deliverType: deliveredType,
      type: 'c',
      data: 'c1'
    })
  });

}


function c2(externalParams, deliveredParams, throwError) {

  // const deliveredType = deliveredParams.type ? deliveredParams.type : 'no';

  console.log('c2');
  return new Promise((resolve, reject) => {
    resolve({
      // deliverType: deliveredType,
      type: 'c',
      data: 'c2'
    })
  });

}


module.exports = {
  c1,
  c2
};
