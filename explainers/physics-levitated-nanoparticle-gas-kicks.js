// Explainer for physics-levitated-nanoparticle-gas-kicks: on 19 October 2026 a Yale University team reported in
// Physical Review Letters that a glass bead held by a laser in a vacuum felt the kicks of single gas atoms and
// molecules. Look: a near-black violet vacuum, the infrared trapping beam drawn in pink, a glowing glass bead at
// its focus, teal xenon atoms, amber kicks and an oscilloscope trace of the bead's swing. IBM Plex Mono for
// numbers and labels, Jost (a geometric sans) for captions.
//
// Facts: Y.-H. Tseng, C. A. Hardy, T. W. Penny, C. Lowe, J. Baeza-Rubio, D. Carney, D. C. Moore, "Optomechanical
// Detection of Individual Gas Collisions", arXiv:2604.18371 v2 (19 October 2026), published in Physical Review
// Letters 137, 173601: a silica nanosphere of nominal radius 50 nm and mass about 1 fg, optically trapped in
// ultrahigh vacuum by a 1064 nm laser; its motion along the beam is a damped harmonic oscillator at 48 kHz,
// cooled by feedback; the phase of backscattered light reads out its position; background pressure about
// 3 × 10^-8 mbar; Kr, Xe and SF6 (83.798, 131.293 and 146.055 u) injected at pressures from 5 × 10^-8 to
// 1.4 × 10^-6 mbar; impulses from individual collisions detected in the 200–600 keV/c range, reconstructed
// down to 200 keV/c; below about 200 keV/c the events are dominated by reconstruction noise; an example xenon
// event of 390 ± 60 keV/c; gas temperature 293 K; some gas particles scatter specularly, others thermalise on
// the surface and leave in a random direction; the event rates gave partial pressures that agree with the
// cold cathode gauge from 10^-8 to 10^-7 mbar; the gas particles are about 10^-7 times as heavy as the sensor;
// Brownian motion, the macroscopic effect of many unresolved collisions (Brown 1828, Einstein 1905); possible
// uses: a pressure standard for extreme-high vacuum, and impulse-based searches for dark matter and sterile
// neutrinos. Physics World (23 October 2026): a group led by David Moore at Yale; pressure raised to about
// 1.5 nbar. Science News (22 October 2026): the sphere about 100 nm across.
//
// Computed here (k = 1.380649e-23 J/K, u = 1.6605e-27 kg, T = 293 K, bead mass 1e-18 kg): a xenon atom weighs
// 2.18e-25 kg, 4.6 million times less than the bead; its mean speed √(8kT/πm) is 217 m/s; bouncing straight back
// it transfers 2mv = 9.5e-23 kg·m/s = 177 keV/c; 200 keV/c = 1.07e-22 kg·m/s; a 390 keV/c kick changes the bead's
// speed by 0.21 mm/s and its swing at 48 kHz by 0.69 nm (Δv/ω). In air (28.97 u, 101,325 Pa) a 50 nm-radius
// sphere is hit P·A/√(2πmkT) = 9.1e13 times a second. 1.4e-6 mbar is 1.4 billionths of 1,013 mbar.
// The swing is drawn slowed down by a huge factor, and the bead is not to scale.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The news: a laser holds a glass bead.
//  B  9.4–23.2  The bead swings in the light trap; light reads the swing; the vacuum; xenon goes in.
//  C 23.2–41.6  One atom's kick: mass ratio, momentum, the 200 keV/c floor, what 390 keV/c does.
//  D 41.6–55.4  Brownian motion in air vs single hits; counting kicks gives the pressure.
//  E 55.4–64.8  A vacuum gauge from counting; neutrinos and dark matter.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#06040d', bg1: '#140b2a', ink: '#f4f1ff', soft: 'rgba(244,241,255,0.72)', faint: 'rgba(244,241,255,0.28)',
  beam: '#ff4d8b', glass: '#dff1ff', atom: '#46e0c5', kick: '#ffcf5c', trace: '#a99bff', panel: 'rgba(8,5,20,0.86)',
  noise: 'rgba(244,241,255,0.12)',
};
const MONO = 'IBM Plex Mono', SANS = 'Jost';

let k, ctx;
const font = (w, s, f = MONO) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- numbers ----------
const KB = 1.380649e-23, U = 1.66053906660e-27, T_GAS = 293, CL = 2.99792458e8, QE = 1.602176634e-19;
const BEAD = 1e-18, RAD = 50e-9, F_Z = 48000;
const M_XE = 131.293 * U, M_AIR = 28.97 * U;
const keV = (q) => (q * CL) / QE / 1000, fromKeV = (x) => (x * 1000 * QE) / CL;
const vMean = (m) => Math.sqrt((8 * KB * T_GAS) / (Math.PI * m));
const RATIO = BEAD / M_XE; // 4.6 million
const V_XE = vMean(M_XE); // 217 m/s
const Q_TYP = keV(2 * M_XE * V_XE); // 177 keV/c
const Q_EX = 390, DV = fromKeV(Q_EX) / BEAD, DX = DV / (2 * Math.PI * F_Z); // 0.21 mm/s, 0.69 nm
const AIR_HITS = (101325 * 4 * Math.PI * RAD * RAD) / Math.sqrt(2 * Math.PI * M_AIR * KB * T_GAS); // 9.1e13 per second
const fmt1 = (x) => x.toFixed(1), fmt2 = (x) => x.toFixed(2);

// ---------- the bead's swing (slowed): x(s) = calm swing + the ring-down of each kick ----------
const OMEGA = 2 * Math.PI * 1.1; // drawn swing, in rad per scene second
const KICKS = (() => {
  const list = [{ t: 26.0, h: 1.0 }, { t: 39.0, h: 1.6 }];
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9; i++) list.push({ t: 46.6 + i * 0.42 + r() * 0.2, h: (0.5 + r() * 0.9) * (r() < 0.5 ? -1 : 1) });
  for (let i = 0; i < 12; i++) list.push({ t: 51.2 + i * 0.3 + r() * 0.15, h: (0.5 + r() * 0.9) * (r() < 0.5 ? -1 : 1) });
  return list;
})();
function swing(s) {
  // feedback calms the swing from 1 to a small level; each kick adds a ring-down
  const calm = 0.16 + 0.84 * (1 - eio(seg(s, 15.0, 18.4)));
  let x = calm * Math.sin(OMEGA * s);
  for (const kk of KICKS) if (s > kk.t) x += kk.h * Math.exp(-(s - kk.t) / 2.4) * Math.sin(OMEGA * (s - kk.t));
  // a little detector noise
  x += 0.05 * Math.sin(s * 53.1) * Math.sin(s * 17.3 + 1.2);
  return x;
}

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'On 19 October 2026, physicists at Yale University reported feeling *single atoms* hit a speck of glass.'],
  [5.0, 9.4, 'The speck is a glass bead *100 nanometres* across, held up in a vacuum by a *laser beam*.'],
  [9.6, 14.0, 'The light holds it like a spring: the bead swings to and fro along the beam *48,000 times* a second.'],
  [14.2, 18.6, 'Light bouncing back off the bead tracks every swing, and a feedback loop keeps the swing calm.'],
  [18.8, 23.2, 'The chamber is nearly empty, about a *billionth* of air pressure. Then a trace of *xenon* gas goes in.'],
  [23.4, 27.8, `A xenon atom is about *${fmt1(RATIO / 1e6)} million times* lighter than the bead. Each one that bounces off gives it a ~kick~.`],
  [28.0, 32.4, `A kick is momentum, mass × speed. A xenon atom at a typical *${Math.round(V_XE)} m/s* bouncing back gives *${Math.round(Q_TYP)} keV/c*.`],
  [32.6, 37.0, 'The team could pick out kicks from *200 keV/c* up: the harder hits. Smaller ones were lost in the noise.'],
  [37.2, 41.6, `One kick of *${Q_EX} keV/c* changed the bead’s speed by *${fmt1(DV * 1000)} mm a second*, its swing by under a *nanometre*.`],
  [41.8, 46.2, `In air, a bead this size is hit about *${Math.round(AIR_HITS / 1e12)} trillion* times a second. The hits blur into a jiggle.`],
  [46.4, 50.8, 'Physicist Albert Einstein explained that jiggle, *Brownian motion*, in 1905. Here the hits came *one at a time*.'],
  [51.0, 55.4, 'More gas, more kicks: from their count the team worked out the gas *pressure*, and it matched the gauge.'],
  [55.6, 60.0, 'Counting single hits could become a new way to measure the *emptiest vacuums*.'],
  [60.2, 64.6, 'And beads like this may one day feel kicks from *neutrinos*, or even *dark matter*.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 520, 40, W / 2, 520, 760);
  rg.addColorStop(0, C.bg1); rg.addColorStop(1, C.bg0);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // the chamber wall: a faint ring of bolts
  g.strokeStyle = 'rgba(169,155,255,0.10)'; g.lineWidth = 3;
  g.beginPath(); g.arc(W / 2, 540, 380, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    g.fillStyle = 'rgba(169,155,255,0.12)'; g.beginPath(); g.arc(W / 2 + Math.cos(a) * 396, 540 + Math.sin(a) * 396, 5, 0, Math.PI * 2); g.fill();
  }
}

// ---------- pieces ----------
const FOCUS = [432, 560], BEAD_R = 26, SWING_PX = 16;
function beam(a, bright = 1) {
  A(a, () => {
    const [fx, fy] = FOCUS;
    // converging from a lens at x = 150, diverging after the focus
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, `rgba(255,77,139,${0.10 * bright})`); g.addColorStop(0.5, `rgba(255,77,139,${0.42 * bright})`); g.addColorStop(1, `rgba(255,77,139,${0.06 * bright})`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, fy - 70); ctx.lineTo(150, fy - 70); ctx.lineTo(fx, fy - 8); ctx.lineTo(W, fy - 110); ctx.lineTo(W, fy + 110); ctx.lineTo(fx, fy + 8); ctx.lineTo(150, fy + 70); ctx.lineTo(0, fy + 70); ctx.closePath(); ctx.fill();
    // the lens
    ctx.fillStyle = 'rgba(223,241,255,0.25)'; ctx.strokeStyle = 'rgba(223,241,255,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(150, fy, 16, 86, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
}
function bead(x, y, r = BEAD_R, glow = 1) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 2, x, y, r * 2.4);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(223,241,255,0.95)'); g.addColorStop(0.42, `rgba(255,120,170,${0.35 * glow})`); g.addColorStop(1, 'rgba(255,77,139,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(223,241,255,0.9)'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, Math.PI * 2); ctx.fill();
}
function atom(x, y, r = 7, col = C.atom) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function arrow(x0, y0, x1, y1, col, w = 5, head = 14) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.8, y1 - Math.sin(a) * head * 0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head); ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head); ctx.fill();
}
function chip(x, y, w, h, fn) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); fn(); }
/** "m × 10" with a raised exponent, starting at x; returns the end x. */
function sci(mant, exp, unit, x, y, size, col, align = 'left') {
  font(600, size);
  const a = `${mant} × 10`, w1 = ctx.measureText(a).width;
  font(600, size * 0.62); const w2 = ctx.measureText(exp).width;
  font(600, size); const w3 = ctx.measureText(unit).width;
  const total = w1 + w2 + 4 + w3;
  const x0 = align === 'center' ? x - total / 2 : x;
  font(600, size); text(a, x0, y, { color: col });
  font(600, size * 0.62); text(exp, x0 + w1 + 1, y - size * 0.38, { color: col });
  font(600, size); text(unit, x0 + w1 + w2 + 4, y, { color: col });
  return x0 + total;
}

// the oscilloscope: the bead's swing over the last 3.2 s
function scope(t, a, label = 'bead position along the beam') {
  A(a, () => {
    const x0 = 52, x1 = 812, y0 = 150, h = 170, mid = y0 + h / 2;
    ctx.fillStyle = C.panel; k.rrect(x0, y0, x1 - x0, h, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(169,155,255,0.15)'; ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) { const x = lerp(x0, x1, i / 8); ctx.beginPath(); ctx.moveTo(x, y0 + 8); ctx.lineTo(x, y0 + h - 8); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x0 + 8, mid); ctx.lineTo(x1 - 8, mid); ctx.stroke();
    ctx.strokeStyle = C.trace; ctx.lineWidth = 3; ctx.beginPath();
    const n = 260;
    for (let i = 0; i <= n; i++) {
      const s = t - 3.2 + (i / n) * 3.2, x = lerp(x0 + 10, x1 - 10, i / n), y = mid - clamp(swing(s), -1.9, 1.9) * 38;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    // mark kicks on the trace
    for (const kk of KICKS) {
      const u = (kk.t - (t - 3.2)) / 3.2;
      if (u < 0 || u > 1 || kk.t > t) continue;
      const x = lerp(x0 + 10, x1 - 10, u);
      ctx.fillStyle = C.kick; ctx.beginPath(); ctx.moveTo(x, y0 + 12); ctx.lineTo(x - 7, y0 + 2); ctx.lineTo(x + 7, y0 + 2); ctx.fill();
    }
    font(400, 24, SANS); text(label, x0 + 16, y0 + h + 24, { color: C.soft });
    text('slowed down', x1 - 16, y0 + h + 24, { color: C.faint, align: 'right' });
  });
}

// ---------- A + B: the trap ----------
function sceneTrap(t) {
  const a = span(t, 0, 41.8, 0.01, 0.5);
  if (a <= 0) return;
  A(a, () => {
    beam(seg(t, 0.4, 1.4));
    const bx = FOCUS[0] + (t > 9.6 ? swing(t) * SWING_PX : 0), by = FOCUS[1];
    A(seg(t, 1.2, 2.2), () => bead(bx, by));
    // A: title
    A(span(t, 0.3, 9.6, 0.5, 0.5), () => {
      font(700, 54, SANS); text('Feeling one atom', 52, 100, { color: C.ink });
      font(400, 22); text('YALE · PHYSICAL REVIEW LETTERS · 19 OCT 2026', 54, 148, { color: C.beam, spacing: '1px' });
    });
    A(span(t, 5.0, 9.6, 0.4, 0.5), () => {
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(FOCUS[0] + 36, FOCUS[1] - 30); ctx.lineTo(540, 410); ctx.lineTo(600, 410); ctx.stroke();
      font(600, 30, SANS); text('glass bead', 548, 380, { color: C.glass });
      font(400, 26, SANS); text('100 nm across', 548, 440, { color: C.soft });
      text('about 1 femtogram', 548, 474, { color: C.soft });
      font(400, 22, SANS); text('(drawn far bigger)', 548, 506, { color: C.faint });
      font(600, 26, SANS); text('laser, 1064 nm', 40, FOCUS[1] + 110, { color: C.beam });
      font(400, 22, SANS); text('(infrared, drawn pink)', 40, FOCUS[1] + 142, { color: 'rgba(255,77,139,0.75)' });
    });
    // B: the spring of light
    A(span(t, 9.6, 14.2, 0.4, 0.4), () => {
      ctx.strokeStyle = C.trace; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i <= 60; i++) { const u = i / 60 - 0.5, x = FOCUS[0] + u * 240, y = FOCUS[1] + 150 - 520 * u * u; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      font(400, 26, SANS); text('the light pulls it back to the focus, like a spring', FOCUS[0], FOCUS[1] + 182, { color: C.trace, align: 'center' });
      chip(250, 180, 364, 110, () => {
        font(700, 44); text('48,000', 432, 222, { color: C.ink, align: 'center' });
        font(400, 24, SANS); text('swings a second', 432, 264, { color: C.soft, align: 'center' });
      });
    });
    // B: the readout
    A(span(t, 14.2, 41.8, 0.4, 0.5), () => {
      scope(t, 1);
    });
    A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
      const p = (t * 1.4) % 1;
      for (let i = 0; i < 3; i++) {
        const u = (p + i / 3) % 1, x = lerp(FOCUS[0] - 40, 60, u);
        A(Math.sin(u * Math.PI), () => arrow(x + 40, FOCUS[1] - 40, x, FOCUS[1] - 40, C.beam, 3, 10));
      }
      font(600, 26, SANS); text('light bounced back reads the swing', 60, FOCUS[1] - 120, { color: C.beam });
    });
    // B: the vacuum, then xenon
    A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
      chip(470, 630, 330, 100, () => {
        font(400, 24, SANS); text('pressure in the chamber', 494, 660, { color: C.soft });
        sci('3', '−8', ' mbar', 494, 700, 32, C.ink);
      });
      font(400, 22, SANS); text('air: about 1,000 mbar', 494, 754, { color: C.soft });
    });
    // gas atoms drifting in, from 20.6 s on
    const gasA = span(t, 20.4, 41.8, 0.8, 0.5);
    if (gasA > 0) A(gasA, () => {
      let s = 19; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 7; i++) {
        const x0 = r() * W, y0 = 360 + r() * 380, vx = (r() - 0.5) * 50, vy = (r() - 0.5) * 30;
        let x = x0 + vx * (t - 20), y = y0 + vy * (t - 20);
        x = ((x % W) + W) % W; y = 360 + ((((y - 360) % 380) + 380) % 380);
        if (Math.hypot(x - FOCUS[0], y - FOCUS[1]) < 80) continue;
        atom(x, y, 6);
      }
    });
    // C: one atom's kick at 26.0
    A(span(t, 23.4, 28.0, 0.4, 0.4), () => {
      const tk = 26.0, xIn = (s) => lerp(W + 20, bx + BEAD_R + 8, seg(s, 23.8, tk)), xOut = (s) => lerp(bx + BEAD_R + 8, W + 20, seg(s, tk, tk + 1.8));
      const x = t < tk ? xIn(t) : xOut(t);
      atom(x, FOCUS[1], 8);
      if (t < tk) arrow(x + 70, FOCUS[1] - 26, x + 10, FOCUS[1] - 26, C.atom, 3, 10);
      else arrow(x - 10, FOCUS[1] - 26, x + 60, FOCUS[1] - 26, C.atom, 3, 10);
      A(span(t, tk, tk + 1.6, 0.05, 0.6), () => arrow(bx - BEAD_R - 6, FOCUS[1], bx - BEAD_R - 76, FOCUS[1], C.kick, 6, 16));
      font(600, 28, SANS); text('xenon atom', 640, FOCUS[1] + 60, { color: C.atom });
      chip(80, 640, 470, 70, () => { font(600, 28, SANS); text(`bead = ${fmt1(RATIO / 1e6)} million xenon atoms`, 315, 675, { color: C.ink, align: 'center' }); });
    });
    // C: momentum
    A(span(t, 28.0, 32.6, 0.4, 0.4), () => {
      chip(60, 356, 744, 182, () => {
        font(600, 28, SANS); text('kick = 2 × mass × speed, bouncing straight back', 84, 390, { color: C.soft });
        let x = sci('2 × 2.18', '−25', ' kg', 84, 438, 30, C.atom);
        font(600, 30); text(` × ${Math.round(V_XE)} m/s`, x, 438, { color: C.ink });
        x = sci('= 9.5', '−23', ' kg·m/s', 84, 484, 30, C.ink);
        font(600, 30); text(` = ${Math.round(Q_TYP)} keV/c`, x, 484, { color: C.kick });
        font(400, 22, SANS); text('keV/c: a unit of momentum physicists use', 84, 520, { color: C.soft });
      });
    });
    // C: the scale of kicks
    A(span(t, 32.6, 37.2, 0.4, 0.4), () => {
      const x0 = 90, x1 = 780, y = 690, X = (q) => lerp(x0, x1, q / 600);
      ctx.fillStyle = C.panel; k.rrect(60, 610, 744, 150, 16); ctx.fill();
      ctx.fillStyle = C.noise; ctx.fillRect(X(0), y - 18, X(200) - X(0), 36);
      ctx.fillStyle = 'rgba(255,207,92,0.30)'; ctx.fillRect(X(200), y - 18, X(600) - X(200), 36);
      font(400, 22);
      for (const q of [0, 200, 400, 600]) text(`${q}`, X(q), y + 38, { color: C.soft, align: 'center' });
      text('keV/c', x1, y - 44, { color: C.soft, align: 'right' });
      font(600, 24, SANS); text('lost in noise', X(100), y, { color: C.ink, align: 'center' });
      text('seen: 200–600', X(400), y, { color: C.kick, align: 'center' });
      ctx.fillStyle = C.atom; ctx.beginPath(); ctx.arc(X(Q_TYP), y - 30, 7, 0, Math.PI * 2); ctx.fill();
      font(600, 22, SANS); text(`typical bounce, ${Math.round(Q_TYP)}`, X(Q_TYP), y - 52, { color: C.atom, align: 'center' });
    });
    // C: what a 390 keV/c kick does
    A(span(t, 37.2, 41.8, 0.4, 0.4), () => {
      A(span(t, 38.6, 40.4, 0.05, 0.6), () => arrow(bx - BEAD_R - 6, FOCUS[1], bx - BEAD_R - 90, FOCUS[1], C.kick, 7, 18));
      chip(80, 630, 704, 120, () => {
        font(700, 34); text(`${Q_EX} keV/c`, 104, 672, { color: C.kick });
        font(600, 26); text(`→ +${fmt2(DV * 1000)} mm/s`, 330, 672, { color: C.ink });
        text(`→ swing ±${fmt1(DX * 1e9)} nm`, 560, 672, { color: C.ink });
        font(400, 22, SANS); text('a real xenon event, 390 ± 60 keV/c; speed and swing computed', 104, 722, { color: C.soft });
      });
    });
  });
}

// ---------- D: Brownian motion, then single hits, then pressure ----------
function sceneD(t) {
  const a = span(t, 41.8, 55.6, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    const crowd = 1 - eio(seg(t, 46.4, 47.8));
    beam(1, 0.8);
    // jiggle in air, then the calm swing with single kicks
    const jx = crowd * 22 * (Math.sin(t * 31.7) * 0.6 + Math.sin(t * 17.9 + 2) * 0.4), jy = crowd * 18 * (Math.sin(t * 27.3 + 1) * 0.6 + Math.sin(t * 13.1) * 0.4);
    const bx = FOCUS[0] + jx + (1 - crowd) * swing(t) * SWING_PX, by = FOCUS[1] + jy;
    let s = 29; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    A(crowd, () => {
      for (let i = 0; i < 520; i++) {
        const ang = r() * Math.PI * 2, d = 40 + r() * 330, sp = 0.5 + r();
        const x = bx + Math.cos(ang + t * sp * 0.7) * d, y = by + Math.sin(ang + t * sp * 0.7) * d * 0.8;
        if (y < 360 || y > 770) continue;
        ctx.fillStyle = 'rgba(70,224,197,0.55)'; ctx.fillRect(x, y, 3, 3);
      }
    });
    bead(bx, by);
    A(span(t, 41.8, 46.4, 0.4, 0.4), () => {
      chip(160, 170, 544, 120, () => {
        font(700, 46); text(`~${Math.round(AIR_HITS / 1e12)} trillion`, 432, 214, { color: C.atom, align: 'center' });
        font(400, 24, SANS); text('hits a second in air (computed)', 432, 262, { color: C.soft, align: 'center' });
      });
    });
    A(span(t, 46.4, 51.2, 0.4, 0.4), () => scope(t, 1, 'one kick at a time'));
    A(span(t, 46.4, 51.0, 0.4, 0.4), () => {
      font(600, 28, SANS); text('Einstein, 1905: the jiggle is hits', 432, 410, { color: C.soft, align: 'center' });
    });
    // more gas, more kicks
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      const x0 = 120, x1 = 760, yb = 380, yt = 200;
      ctx.fillStyle = C.panel; k.rrect(80, 150, 704, 270, 16); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, yt - 10); ctx.lineTo(x0, yb); ctx.lineTo(x1, yb); ctx.stroke();
      const p = eout(seg(t, 51.2, 52.6));
      ctx.strokeStyle = C.kick; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(lerp(x0, x1 - 20, p), lerp(yb, yt, p)); ctx.stroke();
      for (let i = 1; i <= 5; i++) {
        const u = i / 5.4; if (u > p) continue;
        ctx.fillStyle = C.kick; ctx.beginPath(); ctx.arc(lerp(x0, x1 - 20, u), lerp(yb, yt, u) + (i % 2 ? 6 : -6), 6, 0, Math.PI * 2); ctx.fill();
      }
      font(400, 22); text('gas pressure →', x1, yb - 20, { color: C.soft, align: 'right' });
      text('kicks a second ↑', x0 + 12, yt - 18, { color: C.soft });
      font(400, 22, SANS);
      text('schematic', x1, yt - 18, { color: C.faint, align: 'right' });
    });
  });
}

// ---------- E: uses ----------
function sceneE(t) {
  const a = span(t, 55.6, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    beam(1, 0.7);
    const bx = FOCUS[0] + swing(t) * SWING_PX * 0.6;
    bead(bx, FOCUS[1]);
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      // a gauge whose needle moves with the count
      const cx = 432, cy = 330, r = 130;
      ctx.fillStyle = C.panel; ctx.beginPath(); ctx.arc(cx, cy, r + 20, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.stroke();
      for (let i = 0; i <= 10; i++) {
        const an = Math.PI + (i / 10) * Math.PI;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * (r - 14), cy + Math.sin(an) * (r - 14)); ctx.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); ctx.stroke();
      }
      const n = Math.floor(seg(t, 56.0, 59.4) * 12), an = Math.PI + (0.15 + 0.06 * n) * Math.PI;
      ctx.strokeStyle = C.kick; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(an) * (r - 24), cy + Math.sin(an) * (r - 24)); ctx.stroke();
      font(600, 28); text(`kicks counted: ${n}`, cx, cy + 40, { color: C.kick, align: 'center' });
      font(400, 26, SANS); text('a vacuum gauge that counts atoms: an idea', cx, 160, { color: C.soft, align: 'center' });
      // atoms hitting one by one
      for (let i = 0; i < 12; i++) {
        const t0 = 56.0 + i * (3.4 / 12), p = seg(t, t0 - 0.5, t0);
        if (p <= 0 || p >= 1) continue;
        const side = i % 2 ? 1 : -1;
        atom(lerp(FOCUS[0] + side * 300, bx + side * (BEAD_R + 6), p), FOCUS[1] + (i % 3 - 1) * 12, 6);
      }
    });
    A(span(t, 60.2, 64.8, 0.4, 0.01), () => {
      // ghostly particles streaming through
      for (let i = 0; i < 14; i++) {
        const y = 230 + i * 34, x = ((t * 260 + i * 97) % (W + 200)) - 100;
        ctx.strokeStyle = `rgba(169,155,255,${0.25 + 0.2 * (i % 3)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 60, y); ctx.lineTo(x, y); ctx.stroke();
      }
      font(700, 44, SANS); text('neutrinos? dark matter?', 432, 200, { color: C.trace, align: 'center' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [MONO, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneTrap(t);
    sceneD(t);
    sceneE(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 40, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.kick, '~': C.atom } });
  },
});
