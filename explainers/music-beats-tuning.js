// Explainer for music-beats-tuning: two tones a few hertz apart throb at the difference frequency.
// Look: brass tuning forks on a dark walnut table under a warm lamp, sound rings spreading from the
// tines, and a slate panel framed in brass where the waves are drawn. Fraunces for captions and
// titles, Jost for labels and readouts. Fork 1 is gold, fork 2 (and the string) teal, the sum cream.
//
// Scene plan (63 s). Captions centred at y = 832; the wave panel ends at y = 768.
//  A  0.0–10.5  Hook. Forks at 220 Hz and 222 Hz are struck; rings spread; a glow between them and a
//               scrolling loudness strip pulse twice per real second (2 Hz, timed in clip seconds).
//  B 10.2–24.9  Why. A 10 ms window of both waves and their sum; the clock runs from 0 to 0.25 s,
//               fork 2 slides out of step (it gains 2 cycles a second) until the sum cancels.
//  C 24.6–38.6  The whole second: 220 + 222 Hz summed per sample (dense band) with its envelope
//               2|cos(π·2·s)|: two swells. Beat rate = 222 − 220 = 2 per second.
//  D 38.3–53.6  Tuning. Fork 2 gives way to a string with a peg; the string is tuned 226 → 224 →
//               222 → 221 → 220 Hz; the beat phase is integrated from the changing difference, so the
//               strip's pulses slow (6, 4, 2, 1 per second) and stop.
//  E 53.3–63.0  Payoff card: beats per second = f₁ − f₂, with the sum-of-sines identity.
//
// Facts (Wikipedia, "Beat (acoustics)"): a beat is an interference pattern between two sounds of
// slightly different frequencies, perceived as a periodic variation in volume whose rate is the
// difference of the two frequencies; the sum of two sines equals a wave at the mean frequency times an
// envelope at half the difference, whose magnitude peaks f₁ − f₂ times a second; 220 Hz and 222 Hz beat
// at 2 Hz; as two tones approach unison the beating slows down and may become so slow as to be
// imperceptible; musicians commonly use beats to check tuning. Tuning forks are only the props here.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const PACE = 0.75; // the clip plays the scene at 75% speed: beat rates are timed in clip seconds
const real = (t) => t / PACE;

const C = {
  wood1: '#2A190D', wood2: '#160C05', grain: 'rgba(255,196,120,0.05)', grainDark: 'rgba(0,0,0,0.22)',
  brass: '#D9A441', brassHi: '#F8E09A', brassLo: '#7A4E12', gold: '#F2C45A', teal: '#86D4CB', tealLo: '#2F6E68',
  cream: '#F6EBD9', creamSoft: 'rgba(246,235,217,0.72)', slate: '#120E0B', slateEdge: '#5C4320',
};
const SERIF = 'Fraunces', SANS = 'Jost';

let k, ctx;
const font = (weight, size, family = SANS) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.cream, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- the sound ----------
const F1 = 220;
const T = { A: [0, 10.5], B: [10.2, 24.9], C: [24.6, 38.6], D: [38.3, 53.6], E: [53.3, 63.0] };
/** Frequency of the second source (fork 2, then the string) at scene time t. */
const TUNE = [[39.6, 41.0, 226, 224], [44.0, 44.8, 224, 222], [46.2, 47.0, 222, 221], [48.8, 50.6, 221, 220]];
function f2(t) {
  if (t < 38.9) return 222;
  if (t < 39.6) return lerp(222, 226, eio(seg(t, 38.9, 39.5)));
  let f = 226;
  for (const [a, b, from, to] of TUNE) { if (t >= a) f = t >= b ? to : lerp(from, to, eio(seg(t, a, b))); }
  return f;
}
// Beat phase: φ = 2π ∫ (f2 − f1) d(real time), integrated once with a fine step.
const DT = 0.004, PHI = [0];
for (let i = 1; i * DT <= 64; i++) PHI.push(PHI[i - 1] + 2 * Math.PI * (f2((i - 0.5) * DT) - F1) * (DT / PACE));
const phi = (t) => { const x = clamp(t, 0, 63.99) / DT, i = Math.floor(x); return lerp(PHI[i], PHI[i + 1], x - i); };
/** Loudness envelope of the sum, 0..1 (|cos(φ/2)|). */
const env = (t) => Math.abs(Math.cos(phi(t) / 2));
const sumAt = (s, fa, fb) => Math.sin(2 * Math.PI * fa * s) + Math.sin(2 * Math.PI * fb * s);

// ---------- background, painted once ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  let g = bgCanvas.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, '#1C110A'); lg.addColorStop(0.45, C.wood1); lg.addColorStop(1, C.wood2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // walnut grain: long wavy lines, drawn on a scratch canvas and softened once
  const grain = document.createElement('canvas'); grain.width = W; grain.height = H;
  const g0 = g;
  g = grain.getContext('2d');
  const rnd = mulberry32(11);
  for (let i = 0; i < 170; i++) {
    const y0 = rnd() * H, amp = 3 + rnd() * 10, fr = 0.004 + rnd() * 0.006, ph = rnd() * 6;
    g.strokeStyle = rnd() < 0.55 ? C.grain : C.grainDark; g.lineWidth = 0.8 + rnd() * 2.2;
    g.beginPath();
    for (let x = -10; x <= W + 10; x += 8) {
      const y = y0 + Math.sin(x * fr + ph) * amp + Math.sin(x * fr * 3.1 + ph * 2) * amp * 0.25;
      if (x === -10) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
  g = g0;
  g.filter = 'blur(1.5px)'; g.drawImage(grain, 0, 0); g.filter = 'none';
  // table edge: plank seams
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 3;
  for (const y of [132, 538]) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // lamp light pool and vignette
  const lamp = g.createRadialGradient(W / 2, 300, 30, W / 2, 360, 620);
  lamp.addColorStop(0, 'rgba(255,200,120,0.20)'); lamp.addColorStop(0.5, 'rgba(255,170,90,0.06)'); lamp.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = lamp; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, H / 2, 280, W / 2, H / 2, 780);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------- props ----------
const FORK1 = 250, FORK2 = 614, TOP = 176;
function brassGrad(x0, x1, lo = C.brassLo, hi = C.brassHi, mid = C.brass) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, lo); g.addColorStop(0.35, hi); g.addColorStop(0.6, mid); g.addColorStop(1, lo);
  return g;
}
/** A tuning fork on a little resonance box; vib blurs the tines. */
function fork(cx, vib, tint = 0) {
  const tw = 20, gap = 30, th = 214, bend = TOP + th;
  // resonance box
  const bx = cx - 92, by = 488;
  const wb = ctx.createLinearGradient(0, by, 0, by + 46);
  wb.addColorStop(0, '#6B4122'); wb.addColorStop(1, '#3A210F');
  ctx.fillStyle = wb; k.rrect(bx, by, 184, 46, 8); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; k.rrect(cx - 34, by + 14, 68, 18, 9); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(cx, by + 50, 104, 10, 0, 0, Math.PI * 2); ctx.fill();
  // stem
  ctx.fillStyle = brassGrad(cx - 8, cx + 8);
  k.rrect(cx - 8, bend + 20, 16, by - bend - 18, 4); ctx.fill();
  // U-bend
  ctx.strokeStyle = brassGrad(cx - gap / 2 - tw, cx + gap / 2 + tw); ctx.lineWidth = tw;
  ctx.beginPath(); ctx.arc(cx, bend, gap / 2 + tw / 2, 0, Math.PI); ctx.stroke();
  // tines, drawn at ±vib for a motion blur
  const tineGrad = (x) => brassGrad(x - tw / 2, x + tw / 2);
  for (const [off, a] of vib > 0.2 ? [[-vib, 0.5], [vib, 0.5], [0, 0.6]] : [[0, 1]]) {
    withAlpha(a, () => {
      for (const side of [-1, 1]) {
        const x = cx + side * (gap / 2 + tw / 2) + side * off;
        ctx.fillStyle = tineGrad(x); k.rrect(x - tw / 2, TOP, tw, th + 2, [9, 9, 0, 0]); ctx.fill();
      }
    });
  }
  if (tint) withAlpha(tint, () => { ctx.fillStyle = 'rgba(134,212,203,0.35)'; ctx.fillRect(cx - gap / 2 - tw - 2, TOP, gap + 2 * tw + 4, th); });
}
/** A string on a narrow board with a tuning peg at the top. */
function stringProp(cx, f, vib) {
  const by = 488;
  const wb = ctx.createLinearGradient(cx - 40, 0, cx + 40, 0);
  wb.addColorStop(0, '#3A210F'); wb.addColorStop(0.5, '#7A4C28'); wb.addColorStop(1, '#3A210F');
  ctx.fillStyle = wb; k.rrect(cx - 40, TOP - 6, 80, by - TOP + 52, 12); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(cx, by + 50, 60, 9, 0, 0, Math.PI * 2); ctx.fill();
  // bridges
  ctx.fillStyle = C.brassHi; k.rrect(cx - 22, TOP + 38, 44, 8, 3); ctx.fill(); k.rrect(cx - 22, by - 6, 44, 8, 3); ctx.fill();
  // peg: turns with the tuning
  const ang = (f - 220) * 0.55;
  ctx.save(); ctx.translate(cx, TOP + 14); ctx.rotate(ang);
  ctx.fillStyle = brassGrad(-30, 30); k.rrect(-30, -9, 60, 18, 9); ctx.fill();
  ctx.fillStyle = C.brassLo; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // the string, blurred by its vibration
  ctx.strokeStyle = 'rgba(248,224,154,0.9)'; ctx.lineWidth = 2.5;
  for (const off of vib > 0.2 ? [-vib, vib] : [0]) {
    ctx.beginPath(); ctx.moveTo(cx, TOP + 42); ctx.quadraticCurveTo(cx + off * 2, (TOP + by) / 2, cx, by - 2); ctx.stroke();
  }
}
/** Rings spreading from a source. */
function rings(cx, cy, t, color, a = 1) {
  const speed = 50, gap = 64, maxR = 300;
  for (let i = 0; i < 5; i++) {
    const r = 30 + ((t * speed + i * gap) % (gap * 5));
    if (r > maxR) continue;
    const fade = (1 - r / maxR) * a;
    ctx.strokeStyle = color; ctx.globalAlpha = 0.42 * fade; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI * 0.95, Math.PI * 0.95); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function tag(s, x, y, color) {
  font(600, 26); const w = ctx.measureText(s).width + 32;
  ctx.fillStyle = 'rgba(18,12,8,0.82)'; k.rrect(x - w / 2, y - 21, w, 42, 21); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2; k.rrect(x - w / 2, y - 21, w, 42, 21); ctx.stroke();
  text(s, x, y + 1, { color, align: 'center', base: 'middle' });
}
/** The glow between the sources: what you hear. */
function loudGlow(t, a) {
  const e = env(t);
  const r = 40 + 70 * e;
  const g = ctx.createRadialGradient(W / 2, 300, 0, W / 2, 300, r * 1.8);
  g.addColorStop(0, `rgba(255,236,190,${0.75 * e * a})`); g.addColorStop(0.4, `rgba(242,196,90,${0.35 * e * a})`); g.addColorStop(1, 'rgba(242,196,90,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, 300, r * 1.8, 0, Math.PI * 2); ctx.fill();
}

// ---------- the slate panel ----------
const PX = 64, PY = 552, PW = 736, PH = 214;
function panel(fn) {
  ctx.fillStyle = 'rgba(14,10,8,0.92)'; k.rrect(PX, PY, PW, PH, 16); ctx.fill();
  ctx.strokeStyle = C.slateEdge; ctx.lineWidth = 3; k.rrect(PX, PY, PW, PH, 16); ctx.stroke();
  ctx.save(); k.rrect(PX + 2, PY + 2, PW - 4, PH - 4, 14); ctx.clip(); fn(); ctx.restore();
}
const IX0 = PX + 140, IX1 = PX + PW - 28; // plotting x range inside the panel
function line(fy, x0, x1, color, width = 3, step = 1.5) {
  ctx.beginPath();
  for (let x = x0; x <= x1 + 0.01; x += step) { const y = fy(x); if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.stroke();
}
/** Scrolling loudness strip: the last 3 clip seconds of the envelope. */
function strip(t, label) {
  const span3 = 3 * PACE; // 3 clip seconds, in scene seconds
  const cy = PY + PH / 2 + 12, amp = 72;
  font(600, 22); text(label, PX + 24, PY + 30, { color: C.creamSoft, base: 'middle' });
  text('LOUDNESS', PX + 24, cy + 2, { color: C.gold, base: 'middle' });
  const x0 = IX0, x1 = IX1;
  const tAt = (x) => t - span3 * (1 - (x - x0) / (x1 - x0));
  // second ticks, scrolling
  ctx.strokeStyle = 'rgba(246,235,217,0.16)'; ctx.lineWidth = 1.5;
  for (let s = Math.floor(real(t - span3)); s <= real(t); s++) {
    const x = x0 + ((s * PACE - (t - span3)) / span3) * (x1 - x0);
    if (x < x0 || x > x1) continue;
    ctx.beginPath(); ctx.moveTo(x, PY + 48); ctx.lineTo(x, PY + PH - 14); ctx.stroke();
  }
  // band: a smooth fill inside ±envelope (a hatch would flicker as it scrolls)
  const bandG = ctx.createLinearGradient(0, cy - amp, 0, cy + amp);
  bandG.addColorStop(0, 'rgba(242,196,90,0.42)'); bandG.addColorStop(0.5, 'rgba(242,196,90,0.18)'); bandG.addColorStop(1, 'rgba(242,196,90,0.42)');
  ctx.fillStyle = bandG; ctx.beginPath();
  for (let x = x0; x <= x1; x += 2) { const tt = tAt(x); ctx.lineTo(x, cy - (tt < 0 ? 0 : env(tt) * amp)); }
  for (let x = x1; x >= x0; x -= 2) { const tt = tAt(x); ctx.lineTo(x, cy + (tt < 0 ? 0 : env(tt) * amp)); }
  ctx.closePath(); ctx.fill();
  for (const sgn of [-1, 1]) line((x) => { const tt = tAt(x); return cy + sgn * (tt < 0 ? 0 : env(tt) * amp); }, x0, x1, C.gold, 2.5, 2);
  // pen
  const e = env(t);
  ctx.fillStyle = C.brassHi; ctx.beginPath(); ctx.arc(x1, cy - e * amp, 6, 0, Math.PI * 2); ctx.fill();
}

// ---------- the props layer: forks, string, rings (persistent, so crossfades never dim them) ----------
const piece = (t, pts) => { // smooth piecewise value: pts = [[t, v], …]
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], eio(seg(t, pts[i - 1][0], pts[i][0])));
  return pts.at(-1)[1];
};
function props(t) {
  const rise = eout(seg(t, 0.1, 1.0)) * piece(t, [[53.3, 1], [54.2, 0.35]]);
  const struck = eout(seg(t, 1.0, 1.6));
  const ringA = struck * piece(t, [[10.0, 1], [11.0, 0.55], [24.6, 0.55], [25.4, 0.45], [38.3, 0.45], [39.1, 0.85]]);
  const swap = eio(seg(t, 38.5, 39.4));
  const f = f2(t);
  const fLabel = Math.abs(f - Math.round(f)) < 0.05 ? `${Math.round(f)} Hz` : `${f.toFixed(1)} Hz`;
  withAlpha(rise, () => {
    rings(FORK1, TOP + 70, t, C.gold, ringA);
    rings(FORK2, TOP + 70, t + 0.33, C.teal, ringA);
    loudGlow(t, ringA);
    const vib = struck * 3;
    fork(FORK1, vib);
    withAlpha(1 - swap, () => fork(FORK2, vib));
    withAlpha(swap, () => stringProp(FORK2, f, vib));
    tag(swap > 0.5 ? 'fork 220 Hz' : '220 Hz', FORK1, 140, C.gold);
    withAlpha(1 - swap, () => tag('222 Hz', FORK2, 140, C.teal));
    withAlpha(swap, () => tag(`string ${fLabel}`, FORK2, 140, C.teal));
  });
}

// ---------- scenes: the panel's contents ----------
function sceneA(t) {
  strip(t, 'WHAT YOU HEAR · last 3 seconds');
}

function sceneB(t) {
  // the clock: 0 → 0.25 s of real sound while the scene plays
  const clock = 0.25 * eio(seg(t, 15.4, 22.6));
  const ms = 10; // window width
  const sx = (x) => clock + ((x - IX0) / (IX1 - IX0)) * (ms / 1000);
  const cyW = PY + 70, cyS = PY + 156, a = 24;
  font(600, 22);
  text('220 Hz', PX + 24, cyW - 14, { color: C.gold, base: 'middle' });
  text('222 Hz', PX + 24, cyW + 14, { color: C.teal, base: 'middle' });
  text('SUM', PX + 24, cyS, { color: C.cream, base: 'middle' });
  text('10 MILLISECONDS', PX + 24, PY + 28, { color: C.creamSoft, base: 'middle' });
  ctx.strokeStyle = 'rgba(246,235,217,0.14)'; ctx.lineWidth = 1;
  for (const y of [cyW, cyS]) { ctx.beginPath(); ctx.moveTo(IX0, y); ctx.lineTo(IX1, y); ctx.stroke(); }
  line((x) => cyW - a * Math.sin(2 * Math.PI * F1 * sx(x)), IX0, IX1, C.gold, 3);
  line((x) => cyW - a * Math.sin(2 * Math.PI * 222 * sx(x)), IX0, IX1, C.teal, 3);
  line((x) => cyS - a * sumAt(sx(x), F1, 222), IX0, IX1, C.cream, 3.5);
  font(600, 22);
  text(`t = ${clock.toFixed(3)} s`, IX1, PY + 28, { color: C.creamSoft, align: 'right', base: 'middle' });
  const gained = clock * 2; // cycles fork 2 has gained
  text(`fork 2 ahead by ${gained.toFixed(2)} cycle`, 470, PY + 28, { color: C.teal, align: 'center', base: 'middle' });
}

function sceneC(t) {
  const cy = PY + PH / 2 + 16, a = 42;
  const reveal = eio(seg(t, 25.0, 27.6));
  const xr = lerp(IX0, IX1, reveal);
  font(600, 22);
  text('SUM', PX + 24, cy, { color: C.cream, base: 'middle' });
  text('ONE SECOND OF 220 + 222 Hz', PX + 24, PY + 28, { color: C.creamSoft, base: 'middle' });
  for (const [s, lbl] of [[0.5, '0.5 s'], [1, '1 s']]) {
    const x = lerp(IX0, IX1, s);
    text(lbl, x, PY + 28, { color: C.creamSoft, align: s === 1 ? 'right' : 'center', base: 'middle' });
  }
  // the true sum, sampled finely: 221 cycles across the width read as a dense band
  ctx.save(); ctx.beginPath(); ctx.rect(IX0 - 2, PY, xr - IX0 + 2, PH); ctx.clip();
  line((x) => cy - a * sumAt((x - IX0) / (IX1 - IX0), F1, 222), IX0, IX1, 'rgba(246,235,217,0.55)', 1, 0.2);
  ctx.restore();
  // envelope 2|cos(π·Δf·s)|
  withAlpha(eout(seg(t, 27.8, 29.0)), () => {
    for (const sgn of [-1, 1]) line((x) => cy + sgn * a * 2 * Math.abs(Math.cos(Math.PI * 2 * ((x - IX0) / (IX1 - IX0)))), IX0, IX1, C.gold, 3, 2);
  });
  // count the swells
  [0, 1].forEach((i) => withAlpha(eout(seg(t, 29.8 + i * 0.8, 30.4 + i * 0.8)), () => {
    const x = lerp(IX0, IX1, [0.25, 0.75][i]);
    ctx.fillStyle = 'rgba(14,10,8,0.85)'; ctx.beginPath(); ctx.arc(x, cy, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke();
    font(700, 26); text(`${i + 1}`, x, cy + 1, { color: C.gold, align: 'center', base: 'middle' });
  }));
}

function sceneD(t) {
  strip(t, 'WHAT YOU HEAR · last 3 seconds');
  const d = Math.abs(f2(t) - F1);
  const ds = Math.abs(d - Math.round(d)) < 0.05 ? `${Math.round(d)}` : d.toFixed(1);
  font(700, 26);
  text(`${ds} beat${ds === '1' ? '' : 's'} per second`, IX1, PY + 30, { color: d < 0.05 ? C.teal : C.gold, align: 'right', base: 'middle' });
}

function sceneE(t) {
  font(600, 22); text('BEATS PER SECOND', W / 2, PY + 34, { color: C.creamSoft, align: 'center', base: 'middle', spacing: '2px' });
  font(700, 64, SERIF);
  const parts = [['f', C.gold], ['₁', C.gold], [' − ', C.cream], ['f', C.teal], ['₂', C.teal]];
  const widths = parts.map(([s]) => ctx.measureText(s).width);
  let x = W / 2 - widths.reduce((s, w) => s + w, 0) / 2;
  parts.forEach(([s, c], i) => { text(s, x, PY + 100, { color: c, base: 'middle' }); x += widths[i]; });
  withAlpha(eout(seg(t, 55.4, 56.2)), () => {
    font(500, 26); text('222 Hz − 220 Hz = 2 beats per second', W / 2, PY + 150, { color: C.cream, align: 'center', base: 'middle' });
    font(500, 22); text('Source: Wikipedia, “Beat (acoustics)” · waves computed in code', W / 2, PY + 186, { color: 'rgba(246,235,217,0.6)', align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CUES = [
  [0.5, 4.8, 'Two tuning forks, almost in tune: *220 Hz* and ~222 Hz~.'],
  [4.9, 10.2, 'Sound both, and you hear a throb: loud, soft, loud, soft.'],
  [10.6, 15.2, 'Zoom in. At first, their waves rise and fall *in step*.'],
  [15.3, 20.0, 'But ~fork 2~ makes 2 extra vibrations a second, so it drifts ahead.'],
  [20.1, 24.7, 'A quarter of a second in, they are opposite. They *cancel*.'],
  [25.0, 29.5, 'Over one whole second, the sum swells and fades *twice*.'],
  [29.6, 34.3, 'Those swells are called *beats*. Their rate is the ~difference~:'],
  [34.4, 38.4, '222 − 220 = *2 beats per second*.'],
  [38.7, 43.6, 'Musicians use beats to tune. Bring a ~string~ closer to the fork…'],
  [43.7, 48.6, '…and the beats slow down: *4*, then *2*, then *1* a second…'],
  [48.7, 53.4, '…until they are too slow to hear. Now they are ~in tune~.'],
  [53.8, 58.4, 'The beat rate tells you how far apart *two notes* are.'],
  [58.5, 62.9, 'Beats per second = the ~difference~ between the frequencies.'],
];
const CAP = { size: 44, lh: 56, weight: 600, maxW: 740 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size, SERIF);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 840, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SERIF, ink: C.cream, marks: { '*': C.gold, '~': C.teal } });
  }
}

Kit.scene({
  width: W, height: H, duration: 63, pace: PACE,
  fonts: [
    { family: SERIF, file: 'Fraunces.woff2', weight: '100 900' },
    { family: SANS, file: 'Jost.woff2', weight: '100 900' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    font(700, 22); text('RECKON', 64, 84, { color: C.gold, spacing: '3px' });
    const rw = ctx.measureText('RECKON').width + 18;
    font(500, 22); text('MUSIC · ACOUSTICS', 64 + rw + 16, 84, { color: C.creamSoft, spacing: '2px' });
    props(t);
    withAlpha(eout(seg(t, 2.0, 2.8)), () => panel(() => {
      const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
      for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
        if (t < a || t > b) continue;
        withAlpha(span(t, a, b, fi, fo), () => fn(t));
      }
    }));
    captions(t);
  },
});
