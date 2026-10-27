// Explainer for art-sistine-ceiling-giornate (Roma): Michelangelo painted the Sistine Chapel ceiling (1508–1512) in
// buon fresco, one patch of wet lime plaster a day, and restorers count about 570 of these giornate. Look: the dim
// chapel, the ceiling seen from below as a plan in restored fresco colours (lime white, ochre, sky blue, rose,
// green earth); a cross-section of plaster under a lens; the ceiling filling up patch by patch. EB Garamond for
// captions, Source Sans 3 for labels.
//
// Facts:
// - Wikipedia, "Sistine Chapel ceiling": painted between 1508 and 1512, commissioned by Pope Julius II (contract
//   8 May 1508, finished work shown 31 October 1512); a shallow barrel vault about 35 m long and 14 m broad, about
//   20 m above the floor; over 300 figures; nine central scenes from Genesis, with prophets and sibyls on thrones.
//   Fresco relies on a reaction between damp lime plaster and water-based pigments. Because Michelangelo painted
//   al fresco, the plaster (intonaco) was laid in a new section every day, a giornata; at the beginning of each
//   session the edges were scraped away and a new area laid (Mancinelli 1986). At first the intonaco grew mould
//   because it was too wet. The modern restoration found the exact numbers of the giornate: in Pfisterer's
//   discussion, 300 for the first half (to the Creation of Eve) and 270 for the rest, so about 570 in all. Work
//   began at the entrance end and went backwards through the Genesis story.
// - Wikipedia, "Fresco": in buon fresco, pigment mixed only with water sinks into a thin layer of wet plaster, the
//   intonaco, over a rough underlayer, the arriccio; no binder is needed. Lime: CaCO3 → CaO + CO2 (burning),
//   CaO + H2O → Ca(OH)2 (slaking), Ca(OH)2 + CO2 → CaCO3 + H2O (setting); this carbonatation fixes the colour.
//   Plaster takes 10 to 12 hours to dry; painting from an hour after laying to two hours before drying gives 7 to
//   9 hours. Unpainted intonaco is removed before the next day. A wall-sized fresco may have 10 to 20 or more
//   giornate. Only some pigments work in the alkaline lime.
// - Bordoni et al., CHArt 1999: the plaster of the latest giornata overlaps the border of those painted before,
//   so the overlaps put the giornate in chronological order.
// - G. Colalucci (chief restorer), Conservation Science in Cultural Heritage: restoration June 1980 to 8 April
//   1994; Michelangelo's palette was colours suited to fresco, essentially natural or burnt oxides (lime white,
//   vine and ivory black, umber, siennas, yellow and red ochres, green earth, smalt, lapis lazuli); the cleaning
//   removed glue and carbon black (soot) and restored the colours.
// Computed here: 300 + 270 = 570 giornate; the working window 10 − 3 = 7 to 12 − 3 = 9 hours; the 570 patches of the
// plan are a 15 × 38 grid (illustrative: the real giornate differ in size and shape).
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The ceiling as a plan: nine scenes, prophets and sibyls; 35 × 14 m, 20 m up.
//  B  9.2–23.0  One panel: a day's patch of wet plaster; the layers; pigment soaks in.
//  C 23.0–32.0  Under the lens: lime takes CO2 and turns to calcium carbonate around the pigment.
//  D 32.0–41.2  The day's clock: 10–12 h to dry; the unpainted edge cut away; the next patch laps over.
//  E 41.2–55.0  570 giornate fill the ceiling; overlaps give the order.
//  F 55.0–64.6  The palette of earths; soot and glue wiped away.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg: '#1f1813', bg2: '#2c2119', ink: '#f4e9d6', soft: 'rgba(244,233,214,0.72)', faint: 'rgba(244,233,214,0.25)',
  lime: '#efe6d2', plaster: '#e3d6bd', wet: '#c9b896', arriccio: '#b7a27f', brick: '#8a4b33',
  ochre: '#d99a3b', gold: '#e8b04a', sky: '#9cc6e0', rose: '#e08c74', green: '#8fa06a', umber: '#6e4a2e',
  violet: '#8e4f63', flesh: '#e3b48f', red: '#b5523a', soot: 'rgba(52,38,26,0.86)', co2: '#9cc6e0',
};
const SERIF = 'EB Garamond', SANS = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const LONG = 35, BROAD = 14, UP = 20; // metres
const FIRST_HALF = 300, SECOND_HALF = 270; // giornate (Pfisterer, via Wikipedia)
const GIORNATE = FIRST_HALF + SECOND_HALF; // 570
const DRY = [10, 12], LEAD = 1, MARGIN = 2; // hours
const WORK = DRY.map((d) => d - LEAD - MARGIN); // 7 to 9 hours
const COLS = 15, ROWS = 38;
if (GIORNATE !== 570 || COLS * ROWS !== GIORNATE || WORK[0] !== 7 || WORK[1] !== 9) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'From 1508 to 1512 Michelangelo painted the Sistine Chapel ceiling, for Pope Julius II.'],
  [4.8, 9.0, `Its vault is about *${LONG} m* long and *${BROAD} m* wide, ${UP} m up, with over 300 painted figures.`],
  [9.2, 13.6, 'He painted it in ~buon fresco~, true fresco: colour brushed into wet lime plaster.'],
  [13.8, 18.2, 'Each morning fresh plaster, the *intonaco*, went on just where he would paint that day.'],
  [18.4, 22.8, 'The colour needs no glue: pigment mixed with water simply soaks into the wet plaster.'],
  [23.0, 27.4, 'The plaster is slaked lime. As it sets, it takes ~carbon dioxide~ from the air…'],
  [27.6, 32.0, '…and turns into *calcium carbonate*, the stuff of limestone, with the colour locked inside.'],
  [32.2, 36.6, `A coat of plaster dries in about *${DRY[0]} to ${DRY[1]} hours*, leaving some ${WORK[0]} to ${WORK[1]} hours to paint it.`],
  [36.8, 41.2, 'Whatever was left unpainted was cut away, and the next day’s patch lapped over the edge.'],
  [41.4, 45.8, 'Each patch is a *giornata*, a ‘day’. Restorers mapped the seams in the 1980–1994 cleaning.'],
  [46.0, 50.4, `They count about *${GIORNATE}* on the ceiling. A big wall fresco may take ~10 to 20~.`],
  [50.6, 55.0, 'A newer patch always laps over an older one, so the seams also give the order of the days.'],
  [55.2, 59.6, 'Only lime-proof colours work in fresco, so his palette was mostly earths: ochre, umber, green.'],
  [59.8, 64.2, 'Cleaning off centuries of candle soot and old glue brought those colours back.'],
];

// ---------- seeded noise ----------
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(CX, 380, 60, CX, 420, 760);
  rg.addColorStop(0, C.bg2); rg.addColorStop(1, C.bg);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(240,220,190,${rnd() * 0.035})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd()); }
}

// ---------- the ceiling plan ----------
// The plan is drawn upright: the entrance end at the bottom, the altar end at the top.
const PLAN = { x: CX - 126, y: 92, w: 252, h: 630 }; // 18 px per metre
const PX = PLAN.h / LONG;
// nine Genesis panels, small and large alternating, from the altar end (top) to the entrance end
const PANELS = ['S', 'L', 'S', 'L', 'S', 'L', 'S', 'L', 'S'];
const PANEL_COLS = [C.violet, C.sky, C.green, C.flesh, C.rose, C.green, C.ochre, C.sky, C.rose];
function plan(a, { mosaic = 0, filled = 0, labels = 0 } = {}) {
  A(a, () => {
    const { x, y, w, h } = PLAN;
    // the vault: lime white with painted architecture
    ctx.fillStyle = C.lime; ctx.fillRect(x, y, w, h);
    // the central strip of nine scenes, framed by painted cornices
    const sx = x + 62, sw = w - 124, sy = y + 34, sh = h - 68;
    ctx.fillStyle = '#d8c9ab'; ctx.fillRect(sx - 6, sy - 6, sw + 12, sh + 12);
    const unit = sh / (PANELS.reduce((s, p) => s + (p === 'L' ? 1.6 : 1), 0));
    let yy = sy;
    PANELS.forEach((p, i) => {
      const hh = unit * (p === 'L' ? 1.6 : 1) - 6;
      ctx.fillStyle = PANEL_COLS[i]; ctx.globalAlpha *= 0.85;
      ctx.fillRect(sx + (p === 'S' ? 18 : 0), yy, sw - (p === 'S' ? 36 : 0), hh);
      ctx.globalAlpha /= 0.85;
      if (p === 'S') { // ignudi and medallions beside the small scenes
        ctx.fillStyle = C.gold; for (const ox of [sx + 8, sx + sw - 8]) { ctx.beginPath(); ctx.arc(ox, yy + hh / 2, 6, 0, TAU); ctx.fill(); }
      }
      yy += hh + 6;
    });
    // thrones of prophets and sibyls: five on each side, one at each end
    const thrones = [];
    for (let i = 0; i < 5; i++) { const ty = y + 70 + i * ((h - 140) / 4); thrones.push([x + 4, ty - 26, 50, 52], [x + w - 54, ty - 26, 50, 52]); }
    thrones.push([x + w / 2 - 30, y + 2, 60, 28], [x + w / 2 - 30, y + h - 30, 60, 28]);
    for (const [tx, ty, tw, th] of thrones) {
      ctx.fillStyle = '#cdb994'; ctx.fillRect(tx, ty, tw, th);
      ctx.fillStyle = C.rose; ctx.globalAlpha *= 0.8; ctx.beginPath(); ctx.ellipse(tx + tw / 2, ty + th / 2, tw * 0.28, th * 0.36, 0, 0, TAU); ctx.fill(); ctx.globalAlpha /= 0.8;
    }
    // spandrel triangles between the thrones
    ctx.fillStyle = C.umber; ctx.globalAlpha *= 0.55;
    for (let i = 0; i < 4; i++) {
      const ty = y + 70 + (i + 0.5) * ((h - 140) / 4);
      for (const [ex, dir] of [[x, 1], [x + w, -1]]) { ctx.beginPath(); ctx.moveTo(ex, ty - 30); ctx.lineTo(ex + dir * 34, ty); ctx.lineTo(ex, ty + 30); ctx.fill(); }
    }
    ctx.globalAlpha /= 0.55;
    // the giornate mosaic: fills cell by cell from the entrance end (bottom)
    if (mosaic > 0) A(mosaic, () => {
      const n = Math.round(filled * GIORNATE);
      for (let c = 0; c < GIORNATE; c++) {
        const r = ROWS - 1 - Math.floor(c / COLS), q = c % COLS;
        const p = cell(q, r);
        ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (const v of p.slice(1)) ctx.lineTo(v[0], v[1]); ctx.closePath();
        if (c < n) { ctx.fillStyle = 'rgba(232,176,74,0.16)'; ctx.fill(); ctx.strokeStyle = 'rgba(60,40,20,0.55)'; ctx.lineWidth = 1.1; ctx.stroke(); }
        else { ctx.fillStyle = 'rgba(31,24,19,0.72)'; ctx.fill(); }
      }
    });
    ctx.strokeStyle = C.umber; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
    A(labels, () => {
      font(600, 22); text('ALTAR END', x + w / 2, y - 18, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
      text('ENTRANCE END', x + w / 2, y + h + 22, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    });
  });
}
// jittered grid vertices for the 15 × 38 patches
const GRID = [];
for (let r = 0; r <= ROWS; r++) {
  const row = [];
  for (let q = 0; q <= COLS; q++) {
    const edge = r === 0 || r === ROWS || q === 0 || q === COLS;
    const jx = edge && (q === 0 || q === COLS) ? 0 : (rnd() - 0.5) * 0.55, jy = edge && (r === 0 || r === ROWS) ? 0 : (rnd() - 0.5) * 0.55;
    row.push([PLAN.x + ((q + jx) / COLS) * PLAN.w, PLAN.y + ((r + jy) / ROWS) * PLAN.h]);
  }
  GRID.push(row);
}
const cell = (q, r) => [GRID[r][q], GRID[r][q + 1], GRID[r + 1][q + 1], GRID[r + 1][q]];

function dimension(x1, y1, x2, y2, label, a, side = 1) {
  A(a, () => {
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const ang = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(ang) * 10, ny = Math.cos(ang) * 10;
    for (const [px, py] of [[x1, y1], [x2, y2]]) { ctx.beginPath(); ctx.moveTo(px - nx, py - ny); ctx.lineTo(px + nx, py + ny); ctx.stroke(); }
    font(700, 30); text(label, (x1 + x2) / 2 + side * (x1 === x2 ? 52 : 0), (y1 + y2) / 2 + (y1 === y2 ? -26 : 0), { align: 'center', base: 'middle', color: C.gold });
  });
}

// ---------- A: the ceiling ----------
function sceneCeiling(t) {
  const a = span(t, 0, 9.4, 0.5, 0.5);
  if (a <= 0) return;
  plan(a, { labels: seg(t, 1.0, 2.0) });
  A(a * seg(t, 0.6, 1.6), () => {
    font(700, 26); text('SISTINE', 60, 150, { base: 'middle', color: C.ink, spacing: '3px' });
    text('CHAPEL', 60, 182, { base: 'middle', color: C.ink, spacing: '3px' });
    font(400, 26, SERIF); text('the Vatican, Rome', 60, 222, { base: 'middle', color: C.soft });
    text('1508–1512', 60, 256, { base: 'middle', color: C.soft });
  });
  dimension(PLAN.x + PLAN.w + 30, PLAN.y, PLAN.x + PLAN.w + 30, PLAN.y + PLAN.h, `${LONG} m`, a * seg(t, 5.0, 5.8), 1);
  A(a * seg(t, 5.6, 6.4), () => {
    const y = PLAN.y + PLAN.h + 52;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(PLAN.x, y); ctx.lineTo(PLAN.x + PLAN.w, y); ctx.stroke();
    for (const px of [PLAN.x, PLAN.x + PLAN.w]) { ctx.beginPath(); ctx.moveTo(px, y - 10); ctx.lineTo(px, y + 10); ctx.stroke(); }
    font(700, 30); text(`${BROAD} m`, PLAN.x + PLAN.w + 16, y, { base: 'middle', color: C.gold });
  });
  A(a * seg(t, 6.4, 7.2), () => {
    font(600, 24); text(`${UP} m above`, 60, 560, { base: 'middle', color: C.soft });
    text('the floor', 60, 590, { base: 'middle', color: C.soft });
    text('300+ figures', 60, 640, { base: 'middle', color: C.rose });
  });
}

// ---------- B: one panel, one day ----------
// a panel of the ceiling at large, with a day's patch of plaster being laid and painted
const BOX = { x: 72, y: 96, w: 720, h: 380 };
// the seams of the panel's giornate, as polygons in panel units (0–1)
const PATCHES = [
  [[0, 0], [0.42, 0], [0.38, 0.46], [0, 0.52]],
  [[0.42, 0], [1, 0], [1, 0.4], [0.62, 0.44], [0.38, 0.46]],
  [[0, 0.52], [0.38, 0.46], [0.46, 1], [0, 1]],
  [[0.38, 0.46], [0.62, 0.44], [0.6, 1], [0.46, 1]],
  [[0.62, 0.44], [1, 0.4], [1, 1], [0.6, 1]],
];
const TODAY = 3; // the patch laid during the scene
function patchPath(p, x, y, w, h) {
  ctx.beginPath(); ctx.moveTo(x + p[0][0] * w, y + p[0][1] * h);
  for (const v of p.slice(1)) ctx.lineTo(x + v[0] * w, y + v[1] * h);
  ctx.closePath();
}
function paintedPanel(x, y, w, h, upto, todayPaint) {
  // the picture: sky, a slope of earth, two arms reaching (a simplified Creation of Adam)
  const draw = () => {
    ctx.fillStyle = C.sky; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = C.green; ctx.beginPath(); ctx.moveTo(x, y + h * 0.55); ctx.quadraticCurveTo(x + w * 0.28, y + h * 0.5, x + w * 0.42, y + h); ctx.lineTo(x, y + h); ctx.fill();
    ctx.fillStyle = C.violet; ctx.beginPath(); ctx.ellipse(x + w * 0.8, y + h * 0.36, w * 0.2, h * 0.24, -0.15, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.flesh; ctx.lineCap = 'round';
    ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + h * 0.62); ctx.quadraticCurveTo(x + w * 0.34, y + h * 0.5, x + w * 0.47, y + h * 0.5); ctx.stroke();
    ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(x + w * 0.66, y + h * 0.4); ctx.quadraticCurveTo(x + w * 0.58, y + h * 0.47, x + w * 0.52, y + h * 0.48); ctx.stroke();
    ctx.fillStyle = C.flesh; ctx.beginPath(); ctx.ellipse(x + w * 0.16, y + h * 0.6, 30, 34, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + w * 0.7, y + h * 0.33, 28, 32, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.lime; ctx.beginPath(); ctx.ellipse(x + w * 0.72, y + h * 0.27, 26, 20, 0, 0, TAU); ctx.fill();
  };
  PATCHES.forEach((p, i) => {
    if (i > upto) { patchPath(p, x, y, w, h); ctx.fillStyle = C.arriccio; ctx.fill(); return; }
    ctx.save(); patchPath(p, x, y, w, h); ctx.clip();
    if (i < TODAY || i < upto) draw();
    else {
      ctx.fillStyle = C.wet; ctx.fillRect(x, y, w, h);
      // today's patch is painted with a sweeping reveal
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w * todayPaint, h); ctx.clip(); draw(); ctx.restore();
    }
    ctx.restore();
  });
  // seams
  ctx.strokeStyle = 'rgba(40,28,18,0.55)'; ctx.lineWidth = 2;
  PATCHES.forEach((p, i) => { if (i <= upto) { patchPath(p, x, y, w, h); ctx.stroke(); } });
  ctx.strokeStyle = C.umber; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
}
function layers(x, y, w, wetness, pigment) {
  // cross-section of the vault surface: masonry, arriccio, intonaco, pigment
  const rows = [['masonry', C.brick, 80], ['arriccio: rough plaster', C.arriccio, 50], ['intonaco: fresh, wet plaster', wetness > 0.5 ? C.wet : C.plaster, 34]];
  let yy = y;
  const order = [rows[2], rows[1], rows[0]];
  order.forEach(([name, col, hh], i) => {
    ctx.fillStyle = col; ctx.fillRect(x, yy, w, hh);
    if (i === 2) { ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; for (let bx = x + 10; bx < x + w; bx += 70) { ctx.strokeRect(bx, yy + 6, 60, 26); ctx.strokeRect(bx + 35, yy + 38, 60, 26); } }
    font(600, 22); text(name, x + w + 18, yy + hh / 2, { base: 'middle', color: i === 0 ? C.gold : C.soft });
    yy += hh;
  });
  // pigment grains settle into the top of the intonaco
  if (pigment > 0) {
    let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      const gx = x + 8 + r() * (w - 16), depth = 3 + r() * 16;
      ctx.fillStyle = [C.red, C.ochre, C.sky][i % 3];
      ctx.beginPath(); ctx.arc(gx, y + lerp(-26, depth, pigment), 3.6, 0, TAU); ctx.fill();
    }
  }
}
function scenePanel(t) {
  const a = span(t, 9.2, 23.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const lay = eio(seg(t, 10.0, 11.2)), paint = eio(seg(t, 11.4, 13.4));
    const upto = t < 10.0 ? TODAY - 1 : TODAY;
    paintedPanel(BOX.x, BOX.y, BOX.w, BOX.h, upto, paint);
    // the trowel laying today's patch
    if (lay > 0 && lay < 1) {
      const p = PATCHES[TODAY];
      ctx.save(); patchPath(p, BOX.x, BOX.y, BOX.w, BOX.h); ctx.clip();
      ctx.fillStyle = C.arriccio; ctx.fillRect(BOX.x, BOX.y + BOX.h * lay, BOX.w, BOX.h);
      ctx.restore();
    }
    A(seg(t, 10.4, 11.0) * (1 - seg(t, 13.4, 13.8)), () => {
      const p = PATCHES[TODAY], cx = BOX.x + BOX.w * 0.52, cy = BOX.y + BOX.h * 0.78;
      font(700, 22); text('TODAY’S', cx, cy - 14, { align: 'center', base: 'middle', color: C.bg }); text('PATCH', cx, cy + 14, { align: 'center', base: 'middle', color: C.bg });
    });
    // the layers in section
    A(seg(t, 14.2, 15.0), () => {
      layers(BOX.x, 590, 340, 1, eio(seg(t, 18.8, 20.6)));
      font(700, 24); text('SECTION THROUGH THE CEILING', BOX.x, 530, { base: 'middle', color: C.soft, spacing: '3px' });
    });
    A(seg(t, 19.6, 20.4), () => {
      font(400, 28, SERIF); text('pigment + water, no glue', BOX.x + 358, 566, { base: 'middle', color: C.gold });
    });
  });
}

// ---------- C: lime takes up carbon dioxide ----------
const LENS = { x: CX, y: 380, r: 250 };
const GRAINS = [];
for (let i = 0; i < 46; i++) { const ang = rnd() * TAU, rr = Math.sqrt(rnd()) * (LENS.r - 40); GRAINS.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr * 0.9 + 20, s: 12 + rnd() * 10, rot: rnd() * TAU, delay: rnd() }); }
const PIGMENTS = [];
for (let i = 0; i < 12; i++) { const ang = rnd() * TAU, rr = Math.sqrt(rnd()) * (LENS.r - 70); PIGMENTS.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr * 0.8 + 10, col: [C.red, C.ochre, C.sky][i % 3] }); }
function formula(parts, x, y, size, color) {
  // parts: strings; digits after a letter are drawn as subscripts
  font(700, size);
  let cx = x;
  for (const s of parts) {
    for (let i = 0; i < s.length; i++) {
      const ch = s[i], sub = /[0-9]/.test(ch) && i > 0 && /[A-Za-z)]/.test(s[i - 1]);
      font(700, sub ? size * 0.62 : size);
      text(ch, cx, y + (sub ? size * 0.22 : 0), { base: 'middle', color });
      cx += ctx.measureText(ch).width;
    }
  }
  return cx - x;
}
function formulaWidth(parts, size) {
  let wsum = 0;
  for (const s of parts) for (let i = 0; i < s.length; i++) { const sub = /[0-9]/.test(s[i]) && i > 0 && /[A-Za-z)]/.test(s[i - 1]); font(700, sub ? size * 0.62 : size); wsum += ctx.measureText(s[i]).width; }
  return wsum;
}
function leader(x1, y1, x2, y2, label, col, align) {
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 + (align === 'left' ? 40 : -40), y2 - 26); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x1, y1, 4, 0, TAU); ctx.fill();
  font(600, 24); text(label, x2, y2, { align, base: 'middle', color: col });
}
function sceneLime(t) {
  const a = span(t, 23.0, 32.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const conv = eio(seg(t, 27.4, 31.0));
    // the lens
    ctx.save(); ctx.beginPath(); ctx.arc(LENS.x, LENS.y, LENS.r, 0, TAU); ctx.clip();
    ctx.fillStyle = lerp(0, 1, conv) > 0.5 ? '#e9e1cf' : '#d9ccb0'; ctx.fillRect(LENS.x - LENS.r, LENS.y - LENS.r, 2 * LENS.r, 2 * LENS.r);
    ctx.fillStyle = 'rgba(120,150,170,0.12)'; ctx.fillRect(LENS.x - LENS.r, LENS.y - LENS.r, 2 * LENS.r, 90); // air above the surface
    for (const g of GRAINS) {
      const local = clamp((conv - g.delay * 0.5) / 0.5);
      const x = LENS.x + g.x, y = LENS.y + g.y;
      if (local < 1) A(1 - local, () => { ctx.fillStyle = '#f6f2ea'; ctx.beginPath(); ctx.arc(x, y, g.s * 0.62, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(90,80,60,0.3)'; ctx.lineWidth = 1.5; ctx.stroke(); });
      if (local > 0) A(local, () => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(g.rot);
        ctx.fillStyle = '#fbf7ef'; ctx.strokeStyle = 'rgba(110,90,60,0.55)'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-g.s * 0.8, 0); ctx.lineTo(0, -g.s * 0.55); ctx.lineTo(g.s * 0.8, 0); ctx.lineTo(0, g.s * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      });
    }
    for (const p of PIGMENTS) { ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(LENS.x + p.x, LENS.y + p.y, 7, 0, TAU); ctx.fill(); }
    // CO2 molecules drift in from the air, and water leaves
    for (let i = 0; i < 16; i++) {
      const ph = ((t - 23.6) * 0.35 + i / 16) % 1;
      if (t < 23.6 || t > 31.4) continue;
      const x = LENS.x - LENS.r + 40 + ((i * 97) % (2 * LENS.r - 80)), y = LENS.y - LENS.r + 30 + ph * (LENS.r * 1.2);
      A(Math.min(1, ph * 4) * (1 - seg(ph, 0.75, 1)), () => {
        ctx.fillStyle = '#5a7f9a'; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(x - 11, y, 5, 0, TAU); ctx.arc(x + 11, y, 5, 0, TAU); ctx.fill();
      });
    }
    ctx.restore();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(LENS.x, LENS.y, LENS.r, 0, TAU); ctx.stroke();
    // labels
    font(600, 22);
    A(seg(t, 23.6, 24.4), () => {
      text('carbon dioxide from the air', LENS.x + LENS.r - 10, LENS.y - LENS.r - 8, { align: 'right', base: 'bottom', color: C.sky });
      const g = GRAINS.reduce((m, q) => (q.x - q.y < m.x - m.y ? q : m)), p = PIGMENTS.reduce((m, q) => (q.x + q.y > m.x + m.y ? q : m));
      leader(LENS.x + g.x, LENS.y + g.y, 70, 690, conv > 0.6 ? 'calcium carbonate' : 'slaked lime', conv > 0.6 ? C.gold : C.soft, 'left');
      leader(LENS.x + p.x, LENS.y + p.y, W - 70, 690, 'pigment grain', C.rose, 'right');
    });
    // the equation
    const parts1 = ['Ca(OH)2', ' + ', 'CO2'], parts2 = [' → ', 'CaCO3', ' + ', 'H2O'];
    const size = 34, w1 = formulaWidth(parts1, size), w2 = formulaWidth(parts2, size);
    const x0 = CX - (w1 + w2) / 2;
    A(seg(t, 24.4, 25.2), () => formula(parts1, x0, 72, size, C.ink));
    A(seg(t, 28.0, 28.8), () => formula(parts2, x0 + w1, 72, size, C.gold));
  });
}

// ---------- D: the day's clock, and the next patch ----------
function sceneClock(t) {
  const a = span(t, 32.0, 41.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a 14-hour bar: laid at 0, paint from 1 h, stop 2 h before it dries, dry at 10–12 h
    const L = 92, R = 772, y = 170, hpx = (R - L) / 14;
    const X = (h) => L + h * hpx;
    const grow = eio(seg(t, 32.4, 34.0));
    ctx.fillStyle = 'rgba(244,233,214,0.12)'; ctx.fillRect(L, y, (R - L) * grow, 56);
    A(seg(t, 33.4, 34.2), () => {
      ctx.fillStyle = C.wet; ctx.fillRect(X(0), y, X(DRY[0]) - X(0), 56);
      const gr = ctx.createLinearGradient(X(DRY[0]), 0, X(DRY[1]), 0); gr.addColorStop(0, C.wet); gr.addColorStop(1, 'rgba(201,184,150,0)');
      ctx.fillStyle = gr; ctx.fillRect(X(DRY[0]), y, X(DRY[1]) - X(DRY[0]), 56);
    });
    A(seg(t, 34.4, 35.2), () => {
      ctx.fillStyle = C.gold; ctx.fillRect(X(LEAD), y + 64, X(DRY[1] - MARGIN) - X(LEAD), 14);
      ctx.fillStyle = 'rgba(232,176,74,0.5)'; ctx.fillRect(X(LEAD), y + 64, X(DRY[0] - MARGIN) - X(LEAD), 14);
      font(600, 22); text(`painting: ${WORK[0]}–${WORK[1]} h`, X(LEAD), y + 102, { base: 'middle', color: C.gold });
    });
    font(600, 22);
    for (let hh = 0; hh <= 14; hh += 2) A(grow, () => text(`${hh} h`, X(hh), y - 20, { align: 'center', base: 'middle', color: C.soft }));
    A(seg(t, 33.8, 34.6), () => { text('wet', X(4), y + 28, { align: 'center', base: 'middle', color: C.bg }); text(`dry by ${DRY[0]}–${DRY[1]} h`, X(DRY[1]) + 6, y + 28, { base: 'middle', color: C.soft }); });
    // the section of two days: day 1 trimmed, day 2 laps over its edge
    const sy = 420, base = 560;
    A(seg(t, 36.8, 37.4), () => {
      font(700, 24); text('SECTION AT A SEAM', L, sy - 86, { base: 'middle', color: C.soft, spacing: '3px' });
      ctx.fillStyle = C.arriccio; ctx.fillRect(L, sy + 40, R - L, 60);
      ctx.fillStyle = C.brick; ctx.fillRect(L, sy + 100, R - L, base - sy - 100 + 40);
      // day 1: painted part, then its unpainted rim, cut away at a slant
      const cut = eio(seg(t, 37.6, 38.6)), mid = CX - 20;
      ctx.fillStyle = C.plaster; ctx.beginPath(); ctx.moveTo(L, sy); ctx.lineTo(mid, sy); ctx.lineTo(mid + 30, sy + 40); ctx.lineTo(L, sy + 40); ctx.fill();
      ctx.fillStyle = C.rose; ctx.fillRect(L, sy - 6, mid - L, 6);
      A(1 - cut, () => { ctx.fillStyle = C.wet; ctx.beginPath(); ctx.moveTo(mid, sy); ctx.lineTo(mid + 160, sy); ctx.lineTo(mid + 160, sy + 40); ctx.lineTo(mid + 30, sy + 40); ctx.fill(); });
      font(600, 22); text('day 1', L + 20, sy - 26, { base: 'middle', color: C.rose });
      A(seg(t, 37.4, 38.0) * (1 - cut), () => text('unpainted: cut away', mid + 80, sy - 26, { align: 'center', base: 'middle', color: C.soft }));
      // day 2 laps over the bevelled edge
      const lap = eio(seg(t, 39.0, 40.2));
      A(lap, () => {
        ctx.fillStyle = C.wet; ctx.beginPath(); ctx.moveTo(mid - 14, sy - 6); ctx.lineTo(R, sy - 6); ctx.lineTo(R, sy + 40); ctx.lineTo(mid + 30, sy + 40); ctx.lineTo(mid, sy); ctx.lineTo(mid - 14, sy - 3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = C.sky; ctx.fillRect(mid - 14, sy - 12, R - mid + 14, 6);
        font(600, 22); text('day 2 laps over', R - 10, sy - 30, { align: 'right', base: 'middle', color: C.sky });
      });
    });
  });
}

// ---------- E: 570 days on the ceiling ----------
function sceneCount(t) {
  const a = span(t, 41.2, 55.2, 0.5, 0.4);
  if (a <= 0) return;
  const fill = eio(seg(t, 42.0, 49.4));
  const showPlan = 1 - seg(t, 50.2, 50.8);
  plan(a * showPlan, { mosaic: 1, filled: fill, labels: 1 });
  A(a * showPlan, () => {
    const n = Math.round(fill * GIORNATE);
    font(800, 64, SERIF); text(String(n), 196, 360, { align: 'center', base: 'middle', color: C.gold });
    font(600, 22); text('giornate', 196, 404, { align: 'center', base: 'middle', color: C.soft });
    A(seg(t, 47.2, 48.0), () => {
      font(600, 22); text('a big wall', 668, 330, { align: 'center', base: 'middle', color: C.soft });
      text('fresco', 668, 358, { align: 'center', base: 'middle', color: C.soft });
      font(800, 48, SERIF); text('10–20', 668, 410, { align: 'center', base: 'middle', color: C.sky });
    });
    A(seg(t, 43.0, 43.8), () => { font(400, 24, SERIF); text('restorers, 1980–1994', 196, 450, { align: 'center', base: 'middle', color: C.soft }); });
  });
  // the order of the days, read from the overlaps
  A(a * seg(t, 50.6, 51.2), () => {
    const cells = [[220, 210, C.green, 1], [430, 210, C.rose, 2], [640, 210, C.sky, 3]];
    const ord = seg(t, 51.4, 54.0);
    cells.forEach(([x, y, col, d], i) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - 110 + (i ? 18 : 0), y - 90); ctx.lineTo(x + 110, y - 90); ctx.lineTo(x + 110, y + 90); ctx.lineTo(x - 110 + (i ? 18 : 0), y + 90); ctx.closePath(); ctx.fill();
      if (i) { // the lip: a newer patch laps over the older one's edge
        ctx.fillStyle = 'rgba(20,14,10,0.35)'; ctx.fillRect(x - 92, y - 90, 8, 180);
        ctx.fillStyle = 'rgba(255,250,240,0.55)'; ctx.fillRect(x - 100, y - 90, 6, 180);
      }
      A(seg(ord, i / 3, i / 3 + 0.3), () => { font(800, 54, SERIF); text(String(d), x + 8, y, { align: 'center', base: 'middle', color: C.bg }); });
    });
    A(seg(t, 52.4, 53.2), () => {
      font(600, 24); text('each newer patch overlaps the edge of an older one', CX, 360, { align: 'center', base: 'middle', color: C.soft });
      // a section of the three patches, stepped
      const y = 470;
      [[150, 330, C.green], [318, 500, C.rose], [488, 720, C.sky]].forEach(([x0, x1, col], i) => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0, y - i * 6); ctx.lineTo(x1, y - i * 6); ctx.lineTo(x1, y + 30); ctx.lineTo(x0 + 14, y + 30); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(20,14,10,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
        font(700, 26); text(String(i + 1), (x0 + x1) / 2 + 6, y - i * 6 - 26, { align: 'center', base: 'middle', color: col });
      });
      font(600, 22); text('older', 150, y + 84, { base: 'middle', color: C.soft }); text('newer', 720, y + 84, { align: 'right', base: 'middle', color: C.soft });
      ctx.fillStyle = C.arriccio; ctx.fillRect(140, y + 30, 590, 26);
    });
  });
}

// ---------- F: the palette, and the cleaning ----------
const SWATCHES = [['lime white', C.lime], ['yellow ochre', '#d9a441'], ['red ochre', '#a9472f'], ['burnt sienna', '#8c4a2b'], ['umber', C.umber], ['green earth', C.green], ['vine black', '#2b2622'], ['smalt', '#5d77b8']];
function scenePalette(t) {
  A(span(t, 55.0, 59.9, 0.4, 0.4), () => {
    font(700, 24); text('MICHELANGELO’S FRESCO COLOURS', CX, 110, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    SWATCHES.forEach(([name, col], i) => {
      const v = eout(seg(t, 55.4 + i * 0.18, 55.9 + i * 0.18));
      A(v, () => {
        const c = i % 4, r = Math.floor(i / 4), x = 112 + c * 170, y = 170 + r * 250;
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x + 70, y + 80, 64 * v, 56 * v, 0.3, 0, TAU); ctx.fill();
        font(600, 22); text(name, x + 70, y + 176, { align: 'center', base: 'middle', color: C.ink });
      });
    });
    A(seg(t, 57.4, 58.2), () => { font(400, 26, SERIF); text('mostly earths and oxides, which lime does not destroy', CX, 690, { align: 'center', base: 'middle', color: C.gold }); });
  });
  A(span(t, 59.8, 64.6, 0.4, 0.0), () => {
    const wipe = eio(seg(t, 60.6, 63.2));
    paintedPanel(BOX.x, BOX.y + 40, BOX.w, BOX.h, PATCHES.length - 1, 1);
    // the veil of soot and glue, wiped away from left to right
    ctx.save(); ctx.beginPath(); ctx.rect(BOX.x + BOX.w * wipe, BOX.y + 40, BOX.w * (1 - wipe) + 1, BOX.h); ctx.clip();
    ctx.fillStyle = C.soot; ctx.fillRect(BOX.x, BOX.y + 40, BOX.w, BOX.h);
    ctx.restore();
    if (wipe > 0 && wipe < 1) { ctx.fillStyle = 'rgba(255,248,235,0.6)'; ctx.fillRect(BOX.x + BOX.w * wipe - 3, BOX.y + 40, 6, BOX.h); }
    font(600, 22);
    A(1 - seg(t, 61.6, 62.2), () => text('before: soot and glue', BOX.x + BOX.w - 12, BOX.y + 40 + BOX.h + 28, { align: 'right', base: 'middle', color: C.soft }));
    A(seg(t, 61.0, 61.6), () => text('after the 1980–1994 cleaning', BOX.x + 12, BOX.y + 40 + BOX.h + 28, { base: 'middle', color: C.gold }));
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneCeiling(t);
    scenePanel(t);
    sceneLime(t);
    sceneClock(t);
    sceneCount(t);
    scenePalette(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 500, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.sky, '^': C.rose } });
  },
});
