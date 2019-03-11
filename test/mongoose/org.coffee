org = exports? and exports or @org = {}

async = require 'async'

tree = require('./tree.coffee')
_ = require 'underscore'

{ getAlldbenumsCostCenterStr } = require './dbenum'

mongoose = require './mongoInstance'
Promise = require 'bluebird'


orgSchema =
  pid : { type : String, require : true },
  orgname : { type : String, require : true, trim: true }
  level: Number
  costcenters:[String]
  costcenter:String
  createtime: {type: Date}

org = {}
org.model = mongoose.model('org', orgSchema);


###
# organization model, you can add method
org.compile = (mongoose) ->
  sdef =
    pid : { type : String, require : true },
    orgname : { type : String, require : true, trim: true }
    level: Number
    costcenters:[String]
    costcenter:String
    createtime: {type: Date}

  # define schema, model
  org.schema = new mongoose.Schema sdef
  org.model = mongoose.model 'Org', org.schema
###

org.c = (doc, callback) ->
  org.model.create(doc,callback)

org.r = (condition, callback) ->
  org.model.find(condition, callback)

org.u = (conditions, update, options, callback) ->
  org.model.update(conditions, update, options, callback)

org.d = (conditions, callback) ->
  org.model.remove(conditions, callback)

org.findAll  =  (option ,callback)->
  if typeof option == 'function'
    callback = option
  query = org.model.find()
  query = query.select  {pid:1, orgname: 1, level: 1}
  query.exec callback

org.findOne = (conditions, callback) ->
  org.model.findOne(conditions, callback)

org.findById = (id ,cb)->
  org.model.findById id ,cb

###
org.schema.statics.findByField = (conditions, callback) ->
  org.model.findById(conditions, callback)
###

org.findSubOrgs = (orgids, callback)->
  org.model.find({pid: {$in: orgids}}, callback)

org.findOnelevelBelongs = (orgid, hasuser, callback) ->
  _findusers = (cb)->
    user.model.find {orgid: orgid, status: {$ne: 'X'}} ,cb

  _findsonandgrandson = (cb) ->
    newsub = []
    _findsuborgs = (cb)->
      query = org.model.find {pid: orgid}
      query.select {pid:1, orgname: 1, level: 1, costcenter:1, costcenters:1}
      query.exec cb

    _findgrandson = (subs, cb)->
      async.forEachOf(subs,
        (item,idx, callback) ->
          query = org.model.count {"pid": item._id}
          query.exec (err, doc)->
            newitem = item.toObject()
            newitem.grandsoncount = doc
            newsub[idx] = newitem
            callback err
      ,(err)->
        cb err
      )
    _done = (err)->
      cb err, newsub
    async.waterfall [_findsuborgs, _findgrandson], _done

  _done = (err ,data)->
    if err
      callback err ,data
    if hasuser
      rst =
        users:data[0]
        orgs:data[1]
    else
      rst = orgs:data[1]
    callback null ,rst
  async.parallel([_findusers ,_findsonandgrandson] ,_done)


  org.findSuperOrgs = (id,selfContained, cb)->
    if typeof selfContained == 'function'
      cb = selfContained
      selfContained = false
    id = id + ''
    parent = []
    org.findAll null, (err, docs)->
      if err
        cb err, null
      else
        parent = tree.getParent(id, docs ,selfContained)
        cb null, parent

  org.findInferiorOrgs = (id,selfContained, cb)->
    if typeof selfContained == 'function'
      cb = selfContained
      selfContained = false

    if _.isArray id
      id = _.map id, (one)-> one + ''
    else
      id = id + ''

    children = []
    org.findAll null, (err, docs)->
      if err
        cb err, null
      else
#支持单个节点或多个节点下
        if _.isArray id
          children = []
          _.each id, (one) ->
            childs = tree.getChild(one, docs, selfContained)
            children = _.union children, childs
        else
          children = tree.getChild(id, docs, selfContained)
        cb null, children
  #        children = tree.getChild(id, docs, selfContained)
  #        cb null, children

  org.findOrgWithLevel = (orgid, level, cb)->
    level = Number level
    deptOwned = {}
    org.findSuperOrgs orgid ,true ,(err ,orgList)->
      if err
        return cb err, deptOwned
      orgList.some (org)->
        if level == org.level
          deptOwned = org
          true
      return cb null, deptOwned


###
  mongoose find 封装函数
  @param param {
    _id
    orgid
    orgids [String|ObjectId] 部门id数组
    pid 父部门id
    orglevel: Number 部门等级
  }
###
org.find = (param ,cb)->
  q = {}
  q['_id'] = param._id if param._id
  q['_id'] = param.orgid if param.orgid
  q['_id'] = {$in: param.orgids} if param.orgids
  q['pid'] = param.pid if param.pid
  q['level'] = param.orglevel if 'orglevel' of param
  q['costcenters'] = param.costcenter if param.costcenter
  query = org.model.find q
  query.find cb


###
  列表查询封装函数
  @param param { 见 find
  }
  @callback
    err
    rst {
      items [{}]
    }
###
org.orgList = (param ,cb)->
  q = {}
  q['_id'] = param.orgid if param.orgid
  q['_id'] = {$in: param.orgids} if param.orgids
  q['pid'] = param.pid if param.pid
  q['level'] = param.orglevel if 'orglevel' of param
  query = org.model.find q
  query.find (err ,rst)->cb err ,{items: rst}


###
提取org doc中的通用字段
@param doc 原始org doc
@return data {
  _id: String
  orgname: String
  pid: String
  level: Number
}
###
org.pickOrgDocCommon = (doc)->
  data = _.pick doc ,['_id','orgname','pid','level']
  data._id = data._id + ''
  return data


###
  查询部门列表，并以_id键值，构建map数据结构
  @param param {} 见orgList
###
org.orgMap = (param ,cb)->
  _op = _.clone param
  org.orgList _op ,(err ,rst)->
    return cb err if err

    orgMap = {}
    rst.items.forEach (item)->orgMap[item._id] = item

    cb null ,orgMap


###
给定部门id，查找父部门。返回结果部门列表中，索引小的部门层级高
注：由于部门层级较少，暂且使用循环查询数据库的方式

op 可选参数：
  orgid {String} 必须 子部门id
  level {Number} 可选 需要查出来的最高部门层级（level值最小）
  self {Boolean} 默认值true，结果列表中的最后一个元素是否是当前部门。必须显式传入self参数，才会被判断为false

@param op {Object} 参数选项
@callback
  err
  orgs {Array}
###
org.getSupOrgs = (op ,cb)->
  ops = _.clone op
  ops.self = true if !('self' of ops)

  orgList = []
  curOrg = {pid:ops.orgid} #当前迭代查出的部门，当pid无值或部门层级等于给定值时，迭代终止

  _test = ()->
    return true if !curOrg.pid
    return false

  _do = (cb)->
    org.find {_id:curOrg.pid} ,(err ,rst)->
      return cb err if err
      return cb null ,{} if !rst.length

      data = rst[0]

      if ('level' of ops) && ops.level >= data.level
        curOrg = {}
        orgList.unshift data if ops.level == data.level
      else
        orgList.unshift data
        curOrg = data

      cb null

  _done = (err)->
    return cb err if err

    orgList.pop() if !ops.self
    cb null ,orgList

  async.until _test ,_do ,_done


###
查找成本中心归属的部门
@param code {String} 成本中心编码
@callback
  err
  org {Object} plain object 成本中心归属的部门 有可能是null
###
org.getCostcenterOrg = (code ,cb)->
  op = {costcenter: code}
  org.find op ,(err ,rst)->cb err ,rst?[0]



getAllOrg = () ->
  return new Promise (resolve, reject)->
    org.model.find({}, { costcenters: 1, costcenter: 1 })
    # user.model.findOne({}, { roles: 1})
      .then (res)->
        resolve res
      , (err)->
        reject err

# "5742a607779ec2cb740517f6"
# 测试一个用户的数据
getOneOrg = (orgId) ->
  return new Promise (resolve, reject)->
    org.model.find({ _id: orgId }, { costcenters: 1, costcenter: 1 })
      .then (res)->
        resolve res
      , (err)->
        reject err


# 获取统一成本中心编码数组, 截取后7位
getUniCostCenterArr = (costCenterArr)->
  for costCenter in costCenterArr
    curUniCostCenter = costCenter.substr(-7)
    curUniCostCenter
# 获取统一成本中心编码, 截取后7位
getUniCostCenter = (costCenter)->
  curUniCostCenter = costCenter.substr(-7)
  return curUniCostCenter


getOrgCostCenterInfo = (data)->
  orgCostCenterArr = []

  for item in data
    curNode = {}
    curNode.orgId = item._id.toString()

    curUniCostCenter = null
    curUniCostCenterArr = null

    ###
    if item.costcenters isnt undefined and item.costcenters isnt null
      if item.costcenter is undefined or item.costcenter is null
        item.costcenter = (item.costcenters)[0]

      curUniCostCenterArr = getUniCostCenterArr(item.costcenters)
      curNode.costcenters = item.costcenters
      curNode.unicostcenters = curUniCostCenterArr

    if item.costcenter isnt undefined and item.costcenter isnt null
      curUniCostCenter = getUniCostCenter(item.costcenter)
      curNode.costcenter = item.costcenter
      curNode.unicostcenter = curUniCostCenter
    ###

    if item.costcenter isnt undefined and item.costcenter isnt null
      curUniCostCenter = getUniCostCenter(item.costcenter)
      curNode.costcenter = item.costcenter
      curNode.unicostcenter = curUniCostCenter

    if item.costcenters isnt undefined and item.costcenters isnt null
      curUniCostCenterArr = getUniCostCenterArr(item.costcenters)
      curNode.costcenters = item.costcenters
      curNode.unicostcenters = curUniCostCenterArr

    orgCostCenterArr.push curNode

  return orgCostCenterArr


# 检查org成本中心编码
checkCostCenterValid = (arr)->
  inValidCostCenterNum = 0
  invalidMap = {}

  return new Promise (resolve, reject)->
    promiseChain = Promise.resolve()
      .then ()->
        return getAlldbenumsCostCenterStr()
      .then (costCenterArr)->
        for item in arr
          if item.costcenters isnt undefined

            # costcenters字段
            for costCenter in item.costcenters
              if costCenterArr.indexOf costCenter is -1
                if invalidMap[item.orgId] is undefined
                  invalidMap[item.orgId] = [ costCenter ]
                else
                  invalidMap[item.orgId].push(costCenter)
              inValidCostCenterNum++

          if item.costcenter isnt undefined
            if costCenterArr.indexOf item.costcenter is -1
              if invalidMap[item.orgId] is undefined
                invalidMap[item.orgId] = [ item.costcenter ]
              else
                invalidMap[item.orgId].push(item.costcenter)
              inValidCostCenterNum++

        resolve {
          num: inValidCostCenterNum,          #错误数量
          map: invalidMap                     #错误编码map
          dbenumCostCenterArr: costCenterArr  #正确成本中心数组
        }
      , (err) -> reject err


# 获取user的所有涉及成本中心的数据字段
getAllOrgItems = ()->
  return new Promise (resolve, reject)->
    promiseChain = Promise.resolve()
      .then ()->
        return getAllOrg()
        # return getOneOrg("5742a607779ec2cb740517f6")  #一个用户的, 用于测试
      , (err) -> reject err
      .then (data)->
        orgCostCenterInfo = getOrgCostCenterInfo(data)
        resolve orgCostCenterInfo
      , (err)-> reject err


###
org.find {id: '5742a607779ec2cb740517f9'}, (err, data)->

  if err
    console.log err
    return

  console.log data
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


globalOrgCostCenterInfo = null
dbenumCostCenterArr = null


getAllOrgItems()
  .then (orgCostCenterInfo)->
    globalOrgCostCenterInfo = orgCostCenterInfo

    # console.log globalOrgCostCenterInfo

    # 查错误成本中心编码
    return checkCostCenterValid(orgCostCenterInfo)
  , (err)-> console.log err
  .then (res)->

    console.log 'wrong num:', res.num
    console.log 'wrong map:', res.map

    dbenumCostCenterArr = res.dbenumCostCenterArr   #

    # console.log res

    return Promise.each globalOrgCostCenterInfo, (item)->
      return new Promise (resolve, reject)->

        curOrgId = item.orgId
        curCostCenters = item.costcenters
        curUniCostCenters = item.unicostcenters
        curCostCenter =  item.costcenter
        curUniCostCenter = item.unicostcenter

        ###
        console.log 'curOrgId:', curOrgId
        console.log 'curCostCenters:', curCostCenters
        console.log 'curUniCostCenters:',curUniCostCenters
        console.log 'curCostCenter:', curCostCenter
        console.log 'curUniCostCenter:', curUniCostCenter
        ###

        needUpdate = false
        updateOptions = {}

        if curCostCenters isnt undefined or curCostCenter isnt undefined
          needUpdate = true

        if curUniCostCenters isnt undefined and curCostCenters isnt undefined
          curExtendCostCenterArr = getExtendCostCenterByUni(curUniCostCenters, dbenumCostCenterArr)

          for extendCostCenter in curExtendCostCenterArr
            if curCostCenters.indexOf(extendCostCenter) is -1
              curCostCenters.push(extendCostCenter)

          updateOptions.costcenters = curCostCenters

        if curUniCostCenter isnt undefined
          updateOptions.costcenter = curUniCostCenter

        if needUpdate
          org.model.findOneAndUpdate {
            _id: curOrgId
          }, updateOptions
            .then (res)->
              # console.log res
              resolve(res)
            , (err)-> reject err
        else
          resolve 0
  .then ()->
    console.log '此处生成update文件和错误costcenter文件'
  , (err)-> console.log err