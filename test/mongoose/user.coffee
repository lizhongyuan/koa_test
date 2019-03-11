require('coffee-script')


{ getAlldbenumsCostCenterStr } = require './dbenum'
Promise = require 'bluebird'

# org = require './org'

mongoose = require './mongoInstance'


dbutil = {} #使用dbutil
dbutil.roles =
  text: {type: String}
  name: {type: String}
  params: [{}]
  extra: []


# schema
userSchema = {
  code:{type : String, unique : false, require : false}
  login : {type : String, unique : true, require : true}
  pwd : {type : String,  unique : false, require : true}
  reimbursePwd : {type : String,  unique : false, require : true}    # 二次密码
  name : {type : String, unique : false, require : true}
  title : {type : String, unique : false, require : true}
  orgid :  {type : mongoose.Schema.Types.ObjectId, unique : false, require : true}
  orgname : {type : String, unique : false, require : true}
  busi_roles : [{code : {type : String},name : {type : String}}]
  roles : {type : [dbutil.roles] ,unique : false, require : true}
  contact : {type : {tel : String, email : String, phone : String, fax : String} ,unique : false, require : false}
  baseinfo : {type : {birthday : Date, entertime : Date, sex : String} ,  unique : false, require : false}
  belongaddr: String
  office: String
  status: String
  subscribeprctypes: [{_id:false, code : String, name : String}]
  isoperatior: String
  logintime: {type: Date}
  logouttime : {type: Date}
  createdate : {type: Date}
  expirydate : {type: Date} #有效日期
  orgcode : {type: String}
  belongaddrcode: {type: String}
  online : String
  warehousecompany : String
  wxqyuid: {type: String}
}


user= {}
user.model = mongoose.model('user', userSchema);


getAllCostCenter = () ->
  return new Promise (resolve, reject)->
    user.model.find({}, { roles: 1})
    # user.model.findOne({}, { roles: 1})
      .then (res)->
        resolve res
      , (err)->
        reject err


# 测试一个用户的数据
getOneCostCenter = () ->
  return new Promise (resolve, reject)->
    user.model.find({_id: "5745653fc05e086f1d6375d7"}, { roles: 1})
    # user.model.findOne({}, { roles: 1})
      .then (res)->
        resolve res
      , (err)->
        reject err

getUniCostCenter = (userId, costCenters)->
  for costCenter in costCenters
    curUniCostCenter = costCenter.substr(-7)
    curUniCostCenter


gArr = []

getUserCostCenterInfo = (data)->
  retArr = []
  rolesArr = data.map (item)->
    id: item._id.toString()
    roles: item.roles

  for item in rolesArr
    if item.roles is undefined or item.roles is null
      continue

    curUserId = item.id
    curRoles = item.roles
    curRolesIndex = -1

    for role in item.roles

      curRolesIndex++

      if role.params is undefined or role.params is null
        continue
      curRoleName = role.name


      curParamsIndex = -1
      for roleParam in role.params
        curParamsIndex++
        if roleParam is undefined or roleParam is null
          continue
        if roleParam.costcenter is undefined  or roleParam.costcenter is null
          continue

        curUniCostCenter = getUniCostCenter(curUserId, roleParam.costcenter)
        retArr.push
          uid: curUserId
          roles: curRoles
          rolesIndex: curRolesIndex
          paramsIndex: curParamsIndex
          roleName: curRoleName
          costCenter: roleParam.costcenter
          uniCostCenter: curUniCostCenter

  return retArr


# 检查成本中心编码
checkCostCenterValid = (arr)->
  inValidCostCenterNum = 0
  invalidMap = {}

  return new Promise (resolve, reject)->
    promiseChain = Promise.resolve()
      .then ()->
        return getAlldbenumsCostCenterStr()
      .then (costCenterArr)->
        for item in arr
          curCostCenterArr = item.costCenter
          for costCenter in curCostCenterArr
            if costCenterArr.indexOf costCenter is -1
              if invalidMap[item.uid] is undefined
                invalidMap[item.uid] = [ costCenter ]
              else
                invalidMap[item.uid].push(costCenter)
              inValidCostCenterNum++

        resolve {
          num: inValidCostCenterNum,          #错误数量
          map: invalidMap                     #错误编码map
          dbenumCostCenterArr: costCenterArr  #正确成本中心数组
        }
      , (err) ->
        reject err


# 获取user的所有涉及成本中心的数据字段
getAllCostCenterItems = ()->
  return new Promise (resolve, reject)->
    promiseChain = Promise.resolve()
      .then ()->
        return getAllCostCenter()
        # return getOneCostCenter()  #一个用户的, 用于测试
      , (err) -> reject err
      .then (data)->
        userCostCenterInfo = getUserCostCenterInfo(data)
        resolve userCostCenterInfo
      , (err)->
        console.log 'err:', err
        reject err

###
testCostCenter = [
  '9100A11F61',
  '9100A11FA1',
  '9100A11FB1',
  '9100A11R61',
  '9100A11R81',
  '9200A11R81'
]
###


# 找到uniCostCenter数组对应的所有costcenter
getExtendCostCenterByUni = (uniCostCenterArr, allCostCenterArr)->
  extendArr = []
  for uniCostCenter in uniCostCenterArr
    for costCenter in allCostCenterArr
      isSubStr = costCenter.length - uniCostCenter.length is costCenter.indexOf(uniCostCenter)
      inExtendArr = extendArr.indexOf(costCenter) isnt -1
      if isSubStr && !inExtendArr
        extendArr.push(costCenter)

  return extendArr


globalUserCostCenterInfo = null
dbenumCostCenterArr = null


# 获取所有用户的costCenter对应数据
getAllCostCenterItems()
  .then (userCostCenterInfo)->
    globalUserCostCenterInfo = userCostCenterInfo

    # console.log globalUserCostCenterInfo

    # 查错误成本中心编码
    return checkCostCenterValid(userCostCenterInfo)
  , (err)-> console.log err
  .then (res)->
    console.log 'wrong num:', res.num
    console.log 'wrong map:', res.map

    dbenumCostCenterArr = res.dbenumCostCenterArr   #

    # console.log res
    return Promise.each globalUserCostCenterInfo, (item)->
      return new Promise (resolve, reject)->
        curId = item.uid
        curRoles = item.roles
        curRolesIndex = item.rolesIndex
        curParamsIndex = item.paramsIndex

        ###
        console.log 'curId:', curId
        console.log 'curRoles:', curRoles
        console.log 'curRolesIndex:', curRolesIndex
        console.log 'curParamsIndex:', curParamsIndex
        ###

        costCenterArr = item.costCenter
        curExtendCostCenterArr = getExtendCostCenterByUni(item.uniCostCenter, dbenumCostCenterArr)

        for extendCostCenter in curExtendCostCenterArr
          if costCenterArr.indexOf(extendCostCenter) is -1
            costCenterArr.push(extendCostCenter)

        (curRoles[curRolesIndex].params)[curParamsIndex].costcenter = costCenterArr

        #(curRoles[curRolesIndex].params)[curParamsIndex].unicostcenter = item.uniCostCenter
        (curRoles[curRolesIndex].params).push {
          unicostcenter: item.uniCostCenter
        }

        user.model.findOneAndUpdate {
          _id: curId
        }, {
          roles: curRoles
        }
          .then (res)->
            resolve(res)
          , (err)-> reject err
  .then (res)->
    console.log '此处生成update文件和错误costcenter文件'
  , (err)-> console.log err