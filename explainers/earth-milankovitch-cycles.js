// Explainer for earth-milankovitch-cycles: three slow changes in Earth's orbit and tilt help pace the ice ages.
// Look: orbit diagrams on deep blue night, a warm amber Sun against glacial white ice. A faint starfield and
// fine grain behind; Fraunces for display numbers, Outfit for captions and labels.
//
// Scene plan (63.5 s). Captions centred at y = 830; everything important sits above y = 930.
//  A  0.0–9.8   Hook. Earth seen side-on, lit amber from the left; a white ice cap grows slowly and melts
//               fast, three times. "Again and again…" / "The rhythm follows three slow changes…"
//  B  9.4–20.8  Eccentricity. Top-down orbit with the Sun at one focus; the orbit stretches into an oval
//               (hugely exaggerated, labelled) and relaxes again while a ring fills "≈ 100,000 years".
//  C 20.4–31.2  Obliquity. Big Earth, orbit plane and the axis nodding between 22.1° and 24.5° (true
//               angles, ghost lines at both extremes), a live degree readout.
//  D 30.8–42.6  Precession. The axis sweeps a cone (25,700 years); an inset orbit shows the closest
//               approach drifting through the seasons (about 21,000 years at present).
//  E 42.2–53.4  The sum. Three strips (eccentricity, tilt, precession) over the last 600,000 years from a
//               simple model with the source's periods, then their weighted sum: northern summer sunshine.
//               Weak summers are shaded ice-white.
//  F 53.0–63.5  The puzzle. Milanković expected 41,000-year ice ages; the last million years show about
//               100,000. "Why is still debated." The 41,000-year beat did fit 1–3 million years ago.
//
// Facts (Wikipedia, "Milankovitch cycles"): eccentricity varies between nearly circular and mildly elliptical;
// its main component has a 405,000-year period and others of 95,000 and 124,000 years, which loosely combine
// into a 100,000-year cycle; present eccentricity 0.0167. Tilt varies between 22.1° and 24.5° over about
// 41,000 years; now about 23.4° and decreasing. Axial precession about 25,700 years; with apsidal precession
// the timing of perihelion in the year shifts in about 21,000 years at present. Milanković emphasised 65° N;
// weaker summer insolation melts less of the winter's snow and ice. He deduced a 41,000-year period for ice
// ages; the last million years show 100,000; explanations are debated. 1–3 million years ago the climate
// cycles matched the 41,000-year obliquity cycle.
// The strips are a simplified model (sums of sines with those periods), labelled as such, not real data.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#050C24', bg1: '#0B1D45', bg2: '#13306A', ink: '#EEF3FF', soft: 'rgba(222,232,255,0.72)', faint: 'rgba(200,215,250,0.34)',
  amber: '#FFB547', amberHot: '#FFD58A', amberDeep: '#E07B12', ice: '#EAF6FF', iceBlue: '#A9DAFF', ocean: '#1B4E8C', oceanDeep: '#0D2A57',
  line: 'rgba(170,200,255,0.42)',
};
const DISPLAY = 'Fraunces', TEXT = 'Outfit';

let k, ctx;
const font = (w, s, f = TEXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- timeline ----------
const T = { A: [0, 9.8], B: [9.4, 20.8], C: [20.4, 31.2], D: [30.8, 42.6], E: [42.2, 53.4], F: [53.0, 63.5] };
const CUES = [
  [0.4, 4.8, 'Again and again, great ~ice sheets~ have grown and melted away.'],
  [4.9, 9.6, 'The rhythm follows three slow changes in how Earth *orbits* and *tilts*.'],
  [9.9, 14.9, 'One: the orbit’s *shape*. It stretches from nearly round to slightly oval.'],
  [15.0, 20.6, 'Its swings loosely combine into a cycle of about *100,000 years*.'],
  [20.9, 25.6, 'Two: the *tilt*. Earth’s axis nods between 22.1° and 24.5°.'],
  [25.7, 31.0, 'One full nod takes about *41,000 years*. More tilt, sharper seasons.'],
  [31.3, 36.6, 'Three: *precession*. The axis circles like a spinning top’s, about every 25,700 years.'],
  [36.7, 42.4, 'With the orbit turning too, closest approach drifts through the seasons in about *21,000 years*.'],
  [42.7, 47.9, 'Add them up, and *summer sunshine* in the far north rises and falls.'],
  [48.0, 53.2, 'When northern summers are weak, winter snow survives and ~ice~ can build up.'],
  [53.5, 57.2, 'Milanković expected ice ages every *41,000 years*.'],
  [57.3, 62.8, 'For the last million years: about every ~100,000~. Why is still debated.'],
];

// ---------- the model behind the strips (kyr, negative = ago) ----------
const TAU = Math.PI * 2;
const ecc = (t) => Math.max(0.002, 0.026 + 0.011 * Math.cos(TAU * (t + 40) / 405) + 0.009 * Math.cos(TAU * (t + 8) / 95) + 0.007 * Math.cos(TAU * (t - 20) / 124));
const tilt = (t) => 23.3 + 1.2 * Math.cos(TAU * (t + 10.7) / 41); // last maximum about 10,700 years ago
const prec = (t) => ecc(t) * Math.sin(TAU * t / 21 + 1.2);
const insol = (t) => 0.55 * (tilt(t) - 23.3) / 1.2 + 1.0 * prec(t) / 0.04;
const SPAN_KYR = 600;
const SUM_MAX = (() => { let m = 0; for (let t = -SPAN_KYR; t <= 0; t += 0.5) m = Math.max(m, Math.abs(insol(t))); return m; })();
const ECC_MIN = 0, ECC_MAX = (() => { let m = 0; for (let t = -SPAN_KYR; t <= 0; t += 0.5) m = Math.max(m, ecc(t)); return m; })();
const PREC_MAX = (() => { let m = 0; for (let t = -SPAN_KYR; t <= 0; t += 0.5) m = Math.max(m, Math.abs(prec(t))); return m; })();

// ---------- background, painted once ----------
let bg = null;
function rnd(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(W * 0.45, 380, 30, W * 0.5, 460, 900);
  rg.addColorStop(0, C.bg2); rg.addColorStop(0.45, C.bg1); rg.addColorStop(1, C.bg0);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  const r = rnd(7);
  for (let i = 0; i < 260; i++) {
    const x = r() * W, y = r() * H, s = r();
    g.fillStyle = `rgba(220,232,255,${0.08 + 0.4 * s * s})`;
    g.beginPath(); g.arc(x, y, 0.6 + 1.3 * s * s, 0, TAU); g.fill();
  }
  // fine grain
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.05)';
    g.fillRect(r() * W, r() * H, 1.5, 1.5);
  }
  // faint concentric rings, like an orrery plate
  g.strokeStyle = 'rgba(150,180,255,0.05)'; g.lineWidth = 1.2;
  for (let i = 1; i < 9; i++) { g.beginPath(); g.arc(W / 2, 430, i * 70, 0, TAU); g.stroke(); }
  const vg = g.createRadialGradient(W / 2, H / 2, 320, W / 2, H / 2, 780);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,10,0.5)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function background(t) {
  if (!bg) paintBg();
  ctx.drawImage(bg, 0, 0);
  font(600, 22); text('EARTH · CLIMATE', 64, 84, { color: C.amber, spacing: '3px' });
}

// ---------- drawing helpers ----------
function sunGlow(x, y, r, a = 1) {
  A(a, () => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4.2);
    g.addColorStop(0, 'rgba(255,214,140,0.55)'); g.addColorStop(0.35, 'rgba(255,170,60,0.16)'); g.addColorStop(1, 'rgba(255,150,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4.2, 0, TAU); ctx.fill();
    const c = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    c.addColorStop(0, '#FFF1C9'); c.addColorStop(0.6, C.amber); c.addColorStop(1, C.amberDeep);
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  });
}
/** Earth disc lit from the left; draws graticule; optional ice cap down to latitude capLat (degrees). */
function earth(x, y, r, { axis = 0, capLat = 90, light = -1, grat = true } = {}) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  const og = ctx.createRadialGradient(x + light * r * 0.45, y - r * 0.3, r * 0.1, x, y, r * 1.1);
  og.addColorStop(0, '#3F86C9'); og.addColorStop(0.55, C.ocean); og.addColorStop(1, C.oceanDeep);
  ctx.fillStyle = og; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.translate(x, y); ctx.rotate(axis);
  // simple land blobs for texture
  ctx.fillStyle = 'rgba(120,170,140,0.35)';
  for (const [bx, by, br] of [[-0.35, -0.25, 0.32], [0.3, -0.35, 0.28], [0.15, 0.3, 0.22], [-0.25, 0.42, 0.18], [0.5, 0.05, 0.16]]) {
    ctx.beginPath(); ctx.ellipse(bx * r, by * r, br * r * 1.2, br * r * 0.8, bx * 2, 0, TAU); ctx.fill();
  }
  if (grat) {
    ctx.strokeStyle = 'rgba(220,235,255,0.16)'; ctx.lineWidth = 1.4;
    for (const lat of [-60, -30, 0, 30, 60]) { const yy = -Math.sin(lat * Math.PI / 180) * r; const ww = Math.cos(lat * Math.PI / 180) * r; ctx.beginPath(); ctx.ellipse(0, yy, ww, ww * 0.12, 0, 0, TAU); ctx.stroke(); }
    for (const f of [-0.66, 0, 0.66]) { ctx.beginPath(); ctx.ellipse(0, 0, Math.abs(f) * r || 1, r, 0, 0, TAU); ctx.stroke(); }
  }
  if (capLat < 90) {
    const yy = -Math.sin(capLat * Math.PI / 180) * r;
    const ig = ctx.createLinearGradient(0, -r, 0, yy);
    ig.addColorStop(0, '#FFFFFF'); ig.addColorStop(1, C.ice);
    ctx.fillStyle = ig;
    ctx.beginPath(); ctx.moveTo(-r, -r * 1.1); ctx.lineTo(r, -r * 1.1); ctx.lineTo(r, yy);
    for (let i = 0; i <= 24; i++) { const xx = lerp(r, -r, i / 24); ctx.lineTo(xx, yy + Math.sin(i * 1.7) * r * 0.025 + (Math.abs(xx) / r) * r * 0.05); }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // night side shading
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  const sh = ctx.createLinearGradient(x + light * r, y, x - light * r, y);
  sh.addColorStop(0, 'rgba(0,0,20,0)'); sh.addColorStop(0.48, 'rgba(0,0,20,0.05)'); sh.addColorStop(0.62, 'rgba(2,6,25,0.55)'); sh.addColorStop(1, 'rgba(2,6,25,0.8)');
  ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
  // amber rim light on the lit side
  ctx.save(); ctx.strokeStyle = 'rgba(255,190,100,0.55)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, r - 1.5, light < 0 ? Math.PI * 0.62 : -Math.PI * 0.38, light < 0 ? Math.PI * 1.38 : Math.PI * 0.38); ctx.stroke(); ctx.restore();
}
function dashed(x1, y1, x2, y2, color = C.line, w = 2, d = [8, 9]) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(d);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
function label(s, x, y, { size = 24, color = C.soft, align = 'center', weight = 500 } = {}) { font(weight, size); text(s, x, y, { color, align }); }

// ---------- scene A: the ice cap breathes ----------
function sceneA(t) {
  const x = 432, y = 410, r = 190;
  sunGlow(-30, 380, 84);
  // three glacial cycles: slow growth, fast melt
  const ph = (t * 0.32) % 1;
  const grow = ph < 0.8 ? eio(ph / 0.8) : 1 - eio((ph - 0.8) / 0.2);
  const capLat = lerp(72, 38, grow * seg(t, 0.2, 1.2));
  earth(x, y, r, { axis: -0.2, capLat });
  label('Diagram, not to scale', x, y + r + 40, { size: 22, color: C.faint });
  // a slow pulse meter
  A(seg(t, 1, 2), () => {
    const bx = 150, bw = 564, by = 736;
    ctx.strokeStyle = 'rgba(234,246,255,0.28)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const tt = (i / 200) * Math.min(t, 9.8);
      const p = (tt * 0.32) % 1; const gg = p < 0.8 ? eio(p / 0.8) : 1 - eio((p - 0.8) / 0.2);
      const xx = bx + (bw * i) / 200, yy = by - gg * 50 * seg(tt, 0.2, 1.2);
      i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.stroke();
    label('ice', bx - 14, by - 40, { size: 22, color: C.iceBlue, align: 'right' });
  });
}

// ---------- scene B: eccentricity ----------
function orbitPoint(cx, cy, a, e, ang) { // Sun at focus (cx, cy); ellipse major axis horizontal
  const b = a * Math.sqrt(1 - e * e), c = a * e;
  return [cx - c + a * Math.cos(ang), cy + b * Math.sin(ang)];
}
function sceneB(t) {
  const sx = 470, sy = 420, a = 270;
  const p = seg(t, 10.6, 19.6);
  const e = 0.02 + 0.46 * Math.sin(Math.PI * eio(p));
  const b = a * Math.sqrt(1 - e * e), c = a * e;
  // orbit
  ctx.save(); ctx.strokeStyle = 'rgba(234,246,255,0.55)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(sx - c, sy, a, b, 0, 0, TAU); ctx.stroke(); ctx.restore();
  // a ghost circle for comparison
  ctx.save(); ctx.strokeStyle = 'rgba(169,218,255,0.18)'; ctx.setLineDash([5, 8]); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(sx, sy, a, 0, TAU); ctx.stroke(); ctx.restore();
  sunGlow(sx, sy, 34);
  // Earth: Kepler-ish speed (faster near the Sun) via mean-anomaly solve
  const M = (t * 2.4) % TAU;
  let E = M; for (let i = 0; i < 6; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const ex = sx - c + a * Math.cos(E + Math.PI), ey = sy + b * Math.sin(E + Math.PI);
  // closest / farthest
  const [px, py] = [sx - c - a, sy], [fx, fy] = [sx - c + a, sy];
  A(seg(t, 11.5, 12.5), () => {
    ctx.fillStyle = C.amberHot; ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = C.iceBlue; ctx.beginPath(); ctx.arc(fx, fy, 6, 0, TAU); ctx.fill();
    label('closest', px + 6, py + 44, { size: 24, color: C.amberHot });
    label('farthest', fx - 4, fy + 44, { size: 24, color: C.iceBlue });
  });
  // trail
  for (let i = 1; i < 14; i++) {
    const Mi = M - i * 0.06; let Ei = Mi; for (let j = 0; j < 5; j++) Ei = Ei - (Ei - e * Math.sin(Ei) - Mi) / (1 - e * Math.cos(Ei));
    const tx = sx - c + a * Math.cos(Ei + Math.PI), ty = sy + b * Math.sin(Ei + Math.PI);
    ctx.fillStyle = `rgba(169,218,255,${0.3 * (1 - i / 14)})`; ctx.beginPath(); ctx.arc(tx, ty, 9 - i * 0.4, 0, TAU); ctx.fill();
  }
  earth(ex, ey, 15, { grat: false, light: ex > sx ? -1 : 1 });
  // the cycle ring
  const rx = 714, ry = 196;
  ctx.save(); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(169,218,255,0.16)'; ctx.beginPath(); ctx.arc(rx, ry, 44, 0, TAU); ctx.stroke();
  ctx.strokeStyle = C.amber; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(rx, ry, 44, -Math.PI / 2, -Math.PI / 2 + TAU * eio(p)); ctx.stroke(); ctx.restore();
  font(600, 30, DISPLAY); text(`${Math.round(100 * eio(p))}k`, rx, ry + 10, { align: 'center', color: C.ink });
  label('years', rx, ry + 76, { size: 22 });
  label('Diagram: the oval is hugely exaggerated', W / 2, 712, { size: 22, color: C.faint });
}

// ---------- scene C: tilt ----------
function sceneC(t) {
  const x = 452, y = 420, r = 170, L = 290;
  sunGlow(-90, 420, 90);
  // sunlight rays
  A(0.5, () => { for (let i = -3; i <= 3; i++) dashed(40, y + i * 48, x - r - 20, y + i * 48, 'rgba(255,190,100,0.28)', 2, [3, 10]); });
  // orbit plane and its perpendicular
  dashed(80, y, 820, y, C.line, 2, [10, 10]);
  label('orbit plane', 760, y - 14, { size: 22, align: 'right', color: C.faint });
  dashed(x, y - L - 10, x, y + L * 0.62, 'rgba(170,200,255,0.25)', 2, [4, 8]);
  // tilt angle: 22.1° ↔ 24.5°, nodding twice over the scene
  const nod = 0.5 - 0.5 * Math.cos(TAU * seg(t, 21.2, 30.6) * 1.5);
  const deg = 22.1 + 2.4 * nod;
  const th = deg * Math.PI / 180;
  earth(x, y, r, { axis: -th, capLat: 72, light: -1 });
  // ghost extremes
  for (const dd of [22.1, 24.5]) {
    const a2 = dd * Math.PI / 180;
    ctx.save(); ctx.strokeStyle = 'rgba(255,213,138,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.sin(a2) * L, y - Math.cos(a2) * L); ctx.stroke(); ctx.restore();
  }
  label('22.1°', x - Math.sin(22.1 * Math.PI / 180) * L + 34, y - Math.cos(22.1 * Math.PI / 180) * L - 6, { size: 22, color: C.amberHot, align: 'left' });
  label('24.5°', x - Math.sin(24.5 * Math.PI / 180) * L - 12, y - Math.cos(24.5 * Math.PI / 180) * L - 6, { size: 22, color: C.amberHot, align: 'right' });
  // the axis
  ctx.save(); ctx.strokeStyle = C.ice; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + Math.sin(th) * L * 0.75, y + Math.cos(th) * L * 0.75); ctx.lineTo(x - Math.sin(th) * L, y - Math.cos(th) * L); ctx.stroke(); ctx.restore();
  // angle arc
  ctx.save(); ctx.strokeStyle = C.amber; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(x, y, 230, -Math.PI / 2 - th, -Math.PI / 2); ctx.stroke(); ctx.restore();
  // readout
  font(600, 64, DISPLAY); text(`${deg.toFixed(1)}°`, 660, 240, { align: 'center', color: C.amberHot });
  label('tilt of the axis', 660, 280, { size: 24 });
  // seasons hint
  A(span(t, 25.9, 31.2, 0.6, 0.3), () => {
    label('more tilt: brighter polar summers, darker polar winters', x, 700, { size: 23, color: C.soft });
  });
}

// ---------- scene D: precession ----------
function sceneD(t) {
  const x = 250, y = 430, r = 130, L = 230, eps = 23.4 * Math.PI / 180;
  sunGlow(-120, 430, 70, 0.7);
  const phi = -Math.PI / 2 + (t - 31) * 0.9;
  const tip = (ph) => [x + L * Math.sin(eps) * Math.cos(ph), y - L * Math.cos(eps) + L * Math.sin(eps) * Math.sin(ph) * 0.32];
  // cone path
  ctx.save(); ctx.strokeStyle = 'rgba(255,213,138,0.55)'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 8]);
  ctx.beginPath(); for (let i = 0; i <= 72; i++) { const [px, py] = tip((i / 72) * TAU); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore();
  dashed(x, y + r + 20, x, y - L - 30, 'rgba(170,200,255,0.25)', 2, [4, 8]);
  const [tx, ty] = tip(phi);
  const behind = Math.sin(phi) < 0;
  const drawAxis = () => { ctx.save(); ctx.strokeStyle = C.ice; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - (tx - x) * 0.6, y - (ty - y) * 0.6); ctx.lineTo(tx, ty); ctx.stroke(); ctx.restore(); };
  if (behind) drawAxis();
  earth(x, y, r, { axis: Math.atan2(tx - x, -(ty - y)), capLat: 72, light: -1 });
  if (!behind) drawAxis();
  // Polaris marks where the axis points today (phi = -pi/2 at t = 31)
  const [qx, qy] = tip(-Math.PI / 2);
  star(qx, qy - 26, 9, C.amberHot);
  label('Polaris', qx + 18, qy - 40, { size: 22, color: C.amberHot, align: 'left' });
  // spin arrow
  ctx.save(); ctx.strokeStyle = 'rgba(234,246,255,0.5)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(x, y - L * Math.cos(eps), L * Math.sin(eps) + 22, (L * Math.sin(eps) + 22) * 0.32, 0, 0.2, 1.3); ctx.stroke(); ctx.restore();
  label('≈ 25,700 years per circle', x, y + r + 70, { size: 24, color: C.soft });

  // inset: the closest approach drifting through the seasons
  A(seg(t, 36.4, 37.2), () => {
    const ox = 620, oy = 430, a = 104, b = 84;
    const drift = eio(seg(t, 37.4, 42.2)) * Math.PI; // half a turn: winter → summer for the north
    ctx.save(); ctx.strokeStyle = 'rgba(234,246,255,0.45)'; ctx.lineWidth = 2.5; ctx.translate(ox, oy); ctx.rotate(drift);
    ctx.beginPath(); ctx.ellipse(-20, 0, a, b, 0, 0, TAU); ctx.stroke();
    const [cx2, cy2] = [-20 - a, 0];
    ctx.fillStyle = C.amberHot; ctx.beginPath(); ctx.arc(cx2, cy2, 7, 0, TAU); ctx.fill();
    ctx.restore();
    sunGlow(ox, oy, 15);
    // season labels around (northern hemisphere), fixed
    const sl = [['winter', Math.PI], ['spring', -Math.PI / 2], ['summer', 0], ['autumn', Math.PI / 2]];
    label('northern seasons', ox, oy - 168, { size: 22, color: C.faint });
    for (const [s, ang] of sl) label(s, ox + Math.cos(ang) * 182, oy + Math.sin(ang) * 126 + 8, { size: 22, color: C.soft });
    const cang = Math.PI + drift;
    const [cx3, cy3] = [ox + Math.cos(cang) * (a - 30), oy + Math.sin(cang) * (b - 34)];
    label('closest', cx3, cy3 + 8, { size: 22, color: C.amberHot });
  });
}
function star(x, y, r, color) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r; const a = -Math.PI / 2 + (i * Math.PI) / 5; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, 'rgba(255,213,138,0.35)'); g.addColorStop(1, 'rgba(255,213,138,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, TAU); ctx.fill(); ctx.restore();
}

// ---------- scene E: the strips and their sum ----------
const PX0 = 120, PX1 = 790;
const xOf = (kyr) => lerp(PX0, PX1, (kyr + SPAN_KYR) / SPAN_KYR);
function strip(t, t0, y, h, fn, lo, hi, color, title) {
  const p = eio(seg(t, t0, t0 + 2.6));
  A(seg(t, t0 - 0.3, t0 + 0.3), () => {
    label(title, PX0, y - h / 2 - 12, { size: 23, align: 'left', color, weight: 600 });
    ctx.save(); ctx.strokeStyle = 'rgba(170,200,255,0.14)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PX0, y); ctx.lineTo(PX1, y); ctx.stroke(); ctx.restore();
  });
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath();
  const n = Math.round(700 * p);
  for (let i = 0; i <= n; i++) {
    const kyr = -SPAN_KYR + (SPAN_KYR * i) / 700;
    const v = (fn(kyr) - lo) / (hi - lo);
    const yy = y + h / 2 - v * h;
    i ? ctx.lineTo(xOf(kyr), yy) : ctx.moveTo(xOf(kyr), yy);
  }
  ctx.stroke(); ctx.restore();
}
function sceneE(t) {
  strip(t, 42.5, 180, 70, ecc, ECC_MIN, ECC_MAX, C.iceBlue, 'Orbit shape · about 100,000 years');
  strip(t, 43.6, 290, 70, tilt, 22.1, 24.5, C.iceBlue, 'Tilt · about 41,000 years');
  strip(t, 44.7, 400, 70, prec, -PREC_MAX, PREC_MAX, C.iceBlue, 'Precession · about 21,000 years');
  // the sum
  const y = 555, h = 150, p = eio(seg(t, 46.0, 49.4));
  A(seg(t, 45.6, 46.2), () => {
    label('Northern summer sunshine (all three added)', PX0, y - h / 2 - 14, { size: 23, align: 'left', color: C.amberHot, weight: 600 });
    label('more', PX0 - 12, y - h / 2 + 22, { size: 22, align: 'right', color: C.faint });
    label('less', PX0 - 12, y + h / 2 - 4, { size: 22, align: 'right', color: C.faint });
  });
  if (p > 0) {
    const n = Math.round(900 * p);
    const pts = [];
    for (let i = 0; i <= n; i++) { const kyr = -SPAN_KYR + (SPAN_KYR * i) / 900; pts.push([xOf(kyr), y - (insol(kyr) / SUM_MAX) * (h / 2)]); }
    // fills: weak summers ice-white below the midline, strong summers amber above
    const iceA = 0.25 + 0.45 * seg(t, 48.4, 49.4);
    for (const [above, col] of [[true, 'rgba(255,181,71,0.30)'], [false, `rgba(234,246,255,${iceA})`]]) {
      ctx.save(); ctx.beginPath(); ctx.rect(PX0, above ? y - h : y, PX1 - PX0, h); ctx.clip();
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(pts[0][0], y); for (const [px, py] of pts) ctx.lineTo(px, py); ctx.lineTo(pts.at(-1)[0], y); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.save(); ctx.strokeStyle = C.amber; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke(); ctx.restore();
  }
  ctx.save(); ctx.strokeStyle = 'rgba(170,200,255,0.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PX0, y); ctx.lineTo(PX1, y); ctx.stroke(); ctx.restore();
  // time axis
  A(seg(t, 42.6, 43.2), () => {
    label('600,000 years ago', PX0, 670, { size: 22, align: 'left', color: C.faint });
    label('today', PX1, 670, { size: 22, align: 'right', color: C.faint });
    label('simplified model with the real periods, not measured data', W / 2, 706, { size: 22, color: C.faint });
  });
}

// ---------- scene F: the puzzle ----------
function card(x, y, w, h, a, fn) {
  A(a, () => {
    ctx.save(); k.rrect(x, y, w, h, 26);
    ctx.fillStyle = 'rgba(8,20,52,0.72)'; ctx.fill(); ctx.strokeStyle = 'rgba(169,218,255,0.28)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    fn();
  });
}
function sceneF(t) {
  const a1 = eout(seg(t, 53.4, 54.2)), a2 = eout(seg(t, 57.2, 58.0));
  card(110, 170 + (1 - a1) * 20, 644, 210, a1, () => {
    label('MILANKOVIĆ’S PREDICTION', W / 2, 228 + (1 - a1) * 20, { size: 22, color: C.soft, weight: 600 });
    font(700, 92, DISPLAY); text('41,000', W / 2, 330 + (1 - a1) * 20, { align: 'center', color: C.amberHot });
    label('years between ice ages, set by the tilt', W / 2, 362 + (1 - a1) * 20, { size: 24 });
  });
  card(110, 410 + (1 - a2) * 20, 644, 210, a2, () => {
    label('THE LAST MILLION YEARS', W / 2, 468 + (1 - a2) * 20, { size: 22, color: C.soft, weight: 600 });
    font(700, 92, DISPLAY); text('~100,000', W / 2, 570 + (1 - a2) * 20, { align: 'center', color: C.ice });
    label('years, close to the orbit-shape cycle', W / 2, 602 + (1 - a2) * 20, { size: 24 });
  });
  A(seg(t, 59.4, 60.4), () => {
    label('1–3 million years ago, the 41,000-year beat did fit.', W / 2, 676, { size: 24, color: C.soft });
    label('Suspects for the change: oceans, CO₂, the ice itself', W / 2, 712, { size: 24, color: C.iceBlue });
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
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.amber, '~': C.iceBlue } });
  }
}

Kit.scene({
  width: W, height: H, duration: 63.5,
  fonts: [
    { family: DISPLAY, file: 'Fraunces.woff2' },
    { family: TEXT, file: 'Outfit.woff2' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E], [sceneF, T.F, 0.4, 0]];
    for (const [fn, [a, b], fi = 0.4, fo = 0.4] of scenes) {
      if (t < a || t > b) continue;
      A(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
