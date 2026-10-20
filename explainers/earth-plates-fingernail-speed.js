// Explainer for earth-plates-fingernail-speed: continents drift about as fast as fingernails grow.
// Look: a field survey map. Pale sage and parchment with topographic contour lines, ink-brown
// linework, a ruler with millimetre ticks, a red survey line. One family: Bitter.
//
// Facts: Wikipedia, "Plate tectonics": plates are the rigid outer shell (lithosphere) riding on the
// hotter asthenosphere, which flows more easily; "Plate motions range from 10 to 40 mm/year at the
// Mid-Atlantic Ridge (about as fast as fingernails grow), to about 160 mm/year for the Nazca plate
// (about as fast as hair grows)"; at a spreading ridge plates move apart and new crust forms; the
// continents once formed a single land mass, Pangaea. From the post: fingernails grow about 3.5 mm
// a month; the motion went on for roughly 200 million years and opened the Atlantic. The year's
// nail growth and every distance are computed below.
//
// Scene plan (seconds)                                    Captions
// A  0.0- 7.6  Hook: two survey stamps, a fingertip and    "Which is faster: a growing ~fingernail~ or a drifting *continent*?"
//              two continents, then a ruler slides in      "Let’s put both on one ruler."
// B  7.4-25.0  One ruler: the nail and the ridge (slow and "A fingernail grows about ~3.5 mm a month~."
//              fast ends) grow through 12 months; then the  "At the Mid-Atlantic Ridge, plates part by *10 to 40 mm a year*."
//              ruler zooms out and the Nazca Plate joins   "In a year, both creep *a few centimetres*."
//                                                          "The speedy *Nazca Plate* moves about *16 cm a year*, like growing hair."
// C 24.6-40.8  Sped up: a simplified Atlantic opens between "Now run the clock for *millions of years*."
//              two continent outlines, with counters for    "At that pace, each million years adds *10 to 40 km*."
//              time and width; a red survey line A-B        "Over roughly *200 million years*: *2,000 to 8,000 km*."
//                                                          "Enough to split *Pangaea* and open the *Atlantic Ocean*."
// D 40.6-49.2  Section A-B: rigid plates on hotter, slowly  "Rigid plates ride on hotter rock that *slowly flows*."
//              flowing rock; new seafloor at the ridge      "At the ridge, *new seafloor* forms as they pull apart."
// E 49.0-53.2  Payoff card                                 "The Atlantic is *still widening*, at ~fingernail speed~."
const W = 864, H = 1080;
const { clamp, seg, lerp, fmt, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  paper: '#EFE7D0', sage: '#B9C69C', sageDeep: '#A3B386', ink: '#4A3424', soft: 'rgba(74,52,36,0.70)', faint: 'rgba(74,52,36,0.20)',
  red: '#C23B2C', green: '#3F6B3A', sea: '#CAD8CC', seaDeep: '#A9C2B6', skin: '#E4C7A5', nail: '#F1D9CC', edge: '#FBF5EC',
  floor: '#94AEA5', hot: '#C98D62', hotDeep: '#AE6C45', card: '#F8F3E4',
};
const F = 'Bitter';

let k, ctx;
const font = (weight, size) => k.font(weight, size, F);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- the numbers ----------
const NAIL_MM_MONTH = 3.5;                 // post: fingernails grow about 3.5 mm a month
const NAIL_MM_YEAR = NAIL_MM_MONTH * 12;   // 42
const RIDGE_MM_YEAR = [10, 40];            // Plate tectonics: Mid-Atlantic Ridge
const NAZCA_MM_YEAR = 160;                 // Plate tectonics: Nazca plate
const SPAN_MYR = 200;                      // post: roughly 200 million years
// mm a year for a million years = mm × 1e6 / 1e6 km
const kmAfter = (myr) => RIDGE_MM_YEAR.map((mm) => (mm * myr * 1e6) / 1e6);
const OCEAN_KM = kmAfter(SPAN_MYR);        // [2000, 8000]
const range = ([a, b], unit) => `${fmt(a)}–${fmt(b)} ${unit}`;

// ---------- the map paper, made once: hypsometric tint, contours, grain, neatline ----------
function makePaper() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const rnd = rng(42);
  const bumps = Array.from({ length: 11 }, () => ({ x: rnd() * W, y: rnd() * H, s: 90 + rnd() * 200, a: (rnd() < 0.3 ? -0.6 : 1) * (0.4 + rnd() * 0.8) }));
  const field = (x, y) => {
    let v = 0.18 * Math.sin(x / 113 + 1.3) * Math.cos(y / 151 - 0.4) + 0.08 * Math.sin((x + y) / 61);
    for (const b of bumps) v += b.a * Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / (2 * b.s * b.s));
    return v;
  };
  // tint at half resolution
  const sw = W / 2, sh = H / 2, small = document.createElement('canvas'); small.width = sw; small.height = sh;
  const sg = small.getContext('2d'), img = sg.createImageData(sw, sh);
  const paper = [239, 231, 208], sage = [201, 211, 176];
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
    const v = field(x * 2, y * 2), u = clamp((v + 0.2) / 1.3) * 0.85;
    const o = (y * sw + x) * 4;
    for (let c = 0; c < 3; c++) img.data[o + c] = paper[c] + (sage[c] - paper[c]) * u;
    img.data[o + 3] = 255;
  }
  sg.putImageData(img, 0, 0);
  g.imageSmoothingEnabled = true; g.drawImage(small, 0, 0, W, H);
  // contours by marching squares
  const step = 7, nx = Math.ceil(W / step) + 1, ny = Math.ceil(H / step) + 1, vals = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) vals[j * nx + i] = field(i * step, j * step);
  let li = 0;
  for (let level = -0.5; level < 1.6; level += 0.07, li++) {
    const index = li % 5 === 0;
    g.strokeStyle = index ? 'rgba(92,64,40,0.30)' : 'rgba(92,64,40,0.16)'; g.lineWidth = index ? 1.6 : 1;
    g.beginPath();
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = vals[j * nx + i], b = vals[j * nx + i + 1], c = vals[(j + 1) * nx + i + 1], d = vals[(j + 1) * nx + i];
      const x = i * step, y = j * step;
      const pts = [];
      const cross = (v0, v1, x0, y0, x1, y1) => {
        if ((v0 > level) === (v1 > level)) return;
        const f = (level - v0) / (v1 - v0);
        pts.push([x0 + (x1 - x0) * f, y0 + (y1 - y0) * f]);
      };
      cross(a, b, x, y, x + step, y); cross(b, c, x + step, y, x + step, y + step);
      cross(d, c, x, y + step, x + step, y + step); cross(a, d, x, y, x, y + step);
      if (pts.length >= 2) { g.moveTo(...pts[0]); g.lineTo(...pts[1]); }
      if (pts.length === 4) { g.moveTo(...pts[2]); g.lineTo(...pts[3]); }
    }
    g.stroke();
  }
  // grain
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(90,60,30,${0.03 + rnd() * 0.06})`;
    g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 1.5, 1 + rnd() * 1.5);
  }
  // neatline with a graticule
  g.strokeStyle = 'rgba(74,52,36,0.55)'; g.lineWidth = 2; g.strokeRect(22, 22, W - 44, H - 44);
  g.lineWidth = 1; g.strokeRect(30, 30, W - 60, H - 60);
  for (let x = 30; x <= W - 30; x += 36) { g.beginPath(); g.moveTo(x, 22); g.lineTo(x, x % 180 === 30 ? 34 : 28); g.moveTo(x, H - 22); g.lineTo(x, H - 28); g.stroke(); }
  for (let y = 30; y <= H - 30; y += 36) { g.beginPath(); g.moveTo(22, y); g.lineTo(28, y); g.moveTo(W - 22, y); g.lineTo(W - 28, y); g.stroke(); }
  return cv;
}
const PAPER = makePaper();

// ---------- timeline ----------
const T = { A: [0, 7.6], B: [7.4, 25.0], C: [24.6, 40.8], D: [40.6, 49.2], E: [49.0, 53.2] };
const CUES = [
  [0.4, 4.3, 'Which is faster: a growing ~fingernail~ or a drifting *continent*?'],
  [4.4, 7.4, 'Let’s put both on one ruler.'],
  [7.6, 11.2, `A fingernail grows about ~${NAIL_MM_MONTH} mm a month~.`],
  [11.3, 16.1, `At the Mid-Atlantic Ridge, plates part by *${RIDGE_MM_YEAR[0]} to ${RIDGE_MM_YEAR[1]} mm a year*.`],
  [16.2, 19.8, 'In a year, both creep *a few centimetres*.'],
  [19.9, 24.6, `The speedy *Nazca Plate* moves about *${NAZCA_MM_YEAR / 10} cm a year*, like growing hair.`],
  [25.0, 28.4, 'Now run the clock for *millions of years*.'],
  [28.5, 32.5, `At that pace, each million years adds *${kmAfter(1)[0]} to ${kmAfter(1)[1]} km*.`],
  [32.6, 36.6, `Over roughly *${SPAN_MYR} million years*: *${fmt(OCEAN_KM[0])} to ${fmt(OCEAN_KM[1])} km*.`],
  [36.7, 40.6, 'Enough to split *Pangaea* and open the *Atlantic Ocean*.'],
  [40.8, 44.8, 'Rigid plates ride on hotter rock that *slowly flows*.'],
  [44.9, 49.0, 'At the ridge, *new seafloor* forms as they pull apart.'],
  [49.2, 52.8, 'The Atlantic is *still widening*, at ~fingernail speed~.'],
];

function background() {
  ctx.drawImage(PAPER, 0, 0);
  font(800, 22); text('RECKON', 56, 76, { spacing: '4px' });
  font(500, 22); text('EARTH · FIELD SURVEY', 176, 76, { color: C.soft, spacing: '1px' });
}

function captions(t) {
  // a paper band behind the caption keeps it readable over the contours
  const vis = CUES.reduce((m, [a, b]) => Math.max(m, span(t, a - 0.2, b + 0.2, 0.3, 0.3)), 0);
  withAlpha(vis * 0.9, () => {
    const g = ctx.createLinearGradient(0, 742, 0, 920);
    g.addColorStop(0, 'rgba(242,236,218,0)'); g.addColorStop(0.25, 'rgba(242,236,218,0.92)');
    g.addColorStop(0.8, 'rgba(242,236,218,0.92)'); g.addColorStop(1, 'rgba(242,236,218,0)');
    ctx.fillStyle = g; ctx.fillRect(34, 742, W - 68, 178);
  });
  k.captions(t, CUES, { x: W / 2, y: 830, maxW: 750, size: 44, lh: 56, family: F, weight: 700, ink: C.ink, marks: { '*': C.red, '~': C.green } });
}

// ---------- drawing pieces ----------
/** A fingertip seen from above, pointing right; mm units. The nail's free edge starts at x = 0. */
function finger(x0, cy, s, growth, rot = 0) {
  ctx.save(); ctx.translate(x0, cy); ctx.rotate(rot); ctx.scale(s, s);
  const lw = 2.2 / s;
  ctx.beginPath(); ctx.moveTo(-70, -7); ctx.lineTo(-5.6, -7); ctx.arc(-5.6, 0, 7, -Math.PI / 2, Math.PI / 2); ctx.lineTo(-70, 7); ctx.closePath();
  ctx.fillStyle = C.skin; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = C.ink; ctx.stroke();
  // knuckle creases
  ctx.strokeStyle = 'rgba(74,52,36,0.35)'; ctx.lineWidth = lw * 0.8;
  for (const x of [-27, -29.5]) { ctx.beginPath(); ctx.moveTo(x, -4); ctx.quadraticCurveTo(x - 1.2, 0, x, 4); ctx.stroke(); }
  // nail plate, then its free edge in a paler tone
  const n0 = -14, n1 = growth;
  ctx.beginPath(); ctx.roundRect(n0, -5.3, n1 - n0, 10.6, [3.2, 5.3, 5.3, 3.2]);
  ctx.fillStyle = C.nail; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = C.edge; ctx.fillRect(-1.6, -6, n1 + 8, 12);
  ctx.beginPath(); ctx.ellipse(n0, 0, 3.6, 4.2, 0, -Math.PI / 2, Math.PI / 2); ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.roundRect(n0, -5.3, n1 - n0, 10.6, [3.2, 5.3, 5.3, 3.2]); ctx.lineWidth = lw; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.restore();
}

const X0 = 290;                              // the ruler's zero, and the start line
const RULER = { x: 222, y: 340, w: 590, h: 58 };
const scaleAt = (t) => lerp(9.6, (700 - X0) / NAZCA_MM_YEAR, eio(seg(t, 19.9, 21.3)));

function ruler(s, y = RULER.y, x0 = X0, left = RULER.x, w = RULER.w) {
  rrect(left, y, w, RULER.h, 6); ctx.fillStyle = 'rgba(251,247,236,0.95)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
  const max = Math.floor((left + w - 8 - x0) / s);
  const minor = seg(s, 3.2, 6.5);
  ctx.lineCap = 'butt';
  for (let mm = 0; mm <= max; mm++) {
    const x = x0 + mm * s, cm = mm % 10 === 0, half = mm % 5 === 0;
    const a = cm || half ? 1 : minor;
    if (a <= 0) continue;
    withAlpha(a, () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = cm ? 2 : 1.3;
      ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.lineTo(x, y + (cm ? 24 : half ? 16 : 9)); ctx.stroke();
    });
    if (cm) {
      const n = mm / 10, show = n % 2 === 0 ? 1 : seg(s, 5.5, 8);
      withAlpha(show, () => { font(600, 22); text(String(n), x, y + 47, { align: 'center' }); });
    }
  }
  font(600, 22); text('cm', left + 12, y + 47, { color: C.soft });
}

/** One plate row: fixed plate on the left, new seafloor in the gap, moving plate on the right. */
function plateRow(y, h, gapPx, name, value, t) {
  const right = X0 + gapPx;
  ctx.save();
  ctx.beginPath(); ctx.rect(48, y, 768, h); ctx.clip();
  const hatch = (x0, x1, shift) => {
    ctx.fillStyle = C.sage; ctx.fillRect(x0, y, x1 - x0, h);
    ctx.strokeStyle = 'rgba(74,52,36,0.22)'; ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = x0 - h + (((shift % 14) + 14) % 14) - 14; x < x1 + h; x += 14) { ctx.moveTo(x, y + h); ctx.lineTo(x + h, y); }
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y, x1 - x0, h); ctx.clip(); ctx.stroke(); ctx.restore();
  };
  hatch(48, X0, 0);
  if (gapPx > 0.5) {
    ctx.fillStyle = C.floor; ctx.fillRect(X0, y, gapPx, h);
    // stripes of new floor, parallel to the ridge, carried outward
    ctx.strokeStyle = 'rgba(248,244,232,0.5)'; ctx.lineWidth = 1.2;
    const mid = X0 + gapPx / 2;
    for (let d = 6; d < gapPx / 2; d += 9) { ctx.beginPath(); ctx.moveTo(mid - d, y); ctx.lineTo(mid - d, y + h); ctx.moveTo(mid + d, y); ctx.lineTo(mid + d, y + h); ctx.stroke(); }
    ctx.strokeStyle = C.red; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(mid, y); ctx.lineTo(mid, y + h); ctx.stroke();
  }
  hatch(right, 816, gapPx);
  ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
  ctx.strokeRect(48, y, X0 - 48, h);
  ctx.beginPath(); ctx.moveTo(816, y); ctx.lineTo(right, y); ctx.lineTo(right, y + h); ctx.lineTo(816, y + h); ctx.stroke();
  font(600, 22); text(name, 62, y + h / 2 + 1, { base: 'middle' });
  if (value) {
    font(700, 23); const w = ctx.measureText(value).width + 16;
    rrect(right + 10, y + h / 2 - 15, w, 30, 6); ctx.fillStyle = 'rgba(251,247,236,0.92)'; ctx.fill();
    text(value, right + 18, y + h / 2 + 1, { base: 'middle' });
  }
}

function rowHeader(s, y) { font(700, 22); text(s, 56, y, { color: C.soft, spacing: '2px' }); }

// ---------- the map: a simplified Atlantic ----------
const MAP = { x: 48, y: 214, w: 768, h: 492, cx: 432 };
const SEAM = [[-6, 228], [-22, 268], [-12, 306], [-38, 346], [-64, 392], [-58, 428], [-22, 450], [20, 466], [40, 490], [30, 530], [12, 580], [-4, 628], [-10, 664]];
const EAST = [[26, 680], [90, 668], [150, 628], [205, 560], [250, 506], [480, 486], [480, 200], [60, 200], [20, 214]];
const WEST = [[-30, 690], [-80, 708], [-140, 694], [-200, 646], [-262, 566], [-480, 540], [-480, 200], [-60, 200], [-22, 214]];
const MED = [[72, 318], [480, 298], [480, 352], [92, 344]];
const GULF = [[-122, 398], [-480, 378], [-480, 472], [-160, 464], [-120, 438]];
const seamX = (y) => {
  for (let i = 0; i < SEAM.length - 1; i++) {
    const [x0, y0] = SEAM[i], [x1, y1] = SEAM[i + 1];
    if (y >= y0 && y <= y1) return lerp(x0, x1, (y - y0) / (y1 - y0));
  }
  return SEAM.at(-1)[0];
};

/** Elapsed time in the sped-up part, in millions of years. */
function myrAt(t) {
  if (t < 30.9) return eio(seg(t, 26.4, 28.4));
  return lerp(1, SPAN_MYR, eio(seg(t, 30.9, 35.8)));
}
const GAP_MAX = 300;
const gapPx = (myr) => (GAP_MAX * myr) / SPAN_MYR;

function poly(points, off, cx = MAP.cx) {
  ctx.beginPath();
  points.forEach(([dx, y], i) => (i ? ctx.lineTo(cx + dx + off, y) : ctx.moveTo(cx + dx + off, y)));
  ctx.closePath();
}
function seamPath(off, cx = MAP.cx) {
  ctx.beginPath();
  SEAM.forEach(([dx, y], i) => (i ? ctx.lineTo(cx + dx + off, y) : ctx.moveTo(cx + dx + off, y)));
}

function drawMap(myr, t, { labels = 0, pangaea = 0 } = {}) {
  const d = gapPx(myr);
  ctx.save();
  rrect(MAP.x, MAP.y, MAP.w, MAP.h, 10); ctx.clip();
  ctx.fillStyle = C.sea; ctx.fillRect(MAP.x, MAP.y, MAP.w, MAP.h);
  ctx.strokeStyle = 'rgba(70,100,96,0.18)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = MAP.y + 10; y < MAP.y + MAP.h; y += 12) { ctx.moveTo(MAP.x, y); ctx.lineTo(MAP.x + MAP.w, y); }
  ctx.stroke();
  // isochrons every 25 million years, carried away from the ridge
  ctx.strokeStyle = 'rgba(74,52,36,0.30)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
  for (let tau = 25; tau < myr; tau += 25) {
    const off = (d - gapPx(tau)) / 2;
    seamPath(-off); ctx.stroke(); seamPath(off); ctx.stroke();
  }
  ctx.setLineDash([]);
  if (d > 1) {
    ctx.strokeStyle = C.red; ctx.lineWidth = 3.2; seamPath(0); ctx.stroke();
    ctx.lineWidth = 2;
    for (const [dx, y] of SEAM.slice(1, -1)) { ctx.beginPath(); ctx.moveTo(MAP.cx + dx - 6, y); ctx.lineTo(MAP.cx + dx + 6, y); ctx.stroke(); }
  }
  // land
  for (const [shape, notch, off] of [[WEST, GULF, -d / 2], [EAST, MED, d / 2]]) {
    ctx.save();
    poly([...SEAM, ...shape], off);
    ctx.fillStyle = C.sage; ctx.fill();
    ctx.clip();
    ctx.strokeStyle = 'rgba(74,52,36,0.16)'; ctx.lineWidth = 1.2;
    for (let j = 1; j <= 4; j++) { seamPath(off + (off < 0 ? -1 : 1) * j * 16); ctx.stroke(); }
    poly(notch, off); ctx.fillStyle = C.sea; ctx.fill();
    ctx.restore();
    poly([...SEAM, ...shape], off); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.stroke();
    poly(notch, off); ctx.stroke();
  }
  ctx.restore();
  rrect(MAP.x, MAP.y, MAP.w, MAP.h, 10); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();

  const halo = (s, x, y, color, size = 24, weight = 700, align = 'center', haloColor = C.sea) => {
    font(weight, size); ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = haloColor; ctx.strokeText(s, x, y);
    text(s, x, y, { color, align, base: 'middle' });
  };
  withAlpha(pangaea, () => halo('PANGAEA', MAP.cx + 150, 600, C.ink, 26, 800, 'center', C.sage));
  withAlpha(labels, () => {
    halo('Atlantic', MAP.cx + seamX(370), 352, C.ink, 26, 700);
    halo('Ocean', MAP.cx + seamX(370), 384, C.ink, 26, 700);
    halo('Mid-Atlantic', MAP.cx + seamX(640) + 14, 630, C.red, 22, 700, 'left');
    halo('Ridge', MAP.cx + seamX(640) + 14, 656, C.red, 22, 700, 'left');
    halo('the Americas', Math.max(150, MAP.cx - d / 2 - 130), 600, C.ink, 24, 600, 'center', C.sage);
    halo('Africa', MAP.cx + d / 2 + 115, 560, C.ink, 24, 600, 'center', C.sage);
    halo('Europe', MAP.cx + d / 2 + 110, 252, C.ink, 24, 600, 'center', C.sage);
  });
}

// ---------- scenes ----------
function sceneA(t) {
  const stamp = (cx, cy, r, a, inside) => withAlpha(a, () => {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = C.card; ctx.fill();
    ctx.clip(); inside(); ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r + 9, 0, TAU); ctx.lineWidth = 1.2; ctx.stroke();
  });
  const p1 = eout(seg(t, 0.3, 1.1)), p2 = eout(seg(t, 0.8, 1.6));
  const cy = 400, r = 150;
  stamp(240, cy + (1 - p1) * 20, r, p1, () => {
    finger(240, cy - 40 + (1 - p1) * 20, 9, 1, -Math.PI / 2);
  });
  stamp(624, cy + (1 - p2) * 20, r, p2, () => {
    ctx.save(); ctx.translate(624, cy + (1 - p2) * 20); ctx.scale(0.42, 0.42); ctx.translate(-MAP.cx, -460);
    drawMap(90, 0);
    ctx.restore();
  });
  withAlpha(seg(t, 1.2, 1.7), () => {
    font(700, 28); text('fingernail', 240, cy + r + 52, { color: C.green, align: 'center' });
    text('continent', 624, cy + r + 52, { color: C.red, align: 'center' });
    font(800, 64); text('?', W / 2, cy + 4, { color: C.ink, align: 'center', base: 'middle' });
  });
  // a ruler slides in under both
  const rp = eout(seg(t, 4.6, 5.6));
  withAlpha(rp, () => {
    ctx.save(); ctx.translate((1 - rp) * -120, 0);
    ruler(9.6, 652, 162, 104, 656);
    ctx.restore();
  });
}

function sceneB(t) {
  const s = scaleAt(t);
  const months = 12 * seg(t, 8.4, 15.6);
  const nail = NAIL_MM_MONTH * months;
  const slow = (RIDGE_MM_YEAR[0] / 12) * months, fast = (RIDGE_MM_YEAR[1] / 12) * months;
  // time strip (fades once its year is done)
  withAlpha(1 - seg(t, 19.6, 20.2), () => {
    font(700, 22); text('TIME', 56, 141, { color: C.soft, spacing: '2px' });
    font(700, 24); text(months >= 12 ? '1 year' : `${Math.floor(months)} month${Math.floor(months) === 1 ? '' : 's'}`, 128, 141, { color: C.ink });
    for (let i = 0; i < 12; i++) {
      const x = X0 + i * 43, f = clamp(months - i);
      rrect(x, 124, 39, 22, 4); ctx.lineWidth = 1.6; ctx.strokeStyle = C.ink; ctx.stroke();
      if (f > 0) { rrect(x, 124, 39 * f, 22, 4); ctx.fillStyle = C.ink; ctx.fill(); }
    }
  });
  // the start line
  ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.setLineDash([7, 6]);
  ctx.beginPath(); ctx.moveTo(X0, 160); ctx.lineTo(X0, 650); ctx.stroke(); ctx.setLineDash([]);
  // fingernail
  rowHeader('FINGERNAIL', 176);
  finger(X0, 258, s, nail);
  const tipX = X0 + nail * s;
  withAlpha(seg(t, 8.6, 9.0), () => {
    font(700, 24); const label = `${fmt(nail)} mm`;
    const w = ctx.measureText(label).width + 18;
    rrect(tipX + 12, 241, w, 34, 6); ctx.fillStyle = 'rgba(251,247,236,0.92)'; ctx.fill();
    text(label, tipX + 21, 259, { color: C.green, base: 'middle' });
  });
  ruler(s);
  // the ridge, at its slow and fast ends
  rowHeader('MID-ATLANTIC RIDGE', 432);
  const fmtmm = (v) => `${fmt(v)} mm`;
  plateRow(444, 44, slow * s, 'slow end', t > 8.6 ? fmtmm(slow) : '', t);
  plateRow(498, 44, fast * s, 'fast end', t > 8.6 ? fmtmm(fast) : '', t);
  // the Nazca Plate joins once the ruler has zoomed out
  const np = eout(seg(t, 20.6, 21.3));
  withAlpha(np, () => {
    ctx.save(); ctx.translate(0, (1 - np) * 18);
    rowHeader('NAZCA PLATE', 580);
    const nz = NAZCA_MM_YEAR * eio(seg(t, 21.5, 23.6));
    plateRow(592, 44, nz * s, 'in a year', fmtmm(nz), t);
    ctx.restore();
  });
}

function sceneC(t) {
  const myr = myrAt(t);
  const labels = seg(t, 36.8, 37.5), pangaea = span(t, 25.2, 32.4, 0.6, 0.6);
  drawMap(myr, t, { labels, pangaea });
  withAlpha(seg(t, 25.4, 26.0), () => {
    font(700, 22); text('SIMPLIFIED DIAGRAM, NOT AN ACCURATE MAP', W / 2, MAP.y + MAP.h + 32, { color: C.soft, align: 'center', spacing: '1px' });
  });
  // counters
  withAlpha(seg(t, 25.6, 26.3), () => {
    const box = (x, w, head, value, unit, color) => {
      rrect(x, 124, w, 78, 8); ctx.fillStyle = 'rgba(251,247,236,0.9)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
      font(700, 22); text(head, x + 16, 152, { color: C.soft, spacing: '2px' });
      font(800, 34); text(value, x + 16, 188, { color });
      const vw = ctx.measureText(value).width;
      font(600, 22); text(unit, x + 24 + vw, 188, { color: C.soft });
    };
    // the width is computed from the time as shown, so the two boxes always agree
    const shown = myr < 0.995 ? Math.round(myr * 10) / 10 : Math.round(myr);
    box(48, 330, 'TIME', shown < 1 ? shown.toFixed(1) : fmt(shown), 'million years', C.ink);
    const km = kmAfter(shown);
    box(392, 424, 'OCEAN WIDTH', `${fmt(km[0])}–${fmt(km[1])}`, 'km', C.red);
  });
  // a survey line across the ocean: the section we cut next
  const sp = eio(seg(t, 39.2, 40.2));
  withAlpha(sp > 0 ? 1 : 0, () => {
    const y = 520, xa = 92, xb = 772;
    ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.setLineDash([12, 7]);
    ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(lerp(xa, xb, sp), y); ctx.stroke(); ctx.setLineDash([]);
    const mark = (x, s, a) => withAlpha(a, () => {
      ctx.beginPath(); ctx.arc(x, y, 17, 0, TAU); ctx.fillStyle = C.red; ctx.fill();
      font(800, 22); text(s, x, y + 1, { color: C.card, align: 'center', base: 'middle' });
    });
    mark(xa, 'A', seg(t, 39.2, 39.4)); mark(xb, 'B', seg(t, 40.0, 40.2));
  });
}

function sceneD(t) {
  const top = (x) => 382 - 44 * Math.exp(-(((x - W / 2) / 120) ** 2));
  const bot = (x) => 470 - 56 * Math.exp(-(((x - W / 2) / 95) ** 2));
  const L = 48, R = 816, cx = W / 2;
  font(700, 22); text('SECTION A–B · DIAGRAM, NOT TO SCALE', 56, 160, { color: C.soft, spacing: '1px' });
  ctx.save();
  rrect(L, 184, R - L, 520, 10); ctx.clip();
  // ocean
  ctx.fillStyle = C.sea; ctx.fillRect(L, 184, R - L, 260);
  ctx.strokeStyle = 'rgba(70,100,96,0.25)'; ctx.lineWidth = 1.2;
  for (let y = 200; y < 330; y += 14) {
    ctx.beginPath();
    for (let x = L; x <= R; x += 8) ctx.lineTo(x, y + 2.5 * Math.sin(x / 26 + y));
    ctx.stroke();
  }
  // hotter rock below, flowing slowly
  const g = ctx.createLinearGradient(0, 400, 0, 704);
  g.addColorStop(0, C.hot); g.addColorStop(1, C.hotDeep);
  ctx.fillStyle = g; ctx.fillRect(L, 380, R - L, 330);
  // slow, soft deformation: wavy lines that gently bend back and forth
  ctx.strokeStyle = 'rgba(255,240,220,0.32)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  [500, 540, 580, 650, 690].forEach((y, i) => {
    ctx.beginPath();
    for (let x = L; x <= R; x += 8) ctx.lineTo(x, y + 7 * Math.sin(x / 70 + i * 1.7) * Math.sin(t * 0.8 + i));
    ctx.stroke();
  });
  // two rigid plates moving apart; the youngest floor, at the ridge, is warmest
  for (const side of [-1, 1]) {
    const xs = side < 0 ? [cx - 6, L - 2] : [cx + 6, R + 2];
    const plate = () => {
      ctx.beginPath();
      const n = 60;
      for (let i = 0; i <= n; i++) { const x = lerp(xs[0], xs[1], i / n); i ? ctx.lineTo(x, top(x)) : ctx.moveTo(x, top(x)); }
      for (let i = n; i >= 0; i--) { const x = lerp(xs[0], xs[1], i / n); ctx.lineTo(x, bot(x)); }
      ctx.closePath();
    };
    plate();
    const pg = ctx.createLinearGradient(cx, 0, side < 0 ? L : R, 0);
    pg.addColorStop(0, '#C9B28C'); pg.addColorStop(0.25, C.sage); pg.addColorStop(1, C.sageDeep);
    ctx.fillStyle = pg; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(74,52,36,0.14)'; ctx.lineWidth = 1.4;
    const shift = (((t * 16) % 26) + 26) % 26;
    ctx.beginPath();
    for (let x = -60; x < W + 60; x += 26) {
      const xx = side < 0 ? x - shift : x + shift;
      ctx.moveTo(xx, 470); ctx.lineTo(xx + 50, 330);
    }
    ctx.stroke();
    ctx.restore();
    plate(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.stroke();
    // an arrow showing the motion
    const ax = cx + side * 250, ay = 446;
    ctx.save(); ctx.translate(ax, ay); ctx.scale(side, 1);
    ctx.beginPath(); ctx.moveTo(-40, -7); ctx.lineTo(18, -7); ctx.lineTo(18, -18); ctx.lineTo(44, 0); ctx.lineTo(18, 18); ctx.lineTo(18, 7); ctx.lineTo(-40, 7); ctx.closePath();
    ctx.fillStyle = C.card; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
  }
  // the ridge
  ctx.strokeStyle = C.red; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cx, top(cx) - 4); ctx.lineTo(cx, bot(cx) + 6); ctx.stroke();
  const glow = ctx.createRadialGradient(cx, bot(cx), 0, cx, bot(cx), 46);
  glow.addColorStop(0, 'rgba(236,120,60,0.75)'); glow.addColorStop(1, 'rgba(236,120,60,0)');
  ctx.fillStyle = glow; ctx.fillRect(cx - 50, bot(cx) - 50, 100, 100);
  ctx.restore();
  rrect(L, 184, R - L, 520, 10); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
  // labels
  const lab = (s, x, y, a, color = C.ink, size = 24, align = 'center', halo = null) => withAlpha(a, () => {
    font(700, size);
    if (halo) { ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = halo; ctx.strokeText(s, x, y); }
    text(s, x, y, { color, align, base: 'middle' });
  });
  lab('ocean', 140, 232, seg(t, 41.0, 41.5), 'rgba(52,84,80,0.9)');
  lab('rigid plate', cx - 250, 408, seg(t, 41.2, 41.7), C.ink, 24, 'center', C.sage);
  lab('rigid plate', cx + 250, 408, seg(t, 41.4, 41.9), C.ink, 24, 'center', C.sage);
  lab('hotter rock that flows slowly', cx, 612, seg(t, 42.4, 43.0), C.card, 26);
  // new seafloor at the ridge
  withAlpha(seg(t, 45.0, 45.6), () => {
    const y = top(cx) - 4;
    ctx.strokeStyle = C.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, y - 8); ctx.lineTo(cx, 262); ctx.stroke();
    font(700, 24); const s = 'ridge: new seafloor forms here', w = ctx.measureText(s).width + 28;
    rrect(cx - w / 2, 226, w, 40, 20); ctx.fillStyle = C.red; ctx.fill();
    text(s, cx, 247, { color: C.card, align: 'center', base: 'middle' });
  });
}

function sceneE(t) {
  const p = eout(seg(t, 49.2, 49.9));
  withAlpha(p, () => {
    rrect(78, 196, W - 156, 470, 14); ctx.fillStyle = 'rgba(248,243,228,0.94)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    rrect(86, 204, W - 172, 454, 10); ctx.lineWidth = 1; ctx.stroke();
    font(800, 58); text('Continents drift at', W / 2, 296 + (1 - p) * 14, { align: 'center', base: 'middle' });
    text('fingernail speed', W / 2, 362 + (1 - p) * 14, { color: C.green, align: 'center', base: 'middle' });
    // a short ruler with a red mark at the fast end of the ridge
    ruler(9.6, 420, 252, 196, 472);
    const mx = 252 + RIDGE_MM_YEAR[1] * 9.6 * eout(seg(t, 49.8, 50.8));
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(252, 412); ctx.lineTo(mx, 412); ctx.stroke();
    font(600, 26); text(`${RIDGE_MM_YEAR[0] / 10} to ${RIDGE_MM_YEAR[1] / 10} cm a year, for some ${SPAN_MYR} million years`, W / 2, 540, { align: 'center', base: 'middle' });
    font(500, 22); text('Source: Wikipedia, “Plate tectonics”', W / 2, 610, { color: C.soft, align: 'center', base: 'middle' });
  });
}

Kit.scene({
  width: W, height: H, duration: 53.2,
  fonts: [{ family: F, file: 'Bitter.woff2', weight: '400 800' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
