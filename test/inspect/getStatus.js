


let allStatusArr = [ 0, 1, 2, 3, 4 ];


let unfinishStatusArr = [ 0, 1, 2 ];
let finishStatusArr = [ 3, 4 ];


function getAvailableStatusPartition(statuses) {

    let availableFinishStatuses = [];
    let availableUnfinishStatuses = [];

    for (let i = 0; i < statuses.length; i++) {
        if (statuses[i] <= 1) {
            availableUnfinishStatuses.push(statuses[i]);
        }
        else {
            availableFinishStatuses.push(statuses[i]);
        }
    }

    return [ availableUnfinishStatuses, availableFinishStatuses ];
}

// let statuses = [ 1, 3 ];
// let statuses = [ 1, 3 ];
let statuses = [ 3 ];
let ret = getAvailableStatusPartition(statuses);

console.log(ret);
