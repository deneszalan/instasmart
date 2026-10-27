// Explainer for engineering-nasoni-finger-fountain (Roma): Rome's nasoni, the cast-iron street fountains put up
// from 1874, run all day and night; block the end of the curved spout with a finger and the water shoots up through a
// small hole on top. Why it jets: while the water flows freely, most of the main's pressure is used up pushing the
// flow through the pipes, so little is left at the spout; blocked, the flow almost stops, almost nothing is lost on
// the way, and the pressure at the spout climbs back towards the main's. Look: a dark green evening, the nasone in
// cast-iron green and travertine, water in cyan, a pressure line drawn over the pipe. Bitter for captions, Fredoka
// for labels and numbers.
//
// Facts:
// - Turismo Roma (Rome's tourist office), "I Nasoni, le fontanelle di Roma": born in 1874 from an idea of mayor
//   Luigi Pianciani and councillor Rinazzi, to give free drinking water and also to relieve the water network ("dare
//   sfogo alla rete idrica"); cast iron, about 120 cm high and about 100 kg, with three dragon-shaped spouts, the
//   water ending in the sewer through a grate at street level; the three spouts were later replaced by a single
//   smooth spout, which gave the name "nasone" (big nose); the water stays fresh because it flows all the time and
//   is the same water Acea has piped to Roman homes for over a century; each spout has a small hole on top: block the
//   main outlet with a finger and the water spurts upwards, which makes drinking easier.
// - Turismo Roma, "Tre nuovi 'nasoni' installati lungo la via Sacra" (2024): "Attualmente i nasoni di Roma sono
//   2.800"; 150 years since the first fountain.
// - Wikipedia, "Nasone": installed from the 1870s (sources say 1872 or 1874); approximately 2,500–2,800 in Rome;
//   constantly flowing water keeps the water in the pipes from stagnating; the same water as households; in July 2017
//   Acea began shutting some off during a drought.
// - Internazionale, 6 July 2017: the fountains could not all be closed at once because of their role in the network;
//   Fabrizio Di Mauro, author of "I nasoni di Roma": their main function was relieving the pipes, to reduce the
//   pressure ("sfogo delle tubature per ridurre la pressione stessa").
// - Physics (Wikipedia, "Darcy–Weisbach equation" and "Torricelli's law"): the pressure lost to friction along a pipe
//   grows with the square of the flow speed; water leaving an opening under a pressure head h moves at about √(2gh)
//   and can rise about h.
// The model: the main's pressure head H; pipe losses R·Q²; outflow Q through the open area A at the spout's pressure
// p, Q = A·√(2gp). Then p/H = 1 / (1 + K·(A/a)²), where a is the spout's mouth and K = 2gRa² = 8 is an illustrative
// pipe resistance, not a measurement. With the mouth open and a hole a tenth of its size (A = 1.1a), p ≈ 9% of H;
// with the mouth blocked (A = 0.1a), p ≈ 93% of H, and the jet from the hole can rise about p; the flow falls to
// about 29% of the open flow, and the pressure lost in the pipe from about 91% to about 7% of H.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  A nasone on the cobbles; three dragon spouts, then one curved "big nose".
//  B  9.6–18.6  About 2,800 in Rome; a cutaway: the pipe from the main, no tap, water into a grate.
//  C 18.8–27.8  Flowing water stays fresh; open spouts let off pressure in the pipes.
//  D 28.0–37.0  The hole on top of the spout; a finger blocks the end; the jet.
//  E 37.2–55.4  The model: a pressure line along the pipe, open and then blocked.
//  F 55.6–65.0  Pressure becomes speed: a jet to drink from; the same water as Roman homes.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0f1c1a', bg2: '#1d2d29', ink: '#f2efe6', soft: 'rgba(242,239,230,0.74)', faint: 'rgba(242,239,230,0.24)',
  iron: '#3c4c45', iron2: '#5d7067', iron3: '#22302b', trav: '#d9cca8', trav2: '#b5a682', cobble: '#3a3530', cobble2: '#4a443d',
  water: '#5fd4e8', water2: '#b9f1fa', lamp: '#f2b552', red: '#ef7b5b', green: '#9be08a', skin: '#e9b98f',
};
const CAP = 'Bitter', LAB = 'Fredoka';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const FIRST = 1874, COUNT = 2800, HEIGHT_CM = 120, WEIGHT_KG = 100;
const K = 8, HOLE = 0.1; // illustrative pipe resistance; the hole's area as a share of the spout's mouth
const spoutShare = (open) => 1 / (1 + K * open * open); // pressure at the spout as a share of the main's
const P_OPEN = spoutShare(1 + HOLE), P_SHUT = spoutShare(HOLE);
const Q_OPEN = (1 + HOLE) * Math.sqrt(P_OPEN), Q_SHUT = HOLE * Math.sqrt(P_SHUT); // flows, in units of a·√(2gH)
if (Math.round(P_OPEN * 100) !== 9 || Math.round(P_SHUT * 100) !== 93 || Math.round((Q_SHUT / Q_OPEN) * 100) !== 29) throw new Error('numbers');

// ---------- helpers ----------
const rnd = (seed) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
function pill(str, x, y, col, { align = 'center', size = 24, bg = 'rgba(15,28,26,0.86)' } = {}) {
  font(600, size); const w = ctx.measureText(str).width, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.fillStyle = bg; k.rrect(x0 - 12, y - size * 0.82, w + 24, size * 1.64, 10); ctx.fill();
  text(str, x0, y, { base: 'middle', color: col });
}
function cobbles(y0, y1, a = 1) {
  A(a, () => {
    const r = rnd(3);
    ctx.fillStyle = C.cobble; ctx.fillRect(0, y0, W, y1 - y0);
    for (let row = 0; row * 30 < y1 - y0; row++) for (let i = -1; i < 26; i++) {
      const x = i * 36 + (row % 2) * 18, y = y0 + row * 30;
      ctx.fillStyle = r() > 0.5 ? C.cobble2 : '#423c36'; k.rrect(x + 2, y + 2, 32, 26, 6); ctx.fill();
    }
  });
}
/** A stream of water from (x, y) falling under gravity, starting with speed vx sideways and vy upwards. */
function stream(x, y, vx, vy, t, { width = 9, g = 900, len = 1.2, col = C.water } = {}) {
  ctx.strokeStyle = col; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const u = (i / 40) * len, px = x + vx * u, py = y - vy * u + 0.5 * g * u * u;
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.stroke();
  // droplets riding along it
  ctx.fillStyle = C.water2;
  for (let j = 0; j < 6; j++) {
    const u = ((t * 1.3 + j / 6) % 1) * len, px = x + vx * u, py = y - vy * u + 0.5 * g * u * u;
    ctx.beginPath(); ctx.arc(px, py, width * 0.32, 0, TAU); ctx.fill();
  }
  ctx.lineCap = 'butt';
}
/** The nasone, standing at (x, base), scale s; `dragons` swaps the single spout for three dragon spouts. */
function nasone(x, base, s, t, { flow = 1, dragons = 0, cut = 0, hole = 0 } = {}) {
  const h = 330 * s, w = 86 * s, top = base - h;
  // travertine basin and grate
  ctx.fillStyle = C.trav2; ctx.fillRect(x - 150 * s, base - 8 * s, 300 * s, 24 * s);
  ctx.fillStyle = C.trav; ctx.fillRect(x - 150 * s, base - 14 * s, 300 * s, 10 * s);
  ctx.fillStyle = '#1b1714'; ctx.fillRect(x - 128 * s, base - 4 * s, 70 * s, 12 * s);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = C.iron2; ctx.fillRect(x - 126 * s + i * 12 * s, base - 4 * s, 4 * s, 12 * s); }
  // column: base, shaft, rings, cap
  ctx.fillStyle = C.iron3; ctx.fillRect(x - w * 0.62, base - 70 * s, w * 1.24, 62 * s);
  ctx.fillStyle = C.iron; ctx.fillRect(x - w / 2, top + 40 * s, w, h - 110 * s);
  ctx.fillStyle = C.iron2; ctx.fillRect(x - w / 2 + 8 * s, top + 40 * s, 10 * s, h - 110 * s);
  for (const yy of [top + 40 * s, top + 70 * s, base - 76 * s]) { ctx.fillStyle = C.iron3; ctx.fillRect(x - w * 0.58, yy - 6 * s, w * 1.16, 12 * s); }
  ctx.fillStyle = C.iron3; ctx.beginPath(); ctx.ellipse(x, top + 30 * s, w * 0.6, 14 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C.iron; ctx.beginPath(); ctx.moveTo(x - w * 0.45, top + 28 * s); ctx.quadraticCurveTo(x, top - 26 * s, x + w * 0.45, top + 28 * s); ctx.fill();
  // the city's arms, a small shield
  ctx.fillStyle = '#8c2f2a'; ctx.beginPath(); ctx.moveTo(x - 16 * s, top + 96 * s); ctx.lineTo(x + 16 * s, top + 96 * s); ctx.lineTo(x + 16 * s, top + 118 * s); ctx.quadraticCurveTo(x, top + 134 * s, x - 16 * s, top + 118 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.lamp; ctx.fillRect(x - 10 * s, top + 104 * s, 20 * s, 4 * s);
  // cutaway: the pipe inside
  A(cut, () => {
    ctx.fillStyle = 'rgba(15,28,26,0.75)'; ctx.fillRect(x - w / 2 + 14 * s, top + 52 * s, w - 28 * s, h - 130 * s);
    ctx.fillStyle = C.water; ctx.fillRect(x - 7 * s, top + 150 * s, 14 * s, h - 150 * s + 80 * s);
    const r = rnd(9);
    for (let i = 0; i < 6; i++) { const y = base + 70 * s - (((t * 120 + r() * 300) % (h - 70 * s)) ); ctx.fillStyle = C.water2; ctx.beginPath(); ctx.arc(x, y, 4 * s, 0, TAU); ctx.fill(); }
  });
  // spouts
  const sy = top + 160 * s;
  if (dragons < 1) A(1 - dragons, () => {
    // one curved spout, the "big nose"
    ctx.strokeStyle = C.iron2; ctx.lineWidth = 18 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - w / 2, sy); ctx.quadraticCurveTo(x - w / 2 - 70 * s, sy - 20 * s, x - w / 2 - 74 * s, sy + 30 * s); ctx.stroke(); ctx.lineCap = 'butt';
    if (hole) A(hole, () => { ctx.fillStyle = '#0c1412'; ctx.beginPath(); ctx.arc(x - w / 2 - 50 * s, sy - 12 * s, 4.5 * s, 0, TAU); ctx.fill(); });
    if (flow > 0) A(flow, () => stream(x - w / 2 - 74 * s, sy + 34 * s, -6 * s, -10 * s, t, { width: 8 * s, g: 900 * s, len: Math.sqrt((2 * (base - sy - 40 * s)) / (900 * s)) }));
  });
  if (dragons > 0) A(dragons, () => {
    for (const [dx, dir] of [[-w / 2, -1], [w / 2, 1]]) {
      const hx = x + dx, hy = sy;
      ctx.fillStyle = '#7f8f6a'; ctx.beginPath(); ctx.moveTo(hx, hy - 12 * s); ctx.lineTo(hx + dir * 46 * s, hy - 6 * s); ctx.lineTo(hx + dir * 52 * s, hy + 6 * s); ctx.lineTo(hx, hy + 12 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0c1412'; ctx.beginPath(); ctx.arc(hx + dir * 24 * s, hy - 4 * s, 3 * s, 0, TAU); ctx.fill();
      stream(hx + dir * 52 * s, hy + 4 * s, dir * 40 * s, 0, t, { width: 6 * s, g: 900 * s, len: Math.sqrt((2 * (base - hy)) / (900 * s)) });
    }
    ctx.fillStyle = '#7f8f6a'; ctx.beginPath(); ctx.ellipse(x, sy, 20 * s, 14 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#0c1412'; ctx.beginPath(); ctx.arc(x, sy + 2 * s, 5 * s, 0, TAU); ctx.fill();
    stream(x, sy + 8 * s, 0, -10 * s, t, { width: 6 * s, g: 900 * s, len: Math.sqrt((2 * (base - sy)) / (900 * s)) });
  });
}

// ---------- A ----------
function sceneIntro(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    cobbles(640, 760);
    A(seg(t, 0.4, 1.0), () => { font(600, 26); text('NASONE · ROME', CX, 100, { align: 'center', base: 'middle', color: C.soft, spacing: '4px' }); });
    const drag = seg(t, 5.2, 6.0) * (1 - seg(t, 7.4, 8.2));
    nasone(CX + 40, 660, 1.55, t, { dragons: drag });
    A(seg(t, 1.6, 2.2) * (1 - seg(t, 4.8, 5.2)), () => {
      font(600, 24);
      text(`cast iron · about ${HEIGHT_CM} cm · about ${WEIGHT_KG} kg`, CX, 160, { align: 'center', base: 'middle', color: C.soft });
    });
    A(drag, () => pill('1874: THREE DRAGON SPOUTS', CX, 160, C.lamp));
    A(seg(t, 8.0, 8.6), () => pill('LATER: ONE CURVED SPOUT, A “BIG NOSE”', CX, 160, C.water));
  });
}

// ---------- B: how many; the cutaway ----------
function sceneCount(t) {
  A(span(t, 9.4, 14.2, 0.5, 0.4), () => {
    // Rome as a rough ring of dots, one per fountain
    const n = Math.round(COUNT * eio(seg(t, 9.8, 12.6))), r = rnd(21);
    for (let i = 0; i < COUNT; i++) {
      const a = r() * TAU, d = Math.sqrt(r()) * 300, x = CX + Math.cos(a) * d * 1.15, y = 420 + Math.sin(a) * d * 0.95;
      if (i < n) { ctx.fillStyle = d < 70 ? C.lamp : C.water; ctx.fillRect(x - 1.5, y - 1.5, 3, 3); }
    }
    ctx.fillStyle = 'rgba(15,28,26,0.85)'; k.rrect(CX - 250, 350, 500, 170, 24); ctx.fill();
    font(700, 92); text(`${Kit.fmt(n)}`, CX, 414, { align: 'center', base: 'middle', color: C.ink });
    font(500, 26); text('nasoni in Rome (Turismo Roma, 2024)', CX, 484, { align: 'center', base: 'middle', color: C.soft });
  });
  A(span(t, 14.0, 18.8, 0.5, 0.4), () => {
    // the street in section: a main under the cobbles, the pipe up into the column, the drain
    cobbles(560, 600);
    ctx.fillStyle = '#2a241f'; ctx.fillRect(0, 600, W, 160);
    const base = 572, x = 520;
    // the main
    ctx.fillStyle = C.iron2; ctx.fillRect(0, 700, W, 34); ctx.fillStyle = C.water; ctx.fillRect(0, 706, W, 22);
    for (let i = 0; i < 12; i++) { const px = ((t * 140 + i * 80) % (W + 40)) - 20; ctx.fillStyle = C.water2; ctx.beginPath(); ctx.arc(px, 717, 4, 0, TAU); ctx.fill(); }
    ctx.fillStyle = C.iron2; ctx.fillRect(x - 10, 600, 20, 100); ctx.fillStyle = C.water; ctx.fillRect(x - 5, 600, 10, 106);
    nasone(x, base, 1.1, t, { cut: 1 });
    // the drain
    ctx.fillStyle = '#1b1714'; ctx.fillRect(x - 141, 600, 70, 110);
    for (let i = 0; i < 5; i++) { const y = 610 + ((t * 90 + i * 22) % 100); ctx.fillStyle = 'rgba(95,212,232,0.6)'; ctx.fillRect(x - 112, y, 10, 10); }
    font(600, 24);
    text('city main', 70, 680, { base: 'middle', color: C.water });
    text('to the drain', x - 150, 640, { align: 'right', base: 'middle', color: C.soft });
    A(seg(t, 15.2, 15.8), () => { pill('NO TAP · RUNS DAY AND NIGHT', CX, 120, C.lamp); });
  });
}

// ---------- C: fresh water; letting off pressure ----------
function sceneWhy(t) {
  A(span(t, 18.6, 23.4, 0.5, 0.4), () => {
    // two pipes: one closed with still, stale water; one open with moving water
    const rows = [[260, 'closed: water sits', false], [470, 'open: water keeps moving', true]];
    for (const [y, lab, moving] of rows) {
      ctx.fillStyle = C.iron2; ctx.fillRect(80, y - 34, 620, 68);
      ctx.fillStyle = moving ? C.water : '#8a9a6a'; ctx.fillRect(86, y - 26, 608, 52);
      if (!moving) { ctx.fillStyle = C.iron3; ctx.fillRect(694, y - 40, 24, 80); }
      const r = rnd(y);
      for (let i = 0; i < 18; i++) {
        const px = moving ? 90 + ((r() * 600 + t * 160) % 600) : 90 + r() * 600, py = y - 18 + r() * 36;
        ctx.fillStyle = moving ? C.water2 : 'rgba(60,70,40,0.6)'; ctx.beginPath(); ctx.arc(px, py, moving ? 5 : 4, 0, TAU); ctx.fill();
      }
      if (moving) stream(704, y, 120, 20, t, { width: 14, g: 900, len: 0.36 });
      font(600, 26); text(lab, 80, y - 62, { base: 'middle', color: moving ? C.water : C.soft });
    }
    A(seg(t, 19.6, 20.2), () => pill('FRESH, NOT STALE', CX, 640, C.water));
  });
  A(span(t, 23.2, 28.2, 0.5, 0.4), () => {
    // a network: a main under the street with several nasoni as open outlets, and a gauge that settles lower
    const y = 470, street = 380;
    cobbles(street, street + 30);
    ctx.fillStyle = '#2a241f'; ctx.fillRect(0, street + 30, W, 130);
    ctx.fillStyle = C.iron2; ctx.fillRect(40, y - 22, 784, 44); ctx.fillStyle = C.water; ctx.fillRect(40, y - 14, 784, 28);
    for (let i = 0; i < 8; i++) { const px = 40 + ((t * 150 + i * 98) % 784); ctx.fillStyle = C.water2; ctx.beginPath(); ctx.arc(px, y, 4, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 4; i++) {
      const x = 170 + i * 170;
      ctx.fillStyle = C.iron2; ctx.fillRect(x - 6, street, 12, y - street - 20); ctx.fillStyle = C.water; ctx.fillRect(x - 3, street, 6, y - street - 20);
      nasone(x, street + 4, 0.5, t + i * 0.3, {});
    }
    // the gauge
    const gx = 690, gy = 640, open = seg(t, 24.4, 26.0);
    ctx.fillStyle = C.trav; ctx.beginPath(); ctx.arc(gx, gy, 62, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.iron3; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(gx, gy, 50, Math.PI * 0.8, Math.PI * 2.2); ctx.stroke();
    ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(gx, gy, 50, Math.PI * 1.85, Math.PI * 2.2); ctx.stroke();
    const ang = lerp(Math.PI * 2.1, Math.PI * 1.45, eio(open));
    ctx.strokeStyle = C.iron3; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + 44 * Math.cos(ang), gy + 44 * Math.sin(ang)); ctx.stroke();
    font(600, 22); text('pressure in the pipes', gx, gy + 86, { align: 'center', base: 'middle', color: C.soft });
    A(seg(t, 23.6, 24.2), () => { pill('OPEN SPOUTS LET OFF PRESSURE', 310, 620, C.lamp); font(500, 22); text('Fabrizio Di Mauro, “I nasoni di Roma”', 310, 668, { align: 'center', base: 'middle', color: C.soft }); });
  });
}

// ---------- D: the hole and the finger ----------
const SP = { x: 520, y: 330 }; // the spout's bend, drawn big
function bigSpout(t, { block = 0, jet = 0, pour = 1, holeGlow = 0 } = {}) {
  const { x, y } = SP;
  // the column
  ctx.fillStyle = C.iron; ctx.fillRect(x + 40, y - 200, 200, 620);
  ctx.fillStyle = C.iron2; ctx.fillRect(x + 60, y - 200, 24, 620);
  // the spout: a thick curved pipe from the column, its mouth facing down
  ctx.strokeStyle = C.iron2; ctx.lineWidth = 60; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 50, y); ctx.quadraticCurveTo(x - 170, y - 40, x - 190, y + 120); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = '#0c1412'; ctx.beginPath(); ctx.ellipse(x - 190, y + 140, 22, 9, 0, 0, TAU); ctx.fill();
  // the small hole on top of the bend
  const hx = x - 110, hy = y - 40;
  ctx.fillStyle = '#0c1412'; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, TAU); ctx.fill();
  A(holeGlow, () => { ctx.strokeStyle = C.lamp; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(hx, hy, 30, 0, TAU); ctx.stroke(); });
  // the stream pouring from the mouth
  if (pour > 0) A(pour, () => stream(x - 190, y + 148, -10, -20, t, { width: 30, g: 900, len: 0.62 }));
  // the jet from the hole
  if (jet > 0) {
    const v = 900 * 0.42 * jet; // px/s: a jet rising about v²/2g
    stream(hx - 4, hy - 8, -90 * jet, v, t, { width: 10, g: 900, len: (2 * v) / 900 + 0.25 });
  }
  // the finger
  if (block > 0) A(block, () => {
    const fx = x - 190 + lerp(-160, 0, eout(block)), fy = y + 168;
    ctx.fillStyle = '#c98f68'; k.rrect(fx - 240, fy + 6, 120, 70, 30); ctx.fill();
    ctx.fillStyle = C.skin; k.rrect(fx - 200, fy - 10, 236, 50, 25); ctx.fill();
    ctx.strokeStyle = 'rgba(120,70,40,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx - 70, fy - 6); ctx.lineTo(fx - 70, fy + 36); ctx.stroke();
    ctx.fillStyle = '#f6d9c4'; k.rrect(fx - 4, fy - 4, 32, 24, 10); ctx.fill();
  });
}
function sceneTrick(t) {
  A(span(t, 27.8, 37.2, 0.5, 0.4), () => {
    const block = seg(t, 32.8, 33.8), jet = eio(seg(t, 33.4, 34.6));
    bigSpout(t, { block, jet, pour: 1 - seg(t, 33.2, 33.8), holeGlow: seg(t, 28.6, 29.2) * (1 - seg(t, 32.6, 33.0)) });
    A(seg(t, 28.6, 29.2) * (1 - seg(t, 32.6, 33.0)), () => pill('A SMALL HOLE ON TOP', 300, 150, C.lamp));
    A(seg(t, 34.4, 35.0), () => pill('FINGER ON THE END: A JET', 300, 150, C.water));
  });
}

// ---------- E: the model ----------
// a main on the left at a fixed pressure, a long pipe, the spout on the right; the pressure line above the pipe
const MD = { x0: 90, x1: 640, y: 560, top: 230 }; // pipe from x0 to x1; full main pressure reaches MD.top
function sceneModel(t) {
  A(span(t, 37.0, 55.6, 0.5, 0.4), () => {
    const shut = eio(seg(t, 46.4, 48.6));
    const p = lerp(P_OPEN, P_SHUT, shut), q = lerp(Q_OPEN, Q_SHUT, shut) / Q_OPEN;
    const { x0, x1, y, top } = MD, Ph = (share) => y - 40 - share * (y - 40 - top);
    // the main: a tank of pressure, drawn as a gauge column
    ctx.fillStyle = C.iron2; ctx.fillRect(x0 - 50, top - 10, 60, y + 30 - top);
    ctx.fillStyle = C.water; ctx.fillRect(x0 - 42, top, 44, y + 22 - top);
    font(600, 22); text('the main', x0 - 20, y + 64, { align: 'center', base: 'middle', color: C.water });
    // the pipe, with friction marks
    ctx.fillStyle = C.iron2; ctx.fillRect(x0, y - 18, x1 - x0, 36); ctx.fillStyle = C.water; ctx.fillRect(x0, y - 11, x1 - x0, 22);
    const r = rnd(5);
    for (let i = 0; i < 16; i++) { const px = x0 + ((r() * (x1 - x0) + t * 260 * q) % (x1 - x0)); ctx.fillStyle = C.water2; ctx.beginPath(); ctx.arc(px, y, 4, 0, TAU); ctx.fill(); }
    // the spout at the end: a stub turning down, with the hole on top
    ctx.fillStyle = C.iron2; ctx.fillRect(x1, y - 18, 60, 36); ctx.fillRect(x1 + 30, y - 18, 30, 80);
    ctx.fillStyle = '#0c1412'; ctx.beginPath(); ctx.arc(x1 + 20, y - 18, 5, 0, TAU); ctx.fill();
    // pouring, or jetting
    A(1 - shut, () => stream(x1 + 45, y + 64, -10 * q, 0, t, { width: 22 * Math.max(0.3, q), g: 900, len: 0.42 }));
    if (shut > 0.05) {
      const rise = p * (y - 18 - top) * shut, v = Math.sqrt(2 * 900 * Math.max(1, rise));
      stream(x1 + 20, y - 24, -14, v, t, { width: 8, g: 900, len: (2 * v) / 900 });
    }
    A(shut, () => { ctx.fillStyle = C.skin; k.rrect(x1 + 20, y + 62, 60, 26, 12); ctx.fill(); });
    // the pressure line: full at the main, falling along the pipe to what is left at the spout
    A(seg(t, 37.6, 38.4), () => {
      ctx.strokeStyle = C.lamp; ctx.lineWidth = 5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(x0, Ph(1)); ctx.lineTo(x1 + 20, Ph(p)); ctx.stroke();
      for (const [xx, share] of [[x0, 1], [x1 + 20, p]]) { ctx.fillStyle = C.lamp; ctx.beginPath(); ctx.arc(xx, Ph(share), 8, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = 'rgba(242,181,82,0.45)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(x1 + 20, Ph(p) + 10); ctx.lineTo(x1 + 20, y - 24); ctx.stroke(); ctx.setLineDash([]);
      font(600, 24); text('pressure along the pipe', x0 + 20, top - 34, { base: 'middle', color: C.lamp });
      font(700, 30); text(`${Math.round(p * 100)}%`, x1 + 44, Ph(p) - 4, { base: 'middle', color: C.lamp });
      font(500, 22); text('left at the spout', x1 + 44, Ph(p) + 26, { base: 'middle', color: C.soft });
    });
    // what the pressure was spent on
    A(seg(t, 38.6, 39.2) * (1 - seg(t, 46.0, 46.4)), () => pill('SPENT PUSHING THE FLOW ALONG', (x0 + x1) / 2, Ph(0.62), C.lamp, { size: 22 }));
    A(seg(t, 48.4, 49.0), () => pill('LITTLE FLOW, LITTLE LOST', (x0 + x1) / 2, y + 70, C.water, { size: 22 }));
    // flow readout
    font(600, 24); text(`flow: ${Math.round(q * 100)}%`, x0 + 20, y + 120, { base: 'middle', color: C.water });
    font(500, 22); text('a simple model: the numbers are illustrative', CX, 120, { align: 'center', base: 'middle', color: C.soft });
  });
}

// ---------- F: the jet to drink from ----------
function sceneEnd(t) {
  A(span(t, 55.4, 65.4, 0.5, 0), () => {
    bigSpout(t, { block: 1, jet: 1, pour: 0 });
    A(seg(t, 56.2, 56.8) * (1 - seg(t, 59.6, 60.0)), () => {
      font(600, 26); text('pressure becomes speed', 290, 120, { align: 'center', base: 'middle', color: C.lamp });
      font(500, 22); text('a jet can rise about as high', 290, 158, { align: 'center', base: 'middle', color: C.soft });
      text('as its pressure could lift water', 290, 186, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 60.6, 61.2), () => pill('SAME WATER AS ROMAN HOMES · FREE', 290, 140, C.water, { size: 22 }));
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, `Rome’s *nasoni* are cast-iron street fountains, first put up in ${FIRST} under Mayor Luigi Pianciani.`],
  [5.0, 9.4, 'The first had three spouts shaped like dragons. Later ones got one curved spout: a *big nose*.'],
  [9.6, 14.0, `About *${Kit.fmt(COUNT)}* stand in Rome today, says the city’s tourist office.`],
  [14.2, 18.6, 'There is no tap: water from the city main runs through them day and night, into a drain.'],
  [18.8, 23.2, 'Why? Water that keeps flowing stays ~fresh~ instead of sitting and going stale in the pipes.'],
  [23.4, 27.8, 'The open spouts also let off ^pressure^ in the old pipes, says Fabrizio Di Mauro, who wrote a book on them.'],
  [28.0, 32.4, 'Now the trick: on top of the spout’s bend there is a small *hole*.'],
  [32.6, 37.0, 'Block the end of the spout with a finger, and water shoots out of the hole in a ~jet~.'],
  [37.2, 41.6, 'Why so strong? While water flows freely, pushing it along the pipes uses up most of the ^pressure^.'],
  [41.8, 46.2, 'So little pressure is left at the spout, and the water just pours out and falls.'],
  [46.4, 50.8, 'Block the spout and much less water flows, so far less pressure is lost on the way…'],
  [51.0, 55.4, '…and the pressure at the spout climbs back towards the full ^pressure^ of the main.'],
  [55.6, 60.0, 'Squeezed through the small hole, that pressure turns into speed: a ~jet~ you can drink from.'],
  [60.2, 64.6, 'It is the same water Romans get at home, and drinking it from a nasone is free.'],
];

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [CAP, LAB],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneIntro(t);
    sceneCount(t);
    sceneWhy(t);
    sceneTrick(t);
    sceneModel(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 600, family: CAP, ink: C.ink, marks: { '*': C.lamp, '~': C.water, '^': C.red } });
  },
});
