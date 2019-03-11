'use strict'


module.exports = {

    "city-service": {
        metadata: {
            httpStatusCode: 401,
            errcode: 123456,
            errinfo: 'city test errinfo',
            errmsg: 'city test errmsg'
        },

        classes: {
            error1: {
                metadata: {
                    httpStatusCode: 402,
                    errcode: 1234,
                    errinfo: 'city test errinfo',
                    errmsg: 'city test errmsg'
                }
            }
        }
    },
}
