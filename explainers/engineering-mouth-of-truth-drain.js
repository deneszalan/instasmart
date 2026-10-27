// Explainer for engineering-mouth-of-truth-drain (Roma): the Mouth of Truth, the marble face in the porch of Santa
// Maria in Cosmedin, was probably a Roman drain cover; nearby, Rome's great drain, the Cloaca Maxima, reaches the
// Tiber. Why Rome needed it: the Forum valley lay below the Tiber's yearly floods until it was filled in and given a
// canal. Look: grey-blue stone and water, the bearded marble disc, an engineer's cross-section of the valley with
// coloured fill layers. Space Grotesk for labels and numbers, Rubik for captions.
//
// Facts:
// - Turismo Roma (City of Rome), "The Mouth of Truth": in the pronaos of Santa Maria in Cosmedin since 1632; a disc
//   about 1.80 m across, probably a Roman sewer cover; a bearded male face with pierced eyes, nose and mouth (perhaps
//   Jupiter, a faun or a river god); the name dates from 1485 and goes with a medieval legend that the mouth bites the
//   hand of liars; the Cloaca Maxima ran from the Subura through the Forum, the Velabrum and the Forum Boarium into the
//   Tiber near the Pons Aemilius. (It also links the disc to the Cloaca's marble covers; Wikipedia suggests a drain in
//   the nearby Temple of Hercules Victor instead, so where it first lay is left open.)
// - Wikipedia, "Bocca della Verità": about 1,300 kg; probably the face of Oceanus; eyes, nostrils and mouth open; the
//   original purpose uncertain, possibly a drain cover.
// - Hopkins, "The Cloaca Maxima and the Monumental Manipulation of Water in Archaic Rome", The Waters of Rome 4 (2007):
//   the lowest point of the Forum–Velabrum–Forum Boarium basin was just under 6 m above sea level; streams and
//   run-off from the hills crossed it, and the Tiber flooded yearly to almost 9 m; builders dumped as much as
//   20,000 m³ of soil, tuff and debris in five layers until the basin was raised to 9 m, above the yearly flood; a
//   canal built before that would have been under the flood; the Cloaca began as an open-air canal through the
//   Forum and was later covered and became a sewer.
// - Cassius Dio 49.43: as aedile (33 BC) Agrippa cleaned out the sewers and sailed through them underground into the
//   Tiber.
// - Wikipedia, "Cloaca Maxima": its outfall is by the Ponte Rotto and Ponte Palatino; it still drains rainwater from
//   the centre of the city.
// The cross-section is schematic: the heights (6 m, 9 m) are Hopkins's, the distances are not to scale.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0–14.0  The face in the church porch; its size; the legend.
//  B 14.2–23.2  A drain cover: water through the holes.
//  C 23.4–46.2  The valley: marsh, floods to 9 m, the fill, the canal to the Tiber.
//  D 46.4–55.4  Vaulted over; Agrippa's boat.
//  E 55.6–65.0  Where the disc lay, and its name.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#18232c', bg2: '#253541', ink: '#eef3f5', soft: 'rgba(238,243,245,0.72)', faint: 'rgba(238,243,245,0.22)',
  marble: '#e6dfd2', marble2: '#c9bfae', vein: 'rgba(120,100,120,0.25)', hole: '#14100e', stone: '#9aa3a8',
  water: '#5cc8e8', water2: 'rgba(92,200,232,0.55)', flood: 'rgba(92,170,232,0.45)', red: '#ff6b5b', gold: '#f2c14e',
  soil: ['#7a5a3a', '#8a6844', '#9a774e', '#866246', '#a5845a'], ground: '#5b4a3a', hill: '#4d5a4a', brick: '#a85d3c',
};
const LAB = 'Space Grotesk', CAP = 'Rubik';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const DIAMETER = 1.8, MASS = 1300, BASIN = 6, FLOOD = 9, FILL_M3 = 20000, LAYERS = 5, NAMED = 1485, PORCH = 1632;

// ---------- the face ----------
const faceCache = new Map();
function faceImage(R) {
  if (faceCache.has(R)) return faceCache.get(R);
  const c = document.createElement('canvas'); c.width = c.height = Math.ceil(2 * R + 8);
  const g = c.getContext('2d'), cx = R + 4, cy = R + 4;
  const grd = g.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.2, cx, cy, R);
  grd.addColorStop(0, C.marble); grd.addColorStop(1, C.marble2);
  g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();
  let s = 4; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.save(); g.beginPath(); g.arc(cx, cy, R - 1, 0, TAU); g.clip();
  g.strokeStyle = C.vein; g.lineWidth = 1.2;
  for (let i = 0; i < 10; i++) { g.beginPath(); let x = cx - R + r() * 2 * R, y = cy - R + r() * 2 * R; g.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (r() - 0.5) * 30; y += (r() - 0.3) * 22; g.lineTo(x, y); } g.stroke(); }
  g.restore();
  g.save(); g.beginPath(); g.arc(cx, cy, R - 2, 0, TAU); g.clip();
  // hair and beard as soft ridges
  g.strokeStyle = 'rgba(90,75,60,0.35)'; g.lineWidth = 6; g.lineCap = 'round';
  const wavy = (x0, y0, x1, y1, amp, ph) => {
    g.beginPath(); g.moveTo(x0, y0);
    for (let u = 0.05; u <= 1.001; u += 0.05) g.lineTo(lerp(x0, x1, u) + Math.sin(u * 9 + ph) * amp, lerp(y0, y1, u));
    g.stroke();
  };
  for (let i = -5; i <= 5; i++) wavy(cx + i * R * 0.15, cy - R * 0.98, cx + i * R * 0.1, cy - R * 0.44, R * 0.025, i);
  for (let i = -6; i <= 6; i++) wavy(cx + i * R * 0.085, cy + R * 0.24, cx + i * R * 0.11, cy + R * 0.97, R * 0.03, i * 1.7);
  // moustache, nose ridge
  g.lineWidth = 5; g.strokeStyle = 'rgba(90,75,60,0.45)';
  g.beginPath(); g.moveTo(cx - R * 0.3, cy + R * 0.3); g.quadraticCurveTo(cx - R * 0.12, cy + R * 0.14, cx, cy + R * 0.2); g.quadraticCurveTo(cx + R * 0.12, cy + R * 0.14, cx + R * 0.3, cy + R * 0.3); g.stroke();
  g.beginPath(); g.moveTo(cx - R * 0.05, cy - R * 0.28); g.lineTo(cx - R * 0.1, cy + R * 0.02); g.stroke();
  // brows, cheeks
  g.strokeStyle = 'rgba(90,75,60,0.45)'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(cx - R * 0.5, cy - R * 0.3); g.quadraticCurveTo(cx - R * 0.28, cy - R * 0.42, cx - R * 0.08, cy - R * 0.3); g.stroke();
  g.beginPath(); g.moveTo(cx + R * 0.5, cy - R * 0.3); g.quadraticCurveTo(cx + R * 0.28, cy - R * 0.42, cx + R * 0.08, cy - R * 0.3); g.stroke();
  g.restore();
  faceCache.set(R, c);
  return c;
}
/** The disc's holes: eyes, nostrils, mouth (centre offsets as fractions of the radius). */
const HOLES = [[-0.3, -0.16, 0.12, 0.09], [0.3, -0.16, 0.12, 0.09], [-0.07, 0.08, 0.05, 0.06], [0.07, 0.08, 0.05, 0.06], [0, 0.32, 0.2, 0.09]];
function face(cx, cy, R, { bite = 0 } = {}) {
  const img = faceImage(R);
  ctx.drawImage(img, cx - R - 4, cy - R - 4);
  ctx.fillStyle = C.hole;
  HOLES.forEach(([dx, dy, rx, ry], i) => {
    const sy = i === 4 ? ry * (1 - 0.8 * bite) : ry;
    ctx.beginPath(); ctx.ellipse(cx + dx * R, cy + dy * R, rx * R, Math.max(0.01, sy) * R, 0, 0, TAU); ctx.fill();
  });
  ctx.strokeStyle = 'rgba(60,50,40,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
}
function hand(x, y, s, a = 1) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#e8b896'; ctx.strokeStyle = 'rgba(80,40,20,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-200, -26); ctx.lineTo(-40, -26); ctx.quadraticCurveTo(0, -30, 30, -16); ctx.quadraticCurveTo(44, -8, 30, 0);
    ctx.lineTo(-10, 4); ctx.quadraticCurveTo(10, 14, -4, 22); ctx.lineTo(-60, 24); ctx.lineTo(-200, 24); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#5a6a8a'; ctx.fillRect(-220, -30, 60, 58);
    ctx.restore();
  });
}
function porch(a) {
  A(a, () => {
    ctx.fillStyle = '#8a4636'; ctx.fillRect(40, 70, W - 80, 700);
    ctx.fillStyle = '#9a5340';
    for (let i = 0; i < 3; i++) { const x = 80 + i * 250; ctx.beginPath(); ctx.moveTo(x, 770); ctx.lineTo(x, 300); ctx.arc(x + 100, 300, 100, Math.PI, 0); ctx.lineTo(x + 200, 770); ctx.fill(); }
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(40, 760, W - 80, 10);
  });
}

// ---------- A ----------
function sceneFace(t) {
  A(span(t, 0, 14.2, 0.5, 0.4), () => {
    porch(1);
    font(600, 24); text('SANTA MARIA IN COSMEDIN · ROME', CX, 104, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    const R = 250, cy = 430, g = eout(seg(t, 0.3, 1.6));
    ctx.save(); ctx.translate(CX, cy); ctx.scale(0.9 + 0.1 * g, 0.9 + 0.1 * g); ctx.translate(-CX, -cy);
    A(g, () => {
      // the bite: a hand goes in, the mouth snaps (legend)
      const inn = eio(seg(t, 10.0, 11.4)), snap = seg(t, 11.6, 11.9) * (1 - seg(t, 12.6, 13.2));
      face(CX, cy, R, { bite: snap });
      hand(CX - 30 + (1 - inn) * -300, cy + 0.32 * R, 0.9, seg(t, 9.8, 10.2) * (1 - seg(t, 13.2, 13.8)));
    });
    ctx.restore();
    A(seg(t, 5.2, 6.0) * (1 - seg(t, 9.4, 9.8)), () => {
      // diameter
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(CX - R, cy + R + 34); ctx.lineTo(CX + R, cy + R + 34); ctx.stroke();
      for (const x of [CX - R, CX + R]) { ctx.beginPath(); ctx.moveTo(x, cy + R + 22); ctx.lineTo(x, cy + R + 46); ctx.stroke(); }
      ctx.fillStyle = '#8a4636'; ctx.fillRect(CX - 90, cy + R + 16, 180, 36);
      font(700, 30); text(`≈ ${DIAMETER} m`, CX, cy + R + 35, { align: 'center', base: 'middle', color: C.gold });
      font(600, 26); text(`≈ ${Kit.fmt(MASS)} kg`, CX + R - 10, cy - R + 10, { align: 'left', base: 'middle', color: C.gold });
    });
    A(seg(t, 10.0, 10.6) * (1 - seg(t, 13.4, 13.8)), () => { font(700, 26); text('LEGEND SAYS', CX, cy - R - 30, { align: 'center', base: 'middle', color: C.red, spacing: '3px' }); });
  });
}

// ---------- B: a drain cover ----------
function sceneDrain(t) {
  A(span(t, 14.0, 23.4, 0.5, 0.4), () => {
    font(600, 24); text('PROBABLY A DRAIN COVER', CX, 104, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    // the face, with its holes highlighted
    const R = 180, cy = 340;
    const tilt = eio(seg(t, 18.6, 20.0));
    ctx.save(); ctx.translate(CX, cy + tilt * 160); ctx.scale(1, 1 - 0.72 * tilt); ctx.translate(-CX, -cy);
    face(CX, cy, R);
    A(seg(t, 14.6, 15.4) * (1 - tilt), () => {
      ctx.strokeStyle = C.water; ctx.lineWidth = 4;
      HOLES.forEach(([dx, dy, rx, ry]) => { ctx.beginPath(); ctx.ellipse(CX + dx * R, cy + dy * R, rx * R + 8, ry * R + 8, 0, 0, TAU); ctx.stroke(); });
    });
    ctx.restore();
    A(seg(t, 15.4, 16.0) * (1 - seg(t, 18.4, 18.8)), () => { font(600, 26); text('EYES · NOSE · MOUTH: HOLES', CX, cy + R + 44, { align: 'center', base: 'middle', color: C.water, spacing: '1px' }); });
    // in the ground: water running in through the holes to a drain below (illustration)
    A(seg(t, 19.0, 19.8), () => {
      const gy = 500 + 0; // ground line at the disc
      ctx.fillStyle = C.ground; ctx.fillRect(60, gy + 20, W - 120, 250);
      ctx.fillStyle = '#2b2219'; k.rrect(CX - 140, gy + 70, 280, 130, 30); ctx.fill();
      ctx.fillStyle = C.water2; ctx.fillRect(CX - 140, gy + 160, 280, 40);
      // rain and water
      for (let i = 0; i < 40; i++) {
        const u = ((t * 0.9 + i / 40) % 1), x = 120 + (i * 97) % 620;
        ctx.strokeStyle = 'rgba(160,215,240,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 150 + u * 300); ctx.lineTo(x - 4, 166 + u * 300); ctx.stroke();
      }
      for (let i = 0; i < 18; i++) {
        const u = ((t * 0.7 + i / 18) % 1), hx = HOLES[i % 5][0] * R;
        ctx.fillStyle = C.water; ctx.beginPath(); ctx.arc(CX + hx * (1 - u * 0.4), gy + 20 + u * 150, 4, 0, TAU); ctx.fill();
      }
      font(500, 22, CAP); text('drain below (illustration)', CX + 160, gy + 236, { align: 'left', base: 'middle', color: C.soft });
    });
  });
}

// ---------- C: the valley ----------
const SEC = { x0: 60, x1: 804, base: 740, pxm: 30 }; // 1 m of height = 30 px; 0 m at y = 740 - 0
const ey = (m) => SEC.base - (m - 2) * SEC.pxm; // heights above sea level, 2 m at the bottom edge
const RIVER_X = 650;
/** Height of the natural ground (m above sea level) along the section, schematic. */
function natural(x) {
  if (x < 160) return lerp(15, 7, (x - SEC.x0) / 100);
  if (x < 560) return BASIN - 0.2 + 0.35 * Math.sin((x - 160) / 60);
  if (x < RIVER_X) return lerp(6, 5.2, (x - 560) / 90);
  return 3;
}
function valley(t, { flood = 0, fill = 0, canal = 0, vault = 0, boat = -1, riverLevel = 4.2 } = {}) {
  // hills in the background
  ctx.fillStyle = C.hill;
  ctx.beginPath(); ctx.moveTo(SEC.x0, ey(2)); ctx.lineTo(SEC.x0, ey(19)); ctx.quadraticCurveTo(110, ey(20), 170, ey(9)); ctx.lineTo(170, ey(2)); ctx.fill();
  ctx.fillStyle = 'rgba(77,90,74,0.55)';
  ctx.beginPath(); ctx.moveTo(240, ey(BASIN)); ctx.quadraticCurveTo(330, ey(19), 440, ey(BASIN)); ctx.fill();
  font(600, 20); text('PALATINE', 340, ey(14), { align: 'center', base: 'middle', color: C.soft });
  text('HILLS', 110, ey(17), { align: 'center', base: 'middle', color: C.soft });
  // the ground
  ctx.fillStyle = C.ground; ctx.beginPath(); ctx.moveTo(SEC.x0, ey(2));
  for (let x = SEC.x0; x <= RIVER_X; x += 4) ctx.lineTo(x, ey(natural(x)));
  ctx.lineTo(RIVER_X, ey(2)); ctx.closePath(); ctx.fill();
  // the river
  ctx.fillStyle = C.water2; ctx.fillRect(RIVER_X, ey(riverLevel), SEC.x1 - RIVER_X, ey(2) - ey(riverLevel));
  ctx.fillStyle = '#3d3226'; ctx.fillRect(RIVER_X, ey(2.6), SEC.x1 - RIVER_X, ey(2) - ey(2.6));
  font(600, 22); text('TIBER', 728, ey(riverLevel) - 18, { align: 'center', base: 'middle', color: C.water });
  // fill layers, up to 9 m
  for (let i = 0; i < LAYERS; i++) {
    const v = clamp(fill * LAYERS - i);
    if (v <= 0) continue;
    const top = lerp(BASIN, FLOOD, (i + v) / LAYERS), bot = lerp(BASIN, FLOOD, i / LAYERS);
    ctx.fillStyle = C.soil[i];
    ctx.beginPath();
    for (let x = 160; x <= 600; x += 4) ctx.lineTo(x, ey(Math.max(natural(x), top)));
    for (let x = 600; x >= 160; x -= 4) ctx.lineTo(x, ey(Math.max(natural(x), bot)));
    ctx.closePath(); ctx.fill();
  }
  // the canal: a channel on the raised floor sloping down to the Tiber
  if (canal > 0) {
    const x1 = lerp(160, RIVER_X, canal);
    const cTop = (x) => (x < 560 ? lerp(FLOOD + 0.4, FLOOD - 0.4, (x - 160) / 400) : lerp(FLOOD - 0.4, riverLevel + 1.2, (x - 560) / (RIVER_X - 560)));
    const band = (d0, d1, col) => {
      ctx.fillStyle = col; ctx.beginPath();
      for (let x = 160; x <= x1; x += 6) ctx.lineTo(x, ey(cTop(x) - d0));
      for (let x = x1; x >= 160; x -= 6) ctx.lineTo(x, ey(cTop(x) - d1));
      ctx.closePath(); ctx.fill();
    };
    band(0, 1.3, '#2b2219'); band(0.7, 1.3, C.water);
    // flow arrows
    for (let i = 0; i < 6; i++) {
      const u = ((t * 0.4 + i / 6) % 1), x = lerp(160, x1, u);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, ey(cTop(x) - 1.0), 3, 0, TAU); ctx.fill();
    }
    // the vault over it
    A(vault, () => {
      ctx.strokeStyle = C.brick; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(160, ey(cTop(160) + 0.2)); for (let x = 160; x <= x1; x += 6) ctx.lineTo(x, ey(cTop(x) + 0.2)); ctx.stroke();
      ctx.fillStyle = C.soil[4];
      ctx.beginPath(); ctx.moveTo(160, ey(cTop(160) + 0.45)); for (let x = 160; x <= x1; x += 6) ctx.lineTo(x, ey(cTop(x) + 0.45)); for (let x = x1; x >= 160; x -= 6) ctx.lineTo(x, ey(Math.max(cTop(x) + 1.0, x < 600 ? FLOOD + 0.6 : 0))); ctx.closePath(); ctx.fill();
    });
    if (boat >= 0) {
      const x = lerp(170, RIVER_X + 40, boat), y = boat < 0.86 ? ey(cTop(Math.min(x, RIVER_X)) - 0.75) : ey(riverLevel) - 2;
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(x - 22, y - 6); ctx.lineTo(x + 22, y - 6); ctx.lineTo(x + 14, y + 4); ctx.lineTo(x - 14, y + 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y - 12, 5, 0, TAU); ctx.fill();
    }
  }
  // flood water over the basin
  if (flood > 0) {
    const lvl = lerp(riverLevel, FLOOD, flood);
    ctx.fillStyle = C.flood;
    ctx.beginPath(); ctx.moveTo(160, ey(lvl));
    for (let x = 160; x <= SEC.x1; x += 4) { const gnd = x < RIVER_X ? Math.max(natural(x), fill > 0 ? lerp(BASIN, FLOOD, fill) : 0) : 2.6; if (gnd < lvl) ctx.lineTo(x, ey(lvl)); else ctx.lineTo(x, ey(gnd)); }
    ctx.lineTo(SEC.x1, ey(2.6)); ctx.lineTo(160, ey(2.6)); ctx.closePath(); ctx.fill();
  }
}
function level(m, label, col, a) {
  A(a, () => {
    ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.setLineDash([10, 7]);
    ctx.beginPath(); ctx.moveTo(SEC.x0, ey(m)); ctx.lineTo(SEC.x1, ey(m)); ctx.stroke(); ctx.setLineDash([]);
    font(700, 24); text(label, SEC.x1, ey(m) - 18, { align: 'right', base: 'middle', color: col });
  });
}
function sceneValley(t) {
  A(span(t, 23.2, 46.4, 0.5, 0.4), () => {
    font(600, 24); text('THE FORUM VALLEY, IN SECTION (SCHEMATIC)', CX, 104, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    // streams down from the hills pooling in the basin (marsh) until the fill
    const fill = eio(seg(t, 37.4, 40.6)), canal = eio(seg(t, 42.0, 44.4));
    const flood = seg(t, 32.8, 34.0) * (1 - seg(t, 35.6, 36.8)) + seg(t, 40.8, 41.4) * 0 ;
    valley(t, { flood, fill, canal });
    // the marsh before the fill
    A(seg(t, 28.2, 29.0) * (1 - fill), () => {
      ctx.fillStyle = 'rgba(92,200,232,0.35)';
      ctx.fillRect(170, ey(BASIN + 0.35), 400, ey(BASIN - 0.5) - ey(BASIN + 0.35));
      font(600, 22); text('MARSH', 360, ey(BASIN) + 30, { align: 'center', base: 'middle', color: C.water });
      // a stream from the hills
      ctx.strokeStyle = C.water; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(80, ey(14.5)); ctx.quadraticCurveTo(120, ey(9), 175, ey(BASIN + 0.2)); ctx.stroke();
    });
    level(BASIN, `FLOOR ≈ ${BASIN} m`, C.ink, seg(t, 28.6, 29.4) * (1 - fill));
    level(FLOOD, `YEARLY FLOOD ≈ ${FLOOD} m`, C.water, seg(t, 33.0, 33.8));
    A(seg(t, 37.6, 38.4) * (1 - seg(t, 41.6, 42.0)), () => {
      font(700, 28); text(`${LAYERS} LAYERS · UP TO ${Kit.fmt(FILL_M3)} m³`, 360, ey(FLOOD) - 64, { align: 'center', base: 'middle', color: C.gold });
    });
    A(seg(t, 43.0, 43.8), () => { font(700, 26); text('OPEN CANAL, DOWNHILL', 380, ey(FLOOD + 2.4), { align: 'center', base: 'middle', color: C.water }); });
    font(500, 20, CAP); A(seg(t, 28.6, 29.4), () => text('heights above sea level, after Hopkins 2007', SEC.x0, ey(2) + 26, { base: 'middle', color: C.soft }));
  });
  A(span(t, 46.2, 55.8, 0.4, 0.4), () => {
    font(600, 24); text('LATER: VAULTED OVER, A SEWER', CX, 104, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    valley(t, { fill: 1, canal: 1, vault: eio(seg(t, 46.6, 48.0)), boat: t > 51.2 ? eio(seg(t, 51.4, 54.8)) : -1 });
    level(FLOOD, `≈ ${FLOOD} m`, C.water, 0.6);
    A(seg(t, 51.2, 51.8), () => { font(700, 26); text('33 BC · AGRIPPA’S BOAT', 360, ey(FLOOD + 3.6), { align: 'center', base: 'middle', color: C.gold }); });
  });
}

// ---------- E: where it lay, and its name ----------
function sceneEnd(t) {
  A(span(t, 55.6, 65.4, 0.4, 0.0), () => {
    porch(1);
    face(CX, 380, 210, { bite: 0 });
    A(seg(t, 56.0, 56.8) * (1 - seg(t, 59.8, 60.2)), () => {
      ctx.fillStyle = 'rgba(24,35,44,0.9)'; k.rrect(CX - 300, 618, 600, 110, 14); ctx.fill();
      font(600, 26); text('FIRST HOME: UNKNOWN', CX, 650, { align: 'center', base: 'middle', color: C.gold, spacing: '1px' });
      font(400, 24, CAP); text('a drain of the Cloaca? a nearby temple?', CX, 692, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 60.4, 61.2), () => {
      ctx.fillStyle = 'rgba(24,35,44,0.9)'; k.rrect(CX - 300, 618, 600, 110, 14); ctx.fill();
      font(700, 30); text(`${NAMED}`, CX - 150, 652, { align: 'center', base: 'middle', color: C.gold });
      text(`${PORCH}`, CX + 150, 652, { align: 'center', base: 'middle', color: C.gold });
      font(400, 22, CAP); text('the name appears', CX - 150, 694, { align: 'center', base: 'middle', color: C.soft });
      text('set in the porch', CX + 150, 694, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, 'In the porch of the church of Santa Maria in Cosmedin hangs the *Mouth of Truth*.'],
  [5.0, 9.4, 'It is a marble disc about *1.8 m* across, some 1,300 kg, carved with a bearded face.'],
  [9.6, 14.0, 'Legend says it bites off the hand of anyone who tells a lie with a hand in its mouth.'],
  [14.2, 18.6, 'Its eyes, nose and mouth are *holes*. It was probably a Roman ~drain cover~.'],
  [18.8, 23.2, 'Set into the ground, it would let rainwater run through the face into a drain below.'],
  [23.4, 27.8, 'Close by, Rome’s great drain, the *Cloaca Maxima*, still reaches the Tiber.'],
  [28.0, 32.4, 'Why was it built? The Forum valley was low and marshy: under *6 m* above sea level.'],
  [32.6, 37.0, 'Streams ran down from the hills, and the Tiber flooded it most years, to almost ~9 m~.'],
  [37.2, 41.6, 'In the time of Rome’s kings, up to *20,000 m³* of earth raised the valley floor to ~9 m~.'],
  [41.8, 46.2, 'Only above the floods could a canal carry the streams downhill to the Tiber.'],
  [46.4, 50.8, 'It began as an open canal through the Forum; later it was vaulted over as a sewer.'],
  [51.0, 55.4, 'In 33 BC the general Marcus Agrippa had it cleaned, and sailed through it in a boat.'],
  [55.6, 60.0, 'Where the disc first lay is unknown: over a drain like this, or in a nearby temple.'],
  [60.2, 64.6, 'Its name dates from *1485*; since *1632* it has stood in the porch of the church.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [LAB, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneFace(t);
    sceneDrain(t);
    sceneValley(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: CAP, ink: C.ink, marks: { '*': C.gold, '~': C.water } });
  },
});
