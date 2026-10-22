// Explainer for earth-hailstones-grow-in-layers: a hailstone's rings record the cloud zones it rose through.
// Look: a storm-cloud cross-section at night. A towering cumulonimbus with an anvil in cold steel blues,
// a dashed freezing level, rising updraft chevrons, banded zones of supercooled droplets and of vapour,
// brief white lightning, and a magnified slice of the growing stone. Archivo for captions, Oswald for
// labels and numbers.
//
// Scene plan (64 s). Captions centred at y = 842; the cloud and inset end above y = 770.
//  A  0.0–9.6   Hook. A whole hailstone is sliced; the cut face shows clear and white rings.
//  B  9.3–24.0  The storm: a droplet rises in the updraft (up to 180 km/h); above the 0 °C line the
//               droplets stay liquid: supercooled.
//  C 23.7–43.8  Growth. The stone rises through five bands (droplets, vapour, droplets, vapour,
//               droplets); the inset adds a thick clear layer or a thin white one as it crosses each band,
//               computed from its height. White layers show trapped air bubbles. It rises until the
//               updraft can't hold it (at least 30 minutes).
//  D 43.5–53.6  Twist: the old idea of repeated up-and-down trips (dashed loop, struck out) versus newer
//               research: one trip through changing zones is enough.
//  E 53.3–64.0  It falls (8 cm stones at about 48 m/s). Record card at true scale: 20 cm across,
//               47.3 cm around, Vivian, South Dakota, 23 July 2010.
//
// Facts (Wikipedia, "Hail"): hail begins as water droplets that become supercooled and freeze on contact
// with nuclei; updrafts can reach 180 km/h (110 mph); as the stone ascends it passes into areas where
// humidity and supercooled droplets vary: many droplets give a translucent layer, mostly vapour a layer of
// opaque white ice; the layers are thick and translucent alternating with thin, white and opaque ones;
// rapid (dry) growth traps small air bubbles, making ice opaque, while in wet growth they escape; the
// stone rises until its mass can no longer be supported, which may take at least 30 minutes; the former
// theory of multiple descents and ascents "is not necessarily true": a single trajectory is sufficient to
// explain the layers; 8 cm stones fall at about 48 m/s; the largest by diameter: 20 cm (7.9 in), 47.3 cm
// circumference, Vivian, South Dakota, 23 July 2010.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky0: '#060D1C', sky1: '#0E1D38', sky2: '#1B3155', cloudHi: '#B9CBE2', cloudMid: '#6F86A8', cloudLo: '#2D3E5C',
  ice: '#EAF3FB', clear: 'rgba(150,195,235,0.55)', clearEdge: '#8FC3EE', drop: '#9FE1FF', white: '#FFFFFF',
  ink: '#EEF5FF', inkSoft: 'rgba(238,245,255,0.72)', cyan: '#7FD8FF', frost: '#CFE8FF', warn: '#FFB4A8', bolt: '#F4F8FF',
};
const TEXT = 'Archivo', NUM = 'Oswald';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the stone's layers (kind, thickness in big-slice px) ----------
const CORE = 30;
const LAYERS = [['clear', 34], ['white', 12], ['clear', 36], ['white', 13], ['clear', 40]];
const FULL_R = CORE + LAYERS.reduce((s, [, w]) => s + w, 0);

// ---------- the cloud and its zones ----------
const FREEZE_Y = 476, TOP_Y = 206, BASE_Y = 604, GROUND_Y = 772;
const BAND_H = (FREEZE_Y - TOP_Y) / LAYERS.length; // one band per layer
const bandTop = (i) => FREEZE_Y - (i + 1) * BAND_H;
const T = { A: [0, 9.6], B: [9.3, 24.0], C: [23.7, 43.8], D: [43.5, 53.6], E: [53.3, 64.0] };
const RISE = [24.4, 43.2];
/** The stone's height while it grows: steady climb from the freezing level to the top band. */
const stoneY = (t) => {
  if (t < 14.0) return lerp(BASE_Y + 20, BASE_Y - 10, eout(seg(t, 9.6, 14.0)));
  if (t < RISE[0]) return lerp(BASE_Y - 10, FREEZE_Y, eio(seg(t, 14.0, RISE[0])));
  if (t < 53.6) return lerp(FREEZE_Y, TOP_Y, seg(t, RISE[0], RISE[1]));
  return lerp(TOP_Y, GROUND_Y + 40, Math.pow(seg(t, 53.8, 56.8), 2));
};
const stoneX = (t) => 432 + 26 * Math.sin(t * 0.55) * eout(seg(t, 9.6, 12));
/** How much of layer i has formed (0..1) given the stone's height. */
const layerDone = (t, i) => (t >= 53.6 ? 1 : clamp((FREEZE_Y - stoneY(t) - i * BAND_H) / BAND_H));

let bgCanvas = null, cloudCanvas = null;
const PUFFS = [];
{
  const rnd = mulberry32(21);
  // anvil: kept below y = 125 so the top-right corner stays clear
  for (let i = 0; i < 70; i++) { const r = 26 + rnd() * 30; PUFFS.push([96 + rnd() * 660, 128 + r + rnd() * 40, r]); }
  // tower
  for (let i = 0; i < 110; i++) { const y = 200 + rnd() * 390; const half = 175 + (y - 200) * 0.18; PUFFS.push([432 + (rnd() * 2 - 1) * half, y, 34 + rnd() * 40]); }
  // base
  for (let i = 0; i < 40; i++) PUFFS.push([140 + rnd() * 580, 572 + rnd() * 30, 30 + rnd() * 26]);
}
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sky0); lg.addColorStop(0.55, C.sky1); lg.addColorStop(1, '#08101F');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(3);
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(200,220,255,${0.05 + rnd() * 0.2})`; g.beginPath(); g.arc(rnd() * W, rnd() * 130, 0.6 + rnd() * 1.2, 0, Math.PI * 2); g.fill(); }
  // ground
  const gg = g.createLinearGradient(0, GROUND_Y, 0, H);
  gg.addColorStop(0, '#13213A'); gg.addColorStop(1, '#070C17');
  g.fillStyle = gg; g.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  g.strokeStyle = 'rgba(160,190,230,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, GROUND_Y); g.lineTo(W, GROUND_Y); g.stroke();

  cloudCanvas = document.createElement('canvas'); cloudCanvas.width = W; cloudCanvas.height = H;
  // puffs are painted sharp on a scratch canvas, then blurred once onto the cloud layer
  const puffCanvas = document.createElement('canvas'); puffCanvas.width = W; puffCanvas.height = H;
  const c = puffCanvas.getContext('2d');
  for (const [x, y, r] of PUFFS) {
    const shade = clamp((y - 140) / 470);
    const rg = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    const hi = shade < 0.5 ? C.cloudHi : C.cloudMid;
    rg.addColorStop(0, hi); rg.addColorStop(0.7, shade < 0.5 ? C.cloudMid : C.cloudLo); rg.addColorStop(1, 'rgba(45,62,92,0)');
    c.fillStyle = rg; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  const cc = cloudCanvas.getContext('2d');
  cc.filter = 'blur(5px)'; cc.drawImage(puffCanvas, 0, 0); cc.filter = 'none';
  // the cut-away core: a darker panel where the zones are drawn
  cc.save();
  cc.beginPath(); cc.roundRect(232, TOP_Y - 10, 400, BASE_Y - TOP_Y + 6, 30); cc.clip();
  const cg = cc.createLinearGradient(0, TOP_Y, 0, BASE_Y);
  cg.addColorStop(0, 'rgba(24,40,72,0.88)'); cg.addColorStop(1, 'rgba(30,48,80,0.88)');
  cc.fillStyle = cg; cc.fillRect(0, 0, W, H);
  cc.restore();
}

function zones(t, a, labelsA) {
  withAlpha(a, () => {
    ctx.save(); ctx.beginPath(); ctx.roundRect(232, TOP_Y - 10, 400, BASE_Y - TOP_Y + 6, 30); ctx.clip();
    const rnd = mulberry32(9);
    LAYERS.forEach(([kind], i) => {
      const y0 = bandTop(i), y1 = y0 + BAND_H;
      if (kind === 'clear') {
        ctx.fillStyle = 'rgba(127,216,255,0.10)'; ctx.fillRect(232, y0, 400, BAND_H);
        for (let j = 0; j < 90; j++) {
          const x = 240 + rnd() * 384, y = y0 + rnd() * BAND_H, drift = (t * 6 + j * 7) % BAND_H;
          ctx.fillStyle = 'rgba(159,225,255,0.75)'; ctx.beginPath(); ctx.arc(x, y0 + ((y - y0 + drift) % BAND_H), 2.2, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        ctx.strokeStyle = 'rgba(220,235,255,0.22)'; ctx.lineWidth = 2;
        for (let j = 0; j < 5; j++) {
          const y = y0 + 10 + j * (BAND_H - 20) / 4, ph = rnd() * 6 + t * 0.4;
          ctx.beginPath();
          for (let x = 240; x <= 624; x += 8) { const yy = y + Math.sin(x * 0.03 + ph) * 4; if (x === 240) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
          ctx.stroke();
        }
      }
      ctx.strokeStyle = 'rgba(200,225,255,0.12)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(232, y1); ctx.lineTo(632, y1); ctx.stroke();
    });
    ctx.restore();
    // band labels on the left flank
    withAlpha(labelsA, () => LAYERS.forEach(([kind], i) => {
      const y = bandTop(i) + BAND_H / 2;
      font(500, 22, NUM);
      text(kind === 'clear' ? 'MANY DROPLETS' : 'MOSTLY VAPOUR', 222, y, { color: kind === 'clear' ? C.drop : C.frost, align: 'right', base: 'middle', spacing: '1px' });
    }));
  });
}

function freezingLine(a) {
  withAlpha(a, () => {
    ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(60, FREEZE_Y); ctx.lineTo(804, FREEZE_Y); ctx.stroke(); ctx.restore();
    font(500, 24, NUM); text('0 °C', 804, FREEZE_Y - 16, { color: C.cyan, align: 'right', base: 'middle' });
    font(500, 22, NUM); text('FREEZING LEVEL', 804, FREEZE_Y + 18, { color: C.inkSoft, align: 'right', base: 'middle' });
  });
}

function updraft(t, a) {
  withAlpha(a, () => {
    for (const cx of [330, 432, 534]) {
      for (let i = 0; i < 6; i++) {
        const y = BASE_Y - 10 - ((t * 55 + i * 70 + cx) % 400);
        const fade = clamp((BASE_Y - y) / 60) * clamp((y - TOP_Y + 10) / 60);
        ctx.strokeStyle = `rgba(230,242,255,${0.28 * fade})`; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx - 16, y + 12); ctx.lineTo(cx, y); ctx.lineTo(cx + 16, y + 12); ctx.stroke();
      }
    }
  });
}

/** Lightning: brief bolts at fixed times. */
const BOLTS = [[12.6, 150, 0], [21.2, 690, 1], [34.4, 170, 2], [47.0, 700, 3], [60.5, 620, 4]];
function lightning(t) {
  for (const [at, x0, seed] of BOLTS) {
    const a = span(t, at, at + 0.45, 0.06, 0.32);
    if (a <= 0) continue;
    const rnd = mulberry32(100 + seed);
    const pts = [[x0, 230]];
    while (pts.at(-1)[1] < GROUND_Y) { const [x, y] = pts.at(-1); pts.push([x + (rnd() - 0.5) * 60, y + 30 + rnd() * 40]); }
    withAlpha(a, () => {
      ctx.save(); ctx.fillStyle = 'rgba(200,220,255,0.10)'; ctx.fillRect(0, 0, W, GROUND_Y); ctx.restore();
      ctx.save(); ctx.shadowColor = '#BFD8FF'; ctx.shadowBlur = 22; ctx.strokeStyle = C.bolt; ctx.lineWidth = 4; ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
    });
  }
}

// ---------- the stone ----------
/** Cross-section of the stone at (x, y) and scale s, with layer completion done(i). */
function slice(x, y, s, done, { bubbles = 0 } = {}) {
  const radii = [];
  let r = CORE;
  for (let i = 0; i < LAYERS.length; i++) { r += LAYERS[i][1] * done(i); radii.push(r); }
  // each layer is a ring: clear ice is translucent, white ice opaque
  for (let i = LAYERS.length - 1; i >= 0; i--) {
    if (done(i) <= 0) continue;
    const [kind] = LAYERS[i];
    const R = radii[i] * s, r0 = (i ? radii[i - 1] : CORE) * s;
    if (kind === 'clear') {
      const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.35, R * 0.1, x, y, R);
      g.addColorStop(0, 'rgba(200,232,255,0.62)'); g.addColorStop(1, 'rgba(110,165,220,0.42)');
      ctx.fillStyle = g;
    } else ctx.fillStyle = C.ice;
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.arc(x, y, r0, 0, Math.PI * 2, true); ctx.fill();
    ctx.strokeStyle = kind === 'clear' ? 'rgba(220,240,255,0.55)' : 'rgba(150,180,210,0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = C.ice; ctx.beginPath(); ctx.arc(x, y, CORE * s, 0, Math.PI * 2); ctx.fill();
  // trapped air bubbles in the white layers (and the core)
  const rnd = mulberry32(31);
  for (let i = -1; i < LAYERS.length; i++) {
    if (i >= 0 && (LAYERS[i][0] !== 'white' || done(i) <= 0)) continue;
    const r0 = i < 0 ? 0 : (radii[i - 1] ?? CORE), r1 = i < 0 ? CORE : radii[i];
    const n = i < 0 ? 10 : 34;
    for (let j = 0; j < n; j++) {
      const a = rnd() * Math.PI * 2, rr = lerp(r0 + 2, r1 - 2, rnd());
      const px = x + Math.cos(a) * rr * s, py = y + Math.sin(a) * rr * s;
      ctx.fillStyle = `rgba(110,140,175,${0.45 + 0.5 * bubbles})`;
      ctx.beginPath(); ctx.arc(px, py, (1.3 + 1.6 * bubbles) * Math.max(s, 0.45), 0, Math.PI * 2); ctx.fill();
    }
  }
  return (radii.at(-1) ?? CORE) * s;
}

// ---------- scenes ----------
function sceneA(t) {
  const x = 432, y = 420, s = 1.1;
  const R = FULL_R * s;
  const cut = eio(seg(t, 1.4, 3.4)); // the knife sweeps down
  const cutY = lerp(y - R - 20, y + R + 20, cut);
  // whole stone below the cut: frosted, lumpy white
  ctx.save();
  ctx.beginPath(); ctx.rect(0, cutY, W, H); ctx.clip();
  const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.1, x, y, R * 1.05);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.6, '#D6E4F2'); g.addColorStop(1, '#8EA6C2');
  ctx.fillStyle = g; ctx.beginPath();
  for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2, rr = R * (1 + 0.035 * Math.sin(a * 7) + 0.02 * Math.sin(a * 13)); i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
  ctx.restore();
  // cut face above the knife
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, cutY); ctx.clip();
  slice(x, y, s, () => 1);
  ctx.restore();
  // knife line
  withAlpha(span(t, 1.3, 3.6, 0.2, 0.3), () => {
    ctx.save(); ctx.shadowColor = '#BFD8FF'; ctx.shadowBlur = 16; ctx.strokeStyle = C.white; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - R - 60, cutY); ctx.lineTo(x + R + 60, cutY); ctx.stroke(); ctx.restore();
  });
  // ring labels
  withAlpha(eout(seg(t, 4.6, 5.4)), () => {
    let r = CORE;
    LAYERS.forEach(([kind, w], i) => {
      r += w;
      if (i < 2) return;
      const lr = (r - w / 2) * s;
      const ax = x + lr * Math.cos(-0.6), ay = y + lr * Math.sin(-0.6);
      const lx = 700, ly = 250 + (i - 2) * 56;
      ctx.strokeStyle = 'rgba(238,245,255,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lx - 12, ly); ctx.stroke();
      font(500, 24, NUM); text(kind === 'clear' ? 'CLEAR ICE' : 'WHITE ICE', lx - 4, ly, { color: kind === 'clear' ? C.drop : C.white, base: 'middle' });
    });
  });
}

const piece = (t, pts) => { // smooth piecewise value: pts = [[t, v], …]
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t < pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], eio(seg(t, pts[i - 1][0], pts[i][0])));
  return pts.at(-1)[1];
};
/** The cloud, its zones, the updraft and the freezing level: one persistent layer from scene B on. */
function cloudLayer(t) {
  withAlpha(eout(seg(t, 9.3, 10.1)), () => {
    ctx.drawImage(cloudCanvas, 0, 0);
    updraft(t, 1);
    zones(t, piece(t, [[18.8, 0], [20.0, 0.6], [23.8, 0.6], [24.6, 1], [53.4, 1], [54.4, 0.5]]), piece(t, [[24.0, 0], [25.0, 1], [43.6, 1], [44.4, 0]]));
    freezingLine(1);
  });
}
/** The droplet, then the growing stone, in the cloud. */
function stoneLayer(t) {
  if (t < 9.6 || t > 56.9) return;
  const x = stoneX(t), y = stoneY(t);
  const ice = eio(seg(t, 22.8, 24.0));
  withAlpha(eout(seg(t, 9.6, 10.4)) * (1 - ice), () => {
    ctx.fillStyle = C.drop; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.white; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 14 + 3 * Math.sin(t * 4), 0, Math.PI * 2); ctx.stroke();
  });
  withAlpha(ice, () => stoneInCloud(t));
}

function sceneB(t) {
  withAlpha(span(t, 14.3, 18.8, 0.4, 0.4), () => {
    font(600, 40, NUM); text('UP TO 180 km/h', 432, 560, { color: C.white, align: 'center', base: 'middle' });
  });
  withAlpha(span(t, 18.7, 24.2, 0.4, 0.4), () => {
    font(500, 24, NUM); text('BELOW 0 °C, STILL LIQUID', 432, TOP_Y + 26, { color: C.drop, align: 'center', base: 'middle', spacing: '1px' });
  });
}

const INSET = { x: 712, y: 662, r: 98 };
function inset(t, a, bubbles) {
  withAlpha(a, () => {
    ctx.fillStyle = 'rgba(8,16,32,0.9)'; ctx.beginPath(); ctx.arc(INSET.x, INSET.y, INSET.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.frost; ctx.lineWidth = 3; ctx.stroke();
    slice(INSET.x, INSET.y, 0.5, (i) => layerDone(t, i), { bubbles });
    font(500, 22, NUM); text('THE STONE, SLICED', INSET.x, INSET.y - INSET.r - 18, { color: C.inkSoft, align: 'center', base: 'middle', spacing: '1px' });
  });
}
function stoneInCloud(t) {
  const x = stoneX(t), y = stoneY(t);
  const r = 6 + 8 * (layerDone(t, 0) + layerDone(t, 1) + layerDone(t, 2) + layerDone(t, 3) + layerDone(t, 4)) / 5;
  ctx.fillStyle = C.ice; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(160,200,240,0.9)'; ctx.lineWidth = 2; ctx.stroke();
  return [x, y, r];
}

function sceneC(t) {
  // the path so far
  ctx.save(); ctx.strokeStyle = 'rgba(238,245,255,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([2, 6]);
  ctx.beginPath();
  for (let s = RISE[0]; s <= Math.min(t, RISE[1]); s += 0.1) { const x = stoneX(s), y = stoneY(s); s === RISE[0] ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke(); ctx.restore();
  const bub = span(t, 33.3, 38.0, 0.5, 0.5);
  withAlpha(bub, () => {
    font(600, 24, NUM); text('AIR BUBBLES', INSET.x - INSET.r - 14, INSET.y + 4, { color: C.white, align: 'right', base: 'middle' });
  });
  withAlpha(span(t, 38.0, 43.9, 0.5, 0.4), () => {
    font(600, 32, NUM); text('30 MINUTES OR MORE', 432, 560, { color: C.white, align: 'center', base: 'middle' });
  });
}

function sceneD(t) {
  // the old idea: a stone yo-yoing up and down
  const old = span(t, 43.8, 48.8, 0.5, 0.5);
  withAlpha(old, () => {
    const path = (u) => { const y = lerp(BASE_Y - 20, TOP_Y + 20, 0.5 - 0.5 * Math.cos(u * Math.PI * 2 * 3.5)) ; return [300 + u * 260, y]; };
    ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
    ctx.beginPath(); for (let u = 0; u <= 1.0001; u += 0.01) { const [x, y] = path(u); u ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
    const u = seg(t, 44.0, 47.4);
    const [gx, gy] = path(u);
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(gx, gy, 9, 0, Math.PI * 2); ctx.fill();
    font(600, 26, NUM); text('OLD IDEA: MANY TRIPS', 432, TOP_Y - 40, { color: C.warn, align: 'center', base: 'middle', spacing: '1px' });
    const x = eout(seg(t, 47.3, 47.9));
    ctx.strokeStyle = C.warn; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(270, TOP_Y + 40); ctx.lineTo(lerp(270, 594, x), lerp(TOP_Y + 40, BASE_Y - 40, x)); ctx.stroke();
  });
  // the single path, glowing
  const one = eout(seg(t, 48.6, 49.6));
  withAlpha(one, () => {
    ctx.save(); ctx.shadowColor = '#BFE6FF'; ctx.shadowBlur = 14; ctx.strokeStyle = C.white; ctx.lineWidth = 4;
    ctx.beginPath();
    for (let s = RISE[0]; s <= RISE[1]; s += 0.1) { const x = stoneX(s), y = stoneY(s); s === RISE[0] ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore();
    font(600, 26, NUM); text('ONE TRIP IS ENOUGH', 432, TOP_Y - 40, { color: C.white, align: 'center', base: 'middle', spacing: '1px' });
  });
}

function sceneE(t) {
  // falling hail: the stone plus a shower below the base
  const fa = span(t, 53.6, 58.6, 0.3, 0.6);
  withAlpha(fa, () => {
    const rnd = mulberry32(44);
    for (let i = 0; i < 40; i++) {
      const x = 200 + rnd() * 460, sp = 200 + rnd() * 120, off = rnd() * 200;
      const y = BASE_Y + ((t - 53.6) * sp + off) % (GROUND_Y - BASE_Y);
      if (t < 54.4 && y > BASE_Y + (t - 53.6) * sp) continue;
      ctx.fillStyle = 'rgba(234,243,251,0.85)'; ctx.beginPath(); ctx.arc(x, y, 2.5 + rnd() * 2.5, 0, Math.PI * 2); ctx.fill();
    }
    font(600, 30, NUM); text('8 cm STONE ≈ 48 m/s', 432, TOP_Y - 40, { color: C.white, align: 'center', base: 'middle' });
  });
  // record card, at true scale (13 px per cm)
  const ca = eout(seg(t, 58.3, 59.2));
  withAlpha(ca, () => {
    ctx.fillStyle = 'rgba(6,13,28,0.92)'; k.rrect(52, 150, 760, 610, 26); ctx.fill();
    ctx.strokeStyle = 'rgba(207,232,255,0.5)'; ctx.lineWidth = 2; k.rrect(52, 150, 760, 610, 26); ctx.stroke();
    const PX_CM = 13, cx = 236, cy = 400, R = (20 / 2) * PX_CM;
    // the record stone drawn as a slice at 20 cm
    slice(cx, cy, R / FULL_R, () => 1);
    // ruler
    const rx0 = cx - R, ry = cy + R + 40;
    ctx.strokeStyle = C.frost; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rx0, ry); ctx.lineTo(rx0 + 20 * PX_CM, ry); ctx.stroke();
    for (let c = 0; c <= 20; c++) {
      const x = rx0 + c * PX_CM, big = c % 5 === 0;
      ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x, ry - (big ? 16 : 8)); ctx.stroke();
      if (big) { font(500, 22, NUM); text(`${c}`, x, ry + 20, { color: C.inkSoft, align: 'center', base: 'middle' }); }
    }
    font(500, 22, NUM); text('cm', rx0 + 20 * PX_CM + 28, ry + 20, { color: C.inkSoft, align: 'center', base: 'middle' });
    // a 1 cm stone for comparison
    ctx.fillStyle = C.ice; ctx.beginPath(); ctx.arc(cx + R + 44, cy + R - 6, PX_CM / 2, 0, Math.PI * 2); ctx.fill();
    font(500, 22, NUM); text('1 cm', cx + R + 44, cy + R - 30, { color: C.inkSoft, align: 'center', base: 'middle' });
    // text column
    const tx = 476;
    font(500, 24, NUM); text('LARGEST BY DIAMETER', tx, 236, { color: C.cyan, base: 'middle', spacing: '1px' });
    font(700, 92, NUM); text('20 cm', tx, 320, { color: C.white, base: 'middle' });
    font(500, 30); text('across (7.9 in)', tx, 384, { color: C.ink, base: 'middle' });
    text('47.3 cm around', tx, 426, { color: C.ink, base: 'middle' });
    font(700, 30); text('Vivian, South Dakota', tx, 494, { color: C.frost, base: 'middle' });
    font(500, 30); text('23 July 2010', tx, 536, { color: C.frost, base: 'middle' });
    font(500, 22); text('Source: Wikipedia, “Hail”', W / 2, 726, { color: 'rgba(238,245,255,0.6)', align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CUES = [
  [0.5, 4.8, 'Slice a big hailstone in half, and you find *rings*.'],
  [4.9, 9.4, 'Clear ice, white ice, clear again. How does it grow ~layers~?'],
  [9.7, 14.2, 'It starts as a droplet in a thunderstorm, carried up by the *updraft*.'],
  [14.3, 18.6, 'Updrafts can blow upward at up to ~180 km/h~.'],
  [18.7, 23.6, 'Above the freezing level, droplets stay liquid below 0 °C: *supercooled*.'],
  [24.0, 28.6, 'Where the stone meets lots of droplets, they freeze on as *clear ice*.'],
  [28.7, 33.2, 'Where there’s mostly vapour, it gains a thin layer of ~white ice~.'],
  [33.3, 37.9, 'White ice freezes fast and traps tiny *air bubbles*.'],
  [38.0, 43.6, 'It rises until the updraft can’t hold it, which may take ~30 minutes~ or more.'],
  [43.9, 48.4, 'The old idea: hail ~yo-yos~ up and down to build each layer.'],
  [48.5, 53.2, 'Newer research: *one trip* through changing zones is enough.'],
  [53.6, 58.2, 'Too heavy at last, it falls: an 8 cm stone at about *48 m/s*.'],
  [58.6, 63.8, 'The record: ~20 cm~ across, at Vivian, South Dakota, in 2010.'],
];
const CAP = { size: 44, lh: 56, weight: 650, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 846, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.cyan, '~': C.white } });
  }
}

Kit.scene({
  width: W, height: H, duration: 64,
  fonts: [
    { family: TEXT, file: 'Archivo.woff2', weight: '100 900' },
    { family: NUM, file: 'Oswald.woff2', weight: '200 700' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    font(700, 22, NUM); text('RECKON', 64, 84, { color: C.cyan, spacing: '3px' });
    const rw = ctx.measureText('RECKON').width + 20;
    font(500, 22, NUM); text('EARTH · WEATHER', 64 + rw + 14, 84, { color: C.inkSoft, spacing: '2px' });
    if (t > 9.3) cloudLayer(t);
    withAlpha(span(t, 9.8, 53.2, 0.6, 0.5), () => { font(500, 22, NUM); text('DIAGRAM · NOT TO SCALE', 64, 752, { color: C.inkSoft, base: 'middle', spacing: '1px' }); });
    if (t > 24.0 && t < 54.0) {
      const ia = eout(seg(t, 24.0, 25.0)) * (1 - eout(seg(t, 53.4, 54.0)));
      const [x, y] = [stoneX(t), stoneY(t)];
      withAlpha(ia * 0.5, () => { ctx.strokeStyle = C.frost; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 18, y + 4); ctx.lineTo(INSET.x - INSET.r * 0.7, INSET.y - INSET.r * 0.7); ctx.stroke(); });
      inset(t, ia, span(t, 33.3, 38.0, 0.5, 0.5));
    }
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    stoneLayer(t);
    if (t > 9.3) lightning(t);
    captions(t);
  },
});
