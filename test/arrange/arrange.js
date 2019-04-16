'use strict';


const { arrangeConfig1, arrangeConfig2 } = require('./config');
const Promise = require('bluebird');
const a = require('./a');
const b = require('./b');
const c = require('./c');

const service = {
  a,
  b,
  c,
};

build(arrangeConfig1)
  .then(res => {
    console.log(res);
  }, err => {
    console.log(err);
  });


async function build(item) {

  const curType = item.type;

  if (curType === 'node') {
    const curSequence = item.sequence;
    const curTasks = item.tasks;
    if (curSequence === 'each') {
      for (let i = 0; i < curTasks.length; i++) {
        const curFun = await build(curTasks[i]);
        await curFun();
      }
    } else if (curSequence === 'parallel') {
      const allTasks = [];
      for (let i = 0; i < curTasks.length; i++) {
        const curTask = await build(curTasks[i]);
        allTasks.push(curTask);
      }
      return Promise.all(allTasks);
    }
  } else if (curType === 'leaf') {
    const curService = item.service;
    const curFunction = item.function;

    return service[curService][curFunction];
  }
}