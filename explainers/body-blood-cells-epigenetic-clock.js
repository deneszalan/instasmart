// Explainer for body-blood-cells-epigenetic-clock: on 9 October 2026 the University of Bonn reported that red blood
// cell precursors from an 80-year-old, converted directly into neural stem cells, read as under 20 years old on
// epigenetic clocks. The scene explains what an epigenetic clock is (methyl tags at CpG sites that drift with age,
// read by Horvath's 353-site formula), why reprogramming resets it, and what was new here: the reset happened
// without passing through pluripotency, and slowly. Look: deep plum, cream ink, coral methyl tags, a gold dial,
// mint for "young". Outfit for headings and numbers, Alegreya for the captions.
//
// Facts:
// - University of Bonn news, 9 October 2026, "Researchers transform old blood cells into young brain cells":
//   red blood cell precursors from an 80-year-old were reprogrammed directly into neural stem cells, without a
//   pluripotent stage; by epigenetic clocks their molecular age was under 20; rejuvenation was gradual and could be
//   tracked for over 100 days (Brüstle). Aging Cell 25(10) e70751, Berg, Franzen, Buness, Konang, Sheng, Peitz,
//   Till, Wagner, Brüstle.
// - The paper's abstract and text (PubMed 42829448 / PMC13634082): erythroid progenitors from 15 donors aged 0 to
//   101 were converted with SOX2 and cMYC (Sendai virus); iNSCs from older donors kept on average about 13% of
//   donor age at low passage and 5% at high passage; most age-related methylation signatures were reset after
//   about 50 days; de-ageing continued under proliferation-inhibiting conditions; iPS-derived NSCs from the same
//   cells showed an embryonic-like epigenetic age; the clocks used were Horvath's 2013 and 2018 clocks.
// - Wikipedia, "Epigenetic clock": Horvath 2013 used 353 CpG sites, about 8,000 samples from 82 datasets and 51
//   tissues and cell types, median error 3.6 years, correlation 0.96 with age; 193 sites gain methylation with age
//   and 160 lose it; DNAm age is near zero for embryonic and induced pluripotent stem cells.
// Computed here: a toy clock of 16 made-up sites whose methylation drifts linearly with age, read back by least
// squares (so the dial really reads the marks), and a schematic retention curve for the slow reset.
//
// Scene plan (60 s). Captions are centred at y = 846; everything important stays above y = 770.
//  A  0.0– 9.2  The hook: blood cells, 80, become neural stem cells, under 20.
//  B  9.4–27.6  The clock: tags at CpG sites drift with age; Horvath's 353 sites; 3.6 years across 51 tissues.
//  C 27.8–36.8  Two routes: via pluripotent cells (reset at once) and direct (the Bonn way).
//  D 37.0–50.6  The slow reset: a schematic time course, 15 donors, no division needed.
//  E 50.8–60.0  Why slow is useful; caveats.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#1b1030', bg2: '#09060f', ink: '#f6efe6', soft: 'rgba(246,239,230,0.72)', faint: 'rgba(246,239,230,0.24)', line: 'rgba(246,239,230,0.14)',
  strand: '#9b8fc4', tag: '#ff7a8a', dial: '#f4c95d', young: '#7ee0c3', blood: '#d1495b', panel: 'rgba(0,0,0,0.35)',
};
const HEAD = 'Outfit', TXT = 'Alegreya';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the numbers ----------
const DONOR = 80, UNDER = 20, OLDEST = 101, DONORS = 15;
const SITES_H = 353, TISSUES = 51, ERR = 3.6, SAMPLES = 8000, DATASETS = 82, GAIN = 193, LOSE = 160;
const LOW_PASSAGE = 0.13, HIGH_PASSAGE = 0.05, RESET_DAYS = 50, TRACKED = 100;
// a toy clock: 16 made-up CpG sites, each with a methylated share at birth and a drift per year
const SITES = [
  [0.12, 0.0068], [0.82, -0.0061], [0.2, 0.0055], [0.9, -0.0072], [0.08, 0.0049], [0.76, -0.0044], [0.25, 0.0071], [0.85, -0.0058],
  [0.15, 0.0036], [0.8, -0.0066], [0.1, 0.0063], [0.88, -0.005], [0.18, 0.006], [0.78, -0.0052], [0.22, 0.0045], [0.84, -0.0069],
];
const profile = (age, keep = 1) => SITES.map(([s, d]) => clamp(s + d * age * keep, 0, 1));
const readAge = (p) => { let n = 0, d = 0; SITES.forEach(([s, dr], i) => { n += (p[i] - s) * dr; d += dr * dr; }); return n / d; };
// a schematic retention curve for the direct route: a fifth of the marks after seven weeks, 5% at the end
const retained = (days) => 0.05 + 0.95 * Math.exp(-days / 27);
if (Math.abs(readAge(profile(DONOR)) - DONOR) > 1e-9) throw new Error('the toy clock should read the age back');

const CUES = [
  [0.4, 4.6, `On 9 October, researchers in Bonn reported turning blood cells from an *${DONOR}-year-old* into brain stem cells.`],
  [4.8, 9.2, `By the molecular clock in their DNA, the new cells read as ^under ${UNDER}^ years old. How can a cell have an age?`],
  [9.4, 13.8, 'DNA carries small chemical tags, methyl groups, at sites called ~CpG~. They don’t change the code; they tune which genes are read.'],
  [14.0, 18.4, 'With age, tags appear at some sites and vanish from others, in a slow, steady drift.'],
  [18.6, 23.0, `In 2013 Steve Horvath picked *${SITES_H}* such sites and fitted a formula: their methylation gives an age.`],
  [23.2, 27.6, `Across ${TISSUES} tissues, the clock’s median error was ^${ERR} years^. Blood, brain, skin: all tick together.`],
  [27.8, 32.2, 'Embryonic stem cells read near zero. Reprogramming adult cells into stem cells resets the clock too.'],
  [32.4, 36.8, 'The Bonn team skipped that stage: two factors, SOX2 and cMYC, turned blood precursors straight into neural stem cells.'],
  [37.0, 41.4, `The clock still reset, but slowly: most age marks were gone after about *${RESET_DAYS} days*, and the drift went on past ${TRACKED}.`],
  [41.6, 46.0, `Fifteen donors, newborn to ${OLDEST}. On average the new cells kept ~${Math.round(LOW_PASSAGE * 100)}%~ of their donor’s age; after longer culture, ${Math.round(HIGH_PASSAGE * 100)}%.`],
  [46.2, 50.6, 'The de-ageing went on even when the cells were stopped from dividing, so copying DNA is not what wipes the marks.'],
  [50.8, 55.2, 'A slow reset is a window: a model for finding what speeds up or slows down rejuvenation.'],
  [55.4, 60.0, 'Caveats: cells in a dish, not a person. The clock counts marks; what the marks do for a cell is still being worked out.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(246,239,230,0.045)';
  for (let i = 0; i < 160; i++) { const x = (i * 197) % W, y = (i * 311) % H; g.beginPath(); g.arc(x, y, 1.5 + (i % 3), 0, 7); g.fill(); }
}

// ---------- pieces ----------
/** A gauge from 0 to 101 years: an arc with a needle at `age`. */
function gauge(x, y, r, age, col, a = 1) {
  A(a, () => {
    ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.strokeStyle = C.line; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 2 * Math.PI); ctx.stroke();
    const ang = Math.PI + Math.PI * clamp(age / OLDEST, 0, 1);
    ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, ang); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r - 18) * Math.cos(ang), y + (r - 18) * Math.sin(ang)); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill();
    font(500, 18, TXT); text('0', x - r, y + 24, { align: 'center', color: C.faint }); text(String(OLDEST), x + r, y + 24, { align: 'center', color: C.faint });
    font(700, 40); text(`${Math.max(0, Math.round(age))}`, x, y + 44, { align: 'center', color: col });
    font(500, 18, TXT); text('years, by the clock', x, y + 76, { align: 'center', color: C.soft });
  });
}
/** A blood precursor: a red disc with a dimple. */
function bloodCell(x, y, r, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.blood; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, 7); ctx.fill();
  });
}
/** A neural stem cell: a mint body with short branches. */
function neuralCell(x, y, r, a = 1) {
  A(a, () => {
    ctx.strokeStyle = C.young; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const ang = i * 1.26 + 0.4; ctx.beginPath(); ctx.moveTo(x + r * 0.8 * Math.cos(ang), y + r * 0.8 * Math.sin(ang)); ctx.lineTo(x + r * 1.7 * Math.cos(ang), y + r * 1.7 * Math.sin(ang)); ctx.stroke(); }
    ctx.lineCap = 'butt';
    ctx.fillStyle = C.young; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(x, y, r * 0.4, 0, 7); ctx.fill();
  });
}
function arrowRight(x0, x1, y, col = C.soft) {
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.moveTo(x1, y); ctx.lineTo(x1 - 14, y - 10); ctx.moveTo(x1, y); ctx.lineTo(x1 - 14, y + 10); ctx.stroke();
  ctx.lineCap = 'butt';
}
/** The DNA band with its 16 sites, filled by the methylated share in `p`. */
function dnaBand(y, p, x0 = 70, x1 = W - 70) {
  ctx.lineWidth = 3;
  for (const sgn of [1, -1]) {
    ctx.strokeStyle = C.strand; ctx.beginPath();
    for (let x = x0; x <= x1; x += 3) ctx.lineTo(x, y + sgn * 16 * Math.sin(((x - x0) / (x1 - x0)) * Math.PI * SITES.length));
    ctx.stroke();
  }
  SITES.forEach(([, d], i) => {
    const x = x0 + ((i + 0.5) / SITES.length) * (x1 - x0);
    ctx.fillStyle = 'rgba(246,239,230,0.12)'; ctx.beginPath(); ctx.arc(x, y, 15, 0, 7); ctx.fill();
    ctx.fillStyle = C.tag; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p[i]); ctx.closePath(); ctx.fill();
    font(600, 18); text(d > 0 ? '+' : '-', x, y + 36, { align: 'center', color: C.soft });
  });
}

// ---------- A: the hook ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.2, 9.6);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { font(600, 24); text('BONN · 9 OCTOBER 2026', CX, 136, { align: 'center', color: C.soft, spacing: '3px' }); });
    const p = eio(seg(t, 1.2, 3.6));
    bloodCell(220, 300, 54, 1);
    font(500, 22, TXT); text('blood cell precursor', 220, 390, { align: 'center', color: C.soft }); text(`donor aged ${DONOR}`, 220, 420, { align: 'center', color: C.blood });
    A(seg(t, 1.0, 1.6), () => arrowRight(310, 520, 300));
    neuralCell(644, 300, 54, p);
    A(p, () => { font(500, 22, TXT); text('neural stem cell', 644, 390, { align: 'center', color: C.soft }); text('direct conversion', 644, 420, { align: 'center', color: C.young }); });
    const age = lerp(DONOR, 12, eio(seg(t, 4.8, 8.0)));
    gauge(CX, 600, 140, age, age < UNDER ? C.young : C.dial, seg(t, 0.8, 1.4));
    A(seg(t, 5.0, 5.6), () => { font(600, 24); text(`molecular age: ${DONOR} to under ${UNDER}`, CX, 730, { align: 'center', color: C.dial }); });
  });
}

// ---------- B: the clock ----------
function sceneClock(t) {
  const a = span(t, 9.4, 27.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('THE EPIGENETIC CLOCK · A TOY VERSION', CX, 136, { align: 'center', color: C.soft, spacing: '2px' });
    const age = lerp(0, DONOR, eio(seg(t, 14.2, 18.0)));
    const p = profile(age);
    dnaBand(330, p);
    A(seg(t, 9.8, 10.4), () => {
      font(500, 22, TXT); text('each circle is a CpG site; the coral share is how often it carries a methyl tag', CX, 190, { align: 'center', color: C.soft });
      text('+ gains tags with age   - loses them', CX, 222, { align: 'center', color: C.faint });
    });
    A(seg(t, 13.8, 14.4), () => { font(600, 26); text(`age ${Math.round(age)}`, CX, 420, { align: 'center', color: C.tag }); });
    gauge(CX, 640, 100, readAge(p), C.dial, seg(t, 14.0, 14.6));
    A(seg(t, 18.8, 19.4) * (1 - seg(t, 23.0, 23.4)), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 440, 744, 86, 12); ctx.fill();
      font(600, 24); text(`Horvath 2013: ${SITES_H} sites`, 84, 468, { color: C.dial });
      font(500, 22, TXT); text(`about ${fmt(SAMPLES)} samples from ${DATASETS} studies; ${GAIN} sites gain tags with age, ${LOSE} lose them`, 84, 502, { color: C.soft });
    });
    A(seg(t, 23.4, 24.0), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 440, 744, 86, 12); ctx.fill();
      font(600, 24); text(`${TISSUES} tissues and cell types · median error ${ERR} years`, 84, 468, { color: C.dial });
      font(500, 22, TXT); text('correlation with age 0.96: blood, brain, skin and more, one formula', 84, 502, { color: C.soft });
    });
  });
}

// ---------- C: two routes ----------
function sceneRoutes(t) {
  const a = span(t, 27.8, 37.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('TWO WAYS TO MAKE A NEURAL STEM CELL', CX, 136, { align: 'center', color: C.soft, spacing: '2px' });
    const row = (y, title, col, steps, ages, show) => A(show, () => {
      font(600, 24); text(title, 70, y - 70, { color: col });
      steps.forEach((s, i) => {
        const x = 150 + i * 280;
        if (s === 'blood') bloodCell(x, y, 40); else if (s === 'nsc') neuralCell(x, y, 40); else { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 40, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.fill(); }
        font(500, 20, TXT); text(s === 'blood' ? 'blood precursor' : s === 'nsc' ? 'neural stem cell' : 'pluripotent stem cell', x, y + 66, { align: 'center', color: C.soft });
        font(700, 24); text(ages[i], x, y + 96, { align: 'center', color: ages[i] === String(DONOR) ? C.dial : C.young });
        if (i < steps.length - 1) arrowRight(x + 60, x + 220, y);
      });
    });
    row(260, 'via pluripotency: the clock resets at once', C.ink, ['blood', 'ips', 'nsc'], [String(DONOR), 'about 0', 'about 0'], seg(t, 28.2, 28.8));
    row(560, 'direct, with SOX2 and cMYC: the Bonn route', C.young, ['blood', 'nsc'], [String(DONOR), `under ${UNDER}, slowly`], seg(t, 32.6, 33.2));
  });
}

// ---------- D: the slow reset ----------
function sceneCourse(t) {
  const a = span(t, 37.0, 50.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('THE SLOW RESET · SCHEMATIC', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    const x0 = 110, x1 = 790, y0 = 520, y1 = 190;
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    font(500, 18, TXT);
    for (let d = 0; d <= TRACKED; d += 25) text(String(d), x0 + (d / TRACKED) * (x1 - x0), y0 + 22, { align: 'center', color: C.faint });
    text('days of conversion', CX, y0 + 48, { align: 'center', color: C.soft });
    for (const v of [0, 50, 100]) text(`${v}%`, x0 - 12, y0 - (v / 100) * (y0 - y1), { align: 'right', color: C.faint });
    ctx.save(); ctx.translate(40, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); text('age marks kept', 0, 0, { align: 'center', color: C.soft }); ctx.restore();
    const prog = eio(seg(t, 37.4, 40.6));
    ctx.strokeStyle = C.tag; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
    for (let d = 0; d <= TRACKED * prog; d += 1) ctx.lineTo(x0 + (d / TRACKED) * (x1 - x0), y0 - retained(d) * (y0 - y1));
    ctx.stroke(); ctx.lineCap = 'butt';
    A(seg(t, 39.0, 39.6), () => {
      const xd = x0 + (RESET_DAYS / TRACKED) * (x1 - x0);
      ctx.setLineDash([6, 6]); ctx.strokeStyle = C.dial; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xd, y1); ctx.lineTo(xd, y0); ctx.stroke(); ctx.setLineDash([]);
      font(600, 20); text(`about ${RESET_DAYS} days: most age marks gone`, xd + 10, y1 + 16, { color: C.dial });
    });
    A(seg(t, 42.0, 42.6), () => {
      const yl = y0 - LOW_PASSAGE * (y0 - y1), yh = y0 - HIGH_PASSAGE * (y0 - y1);
      font(600, 20); text(`${Math.round(LOW_PASSAGE * 100)}% of donor age, low passage`, x1 - 10, yl - 16, { align: 'right', color: C.young });
      text(`${Math.round(HIGH_PASSAGE * 100)}% after long culture`, x1 - 10, yh + 18, { align: 'right', color: C.young });
      ctx.fillStyle = C.young; ctx.beginPath(); ctx.arc(x1 - 190, yl, 6, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x1, yh, 6, 0, 7); ctx.fill();
    });
    A(seg(t, 42.0, 42.6), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 590, 744, 64, 12); ctx.fill();
      font(600, 24); text(`${DONORS} donors`, 84, 622, { color: C.dial }); font(500, 22, TXT); text(`newborn to ${OLDEST} years old, blood precursors from each`, 220, 622, { color: C.soft });
    });
    A(seg(t, 46.6, 47.2), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 668, 744, 64, 12); ctx.fill();
      font(600, 24); text('no division needed', 84, 700, { color: C.dial }); font(500, 22, TXT); text('the marks kept fading with cell division blocked', 320, 700, { color: C.soft });
    });
  });
}

// ---------- E: why slow, and caveats ----------
function sceneEnd(t) {
  const a = eout(seg(t, 50.8, 51.6));
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('WHAT IT IS GOOD FOR · AND WHAT IT IS NOT', CX, 136, { align: 'center', color: C.soft, spacing: '2px' });
    const line = (y, head, body, col, show) => A(show, () => {
      ctx.fillStyle = C.panel; k.rrect(60, y - 44, 744, 88, 12); ctx.fill();
      font(600, 26); text(head, 84, y - 12, { color: col }); font(500, 22, TXT); text(body, 84, y + 22, { color: C.soft });
    });
    line(230, 'a window of weeks', 'slow enough to watch which factors speed the reset up or slow it down', C.young, seg(t, 51.2, 51.8));
    line(350, 'cells in a dish', 'no person was made younger; the cells were studied in culture', C.dial, seg(t, 55.6, 56.2));
    line(470, 'the clock counts marks', 'what the marks do for a cell, and for ageing, is still being worked out', C.dial, seg(t, 56.6, 57.2));
    A(seg(t, 57.6, 58.2), () => {
      font(500, 20, TXT); text('Berg, Franzen, Buness, Konang, Sheng, Peitz, Till, Wagner and Brüstle, Aging Cell 25(10), 2026', CX, 580, { align: 'center', color: C.faint });
      text('University Hospital Bonn, University of Bonn and RWTH Aachen', CX, 610, { align: 'center', color: C.faint });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneClock(t);
    sceneRoutes(t);
    sceneCourse(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.tag, '~': C.dial, '^': C.young } });
  },
});
