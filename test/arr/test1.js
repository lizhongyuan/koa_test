

function removeDup(arr){
    
    let arrMap = {};
    for (let i = 0; i < arr.length; i++) {
        if (!arrMap[arr[i]]) {
            arrMap[arr[i]] = 1;
        }
        else {
        
        }
    }
    
    let newArr = Object.keys(arrMap);
    
    return newArr;
}

var arr = [1,3,1,4,6,6,88];

let newArr = removeDup(arr);

console.log(newArr)
