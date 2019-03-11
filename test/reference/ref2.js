

let x = {
    a: 1,
    b: 2,
};


let y = x;

console.log(JSON.stringify(y));

y.b = 3;
console.log(JSON.stringify(x));
