"use strict";

const config = require("config");
const Koa = require('koa');
const router = require('./lib/router');
const { BaseLogger, Middleware } = require("@sensoro/node-logger");
const { createErrorHandlerForKoa, AppError, traitErrorMetadata } = require("@sensoro/utility");
const cityEct = require('./lib/middleware/ect');
const cityErrorHandlerOption = require('./lib/middleware/cityOption');


let ect = {
    authentication: {
        // 为了预留可能的扩展，错误相关信息放到metadata中，而不是直接写在
        // 当前Object下
        metadata: {
            httpStatusCode: 401,
            // 假定通过MQTT设置遗言方式并关闭连接方式发送错误信息
            mqttErrorWill: { message: 'Authentication failed' },
            status: 100000, // 假定原来通过数字的方式定义的错误码
            message: 'Authentication failed',
        },
        
        // 当前错误类型下面的子类
        classes: {
            invalidPassword: {
                // 忽略httpStatusCode时，用上一层级的httpStatusCode
                metadata: {message: 'Username and password mismatch'}
            },
            // ...
        }
    },
    
    conflict: {
        metadata: {
            httpStatusCode: 409,
        },
        classes: {
            registration: {
                classes: {
                    emailConflict: {
                        metadata: {
                            httpStatusCode: 409,
                            message: 'Email is conflicts with another account',
                            status: 200001
                        }
                    },
                }
            }
        }
    }
}


const app = new Koa();

app.use(Middleware(BaseLogger, config['city-logger']));
app.use(createErrorHandlerForKoa(cityEct, cityErrorHandlerOption));




app.use(async function(ctx, next) {
    if (ctx.url === '/') {
        ctx.logger.info('city service 2');

        ctx.body = 'city service!';
    }
    else if (ctx.url === '/error') {
        let curAuthenticationError = new AppError('authentication.invalidPassword', 'Authentication failed')

        //console.log(JSON.stringify(curError));

        let metaData = traitErrorMetadata(ect, 'authentication.invalidPassword')

        console.log(metaData)

        // let curConflictError = new AppError('conflict.registration.emailConflict', 'lzy test error')
        let curConflictError = new AppError('conflict.registration.emailConflict')
        console.log(JSON.stringify(curConflictError))
        
        throw curConflictError;

        await next();

        /*
        let curConflictError2 = new AppError('conflict.registration.emailConflict', 'lzy test error')
            .withStatus(401)

        console.log(JSON.stringify(curConflictError2))
        */
    }
    else if (ctx.url === '/city') {

        let myError = new AppError('city.error1')

        throw myError;
    }
});


app.use(router.middleware());

// app.listen(3000);
app.listen(3001);

console.log("test start");

const io = require('socket.io')(app);
io.on('connection', client => {
    
    client.on('event', data => {
        console.log('data')
        console.log(data)
    })
    
    client.on('disconnect', () => {
        console.log('disconnect');
    })
})

var socketClient = require('socket.io-client')('http://localhost:3001/');
socketClient.on('connect', function(){});
socketClient.on('event', function(data){});
socketClient.on('disconnect', function(){});
