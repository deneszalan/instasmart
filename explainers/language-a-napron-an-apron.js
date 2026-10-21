// Explainer for language-a-napron-an-apron: English words that lost or gained an n at the word boundary.
// Look: letterpress. Cream paper with fibres and mottling, black and vermilion ink, steel type sorts
// with soft shadows, a printed proof that fills up line by line. One family: Libre Caslon Text
// (roman, bold and italic).
//
// Each phrase is set as type: one sort per letter and a blank, darker "quad" for the word space.
// Rebracketing is drawn literally: the n sort hops over the quad into the other word (for the first
// example the space closes up, then reopens on the other side of the n).
//
// Scene plan (49 s). Everything important sits above y = 930; captions are centred at y = 836.
//  A  0.0– 8.3  "a napron" is set in type; the word space closes up.  "In Middle English, this was a napron." /
//                                                                     "Spoken aloud, the gap between the words is easy to miss."
//  B  8.3–16.6  The space reopens after the n: "an apron";            "Listeners split it in a new place: the n changed words." /
//               the proof prints line 1                               "By the 15th century, it was an apron."
//  C 16.4–24.9  "a nadder" -> "an adder"; "a noumpere" -> "an oumpere" "In the 14th century, a nadder became an adder." /
//                                                                     "…and a noumpere became an oumpere: our umpire."
//  D 24.7–36.1  The other way: "an ekename" -> "a nekename",          "The n could jump the other way, too." /
//               "an ewt" -> "a newt"                                  "An ekename became a nekename: a nickname." / "And an ewt became a newt."
//  E 35.9–40.2  The article: an "a" sort whose n lifts on and off     "The culprit: an, an article whose n comes and goes."
//  F 40.1–44.1  Brackets: [a] [napron] -> [an] [apron]                 "Linguists call it rebracketing: a word boundary, redrawn."
//  G 44.0–49.0  The finished proof, with its sources                  "So every apron you tie hides a lost n."
//
// Facts. Wikipedia "Rebracketing" (juncture loss redirects there): Middle English "a napron" taken
// for "an apron", "a naddre" for "an addre", "a noumpere" for "an oumpere", "an eke name" for "a neke
// name", "an eute" for "a neute" (its example sentence spells it "ewt"); the "movable-n" of the
// indefinite article a(n). Centuries, when the new form is first recorded: apron 15th (Merriam-Webster),
// adder 14th (Wikipedia "Adder": "In the 14th century, 'a nadder' ... was rebracketed to 'an adder'";
// Merriam-Webster), umpire 15th (Wikipedia "Umpire": owmpere ca. 1440; Merriam-Webster), nickname 15th
// (Wikipedia "Nickname": "By the 15th century"; Merriam-Webster), newt 15th (Wikipedia "Newt": "by the
// early 15th century"; Merriam-Webster).
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#F2E7D1', ink: '#1C1915', inkSoft: 'rgba(28,25,21,0.66)', inkFaint: 'rgba(28,25,21,0.32)',
  red: '#C8331B', redRGB: '200,51,27',
};
const SERIF = 'Caslon', ITALIC = 'CaslonItalic';

let k, ctx;
const font = (weight, size, family = SERIF) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- timeline ----------
const CUES = [
  [0.4, 3.8, 'In Middle English, this was a *n*apron.'],
  [3.9, 8.3, 'Spoken aloud, the gap between the words is easy to miss.'],
  [8.4, 12.8, 'Listeners split it in a new place: the *n* changed words.'],
  [12.9, 16.6, 'By the 15th century, it was *an* apron.'],
  [16.7, 20.6, 'In the 14th century, a *n*adder became *an* adder.'],
  [20.7, 24.6, '…and a *n*oumpere became *an* oumpere: our umpire.'],
  [24.7, 28.3, 'The *n* could jump the other way, too.'],
  [28.4, 32.4, '*An* ekename became a *n*ekename: a nickname.'],
  [32.5, 35.8, 'And *an* ewt became a *n*ewt.'],
  [35.9, 40.1, 'The culprit: *an*, an article whose *n* comes and goes.'],
  [40.2, 44.0, 'Linguists call it *rebracketing*: a word boundary, redrawn.'],
  [44.1, 48.6, 'So every apron you tie hides a lost *n*.'],
];

// Each phrase: the old setting, which n moves, and when. hop: [start, end] of the n's jump.
const PHRASES = [
  { s: 'a napron', drop: 0.3, lift: 15.8, special: true },
  { s: 'a nadder', drop: 16.5, hop: [18.0, 18.9], lift: 20.25 },
  { s: 'a noumpere', drop: 20.8, hop: [22.2, 23.1], lift: 24.4 },
  { s: 'an ekename', drop: 25.0, hop: [28.6, 29.5], lift: 31.9, wiggle: [26.9, 27.9] },
  { s: 'an ewt', drop: 32.5, hop: [33.5, 34.4], lift: 35.5 },
];
// The proof: old form, today's form, and the century the new form is first recorded.
const PROOF = [
  { old: 'a napron', now: 'an apron', when: '15th century', at: 12.7 },
  { old: 'a nadder', now: 'an adder', when: '14th century', at: 19.2 },
  { old: 'a noumpere', now: 'an umpire', when: '15th century', at: 23.4 },
  { old: 'an ekename', now: 'a nickname', when: '15th century', at: 29.9 },
  { old: 'an ewt', now: 'a newt', when: '15th century', at: 34.7 },
];

// ---------- seeded randomness ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- the paper, made once ----------
function makePaper() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  const rnd = rng(19);
  // mottling: large soft blotches, warm and cool
  for (let i = 0; i < 70; i++) {
    const x = rnd() * W, y = rnd() * H, r = 80 + rnd() * 220;
    const warm = rnd() < 0.6;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, warm ? `rgba(196,160,110,${0.05 + rnd() * 0.05})` : `rgba(255,252,240,${0.10 + rnd() * 0.10})`);
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  // fibres
  g.lineCap = 'round';
  for (let i = 0; i < 1600; i++) {
    const x = rnd() * W, y = rnd() * H, a = rnd() * TAU, l = 4 + rnd() * 16;
    g.strokeStyle = rnd() < 0.7 ? `rgba(120,92,58,${0.05 + rnd() * 0.07})` : `rgba(255,255,248,${0.25 + rnd() * 0.25})`;
    g.lineWidth = 0.6 + rnd() * 0.7;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // specks
  for (let i = 0; i < 500; i++) {
    g.fillStyle = `rgba(70,50,30,${0.06 + rnd() * 0.14})`;
    g.beginPath(); g.arc(rnd() * W, rnd() * H, 0.4 + rnd() * 1.1, 0, TAU); g.fill();
  }
  // a gentle vignette towards the edges
  const vg = g.createRadialGradient(W / 2, H * 0.45, 260, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(120,84,40,0)'); vg.addColorStop(1, 'rgba(120,84,40,0.20)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return cv;
}
const PAPER = makePaper();

function header() {
  font(700, 22); text('RECKON', 64, 84, { color: C.red, spacing: '5px' });
  const w = ctx.measureText('RECKON').width + 5 * 6;
  font(400, 22); text('LANGUAGE · ETYMOLOGY', 64 + w + 20, 84, { color: C.inkSoft, spacing: '3px' });
  ctx.fillStyle = C.ink; ctx.fillRect(64, 106, 672, 2.5); ctx.fillRect(64, 112, 672, 1);
}

// ---------- type sorts ----------
const TYPE = { size: 92, h: 124, top: 222, pad: 18, gap: 5, quad: 40 };
/** Scale the type once so the longest phrase fits 700 px. */
let typeReady = false;
function fitType() {
  if (typeReady) return;
  font(400, TYPE.size);
  const natural = (str) => [...str].reduce((sum, ch) => sum + (ch === ' ' ? TYPE.quad : ctx.measureText(ch).width + 2 * TYPE.pad) + TYPE.gap, -TYPE.gap);
  const s = Math.min(1, 700 / Math.max(...PHRASES.map((p) => natural(p.s))));
  for (const key of ['size', 'h', 'pad', 'gap', 'quad']) TYPE[key] *= s;
  TYPE.size = Math.round(TYPE.size);
  typeReady = true;
}
const glyphW = new Map();
function sortWidth(ch) {
  if (ch === ' ') return TYPE.quad;
  if (!glyphW.has(ch)) { font(400, TYPE.size); glyphW.set(ch, ctx.measureText(ch).width + 2 * TYPE.pad); }
  return glyphW.get(ch);
}
/**
 * One metal sort seen from above: a steel body with a bevel and a nick, the inked letter on its face.
 * lift 0..1 raises it (bigger, softer shadow); red inks the letter vermilion.
 */
function sort(x, y, w, ch, { lift = 0, red = 0, tilt = 0, alpha = 1 } = {}) {
  const h = TYPE.h, quad = ch === ' ';
  withAlpha(alpha, () => {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2); ctx.rotate(tilt); ctx.scale(1 + 0.05 * lift, 1 + 0.05 * lift); ctx.translate(-w / 2, -h / 2);
    // shadow on the paper
    ctx.shadowColor = `rgba(60,40,20,${0.34 - 0.12 * lift})`; ctx.shadowBlur = 5 + 16 * lift;
    ctx.shadowOffsetX = 2 + 5 * lift; ctx.shadowOffsetY = 4 + 18 * lift;
    rrect(0, 0, w, h, 5);
    const body = ctx.createLinearGradient(0, 0, w * 0.6, h);
    if (quad) { body.addColorStop(0, '#8E9296'); body.addColorStop(1, '#6C7074'); }
    else { body.addColorStop(0, '#D3D6D8'); body.addColorStop(0.5, '#AEB3B7'); body.addColorStop(1, '#8F9498'); }
    ctx.fillStyle = body; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    // bevel
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.moveTo(3, h - 4); ctx.lineTo(3, 3); ctx.lineTo(w - 4, 3); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,40,44,0.35)'; ctx.beginPath(); ctx.moveTo(w - 3, 4); ctx.lineTo(w - 3, h - 3); ctx.lineTo(4, h - 3); ctx.stroke();
    // the nick across the front of the shank
    ctx.strokeStyle = 'rgba(50,52,56,0.30)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(6, h - 16); ctx.lineTo(w - 6, h - 16); ctx.stroke();
    if (quad) {
      // a quad sits lower than the letters: a recessed top
      rrect(5, 6, w - 10, h - 30, 3); ctx.fillStyle = 'rgba(40,42,46,0.25)'; ctx.fill();
    } else {
      font(400, TYPE.size);
      const ink = red > 0 ? `rgb(${Math.round(lerp(28, 200, red))},${Math.round(lerp(25, 51, red))},${Math.round(lerp(21, 27, red))})` : C.ink;
      text(ch, w / 2, h * 0.60, { color: ink, align: 'center', base: 'middle' });
    }
    ctx.restore();
  });
}

/** x positions (left edges) of a row of sorts, centred; q scales the word space (0 = closed up). */
function layout(chars, q = 1) {
  const occ = chars.map((ch) => (ch === ' ' ? (sortWidth(' ') + TYPE.gap) * q : sortWidth(ch) + TYPE.gap));
  const total = occ.reduce((s, w) => s + w, 0) - TYPE.gap;
  const xs = [];
  let x = W / 2 - total / 2;
  for (const w of occ) { xs.push(x); x += w; }
  return xs;
}

/** The old and new settings of a phrase, as arrays of {id, ch}, and the id of the moving n. */
function phraseOrders(s) {
  const a = [...s].map((ch, id) => ({ id, ch }));
  const iq = a.findIndex((b) => b.ch === ' ');
  const forward = a[iq + 1]?.ch === 'n';          // "a napron": the n leaves the noun for the article
  const ni = forward ? iq + 1 : iq - 1;           // "an ekename": the n leaves the article for the noun
  const b = a.slice(); [b[iq], b[ni]] = [b[ni], b[iq]];
  return { a, b, nId: a[ni].id };
}
const ORDERS = PHRASES.map((p) => phraseOrders(p.s));

function drawPhrase(t, pi) {
  const P = PHRASES[pi], { a, b, nId } = ORDERS[pi];
  if (t < P.drop - 0.1 || t > P.lift + 1.2) return;
  // where each sort sits: the old setting, the new one, or in between
  let pos, q = 1, hopP = 0;
  if (P.special) {
    // the space closes up (5.0-6.4), the n lifts a touch (8.6-9.5), the space reopens after the n (9.6-10.8)
    const close = eio(seg(t, 5.0, 6.4)), open = eio(seg(t, 9.6, 10.8));
    const order = t < 9.6 ? a : b;
    q = t < 9.6 ? 1 - close : open;
    const xs = layout(order.map((o) => o.ch), q);
    pos = new Map(order.map((o, i) => [o.id, xs[i]]));
    hopP = seg(t, 8.6, 9.5);
  } else {
    const p = eio(seg(t, P.hop[0], P.hop[1]));
    const xa = layout(a.map((o) => o.ch)), xb = layout(b.map((o) => o.ch));
    const ma = new Map(a.map((o, i) => [o.id, xa[i]])), mb = new Map(b.map((o, i) => [o.id, xb[i]]));
    pos = new Map(a.map((o) => [o.id, lerp(ma.get(o.id), mb.get(o.id), p)]));
    hopP = seg(t, P.hop[0], P.hop[1]);
  }
  const redOn = P.special ? seg(t, 8.4, 8.9) : seg(t, P.hop[0] - 0.6, P.hop[0] - 0.1);
  // draw the quad and the letters first, the moving n last (it passes over the quad)
  const order = [...a].sort((u, v) => (u.id === nId) - (v.id === nId));
  order.forEach((o) => {
    const i = o.id;
    const dropP = seg(t, P.drop + i * 0.06, P.drop + i * 0.06 + 0.5);
    const liftP = seg(t, P.lift + i * 0.035, P.lift + i * 0.035 + 0.45);
    const dy = -(1 - back(dropP)) * 150 - eio(liftP) * 130;
    let lift = (1 - dropP) + liftP, tilt = 0, y = TYPE.top + dy, alpha = seg(dropP, 0, 0.35) * (1 - seg(liftP, 0.3, 1));
    if (o.id === nId) {
      const arc = Math.sin(Math.PI * hopP);
      y -= (P.special ? 30 : 92) * arc;
      lift = Math.max(lift, arc);
      tilt = (P.special ? 0 : (ORDERS[pi].a.findIndex((x) => x.id === nId) < ORDERS[pi].a.findIndex((x) => x.ch === ' ') ? 1 : -1)) * 0.12 * arc;
      // a nudge before it goes: "the n could jump the other way"
      if (P.wiggle) tilt += 0.06 * Math.sin((t - P.wiggle[0]) * 18) * span(t, P.wiggle[0], P.wiggle[1], 0.15, 0.15);
    }
    const ch = o.ch;
    const w = ch === ' ' ? sortWidth(' ') * (P.special ? q : 1) : sortWidth(ch);
    if (w < 1) return;
    sort(pos.get(o.id), y, w, ch, { lift, red: o.id === nId ? redOn : 0, tilt, alpha });
  });
}

/** "word space" label under the quad in the hook. */
function spaceLabel(t) {
  const a = span(t, 1.8, 5.0, 0.4, 0.3);
  if (a <= 0) return;
  const { a: order } = ORDERS[0];
  const xs = layout(order.map((o) => o.ch));
  const x = xs[1] + sortWidth(' ') / 2;
  withAlpha(a, () => {
    ctx.strokeStyle = C.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, TYPE.top + TYPE.h + 16); ctx.lineTo(x, TYPE.top + TYPE.h + 44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 7, TYPE.top + TYPE.h + 24); ctx.lineTo(x, TYPE.top + TYPE.h + 15); ctx.lineTo(x + 7, TYPE.top + TYPE.h + 24); ctx.stroke();
    font(400, 26, ITALIC); text('the word space', x, TYPE.top + TYPE.h + 64, { color: C.red, align: 'center', base: 'middle' });
  });
}

// ---------- the printed proof ----------
const PR = { head: 456, y0: 514, lh: 42, oldX: 420, arrowX: 452, nowX: 484 };
function arrow(x, y, w = 22) {
  ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + w / 2 - 7, y - 6); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w / 2 - 7, y + 6); ctx.stroke();
}
/** Printed text with a faint deboss: a light edge below, as if pressed into the paper. */
function printed(s, x, y, { size, family = SERIF, weight = 400, color = C.ink, align = 'left' }) {
  font(weight, size, family);
  text(s, x, y + 1.2, { color: 'rgba(255,250,238,0.75)', align, base: 'middle' });
  text(s, x, y, { color, align, base: 'middle' });
}
function proof(t, shift = 0) {
  const ha = eout(seg(t, 0.8, 1.6));
  withAlpha(ha, () => {
    const y = PR.head + shift;
    font(700, 22); text('THE PROOF', 64, y, { color: C.red, base: 'middle', spacing: '4px' });
    ctx.fillStyle = C.inkFaint; ctx.fillRect(64, y + 20, W - 128, 1.5);
  });
  PROOF.forEach((ln, i) => {
    const p = seg(t, ln.at, ln.at + 0.45);
    if (p <= 0) return;
    const y = PR.y0 + i * PR.lh + shift;
    const press = 1 + 0.05 * (1 - eout(p));
    withAlpha(eout(clamp(p * 1.6)), () => {
      ctx.save(); ctx.translate(W / 2, y); ctx.scale(press, press); ctx.translate(-W / 2, -y);
      printed(ln.when, 64, y + 2, { size: 24, family: ITALIC, color: C.inkSoft });
      printed(ln.old, PR.oldX, y, { size: 32, family: ITALIC, color: C.red, align: 'right' });
      arrow(PR.arrowX, y + 1);
      printed(ln.now, PR.nowX, y, { size: 32, color: C.ink });
      ctx.restore();
    });
  });
  withAlpha(eout(seg(t, 35.2, 35.8)), () => {
    font(400, 22, ITALIC);
    text('Centuries: when the new form is first recorded.', 64, PR.y0 + 5 * PR.lh + 4 + shift, { color: C.inkSoft, base: 'middle' });
  });
}

// ---------- scene E: the article with the movable n ----------
function sceneE(t) {
  const chars = ['a', 'n'];
  const xs = layout(chars);
  const inP = seg(t, 36.0, 36.5), outP = seg(t, 39.7, 40.15);
  const cyc = ((t - 36.7) % 1.6 + 1.6) % 1.6;
  const up = t < 36.7 ? 0 : eio(seg(cyc, 0, 0.45)) * (1 - eio(seg(cyc, 0.8, 1.25)));
  chars.forEach((ch, i) => {
    const dy = -(1 - back(seg(inP, i * 0.15, 0.85 + i * 0.15))) * 120 - eio(outP) * 110;
    const alpha = seg(inP, i * 0.15, 0.5 + i * 0.15) * (1 - outP);
    if (i === 1) {
      // dashed outline where the n sits when it is away
      withAlpha(alpha * up, () => {
        ctx.setLineDash([7, 7]); ctx.strokeStyle = `rgba(${C.redRGB},0.7)`; ctx.lineWidth = 2;
        rrect(xs[1], TYPE.top + dy, sortWidth('n'), TYPE.h, 5); ctx.stroke(); ctx.setLineDash([]);
      });
      sort(xs[1] + 30 * up, TYPE.top + dy - 92 * up, sortWidth('n'), 'n', { lift: up, red: 1, tilt: 0.1 * up, alpha });
    } else sort(xs[0], TYPE.top + dy, sortWidth('a'), 'a', { alpha });
  });
  withAlpha(span(t, 36.4, 40.1, 0.3, 0.3), () => {
    font(400, 30, ITALIC);
    text('the article a(n)', W / 2, TYPE.top + TYPE.h + 60, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- scene F: brackets ----------
function bracket(x, y, h, open, a) {
  withAlpha(a, () => {
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
    const d = open ? 10 : -10;
    ctx.beginPath(); ctx.moveTo(x + d, y); ctx.lineTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + d, y + h); ctx.stroke();
  });
}
function sceneF(t) {
  const { a, b, nId } = ORDERS[0];
  const inP = seg(t, 40.2, 40.8), outP = seg(t, 43.6, 44.1);
  const p = eio(seg(t, 41.6, 42.5));
  const xa = layout(a.map((o) => o.ch)), xb = layout(b.map((o) => o.ch));
  const ma = new Map(a.map((o, i) => [o.id, xa[i]])), mb = new Map(b.map((o, i) => [o.id, xb[i]]));
  const ordered = [...a].sort((u, v) => (u.id === nId) - (v.id === nId));
  const x = (id) => lerp(ma.get(id), mb.get(id), p);
  const arc = Math.sin(Math.PI * seg(t, 41.6, 42.5));
  ordered.forEach((o) => {
    const dy = -(1 - eout(seg(inP, o.id * 0.05, 0.6 + o.id * 0.05))) * 80 - eio(outP) * 110;
    const alpha = seg(inP, o.id * 0.05, 0.4 + o.id * 0.05) * (1 - outP);
    const isN = o.id === nId;
    sort(x(o.id), TYPE.top + dy - (isN ? 92 * arc : 0), sortWidth(o.ch), o.ch, { lift: isN ? arc : 0, red: isN ? 1 : 0, tilt: isN ? -0.12 * arc : 0, alpha });
  });
  // brackets around the two words, following the sorts
  const ba = eout(seg(t, 40.9, 41.4)) * (1 - outP);
  const y = TYPE.top - 16, h = TYPE.h + 32;
  const ids = a.map((o) => o.id);
  const left = Math.min(...ids.map(x)) - 12;
  const right = Math.max(...ids.map((id) => x(id) + sortWidth(a[id].ch))) + 12;
  const q = ORDERS[0].a.find((o) => o.ch === ' ').id;
  const qx = x(q), qw = sortWidth(' ');
  bracket(left, y, h, true, ba);
  bracket(qx + 6, y, h, false, ba);
  bracket(qx + qw - 6, y, h, true, ba);
  bracket(right, y, h, false, ba);
}

// ---------- scene G: the finished proof ----------
function sceneG(t) {
  const p = eout(seg(t, 44.3, 45.1));
  withAlpha(p, () => {
    font(700, 64); text('The movable n', W / 2, 200 + (1 - p) * 12, { color: C.ink, align: 'center', base: 'middle' });
    font(400, 28, ITALIC); text('five words, re-split at the article', W / 2, 254, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
  withAlpha(eout(seg(t, 45.0, 45.6)), () => {
    font(400, 22);
    text('Sources: Wikipedia, “Rebracketing”, “Adder”, “Umpire”,', W / 2, 676, { color: C.inkSoft, align: 'center', base: 'middle' });
    text('“Nickname”, “Newt”; Merriam-Webster dictionary', W / 2, 706, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 400, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SERIF, ink: C.ink, marks: { '*': C.red, '~': C.red } });
  }
}

Kit.scene({
  width: W, height: H, duration: 49,
  fonts: [
    { family: SERIF, file: 'LibreCaslonText-Regular.woff2', weight: '400' },
    { family: SERIF, file: 'LibreCaslonText-Bold.woff2', weight: '700' },
    { family: ITALIC, file: 'LibreCaslonText-Italic.woff2', weight: '400' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    fitType();
    ctx.drawImage(PAPER, 0, 0);
    header();
    // the proof moves up to the centre for the payoff
    const up = eio(seg(t, 44.2, 45.2));
    proof(t, -120 * up);
    for (let i = 0; i < PHRASES.length; i++) drawPhrase(t, i);
    spaceLabel(t);
    if (t > 35.9 && t < 40.3) sceneE(t);
    if (t > 40.1 && t < 44.2) sceneF(t);
    if (t > 44.0) sceneG(t);
    captions(t);
  },
});
