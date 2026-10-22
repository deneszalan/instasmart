// Explainer for art-holbein-anamorphic-skull: the smear in Holbein's The Ambassadors is a skull,
// stretched so that it only looks right from a sharp angle.
// Look: dark green damask (the painting's curtain) with a gilt frame and gold leaf accents, a
// bone-coloured skull of our own drawn in code. Playfair Display for titles, EB Garamond for
// captions and labels.
//
// Scene plan (59.8 s). Captions centred at y = 836; key elements above y = 770.
//  A  0.0– 9.2  Hook. A diagram of The Ambassadors (1533): two silhouettes, the shelves of
//               objects, and a grey diagonal smear across the floor. What is it?
//  B  9.0–34.9  The trick, with our own skull. A skull drawn in code on a framed panel, with a
//               grid; it is stretched 5 times along one direction (an affine stretch, computed).
//               Then we walk round to look along the panel: a top-down inset shows the eye's
//               angle to the surface; the panel foreshortens by sin(angle), and at asin(1/5),
//               about 12°, the skull is a skull again.
//  C 34.7–40.6  Back to the painting: eyes high on the right and low on the left look along the
//               smear; insets show the skull they see.
//  D 40.3–59.8  Meaning, hedged as the source does: evidently a memento mori, but why so
//               prominent is unclear; the stairway idea and the glass-tube idea, both unproved.
//
// Facts (Wikipedia, "The Ambassadors (Holbein)"): a 1533 painting by Hans Holbein the Younger,
// in the National Gallery, London, since 1890; oil on oak, 207 × 209.5 cm; Jean de Dinteville
// (left) and Georges de Selve; the distorted skull at the bottom centre, in anamorphic
// perspective; "the viewer must approach the painting from high on the right side, or low on the
// left side"; "evidently intended as a vanitas or memento mori, it is unclear why Holbein gave it
// such prominence"; it "may have been designed to hang beside a doorway, or even in a stairwell",
// but no such viewing place has been identified; Edgar Samuel's glass-tube theory remains
// "reasonable but unproved". Wikipedia, "Anamorphosis": "a distorted projection that requires the
// viewer to occupy a specific vantage point"; "An oblique anamorphism forms an affine
// transformation of the subject". The skull, the stretch factor (5) and the angle are ours.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  green: '#12301F', greenDeep: '#0A1E13', damask: 'rgba(64,112,78,0.28)', damaskHi: 'rgba(120,170,120,0.10)',
  gold: '#D8B46A', goldLight: '#F1D79A', goldDeep: '#9C7B3A',
  ink: '#F3EAD3', soft: 'rgba(243,234,211,0.74)', faint: 'rgba(243,234,211,0.30)',
  bone: '#E6DCC3', boneShade: '#B9AD90', boneDark: '#1A1610', coral: '#E7967F',
  robe: '#2B211A', fur: '#4A3A2C', carpet: '#8E2F25', floor: '#5B4632', floorHi: '#7E6446',
};
const SERIF = 'Playfair', TEXT = 'Garamond';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- the anamorphosis, computed ----------
const S = 5;                                   // our stretch factor
const ANGLE = (Math.asin(1 / S) * 180) / Math.PI; // ≈ 11.5° from the picture's surface
/** ctx.transform for a stretch by f along the unit direction at angle a. */
function stretch(f, a) {
  const c = Math.cos(a), s = Math.sin(a), m = f - 1;
  ctx.transform(1 + m * c * c, m * c * s, m * c * s, 1 + m * s * s, 0, 0);
}

// ---------- timeline ----------
const T = { A: [0, 9.2], B: [9.0, 34.9], C: [34.7, 40.6], D: [40.3, 59.8] };
const CUES = [
  [0.4, 5.0, 'In Holbein’s *The Ambassadors*, 1533, a grey smear lies across the floor.'],
  [5.1, 9.2, 'From the front, it’s hard to tell what it is.'],
  [9.3, 13.3, 'Here is the trick, with a skull of our own.'],
  [13.4, 17.6, `Stretch it *${S} times* along one direction.`],
  [17.7, 21.6, 'Face on, it becomes a long, unreadable smear.'],
  [21.7, 26.2, 'Now view it from the side, almost along the picture.'],
  [26.3, 30.6, `Foreshortening squeezes it back ${S} times: a ~skull~.`],
  [30.7, 34.8, `That happens about ${Math.round(ANGLE)}° from the picture’s surface.`],
  [34.9, 40.7, 'In the painting, you see it from *high on the right*, or *low on the left*.'],
  [40.8, 45.1, 'The skull is evidently a ~memento mori~: a reminder of death.'],
  [45.2, 48.8, 'Why Holbein made it so prominent is unclear.'],
  [48.9, 53.6, 'One guess: it hung by stairs, to startle people passing by.'],
  [53.7, 59.0, 'Another: it was meant to be seen through a glass tube. Neither is proven.'],
];

// ---------- background: green damask ----------
let bg = null;
function motif(g, x, y, s, under = C.green) {
  // an ogee medallion with a pomegranate, the classic damask repeat
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath();
  g.moveTo(0, -80); g.bezierCurveTo(40, -60, 52, -20, 30, 10); g.bezierCurveTo(14, 32, 10, 60, 0, 80);
  g.bezierCurveTo(-10, 60, -14, 32, -30, 10); g.bezierCurveTo(-52, -20, -40, -60, 0, -80); g.closePath();
  g.fill();
  const fill = g.fillStyle;
  g.fillStyle = under; g.beginPath(); g.ellipse(0, -6, 16, 22, 0, 0, TAU); g.fill();
  g.fillStyle = fill; g.beginPath(); g.ellipse(0, -6, 9, 13, 0, 0, TAU); g.fill();
  for (const sx of [-1, 1]) {
    g.beginPath(); g.moveTo(sx * 30, 10); g.quadraticCurveTo(sx * 70, 0, sx * 72, 40); g.quadraticCurveTo(sx * 50, 30, sx * 30, 10); g.fill();
    g.beginPath(); g.moveTo(sx * 20, -60); g.quadraticCurveTo(sx * 60, -90, sx * 72, -50); g.quadraticCurveTo(sx * 44, -56, sx * 20, -60); g.fill();
  }
  g.restore();
}
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  g.fillStyle = C.green; g.fillRect(0, 0, W, H);
  g.fillStyle = C.damask;
  for (let row = -1; row < 8; row++) for (let col = -1; col < 7; col++) motif(g, col * 150 + (row % 2 ? 75 : 0), row * 170, 0.95);
  // silk sheen in vertical folds
  for (let i = 0; i < 12; i++) {
    const x = i * 72;
    const lg = g.createLinearGradient(x, 0, x + 72, 0);
    lg.addColorStop(0, 'rgba(0,0,0,0.14)'); lg.addColorStop(0.5, C.damaskHi); lg.addColorStop(1, 'rgba(0,0,0,0.14)');
    g.fillStyle = lg; g.fillRect(x, 0, 72, H);
  }
  const vg = g.createRadialGradient(W / 2, 440, 200, W / 2, 500, 780);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.font = `700 22px ${SERIF}`; g.fillStyle = C.gold; g.letterSpacing = '3px'; g.textBaseline = 'alphabetic';
  g.fillText('RECKON', 64, 84);
  const w = g.measureText('RECKON').width;
  g.font = `500 23px ${TEXT}`; g.fillStyle = C.soft; g.letterSpacing = '2px';
  g.fillText('ART · RENAISSANCE', 64 + w + 22, 84);
  g.letterSpacing = '0px';
}
function background() { if (!bg) paintBackground(); ctx.drawImage(bg, 0, 0); }

// ---------- our skull, drawn in code (about 180 × 210 at scale 1, centred) ----------
function skull(tone = 1) {
  const g = ctx.createRadialGradient(-30, -60, 10, 0, -10, 150);
  const bone = tone === 1 ? C.bone : '#B9B4A8', shade = tone === 1 ? C.boneShade : '#7D786E';
  g.addColorStop(0, bone); g.addColorStop(1, shade);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -30, 88, 84, 0, 0, TAU); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-74, -18); ctx.bezierCurveTo(-78, 30, -60, 62, -42, 70); ctx.lineTo(-40, 98);
  ctx.lineTo(40, 98); ctx.lineTo(42, 70); ctx.bezierCurveTo(60, 62, 78, 30, 74, -18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.boneDark;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 35, 6, 25, 22, sx * 0.18, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(-12, 54); ctx.quadraticCurveTo(0, 62, 12, 54); ctx.closePath(); ctx.fill();
  // cheekbone hollows
  ctx.fillStyle = 'rgba(26,22,16,0.35)';
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 58, 44, 10, 18, sx * -0.3, 0, TAU); ctx.fill(); }
  // teeth
  ctx.fillStyle = C.boneDark; ctx.fillRect(-38, 72, 76, 22);
  ctx.fillStyle = bone;
  for (let i = 0; i < 8; i++) { k.rrect(-36 + i * 9.2, 73, 7.6, 9, 2); ctx.fill(); k.rrect(-36 + i * 9.2, 84, 7.6, 9, 2); ctx.fill(); }
}

function grid(w, h, step, alpha) {
  withAlpha(alpha, () => {
    ctx.strokeStyle = 'rgba(216,180,106,0.35)'; ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = -w / 2; x <= w / 2 + 0.1; x += step) { ctx.moveTo(x, -h / 2); ctx.lineTo(x, h / 2); }
    for (let y = -h / 2; y <= h / 2 + 0.1; y += step) { ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y); }
    ctx.stroke();
  });
}

function giltFrame(x, y, w, h, lw = 18) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, C.goldLight); g.addColorStop(0.5, C.gold); g.addColorStop(1, C.goldDeep);
  ctx.strokeStyle = g; ctx.lineWidth = lw; ctx.strokeRect(x - lw / 2, y - lw / 2, w + lw, h + lw);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
}

// ---------- the painting, as a diagram ----------
const PF = { x: 156, y: 168, w: 552, h: 545 }; // 207 × 209.5 cm, nearly square
const SMEAR = { x: 432, y: 606, a: -0.42, sc: 0.5 };
function painting(t, { smear = 1, label = 1 } = {}) {
  const { x, y, w, h } = PF;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = '#163A26'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(90,150,100,0.20)';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) motif(ctx, x + 40 + c * 120 + (r % 2) * 60, y + 50 + r * 120, 0.55, '#163A26');
  // floor with a pattern of roundels
  const fy = y + h * 0.78;
  ctx.fillStyle = C.floor; ctx.fillRect(x, fy, w, h - (fy - y));
  ctx.strokeStyle = C.floorHi; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(x + 40 + i * 80, fy + 60, 34, 12, 0, 0, TAU); ctx.stroke(); }
  // the shelves of objects between the two figures
  const tx = x + w * 0.36, tw = w * 0.28;
  ctx.fillStyle = C.carpet; ctx.fillRect(tx, y + h * 0.40, tw, 26);
  ctx.fillStyle = '#5A3E28'; ctx.fillRect(tx, y + h * 0.40 + 26, tw, 8); ctx.fillRect(tx, y + h * 0.62, tw, 8);
  ctx.fillRect(tx + 6, y + h * 0.40, 8, h * 0.38); ctx.fillRect(tx + tw - 14, y + h * 0.40, 8, h * 0.38);
  ctx.fillStyle = '#C9B48A'; ctx.beginPath(); ctx.arc(tx + 40, y + h * 0.40 - 30, 28, 0, TAU); ctx.fill(); // celestial globe
  ctx.fillStyle = '#B79A5E'; ctx.fillRect(tx + 90, y + h * 0.40 - 40, 34, 40);                          // sundial
  ctx.fillStyle = '#9DB2A0'; ctx.beginPath(); ctx.arc(tx + 46, y + h * 0.62 - 28, 26, 0, TAU); ctx.fill(); // terrestrial globe
  ctx.fillStyle = '#A8773E'; ctx.beginPath(); ctx.ellipse(tx + 112, y + h * 0.62 - 20, 24, 18, 0, 0, TAU); ctx.fill(); // lute
  ctx.fillRect(tx + 130, y + h * 0.62 - 26, 26, 6);
  // two standing figures, as flat silhouettes (diagram)
  ctx.fillStyle = C.fur;
  ctx.beginPath(); ctx.moveTo(x + 30, y + h * 0.80); ctx.lineTo(x + 52, y + h * 0.30); ctx.quadraticCurveTo(x + 110, y + h * 0.22, x + 168, y + h * 0.30); ctx.lineTo(x + 192, y + h * 0.80); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C9A27E'; ctx.beginPath(); ctx.arc(x + 110, y + h * 0.20, 30, 0, TAU); ctx.fill();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x + 110, y + h * 0.36, 7, 0, TAU); ctx.fill();
  ctx.fillStyle = C.robe;
  ctx.beginPath(); ctx.moveTo(x + w - 40, y + h * 0.80); ctx.lineTo(x + w - 60, y + h * 0.30); ctx.quadraticCurveTo(x + w - 106, y + h * 0.24, x + w - 152, y + h * 0.30); ctx.lineTo(x + w - 172, y + h * 0.80); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C9A27E'; ctx.beginPath(); ctx.arc(x + w - 106, y + h * 0.21, 28, 0, TAU); ctx.fill();
  ctx.fillStyle = C.robe; ctx.fillRect(x + w - 132, y + h * 0.21 - 44, 52, 22);
  // the smear: our skull, stretched along a slanting axis and greyed
  withAlpha(smear, () => {
    ctx.save(); ctx.translate(SMEAR.x, SMEAR.y); stretch(S, SMEAR.a); ctx.scale(SMEAR.sc, SMEAR.sc); skull(0); ctx.restore();
  });
  ctx.restore();
  giltFrame(x, y, w, h);
  withAlpha(label, () => { font(400, 23); text('diagram of the painting', W / 2, y + h + 46, { align: 'center', color: C.soft }); });
}

// ---------- scene A ----------
function sceneA(t) {
  painting(t, { smear: eout(seg(t, 1.6, 2.6)) });
  withAlpha(span(t, 3.0, 9.2, 0.5, 0.3), () => {
    // a pulsing ring around the smear
    const p = 1 + 0.06 * Math.sin(t * 4);
    ctx.save(); ctx.translate(SMEAR.x, SMEAR.y); ctx.rotate(SMEAR.a);
    ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.ellipse(0, 0, 262 * p, 58 * p, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    font(700, 46, SERIF); text('?', SMEAR.x + 230, SMEAR.y - 150, { align: 'center', color: C.coral });
  });
}

// ---------- scene B: our own skull ----------
const PB = { cx: W / 2, cy: 500, w: 700, h: 330, sc: 0.7 };
function sceneB(t) {
  const st = eio(seg(t, 13.6, 16.6));          // the stretch, 1 → S
  const view = eio(seg(t, 22.0, 28.6));        // walking round: foreshortening 1 → 1/S
  const f = lerp(1, S, st), c = lerp(1, 1 / S, view);
  const angle = (Math.asin(c) * 180) / Math.PI;
  // the panel, foreshortened horizontally as we turn to look along it
  withAlpha(eout(seg(t, 9.2, 10.0)), () => {
    ctx.save();
    ctx.translate(PB.cx, PB.cy);
    ctx.scale(c, 1);
    ctx.fillStyle = '#0D2617'; ctx.fillRect(-PB.w / 2, -PB.h / 2, PB.w, PB.h);
    ctx.save(); ctx.beginPath(); ctx.rect(-PB.w / 2, -PB.h / 2, PB.w, PB.h); ctx.clip();
    ctx.save(); ctx.scale(f, 1); grid(PB.w * 2, PB.h, 30 / 1, 1 - 0.6 * view); ctx.restore();
    ctx.save(); ctx.scale(f, 1); ctx.scale(PB.sc, PB.sc); skull(); ctx.restore();
    ctx.restore();
    ctx.restore();
    // gilt frame drawn without the horizontal scale on its line width
    const fw = PB.w * c;
    giltFrame(PB.cx - fw / 2, PB.cy - PB.h / 2, fw, PB.h, 12);
  });
  // stretch readout
  withAlpha(span(t, 13.4, 22.2, 0.4, 0.4), () => {
    font(600, 40, SERIF); text(`stretched ×${f.toFixed(1)}`, W / 2, 268, { align: 'center', color: C.gold });
    font(400, 26); text('along one direction only', W / 2, 304, { align: 'center', color: C.soft });
  });
  // top-down view: the picture as a line, the eye moving round to a grazing angle
  withAlpha(span(t, 21.8, 34.9, 0.4, 0), () => {
    const ox = W / 2, oy = 280, len = 220, rr = 120;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ox - len / 2, oy); ctx.lineTo(ox + len / 2, oy); ctx.stroke();
    font(400, 22); text('the picture, seen from above', ox, oy + 30, { align: 'center', color: C.soft });
    const a = (angle * Math.PI) / 180;
    const ex = ox + rr * Math.cos(a), ey = oy - rr * Math.sin(a);
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.arc(ox, oy, rr, -Math.PI / 2, 0); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ox, oy); ctx.stroke(); ctx.setLineDash([]);
    eye(ex, ey, Math.atan2(oy - ey, ox - ex));
    font(600, 34, SERIF); text(`${Math.round(angle)}°`, ox - 64, oy - 60, { align: 'center', color: C.coral });
    font(400, 22); text('from the surface', ox - 64, oy - 34, { align: 'center', color: C.soft });
  });
  withAlpha(eout(seg(t, 28.8, 29.6)), () => {
    font(700, 30, SERIF); text('a skull again', W / 2, PB.cy + PB.h / 2 + 52, { align: 'center', color: C.goldLight });
  });
}

function eye(x, y, dir) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(dir);
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.greenDeep; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-18, 0); ctx.quadraticCurveTo(0, -15, 18, 0); ctx.quadraticCurveTo(0, 15, -18, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.greenDeep; ctx.beginPath(); ctx.arc(5, 0, 6.5, 0, TAU); ctx.fill();
  ctx.restore();
}

// ---------- scene C: back to the painting ----------
function sceneC(t) {
  painting(t, { label: 1 });
  const u = [Math.cos(SMEAR.a), Math.sin(SMEAR.a)];
  const pos = [[1, 'high on the right'], [-1, 'low on the left']];
  pos.forEach(([sgn, label], i) => {
    const a = eout(seg(t, 35.2 + i * 1.6, 36.0 + i * 1.6));
    withAlpha(a, () => {
      const d = sgn > 0 ? 330 : 300, ex = SMEAR.x + sgn * u[0] * d, ey = SMEAR.y + sgn * u[1] * d;
      ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.setLineDash([9, 7]);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(SMEAR.x, SMEAR.y); ctx.stroke(); ctx.setLineDash([]);
      eye(ex, ey, Math.atan2(SMEAR.y - ey, SMEAR.x - ex));
      // what that eye sees: the stretch cancelled
      const bx = sgn > 0 ? 690 : 176, by = sgn > 0 ? 250 : 556;
      ctx.fillStyle = 'rgba(10,30,19,0.9)'; ctx.beginPath(); ctx.arc(bx, by, 70, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bx, by, 70, 0, TAU); ctx.stroke();
      ctx.save(); ctx.translate(bx, by + 6); ctx.scale(0.42, 0.42); skull(0); ctx.restore();
      font(600, 24); text(label, bx, by + 100, { align: 'center', color: C.goldLight });
    });
  });
}

// ---------- scene D: what it means ----------
function sceneD(t) {
  // the skull, revealed, with the motto
  const a1 = span(t, 40.4, 48.9, 0.5, 0.4);
  withAlpha(a1, () => {
    ctx.save(); ctx.translate(W / 2, 430); ctx.scale(1.25, 1.25); skull(); ctx.restore();
    font(700, 50, SERIF); text('memento mori', W / 2, 642, { align: 'center', color: C.gold });
    font(400, 28, TEXT); text('“remember that you must die”', W / 2, 684, { align: 'center', color: C.soft });
    withAlpha(eout(seg(t, 44.9, 45.6)), () => {
      font(700, 40, SERIF); text('but why so big?', W / 2, 220, { align: 'center', color: C.coral });
    });
  });
  // two hypotheses, both unproved
  const cards = [
    [48.9, 'A stairway?', 'hung where people pass by, to surprise them', stairs],
    [53.7, 'A glass tube?', 'a simple glass optic, to see it face on', tube],
  ];
  cards.forEach(([t0, head, sub, icon], i) => {
    const a = eout(seg(t, t0, t0 + 0.7));
    const y = 250 + i * 250;
    withAlpha(a, () => {
      ctx.fillStyle = 'rgba(10,30,19,0.88)'; k.rrect(92, y, 680, 210, 18); ctx.fill();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; k.rrect(92, y, 680, 210, 18); ctx.stroke();
      icon(196, y + 105);
      font(700, 38, SERIF); text(head, 300, y + 84, { color: C.goldLight });
      font(400, 26); text(sub, 300, y + 136, { color: C.soft });
      // the verdict stamp
      const st = eout(seg(t, i ? 57.0 : 52.4, i ? 57.6 : 53.0));
      withAlpha(st, () => {
        ctx.save(); ctx.translate(660, y + 52); ctx.rotate(-0.12); ctx.scale(lerp(1.4, 1, st), lerp(1.4, 1, st));
        ctx.strokeStyle = C.coral; ctx.lineWidth = 3; k.rrect(-78, -22, 156, 44, 6); ctx.stroke();
        font(700, 24); text('UNPROVED', 0, 9, { align: 'center', color: C.coral, spacing: '2px' });
        ctx.restore();
      });
    });
  });
}
function stairs(x, y) {
  ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - 60, y + 50);
  for (let i = 0; i < 4; i++) { ctx.lineTo(x - 60 + i * 30, y + 50 - (i + 1) * 25); ctx.lineTo(x - 30 + i * 30, y + 50 - (i + 1) * 25); }
  ctx.stroke();
}
function tube(x, y) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.4);
  const g = ctx.createLinearGradient(0, -18, 0, 18);
  g.addColorStop(0, 'rgba(220,240,230,0.85)'); g.addColorStop(0.5, 'rgba(160,200,180,0.35)'); g.addColorStop(1, 'rgba(220,240,230,0.75)');
  ctx.fillStyle = g; k.rrect(-70, -18, 140, 36, 18); ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; k.rrect(-70, -18, 140, 36, 18); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(70, 0, 8, 18, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 600, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.gold, '~': C.coral } });
  }
}

Kit.scene({
  width: W, height: H, duration: 59.8,
  fonts: [
    { family: SERIF, file: 'PlayfairDisplay.woff2', weight: '400 900' },
    { family: TEXT, file: 'EBGaramond.woff2', weight: '400 800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
