require('coffee-script')


mongoose = require './mongoInstance'

sdef =
  name: {type: String, unique: true, require: true}
  value: {}
  desc: String
  createDate: {type: Date, index: 0, unique: false, require: true, default: Date.now}


dbenum = {}
dbenum.model = mongoose.model('dbenum', sdef);

# 查询 dbenum 集合 name = key
dbenum.getEnum = (name, cb)->
  dbenum.model.findOne {name: name}, cb

#向mongo和内存更新枚举
dbenum.resetEnum = (name, data, cb)->
  enumData = {name: name, value: data, createDate: new Date()}
  # 更新缓存
  mdb.enumcachefn.resetEnum name, enumData.value
  # 更新数据库
  dbenum.model.update {name: name}, enumData, {upsert: true}, (err, rst)->
    if 'function' == typeof cb
      cb err, enumData

dbenum.getEnumAsync = (name)->
  dbenum.model.findOne {name: name}

print = (err, data)->
  if err
    console.log err
    return

  for x in data.value
    console.log x.sub


# 从450的平铺类型数据中获取所有成本中心编码
getCostCenterFromValue = (value)->
  costCenterArr = []
  keys = Object.keys(value)
  for key in keys
    curCorpArr = value[key]
    for item in curCorpArr
      curCostCenter = item.code
      costCenterArr.push(curCostCenter)

  return costCenterArr


traverse = (node, costCenterArr)->
  if node.sub is null and node.code isnt undefined
    costCenterArr.push(node.code)
    return

  for subNode in node.sub
    traverse(subNode, costCenterArr)

getLeafCostCenterArr = (node)->
  costCenterArr = []
  traverse(node, costCenterArr)
  return costCenterArr



# 从450的树类型数据中获取所有成本中心编码
getCostCenterFromTreeValue = (value)->
  costCenterArr = []

  for item in value
    curCostCenterArr = getLeafCostCenterArr(item)
    for costCenter in curCostCenterArr
      if costCenterArr.indexOf(costCenter) is -1
        costCenterArr.push(costCenter)

  return costCenterArr


#从dbenums中获取costcenter数据
getAlldbenumsCostCenterStr = ()->
  return new Promise (resolve, reject)->
    dbenum.getEnumAsync('costcenter')
      .then (res)->
        # resolve res.value
        #costCenterArr = getCostCenterFromValue(res.value)
        costCenterArr = getCostCenterFromTreeValue(res.value)

        # console.log costCenterArr
        resolve costCenterArr
      , (err)->
        reject err


getAlldbenumsCostCenterStr()
  .then (data)->
    console.log data.length
  , (err)->
    console.log 'err:', err


module.exports = {
  getAlldbenumsCostCenterStr
}
