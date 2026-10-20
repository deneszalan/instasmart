// Explainer for physics-pitch-drop-experiment: a funnel of pitch that has dripped nine times since 1927.
// Look: a minimal museum label. Near-black, grained background under a soft overhead light; paper-white
// thin Archivo type, left-aligned like a gallery label under a hairline; lots of empty space and a slow
// pace. The only colour is the pitch itself: a glossy amber-black drop (and the same amber for key words).
//
// Source: Wikipedia, "Pitch drop experiment" (the post's source). Facts used:
//   started 1927 by Thomas Parnell, University of Queensland; pitch looks solid but is a highly viscous
//   liquid that flows very slowly; stem cut October 1930; the drop dates in the article's table
//   (Dec 1938, Feb 1947, Apr 1954, May 1962, Aug 1970, Apr 1979, Jul 1988, Nov 2000, Apr 2014) and its
//   years per drop (8.1, 8.2, 7.2, 8.1, 8.3, 8.7, 9.2, 12.3, 13.4); the 10th drop is still forming;
//   after the 7th drop (1988) air conditioning was added and the typical interval grew from eight years
//   to 12–13 years; the 7th drop fell about 4:45 p.m. on 3 July 1988 and "apparently no one witnessed
//   the drop fall itself" because the custodian, John Mainstone, had stepped out for a drink; technical
//   problems stopped the webcam recording the 8th drop, 28 November 2000.
//
// Layout: the app overlays a control bar at the bottom and the slide counter top right, so the caption
// block starts at y = 800 (three lines end above 930) and the corner x > 740, y < 120 stays empty.
//
// Scene plan (seconds):
//   A  0.0–9.8   Hook. The vitrine today: bell jar, funnel of pitch, nine drops in the beaker, the tenth
//                hanging and slowly swelling.
//                "An experiment started in 1927 is still running." / "It has dripped only nine times."
//   B  9.4–20.8  Back to 1930: an empty beaker. Labels name pitch, stem and beaker. A year counter runs
//                from the stem cut (Oct 1930) to Dec 1938 while the first drop stretches, necks and falls.
//                "Pitch looks solid, but it is a liquid that flows very slowly."
//                "In 1930 the stem was cut. The first drop fell in 1938."
//   C 20.4–30.2  A timeline 1927–2026. A playhead sweeps; each drop falls onto its date as a dot; a counter
//                reaches nine; a hollow ring marks the tenth, still forming.
//                "Each dot is one drop, placed on the year it fell." / "Nine so far. The last fell in April 2014."
//   D 30.2–39.6  The gaps: arcs between drops, height = years (from the source's table); the last two are
//                taller, under a bracket for the air conditioning.
//                "At first, a drop fell about every eight years…"
//                "…then air conditioning cooled the room, and the gaps grew to 12–13 years."
//   E 39.6–49.8  Missed: a museum card for each of the 7th and 8th drops, pinned to their dots.
//                "1988: the seventh fell while the custodian had stepped out for a drink."
//                "2000: the eighth fell, but the webcam failed to record it."
//   F 49.8–54.5  The vitrine again, the tenth drop hanging. "The tenth drop is still forming."
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const TAU = Math.PI * 2;
const easeIn = (x) => x * x;

const C = {
  paper: '#ECE8DF', soft: 'rgba(236,232,223,0.6)', faint: 'rgba(236,232,223,0.3)', hair: 'rgba(236,232,223,0.2)',
  glass: 'rgba(236,232,223,0.3)', amber: '#E09A3E', ink: '#151412',
};
const SANS = 'Archivo';

// ---------- the record, from the source's table ----------
// NOW is when this animation was made (October 2026): the right end of the timeline.
const POURED = 1927, CUT = 1930 + 9.5 / 12, NOW = 2026 + 9.5 / 12;
const DROPS = [
  // [year, month (1–12), years since the previous drop or the stem cut]
  [1938, 12, 8.1], [1947, 2, 8.2], [1954, 4, 7.2], [1962, 5, 8.1], [1970, 8, 8.3],
  [1979, 4, 8.7], [1988, 7, 9.2], [2000, 11, 12.3], [2014, 4, 13.4],
].map(([year, month, gap], i) => ({ n: i + 1, year, at: year + (month - 0.5) / 12, gap }));

// ---------- timeline ----------
const CUES = [
  [0.6, 4.8, 'An experiment started in *1927* is still running.'],
  [5.0, 9.4, 'It has dripped only *nine times*.'],
  [9.8, 14.6, 'Pitch looks solid, but it is a liquid that flows *very slowly*.'],
  [14.8, 20.2, `In *1930* the stem was cut. The first drop fell in *${DROPS[0].year}*.`],
  [20.8, 25.2, 'Each dot is one drop, placed on the year it fell.'],
  [25.4, 30.0, `*${['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'][DROPS.length]}* so far. The last fell in *April ${DROPS.at(-1).year}*.`],
  [30.4, 34.4, 'At first, a drop fell about every *eight years*…'],
  [34.6, 39.6, '…then air conditioning cooled the room, and the gaps grew to *12–13 years*.'],
  [39.9, 45.1, '1988: the seventh fell while the custodian had *stepped out* for a drink.'],
  [45.3, 49.8, '2000: the eighth fell, but the webcam *failed to record it*.'],
  [50.2, 54.4, 'The *tenth drop* is still forming.'],
];
const SECTIONS = [
  [0, 9.8, 'University of Queensland · Brisbane'],
  [9.6, 20.8, 'The funnel'],
  [20.6, 30.4, 'The drops'],
  [30.2, 39.8, 'The gaps'],
  [39.6, 50.0, 'Missed'],
  [49.8, 54.5, 'Pitch drop experiment · since 1927'],
];

// ---------- drawing tools ----------
let k, ctx;
const font = (weight, size) => k.font(weight, size, SANS);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.paper, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);
const label = (s, x, y, opts = {}) => { font(500, 22); text(s.toUpperCase(), x, y, { color: C.soft, spacing: '3px', ...opts }); };
const line = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
const circle = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); };

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- background: near-black under a soft overhead light, with fine grain ----------
let room = null;
function buildRoom() {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#090908'; g.fillRect(0, 0, W, H);
  const light = g.createRadialGradient(560, 180, 20, 520, 380, 760);
  light.addColorStop(0, '#22211E'); light.addColorStop(0.45, '#131311'); light.addColorStop(1, '#070706');
  g.fillStyle = light; g.fillRect(0, 0, W, H);
  const img = g.getImageData(0, 0, W, H), d = img.data, rnd = mulberry32(1927);
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(img, 0, 0);
  return c;
}
function background() {
  if (!room) room = buildRoom();
  ctx.drawImage(room, 0, 0);
  font(600, 22); text('RECKON', 72, 72, { color: C.paper, spacing: '6px' });
  font(400, 22); text('PHYSICS', 218, 72, { color: C.faint, spacing: '3px' });
}

// ---------- the label block at the bottom ----------
const LBL = { x: 72, rule: 758, cap: 800, maxW: 720, size: 42, lh: 54 };
function richLeft(s, x, y, { maxW, size, lh, weight, ink, marks }) {
  font(weight, size);
  let mode = null;
  const toks = [];
  for (const raw of s.split(' ')) {
    let w = raw;
    if (!mode && marks[w[0]]) { mode = w[0]; w = w.slice(1); }
    const color = mode ? marks[mode] : ink;
    let tail = '';
    if (mode) {
      const at = w.lastIndexOf(mode);
      if (at >= 0) { tail = w.slice(at + 1); w = w.slice(0, at); toks.push({ w, color, tail }); mode = null; continue; }
    }
    toks.push({ w, color, tail });
  }
  const space = ctx.measureText(' ').width, width = (tk) => ctx.measureText(tk.w + tk.tail).width;
  const lines = [[]];
  let lw = 0;
  for (const tk of toks) {
    if (lw + width(tk) > maxW && lines.at(-1).length) { lines.push([]); lw = 0; }
    lines.at(-1).push(tk); lw += width(tk) + space;
  }
  lines.forEach((ln, i) => {
    let cx = x;
    for (const tk of ln) {
      text(tk.w, cx, y + i * lh, { color: tk.color, base: 'middle' });
      cx += ctx.measureText(tk.w).width;
      if (tk.tail) { text(tk.tail, cx, y + i * lh, { color: ink, base: 'middle' }); cx += ctx.measureText(tk.tail).width; }
      cx += space;
    }
  });
}
function labelBlock(t) {
  ctx.fillStyle = C.hair; ctx.fillRect(LBL.x, LBL.rule, W - 2 * LBL.x, 1);
  ctx.fillStyle = C.amber; circle(LBL.x + 3, LBL.rule + 0.5, 3); ctx.fill();
  for (const [a, b, s] of SECTIONS) withAlpha(span(t, a, b, 0.5, 0.4), () => label(s, LBL.x + 18, LBL.rule - 16));
  for (const [a, b, s] of CUES) {
    if (t < a || t > b) continue;
    const rise = (1 - eout(seg(t, a, a + 0.7))) * 12;
    withAlpha(span(t, a, b, 0.5, 0.4), () => richLeft(s, LBL.x, LBL.cap + rise, { maxW: LBL.maxW, size: LBL.size, lh: LBL.lh, weight: 300, ink: C.paper, marks: { '*': C.amber, '~': '#FFFFFF' } }));
  }
}

// ---------- pitch ----------
/** The glossy amber-black fill: black body, amber where it is thin at the edge, lit from above left. */
function pitchFill(x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r * 1.12);
  g.addColorStop(0, '#3B200A'); g.addColorStop(0.45, '#160B04'); g.addColorStop(0.78, '#0B0603');
  g.addColorStop(0.93, '#4A260A'); g.addColorStop(1, '#C27A26');
  return g;
}
function specular(x, y, r, a = 0.75) {
  ctx.save(); ctx.translate(x - r * 0.38, y - r * 0.42); ctx.rotate(-0.6);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.3);
  g.addColorStop(0, `rgba(255,246,228,${a})`); g.addColorStop(1, 'rgba(255,246,228,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.3, r * 0.17, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function pitchDot(x, y, r, sy = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1 / Math.sqrt(sy), sy);
  const glow = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 2.6);
  glow.addColorStop(0, 'rgba(224,154,62,0.22)'); glow.addColorStop(1, 'rgba(224,154,62,0)');
  ctx.fillStyle = glow; circle(0, 0, r * 2.6); ctx.fill();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.05, 0, 0, r * 1.05);
  g.addColorStop(0, '#5A3210'); g.addColorStop(0.5, '#1A0D04'); g.addColorStop(0.8, '#3A1D07'); g.addColorStop(1, '#E09A3E');
  ctx.fillStyle = g; circle(0, 0, r); ctx.fill();
  specular(0, 0, r, 0.8);
  ctx.restore();
}

// ---------- the vitrine ----------
const V = { x: 560, tip: 448, sh: 8, rMax: 25, neck: 70, beakerTop: 584, beakerBot: 688 };
function vitrine() {
  ctx.lineWidth = 1.5; ctx.strokeStyle = C.glass; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // plinth
  ctx.fillStyle = '#1B1A18'; ctx.fillRect(380, 690, 360, 16);
  ctx.fillStyle = 'rgba(236,232,223,0.25)'; ctx.fillRect(380, 690, 360, 1);
  // bell jar
  ctx.beginPath(); ctx.moveTo(408, 690); ctx.lineTo(408, 268);
  ctx.bezierCurveTo(408, 168, 712, 168, 712, 268); ctx.lineTo(712, 690); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(560, 152, 18, 8, 0, 0, TAU); ctx.stroke();
  line(560, 160, 560, 194);
  const gl = ctx.createLinearGradient(420, 0, 452, 0);
  gl.addColorStop(0, 'rgba(236,232,223,0)'); gl.addColorStop(0.5, 'rgba(236,232,223,0.07)'); gl.addColorStop(1, 'rgba(236,232,223,0)');
  ctx.fillStyle = gl; ctx.fillRect(420, 280, 32, 390);
  // stand
  ctx.strokeStyle = 'rgba(236,232,223,0.22)';
  line(470, 262, 444, 690); line(650, 262, 676, 690);
  ctx.beginPath(); ctx.ellipse(560, 262, 98, 9, 0, 0, TAU); ctx.stroke();
  // funnel: pitch inside, glass outline
  ctx.beginPath();
  ctx.moveTo(462, 262); ctx.quadraticCurveTo(560, 272, 658, 262);
  ctx.lineTo(V.x + V.sh, 400); ctx.lineTo(V.x + V.sh, V.tip); ctx.lineTo(V.x - V.sh, V.tip); ctx.lineTo(V.x - V.sh, 400); ctx.closePath();
  const pg = ctx.createLinearGradient(462, 0, 658, 0);
  pg.addColorStop(0, '#6A3A12'); pg.addColorStop(0.08, '#120A04'); pg.addColorStop(0.55, '#0A0603'); pg.addColorStop(0.92, '#1B0E05'); pg.addColorStop(1, '#8A4E18');
  ctx.fillStyle = pg; ctx.fill();
  ctx.strokeStyle = 'rgba(224,154,62,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(470, 264); ctx.quadraticCurveTo(560, 273, 650, 264); ctx.stroke();
  ctx.strokeStyle = C.glass; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(452, 256); ctx.lineTo(V.x - V.sh - 2, 400); ctx.lineTo(V.x - V.sh - 2, V.tip); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(668, 256); ctx.lineTo(V.x + V.sh + 2, 400); ctx.lineTo(V.x + V.sh + 2, V.tip); ctx.stroke();
  // beaker
  ctx.beginPath(); ctx.moveTo(500, V.beakerTop - 4); ctx.lineTo(506, V.beakerTop); ctx.lineTo(506, V.beakerBot);
  ctx.lineTo(614, V.beakerBot); ctx.lineTo(614, V.beakerTop); ctx.lineTo(620, V.beakerTop - 4); ctx.stroke();
}

/** Earlier drops heaped in the beaker; n can be fractional while a drop merges. */
function pile(n) {
  if (n <= 0) return;
  const h = 5 + 4.4 * n, x0 = 508, x1 = 612, y = V.beakerBot - 1;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0, y - h * 0.55);
  ctx.bezierCurveTo(x0 + 10, y - h * 1.02, 548, y - h * 1.1, 560, y - h);
  ctx.bezierCurveTo(574, y - h * 0.9, x1 - 8, y - h * 1.05, x1, y - h * 0.6);
  ctx.lineTo(x1, y); ctx.closePath();
  ctx.fillStyle = pitchFill(548, y - h * 0.3, Math.max(70, h * 1.6)); ctx.fill();
  ctx.strokeStyle = 'rgba(224,154,62,0.22)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x0 + 4, y - h * 0.62); ctx.bezierCurveTo(x0 + 12, y - h * 0.98, 548, y - h * 1.06, 560, y - h + 1); ctx.stroke();
}

/** The drop hanging from the stem: p from 0 (a rounded tip) to 1 (stretched, about to let go). */
function hangingDrop(p, a = 1) {
  const { x, tip, sh } = V;
  const { r, yc } = hangingDropGeometry(p);
  const neck = V.neck * Math.pow(p, 2.2), nw = lerp(sh, 2.6, Math.pow(p, 1.7)), yN = tip + neck;
  withAlpha(a, () => {
    // the neck: dark in the middle, brown at the edges, flaring into the bulb
    ctx.beginPath();
    ctx.moveTo(x - sh, tip - 2);
    ctx.bezierCurveTo(x - sh, tip + neck * 0.4, x - nw, yN - neck * 0.3, x - nw, yN);
    ctx.bezierCurveTo(x - nw, yN + r * 0.25, x - r * 0.9, yc - r * 0.7, x - r * 0.9, yc);
    ctx.lineTo(x + r * 0.9, yc);
    ctx.bezierCurveTo(x + r * 0.9, yc - r * 0.7, x + nw, yN + r * 0.25, x + nw, yN);
    ctx.bezierCurveTo(x + nw, yN - neck * 0.3, x + sh, tip + neck * 0.4, x + sh, tip - 2);
    ctx.closePath();
    const ng = ctx.createLinearGradient(x - sh * 1.3, 0, x + sh * 1.3, 0);
    ng.addColorStop(0, '#6A3A12'); ng.addColorStop(0.3, '#150B04'); ng.addColorStop(0.5, '#0A0603'); ng.addColorStop(0.7, '#150B04'); ng.addColorStop(1, '#6A3A12');
    ctx.fillStyle = ng; ctx.fill();
    // the bulb
    ctx.beginPath(); ctx.ellipse(x, yc, r, r * 1.06, 0, 0, TAU);
    ctx.fillStyle = pitchFill(x, yc, r); ctx.fill();
    specular(x, yc, r);
  });
  return { yc, r };
}
const DROP_END = hangingDropGeometry(1);
function hangingDropGeometry(p) {
  const r = lerp(V.sh, V.rMax, eout(clamp(p / 0.8)));
  return { r, yc: V.tip + V.neck * Math.pow(p, 2.2) + r * 0.62 };
}

/** One drop's whole life, starting at time a: grows until b, falls, merges into the pile. Returns drops landed. */
function dropCycle(t, a, b, before) {
  const fall = 0.5;
  if (t < b) { hangingDrop(eio(seg(t, a, b))); pile(before); return before; }
  // the stem recovers a small rounded tip; the drop falls and merges
  hangingDrop(0.06 * seg(t, b, b + 1.5));
  const f = seg(t, b, b + fall);
  const landY = V.beakerBot - 6 - 4.4 * before - V.rMax * 0.6;
  const y = lerp(DROP_END.yc, landY, easeIn(f));
  const merge = seg(t, b + fall, b + fall + 0.7);
  pile(before + eout(merge));
  if (merge < 1) {
    withAlpha(1 - merge, () => {
      const sy = f < 1 ? 1 + 0.12 * f : 1 - 0.45 * eout(merge);
      ctx.save(); ctx.translate(V.x, y + V.rMax * 0.5 * (1 - sy)); ctx.scale(1 / Math.sqrt(sy), sy);
      ctx.fillStyle = pitchFill(0, 0, V.rMax); circle(0, 0, V.rMax); ctx.fill(); specular(0, 0, V.rMax);
      ctx.restore();
    });
  }
  return before + merge;
}

// ---------- A and B: the vitrine, today and in 1930 ----------
function sceneAB(t) {
  vitrine();
  const x = seg(t, 9.4, 10.4);
  // today: nine drops in the beaker, the tenth hanging and slowly swelling
  withAlpha(1 - x, () => { pile(DROPS.length); hangingDrop(lerp(0.5, 0.58, seg(t, 0, 10))); });
  // 1930 onwards: the first drop
  withAlpha(x, () => dropCycle(t, 15.2, 19.0, 0));

  // parts of the experiment
  const parts = [['Pitch', 330, 520], ['Stem', 432, V.x - V.sh - 6], ['Beaker', 640, 504]];
  parts.forEach(([s, y, tx], i) => withAlpha(span(t, 10.6 + i * 0.4, 14.6, 0.6, 0.5), () => {
    ctx.strokeStyle = C.hair; ctx.lineWidth = 1; line(250, y, tx, y);
    ctx.fillStyle = C.soft; circle(tx, y, 2.5); ctx.fill();
    label(s, 238, y + 8, { align: 'right' });
  }));

  // the year counter
  const yr = lerp(CUT, DROPS[0].at, eio(seg(t, 15.2, 19.0)));
  withAlpha(span(t, 14.8, 20.8, 0.6, 0.5), () => {
    label('Year', 72, 300);
    font(200, 112); text(String(Math.floor(yr)), 66, 410, { color: C.paper });
    withAlpha(1 - seg(t, 15.2, 15.6), () => { font(400, 24); text('October: stem cut', 72, 452, { color: C.soft }); });
    withAlpha(seg(t, 19.2, 19.6), () => { font(400, 24); text('December: first drop', 72, 452, { color: C.amber }); });
  });
}

// ---------- C, D and E: the timeline ----------
const AX = { y: 520, x0: 96, x1: 768 };
const X = (yr) => AX.x0 + ((yr - POURED) / (NOW - POURED)) * (AX.x1 - AX.x0);
const SWEEP = [21.4, 27.6];
const sweepYear = (t) => lerp(POURED, NOW, eio(seg(t, ...SWEEP)));
// when the playhead reaches each drop (solved once, so the dots land exactly as it passes)
for (const d of DROPS) {
  let lo = SWEEP[0], hi = SWEEP[1];
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (sweepYear(mid) < d.at) lo = mid; else hi = mid; }
  d.land = lo;
}
const ARC_H = 9; // px per year
const arcs = DROPS.map((d, i) => ({ a: i ? DROPS[i - 1].at : CUT, b: d.at, gap: d.gap, start: 30.6 + i * 0.38 }));

function arcPath(a, b, h, f) {
  const xa = X(a), xb = X(b), cx = (xa + xb) / 2, cy = AX.y - 2 * h;
  ctx.beginPath(); ctx.moveTo(xa, AX.y);
  const n = Math.max(2, Math.ceil(28 * f));
  for (let i = 1; i <= n; i++) {
    const s = (f * i) / n, u = 1 - s;
    ctx.lineTo(u * u * xa + 2 * u * s * cx + s * s * xb, u * u * AX.y + 2 * u * s * cy + s * s * AX.y);
  }
  ctx.stroke();
}

function sceneTimeline(t) {
  const dim = lerp(1, 0.35, seg(t, 39.6, 40.4));
  // the axis and its ends
  ctx.fillStyle = C.faint; ctx.fillRect(AX.x0, AX.y, (AX.x1 - AX.x0) * eio(seg(t, 20.6, 21.6)), 1.2);
  const rows = [AX.y + 44, AX.y + 72];
  withAlpha(seg(t, 20.8, 21.4), () => {
    font(400, 22);
    text(String(POURED), X(POURED), rows[0], { color: C.soft, align: 'center' });
    ctx.strokeStyle = C.soft; ctx.lineWidth = 1.2; circle(X(POURED), AX.y, 4); ctx.stroke();
  });
  withAlpha(seg(t, 21.6, 22.0), () => {
    font(400, 22); text(String(Math.floor(CUT)), X(CUT), rows[1], { color: C.soft, align: 'center' });
    ctx.fillStyle = C.soft; ctx.fillRect(X(CUT) - 0.6, AX.y - 8, 1.2, 16);
  });
  withAlpha(seg(t, 27.4, 27.9), () => { font(400, 22); text(String(Math.floor(NOW)), X(NOW), rows[1], { color: C.soft, align: 'center' }); });

  // gaps between drops (scene D), dimmed in E
  withAlpha(dim, () => {
    for (const [i, g] of arcs.entries()) {
      const f = eio(seg(t, g.start, g.start + 0.55));
      if (f <= 0) continue;
      const long = i >= arcs.length - 2, hl = long ? seg(t, 35.0, 35.6) : 0;
      ctx.strokeStyle = long ? `rgba(236,232,223,${0.35 + 0.4 * hl})` : 'rgba(236,232,223,0.35)';
      ctx.lineWidth = 1.2; arcPath(g.a, g.b, g.gap * ARC_H, f);
      withAlpha(seg(t, g.start + 0.35, g.start + 0.7), () => {
        font(400, 22); text(g.gap.toFixed(1), (X(g.a) + X(g.b)) / 2, AX.y - g.gap * ARC_H - 14, { color: hl > 0.5 ? C.amber : C.soft, align: 'center' });
      });
    }
    withAlpha(seg(t, 31.0, 31.6) * (1 - seg(t, 39.4, 39.8)), () => label('Years between drops', 72, 300));
    // air conditioning, added after the seventh drop
    withAlpha(seg(t, 35.6, 36.2), () => {
      const xa = X(DROPS[6].at) + 6, xb = X(NOW), y = AX.y + 104;
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(xa, y - 8); ctx.lineTo(xa, y); ctx.lineTo(xb, y); ctx.lineTo(xb, y - 8); ctx.stroke();
      font(400, 22); text('air conditioning added after 1988', xb, y + 32, { color: C.soft, align: 'right' });
    });
  });

  // the playhead
  withAlpha(span(t, SWEEP[0] - 0.3, SWEEP[1] + 0.6, 0.3, 0.6), () => {
    const yr = sweepYear(t), x = X(yr);
    ctx.fillStyle = C.faint; ctx.fillRect(x - 0.6, AX.y - 150, 1.2, 160);
    font(400, 22); text(String(Math.floor(yr)), x, AX.y - 162, { color: C.soft, align: 'center' });
  });

  // the drops: each falls onto its date as the playhead passes
  let landed = 0;
  DROPS.forEach((d, i) => {
    const f = seg(t, d.land, d.land + 0.45);
    if (f <= 0) return;
    if (f >= 1) landed++;
    const x = X(d.at), y = lerp(AX.y - 70, AX.y, easeIn(f));
    const squash = f < 1 ? 1.25 : 1 - 0.18 * Math.sin(Math.PI * seg(t, d.land + 0.45, d.land + 0.85));
    withAlpha(seg(t, d.land, d.land + 0.15), () => pitchDot(x, y - 10 * (squash - 1), 10, squash));
    withAlpha(seg(t, d.land + 0.4, d.land + 0.8), () => { font(500, 22); text(String(d.year), x, rows[i % 2 === 0 ? 0 : 1], { color: C.paper, align: 'center' }); });
  });
  // the tenth, still forming
  withAlpha(seg(t, 27.8, 28.4), () => {
    const x = X(NOW);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.soft; ctx.lineWidth = 1.2; circle(x, AX.y, 10); ctx.stroke(); ctx.setLineDash([]);
    withAlpha(1 - seg(t, 30.0, 30.5), () => { font(400, 22); text('10th: still forming', x + 10, AX.y - 30, { color: C.soft, align: 'right' }); });
  });
  // in D, the tenth's gap so far: dashed, open-ended
  withAlpha(dim * seg(t, arcs.at(-1).start + 0.4, arcs.at(-1).start + 1.0), () => {
    ctx.setLineDash([3, 5]); ctx.strokeStyle = C.faint; ctx.lineWidth = 1.2;
    arcPath(DROPS.at(-1).at, NOW, (NOW - DROPS.at(-1).at) * ARC_H, 1); ctx.setLineDash([]);
  });
  // drop counter
  withAlpha(span(t, 21.0, 30.4, 0.5, 0.5), () => {
    label('Drops', 72, 196);
    font(200, 112); text(String(landed), 66, 300, { color: C.paper });
  });

  // E: museum cards for the two missed drops
  card(t, DROPS[6], [39.9, 45.1], ['7th drop', '3 July 1988, about 4:45 p.m.', 'Apparently no one saw it fall.']);
  card(t, DROPS[7], [45.3, 49.8], ['8th drop', '28 November 2000', 'The webcam failed to record it.']);
}

function card(t, d, [a, b], [head, when, note]) {
  const p = span(t, a, b, 0.6, 0.5);
  if (p <= 0) return;
  const x = X(d.at), w = 340, h = 128, cx = clamp(x - w / 2, 72, W - 72 - w), cy = 196 - (1 - eout(seg(t, a, a + 0.7))) * 10;
  withAlpha(p, () => {
    ctx.fillStyle = C.paper; ctx.fillRect(x - 0.6, cy + h, 1.2, AX.y - 12 - cy - h);
    ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5; circle(x, AX.y, 13); ctx.stroke();
    ctx.fillStyle = C.paper; ctx.fillRect(cx, cy, w, h);
    font(600, 26); text(head, cx + 22, cy + 42, { color: C.ink });
    font(400, 22); text(when, cx + 22, cy + 76, { color: C.ink });
    text(note, cx + 22, cy + 106, { color: 'rgba(21,20,18,0.72)' });
  });
}

// ---------- F: the tenth drop ----------
function sceneF(t) {
  vitrine();
  pile(DROPS.length);
  hangingDrop(lerp(0.56, 0.62, seg(t, 49.8, 54.5)));
  withAlpha(seg(t, 50.6, 51.4), () => { font(400, 22); text('Source: Wikipedia, “Pitch drop experiment”', 72, 880, { color: C.soft }); });
}

Kit.scene({
  width: W, height: H, duration: 54.5,
  fonts: [{ family: SANS, file: 'Archivo.woff2', weight: '100 900' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    const scenes = [[sceneAB, [0, 20.8], 0.6, 0.6], [sceneTimeline, [20.4, 49.9], 0.4, 0.6], [sceneF, [49.8, 54.5], 0.6, 0]];
    for (const [fn, [a, b], fi, fo] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    labelBlock(t);
  },
});
