// Explainer for space-perseverance-driving-record: on 11 October 2026 Perseverance passed Opportunity's
// off-world driving record, and it drove most of the way by itself. Look: Mars at dusk, rust ground under a
// butterscotch haze, with the rover's own hazard map drawn in cyan. Saira (a squarish techno sans) for the
// odometer and numbers, IBM Plex Sans for captions and labels.
//
// Facts: NASA/JPL, "NASA's Perseverance Sets Off-World Record for Total Distance Driven" (12 October 2026):
// on 11 October 2026, the rover's 2,006th sol, a 91.31 m drive took its odometer to 45.22 km (28.10 mi),
// past Opportunity's 45.16 km (28.06 mi); it covered in five and a half years a distance that took
// Opportunity almost 15. Sojourner drove about 100 m (1997), Spirit 7.7 km, Curiosity more than 38.07 km,
// Apollo 17's astronauts 35.7 km (1972), Lunokhod 2 39 km (1973). AutoNav images the terrain while rolling,
// builds a 3D map of hazards and plots its course between waypoints chosen by planners on Earth ("thinking
// while driving"); more than 90% of the rover's distance used it, against about 5% for the first Martian
// AutoNav on Spirit and Opportunity; Sojourner assessed the path ahead from 20 measurement points,
// Perseverance processes 600,000 with every look; up to 412 m in a single sol. NASA Science blog,
// "Speaking Percy's Language": commands take between 3 and 22 minutes to reach Perseverance.
//
// The drive on the hazard map is computed: the rover senses every square within its view, plans the
// shortest route (A*) on what it has seen, treating unseen ground as clear, takes one step and repeats.
//
// Scene plan (64.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: the odometer rolls past Opportunity's 45.16 km.
//  B  9.0–22.6  The record table: rovers and Moon cars; 15 years against 5½; over 90% by itself.
//  C 22.6–50.2  How it drives: the signal delay, waypoints, the hazard map, re-planning, 20 vs 600,000.
//  D 50.2–64.4  412 m in a sol; 5% against over 90%; the odometer keeps rolling.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  top: '#24100c', mid: '#4a2216', ground: '#7c3a20', ground2: '#5d2a17', haze: 'rgba(242,179,107,0.20)',
  ink: '#fbeee2', soft: 'rgba(251,238,226,0.74)', faint: 'rgba(251,238,226,0.38)',
  gold: '#f2b36b', cyan: '#62d6ea', cyanSoft: 'rgba(98,214,234,0.20)', red: '#ff6b4a', rock: '#3a1d14', rockHi: '#8f5638',
  moon: '#c9c6c0', panel: 'rgba(28,12,9,0.78)',
};
const NUM = 'Saira', SANS = 'IBM Plex Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const fmt2 = (v) => v.toFixed(2);

// ---------- the record (NASA/JPL, 12 October 2026) ----------
const RECORDS = [
  { name: 'Sojourner', where: 'Mars · 1997', km: 0.1 },
  { name: 'Spirit', where: 'Mars · 2004–2010', km: 7.7 },
  { name: 'Apollo 17 rover', where: 'Moon · 1972', km: 35.7, moon: true },
  { name: 'Curiosity', where: 'Mars · still driving', km: 38.07 },
  { name: 'Lunokhod 2', where: 'Moon · 1973', km: 39, moon: true },
  { name: 'Opportunity', where: 'Mars · 2004–2018', km: 45.16 },
  { name: 'Perseverance', where: 'Mars · 11 Oct 2026', km: 45.22, hero: true },
];
const OPP = 45.16, PERSY = 45.22, LAST_DRIVE = 91.31, SOL = 2006;
const SOJ_POINTS = 20, PERSY_POINTS = 600000, PER_DOT = 1000;

// ---------- the hazard map and the drive (computed) ----------
const MAP = [
  '................',
  '..........##..G.',
  '....##....##....',
  '....##.....#....',
  '.........###....',
  '..##.....###....',
  '..##..#.........',
  '......##...##...',
  '.S.........##...',
  '................',
];
const COLS = MAP[0].length, ROWS = MAP.length, CELL = 42;
const MX = (W - COLS * CELL) / 2, MY = 214;
const ROCK = MAP.map((r) => [...r].map((ch) => ch === '#'));
const find = (ch) => { for (let r = 0; r < ROWS; r++) { const c = MAP[r].indexOf(ch); if (c >= 0) return [r, c]; } };
const START = find('S'), GOAL = find('G');
const VIEW = 3.2; // squares the rover can see around itself

function astar(blocked, from, to) {
  const key = (r, c) => r * COLS + c, h = (r, c) => Math.hypot(r - to[0], c - to[1]);
  const g = new Map([[key(...from), 0]]), prev = new Map(), open = [[h(...from), ...from]], done = new Set();
  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [, r, c] = open.shift();
    if (done.has(key(r, c))) continue;
    done.add(key(r, c));
    if (r === to[0] && c === to[1]) break;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS || blocked(nr, nc)) continue;
      if (dr && dc && (blocked(r + dr, c) || blocked(r, c + dc))) continue; // no squeezing between rocks
      const ng = g.get(key(r, c)) + (dr && dc ? Math.SQRT2 : 1);
      if (ng < (g.get(key(nr, nc)) ?? Infinity)) { g.set(key(nr, nc), ng); prev.set(key(nr, nc), [r, c]); open.push([ng + h(nr, nc), nr, nc]); }
    }
  }
  const path = [to];
  while (path[0][0] !== from[0] || path[0][1] !== from[1]) { const p = prev.get(key(...path[0])); if (!p) return null; path.unshift(p); }
  return path;
}
/** The whole drive: at each step, what the rover knows and the route it plans from there. */
const DRIVE = (() => {
  const known = ROCK.map((row) => row.map(() => false));
  const steps = [];
  let at = START;
  for (let n = 0; n < 60; n++) {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (Math.hypot(r - at[0], c - at[1]) <= VIEW) known[r][c] = true;
    const plan = astar((r, c) => known[r][c] && ROCK[r][c], at, GOAL);
    steps.push({ at, known: known.map((row) => row.slice()), plan });
    if (at[0] === GOAL[0] && at[1] === GOAL[1]) break;
    at = plan[1];
  }
  return steps;
})();
const cx = (c) => MX + (c + 0.5) * CELL, cy = (r) => MY + (r + 0.5) * CELL;

// ---------- timeline ----------
const DRIVE_T = [41.2, 45.4]; // the rover drives the whole route in this window
const CUES = [
  [0.4, 4.6, 'On 11 October 2026, NASA’s *Perseverance* rover set a new record on Mars.'],
  [4.8, 9.0, 'Its odometer passed ~45.16 km~, the farthest any vehicle had driven on another world.'],
  [9.2, 13.6, 'That record was Opportunity’s, built up over almost *15 years*. Perseverance took about ~5½~.'],
  [13.8, 18.2, 'On the way it also passed the Moon’s records: *Apollo 17* and the Soviet *Lunokhod 2*.'],
  [18.4, 22.6, 'For more than *90%* of that distance, the rover chose its own path.'],
  [22.8, 27.2, 'Commands take ~3 to 22 minutes~ to reach Mars: far too slow to steer it live.'],
  [27.4, 31.8, 'So planners on Earth pick *waypoints*, and the rover works out the route.'],
  [32.0, 36.4, 'Its cameras photograph the ground ahead, and it builds a *3D map of hazards*.'],
  [36.6, 41.0, 'Rocks and other hazards are ~off-limits~. It plots a path between them.'],
  [41.2, 45.6, 'It keeps looking and re-planning as it rolls: *thinking while driving*.'],
  [45.8, 50.2, 'Sojourner judged its path from ~20~ points. Perseverance uses *600,000* per look.'],
  [50.4, 54.8, 'That lets it drive up to *412 m* in a single Martian day, or sol.'],
  [55.0, 59.4, 'Spirit and Opportunity drove about ~5%~ of their way on autonav. Perseverance: *over 90%*.'],
  [59.6, 64.0, 'On sol 2,006 a *91 m* drive set the record, and the odometer keeps rolling.'],
];

// ---------- background, painted once ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.top); lg.addColorStop(0.62, C.mid); lg.addColorStop(1, '#2c130d');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(W * 0.7, 140, 20, W * 0.7, 140, 520);
  rg.addColorStop(0, 'rgba(242,179,107,0.16)'); rg.addColorStop(1, 'rgba(242,179,107,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(255,200,160,${r() * 0.035})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
}

// ---------- the rover, side view and top view ----------
function roverSide(x, base, s, wheelTurn = 0) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  ctx.fillStyle = '#e9e2d6'; ctx.strokeStyle = '#2a1510'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  // rocker-bogie legs
  ctx.strokeStyle = '#cfc5b6'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-62, -26); ctx.lineTo(-30, -48); ctx.lineTo(6, -26); ctx.moveTo(-30, -48); ctx.lineTo(40, -48); ctx.lineTo(66, -26); ctx.stroke();
  for (const wx of [-62, 6, 66]) {
    ctx.fillStyle = '#2a1510'; ctx.beginPath(); ctx.arc(wx, -20, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#9a8f80'; ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) { const a = wheelTurn + (i * Math.PI) / 2; ctx.beginPath(); ctx.moveTo(wx, -20); ctx.lineTo(wx + Math.cos(a) * 16, -20 + Math.sin(a) * 16); ctx.stroke(); }
  }
  // body, mast and head
  ctx.fillStyle = '#e9e2d6'; ctx.strokeStyle = '#2a1510'; ctx.lineWidth = 3;
  k.rrect(-56, -84, 112, 36, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#d7cdbd'; k.rrect(-74, -78, 22, 24, 4); ctx.fill(); ctx.stroke(); // the power source at the back
  ctx.fillStyle = '#cfc5b6'; ctx.fillRect(32, -150, 8, 66); ctx.strokeRect(32, -150, 8, 66);
  ctx.fillStyle = '#e9e2d6'; k.rrect(18, -172, 44, 24, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(54, -160, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function roverTop(x, y, ang, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = '#2a1510';
  for (const wx of [-13, 0, 13]) for (const wy of [-13, 13]) k.rrect(wx - 5, wy - 4, 10, 8, 2), ctx.fill();
  ctx.fillStyle = '#efe7da'; ctx.strokeStyle = '#2a1510'; ctx.lineWidth = 2;
  k.rrect(-15, -9, 30, 18, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(10, 0, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- A: the odometer ----------
function odometer(v, cxp, cyp, s, a, { record = 0 } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(cxp, cyp); ctx.scale(s, s);
    const units = v * 100 + 1e-7; // hundredths of a km = 10 m
    const digits = String(Math.floor(units)).padStart(4, '0'); // 45.22 → 4522
    const n = digits.length, dw = 74, dh = 112, gap = 8, total = n * dw + (n - 1) * gap + 22;
    ctx.fillStyle = '#140806'; k.rrect(-total / 2 - 22, -dh / 2 - 22, total + 44, dh + 44, 18); ctx.fill();
    ctx.strokeStyle = 'rgba(242,179,107,0.5)'; ctx.lineWidth = 2; ctx.stroke();
    // per-digit rolling, like a mechanical counter
    let roll = units % 1;
    const rolls = [];
    for (let i = n - 1; i >= 0; i--) {
      rolls[i] = roll;
      if (Number(digits[i]) !== 9) roll = 0;
    }
    let x = -total / 2;
    for (let i = 0; i < n; i++) {
      if (i === 2) { font(800, 70, NUM); text('.', x + 4, 30, { color: C.gold, base: 'alphabetic' }); x += 22; }
      ctx.save();
      ctx.fillStyle = '#26120d'; k.rrect(x, -dh / 2, dw, dh, 8); ctx.fill();
      ctx.beginPath(); ctx.rect(x, -dh / 2, dw, dh); ctx.clip();
      const d = Number(digits[i]), off = rolls[i] * dh;
      font(700, 96, NUM);
      text(String(d), x + dw / 2, -off, { color: C.ink, align: 'center', base: 'middle' });
      text(String((d + 1) % 10), x + dw / 2, dh - off, { color: C.ink, align: 'center', base: 'middle' });
      const sh = ctx.createLinearGradient(0, -dh / 2, 0, dh / 2);
      sh.addColorStop(0, 'rgba(0,0,0,0.55)'); sh.addColorStop(0.25, 'rgba(0,0,0,0)'); sh.addColorStop(0.75, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = sh; ctx.fillRect(x, -dh / 2, dw, dh);
      ctx.restore();
      x += dw + gap;
    }
    font(700, 40, NUM); text('km', total / 2 + 34, 14, { color: C.gold, base: 'middle' });
    if (record > 0) A(record, () => {
      ctx.fillStyle = C.gold; k.rrect(-110, dh / 2 + 34, 220, 46, 23); ctx.fill();
      font(800, 26, NUM); text('NEW RECORD', 0, dh / 2 + 58, { color: '#24100c', align: 'center', base: 'middle', spacing: '3px' });
    });
    ctx.restore();
  });
}
function horizon(t, a) {
  A(a, () => {
    const base = 650;
    // far hills, then the ground
    ctx.fillStyle = '#5a2817';
    ctx.beginPath(); ctx.moveTo(0, base - 40);
    for (let x = 0; x <= W; x += 24) ctx.lineTo(x, base - 52 - 20 * Math.sin(x / 90) - 12 * Math.sin(x / 31 + 1));
    ctx.lineTo(W, base); ctx.lineTo(0, base); ctx.fill();
    const gg = ctx.createLinearGradient(0, base, 0, 760);
    gg.addColorStop(0, C.ground); gg.addColorStop(1, C.ground2);
    ctx.fillStyle = gg; ctx.fillRect(0, base, W, 110);
    // pebbles drift past as the rover drives
    let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 40; i++) {
      const x = ((r() * W * 1.4 - t * 60) % (W * 1.4) + W * 1.4) % (W * 1.4) - 80, y = base + 10 + r() * 95, w = 4 + r() * 12;
      ctx.fillStyle = r() < 0.5 ? C.rock : '#6b331e'; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    }
    // tracks
    ctx.strokeStyle = 'rgba(40,18,12,0.55)'; ctx.lineWidth = 5; ctx.setLineDash([10, 8]); ctx.lineDashOffset = t * 60;
    for (const y of [base + 50, base + 62]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W / 2 - 40, y); ctx.stroke(); }
    ctx.setLineDash([]);
    roverSide(W / 2 + 20, base + 52, 1.25, t * 3.2);
  });
}
function sceneA(t) {
  const a = 1 - seg(t, 8.6, 9.3);
  if (a <= 0) return;
  const v = lerp(45.10, PERSY, eio(seg(t, 1.0, 7.4)));
  horizon(t, eout(seg(t, 0, 0.9)) * a);
  odometer(v, W / 2 - 18, 250, 1, eout(seg(t, 0.3, 1.1)) * a, { record: v >= OPP ? eout(seg(t, 5.6, 6.2)) : 0 });
  A(span(t, 4.9, 9.0) * a, () => {
    font(600, 26); text(`Opportunity’s record: ${fmt2(OPP)} km`, W / 2, 420, { color: C.soft, align: 'center', base: 'middle' });
  });
}

// ---------- B: the record table ----------
const BAR = { l: 300, r: 740, top: 150, h: 46, gap: 22, max: 46 };
function sceneB(t) {
  const a = eout(seg(t, 9.0, 9.8)) * (1 - seg(t, 22.4, 23.0));
  if (a <= 0) return;
  A(a, () => {
    font(700, 26); text('Distance driven on another world', 60, 116, { color: C.gold, base: 'middle' });
    RECORDS.forEach((rec, i) => {
      const y = BAR.top + i * (BAR.h + BAR.gap);
      const g = eout(seg(t, 9.6 + i * 0.35, 10.4 + i * 0.35));
      const hl = (rec.moon && t > 13.8 && t < 18.4) || (rec.name === 'Opportunity' && t > 9.2 && t < 13.8) || rec.hero;
      const dim = (t > 13.8 && t < 18.4 && !rec.moon && !rec.hero);
      A(dim ? 0.45 : 1, () => {
        font(700, 26); text(rec.name, 60, y + 12, { color: rec.hero ? C.gold : C.ink, base: 'middle' });
        font(400, 21); text(rec.where, 60, y + 38, { color: C.soft, base: 'middle' });
        const w = ((BAR.r - BAR.l) * rec.km) / BAR.max * g;
        ctx.fillStyle = rec.hero ? C.gold : rec.moon ? C.moon : 'rgba(251,238,226,0.55)';
        k.rrect(BAR.l, y + 4, Math.max(4, w), BAR.h - 8, 6); ctx.fill();
        if (hl && !rec.hero) { ctx.strokeStyle = rec.moon ? C.moon : C.cyan; ctx.lineWidth = 3; k.rrect(BAR.l - 4, y, Math.max(4, w) + 8, BAR.h, 9); ctx.stroke(); }
        A(seg(t, 10.2 + i * 0.35, 10.6 + i * 0.35), () => {
          font(700, 24, NUM);
          const label = rec.km < 1 ? '0.1 km' : `${rec.km} km`;
          const inside = w > 150;
          text(label, inside ? BAR.l + w - 12 : BAR.l + w + 12, y + BAR.h / 2, { color: inside ? '#24100c' : C.ink, align: inside ? 'right' : 'left', base: 'middle' });
        });
      });
    });
    // the years it took
    A(span(t, 9.4, 13.8), () => {
      const y = 670;
      ctx.fillStyle = C.panel; k.rrect(60, y - 50, 744, 132, 16); ctx.fill();
      const yrX = (yr) => 230 + (yr - 2004) * 24.5;
      font(600, 22); text('Opportunity', 80, y - 12, { color: C.ink, base: 'middle' }); text('Perseverance', 80, y + 28, { color: C.gold, base: 'middle' });
      const p1 = eio(seg(t, 9.6, 11.4)), p2 = eio(seg(t, 11.0, 12.6));
      ctx.fillStyle = 'rgba(251,238,226,0.6)'; k.rrect(yrX(2004.07), y - 22, (yrX(2018.45) - yrX(2004.07)) * p1, 20, 6); ctx.fill();
      ctx.fillStyle = C.gold; k.rrect(yrX(2021.13), y + 18, (yrX(2026.78) - yrX(2021.13)) * p2, 20, 6); ctx.fill();
      font(500, 20, NUM);
      for (const yr of [2004, 2010, 2016, 2022]) text(String(yr), yrX(yr), y + 62, { color: C.faint, align: 'center', base: 'middle' });
      font(700, 22, NUM);
      A(seg(t, 11.4, 11.8), () => text('almost 15 years', yrX(2011.2), y - 12, { color: '#24100c', align: 'center', base: 'middle' }));
      A(seg(t, 12.6, 13.0), () => text('5½', yrX(2023.95), y + 28, { color: '#24100c', align: 'center', base: 'middle' }));
    });
    // over 90% by itself
    A(span(t, 18.6, 22.6), () => {
      const y = 670;
      ctx.fillStyle = C.panel; k.rrect(60, y - 44, 744, 104, 16); ctx.fill();
      font(800, 60, NUM); text('90%+', 110, y + 6, { color: C.cyan, base: 'middle' });
      font(600, 26); text('of its distance on AutoNav,', 300, y - 10, { color: C.ink, base: 'middle' });
      text('the rover’s self-driving', 300, y + 24, { color: C.soft, base: 'middle' });
    });
  });
}

// ---------- C: how it drives ----------
function delay(t) {
  const a = span(t, 22.8, 27.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const ex = 150, mx = 714, y = 420;
    // Earth and Mars
    const eg = ctx.createRadialGradient(ex - 14, y - 14, 6, ex, y, 52);
    eg.addColorStop(0, '#9fd8ff'); eg.addColorStop(1, '#1f5f9e');
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, y, 52, 0, Math.PI * 2); ctx.fill();
    const mg = ctx.createRadialGradient(mx - 10, y - 10, 4, mx, y, 38);
    mg.addColorStop(0, '#f2a46b'); mg.addColorStop(1, '#9c3f1f');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, y, 38, 0, Math.PI * 2); ctx.fill();
    font(600, 24); text('Earth', ex, y + 86, { color: C.soft, align: 'center', base: 'middle' }); text('Mars', mx, y + 86, { color: C.soft, align: 'center', base: 'middle' });
    // the command crawls across
    const p = seg(t, 23.4, 26.6);
    ctx.strokeStyle = 'rgba(98,214,234,0.35)'; ctx.lineWidth = 3; ctx.setLineDash([6, 10]);
    ctx.beginPath(); ctx.moveTo(ex + 60, y); ctx.lineTo(mx - 46, y); ctx.stroke(); ctx.setLineDash([]);
    const px = lerp(ex + 60, mx - 46, p);
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(98,214,234,${0.9 - i * 0.25})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px - i * 16, y, 16 + i * 4, -0.7, 0.7); ctx.stroke(); }
    font(800, 54, NUM); text('3–22 min', W / 2, 300, { color: C.cyan, align: 'center', base: 'middle' });
    font(500, 26); text('for a command to arrive, one way', W / 2, 352, { color: C.soft, align: 'center', base: 'middle' });
  });
}
function mapScene(t) {
  const a = eout(seg(t, 27.4, 28.2)) * (1 - seg(t, 45.6, 46.2));
  if (a <= 0) return;
  A(a, () => {
    // which step of the drive we are on
    const p = seg(t, DRIVE_T[0], DRIVE_T[1]);
    const f = p * (DRIVE.length - 1), i = Math.floor(f), fr = f - i;
    const st = DRIVE[Math.min(i, DRIVE.length - 1)];
    const sense = eout(seg(t, 32.2, 33.6)); // first look: the view grows from the rover
    // terrain squares
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const x = MX + c * CELL, y = MY + r * CELL;
      ctx.fillStyle = (r + c) % 2 ? '#6f341e' : '#76381f'; ctx.fillRect(x, y, CELL, CELL);
    }
    // what the rover knows: safe squares in cyan, rocks marked red
    const first = DRIVE[0];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      let seen;
      if (t < DRIVE_T[0]) seen = first.known[r][c] && Math.hypot(r - START[0], c - START[1]) <= VIEW * sense + 0.01 && t > 32.2;
      else seen = st.known[r][c];
      if (!seen) continue;
      const x = MX + c * CELL, y = MY + r * CELL;
      if (ROCK[r][c]) { ctx.fillStyle = 'rgba(255,107,74,0.32)'; ctx.fillRect(x, y, CELL, CELL); ctx.strokeStyle = C.red; ctx.lineWidth = 2.5; ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4); }
      else { ctx.fillStyle = C.cyanSoft; ctx.fillRect(x, y, CELL, CELL); ctx.strokeStyle = 'rgba(98,214,234,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1); }
    }
    // rocks, as the eye sees them
    let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (!ROCK[r][c]) continue;
      const x = cx(c) + (rnd() - 0.5) * 8, y = cy(r) + (rnd() - 0.5) * 8, rr = 13 + rnd() * 5;
      ctx.fillStyle = C.rock; ctx.beginPath(); ctx.ellipse(x, y, rr, rr * 0.8, rnd(), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.rockHi; ctx.beginPath(); ctx.ellipse(x - 4, y - 4, rr * 0.45, rr * 0.3, 0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(242,179,107,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(MX, MY, COLS * CELL, ROWS * CELL);
    // the waypoint, dropped in by the planners
    const drop = eout(seg(t, 28.2, 29.2));
    A(drop, () => {
      const x = cx(GOAL[1]), y = cy(GOAL[0]) - 60 * (1 - drop);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 6, y + 14); ctx.lineTo(x - 6, y - 26); ctx.stroke();
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(x - 6, y - 26); ctx.lineTo(x + 20, y - 17); ctx.lineTo(x - 6, y - 8); ctx.fill();
    });
    A(span(t, 28.6, 41.0), () => {
      font(700, 22); text('waypoint from Earth', cx(GOAL[1]) + 12, MY - 26, { color: C.gold, align: 'right', base: 'middle' });
    });
    // the planned route from where the rover is now
    const planShow = t < DRIVE_T[0] ? eio(seg(t, 36.8, 38.4)) : 1;
    const plan = t < DRIVE_T[0] ? first.plan : st.plan;
    if (planShow > 0 && plan) {
      ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.lineCap = 'round';
      ctx.beginPath();
      const upto = Math.max(1, Math.floor(planShow * (plan.length - 1) + 1));
      plan.slice(0, upto + 1).forEach(([r, c], j) => (j ? ctx.lineTo(cx(c), cy(r)) : ctx.moveTo(cx(c), cy(r))));
      ctx.stroke(); ctx.restore();
    }
    // the route already driven
    if (t >= DRIVE_T[0]) {
      ctx.strokeStyle = 'rgba(251,238,226,0.75)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); DRIVE.slice(0, i + 1).forEach((d, j) => (j ? ctx.lineTo(cx(d.at[1]), cy(d.at[0])) : ctx.moveTo(cx(d.at[1]), cy(d.at[0]))));
      const nx = DRIVE[Math.min(i + 1, DRIVE.length - 1)].at;
      ctx.lineTo(lerp(cx(st.at[1]), cx(nx[1]), fr), lerp(cy(st.at[0]), cy(nx[0]), fr)); ctx.stroke();
    }
    // the rover and its view
    const nx = DRIVE[Math.min(i + 1, DRIVE.length - 1)].at;
    const rx = t >= DRIVE_T[0] ? lerp(cx(st.at[1]), cx(nx[1]), fr) : cx(START[1]);
    const ry = t >= DRIVE_T[0] ? lerp(cy(st.at[0]), cy(nx[0]), fr) : cy(START[0]);
    const ahead = st.plan && st.plan[1] ? st.plan[1] : GOAL;
    const ang = Math.atan2(cy(ahead[0]) - cy(st.at[0]), cx(ahead[1]) - cx(st.at[1]));
    if (t > 32.2) A(t < DRIVE_T[0] ? sense : 1, () => {
      ctx.strokeStyle = 'rgba(98,214,234,0.65)'; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.arc(rx, ry, (VIEW + 0.5) * CELL * (t < DRIVE_T[0] ? sense : 1), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    });
    roverTop(rx, ry, t >= DRIVE_T[0] ? ang : -0.6, 1.15);
    // labels under the map
    const ly = MY + ROWS * CELL + 40;
    A(span(t, 32.4, 41.0), () => {
      ctx.fillStyle = C.cyanSoft; ctx.fillRect(MX, ly - 12, 24, 24); ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5; ctx.strokeRect(MX, ly - 12, 24, 24);
      font(500, 22); text('seen: clear', MX + 34, ly, { color: C.ink, base: 'middle' });
      ctx.fillStyle = 'rgba(255,107,74,0.32)'; ctx.fillRect(MX + 220, ly - 12, 24, 24); ctx.strokeStyle = C.red; ctx.strokeRect(MX + 220, ly - 12, 24, 24);
      text('seen: hazard', MX + 254, ly, { color: C.ink, base: 'middle' });
      ctx.strokeStyle = 'rgba(98,214,234,0.8)'; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.arc(MX + 470, ly, 12, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      text('what it sees', MX + 492, ly, { color: C.ink, base: 'middle' });
    });
    A(span(t, 41.2, 45.6), () => {
      font(600, 24); text(`a new look and a new plan at each of ${DRIVE.length - 1} squares`, W / 2, ly, { color: C.cyan, align: 'center', base: 'middle' });
    });
    font(700, 26); A(span(t, 27.6, 45.6), () => text('The rover’s map', 60, 150, { color: C.gold, base: 'middle' }));
  });
}
function points(t) {
  const a = span(t, 45.8, 50.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const panel = (x, w, title, sub) => {
      ctx.fillStyle = C.panel; k.rrect(x, 150, w, 560, 18); ctx.fill();
      font(700, 28); text(title, x + w / 2, 196, { color: C.ink, align: 'center', base: 'middle' });
      font(500, 22); text(sub, x + w / 2, 232, { color: C.soft, align: 'center', base: 'middle' });
    };
    panel(60, 250, 'Sojourner', '1997');
    panel(330, 474, 'Perseverance', 'every look');
    // 20 points
    for (let i = 0; i < SOJ_POINTS; i++) {
      const g = eout(seg(t, 46.2 + i * 0.03, 46.6 + i * 0.03));
      const x = 115 + (i % 4) * 46, y = 320 + Math.floor(i / 4) * 52;
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, 9 * g, 0, Math.PI * 2); ctx.fill();
    }
    font(800, 46, NUM); text(String(SOJ_POINTS), 185, 640, { color: C.gold, align: 'center', base: 'middle' });
    font(500, 20); text('points', 185, 680, { color: C.soft, align: 'center', base: 'middle' });
    // 600,000 points, one dot per 1,000
    const n = PERSY_POINTS / PER_DOT, cols = 30;
    for (let i = 0; i < n; i++) {
      const g = seg(t, 46.8 + i * 0.004, 47.0 + i * 0.004);
      if (g <= 0) continue;
      const x = 362 + (i % cols) * 14.2, y = 268 + Math.floor(i / cols) * 14.2;
      ctx.fillStyle = C.cyan; ctx.globalAlpha = g; ctx.fillRect(x, y, 9, 9); ctx.globalAlpha = 1;
    }
    font(800, 46, NUM); text(PERSY_POINTS.toLocaleString('en-US'), 567, 640, { color: C.cyan, align: 'center', base: 'middle' });
    font(500, 20); text(`points · each square = ${PER_DOT.toLocaleString('en-US')}`, 567, 680, { color: C.soft, align: 'center', base: 'middle' });
  });
}

// ---------- D: one sol, the share, the odometer again ----------
function solDrive(t) {
  const a = span(t, 50.4, 55.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const x0 = 100, x1 = 764, y = 480;
    const p = eio(seg(t, 50.8, 53.0));
    font(700, 26); text('The longest drive it can make in one sol', W / 2, 250, { color: C.gold, align: 'center', base: 'middle' });
    ctx.strokeStyle = 'rgba(40,18,12,0.7)'; ctx.lineWidth = 34; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 12; ctx.setLineDash([16, 10]);
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, p), y); ctx.stroke(); ctx.setLineDash([]);
    for (let m = 0; m <= 400; m += 100) {
      const x = lerp(x0, x1, m / 412);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 26); ctx.lineTo(x, y + 40); ctx.stroke();
      font(500, 20, NUM); text(`${m} m`, x, y + 60, { color: C.soft, align: 'center', base: 'middle' });
    }
    roverTop(lerp(x0, x1, p), y, 0, 1.6);
    font(800, 80, NUM); text('412 m', W / 2, 370, { color: C.cyan, align: 'center', base: 'middle' });
    font(500, 24); text('about four football pitches end to end', W / 2, 600, { color: C.soft, align: 'center', base: 'middle' });
  });
}
function donut(x, y, r, share, color, label, sub, g) {
  ctx.lineWidth = 34; ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(251,238,226,0.12)'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * share * g); ctx.stroke();
  font(800, 40, NUM); text(label, x, y + 2, { color, align: 'center', base: 'middle' });
  font(600, 24); sub.forEach((s, i) => text(s, x, y + r + 54 + i * 30, { color: i ? C.soft : C.ink, align: 'center', base: 'middle' }));
}
function share(t) {
  const a = span(t, 55.0, 59.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 26); text('Share of the driving done on autonav', W / 2, 190, { color: C.gold, align: 'center', base: 'middle' });
    donut(230, 420, 120, 0.05, C.gold, 'about 5%', ['Spirit and Opportunity', 'the first autonav'], eio(seg(t, 55.4, 56.6)));
    donut(634, 420, 120, 0.9, C.cyan, 'over 90%', ['Perseverance', 'AutoNav'], eio(seg(t, 56.2, 58.0)));
  });
}
function ending(t) {
  const a = eout(seg(t, 59.6, 60.4));
  if (a <= 0) return;
  const v = lerp(PERSY - LAST_DRIVE / 1000, PERSY, eio(seg(t, 60.0, 62.8)));
  horizon(t, a);
  odometer(v, W / 2 - 18, 250, 1, a);
  A(eout(seg(t, 60.4, 61.0)), () => {
    font(700, 28, NUM); text(`Sol ${SOL.toLocaleString('en-US')}: +${LAST_DRIVE} m`, W / 2, 420, { color: C.gold, align: 'center', base: 'middle' });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.4, fonts: [NUM, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t);
    sceneB(t);
    delay(t);
    mapScene(t);
    points(t);
    solDrive(t);
    share(t);
    ending(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 40, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.cyan } });
  },
});
