"use strict"


const MAX_LEN = 2000;
const CAPACITY = 2000;


class SimpleQueue {

    constructor() {
        this.itemList = [];
    }

    // 入队列
    Enqueue(item) {
        this.itemList.push(item);
        return this.itemList.length;
    }

    // 出队列
    Dequeue() {
        let curItem = this.itemList.splice(0, 1);
        return curItem;
    }

    // 队列长度
    Length(){
        return this.itemList.length;
    }
}


let queue = new SimpleQueue();

console.log(queue.Length())

queue.Enqueue(1);
console.log(JSON.stringify(queue.itemList));
queue.Enqueue(2);
console.log(JSON.stringify(queue.itemList));
queue.Enqueue(3);
console.log(JSON.stringify(queue.itemList));

queue.Dequeue()
console.log(JSON.stringify(queue.itemList));
queue.Dequeue()
console.log(JSON.stringify(queue.itemList));



module.exports = SimpleQueue;
