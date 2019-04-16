'use strict';


const jsonSet = {
  a: 1,
  b: 2,
};


for (let key in jsonSet) {
  const value = jsonSet[key];
  console.log(key);
  console.log(value);
}