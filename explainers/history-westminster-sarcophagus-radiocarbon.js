// Explainer for history-westminster-sarcophagus-radiocarbon: on 21 October 2026 Westminster Abbey announced that
// the skeleton inside its Roman sarcophagus, inscribed for Valerius Amandinus (about 300–400 AD), was radiocarbon
// dated to 987–1052 AD: a late Saxon reuse, probably an abbot. The scene explains how a bone keeps time with
// carbon-14. Look: a dark stone-vault background, a pale limestone coffin with ochre lettering, cyan for carbon-14,
// gold for results. Cinzel for the inscription and headings, Crimson Pro for the captions.
//
// Facts:
// - Westminster Abbey news, 21 October 2026, "Mystery of Abbey's Roman sarcophagus solved": the limestone sarcophagus
//   was excavated on the North Green in 1869; its inscription honours Valerius Amandinus, a wealthy Briton who lived
//   around 300–400 AD; the lid was re-carved with a Latin cross of the 10th or 11th century; a bone sample sent to
//   the Scottish Universities Environmental Research Centre (SUERC) gave 987–1052 AD; the man was 35–49 and about
//   5 ft 9 in (James Young Langthorne, Pre-Construct Archaeology); the Abbey's Consultant Archaeologist Professor
//   Warwick Rodwell concludes he was a high-ranking monk, most likely Aelfwig, abbot, died about 1020, or his
//   successor Wulnoth, died 1049: "We have two viable contenders for the occupant of the sarcophagus." Published
//   in the Journal of the British Archaeological Association; on display in The Queen's Diamond Jubilee Galleries.
// - Radiocarbon dating (Wikipedia): cosmic rays make neutrons in the upper atmosphere that turn nitrogen-14 into
//   carbon-14; it becomes CO₂, enters plants by photosynthesis and animals by eating; intake stops at death and the
//   carbon-14 decays with a half-life of about 5,700 years (5,700 ± 30; Libby's 5,568 is still used for conventional
//   ages); atmospheric carbon-14 has varied, so radiocarbon ages are converted to calendar ages with a calibration
//   curve built from tree rings (IntCal20); the method reaches back about 50,000 years.
// Computed here: the decay curve 0.5^(t / 5700), the fraction left after 974–1039 years (the range 987–1052 seen
// from 2026): about 88%; the calibration picture is schematic, not the IntCal curve.
//
// Scene plan (60 s). Captions are centred at y = 846; everything important stays above y = 770.
//  A  0.0– 9.0  The sarcophagus and its inscription.
//  B  9.2–18.2  The cross on the lid; the bone sample goes to the lab.
//  C 18.4–32.0  Carbon-14: made in the air, taken up by life, decaying after death; the half-life curve.
//  D 32.2–45.8  88% left: about 1,000 years; calibration turns it into 987–1052.
//  E 46.0–55.0  A late Saxon; two abbots.
//  F 55.2–60.0  Two viable contenders.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#1f1b17', bg2: '#0b0908', ink: '#f3ece0', soft: 'rgba(243,236,224,0.72)', faint: 'rgba(243,236,224,0.24)', line: 'rgba(243,236,224,0.14)',
  stone: '#c9bfae', stoneDark: '#9c927f', ochre: '#b5553b', cyan: '#6fd3e0', gold: '#e0b85a', green: '#8fcf9a', panel: 'rgba(243,236,224,0.07)',
};
const HEAD = 'Cinzel', TXT = 'Crimson Pro';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the numbers ----------
const HALF = 5700; // years
const left = (years) => Math.pow(0.5, years / HALF);
const NOW = 2026, LO = 987, HI = 1052;
const FRAC_LO = left(NOW - LO), FRAC_HI = left(NOW - HI); // 0.881 and 0.888
const FRAC = Math.round(((FRAC_LO + FRAC_HI) / 2) * 100); // 88
const AGE_MID = Math.round(NOW - (LO + HI) / 2); // about 1,006 years

const CUES = [
  [0.4, 4.6, 'In 1869, diggers at Westminster Abbey in London unearthed a Roman stone coffin, a sarcophagus.'],
  [4.8, 9.0, 'Its inscription honours *Valerius Amandinus*, a wealthy Briton of about 300 to 400 AD.'],
  [9.2, 13.6, 'But the lid was re-cut with a Christian cross of the 10th or 11th century. So who was inside?'],
  [13.8, 18.2, 'On 21 October 2026 the Abbey gave an answer, from a bone sample and ^radiocarbon dating^.'],
  [18.4, 22.8, 'Cosmic rays hitting the air turn a little nitrogen into ~carbon-14~, a radioactive kind of carbon.'],
  [23.0, 27.4, 'It joins the CO₂ that plants breathe in, and animals eat the plants: every living body carries some.'],
  [27.6, 32.0, `At death the supply stops and the ~carbon-14~ decays: ^half^ of it is gone after about ${fmt(HALF)} years.`],
  [32.2, 36.6, `Measure how much is left and you have the time since death. This bone kept about ^${FRAC}%^.`],
  [36.8, 41.2, `That is roughly ${fmt(Math.round(AGE_MID / 100) * 100)} years. But the air’s carbon-14 has wobbled, so raw ages need correcting.`],
  [41.4, 45.8, 'Tree rings of known age give the correction, a ^calibration curve^, and a date with a range.'],
  [46.0, 50.4, `The result: the bones date from between *${LO} and ${HI}*, a late Saxon, six centuries after the Roman.`],
  [50.6, 55.0, 'Abbey archaeologist Warwick Rodwell names two abbots: Aelfwig, died about 1020, or Wulnoth, died 1049.'],
  [55.2, 60.0, 'A fine coffin for a man of rank, aged 35 to 49. “Two viable contenders”, the Abbey says.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // faint ashlar courses
  g.strokeStyle = 'rgba(243,236,224,0.05)'; g.lineWidth = 1.5;
  for (let y = 0; y < H; y += 54) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); const off = (y / 54) % 2 ? 60 : 0; for (let x = off; x < W; x += 120) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 54); g.stroke(); } }
}

// ---------- the sarcophagus ----------
/** A limestone box seen from the front, with its lid; `cross` 0..1 carves the cross, `lid` 0..1 slides the lid aside. */
function sarcophagus(x, y, w, h, { cross = 0, lid = 0, inscription = 1 } = {}) {
  // shadow and box
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; k.rrect(x + 10, y + 14, w, h, 10); ctx.fill();
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, C.stone); g.addColorStop(1, C.stoneDark);
  ctx.fillStyle = g; k.rrect(x, y, w, h, 10); ctx.fill();
  // inscription panel
  A(inscription, () => {
    ctx.strokeStyle = 'rgba(60,40,30,0.45)'; ctx.lineWidth = 3; k.rrect(x + w * 0.2, y + h * 0.3, w * 0.6, h * 0.42, 6); ctx.stroke();
    font(700, Math.min(30, w * 0.052)); text('VALERIVS · AMANDINVS', x + w / 2, y + h * 0.51, { align: 'center', color: C.ochre, spacing: '2px' });
  });
  // lid, resting on top, slid aside by `lid`
  const lx = x - 6 + lid * (w + 40), ly = y - 34;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; k.rrect(lx + 8, ly + 10, w + 12, 34, 8); ctx.fill();
  ctx.fillStyle = C.stone; k.rrect(lx, ly, w + 12, 34, 8); ctx.fill();
  ctx.fillStyle = C.stoneDark; ctx.fillRect(lx + 4, ly + 28, w + 4, 4);
  // the cross, carved into the lid's top face (drawn flat on the lid band)
  if (cross > 0) {
    const cx = lx + (w + 12) / 2, cy = ly + 15;
    ctx.strokeStyle = `rgba(80,55,40,${0.9 * cross})`; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 90 * cross, cy); ctx.lineTo(cx + 90 * cross, cy); ctx.moveTo(cx - 40, cy - 11); ctx.lineTo(cx - 40, cy + 11); ctx.stroke();
    ctx.lineCap = 'butt';
  }
}

// ---------- A + B: the coffin, the cross, the sample ----------
function sceneCoffin(t) {
  const a = 1 - seg(t, 18.0, 18.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { font(600, 24); text('WESTMINSTER ABBEY · LONDON', CX, 136, { align: 'center', color: C.soft, spacing: '3px' }); });
    const rise = eout(seg(t, 0.6, 2.2));
    const cross = seg(t, 9.6, 11.0), lid = eio(seg(t, 14.2, 15.4));
    A(rise, () => sarcophagus(132, lerp(420, 330, rise), 600, 250, { cross, lid, inscription: seg(t, 4.4, 5.2) + 0.25 }));
    A(seg(t, 5.0, 5.6) * (1 - seg(t, 9.0, 9.4)), () => {
      font(500, 26, TXT); text('a wealthy Briton of about 300–400 AD', CX, 630, { align: 'center', color: C.soft });
      font(500, 24, TXT); text('limestone · excavated on the North Green, 1869', CX, 668, { align: 'center', color: C.faint });
    });
    A(seg(t, 10.2, 10.8) * (1 - seg(t, 13.6, 14.0)), () => {
      font(500, 26, TXT); text('a Latin cross, cut 600 years later', CX, 630, { align: 'center', color: C.soft });
      font(500, 24, TXT); text('10th or 11th century · the coffin was reused', CX, 668, { align: 'center', color: C.faint });
    });
    // the bone sample travels to the lab
    if (t > 14.6) {
      const p = eio(seg(t, 15.0, 17.2));
      const sx = lerp(300, 640, p), sy = lerp(420, 650, p);
      ctx.fillStyle = C.ink; k.rrect(sx - 22, sy - 7, 44, 14, 7); ctx.fill();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(sx - 22, sy - 6, 6, 0, 7); ctx.arc(sx - 22, sy + 6, 6, 0, 7); ctx.arc(sx + 22, sy - 6, 6, 0, 7); ctx.arc(sx + 22, sy + 6, 6, 0, 7); ctx.fill();
      A(seg(t, 16.6, 17.2), () => {
        font(600, 22); text('SUERC · GLASGOW', 640, 700, { align: 'center', color: C.cyan, spacing: '2px' });
        font(500, 22, TXT); text('a bone sample, radiocarbon dated', 640, 736, { align: 'center', color: C.soft });
      });
    }
  });
}

// ---------- C: carbon-14 ----------
function sceneCarbon(t) {
  const a = span(t, 18.4, 32.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('CARBON-14', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    const stage = t < 23.0 ? 0 : t < 27.6 ? 1 : 2;
    // the sky band
    ctx.fillStyle = 'rgba(111,211,224,0.06)'; ctx.fillRect(60, 180, 744, 150);
    font(500, 22, TXT); text('upper atmosphere', 80, 200, { color: C.faint });
    // cosmic rays
    for (let i = 0; i < 5; i++) {
      const g = seg(t, 18.6 + i * 0.3, 19.4 + i * 0.3);
      if (g <= 0) continue;
      const x = 140 + i * 150;
      ctx.strokeStyle = `rgba(243,236,224,${0.7 * g})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(x + 40, 180); ctx.lineTo(x, 180 + 110 * g); ctx.stroke(); ctx.setLineDash([]);
      A(seg(g, 0.9, 1), () => {
        ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(x, 292, 9, 0, 7); ctx.fill();
        font(600, 18); text('¹⁴C', x, 318, { align: 'center', color: C.cyan });
      });
    }
    A(seg(t, 20.6, 21.2), () => { font(500, 24, TXT); text('a cosmic ray turns nitrogen-14 into carbon-14', CX, 356, { align: 'center', color: C.ink }); });
    // the plant and the eater
    A(seg(t, 23.2, 23.8), () => {
      // CO2 drifting down
      for (let i = 0; i < 6; i++) { const u = ((t * 0.25) + i / 6) % 1; ctx.fillStyle = `rgba(111,211,224,${0.8 * (1 - u)})`; ctx.beginPath(); ctx.arc(230 + i * 20 - 50, 380 + u * 150, 5, 0, 7); ctx.fill(); }
      font(500, 22, TXT); text('CO₂ with a trace of ¹⁴C', 180, 400, { align: 'center', color: C.cyan });
      // plant
      ctx.strokeStyle = C.green; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(300, 640); ctx.lineTo(300, 540); ctx.stroke();
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.ellipse(272, 575, 30, 14, -0.6, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(328, 600, 30, 14, 0.6, 0, 7); ctx.fill();
      ctx.lineCap = 'butt';
      font(500, 22, TXT); text('plant', 300, 672, { align: 'center', color: C.soft });
      // arrow to the eater
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(360, 600); ctx.lineTo(470, 600); ctx.lineTo(458, 590); ctx.moveTo(470, 600); ctx.lineTo(458, 610); ctx.stroke();
      // a person
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(540, 540, 18, 0, 7); ctx.fill();
      k.rrect(522, 562, 36, 70, 10); ctx.fill();
      font(500, 22, TXT); text('eater', 540, 672, { align: 'center', color: C.soft });
      font(600, 22); text('alive: topped up', 540, 500, { align: 'center', color: C.cyan });
    });
    // the decay curve
    A(seg(t, 27.8, 28.4), () => {
      ctx.fillStyle = 'rgba(17,14,12,0.94)'; k.rrect(60, 372, 744, 400, 12); ctx.fill();
      decayCurve(t, 90, 420, 684, 300, seg(t, 28.0, 31.0), 0);
    });
  });
}
/** The decay curve of carbon-14, drawn from (x, y) in a box w × h; `draw` 0..1 traces it; `mark` 0..1 marks the bone. */
function decayCurve(t, x, y, w, h, draw, mark) {
  const Y = (f) => y + h - f * h, X = (yr) => x + (yr / (2 * HALF)) * w;
  ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
  for (const f of [0.25, 0.5, 0.75, 1]) { ctx.beginPath(); ctx.moveTo(x, Y(f)); ctx.lineTo(x + w, Y(f)); ctx.stroke(); font(500, 18, TXT); text(`${f * 100}%`, x - 10, Y(f), { align: 'right', color: C.faint }); }
  for (const yr of [0, HALF, 2 * HALF]) { font(500, 18, TXT); text(`${fmt(yr)} years`, X(yr), y + h + 22, { align: 'center', color: C.faint }); }
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 5; ctx.beginPath();
  const n = Math.floor(200 * draw);
  for (let i = 0; i <= n; i++) { const yr = (i / 200) * 2 * HALF; const px = X(yr), py = Y(left(yr)); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
  ctx.stroke();
  if (draw > 0.5) A(seg(draw, 0.5, 0.7), () => {
    ctx.strokeStyle = C.gold; ctx.setLineDash([8, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(HALF), Y(0.5)); ctx.lineTo(X(HALF), y + h); ctx.moveTo(x, Y(0.5)); ctx.lineTo(X(HALF), Y(0.5)); ctx.stroke(); ctx.setLineDash([]);
    font(600, 22); text(`half-life ${fmt(HALF)} years`, X(HALF) + 12, Y(0.5) - 18, { color: C.gold });
  });
  if (mark > 0) A(mark, () => {
    const f = (FRAC_LO + FRAC_HI) / 2, yr = AGE_MID;
    ctx.strokeStyle = C.gold; ctx.setLineDash([8, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, Y(f)); ctx.lineTo(X(yr), Y(f)); ctx.lineTo(X(yr), y + h); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(X(yr), Y(f), 9, 0, 7); ctx.fill();
    font(700, 26); text(`${FRAC}% left`, X(yr) + 16, Y(f) - 22, { color: C.gold });
    font(600, 22); text(`≈ ${fmt(Math.round(yr / 100) * 100)} years`, X(yr) + 16, Y(f) + 16, { color: C.gold });
  });
}

// ---------- D: the measurement and the calibration ----------
function sceneDate(t) {
  const a = span(t, 32.2, 46.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 41.4) {
      font(600, 24); text('HOW MUCH IS LEFT', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      decayCurve(t, 90, 220, 684, 360, 1, seg(t, 32.6, 33.4));
      A(seg(t, 37.0, 37.6), () => {
        ctx.fillStyle = C.panel; k.rrect(60, 650, 744, 100, 12); ctx.fill();
        font(500, 24, TXT); text('but the air’s ¹⁴C was not always the same: a raw age is not yet a date', CX, 686, { align: 'center', color: C.ink });
        font(500, 22, TXT); text('the fix: wood of known age, counted in tree rings', CX, 722, { align: 'center', color: C.soft });
      });
    } else {
      font(600, 24); text('CALIBRATION', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      // a schematic calibration curve: raw radiocarbon age (vertical) against calendar year (horizontal)
      const x0 = 120, x1 = 790, y0 = 220, y1 = 600;
      const cal = (yr) => 1000 + (1000 - yr) * 0.9 + 40 * Math.sin(yr / 11) + 25 * Math.sin(yr / 31); // schematic wiggles
      const X = (yr) => lerp(x0, x1, (yr - 850) / (1200 - 850)), Y = (age) => lerp(y1, y0, (age - 800) / (1400 - 800));
      ctx.strokeStyle = C.line; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      font(500, 18, TXT); text('raw radiocarbon age', x0 - 8, y0 + 10, { align: 'right', color: C.faint });
      for (const yr of [900, 1000, 1100, 1200]) { font(500, 18, TXT); text(`${yr} AD`, X(yr), y1 + 22, { align: 'center', color: C.faint }); }
      ctx.strokeStyle = C.green; ctx.lineWidth = 4; ctx.beginPath();
      const n = Math.floor(120 * seg(t, 41.6, 43.4));
      for (let i = 0; i <= n; i++) { const yr = 850 + (i / 120) * 350; const px = X(yr), py = Y(cal(yr)); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.stroke();
      font(500, 20, TXT); text('tree-ring curve (schematic, not to scale)', x1 - 6, y0 + 24, { align: 'right', color: C.green });
      A(seg(t, 43.6, 44.2), () => {
        // the measurement band maps to a calendar range
        const ya = Y(cal(LO)), yb = Y(cal(HI));
        ctx.fillStyle = 'rgba(224,184,90,0.22)'; ctx.fillRect(x0, Math.min(ya, yb), x1 - x0, Math.abs(ya - yb));
        ctx.fillStyle = 'rgba(224,184,90,0.22)'; ctx.fillRect(X(LO), y0, X(HI) - X(LO), y1 - y0);
        font(700, 26); text(`${LO} – ${HI}`, (X(LO) + X(HI)) / 2, y1 + 54, { align: 'center', color: C.gold });
        font(500, 22, TXT); text('the measurement, with its uncertainty, read off as calendar years', CX, 700, { align: 'center', color: C.soft });
      });
    }
  });
}

// ---------- E + F: who ----------
function sceneWho(t) {
  const a = eout(seg(t, 46.0, 46.8));
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('A LATE SAXON IN A ROMAN COFFIN', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    // a timeline from 300 to 1100
    const x0 = 90, x1 = 774, y = 236;
    const X = (yr) => lerp(x0, x1, (yr - 250) / (1100 - 250));
    ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.fillStyle = 'rgba(181,85,59,0.55)'; ctx.fillRect(X(300), y - 14, X(400) - X(300), 28);
    font(600, 20); text('the coffin, 300–400', X(350), y + 36, { align: 'center', color: C.ochre });
    A(seg(t, 46.4, 47.0), () => {
      ctx.fillStyle = 'rgba(224,184,90,0.7)'; ctx.fillRect(X(LO), y - 14, X(HI) - X(LO), 28);
      font(600, 20); text(`the bones, ${LO}–${HI}`, X((LO + HI) / 2), y + 36, { align: 'center', color: C.gold });
      font(500, 20, TXT); text('about 600 years apart', X(700), y - 28, { align: 'center', color: C.soft });
    });
    const cards = [['Aelfwig', 'abbot of Westminster · died about 1020', 'already a monk of the Abbey, which may favour him', 50.8], ['Wulnoth', 'his successor · died 1049', 'also presumed to be buried at the Abbey', 51.6]];
    cards.forEach(([name, who, note, at], i) => A(eout(seg(t, at, at + 0.7)), () => {
      const x = 70 + i * 372, yy = 320;
      ctx.fillStyle = C.panel; k.rrect(x, yy, 352, 250, 14); ctx.fill();
      font(700, 38); text(name, x + 176, yy + 56, { align: 'center', color: C.gold });
      font(500, 24, TXT); text(who, x + 176, yy + 110, { align: 'center', color: C.ink });
      k.rich(note, x + 176, yy + 180, { maxW: 310, size: 22, weight: 500, family: TXT, ink: C.soft, marks: {} });
    }));
    A(seg(t, 55.6, 56.2), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 612, 744, 140, 12); ctx.fill();
      font(500, 24, TXT); text('a man aged 35 to 49, about 5 ft 9 in, in a coffin fit for rank', CX, 650, { align: 'center', color: C.ink });
      font(500, 22, TXT); text('Warwick Rodwell, Journal of the British Archaeological Association, 2026', CX, 690, { align: 'center', color: C.soft });
      font(500, 22, TXT); text('on display in The Queen’s Diamond Jubilee Galleries', CX, 724, { align: 'center', color: C.faint });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneCoffin(t);
    sceneCarbon(t);
    sceneDate(t);
    sceneWho(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 42, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.ochre, '~': C.cyan, '^': C.gold } });
  },
});
