import {MeterBallistics, SILENCE_DB} from './meter-ballistics.js?v=2.5';

const fraction = db => Math.max(0, Math.min(1, (db + 60) / 60));
const label = db => db <= -95 ? '−∞' : db < -60 ? '<−60' : (db > 0 ? '+' : '') + db.toFixed(1);

export function createLevelMeter(name) {
  const meter = document.createElement('div');
  meter.className = 'level-meter';
  meter.setAttribute('role', 'img');
  meter.setAttribute('aria-label', `${name}: stereo sample peak, dBFS`);
  meter.title = 'Stereo sample peaks · dBFS · after effects, pan and fader. Thin lines hold peaks for 1.2 seconds; red caps hold overloads for 2 seconds.';
  meter.innerHTML = `<div class="level-meter-body" aria-hidden="true"><div class="level-meter-pair">${['L', 'R'].map(side => `<div class="level-meter-rail"><span class="level-meter-cover"></span><span class="level-meter-peak"></span><span class="level-meter-clip"></span><span class="level-meter-side">${side}</span></div>`).join('')}</div><div class="level-meter-scale">${[0, -12, -24, -48, -60].map(db => `<span style="top:${-db / 60 * 100}%">${db === 0 ? '0' : '−' + -db}</span>`).join('')}</div></div><span class="level-meter-reading" aria-hidden="true">PK −∞</span>`;
  return meter;
}

export class MixerMeters {
  constructor() { this.views = new Map(); this.epoch = -1; this.last = 0; this.nextText = 0; }
  bind(root = document) {
    this.views.clear();
    for (const channel of root.querySelectorAll('.channel-strip[data-strip]')) {
      const meter = channel.querySelector('.level-meter');
      if (!meter) continue;
      this.views.set(channel.dataset.strip, {meter, title:meter.title, name: channel.querySelector('.strip-head strong')?.textContent || 'Channel',
        bars: [...meter.querySelectorAll('.level-meter-rail')].map(rail => ({rail, cover: rail.querySelector('.level-meter-cover'), marker: rail.querySelector('.level-meter-peak'), state: new MeterBallistics()})),
        reading: channel.querySelector('.strip-meter-value')});
    }
    this.nextText = 0;
  }
  draw(data, ms) {
    const now = ms / 1000, dt = this.last ? Math.max(0, now - this.last) : 0;
    this.last = now;
    if (data.epoch !== this.epoch) {
      this.epoch = data.epoch;
      for (const view of this.views.values()) for (const bar of view.bars) bar.state.reset();
      this.nextText = 0;
    }
    const textDue = now >= this.nextText;
    if (textDue) this.nextText = now + .2;
    for (const [id, view] of this.views) {
      const input=id==='vocal'&&data.vocalInput,mode=input?'input':'output',changed=view.mode!==mode;if(changed){view.mode=mode;view.meter.title=input?'Raw microphone sample peak before effects and fader. Monitoring Off does not hide input levels.':view.title;for(const bar of view.bars)bar.state.reset();}const pair = id === 'master' ? data.master : data.channels[id];
      for (let i = 0; i < 2; i++) {
        const bar = view.bars[i], state = bar.state.update(pair?.[i] ?? SILENCE_DB, now, dt);
        bar.cover.style.transform = `scaleY(${1 - fraction(state.level)})`;
        bar.marker.style.transform = `translateY(${-fraction(state.peak) * 100}%)`;
        bar.marker.style.opacity = state.peak > -60 ? '1' : '0';
        bar.rail.classList.toggle('is-over', state.clipUntil > now);
      }
      if (textDue || changed) {
        const peak = Math.max(...view.bars.map(b => b.state.peak));
        const over = view.bars.some(b => b.state.clipUntil > now);
        view.reading.textContent = (input?'IN ':'PK ') + label(peak) + ' dBFS';
        view.reading.classList.toggle('is-over', over);
        view.meter.setAttribute('aria-label', `${view.name}${input?' input':''}: L ${label(view.bars[0].state.peak)}, R ${label(view.bars[1].state.peak)} dBFS${over ? ', overload' : ''}`);
      }
    }
  }
}
