// Explainer for space-astronauts-are-falling: astronauts float because they are falling around Earth.
// Look: first a copperplate engraving after Newton's cannon figure (cream laid paper, sepia hatching, italic
// letters V D E F G), which dissolves into a crisp modern orbit diagram on navy. Libre Caslon Text throughout
// for captions and engraved letters, Space Grotesk for the modern labels.
//
// Scene plan (61 s). Captions centred at y = 836; everything important sits above y = 930.
//  A  0.0–9.6   Hook on the engraving: Earth with a tall mountain V. "Astronauts float. But gravity hasn't
//               switched off…" / "Newton showed why, with an imaginary cannon…"
//  B  9.4–30.0  Five shots from V, each faster (0.55–1.0 of circular speed), integrated under inverse-square
//               gravity: they land at D, E, F, G, and the last one circles back to the mountain.
//  C 29.5–44.8  The plate dissolves into navy space. Earth and the ISS orbit drawn to scale (400 km on a
//               6,371 km Earth). 7.7 km/s, 93 minutes a lap; a gauge shows gravity up there ≈ 90%.
//  D 44.6–61.0  Why it floats: a stretch of orbit, the straight no-gravity path vs the real curve, about 4 m of
//               fall each second (drop exaggerated); then the station with a crew silhouette, both falling
//               together; payoff caption.
//
// Facts: Wikipedia "Newton's cannonball" (a stone projected from a high mountain with no air; too slow, it
// falls back; at orbital speed it circles and returns to the mountain; between orbital and escape speed, an
// ellipse; in De mundi systemate, 1728). Wikipedia "International Space Station": about 400 km up, 7.67 km/s,
// about 93 minutes per orbit, 15.5 orbits a day; gravity at its altitude is approximately 90% as strong as at
// the surface, but objects in orbit are in continuous free fall. Computed here: (6371 / 6771)² = 0.885, and
// the fall in one second, v²/(2r) = 4.3 m, is the drop of the orbit's curve over the 7.7 km travelled.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  paper: '#F1E6CC', paperDark: '#E2D2AE', ink: '#3B2A17', inkSoft: 'rgba(59,42,23,0.72)', inkFaint: 'rgba(59,42,23,0.35)', red: '#9A2A1A',
  navy0: '#030916', navy1: '#0A1A36', navy2: '#13305C', cream: '#F4F1E8', soft: 'rgba(232,240,255,0.74)', faint: 'rgba(210,225,255,0.4)',
  gold: '#FFC857', sky: '#7FD3FF', earth: '#2D6FB8', earthDeep: '#0F2F5E', land: '#5E9C6E',
};
const SERIF = 'Libre Caslon Text', ITALIC = 'Libre Caslon Italic', SANS = 'Space Grotesk';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.cream, ...o });
const A = (a, fn) => k.alpha(a, fn);
const serif = (s, x, y, { size = 30, color = C.ink, align = 'center', italic = true, weight = 400 } = {}) => { ctx.font = `${italic ? 400 : weight} ${size}px ${italic ? ITALIC : SERIF}`; text(s, x, y, { color, align }); };
const sans = (s, x, y, { size = 24, color = C.soft, align = 'center', weight = 500 } = {}) => { font(weight, size); text(s, x, y, { color, align }); };

const T = { A: [0, 9.6], B: [9.4, 30.0], C: [29.5, 44.8], D: [44.6, 61.0] };
const PLATE_OUT = [29.5, 30.3]; // the engraving dissolves
const CUES = [
  [0.4, 4.6, 'Astronauts float. But gravity hasn’t switched off up there.'],
  [4.7, 9.4, 'Newton showed why, with an imaginary cannon on a mountain.'],
  [9.6, 14.2, 'Fire a cannonball, and gravity bends its path down to the ground.'],
  [14.3, 19.0, 'Fire it faster: it still falls, but lands farther around the Earth.'],
  [19.1, 24.6, 'Fast enough, and the ground curves away as fast as the ball drops.'],
  [24.7, 29.4, 'It falls forever, all the way around: an *orbit*.'],
  [30.4, 34.8, 'The space station does exactly this, about *400\u00A0km* up.'],
  [34.9, 39.6, 'It moves sideways at about *7.7\u00A0km/s*, once around every 93 minutes.'],
  [39.7, 44.6, 'Up there, gravity is still about ~90%~ as strong as on the ground.'],
  [44.8, 50.4, 'Each second it falls about *4\u00A0m*, and Earth’s curve drops away by about as much.'],
  [50.5, 55.2, 'The crew falls ~together~ with the station, so nothing presses on them.'],
  [55.3, 60.6, 'They float because they’re falling all the time, not because gravity is gone.'],
];

// ---------- Newton's cannon: integrate the shots ----------
const E = { x: 432, y: 470, R: 220 };
const MOUNT = 46; // the mountain's height in the figure (Newton drew it very tall)
const R0 = E.R + MOUNT;
const LAP = 5.2; // seconds for a full circle at circular speed
const VC = (TAU * R0) / LAP, GM = VC * VC * R0;
const SHOTS = [
  { f: 0.55, t0: 10.0, letter: 'D' }, { f: 0.72, t0: 14.4, letter: 'E' }, { f: 0.84, t0: 16.4, letter: 'F' },
  { f: 0.93, t0: 19.2, letter: 'G' }, { f: 1.0, t0: 22.6, letter: '' },
];
for (const s of SHOTS) {
  // start at the mountain top, moving horizontally to the right; velocity Verlet at 1/600 s
  let x = 0, y = -R0, vx = s.f * VC, vy = 0;
  const dt = 1 / 600; const pts = [[x, y, 0]]; let tt = 0, ang = 0;
  const acc = (px, py) => { const r = Math.hypot(px, py); return [(-GM * px) / r ** 3, (-GM * py) / r ** 3]; };
  let [ax, ay] = acc(x, y);
  while (tt < LAP * 1.02) {
    x += vx * dt + 0.5 * ax * dt * dt; y += vy * dt + 0.5 * ay * dt * dt;
    const [nx, ny] = acc(x, y); vx += 0.5 * (ax + nx) * dt; vy += 0.5 * (ay + ny) * dt; ax = nx; ay = ny; tt += dt;
    ang = Math.atan2(x, -y); // clockwise angle from the top
    if (Math.hypot(x, y) <= E.R) { pts.push([x, y, tt]); break; }
    if (s.f >= 1 && ang < 0 && ang > -0.02) { pts.push([0, -R0, tt]); break; }
    if (pts.length < 1 || tt - pts.at(-1)[2] > 1 / 120) pts.push([x, y, tt]);
  }
  s.pts = pts; s.dur = pts.at(-1)[2];
  s.land = pts.at(-1);
  // drawing speed: slow shots are drawn at real sim speed; the orbit takes its full lap
  s.play = s.f >= 1 ? 5.4 : Math.max(1.6, s.dur * 1.0);
}
function shotPath(s, t) {
  const u = eio(seg(t, s.t0, s.t0 + s.play));
  const upto = u * s.dur;
  const out = [];
  for (const p of s.pts) { if (p[2] > upto) break; out.push(p); }
  return { out, u };
}

// ---------- backgrounds ----------
let paperC = null, spaceC = null;
function rnd(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function paintPaper() {
  paperC = document.createElement('canvas'); paperC.width = W; paperC.height = H;
  const g = paperC.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 460, 80, W / 2, 500, 760);
  rg.addColorStop(0, '#F6ECD6'); rg.addColorStop(0.7, C.paper); rg.addColorStop(1, C.paperDark);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  const r = rnd(21);
  // laid-paper lines and fibres
  g.strokeStyle = 'rgba(120,90,50,0.035)'; g.lineWidth = 2;
  for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  for (let i = 0; i < 1800; i++) { g.fillStyle = 'rgba(90,60,20,0.05)'; g.fillRect(r() * W, r() * H, 2, 2); }
  // foxing
  for (let i = 0; i < 18; i++) {
    const x = r() * W, y = r() * H, rr = 8 + r() * 40;
    const fg = g.createRadialGradient(x, y, 0, x, y, rr); fg.addColorStop(0, 'rgba(160,110,50,0.08)'); fg.addColorStop(1, 'rgba(160,110,50,0)');
    g.fillStyle = fg; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill();
  }
  // plate mark: a double rule
  g.strokeStyle = 'rgba(59,42,23,0.55)'; g.lineWidth = 2.5; g.strokeRect(36, 122, W - 72, 640);
  g.lineWidth = 1; g.strokeRect(46, 132, W - 92, 620);
}
function paintSpace() {
  spaceC = document.createElement('canvas'); spaceC.width = W; spaceC.height = H;
  const g = spaceC.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 420, 60, W / 2, 460, 860);
  rg.addColorStop(0, C.navy2); rg.addColorStop(0.45, C.navy1); rg.addColorStop(1, C.navy0);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  const r = rnd(4);
  for (let i = 0; i < 240; i++) { const s = r(); g.fillStyle = `rgba(230,238,255,${0.1 + 0.5 * s * s})`; g.beginPath(); g.arc(r() * W, r() * H, 0.6 + 1.2 * s * s, 0, TAU); g.fill(); }
}
function background(t) {
  if (!paperC) { paintPaper(); paintSpace(); }
  const m = eio(seg(t, ...PLATE_OUT));
  if (m < 1) ctx.drawImage(paperC, 0, 0);
  if (m > 0) A(m, () => ctx.drawImage(spaceC, 0, 0));
  A(1 - m, () => serif('SPACE · GRAVITY', 64, 84, { size: 22, color: C.red, italic: false, weight: 700, align: 'left' }));
  A(m, () => { font(700, 22); text('SPACE · GRAVITY', 64, 84, { color: C.gold, spacing: '3px' }); });
}

// ---------- the engraving ----------
function engravedEarth(a) {
  A(a, () => {
    ctx.save();
    ctx.beginPath(); ctx.arc(E.x, E.y, E.R, 0, TAU); ctx.clip();
    // hatching: fine diagonal lines, denser toward the lower right (shade)
    ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 1.2;
    for (let i = -E.R * 2; i < E.R * 2; i += 7) { ctx.beginPath(); ctx.moveTo(E.x + i - E.R, E.y - E.R); ctx.lineTo(E.x + i + E.R, E.y + E.R); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(59,42,23,0.28)';
    for (let i = 0; i < E.R * 2; i += 7) { ctx.beginPath(); ctx.moveTo(E.x - E.R + i, E.y + E.R); ctx.lineTo(E.x + E.R, E.y - E.R + i); ctx.stroke(); }
    // a lit cap: paper showing through
    const lg = ctx.createRadialGradient(E.x - 70, E.y - 80, 10, E.x - 40, E.y - 50, 220);
    lg.addColorStop(0, 'rgba(244,234,210,0.95)'); lg.addColorStop(1, 'rgba(244,234,210,0)');
    ctx.fillStyle = lg; ctx.fillRect(E.x - E.R, E.y - E.R, 2 * E.R, 2 * E.R);
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(E.x, E.y, E.R, 0, TAU); ctx.stroke();
    // the mountain
    ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(E.x - 40, E.y - E.R + 6); ctx.lineTo(E.x - 6, E.y - R0); ctx.lineTo(E.x + 6, E.y - R0); ctx.lineTo(E.x + 40, E.y - E.R + 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(E.x + 4 + i * 5, E.y - R0 + 8 + i * 6); ctx.lineTo(E.x - 2 + i * 6, E.y - E.R + 4); ctx.stroke(); }
    serif('V', E.x - 36, E.y - R0 + 22, { size: 30 });
    serif('after Newton’s figure · diagram', E.x, 736, { size: 22, color: C.inkSoft });
  });
}
function cannon(a, recoil = 0) {
  A(a, () => {
    ctx.save(); ctx.translate(E.x - 4 - recoil * 6, E.y - R0 - 2);
    ctx.fillStyle = C.ink; k.rrect(-6, -12, 30, 10, 3); ctx.fill();
    ctx.beginPath(); ctx.arc(-4, -3, 5, 0, TAU); ctx.fill();
    ctx.restore();
  });
}
function drawShot(s, t, { faded = 1 } = {}) {
  const { out, u } = shotPath(s, t);
  if (out.length < 2) return u;
  ctx.save(); ctx.strokeStyle = C.ink; ctx.globalAlpha *= faded; ctx.lineWidth = 2; ctx.setLineDash([2, 6]); ctx.lineCap = 'round';
  ctx.beginPath(); out.forEach(([x, y], i) => (i ? ctx.lineTo(E.x + x, E.y + y) : ctx.moveTo(E.x + x, E.y + y))); ctx.stroke(); ctx.restore();
  const [bx, by] = out.at(-1);
  if (u < 1 || s.f < 1) {
    ctx.save(); ctx.globalAlpha *= faded; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(E.x + bx, E.y + by, 6, 0, TAU); ctx.fill(); ctx.restore();
  }
  if (u >= 1 && s.letter) A(faded * seg(t, s.t0 + s.play, s.t0 + s.play + 0.3), () => {
    const r = Math.hypot(bx, by), ux = bx / r, uy = by / r;
    serif(s.letter, E.x + ux * (E.R + 34), E.y + uy * (E.R + 34) + 10, { size: 30 });
  });
  return u;
}
function sceneA(t) {
  engravedEarth(eio(seg(t, 0.2, 1.8)));
  cannon(seg(t, 5.0, 5.8));
  A(seg(t, 1.2, 2.2), () => {
    serif('A Treatise of the System of the World, 1728', E.x, 170, { size: 24, color: C.inkSoft });
  });
}
function sceneB(t) {
  engravedEarth(1);
  serif('A Treatise of the System of the World, 1728', E.x, 170, { size: 24, color: C.inkSoft });
  const recoil = Math.max(...SHOTS.map((s) => span(t, s.t0 - 0.05, s.t0 + 0.35, 0.05, 0.3)));
  cannon(1, recoil);
  for (const s of SHOTS) {
    if (t < s.t0) continue;
    drawShot(s, t);
    // a puff of smoke at each firing
    const p = seg(t, s.t0, s.t0 + 0.8);
    if (p > 0 && p < 1) A(1 - p, () => { ctx.fillStyle = 'rgba(59,42,23,0.25)'; ctx.beginPath(); ctx.arc(E.x + 30 + p * 20, E.y - R0 - 8 - p * 14, 6 + p * 14, 0, TAU); ctx.fill(); });
  }
  // the orbit: highlight when it closes
  const o = SHOTS.at(-1);
  A(seg(t, o.t0 + o.play, o.t0 + o.play + 0.6), () => {
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(E.x, E.y, R0, 0, TAU); ctx.stroke(); ctx.restore();
    serif('orbit', E.x + R0 * 0.74 + 24, E.y + R0 * 0.74 + 34, { size: 30, color: C.red, align: 'left' });
  });
}

// ---------- the modern orbit ----------
const KM = E.R / 6371; // pixels per km, Earth to scale
const ISS_R = (6371 + 400) * KM;
function modernEarth(x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#4E95DA'); g.addColorStop(0.6, C.earth); g.addColorStop(1, C.earthDeep);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  ctx.fillStyle = 'rgba(94,156,110,0.55)';
  for (const [bx, by, br, rot] of [[-0.4, -0.2, 0.34, 0.6], [0.32, -0.42, 0.24, -0.3], [0.2, 0.28, 0.3, 1.1], [-0.2, 0.55, 0.16, 0.2]]) { ctx.beginPath(); ctx.ellipse(x + bx * r, y + by * r, br * r * 1.3, br * r * 0.8, rot, 0, TAU); ctx.fill(); }
  const sh = ctx.createLinearGradient(x - r, y - r, x + r, y + r); sh.addColorStop(0.45, 'rgba(0,5,20,0)'); sh.addColorStop(1, 'rgba(0,5,20,0.65)');
  ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
  // atmosphere glow
  const ag = ctx.createRadialGradient(x, y, r * 0.98, x, y, r * 1.08); ag.addColorStop(0, 'rgba(127,211,255,0.45)'); ag.addColorStop(1, 'rgba(127,211,255,0)');
  ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(x, y, r * 1.08, 0, TAU); ctx.fill();
}
function station(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#DCE6F5'; k.rrect(-14, -4, 28, 8, 3); ctx.fill(); // modules
  ctx.fillStyle = '#E8B04A'; ctx.fillRect(-2, -16, 4, 32); // truss
  ctx.fillStyle = '#3A6FB0'; for (const sx of [-1, 1]) for (const sy of [-1, 1]) ctx.fillRect(sx * 6 - 4 + (sx > 0 ? 0 : 0), sy * 16 - (sy > 0 ? 0 : 8), 8, 8);
  ctx.restore();
}
function sceneC(t) {
  const cx = E.x, cy = E.y;
  modernEarth(cx, cy, E.R);
  // the orbit, to scale
  ctx.save(); ctx.strokeStyle = 'rgba(255,200,87,0.75)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.arc(cx, cy, ISS_R, 0, TAU); ctx.stroke(); ctx.restore();
  const ang = -Math.PI / 2 + ((t - 29.5) / 6.2) * TAU;
  const sx = cx + Math.cos(ang) * ISS_R, sy = cy + Math.sin(ang) * ISS_R;
  // glow and trail
  for (let i = 1; i < 18; i++) { const a2 = ang - i * 0.03; ctx.fillStyle = `rgba(255,200,87,${0.4 * (1 - i / 18)})`; ctx.beginPath(); ctx.arc(cx + Math.cos(a2) * ISS_R, cy + Math.sin(a2) * ISS_R, 4, 0, TAU); ctx.fill(); }
  station(sx, sy, 0.9, ang + Math.PI / 2);
  A(seg(t, 30.6, 31.4), () => {
    sans('ISS orbit, drawn to scale', cx, 186, { size: 24, color: C.gold, weight: 600 });
    sans('400 km up on a 6,371 km Earth', cx, 218, { size: 22, color: C.soft });
  });
  A(seg(t, 35.0, 35.8), () => {
    sans('7.7 km/s · 93 min per lap', cx, 750, { size: 26, color: C.cream, weight: 600 });
  });
  // gravity gauge
  A(seg(t, 39.8, 40.6), () => {
    const gx = 150, gy = 300, gw = 26, gh = 300;
    const fill = 0.885 * eio(seg(t, 40.2, 42.2));
    ctx.save(); k.rrect(gx, gy, gw, gh, 13); ctx.strokeStyle = 'rgba(232,240,255,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    k.rrect(gx + 4, gy + 4 + (gh - 8) * (1 - fill), gw - 8, (gh - 8) * fill, 9); ctx.fillStyle = C.sky; ctx.fill(); ctx.restore();
    sans('gravity', gx + gw / 2, gy - 44, { size: 22, color: C.soft });
    sans('at the ISS', gx + gw / 2, gy - 18, { size: 22, color: C.soft });
    A(seg(t, 41.4, 42.2), () => { font(700, 40); text('≈ 90%', gx + gw / 2, gy + gh + 50, { align: 'center', color: C.sky }); });
    sans('of ground level', gx + gw / 2, gy + gh + 80, { size: 22, color: C.soft });
  });
}
function sceneD(t) {
  // a stretch of orbit seen up close: Earth's surface curving below, the path above it
  const ox = 432, oy = 1180, rr = 720; // a big arc: the curve of the orbit
  const sr = rr - 110; // surface below, drawn closer than to scale
  const part = seg(t, 44.6, 50.4);
  A(1 - seg(t, 50.0, 50.8), () => {
    ctx.save();
    const eg = ctx.createRadialGradient(ox, oy, sr - 40, ox, oy, sr);
    eg.addColorStop(0, C.earthDeep); eg.addColorStop(1, C.earth);
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ox, oy, sr, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(127,211,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ox, oy, sr, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    // the real, curved path
    ctx.strokeStyle = 'rgba(255,200,87,0.85)'; ctx.lineWidth = 3; ctx.setLineDash([8, 7]);
    ctx.beginPath(); ctx.arc(ox, oy, rr, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke();
    ctx.restore();
    // start point at the top of the arc, moving right
    const a0 = -Math.PI / 2 - 0.36, a1 = -Math.PI / 2 + 0.3;
    const p0 = [ox + Math.cos(a0) * rr, oy + Math.sin(a0) * rr];
    const ang = lerp(a0, a1, eio(seg(t, 45.2, 49.0)));
    const p = [ox + Math.cos(ang) * rr, oy + Math.sin(ang) * rr];
    // straight line it would follow with no gravity (the tangent at p0)
    const tx = -Math.sin(a0), ty = Math.cos(a0);
    const L = 560;
    ctx.save(); ctx.strokeStyle = 'rgba(232,240,255,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([3, 8]);
    ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(p0[0] + tx * L, p0[1] + ty * L); ctx.stroke(); ctx.restore();
    sans('with no gravity: straight on', p0[0] + tx * L - 10, p0[1] + ty * L - 16, { size: 22, color: C.soft, align: 'right' });
    // the fall: from the straight line down to the curve
    const along = (ang - a0) * rr;
    const q = [p0[0] + tx * along, p0[1] + ty * along];
    ctx.save(); ctx.strokeStyle = C.sky; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(...q); ctx.lineTo(...p); ctx.stroke(); ctx.restore();
    if (along > 60) sans('the fall', (q[0] + p[0]) / 2 + 14, (q[1] + p[1]) / 2 + 8, { size: 22, color: C.sky, align: 'left' });
    station(p[0], p[1], 1.4, ang + Math.PI / 2);
    sans('Earth', ox, 690, { size: 26, color: C.cream, weight: 600 });
    A(seg(t, 46.4, 47.2), () => {
      sans('each second: 7.7 km along, about 4 m down', W / 2, 200, { size: 24, color: C.cream, weight: 600 });
      sans('diagram · the drop is hugely exaggerated', W / 2, 232, { size: 22, color: C.faint });
    });
  });
  // inside the station: the crew and the station share the same fall
  const b = seg(t, 50.4, 51.2);
  A(b, () => {
    const x = 432, y = 400;
    ctx.save(); k.rrect(x - 250, y - 130, 500, 260, 60); ctx.fillStyle = 'rgba(220,230,245,0.12)'; ctx.fill();
    ctx.strokeStyle = '#DCE6F5'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
    // a floating crew silhouette, gently turning
    const bob = Math.sin(t * 1.4) * 8, rot = Math.sin(t * 0.6) * 0.25;
    person(x - 30, y - 10 + bob, rot);
    // equal fall arrows
    for (const [ax, ay, lab] of [[x - 30, y + 60, 'crew'], [x + 170, y + 150, 'station']]) {
      arrow(ax, ay, ax, ay + 110, C.sky);
      sans(lab, ax + 16, ay + 70, { size: 22, color: C.sky, align: 'left' });
    }
    sans('both fall at the same rate', x, y + 320, { size: 26, color: C.cream, weight: 600 });
    sans('toward Earth', x, y + 352, { size: 22, color: C.soft });
  });
}
function person(x, y, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = '#F4F1E8';
  ctx.beginPath(); ctx.arc(0, -52, 16, 0, TAU); ctx.fill(); // head
  k.rrect(-16, -34, 32, 56, 12); ctx.fill(); // body
  ctx.strokeStyle = '#F4F1E8'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-14, -26); ctx.lineTo(-44, -6); ctx.moveTo(14, -26); ctx.lineTo(42, -44); ctx.stroke(); // arms
  ctx.beginPath(); ctx.moveTo(-8, 20); ctx.lineTo(-22, 62); ctx.moveTo(8, 20); ctx.lineTo(30, 56); ctx.stroke(); // legs
  ctx.restore();
}
function arrow(x1, y1, x2, y2, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2 - 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 10, y2 - 18); ctx.lineTo(x2 + 10, y2 - 18); ctx.closePath(); ctx.fill(); ctx.restore();
}

// ---------- captions ----------
const CAP = { size: 42, lh: 54, maxW: 760 };
const capWidth = new Map();
function balanced(s, weight) {
  const key = s + weight;
  if (capWidth.has(key)) return capWidth.get(key);
  ctx.font = `${weight} ${CAP.size}px ${SERIF}`;
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (m) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > m && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(key, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    const old = cue[0] < PLATE_OUT[0];
    const weight = old ? 400 : 700;
    k.captions(t, [cue], {
      x: W / 2, y: 846, maxW: balanced(cue[2], weight), size: CAP.size, lh: CAP.lh, weight, family: SERIF,
      ink: old ? C.ink : C.cream, marks: old ? { '*': C.red, '~': C.red } : { '*': C.gold, '~': C.sky },
    });
  }
}

Kit.scene({
  width: W, height: H, duration: 61.0,
  fonts: [
    { family: SERIF, file: 'LibreCaslonText-Regular.woff2', weight: '400' },
    { family: SERIF, file: 'LibreCaslonText-Bold.woff2', weight: '700' },
    { family: ITALIC, file: 'LibreCaslonText-Italic.woff2', weight: '400' },
    { family: SANS, file: 'SpaceGrotesk.woff2' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const scenes = [[sceneA, T.A, 0, 0], [sceneB, T.B, 0, 0.5], [sceneC, T.C, 0.8, 0.4], [sceneD, T.D, 0.4, 0]];
    for (const [fn, [a, b], fi = 0.4, fo = 0.4] of scenes) {
      if (t < a || t > b) continue;
      if (fn === sceneA && t >= T.B[0]) continue; // B continues the same plate
      A(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
