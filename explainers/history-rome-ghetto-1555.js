// Explainer for history-rome-ghetto-1555 (Roma): in 1555 Pope Paul IV walled Rome's Jews into a quarter of about
// 3 hectares by the Tiber, beside the Portico of Octavia; with the walls fixed and the people growing in number, the
// houses grew upward; the quarter flooded; the ghetto ended in 1870, its walls fell in 1888 and the Great Synagogue
// rose on the riverbank in 1904; the German round-up of 16 October 1943 and the stumbling stones that remember the
// deported. Look: an evening plan of the quarter in warm stone and terracotta, the Tiber in teal, then a section of
// houses growing floor by floor; the 1943 part is quiet, text and stones only. EB Garamond for captions, Libre
// Franklin for labels.
//
// Facts:
// - Wikipedia, "Cum nimis absurdum": issued by Pope Paul IV on 14 July 1555; the Jews of Rome had to live in a walled
//   quarter whose gates were locked at night; men had to wear a pointed yellow hat, women a yellow kerchief.
// - Wikipedia, "Roman Ghetto": about 2,000 Jews in Rome when the ghetto was founded; about 3,500 in the late 1580s; in
//   the plague of 1656, 800 of its 4,000 inhabitants died; about 3 hectares; walls by Giovanni Sallustio Peruzzi,
//   paid for by the community; gates locked at night; low-lying by the Tiber and often flooded; overcrowding made
//   people build upward, darkening the narrow streets; the ghetto ended when the Papal States did, in 1870; the walls
//   were torn down in 1888; the Great Synagogue was built on the former ghetto in 1904; the first record of Jews in
//   Rome dates to 161 BC, probably the oldest community in the world outside the Middle East.
// - Turismo Roma, "The Portico of Octavia": rebuilt by Augustus between 27 and 23 BC in place of the Portico of
//   Metellus and dedicated to his sister Octavia; a four-sided portico of 119 × 132 m; restored by Septimius Severus
//   in 203 after a fire in 191; in late antiquity and the Middle Ages the city's fish market; the area corresponds
//   to the old ghetto. Turismo Roma, "The old Jewish Quarter": born in 1555 by order of Paul IV; closed for good in
//   1870; the Great Synagogue inaugurated in 1904; stumbling stones name those deported.
// - Wikipedia, "Great Synagogue of Rome": 1901–1904, by Vincenzo Costa and Osvaldo Armanni, with the only square
//   dome in the city, on the Lungotevere de' Cenci.
// - Wikipedia, "Raid on the Roman Ghetto" (after Gedenkorte Europa): on 16 October 1943 German security and police
//   forces detained 1,259 people, 363 men, 689 women and 207 children; 1,023 were deported to Auschwitz two days
//   later; 15 men and 1 woman came back. Pagine Ebraiche (moked.it, the Union of Italian Jewish Communities): more
//   than 1,000 deported, 207 children rounded up, 16 returned.
// - it.wikipedia, "Pietre d'inciampo a Roma": 482 stones laid in Rome between 2010 and 2025, beginning "QUI
//   ABITAVA". Wikipedia, "Stolperstein": Gunter Demnig's project, from 1992; a 10 cm block with a brass plate, set at
//   the last address the person freely chose.
// - Wikipedia, "Rome": 2,745,062 people on 1,287.36 km² (2026).
// Computed here: people per hectare in 1555, the 1580s and 1656, and Rome's density today, 21 per hectare.
// The plan and the section are schematic.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The quarter by the Tiber in 1555; the community since the 2nd century BC.
//  B  9.6–18.6  The Portico of Octavia; the gates locked at night.
//  C 18.8–32.4  3 hectares; 2,000 → 3,500 → 4,000 people; the houses grow upward.
//  D 32.6–37.0  The floods.
//  E 37.2–46.2  1870, 1888; the Great Synagogue, 1904.
//  F 46.4–65.0  16 October 1943; the stumbling stones.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#1e2226', bg2: '#2a2a2c', ink: '#f2ece2', soft: 'rgba(242,236,226,0.74)', faint: 'rgba(242,236,226,0.22)',
  wall: '#d9b98c', house: '#c98f5a', house2: '#b07444', roof: '#9c4a35', river: '#3f7f86', river2: '#2e5f66', stone: '#cfc6b6',
  gold: '#d6a94a', blue: '#8cc1c9', red: '#d97a6c', brass: '#c9a24a', night: '#11161c',
};
const SERIF = 'EB Garamond', SANS = 'Libre Franklin';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const HA = 3, POP = [[1555, 2000], [1588, 3500], [1656, 4000]], ROME_HA = 2745062 / 1287.36 / 100;
const PER_HA = POP.map(([, p]) => p / HA), TIMES = PER_HA[2] / ROME_HA;
const ARRESTED = 1259, BACK = 16, STONES = 482;
if (Math.round(ROME_HA) !== 21 || Math.floor(PER_HA[2] / 100) * 100 !== 1300 || Math.floor(TIMES / 10) * 10 !== 60) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'In July 1555 Pope Paul IV ordered Rome’s Jews to live inside one walled quarter by the Tiber.'],
  [5.0, 9.4, 'Jews had lived in Rome since the 2nd century BC: one of the oldest communities in Europe.'],
  [9.6, 14.0, 'Its edge ran by the *Portico of Octavia*, rebuilt by Emperor Augustus in 27–23 BC for his sister.'],
  [14.2, 18.6, 'Its gates were locked at night; outside, Jews had to wear a yellow hat or kerchief.'],
  [18.8, 23.2, `The ghetto covered about *${HA} hectares*. In 1555 some ${POP[0][1].toLocaleString('en-US')} people lived there…`],
  [23.4, 27.8, `…about ${POP[1][1].toLocaleString('en-US')} by the late 1580s, and ${POP[2][1].toLocaleString('en-US')} by 1656: ~over ${(Math.floor(PER_HA[2] / 100) * 100).toLocaleString('en-US')} a hectare~.`],
  [28.0, 32.4, 'The walls stayed put, so the houses grew ^upward^, floor on floor, over dark, narrow lanes.'],
  [32.6, 37.0, 'The quarter lay low by the river, and the Tiber flooded it again and again.'],
  [37.2, 41.6, 'The ghetto ended in 1870, when Italian troops took Rome; its walls came down in 1888.'],
  [41.8, 46.2, 'On the cleared riverbank, the Great Synagogue, with its square dome, opened in 1904.'],
  [46.4, 50.8, `On 16 October 1943 German police seized ${ARRESTED.toLocaleString('en-US')} people in Rome, most of them Jews, many in the old ghetto.`],
  [51.0, 55.4, `Two days later more than 1,000 were deported to Auschwitz. Only ${BACK} came back.`],
  [55.6, 60.0, 'Brass ‘stumbling stones’ in the pavement remember them: *Qui abitava*, ‘here lived’, and a name.'],
  [60.2, 64.6, `Since 2010, ${STONES} have been set in Rome, each outside the last home of someone the Nazis persecuted.`],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(0.65, C.bg2); lg.addColorStop(1, '#17191c');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(255,240,220,${0.01 + r() * 0.025})`; g.fillRect(r() * W, r() * H, 2, 1); }
}
function label(str, x, y, { size = 23, col = C.ink, align = 'left', weight = 500, fam = SANS } = {}) { font(weight, size, fam); text(str, x, y, { align, base: 'middle', color: col }); }
function box(x, y, w, h) { ctx.fillStyle = 'rgba(17,22,28,0.86)'; k.rrect(x, y, w, h, 10); ctx.fill(); }

// ---------- the plan, in metres; schematic ----------
// The quarter as a polygon scaled to 3 hectares; the river along its south side; the Portico of Octavia at its north-
// east corner, the Theatre of Marcellus beyond, Tiber Island to the south-east.
const RAW = [[0, 40], [60, 0], [170, 10], [265, 50], [300, 115], [250, 150], [120, 160], [30, 120]];
const areaOf = (p) => Math.abs(p.reduce((s, [x, y], i) => { const [u, v] = p[(i + 1) % p.length]; return s + x * v - u * y; }, 0)) / 2;
const F = Math.sqrt((HA * 10000) / areaOf(RAW));
const GHETTO = RAW.map(([x, y]) => [x * F, y * F]);
if (Math.abs(areaOf(GHETTO) - 30000) > 1) throw new Error('area');
let PL = { x: 150, y: 560, s: 1.35 }; // metres to pixels; y grows downwards on screen, the river is to the south
const PX = ([x, y]) => [PL.x + x * PL.s, PL.y - y * PL.s];
function polyM(pts) { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = PX(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); }
// pseudo-random people dots inside the polygon, the same every frame
const DOTS = (() => {
  let s = 17; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const minx = Math.min(...GHETTO.map((p) => p[0])), maxx = Math.max(...GHETTO.map((p) => p[0])), miny = Math.min(...GHETTO.map((p) => p[1])), maxy = Math.max(...GHETTO.map((p) => p[1]));
  const inside = ([x, y]) => { let c = false; for (let i = 0, j = GHETTO.length - 1; i < GHETTO.length; j = i++) { const [xa, ya] = GHETTO[i], [xb, yb] = GHETTO[j]; if (ya > y !== yb > y && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) c = !c; } return c; };
  const out = []; while (out.length < 400) { const p = [minx + r() * (maxx - minx), miny + r() * (maxy - miny)]; if (inside(p)) out.push(p); }
  return out;
})();
function plan(a, { walls = 1, dots = 0, flood = 0, cleared = 0, portico = 1, synagogue = 0 } = {}) {
  A(a, () => {
    // the river along the south, Tiber Island to the south-east
    const [rx0, ry0] = PX([-200, -10]);
    ctx.fillStyle = C.river; ctx.beginPath(); ctx.moveTo(0, ry0 + 6); ctx.bezierCurveTo(300, ry0 + 30, 520, ry0 - 10, W, ry0 + 50); ctx.lineTo(W, ry0 + 170); ctx.bezierCurveTo(520, ry0 + 120, 300, ry0 + 150, 0, ry0 + 130); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.stone; ctx.beginPath(); ctx.ellipse(640, ry0 + 92, 120, 26, 0.08, 0, TAU); ctx.fill();
    label('Tiber Island', 640, ry0 + 92, { size: 22, align: 'center', col: '#3b3a37', weight: 600 });
    label('Tiber', 70, ry0 + 76, { size: 22, col: C.blue, weight: 600 });
    // the quarter
    polyM(GHETTO); ctx.fillStyle = `rgba(201,143,90,${0.55 * (1 - cleared)})`; ctx.fill();
    if (walls > 0) A(walls, () => { polyM(GHETTO); ctx.strokeStyle = C.wall; ctx.lineWidth = 4; ctx.stroke(); });
    // a grid of lanes
    A(0.5 * (1 - cleared), () => { ctx.save(); polyM(GHETTO); ctx.clip(); ctx.strokeStyle = 'rgba(30,34,38,0.6)'; ctx.lineWidth = 3; for (let i = -2; i < 9; i++) { const [x0, y0] = PX([i * 45, 0]), [x1, y1] = PX([i * 45 + 60, 220]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); } for (let j = 1; j < 5; j++) { const [x0, y0] = PX([-50, j * 40]), [x1, y1] = PX([400, j * 40 + 10]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); } ctx.restore(); });
    if (dots > 0) { const n = Math.round(dots); ctx.fillStyle = C.ink; for (let i = 0; i < Math.min(n, DOTS.length); i++) { const [x, y] = PX(DOTS[i]); ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill(); } }
    // the Portico of Octavia and the Theatre of Marcellus
    A(portico, () => {
      const [px, py] = PX([GHETTO[4][0] - 10, GHETTO[4][1] + 18]);
      ctx.fillStyle = C.stone; ctx.fillRect(px - 26, py - 16, 52, 32);
      label('Portico of Octavia', px + 34, py - 30, { size: 22, weight: 600, col: C.stone });
      const [tx, ty] = PX([GHETTO[4][0] + 70, GHETTO[4][1] - 40]);
      ctx.strokeStyle = C.stone; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(tx, ty, 46, Math.PI * 0.85, Math.PI * 2.15); ctx.stroke();
      label('Theatre of', tx + 54, ty + 30, { size: 22, col: C.soft }); label('Marcellus', tx + 54, ty + 56, { size: 22, col: C.soft });
    });
    if (flood > 0) A(flood, () => { polyM(GHETTO); ctx.fillStyle = 'rgba(63,127,134,0.7)'; ctx.fill(); });
    if (synagogue > 0) A(synagogue, () => {
      const [sx, sy] = PX([230, 40]);
      ctx.fillStyle = '#cfc9bd'; ctx.fillRect(sx - 34, sy - 34, 68, 68);
      ctx.fillStyle = '#9aa3a8'; ctx.fillRect(sx - 20, sy - 20, 40, 40);
      label('Great Synagogue, 1904', sx - 40, sy + 58, { size: 22, weight: 700, col: C.ink });
    });
  });
}

// ---------- the section: houses growing upward ----------
function section(a, floors) {
  A(a, () => {
    const base = 740, fh = 46, n = 7, w = 96, x0 = 96;
    ctx.fillStyle = C.river2; ctx.fillRect(0, base, W, 10);
    for (let i = 0; i < n; i++) {
      const f = Math.max(1, Math.min(6, floors - ((i * 3) % 5) * 0.35)), full = Math.floor(f), part = f - full, x = x0 + i * w;
      for (let j = 0; j < full; j++) storey(x, base - (j + 1) * fh, w - 6, fh, 1);
      if (part > 0.05) storey(x, base - (full + 1) * fh, w - 6, fh, part);
      const top = base - (full + part) * fh;
      ctx.fillStyle = C.roof; ctx.beginPath(); ctx.moveTo(x - 4, top); ctx.lineTo(x + (w - 6) / 2, top - 18); ctx.lineTo(x + w - 2, top); ctx.closePath(); ctx.fill();
    }
    function storey(x, y, wd, ht, p) {
      A(p, () => {
        ctx.fillStyle = C.house; ctx.fillRect(x, y + ht * (1 - p), wd, ht * p);
        ctx.fillStyle = 'rgba(30,24,20,0.75)'; for (let q = 0; q < 2; q++) ctx.fillRect(x + 16 + q * 40, y + 12 + ht * (1 - p), 18, 22);
      });
    }
  });
}

// ---------- A–D ----------
function sceneQuarter(t) {
  const a = span(t, 0, 37.2, 0.5, 0.4);
  if (a <= 0) return;
  const showSection = span(t, 28.0, 32.6, 0.5, 0.5);
  const zoom = eio(seg(t, 9.6, 10.8)) * (1 - eio(seg(t, 17.6, 18.8)));
  PL = { x: lerp(150, -250, zoom), y: lerp(560, 760, zoom), s: lerp(1.35, 2.6, zoom) };
  const pop = t < 18.8 ? 0 : t < 23.4 ? POP[0][1] * seg(t, 19.4, 21.4) : t < 25.6 ? lerp(POP[0][1], POP[1][1], seg(t, 23.6, 25.2)) : lerp(POP[1][1], POP[2][1], seg(t, 25.6, 26.6));
  A((1 - showSection) * (1 - zoom), () => plan(a, { walls: seg(t, 1.2, 2.4), dots: pop / 10, flood: span(t, 33.0, 37.2, 1.2, 0.5) * (0.55 + 0.15 * Math.sin(t * 3)), portico: 1 }));
  A(a * (1 - showSection), () => {
    A(seg(t, 0.6, 1.4) * (1 - seg(t, 9.0, 9.6)), () => {
      box(40, 70, 470, 92);
      label('ROME · JULY 1555', 58, 100, { size: 26, weight: 700 });
      label('the walled quarter by the Tiber (schematic)', 58, 134, { size: 22, col: C.soft, fam: SERIF });
    });
    A(seg(t, 5.4, 6.2) * (1 - seg(t, 9.2, 9.8)), () => {
      box(40, 190, 470, 92);
      label('Jews in Rome: since the 2nd century BC', 58, 220, { size: 23, weight: 600, col: C.gold });
      label('first recorded in 161 BC', 58, 252, { size: 22, col: C.soft });
    });
    // the Portico close up: its surviving porch
    A(zoom, () => {
      const x = 420, y = 330;
      ctx.fillStyle = C.stone;
      ctx.beginPath(); ctx.moveTo(x - 150, y - 110); ctx.lineTo(x, y - 170); ctx.lineTo(x + 150, y - 110); ctx.closePath(); ctx.fill();
      ctx.fillRect(x - 160, y - 112, 320, 22);
      for (const cx of [-130, -90, 90, 130]) ctx.fillRect(x + cx - 10, y - 90, 20, 170);
      ctx.fillStyle = '#a5574a'; ctx.beginPath(); ctx.moveTo(x - 60, y + 80); ctx.lineTo(x - 60, y - 40); ctx.arc(x, y - 40, 60, Math.PI, 0); ctx.lineTo(x + 60, y + 80); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.night; ctx.beginPath(); ctx.moveTo(x - 40, y + 80); ctx.lineTo(x - 40, y - 30); ctx.arc(x, y - 30, 40, Math.PI, 0); ctx.lineTo(x + 40, y + 80); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(30,24,20,0.5)'; ctx.fillRect(x - 170, y + 80, 340, 8);
      box(40, 470, 520, 92);
      label('rebuilt by Augustus, 27–23 BC', 58, 500, { size: 23, weight: 600, col: C.gold });
      label('a portico 119 × 132 m; later the fish market', 58, 532, { size: 22, col: C.soft });
      A(seg(t, 14.6, 15.4), () => {
        box(40, 600, 520, 92);
        label('gates locked every night', 58, 630, { size: 23, weight: 600, col: C.red });
        label('outside: a yellow hat or kerchief', 58, 662, { size: 22, col: C.soft });
        // a gate closing
        const g = eio(seg(t, 15.2, 16.4)), gx = 700, gy = 640;
        ctx.fillStyle = C.wall; ctx.fillRect(gx - 70, gy - 60, 20, 110); ctx.fillRect(gx + 50, gy - 60, 20, 110);
        ctx.fillStyle = '#6b4a2c'; ctx.fillRect(gx - 50, gy - 50, 50 * g, 100); ctx.fillRect(gx + 50 - 50 * g, gy - 50, 50 * g, 100);
      });
    });
    // the numbers
    A(seg(t, 19.2, 20.0) * (1 - seg(t, 27.6, 28.2)), () => {
      box(40, 70, 520, 132);
      const p = Math.round(pop / 50) * 50, year = t < 23.4 ? 1555 : t < 25.6 ? 'the late 1580s' : 1656;
      label(`${HA} hectares · ${typeof year === 'number' ? year : year}`, 58, 100, { size: 24, weight: 700, col: C.gold });
      label(`${p.toLocaleString('en-US')} people`, 58, 134, { size: 24, weight: 600 });
      label(`${Math.round(p / HA).toLocaleString('en-US')} per hectare`, 58, 168, { size: 23, col: C.soft });
      A(seg(t, 26.2, 27.0), () => { label(`Rome today: about ${Math.round(ROME_HA)} per hectare`, 58, 232, { size: 22, col: C.blue }); label(`the ghetto: over ${Math.floor(TIMES / 10) * 10} times as crowded`, 58, 262, { size: 22, col: C.blue }); });
      label('each dot: 10 people', W - 60, 236, { size: 22, col: C.soft, align: 'right' });
    });
    A(span(t, 33.2, 37.2, 0.6, 0.4), () => { box(40, 70, 420, 64); label('floods from the Tiber', 58, 102, { size: 24, weight: 700, col: C.blue }); });
  });
  A(a * showSection, () => {
    section(1, lerp(2, 6, eio(seg(t, 28.6, 31.6))));
    label('the same land, more floors', 56, 140, { size: 24, weight: 700, col: C.gold });
    label('schematic section', 56, 172, { size: 22, col: C.soft, fam: SERIF });
  });
}

// ---------- E: 1870, 1888, 1904 ----------
function sceneAfter(t) {
  const a = span(t, 37.2, 46.4, 0.4, 0.4);
  if (a <= 0) return;
  PL = { x: 150, y: 560, s: 1.35 };
  plan(a, { walls: 1 - seg(t, 38.6, 40.2), cleared: seg(t, 40.2, 41.4) * 0.6, synagogue: seg(t, 42.4, 43.4), portico: 1 });
  A(a, () => {
    box(40, 70, 420, 120);
    label('1870: the ghetto ends', 58, 102, { size: 24, weight: 700, col: C.gold });
    A(seg(t, 39.0, 39.8), () => label('1888: its walls come down', 58, 136, { size: 23, col: C.soft }));
    A(seg(t, 42.0, 42.8), () => label('1904: the Great Synagogue', 58, 168, { size: 23, col: C.soft }));
  });
}

// ---------- F: 1943 and the stones ----------
function sceneMemory(t) {
  const a = span(t, 46.4, 65.0, 0.6, 0.0);
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = 'rgba(17,22,28,0.92)'; ctx.fillRect(0, 0, W, H);
    // a quiet street at dawn: house fronts and cobbles
    const dawn = seg(t, 46.6, 50.0);
    const g = ctx.createLinearGradient(0, 120, 0, 520); g.addColorStop(0, `rgba(120,140,160,${0.25 * dawn})`); g.addColorStop(1, 'rgba(120,140,160,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 120, W, 400);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#3b3530' : '#453d36'; ctx.fillRect(40 + i * 160, 210 - (i % 3) * 30, 150, 330 + (i % 3) * 30); for (let r = 0; r < 3; r++) { ctx.fillStyle = 'rgba(10,12,14,0.8)'; ctx.fillRect(70 + i * 160, 250 - (i % 3) * 30 + r * 90, 26, 40); ctx.fillRect(124 + i * 160, 250 - (i % 3) * 30 + r * 90, 26, 40); } }
    // cobbles
    for (let r = 0; r < 6; r++) for (let c = 0; c < 18; c++) { const x = c * 50 + (r % 2) * 25 - 10, y = 560 + r * 34; ctx.fillStyle = (r * 7 + c * 3) % 5 ? '#4d4a45' : '#57534d'; k.rrect(x, y, 46, 30, 6); ctx.fill(); }
    A(seg(t, 46.8, 47.6) * (1 - seg(t, 55.4, 56.0)), () => {
      box(40, 70, 560, 120);
      label('16 OCTOBER 1943', 58, 102, { size: 26, weight: 700, col: C.ink });
      label(`${ARRESTED.toLocaleString('en-US')} people seized in Rome`, 58, 136, { size: 23, col: C.soft });
      A(seg(t, 51.4, 52.2), () => label(`more than 1,000 deported to Auschwitz · ${BACK} came back`, 58, 168, { size: 23, col: C.soft }));
    });
    // the stones
    const st = seg(t, 56.0, 57.4);
    if (st > 0) {
      const spots = [[3, 2], [4, 2], [9, 3], [10, 3], [14, 1]];
      spots.forEach(([c, r], i) => A(clamp(st * 5 - i), () => {
        const x = c * 50 + (r % 2) * 25 - 10, y = 560 + r * 34;
        ctx.fillStyle = C.brass; k.rrect(x + 4, y + 2, 38, 26, 3); ctx.fill();
        ctx.fillStyle = 'rgba(80,60,20,0.85)'; for (let l = 0; l < 4; l++) ctx.fillRect(x + 9, y + 7 + l * 5, l ? 26 - l * 3 : 28, 2);
      }));
      A(seg(t, 57.4, 58.2), () => {
        // one stone close up, with the opening words only
        const x = 500, y = 230, s = 220;
        ctx.fillStyle = C.brass; k.rrect(x, y, s, s, 8); ctx.fill();
        ctx.strokeStyle = 'rgba(80,60,20,0.6)'; ctx.lineWidth = 2; k.rrect(x + 8, y + 8, s - 16, s - 16, 6); ctx.stroke();
        font(700, 30, SERIF); text('QUI ABITAVA', x + s / 2, y + 54, { align: 'center', base: 'middle', color: '#4a3712' });
        ctx.fillStyle = 'rgba(74,55,18,0.55)'; for (let l = 0; l < 4; l++) ctx.fillRect(x + 34, y + 96 + l * 26, s - 68 - (l % 2) * 30, 8);
        label('here lived…', x + s / 2, y + s + 30, { size: 23, col: C.soft, align: 'center', fam: SERIF });
      });
    }
    A(seg(t, 60.6, 61.4), () => {
      box(40, 70, 400, 120);
      label(`${STONES} stones in Rome`, 58, 102, { size: 26, weight: 700, col: C.brass });
      label('laid since 2010', 58, 136, { size: 23, col: C.soft });
      label('10 cm, set in the pavement', 58, 168, { size: 23, col: C.soft });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 65, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneQuarter(t);
    sceneAfter(t);
    sceneMemory(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 500, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.red, '^': C.gold } });
  },
});
