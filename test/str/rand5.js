

function generate() {
    
    let ALPHABET = '0123456789';
    
    let ID_LENGTH = 5;
    let rtn = '';
    for (let i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}

let str = generate();

console.log(str);