// Explainer for language-hittite-bread-and-water: on 8 October 2026 Turkey's culture minister announced 131
// more cuneiform tablets from Kayalıpınar, ancient Samuha, a Hittite royal archive now 184 strong. How do we
// read Hittite at all? Cuneiform signs work as syllables, as Sumerian word signs and as silent labels, and in
// 1915 Bedřich Hrozný cracked the language with one line about bread and water. Look: a dark slate-teal night
// with terracotta clay tablets, wedges pressed in as small shaded triangles; syllables teal, word signs gold,
// silent labels rose. Cardo for the transliterations and titles, Alegreya Sans for captions and labels.
// The wedge clusters are drawn schematically: they are not the shapes of real Hittite signs.
//
// Facts:
// - Daily Sabah, "Hittite royal archive with 184 tablets unearthed in central Türkiye" (8 October 2026), from a
//   statement by Culture and Tourism Minister Mehmet Nuri Ersoy: 131 cuneiform tablets and fragments in the
//   2026 excavations at Kayalıpınar (Yıldızeli, Sivas), 53 in 2025, 184 in all; Samuha in Hittite and
//   Assyrian sources; reign of King Tudhaliya II; about 3,400 years old; written in Hittite and Hurrian;
//   records of a high-fever epidemic, divination with birds, a letter from generals asking for soldiers;
//   excavations led by Çiğdem Maner (Koç University) since 2021.
// - Wikipedia, "Cuneiform": named for its wedge-shaped impressions; clay tablets and a reed stylus;
//   "Akkadian cuneiform was itself adapted to write the Hittite language in the early 2nd millennium BC."
// - Wikipedia, "Hittite cuneiform": syllable signs (V, CV, VC, CVC); Sumerograms and Akkadograms; determiners
//   are "Sumerograms that are not pronounced but indicate the class or nature of a noun": DINGIR deity, URU
//   city, as in URU Ḫa-at-tu-ša (Hattusa), LÚ man; NINDA bread; the Hethitisches Zeichenlexikon "lists 375
//   cuneiform signs used in Hittite documents".
// - Wikipedia, "Hittite language": "the oldest attested Indo-European language", attested c. 1600 – c. 1200
//   BC; more than 30,000 tablets or fragments from the royal archives; texts recovered from 1906 onwards.
// - Wikipedia, "Bedřich Hrozný": Czech orientalist; in 1906 a German expedition at Hattusa found royal archives
//   in an unknown language; "nu NINDA-an ezzatteni watar-ma ekutteni": NINDA known as the Sumerian sign for
//   bread, -an perhaps an accusative ending, ezza- compared with Latin edo, English eat, German essen: "you
//   (will) eat bread"; watar like English water, German Wasser; eku- like Latin aqua: "you (will) drink
//   water"; the language was Indo-European; "Die Lösung des hethitischen Problems" (1915).
// Computed here: 53 + 131 = 184.
//
// Scene plan (60 s). Important things stay above y = 760; captions are centred at y = 846.
//  A  0.0– 9.2  Kayalıpınar: a tablet; 53 + 131 = 184.
//  B  9.2–23.0  Wedges in clay; a borrowed script of 375 signs; three jobs for a sign.
//  C 23.0–36.6  Hattusa spelled with a silent city label; NINDA; tablets that could be sounded out from 1906.
//  D 36.8–55.0  Hrozný's sentence, word by word; the oldest written Indo-European language.
//  E 55.2–60.0  Back to the 184 tablets of Samuha.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#13262a', bg2: '#091315', ink: '#f6efe4', soft: 'rgba(246,239,228,0.72)', faint: 'rgba(246,239,228,0.22)',
  clay: '#c99668', clayHi: '#ddb185', clayLo: '#9c6b45', wedge: '#6e4428', wedgeHi: 'rgba(255,236,210,0.55)',
  syl: '#7fd6cf', word: '#f2c15a', silent: '#f29cab', panel: 'rgba(0,0,0,0.30)',
};
const SERIF = 'Cardo', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the facts ----------
const FOUND = { y2025: 53, y2026: 131 };
const ARCHIVE = FOUND.y2025 + FOUND.y2026; // 184
const SIGNS = 375;
const LINE = [
  { w: 'nu', kind: 'syl' },
  { w: 'NINDA-an', kind: 'word', gloss: 'bread', note: 'Sumerian word sign' },
  { w: 'ezzatteni', kind: 'syl', gloss: 'you (will) eat', like: ['Latin edo', 'German essen', 'English eat'] },
  { w: 'watar-ma', kind: 'syl', gloss: 'water', like: ['English water', 'German Wasser'] },
  { w: 'ekutteni', kind: 'syl', gloss: 'you (will) drink', like: ['Latin aqua'] },
];

const CUES = [
  [0.4, 4.6, `On 8 October 2026, Turkey’s culture minister announced *${FOUND.y2026}* tablets and fragments from Kayalıpınar.`],
  [4.8, 9.0, `With ${FOUND.y2025} found in 2025, it is a royal archive of ^${ARCHIVE}^, about 3,400 years old, in Hittite and Hurrian.`],
  [9.2, 13.6, 'Scribes wrote by pressing a reed into wet clay: each sign is a cluster of wedges.'],
  [13.8, 18.2, `Hittite scribes borrowed the script from Akkadian writing. A standard list counts ${SIGNS} signs.`],
  [18.4, 22.8, 'A sign can stand for a *syllable*, for a whole ^word^, or be a silent ~label~.'],
  [23.0, 27.4, 'The capital, Hattusa: a silent ~city~ sign, then the syllables *ha-at-tu-ša*.'],
  [27.6, 32.0, 'Word signs came from Sumerian: ^NINDA^ means bread, so its meaning is clear without knowing Hittite.'],
  [32.2, 36.6, 'From 1906, tablets dug up at Hattusa could be sounded out, but nobody understood the language.'],
  [36.8, 41.2, 'In 1915, Czech scholar Bedřich Hrozný took one line: *nu NINDA-an ezzatteni watar-ma ekutteni*.'],
  [41.4, 45.8, '^NINDA^ was bread, and *ezza-* looked like Latin edo, German essen, English eat: “you eat bread”.'],
  [46.0, 50.4, 'Then *watar*, like water and Wasser: “you drink water”. Hittite was Indo-European.'],
  [50.6, 55.0, 'It is the earliest written member of the language family of English, German and Latin.'],
  [55.2, 60.0, `Read the same way, Samuha’s ${ARCHIVE} tablets tell of a fever epidemic and omens read from birds.`],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 420, 40, W / 2, 520, 820);
  rg.addColorStop(0, C.bg1); rg.addColorStop(1, C.bg2);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  let s = 23; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(220,240,235,${rnd() * 0.025})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd(), 1 + rnd()); }
}

// ---------- clay and wedges ----------
function tablet(x, y, w, h, r = 26) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; k.rrect(x + 8, y + 12, w, h, r); ctx.fill();
  const g = ctx.createLinearGradient(x, y, x + w * 0.4, y + h);
  g.addColorStop(0, C.clayHi); g.addColorStop(0.55, C.clay); g.addColorStop(1, C.clayLo);
  ctx.fillStyle = g; k.rrect(x, y, w, h, r); ctx.fill();
  ctx.strokeStyle = 'rgba(80,45,20,0.35)'; ctx.lineWidth = 2; k.rrect(x + 3, y + 3, w - 6, h - 6, r - 3); ctx.stroke();
}
/** One wedge pressed into clay: a triangular head with a thin tail, pointing along angle a. */
function wedge(x, y, len, a, depth = 1, col = C.wedge) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  const hw = len * 0.28, head = len * 0.36;
  A(depth, () => {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(0, -hw); ctx.lineTo(head, 0); ctx.lineTo(0, hw); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, len * 0.07); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(head * 0.6, 0); ctx.lineTo(len, 0); ctx.stroke();
    ctx.fillStyle = C.wedgeHi; ctx.beginPath(); ctx.moveTo(0, -hw); ctx.lineTo(head, 0); ctx.lineTo(head * 0.35, -hw * 0.2); ctx.closePath(); ctx.fill();
  });
  ctx.restore();
}
/** A corner wedge: just the triangular head, pressed with the corner of the reed. */
function corner(x, y, s, depth = 1, col = C.wedge) {
  A(depth, () => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + s * 0.5, y - s * 0.45); ctx.lineTo(x - s * 0.4, y); ctx.lineTo(x + s * 0.5, y + s * 0.45); ctx.lineTo(x + s * 0.2, y); ctx.closePath(); ctx.fill();
  });
}
// a schematic "sign": a few wedges chosen from a seed (not a real sign)
function glyph(x, y, s, seed, depth = 1, col = C.wedge) {
  let q = seed * 9301 + 49297; const r = () => ((q = (q * 9301 + 49297) % 233280) / 233280);
  const n = 2 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const kind = r();
    const ox = (r() - 0.5) * s * 0.7, oy = (r() - 0.5) * s * 0.7;
    if (kind < 0.45) wedge(x + ox - s * 0.35, y + oy, s * 0.8, 0, depth, col);
    else if (kind < 0.8) wedge(x + ox, y + oy - s * 0.4, s * 0.8, Math.PI / 2, depth, col);
    else corner(x + ox, y + oy, s * 0.45, depth, col);
  }
}
/** Rows of schematic signs on a tablet, revealed from p = 0 to 1. */
function writing(x, y, w, h, p, seed = 1, size = 30) {
  const cols = Math.floor(w / (size * 1.25)), rows = Math.floor(h / (size * 1.45));
  for (let r = 0; r < rows; r++) {
    ctx.strokeStyle = 'rgba(90,52,25,0.30)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y + (r + 1) * size * 1.45 - size * 0.2); ctx.lineTo(x + w, y + (r + 1) * size * 1.45 - size * 0.2); ctx.stroke();
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c, at = i / (rows * cols);
      if (p <= at) continue;
      glyph(x + (c + 0.5) * size * 1.25, y + (r + 0.5) * size * 1.45, size, seed * 1000 + i, clamp((p - at) * rows * cols * 0.5));
    }
  }
}

/** A sign card: a small clay square with schematic wedges, its reading below in its role's colour. */
function card(x, y, s, reading, kind, a = 1, o = {}) {
  A(a, () => {
    tablet(x - s / 2, y - s / 2, s, s, 12);
    glyph(x, y, s * 0.5, o.seed ?? reading.length * 7 + 3);
    const col = C[kind];
    ctx.strokeStyle = col; ctx.lineWidth = 4; k.rrect(x - s / 2 - 5, y - s / 2 - 5, s + 10, s + 10, 15); ctx.stroke();
    k.font(kind === 'word' ? 700 : 400, o.size ?? 32, SERIF);
    text(reading, x, y + s / 2 + 34, { align: 'center', color: col });
    if (o.tag) { font(600, 22); text(o.tag, x, y + s / 2 + 70, { align: 'center', color: C.soft }); }
  });
}

// ---------- A: the archive ----------
function sceneArchive(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => {
      font(700, 25); text('KAYALIPINAR · SIVAS PROVINCE · TURKEY', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      k.font(400, 30, SERIF); text('ancient Samuha, a Hittite city', CX, 178, { align: 'center', color: C.soft });
    });
    const g = eout(seg(t, 0.4, 1.4));
    A(g, () => {
      tablet(232, 230 + (1 - g) * 40, 400, 330);
      writing(262, 258 + (1 - g) * 40, 340, 280, seg(t, 0.9, 4.4), 3);
    });
    A(seg(t, 4.8, 5.3), () => {
      const n1 = Math.round(FOUND.y2025 * eout(seg(t, 4.9, 6.0))), n2 = Math.round(FOUND.y2026 * eout(seg(t, 5.4, 6.8)));
      k.font(700, 64, SERIF);
      text(`${n1}`, 220, 650, { align: 'center', color: C.ink }); text('+', 330, 650, { align: 'center', color: C.soft });
      text(`${n2}`, 450, 650, { align: 'center', color: C.syl }); text('=', 568, 650, { align: 'center', color: C.soft });
      A(seg(t, 6.8, 7.3), () => text(`${ARCHIVE}`, 680, 650, { align: 'center', color: C.word }));
      font(600, 24); text('found in 2025', 220, 712, { align: 'center', color: C.soft }); text('found in 2026', 450, 712, { align: 'center', color: C.soft });
      A(seg(t, 6.8, 7.3), () => text('tablets and fragments', 680, 712, { align: 'center', color: C.soft }));
    });
  });
}

// ---------- B: wedges, signs and their jobs ----------
function sceneScript(t) {
  const a = span(t, 9.2, 23.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 9.2–13.8: a reed presses three wedges into wet clay
    A(1 - seg(t, 13.5, 13.9), () => {
      font(700, 25); text('WRITING ON CLAY', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      tablet(152, 220, 560, 420);
      const presses = [[10.0, 300, 380, 0], [11.0, 470, 330, Math.PI / 2], [12.0, 600, 400, -1]];
      presses.forEach(([t0, x, y, ang], i) => {
        const d = seg(t, t0 + 0.35, t0 + 0.6);
        if (ang === -1) corner(x, y, 90, d); else wedge(x - (ang ? 0 : 60), y - (ang ? 70 : 0), 170, ang, d);
        // the reed: comes down, presses, lifts
        const down = seg(t, t0, t0 + 0.4) * (1 - seg(t, t0 + 0.6, t0 + 0.95));
        if (down > 0 && t < t0 + 0.95) {
          ctx.save(); ctx.translate(x + 30, y - 20 - (1 - down) * 70); ctx.rotate(-0.55);
          ctx.fillStyle = '#d8c48e'; ctx.fillRect(0, -14, 200, 28);
          ctx.fillStyle = '#b39a62'; ctx.fillRect(0, -14, 200, 6);
          ctx.fillStyle = '#8f7a45'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(-22, 0); ctx.lineTo(0, 14); ctx.fill();
          ctx.restore();
        }
        A(seg(t, t0 + 0.6, t0 + 1.0), () => { font(600, 24); text(['a wedge', 'a wedge', 'a corner wedge'][i], x + (i === 1 ? 0 : 10), i === 1 ? 560 : 530, { align: 'center', color: C.ink }); });
      });
    });
    // 13.8–18.4: a borrowed script with 375 signs
    A(span(t, 13.8, 18.4, 0.4, 0.4), () => {
      font(700, 25); text(`A BORROWED SCRIPT · ${SIGNS} SIGNS`, CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      const cols = 25, s = 26, x0 = CX - (cols * s) / 2 + s / 2, y0 = 220;
      for (let i = 0; i < SIGNS; i++) {
        const g = seg(t, 14.0 + (i / SIGNS) * 2.6, 14.3 + (i / SIGNS) * 2.6);
        if (g <= 0) continue;
        const x = x0 + (i % cols) * s, y = y0 + Math.floor(i / cols) * s * 1.2;
        glyph(x, y, s * 0.62, i + 11, g, 'rgba(221,177,133,0.85)');
      }
      A(seg(t, 16.6, 17.1), () => { font(600, 26); text('Akkadian cuneiform, adapted to write Hittite', CX, 640, { align: 'center', color: C.ink }); });
    });
    // 18.4–23.0: three jobs for a sign
    A(span(t, 18.4, 23.0, 0.4, 0.4), () => {
      font(700, 25); text('WHAT A SIGN CAN DO', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      card(178, 360, 150, 'ha', 'syl', eout(seg(t, 18.6, 19.2)), { tag: 'a syllable' });
      card(432, 360, 150, 'NINDA', 'word', eout(seg(t, 19.6, 20.2)), { tag: 'a word: bread' });
      card(686, 360, 150, 'URU', 'silent', eout(seg(t, 20.6, 21.2)), { tag: 'a silent label: city' });
      A(seg(t, 21.4, 21.9), () => { font(500, 24); text('in transliteration: word signs in capitals, syllables in lower case', CX, 620, { align: 'center', color: C.soft }); });
    });
  });
}

// ---------- C: Hattusa, NINDA, the riddle of 1906 ----------
function sceneExamples(t) {
  const a = span(t, 23.0, 36.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 23.0–27.6: URU ha-at-tu-ša
    A(1 - seg(t, 27.3, 27.7), () => {
      font(700, 25); text('THE NAME OF THE CAPITAL', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      const parts = [['URU', 'silent'], ['ha', 'syl'], ['at', 'syl'], ['tu', 'syl'], ['ša', 'syl']];
      parts.forEach(([r, kind], i) => card(124 + i * 154, 330, 112, r, kind, eout(seg(t, 23.2 + i * 0.35, 23.7 + i * 0.35)), { seed: 40 + i * 5, size: 30 }));
      A(seg(t, 25.4, 25.9), () => {
        font(600, 24); text('(city)', 124, 470, { align: 'center', color: C.silent });
        k.font(700, 58, SERIF); text('Hattusa', 470, 560, { align: 'center', color: C.ink });
        font(500, 24); text('the city sign is not read aloud', CX, 640, { align: 'center', color: C.soft });
      });
    });
    // 27.6–32.2: NINDA
    A(span(t, 27.6, 32.2, 0.4, 0.4), () => {
      font(700, 25); text('A WORD SIGN FROM SUMERIAN', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      card(272, 360, 200, 'NINDA', 'word', eout(seg(t, 27.8, 28.4)), { seed: 77, size: 40 });
      A(seg(t, 28.8, 29.3), () => {
        ctx.strokeStyle = C.word; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(400, 360); ctx.lineTo(500, 360); ctx.stroke();
        ctx.fillStyle = C.word; ctx.beginPath(); ctx.moveTo(514, 360); ctx.lineTo(496, 348); ctx.lineTo(496, 372); ctx.fill();
        // a round loaf
        ctx.fillStyle = '#d9a35c'; ctx.beginPath(); ctx.ellipse(620, 370, 92, 58, 0, Math.PI, 0); ctx.lineTo(712, 392); ctx.lineTo(528, 392); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#a8742f'; ctx.lineWidth = 5; for (const dx of [-40, 0, 40]) { ctx.beginPath(); ctx.moveTo(620 + dx - 14, 340); ctx.lineTo(620 + dx + 14, 322); ctx.stroke(); }
        k.font(400, 40, SERIF); text('bread', 620, 450, { align: 'center', color: C.ink });
      });
    });
    // 32.2–36.8: sounded out, not understood
    A(span(t, 32.2, 36.8, 0.4, 0.4), () => {
      font(700, 25); text('HATTUSA, FROM 1906', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      for (let i = 0; i < 7; i++) {
        const g = eout(seg(t, 32.4 + i * 0.15, 32.9 + i * 0.15));
        const x = 110 + (i % 4) * 196 + (i >= 4 ? 98 : 0), y = 230 + (i >= 4 ? 170 : 0);
        A(g, () => { tablet(x - 70, y - 60, 140, 120, 14); writing(x - 56, y - 52, 112, 100, 1, 20 + i, 16); });
      }
      A(seg(t, 34.0, 34.5), () => {
        k.font(400, 40, SERIF); text('… ezzatteni … watar …', CX, 560, { align: 'center', color: C.syl });
        font(700, 30); text('sounds: yes · meaning: ?', CX, 630, { align: 'center', color: C.ink });
      });
    });
  });
}

// ---------- D: Hrozný's line ----------
function sceneLine(t) {
  const a = span(t, 36.8, 55.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 25); text('BEDŘICH HROZNÝ · 1915', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    if (t < 50.6) {
      // Hrozný's two sentences, word by word: [word index, x, y]
      const at = [[0, 128, 214], [1, 308, 214], [2, 596, 214], [3, 308, 484], [4, 596, 484]];
      at.forEach(([i, x, y], n) => {
        const wd = LINE[i], g = eout(seg(t, 37.0 + n * 0.3, 37.5 + n * 0.3));
        A(g, () => { k.font(wd.kind === 'word' ? 700 : 400, 46, SERIF); text(wd.w, x, y, { align: 'center', color: C[wd.kind] }); });
      });
      const gloss = (i, from) => {
        const [, x, y] = at.find(([j]) => j === i), wd = LINE[i];
        A(seg(t, from, from + 0.5), () => { font(700, 30); text(wd.gloss, x, y + 56, { align: 'center', color: C.ink }); });
        const notes = wd.note ? [wd.note] : wd.like.length > 2 ? [wd.like.slice(0, 2).join(' · '), wd.like[2]] : [wd.like.join(' · ')];
        notes.forEach((l, j) => A(seg(t, from + 0.6 + j * 0.4, from + 1.0 + j * 0.4), () => { font(500, 24); text(l, x, y + 96 + j * 32, { align: 'center', color: C.soft }); }));
      };
      gloss(1, 41.6);
      gloss(2, 42.6);
      gloss(3, 46.2);
      gloss(4, 47.2);
      A(seg(t, 44.6, 45.1), () => { k.font(400, 40, SERIF); text('“you (will) eat bread”', CX, 400, { align: 'center', color: C.word }); });
      A(seg(t, 48.8, 49.3), () => { k.font(400, 40, SERIF); text('“you (will) drink water”', CX, 690, { align: 'center', color: C.syl }); });
    } else {
      // 50.6: the family
      const g = eout(seg(t, 50.7, 51.4));
      A(g, () => {
        ctx.fillStyle = C.panel; k.rrect(282, 196, 300, 70, 14); ctx.fill();
        k.font(700, 36, SERIF); text('Indo-European', CX, 231, { align: 'center', color: C.ink });
        const kids = [['Hittite', 'c. 1600–1200 BC', C.word], ['Latin', '', C.ink], ['German', '', C.ink], ['English', '', C.ink]];
        kids.forEach(([n, d, col], i) => {
          const x = 132 + i * 200, gg = eout(seg(t, 51.2 + i * 0.3, 51.7 + i * 0.3));
          A(gg, () => {
            ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(CX, 266); ctx.bezierCurveTo(CX, 330, x, 320, x, 384); ctx.stroke();
            k.font(700, 36, SERIF); text(n, x, 420, { align: 'center', color: col });
            if (d) { font(600, 24); text(d, x, 462, { align: 'center', color: C.soft }); }
          });
        });
        A(seg(t, 52.6, 53.1), () => {
          font(700, 30); text('the oldest member written down', CX, 560, { align: 'center', color: C.word });
          font(500, 24); text('(single words and names turn up earlier, in Akkadian records from Kanesh)', CX, 604, { align: 'center', color: C.soft });
        });
      });
    }
  });
}

// ---------- E: back to Samuha ----------
function sceneEnd(t) {
  const a = eout(seg(t, 55.2, 56.0));
  if (a <= 0) return;
  A(a, () => {
    font(700, 25); text(`SAMUHA · ${ARCHIVE} TABLETS AND FRAGMENTS`, CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    tablet(232, 200, 400, 300);
    writing(262, 228, 340, 250, 1, 9);
    const items = ['a fever epidemic', 'omens read from birds', 'generals asking for soldiers'];
    items.forEach((s, i) => A(eout(seg(t, 56.0 + i * 0.5, 56.5 + i * 0.5)), () => { font(700, 28); text(s, CX, 560 + i * 48, { align: 'center', color: [C.silent, C.syl, C.word][i] }); }));
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneArchive(t);
    sceneScript(t);
    sceneExamples(t);
    sceneLine(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 41, weight: 700, family: SANS, ink: C.ink, marks: { '*': C.syl, '^': C.word, '~': C.silent } });
  },
});
