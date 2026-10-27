// Explainer for history-capitoline-wolf-dating (Roma): the bronze she-wolf of the Capitoline Museums, long thought
// Etruscan, was cast in one piece, unlike ancient large bronzes, and two clocks in the clay core left inside it, the
// radiocarbon of organic remains and the thermoluminescence of the clay, point to the Middle Ages; scholars still
// disagree. Look: a museum at night, the wolf in bronze, a cutaway of a lost-wax mould, a decay curve and glowing
// crystal traps on a timeline from 600 BC to today. Uncial Antiqua for titles, Noto Sans for captions and labels.
//
// Facts:
// - Wikipedia, "Capitoline Wolf": 75 cm high, 114 cm long; in the Palazzo dei Conservatori since 1471, when Pope Sixtus
//   IV had it moved there; long thought an Etruscan work of the 5th century BC (later scholars: an unknown artist of
//   about 480 or 470 BC), with the twins added in the late 15th century, probably by Antonio del Pollaiuolo; Anna
//   Maria Carruba, given the task of restoring it in 1997, found it was cast in a single piece by a variation of the
//   lost-wax technique; ancient Greek and Roman bronzes were typically made of several pieces; single-piece casting
//   was widely used in the Middle Ages for items such as bells and cannons; in 2006 Carruba and the archaeologist
//   Adriano La Regina argued for a medieval date; radiocarbon dating at the University of Salento in February 2007 of
//   organic residues in the casting cores gave 963 ± 15 BP, AD 1021–1153 at 95% confidence (Calcagnile et al. 2019);
//   at a conference in Rome on 28 February 2008 most academics still supported an Etruscan origin; John Osborne
//   (British School at Rome), Andrea Carandini and Lellia Cracco Ruggini have contested the revised dating; a 2025
//   lead isotope study (Clemenza et al.) found metal like that of 8th–11th-century coins from Italy and the
//   Carolingian and Ottonian lands; it too is contested, and there is no consensus.
// - Martini & Galli, Appl. Sci. 11:7820 (2021): clay-core samples taken during the restoration of 1997–2000; quartz
//   and feldspar crystals in clay act as dosimeters: heating empties their traps, then natural radioactivity fills
//   them again; heating a sample in the lab releases the stored charge as light; age = palaeodose ÷ dose rate; for
//   the Lupa the dose rate was hard to pin down (water content, the bronze shielding, its unknown history), but the
//   casting could not be before the 8th century nor after the 14th; the Etruscan origin is ruled out; the comparison
//   with Calcagnile's 34 radiocarbon ages agrees on a medieval date.
// - Calcagnile et al., Nucl. Instr. Meth. B 455 (2019), abstract: AMS radiocarbon dating of organic residues in the
//   casting cores "firmly anchor the statue to the XI–XII centuries CE".
// - Wikipedia, "Radiocarbon dating": radiocarbon ages use the Libby half-life of 5,568 years (mean life 8,033) and
//   count back from 1950 ("BP"); calibration turns them into calendar dates.
// Computed here: the carbon-14 left after 963 radiocarbon years, exp(−963/8033) = 88.7%.
//
// Scene plan (62.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The wolf, the twins; "Etruscan", the twins after 1471.
//  B  9.2–13.4  The restoration of 1997–2000.
//  C 13.6–22.2  Lost-wax casting in section: core, wax, mould, bronze; the core stays inside.
//  D 22.4–31.0  Ancient bronzes in pieces; the wolf in one piece; bells.
//  E 31.2–44.2  Radiocarbon: decay, 34 samples, AD 1021–1153; thermoluminescence: traps, glow.
//  F 44.4–62.4  The TL range; the timeline of the debate; no consensus.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  night: '#15110e', night2: '#2a211b', ink: '#f2e9dc', soft: 'rgba(242,233,220,0.72)', faint: 'rgba(242,233,220,0.22)',
  bronze: '#8a6a43', bronze2: '#5e472c', bronzeHi: '#c09a63', patina: '#6f9479', clay: '#9a6a4a', wax: '#e8c66a', mould: '#8d8a83',
  molten: '#ff9a3d', lab: '#7cc0e6', glow: '#ffd38a', red: '#e06a4a', etr: '#d4a373',
};
const TITLE = 'Uncial Antiqua', SANS = 'Noto Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- numbers ----------
const BP = 963, BP_ERR = 15, MEAN_LIFE = 8033;
const LEFT = Math.exp(-BP / MEAN_LIFE); // 0.887
const CAL = [1021, 1153], TL = [701, 1400], ETRUSCAN = -480, SAMPLES = 34;
if (Math.round(LEFT * 1000) !== 887) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'In Rome’s Capitoline Museums stands the *she-wolf* that, legend says, fed Romulus and Remus.'],
  [4.8, 9.0, 'She was long thought ~Etruscan~, some 2,500 years old; the twins were added in the 15th century.'],
  [9.2, 13.4, 'In 1997–2000 she was restored, and the restorer *Anna Maria Carruba* studied how she was made.'],
  [13.6, 17.8, 'Such bronzes are cast by the *lost-wax* method: a clay core, a layer of wax, a clay mould.'],
  [18.0, 22.2, 'The wax melts out, molten bronze fills the gap, and the clay core stays trapped inside.'],
  [22.4, 26.6, 'Large ancient bronzes were cast in pieces and joined. This wolf was cast ~in one piece~.'],
  [26.8, 31.0, 'Casting in one piece was common in the Middle Ages: for bells, for example.'],
  [31.2, 35.4, 'So scientists dated the core. Its organic remains hold carbon-14, which decays at a known rate.'],
  [35.6, 39.8, `${SAMPLES} samples, measured at the University of Salento, gave *AD ${CAL[0]} to ${CAL[1]}*.`],
  [40.0, 44.2, 'A second clock: heat empties tiny traps in the clay’s crystals; natural radiation refills them.'],
  [44.4, 48.6, 'Heated in the lab, a sample glows: the more light, the longer since the casting.'],
  [48.8, 53.0, 'For the wolf that clock is less precise, but it rules out the Etruscans: *8th to 14th century*.'],
  [53.2, 57.4, 'Not everyone agrees: at a conference in Rome in 2008, most scholars still backed ~Etruscan~.'],
  [57.6, 61.8, 'A 2025 study of the metal pointed to the Middle Ages too. The debate is not settled.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(CX, 380, 40, CX, 420, 760);
  rg.addColorStop(0, C.night2); rg.addColorStop(1, C.night);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
}

// ---------- the wolf ----------
/** The she-wolf in side view, head to the left, open-mouthed, ears up, curly mane, long thin legs; s scales it. */
function wolf(x, y, s, { col = C.bronze, twins = 1, joints = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineJoin = 'round';
  // body and head in one outline
  ctx.beginPath();
  ctx.moveTo(-206, -126);                                   // snout tip
  ctx.lineTo(-180, -146); ctx.lineTo(-170, -186); ctx.lineTo(-154, -160); // brow, ear
  ctx.lineTo(-146, -186); ctx.lineTo(-132, -152);           // second ear
  ctx.quadraticCurveTo(-112, -132, -84, -126);              // nape
  ctx.quadraticCurveTo(20, -122, 130, -118);                // back
  ctx.quadraticCurveTo(172, -116, 178, -88);                // rump
  ctx.lineTo(186, -70); ctx.lineTo(176, 60); ctx.lineTo(160, 60); ctx.lineTo(150, -24); // hind leg
  ctx.quadraticCurveTo(120, -34, 92, -30);                  // flank
  for (let i = 0; i < 5; i++) { const tx = 80 - i * 30; ctx.lineTo(tx, -30); ctx.lineTo(tx - 8, -12); ctx.lineTo(tx - 16, -30); } // teats
  ctx.lineTo(-70, -36); ctx.lineTo(-66, 60); ctx.lineTo(-84, 60); ctx.lineTo(-96, -30); // foreleg
  ctx.quadraticCurveTo(-120, -60, -140, -96);               // chest, throat
  ctx.lineTo(-170, -108); ctx.lineTo(-198, -106); ctx.lineTo(-180, -116); // open jaw
  ctx.closePath(); ctx.fill();
  // the far legs, a shade darker
  ctx.fillStyle = C.bronze2;
  ctx.beginPath(); ctx.moveTo(-58, -36); ctx.lineTo(-46, 56); ctx.lineTo(-60, 56); ctx.lineTo(-70, -30); ctx.fill();
  ctx.beginPath(); ctx.moveTo(132, -30); ctx.lineTo(142, 56); ctx.lineTo(128, 56); ctx.lineTo(120, -30); ctx.fill();
  // tail
  ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(176, -100); ctx.quadraticCurveTo(198, -50, 190, 6); ctx.stroke();
  // the mane: rows of small curls on the neck and along the back
  ctx.strokeStyle = C.bronzeHi; ctx.lineWidth = 2;
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-136 + i * 12 + r * 4, -138 + r * 13, 4.5, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke(); }
  for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(-70 + i * 14, -122, 4, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke(); }
  // eye
  ctx.fillStyle = C.bronzeHi; ctx.beginPath(); ctx.arc(-176, -138, 3.5, 0, TAU); ctx.fill();
  // the twins under her
  A(twins, () => {
    ctx.fillStyle = C.bronze2;
    for (const [tx, up] of [[-6, 0], [56, -8]]) {
      ctx.beginPath(); ctx.arc(tx, 6 + up, 12, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(tx, 34 + up, 15, 21, 0, 0, TAU); ctx.fill();
      ctx.lineWidth = 8; ctx.strokeStyle = C.bronze2; ctx.beginPath(); ctx.moveTo(tx - 4, 50 + up); ctx.lineTo(tx - 22, 62); ctx.stroke();
    }
  });
  // the joints a piece-cast statue would have
  A(joints, () => {
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([8, 6]);
    for (const [a, b, c, d] of [[-118, -112, -112, -44], [-108, -48, -64, -48], [138, -48, 188, -48], [150, -112, 186, -40]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
    ctx.setLineDash([]);
  });
  ctx.restore();
}
function plinth(x, y, w) {
  ctx.fillStyle = '#6d6257'; ctx.fillRect(x - w / 2, y, w, 26);
  ctx.fillStyle = '#8b8073'; ctx.fillRect(x - w / 2 - 14, y + 26, w + 28, 16);
}

// ---------- the timeline from 600 BC to today ----------
const TL0 = -600, TL1 = 2026, TX0 = 80, TX1 = 784;
const tx = (yr) => TX0 + ((yr - TL0) / (TL1 - TL0)) * (TX1 - TX0);
function axis(y, a = 1) {
  A(a, () => {
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(TX0, y); ctx.lineTo(TX1, y); ctx.stroke();
    font(600, 22);
    for (const [yr, lab] of [[-500, '500 BC'], [0, 'AD 1'], [500, '500'], [1000, '1000'], [1500, '1500'], [2000, '2000']]) {
      ctx.fillStyle = C.soft; ctx.fillRect(tx(yr) - 1.5, y - 8, 3, 16);
      text(lab, tx(yr), y + 30, { align: 'center', base: 'middle', color: C.soft });
    }
  });
}
function bar(y, from, to, col, label, a = 1, h = 26) {
  A(a, () => {
    ctx.fillStyle = col; k.rrect(tx(from), y - h / 2, Math.max(6, tx(to) - tx(from)), h, 6); ctx.fill();
    font(700, 24); text(label, (tx(from) + tx(to)) / 2, y - h / 2 - 20, { align: 'center', base: 'middle', color: col });
  });
}

// ---------- scenes ----------
function sceneWolf(t) {
  const a = span(t, 0, 13.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    plinth(CX + 20, 560, 470);
    wolf(CX + 40, 500, 1.15, { twins: 1 });
    A(seg(t, 0.8, 1.8) * (1 - seg(t, 4.6, 5.0)), () => { font(400, 64, TITLE); text('Lupa Capitolina', CX, 150, { align: 'center', base: 'middle', color: C.bronzeHi }); });
    A(seg(t, 1.6, 2.4) * (1 - seg(t, 4.6, 5.0)), () => { font(600, 24); text('bronze, 75 cm high, 114 cm long', CX, 214, { align: 'center', base: 'middle', color: C.soft }); });
    A(seg(t, 5.0, 5.8) * (1 - seg(t, 9.0, 9.4)), () => {
      font(700, 30); text('“Etruscan, c. 480 BC”', CX, 170, { align: 'center', base: 'middle', color: C.etr });
      ctx.strokeStyle = C.glow; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(CX + 66, 540, 90, 52, 0, 0, TAU); ctx.stroke();
      font(700, 26); text('twins: added after 1471', CX + 66, 640, { align: 'center', base: 'middle', color: C.glow });
    });
    // the restoration: a lamp and a magnifier passing over her
    A(span(t, 9.2, 13.6, 0.4, 0.4), () => {
      const mx = lerp(CX - 160, CX + 180, eio(seg(t, 9.6, 13.0)));
      ctx.strokeStyle = C.lab; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(mx, 400, 64, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx + 46, 446); ctx.lineTo(mx + 100, 500); ctx.stroke();
      ctx.fillStyle = 'rgba(124,192,230,0.12)'; ctx.beginPath(); ctx.arc(mx, 400, 62, 0, TAU); ctx.fill();
      font(700, 28); text('restoration 1997–2000', CX, 170, { align: 'center', base: 'middle', color: C.lab });
    });
  });
}
function sceneLostWax(t) {
  const a = span(t, 13.6, 22.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a section through one leg: core, wax, mould; then the wax runs out and bronze runs in
    const cx = CX, top = 150, bot = 620, rCore = 60, rWax = 84, rMould = 150;
    const wax = 1 - eio(seg(t, 18.2, 19.6)), bronze = eio(seg(t, 19.8, 21.2));
    const leg = (r, col) => { ctx.fillStyle = col; k.rrect(cx - r, top + 80 - r * 0.3, r * 2, bot - top - 80 + r * 0.3, r * 0.9); ctx.fill(); };
    A(seg(t, 15.0, 15.8), () => leg(rMould, C.mould));
    leg(rWax, '#1e1814');
    A(Math.min(seg(t, 14.2, 15.0), wax), () => leg(rWax, C.wax));
    A(bronze, () => leg(rWax, C.molten));
    leg(rCore, C.clay);
    // the pour: a funnel at the top
    A(seg(t, 15.0, 15.8), () => { ctx.fillStyle = C.mould; ctx.beginPath(); ctx.moveTo(cx + 60, top - 20); ctx.lineTo(cx + 120, top - 20); ctx.lineTo(cx + 96, top + 60); ctx.lineTo(cx + 84, top + 60); ctx.closePath(); ctx.fill(); });
    A(seg(t, 18.4, 19.0) * (1 - seg(t, 19.6, 19.8)), () => {
      ctx.fillStyle = C.wax;
      for (let i = 0; i < 6; i++) { const yy = bot + 10 + ((t * 120 + i * 30) % 90); ctx.beginPath(); ctx.ellipse(cx - 40 + i * 16, yy, 4, 7, 0, 0, TAU); ctx.fill(); }
    });
    A(seg(t, 19.8, 20.4) * (1 - seg(t, 21.2, 21.6)), () => { ctx.fillStyle = C.molten; ctx.fillRect(cx + 84, top - 60, 12, 120); });
    // labels
    font(700, 26);
    A(seg(t, 13.8, 14.4), () => text('clay core', cx - rCore - 230, 420, { base: 'middle', color: C.clay }));
    A(seg(t, 14.4, 15.0) * wax, () => text('wax', cx + rWax + 80, 470, { base: 'middle', color: C.wax }));
    A(seg(t, 15.2, 15.8), () => text('clay mould', cx + rMould + 14, 300, { base: 'middle', color: C.mould }));
    A(bronze, () => text('bronze', cx + rWax + 80, 470, { base: 'middle', color: C.molten }));
    A(seg(t, 21.0, 21.6), () => { font(700, 28); text('the core stays inside', cx, 680, { align: 'center', base: 'middle', color: C.clay }); });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
    A(seg(t, 13.8, 14.4), () => { ctx.beginPath(); ctx.moveTo(cx - rCore - 92, 420); ctx.lineTo(cx - 20, 420); ctx.stroke(); });
  });
}
function scenePieces(t) {
  const a = span(t, 22.4, 31.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const apart = eio(seg(t, 22.8, 24.0)) * (1 - eio(seg(t, 25.0, 26.0)));
    // left: an ancient bronze as separate castings, joined (drawn as a figure in pieces)
    A(1 - seg(t, 26.6, 27.2), () => {
      const x = 240, y = 520;
      ctx.fillStyle = C.patina;
      ctx.beginPath(); ctx.arc(x, y - 250 - apart * 30, 34, 0, TAU); ctx.fill(); // head
      k.rrect(x - 50, y - 210, 100, 150, 20); ctx.fill(); // torso
      ctx.save(); ctx.translate(-apart * 30, 0); k.rrect(x - 90, y - 200, 34, 130, 14); ctx.fill(); ctx.restore(); // arm
      ctx.save(); ctx.translate(apart * 30, 0); k.rrect(x + 56, y - 200, 34, 130, 14); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(0, apart * 30); k.rrect(x - 44, y - 56, 36, 150, 14); ctx.fill(); k.rrect(x + 8, y - 56, 36, 150, 14); ctx.fill(); ctx.restore();
      font(700, 26); text('ancient: cast in pieces', x, 680, { align: 'center', base: 'middle', color: C.patina });
    });
    // right: the wolf, one pour
    A(seg(t, 24.4, 25.2) * (1 - seg(t, 26.6, 27.2)), () => {
      wolf(600, 500, 0.62, { twins: 0 });
      font(700, 26); text('the wolf: one piece', 600, 680, { align: 'center', base: 'middle', color: C.bronzeHi });
    });
    // a bell, cast in one piece
    A(seg(t, 27.0, 27.8), () => {
      const x = CX, y = 520;
      ctx.fillStyle = C.bronze;
      ctx.beginPath(); ctx.moveTo(x - 60, y - 220); ctx.quadraticCurveTo(x - 70, y - 60, x - 150, y); ctx.lineTo(x + 150, y); ctx.quadraticCurveTo(x + 70, y - 60, x + 60, y - 220); ctx.quadraticCurveTo(x, y - 250, x - 60, y - 220); ctx.fill();
      ctx.fillStyle = C.bronze2; ctx.beginPath(); ctx.arc(x, y + 14, 22, 0, TAU); ctx.fill();
      font(700, 28); text('medieval bells: one piece', x, 680, { align: 'center', base: 'middle', color: C.bronzeHi });
    });
  });
}
function sceneClocks(t) {
  const a = span(t, 31.2, 48.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 40.0) {
      // radiocarbon: the share of carbon-14 left, against years
      const L = 110, R = 780, T = 140, B = 520, maxY = 3000;
      const X = (yr) => L + (yr / maxY) * (R - L), Y = (f) => B - (f - 0.6) / 0.4 * (B - T);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
      font(600, 22);
      for (const f of [0.6, 0.7, 0.8, 0.9, 1.0]) text(`${Math.round(f * 100)}%`, L - 12, Y(f), { align: 'right', base: 'middle', color: C.soft });
      for (const yr of [0, 1000, 2000, 3000]) text(Kit.fmt(yr), X(yr), B + 28, { align: 'center', base: 'middle', color: C.soft });
      text('years since the plant or animal died', (L + R) / 2, B + 62, { align: 'center', base: 'middle', color: C.soft });
      text('carbon-14 left', L, T - 26, { base: 'middle', color: C.soft });
      const draw = eio(seg(t, 31.6, 33.6));
      ctx.strokeStyle = C.lab; ctx.lineWidth = 5; ctx.beginPath();
      for (let yr = 0; yr <= maxY * draw; yr += 20) { const x = X(yr), y = Y(Math.exp(-yr / MEAN_LIFE)); yr ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      // the Etruscan expectation and the measurement
      const etrAge = 1950 - ETRUSCAN;
      A(seg(t, 34.0, 34.8), () => {
        ctx.fillStyle = C.etr; ctx.beginPath(); ctx.arc(X(etrAge), Y(Math.exp(-etrAge / MEAN_LIFE)), 10, 0, TAU); ctx.fill();
        font(700, 24); text('if Etruscan', X(etrAge) + 16, Y(Math.exp(-etrAge / MEAN_LIFE)) - 26, { base: 'middle', color: C.etr });
      });
      A(seg(t, 35.8, 36.6), () => {
        const x = X(BP), y = Y(LEFT);
        ctx.fillStyle = C.glow; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill();
        ctx.setLineDash([6, 6]); ctx.strokeStyle = C.glow; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(x, y); ctx.lineTo(x, B); ctx.stroke(); ctx.setLineDash([]);
        font(700, 24); text(`the wolf’s cores: ${(LEFT * 100).toFixed(1)}%, ${BP} ± ${BP_ERR} years`, x + 18, y - 30, { base: 'middle', color: C.glow });
      });
      A(seg(t, 37.0, 37.8), () => {
        ctx.fillStyle = 'rgba(21,17,14,0.9)'; k.rrect(170, 600, 524, 80, 14); ctx.fill();
        font(800, 44); text(`AD ${CAL[0]}–${CAL[1]}`, CX, 640, { align: 'center', base: 'middle', color: C.glow });
      });
      return;
    }
    // thermoluminescence: a crystal's traps empty in the heat of casting, fill with time, glow when heated again
    const traps = 12, x0 = 190, y0 = 230;
    const fill = t < 44.4 ? Math.floor(eio(seg(t, 40.8, 43.8)) * traps) : traps - Math.floor(eio(seg(t, 45.0, 47.0)) * traps);
    ctx.fillStyle = 'rgba(124,192,230,0.12)'; k.rrect(x0 - 40, y0 - 70, 564, 300, 24); ctx.fill();
    font(700, 26); text('a crystal in the clay', x0 - 20, y0 - 98, { base: 'middle', color: C.lab });
    for (let i = 0; i < traps; i++) {
      const x = x0 + (i % 6) * 88, y = y0 + Math.floor(i / 6) * 120;
      ctx.strokeStyle = C.lab; ctx.lineWidth = 3; ctx.strokeRect(x, y, 60, 60);
      if (i < fill) { ctx.fillStyle = C.glow; ctx.beginPath(); ctx.arc(x + 30, y + 30, 14, 0, TAU); ctx.fill(); }
    }
    A(span(t, 40.4, 44.2, 0.4, 0.3), () => {
      font(700, 26); text('radiation fills the traps, year by year', CX, 560, { align: 'center', base: 'middle', color: C.glow });
    });
    if (t >= 44.4) {
      const glow = seg(t, 45.0, 45.8) * (1 - seg(t, 47.6, 48.4));
      A(glow, () => {
        const g = ctx.createRadialGradient(CX, 330, 20, CX, 330, 360); g.addColorStop(0, 'rgba(255,211,138,0.55)'); g.addColorStop(1, 'rgba(255,211,138,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, 760);
      });
      font(700, 26); text('heated in the lab: the stored charge comes out as light', CX, 560, { align: 'center', base: 'middle', color: C.glow });
      font(800, 38); text('age = stored dose ÷ dose per year', CX, 650, { align: 'center', base: 'middle', color: C.ink });
    }
  });
}
function sceneDebate(t) {
  const a = span(t, 48.8, 62.4, 0.5, 0);
  if (a <= 0) return;
  A(a, () => {
    const y = 540;
    axis(y, 1);
    bar(y - 130, ETRUSCAN - 20, ETRUSCAN + 20, C.etr, 'Etruscan?', 1, 30);
    bar(y - 70, TL[0], TL[1], C.lab, 'thermoluminescence', seg(t, 49.0, 49.8), 26);
    bar(y - 160, CAL[0], CAL[1], C.glow, 'radiocarbon', 1, 26);
    wolf(CX, 230, 0.42, { twins: 1 });
    font(400, 44, TITLE); text('Etruscan or medieval?', CX, 112, { align: 'center', base: 'middle', color: C.bronzeHi });
    A(seg(t, 53.4, 54.2), () => {
      ctx.fillStyle = 'rgba(21,17,14,0.88)'; k.rrect(130, 620, 604, 96, 16); ctx.fill();
      font(700, 26); text('Rome, 28 February 2008: most scholars', CX, 650, { align: 'center', base: 'middle', color: C.etr });
      text('still argued for an Etruscan wolf', CX, 688, { align: 'center', base: 'middle', color: C.etr });
    });
    A(seg(t, 57.8, 58.6), () => {
      ctx.fillStyle = 'rgba(21,17,14,0.95)'; k.rrect(130, 620, 604, 96, 16); ctx.fill();
      font(700, 26); text('2025: lead in the bronze like that of', CX, 650, { align: 'center', base: 'middle', color: C.patina });
      text('8th–11th-century coins. Also contested.', CX, 688, { align: 'center', base: 'middle', color: C.patina });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 62.4, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneWolf(t);
    sceneLostWax(t);
    scenePieces(t);
    sceneClocks(t);
    sceneDebate(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.glow, '~': C.etr, '^': C.lab } });
  },
});
