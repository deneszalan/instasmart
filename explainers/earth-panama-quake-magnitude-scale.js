// Explainer for earth-panama-quake-magnitude-scale: what an earthquake's magnitude measures, told through the
// magnitude 7.7 quake in Panama on 9 October 2026. Look: a seismograph drum, cream recording paper with ink
// traces, brick red for the big numbers and a steel blue for comparisons; energy drawn as squares you can count.
// Jost (a geometric sans) for captions and labels, Fraunces (a soft display serif) for the magnitudes.
//
// Facts: USGS event page us6000u18k (reviewed): M 7.7 (Mww), 12 km WSW of Pitaloza Arriba, Panama,
// 9 October 2026, 17:56 UTC, 12:56 PM local time, depth about 13 km; W-phase scalar moment 3.77e20 N·m; the
// Pacific Tsunami Warning Center's first origin gave 8.0; tectonic summary: Panama sits on the Panama microplate
// between the Cocos and Nazca plates (west and south) and the Caribbean and South America plates (north and
// east); the Cocos plate subducts beneath it in the south and the Caribbean plate beneath it in the north; the
// focal mechanism shows left-lateral strike-slip faulting; notable earlier quakes in the broader area: M7.5 in
// July 1934 and M7.2 in July 1962. USGS event us6000u19w: M 6.6, 12 km W of Río Grande, Panama, 2.5 hours later
// the same day. USGS, "Earthquake Magnitude, Energy Release, and Shaking Intensity": moment = rigidity × area ×
// slip; each whole-number step is a tenfold increase in amplitude on a seismogram and about 32 times more energy;
// shaking depends on depth, distance and the ground (bedrock shakes least, soft mud most).
// Energy ratios are computed here from E ∝ 10^(1.5 M); Mw = (2/3)(log10 M0 − 9.1).
//
// Scene plan (64.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The seismogram, 7.7, and the first estimate of 8.0.
//  B  9.2–23.0  What magnitude measures: rigidity × area × slip; elastic rebound; left-lateral strike-slip.
//  C 23.0–46.0  The logarithmic scale: 32 times the energy, 10 times the swing, 1,000 times, 8.0 vs 7.7, the 6.6.
//  D 46.0–50.6  How a fault adds a step: 4 × 4 × 2 = 32.
//  E 50.6–59.8  Panama's plates and its earlier big quakes.
//  F 59.8–64.4  Magnitude is the source; shaking depends on distance and ground.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#efe6d2', paper2: '#e4d8bd', ink: '#1d2830', soft: 'rgba(29,40,48,0.72)', faint: 'rgba(29,40,48,0.30)',
  grid: 'rgba(29,40,48,0.09)', red: '#b83a26', redSoft: 'rgba(184,58,38,0.18)', blue: '#2b5d7a', blueSoft: 'rgba(43,93,122,0.20)',
  ochre: '#a8741c', rock: '#cdbf9f', rock2: '#bfae8a', panel: 'rgba(239,230,210,0.92)',
};
const SANS = 'Jost', SERIF = 'Fraunces';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers (USGS) ----------
const MAG = 7.7, FIRST = 8.0, AFTER = 6.6, M0 = 3.77e20;
const MW = (2 / 3) * (Math.log10(M0) - 9.1); // 7.65, shown as 7.7
const energy = (a, b) => Math.pow(10, 1.5 * (a - b)); // energy of magnitude a over magnitude b
const STEP = energy(1, 0); // 31.6
const VS_FIRST = energy(FIRST, MAG); // 2.8
const VS_AFTER = energy(MAG, AFTER); // 44.7
const PAST = [[1934, 7.5], [1962, 7.2], [2026, MAG]];
const r1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

const CUES = [
  [0.4, 4.6, 'On 9 October 2026, the ground near Pitaloza Arriba, Panama, shook in a magnitude *7.7* quake.'],
  [4.8, 9.0, `The first estimate said ~${r1(FIRST)}~. Does three tenths of a point matter? More than you’d think.`],
  [9.2, 13.6, 'Magnitude measures the quake’s *moment*: the rock’s stiffness × the area that slipped × the slip.'],
  [13.8, 18.2, 'Two sides of a fault stay locked while stress bends the rock, until it *snaps* and slides.'],
  [18.4, 22.8, 'This fault slid *sideways*: from either side, the other side moved to your left.'],
  [23.0, 27.4, `The scale counts in powers: each step up releases about *${Math.round(STEP)} times* the energy.`],
  [27.6, 32.0, 'On a seismogram, each step makes the waves’ swing *10 times* taller.'],
  [32.2, 36.6, `Two steps up is ${Math.round(STEP)} × ${Math.round(STEP)}: about *1,000 times* the energy.`],
  [36.8, 41.2, `So ~${r1(FIRST)}~ would have meant almost *${Math.round(VS_FIRST)} times* the energy of 7.7, from 0.3 of a step.`],
  [41.4, 45.8, `A magnitude ${r1(AFTER)} quake that followed released about ~${Math.round(VS_AFTER)} times less~ energy.`],
  [46.0, 50.4, 'To climb one step, a fault must slip over a much bigger area, or slip much further.'],
  [50.6, 55.0, 'Panama rides a small plate, squeezed by the *Cocos*, *Nazca*, *Caribbean* and South American plates.'],
  [55.2, 59.6, 'Big quakes have struck the region before: magnitude *7.5* in 1934 and *7.2* in 1962.'],
  [59.8, 64.2, 'Magnitude is the energy at the source. How hard you shake depends on ~distance~ and the ~ground~.'],
];

// ---------- background: recording paper ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.paper); lg.addColorStop(1, C.paper2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.grid; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 36) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 760); g.stroke(); }
  for (let y = 0; y <= 760; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(80,60,30,${r() * 0.04})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
}

// ---------- a seismogram trace ----------
/** Ground motion at position u (seconds along the trace): background noise plus a quake arriving at u0. */
function wiggle(u, u0, amp, seed) {
  const noise = Math.sin(u * 7.3 + seed) * 0.6 + Math.sin(u * 13.1 + seed * 2) * 0.4 + Math.sin(u * 23.7 + seed * 3) * 0.3;
  let q = 0;
  if (u > u0) {
    const d = u - u0, env = Math.min(1, d * 3) * Math.exp(-d * 0.55);
    q = env * (Math.sin(d * 19 + seed) * 0.7 + Math.sin(d * 31 + seed * 1.7) * 0.5 + Math.sin(d * 11) * 0.4);
  }
  return noise * 1.8 + q * amp;
}
function trace(x0, x1, y, { upTo = 1, u0 = 99, amp = 0, seed = 1, color = C.ink, width = 1.6, span: sp = 8 } = {}) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round';
  ctx.beginPath();
  const xe = lerp(x0, x1, upTo);
  for (let x = x0; x <= xe; x += 1.5) {
    const u = ((x - x0) / (x1 - x0)) * sp;
    const yy = y - wiggle(u, u0, amp, seed);
    x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
  }
  ctx.stroke();
}

// ---------- A: the record ----------
function hook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    const rows = 9, y0 = 150, gap = 62, x0 = 56, x1 = 808;
    for (let i = 0; i < rows; i++) {
      const y = y0 + i * gap;
      const quake = i === 4;
      const p = quake ? eio(seg(t, 0.3, 3.2)) : 1;
      trace(x0, x1, y, { upTo: p, u0: quake ? 2.2 : 99, amp: quake ? 46 : 0, seed: i * 1.7 + 0.3, color: quake ? C.ink : C.faint, width: quake ? 2 : 1.3 });
    }
    // the stamp
    A(seg(t, 2.6, 3.2), () => {
      ctx.fillStyle = C.panel; k.rrect(250, 300, 364, 250, 22); ctx.fill();
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; k.rrect(250, 300, 364, 250, 22); ctx.stroke();
      font(500, 26); text('magnitude', W / 2, 340, { color: C.soft, align: 'center' });
      font(800, 140, SERIF); text(r1(MAG), W / 2, 440, { color: C.red, align: 'center' });
      font(500, 22); text('9 October 2026 · Panama', W / 2, 520, { color: C.soft, align: 'center' });
    });
    // the first estimate, crossed out
    A(seg(t, 4.9, 5.5), () => {
      ctx.fillStyle = C.panel; k.rrect(560, 590, 230, 120, 18); ctx.fill();
      font(500, 20); text('first estimate', 675, 616, { color: C.soft, align: 'center' });
      font(800, 64, SERIF); text(r1(FIRST), 675, 670, { color: C.blue, align: 'center' });
      const g = eio(seg(t, 6.2, 6.9));
      ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(612, 690); ctx.lineTo(lerp(612, 738, g), lerp(690, 648, g)); ctx.stroke();
    });
  });
}

// ---------- B: moment, elastic rebound, sideways slip ----------
function moment(t) {
  const a = span(t, 9.2, 13.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 28); text('seismic moment =', W / 2, 150, { color: C.soft, align: 'center' });
    const items = [
      { x: 160, label: 'rigidity', sub: 'how stiff the rock is' },
      { x: 432, label: 'area', sub: 'of fault that slipped' },
      { x: 704, label: 'slip', sub: 'how far it moved' },
    ];
    items.forEach((it, i) => {
      const g = eout(seg(t, 9.6 + i * 0.6, 10.3 + i * 0.6));
      A(g, () => {
        const cy = 360;
        if (i === 0) { // a block of rock with hatching
          ctx.fillStyle = C.rock2; k.rrect(it.x - 80, cy - 70, 160, 140, 10); ctx.fill();
          ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
          for (let j = -60; j < 80; j += 22) { ctx.beginPath(); ctx.moveTo(it.x - 80 + Math.max(0, j), cy - 70 + Math.max(0, -j)); ctx.lineTo(it.x - 80 + Math.min(160, j + 140), cy - 70 + Math.min(140, 140 - j)); ctx.stroke(); }
        } else if (i === 1) { // a fault plane in perspective
          ctx.fillStyle = C.redSoft; ctx.strokeStyle = C.red; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(it.x - 95, cy + 50); ctx.lineTo(it.x + 55, cy + 50); ctx.lineTo(it.x + 95, cy - 50); ctx.lineTo(it.x - 55, cy - 50); ctx.closePath(); ctx.fill(); ctx.stroke();
          font(500, 20); text('length × depth', it.x, cy + 76, { color: C.red, align: 'center' });
        } else { // a slip arrow
          ctx.strokeStyle = C.blue; ctx.fillStyle = C.blue; ctx.lineWidth = 10; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(it.x - 70, cy); ctx.lineTo(it.x + 50, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(it.x + 82, cy); ctx.lineTo(it.x + 40, cy - 28); ctx.lineTo(it.x + 40, cy + 28); ctx.closePath(); ctx.fill();
        }
        font(700, 34); text(it.label, it.x, 490, { color: C.ink, align: 'center' });
        font(400, 22); text(it.sub, it.x, 530, { color: C.soft, align: 'center' });
        if (i < 2) { font(500, 44); text('×', it.x + 136, 360, { color: C.soft, align: 'center' }); }
      });
    });
    A(seg(t, 11.6, 12.2), () => {
      font(500, 24);
      const head = `Panama, 9 October: ${(M0 / 1e20).toFixed(2)} × 10`, tail = ` newton-metres, magnitude ${MW.toFixed(2)}`;
      const w1 = ctx.measureText(head).width, w2 = ctx.measureText(tail).width;
      font(500, 15); const w3 = ctx.measureText('20').width;
      const x0 = W / 2 - (w1 + w2 + w3) / 2;
      font(500, 24); text(head, x0, 640, { color: C.ink }); text(tail, x0 + w1 + w3, 640, { color: C.ink });
      font(500, 15); text('20', x0 + w1, 628, { color: C.ink });
      font(400, 20); text('US Geological Survey, rounded to 7.7', W / 2, 680, { color: C.soft, align: 'center' });
    });
  });
}
/** Map view of a fault running across the picture, with a road crossing it. strain: how far the far-off rock has
 *  moved while the fault stays locked (0–1); snap: how far the fault has caught up (0–1). Left-lateral: the north
 *  side goes west (left), the south side east. */
function faultView(t, { strain, snap, labels }) {
  const fy = 420, L = 70, R = 794, top = 200, bot = 640, D = 60;
  ctx.fillStyle = C.rock; ctx.fillRect(L, top, R - L, fy - top);
  ctx.fillStyle = C.rock2; ctx.fillRect(L, fy, R - L, bot - fy);
  ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([16, 10]);
  ctx.beginPath(); ctx.moveTo(L, fy); ctx.lineTo(R, fy); ctx.stroke(); ctx.setLineDash([]);
  font(600, 20); text('fault', R - 10, fy - 18, { color: C.red, align: 'right' });
  font(600, 20); text('north', L + 12, top + 22, { color: C.soft, align: 'left' }); text('south', L + 12, bot - 22, { color: C.soft, align: 'left' });
  const cx = W / 2;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 14; ctx.lineCap = 'butt';
  for (const side of [-1, 1]) { // -1: the north block, moving west
    ctx.beginPath();
    const y0 = side < 0 ? top : fy, y1 = side < 0 ? fy : bot;
    for (let y = y0; y <= y1; y += 4) {
      const d = side < 0 ? (fy - y) / (fy - top) : (y - fy) / (bot - fy); // 0 at the fault, 1 far away
      const shape = Math.sin((d * Math.PI) / 2);
      const x = cx + side * D * (strain * shape * (1 - snap) + snap);
      y === y0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  if (labels) {
    ctx.strokeStyle = C.blue; ctx.fillStyle = C.blue; ctx.lineWidth = 7; ctx.lineCap = 'round';
    const arrow = (x0, x1, y) => {
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      const d = Math.sign(x1 - x0);
      ctx.beginPath(); ctx.moveTo(x1 + d * 18, y); ctx.lineTo(x1 - d * 6, y - 16); ctx.lineTo(x1 - d * 6, y + 16); ctx.closePath(); ctx.fill();
    };
    arrow(300, 160, 330); arrow(564, 704, 520);
  }
}
function rebound(t) {
  const a = span(t, 13.8, 23.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const strain = eio(seg(t, 14.0, 16.2)), snap = eio(seg(t, 16.4, 16.8));
    faultView(t, { strain, snap, labels: t > 18.4 });
    font(600, 26); text('seen from above', W / 2, 150, { color: C.soft, align: 'center' });
    if (t < 16.4) A(seg(t, 14.4, 15.0), () => { font(600, 24); text('locked: the rock bends', W / 2, 680, { color: C.ink, align: 'center' }); });
    else if (t < 18.4) A(seg(t, 16.5, 16.9), () => {
      font(700, 30); text('snap!', W / 2, 680, { color: C.red, align: 'center' });
      // a burst at the fault
      ctx.strokeStyle = C.red; ctx.lineWidth = 3;
      const g = seg(t, 16.4, 17.4);
      for (let i = 0; i < 3; i++) { ctx.globalAlpha = Math.max(0, 1 - g) * (1 - i * 0.25); ctx.beginPath(); ctx.ellipse(W / 2, 420, 30 + 220 * g + i * 30, 12 + 90 * g + i * 12, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 1;
    });
    else A(seg(t, 18.6, 19.2), () => {
      font(600, 22);
      text('north side moved west', 90, 290, { color: C.blue, align: 'left' });
      text('south side moved east', 774, 565, { color: C.blue, align: 'right' });
      font(700, 26); text('left-lateral strike-slip', W / 2, 690, { color: C.ink, align: 'center' });
    });
  });
}

// ---------- C: the scale ----------
/** A block of n squares of side s, cols wide, from (x, y); `lit` of them filled. */
function squares(x, y, n, cols, s, color, lit = n, gap = 3) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i < lit ? color : 'rgba(29,40,48,0.07)';
    ctx.fillRect(x + (i % cols) * (s + gap), y + Math.floor(i / cols) * (s + gap), s, s);
  }
}
function step32(t) {
  const a = span(t, 23.0, 27.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('energy released, one square = one unit', W / 2, 150, { color: C.soft, align: 'center' });
    const s = 34;
    // magnitude 6.7: one square
    A(eout(seg(t, 23.3, 23.8)), () => {
      font(800, 56, SERIF); text('6.7', 190, 300, { color: C.blue, align: 'center' });
      squares(173, 360, 1, 1, s, C.blue);
      font(500, 22); text('1', 190, 430, { color: C.soft, align: 'center' });
    });
    A(eout(seg(t, 23.9, 24.4)), () => {
      ctx.strokeStyle = C.soft; ctx.fillStyle = C.soft; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(290, 377); ctx.lineTo(360, 377); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(374, 377); ctx.lineTo(356, 365); ctx.lineTo(356, 389); ctx.closePath(); ctx.fill();
      font(800, 56, SERIF); text('7.7', 590, 230, { color: C.red, align: 'center' });
    });
    const lit = Math.round(32 * eio(seg(t, 24.2, 26.0)));
    squares(590 - (8 * (s + 3)) / 2, 280, 32, 8, s, C.red, lit);
    font(700, 30); text(`${lit} ×`, 590, 450 + 0 * s, { color: C.red, align: 'center' });
    A(seg(t, 26.0, 26.5), () => { font(400, 22); text(`exactly 10^1.5 = ${STEP.toFixed(1)}`, 590, 495, { color: C.soft, align: 'center' }); });
  });
}
function swing(t) {
  const a = span(t, 27.6, 32.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('the same seismograph, the same distance', W / 2, 150, { color: C.soft, align: 'center' });
    const p = eio(seg(t, 27.8, 30.0));
    font(800, 44, SERIF); text('6.7', 92, 300, { color: C.blue, align: 'center' });
    trace(150, 800, 300, { upTo: p, u0: 2, amp: 9, seed: 2, color: C.blue, width: 2 });
    font(800, 44, SERIF); text('7.7', 92, 540, { color: C.red, align: 'center' });
    trace(150, 800, 540, { upTo: p, u0: 2, amp: 90, seed: 2, color: C.red, width: 2 });
    A(seg(t, 30.0, 30.6), () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      const x = 770;
      ctx.beginPath(); ctx.moveTo(x, 540 - 90); ctx.lineTo(x, 540 + 90); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 8, 450); ctx.lineTo(x + 8, 450); ctx.moveTo(x - 8, 630); ctx.lineTo(x + 8, 630); ctx.stroke();
      font(700, 28); text('10 ×', x - 16, 680, { color: C.ink, align: 'center' });
    });
  });
}
function thousand(t) {
  const a = span(t, 32.2, 36.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const n = 32 * 32, s = 11, g = 1.5, cols = 32;
    const x0 = W / 2 - (cols * (s + g)) / 2, y0 = 200;
    const lit = Math.round(n * eio(seg(t, 32.6, 35.0)));
    squares(x0, y0, n, cols, s, C.red, lit, g);
    ctx.fillStyle = C.blue; ctx.fillRect(x0, y0, s, s);
    font(700, 32); text(`${lit.toLocaleString('en-US')} units`, W / 2, 640, { color: C.red, align: 'center' });
    font(500, 22);
    text('6.7 = 1 blue square', x0, 170, { color: C.blue, align: 'left' });
    text('8.7 = all of them', x0 + cols * (s + g), 170, { color: C.red, align: 'right' });
  });
}
function firstGuess(t) {
  const a = span(t, 36.8, 41.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('energy, as the area of a square', W / 2, 150, { color: C.soft, align: 'center' });
    const base = 210, side8 = base * Math.sqrt(VS_FIRST) * eio(seg(t, 37.6, 39.0)) + base * (1 - eio(seg(t, 37.6, 39.0)));
    const y = 640;
    ctx.fillStyle = C.red; ctx.fillRect(130, y - base, base, base);
    font(800, 56, SERIF); text(r1(MAG), 130 + base / 2, y - base / 2, { color: C.paper, align: 'center' });
    ctx.fillStyle = C.blueSoft; ctx.fillRect(400, y - side8, side8, side8);
    ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.strokeRect(400, y - side8, side8, side8);
    font(800, 56, SERIF); text(r1(FIRST), 400 + side8 / 2, y - side8 / 2, { color: C.blue, align: 'center' });
    A(seg(t, 39.0, 39.5), () => { font(700, 30); text(`× ${VS_FIRST.toFixed(1)}`, 400 + side8 / 2, y + 36, { color: C.blue, align: 'center' }); });
  });
}
function aftershock(t) {
  const a = span(t, 41.4, 46.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('energy, one square = the 6.6 quake', W / 2, 150, { color: C.soft, align: 'center' });
    const n = Math.round(VS_AFTER), cols = 9, s = 46, g = 5;
    const x0 = W / 2 - (cols * (s + g)) / 2, y0 = 230;
    const lit = Math.round(n * eio(seg(t, 41.8, 43.8)));
    squares(x0, y0, n, cols, s, C.red, lit, g);
    ctx.fillStyle = C.blue; ctx.fillRect(x0, y0, s, s);
    font(700, 30); text(`7.7 ≈ ${lit} of them`, W / 2, 560, { color: C.red, align: 'center' });
    font(400, 22); text('the 6.6 struck about 75 km to the west, 2.5 hours later', W / 2, 610, { color: C.soft, align: 'center' });
  });
}

// ---------- D: how a fault adds a step ----------
function bigger(t) {
  const a = span(t, 46.0, 50.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('one step = 32 times the moment, for example:', W / 2, 150, { color: C.soft, align: 'center' });
    const g = eio(seg(t, 46.6, 48.4));
    const w0 = 70, h0 = 36, x = 110, y = 560;
    const w = lerp(w0, w0 * 4, g), h = lerp(h0, h0 * 4, g);
    ctx.fillStyle = C.redSoft; ctx.strokeStyle = C.red; ctx.lineWidth = 3;
    ctx.fillRect(x, y - h, w, h); ctx.strokeRect(x, y - h, w, h);
    ctx.fillStyle = C.red; ctx.fillRect(x, y - h0, w0, h0);
    font(500, 22);
    text(g > 0.95 ? '4 × longer, 4 × deeper' : 'a fault patch', x, y + 30, { color: C.red, align: 'left' });
    // slip arrows
    const sx = 540, sl = lerp(80, 160, eio(seg(t, 48.0, 49.2)));
    ctx.strokeStyle = C.blue; ctx.fillStyle = C.blue; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, 420); ctx.lineTo(sx + sl, 420); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx + sl + 26, 420); ctx.lineTo(sx + sl - 4, 398); ctx.lineTo(sx + sl - 4, 442); ctx.closePath(); ctx.fill();
    font(500, 22); text(sl > 150 ? '2 × the slip' : 'slip', sx, 470, { color: C.blue, align: 'left' });
    A(seg(t, 49.0, 49.6), () => { font(700, 34); text('4 × 4 × 2 = 32', W / 2, 650, { color: C.ink, align: 'center' }); });
  });
}

// ---------- E: Panama's plates, earlier quakes ----------
function plates(t) {
  const a = span(t, 50.6, 55.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('schematic, not to scale', W / 2, 140, { color: C.soft, align: 'center' });
    // the microplate as a band across the middle
    const g = eout(seg(t, 50.8, 51.6));
    ctx.fillStyle = 'rgba(168,116,28,0.30)'; ctx.strokeStyle = C.ochre; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(150, 430); ctx.bezierCurveTo(300, 360, 520, 400, 720, 340); ctx.lineTo(740, 430); ctx.bezierCurveTo(540, 500, 320, 470, 170, 520); ctx.closePath(); ctx.fill(); ctx.stroke();
    font(700, 26); text('Panama microplate', 440, 440, { color: C.ink, align: 'center' });
    const lab = (s, x, y, d) => A(eout(seg(t, 51.2 + d, 51.8 + d)), () => { font(700, 26); text(s, x, y, { color: C.blue, align: 'center' }); });
    lab('Caribbean plate', 330, 260, 0); lab('South American plate', 700, 230, 0.3);
    lab('Cocos plate', 230, 640, 0.6); lab('Nazca plate', 600, 640, 0.9);
    // arrows pushing in
    A(seg(t, 52.4, 53.0), () => {
      ctx.strokeStyle = C.faint; ctx.fillStyle = C.faint; ctx.lineWidth = 6;
      for (const [x0, y0, x1, y1] of [[330, 290, 340, 360], [230, 610, 250, 520], [600, 610, 590, 500]]) {
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
      // the quake
      const sx = 500, sy = 470;
      ctx.fillStyle = C.red; ctx.beginPath();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 22, an = -Math.PI / 2 + (i * Math.PI) / 5; ctx.lineTo(sx + r * Math.cos(an), sy + r * Math.sin(an)); }
      ctx.closePath(); ctx.fill();
      font(600, 22); text('9 Oct 2026', sx + 32, sy + 30, { color: C.red, align: 'left' });
    });
  });
}
function history(t) {
  const a = span(t, 55.2, 59.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('big quakes in the broader area, energy as area', W / 2, 150, { color: C.soft, align: 'center' });
    const L = 120, R = 744, y = 600;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
    PAST.forEach(([yr, m], i) => {
      const x = lerp(L + 60, R - 60, (yr - 1934) / (2026 - 1934));
      const g = eout(seg(t, 55.5 + i * 0.6, 56.1 + i * 0.6));
      const side = 150 * Math.sqrt(energy(m, MAG)) * g;
      A(g, () => {
        ctx.fillStyle = yr === 2026 ? C.red : C.blueSoft; ctx.strokeStyle = yr === 2026 ? C.red : C.blue; ctx.lineWidth = 3;
        ctx.fillRect(x - side / 2, y - 30 - side, side, side); ctx.strokeRect(x - side / 2, y - 30 - side, side, side);
        font(800, 40, SERIF); text(r1(m), x, y - 70 - side, { color: yr === 2026 ? C.red : C.blue, align: 'center' });
        font(600, 26); text(String(yr), x, y + 34, { color: C.ink, align: 'center' });
      });
    });
  });
}

// ---------- F: shaking ----------
function shaking(t) {
  const a = eout(seg(t, 59.8, 60.5));
  if (a <= 0) return;
  A(a, () => {
    const cx = 180, cy = 420;
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.9 + i / 6) % 1, r = 20 + ph * 560;
      ctx.strokeStyle = `rgba(184,58,38,${0.55 * (1 - ph)})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx, cy, r, -0.7, 0.7); ctx.stroke();
    }
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
    font(600, 22); text('source', cx, cy + 40, { color: C.red, align: 'center' });
    // two houses at the same distance, one on rock, one on mud
    const house = (x, y, shake, ground, label) => {
      ctx.fillStyle = ground; ctx.fillRect(x - 70, y + 30, 140, 40);
      const dx = Math.sin(t * 40) * shake;
      ctx.fillStyle = C.ink;
      ctx.fillRect(x - 30 + dx, y - 20, 60, 50);
      ctx.beginPath(); ctx.moveTo(x - 40 + dx * 1.3, y - 20); ctx.lineTo(x + dx * 1.6, y - 56); ctx.lineTo(x + 40 + dx * 1.3, y - 20); ctx.closePath(); ctx.fill();
      font(500, 22); text(label, x, y + 100, { color: C.soft, align: 'center' });
    };
    A(seg(t, 60.6, 61.2), () => {
      house(640, 290, 1.2, C.rock2, 'on bedrock');
      house(640, 560, 6, '#8a6d45', 'on soft mud');
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.4, fonts: [SANS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    hook(t);
    moment(t);
    rebound(t);
    step32(t);
    swing(t);
    thousand(t);
    firstGuess(t);
    aftershock(t);
    bigger(t);
    plates(t);
    history(t);
    shaking(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 40, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.red, '~': C.blue } });
  },
});
