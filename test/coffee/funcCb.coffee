require('coffee-script')

async = require 'async'


funcA = (cb)->
  timeout = 1000
  setTimeout ()->
    cb null, timeout
  , timeout

timeoutCb = (err, timeout)->
  if err
    console.log 'err:', JSON.stringify(err)
    return

  console.log 'get timeout:', timeout

funcA(timeoutCb)
