﻿const config = require('config');
const moment = require('moment');
const createError = require('http-errors');
const { AlarmDisplay, AlarmRecord } = require('../../lib/web/model');
const Logger = require('../util/log.js');
const logger = Logger('alarm-service');
const Notice = require('./notice.js');
const { NAME_UNIT, ALARM_PLACE_MAP, ALARM_REASON_MAP, DISPLAY_STATUS_MAP } = require('../web/common');
const Timeout = require('./timeout');
const User = require('./user');
const Device = require('./device.js');
const GroupNotice = require('./groupNotice');
const Notification = require('./notification');
const { Redis } = require('../connection');
const XLSX = require('node-xlsx');
const xlsxStream = require('xlsx-write-stream');
const Through = require('through2');

const xlsxLogger = Logger('xlsx');

/**
 * @description 获取预警记录数量
 */
exports.count = async function count(condition) {
    return await AlarmDisplay.count(condition);
};

/**
 * @description 按字段获取预警统计数量
 */
exports.distinct = async function distinct(feild, condition) {
    const data = await AlarmDisplay.distinct(feild, condition);
    if (!data || !data.length) return 0;
    return data.length;
};

/**
 * @description 获取最近一条预警记录
 */
exports.getOneLastest = async function getOneLastest(condition) {
    const alarm = await AlarmDisplay
        .findOne(condition, {createdTime: 1}, {sort: {createdTime: -1}});
    
    if (!alarm) return null;
    return alarm.toJSON();
};

exports.findBriefOne = async function findBriefOne (condition = {}, feild = {}, options = {}) {
    const alarm = await AlarmDisplay.findOne(condition, feild, options);
    return alarm;
};

/**
 * @description 查找符合条件的预警记录
 */
exports.getWithQuery = async function getWithQuery({ appId, owners, alarmStatus, sensorTypes, unionTypes, sn: deviceSN, deviceName, beginTime, endTime, displayStatus, phone: phoneList, offset, limit, sorter = 'createdTime', order = false, istv, createdTime }) {
    const query = {
        isDeleted: false
    };
    
    // add tv support
    if (istv) {
        // add query createdTime field
        !alarmStatus && (query.createdTime = {
            $gte: moment().startOf('d').valueOf()
        });
        
        // set current supported unionType
        unionTypes = ['smoke', 'humidity|temperature', 'humidity|temp1|temperature', 'lpg', 'artificialGas', 'ch4'].join(',');
        
        // set limit and offset to 0 to get all alarms
        limit = 0;
        offset = 0;
        
        // if createTime exist add begin and end
        if (createdTime) {
            let begin = moment(createdTime).startOf('d').valueOf();
            let end = moment(createdTime).endOf('d').valueOf();
            
            query.createdTime = {
                $gte: begin,
                $lte: end
            };
        }
        
    }
    
    // 查询恢复状态
    if (alarmStatus) {
        if (alarmStatus.includes('threshold') ^ alarmStatus.includes('recovery')) {
            query.alarmStatus = alarmStatus.includes('threshold') ? 2 : 1;
        }
    }
    
    // 构建状态筛选值
    if (Array.isArray(displayStatus) && displayStatus.length) {
        query['displayStatus'] = {
            $in: displayStatus
        };
    }
    
    // 构建 sensorTypes 和 unionTypes 查询条件
    if (typeof sensorTypes !== 'undefined') {
        sensorTypes = [].concat(sensorTypes.split(','));
        query['sensorTypes'] = {
            $in: sensorTypes
        };
    }
    if (typeof unionTypes !== 'undefined') {
        unionTypes = [].concat(unionTypes.split(','));
        query['unionType'] = {
            $in: unionTypes
        };
    }
    
    // 支持按时间段过滤
    if (beginTime) {
        query.createdTime = query.createdTime || {};
        query.createdTime.$gte = new Date(+beginTime);
    }
    if (endTime) {
        query.createdTime = query.createdTime || {};
        query.createdTime.$lte = new Date(+endTime);
    }
    
    // 支持查询字段的使用
    for (const [key, value] of Object.entries({ deviceName, deviceSN, phoneList })) {
        if (typeof value === 'string') {
            query[key] = { $regex: new RegExp(RegExp.quote(value.trim())), $options: 'i' };
        }
    }
    
    // 使用剩余字段
    for (const [key, value] of Object.entries({ appId, owners })) {
        if (typeof value !== 'undefined') {
            // 同时支持数组和字符串形式的筛选
            if (typeof value === 'string' && value.includes(',')) {
                query[key] = {
                    $in: value.split(',')
                };
            } else if (Array.isArray(value) && value.length) {
                query[key] = {
                    $in: value
                };
            } else {
                query[key] = value;
            }
        }
    }
    
    // except battery if istv
    if (istv) {
        query['sensorTypes'] = { $nin: ['battery'] };
    }
    
    logger.info('获取预警记录列表，查询条件 :: %j, 分页选项 offset :: %d, limit :: %d, 按 %s %s 排序', query, offset, limit, sorter, order ? '正向' : '反向');
    // 统计数量及返回对应数据
    return [
        await AlarmDisplay.count(query),
        await exports.find(query, sorter, order, offset, limit)
    ];
};

/**
 * @description 查询预警记录，同时查询应属于每一条的records
 */
exports.find = async function find(condition, sorter, order, offset, limit) {
    const alarms = await AlarmDisplay
        .find(condition)
        .sort({[sorter]: order ? 1 : -1})
        .populate({
            path: 'owners',
            select: 'nickname'
        })
        .skip(offset)
        .limit(+limit);
    
    const allIds = [];
    const alarmMap = new Map();
    for (const alarm of alarms) {
        allIds.push(alarm._id.toString());
        alarmMap.set(alarm._id.toString(), alarm.toJSON());
    }
    
    const records = await AlarmRecord.find({ alarms: { $in: allIds }}).sort({ 'updatedTime': 1 });
    
    for (const record of records) {
        const alarmJSON = alarmMap.get(record.alarms.toString());
        alarmJSON.records = alarmJSON.records || [];
        alarmJSON.records.push(record.toJSON());
        alarmMap.set(record.alarms.toString(), alarmJSON);
    }
    
    return Array.from(alarmMap.values());
};

/**
 * @description 查找一条对应预警记录
 */
exports.findOne = async function findOne(condition) {
    const alarm = await AlarmDisplay
        .findOne(condition)
        .populate({
            path: 'owners',
            select: 'nickname _id'
        });
    
    if (!alarm) return null;
    const alarmJSON = alarm.toJSON();
    const records = await AlarmRecord.find({ alarms: alarm._id }).sort({ 'updatedTime': 1 });
    
    alarmJSON.records = records.map(record => record.toJSON());
    return alarmJSON;
};

/**
 * @description 查找对应的record
 */
exports.findRecord = async function findRecord(condition) {
    return await AlarmRecord.find(condition);
};

/**
 * @param  {Object} alarms 被操作预警记录列表
 * @return {Boolean} true || false
 * @description 判断 user 是否可以操作 alarms
 */
exports.canManage = function (user, alarms) {
    alarms = [].concat(alarms);
    
    // 用户未知
    if (!user) {
        return false;
    }
    
    // admin用户可管理所有预警记录
    if (User.isRole(user, 'admin')) {
        return true;
    }
    
    // dealers 用户可以管理所有同 appId 预警记录
    if (User.isRole(user, 'dealers')) {
        return alarms.every(alarm => user.appId && user.appId === alarm.appId);
    }
    
    // business 用户只能管理 owers 是用户id的预警记录
    if (User.isRole(user, 'business')) {
        return alarms.every(alarm =>
            (alarm.owners.id || alarm.owners).toString() === user._id.toString()
        );
    }
    return false;
};

/**
 * @description (标记)删除设备相关的预警记录
 * @param {array} devices 设备列表
 */
exports.deleteAbout = async function deleteAbout(devices) {
    if (!Array.isArray(devices)) {
        throw createError(500, 'devices must be array deleting records of alarm.');
    }
    
    return await AlarmDisplay.update({
        deviceSN: { $in: devices.map(device => device.sn) }
    }, {
        $set: { isDeleted: true }
    }, {
        multi: true
    });
};

/**
 * @description（标记）删除相关预警记录
 */
exports.remove = async function remove(condition) {
    const setting = {
        $set: {
            isDeleted: true
        }
    };
    
    const options = {
        multi: true
    };
    return AlarmDisplay.update(condition, setting, options);
};

/**
 * @description 获取通知人联系列表，涵盖设备上绑定的信息，分组信息，以及对应的商户级别通知联系人
 * @param  {String} uid    设备拥有者，子账号设备联系人为子账号
 * @param  {Object} deviceAlarms 设备的报警设置信息
 * @return {Promise}
 */
exports.getNotificationList = async function getNotificationList({ owners, deviceGroup: deviceGroupId, alarms: deviceAlarms }, notificationType = 'sms') {
    const phoneList = [], emailList = [];
    if (deviceAlarms && deviceAlarms.notification && deviceAlarms.notification.content) {
        if (deviceAlarms.notification.types === 'phone') {
            phoneList.push({
                source: 'attach',
                name: deviceAlarms.notification.contact || deviceAlarms.notification.content,
                number: deviceAlarms.notification.content
            });
        } else if (deviceAlarms.notification.types === 'email') {
            emailList.push(deviceAlarms.notification.content);
        }
    }
    const contactsOfGroup = await getContactsFromGroup(deviceGroupId, notificationType);
    const contactsOfUser = await getContactsFromUser(owners, notificationType);
    
    const allContacts = contactsOfGroup.concat(contactsOfUser);
    
    for (const contact of allContacts) {
        if (contact && (contact.phone || contact.content)) {
            phoneList.push({
                source: contact.content ? 'notification' : 'group',
                name: contact.name || contact.remarks || contact.phone,
                number: contact.phone || contact.content
            });
        }
    }
    return {
        phoneList,
        emailList
    };
};

/**
 * @description 从设备分组中获取联系人信息
 * @param {*} deviceGroupId 设备分组id
 * @param {*} notificationType 联系人类别：短信或手机
 */
async function getContactsFromGroup(deviceGroupId, notificationType) {
    if (deviceGroupId) {
        const groupNoticeCodition = {
            deviceGroup: deviceGroupId,
        };
        if (notificationType === 'voice') {
            groupNoticeCodition['isCopyTel'] = true;
        } else {
            groupNoticeCodition['isCopyMsg'] = true;
        }
        return await GroupNotice.find(groupNoticeCodition);
    } else {
        return [];
    }
}

/**
 * @description 从商户设置中获取联系人信息
 * @param {String} uid 目标商户
 * @param {String} notificationType 联系人类别：短信或手机
 */
async function getContactsFromUser(uid, notificationType) {
    let condition = {
        users: uid,
        isDeleted: false
    };
    if (notificationType === 'voice') {
        condition['isVoiceEnabled'] = true;
    } else {
        condition['isEnabled'] = true;
    }
    return Notification.find(condition);
}

/**
 * @description 检测发送通知次数，决定是否需要限制
 * @param {String} phone 电话号码
 */
exports.checkPhoneAvailable = async function (phone, type = 'voice') {
    const ret = { available: true };
    const cfg = config.cmccopen || {};
    const limitObj = cfg.voice_limit && cfg.voice_limit.phone || {};
    const count = await Redis.hincrby(`${type}_phone_count`, phone, 1);
    if (count > limitObj.limit) {
        logger.warn('电话号码 %s 发送 %s 达到频率限制', phone, type === 'voice' ? '语音' : '短信');
        ret.available = false;
        ret.reason = 'phone_limit';
    }
    return ret;
};

/**
 * @description 检测发送通知总数，决定是否需要限制
 */
exports.checkTotalAvailable = async function (type = 'voice') {
    const ret = {
        // 需要向管理员发送通知（语音条数达到预警上限）
        needAlarm: false,
        available: true
    };
    const cfg = config.cmccopen || {};
    const limitObj = cfg[type + '_limit'] && cfg[type + '_limit'].total || {};
    const count = await Redis.incr(`${type}_total_count`);
    
    if (count == limitObj.alarm) ret.needAlarm = true;
    if (count > limitObj.limit) {
        logger.warn('所有电话号码达到 %s 总数限制', type === 'voice' ? '语音' : '短信');
        ret.reason = 'total_limit';
        ret.available = false;
    }
    return ret;
};

/**
 * @description 设定发送总数（测试用）
 */
exports.setVoiceTotalCount = async function (count, type = 'voice') {
    return await Redis.set(`${type}_total_count`, count);
};

/**
 * @description 设定某个号码发送次数（测试用）
 */
exports.setVoicePhoneCount = async function (phone, count, type = 'voice') {
    return await Redis.hset(`${type}_phone_count`, phone, count);
};

/**
 * @description 清除所用电话的发送总数
 */
exports.clearVoiceTotalCount = async function (type = 'voice') {
    return await Redis.del(`${type}_total_count`);
};

/**
 * @description 清除所有电话的发送次数（保留总数）
 */
exports.clearVoicePhoneCount = async function (type = 'voice') {
    return await Redis.del(`${type}_phone_count`);
};

/**
 * @description 检测短信是否超过了限制
 */
exports.checkSMSPhoneCount = async function (phoneList, limit) {
    const phoneListWithResult = [];
    const type = 'sms';
    for (const phone of phoneList) {
        const count = await Redis.incr(`notice_${type}_limit_${phone.number}`);
        
        phone['IS_OVER_LIMIT'] = count >= limit;
        phone['count'] = count;
        phoneListWithResult.push(phone);
    }
    
    return phoneListWithResult;
};

/**
 * @description 设置短信已发送数（测试用）
 */
exports.setSMSPhoneCount = async function (phone, count) {
    return await Redis.set(`notice_sms_limit_${phone}`, count);
};

/**
 * @description 检测对一个电话数组中的电话所发信息/电话是否已经超过了业务限制
 */
exports.limitCheck = function (user, phoneList) {
    let LIMIT_COUNT = user.noticeLevel === 'senior' ? 60 : 60;
    return exports.checkSMSPhoneCount(phoneList, LIMIT_COUNT);
};

/**
 * @description 给目标用户发送报警、恢复短信
 * @description 商户有可能使用自定义的短信签名配置
 * @description 限制: 同一号码二十四小时内接收30条，12小时内接收15条
 * @param {Array} phoneList 电话列表
 * @param {Object} user 要向哪个用户发送短信，用于获取模板id（发送短信允许个性化）
 * @param {Number} alarmStatus 发送什么类型的短信 （1: 恢复短信， 2: 报警短信）
 * @param {String} sensorTypes 由于什么值发送的预警（多传感类型设备需要获取设备名称）
 * @return {Array} phoneList 拿到了发送结果的电话列表
 */
exports.sendSMSHandler = async function sendSMSHandler(phoneList, user = {}, alarmStatus, sensorTypes, device) {
    logger.info('SN :: %s 将发送 < %s > 短信 至 : ', device.sn, alarmStatus === 1 ? '恢复' : '预警', phoneList.map(item => item.number));
    // 电量恢复不发送短信
    if (alarmStatus === 1 && sensorTypes === 'battery') {
        return Promise.resolve({ phoneList });
    }
    
    // 获取模板id
    const tpl_sms_id = getTplId(alarmStatus, user.character);
    // 翻译预警值
    const sensorStatus = alarmTextTransLate(sensorTypes, device);
    // 设备联系人电话
    const templatePhone = device.alarms.notification && device.alarms.notification.content || '';
    // 设备联系人名称
    const templateContact = device.alarms.notification && device.alarms.notification.contact || '';
    const tplParams = {
        // 报警发生时间
        '#time#': moment(new Date(device.updatedTime)).format('MM-DD HH:mm:ss'),
        // 什么设备发生了报警
        '#type#': Device.getSensorName(sensorTypes, device.sensorTypes),
        // 设备名称
        '#name#': device.name ? device.name : '',
        // 为了缩短短信字数取sn后5位
        '#sn#': device.sn.slice(-5),
        // 设备预警值及单位
        '#value#': sensorStatus,
        // 设备的联系人（方便收到短信的人自行通知）
        '#contact#': templatePhone ? '，设备联系人：' + templateContact + '-' + templatePhone : ''
    };
    
    logger.info('SN :: %s 发送短信，填充模板参数为 :: %j', device.sn, tplParams);
    
    const { phoneList: phoneListWithResult } = await Notice.sendSms(phoneList, tpl_sms_id, tplParams);
    
    logger.info('SN %s 发送短信返回结果 :: %j', device.sn, phoneListWithResult);
    
    return {
        phoneList: phoneListWithResult
    };
};

/**
 * 给目标用户发送语音通知
 * 商户有可能使用自定义的语音签名配置
 * 限制: 同一号码二十四小时内接收10条，12小时内接收5条
 *
 * @return {Array} phoneList 拿到了发送结果的电话列表
 */
exports.sendVoiceHandler = async function sendVoiceHandler(phoneList, alarmStatus, sensorTypes, device) {
    logger.info('SN :: %s 将发送 < %s > 电话', device.sn, alarmStatus === 1 ? '恢复' : '预警');
    // 所有恢复不发送语音，也不需要记录，所以可返回空数组即可
    if (alarmStatus === 1) {
        return Promise.resolve({ phoneList: [] });
    }
    
    // 使用哪个平台发送预警电话
    const platform = 'cmccopen';
    
    // 如上所述，只发送预警电话
    // const tpl_voice_id = alarmStatus === 2 ? config[platform].voice_alarm_tpl_id : config[platform].voice_ok_tpl_id;
    const tpl_voice_id = config[platform].voice_alarm_tpl_id;
    
    const tplParams = {
        'type': Device.getSensorName(sensorTypes, device.sensorTypes),
        'name': device.name ? device.name.substring(0, 10) : ' ',
        'note1': device.name ? device.name.substring(10, 20) : '',
        'note2': device.name ? device.name.substring(20, 30) : ''
    };
    
    logger.info('SN :: %s 发送电话，填充模板参数为 :: %j', device.sn, tplParams);
    
    const { phoneList: phoneListWithResult } = await Notice.sendVoice(phoneList, tpl_voice_id, tplParams);
    
    logger.info('SN %s 发送电话返回结果 :: %j', device.sn, phoneListWithResult);
    
    return { phoneList: phoneListWithResult };
};

/**
 * @desc 获取短信个性化模板id（语音统一，不可个性化）
 * @param {Number} alarmStatus 预警状态，分为预警和恢复
 * @param {Object} character 预警个性化设置
 */
function getTplId(alarmStatus, character = {}) {
    let tpl_sms_id;
    const type = 'sms';
    if (alarmStatus === 2) {
        if (character[type] && character[type].alarm) {//商户自定义的签名配置
            tpl_sms_id = character[type].alarm;
        } else {
            tpl_sms_id = config.yunpian.alarm_tpl_id;
        }
    } else if (alarmStatus === 1) {
        if (character[type] && character[type].ok) {
            tpl_sms_id = character[type].ok;
        } else {
            tpl_sms_id = config.yunpian.ok_tpl_id;
        }
    }
    return tpl_sms_id;
}


/**
 * @description 根据传感器数值翻译预警文本
 * @param {Array} sensorTypes
 * @param {Object} device
 */
function alarmTextTransLate(sensorTypes, device) {
    let sensorStatus = ` ${NAME_UNIT[sensorTypes] ? NAME_UNIT[sensorTypes].name : ''}数据为 `;
    
    if (NAME_UNIT[sensorTypes] && NAME_UNIT[sensorTypes].isBool) {
        const status = device.sensorData[sensorTypes] ? 'alarm' : 'recovery';
        sensorStatus = NAME_UNIT[sensorTypes][status];
    } else {
        let threshold = device.sensorData[sensorTypes];
        if (sensorTypes === 'co') {
            threshold = +threshold.toFixed(1);
        } else if (sensorTypes === 'no2') {
            threshold = Math.round(+threshold * 46.01 / 24.45 * 1000).toFixed(0);
        }
        sensorStatus += threshold + (NAME_UNIT[sensorTypes] && NAME_UNIT[sensorTypes].unit);
    }
    
    return sensorStatus;
}

/**
 * @param {Object} device 该条记录相关设备信息
 * @param {String} sensorTypes 该条记录是由什么数据触发的
 * @param {*} smsPhoneList 短信联系人
 * @param {*} voicePhoneList 语音联系人
 */
exports.createRecord = async function createRecord(device, sensorType, smsPhoneList, voicePhoneList) {
    logger.info('SN :: %s 将要创建新的预警记录', device.sn);
    // 预警发生时的设备数据
    const sensorData = Object.assign({}, device.sensorData);
    
    // 新的一条预警记录
    const alarmDisplay = {
        owners: device.owners,
        deviceSN: device.sn,
        deviceName: device.name,
        // new field device notification
        deviceNotification: device.alarms.notification,
        // new field device lonlat
        deviceLonlat: device.lonlat,
        displayStatus: 0,
        alarmStatus: 2,
        appId: device.appId,
        sensorType: sensorType,
        unionType: device.unionType,
        phoneList: Array.from(new Set(smsPhoneList.concat(voicePhoneList).map(item => item.number))),
        deviceType: device.deviceType,
        sensorData,
        rules: device.alarms.rules,
        updatedTime: new Date()
    };
    
    const newAlarm = await AlarmDisplay.create(alarmDisplay);
    // 记录时间戳，并使拨打电话或发送短信的时间戳比发生预警的时间多 1ms 以便于时间轴的展示效果
    const NOW_TIMESTAMP = new Date().getTime();
    // 预警时间轴事件
    const records = [];
    
    const alarmRecord = {
        alarms: newAlarm._id,
        type: 'alarm',
        sensorType: sensorType,
        updatedTime: new Date(NOW_TIMESTAMP),
    };
    
    // 只为数值类型添加 thresholds 字段
    if (!Number.isNaN(+sensorData[sensorType])) {
        alarmRecord.thresholds = sensorData[sensorType];
    } else {
        alarmRecord.text = sensorData[sensorType].toString();
    }
    
    records.push(alarmRecord);
    
    // 为预警时间轴增加短信和电话
    if (smsPhoneList && smsPhoneList.length) {
        records.push({
            alarms: newAlarm._id,
            type: 'sendSMS',
            status: 'alarm',
            phoneList: smsPhoneList,
            updatedTime: new Date(NOW_TIMESTAMP + 1),
        });
    }
    if (voicePhoneList && voicePhoneList.length) {
        records.push({
            alarms: newAlarm._id,
            type: 'sendVoice',
            status: 'alarm',
            phoneList: voicePhoneList,
            updatedTime: new Date(NOW_TIMESTAMP + 1),
        });
    }
    logger.info('SN :: %s %s 达到预警值 %d，创建预警记录 %j', device.sn, NAME_UNIT[sensorType].name, sensorData[sensorType], newAlarm);
    logger.info('SN :: %s 创建预警事件 %j', device.sn, records);
    
    // 触发预警时，同时设定预警的自动确认超时
    const adTimeout = config.redis.adTimeout || 48 * 60 * 60;
    Timeout.set(newAlarm._id.toString(), adTimeout);
    
    let newRecords = await AlarmRecord.create(records);
    // add created records to display
    newAlarm.records = newRecords;
    
    return newAlarm;
};

/**
 * @desc 恢复（最近）一条预警记录
 * @param {Object} device 该条记录相关设备信息
 * @param {String} sensorTypes 该条记录是由什么数据触发的
 * @param {*} smsPhoneList 短信联系人
 */
exports.recoveryRecord = async function recoveryRecord(device, sensorType, smsPhoneList) {
    // 查询条件
    const condition = {
        deviceSN: device.sn,
        sensorType: sensorType,
        alarmStatus: 2,
        // 指定 owners，防止设备被分配后预警记录仍被更新
        owners: device.owners
    };
    // 更新信息
    const setting = {
        $set: {
            alarmStatus: 1,
            updatedTime: new Date()
        }
    };
    
    // 更新选项
    const opts = {
        sort: {
            'updatedTime': -1
        },
        new: true
    };
    
    const alarmDisplay = await AlarmDisplay.findOneAndUpdate(condition, setting, opts);
    
    if (!alarmDisplay) {
        return logger.warn('未找到对应的预警记录 condition :: %j', condition);
    }
    // 设备恢复时的数据
    const sensorData = Object.assign({}, device.sensorData);
    // 将要新建的预警时间轴事件
    let records = [];
    
    const recoverRecord = {
        alarms: alarmDisplay._id,
        type: 'recovery',
        sensorType: sensorType,
        updatedTime: moment().valueOf()
    };
    
    // 只为数值类型添加 thresholds 字段
    if (!Number.isNaN(+sensorData[sensorType])) {
        recoverRecord.thresholds = sensorData[sensorType];
    } else {
        recoverRecord.text = sensorData[sensorType].toString();
    }
    
    records.push(recoverRecord);
    
    // 如果发送恢复短信
    if (smsPhoneList && smsPhoneList.length) {
        records.push({
            alarms: alarmDisplay._id,
            type: 'sendSMS',
            status: 'recovery',
            phoneList: smsPhoneList,
            updatedTime: moment().valueOf() + 1,
        });
    }
    
    logger.info('SN :: %s 恢复预警记录', device.sn);
    logger.info('SN :: %s 恢复预警事件 %j', device.sn, records);
    
    await AlarmRecord.create(records);
    // get old records
    records = await AlarmRecord.find({
        alarms: alarmDisplay._id
    });
    
    // concat new records and old records
    alarmDisplay.records = records;
    
    return alarmDisplay;
};

/**
 * @description 更新通知的接收状态
 */
exports.noticeReceive = async function noticeReceive(sid, updateData) {
    if (!sid || !updateData || !updateData.reciveStatus) {
        throw createError(500, 'sid and reciveStatus are required updating records.');
    }
    
    // 只更新接收状态不为1的值
    const condition = {
        'phoneList.sid': sid,
        'phoneList.reciveStatus': {
            $ne: 1
        }
    };
    
    const setting = {
        $set: {
            'phoneList.$.reciveStatus': updateData.reciveStatus,
            'phoneList.$.error_msg': updateData.error_msg,
            'phoneList.$.description': updateData.description,
            'phoneList.$.receiveTime': updateData.receiveTime,
            'phoneList.$.reason': updateData.reason,
        }
    };
    
    const opts = {
        new: true
    };
    
    const recordUpdated = await AlarmRecord.findOneAndUpdate(condition, setting, opts);
    
    return recordUpdated.toJSON();
};


/**
 * @description 确认一条预警记录
 * @param {String} id 这条预警属于哪一条预警记录
 * @param {Object} confirmer 谁在确认预警记录
 * @param {Number} displayStatus 想要将预警记录确认为什么状态 0:待确认, 1:真实预警, 2:误报, 3:测试/巡检
 * @param {String} source 预警记录的动作来源，系统、平台还是app
 */
exports.confirm = async function confirm({
                                             id, confirmer, displayStatus, source, remark, confirmTime, images, place, reason
                                         }) {
    // 更新对应id的未确认的预警记录
    const updateRes = await AlarmDisplay.update({
        _id: id,
        displayStatus: 0
    }, {
        $set: {
            displayStatus
        }
    });
    
    // 成功修改后才插入确认事件，防止重复确认
    if (!updateRes.nModified) {
        throw createError(400, 'record has been confirmed, please use reconfirm type.');
    }
    
    const alarmRecord = await AlarmRecord.findOne({ 'alarms': id, type: 'alarm' });
    const confirmRange = moment().valueOf() - moment(alarmRecord.updatedTime).valueOf();
    
    const record = {
        alarms: id,
        type: 'confirm',
        name: confirmer.name,
        comfirmers: confirmer.id,
        source,
        remark,
        images,
        confirmRange,
        displayStatus,
        updatedTime: moment(confirmTime).valueOf(),
        place,
        reason,
    };
    
    // 系统确认，记录下此次超时
    if (source === 'auto') {
        record.timeout = config.redis.adTimeout || 48 * 60 * 60;
    }
    return await AlarmRecord.create(record);
};

/**
 * @description 重新确认一条预警记录
 * @param {String} id 这条预警属于哪一条预警记录
 * @param {Object} confirmer 谁在确认预警记录
 * @param {Number} oldDisplayStatus 现在预警记录的状态
 * @param {Number} displayStatus 想要将预警记录确认为什么状态 0:待确认, 1:真实预警, 2:误报, 3:测试/巡检
 * @param {String} source 预警记录的动作来源，系统、平台还是app
 */
exports.reconfirm = async function reconfirm({
                                                 id, confirmer, oldDisplayStatus, displayStatus, source, remark, images, place, reason
                                             }) {
    // 更新对应id的未确认的预警记录
    await AlarmDisplay.update({
        _id: id,
        displayStatus: oldDisplayStatus
    }, {
        $set: {
            displayStatus,
            updatedTime: new Date()
        }
    });
    
    const $set = {
        name: confirmer.name,
        comfirmers: confirmer.id,
        source,
        displayStatus,
        updatedTime: new Date().getTime(),
    };
    
    // 更新非必传字段
    for (const [key, value] of Object.entries({ remark, images, place, reason })) {
        if (typeof value !== 'undefined') {
            $set[key] = value;
        }
    }
    
    // 成功修改后才修改确认事件，防止误修改
    await AlarmRecord.update({
        alarms: id,
        displayStatus: oldDisplayStatus
    }, {
        $set
    });
};

/**
 * @desc 将预警状态和数据翻译为可读的翻译预警/恢复消息
 * @param {String} alarmStatus 预警状态
 * @param {String} sensorType 什么数据触发了预警/恢复
 * @param {Object} device 设备信息
 */
exports.translate = function translate(alarmStatus, sensorType, device) {
    const info = {
        title: '',
        content: '',
        alarmStatus
    };
    
    const sensorName = Device.getSensorName(sensorType, device.sensorTypes);
    const updateTime = moment(new Date(device.updatedTime)).format('YYYY-MM-DD HH:mm:ss');
    
    if (device.name) {
        info.title += device.name + '传感器 ' + device.sn;
    } else {
        info.title += '设备号: ' + device.sn;
    }
    
    // 预警文字
    const sensorStatus = alarmTextTransLate(sensorType, device);
    
    info.content = `您的${sensorName}传感器 ${device.sn} 于 ${updateTime}${sensorStatus}，${alarmStatus === 2 ? '达到预警值。' : '已恢复到预警范围内。'}`;
    
    return info;
    
};

/**
 * @description 重试发送语音通知时更新记录中的sid
 */
exports.updateSid = async function(phoneList, sid) {
    const retrySendInfo = phoneList[0];
    
    // 只更新接收状态不为1的值
    const condition = {
        'phoneList.sid': sid,
    };
    
    const $inc = {
        'phoneList.$.retry': 1
    };
    
    const $set = {
        'phoneList.$.reciveStatus': retrySendInfo.reciveStatus,
        'phoneList.$.sid': retrySendInfo.sid,
        'phoneList.$.IS_OVER_LIMIT': retrySendInfo.IS_OVER_LIMIT,
    };
    
    const $unset = {
        'phoneList.$.receiveTime': 1
    };
    
    if (retrySendInfo.description) {
        $set['phoneList.$.description'] = retrySendInfo.description;
    } else {
        $unset['phoneList.$.description'] = 1;
    }
    
    if (retrySendInfo.reason) {
        $set['phoneList.$.reason'] = retrySendInfo.reason;
    } else {
        $unset['phoneList.$.reason'] = 1;
    }
    
    if (retrySendInfo.error_msg) {
        $set['phoneList.$.error_msg'] = retrySendInfo.error_msg;
    } else {
        $unset['phoneList.$.error_msg'] = 1;
    }
    
    const setting = {
        $inc,
        $set,
        $unset
    };
    
    const opts = {
        new: true
    };
    
    const recordUpdated = await AlarmRecord.findOneAndUpdate(condition, setting, opts);
    
    return recordUpdated.toJSON();
    
};

/**
 * @description 下载预警记录
 */
exports.aggreAndBuild = async function aggreAndBuild({ appId, owners, beginTime, endTime }) {
    const $match = {
        createdTime: {
            $gte: beginTime,
            $lte: endTime
        },
        isDeleted: false
    };
    
    if (appId) {
        $match['appId'] = appId;
    }
    
    if (owners) {
        $match['owners'] = owners;
    }
    
    const alarmStream = AlarmDisplay.find($match).sort({ createdTime: -1}).select({ appId: 0 }).cursor();
    
    let limit = 500;
    let chunks = [];
    let stream = Through({ objectMode: true }, function _transformed(chunk, encoding, callback) {
        if (Array.isArray(chunk)) {
            callback(null, chunk);
        }
        else if (chunk._id) {

            chunks.push(chunk);

            if (chunks.length < limit) {
                callback();
                return;
            }
            
            formatAlarmDisplayChunks.bind(this)(chunks, callback, function () {
                chunks = [];
            });
        }
        else {
            callback(new Error('unknown data format'));
        }
    });
    
    let originStreamEnd = stream.end.bind(stream);
    
    stream.end = function () {
        chunks.push(...arguments);
        formatAlarmDisplayChunks.bind(stream)(chunks, originStreamEnd, function () {
            chunks = [];
        });
    };
    
    async function formatAlarmDisplayChunks(alarms, done, callback) {
        let userIds = [];
        let recordIds = [];
        
        alarms.forEach(alarm => {
            userIds.push(alarm.owners);
            recordIds.push(alarm._id.toString());
        });
        
        let userNicknames = {};
        let recordsMap = {};
        
        let users;
        try {
            users = await User.find({ _id: { $in: userIds }});
        } catch (error) {
            xlsxLogger.error('format alarm display chunks query `users` occuring an error: %s', error.message);
        }
        
        
        users.forEach(user => {
            userNicknames[user._id.toString()] = user.nickname || '未知';
        });
        
        let records;
        try {
            records = await AlarmRecord.find({ alarms: { $in: recordIds }, type: { $in: ['recovery', 'confirm']}});
        } catch (error) {
            xlsxLogger.error('format alarm display chunks query `records` occuring an error: %s', error.message);
        }
        
        records.forEach(record => {
            let id = record.alarms;
            let type = record.type;
            
            if (!recordsMap[id]) {
                recordsMap[id] = {};
            }

            if (!recordsMap[id][type]) {
                recordsMap[id][type] = record;
            }
        });

        alarms.forEach(alarm => {
            let temp = [];
            let { _id, owners, deviceSN, deviceName, unionType, deviceLonlat, createdTime } = alarm;
            
            // 放入 商户名称
            temp.push(userNicknames[owners]);
            
            // 放入 预警设备名称
            temp.push(deviceName);
            
            // 放入 设备号
            temp.push(deviceSN);
            
            // 放入 设备类型
            let deviceType;
            unionType = (unionType && unionType.replace(/\|/g, ',')) || '';
            
            if (!unionType) {
                deviceType = '未知';
            } else {
                deviceType = NAME_UNIT[unionType];
                deviceType = deviceType && deviceType.name ? deviceType.name : '未知';
            }
            temp.push(deviceType);
            
            // 放入 预警位置
            let lonlat = deviceLonlat;
            lonlat = Array.isArray(lonlat) ? lonlat.join(', '): '0, 0';
            temp.push(lonlat);
            
            // 放入 预警时间
            let time = moment(createdTime).format('YYYY-MM-DD HH:mm:ss');
            temp.push(time);
            
            // 放入 预警恢复时间
            if (recordsMap[_id]['recovery']) {
                let recvovery = recordsMap[_id]['recovery'];
                let time = moment(recvovery.updatedTime).format('YYYY-MM-DD HH:mm:ss');
                
                temp.push(time);
            } else {
                temp.push(null);
            }
            
            // 放入 确认记录 中的相关信息
            if (recordsMap[_id]['confirm']) {
                // push 是否确认
                temp.push('是');
                
                let lastConfirm = recordsMap[_id]['confirm'];
                
                // push 确认时间
                temp.push(moment(lastConfirm.updatedTime).format('YYYY-MM-DD HH:mm:ss'));
                
                // push 预警结果类型
                let displayStatus = DISPLAY_STATUS_MAP[lastConfirm.displayStatus] || '未知';
                temp.push(displayStatus);
                
                // push 预警原因
                let reason = ALARM_REASON_MAP[lastConfirm.reason] || '未知';
                temp.push(reason);
                
                // push 预警地点
                let place = ALARM_PLACE_MAP[lastConfirm.place] || '未知';
                temp.push(place);
                
                // push 备注
                temp.push(lastConfirm.remark);
                
                // push 确认人
                let name = lastConfirm.name;
                temp.push(name);
                
            } else {
                // push 是否确认
                temp.push('否');
            }
            
            this.push(temp);
        });
        
        callback();
        
        done();
    }
    
    function formatAlarmDisplayChunk(alarm, callback) {
        let temp = [];
        
        let { _id, owners, deviceSN, deviceName, unionType, deviceLonlat, createdTime } = alarm;
        let nickname;
        
        User.findOne({ _id: owners }, { nickname: 1 }).then(user => {
            nickname = user && user.nickname ? user.nickname : '未知';
            
            // 放入 商户名称
            temp.push(nickname);
            
            // 放入 预警设备名称
            temp.push(deviceName);
            
            // 放入 设备号
            temp.push(deviceSN);
            
            // 放入 设备类型
            let deviceType;
            unionType = (unionType && unionType.replace(/\|/g, ',')) || '';
            
            if (!unionType) {
                deviceType = '未知';
            } else {
                deviceType = NAME_UNIT[unionType];
                deviceType = deviceType && deviceType.name ? deviceType.name : '未知';
            }
            temp.push(deviceType);
            
            // 放入 预警位置
            let lonlat = deviceLonlat;
            lonlat = Array.isArray(lonlat) ? lonlat.join(', '): '0, 0';
            temp.push(lonlat);
            
            // 放入 预警时间
            let time = moment(createdTime).format('YYYY-MM-DD HH:mm:ss');
            temp.push(time);
            
            // 获取预警记录
            return AlarmRecord.find({ alarms: _id});
        }).catch((error) => {
            xlsxLogger.error('format alarm display chunk query `user` occuring an error: %s', error.message);
        }).then(records => {
            
            // 放入 预警恢复时间
            const recoveryRecord = records && records.filter(record => (record.type === 'recovery'));
            if (recoveryRecord && recoveryRecord.length) {
                let recvovery = recoveryRecord[0];
                let time = moment(recvovery.updatedTime).format('YYYY-MM-DD HH:mm:ss');
                
                temp.push(time);
            } else {
                temp.push(null);
            }
            
            // 放入 确认记录 中的相关信息
            const confirmRecord = records && records.filter(record => (record.type === 'confirm'));
            if (confirmRecord && confirmRecord.length) {
                // push 是否确认
                temp.push('是');
                
                let lastConfirm = confirmRecord[confirmRecord.length - 1];
                
                // push 确认时间
                temp.push(moment(lastConfirm.updatedTime).format('YYYY-MM-DD HH:mm:ss'));
                
                // push 预警结果类型
                let displayStatus = DISPLAY_STATUS_MAP[lastConfirm.displayStatus] || '未知';
                temp.push(displayStatus);
                
                // push 预警原因
                let reason = ALARM_REASON_MAP[lastConfirm.reason] || '未知';
                temp.push(reason);
                
                // push 预警地点
                let place = ALARM_PLACE_MAP[lastConfirm.place] || '未知';
                temp.push(place);
                
                // push 备注
                temp.push(lastConfirm.remark);
                
                // push 确认人
                let name = lastConfirm.name;
                temp.push(name);
                
            } else {
                // push 是否确认
                temp.push('否');
            }
            
            callback(null, temp);
        }).catch((error) => {
            xlsxLogger.error('format alarm display chunk query `records` occuring an error: %s', error.message);
        });
        
        
    }
    
    alarmStream.pipe(stream);
    
    let xlsxw = new xlsxStream();
    xlsxw.setInputStream(stream);
    
    let headerData = ['商户名称', '预警设备名称', '设备号', '设备类型', '预警位置', '预警时间', '恢复时间', '是否确认', '确认时间', '预警结果类型', '预警成因类型', '预警场所', '备注', '确认人'];
    
    stream.write(headerData);
    
    return xlsxw.getOutputStream();
};
