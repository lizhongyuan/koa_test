const Koa = require('koa');
// const proxy = require('koa2-proxy-middleware');
const proxy = require('koa-proxy');
const bodyparser = require('koa-bodyparser');

const app = new Koa();


/*
const options = {
    targets: {
        '/login': {
            target: 'http://127.0.0.1:9450',
            changeOrigin: true,
        },
        '/lzy': {
            target: 'http://127.0.0.1:6010',
            changeOrigin: true,
        }
    }
}

app.use(proxy(options));
*/


const options = {
    host: 'http://127.0.0.1:9450'
};
app.use(proxy(options))


app.use(bodyparser({
    enableTypes:['json', 'form', 'text']
}));

app.listen(3000);