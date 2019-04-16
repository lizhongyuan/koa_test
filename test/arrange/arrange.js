'use strict';


const { arrangeConfig1, arrangeConfig2, arrangeConfig3 } = require('./config');
const Promise = require('bluebird');
const a = require('./a');
const b = require('./b');
const c = require('./c');

const service = {
  a,
  b,
  c,
};

// build(arrangeConfig1)
build(arrangeConfig2)
// build(arrangeConfig3)
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
        if (curTasks[i].type === 'leaf') {
          const curFun = await build(curTasks[i]);
          await curFun();
        } else {
          await build(curTasks[i]);
        }
      }
    } else if (curSequence === 'parallel') {
      const allTasks = [];
      for (let i = 0; i < curTasks.length; i++) {
        if (curTasks[i].type === 'leaf') {
          const curFun = await build(curTasks[i]);
          allTasks.push(curFun());
        } else {
          allTasks.push(build(curTasks[i]));
        }
      }
      return await Promise.all(allTasks);
    }
  } else if (curType === 'leaf') {
    const curService = item.service;
    const curFunction = item.function;

    return service[curService][curFunction];
  }
}