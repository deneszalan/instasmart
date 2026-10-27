// Explainer for biology-honeybee-waggle-dance: the waggle run's angle and length give directions.
// Look: amber honeycomb in a dark hive, a stylised bee, and a round "sun compass" map card that
// shows the same angle outside. Fredoka for display and labels, Nunito for captions.
//
// Scene plan (52 s scene → about 69 s clip). Captions centred at y = 840.
//  A  0.0– 9.8  Hook. The sun compass, big: hive in the middle, the Sun straight up, flowers
//               40° to the right of it, 1.5 km out; a bee flies there and back. "How does she tell
//               her sisters where, in the dark?" The card then shrinks into the corner.
//  B  9.6–26.6  The dance on the vertical comb: waggle runs from one fixed start point, return
//               loops alternating right and left. Straight up on the comb stands for the Sun; the
//               run's angle from vertical (40°, measured in code) is the food's angle from the Sun.
//  C 26.4–36.6  Distance: runs for food 0.5 km away, then 1.5 km away. A stopwatch times each
//               run in clip seconds (scene time ÷ pace), so it matches what the viewer sees, using
//               von Frisch's estimate of roughly one second per kilometre (hedged as his estimate).
//  D 36.4–42.2  The Sun moves 25° across the sky; the food stays put, so the run turns to 15°.
//  E 42.0–52.0  Payoff card: von Frisch, the 1973 Nobel Prize, and the three rules.
//
// Facts: Wikipedia "Waggle dance": on vertical combs, flowers in line with the Sun are shown by
// waggle runs straight up, angles right or left of the Sun by the same angle right or left of up;
// distance is encoded in the duration of the waggle runs; a dance is one to 100 or more circuits
// of a waggle run and a return phase, turning right, then left; bees that have been in the nest a
// long time adjust their dance angle as the Sun's direction changes. Wikipedia "Karl von Frisch":
// one second indicating a distance of approximately one kilometre; Nobel Prize in Physiology or
// Medicine 1973, with Konrad Lorenz and Nikolaas Tinbergen.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const DISPLAY = 'Fredoka', TEXT = 'Nunito';

const C = {
  honey: '#FFC857', amber: '#F2A93B', wax: '#E8B04A', brown: '#2A1606', deep: '#160B02',
  cream: '#FFF4DC', creamSoft: 'rgba(255,244,220,0.76)', sun: '#FFD54A', mint: '#9EE6B8', card: '#3A2108',
};

const CUES = [
  [0.5, 4.3, 'A honeybee finds flowers far from the hive.'],
  [4.5, 9.3, 'Back home, in the dark, how does she tell her sisters where?'],
  [9.6, 13.6, 'She dances on the vertical comb: the *waggle dance*.'],
  [13.8, 17.2, 'The straight, waggling run is the message.'],
  [17.4, 21.0, 'Straight up stands for the *Sun’s direction*.'],
  [21.2, 26.4, 'The run’s angle from vertical is the food’s ~angle from the Sun~.'],
  [26.6, 31.0, 'And the *longer* the waggle lasts, the farther the food.'],
  [31.2, 36.4, 'Biologist Karl von Frisch estimated each second of waggling means roughly *a kilometre*.'],
  [36.6, 42.0, 'Bees inside for a long time even shift the angle as the ~Sun moves~.'],
  [42.2, 47.1, 'Von Frisch helped decode the dance and shared the *1973 Nobel Prize*.'],
  [47.3, 51.6, 'Up means the Sun, angle means direction, duration means distance.'],
];
const T = { A: [0, 9.8], B: [9.6, 26.6], C: [26.4, 36.6], D: [36.4, 42.2], E: [42.0, 52] };

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.cream, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);
const rad = (d) => (d * Math.PI) / 180;

// ---------- the plan: where the food is, relative to the Sun ----------
const FOOD_DEG = 40; // flowers 40° to the right of the Sun, as seen from the hive
const sunShift = (t) => 25 * eio(seg(t, 37.0, 41.4)); // the Sun moves 25° clockwise across the sky
const angleNow = (t) => FOOD_DEG - sunShift(t); // the angle the dance must show
function kmNow(t) {
  if (t < 26.0) return 1.5;
  if (t < 29.2) return lerp(1.5, 0.5, eio(seg(t, 26.0, 26.6)));
  return lerp(0.5, 1.5, eio(seg(t, 29.2, 30.0)));
}
const PACE = 0.75;

// ---------- the dance, run by run ----------
const START = { x: 500, y: 612 }; // every waggle run starts here
const RET = 1.0; // return loop, scene seconds
const runLen = (km) => 80 + 115 * km;
const RUNS = [];
{
  let s = 9.9, side = 1;
  while (s < 53) {
    const km = kmNow(s), dur = Math.max(0.3, PACE * km); // about 1 clip second per km
    RUNS.push({ s, km, dur, side });
    s += dur + RET; side = -side;
  }
}
function dancer(t) {
  let r = RUNS[0];
  for (const q of RUNS) if (q.s <= t) r = q;
  const th = rad(angleNow(t)), ux = Math.sin(th), uy = -Math.cos(th), L = runLen(r.km);
  if (t < RUNS[0].s) return { x: START.x, y: START.y, h: Math.atan2(uy, ux), waggle: 0, run: null };
  const local = t - r.s;
  if (local < r.dur) {
    const f = local / r.dur;
    return { x: START.x + ux * L * f, y: START.y + uy * L * f, h: Math.atan2(uy, ux), waggle: 1, run: r, local };
  }
  // return: a half circle from the run's end back to the start, on alternating sides
  const f = eio(clamp((local - r.dur) / RET));
  const cx = START.x + (ux * L) / 2, cy = START.y + (uy * L) / 2, R = L / 2;
  const a0 = Math.atan2(uy, ux), a = a0 + r.side * Math.PI * f;
  const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
  return { x, y, h: a + (r.side * Math.PI) / 2, waggle: 0, run: r, local };
}

// ---------- honeycomb ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
let comb = null;
function paintComb() {
  comb = document.createElement('canvas'); comb.width = W; comb.height = H;
  const g = comb.getContext('2d'), rnd = mulberry32(12);
  g.fillStyle = '#2A1505'; g.fillRect(0, 0, W, H);
  const r = 30, w = Math.sqrt(3) * r;
  for (let row = -1; row < H / (1.5 * r) + 1; row++) {
    for (let col = -1; col < W / w + 1; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0), cy = row * 1.5 * r;
      const kind = rnd();
      g.beginPath();
      for (let i = 0; i < 6; i++) { const a = rad(60 * i - 30); g.lineTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2)); }
      g.closePath();
      const gr = g.createRadialGradient(cx - 6, cy - 8, 2, cx, cy, r);
      if (kind < 0.42) { gr.addColorStop(0, '#E39A2A'); gr.addColorStop(0.6, '#A8620F'); gr.addColorStop(1, '#5A3006'); } // honey
      else if (kind < 0.7) { gr.addColorStop(0, '#E9C27A'); gr.addColorStop(1, '#9A6A22'); } // capped
      else { gr.addColorStop(0, '#5A3408'); gr.addColorStop(1, '#2C1704'); } // empty
      g.fillStyle = gr; g.fill();
      g.strokeStyle = '#F0BE5E'; g.globalAlpha = 0.55; g.lineWidth = 3; g.stroke(); g.globalAlpha = 1;
      if (kind < 0.42 && rnd() < 0.6) { g.fillStyle = 'rgba(255,240,190,0.45)'; g.beginPath(); g.ellipse(cx - 8, cy - 9, 6, 3, -0.6, 0, Math.PI * 2); g.fill(); }
    }
  }
  // the hive is dark: deep vignette, and a dark band for captions
  const vg = g.createRadialGradient(W / 2 + 40, 470, 120, W / 2, 500, 760);
  vg.addColorStop(0, 'rgba(20,9,1,0.58)'); vg.addColorStop(1, 'rgba(12,5,0,0.9)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const cb = g.createLinearGradient(0, 740, 0, H);
  cb.addColorStop(0, 'rgba(14,6,0,0)'); cb.addColorStop(0.35, 'rgba(14,6,0,0.72)'); cb.addColorStop(1, 'rgba(14,6,0,0.9)');
  g.fillStyle = cb; g.fillRect(0, 740, W, H - 740);
}
function header() {
  font(600, 24, DISPLAY); text('reckon', 56, 68, { color: C.honey });
  const w = ctx.measureText('reckon').width;
  font(700, 22); text('·  BIOLOGY  ·  BEES', 56 + w + 14, 68, { color: C.creamSoft, spacing: '2px' });
}

// ---------- a stylised bee ----------
function bee(x, y, h, s = 1, wag = 0, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(h + Math.PI / 2 + wag * 0.32 * Math.sin(t * 2 * Math.PI * 12)); ctx.scale(s, s);
  // wings, buzzing
  const flap = 0.85 + 0.15 * Math.sin(t * 90);
  ctx.fillStyle = 'rgba(235,245,255,0.55)'; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.2;
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * 13, -2, 13 * flap, 7, sd * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  // abdomen with stripes
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 14, 11, 17, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#F6B73C'; ctx.fillRect(-12, -4, 24, 36);
  ctx.fillStyle = '#2A1606'; for (const yy of [6, 15, 24]) ctx.fillRect(-12, yy, 24, 4.5);
  ctx.restore();
  ctx.strokeStyle = '#2A1606'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(0, 14, 11, 17, 0, 0, Math.PI * 2); ctx.stroke();
  // thorax and head
  ctx.fillStyle = '#8A5A1C'; ctx.beginPath(); ctx.arc(0, -6, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2A1606'; ctx.beginPath(); ctx.arc(0, -18, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2A1606'; ctx.lineWidth = 1.8;
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 2, -23); ctx.quadraticCurveTo(sd * 7, -32, sd * 10, -33); ctx.stroke(); }
  ctx.restore();
}

// ---------- the sun compass: a map of the outside ----------
function sunIcon(x, y, r) {
  ctx.fillStyle = C.sun;
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-r * 0.22, -r * 1.15); ctx.lineTo(0, -r * 1.6); ctx.lineTo(r * 0.22, -r * 1.15); ctx.fill(); ctx.restore(); }
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function flower(x, y, r) {
  ctx.fillStyle = '#F7A8C8';
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = C.honey; ctx.beginPath(); ctx.arc(x, y, r * 0.38, 0, Math.PI * 2); ctx.fill();
}
function hiveIcon(x, y, r) {
  ctx.fillStyle = '#E8B04A'; ctx.strokeStyle = '#5A3408'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) { const w = r * (1.1 - i * 0.22); k.rrect(x - w, y + r * 0.5 - i * r * 0.55, 2 * w, r * 0.55, r * 0.25); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = '#3A2108'; ctx.beginPath(); ctx.arc(x, y + r * 0.72, r * 0.18, 0, Math.PI * 2); ctx.fill();
}
/** The map card: hive at the centre, the Sun on the rim, flowers out at the food's bearing. */
function compass(t, cx, cy, R, { bee: flight = null } = {}) {
  const s = R / 270;
  ctx.save();
  ctx.fillStyle = 'rgba(40,64,30,0.96)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
  const gg = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
  gg.addColorStop(0, 'rgba(120,160,80,0.35)'); gg.addColorStop(1, 'rgba(20,40,16,0.4)');
  ctx.fillStyle = gg; ctx.fill();
  ctx.lineWidth = Math.max(3, 8 * s); ctx.strokeStyle = C.wax; ctx.stroke();
  for (let d = 0; d < 360; d += 15) {
    const a = rad(d - 90), l = d % 45 ? 8 * s : 16 * s;
    ctx.strokeStyle = 'rgba(255,244,220,0.5)'; ctx.lineWidth = Math.max(1.2, 2.5 * s);
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 6 * s), cy + Math.sin(a) * (R - 6 * s)); ctx.lineTo(cx + Math.cos(a) * (R - 6 * s - l), cy + Math.sin(a) * (R - 6 * s - l)); ctx.stroke();
  }
  const sunA = rad(sunShift(t) - 90), foodA = rad(FOOD_DEG - 90), km = kmNow(t);
  const fr = R * (0.22 + 0.5 * (km / 1.5));
  // the Sun's direction and the food's direction, with the angle between them
  ctx.setLineDash([10 * s + 2, 10 * s + 2]); ctx.lineWidth = Math.max(2, 4 * s);
  ctx.strokeStyle = 'rgba(255,213,74,0.8)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(sunA) * (R - 40 * s), cy + Math.sin(sunA) * (R - 40 * s)); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,244,220,0.85)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(foodA) * fr, cy + Math.sin(foodA) * fr); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = C.mint; ctx.lineWidth = Math.max(2.5, 5 * s);
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.36, sunA, foodA); ctx.stroke();
  const mid = (sunA + foodA) / 2;
  font(700, Math.max(22, 40 * s), DISPLAY); text(`${Math.round(angleNow(t))}°`, cx + Math.cos(mid) * R * 0.5, cy + Math.sin(mid) * R * 0.5 + 12 * s, { color: C.mint, align: 'center' });
  sunIcon(cx + Math.cos(sunA) * (R - 28 * s), cy + Math.sin(sunA) * (R - 28 * s), 20 * s + 3);
  flower(cx + Math.cos(foodA) * fr, cy + Math.sin(foodA) * fr, 26 * s + 4);
  hiveIcon(cx, cy, 26 * s + 4);
  if (R > 200) {
    font(600, 26, DISPLAY); text(`${km.toFixed(1)} km`, cx + Math.cos(foodA) * fr * 0.55 + 40, cy + Math.sin(foodA) * fr * 0.55 + 34, { color: C.cream, align: 'left' });
    font(600, 24); text('hive', cx, cy + 60, { color: C.cream, align: 'center' });
  } else {
    font(700, 22); text(`${km.toFixed(1)} km`, cx, cy + R + 34, { color: C.cream, align: 'center' });
  }
  if (flight !== null) {
    const p = flight, out = p < 0.5, f = eio(out ? p * 2 : (1 - p) * 2);
    const bx = cx + Math.cos(foodA) * fr * f, by = cy + Math.sin(foodA) * fr * f;
    bee(bx, by, foodA + (out ? 0 : Math.PI), 0.75, 0, t);
  }
  ctx.restore();
}

// ---------- the dance stage ----------
const FOLLOWERS = [[378, 486, 0.4], [646, 704, 2.2], [764, 566, 4.1], [424, 702, 5.3]];
function stage(t, a = 1, { guides = 0, timer = 0 } = {}) {
  const d = dancer(t), th = rad(angleNow(t)), ux = Math.sin(th), uy = -Math.cos(th);
  withAlpha(a, () => {
    // faint figure-eight trail of the current run
    if (d.run) {
      const L = runLen(d.run.km), cx = START.x + (ux * L) / 2, cy = START.y + (uy * L) / 2;
      ctx.setLineDash([4, 10]); ctx.strokeStyle = 'rgba(255,244,220,0.28)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, L / 2, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(START.x, START.y); ctx.lineTo(START.x + ux * L, START.y + uy * L);
      ctx.strokeStyle = 'rgba(20,8,0,0.7)'; ctx.lineWidth = 11; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,200,87,0.9)'; ctx.lineWidth = 5; ctx.stroke();
    }
    // the angle from vertical
    withAlpha(guides, () => {
      ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(255,213,74,0.9)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(START.x, START.y); ctx.lineTo(START.x, START.y - 300); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.sun; ctx.beginPath(); ctx.moveTo(START.x, START.y - 318); ctx.lineTo(START.x - 11, START.y - 296); ctx.lineTo(START.x + 11, START.y - 296); ctx.fill();
      font(600, 24, DISPLAY); text('up', START.x - 18, START.y - 290, { color: C.sun, align: 'right' });
      ctx.strokeStyle = C.mint; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(START.x, START.y, 84, -Math.PI / 2, -Math.PI / 2 + th); ctx.stroke();
    });
    for (const [fx, fy, ph] of FOLLOWERS) {
      const jx = fx + Math.sin(t * 1.3 + ph) * 6, jy = fy + Math.cos(t * 1.1 + ph) * 6;
      bee(jx, jy, Math.atan2(d.y - jy, d.x - jx), 1.2, 0, t + ph);
    }
    // waggle marks
    if (d.waggle) {
      const nx = -uy, ny = ux;
      for (const sd of [-1, 1]) {
        ctx.strokeStyle = 'rgba(255,244,220,0.7)'; ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          const o = 30 + i * 9, w = 0.6 + 0.4 * Math.sin(t * 60 + i);
          ctx.beginPath(); ctx.moveTo(d.x + nx * sd * o - ux * 8 * w, d.y + ny * sd * o - uy * 8 * w); ctx.lineTo(d.x + nx * sd * o + ux * 8 * w, d.y + ny * sd * o + uy * 8 * w); ctx.stroke();
        }
      }
    }
    // glow under the dancer
    const g = ctx.createRadialGradient(d.x, d.y, 4, d.x, d.y, 60);
    g.addColorStop(0, 'rgba(255,214,120,0.35)'); g.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, 60, 0, Math.PI * 2); ctx.fill();
    bee(d.x, d.y, d.h, 1.6, d.waggle, t);
    // the angle, on a pill so the dancer never hides it
    withAlpha(guides, () => {
      const mid = -Math.PI / 2 + th / 2, lx = START.x + Math.cos(mid) * 132 - 6, ly = START.y + Math.sin(mid) * 132;
      k.rrect(lx - 40, ly - 24, 80, 46, 23); ctx.fillStyle = 'rgba(22,10,1,0.85)'; ctx.fill();
      font(700, 32, DISPLAY); text(`${Math.round(angleNow(t))}°`, lx, ly + 11, { color: C.mint, align: 'center' });
    });
    // stopwatch for the waggle run, in clip seconds
    withAlpha(timer, () => {
      const r = d.run, sx = 724, sy = 246, R = 54;
      let secs = 0, running = false;
      if (r) { const loc = t - r.s; running = loc < r.dur; secs = Math.min(loc, r.dur) / PACE; }
      ctx.fillStyle = 'rgba(30,14,2,0.92)'; ctx.beginPath(); ctx.arc(sx, sy, R + 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.wax; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = C.wax; k.rrect(sx - 10, sy - R - 26, 20, 14, 4); ctx.fill();
      ctx.strokeStyle = running ? C.honey : 'rgba(255,200,87,0.55)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(sx, sy, R - 4, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.min(secs, 2)) / 2); ctx.stroke();
      font(700, 34, DISPLAY); text(`${secs.toFixed(1)} s`, sx, sy + 12, { color: C.cream, align: 'center' });
      font(700, 22); text('waggle time', sx, sy + R + 40, { color: C.creamSoft, align: 'center' });
    });
  });
}

// ---------- scenes ----------
const SMALL = { x: 172, y: 262, r: 112 };
function compassPlace(t) {
  const f = eio(seg(t, 8.8, 10.2));
  return { x: lerp(432, SMALL.x, f), y: lerp(420, SMALL.y, f), r: lerp(282, SMALL.r, f) };
}
function sceneA(t) {
  const c = compassPlace(t);
  compass(t, c.x, c.y, c.r, { bee: t > 0.8 && t < 8.4 ? seg(t, 0.8, 8.4) : null });
  withAlpha(seg(t, 1.0, 1.6) * (1 - seg(t, 8.2, 8.8)), () => {
    font(600, 26); text('map of the outside', 432, 744, { color: C.creamSoft, align: 'center' });
  });
}
function sceneB(t) {
  compass(t, SMALL.x, SMALL.y, SMALL.r);
  withAlpha(seg(t, 9.8, 10.6) * (1 - seg(t, 13.4, 14.0)), () => {
    font(600, 26); text('vertical comb, in the dark', 470, 752, { color: C.creamSoft, align: 'center' });
  });
  stage(t, seg(t, 9.6, 10.4), { guides: seg(t, 17.6, 18.4) });
  withAlpha(seg(t, 17.8, 18.6), () => {
    font(600, 24, DISPLAY); text('= toward the Sun', START.x + 18, START.y - 290, { color: C.sun });
  });
}
function sceneC(t) {
  compass(t, SMALL.x, SMALL.y, SMALL.r);
  stage(t, 1, { guides: 1, timer: seg(t, 26.6, 27.2) });
}
function sceneD(t) {
  withAlpha(1 - seg(t, 41.7, 42.2), () => compass(t, SMALL.x, SMALL.y, SMALL.r));
  stage(t, 1, { guides: 1, timer: 1 - seg(t, 36.4, 37.0) });
  withAlpha(seg(t, 36.8, 37.4) * (1 - seg(t, 41.7, 42.2)), () => {
    font(600, 24); text('the Sun moves,', SMALL.x, SMALL.y + SMALL.r + 70, { color: C.sun, align: 'center' });
    text('the food does not', SMALL.x, SMALL.y + SMALL.r + 98, { color: C.cream, align: 'center' });
  });
}
function sceneE(t) {
  stage(t, 1, { guides: 1 - seg(t, 42.2, 42.8) });
  const a = eout(seg(t, 42.2, 43.1));
  withAlpha(a, () => {
    ctx.fillStyle = 'rgba(14,6,0,0.55)'; ctx.fillRect(0, 0, W, 760);
    k.rrect(120, 200, 624, 470, 34); ctx.fillStyle = 'rgba(42,22,6,0.95)'; ctx.fill();
    ctx.strokeStyle = C.wax; ctx.lineWidth = 4; ctx.stroke();
    font(600, 46, DISPLAY); text('The waggle dance', 432, 278, { color: C.honey, align: 'center' });
    const rows = [['Up', 'the Sun’s direction', C.sun], ['Angle', 'direction from the Sun', C.mint], ['Duration', 'distance to the food', C.honey]];
    rows.forEach(([a1, b1, col], i) => {
      withAlpha(seg(t, 43.0 + i * 0.4, 43.6 + i * 0.4), () => {
        font(600, 32, DISPLAY); text(a1, 300, 360 + i * 64, { color: col, align: 'right' });
        font(600, 30); text(b1, 324, 360 + i * 64, { color: C.cream });
      });
    });
    font(700, 26); text('Karl von Frisch · Nobel Prize 1973', 432, 584, { color: C.cream, align: 'center' });
    font(600, 22); text('shared with Konrad Lorenz and Nikolaas Tinbergen', 432, 620, { color: C.creamSoft, align: 'center' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 800, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 840, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.cream, marks: { '*': C.honey, '~': C.mint } });
  }
}

Kit.scene({
  width: W, height: H, duration: 52,
  fonts: [
    { family: DISPLAY, file: 'Fredoka.woff2', weight: '300 700' },
    { family: TEXT, file: 'Nunito.woff2', weight: '200 1000' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!comb) paintComb();
    ctx.drawImage(comb, 0, 0);
    // A, B, C and D share the compass and the stage, so they hand over without crossfades
    const scenes = [[sceneA, [0, 9.6], 0, 0], [sceneB, [9.6, 26.5], 0, 0], [sceneC, [26.5, 36.5], 0, 0], [sceneD, [36.5, 42.2], 0, 0], [sceneE, [42.2, 52], 0, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t >= b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    header();
    captions(t);
  },
});
