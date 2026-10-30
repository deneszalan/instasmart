// Explainer for history-swiss-guard-sack-of-rome (Roma): why the Pontifical Swiss Guard swears in its recruits on
// 6 May. It dates itself to 22 January 1506, when 150 Swiss marched into Rome for Pope Julius II; on 6 May 1527,
// when the Emperor Charles V's army stormed Rome, 147 of its 189 men died and 42 took Pope Clement VII along the
// Passetto to Castel Sant'Angelo. The angle is the Guard's: the numbers and the route on a map of today, with no
// fighting on screen. Look: night stone and the Guard's blue, yellow and red; dots for the men.
// Grenze Gotisch for titles, Alegreya Sans for captions and labels.
//
// Facts:
// - Pontifical Swiss Guard, "Geschichte" (schweizergarde.ch): the official founding day is 22 January 1506, when 150
//   Swiss under their captain Kaspar von Silenen of Uri marched through the Porta del Popolo into Rome and then into
//   the Vatican for the first time, where Pope Julius II blessed them. 1527: the Emperor's German, Spanish and
//   Italian mercenaries, unpaid for over two years, stormed Rome on the morning of 6 May; the whole Guard had gathered
//   by the obelisk, which then stood near the Campo Santo Teutonico; commander Kaspar Röist was wounded and later
//   killed; of the 189 Swiss only the 42 who escorted Clement VII to Castel Sant'Angelo survived, the rest fell; the
//   escape was made possible by the passage called the "Passetto" on the wall from the Vatican to the castle; eight
//   days of terror followed; Clement VII surrendered on 5 June (Wikipedia: 6 June); the Guard was disbanded and
//   replaced by 200 landsknechts; the list of commanders is vacant from 1527 to 1548. "Vereidigung": the oath is
//   held each year on 6 May in memory of 1527; the chaplain reads the formula and each recruit answers at the flag.
// - Swiss Guard press release, 28 April 2026: 28 guards sworn in on 6 May 2026 in the San Damaso courtyard, on the
//   Guard's flag, in the presence of Pope Leo XIV; the oath: to serve the reigning pope and his legitimate
//   successors faithfully, loyally and honourably, ready if need be to give one's life to protect them. Press
//   release, 4 October 2026: 147 guards lost their lives, 42 escorted the pope to Castel Sant'Angelo; since 1911 the
//   swearing-in of the new guards each year on 6 May recalls it; 2027 is the 500th anniversary.
// - Wikipedia, "Swiss Guard": 147 of the 189 guards, including the commander Kaspar Röist, died (after Royal 2006);
//   the survivors escorted Clement VII through the Passetto di Borgo; the Guard re-formed in 1548 with 150 new
//   guardsmen under Jost von Meggen; at the oath each recruit grasps the flag with his left hand and raises his
//   right hand with thumb, index and middle finger extended, for the Holy Trinity; 135 members (2024).
// - Wikipedia, "Sack of Rome (1527)" and "Passetto di Borgo": Charles III, Duke of Bourbon, led the mutinous
//   imperial army and was killed at the walls; the Passetto is a corridor of about 800 m in an old wall.
// - Geography: OpenStreetMap (Nominatim) for the Passetto, St Peter's Basilica, Castel Sant'Angelo, the obelisk,
//   the Porta del Popolo and Piazza dei Protomartiri Romani (by the Campo Santo Teutonico, used here for the
//   obelisk's place in 1527, approximate); the Tiber and the border of Vatican City simplified.
// Computed here: 189 − 147 = 42; 1527 − 1506 = 21 years; 1548 − 1527 = 21 years without a Swiss Guard.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  22 January 1506: 150 Swiss march in at the Porta del Popolo, to the Vatican and Julius II.
//  B  9.6–18.6  6 May 1527: the imperial army; 189 guards by the obelisk beside St Peter's.
//  C 18.8–27.8  The Passetto, about 800 m, to Castel Sant'Angelo.
//  D 28.0–37.0  147 died; 42 take Clement VII along the Passetto.
//  E 37.2–46.2  The sack, the surrender, the Guard disbanded; re-formed in 1548; about 135 today.
//  F 46.4–55.4  The oath on 6 May since 1911: the flag and three fingers.
//  G 55.6–65.0  The words of the oath; 28 recruits on 6 May 2026; 500 years in 2027.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg: '#111319', bg2: '#1b1f2a', ink: '#f2eee6', soft: 'rgba(242,238,230,0.74)', faint: 'rgba(242,238,230,0.2)',
  blue: '#3b6fd6', yellow: '#f0b429', red: '#d64535', stone: '#c8b89a', stone2: '#8f826b', river: '#3d6f8f',
  silver: '#b8c0d0', fallen: 'rgba(184,192,208,0.45)', white: '#ffffff', army: '#a8473c',
};
const GOTH = 'Grenze Gotisch', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const FOUNDED = 1506, FIRST = 150, SACK = 1527, GUARDS = 189, DIED = 147, REFORMED = 1548, REFORM_MEN = 150, TODAY = 135, OATH_SINCE = 1911, RECRUITS_2026 = 28, PASSETTO_M = 800;
const SURVIVED = GUARDS - DIED;
if (SURVIVED !== 42 || SACK - FOUNDED !== 21 || REFORMED - SACK !== 21) throw new Error('numbers');

// ---------- geography (lat, lon) ----------
const TIBER = [[41.9316, 12.4596], [41.9187, 12.4708], [41.9144, 12.4707], [41.9097, 12.4724], [41.905, 12.4743], [41.9027, 12.4713], [41.9019, 12.4665], [41.9011, 12.4643], [41.8998, 12.4635], [41.8961, 12.466], [41.8923, 12.4707]];
const BORDER = [[41.90197, 12.44579], [41.90164, 12.44655], [41.9014, 12.44734], [41.901, 12.44797], [41.90069, 12.44795], [41.90082, 12.44877], [41.901, 12.44878], [41.90083, 12.45087], [41.90059, 12.45084], [41.90036, 12.45181], [41.90028, 12.45279], [41.90049, 12.45283], [41.9002, 12.45452], [41.90071, 12.45435], [41.9014, 12.45433], [41.9015, 12.45481], [41.90167, 12.45626], [41.90126, 12.4568], [41.90117, 12.45736], [41.90136, 12.45795], [41.90166, 12.45825], [41.90226, 12.45837], [41.90276, 12.45821], [41.90316, 12.45783], [41.90329, 12.45734], [41.90319, 12.45675], [41.90279, 12.4563], [41.90276, 12.45618], [41.90312, 12.45653], [41.90335, 12.45708], [41.90333, 12.45756], [41.90582, 12.45766], [41.9063, 12.45566], [41.90738, 12.4554], [41.90698, 12.45383], [41.90667, 12.45315], [41.90653, 12.45206], [41.90637, 12.45143], [41.90658, 12.45137], [41.90649, 12.45051], [41.90599, 12.45032], [41.90584, 12.45052], [41.90504, 12.44945], [41.90504, 12.44894], [41.90468, 12.4491], [41.90361, 12.44865], [41.90342, 12.44791], [41.90312, 12.44764], [41.90299, 12.44786], [41.90219, 12.44687], [41.90235, 12.44662]];
const BASILICA = [[41.90217, 12.4524], [41.90188, 12.45271], [41.90167, 12.45272], [41.90168, 12.45298], [41.90146, 12.45334], [41.90162, 12.45367], [41.90151, 12.45366], [41.90151, 12.45373], [41.90169, 12.45378], [41.90173, 12.45433], [41.90182, 12.45434], [41.90182, 12.45475], [41.90166, 12.45475], [41.90164, 12.45502], [41.90268, 12.45501], [41.90267, 12.45482], [41.90251, 12.4548], [41.90251, 12.45428], [41.9026, 12.45428], [41.90262, 12.45377], [41.90283, 12.45349], [41.90286, 12.4533], [41.90264, 12.45296], [41.90265, 12.45267], [41.90247, 12.45271], [41.90217, 12.4524]];
const CASTLE = [[41.9035, 12.46557], [41.90331, 12.46564], [41.90328, 12.4658], [41.90274, 12.46585], [41.90264, 12.46568], [41.90253, 12.46578], [41.90254, 12.46596], [41.90263, 12.466], [41.90265, 12.46676], [41.90255, 12.46688], [41.90262, 12.46702], [41.90275, 12.46698], [41.90276, 12.46689], [41.90332, 12.46686], [41.90335, 12.46704], [41.90344, 12.46709], [41.90362, 12.46697], [41.90359, 12.46671], [41.90345, 12.46668], [41.90342, 12.46597], [41.90355, 12.46591], [41.90358, 12.46578]];
const PASSETTO = [[41.9034, 12.45656], [41.90313, 12.45935], [41.9031, 12.46014], [41.90338, 12.46283], [41.90336, 12.46435], [41.90342, 12.46559]];
const OBELISK_1527 = [41.90157, 12.45445], OBELISK_NOW = [41.90224, 12.45726], CASTLE_C = [41.90311, 12.46634], POPOLO = [41.91153, 12.476], VATICAN_C = [41.9032, 12.4545];
const KM = 111.32, COSL = Math.cos((41.903 * Math.PI) / 180);
let VIEW = { lat: 41.906, lon: 12.4625, px: 330, vx: CX, vy: 420 };
const P = ([la, lo]) => [VIEW.vx + (lo - VIEW.lon) * COSL * KM * VIEW.px, VIEW.vy - (la - VIEW.lat) * KM * VIEW.px];
function poly(pts, close = true) { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = P(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); if (close) ctx.closePath(); }
// a point a fraction u along a polyline (in lat, lon)
function along(pts, u) {
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot((pts[i][0] - pts[i - 1][0]) * KM, (pts[i][1] - pts[i - 1][1]) * KM * COSL); L.push(d); tot += d; }
  let r = clamp(u) * tot;
  for (let i = 0; i < L.length; i++) { if (r <= L[i] || i === L.length - 1) { const f = L[i] ? clamp(r / L[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; } r -= L[i]; }
  return pts.at(-1);
}
const VIEW_ROME = { lat: 41.9074, lon: 12.4652, px: 300, vx: CX, vy: 440 };
const VIEW_BORGO = { lat: 41.9015, lon: 12.45975, px: 580, vx: CX, vy: 430 };
const mix = (a, b, z) => ({ lat: lerp(a.lat, b.lat, z), lon: lerp(a.lon, b.lon, z), px: a.px * Math.pow(b.px / a.px, z), vx: lerp(a.vx, b.vx, z), vy: lerp(a.vy, b.vy, z) });

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, `The Pope’s Swiss Guard dates itself to *22 January ${FOUNDED}*, when ${FIRST} Swiss marched into Rome.`],
  [5.0, 9.4, 'Captain Kaspar von Silenen led them in at the Porta del Popolo, to Pope *Julius II* in the Vatican.'],
  [9.6, 14.0, `${SACK - FOUNDED} years later, on *6 May ${SACK}*, the unpaid army of Emperor Charles V stormed Rome.`],
  [14.2, 18.6, `The Guard’s ${GUARDS} men gathered by the obelisk, which then stood beside St Peter’s Basilica.`],
  [18.8, 23.2, `The way to safety for Pope Clement VII: the *Passetto*, a corridor about ${PASSETTO_M} m long in a wall.`],
  [23.4, 27.8, 'It runs from the Vatican to *Castel Sant’Angelo*, the tomb of Emperor Hadrian turned papal fortress.'],
  [28.0, 32.4, `~${DIED}~ of the ${GUARDS} guards died that day, among them their commander, Kaspar Röist.`],
  [32.6, 37.0, `The other *${SURVIVED}* escorted Pope Clement VII along the Passetto, into the safety of the castle.`],
  [37.2, 41.6, 'Rome was looted for eight days. A month later the pope surrendered, and the Guard was disbanded.'],
  [41.8, 46.2, `It was formed again in *${REFORMED}*, with ${REFORM_MEN} new guards. Today it has about ${TODAY} men.`],
  [46.4, 50.8, `Since ${OATH_SINCE}, its new recruits have, as a rule, sworn their oath on the anniversary: *6 May*.`],
  [51.0, 55.4, 'Each one grasps the Guard’s flag with his left hand and raises three fingers, a sign of the Trinity.'],
  [55.6, 60.0, 'He swears to serve the pope faithfully, ready if need be to give his own life to protect him.'],
  [60.2, 64.6, `On 6 May 2026, ${RECRUITS_2026} recruits took the oath before Pope Leo XIV. In 2027 it will be *500 years*.`],
];

// ---------- background and helpers ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg); lg.addColorStop(0.65, C.bg2); lg.addColorStop(1, '#0d0f14');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // the Guard's colours as a thin band down the left edge
  [C.blue, C.yellow, C.red].forEach((c, i) => { g.fillStyle = c; g.globalAlpha = 0.85; g.fillRect(i * 6, 0, 6, H); });
  g.globalAlpha = 1;
}
function label(str, x, y, { size = 22, col = C.ink, align = 'left', weight = 500, fam = SANS } = {}) { font(weight, size, fam); text(str, x, y, { align, base: 'middle', color: col }); }
function pill(str, x, y, col, { align = 'center', size = 22 } = {}) {
  font(700, size); const w = ctx.measureText(str).width, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.fillStyle = 'rgba(17,19,25,0.9)'; k.rrect(x0 - 12, y - size * 0.8, w + 24, size * 1.6, 8); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
  text(str, x0, y, { base: 'middle', color: col });
}
function dot(x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
function ring(x, y, r, col, w = 1.5) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); }
const hash = (i) => { const x = Math.sin(i * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
// a cluster of n men around (x, y), on a sunflower spiral
const cluster = (i, x, y, s = 4.2) => { const r = s * Math.sqrt(i + 0.5), a = i * 2.39996; return [x + r * Math.cos(a), y + r * Math.sin(a)]; };

function river() { ctx.strokeStyle = C.river; ctx.lineWidth = Math.max(8, 0.05 * VIEW.px); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; poly(TIBER, false); ctx.stroke(); }
function borgo(a, { passetto = 0, border = 1 } = {}) {
  A(a, () => {
    river();
    A(border, () => { poly(BORDER); ctx.fillStyle = 'rgba(200,184,154,0.07)'; ctx.fill(); ctx.strokeStyle = 'rgba(200,184,154,0.4)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]); });
    poly(BASILICA); ctx.fillStyle = C.stone2; ctx.fill(); ctx.strokeStyle = C.stone; ctx.lineWidth = 2; ctx.stroke();
    const [dx, dy] = P([41.90218, 12.45333]); ring(dx, dy, 0.022 * VIEW.px, C.stone, 2);
    poly(CASTLE); ctx.fillStyle = C.stone2; ctx.fill(); ctx.strokeStyle = C.stone; ctx.lineWidth = 2; ctx.stroke();
    const [cx, cy] = P(CASTLE_C); ring(cx, cy, 0.03 * VIEW.px, C.stone, 2.5);
    if (passetto > 0) {
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
      const n = 60; for (let i = 0; i <= n * passetto; i++) { const [x, y] = P(along(PASSETTO, i / n)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
  });
}

// ---------- A: 1506 ----------
function scene1506(t) {
  const a = span(t, 0, 9.6, 0.5, 0.4);
  if (a <= 0) return;
  VIEW = { ...VIEW_ROME };
  A(a, () => {
    river();
    poly(BORDER); ctx.fillStyle = 'rgba(200,184,154,0.16)'; ctx.fill();
    const [px, py] = P(POPOLO), [vx, vy] = P(VATICAN_C);
    // the gate
    ctx.fillStyle = C.stone; ctx.fillRect(px - 14, py - 18, 28, 26); ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(px, py + 8, 7, Math.PI, 0); ctx.fill();
    label('Porta del Popolo', px - 26, py - 6, { size: 24, weight: 700, col: C.stone, align: 'right' });
    label('the Vatican', vx, vy - 64, { size: 24, weight: 700, col: C.stone, align: 'center' });
    label('Tiber', 470, 640, { size: 24, col: C.river, weight: 700 });
    // the 150 men: in at the gate (1.0–4.4), then to the Vatican (5.6–8.6)
    const go = eio(seg(t, 5.6, 8.6));
    for (let i = 0; i < FIRST; i++) {
      const enter = clamp((t - 1.0 - i * 0.02) / 0.6);
      if (enter <= 0) continue;
      const [ax, ay] = cluster(i, px - 10, py + 60, 4.4), [bx, by] = cluster(i, vx, vy, 4.4);
      const mx = (ax + bx) / 2, my = Math.min(ay, by) - 20;
      const u = clamp(go * 1.15 - (i / FIRST) * 0.15);
      const x = (1 - u) * (1 - u) * ax + 2 * u * (1 - u) * mx + u * u * bx, y = (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * my + u * u * by;
      ctx.globalAlpha = enter * a; dot(lerp(px, x, enter), lerp(py, y, enter), 3.2, i % 3 === 0 ? C.blue : i % 3 === 1 ? C.yellow : C.red);
    }
    ctx.globalAlpha = 1;
    A(seg(t, 5.4, 6.0), () => {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(px - 30, py + 50); ctx.quadraticCurveTo((px + vx) / 2, Math.min(py, vy) - 10, vx + 40, vy + 4); ctx.stroke(); ctx.setLineDash([]);
      label('route schematic', (px + vx) / 2 + 30, (py + vy) / 2 + 40, { size: 22, col: C.soft });
    });
    A(seg(t, 7.8, 8.6), () => pill('blessed by Pope Julius II', vx, vy + 70, C.yellow));
    // title
    A(seg(t, 0.3, 1.0), () => {
      label(`22 January ${FOUNDED}`, 40, 96, { size: 52, col: C.ink, fam: GOTH, weight: 600 });
      label('Rome · schematic map', 42, 140, { size: 22, col: C.soft });
    });
    const n = Math.min(FIRST, Math.round(clamp((t - 1.0) / (FIRST * 0.02 + 0.6)) * FIRST));
    A(seg(t, 1.0, 1.6), () => { label(`${n}`, 680, 640, { size: 72, col: C.yellow, fam: GOTH, weight: 700, align: 'center' }); label('Swiss soldiers', 680, 690, { size: 24, col: C.ink, align: 'center', weight: 700 }); });
  });
}

// ---------- B, C, D: 1527 in the Borgo ----------
function scene1527(t) {
  const a = span(t, 9.6, 37.2, 0.5, 0.5);
  if (a <= 0) return;
  VIEW = mix(VIEW_ROME, VIEW_BORGO, eio(seg(t, 9.6, 11.0)));
  const pas = eio(seg(t, 19.2, 21.6));
  borgo(a, { passetto: pas, border: 0.5 });
  A(a, () => {
    const [ox, oy] = P(OBELISK_1527), [nx, ny] = P(OBELISK_NOW), [cx, cy] = P(CASTLE_C);
    // labels for the places
    A(seg(t, 11.0, 11.8), () => {
      const [bx, by] = P([41.9029, 12.4537]);
      label('St Peter’s Basilica', bx, by - 50, { size: 22, weight: 700, col: C.stone, align: 'center' });
      label('outline of today', bx, by - 24, { size: 22, col: C.soft, align: 'center' });
      const [rx, ry] = P([41.8998, 12.4635]); label('Tiber', rx - 26, ry, { size: 24, col: C.river, weight: 700, align: 'right' });
    });
    // the imperial army: an arrow from the south-west, no more
    A(seg(t, 12.0, 12.8) * (1 - seg(t, 27.6, 28.4)), () => {
      const sx = 60, sy = 700, ex = 112, ey = 590;
      ctx.strokeStyle = C.army; ctx.fillStyle = C.army; ctx.lineWidth = 10; ctx.lineCap = 'butt';
      const u = eio(seg(t, 12.0, 13.4)), qx = lerp(sx, ex, u), qy = lerp(sy, ey, u);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(qx, qy); ctx.stroke();
      const an = Math.atan2(ey - sy, ex - sx); ctx.beginPath(); ctx.moveTo(qx + Math.cos(an) * 16, qy + Math.sin(an) * 16); ctx.lineTo(qx + Math.cos(an + 2.3) * 18, qy + Math.sin(an + 2.3) * 18); ctx.lineTo(qx + Math.cos(an - 2.3) * 18, qy + Math.sin(an - 2.3) * 18); ctx.closePath(); ctx.fill();
      label('the Emperor’s army', sx + 70, sy + 6, { size: 24, col: '#d86a5c', weight: 700 });
    });
    // the obelisk in 1527, and where it stands now
    A(seg(t, 14.6, 15.4), () => {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(ox, oy - 26); ctx.lineTo(ox + 5, oy - 4); ctx.lineTo(ox - 5, oy - 4); ctx.closePath(); ctx.fill();
      ring(nx, ny, 5, C.soft, 2);
      label('obelisk today, moved in 1586', nx + 14, ny - 24, { size: 22, col: C.soft });
    });
    // the 189 guards: gather (14.6–16.4); 147 die (28.6–30.0); 42 go along the Passetto with the pope (33.0–36.4)
    const gather = eio(seg(t, 14.6, 16.4)), fall = seg(t, 28.6, 30.0), walk = eio(seg(t, 33.0, 36.4));
    if (gather > 0) {
      for (let i = 0; i < GUARDS; i++) {
        const [gx, gy] = cluster(i, ox, oy + 30, 4.0), sx = ox - 60 + hash(i) * 40, sy = oy + 120 + hash(i + 7) * 40;
        let x = lerp(sx, gx, gather), y = lerp(sy, gy, gather);
        const survivor = i % 9 < 2; // 42 of 189 spread through the group
        let al = 1;
        if (survivor && walk > 0) {
          // the route from the square to the Passetto is not recorded: fade out here, in again at the Passetto
          const j = Math.floor(i / 9) * 2 + (i % 9), lag = (j / SURVIVED) * 0.2;
          const u = clamp((walk - lag) / 0.8);
          if (u < 0.2) al = Math.abs(1 - u / 0.1);
          if (u >= 0.1) { const [px, py] = P(along(PASSETTO, clamp((u - 0.2) / 0.8))); x = px + (hash(i) - 0.5) * 12; y = py + (hash(i + 3) - 0.5) * 12; }
        }
        if (!survivor && fall > 0) { ctx.globalAlpha = a; ring(x, y, 2.6, C.fallen, 1.2); ctx.globalAlpha = a * (1 - fall); dot(x, y, 2.9, C.blue); ctx.globalAlpha = 1; continue; }
        ctx.globalAlpha = a * clamp(al); dot(x, y, 2.9, survivor && fall > 0 ? C.yellow : C.blue); ctx.globalAlpha = 1;
      }
    }
    A(seg(t, 15.4, 16.2) * (1 - seg(t, 27.8, 28.4)), () => {
      label('the obelisk in 1527', ox + 66, oy + 18, { size: 22, col: C.ink, weight: 700 });
      pill(`the Swiss Guard: ${GUARDS}`, ox + 66, oy + 70, C.blue, { size: 22, align: 'left' });
    });
    // the pope
    if (walk > 0) {
      const u = clamp((walk - 0.15) / 0.85), [px, py] = P(along(PASSETTO, u));
      A(seg(walk, 0.1, 0.25), () => {
        dot(px, py - 16, 7, C.white); ring(px, py - 16, 10, C.yellow, 2);
        label('Clement VII', px, py - 42, { size: 22, weight: 700, col: C.white, align: 'center' });
      });
    }
    // the Passetto and the castle
    A(seg(t, 20.6, 21.4), () => {
      const [mx, my] = P(along(PASSETTO, 0.45));
      label(`Passetto, about ${PASSETTO_M} m`, mx, my - 36, { size: 26, weight: 700, col: C.yellow, align: 'center' });
    });
    A(seg(t, 23.8, 24.6), () => {
      label('Castel Sant’Angelo', cx - 40, cy - 124, { size: 24, weight: 700, col: C.stone, align: 'center' });
      label('Hadrian’s tomb,', cx - 20, cy + 70, { size: 22, col: C.soft, align: 'center' });
      label('a papal fortress', cx - 20, cy + 96, { size: 22, col: C.soft, align: 'center' });
    });
    // the numbers
    A(seg(t, 28.4, 29.2), () => {
      const x = 56, y = 150;
      label(`6 May ${SACK}`, x, 92, { size: 44, fam: GOTH, weight: 600 });
      label(`of the ${GUARDS} guards:`, x, y, { size: 24, col: C.soft });
      ring(x + 12, y + 42, 10, C.fallen, 2); label(`${DIED} died`, x + 34, y + 42, { size: 32, weight: 700, col: C.silver });
      A(seg(t, 32.8, 33.4), () => { dot(x + 12, y + 86, 10, C.yellow); label(`${SURVIVED} escorted the pope`, x + 34, y + 86, { size: 32, weight: 700, col: C.yellow }); });
    });
    A(seg(t, 9.8, 10.6) * (1 - seg(t, 27.8, 28.4)), () => label(`6 May ${SACK}`, 56, 92, { size: 44, fam: GOTH, weight: 600 }));
  });
}

// ---------- E: what became of the Guard ----------
const COLS_E = [
  { when: '1506', sub: 'founded', n: FIRST, col: C.yellow, at: 37.4 },
  { when: '6 May 1527', sub: 'morning', n: GUARDS, col: C.blue, at: 37.4 },
  { when: '6 May 1527', sub: 'evening', n: SURVIVED, col: C.yellow, at: 37.8 },
  { when: '1527–1548', sub: 'disbanded', n: 0, col: C.red, at: 39.4 },
  { when: '1548', sub: 'formed again', n: REFORM_MEN, col: C.blue, at: 42.0 },
  { when: 'today', sub: 'about', n: TODAY, col: C.yellow, at: 43.2 },
];
function sceneAfter(t) {
  const a = span(t, 37.2, 46.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    label('THE SWISS GUARD, IN MEN', 56, 100, { size: 26, weight: 800, col: C.ink });
    label('not to scale in time', 56, 134, { size: 22, col: C.soft });
    const base = 560, top = 220, cw = 124, x0 = CX - (COLS_E.length - 1) * cw / 2;
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(40, base); ctx.lineTo(W - 40, base); ctx.stroke();
    COLS_E.forEach((c, i) => {
      const x = x0 + i * cw, g = eout(seg(t, c.at, c.at + 0.8));
      if (g <= 0) return;
      A(g, () => {
        const hgt = ((base - top) * c.n) / GUARDS * g;
        if (c.n > 0) { ctx.fillStyle = c.col; ctx.fillRect(x - 36, base - hgt, 72, hgt); label(`${c.n}`, x, base - hgt - 24, { size: 30, weight: 800, col: c.col, align: 'center' }); }
        else { ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.strokeRect(x - 36, base - 120, 72, 120); ctx.setLineDash([]); label('none', x, base - 60, { size: 24, weight: 700, col: C.red, align: 'center' }); }
        label(c.when, x, base + 32, { size: 22, weight: 700, col: C.ink, align: 'center' });
        label(c.sub, x, base + 60, { size: 22, col: C.soft, align: 'center' });
      });
    });
    A(seg(t, 38.6, 39.2), () => label('eight days of looting; the pope surrenders in June', CX, 680, { size: 24, col: C.soft, align: 'center' }));
  });
}

// ---------- F, G: the oath ----------
function flag(x, y, w, h, wave) {
  // the Guard's flag, simplified: a white cross over quarters in the Guard's red, yellow and blue stripes
  ctx.save(); ctx.beginPath();
  const N = 24;
  for (let i = 0; i <= N; i++) { const u = i / N; ctx.lineTo(x + u * w, y + Math.sin(u * 5 + wave) * 6 * u); }
  for (let i = N; i >= 0; i--) { const u = i / N; ctx.lineTo(x + u * w, y + h + Math.sin(u * 5 + wave) * 6 * u); }
  ctx.closePath(); ctx.clip();
  const cols = [C.red, C.yellow, C.blue];
  for (let i = 0; i < 9; i++) { ctx.fillStyle = cols[i % 3]; ctx.fillRect(x, y - 10 + (i * (h + 20)) / 9, w, (h + 20) / 9 + 1); }
  ctx.fillStyle = C.white; ctx.fillRect(x, y + h / 2 - h * 0.07, w, h * 0.14); ctx.fillRect(x + w / 2 - h * 0.07, y - 10, h * 0.14, h + 30);
  ctx.restore();
  ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x - 4, y - 30); ctx.lineTo(x - 4, y + h + 260); ctx.stroke();
}
function hand(x, y, s, open) {
  // a raised right hand: thumb, index and middle finger up, the other two folded
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#e8c4a4'; ctx.strokeStyle = '#b48c6c'; ctx.lineWidth = 2;
  k.rrect(-34, -10, 68, 74, 18); ctx.fill(); ctx.stroke();
  const up = (fx, len, w, rot = 0) => { ctx.save(); ctx.translate(fx, -4); ctx.rotate(rot); k.rrect(-w / 2, -len * open, w, len * open + 14, w / 2); ctx.fill(); ctx.stroke(); ctx.restore(); };
  up(-14, 66, 17); up(6, 74, 17); // index, middle
  ctx.save(); ctx.translate(-30, 26); ctx.rotate(-0.7); k.rrect(-9, -46 * open, 18, 46 * open + 10, 9); ctx.fill(); ctx.stroke(); ctx.restore(); // thumb
  for (const fx of [22, 36]) { k.rrect(fx - 10, -6, 18, 26, 9); ctx.fill(); ctx.stroke(); } // ring and little finger, folded
  ctx.fillRect(-26, 60, 52, 70); // the wrist
  ctx.restore();
}
function sceneOath(t) {
  const a = span(t, 46.4, 65.2, 0.4, 0.0);
  if (a <= 0) return;
  A(a, () => {
    // 46.4–50.8: the date
    A(seg(t, 46.6, 47.4) * (1 - seg(t, 50.6, 51.2)), () => {
      const x = CX - 150, y = 220, w = 300, h = 300;
      ctx.fillStyle = '#f2eee6'; k.rrect(x, y, w, h, 16); ctx.fill();
      ctx.fillStyle = C.red; k.rrect(x, y, w, 72, [16, 16, 0, 0]); ctx.fill();
      label('MAY', CX, y + 38, { size: 36, weight: 800, col: C.white, align: 'center' });
      label('6', CX, y + 186, { size: 150, weight: 700, col: '#1b1f2a', align: 'center', fam: GOTH });
      label(`the swearing-in, since ${OATH_SINCE}`, CX, y + h + 46, { size: 24, col: C.ink, align: 'center', weight: 700 });
      label('in the San Damaso courtyard of the Apostolic Palace', CX, y + h + 82, { size: 22, col: C.soft, align: 'center' });
    });
    // 51.0–60.0: the flag and the hand
    A(seg(t, 51.2, 51.8) * (1 - seg(t, 60.0, 60.6)), () => {
      flag(170, 150, 300, 240, t * 2.2);
      // the left hand on the staff
      ctx.fillStyle = '#e8c4a4'; ctx.strokeStyle = '#b48c6c'; ctx.lineWidth = 2; k.rrect(150, 470, 40, 56, 14); ctx.fill(); ctx.stroke();
      label('left hand on the flag', 210, 498, { size: 22, col: C.soft });
      hand(640, 360, 1.25, eout(seg(t, 52.4, 53.4)));
      A(seg(t, 53.2, 53.8), () => label('three fingers raised', 640, 572, { size: 22, col: C.soft, align: 'center' }));
      label('the Guard’s flag, simplified', 160, 104, { size: 22, col: C.soft });
      A(seg(t, 55.8, 56.6), () => {
        font(600, 30, SANS);
        text('“… ready, should it be necessary,', 60, 640, { base: 'middle', color: C.ink });
        text('to sacrifice even my own life to defend them.”', 60, 680, { base: 'middle', color: C.ink });
        label('from the oath, which the chaplain reads out', 60, 722, { size: 22, col: C.soft });
      });
    });
    // 60.2–64.6: 28 recruits in 2026, 500 years in 2027
    A(seg(t, 60.4, 61.0), () => {
      label('6 May 2026', CX, 150, { size: 48, fam: GOTH, weight: 600, align: 'center' });
      for (let i = 0; i < RECRUITS_2026; i++) {
        const c = i % 7, r = Math.floor(i / 7), x = CX - 3 * 56 + c * 56, y = 230 + r * 60;
        const on = clamp((t - 60.6 - i * 0.04) / 0.3);
        ctx.globalAlpha = on; dot(x, y, 14, [C.blue, C.yellow, C.red][i % 3]); ctx.globalAlpha = 1;
      }
      label(`${RECRUITS_2026} recruits sworn in`, CX, 500, { size: 28, weight: 700, col: C.ink, align: 'center' });
      label('before Pope Leo XIV, in the San Damaso courtyard', CX, 540, { size: 22, col: C.soft, align: 'center' });
      A(seg(t, 62.2, 62.8), () => pill(`6 May ${SACK} → 6 May ${SACK + 500}: 500 years`, CX, 640, C.yellow, { size: 26 }));
    });
  });
}

// the maps fade out above the captions
function veil() {
  for (let y = 690; y < 790; y += 5) { ctx.globalAlpha = (y - 690) / 100; ctx.drawImage(bg, 0, y, W, 5, 0, y, W, 5); }
  ctx.globalAlpha = 1; ctx.drawImage(bg, 0, 790, W, H - 790, 0, 790, W, H - 790);
}

Kit.scene({
  width: W, height: H, duration: 65, fonts: [GOTH, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    scene1506(t);
    scene1527(t);
    if (t < 37.4) veil();
    sceneAfter(t);
    sceneOath(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 40, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.yellow, '~': C.silver } });
  },
});
