// Explainer for engineering-panama-canal-gravity: the locks lift ships 26 m with no pumps.
// Look: a technical cutaway on a jungle-green ground with a faint survey grid. Layered tropical
// hills behind, the lock flight in hatched concrete grey, fresh lake water in teal, the sea in a
// deeper blue, valves and open gates in amber. Archivo for captions, Azeret Mono for labels.
//
// A side cutaway of a three-step flight (like Gatun Locks) from the sea up to Gatun Lake. Heights
// are drawn at 8.5 px per metre and lengths far smaller, so it is labelled as a diagram with
// exaggerated heights. Each step is LIFT / 3. The water levels are the only state: a chamber
// rises when its valve lets lake water fall through the tunnel under it, and the ship floats on
// the level of the chamber it is in, so the height counter is read off the water. The chamber
// volume shown is 26,700,000 US gallons converted to litres here (about 101 million). The
// water-saving basins at the end follow the expansion-project description: a chamber's drop is
// split into five slices; slices 1–3 go into three basins and come back on the next filling,
// slices 4–5 go on downstream, so 3/5 of the water is reused.
//
// Scene plan (66 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: sea, three chambers, the lake 26 m up, a ship. "Ships crossing Panama are
//               lifted 26 metres to a lake." / "And the locks do it without a single pump."
//  B  9.0–35.4  The ship enters, gates close, the valve opens, lake water falls through the
//               tunnel and wells up through the floor; levels match, gates open, up a step. Twice
//               more, faster, then out onto Gatun Lake.
//  C 35.4–45.8  Why no pumps: the lake is higher, so the water runs down by itself; one chamber
//               takes about 101 million litres.
//  D 45.8–63.0  The cost: lowering sends that water to the sea (the bottom chamber drains out);
//               about 200 million litres per ship; the 2016 locks' side basins reuse 60%.
//  E 63.0–66.0  End card and sources.
//
// Facts: Wikipedia "Panama Canal locks": locks lift ships 85 ft (26 m) to Gatun Lake and lower
// them again; Gatun's three steps lift 85 ft; culverts carry lake water into the chambers to raise
// them and from each chamber down to the next or to the sea to lower them; the water is moved by
// gravity, controlled by valves; a chamber takes 26,700,000 US gal; gates open only when the levels
// on both sides are equal; the expansion locks opened in June 2016. Wikipedia "Panama Canal": Gatun
// Lake, 26 m above sea level, made by damming the Chagres River; about 200 million litres of fresh
// water per ship; three water-saving basins per new lock, reusing 60% of the water. Wikipedia
// "Panama Canal expansion project": new locks and basins are filled and emptied by gravity, with no
// pumps; the basins save three of five slices (three-fifths reused).
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bgTop: '#0c241a', bgBot: '#07150f', grid: 'rgba(190,255,215,0.045)',
  hill1: '#133a28', hill2: '#185034', hill3: '#1f6640', leaf: '#2c8a52',
  conc: '#a6aca7', concLight: '#c9cec9', concDark: '#6d746f', hatch: 'rgba(60,66,62,0.45)',
  lake: '#2fbfae', lakeDeep: '#167d76', sea: '#2a86b8', seaDeep: '#145377', foam: '#bff5ea',
  amber: '#ffc94d', ink: '#eef6ef', inkSoft: 'rgba(238,246,239,0.72)', lime: '#c9f27a',
  hull: '#2b3a44', hullRed: '#b8463a',
};
const F = 'Archivo', MONO = 'Azeret Mono';

let k, ctx;
const font = (w, s, f = F) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- geometry ----------
const LIFT = 26, STEP = LIFT / 3, SEA_Y = 610, PXM = 8.5;
const Y = (m) => SEA_Y - m * PXM;
const CH = [[150, 290], [300, 440], [450, 590]]; // chamber x ranges
const GATE_X = [145, 295, 445, 595];
const FLOOR = [0, 1, 2].map((i) => Y(i * STEP) + 64);
const GAL_L = 3.785411784, CHAMBER_L = 26.7e6 * GAL_L; // litres per chamber filling
const CHAMBER_ML = Math.round(CHAMBER_L / 1e6); // 101
const SAVED = 3 / 5;

// ---------- timeline of the machine ----------
// Water level of each chamber (metres above the sea).
function chamberLevel(i, t) {
  if (i === 0) {
    const up = eio(seg(t, 15.0, 22.6));
    const down = eio(seg(t, 46.4, 50.6)); // drains to the sea in scene D
    return STEP * up * (1 - down);
  }
  if (i === 1) return STEP + STEP * eio(seg(t, 28.2, 30.4));
  return 2 * STEP + STEP * eio(seg(t, 33.0, 34.6));
}
const VALVE = [[14.6, 22.8], [28.0, 30.6], [32.8, 34.8]]; // filling valve open windows
const DRAIN = [46.2, 50.8]; // bottom chamber's drain to the sea
const valveOpen = (i, t) => span(t, VALVE[i][0], VALVE[i][1], 0.4, 0.3);
// gate g (0 sea|ch1, 1 ch1|ch2, 2 ch2|ch3, 3 ch3|lake): 1 = open
function gateOpen(g, t) {
  if (g === 0) return 1 - eio(seg(t, 12.8, 13.6));
  if (g === 1) return eio(seg(t, 24.4, 25.0)) * (1 - eio(seg(t, 27.4, 27.9)));
  if (g === 2) return eio(seg(t, 30.5, 30.9)) * (1 - eio(seg(t, 32.4, 32.8)));
  return eio(seg(t, 34.6, 35.0)) * (1 - eio(seg(t, 38.0, 38.6)));
}
// ship centre x and which chamber's water it floats on
const SHIP_KEYS = [[9.2, 70], [12.6, 220], [25.0, 220], [27.4, 370], [30.9, 370], [32.4, 520], [35.0, 520], [37.4, 730]];
function shipX(t) {
  if (t <= SHIP_KEYS[0][0]) return SHIP_KEYS[0][1];
  for (let i = 1; i < SHIP_KEYS.length; i++) {
    const [t0, x0] = SHIP_KEYS[i - 1], [t1, x1] = SHIP_KEYS[i];
    if (t <= t1) return lerp(x0, x1, eio(seg(t, t0, t1)));
  }
  return SHIP_KEYS.at(-1)[1];
}
function shipLevel(t) {
  const x = shipX(t);
  if (x < 150) return 0;
  if (x >= 590) return LIFT;
  const i = x < 295 ? 0 : x < 445 ? 1 : 2;
  // while crossing a gate the two levels are equal anyway
  return chamberLevel(i, Math.min(t, 40));
}

// ---------- timeline of the story ----------
const T = { main: [0, 63.0], basins: [56.2, 63.0], end: [63.0, 66] };
const CUES = [
  [0.4, 4.6, 'Ships crossing Panama are lifted *26 metres* to a lake.'],
  [4.8, 9.0, 'And the locks do it without a single ~pump~.'],
  [9.2, 14.2, 'The ship sails into the bottom chamber and the gates close behind it.'],
  [14.4, 19.4, 'A valve opens, and lake water *falls* through huge tunnels in the walls.'],
  [19.6, 24.0, 'It wells up through the floor and lifts the ship.'],
  [24.2, 29.4, 'When the levels match, the gates open and the ship moves up a step.'],
  [29.6, 35.2, 'Two more steps, and it floats on *Gatun Lake*, 26 m above the sea.'],
  [35.4, 40.4, 'No pumps needed: the lake sits higher, so water runs down by itself.'],
  [40.6, 45.6, `Filling one chamber takes about *${CHAMBER_ML} million litres* of lake water.`],
  [45.8, 51.2, 'Lowering a ship sends that water down, step by step, to the sea.'],
  [51.4, 56.2, 'In all, about ~200 million litres~ of fresh water per ship.'],
  [56.4, 62.4, `The 2016 locks save water: side basins catch *${Math.round(SAVED * 100)}%* of it for reuse.`],
];

// ---------- background, painted once ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, '#123526'); lg.addColorStop(0.45, C.bgTop); lg.addColorStop(1, C.bgBot);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // survey grid
  g.strokeStyle = C.grid; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 36) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
  for (let y = 0; y <= H; y += 36) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  // layered jungle hills behind
  const hill = (base, amp, col, seed) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      const y = base - amp * (0.55 * Math.sin(x / 97 + seed) + 0.3 * Math.sin(x / 41 + seed * 2.1) + 0.15 * Math.sin(x / 17 + seed * 3.3));
      g.lineTo(x, y);
    }
    g.lineTo(W, H); g.closePath(); g.fill();
  };
  hill(300, 46, C.hill1, 0.4);
  hill(350, 38, C.hill2, 1.9);
  hill(395, 30, C.hill3, 3.2);
  // tree crowns along the near ridge
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 60; i++) {
    const x = r() * W, y = 390 - 30 * (0.55 * Math.sin(x / 97 + 3.2) + 0.3 * Math.sin(x / 41 + 6.72) + 0.15 * Math.sin(x / 17 + 10.56));
    g.fillStyle = i % 3 ? '#237a49' : '#2e9157';
    g.beginPath(); g.arc(x, y + 6, 8 + r() * 10, 0, Math.PI * 2); g.fill();
  }
  // bedrock under everything
  const rg = g.createLinearGradient(0, 600, 0, 800);
  rg.addColorStop(0, '#2a2f24'); rg.addColorStop(1, '#181b14');
  g.fillStyle = rg;
  g.beginPath(); g.moveTo(0, 700); g.lineTo(150, 700); g.lineTo(150, 760); g.lineTo(600, 760); g.lineTo(600, 560); g.lineTo(864, 580); g.lineTo(864, 790); g.lineTo(0, 790); g.closePath(); g.fill();
  // grain
  for (let i = 0; i < 2400; i++) { g.fillStyle = `rgba(220,255,230,${0.01 + r() * 0.02})`; g.fillRect(r() * W, r() * H, 1.5, 1.5); }
  const vg = g.createRadialGradient(W / 2, 460, 280, W / 2, 500, 780);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------- concrete, water, tunnel ----------
function hatchRect(x, y, w, h) {
  ctx.fillStyle = C.conc; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = C.hatch; ctx.lineWidth = 1.5;
  for (let i = -h; i < w; i += 12) { ctx.beginPath(); ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); ctx.stroke(); }
  ctx.restore();
}
function water(x0, x1, yTop, yBot, fresh = true, t = 0) {
  if (yBot - yTop < 0.5) return;
  const g = ctx.createLinearGradient(0, yTop, 0, yBot);
  g.addColorStop(0, fresh ? C.lake : C.sea); g.addColorStop(1, fresh ? C.lakeDeep : C.seaDeep);
  ctx.fillStyle = g; ctx.fillRect(x0, yTop, x1 - x0, yBot - yTop);
  // surface line with a gentle ripple
  ctx.strokeStyle = C.foam; ctx.lineWidth = 2.5; ctx.beginPath();
  for (let x = x0; x <= x1; x += 6) { const y = yTop + Math.sin(x / 14 + t * 2.4) * 1.4; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke();
}
// The tunnel: from the lake intake down under each chamber, with a branch up into each floor.
const TUN = [[612, 500], [598, 560], [452, 560], [442, 636], [302, 636], [292, 708], [160, 708]];
const BRANCH = [[220, 708, FLOOR[0]], [370, 636, FLOOR[1]], [520, 560, FLOOR[2]]];
const TUN_S = []; // cumulative lengths
{ let acc = 0; TUN_S.push(0); for (let i = 1; i < TUN.length; i++) { acc += Math.hypot(TUN[i][0] - TUN[i - 1][0], TUN[i][1] - TUN[i - 1][1]); TUN_S.push(acc); } }
function tunAt(s) {
  for (let i = 1; i < TUN.length; i++) if (s <= TUN_S[i]) { const u = (s - TUN_S[i - 1]) / (TUN_S[i] - TUN_S[i - 1]); return [lerp(TUN[i - 1][0], TUN[i][0], u), lerp(TUN[i - 1][1], TUN[i][1], u)]; }
  return TUN.at(-1);
}
const tunLenTo = (x) => { // tunnel length from the intake to the point under x
  for (let i = 1; i < TUN.length; i++) {
    const [x0, y0] = TUN[i - 1], [x1, y1] = TUN[i];
    if ((x <= x0 && x >= x1) && y0 === y1) return TUN_S[i - 1] + (x0 - x);
  }
  return TUN_S.at(-1);
};
function tunnel(t, glow) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#3a403b'; ctx.lineWidth = 30;
  ctx.beginPath(); TUN.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  for (const [x, y0, y1] of BRANCH) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
  // the tunnel is always full of lake water
  ctx.strokeStyle = C.lakeDeep; ctx.lineWidth = 20;
  ctx.beginPath(); TUN.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.lineWidth = 12;
  for (const [x, y0, y1] of BRANCH) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 + 2); ctx.stroke(); }
  if (glow > 0) A(glow, () => {
    ctx.strokeStyle = 'rgba(191,245,234,0.35)'; ctx.lineWidth = 34;
    ctx.beginPath(); TUN.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  });
}
// Flow dashes along the tunnel to chamber i while its valve is open.
function flow(t, i, a) {
  if (a <= 0) return;
  const [bx, by, fy] = BRANCH[i];
  const L = tunLenTo(bx), up = by - fy, gap = 26, speed = 150;
  A(a, () => {
    ctx.fillStyle = C.foam;
    for (let s = (t * speed) % gap; s < L + up; s += gap) {
      let x, y;
      if (s < L) [x, y] = tunAt(s); else { x = bx; y = by - (s - L); }
      ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
    }
    // bubbles welling up into the chamber
    const lvl = Y(chamberLevel(i, t));
    for (let j = 0; j < 7; j++) {
      const p = ((t * 0.9 + j * 0.37) % 1);
      const x = CH[i][0] + 18 + ((j * 37) % (CH[i][1] - CH[i][0] - 36)), y = lerp(fy - 4, lvl + 6, p);
      if (y > lvl + 3) { ctx.globalAlpha = a * (1 - p) * 0.8; ctx.beginPath(); ctx.arc(x, y, 3 + 2 * p, 0, Math.PI * 2); ctx.strokeStyle = C.foam; ctx.lineWidth = 2; ctx.stroke(); }
    }
    ctx.globalAlpha = a;
  });
}
function valve(x, y, open, label) {
  ctx.fillStyle = '#20251f'; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = open > 0.05 ? C.amber : '#8b918c'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.stroke();
  const ang = lerp(0, Math.PI / 2, open);
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = open > 0.05 ? C.amber : '#b5bbb6'; ctx.fillRect(-3, -12, 6, 24);
  ctx.restore();
}
function gate(g, t) {
  const x = GATE_X[g], open = gateOpen(g, t);
  const floor = g === 0 ? FLOOR[0] : g === 3 ? FLOOR[2] : FLOOR[g];
  const top = Y(g === 0 ? STEP + 1 : Math.min(LIFT, (g + 1) * STEP) + 1.2) - 8;
  A(1 - 0.78 * open, () => {
    const gg = ctx.createLinearGradient(x - 5, 0, x + 5, 0);
    gg.addColorStop(0, '#d7a23a'); gg.addColorStop(1, '#8e6420');
    ctx.fillStyle = gg; ctx.fillRect(x - 5, top, 10, floor - top);
  });
  if (open > 0.3) A(open, () => {
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.strokeRect(x - 5, top, 10, floor - top); ctx.setLineDash([]);
  });
}

function lockFlight(t) {
  // concrete mass: walls between chambers and the floors
  const base = 760;
  hatchRect(140, FLOOR[0], 160, base - FLOOR[0]);
  hatchRect(290, FLOOR[1], 160, base - FLOOR[1]);
  hatchRect(440, FLOOR[2], 170, base - FLOOR[2]);
  // lake bed and the lake
  ctx.fillStyle = '#3c4a33';
  ctx.beginPath(); ctx.moveTo(600, 520); ctx.lineTo(864, 560); ctx.lineTo(864, 600); ctx.lineTo(600, 600); ctx.closePath(); ctx.fill();
  water(600, 864, Y(LIFT), 560, true, t);
  ctx.fillStyle = '#3c4a33'; ctx.beginPath(); ctx.moveTo(600, 520); ctx.lineTo(864, 562); ctx.lineTo(864, 600); ctx.lineTo(600, 600); ctx.closePath(); ctx.fill();
  // sea
  ctx.fillStyle = '#2f3a2c'; ctx.fillRect(0, 700, 150, 60);
  water(0, 140, SEA_Y, 700, false, t);
  tunnel(t, span(t, 35.6, 40.4, 0.5, 0.5));
  // chambers' water
  for (let i = 0; i < 3; i++) {
    const lvl = chamberLevel(i, t);
    water(CH[i][0], CH[i][1], Y(lvl), FLOOR[i], true, t);
  }
  // gates on top
  for (let g = 0; g < 4; g++) gate(g, t);
  // valves on the branches
  for (let i = 0; i < 3; i++) { const [x, y0, y1] = BRANCH[i]; valve(x, (y0 + y1) / 2 + 4, valveOpen(i, t)); }
  // drain from the bottom chamber to the sea (scene D)
  const dr = span(t, DRAIN[0], DRAIN[1], 0.4, 0.4);
  ctx.strokeStyle = '#3a403b'; ctx.lineWidth = 22; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(165, FLOOR[0] + 18); ctx.lineTo(118, FLOOR[0] + 18); ctx.stroke();
  ctx.strokeStyle = C.lakeDeep; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(165, FLOOR[0] + 18); ctx.lineTo(126, FLOOR[0] + 18); ctx.stroke();
  valve(142, FLOOR[0] + 18, dr);
  if (dr > 0) A(dr, () => {
    ctx.fillStyle = C.foam;
    for (let s = (t * 90) % 18; s < 90; s += 18) { ctx.globalAlpha = dr * (1 - s / 90); ctx.beginPath(); ctx.arc(126 - s, FLOOR[0] + 18 - s * 0.15, 3, 0, Math.PI * 2); ctx.fill(); }
  });
  // valve flow
  for (let i = 0; i < 3; i++) flow(t, i, valveOpen(i, t));
}

// ---------- the ship ----------
function ship(t) {
  const x = shipX(t), wl = Y(shipLevel(t)) + Math.sin(t * 1.6) * 0.8;
  ctx.save(); ctx.translate(x, wl);
  // hull (part below the waterline is drawn under a translucent water band)
  ctx.fillStyle = C.hull;
  ctx.beginPath(); ctx.moveTo(-56, -14); ctx.lineTo(54, -14); ctx.lineTo(62, -22); ctx.lineTo(58, 2); ctx.quadraticCurveTo(52, 12, 40, 12); ctx.lineTo(-50, 12); ctx.quadraticCurveTo(-58, 8, -58, -2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.hullRed; ctx.fillRect(-56, 2, 112, 10);
  // containers
  const cols = ['#e2a33b', '#3f8fc5', '#d4533f', '#8fb85a', '#e2a33b', '#3f8fc5'];
  for (let i = 0; i < 6; i++) { ctx.fillStyle = cols[i]; ctx.fillRect(-36 + i * 14, -30, 12, 16); }
  for (let i = 0; i < 4; i++) { ctx.fillStyle = cols[(i + 2) % 6]; ctx.fillRect(-22 + i * 14, -44, 12, 14); }
  // bridge at the stern
  ctx.fillStyle = '#eef2ee'; ctx.fillRect(-54, -46, 16, 32); ctx.fillRect(-58, -50, 24, 6);
  ctx.fillStyle = '#2b3a44'; ctx.fillRect(-52, -40, 12, 4);
  ctx.fillStyle = '#2b3a44'; ctx.fillRect(-49, -60, 6, 10);
  ctx.restore();
  // water over the lower hull
  ctx.fillStyle = 'rgba(47,191,174,0.55)';
  const lvl = Y(shipLevel(t));
  ctx.fillRect(x - 62, lvl + 1, 124, 12);
}

// ---------- labels and readouts ----------
function header(a) {
  A(a, () => {
    font(800, 22); text('RECKON', 48, 72, { color: C.lime, spacing: '3px' });
    const w = ctx.measureText('RECKON').width + 18;
    font(600, 22); text('ENGINEERING', 48 + w + 18, 72, { color: C.inkSoft, spacing: '2px' });
    font(500, 19, MONO); text('Diagram: heights exaggerated', 48, 100, { color: 'rgba(238,246,239,0.55)' });
  });
}
function tag(s, x, y, a, { color = C.ink, align = 'left', size = 22, weight = 600, family = MONO } = {}) {
  A(a, () => { font(weight, size, family); text(s, x, y, { color, align, base: 'middle' }); });
}
function dimension(a) {
  A(a, () => {
    const x = 826, y0 = Y(0), y1 = Y(LIFT);
    ctx.strokeStyle = C.lime; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
    for (const y of [y0, y1]) { ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.stroke(); }
    ctx.fillStyle = C.lime;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 7, y1 + 12); ctx.lineTo(x + 7, y1 + 12); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x - 7, y0 - 12); ctx.lineTo(x + 7, y0 - 12); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(x - 18, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2);
    font(800, 26); text(`${LIFT} m`, 0, 0, { color: C.lime, align: 'center', base: 'middle' });
    ctx.restore();
    // sea-level datum line
    ctx.strokeStyle = 'rgba(201,242,122,0.35)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(140, y0); ctx.lineTo(x - 12, y0); ctx.stroke(); ctx.setLineDash([]);
  });
}
function readout(t, a) {
  A(a, () => {
    const h = shipLevel(t);
    ctx.fillStyle = 'rgba(7,21,15,0.72)'; k.rrect(40, 136, 250, 84, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(201,242,122,0.4)'; ctx.lineWidth = 2; k.rrect(40, 136, 250, 84, 14); ctx.stroke();
    font(600, 22, MONO); text('SHIP ABOVE SEA', 60, 162, { color: C.inkSoft, base: 'middle' });
    font(800, 40); text(`${h.toFixed(1)} m`, 60, 198, { color: C.lime, base: 'middle' });
  });
}

// ---------- scene D: the water-saving basins (inset) ----------
const BS = { x: 196, w: 290, top: 262, slice: 62 }; // chamber in the inset: 5 slices
function basins(t, a) {
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = 'rgba(6,18,12,0.97)'; k.rrect(60, 150, 744, 560, 22); ctx.fill();
    ctx.strokeStyle = 'rgba(201,242,122,0.5)'; ctx.lineWidth = 2; k.rrect(60, 150, 744, 560, 22); ctx.stroke();
    font(700, 26); text('2016 locks: water-saving basins', 432, 196, { color: C.lime, align: 'center', base: 'middle' });
    font(500, 20, MONO); text('Emptying one chamber (diagram)', 432, 228, { color: C.inkSoft, align: 'center', base: 'middle' });
    const { x, w, top, slice } = BS, bottom = top + 5 * slice;
    // chamber walls
    hatchRect(x - 16, top - 10, 16, 5 * slice + 26); hatchRect(x + w, top - 10, 16, 5 * slice + 26); hatchRect(x - 16, bottom, w + 32, 16);
    // which slices have left: slice 1..3 into basins, then 4..5 downstream
    const go = [seg(t, 57.0, 57.9), seg(t, 58.0, 58.9), seg(t, 59.0, 59.9), seg(t, 60.1, 61.0), seg(t, 60.1, 61.0)];
    let level = top;
    for (let j = 0; j < 5; j++) level += slice * eio(go[j]) * (j < 3 ? 1 : 1);
    // water left in the chamber
    water(x, x + w, Math.min(level, bottom), bottom, true, t);
    // slice guides and numbers
    ctx.strokeStyle = 'rgba(238,246,239,0.3)'; ctx.setLineDash([4, 6]); ctx.lineWidth = 1.5;
    for (let j = 1; j < 5; j++) { ctx.beginPath(); ctx.moveTo(x, top + j * slice); ctx.lineTo(x + w, top + j * slice); ctx.stroke(); }
    ctx.setLineDash([]);
    for (let j = 0; j < 5; j++) tag(String(j + 1), x + 22, top + j * slice + slice / 2, 1, { color: C.ink, size: 24, weight: 700 });
    // three basins, each level with the slice below the one it stores: pipes, then tanks, then labels
    const bxs = [0, 1, 2].map((j) => 540 + j * 90), bw = 78;
    for (let j = 0; j < 3; j++) {
      const by = top + (j + 1) * slice, x0 = x + w + 16, y0 = top + j * slice + slice / 2 + 10;
      ctx.strokeStyle = '#3a403b'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(bxs[j] - 6, by + slice / 2); ctx.stroke();
      if (go[j] > 0 && go[j] < 1) { ctx.strokeStyle = C.foam; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(bxs[j] - 6, by + slice / 2); ctx.stroke(); }
    }
    for (let j = 0; j < 3; j++) {
      const bx = bxs[j], by = top + (j + 1) * slice;
      hatchRect(bx - 6, by - 6, bw + 12, slice + 12);
      ctx.fillStyle = '#0d241a'; ctx.fillRect(bx, by, bw, slice);
      const f = eio(go[j]);
      water(bx, bx + bw, by + slice * (1 - f), by + slice, true, t);
    }
    tag('side basins', 700, top + slice - 28, 1, { color: C.inkSoft, align: 'center', size: 20 });
    // slices 4-5 go downstream
    const lost = span(t, 60.1, 62.6, 0.3, 0.3);
    A(lost, () => {
      ctx.fillStyle = C.sea;
      ctx.beginPath(); ctx.moveTo(x - 20, bottom - 30); ctx.lineTo(x - 70, bottom - 30); ctx.lineTo(x - 70, bottom - 44); ctx.lineTo(x - 96, bottom - 22); ctx.lineTo(x - 70, bottom); ctx.lineTo(x - 70, bottom - 14); ctx.lineTo(x - 20, bottom - 14); ctx.closePath(); ctx.fill();
      tag('4 + 5: on', x - 4, bottom + 40, 1, { color: '#8fd3f5', align: 'center', size: 20 });
      tag('downstream', x - 4, bottom + 64, 1, { color: '#8fd3f5', align: 'center', size: 20 });
    });
    const res = seg(t, 60.4, 61.0);
    A(res, () => {
      font(800, 34); text(`3 of 5 slices kept = ${Math.round(SAVED * 100)}%`, 604, 660, { color: C.lime, align: 'center', base: 'middle' });
    });
  });
}

// ---------- draw ----------
function draw(t) {
  if (!bg) paintBg();
  ctx.drawImage(bg, 0, 0);
  const show = eout(seg(t, 0.1, 1.2));
  header(show);
  const mainA = show * (1 - seg(t, 62.8, 63.4));
  A(mainA, () => {
    lockFlight(t);
    ship(t);
    dimension(span(t, 0.8, 9.0, 0.6, 0.6) + 0.0);
    // labels
    tag('SEA', 70, 660, span(t, 0.8, 13.0, 0.5, 0.5), { color: '#a8dcf5', align: 'center' });
    tag('GATUN LAKE', 712, 470, span(t, 1.2, 56.0, 0.5, 0.5), { color: C.foam, align: 'center' });
    tag('3 lock chambers', 370, 340, span(t, 1.6, 9.0, 0.5, 0.5), { color: C.ink, align: 'center' });
    tag('tunnel', 372, 662, span(t, 14.6, 24.0, 0.5, 0.5) + span(t, 35.6, 40.4, 0.5, 0.5), { color: C.foam, align: 'center', size: 20 });
    tag('valve', 220, 742, span(t, 14.6, 19.4, 0.5, 0.5), { color: C.amber, align: 'center', size: 20 });
    tag('gate', GATE_X[0] + 14, Y(STEP) - 22, span(t, 12.6, 15.0, 0.4, 0.4), { color: C.amber, align: 'left', size: 20 });
    tag('levels equal', 296, Y(STEP) - 40, span(t, 23.4, 26.0, 0.4, 0.4), { color: C.amber, align: 'center', size: 20 });
    readout(t, span(t, 9.4, 46.0, 0.6, 0.6));
    // scene C: gravity arrow from the lake down to the chamber
    A(span(t, 35.8, 40.4, 0.5, 0.5), () => {
      ctx.strokeStyle = C.lime; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(700, 420); ctx.quadraticCurveTo(650, 540, 560, 600); ctx.stroke();
      ctx.fillStyle = C.lime; ctx.beginPath(); ctx.moveTo(548, 608); ctx.lineTo(566, 586); ctx.lineTo(574, 606); ctx.closePath(); ctx.fill();
      font(800, 26); text('gravity', 690, 540, { color: C.lime, align: 'left', base: 'middle' });
    });
    // one chamber's volume
    A(span(t, 40.8, 45.6, 0.5, 0.5), () => {
      const [x0, x1] = CH[0];
      ctx.strokeStyle = C.lime; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
      ctx.strokeRect(x0 + 2, Y(STEP), x1 - x0 - 4, FLOOR[0] - Y(STEP)); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(7,21,15,0.82)'; k.rrect(118, 300, 300, 96, 14); ctx.fill();
      font(800, 34); text(`≈ ${CHAMBER_ML} million L`, 268, 336, { color: C.lime, align: 'center', base: 'middle' });
      font(500, 20, MONO); text('26.7 million US gallons', 268, 372, { color: C.inkSoft, align: 'center', base: 'middle' });
    });
    // scene D: water to the sea
    A(span(t, 46.0, 51.2, 0.5, 0.5), () => {
      font(700, 24); text('to the sea', 70, 580, { color: '#a8dcf5', align: 'center', base: 'middle' });
    });
    A(span(t, 51.6, 56.2, 0.5, 0.4), () => {
      ctx.fillStyle = 'rgba(7,21,15,0.85)'; k.rrect(160, 140, 544, 150, 18); ctx.fill();
      ctx.strokeStyle = 'rgba(255,201,77,0.6)'; ctx.lineWidth = 2; k.rrect(160, 140, 544, 150, 18); ctx.stroke();
      font(800, 56); text('≈ 200 million L', 432, 198, { color: C.amber, align: 'center', base: 'middle' });
      font(500, 22, MONO); text('of fresh lake water per ship', 432, 254, { color: C.inkSoft, align: 'center', base: 'middle' });
    });
  });
  basins(t, span(t, T.basins[0], T.basins[1], 0.5, 0.4));
  // end card
  A(seg(t, 63.2, 64.0), () => {
    font(800, 60); text('Gravity lifts the ships.', W / 2, 360, { color: C.lime, align: 'center', base: 'middle' });
    font(700, 40); text('Rain refills the lake.', W / 2, 440, { color: C.foam, align: 'center', base: 'middle' });
    font(500, 30); text('In dry spells, low water has forced', W / 2, 540, { color: C.ink, align: 'center', base: 'middle' });
    text('the canal to let fewer ships through.', W / 2, 582, { color: C.ink, align: 'center', base: 'middle' });
    font(500, 20, MONO);
    text('Sources: Wikipedia, “Panama Canal locks”,', W / 2, 850, { color: 'rgba(238,246,239,0.6)', align: 'center', base: 'middle' });
    text('“Panama Canal”, “Panama Canal expansion project”', W / 2, 880, { color: 'rgba(238,246,239,0.6)', align: 'center', base: 'middle' });
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
    k.captions(t, [cue], { x: W / 2, y: 846, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: F, ink: C.ink, marks: { '*': C.lime, '~': C.amber } });
  }
}

Kit.scene({
  width: W, height: H, duration: 66,
  fonts: [
    { family: F, file: 'Archivo.woff2', weight: '100 900' },
    { family: MONO, file: 'AzeretMono.woff2', weight: '100 900' },
  ],
  draw(t, tools) { k = tools; ctx = tools.ctx; draw(t); },
});
