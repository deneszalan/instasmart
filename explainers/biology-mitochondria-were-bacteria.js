// Explainer for biology-mitochondria-were-bacteria: your mitochondria descend from bacteria.
// Look: a soft pastel cell interior (blush to lavender), organelles as pastel shapes whose
// membranes are glowing contours; captions sit on a deep plum band. Lora for display, Rubik for
// captions and labels.
//
// Scene plan (52.5 s scene → about 70 s clip). Captions centred at y = 842.
//  A  0.0– 8.6  Hook. Inside a cell: a nucleus and drifting mitochondria with folded inner
//               membranes. "Your cells are packed with tiny power plants" / "thought to descend
//               from free-living bacteria".
//  B  8.4–18.4  The event (a diagram, no date): a host cell's membrane reaches round a bacterium
//               and closes; the guest lives on inside, divides, and its descendants turn into
//               mitochondria.
//  C 18.2–37.4  The clues, side by side, bacterium and mitochondrion: their own circular DNA; two
//               membranes, the inner one holding cardiolipin; division by splitting in two (binary
//               fission); bacteria-like ribosomes.
//  D 37.2–47.8  Lynn Margulis's 1967 paper; chloroplasts are thought to come from cyanobacteria
//               the same way.
//  E 47.6–52.5  Payoff: back in the cell.
//
// Facts: Wikipedia "Symbiogenesis": mitochondria and chloroplasts descend from formerly free-living
// prokaryotes taken into another cell; mitochondria appear related to Alphaproteobacteria,
// chloroplasts to cyanobacteria; evidence: their own chromosomes, reproduction by binary fission,
// some single circular DNA molecules similar to bacteria's, porins in the outer membrane,
// cardiolipin found only in the inner mitochondrial membrane and bacterial membranes, ribosomes
// more like bacteria's (70S); new mitochondria form only by binary fission; Lynn Margulis advanced
// and substantiated the theory with microbiological evidence in a 1967 paper, "On the origin of
// mitosing cells"; it is the leading theory; the timing is unresolved. Wikipedia "Mitochondrion":
// a double membrane; aerobic respiration makes ATP, the cell's chemical energy; "powerhouse of
// the cell".
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const DISPLAY = 'Lora', TEXT = 'Rubik';

const C = {
  ink: '#3B2547', inkSoft: 'rgba(59,37,71,0.72)', plum: '#2E1B3A', cream: '#FFF6F2', creamSoft: 'rgba(255,246,242,0.78)',
  peach: '#FFC9A8', coral: '#E0607E', mint: '#BDEFD5', teal: '#2A9D8F', lilac: '#C9B6F0', violet: '#7B5BD6',
  green: '#9ED67A', greenDeep: '#3E8E41', gold: '#FFD27A', rose: '#FF9DB5',
};

const CUES = [
  [0.5, 4.3, 'Your cells are packed with tiny power plants: *mitochondria*.'],
  [4.5, 8.3, 'They are thought to descend from free-living ~bacteria~.'],
  [8.6, 13.4, 'Long ago, a cell swallowed a bacterium but did not digest it.'],
  [13.6, 18.0, 'The guest lived on inside, and its descendants became *mitochondria*.'],
  [18.4, 23.6, 'Clue 1: their own DNA, in some a single *circular* loop, like bacteria’s.'],
  [23.8, 28.4, 'Clue 2: two membranes; the inner one holds *cardiolipin*, a bacterial lipid.'],
  [28.6, 33.8, 'Clue 3: new ones come only from old ones, *splitting in two* like bacteria.'],
  [34.0, 37.2, 'Even their *ribosomes* look like a bacterium’s.'],
  [37.4, 42.6, 'Lynn Margulis championed the idea in 1967; it is now the *leading theory*.'],
  [42.8, 47.6, 'Plant chloroplasts are thought to come from captured ~cyanobacteria~ the same way.'],
  [47.8, 52.2, 'Your power plants began as bacteria that moved in for good.'],
];
const T = { A: [0, 8.6], B: [8.4, 18.4], C: [18.2, 37.4], D: [37.2, 47.8], E: [47.6, 52.5] };

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- background: cytoplasm ----------
let bg = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d'), rnd = mulberry32(17);
  const rad = g.createRadialGradient(430, 380, 40, 430, 420, 760);
  rad.addColorStop(0, '#FFF0F3'); rad.addColorStop(0.55, '#F4DDEB'); rad.addColorStop(1, '#D8D0F2');
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) {
    const x = rnd() * W, y = rnd() * 780, r = 20 + rnd() * 90;
    const col = ['255,214,196', '210,240,226', '222,210,250', '255,236,200'][i % 4];
    const gg = g.createRadialGradient(x, y, 0, x, y, r);
    gg.addColorStop(0, `rgba(${col},0.35)`); gg.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(123,91,214,${0.06 + rnd() * 0.1})`; g.beginPath(); g.arc(rnd() * W, rnd() * 760, 1 + rnd() * 2.5, 0, Math.PI * 2); g.fill(); }
  // deep plum band for the captions
  const cb = g.createLinearGradient(0, 716, 0, 776);
  cb.addColorStop(0, 'rgba(46,27,58,0)'); cb.addColorStop(1, 'rgba(46,27,58,0.96)');
  g.fillStyle = cb; g.fillRect(0, 716, W, 60);
  g.fillStyle = 'rgba(46,27,58,0.96)'; g.fillRect(0, 776, W, H - 776);
}
function header() {
  font(700, 26, DISPLAY); text('Reckon', 56, 70, { color: C.ink });
  const w = ctx.measureText('Reckon').width;
  font(500, 22); text('·  BIOLOGY  ·  CELLS', 56 + w + 16, 70, { color: C.inkSoft, spacing: '2px' });
}

// ---------- shapes ----------
function capsule(x, y, len, wid, ang) {
  const r = wid / 2, h = Math.max(0, len / 2 - r);
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(-h, -r); ctx.lineTo(h, -r); ctx.arc(h, 0, r, -Math.PI / 2, Math.PI / 2); ctx.lineTo(-h, r); ctx.arc(-h, 0, r, Math.PI / 2, (3 * Math.PI) / 2); ctx.closePath();
  ctx.restore();
}
function glowStroke(col, w, blur = 14) {
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = blur; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = Math.max(1, w * 0.35); ctx.stroke(); ctx.restore();
}
/** Two halves that pull apart as `s` goes 0 → 1: binary fission. Calls body(x, y, len) per half. */
function halves(x, y, len, ang, s, body, spread = 0.12) {
  if (s <= 0) return body(x, y, len, 0);
  const ux = Math.cos(ang), uy = Math.sin(ang);
  const l = len * (0.56 + 0.12 * s), d = len * (0.2 + spread * eio(s));
  body(x - ux * d, y - uy * d, l, -1);
  body(x + ux * d, y + uy * d, l, 1);
}
function dnaLoop(x, y, r, t, a = 1) {
  withAlpha(a, () => {
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const f = (i / 60) * Math.PI * 2, rr = r * (1 + 0.12 * Math.sin(f * 5 + t * 1.5));
      const px = x + Math.cos(f) * rr * 1.3, py = y + Math.sin(f) * rr * 0.8;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath(); glowStroke(C.violet, 3.5, 10);
  });
}
function ribosomes(x, y, len, wid, ang, seed, a = 1, hi = 0) {
  const rnd = mulberry32(seed);
  withAlpha(a, () => {
    for (let i = 0; i < 9; i++) {
      const u = (rnd() - 0.5) * (len - wid * 0.6), v = (rnd() - 0.5) * wid * 0.55;
      const px = x + Math.cos(ang) * u - Math.sin(ang) * v, py = y + Math.sin(ang) * u + Math.cos(ang) * v;
      ctx.fillStyle = hi ? C.gold : 'rgba(59,37,71,0.45)';
      if (hi) { ctx.save(); ctx.shadowColor = C.gold; ctx.shadowBlur = 10 * hi; }
      ctx.beginPath(); ctx.arc(px, py, 3.2 + hi * 1.6, 0, Math.PI * 2); ctx.fill();
      if (hi) ctx.restore();
    }
  });
}
/** A bacterium: a mint rod with a glowing teal membrane and its circular DNA. */
function bacterium(x, y, len, wid, ang, t, { dna = 0.6, ribo = 0, split = 0, a = 1, seed = 3 } = {}) {
  withAlpha(a, () => {
    const parts = [];
    halves(x, y, len, ang, split, (px, py, l) => parts.push([px, py, l]));
    for (const [px, py, l] of parts) { capsule(px, py, l, wid, ang); glowStroke(C.teal, 4); }
    for (const [px, py, l] of parts) { capsule(px, py, l - 4, wid - 4, ang); ctx.fillStyle = C.mint; ctx.fill(); }
    for (const [px, py, l] of parts) {
      dnaLoop(px, py, wid * 0.2 * Math.min(1, l / len + 0.3), t, dna);
      ribosomes(px, py, l, wid, ang, seed + Math.round(px), 1, ribo);
    }
  });
}
/** A mitochondrion: outer membrane, folded inner membrane (cristae), DNA loop, ribosomes. */
function mitochondrion(x, y, len, wid, ang, t, { dna = 0, ribo = 0, split = 0, a = 1, hiOuter = 0, hiInner = 0, seed = 5 } = {}) {
  withAlpha(a, () => {
    const parts = [];
    halves(x, y, len, ang, split, (px, py, l) => parts.push([px, py, l]));
    for (const [px, py, l] of parts) { capsule(px, py, l, wid, ang); glowStroke(hiOuter ? '#FF4F7B' : C.coral, 4 + hiOuter * 2, 12 + hiOuter * 10); }
    for (const [px, py, l] of parts) { capsule(px, py, l - 4, wid - 4, ang); ctx.fillStyle = '#FFE3D3'; ctx.fill(); }
    for (const [px, py, l] of parts) {
      const iw = wid * 0.72, il = l - wid * 0.28;
      capsule(px, py, il, iw, ang); ctx.fillStyle = C.peach; ctx.fill();
      glowStroke(hiInner ? '#FF8A3D' : '#F08A6A', 3 + hiInner * 2, 8 + hiInner * 12);
      // cristae: folds of the inner membrane reaching across the matrix
      ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
      const n = Math.max(2, Math.round(il / 34));
      for (let i = 0; i < n; i++) {
        const u = -il / 2 + iw * 0.45 + ((il - iw * 0.9) * (i + 0.5)) / n, sd = i % 2 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(u - 6, sd * iw / 2); ctx.quadraticCurveTo(u, -sd * iw * 0.05, u + 6, sd * iw / 2);
        ctx.strokeStyle = hiInner ? '#FF8A3D' : '#F08A6A'; ctx.lineWidth = 3; ctx.stroke();
      }
      ctx.restore();
      dnaLoop(px, py, wid * 0.13, t, dna);
      ribosomes(px, py, l * 0.9, wid * 0.8, ang, seed + Math.round(px), ribo ? 1 : 0, ribo);
    }
  });
}
function label(s, x, y, { color = C.ink, align = 'center', size = 24, weight = 600, family = TEXT } = {}) {
  font(weight, size, family);
  ctx.save(); ctx.shadowColor = 'rgba(255,246,242,0.95)'; ctx.shadowBlur = 8;
  text(s, x, y, { color, align }); text(s, x, y, { color, align });
  ctx.restore();
}
function leader(x0, y0, x1, y1, col = C.ink) {
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([4, 5]);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x1, y1, 4, 0, Math.PI * 2); ctx.fill();
}

// ---------- A and E: a modern cell interior ----------
const MITOS = [[560, 250, 150, 64, 0.4, 0.0], [690, 430, 130, 58, -0.9, 1.3], [470, 560, 160, 66, 0.15, 2.1], [250, 650, 120, 54, -0.3, 3.0], [700, 640, 120, 54, 0.8, 4.2], [380, 330, 110, 50, 1.2, 5.1]];
function cellInterior(t, { focus = -1 } = {}) {
  // nucleus at the top left, with its double envelope
  ctx.beginPath(); ctx.ellipse(120, 300, 210, 190, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(201,182,240,0.55)'; ctx.fill(); glowStroke('#9C82E0', 4);
  ctx.beginPath(); ctx.ellipse(120, 300, 196, 176, 0.2, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(156,130,224,0.6)'; ctx.lineWidth = 2; ctx.stroke();
  label('nucleus', 120, 300, { color: C.ink, size: 26 });
  // endoplasmic squiggles
  ctx.strokeStyle = 'rgba(156,130,224,0.4)'; ctx.lineWidth = 3;
  for (let j = 0; j < 4; j++) { ctx.beginPath(); for (let i = 0; i <= 40; i++) { const x = 300 + i * 4, y = 120 + j * 20 + Math.sin(i * 0.5 + j + t * 0.5) * 6; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke(); }
  MITOS.forEach(([x, y, l, w, a, ph], i) => {
    const dx = Math.sin(t * 0.4 + ph) * 10, dy = Math.cos(t * 0.33 + ph) * 8, da = Math.sin(t * 0.25 + ph) * 0.12;
    mitochondrion(x + dx, y + dy, l, w, a + da, t + ph, { hiOuter: focus === i ? 0.6 : 0, hiInner: focus === i ? 0.6 : 0, seed: 11 + i });
  });
}
function sceneA(t) {
  cellInterior(t, { focus: t > 4.4 ? 2 : -1 });
  withAlpha(seg(t, 1.2, 1.9), () => {
    leader(470 + 120, 640, 470 + 40, 580, C.ink);
    label('mitochondria', 600, 682, { size: 28, weight: 700 });
  });
  withAlpha(seg(t, 5.0, 6.0), () => {
    bacterium(300, 474, 140, 60, -0.2, t, { seed: 4 });
    label('a bacterium', 300, 540, { color: C.teal, size: 26, weight: 700 });
  });
}

// ---------- B: the engulfing (a diagram) ----------
const HOST = { x: 432, y: 400, r: 240 };
function hostPath(t, bulge) {
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const f = (i / 120) * Math.PI * 2;
    let r = HOST.r * (1 + 0.025 * Math.sin(3 * f + t * 0.8) + 0.018 * Math.sin(5 * f - t * 1.1));
    for (const [c, amp, wdt] of bulge) { let d = Math.atan2(Math.sin(f - c), Math.cos(f - c)); r += amp * Math.exp(-(d * d) / (2 * wdt * wdt)); }
    const x = HOST.x + Math.cos(f) * r, y = HOST.y + Math.sin(f) * r;
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.closePath();
}
function sceneB(t) {
  const phi = 0.15; // where the bacterium arrives
  const grow = eio(seg(t, 9.8, 11.0)), close = eio(seg(t, 10.8, 11.9)), relax = eio(seg(t, 11.8, 13.2));
  const sep = lerp(0.36, 0.0, close), arm = 115 * grow * (1 - 0.5 * close) * (1 - relax);
  const bulge = [[phi, 55 * grow * (1 - relax), 0.34], [phi - sep, arm, 0.15], [phi + sep, arm, 0.15]];
  hostPath(t, bulge);
  ctx.fillStyle = 'rgba(232,220,250,0.6)'; ctx.fill(); glowStroke('#9C82E0', 5, 18);
  label('host cell', HOST.x - 120, HOST.y - 180, { color: C.ink, size: 26 });
  // the guest swims up, is wrapped, sinks in, lives on, divides and becomes mitochondria
  const inPos = eio(seg(t, 8.6, 10.2)), sink = eio(seg(t, 11.8, 13.4));
  const rr = lerp(lerp(HOST.r + 300, HOST.r + 110, inPos), 110, sink);
  const bx = HOST.x + Math.cos(phi) * rr, by = HOST.y + Math.sin(phi) * rr;
  const a0 = phi + Math.PI / 2, ux = Math.cos(a0), uy = Math.sin(a0);
  const split = eio(seg(t, 13.8, 15.0)), apart = eio(seg(t, 15.0, 17.4)), morph = eio(seg(t, 15.8, 17.4));
  if (split < 1) bacterium(bx, by, 120, 54, a0, t, { split, seed: 7 });
  else {
    for (const sd of [-1, 1]) {
      const d = 120 * 0.32 + apart * 70, cx = bx + ux * sd * d - Math.cos(phi) * apart * 40, cy = by + uy * sd * d - Math.sin(phi) * apart * 40;
      const len = lerp(120 * 0.68, 124, apart), ang = a0 + sd * 0.35 * apart;
      withAlpha(1 - morph, () => bacterium(cx, cy, len, 54, ang, t, { seed: 7 }));
      withAlpha(morph, () => mitochondrion(cx, cy, len + 6, 56, ang, t, { seed: 9 }));
    }
  }
  // the host's membrane around the guest, once inside
  withAlpha(seg(t, 11.8, 12.4) * (1 - seg(t, 13.4, 13.9)), () => {
    capsule(bx, by, 156, 86, a0); ctx.strokeStyle = 'rgba(156,130,224,0.85)'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]);
  });
  withAlpha(seg(t, 9.6, 10.2) * (1 - seg(t, 12.8, 13.4)), () => label('bacterium', bx, by - 58, { color: C.teal, size: 24, weight: 700 }));
  withAlpha(seg(t, 16.6, 17.2), () => label('→ mitochondria', HOST.x - 70, HOST.y - 110, { color: '#D23A63', size: 28, weight: 700 }));
  withAlpha(seg(t, 8.8, 9.6), () => label('diagram · long ago', 432, 120, { color: C.inkSoft, size: 22, weight: 500 }));
}

// ---------- C: the clues, side by side ----------
const LEFT = { x: 230, y: 430 }, RIGHT = { x: 630, y: 430 };
function sceneC(t) {
  const dna = span(t, 18.4, 23.6, 0.5, 0.5), mem = span(t, 23.8, 28.4, 0.5, 0.5);
  const split = eio(seg(t, 29.6, 32.4)) * (1 - eio(seg(t, 33.2, 34.0)));
  const ribo = span(t, 34.0, 37.4, 0.5, 0.3);
  // panel cards
  for (const [p, title, col] of [[LEFT, 'bacterium', C.teal], [RIGHT, 'mitochondrion', C.coral]]) {
    k.rrect(p.x - 180, 190, 360, 470, 30); ctx.fillStyle = 'rgba(255,250,252,0.55)'; ctx.fill();
    ctx.strokeStyle = 'rgba(123,91,214,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    label(title, p.x, 246, { color: col, size: 32, weight: 700, family: DISPLAY });
  }
  bacterium(LEFT.x, LEFT.y, 210, 96, 0, t, { dna: 0.45 + 0.55 * dna, ribo, split, seed: 21 });
  mitochondrion(RIGHT.x, RIGHT.y, 232, 112, 0, t, { dna: 0.25 + 0.75 * dna, ribo, split, hiOuter: mem, hiInner: mem, seed: 23 });
  withAlpha(dna, () => {
    label('circular DNA', LEFT.x, 560, { color: C.violet, size: 26, weight: 700 });
    label('circular DNA', RIGHT.x, 560, { color: C.violet, size: 26, weight: 700 });
  });
  withAlpha(mem, () => {
    label('outer membrane', RIGHT.x, 320, { color: '#D23A63', size: 24, weight: 700 });
    label('inner membrane, folded', RIGHT.x, 560, { color: '#D2622A', size: 24, weight: 700 });
    label('holds cardiolipin', RIGHT.x, 592, { color: C.ink, size: 22, weight: 500 });
  });
  withAlpha(span(t, 28.8, 33.8, 0.5, 0.5), () => {
    label('binary fission', LEFT.x, 600, { color: C.ink, size: 24, weight: 700 });
    label('binary fission', RIGHT.x, 600, { color: C.ink, size: 24, weight: 700 });
  });
  withAlpha(ribo, () => {
    label('ribosomes', LEFT.x, 560, { color: '#B07A10', size: 26, weight: 700 });
    label('ribosomes', RIGHT.x, 560, { color: '#B07A10', size: 26, weight: 700 });
  });
}

// ---------- D: Margulis, and chloroplasts ----------
function sceneD(t) {
  const p1 = span(t, 37.4, 42.8, 0.4, 0.5), p2 = seg(t, 42.8, 43.6);
  withAlpha(p1, () => {
    ctx.save(); ctx.translate(432, 400); ctx.rotate(-0.04);
    k.rrect(-190, -230, 380, 460, 10); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.strokeStyle = 'rgba(59,37,71,0.3)'; ctx.lineWidth = 2; ctx.stroke();
    font(700, 26, DISPLAY); text('On the origin of', 0, -150, { align: 'center' }); text('mitosing cells', 0, -116, { align: 'center' });
    font(500, 22); text('Journal of Theoretical Biology', 0, -72, { color: C.inkSoft, align: 'center' });
    ctx.fillStyle = 'rgba(59,37,71,0.18)';
    for (let i = 0; i < 9; i++) ctx.fillRect(-150, -30 + i * 22, i % 3 === 2 ? 180 : 300, 8);
    mitochondrion(0, 175, 150, 62, 0, t, { seed: 31 });
    ctx.restore();
    label('Lynn Margulis · 1967', 432, 700, { color: C.ink, size: 30, weight: 700, family: DISPLAY });
  });
  withAlpha(p2, () => {
    // a cyanobacterium and a chloroplast
    const cx = 250, cy = 420;
    capsule(cx, cy, 200, 92, -0.1); ctx.fillStyle = '#BFE8C8'; ctx.fill(); glowStroke('#2F8F5B', 4);
    for (let i = 0; i < 4; i++) { capsule(cx - 50 + i * 34, cy, 20, 70, 0); ctx.strokeStyle = '#2F8F5B'; ctx.lineWidth = 2.5; ctx.stroke(); }
    label('cyanobacterium', cx, cy + 92, { color: '#2F7A50', size: 26, weight: 700 });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(390, 420); ctx.lineTo(450, 420); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(450, 420); ctx.lineTo(436, 410); ctx.lineTo(436, 430); ctx.fill();
    const px = 620, py = 420;
    ctx.beginPath(); ctx.ellipse(px, py, 130, 70, 0.1, 0, Math.PI * 2); ctx.fillStyle = C.green; ctx.fill(); glowStroke('#3E8E41', 4);
    ctx.beginPath(); ctx.ellipse(px, py, 118, 58, 0.1, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(62,142,65,0.7)'; ctx.lineWidth = 2; ctx.stroke();
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { k.rrect(px - 92 + i * 38, py - 26 + j * 14 + (i % 2) * 4, 26, 9, 4); ctx.fillStyle = '#2E7D32'; ctx.fill(); }
    label('chloroplast', px, py + 106, { color: '#2E6B30', size: 26, weight: 700 });
    label('in plant cells', px, py + 138, { color: C.inkSoft, size: 22, weight: 500 });
  });
}

function sceneE(t) {
  cellInterior(t);
  withAlpha(seg(t, 48.2, 49.0), () => {
    k.rrect(232, 468, 400, 92, 22); ctx.fillStyle = 'rgba(255,250,252,0.94)'; ctx.fill(); ctx.strokeStyle = 'rgba(224,96,126,0.5)'; ctx.lineWidth = 2; ctx.stroke();
    font(700, 30, DISPLAY); text('Symbiogenesis', 432, 506, { color: C.ink, align: 'center' });
    font(500, 22); text('Wikipedia · Symbiogenesis', 432, 540, { color: C.inkSoft, align: 'center' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 500, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 846, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.cream, marks: { '*': C.peach, '~': C.mint } });
  }
}

Kit.scene({
  width: W, height: H, duration: 52.5,
  fonts: [
    { family: DISPLAY, file: 'Lora.woff2', weight: '400 700' },
    { family: TEXT, file: 'Rubik.woff2', weight: '300 900' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintBackground();
    ctx.drawImage(bg, 0, 0);
    const scenes = [[sceneA, T.A, 0.6], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    header();
    captions(t);
  },
});
