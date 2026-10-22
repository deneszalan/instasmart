// Explainer for tech-huffman-coding-term-paper: building a Huffman code for ABRACADABRA.
// Look: paper index cards pinned to a cork board and tied together with red string, typed in
// Space Mono; captions in Bitter on a long paper strip pinned along the bottom.
//
// Scene plan (62 s). Captions centred at y = 836 on the strip; everything important above y = 930.
//  A  0.0– 9.0  Hook. "ABRACADABRA" typed on a strip. A fixed code gives each of the 5 letters 3 bits:
//               the 33-bit string appears under it.
//  B  9.0–16.6  Count. Five letter cards tally their counts (A 5, B 2, R 2, C 1, D 1) and line up.
//  C 16.6–29.4  Merge. The algorithm below runs: C+D → 2, B+R → 4, 2+4 → 6, A+6 → 11. Each merge
//               lifts the two rarest cards, pins a new card above them and ties them with string.
//  D 29.4–42.4  Codes. Left strings read 0, right ones 1; the codes are read off the tree
//               (A 0, C 100, D 101, B 110, R 111): common letters short, rare ones long.
//  E 42.4–51.4  Payoff. The word now takes 23 bits instead of 33; reading the bits back, each code
//               leads to exactly one letter (no code starts another).
//  F 51.4–62.0  History: David Huffman, Robert Fano's class at MIT, 1951, a term paper instead of the
//               final exam; the 1952 paper.
//
// The tree, codes and totals are all computed below (ties go to the card made first).
// Facts (Wikipedia, "Huffman coding"): in 1951 Huffman and his MIT information theory classmates were
// given the choice of a term paper or a final exam; Robert M. Fano assigned a term paper on finding
// the most efficient binary code; Huffman's 1952 paper "A Method for the Construction of
// Minimum-Redundancy Codes"; the algorithm repeatedly removes the two nodes of lowest probability and
// joins them under a new node whose weight is their sum; Huffman codes are prefix codes; a Huffman
// code need not be unique; it is optimal among methods encoding symbols separately.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  cork0: '#9A7148', cork1: '#7A5432', cork2: '#4A3019',
  card: '#F7F1DE', cardShade: '#E6DCC2', line: 'rgba(70,120,190,0.28)', redRule: 'rgba(205,60,60,0.55)',
  ink: '#22201C', inkSoft: 'rgba(34,32,28,0.62)', string: '#C3262B', stringDark: '#7E1418',
  gold: '#F2C04B', pin: '#D33A2F', strip: '#F3EBD3', blue: '#2C5D9A', redText: '#B3261E',
};
const MONO = 'SpaceMono', SERIF = 'Bitter';

let k, ctx;
const font = (weight, size, family = MONO) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- Huffman's algorithm, run on the phrase ----------
const PHRASE = 'ABRACADABRA';
const NODES = [];
{
  const counts = new Map();
  for (const ch of PHRASE) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  // leaves in order of first appearance; ties are broken by the order nodes were made
  for (const [ch, n] of counts) NODES.push({ id: NODES.length, ch, w: n });
  const queue = [...NODES];
  const byWeight = (a, b) => a.w - b.w || a.id - b.id;
  while (queue.length > 1) {
    queue.sort(byWeight);
    const left = queue.shift(), right = queue.shift();
    const node = { id: NODES.length, w: left.w + right.w, left, right };
    left.parent = right.parent = node; left.bit = '0'; right.bit = '1';
    NODES.push(node); queue.push(node);
  }
}
const LEAVES = NODES.filter((n) => n.ch);
const MERGES = NODES.filter((n) => !n.ch);
const ROOT = MERGES.at(-1);
for (const leaf of LEAVES) { let code = '', n = leaf; while (n.parent) { code = n.bit + code; n = n.parent; } leaf.code = code; }
const CODE = Object.fromEntries(LEAVES.map((l) => [l.ch, l.code]));
const HUFF_BITS = [...PHRASE].map((ch) => CODE[ch]);
const HUFF_TOTAL = HUFF_BITS.join('').length;
const FIXED_LEN = Math.ceil(Math.log2(LEAVES.length));
const FIXED = Object.fromEntries([...LEAVES].sort((a, b) => a.ch.localeCompare(b.ch)).map((l, i) => [l.ch, i.toString(2).padStart(FIXED_LEN, '0')]));
const FIXED_TOTAL = PHRASE.length * FIXED_LEN;

// ---------- layout: depth sets the height, an in-order walk sets the x of the leaves ----------
const DEPTH_Y = [292, 414, 536, 658];
{
  const order = [];
  const walk = (n, d) => { n.depth = d; if (n.ch) order.push(n); else { walk(n.left, d + 1); walk(n.right, d + 1); } };
  walk(ROOT, 0);
  // A sits alone on the left; the deeper leaves spread across the rest
  const deep = order.filter((n) => n.depth === 3);
  order.forEach((n) => { if (n.depth < 3) n.fx = 130; });
  deep.forEach((n, i) => { n.fx = 300 + i * 130; });
  const place = (n) => { if (!n.ch) { place(n.left); place(n.right); n.fx = (n.left.fx + n.right.fx) / 2; } n.fy = DEPTH_Y[n.depth]; };
  place(ROOT);
}
// the starting row, sorted by count (most common first)
const ROW_Y = 658;
const START = [...LEAVES].sort((a, b) => b.w - a.w || a.id - b.id);
START.forEach((n, i) => { n.sx = 130 + i * 145; });

// ---------- timeline ----------
const CUES = [
  [0.4, 4.4, `How few bits does it take to store *${PHRASE}*?`],
  [4.5, 9.0, `A fixed code spends *${FIXED_LEN} bits* per letter: ${FIXED_TOTAL} in all.`],
  [9.1, 12.6, 'Huffman’s idea: first, count each letter.'],
  [12.7, 16.6, 'Then tie the two ~rarest~ cards together with string.'],
  [16.7, 20.9, `The new card carries their total: *${MERGES[0].w}*.`],
  [21.0, 25.0, 'Again, tie the two rarest. Ties? Either pair works.'],
  [25.1, 29.4, `Then ${MERGES[2].w}, and finally all *${ROOT.w}* in one bundle.`],
  [29.6, 34.6, 'Strings to the left read *0*; strings to the right, ~1~.'],
  [34.7, 38.8, `Follow the strings to each letter: A is just *${CODE.A}*.`],
  [38.9, 42.4, 'Common letters get short codes, rare ones longer.'],
  [42.5, 46.2, `Now ${PHRASE} takes *${HUFF_TOTAL} bits* instead of ${FIXED_TOTAL}.`],
  [46.3, 51.4, 'No code is the start of another, so the bits decode without gaps.'],
  [51.5, 56.8, 'David Huffman found this in 1951, as a student in Robert Fano’s class.'],
  [56.9, 61.6, 'He wrote it up as a *term paper*, instead of the exam.'],
];
const DUR = 62.0;
const c = (i) => CUES[i][0];

// When each merge happens: [glow, move/appear, strings]
const MT = [
  { glow: c(3) + 0.3, move: [c(3) + 0.8, c(3) + 2.4], card: c(3) + 2.4, str: [c(3) + 2.8, c(3) + 3.6] },
  { glow: c(5) + 0.4, move: null, card: c(5) + 1.2, str: [c(5) + 1.6, c(5) + 2.4] },
  { glow: c(6) + 0.2, move: null, card: c(6) + 0.6, str: [c(6) + 1.0, c(6) + 1.8] },
  { glow: c(6) + 1.9, move: [c(6) + 1.9, c(6) + 2.9], card: c(6) + 2.8, str: [c(6) + 3.1, c(6) + 3.9] },
];
MERGES.forEach((m, i) => { m.t = MT[i]; });

/** Where a node's card is at time t. */
function pos(n, t) {
  if (!n.ch) return { x: n.fx, y: n.fy, lift: 0 };
  // leaves: start in the sorted row; move to their tree spot when a merge needs it
  let x = n.sx, y = ROW_Y, lift = 0;
  const m1 = MERGES[0].t.move;
  const p1 = eio(seg(t, m1[0], m1[1]));
  if (n.depth === 3) { x = lerp(n.sx, n.fx, p1); const rare = n.parent === MERGES[0]; lift = rare ? Math.sin(p1 * Math.PI) * 120 : 0; }
  if (n.depth < 3) {
    const mv = n.parent.t.move;
    const p = eio(seg(t, mv[0], mv[1]));
    y = lerp(ROW_Y, n.fy, p); x = lerp(n.sx, n.fx, p);
  }
  return { x, y: y - lift, lift };
}

// ---------- deterministic noise ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let q = Math.imul(a ^ (a >>> 15), 1 | a); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
}

// ---------- cork board and caption strip, painted once ----------
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 420, 80, W / 2, 480, 820);
  rad.addColorStop(0, C.cork0); rad.addColorStop(0.6, C.cork1); rad.addColorStop(1, C.cork2);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(9);
  for (let i = 0; i < 5200; i++) {
    const x = rnd() * W, y = rnd() * H, r = 0.8 + rnd() * 2.6, v = rnd();
    g.fillStyle = v < 0.45 ? 'rgba(50,28,10,0.22)' : v < 0.8 ? 'rgba(200,150,95,0.18)' : 'rgba(255,225,170,0.14)';
    g.beginPath(); g.ellipse(x, y, r * (1 + rnd()), r, rnd() * 3.14, 0, Math.PI * 2); g.fill();
  }
  // wooden frame
  const fw = 22;
  const fr = g.createLinearGradient(0, 0, 0, H);
  fr.addColorStop(0, '#5B3A1E'); fr.addColorStop(1, '#3A2412');
  g.fillStyle = fr;
  g.fillRect(0, 0, W, fw); g.fillRect(0, H - fw, W, fw); g.fillRect(0, 0, fw, H); g.fillRect(W - fw, 0, fw, H);
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 3; g.strokeRect(fw, fw, W - 2 * fw, H - 2 * fw);
  const vg = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.38)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // the caption strip, pinned along the bottom
  g.save(); g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 14; g.shadowOffsetY = 6;
  g.fillStyle = C.strip; g.fillRect(40, 768, W - 80, 138); g.restore();
  const sg = g.createLinearGradient(0, 768, 0, 906);
  sg.addColorStop(0, 'rgba(255,255,255,0.25)'); sg.addColorStop(1, 'rgba(150,120,70,0.12)');
  g.fillStyle = sg; g.fillRect(40, 768, W - 80, 138);
  for (const x of [62, W - 62]) pinAt(g, x, 786);
}
function pinAt(g, x, y) {
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.arc(x + 3, y + 4, 9, 0, 7); g.fill();
  const pg = g.createRadialGradient(x - 3, y - 3, 1, x, y, 9);
  pg.addColorStop(0, '#FF8A7A'); pg.addColorStop(1, C.pin);
  g.fillStyle = pg; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill();
}

// ---------- cards ----------
function indexCard(x, y, w, h, a, glow = 0, tilt = 0) {
  withAlpha(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
    ctx.fillStyle = C.card; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.shadowColor = 'transparent';
    const cg = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    cg.addColorStop(0, 'rgba(255,255,255,0.3)'); cg.addColorStop(1, 'rgba(160,130,80,0.12)');
    ctx.fillStyle = cg; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = C.redRule; ctx.fillRect(-w / 2, -h / 2 + 20, w, 2);
    ctx.fillStyle = C.line;
    for (let ly = -h / 2 + 38; ly < h / 2 - 4; ly += 16) ctx.fillRect(-w / 2, ly, w, 1.2);
    if (glow > 0) { ctx.strokeStyle = `rgba(242,192,75,${glow})`; ctx.lineWidth = 5; ctx.strokeRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8); }
    ctx.restore();
  });
}
const LEAF = { w: 108, h: 88 }, INNER = { w: 92, h: 70 };
function nodeCard(n, t, a, glowA = 0) {
  const p = pos(n, t);
  const sz = n.ch ? LEAF : INNER;
  const tilt = n.ch ? ((n.id % 3) - 1) * 0.03 : ((n.id % 2) ? 0.025 : -0.02);
  indexCard(p.x, p.y, sz.w, sz.h, a, glowA, tilt);
  withAlpha(a, () => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(tilt);
    if (n.ch) {
      font(700, 46); text(n.ch, -18, 10, { align: 'center', base: 'middle' });
      font(400, 25); text(`×${n.shownW ?? n.w}`, 26, 19, { color: C.redText, align: 'center', base: 'middle' });
    } else {
      font(700, 38); text(String(n.w), 0, 9, { align: 'center', base: 'middle' });
    }
    ctx.restore();
    pinAt(ctx, p.x, p.y - sz.h / 2 + 10);
  });
  return p;
}

/** Red string from a parent's pin down to a child's pin, drawn up to fraction f. */
function string(a, b, f, hi = 0) {
  if (f <= 0) return;
  const ax = a.x, ay = a.y + INNER.h / 2 - 4, bx = b.x, by = b.y - (b.h ?? LEAF.h) / 2 + 10;
  const mx = (ax + bx) / 2, my = (ay + by) / 2 + 10;
  ctx.lineCap = 'round';
  const path = () => {
    ctx.beginPath(); ctx.moveTo(ax, ay);
    const n = 30;
    for (let i = 1; i <= n * f; i++) { const u = i / n; ctx.lineTo((1 - u) ** 2 * ax + 2 * u * (1 - u) * mx + u * u * bx, (1 - u) ** 2 * ay + 2 * u * (1 - u) * my + u * u * by); }
  };
  if (hi > 0) { ctx.strokeStyle = `rgba(242,192,75,${0.9 * hi})`; ctx.lineWidth = 11; path(); ctx.stroke(); }
  ctx.strokeStyle = C.stringDark; ctx.lineWidth = 5; path(); ctx.stroke();
  ctx.strokeStyle = C.string; ctx.lineWidth = 3; path(); ctx.stroke();
  return { mx: (ax + 2 * mx + bx) / 4, my: (ay + 2 * my + by) / 4 };
}

// ---------- the phrase strip at the top ----------
function phraseStrip(t) {
  const a = eout(seg(t, 0.2, 1.0)) * (1 - seg(t, c(12) - 0.4, c(12)));
  if (a <= 0) return;
  withAlpha(a, () => {
    const x0 = 64, y0 = 126, w = W - 128, h = 112;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
    ctx.fillStyle = C.strip; ctx.fillRect(x0, y0, w, h); ctx.restore();
    pinAt(ctx, x0 + 18, y0 + 16); pinAt(ctx, x0 + w - 18, y0 + 16);
    // the phrase, typed one letter at a time; during decoding each letter lights as its code is read
    font(700, 50);
    const cw = ctx.measureText('A').width + 6, px = W / 2 - (PHRASE.length * cw) / 2 + cw / 2;
    const typed = Math.floor(seg(t, 0.5, 2.2) * PHRASE.length + 0.001);
    const dec = decodeIndex(t);
    for (let i = 0; i < Math.min(typed + 1, PHRASE.length); i++) {
      if (i >= typed && t < 2.2) continue;
      const on = dec >= 0 ? (i <= dec ? 1 : 0.28) : 1;
      withAlpha(on, () => text(PHRASE[i], px + i * cw, y0 + 42, { color: i === dec ? C.redText : C.ink, align: 'center', base: 'middle' }));
    }
    // the bits: fixed code first, then Huffman's
    const fixedA = span(t, c(1) + 0.6, c(10) + 0.4, 0.5, 0.4);
    const huffA = eout(seg(t, c(10) + 0.4, c(10) + 1.0));
    bitRow([...PHRASE].map((ch) => FIXED[ch]), y0 + 86, fixedA, `${FIXED_TOTAL} bits`, -1, t, c(1) + 0.6);
    bitRow(HUFF_BITS, y0 + 86, huffA, `${HUFF_TOTAL} bits`, dec, t, c(10) + 0.4);
  });
}
function bitRow(groups, y, a, label, hiIndex, t, t0) {
  if (a <= 0) return;
  withAlpha(a, () => {
    font(400, 24);
    const cw = ctx.measureText('0').width, gap = 7;
    const total = groups.reduce((s, g) => s + g.length * cw, 0) + gap * (groups.length - 1);
    font(700, 24); const lw = ctx.measureText(label).width + 22;
    let x = W / 2 - (total + lw) / 2;
    groups.forEach((g, i) => {
      const show = eout(seg(t, t0 + i * 0.12, t0 + i * 0.12 + 0.3));
      font(400, 24);
      withAlpha(show * (hiIndex >= 0 ? (i <= hiIndex ? 1 : 0.35) : 1), () => text(g, x, y, { color: i === hiIndex ? C.redText : i % 2 ? C.blue : C.ink, base: 'middle' }));
      x += g.length * cw + gap;
    });
    font(700, 24); text(label, x + 16, y, { color: C.redText, base: 'middle' });
  });
}
/** During the decoding sweep, which letter is being read (or -1). */
function decodeIndex(t) {
  const a = c(11) + 0.4, b = c(11) + 4.4;
  if (t < a || t > c(12) - 0.2) return -1;
  return Math.min(PHRASE.length - 1, Math.floor(((t - a) / (b - a)) * PHRASE.length));
}

// ---------- the fixed code, shown in the hook ----------
function fixedKey(t) {
  const a = span(t, c(1) + 0.3, c(2) + 0.5, 0.5, 0.5);
  if (a <= 0) return;
  const drop = (1 - eout(seg(t, c(1) + 0.3, c(1) + 0.9))) * 30;
  ctx.save(); ctx.translate(0, -drop);
  indexCard(W / 2, 470, 640, 220, a, 0, 0.012);
  withAlpha(a, () => {
    pinAt(ctx, W / 2, 370);
    ctx.save(); ctx.translate(W / 2, 470); ctx.rotate(0.012);
    font(700, 28); text(`FIXED CODE: ${FIXED_LEN} BITS EACH`, 0, -48, { color: C.redText, align: 'center', base: 'middle', spacing: '1px' });
    const keys = Object.keys(FIXED);
    keys.forEach((ch, i) => {
      const x = (i - (keys.length - 1) / 2) * 116;
      withAlpha(eout(seg(t, c(1) + 0.8 + i * 0.15, c(1) + 1.2 + i * 0.15)), () => {
        font(700, 44); text(ch, x, 12, { align: 'center', base: 'middle' });
        font(400, 28); text(FIXED[ch], x, 60, { color: C.blue, align: 'center', base: 'middle' });
      });
    });
    ctx.restore();
  });
  ctx.restore();
}

// ---------- the board ----------
function board(t) {
  const fade = 1 - 0.75 * eio(seg(t, c(12), c(12) + 0.8));
  withAlpha(fade, () => {
    // strings first, under the cards
    const dec = decodeIndex(t);
    const decLeaf = dec >= 0 ? LEAVES.find((l) => l.ch === PHRASE[dec]) : null;
    const onPath = (child) => { if (!decLeaf) return false; let n = decLeaf; while (n) { if (n === child) return true; n = n.parent; } return false; };
    const aPath = span(t, c(8) + 0.6, c(9), 0.4, 0.4);
    for (const m of MERGES) {
      const pp = pos(m, t);
      const f = eio(seg(t, m.t.str[0], m.t.str[1]));
      for (const ch of [m.left, m.right]) {
        const cp = pos(ch, t); cp.h = ch.ch ? LEAF.h : INNER.h;
        const hi = Math.max(onPath(ch) ? 1 : 0, ch === LEAVES[0] || ch === ROOT.left ? aPath : 0);
        const mid = string({ x: pp.x, y: pp.y }, cp, f, hi);
        // 0 / 1 tags on the strings
        const ta = eout(seg(t, c(7) + 0.4 + (ch.bit === '1' ? 0.5 : 0), c(7) + 0.9 + (ch.bit === '1' ? 0.5 : 0)));
        if (mid && ta > 0) withAlpha(ta, () => {
          ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(mid.mx, mid.my, 17, 0, 7); ctx.fill();
          ctx.strokeStyle = ch.bit === '0' ? C.ink : C.blue; ctx.lineWidth = 2.5; ctx.stroke();
          font(700, 24); text(ch.bit, mid.mx, mid.my + 1, { color: ch.bit === '0' ? C.ink : C.blue, align: 'center', base: 'middle' });
        });
      }
    }
    // leaf cards, with their counts tallying up as the letters are counted
    for (const n of LEAVES) {
      const a = eout(seg(t, c(2) + 0.1 + n.id * 0.12, c(2) + 0.6 + n.id * 0.12));
      if (a <= 0) continue;
      const tally = seg(t, c(2) + 0.6, c(2) + 2.8);
      n.shownW = Math.min(n.w, Math.floor(tally * 5 + 0.0001));
      const m = n.parent;
      const glow = span(t, m.t.glow, m.t.card + 0.6, 0.3, 0.4) + (n === decLeaf ? 1 : 0);
      nodeCard(n, t, a, Math.min(1, glow));
      // Huffman codes under the cards, once read
      const ca = eout(seg(t, c(8) + 0.6 + (n.code.length - 1) * 0.5 + LEAVES.indexOf(n) * 0.25, c(8) + 1.1 + (n.code.length - 1) * 0.5 + LEAVES.indexOf(n) * 0.25));
      if (ca > 0) withAlpha(ca, () => {
        const p = pos(n, t);
        const tw = 24 + n.code.length * 16;
        ctx.fillStyle = C.ink; rrect(p.x - tw / 2, p.y + 52, tw, 36, 6); ctx.fill();
        font(700, 26); text(n.code, p.x, p.y + 71, { color: C.gold, align: 'center', base: 'middle' });
      });
    }
    // merged cards
    for (const m of MERGES) {
      const a = eout(seg(t, m.t.card, m.t.card + 0.5));
      if (a <= 0) continue;
      const drop = (1 - back(seg(t, m.t.card, m.t.card + 0.55))) * 40;
      const next = MERGES.find((q) => q.left === m || q.right === m);
      const glow = next ? span(t, next.t.glow, next.t.card + 0.6, 0.3, 0.4) : span(t, c(6) + 3.9, c(7), 0.3, 0.4);
      ctx.save(); ctx.translate(0, -drop);
      nodeCard(m, t, a, glow + (m === MERGES[0] ? span(t, c(4) + 0.2, c(5), 0.3, 0.4) : 0));
      ctx.restore();
    }
  });
}

// ---------- history card ----------
function history(t) {
  const a = eout(seg(t, c(12) + 0.3, c(12) + 1.0));
  if (a <= 0) return;
  const lines = [
    { at: c(12) + 0.6, s: 'David A. Huffman', w: 700, size: 40 },
    { at: c(12) + 1.4, s: 'MIT, 1951 · Robert Fano’s class', w: 400, size: 28 },
    { at: c(13) + 0.6, s: 'Term paper, not the exam', w: 700, size: 32, color: C.redText },
    { at: c(13) + 1.8, s: '1952: “A Method for the Construction', w: 400, size: 24 },
    { at: c(13) + 1.8, s: 'of Minimum-Redundancy Codes”', w: 400, size: 24 },
  ];
  const drop = (1 - eout(seg(t, c(12) + 0.3, c(12) + 1.0))) * 30;
  ctx.save(); ctx.translate(0, -drop);
  indexCard(W / 2, 470, 640, 360, a, 0, -0.015);
  withAlpha(a, () => pinAt(ctx, W / 2, 302));
  ctx.save(); ctx.translate(W / 2, 470); ctx.rotate(-0.015);
  lines.forEach((ln, i) => {
    withAlpha(a * eout(seg(t, ln.at, ln.at + 0.5)), () => {
      font(ln.w, ln.size); text(ln.s, -280, -104 + [0, 52, 118, 166, 198][i], { color: ln.color ?? C.ink, base: 'middle' });
    });
  });
  ctx.restore(); ctx.restore();
}

// ---------- captions ----------
const CAP = { size: 42, lh: 54, weight: 700, maxW: 740 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size, SERIF);
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
    k.captions(t, [cue], { x: W / 2, y: 840, rise: 14, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SERIF, ink: C.ink, marks: { '*': C.redText, '~': C.blue } });
  }
}

Kit.scene({
  width: W, height: H, duration: DUR,
  fonts: [
    { family: MONO, file: 'SpaceMono-Regular.woff2', weight: '400' },
    { family: MONO, file: 'SpaceMono-Bold.woff2', weight: '700' },
    { family: SERIF, file: 'Bitter.woff2' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    font(700, 22); text('RECKON', 64, 84, { color: C.gold, spacing: '3px' });
    const rw = ctx.measureText('RECKON').width + 6 * 3;
    font(400, 22); text('TECH · COMPRESSION', 64 + rw + 20, 84, { color: 'rgba(247,241,222,0.8)', spacing: '3px' });
    phraseStrip(t);
    fixedKey(t);
    board(t);
    history(t);
    captions(t);
  },
});
