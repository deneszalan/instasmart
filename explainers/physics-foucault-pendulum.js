// Explainer for physics-foucault-pendulum: a swing that keeps its direction while the floor turns under it.
// Look: a brass instrument at night. Midnight-navy sky with faint stars and a vignette, brass and gold
// line-work, an engraved compass-rose floor dial with degree ticks. Cormorant Garamond for headings and
// numbers, Source Sans 3 for labels and captions.
//
// Source: Wikipedia, "Foucault pendulum" (the post's source). Facts used:
//   1851, Panthéon, Paris; 28 kg brass-coated lead bob on a 67 m wire; period about 16.5 s;
//   latitude 48°52′ N; full circle = 23 h 56 min / sin(latitude), about 31.8 h; about 11.3° an hour, clockwise;
//   at the poles the plane stays fixed while Earth turns beneath it, one (sidereal) day per turn;
//   at the equator it does not turn; rate = 360° × sin(latitude) per day;
//   "the first experiment to give simple, direct evidence of the Earth's rotation".
// Every rate and time on screen is computed below from 23 h 56 min and the sine of the latitude.
//
// Layout: the app overlays a control bar at the bottom and the slide counter top right, so captions sit
// around y = 830, nothing important goes below y = 930, and the corner x > 740, y < 120 stays empty.
//
// Scene plan (seconds):
//   A  0.0–10.4  Hook. Side view (diagram, not to scale): the dome, the 67 m wire, the 28 kg bob released
//                and swinging at real speed (16.5 s there and back) over the floor dial.
//                "How do you prove Earth spins, without looking at the sky?"
//                "1851: Léon Foucault hangs a 28 kg bob on a 67 m wire."
//   B  9.6–25.8  The camera tips to look straight down. The bob swings back and forth; in time-lapse
//                (1 s = 1 hour, then faster, and said so on screen) the swing line creeps clockwise,
//                leaving a faint trace each hour, until it has turned 360° after 31.8 hours.
//                "Seen from above, it swings back and forth…" / "…but hour by hour, the swing line creeps clockwise."
//                "In Paris: about 11.3° an hour." / "One full turn takes about 31.8 hours."
//   C 25.4–38.6  Why, at the North Pole: two dials side by side, same clock. From space the swing holds its
//                line and the floor turns anticlockwise; from the floor the swing seems to turn clockwise.
//                "Why? Picture the pendulum at the North Pole." / "From space, the swing keeps its direction…"
//                "…while the floor, and Earth under it, turns."
//   D 38.4–50.4  Latitude: an engraved globe and three small dials (pole, Paris, equator) run through one
//                sidereal day together: 360°, 271° and 0°. Labels give the full-turn times.
//                "Away from the pole, it turns more slowly." / "One day at the pole, 31.8 hours in Paris…"
//                "…and on the equator, it never turns."
//   E 50.2–54.5  Payoff card: Foucault's pendulum, Panthéon, Paris, 1851, over the finished rosette.
//                "The first simple, direct evidence that Earth turns."
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const TAU = Math.PI * 2, DEG = Math.PI / 180;

const C = {
  ivory: '#EFE7D4', soft: 'rgba(239,231,212,0.66)', faint: 'rgba(239,231,212,0.34)',
  brass: '#CFA65C', brassHi: '#F3D99E', brassLo: '#80612F', brassDim: 'rgba(207,166,92,0.36)',
  brassFaint: 'rgba(207,166,92,0.16)', gold: '#F6C661', star: '#A8CBFF',
};
// Quoted: in a CSS font shorthand a family name ending in a number must be a string.
const SERIF = '"Cormorant Garamond"', SANS = '"Source Sans 3"';

// ---------- the physics, from the source ----------
const SIDEREAL_H = 23 + 56 / 60;                 // one sidereal day, 23 h 56 min
const LAT = { pole: 90, paris: 48 + 52 / 60, equator: 0 };
const sinDeg = (d) => Math.sin(d * DEG);
/** Hours for the swing line to come full circle: a sidereal day divided by the sine of the latitude. */
const turnHours = (lat) => (sinDeg(lat) === 0 ? Infinity : SIDEREAL_H / sinDeg(lat));
/** Degrees the swing line turns per hour: 360° × sin(latitude) per sidereal day. */
const ratePerHour = (lat) => (360 * sinDeg(lat)) / SIDEREAL_H;
const T_PARIS = turnHours(LAT.paris);            // 31.78 h
const RATE_PARIS = ratePerHour(LAT.paris);       // 11.33° an hour
const RATE_POLE = ratePerHour(LAT.pole);         // 15.04° an hour
const PERIOD = 16.5;                             // seconds, one swing there and back
const f1 = (x) => x.toFixed(1);
const hm = (h) => { const m = Math.round(h * 60); return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`; };

// ---------- timeline ----------
const T = { D: [38.3, 50.4], E: [50.2, 54.5] };
const CUES = [
  [0.4, 4.8, 'How do you prove *Earth spins*, without looking at the sky?'],
  [4.9, 9.8, '1851: Léon Foucault hangs a *28 kg* bob on a *67 m* wire.'],
  [10.0, 13.6, 'Seen from above, it swings back and forth…'],
  [13.8, 18.2, '…but hour by hour, the swing line *creeps clockwise*.'],
  [18.4, 21.4, `In Paris: about ~${f1(RATE_PARIS)}° an hour~.`],
  [21.6, 25.4, `One full turn takes about ~${f1(T_PARIS)} hours~.`],
  [25.6, 29.4, 'Why? Picture the pendulum at the *North Pole*.'],
  [29.6, 33.4, 'From space, the swing ~keeps its direction~…'],
  [33.6, 38.2, '…while the *floor*, and Earth under it, turns.'],
  [38.5, 42.0, 'Away from the pole, it turns *more slowly*.'],
  [42.2, 46.4, `One day at the pole, ~${f1(T_PARIS)} hours~ in Paris…`],
  [46.6, 50.2, '…and on the equator, it *never turns*.'],
  [50.6, 54.4, 'The first *simple, direct* evidence that ~Earth turns~.'],
];

// ---------- drawing tools ----------
let k, ctx;
const font = (weight, size, family = SANS) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ivory, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);
const label = (s, x, y, opts = {}) => { font(600, 22); text(s.toUpperCase(), x, y, { color: C.brass, spacing: '2.5px', ...opts }); };
const line = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
const circle = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); };

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- background: night sky, built once ----------
let sky = null;
const TWINKLE = [];
function buildSky() {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(W / 2, 430, 30, W / 2, 470, 820);
  grad.addColorStop(0, '#15295C'); grad.addColorStop(0.5, '#0B1838'); grad.addColorStop(1, '#03060F');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(1851);
  for (let i = 0; i < 300; i++) {
    const x = rnd() * W, y = rnd() * H, big = rnd() < 0.08;
    const r = big ? 1.1 + rnd() * 0.7 : 0.45 + rnd() * 0.7, a = big ? 0.5 + rnd() * 0.3 : 0.1 + rnd() * 0.35;
    g.fillStyle = `rgba(214,228,255,${a.toFixed(3)})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    if (big && TWINKLE.length < 22) TWINKLE.push({ x, y, r, ph: rnd() * TAU, sp: 0.5 + rnd() * 0.7 });
  }
  const v = g.createRadialGradient(W / 2, 470, 260, W / 2, 500, 760);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.62)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  return c;
}
function background(t) {
  if (!sky) sky = buildSky();
  ctx.drawImage(sky, 0, 0);
  for (const s of TWINKLE) {
    const a = 0.35 + 0.35 * Math.sin(t * s.sp + s.ph);
    ctx.fillStyle = `rgba(232,240,255,${a.toFixed(3)})`; circle(s.x, s.y, s.r * 1.6); ctx.fill();
  }
  font(700, 22); text('RECKON', 64, 72, { color: C.brass, spacing: '5px' });
  font(500, 22); text('PHYSICS', 186, 72, { color: C.faint, spacing: '3px' });
}

// ---------- the engraved floor dial ----------
/** Dial centred at (cx, cy), radius R. rot turns the floor (radians, clockwise positive); squash < 1 tilts it. */
function dial(cx, cy, R, { rot = 0, squash = 1, numerals = true, fine = clamp((R - 150) / 90) } = {}) {
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(1, squash);
  // the plate
  const pg = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.05, 0, 0, R * 1.04);
  pg.addColorStop(0, 'rgba(46,56,82,0.92)'); pg.addColorStop(0.6, 'rgba(17,25,50,0.94)'); pg.addColorStop(1, 'rgba(6,10,24,0.96)');
  circle(0, 0, R); ctx.fillStyle = pg; ctx.fill();
  ctx.shadowColor = 'rgba(243,217,158,0.35)'; ctx.shadowBlur = 8;
  ctx.strokeStyle = C.brass; ctx.lineWidth = Math.max(1.6, R * 0.009); circle(0, 0, R); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1; ctx.strokeStyle = C.brassDim;
  circle(0, 0, R * 0.965); ctx.stroke();
  circle(0, 0, R * 0.79); ctx.stroke();
  circle(0, 0, R * 0.46); ctx.stroke();
  ctx.rotate(rot);
  // degree ticks
  const ro = R * 0.965;
  for (const [every, len, col, lw, a] of [[1, 0.03, C.brassDim, 1, +fine], [5, 0.055, C.brassDim, 1.2, 1], [10, 0.085, C.brass, 1.6, 1]]) {
    if (a <= 0) continue;
    ctx.beginPath();
    for (let d = 0; d < 360; d += every) {
      if (every < 10 && d % (every === 1 ? 5 : 10) === 0) continue; // drawn by the coarser pass
      const an = d * DEG - Math.PI / 2, c = Math.cos(an), s = Math.sin(an);
      ctx.moveTo(c * ro, s * ro); ctx.lineTo(c * (ro - R * len), s * (ro - R * len));
    }
    ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); ctx.globalAlpha /= a;
  }
  // numerals, engraved along the ring
  if (numerals) {
    font(600, Math.round(R * 0.085), SERIF);
    for (let d = 0; d < 360; d += 30) {
      ctx.save(); ctx.rotate(d * DEG); text(String(d), 0, -R * 0.84, { color: C.brass, align: 'center', base: 'middle' }); ctx.restore();
    }
  }
  rose(R * 0.43);
  ctx.restore();
}
/** An eight-point compass rose, light and dark halves like an engraving. */
function rose(r) {
  const pts = [[0, r], [45, r * 0.58], [90, r], [135, r * 0.58], [180, r], [225, r * 0.58], [270, r], [315, r * 0.58]];
  for (const [d, len] of [...pts].sort((a, b) => a[1] - b[1])) {
    const a = d * DEG - Math.PI / 2, w = len === r ? r * 0.13 : r * 0.1;
    const tip = [Math.cos(a) * len, Math.sin(a) * len];
    const l = [Math.cos(a - Math.PI / 2) * w, Math.sin(a - Math.PI / 2) * w];
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(...tip); ctx.lineTo(...l); ctx.closePath();
    ctx.fillStyle = len === r ? 'rgba(243,217,158,0.55)' : 'rgba(207,166,92,0.35)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(...tip); ctx.lineTo(-l[0], -l[1]); ctx.closePath();
    ctx.fillStyle = len === r ? 'rgba(128,97,47,0.55)' : 'rgba(128,97,47,0.35)'; ctx.fill();
  }
  ctx.strokeStyle = C.brassDim; ctx.lineWidth = 1; circle(0, 0, r * 0.16); ctx.stroke();
  font(700, Math.round(r * 0.3), SERIF); text('N', 0, -r * 1.2, { color: C.brassHi, align: 'center', base: 'middle' });
}

// ---------- the swing ----------
// Phase of the swing: real speed (16.5 s there and back) in the side view, then a steady faster swing
// once the camera looks down. The phase is integrated, so the bob never jumps.
const REL = 0.8, RA = 9.4, RB = 11.4, W_REAL = TAU / PERIOD, W_FAST = TAU / 2.2;
function phase(t) {
  if (t <= REL) return 0;
  const p1 = W_REAL * (Math.min(t, RA) - REL);
  if (t <= RA) return p1;
  const d = Math.min(t, RB) - RA;
  const p2 = W_REAL * d + ((W_FAST - W_REAL) * d * d) / (2 * (RB - RA));
  return t <= RB ? p1 + p2 : p1 + p2 + W_FAST * (t - RB);
}
const swingAt = (t) => -Math.cos(phase(t)); // -1 … 1 along the swing line

function bob(x, y, r, glow = 1) {
  if (glow > 0) {
    const g0 = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.6);
    g0.addColorStop(0, `rgba(243,217,158,${0.28 * glow})`); g0.addColorStop(1, 'rgba(243,217,158,0)');
    ctx.fillStyle = g0; circle(x, y, r * 2.6); ctx.fill();
  }
  const g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r);
  g.addColorStop(0, '#FFF4D2'); g.addColorStop(0.32, '#E6BD6C'); g.addColorStop(0.78, '#9A7232'); g.addColorStop(1, '#5A3F18');
  ctx.fillStyle = g; circle(x, y, r); ctx.fill();
  ctx.strokeStyle = 'rgba(255,238,196,0.45)'; ctx.lineWidth = 1; ctx.stroke();
}

/** The swing line on a dial seen from above; ang in radians, clockwise from east. Returns the bob position. */
function swingLine(cx, cy, R, ang, off, { squash = 1, lineA = 1, reach = 0.8 } = {}) {
  const A = R * reach, c = Math.cos(ang), s = Math.sin(ang) * squash;
  withAlpha(lineA, () => {
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(246,198,97,0.22)'; ctx.lineWidth = Math.max(4, R * 0.03); line(cx - A * c, cy - A * s, cx + A * c, cy + A * s);
    ctx.strokeStyle = C.gold; ctx.lineWidth = Math.max(1.5, R * 0.008); line(cx - A * c, cy - A * s, cx + A * c, cy + A * s);
    ctx.fillStyle = C.gold; circle(cx, cy, Math.max(2, R * 0.012)); ctx.fill();
  });
  return [cx + off * A * c, cy + off * A * s];
}
/** Faint traces of the swing line, one for every hour that has passed. */
function traces(cx, cy, R, hrs, rate) {
  ctx.strokeStyle = 'rgba(246,198,97,0.24)'; ctx.lineWidth = 1.2;
  const A = R * 0.8;
  for (let h = 1; h <= Math.floor(hrs); h++) {
    const a = rate * h * DEG;
    line(cx - A * Math.cos(a), cy - A * Math.sin(a), cx + A * Math.cos(a), cy + A * Math.sin(a));
  }
}

/** A curved arrow along a circle, from angle a0 to a1 (radians, canvas convention). */
function arcArrow(cx, cy, r, a0, a1, color, lw = 2.5) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1, a1 < a0); ctx.stroke();
  const dir = a1 > a0 ? 1 : -1, x = cx + Math.cos(a1) * r, y = cy + Math.sin(a1) * r;
  const tx = -Math.sin(a1) * dir, ty = Math.cos(a1) * dir, nx = Math.cos(a1), ny = Math.sin(a1), h = 12;
  ctx.beginPath(); ctx.moveTo(x + tx * h, y + ty * h); ctx.lineTo(x - nx * h * 0.6, y - ny * h * 0.6); ctx.lineTo(x + nx * h * 0.6, y + ny * h * 0.6); ctx.closePath(); ctx.fill();
}

// ---------- A: the hook, side view ----------
const PIV = { x: 432, y: 140 }, L = 470, AMP_SIDE = L * Math.sin(6.5 * DEG);
const FLOOR = { cx: 432, cy: 652, rx: 268, ry: 46 };
const TOP = { cx: 432, cy: 462, R: 262 };

function building(a) {
  withAlpha(a, () => {
    ctx.strokeStyle = C.brassDim; ctx.lineWidth = 1.5;
    // ground, walls, cornice
    ctx.strokeStyle = C.brass; line(88, 700, 776, 700);
    ctx.strokeStyle = C.brassDim;
    line(128, 700, 128, 368); line(736, 700, 736, 368);
    ctx.strokeStyle = C.brass; line(112, 360, 752, 360); ctx.strokeStyle = C.brassDim; line(112, 368, 752, 368);
    // drum with columns
    line(176, 360, 176, 300); line(688, 360, 688, 300); line(168, 300, 696, 300);
    for (let x = 200; x <= 664; x += 29) line(x, 352, x, 308);
    // dome and lantern
    ctx.strokeStyle = C.brass; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(432, 300, 256, 165, 0, Math.PI, TAU); ctx.stroke();
    ctx.strokeStyle = C.brassDim; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(432, 300, 236, 150, 0, Math.PI, TAU); ctx.stroke();
    for (const rx of [80, 160]) { ctx.beginPath(); ctx.ellipse(432, 300, rx, 165, 0, Math.PI, TAU); ctx.stroke(); }
    ctx.strokeStyle = C.brass; ctx.lineWidth = 1.5;
    ctx.strokeRect(416, 104, 32, 31);
    ctx.beginPath(); ctx.ellipse(432, 104, 16, 12, 0, Math.PI, TAU); ctx.stroke();
    // dimension line for the wire
    ctx.strokeStyle = C.brassDim; ctx.lineWidth = 1.2;
    line(300, PIV.y + 6, 300, PIV.y + L); line(292, PIV.y + 6, 308, PIV.y + 6); line(292, PIV.y + L, 308, PIV.y + L);
    font(600, 40, SERIF); text('67 m', 284, 430, { color: C.brassHi, align: 'right' });
    font(500, 22); text('wire', 284, 458, { color: C.soft, align: 'right' });
    font(500, 22); text('Diagram, not to scale · real speed: 16.5 s there and back', W / 2, 740, { color: C.soft, align: 'center' });
  });
}

function sceneAB(t) {
  // camera: side view → looking straight down
  const e = eio(seg(t, 9.6, 11.4));
  const cx = TOP.cx, cy = lerp(FLOOR.cy, TOP.cy, e), R = lerp(FLOOR.rx, TOP.R, e), squash = lerp(FLOOR.ry / FLOOR.rx, 1, e);
  const hrs = hoursB(t), ang = RATE_PARIS * hrs * DEG;

  building(1 - seg(t, 9.5, 10.4));
  dial(cx, cy, R, { squash });
  withAlpha(seg(t, 11.2, 11.8), () => traces(cx, cy, R, hrs, RATE_PARIS));

  const off = swingAt(t);
  // side view position of the bob, and its top view position on the swing line
  const th = Math.asin((off * AMP_SIDE) / L);
  const xs = PIV.x + L * Math.sin(th), ys = PIV.y + L * Math.cos(th);
  const [xt, yt] = swingLine(cx, cy, R, ang, off, { squash, lineA: seg(t, 10.6, 11.4) });
  const bx = lerp(xs, xt, e), by = lerp(ys, yt, e);

  // wire, side view
  withAlpha(1 - seg(t, 9.6, 10.5), () => {
    ctx.strokeStyle = 'rgba(243,217,158,0.85)'; ctx.lineWidth = 1.4; line(PIV.x, PIV.y, xs, ys);
    ctx.fillStyle = C.brassHi; circle(PIV.x, PIV.y, 3); ctx.fill();
  });
  // the bob, with its point in side view
  withAlpha(1 - e, () => {
    ctx.fillStyle = '#9A7232';
    ctx.beginPath(); ctx.moveTo(bx - 9, by + 17); ctx.lineTo(bx + 9, by + 17); ctx.lineTo(bx, by + 34); ctx.closePath(); ctx.fill();
  });
  bob(bx, by, lerp(22, 26, e));
  // bob label in side view
  withAlpha((1 - seg(t, 9.5, 10.2)) * seg(t, 1.2, 1.8), () => {
    ctx.strokeStyle = C.brassDim; ctx.lineWidth = 1.2; line(bx + 26, by - 6, 548, 560);
    font(600, 40, SERIF); text('28 kg', 556, 568, { color: C.brassHi });
    font(500, 22); text('brass-coated lead bob', 556, 596, { color: C.soft });
  });
}

/** Clock, turn and time-lapse note for scene B (kept as an overlay so it can fade while scene C starts). */
function readoutsB(t) {
  const hrs = hoursB(t);
  label('Hours', 96, 140, { color: C.soft });
  font(600, 54, SERIF); text(f1(hrs), 96, 192);
  label('Turned', 768, 140, { color: C.soft, align: 'right' });
  font(600, 54, SERIF); text(`${Math.round(RATE_PARIS * hrs)}°`, 768, 192, { align: 'right' });
  const note = [
    [11.4, 19.9, 'Time-lapse · 1 second = 1 hour'],
    [19.7, 24.9, 'Time-lapse · speeding up'],
    [24.7, 26.2, `One full turn · ${f1(T_PARIS)} hours`],
  ];
  for (const [a, b, s] of note) withAlpha(span(t, a, b, 0.3, 0.3), () => label(s, W / 2, 140, { align: 'center' }));
  withAlpha(1 - seg(t, 24.4, 24.9), () => { font(500, 22); text('diagram · swings not to scale', W / 2, 172, { color: C.soft, align: 'center' }); });
}

/** Hours on the clock in scene B: eases in, 1 h per second, then speeds up and settles on one full turn. */
function hoursB(t) {
  const t0 = 11.6, t1 = 12.6, t2 = 19.6, t3 = 24.6;
  if (t <= t0) return 0;
  if (t <= t1) return 0.5 * (t - t0) ** 2;
  const p0 = 0.5 + (t2 - t1);
  if (t <= t2) return 0.5 + (t - t1);
  if (t >= t3) return T_PARIS;
  const s = (t - t2) / (t3 - t2), D = t3 - t2;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2;
  return h00 * p0 + h10 * D * 1 + h01 * T_PARIS;
}

// ---------- C: why, at the North Pole ----------
const SPLIT = { y: 470, r: 165, left: 232, right: 632 };
function sceneC(t) {
  const e = eio(seg(t, 25.4, 26.8));
  const hrs = 9 * eio(seg(t, 27.4, 37.4));
  const turn = RATE_POLE * hrs * DEG;
  const off = swingAt(t);
  // right: seen from the floor (the dial from scene B moves here)
  const rx = lerp(TOP.cx, SPLIT.right, e), ry = lerp(TOP.cy, SPLIT.y, e), rr = lerp(TOP.R, SPLIT.r, e);
  dial(rx, ry, rr);
  withAlpha(1 - seg(t, 25.4, 26.2), () => traces(rx, ry, rr, T_PARIS, RATE_PARIS));
  bob(...swingLine(rx, ry, rr, turn, off), lerp(26, 17, e));
  // left: seen from space
  withAlpha(seg(t, 26.0, 26.8), () => {
    dial(SPLIT.left, SPLIT.y, SPLIT.r, { rot: -turn });
    bob(...swingLine(SPLIT.left, SPLIT.y, SPLIT.r, 0, off), 17);
  });
  withAlpha(seg(t, 26.4, 27.0), () => {
    label('At the North Pole', W / 2, 140, { align: 'center' });
    font(600, 46, SERIF); text(`${f1(hrs)} hours`, W / 2, 190, { align: 'center' });
    label('Seen from space', SPLIT.left, 250, { align: 'center', color: C.brassHi });
    label('Seen from the floor', SPLIT.right, 250, { align: 'center', color: C.brassHi });
  });
  withAlpha(seg(t, 29.8, 30.4), () => {
    arcArrow(SPLIT.left, SPLIT.y, SPLIT.r + 22, -0.25 * Math.PI, -0.75 * Math.PI, C.brass);
    font(500, 24); text('the floor turns', SPLIT.left, 690, { color: C.soft, align: 'center' });
  });
  withAlpha(seg(t, 31.2, 31.8), () => {
    arcArrow(SPLIT.right, SPLIT.y, SPLIT.r + 22, -0.75 * Math.PI, -0.25 * Math.PI, C.gold);
    font(500, 24); text('the swing seems to turn', SPLIT.right, 690, { color: C.soft, align: 'center' });
  });
}

// ---------- D: latitude ----------
const GLOBE = { x: 248, y: 452, r: 158 };
const SPOTS = [
  { key: 'pole', name: 'North Pole', where: '90° N', lat: 90, y: 268 },
  { key: 'paris', name: 'Paris', where: '48°52′ N', lat: LAT.paris, y: 450 },
  { key: 'equator', name: 'Equator', where: '0°', lat: 0, y: 632 },
];
const MINI = { x: 540, r: 60 }, LX = 616;
function globe() {
  const { x, y, r } = GLOBE;
  const pg = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.1, x, y, r);
  pg.addColorStop(0, 'rgba(48,60,92,0.95)'); pg.addColorStop(1, 'rgba(8,13,30,0.96)');
  circle(x, y, r); ctx.fillStyle = pg; ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = C.brassFaint;
  for (const lon of [30, 60]) { ctx.beginPath(); ctx.ellipse(x, y, r * Math.sin(lon * DEG), r, 0, 0, TAU); ctx.stroke(); }
  line(x, y - r, x, y + r);
  for (const lat of [-60, -30, 30, 60]) { const ry0 = y - r * sinDeg(lat), rx0 = r * Math.cos(lat * DEG); ctx.beginPath(); ctx.ellipse(x, ry0, rx0, rx0 * 0.16, 0, 0, TAU); ctx.stroke(); }
  // equator and the latitude of Paris
  ctx.strokeStyle = C.brass; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.16, 0, 0, TAU); ctx.stroke();
  const py = y - r * sinDeg(LAT.paris), prx = r * Math.cos(LAT.paris * DEG);
  ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.ellipse(x, py, prx, prx * 0.16, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.shadowColor = 'rgba(243,217,158,0.35)'; ctx.shadowBlur = 8;
  ctx.strokeStyle = C.brass; ctx.lineWidth = 2; circle(x, y, r); ctx.stroke(); ctx.shadowBlur = 0;
  // axis and spin arrow
  ctx.strokeStyle = C.brassDim; ctx.lineWidth = 1.4; line(x, y - r - 34, x, y - r); line(x, y + r, x, y + r + 34);
  // Earth turns west to east: the near side of this ring moves to the right
  const yA = y - r - 18, a = 0.15 * Math.PI;
  ctx.strokeStyle = C.brass; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, yA, 34, 8, 0, a, Math.PI - a); ctx.stroke();
  const hx = x + 34 * Math.cos(a), hy = yA + 8 * Math.sin(a);
  let dx = 34 * Math.sin(a), dy = -8 * Math.cos(a); const n = Math.hypot(dx, dy); dx /= n; dy /= n;
  ctx.fillStyle = C.brass; ctx.beginPath();
  ctx.moveTo(hx + dx * 11, hy + dy * 11); ctx.lineTo(hx - dy * 5, hy + dx * 5); ctx.lineTo(hx + dy * 5, hy - dx * 5); ctx.closePath(); ctx.fill();
}
const spotPoint = (lat) => [GLOBE.x + GLOBE.r * Math.cos(lat * DEG), GLOBE.y - GLOBE.r * sinDeg(lat)];

function sceneD(t) {
  const hrs = SIDEREAL_H * eio(seg(t, 41.4, 48.6));
  const off = swingAt(t);
  globe();
  font(500, 22); text('turn per day = 360° × sin(latitude)', GLOBE.x, 676, { color: C.soft, align: 'center' });
  label('Time', 96, 140, { color: C.soft });
  font(600, 46, SERIF); text(hm(hrs), 96, 190);
  label('Full turn', LX, 186, { color: C.soft });
  SPOTS.forEach((sp, i) => {
    const show = seg(t, 38.8 + i * 0.35, 39.4 + i * 0.35);
    withAlpha(show, () => {
      const [px, py] = spotPoint(sp.lat);
      ctx.strokeStyle = C.brassDim; ctx.lineWidth = 1.2; line(px, py, MINI.x - MINI.r - 8, sp.y);
      ctx.fillStyle = C.gold; circle(px, py, 5); ctx.fill();
      ctx.strokeStyle = 'rgba(246,198,97,0.5)'; circle(px, py, 10); ctx.stroke();
      dial(MINI.x, sp.y, MINI.r, { numerals: false });
      bob(...swingLine(MINI.x, sp.y, MINI.r, ratePerHour(sp.lat) * hrs * DEG, off, { reach: 0.78 }), 8, 0.6);
      label(sp.name, LX, sp.y - 30, { color: C.brass });
      font(500, 22); text(sp.where, LX, sp.y - 2, { color: C.soft });
      const tt = turnHours(sp.lat);
      const value = tt === Infinity ? 'never' : sp.lat === 90 ? hm(tt) : `${f1(tt)} h`;
      font(600, 40, SERIF); text(value, LX, sp.y + 38, { color: sp.key === 'paris' ? C.gold : C.ivory });
    });
  });
}

// ---------- E: payoff ----------
function sceneE(t) {
  const p = eout(seg(t, 50.4, 51.2));
  withAlpha(0.55, () => {
    dial(TOP.cx, 466, 270, { numerals: false });
    traces(TOP.cx, 466, 270, T_PARIS, RATE_PARIS);
  });
  const g = ctx.createRadialGradient(W / 2, 420, 40, W / 2, 440, 420);
  g.addColorStop(0, 'rgba(5,9,22,0.85)'); g.addColorStop(1, 'rgba(5,9,22,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 120, W, 640);
  withAlpha(p, () => {
    font(600, 88, SERIF); text('Foucault’s pendulum', W / 2, 400 + (1 - p) * 16, { align: 'center', base: 'middle' });
    ctx.fillStyle = C.brass; ctx.fillRect(W / 2 - 140 * eout(seg(t, 50.8, 51.6)), 456, 280 * eout(seg(t, 50.8, 51.6)), 2);
    font(500, 30); text('Panthéon, Paris · 1851', W / 2, 508, { color: C.soft, align: 'center', base: 'middle' });
    font(500, 22); text('Source: Wikipedia, “Foucault pendulum”', W / 2, 700, { color: C.soft, align: 'center', base: 'middle' });
  });
}

Kit.scene({
  width: W, height: H, duration: 54.5,
  fonts: [{ family: 'Cormorant Garamond', file: 'CormorantGaramond.woff2', weight: '300 700' }, { family: 'Source Sans 3', file: 'SourceSans3.woff2', weight: '200 900' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const scenes = [[sceneAB, [0, 25.4], 0, 0], [readoutsB, [11.2, 26.0], 0.6, 0.6], [sceneC, [25.4, 38.4], 0, 0.5], [sceneD, T.D, 0.5], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.4, fo = 0.4] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    k.captions(t, CUES, { x: W / 2, y: 830, maxW: 744, size: 44, lh: 56, weight: 600, family: SANS, ink: C.ivory, marks: { '*': C.gold, '~': C.star } });
  },
});
