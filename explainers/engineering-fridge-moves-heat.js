// Explainer for engineering-fridge-moves-heat: a fridge doesn't make cold, it pumps heat out.
// Look: a cutaway fridge in a dark kitchen at night. The inside is frosty blue with frost sparkles,
// the condenser coils at the back glow hot orange, and the refrigerant in the sealed loop is
// coloured by its temperature (deep blue = icy, orange-red = hot). Exo 2 for captions and labels,
// JetBrains Mono for the small technical notes.
//
// The loop is one computed path: compressor → condenser coils at the back → expansion valve →
// evaporator coils inside → back to the compressor. Every point on it carries a temperature
// (0 = icy, 1 = hot) that sets the tube colour and the colour of the moving refrigerant dots, so
// the colours follow the real cycle: hot after compression, cooling in the condenser to a little
// above room temperature, a sudden drop at the valve, nearly constant while it boils in the
// evaporator, slightly warmer on the way back. The temperatures are qualitative (no degrees shown);
// the drawing is captioned as a simplified diagram.
//
// Scene plan (62 s). Important things sit above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  Hook. The fridge appears; heat squiggles leave the food, cross the back wall and
//               leave through the coils. "Your fridge doesn't make cold." / "It pumps heat out of
//               the box and dumps it out the back."
//  B  9.4–34.6  The loop draws itself and the refrigerant starts to flow; each part lights up and is
//               labelled as its caption plays: compressor, coils at the back, valve, cold coils.
//  C 34.6–48.8  Why heat goes the right way: a temperature bar (hot gas, kitchen, food, icy) shows
//               heat runs only from warmer to colder; the refrigerant is colder than the food inside
//               and hotter than the kitchen outside.
//  D 48.8–62.0  Payoff: the compressor's work lifts heat from cold to hot; out the back goes the
//               food's heat plus the motor's energy. End card.
//
// Facts: Wikipedia "Vapor-compression refrigeration": four parts (compressor, condenser, expansion
// valve, evaporator); compression raises pressure and temperature; the condenser passes heat to the
// outside air and the gas condenses to a liquid; the valve's abrupt pressure drop flash-evaporates
// part of the liquid, making it colder than the space to be cooled; in the evaporator the warmer air
// boils the refrigerant back to vapour, which returns to the compressor. Wikipedia "Refrigerator":
// a household fridge uses this cycle; the condenser coils are cooled by the room air; the liquid
// leaves them only slightly above room temperature. Wikipedia "Heat pump and refrigeration cycle":
// heat cannot flow from colder to hotter by itself, so work is needed; the heat given out equals
// the heat taken in plus the work (Q_H = Q_L + W).
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bgTop: '#101a2b', bgBot: '#0a111d', floor: '#0c1420', tile: 'rgba(160,190,230,0.05)',
  shell: '#e6ecf2', shellDark: '#b9c4cf', foam: '#2a3a52', frostTop: '#e4f6ff', frostBot: '#9fd0f2',
  ink: '#f2f6fb', inkSoft: 'rgba(242,246,251,0.72)', navy: '#14304f', icy: '#7fd6ff', hot: '#ff9a4a',
  tube: '#1d2633', brass: '#c9a45a',
};
const F = "'Exo 2'", MONO = 'JetBrains Mono'; // quoted: a family name with a token that starts with a digit

let k, ctx;
const font = (w, s, f = F) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- temperature colours: 0 icy .. 1 hot ----------
const STOPS = [[0, [38, 98, 255]], [0.18, [86, 196, 255]], [0.42, [200, 232, 246]], [0.58, [255, 200, 120]], [0.8, [255, 138, 64]], [1, [255, 72, 34]]];
function tcol(T, a = 1) {
  T = clamp(T);
  let i = 0;
  while (i < STOPS.length - 2 && T > STOPS[i + 1][0]) i++;
  const [t0, c0] = STOPS[i], [t1, c1] = STOPS[i + 1];
  const u = (T - t0) / (t1 - t0);
  const c = c0.map((v, j) => Math.round(lerp(v, c1[j], u)));
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

// ---------- the refrigerant loop as zones of points with a temperature range ----------
const COND = []; // condenser serpentine: 10 rows from y 640 up to 190, between x 660 and 570
for (let i = 0; i < 10; i++) { const y = 640 - 50 * i; if (i % 2 === 0) COND.push([660, y], [570, y]); else COND.push([570, y], [660, y]); }
const EVAP = []; // evaporator serpentine inside: 6 rows from y 175 down to 325, between x 492 and 410
for (let j = 0; j < 6; j++) { const y = 175 + 30 * j; if (j % 2 === 0) EVAP.push([492, y], [410, y]); else EVAP.push([410, y], [492, y]); }
const ZONES = [
  { id: 'comp', pts: [[575, 725], [630, 742], [672, 697]], T: [0.22, 1.0] },
  { id: 'riser', pts: [[672, 697], [672, 652], [660, 640]], T: [1.0, 0.98] },
  { id: 'cond', pts: COND, T: [0.98, 0.62] },
  { id: 'liquid', pts: [[660, 190], [660, 150], [632, 150]], T: [0.62, 0.6] },
  { id: 'valve', pts: [[632, 150], [592, 150]], T: [0.6, 0.08] },
  { id: 'cap', pts: [[592, 150], [555, 150], [555, 175], [492, 175]], T: [0.08, 0.08] },
  { id: 'evap', pts: EVAP, T: [0.08, 0.15] },
  { id: 'suction', pts: [[492, 325], [545, 325], [545, 725], [575, 725]], T: [0.15, 0.22] },
];
// Flatten to samples every 3 px with position, temperature and zone.
const SAMP = [];
let LOOP = 0;
for (const z of ZONES) {
  let zl = 0;
  for (let i = 1; i < z.pts.length; i++) zl += Math.hypot(z.pts[i][0] - z.pts[i - 1][0], z.pts[i][1] - z.pts[i - 1][1]);
  z.start = LOOP; z.len = zl;
  let acc = 0;
  for (let i = 1; i < z.pts.length; i++) {
    const [x0, y0] = z.pts[i - 1], [x1, y1] = z.pts[i];
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / 3));
    for (let j = 0; j < n; j++) {
      const u = j / n, d = acc + u * L;
      SAMP.push({ x: lerp(x0, x1, u), y: lerp(y0, y1, u), T: lerp(z.T[0], z.T[1], d / zl), z: z.id, s: LOOP + d });
    }
    acc += L;
  }
  LOOP += zl;
}
const zone = (id) => ZONES.find((z) => z.id === id);
function at(s) {
  s = ((s % LOOP) + LOOP) % LOOP;
  let lo = 0, hi = SAMP.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SAMP[m].s <= s) lo = m; else hi = m - 1; }
  return SAMP[lo];
}
// The flow: the refrigerant moves at a constant speed once it starts (scene B), easing in.
const FLOW_ON = 10.4, SPEED = 230; // px per scene second
const flowS = (t) => { const a = t - FLOW_ON; if (a <= 0) return 0; return a < 1.5 ? (SPEED * a * a) / 3 : SPEED * (a - 0.75); };

// ---------- timeline ----------
const T = { A: [0, 9.4], B: [9.4, 34.6], C: [34.6, 48.8], D: [48.8, 62] };
const CUES = [
  [0.4, 4.2, 'Your fridge doesn’t *make* cold.'],
  [4.4, 9.2, 'It pumps ~heat~ out of the box and dumps it out the back.'],
  [9.6, 13.4, 'A sealed loop of *refrigerant* does the carrying.'],
  [13.6, 17.8, 'The ~compressor~ squeezes the gas, which makes it ~hot~.'],
  [18.0, 23.6, 'In the ~coils at the back~, it hands its heat to the kitchen and turns liquid.'],
  [23.8, 28.6, 'Through a narrow *valve*, its pressure drops and it turns *icy cold*.'],
  [28.8, 34.4, 'In the *cold coils*, it soaks up heat from the food and boils back to gas.'],
  [34.6, 38.8, 'Heat flows on its own only from ~warmer~ to *colder*.'],
  [39.0, 43.8, 'Inside, the refrigerant is *colder than the food*, so heat flows in.'],
  [44.0, 48.6, 'Outside, it’s ~hotter than the kitchen~, so heat flows out.'],
  [48.8, 53.6, 'The compressor’s work is what lets heat climb from cold to hot.'],
  [53.8, 58.8, 'So the back is ~warm~: out goes the food’s heat, plus the motor’s energy.'],
];
// Which part is in the spotlight, with its caption window.
const FOCUS = { comp: [13.6, 17.8], cond: [18.0, 23.6], valve: [23.8, 28.6], evap: [28.8, 34.4] };

// ---------- static background, painted once ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bgTop); lg.addColorStop(0.7, '#0d1626'); lg.addColorStop(1, C.bgBot);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // wall tiles
  g.strokeStyle = C.tile; g.lineWidth = 2;
  for (let y = 40; y < 780; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  for (let r = 0; r * 64 + 40 < 780; r++) for (let x = (r % 2) * 32; x < W; x += 64) { g.beginPath(); g.moveTo(x, 40 + r * 64); g.lineTo(x, Math.min(780, 104 + r * 64)); g.stroke(); }
  // floor
  const fg = g.createLinearGradient(0, 780, 0, H);
  fg.addColorStop(0, '#16202f'); fg.addColorStop(1, '#070c14');
  g.fillStyle = fg; g.fillRect(0, 780, W, H - 780);
  g.strokeStyle = 'rgba(200,220,255,0.14)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 781); g.lineTo(W, 781); g.stroke();
  // grain
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,255,255,${0.012 + rnd() * 0.02})`; g.fillRect(rnd() * W, rnd() * H, 1.5, 1.5); }
  const vg = g.createRadialGradient(W / 2, 460, 260, W / 2, 500, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------- the fridge ----------
const FR = { x: 90, y: 120, w: 440, h: 660, wall: 26 };
const CAV = { x: 132, y: 146, w: 372, h: 608 }; // inside
let rndSeed = 11;
const rnd = () => ((rndSeed = (rndSeed * 16807) % 2147483647) / 2147483647);
const SPARKS = Array.from({ length: 34 }, () => ({ x: CAV.x + 10 + rnd() * (CAV.w - 20), y: CAV.y + 10 + rnd() * (CAV.h - 20), p: rnd() * 6.28, r: 2 + rnd() * 3 }));

function fridgeBody(t, show) {
  A(show, () => {
    // shadow + glow on the floor
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(FR.x + FR.w / 2 + 60, 784, 330, 16, 0, 0, Math.PI * 2); ctx.fill();
    // outer shell
    const sg = ctx.createLinearGradient(FR.x, 0, FR.x + FR.w, 0);
    sg.addColorStop(0, '#f4f7fa'); sg.addColorStop(1, C.shellDark);
    ctx.fillStyle = sg; k.rrect(FR.x, FR.y, FR.w, FR.h, 24); ctx.fill();
    // insulation (cut face)
    ctx.fillStyle = C.foam; k.rrect(FR.x + 8, FR.y + 8, FR.w - 16, FR.h - 16, 18); ctx.fill();
    ctx.save(); k.rrect(FR.x + 8, FR.y + 8, FR.w - 16, FR.h - 16, 18); ctx.clip();
    ctx.strokeStyle = 'rgba(160,190,230,0.16)'; ctx.lineWidth = 2;
    for (let i = -40; i < 60; i++) { ctx.beginPath(); ctx.moveTo(FR.x + i * 16, FR.y); ctx.lineTo(FR.x + i * 16 + 660, FR.y + 660); ctx.stroke(); }
    ctx.restore();
    // cavity, frosty
    const fg = ctx.createLinearGradient(0, CAV.y, 0, CAV.y + CAV.h);
    fg.addColorStop(0, C.frostTop); fg.addColorStop(1, C.frostBot);
    ctx.fillStyle = fg; k.rrect(CAV.x, CAV.y, CAV.w, CAV.h, 10); ctx.fill();
    // cold mist near the coil
    const mg = ctx.createRadialGradient(450, 250, 10, 450, 250, 230);
    mg.addColorStop(0, 'rgba(120,200,255,0.35)'); mg.addColorStop(1, 'rgba(120,200,255,0)');
    ctx.fillStyle = mg; ctx.fillRect(CAV.x, CAV.y, CAV.w, CAV.h);
    // shelves
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (const y of [372, 560]) { ctx.fillRect(CAV.x + 4, y, 290, 7); }
    ctx.fillStyle = 'rgba(60,110,160,0.25)';
    for (const y of [379, 567]) ctx.fillRect(CAV.x + 4, y, 290, 3);
    food();
    // frost sparkles
    for (const s of SPARKS) {
      const b = 0.35 + 0.65 * Math.max(0, Math.sin(t * 1.7 + s.p));
      ctx.strokeStyle = `rgba(255,255,255,${0.8 * b})`; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(s.x - s.r, s.y); ctx.lineTo(s.x + s.r, s.y); ctx.moveTo(s.x, s.y - s.r); ctx.lineTo(s.x, s.y + s.r); ctx.stroke();
    }
    // door edge and handle on the left
    ctx.fillStyle = '#d5dde6'; ctx.fillRect(FR.x, FR.y + 18, 10, FR.h - 36);
    ctx.fillStyle = '#9aa7b5'; k.rrect(FR.x - 18, 300, 14, 150, 7); ctx.fill();
    ctx.fillStyle = '#c3ccd6'; ctx.fillRect(FR.x - 6, 318, 8, 10); ctx.fillRect(FR.x - 6, 422, 8, 10);
    // feet
    ctx.fillStyle = '#5b6878'; ctx.fillRect(FR.x + 30, FR.y + FR.h - 2, 30, 8); ctx.fillRect(FR.x + FR.w - 60, FR.y + FR.h - 2, 30, 8);
  });
}

function food() {
  // milk bottle
  ctx.fillStyle = '#ffffff'; k.rrect(160, 262, 46, 110, 10); ctx.fill(); ctx.fillRect(170, 236, 26, 30);
  ctx.fillStyle = '#4a90d9'; ctx.fillRect(166, 232, 34, 10); ctx.fillRect(160, 300, 46, 26);
  // jar
  ctx.fillStyle = '#e8574a'; k.rrect(226, 302, 56, 70, 10); ctx.fill();
  ctx.fillStyle = '#f2c14e'; ctx.fillRect(222, 292, 64, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(234, 312, 8, 46);
  // cheese wedge
  ctx.fillStyle = '#f6cf57'; ctx.beginPath(); ctx.moveTo(160, 560); ctx.lineTo(250, 560); ctx.lineTo(250, 506); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d9a92c'; for (const [x, y, r] of [[222, 545, 6], [238, 528, 5], [205, 552, 4]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  // apples
  for (const [x, c] of [[285, '#6cbf4b'], [330, '#e2483b']]) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, 538, 21, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#5a3b20'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 518); ctx.lineTo(x + 3, 508); ctx.stroke();
  }
  // carton and greens at the bottom
  ctx.fillStyle = '#f0a73a'; k.rrect(166, 640, 84, 114, 6); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(176, 670, 64, 30);
  ctx.fillStyle = '#4fae5a';
  for (const [x, y, r] of [[300, 724, 30], [334, 712, 26], [362, 730, 24]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#3b8f46'; ctx.fillRect(300, 728, 66, 26);
}

// ---------- tube, valve, compressor ----------
function tube(t, reveal, focus) {
  const n = Math.floor(SAMP.length * reveal);
  if (n < 2) return;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // dark casing
  ctx.strokeStyle = C.tube; ctx.lineWidth = 15;
  ctx.beginPath(); ctx.moveTo(SAMP[0].x, SAMP[0].y);
  for (let i = 1; i < n; i++) { if (SAMP[i].z === 'valve' || SAMP[i].z === 'cap') continue; ctx.lineTo(SAMP[i].x, SAMP[i].y); }
  ctx.stroke();
  // coloured core, drawn in short runs
  for (let i = 1; i < n; i++) {
    const p = SAMP[i - 1], q = SAMP[i];
    const thin = q.z === 'valve' || q.z === 'cap';
    const f = focus[q.z] ?? 0;
    ctx.strokeStyle = tcol(q.T, 0.55 + 0.45 * f);
    ctx.lineWidth = thin ? 5 : 9;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
  }
}

function valve(a, glow) {
  A(a, () => {
    if (glow > 0) { ctx.shadowColor = '#9fe3ff'; ctx.shadowBlur = 26 * glow; }
    const bgr = ctx.createLinearGradient(0, 136, 0, 166);
    bgr.addColorStop(0, '#e6c886'); bgr.addColorStop(1, '#8f6d2c');
    ctx.fillStyle = bgr; k.rrect(600, 137, 34, 26, 6); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#3b2c12'; ctx.beginPath(); ctx.moveTo(604, 144); ctx.lineTo(617, 150); ctx.lineTo(604, 156); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(630, 144); ctx.lineTo(617, 150); ctx.lineTo(630, 156); ctx.closePath(); ctx.fill();
  });
}

function compressor(t, a, glow) {
  A(a, () => {
    const cx = 630, cy = 736, shake = glow > 0 ? Math.sin(t * 60) * 1.2 * glow : 0;
    ctx.save(); ctx.translate(shake, 0);
    if (glow > 0) { ctx.shadowColor = '#ff8a40'; ctx.shadowBlur = 34 * glow; }
    const g = ctx.createLinearGradient(cx - 55, cy - 40, cx + 55, cy + 40);
    g.addColorStop(0, '#3d4756'); g.addColorStop(1, '#141922');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, 56, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.ellipse(cx - 16, cy - 18, 26, 9, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0b0f15'; ctx.fillRect(cx - 50, cy + 32, 100, 10);
    // a lightning mark for the motor
    ctx.fillStyle = glow > 0 ? `rgba(255,200,90,${0.5 + 0.5 * glow})` : 'rgba(255,200,90,0.5)';
    ctx.beginPath(); ctx.moveTo(cx + 4, cy - 20); ctx.lineTo(cx - 10, cy + 3); ctx.lineTo(cx, cy + 3); ctx.lineTo(cx - 6, cy + 22); ctx.lineTo(cx + 10, cy - 3); ctx.lineTo(cx, cy - 3); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
}

// the moving refrigerant
function particles(t, a, focus) {
  if (a <= 0) return;
  const s0 = flowS(t), gap = 20;
  A(a, () => {
    for (let s = s0 % gap; s < LOOP; s += gap) {
      const p = at(s);
      if (p.z === 'comp') continue;
      const f = focus[p.z] ?? 0;
      const r = (p.z === 'valve' || p.z === 'cap' ? 2.6 : 3.6) + 1.6 * f;
      ctx.fillStyle = tcol(p.T + 0.04);
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${0.55 + 0.35 * f})`;
      ctx.beginPath(); ctx.arc(p.x - r * 0.3, p.y - r * 0.3, r * 0.4, 0, Math.PI * 2); ctx.fill();
    }
  });
}

// ---------- heat squiggles ----------
function squiggle(x, y, ang, len, color, a, w = 4) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) { const u = i / 20; const px = (u - 0.5) * len, py = Math.sin(u * Math.PI * 3) * 5; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
    // arrow tip
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(len / 2 + 10, 0); ctx.lineTo(len / 2 - 3, -7); ctx.lineTo(len / 2 - 3, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
}
const IN_SRC = [[183, 300], [254, 330], [220, 535], [310, 530], [208, 690], [330, 715], [183, 470], [290, 440]];
function heatIn(t, a) {
  if (a <= 0) return;
  const dst = [452, 252];
  IN_SRC.forEach(([x0, y0], i) => {
    const per = 2.6, p = (((t + i * 0.37) / per) % 1 + 1) % 1;
    const x = lerp(x0, dst[0], eio(p)), y = lerp(y0, dst[1], eio(p));
    const ang = Math.atan2(dst[1] - y0, dst[0] - x0);
    squiggle(x, y, ang, 34, '#ff7a3a', a * Math.sin(Math.PI * p) * 0.9, 3.5);
  });
}
function heatOut(t, a, reach = 120) {
  if (a <= 0) return;
  for (let i = 0; i < 9; i++) {
    const per = 2.2, p = (((t + i * 0.29) / per) % 1 + 1) % 1;
    const y0 = 215 + i * 50, x = 676 + p * reach, y = y0 - p * 26;
    squiggle(x, y, -0.2, 36, '#ffa257', a * Math.sin(Math.PI * p), 4);
  }
}
// hook only: heat squiggles that travel from the food out through the back wall
function heatThrough(t, a) {
  if (a <= 0) return;
  for (let i = 0; i < 7; i++) {
    const per = 3.0, p = (((t + i * 0.43) / per) % 1 + 1) % 1;
    const y0 = 260 + i * 62, x = lerp(240, 760, p), y = y0 - Math.sin(p * Math.PI) * 30;
    squiggle(x, y, 0, 38, '#ff8a45', a * Math.sin(Math.PI * p), 4);
  }
}

// ---------- labels ----------
function label(s, x, y, a, { color = C.ink, align = 'left', size = 24, weight = 700 } = {}) {
  A(a, () => { font(weight, size); text(s, x, y, { color, align, base: 'middle', spacing: '1px' }); });
}
function sub(s, x, y, a, { color = C.inkSoft, align = 'left' } = {}) {
  A(a, () => { font(500, 22, MONO); text(s, x, y, { color, align, base: 'middle' }); });
}
function chip(s, x, y, a, { bgc = C.hot, fg = '#1a0f05', size = 23 } = {}) {
  A(a, () => {
    font(700, size); const w = ctx.measureText(s).width + 28;
    ctx.fillStyle = bgc; k.rrect(x - w / 2, y - 19, w, 38, 19); ctx.fill();
    text(s, x, y + 1, { color: fg, align: 'center', base: 'middle' });
  });
}

// ---------- temperature bar (scene C) ----------
const BAR = { x: 820, y0: 640, y1: 200, w: 18 };
const barY = (T) => lerp(BAR.y0, BAR.y1, T);
const ROOM = 0.52, FOOD = 0.32;
function tempBar(t, a) {
  if (a <= 0) return;
  A(a, () => {
    const g = ctx.createLinearGradient(0, BAR.y0, 0, BAR.y1);
    for (let i = 0; i <= 10; i++) g.addColorStop(i / 10, tcol(i / 10));
    ctx.fillStyle = g; k.rrect(BAR.x, BAR.y1, BAR.w, BAR.y0 - BAR.y1, 9); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; k.rrect(BAR.x, BAR.y1, BAR.w, BAR.y0 - BAR.y1, 9); ctx.stroke();
    font(700, 22); text('HOT', BAR.x + BAR.w / 2, BAR.y1 - 22, { color: C.hot, align: 'center', base: 'middle' });
    text('COLD', BAR.x + BAR.w / 2, BAR.y0 + 24, { color: C.icy, align: 'center', base: 'middle' });
    for (const [T, s] of [[ROOM, 'kitchen'], [FOOD, 'food']]) {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(BAR.x - 10, barY(T) - 1.5, BAR.w + 10, 3);
      font(600, 22); text(s, BAR.x - 16, barY(T), { color: C.ink, align: 'right', base: 'middle' });
    }
  });
}
function barMarker(T, s, a, color) {
  if (a <= 0) return;
  A(a, () => {
    const y = barY(T);
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(BAR.x + BAR.w + 4, y); ctx.lineTo(BAR.x + BAR.w + 18, y - 9); ctx.lineTo(BAR.x + BAR.w + 18, y + 9); ctx.closePath(); ctx.fill();
    if (s) { font(700, 22); text(s, BAR.x - 16, y, { color, align: 'right', base: 'middle' }); }
  });
}
function downArrow(x, yTop, yBot, a, label1) {
  if (a <= 0) return;
  A(a, () => {
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.setLineDash([8, 8]); ctx.lineDashOffset = -0; ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yBot - 12); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x, yBot + 4); ctx.lineTo(x - 10, yBot - 14); ctx.lineTo(x + 10, yBot - 14); ctx.closePath(); ctx.fill();
    if (label1) { ctx.save(); ctx.translate(x - 18, (yTop + yBot) / 2); ctx.rotate(-Math.PI / 2); font(700, 22); text(label1, 0, 0, { color: C.ink, align: 'center', base: 'middle' }); ctx.restore(); }
  });
}

// ---------- header ----------
function header(a) {
  A(a, () => {
    font(800, 22); text('RECKON', 48, 72, { color: C.icy, spacing: '3px' });
    const w = ctx.measureText('RECKON').width + 18;
    font(600, 22); text('ENGINEERING', 48 + w + 18, 72, { color: C.inkSoft, spacing: '2px' });
    font(500, 20, MONO); text('Simplified diagram, not to scale', 48, 100, { color: 'rgba(242,246,251,0.55)' });
  });
}

// ---------- draw ----------
function focusAt(t) {
  const f = {};
  for (const [id, [a, b]] of Object.entries(FOCUS)) f[id] = span(t, a, b, 0.5, 0.5);
  f.riser = f.comp; f.liquid = f.cond * 0.6; f.cap = f.valve;
  // scene C: inside and outside in turn
  f.evap = Math.max(f.evap, span(t, 39.0, 43.8, 0.5, 0.5));
  f.cond = Math.max(f.cond, span(t, 44.0, 48.6, 0.5, 0.5), span(t, 53.8, 58.8, 0.5, 0.5));
  f.comp = Math.max(f.comp, span(t, 48.8, 53.6, 0.5, 0.5));
  f.riser = Math.max(f.riser, f.comp);
  return f;
}

function draw(t) {
  if (!bg) paintBg();
  ctx.drawImage(bg, 0, 0);
  const endFade = 1 - seg(t, 58.9, 59.6);
  const show = eout(seg(t, 0.1, 1.3));
  // warm glow behind the coils, stronger when they are in focus
  const f = focusAt(t);
  const glowA = show * (0.35 + 0.45 * Math.max(f.cond, seg(t, 4.4, 6) * (1 - seg(t, 9.4, 10.4)))) * endFade;
  A(glowA, () => {
    const rg = ctx.createRadialGradient(615, 420, 20, 615, 420, 300);
    rg.addColorStop(0, 'rgba(255,120,40,0.45)'); rg.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = rg; ctx.fillRect(300, 80, 564, 720);
  });
  header(show);
  A(endFade, () => {
    fridgeBody(t, show);
    // the loop: hint in the hook, drawn in fully in scene B
    const reveal = 1;
    const tubeA = show * lerp(0.45, 1, eio(seg(t, 9.6, 11.2)));
    A(tubeA, () => tube(t, reveal, f));
    valve(show, f.valve);
    particles(t, eio(seg(t, 10.2, 11.4)), f);
    compressor(t, show, f.comp);
    // heat
    heatThrough(t, span(t, 4.6, 9.4, 0.6, 0.6));
    heatIn(t, Math.max(0.35 * seg(t, 10.5, 11.5), span(t, 28.8, 34.4, 0.5, 0.5), span(t, 39.0, 43.8, 0.5, 0.5)));
    heatOut(t, Math.max(0.4 * seg(t, 10.5, 11.5), span(t, 18.0, 23.6, 0.5, 0.5), span(t, 44.0, 48.6, 0.5, 0.5), span(t, 53.8, 58.8, 0.5, 0.5)), lerp(120, 58, span(t, 34.8, 58.8, 0.6, 0.5)));
    // part labels (scene B), shown while their caption plays and then kept quietly until scene C
    const keep = (a, b) => Math.max(span(t, a, b, 0.4, 0.4), 0.55 * seg(t, b - 0.4, b) * (1 - seg(t, 34.4, 35.0)));
    label('COMPRESSOR', 694, 712, keep(13.6, 17.8), { color: C.hot, size: 22 });
    sub('squeezes gas', 694, 740, keep(13.6, 17.8));
    label('HOT COILS', 686, 380, keep(18.0, 23.6), { color: C.hot });
    sub('condenser', 686, 410, keep(18.0, 23.6));
    label('VALVE', 680, 150, keep(23.8, 28.6), { color: C.icy });
    A(keep(23.8, 28.6), () => { font(500, 20, MONO); text('pressure drops', 680, 178, { color: C.inkSoft, base: 'middle' }); });
    A(keep(28.8, 34.4), () => {
      ctx.fillStyle = 'rgba(20,48,79,0.82)'; k.rrect(250, 180, 148, 72, 12); ctx.fill();
      font(700, 23); text('COLD COILS', 324, 206, { color: '#bfe9ff', align: 'center', base: 'middle' });
      font(500, 20, MONO); text('evaporator', 324, 234, { color: 'rgba(220,240,255,0.85)', align: 'center', base: 'middle' });
    });
    // scene C: the temperature bar
    const barA = span(t, 34.8, 58.8, 0.6, 0.5);
    tempBar(t, barA);
    downArrow(760, barY(0.9), barY(0.12), span(t, 35.2, 38.9, 0.5, 0.4), 'heat flows');
    barMarker(0.1, 'refrigerant', span(t, 39.2, 43.8, 0.4, 0.4), C.icy);
    chip('colder than the food', 282, 250, span(t, 39.6, 43.8, 0.4, 0.4), { bgc: '#bfe9ff', fg: C.navy, size: 22 });
    barMarker(0.95, 'refrigerant', span(t, 44.2, 48.6, 0.4, 0.4), C.hot);
    // during scene D the marker climbs with the compressor's work
    const climb = eio(seg(t, 49.6, 52.6));
    barMarker(lerp(0.2, 0.97, climb), '', span(t, 49.0, 53.6, 0.4, 0.4), tcol(lerp(0.2, 0.97, climb)));
    A(span(t, 49.6, 53.6, 0.5, 0.4), () => {
      font(800, 24); text('+ work', 700, 676, { color: '#ffd27a', align: 'left', base: 'middle' });
    });
    chip('hotter than the kitchen', 600, 470, span(t, 44.4, 48.6, 0.4, 0.4), { bgc: C.hot, size: 22 });
    // payoff sum
    A(span(t, 54.4, 58.8, 0.5, 0.4), () => {
      ctx.fillStyle = 'rgba(16,26,43,0.9)'; k.rrect(140, 410, 330, 120, 16); ctx.fill();
      ctx.strokeStyle = C.hot; ctx.lineWidth = 3; k.rrect(140, 410, 330, 120, 16); ctx.stroke();
      font(700, 24); text('heat out the back =', 305, 444, { color: C.hot, align: 'center', base: 'middle' });
      text('food’s heat', 305, 478, { color: '#bfe9ff', align: 'center', base: 'middle' });
      text('+ motor’s energy', 305, 508, { color: '#ffd27a', align: 'center', base: 'middle' });
    });
  });
  // end card
  A(seg(t, 59.2, 60.0), () => {
    font(800, 64); text('Cold is just', W / 2, 380, { color: C.icy, align: 'center', base: 'middle' });
    text('heat taken away.', W / 2, 456, { color: C.hot, align: 'center', base: 'middle' });
    font(600, 30); text('A fridge moves heat from its inside', W / 2, 560, { color: C.ink, align: 'center', base: 'middle' });
    text('to the kitchen, using a compressor.', W / 2, 602, { color: C.ink, align: 'center', base: 'middle' });
    font(500, 22, MONO);
    text('Source: Wikipedia, “Vapor-compression refrigeration”', W / 2, 860, { color: 'rgba(242,246,251,0.6)', align: 'center', base: 'middle' });
    text('Simplified diagram, temperatures shown as colours', W / 2, 892, { color: 'rgba(242,246,251,0.6)', align: 'center', base: 'middle' });
  });
  captions(t);
}

// Captions with balanced lines.
const CAP = { size: 44, lh: 56, weight: 700, maxW: 760 };
const capW = new Map();
function balanced(s) {
  if (capW.has(s)) return capW.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (m) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > m && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capW.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 846, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: F, ink: C.ink, marks: { '*': C.icy, '~': C.hot } });
  }
}

Kit.scene({
  width: W, height: H, duration: 62,
  fonts: [
    { family: 'Exo 2', file: 'Exo2.woff2', weight: '100 900' },
    { family: MONO, file: 'JetBrainsMono.woff2', weight: '100 800' },
  ],
  draw(t, tools) { k = tools; ctx = tools.ctx; draw(t); },
});
