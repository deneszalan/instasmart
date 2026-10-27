// Explainer for body-bepirovirsen-antisense-hepatitis-b: how an antisense drug works, told through the US
// approval of bepirovirsen (Hibsago) for chronic hepatitis B on 20 October 2026. Look: a liver cell in deep plum,
// the virus's RNA messages in coral, the drug's strand in mint, the cutting enzyme in warm yellow and the virus's
// surface protein in lilac; genetic letters as tiles that zip together. Outfit (a crisp geometric sans) for
// captions and labels, Lora (a calligraphic serif) for names and headings.
//
// Facts: GSK, "Hibsago (bepirovirsen) approved in the US for the treatment of chronic hepatitis B (CHB)"
// (20 October 2026): FDA approval for adults without cirrhosis on nucleos(t)ide analogue therapy for at least
// 6 months, with suppressed HBV DNA and HBsAg ≤3000 IU/ml; a first-in-class antisense oligonucleotide; pooled
// B-Well phase III: functional cure 19% (233 of 1,220) vs 0 of 614 on placebo; 26% (200 of 768) vs 0 of 393 with
// HBsAg ≤1000 IU/ml; functional cure = HBV DNA and HBsAg undetectable for at least 24 weeks after stopping all
// treatment, the disease controlled by the immune system; standard care typically achieves under 1% functional
// cure after a year; bepirovirsen reduces viral RNA and proteins and may let the immune system regain control.
// US prescribing information: an HBV mRNA-directed ASO used with NrtI (nucleos(t)ide analog reverse
// transcriptase inhibitor) therapy; 300 mg twice a week in weeks 1–2, then once a week to week 24; section 11 gives
// its sequence (5'-GCAGAGGTGAAGCGAAGTGC-3'); 12.4: a gapmer with five 2'-MOE-modified nucleotides on each wing
// around a central gap of 10 deoxynucleotides; it binds a conserved 20-nucleotide site (nt 1581–1600,
// 5'-GCACTTCGCTTCACCTCTGC-3') in HBV mRNAs, including pgRNA and the S mRNAs, forming a DNA:RNA duplex that
// recruits RNase H1 to cut the viral RNA, which reduces HBV DNA and viral proteins including HBsAg; the site is in
// transcripts from both cccDNA and integrated HBV DNA; the site is identical in 97.6% of 9,139 HBV genomes (99.7%
// allowing one mismatch).
//
// Scene plan (64.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The approval; an antisense strand.
//  B  9.2–23.0  A liver cell: viral genes in the nucleus, RNA messages, surface protein; pills block copying only.
//  C 23.0–50.6  Letters pair; the 20-letter strand meets its target; RNase H1 cuts; the DNA gap; conserved site.
//  D 50.6–64.4  Fewer messages; 24 weeks; 19% vs 0%; 26% with less protein at the start.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#1c1430', bg2: '#2a1d44', ink: '#f4effb', soft: 'rgba(244,239,251,0.74)', faint: 'rgba(244,239,251,0.30)',
  rna: '#ff8fa3', aso: '#7ee0c3', wing: '#4fb3a0', enzyme: '#ffd166', protein: '#b9a6ff', dna: '#8ecbff',
  cell: 'rgba(185,166,255,0.10)', membrane: 'rgba(185,166,255,0.45)', panel: 'rgba(16,10,30,0.82)', line: 'rgba(244,239,251,0.16)',
};
const SANS = 'Outfit', SERIF = 'Lora';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the sequences (US label) ----------
const TARGET_DNA = 'GCACTTCGCTTCACCTCTGC'; // HBV nt 1581–1600, 5'→3'
const TARGET = TARGET_DNA.replace(/T/g, 'U'); // as RNA
const DRUG = 'GCAGAGGTGAAGCGAAGTGC'; // bepirovirsen, 5'→3'
const PAIR = { A: 'U', C: 'G', G: 'C', T: 'A', U: 'A' };
/** The drug written 3'→5' under the target, letter by letter: each must pair with the RNA letter above it. */
const DRUG_UNDER = [...DRUG].reverse();
const pairs = (a, b) => (a === 'A' && (b === 'T' || b === 'U')) || ((a === 'U' || a === 'T') && b === 'A') || (a === 'G' && b === 'C') || (a === 'C' && b === 'G');
const ALL_PAIR = [...TARGET].every((x, i) => pairs(x, DRUG_UNDER[i]));
if (!ALL_PAIR) throw new Error('the drug does not pair with its target');
void PAIR;

const CURED = 233, TREATED = 1220, PLACEBO = 614, CURED_LOW = 200, TREATED_LOW = 768;
const RATE = Math.round((CURED / TREATED) * 100), RATE_LOW = Math.round((CURED_LOW / TREATED_LOW) * 100); // 19, 26
const GENOMES = 9139, MATCH = 97.6;

const CUES = [
  [0.4, 4.6, 'On 20 October 2026, the US Food and Drug Administration approved *bepirovirsen* for chronic hepatitis B.'],
  [4.8, 9.0, 'It is the first *antisense* drug for the disease: a short strand that matches the virus’s own genes.'],
  [9.2, 13.6, 'Hepatitis B virus keeps its genes in the nuclei of liver cells, which go on making viral *RNA* messages.'],
  [13.8, 18.2, 'The cell reads those messages to build virus parts, like a *surface protein* that floods the blood.'],
  [18.4, 22.8, 'Standard pills block the enzyme that copies the virus. But the ~messages~ and the protein keep coming.'],
  [23.0, 27.4, 'Genetic letters pair up: *A* with *U* (or T), and *G* with *C*.'],
  [27.6, 32.0, 'Bepirovirsen is 20 letters long: the exact partner of one stretch of the virus’s ~RNA~.'],
  [32.2, 36.6, 'It zips onto that stretch, and the cell’s own cutting enzyme, *RNase H1*, slices the viral RNA.'],
  [36.8, 41.2, 'Its middle 10 letters are DNA, the part the enzyme recognises; the 5 at each end are modified.'],
  [41.4, 45.8, `Its target is identical in *${MATCH}%* of ${GENOMES.toLocaleString('en-US')} hepatitis B genomes checked, across strains.`],
  [46.0, 50.4, 'With the messages cut up, the cells make less virus DNA and less *surface protein*.'],
  [50.6, 55.0, 'In two trials, adults had a weekly injection for *24 weeks*, on top of their usual pills.'],
  [55.2, 59.6, `*${RATE}%* had no detectable virus DNA or surface protein 24 weeks after stopping. On placebo: ~0~.`],
  [59.8, 64.2, `It worked best with less protein at the start: *${RATE_LOW}%*. The aim is an immune system back in control.`],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 380, 40, W / 2, 420, 700);
  rg.addColorStop(0, C.bg2); rg.addColorStop(1, C.bg);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2200; i++) { g.fillStyle = `rgba(244,239,251,${r() * 0.03})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
}

// ---------- letter tiles ----------
function tile(ch, x, y, size, color, { fill = 0.18, textColor = C.ink } = {}) {
  ctx.fillStyle = color; ctx.globalAlpha *= 1;
  ctx.save(); ctx.globalAlpha *= fill; k.rrect(x - size / 2, y - size / 2, size, size, size * 0.2); ctx.fill(); ctx.restore();
  ctx.strokeStyle = color; ctx.lineWidth = 2; k.rrect(x - size / 2, y - size / 2, size, size, size * 0.2); ctx.stroke();
  font(700, size * 0.56); text(ch, x, y + 1, { color: textColor, align: 'center' });
}
/** A strand of tiles from x0 with spacing dx; colorAt(i) picks each tile's colour. */
function strand(seq, x0, y, dx, size, colorAt, opts = {}) {
  [...seq].forEach((ch, i) => tile(ch, x0 + i * dx, y, size, colorAt(i), opts));
}

// ---------- A: the approval ----------
function hook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.4, 1.2)), () => {
      font(600, 26); text('approved in the US, 20 October 2026', W / 2, 170, { color: C.soft, align: 'center' });
      font(700, 76, SERIF); text('bepirovirsen', W / 2, 260, { color: C.aso, align: 'center' });
      font(500, 26); text('sold as Hibsago · for chronic hepatitis B', W / 2, 330, { color: C.soft, align: 'center' });
    });
    // the strand assembles, letter by letter
    const dx = 36, x0 = W / 2 - (19 * dx) / 2, n = Math.floor(20 * eio(seg(t, 1.6, 4.4)));
    strand(DRUG.slice(0, n), x0, 470, dx, 32, (i) => (i < 5 || i >= 15 ? C.wing : C.aso));
    A(seg(t, 4.6, 5.2), () => {
      font(500, 22);
      text("5'", x0 - 34, 470, { color: C.faint, align: 'center' }); text("3'", x0 + 19 * dx + 34, 470, { color: C.faint, align: 'center' });
      text('20 genetic letters, made in a lab', W / 2, 530, { color: C.soft, align: 'center' });
    });
    A(seg(t, 5.6, 6.2), () => {
      ctx.fillStyle = C.panel; k.rrect(172, 600, 520, 86, 18); ctx.fill();
      font(600, 30, SERIF); text('anti-sense: the mirror match', W / 2, 632, { color: C.ink, align: 'center' });
      font(500, 22); text('of the virus’s message (its “sense”)', W / 2, 666, { color: C.soft, align: 'center' });
    });
  });
}

// ---------- B: the cell ----------
const NUC = { x: 300, y: 440, r: 120 };
/** A wavy RNA message from (x, y), length len, angle 0. */
function message(x, y, len, color = C.rna, wob = 0) {
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) { const u = i / 20, xx = x + u * len, yy = y + Math.sin(u * 9 + wob) * 6; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
  ctx.stroke();
}
function protein(x, y, r = 11, color = C.protein) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); }
  ctx.closePath(); ctx.fill();
}
/** The cell: messages leave the nucleus every `every` seconds (Infinity: none), proteins leave the cell. */
function cell(t, { messages = 1, cutFrom = Infinity, showBlock = false } = {}) {
  // membrane
  ctx.fillStyle = C.cell; ctx.strokeStyle = C.membrane; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(400, 440, 330, 250, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // nucleus with the viral DNA ring
  ctx.fillStyle = 'rgba(142,203,255,0.10)'; ctx.strokeStyle = 'rgba(142,203,255,0.5)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(NUC.x, NUC.y, NUC.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = C.dna; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(NUC.x - 10, NUC.y, 34, 0, Math.PI * 2); ctx.stroke();
  font(500, 20); text('viral DNA', NUC.x - 10, NUC.y + 58, { color: C.dna, align: 'center' });
  font(500, 20); text('nucleus', NUC.x, NUC.y - NUC.r - 18, { color: C.soft, align: 'center' });
  // messages flowing out, proteins following to the right edge
  const period = 0.42;
  for (let i = -4; i < 14; i++) {
    const born = Math.floor(t / period) * period - i * period;
    const age = t - born;
    if (age < 0 || age > 4.2) continue;
    const n = Math.round(born / period);
    const keep = (((n * 7919) % 100) + 100) % 100 / 100 < messages;
    if (!keep) continue;
    const lane = (((n * 37) % 7) + 7) % 7 - 3;
    const x = NUC.x + 60 + age * 80, y = NUC.y + lane * 30;
    const cut = born > cutFrom;
    if (age < 2.2) {
      if (cut && age > 1.0) { // broken into pieces that fade
        A(1 - seg(age, 1.0, 2.0), () => { message(x, y, 26, C.rna, born); message(x + 40, y + 6, 26, C.rna, born + 1); });
      } else message(x, y, 60, C.rna, born);
    } else if (!cut) {
      protein(lerp(NUC.x + 60 + 2.2 * 80 + 30, 830, seg(age, 2.2, 4.2)), y - 8 + Math.sin(born * 3) * 10, 12);
    }
  }
  if (showBlock) {
    // copying back into DNA, blocked by the pills
    const bx = 470, by = 270;
    ctx.strokeStyle = C.faint; ctx.lineWidth = 4; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(bx, by + 40); ctx.quadraticCurveTo(bx - 60, by - 30, NUC.x + 70, NUC.y - 110); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.panel; ctx.beginPath(); ctx.arc(bx - 40, by - 4, 30, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.rna; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(bx - 40, by - 4, 24, 0, Math.PI * 2); ctx.moveTo(bx - 57, by + 13); ctx.lineTo(bx - 23, by - 21); ctx.stroke();
    font(500, 20); text('copying into new virus DNA:', bx + 10, by - 30, { color: C.soft, align: 'left' });
    text('blocked by standard pills', bx + 10, by - 4, { color: C.rna, align: 'left' });
  }
  font(500, 20); text('blood', 790, 640, { color: C.soft, align: 'center' });
}
function inside(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('a liver cell infected with hepatitis B virus', W / 2, 140, { color: C.soft, align: 'center' });
    cell(t, { messages: t < 9.8 ? 0 : 1, showBlock: t > 18.6 });
    A(seg(t, 10.4, 11.0) * (1 - seg(t, 13.6, 14.0)), () => { font(600, 24); text('RNA messages', 560, 330, { color: C.rna, align: 'center' }); });
    A(seg(t, 14.6, 15.2) * (1 - seg(t, 18.2, 18.6)), () => { font(600, 24); text('surface protein', 650, 320, { color: C.protein, align: 'center' }); });
  });
}

// ---------- C: pairing ----------
function pairing(t) {
  const a = span(t, 23.0, 27.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('the four letters and their partners', W / 2, 160, { color: C.soft, align: 'center' });
    const rows = [['A', 'U'], ['U', 'A'], ['G', 'C'], ['C', 'G']];
    rows.forEach(([x, y], i) => {
      const g = eout(seg(t, 23.4 + i * 0.4, 24.0 + i * 0.4));
      const cx = 200 + i * 155;
      A(g, () => {
        tile(x, cx, 310, 84, C.rna);
        tile(y, cx, lerp(520, 400, eio(seg(t, 24.6 + i * 0.4, 25.4 + i * 0.4))), 84, C.aso);
      });
    });
    A(seg(t, 25.8, 26.4), () => { font(500, 22); text('in DNA, T takes the place of U', W / 2, 620, { color: C.soft, align: 'center' }); });
  });
}
const DX = 37, SIZE = 33, X0 = W / 2 - (19 * DX) / 2, RNA_Y = 330;
/** The viral RNA with the drug below it; zip: 0 apart, 1 paired; cut: 0 whole, 1 cut and drifting apart. */
function duplex(t, { zip = 0, cut = 0, highlightGap = 0 }) {
  // flanking viral RNA beyond the 20 letters, drawn as plain line
  ctx.strokeStyle = C.rna; ctx.lineWidth = 5;
  const shift = 40 * cut;
  ctx.beginPath(); ctx.moveTo(30, RNA_Y); ctx.lineTo(X0 - DX / 2 - shift, RNA_Y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X0 + 19 * DX + DX / 2 + shift, RNA_Y); ctx.lineTo(834, RNA_Y); ctx.stroke();
  [...TARGET].forEach((ch, i) => {
    const off = cut ? (i < 10 ? -shift : shift) : 0;
    A(1 - 0.6 * cut, () => tile(ch, X0 + i * DX + off, RNA_Y - (cut ? 24 * cut : 0), SIZE, C.rna));
  });
  const dy = lerp(560, RNA_Y + SIZE + 6, zip);
  DRUG_UNDER.forEach((ch, i) => {
    const gap = i >= 5 && i < 15;
    const col = gap ? C.aso : C.wing;
    A(highlightGap ? (gap ? 1 : 0.55 + 0.45 * (1 - highlightGap)) : 1, () => tile(ch, X0 + i * DX, dy + (zip < 1 ? Math.sin(i * 0.7) * 10 * (1 - zip) : 0), SIZE, col));
  });
  font(500, 20);
  text('viral RNA', 40, RNA_Y - 40, { color: C.rna, align: 'left' });
  A(1 - highlightGap, () => text('bepirovirsen', 40, dy + 46, { color: C.aso, align: 'left' }));
}
function target(t) {
  const a = span(t, 27.6, 46.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const zip = eio(seg(t, 32.4, 34.0));
    const cut = eio(seg(t, 35.0, 36.0)) * (1 - seg(t, 36.6, 37.2));
    const hl = seg(t, 37.0, 37.6) * (1 - seg(t, 41.0, 41.4));
    if (t < 41.4) A(1 - seg(t, 41.0, 41.4), () => { font(600, 26); text('a 20-letter stretch of the virus’s RNA', W / 2, 160, { color: C.soft, align: 'center' }); });
    if (t < 41.4) duplex(t, { zip: t > 36.6 ? 1 : zip, cut, highlightGap: hl });
    // pairing lines
    if (zip > 0.98 && cut === 0 && t < 41.4) {
      ctx.strokeStyle = 'rgba(244,239,251,0.35)'; ctx.lineWidth = 2;
      for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.moveTo(X0 + i * DX, RNA_Y + SIZE / 2); ctx.lineTo(X0 + i * DX, RNA_Y + SIZE + 6 - SIZE / 2); ctx.stroke(); }
    }
    // RNase H1 arrives and cuts
    const ex = lerp(W + 80, W / 2, eout(seg(t, 34.0, 34.9)));
    if (t > 34.0 && t < 36.8) {
      A(1 - seg(t, 36.2, 36.8), () => {
        ctx.fillStyle = C.enzyme; ctx.beginPath();
        const m = 0.35 + 0.25 * Math.abs(Math.sin(t * 9));
        ctx.moveTo(ex, 250); ctx.arc(ex, 250, 46, -Math.PI / 2 + m, Math.PI * 1.5 - m); ctx.closePath(); ctx.fill();
        font(700, 24); text('RNase H1', ex + 60, 250, { color: C.enzyme, align: 'left' });
      });
    }
    A(seg(t, 35.4, 35.8) * (1 - seg(t, 36.4, 36.8)), () => { font(700, 30); text('snip', W / 2, 460, { color: C.enzyme, align: 'center' }); });
    // the gap and the wings
    A(hl, () => {
      ctx.strokeStyle = C.aso; ctx.lineWidth = 3;
      const y = RNA_Y + SIZE + 6 + SIZE / 2 + 14;
      const bracket = (i0, i1, label, color) => {
        const xa = X0 + i0 * DX - SIZE / 2, xb = X0 + i1 * DX + SIZE / 2;
        ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xa, y + 12); ctx.lineTo(xb, y + 12); ctx.lineTo(xb, y); ctx.stroke();
        font(600, 22); text(label, (xa + xb) / 2, y + 40, { color, align: 'center' });
      };
      bracket(0, 4, '5 modified', C.wing); bracket(5, 14, '10 DNA letters', C.aso); bracket(15, 19, '5 modified', C.wing);
      font(500, 22); text('the enzyme cuts RNA paired with DNA', W / 2, 560, { color: C.soft, align: 'center' });
    });
    // conserved across 9,139 genomes
    if (t > 41.4) {
      A(seg(t, 41.4, 41.9), () => {
        const cols = 96, cell = 4.2, x0 = W / 2 - (cols * cell) / 2, y0 = 220;
        const shown = Math.floor(GENOMES * eio(seg(t, 41.6, 43.6)));
        const match = Math.round((GENOMES * MATCH) / 100);
        for (let i = 0; i < shown; i++) {
          ctx.fillStyle = i < match ? C.aso : C.rna;
          ctx.fillRect(x0 + (i % cols) * cell, y0 + Math.floor(i / cols) * cell, cell - 0.8, cell - 0.8);
        }
        font(600, 24); text(`${GENOMES.toLocaleString('en-US')} hepatitis B genomes, one square each`, W / 2, 190, { color: C.soft, align: 'center' });
        A(seg(t, 43.6, 44.2), () => {
          font(700, 26); text(`${MATCH}%: the exact 20-letter target`, W / 2, 660, { color: C.aso, align: 'center' });
          font(500, 22); text('99.7% with at most one letter different', W / 2, 700, { color: C.soft, align: 'center' });
        });
      });
    }
  });
}
function fewer(t) {
  const a = span(t, 46.0, 50.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('with bepirovirsen in the cell', W / 2, 140, { color: C.soft, align: 'center' });
    cell(t, { messages: 1, cutFrom: 44.0 });
    // drug strands drifting about
    for (let i = 0; i < 6; i++) {
      const x = 470 + ((i * 97) % 220) + Math.sin(t * 1.3 + i) * 12, y = 330 + ((i * 61) % 220) + Math.cos(t + i) * 10;
      ctx.strokeStyle = C.aso; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 26, y); ctx.stroke();
    }
  });
}

// ---------- D: the trials ----------
function weeks(t) {
  const a = span(t, 50.6, 55.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('one course: 24 weeks of injections', W / 2, 160, { color: C.soft, align: 'center' });
    const cols = 8, cw = 82, x0 = W / 2 - (cols * cw) / 2, y0 = 230;
    const shown = Math.floor(24 * eio(seg(t, 51.0, 53.4)));
    for (let w = 0; w < 24; w++) {
      const x = x0 + (w % cols) * cw, y = y0 + Math.floor(w / cols) * 110;
      ctx.strokeStyle = C.line; ctx.lineWidth = 2; k.rrect(x + 4, y, cw - 8, 92, 12); ctx.stroke();
      font(500, 20); text(`week ${w + 1}`, x + cw / 2, y + 20, { color: C.soft, align: 'center' });
      if (w < shown) {
        const n = w < 2 ? 2 : 1;
        for (let j = 0; j < n; j++) { ctx.fillStyle = C.aso; ctx.beginPath(); ctx.arc(x + cw / 2 + (n === 2 ? (j ? 14 : -14) : 0), y + 56, 11, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    A(seg(t, 53.4, 54.0), () => { font(500, 22); text('twice a week at first, then weekly, with the usual pills', W / 2, 600, { color: C.soft, align: 'center' }); });
  });
}
function people(cx, y0, lit, color, label, sub, t0, t) {
  const cols = 10, s = 30;
  const shown = Math.round(lit * eio(seg(t, t0, t0 + 1.6)));
  for (let i = 0; i < 100; i++) {
    const x = cx - (cols * s) / 2 + (i % cols) * s + s / 2, y = y0 + Math.floor(i / cols) * s;
    ctx.fillStyle = i < shown ? color : 'rgba(244,239,251,0.14)';
    ctx.beginPath(); ctx.arc(x, y - 5, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 8, y + 10); ctx.quadraticCurveTo(x, y - 2, x + 8, y + 10); ctx.closePath(); ctx.fill();
  }
  font(700, 30); text(label, cx, y0 - 50, { color, align: 'center' });
  font(500, 21); text(sub, cx, y0 + 10 * s + 14, { color: C.soft, align: 'center' });
}
function results(t) {
  const a = span(t, 55.2, 59.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('functional cure, 24 weeks after stopping all treatment', W / 2, 140, { color: C.soft, align: 'center' });
    people(230, 250, RATE, C.aso, `${RATE}%`, `${CURED} of ${TREATED.toLocaleString('en-US')} on the drug`, 55.6, t);
    people(634, 250, 0, C.rna, '0%', `0 of ${PLACEBO} on placebo`, 55.6, t);
  });
}
function lower(t) {
  const a = eout(seg(t, 59.8, 60.4));
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('functional cure by surface protein at the start', W / 2, 140, { color: C.soft, align: 'center' });
    const L = 300, R = 760, rows = [['up to 3,000 units per mL', CURED, TREATED], ['up to 1,000 units per mL', CURED_LOW, TREATED_LOW]];
    rows.forEach(([name, c, n], i) => {
      const y = 270 + i * 150, g = eio(seg(t, 60.2 + i * 0.5, 61.2 + i * 0.5)), v = c / n;
      font(600, 24); text(name, L - 20, y, { align: 'right' });
      ctx.fillStyle = 'rgba(244,239,251,0.08)'; k.rrect(L, y - 30, R - L, 60, 12); ctx.fill();
      ctx.fillStyle = C.aso; k.rrect(L, y - 30, (R - L) * v * g * 2.5, 60, 12); ctx.fill();
      font(700, 30); text(`${Math.round(v * 100 * g)}%`, L + (R - L) * v * g * 2.5 + 14, y, { color: C.aso, align: 'left' });
      font(500, 20); text(`${c} of ${n}`, L + 6, y + 50, { color: C.soft, align: 'left' });
    });
    font(500, 22); text('bars run from 0 to 40%; on placebo, 0% in both groups', W / 2, 590, { color: C.soft, align: 'center' });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.4, fonts: [SANS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    hook(t);
    inside(t);
    pairing(t);
    target(t);
    fewer(t);
    weeks(t);
    results(t);
    lower(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.aso, '~': C.rna } });
  },
});
