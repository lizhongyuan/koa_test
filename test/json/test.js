

const jbody = {
    a: {
        b: {
            c: 1
        }
    }
};


/*
let j = jbody.a;
j.b = 2;
console.log(jbody)
*/

let j = Object.assign({}, jbody.a);
j.b = 2;

console.log(jbody)
console.log(j)
