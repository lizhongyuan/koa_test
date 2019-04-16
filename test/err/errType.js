

const errJson = {
  message: 'errJson',
};


const err = new Error('Error');


console.log(errJson instanceof Error);
console.log(err instanceof Error);

console.log(errJson.toString());
console.log(err.toString());
