'use strict'


function cityErrorBodyConvert(e, metaData) {
    
    /*
    if (e.errcode && e.errmsg && e.errinfo) {
        return {
            type: 'application/json',
            content: JSON.stringify({
                code: e.code,
                status: e.status,
                message: e.message,
                details: e.details,
                traceId: e.traceId
            })
        };
    }
    else {
        return {
            type: 'application/json',
            content: JSON.stringify({
                errcode: metaData.errcode,
                errmsg: metaData.errmsg,
                errinfo: metaData.errinfo,
            })
        };
    }
    */
    
    return {
        type: 'application/json',
        content: JSON.stringify({
            errcode: e.status || metaData.errcode,
            errmsg: e.message || metaData.errmsg,
            errinfo: metaData.errinfo,
        })
    }
}


const cityHttpErrorHandleOption = {
    defaultHttpStatusCode: 400,
    bodyConverter: cityErrorBodyConvert
};


module.exports = cityHttpErrorHandleOption;