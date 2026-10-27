// Explainer for engineering-trajans-column-hill (Roma): the inscription on Trajan's Column says the column shows how
// high a hill was dug away for Trajan's forum; digs found a street and houses under it, so the "hill" was most
// likely the slope of the Quirinal, cut back about 100 Roman feet and held up by Trajan's Markets. Look: a geological
// cross-section at dawn, tufa strata in ochre and brown, white marble, a gold Roman-foot ruler as the motif; red for
// the cut. Saira for captions and numbers, Cardo for the Latin and labels.
//
// Facts:
// - Platner & Ashby, A Topographical Dictionary of Ancient Rome (1929), "Forum Traiani" (LacusCurtius): the forum
//   needed much excavation and levelling; inscription CIL VI 960, "... ad declarandum quantae altitudinis mons et
//   locus tan[tis oper]ibus sit egestus"; Cassius Dio 68.16.3: the whole site was hilly and he cut it down as far as
//   the column rises, making the forum level. This "was formerly taken to mean that the height of the column (100
//   Roman feet) was that of a ridge between the Capitoline and Quirinal hills which had to be cut away, but geological
//   evidence showed that it never existed. This was confirmed by the discovery of an ancient street and houses of the
//   early empire beneath the foundation of the column" (NS 1907; Boni's work of 1906). "The least unsatisfactory
//   explanation" (Hülsen 1911): mons is the eastern shoulder of the Quirinal, cut back so far that the height of the
//   excavation was approximately 100 feet. Column: shaft and base of 18 blocks, 3.70 m across, with the capital and
//   plinth 100 Roman feet (29.77 m); pedestal 5.4 m high, 5.5 m square, with a door and the inscription above it, and
//   a chamber in which Trajan's ashes in a golden urn were probably placed (Eutropius 8.5; Dio 69.2); 185 steps; 43
//   slit windows; a gilt-bronze statue of Trajan on top.
// - Cassius Dio, Roman History 68.16 (tr. Cary, LacusCurtius): "For that entire section had been hilly and he had cut
//   it down for a distance equal to the height of the column". Dio wrote in the early 3rd century AD.
// - Wikipedia, "Trajan's Column": dedicated 12 May AD 113; about 35 m high with its pedestal; spiral frieze 23 turns;
//   Sixtus V put a bronze St Peter on top on 4 December 1587; Trajan's statue disappeared in the Middle Ages.
// - Wikipedia, "Trajan": emperor from 98 to August 117; by his death the empire had reached its maximum territorial
//   extent. Wikipedia, "Trajan's Forum": inaugurated in 112; Trajan's Market buttressed the excavated edge of the
//   Quirinal (Carandini; Coarelli). Mercati di Traiano (official site): the Markets were built "to occupy and support
//   the cutting of the slopes of the Quirinal Hill", on several levels, with the Via Biberatica between them.
// The section is a schematic: the slope and the terraces are drawn to show the idea, not surveyed.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  The column in its forum, AD 113; Trajan's reign on a timeline of the empire.
//  B  9.6–18.6  A ruler of Roman feet: 100 feet, 29.8 m, on a 5.4 m base. The inscription.
//  C 18.8–32.4  The old reading: a ridge as high as the column, dug away.
//  D 32.6–41.6  The test: a street and houses under the foundation; no ridge stood here.
//  E 41.8–55.4  The Quirinal cut back about 100 feet; Trajan's Markets built against the cut.
//  F 55.6–64.6  Ashes in the base, AD 117; St Peter on top since 1587.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky1: '#141c2b', sky2: '#2a3346', sky3: '#7a5a4a', ink: '#f7f1e6', soft: 'rgba(247,241,230,0.74)', faint: 'rgba(247,241,230,0.24)',
  marble: '#efe8da', marble2: '#cfc5b2', shade: '#a89d88', tufa1: '#c48a52', tufa2: '#9c6338', tufa3: '#6f4128', soil: '#4a2e1f',
  gold: '#f2c14e', red: '#e4573d', brick: '#b5552f', brick2: '#8e3e22', stone: '#8c8577', bronze: '#5a4a36',
};
const SANS = 'Saira', SERIF = 'Cardo';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const FOOT = 29.77 / 100; // metres per Roman foot, from Platner's 100 feet = 29.77 m
const COLUMN_FT = 100, COLUMN_M = COLUMN_FT * FOOT, BASE_M = 5.4, BASE_W = 5.5, SHAFT_D = 3.7, TURNS = 23;
const TOTAL_M = COLUMN_M + BASE_M; // about 35 m, as Wikipedia gives with the pedestal
if (Math.abs(COLUMN_M - 29.77) > 1e-9 || Math.round(TOTAL_M) !== 35) throw new Error('numbers');
const DEDICATED = 113, REIGN = [98, 117], DIED = 117, PETER = 1587;

// ---------- the section: ground, scale ----------
const GROUND = 680, PX = 12.5; // forum floor (y) and pixels per metre
const Y = (m) => GROUND - m * PX;
const COLX = 200; // the column's axis
const CUTX = 610; // where the Quirinal was cut back

function columnShape(x, s = 1, { statue = 'trajan', grow = 1, chamber = 0 } = {}) {
  // pedestal
  const bw = BASE_W * PX * s, bh = BASE_M * PX * s, base = GROUND;
  ctx.fillStyle = C.marble2; ctx.fillRect(x - bw / 2, base - bh, bw, bh);
  ctx.fillStyle = C.marble; ctx.fillRect(x - bw / 2 - 4, base - bh - 6, bw + 8, 8); ctx.fillRect(x - bw / 2 - 4, base - 8, bw + 8, 8);
  // the inscription panel over the door
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x - bw * 0.3, base - bh * 0.78, bw * 0.6, bh * 0.26);
  ctx.fillStyle = 'rgba(60,40,30,0.75)'; ctx.fillRect(x - bw * 0.1, base - bh * 0.42, bw * 0.2, bh * 0.42);
  if (chamber > 0) A(chamber, () => {
    ctx.fillStyle = '#2b1d16'; ctx.fillRect(x - bw * 0.34, base - bh * 0.5, bw * 0.68, bh * 0.38);
    // a golden urn
    const ux = x + bw * 0.12, uy = base - bh * 0.16;
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(ux - 9, uy); ctx.quadraticCurveTo(ux - 14, uy - 16, ux - 6, uy - 22); ctx.lineTo(ux + 6, uy - 22); ctx.quadraticCurveTo(ux + 14, uy - 16, ux + 9, uy); ctx.closePath(); ctx.fill();
    ctx.fillRect(ux - 7, uy - 26, 14, 4);
  });
  // shaft, drawn from the bottom up
  const sh = COLUMN_M * PX * s * grow, sw = SHAFT_D * PX * s, top = base - bh - sh;
  ctx.fillStyle = C.marble; ctx.fillRect(x - sw / 2, top, sw, sh);
  ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(x + sw * 0.18, top, sw * 0.32, sh);
  // the spiral frieze: 23 turns, as slanting bands
  ctx.save(); ctx.beginPath(); ctx.rect(x - sw / 2, top, sw, sh); ctx.clip();
  ctx.strokeStyle = 'rgba(120,100,80,0.45)'; ctx.lineWidth = 1.6;
  const turn = (COLUMN_M * PX * s) / TURNS;
  for (let i = -1; i <= TURNS + 1; i++) {
    const y0 = base - bh - i * turn;
    ctx.beginPath(); ctx.moveTo(x - sw / 2, y0); ctx.lineTo(x + sw / 2, y0 - turn * 0.9); ctx.stroke();
  }
  ctx.restore();
  if (grow < 1) return;
  // capital and the statue
  ctx.fillStyle = C.marble2; ctx.fillRect(x - sw * 0.75, top - 8 * s, sw * 1.5, 10 * s);
  ctx.fillStyle = C.marble; ctx.fillRect(x - sw * 0.35, top - 22 * s, sw * 0.7, 14 * s);
  const sy = top - 22 * s;
  if (statue) {
    const col = statue === 'peter' ? C.bronze : C.gold;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x - 9 * s, sy); ctx.lineTo(x - 6 * s, sy - 34 * s); ctx.lineTo(x + 6 * s, sy - 34 * s); ctx.lineTo(x + 9 * s, sy); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x, sy - 40 * s, 6 * s, 0, TAU); ctx.fill();
    if (statue === 'peter') { ctx.strokeStyle = col; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x + 10 * s, sy - 30 * s); ctx.lineTo(x + 16 * s, sy - 48 * s); ctx.stroke(); }
    else { ctx.strokeStyle = col; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x - 10 * s, sy - 26 * s); ctx.lineTo(x - 12 * s, sy - 52 * s); ctx.stroke(); }
  }
}

/** A ruler of Roman feet standing on the ground at x, from height m0 (metres), up to `ft` feet. */
function ruler(x, m0, ft, a = 1, { side = 'right', label = true } = {}) {
  A(a, () => {
    const y0 = Y(m0), y1 = Y(m0 + ft * FOOT);
    ctx.fillStyle = C.gold; ctx.fillRect(x - 4, y1, 8, y0 - y1);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
    for (let f = 0; f <= ft; f += 10) {
      const y = Y(m0 + f * FOOT), l = f % 50 === 0 ? 16 : 9;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(side === 'right' ? x + l : x - l, y); ctx.stroke();
    }
    if (label) {
      font(600, 22, SERIF);
      const tx = side === 'right' ? x + 22 : x - 22, al = side === 'right' ? 'left' : 'right';
      for (const f of [0, 50, 100]) if (f <= ft) text(`${f}`, tx, Y(m0 + f * FOOT), { align: al, base: 'middle', color: C.gold });
    }
  });
}

function ground(xa = 0, xb = W) {
  // below the forum floor: strata
  ctx.fillStyle = C.tufa2; ctx.fillRect(xa, GROUND, xb - xa, 34);
  ctx.fillStyle = C.tufa3; ctx.fillRect(xa, GROUND + 34, xb - xa, 36);
  const g = ctx.createLinearGradient(0, GROUND + 70, 0, H); g.addColorStop(0, C.soil); g.addColorStop(0.5, '#2e1d14'); g.addColorStop(1, '#140e0a');
  ctx.fillStyle = g; ctx.fillRect(xa, GROUND + 70, xb - xa, H - GROUND - 70);
  ctx.fillStyle = '#d8cfbd'; ctx.fillRect(xa, GROUND - 3, xb - xa, 6); // the marble paving of the forum
}

// ---------- timeline of the empire (A) ----------
function empireLine(a) {
  A(a, () => {
    const L = 330, R = 820, y = 470, X = (yr) => L + (R - L) * ((yr + 27) / (476 + 27));
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
    // Trajan's reign
    const r = seg(globalT, 5.4, 6.6);
    ctx.fillStyle = C.gold; ctx.fillRect(X(REIGN[0]), y - 12, (X(REIGN[1]) - X(REIGN[0])) * r, 24);
    font(500, 22, SERIF);
    text('27 BC', L, y + 34, { align: 'center', base: 'middle', color: C.soft });
    text('first emperor', L, y + 60, { align: 'left', base: 'middle', color: C.soft });
    text('AD 476', R, y + 34, { align: 'right', base: 'middle', color: C.soft });
    text('last emperor in the West', R, y + 60, { align: 'right', base: 'middle', color: C.soft });
    A(r, () => {
      font(700, 26); text('TRAJAN, AD 98–117', X(107), y - 40, { align: 'center', base: 'middle', color: C.gold, spacing: '1px' });
      font(500, 22, SERIF); text('the empire at its greatest extent', X(117) + 4, y - 74, { align: 'left', base: 'middle', color: C.ink });
    });
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(DEDICATED), y, 6, 0, TAU); ctx.fill();
  });
}

let globalT = 0;

// ---------- A: the column, AD 113 ----------
function sceneColumn(t) {
  A(span(t, 0, 9.6, 0.4, 0.4), () => {
    ground();
    columnShape(COLX, 1, { grow: eout(seg(t, 0.3, 2.4)) });
    A(seg(t, 1.6, 2.4), () => {
      font(700, 34, SERIF); text('COLUMNA TRAIANA', 330, 290, { base: 'middle', color: C.ink, spacing: '4px' });
      font(600, 26); text(`ROME · DEDICATED AD ${DEDICATED}`, 330, 334, { base: 'middle', color: C.gold, spacing: '2px' });
    });
    empireLine(seg(t, 5.0, 5.6));
  });
}

// ---------- B: the ruler and the inscription ----------
const INSCR = [
  'SENATVS·POPVLVSQVE·ROMANVS', 'IMP·CAESARI·DIVI·NERVAE·F·NERVAE', 'TRAIANO·AVG·GERM·DACICO·PONTIF', 'MAXIMO·TRIB·POT·XVII·IMP·VI·COS·VI·P·P',
  'AD·DECLARANDVM·QVANTAE·ALTITVDINIS', 'MONS·ET·LOCVS·TANT[IS·OPER]IBVS·SIT·EGESTVS',
];
function sceneRuler(t) {
  A(span(t, 9.4, 18.8, 0.4, 0.4), () => {
    ground();
    columnShape(COLX, 1);
    const r = eio(seg(t, 9.8, 11.4));
    ruler(COLX + 50, BASE_M, COLUMN_FT * r, 1 - seg(t, 14.0, 14.4));
    A(seg(t, 11.0, 11.8) * (1 - seg(t, 13.8, 14.2)), () => {
      font(800, 54); text(`${COLUMN_FT} ROMAN FEET`, 330, 330, { base: 'middle', color: C.gold });
      font(600, 34); text(`= ${COLUMN_M.toFixed(1)} m`, 330, 384, { base: 'middle', color: C.ink });
      font(500, 24, SERIF); text(`a Roman foot: about ${Math.round(FOOT * 100)} cm`, 330, 430, { base: 'middle', color: C.soft });
      font(500, 24, SERIF); text(`on a base ${BASE_M} m high`, 330, 560, { base: 'middle', color: C.soft });
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(322, 566); ctx.lineTo(COLX + 44, Y(BASE_M / 2)); ctx.stroke();
    });
    // the inscription, zoomed
    A(seg(t, 14.2, 14.8), () => {
      const x0 = 300, y0 = 200, w = 530, h = 300;
      ctx.fillStyle = 'rgba(20,28,43,0.92)'; ctx.fillRect(x0 - 20, y0 - 40, w + 40, h + 190);
      ctx.fillStyle = C.marble; ctx.fillRect(x0, y0, w, h);
      ctx.strokeStyle = C.shade; ctx.lineWidth = 3; ctx.strokeRect(x0 + 8, y0 + 8, w - 16, h - 16);
      const lit = seg(t, 15.6, 16.4);
      INSCR.forEach((s, i) => {
        // letters a little larger in the top lines, as on the stone
        const size = 20 - i * 0.6;
        font(700, size, SERIF);
        const hl = i >= 4;
        text(s, x0 + w / 2, y0 + 44 + i * 43, { align: 'center', base: 'middle', color: hl ? lerpCol('#3b3026', '#a3471f', lit) : '#3b3026', spacing: '1px' });
      });
      ctx.strokeStyle = C.marble; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 12, y0 + h); ctx.lineTo(COLX + 18, Y(BASE_M * 0.62)); ctx.stroke();
      A(lit, () => {
        font(600, 26); text('“to show how high a hill and site', x0 + w / 2, y0 + h + 42, { align: 'center', base: 'middle', color: C.gold });
        text('were dug away for such great works”', x0 + w / 2, y0 + h + 76, { align: 'center', base: 'middle', color: C.gold });
        font(500, 22, SERIF); text('CIL VI 960; the last letters are restored', x0 + w / 2, y0 + h + 116, { align: 'center', base: 'middle', color: C.soft });
      });
    });
  });
}
function lerpCol(a, b, x) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  return `rgb(${Math.round(lerp(r1, r2, x))},${Math.round(lerp(g1, g2, x))},${Math.round(lerp(b1, b2, x))})`;
}

// ---------- C: the old reading: a ridge dug away ----------
function ridge(level, a = 1, { ghost = false } = {}) {
  // a ridge filling the whole site up to `level` metres
  A(a, () => {
    if (level <= 0) return;
    const top = Y(level);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(-4, GROUND); ctx.lineTo(-4, top + 26); ctx.quadraticCurveTo(CX, top - 26, W + 4, top + 16); ctx.lineTo(W + 4, GROUND); ctx.closePath();
    if (ghost) { ctx.setLineDash([10, 8]); ctx.strokeStyle = C.tufa1; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); return; }
    const g = ctx.createLinearGradient(0, top, 0, GROUND); g.addColorStop(0, C.tufa1); g.addColorStop(1, C.tufa2);
    ctx.fillStyle = g; ctx.fill(); ctx.clip();
    ctx.strokeStyle = 'rgba(70,40,25,0.35)'; ctx.lineWidth = 2;
    for (let m = 3; m < 40; m += 5) { ctx.beginPath(); ctx.moveTo(0, Y(m) + 6); ctx.lineTo(W, Y(m) - 6); ctx.stroke(); }
    ctx.restore();
  });
}
function sceneOld(t) {
  A(span(t, 18.6, 32.6, 0.4, 0.4), () => {
    ground();
    // the ridge, then dug away in layers
    const dig = eio(seg(t, 23.8, 27.4));
    const level = COLUMN_M * (1 - dig);
    ridge(level, 1);
    // little carts of earth leaving, during the dig
    A(seg(t, 23.8, 24.2) * (1 - seg(t, 27.2, 27.6)), () => {
      for (let i = 0; i < 6; i++) {
        const u = ((t - 23.8) * 0.5 + i / 6) % 1, x = lerp(40, W - 40, u), y = Y(level) - 10;
        ctx.fillStyle = C.tufa3; ctx.fillRect(x - 12, y - 10, 24, 12);
        ctx.fillStyle = '#2b1d16'; ctx.beginPath(); ctx.arc(x - 7, y + 3, 4, 0, TAU); ctx.arc(x + 7, y + 3, 4, 0, TAU); ctx.fill();
      }
    });
    A(seg(t, 26.6, 27.4), () => columnShape(COLX, 1));
    A(seg(t, 27.6, 28.4), () => {
      ridge(COLUMN_M, 1, { ghost: true });
      ruler(COLX + 50, BASE_M, COLUMN_FT, 1, { label: false });
      ruler(470, 0, COLUMN_FT, 1);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(COLX + 54, Y(BASE_M + COLUMN_M)); ctx.lineTo(466, Y(COLUMN_M)); ctx.stroke(); ctx.setLineDash([]);
      font(600, 24, SERIF); text('the hill’s old top?', 520, Y(COLUMN_M) - 30, { base: 'middle', color: C.tufa1 });
    });
    A(seg(t, 19.2, 20.0) * (1 - seg(t, 23.4, 23.8)), () => {
      font(700, 30); text('CASSIUS DIO, EARLY 200s AD', CX, 150, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
      font(500, 26, SERIF); text('“that entire section had been hilly”', CX, 196, { align: 'center', base: 'middle', color: C.gold });
    });
    A(seg(t, 23.6, 24.2) * (1 - seg(t, 27.4, 27.8)), () => {
      font(700, 30); text('CUT DOWN BY THE COLUMN’S HEIGHT', CX, 150, { align: 'center', base: 'middle', color: C.ink, spacing: '1px' });
    });
    A(seg(t, 28.2, 28.8), () => {
      font(700, 30); text('THE COLUMN AS A RULER', CX, 150, { align: 'center', base: 'middle', color: C.gold, spacing: '2px' });
    });
  });
}

// ---------- D: the test ----------
function sceneTest(t) {
  A(span(t, 32.4, 41.8, 0.4, 0.4), () => {
    ground();
    columnShape(COLX, 1);
    // the trench under the foundation
    const open = eio(seg(t, 33.0, 34.6));
    const tx0 = COLX - 150, tx1 = COLX + 150, ty0 = GROUND + 6, ty1 = GROUND + 96;
    A(open, () => {
      ctx.fillStyle = '#1b130f'; ctx.fillRect(tx0, ty0, (tx1 - tx0), (ty1 - ty0));
      // the column's foundation block
      ctx.fillStyle = '#9b927f'; ctx.fillRect(COLX - BASE_W * PX * 0.75, ty0, BASE_W * PX * 1.5, 34);
      // the street: paving stones
      for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? C.stone : '#a09887'; ctx.beginPath(); ctx.ellipse(tx0 + 22 + i * 32, ty1 - 14, 15, 8, 0, 0, TAU); ctx.fill(); }
      // house walls either side
      ctx.fillStyle = C.brick; for (const x of [tx0 + 8, tx1 - 30]) { ctx.fillRect(x, ty0 + 36, 22, ty1 - ty0 - 42); }
      ctx.strokeStyle = C.brick2; ctx.lineWidth = 1; for (const x of [tx0 + 8, tx1 - 30]) for (let y = ty0 + 42; y < ty1 - 8; y += 8) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 22, y); ctx.stroke(); }
    });
    A(seg(t, 34.6, 35.4), () => {
      font(700, 28); text('A STREET AND HOUSES', 400, 560, { base: 'middle', color: C.ink, spacing: '1px' });
      font(500, 24, SERIF); text('of the early empire, under the foundation', 400, 600, { base: 'middle', color: C.soft });
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(396, 612); ctx.lineTo(tx1 - 40, ty1 - 18); ctx.stroke();
      font(500, 22, SERIF); text('Giacomo Boni’s digs, from 1906', 400, 640, { base: 'middle', color: C.soft });
    });
    // no ridge here
    A(seg(t, 37.4, 38.2), () => {
      ridge(COLUMN_M, 1, { ghost: true });
      const x = 560, y = Y(COLUMN_M) + 20, r = 34;
      ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke();
      font(700, 30); text('NO RIDGE STOOD HERE', CX, 150, { align: 'center', base: 'middle', color: C.red, spacing: '2px' });
      font(500, 26, SERIF); text('so which “hill” did the stone mean?', CX, 196, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- E: the Quirinal cut back; the Markets ----------
const TOE = 300; // the foot of the old slope (schematic)
const SLOPE = COLUMN_M / ((CUTX - TOE) / PX); // so that the slope stands 100 feet high where the face was cut
const HILLTOP = 44; // metres above the forum floor, schematic
const hillH = (x) => Math.min(HILLTOP, Math.max(0, (x - TOE) / PX) * SLOPE);
function hillside(cut) {
  // the natural slope from TOE; the cut lowers everything in front of the face to the forum floor
  const e = eio(clamp(cut));
  const level = (x) => (x < CUTX ? hillH(x) * (1 - e) : hillH(x));
  ctx.save();
  ctx.beginPath(); ctx.moveTo(TOE - 4, GROUND);
  for (let x = TOE; x <= W + 4; x += 2) ctx.lineTo(x, Y(level(x)));
  ctx.lineTo(W + 4, GROUND); ctx.closePath();
  const g = ctx.createLinearGradient(0, Y(HILLTOP), 0, GROUND); g.addColorStop(0, C.tufa1); g.addColorStop(1, C.tufa2);
  ctx.fillStyle = g; ctx.fill(); ctx.clip();
  ctx.strokeStyle = 'rgba(70,40,25,0.35)'; ctx.lineWidth = 2;
  for (let m = 3; m < 46; m += 5) { ctx.beginPath(); ctx.moveTo(TOE, Y(m) + 8); ctx.lineTo(W, Y(m) - 6); ctx.stroke(); }
  ctx.restore();
}
function markets(a) {
  // brick halls in terraces against the cut face: three storeys at the bottom, a street, more halls above (schematic)
  A(a, () => {
    const tiers = [[0, 10, 0], [10, 10, 40], [20, COLUMN_M - 20, 80]]; // [from m, height m, set back px]
    tiers.forEach(([m0, hm, back], i) => {
      const g = clamp(a * 3 - i);
      if (g <= 0) return;
      const x0 = CUTX - 190 + back, y0 = Y(m0 + hm * g), w = CUTX - x0;
      ctx.fillStyle = C.brick; ctx.fillRect(x0, y0, w, Y(m0) - y0);
      ctx.strokeStyle = C.brick2; ctx.lineWidth = 1;
      for (let y = Y(m0) - 6; y > y0; y -= 7) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke(); }
      // arched openings
      ctx.fillStyle = '#3a1e12';
      for (let j = 0; j < 5; j++) { const ax = x0 + 12 + j * 34; if (ax + 18 > CUTX - 6) continue; ctx.beginPath(); ctx.moveTo(ax, Y(m0)); ctx.lineTo(ax, Y(m0 + hm * g * 0.55)); ctx.arc(ax + 9, Y(m0 + hm * g * 0.55), 9, Math.PI, 0); ctx.lineTo(ax + 18, Y(m0)); ctx.closePath(); ctx.fill(); }
    });
  });
}
function sceneCut(t) {
  A(span(t, 41.6, 55.6, 0.4, 0.4), () => {
    ground();
    const cut = seg(t, 42.4, 45.6);
    hillside(cut);
    columnShape(COLX, 1);
    A(seg(t, 42.0, 42.6), () => {
      font(700, 30, SERIF); text('QUIRINAL', 752, 520, { align: 'center', base: 'middle', color: '#3a2315', spacing: '3px' });
      text('HILL', 752, 556, { align: 'center', base: 'middle', color: '#3a2315', spacing: '3px' });
      font(600, 24); text('FORUM', 360, GROUND + 40, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    });
    // the earth taken away, as a dashed outline of the old slope
    A(seg(t, 43.4, 44.2), () => {
      ctx.setLineDash([8, 7]); ctx.strokeStyle = C.tufa1; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(TOE, GROUND); ctx.lineTo(CUTX, Y(COLUMN_M)); ctx.stroke(); ctx.setLineDash([]);
      font(500, 22, SERIF); text('the old slope', (TOE + CUTX) / 2 - 64, Y(COLUMN_M / 2) - 12, { align: 'center', base: 'middle', color: C.tufa1 });
    });
    // the ruler moves from the column to the cut face
    const mv = eio(seg(t, 46.6, 48.2));
    ruler(lerp(COLX + 50, CUTX - 14, mv), lerp(BASE_M, 0, mv), COLUMN_FT, seg(t, 46.4, 46.8) * (1 - seg(t, 50.6, 51.0)), { side: 'left', label: mv > 0.98 });
    A(seg(t, 48.2, 48.8) * (1 - seg(t, 50.6, 51.0)), () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(CUTX, GROUND); ctx.lineTo(CUTX, Y(COLUMN_M)); ctx.stroke();
      font(700, 30); text('CUT FACE ≈ 100 FEET', CX, 150, { align: 'center', base: 'middle', color: C.red, spacing: '1px' });
      font(500, 24, SERIF); text('Christian Hülsen’s reading, 1911', CX, 194, { align: 'center', base: 'middle', color: C.soft });
    });
    markets(seg(t, 51.0, 53.4));
    A(seg(t, 52.0, 52.8), () => {
      font(700, 30); text('TRAJAN’S MARKETS', CX, 150, { align: 'center', base: 'middle', color: C.gold, spacing: '2px' });
      font(500, 24, SERIF); text('brick halls on terraces, holding up the cut', CX, 194, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- F: ashes and St Peter ----------
function sceneEnd(t) {
  A(span(t, 55.4, 65.2, 0.4, 0), () => {
    ground();
    const swap = seg(t, 61.4, 62.6);
    const statue = t < 61.4 ? 'trajan' : t < 62.0 ? null : 'peter';
    A(1, () => columnShape(COLX, 1, { statue, chamber: seg(t, 56.2, 57.0) }));
    A(seg(t, 56.6, 57.4), () => {
      font(700, 30); text(`AD ${DIED}`, 330, 520, { base: 'middle', color: C.gold });
      font(500, 26, SERIF); text('Trajan’s ashes, in a golden urn,', 330, 562, { base: 'middle', color: C.ink });
      text('laid in a room inside the base', 330, 596, { base: 'middle', color: C.ink });
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(324, 600); ctx.lineTo(COLX + 22, GROUND - 22); ctx.stroke();
    });
    A(seg(t, 60.4, 61.0), () => {
      font(700, 30); text(swap < 1 ? 'TRAJAN’S STATUE: LOST' : `SINCE ${PETER}: ST PETER`, 330, 230, { base: 'middle', color: swap < 1 ? C.gold : C.ink, spacing: '1px' });
      font(500, 24, SERIF); text(swap < 1 ? 'gilt bronze, gone in the Middle Ages' : 'set up by Pope Sixtus V', 330, 272, { base: 'middle', color: C.soft });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.sky1); lg.addColorStop(0.55, C.sky2); lg.addColorStop(1, '#1b1410');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(W * 0.8, GROUND - 40, 10, W * 0.8, GROUND - 40, 520); rg.addColorStop(0, 'rgba(242,170,110,0.22)'); rg.addColorStop(1, 'rgba(242,170,110,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, 'In Rome stands *Trajan’s Column*, set up in *AD 113* in Emperor Trajan’s new forum.'],
  [5.0, 9.4, 'Trajan ruled AD 98–117; by then the Roman Empire had reached its ~greatest size~.'],
  [9.6, 14.0, 'The column is *100 Roman feet* tall, about 29.8 metres, on a base 5.4 m high.'],
  [14.2, 18.6, 'Its inscription says it shows how high a ~hill~ was dug away for these works.'],
  [18.8, 23.2, 'The historian Cassius Dio, about a century later, says the whole site was hilly.'],
  [23.4, 27.8, 'Trajan, he writes, cut it down by the column’s height to make the forum ~level~.'],
  [28.0, 32.4, 'So the column would be a ruler, as tall as the hill that once filled the site.'],
  [32.6, 37.0, 'But digs in the early 1900s found a Roman *street* and houses under its foundation.'],
  [37.2, 41.6, 'So no 100-foot ridge ever stood on that spot. Which hill did the inscription mean?'],
  [41.8, 46.2, 'A likely answer: the slope of the *Quirinal Hill* beside the forum, cut back.'],
  [46.4, 50.8, 'Cut back so far that its face stood about *100 feet* high: the column’s height.'],
  [51.0, 55.4, '*Trajan’s Markets* rose against the cut: brick halls on terraces that hold it up.'],
  [55.6, 60.0, 'When Trajan died in AD 117, his ashes were placed in a room inside the base.'],
  [60.2, 64.6, 'His statue on top was lost; since 1587 a bronze *St Peter* has stood there.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [SANS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx; globalT = t;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneColumn(t);
    sceneRuler(t);
    sceneOld(t);
    sceneTest(t);
    sceneCut(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.tufa1 } });
  },
});
