// Explainer for art-campidoglio-trapezoid (Roma): Michelangelo kept the crooked 80° corner between two old palaces on
// the Capitoline Hill, mirrored it with a new palace, and so made the Piazza del Campidoglio a trapezoid that widens
// towards the Palazzo Senatorio: seen from the top of the Cordonata ramp, the far palace fills more of the view than
// it would at the end of a rectangle. Then the level oval with its star (laid only in 1940) and the bronze Marcus
// Aurelius, which survived because it was taken for Constantine. Look: an architect's sheet at dusk, travertine
// plans on navy, the perspective computed from a viewer's eye. Inter for labels and numbers, Alegreya for captions.
//
// Facts:
// - Wikipedia, "Piazza del Campidoglio": Pope Paul III commissioned Michelangelo to rebuild the square; the hilltop
//   had two crumbling medieval buildings set at an acute angle; the Palazzo Senatorio and the Palazzo dei
//   Conservatori form an 80° angle, on which Michelangelo aligned the new façades "to expand the perspective towards
//   the visual focus by the Palazzo Senatorio"; the Palazzo Nuovo was built (from 1603) as a mirror of the
//   Conservatori; Michelangelo designed the Cordonata ramp; the oval with a twelve-pointed star was his design, but
//   the paving was completed only in 1940, by Antonio Muñoz on Mussolini's order, from Étienne Dupérac's engraving.
// - Wikipedia, "Capitoline Hill" (citing de Tolnay): the three palazzi enclose a trapezoidal space approached by the
//   Cordonata; the travertine oval design is perfectly level: around its perimeter low steps rise and die away into
//   the paving as the slope requires.
// - UW "Rome: Art & Architecture", Campidoglio: Michelangelo received the commission in 1536; the two palaces form an
//   80° angle with the Palazzo Senatorio; the star pattern was recreated only in 1940; the statue in the square is a
//   replica; Paul III believed it showed Constantine.
// - museicapitolini.org, "The square and the flight of steps": the trapezoidal area between the two museums; the
//   statue's pedestal and an oval space with a star pattern were Michelangelo's design; the star motif added in 1940.
// - Wikipedia, "Equestrian statue of Marcus Aurelius": bronze, erected around AD 175, 4.24 m tall; bronze statues
//   were commonly melted down; it owes its survival to being mistaken for Constantine the Great, the Christian
//   emperor; moved to the Capitol in 1538 by Paul III; the open-air statue is a replica made in 1981, when the
//   original was taken down for restoration; the original is in the Palazzo dei Conservatori (Capitoline Museums).
// Measured on OpenStreetMap (square outline, way 23055100, and the palace outlines): about 44 m between the two
// palaces at the Cordonata end, about 58 m at the Palazzo Senatorio, about 54 m from end to end; the side façades
// splay out by about 7–8° each (the 80° corner would give 10°: tracing and the façades' details differ a little).
// Computed here: the far palace's width in the view from 8 m down the ramp, by perspective (width ÷ distance); a
// rectangle with the same entrance would show it 44/58 as wide, so the trapezoid shows it 58/44 ≈ 1.32 times wider.
// Façade heights in the perspective view are schematic.
//
// Scene plan (62.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The square from above: three palaces, the Cordonata, the statue.
//  B  9.2–18.0  The two old palaces at 80°; the new palace mirrors the angle.
//  C 18.0–22.4  A trapezoid: 44 m, 58 m, 54 m.
//  D 22.4–39.8  Up the Cordonata; perspective: a rectangle's far end shrinks, the trapezoid's opens out.
//  E 40.0–48.6  The oval and its star (1940); kept level on a sloping hilltop.
//  F 48.8–62.4  Marcus Aurelius: c. AD 175, taken for Constantine, indoors since 1981.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  navy: '#131c33', navy2: '#1d2b4a', ink: '#f2ebdc', soft: 'rgba(242,235,220,0.72)', faint: 'rgba(242,235,220,0.22)',
  stone: '#e8dfcc', stone2: '#cfc3a8', stone3: '#a99c80', terra: '#d0623f', teal: '#47b5a5', bronze: '#c1955a',
  pave: 'rgba(232,223,204,0.55)', sky1: '#2b3f66', sky2: '#d88a5f',
};
const SANS = 'Inter', SERIF = 'Alegreya';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
const rad = (d) => (d * Math.PI) / 180;

// ---------- the square, in metres (OpenStreetMap) ----------
const NEAR_W = 44, FAR_W = 58, DEPTH = 54;
const SPLAY = Math.atan((FAR_W - NEAR_W) / 2 / DEPTH) * 180 / Math.PI; // ≈ 7.4° each side
const CORNER = 80; // the old corner, as given by the sources
const EYE_BACK = 8, EYE_H = 1.6, FACADE_H = 18; // the viewer 8 m down the ramp; façade height schematic
const WIDER = FAR_W / NEAR_W; // 1.32: how much wider the far palace looks than at the end of a rectangle
const angWidth = (w) => 2 * Math.atan(w / 2 / (DEPTH + EYE_BACK)) * 180 / Math.PI;
if (Math.round(WIDER * 100) !== 132 || Math.round(SPLAY) !== 7) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On Rome’s Capitoline Hill, the artist *Michelangelo* redesigned the Piazza del Campidoglio.'],
  [4.8, 9.0, '*Pope Paul III* commissioned it in 1536; the plan was finished long after Michelangelo died.'],
  [9.2, 13.4, `Two old palaces stood there, meeting at an awkward angle of about ~${CORNER} degrees~, not 90.`],
  [13.6, 17.8, 'Michelangelo kept that angle, and mirrored it with a new palace on the other side.'],
  [18.0, 22.2, `So the square is a *trapezoid*: about ${NEAR_W} m wide at the entrance, ${FAR_W} m at the far end.`],
  [22.4, 26.6, 'You arrive up the *Cordonata*, a wide stepped ramp, and look along the square.'],
  [26.8, 31.0, 'In perspective, far things look smaller: the sides of a rectangle seem to close in.'],
  [31.2, 35.4, 'Here the sides open out instead, so the far palace fills more of your view.'],
  [35.6, 39.8, `From the top of the ramp it looks ~a third wider~ than at the end of a rectangle.`],
  [40.0, 44.2, 'In the middle: an oval with a 12-pointed star, Michelangelo’s design, laid only in *1940*.'],
  [44.4, 48.6, 'The hilltop slopes, so low steps rise and fade around the oval to keep it level.'],
  [48.8, 53.0, 'At its centre stood a bronze of the emperor *Marcus Aurelius*, made around AD 175.'],
  [53.2, 57.4, 'Most Roman bronzes were melted down. This one survived: people thought it showed ~Constantine~.'],
  [57.6, 61.8, 'In 1981 the original went indoors to be restored; a copy now stands in the square.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.navy2); lg.addColorStop(1, C.navy);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(242,235,220,0.05)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

// ---------- the plan: axis vertical, entrance (Cordonata) at the bottom, Palazzo Senatorio at the top ----------
const P = { cx: CX, y0: 530, s: 5.6 }; // y0: entrance line; s: px per metre
const px = (x) => P.cx + x * P.s, py = (z) => P.y0 - z * P.s;
/** The side façade line on one side (sign −1 left, +1 right) for a half-width growing by `splay` degrees. */
const halfW = (z, splay) => NEAR_W / 2 + z * Math.tan(rad(splay));
function palace(x0, z0, x1, z1, depth, side, fill, a = 1) {
  // a block behind a façade line from (x0,z0) to (x1,z1), extending `depth` m outwards on `side`
  A(a, () => {
    const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz), nx = (dz / len) * side, nz = (-dx / len) * side;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(px(x0), py(z0)); ctx.lineTo(px(x1), py(z1)); ctx.lineTo(px(x1 + nx * depth), py(z1 + nz * depth)); ctx.lineTo(px(x0 + nx * depth), py(z0 + nz * depth));
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px(x0), py(z0)); ctx.lineTo(px(x1), py(z1)); ctx.stroke();
  });
}
function plan(t, { splay = SPLAY, nuovo = 1, oldOnly = false, oval = 0, statue = 1, cordonata = 1 } = {}) {
  const a = NEAR_W / 2, b = halfW(DEPTH, splay);
  // paving
  ctx.fillStyle = 'rgba(232,223,204,0.10)';
  ctx.beginPath(); ctx.moveTo(px(-a), py(0)); ctx.lineTo(px(a), py(0)); ctx.lineTo(px(b), py(DEPTH)); ctx.lineTo(px(-b), py(DEPTH)); ctx.closePath(); ctx.fill();
  // Palazzo Senatorio at the far end, its tower in the middle
  palace(-b - 4, DEPTH, b + 4, DEPTH, 15, -1, C.stone2);
  ctx.fillStyle = C.stone3; ctx.fillRect(px(-5), py(DEPTH + 11), 10 * P.s, 7 * P.s);
  // Palazzo dei Conservatori on the right; the Palazzo Nuovo mirrors it on the left
  palace(a, 0, b, DEPTH, 22, 1, C.stone2);
  if (!oldOnly) palace(-a, 0, -b, DEPTH, 22, -1, C.stone, nuovo);
  // the Cordonata, coming up to the entrance
  A(cordonata, () => {
    ctx.fillStyle = 'rgba(232,223,204,0.25)';
    ctx.beginPath(); ctx.moveTo(px(-7), py(0)); ctx.lineTo(px(7), py(0)); ctx.lineTo(px(9), py(-28)); ctx.lineTo(px(-9), py(-28)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(242,235,220,0.35)'; ctx.lineWidth = 1.5;
    for (let z = -26; z < 0; z += 3) { ctx.beginPath(); ctx.moveTo(px(-8), py(z)); ctx.lineTo(px(8), py(z)); ctx.stroke(); }
  });
  if (oval > 0) ovalStar(px(0), py(DEPTH / 2), 15 * P.s, 11 * P.s, oval, t);
  if (statue > 0) A(statue, () => { ctx.fillStyle = C.bronze; ctx.beginPath(); ctx.arc(px(0), py(DEPTH / 2), 9, 0, TAU); ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 2; ctx.stroke(); });
}
/** The oval with its interlaced twelve-pointed star, drawn in as p goes from 0 to 1. */
function ovalStar(cx, cy, rx, ry, p, t) {
  ctx.save();
  ctx.strokeStyle = C.pave; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU * clamp(p * 1.5)); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.86, ry * 0.86, 0, 0, TAU * clamp(p * 1.5)); ctx.stroke();
  const q = clamp(p * 1.6 - 0.4);
  ctx.strokeStyle = 'rgba(232,223,204,0.8)'; ctx.lineWidth = 2;
  // a net of curves twisting out from a small central ring, twelve each way, like the pavement's interlaced star
  ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.16, ry * 0.16, 0, 0, TAU); ctx.stroke();
  for (const dir of [1, -1]) {
    for (let i = 0; i < 12; i++) {
      if (i / 12 > q) break;
      const a0 = (i / 12) * TAU, a1 = a0 + dir * 1.05;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a0) * rx * 0.16, cy + Math.sin(a0) * ry * 0.16);
      const am = a0 + dir * 0.62;
      ctx.quadraticCurveTo(cx + Math.cos(am) * rx * 0.62, cy + Math.sin(am) * ry * 0.62, cx + Math.cos(a1) * rx * 0.86, cy + Math.sin(a1) * ry * 0.86);
      ctx.stroke();
    }
  }
  ctx.restore();
}
function angleArc(cx, cy, r, from, to, label, a) {
  A(a, () => {
    ctx.strokeStyle = C.terra; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, r, from, to, to < from); ctx.stroke();
    font(800, 30); text(label, cx + Math.cos((from + to) / 2) * (r + 34), cy + Math.sin((from + to) / 2) * (r + 34), { align: 'center', base: 'middle', color: C.terra });
  });
}
function labelPill(s, x, y, col = C.ink, size = 24) {
  font(700, size);
  const w = ctx.measureText(s).width + 24;
  ctx.fillStyle = 'rgba(19,28,51,0.85)'; k.rrect(x - w / 2, y - size * 0.75, w, size * 1.5, 10); ctx.fill();
  text(s, x, y, { align: 'center', base: 'middle', color: col });
}

// ---------- perspective views ----------
/** Draw the square in one-point perspective inside a panel, for a far half-width b; returns the far façade's width in px. */
function perspective(x0, y0, w, h, b, title, tone) {
  const f = w * 0.55, cx = x0 + w / 2, hy = y0 + h * 0.62;
  const P3 = (X, Y, Z) => [cx + (f * X) / (Z + EYE_BACK), hy - (f * (Y - EYE_H)) / (Z + EYE_BACK)];
  const a = NEAR_W / 2;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
  // sky and paving
  const sg = ctx.createLinearGradient(0, y0, 0, hy); sg.addColorStop(0, C.sky1); sg.addColorStop(1, C.sky2);
  ctx.fillStyle = sg; ctx.fillRect(x0, y0, w, hy - y0);
  ctx.fillStyle = '#5d5547'; ctx.fillRect(x0, hy, w, y0 + h - hy);
  const quad = (pts, fill) => { ctx.fillStyle = fill; ctx.beginPath(); pts.forEach(([X, Y, Z], i) => { const [u, v] = P3(X, Y, Z); i ? ctx.lineTo(u, v) : ctx.moveTo(u, v); }); ctx.closePath(); ctx.fill(); };
  quad([[-a, 0, 0], [a, 0, 0], [b, 0, DEPTH], [-b, 0, DEPTH]], '#8d826d');
  // side façades and the far palace
  quad([[-a, 0, 0], [-b, 0, DEPTH], [-b, FACADE_H, DEPTH], [-a, FACADE_H, 0]], C.stone2);
  quad([[a, 0, 0], [b, 0, DEPTH], [b, FACADE_H, DEPTH], [a, FACADE_H, 0]], C.stone2);
  quad([[-b, 0, DEPTH], [b, 0, DEPTH], [b, FACADE_H, DEPTH], [-b, FACADE_H, DEPTH]], C.stone);
  // arcades on the side palaces, windows on the far one
  for (let i = 1; i < 9; i++) {
    const z = (i / 9) * DEPTH, hw = a + (b - a) * (i / 9);
    for (const s of [-1, 1]) { const [u1, v1] = P3(s * hw, 0, z), [u2, v2] = P3(s * hw, 7, z); ctx.strokeStyle = C.stone3; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(u1, v1); ctx.lineTo(u2, v2); ctx.stroke(); }
  }
  const [lx, ly] = P3(-b, 0, DEPTH), [rx, ry] = P3(b, FACADE_H, DEPTH);
  ctx.fillStyle = C.stone3;
  for (let i = 0; i < 9; i++) { const u = lerp(lx, rx, (i + 0.6) / 9.2); ctx.fillRect(u, ly - (ly - ry) * 0.7, (rx - lx) / 30, (ly - ry) * 0.25); }
  const [tx, ty] = P3(0, FACADE_H + 14, DEPTH + 4); ctx.fillRect(tx - (rx - lx) * 0.05, ty, (rx - lx) * 0.1, ry - ty); // the tower
  // the statue in the middle
  const [sx, sy] = P3(0, 0, DEPTH / 2), [, st] = P3(0, 7, DEPTH / 2);
  ctx.fillStyle = C.bronze; ctx.fillRect(sx - 6, st, 12, sy - st);
  ctx.restore();
  ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, w, h);
  // the far palace's width in the view
  ctx.strokeStyle = tone; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(lx, y0 + h + 16); ctx.lineTo(rx, y0 + h + 16); ctx.stroke();
  for (const u of [lx, rx]) { ctx.beginPath(); ctx.moveTo(u, y0 + h + 6); ctx.lineTo(u, y0 + h + 26); ctx.stroke(); }
  font(700, 24); text(title, x0 + w / 2, y0 - 22, { align: 'center', base: 'middle', color: tone });
  return rx - lx;
}

// ---------- scenes ----------
function scenePlan(t) {
  const a = span(t, 0, 22.5, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const nuovo = t < 9.2 ? 1 : eio(seg(t, 14.2, 15.8));
    const oldOnly = t >= 9.2 && t < 14.2;
    plan(t, { nuovo, oldOnly, statue: t < 9.2 ? 1 : 0, cordonata: t < 9.2 || t > 18 ? 1 : 0.4 });
    A(seg(t, 0.6, 1.4) * (1 - seg(t, 8.8, 9.2)), () => {
      labelPill('Palazzo Senatorio', CX, py(DEPTH + 22), C.ink, 24);
      labelPill('Palazzo dei', px(halfW(DEPTH / 2, SPLAY) + 30), py(DEPTH / 2) - 16, C.ink, 22);
      labelPill('Conservatori', px(halfW(DEPTH / 2, SPLAY) + 30), py(DEPTH / 2) + 18, C.ink, 22);
      labelPill('Palazzo', px(-halfW(DEPTH / 2, SPLAY) - 30), py(DEPTH / 2) - 16, C.ink, 22);
      labelPill('Nuovo', px(-halfW(DEPTH / 2, SPLAY) - 30), py(DEPTH / 2) + 18, C.ink, 22);
      labelPill('Cordonata', CX, py(-34), C.soft, 22);
    });
    // the 80° corner
    const b = halfW(DEPTH, SPLAY);
    const toNear = Math.atan2(py(0) - py(DEPTH), px(NEAR_W / 2) - px(b)), toLeft = Math.PI;
    angleArc(px(b), py(DEPTH), 46, toLeft, toNear, `${CORNER}°`, span(t, 10.0, 17.8, 0.5, 0.4));
    angleArc(px(-b), py(DEPTH), 46, 0, Math.PI - toNear, `${CORNER}°`, span(t, 15.6, 17.8, 0.5, 0.4));
    A(span(t, 10.4, 13.6, 0.4, 0.3), () => { labelPill('two old palaces', CX, py(-4) + 70, C.terra, 26); });
    A(span(t, 14.4, 17.8, 0.4, 0.3), () => { labelPill('a new palace, mirrored', px(-b) - 10, py(-4) + 70, C.teal, 26); });
    // dimensions
    A(span(t, 18.2, 22.5, 0.4, 0.4), () => {
      ctx.strokeStyle = C.teal; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(px(-NEAR_W / 2), py(0) + 24); ctx.lineTo(px(NEAR_W / 2), py(0) + 24); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px(-b), py(DEPTH) + 24); ctx.lineTo(px(b), py(DEPTH) + 24); ctx.stroke();
      labelPill(`${NEAR_W} m`, CX, py(0) + 24, C.teal, 26);
      labelPill(`${FAR_W} m`, CX, py(DEPTH) + 24, C.teal, 26);
      labelPill(`${DEPTH} m deep`, px(-NEAR_W / 2) + 60, py(DEPTH / 2) + 70, C.ink, 22);
      labelPill('measured on OpenStreetMap', CX, py(0) + 64, C.soft, 20);
    });
  });
}
function scenePerspective(t) {
  const a = span(t, 22.4, 40.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 22.4–26.8: one big view, walking up the ramp
    if (t < 26.8) {
      perspective(112, 150, 640, 470, halfW(DEPTH, SPLAY), 'from the top of the Cordonata', C.ink);
      return;
    }
    const showTrap = seg(t, 31.2, 32.2);
    const wr = perspective(48, 160, 370, 380, NEAR_W / 2, 'if it were a rectangle', C.terra);
    let wt = 0;
    A(showTrap, () => { wt = perspective(446, 160, 370, 380, halfW(DEPTH, SPLAY), 'Michelangelo’s trapezoid', C.teal); });
    A(seg(t, 27.2, 28.2), () => {
      font(800, 30); text(`${angWidth(NEAR_W).toFixed(0)}° of your view`, 48 + 185, 610, { align: 'center', base: 'middle', color: C.terra });
    });
    A(showTrap, () => { font(800, 30); text(`${angWidth(FAR_W).toFixed(0)}° of your view`, 446 + 185, 610, { align: 'center', base: 'middle', color: C.teal }); });
    A(seg(t, 35.8, 36.8), () => {
      const g = lerp(1, WIDER, eio(seg(t, 36.0, 37.6)));
      ctx.fillStyle = 'rgba(19,28,51,0.9)'; k.rrect(210, 660, 444, 74, 14); ctx.fill();
      font(800, 40); text(`× ${g.toFixed(2)} as wide`, CX, 697, { align: 'center', base: 'middle', color: C.teal });
    });
  });
}
function sceneOval(t) {
  const a = span(t, 40.0, 48.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 44.4) {
      plan(t, { oval: eio(seg(t, 40.4, 43.4)), statue: 0, cordonata: 0.5 });
      A(seg(t, 41.6, 42.4), () => { labelPill('12-pointed star, 1940', CX, py(-4) + 70, C.ink, 26); });
      return;
    }
    // a section along the square: the hill slopes, the oval stays level
    const L = 80, R = 784, base = 360;
    const slope = (x) => base + (x - L) * 0.16;
    ctx.fillStyle = '#5d5547';
    ctx.beginPath(); ctx.moveTo(L, slope(L)); ctx.lineTo(R, slope(R)); ctx.lineTo(R, 640); ctx.lineTo(L, 640); ctx.closePath(); ctx.fill();
    const ovL = 250, ovR = 614, level = slope((ovL + ovR) / 2);
    const g = eio(seg(t, 44.8, 46.4));
    // the level oval, raised above the low side and cut into the high side
    ctx.fillStyle = C.stone;
    ctx.beginPath(); ctx.moveTo(ovL, lerp(slope(ovL), level, g)); ctx.lineTo(ovR, lerp(slope(ovR), level, g)); ctx.lineTo(ovR, level + 14); ctx.lineTo(ovL, level + 14); ctx.closePath(); ctx.fill();
    // the low steps, rising where the ground falls away and fading where it meets
    A(seg(t, 46.0, 46.8), () => {
      ctx.fillStyle = C.stone2;
      // on the low side, steps go down from the oval to the paving; on the high side, down from the paving into it
      for (let i = 0; i < 4; i++) {
        const x = ovR + i * 22, y = level + i * 9;
        if (y < slope(x)) ctx.fillRect(x, y, 22, slope(x) - y);
        const x2 = ovL - (i + 1) * 22, y2 = level - (i + 1) * 9;
        if (y2 > slope(x2 + 22)) ctx.fillRect(x2, y2, 22, level + 14 - y2);
      }
      labelPill('steps', ovR + 50, level - 46, C.ink, 26);
      labelPill('steps', ovL - 50, level - 92, C.ink, 26);
      labelPill('the oval: level', (ovL + ovR) / 2, level - 46, C.teal, 26);
      labelPill('the hilltop slopes', R - 140, slope(R - 140) + 70, C.soft, 24);
    });
    ctx.strokeStyle = C.teal; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(L, level); ctx.lineTo(R, level); ctx.stroke(); ctx.setLineDash([]);
    font(500, 22); text('section, slope exaggerated', L, 680, { base: 'middle', color: C.soft });
  });
}
function horseman(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col;
  // horse: body, neck, head, raised foreleg, legs, tail
  ctx.beginPath(); ctx.ellipse(0, 0, 96, 46, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(52, -26); ctx.quadraticCurveTo(84, -70, 104, -92); ctx.lineTo(130, -80); ctx.quadraticCurveTo(110, -40, 96, 6); ctx.closePath(); ctx.fill(); // neck
  ctx.beginPath(); ctx.moveTo(104, -96); ctx.lineTo(150, -64); ctx.lineTo(140, -50); ctx.lineTo(112, -66); ctx.closePath(); ctx.fill(); // head
  ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = 20;
  ctx.beginPath(); ctx.moveTo(66, 26); ctx.lineTo(104, 30); ctx.lineTo(112, 64); ctx.stroke(); // raised foreleg
  for (const [a, b] of [[44, 34], [-58, 34], [-80, 28]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(a + (a > 0 ? -2 : 2), 122); ctx.stroke(); }
  ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-92, -10); ctx.quadraticCurveTo(-128, 30, -114, 84); ctx.stroke();
  // rider, arm stretched out
  ctx.beginPath(); ctx.ellipse(6, -66, 26, 44, -0.1, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(10, -124, 18, 0, TAU); ctx.fill();
  ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(22, -86); ctx.lineTo(78, -112); ctx.stroke();
  ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(-6, -30); ctx.lineTo(-20, 36); ctx.stroke();
  ctx.restore();
}
function sceneStatue(t) {
  const a = span(t, 48.8, 62.4, 0.5, 0);
  if (a <= 0) return;
  A(a, () => {
    const y = 420;
    // the pedestal Michelangelo designed
    ctx.fillStyle = C.stone2; k.rrect(CX - 140, y + 140, 280, 150, 16); ctx.fill();
    ctx.fillStyle = C.stone; k.rrect(CX - 160, y + 128, 320, 22, 8); ctx.fill(); k.rrect(CX - 160, y + 284, 320, 22, 8); ctx.fill();
    const gone = seg(t, 58.0, 59.2), back = seg(t, 59.6, 60.6);
    // the bronze original, lifted away in 1981; the copy arrives
    A(1 - gone, () => horseman(CX - 10, y + 2, 1.05, C.bronze));
    A(back, () => horseman(CX - 10, y + 2, 1.05, '#9a8f7c'));
    A(seg(t, 49.4, 50.2) * (1 - seg(t, 53.0, 53.4)), () => labelPill('c. AD 175 · 4.24 m tall', CX, 200, C.bronze, 26));
    A(span(t, 53.4, 57.6, 0.4, 0.3), () => {
      // melted down: a crucible of bronze
      const cx = 160, cy = 240;
      ctx.fillStyle = '#8a4a2a'; ctx.beginPath(); ctx.moveTo(cx - 54, cy - 20); ctx.lineTo(cx + 54, cy - 20); ctx.lineTo(cx + 36, cy + 50); ctx.lineTo(cx - 36, cy + 50); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f2a25a'; ctx.beginPath(); ctx.ellipse(cx, cy - 20, 54, 12, 0, 0, TAU); ctx.fill();
      labelPill('most bronzes: melted', cx + 10, cy + 90, C.soft, 22);
      labelPill('“Constantine”?', CX + 210, 220, C.teal, 26);
    });
    A(seg(t, 58.0, 58.8), () => {
      // the museum, where the original now stands
      ctx.fillStyle = C.stone2; ctx.fillRect(560, 150, 220, 140);
      ctx.fillStyle = C.navy2; for (let i = 0; i < 4; i++) ctx.fillRect(578 + i * 50, 190, 30, 70);
      font(700, 22); text('Capitoline Museums', 670, 132, { align: 'center', base: 'middle', color: C.ink });
      A(gone, () => horseman(670, 240, 0.3, C.bronze));
      labelPill('copy in the square', CX - 10, 760, C.ink, 24);
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 62.4, fonts: [SANS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    scenePlan(t);
    scenePerspective(t);
    sceneOval(t);
    sceneStatue(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 600, family: SERIF, ink: C.ink, marks: { '*': C.bronze, '~': C.teal, '^': C.terra } });
  },
});
