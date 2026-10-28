/**
 * Steadies a raw gaze point before it is drawn.
 * A single bad frame from the camera model can land anywhere on the screen.
 * Those jumps are ignored unless the eyes stay in the new place, which is a
 * real look, not noise.
 */

function alpha(cutoff, dt) {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
}

class OneEuro1D {
  constructor(minCutoff, beta, dCutoff) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.reset();
  }

  reset() {
    this.x = null;
    this.dx = null;
    this.prevX = null;
    this.prevT = null;
  }

  filter(value, t) {
    let dt = this.prevT == null ? 1 / 30 : t - this.prevT;
    dt = Math.min(Math.max(dt, 1e-3), 0.2);
    this.prevT = t;
    const rate = this.prevX == null ? 0 : (value - this.prevX) / dt;
    this.prevX = value;
    const edx = this.low(rate, alpha(this.dCutoff, dt), "dx");
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    return this.low(value, alpha(cutoff, dt), "x");
  }

  low(value, a, key) {
    this[key] = this[key] == null ? value : a * value + (1 - a) * this[key];
    return this[key];
  }
}

export function createGazeStabilizer({ minCutoff = 1, beta = 0.004, dCutoff = 1, jumpPx = 160 } = {}) {
  const fx = new OneEuro1D(minCutoff, beta, dCutoff);
  const fy = new OneEuro1D(minCutoff, beta, dCutoff);
  let last = null;
  let pending = null;

  function resetFilters() {
    fx.reset();
    fy.reset();
  }

  return {
    reset() {
      resetFilters();
      last = null;
      pending = null;
    },
    push(sample) {
      if (!sample || !Number.isFinite(sample.x) || !Number.isFinite(sample.y)) return null;
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (sample.x < -120 || sample.y < -120 || sample.x > width + 120 || sample.y > height + 120) {
        return last;
      }
      const x = Math.min(width, Math.max(0, sample.x));
      const y = Math.min(height, Math.max(0, sample.y));
      if (last) {
        const jump = Math.hypot(x - last.x, y - last.y);
        if (jump > jumpPx) {
          const nearPending = pending && Math.hypot(x - pending.x, y - pending.y) <= 80;
          pending = nearPending
            ? { x, y, hits: pending.hits + 1 }
            : { x, y, hits: 1 };
          if (pending.hits < 3) return last;
          resetFilters();
          pending = null;
        } else {
          pending = null;
        }
      }
      const t = (Number.isFinite(sample.t) ? sample.t : Date.now()) / 1000;
      const next = { x: fx.filter(x, t), y: fy.filter(y, t), t: sample.t };
      last = next;
      return next;
    },
  };
}
