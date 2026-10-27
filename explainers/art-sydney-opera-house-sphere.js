// Explainer for art-sydney-opera-house-sphere: every shell is cut from the surface of one sphere,
// so the ribs could be precast from common moulds.
// Look: dusk over the harbour. Deep harbour blue water with soft ripples and reflections, a warm
// glow on the horizon, white shells that light up like sails, tiles in a chevron of glossy white
// and matte cream. One family: Outfit, light for big numbers, semibold for captions.
//
// Scene plan (58.4 s). Captions centred at y = 836 over the water; key elements above y = 770.
//  A  0.0– 9.4  Hook. The shells rise over the harbour: Utzon's 1957 design, no defined geometry.
//  B  9.1–18.2  The problem. Ridge curves morph between tried forms (parabola, ellipse, free
//               curve; "12+ versions"); then a row of ribs, each a different curve, each with
//               its own mould.
//  C 17.9–44.9  The answer. A slowly turning wireframe sphere; a glowing knife cuts three
//               spherical triangles from it, which lift off its surface. The radius, 75.2 m, is
//               drawn. Then the shells in side view, and one circle of a fixed radius slides
//               from shell to shell, fitting each ridge. Then one shell close up: ribs fan out
//               from its base, each a row of identical segments; longer ribs use more of them
//               (segment counts computed from the arc lengths).
//  D 44.6–58.4  Building it: the 2,194 precast sections; the tiles in a chevron of two finishes,
//               counted up to 1,056,006; then the hedge on who had the idea, over the building.
//
// Facts (Wikipedia, "Sydney Opera House"): Utzon's design won the competition in 1957; the
// shells "were originally of undefined geometry"; 1957–1963, "at least 12 iterations ...
// (including schemes with parabolas, circular ribs and ellipsoids)"; with "no repetition in any
// of the roof forms", precasting each section would have been very expensive; "In mid-1961 ...
// the shells all being created as sections from a sphere", which "allows arches of varying length
// to be cast in a common mould, and a number of arch segments of common length to be placed
// adjacent to one another"; the shells are sections of a sphere of 75.2 m radius; the roof is
// "2,194 pre-cast concrete sections"; "1,056,006 tiles in two colours: glossy white and matte
// cream" in "a subtle chevron pattern"; the solution "was originally credited to Utzon", but
// "with whom exactly this solution originated has been the subject of some controversy".
// The side-view shells are a diagram: each ridge is an arc of one fixed radius.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  skyTop: '#081B33', skyMid: '#143C66', glow: '#E7A97C', glowSoft: '#F3C9A2',
  water: '#0B2A4A', waterDeep: '#05162B', ink: '#F4F7FA', soft: 'rgba(244,247,250,0.74)', faint: 'rgba(244,247,250,0.32)',
  shell: '#F8F6F0', cream: '#E8DFCB', shade: '#C9C3B4', podium: '#B98E78', podiumDark: '#8C6655',
  gold: '#F6C177', cyan: '#8FD3FF', cyanDeep: '#3E8FC7', rib: '#D8D2C2',
};
const F = 'Outfit';

let k, ctx;
const font = (weight, size) => k.font(weight, size, F);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- timeline ----------
const T = { A: [0, 9.4], B: [9.1, 18.2], C1: [17.9, 30.9], C2: [30.6, 39.9], C3: [39.6, 49.0], D1: [48.7, 53.0], D2: [52.7, 58.4] };
const SECTIONS = 2194, TILES = 1056006, RADIUS_M = 75.2;
const CUES = [
  [0.4, 4.6, 'Jørn Utzon’s 1957 design for the Sydney Opera House: soaring shells with no set geometry.'],
  [4.7, 8.9, 'For years, nobody could work out how to build them.'],
  [9.0, 13.0, 'The team tried at least 12 forms: parabolas, ellipsoids…'],
  [13.1, 17.9, 'With no repeating curves, each precast piece would need its own mould.'],
  [18.0, 22.6, 'In mid-1961 came the answer: cut every shell from *one sphere*.'],
  [22.7, 27.0, 'Each shell is a triangle cut from the same curved surface.'],
  [27.1, 30.6, `The sphere’s radius: ~${RADIUS_M} metres~.`],
  [30.7, 35.0, 'So every shell has the *same curvature*, wherever you look.'],
  [35.1, 39.6, 'Ribs of different lengths could share a *common mould*.'],
  [39.7, 44.6, 'Each rib is a row of identical segments: longer ribs just use more.'],
  [44.7, 48.6, `The roof went up as *${Kit.fmt(SECTIONS)}* precast concrete sections.`],
  [48.7, 52.6, `Then the skin: ~${Kit.fmt(TILES)}~ tiles in a chevron pattern.`],
  [52.7, 57.6, 'The idea is credited to Utzon, though who had it first is disputed.'],
];

// ---------- geometry helpers ----------
/** Points along the arc of radius r from P to Q; side = +1 or −1 picks which way it bulges. */
function arcPts(P, Q, r, side, n = 40) {
  const mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2, dx = Q[0] - P[0], dy = Q[1] - P[1], d = Math.hypot(dx, dy);
  const h = Math.sqrt(Math.max(0, r * r - (d / 2) * (d / 2)));
  const nx = -dy / d, ny = dx / d; // left normal
  const cx = mx - side * nx * h, cy = my - side * ny * h; // centre on the far side of the bulge
  let a0 = Math.atan2(P[1] - cy, P[0] - cx), a1 = Math.atan2(Q[1] - cy, Q[0] - cx);
  let da = a1 - a0; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(a0 + (da * i) / n), cy + r * Math.sin(a0 + (da * i) / n)]);
  pts.center = [cx, cy];
  return pts;
}
const arcLength = (P, Q, r) => 2 * r * Math.asin(Math.min(1, Math.hypot(Q[0] - P[0], Q[1] - P[1]) / (2 * r)));

// ---------- the shells in side view: every ridge and front edge is an arc of one radius ----------
const PODIUM = 640, RPX = 330;
const SHELLS = [ // rear base, apex, front base; drawn back to front
  { B: [560, PODIUM], A: [744, 372], C: [722, PODIUM] },
  { B: [420, PODIUM], A: [640, 300], C: [610, PODIUM] },
  { B: [318, PODIUM], A: [492, 380], C: [470, PODIUM] },
  { B: [196, PODIUM], A: [336, 452], C: [326, PODIUM] },
  { B: [104, PODIUM], A: [232, 470], C: [226, PODIUM] },
];
for (const s of SHELLS) {
  s.ridge = arcPts(s.B, s.A, RPX, -1);
  s.front = arcPts(s.A, s.C, RPX, -1);
  s.poly = [...s.ridge, ...s.front.slice(1)];
}

function shellPath(s, dx = 0, dy = 0, sc = 1, ox = 0, oy = 0) {
  ctx.beginPath();
  s.poly.forEach(([x, y], i) => { const X = ox + (x - ox) * sc + dx, Y = oy + (y - oy) * sc + dy; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
  ctx.closePath();
}

/** The building: podium and shells, lit; optional reflection in the water. */
function building(t, alpha, { rise = 1, reflect = true, lit = 1 } = {}) {
  withAlpha(alpha, () => {
    // podium
    ctx.fillStyle = C.podium; ctx.fillRect(70, PODIUM, 724, 52);
    ctx.fillStyle = C.podiumDark; ctx.fillRect(70, PODIUM + 40, 724, 12);
    for (let x = 90; x < 790; x += 46) { ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(x, PODIUM + 6, 3, 34); }
    SHELLS.forEach((s, i) => {
      const r = eout(clamp(rise * 1.6 - i * 0.15));
      if (r <= 0) return;
      ctx.save();
      ctx.translate(0, (1 - r) * 90); ctx.globalAlpha *= r;
      ctx.beginPath(); ctx.rect(0, 0, W, PODIUM); ctx.clip();
      shellFill(s, t, lit);
      ctx.restore();
    });
    if (reflect) {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, PODIUM + 52, W, 400); ctx.clip();
      ctx.translate(0, 2 * (PODIUM + 52)); ctx.scale(1, -1);
      ctx.globalAlpha *= 0.16;
      SHELLS.forEach((s, i) => { const r = eout(clamp(rise * 1.6 - i * 0.15)); if (r > 0) { ctx.save(); ctx.translate(0, (1 - r) * 90); shellFill(s, t, lit, true); ctx.restore(); } });
      ctx.restore();
    }
  });
}

function shellFill(s, t, lit, flat = false) {
  shellPath(s);
  const g = ctx.createLinearGradient(s.B[0], s.A[1], s.C[0], PODIUM);
  g.addColorStop(0, C.shell); g.addColorStop(0.6, C.cream); g.addColorStop(1, C.shade);
  ctx.fillStyle = g; ctx.fill();
  if (flat) return;
  // chevron tile courses, faint
  ctx.save(); shellPath(s); ctx.clip();
  ctx.strokeStyle = 'rgba(160,150,130,0.35)'; ctx.lineWidth = 1.2;
  for (let y = 250; y < PODIUM; y += 14) {
    ctx.beginPath();
    for (let x = 80; x < 800; x += 28) { ctx.lineTo(x, y); ctx.lineTo(x + 14, y - 8); }
    ctx.stroke();
  }
  // glow on the ridge
  const gl = ctx.createRadialGradient(s.A[0], s.A[1], 10, s.A[0], s.A[1], 260);
  gl.addColorStop(0, `rgba(255,236,205,${0.45 * lit})`); gl.addColorStop(1, 'rgba(255,236,205,0)');
  ctx.fillStyle = gl; ctx.fillRect(0, 0, W, PODIUM);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2;
  ctx.beginPath(); s.ridge.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
}

// ---------- background: dusk sky and the harbour ----------
let bg = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, PODIUM + 52);
  sky.addColorStop(0, C.skyTop); sky.addColorStop(0.55, C.skyMid); sky.addColorStop(0.92, '#6E6A86'); sky.addColorStop(1, C.glow);
  g.fillStyle = sky; g.fillRect(0, 0, W, PODIUM + 52);
  const wat = g.createLinearGradient(0, PODIUM + 52, 0, H);
  wat.addColorStop(0, '#24496E'); wat.addColorStop(0.25, C.water); wat.addColorStop(1, C.waterDeep);
  g.fillStyle = wat; g.fillRect(0, PODIUM + 52, W, H - PODIUM - 52);
  // a few stars
  let a = 5;
  const r = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.4})`; g.beginPath(); g.arc(r() * W, r() * 330, 0.6 + r() * 1.2, 0, TAU); g.fill(); }
  g.font = `600 22px ${F}`; g.fillStyle = C.gold; g.letterSpacing = '3px'; g.textBaseline = 'alphabetic';
  g.fillText('RECKON', 64, 84);
  const w = g.measureText('RECKON').width;
  g.font = `400 22px ${F}`; g.fillStyle = C.soft; g.letterSpacing = '2px';
  g.fillText('ART · ARCHITECTURE', 64 + w + 22, 84);
  g.letterSpacing = '0px';
}
function background(t) {
  if (!bg) paintBackground();
  ctx.drawImage(bg, 0, 0);
  // ripples drifting on the water
  ctx.strokeStyle = 'rgba(160,205,240,0.10)'; ctx.lineWidth = 2;
  for (let i = 0; i < 16; i++) {
    const y = PODIUM + 70 + i * 22 + (i % 3) * 4;
    const off = ((t * (10 + (i % 4) * 4)) % 140);
    ctx.beginPath();
    for (let x = -140 + off; x < W; x += 140) { ctx.moveTo(x, y); ctx.lineTo(x + 60 - (i % 3) * 10, y); }
    ctx.stroke();
  }
}

// ---------- scene A ----------
function sceneA(t) {
  building(t, 1, { rise: seg(t, 0.3, 3.2), lit: seg(t, 1.8, 3.8) });
  withAlpha(eout(seg(t, 1.2, 2.0)), () => {
    font(300, 56); text('Sydney Opera House', W / 2, 200, { align: 'center' });
    font(400, 26); text('Jørn Utzon’s winning design, 1957', W / 2, 246, { align: 'center', color: C.soft });
  });
}

// ---------- scene B: the shapes that failed ----------
function sceneB(t) {
  // a single big shell outline whose ridge morphs between tried forms
  const forms = [
    ['parabola', (u) => [lerp(160, 700, u), 640 - 380 * (1 - Math.pow(2 * u - 1, 2))]],
    ['ellipse', (u) => [432 + 270 * Math.cos(Math.PI * (1 - u)), 640 - 330 * Math.sin(Math.PI * u)]],
    ['free curve', (u) => [lerp(160, 700, u), 640 - 360 * Math.sin(Math.PI * u) * (0.8 + 0.25 * Math.sin(u * 7))]],
  ];
  const stage = (t - 9.3) / 1.25; // morph every 1.25 s
  const i0 = clamp(Math.floor(stage), 0, 2), i1 = clamp(i0 + 1, 0, 2), f = eio(clamp(stage - Math.floor(stage)));
  const curve = (u) => { const a = forms[i0][1](u), b = forms[i1][1](u); return i0 === i1 ? a : [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; };
  const shapeA = 1 - seg(t, 13.0, 13.6);
  withAlpha(shapeA, () => {
    ctx.strokeStyle = C.shell; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); for (let i = 0; i <= 60; i++) { const [x, y] = curve(i / 60); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(120, 640); ctx.lineTo(744, 640); ctx.stroke();
    font(500, 34);
    const name = forms[f > 0.5 && i0 !== i1 ? i1 : i0][0];
    text(name, W / 2, 560, { align: 'center', color: C.cyan });
    font(300, 64); text(`${Math.min(12, 1 + Math.floor(Math.max(0, t - 9.3) * 3.2))}${t > 12.6 ? '+' : ''}`, W / 2, 210, { align: 'center', color: C.gold });
    font(400, 26); text('versions tried, 1957–1963', W / 2, 250, { align: 'center', color: C.soft });
  });
  // every rib a different curve, so every piece its own mould
  withAlpha(eout(seg(t, 13.3, 14.0)), () => {
    font(400, 26); text('different curves → different moulds', W / 2, 250, { align: 'center', color: C.soft });
    for (let i = 0; i < 6; i++) {
      const x = 130 + i * 120, a = eout(seg(t, 13.6 + i * 0.25, 14.2 + i * 0.25));
      withAlpha(a, () => {
        const bend = 30 + i * 22 + (i % 2) * 14; // a different curvature for each rib
        ctx.strokeStyle = C.shell; ctx.lineWidth = 10; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - 40, 540); ctx.quadraticCurveTo(x - 10, 540 - bend * 2.2, x + 40, 360 - i * 8); ctx.stroke();
        // its own mould
        ctx.fillStyle = 'rgba(143,211,255,0.16)'; ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.5;
        k.rrect(x - 46, 584, 92, 56, 8); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x - 34, 628); ctx.quadraticCurveTo(x - 6, 628 - bend * 0.55, x + 34, 596); ctx.stroke();
        font(500, 22); text(`mould ${i + 1}`, x, 672, { align: 'center', color: C.soft });
      });
    }
  });
}

// ---------- scene C1: the sphere ----------
const SC = [432, 440], SR = 226;
function rot(v, th, ph) {
  const [x, y, z] = v;
  const x1 = x * Math.cos(th) + z * Math.sin(th), z1 = -x * Math.sin(th) + z * Math.cos(th);
  const y2 = y * Math.cos(ph) - z1 * Math.sin(ph), z2 = y * Math.sin(ph) + z1 * Math.cos(ph);
  return [x1, y2, z2];
}
const sph = (lat, lon) => { const a = (lat * Math.PI) / 180, b = (lon * Math.PI) / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
const norm = (v) => { const l = Math.hypot(...v); return v.map((c) => c / l); };
function slerp(a, b, u) {
  const d = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1), om = Math.acos(d);
  if (om < 1e-6) return a;
  const s = Math.sin(om);
  return [0, 1, 2].map((i) => (Math.sin((1 - u) * om) * a[i] + Math.sin(u * om) * b[i]) / s);
}
const TRIS = [
  [sph(-8, -46), sph(-8, -8), sph(42, -30)],
  [sph(-8, 2), sph(-8, 34), sph(30, 14)],
  [sph(-44, -24), sph(-44, 6), sph(-16, -12)],
].map((tri) => {
  const pts = [];
  for (let e = 0; e < 3; e++) for (let i = 0; i < 30; i++) pts.push(slerp(tri[e], tri[(e + 1) % 3], i / 30));
  const c = norm([0, 1, 2].map((i) => tri[0][i] + tri[1][i] + tri[2][i]));
  return { pts, c };
});
const CUT = [[22.9, 24.6], [24.8, 26.3], [26.4, 27.6]];

function sceneC1(t) {
  const th = -0.25 + (t - 18) * 0.035, ph = -0.32;
  const P = (v, lift = 0) => { const r = rot(v, th, ph); const s = SR * (1 + lift); return [SC[0] + r[0] * s, SC[1] - r[1] * s, r[2]]; };
  // the glowing sphere body
  const body = ctx.createRadialGradient(SC[0] - 70, SC[1] - 80, 20, SC[0], SC[1], SR);
  body.addColorStop(0, 'rgba(143,211,255,0.20)'); body.addColorStop(1, 'rgba(143,211,255,0.05)');
  ctx.fillStyle = body; ctx.beginPath(); ctx.arc(SC[0], SC[1], SR, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(143,211,255,0.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(SC[0], SC[1], SR, 0, TAU); ctx.stroke();
  // wireframe: parallels and meridians, back half faint
  const line = (pts) => {
    for (let i = 1; i < pts.length; i++) {
      const a = P(pts[i - 1]), b = P(pts[i]);
      ctx.strokeStyle = a[2] + b[2] > 0 ? 'rgba(143,211,255,0.42)' : 'rgba(143,211,255,0.10)';
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
  };
  ctx.lineWidth = 1.5;
  for (let lat = -60; lat <= 60; lat += 20) { const pts = []; for (let lon = 0; lon <= 360; lon += 8) pts.push(sph(lat, lon)); line(pts); }
  for (let lon = 0; lon < 360; lon += 20) { const pts = []; for (let lat = -90; lat <= 90; lat += 6) pts.push(sph(lat, lon)); line(pts); }
  // cuts
  TRIS.forEach((tri, i) => {
    const [c0, c1] = CUT[i];
    const cut = seg(t, c0, c1);
    if (cut <= 0) return;
    const lift = 0.10 * eout(seg(t, c1 + 0.1, c1 + 1.2));
    const fill = eout(seg(t, c1 - 0.2, c1 + 0.5));
    const pts = tri.pts.map((v) => P(v, lift));
    withAlpha(fill, () => {
      ctx.beginPath(); pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
      const cp = P(tri.c, lift);
      const g = ctx.createRadialGradient(cp[0] - 30, cp[1] - 30, 10, cp[0], cp[1], 200);
      g.addColorStop(0, C.shell); g.addColorStop(1, C.cream);
      ctx.fillStyle = g; ctx.fill();
      ctx.shadowColor = 'rgba(255,236,205,0.8)'; ctx.shadowBlur = 18 * fill; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.stroke(); ctx.shadowBlur = 0;
    });
    // the knife's path along the edges, with a glowing tip
    const n = Math.floor(cut * pts.length);
    if (cut < 1) {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3.5;
      ctx.beginPath(); for (let j = 0; j <= n && j < pts.length; j++) (j ? ctx.lineTo(pts[j][0], pts[j][1]) : ctx.moveTo(pts[j][0], pts[j][1])); ctx.stroke();
      const tip = pts[Math.min(n, pts.length - 1)];
      const gl = ctx.createRadialGradient(tip[0], tip[1], 0, tip[0], tip[1], 22);
      gl.addColorStop(0, 'rgba(255,230,170,0.95)'); gl.addColorStop(1, 'rgba(255,230,170,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(tip[0], tip[1], 22, 0, TAU); ctx.fill();
    }
  });
  // the radius
  const rad = eout(seg(t, 27.3, 28.2));
  withAlpha(rad, () => {
    const end = [SC[0] + SR * Math.cos(2.45) * rad, SC[1] + SR * Math.sin(2.45) * rad];
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(SC[0], SC[1]); ctx.lineTo(end[0], end[1]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(SC[0], SC[1], 5, 0, TAU); ctx.fill();
    font(600, 40); text(`r = ${RADIUS_M} m`, SC[0] - 72, SC[1] + 36, { align: 'right', color: C.gold });
  });
  withAlpha(eout(seg(t, 18.3, 19.0)), () => { font(300, 48); text('one sphere', W / 2, 176, { align: 'center', color: C.ink }); });
}

// ---------- scene C2: one circle fits every shell ----------
function sceneC2(t) {
  building(t, 1, { reflect: true });
  const seq = [1, 0, 2, 3, 4];
  const step = clamp((t - 31.2) / 1.5, 0, seq.length - 1);
  const i0 = Math.floor(step), i1 = Math.min(seq.length - 1, i0 + 1), f = eio(step - i0);
  const c0 = SHELLS[seq[i0]].ridge.center, c1 = SHELLS[seq[i1]].ridge.center;
  const cx = lerp(c0[0], c1[0], f), cy = lerp(c0[1], c1[1], f);
  withAlpha(eout(seg(t, 31.0, 31.6)), () => {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 130, W, PODIUM + 52 - 130); ctx.clip();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([12, 9]);
    ctx.beginPath(); ctx.arc(cx, cy, RPX, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    // the ridge it is sitting on, highlighted
    const s = SHELLS[seq[f < 0.5 ? i0 : i1]];
    ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); s.ridge.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    font(500, 30); text('the same circle fits every ridge', W / 2, 200, { align: 'center', color: C.gold });
  });
}

// ---------- scene C3: ribs of identical segments ----------
const BIG = { sc: 1.3, ox: 432, oy: PODIUM, dx: -40, dy: 40 };
const SEG_LEN = 44; // one precast rib segment, in screen px at this zoom
const big = ([x, y]) => [BIG.ox + (x - BIG.ox) * BIG.sc + BIG.dx, BIG.oy + (y - BIG.oy) * BIG.sc + BIG.dy];
const S1 = SHELLS[1];
const RIBS = (() => {
  // ribs fan out from the rear base to points along the front edge; each is an arc of the same
  // radius, cut to a whole number of identical segments (found by bisection along the edge)
  const B = big(S1.B), front = S1.front.map(big), r = RPX * BIG.sc;
  const at = (u) => { const f = u * (front.length - 1), i = Math.min(front.length - 2, Math.floor(f)), w = f - i; return [lerp(front[i][0], front[i + 1][0], w), lerp(front[i][1], front[i + 1][1], w)]; };
  const out = [];
  const nMin = Math.ceil(arcLength(B, at(1), r) / SEG_LEN), nMax = Math.floor(arcLength(B, at(0), r) / SEG_LEN);
  const counts = [0, 1, 2, 3, 4].map((i) => Math.round(lerp(nMin, nMax, i / 4)));
  for (const nSeg of [...new Set(counts)]) {
    let lo = 0, hi = 1; // u = 0 at the apex, 1 at the front base
    const target = nSeg * SEG_LEN;
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (arcLength(B, at(mid), r) > target) lo = mid; else hi = mid; }
    const P = at(lo), pts = arcPts(B, P, r, -1, nSeg * 8);
    out.push({ nSeg, pts });
  }
  return out;
})();

function sceneC3(t) {
  // the shell, enlarged
  ctx.save();
  ctx.translate(BIG.dx, BIG.dy); ctx.translate(BIG.ox, BIG.oy); ctx.scale(BIG.sc, BIG.sc); ctx.translate(-BIG.ox, -BIG.oy);
  ctx.globalAlpha *= 0.32; shellFill(S1, t, 0.4);
  ctx.restore();
  // ribs, growing segment by segment
  RIBS.forEach((rib, j) => {
    const g = seg(t, 35.4 + j * 0.55, 37.0 + j * 0.55);
    const shown = g * rib.nSeg;
    for (let s = 0; s < rib.nSeg; s++) {
      const a = clamp(shown - s);
      if (a <= 0) break;
      const p0 = rib.pts[s * 8], p1 = rib.pts[(s + 1) * 8];
      ctx.strokeStyle = s % 2 ? C.rib : C.shell; ctx.lineWidth = 11; ctx.lineCap = 'butt';
      ctx.globalAlpha = a;
      ctx.beginPath();
      for (let q = s * 8; q <= (s + 1) * 8; q++) { const [x, y] = rib.pts[q]; q === s * 8 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
      ctx.globalAlpha = 1;
      void p0; void p1;
    }
    // segment count at the rib's end
    withAlpha(seg(t, 40.0 + j * 0.3, 40.5 + j * 0.3), () => {
      const end = rib.pts.at(-1);
      font(600, 26); text(`${rib.nSeg}`, end[0] + 16, end[1] + 8, { color: C.gold });
    });
  });
  withAlpha(eout(seg(t, 36.0, 36.6)), () => {
    font(500, 30); text('ribs made of one repeated segment', W / 2, 200, { align: 'center', color: C.gold });
  });
  withAlpha(eout(seg(t, 40.0, 40.6)), () => { font(400, 26); text('numbers: segments per rib', W / 2, 242, { align: 'center', color: C.soft }); });
  // one segment and its mould
  withAlpha(eout(seg(t, 37.8, 38.5)) * (1 - seg(t, 44.0, 44.5)), () => {
    const rib = RIBS[2], p = rib.pts[3 * 8], q = rib.pts[4 * 8];
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 34, 0, TAU); ctx.stroke();
  });
  // the section count
  withAlpha(eout(seg(t, 44.8, 45.6)), () => {
    ctx.fillStyle = 'rgba(5,22,43,0.72)'; k.rrect(W / 2 - 230, 280, 460, 150, 20); ctx.fill();
    font(300, 84); text(Kit.fmt(SECTIONS * eout(seg(t, 44.8, 46.8))), W / 2, 372, { align: 'center', color: C.ink });
    font(500, 26); text('precast concrete sections', W / 2, 410, { align: 'center', color: C.gold });
  });
}

// ---------- scene D1: tiles ----------
function sceneD1(t) {
  const x0 = 92, y0 = 160, w = 680, h = 560, sz = 30;
  ctx.save();
  k.rrect(x0, y0, w, h, 24); ctx.clip();
  ctx.fillStyle = '#D9D2C2'; ctx.fillRect(x0, y0, w, h);
  // chevron courses: tiles step up and down in a V, finishes alternating in bands
  const reveal = eout(seg(t, 48.8, 50.6));
  for (let row = -2; row * sz < h + sz * 4; row++) {
    for (let col = 0; col * sz < w + sz; col++) {
      const vx = col * sz, phase = Math.abs(((col % 16) + 16) % 16 - 8);
      const y = y0 + row * sz - phase * (sz / 2);
      const x = x0 + vx;
      const band = Math.floor((row + phase * 0.5) / 2) % 2 === 0;
      const d = Math.hypot(x - W / 2, y - 440) / 520;
      if (d > reveal * 1.2) continue;
      ctx.fillStyle = band ? '#FBFAF6' : C.cream;
      ctx.fillRect(x + 1.5, y + 1.5, sz - 3, sz - 3);
      if (band) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x + 4, y + 4, sz * 0.35, 3); }
    }
  }
  const sh = ctx.createLinearGradient(x0, y0, x0 + w, y0 + h);
  sh.addColorStop(0, 'rgba(255,240,215,0.25)'); sh.addColorStop(1, 'rgba(10,30,60,0.25)');
  ctx.fillStyle = sh; ctx.fillRect(x0, y0, w, h);
  ctx.restore();
  withAlpha(eout(seg(t, 49.2, 50.0)), () => {
    ctx.fillStyle = 'rgba(5,22,43,0.78)'; k.rrect(W / 2 - 250, 360, 500, 160, 20); ctx.fill();
    font(300, 80); text(Kit.fmt(TILES * eout(seg(t, 49.2, 51.6))), W / 2, 452, { align: 'center', color: C.ink });
    font(500, 26); text('tiles · glossy white and matte cream', W / 2, 494, { align: 'center', color: C.gold });
  });
}

// ---------- scene D2: payoff ----------
function sceneD2(t) {
  building(t, 1);
  withAlpha(eout(seg(t, 53.0, 53.8)), () => {
    font(300, 44); text('one sphere, many shells', W / 2, 196, { align: 'center' });
    font(400, 26); text('credited to Utzon · its origin is disputed', W / 2, 238, { align: 'center', color: C.soft });
  });
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
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: F, ink: C.ink, marks: { '*': C.gold, '~': C.cyan } });
  }
}

Kit.scene({
  width: W, height: H, duration: 58.4,
  fonts: [{ family: F, file: 'Outfit.woff2', weight: '100 900' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC1, T.C1], [sceneC2, T.C2], [sceneC3, T.C3], [sceneD1, T.D1], [sceneD2, T.D2, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
