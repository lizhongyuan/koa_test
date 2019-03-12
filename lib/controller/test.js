'use strict';

const { Test } = require('../service');

exports.test1 = async function test1(ctx, next) {
    try {
        let res = await Test.Test.test1(ctx);
        ctx.status = res.status;
        ctx.body = res.body;
    } catch(err) {
        ctx.status = err.status;
        ctx.body = err.body;
    }
};

