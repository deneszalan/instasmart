// Explainer for art-pieta-michelangelo (Roma): Michelangelo's Pietà in St Peter's Basilica, carved from 1498, and
// how its composition lays a grown man across a woman's lap: Mary's body is far bigger than her son's though their
// heads match, her robe hides it, and the group makes a pyramid; the only work he signed, Vasari's story about it,
// and the 1972 attack that put it behind glass. Look: white marble in a dark chapel, lit warm from the left; gold for
// measuring lines; a blue-grey for labels. Gentium Book Plus for captions, Alegreya Sans for labels.
//
// Facts:
// - Vatican Museums, "The Casts of the three Pietà" (2023): the contract was signed on 26 August 1498 by the
//   23-year-old Michelangelo and Cardinal Jean de Bilhères, ambassador of King Charles VIII of France to Pope
//   Alexander VI; Michelangelo went to Carrara to choose the block of white marble; sculpted in about two years; an
//   iconography "more Nordic than Italian", the dead Christ lying on the knees of the Madonna; since 1749 in the first
//   chapel on the right of St Peter's Basilica; the only work signed by Buonarroti.
// - Wikipedia, "Pietà (Michelangelo)": 1498–1499, Carrara marble, 174 cm × 195 cm; made for the cardinal's funeral
//   chapel in Old St Peter's; the structure is pyramidal, its vertex at Mary's head, widening down to the rock of
//   Golgotha; the figures are out of proportion because a grown man is cradled full-length in a woman's lap; much of
//   Mary's body is hidden by her drapery, so the relationship looks natural; Mary is young; Ascanio Condivi reports
//   Michelangelo saying chastity keeps a woman fresh; the signature MICHAELANGELVS BONAROTVS FLORENTINVS FACIEBAT on
//   the sash across her chest; on 21 May 1972 Laszlo Toth struck it 15 times with a geologist's hammer, taking off
//   Mary's arm at the elbow, part of her nose and chipping an eyelid; restored, it is behind bulletproof acrylic glass.
// - ItalianRenaissance.org, "Michelangelo's Pietà": although their heads are proportional, the Virgin's body is
//   larger than Christ's; if she stood up she would likely tower over him; the garments on her lap are amassed into a
//   sea of folded drapery; the figures form a pyramid.
// - Wikipedia, "Vandalism of Michelangelo's Pietà": over 100 fragments were found and glued back with Carrara marble
//   powder over five months; back on display ten months after the attack; behind a pane of bullet-proof glass.
// - A. Majanlahti, "Michelangelo's Signature and the Myth of Genius", Hyperallergic (2023): Vasari says Michelangelo
//   heard visitors credit the statue to "our Gobbo from Milan" (Cristoforo Solari) and carved his name at night;
//   there is good reason to doubt it: the sash seems to exist mainly to carry the signature.
// The statue is drawn simplified, not measured; the standing figures are schematic.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0–14.0  The Pietà in its chapel; 1498, aged 23; made for a cardinal's tomb; in place since 1749.
//  B 14.2–32.4  A man across a lap; heads the same size, Mary's body bigger; standing, she towers; the robe hides it.
//  C 32.6–37.0  The pyramid, 174 × 195 cm.
//  D 37.2–41.6  Mary's youth, as Condivi reports.
//  E 41.8–55.4  The signature on the sash; Vasari's story and the doubt.
//  F 55.6–65.0  21 May 1972; restored; behind glass.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#1d1a1f', bg2: '#2b2629', ink: '#f3eee6', soft: 'rgba(243,238,230,0.74)', faint: 'rgba(243,238,230,0.2)',
  marble: '#ece6db', marble2: '#cfc7ba', shade: '#9c948a', deep: '#6f685f', gold: '#e2b55e', blue: '#8fb8d0', red: '#e0675a', glass: 'rgba(170,210,235,0.16)',
};
const SERIF = 'Gentium Book Plus', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const HEIGHT = 174, WIDTH = 195, CONTRACT = 1498, BORN = 1475, AGE = 23, MOVED = 1749, ATTACK = 1972, BLOWS = 15;
if (CONTRACT - BORN !== AGE) throw new Error('numbers'); // born 6 March 1475, contract 26 August 1498

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'In St Peter’s Basilica, Mary holds her dead son Jesus on her lap: Michelangelo’s *Pietà*.'],
  [5.0, 9.4, `Michelangelo signed the contract in August ${CONTRACT}, aged ${AGE}, and carved it in about two years.`],
  [9.6, 14.0, `Made for a French cardinal’s tomb, it has stood in the first chapel on the right since ${MOVED}.`],
  [14.2, 18.6, 'The hard part: laying a grown man full length across a seated woman’s lap.'],
  [18.8, 23.2, 'The answer: Mary’s body is much bigger than his, though their *heads* are the same size.'],
  [23.4, 27.8, 'If she stood up, she would ~tower over him~.'],
  [28.0, 32.4, 'Her vast robe hides her size, so the two figures look natural together.'],
  [32.6, 37.0, `The whole group makes a ^pyramid^: its tip is Mary’s head, its base the rock below.`],
  [37.2, 41.6, 'Mary looks younger than her son. Chastity keeps women young, he told his biographer Ascanio Condivi.'],
  [41.8, 46.2, 'It is the only work Michelangelo ever signed, on the *sash* across Mary’s chest.'],
  [46.4, 50.8, 'Biographer Giorgio Vasari says he added it at night, after visitors credited another sculptor.'],
  [51.0, 55.4, 'Many historians ~doubt~ the story: the sash looks made to carry the name from the start.'],
  [55.6, 60.0, `On 21 May ${ATTACK} a man struck the statue ${BLOWS} times with a hammer, breaking Mary’s arm and nose.`],
  [60.2, 64.6, 'It was carefully restored, and it has stood behind bulletproof glass ever since.'],
];

// ---------- background: a dark chapel with a niche ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(0.6, C.bg2); lg.addColorStop(1, '#151215');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(260, 260, 40, 330, 420, 620); rg.addColorStop(0, 'rgba(255,214,160,0.16)'); rg.addColorStop(1, 'rgba(255,214,160,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${0.008 + r() * 0.02})`; g.fillRect(r() * W, r() * H, 2, 2); }
}
function label(str, x, y, { size = 23, col = C.ink, align = 'left', weight = 500, fam = SANS } = {}) { font(weight, size, fam); text(str, x, y, { align, base: 'middle', color: col }); }

// ---------- the statue, in cm from the bottom-left corner, y up ----------
let ST = { x: 81, y: 760, s: 3.6 };
const X = (cm) => ST.x + cm * ST.s, Y = (cm) => ST.y - cm * ST.s;
function shape(pts, close = true) {
  ctx.beginPath();
  pts.forEach((p, i) => {
    if (p.length === 2) { if (i) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); }
    else ctx.bezierCurveTo(X(p[0]), Y(p[1]), X(p[2]), Y(p[3]), X(p[4]), Y(p[5]));
  });
  if (close) ctx.closePath();
}
function marbleFill(x0, x1) {
  const g = ctx.createLinearGradient(X(x0), 0, X(x1), 0); g.addColorStop(0, C.marble); g.addColorStop(0.55, C.marble2); g.addColorStop(1, C.shade);
  return g;
}
// parts of the statue, traced (simplified) from a frontal photograph
const ROCK = [[0, 0], [195, 0], [195, 14], [178, 17], [150, 15], [110, 18], [70, 15], [30, 17], [0, 14]];
const ROBE = [[80, 92], [58, 80, 30, 52, 12, 30], [6, 22, 2, 18, 0, 15], [195, 16], [192, 28, 188, 38, 183, 46], [176, 56, 162, 68, 150, 72], [146, 80, 143, 86, 141, 92]];
const FLAP = [[18, 16], [16, 44, 20, 72, 30, 90], [38, 100, 48, 106, 56, 108], [58, 96, 56, 70, 50, 44], [44, 28, 36, 18, 30, 16]];
const TORSO = [[80, 92], [75, 108, 72, 120, 78, 128], [92, 134, 126, 134, 140, 128], [146, 118, 145, 104, 141, 92]];
const VEIL = [[90, 126], [90, 156, 99, 174, 109, 174], [120, 174, 129, 156, 129, 125], [119, 131], [100, 131]];
const FACE = { x: 108, y: 153, rx: 5.6, ry: 7.6, rot: -0.25 };
const JHEAD = { x: 52, y: 126, r: 8.5 };
function limb(x0, y0, x1, y1, w0, w1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  ctx.beginPath();
  ctx.moveTo(X(x0 + nx * w0 / 2), Y(y0 + ny * w0 / 2)); ctx.lineTo(X(x1 + nx * w1 / 2), Y(y1 + ny * w1 / 2));
  ctx.arc(X(x1), Y(y1), (w1 / 2) * ST.s, Math.atan2(-ny, nx), Math.atan2(ny, -nx));
  ctx.lineTo(X(x0 - nx * w0 / 2), Y(y0 - ny * w0 / 2));
  ctx.arc(X(x0), Y(y0), (w0 / 2) * ST.s, Math.atan2(ny, -nx), Math.atan2(-ny, nx));
  ctx.closePath();
}
function folds(pairs, col = 'rgba(111,104,95,0.55)', wdt = 1.8) {
  ctx.strokeStyle = col; ctx.lineWidth = wdt;
  for (const [a, b, c, d] of pairs) { ctx.beginPath(); ctx.moveTo(X(a[0]), Y(a[1])); ctx.bezierCurveTo(X(b[0]), Y(b[1]), X(c[0]), Y(c[1]), X(d[0]), Y(d[1])); ctx.stroke(); }
}
function statue(a = 1, { heads = 0, robe = 1, sash = 0, damage = 0 } = {}) {
  A(a, () => {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    shape(ROCK); ctx.fillStyle = C.deep; ctx.fill();
    ctx.restore();
    // the robe: the great mass of folds over Mary's lap
    A(robe, () => {
      shape(ROBE); ctx.fillStyle = marbleFill(0, 195); ctx.fill();
      folds([[[70, 88], [50, 70], [30, 40], [14, 18]], [[88, 70], [80, 50], [70, 34], [60, 17]], [[110, 66], [104, 48], [100, 32], [96, 18]], [[126, 64], [128, 46], [132, 32], [134, 17]], [[150, 66], [160, 48], [166, 34], [170, 17]], [[100, 80], [120, 70], [140, 74], [150, 72]]]);
      shape(FLAP); ctx.fillStyle = marbleFill(10, 60); ctx.fill();
      folds([[[24, 30], [24, 60], [32, 82], [46, 100]], [[34, 22], [36, 50], [42, 72], [52, 96]]]);
    });
    if (robe < 1) A(1 - robe, () => {
      // what the robe hides: Mary's knees and shins, drawn as dashes (schematic)
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(X(86), Y(90)); ctx.lineTo(X(52), Y(74)); ctx.lineTo(X(40), Y(18)); ctx.moveTo(X(134), Y(90)); ctx.lineTo(X(160), Y(74)); ctx.lineTo(X(154), Y(18)); ctx.stroke(); ctx.setLineDash([]);
    });
    shape(TORSO); ctx.fillStyle = marbleFill(76, 145); ctx.fill();
    folds([[[90, 128], [94, 118], [92, 106], [88, 96]], [[128, 128], [124, 118], [126, 106], [130, 96]]], 'rgba(111,104,95,0.4)', 1.4);
    // Mary's left arm, held out, palm open
    limb(138, 124, 151, 104, 13, 10); ctx.fillStyle = marbleFill(135, 160); ctx.fill();
    limb(151, 104, 171, 89, 9, 6); ctx.fill();
    shape(VEIL); ctx.fillStyle = marbleFill(86, 133); ctx.fill(); ctx.strokeStyle = 'rgba(111,104,95,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = C.marble; ctx.beginPath(); ctx.ellipse(X(FACE.x), Y(FACE.y), FACE.rx * ST.s, FACE.ry * ST.s, FACE.rot, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(111,104,95,0.6)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(103), Y(156)); ctx.lineTo(X(107), Y(155)); ctx.moveTo(X(110), Y(157)); ctx.lineTo(X(114), Y(156)); ctx.stroke();
    // Jesus, lying across her lap: shoulders on her right arm, knees over her left knee
    ctx.fillStyle = marbleFill(40, 185); ctx.strokeStyle = 'rgba(111,104,95,0.5)'; ctx.lineWidth = 1.2;
    limb(152, 80, 178, 24, 12, 8); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(X(183), Y(19), 6 * ST.s, 2.6 * ST.s, 0.2, 0, TAU); ctx.fill();
    limb(116, 86, 152, 80, 16, 12); ctx.fill(); ctx.stroke();
    limb(60, 114, 121, 87, 20, 17); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.marble; ctx.beginPath(); ctx.ellipse(X(116), Y(86), 10 * ST.s, 6.5 * ST.s, -0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = marbleFill(50, 75); limb(60, 108, 66, 52, 8, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.marble2; ctx.beginPath(); ctx.arc(X(JHEAD.x), Y(JHEAD.y), JHEAD.r * ST.s, 0, TAU); ctx.fill(); ctx.stroke();
    // Mary's right hand under his arm
    ctx.fillStyle = C.marble; ctx.beginPath(); ctx.ellipse(X(62), Y(103), 5 * ST.s, 3 * ST.s, -0.5, 0, TAU); ctx.fill();
    if (sash > 0) A(sash, () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3 * ST.s * 0.45; ctx.beginPath(); ctx.moveTo(X(133), Y(130)); ctx.quadraticCurveTo(X(110), Y(118), X(88), Y(100)); ctx.stroke();
    });
    if (heads > 0) A(heads, () => {
      ctx.strokeStyle = C.blue; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(X(FACE.x), Y(FACE.y), 11 * ST.s, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(JHEAD.x), Y(JHEAD.y), 11 * ST.s, 0, TAU); ctx.stroke();
    });
    if (damage > 0) A(damage, () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(X(FACE.x), Y(FACE.y), 7 * ST.s, 0, TAU); ctx.stroke();
    });
  });
}
function niche(a) {
  A(a, () => {
    ctx.strokeStyle = 'rgba(226,181,94,0.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(60, 780); ctx.lineTo(60, 300); ctx.arc(CX, 300, CX - 60, Math.PI, 0); ctx.lineTo(W - 60, 780); ctx.stroke();
    ctx.fillStyle = C.deep; ctx.fillRect(40, 760, W - 80, 22);
  });
}

// ---------- A: the statue, its date and place ----------
function sceneIntro(t) {
  const a = span(t, 0, 14.2, 0.6, 0.0);
  if (a <= 0) return;
  ST = { x: 81, y: 740, s: 3.6 };
  niche(a * (1 - seg(t, 14.0, 14.6)));
  A(a, () => {
    A(seg(t, 0.8, 1.6), () => { label('ST PETER’S BASILICA · ROME', 56, 96, { size: 26, weight: 700 }); label('Michelangelo, Pietà', 56, 130, { size: 24, col: C.soft, fam: SERIF }); });
    A(seg(t, 5.6, 6.4) * (1 - seg(t, 9.4, 10.0)), () => {
      label(`contract: 26 August ${CONTRACT}`, 56, 186, { size: 24, weight: 700, col: C.gold });
      label(`Michelangelo aged ${AGE}`, 56, 218, { size: 23, col: C.soft });
    });
    A(seg(t, 10.2, 11.0), () => {
      label(`in this chapel since ${MOVED}`, 56, 186, { size: 24, weight: 700, col: C.gold });
      label('first on the right', 56, 218, { size: 23, col: C.soft });
    });
  });
}

// ---------- B: the problem and the answer ----------
function figure(cx, foot, head, bodyScale, col, lab) {
  // a schematic standing figure: a head, then a body of 7 heads, scaled
  const hh = head, body = 7 * head * bodyScale, top = foot - body - hh;
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(cx, top + hh / 2, hh / 2, 0, TAU); ctx.fill();
  const sw = head * 1.9 * bodyScale, hw = head * 1.5 * bodyScale;
  ctx.beginPath(); ctx.moveTo(cx - sw / 2, top + hh * 1.15); ctx.lineTo(cx + sw / 2, top + hh * 1.15); ctx.lineTo(cx + hw / 2, top + hh + body * 0.5); ctx.lineTo(cx + hw * 0.25, foot); ctx.lineTo(cx - hw * 0.25, foot); ctx.lineTo(cx - hw / 2, top + hh + body * 0.5); ctx.closePath(); ctx.fill();
  label(lab, cx, foot + 28, { size: 23, align: 'center', weight: 700, col });
  return top;
}
function sceneSize(t) {
  const a = span(t, 14.2, 32.6, 0.4, 0.4);
  if (a <= 0) return;
  const stand = span(t, 23.4, 28.0, 0.5, 0.5);
  ST = { x: 81, y: 740, s: 3.6 };
  A(a * (1 - stand), () => {
    statue(1, { heads: seg(t, 19.4, 20.4), robe: t < 28 ? (t > 14.8 && t < 23.4 ? 1 - 0.7 * span(t, 15.2, 18.6, 0.6, 0.6) : 1) : 1 });
    A(span(t, 15.0, 18.6, 0.6, 0.4), () => {
      label('a grown man', 40, 210, { size: 24, weight: 700, col: C.gold });
      label('across a woman’s lap', 40, 240, { size: 23, col: C.soft });
    });
    A(span(t, 19.6, 23.4, 0.6, 0.4), () => {
      label('heads: the same size', 40, 200, { size: 24, weight: 700, col: C.blue });
      label('bodies: hers much bigger', 40, 230, { size: 23, col: C.soft });
    });
    A(seg(t, 28.4, 29.2), () => {
      label('a sea of folds', 40, 200, { size: 24, weight: 700, col: C.gold });
      label('hides how big she is', 40, 230, { size: 23, col: C.soft });
      ctx.strokeStyle = 'rgba(226,181,94,0.7)'; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) { const p = (t * 0.3 + i / 5) % 1; ctx.beginPath(); ctx.moveTo(X(30 + i * 30), Y(lerp(90, 20, p))); ctx.lineTo(X(36 + i * 30), Y(lerp(84, 14, p))); ctx.stroke(); }
    });
  });
  A(a * stand, () => {
    const foot = 700, head = 44;
    figure(300, foot, head, 1, C.marble2, 'Jesus');
    const top = figure(560, foot, head, 1.32, C.marble, 'Mary');
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(240, foot - 8 * head); ctx.lineTo(640, foot - 8 * head); ctx.stroke(); ctx.setLineDash([]);
    label('the same head', 640, top + head / 2, { size: 22, col: C.blue });
    label('schematic', 56, 170, { size: 22, col: C.soft, fam: SERIF });
  });
}

// ---------- C: the pyramid ----------
function scenePyramid(t) {
  const a = span(t, 32.6, 41.8, 0.4, 0.4);
  if (a <= 0) return;
  ST = { x: 81, y: 740, s: 3.6 };
  A(a, () => {
    statue(1, {});
    const d = eio(seg(t, 33.0, 34.6));
    A(t < 37.2 ? 1 : 1 - seg(t, 37.2, 37.8), () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(lerp(0, 109, d)), Y(lerp(0, HEIGHT, d))); ctx.moveTo(X(195), Y(0)); ctx.lineTo(X(lerp(195, 109, d)), Y(lerp(0, HEIGHT, d))); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(195), Y(0)); ctx.stroke();
      A(seg(t, 34.6, 35.4), () => {
        label(`${HEIGHT} cm`, X(109) + 24, Y(HEIGHT) + 6, { size: 24, weight: 700, col: C.gold });
        label(`${WIDTH} cm`, X(97), Y(0) + 26, { size: 24, weight: 700, col: C.gold, align: 'center' });
      });
    });
    A(seg(t, 37.6, 38.4), () => {
      ctx.fillStyle = 'rgba(29,26,31,0.86)'; k.rrect(540, 186, 316, 110, 10); ctx.fill();
      label('a young Mary', 556, 210, { size: 24, weight: 700, col: C.blue });
      label('chastity keeps women young,', 556, 244, { size: 23, col: C.soft, fam: SERIF });
      label('Condivi reports him saying', 556, 274, { size: 23, col: C.soft, fam: SERIF });
      ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(552, 226); ctx.lineTo(X(124), Y(160)); ctx.stroke();
    });
  });
}

// ---------- E: the signature ----------
const SIGN = 'MICHAELANGELVS · BONAROTVS · FLORENTINVS · FACIEBAT';
function sceneSign(t) {
  const a = span(t, 41.8, 55.8, 0.4, 0.4);
  if (a <= 0) return;
  const z = eio(seg(t, 42.0, 43.6));
  // zoom onto the sash
  ST = { x: lerp(81, CX - 110 * 6.4, z), y: lerp(740, 330 + 116 * 6.4, z), s: lerp(3.6, 6.4, z) };
  A(a, () => {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 770); ctx.clip();
    statue(1, { sash: seg(t, 42.4, 43.4) });
    ctx.restore();
    A(seg(t, 43.8, 44.6), () => {
      // the inscription, unrolled under the sash
      const n = Math.floor(seg(t, 44.0, 45.6) * SIGN.length);
      ctx.fillStyle = 'rgba(29,26,31,0.82)'; k.rrect(40, 600, W - 80, 120, 12); ctx.fill();
      font(700, 27, SERIF); ctx.letterSpacing = '1px';
      text(SIGN.slice(0, n), CX, 640, { align: 'center', base: 'middle', color: C.gold, spacing: '1px' });
      label('“Michelangelo Buonarroti, Florentine, was making it”', CX, 686, { size: 23, col: C.soft, align: 'center', fam: SERIF });
    });
    A(seg(t, 47.0, 47.8) * (1 - seg(t, 51.0, 51.6)), () => {
      ctx.fillStyle = 'rgba(29,26,31,0.86)'; k.rrect(40, 90, 520, 120, 12); ctx.fill();
      label('Giorgio Vasari, Lives of the Artists:', 60, 124, { size: 23, weight: 700, col: C.blue });
      label('visitors credited “our Gobbo from Milan”,', 60, 156, { size: 23, col: C.soft, fam: SERIF });
      label('so he carved his name one night', 60, 186, { size: 23, col: C.soft, fam: SERIF });
    });
    A(seg(t, 51.4, 52.0), () => {
      ctx.fillStyle = 'rgba(29,26,31,0.86)'; k.rrect(40, 90, 520, 120, 12); ctx.fill();
      ctx.save(); ctx.translate(300, 150); ctx.rotate(-0.08);
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; k.rrect(-150, -34, 300, 68, 8); ctx.stroke();
      label('DOUBTED', 0, 2, { size: 38, weight: 800, col: C.red, align: 'center' });
      ctx.restore();
    });
  });
}

// ---------- F: 1972 and the glass ----------
function sceneGlass(t) {
  const a = span(t, 55.6, 65.0, 0.4, 0.0);
  if (a <= 0) return;
  ST = { x: 81, y: 740, s: 3.6 };
  A(a, () => {
    niche(1);
    statue(1, { damage: span(t, 56.6, 60.4, 0.5, 0.6) });
    A(seg(t, 56.0, 56.8), () => {
      label(`21 MAY ${ATTACK}`, 56, 96, { size: 26, weight: 700, col: C.red });
      label('damaged: Mary’s arm, nose and an eyelid', 56, 130, { size: 23, col: C.soft });
    });
    A(seg(t, 60.6, 61.4), () => { label('restored: over 100 fragments', 56, 172, { size: 24, weight: 700, col: C.ink }); label('glued back with marble powder', 56, 204, { size: 23, col: C.soft }); });
    // the glass slides in
    const g = eio(seg(t, 61.6, 63.4));
    if (g > 0) {
      const x = lerp(W + 20, 50, g);
      ctx.fillStyle = C.glass; ctx.fillRect(x, 200, W - 100, 560);
      ctx.strokeStyle = 'rgba(200,230,250,0.6)'; ctx.lineWidth = 2; ctx.strokeRect(x, 200, W - 100, 560);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 60, 240); ctx.lineTo(x + 160, 340); ctx.moveTo(x + 90, 230); ctx.lineTo(x + 150, 290); ctx.stroke();
      A(seg(t, 63.0, 63.6), () => label('bulletproof glass', W - 70, 230, { size: 24, weight: 700, col: C.blue, align: 'right' }));
    }
  });
}

Kit.scene({
  width: W, height: H, duration: 65, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    if (t < 14.2) { sceneIntro(t); ST = { x: 81, y: 740, s: 3.6 }; statue(span(t, 0, 14.6, 0.8, 0.0)); }
    sceneSize(t);
    scenePyramid(t);
    sceneSign(t);
    sceneGlass(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 400, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.blue, '^': C.gold } });
  },
});
