'use strict';


const arrangeConfig1 = {
  type: 'node',
  sequence: 'each',
  tasks: [
    {
      type: 'leaf',
      service: 'a',
      function: 'a1'
    },
    {
      type: 'leaf',
      service: 'a',
      function: 'a2'
    },
    {
      type: 'leaf',
      service: 'b',
      function: 'b1'
    },
  ],
};


const arrangeConfig2 = {
  type: 'node',
  sequence: 'each',
  tasks: [
    {
      type: 'leaf',
      service: 'a',
      function: 'a1',
    },
    {
      type: 'leaf',
      service: 'a',
      function: 'a2',
    },
    {
      type: 'node',
      sequence: 'parallel',
      tasks: [
        {
          type: 'leaf',
          service: 'b',
          function: 'b1'
        },
        {
          type: 'leaf',
          service: 'b',
          function: 'b2'
        },
      ]
    },
  ],
};


module.exports = {
  arrangeConfig1,
  arrangeConfig2,
};
