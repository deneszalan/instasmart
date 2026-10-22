// Explainer for space-kepler-equal-areas: the Sun–planet line sweeps equal areas in equal times.
// Look: a brass orrery on deep navy. Engraved rings and ticks, a brass Sun on its pivot, a brass
// arm out to a blued-steel planet, and the swept wedges lit like polished brass. Cinzel for
// engraved labels, Cardo for captions.
//
// Scene plan (56.5 s scene → about 75 s clip). Captions centred at y = 836.
//  A  0.0– 9.6  Hook. The orrery appears; a planet runs on an exaggerated ellipse (e = 0.6,
//               captioned as a diagram). "In 1609 Kepler showed Mars moves on an ellipse…" /
//               "…and not at a steady speed."
//  B  9.4–32.6  Demonstration. The arm from the Sun to the planet. Positions come from Kepler's
//               equation M = E − e·sin E, solved below; one orbit lasts 8 scene seconds. From
//               t = 13.6 (aphelion) each 1/12 of the period lays down one wedge; their areas are
//               measured here (shoelace) and all come out at 1/12 of the ellipse. A dial shows the
//               speed from the vis-viva relation: (1+e)/(1−e) = 4× faster at perihelion.
//  C 32.4–41.8  Why: gravity pulls along the arm, so the rate of sweeping area cannot change
//               (Newton; conservation of angular momentum). An area meter fills at a steady rate.
//  D 41.6–51.6  Earth: the ellipse relaxes to Earth's eccentricity 0.0167, almost a circle; its
//               speed, from vis-viva with a mean of 29.78 km/s, runs from 30.3 km/s in early
//               January (perihelion) to 29.3 km/s in early July (aphelion).
//  E 51.4–56.5  Payoff plaque.
//
// Facts: Wikipedia "Kepler's laws of planetary motion": second law, "a line joining a planet and
// the Sun sweeps out equal areas during equal intervals of time"; Astronomia nova (1609) showed
// Mars' orbit is elliptical, from Tycho Brahe's observations; Kepler's equation M = E − e sin E;
// the second law is equivalent to conservation of angular momentum, a consequence of the radial
// nature of Newton's gravity (1687). Wikipedia "Astronomia nova": it records the first two laws.
// Earth: eccentricity 0.0167 (Wikipedia "Earth's orbit"; NASA Earth fact sheet), perihelion around
// 3 January and aphelion around 4 July (Wikipedia "Earth's orbit"); NASA fact sheet: mean orbital
// velocity 29.78 km/s, max 30.29, min 29.29.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const DISPLAY = 'Cinzel', TEXT = 'Cardo';

const C = {
  navy: '#0A1430', deep: '#040816', brass: '#D6A54A', brassLight: '#F3D58C', brassDark: '#7E5A1C',
  steel: '#9CC8F0', cream: '#F6EBD2', creamSoft: 'rgba(246,235,210,0.74)', copper: '#E58A5C',
};

// ---------- the orbit ----------
const O = { cx: 472, cy: 440, a: 300 };
const P = 8; // one orbit, in scene seconds
const T_APH = 13.6; // the planet passes aphelion here (and every 8 s)
const E_DEMO = 0.6, E_EARTH = 0.0167, V_MEAN = 29.78;
function solveE(M, e) {
  let E = M;
  for (let i = 0; i < 30; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}
const ecc = (t) => lerp(E_DEMO, E_EARTH, eio(seg(t, 42.0, 45.0)));
const bOf = (e) => O.a * Math.sqrt(1 - e * e);
const sunAt = (e) => ({ x: O.cx - O.a * e, y: O.cy });
/** Point on the ellipse at eccentric anomaly E; E = 0 is perihelion, on the Sun's side (left). */
const at = (E, e) => ({ x: O.cx - O.a * Math.cos(E), y: O.cy - bOf(e) * Math.sin(E) });
const meanAnomaly = (t) => Math.PI + (2 * Math.PI * (t - T_APH)) / P;
function planet(t) {
  const e = ecc(t), M = meanAnomaly(t), E = solveE(((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), e);
  const p = at(E, e), s = sunAt(e);
  const r = Math.hypot(p.x - s.x, p.y - s.y);
  const v = Math.sqrt(2 / r - 1 / O.a); // vis-viva, GM = 1
  const vAph = Math.sqrt(2 / (O.a * (1 + e)) - 1 / O.a);
  const vMean = Math.sqrt(1 / O.a);
  return { ...p, E, r, rel: v / vAph, kms: (V_MEAN * v) / vMean };
}
const FAST = (1 + E_DEMO) / (1 - E_DEMO); // 4: perihelion speed ÷ aphelion speed
/** Wedge k of 12: the area swept between times T_APH + k·P/12 and the next tick. */
function wedgePts(k, e, n = 24) {
  const s = sunAt(e), pts = [s];
  for (let i = 0; i <= n; i++) {
    const M = Math.PI + (2 * Math.PI * (k + i / n)) / 12;
    pts.push(at(solveE(M, e), e));
  }
  return pts;
}
const shoelace = (pts) => Math.abs(pts.reduce((sum, p, i) => { const q = pts[(i + 1) % pts.length]; return sum + p.x * q.y - q.x * p.y; }, 0)) / 2;
const ELLIPSE_AREA = Math.PI * O.a * bOf(E_DEMO);
const WEDGE_SHARE = [...Array(12).keys()].map((k) => shoelace(wedgePts(k, E_DEMO, 200)) / ELLIPSE_AREA);
const SHARE_PCT = (100 * WEDGE_SHARE[0]).toFixed(1); // 8.3 % = 1/12, the same for every wedge
const V_PERI = (V_MEAN * Math.sqrt((1 + E_EARTH) / (1 - E_EARTH))).toFixed(1); // 30.3
const V_APH = (V_MEAN * Math.sqrt((1 - E_EARTH) / (1 + E_EARTH))).toFixed(1); // 29.3

const CUES = [
  [0.5, 5.6, 'In 1609, Kepler showed that Mars moves on an *ellipse*, not a circle.'],
  [5.8, 9.4, 'And it doesn’t move at a steady speed.'],
  [9.6, 13.5, 'Follow the arm from the Sun to the planet.'],
  [13.7, 17.4, 'In equal times, it sweeps out *equal areas*.'],
  [17.6, 22.6, 'Near the Sun the arm is short, so the planet must go *faster*.'],
  [22.8, 27.8, 'Far from the Sun the arm is long, and the planet ~crawls~.'],
  [28.0, 32.4, `Fat wedge or thin one: each is *1/12* of the ellipse.`],
  [32.6, 36.6, 'Newton later showed why: gravity pulls straight toward the Sun.'],
  [36.8, 41.6, 'A pull along the arm can’t change how fast it sweeps area.'],
  [41.8, 46.2, 'Earth’s orbit is nearly a circle, but the rule still holds.'],
  [46.4, 51.2, `Earth: about *${V_PERI} km/s* in early January, ~${V_APH} km/s~ in early July.`],
  [51.4, 55.6, 'Equal areas in equal times: *Kepler’s second law*.'],
];
const T = { A: [0, 9.6], B: [9.4, 32.6], C: [32.4, 41.8], D: [41.6, 51.6], E: [51.4, 56.5] };

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.cream, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- static background: navy, engraved rings and ticks ----------
let bg = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(O.cx - 40, O.cy, 60, O.cx - 40, O.cy, 760);
  rad.addColorStop(0, '#13234F'); rad.addColorStop(0.55, C.navy); rad.addColorStop(1, C.deep);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  // engraved guilloche: fine concentric rings
  const ox = 432, oy = 455;
  for (let r = 40; r < 640; r += 9) {
    g.strokeStyle = `rgba(214,165,74,${r % 45 === 4 ? 0.07 : 0.028})`; g.lineWidth = 1;
    g.beginPath(); g.arc(ox, oy, r, 0, Math.PI * 2); g.stroke();
  }
  // the outer brass ring with degree ticks
  g.strokeStyle = 'rgba(214,165,74,0.34)'; g.lineWidth = 3; g.beginPath(); g.arc(ox, oy, 392, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(214,165,74,0.22)'; g.lineWidth = 1.5; g.beginPath(); g.arc(ox, oy, 372, 0, Math.PI * 2); g.stroke();
  for (let d = 0; d < 360; d += 5) {
    const a = (d * Math.PI) / 180, l = d % 30 === 0 ? 20 : 9;
    g.strokeStyle = `rgba(214,165,74,${d % 30 === 0 ? 0.4 : 0.22})`; g.lineWidth = d % 30 === 0 ? 2 : 1;
    g.beginPath(); g.moveTo(ox + Math.cos(a) * 372, oy + Math.sin(a) * 372); g.lineTo(ox + Math.cos(a) * (372 - l), oy + Math.sin(a) * (372 - l)); g.stroke();
  }
  // star specks
  let s = 5;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(246,235,210,${0.15 + rnd() * 0.4})`; g.beginPath(); g.arc(rnd() * W, rnd() * H, 0.5 + rnd(), 0, Math.PI * 2); g.fill(); }
  // vignette and a dark caption band
  const vg = g.createRadialGradient(W / 2, 460, 300, W / 2, 520, 820);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const cb = g.createLinearGradient(0, 760, 0, H);
  cb.addColorStop(0, 'rgba(4,8,22,0)'); cb.addColorStop(0.35, 'rgba(4,8,22,0.55)'); cb.addColorStop(1, 'rgba(4,8,22,0.75)');
  g.fillStyle = cb; g.fillRect(0, 760, W, H - 760);
}
function header() {
  font(700, 22, DISPLAY); text('RECKON', 56, 66, { color: C.brassLight, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 18;
  font(400, 22, DISPLAY); text('·  SPACE  ·  ORBITS', 56 + w + 12, 66, { color: C.creamSoft, spacing: '2px' });
}

// ---------- orrery pieces ----------
function brassStroke(width) {
  ctx.lineWidth = width + 3; ctx.strokeStyle = 'rgba(40,25,5,0.6)'; ctx.stroke();
  ctx.lineWidth = width; ctx.strokeStyle = C.brass; ctx.stroke();
}
function orbitTrack(e, a = 1) {
  withAlpha(a, () => {
    const b = bOf(e);
    for (const [d, w, col] of [[6, 1.5, 'rgba(214,165,74,0.45)'], [-6, 1.5, 'rgba(214,165,74,0.45)'], [0, 2.5, 'rgba(243,213,140,0.75)']]) {
      ctx.beginPath(); ctx.ellipse(O.cx, O.cy, O.a + d, b + d, 0, 0, Math.PI * 2);
      ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke();
    }
    // engraved ticks across the track
    for (let i = 0; i < 72; i++) {
      const E = (i / 72) * Math.PI * 2, p = at(E, e);
      const nx = -Math.cos(E) * b, ny = -Math.sin(E) * O.a, l = Math.hypot(nx, ny);
      ctx.strokeStyle = 'rgba(214,165,74,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x - (nx / l) * 6, p.y - (ny / l) * 6); ctx.lineTo(p.x + (nx / l) * 6, p.y + (ny / l) * 6); ctx.stroke();
    }
  });
}
function sunBall(e, t) {
  const s = sunAt(e);
  ctx.save(); ctx.translate(s.x, s.y);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + t * 0.05, l = i % 2 ? 40 : 52;
    ctx.strokeStyle = 'rgba(243,213,140,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.stroke();
  }
  const g = ctx.createRadialGradient(-9, -10, 3, 0, 0, 28);
  g.addColorStop(0, '#FFF1C4'); g.addColorStop(0.45, C.brassLight); g.addColorStop(1, C.brassDark);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 27, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(60,38,8,0.8)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
function arm(p, e) {
  const s = sunAt(e);
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(p.x, p.y); brassStroke(5);
  ctx.fillStyle = C.brassDark; ctx.beginPath(); ctx.arc(s.x, s.y, 6, 0, Math.PI * 2); ctx.fill();
}
function planetBall(p, earth = 0) {
  const g = ctx.createRadialGradient(p.x - 6, p.y - 7, 2, p.x, p.y, 19);
  g.addColorStop(0, mixHex('#DCEBFA', '#CFF3E0', earth)); g.addColorStop(0.5, mixHex('#7FA9D6', '#4E9AD8', earth)); g.addColorStop(1, mixHex('#1F3A60', '#1C4C3A', earth));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 17, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(214,165,74,0.9)'; ctx.lineWidth = 2; ctx.stroke();
}
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mixHex(a, b, x) { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], x)).toString(16).padStart(2, '0')).join(''); }
function poly(pts) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); }

/** Wedges laid down one per tick from T_APH; `hi` lights chosen ones. */
function wedges(t, e, { upto = 12, hi = [], dim = 0, a = 1 }) {
  withAlpha(a, () => {
    for (let kk = 0; kk < 12; kk++) {
      const t0 = T_APH + (kk * P) / 12;
      if (t < t0) continue;
      const part = clamp((t - t0) / (P / 12));
      if (kk >= upto) continue;
      const n = 24, s = sunAt(e), pts = [s];
      for (let i = 0; i <= n; i++) pts.push(at(solveE(Math.PI + (2 * Math.PI * (kk + (part * i) / n)) / 12, e), e));
      const lit = hi.includes(kk);
      const base = kk % 2 ? 0.16 : 0.3;
      poly(pts);
      ctx.fillStyle = `rgba(232,184,92,${lit ? 0.62 : base * (1 - dim * 0.6)})`; ctx.fill();
      ctx.strokeStyle = `rgba(243,213,140,${lit ? 0.95 : 0.5 * (1 - dim * 0.5)})`; ctx.lineWidth = lit ? 2.5 : 1.2; ctx.stroke();
    }
  });
}
/** The brass speed dial: needle from 1× (aphelion) to 4× (perihelion). */
function dial(rel, a, { label = 'speed', lo = '1×', hi = `${FAST}×`, f = (rel - 1) / (FAST - 1), readout = null } = {}) {
  const x = 112, y = 662, r = 62;
  withAlpha(a, () => {
    ctx.fillStyle = 'rgba(6,12,32,0.92)'; ctx.beginPath(); ctx.arc(x, y, r + 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r + 10, 0, Math.PI * 2); brassStroke(3);
    const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
    for (let i = 0; i <= 12; i++) {
      const an = lerp(a0, a1, i / 12), l = i % 4 === 0 ? 13 : 7;
      ctx.strokeStyle = C.brass; ctx.lineWidth = i % 4 === 0 ? 2.5 : 1.5;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r, y + Math.sin(an) * r); ctx.lineTo(x + Math.cos(an) * (r - l), y + Math.sin(an) * (r - l)); ctx.stroke();
    }
    const an = lerp(a0, a1, clamp(f));
    ctx.strokeStyle = C.copper; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * (r - 14), y + Math.sin(an) * (r - 14)); ctx.stroke();
    ctx.fillStyle = C.brass; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    font(700, 22, DISPLAY); text(label, x, y + r + 36, { color: C.brassLight, align: 'center', spacing: '1px' });
    font(700, 22); text(lo, x - 27, y + 42, { color: C.creamSoft, align: 'center' }); text(hi, x + 27, y + 42, { color: C.creamSoft, align: 'center' });
    if (readout) { font(700, 30); text(readout, x, y - r - 22, { color: C.cream, align: 'center' }); }
  });
}
/** Area meter: fills one notch per tick, at a steady rate. */
function meter(t, a) {
  const x0 = 252, x1 = 800, y = 744;
  withAlpha(a, () => {
    const f = (((t - T_APH) / P) % 1 + 1) % 1;
    k.rrect(x0, y - 14, x1 - x0, 28, 14); ctx.fillStyle = 'rgba(6,12,32,0.9)'; ctx.fill(); brassStroke(2);
    const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, C.brassDark); g.addColorStop(1, C.brassLight);
    k.rrect(x0 + 4, y - 10, Math.max(0, (x1 - x0 - 8) * f), 20, 10); ctx.fillStyle = g; ctx.fill();
    for (let i = 1; i < 12; i++) { const x = lerp(x0, x1, i / 12); ctx.strokeStyle = 'rgba(246,235,210,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x, y + 14); ctx.stroke(); }
    font(700, 22, DISPLAY); text('area swept', x0, y - 26, { color: C.brassLight });
    font(400, 22); text('fills at a steady rate', x1, y - 26, { color: C.creamSoft, align: 'right' });
  });
}
function arrow(x0, y0, x1, y1, col, w = 4) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * 10, y1 - Math.sin(a) * 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * 18, y1 - Math.sin(a - 0.45) * 18); ctx.lineTo(x1 - Math.cos(a + 0.45) * 18, y1 - Math.sin(a + 0.45) * 18); ctx.closePath(); ctx.fill();
}

// ---------- scenes (drawn over the persistent orrery) ----------
function orrery(t) {
  const e = ecc(t), p = planet(t), earth = eio(seg(t, 42.5, 45));
  const on = eout(seg(t, 0.2, 1.6));
  orbitTrack(e, on);
  // wedges: laid down 13.6–21.6, highlighted in 17.6–32.4, gone for Earth
  const hi = t > 28 ? [0, 6] : t > 22.8 ? [0, 11] : t > 17.6 ? [5, 6] : [];
  const lit = span(t, 17.8, 32.4, 0.4, 0.5);
  wedges(t, e, { hi: lit > 0.5 ? hi : [], dim: lit, a: 1 - seg(t, 41.6, 42.4) });
  // Earth's own twelve wedges, laid down over one year
  withAlpha(seg(t, 45.4, 46.0) * (1 - seg(t, 51.2, 52)), () => {
    for (let kk = 0; kk < 12; kk++) { poly(wedgePts(kk, e)); ctx.fillStyle = `rgba(232,184,92,${kk % 2 ? 0.12 : 0.24})`; ctx.fill(); ctx.strokeStyle = 'rgba(243,213,140,0.45)'; ctx.lineWidth = 1.2; ctx.stroke(); }
  });
  // the ellipse centre, so the off-centre Sun shows
  withAlpha(on * 0.8, () => {
    ctx.strokeStyle = 'rgba(246,235,210,0.55)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(O.cx - 8, O.cy); ctx.lineTo(O.cx + 8, O.cy); ctx.moveTo(O.cx, O.cy - 8); ctx.lineTo(O.cx, O.cy + 8); ctx.stroke();
  });
  const armOn = seg(t, 9.6, 10.6);
  withAlpha(armOn * on, () => arm(p, e));
  withAlpha(on, () => sunBall(e, t));
  withAlpha(seg(t, 1.0, 1.8), () => planetBall(p, earth));
  return { e, p };
}

function sceneA(t) {
  withAlpha(seg(t, 1.6, 2.4), () => {
    font(400, 22, DISPLAY); text('DIAGRAM · ORBIT STRETCHED FOR CLARITY', O.cx - 40, 742, { color: C.creamSoft, align: 'center', spacing: '1px' });
  });
}
function sceneB(t, st) {
  const { p } = st;
  withAlpha(seg(t, 13.6, 14.4), () => { dial(p.rel, 1); meter(t, 1); });
  // labels for the highlighted wedges
  withAlpha(span(t, 17.8, 22.6), () => {
    font(700, 26, DISPLAY); text('PERIHELION', 56, 168, { color: C.brassLight, align: 'left' });
    font(400, 24); text('closest to the Sun', 56, 198, { color: C.creamSoft });
    font(700, 32); text(`${FAST}× faster`, 56, 242, { color: C.brassLight });
    font(400, 22); text('than at the far end', 56, 270, { color: C.creamSoft });
  });
  withAlpha(span(t, 22.8, 27.8), () => {
    font(700, 26, DISPLAY); text('APHELION', 808, 176, { color: C.steel, align: 'right' });
    font(400, 24); text('farthest from the Sun', 808, 206, { color: C.creamSoft, align: 'right' });
  });
  withAlpha(span(t, 28.0, 32.4), () => {
    const pts0 = wedgePts(0, E_DEMO), pts6 = wedgePts(6, E_DEMO);
    const c0 = pts0.reduce((s, q) => ({ x: s.x + q.x / pts0.length, y: s.y + q.y / pts0.length }), { x: 0, y: 0 });
    const c6 = pts6.reduce((s, q) => ({ x: s.x + q.x / pts6.length, y: s.y + q.y / pts6.length }), { x: 0, y: 0 });
    for (const c of [c0, c6]) {
      k.rrect(c.x - 58, c.y - 22, 116, 40, 12); ctx.fillStyle = 'rgba(6,12,32,0.88)'; ctx.fill(); ctx.strokeStyle = C.brass; ctx.lineWidth = 1.5; ctx.stroke();
      font(700, 26); text(`${SHARE_PCT}%`, c.x, c.y + 7, { color: C.brassLight, align: 'center' });
    }
  });
}
function sceneC(t, st) {
  const { p, e } = st;
  const s = sunAt(e);
  dial(p.rel, 1); meter(t, 1);
  // gravity along the arm, velocity along the track
  const d = Math.hypot(s.x - p.x, s.y - p.y), ux = (s.x - p.x) / d, uy = (s.y - p.y) / d;
  withAlpha(seg(t, 33.0, 33.8), () => {
    const side = uy > 0 ? 1 : -1, ox = -uy * 18 * side, oy = ux * 18 * side;
    arrow(p.x + ux * 20 + ox, p.y + uy * 20 + oy, p.x + ux * 96 + ox, p.y + uy * 96 + oy, C.copper, 5);
    font(700, 24, DISPLAY); text('GRAVITY', p.x + ux * 58 + ox * 3.2, p.y + uy * 58 + oy * 3.2 + 8, { color: C.copper, align: 'center' });
  });
  withAlpha(seg(t, 37.0, 37.8), () => {
    font(400, 24); text('pull along the arm', 790, 170, { color: C.copper, align: 'right' });
    font(700, 26); text('= steady sweep of area', 790, 202, { color: C.brassLight, align: 'right' });
  });
}
function sceneD(t, st) {
  const { p, e } = st;
  withAlpha(seg(t, 42.0, 42.8), () => {
    font(700, 24, DISPLAY); text('ECCENTRICITY', 56, 140, { color: C.brassLight });
    font(700, 40); text(e.toFixed(e < 0.1 ? 4 : 2), 56, 184, { color: C.cream });
    font(400, 22); text(t > 45 ? 'Earth’s real orbit' : 'stretched diagram', 56, 214, { color: C.creamSoft });
  });
  withAlpha(seg(t, 45.8, 46.6), () => {
    const plate = (cx, cy, w, l1, l2, col) => {
      k.rrect(cx - w / 2, cy - 34, w, 68, 12); ctx.fillStyle = 'rgba(6,12,32,0.9)'; ctx.fill(); ctx.strokeStyle = C.brass; ctx.lineWidth = 1.5; ctx.stroke();
      font(700, 22, DISPLAY); text(l1, cx, cy - 4, { color: col, align: 'center' });
      font(400, 22); text(l2, cx, cy + 22, { color: C.creamSoft, align: 'center' });
    };
    plate(300, 380, 176, 'EARLY JAN.', 'closest', C.brassLight);
    plate(644, 500, 176, 'EARLY JULY', 'farthest', C.steel);
    dial(p.rel, 1, { label: 'km/s', lo: V_APH, hi: V_PERI, f: (p.kms - Number(V_APH)) / (Number(V_PERI) - Number(V_APH)), readout: p.kms.toFixed(1) });
  });
}
function sceneE(t) {
  const a = eout(seg(t, 51.5, 52.4));
  withAlpha(a, () => {
    ctx.fillStyle = 'rgba(4,8,22,0.72)'; ctx.fillRect(0, 0, W, 770);
    k.rrect(132, 290, 600, 300, 18);
    const g = ctx.createLinearGradient(0, 290, 0, 590); g.addColorStop(0, '#2A1E0C'); g.addColorStop(1, '#140E05');
    ctx.fillStyle = g; ctx.fill(); brassStroke(3);
    k.rrect(146, 304, 572, 272, 12); ctx.strokeStyle = 'rgba(214,165,74,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
    font(700, 40, DISPLAY); text('EQUAL AREAS', 432, 378, { color: C.brassLight, align: 'center', spacing: '2px' });
    text('IN EQUAL TIMES', 432, 428, { color: C.brassLight, align: 'center', spacing: '2px' });
    font(400, 28); text('Kepler’s second law, Astronomia nova, 1609', 432, 488, { align: 'center' });
    font(400, 22); text('Wikipedia · Kepler’s laws of planetary motion', 432, 540, { color: C.creamSoft, align: 'center' });
  });
}

// ---------- captions ----------
const CAP = { size: 46, lh: 56, weight: 700, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 840, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.cream, marks: { '*': C.brassLight, '~': C.steel } });
  }
}

Kit.scene({
  width: W, height: H, duration: 56.5,
  fonts: [
    { family: DISPLAY, file: 'Cinzel.woff2', weight: '400 900' },
    { family: TEXT, file: 'Cardo-Regular.woff2', weight: '400' },
    { family: TEXT, file: 'Cardo-Bold.woff2', weight: '700' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintBackground();
    ctx.drawImage(bg, 0, 0);
    const st = orrery(t);
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t, st));
    }
    header();
    captions(t);
  },
});
