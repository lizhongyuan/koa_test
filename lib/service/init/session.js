'use strict';


const sessionStore = require('../session');
const session = require('koa-session');


const CONFIG = {
  key: 'koa:sess',
  store: sessionStore,
  expose: true,
  rolling: true,
  signed: false,
  maxAge: 24 * 60 * 60 * 1000,
  getSessionId,
};


function getSessionId(ctx, opts) {
  return ctx.headers['x-session-id'] || ctx.cookies.get(opts.key, opts);
}


module.exports = function(app) {
  app.use(session(CONFIG, app));
};
