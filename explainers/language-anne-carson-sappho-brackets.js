// Explainer for language-anne-carson-sappho-brackets: on 8 October 2026 Anne Carson won the Nobel Prize in
// Literature; her If Not, Winter (2002) translates the fragments of Sappho and marks the gaps with brackets.
// Look: a scholar's desk at night, umber with cream papyrus (fibres drawn as faint lines), terracotta and
// Aegean blue as accents, gold for what survives. EB Garamond for captions and the Greek, Caveat for the
// pencilled notes.
//
// Computed here: a grid of 10,000 lines with about 650 lit (6.5%), the share that survives.
// Facts: NobelPrize.org press release, 8 October 2026: the prize to the Canadian author Anne Carson "for her
// bold and inventive oeuvre that, in playful dialogue with the classical tradition, has created new forms for
// contemporary literature"; bio-bibliography: born 1950 in Toronto, a classicist; If Not, Winter (2002), her
// interpretation of Sappho's fragments. Wikipedia, "Sappho": c. 630–c. 570 BC, Lesbos; probably about 10,000
// lines, about 650 survive; only the Ode to Aphrodite is certainly complete; the work was probably lost because
// too few wanted it copied onto parchment when codices replaced papyrus rolls; the two sources are quotations by
// other ancient writers (from a whole poem to a single word) and papyrus fragments, many found at
// Oxyrhynchus, where Grenfell and Hunt began digging an ancient rubbish dump at the end of the 19th century;
// major finds in 2004 (the Tithonus poem) and 2014 (parts of nine poems). Wikipedia, "Ode to Aphrodite":
// quoted in its entirety by Dionysius of Halicarnassus in On Composition. Wikipedia, "Sappho 31": preserved
// in On the Sublime (first century AD), quoted by Longinus for the intensity of its emotion. Wikipedia,
// "Sapphic stanza": the Greek of fragment 31, line 1. Wikipedia, "If Not, Winter": Carson marks lacunae with
// square brackets and uses white space; the title comes from fragment 22, whose opening lines in her
// translation are "] / ]work / ]face / ] / ] / if not, winter / ]no pain".
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The prize; the book.
//  B  9.2–23.0  Sappho; 10,000 lines and the 650 that survive; papyrus rolls give way to parchment books.
//  C 23.0–36.6  Survival by quotation: fragment 31 in Longinus, the whole Ode in Dionysius.
//  D 36.6–50.4  Survival on papyrus: the Oxyrhynchus rubbish dump; finds in 2004 and 2014.
//  E 50.4–64.6  A torn scrap; guess or show; Carson's brackets; "if not, winter".
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#1f150d', bg2: '#33221a', ink: '#f3ead6', soft: 'rgba(243,234,214,0.72)', faint: 'rgba(243,234,214,0.20)',
  papyrus: '#e7d7af', papyrus2: '#d8c391', fibre: 'rgba(120,90,40,0.16)', pInk: '#2b1d12', pSoft: 'rgba(43,29,18,0.62)',
  terracotta: '#d0673c', blue: '#5b9bd5', gold: '#e6b34f', parchment: '#efe6d0', panel: 'rgba(14,9,5,0.72)', sand: '#c9a86a',
};
const SERIF = 'EB Garamond', HAND = 'Caveat';

let k, ctx;
const font = (w, s, f = SERIF) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers ----------
const LINES = 10000, SURVIVE = 650;
const GREEK_31 = 'Φαίνεταί μοι κῆνος ἴσος θέοισιν';
const FR22 = [']', ']work', ']face', ']', ']', 'if not, winter', ']no pain'];

const CUES = [
  [0.4, 4.6, 'On 8 October 2026, the Canadian poet Anne Carson won the *Nobel Prize in Literature*.'],
  [4.8, 9.0, 'She is also a scholar of ancient Greek. In *If Not, Winter* (2002) she translated ^Sappho^.'],
  [9.2, 13.6, 'Sappho lived on the Greek island of Lesbos around 600 BC, and probably wrote *10,000 lines*.'],
  [13.8, 18.2, `About ~${SURVIVE}~ survive today, and only one poem is certainly complete.`],
  [18.4, 22.8, 'Most were probably lost as books moved from papyrus rolls to parchment: few had hers copied.'],
  [23.0, 27.4, 'Some lines lived on because other writers *quoted* them: a whole poem, or a single word.'],
  [27.6, 32.0, 'In the first century AD, a critic known as Longinus quoted fragment 31 for its feeling.'],
  [32.2, 36.6, 'The one complete poem, a prayer to Aphrodite, was quoted whole by Dionysius of Halicarnassus.'],
  [36.8, 41.2, 'Other lines came out of the sand, on torn ^papyrus^ thrown away in ancient Egypt.'],
  [41.4, 45.8, 'From the late 1800s, digs in an old rubbish dump at *Oxyrhynchus* turned up many lost lines.'],
  [46.0, 50.4, 'New pieces still turn up: the Tithonus poem in 2004, parts of nine poems in 2014.'],
  [50.6, 55.0, 'Where the papyrus is torn, words are lost. A translator can guess at them, or show the hole.'],
  [55.2, 59.6, 'Carson shows it: a square bracket ~]~ marks each gap, with white space around it.'],
  [59.8, 64.2, 'Her title comes from fragment 22, where the words *if not, winter* stand between gaps.'],
];

// ---------- background and papyrus texture ----------
let bg = null, pap = null;
function paintBg() {
  let s = 31; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 380, 60, W / 2, 420, 760);
  rg.addColorStop(0, C.bg2); rg.addColorStop(1, C.bg1);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  pap = document.createElement('canvas'); pap.width = 700; pap.height = 560;
  const p = pap.getContext('2d');
  p.fillStyle = C.papyrus; p.fillRect(0, 0, 700, 560);
  for (let i = 0; i < 260; i++) { const y = r() * 560; p.fillStyle = C.fibre; p.fillRect(0, y, 700, 1 + r() * 2.5); }
  for (let i = 0; i < 160; i++) { const x = r() * 700; p.fillStyle = 'rgba(120,90,40,0.07)'; p.fillRect(x, 0, 1 + r() * 2, 560); }
  for (let i = 0; i < 1200; i++) { p.fillStyle = `rgba(90,60,20,${r() * 0.08})`; p.fillRect(r() * 700, r() * 560, 2, 2); }
}

/** A torn scrap of papyrus: a jagged outline from a seed, filled with the texture. */
function scrap(x, y, w, h, seed, { holes = [], lines = 0, ink = C.pInk, rot = 0 } = {}) {
  let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2);
  ctx.beginPath();
  const pts = [];
  for (let i = 0; i <= 10; i++) pts.push([(i / 10) * w, (r() - 0.5) * 14]);
  for (let i = 1; i <= 8; i++) pts.push([w + (r() - 0.5) * 18, (i / 8) * h]);
  for (let i = 9; i >= 0; i--) pts.push([(i / 10) * w, h + (r() - 0.5) * 14]);
  for (let i = 7; i >= 1; i--) pts.push([(r() - 0.5) * 18, (i / 8) * h]);
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.save(); ctx.translate(5, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.clip(); ctx.drawImage(pap, 0, 0, w, h);
  // ink: lines of writing as strokes (not real letters)
  ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let l = 0; l < lines; l++) {
    const ly = 34 + l * 34; let lx = 22;
    while (lx < w - 30) { const len = 8 + r() * 26; ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.moveTo(lx, ly + (r() - 0.5) * 3); ctx.lineTo(lx + len, ly + (r() - 0.5) * 3); ctx.stroke(); lx += len + 6 + r() * 8; }
  }
  ctx.globalAlpha = 1;
  // holes
  for (const [hx, hy, hr] of holes) { ctx.fillStyle = C.bg1; ctx.beginPath(); for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, rr = hr * (0.7 + r() * 0.5); i ? ctx.lineTo(hx + Math.cos(a) * rr, hy + Math.sin(a) * rr) : ctx.moveTo(hx + Math.cos(a) * rr, hy + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
  ctx.restore();
  ctx.restore();
}

function panel(x, y, w, h, rr = 14) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, rr); ctx.fill(); }

// ---------- A: the prize and the book ----------
function scenePrize(t) {
  const a = 1 - seg(t, 8.9, 9.5);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.3, 1.0)), () => {
      font(600, 26); text('NOBEL PRIZE IN LITERATURE 2026', W / 2, 150, { color: C.gold, align: 'center', spacing: '3px' });
      font(700, 92); text('Anne Carson', W / 2, 240, { color: C.ink, align: 'center' });
      k.font(500, 40, HAND); text('Canadian poet and classicist, born 1950 in Toronto', W / 2, 310, { color: C.soft, align: 'center' });
    });
    // the book: a plain cream volume with Greek on the left page and English on the right
    A(eout(seg(t, 4.8, 5.6)), () => {
      const bx = 192, by = 360, bw = 480, bh = 260;
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; k.rrect(bx + 8, by + 10, bw, bh, 8); ctx.fill();
      ctx.fillStyle = C.parchment; k.rrect(bx, by, bw, bh, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(43,29,18,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + bw / 2, by + 10); ctx.lineTo(bx + bw / 2, by + bh - 10); ctx.stroke();
      font(500, 22); text('Greek', bx + bw / 4, by + 40, { color: C.pSoft, align: 'center' }); text('English', bx + (3 * bw) / 4, by + 40, { color: C.pSoft, align: 'center' });
      ctx.fillStyle = 'rgba(43,29,18,0.45)';
      for (let i = 0; i < 6; i++) { ctx.fillRect(bx + 36, by + 76 + i * 28, 110 + ((i * 53) % 60), 6); ctx.fillRect(bx + bw / 2 + 36, by + 76 + i * 28, 60 + ((i * 37) % 100), 6); }
      font(700, 34); text('If Not, Winter', W / 2, by + bh + 50, { color: C.ink, align: 'center' });
      font(500, 24); text('Fragments of Sappho · 2002', W / 2, by + bh + 88, { color: C.soft, align: 'center' });
    });
  });
}

// ---------- B: Sappho, 10,000 lines, 650 left; rolls give way to books ----------
const KEEP = (() => { let s = 650; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); const set = new Set(); while (set.size < SURVIVE) set.add(Math.floor(r() * LINES)); return set; })();
function sceneLines(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    A(1 - seg(t, 18.2, 18.7), () => {
      font(700, 60); text('Sappho', 80, 150, { color: C.ink });
      k.font(500, 36, HAND); text('Lesbos, around 600 BC', 330, 154, { color: C.soft });
      // 10,000 lines as a 100 × 100 grid of short strokes
      const x0 = 132, y0 = 205, cw = 6, ch = 4.6;
      const lost = eio(seg(t, 14.0, 16.6));
      for (let i = 0; i < LINES; i++) {
        const c = i % 100, r = Math.floor(i / 100), keep = KEEP.has(i);
        const shown = eout(seg(t, 9.6 + r * 0.025, 10.4 + r * 0.025));
        if (shown <= 0) continue;
        ctx.fillStyle = keep && lost > 0 ? C.gold : `rgba(243,234,214,${0.55 * shown * (keep ? 1 : 1 - lost * 0.85)})`;
        ctx.fillRect(x0 + c * cw, y0 + r * ch, cw - 1.6, 2.2);
      }
      font(600, 26); text('10,000 lines, one mark each', x0, y0 + 100 * ch + 36, { color: C.soft });
      A(seg(t, 14.6, 15.2), () => { text(`about ${SURVIVE} survive: ${(SURVIVE / LINES * 100).toFixed(1)}%`, x0 + 600, y0 + 100 * ch + 36, { color: C.gold, align: 'right' }); });
    });
    // rolls and books
    A(span(t, 18.4, 23.0, 0.5, 0.4), () => {
      // a papyrus roll that is not copied, and a parchment codex
      const p = eio(seg(t, 19.0, 21.8));
      ctx.save(); ctx.translate(250, 400);
      ctx.fillStyle = C.papyrus2; ctx.fillRect(-70, -110, 140, 220); ctx.fillStyle = C.papyrus; ctx.beginPath(); ctx.ellipse(0, -110, 70, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.papyrus2; ctx.beginPath(); ctx.ellipse(0, 110, 70, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1 - p * 0.75;
      ctx.restore();
      A(p, () => { ctx.fillStyle = 'rgba(31,21,13,0.65)'; ctx.fillRect(180, 290, 140, 230); });
      k.font(600, 34, HAND); text('papyrus roll', 250, 560, { color: C.soft, align: 'center' });
      // the arrow and the book
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(350, 400); ctx.lineTo(500, 400); ctx.stroke();
      ctx.fillStyle = C.soft; ctx.beginPath(); ctx.moveTo(512, 400); ctx.lineTo(496, 390); ctx.lineTo(496, 410); ctx.fill();
      ctx.fillStyle = '#7a4a2e'; k.rrect(540, 300, 200, 220, 8); ctx.fill();
      ctx.fillStyle = C.parchment; k.rrect(552, 310, 176, 200, 4); ctx.fill();
      ctx.fillStyle = 'rgba(43,29,18,0.4)'; for (let i = 0; i < 8; i++) ctx.fillRect(572, 334 + i * 20, 136, 5);
      k.font(600, 34, HAND); text('parchment book', 640, 560, { color: C.soft, align: 'center' });
      A(seg(t, 20.6, 21.2), () => { k.font(700, 36, HAND); text('Sappho: not copied', W / 2, 650, { color: C.terracotta, align: 'center' }); });
    });
  });
}

// ---------- C: quotations ----------
function sceneQuotes(t) {
  const a = span(t, 23.0, 36.6, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // a page of another writer's book, with a highlighted quotation
    const bx = 112, by = 130, bw = 640, bh = 560;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; k.rrect(bx + 8, by + 10, bw, bh, 6); ctx.fill();
    ctx.fillStyle = C.parchment; k.rrect(bx, by, bw, bh, 6); ctx.fill();
    const who = t < 32.2 ? 'On the Sublime · “Longinus” · 1st century AD' : 'On Composition · Dionysius of Halicarnassus';
    font(600, 24); text(who, W / 2, by + 44, { color: C.pSoft, align: 'center' });
    ctx.fillStyle = 'rgba(43,29,18,0.30)';
    for (let i = 0; i < 13; i++) { if (i >= 4 && i <= 7) continue; ctx.fillRect(bx + 50, by + 96 + i * 34, bw - 100 - ((i * 47) % 90), 7); }
    // the quotation
    const q = t < 32.2 ? eout(seg(t, 27.8, 28.6)) : 1;
    if (t >= 23.4) {
      const hy = by + 96 + 4 * 34 - 18, hh = 4 * 34;
      ctx.fillStyle = `rgba(230,179,79,${0.20 + 0.15 * q})`; ctx.fillRect(bx + 36, hy, bw - 72, hh);
      if (t < 32.2) {
        A(q, () => {
          font(500, 31); text(GREEK_31, W / 2, hy + 44, { color: C.pInk, align: 'center' });
          font(500, 22); text('Sappho, fragment 31, line 1, in Greek', W / 2, hy + 96, { color: C.pSoft, align: 'center' });
        });
        A(1 - q, () => { ctx.fillStyle = 'rgba(43,29,18,0.45)'; for (let i = 0; i < 4; i++) ctx.fillRect(bx + 70, hy + 14 + i * 32, bw - 140, 6); });
      } else {
        // the whole Ode: seven stanzas as a block that runs on
        const g = eio(seg(t, 32.6, 35.0));
        ctx.fillStyle = 'rgba(43,29,18,0.55)';
        for (let i = 0; i < 4; i++) ctx.fillRect(bx + 70, hy + 14 + i * 32, (bw - 140) * clamp(g * 4 - i, 0, 1), 6);
        A(seg(t, 33.4, 34.0), () => { k.font(700, 38, HAND); text('the whole poem: 7 stanzas', W / 2, by + bh + 40, { color: C.gold, align: 'center' }); });
      }
    }
    A(span(t, 23.4, 27.6, 0.4, 0.4), () => { k.font(700, 38, HAND); text('quoted by other writers', W / 2, by + bh + 40, { color: C.gold, align: 'center' }); });
    A(span(t, 28.6, 32.2, 0.4, 0.3), () => { k.font(700, 38, HAND); text('quoted for its intensity', W / 2, by + bh + 40, { color: C.gold, align: 'center' }); });
  });
}

// ---------- D: papyrus from the rubbish dump ----------
function sceneDump(t) {
  const a = span(t, 36.8, 50.6, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // the desert and the mound
    ctx.fillStyle = '#5c4228'; ctx.fillRect(0, 560, W, 220);
    ctx.fillStyle = C.sand; ctx.beginPath(); ctx.moveTo(60, 640); ctx.quadraticCurveTo(W / 2, 360, 804, 640); ctx.lineTo(804, 700); ctx.lineTo(60, 700); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 40; i++) ctx.fillRect(80 + ((i * 97) % 700), 560 + ((i * 53) % 130), 24, 3);
    // scraps rising out of the sand
    const scraps = [[150, 230, 150, 110, 11, -0.12, 37.2], [330, 170, 190, 130, 23, 0.06, 37.8], [560, 220, 150, 120, 37, 0.14, 38.4], [240, 400, 120, 90, 41, -0.2, 42.0], [520, 390, 130, 95, 53, 0.1, 42.6], [400, 330, 100, 80, 61, -0.05, 43.2]];
    for (const [x, y, w, h, sd, rot, at] of scraps) {
      const p = eout(seg(t, at, at + 1.0));
      if (p <= 0) continue;
      A(p, () => scrap(x, lerp(560, y, p), w, h, sd, { lines: Math.floor(h / 36), holes: [[w * 0.6, h * 0.5, 14]], rot }));
    }
    A(seg(t, 41.4, 42.0), () => { panel(60, 100, 330, 64, 10); font(700, 30); text('Oxyrhynchus, Egypt', 82, 132, { color: C.ink }); });
    A(span(t, 46.0, 50.6, 0.4, 0.4), () => {
      panel(248, 596, 368, 108, 10);
      font(700, 30); text('2004', 272, 628, { color: C.gold }); font(500, 26); text('the Tithonus poem', 372, 628, { color: C.ink });
      font(700, 30); text('2014', 272, 674, { color: C.gold }); font(500, 26); text('parts of nine poems', 372, 674, { color: C.ink });
    });
  });
}

// ---------- E: guess, or show the gap ----------
function sceneBrackets(t) {
  const a = span(t, 50.6, 64.6, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    if (t < 55.4) {
      // a torn scrap, and two ways to read it
      scrap(220, 140, 420, 260, 77, { lines: 6, holes: [[90, 90, 34], [300, 160, 46], [200, 230, 30]] });
      A(seg(t, 51.8, 52.4), () => {
        panel(80, 450, 330, 200, 14); panel(454, 450, 330, 200, 14);
        k.font(700, 40, HAND); text('guess the words', 245, 494, { color: C.terracotta, align: 'center' });
        text('show the gap', 619, 494, { color: C.blue, align: 'center' });
        font(500, 28);
        text('the lost words', 245, 560, { color: C.soft, align: 'center' }); text('filled in by the', 245, 596, { color: C.soft, align: 'center' }); text('translator', 245, 632, { color: C.soft, align: 'center' });
        text('a mark where', 619, 560, { color: C.soft, align: 'center' }); text('the papyrus', 619, 596, { color: C.soft, align: 'center' }); text('is torn', 619, 632, { color: C.soft, align: 'center' });
      });
    } else {
      // Carson's page: brackets and white space
      const bx = 182, by = 120, bw = 500, bh = 570;
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; k.rrect(bx + 8, by + 10, bw, bh, 6); ctx.fill();
      ctx.fillStyle = C.parchment; k.rrect(bx, by, bw, bh, 6); ctx.fill();
      font(600, 24); text('fragment 22, as Carson prints it', W / 2, by + 44, { color: C.pSoft, align: 'center' });
      FR22.forEach((line, i) => {
        const g = eout(seg(t, 55.6 + i * 0.4, 56.2 + i * 0.4)), y = by + 120 + i * 58;
        A(g, () => {
          const title = line === 'if not, winter';
          const glow = title ? seg(t, 60.0, 60.8) : 0;
          font(title ? 700 : 500, title ? 46 : 40);
          const x = bx + 80;
          if (line.startsWith(']')) {
            text(']', x, y, { color: C.blue });
            ctx.font = ctx.font; text(line.slice(1), x + 22, y, { color: C.pInk });
          } else {
            text(line, x + 40, y, { color: glow > 0 ? C.terracotta : C.pInk });
          }
        });
      });
      A(seg(t, 57.0, 57.6), () => { k.font(700, 36, HAND); text('each ] is a gap', bx + bw - 30, by + 178, { color: C.blue, align: 'right' }); });
    }
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [SERIF, HAND],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    scenePrize(t);
    sceneLines(t);
    sceneQuotes(t);
    sceneDump(t);
    sceneBrackets(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 42, lh: 50, weight: 600, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.terracotta, '^': C.blue } });
  },
});
