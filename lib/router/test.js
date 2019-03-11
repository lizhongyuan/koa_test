'use strict';

const Controller = require('../controller');

const routes = [
    /**
     *
     */
    {
        method: 'get',
        path: '/test',
        handler: [ Controller.Test.test1 ]
    },
];

module.exports = routes;
