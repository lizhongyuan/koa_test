require('coffee-script')


org = require './org'


###
mongoose = require('mongoose')
Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/kuser_530')
###


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



###
查询成本中心负责人相关信息
@param {String} code 成本中心编码
@callback {String|Object} err
@callback {Object} data
@callback {Object} data.costcenterManager 成本中心负责人，有可能是 null
@callback {String} data.costcenterManagerIsDgm 成本中心负责人是公司副总
@callback {String} data.costcenterManagerIsOrgManager 成本中心负责人是直属部门的经理
@callback {Object} data.costcenterOrg 成本中心直属部门，有可能是 null
@callback {Object} data.costcenterOrgs 成本中心归属的部门层级，最高到公司层级
###
user.costcenterInfo = (code, cb)->
  return cb '成本中心参数缺失' if !code
  # 成本中心归属的部门
  _costcenterOrg = (cb)->
    _getCostOrg = (cb)->
      q = {costcenters:code}
      org.model.findOne q ,cb

    _getSupOrgs = (costcenterOrg, cb)->
      data = {
        costcenterOrg:costcenterOrg
        costcenterOrgs:[]
      }
      return cb null, data if !costcenterOrg

      data.costcenterOrg = dbutil.extractOrgCommon costcenterOrg
      costOrgId = costcenterOrg._id + ''
      org.findSuperOrgs costOrgId, true, (err, orgs)->
        return cb err if err
        data.costcenterOrgs = orgs.map (v)->dbutil.extractOrgCommon v
        cb null, data

    async.waterfall [_getCostOrg, _getSupOrgs], cb

  # 成本中心负责人
  # costuser costcenterlogin costcenterdgm
  _costcenterManager = (cb)->
    q = {
      roles:{$elemMatch:{
        "name" : "approval_costcenter_manager"
        "extra" : code
      }}
      status: {$ne:'X'}
    }
    user.model.findOne q ,cb

  _done = (err ,rst)->
    return cb err if err

    data = rst._costcenterOrg
    userDoc = rst._costcenterManager
    return cb null, data if !userDoc

    userDoc = userDoc.toObject()
    data.costcenterManager = dbutil.extractUserCommon userDoc
    # 特殊检查 成本中心领导是否是副总
    userDoc.roles.some (role)->
      if role.name == 'approval_dgm'
        data.costcenterManagerIsDgm = '1'
        return true

    # 特殊检查 判断成本中心负责人是否担任成本中心归属部门领导
    costOrgDoc = data.costcenterOrg
    if costOrgDoc
      costOrgId = costOrgDoc._id + ''
      userDoc.roles.some (role)->
        if 'approval_gmanager' == role.name
          if(_.some role.extra, (v)->v == costOrgId)
            data.costcenterManagerIsOrgManager = '1'
            return true

    cb null ,data

#_task = {_costcenterOrg, _costcenterManager}
#async.parallel _task ,_done


getAllCostCenter = () ->
  return new Promise (resolve, reject)->
    user.model.find({}, { roles: 1})
      .then (res)->
        resolve res
      , (err)->
        reject err

gArr = []


getAllCostCenterItems = ()->

  retArr = []

  return new Promise (resolve, reject)->
    getAllCostCenter()
      .then (data)->

        rolesArr = data.map (item)->
          id: item._id.toString()
          roles: item.roles

        for item in rolesArr
          if item.roles is undefined or item.roles is null
            continue

          curUserId = item.id

          for role in item.roles
            if role.params is undefined or role.params is null
              continue
            curRoleName = role.name
            curRoleId = role._id
            for roleParam in role.params
              if roleParam is undefined or roleParam is null
                continue
              if roleParam.costcenter is undefined  or roleParam.costcenter is null
                continue

              retArr.push
                uid: curUserId,
                roleName: curRoleName,
  # roleId: curRoleId,
                costCenter: roleParam.costcenter

              resolve retArr
      , (err)->
        console.log 'err:', err
        reject err


getAllCostCenterItems()
  .then (data)->
    console.log data
  , (err)->
    console.log err
