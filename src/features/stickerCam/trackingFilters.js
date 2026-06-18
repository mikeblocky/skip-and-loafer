// ── One Euro Filter (Casiez et al., CHI 2012) ─────────────────────────────────
class LowPassFilter {
  constructor(alpha) { this.alpha = alpha; this.s = null; }
  filter(x) {
    if (this.s === null) { this.s = x; return x; }
    this.s = this.alpha * x + (1 - this.alpha) * this.s;
    return this.s;
  }
  setAlpha(a) { this.alpha = a; }
}
class OneEuroFilter {
  constructor(freq = 30, mincutoff = 1.5, beta = 0.1, dcutoff = 1.0) {
    this.freq = freq; this.mincutoff = mincutoff;
    this.beta = beta; this.dcutoff = dcutoff;
    this.xfilt  = new LowPassFilter(this._alpha(mincutoff));
    this.dxfilt = new LowPassFilter(this._alpha(dcutoff));
    this.lastTs = null;
  }
  _alpha(cutoff) {
    const te = 1 / this.freq, tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / te);
  }
  filter(x, timestamp) {
    if (this.lastTs !== null) {
      const dt = (timestamp - this.lastTs) / 1000;
      if (dt > 0) this.freq = 1 / dt;
    }
    this.lastTs = timestamp;
    const prevX = this.xfilt.s ?? x;
    const dx    = this.freq * (x - prevX);
    const edx   = this.dxfilt.filter(dx);
    const cutoff = this.mincutoff + this.beta * Math.abs(edx);
    this.xfilt.setAlpha(this._alpha(cutoff));
    return this.xfilt.filter(x);
  }
}

export { OneEuroFilter };
