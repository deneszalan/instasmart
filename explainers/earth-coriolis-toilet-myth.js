// Explainer for earth-coriolis-toilet-myth: Earth's spin steers storms but not your toilet.
// Look: a TV weather map, then a bathroom. A deep-navy chart with a globe in ocean blues, white
// isobars, red L symbols and white cyclone spirals; then a close-up of glossy teal tiles with white
// porcelain bowls and a lab basin. Libre Franklin for captions, IBM Plex Mono for map labels.
//
// Scene plan (63.5 s). Captions centred at y = 846; key drawings end above y = 780.
//  A  0.0–10.2  Hook. A globe with two lows: the northern spiral turns anticlockwise, the southern one
//               clockwise. "So does your toilet flush the other way in Australia?"
//  B  9.9–20.6  Why storms spin: on a flat chart, air heading for the low bends right (northern
//               hemisphere), and the inflow curls round anticlockwise. Particle paths are integrated.
//  C 20.3–38.8  Scale. The Coriolis parameter f ≈ 10⁻⁴ s⁻¹ (mid-latitudes): an inertial circle of
//               radius U/f and period 2π/f, computed: 10 m/s → 100 km and about 17 h; 10 cm/s water →
//               1 km. A sink about 0.5 m across is 1/2000 of that radius.
//  D 38.5–49.4  Bathroom tiles: two identical bowls, "north" and "south", swirl the same way.
//  E 49.1–63.5  Shapiro's 1962 basin (2 m across, settled at least 24 h, a small wooden cross over the
//               plug, 20 minutes to drain, turning only after about 15): anticlockwise. Sydney tests:
//               clockwise.
//
// Facts (Wikipedia, "Coriolis force"): moving objects are deflected to the right of their travel in the
// Northern Hemisphere, to the left in the Southern; low-pressure systems rotate anticlockwise in the
// north and clockwise in the south; f has a mid-latitude value of about 10⁻⁴ s⁻¹; a 10 m/s flow gives
// an inertial circle of radius 100 km with a period of about 17 hours, a 10 cm/s current 1 km; bathtubs
// and toilets do not drain in opposite directions in the two hemispheres; identical toilets flushed in
// both hemispheres drain the same way, mostly set by the bowl's shape; Shapiro (MIT, 1962): basin about
// 2 m across, a small wooden cross above the plug hole, at least 24 hours to settle, 20 minutes to drain,
// the cross turning only after about 15 minutes, a consistent anticlockwise vortex; Trefethen reported
// clockwise rotation at the University of Sydney in five tests.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  navy0: '#05101F', navy1: '#0A1D36', ocean0: '#0E5A86', ocean1: '#073452', grid: 'rgba(190,225,255,0.16)',
  isobar: 'rgba(255,255,255,0.42)', cloud: '#F4F8FC', low: '#FF5A5F', high: '#5CB8FF', amber: '#FFC44D', cyan: '#62D6FF',
  ink: '#F2F7FC', inkSoft: 'rgba(242,247,252,0.72)', tile: '#14505C', tile2: '#186070', grout: '#0A2C33',
  porcelain: '#F3F6F7', water: '#7FCDE3', wood: '#C8894A',
};
const TEXT = 'Libre Franklin', MONO = 'IBM Plex Mono';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);
const piece = (t, pts) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], eio(seg(t, pts[i - 1][0], pts[i][0])));
  return pts.at(-1)[1];
};

// ---------- the physics: inertial circles ----------
const F_COR = 1e-4; // Coriolis parameter at mid-latitudes, s⁻¹ (the source's "about 10⁻⁴")
const radiusM = (u) => u / F_COR;
const PERIOD_H = (2 * Math.PI) / F_COR / 3600; // ≈ 17.5 h
const R_WIND_KM = radiusM(10) / 1000; // 100 km
const R_WATER_KM = radiusM(0.1) / 1000; // 1 km
const SINK_M = 0.5;
const SINK_SHARE = Math.round(radiusM(0.1) / SINK_M); // 2000

// ---------- timeline ----------
const T = { A: [0, 10.2], B: [9.9, 20.6], C: [20.3, 38.8], D: [38.5, 49.4], E: [49.1, 63.5] };
const CUES = [
  [0.5, 5.0, 'Big storms spin ~anticlockwise~ north of the equator, *clockwise* south.'],
  [5.1, 9.9, 'So does your toilet flush the other way in Australia?'],
  [10.3, 15.5, 'Earth’s spin nudges moving air to the *right* in the north, left in the south.'],
  [15.6, 20.4, 'Air pulled into a low bends, and curls round it ~anticlockwise~.'],
  [20.8, 24.8, 'But the nudge is tiny: it needs *size* and *time*.'],
  [24.9, 30.4, `It would curve a 10 m/s wind round a circle *${R_WIND_KM} km* in radius, in ~${Math.round(PERIOD_H)} hours~.`],
  [30.5, 34.9, `Water at 10 cm/s would need a circle *${R_WATER_KM} km* in radius.`],
  [35.0, 38.6, 'A sink is about ~half a metre~ across.'],
  [39.0, 44.8, 'So in a toilet or basin, its shape and how the water got in decide the swirl.'],
  [44.9, 49.0, 'Identical toilets flush the *same way* in both hemispheres.'],
  [49.5, 54.1, 'In 1962, Ascher Shapiro let a *2 m* basin settle for at least a day…'],
  [54.2, 58.4, '…then drained it. About 15 minutes in, it turned ~anticlockwise~.'],
  [58.5, 63.3, 'Tests in Sydney turned *clockwise*. The effect is real, just tiny.'],
];

// ---------- backgrounds, painted once ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
let mapBg = null, tileBg = null;
function paint() {
  mapBg = document.createElement('canvas'); mapBg.width = W; mapBg.height = H;
  let g = mapBg.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 400, 80, W / 2, 420, 760);
  rg.addColorStop(0, C.navy1); rg.addColorStop(1, C.navy0);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(120,170,230,0.07)'; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y <= H; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }

  tileBg = document.createElement('canvas'); tileBg.width = W; tileBg.height = H;
  g = tileBg.getContext('2d');
  g.fillStyle = C.grout; g.fillRect(0, 0, W, H);
  const S = 108, rnd = mulberry32(17);
  for (let y = -S / 2; y < H; y += S) for (let x = -S / 3; x < W; x += S) {
    const tg = g.createLinearGradient(x, y, x + S, y + S);
    const c = rnd() < 0.5 ? C.tile : C.tile2;
    tg.addColorStop(0, c); tg.addColorStop(1, '#0F3F49');
    g.fillStyle = tg; g.beginPath(); g.roundRect(x + 3, y + 3, S - 6, S - 6, 6); g.fill();
    const sh = g.createLinearGradient(x, y, x + S * 0.6, y + S * 0.6);
    sh.addColorStop(0, 'rgba(255,255,255,0.10)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sh; g.beginPath(); g.roundRect(x + 3, y + 3, S - 6, S - 6, 6); g.fill();
  }
  const vg = g.createRadialGradient(W / 2, 420, 200, W / 2, 460, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,10,14,0.7)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // a dark band behind the captions
  const cb = g.createLinearGradient(0, 760, 0, 940);
  cb.addColorStop(0, 'rgba(3,16,20,0)'); cb.addColorStop(0.35, 'rgba(3,16,20,0.75)'); cb.addColorStop(1, 'rgba(3,16,20,0.85)');
  g.fillStyle = cb; g.fillRect(0, 760, W, H - 760);
}

// ---------- weather-map pieces ----------
/** A cyclone: spiral cloud arms; dir = -1 turns anticlockwise on screen, +1 clockwise. */
function cyclone(x, y, R, t, dir, a = 1) {
  withAlpha(a, () => {
    const spin = dir * t * 0.9;
    ctx.save(); ctx.translate(x, y);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    glow.addColorStop(0, 'rgba(255,255,255,0.55)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    for (let arm = 0; arm < 3; arm++) {
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const u = i / 60, r = lerp(R * 0.12, R, u);
        // going outward the arm turns against the rotation, so inflow spirals in with it
        const ang = spin + arm * (Math.PI * 2 / 3) - dir * 2.4 * Math.log(r / (R * 0.12));
        const px = Math.cos(ang) * r, py = Math.sin(ang) * r;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.strokeStyle = 'rgba(244,248,252,0.85)'; ctx.lineWidth = R * 0.11; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.fillStyle = C.navy1; ctx.beginPath(); ctx.arc(0, 0, R * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // turning arrow around it
    arcArrow(x, y, R + 18, dir, t, dir < 0 ? C.amber : C.cyan);
  });
}
function arcArrow(x, y, r, dir, t, color, s = -Math.PI * 0.85) {
  const len = 1.6, e = s + len * dir;
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r, Math.min(s, e), Math.max(s, e)); ctx.stroke();
  const tip = e, tx = x + Math.cos(tip) * r, ty = y + Math.sin(tip) * r;
  const tang = tip + dir * Math.PI / 2;
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(tx + Math.cos(tang) * 16, ty + Math.sin(tang) * 16);
  ctx.lineTo(tx + Math.cos(tang + 2.4) * 12, ty + Math.sin(tang + 2.4) * 12);
  ctx.lineTo(tx + Math.cos(tang - 2.4) * 12, ty + Math.sin(tang - 2.4) * 12);
  ctx.closePath(); ctx.fill();
}
function lowSymbol(x, y, size = 40) {
  font(700, size, MONO); text('L', x, y + 2, { color: C.low, align: 'center', base: 'middle' });
}

const GX = 432, GY = 410, GR = 300;
function globe(t, a) {
  withAlpha(a, () => {
    const og = ctx.createRadialGradient(GX - 90, GY - 110, 30, GX, GY, GR);
    og.addColorStop(0, C.ocean0); og.addColorStop(1, C.ocean1);
    ctx.fillStyle = og; ctx.beginPath(); ctx.arc(GX, GY, GR, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(GX, GY, GR, 0, Math.PI * 2); ctx.clip();
    // graticule: parallels (orthographic, tilted slightly) and meridians that drift with the spin
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1.5;
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = GY - GR * Math.sin((lat * Math.PI) / 180), rx = GR * Math.cos((lat * Math.PI) / 180);
      ctx.beginPath(); ctx.ellipse(GX, y, rx, rx * 0.08, 0, 0, Math.PI * 2); ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const lon = ((i * 30 + t * 6) % 360) * Math.PI / 180;
      const rx = GR * Math.sin(lon);
      if (Math.cos(lon) < 0) continue;
      ctx.beginPath(); ctx.ellipse(GX, GY, Math.abs(rx), GR, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // isobars around each low
    for (const [x, y] of [[GX - 70, GY - 150], [GX + 80, GY + 160]]) {
      ctx.strokeStyle = C.isobar; ctx.lineWidth = 2;
      for (let r = 120; r <= 200; r += 40) { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.75, 0.3, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.restore();
    // equator
    ctx.save(); ctx.setLineDash([12, 8]); ctx.strokeStyle = C.amber; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(GX, GY, GR, GR * 0.08, 0, 0, Math.PI); ctx.stroke(); ctx.restore();
    font(600, 22, MONO); text('EQUATOR', GX + GR - 6, GY + 44, { color: C.amber, align: 'right', base: 'middle' });
    // rim light
    const rim = ctx.createRadialGradient(GX, GY, GR * 0.85, GX, GY, GR * 1.06);
    rim.addColorStop(0, 'rgba(120,200,255,0)'); rim.addColorStop(1, 'rgba(120,200,255,0.25)');
    ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(GX, GY, GR * 1.06, 0, Math.PI * 2); ctx.fill();
  });
}

// ---------- scenes ----------
function sceneA(t) {
  const on = eout(seg(t, 0.1, 1.2));
  globe(t, on);
  cyclone(GX - 70, GY - 150, 92, t, -1, eout(seg(t, 0.8, 1.8)));
  cyclone(GX + 80, GY + 160, 92, t, 1, eout(seg(t, 1.4, 2.4)));
  withAlpha(eout(seg(t, 1.8, 2.6)), () => {
    lowSymbol(GX - 70, GY - 150, 34); lowSymbol(GX + 80, GY + 160, 34);
    font(600, 24, MONO);
    text('NORTH', GX + 50, GY - 196, { color: C.amber, base: 'middle' });
    text('anticlockwise', GX + 50, GY - 166, { color: C.ink, base: 'middle' });
    text('SOUTH', GX - 40, GY + 196, { color: C.cyan, align: 'right', base: 'middle' });
    text('clockwise', GX - 40, GY + 226, { color: C.ink, align: 'right', base: 'middle' });
  });
}

// Flat chart around a northern low: inflow paths bend right and curl anticlockwise.
const LX = 432, LY = 430;
function inflowPath(k0, u) {
  // start radius 330 at angle a0; spiral inward with the angle turning anticlockwise on screen
  const a0 = (k0 / 8) * Math.PI * 2 + 0.2;
  const r = lerp(300, 56, u);
  const ang = a0 - 1.9 * Math.pow(u, 1.25);
  return [LX + Math.cos(ang) * r, LY + Math.sin(ang) * r * 0.92];
}
function sceneB(t) {
  // isobars
  ctx.strokeStyle = C.isobar; ctx.lineWidth = 2;
  for (let r = 80; r <= 280; r += 50) { ctx.beginPath(); ctx.ellipse(LX, LY, r, r * 0.92, 0, 0, Math.PI * 2); ctx.stroke(); }
  font(500, 22, MONO);
  [996, 1000, 1004, 1008, 1012].forEach((p, i) => text(`${p}`, LX + 6, LY - (80 + i * 50) * 0.92 - 12, { color: C.inkSoft, align: 'center', base: 'middle' }));
  lowSymbol(LX, LY, 64);
  font(600, 22, MONO); text('NORTHERN HEMISPHERE · LOW PRESSURE', 64, 132, { color: C.inkSoft, base: 'middle' });
  // one arrow first: where it aims vs where it goes
  const one = span(t, 10.4, 15.8, 0.4, 0.4);
  withAlpha(one, () => {
    const [sx, sy] = inflowPath(2, 0);
    ctx.save(); ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(242,247,252,0.6)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(LX, LY); ctx.stroke(); ctx.restore();
    const u = eio(seg(t, 11.0, 14.2)) * 0.62;
    pathArrow(2, 0, u, C.amber, 5);
    withAlpha(seg(t, 12.6, 13.4), () => { font(600, 24, MONO); text('BENDS RIGHT', sx + 150, sy - 40, { color: C.amber, base: 'middle' }); });
  });
  // all eight inflows, looping
  const all = eout(seg(t, 15.6, 16.6));
  withAlpha(all, () => {
    for (let i = 0; i < 8; i++) {
      const ph = ((t - 15.6) * 0.32 + i * 0.13) % 1;
      pathArrow(i, Math.max(0, ph - 0.35), ph, C.cloud, 4, ph < 0.1 ? ph / 0.1 : ph > 0.85 ? (1 - ph) / 0.15 : 1);
    }
    arcArrow(LX, LY, 120, -1, t, C.amber);
  });
}
function pathArrow(i, u0, u1, color, w, a = 1) {
  if (u1 <= u0 + 0.01) return;
  withAlpha(a, () => {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let s = 0; s <= 30; s++) { const [x, y] = inflowPath(i, lerp(u0, u1, s / 30)); s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    const [x1, y1] = inflowPath(i, u1), [x0, y0] = inflowPath(i, Math.max(0, u1 - 0.02));
    const ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x1 + Math.cos(ang) * 14, y1 + Math.sin(ang) * 14);
    ctx.lineTo(x1 + Math.cos(ang + 2.5) * 12, y1 + Math.sin(ang + 2.5) * 12);
    ctx.lineTo(x1 + Math.cos(ang - 2.5) * 12, y1 + Math.sin(ang - 2.5) * 12);
    ctx.closePath(); ctx.fill();
  });
}

function sceneC(t) {
  const cx = 432, cy = 420, R = 240;
  const water = eio(seg(t, 30.4, 31.4)); // relabel: wind → water
  // the "nudge is tiny" beat: a long thin arrow
  withAlpha(span(t, 20.6, 25.0, 0.4, 0.4), () => {
    font(600, 26, MONO);
    text('Coriolis parameter', cx, 300, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(700, 64, MONO); text('f ≈ 0.0001 /s', cx, 380, { color: C.ink, align: 'center', base: 'middle' });
    font(500, 24, MONO); text('at mid-latitudes', cx, 440, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
  const circ = eout(seg(t, 25.0, 26.0));
  withAlpha(circ, () => {
    // the inertial circle
    ctx.save(); ctx.setLineDash([6, 8]); ctx.strokeStyle = 'rgba(242,247,252,0.5)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    // traced lap: one lap per 17.5 h of simulated time, shown in 4 s
    const lap = clamp((t - 26.0) / 4.0);
    ctx.strokeStyle = water > 0.5 ? C.cyan : C.amber; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI / 2, Math.PI / 2 - lap * Math.PI * 2, true); ctx.stroke();
    const a = Math.PI / 2 - lap * Math.PI * 2;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 10, 0, Math.PI * 2); ctx.fill();
    // radius bar
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
    for (const x of [cx, cx + R]) { ctx.beginPath(); ctx.moveTo(x, cy - 10); ctx.lineTo(x, cy + 10); ctx.stroke(); }
    font(700, 34, MONO);
    withAlpha(1 - water, () => text(`${R_WIND_KM} km`, cx + R / 2, cy - 26, { color: C.amber, align: 'center', base: 'middle' }));
    withAlpha(water, () => text(`${R_WATER_KM} km`, cx + R / 2, cy - 26, { color: C.cyan, align: 'center', base: 'middle' }));
    // readouts at the top
    font(600, 24, MONO);
    withAlpha(1 - water, () => text('WIND · 10 m/s', 64, 132, { color: C.amber, base: 'middle' }));
    withAlpha(water, () => text('WATER · 10 cm/s', 64, 132, { color: C.cyan, base: 'middle' }));
    const hours = lap * PERIOD_H;
    text(`one lap: ${lap >= 1 ? '≈ ' : ''}${Math.round(hours)} h`, 64, 166, { color: C.inkSoft, base: 'middle' });
    // the sink: a speck at the centre, shown in a magnifier
    const sink = eout(seg(t, 35.0, 35.8));
    withAlpha(sink, () => {
      const mx = 640, my = 640, mr = 84;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(mx - mr * 0.7, my - mr * 0.7); ctx.stroke();
      ctx.fillStyle = 'rgba(5,16,31,0.95)'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = C.porcelain; ctx.beginPath(); ctx.ellipse(mx, my, 40, 30, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.water; ctx.beginPath(); ctx.ellipse(mx, my, 30, 21, 0, 0, Math.PI * 2); ctx.fill();
      font(600, 22, MONO); text(`sink ≈ ${SINK_M} m`, mx, my + mr + 24, { color: C.ink, align: 'center', base: 'middle' });
      text(`1/${SINK_SHARE.toLocaleString('en-US')} of that radius`, mx, my + mr + 52, { color: C.inkSoft, align: 'center', base: 'middle' });
    });
  });
}

// ---------- bathroom ----------
/** A toilet bowl seen from above, water swirling; dir = -1 anticlockwise, +1 clockwise on screen. */
function bowl(x, y, s, t, dir, label, labelColor) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(6, 14, 150, 190, 0, 0, Math.PI * 2); ctx.fill();
  const pg = ctx.createRadialGradient(-50, -70, 20, 0, 0, 200);
  pg.addColorStop(0, '#FFFFFF'); pg.addColorStop(1, '#C9D4DA');
  ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(0, 0, 150, 190, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#DDE5EA'; ctx.beginPath(); ctx.ellipse(0, 10, 112, 148, 0, 0, Math.PI * 2); ctx.fill();
  const wg = ctx.createRadialGradient(0, 30, 10, 0, 30, 110);
  wg.addColorStop(0, '#3D9BB8'); wg.addColorStop(1, C.water);
  ctx.fillStyle = wg; ctx.beginPath(); ctx.ellipse(0, 30, 84, 106, 0, 0, Math.PI * 2); ctx.fill();
  // swirl lines
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 30, 84, 106, 0, 0, Math.PI * 2); ctx.clip();
  for (let arm = 0; arm < 4; arm++) {
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const u = i / 40, r = lerp(8, 100, u);
      const ang = dir * t * 2.2 + arm * Math.PI / 2 - dir * 2.0 * Math.log(r / 8);
      const px = Math.cos(ang) * r * 0.82, py = 30 + Math.sin(ang) * r;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#1F5D70'; ctx.beginPath(); ctx.ellipse(0, 30, 16, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  arcArrow(x, y + 30 * s, 150 * s + 26, dir, t, labelColor);
  font(700, 26, MONO); text(label, x, y - 190 * s - 46, { color: labelColor, align: 'center', base: 'middle' });
}
function sceneD(t) {
  const s = 0.82;
  bowl(232, 430, s, t, 1, 'NORTH', C.amber);
  bowl(632, 430, s, t, 1, 'SOUTH', C.cyan);
  withAlpha(eout(seg(t, 45.0, 45.8)), () => {
    font(700, 30, MONO); text('same bowl · same swirl', W / 2, 700, { color: C.ink, align: 'center', base: 'middle' });
  });
}

// Shapiro's basin: a small wooden cross over the plug hole, 20 min to drain, turning after ~15.
const DRAIN = [54.2, 58.2]; // the 20 minutes, in scene seconds
function crossAngle(t, dir, start) {
  // the cross is still until about 15 of 20 minutes, then speeds up
  const u = seg(t, start, start + (DRAIN[1] - DRAIN[0]));
  const after = Math.max(0, u - 0.75) / 0.25;
  return dir * (after * after * 2.2 + Math.max(0, t - (start + DRAIN[1] - DRAIN[0])) * 2.6);
}
function basin(x, y, R, t, dir, start, label, color, water) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(x + 6, y + 10, R + 14, 0, Math.PI * 2); ctx.fill();
  const bg = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, 10, x, y, R + 14);
  bg.addColorStop(0, '#E9EEF1'); bg.addColorStop(1, '#9FB0B9');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y, R + 14, 0, Math.PI * 2); ctx.fill();
  const wr = R * (0.35 + 0.65 * water);
  const wg = ctx.createRadialGradient(x, y, 4, x, y, R);
  wg.addColorStop(0, '#2E8AA8'); wg.addColorStop(1, '#8ED6EA');
  ctx.fillStyle = '#C3CFD5'; ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(x, y, wr, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1D4D5D'; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
  // the wooden cross
  ctx.save(); ctx.translate(x, y); ctx.rotate(crossAngle(t, dir, start));
  ctx.fillStyle = C.wood; ctx.strokeStyle = '#6E4320'; ctx.lineWidth = 2;
  for (const r of [0, Math.PI / 2]) { ctx.save(); ctx.rotate(r); k.rrect(-R * 0.34, -5, R * 0.68, 10, 3); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(R * 0.34 - 6, 0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  font(700, 26, MONO); text(label, x, y - R - 44, { color, align: 'center', base: 'middle' });
}
function sceneE(t) {
  const sydney = eio(seg(t, 58.4, 59.4));
  const mx = lerp(432, 250, sydney), my = 410, R = lerp(170, 130, sydney);
  const water = 1 - seg(t, DRAIN[0], DRAIN[1]) * 0.85;
  basin(mx, my, R, t, -1, DRAIN[0], 'MIT · 1962', C.amber, water);
  withAlpha(span(t, 49.6, 58.6, 0.5, 0.4), () => {
    font(600, 24, MONO);
    text('2 m across · settled ≥ 24 h', W / 2, 650, { color: C.ink, align: 'center', base: 'middle' });
    text('small wooden cross over the plug', W / 2, 686, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
  // drain clock: 0 → 20 minutes
  withAlpha(span(t, DRAIN[0] - 0.3, 58.6, 0.3, 0.4), () => {
    const min = 20 * seg(t, DRAIN[0], DRAIN[1]);
    font(700, 30, MONO); text(`drain: minute ${Math.floor(min)}`, W / 2, 140, { color: min >= 15 ? C.amber : C.ink, align: 'center', base: 'middle' });
  });
  withAlpha(sydney, () => {
    const sx = 614, sR = 130;
    const sWater = 1 - seg(t, 59.4, 62.4) * 0.85;
    basin(sx, my, sR, t, 1, 59.4 - 3.0, 'SYDNEY', C.cyan, sWater);
    arcArrow(mx, my, R + 34, -1, t, C.amber);
    arcArrow(sx, my, sR + 34, 1, t, C.cyan, -Math.PI * 0.15);
    font(600, 24, MONO);
    text('anticlockwise', mx, my + R + 70, { color: C.amber, align: 'center', base: 'middle' });
    text('clockwise', sx, my + sR + 70, { color: C.cyan, align: 'center', base: 'middle' });
  });
  withAlpha(eout(seg(t, 60.0, 60.8)), () => {
    font(500, 22); text('Source: Wikipedia, “Coriolis force” · circles computed with f = 0.0001/s', W / 2, 918, { color: 'rgba(242,247,252,0.62)', align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 43, lh: 55, weight: 650, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 846, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.cyan, '~': C.amber } });
  }
}

Kit.scene({
  width: W, height: H, duration: 63.5,
  fonts: [
    { family: TEXT, file: 'LibreFranklin.woff2', weight: '400 800' },
    { family: MONO, file: 'IBMPlexMono-Regular.woff2', weight: '400' },
    { family: MONO, file: 'IBMPlexMono-SemiBold.woff2', weight: '600' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!mapBg) paint();
    ctx.drawImage(mapBg, 0, 0);
    // the bathroom tiles fade in under scenes D and E
    withAlpha(eio(seg(t, 38.5, 39.3)), () => ctx.drawImage(tileBg, 0, 0));
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    font(700, 22, MONO); text('RECKON', 64, 84, { color: C.amber, spacing: '2px' });
    const rw = ctx.measureText('RECKON').width + 14;
    font(600, 22, MONO); text('EARTH · WEATHER', 64 + rw + 16, 84, { color: C.inkSoft, spacing: '1px' });
    captions(t);
  },
});
