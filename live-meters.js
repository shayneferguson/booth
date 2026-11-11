const db = value => value > 1e-5 ? 20 * Math.log10(value) : -100;
export class LiveMeters {
  constructor() { this.epoch = 0; this.queue = []; }
  async connect(ctx, nodes) {
    this.ctx = ctx;
    await ctx.audioWorklet.addModule('/level-worklet.js?v=2.5');
    this.node = new AudioWorkletNode(ctx, 'booth-levels', {numberOfInputs:4,
      numberOfOutputs:1, outputChannelCount:[1], channelCount:2, channelCountMode:'explicit'});
    this.node.port.onmessage = e => this.receive(e.data);
    this.node.onprocessorerror = () => { this.failed = true; this.reset(); };
    nodes.forEach((node, i) => node.connect(this.node, 0, i));
    this.node.connect(ctx.destination); this.reset(); // silent output keeps the passive tap active
  }
  receive(data) {
    if (data.type !== 'levels' || data.epoch !== this.epoch) return;
    this.queue.push(data);
    while (this.queue.length > 45) this.queue.shift();
  }
  reset() { this.queue = []; this.epoch++; this.node?.port.postMessage({type:'reset', epoch:this.epoch}); }
  read() {
    let time = this.ctx?.currentTime || 0;
    const stamp = this.ctx?.getOutputTimestamp?.();
    if (stamp?.contextTime > 0) {
      const age = performance.now() - stamp.performanceTime;
      if (age >= 0 && age < 250) time = Math.min(time, stamp.contextTime + age / 1000);
    }
    const peaks = new Float32Array(8);
    while (this.queue.length && this.queue[0].time <= time) {
      const item = this.queue.shift();
      if (item.time < time - .25) continue;
      for (let i = 0; i < 8; i++) peaks[i] = Math.max(peaks[i], item.peaks[i]);
    }
    const pair = i => [db(peaks[i]), db(peaks[i + 1])];
    return {epoch:this.epoch, channels:{track:pair(0), vocal:pair(2)}, master:pair(4), input:pair(6), failed:!!this.failed};
  }
}
