export const SILENCE_DB = -100;
export class MeterBallistics {
  constructor() { this.reset(); }
  reset() { this.level = SILENCE_DB; this.peak = SILENCE_DB; this.holdUntil = 0; this.clipUntil = 0; }
  update(db, now, dt) {
    const value = Number.isFinite(db) ? db : SILENCE_DB;
    this.level = Math.max(value, this.level - 24 * dt, SILENCE_DB);
    if (value >= this.peak) { this.peak = value; this.holdUntil = now + 1.2; }
    else if (now > this.holdUntil) this.peak = Math.max(this.level, this.peak - 12 * Math.min(dt, now - this.holdUntil), SILENCE_DB);
    if (value >= 0) this.clipUntil = now + 2;
    return this;
  }
}
