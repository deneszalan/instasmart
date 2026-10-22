// Explainer for history-gutenberg-printing-press: punch, matrix, hand mould, ink and screw press.
// Look: a warm sepia woodcut. Rough laid paper, heavy ink outlines with parallel hatching, wood grain on
// the press and mould, copper and grey type metal, molten orange for the pour, one rubric red. Grenze
// Gotisch (a blackletter, after the Textura of the Bible) for display and letters, Alegreya for captions.
//
// Facts:
//  Wikipedia, "Johannes Gutenberg": in the standard process of making type "a hard metal punch (made by
//  punchcutting, with the letter carved back to front) is hammered into a softer copper bar, creating a
//  matrix", placed into "a hand-held mould"; a sort "is cast by filling the mould with molten type-metal;
//  this cools almost at once"; the matrix can be reused for hundreds or thousands of identical sorts, which
//  are set into pages, inked and printed. That method "has been widely attributed to Gutenberg", but
//  whether he used it or a more primitive version "has been the subject of considerable debate". His
//  type metal was lead, tin and antimony; he is credited with "the use of oil-based ink for printing
//  books" and "a wooden printing press similar to the agricultural screw presses of the period".
//  "Though movable type was already in use in East Asia, Gutenberg's invention of the printing press
//  enabled a much faster rate of printing."
//  Wikipedia, "Gutenberg Bible": printed in Mainz; the first copies were available "in 1454 or 1455";
//  1,288 pages; 290 master characters; most pages have 42 lines; scholars estimate "between 160 and 185
//  copies were printed, with about three-quarters on paper and the others on vellum".
// Computed below: the page counter, the 290-sort type case (29 × 10), the 42 printed lines, and the
// copies grid (160 solid + 25 possible, three-quarters paper).
//
// Scene plan (62.6 s; captions at y = 836, key elements above y = 750):
//  A  0.0–9.6   Hook. An open book fills with 42-line columns while a page counter runs to 1,288; then a
//               type case of 290 sorts.
//  B1 9.4–14.4  A punch, its face (seen through a loupe) carved with a back-to-front G.
//  B2 14.2–19.0 A hammer drives it into copper: the matrix holds a right-reading G.
//  B3 18.8–25.2 The matrix sits in a hand mould; a ladle pours molten type metal.
//  B4 25.0–30.4 The mould opens: a sort with a back-to-front G; copies follow.
//  C1 30.2–40.8 Sorts drop into a line (IN PRINCIPIO, back to front), then a forme of lines.
//  C2 40.6–45.6 Ink balls dab the forme black.
//  D  45.4–51.8 The screw press: bed in, bar pulled, platen down and up, the sheet lifts, right-reading.
//  E  51.6–62.6 185 little volumes: 160 solid, 25 possible, three-quarters paper; East Asia note.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  paper: '#EAD3A6', paperLight: '#F4E4C2', paperDark: '#C8A266', ink: '#1B120B', inkSoft: 'rgba(27,18,11,0.72)',
  inkFaint: 'rgba(27,18,11,0.25)', sepia: '#7A4A22', sepiaLight: '#A9773F', red: '#9C2A1C',
  copper: '#C0703C', copperDark: '#7E3F1E', metal: '#8F8D85', metalLight: '#CFCCC1', metalDark: '#55534D',
  molten: '#F0902F', hot: '#FFD780', wood: '#8B5A2B', woodDark: '#4F2E12', vellum: '#F6ECD6',
};
const GOTH = 'Grenze', TEXT = 'Alegreya';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the numbers ----------
const PAGES = 1288, SHEETS = PAGES / 4;          // 322 sheets of four pages
const MASTER = 290, CASE_COLS = 29, CASE_ROWS = MASTER / CASE_COLS;   // 29 × 10
const LINES = 42;
const COPIES_LO = 160, COPIES_HI = 185, PAPER_SHARE = 0.75;
const LINE_WORD = 'IN PRINCIPIO';                 // the opening words of Genesis in the Vulgate

// ---------- timeline ----------
const T = { A: [0, 9.6], B1: [9.4, 14.4], B2: [14.2, 19.0], B3: [18.8, 25.2], B4: [25.0, 30.4], C1: [30.2, 40.8], C2: [40.6, 45.6], D: [45.4, 51.8], E: [51.6, 62.6] };
const CUES = [
  [0.4, 4.6, `Around 1455, a workshop in Mainz finished a Bible of *${PAGES.toLocaleString('en-US')} pages*.`],
  [4.8, 9.4, `It was printed, not copied by hand, from just *${MASTER}* different characters.`],
  [9.6, 14.2, 'Each letter starts as a hard metal *punch*, carved back to front.'],
  [14.4, 18.6, 'Hammered into soft copper, it leaves a right-reading *matrix*.'],
  [19.0, 25.0, 'The matrix goes into a *hand mould*, and molten lead, tin and antimony is poured in.'],
  [25.2, 30.2, 'It cools almost at once: out comes a piece of type, a *sort*.'],
  [30.4, 35.6, 'That is the standard method; how closely Gutenberg followed it is still debated.'],
  [35.8, 40.6, 'Sorts are lined up, back to front, into words, lines and pages.'],
  [40.8, 45.4, 'The type is dabbed with *oil-based ink*, one of his innovations.'],
  [45.6, 51.4, 'A wooden *screw press*, like the farm presses of the day, squeezes paper onto it.'],
  [51.8, 56.6, `Scholars think *${COPIES_LO} to ${COPIES_HI}* copies were printed, most on paper.`],
  [56.8, 62.2, 'Movable type already existed in East Asia, but his press made printing much faster.'],
];

// ---------- paper, painted once ----------
let bg = null;
function paintPaper() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(W / 2, H * 0.4, 100, W / 2, H / 2, 800);
  rad.addColorStop(0, C.paperLight); rad.addColorStop(0.65, C.paper); rad.addColorStop(1, C.paperDark);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(1455);
  for (let i = 0; i < 3200; i++) {
    const x = rnd() * W, y = rnd() * H, l = 2 + rnd() * 7, a = rnd() * TAU;
    g.strokeStyle = `rgba(110,70,30,${0.04 + rnd() * 0.06})`; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  for (let i = 0; i < 16; i++) {
    const x = rnd() * W, y = rnd() * H, r = 20 + rnd() * 60;
    const fg = g.createRadialGradient(x, y, 0, x, y, r);
    fg.addColorStop(0, `rgba(140,90,40,${0.04 + rnd() * 0.05})`); fg.addColorStop(1, 'rgba(140,90,40,0)');
    g.fillStyle = fg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  // a woodcut border: heavy black rule, thin inner rule, notched corners
  g.fillStyle = C.ink;
  g.fillRect(24, 24, W - 48, 9); g.fillRect(24, H - 33, W - 48, 9); g.fillRect(24, 24, 9, H - 48); g.fillRect(W - 33, 24, 9, H - 48);
  g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(42, 42, W - 84, H - 84);
  for (const [x, y] of [[42, 42], [W - 42, 42], [42, H - 42], [W - 42, H - 42]]) { g.fillRect(x - 7, y - 7, 14, 14); g.fillStyle = C.paper; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = C.ink; }
  // caption rule
  g.fillRect(70, 744, W - 140, 3);
  g.fillRect(70, 750, W - 140, 1);
}

function header() {
  font(800, 22); text('RECKON', 70, 86, { color: C.red, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 3 * 6;
  font(500, 22); text('History · Printing', 70 + w + 16, 86, { color: C.inkSoft });
}

// ---------- woodcut helpers ----------
function hatch(path, x0, y0, x1, y1, gap = 7, ang = -0.8, color = C.ink, lw = 1.4) {
  ctx.save(); path(); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = lw;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  ctx.beginPath();
  for (let u = -r; u <= r; u += gap) { ctx.moveTo(cx + ca * -r - sa * u, cy + sa * -r + ca * u); ctx.lineTo(cx + ca * r - sa * u, cy + sa * r + ca * u); }
  ctx.stroke(); ctx.restore();
}
function box(x, y, w, h, fill, { lw = 4, shade = 0, gap = 7 } = {}) {
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
  if (shade) hatch(() => { ctx.beginPath(); ctx.rect(x + w * (1 - shade), y, w * shade, h); }, x, y, x + w, y + h, gap);
  ctx.strokeStyle = C.ink; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h);
}
function grain(x, y, w, h, seed = 1, vertical = true) {
  const rnd = mulberry32(seed);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = 'rgba(40,20,5,0.55)'; ctx.lineWidth = 1.3;
  const n = Math.floor((vertical ? w : h) / 6);
  for (let i = 0; i < n; i++) {
    const o = (i + 0.5) * 6 + (rnd() - 0.5) * 2, amp = 1 + rnd() * 2.5, f = 0.02 + rnd() * 0.03, ph = rnd() * 6;
    ctx.beginPath();
    for (let s = 0; s <= (vertical ? h : w); s += 8) {
      const d = Math.sin(s * f + ph) * amp;
      const px = vertical ? x + o + d : x + s, py = vertical ? y + s : y + o + d;
      s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}
function woodBox(x, y, w, h, seed, vertical = true) {
  ctx.fillStyle = C.wood; ctx.fillRect(x, y, w, h); grain(x, y, w, h, seed, vertical);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
}
function label(s, x, y, { color = C.ink, size = 26, weight = 700, align = 'center', italic = false } = {}) {
  font(weight, size); text(s, x, y, { color, align, base: 'middle' });
}
/** A letter in blackletter, optionally mirrored (back to front). */
function glyph(ch, x, y, size, { mirror = false, color = C.ink, stroke = null, lw = 2 } = {}) {
  ctx.save(); ctx.translate(x, y); if (mirror) ctx.scale(-1, 1);
  font(700, size, GOTH);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color; ctx.fillText(ch, 0, size * 0.04);
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeText(ch, 0, size * 0.04); }
  ctx.restore();
}

// ---------- A: the book, then the type case ----------
function columnLines(x, y, w, h, nLines, fill, seed, initial = true) {
  // the texture of a printed blackletter column: rows of short strokes and gaps
  const rnd = mulberry32(seed);
  const pitch = h / nLines;
  for (let i = 0; i < nLines; i++) {
    const p = clamp(fill * nLines - i);
    if (p <= 0) break;
    const ly = y + i * pitch;
    let lx = x + (initial && i < 4 ? w * 0.22 : 0);
    const end = x + w;
    ctx.fillStyle = C.ink;
    while (lx < end - 2) {
      const ww = Math.min(end - lx, 6 + rnd() * 26);
      if (lx + ww > x + (end - x) * p + (initial && i < 4 ? w * 0.22 * (1 - p) : 0)) break;
      ctx.fillRect(lx, ly + pitch * 0.18, ww, pitch * 0.56);
      lx += ww + 3 + rnd() * 2;
    }
  }
  if (initial && fill > 0.02) {
    ctx.fillStyle = C.red; ctx.fillRect(x, y + pitch * 0.1, w * 0.18, pitch * 3.8);
    glyph('I', x + w * 0.09, y + pitch * 2.0, pitch * 3.8, { color: C.paperLight });
  }
}
function bookPage(x, y, w, h, fill, seed) {
  ctx.fillStyle = C.paperLight; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  const m = w * 0.1, gut = w * 0.05, cw = (w - 2 * m - gut) / 2, top = y + h * 0.09, ch = h * 0.8;
  columnLines(x + m, top, cw, ch, LINES, clamp(fill * 2), seed, true);
  columnLines(x + m + cw + gut, top, cw, ch, LINES, clamp(fill * 2 - 1), seed + 7, false);
}
function sceneA(t) {
  const out = eio(seg(t, 4.7, 5.5));
  const fill = eio(seg(t, 0.6, 4.2));
  withAlpha(1 - out, () => {
    ctx.save(); ctx.translate(W / 2, 400); ctx.scale(1 - 0.15 * out, 1 - 0.15 * out); ctx.translate(-W / 2, -400);
    // page stack under the book, growing as the counter runs
    const thick = 4 + 14 * fill;
    ctx.fillStyle = C.paperDark; ctx.fillRect(132, 560, 600, thick); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(132, 560, 600, thick);
    bookPage(132, 190, 300, 372, fill, 11);
    bookPage(432, 190, 300, 372, fill, 29);
    ctx.fillStyle = C.ink; ctx.fillRect(429, 186, 6, 380);
    ctx.restore();
    const n = Math.round(lerp(1, PAGES, eio(seg(t, 0.6, 4.2))));
    font(800, 54); text(n.toLocaleString('en-US'), W / 2, 652, { align: 'center', base: 'middle' });
    font(500, 26); text('pages', W / 2, 696, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
  // the type case: 290 master characters
  const cp = seg(t, 5.2, 7.4);
  if (cp > 0) {
    const s = 22, gap = 2, x0 = W / 2 - (CASE_COLS * (s + gap) - gap) / 2, y0 = 300;
    withAlpha(eout(seg(t, 5.0, 5.6)), () => {
      ctx.fillStyle = C.wood; ctx.fillRect(x0 - 16, y0 - 16, CASE_COLS * (s + gap) + 30, CASE_ROWS * (s + gap) + 30);
      grain(x0 - 16, y0 - 16, CASE_COLS * (s + gap) + 30, CASE_ROWS * (s + gap) + 30, 5, false);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(x0 - 16, y0 - 16, CASE_COLS * (s + gap) + 30, CASE_ROWS * (s + gap) + 30);
    });
    const rnd = mulberry32(290);
    for (let i = 0; i < MASTER; i++) {
      const c = i % CASE_COLS, r = Math.floor(i / CASE_COLS);
      const p = eout(clamp((cp * 1.25 - (c + r) / (CASE_COLS + CASE_ROWS)) * 4));
      if (p <= 0) continue;
      const x = x0 + c * (s + gap), y = y0 + r * (s + gap);
      withAlpha(p, () => {
        ctx.fillStyle = C.metalLight; ctx.fillRect(x, y, s, s);
        ctx.fillStyle = C.metalDark; ctx.fillRect(x + 4 + rnd() * 3, y + 4, 3 + rnd() * 7, s - 8 - rnd() * 4);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(x, y, s, s);
      });
    }
    const shown = Math.round(MASTER * clamp(cp * 1.1));
    withAlpha(eout(seg(t, 5.6, 6.2)), () => {
      font(800, 54); text(String(shown), W / 2, 612, { color: C.red, align: 'center', base: 'middle' });
      font(500, 26); text('master characters: letters, capitals, marks, ligatures', W / 2, 656, { color: C.inkSoft, align: 'center', base: 'middle' });
    });
    withAlpha(eout(seg(t, 5.4, 6.0)), () => { label('THE TYPE CASE', W / 2, 250, { color: C.sepia, size: 24 }); });
  }
}

// ---------- B: punch, matrix, mould, sort ----------
const PUNCH = { x: 300, w: 76, top: 190, len: 300 };
function punch(x, yTip, { faceSide = false } = {}) {
  const w = PUNCH.w, top = yTip - PUNCH.len;
  // shank with a taper to the tip
  ctx.beginPath(); ctx.moveTo(x - w / 2, top); ctx.lineTo(x + w / 2, top); ctx.lineTo(x + w / 2, yTip - 60); ctx.lineTo(x + w * 0.3, yTip); ctx.lineTo(x - w * 0.3, yTip); ctx.lineTo(x - w / 2, yTip - 60); ctx.closePath();
  ctx.fillStyle = C.metalLight; ctx.fill();
  hatch(() => { ctx.beginPath(); ctx.moveTo(x + w * 0.12, top); ctx.lineTo(x + w / 2, top); ctx.lineTo(x + w / 2, yTip - 60); ctx.lineTo(x + w * 0.3, yTip); ctx.lineTo(x + w * 0.08, yTip); ctx.closePath(); }, x, top, x + w, yTip, 6, 1.2, C.ink, 1.3);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x - w / 2, top); ctx.lineTo(x + w / 2, top); ctx.lineTo(x + w / 2, yTip - 60); ctx.lineTo(x + w * 0.3, yTip); ctx.lineTo(x - w * 0.3, yTip); ctx.lineTo(x - w / 2, yTip - 60); ctx.closePath(); ctx.stroke();
  // the struck head
  ctx.fillStyle = C.metal; ctx.fillRect(x - w / 2 - 4, top - 10, w + 8, 12); ctx.strokeRect(x - w / 2 - 4, top - 10, w + 8, 12);
}
function loupe(cx, cy, r, inside, lbl) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = C.paperLight; ctx.fill();
  ctx.save(); ctx.clip(); inside(); ctx.restore();
  ctx.lineWidth = 7; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r + 9, 0, TAU); ctx.stroke();
  ctx.restore();
  if (lbl) label(lbl, cx, cy + r + 40, { size: 26 });
}
function sceneB1(t) {
  const enter = eout(seg(t, 9.5, 10.3));
  ctx.save(); ctx.translate(0, (1 - enter) * -40);
  punch(PUNCH.x, 560);
  ctx.restore();
  // what the loupe sees: the punch face, a back-to-front G being cut
  const lp = eout(seg(t, 10.2, 10.9));
  withAlpha(lp, () => {
    ctx.setLineDash([6, 8]); ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(PUNCH.x + 26, 560); ctx.lineTo(500, 470); ctx.stroke(); ctx.setLineDash([]);
    const carve = eio(seg(t, 10.8, 13.4));
    loupe(600, 400, 150, () => {
      ctx.fillStyle = C.metalLight; ctx.fillRect(450, 250, 300, 300);
      hatch(() => { ctx.beginPath(); ctx.rect(450, 250, 300, 300); }, 450, 250, 750, 550, 9, 1.2, 'rgba(27,18,11,0.25)', 1);
      ctx.save(); ctx.beginPath(); ctx.rect(450, 250, 300 * carve + 1, 300); ctx.clip();
      glyph('G', 600, 400, 230, { mirror: true, color: C.metal, stroke: C.ink, lw: 4 });
      ctx.restore();
      // the graver at the cutting edge
      if (carve > 0 && carve < 1) {
        const gx = 450 + 300 * carve, gy = 330 + Math.sin(t * 9) * 50;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + 60, gy - 70); ctx.stroke();
        ctx.fillStyle = C.wood; ctx.beginPath(); ctx.ellipse(gx + 74, gy - 86, 16, 26, -0.7, 0, TAU); ctx.fill(); ctx.stroke();
      }
    }, 'the punch face: back to front');
  });
}
/** A hammer held at (px, py); its head is 170 px to the left. ang 0: head level, striking downwards. */
function hammer(px, py, ang) {
  ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
  woodBox(-160, -8, 170, 16, 3, false);
  ctx.fillStyle = C.metalDark; ctx.fillRect(-196, -46, 52, 92); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(-196, -46, 52, 92);
  hatch(() => { ctx.beginPath(); ctx.rect(-196, -46, 52, 92); }, -196, -46, -144, 46, 6, 0.9, 'rgba(255,255,255,0.25)', 1.2);
  ctx.restore();
}
function copperBar(x, y, w, h) {
  ctx.fillStyle = C.copper; ctx.fillRect(x, y, w, h);
  hatch(() => { ctx.beginPath(); ctx.rect(x, y + h * 0.55, w, h * 0.45); }, x, y, x + w, y + h, 6, -0.6, C.copperDark, 1.4);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
}
function sceneB2(t) {
  // the punch is struck twice, sinking into the copper bar, then lifted away
  const strikes = [15.2, 16.0];
  let sink = 0;
  for (const s of strikes) sink += 7 * eout(seg(t, s, s + 0.12));
  const lift = eio(seg(t, 16.7, 17.4));
  const tipY = 560 + sink - lift * 70;
  copperBar(200, 560, 200, 58);
  if (lift > 0.3) withAlpha(seg(lift, 0.3, 0.8), () => { ctx.fillStyle = C.copperDark; ctx.fillRect(PUNCH.x - 22, 560, 44, 8); });
  withAlpha(1 - seg(t, 17.6, 18.2), () => punch(PUNCH.x, tipY));
  // hammer swing: raised, then down on the punch head at each strike
  let ang = 0.8;
  for (const s of strikes) ang += -0.8 * eio(seg(t, s - 0.25, s)) + 0.8 * eio(seg(t, s + 0.05, s + 0.5));
  withAlpha(seg(t, 14.4, 14.9) * (1 - seg(t, 16.6, 17.0)), () => hammer(PUNCH.x + 170, 560 + sink - PUNCH.len - 10 - 46, ang));
  // sparks at impact
  for (const s of strikes) {
    const p = seg(t, s, s + 0.35);
    if (p > 0 && p < 1) withAlpha(1 - p, () => {
      ctx.strokeStyle = C.molten; ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.35; ctx.beginPath(); ctx.moveTo(PUNCH.x + Math.cos(a) * 50, tipY - PUNCH.len - 10 + Math.sin(a) * 30); ctx.lineTo(PUNCH.x + Math.cos(a) * (50 + 50 * p), tipY - PUNCH.len - 10 + Math.sin(a) * (30 + 40 * p)); ctx.stroke(); }
    });
  }
  // the loupe now shows the matrix: a right-reading G sunk into the copper
  const lp = eout(seg(t, 17.0, 17.7));
  withAlpha(lp, () => {
    loupe(600, 400, 150, () => {
      ctx.fillStyle = C.copper; ctx.fillRect(450, 250, 300, 300);
      hatch(() => { ctx.beginPath(); ctx.rect(450, 250, 300, 300); }, 450, 250, 750, 550, 10, -0.6, 'rgba(126,63,30,0.5)', 1.2);
      glyph('G', 604, 404, 230, { color: 'rgba(60,25,8,0.55)' });
      glyph('G', 600, 400, 230, { color: C.copperDark, stroke: C.ink, lw: 3 });
    }, 'the matrix: right-reading');
  });
  withAlpha(1 - lp, () => withAlpha(seg(t, 14.3, 14.8), () => loupe(600, 400, 150, () => {
    ctx.fillStyle = C.metalLight; ctx.fillRect(450, 250, 300, 300);
    glyph('G', 600, 400, 230, { mirror: true, color: C.metal, stroke: C.ink, lw: 4 });
  }, 'the punch face: back to front')));
}
// the hand mould: two wooden halves around a channel, the matrix at the bottom
const MOULD = { cx: 330, top: 250, bot: 560, half: 92, ch: 40 };
function mould(open = 0, fillLevel = 0, glow = 0) {
  const { cx, top, bot, half, ch } = MOULD;
  const o = open * 120;
  // the cast metal in the channel
  if (fillLevel > 0) {
    const yTop = lerp(bot - 40, top + 20, fillLevel);
    const mg = ctx.createLinearGradient(0, yTop, 0, bot);
    mg.addColorStop(0, `rgba(255,215,128,${glow})`); mg.addColorStop(1, `rgba(240,144,47,${glow})`);
    ctx.fillStyle = C.metal; ctx.fillRect(cx - ch / 2, yTop, ch, bot - 40 - yTop);
    ctx.fillStyle = mg; ctx.fillRect(cx - ch / 2, yTop, ch, bot - 40 - yTop);
  }
  for (const side of [-1, 1]) {
    const x = side < 0 ? cx - ch / 2 - half - o : cx + ch / 2 + o;
    woodBox(x, top, half, bot - top - 40, 20 + side, true);
    ctx.fillStyle = C.metalDark; ctx.fillRect(side < 0 ? x + half - 14 : x, top, 14, bot - top - 40);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(side < 0 ? x + half - 14 : x, top, 14, bot - top - 40);
    // a funnel lip at the top
    ctx.fillStyle = C.metalDark; ctx.beginPath();
    if (side < 0) { ctx.moveTo(x + half - 14, top); ctx.lineTo(x + half, top); ctx.lineTo(x + half - 30, top - 26); ctx.lineTo(x + half - 44, top - 26); }
    else { ctx.moveTo(x, top); ctx.lineTo(x + 14, top); ctx.lineTo(x + 44, top - 26); ctx.lineTo(x + 30, top - 26); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // matrix below the channel
  copperBar(cx - 60 - o * 0, bot - 40, 120, 40);
}
function ladle(x, y, tilt) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(36, -6); ctx.lineTo(166, -16); ctx.stroke();
  ctx.lineWidth = 5; ctx.strokeStyle = C.woodDark; ctx.beginPath(); ctx.moveTo(124, -13); ctx.lineTo(172, -17); ctx.stroke();
  ctx.fillStyle = C.metalDark; ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = C.molten; ctx.beginPath(); ctx.ellipse(0, 0, 42, 7, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function sceneB3(t) {
  const enter = eout(seg(t, 18.9, 19.7));
  const fill = eio(seg(t, 20.6, 23.4));
  const cool = seg(t, 23.4, 24.8);
  withAlpha(enter, () => {
    mould(0, fill, 1 - cool);
    // the ladle tips over the funnel and pours
    const tilt = 0.1 - 0.55 * eio(seg(t, 19.8, 20.6)) + 0.55 * eio(seg(t, 23.3, 24.0));
    ladle(MOULD.cx + 70, MOULD.top - 70, tilt);
    const pour = seg(t, 20.4, 20.7) * (1 - seg(t, 23.2, 23.5));
    if (pour > 0) {
      const sx = MOULD.cx + 30, sy = MOULD.top - 56, ey = lerp(MOULD.bot - 40, MOULD.top + 20, fill);
      ctx.strokeStyle = C.molten; ctx.lineWidth = 10 * pour; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(MOULD.cx + 6, sy + 30, MOULD.cx, Math.max(sy + 40, ey)); ctx.stroke();
      ctx.strokeStyle = C.hot; ctx.lineWidth = 3 * pour; ctx.stroke();
    }
    // the alloy, named
    const lp = eout(seg(t, 21.0, 21.6));
    withAlpha(lp, () => {
      label('TYPE METAL', 640, 300, { color: C.sepia, size: 24 });
      ['lead', 'tin', 'antimony'].forEach((s, i) => {
        const y = 352 + i * 62, q = eout(seg(t, 21.2 + i * 0.3, 21.7 + i * 0.3));
        withAlpha(q, () => {
          ctx.fillStyle = C.metalLight; ctx.fillRect(540, y - 24, 200, 48); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(540, y - 24, 200, 48);
          label(s, 640, y + 1, { size: 30 });
        });
      });
      label('the hand mould', MOULD.cx, MOULD.bot + 40, { size: 26 });
    });
  });
}
function sort3d(x, y, s, letter, { mirror = true, inked = 0 } = {}) {
  // a sort seen from above and in front: the body, the top face and the raised letter
  const w = s, h = s * 2.1, d = s * 0.5;
  ctx.fillStyle = C.metal; ctx.fillRect(x - w / 2, y, w, h);
  hatch(() => { ctx.beginPath(); ctx.rect(x + w * 0.1, y, w * 0.4, h); }, x - w / 2, y, x + w / 2, y + h, 5, 1.3, 'rgba(27,18,11,0.45)', 1);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(x - w / 2, y, w, h);
  // nick (the groove on the body)
  ctx.beginPath(); ctx.moveTo(x - w / 2, y + h * 0.7); ctx.lineTo(x + w / 2, y + h * 0.7); ctx.stroke();
  // top face as a parallelogram
  ctx.fillStyle = C.metalLight; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2 + d, y - d); ctx.lineTo(x + w / 2 + d, y - d); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.translate(x + d / 2, y - d / 2); ctx.transform(1, 0, -1, 1, 0, 0); ctx.scale(1, 0.5);
  glyph(letter, 0, 0, s * 0.95, { mirror, color: inked > 0.5 ? C.ink : C.metalDark });
  ctx.restore();
}
function sceneB4(t) {
  const open = eio(seg(t, 25.4, 26.4));
  const lift = eio(seg(t, 26.4, 27.4));
  withAlpha(1 - seg(t, 26.4, 27.0), () => {
    // the mould halves part, leaving the cast type standing on the matrix
    mould(open, 1 - seg(t, 25.8, 26.4), 0);
  });
  // the new sort rises from the mould and turns to show its face
  const sx = lerp(MOULD.cx, 560, lift), sy = lerp(MOULD.top + 60, 250, lift);
  const sz = lerp(40, 120, lift);
  withAlpha(seg(t, 25.8, 26.4), () => sort3d(sx, sy, sz, 'G'));
  const lp = eout(seg(t, 27.2, 27.8));
  withAlpha(lp, () => label('a sort: the letter back to front', 590, 560, { size: 26 }));
  // a row of identical sorts from the same matrix
  for (let i = 0; i < 5; i++) {
    const p = eout(seg(t, 28.0 + i * 0.3, 28.6 + i * 0.3));
    if (p <= 0) continue;
    withAlpha(p, () => sort3d(200 + i * 70, 640 - (1 - p) * 30, 40, 'G'));
  }
}

// ---------- C: composing and inking ----------
/** A sort seen from above: its face, with the letter back to front. */
function sortFace(x, y, ch) {
  ctx.fillStyle = C.metalLight; ctx.fillRect(x - 24, y, 48, 92);
  hatch(() => { ctx.beginPath(); ctx.rect(x + 8, y, 16, 92); }, x - 24, y, x + 24, y + 92, 5, 1.2, 'rgba(27,18,11,0.35)', 1);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(x - 24, y, 48, 92);
  glyph(ch, x, y + 44, 56, { mirror: true, color: C.metalDark });
}
const STICK = { x0: 90, x1: 774, y: 420, s: 44 };
function sceneC1(t) {
  // sorts drop in one by one, right to left, so the line reads back to front
  const letters = LINE_WORD.split('');
  const n = letters.length;
  const slotW = 54, xr = W / 2 + (n * slotW) / 2 - slotW / 2;
  const toForme = eio(seg(t, 36.4, 37.8));
  const stickY = lerp(STICK.y, 236, toForme);
  // the composing stick (a tray)
  withAlpha(1 - toForme, () => {
    ctx.fillStyle = C.metalDark; ctx.fillRect(STICK.x0, STICK.y + 98, STICK.x1 - STICK.x0, 16);
    ctx.fillRect(STICK.x0, STICK.y - 10, 14, 124);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(STICK.x0, STICK.y + 98, STICK.x1 - STICK.x0, 16); ctx.strokeRect(STICK.x0, STICK.y - 10, 14, 124);
    label('setting a line', W / 2, STICK.y + 160, { size: 26 });
  });
  letters.forEach((ch, i) => {
    const p = eout(seg(t, 30.8 + i * 0.32, 31.3 + i * 0.32));
    if (p <= 0) return;
    const x = xr - i * slotW;
    const y = lerp(250, STICK.y + 2, p);
    if (ch === ' ') return;
    if (toForme < 1) withAlpha(Math.min(p * 2, 1 - toForme), () => sortFace(x, y, ch));
  });
  // the forme: the line joins a page of lines (42 of them)
  if (toForme > 0) {
    const fx = 214, fw = 436, fy = 236, fh = 420;
    withAlpha(toForme, () => {
      ctx.fillStyle = C.metalDark; ctx.fillRect(fx - 16, fy - 16, fw + 32, fh + 32); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(fx - 16, fy - 16, fw + 32, fh + 32);
      ctx.fillStyle = C.metalLight; ctx.fillRect(fx, fy, fw, fh);
    });
    // heading line, mirrored, as metal faces
    withAlpha(toForme, () => {
      ctx.save(); ctx.translate(W / 2, stickY + 22); ctx.scale(-1, 1);
      font(700, 34, GOTH); ctx.fillStyle = C.metalDark; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(LINE_WORD, 0, 0);
      ctx.restore();
    });
    const lines = Math.floor(seg(t, 37.6, 39.8) * (LINES - 4));
    const rnd = mulberry32(42);
    for (let i = 0; i < LINES - 4; i++) {
      const ly = fy + 56 + i * ((fh - 66) / (LINES - 4));
      let lx = fx + 14;
      const show = i < lines;
      while (lx < fx + fw - 14) {
        const ww = Math.min(fx + fw - 14 - lx, 6 + rnd() * 24);
        if (show) { ctx.fillStyle = C.metalDark; ctx.fillRect(fx + fw - (lx - fx) - ww, ly, ww, 5); }
        lx += ww + 4;
      }
    }
    withAlpha(seg(t, 38.0, 38.6), () => label(`a forme: ${LINES} lines of type, back to front`, W / 2, 700, { size: 26 }));
  }
  // the hedge, as a small printed note
  withAlpha(span(t, 30.6, 35.6, 0.4, 0.4), () => {
    ctx.fillStyle = C.paperLight; ctx.fillRect(170, 150, 524, 60); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(170, 150, 524, 60);
    label('how Gutenberg cast his type is debated', W / 2, 181, { size: 26, weight: 600, color: C.sepia });
  });
}
function inkBall(x, y, squash = 0) {
  ctx.save(); ctx.translate(x, y);
  woodBox(-9, -150, 18, 110, 9);
  ctx.fillStyle = '#3A2618'; ctx.beginPath(); ctx.ellipse(0, -16, 54, 34 - squash * 8, 0, 0, TAU); ctx.fill();
  hatch(() => { ctx.beginPath(); ctx.ellipse(0, -16, 54, 34 - squash * 8, 0, 0, TAU); }, -54, -50, 54, 18, 6, 0.6, 'rgba(255,230,190,0.22)', 1.2);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, -16, 54, 34 - squash * 8, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}
const DABS = [[41.4, 330, 330], [42.0, 530, 340], [42.6, 340, 520], [43.2, 540, 530], [43.8, 432, 430]];
function sceneC2(t) {
  const fx = 214, fw = 436, fy = 236, fh = 420;
  ctx.fillStyle = C.metalDark; ctx.fillRect(fx - 16, fy - 16, fw + 32, fh + 32); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(fx - 16, fy - 16, fw + 32, fh + 32);
  ctx.fillStyle = C.metalLight; ctx.fillRect(fx, fy, fw, fh);
  // the type faces, inked where a ball has dabbed
  const rnd = mulberry32(42);
  const inkAt = (x, y) => { let a = 0; for (const [tt, dx, dy] of DABS) { const p = seg(t, tt, tt + 0.25); if (p > 0) a = Math.max(a, p * clamp(1.6 - Math.hypot(x - dx, y - dy) / 150)); } return clamp(a); };
  ctx.save(); ctx.translate(W / 2, fy + 22); ctx.scale(-1, 1);
  font(700, 34, GOTH); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = C.metalDark; ctx.fillText(LINE_WORD, 0, 0);
  withAlpha(inkAt(W / 2, fy + 22), () => { ctx.fillStyle = C.ink; ctx.fillText(LINE_WORD, 0, 0); });
  ctx.restore();
  for (let i = 0; i < LINES - 4; i++) {
    const ly = fy + 56 + i * ((fh - 66) / (LINES - 4));
    let lx = fx + 14;
    while (lx < fx + fw - 14) {
      const ww = Math.min(fx + fw - 14 - lx, 6 + rnd() * 24);
      const x = fx + fw - (lx - fx) - ww;
      ctx.fillStyle = C.metalDark; ctx.fillRect(x, ly, ww, 5);
      const a = inkAt(x, ly);
      if (a > 0) { ctx.fillStyle = `rgba(27,18,11,${a})`; ctx.fillRect(x, ly, ww, 5); }
      lx += ww + 4;
    }
  }
  // two ink balls dab across the forme
  let bx = 700, by = 260, sq = 0;
  for (let i = 0; i < DABS.length; i++) {
    const [tt, dx, dy] = DABS[i];
    const prev = i ? DABS[i - 1] : [40.9, 700, 200];
    const m = eio(seg(t, prev[0] + 0.25, tt));
    if (t >= prev[0] + 0.25) { bx = lerp(prev[1], dx, m); by = lerp(prev[2], dy, m) - Math.sin(Math.PI * m) * 60; }
    const hit = seg(t, tt - 0.05, tt + 0.1) * (1 - seg(t, tt + 0.1, tt + 0.3));
    sq = Math.max(sq, hit);
  }
  const leave = eio(seg(t, 44.2, 44.9));
  inkBall(bx + leave * 260, by - leave * 120, sq);
  inkBall(bx - 120 + leave * -200, by + 10 - leave * 100, sq);
  withAlpha(eout(seg(t, 41.0, 41.6)), () => label('oil-based ink', W / 2, 712, { size: 28, color: C.sepia }));
}

// ---------- D: the screw press ----------
function press(t) {
  const fx = 240, fw = 384;          // frame
  const bedIn = eio(seg(t, 45.8, 46.8)), pull = eio(seg(t, 47.0, 47.8)) * (1 - eio(seg(t, 48.5, 49.1)));
  // uprights and beams
  woodBox(fx, 150, 44, 560, 31); woodBox(fx + fw - 44, 150, 44, 560, 32);
  woodBox(fx - 20, 140, fw + 40, 46, 33, false);
  woodBox(fx + 44, 300, fw - 88, 40, 34, false);   // the head the screw turns in
  // the screw, its threads shifting as it turns
  const sx = W / 2, sTop = 186, sBot = 380 + pull * 34;
  ctx.fillStyle = C.wood; ctx.fillRect(sx - 22, sTop, 44, sBot - sTop);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  ctx.save(); ctx.beginPath(); ctx.rect(sx - 22, sTop, 44, sBot - sTop); ctx.clip();
  for (let y = sTop - 20 + ((pull * 60) % 20); y < sBot + 20; y += 20) { ctx.beginPath(); ctx.moveTo(sx - 22, y); ctx.lineTo(sx + 22, y + 12); ctx.stroke(); }
  ctx.restore();
  ctx.strokeRect(sx - 22, sTop, 44, sBot - sTop);
  // the bar, swinging round with the screw (foreshortened)
  const ang = pull * 1.3;
  const bl = 170 * Math.cos(ang) + 30;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(sx, 360 + pull * 34); ctx.lineTo(sx + bl, 360 + pull * 34 + 26 * Math.sin(ang)); ctx.stroke();
  ctx.strokeStyle = C.wood; ctx.lineWidth = 6; ctx.stroke();
  // platen
  const py = 384 + pull * 34;
  box(sx - 120, py, 240, 30, C.metal, { shade: 0.3 });
  // the bed with the forme and the sheet rolls in under the platen
  const bx = lerp(-260, 0, bedIn);
  const bedY = 448;
  ctx.save(); ctx.translate(bx, 0);
  woodBox(sx - 170, bedY + 18, 340, 22, 35, false);
  ctx.fillStyle = C.metalDark; ctx.fillRect(sx - 130, bedY, 260, 18); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(sx - 130, bedY, 260, 18);
  ctx.fillStyle = C.paperLight; ctx.fillRect(sx - 124, bedY - 4, 248, 6); ctx.strokeRect(sx - 124, bedY - 4, 248, 6);
  ctx.restore();
  // stone base and floor line
  woodBox(fx - 40, 690, fw + 80, 30, 36, false);
}
function printedSheet(x, y, w, h, a) {
  withAlpha(a, () => {
    ctx.fillStyle = C.paperLight; ctx.fillRect(x, y, w, h); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
    font(700, Math.round(w * 0.085), GOTH); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(LINE_WORD, x + w / 2, y + h * 0.08);
    const rnd = mulberry32(42);
    for (let i = 0; i < LINES - 4; i++) {
      const ly = y + h * 0.15 + i * (h * 0.8 / (LINES - 4));
      let lx = x + w * 0.06;
      while (lx < x + w * 0.94) { const ww = Math.min(x + w * 0.94 - lx, (6 + rnd() * 24) * (w / 436)); ctx.fillStyle = C.ink; ctx.fillRect(lx, ly, ww, Math.max(2, 5 * h / 420)); lx += ww + 4 * (w / 436); }
    }
  });
}
function sceneD(t) {
  const away = eio(seg(t, 50.0, 50.8));
  withAlpha(1 - away * 0.85, () => press(t));
  withAlpha(eout(seg(t, 45.8, 46.4)) * (1 - away), () => label('wooden screw press', W / 2, 600, { size: 26, color: C.ink }));
  // the printed sheet lifts off the bed and turns to us, right-reading
  const s = eout(seg(t, 50.2, 51.2));
  if (s > 0) {
    const w = lerp(240, 330, s), h = w * 420 / 436;
    printedSheet(W / 2 - w / 2, lerp(460, 330, s) - h / 2 + (1 - s) * 60, w, h * Math.max(0.05, s), s);
  }
}

// ---------- E: the copies ----------
function sceneE(t) {
  const cols = 37, rows = COPIES_HI / cols;       // 37 × 5 = 185
  const w = 16, gap = 2, hgt = 46, rg = 10;
  const x0 = W / 2 - (cols * (w + gap) - gap) / 2, y0 = 236;
  const nVellum = Math.round(COPIES_HI * (1 - PAPER_SHARE));
  const grow = seg(t, 52.0, 54.4);
  for (let i = 0; i < COPIES_HI; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const p = eout(clamp(grow * COPIES_HI * 1.1 - i) );
    if (p <= 0) continue;
    const x = x0 + c * (w + gap), y = y0 + r * (hgt + rg) + (1 - p) * 10;
    const maybe = i >= COPIES_LO;
    const vellum = i % 4 === 3;                 // every fourth: a quarter on vellum
    withAlpha(p, () => {
      if (maybe) {
        ctx.setLineDash([4, 4]); ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, hgt - 2); ctx.setLineDash([]);
      } else {
        ctx.fillStyle = vellum ? C.vellum : C.sepiaLight; ctx.fillRect(x, y, w, hgt);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, hgt);
        ctx.fillStyle = vellum ? C.red : C.ink; ctx.fillRect(x + 3, y + 10, w - 6, 3); ctx.fillRect(x + 3, y + hgt - 13, w - 6, 3);
      }
    });
  }
  void nVellum;
  const lp = eout(seg(t, 54.2, 54.8));
  withAlpha(lp, () => {
    const yl = y0 + rows * (hgt + rg) + 28;
    font(800, 54); text(`${COPIES_LO}–${COPIES_HI}`, W / 2, yl + 30, { color: C.red, align: 'center', base: 'middle' });
    font(500, 26); text('copies, as scholars estimate', W / 2, yl + 74, { color: C.inkSoft, align: 'center', base: 'middle' });
    // key
    const ky = 190;
    ctx.fillStyle = C.sepiaLight; ctx.fillRect(150, ky - 14, 16, 28); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(150, ky - 14, 16, 28);
    label('paper, about ¾', 178, ky + 1, { size: 24, align: 'left', weight: 600 });
    ctx.fillStyle = C.vellum; ctx.fillRect(380, ky - 14, 16, 28); ctx.strokeRect(380, ky - 14, 16, 28);
    label('vellum', 408, ky + 1, { size: 24, align: 'left', weight: 600 });
    ctx.setLineDash([4, 4]); ctx.strokeRect(528, ky - 14, 16, 28); ctx.setLineDash([]);
    label('possible', 556, ky + 1, { size: 24, align: 'left', weight: 600 });
  });
  // East Asia: a small seal-like note
  withAlpha(eout(seg(t, 57.2, 57.8)), () => {
    ctx.fillStyle = C.paperLight; ctx.fillRect(170, 650, 524, 70); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.strokeRect(170, 650, 524, 70);
    label('movable type: China c. 1040 · Korea’s Jikji, 1377', W / 2, 686, { size: 24, color: C.red, weight: 700 });
  });
}

// ---------- captions ----------
const CAP = { size: 42, lh: 54, weight: 700, maxW: 740 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 838, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.red } });
  }
}

Kit.scene({
  width: W, height: H, duration: 62.6,
  fonts: [
    { family: GOTH, file: 'GrenzeGotisch.woff2', weight: '100 900' },
    { family: TEXT, file: 'Alegreya.woff2', weight: '400 900' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintPaper();
    ctx.drawImage(bg, 0, 0);
    header();
    const scenes = [[sceneA, T.A, 0], [sceneB1, T.B1], [sceneB2, T.B2], [sceneB3, T.B3], [sceneB4, T.B4], [sceneC1, T.C1], [sceneC2, T.C2], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
