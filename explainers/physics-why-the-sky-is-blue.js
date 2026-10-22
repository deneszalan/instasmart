// Explainer for physics-why-the-sky-is-blue: air scatters blue about 6 times more than red.
// Look: a day passing over dark hills. The sky runs dawn → noon → sunset; sunlight is drawn as
// coloured wave packets (longer wiggles for redder light) that bounce off tiny air molecules.
// Fraunces for display, Outfit for captions and labels.
//
// Scene plan (64 s scene → about 85 s clip). Captions centred at y = 830 on the dark hills.
//  A  0.0– 8.8  Hook. The sun rises at dawn; its white light fans out into five coloured waves
//               (700, 580, 530, 450, 400 nm). "So why does the daytime sky look blue?"
//  B  8.6–22.4  Demonstration. Air molecules appear; wave packets stream from the sun. At each
//               molecule they pass close to, a packet may bounce off in a new direction, with a
//               chance that grows as 1/λ⁴ (simulated below with a fixed seed). Blue and violet
//               bounce most, red mostly flies straight on; the sky turns noon blue. An eye on the
//               hill receives scattered blue from all directions.
//  C 22.2–35.9  The rule. Bars of (700/λ)⁴, computed here: red 1, yellow 2.1, green 3.0,
//               blue 5.9 (≈ 6×), violet 9.4 (≈ 9×). "So why no violet sky?"
//  D 35.7–49.6  Why not violet (hedged, "partly"): sunlight holds less violet, our eyes are less
//               sensitive to it; the mix looks like blue blended with white: sky blue.
//  E 49.4–59.6  Sunset. Diagram of the curved Earth and an (exaggerated) air layer: the low
//               Sun's light crosses far more air than at noon; blue, violet and green packets are
//               scattered out on the way, orange and red arrive.
//  F 59.4–64.0  Payoff card.
//
// Facts: Wikipedia "Rayleigh scattering": scattering is inversely proportional to the fourth
// power of the wavelength, off oxygen and nitrogen molecules; blue and violet light comes from all
// regions of the sky; the eye responds to the mix as if it were blue and white light; at sunset
// the blue and violet have been scattered out of the direct path. The "why not violet" hedge
// follows the Physics FAQ "Why is the sky blue?" (P. Gibbs): "part of the answer" is less violet
// in sunlight, and "our eyes are less sensitive to violet". Sunset path: Wikipedia "Sunset".
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const DISPLAY = 'Fraunces', TEXT = 'Outfit';

const C = {
  cream: '#FFF8EE', creamSoft: 'rgba(255,248,238,0.78)', ink: '#0B1128',
  blue: '#8FD0FF', violet: '#CDA8FF', orange: '#FFB36B',
};
// The five colours of the demo, with their wavelengths and drawing colours.
const COLS = [
  { nm: 700, name: 'red', col: '#FF5D4F' },
  { nm: 580, name: 'yellow', col: '#FFE15A' },
  { nm: 530, name: 'green', col: '#62E07E' },
  { nm: 450, name: 'blue', col: '#46A8FF' },
  { nm: 400, name: 'violet', col: '#A879FF' },
];
for (const c of COLS) c.rel = Math.pow(700 / c.nm, 4); // scattering relative to red, ∝ 1/λ⁴
const BLUE_X = COLS[3].rel, VIOLET_X = COLS[4].rel; // 5.86 and 9.38
const BLUE_R = Math.round(BLUE_X), VIOLET_R = Math.round(VIOLET_X); // "about 6", "about 9"

const CUES = [
  [0.5, 4.3, 'Sunlight holds every colour of the rainbow.'],
  [4.5, 8.6, 'So why does the daytime sky look *blue*?'],
  [8.9, 13.1, 'Air molecules can knock light off in a new direction.'],
  [13.3, 17.5, '*Blue* waves get scattered far more often than ^red^ ones.'],
  [17.7, 22.1, 'So scattered blue reaches your eyes from all over the sky.'],
  [22.5, 27.1, 'The rule: scattering goes as *1 ÷ wavelength to the 4th power*.'],
  [27.3, 32.1, `Blue (450 nm) scatters about *${BLUE_R} times* more than red (700 nm).`],
  [32.3, 36.6, `Violet scatters about ~${VIOLET_R} times~ more. So why no violet sky?`],
  [36.8, 40.8, 'Partly because sunlight holds less ~violet~ to begin with.'],
  [41.0, 45.4, 'And our eyes are less sensitive to ~violet~ than to *blue*.'],
  [45.6, 50.2, 'The mix we see looks like blue blended with white: *sky blue*.'],
  [50.6, 54.8, 'At sunset, sunlight crosses far more air to reach you.'],
  [55.0, 60.2, 'Most of the blue is scattered out on the way, leaving ^orange and red^.'],
  [60.6, 64.6, 'One kind of scattering paints both.'],
];
const T = { A: [0, 8.8], B: [8.6, 22.4], C: [22.2, 36.7], D: [36.5, 50.4], E: [50.2, 60.4], F: [60.2, 65] };

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.cream, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);
/** Text over the open sky gets a soft dark halo so it stays readable on bright skies. */
const label = (s, x, y, opts = {}) => { ctx.save(); ctx.shadowColor = 'rgba(4,8,30,0.85)'; ctx.shadowBlur = 10; text(s, x, y, opts); text(s, x, y, opts); ctx.restore(); };

// ---------- colour helpers ----------
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, x) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], x))).join(',')})`; };
const mix3 = (a, b, x) => a.map((c, i) => [c, b[i]]).map(([p, q]) => mixHex(p, q, x));
function mixHex(a, b, x) { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], x)).toString(16).padStart(2, '0')).join(''); }

// Sky palettes: top, middle, horizon.
const SKY = {
  night: ['#070A1E', '#151A3C', '#2E2448'],
  dawn: ['#1E2452', '#6E4C86', '#F2A06E'],
  noon: ['#1A4C98', '#3D86D2', '#BFE2F6'],
  sunset: ['#1A2150', '#86385E', '#F27B3A'],
};
function skyAt(t) {
  let p = mix3(SKY.night, SKY.dawn, eio(seg(t, 0, 3.2)));
  p = mix3(p, SKY.noon, eio(seg(t, 10, 20)));
  p = mix3(p, SKY.sunset, eio(seg(t, 50.4, 57)));
  return p;
}

// ---------- the simulation: packets of light and air molecules (fixed seed) ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const SUN = { x: 150, y: 250 };
const MOL = [];
{
  const rnd = mulberry32(11);
  for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 8; gx++) {
    const x = 215 + gx * 76 + (rnd() - 0.5) * 48, y = 150 + gy * 74 + (rnd() - 0.5) * 44;
    if (x > 730 && y < 150) continue;
    MOL.push({ x, y, a: rnd() * Math.PI, w: (rnd() - 0.5) * 0.8, ph: rnd() * 6 });
  }
}
const SPEED = 270;
const PK = [];
{
  const rnd = mulberry32(7);
  const n = 105;
  for (let i = 0; i < n; i++) {
    const c = i % 5;
    const e = 9.6 + (11.2 * i) / n + rnd() * 0.08;
    const ang = (10 + (rnd() - 0.5) * 22) * Math.PI / 180;
    const ux = Math.cos(ang), uy = Math.sin(ang);
    // Molecules within 20 px of the path, in order along it; at each, scatter with chance ∝ 1/λ⁴.
    const q = Math.min(0.9, 0.055 * COLS[c].rel);
    const near = MOL.map((m, j) => {
      const dx = m.x - SUN.x, dy = m.y - SUN.y, s = dx * ux + dy * uy, d = Math.abs(-dx * uy + dy * ux);
      return { j, s, d };
    }).filter((o) => o.d < 20 && o.s > 70).sort((a, b) => a.s - b.s);
    let hit = null;
    for (const o of near) if (rnd() < q) { hit = o; break; }
    const out = rnd() * Math.PI * 2;
    PK.push({ c, e, ux, uy, hit, vx: Math.cos(out), vy: Math.sin(out), ph: rnd() * 6 });
  }
}
function packetPos(p, t) {
  const age = t - p.e;
  if (age < 0) return null;
  const d = age * SPEED;
  if (!p.hit || d < p.hit.s) return { x: SUN.x + p.ux * d, y: SUN.y + p.uy * d, ux: p.ux, uy: p.uy, scattered: false };
  const bx = SUN.x + p.ux * p.hit.s, by = SUN.y + p.uy * p.hit.s, d2 = d - p.hit.s;
  return { x: bx + p.vx * d2, y: by + p.vy * d2, ux: p.vx, uy: p.vy, scattered: true, bx, by, since: d2 / SPEED };
}

// ---------- drawing pieces ----------
/** A wave packet: a few wiggles under a soft envelope; redder light has longer wiggles. */
function packet(x, y, ux, uy, c, t, a = 1, len = 58) {
  const wl = (COLS[c].nm / 700) * 19, amp = 6.5, nx = -uy, ny = ux;
  withAlpha(a, () => {
    ctx.beginPath();
    for (let i = 0; i <= 32; i++) {
      const s = -len / 2 + (len * i) / 32;
      const env = Math.pow(Math.cos((Math.PI * s) / len), 2);
      const off = amp * env * Math.sin((2 * Math.PI * s) / wl - t * 14);
      const px = x + ux * s + nx * off, py = y + uy * s + ny * off;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(6,12,40,0.55)'; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = COLS[c].col; ctx.lineWidth = 3.4;
    ctx.shadowColor = COLS[c].col; ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
}
function molecule(m, t, flash = 0) {
  const a = m.a + t * m.w, dx = Math.cos(a) * 6, dy = Math.sin(a) * 6;
  const jx = Math.sin(t * 1.7 + m.ph) * 2, jy = Math.cos(t * 1.3 + m.ph) * 2;
  if (flash > 0) {
    withAlpha(flash, () => {
      const g = ctx.createRadialGradient(m.x + jx, m.y + jy, 0, m.x + jx, m.y + jy, 34);
      g.addColorStop(0, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x + jx, m.y + jy, 34, 0, Math.PI * 2); ctx.fill();
    });
  }
  ctx.fillStyle = 'rgba(240,246,255,0.9)'; ctx.strokeStyle = 'rgba(10,22,70,0.45)'; ctx.lineWidth = 1.5;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(m.x + jx + s * dx, m.y + jy + s * dy, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(240,246,255,0.6)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(m.x + jx - dx, m.y + jy - dy); ctx.lineTo(m.x + jx + dx, m.y + jy + dy); ctx.stroke();
}
function sun(x, y, r, core, glow, a = 1) {
  withAlpha(a, () => {
    const g = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 4.2);
    g.addColorStop(0, glow); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  });
}
function eye(x, y, s = 1, iris = C.blue) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(0, -30, 34, 0); ctx.quadraticCurveTo(0, 30, -34, 0); ctx.closePath();
  ctx.fillStyle = '#F4F1EA'; ctx.fill(); ctx.strokeStyle = '#0B1128'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0B1128'; ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- background: sky, stars, hills ----------
let starCanvas = null;
function stars() {
  starCanvas = document.createElement('canvas'); starCanvas.width = W; starCanvas.height = 700;
  const g = starCanvas.getContext('2d'), rnd = mulberry32(3);
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.6})`; g.beginPath(); g.arc(rnd() * W, rnd() * 640, 0.6 + rnd() * 1.3, 0, Math.PI * 2); g.fill(); }
}
function hillY(x, layer) {
  return layer === 0
    ? 690 + 26 * Math.sin(x / 140 + 0.6) + 14 * Math.sin(x / 61 + 2)
    : 748 + 18 * Math.sin(x / 190 + 2.2) + 9 * Math.sin(x / 47);
}
function background(t) {
  const [top, mid, hor] = skyAt(t);
  const g = ctx.createLinearGradient(0, 0, 0, 760);
  g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, hor);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (!starCanvas) stars();
  withAlpha(1 - seg(t, 0.5, 3.5), () => ctx.drawImage(starCanvas, 0, 0));
  // grain, so the gradient does not band
  return { top, mid, hor };
}
function hills(t, a = 1) {
  withAlpha(a, () => {
    const back = mixHex(skyAt(t)[0], '#0B1128', 0.55);
    for (const [layer, col] of [[0, back], [1, '#090E22']]) {
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 12) ctx.lineTo(x, hillY(x, layer));
      ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    }
    const lg = ctx.createLinearGradient(0, 760, 0, H);
    lg.addColorStop(0, 'rgba(5,8,22,0)'); lg.addColorStop(1, 'rgba(5,8,22,0.85)');
    ctx.fillStyle = lg; ctx.fillRect(0, 760, W, H - 760);
  });
}
function header(t) {
  font(600, 22, DISPLAY); text('RECKON', 56, 74, { color: C.cream, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 18;
  font(500, 22); text('·  PHYSICS  ·  LIGHT', 56 + w + 12, 74, { color: C.creamSoft, spacing: '2px' });
}

// ---------- scenes ----------
function sunNow(t) {
  const rise = eout(seg(t, 0.1, 2.2));
  return { x: SUN.x, y: lerp(770, SUN.y, rise) };
}
function sunColours(t) {
  const n = eio(seg(t, 10, 20));
  return { core: mixHex('#FFD9A0', '#FFFBEA', n), glow: n > 0.5 ? 'rgba(255,250,225,0.55)' : 'rgba(255,215,160,0.55)' };
}

function sceneA(t) {
  // white light fans out into five waves
  const o = { x: 290, y: 410 };
  const grow = eio(seg(t, 2.0, 3.8));
  withAlpha(seg(t, 1.7, 2.1), () => {
    ctx.strokeStyle = 'rgba(255,252,240,0.9)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = 16;
    const sn = sunNow(t), b = eout(seg(t, 1.7, 2.3));
    ctx.beginPath(); ctx.moveTo(sn.x + 24, sn.y + 26); ctx.lineTo(lerp(sn.x + 24, o.x, b), lerp(sn.y + 26, o.y, b)); ctx.stroke();
    ctx.shadowBlur = 0;
  });
  COLS.forEach((c, i) => {
    const ey = 300 + i * 56, ex = 640;
    const len = Math.hypot(ex - o.x, ey - o.y), ux = (ex - o.x) / len, uy = (ey - o.y) / len;
    const shown = len * grow;
    if (shown < 4) return;
    const wl = (c.nm / 700) * 30, nx = -uy, ny = ux;
    ctx.beginPath();
    for (let s = 0; s <= shown; s += 2) {
      const env = Math.min(1, s / 40);
      const off = 9 * env * Math.sin((2 * Math.PI * s) / wl - t * 9);
      const px = o.x + ux * s + nx * off, py = o.y + uy * s + ny * off;
      if (s) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.strokeStyle = c.col; ctx.lineWidth = 3.6; ctx.shadowColor = c.col; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
    withAlpha(seg(t, 3.0 + i * 0.15, 3.6 + i * 0.15), () => {
      font(600, 26); label(c.name, ex + 22, ey + 2, { color: c.col, base: 'middle' });
      font(400, 22); label(`${c.nm} nm`, ex + 22, ey + 26, { color: C.cream, base: 'middle' });
    });
  });
  withAlpha(seg(t, 3.9, 4.5), () => { font(500, 24); label('shorter waves look bluer', 640, 610, { color: C.cream, align: 'right' }); });
}

function sceneB(t) {
  const flashes = new Map();
  for (const p of PK) {
    const q = packetPos(p, t);
    if (!q) continue;
    if (q.scattered && q.since < 0.6) flashes.set(p.hit.j, Math.max(flashes.get(p.hit.j) ?? 0, 1 - q.since / 0.6));
  }
  withAlpha(seg(t, 8.8, 9.8), () => MOL.forEach((m, j) => molecule(m, t, flashes.get(j) ?? 0)));
  withAlpha(seg(t, 9.2, 9.8) * (1 - seg(t, 12.2, 13)), () => {
    font(500, 24); label('air molecules: nitrogen and oxygen', 432, 746, { color: C.cream, align: 'center' });
  });
  for (const p of PK) {
    const q = packetPos(p, t);
    if (!q) continue;
    if (q.x < -60 || q.x > W + 60 || q.y < -60 || q.y > 780) continue;
    const a = seg(t, p.e, p.e + 0.25) * (q.y > 700 ? 1 - seg(q.y, 700, 760) : 1);
    packet(q.x, q.y, q.ux, q.uy, p.c, t + p.ph, a);
  }
  // the eye on the hill receives scattered blue from all directions
  const ea = span(t, 17.4, 22.6, 0.5, 0.4);
  if (ea > 0) {
    const ex = 680, ey = 742;
    withAlpha(ea, () => {
      const from = [[300, 210], [520, 160], [700, 250], [420, 420], [800, 470], [250, 560]];
      from.forEach(([fx, fy], i) => {
        const len = Math.hypot(ex - fx, ey - fy), ux = (ex - fx) / len, uy = (ey - fy) / len;
        ctx.setLineDash([6, 10]); ctx.strokeStyle = 'rgba(160,215,255,0.55)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(ex - ux * 40, ey - uy * 40); ctx.stroke(); ctx.setLineDash([]);
        const f = ((t - 17.4) * 0.55 + i * 0.17) % 1;
        packet(lerp(fx, ex - ux * 40, f), lerp(fy, ey - uy * 40, f), ux, uy, 3, t, Math.min(1, f * 5, (1 - f) * 5), 44);
      });
      eye(ex, ey, 1.1);
    });
  }
}

// Bar chart card (C) that turns into the "what we see" card (D).
const CARD = { x: 84, y: 150, w: 696, h: 520 };
function card(a, fn) {
  withAlpha(a, () => {
    k.rrect(CARD.x, CARD.y, CARD.w, CARD.h, 28);
    ctx.fillStyle = 'rgba(8,16,46,0.8)'; ctx.fill();
    ctx.strokeStyle = 'rgba(190,225,255,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    fn();
  });
}
const BASE = 580, MAXH = 270, BW = 82;
const barX = (i) => CARD.x + 92 + i * 128;
function bars(t, { dimOthers = 0, focus = [], violetDim = 0, collapse = 0 }) {
  COLS.forEach((c, i) => {
    const grow = eio(seg(t, 23.0 + i * 0.4, 24.4 + i * 0.4));
    const h = (c.rel / VIOLET_X) * MAXH * grow;
    let a = focus.length && !focus.includes(i) ? 1 - dimOthers * 0.7 : 1;
    if (i === 4) a *= 1 - violetDim;
    const x = barX(i);
    withAlpha(a * (1 - collapse), () => {
      const g = ctx.createLinearGradient(0, BASE - h, 0, BASE);
      g.addColorStop(0, c.col); g.addColorStop(1, mixHex(c.col, '#0B1128', 0.45));
      k.rrect(x - BW / 2, BASE - h, BW, Math.max(h, 2), [10, 10, 2, 2]); ctx.fillStyle = g; ctx.fill();
      withAlpha(seg(grow, 0.7, 1), () => {
        font(700, 28); text(`${c.rel < 10 ? c.rel.toFixed(1).replace('.0', '') : Math.round(c.rel)}×`, x, BASE - h - 16, { color: C.cream, align: 'center' });
      });
      font(500, 22); text(`${c.nm} nm`, x, BASE + 34, { color: C.creamSoft, align: 'center' });
      font(600, 22); text(c.name, x, BASE + 60, { color: c.col, align: 'center' });
    });
  });
}
function sceneC(t) {
  card(1, () => {
    font(600, 34, DISPLAY); text('How strongly air scatters each colour', 432, 206, { align: 'center' });
    font(400, 24); text('relative to red, from 1 ÷ wavelength to the 4th power', 432, 244, { color: C.creamSoft, align: 'center' });
    const f7 = span(t, 27.3, 32.3, 0.5, 0.4), f8 = seg(t, 32.3, 32.9);
    bars(t, { dimOthers: Math.max(f7, f8), focus: f8 > 0 ? [4] : [0, 3] });
    // ≈ 6× bracket from red to blue
    withAlpha(f7, () => {
      const y = 346, x0 = barX(0), x1 = barX(3);
      ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(x0, BASE - (1 / VIOLET_X) * MAXH - 56); ctx.lineTo(x0, y); ctx.lineTo(x1 - 50, y); ctx.stroke();
      font(700, 38); text(`about ${BLUE_R}×`, (x0 + x1 - 50) / 2, y - 16, { color: C.blue, align: 'center' });
    });
    withAlpha(f8, () => {
      font(700, 38); text(`about ${VIOLET_R}×`, barX(4) - 150, 340, { color: C.violet, align: 'center' });
    });
  });
}
function sceneD(t) {
  const v1 = eio(seg(t, 37.0, 38.2)), v2 = eio(seg(t, 41.2, 42.4)), col = eio(seg(t, 45.7, 47.0));
  card(1, () => {
    withAlpha(1 - col, () => {
      font(600, 34, DISPLAY); text('Why the sky isn’t violet', 432, 206, { align: 'center' });
      font(400, 24); text('scattering is only part of the story', 432, 244, { color: C.creamSoft, align: 'center' });
      bars(t, { violetDim: 0.45 * v1 + 0.35 * v2 });
      // notes above the violet bar
      const tip = { x: barX(4) - 50, y: 370 };
      withAlpha(v1, () => {
        sun(160, 312, 13, '#FFFBEA', 'rgba(255,250,225,0.45)');
        font(600, 26); text('less violet in sunlight', 190, 321, { color: C.violet });
      });
      withAlpha(v2, () => {
        eye(160, 372, 0.55, C.violet);
        font(600, 26); text('eyes less sensitive to it', 190, 381, { color: C.violet });
      });
      withAlpha(v1, () => {
        ctx.strokeStyle = 'rgba(205,168,255,0.7)'; ctx.lineWidth = 2.5; ctx.setLineDash([5, 7]);
        ctx.beginPath(); ctx.moveTo(470, 340); ctx.quadraticCurveTo(560, 330, tip.x, tip.y); ctx.stroke(); ctx.setLineDash([]);
      });
    });
    withAlpha(col, () => {
      font(600, 34, DISPLAY); text('What we see', 432, 206, { align: 'center' });
      const y = 420, r = 70;
      const c1 = { x: 222, c: '#3E8EF0' }, c2 = { x: 432, c: '#F6F8FF' }, c3 = { x: 642, c: '#9CCBF2' };
      for (const [cc, label] of [[c1, 'blue'], [c2, 'white'], [c3, 'sky blue']]) {
        const g = ctx.createRadialGradient(cc.x - 20, y - 20, 10, cc.x, y, r);
        g.addColorStop(0, mixHex(cc.c, '#FFFFFF', 0.25)); g.addColorStop(1, cc.c);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cc.x, y, r * eout(seg(t, 46.0, 47.2)), 0, Math.PI * 2); ctx.fill();
        font(600, 26); text(label, cc.x, y + r + 44, { color: C.cream, align: 'center' });
      }
      font(300, 64); text('+', 327, y + 2, { align: 'center', base: 'middle' }); text('=', 537, y + 2, { align: 'center', base: 'middle' });
    });
  });
}

// Sunset diagram: a curved Earth with an exaggerated air layer.
const EARTH = { x: 600, y: 3100, r: 2400, air: 2600 };
const OBS = { x: 600, y: 700 };
const SS = [];
{
  const rnd = mulberry32(21);
  for (let i = 0; i < 46; i++) {
    const c = i % 5;
    const e = 50.8 + (8.4 * i) / 46;
    const q = Math.min(0.95, 0.13 * COLS[c].rel);
    const out = rnd() < q ? 40 + rnd() * 500 : null;
    const dir = (rnd() < 0.75 ? 1 : -1) * (0.45 + rnd() * 0.9); // upward mostly; a few scatter down
    SS.push({ c, e, out, dir, dy: (rnd() - 0.5) * 22 });
  }
}
function earth() {
  ctx.save();
  const ag = ctx.createRadialGradient(EARTH.x, EARTH.y, EARTH.r, EARTH.x, EARTH.y, EARTH.air);
  ag.addColorStop(0, 'rgba(255,214,170,0.42)'); ag.addColorStop(1, 'rgba(255,214,170,0.08)');
  ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(EARTH.x, EARTH.y, EARTH.air, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,190,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([8, 10]); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#0A0F25'; ctx.beginPath(); ctx.arc(EARTH.x, EARTH.y, EARTH.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,200,160,0.5)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
}
function sceneE(t) {
  font(500, 22); label('air layer (thickness exaggerated)', 56, 530, { color: C.cream });
  // noon: the Sun overhead and its short path
  withAlpha(0.85, () => {
    sun(OBS.x, 330, 22, '#FFFBEA', 'rgba(255,250,225,0.35)');
    ctx.strokeStyle = 'rgba(255,250,225,0.7)'; ctx.lineWidth = 3; ctx.setLineDash([4, 9]);
    ctx.beginPath(); ctx.moveTo(OBS.x, 372); ctx.lineTo(OBS.x, OBS.y - 34); ctx.stroke(); ctx.setLineDash([]);
    font(600, 24); label('noon:', OBS.x - 24, 560, { align: 'right' });
    font(400, 24); label('short path', OBS.x - 24, 588, { align: 'right' });
  });
  // sunset: the low Sun at the left edge and its long path through the air
  const lowA = seg(t, 50.6, 51.4);
  withAlpha(lowA, () => {
    sun(-8, OBS.y - 6, 30, '#FFB061', 'rgba(255,150,80,0.6)');
    ctx.strokeStyle = 'rgba(255,190,130,0.55)'; ctx.lineWidth = 3; ctx.setLineDash([4, 9]);
    ctx.beginPath(); ctx.moveTo(30, OBS.y - 4); ctx.lineTo(OBS.x - 40, OBS.y - 4); ctx.stroke(); ctx.setLineDash([]);
    font(700, 24); label('sunset:', 64, 664, { color: C.orange });
    font(400, 24); label('long path through air', 158, 664, { color: C.cream });
  });
  // packets along the long path
  for (const p of SS) {
    const age = t - p.e; if (age < 0) continue;
    const d = age * 250, x0 = 10;
    let x, y, ux = 1, uy = 0, a = seg(age, 0, 0.2);
    if (p.out === null || d < p.out) { x = x0 + d; y = OBS.y - 4 + p.dy; if (x > OBS.x - 46) continue; }
    else {
      const d2 = d - p.out;
      ux = Math.cos(p.dir); uy = -Math.sin(p.dir);
      x = x0 + p.out + ux * d2; y = OBS.y - 4 + p.dy + uy * d2;
      a *= (1 - seg(d2, 120, 260)) * (1 - seg(y, OBS.y + 4, OBS.y + 24));
    }
    packet(x, y, ux, uy, p.c, t + p.c, a, 50);
  }
  // what arrives
  const arrived = SS.filter((p) => (p.out === null) && (t - p.e) * 250 > OBS.x - 56);
  const warm = clamp(arrived.length / 8);
  eye(OBS.x, OBS.y - 4, 0.9, mixHex('#8FD0FF', '#FF9A4A', warm));
}
function sceneF(t) {
  const a = eout(seg(t, 60.3, 61.2));
  withAlpha(a, () => {
    k.rrect(112, 250, 640, 330, 30); ctx.fillStyle = 'rgba(10,14,40,0.74)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,210,170,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    font(600, 58, DISPLAY);
    text('Blue sky,', 432, 336, { color: C.blue, align: 'center' });
    text('red sunset', 432, 404, { color: C.orange, align: 'center' });
    font(400, 28); text(`Air scatters blue light about ${BLUE_R}× more than red`, 432, 470, { align: 'center' });
    font(500, 22); text('Rayleigh scattering  ·  Wikipedia', 432, 530, { color: C.creamSoft, align: 'center', spacing: '1px' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 600, maxW: 740 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~^]/g, '')).width);
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
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.cream, marks: { '*': C.blue, '~': C.violet, '^': C.orange } });
  }
}

Kit.scene({
  width: W, height: H, duration: 65,
  fonts: [
    { family: DISPLAY, file: 'Fraunces.woff2', weight: '100 900' },
    { family: TEXT, file: 'Outfit.woff2', weight: '100 900' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const s = sunNow(t), sc = sunColours(t);
    const sunA = 1 - seg(t, 22.2, 23.0);
    sun(s.x, s.y, 34, sc.core, sc.glow, sunA);
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E], [sceneF, T.F, 0.35, 0]];
    withAlpha(seg(t, 49.9, 50.5), earth);
    hills(t, 1 - seg(t, 50.4, 51.0));
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    // keep the caption band dark in every scene
    const lg = ctx.createLinearGradient(0, 760, 0, 930);
    lg.addColorStop(0, 'rgba(6,9,26,0)'); lg.addColorStop(0.4, 'rgba(6,9,26,0.35)'); lg.addColorStop(1, 'rgba(6,9,26,0.5)');
    ctx.fillStyle = lg; ctx.fillRect(0, 760, W, 320);
    header(t);
    captions(t);
  },
});
