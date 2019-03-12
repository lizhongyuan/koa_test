'use strict';


const bodyparser = require('koa-bodyparser');
const passport = require('koa-passport');

const Router = require('./lib/router');
const Service = require('./lib/service');
const Koa = require('koa');


const app = new Koa();

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// response

/*
app.use(async ctx => {
  ctx.body = 'Hello World';
});
*/

app.use(bodyparser());
app.use(Router.middleware());

app.keys = [ 'secret' ];

// session
Service.Init.Session(app);

app.use(passport.initialize());
app.use(passport.session());


app.listen(3000);
