// Explainer for art-laocoon-lost-arm (Roma): the marble group Laocoön and His Sons, dug up on the Esquiline in
// January 1506, had lost the father's right arm. For four centuries it wore a restored arm raised up and away from the
// head; in 1957 a bent marble arm, bought by the archaeologist Ludwig Pollak in a stonecutter's shop in 1903, was fitted
// instead, because a drill hole in its break lines up with one in the shoulder's. Look: a conservator's drawing on dark
// verdigris, the group in marble white in its niche in the Octagonal Court, the 1532 arm in terracotta, the drill holes
// in gold. Playfair Display for captions, IBM Plex Mono for labels and inventory tags.
//
// Facts:
// - Vatican Museums, Laocoön (Museo Pio-Clementino, Octagonal Court): found in 1506 on the Esquiline Hill and at once
//   identified as the Laocoön that Pliny describes as the masterpiece of the Rhodian sculptors Agesandros, Athanodoros
//   and Polydoros; the Trojan priest and his two sons killed by two sea serpents sent by Athena and Poseidon; Pope
//   Julius II (1503–1513) bought it at once for the Statue Courtyard; its date is much debated, now around 40–30 BC.
// - Digital Sculpture Project, chronology (B. Frischer): found on 13 or 14 January 1506 in a vineyard on the Esquiline
//   (Oppian) worked by Felice de' Fredis; Julius II sent Giuliano da Sangallo, his son Francesco and Michelangelo, and
//   Giuliano identified it as the group praised by Pliny, Natural History 36.37; bought on 23 March 1506; in the
//   Belvedere courtyard by August; 1532 Giovanni Antonio Montorsoli, a former assistant of Michelangelo, restored the
//   father's right arm "pointing upward, away from the head"; the gesture stayed associated with the statue until
//   after the Second World War; 1903 Pollak's arm found, published 1905; 1957 Filippo Magi removed Canova's
//   restorations and added the arm. Catalogue entry (P. Liverani): height 208 cm, width 163 cm, depth 112 cm;
//   inventory 1059 (the group) and 1064 (the Pollak arm); "the join between the torso and the arm was guaranteed by a
//   drill hole on one piece which aligned perfectly with a corresponding hole on the other", despite a missing section.
// - Vatican News, May 2024 ("Laocoön and the Arm of Memory"): Pollak bought the arm in a stonecutter's workshop on Via
//   delle Sette Sale (a letter of 1903 reports it); at first it seemed too small and was thought to come from a smaller
//   copy; the mismatch came from the erosion of the shoulder by the earlier reconstructions; Montorsoli's first
//   integration was in terracotta; Pollak gave the arm to the papal collections in 1906; the reconnection, by Filippo
//   Magi, was in 1957–59.
// - Wikipedia, "Laocoön and His Sons": Michelangelo suggested the missing arm was bent back over the shoulder, others an
//   outstretched heroic gesture; in a 16th-century restoration "the original shoulder was severely sliced back"
//   (Barkan); "a wedge of plaster has had to be inserted" and the arm may be on a smaller scale (Beard, a sceptic);
//   Pliny: the Laocoön "in the palace of the Emperor Titus", "preferable to any other production of the art of painting
//   or of statuary". Pliny's text does not give a date.
// The figures are drawn simplified from a frontal photograph, in cm from the middle of the base; the two arm poses and
// the shapes of the breaks are illustrative, not measurements.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  The vineyard on the Esquiline, 1506; Sangallo, Michelangelo and Pliny's Laocoön.
//  B  9.2–18.2  The group in its niche; Julius II buys it; the father's right arm is missing.
//  C 18.4–32.0  Michelangelo's bent arm or a heroic outstretched one; Montorsoli's raised arm, 1532 to 1957.
//  D 32.2–41.2  Pollak's bent arm from a stonecutter's shop, 1903; given in 1906; it looks too small.
//  E 41.4–50.4  Zoom on the shoulder: cut back by earlier fittings; the two drill holes line up.
//  F 50.6–64.6  1957: Magi fits the arm, bent back toward the head; plaster fills the gap; the two poses.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const TAU = Math.PI * 2, RAD = Math.PI / 180;

const C = {
  bg1: '#0f1d1c', bg2: '#1c3431', niche: '#1d3c38', niche2: '#24504a', rim: '#3d6e66',
  ink: '#f3efe6', soft: 'rgba(243,239,230,0.74)', faint: 'rgba(243,239,230,0.2)',
  marble: '#ebe5d8', marble2: '#d3cab8', edge: '#7f776a', terra: '#d4743f', terraDark: '#8f4a26',
  pollak: '#f1e3c2', plaster: '#a9b9bb', snake: '#9aae6c', snakeDark: '#4f5f34',
  gold: '#f4c65a', coral: '#ff806e', soil: '#4b3626', soil2: '#33251a', vine: '#78955a', stake: '#8a6a48',
};
const CAP = 'Playfair Display', MONO = 'IBM Plex Mono';

let k, ctx;
const font = (w, s, f = MONO) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- facts ----------
const FOUND = 1506, BOUGHT = 'March 1506', RAISED = 1532, BOUGHT_ARM = 1903, PUBLISHED = 1905, GIVEN = 1906, FITTED = 1957;
const HEIGHT_CM = 208;
const RAISED_YEARS = FITTED - RAISED; // the raised arm's time on the statue
if (RAISED_YEARS !== 425 || FITTED - GIVEN !== 51) throw new Error('years');

// ---------- the group, in cm from the middle of the base (x right, y up), simplified from a frontal photograph ----------
const S = [-45, 169]; // the father's right shoulder (on the viewer's left)
const L1 = 34, L2 = 27; // upper arm and forearm
// arm poses: angle of the upper arm and of the forearm, in degrees (0 = right, 90 = up)
const POSE = { bent: [152, -8], raised: [124, 108] };
const STUB = 7, CUT = 3.5, BREAK = 8.5; // along the upper arm: the original break, the face cut back for the 1532 arm, the arm's own break
const HOLE_V = 1.8; // the drill hole, off the arm's axis
const armW = (u) => 10.5 + 8 * Math.exp(-Math.max(0, u) / 4); // the upper arm tapers from the broad shoulder
const dir = (deg) => [Math.cos(deg * RAD), Math.sin(deg * RAD)];
const add = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];
const along = (deg, u, v = 0) => { const [c, s] = dir(deg); return [S[0] + u * c - v * s, S[1] + u * s + v * c]; };
const HEAD = [-20, 192], HEAD_R = 12.5;

// the camera: cm to canvas pixels
let cam = { s: 2.35, ox: CX + 4, oy: 730 };
const P = (x, y) => [cam.ox + x * cam.s, cam.oy - y * cam.s];
const PP = (p) => P(p[0], p[1]);
const CAM_FULL = { s: 2.35, ox: CX + 4, oy: 730 };
// zoomed on the shoulder: the point (-50, 176) lands at (432, 440)
const CAM_ZOOM = { s: 7, ox: 432 + 50 * 7, oy: 440 + 176 * 7 };
const LOUPE_BOTTOM = 770; // when zoomed, the drawing stays above the captions
function loupe(z) { if (z <= 0) return; ctx.beginPath(); ctx.rect(0, 0, W, LOUPE_BOTTOM); ctx.clip(); }
function loupeEdge(z) { if (z <= 0) return; A(z, () => { const y = LOUPE_BOTTOM; ctx.strokeStyle = C.rim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }); }
const camLerp = (a, b, f) => ({ s: lerp(a.s, b.s, f), ox: lerp(a.ox, b.ox, f), oy: lerp(a.oy, b.oy, f) });

// ---------- drawing helpers ----------
function pathPts(pts, close = false) {
  ctx.beginPath();
  pts.forEach((p, i) => { const [x, y] = PP(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  if (close) ctx.closePath();
}
// a closed shape smoothed through the midpoints of its corners
function blob(pts, fill = C.marble, stroke = C.edge, lw = 2) {
  const q = pts.map(PP), n = q.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  ctx.beginPath();
  let m = mid(q[n - 1], q[0]); ctx.moveTo(m[0], m[1]);
  for (let i = 0; i < n; i++) { const m2 = mid(q[i], q[(i + 1) % n]); ctx.quadraticCurveTo(q[i][0], q[i][1], m2[0], m2[1]); }
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
// a tapered limb with round ends, widths in cm
function limb(a, b, w1, w2, fill = C.marble, stroke = C.edge, lw = 2, { capA = true, capB = true } = {}) {
  const [x1, y1] = PP(a), [x2, y2] = PP(b), r1 = (w1 * cam.s) / 2, r2 = (w2 * cam.s) / 2;
  const ang = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(ang), ny = Math.cos(ang);
  ctx.beginPath();
  ctx.moveTo(x1 + nx * r1, y1 + ny * r1); ctx.lineTo(x2 + nx * r2, y2 + ny * r2);
  if (capB) ctx.arc(x2, y2, r2, ang + Math.PI / 2, ang - Math.PI / 2, true); else ctx.lineTo(x2 - nx * r2, y2 - ny * r2);
  ctx.lineTo(x1 - nx * r1, y1 - ny * r1);
  if (capA) ctx.arc(x1, y1, r1, ang - Math.PI / 2, ang + Math.PI / 2, true);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
// a smooth curve through points (Catmull-Rom)
function curve(pts) {
  const q = pts.map(PP);
  ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]);
  for (let i = 0; i < q.length - 1; i++) {
    const p0 = q[Math.max(0, i - 1)], p1 = q[i], p2 = q[i + 1], p3 = q[Math.min(q.length - 1, i + 2)];
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
}
function serpent(pts, w = 6) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  curve(pts); ctx.strokeStyle = C.snakeDark; ctx.lineWidth = (w + 1.4) * cam.s; ctx.stroke();
  curve(pts); ctx.strokeStyle = C.snake; ctx.lineWidth = w * cam.s; ctx.stroke();
  ctx.setLineDash([2 * cam.s, 3 * cam.s]); curve(pts); ctx.strokeStyle = 'rgba(79,95,52,0.55)'; ctx.lineWidth = 1.2 * cam.s; ctx.stroke(); ctx.setLineDash([]);
  // the head, at the first point, pointing away from the second
  const [hx, hy] = PP(pts[0]), [nx, ny] = PP(pts[1]), a = Math.atan2(hy - ny, hx - nx);
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(a);
  ctx.fillStyle = C.snake; ctx.strokeStyle = C.snakeDark; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, w * 0.95 * cam.s, w * 0.62 * cam.s, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function pill(str, x, y, col, { align = 'left', size = 22, bg = 'rgba(15,29,28,0.88)' } = {}) {
  font(600, size); const w = ctx.measureText(str).width, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.fillStyle = bg; k.rrect(x0 - 10, y - size * 0.78, w + 20, size * 1.56, 8); ctx.fill();
  text(str, x0, y, { base: 'middle', color: col });
}
function leader(x0, y0, x1, y1, col) { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }

// ---------- the right arm ----------
// a whole arm in a pose [upper, fore] from the shoulder; the upper arm starts at u0 along its axis
function arm(pose, { fill = C.marble, stroke = C.edge, u0 = 0, fist = true, dash = null, lw = 2 } = {}) {
  const [a1, a2] = pose, e = along(a1, L1), h = add(e, dir(a2), L2);
  if (dash) ctx.setLineDash(dash);
  limb(along(a1, u0), e, armW(u0), armW(L1), fill, stroke, lw, { capA: false });
  limb(e, h, 9, 7, fill, stroke, lw);
  if (fist) { const [x, y] = PP(add(h, dir(a2), 2)); ctx.beginPath(); ctx.arc(x, y, 5.2 * cam.s, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  ctx.setLineDash([]);
  return { e, h };
}
// Pollak's arm: a rigid piece of marble from its break (BREAK along the upper arm) to the broken forearm, placed with
// its axis at angle a1 and shifted by (dx, dy) cm
function pollakArm(a1, dx = 0, dy = 0, { fill = C.pollak, stroke = C.edge, holes = 0 } = {}) {
  const a2 = a1 + (POSE.bent[1] - POSE.bent[0]);
  const at = (u, v = 0) => { const p = along(a1, u, v); return [p[0] + dx, p[1] + dy]; };
  const b0 = at(BREAK), e = at(L1), h = add(e, dir(a2), L2 - 3);
  limb(b0, e, armW(BREAK), armW(L1), fill, stroke, 2, { capA: false });
  limb(e, h, 9, 7.4, fill, stroke, 2, { capB: false });
  // the break faces: rough lines across each end
  const rough = (c, deg, w) => {
    const [cx, cy] = dir(deg + 90), pts = [];
    for (let i = 0; i <= 6; i++) { const f = i / 6 - 0.5, j = (i % 2 ? 0.7 : -0.5); pts.push([c[0] + cx * f * w + Math.cos(deg * RAD) * j, c[1] + cy * f * w + Math.sin(deg * RAD) * j]); }
    pathPts(pts); ctx.strokeStyle = C.edge; ctx.lineWidth = 2.5; ctx.stroke();
  };
  rough(b0, a1, armW(BREAK)); rough(h, a2, 7.4);
  if (holes > 0) A(holes, () => {
    // the drill hole running into the arm from its break
    const p0 = at(BREAK, HOLE_V), p1 = at(BREAK + 5, HOLE_V);
    const [x0, y0] = PP(p0), [x1, y1] = PP(p1);
    ctx.strokeStyle = '#3b2f1c'; ctx.lineCap = 'round'; ctx.lineWidth = 1.3 * cam.s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 0.5 * cam.s; ctx.stroke();
  });
  return { e, h, at };
}

// ---------- the group ----------
const BASE = [[-86, 0], [86, 0], [86, 14], [80, 14], [80, 22], [-80, 22], [-80, 14], [-86, 14]];
const ALTAR = [[-58, 22], [12, 22], [12, 80], [-58, 80]];
const TORSO = [[-47, 166], [-30, 172], [-12, 172], [2, 165], [7, 148], [-2, 120], [3, 100], [-12, 92], [-30, 92], [-41, 100], [-41, 120], [-48, 148]];
function figures({ stub = 'break', stubCut = 0, dim = 0 } = {}) {
  ctx.save(); ctx.globalAlpha *= 1 - 0.62 * dim;
  // the base and the altar
  pathPts(BASE, true); ctx.fillStyle = C.marble2; ctx.fill(); ctx.strokeStyle = C.edge; ctx.lineWidth = 2; ctx.stroke();
  pathPts(ALTAR, true); ctx.fillStyle = '#ddd5c4'; ctx.fill(); ctx.stroke();
  // the elder son, on the right
  limb([58, 84], [54, 50], 10, 7); limb([54, 50], [52, 16], 7, 5.5); limb([52, 16], [60, 12], 5, 4.5);
  limb([70, 86], [88, 62], 10, 7.5); limb([88, 62], [74, 40], 7.5, 5.5); limb([74, 40], [82, 36], 5, 4.5);
  blob([[54, 126], [78, 125], [74, 104], [71, 84], [57, 84], [57, 104]]);
  limb([78, 122], [86, 101], 6.5, 5.5); limb([86, 101], [88, 84], 5.5, 4.5);
  blob([[84, 118], [92, 112], [94, 60], [88, 40], [84, 60], [86, 96]], '#e2dbcc');
  limb([56, 123], [44, 114], 6.5, 5.5); limb([44, 114], [35, 121], 5.5, 4.5);
  blob([[71, 143], [80, 144], [86, 136], [83, 126], [74, 124], [69, 132]]);
  // the younger son, on the left
  limb([-70, 92], [-64, 62], 9, 7); limb([-64, 62], [-70, 36], 7, 5); limb([-70, 36], [-77, 30], 5, 4.5);
  limb([-58, 92], [-52, 60], 9, 7); limb([-52, 60], [-58, 28], 7, 5); limb([-58, 28], [-52, 24], 5, 4.5);
  blob([[-74, 127], [-55, 127], [-56, 108], [-58, 90], [-71, 90], [-72, 108]]);
  limb([-73, 125], [-90, 131], 6, 5); limb([-90, 131], [-82, 146], 5, 4.5);
  limb([-56, 124], [-49, 108], 6, 5); limb([-49, 108], [-56, 99], 5, 4.5);
  blob([[-71, 142], [-62, 144], [-58, 136], [-61, 127], [-69, 127], [-74, 134]]);
  // the father: legs, a cloth over the altar, torso, left arm, head
  blob([[-30, 92], [4, 90], [12, 70], [6, 30], [-12, 24], [-26, 40]], '#e2dbcc');
  limb([-34, 98], [-46, 58], 15, 10.5); limb([-46, 58], [-32, 18], 10.5, 7.5); limb([-32, 18], [-22, 12], 7, 6);
  limb([-8, 96], [24, 64], 15, 10.5); limb([24, 64], [40, 15], 10.5, 7.5); limb([40, 15], [50, 10], 7, 6);
  blob(TORSO);
  // the stub of the right arm
  if (stub === 'break' || stub === 'cut') {
    const u = stub === 'cut' ? lerp(STUB, CUT, stubCut) : STUB;
    limb(S, along(POSE.bent[0], u), armW(0), armW(u), C.marble, C.edge, 2, { capB: false });
  }
  // chest and belly lines
  ctx.strokeStyle = 'rgba(127,119,106,0.6)'; ctx.lineWidth = 1.6;
  curve([[-40, 150], [-24, 143], [-6, 150]]); ctx.stroke(); curve([[-23, 140], [-22, 104]]); ctx.stroke();
  curve([[-34, 126], [-22, 122], [-8, 126]]); ctx.stroke();
  limb([0, 163], [16, 138], 11, 9); limb([16, 138], [14, 114], 9, 7.5);
  limb([-23, 168], [-21, 182], 10, 10);
  blob([[-36, 192], [-30, 205], [-16, 207], [-5, 200], [-4, 186], [-12, 175], [-24, 176], [-34, 182]], '#e2dbcc');
  ctx.beginPath(); const [hx, hy] = PP(HEAD); ctx.ellipse(hx, hy, HEAD_R * 0.8 * cam.s, HEAD_R * 0.95 * cam.s, -0.35, 0, TAU);
  ctx.fillStyle = C.marble; ctx.fill(); ctx.strokeStyle = C.edge; ctx.lineWidth = 2; ctx.stroke();
  // curls of hair and beard around the face
  ctx.fillStyle = '#e2dbcc'; ctx.strokeStyle = C.edge; ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const ang = (70 + i * 24) * RAD, r = HEAD_R * 1.02, [cx, cy] = PP([HEAD[0] + Math.cos(ang) * r, HEAD[1] + Math.sin(ang) * r]);
    ctx.beginPath(); ctx.arc(cx, cy, 2.7 * cam.s, 0, TAU); ctx.fill(); ctx.stroke();
  }
  // brows and an open mouth, the face turned up
  ctx.strokeStyle = C.edge; ctx.lineWidth = 1.6;
  curve([[-27, 195], [-22, 198], [-17, 197]]); ctx.stroke(); curve([[-14, 198], [-10, 199], [-7, 197]]); ctx.stroke();
  { const [mx, my] = PP([-15, 186]); ctx.fillStyle = C.edge; ctx.beginPath(); ctx.ellipse(mx, my, 2.2 * cam.s, 1.4 * cam.s, -0.35, 0, TAU); ctx.fill(); }
  // the serpents
  serpent([[-6, 101], [10, 110], [20, 126], [30, 128], [40, 120], [48, 104], [62, 90], [66, 66], [76, 48], [84, 38]]);
  serpent([[-62, 116], [-66, 104], [-60, 84], [-68, 64], [-52, 48], [-30, 44], [-12, 56], [14, 58], [30, 44], [42, 30]]);
  ctx.restore();
  // in close-up, the shoulder's stump stays bright
  if (dim > 0 && (stub === 'break' || stub === 'cut')) {
    const u = stub === 'cut' ? lerp(STUB, CUT, stubCut) : STUB;
    limb(along(POSE.bent[0], -3), along(POSE.bent[0], u), armW(-3), armW(u), C.marble, C.edge, 2, { capA: false, capB: false });
  }
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg2); lg.addColorStop(1, C.bg1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 3500; i++) { g.fillStyle = `rgba(200,230,220,${r() * 0.03})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1); }
  // registration crosses, as on a conservator's drawing board
  g.strokeStyle = 'rgba(243,239,230,0.12)'; g.lineWidth = 1.5;
  for (const [x, y] of [[40, 140], [W - 40, 160], [40, 930], [W - 40, 930]]) { g.beginPath(); g.moveTo(x - 12, y); g.lineTo(x + 12, y); g.moveTo(x, y - 12); g.lineTo(x, y + 12); g.stroke(); g.beginPath(); g.arc(x, y, 6, 0, TAU); g.stroke(); }
}
function niche(a) {
  A(a, () => {
    const [x0, y0] = P(-112, -6), [x1] = P(112, 0), [, ys] = P(0, 150), r = (x1 - x0) / 2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, ys); ctx.arc((x0 + x1) / 2, ys, r, Math.PI, 0); ctx.lineTo(x1, y0); ctx.closePath();
    const lg = ctx.createLinearGradient(0, ys - r, 0, y0); lg.addColorStop(0, C.niche2); lg.addColorStop(1, C.niche);
    ctx.fillStyle = lg; ctx.fill(); ctx.strokeStyle = C.rim; ctx.lineWidth = 3; ctx.stroke();
  });
}

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, `In January ${FOUND} a marble group was dug up in a vineyard on Rome’s Esquiline Hill.`],
  [4.8, 9.0, 'Architect Giuliano da Sangallo and Michelangelo knew it: the *Laocoön* the Roman writer Pliny praised.'],
  [9.2, 13.6, 'It shows the Trojan priest Laocoön and his two sons in the coils of two sea serpents.'],
  [13.8, 18.2, `Pope Julius II bought it in ${BOUGHT}. But the father’s right arm was ~missing~.`],
  [18.4, 22.8, 'Michelangelo thought it had bent back over the shoulder. Others wanted a heroic, outstretched arm.'],
  [23.0, 27.4, `In ^${RAISED}^ sculptor Giovanni Montorsoli added a terracotta arm, raised high, away from the head.`],
  [27.6, 32.0, `That raised arm became the statue’s famous gesture, and it stayed in place until ${FITTED}.`],
  [32.2, 36.6, `In ${BOUGHT_ARM} the archaeologist Ludwig Pollak bought a *bent* marble arm in a Roman stonecutter’s shop.`],
  [36.8, 41.2, `He gave it to the Vatican Museums in ${GIVEN}. But it looked too small, as if from a smaller copy.`],
  [41.4, 45.8, 'Earlier fittings had cut and worn the shoulder back: that is why the arm looked too small.'],
  [46.0, 50.4, 'And a *drill hole* in the arm’s break lines up perfectly with a hole in the shoulder’s.'],
  [50.6, 55.0, `In *${FITTED}* Vatican archaeologist Filippo Magi took off the old additions and fitted Pollak’s arm.`],
  [55.2, 59.6, 'Now the arm bends back toward his head, as Michelangelo had guessed; plaster fills the gap.'],
  [59.8, 64.2, 'Some scholars still doubt the match. The Vatican Museums show the statue with Pollak’s arm.'],
];

// ---------- A: the vineyard, 1506 ----------
const PIT = [[-120, 250], [120, 250], [104, -12], [-104, -12]];
function sceneVineyard(t) {
  const a = span(t, 0, 9.4, 0.5, 0.6);
  if (a <= 0) return;
  const rise = eio(seg(t, 1.0, 8.4));
  const ground = lerp(520, 760, eio(seg(t, 5.6, 8.6)));
  A(a, () => {
    // vines in rows
    for (let i = 0; i < 7; i++) {
      const x = 70 + i * 120, y = ground;
      if (Math.abs(x - CX) < 150) continue;
      ctx.strokeStyle = C.stake; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 120); ctx.stroke();
      ctx.strokeStyle = 'rgba(138,106,72,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 60, y - 96); ctx.lineTo(x + 60, y - 96); ctx.stroke();
      for (const [dx, dy, r] of [[-26, -100, 18], [0, -118, 22], [24, -102, 17], [10, -86, 14]]) { ctx.fillStyle = C.vine; ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, TAU); ctx.fill(); }
    }
    // the soil, with a pit dug into it
    const g = ctx.createLinearGradient(0, ground, 0, H); g.addColorStop(0, C.soil); g.addColorStop(1, C.soil2);
    ctx.fillStyle = g; ctx.fillRect(0, ground, W, H - ground);
    for (let i = 1; i < 6; i++) { ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, ground + i * 56); ctx.lineTo(W, ground + i * 56 + 8); ctx.stroke(); }
    ctx.fillStyle = 'rgba(20,14,9,0.75)'; ctx.beginPath(); ctx.moveTo(CX - 150, ground); ctx.lineTo(CX + 150, ground); ctx.lineTo(CX + 120, H); ctx.lineTo(CX - 120, H); ctx.closePath(); ctx.fill();
    font(600, 22); text(`A VINEYARD ON THE ESQUILINE · JANUARY ${FOUND}`, CX, 170, { align: 'center', base: 'middle', color: C.soft, spacing: '1px' });
  });
  // the group comes up out of the pit
  cam = { s: lerp(1.9, CAM_FULL.s, rise), ox: CX + 4, oy: lerp(950, CAM_FULL.oy, rise) };
  A(span(t, 0.2, 9.4, 0.6, 0.01), () => {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, LOUPE_BOTTOM); ctx.clip();
    if (t < 8.6) { ctx.beginPath(); ctx.rect(0, 0, W, ground); ctx.moveTo(CX - 150, ground); ctx.lineTo(CX + 150, ground); ctx.lineTo(CX + 120, H); ctx.lineTo(CX - 120, H); ctx.closePath(); ctx.clip(); }
    figures();
    ctx.restore();
  });
  // Pliny's words
  A(span(t, 5.0, 9.2, 0.5, 0.4), () => {
    ctx.fillStyle = 'rgba(15,29,28,0.92)'; k.rrect(92, 200, 680, 150, 14); ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
    font(600, 22); text('PLINY THE ELDER · NATURAL HISTORY 36.37', CX, 232, { align: 'center', base: 'middle', color: C.gold, spacing: '1px' });
    k.font('italic 500', 30, CAP); text('“the Laocoön, in the palace', CX, 278, { align: 'center', base: 'middle' }); text('of the Emperor Titus …”', CX, 316, { align: 'center', base: 'middle' });
  });
}

// ---------- B and C: the group, its missing arm, the raised arm ----------
const RAISED_FIST = add(add(along(POSE.raised[0], L1), dir(POSE.raised[1]), L2), dir(POSE.raised[1]), 2);
function sceneGroup(t) {
  const a = span(t, 8.8, 32.6, 0.5, 0.4);
  if (a <= 0) return;
  cam = { ...CAM_FULL };
  A(a, () => {
    niche(1);
    figures({ stub: 'break' });
    // the missing arm: the broken stump, highlighted
    A(span(t, 14.4, 18.6, 0.5, 0.4), () => {
      const [x, y] = PP(along(POSE.bent[0], STUB)); ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.arc(x, y, 34, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      leader(x - 24, y - 24, 190, 238, C.coral); pill('right arm: missing', 60, 222, C.coral);
    });
    // Michelangelo's idea and the others'
    A(span(t, 18.8, 23.2, 0.5, 0.5), () => {
      arm(POSE.bent, { fill: null, stroke: C.gold, dash: [8, 6], lw: 3 });
      arm(POSE.raised, { fill: null, stroke: C.terra, dash: [8, 6], lw: 3 });
      const [ex, ey] = PP(along(POSE.bent[0], L1)), [fx, fy] = PP(RAISED_FIST);
      pill('Michelangelo: bent back', ex - 20, ey + 62, C.gold, { align: 'center' });
      pill('others: outstretched', fx + 36, fy, C.terra);
    });
    // the terracotta arm of 1532
    const r = eio(seg(t, 23.6, 25.4));
    if (r > 0) {
      ctx.save(); ctx.translate(-(1 - r) * 30, -(1 - r) * 50); A(r, () => arm(POSE.raised, { fill: C.terra, stroke: C.terraDark, u0: CUT })); ctx.restore();
      A(span(t, 24.6, 27.8, 0.5, 0.4), () => { const [x, y] = PP(RAISED_FIST); pill(`${RAISED} · MONTORSOLI · terracotta`, x + 36, y, C.terra); });
    }
    // labels for the figures
    A(span(t, 9.8, 13.8, 0.5, 0.4), () => {
      const lab = (s, p, dx, dy, align) => { const [x, y] = PP(p); leader(x, y, x + dx, y + dy, C.soft); pill(s, x + dx, y + dy, C.ink, { align }); };
      lab('Laocoön', [-8, 200], 110, -50, 'left'); lab('younger son', [-66, 140], -10, -110, 'center'); lab('elder son', [78, 142], 20, -100, 'center');
      lab('sea serpents', [66, 66], 40, 60, 'left');
    });
    A(span(t, 9.4, 13.8, 0.5, 0.4), () => { font(600, 22); text('OCTAGONAL COURT · VATICAN MUSEUMS', CX, 170, { align: 'center', base: 'middle', color: C.soft, spacing: '1px' }); });
    A(span(t, 13.9, 18.4, 0.5, 0.4), () => { font(600, 22); text(`BOUGHT BY POPE JULIUS II · ${BOUGHT.toUpperCase()}`, CX, 170, { align: 'center', base: 'middle', color: C.soft, spacing: '1px' }); });
    // the years the raised arm stayed
    A(span(t, 27.8, 32.6, 0.5, 0.4), () => {
      const x0 = 130, x1 = 734, y = 150, f = eio(seg(t, 28.2, 30.6));
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.strokeStyle = C.terra; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, f), y); ctx.stroke();
      for (const x of [x0, x1]) { ctx.fillStyle = x === x0 || f >= 1 ? C.terra : C.faint; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); }
      font(700, 24); text(String(RAISED), x0, y + 32, { align: 'center', base: 'middle', color: C.terra }); text(String(FITTED), x1, y + 32, { align: 'center', base: 'middle', color: f >= 1 ? C.gold : C.soft });
      font(700, 26); text(`${Math.round(RAISED_YEARS * f)} years`, lerp(x0, x1, 0.62), y + 34, { align: 'center', base: 'middle', color: C.ink });
    });
  });
}

// ---------- D: Pollak's arm in the stonecutter's shop ----------
function sceneShop(t) {
  const a = span(t, 32.2, 37.2, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    ctx.drawImage(bg, 0, 0);
    font(600, 22); text(`A STONECUTTER’S SHOP · VIA DELLE SETTE SALE · ${BOUGHT_ARM}`, CX, 170, { align: 'center', base: 'middle', color: C.soft, spacing: '1px' });
    // shelves and a bench with fragments
    const by = 600;
    ctx.fillStyle = 'rgba(138,106,72,0.35)'; ctx.fillRect(80, 300, 704, 10);
    ctx.fillStyle = '#cfc6b4'; ctx.strokeStyle = C.edge; ctx.lineWidth = 2;
    for (const [x, w, h] of [[110, 70, 56], [220, 40, 80], [600, 90, 40], [720, 46, 64]]) { ctx.beginPath(); ctx.roundRect(x, 300 - h, w, h, 10); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = C.stake; ctx.fillRect(90, by, 684, 24); ctx.fillRect(120, by + 24, 20, 120); ctx.fillRect(724, by + 24, 20, 120);
    ctx.fillStyle = '#cfc6b4';
    ctx.beginPath(); ctx.ellipse(160, by - 30, 40, 30, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(660, by - 50, 86, 50, 8); ctx.fill(); ctx.stroke();
    // Pollak's arm on the bench, its upper arm lying flat
    const save = cam, s = 9;
    cam = { s, ox: 640 + 45 * s, oy: by - 120 + 169 * s };
    const lift = eout(seg(t, 34.2, 35.2)) * 24;
    ctx.save(); ctx.translate(0, -lift);
    pollakArm(196);
    ctx.restore();
    cam = save;
    A(seg(t, 34.4, 35.2), () => { pill('a bent marble arm', 120, 350, C.gold, { size: 24 }); font(500, 22); text('INV. 1064 · VATICAN MUSEUMS', 120, 394, { base: 'middle', color: C.soft }); });
    A(seg(t, 35.2, 36.0), () => { font(600, 22); text(`published ${PUBLISHED} · given to the Vatican ${GIVEN}`, CX, 690, { align: 'center', base: 'middle', color: C.soft }); });
  });
}

// ---------- D2 and E: the shoulder, close up ----------
function sceneShoulder(t) {
  const a = span(t, 36.6, 50.8, 0.5, 0.01);
  if (a <= 0 || t >= 50.8) return;
  const z = eio(seg(t, 37.6, 39.4));
  cam = camLerp(CAM_FULL, CAM_ZOOM, z);
  A(a, () => {
    ctx.save(); loupe(z);
    niche(1 - z);
    figures({ stub: 'cut', stubCut: 1, dim: z });
    // what was cut away, between the cut face and the original break
    const cutA = seg(t, 41.6, 42.6);
    if (cutA > 0) A(cutA * (1 - seg(t, 46.0, 46.6)), () => {
      ctx.setLineDash([7, 6]);
      limb(along(POSE.bent[0], CUT), along(POSE.bent[0], STUB), armW(CUT), armW(STUB), 'rgba(255,128,110,0.25)', C.coral, 2.5, { capA: false, capB: false });
      ctx.setLineDash([]);
      const [x, y] = PP(along(POSE.bent[0], (CUT + STUB) / 2, -armW(CUT) / 2));
      leader(x + 6, y + 8, 530, 622, C.coral); pill('cut and worn away', 470, 640, C.coral, { size: 24 });
    });
    // Pollak's arm, brought up beside the shoulder, then turned until the holes line up and slid in
    const swing = 1 - eio(seg(t, 46.4, 48.6)), slide = 1 - eio(seg(t, 48.8, 49.8));
    const err = 34 * swing, [dx, dy] = dir(POSE.bent[0] + err).map((c) => c * 22 * slide); // slid out along its own axis
    const show = seg(t, 38.8, 39.8);
    if (show > 0) A(show, () => pollakArm(POSE.bent[0] + err, dx, dy, { holes: seg(t, 46.0, 46.6) }));
    // the two break faces compared: the shoulder's is wider
    A(span(t, 39.8, 46.0, 0.5, 0.4), () => {
      const sideA = span(t, 39.8, 41.8, 0.5, 0.4);
      const face = (pt, deg, w, col) => {
        const [c, d] = dir(deg + 90), [x0, y0] = PP([pt[0] - c * w / 2, pt[1] - d * w / 2]), [x1, y1] = PP([pt[0] + c * w / 2, pt[1] + d * w / 2]);
        ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      };
      const fa = along(POSE.bent[0] + err, BREAK), af = [fa[0] + dx, fa[1] + dy], sf = along(POSE.bent[0], CUT);
      face(sf, POSE.bent[0], armW(CUT), C.ink); face(af, POSE.bent[0] + err, armW(BREAK), C.gold);
      const [ax, ay] = PP(af), [sx, sy] = PP(sf);
      leader(ax, ay - 10, 200, 262, C.gold); pill('arm’s break', 110, 250, C.gold, { size: 24 });
      A(sideA, () => { leader(sx + 8, sy + 10, 520, 620, C.ink); pill('shoulder’s break', 470, 640, C.ink, { size: 24 }); });
    });
    // the shoulder's drill hole and the line it sets
    const holes = seg(t, 46.0, 46.6);
    if (holes > 0) A(holes, () => {
      const [x0, y0] = PP(along(POSE.bent[0], CUT, HOLE_V)), [x1, y1] = PP(along(POSE.bent[0], CUT - 5, HOLE_V));
      ctx.strokeStyle = '#3b2f1c'; ctx.lineCap = 'round'; ctx.lineWidth = 1.3 * cam.s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 0.5 * cam.s; ctx.stroke();
      ctx.setLineDash([10, 7]); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; pathPts([along(POSE.bent[0], -3, HOLE_V), along(POSE.bent[0], 30, HOLE_V)]); ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.restore();
    loupeEdge(z);
    A(span(t, 37.0, 41.4, 0.5, 0.3), () => { font(600, 22); text(`GIVEN TO THE VATICAN MUSEUMS · ${GIVEN}`, CX, 170, { align: 'center', base: 'middle', color: C.soft, spacing: '1px' }); });
    if (holes > 0) A(holes, () => {
      const deg = Math.round(err);
      pill(deg > 0 ? `drill holes off by ${deg}°` : 'drill holes in line', CX, 250, deg > 0 ? C.coral : C.gold, { size: 26, align: 'center' });
    });
  });
}

// ---------- F: 1957, the arm fitted ----------
function sceneFitted(t) {
  const a = span(t, 50.6, 59.8, 0.01, 0.5);
  if (a <= 0) return;
  const z = 1 - eio(seg(t, 51.0, 53.0));
  cam = camLerp(CAM_FULL, CAM_ZOOM, z);
  A(a, () => {
    ctx.save(); loupe(z);
    niche(1 - z);
    figures({ stub: 'cut', stubCut: 1, dim: z });
    // the plaster wedge between the cut face and the arm's break
    limb(along(POSE.bent[0], CUT), along(POSE.bent[0], BREAK), armW(CUT), armW(BREAK), C.plaster, C.edge, 2, { capA: false, capB: false });
    pollakArm(POSE.bent[0]);
    ctx.restore();
    loupeEdge(z);
    A(span(t, 51.2, 55.2, 0.5, 0.4), () => { font(600, 22); text(`${FITTED} · FILIPPO MAGI · VATICAN MUSEUMS`, CX, 170, { align: 'center', base: 'middle', color: C.gold, spacing: '1px' }); });
    A(span(t, 55.4, 59.8, 0.5, 0.4), () => {
      const [x, y] = PP(along(POSE.bent[0], (CUT + BREAK) / 2, -armW(CUT) / 2)); leader(x, y, 150, 470, C.plaster); pill('plaster', 90, 490, C.plaster);
      const [ex, ey] = PP(add(along(POSE.bent[0], L1), dir(POSE.bent[1]), L2 - 3)), [hx, hy] = PP(HEAD);
      leader(ex + 4, ey - 10, 330, 200, C.gold); pill('bends back toward the head', 300, 186, C.gold);
      void hx; void hy;
      font(500, 22); const [bx, by] = P(0, 0); text(`${HEIGHT_CM} cm high · INV. 1059`, bx, by + 30, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- G: the two poses ----------
function sceneTwo(t) {
  const a = span(t, 59.6, 64.6, 0.5, 0.0);
  if (a <= 0) return;
  A(a, () => {
    ctx.drawImage(bg, 0, 0);
    for (const [i, which] of [[0, 'raised'], [1, 'bent']]) {
      cam = { s: 1.62, ox: 230 + i * 404, oy: 690 };
      niche(1);
      figures({ stub: 'cut', stubCut: 1 });
      if (which === 'raised') arm(POSE.raised, { fill: C.terra, stroke: C.terraDark, u0: CUT });
      else { limb(along(POSE.bent[0], CUT), along(POSE.bent[0], BREAK), armW(CUT), armW(BREAK), C.plaster, C.edge, 2, { capA: false, capB: false }); pollakArm(POSE.bent[0]); }
      font(700, 26); text(which === 'raised' ? `${RAISED}–${FITTED}` : `since ${FITTED}`, cam.ox, 740, { align: 'center', base: 'middle', color: which === 'raised' ? C.terra : C.gold });
    }
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [CAP, MONO],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneVineyard(t);
    sceneGroup(t);
    sceneShop(t);
    sceneShoulder(t);
    sceneFitted(t);
    sceneTwo(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 600, family: CAP, ink: C.ink, marks: { '*': C.gold, '~': C.coral, '^': C.terra } });
  },
});
