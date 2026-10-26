// Explainer for body-optogenetics-nobel: the 2026 Nobel Prize in Physiology or Medicine went to Karl
// Deisseroth, Peter Hegemann and Georg Nagel for light-gated ion channels and optogenetics. Look: a dark
// lab-teal background, the alga in spring green, the light in bright blue, ions in coral and nerve signals
// in gold, drawn as on an oscilloscope. Outfit for labels and numbers, Nunito for captions.
//
// Computed here: the nerve cell's response to light, with the same simplified model as the post's lab (an
// integrate-and-fire cell with a light-gated conductance that opens within about a millisecond and closes
// over about ten); with the gene the cell fires once per 5 ms flash, without it the light does nothing.
// Facts: Nobel press release and popular background (nobelprize.org), 5 October 2026: "for their
// discoveries concerning light-gated ion channels and optogenetics"; Hegemann asked how the alga
// Chlamydomonas swims so quickly towards light, and measured an electrical response half a millisecond
// after light reached its eyespot (at least 10 ms in our eyes); he proposed one protein that both catches
// light and is an ion channel; Nagel put two algal genes into frog eggs, which made the proteins; blue light
// opened channelrhodopsin-2 within 0.2 ms and positive ions flowed in; Deisseroth put its gene into rat nerve
// cells and triggered nerve signals with blue light (published 2005); 2006 the name optogenetics; 2007 a
// thin optic fibre in the brain of living mice moved their whiskers; circuits for memories, fear and
// wakefulness; in a clinical trial a blind person given a channelrhodopsin-like protein regained some vision.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: the prize; a nerve cell that lights up when a flash hits it.
//  B  9.0–23.0  The alga swims to the light; half a millisecond against ten; one protein, two jobs.
//  C 23.0–36.8  Frog eggs make the protein; blue light opens the channel in 0.2 ms; ions rush in.
//  D 36.8–55.0  2005: flashes make a rat nerve cell fire, and without the gene nothing; 2007: a mouse.
//  E 55.0–64.6  Circuits for memory, sleep and fear; some sight back for a blind person.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#03151a', bg2: '#08282c', ink: '#effaf5', soft: 'rgba(239,250,245,0.72)', faint: 'rgba(239,250,245,0.26)',
  green: '#8fd65a', greenDark: '#3f7d2a', blue: '#4fa8ff', blueGlow: 'rgba(79,168,255,0.35)', coral: '#ff8a5c', gold: '#ffd166',
  mem: '#d8c39a', memDark: '#8a7653', panel: 'rgba(2,14,16,0.7)', eyespot: '#ff9f1c',
};
const LAB = 'Outfit', CAP = 'Nunito';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const circle = (x, y, r, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };

// ---------- the nerve cell model (as in the lab): times in ms, voltages in mV ----------
const MODEL = { rest: -70, threshold: -50, reset: -70, tauM: 10, tauOn: 1, tauOff: 10, gMax: 1.0, reversal: 0, refractory: 4, dt: 0.05 };
function simulate(gene, flashMs, perSecond, totalMs = 1000) {
  const m = MODEL, period = 1000 / perSecond, trace = [], spikes = [];
  let v = m.rest, g = 0, refr = 0;
  for (let i = 0; i * m.dt < totalMs; i++) {
    const t = i * m.dt, on = gene && t % period < flashMs;
    g += on ? ((m.gMax - g) / m.tauOn) * m.dt : (-g / m.tauOff) * m.dt;
    if (refr > 0) { refr -= m.dt; v = m.reset; }
    else {
      v += ((-(v - m.rest) + g * (m.reversal - v)) / m.tauM) * m.dt;
      if (v >= m.threshold) { spikes.push(t); v = m.reset; refr = m.refractory; }
    }
    if (i % 10 === 0) trace.push([t, v]);
  }
  return { trace, spikes, flashes: Math.ceil(totalMs / period), period };
}
const RUN = { flash: 5, rate: 5 };
const WITH = simulate(true, RUN.flash, RUN.rate), WITHOUT = simulate(false, RUN.flash, RUN.rate);

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 5 October 2026, the Nobel Prize in Physiology or Medicine went to *optogenetics*.'],
  [4.8, 9.0, 'It lets scientists switch chosen nerve cells *on* with a flash of light.'],
  [9.2, 13.6, 'It began with a green alga, ~Chlamydomonas~, that swims towards light.'],
  [13.8, 18.2, 'Peter Hegemann found it reacts in *half a millisecond*, far faster than our eyes.'],
  [18.4, 22.8, 'He guessed that one protein both caught the light and opened a channel.'],
  [23.0, 27.4, 'Georg Nagel put the alga’s genes into frog eggs, which then made the protein.'],
  [27.6, 32.0, 'Blue light opened it within *0.2 milliseconds*: a channel gated by light.'],
  [32.2, 36.6, 'Positive ions rushed into the cell. They named it *channelrhodopsin*.'],
  [36.8, 41.2, 'In 2005 Karl Deisseroth put its gene into nerve cells from rats.'],
  [41.4, 45.8, 'Now each flash of *blue light* made the nerve cell fire a ^signal^.'],
  [46.0, 50.4, 'Without the gene, the same flashes do nothing at all.'],
  [50.6, 55.0, 'In 2007, light sent down a thin fibre moved a living mouse’s whiskers.'],
  [55.2, 59.6, 'Labs now switch circuits on to learn what they do, in memory, sleep or fear.'],
  [59.8, 64.2, 'In a trial, a similar protein in the eye gave a blind person back some sight.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 420, 60, W / 2, 420, 760);
  rg.addColorStop(0, C.bg2); rg.addColorStop(1, C.bg1);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 40; i++) { // soft cells out of focus
    const x = r() * W, y = r() * H, rad = 20 + r() * 70;
    const cg = g.createRadialGradient(x, y, 0, x, y, rad);
    cg.addColorStop(0, `rgba(120,200,170,${0.03 + r() * 0.04})`); cg.addColorStop(1, 'rgba(120,200,170,0)');
    g.fillStyle = cg; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
}

// ---------- drawing pieces ----------
function neuron(cx, cy, s, glow, signal = -1) {
  // dendrites, soma and axon; `glow` lights the cell, `signal` (0–1) runs a pulse down the axon
  const col = `rgba(${Math.round(lerp(120, 255, glow))},${Math.round(lerp(150, 209, glow))},${Math.round(lerp(150, 102, glow))},1)`;
  ctx.strokeStyle = col; ctx.lineCap = 'round';
  const branch = (x, y, a, len, w, depth) => {
    if (depth === 0) return;
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    branch(x2, y2, a - 0.45, len * 0.7, w * 0.65, depth - 1); branch(x2, y2, a + 0.4, len * 0.68, w * 0.65, depth - 1);
  };
  for (const a of [-2.6, -1.9, -1.2, 2.5, 1.95]) branch(cx, cy, a, 70 * s, 9 * s, 3);
  ctx.lineWidth = 9 * s; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.bezierCurveTo(cx + 120 * s, cy + 30 * s, cx + 200 * s, cy + 120 * s, cx + 300 * s, cy + 150 * s); ctx.stroke();
  for (const a of [0.2, 0.7, 1.2]) { ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(cx + 300 * s, cy + 150 * s); ctx.lineTo(cx + 300 * s + Math.cos(a) * 50 * s, cy + 150 * s + Math.sin(a) * 50 * s); ctx.stroke(); }
  if (glow > 0) { const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 110 * s); gg.addColorStop(0, `rgba(255,209,102,${0.5 * glow})`); gg.addColorStop(1, 'rgba(255,209,102,0)'); ctx.fillStyle = gg; ctx.fillRect(cx - 120 * s, cy - 120 * s, 240 * s, 240 * s); }
  circle(cx, cy, 34 * s, col);
  circle(cx, cy, 13 * s, 'rgba(3,21,26,0.45)');
  if (signal >= 0 && signal <= 1) {
    const u = signal, x = Math.pow(1 - u, 3) * cx + 3 * Math.pow(1 - u, 2) * u * (cx + 120 * s) + 3 * (1 - u) * u * u * (cx + 200 * s) + u * u * u * (cx + 300 * s);
    const y = Math.pow(1 - u, 3) * cy + 3 * Math.pow(1 - u, 2) * u * (cy + 30 * s) + 3 * (1 - u) * u * u * (cy + 120 * s) + u * u * u * (cy + 150 * s);
    const sg = ctx.createRadialGradient(x, y, 0, x, y, 30 * s); sg.addColorStop(0, 'rgba(255,209,102,0.95)'); sg.addColorStop(1, 'rgba(255,209,102,0)');
    ctx.fillStyle = sg; ctx.fillRect(x - 30 * s, y - 30 * s, 60 * s, 60 * s);
  }
}

function flash(x, y, r, a) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(190,225,255,${0.95 * a})`); g.addColorStop(0.35, `rgba(79,168,255,${0.6 * a})`); g.addColorStop(1, 'rgba(79,168,255,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function alga(x, y, s, a = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  ctx.strokeStyle = 'rgba(200,240,190,0.85)'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(18, side * 4); ctx.bezierCurveTo(34, side * 18, 44, side * 6, 58, side * 22); ctx.stroke(); }
  ctx.fillStyle = C.green; ctx.beginPath(); ctx.ellipse(0, 0, 22, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.greenDark; ctx.beginPath(); ctx.ellipse(-4, 0, 13, 9, 0, 0, Math.PI * 2); ctx.fill();
  circle(10, -8, 4, C.eyespot);
  ctx.restore();
}

function membrane(x0, x1, y, open, t) {
  // a lipid bilayer drawn as two rows of heads with tails, and a channel protein in the middle
  const mid = (x0 + x1) / 2, gap = 70 * open;
  for (let x = x0; x <= x1; x += 22) {
    if (Math.abs(x - mid) < 62) continue;
    for (const side of [-1, 1]) {
      circle(x, y + side * 44, 10, C.mem);
      ctx.strokeStyle = C.memDark; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - 3, y + side * 34); ctx.lineTo(x - 3, y + side * 8); ctx.moveTo(x + 3, y + side * 34); ctx.lineTo(x + 3, y + side * 8); ctx.stroke();
    }
  }
  // the channel: two halves that part when light arrives
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#7fb2a3';
    const cx = mid + side * (34 + gap * 0.25);
    k.rrect(cx - 26, y - 64, 52, 128, 20); ctx.fill();
    circle(cx - side * 6, y - 4, 7, C.eyespot); // retinal, the light catcher
  }
}

// ---------- scenes ----------
function sceneHook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 0.2, 9.2, 0.6, 0.4), () => {
      font(700, 24); text('NOBEL PRIZE IN PHYSIOLOGY OR MEDICINE 2026', 60, 92, { color: C.gold, base: 'middle', spacing: '1.5px' });
      font(700, 40);
      ['Karl Deisseroth', 'Peter Hegemann', 'Georg Nagel'].forEach((n, i) => A(eout(seg(t, 0.6 + i * 0.4, 1.4 + i * 0.4)), () => text(n, 60, 148 + i * 52, { color: C.ink, base: 'middle' })));
    });
    const f = t > 5.2 ? Math.max(0, 1 - (t - 5.2) / 0.5) : 0;
    const glow = seg(t, 5.3, 5.8) * (1 - seg(t, 7.6, 8.6));
    neuron(330, 520, 1.1, glow, t > 5.6 ? (t - 5.6) / 1.6 : -1);
    // the light: a beam from above-left
    A(seg(t, 4.8, 5.2) * (1 - seg(t, 5.6, 6.2)), () => {
      const g = ctx.createLinearGradient(140, 300, 330, 520);
      g.addColorStop(0, 'rgba(79,168,255,0)'); g.addColorStop(1, 'rgba(79,168,255,0.55)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(120, 300); ctx.lineTo(170, 300); ctx.lineTo(360, 520); ctx.lineTo(300, 520); ctx.closePath(); ctx.fill();
    });
    flash(330, 520, 140, f);
    A(span(t, 6.0, 9.0), () => { font(700, 30); text('fires!', 420, 430, { color: C.gold, base: 'middle' }); });
  });
}

const ALGAE = (() => { let s = 21; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); return Array.from({ length: 46 }, () => ({ x: r(), y: r(), a: r() * 6.28, sp: 0.6 + r() * 0.6 })); })();
function sceneAlga(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const cx = 400, cy = 440, R = 290;
    const dish = 1 - seg(t, 13.6, 14.3);
    A(dish, () => {
      ctx.strokeStyle = 'rgba(220,245,235,0.45)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(160,220,190,0.05)'; ctx.fill();
      const pull = eio(seg(t, 10.0, 13.6));
      for (const p of ALGAE) {
        const ang = p.x * Math.PI * 2, rad = Math.sqrt(p.y) * (R - 30);
        const x0 = cx + Math.cos(ang) * rad, y0 = cy + Math.sin(ang) * rad;
        const tx = cx + R - 60 - p.y * 70, ty = cy + (p.x - 0.5) * 160;
        const x = lerp(x0, tx, pull * p.sp > 1 ? 1 : pull * p.sp), y = lerp(y0, ty, pull * p.sp > 1 ? 1 : pull * p.sp);
        alga(x, y, 0.5, lerp(p.a, 0, pull));
      }
      flash(cx + R + 20, cy, 120, 0.5 + 0.2 * Math.sin(t * 6));
      font(600, 24); text('light', cx + R - 20, cy - 110, { color: C.blue, base: 'middle' });
    });
    // one alga, close up, and the race
    A(span(t, 13.8, 23.0, 0.5, 0.3), () => {
      alga(300, 300, 3.0, 0);
      A(span(t, 13.8, 18.4), () => { font(600, 24); text('eyespot', 360, 196, { color: C.eyespot, base: 'middle' }); });
      A(span(t, 14.2, 18.3, 0.4, 0.3), () => {
        const L = 120, Wd = 640, max = 10;
        ctx.fillStyle = C.panel; k.rrect(80, 470, 700, 200, 14); ctx.fill();
        font(600, 24); text('time from light to an electrical signal', 100, 504, { color: C.soft, base: 'middle' });
        const g1 = eout(seg(t, 14.6, 15.2)), g2 = eout(seg(t, 15.2, 16.4));
        ctx.fillStyle = C.green; ctx.fillRect(L + 120, 540, (Wd - 300) * (0.5 / max) * g1 + 2, 34);
        ctx.fillStyle = C.coral; ctx.fillRect(L + 120, 600, (Wd - 300) * (10 / max) * g2, 34);
        font(700, 26); text('alga', 100, 557, { color: C.green, base: 'middle' }); text('our eye', 100, 617, { color: C.coral, base: 'middle' });
        text('0.5 ms', L + 140 + (Wd - 300) * 0.05, 557, { color: C.green, base: 'middle' });
        A(g2, () => text('10 ms or more', L + 130 + (Wd - 300) * g2, 617, { color: C.coral, base: 'middle' }));
      });
      A(span(t, 18.4, 23.0, 0.4, 0.3), () => {
        // one protein: catches light and lets ions through
        ctx.fillStyle = C.panel; k.rrect(80, 470, 700, 200, 14); ctx.fill();
        ctx.fillStyle = '#7fb2a3'; k.rrect(150, 500, 110, 140, 30); ctx.fill();
        circle(205, 560, 12, C.eyespot);
        font(700, 28); text('one protein, two jobs?', 300, 520, { color: C.ink, base: 'middle' });
        font(600, 24); text('1 · catch the light', 300, 572, { color: C.eyespot, base: 'middle' }); text('2 · open a channel for ions', 300, 614, { color: C.coral, base: 'middle' });
      });
    });
  });
}

function sceneChannel(t) {
  const a = span(t, 23.0, 36.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // frog egg with the new protein in its surface
    A(1 - seg(t, 27.2, 27.8), () => {
      const cx = 430, cy = 430, R = 210;
      const eg = ctx.createRadialGradient(cx - 60, cy - 70, 20, cx, cy, R);
      eg.addColorStop(0, '#f3ead2'); eg.addColorStop(0.55, '#c9b98f'); eg.addColorStop(1, '#5a4b33');
      ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(40,30,25,0.75)'; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI * 0.05, Math.PI * 0.95); ctx.fill(); // the dark half of a frog egg
      const inj = eout(seg(t, 23.4, 24.6));
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(760, 140); ctx.lineTo(lerp(760, cx + 120, inj), lerp(140, cy - 120, inj)); ctx.stroke();
      font(600, 24); text('algal genes', 620, 120, { color: C.green, base: 'middle' });
      const n = Math.round(40 * eout(seg(t, 24.8, 26.8)));
      for (let i = 0; i < n; i++) { const an = i * 0.157 + 0.1; circle(cx + Math.cos(an) * R, cy + Math.sin(an) * R, 7, '#7fb2a3'); }
      A(seg(t, 25.4, 26.0), () => { font(700, 28); text('the egg makes the protein', cx, cy + R + 44, { color: C.ink, align: 'center', base: 'middle' }); });
    });
    // the close-up: the channel opens in blue light, ions rush in
    A(seg(t, 27.4, 28.0), () => {
      const y = 430, open = eout(seg(t, 28.9, 29.1));
      membrane(60, 800, y, open, t);
      font(600, 24); text('outside the cell', 70, 300, { color: C.soft, base: 'middle' }); text('inside', 70, 580, { color: C.soft, base: 'middle' });
      // photons arriving
      for (let i = 0; i < 6; i++) {
        const p = seg(t, 28.0 + i * 0.12, 28.9 + i * 0.12);
        if (p <= 0 || p >= 1) continue;
        const x = lerp(250 + i * 40, 400 + i * 12, p), yy = lerp(150, 380, p);
        circle(x, yy, 6, C.blue); flash(x, yy, 22, 0.6);
      }
      A(span(t, 28.9, 32.2), () => { font(800, 44); text('0.2 ms', 560, 230, { color: C.blue, base: 'middle' }); font(600, 24); text('to open', 560, 270, { color: C.soft, base: 'middle' }); });
      // ions
      if (t > 29.2) for (let i = 0; i < 18; i++) {
        const start = 29.3 + i * 0.32, p = seg(t, start, start + 1.4);
        if (p <= 0 || p >= 1) continue;
        const x = 430 + Math.sin(i * 1.7) * 14 * (1 - p) + (p > 0.6 ? (i % 2 ? 1 : -1) * (p - 0.6) * 200 : 0), yy = lerp(250, 640, p);
        circle(x, yy, 13, C.coral); font(800, 20); text('+', x, yy + 1, { color: '#3a1408', align: 'center', base: 'middle' });
      }
      A(span(t, 32.4, 36.8), () => { font(800, 40); text('channelrhodopsin', W / 2, 700, { color: C.gold, align: 'center', base: 'middle' }); });
    });
  });
}

function scope(t, x0, y0, w, h, run, from, sweep) {
  // an oscilloscope: one second of the cell's voltage with the light flashes beneath it
  ctx.fillStyle = C.panel; k.rrect(x0 - 20, y0 - 20, w + 40, h + 86, 14); ctx.fill();
  const X = (ms) => x0 + (ms / 1000) * w, V = (mv) => y0 + h - ((mv + 80) / 120) * h;
  ctx.strokeStyle = 'rgba(239,250,245,0.08)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(X(i * 100), y0); ctx.lineTo(X(i * 100), y0 + h); ctx.stroke(); }
  const shown = clamp((t - from) / sweep) * 1000;
  for (let i = 0; i < run.flashes; i++) {
    const ms = i * run.period;
    if (ms > shown) break;
    ctx.fillStyle = C.blue; ctx.fillRect(X(ms) - 1, y0 + h + 18, Math.max(4, (RUN.flash / 1000) * w), 24);
  }
  font(600, 22); text('light', x0, y0 + h + 62, { color: C.blue, base: 'middle' });
  text('1 second', x0 + w, y0 + h + 62, { color: C.soft, align: 'right', base: 'middle' });
  ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath();
  let first = true;
  for (const [ms, v] of run.trace) { if (ms > shown) break; first ? ctx.moveTo(X(ms), V(v)) : ctx.lineTo(X(ms), V(v)); first = false; }
  ctx.stroke();
  for (const s of run.spikes) { if (s > shown) break; ctx.beginPath(); ctx.moveTo(X(s), V(MODEL.threshold)); ctx.lineTo(X(s), V(30)); ctx.lineTo(X(s) + 2, V(-75)); ctx.stroke(); }
}

function sceneNeuron(t) {
  const a = span(t, 36.8, 55.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    A(1 - seg(t, 50.4, 51.0), () => {
      const gene = t < 45.9;
      const spikeNow = gene && t > 41.4 ? WITH.spikes.find((s) => { const at = 41.6 + (s / 1000) * 4.0; return t >= at && t < at + 0.35; }) : undefined;
      neuron(250, 290, 0.75, spikeNow !== undefined ? 1 : 0.15);
      // the gene going in
      A(span(t, 37.0, 41.4), () => {
        ctx.strokeStyle = C.green; ctx.lineWidth = 4;
        const p = eout(seg(t, 37.4, 39.0)), gx = lerp(700, 300, p), gy = lerp(140, 270, p);
        for (let i = 0; i < 2; i++) { ctx.beginPath(); for (let j = 0; j <= 30; j++) { const u = j / 30, x = gx - 60 + u * 120, y = gy + Math.sin(u * 12 + i * Math.PI) * 12; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
        font(600, 24); text('channelrhodopsin gene', 520, 110, { color: C.green, base: 'middle' });
      });
      A(span(t, 41.4, 50.4, 0.4, 0.3), () => {
        font(800, 30); text(gene ? 'with the gene' : 'without the gene', 500, 230, { color: gene ? C.gold : C.soft, base: 'middle' });
        font(600, 24); text(gene ? `${WITH.flashes} flashes → ${WITH.spikes.length} signals` : `${WITHOUT.flashes} flashes → ${WITHOUT.spikes.length} signals`, 500, 272, { color: C.soft, base: 'middle' });
      });
      if (t > 41.4) scope(t, 90, 440, 680, 220, gene ? WITH : WITHOUT, gene ? 41.6 : 46.2, 4.0);
      const fl = gene ? WITH : WITHOUT, from = gene ? 41.6 : 46.2;
      for (let i = 0; i < fl.flashes; i++) { const at = from + (i * fl.period / 1000) * 4.0; flash(250, 290, 110, t > 41.4 ? 1 - seg(t, at, at + 0.3) : 0); }
    });
    // 2007: a mouse with an optical fibre
    A(span(t, 50.8, 55.0, 0.5, 0.3), () => {
      const cx = 430, cy = 420, pulse = (Math.sin((t - 50.8) * 9) > 0.3) ? 1 : 0;
      ctx.fillStyle = '#b9c4c9';
      ctx.beginPath(); ctx.ellipse(cx, cy, 190, 120, -0.1, 0, Math.PI * 2); ctx.fill(); // head
      ctx.beginPath(); ctx.ellipse(cx - 210, cy + 40, 70, 46, -0.3, 0, Math.PI * 2); ctx.fill(); // snout
      circle(cx + 40, cy - 120, 62, '#cfd8dc'); circle(cx + 40, cy - 120, 36, '#e7b8c0'); // ear
      circle(cx - 90, cy - 10, 14, '#1c2326'); circle(cx - 270, cy + 30, 12, '#e79aa8'); // eye, nose
      ctx.strokeStyle = '#eef3f5'; ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) { const w = pulse ? 0.35 : 0; ctx.beginPath(); ctx.moveTo(cx - 240, cy + 40 + i * 6); ctx.lineTo(cx - 240 - Math.cos(0.3 - i * 0.22 - w) * 160, cy + 40 + i * 6 - Math.sin(0.3 - i * 0.22 - w) * 160); ctx.stroke(); }
      // the fibre from above
      ctx.strokeStyle = C.blue; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx + 60, 110); ctx.lineTo(cx + 20, cy - 70); ctx.stroke();
      flash(cx + 20, cy - 70, 60, pulse);
      font(600, 24); text('optic fibre', cx + 80, 140, { color: C.blue, base: 'middle' });
      font(800, 44); text('2007', 60, 120, { color: C.gold, base: 'middle' });
    });
  });
}

function sceneNow(t) {
  const a = span(t, 55.2, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    // a brain seen from the side, with three circuits switched on in turn
    A(1 - seg(t, 59.6, 60.2), () => {
      const cx = 430, cy = 430;
      ctx.fillStyle = 'rgba(216,195,154,0.18)'; ctx.strokeStyle = C.mem; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(cx, cy, 300, 200, 0, Math.PI, Math.PI * 2.02); ctx.bezierCurveTo(cx + 300, cy + 140, cx + 120, cy + 170, cx + 40, cy + 150); ctx.bezierCurveTo(cx - 80, cy + 190, cx - 300, cy + 150, cx - 300, cy); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(216,195,154,0.35)'; ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(cx - 200 + i * 100, cy - 60 + (i % 2) * 30, 60, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
      const nets = [['memory', cx - 120, cy + 40, 55.6], ['sleep', cx + 160, cy + 60, 56.8], ['fear', cx + 20, cy - 70, 58.0]];
      for (const [lab, x, y, at] of nets) {
        const g = eout(seg(t, at, at + 0.5));
        if (g <= 0) continue;
        A(g, () => {
          ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
          for (let i = 0; i < 5; i++) { const an = i * 1.26; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * 46, y + Math.sin(an) * 30); ctx.stroke(); circle(x + Math.cos(an) * 46, y + Math.sin(an) * 30, 6, C.gold); }
          flash(x, y, 60, 0.7 + 0.3 * Math.sin(t * 7));
          font(700, 28); text(lab, x, y - 54, { color: C.ink, align: 'center', base: 'middle' });
        });
      }
    });
    // an eye: light-sensitive protein in the retina
    A(span(t, 59.9, 64.8, 0.5, 0.01), () => {
      const cx = 430, cy = 420;
      ctx.fillStyle = '#eef3f0'; ctx.beginPath(); ctx.ellipse(cx, cy, 250, 140, 0, 0, Math.PI * 2); ctx.fill();
      const ig = ctx.createRadialGradient(cx, cy, 10, cx, cy, 110); ig.addColorStop(0, '#2b6c80'); ig.addColorStop(1, '#123a46');
      circle(cx, cy, 110, '#1d5566'); ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2); ctx.fill();
      circle(cx, cy, 44, '#081316');
      const on = eout(seg(t, 61.2, 62.4));
      flash(cx - 18, cy - 20, 90, on * 0.8);
      font(600, 24); text('a light-sensitive protein, like the alga’s, in the retina', cx, cy + 190, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [LAB, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneAlga(t);
    sceneChannel(t);
    sceneNeuron(t);
    sceneNow(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 41, weight: 800, family: CAP, ink: C.ink, marks: { '*': C.blue, '~': C.green, '^': C.gold } });
  },
});
