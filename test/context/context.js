const logger = require('logger');


const getTraceId = require('...');

class context {
  constructor(ctx) {
    if (ctx === undefined) {
      ctx = {}
    }
    
    ctx.logger =  logger
    ctx.traceId =  getTraceId();
  }
  
  setTraceId(traceId) {
    ctx.traceId = traceId
  }
}
