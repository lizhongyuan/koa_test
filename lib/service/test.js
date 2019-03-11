'use strict';

exports.test1 = async function test1() {
    return Promise.resolve(
        {
            status:200,
            body: {
                data: 'test1',
                info: 'lzy test ok',
                msg: 'lzy test ok'
            }
        }
    );
    
    /*
    return Promise.resolve(
        {
            status:500,
            body: {
                data: 'test1',
                info: 'lzy test err',
                msg: 'lzy test err'
            }
        }
    );
    */
};