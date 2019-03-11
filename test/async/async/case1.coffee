async =require 'async'


# a = 10;
a = 0;


async.waterfall([
  (cb)->
    console.log("getb")
    setTimeout ()->
      if a is 0
        cb(new Error("a不能为0"))
      else
        b = 1 / a
        cb(null, b) #在这里通过回调函数把b传给下一个函数，记得一定要加上null，才能调用数组中得下一个函数，否则，会直接调用最终的回调函数，然后结束函数，则后面的函数将不再执行
    , 1000

  (b, cb)->
    setTimeout ()->
      console.log("getc")
      c = b + 1
      cb(null, c)
    , 1000

], (err, result)->
  if err
    console.log('catch error:', err)
  else
    console.log('c:' + result)
)