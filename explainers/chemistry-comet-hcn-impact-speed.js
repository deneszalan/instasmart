// Explainer for chemistry-comet-hcn-impact-speed: on 28 October 2026 Scientific Reports published a study
// (Anslow, McDonald, Bonsor, Rimmer, Rae and colleagues, University of Cambridge) finding that comets almost never
// delivered hydrogen cyanide, a building block for life's chemistry, intact to the early Earth: they hit too fast.
// The scene explains why speed is the problem: kinetic energy per kilogram grows with the square of the speed, the
// impact shock turns it into heat, and HCN breaks apart above about 3,600 K. Look: black space, a comet in cyan and
// green, heat in orange and red. Space Mono for numbers and headings, Saira for the captions.
//
// Facts:
// - Scientific Reports 16, 31688 (28 October 2026), "Cometary impacts an unlikely pathway towards the origins of life
//   on Earth": mean impact velocities about 28.2 km/s on Earth, 19.7 on Mars, 36.8 on Venus; comets under about
//   100 m break up in airbursts; HCN survival limited to highly oblique impacts at the low-velocity tail; Earth
//   accreted more than 10⁵ comets over 100 m, the median number delivering over 10 mM HCN is zero; best case
//   (ignoring the need to hit land) 87 ± 9 deliveries, 54% of simulations none; Mars 744 ± 27, Venus 24 ± 5;
//   total intact HCN about 2.65 × 10¹³ kg, about 0.75 µM spread over an ocean, far below prebiotic levels.
// - McDonald et al., Icarus (arXiv 2507.08727), "Constraining the survival of HCN during cometary impacts": for a
//   1 km comet hitting vertically, HCN survival about 98% at 5 km/s, 38% at 8, 2% at 10 (equilibrium chemistry),
//   nothing above 15 km/s; median peak temperature about 18.02 × v^2.17 K (v in km/s); HCN destruction becomes
//   near-total above about 3,600 K, with 99% gone within 1.5 × 10⁻⁴ to 0.15 s, and nothing survives 7,000 K; peak
//   temperature scales with impact angle as sin(θ)^1.6, so 15° grazing hits allow near-complete survival; Earth's
//   escape velocity, about 11 km/s, is the lowest possible impact speed without aerobraking.
// - Science News, 28 October 2026: Richard Anslow (Met Office) is lead author; alternative sources: carbon-rich
//   asteroids, volcanoes, hydrothermal vents. Universe Today, 28 October 2026: Anslow: "at best, a one-off fluke".
// - A kilogram of TNT releases 4.184 MJ (the definition of the TNT equivalent).
// Computed here: energy per kg = v²/2, the temperature law 18.02 × v^2.17 × sin(θ)^1.6, and the survival curve points.
//
// Scene plan (60 s). Captions are centred at y = 846; everything important stays above y = 770.
//  A  0.0– 9.0  A comet carrying HCN; the study.
//  B  9.2–18.2  Speed and energy per kilogram.
//  C 18.4–32.0  Shock heat; HCN's limit; the survival curve.
//  D 32.2–45.8  Angle, airbursts, land; 87 at best.
//  E 46.0–55.0  Over half the histories: none; Mars 744.
//  F 55.2–60.0  Other routes.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#07101c', bg2: '#020408', ink: '#eef3f8', soft: 'rgba(238,243,248,0.72)', faint: 'rgba(238,243,248,0.24)', line: 'rgba(238,243,248,0.14)',
  comet: '#7fe3d0', cometSoft: 'rgba(127,227,208,0.35)', hcn: '#9ad7ff', heat: '#ff7a3d', hot: '#ff3b3b', gold: '#ffd166', green: '#8de39a', panel: 'rgba(255,255,255,0.06)',
};
const HEAD = 'Space Mono', TXT = 'Saira';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the physics ----------
const V_EARTH = 28.2, V_MARS = 19.7, V_MIN = 11; // km/s
const energyMJ = (v) => (v * v) / 2; // MJ per kg, with v in km/s
const TNT = 4.184; // MJ per kg
const peakT = (v, deg = 90) => 18.02 * Math.pow(v, 2.17) * Math.pow(Math.sin((deg * Math.PI) / 180), 1.6); // K, McDonald et al.
const T_BREAK = 3600, T_NONE = 7000;
const SURVIVAL = [[5, 98], [8, 38], [10, 2], [15, 0]]; // [km/s, % HCN surviving], 1 km comet, vertical
const EARTH_BEST = 87, MARS_BEST = 744, NONE_SHARE = 54, COMETS = 100000;
const TNT_X = Math.round(energyMJ(V_EARTH) / TNT); // about 95

const CUES = [
  [0.4, 4.6, 'Comets carry *hydrogen cyanide*, HCN: a small molecule that can help build the chemicals of life.'],
  [4.8, 9.0, 'On 28 October 2026, astronomers in Cambridge reported that comets almost never deliver it intact to Earth.'],
  [9.2, 13.6, `The problem is speed. A comet hits Earth at ^${V_EARTH} km/s^ on average; gravity alone makes it at least ${V_MIN}.`],
  [13.8, 18.2, `Energy per kilogram is half the speed squared: at ${V_EARTH} km/s, ^${fmt(energyMJ(V_EARTH))} megajoules^, about ${TNT_X} times TNT.`],
  [18.4, 22.8, 'The impact shock turns that energy into heat. In the models, the comet reaches thousands of degrees.'],
  [23.0, 27.4, `HCN falls apart above about ~${fmt(T_BREAK)} kelvin~, within a fraction of a second. By ${fmt(T_NONE)}, none is left.`],
  [27.6, 32.0, `Slow hits spare it: in simulations, ${SURVIVAL[0][1]}% survives at ${SURVIVAL[0][0]} km/s, ${SURVIVAL[1][1]}% at ${SURVIVAL[1][0]}, ${SURVIVAL[2][1]}% at ${SURVIVAL[2][0]}, nothing above ${SURVIVAL[3][0]}.`],
  [32.2, 36.6, 'A ^grazing^ hit heats far less than a head-on one. And the air filters comets under about 100 m: they burst.'],
  [36.8, 41.2, 'So a delivery needs a big, slow, grazing comet that lands on land, so the HCN isn’t drowned in ocean.'],
  [41.4, 45.8, `Of over ${fmt(COMETS)} comets above 100 m that hit the early Earth, the best case gives ~${EARTH_BEST}~ such deliveries.`],
  [46.0, 50.4, `In ${NONE_SHARE}% of the simulated histories, not one succeeded. Lead author Richard Anslow: at best a one-off fluke.`],
  [50.6, 55.0, `Mars does better: slower hits, about ${Math.round(V_MARS)} km/s, and thin air give it ^${MARS_BEST}^ deliveries to Earth’s ${EARTH_BEST}.`],
  [55.2, 60.0, 'So life’s cyanide likely came another way: carbon-rich asteroids, volcanoes or hot vents, the study suggests.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 23; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) { const r = rnd(); g.fillStyle = `rgba(238,243,248,${0.15 + r * 0.6})`; g.fillRect(rnd() * W, rnd() * H, r > 0.9 ? 2 : 1, r > 0.9 ? 2 : 1); }
}

/** A comet: a bright head at (x, y) with a tail pointing away from (tx, ty). */
function comet(x, y, tx, ty, size = 1, heat = 0) {
  const dx = x - tx, dy = y - ty, L = Math.hypot(dx, dy) || 1;
  const grd = ctx.createLinearGradient(x, y, x - (dx / L) * 220 * size, y - (dy / L) * 220 * size);
  grd.addColorStop(0, heat > 0 ? `rgba(255,122,61,${0.6 * heat})` : C.cometSoft); grd.addColorStop(1, 'rgba(127,227,208,0)');
  ctx.fillStyle = grd; ctx.beginPath(); ctx.moveTo(x + (dy / L) * 16 * size, y - (dx / L) * 16 * size); ctx.lineTo(x - (dx / L) * 220 * size, y - (dy / L) * 220 * size); ctx.lineTo(x - (dy / L) * 16 * size, y + (dx / L) * 16 * size); ctx.closePath(); ctx.fill();
  ctx.fillStyle = heat > 0.5 ? C.hot : heat > 0 ? C.heat : C.comet; ctx.beginPath(); ctx.arc(x, y, 18 * size, 0, 7); ctx.fill();
}

// ---------- A: the comet and its cargo ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { font(700, 22); text('COMETS AND THE ORIGIN OF LIFE', CX, 136, { align: 'center', color: C.soft, spacing: '3px' }); });
    const p = eio(seg(t, 0.4, 3.0));
    comet(lerp(140, 560, p), lerp(240, 420, p), 60, 200, 1.4);
    // HCN molecule: H–C≡N
    A(seg(t, 1.6, 2.4), () => {
      const mx = 520, my = 560;
      ctx.strokeStyle = C.hcn; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(mx - 90, my); ctx.lineTo(mx - 20, my); ctx.stroke();
      for (const d of [-7, 0, 7]) { ctx.beginPath(); ctx.moveTo(mx + 20, my + d); ctx.lineTo(mx + 90, my + d); ctx.stroke(); }
      for (const [x, lab] of [[mx - 110, 'H'], [mx, 'C'], [mx + 110, 'N']]) { ctx.fillStyle = C.bg2; ctx.beginPath(); ctx.arc(x, my, 26, 0, 7); ctx.fill(); ctx.strokeStyle = C.hcn; ctx.lineWidth = 3; ctx.stroke(); font(700, 30); text(lab, x, my + 2, { align: 'center', color: C.hcn }); }
      font(500, 24, TXT); text('hydrogen cyanide, HCN: one hydrogen, one carbon, one nitrogen', CX, 630, { align: 'center', color: C.soft });
      font(500, 22, TXT); text('found on comet 67P by the Rosetta mission', CX, 666, { align: 'center', color: C.faint });
    });
    A(seg(t, 5.0, 5.6), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 700, 684, 60, 10); ctx.fill();
      font(500, 22, TXT); text('Anslow and colleagues, Scientific Reports, 28 October 2026', CX, 730, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B: speed and energy ----------
function sceneSpeed(t) {
  const a = span(t, 9.2, 18.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 22); text('SPEED AND ENERGY', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    // Earth, a comet falling in
    ctx.fillStyle = '#2b6cb0'; ctx.beginPath(); ctx.arc(CX, 560, 120, 0, 7); ctx.fill();
    ctx.fillStyle = '#3f9b5a'; ctx.beginPath(); ctx.ellipse(CX - 30, 540, 50, 34, 0.4, 0, 7); ctx.fill();
    const p = eio(seg(t, 9.6, 12.4));
    comet(lerp(120, CX - 90, p), lerp(200, 470, p), 40, 120, 1);
    A(seg(t, 10.0, 10.6), () => {
      font(700, 44); text(`${V_EARTH} km/s`, 804, 250, { align: 'right', color: C.gold });
      font(500, 24, TXT); text('average impact speed on Earth', 804, 294, { align: 'right', color: C.soft });
      font(500, 22, TXT); text(`never below ${V_MIN} km/s: Earth’s own pull`, 804, 330, { align: 'right', color: C.faint });
    });
    A(seg(t, 14.0, 14.6), () => {
      const g = eio(seg(t, 14.2, 16.6));
      ctx.fillStyle = C.panel; k.rrect(60, 650, 744, 110, 12); ctx.fill();
      font(500, 24, TXT); text('energy per kilogram = ½ × speed²', 80, 682, { color: C.ink });
      font(700, 34); text(`${fmt(energyMJ(V_EARTH) * g)} MJ`, 80, 730, { color: C.heat });
      font(500, 24, TXT); text(`≈ ${Math.round(TNT_X * g)} × a kilogram of TNT (${TNT} MJ)`, 300, 730, { color: C.soft });
    });
  });
}

// ---------- C: heat and survival ----------
function sceneHeat(t) {
  const a = span(t, 18.4, 32.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 27.6) {
      font(700, 22); text('THE SHOCK', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      // temperature vs speed, as a thermometer bar climbing with speed
      const heat = eio(seg(t, 18.8, 22.0));
      comet(CX, 300, CX - 300, 80, 1.3, heat);
      ctx.fillStyle = '#334'; ctx.fillRect(100, 380, 664, 8);
      const v = lerp(5, V_EARTH, heat), T = peakT(v);
      font(700, 30); text(`${v.toFixed(1)} km/s → ${fmt(T)} K`, CX, 430, { align: 'center', color: T > T_BREAK ? C.hot : C.heat });
      font(500, 20, TXT); text('median peak temperature in the models, T ≈ 18 × v^2.17', CX, 466, { align: 'center', color: C.faint });
      A(seg(t, 23.2, 23.8), () => {
        ctx.fillStyle = C.panel; k.rrect(60, 500, 744, 260, 12); ctx.fill();
        const bx = 100, bw = 664, Tx = (T) => bx + bw * clamp(T / 30000);
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; k.rrect(bx, 560, bw, 20, 10); ctx.fill();
        const grd = ctx.createLinearGradient(bx, 0, bx + bw, 0); grd.addColorStop(0, C.hcn); grd.addColorStop(T_BREAK / 30000, C.hcn); grd.addColorStop(T_NONE / 30000, C.hot); grd.addColorStop(1, C.hot);
        ctx.fillStyle = grd; k.rrect(bx, 560, bw, 20, 10); ctx.fill();
        [[T_BREAK, 'HCN breaks'], [T_NONE, 'none left']].forEach(([T, lab], i) => { ctx.fillStyle = C.ink; ctx.fillRect(Tx(T) - 1, 540, 2, 60); font(600, 20); text(`${fmt(T)} K · ${lab}`, Tx(T), i ? 620 : 526, { align: 'left', color: i ? C.soft : C.ink }); });
        font(500, 20, TXT); text('0 K', bx, 650, { color: C.faint }); text('30,000 K', bx + bw, 650, { align: 'right', color: C.faint });
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(Tx(peakT(V_EARTH)), 596); ctx.lineTo(Tx(peakT(V_EARTH)) - 10, 614); ctx.lineTo(Tx(peakT(V_EARTH)) + 10, 614); ctx.fill();
        font(600, 22); text(`${V_EARTH} km/s head-on: ${fmt(peakT(V_EARTH))} K`, CX, 700, { align: 'center', color: C.gold });
        font(500, 20, TXT); text(`${V_MIN} km/s head-on: ${fmt(peakT(V_MIN))} K · just under the limit`, CX, 736, { align: 'center', color: C.soft });
      });
    } else {
      font(700, 22); text('HCN SURVIVING A HEAD-ON HIT · 1 KM COMET', CX, 136, { align: 'center', color: C.soft, spacing: '2px' });
      const x0 = 150, x1 = 780, y0 = 200, y1 = 640;
      const X = (v) => lerp(x0, x1, (v - 0) / 20), Y = (p) => lerp(y1, y0, p / 100);
      for (const p of [0, 50, 100]) { ctx.fillStyle = C.line; ctx.fillRect(x0, Y(p), x1 - x0, 1); font(500, 20); text(`${p}%`, x0 - 12, Y(p), { align: 'right', color: C.faint }); }
      for (const v of [0, 5, 10, 15, 20]) { font(500, 20); text(`${v}`, X(v), y1 + 26, { align: 'center', color: C.faint }); }
      font(500, 20, TXT); text('impact speed, km/s', CX, y1 + 60, { align: 'center', color: C.soft });
      ctx.strokeStyle = C.hcn; ctx.lineWidth = 5; ctx.beginPath();
      const pts = [[0, 100], ...SURVIVAL, [20, 0]];
      pts.forEach(([v, p], i) => (i ? ctx.lineTo(X(v), Y(p)) : ctx.moveTo(X(v), Y(p))));
      ctx.stroke();
      SURVIVAL.forEach(([v, p], i) => A(eout(seg(t, 28.0 + i * 0.6, 28.6 + i * 0.6)), () => {
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(X(v), Y(p), 9, 0, 7); ctx.fill();
        font(700, 24); text(`${p}%`, X(v) + 16, Y(p) - 18, { color: C.gold });
      }));
      font(500, 20, TXT); text('McDonald and colleagues, 2025, equilibrium chemistry', CX, 720, { align: 'center', color: C.faint });
    }
  });
}

// ---------- D: angle, air, land ----------
function sceneAngle(t) {
  const a = span(t, 32.2, 46.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 22); text('WHAT A DELIVERY NEEDS', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    // ground line and two trajectories: head-on and grazing
    const gy = 470;
    ctx.fillStyle = '#28435c'; ctx.fillRect(60, gy, 744, 8);
    const [h1, h2] = [peakT(V_EARTH, 90), peakT(V_EARTH, 15)];
    A(seg(t, 32.6, 33.2), () => {
      comet(300, gy - 20, 300, 180, 0.9, 1);
      font(600, 22); text(`head-on · ${fmt(h1)} K`, 300, gy + 40, { align: 'center', color: C.hot });
      comet(620, gy - 16, 120, gy - 150, 0.9, 0.2);
      font(600, 22); text(`15° grazing · ${fmt(h2)} K`, 620, gy + 40, { align: 'center', color: C.heat });
      font(500, 20, TXT); text('heat scales with sin(angle)^1.6 in the models', CX, gy + 76, { align: 'center', color: C.faint });
    });
    const rows = [['big', 'over 100 m, or it bursts in the air', 34.4], ['slow', `near the ${V_MIN} km/s floor`, 35.0], ['grazing', 'a low angle, little heat', 35.6], ['on land', 'an ocean would dilute the HCN', 37.2]];
    rows.forEach(([key, why, at], i) => A(eout(seg(t, at, at + 0.6)), () => {
      const y = 590 + i * 44;
      font(700, 24); text(key, 120, y, { color: C.green });
      font(500, 22, TXT); text(why, 260, y, { color: C.soft });
    }));
    A(seg(t, 41.6, 42.2), () => {
      ctx.fillStyle = 'rgba(2,4,8,0.9)'; k.rrect(60, 180, 744, 110, 12); ctx.fill();
      font(500, 24, TXT); text(`over ${fmt(COMETS)} comets above 100 m hit the early Earth`, CX, 216, { align: 'center', color: C.ink });
      font(700, 30); text(`best case: ${EARTH_BEST} deliveries`, CX, 262, { align: 'center', color: C.gold });
    });
  });
}

// ---------- E + F: histories, Mars, other routes ----------
function sceneCount(t) {
  const a = eout(seg(t, 46.0, 46.8));
  if (a <= 0) return;
  A(a, () => {
    font(700, 22); text('SIMULATED HISTORIES OF THE EARLY SOLAR SYSTEM', CX, 136, { align: 'center', color: C.soft, spacing: '2px' });
    // 100 tiles: 54 dark (no delivery), 46 lit
    const cols = 20, s = 34, x0 = CX - (cols * s) / 2 + 4, y0 = 180;
    for (let i = 0; i < 100; i++) {
      const g = eout(seg(t, 46.2 + i * 0.015, 46.6 + i * 0.015));
      A(g, () => { ctx.fillStyle = i < NONE_SHARE ? 'rgba(255,59,59,0.55)' : 'rgba(141,227,154,0.75)'; k.rrect(x0 + (i % cols) * s, y0 + Math.floor(i / cols) * s, s - 6, s - 6, 4); ctx.fill(); });
    }
    A(seg(t, 47.8, 48.4), () => {
      font(600, 24); text(`${NONE_SHARE} of 100: not a single delivery`, 100, 380, { color: C.hot });
      font(600, 24); text(`${100 - NONE_SHARE} of 100: at least one`, 100, 418, { color: C.green });
    });
    A(eout(seg(t, 50.8, 51.5)), () => {
      const bars = [['Earth', EARTH_BEST, C.hcn], ['Mars', MARS_BEST, C.heat]];
      bars.forEach(([n, v, col], i) => {
        const y = 480 + i * 70;
        font(700, 26); text(n, 100, y, { color: col });
        ctx.fillStyle = col; k.rrect(190, y - 16, 560 * (v / MARS_BEST), 32, 6); ctx.fill();
        font(700, 26); text(`${v}`, 190 + 560 * (v / MARS_BEST) + 14, y, { color: C.ink });
      });
      font(500, 20, TXT); text(`best-case deliveries · Mars is hit at about ${Math.round(V_MARS)} km/s and has thin air`, CX, 610, { align: 'center', color: C.faint });
    });
    A(seg(t, 55.6, 56.2), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 650, 744, 100, 12); ctx.fill();
      font(500, 24, TXT); text('other routes for life’s cyanide: carbon-rich asteroids, volcanoes, hot vents', CX, 686, { align: 'center', color: C.ink });
      font(500, 22, TXT); text('“at best, a one-off fluke” · Richard Anslow, lead author', CX, 724, { align: 'center', color: C.soft });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneSpeed(t);
    sceneHeat(t);
    sceneAngle(t);
    sceneCount(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.hcn, '~': C.heat, '^': C.gold } });
  },
});
