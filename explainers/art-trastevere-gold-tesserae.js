// Explainer for art-trastevere-gold-tesserae (Roma): the gold of the 12th-century apse mosaic of Santa Maria in
// Trastevere is gold leaf thinner than half a micrometre, sealed between two layers of glass, and the gold pieces were
// set at slightly different angles so that the surface glitters as you move. Look: the apse itself, a half-dome of
// gold tesserae with Christ and Mary enthroned between saints and a frieze of sheep, drawn as tiles that catch a
// moving light; lapis blue, gold and red. Fraunces for titles and numbers, Alegreya for captions and labels.
//
// Facts:
// - Wikipedia, "Santa Maria in Trastevere": rebuilt on its old foundations under Pope Innocent II in 1140–43; the apse
//   mosaic (1130–1143) shows Innocent II holding a model of the church; below it, Pietro Cavallini's mosaics of the
//   Life of the Virgin (1291).
// - UW "Rome: Art & Architecture" article on S. Maria in Trastevere: Innocent II tore down the older building in 1140;
//   the apse mosaic was completed in his time; figures from left to right: Innocent II (holding a model of the church
//   as donor), St Lawrence, St Callixtus, Mary, Christ, St Peter, St Cornelius, St Julius, St Calepodius.
// - medievalmosaics.com, Rome, S Maria in Trastevere: Christ below the Hand of God, Mary as Queen of Heaven beside
//   him; twelve sheep moving towards the Lamb of God below; "The background to the apse is gold"; Cavallini's panels
//   below the apse: six scenes of Mary's life and a central panel.
// - Wikipedia, "Mosaic": an image of small pieces of stone, glass or ceramic held in plaster or mortar; historic wall
//   mosaics were made by the direct method, placing the pieces on the wall over underdrawings of the outlines.
// - Guerra, Neri & Radtke, "Gold leaf tesserae", Eur. Phys. J. Plus 138:127 (2023): gold leaf tesserae consist of a
//   gold leaf less than 0.5 µm thick placed between two layers of glass: the bottom layer is the support, a thin top
//   layer covers the leaf; the earliest gold leaf tesserae are from the first century BC; gold tesserae were placed
//   at slightly different angles to optimise the effect of the metal's high reflectance, and under natural light
//   the appearance of such mosaics varies through the day with the sunlight; the splendour of gold walls needs less
//   gold than it seems.
// - Wikipedia, "Gold": density 19.3 g/cm³.
// Computed here: gold in a square metre of gold background, at most 0.5 µm × 1 m² × 19.3 g/cm³ ≈ 9.7 g (under 10 g);
// the reflections in section E are traced ray by ray (angle in = angle out about each tile's own tilt); 2026 − 1140
// = 886 years, "almost 900".
// Schematic: the drawing of the apse, the number of tiles and the tilts are illustrations.
//
// Scene plan (62.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The apse: gold half-dome, Christ and Mary, saints, sheep; Innocent II with his model church.
//  B  9.2–18.0  Christ and Mary on one throne; a loupe shows the tesserae.
//  C 18.0–22.4  Pressing tesserae into wet mortar along a drawn line.
//  D 22.4–31.0  A gold tessera taken apart: glass base, gold leaf, thin glass cover; under 10 g of gold per m².
//  E 31.2–48.6  Light on the wall, traced: flat tiles flash at one spot; tilted tiles flash all along the nave.
//  F 48.8–53.0  The Sun moves through the day; the glitter moves with it.
//  G 53.2–62.4  Cavallini's panels below; gold tesserae from the 1st century BC to today.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  night: '#0a1424', night2: '#122340', ink: '#f6efe0', soft: 'rgba(246,239,224,0.72)', faint: 'rgba(246,239,224,0.25)',
  gold: '#d9a73e', gold2: '#b88a2c', goldHi: '#fff0b5', lapis: '#22427e', lapis2: '#3561ad', red: '#a8352b',
  skin: '#e7c9a4', white: '#e9e2d0', green: '#2f6a52', mortar: '#c9bb9b', mortar2: '#b3a37f', glass: 'rgba(170,215,205,0.55)',
  sun: '#ffe08a', turq: '#7fd3c6', rose: '#e88e7e',
};
const TITLE = 'Fraunces', TEXT = 'Alegreya';

let k, ctx;
const font = (w, s, f = TITLE) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
const rad = (d) => (d * Math.PI) / 180;

// ---------- numbers ----------
const LEAF_UM = 0.5; // gold leaf thinner than this (Guerra et al. 2023)
const GOLD_DENSITY = 19.3; // g/cm³
const GOLD_PER_M2 = LEAF_UM * 1e-4 * 1e4 * GOLD_DENSITY; // µm → cm, m² → cm²: 9.65 g
const BUILT = 1140, NOW = 2026, AGE = NOW - BUILT; // 886
if (Math.round(GOLD_PER_M2 * 10) !== 97 || AGE !== 886) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'In Rome’s Trastevere district, the apse of *Santa Maria in Trastevere* glows with ~gold~.'],
  [4.8, 9.0, 'It was made for *Pope Innocent II*, who rebuilt the church from 1140: he holds its model.'],
  [9.2, 13.4, 'Christ and his mother Mary sit enthroned side by side, on a background of ~gold~.'],
  [13.6, 17.8, 'The picture is made of small pieces of glass and stone, called *tesserae*.'],
  [18.0, 22.2, 'Each piece was pressed into wet mortar on the wall, following lines drawn underneath.'],
  [22.4, 26.6, 'The gold pieces are glass too: a *gold leaf* on a glass base, sealed under thin glass.'],
  [26.8, 31.0, `The leaf is under ~half a micrometre~ thick: a square metre of gold uses under *${Math.ceil(GOLD_PER_M2)} grams*.`],
  [31.2, 35.4, 'And the gold tesserae were set at *slightly different angles*, not all flat.'],
  [35.6, 39.8, 'A flat mirror sends all the sunlight back one way: you catch its flash from one spot.'],
  [40.0, 44.2, 'Tilted pieces each send their flash a different way, so some ~always reach you~.'],
  [44.4, 48.6, 'Walk down the nave and different tesserae light up: the gold seems to *glitter*.'],
  [48.8, 53.0, 'As the Sun moves through the day, the glitter moves and changes with it.'],
  [53.2, 57.4, 'Below the apse, the artist *Pietro Cavallini* added scenes of Mary’s life in 1291.'],
  [57.6, 61.8, `Gold glass tesserae go back to the 1st century BC; these have shone for ~almost 900 years~.`],
];

// ---------- seeded randomness ----------
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ---------- background: dark wall of tiny tiles ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.night2); lg.addColorStop(1, C.night);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 9) for (let x = (y / 9) % 2 ? 4 : 0; x < W; x += 9) {
    g.fillStyle = `rgba(${90 + rnd() * 60},${110 + rnd() * 60},${160 + rnd() * 60},${0.04 + rnd() * 0.05})`;
    g.fillRect(x, y, 8, 8);
  }
}

// ---------- the apse ----------
const AP = { cx: CX, base: 560, rx: 372, ry: 440 };
const TILE = 11;
let goldTiles = null;
function makeTiles() {
  goldTiles = [];
  for (let y = AP.base - AP.ry; y < AP.base; y += TILE) {
    for (let x = AP.cx - AP.rx; x < AP.cx + AP.rx; x += TILE) {
      const dx = (x + TILE / 2 - AP.cx) / AP.rx, dy = (y + TILE / 2 - AP.base) / AP.ry;
      if (dx * dx + dy * dy > 1) continue;
      goldTiles.push({ x, y, tilt: (rnd() - 0.5) * 2, tone: rnd(), jx: (rnd() - 0.5) * 1.6, jy: (rnd() - 0.5) * 1.6 });
    }
  }
}
function apsePath() {
  ctx.beginPath();
  ctx.ellipse(AP.cx, AP.base, AP.rx, AP.ry, 0, Math.PI, TAU);
  ctx.closePath();
}
/** Gold tiles: each one flashes when the light, its tilt and the viewer line up. `view` sweeps the viewpoint. */
function goldField(view, sunShift, glitter = 1) {
  ctx.save(); apsePath(); ctx.clip();
  ctx.fillStyle = '#5a4316'; ctx.fillRect(AP.cx - AP.rx, AP.base - AP.ry, AP.rx * 2, AP.ry);
  for (const g of goldTiles) {
    const u = (g.x - AP.cx) / AP.rx;
    const flash = glitter * Math.exp(-Math.pow(g.tilt * 3 - (view - u * 0.6) - sunShift, 2) / 0.02);
    const base = 0.55 + g.tone * 0.25;
    const r = Math.round(lerp(150, 255, Math.min(1, base + flash * 0.6)));
    const gg = Math.round(lerp(105, 236, Math.min(1, base + flash * 0.55)));
    const b = Math.round(lerp(30, 170, Math.min(1, base * 0.4 + flash * 0.8)));
    ctx.fillStyle = `rgb(${r},${gg},${b})`;
    ctx.fillRect(g.x + 0.8 + g.jx, g.y + 0.8 + g.jy, TILE - 2, TILE - 2);
  }
  ctx.restore();
  ctx.strokeStyle = C.red; ctx.lineWidth = 6; apsePath(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,181,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(AP.cx, AP.base, AP.rx - 9, AP.ry - 9, 0, Math.PI, TAU); ctx.stroke();
}

function halo(x, y, r, cross = false) {
  ctx.fillStyle = C.goldHi; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.stroke();
  if (cross) {
    ctx.fillStyle = C.red;
    ctx.fillRect(x - 3, y - r + 2, 6, r * 0.55); ctx.fillRect(x - r + 2, y - 3, r * 0.5, 6); ctx.fillRect(x + r * 0.5 - 2, y - 3, r * 0.5, 6);
  }
}
function head(x, y, r, hair = '#4a3020') {
  ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(x, y - 2, r + 2, Math.PI, TAU); ctx.fill();
  ctx.fillStyle = C.skin; ctx.beginPath(); ctx.ellipse(x, y + 2, r * 0.8, r, 0, 0, TAU); ctx.fill();
}
function standing(x, foot, robe, over, { nimbus = true, pope = false, model = false } = {}) {
  const top = foot - 200;
  if (nimbus) halo(x, top + 22, 26);
  head(x, top + 26, 17, pope ? '#ddd6c8' : '#4a3020');
  ctx.fillStyle = robe;
  ctx.beginPath(); ctx.moveTo(x - 22, top + 46); ctx.lineTo(x + 22, top + 46); ctx.lineTo(x + 34, foot); ctx.lineTo(x - 34, foot); ctx.closePath(); ctx.fill();
  ctx.fillStyle = over; ctx.beginPath(); ctx.moveTo(x - 20, top + 50); ctx.lineTo(x + 6, top + 50); ctx.lineTo(x + 26, foot - 40); ctx.lineTo(x - 26, foot - 30); ctx.closePath(); ctx.fill();
  if (pope) { ctx.fillStyle = C.white; ctx.fillRect(x - 3, top + 50, 6, 120); ctx.fillRect(x - 14, top + 66, 28, 5); }
  if (model) {
    // a small church: nave, roof and a bell tower, held up in front
    const mx = x + 14, my = top + 110;
    ctx.fillStyle = '#d7c39a'; ctx.fillRect(mx - 22, my - 16, 34, 24);
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(mx - 26, my - 16); ctx.lineTo(mx - 5, my - 30); ctx.lineTo(mx + 16, my - 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d7c39a'; ctx.fillRect(mx + 12, my - 40, 10, 48);
    ctx.fillStyle = C.red; ctx.fillRect(mx + 11, my - 44, 12, 5);
  }
}
function throneFigures() {
  // one wide throne with a cushion, Mary (crowned) on the left, Christ on the right
  const y = 330;
  ctx.fillStyle = '#7d2c25'; k.rrect(CX - 128, y - 70, 256, 250, 10); ctx.fill();
  ctx.strokeStyle = C.goldHi; ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? C.goldHi : C.lapis2; ctx.fillRect(CX - 124 + i * 36, y - 66, 28, 8); }
  ctx.fillStyle = C.lapis; k.rrect(CX - 138, y + 150, 276, 40, 8); ctx.fill();
  // Mary
  halo(CX - 58, y - 18, 34); head(CX - 58, y - 12, 21, '#3a2416');
  ctx.fillStyle = C.goldHi; ctx.beginPath(); ctx.moveTo(CX - 78, y - 34); ctx.lineTo(CX - 72, y - 52); ctx.lineTo(CX - 64, y - 38); ctx.lineTo(CX - 58, y - 56); ctx.lineTo(CX - 52, y - 38); ctx.lineTo(CX - 44, y - 52); ctx.lineTo(CX - 38, y - 34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c8962e'; ctx.beginPath(); ctx.moveTo(CX - 86, y + 12); ctx.lineTo(CX - 30, y + 12); ctx.lineTo(CX - 18, y + 150); ctx.lineTo(CX - 100, y + 150); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.lapis2; ctx.fillRect(CX - 96, y + 92, 74, 58);
  // Christ
  halo(CX + 54, y - 26, 36, true); head(CX + 54, y - 20, 22, '#2c1a10');
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(CX + 26, y + 6); ctx.lineTo(CX + 84, y + 6); ctx.lineTo(CX + 102, y + 150); ctx.lineTo(CX + 14, y + 150); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.lapis2; ctx.fillRect(CX + 20, y + 96, 76, 54);
  ctx.fillStyle = C.white; ctx.fillRect(CX + 84, y + 40, 30, 38); // his open book
  ctx.strokeStyle = C.skin; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(CX + 32, y + 30); ctx.quadraticCurveTo(CX - 4, y + 20, CX - 34, y + 30); ctx.stroke(); // his arm round Mary
}
function handOfGod(y) {
  ctx.fillStyle = C.lapis; ctx.beginPath(); ctx.arc(CX, y, 34, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.goldHi; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = C.skin; ctx.fillRect(CX - 7, y - 16, 14, 30); ctx.fillRect(CX + 5, y - 6, 9, 10);
}
function sheepFrieze(y, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.lapis; ctx.fillRect(AP.cx - AP.rx, y, AP.rx * 2, 74);
    // inscription band above: gold marks, not letters
    ctx.fillStyle = '#0f2a4a'; ctx.fillRect(AP.cx - AP.rx, y - 34, AP.rx * 2, 30);
    for (let i = 0; i < 70; i++) { ctx.fillStyle = 'rgba(255,240,181,0.8)'; ctx.fillRect(AP.cx - AP.rx + 12 + i * 10.4, y - 26, 6, 14); }
    for (let i = 0; i < 13; i++) {
      const x = AP.cx - AP.rx + 34 + i * 54;
      if (i === 6) { halo(x, y + 24, 16, true); ctx.fillStyle = C.white; ctx.beginPath(); ctx.ellipse(x, y + 46, 22, 14, 0, 0, TAU); ctx.fill(); continue; }
      ctx.fillStyle = C.white; ctx.beginPath(); ctx.ellipse(x, y + 42, 20, 12, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + (i < 6 ? 18 : -18), y + 32, 8, 6, 0, 0, TAU); ctx.fill();
      ctx.fillRect(x - 12, y + 50, 3, 12); ctx.fillRect(x + 9, y + 50, 3, 12);
    }
  });
}
// From left to right: Innocent II with his model church, St Lawrence, St Callixtus | Christ and Mary | St Peter,
// St Cornelius, St Julius, St Calepodius (the outermost are cut by the curve of the half-dome, as in a photo).
const SAINTS = [
  { x: 114, robe: C.lapis, over: C.white, pope: true, model: true, nimbus: false },
  { x: 176, robe: C.white, over: C.red },
  { x: 240, robe: C.lapis, over: C.white, pope: true },
  { x: 624, robe: C.white, over: C.lapis2 },
  { x: 684, robe: C.lapis, over: C.white, pope: true },
  { x: 740, robe: C.white, over: C.red, pope: true },
  { x: 792, robe: C.lapis, over: C.white },
];
function apse(t, view, sunShift, glitter = 1) {
  goldField(view, sunShift, glitter);
  ctx.save(); apsePath(); ctx.clip();
  handOfGod(AP.base - AP.ry + 60);
  ctx.fillStyle = C.green; ctx.fillRect(AP.cx - AP.rx, AP.base - 30, AP.rx * 2, 30);
  for (const s of SAINTS) standing(s.x, AP.base - 30, s.robe, s.over, s);
  throneFigures();
  ctx.restore();
}

// ---------- A, B: the apse ----------
function sceneApse(t) {
  const a = span(t, 0, 18.1, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const view = Math.sin(t * 0.35) * 0.7;
    apse(t, view, 0);
    sheepFrieze(AP.base + 40);
    A(seg(t, 0.8, 1.8) * (1 - seg(t, 4.6, 5.0)), () => {
      font(600, 44); text('Santa Maria in Trastevere', CX, 64, { align: 'center', base: 'middle', color: C.goldHi });
    });
    A(seg(t, 5.2, 6.0) * (1 - seg(t, 8.8, 9.2)), () => {
      // label Innocent II
      ctx.strokeStyle = C.goldHi; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(122, 430); ctx.lineTo(150, 700); ctx.stroke();
      font(700, 32, TEXT); text('Pope Innocent II', 150, 726, { align: 'left', base: 'middle', color: C.goldHi });
      font(400, 26, TEXT); text('pope 1130–1143, with his church', 150, 760, { align: 'left', base: 'middle', color: C.soft });
    });
    A(seg(t, 9.6, 10.4) * (1 - seg(t, 13.2, 13.6)), () => {
      for (const [name, x] of [['Mary', CX - 70], ['Christ', CX + 70]]) {
        ctx.fillStyle = 'rgba(10,20,36,0.85)'; k.rrect(x - 56, 226, 112, 40, 10); ctx.fill();
        font(700, 30, TEXT); text(name, x, 247, { align: 'center', base: 'middle', color: C.goldHi });
      }
    });
    // the loupe
    const lp = seg(t, 13.8, 14.8) * (1 - seg(t, 17.6, 18.0));
    if (lp > 0) A(lp, () => loupe(CX - 58, 312, 150 * eout(lp)));
  });
}
function loupe(x, y, r) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x + 210, y + 40, r, 0, TAU); ctx.clip();
  ctx.fillStyle = C.mortar2; ctx.fillRect(x + 210 - r, y + 40 - r, r * 2, r * 2);
  // big tesserae: gold background, a red-ringed halo rim, the edge of a face
  seed = 99;
  const s = 26;
  for (let yy = -r; yy < r; yy += s) for (let xx = -r; xx < r; xx += s) {
    const px = x + 210 + xx, py = y + 40 + yy;
    const d = Math.hypot(xx + 60, yy + 40);
    let col = `rgb(${200 + rnd() * 50},${150 + rnd() * 50},${50 + rnd() * 40})`;
    if (d > 92 && d < 120) col = rnd() > 0.2 ? C.red : '#8a2a22';
    else if (d < 92 && d > 60) col = `rgb(${240 + rnd() * 15},${215 + rnd() * 30},${120 + rnd() * 50})`;
    else if (d <= 60) col = rnd() > 0.5 ? C.skin : '#d9b48d';
    ctx.fillStyle = col;
    ctx.save(); ctx.translate(px + s / 2, py + s / 2); ctx.rotate((rnd() - 0.5) * 0.18);
    ctx.fillRect(-s / 2 + 2, -s / 2 + 2, s - 4 - rnd() * 3, s - 4 - rnd() * 3); ctx.restore();
  }
  ctx.restore();
  ctx.strokeStyle = C.goldHi; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + 210, y + 40, r, 0, TAU); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 22, y + 2); ctx.lineTo(x + 210 - r * 0.72, y + 40 - r * 0.4); ctx.stroke();
  A(seg(r, 120, 150), () => {
    ctx.fillStyle = 'rgba(10,20,36,0.82)'; k.rrect(x + 210 - 100, y + 40 + r + 14, 200, 46, 10); ctx.fill();
    font(700, 32, TEXT); text('tesserae', x + 210, y + 40 + r + 37, { align: 'center', base: 'middle', color: C.goldHi });
  });
}

// ---------- C: pressing into mortar ----------
function sceneMortar(t) {
  const a = span(t, 18.0, 22.5, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const L = 92, T = 160, R = 772, B = 640;
    ctx.fillStyle = '#6d4b36'; ctx.fillRect(L - 26, T - 26, R - L + 52, B - T + 52); // the wall
    ctx.fillStyle = C.mortar; ctx.fillRect(L, T, R - L, B - T); // wet mortar
    seed = 5;
    for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(90,70,40,${rnd() * 0.12})`; ctx.fillRect(L + rnd() * (R - L), T + rnd() * (B - T), 2, 2); }
    // the drawn line: an arc for a halo and a robe's edge
    ctx.strokeStyle = '#a5432f'; ctx.lineWidth = 4; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(CX, 380, 170, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, 380, 130, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    font(700, 30, TEXT); text('drawn line', 640, 600, { align: 'center', base: 'middle', color: '#7a2b1f' });
    text('wet mortar', 190, 600, { align: 'center', base: 'middle', color: '#5b4a2c' });
    // tesserae go in one by one along the ring between the lines
    const n = 34, done = (t - 18.4) / 3.2 * n;
    for (let i = 0; i < n; i++) {
      const p = clamp(done - i, 0, 1);
      if (p <= 0) continue;
      const ang = Math.PI * 1.08 + (i / (n - 1)) * Math.PI * 0.84;
      const x = CX + Math.cos(ang) * 150, y = 380 + Math.sin(ang) * 150;
      const drop = (1 - eout(p)) * -60;
      ctx.save(); ctx.translate(x, y + drop); ctx.rotate(ang + Math.PI / 2 + (i % 3 - 1) * 0.06);
      ctx.fillStyle = i % 5 === 0 ? C.red : C.gold; ctx.fillRect(-14, -14, 28, 28);
      ctx.fillStyle = 'rgba(255,240,181,0.5)'; ctx.fillRect(-14, -14, 28, 5);
      ctx.restore();
    }
  });
}

// ---------- D: a gold tessera, taken apart ----------
function box(x, y, w, h, d, top, front, side) {
  // a block in simple oblique projection: depth goes up and to the right
  ctx.fillStyle = front; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = top; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d * 0.6); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = side; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w + d, y - d * 0.6 + h); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
}
function sceneTessera(t) {
  const a = span(t, 22.4, 31.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const x = 330, w = 270, d = 130, baseY = 470;
    const sep = eio(seg(t, 22.6, 24.2)) * (1 - eio(seg(t, 25.4, 26.4)));
    const leafIn = eout(seg(t, 23.4, 24.4)), capIn = eout(seg(t, 24.0, 25.0));
    // glass base
    box(x, baseY, w, 120, d, 'rgba(150,200,175,0.9)', 'rgba(95,150,125,0.95)', 'rgba(70,120,100,0.95)');
    // gold leaf
    A(leafIn, () => box(x, baseY - 6 - sep * 70, w, 6, d, C.goldHi, C.gold, C.gold2));
    // thin glass cover
    A(capIn, () => box(x, baseY - 26 - sep * 150, w, 18, d, 'rgba(210,240,235,0.7)', 'rgba(170,215,205,0.75)', 'rgba(140,190,180,0.75)'));
    A(seg(t, 24.4, 25.0) * (1 - seg(t, 26.4, 26.8)), () => {
      font(700, 30, TEXT);
      text('thin glass cover', 90, baseY - 30 - 150, { align: 'left', base: 'middle', color: C.turq });
      text('gold leaf', 90, baseY - 12 - 70, { align: 'left', base: 'middle', color: C.goldHi });
      text('glass base', 90, baseY + 60, { align: 'left', base: 'middle', color: C.turq });
    });
    // how thin, how little gold
    A(seg(t, 26.9, 27.6), () => {
      ctx.strokeStyle = C.goldHi; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 8, baseY - 12); ctx.lineTo(x - 40, baseY + 40); ctx.stroke();
      font(700, 32, TEXT); text('gold leaf: under', x - 44, baseY + 66, { align: 'right', base: 'middle', color: C.goldHi });
      text(`${LEAF_UM} µm thick`, x - 44, baseY + 102, { align: 'right', base: 'middle', color: C.goldHi });
      ctx.fillStyle = 'rgba(10,20,36,0.85)'; k.rrect(80, 120, 704, 150, 18); ctx.fill();
      font(700, 30, TEXT);
      text(`${LEAF_UM} µm  ×  1 m²  ×  ${GOLD_DENSITY} g/cm³`, CX, 162, { align: 'center', base: 'middle', color: C.soft });
      const g = lerp(0, GOLD_PER_M2, eio(seg(t, 27.6, 29.0)));
      font(600, 52); text(`= ${g.toFixed(1)} g of gold`, CX, 222, { align: 'center', base: 'middle', color: C.goldHi });
    });
  });
}

// ---------- E, F: light on tilted tiles ----------
// A vertical slice through the nave: sunlight comes in from the upper left and hits a strip of gold tiles on the apse
// wall; each tile reflects it about its own tilt. Where a reflected ray crosses eye height, a viewer standing there
// sees that tile flash: within ±0.3° of the exact direction, about the Sun's own radius in the sky.
const WALL_X = 780, WALL_TOP = 170, WALL_BOT = 300, FLOOR = 650, EYE = 610, NAVE_L = 60;
const STRIP = 120, MAX_TILT = 5, SEE = 0.3;
let tilts = null;
function makeTilts() { seed = 31; tilts = Array.from({ length: STRIP }, () => (rnd() - 0.5) * 2); }
/** Trace sunlight (going down at sunDeg) off tile i (tilted by tiltDeg) to where it crosses eye height. */
function flashX(i, tiltDeg, sunDeg) {
  const y = WALL_TOP + (i + 0.5) * (WALL_BOT - WALL_TOP) / STRIP;
  const d = { x: Math.cos(rad(sunDeg)), y: Math.sin(rad(sunDeg)) };
  const n = { x: -Math.cos(rad(tiltDeg)), y: -Math.sin(rad(tiltDeg)) };
  const dot = d.x * n.x + d.y * n.y;
  const r = { x: d.x - 2 * dot * n.x, y: d.y - 2 * dot * n.y };
  return { y, r, x: WALL_X + r.x * (EYE - y) / r.y };
}
function sceneLight(t) {
  const a = span(t, 31.2, 53.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 31–35: a first look at tilted tiles; 35.6–40: all flat; from 40: tilted for good
    const preview = eio(seg(t, 31.6, 32.8)) * (1 - eio(seg(t, 34.2, 35.2)));
    const amt = MAX_TILT * Math.max(preview, eio(seg(t, 40.0, 41.4)));
    const sun = 40 + (t > 48.8 ? Math.sin(((t - 48.8) / 4.4) * Math.PI) * 7 : 0);
    const d = { x: Math.cos(rad(sun)), y: Math.sin(rad(sun)) };
    // the nave in section: floor, apse wall, eye height
    ctx.fillStyle = 'rgba(201,187,155,0.28)'; ctx.fillRect(NAVE_L, FLOOR, WALL_X - NAVE_L + 30, 12);
    ctx.fillStyle = 'rgba(201,187,155,0.2)'; ctx.fillRect(WALL_X + 6, 150, 26, FLOOR - 150);
    ctx.setLineDash([6, 8]); ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(NAVE_L, EYE); ctx.lineTo(WALL_X, EYE); ctx.stroke(); ctx.setLineDash([]);
    font(700, 26, TEXT);
    text('gold on the apse wall', WALL_X - 14, 140, { align: 'right', base: 'middle', color: C.goldHi });
    text('eye height', NAVE_L, EYE - 22, { base: 'middle', color: C.soft });
    // the Sun and its parallel rays
    const sx = WALL_X - d.x * 250, sy = (WALL_TOP + WALL_BOT) / 2 - d.y * 250;
    ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(sx, sy, 28, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,224,138,0.4)'; ctx.lineWidth = 2;
    for (let i = 0; i < STRIP; i += 12) {
      const y = WALL_TOP + (i + 0.5) * (WALL_BOT - WALL_TOP) / STRIP;
      ctx.beginPath(); ctx.moveTo(WALL_X - d.x * 210, y - d.y * 210); ctx.lineTo(WALL_X, y); ctx.stroke();
    }
    // the viewer walks along the nave
    const walk = (Math.sin(((t - 31.2) / 8.7) * Math.PI - Math.PI / 2) + 1) / 2;
    const vx = lerp(110, 500, walk);
    let hits = 0;
    const marks = [];
    for (let i = 0; i < STRIP; i++) {
      const tilt = tilts[i] * amt;
      const f = flashX(i, tilt, sun);
      const toEye = Math.atan2(EYE - f.y, vx - WALL_X), refl = Math.atan2(f.r.y, f.r.x);
      const hit = Math.abs(toEye - refl) < rad(SEE);
      if (hit) hits++;
      if (f.x > NAVE_L && f.x < WALL_X) marks.push(f.x);
      if (hit || i % 3 === 0) {
        ctx.strokeStyle = hit ? 'rgba(255,240,181,0.95)' : 'rgba(255,224,138,0.15)'; ctx.lineWidth = hit ? 3 : 1.2;
        ctx.beginPath(); ctx.moveTo(WALL_X, f.y); ctx.lineTo(f.x, EYE); ctx.stroke();
      }
      ctx.save(); ctx.translate(WALL_X, f.y); ctx.rotate(rad(tilt));
      ctx.fillStyle = hit ? C.goldHi : i % 2 ? C.gold : C.gold2; ctx.fillRect(-2, -0.7, 10, 1.4); ctx.restore();
      if (hit) { ctx.fillStyle = 'rgba(255,240,181,0.55)'; ctx.beginPath(); ctx.arc(WALL_X + 2, f.y, 13, 0, TAU); ctx.fill(); }
    }
    // where along the nave a flash can be caught
    ctx.fillStyle = C.goldHi;
    for (const x of marks) ctx.fillRect(x - 1, EYE - 8, 2, 16);
    // the viewer
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(vx, EYE, 12, 0, TAU); ctx.fill();
    ctx.fillRect(vx - 8, EYE + 14, 16, FLOOR - EYE - 14);
    ctx.fillStyle = C.night; ctx.beginPath(); ctx.arc(vx + 5, EYE - 2, 3, 0, TAU); ctx.fill();
    if (hits) { ctx.strokeStyle = C.goldHi; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(vx, EYE, 20 + Math.min(hits, 8) * 2, 0, TAU); ctx.stroke(); }
    // what the viewer sees
    ctx.fillStyle = 'rgba(10,20,36,0.85)'; k.rrect(60, 690, 500, 82, 14); ctx.fill();
    font(700, 30, TEXT);
    text(amt < 0.3 ? 'All tiles flat' : `Tiles tilted up to ${Math.round(amt)}° either way`, 82, 716, { base: 'middle', color: C.goldHi });
    font(400, 28, TEXT); text(hits ? `${hits} tile${hits > 1 ? 's' : ''} flashing at this viewer` : 'no flash for this viewer', 82, 750, { base: 'middle', color: hits ? C.ink : C.soft });
    if (t > 48.8) A(seg(t, 49.0, 49.6), () => { font(700, 26, TEXT); text('the Sun moves', sx - 40, sy + 50, { align: 'right', base: 'middle', color: C.sun }); });
  });
}

// ---------- G: Cavallini, and 900 years ----------
function sceneEnd(t) {
  const a = span(t, 53.2, 62.4, 0.5, 0);
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(CX, 80); ctx.scale(0.78, 0.78); ctx.translate(-CX, -80);
    apse(t, Math.sin(t * 0.5) * 0.8, 0);
    sheepFrieze(AP.base + 40);
    // Cavallini's panels below the apse
    const pv = seg(t, 53.6, 54.6);
    for (let i = 0; i < 7; i++) {
      A(seg(t, 53.8 + i * 0.15, 54.4 + i * 0.15), () => {
        const x = AP.cx - AP.rx + 6 + i * 105, y = AP.base + 140;
        ctx.fillStyle = i === 3 ? '#26407a' : '#2c4a6e'; ctx.fillRect(x, y, 96, 120);
        ctx.strokeStyle = C.goldHi; ctx.lineWidth = 3; ctx.strokeRect(x, y, 96, 120);
        ctx.fillStyle = C.gold; ctx.fillRect(x + 8, y + 8, 80, 44);
        ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(x + 34, y + 70, 9, 0, TAU); ctx.arc(x + 64, y + 74, 9, 0, TAU); ctx.fill();
        ctx.fillStyle = i % 2 ? C.red : C.lapis2; ctx.fillRect(x + 24, y + 82, 20, 30); ctx.fillRect(x + 54, y + 86, 20, 26);
      });
    }
    ctx.restore();
    A(pv * (1 - seg(t, 57.2, 57.6)), () => {
      font(700, 32, TEXT); text('Pietro Cavallini, 1291', CX, 704, { align: 'center', base: 'middle', color: C.goldHi });
    });
    // a time bar: 1st century BC, 1140, today
    A(seg(t, 57.8, 58.6), () => {
      const L = 110, R = 754, Y = 712, X = (yr) => L + ((yr + 100) / (NOW + 100)) * (R - L);
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L, Y); ctx.lineTo(R, Y); ctx.stroke();
      const grow = eio(seg(t, 58.6, 60.4));
      ctx.strokeStyle = C.goldHi; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(X(BUILT), Y); ctx.lineTo(lerp(X(BUILT), X(NOW), grow), Y); ctx.stroke();
      for (const [yr, lab, al] of [[-100, '1st c. BC', 'left'], [BUILT, '1140', 'center'], [NOW, 'today', 'right']]) {
        ctx.fillStyle = C.goldHi; ctx.beginPath(); ctx.arc(X(yr), Y, 8, 0, TAU); ctx.fill();
        font(700, 28, TEXT); text(lab, X(yr), Y + 36, { align: al, base: 'middle', color: C.ink });
      }
      A(seg(t, 60.2, 60.8), () => { font(600, 32); text(`${AGE} years`, (X(BUILT) + X(NOW)) / 2, Y - 30, { align: 'center', base: 'middle', color: C.goldHi }); });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 62.4, fonts: [TITLE, TEXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) { paintBg(); makeTiles(); makeTilts(); }
    ctx.drawImage(bg, 0, 0);
    sceneApse(t);
    sceneMortar(t);
    sceneTessera(t);
    sceneLight(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 600, family: TEXT, ink: C.ink, marks: { '*': '#f2c45a', '~': C.turq, '^': C.rose } });
  },
});
