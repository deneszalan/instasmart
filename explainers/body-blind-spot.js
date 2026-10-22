// Explainer for body-blind-spot: the optic disc has no rods or cones, so each eye has a blind spot.
// Look: a medical cross-section diagram in warm reds and creams on a deep crimson, tissue-grained ground.
// Lora (italic) for diagram labels and headings, Rubik for captions.
//
// Scene plan (61.5 s). Captions centred at y = 836; everything important sits above y = 930.
//  A  0.0–9.6   Hook. The eye diagram draws itself: sclera, cornea, iris, lens, the red retina lining the
//               back, the optic nerve leaving it. "Right now, each of your eyes has a hole…"
//  B  9.4–25.6  Mechanism. Rays focus on the retina and the rods and cones there light up. Nerve fibres run
//               across the retina's surface to one spot and leave as the optic nerve (pulses flow out). The
//               disc is ringed: no rods or cones; a ray landing there lights nothing.
//  C 25.4–36.0  Where and why you don't notice. Top-down view field of the right eye: the gap sits 12–15° to
//               the ear side of where you look (5.5° wide). Then a striped patch with a hole "fills in".
//  D 35.8–61.5  Try it. A cream card with a red cross and a dark dot, held still. Steps: close the left eye,
//               stare at the cross with the right, move closer and back, the dot vanishes, pause to try.
//
// Facts (Wikipedia, "Blind spot (vision)" and "Optic disc"): the physiological blind spot corresponds to the
// lack of photoreceptors on the optic disc, where the optic nerve passes through; the brain interpolates it
// from surrounding detail and the other eye; it sits about 12–15° temporally and 1.5° below the horizontal
// and is roughly 7.5° high and 5.5° wide. The optic disc is where retinal ganglion cell axons leave the eye;
// no rods or cones overlie it. Test geometry: with the cross on the left and the dot on the right, the right
// eye's blind spot (temporal, so to the right) catches the dot; on a phone card ~7 cm wide the 564 px gap is
// ~4.6 cm, which spans 12–15° at roughly 17–22 cm, so moving the face closer finds it.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const TAU = Math.PI * 2, D2R = Math.PI / 180;

const C = {
  bg0: '#1C0508', bg1: '#36090F', bg2: '#571219', cream: '#FFF3EA', creamSoft: 'rgba(255,236,224,0.74)', faint: 'rgba(255,220,205,0.42)',
  sclera: '#F5E3D6', scleraEdge: '#D9BBA8', retina: '#E0473A', retinaDeep: '#9E2025', pink: '#F7B2A6', glow: '#FFC27A', coral: '#FF8A70',
  nerve: '#F2D3BD', nerveLine: '#D5A88D', lens: 'rgba(255,240,230,0.55)', iris: '#B5452F', card: '#FBEEDD', cross: '#C62828', dot: '#3A0A10',
};
const DISPLAY = 'Lora', TEXT = 'Rubik';

let k, ctx;
const font = (w, s, f = TEXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.cream, ...o });
const A = (a, fn) => k.alpha(a, fn);
const label = (s, x, y, { size = 26, color = C.creamSoft, align = 'center', italic = true } = {}) => {
  ctx.font = `${italic ? 'italic ' : ''}500 ${size}px ${DISPLAY}`; text(s, x, y, { color, align });
};

const T = { A: [0, 9.6], B: [9.4, 25.6], C: [25.4, 36.0], D: [35.8, 61.5] };
const CUES = [
  [0.4, 5.0, 'Right now, each of your eyes has a *hole* in what it sees.'],
  [5.1, 9.4, 'Here’s where it comes from, and how to find yours.'],
  [9.6, 14.4, 'Light lands on the *retina*, lined with light-sensing rods and cones.'],
  [14.5, 19.6, 'The retina’s nerve fibres gather at one spot and leave as the ~optic nerve~.'],
  [19.7, 25.4, 'That spot, the *optic disc*, has no rods or cones, so it is blind.'],
  [25.6, 30.9, 'In your view, the gap sits *12–15°* to the side of where you look.'],
  [31.0, 35.7, 'Your brain fills it in from the surroundings and the other eye.'],
  [36.0, 40.2, 'Try it. Close or cover your *left eye*.'],
  [40.3, 45.3, 'With your right eye, look straight at the *cross* and keep looking.'],
  [45.4, 50.4, 'Slowly move your face closer to the screen, then farther away.'],
  [50.5, 55.6, 'At one distance the ~dot~ disappears: it has landed on your blind spot.'],
  [55.7, 61.3, 'Pause to keep trying. Your brain fills the gap with the cream around it.'],
];

// ---------- background ----------
let bg = null;
function rnd(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(430, 400, 40, 430, 460, 860);
  rg.addColorStop(0, C.bg2); rg.addColorStop(0.5, C.bg1); rg.addColorStop(1, C.bg0);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // tissue-like fibres
  const r = rnd(11);
  g.lineCap = 'round';
  for (let i = 0; i < 160; i++) {
    const x = r() * W, y = r() * H, len = 60 + r() * 160, a = -0.4 + r() * 0.8;
    g.strokeStyle = `rgba(255,170,150,${0.015 + r() * 0.03})`; g.lineWidth = 1 + r() * 2.5;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + len / 2, y + Math.sin(a) * 40 + (r() - 0.5) * 30, x + len * Math.cos(a), y + len * Math.sin(a)); g.stroke();
  }
  for (let i = 0; i < 7000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,220,210,0.03)' : 'rgba(0,0,0,0.06)'; g.fillRect(r() * W, r() * H, 1.5, 1.5); }
  const vg = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,0,2,0.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function background() {
  if (!bg) paintBg();
  ctx.drawImage(bg, 0, 0);
  font(600, 22); text('BODY · VISION', 64, 84, { color: C.pink, spacing: '3px' });
}

// ---------- the eye ----------
const E = { x: 440, y: 420, R: 250 };
const DISC = 17; // degrees below the axis where the optic disc sits in this diagram
const retinaPt = (deg, inset = 16) => [E.x + Math.cos(deg * D2R) * (E.R - inset), E.y + Math.sin(deg * D2R) * (E.R - inset)];
const LENS = { x: 268, y: 420 };

function eye(t, draw = 1) {
  const p = (a, b) => eio(seg(draw, a, b));
  // vitreous body
  A(p(0, 0.4), () => {
    const vg = ctx.createRadialGradient(E.x - 40, E.y - 30, 30, E.x, E.y, E.R);
    vg.addColorStop(0, 'rgba(255,225,215,0.10)'); vg.addColorStop(1, 'rgba(255,200,190,0.03)');
    ctx.fillStyle = vg; ctx.beginPath(); ctx.arc(E.x, E.y, E.R - 10, 0, TAU); ctx.fill();
  });
  // optic nerve (behind the sclera)
  const [dx, dy] = [E.x + Math.cos(DISC * D2R) * E.R, E.y + Math.sin(DISC * D2R) * E.R];
  A(p(0.5, 0.9), () => {
    const len = 260 * p(0.5, 0.95);
    ctx.save(); ctx.translate(dx - 8, dy); ctx.rotate(DISC * D2R * 0.6);
    const ng = ctx.createLinearGradient(0, -40, 0, 40); ng.addColorStop(0, '#E9C3AA'); ng.addColorStop(0.5, C.nerve); ng.addColorStop(1, '#D9AE95');
    ctx.fillStyle = ng; k.rrect(0, -38, len, 76, 18); ctx.fill();
    ctx.strokeStyle = C.nerveLine; ctx.lineWidth = 1.6;
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(10, i * 9); ctx.lineTo(len - 6, i * 9 + Math.sin(i) * 2); ctx.stroke(); }
    ctx.restore();
  });
  // sclera: a thick cream shell, open at the front for the cornea
  const sa = 148 * p(0, 0.6);
  if (sa > 1) {
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = C.sclera; ctx.lineWidth = 16;
  ctx.beginPath(); ctx.arc(E.x, E.y, E.R, -sa * D2R, sa * D2R); ctx.stroke();
  ctx.strokeStyle = C.scleraEdge; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(E.x, E.y, E.R + 8, -sa * D2R, sa * D2R); ctx.stroke();
  ctx.restore();
  }
  // cornea
  A(p(0.35, 0.6), () => {
    ctx.save(); ctx.strokeStyle = 'rgba(255,240,232,0.85)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(278, E.y, 126, (180 - 62) * D2R, (180 + 62) * D2R); ctx.stroke(); ctx.restore();
  });
  // retina
  const ra = 128 * p(0.2, 0.8);
  if (ra > 1) ctx.save(); else return; ctx.strokeStyle = C.retina; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(E.x, E.y, E.R - 14, -ra * D2R, ra * D2R); ctx.stroke();
  ctx.strokeStyle = C.retinaDeep; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(E.x, E.y, E.R - 8, -ra * D2R, ra * D2R); ctx.stroke();
  ctx.restore();
  // iris and lens
  A(p(0.55, 0.85), () => {
    ctx.save(); ctx.fillStyle = C.iris;
    k.rrect(232, E.y - 150, 16, 96, 8); ctx.fill(); k.rrect(232, E.y + 54, 16, 96, 8); ctx.fill();
    ctx.fillStyle = C.lens; ctx.strokeStyle = 'rgba(255,245,238,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(LENS.x, LENS.y, 30, 86, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
}
function eyeLabels(a) {
  A(a, () => {
    label('retina', 640, 160, { color: C.pink });
    label('lens', 306, 316, { color: C.creamSoft });
    label('optic nerve', 744, 600, { color: C.nerve });
    label('Diagram, not to scale', E.x, 726, { size: 22, color: C.faint });
  });
}

// receptors along the retina, with a gap at the disc
const RECEPTORS = [];
for (let d = -120; d <= 120; d += 3.2) if (Math.abs(d - DISC) > 7) RECEPTORS.push(d);
function receptors(t, a, litAt = null, litAmt = 0) {
  A(a, () => {
    ctx.save(); ctx.lineCap = 'round';
    for (const d of RECEPTORS) {
      const [x1, y1] = retinaPt(d, 22), [x2, y2] = retinaPt(d, 36);
      const lit = litAt === null ? 0 : litAmt * Math.max(0, 1 - Math.abs(d - litAt) / 12);
      ctx.strokeStyle = lit > 0.05 ? `rgba(255,${Math.round(lerp(178, 214, lit))},${Math.round(lerp(166, 122, lit))},1)` : C.pink;
      ctx.lineWidth = 4 + lit * 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      if (lit > 0.05) {
        const g = ctx.createRadialGradient(x2, y2, 0, x2, y2, 22); g.addColorStop(0, `rgba(255,194,122,${0.6 * lit})`); g.addColorStop(1, 'rgba(255,194,122,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x2, y2, 22, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  });
}
/** Three rays from the far left focused through the lens onto the retina at angle `deg`. */
function rays(t, t0, deg, a = 1, color = 'rgba(255,214,150,0.9)') {
  const [tx, ty] = retinaPt(deg, 36);
  const p = eio(seg(t, t0, t0 + 1.8));
  A(a, () => {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (const off of [-60, 0, 60]) {
      const sx = 20, sy = E.y + off * 1.1 + (ty - E.y) * -0.5;
      const lx = LENS.x, ly = LENS.y + off;
      const seg1 = Math.hypot(lx - sx, ly - sy), seg2 = Math.hypot(tx - lx, ty - ly), tot = seg1 + seg2;
      const d = p * tot;
      ctx.beginPath(); ctx.moveTo(sx, sy);
      if (d <= seg1) ctx.lineTo(lerp(sx, lx, d / seg1), lerp(sy, ly, d / seg1));
      else { ctx.lineTo(lx, ly); ctx.lineTo(lerp(lx, tx, (d - seg1) / seg2), lerp(ly, ty, (d - seg1) / seg2)); }
      ctx.stroke();
    }
    ctx.restore();
  });
  return p;
}
// nerve fibres: from a receptor angle along the inner surface to the disc, then out along the nerve
const FIBRES = [-95, -60, -30, -8, 45, 80, 105];
function fibrePath(d0) {
  const pts = [];
  const r0 = E.R - 46;
  const n = 40;
  for (let i = 0; i <= n; i++) { const d = lerp(d0, DISC, i / n); pts.push([E.x + Math.cos(d * D2R) * r0, E.y + Math.sin(d * D2R) * r0]); }
  const [dx, dy] = retinaPt(DISC, 0);
  pts.push([dx, dy]);
  const ang = DISC * D2R * 0.6;
  pts.push([dx + Math.cos(ang) * 240, dy + Math.sin(ang) * 240]);
  return pts;
}
const FIBRE_PATHS = FIBRES.map(fibrePath);
function pathAt(pts, u) {
  const lens = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); tot += l; }
  let d = u * tot;
  for (let i = 1; i < pts.length; i++) { if (d <= lens[i - 1]) { const f = d / lens[i - 1]; return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; } d -= lens[i - 1]; }
  return pts.at(-1);
}
function fibres(t, a) {
  A(a, () => {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    FIBRE_PATHS.forEach((pts, i) => {
      const grow = eio(seg(t, 14.6 + i * 0.25, 16.6 + i * 0.25));
      ctx.strokeStyle = 'rgba(255,226,200,0.55)'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      const n = Math.max(2, Math.round(pts.length * grow));
      for (let j = 0; j < n; j++) j ? ctx.lineTo(...pts[j]) : ctx.moveTo(...pts[j]);
      if (grow > 0.02) ctx.stroke();
      // pulses
      if (t > 16.8) for (let q = 0; q < 2; q++) {
        const u = ((t - 16.8) * 0.32 + i * 0.13 + q * 0.5) % 1;
        const [px, py] = pathAt(pts, u);
        const g = ctx.createRadialGradient(px, py, 0, px, py, 12); g.addColorStop(0, 'rgba(255,214,150,0.95)'); g.addColorStop(1, 'rgba(255,214,150,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 12, 0, TAU); ctx.fill();
      }
    });
    ctx.restore();
  });
}

function sceneA(t) {
  eye(t, seg(t, 0.2, 3.4));
  eyeLabels(seg(t, 3.2, 4.0));
}
function sceneB(t) {
  eye(t, 1);
  eyeLabels(1 - seg(t, 9.6, 10.2));
  receptors(t, seg(t, 9.8, 10.8), -12, seg(t, 11.6, 12.2) * (1 - 0.6 * seg(t, 19.6, 20.4)));
  rays(t, 10.2, -12, 1 - seg(t, 19.4, 20.0));
  fibres(t, seg(t, 14.5, 14.8));
  A(seg(t, 10.6, 11.4) * (1 - seg(t, 14.2, 14.6)), () => label('rods and cones', 650, 168, { color: C.pink }));
  A(seg(t, 16.2, 16.8), () => label('optic nerve', 744, 600, { color: C.nerve }));
  // the disc
  const dA = seg(t, 19.8, 20.6);
  if (dA > 0) {
    const [dx, dy] = retinaPt(DISC, 24);
    A(dA, () => {
      ctx.save(); ctx.strokeStyle = C.glow; ctx.lineWidth = 3.5; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(dx, dy, 44 + 4 * Math.sin(t * 3), 0, TAU); ctx.stroke(); ctx.restore();
      label('optic disc', 712, 694, { color: C.glow, size: 28 });
      label('no rods or cones', 712, 728, { color: C.creamSoft, size: 24 });
      ctx.save(); ctx.strokeStyle = 'rgba(255,194,122,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx + 8, dy + 44); ctx.lineTo(700, 664); ctx.stroke(); ctx.restore();
    });
    // a ray that lands on the disc: nothing lights up
    rays(t, 21.6, DISC, span(t, 21.5, 25.6, 0.3, 0.3), 'rgba(255,240,220,0.75)');
    A(seg(t, 23.4, 24.0), () => label('unseen', 560, 534, { color: C.cream, size: 26 }));
  }
}

// ---------- C: the field of view, and filling in ----------
function sceneC(t) {
  const ex = 432, ey = 690, gy = 210;
  const a1 = 1 - seg(t, 30.6, 31.2);
  A(a1, () => {
    // field fan
    const R = ey - gy;
    ctx.save();
    const fg = ctx.createRadialGradient(ex, ey, 40, ex, ey, R);
    fg.addColorStop(0, 'rgba(255,214,190,0.20)'); fg.addColorStop(1, 'rgba(255,214,190,0.04)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.arc(ex, ey, R, (-90 - 55) * D2R, (-90 + 55) * D2R); ctx.closePath(); ctx.fill();
    // blind wedge: centred 13.5° to the ear side, 5.5° wide
    const w = eio(seg(t, 26.6, 27.8));
    const c0 = (-90 + 13.5 - 2.75) * D2R, c1 = (-90 + 13.5 + 2.75) * D2R;
    ctx.fillStyle = `rgba(20,2,5,${0.85 * w})`; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.arc(ex, ey, R, c0, c1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(255,138,112,${w})`; ctx.lineWidth = 2; ctx.stroke();
    // gaze line and cross
    ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(255,243,234,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ex, ey - 30); ctx.lineTo(ex, gy); ctx.stroke(); ctx.setLineDash([]);
    crossMark(ex, gy - 18, 20, C.cream);
    // angle arc
    ctx.strokeStyle = `rgba(255,138,112,${w})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(ex, ey, 200, -90 * D2R, (-90 + 13.5) * D2R); ctx.stroke();
    ctx.restore();
    // eye icon (right eye, seen from above)
    ctx.save(); ctx.fillStyle = C.sclera; ctx.beginPath(); ctx.arc(ex, ey, 30, 0, TAU); ctx.fill();
    ctx.fillStyle = C.iris; ctx.beginPath(); ctx.arc(ex, ey - 18, 12, 0, TAU); ctx.fill(); ctx.restore();
    label('your right eye, from above', ex, ey + 66, { size: 24 });
    label('where you look', ex - 20, gy + 50, { size: 22, align: 'right', color: C.creamSoft });
    A(w, () => {
      const [lx, ly] = [ex + Math.cos((-90 + 13.5) * D2R) * 520, ey + Math.sin((-90 + 13.5) * D2R) * 520];
      label('blind spot', lx + 18, ly + 40, { size: 26, color: C.coral, align: 'left' });
      label('12–15° out', ex + 66, ey - 214, { size: 22, color: C.coral, align: 'left' });
    });
    label('nose side', 150, 590, { size: 22, color: C.faint });
    label('ear side', 714, 590, { size: 22, color: C.faint });
  });
  // filling in: a striped patch with a hole that closes
  const a2 = seg(t, 31.0, 31.6);
  if (a2 > 0) A(a2, () => {
    const px = 172, py = 210, pw = 520, ph = 430;
    ctx.save(); k.rrect(px, py, pw, ph, 28); ctx.clip();
    ctx.fillStyle = '#F6D9C9'; ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#D9574A'; ctx.lineWidth = 16;
    for (let i = -20; i < 30; i++) { ctx.beginPath(); ctx.moveTo(px + i * 40, py); ctx.lineTo(px + i * 40 + ph, py + ph); ctx.stroke(); }
    const fill = eio(seg(t, 32.6, 34.6));
    ctx.fillStyle = `rgba(28,5,8,${1 - fill})`; ctx.beginPath(); ctx.ellipse(px + 360, py + 215, 62, 84, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.strokeStyle = 'rgba(255,243,234,0.5)'; ctx.lineWidth = 3; k.rrect(px, py, pw, ph, 28); ctx.stroke(); ctx.restore();
    label(fill < 0.5 ? 'what the eye reports' : 'what you see', W / 2, py + ph + 52, { size: 28, color: C.cream });
  });
}
function crossMark(x, y, s, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.32; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke(); ctx.restore();
}

// ---------- D: the test card, held perfectly still ----------
function eyeIcon(x, y, open) {
  ctx.save(); ctx.strokeStyle = C.cream; ctx.lineWidth = 4; ctx.lineCap = 'round';
  if (open) {
    ctx.beginPath(); ctx.moveTo(x - 34, y); ctx.quadraticCurveTo(x, y - 30, x + 34, y); ctx.quadraticCurveTo(x, y + 30, x - 34, y); ctx.stroke();
    ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(x - 34, y); ctx.quadraticCurveTo(x, y + 22, x + 34, y); ctx.stroke();
    for (const dx of [-18, 0, 18]) { ctx.beginPath(); ctx.moveTo(x + dx, y + 11); ctx.lineTo(x + dx * 1.2, y + 22); ctx.stroke(); }
  }
  ctx.restore();
}
function sceneD(t) {
  ctx.font = `italic 600 40px ${DISPLAY}`; text('The blind spot test', W / 2, 186, { align: 'center', color: C.cream });
  // card
  ctx.save(); k.rrect(40, 262, 784, 400, 30); ctx.fillStyle = C.card; ctx.fill(); ctx.restore();
  crossMark(150, 462, 30, C.cross);
  ctx.fillStyle = C.dot; ctx.beginPath(); ctx.arc(714, 462, 30, 0, TAU); ctx.fill();
  // which eye: shown below the card, away from the dot
  A(seg(t, 36.4, 37.0), () => {
    eyeIcon(352, 724, false); eyeIcon(512, 724, true);
    label('left', 352, 776, { size: 22, color: C.faint }); label('right', 512, 776, { size: 22, color: C.faint });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 500, maxW: 760 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (m) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > m && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    const y = t > 35.8 ? 866 : 836; // under the test card the captions sit a little lower
    k.captions(t, [cue], { x: W / 2, y, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.cream, marks: { '*': C.coral, '~': C.glow } });
  }
}

Kit.scene({
  width: W, height: H, duration: 61.5,
  fonts: [
    { family: DISPLAY, file: 'Lora.woff2', weight: '400 700' },
    { family: TEXT, file: 'Rubik.woff2' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    const scenes = [[sceneA, T.A, 0, 0], [sceneB, T.B, 0, 0.4], [sceneC, T.C], [sceneD, T.D, 0.4, 0]];
    // A hands over to B without a fade: B redraws the same eye
    for (const [fn, [a, b], fi = 0.4, fo = 0.4] of scenes) {
      if (t < a || t > b) continue;
      if (fn === sceneA && t >= T.B[0]) continue;
      A(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
