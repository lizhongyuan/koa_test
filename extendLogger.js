"use strict";


const { BaseLogger, Winston } = require('@sensoro/node-logger');

const { format } = require('util');
const PlaceHolder = "-";
const traceIdHeader = "x-trace-id";
// const BaseLogger = require("./baseLogger");


// let { Url, TraceId } = require('../util');
// let { TraceId } = require('../util');
// let traceIdInstance = new TraceId();

const PWD = process.cwd();              // 默认日志文件路径
const DEFAULT_LOGGER_NAME = 'logger';   // 默认日志对象name

// let { Winston, globalWinstonInstance } = require('../service/winston');

let defaultOptions = {
    // fmt: 'app',
    name: DEFAULT_LOGGER_NAME,
    level: 'debug',
    dir: PWD + '/logs',
    filename: 'my',
    console: false,
    needErrorFile: false,
};

class ExtendLogger extends BaseLogger {
    
    constructor(options = defaultOptions) {
        super(options);
        
        // this.context.method = options.method ? options.method : PlaceHolder;
        
        let ctx = this.context;
        
        // 为兼容city-service和监控服务的日志
        /*
        ctx.app = options.app || PlaceHolder;
        ctx.pid = process.pid;
        ctx.ext = options.ext || PlaceHolder;
        */
        ctx.myItem = options.myItem || PlaceHolder;
        
        /*
        if (globalWinstonInstance[ctx.name] === undefined) {
            let winston = new Winston(ctx);
            globalWinstonInstance[ctx.name] = winston.getInstance(ctx.name);
        }
        */
    }
    
    /**
     * koa2 日志中间件
     * @param options 日志配置信息
     * @returns {buildKoa2LoggerHandler}
     */
    static middleware(options) {
        
        let loggerName;
        if (options.name === undefined) {
            loggerName = 'logger';
        }
        else {
            loggerName = options.name;
        }
        
        let cityServiceOptions = Object.assign({}, defaultOptions, options);
        
        let buildKoa2LoggerHandler = async function buildKoa2LoggerHandler(ctx, next) {
            
            /*
            let traceId;
            
            if (ctx.request.headers[traceIdHeader]) {
                traceId = ctx.request.headers[traceIdHeader];
            } else {
                traceId = traceIdInstance.generate();
            }
            
            ctx.traceId = traceId;
            */
            
            let method = ctx.req.method;
            // let uri = Url.getUri(method, ctx.url);
            
            let curOptions = Object.assign({
                // api: uri,
                // traceId: ctx.traceId,
                method: method,
            }, cityServiceOptions);
            
            let cityServiceNodeLoggerInstance = new PreviousLogger(curOptions);
            
            // set to koa ctx
            ctx[loggerName] = cityServiceNodeLoggerInstance;
            
            await next();
        };

        return buildKoa2LoggerHandler;
    };

    setMyItem(item) {
        this.context.myItem = item;
        return this;
    }

    getMyItem() {
        return this.context.myItem;
    }
    
    info(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        globalWinstonInstance[this.context.name].info(curLog);
    }
    
    debug(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        globalWinstonInstance[this.context.name].debug(curLog);
    }
    
    error(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        globalWinstonInstance[this.context.name].error(curLog);
    }
    
    warn(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        globalWinstonInstance[this.context.name].warn(curLog);
    }
    
    trace() {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        globalWinstonInstance[this.context.name].trace(curLog);
    }
    
    fatal() {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        globalWinstonInstance[this.context.name].fatal(curLog);
    }
}

let extendLogger = new ExtendLogger();

extendLogger.info('aaa');


// module.exports = PreviousLogger;