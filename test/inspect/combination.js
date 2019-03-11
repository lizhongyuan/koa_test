'use strict';


let getComb = function getComb(aNum, bNum, offset, limit) {

    let aOffset;
    let bOffset;
    let aLength;
    let bLength;

    // let aModulo = Math.floor(aNum/limit);
    // let aResidue = aNum - aModulo * limit;

    if (offset < aNum) {
        aOffset = offset;
        if (offset + limit <= aNum) {
            aLength = limit;
            bOffset = -1;
            bLength = -1;
        }
        else {
            aLength = aNum - offset;
            bOffset = 0;
            if (offset + limit <= aNum + bNum) {
                bLength = offset + limit - aNum;
            }
            else {
                bLength = bNum;
            }
        }
    }
    else {
        aOffset = -1;
        aLength = -1;
        if (offset >= aNum + bNum) {
            bOffset = -1;
            bLength = -1;
        }
        else {
            bOffset = offset - aNum;
            if (bNum - bOffset >= limit) {
                bLength = limit;
            }
            else {
                bLength = bNum - bOffset;
            }
        }
    }

    return [ aOffset, aLength, bOffset, bLength ]
};


// let [ aOffset, aLength, bOffset, bLength ] = getComb(17, 10, 0, 10);
// let [ aOffset, aLength, bOffset, bLength ] = getComb(17, 10, 20, 5);
// let [ aOffset, aLength, bOffset, bLength ] = getComb(17, 10, 27, 10);
// let [ aOffset, aLength, bOffset, bLength ] = getComb(17, 10, 26, 10);
let [ aOffset, aLength, bOffset, bLength ] = getComb(1, 0, 0, 10);


console.log(aOffset, aLength, bOffset, bLength);

