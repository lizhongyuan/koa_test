'use strict';


function a1(externalParams, deliveredParams, throwError) {

  //const deliveredType = deliveredParams.type ? deliveredParams.type : 'no';

  console.log('a1');
  return new Promise((resolve, reject) => {
    resolve({
      // deliverType: deliveredType,
      type: 'a',
      data: 'a1'
    })
  });

}


function a2(externalParams, deliveredParams, throwError) {

  // const deliveredType = deliveredParams.type ? deliveredParams.type : 'no';

  console.log('a2');
  return new Promise((resolve, reject) => {
    resolve({
      // deliverType: deliveredType,
      type: 'a',
      data: 'a2'
    })
  });

}


module.exports = {
  a1,
  a2
};
