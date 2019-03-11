'use strict'


const lodash = require("lodash");

const { AppError, traitErrorMetadata } = require('@sensoro/utility');

const ect = require('./ect');


/*
function defaultErrorBody(e) {
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
*/


function myErrorBodyConvert(e, metaData) {
    if (e.errcode) {
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
}


/*
const defaultHttpErrorHandleOption = {
    defaultHttpStatusCode: 500,
    bodyConverter: defaultErrorBody
};
*/

const myHttpErrorHandleOption = {
    defaultHttpStatusCode: 500,
    bodyConverter: myErrorBodyConvert
};


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



// function createErrorHandlerForKoa(ect, option = {}) {
// function myErrorHandler(ect, option = {}) {

function myErrorHandler(ect, option) {
    option = lodash.merge({}, myHttpErrorHandleOption, option);
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield next();
        }
        catch (error) {
            if (error instanceof AppError) {
                const errorMetadata = traitErrorMetadata(ect, error.code);
                const body = option.bodyConverter(error, errorMetadata);
                ctx.response.status = errorMetadata.httpStatusCode || option.defaultHttpStatusCode;
                ctx.response.set('Content-Type', body.type);
                ctx.response.body = body.content;
            }
            else {
                throw error;
            }
        }
        return void 0;
    });
}


module.exports = myErrorHandler;