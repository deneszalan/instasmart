// Explainer for space-phobos-rises-in-the-west: before dawn on 20 October 2026 (Japan time) JAXA launched the
// Martian Moons eXploration probe, MMX, to bring back a sample of Mars's moon Phobos. Phobos circles Mars faster
// than Mars turns, so from the ground it rises in the west and sets in the east, and the tide it raises in Mars
// is slowly pulling it down. Look: a rust-and-umber night over Mars, ochre for Mars, pale stone for Phobos, a
// cold teal for orbits and a brass line for the orbit that keeps pace with the ground. Exo 2 (a spacey
// geometric sans) for titles and captions, Azeret Mono (an instrument-panel monospace) for numbers and labels.
//
// Facts: ESA, "MMX lifts off to Mars's moon Phobos" (October 2026): launched on an H3 rocket from the
// Tanegashima Space Center at 04:41 JST on 20 October 2026 (19 October in Europe); JAXA leads with NASA, CNES,
// DLR and ESA; first to orbit Phobos, collect samples from its surface and return from the Mars system.
// The Guardian (19 October 2026): lifted off before dawn from Tanegashima; reaches Mars orbit next August;
// at least 10 g of soil and rock from Phobos; return in 2031; Phobos orbits Mars three times a day, about 6,000 km
// above its surface; the rover Idefix. BBC News (19 October 2026): sample capsule back in 2031; hypotheses: debris
// from an impact on Mars, or captured asteroids. NASA, "Phobos": orbits Mars three times a day; 27 × 22 × 18 km;
// nearing Mars at about 1.8 m every hundred years; at that rate it will crash into Mars in 50 million years or
// break up into a ring. NASA NSSDC Mars fact sheet: Mars GM 42,828 km³/s², equatorial radius 3,396.2 km,
// sidereal rotation 24.6229 h; Phobos semimajor axis 9,378 km, period 0.31891 days; Deimos 23,459 km,
// 1.26244 days. Wikipedia, "Phobos (moon)": rises in the west, crosses the sky in 4 h 15 min or less, sets in the
// east; rises about twice each Martian day, every 11 h 6 min; orbits below the synchronous orbit radius; tidal
// deceleration. NASA JPL (Apollo 11 laser ranging): the Moon recedes from Earth about 3.8 cm a year.
//
// Computed here: Phobos's period 7.654 h (7 h 39 min); 3.2 orbits per Mars rotation; height above the equator
// 9,378 - 3,396 = 5,982 km; time between risings 1 / (1/7.654 - 1/24.623) = 11.1 h; Phobos is above the horizon
// of an equator observer over 2 acos(3,396 / 9,378) = 137.5° of that relative turn, 4.24 h; the synchronous
// radius (GM T² / 4π²)^(1/3) = 20,428 km. The bulges are drawn hugely exaggerated, and the opening arc from Earth to
// Mars is illustrative, not MMX's trajectory.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.6  The launch and the goal: 10 g of Phobos by 2031.
//  B  9.6–18.8  To scale: 6,000 km up, 7 h 39 min a lap; Mars turns in 24 h 37 min.
//  C 18.8–32.6  Overtaking the ground: rises in the west, sets in the east; every 11 hours.
//  D 32.6–41.6  The keep-pace orbit at 20,400 km; Deimos outside it.
//  E 41.6–55.4  Tides: the lagging bulge pulls Phobos down; Earth's leads, so the Moon drifts out.
//  F 55.4–64.8  A ring in 50 million years; what the sample will show.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#140806', bg1: '#2a120c', ink: '#f7ede4', soft: 'rgba(247,237,228,0.74)', faint: 'rgba(247,237,228,0.28)',
  mars: '#c8643c', marsHi: '#e48a5a', marsLo: '#7a3220', stone: '#bcb2a6', stoneLo: '#7d746b',
  orbit: '#6fd3d0', sync: '#f2bf4f', earth: '#5aa9e6', panel: 'rgba(24,10,7,0.88)', warn: '#ff8f6b',
};
const SANS = 'Exo 2', MONO = 'Azeret Mono';

let k, ctx;
const font = (w, s, f = MONO) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const R = Math.PI / 180, TAU = Math.PI * 2;

// ---------- the numbers ----------
const GM = 42828, R_MARS = 3396.2, T_MARS = 24.6229;
const A_PH = 9378, T_PH = 0.31891 * 24, A_DE = 23459, T_DE = 1.26244 * 24;
const HEIGHT = A_PH - R_MARS; // 5,982 km
const PER_SOL = T_MARS / T_PH; // 3.2
const SYNODIC = 1 / (1 / T_PH - 1 / T_MARS); // 11.1 h between risings
const ARC = 2 * Math.acos(R_MARS / A_PH) / R; // 137.5° of relative turn above the horizon
const UP = (ARC / 360) * SYNODIC; // 4.24 h
const SYNC = Math.cbrt((GM * (T_MARS * 3600) ** 2) / (4 * Math.PI ** 2)); // 20,428 km
const hm = (h) => { const m = Math.round(h * 60); return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`; };
/** The same, with non-breaking spaces, so a caption never splits it. */
const hmc = (h) => hm(h).replace(/ /g, '\u00a0');
const near5 = (h) => { const m = Math.round((h * 60) / 5) * 5; return `${Math.floor(m / 60)} h ${m % 60} min`; };
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const round100 = (n) => fmt(Math.round(n / 100) * 100);

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'Before dawn on *20 October 2026*, Japan’s space agency JAXA launched the probe *MMX* to Mars.'],
  [5.0, 9.4, 'Its goal: land on Mars’s moon *Phobos* and bring at least *10 grams* of it to Earth in *2031*.'],
  [9.6, 14.0, `Phobos circles only about *${fmt(Math.round(HEIGHT / 1000) * 1000)} km* above the ground, and one lap takes it just *${hmc(T_PH)}*.`],
  [14.2, 18.6, `Mars turns once in ~${hmc(T_MARS)}~, so Phobos goes round about *three times* in each Martian day.`],
  [18.8, 23.2, 'Mars’s ground moves east as the planet turns. Phobos goes east faster, so it overtakes the ground.'],
  [23.4, 27.8, `So from Mars, Phobos *rises in the west* and *sets in the east*, about *${Math.round(UP)} hours* later.`],
  [28.0, 32.4, `Then it is gone for about ${Math.round(SYNODIC - UP)} hours. It rises every *${Math.round(SYNODIC)} hours*: twice in each Martian day.`],
  [32.6, 37.0, `A moon ^${round100(SYNC)} km^ from Mars’s centre would keep pace with the ground and seem to hang still.`],
  [37.2, 41.6, 'The outer moon, *Deimos*, is beyond that line, so it lags behind the ground and rises in the east.'],
  [41.8, 46.2, 'Phobos’s pull raises a slight ~bulge~ in Mars. Mars turns slower than Phobos goes, so it lags behind.'],
  [46.4, 50.8, 'The bulge tugs Phobos back, so it sinks: about *1.8 metres* closer to Mars every century.'],
  [51.0, 55.4, 'Earth spins faster than our Moon orbits: its ~bulge~ runs ahead, and the Moon drifts out *3.8 cm* a year.'],
  [55.6, 60.0, 'NASA expects Phobos to crash into Mars or break up into a ring in about *50 million years*.'],
  [60.2, 64.6, 'MMX’s grains should tell how Phobos formed: from debris of a giant impact, or as a captured asteroid.'],
];

// ---------- background: a dusty night ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(0.7, C.bg0); lg.addColorStop(1, '#0c0504');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 170; i++) {
    const x = r() * W, y = r() * 780, a = 0.15 + r() * 0.5, rr = r() < 0.1 ? 1.6 : 0.9;
    g.fillStyle = `rgba(255,236,220,${a})`; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill();
  }
}

// ---------- pieces ----------
const P = (cx, cy, r, ang) => [cx + r * Math.cos(ang), cy - r * Math.sin(ang)];

/** Mars seen from above its north pole, turned by `rot` radians (anticlockwise). */
function mars(cx, cy, r, rot = 0) {
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  g.addColorStop(0, C.marsHi); g.addColorStop(0.7, C.mars); g.addColorStop(1, C.marsLo);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
  ctx.fillStyle = 'rgba(90,34,20,0.55)';
  for (const [a, d, s] of [[0.3, 0.55, 0.22], [1.6, 0.7, 0.16], [2.6, 0.45, 0.2], [3.9, 0.66, 0.25], [5.1, 0.5, 0.14]]) {
    const [x, y] = P(cx, cy, r * d, a + rot);
    ctx.beginPath(); ctx.ellipse(x, y, r * s, r * s * 0.6, -(a + rot), 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,245,235,0.75)'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.16, 0, TAU); ctx.fill();
  ctx.restore();
}

/** A lumpy Phobos. */
function phobos(x, y, s = 1, rot = 0, col = C.stone) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.beginPath();
  const pts = 14;
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * TAU, rr = 1 + 0.12 * Math.sin(3 * a + 1) + 0.07 * Math.cos(5 * a);
    const px = Math.cos(a) * 13 * rr, py = Math.sin(a) * 10 * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.fill();
  ctx.fillStyle = 'rgba(60,52,46,0.55)';
  ctx.beginPath(); ctx.arc(-4, -2, 3.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(5, 3, 2, 0, TAU); ctx.fill();
  ctx.restore();
}

function ring(cx, cy, r, col, w = 2, dash = []) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
}

function arrow(x0, y0, x1, y1, col, w = 4, head = 14) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head);
  ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head); ctx.closePath(); ctx.fill();
  ctx.lineCap = 'butt';
}

/** An arrow along a circle from angle a0 to a1 (radians, anticlockwise when a1 > a0). */
function arcArrow(cx, cy, r, a0, a1, col, w = 4) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
  const n = 30;
  for (let i = 0; i <= n; i++) { const [x, y] = P(cx, cy, r, lerp(a0, a1, i / n)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  const [x1, y1] = P(cx, cy, r, a1), [x0, y0] = P(cx, cy, r, a1 - Math.sign(a1 - a0) * 0.08);
  arrow(x0, y0, x1, y1, col, w, 16);
}

function chip(x, y, w, h, fn) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); fn(); }

function flag(cx, cy, r, ang, col = C.ink) {
  const [x0, y0] = P(cx, cy, r, ang), [x1, y1] = P(cx, cy, r + 18, ang);
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x1, y1, 5, 0, TAU); ctx.fill();
}

// ---------- A: the launch ----------
function sceneA(t) {
  const a = span(t, 0, 9.6, 0.01, 0.5);
  if (a <= 0) return;
  A(a, () => {
    font(800, 62, SANS); text('Next stop: Phobos', 52, 102);
    font(500, 21); text('JAXA · MMX · H3 ROCKET · 20 OCTOBER 2026', 54, 150, { color: C.orbit, spacing: '1px' });
    const E = [150, 520], M = [680, 400];
    // Earth with Japan's launch site, Mars with Phobos
    ctx.fillStyle = C.earth; ctx.beginPath(); ctx.arc(E[0], E[1], 46, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(120,200,140,0.7)'; ctx.beginPath(); ctx.ellipse(E[0] + 14, E[1] - 8, 16, 22, 0.4, 0, TAU); ctx.fill();
    font(500, 22); text('Tanegashima, Japan', E[0], E[1] + 78, { color: C.soft, align: 'center' });
    mars(M[0], M[1], 82, t * 0.05);
    const pa = t * 1.6;
    const [px, py] = P(M[0], M[1], 124, pa);
    ring(M[0], M[1], 124, 'rgba(111,211,208,0.35)', 2, [5, 7]);
    phobos(px, py, 0.9, pa);
    font(500, 22); text('Mars', M[0], M[1] + 160, { color: C.soft, align: 'center' });
    // an illustrative path
    const p = eio(seg(t, 0.8, 8.6)), cx0 = (E[0] + M[0]) / 2, cy0 = 300;
    const bez = (u) => [(1 - u) ** 2 * E[0] + 2 * (1 - u) * u * cx0 + u * u * (M[0] - 120), (1 - u) ** 2 * (E[1] - 50) + 2 * (1 - u) * u * cy0 + u * u * (M[1] + 40)];
    ctx.fillStyle = 'rgba(242,191,79,0.7)';
    for (let i = 0; i <= 60 * p; i++) { const [x, y] = bez(i / 60); ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill(); }
    const [qx, qy] = bez(p);
    ctx.fillStyle = C.sync; ctx.beginPath(); ctx.arc(qx, qy, 7, 0, TAU); ctx.fill();
    font(400, 18); text('path illustrative', cx0, 268, { color: C.faint, align: 'center' });
    // the goal
    A(seg(t, 5.1, 5.7), () => {
      chip(52, 616, 760, 132, () => {
        phobos(130, 682, 3.1, -0.3);
        font(700, 40, SANS); text('≥ 10 g of Phobos', 214, 660, { color: C.sync });
        font(400, 22); text('back on Earth in 2031', 216, 706, { color: C.soft });
        font(400, 20); text('27 × 22 × 18 km', 680, 706, { color: C.stone, align: 'center' });
      });
    });
  });
}

// ---------- B: to scale ----------
const CB = [432, 432], SB = 270 / A_PH;
/** Simulated hours shown in scene B. */
const hoursB = (t) => (t < 14.1 ? lerp(0, T_PH, eio(seg(t, 10.2, 13.6))) : T_PH + lerp(0, T_MARS, seg(t, 14.4, 18.2)));
function sceneB(t) {
  const a = span(t, 9.6, 18.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const h = hoursB(t), rm = R_MARS * SB, rp = A_PH * SB;
    font(500, 20); text('seen from above Mars’s north pole · to scale', 52, 150, { color: C.soft });
    ring(CB[0], CB[1], rp, 'rgba(111,211,208,0.6)', 2, [6, 6]);
    const rot = (h / T_MARS) * TAU;
    mars(CB[0], CB[1], rm, rot);
    flag(CB[0], CB[1], rm, rot, C.ink);
    const ap = (h / T_PH) * TAU;
    const [px, py] = P(CB[0], CB[1], rp, ap);
    phobos(px, py, 1.5, -ap);
    // the height
    A(span(t, 9.8, 14.1, 0.4, 0.3), () => {
      const [x0, y0] = P(CB[0], CB[1], rm, -0.7), [x1, y1] = P(CB[0], CB[1], rp, -0.7);
      ctx.strokeStyle = C.sync; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      font(700, 28); text(`${fmt(HEIGHT)} km`, (x0 + x1) / 2 + 22, (y0 + y1) / 2 + 26, { color: C.sync });
      chip(52, 186, 300, 86, () => {
        font(400, 20); text('one lap of Phobos', 72, 212, { color: C.soft });
        font(700, 34); text(hm(T_PH), 72, 250, { color: C.orbit });
      });
    });
    // one Martian day
    A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
      const hh = h - T_PH;
      chip(52, 186, 300, 86, () => {
        font(400, 20); text('time on Mars', 72, 212, { color: C.soft });
        font(700, 34); text(hm(Math.max(0, hh)), 72, 250, { color: C.ink });
      });
      chip(560, 600, 252, 112, () => {
        font(400, 20); text('Phobos laps', 580, 628, { color: C.soft });
        font(700, 44); text(`× ${(Math.max(0, hh) / T_PH).toFixed(1)}`, 580, 676, { color: C.orbit });
      });
      font(500, 20); text('Mars turns once:', 52, 640, { color: C.soft });
      font(700, 26); text(hm(T_MARS), 52, 672, { color: C.marsHi });
    });
  });
}

// ---------- C: overtaking the ground ----------
function sceneC1(t) {
  const a = span(t, 18.8, 23.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const c = [360, 440], rm = 150, rp = 290;
    const h = lerp(-3.2, 3.2, seg(t, 19.0, 23.2));
    const obs = (h / T_MARS) * TAU, ph = (h / T_PH) * TAU;
    ring(c[0], c[1], rp, 'rgba(111,211,208,0.45)', 2, [6, 6]);
    mars(c[0], c[1], rm, obs);
    font(400, 18); text('not to scale', 52, 150, { color: C.faint });
    // the observer's horizon: a line touching the ground
    const [ox, oy] = P(c[0], c[1], rm, obs), ex = -Math.sin(obs), ey = -Math.cos(obs);
    ctx.strokeStyle = 'rgba(247,237,228,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox - ex * 230, oy - ey * 230); ctx.lineTo(ox + ex * 230, oy + ey * 230); ctx.stroke();
    font(600, 22); text('east', ox + ex * 250 + 6, oy + ey * 250 - 6, { color: C.ink, align: 'center' });
    text('west', ox - ex * 250 + 6, oy - ey * 250 + 8, { color: C.ink, align: 'center' });
    flag(c[0], c[1], rm, obs, C.sync);
    font(500, 20); text('you', ox + Math.cos(obs) * 44 + 10, oy - Math.sin(obs) * 44, { color: C.sync });
    // arrows: the ground and Phobos both go east, Phobos faster
    arcArrow(c[0], c[1], rm + 30, obs + 0.25, obs + 0.55, C.marsHi, 4);
    const [px, py] = P(c[0], c[1], rp, ph);
    arcArrow(c[0], c[1], rp + 28, ph + 0.1, ph + 0.62, C.orbit, 4);
    phobos(px, py, 1.6, -ph);
    chip(560, 170, 260, 112, () => {
      font(600, 20); text('ground: slow east', 580, 202, { color: C.marsHi });
      font(600, 20); text('Phobos: fast east', 580, 244, { color: C.orbit });
    });
    // above or below the horizon
    const rel = ((ph - obs + Math.PI) % TAU + TAU) % TAU - Math.PI, up = Math.abs(rel) < (ARC / 2) * R;
    chip(560, 600, 260, 66, () => { font(700, 24); text(up ? 'Phobos is up' : 'below your horizon', 690, 633, { color: up ? C.orbit : C.soft, align: 'center' }); });
  });
}

const GROUND = 640;
function sceneC2(t) {
  const a = span(t, 23.4, 28.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // sky and ground, looking north from the equator
    ctx.fillStyle = '#5a2a18'; ctx.fillRect(0, GROUND, W, 120);
    ctx.fillStyle = '#3d1c11';
    ctx.beginPath(); ctx.moveTo(0, GROUND);
    for (let x = 0; x <= W; x += 24) ctx.lineTo(x, GROUND - 8 - 10 * Math.sin(x / 47) - 6 * Math.sin(x / 13));
    ctx.lineTo(W, GROUND); ctx.closePath(); ctx.fill();
    font(700, 34); text('W', 46, GROUND + 50, { color: C.ink, align: 'center' });
    text('E', W - 46, GROUND + 50, { color: C.ink, align: 'center' });
    font(500, 20); text('looking north from Mars’s equator', W / 2, GROUND + 52, { color: C.soft, align: 'center' });
    // Phobos's path: from the western horizon over the top to the eastern
    const u = seg(t, 23.6, 27.6), ang = Math.PI * (1 - u), rx = 360, ry = 400, cx = W / 2;
    ctx.strokeStyle = 'rgba(111,211,208,0.35)'; ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
    ctx.beginPath(); ctx.ellipse(cx, GROUND, rx, ry, 0, Math.PI, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.orbit; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(cx, GROUND, rx, ry, 0, Math.PI, Math.PI + Math.PI * u); ctx.stroke();
    const px = cx + rx * Math.cos(ang), py = GROUND - ry * Math.sin(ang);
    phobos(px, py, 2.0, u * 2);
    // the clock since it rose
    chip(52, 150, 300, 86, () => {
      font(400, 20); text('since Phobos rose', 72, 176, { color: C.soft });
      font(700, 34); text(hm(UP * u), 72, 214, { color: C.orbit });
    });
    // the Sun and stars go the other way
    A(seg(t, 24.6, 25.2), () => {
      arrow(560, 560, 304, 560, C.sync, 3, 14);
      font(500, 20); text('Sun and stars go east to west', W / 2, 520, { color: C.sync, align: 'center' });
    });
  });
}

function sceneC3(t) {
  const a = span(t, 28.0, 32.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const x0 = 70, x1 = 794, y = 470, X = (h) => lerp(x0, x1, h / (T_MARS * 1.25));
    font(700, 40, SANS); text('One spot on the equator', 52, 160);
    font(500, 22); text('hours after a moonrise', 52, 206, { color: C.soft });
    ctx.fillStyle = 'rgba(247,237,228,0.12)'; k.rrect(x0, y - 22, x1 - x0, 44, 10); ctx.fill();
    const p = seg(t, 28.2, 31.6), now = T_MARS * 1.25 * p;
    for (let r0 = 0; r0 < T_MARS * 1.25; r0 += SYNODIC) {
      const r1 = Math.min(r0 + UP, now);
      if (r1 <= r0) continue;
      ctx.fillStyle = C.orbit; k.rrect(X(r0), y - 22, X(r1) - X(r0), 44, 10); ctx.fill();
      phobos(X(r0 + UP / 2), y - 58, 1.3, 0);
    }
    // the Martian day
    ctx.strokeStyle = C.marsHi; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(X(0), y + 64); ctx.lineTo(X(T_MARS), y + 64); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(0), y + 54); ctx.lineTo(X(0), y + 74); ctx.moveTo(X(T_MARS), y + 54); ctx.lineTo(X(T_MARS), y + 74); ctx.stroke();
    font(600, 22); text(`one Martian day, ${hm(T_MARS)}`, X(T_MARS / 2), y + 98, { color: C.marsHi, align: 'center' });
    for (const hh of [0, 6, 12, 18, 24, 30]) { font(400, 18); text(`${hh} h`, X(hh), y + 32, { color: C.faint, align: 'center' }); }
    A(seg(t, 29.4, 30.0), () => {
      font(700, 26); text(`up ${near5(UP)}`, X(0), y - 112, { color: C.orbit });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(X(0), y + 150); ctx.lineTo(X(0), y + 164); ctx.lineTo(X(SYNODIC), y + 164); ctx.lineTo(X(SYNODIC), y + 150); ctx.stroke();
      text(`rises every ${hm(SYNODIC)}`, X(0), y + 196, { color: C.ink });
    });
  });
}

// ---------- D: the keep-pace orbit ----------
const CD = [432, 480], SD = 220 / A_DE;
function sceneD(t) {
  const a = span(t, 32.6, 41.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const h = (t - 32.6) * 5.2, rm = R_MARS * SD;
    font(500, 20); text('to scale', 52, 150, { color: C.soft });
    const rot = (h / T_MARS) * TAU;
    ring(CD[0], CD[1], A_PH * SD, 'rgba(111,211,208,0.55)', 2, [5, 6]);
    ring(CD[0], CD[1], A_DE * SD, 'rgba(188,178,166,0.5)', 2, [5, 6]);
    // the keep-pace line and a ghost moon riding it above the flag
    ctx.save(); ctx.shadowColor = C.sync; ctx.shadowBlur = 10;
    ring(CD[0], CD[1], SYNC * SD, C.sync, 3, [10, 7]); ctx.restore();
    mars(CD[0], CD[1], rm, rot);
    flag(CD[0], CD[1], rm, rot, C.ink);
    ctx.strokeStyle = 'rgba(242,191,79,0.35)'; ctx.lineWidth = 2;
    const [gx, gy] = P(CD[0], CD[1], SYNC * SD, rot), [fx, fy] = P(CD[0], CD[1], rm + 18, rot);
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(gx, gy); ctx.stroke();
    ctx.strokeStyle = C.sync; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(gx, gy, 10, 0, TAU); ctx.stroke();
    const ap = (h / T_PH) * TAU + 1.2, ad = (h / T_DE) * TAU + 0.5;
    phobos(...P(CD[0], CD[1], A_PH * SD, ap), 0.9, -ap);
    phobos(...P(CD[0], CD[1], A_DE * SD, ad), 0.7, -ad, C.stoneLo);
    // labels
    font(600, 20);
    text(`Phobos ${hm(T_PH)}`, 52, 196, { color: C.orbit });
    text(`keep pace: ${round100(SYNC)} km, ${hm(T_MARS)}`, 52, 226, { color: C.sync });
    text(`Deimos ${hm(T_DE)}`, 52, 256, { color: C.stone });
    // Deimos falls behind the flag
    A(span(t, 37.2, 41.8, 0.4, 0.3), () => {
      const lag = rot - ad;
      chip(620, 630, 200, 100, () => {
        font(400, 20); text('Deimos lags', 640, 658, { color: C.soft });
        font(700, 34); text(`${Math.round((((lag / R) % 360) + 360) % 360)}°`, 640, 700, { color: C.stone });
      });
    });
  });
}

// ---------- E: tides ----------
function bulgy(cx, cy, r, axis, draw, fill = 'rgba(228,138,90,0.30)') {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-axis);
  ctx.beginPath(); ctx.ellipse(0, 0, r * 1.16, r * 0.9, 0, 0, TAU); ctx.restore();
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]);
  draw();
}
function sceneE(t) {
  const a = span(t, 41.6, 55.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const c = [432, 440];
    font(400, 18); text('not to scale · bulges hugely exaggerated', 52, 150, { color: C.faint });
    if (t < 51.0) {
      const ap = 0.3 + (t - 41.8) * 0.06, lag = 28 * R, rr = 270 - 26 * eio(seg(t, 47.0, 50.4));
      bulgy(c[0], c[1], 130, ap - lag, () => mars(c[0], c[1], 130, -t * 0.05));
      A(span(t, 41.6, 51.0, 0.5, 0.3), () => {
        // the bulge axis, Phobos and their spins
        const [b1x, b1y] = P(c[0], c[1], 160, ap - lag);
        ctx.fillStyle = C.marsHi; ctx.beginPath(); ctx.arc(b1x, b1y, 6, 0, TAU); ctx.fill();
        font(600, 22); text('bulge', b1x + 16, b1y + 18, { color: C.marsHi });
        ring(c[0], c[1], 270, 'rgba(111,211,208,0.3)', 2, [5, 7]);
        const [px, py] = P(c[0], c[1], rr, ap);
        arcArrow(c[0], c[1], rr + 34, ap + 0.05, ap + 0.5, C.orbit, 4);
        arcArrow(c[0], c[1], 96, ap - lag - 0.3, ap - lag + 0.05, C.ink, 3);
        phobos(px, py, 1.8, -ap);
        font(600, 22); text('Phobos', px + 26, py - 30, { color: C.orbit });
        A(seg(t, 46.4, 47.0), () => {
          const [qx, qy] = P(c[0], c[1], rr - 4, ap - 0.32);
          arrow(px, py, qx, qy, C.warn, 5, 18);
          font(700, 22); text('tug back', qx - 10, qy + 34, { color: C.warn, align: 'center' });
          // the inward spiral, exaggerated
          ctx.strokeStyle = 'rgba(255,143,107,0.6)'; ctx.lineWidth = 3; ctx.beginPath();
          for (let i = 0; i <= 40; i++) { const u = i / 40, [x, y] = P(c[0], c[1], lerp(270, rr, u), ap - 1.6 + 1.6 * u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.stroke();
          chip(560, 640, 260, 96, () => {
            font(700, 32); text('1.8 m', 580, 678, { color: C.warn });
            font(400, 20); text('closer per century', 580, 712, { color: C.soft });
          });
        });
      });
    } else {
      // Earth and the Moon: the bulge runs ahead
      const am = 1.0 + (t - 51.0) * 0.1, lead = 28 * R, rr = 250 + 22 * eio(seg(t, 52.0, 55.0));
      bulgy(c[0], c[1], 120, am + lead, () => {
        ctx.fillStyle = C.earth; ctx.beginPath(); ctx.arc(c[0], c[1], 120, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(120,200,140,0.6)'; ctx.beginPath(); ctx.ellipse(c[0] - 30, c[1] + 10, 40, 56, 0.5, 0, TAU); ctx.fill();
      }, 'rgba(90,169,230,0.30)');
      const [b1x, b1y] = P(c[0], c[1], 150, am + lead);
      ctx.fillStyle = C.earth; ctx.beginPath(); ctx.arc(b1x, b1y, 6, 0, TAU); ctx.fill();
      font(600, 22); text('bulge', b1x - 70, b1y - 10, { color: C.earth });
      arcArrow(c[0], c[1], 90, am + lead - 0.3, am + lead + 0.4, C.ink, 3);
      ring(c[0], c[1], 250, 'rgba(247,237,228,0.25)', 2, [5, 7]);
      const [mx, my] = P(c[0], c[1], rr, am);
      ctx.fillStyle = '#d9d4cc'; ctx.beginPath(); ctx.arc(mx, my, 22, 0, TAU); ctx.fill();
      const [qx, qy] = P(c[0], c[1], rr + 6, am + 0.3);
      arrow(mx, my, qx, qy, C.sync, 5, 18);
      font(600, 22); text('our Moon', mx + 34, my + 20, { color: C.ink });
      chip(560, 640, 260, 96, () => {
        font(700, 32); text('+3.8 cm', 580, 678, { color: C.sync });
        font(400, 20); text('farther each year', 580, 712, { color: C.soft });
      });
      font(600, 22); text('Earth', c[0], c[1], { color: '#0b2a44', align: 'center' });
    }
  });
}

// ---------- F: the end, and the sample ----------
function sceneF(t) {
  const a = span(t, 55.4, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 55.4, 60.2, 0.01, 0.4), () => {
      const c = [432, 430], rm = 130, rr = 2.1 * rm;
      mars(c[0], c[1], rm, -t * 0.05);
      const p = eio(seg(t, 56.0, 59.4));
      let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 220; i++) {
        const base = 0.6 + (r() - 0.5) * 0.3, spread = r() * TAU, rad = rr + (r() - 0.5) * 34;
        const ang = lerp(base, base + spread, p) + t * 0.2;
        const [x, y] = P(c[0], c[1], lerp(rr, rad, p), ang);
        ctx.fillStyle = `rgba(188,178,166,${0.4 + 0.5 * r()})`; ctx.beginPath(); ctx.arc(x, y, 1.4 + r() * 2, 0, TAU); ctx.fill();
      }
      A(1 - seg(t, 56.0, 57.0), () => phobos(...P(c[0], c[1], rr, 0.6 + t * 0.2), 1.6, 0));
      chip(52, 150, 360, 96, () => {
        font(700, 34); text('~50 million years', 72, 186, { color: C.warn });
        font(400, 20); text('a crash, or a ring (NASA)', 72, 222, { color: C.soft });
      });
    });
    A(span(t, 60.2, 64.8, 0.4, 0.01), () => {
      font(800, 44, SANS); text('Where did Phobos come from?', W / 2, 168, { color: C.ink, align: 'center' });
      // two ideas
      chip(52, 236, 360, 300, () => {
        mars(150, 340, 54, 0);
        ctx.fillStyle = C.warn; for (let i = 0; i < 9; i++) { const [x, y] = P(150, 340, 70 + (i % 3) * 16, 0.2 + i * 0.12); ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill(); }
        phobos(310, 300, 1.4, 0);
        font(700, 26, SANS); text('debris of a giant', 232, 452, { color: C.ink, align: 'center' });
        text('impact on Mars', 232, 486, { color: C.ink, align: 'center' });
      });
      chip(452, 236, 360, 300, () => {
        mars(700, 360, 54, 0);
        ctx.strokeStyle = 'rgba(188,178,166,0.6)'; ctx.lineWidth = 3; ctx.setLineDash([5, 6]);
        ctx.beginPath(); ctx.moveTo(480, 270); ctx.quadraticCurveTo(620, 260, 640, 330); ctx.stroke(); ctx.setLineDash([]);
        phobos(640, 330, 1.4, 0);
        font(700, 26, SANS); text('an asteroid that', 632, 452, { color: C.ink, align: 'center' });
        text('Mars captured', 632, 486, { color: C.ink, align: 'center' });
      });
      chip(232, 574, 400, 110, () => {
        ctx.fillStyle = C.sync; k.rrect(262, 600, 56, 56, 12); ctx.fill();
        ctx.fillStyle = C.bg0; k.rrect(276, 614, 28, 28, 6); ctx.fill();
        font(700, 30); text('10 g', 344, 616, { color: C.sync });
        font(400, 20); text('back in 2031', 344, 650, { color: C.soft });
      });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [SANS, MONO],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t); sceneB(t); sceneC1(t); sceneC2(t); sceneC3(t); sceneD(t); sceneE(t); sceneF(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.orbit, '~': C.marsHi, '^': C.sync } });
  },
});
