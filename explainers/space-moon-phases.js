// Explainer for space-moon-phases: phases show how much of the Moon's sunlit half faces us.
// Look: charcoal paper with grain and fibres, a silver Moon, white rays of sunlight sweeping in
// from the left. Cormorant Garamond for display, Jost for captions and labels.
//
// Scene plan (60.5 s scene → about 81 s clip). Captions centred at y = 836.
//  A  0.0–12.8  Hook. A big silver crescent. "Why does the Moon change shape every month?" / the
//               myth: Earth's shadow covers part of it (a shadow disc slides over, stamped MYTH) /
//               "Not so: Earth's shadow on the Moon makes a lunar eclipse."
//  B 12.6–21.8  Top view (a diagram, not to scale): sunlight from the left always lights half the
//               Moon; an inset shows the Moon as seen from Earth (northern hemisphere).
//  C 21.6–38.6  One orbit, eased so the Moon lingers at new, first quarter, full, last quarter.
//               The inset's lit shape is computed from the angle θ between Moon and Sun as seen
//               from Earth: lit fraction (1 − cos θ)/2, lit on the right while waxing.
//  D 38.4–52.0  Eclipses: Earth's shadow points away from the Sun; a full moon in it is eclipsed;
//               a side view shows the tilted orbit (tilt exaggerated) carrying the Moon above it.
//  E 51.8–56.2  A 30-day calendar of phases, from θ = 360° × day / 29.53: about 29.5 days.
//  F 56.0–60.5  Payoff card.
//
// Facts (Wikipedia, "Lunar phase"): the visible side is sunlit to varying extents depending on
// the Moon's position in its orbit; a lit hemisphere seen from an angle gives the phase shapes;
// "The phases are not caused by the Earth's shadow falling on the Moon, as some people believe";
// eclipses can happen only at new (solar) or full (lunar) moon, and not every month, because the
// Moon's orbit is tilted about five degrees to Earth's; in the northern hemisphere the right side
// waxes; the lunar month averages about 29.5 days (synodic month 29.53059 days).
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const DISPLAY = 'Cormorant Garamond', TEXT = 'Jost';

const C = {
  paper: '#1B1B1F', paperLight: '#2A2A30', silver: '#DCDDE2', silverDark: '#8E9098', night: '#34353C',
  cream: '#EEECE6', creamSoft: 'rgba(238,236,230,0.72)', gold: '#F2D58A', copper: '#E8957A', earth: '#7FA8D8',
};
const SYNODIC = 29.53059;

const CUES = [
  [0.5, 4.2, 'Why does the Moon change shape every month?'],
  [4.4, 8.4, 'A common guess: Earth’s shadow covers part of it.'],
  [8.6, 12.6, 'No: Earth’s shadow on the Moon is a lunar ~eclipse~.'],
  [12.8, 16.8, 'Seen from above: sunlight always lights *half* the Moon.'],
  [17.0, 21.6, 'As it orbits, we see more or less of that lit half.'],
  [21.8, 25.6, '*New moon*: the lit half faces away from us.'],
  [25.8, 29.8, '*First quarter*: we see half of the lit half.'],
  [30.0, 34.0, '*Full moon*: the whole lit half faces us.'],
  [34.2, 38.4, '*Last quarter*, then it shrinks back to new.'],
  [38.6, 42.4, 'Earth’s shadow points away from the Sun.'],
  [42.6, 47.2, 'When a full moon slips into it, we see a lunar ~eclipse~.'],
  [47.4, 51.8, 'Most months, the Moon’s tilted orbit carries it past the shadow.'],
  [52.0, 55.8, `One cycle of phases takes about *${SYNODIC.toFixed(1)} days*.`],
  [56.2, 60.2, 'Phases: how much of the *sunlit half* faces us.'],
];
const T = { A: [0, 12.8], B: [12.6, 21.6], C: [21.6, 38.6], D: [38.6, 52.0], E: [51.8, 56.2], F: [56.0, 60.5] };

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.cream, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- paper ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
let paper = null;
function paintPaper() {
  paper = document.createElement('canvas'); paper.width = W; paper.height = H;
  const g = paper.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 430, 60, W / 2, 470, 780);
  rad.addColorStop(0, '#26262B'); rad.addColorStop(1, '#121215');
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(9);
  // soft mottling instead of pixel grain, so the clip stays small
  for (let i = 0; i < 70; i++) {
    const x = rnd() * W, y = rnd() * H, r = 40 + rnd() * 140, l = rnd() < 0.5 ? '255,255,255' : '0,0,0';
    const mg = g.createRadialGradient(x, y, 0, x, y, r);
    mg.addColorStop(0, `rgba(${l},${0.025 + rnd() * 0.03})`); mg.addColorStop(1, `rgba(${l},0)`);
    g.fillStyle = mg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  // charcoal fibres
  for (let i = 0; i < 260; i++) {
    const x = rnd() * W, y = rnd() * H, a = rnd() * Math.PI, l = 8 + rnd() * 26;
    g.strokeStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '0,0,0'},${0.03 + rnd() * 0.05})`; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  const cb = g.createLinearGradient(0, 770, 0, H);
  cb.addColorStop(0, 'rgba(10,10,12,0)'); cb.addColorStop(0.4, 'rgba(10,10,12,0.5)'); cb.addColorStop(1, 'rgba(10,10,12,0.7)');
  g.fillStyle = cb; g.fillRect(0, 770, W, H - 770);
}
function header() {
  font(700, 26, DISPLAY); text('Reckon', 56, 70, { color: C.silver, spacing: '1px' });
  const w = ctx.measureText('Reckon').width;
  font(400, 22); text('·  SPACE  ·  THE MOON', 56 + w + 16, 70, { color: C.creamSoft, spacing: '2px' });
}

// ---------- bodies ----------
let craters = null;
function moonTexture(r) {
  const c = document.createElement('canvas'), s = 2 * r + 4; c.width = s; c.height = s;
  const g = c.getContext('2d'), rnd = mulberry32(4);
  const grad = g.createRadialGradient(r - r * 0.3, r - r * 0.35, r * 0.1, r + 2, r + 2, r);
  grad.addColorStop(0, '#F4F4F6'); grad.addColorStop(0.7, C.silver); grad.addColorStop(1, '#A9ABB2');
  g.fillStyle = grad; g.beginPath(); g.arc(r + 2, r + 2, r, 0, Math.PI * 2); g.fill();
  g.save(); g.clip();
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r * 0.9, cr = r * (0.04 + rnd() * 0.13);
    g.fillStyle = `rgba(110,112,122,${0.18 + rnd() * 0.22})`; g.beginPath(); g.arc(r + 2 + Math.cos(a) * d, r + 2 + Math.sin(a) * d, cr, 0, Math.PI * 2); g.fill();
  }
  // maria
  for (const [x, y, rr] of [[-0.25, -0.2, 0.32], [0.2, -0.3, 0.22], [0.05, 0.25, 0.26]]) {
    g.fillStyle = 'rgba(120,122,132,0.22)'; g.beginPath(); g.arc(r + 2 + x * r, r + 2 + y * r, rr * r, 0, Math.PI * 2); g.fill();
  }
  g.restore();
  return c;
}
const TEX = new Map();
function tex(r) { const key = Math.round(r); if (!TEX.has(key)) TEX.set(key, moonTexture(key)); return TEX.get(key); }

/** The Moon as we see it from Earth: θ = 0 new, π/2 first quarter, π full, 3π/2 last quarter. */
function phaseMoon(x, y, r, theta, { dim = 0, glow = 1 } = {}) {
  const th = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const kx = Math.cos(th), waxing = th <= Math.PI;
  // night side, faintly visible
  ctx.fillStyle = C.night; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(220,221,226,0.22)'; ctx.lineWidth = 1.5; ctx.stroke();
  // the lit part: the bright half-disc on the lit side, closed by the terminator (an ellipse)
  ctx.save();
  ctx.beginPath();
  const n = 48, side = waxing ? 1 : -1;
  for (let i = 0; i <= n; i++) { const f = -Math.PI / 2 + (Math.PI * i) / n; ctx.lineTo(x + side * r * Math.cos(f), y + r * Math.sin(f)); }
  for (let i = 0; i <= n; i++) { const f = Math.PI / 2 - (Math.PI * i) / n; ctx.lineTo(x + side * kx * r * Math.cos(f), y + r * Math.sin(f)); }
  ctx.closePath(); ctx.clip();
  ctx.drawImage(tex(r), x - r - 2, y - r - 2);
  if (dim) { ctx.fillStyle = `rgba(40,22,20,${dim})`; ctx.fillRect(x - r - 2, y - r - 2, 2 * r + 4, 2 * r + 4); }
  ctx.restore();
  if (glow) withAlpha(glow * 0.35 * (1 - dim) * (1 - Math.cos(th)) / 2, () => {
    const g = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.5);
    g.addColorStop(0, 'rgba(230,232,240,0.5)'); g.addColorStop(1, 'rgba(230,232,240,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, Math.PI * 2); ctx.fill();
  });
}
/** A body in the top view: sunlit half towards the Sun, which is off to the left. */
function topBody(x, y, r, lit, dark, rimFacing = null) {
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = lit; ctx.beginPath(); ctx.arc(x, y, r, Math.PI / 2, (3 * Math.PI) / 2); ctx.closePath(); ctx.fill();
  if (rimFacing !== null) {
    // the half that faces Earth, outlined
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(x, y, r + 5, rimFacing - Math.PI / 2, rimFacing + Math.PI / 2); ctx.stroke();
  }
}

// ---------- the top view ----------
const EARTH = { x: 440, y: 400, r: 44 }, ORBIT = 210, MOON_R = 28;
const INSET = { x: 120, y: 712, r: 68 };
/** θ through the orbit in C, eased so the Moon lingers at each quarter. */
function thetaAt(t) {
  if (t < 21.6) return lerp(-0.75, 0, eio(seg(t, 17.2, 21.3))); // B: a waning crescent drifts to new
  // C: the Moon dwells at each quarter while its caption is read, then moves on
  for (let i = KEYS.length - 1; i >= 0; i--) {
    const [t0, th0] = KEYS[i];
    if (t >= t0) { const nx = KEYS[i + 1]; return nx ? lerp(th0, nx[1], eio(seg(t, t0, nx[0]))) : th0; }
  }
  return 0;
}
const KEYS = [[21.6, 0], [24.0, 0], [25.9, Math.PI / 2], [28.4, Math.PI / 2], [30.2, Math.PI], [32.6, Math.PI], [34.4, 1.5 * Math.PI], [37.2, 1.5 * Math.PI], [38.6, 2 * Math.PI]];
const moonPos = (th) => ({ x: EARTH.x - ORBIT * Math.cos(th), y: EARTH.y + ORBIT * Math.sin(th) });

function rays(t, a, { shadow = 0 } = {}) {
  withAlpha(a, () => {
    for (let i = 0; i < 22; i++) {
      const y = 140 + i * 30 + ((i * 37) % 11);
      const speed = 220 + ((i * 53) % 90), len = 120 + ((i * 29) % 80);
      for (let j = 0; j < 3; j++) {
        const x = ((t * speed + j * 340 + i * 97) % 1100) - 160;
        const g = ctx.createLinearGradient(x, 0, x + len, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0.55)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
      }
    }
    // sunlight label and glow at the left edge
    const lg = ctx.createRadialGradient(-260, 420, 60, -260, 420, 520);
    lg.addColorStop(0, 'rgba(255,250,235,0.26)'); lg.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, 300, 900);
  });
}
function shadowCone(a) {
  withAlpha(a, () => {
    const g = ctx.createLinearGradient(EARTH.x, 0, EARTH.x + 520, 0);
    g.addColorStop(0, 'rgba(8,8,10,0.92)'); g.addColorStop(1, 'rgba(8,8,10,0.15)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(EARTH.x, EARTH.y - EARTH.r); ctx.lineTo(EARTH.x + 520, EARTH.y - EARTH.r * 0.35); ctx.lineTo(EARTH.x + 520, EARTH.y + EARTH.r * 0.35); ctx.lineTo(EARTH.x, EARTH.y + EARTH.r); ctx.closePath(); ctx.fill();
  });
}
function topView(t, { th, a = 1, shadow = 0, eclipse = 0 }) {
  withAlpha(a, () => {
    // the orbit, as a dotted pencil circle
    ctx.setLineDash([3, 9]); ctx.strokeStyle = 'rgba(238,236,230,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(EARTH.x, EARTH.y, ORBIT, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    shadowCone(shadow);
    topBody(EARTH.x, EARTH.y, EARTH.r, '#9CC0EA', '#22324A');
    font(500, 22); text('Earth', EARTH.x, EARTH.y + EARTH.r + 30, { color: C.creamSoft, align: 'center' });
    const m = moonPos(th);
    // line of sight from Earth
    ctx.strokeStyle = 'rgba(242,213,138,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
    const d = Math.hypot(m.x - EARTH.x, m.y - EARTH.y), ux = (m.x - EARTH.x) / d, uy = (m.y - EARTH.y) / d;
    ctx.beginPath(); ctx.moveTo(EARTH.x + ux * (EARTH.r + 8), EARTH.y + uy * (EARTH.r + 8)); ctx.lineTo(m.x - ux * (MOON_R + 10), m.y - uy * (MOON_R + 10)); ctx.stroke(); ctx.setLineDash([]);
    const facing = Math.atan2(EARTH.y - m.y, EARTH.x - m.x);
    topBody(m.x, m.y, MOON_R, mixHex('#E6E7EB', '#5A4642', eclipse), '#3A3B42', facing);
  });
}
function inset(t, th, a, { dim = 0 } = {}) {
  withAlpha(a, () => {
    ctx.fillStyle = 'rgba(12,12,15,0.85)'; ctx.beginPath(); ctx.arc(INSET.x, INSET.y, INSET.r + 18, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(242,213,138,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    phaseMoon(INSET.x, INSET.y, INSET.r, th, { dim });
    font(500, 24); text('as seen from Earth', INSET.x + INSET.r + 26, INSET.y - 16, { color: C.gold, align: 'left' });
  });
}
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mixHex(a, b, x) { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], x)).toString(16).padStart(2, '0')).join(''); }

// ---------- scenes ----------
function sceneA(t) {
  const x = 432, y = 410, r = 170;
  const th = lerp(0.6, Math.PI, eio(seg(t, 0.6, 4.2)));
  phaseMoon(x, y, r, th);
  // the myth: a round shadow sliding over the Moon
  const s = eio(seg(t, 4.6, 7.0));
  if (s > 0) {
    withAlpha(seg(t, 4.6, 5.2), () => {
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r + 1, 0, Math.PI * 2); ctx.clip();
      const sx = lerp(x + 560, x + 200, s), e = eio(seg(t, 9.0, 10.4));
      const g = ctx.createRadialGradient(sx, y, 150, sx, y, 260);
      g.addColorStop(0, `rgba(${Math.round(lerp(10, 70, e))},${Math.round(lerp(10, 30, e))},${Math.round(lerp(12, 26, e))},0.94)`); g.addColorStop(1, 'rgba(10,10,12,0.72)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, y, 260, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    withAlpha(seg(t, 6.6, 7.2), () => {
      ctx.save(); ctx.translate(x + 40, y + 228); ctx.rotate(-0.12);
      k.rrect(-110, -38, 220, 76, 10); ctx.strokeStyle = C.copper; ctx.lineWidth = 4; ctx.stroke();
      font(700, 50, DISPLAY); text('MYTH', 0, 16, { color: C.copper, align: 'center', spacing: '6px' });
      ctx.restore();
    });
  }
}
function sceneB(t) {
  const th = thetaAt(t), m = moonPos(th);
  rays(t, seg(t, 12.6, 13.6));
  topView(t, { th, a: 1 });
  withAlpha(seg(t, 13.6, 14.4), () => {
    font(600, 24); text('sunlight', 56, 128, { color: C.cream });
    font(400, 22); text('diagram, not to scale', 56, 156, { color: C.creamSoft });
  });
  withAlpha(seg(t, 13.8, 14.6) * (1 - seg(t, 16.8, 17.4)), () => {
    font(500, 24); text('lit half', m.x - MOON_R - 16, m.y + 8, { color: C.cream, align: 'right' });
  });
  withAlpha(seg(t, 17.0, 17.8) * (1 - seg(t, 20.9, 21.5)), () => {
    font(500, 24); text('half facing Earth', m.x + 10, m.y - 50, { color: C.gold, align: 'center' });
  });
  inset(t, th, seg(t, 17.4, 18.2));
}
const NAMES = [[0, 'new moon'], [0.5, 'first quarter'], [1, 'full moon'], [1.5, 'last quarter']];
function sceneC(t) {
  const th = thetaAt(t);
  rays(t, 1);
  topView(t, { th });
  inset(t, th, 1);
  // the phase name under the inset
  for (const [q, name] of NAMES) {
    withAlpha(1 - seg(Math.abs(th - q * Math.PI), 0.12, 0.4), () => {
      font(600, 34, DISPLAY); text(name, INSET.x + INSET.r + 26, INSET.y + 32, { color: C.cream });
    });
  }
}
function sceneD(t) {
  const side = eio(seg(t, 47.4, 48.4));
  const eclipse = eio(seg(t, 43.6, 45.0)) * (1 - side);
  withAlpha(1 - side, () => {
    rays(t, 1);
    const th = 2 * Math.PI + Math.PI * eio(seg(t, 38.6, 42.8));
    topView(t, { th, shadow: eio(seg(t, 38.6, 39.6)), eclipse });
    inset(t, th, 1, { dim: 0.78 * eclipse });
    withAlpha(seg(t, 39.2, 39.9), () => { font(500, 22); text('Earth’s shadow', 730, EARTH.y + 62, { color: C.creamSoft, align: 'center' }); });
    withAlpha(seg(t, 44.6, 45.4), () => { font(600, 34, DISPLAY); text('lunar eclipse', INSET.x + INSET.r + 26, INSET.y + 32, { color: C.copper }); });
  });
  withAlpha(side, () => sideView(t));
}
/** Side view: the Moon's orbit is tilted (exaggerated here), so it usually passes the shadow. */
function sideView(t) {
  const ex = 330, ey = 420, er = 44;
  rays(t, 0.8);
  // shadow, edge-on
  const g = ctx.createLinearGradient(ex, 0, ex + 520, 0);
  g.addColorStop(0, 'rgba(8,8,10,0.92)'); g.addColorStop(1, 'rgba(8,8,10,0.15)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ex, ey - er); ctx.lineTo(ex + 540, ey - er * 0.35); ctx.lineTo(ex + 540, ey + er * 0.35); ctx.lineTo(ex, ey + er); ctx.closePath(); ctx.fill();
  topBody(ex, ey, er, '#9CC0EA', '#22324A');
  // the tilted orbit, nearly edge-on
  const tilt = -0.2, rx = 300, ry = 46;
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(tilt);
  ctx.setLineDash([3, 9]); ctx.strokeStyle = 'rgba(238,236,230,0.45)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  // the Moon passing the far side, above the shadow
  const f = lerp(-0.55, 0.55, eio(seg(t, 47.8, 51.6)));
  const px = rx * Math.cos(f), py = ry * Math.sin(f);
  const mx = ex + px * Math.cos(tilt) - py * Math.sin(tilt), my = ey + px * Math.sin(tilt) + py * Math.cos(tilt);
  topBody(mx, my, MOON_R, '#E6E7EB', '#3A3B42');
  font(500, 22); text('side view · tilt exaggerated (really about 5°)', 432, 640, { color: C.creamSoft, align: 'center' });
  font(500, 22); text('Moon’s orbit', ex - 250, ey + 6, { color: C.cream, align: 'center' });
}
function sceneE(t) {
  const cols = 6, rows = 5, dx = 122, dy = 112, x0 = W / 2 - ((cols - 1) * dx) / 2, y0 = 196, r = 34;
  for (let d = 0; d < 30; d++) {
    const cx = x0 + (d % cols) * dx, cy = y0 + Math.floor(d / cols) * dy;
    const a = eout(seg(t, 52.0 + d * 0.06, 52.4 + d * 0.06));
    withAlpha(a, () => {
      phaseMoon(cx, cy, r, (2 * Math.PI * d) / SYNODIC, { glow: 0 });
      font(400, 22); text(`day ${d}`, cx, cy + r + 28, { color: C.creamSoft, align: 'center' });
    });
  }
}
function sceneF(t) {
  const a = eout(seg(t, 56.1, 57.0));
  withAlpha(a, () => {
    phaseMoon(432, 330, 110, Math.PI * 0.62);
    font(600, 44, DISPLAY); text('Phases: the sunlit half,', 432, 524, { align: 'center' });
    text('seen from an angle', 432, 572, { align: 'center' });
    font(400, 26); text('Earth’s shadow only makes eclipses', 432, 632, { color: C.copper, align: 'center' });
    font(400, 22); text('Wikipedia · Lunar phase', 432, 690, { color: C.creamSoft, align: 'center', spacing: '1px' });
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
    k.captions(t, [cue], { x: W / 2, y: 840, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.cream, marks: { '*': C.gold, '~': C.copper } });
  }
}

Kit.scene({
  width: W, height: H, duration: 60.5,
  fonts: [
    { family: DISPLAY, file: 'CormorantGaramond.woff2', weight: '300 700' },
    { family: TEXT, file: 'Jost.woff2', weight: '100 900' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!paper) paintPaper();
    ctx.drawImage(paper, 0, 0);
    const scenes = [[sceneA, T.A, 0.6], [sceneB, T.B, 0.35, 0], [sceneC, T.C, 0, 0], [sceneD, T.D, 0], [sceneE, T.E], [sceneF, T.F, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    header();
    captions(t);
  },
});
