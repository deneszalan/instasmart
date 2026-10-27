// Explainer for history-arch-of-constantine-spolia (Roma): the Arch of Constantine (AD 315) is built partly from
// sculpture taken from older monuments of Trajan, Hadrian and Marcus Aurelius, with the emperors' faces recut as
// Constantine's. Look: the arch's south front as a flat elevation at dusk, the Colosseum's arcades behind; each
// sculpture lights up in its emperor's colour (Trajan blue, Hadrian green, Marcus Aurelius violet, Constantine gold),
// like a colour-coded museum label. Playfair Display for titles and Latin, Jost for captions and labels.
//
// Facts:
// - Wikipedia, "Arch of Constantine": 21 m high, 25.9 m wide, 7.4 m deep; three bays, the central one 11.5 m high and
//   6.5 m wide, the side ones 7.4 m by 3.4 m; built 312-315 and dedicated by the Senate for Constantine's decennalia
//   and his victory over Maxentius at the Milvian Bridge (28 October 312); opened on 25 July 315. Reused: from
//   Trajan's time, two attic panels on the short ends and two in the central passage (a large frieze of the Dacian
//   war), and the Dacians on top of the columns; from Hadrian's, four pairs of roundels above the side bays, hunts and
//   sacrifices, the emperor's head reworked in all of them, into Constantine on the north hunting scenes and into
//   Licinius or Constantius I on the sacrifice scenes, reversed on the south; from Marcus Aurelius, eight attic
//   panels, probably from a monument of his war of 169-175. New: the continuous frieze of the Italian campaign, the
//   column bases, the spandrels and the sun and moon roundels. Why reuse (debated): speed, from late 312 to summer
//   315; a judgement of quality; an older view of declining skill, now less favoured; ideology, linking Constantine to
//   the "good emperors" (Elsner). The attic inscription: "instinctu divinitatis", usually "inspired by the divine",
//   vague enough for pagans and Christians. Wikipedia, "Battle of the Milvian Bridge": Maxentius drowned in the Tiber;
//   Lactantius tells of a dream, Eusebius of a vision of a cross of light; the Edict of Milan (313) made Christianity
//   a recognised and tolerated religion.
// - Encyclopaedia Romana, "Arch of Constantine": the roundels from Hadrian's time "nearly two hundred years earlier";
//   on four roundels the head was resculpted as Constantine, some with a halo; the eight attic reliefs come from an
//   arch of AD 176 for Marcus Aurelius, and heads were substituted on them too; the eight Dacians come from the Forum
//   of Trajan; reuse publicly affirmed Constantine as the good emperors' "legitimate successor".
// - Archaeology magazine (J. A. Lobell, March/April 2022): C. Brian Rose, "I think they used spolia because they
//   wanted to do it quickly and cheaply"; about three years to finish before the decennalia; "all the heads of
//   Hadrian in these roundels were recut to transform them into a young Constantine" (Wikipedia names Licinius or
//   Constantius I for some). Hadrian wore a beard in his portraits; Constantine's are clean-shaven.
// The elevation is schematic, built from the overall dimensions above; the sculptures are placeholders, not copies.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  The arch beside the Colosseum, AD 315; the Milvian Bridge, 312.
//  B  9.6–32.4  The sculpture sorted by age: Trajan, Hadrian, Marcus Aurelius; what is new in 315.
//  C 32.6–41.6  A roundel recut: Hadrian's bearded head becomes a young Constantine.
//  D 41.8–55.4  Why: under three years to build; quickly and cheaply; heir of the good emperors.
//  E 55.6–64.6  The inscription's unnamed divinity; toleration for Christians in 313.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky1: '#1d1830', sky2: '#4a3550', sky3: '#c0806a', ink: '#fbf4e8', soft: 'rgba(251,244,232,0.76)', faint: 'rgba(251,244,232,0.22)',
  marble: '#eadcc2', marble2: '#d2c1a2', shade: '#b29f80', dark: '#2a2030', colo: 'rgba(40,30,48,0.55)',
  trajan: '#6fb0e8', hadrian: '#8fd07a', marcus: '#c49af0', constantine: '#f3bf4f', red: '#ef6a5a',
};
const TITLE = 'Playfair Display', SANS = 'Jost';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const ARCH_W = 25.9, ARCH_H = 21, MID_W = 6.5, MID_H = 11.5, SIDE_W = 3.4, SIDE_H = 7.4;
const BATTLE = 312, DEDICATED = 315, MARCUS_ARCH = 176, TOLERATION = 313;
const REIGNS = { trajan: [98, 117], hadrian: [117, 138], marcus: [161, 180] };
const ageIn315 = (y) => DEDICATED - y;
// Trajan's pieces were about 200 years old; Hadrian's nearly 200 (Encyclopaedia Romana); Marcus Aurelius's 139.
if (ageIn315(REIGNS.trajan[1]) !== 198 || ageIn315(MARCUS_ARCH) !== 139) throw new Error('numbers');

// ---------- the elevation ----------
const PX = 24, BASE = 700, X0 = CX - (ARCH_W * PX) / 2;
const mx = (m) => X0 + m * PX, my = (m) => BASE - m * PX;
const MID_L = (ARCH_W - MID_W) / 2, SIDE_L = [3.2, ARCH_W - 3.2 - SIDE_W];
const COLS = [1.7, MID_L - 1.15, MID_L + MID_W + 1.15, ARCH_W - 1.7]; // column axes
const ENT = 13.0, ATTIC = 14.6; // top of the columns, bottom of the attic
// sculptures: [group, x, y (bottom), w, h, kind]
const PIECES = [];
// Marcus Aurelius: four attic panels on this face, two each side of the inscription
for (const x of [1.0, 4.4, ARCH_W - 4.4 - 2.6, ARCH_W - 1.0 - 2.6]) PIECES.push({ g: 'marcus', x, y: ATTIC + 0.9, w: 2.6, h: 3.4, kind: 'panel' });
// Trajan's Dacians: on top of the four columns
COLS.forEach((x) => PIECES.push({ g: 'trajan', x: x - 0.6, y: ATTIC, w: 1.2, h: 4.4, kind: 'dacian' }));
// Hadrian: two roundels above each side bay
for (const s of SIDE_L) for (const dx of [-0.75, 1.75]) PIECES.push({ g: 'hadrian', x: s + dx, y: 9.4, w: 2.4, h: 2.4, kind: 'roundel' });
// Constantine's narrow frieze over the side bays, and the column bases
for (const s of SIDE_L) PIECES.push({ g: 'constantine', x: s - 1.0, y: 8.0, w: SIDE_W + 2.0, h: 0.9, kind: 'frieze' });
COLS.forEach((x) => PIECES.push({ g: 'constantine', x: x - 0.75, y: 0.4, w: 1.5, h: 2.6, kind: 'base' }));
// Trajan's battle frieze inside the central passage (drawn in the opening, as if seen at an angle)
PIECES.push({ g: 'trajan', x: MID_L + 0.25, y: 3.4, w: 1.2, h: 4.6, kind: 'passage' });
PIECES.push({ g: 'trajan', x: MID_L + MID_W - 1.45, y: 3.4, w: 1.2, h: 4.6, kind: 'passage' });

function archBody(t) {
  // main block
  ctx.fillStyle = C.marble2; ctx.fillRect(mx(0), my(ARCH_H), ARCH_W * PX, ARCH_H * PX);
  ctx.fillStyle = C.marble; ctx.fillRect(mx(0), my(ATTIC), ARCH_W * PX, (ATTIC - ENT) * PX * 0 + 6);
  // cornices
  ctx.fillStyle = C.marble; ctx.fillRect(mx(-0.4), my(ATTIC), (ARCH_W + 0.8) * PX, 0.5 * PX);
  ctx.fillRect(mx(-0.3), my(ARCH_H), (ARCH_W + 0.6) * PX, 0.4 * PX);
  ctx.fillRect(mx(-0.3), my(3.4), (ARCH_W + 0.6) * PX, 0.3 * PX);
  // openings
  const arch = (l, w, h) => {
    ctx.beginPath(); ctx.moveTo(mx(l), BASE); ctx.lineTo(mx(l), my(h - w / 2)); ctx.arc(mx(l + w / 2), my(h - w / 2), (w / 2) * PX, Math.PI, 0); ctx.lineTo(mx(l + w), BASE); ctx.closePath();
  };
  ctx.fillStyle = C.dark; arch(MID_L, MID_W, MID_H); ctx.fill();
  for (const s of SIDE_L) { arch(s, SIDE_W, SIDE_H); ctx.fill(); }
  // columns with their entablature blocks
  COLS.forEach((x) => {
    ctx.fillStyle = C.marble; ctx.fillRect(mx(x - 0.45), my(ENT), 0.9 * PX, (ENT - 3.4) * PX);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(mx(x + 0.1), my(ENT), 0.3 * PX, (ENT - 3.4) * PX);
    ctx.fillStyle = C.marble; ctx.fillRect(mx(x - 0.75), my(ENT + 0.5), 1.5 * PX, 0.6 * PX);
    ctx.fillRect(mx(x - 0.8), my(ATTIC), 1.6 * PX, (ATTIC - ENT - 0.5) * PX);
  });
  // the inscription
  ctx.fillStyle = C.shade; ctx.fillRect(mx(MID_L - 0.3), my(ATTIC + 5.2), (MID_W + 0.6) * PX, 4.4 * PX);
  ctx.fillStyle = '#9c8a6c';
  for (let i = 0; i < 7; i++) ctx.fillRect(mx(MID_L + 0.1), my(ATTIC + 4.7) + i * 0.56 * PX, (MID_W - 0.2) * PX * (i === 6 ? 0.55 : 1), 0.22 * PX);
  void t;
}

/** Draw one piece of sculpture, tinted by its group with strength `tint`, dimmed with `dim`. */
function piece(p, tint, { dim = 0 } = {}) {
  const x = mx(p.x), y = my(p.y + p.h), w = p.w * PX, h = p.h * PX, col = C[p.g];
  ctx.save();
  ctx.globalAlpha *= 1 - 0.55 * dim;
  const fill = tint > 0 ? mixCol(C.marble, col, tint * 0.85) : C.marble;
  ctx.fillStyle = fill; ctx.strokeStyle = tint > 0 ? col : C.shade; ctx.lineWidth = 2;
  if (p.kind === 'roundel') {
    ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); ctx.fill(); ctx.stroke();
    // a rider and a tree, schematic
    ctx.fillStyle = 'rgba(60,40,30,0.35)';
    ctx.beginPath(); ctx.ellipse(x + w * 0.45, y + h * 0.62, w * 0.2, h * 0.09, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w * 0.45, y + h * 0.36, w * 0.07, 0, TAU); ctx.fill();
    ctx.fillRect(x + w * 0.72, y + h * 0.25, w * 0.05, h * 0.5);
  } else if (p.kind === 'dacian') {
    ctx.beginPath(); ctx.moveTo(x + w * 0.15, y + h); ctx.lineTo(x + w * 0.25, y + h * 0.25); ctx.quadraticCurveTo(x + w / 2, y + h * 0.16, x + w * 0.75, y + h * 0.25); ctx.lineTo(x + w * 0.85, y + h); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.12, w * 0.22, 0, TAU); ctx.fill(); ctx.stroke();
  } else if (p.kind === 'passage') {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + h * 0.08); ctx.lineTo(x + w, y + h * 0.92); ctx.lineTo(x, y + h); ctx.closePath();
    if (p.x > ARCH_W / 2) { ctx.beginPath(); ctx.moveTo(x, y + h * 0.08); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h * 0.92); ctx.closePath(); }
    ctx.globalAlpha *= 0.85; ctx.fill(); ctx.stroke();
  } else {
    ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = 'rgba(60,40,30,0.25)';
    const n = p.kind === 'frieze' ? 9 : p.kind === 'base' ? 1 : 3;
    for (let i = 0; i < n; i++) { const fx = x + (i + 0.5) * w / n; ctx.beginPath(); ctx.arc(fx, y + h * 0.3, Math.min(w / n, h) * 0.12, 0, TAU); ctx.fill(); ctx.fillRect(fx - Math.min(w / n, h) * 0.08, y + h * 0.38, Math.min(w / n, h) * 0.16, h * 0.5); }
  }
  ctx.restore();
}
function mixCol(a, b, x) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  return `rgb(${Math.round(lerp(r1, r2, x))},${Math.round(lerp(g1, g2, x))},${Math.round(lerp(b1, b2, x))})`;
}

/** The arch with each group tinted by tint[g] (0–1) and dimmed by dim[g]. */
function arch(t, tint = {}, dim = {}) {
  archBody(t);
  for (const p of PIECES) piece(p, tint[p.g] || 0, { dim: dim[p.g] || 0 });
}

function colosseum(a) {
  A(a, () => {
    // the Colosseum's arcades behind, to the left: four storeys, curving away
    ctx.fillStyle = C.colo;
    const x0 = -60, x1 = 330, top = 200;
    ctx.fillRect(x0, top, x1 - x0, BASE - top);
    ctx.fillStyle = 'rgba(29,24,48,0.6)';
    for (let s = 0; s < 3; s++) for (let i = 0; i < 9; i++) {
      const w = 30, x = x0 + 14 + i * 44, y = top + 34 + s * 150;
      ctx.beginPath(); ctx.moveTo(x, y + 110); ctx.lineTo(x, y + 15); ctx.arc(x + w / 2, y + 15, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + 110); ctx.closePath(); ctx.fill();
    }
  });
}

// ---------- A ----------
function sceneIntro(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    colosseum(seg(t, 0.2, 1.2));
    arch(t);
    A(seg(t, 1.4, 2.2), () => {
      font(700, 40, TITLE); text('ARCUS CONSTANTINI', CX, 96, { align: 'center', base: 'middle', color: C.ink, spacing: '3px' });
      font(500, 26); text(`DEDICATED AD ${DEDICATED}, BESIDE THE COLOSSEUM`, CX, 140, { align: 'center', base: 'middle', color: C.constantine, spacing: '2px' });
    });
    A(seg(t, 5.2, 6.0), () => {
      ctx.fillStyle = 'rgba(29,24,48,0.85)'; ctx.fillRect(110, 520, 644, 170);
      font(700, 30, TITLE); text(`28 OCTOBER ${BATTLE}`, CX, 560, { align: 'center', base: 'middle', color: C.constantine });
      font(500, 26); text('Constantine defeats Maxentius at the Milvian Bridge', CX, 602, { align: 'center', base: 'middle', color: C.ink });
      font(400, 24); text('on the Tiber, north of Rome; Maxentius drowns', CX, 640, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- B: sorted by age ----------
const GROUPS = [
  ['trajan', 14.2, 'TRAJAN', 'emperor AD 98–117 · about 200 years old in 315'],
  ['hadrian', 18.8, 'HADRIAN', 'emperor AD 117–138 · nearly 200 years old'],
  ['marcus', 23.4, 'MARCUS AURELIUS', `an arch of about AD ${MARCUS_ARCH} · ${ageIn315(MARCUS_ARCH)} years old`],
  ['constantine', 28.0, 'CONSTANTINE', 'carved new, 312–315'],
];
function sceneSorted(t) {
  A(span(t, 9.4, 32.6, 0.4, 0.4), () => {
    colosseum(1);
    const old = seg(t, 10.4, 11.4);
    const tint = {}, dim = {};
    for (const [g, t0] of GROUPS) {
      const on = seg(t, t0 + 0.2, t0 + 1.0);
      tint[g] = on;
      // while a group is the subject, the others step back
      const subject = t >= t0 && t < t0 + 4.6;
      dim[g] = 0;
      void subject;
    }
    for (const [g, t0] of GROUPS) {
      for (const [g2] of GROUPS) if (g2 !== g && t >= t0 && t < t0 + 4.6) dim[g2] = Math.max(dim[g2], seg(t, t0, t0 + 0.6) * (1 - seg(t, t0 + 4.2, t0 + 4.6)) * 0.8);
    }
    arch(t, tint, dim);
    // a question mark over the old pieces
    A(old * (1 - seg(t, 13.8, 14.2)), () => {
      font(700, 34, TITLE); text('NOT ALL OF IT IS FROM 315', CX, 110, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
    });
    for (const [g, t0, name, sub] of GROUPS) {
      A(seg(t, t0 + 0.2, t0 + 0.8) * (1 - seg(t, t0 + 4.2, t0 + 4.6)), () => {
        font(700, 36, TITLE); text(name, CX, 100, { align: 'center', base: 'middle', color: C[g], spacing: '3px' });
        font(500, 26); text(sub, CX, 144, { align: 'center', base: 'middle', color: C.ink });
      });
    }
    // a legend at the end
    A(seg(t, 32.0, 32.4), () => {});
  });
}

// ---------- C: a roundel recut ----------
function head(x, y, s, beard, halo, col) {
  if (halo > 0) A(halo, () => { ctx.strokeStyle = C.constantine; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.arc(x, y - 6 * s, 64 * s, 0, TAU); ctx.stroke(); });
  ctx.fillStyle = col;
  // a head in profile, facing right
  ctx.beginPath();
  ctx.moveTo(x - 40 * s, y + 70 * s);
  ctx.quadraticCurveTo(x - 52 * s, y - 10 * s, x - 30 * s, y - 50 * s);
  ctx.quadraticCurveTo(x, y - 74 * s, x + 30 * s, y - 50 * s);
  ctx.quadraticCurveTo(x + 44 * s, y - 30 * s, x + 42 * s, y - 8 * s);
  ctx.lineTo(x + 56 * s, y + 10 * s); ctx.lineTo(x + 42 * s, y + 18 * s);
  ctx.quadraticCurveTo(x + 44 * s, y + 40 * s, x + 26 * s, y + 52 * s);
  ctx.lineTo(x + 10 * s, y + 70 * s); ctx.closePath(); ctx.fill();
  // hair
  ctx.fillStyle = 'rgba(80,60,40,0.35)';
  ctx.beginPath(); ctx.arc(x - 6 * s, y - 30 * s, 36 * s, Math.PI * 0.95, Math.PI * 1.95); ctx.fill();
  // eye
  ctx.fillStyle = 'rgba(60,40,30,0.6)'; ctx.beginPath(); ctx.arc(x + 22 * s, y - 14 * s, 3.5 * s, 0, TAU); ctx.fill();
  if (beard > 0) A(beard, () => {
    ctx.fillStyle = 'rgba(110,84,58,0.7)';
    ctx.beginPath(); ctx.moveTo(x - 24 * s, y + 4 * s); ctx.quadraticCurveTo(x - 20 * s, y + 66 * s, x + 18 * s, y + 62 * s); ctx.quadraticCurveTo(x + 46 * s, y + 46 * s, x + 40 * s, y + 22 * s); ctx.lineTo(x + 24 * s, y + 26 * s); ctx.quadraticCurveTo(x, y + 20 * s, x - 24 * s, y + 4 * s); ctx.fill();
    ctx.strokeStyle = 'rgba(70,50,35,0.6)'; ctx.lineWidth = 2 * s;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x - 16 * s + i * 9 * s, y + 18 * s); ctx.quadraticCurveTo(x - 12 * s + i * 9 * s, y + 40 * s, x - 6 * s + i * 8 * s, y + 56 * s); ctx.stroke(); }
  });
}
function sceneRecut(t) {
  A(span(t, 32.4, 41.8, 0.4, 0.4), () => {
    colosseum(0.5);
    A(0.25, () => arch(t, { trajan: 1, hadrian: 1, marcus: 1, constantine: 1 }));
    const cx = CX, cy = 440, R = 230;
    // the roundel, big
    ctx.fillStyle = mixCol(C.marble, C.hadrian, 0.25); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.hadrian; ctx.lineWidth = 6; ctx.stroke();
    // a horse, schematic, under the rider
    ctx.fillStyle = 'rgba(120,96,70,0.45)';
    ctx.beginPath(); ctx.ellipse(cx - 10, cy + 120, 140, 44, 0, 0, TAU); ctx.fill();
    ctx.fillRect(cx - 120, cy + 140, 18, 70); ctx.fillRect(cx + 90, cy + 140, 18, 70);
    const carve = seg(t, 37.4, 39.6);
    head(cx - 10, cy - 50, 1.6, 1 - carve, seg(t, 39.8, 40.6), mixCol('#efe3cb', '#f4ead6', carve));
    // chisel strokes while carving
    A(seg(t, 37.2, 37.6) * (1 - seg(t, 39.6, 40.0)), () => {
      const u = (t * 3) % 1;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx + 120 - u * 30, cy + 10 + u * 30); ctx.lineTo(cx + 60 - u * 30, cy + 40 + u * 30); ctx.stroke();
      for (let i = 0; i < 6; i++) { const a = i + t * 7; ctx.fillStyle = 'rgba(240,230,210,0.8)'; ctx.fillRect(cx + 40 + Math.cos(a) * 40, cy + 30 + Math.sin(a) * 30 + u * 20, 5, 5); }
    });
    A(seg(t, 33.0, 33.6), () => {
      font(700, 32, TITLE);
      const name = carve < 0.5 ? 'HADRIAN, BEARDED' : 'A YOUNG CONSTANTINE';
      text(name, CX, 120, { align: 'center', base: 'middle', color: carve < 0.5 ? C.hadrian : C.constantine, spacing: '2px' });
      font(500, 24); text('a roundel of Hadrian’s time, recut in 312–315', CX, 162, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- D: why ----------
function sceneWhy(t) {
  A(span(t, 41.6, 55.6, 0.4, 0.4), () => {
    colosseum(0.4);
    A(0.16, () => arch(t));
    // a time bar: late 312 to summer 315
    A(seg(t, 42.0, 42.6) * (1 - seg(t, 50.6, 51.0)), () => {
      const L = 120, R = 744, y = 300, X = (yr) => L + (R - L) * ((yr - 312) / 4);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
      for (let yr = 312; yr <= 316; yr++) { font(500, 24); text(`${yr}`, X(yr), y + 36, { align: 'center', base: 'middle', color: C.soft }); ctx.fillStyle = C.faint; ctx.fillRect(X(yr) - 1, y - 8, 2, 16); }
      const g = eio(seg(t, 42.6, 44.4));
      const a0 = X(312 + 10 / 12), a1 = X(315 + 6.8 / 12);
      ctx.fillStyle = C.constantine; ctx.fillRect(a0, y - 14, (a1 - a0) * g, 28);
      A(seg(t, 44.2, 44.8), () => {
        font(700, 30, TITLE); text('UNDER THREE YEARS', (a0 + a1) / 2, y - 50, { align: 'center', base: 'middle', color: C.constantine, spacing: '2px' });
        font(500, 24); text('battle, 28 Oct 312', a0, y + 76, { align: 'center', base: 'middle', color: C.ink });
        text('opened, 25 July 315', a1, y + 76, { align: 'center', base: 'middle', color: C.ink });
      });
      A(seg(t, 46.6, 47.2), () => {
        font(500, 30, TITLE); text('“quickly and cheaply”', CX, 480, { align: 'center', base: 'middle', color: C.ink });
        font(400, 24); text('C. Brian Rose, archaeologist, 2022', CX, 522, { align: 'center', base: 'middle', color: C.soft });
      });
    });
    // the good emperors in a row, then Constantine joins them
    A(seg(t, 51.0, 51.6), () => {
      const names = [['TRAJAN', C.trajan], ['HADRIAN', C.hadrian], ['MARCUS AURELIUS', C.marcus], ['CONSTANTINE', C.constantine]];
      names.forEach(([n, col], i) => {
        const x = 138 + i * 196, y = 380, a = i < 3 ? 1 : seg(t, 52.4, 53.2);
        A(a, () => {
          ctx.fillStyle = mixCol('#2a2030', col, 0.35); ctx.beginPath(); ctx.arc(x, y, 72, 0, TAU); ctx.fill();
          ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.stroke();
          head(x - 4, y + 4, 0.62, i < 3 && i !== 0 ? 1 : 0, 0, mixCol('#efe3cb', col, 0.25));
          font(600, 22); n.split(' ').forEach((w, j) => text(w, x, y + 100 + j * 28, { align: 'center', base: 'middle', color: col, spacing: '1px' }));
        });
      });
      font(700, 32, TITLE); text('ROME’S “GOOD EMPERORS”', CX, 190, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
      A(seg(t, 52.8, 53.4), () => { font(500, 26); text('and their heir, wearing their deeds', CX, 600, { align: 'center', base: 'middle', color: C.constantine }); });
    });
  });
}

// ---------- E: the inscription; 313 ----------
function chiRho(x, y, s, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 9 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 40 * s, y - 50 * s); ctx.lineTo(x + 40 * s, y + 50 * s); ctx.moveTo(x + 40 * s, y - 50 * s); ctx.lineTo(x - 40 * s, y + 50 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y + 70 * s); ctx.lineTo(x, y - 70 * s); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + 18 * s, y - 50 * s, 20 * s, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  ctx.lineCap = 'butt';
}
function sceneEnd(t) {
  A(span(t, 55.4, 65.2, 0.4, 0), () => {
    colosseum(0.6);
    const fade = seg(t, 60.0, 60.8);
    A(1 - 0.75 * fade, () => arch(t, { trajan: 0.5, hadrian: 0.5, marcus: 0.5, constantine: 0.5 }));
    // the inscription's key words
    A(seg(t, 55.8, 56.6), () => {
      const x0 = mx(MID_L - 0.6), y0 = my(ATTIC + 5.4), w = (MID_W + 1.2) * PX;
      font(700, 34, TITLE); text('QVOD INSTINCTV DIVINITATIS', CX, 96, { align: 'center', base: 'middle', color: C.constantine, spacing: '2px' });
      font(500, 26); text('“because, by the inspiration of the divinity …”', CX, 142, { align: 'center', base: 'middle', color: C.ink });
      A(1 - fade, () => { ctx.strokeStyle = C.constantine; ctx.lineWidth = 3; ctx.strokeRect(x0, y0, w, 4.8 * PX); ctx.beginPath(); ctx.moveTo(CX, 166); ctx.lineTo(CX, y0); ctx.stroke(); });
    });
    A(seg(t, 60.4, 61.2), () => {
      ctx.fillStyle = 'rgba(29,24,48,0.8)'; ctx.fillRect(90, 360, W - 180, 370);
      chiRho(CX, 500, 1.3, C.constantine);
      font(700, 32, TITLE); text(`${TOLERATION}: TOLERATION FOR CHRISTIANS`, CX, 655, { align: 'center', base: 'middle', color: C.ink, spacing: '1px' });
      font(400, 24); text('the chi-rho, first letters of Christ in Greek', CX, 698, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, BASE); lg.addColorStop(0, C.sky1); lg.addColorStop(0.7, C.sky2); lg.addColorStop(1, C.sky3);
  g.fillStyle = lg; g.fillRect(0, 0, W, BASE);
  const gg = g.createLinearGradient(0, BASE, 0, H); gg.addColorStop(0, '#3a2a26'); gg.addColorStop(1, '#151018');
  g.fillStyle = gg; g.fillRect(0, BASE, W, H - BASE);
  g.fillStyle = 'rgba(234,220,194,0.25)'; g.fillRect(0, BASE, W, 4);
}

const CUES = [
  [0.4, 4.8, 'Beside Rome’s Colosseum stands the *Arch of Constantine*, dedicated in *AD 315*.'],
  [5.0, 9.4, 'Rome’s Senate built it after Emperor Constantine beat his rival Maxentius in AD 312.'],
  [9.6, 14.0, 'Look closer: much of its sculpture is ~older~, taken from earlier monuments.'],
  [14.2, 18.6, 'From Emperor *Trajan*’s time, 200 years before: Dacian captives and battle reliefs.'],
  [18.8, 23.2, 'From Emperor *Hadrian*’s time: eight round reliefs of hunts and sacrifices.'],
  [23.4, 27.8, 'From Emperor *Marcus Aurelius*: eight panels, probably from an arch of AD 176.'],
  [28.0, 32.4, 'New in 315: the narrow frieze of ~Constantine’s~ own war, the column bases and more.'],
  [32.6, 37.0, 'The old emperors’ faces were ~recut~ or replaced, so that they show *Constantine*.'],
  [37.2, 41.6, 'In some roundels, Hadrian’s bearded head was recut into a young Constantine.'],
  [41.8, 46.2, 'Why reuse? Speed, for one: the arch went up between late 312 and 315.'],
  [46.4, 50.8, 'Archaeologist C. Brian Rose thinks they wanted to build it *quickly and cheaply*.'],
  [51.0, 55.4, 'Others see a message: Constantine shown as heir of Rome’s *good emperors*.'],
  [55.6, 60.0, 'Its inscription credits his win to the ~inspiration of the divinity~, left unnamed.'],
  [60.2, 64.6, 'Christian writers tell of a vision of Christ’s sign; in 313 Christians won toleration.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneIntro(t);
    sceneSorted(t);
    sceneRecut(t);
    sceneWhy(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.constantine, '~': C.marcus } });
  },
});
