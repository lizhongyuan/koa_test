'use strict';


const method = require('./method');


class Test {
	constructor(text) {
		this.text = text;
	}

	show() {
		method.show.call(this);
	}

	show2() {
		console.log('show2');
	}
}




const test = new Test('test');

test.show2();
test.show();
