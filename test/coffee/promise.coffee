
Promise = require 'bluebird'


funcA = (num)->
  return new Promise (resolve, reject)->
    if num is 0
      reject 'why zero'
    else
      resolve num

# funcA(0)
funcA(1)
  .then((res) ->
    console.log 'res:', res
  , (err)->
    console.log 'err:', err
  )