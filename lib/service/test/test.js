'use strict';


const sessionStore = require('../sessionStore');


exports.test1 = async function test1(ctx) {
  
  console.log(ctx.passport);

  sessionStore.set('token', 123);
  return Promise.resolve(
      {
          status:200,
          body: {
              data: 'test1',
              info: 'lzy test ok',
              msg: 'lzy test ok'
          }
      }
  );

  /*
  return Promise.resolve(
      {
          status:500,
          body: {
              data: 'test1',
              info: 'lzy test err',
              msg: 'lzy test err'
          }
      }
  );
  */
};