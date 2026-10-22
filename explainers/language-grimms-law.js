// Explainer for language-grimms-law: the Germanic stops shifted one step along a chain.
// Look: a 19th-century philologist's notebook. Cream ruled paper with a red margin, sepia ink for the
// old forms, blue-black ink for the Germanic ones, red for corrections and circles, coloured index tabs
// for the three phases. Gentium Book Plus (latin, latin-ext and Greek subsets, with Source Sans 3 latin-ext
// standing in for ʰ and ɸ, which these subsets lack) for all text; UnifrakturCook for Grimm's book title.
//
// Facts (Wikipedia, "Grimm's law"): PIE stops developed into Proto-Germanic "in the first millennium BCE";
// three phases "forming consecutive phases in the sense of a chain shift": voiceless stops became
// voiceless fricatives, voiced stops became voiceless stops, voiced aspirated stops became voiced stops or
// fricatives; "bʰ > b > p > ɸ; dʰ > d > t > θ; gʰ > g > k > x", "each sound moves one position to the
// right"; described as a pull chain, in which each change leaves a gap, though it "may have occurred as a
// push chain". Examples (table): *pṓds 'foot' (Latin pēs) > *fōts; *tréyes 'three' (Latin trēs) > *þrīz;
// *ḱwón- 'dog' (Latin canis) > *hundaz 'hound'; *déḱm̥t 'ten' (Latin decem) > *tehun; *gel- 'cold'
// (Latin gelū) > *kaldaz; *bʰréh₂tēr 'brother' (Sanskrit bhrātṛ) > *brōþēr. Rask extended the
// correspondences in 1818 and is credited with first discovering the law; Grimm put it forth in Deutsche
// Grammatik in 1822; its exceptions "defied linguists for several decades, until Danish linguist Karl
// Verner explained them with Verner's law" (*ph₂tḗr 'father' > *fadēr). Reconstructed forms carry an
// asterisk.
//
// Scene plan (59.2 s; captions at y = 836, key elements above y = 750):
//  A  0.0–9.6   Hook. Two columns, Latin and English: pēs/foot, trēs/three, canis/hound, decem/ten.
//  B  9.4–19.6  The ancestor: *pṓds, its asterisk circled; branches to Latin pēs and Germanic *fōts, foot.
//  C  19.4–44.2 The chain: a 3 × 4 grid (labial, dental, velar × aspirated, voiced, voiceless, fricative).
//               Phase I: p t k slide to f þ h; phase II: b d g to p t k; phase III: bʰ dʰ gʰ to b d g,
//               each with an example card. Then the links of the chain; pull or push chain.
//  D  44.0–49.2 Back to the columns: the consonant pairs marked.
//  E  49.0–59.2 Rask 1818, Grimm 1822 (Deutsche Grammatik); Verner: *brōþēr but *fadēr.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  paper: '#F3EBD7', paperEdge: '#DCCDAA', rule: 'rgba(80,110,150,0.20)', margin: 'rgba(170,60,40,0.55)',
  ink: '#3F2A18', inkSoft: 'rgba(63,42,24,0.66)', inkFaint: 'rgba(63,42,24,0.22)', red: '#A3361F', blue: '#2D3E5E',
  tab: ['#C9583C', '#D59A3A', '#5F8A6A', '#6A7FA8'],
};
const R = 'Gent, GentX, GentG, SSX', I = 'GentI, GentIX, GentG, SSX', B = 'GentB, GentBX, GentG, SSX', FRAK = 'Fraktur';

let k, ctx;
const font = (weight, size, family = R) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- reconstructed forms, drawn with subscript laryngeals and the ring below ----------
const SUB = { '₁': '1', '₂': '2', '₃': '3' };
function pieRuns(s) {
  const out = [];
  for (const ch of s) {
    if (SUB[ch]) out.push({ ch: SUB[ch], sub: true });
    else if (ch === '̥') { if (out.length) out.at(-1).ring = true; }
    else out.push({ ch });
  }
  return out;
}
/** Draws a form such as *bʰréh₂tēr; returns its width. align: left | center | right. */
function pie(s, x, y, size, { family = I, color = C.ink, align = 'left', weight = 400, measure = false } = {}) {
  const runs = pieRuns(s);
  const wOf = (r) => { font(weight, r.sub ? size * 0.6 : size, family); return ctx.measureText(r.ch).width; };
  const total = runs.reduce((a, r) => a + wOf(r), 0);
  if (measure) return total;
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (const r of runs) {
    const w = wOf(r);
    font(weight, r.sub ? size * 0.6 : size, family);
    ctx.fillText(r.ch, cx, y + (r.sub ? size * 0.18 : 0));
    if (r.ring) { ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.2, size * 0.05); ctx.beginPath(); ctx.arc(cx + w / 2, y + size * 0.2, size * 0.08, 0, TAU); ctx.stroke(); }
    cx += w;
  }
  return total;
}

// ---------- the chain ----------
const ROWS = ['labial', 'dental', 'velar'];
const COLS = [['voiced', 'aspirated'], ['voiced'], ['voiceless'], ['fricative']];
const OLD = [['bʰ', 'b', 'p'], ['dʰ', 'd', 't'], ['gʰ', 'g', 'k']];   // PIE, columns 0–2
const NEW = [['b', 'p', 'f'], ['d', 't', 'þ'], ['g', 'k', 'h']];      // Germanic, columns 1–3 (letters)
const IPA = ['ɸ', 'θ', 'x'];                                          // the chain's phonetic fricatives
const PHASE = [{ col: 2, t: 20.2 }, { col: 1, t: 25.4 }, { col: 0, t: 30.6 }];   // which column moves, when
const EXAMPLES = [
  { from: '*pṓds', to: '*fōts', gloss: 'foot', latin: 'Latin pēs' },
  { from: '*déḱm̥t', to: '*tehun', gloss: 'ten', latin: 'Latin decem' },
  { from: '*bʰréh₂tēr', to: '*brōþēr', gloss: 'brother', latin: 'Sanskrit bhrātṛ' },
];
const GX = [222, 380, 538, 696], GY = [318, 428, 538];

// ---------- timeline ----------
const T = { A: [0, 9.6], B: [9.4, 19.6], C: [19.4, 44.2], D: [44.0, 49.2], E: [49.0, 59.2] };
const CUES = [
  [0.4, 4.4, 'Latin _pēs_, English ~foot~. Latin _trēs_, English ~three~.'],
  [4.6, 9.4, 'Not a loan, not a fluke: both grew from one older word.'],
  [9.6, 14.6, 'The _asterisk_ marks a word rebuilt by linguists: nobody ever wrote it down.'],
  [14.8, 19.4, 'Proto-Indo-European _*pṓds_ became Proto-Germanic ~*fōts~, our foot.'],
  [19.6, 24.6, 'Grimm’s law: the old _*p_, _*t_, _*k_ became ~f~, ~þ~ (th) and ~h~.'],
  [24.8, 29.8, 'That left gaps, so _*b_, _*d_, _*g_ moved up to ~p~, ~t~, ~k~.'],
  [30.0, 34.4, 'Then the aspirated _*bʰ_, _*dʰ_, _*gʰ_ became ~b~, ~d~ and ~g~.'],
  [34.6, 39.2, 'Each sound moved one step along, like links in a chain.'],
  [39.4, 43.8, 'Scholars debate the order, but the pattern is strikingly regular.'],
  [44.0, 49.0, 'So Latin _decem_ matches ~ten~, _gelū_ matches ~cold~, _canis_ matches ~hound~.'],
  [49.2, 54.0, 'Rasmus Rask found it in 1818; Jacob Grimm set it out in 1822.'],
  [54.2, 59.0, 'Its exceptions puzzled linguists for decades, until Karl Verner explained them.'],
];

// ---------- the notebook page, painted once ----------
let bg = null;
function paintPage() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  g.fillStyle = '#2A1E14'; g.fillRect(0, 0, W, H);   // the desk, seen at the very edges
  const rad = g.createRadialGradient(W * 0.45, H * 0.4, 100, W / 2, H / 2, 820);
  rad.addColorStop(0, '#F8F1DF'); rad.addColorStop(0.7, C.paper); rad.addColorStop(1, C.paperEdge);
  g.fillStyle = rad; g.fillRect(14, 14, W - 58, H - 28);
  const rnd = mulberry32(1822);
  for (let i = 0; i < 30; i++) {
    const x = rnd() * W, y = rnd() * H, r = 10 + rnd() * 50;
    const fg = g.createRadialGradient(x, y, 0, x, y, r);
    fg.addColorStop(0, `rgba(150,105,50,${0.03 + rnd() * 0.05})`); fg.addColorStop(1, 'rgba(150,105,50,0)');
    g.fillStyle = fg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  // ruled lines and the red margin
  g.strokeStyle = C.rule; g.lineWidth = 1.3;
  for (let y = 152; y < H - 30; y += 44) { g.beginPath(); g.moveTo(14, y); g.lineTo(W - 44, y); g.stroke(); }
  g.strokeStyle = C.margin; g.lineWidth = 1.6;
  for (const x of [96, 101]) { g.beginPath(); g.moveTo(x, 14); g.lineTo(x, H - 14); g.stroke(); }
  // page edge shadow on the right, where the tabs stick out
  const sh = g.createLinearGradient(W - 70, 0, W - 44, 0);
  sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(60,40,20,0.18)');
  g.fillStyle = sh; g.fillRect(W - 70, 14, 26, H - 28);
  // a blot of ink
  g.fillStyle = 'rgba(63,42,24,0.5)'; g.beginPath(); g.arc(738, 700, 5, 0, TAU); g.fill();
  g.beginPath(); g.arc(748, 706, 2, 0, TAU); g.fill();
}
function header() {
  font(700, 22, B); text('RECKON', 120, 84, { color: C.red, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 3 * 6;
  font(400, 24, I); text('Language · sound laws', 120 + w + 16, 84, { color: C.inkSoft });
}
/** Index tabs on the page's right edge; active (0..3) sticks out. */
function tabs(t, active, lit = 1) {
  const labels = ['I', 'II', 'III', 'V'];
  for (let i = 0; i < 4; i++) {
    const on = i === active ? lit : 0;
    const x = W - 46 + 4 - on * 10, y = 168 + i * 96;
    ctx.fillStyle = C.tab[i]; ctx.beginPath(); ctx.roundRect(x, y, 40 + on * 10, 80, [0, 8, 8, 0]); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x, y, 4, 80);
    font(700, 22, B); text(labels[i], x + 22 + on * 5, y + 41, { color: '#FFF6E6', align: 'center', base: 'middle' });
  }
}
function inkUnderline(x0, x1, y, p, color = C.red, w = 3) {
  if (p <= 0) return;
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath();
  const n = 24;
  for (let i = 0; i <= n * p; i++) { const u = i / n; const x = lerp(x0, x1, u), yy = y + Math.sin(u * 9 + x0) * 1.6; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
  ctx.stroke();
}
function inkCircle(x, y, rx, ry, p, color = C.red) {
  if (p <= 0) return;
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 60 * p; i++) { const a = -2.2 + (i / 60) * (TAU + 0.5); const r = 1 + 0.06 * Math.sin(i * 0.4); const px = x + Math.cos(a) * rx * r, py = y + Math.sin(a) * ry * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke();
}
/** Text revealed left to right, as if being written. */
function written(p, x, y, w, h, fn) {
  if (p <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(x - 4, y - h, (w + 8) * p, h * 1.6); ctx.clip(); fn(); ctx.restore();
}

// ---------- A and D: the two columns ----------
const PAIRS = [['pēs', 'foot', 'p', 'f'], ['trēs', 'three', 't', 'th'], ['canis', 'hound', 'c', 'h'], ['decem', 'ten', 'd', 't'], ['gelū', 'cold', 'g', 'c']];
function columns(t, rows, { reveal = (i) => 1, marks = 0 } = {}) {
  const xl = 300, xr = 600, y0 = 246, dy = 88;
  font(400, 30, I); text('Latin', xl, 196, { color: C.inkSoft, align: 'center', base: 'middle' });
  text('English', xr, 196, { color: C.inkSoft, align: 'center', base: 'middle' });
  inkUnderline(xl - 80, xr + 80, 222, 1, C.inkFaint, 2);
  for (let i = 0; i < rows; i++) {
    const [la, en, a, b] = PAIRS[i];
    const y = y0 + 40 + i * dy, p = reveal(i);
    written(p, xl - 90, y, 180, 50, () => { font(400, 52, I); text(la, xl, y, { color: C.ink, align: 'center' }); });
    written(clamp(p * 1.4 - 0.4), xr - 90, y, 180, 50, () => { font(400, 52, I); text(en, xr, y, { color: C.blue, align: 'center' }); });
    if (marks > 0) {
      const m = clamp(marks * 1.4 - i * 0.12);
      font(400, 52, I);
      const wl = ctx.measureText(la).width, wr = ctx.measureText(en).width, wa = ctx.measureText(a).width, wb = ctx.measureText(b).width;
      inkCircle(xl - wl / 2 + wa / 2 + 5, y - 15, wa * 0.6 + 8, 27, m);
      inkCircle(xr - wr / 2 + wb / 2 + 5, y - 15, wb * 0.55 + 8, 27, m, C.blue);
      withAlpha(m, () => {
        ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2; ctx.setLineDash([5, 6]);
        ctx.beginPath(); ctx.moveTo(xl + wl / 2 + 16, y - 16); ctx.lineTo(xr - wr / 2 - 16, y - 16); ctx.stroke(); ctx.setLineDash([]);
        font(400, 26, I); text(`${a === 'c' ? 'k' : a} → ${b === 'c' ? 'k' : b}`, (xl + xr) / 2, y - 26, { color: C.red, align: 'center' });
      });
    }
  }
}
function sceneA(t) {
  columns(t, 4, { reveal: (i) => eio(seg(t, 0.5 + i * 0.5 + (i >= 2 ? 3.6 : 0), 1.2 + i * 0.5 + (i >= 2 ? 3.6 : 0))) });
  const q = eout(seg(t, 6.6, 7.2));
  withAlpha(q, () => { font(400, 96, I); text('?', W / 2, 690, { color: C.red, align: 'center', base: 'middle' }); });
}

// ---------- B: the ancestor ----------
function sceneB(t) {
  const p0 = eout(seg(t, 9.7, 10.5));
  withAlpha(p0, () => {
    font(400, 26, I); text('Proto-Indo-European', W / 2, 200, { color: C.inkSoft, align: 'center', base: 'middle' });
    pie('*pṓds', W / 2, 296, 88, { align: 'center', color: C.ink });
    font(400, 26, I); text('‘foot’', W / 2, 340, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
  // the asterisk, circled
  const wAll = pie('*pṓds', 0, 0, 88, { measure: true });
  inkCircle(W / 2 - wAll / 2 + 18, 262, 30, 30, eio(seg(t, 10.8, 11.8)));
  withAlpha(eout(seg(t, 11.6, 12.2)), () => {
    font(400, 26, I); text('reconstructed', W / 2 - wAll / 2 - 40, 214, { color: C.red, align: 'right', base: 'middle' });
    ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - wAll / 2 - 36, 224); ctx.quadraticCurveTo(W / 2 - wAll / 2 - 20, 250, W / 2 - wAll / 2 - 8, 252); ctx.stroke();
  });
  // two branches: Latin keeps p, Germanic shifts it to f
  const br = eio(seg(t, 15.0, 16.0));
  if (br > 0) {
    ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (const [x1, y1] of [[240, 470], [624, 470]]) { ctx.beginPath(); ctx.moveTo(W / 2, 366); ctx.lineTo(lerp(W / 2, x1, br), lerp(366, y1 - 50, br)); ctx.stroke(); }
  }
  withAlpha(eout(seg(t, 15.8, 16.4)), () => {
    font(400, 24, I); text('Latin', 240, 452, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(400, 64, I); text('pēs', 240, 528, { align: 'center' });
    font(400, 24, I); text('Proto-Germanic', 624, 452, { color: C.inkSoft, align: 'center', base: 'middle' });
    pie('*fōts', 624, 528, 64, { align: 'center', color: C.blue });
  });
  withAlpha(eout(seg(t, 16.8, 17.4)), () => {
    ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(624, 556); ctx.lineTo(624, 600); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(614, 590); ctx.lineTo(624, 602); ctx.lineTo(634, 590); ctx.stroke();
    font(400, 24, I); text('English', 624, 628, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(700, 60, B); text('foot', 624, 690, { color: C.blue, align: 'center' });
  });
  // underline the p and the f
  inkUnderline(208, 238, 540, eio(seg(t, 17.6, 18.2)));
  inkUnderline(590, 616, 540, eio(seg(t, 17.6, 18.2)), C.blue);
}

// ---------- C: the chain ----------
function cell(x, y, a, dashed = false) {
  withAlpha(a, () => {
    ctx.strokeStyle = dashed ? C.inkFaint : C.inkSoft; ctx.lineWidth = 2;
    if (dashed) ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(x, y, 44, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  });
}
function symbol(s, x, y, color, size = 50, family = I) { font(400, size, family); text(s, x, y + size * 0.32, { color, align: 'center' }); }
function sceneC(t) {
  // headers and row labels
  withAlpha(eout(seg(t, 19.5, 20.1)), () => {
    COLS.forEach((lines, c) => { lines.forEach((l, j) => { font(400, 24, I); text(l, GX[c], 222 + j * 28 - (lines.length - 1) * 14, { color: C.inkSoft, align: 'center', base: 'middle' }); }); });
    ROWS.forEach((r, i) => { font(400, 22, I); text(r, 150, GY[i], { color: C.inkSoft, align: 'center', base: 'middle' }); });
  });
  for (let i = 0; i < 3; i++) {
    for (let c = 0; c < 4; c++) cell(GX[c], GY[i], 1, c === 3);
    // each column's sound slides one step right when its phase comes, turning into the Germanic sound
    for (let c = 0; c < 3; c++) {
      const ph = PHASE.find((p) => p.col === c);
      const m = eio(seg(t, ph.t + i * 0.18, ph.t + 1.2 + i * 0.18));
      const x = lerp(GX[c], GX[c + 1], m), y = GY[i] - Math.sin(Math.PI * m) * 26;
      withAlpha(1 - m, () => symbol(OLD[i][c], x, y, C.ink));
      withAlpha(m, () => symbol(NEW[i][c], x, y, C.blue, 54, B));
      if (c === 2 && m > 0.6) withAlpha(seg(m, 0.6, 1), () => { font(400, 22, R); text(`[${IPA[i]}]`, GX[3] + 30, GY[i] + 40, { color: C.inkSoft, align: 'left', base: 'middle' }); });
      // the trail of the move
      if (m > 0 && m < 1) { ctx.strokeStyle = 'rgba(163,54,31,0.6)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(GX[c] + 44, GY[i]); ctx.lineTo(x - 30, y + 2); ctx.stroke(); }
    }
  }
  // the gaps left behind
  for (const p of PHASE) {
    const gapA = seg(t, p.t + 1.0, p.t + 1.6) * (1 - seg(t, p.t + 4.8, p.t + 5.4));
    if (p.col > 0 && gapA > 0) withAlpha(gapA, () => { font(400, 24, I); text('gap', GX[p.col], GY[2] + 72, { color: C.red, align: 'center', base: 'middle' }); });
  }
  // example cards, one per phase
  EXAMPLES.forEach((ex, j) => {
    const a = span(t, PHASE[j].t + 1.6, j < 2 ? PHASE[j + 1].t - 0.2 : 34.4, 0.4, 0.3);
    if (a <= 0) return;
    withAlpha(a, () => {
      const y = 676;
      const w1 = pie(ex.from, 0, 0, 44, { measure: true }), w2 = pie(ex.to, 0, 0, 44, { measure: true });
      font(400, 30, I); const wg = ctx.measureText(ex.gloss).width;
      const gap = 30, arrowW = 54, total = w1 + gap + arrowW + gap + w2 + gap + wg + 20;
      let x = W / 2 - total / 2;
      pie(ex.from, x, y, 44, { color: C.ink }); x += w1 + gap;
      ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + arrowW, y - 14); ctx.moveTo(x + arrowW - 12, y - 24); ctx.lineTo(x + arrowW, y - 14); ctx.lineTo(x + arrowW - 12, y - 4); ctx.stroke();
      x += arrowW + gap;
      pie(ex.to, x, y, 44, { color: C.blue }); x += w2 + gap;
      font(400, 30, I); text(`‘${ex.gloss}’`, x, y, { color: C.inkSoft });
      font(400, 22, I); text(ex.latin, W / 2, y + 40, { color: C.inkSoft, align: 'center', base: 'middle' });
    });
  });
  // the links of the chain
  const ch = seg(t, 34.8, 37.6);
  if (ch > 0) {
    for (let i = 0; i < 3; i++) for (let c = 0; c < 3; c++) {
      const p = eout(clamp(ch * 3 - (2 - c) * 0.5 - i * 0.15));
      withAlpha(p * (1 - seg(t, 43.4, 44.0)), () => {
        ctx.strokeStyle = C.red; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse((GX[c] + GX[c + 1]) / 2, GY[i], 52, 20, 0, 0, TAU); ctx.stroke();
      });
    }
  }
  // pull chain or push chain?
  withAlpha(span(t, 39.6, 44.2, 0.4, 0.3), () => {
    const y = 664;
    font(400, 26, I);
    text('pull chain: fricatives first', 150, y, { color: C.ink, base: 'middle' });
    text('push chain: aspirates first', 150, y + 46, { color: C.ink, base: 'middle' });
    ctx.strokeStyle = C.red; ctx.lineWidth = 3;
    for (const [yy, dir] of [[y, -1], [y + 46, 1]]) {
      const x0 = dir < 0 ? 720 : 470, x1 = dir < 0 ? 470 : 720;
      ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); ctx.moveTo(x1 - dir * 12, yy - 9); ctx.lineTo(x1, yy); ctx.lineTo(x1 - dir * 12, yy + 9); ctx.stroke();
    }
    font(700, 30, B); text('?', 748, y + 24, { color: C.red, align: 'left', base: 'middle' });
  });
}

// ---------- D: the correspondences ----------
function sceneD(t) {
  columns(t, 5, { marks: seg(t, 44.6, 46.6) });
}

// ---------- E: who found it, and Verner ----------
function sceneE(t) {
  // notebook entries
  const e1 = eio(seg(t, 49.4, 50.4)), e2 = eio(seg(t, 50.8, 51.8));
  written(e1, 150, 232, 560, 40, () => { font(700, 36, B); text('1818', 150, 232, { color: C.red }); font(400, 36, I); text('Rasmus Rask', 260, 232); });
  written(e2, 150, 300, 600, 40, () => { font(700, 36, B); text('1822', 150, 300, { color: C.red }); font(400, 36, I); text('Jacob Grimm,', 260, 300); });
  // Grimm's book, in Fraktur
  const bk = eout(seg(t, 51.6, 52.4));
  withAlpha(bk * (1 - seg(t, 54.0, 54.6)), () => {
    ctx.save(); ctx.translate(W / 2, 470); ctx.rotate(-0.03);
    ctx.fillStyle = '#5B3A22'; ctx.fillRect(-170, -110, 340, 220);
    ctx.strokeStyle = '#2E1C10'; ctx.lineWidth = 4; ctx.strokeRect(-170, -110, 340, 220);
    ctx.strokeStyle = '#C9A15A'; ctx.lineWidth = 2; ctx.strokeRect(-156, -96, 312, 192);
    font(700, 46, FRAK); text('Deutsche', 0, -18, { color: '#E8C77C', align: 'center', base: 'middle' });
    text('Grammatik', 0, 36, { color: '#E8C77C', align: 'center', base: 'middle' });
    ctx.restore();
  });
  // Verner: brother keeps þ, father gets d
  const v = eout(seg(t, 54.6, 55.4));
  withAlpha(v, () => {
    font(400, 26, I); text('Verner’s law', W / 2, 398, { color: C.inkSoft, align: 'center', base: 'middle' });
    const rows = [['*bʰréh₂tēr', '*brōþēr', '‘brother’', 'þ'], ['*ph₂tḗr', '*fadēr', '‘father’', 'd']];
    rows.forEach(([a, b, g, mark], i) => {
      const y = 476 + i * 96;
      const q = eout(seg(t, 55.0 + i * 0.7, 55.6 + i * 0.7));
      withAlpha(q, () => {
        pie(a, 330, y, 46, { align: 'right' });
        ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(352, y - 14); ctx.lineTo(408, y - 14); ctx.moveTo(396, y - 24); ctx.lineTo(408, y - 14); ctx.lineTo(396, y - 4); ctx.stroke();
        pie(b, 430, y, 46, { color: C.blue });
        font(400, 26, I); text(g, 640, y, { color: C.inkSoft });
      });
    });
    // circle the þ and the d
    const wb1 = pie('*brō', 0, 0, 46, { measure: true }), wthorn = pie('þ', 0, 0, 46, { measure: true });
    const wb2 = pie('*fa', 0, 0, 46, { measure: true }), wd = pie('d', 0, 0, 46, { measure: true });
    inkCircle(430 + wb1 + wthorn / 2, 462, 20, 26, eio(seg(t, 56.6, 57.2)));
    inkCircle(430 + wb2 + wd / 2, 558, 20, 26, eio(seg(t, 57.0, 57.6)));
    withAlpha(eout(seg(t, 57.4, 58.0)), () => { font(400, 24, I); text('an exception, explained', W / 2, 650, { color: C.red, align: 'center', base: 'middle' }); });
  });
}

// ---------- which index tab sticks out ----------
function activeTab(t) {
  if (t >= 54.2) return 3;
  if (t >= 19.6 && t < 34.8) return t < 25.2 ? 0 : t < 30.4 ? 1 : 2;
  return -1;
}
function tabLit(t) {
  if (t >= 54.2) return eout(seg(t, 54.2, 54.8));
  if (t >= 19.6 && t < 34.8) {
    const starts = [19.6, 25.2, 30.4], i = activeTab(t);
    return eout(seg(t, starts[i], starts[i] + 0.5)) * (1 - seg(t, 34.4, 34.8));
  }
  return 0;
}

// ---------- captions ----------
const CAP = { size: 42, lh: 54, weight: 700, maxW: 700 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size, B);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[_~]/g, '')).width);
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
    k.captions(t, [cue], { x: 440, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: B, ink: C.ink, marks: { _: C.red, '~': C.blue } });
  }
}

Kit.scene({
  width: W, height: H, duration: 59.2,
  fonts: [
    { family: 'Gent', file: 'GentiumBookPlus-Regular.woff2', weight: '400' },
    { family: 'GentX', file: 'GentiumBookPlus-Regular-LatinExt.woff2', weight: '400' },
    { family: 'GentG', file: 'GentiumBookPlus-Regular-Greek.woff2', weight: '400' },
    { family: 'GentI', file: 'GentiumBookPlus-Italic.woff2', weight: '400' },
    { family: 'GentIX', file: 'GentiumBookPlus-Italic-LatinExt.woff2', weight: '400' },
    { family: 'GentB', file: 'GentiumBookPlus-Bold.woff2', weight: '700' },
    { family: 'GentBX', file: 'GentiumBookPlus-Bold-LatinExt.woff2', weight: '700' },
    { family: 'SSX', file: 'SourceSans3-LatinExt.woff2', weight: '200 900' },
    { family: FRAK, file: 'UnifrakturCook-Bold.ttf', weight: '700' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintPage();
    ctx.drawImage(bg, 0, 0);
    header();
    tabs(t, activeTab(t), tabLit(t));
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
