// Passive four-bus sample-peak tap. The output is silent, so this node cannot
// alter the backing, processed vocal, dry recording or headphone signal.
class BoothLevels extends AudioWorkletProcessor {
  constructor() {
    super(); this.peaks = new Float32Array(8); this.frames = 0; this.epoch = 0;
    this.interval = Math.round(sampleRate / 30);
    this.port.onmessage = e => {
      if (e.data.type === 'reset') {
        this.peaks.fill(0); this.frames = 0; this.epoch = e.data.epoch;
      }
    };
  }
  process(inputs, outputs) {
    const n = outputs[0][0].length;
    for (let bus = 0; bus < 4; bus++) {
      const input = inputs[bus];
      if (!input?.length) continue;
      for (let side = 0; side < 2; side++) {
        const data = input[Math.min(side, input.length - 1)];
        const index = bus * 2 + side;
        let peak = this.peaks[index];
        for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
        this.peaks[index] = peak;
      }
    }
    this.frames += n;
    if (this.frames >= this.interval) {
      this.port.postMessage({type: 'levels', time: (currentFrame + n) / sampleRate,
        epoch: this.epoch, peaks: this.peaks});
      this.peaks.fill(0); this.frames = 0;
    }
    return true;
  }
}
registerProcessor('booth-levels', BoothLevels);
