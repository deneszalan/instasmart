// Explainer for physics-chladni-figures-sand: a bowed brass plate vibrates in a mode, and sand gathers on
// the nodal lines that stay still.
// Look: a brass plate on a turned walnut post in warm lamplight, a dark wood-panelled room, a violin bow
// whose stroke drives the plate. Brushed-brass gradients, pale sand grains with soft shadows. Fraunces for
// display and numbers, Libre Franklin for captions and labels.
//
// Sources: Wikipedia, "Ernst Chladni" (the post's source): 1756–1827; a bow drawn over a metal plate lightly
// covered with sand; the sand moves to the nodal lines where the surface is still; "Entdeckungen über die
// Theorie des Klanges", 1787; Hooke, 8 July 1680, a violin bow along a glass plate covered with flour;
// Napoleon set a prize for the best mathematical explanation; the technique is still used to design
// violins, guitars and cellos. Wikipedia, "Sophie Germain": she won the prize on 8 January 1816.
// The mode shapes are computed below from a simple approximation for a square plate,
// f(x, y) = cos(nπx)·cos(mπy) − cos(mπx)·cos(nπy), and the scene labels them as an approximation.
// The sand is simulated: every grain is pushed towards the nearest place where f = 0, bouncing harder where
// the plate moves more.
//
// Scene plan (56.6 s; captions centred at y = 835, nothing important below y = 930):
//  A  0.0–9.5   Hook. Sand rains evenly onto the plate; the bow comes in.
//  B  9.5–24.3  The bow plays: patches light and dark (moving up and down in turn), nodal lines glow still,
//               and the sand drifts onto them.
//  C 24.3–37.7  Higher notes: three more modes, each with busier figures; the formula is shown as an
//               approximation.
//  D 37.6–51.9  History: 1680 Hooke's flour on glass, 1787 Chladni's book, 1816 Sophie Germain's prize.
//  E 51.6–56.6  Payoff: a violin outline with a figure of its own: instrument makers still use the trick.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#0D0806', bg1: '#24160D', wood: '#3A2414', woodDeep: '#1E1209', brass: '#A9772E', brassHi: '#D6AE5E', brassDeep: '#5E3C12',
  sand: '#FFF8E6', sandShadow: 'rgba(30,16,4,0.7)', gold: '#F2C766', ember: '#F08A55', cream: '#F6EAD3', creamSoft: 'rgba(246,234,211,0.74)',
  creamDim: 'rgba(246,234,211,0.5)', ink: '#2B1A0C', paper: '#F1E4C6',
};
const DISPLAY = 'Fraunces', TEXT = 'Libre Franklin';

let k, ctx;
const font = (w, s, f = TEXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.cream, ...o });
const rrect = (...a) => k.rrect(...a);
const A_ = (a, fn) => k.alpha(a, fn);
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the approximation for a square plate ----------
const PI = Math.PI;
const mode = (n, m) => ({
  n, m,
  f: (x, y) => Math.cos(n * PI * x) * Math.cos(m * PI * y) - Math.cos(m * PI * x) * Math.cos(n * PI * y),
  g: (x, y) => [
    -n * PI * Math.sin(n * PI * x) * Math.cos(m * PI * y) + m * PI * Math.sin(m * PI * x) * Math.cos(n * PI * y),
    -m * PI * Math.cos(n * PI * x) * Math.sin(m * PI * y) + n * PI * Math.cos(m * PI * x) * Math.sin(n * PI * y),
  ],
});
const MODES = [mode(1, 4), mode(2, 5), mode(3, 6), mode(4, 7)];
// When each mode starts, and how long its sand takes to settle.
const SEGS = [
  { t: 10.2, mi: 0, settle: [2.6, 6.2] },
  { t: 25.0, mi: 1, settle: [1.2, 2.6] },
  { t: 29.4, mi: 2, settle: [1.2, 2.6] },
  { t: 33.6, mi: 3, settle: [1.2, 2.6] },
];
const modeAt = (t) => { let s = null; for (const x of SEGS) if (t >= x.t) s = x; return s; };
// how hard the plate is ringing (0 silent .. 1 bowed)
// up and down in turn: held, then a quick swap (a slowed-down picture of the vibration)
const updown = (t) => clamp(Math.sin(t * 2 * PI * 0.45) * 3.5, -1, 1);
const ringing = (t) => Math.max(span(t, 9.6, 24.6, 0.5, 0.5), span(t, 24.8, 38.4, 0.3, 0.8));

/** Walk a point to the nearest place where f = 0. */
function project(M, x, y) {
  for (let i = 0; i < 40; i++) {
    const v = M.f(x, y), [gx, gy] = M.g(x, y), gg = gx * gx + gy * gy + 1e-6;
    let sx = (v * gx) / gg, sy = (v * gy) / gg;
    const l = Math.hypot(sx, sy); if (l > 0.03) { sx *= 0.03 / l; sy *= 0.03 / l; }
    x = clamp(x - sx, 0.012, 0.988); y = clamp(y - sy, 0.012, 0.988);
    if (Math.abs(v) < 1e-4) break;
  }
  return [x, y];
}

// ---------- sand: every grain's start, its targets for each mode, its timing ----------
const NG = 2300;
const GRAINS = [];
{
  const r = mulberry32(1787);
  for (let i = 0; i < NG; i++) {
    const x0 = 0.02 + r() * 0.96, y0 = 0.02 + r() * 0.96;
    const g = { x0, y0, drop: 0.8 + r() * 3.2, ph: r() * 6.28, sz: r() < 0.3 ? 2 : 3, legs: [] };
    let px = x0, py = y0;
    for (const s of SEGS) {
      const M = MODES[s.mi];
      const kx = px + (r() - 0.5) * 0.3, ky = py + (r() - 0.5) * 0.3; // a bounce away, then down onto the new lines
      const [qx, qy] = project(M, clamp(kx, 0.02, 0.98), clamp(ky, 0.02, 0.98));
      // grains far from a node (where the plate shakes most) are thrown along fastest
      const dur = lerp(s.settle[1], s.settle[0], clamp(Math.abs(M.f(px, py)) / 1.4)) * (0.8 + r() * 0.4);
      g.legs.push({ t0: s.t + r() * 0.4, dur, px, py, qx, qy, M });
      px = qx; py = qy;
    }
    GRAINS.push(g);
  }
}
function grainPos(g, t) {
  let x = g.x0, y = g.y0, M = null, moving = 0;
  for (const L of g.legs) {
    if (t < L.t0) break;
    const u = seg(t, L.t0, L.t0 + L.dur);
    x = lerp(L.px, L.qx, eio(u)); y = lerp(L.py, L.qy, eio(u)); M = L.M; moving = 1 - u;
  }
  void M; void moving;
  return [x, y];
}

// ---------- the plate, seen at an angle ----------
const P = { cx: W / 2, cy: 430, S: 600, squash: 0.6, edge: 16 };
const toScreen = (x, y) => {
  const yy = (y - 0.5) * P.S * P.squash;
  return [P.cx + (x - 0.5) * P.S, P.cy + yy];
};
function platePath() {
  const c = [toScreen(0, 0), toScreen(1, 0), toScreen(1, 1), toScreen(0, 1)];
  ctx.beginPath(); ctx.moveTo(...c[0]); for (const p of c.slice(1)) ctx.lineTo(...p); ctx.closePath();
  return c;
}

// ---------- timeline ----------
const T = { A: [0, 9.5], B: [9.5, 24.3], C: [24.3, 37.7], D: [37.6, 51.9], E: [51.6, 56.6] };
const CUES = [
  [0.5, 5.4, 'Sprinkle sand on a brass plate and bow its edge like a *violin*.'],
  [5.5, 9.4, 'The plate sings; the sand dances into a *pattern*.'],
  [9.6, 14.8, 'The plate vibrates in a *mode*: neighbouring patches move in opposite directions.'],
  [14.9, 19.0, 'Between them run lines that stay ~still~: nodal lines.'],
  [19.1, 24.3, 'Sand is flung off the shaking patches and settles on the ~still lines~.'],
  [24.4, 28.6, 'Bow a higher note, and a *new figure* appears.'],
  [28.7, 33.0, 'Each note has its own figure, busier as the pitch rises.'],
  [33.1, 37.6, 'These figures come from a *simple approximation* for a square plate.'],
  [37.8, 42.2, 'In 1680, Robert Hooke saw such patterns in *flour* on glass.'],
  [42.3, 47.0, 'Ernst Chladni published his sand figures in *1787*.'],
  [47.1, 51.8, 'Napoleon set a prize for explaining them. Sophie Germain won, in *1816*.'],
  [51.9, 56.4, 'Makers of violins, guitars and cellos still use the trick.'],
];

// ---------- background ----------
let bg = null, brass = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  // wood panelling
  g.fillStyle = C.woodDeep; g.fillRect(0, 0, W, H);
  const r = mulberry32(8);
  for (let i = 0; i < 6; i++) {
    const x = i * 144;
    const lg = g.createLinearGradient(x, 0, x + 144, 0);
    lg.addColorStop(0, 'rgba(0,0,0,0.25)'); lg.addColorStop(0.1, 'rgba(90,55,28,0.25)'); lg.addColorStop(0.9, 'rgba(70,42,20,0.2)'); lg.addColorStop(1, 'rgba(0,0,0,0.3)');
    g.fillStyle = lg; g.fillRect(x, 0, 144, H);
    g.strokeStyle = 'rgba(120,80,45,0.06)'; g.lineWidth = 1;
    for (let j = 0; j < 26; j++) { const xx = x + 8 + r() * 128; g.beginPath(); g.moveTo(xx, 0); g.bezierCurveTo(xx + r() * 10 - 5, 300, xx + r() * 10 - 5, 700, xx + r() * 8 - 4, H); g.stroke(); }
  }
  // warm lamp pool
  const lp = g.createRadialGradient(W / 2, 380, 40, W / 2, 440, 620);
  lp.addColorStop(0, 'rgba(255,190,110,0.30)'); lp.addColorStop(0.5, 'rgba(200,120,50,0.12)'); lp.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = lp; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // the post under the plate
  const px = W / 2;
  const pg = g.createLinearGradient(px - 40, 0, px + 40, 0);
  pg.addColorStop(0, '#2A170A'); pg.addColorStop(0.45, '#7A4A24'); pg.addColorStop(1, '#2A170A');
  g.fillStyle = pg;
  g.beginPath(); g.moveTo(px - 18, 620); g.lineTo(px + 18, 620); g.lineTo(px + 22, 700); g.quadraticCurveTo(px + 44, 712, px + 30, 730); g.lineTo(px + 70, 760); g.lineTo(px - 70, 760); g.lineTo(px - 30, 730); g.quadraticCurveTo(px - 44, 712, px - 22, 700); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(px, 764, 110, 12, 0, 0, 6.29); g.fill();
  // brushed brass for the plate top
  brass = document.createElement('canvas'); brass.width = W; brass.height = H;
  const b = brass.getContext('2d');
  const bgd = b.createLinearGradient(0, 220, W, 640);
  bgd.addColorStop(0, C.brassDeep); bgd.addColorStop(0.35, C.brass); bgd.addColorStop(0.55, C.brassHi); bgd.addColorStop(0.75, C.brass); bgd.addColorStop(1, C.brassDeep);
  b.fillStyle = bgd; b.fillRect(0, 0, W, H);
  for (let i = 0; i < 220; i++) {
    const y = 200 + r() * 480, x = r() * W, l = 60 + r() * 200;
    b.strokeStyle = r() < 0.5 ? `rgba(255,240,200,${r() * 0.06})` : `rgba(80,50,10,${r() * 0.07})`; b.lineWidth = 0.8;
    b.beginPath(); b.moveTo(x, y); b.lineTo(x + l, y + (r() - 0.5) * 2); b.stroke();
  }
}

function header() {
  font(700, 24, DISPLAY); text('RECKON', 64, 84, { color: C.gold, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 18;
  font(500, 22); text('Physics · Sound', 64 + w + 14, 84, { color: C.creamDim });
}

// ---------- drawing the plate ----------
let vibCv = null, vibImg = null;
const VG = 72;
function plate(t, { sandA = 1, dim = 0 } = {}) {
  const c = platePath();
  // front edge (thickness)
  ctx.save();
  ctx.beginPath(); ctx.moveTo(...c[3]); ctx.lineTo(...c[2]); ctx.lineTo(c[2][0], c[2][1] + P.edge); ctx.lineTo(c[3][0], c[3][1] + P.edge); ctx.closePath();
  const eg = ctx.createLinearGradient(0, c[3][1], 0, c[3][1] + P.edge); eg.addColorStop(0, '#8A5E22'); eg.addColorStop(1, '#4A2F0E');
  ctx.fillStyle = eg; ctx.fill();
  ctx.beginPath(); ctx.moveTo(...c[1]); ctx.lineTo(...c[2]); ctx.lineTo(c[2][0], c[2][1] + P.edge); ctx.lineTo(c[1][0], c[1][1] + P.edge * 0.4); ctx.closePath();
  ctx.fillStyle = '#5A3C12'; ctx.fill();
  // top
  platePath(); ctx.save(); ctx.clip(); ctx.drawImage(brass, 0, 0);
  // vibration shading: up and down patches, swapping
  const s = modeAt(t), ring = ringing(t);
  if (s && ring > 0.01 && t < 24.4) {
    const M = MODES[s.mi];
    if (!vibCv) { vibCv = document.createElement('canvas'); vibCv.width = VG; vibCv.height = VG; vibImg = vibCv.getContext('2d').createImageData(VG, VG); }
    const d = vibImg.data, ph = updown(t);
    const showA = ring * span(t, 9.6, 24.3, 0.8, 1.2); // only while the modes are explained (scene B)
    for (let j = 0; j < VG; j++) for (let i = 0; i < VG; i++) {
      const v = M.f((i + 0.5) / VG, (j + 0.5) / VG) * ph, o = (j * VG + i) * 4;
      if (v > 0) { d[o] = 255; d[o + 1] = 236; d[o + 2] = 180; } else { d[o] = 60; d[o + 1] = 30; d[o + 2] = 6; }
      d[o + 3] = Math.min(255, Math.abs(v) * 50 * showA);
    }
    vibCv.getContext('2d').putImageData(vibImg, 0, 0);
    const [x0, y0] = toScreen(0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(vibCv, x0, y0, P.S, P.S * P.squash);
  }
  // the nodal lines, glowing still (scene B)
  const nodalA = span(t, 15.0, 19.4, 0.5, 0.6);
  if (s && nodalA > 0) A_(nodalA, () => {
    const M = MODES[s.mi];
    ctx.fillStyle = 'rgba(255,248,220,0.9)';
    for (let j = 0; j < 160; j++) for (let i = 0; i < 160; i++) {
      const x = (i + 0.5) / 160, y = (j + 0.5) / 160;
      if (Math.abs(M.f(x, y)) < 0.05) { const [X, Y] = toScreen(x, y); ctx.fillRect(X - 1.2, Y - 1.2, 2.4, 2.4); }
    }
  });
  // sand
  A_(sandA, () => {
    for (const g of GRAINS) {
      const fall = seg(t, g.drop, g.drop + 0.5);
      if (fall <= 0) continue;
      const [x, y] = grainPos(g, t);
      const [X, Y] = toScreen(x, y);
      // whole pixels, so grains at rest stay crisp from frame to frame
      const px = Math.round(X - g.sz / 2), py = Math.round(Y - (1 - eout(fall)) * 60 - g.sz / 2);
      ctx.globalAlpha = sandA * Math.min(1, fall * 2);
      ctx.fillStyle = C.sandShadow; ctx.fillRect(px + 1, py + 1, g.sz, g.sz);
      ctx.fillStyle = C.sand; ctx.fillRect(px, py, g.sz, g.sz);
    }
  });
  ctx.restore();
  // rim highlight
  platePath(); ctx.strokeStyle = 'rgba(255,230,170,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
  if (dim > 0) { ctx.fillStyle = `rgba(12,7,4,${dim})`; ctx.fillRect(0, 140, W, 660); }
  ctx.restore();
}

/** The violin bow, against the plate's right front edge; it strokes up and down while the plate rings. */
function bow(t) {
  const inP = eio(seg(t, 4.6, 6.4)) * (1 - eio(seg(t, 37.4, 38.6)));
  if (inP <= 0) return;
  const [ex, ey] = toScreen(0.97, 1);
  const stroke = Math.sin((t - 6.4) * 2 * PI * 0.45) * 60 * ringing(t);
  const ang = -0.16;
  ctx.save();
  ctx.translate(ex + 10 + (1 - inP) * 220, ey + 8);
  ctx.rotate(ang);
  ctx.translate(0, stroke * 0.6);
  // hair
  ctx.strokeStyle = '#EFE6CC'; ctx.lineWidth = 6; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(-6, -320); ctx.lineTo(-6, 96); ctx.stroke();
  // stick, slightly cambered
  ctx.strokeStyle = '#6B3416'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(4, -346); ctx.quadraticCurveTo(14, -110, 4, 104); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,200,150,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(2, -336); ctx.quadraticCurveTo(12, -110, 2, 96); ctx.stroke();
  // tip and frog
  ctx.fillStyle = '#EFE6CC'; ctx.beginPath(); ctx.moveTo(-8, -326); ctx.lineTo(6, -352); ctx.lineTo(8, -320); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1A0E06'; rrect(-14, 80, 22, 44, 5); ctx.fill();
  ctx.fillStyle = '#D9B46A'; ctx.beginPath(); ctx.arc(-3, 102, 4, 0, 6.29); ctx.fill();
  ctx.restore();
  // rosin dust where hair meets brass
  A_(ringing(t) * 0.8, () => {
    const r = mulberry32(Math.floor(t * 4));
    ctx.fillStyle = 'rgba(255,240,210,0.6)';
    for (let i = 0; i < 6; i++) ctx.fillRect(ex + 6 + r() * 14, ey + 2 + r() * 14, 1.5, 1.5);
  });
}

function chip(label, cx, cy, { bg = C.gold, fg = C.ink, size = 24, padX = 16, h = 40, alpha = 1 } = {}) {
  A_(alpha, () => {
    font(600, size);
    const w = ctx.measureText(label).width + 2 * padX;
    rrect(cx - w / 2, cy - h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
    text(label, cx, cy + 1, { color: fg, align: 'center', base: 'middle' });
  });
}

// ---------- scenes ----------
function sceneMain(t) {
  const dim = 0.72 * seg(t, 37.6, 38.4) * (1 - seg(t, 51.6, 52.2));
  plate(t, { dim });
  bow(t);
  // up / down chips on two neighbouring patches (scene B)
  const ud = span(t, 10.4, 14.9, 0.5, 0.4);
  if (ud > 0) {
    const ph = updown(t) > 0;
    const [ax, ay] = toScreen(0.18, 0.5), [bx, by] = toScreen(0.5, 0.18);
    chip(ph ? 'UP' : 'DOWN', ax, ay, { bg: ph ? C.cream : '#3A220C', fg: ph ? C.ink : C.cream, alpha: ud });
    chip(ph ? 'DOWN' : 'UP', bx, by, { bg: ph ? '#3A220C' : C.cream, fg: ph ? C.cream : C.ink, alpha: ud });
  }
  // the mode label and formula (scene C)
  const s = modeAt(t);
  A_(span(t, 25.0, 37.7, 0.4, 0.4), () => {
    if (!s) return;
    const M = MODES[s.mi];
    font(500, 22); text('MODE', 64, 176, { color: C.creamDim, base: 'middle', spacing: '2px' });
    font(600, 34, DISPLAY); text(`n = ${M.n}, m = ${M.m}`, 156, 176, { color: C.gold, base: 'middle' });
  });
  A_(span(t, 33.3, 37.7, 0.4, 0.4), () => {
    rrect(84, 682, W - 168, 96, 14); ctx.fillStyle = 'rgba(20,12,6,0.86)'; ctx.fill(); ctx.strokeStyle = 'rgba(242,199,102,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
    font(500, 30, DISPLAY); text('cos(nπx)·cos(mπy) − cos(mπx)·cos(nπy) = 0', W / 2, 716, { color: C.cream, align: 'center', base: 'middle' });
    font(500, 22); text('approximate nodal lines of a square plate · sand simulated', W / 2, 754, { color: C.creamDim, align: 'center', base: 'middle' });
  });
}

function historyCard(t) {
  const p = eout(seg(t, 37.8, 38.6)) * (1 - seg(t, 51.4, 51.9));
  if (p <= 0) return;
  A_(p, () => {
    const ev = [
      { when: '1680', who: 'Robert Hooke', what: 'flour on a glass plate', t: 37.8, draw: (x, y) => miniPlate(x, y, 'glass') },
      { when: '1787', who: 'Ernst Chladni', what: 'Entdeckungen über die Theorie des Klanges', t: 42.3, draw: (x, y) => book(x, y) },
      { when: '1816', who: 'Sophie Germain', what: 'wins the prize Napoleon set', t: 47.1, draw: (x, y) => medal(x, y) },
    ];
    ev.forEach((e, i) => {
      const y = 236 + i * 168;
      const on = eout(seg(t, e.t, e.t + 0.6)), hi = span(t, e.t, i < 2 ? ev[i + 1].t : 52, 0.4, 0.3);
      A_(on, () => {
        ctx.save(); ctx.translate((1 - on) * -20, 0);
        rrect(84, y - 66, W - 168, 140, 16); ctx.fillStyle = `rgba(241,228,198,${0.9})`; ctx.fill();
        ctx.strokeStyle = hi > 0.5 ? C.gold : 'rgba(120,80,30,0.4)'; ctx.lineWidth = hi > 0.5 ? 3 : 1.5; ctx.stroke();
        e.draw(178, y + 4);
        font(700, 44, DISPLAY); text(e.when, 280, y - 14, { color: C.ink, base: 'middle' });
        font(600, 28); text(e.who, 420, y - 16, { color: C.ink, base: 'middle' });
        font(400, 24); wrap(e.what, 280, y + 30, 480, 28, '#5A3A1A');
        ctx.restore();
      });
    });
  });
}
function wrap(s, x, y, maxW, lh, color) {
  const words = s.split(' '); let line = '', yy = y;
  for (const w of words) { const test = line ? `${line} ${w}` : w; if (ctx.measureText(test).width > maxW && line) { text(line, x, yy, { color, base: 'middle' }); line = w; yy += lh; } else line = test; }
  if (line) text(line, x, yy, { color, base: 'middle' });
}
function miniPlate(x, y, kind) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = kind === 'glass' ? 'rgba(170,205,215,0.55)' : C.brass; rrect(-50, -50, 100, 100, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(60,80,90,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
  const M = MODES[1]; ctx.fillStyle = 'rgba(255,255,255,0.95)';
  for (let j = 0; j < 60; j++) for (let i = 0; i < 60; i++) { const u = (i + 0.5) / 60, v = (j + 0.5) / 60; if (Math.abs(M.f(u, v)) < 0.08) ctx.fillRect(-50 + u * 100 - 0.8, -50 + v * 100 - 0.8, 1.6, 1.6); }
  ctx.restore();
}
function book(x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#5A2E14'; rrect(-40, -54, 80, 108, 4); ctx.fill();
  ctx.fillStyle = '#7A4220'; ctx.fillRect(-34, -54, 4, 108);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.strokeRect(-24, -40, 56, 80);
  const M = MODES[0]; ctx.fillStyle = C.gold;
  for (let j = 0; j < 40; j++) for (let i = 0; i < 40; i++) { const u = (i + 0.5) / 40, v = (j + 0.5) / 40; if (Math.abs(M.f(u, v)) < 0.1) ctx.fillRect(-18 + u * 44, -20 + v * 44, 1.4, 1.4); }
  ctx.restore();
}
function medal(x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#7A2A1A'; ctx.beginPath(); ctx.moveTo(-22, -56); ctx.lineTo(-6, -14); ctx.lineTo(-30, -14); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(22, -56); ctx.lineTo(30, -14); ctx.lineTo(6, -14); ctx.closePath(); ctx.fill();
  const mg = ctx.createRadialGradient(-10, -4, 4, 0, 10, 44);
  mg.addColorStop(0, '#FBE7A6'); mg.addColorStop(0.6, '#D8A845'); mg.addColorStop(1, '#8E6219');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(0, 12, 40, 0, 6.29); ctx.fill();
  ctx.strokeStyle = 'rgba(90,60,15,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 12, 31, 0, 6.29); ctx.stroke();
  ctx.restore();
}

/** A violin body outline with a figure of its own: the payoff. */
function violin(t) {
  const p = eout(seg(t, 51.9, 52.8));
  if (p <= 0) return;
  A_(p, () => {
    ctx.save(); ctx.translate(W / 2, 430 + (1 - p) * 20);
    // neck and scroll
    ctx.fillStyle = '#1C0F06'; rrect(-18, -340, 36, 110, 6); ctx.fill();
    ctx.fillStyle = '#6B3416'; ctx.beginPath(); ctx.arc(0, -352, 20, 0, 6.29); ctx.fill();
    ctx.strokeStyle = '#2A1408'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -352, 10, 0, 5.2); ctx.stroke();
    const body = new Path2D();
    body.moveTo(0, -240);
    body.bezierCurveTo(70, -244, 128, -214, 128, -150);
    body.bezierCurveTo(128, -112, 112, -96, 96, -86);
    body.bezierCurveTo(76, -60, 74, -10, 92, 18);
    body.bezierCurveTo(108, 30, 158, 52, 160, 140);
    body.bezierCurveTo(162, 228, 92, 270, 0, 270);
    body.bezierCurveTo(-92, 270, -162, 228, -160, 140);
    body.bezierCurveTo(-158, 52, -108, 30, -92, 18);
    body.bezierCurveTo(-74, -10, -76, -60, -96, -86);
    body.bezierCurveTo(-112, -96, -128, -112, -128, -150);
    body.bezierCurveTo(-128, -214, -70, -244, 0, -240); body.closePath();
    const vg = ctx.createLinearGradient(-180, -250, 180, 260);
    vg.addColorStop(0, '#E8C27A'); vg.addColorStop(0.5, '#C98E3E'); vg.addColorStop(1, '#8A5420');
    ctx.fillStyle = vg; ctx.fill(body);
    ctx.strokeStyle = '#3A1C08'; ctx.lineWidth = 5; ctx.stroke(body);
    ctx.save(); ctx.clip(body);
    const M = MODES[2];
    ctx.fillStyle = C.sand;
    const reveal = seg(t, 52.6, 54.2);
    for (let j = 0; j < 150; j++) for (let i = 0; i < 110; i++) {
      const u = (i + 0.5) / 110, v = (j + 0.5) / 150;
      if (v > reveal * 1.05) continue;
      if (Math.abs(M.f(u, v)) < 0.06) ctx.fillRect(-190 + u * 380 - 1, -260 + v * 530 - 1, 2, 2);
    }
    ctx.restore();
    ctx.restore();
    font(500, 22); text('Source: Wikipedia, “Ernst Chladni” · figures: simple square-plate approximation', W / 2, 752, { color: C.creamDim, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 600, maxW: 760 };
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
    k.captions(t, [cue], { x: W / 2, y: 840, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.cream, marks: { '*': C.gold, '~': C.ember } });
  }
}

// a debug sheet of candidate modes (only at t >= 999, never in the clip)
function debugSheet() {
  const cands = [[1, 2], [1, 3], [1, 4], [2, 3], [2, 5], [3, 4], [3, 5], [3, 6], [1, 6], [2, 7], [3, 8], [4, 7]];
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  cands.forEach(([n, m], idx) => {
    const M = mode(n, m), ox = 20 + (idx % 4) * 210, oy = 40 + Math.floor(idx / 4) * 250;
    ctx.fillStyle = C.brass; ctx.fillRect(ox, oy, 200, 200);
    ctx.fillStyle = '#fff';
    for (let j = 0; j < 100; j++) for (let i = 0; i < 100; i++) if (Math.abs(M.f((i + .5) / 100, (j + .5) / 100)) < 0.06) ctx.fillRect(ox + i * 2, oy + j * 2, 2, 2);
    font(600, 22); text(`${n},${m}`, ox + 100, oy + 222, { color: '#fff', align: 'center', base: 'middle' });
  });
}

Kit.scene({
  width: W, height: H, duration: 56.6,
  fonts: [
    { family: DISPLAY, file: 'Fraunces.woff2', weight: '100 900' },
    { family: TEXT, file: 'LibreFranklin.woff2', weight: '400 800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintBackground();
    if (t >= 999) { debugSheet(); return; }
    ctx.drawImage(bg, 0, 0);
    header();
    A_(eout(seg(t, 0, 0.8)) * (1 - eio(seg(t, 51.6, 52.2))), () => sceneMain(t));
    historyCard(t);
    violin(t);
    captions(t);
  },
});
