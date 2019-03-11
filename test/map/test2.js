


let MERGE_TYPES_INFO = {
    'arc': {
        'name': '电弧探测',
        'icon': 'arc',
        'image': 'https://resource-city.sensoro.com/device-icon/arc.png',
        'deviceTypes': ['zcrd_arc']
    },
    'air_breaker': {
        'name': '空气开关',
        'icon': 'breaker',
        'image': 'https://resource-city.sensoro.com/device-icon/breaker.png',
        'deviceTypes': ['mantun_fires']
    },
    'ammeter': {
        'name': '电表',
        'icon': 'ammeter',
        'image': 'https://resource-city.sensoro.com/device-icon/ammeter.png',
        'deviceTypes': ['zcrd_ammeter', 'dianbiao']
    },
    'co': {
        'name': '人工煤气',
        'icon': 'co',
        'image': 'https://resource-city.sensoro.com/device-icon/co.png',
        'deviceTypes': ['co', 'zcrd_artificial', 'winsen_gas', 'depre_co']
    }
}

let MERGE_TYPES = Array.from(Object.keys(MERGE_TYPES_INFO));


let deviceTypeArr = getDeviceTypesFromMergeTypes(['arc', 'ammeter']);

// console.log(deviceTypeArr);


let mergeTypeMap = getMergeTypeFromDeviceType(MERGE_TYPES_INFO, MERGE_TYPES);

console.log(mergeTypeMap);


function getMergeTypeFromDeviceType(mergeTypesInfo, mergeTypes) {
    
    const mergeTypeMap = new Map();

    for (let i = 0; i < mergeTypes.length; i++) {
        let curMergeType = mergeTypes[i];
        
        let curDeviceTypes = mergeTypesInfo[curMergeType].deviceTypes;
        
        for (let j = 0; j < curDeviceTypes.length; j++) {
            let curDeviceType = curDeviceTypes[j];

            if (!mergeTypeMap.get(curDeviceType)) {
                mergeTypeMap.set(curDeviceType, curMergeType);
            }
        }
    }
 
    return mergeTypeMap;
}



function getDeviceTypesFromMergeTypes(mergeTypes) {
    
    const deviceTypeArr = [];
    const deviceTypeMap = new Map();
    
    const mergeTypesInfo = MERGE_TYPES_INFO;
    
    for (let i = 0; i < mergeTypes.length; i++) {
        
        const curMergeTypeInfo = mergeTypesInfo[mergeTypes[i]];
        
        if (curMergeTypeInfo.deviceTypes) {
            for (let j = 0; j < curMergeTypeInfo.deviceTypes.length; j++) {
                const curDeviceType = curMergeTypeInfo.deviceTypes[j];
                
                const deviceMapVal = deviceTypeMap.get(curDeviceType);
                if (typeof deviceMapVal === 'undefined') {
                    deviceTypeMap.set(curDeviceType, 1);
                    deviceTypeArr.push(curDeviceType);
                }
            }
        }
    }
    
    return deviceTypeArr;
}
