'use strict';


const router = require('koa-joi-router')();
const routePaths = require('require-directory')(module);

Object.keys(routePaths).forEach(path => {
    if (path !== 'index') {
        router.route(routePaths[path]);
    }
});

module.exports = router;
