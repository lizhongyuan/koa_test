"use strict";


let Koa = require('koa');
let app = new Koa();
const port = 3009;

const { BaseLogger, Middleware } = require('node-logger');


const loggerOptions = {
  datePattern: 'YYYYMMDD-',   // 日志文件名时间格式
  isDatePrefix: true,         // 日志文件名时间是否是前缀
  name: 'logger',             // logger实例的名字, ctx.logger
  filename:"test",            // 日志文件名filename部分
  dir:'./log',                // 日志文件目录
  level: 'info',              // 最低日志等级
  console:false,              // 是否在console打印
  needErrorFile: true,        // 是否同时生成-error.log日志
};

const loggerOptions2 = {
  datePattern: '-YYYY-MM-DD',
  isDatePrefix: false,
  name: 'logger2',
  filename:"app",
  dir:'./log',
  level: 'debug',
  console:true,
};


app.use(Middleware(BaseLogger, loggerOptions));
app.use(Middleware(BaseLogger, loggerOptions2));

app.use(async function handler(ctx, next) {
  if (ctx.url === '/') {
    
    ctx.logger.setModule('root');
    ctx.logger.info('base logger test 1');
    ctx.logger.info('i am a template added by %s', 'lzy');
    ctx.logger.debug('lzy');
    ctx.logger.error('error!!');
    ctx.logger.debug('debug');
    
    ctx.logger2.info('base logger test 2');
    
    ctx.body = 'city logger!';
    
    await next();
  }
  
  if (ctx.url === '/debug') {
    
    ctx.logger.debug('lzy');
    
    ctx.body = 'City Service!';
  }
  
});


app.listen(port, function () {
  console.log(`服务程序在${port}端口启动`);
});

