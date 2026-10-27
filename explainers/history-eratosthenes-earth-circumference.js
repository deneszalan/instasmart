// Explainer for history-eratosthenes-earth-circumference: a stick's shadow, parallel sunlight and one
// multiplication give the size of the Earth.
// Look: Hellenistic papyrus. Warm fibrous papyrus with seams and mottling, black-figure ink on terracotta
// (meander friezes, a black-ringed Sun, black sticks, a black-and-terracotta band of 50 arcs), Egyptian-blue
// angles, gold sun rays, and compass-and-straightedge construction lines. Cinzel for display, Alegreya Sans
// for captions and labels.
//
// Facts (Wikipedia, "Earth's circumference", History > Eratosthenes, and "Eratosthenes"):
//  - according to Cleomedes, around 240 BC Eratosthenes calculated the Earth's circumference; his book is
//    lost and what survives is Cleomedes' simplified version;
//  - at local noon on the summer solstice the Sun was taken to be directly overhead at Syene (modern Aswan):
//    a gnomon cast no shadow; at Alexandria a gnomon's shadow gave the Sun's angle; according to Cleomedes
//    "about 7.2 degrees, which is 1/50 of a full circle" (equal to the angle at the centre by alternate angles);
//  - the cities were about 5,000 stadia apart, so 50 x 5,000 = 250,000 stadia;
//  - the length of the stadion is debated: with 176.4 m or 184.8 m the result is about 10% or 15% too big;
//    Pliny gives 252,000 stadia, within -2.4% to +0.8% of the real value for a stadion of 155-160 m;
//  - the modern circumference through the poles is 40,007.863 km (used for every percentage below).
// The diagram enlarges the angle (24 degrees instead of 7.2) and the sticks, and says so; in scene D the
// angle shrinks to its true 7.2 degrees so that exactly 50 copies of the arc close the circle.
//
// Scene plan (cue times are computed from the caption list below, so every caption gets
// 0.3 s per word + 1 s):
//  A  hook       title, a compass draws the Earth, Syene and Alexandria marked
//                "Around 240 BC, Eratosthenes worked out the size of the *whole Earth*."
//                "He needed only ~shadows~, a distance and some geometry."
//  B  shadows    two panels: Syene (vertical rays, no shadow), Alexandria (rays 7.2 deg off, a shadow);
//                then a 50-slice circle: 360 / 50 = 7.2
//  C  why        the Earth diagram: parallel rays, sticks at both cities, both extended to the centre;
//                the alternate angles (the "Z") light up
//  D  times 50   the angle shrinks to scale, the Syene-Alexandria arc is stamped round the Earth 50 times
//                while a counter runs to 250,000 stadia
//  E  how close  a km scale: true 40,008 km; 250,000 stadia at 176.4 / 184.8 m (+10% / +15%);
//                Pliny's 252,000 at 155-160 m (-2.4% to +0.8%); the Cleomedes caveat and the source
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2, DEG = Math.PI / 180;

const C = {
  ink: '#22170F', inkSoft: 'rgba(34,23,15,0.70)', inkFaint: 'rgba(34,23,15,0.30)',
  terra: '#B4532A', terraDeep: '#9A3B18', terraLight: '#D97A48',
  blue: '#1F4F9C', blueSoft: 'rgba(31,79,156,0.28)',
  gold: '#C98A12', goldSoft: 'rgba(201,138,18,0.55)',
  paper: '#EBD9AF', paperLight: '#F4E6C4', wash: 'rgba(214,170,104,0.32)',
};
const DISPLAY = 'Cinzel', TEXT = 'AlegreyaSans';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);
const rrect = (...a) => k.rrect(...a);

// ---------- the numbers ----------
const ANGLE = 360 / 50;              // degrees: 1/50 of a full circle, "about 7.2 degrees" (Cleomedes)
const DIST = 5000;                   // stadia, Alexandria to Syene
const TOTAL = 50 * DIST;             // 250,000 stadia
const PLINY = 252000;                // stadia, the figure Pliny gives
const POLAR = 40007.863;             // km around the Earth through the poles
const STADIA_M = [176.4, 184.8];     // two proposed stadion lengths, metres
const PLINY_M = [155, 160];          // the stadion range for Pliny's figure
const km = (stadia, m) => (stadia * m) / 1000;
const pct = (v) => ((v / POLAR - 1) * 100);
const RESULTS = STADIA_M.map((m) => ({ m, km: km(TOTAL, m), pct: Math.round(pct(km(TOTAL, m))) }));   // 44,100 (+10), 46,200 (+15)
const BAND = PLINY_M.map((m) => km(PLINY, m));                                                        // 39,060..40,320 km
const BAND_PCT = BAND.map((v) => pct(v).toFixed(1));                                                   // -2.4, +0.8
const signed = (s) => (s.startsWith('-') ? `−${s.slice(1)}` : `+${s}`);

// ---------- captions; each lasts 0.3 s per word + 1 s at least ----------
const LINES = [
  ['Around 240 BC, the Greek scholar Eratosthenes worked out the size of the *whole Earth*.', -0.8],
  ['He needed only ~shadows~, a distance and some geometry.', 0.2],
  ['At midsummer noon, a stick at *Syene*, today’s Aswan in Egypt, cast ~no shadow~.', -0.9],
  ['At *Alexandria*, to the north, the Sun stood about ~7.2°~ from overhead.', 0.1],
  ['That’s ~1/50~ of a full circle.', 0.4],
  ['The Sun is so far away that its rays arrive almost *parallel*.', 0.2],
  ['Extend both sticks to Earth’s centre: they meet at the same ~7.2°~.', 0.5],
  [`So *${fmt(DIST)} stadia*, city to city, is ~1/50~ of the way round.`, 0.2],
  [`*50 × ${fmt(DIST)}* = *${fmt(TOTAL)} stadia* around the Earth.`, 0.6],
  ['How close? It depends on a *stadion*’s length, still debated.', 0.3],
  [`At 176–185 m a stadion: about *${RESULTS[0].pct}–${RESULTS[1].pct}% too big*.`, 0.4],
  [`Take Pliny’s ~${fmt(PLINY)}~ and 155–160 m: within ~${BAND_PCT[0].replace('-', '')}%~.`, 0.6],
];
const CUES = (() => {
  const out = [];
  let t = 0.4;
  for (const [s, extra] of LINES) {
    const words = s.split(' ').length;
    const d = 0.3 * words + 1 + extra;
    out.push([+t.toFixed(2), +(t + d).toFixed(2), s]);
    t += d + 0.1;
  }
  return out;
})();
const at = (i) => CUES[i][0], end = (i) => CUES[i][1];
const DURATION = +(end(CUES.length - 1) + 0.9).toFixed(2);

// Scene windows (crossfades overlap by ~0.3 s)
const T = {
  A: [0, at(2) + 0.1],
  B: [at(2) - 0.2, at(5) + 0.2],
  CD: [at(5) - 0.2, at(9) + 0.3],
  E: [at(9) - 0.1, DURATION],
};

// ---------- seeded randomness ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}

// ---------- papyrus, painted once ----------
function makePapyrus() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const base = g.createRadialGradient(W / 2, 470, 60, W / 2, 520, 820);
  base.addColorStop(0, '#F2E2BA'); base.addColorStop(0.55, '#E6D1A0'); base.addColorStop(1, '#C9A96C');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  const rnd = rng(17);
  // mottling
  for (let i = 0; i < 70; i++) {
    const x = rnd() * W, y = rnd() * H, r = 40 + rnd() * 160, a = 0.02 + rnd() * 0.05;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const tint = rnd() < 0.6 ? '140,96,40' : '255,246,222';
    gr.addColorStop(0, `rgba(${tint},${a})`); gr.addColorStop(1, `rgba(${tint},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  // strip seams: papyrus is laid in overlapping strips
  for (let x = 30 + rnd() * 40; x < W; x += 96 + rnd() * 40) {
    const lg = g.createLinearGradient(x - 10, 0, x + 10, 0);
    lg.addColorStop(0, 'rgba(120,80,30,0)'); lg.addColorStop(0.5, 'rgba(120,80,30,0.07)'); lg.addColorStop(1, 'rgba(120,80,30,0)');
    g.fillStyle = lg; g.fillRect(x - 10, 0, 20, H);
  }
  // fibres: mostly horizontal, a fainter vertical layer underneath
  g.lineCap = 'round';
  const fibre = (horizontal, n, aMax) => {
    for (let i = 0; i < n; i++) {
      const dark = rnd() < 0.55;
      g.strokeStyle = dark ? `rgba(110,72,28,${0.03 + rnd() * aMax})` : `rgba(255,248,226,${0.04 + rnd() * aMax})`;
      g.lineWidth = 0.6 + rnd() * 1.4;
      const len = 60 + rnd() * 420, wob = rnd() * 2.2, ph = rnd() * TAU;
      g.beginPath();
      if (horizontal) {
        const y = rnd() * H, x0 = rnd() * W - 100;
        for (let s = 0; s <= len; s += 12) { const yy = y + Math.sin(s * 0.02 + ph) * wob; s ? g.lineTo(x0 + s, yy) : g.moveTo(x0, yy); }
      } else {
        const x = rnd() * W, y0 = rnd() * H - 100;
        for (let s = 0; s <= len; s += 12) { const xx = x + Math.sin(s * 0.02 + ph) * wob; s ? g.lineTo(xx, y0 + s) : g.moveTo(xx, y0); }
      }
      g.stroke();
    }
  };
  fibre(false, 260, 0.04);
  fibre(true, 1100, 0.07);
  // specks
  for (let i = 0; i < 500; i++) {
    g.fillStyle = `rgba(90,58,22,${0.05 + rnd() * 0.12})`;
    g.beginPath(); g.arc(rnd() * W, rnd() * H, 0.4 + rnd() * 1.1, 0, TAU); g.fill();
  }
  // darker, worn edges
  const vg = g.createRadialGradient(W / 2, H / 2, 330, W / 2, H / 2, 780);
  vg.addColorStop(0, 'rgba(96,58,20,0)'); vg.addColorStop(1, 'rgba(96,58,20,0.42)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return cv;
}
let PAPYRUS = null;

/** A black-figure meander (Greek key) frieze on a terracotta band. */
function meander(x0, x1, y, h, a = 1) {
  withAlpha(a, () => {
    ctx.fillStyle = C.terra; ctx.fillRect(x0, y, x1 - x0, h);
    const grd = ctx.createLinearGradient(0, y, 0, y + h);
    grd.addColorStop(0, 'rgba(255,220,180,0.18)'); grd.addColorStop(1, 'rgba(60,20,0,0.18)');
    ctx.fillStyle = grd; ctx.fillRect(x0, y, x1 - x0, h);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x0, y + 1.5); ctx.lineTo(x1, y + 1.5); ctx.moveTo(x0, y + h - 1.5); ctx.lineTo(x1, y + h - 1.5); ctx.stroke();
    const p = 6, top = y + p, bot = y + h - p, hh = bot - top, u = hh * 1.5;
    ctx.lineWidth = 3; ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
    ctx.beginPath();
    let first = true;
    for (let x = x0 + 8; x + u <= x1 - 8; x += u) {
      const pts = [[x, bot], [x, top], [x + 0.78 * u, top], [x + 0.78 * u, top + 0.62 * hh], [x + 0.36 * u, top + 0.62 * hh], [x + 0.36 * u, bot], [x + u, bot]];
      for (const [px, py] of pts) { first ? ctx.moveTo(px, py) : ctx.lineTo(px, py); first = false; }
    }
    ctx.stroke();
  });
}

/** A black-figure Sun: a terracotta disc in a black ring, with black ray-wedges. */
function sunDisc(x, y, r, a = 1, spin = 0) {
  withAlpha(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    ctx.fillStyle = C.ink;
    for (let i = 0; i < 12; i++) {
      const th = (i / 12) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(th - 0.13) * r * 1.12, Math.sin(th - 0.13) * r * 1.12);
      ctx.lineTo(Math.cos(th) * r * 1.62, Math.sin(th) * r * 1.62);
      ctx.lineTo(Math.cos(th + 0.13) * r * 1.12, Math.sin(th + 0.13) * r * 1.12);
      ctx.closePath(); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0, 0, r * 1.08, 0, TAU); ctx.fill();
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
    g.addColorStop(0, '#F0A35C'); g.addColorStop(1, C.terra);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1.5, r * 0.07);
    ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, TAU); ctx.stroke();
    ctx.restore();
  });
}

/** A gnomon: a black rod with a small foot, from (x0,y0) on the ground to (x1,y1). */
function stick(x0, y0, x1, y1, w = 7) {
  ctx.strokeStyle = C.ink; ctx.lineCap = 'round'; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const ang = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2;
  ctx.lineWidth = w * 0.8;
  ctx.beginPath(); ctx.moveTo(x0 - Math.cos(ang) * w * 1.3, y0 - Math.sin(ang) * w * 1.3); ctx.lineTo(x0 + Math.cos(ang) * w * 1.3, y0 + Math.sin(ang) * w * 1.3); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x1, y1, w * 0.75, 0, TAU); ctx.fill();
}

/** A straight line drawn from a to b up to fraction p, optionally dashed. */
function line(ax, ay, bx, by, p = 1, { color = C.ink, width = 2, dash = null, offset = 0 } = {}) {
  if (p <= 0) return;
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = offset; }
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, bx, p), lerp(ay, by, p)); ctx.stroke();
  ctx.setLineDash([]);
}

/** A filled angle wedge at (cx,cy) between screen angles a0 and a1, with an outline arc. */
function wedge(cx, cy, r, a0, a1, color = C.blue, fill = C.blueSoft) {
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1, a1 < a0); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1, a1 < a0); ctx.stroke();
}

/** A compass-point mark: the tiny cross a compass leaves at a centre. */
function cross(x, y, s = 7, color = C.ink) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke();
}

/** A label on a small papyrus chip, so it reads over lines. */
function chip(s, x, y, { size = 24, weight = 800, color = C.ink, align = 'center', family = TEXT, pad = 9, bg = 'rgba(244,230,196,0.92)', spacing = '0px' } = {}) {
  font(weight, size, family);
  ctx.letterSpacing = spacing;
  const w = ctx.measureText(s).width;
  ctx.letterSpacing = '0px';
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  rrect(x0 - pad, y - size * 0.68, w + 2 * pad, size * 1.36, 6); ctx.fillStyle = bg; ctx.fill();
  text(s, x0, y + 1, { color, base: 'middle', spacing });
}

// ---------- layers ----------
function background(t) {
  if (!PAPYRUS) PAPYRUS = makePapyrus();
  ctx.drawImage(PAPYRUS, 0, 0);
  const on = eout(seg(t, 0, 0.8));
  withAlpha(on, () => {
    font(400, 24, DISPLAY); text('RECKON', 56, 82, { color: C.terraDeep, spacing: '5px' });
    const w = ctx.measureText('RECKON').width + 6 * 5;
    font(700, 22); text('HISTORY · ANCIENT SCIENCE', 56 + w + 20, 81, { color: C.inkSoft, spacing: '3px' });
  });
  meander(40, W - 40, 122, 26, on);
  meander(40, W - 40, 952, 26, on);
}

// ---------- A: hook ----------
const HOOK = { cx: 432, cy: 560, r: 168 };
function sceneA(t) {
  // title
  const ti = eout(seg(t, 0.3, 1.1));
  withAlpha(ti, () => {
    font(700, 64, DISPLAY); text('ERATOSTHENES', W / 2, 236 + (1 - ti) * 14, { align: 'center', spacing: '5px' });
    font(800, 24); text('ALEXANDRIA · AROUND 240 BC', W / 2, 284, { align: 'center', color: C.terraDeep, spacing: '4px' });
  });
  const { cx, cy, r } = HOOK;
  // the compass draws the Earth
  const draw = eio(seg(t, 1.0, 3.6));
  const a0 = -Math.PI / 2, a = a0 + draw * TAU;
  if (draw > 0) {
    // wash inside once the circle closes
    withAlpha(seg(t, 3.3, 4.2), () => {
      const g = ctx.createRadialGradient(cx - 40, cy - 50, 10, cx, cy, r);
      g.addColorStop(0, 'rgba(244,226,186,0.6)'); g.addColorStop(1, C.wash);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, r, a0, a); ctx.stroke();
    cross(cx, cy, 8);
    // construction lines
    withAlpha(seg(t, 3.5, 4.3) * 0.5, () => {
      ctx.setLineDash([6, 8]);
      line(cx - r - 26, cy, cx + r + 26, cy, 1, { color: C.inkFaint, width: 1.6, dash: [6, 8] });
      line(cx, cy - r - 26, cx, cy + r + 26, 1, { color: C.inkFaint, width: 1.6, dash: [6, 8] });
      ctx.setLineDash([]);
    });
    // the compass itself
    withAlpha(span(t, 0.9, 4.0, 0.3, 0.4), () => {
      const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
      // the hinge stands off the middle of the legs' span, turning with the pen
      const mx = (cx + px) / 2, my = (cy + py) / 2;
      const nx = Math.sin(a), ny = -Math.cos(a);
      const hinge = [mx + nx * 64, my + ny * 64];
      ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(...hinge); ctx.lineTo(px, py); ctx.stroke();
      ctx.lineWidth = 3; ctx.strokeStyle = C.terra; ctx.beginPath(); ctx.moveTo(lerp(cx, hinge[0], 0.15), lerp(cy, hinge[1], 0.15)); ctx.lineTo(lerp(cx, hinge[0], 0.85), lerp(cy, hinge[1], 0.85)); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(hinge[0], hinge[1], 9, 0, TAU); ctx.fill();
      ctx.fillStyle = C.terra; ctx.beginPath(); ctx.arc(hinge[0], hinge[1], 4, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(hinge[0], hinge[1] - 9); ctx.lineTo(hinge[0], hinge[1] - 26); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
    });
  }
  // the two cities and a hint of sunlight
  const th = 24 * DEG;
  const S = [cx, cy - r], A = [cx - r * Math.sin(th), cy - r * Math.cos(th)];
  const cities = eout(seg(t, at(1) + 0.3, at(1) + 0.9));
  withAlpha(cities, () => {
    for (const [p, name, side] of [[S, 'Syene', 1], [A, 'Alexandria', -1]]) {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, TAU); ctx.fill();
      ctx.fillStyle = C.terra; ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, TAU); ctx.fill();
      font(800, 26); text(name, p[0] + side * 20, p[1] + (side > 0 ? -16 : 4), { align: side > 0 ? 'left' : 'right', color: C.ink });
    }
  });
  const rays = seg(t, at(1) + 0.9, at(1) + 2.0);
  withAlpha(rays * (1 - seg(t, T.A[1] - 0.4, T.A[1])), () => {
    for (let i = -3; i <= 3; i++) {
      const x = cx + i * 46;
      const yTop = cy - r - 70, yHit = cy - Math.sqrt(Math.max(0, r * r - (x - cx) ** 2));
      line(x, yTop, x, lerp(yTop, yHit, eout(rays)), 1, { color: C.gold, width: 3, dash: [10, 9], offset: -t * 30 });
    }
    sunDisc(cx + 236, cy - r - 30, 26, eout(rays), t * 0.15);
  });
}

// ---------- B: the two shadows ----------
const PANELS = [
  { x: 48, name: 'ALEXANDRIA', sub: 'to the north', stickX: 276, angle: ANGLE, sunLabel: 'noon Sun' },
  { x: 452, name: 'SYENE', sub: 'today’s Aswan', stickX: 632, angle: 0, sunLabel: 'noon Sun: overhead' },
];
const PANEL = { y: 186, w: 364, h: 476, ground: 574, stickH: 300 };

function panel(p, t, a, show) {
  const { y, w, h, ground, stickH } = PANEL;
  withAlpha(a, () => {
    ctx.save();
    ctx.translate(0, (1 - a) * 30);
    // frame: black rule, terracotta inner border, lighter field
    rrect(p.x, y, w, h, 14); ctx.fillStyle = 'rgba(247,236,206,0.72)'; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    rrect(p.x + 8, y + 8, w - 16, h - 16, 9); ctx.strokeStyle = C.terra; ctx.lineWidth = 2; ctx.stroke();
    // ground band, terracotta like the clay of a vase
    ctx.save();
    rrect(p.x + 8, y + 8, w - 16, h - 16, 9); ctx.clip();
    ctx.fillStyle = 'rgba(180,83,42,0.18)'; ctx.fillRect(p.x, ground, w, y + h - ground);
    // rays
    const th = p.angle * DEG, dx = -Math.sin(th), dy = Math.cos(th);
    const rayA = show.rays;
    if (rayA > 0) {
      // rays parallel to (dx, dy), landing on the ground every 44 px; the one through the tip is drawn below
      for (let i = -9; i <= 9; i++) {
        if (i === 0) continue;
        const gx = p.stickX - stickH * Math.tan(th) + i * 44;
        const L = (ground - (y + 84)) / dy;
        withAlpha(rayA * 0.85, () => line(gx - dx * L, ground - dy * L, gx, ground, eout(rayA), { color: C.gold, width: 2.5, dash: [9, 9], offset: -t * 26 }));
      }
    }
    ctx.restore();
    // ground line
    line(p.x + 18, ground, p.x + w - 18, ground, 1, { color: C.ink, width: 3 });
    // a small Sun in the corner: the Sun is far away, so its rays arrive parallel
    const tipX = p.stickX, tipY = ground - stickH * eout(show.stick);
    const topY = ground - stickH, rayTop = y + 84;
    withAlpha(show.sun, () => {
      sunDisc(p.x + 46, y + 46, 15, 1, t * 0.12);
      font(800, 22); text(p.sunLabel, p.x + 80, y + 47, { color: C.inkSoft, base: 'middle' });
    });
    // the ray through the tip: solid down to the tip, then dashed on to the ground
    const sh = stickH * Math.tan(th);
    if (rayA > 0) {
      line(p.stickX + Math.tan(th) * (topY - rayTop), rayTop, p.stickX, topY, eout(rayA), { color: C.gold, width: 4 });
      if (p.angle > 0) line(p.stickX, topY, p.stickX - sh, ground, eout(seg(rayA, 0.5, 1)) * show.shadow, { color: C.gold, width: 3, dash: [7, 7] });
    }
    // shadow
    if (p.angle > 0 && show.shadow > 0) {
      ctx.strokeStyle = 'rgba(34,23,15,0.85)'; ctx.lineWidth = 10; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(p.stickX, ground - 5); ctx.lineTo(p.stickX - sh * eout(show.shadow), ground - 5); ctx.stroke();
      withAlpha(seg(show.shadow, 0.6, 1), () => {
        chip('shadow', p.stickX - sh - 14, ground - 34, { size: 24, color: C.ink, align: 'right', bg: 'rgba(247,236,206,0.95)' });
      });
    }
    // stick
    if (show.stick > 0) stick(p.stickX, ground, tipX, tipY, 8);
    // the angle at the tip
    if (p.angle > 0 && show.angle > 0) {
      withAlpha(show.angle, () => {
        wedge(p.stickX, topY, 160, Math.PI / 2, Math.PI / 2 + th * eout(show.angle), C.blue, 'rgba(31,79,156,0.42)');
        chip('7.2°', p.stickX - 34, topY + 120, { size: 36, family: DISPLAY, weight: 700, color: C.blue, align: 'right', bg: 'rgba(247,236,206,0.92)' });
      });
    }
    if (p.angle === 0 && show.none > 0) {
      withAlpha(show.none, () => {
        chip('no shadow', p.stickX + 96, ground - 52, { size: 26, color: C.blue, bg: 'rgba(247,236,206,0.95)' });
        line(p.stickX + 58, ground - 36, p.stickX + 14, ground - 6, 1, { color: C.blue, width: 2.5 });
      });
    }
    // names
    font(700, 28, DISPLAY); text(p.name, p.x + w / 2, ground + 38, { align: 'center', spacing: '2px' });
    font(700, 20); text(p.sub, p.x + w / 2, ground + 62, { align: 'center', color: C.inkSoft, spacing: '1px' });
    ctx.restore();
  });
}

function sceneB(t) {
  const a0 = at(2), a1 = at(3), a2 = at(4);
  panel(PANELS[1], t, eout(seg(t, a0 - 0.1, a0 + 0.6)), {
    sun: eout(seg(t, a0 + 0.2, a0 + 0.8)), rays: seg(t, a0 + 0.5, a0 + 1.6), stick: eout(seg(t, a0 + 1.0, a0 + 1.8)),
    none: eout(seg(t, a0 + 2.0, a0 + 2.5)),
  });
  panel(PANELS[0], t, eout(seg(t, a0 + 0.1, a0 + 0.8)), {
    sun: eout(seg(t, a1 + 0.1, a1 + 0.7)), rays: seg(t, a1 + 0.3, a1 + 1.4), stick: eout(seg(t, a0 + 1.2, a0 + 2.0)),
    shadow: seg(t, a1 + 1.0, a1 + 2.0), angle: seg(t, a1 + 1.9, a1 + 2.8),
  });
  // north arrow between the panels
  withAlpha(eout(seg(t, a1 - 0.2, a1 + 0.4)), () => {
    font(800, 22); text('← NORTH', 56, PANEL.y - 14, { color: C.inkSoft, spacing: '2px', base: 'middle' });
    text('SOUTH →', W - 56, PANEL.y - 14, { color: C.inkSoft, spacing: '2px', base: 'middle', align: 'right' });
  });
  // 1/50 of a circle
  const pa = eout(seg(t, a2 - 0.1, a2 + 0.5));
  withAlpha(pa, () => {
    const cx = 128, cy = 728, r = 50;
    const lit = seg(t, a2 + 0.3, a2 + 1.2);
    for (let i = 0; i < 50; i++) {
      const s0 = -Math.PI / 2 - (i + 1) * ANGLE * DEG, s1 = -Math.PI / 2 - i * ANGLE * DEG;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, s0, s1); ctx.closePath();
      ctx.fillStyle = i === 0 ? `rgba(31,79,156,${0.25 + 0.65 * lit})` : i % 2 ? 'rgba(180,83,42,0.30)' : 'rgba(247,236,206,0.8)';
      ctx.fill();
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    font(800, 30); text('1/50 of a circle', cx + r + 26, cy - 14, { base: 'middle' });
    font(700, 26); text(`360° ÷ 50 = ${ANGLE.toFixed(1)}°`, cx + r + 26, cy + 22, { base: 'middle', color: C.blue });
  });
}

// ---------- C and D: the Earth diagram ----------
/** Diagram state: centre, radius, drawn angle (deg), stick length, ray strength. */
function geo(t) {
  const m = eio(seg(t, at(7) - 0.1, at(7) + 1.3));           // C -> D
  return {
    cx: 432, cy: lerp(688, 520, m), r: lerp(330, 206, m),
    th: lerp(24, ANGLE, m) * DEG, stickL: lerp(66, 0, m), rays: 1 - m, m,
  };
}

function sceneCD(t) {
  const g = geo(t), { cx, cy, r, th } = g;
  const c0 = at(5), c1 = at(6), d0 = at(7), d1 = at(8);
  const S = [cx, cy - r], A = [cx - r * Math.sin(th), cy - r * Math.cos(th)];
  const L = g.stickL;
  const St = [cx, cy - r - L], At = [cx - (r + L) * Math.sin(th), cy - (r + L) * Math.cos(th)];
  const appear = eout(seg(t, c0 - 0.2, c0 + 0.6));

  // Earth: a wash fading downward (scene C), the full disc later (scene D)
  withAlpha(appear, () => {
    // big diagram: the wash fades out just below the centre; small diagram: a full disc
    const fadeG = ctx.createLinearGradient(0, cy - r, 0, cy + 30);
    fadeG.addColorStop(0, 'rgba(240,220,178,0.75)'); fadeG.addColorStop(0.75, C.wash); fadeG.addColorStop(1, 'rgba(214,170,104,0)');
    const fullG = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, 10, cx, cy, r);
    fullG.addColorStop(0, 'rgba(244,226,186,0.75)'); fullG.addColorStop(1, C.wash);
    withAlpha(1 - g.m, () => { ctx.fillStyle = fadeG; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); });
    withAlpha(g.m, () => { ctx.fillStyle = fullG; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); });
    // outline, fading out below the centre while the diagram is big
    const N = 120;
    ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    for (let i = 0; i < N; i++) {
      const u0 = (i / N) * TAU, u1 = ((i + 1) / N) * TAU;
      const y = cy + r * Math.sin((u0 + u1) / 2);
      const a = lerp(clamp(1 - (y - (cy - 30)) / 70), 1, g.m);
      if (a <= 0.01) continue;
      ctx.strokeStyle = `rgba(34,23,15,${a})`;
      ctx.beginPath(); ctx.arc(cx, cy, r, u0, u1 + 0.002); ctx.stroke();
    }
    cross(cx, cy, 8);
    withAlpha(1 - g.m, () => { font(700, 26, DISPLAY); text('O', cx + 14, cy + 30, { color: C.inkSoft }); });
  });

  // sunlight: parallel rays
  const rayP = seg(t, c0 + 0.4, c0 + 1.8);
  withAlpha(appear * g.rays, () => {
    font(800, 22); text('SUNLIGHT', W / 2, 186, { align: 'center', color: C.gold, spacing: '4px' });
    for (let i = -6; i <= 6; i++) {
      const x = cx + i * 52 + 14;
      const inside = Math.abs(x - cx) < r;
      const yHit = inside ? cy - Math.sqrt(r * r - (x - cx) ** 2) : 700;
      line(x, 204, x, lerp(204, yHit, eout(clamp(rayP * 1.2 - Math.abs(i) * 0.03))), 1, { color: C.goldSoft, width: 2.5, dash: [10, 9], offset: -t * 30 });
    }
    // the rays that graze the two stick tips
    line(St[0], 204, St[0], St[1], eout(rayP), { color: C.gold, width: 4 });
    line(At[0], 204, At[0], At[1], eout(rayP), { color: C.gold, width: 4 });
  });

  // sticks and the shadow at Alexandria
  withAlpha(appear * clamp(L / 20), () => {
    stick(S[0], S[1], St[0], St[1], 7);
    stick(A[0], A[1], At[0], At[1], 7);
    // the shadow: from A along the ground (tangent) away from Syene
    const sh = L * Math.tan(th);
    const tx = -Math.cos(th), ty = Math.sin(th);       // tangent pointing north (to the left and down)
    const sp = eout(seg(t, c0 + 1.2, c0 + 2.0));
    ctx.strokeStyle = 'rgba(34,23,15,0.82)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(A[0] + tx * sh * sp, A[1] + ty * sh * sp); ctx.stroke();
    line(At[0], At[1], A[0] + tx * sh, A[1] + ty * sh, sp, { color: C.gold, width: 2.5, dash: [6, 6] });
  });

  // city labels
  withAlpha(appear, () => {
    const lab = (s, x, y, align) => chip(s, x, y, { size: 24, align, bg: 'rgba(244,230,196,0.9)' });
    withAlpha(1 - seg(t, at(8) - 0.2, at(8) + 0.3), () => {
      lab('Syene', S[0] + 26, S[1] - L * 0.5 - 6, 'left');
      lab('Alexandria', A[0] - 40, A[1] - L * 0.35 + 4, 'right');
    });
  });

  // extend both sticks to the centre, then the alternate angles
  const ext = eio(seg(t, c1 + 0.2, c1 + 1.4));
  withAlpha(appear, () => {
    line(St[0], St[1], cx, cy, ext, { color: C.ink, width: 2.5, dash: [8, 7] });
    line(At[0], At[1], cx, cy, ext, { color: C.ink, width: 2.5, dash: [8, 7] });
    if (g.m > 0) { line(S[0], S[1], cx, cy, 1, { color: C.ink, width: 2.5 }); line(A[0], A[1], cx, cy, 1, { color: C.ink, width: 2.5 }); }
  });
  const ang = eout(seg(t, c1 + 1.5, c1 + 2.3));
  const zA = seg(t, c1 + 2.4, c1 + 3.2) * (1 - g.m);
  withAlpha(appear * ang, () => {
    const rr = lerp(84, 66, g.m);
    wedge(cx, cy, rr, -Math.PI / 2 - th, -Math.PI / 2);
    font(700, lerp(34, 30, g.m), DISPLAY);
    chip('7.2°', cx + 14, cy - rr + 8, { size: lerp(32, 28, g.m), family: DISPLAY, weight: 700, color: C.blue, align: 'left', bg: 'rgba(244,230,196,0.85)' });
  });
  // the same angle at Alexandria's tip, between the ray (down) and the line to the centre
  withAlpha(appear * zA, () => {
    const dirC = Math.atan2(cy - At[1], cx - At[0]);
    wedge(At[0], At[1], 70, Math.PI / 2, dirC, C.blue, C.blueSoft);
    chip('7.2°', At[0] + 58, At[1] + 112, { size: 32, family: DISPLAY, weight: 700, color: C.blue, align: 'left', bg: 'rgba(244,230,196,0.85)' });
    // the Z of alternate angles: down the (extended) ray, along the line to the centre, up to Syene
    const z = eio(zA);
    line(At[0], At[1], At[0], cy - 10, z, { color: C.blue, width: 2, dash: [4, 7] });
    const pts = [[At[0], At[1] + 140], [At[0], At[1]], [cx, cy], [cx, cy - 150]];
    const segs = pts.length - 1, done = z * segs;
    ctx.save();
    ctx.shadowColor = 'rgba(31,79,156,0.45)'; ctx.shadowBlur = 10;
    ctx.strokeStyle = C.blue; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(...pts[0]);
    for (let i = 0; i < segs; i++) {
      const f = clamp(done - i);
      if (f <= 0) break;
      ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f));
    }
    ctx.stroke();
    ctx.restore();
  });
  // note
  withAlpha(appear * (1 - g.m), () => {
    font(700, 21); text('DIAGRAM · NOT TO SCALE · ANGLE ENLARGED', 56, 770, { color: C.inkSoft, spacing: '2px' });
  });

  // ----- D: the arc, stamped 50 times -----
  const arcA = eout(seg(t, d0 + 0.9, d0 + 1.6));
  const R1 = r + 6, R2 = r + 28;
  const stampP = seg(t, d1 + 0.1, d1 + 2.4);
  const nShown = g.m > 0.99 ? Math.min(50, Math.floor(1 + Math.pow(stampP, 0.85) * 49.999)) : 0;
  withAlpha(arcA, () => {
    for (let i = 0; i < Math.max(1, nShown); i++) {
      const s1 = -Math.PI / 2 - i * th, s0 = s1 - th;
      const pop = i === 0 ? arcA : clamp((Math.pow(stampP, 0.85) * 49.999 + 1 - i) * 2.5);
      if (pop <= 0) continue;
      withAlpha(pop, () => {
        ctx.beginPath(); ctx.arc(cx, cy, R2, s0, s1); ctx.arc(cx, cy, R1, s1, s0, true); ctx.closePath();
        ctx.fillStyle = i === 0 ? C.terra : i % 2 ? C.ink : C.terra; ctx.fill();
        ctx.strokeStyle = 'rgba(244,230,196,0.9)'; ctx.lineWidth = 1.2; ctx.stroke();
      });
    }
    // the first arc's label
    withAlpha(1 - seg(t, d1 + 0.2, d1 + 0.7), () => {
      const mid = -Math.PI / 2 - th / 2;
      const lx = cx + (R2 + 16) * Math.cos(mid), ly = cy + (R2 + 16) * Math.sin(mid);
      line(lx, ly, lx - 90, ly - 34, 1, { color: C.terraDeep, width: 2 });
      chip(`about ${fmt(DIST)} stadia`, lx - 96, ly - 38, { size: 26, color: C.terraDeep, align: 'right' });
    });
  });
  // counter in the middle
  withAlpha(seg(t, d1 - 0.1, d1 + 0.4), () => {
    const n = Math.max(1, nShown);
    font(700, 52, DISPLAY);
    text(`${n} × ${fmt(DIST)}`, cx, cy + 58, { align: 'center', base: 'middle', color: n === 50 ? C.ink : C.inkSoft });
    font(800, 34);
    const done = seg(t, d1 + 2.45, d1 + 2.9);
    text(`= ${fmt(n * DIST)} stadia`, cx, cy + 108, { align: 'center', base: 'middle', color: n === 50 ? C.terraDeep : C.inkSoft });
    withAlpha(done, () => { font(800, 22); text('ALL THE WAY ROUND', cx, cy + 148, { align: 'center', base: 'middle', color: C.terraDeep, spacing: '3px' }); });
  });
  withAlpha(seg(t, d0 + 1.0, d0 + 1.6), () => {
    font(700, 21); text(`ANGLE NOW TO SCALE: ${ANGLE.toFixed(1)}° = 1/50 OF A CIRCLE`, W / 2, 776, { color: C.inkSoft, spacing: '2px', align: 'center' });
  });
}

// ---------- E: how close? ----------
const AX = { x0: 96, x1: 768, y: 512, lo: 38000, hi: 47000 };
const ax = (v) => lerp(AX.x0, AX.x1, (v - AX.lo) / (AX.hi - AX.lo));
function sceneE(t) {
  const e0 = at(9), e1 = at(10), e2 = at(11);
  const p = eout(seg(t, e0 - 0.1, e0 + 0.6));
  withAlpha(p, () => {
    font(700, 52, DISPLAY); text('HOW CLOSE?', W / 2, 232 + (1 - p) * 12, { align: 'center', spacing: '4px' });
    font(800, 26); text(`${fmt(TOTAL)} stadia × the length of one stadion`, W / 2, 278, { align: 'center', color: C.terraDeep });
    // axis
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(AX.x0 - 10, AX.y); ctx.lineTo(AX.x1 + 10, AX.y); ctx.stroke();
    for (let v = AX.lo; v <= AX.hi; v += 1000) {
      const x = ax(v), big = v % 2000 === 0;
      ctx.lineWidth = big ? 3 : 2;
      ctx.beginPath(); ctx.moveTo(x, AX.y); ctx.lineTo(x, AX.y + (big ? 16 : 9)); ctx.stroke();
      if (big) { font(700, 22); text(fmt(v), x, AX.y + 42, { align: 'center', color: C.inkSoft }); }
    }
    font(700, 21); text('KM AROUND THE EARTH, THROUGH THE POLES', W / 2, AX.y + 78, { align: 'center', color: C.inkSoft, spacing: '2px' });
  });
  // the true value
  const tv = eout(seg(t, e0 + 0.6, e0 + 1.3));
  withAlpha(tv, () => {
    const x = ax(POLAR);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(x, AX.y); ctx.lineTo(x, lerp(AX.y, 372, tv)); ctx.stroke();
    font(700, 26, DISPLAY); text('TRUE', x, 340, { align: 'center' });
    font(800, 26); text(`${fmt(POLAR)} km`, x, 364, { align: 'center', color: C.inkSoft, base: 'alphabetic' });
  });
  // 250,000 stadia with two proposed stadion lengths
  RESULTS.forEach((res, i) => {
    const a = eout(seg(t, e1 + 0.4 + i * 0.9, e1 + 1.0 + i * 0.9));
    withAlpha(a, () => {
      const x = ax(res.km), y = AX.y - 8 - (1 - a) * 30;
      ctx.fillStyle = C.terra; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 13, y - 26); ctx.lineTo(x + 13, y - 26); ctx.closePath(); ctx.fill(); ctx.stroke();
      font(800, 24); text(`${res.m} m`, x, y - 70, { align: 'center' });
      font(700, 32, DISPLAY); text(`+${res.pct}%`, x, y - 38, { align: 'center', color: C.terraDeep });
    });
  });
  // Pliny's 252,000 with 155-160 m
  const b = eout(seg(t, e2 + 0.3, e2 + 1.1));
  withAlpha(b, () => {
    const x0 = ax(BAND[0]), x1 = lerp(x0, ax(BAND[1]), b);
    const by = AX.y + 102;
    rrect(x0, by, Math.max(4, x1 - x0), 16, 8); ctx.fillStyle = C.blue; ctx.fill();
    line(x0, by, x0, AX.y + 4, 1, { color: C.blue, width: 2, dash: [3, 5] });
    line(ax(BAND[1]), by, ax(BAND[1]), AX.y + 4, b, { color: C.blue, width: 2, dash: [3, 5] });
    font(800, 24); text(`${fmt(PLINY)} stadia × ${PLINY_M[0]}–${PLINY_M[1]} m`, x0 - 4, by + 50, { color: C.blue });
    font(700, 32, DISPLAY); text(`${signed(BAND_PCT[0])}% to ${signed(BAND_PCT[1])}%`, x0 - 4, by + 88, { color: C.blue });
  });
  // caveat and source
  withAlpha(eout(seg(t, e0 + 1.2, e0 + 1.9)), () => {
    font(700, 22);
    text('Known from Cleomedes’ simplified retelling; Eratosthenes’ own book is lost.', W / 2, 744, { align: 'center', color: C.inkSoft });
    text('Source: Wikipedia, “Earth’s circumference”', W / 2, 772, { align: 'center', color: C.inkSoft });
  });
}

// ---------- captions with balanced lines ----------
const CAP = { size: 44, lh: 54, weight: 800, maxW: 740, y: 838 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
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
    k.captions(t, [cue], { x: W / 2, y: CAP.y, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.terraDeep, '~': C.blue } });
  }
}

Kit.scene({
  width: W, height: H, duration: DURATION,
  fonts: [
    { family: DISPLAY, file: 'Cinzel.woff2', weight: '400 900' },
    { family: TEXT, file: 'AlegreyaSans-Medium.woff2', weight: '500' },
    { family: TEXT, file: 'AlegreyaSans-Bold.woff2', weight: '700' },
    { family: TEXT, file: 'AlegreyaSans-ExtraBold.woff2', weight: '800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const scenes = [[sceneA, T.A, 0.01], [sceneB, T.B], [sceneCD, T.CD], [sceneE, T.E, 0.35, 0.01]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
