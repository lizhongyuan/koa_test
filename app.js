const Koa = require('koa');
const app = new Koa();


const Router = require('./lib/router');

const Service = require('./lib/service');

// logger

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

app.use(Router.middleware());
Service.Init.Session(app);

app.listen(3000);
