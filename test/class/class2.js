
const Process = require('../ker_base_process');


class DemoService {
  constructor(params, ctx) {
    this.type = 'demo'; // 业务类型
    this.ctx = ctx;     // 上下文
    this.process = new Process(params);
  }
  
  craeteProcess(params) {
    const { ctx } = this;
    if (!this.process) {
      this.process = new Process(params); //审批流程
    }
  }
  
  async start() {}
  
  async business1(params) { /* 业务2 */ }
  async business2(params) { /* 业务2*/ }
  
  /* ... */
  
  async end() {}
}