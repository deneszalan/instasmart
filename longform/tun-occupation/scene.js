// "Six months under occupation" (« Six mois sous l’occupation »): the long film of Tunisia 1943's Occupation section,
// 16:9, 1920x1080. The series' schematic map of Tunisia stays on the left: the Axis-held east shaded, the front line,
// the towns where things happened. On the right, each chapter's story as cards, numbers and drawings.
// Look: a deep wine-dark ground with a faint lattice of eight-pointed stars (Tunisian tilework); accent colour: rose
// (#f3a2bd); motif: the eight-pointed seal, the Bey's and the protectorate's, which marks the powers, the chapters and
// the stamps (DOCUMENTED, DISPUTED); a calendar of the 179 days of occupation. Allied blue, Axis terracotta, as in the
// series. Fraunces for titles, Barlow for labels. No people drawn: seals, papers, dots and simple shapes.
// The same scene plays the French version: kit.js swaps every whole string for its labels-fr.json entry, so words and
// numbers are drawn as separate strings. Map outlines: Natural Earth (public domain), simplified; the Mediterranean
// inset's coasts are schematic. Dates and counts are computed here and checked against the narration.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const TAU = Math.PI * 2, RAD = Math.PI / 180;

const C = {
  bg0: '#140910', bg1: '#36182b', tile: 'rgba(243,162,189,0.06)',
  sea: '#174850', sea2: '#1d5961', neigh: '#4f5a4c',
  ink: '#f6eedc', soft: 'rgba(246,238,220,0.76)', faint: 'rgba(246,238,220,0.22)', dark: '#2a2620',
  rose: '#f3a2bd', roseDk: '#b65477', allied: '#88c2e4', axis: '#de7a5c', bey: '#9fdcc9', vichy: '#b9c0dc', italy: '#93c27a',
  star: '#f2d35b', card: 'rgba(22,9,17,0.92)', panel: 'rgba(22,9,17,0.8)', paper: '#efe4c8', paper2: '#e2d4b0',
  stampG: '#3f7d55', stampO: '#b5761c', stampR: '#b0472f',
};
const DISPLAY = 'Fraunces', TEXT = 'Barlow';

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
function txt(str, x, y, { size = 36, weight = 600, family = TEXT, color = C.ink, align = 'left', spacing = '0px', base = 'middle' } = {}) {
  k.font(weight, size, family);
  k.text(str, x, y, { color, align, base, spacing });
}
function textW(str, { size = 36, weight = 600, family = TEXT, spacing = '0px' } = {}) {
  k.font(weight, size, family); ctx.letterSpacing = spacing; const w = ctx.measureText(str).width; ctx.letterSpacing = '0px'; return w;
}
/** The largest size up to `size` at which str fits in maxW. */
function fit(str, maxW, size, o = {}) { let z = size; while (z > 24 && textW(str, { ...o, size: z }) > maxW) z -= 2; if (z < 30 && window.__SMALL) window.__SMALL.set(Kit.tr(str), Math.min(z, window.__SMALL.get(Kit.tr(str)) ?? 99)); return z; }
/** Text that shrinks to fit maxW. */
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** Wrapped, centred text (kit's rich), for a few lines in a card. */
function para(str, cx, cy, maxW, { size = 34, weight = 500, color = C.ink, family = TEXT, lh = 1.3, marks = {} } = {}) {
  k.rich(str, cx, cy, { maxW, size, lh: size * lh, weight, family, ink: color, marks });
}
/** A rounded label as wide as its text. */
function chip(str, cx, cy, { color = C.ink, bg = C.card, size = 34, weight = 700, a = 1, align = 'center', line = true, family = TEXT, spacing = '0px', fg = null } = {}) {
  const w = textW(str, { size, weight, family, spacing }), pad = size * 0.62, h = size * 1.6;
  const x0 = align === 'left' ? cx : align === 'right' ? cx - w - pad * 2 : cx - w / 2 - pad;
  A(a, () => {
    k.rrect(x0, cy - h / 2, w + pad * 2, h, h / 2); ctx.fillStyle = bg; ctx.fill();
    if (line) { ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke(); }
    txt(str, x0 + pad + w / 2, cy + 1, { size, weight, color: fg ?? color, align: 'center', family, spacing });
  });
  return w + pad * 2;
}
function card(x, y, w, h, { bg = C.card, r = 18, line = null, lw = 3 } = {}) {
  k.rrect(x, y, w, h, r); ctx.fillStyle = bg; ctx.fill();
  if (line) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); }
}
function arrowHead(x, y, ang, col, size = 22) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x + Math.cos(ang) * size, y + Math.sin(ang) * size);
  ctx.lineTo(x + Math.cos(ang + 2.5) * size, y + Math.sin(ang + 2.5) * size);
  ctx.lineTo(x + Math.cos(ang - 2.5) * size, y + Math.sin(ang - 2.5) * size);
  ctx.closePath(); ctx.fill();
}
/** A polyline drawn up to fraction u of its length, with an arrow head at the tip. */
function trace(pts, u, col, { w = 8, dash = null, head = true, headSize = 22, cap = 'round' } = {}) {
  if (u <= 0) return;
  let tot = 0; const L = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let left = u * tot, tip = pts[0], ang = 0;
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = cap; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i < pts.length && left > 0; i++) {
    const f = Math.min(1, left / L[i - 1]);
    tip = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    ctx.lineTo(...tip); left -= L[i - 1];
  }
  ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  if (head) arrowHead(tip[0] + Math.cos(ang) * 6, tip[1] + Math.sin(ang) * 6, ang, col, headSize);
}
/** A smooth curve through points (Catmull-Rom), as a polyline. */
function smooth(pts, n = 12) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const u = j / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * u + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * u3)));
    }
  }
  out.push(pts.at(-1));
  return out;
}
/** A rubber stamp, as on the series' archive cards: DOCUMENTED, REPORTED, DISPUTED. */
function stamp(str, x, y, col, a = 1, rot = -0.08, size = 34) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const w = textW(str, { size, weight: 800, spacing: '3px' }) + 36;
    ctx.strokeStyle = col; ctx.lineWidth = 4; k.rrect(-w / 2, -size * 0.85, w, size * 1.7, 6); ctx.stroke();
    txt(str, 0, 2, { size, weight: 800, color: col, align: 'center', spacing: '3px' });
    ctx.restore();
  });
}
/** The motif: an eight-pointed seal (two squares turned 45° to each other, a ring inside). */
function seal(x, y, r, col, { fill = 0, a = 1, rot = 0, lw = 4 } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 16; i++) { const ang = (i / 16) * TAU - Math.PI / 2, rr = i % 2 ? r * 0.8 : r; i ? ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr) : ctx.moveTo(Math.cos(ang) * rr, Math.sin(ang) * rr); }
    ctx.closePath();
    if (fill > 0) { ctx.save(); ctx.globalAlpha *= fill; ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, TAU); ctx.lineWidth = lw * 0.75; ctx.stroke();
    ctx.restore();
  });
}
/** A cross through something refused. */
function cross(x, y, r, col, u = 1) {
  if (u <= 0) return;
  ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineCap = 'round';
  const a = Math.min(1, u * 2), b = Math.max(0, u * 2 - 1);
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * a, y - r + 2 * r * a); ctx.stroke();
  if (b > 0) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); ctx.stroke(); }
  ctx.lineCap = 'butt';
}
/** A six-pointed star outline, as the badge Jews were made to wear in some towns. */
function badge(x, y, r, a = 1) {
  A(a, () => {
    ctx.strokeStyle = C.star; ctx.lineWidth = 5; ctx.lineJoin = 'round';
    for (const off of [-Math.PI / 2, Math.PI / 2]) {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) { const ang = off + (i / 3) * TAU; i ? ctx.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r) : ctx.moveTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r); }
      ctx.closePath(); ctx.stroke();
    }
  });
}
/** A small flame on a candle, for those who died. */
function candle(x, y, t, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.paper2; ctx.fillRect(x - 12, y, 24, 70);
    const fl = 1 + 0.06 * Math.sin(t * 7) + 0.04 * Math.sin(t * 11.3);
    const g = ctx.createRadialGradient(x, y - 22, 2, x, y - 22, 60); g.addColorStop(0, 'rgba(255,214,140,0.45)'); g.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 22, 60, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.ellipse(x, y - 20, 9, 20 * fl, 0, 0, TAU); ctx.fill();
  });
}

// ---------- dates, checked against the narration ----------
const DAY = 86400000, utc = (y, m, d) => Date.UTC(y, m - 1, d);
const OCC0 = utc(1942, 11, 9), OCC1 = utc(1943, 5, 7);           // German forces in Tunis; British troops enter Tunis
const OCC_DAYS = Math.round((OCC1 - OCC0) / DAY);                  // 179, as in the post
const dayOf = (ms) => Math.round((ms - OCC0) / DAY);
const REIGN = Math.round((utc(1943, 5, 14) - utc(1942, 6, 19)) / DAY); // 329, as in the post
if (OCC_DAYS !== 179 || REIGN !== 329 || new Date(OCC0).getUTCDay() !== 1) throw new Error('dates');
const MARKS = { leaders: dayOf(utc(1942, 11, 23)), order: dayOf(utc(1942, 12, 6)), roundup: dayOf(utc(1942, 12, 9)), fine: dayOf(utc(1942, 12, 22)) };
if (MARKS.leaders !== 14) throw new Error('two weeks');
const WORKERS = 5000, PER_DOT = 50, DOTS = WORKERS / PER_DOT;    // "about 5,000", one dot for 50 men
const SHELTERED = 24;                                              // "about two dozen people"
const FINE = 20000000;                                             // 20 million francs, FRUS 1943 doc. 258

// ---------- the map (Natural Earth, simplified) ----------
const MAPDATA = {"TUN":[[[33.181,11.504],[32.902,11.457],[32.637,11.45],[32.507,11.562],[32.435,11.547],[32.369,11.443],[32.136,10.874],[32.004,10.773],[31.962,10.705],[31.974,10.629],[31.954,10.608],[31.84,10.586],[31.744,10.5],[31.715,10.428],[31.715,10.316],[31.68,10.266],[31.518,10.132],[31.428,10.107],[31.079,10.244],[30.986,10.244],[30.915,10.269],[30.842,10.255],[30.731,10.194],[30.641,10.1],[30.354,9.873],[30.331,9.743],[30.229,9.52],[32.072,9.045],[32.105,9.02],[32.526,8.332],[32.837,8.282],[33.095,8.087],[33.108,8.001],[33.184,7.871],[33.208,7.749],[33.232,7.724],[33.414,7.709],[33.659,7.555],[33.801,7.497],[33.894,7.479],[34.095,7.519],[34.199,7.63],[34.245,7.767],[34.414,7.832],[34.53,8.095],[34.637,8.228],[34.681,8.21],[34.763,8.271],[34.902,8.249],[35.067,8.3],[35.241,8.433],[35.29,8.318],[35.326,8.293],[35.403,8.289],[35.508,8.336],[35.621,8.329],[35.685,8.307],[35.751,8.257],[35.827,8.242],[36.036,8.275],[36.146,8.318],[36.244,8.307],[36.351,8.354],[36.43,8.357],[36.469,8.296],[36.491,8.167],[36.526,8.17],[36.663,8.429],[36.732,8.462],[36.768,8.408],[36.785,8.411],[36.803,8.555],[36.837,8.642],[36.94,8.602],[36.974,8.717],[36.979,8.825],[37.021,8.905],[37.153,9.038],[37.193,9.16],[37.234,9.211],[37.235,9.344],[37.276,9.419],[37.267,9.455],[37.31,9.553],[37.3,9.574],[37.345,9.743],[37.328,9.859],[37.271,9.862],[37.213,9.772],[37.154,9.808],[37.149,9.88],[37.197,9.927],[37.213,9.923],[37.234,9.862],[37.227,9.819],[37.262,9.866],[37.246,9.981],[37.266,10.05],[37.178,10.273],[37.159,10.212],[37.175,10.204],[37.171,10.147],[37.159,10.129],[37.143,10.136],[37.129,10.219],[37.095,10.226],[37.11,10.219],[37.077,10.176],[37.028,10.183],[36.977,10.219],[36.881,10.348],[36.822,10.298],[36.847,10.255],[36.839,10.219],[36.798,10.19],[36.786,10.248],[36.817,10.273],[36.749,10.32],[36.73,10.356],[36.729,10.438],[36.756,10.518],[36.773,10.539],[36.864,10.568],[36.896,10.734],[37.006,10.888],[37.05,10.903],[37.087,11.032],[37.063,11.061],[37.021,11.047],[36.918,11.094],[36.871,11.137],[36.854,11.13],[36.788,11.022],[36.452,10.798],[36.378,10.55],[36.337,10.518],[36.217,10.478],[36.112,10.474],[35.981,10.518],[35.922,10.582],[35.842,10.622],[35.77,10.744],[35.78,10.824],[35.766,10.842],[35.734,10.824],[35.699,10.842],[35.638,11.04],[35.614,11.054],[35.603,11.018],[35.555,11.014],[35.518,11.04],[35.506,11.086],[35.459,11.05],[35.334,11.043],[35.266,11.101],[35.238,11.162],[35.219,11.158],[35.206,11.112],[35.093,11.014],[35.033,11.018],[34.957,10.917],[34.873,10.917],[34.838,10.86],[34.797,10.87],[34.768,10.813],[34.655,10.701],[34.633,10.626],[34.532,10.582],[34.497,10.431],[34.424,10.377],[34.414,10.287],[34.372,10.248],[34.304,10.104],[34.213,10.053],[34.171,10.006],[33.983,10.05],[33.828,10.172],[33.684,10.366],[33.647,10.489],[33.706,10.716],[33.671,10.741],[33.603,10.737],[33.546,10.672],[33.483,10.716],[33.485,10.78],[33.539,10.91],[33.575,10.932],[33.617,10.906],[33.637,10.935],[33.627,10.96],[33.644,10.986],[33.618,11.043],[33.541,11.112],[33.49,11.115],[33.455,11.09],[33.392,11.112],[33.363,11.101],[33.372,11.13],[33.331,11.169],[33.287,11.295],[33.311,11.133],[33.281,11.122],[33.222,11.169],[33.184,11.418],[33.206,11.428],[33.259,11.353],[33.181,11.504]],[[33.841,10.993],[33.801,11.061],[33.738,10.971],[33.698,10.957],[33.733,10.957],[33.728,10.942],[33.64,10.888],[33.654,10.87],[33.688,10.878],[33.735,10.809],[33.703,10.78],[33.715,10.741],[33.759,10.726],[33.813,10.748],[33.885,10.737],[33.897,10.773],[33.88,10.899],[33.897,10.932],[33.841,10.993]],[[34.657,10.964],[34.672,10.986],[34.67,11.101],[34.66,11.112],[34.647,11.097],[34.621,11.054],[34.657,10.964]],[[34.773,11.266],[34.743,11.306],[34.73,11.299],[34.664,11.13],[34.681,11.122],[34.728,11.169],[34.758,11.173],[34.751,11.184],[34.748,11.223],[34.782,11.216],[34.826,11.256],[34.806,11.306],[34.773,11.266]]],"NEIGH":[[[30.0,6.0],[36.855,6.0],[36.903,6.197],[36.947,6.255],[37.024,6.273],[37.07,6.338],[37.094,6.417],[37.083,6.503],[37.058,6.543],[36.974,6.601],[36.953,6.82],[36.893,6.91],[36.891,6.975],[36.926,7.094],[36.915,7.133],[36.915,7.159],[36.994,7.256],[37.023,7.252],[37.083,7.18],[37.09,7.223],[37.07,7.274],[37.083,7.382],[37.051,7.403],[37.041,7.457],[37.055,7.49],[36.987,7.591],[36.987,7.673],[36.964,7.713],[36.97,7.771],[36.994,7.799],[36.889,7.774],[36.854,7.868],[36.877,8.051],[36.958,8.231],[36.926,8.289],[36.901,8.462],[36.94,8.602],[36.891,8.609],[36.849,8.642],[36.803,8.555],[36.785,8.411],[36.768,8.408],[36.732,8.462],[36.663,8.429],[36.526,8.17],[36.491,8.167],[36.469,8.296],[36.43,8.357],[36.351,8.354],[36.244,8.307],[36.146,8.318],[36.036,8.275],[35.827,8.242],[35.751,8.257],[35.685,8.307],[35.621,8.329],[35.508,8.336],[35.403,8.289],[35.326,8.293],[35.29,8.318],[35.241,8.433],[35.067,8.3],[34.902,8.249],[34.763,8.271],[34.681,8.21],[34.648,8.235],[34.53,8.095],[34.414,7.832],[34.245,7.767],[34.199,7.63],[34.095,7.519],[33.894,7.479],[33.659,7.555],[33.414,7.709],[33.232,7.724],[33.208,7.749],[33.184,7.871],[33.108,8.001],[33.095,8.087],[32.805,8.296],[32.526,8.332],[32.105,9.02],[32.072,9.045],[30.229,9.52],[30.116,9.286],[30.0,9.383]],[[33.181,11.504],[33.166,11.562],[33.108,11.637],[33.081,11.792],[33.136,11.691],[33.083,11.846],[32.921,12.123],[32.833,12.35],[32.798,12.732],[32.805,12.825],[32.867,13.074],[32.913,13.164],[32.919,13.257],[32.904,13.351],[32.835,13.5],[30.0,13.5],[30.0,9.383],[30.116,9.286],[30.331,9.743],[30.354,9.873],[30.641,10.1],[30.731,10.194],[30.842,10.255],[30.915,10.269],[30.986,10.244],[31.079,10.244],[31.428,10.107],[31.518,10.132],[31.68,10.266],[31.715,10.316],[31.715,10.428],[31.744,10.5],[31.84,10.586],[31.954,10.608],[31.974,10.629],[31.962,10.705],[32.004,10.773],[32.136,10.874],[32.369,11.443],[32.435,11.547],[32.507,11.562],[32.637,11.45],[32.902,11.457],[33.181,11.504]]]};
const MAP = { x: 96, y: 72, w: 624, h: 918 };
const LAT_TOP = 37.55, LON_L = 7.75, MSC = 1.58, KX = 111.32 * Math.cos(35 * RAD) * MSC, KY = 110.57 * MSC;
const P = ([la, lo]) => [MAP.x + (lo - LON_L) * KX, MAP.y + (LAT_TOP - la) * KY];
const TOWNS = {
  tunis: [36.806, 10.181], bizerte: [37.274, 9.874], mateur: [37.04, 9.665], sousse: [35.825, 10.636], mahdia: [35.504, 11.062],
  sfax: [34.74, 10.76], gabes: [33.883, 10.117], zaghouan: [36.402, 10.143], enfidha: [36.135, 10.381], medjez: [36.65, 9.61],
};
// The Axis-held zone, schematic: winter 1942–43 (east of the Eastern Dorsal, down to Libya) and late April 1943 (the
// north-east pocket). After the maps in Wikipedia, "Tunisian campaign". Points east of the land are clipped by it.
const ZONE_WINTER = [[37.6, 9.22], [37.2, 9.2], [36.98, 9.18], [36.78, 9.45], [36.6, 9.72], [36.32, 9.86], [35.98, 9.66], [35.66, 9.58], [35.2, 9.48], [34.85, 9.42], [34.5, 9.5], [34.12, 9.35], [33.75, 9.42], [33.3, 9.75], [32.85, 10.2], [32.3, 10.9], [31.6, 11.6], [31.6, 12.5], [38, 12.5], [38, 9.22]];
const ZONE_APRIL = [[37.6, 9.3], [37.2, 9.32], [36.98, 9.48], [36.78, 9.62], [36.58, 9.82], [36.36, 10.02], [36.2, 10.16], [36.14, 10.42], [35.9, 10.8], [36.5, 12.5], [38, 12.5], [38, 9.3]];
const FRONT_WINTER = ZONE_WINTER.slice(1, 12);

// ---------- the background, painted once ----------
let BG = null;
function poly(g, pts, close = true) { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p)))); if (close) g.closePath(); }
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const g = BG.getContext('2d');
  const gr = g.createRadialGradient(W * 0.64, H * 0.42, 80, W * 0.56, H * 0.5, 1300);
  gr.addColorStop(0, C.bg1); gr.addColorStop(1, C.bg0);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // a faint lattice of eight-pointed stars, like the tiles of a Tunis courtyard
  g.strokeStyle = C.tile; g.lineWidth = 2;
  const S = 132;
  for (let row = -1; row < H / S + 1; row++) {
    for (let col = -1; col < W / S + 1; col++) {
      const cx = col * S + (row % 2 ? S / 2 : 0), cy = row * S * 0.866 + 40, r = 34;
      g.beginPath();
      for (let i = 0; i < 16; i++) { const ang = (i / 16) * TAU - Math.PI / 2, rr = i % 2 ? r * 0.78 : r; i ? g.lineTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr) : g.moveTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr); }
      g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(cx + r, cy); g.lineTo(cx + S / 2 - r * 0.6, cy + S * 0.433 - r * 0.35); g.stroke();
    }
  }
  // the map panel: sea, neighbours, Tunisia
  g.save();
  g.beginPath(); g.roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 22); g.clip();
  const sg = g.createLinearGradient(0, MAP.y, 0, MAP.y + MAP.h); sg.addColorStop(0, C.sea2); sg.addColorStop(1, C.sea);
  g.fillStyle = sg; g.fillRect(MAP.x, MAP.y, MAP.w, MAP.h);
  g.fillStyle = C.neigh; g.strokeStyle = C.neigh; g.lineWidth = 8; g.lineJoin = 'round';
  for (const r of MAPDATA.NEIGH) { poly(g, r); g.fill(); g.stroke(); }
  const lg = g.createLinearGradient(0, MAP.y, 0, MAP.y + MAP.h); lg.addColorStop(0, '#e9dbb6'); lg.addColorStop(1, '#e2c894');
  g.fillStyle = lg;
  for (const r of MAPDATA.TUN) { poly(g, r); g.fill(); }
  g.save(); poly(g, MAPDATA.TUN[0]); g.clip();
  g.fillStyle = 'rgba(201,143,82,0.5)';
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1500; i++) {
    const la = 30.4 + rnd() * 3.0, lo = 7.6 + rnd() * 2.3;
    if (la > 33.35 - (lo - 7.6) * 0.18) continue;
    const [x, y] = P([la, lo]); g.beginPath(); g.arc(x, y, 1.6 + rnd() * 1.6, 0, TAU); g.fill();
  }
  g.restore();
  g.strokeStyle = 'rgba(42,38,32,0.45)'; g.lineWidth = 2;
  for (const r of MAPDATA.TUN) { poly(g, r); g.stroke(); }
  g.restore();
  g.strokeStyle = 'rgba(243,162,189,0.55)'; g.lineWidth = 3; g.beginPath(); g.roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 22); g.stroke();
}

// ---------- the map's moving parts ----------
function townDot(ll, name, a, { dx = 14, dy = 0, align = 'left', color = C.dark, size = 32, ring = null } = {}) {
  if (a <= 0) return;
  const [x, y] = P(ll);
  A(a, () => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
    if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 15, 0, TAU); ctx.stroke(); }
    if (name) {
      k.font(600, size, TEXT); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(233,219,182,0.88)'; ctx.lineJoin = 'round';
      ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.strokeText(name, x + dx, y + dy);
      txt(name, x + dx, y + dy, { size, weight: 600, color, align });
    }
  });
}
function mapLabel(str, ll, a, { size = 32, color = C.soft, spacing = '4px', weight = 600, align = 'center', rot = 0 } = {}) {
  if (a <= 0) return;
  const [x, y] = P(ll);
  A(a, () => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); txt(str, 0, 0, { size, weight, color, align, spacing }); ctx.restore(); });
}
/** A small square for a labour site, from the US report of June 1943. */
function site(ll, a, hot = 0, t = 0) {
  if (a <= 0) return;
  const [x, y] = P(ll);
  A(a, () => {
    if (hot > 0) A(hot, () => { const p = (t * 0.7) % 1; ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.globalAlpha *= 1 - p; ctx.strokeRect(x - 14 - p * 18, y - 14 - p * 18, 28 + p * 36, 28 + p * 36); });
    ctx.fillStyle = C.roseDk; ctx.fillRect(x - 11, y - 11, 22, 22); ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.strokeRect(x - 11, y - 11, 22, 22);
  });
}
function zone(pts, a, label) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); poly(ctx, MAPDATA.TUN[0]); ctx.clip();
    poly(ctx, pts); ctx.fillStyle = 'rgba(222,122,92,0.26)'; ctx.fill();
    // hatching
    ctx.clip(); ctx.strokeStyle = 'rgba(176,71,47,0.38)'; ctx.lineWidth = 2;
    for (let x = MAP.x - MAP.h; x < MAP.x + MAP.w; x += 18) { ctx.beginPath(); ctx.moveTo(x, MAP.y + MAP.h); ctx.lineTo(x + MAP.h, MAP.y); ctx.stroke(); }
    ctx.restore();
  });
}
function frontLine(pts, u, a = 1) {
  if (a <= 0 || u <= 0) return;
  A(a, () => trace(pts.map(P), u, '#9b3a22', { w: 6, dash: [12, 8], head: false }));
}
function drawMap(t) {
  ctx.save(); k.rrect(MAP.x, MAP.y, MAP.w, MAP.h, 22); ctx.clip();
  mapLabel('ALGERIA', [35.4, 7.93], 1, { color: 'rgba(246,238,220,0.6)', size: 32, rot: -Math.PI / 2 });
  mapLabel('LIBYA', [32.72, 11.86], 1, { color: 'rgba(246,238,220,0.6)', size: 32, rot: -Math.PI / 2 });
  mapLabel('TUNISIA', [34.95, 9.0], span(t, s('a1', 0.2), s('a9', 0.4), 0.6, 0.8), { color: 'rgba(42,38,32,0.55)', size: 40, spacing: '8px', weight: 700 });
  // the Axis-held zone: from 9 November (a8–a9) to the surrender (l2); it shrinks to the April pocket for l1
  const zA = seg(t, s('a9', 0.4), s('a9', 1.6)) * (1 - seg(t, s('l1', 0.2), s('l1', 1.6)));
  const zB = Math.min(seg(t, s('l1', 0.2), s('l1', 1.6)), 1 - seg(t, s('l2', 0.8), s('l2', 2.4)));
  zone(ZONE_WINTER, zA * (t < CH[2].at + 1 || t > CH[4].at ? 1 : 0.6));
  zone(ZONE_APRIL, zB);
  frontLine(FRONT_WINTER, eio(seg(t, s('a10', 0.2), s('a10', 2.4))), zA);
  A(span(t, s('a10', 1.6), s('a11', 3.0), 0.5, 0.6), () => {
    chip('Allies', ...P([35.6, 8.55]), { color: C.allied, size: 32 });
    chip('Axis', ...P([35.05, 10.25]), { color: C.axis, size: 32 });
  });
  // a8: the landings in Morocco and Algeria (off the map, to the west), then German aircraft at El Aouina by Tunis
  A(span(t, s('a8', 0.2), s('a10', 0.4), 0.5, 0.6), () => {
    trace([[MAP.x - 10, P([36.6, 7.9])[1]], [MAP.x + 70, P([36.6, 7.9])[1]]], eout(seg(t, s('a8', 0.4), s('a8', 1.6))), C.allied, { w: 9 });
    trace(smooth([P([37.75, 11.4]), P([37.3, 10.8]), P([36.86, 10.24])]), eout(seg(t, s('a8', 3.4), s('a8', 5.0))), C.axis, { w: 9 });
  });
  // a9: troops into Tunis, Bizerte and down the east coast
  A(span(t, s('a9', 0.3), s('a11', 0.4), 0.5, 0.6), () => {
    trace(smooth([P([37.75, 10.2]), P([37.35, 9.95]), P([37.18, 9.88])]), eout(seg(t, s('a9', 2.0), s('a9', 3.2))), C.axis, { w: 8, headSize: 18 });
    trace(smooth([P([36.7, 10.35]), P([36.1, 10.55]), P([35.4, 10.8]), P([34.8, 10.7])]), eout(seg(t, s('a9', 3.0), s('a9', 4.8))), C.axis, { w: 8, headSize: 18 });
  });
  // towns: Tunis always from the start; the others as the story reaches them
  const showTunis = 1;
  const ch2on = span(t, s('j5'), CH[2].at + 1, 0.6, 0.8);
  townDot(TOWNS.bizerte, 'Bizerte', Math.max(span(t, s('a9', 1.6), s('a16', 2), 0.5, 0.8), ch2on), { dx: 16, dy: -10 });
  townDot(TOWNS.sousse, 'Sousse', span(t, s('a9', 3.6), s('a16', 2), 0.5, 0.8), { dx: -14, align: 'right' });
  townDot(TOWNS.sfax, 'Sfax', span(t, s('a9', 4.2), s('a16', 2), 0.5, 0.8), { dx: -14, align: 'right' });
  townDot(TOWNS.gabes, 'Gabès', span(t, s('a9', 4.6), s('a16', 2), 0.5, 0.8), { dx: -14, align: 'right' });
  // ch2: the labour sites named in the US report of June 1943 (Tunis, Bizerte, Mateur, Enfidaville)
  const sitesA = span(t, s('j11', 0.4), CH[2].at + 1, 0.6, 0.8);
  const hot = span(t, s('j12', 0.2), s('j13', 0.2), 0.4, 0.5);
  site(TOWNS.bizerte, sitesA, hot, t); site(TOWNS.mateur, sitesA, hot, t);
  site([TOWNS.tunis[0] - 0.06, TOWNS.tunis[1] + 0.02], sitesA); site(TOWNS.enfidha, sitesA);
  townDot(TOWNS.mateur, 'Mateur', sitesA, { dx: -20, align: 'right', dy: 8 });
  townDot(TOWNS.enfidha, 'Enfidaville', sitesA, { dx: -20, align: 'right' });
  // ch4: Zaghouan (h3) and Mahdia (h4)
  const ch4 = (k0) => span(t, s(k0, 0.3), CH[4].at + 1, 0.6, 0.8);
  townDot(TOWNS.zaghouan, 'Zaghouan', ch4('h3'), { dx: -20, align: 'right', ring: C.rose });
  townDot(TOWNS.mahdia, 'Mahdia', ch4('h4'), { dx: -20, align: 'right', ring: C.rose });
  // ch6: the places of the story, again
  const recap = span(t, s('r1', 0.4), DURATION + 1, 0.8, 0.5);
  if (recap > 0) {
    townDot(TOWNS.bizerte, 'Bizerte', recap, { dx: 16, dy: -10, ring: C.rose });
    townDot(TOWNS.mateur, 'Mateur', recap, { dx: -20, align: 'right', dy: 8, ring: C.rose });
    townDot(TOWNS.zaghouan, 'Zaghouan', recap, { dx: -20, align: 'right', ring: C.rose });
    townDot(TOWNS.mahdia, 'Mahdia', recap, { dx: -20, align: 'right', ring: C.rose });
    townDot(TOWNS.enfidha, 'Enfidaville', recap, { dx: -20, align: 'right', ring: C.rose });
  }
  // ch5: the plane west to Laghouat (l5), off the map
  A(span(t, s('l5', 0.4), s('l9', 0.2), 0.5, 0.6), () => {
    const [x0, y0] = P(TOWNS.tunis);
    trace(smooth([[x0, y0], [lerp(x0, MAP.x - 20, 0.5), y0 + 120], [MAP.x - 20, y0 + 330]]), eio(seg(t, s('l5', 0.6), s('l5', 3.2))), C.vichy, { w: 6, dash: [3, 12], headSize: 18 });
  });
  // the cold open: Tunis freed (o1), the Bey flown out (o2)
  A(span(t, s('o2', 1.0), s('o4', 0.4), 0.5, 0.6), () => {
    const [x0, y0] = P(TOWNS.tunis);
    trace(smooth([[x0, y0], [lerp(x0, MAP.x - 20, 0.5), y0 + 120], [MAP.x - 20, y0 + 330]]), eio(seg(t, s('o2', 1.2), s('o2', 3.6))), C.vichy, { w: 6, dash: [3, 12], headSize: 18 });
  });
  // Tunis: a pulse while it is the place being talked about
  const tunisOn = Math.max(span(t, s('o1', 0.2), s('o3', 0.2), 0.5, 0.6), span(t, s('a11', 0.2), s('a13', 0.2), 0.5, 0.6), span(t, s('j8', 0.2), s('j9', 0.2), 0.4, 0.5),
    span(t, s('n8', 0.2), CH[3].at, 0.4, 0.5), span(t, s('l1', 0.2), s('l2', 0.2), 0.4, 0.5), span(t, s('l11', 0.6), s('l12', 0.2), 0.4, 0.5));
  if (tunisOn > 0) A(tunisOn, () => { const [x, y] = P(TOWNS.tunis), p = (t * 0.8) % 1; ctx.strokeStyle = C.rose; ctx.lineWidth = 4; ctx.globalAlpha *= 1 - p; ctx.beginPath(); ctx.arc(x, y, 18 + p * 30, 0, TAU); ctx.stroke(); });
  townDot(TOWNS.tunis, 'Tunis', showTunis, { dx: 16, dy: -4 });
  ctx.restore();
  A(1, () => txt('schematic map', MAP.x + 20, MAP.y + 32, { size: 32, weight: 500, color: 'rgba(246,238,220,0.55)' }));
  A(zA * span(t, s('a9', 1.4), CH[2].at + 1, 0.6, 0.8), () => {
    k.rrect(MAP.x + 16, MAP.y + MAP.h - 84, 380, 64, 14); ctx.fillStyle = 'rgba(22,9,17,0.85)'; ctx.fill();
    ctx.fillStyle = 'rgba(222,122,92,0.5)'; ctx.fillRect(MAP.x + 34, MAP.y + MAP.h - 66, 30, 28);
    txt('held by the Axis', MAP.x + 78, MAP.y + MAP.h - 52, { size: 32, weight: 600, color: C.ink });
  });
  // ch2: the labour sites' legend
  A(span(t, s('j11', 0.6), CH[2].at + 1, 0.6, 0.8), () => {
    const w = textW('work sites in a US report, 1943', { size: 32, weight: 600 }) + 86;
    k.rrect(MAP.x + 16, MAP.y + MAP.h - 160, w, 64, 14); ctx.fillStyle = 'rgba(22,9,17,0.85)'; ctx.fill();
    ctx.fillStyle = C.roseDk; ctx.fillRect(MAP.x + 38, MAP.y + MAP.h - 139, 22, 22); ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.strokeRect(MAP.x + 38, MAP.y + MAP.h - 139, 22, 22);
    txt('work sites in a US report, 1943', MAP.x + 78, MAP.y + MAP.h - 127, { size: 32, weight: 600, color: C.ink });
  });
}

// ---------- the right-hand panel ----------
const RX = 800, RW = 1000, RCX = RX + RW / 2; // x 800–1800
const WIN = { x: 800, y: 300, w: 1000, h: 600 };
function windowFrame(fn, { line = 'rgba(243,162,189,0.5)', box = WIN } = {}) {
  ctx.save(); k.rrect(box.x, box.y, box.w, box.h, 22); ctx.clip(); fn(); ctx.restore();
  ctx.strokeStyle = line; ctx.lineWidth = 3; k.rrect(box.x, box.y, box.w, box.h, 22); ctx.stroke();
}
/** A heading at the top of the panel. */
function heading(str, a, { sub = null, color = C.ink } = {}) {
  A(a, () => {
    txtFit(str, RX, 130, RW, { size: 56, weight: 700, family: DISPLAY, color });
    if (sub) txtFit(sub, RX, 196, RW, { size: 34, weight: 500, color: C.soft });
  });
}
/** A date in the series' style: small caps date, then what happened. */
function dateCard(x, y, w, date, what, col, a, { h = 150 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    card(x, y, w, h, { line: col });
    txtFit(date, x + 30, y + 46, w - 60, { size: 40, weight: 800, color: col, spacing: '2px' });
    txtFit(what, x + 30, y + 104, w - 60, { size: 36, weight: 600, color: C.ink });
  });
}

// ---------- cold open ----------
const POWERS = [['THE BEY', C.bey], ['VICHY FRANCE', C.vichy], ['GERMANY', C.axis], ['ITALY', C.axis]];
function partOpen(t) {
  // o1: Tunis freed
  A(span(t, s('o1', 0.3), s('o2', 0.4), 0.6, 0.6), () => {
    txt('7 MAY 1943', RCX, 400, { size: 110, weight: 800, family: DISPLAY, color: C.allied, align: 'center' });
    txtFit('Allied troops enter Tunis', RCX, 510, 960, { size: 44, weight: 600, color: C.ink, align: 'center' });
    txtFit('the end of six months of occupation', RCX, 580, 960, { size: 36, weight: 500, color: C.soft, align: 'center' });
  });
  // o2: the Bey flown into exile, by the French
  A(span(t, s('o2', 0.3), s('o3', 0.4), 0.6, 0.6), () => {
    seal(RCX, 300, 92, C.bey, { fill: 0.15, rot: (1 - eout(seg(t, s('o2', 0.3), s('o2', 1.6)))) * 0.6 });
    txt('14 MAY 1943', RCX, 470, { size: 96, weight: 800, family: DISPLAY, color: C.rose, align: 'center' });
    txtFit('Moncef Bey, ruler of Tunisia, deposed', RCX, 570, 960, { size: 42, weight: 600, color: C.ink, align: 'center' });
    A(seg(t, s('o2', 3.0), s('o2', 3.8)), () => chip('by the French', RCX, 660, { color: C.vichy, size: 38 }));
  });
  // o3: four powers at once
  A(span(t, s('o3', 0.3), s('o4', 1.0), 0.6, 0.6), () => {
    POWERS.forEach(([name, col], i) => {
      const a = eout(seg(t, s('o3', 1.2 + i * 0.45), s('o3', 1.8 + i * 0.45))), x = RX + 125 + i * 250;
      seal(x, 420 - (1 - a) * 20, 70, col, { fill: 0.12, a });
      A(a, () => para(name, x, 548, 236, { size: 32, weight: 800, color: col, lh: 1.15 }));
    });
  });
  // o4: the title, until the first chapter card
  const ti = eout(seg(t, s('o4', 1.0), s('o4', 2.2)));
  A(ti, () => {
    txt('SIX MONTHS', RCX, 400 + (1 - ti) * 18, { size: fit('SIX MONTHS', 980, 120, { weight: 800, family: DISPLAY, spacing: '4px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '4px' });
    txt('UNDER OCCUPATION', RCX, 530 + (1 - ti) * 18, { size: fit('UNDER OCCUPATION', 980, 96, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, color: C.rose, align: 'center', spacing: '3px' });
    for (let i = 0; i < 6; i++) seal(RCX - 250 + i * 100, 640, 20, C.rose, { lw: 3, fill: 0.2 });
    txtFit('Tunisia, November 1942 to May 1943', RCX, 730, 960, { size: 40, weight: 600, color: C.soft, align: 'center' });
  });
}

// ---------- 1: four powers ----------
/** A balance: the Bey's pan up, the resident-general's down. */
function balance(t, a) {
  if (a <= 0) return;
  const tilt = 0.16 * eio(seg(t, s('a2', 0.3), s('a2', 2.0)));
  const px = RCX, py = 330, L = 300;
  A(a, () => {
    ctx.strokeStyle = C.soft; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + 300); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - 60, py + 300); ctx.lineTo(px + 60, py + 300); ctx.stroke();
    const lx = px - Math.cos(tilt) * L, ly = py - Math.sin(tilt) * L, rx = px + Math.cos(tilt) * L, ry = py + Math.sin(tilt) * L;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke(); ctx.lineCap = 'butt';
    ctx.fillStyle = C.soft; ctx.beginPath(); ctx.arc(px, py, 12, 0, TAU); ctx.fill();
    // the pans hang; a seal on each
    for (const [x, y, col, name, sub, key] of [[lx, ly, C.bey, 'THE BEY', 'signs the laws', 'a1'], [rx, ry, C.vichy, 'RESIDENT-GENERAL', 'holds the power', 'a2']]) {
      const pa = seg(t, s(key, 0.4), s(key, 1.2));
      A(pa, () => {
        ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 70, y + 90); ctx.moveTo(x, y); ctx.lineTo(x + 70, y + 90); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 90, y + 90); ctx.quadraticCurveTo(x, y + 130, x + 90, y + 90); ctx.stroke();
        seal(x, y + 52, 40, col, { fill: 0.15, lw: 3 });
        txtFit(name, x, y + 176, 400, { size: 34, weight: 800, color: col, align: 'center', spacing: '2px' });
        txtFit(sub, x, y + 222, 400, { size: 32, weight: 500, color: C.soft, align: 'center' });
      });
    }
    // a3, a5: who sat in each pan in 1942
    A(seg(t, s('a3', 0.4), s('a3', 1.2)), () => {
      chip('Admiral Jean-Pierre Esteva', rx, ry + 284, { color: C.vichy, size: 32 });
      chip('Vichy', rx, ry + 352, { color: C.vichy, size: 30, weight: 800, bg: 'rgba(185,192,220,0.18)' });
    });
    A(seg(t, s('a5', 0.3), s('a5', 1.1)), () => chip('Moncef Bey, from June 1942', lx, ly + 284, { color: C.bey, size: 32 }));
    A(seg(t, s('a5', 3.0), s('a5', 3.8)), () => chip('reforms asked: more Tunisians in government', RCX, 900, { color: C.bey, size: 32, line: false, bg: 'rgba(159,220,201,0.14)', fg: C.ink }));
  });
}
function partPowers(t) {
  A(span(t, s('a1', 0.2), s('a8', 0.4), 0.5, 0.6), () => {
    heading('A French protectorate', 1, { sub: 'since 1881' });
    balance(t, 1);
  });
  // a8–a10: November 1942
  A(span(t, s('a8', 0.2), s('a11', 0.4), 0.5, 0.6), () => {
    heading('November 1942', 1);
    dateCard(RX, 250, RW, '8 NOV 1942', 'Allied landings in Morocco and Algeria', C.allied, eout(seg(t, s('a8', 0.3), s('a8', 1.0))));
    dateCard(RX, 430, RW, '9 NOV 1942', 'German aircraft land outside Tunis', C.axis, eout(seg(t, s('a8', 3.2), s('a8', 3.9))));
    dateCard(RX, 610, RW, 'UNDER PRESSURE FROM VICHY', 'Esteva lets them use French bases', C.vichy, eout(seg(t, s('a9', 0.3), s('a9', 1.0))));
    A(eout(seg(t, s('a10', 0.3), s('a10', 1.0))), () => {
      card(RX, 790, RW, 120, { line: C.allied });
      txtFit('In the west, French troops join the Allies', RX + 30, 850, RW - 60, { size: 36, weight: 600, color: C.ink });
    });
  });
  // a11: four powers in occupied Tunis
  A(span(t, s('a11', 0.2), s('a13', 0.4), 0.5, 0.6), () => {
    heading('In occupied Tunis', 1);
    const P4 = [['THE BEY', 'Moncef Bey', C.bey], ['VICHY’S ADMIRAL', 'Esteva, resident-general', C.vichy], ['GERMAN COMMAND', 'army, diplomats and SS', C.axis], ['ITALIAN COMMAND', 'army and diplomats', C.axis]];
    P4.forEach(([name, sub, col], i) => {
      const a = eout(seg(t, s('a11', 0.4 + i * 0.6), s('a11', 1.0 + i * 0.6))), x = RX + (i % 2) * 510, y = 250 + Math.floor(i / 2) * 330;
      A(a, () => {
        card(x, y, 490, 300, { line: col });
        seal(x + 245, y + 96, 54, col, { fill: 0.14 });
        txtFit(name, x + 245, y + 200, 450, { size: 36, weight: 800, color: col, align: 'center', spacing: '2px' });
        txtFit(sub, x + 245, y + 252, 450, { size: 32, weight: 500, color: C.soft, align: 'center' });
      });
    });
  });
  // a13: the Bey refuses both camps
  A(span(t, s('a13', 0.2), s('a15', 0.3), 0.5, 0.6), () => {
    heading('Moncef Bey', 1, { sub: 'courted by both camps', color: C.bey });
    const offers = [['Italy', 'break with France', C.axis, 0.3], ['United States', 'join the Allies', C.allied, 2.8]];
    offers.forEach(([who, what, col, d], i) => {
      const a = eout(seg(t, s('a13', d), s('a13', d + 0.7))), y = 270 + i * 230;
      A(a, () => {
        card(RX, y, RW, 200, { line: col });
        txtFit(who, RX + 36, y + 64, 620, { size: 44, weight: 700, family: DISPLAY, color: col });
        txtFit(what, RX + 36, y + 136, 620, { size: 36, weight: 500, color: C.ink });
        cross(RX + RW - 110, y + 100, 46, C.rose, seg(t, s('a13', d + 1.2), s('a13', d + 1.9)));
        A(seg(t, s('a13', d + 1.6), s('a13', d + 2.2)), () => txt('refused', RX + RW - 190, y + 100, { size: 34, weight: 700, color: C.rose, align: 'right' }));
      });
    });
    A(seg(t, e('a13', -1.4), e('a13', -0.6)), () => chip('neither camp', RCX, 800, { color: C.bey, size: 42 }));
  });
  // a15–a16: everyone, and the occupiers' aims
  A(span(t, s('a15', 0.2), CH[1].at + 1.0, 0.5, 0.6), () => {
    heading('Under occupation', 1);
    ['Muslims', 'Jews', 'Europeans'].forEach((n, j) => chip(n, RX + 170 + j * 330, 270, { color: C.ink, size: 36, a: seg(t, s('a15', 0.4 + j * 0.4), s('a15', 0.9 + j * 0.4)) }));
    ['air raids', 'shortages', 'fear'].forEach((n, j) => {
      const a = seg(t, s('a15', 3.0 + j * 0.5), s('a15', 3.6 + j * 0.5));
      A(a, () => { card(RX + j * 340, 350, 320, 130, { bg: 'rgba(246,238,220,0.06)' }); txtFit(n, RX + j * 340 + 160, 415, 290, { size: 38, weight: 700, color: C.soft, align: 'center' }); });
    });
    A(eout(seg(t, s('a16', 0.2), s('a16', 0.9))), () => {
      card(RX, 540, RW, 150, { line: C.axis });
      // a radio, drawn simply
      ctx.strokeStyle = C.axis; ctx.lineWidth = 4; k.rrect(RX + 40, 575, 110, 80, 10); ctx.stroke();
      ctx.beginPath(); ctx.arc(RX + 75, 615, 18, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(RX + 110, 595); ctx.lineTo(RX + 135, 595); ctx.moveTo(RX + 110, 615); ctx.lineTo(RX + 135, 615); ctx.moveTo(RX + 110, 635); ctx.lineTo(RX + 135, 635); ctx.stroke();
      for (let i = 0; i < 3; i++) { ctx.globalAlpha *= 1; ctx.beginPath(); ctx.arc(RX + 150, 575, 20 + i * 14 + ((t * 20) % 14), -0.9, -0.2); ctx.stroke(); }
      txtFit('German propaganda courts the Muslim majority', RX + 200, 615, RW - 240, { size: 36, weight: 600, color: C.ink });
    });
    A(eout(seg(t, s('a16', 3.0), s('a16', 3.7))), () => {
      card(RX, 720, RW, 150, { line: C.rose });
      seal(RX + 95, 795, 42, C.rose, { fill: 0.2, lw: 3 });
      txtFit('The Jews are singled out', RX + 200, 795, RW - 240, { size: 40, weight: 700, color: C.rose });
    });
  });
}

// ---------- 2: Tunisia's Jews ----------
// The calendar of the occupation: one square a day from Monday 9 November 1942, a column a week.
const CAL = { x: 836, y: 650, cell: 34, gap: 2.5, cols: 26 };
const calXY = (d) => [CAL.x + Math.floor(d / 7) * (CAL.cell + CAL.gap), CAL.y + (d % 7) * (CAL.cell + CAL.gap)];
function calendar(t, upto, a) {
  if (a <= 0) return;
  A(a, () => {
    for (let d = 0; d <= OCC_DAYS; d++) {
      const [x, y] = calXY(d), f = Math.max(0, Math.min(1, upto - d));
      ctx.fillStyle = 'rgba(246,238,220,0.07)'; ctx.fillRect(x, y, CAL.cell, CAL.cell);
      if (f > 0) { ctx.fillStyle = `rgba(182,84,119,${0.45 + 0.4 * f})`; ctx.fillRect(x, y, CAL.cell, CAL.cell); }
    }
    // month names above the first column of each month
    const months = [['NOV', utc(1942, 11, 9)], ['DEC', utc(1942, 12, 1)], ['JAN', utc(1943, 1, 1)], ['FEB', utc(1943, 2, 1)], ['MAR', utc(1943, 3, 1)], ['APR', utc(1943, 4, 1)], ['MAY', utc(1943, 5, 1)]];
    months.forEach(([m, ms]) => { const [x] = calXY(dayOf(ms)); txt(m, x, CAL.y - 30, { size: 32, weight: 700, color: C.soft, spacing: '1px' }); });
  });
}
function calMark(d, label, a, { below = true, col = C.rose } = {}) {
  if (a <= 0) return;
  const [x, y] = calXY(d);
  A(a, () => {
    ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.strokeRect(x - 4, y - 4, CAL.cell + 8, CAL.cell + 8);
    const yb = CAL.y + 7 * (CAL.cell + CAL.gap) + 8, ya = CAL.y - 70;
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + CAL.cell / 2, below ? y + CAL.cell + 4 : y - 4); ctx.lineTo(x + CAL.cell / 2, below ? yb + 6 : ya + 22); ctx.stroke();
    const right = x > 1600;
    txt(label, right ? x + CAL.cell / 2 + 12 : x + CAL.cell / 2 - 12, below ? yb + 32 : ya, { size: 32, weight: 700, color: col, align: right ? 'right' : 'left' });
  });
}
/** A big number with its words, at the top of the panel. */
function bigNumber(num, words, sub, a, { col = C.rose, y = 330 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const w = textW(num, { size: 120, weight: 800, family: DISPLAY });
    txt(num, RX, y, { size: 120, weight: 800, family: DISPLAY, color: col });
    txtFit(words, RX + w + 30, y - 22, RW - w - 30, { size: 44, weight: 700, color: C.ink });
    if (sub) txtFit(sub, RX + w + 30, y + 36, RW - w - 30, { size: 34, weight: 500, color: C.soft });
  });
}
function partJews(t) {
  // j1–j3: before the occupation
  A(span(t, s('j1', 0.2), s('j5', 0.4), 0.5, 0.6), () => {
    bigNumber(fmt(90000), 'Jews in Tunisia', 'most of them subjects of the Bey', eout(seg(t, s('j1', 0.3), s('j1', 1.0))), { y: 220 });
    A(eout(seg(t, s('j2', 0.2), s('j2', 0.9))), () => {
      card(RX, 340, RW, 230, { line: C.vichy });
      txtFit('Vichy’s anti-Jewish laws, from 1940', RX + 36, 400, RW - 72, { size: 40, weight: 700, family: DISPLAY, color: C.vichy });
      txtFit('quotas in the professions', RX + 36, 460, RW - 72, { size: 34, weight: 500, color: C.soft });
      A(seg(t, s('j2', 3.4), s('j2', 4.2)), () => txtFit('stalled by Esteva and both Beys (USHMM)', RX + 36, 520, RW - 72, { size: 34, weight: 600, color: C.bey }));
    });
    A(eout(seg(t, s('j3', 0.2), s('j3', 0.9))), () => {
      card(RX, 600, RW, 130, { line: C.italy });
      txtFit('Jews with Italian citizenship: shielded by Italy', RX + 36, 665, RW - 72, { size: 36, weight: 600, color: C.ink });
    });
  });
  // j5 onwards: the calendar of the 179 days
  const calA = span(t, s('j5', 0.3), CH[2].at + 1.0, 0.6, 0.8);
  const upto = Math.max(
    lerp(0, 1, seg(t, s('j5', 0.6), s('j5', 1.4))),
    lerp(1, MARKS.leaders + 1, eio(seg(t, s('j6', 0.3), s('j6', 2.0)))),
    lerp(MARKS.leaders + 1, MARKS.order + 1, eio(seg(t, s('j7', 0.2), s('j7', 1.6)))),
    lerp(MARKS.order + 1, MARKS.roundup + 1, eio(seg(t, s('j8', 0.2), s('j8', 1.2)))),
    lerp(MARKS.roundup + 1, MARKS.fine + 1, eio(seg(t, s('j14', 0.2), s('j14', 1.6)))),
    lerp(MARKS.fine + 1, OCC_DAYS + 1, eio(seg(t, s('j18', 1.0), e('j18', 0.6)))));
  calendar(t, upto, calA);
  if (calA > 0) A(calA, () => {
    calMark(0, '9 NOV', seg(t, s('j5', 0.8), s('j5', 1.4)), { below: true, col: C.axis });
    calMark(MARKS.leaders, 'leaders arrested', seg(t, s('j6', 1.6), s('j6', 2.2)) * (1 - seg(t, s('j7', 0), s('j7', 0.5))), { below: false });
    calMark(MARKS.order, '6 DEC', seg(t, s('j7', 1.2), s('j7', 1.8)), { below: false });
    calMark(MARKS.roundup, '9 DEC', seg(t, s('j8', 0.9), s('j8', 1.5)), { below: true });
    calMark(MARKS.fine, '22 DEC', seg(t, s('j14', 1.2), s('j14', 1.8)), { below: false });
    calMark(OCC_DAYS, '7 MAY', seg(t, e('j18', -0.2), e('j18', 0.4)), { below: true, col: C.allied });
  });
  // the top of the panel, line by line
  const top = (k0, k1, fn) => A(span(t, s(k0, 0.2), s(k1, 0.3), 0.5, 0.5), fn);
  top('j5', 'j7', () => {
    card(RX, 130, RW, 220, { line: C.axis });
    txtFit('SS unit, led by Walter Rauff', RX + 36, 200, RW - 72, { size: 46, weight: 700, family: DISPLAY, color: C.axis });
    txtFit('who had developed the gas vans used to murder Jews', RX + 36, 270, RW - 72, { size: 34, weight: 500, color: C.soft });
    A(seg(t, s('j6', 0.3), s('j6', 1.0)), () => chip('within two weeks: community leaders arrested', RX, 410, { color: C.rose, size: 32, align: 'left' }));
  });
  top('j7', 'j8', () => {
    txt(fmt(2000), RX, 250, { size: 110, weight: 800, family: DISPLAY, color: C.rose });
    const w = textW(fmt(2000), { size: 110, weight: 800, family: DISPLAY });
    A(seg(t, e('j7', -2.0), e('j7', -1.2)), () => { trace([[RX + w + 30, 250], [RX + w + 130, 250]], 1, C.soft, { w: 6, headSize: 18 }); txt(fmt(3000), RX + w + 170, 250, { size: 110, weight: 800, family: DISPLAY, color: C.rose }); });
    txtFit('men demanded for forced labour', RX, 360, RW, { size: 40, weight: 600, color: C.ink });
  });
  top('j8', 'j9', () => {
    card(RX, 150, RW, 260, { line: C.axis });
    txt('9 DECEMBER 1942', RX + 36, 220, { size: 44, weight: 800, color: C.axis, spacing: '2px' });
    txtFit('synagogues broken into', RX + 36, 290, RW - 72, { size: 38, weight: 600, color: C.ink });
    txtFit('Jewish men rounded up in the streets of Tunis', RX + 36, 350, RW - 72, { size: 38, weight: 600, color: C.ink });
  });
  // j9–j10: the lists, and Ghez's diary
  top('j9', 'j11', () => {
    // a ledger of lines, no names
    A(1, () => {
      ctx.save(); ctx.translate(RX + 30, 140); ctx.rotate(-0.03);
      card(0, 0, 380, 390, { bg: C.paper, r: 8 });
      ctx.strokeStyle = 'rgba(42,38,32,0.35)'; ctx.lineWidth = 2;
      for (let i = 0; i < 11; i++) { const y = 60 + i * 30, u = seg(t, s('j9', 0.3 + i * 0.15), s('j9', 0.5 + i * 0.15)); ctx.beginPath(); ctx.moveTo(36, y); ctx.lineTo(36 + 320 * u * (0.6 + 0.4 * ((i * 37) % 10) / 10), y); ctx.stroke(); }
      ctx.restore();
    });
    txtFit('the lists of workers', RX + 450, 170, 550, { size: 40, weight: 700, family: DISPLAY, color: C.ink });
    txtFit('drawn up, under threat,', RX + 450, 222, 550, { size: 32, weight: 500, color: C.soft });
    txtFit('by the community’s own leaders', RX + 450, 262, 550, { size: 32, weight: 500, color: C.soft });
    A(eout(seg(t, s('j10', 0.2), s('j10', 1.0))), () => {
      ctx.save(); ctx.translate(RX + 470, 310); ctx.rotate(0.02);
      card(0, 0, 500, 240, { bg: '#5b2a3c', r: 10, line: C.rose });
      txt('Six mois sous la botte', 250, 62, { size: fit('Six mois sous la botte', 460, 46, { weight: 700, family: DISPLAY }), weight: 700, family: DISPLAY, color: C.paper, align: 'center' });
      A(seg(t, s('j10', 2.4), s('j10', 3.0)), () => txtFit('Six months under the boot', 250, 118, 460, { size: 32, weight: 500, color: C.rose, align: 'center' }));
      txt('Paul Ghez · Tunis, 1943', 250, 186, { size: 30, weight: 600, color: C.paper2, align: 'center' });
      ctx.restore();
    });
  });
  // j11: about 5,000 men, a dot for 50
  top('j11', 'j13', () => {
    const cols = 25, gx = 27;
    for (let i = 0; i < DOTS; i++) {
      const a = seg(t, s('j11', 0.3 + i * 0.022), s('j11', 0.5 + i * 0.022));
      if (a <= 0) continue;
      const x = RX + 14 + (i % cols) * gx, y = 160 + Math.floor(i / cols) * gx;
      A(a, () => { ctx.fillStyle = C.rose; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); });
    }
    const x2 = RX + cols * gx + 40;
    txt('about', x2, 130, { size: 32, weight: 600, color: C.soft });
    txt(fmt(WORKERS), x2, 190, { size: 84, weight: 800, family: DISPLAY, color: C.rose });
    txt('men', x2, 252, { size: 34, weight: 600, color: C.ink });
    A(seg(t, s('j11', 2.6), s('j11', 3.2)), () => {
      ctx.fillStyle = C.rose; ctx.beginPath(); ctx.arc(RX + 23, 300, 9, 0, TAU); ctx.fill();
      txt('=', RX + 46, 300, { size: 32, weight: 600, color: C.soft });
      txt(fmt(PER_DOT), RX + 76, 300, { size: 32, weight: 700, color: C.ink });
      txt('men', RX + 86 + textW(fmt(PER_DOT), { size: 32, weight: 700 }), 300, { size: 32, weight: 600, color: C.soft });
    });
    A(seg(t, s('j11', 3.4), s('j11', 4.1)), () => {
      const w = chip('32 to about 40 camps', RX, 380, { color: C.rose, size: 34, align: 'left' });
      A(seg(t, s('j11', 4.6), s('j11', 5.2)), () => chip('many near the front', RX + w + 20, 380, { color: C.soft, size: 34, align: 'left', line: false, bg: 'rgba(246,238,220,0.08)', fg: C.ink }));
    });
    A(span(t, s('j12', 0.3), s('j13', 0.3), 0.5, 0.5), () => {
      card(RX, 440, RW, 100, { bg: 'rgba(246,238,220,0.06)' });
      txtFit('Bizerte and Mateur: the worst camps (Yad Vashem)', RX + 30, 490, RW - 60, { size: 34, weight: 600, color: C.ink });
    });
  });
  top('j13', 'j14', () => {
    candle(RCX - 260, 330, t);
    txtFit('Gilbert Mazouz', RCX - 160, 300, 640, { size: 56, weight: 700, family: DISPLAY, color: C.ink });
    txtFit('aged 19, shot on his way to a camp', RCX - 160, 370, 640, { size: 36, weight: 500, color: C.soft });
  });
  top('j14', 'j15', () => {
    txt(fmt(FINE), RX, 230, { size: 110, weight: 800, family: DISPLAY, color: C.rose });
    txtFit('francs, levied on the community', RX, 330, RW, { size: 40, weight: 600, color: C.ink });
    txtFit('“to pay” for Allied bombing (US report, June 1943)', RX, 390, RW, { size: 32, weight: 500, color: C.soft });
  });
  top('j15', 'j18', () => {
    const items = [['homes seized', 0.3], ['hostages taken', 1.4]];
    items.forEach(([n, d], j) => chip(n, RX + j * 360, 190, { color: C.ink, size: 36, align: 'left', a: seg(t, s('j15', d), s('j15', d + 0.6)) }));
    A(seg(t, s('j15', 3.2), s('j15', 3.9)), () => {
      badge(RX + 50, 300, 34);
      txtFit('a yellow star, in some towns', RX + 110, 300, RW - 110, { size: 38, weight: 700, color: C.star });
    });
    A(seg(t, s('j16', 0.2), s('j16', 0.9)), () => chip('a handful deported to camps in occupied Poland', RX, 400, { color: C.rose, size: 32, align: 'left' }));
  });
  top('j18', 'n1', () => {
    txt(fmt(OCC_DAYS), RX, 230, { size: 120, weight: 800, family: DISPLAY, color: C.rose });
    const w = textW(fmt(OCC_DAYS), { size: 120, weight: 800, family: DISPLAY });
    txtFit('days of occupation', RX + w + 30, 210, RW - w - 30, { size: 44, weight: 700, color: C.ink });
    txtFit('9 November 1942 to 7 May 1943', RX + w + 30, 266, RW - w - 30, { size: 32, weight: 500, color: C.soft });
    A(seg(t, s('j18', 3.6), s('j18', 4.4)), () => {
      card(RX, 340, RW, 130, { line: C.rose });
      txtFit('“the Germans did not have time” (Yad Vashem)', RX + 30, 405, RW - 60, { size: 36, weight: 600, color: C.ink });
    });
  });
}

// ---------- 3: the nationalists ----------
// Schematic maps of the western Mediterranean, coasts simplified (as in the posts' scenes). A projection maps
// [lat, lon] into a box; the degrees are chosen so a kilometre is about as long across as down.
const proj = (box, lat0, lat1, lon0, lon1) => ([la, lo]) => [box.x + ((lo - lon0) / (lon1 - lon0)) * box.w, box.y + ((lat0 - la) / (lat0 - lat1)) * box.h];
const MED = { x: 800, y: 150, w: 1000, h: 620 };
const QM = proj(MED, 46.3, 33.0, -6, 22);
const EXILE = { x: 800, y: 150, w: 540, h: 440 };
const QE = proj(EXILE, 44.4, 32.9, -4, 13.8);
const AFRICA = [[35.0, -6.5], [35.2, -4.6], [35.7, -1], [36.8, 3.0], [36.9, 7.8], [37.3, 9.9], [37.1, 11.0], [35.8, 10.6], [34.7, 10.8], [33.9, 10.1], [32.9, 13.2], [32.4, 15.1], [31.2, 16.6], [30.4, 19.2], [32.1, 20.1], [32.9, 22.0], [32.5, 23.5]];
const EUROPE = [[36.3, -6.5], [36.7, -4.6], [36.7, -2.2], [37.6, -1], [39.5, -0.3], [40.7, 0.9], [41.4, 2.2], [42.3, 3.3], [43.5, 3.9], [43.4, 4.8], [43.3, 5.4], [43.1, 5.9], [43.7, 7.3], [44.4, 8.9], [44.1, 9.8], [43.5, 10.3], [42.9, 10.5], [42.1, 11.8], [41.7, 12.3], [41.2, 13.6], [40.8, 14.2], [40.6, 14.8], [40.0, 15.6], [39.4, 16.0], [38.1, 15.6], [38.4, 16.5], [39.0, 17.1], [40.4, 17.2], [39.8, 18.4], [40.6, 17.9], [41.1, 16.9], [41.9, 16.1], [42.4, 14.2], [43.6, 13.5], [44.1, 12.6], [45.4, 12.3], [45.6, 13.8], [45.0, 13.9], [43.5, 16.4], [42.6, 18.1], [41.3, 19.4], [40.5, 19.4], [39.6, 20.1], [38.3, 21.3], [37.0, 21.6], [36.5, 22.5], [37.4, 23.5]];
const BISCAY = [[47, -1.2], [45.5, -1.2], [44.5, -1.25], [43.6, -1.45], [43.4, -1.8], [43.45, -3.0], [43.5, -6.5], [47, -6.5]];
const ISLANDS = [[[38.2, 12.4], [38.3, 15.6], [36.7, 15.1], [37.6, 12.6]], [[41.2, 9.2], [40.0, 9.8], [39.1, 9.5], [38.9, 8.6], [40.0, 8.4], [41.0, 8.2]], [[43.0, 9.4], [42.0, 9.5], [41.4, 9.2], [41.9, 8.6], [42.7, 8.6]]];
const PLACES = { Tunis: [36.8, 10.18], Marseille: [43.3, 5.37], Lyon: [45.76, 4.84], Rome: [41.9, 12.5], Laghouat: [33.8, 2.88], 'Ténès': [36.51, 1.31], Pau: [43.3, -0.37] };
function medMap(Q, box, a, { labelTop = false } = {}) {
  if (a <= 0) return;
  A(a, () => windowFrame(() => {
    ctx.fillStyle = C.sea; ctx.fillRect(box.x, box.y, box.w, box.h);
    const path = (pts, close) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...Q(p)) : ctx.moveTo(...Q(p)))); if (close) ctx.closePath(); };
    path(AFRICA); ctx.lineTo(box.x + box.w + 400, box.y + box.h + 10); ctx.lineTo(box.x - 400, box.y + box.h + 10); ctx.closePath(); ctx.fillStyle = '#e2d0a6'; ctx.fill();
    path(EUROPE); ctx.lineTo(box.x + box.w + 400, box.y - 10); ctx.lineTo(box.x - 400, box.y - 10); ctx.closePath(); ctx.fillStyle = '#d6c69e'; ctx.fill();
    path(BISCAY, true); ctx.fillStyle = C.sea; ctx.fill();
    for (const isl of ISLANDS) { path(isl, true); ctx.fillStyle = '#d6c69e'; ctx.fill(); }
    ctx.strokeStyle = 'rgba(42,38,32,0.45)'; ctx.lineWidth = 2; path(AFRICA); ctx.stroke(); path(EUROPE); ctx.stroke();
    txt('schematic map', box.x + box.w - 20, labelTop ? box.y + 34 : box.y + box.h - 30, { size: 32, weight: 500, color: 'rgba(42,38,32,0.7)', align: 'right' });
  }, { box }));
}
function medPlace(Q, name, a, { dx = 16, dy = 0, align = 'left' } = {}) {
  if (a <= 0) return;
  const [x, y] = Q(PLACES[name]);
  A(a, () => {
    ctx.fillStyle = C.dark; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
    k.font(700, 32, TEXT); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(233,219,182,0.9)'; ctx.lineJoin = 'round'; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.strokeText(name, x + dx, y + dy);
    txt(name, x + dx, y + dy, { size: 32, weight: 700, color: C.dark, align });
  });
}
function leg(Q, from, to, u, col, bend = 0) {
  if (u <= 0) return;
  const a = Q(PLACES[from]), b = Q(PLACES[to]);
  const m = [(a[0] + b[0]) / 2 + bend, (a[1] + b[1]) / 2 - Math.abs(bend) * 0.4];
  trace(smooth([a, m, b], 14), u, col, { w: 7, headSize: 20 });
}
const HELD = [['held by France', C.vichy, 'n2'], ['by Germany, then Italy', C.axis, 'n5'], ['back in Tunis', C.rose, 'n8']];
function partNationalists(t) {
  A(span(t, s('n1', 0.2), s('n2', 0.4), 0.5, 0.6), () => {
    heading('The Neo-Destour', 1, { sub: 'the party for independence from France' });
    seal(RCX, 470, 110, C.rose, { fill: 0.12 });
    txt('Habib Bourguiba', RCX, 660, { size: fit('Habib Bourguiba', 900, 72, { weight: 700, family: DISPLAY }), weight: 700, family: DISPLAY, color: C.ink, align: 'center' });
    txtFit('lawyer, party leader', RCX, 730, 900, { size: 36, weight: 500, color: C.soft, align: 'center' });
  });
  const mapA = span(t, s('n2', 0.1), CH[3].at + 1.0, 0.6, 0.8);
  medMap(QM, MED, mapA);
  if (mapA > 0) A(mapA, () => {
    ctx.save(); k.rrect(MED.x, MED.y, MED.w, MED.h, 22); ctx.clip();
    leg(QM, 'Tunis', 'Marseille', eio(seg(t, s('n2', 1.2), s('n2', 3.2))), C.vichy, 60);
    leg(QM, 'Marseille', 'Lyon', eio(seg(t, s('n5', 0.2), s('n5', 1.0))), C.vichy, 30);
    leg(QM, 'Lyon', 'Rome', eio(seg(t, s('n5', 1.6), s('n5', 3.2))), C.axis, 80);
    leg(QM, 'Rome', 'Tunis', eio(seg(t, s('n8', 0.3), s('n8', 2.0))), C.axis, 60);
    medPlace(QM, 'Tunis', 1, { dy: 24 });
    medPlace(QM, 'Marseille', seg(t, s('n2', 2.6), s('n2', 3.2)), { dx: -16, align: 'right', dy: 22 });
    medPlace(QM, 'Lyon', seg(t, s('n5', 0.6), s('n5', 1.2)), { dx: -16, align: 'right' });
    medPlace(QM, 'Rome', seg(t, s('n5', 2.6), s('n5', 3.2)), { dy: -26 });
    ctx.restore();
    // who held him, under the map
    let x = RX;
    HELD.forEach(([n, col, key]) => { const w = chip(n, x, 820, { color: col, size: 30, align: 'left', a: seg(t, s(key, 1.0), s(key, 1.6)) }); x += w + 16; });
  });
  // n3–n4: the letter, over the sea and Italy
  A(span(t, s('n3', 0.2), s('n5', 0.2), 0.5, 0.6), () => {
    ctx.save(); ctx.translate(RX + 470, 175); ctx.rotate(-0.02);
    card(0, 0, 510, 330, { bg: C.paper, r: 8 });
    txt('Marseille, August 1942', 30, 50, { size: 30, weight: 600, color: 'rgba(42,38,32,0.7)' });
    k.rich('“Germany will not win the war and cannot win it.”', 255, 150, { maxW: 450, size: 38, lh: 50, weight: 600, family: DISPLAY, ink: C.dark });
    txt('Habib Bourguiba', 480, 280, { size: 30, weight: 700, color: C.roseDk, align: 'right' });
    ctx.restore();
    A(seg(t, s('n4', 0.2), s('n4', 0.9)), () => chip('to his party: work with the Free French', RX, 905, { color: C.allied, size: 32, align: 'left' }));
  });
  // n6–n7: Rome
  A(span(t, s('n6', 0.2), s('n8', 0.2), 0.5, 0.6), () => {
    card(RX + 20, 520, 470, 230, { line: C.axis });
    txt('ROME, JANUARY 1943', RX + 46, 566, { size: 32, weight: 800, color: C.axis, spacing: '2px' });
    txtFit('received with honours', RX + 46, 620, 420, { size: 34, weight: 600, color: C.ink });
    txtFit('a declaration for the Axis?', RX + 46, 668, 420, { size: 32, weight: 500, color: C.soft });
    cross(RX + 440, 712, 22, C.rose, seg(t, s('n6', 3.6), s('n6', 4.4)));
    A(seg(t, s('n6', 4.0), s('n6', 4.6)), () => txt('no', RX + 400, 712, { size: 34, weight: 800, color: C.rose, align: 'right' }));
    A(seg(t, s('n7', 0.2), s('n7', 0.8)), () => chip('some activists worked with the occupiers', RX, 905, { color: C.soft, size: 30, align: 'left', line: false, bg: 'rgba(246,238,220,0.1)', fg: C.ink }));
  });
  A(span(t, s('n8', 1.6), CH[3].at + 1.0, 0.5, 0.6), () => {
    card(RX + 20, 560, 470, 190, { line: C.rose });
    txt('TUNIS, APRIL 1943', RX + 46, 610, { size: 32, weight: 800, color: C.rose, spacing: '2px' });
    txtFit('to his party: back the Allies', RX + 46, 680, 420, { size: 36, weight: 600, color: C.ink });
  });
}

// ---------- 4: those who helped ----------
const LAMPS = ['active help', 'risk', 'no reward', 'testimony'];
function lamp(x, y, on, label, col) {
  const g = ctx.createRadialGradient(x, y, 4, x, y, 90); g.addColorStop(0, `rgba(255,214,140,${0.55 * on})`); g.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 90, 0, TAU); ctx.fill();
  ctx.fillStyle = on > 0.5 ? '#ffd98a' : 'rgba(246,238,220,0.18)'; ctx.globalAlpha *= 0.5 + 0.5 * on;
  ctx.beginPath(); ctx.arc(x, y, 30, 0, TAU); ctx.fill(); ctx.globalAlpha /= 0.5 + 0.5 * on;
  ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 34, 0, TAU); ctx.stroke();
  ctx.fillStyle = C.soft; ctx.fillRect(x - 18, y + 36, 36, 16);
  txtFit(label, x, y + 92, 244, { size: 32, weight: 600, color: col, align: 'center' });
}
const FARM = { x: 800, y: 300, w: 1000, h: 560 };
function farmNight(t) {
  const { x, y, w, h } = FARM;
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0d1430'); g.addColorStop(1, '#2a2440');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  // stars
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  ctx.fillStyle = 'rgba(246,238,220,0.7)';
  const ga = ctx.globalAlpha;
  for (let i = 0; i < 70; i++) { const sx = x + rnd() * w, sy = y + rnd() * h * 0.45, tw = 0.5 + 0.5 * Math.sin(t * 2 + i); ctx.globalAlpha = ga * (0.4 + 0.5 * tw); ctx.fillRect(sx, sy, 2.5, 2.5); }
  ctx.globalAlpha = ga;
  // the moon
  ctx.fillStyle = '#f4ecd2'; ctx.beginPath(); ctx.arc(x + w - 120, y + 90, 34, 0, TAU); ctx.fill();
  ctx.fillStyle = '#0d1430'; ctx.beginPath(); ctx.arc(x + w - 106, y + 82, 30, 0, TAU); ctx.fill();
  // the ground
  ctx.fillStyle = '#2f2a24'; ctx.fillRect(x, y + h * 0.66, w, h * 0.34);
  // olive trees
  for (let i = 0; i < 9; i++) {
    const ox = x + 60 + i * 115 + (i % 2) * 20, oy = y + h * 0.66 + (i % 3) * 12;
    ctx.fillStyle = '#3d3329'; ctx.fillRect(ox - 5, oy - 40, 10, 44);
    ctx.fillStyle = '#3f5040'; ctx.beginPath(); ctx.ellipse(ox, oy - 60, 44, 30, 0, 0, TAU); ctx.fill();
  }
  // the farmhouse, its windows lit
  const hx = x + 560, hy = y + h * 0.66 - 150;
  ctx.fillStyle = '#d9cfb8'; ctx.fillRect(hx, hy, 300, 150);
  ctx.fillStyle = '#c9bea4'; ctx.fillRect(hx + 300, hy + 40, 120, 110);
  ctx.fillStyle = '#e8d9a8';
  for (let i = 0; i < 4; i++) { ctx.fillRect(hx + 30 + i * 70, hy + 40, 30, 40); }
  const glow = ctx.createRadialGradient(hx + 150, hy + 60, 10, hx + 150, hy + 60, 220); glow.addColorStop(0, 'rgba(255,214,140,0.25)'); glow.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = glow; ctx.fillRect(hx - 100, hy - 100, 500, 350);
  return { hx, hy };
}
function partHelp(t) {
  // h1–h3: Satloff's notebook
  A(span(t, s('h1', 0.2), s('h4', 0.4), 0.5, 0.6), () => {
    heading('Among the Righteous', 1, { sub: 'Robert Satloff, historian, 2006' });
    A(eout(seg(t, s('h1', 2.4), s('h1', 3.1))), () => {
      chip('stories of help', RX, 280, { color: C.bey, size: 34, align: 'left' });
      chip('and of betrayal', RX + 330, 280, { color: C.soft, size: 34, align: 'left', line: false, bg: 'rgba(246,238,220,0.1)', fg: C.ink });
    });
    A(eout(seg(t, s('h2', 0.2), s('h2', 0.9))), () => {
      card(RX, 350, RW, 230, { line: C.bey });
      txtFit('Moncef Bey’s ministers', RX + 36, 410, RW - 72, { size: 42, weight: 700, family: DISPLAY, color: C.bey });
      txtFit('warned Jewish leaders of German plans', RX + 36, 475, RW - 72, { size: 34, weight: 500, color: C.ink });
      txtFit('pleaded for hostages', RX + 36, 530, RW - 72, { size: 34, weight: 500, color: C.ink });
    });
    A(eout(seg(t, s('h3', 0.2), s('h3', 0.9))), () => {
      card(RX, 610, RW, 250, { line: C.bey });
      txtFit('Si Ali Sakkat, former mayor of Tunis', RX + 36, 670, RW - 72, { size: 42, weight: 700, family: DISPLAY, color: C.bey });
      txtFit('sheltered about 60 escaped workers', RX + 36, 735, RW - 72, { size: 34, weight: 500, color: C.ink });
      txtFit('on his farm near Zaghouan, during the battle', RX + 36, 790, RW - 72, { size: 34, weight: 500, color: C.soft });
    });
  });
  // h4–h8: Mahdia and the farm at Tlelsa
  A(span(t, s('h4', 0.2), s('h9', 0.4), 0.5, 0.6), () => {
    heading('Mahdia, on the coast', 1, { sub: 'Khaled Abdul-Wahab and two families' });
    windowFrame(() => {
      const { hx, hy } = farmNight(t);
      // h7: the night drive, headlights along the road to the farm
      const u = eio(seg(t, s('h7', 0.3), s('h7', 3.0)));
      if (u > 0) {
        const road = smooth([[FARM.x - 20, FARM.y + 470], [FARM.x + 260, FARM.y + 440], [FARM.x + 480, FARM.y + 420], [hx + 60, hy + 160]], 12);
        A(1, () => trace(road, u, 'rgba(255,230,170,0.75)', { w: 5, dash: [2, 12], head: false }));
      }
      // about two dozen people, as dots, in the courtyard
      for (let i = 0; i < SHELTERED; i++) {
        const a = seg(t, s('h7', 3.0 + i * 0.06), s('h7', 3.3 + i * 0.06));
        if (a <= 0) continue;
        const px = hx + 30 + (i % 12) * 22, py = hy + 178 + Math.floor(i / 12) * 20;
        A(a, () => { ctx.fillStyle = '#f6eedc'; ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU); ctx.fill(); });
      }
    }, { box: FARM });
    A(seg(t, s('h5', 0.3), s('h5', 1.0)), () => chip('Khaled Abdul-Wahab, go-between with the Germans', FARM.x + 20, FARM.y + 44, { color: C.bey, size: 30, align: 'left' }));
    A(span(t, s('h6', 0.3), s('h7', 0.3), 0.5, 0.5), () => chip('Anny Boukris, then 11, later told of a threat to her mother', FARM.x + 20, FARM.y + 108, { color: C.ink, size: 30, align: 'left', line: false, bg: 'rgba(22,9,17,0.85)' }));
    A(seg(t, s('h7', 3.4), s('h7', 4.0)), () => {
      chip('about two dozen people', FARM.x + 20, FARM.y + 108, { color: C.ink, size: 32, align: 'left', bg: 'rgba(22,9,17,0.85)' });
      chip('the farm at Tlelsa', FARM.x + FARM.w - 20, FARM.y + FARM.h - 40, { color: C.rose, size: 32, align: 'right', bg: 'rgba(22,9,17,0.85)' });
    });
    A(seg(t, s('h8', 0.2), s('h8', 0.9)), () => {
      for (let i = 0; i < 4; i++) { const a = seg(t, s('h8', 0.3 + i * 0.4), s('h8', 0.7 + i * 0.4)); A(a, () => { const mx = RX + 40 + i * 70, my = 940; ctx.fillStyle = '#f4ecd2'; ctx.beginPath(); ctx.arc(mx, my, 20, 0, TAU); ctx.fill(); ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(mx + 9, my - 5, 18, 0, TAU); ctx.fill(); }); }
      txtFit('some four months, until April 1943', RX + 330, 940, RW - 330, { size: 34, weight: 600, color: C.ink });
    });
  });
  // h9–h13: Yad Vashem's four tests
  A(span(t, s('h9', 0.2), s('h14', 0.4), 0.5, 0.6), () => {
    heading('Righteous Among the Nations', 1, { sub: 'Yad Vashem, Israel’s Holocaust memorial', color: C.ink });
    const riskDim = seg(t, s('h13', 0.2), s('h13', 1.6));
    LAMPS.forEach((n, i) => {
      const a = seg(t, s('h10', 0.3 + i * 0.4), s('h10', 0.8 + i * 0.4)), x = RX + 125 + i * 250, y = 380;
      const on = i === 1 ? 1 - 0.85 * riskDim : 1;
      A(a, () => lamp(x, y, on, n, i === 1 ? C.rose : C.soft));
    });
    A(span(t, s('h10', 2.6), s('h13', 0.2), 0.5, 0.5), () => { ctx.strokeStyle = C.rose; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(RX + 375, 380, 60, 0, TAU); ctx.stroke(); });
    A(eout(seg(t, s('h11', 0.2), s('h11', 0.9))), () => {
      card(RX, 540, 490, 120, { line: C.soft }); txtFit('no law was broken', RX + 245, 600, 450, { size: 36, weight: 600, color: C.ink, align: 'center' });
      A(seg(t, s('h11', 3.0), s('h11', 3.6)), () => { card(RX + 510, 540, 490, 120, { line: C.soft }); txtFit('the Germans knew', RX + 755, 600, 450, { size: 36, weight: 600, color: C.ink, align: 'center' }); });
    });
    A(span(t, s('h12', 0.2), s('h13', 0.4), 0.5, 0.5), () => {
      badge(RX + 50, 740, 30);
      txtFit('badges put on to be counted, one woman recalled', RX + 110, 740, RW - 110, { size: 34, weight: 600, color: C.ink });
    });
    A(eout(seg(t, s('h13', 0.3), s('h13', 1.0))), () => {
      card(RX, 690, RW, 230, { bg: C.paper, r: 10 });
      k.rich('“in the absence of risk, he was not eligible”', RCX, 748, { maxW: RW - 80, size: 40, lh: 50, weight: 600, family: DISPLAY, ink: C.dark });
      txtFit('Yad Vashem’s Commission', RCX, 812, RW - 60, { size: 32, weight: 700, color: C.roseDk, align: 'center' });
      txtFit('his solidarity “commands our deep appreciation”', RCX, 868, RW - 60, { size: 32, weight: 500, color: C.dark, align: 'center' });
    });
  });
  // h14–h15: documented, disputed
  A(span(t, s('h14', 0.2), CH[4].at + 1.0, 0.5, 0.6), () => {
    heading('Two questions', 1, { sub: 'what happened, and what it meant' });
    A(eout(seg(t, s('h14', 0.3), s('h14', 1.0))), () => {
      card(RX, 270, 490, 560, { bg: C.paper, r: 10 });
      txt('THE SHELTER', RX + 245, 330, { size: 34, weight: 800, color: C.dark, align: 'center', spacing: '2px' });
      para('About two dozen people, two families, some four months on his farm', RX + 245, 470, 420, { size: 34, weight: 500, color: C.dark });
      stamp('DOCUMENTED', RX + 245, 700, C.stampG, seg(t, s('h15', 3.0), s('h15', 3.5)));
    });
    A(eout(seg(t, s('h14', 1.4), s('h14', 2.1))), () => {
      card(RX + 510, 270, 490, 560, { bg: C.paper, r: 10 });
      txt('THE RISK', RX + 755, 330, { size: 34, weight: 800, color: C.dark, align: 'center', spacing: '2px' });
      txtFit('Yad Vashem: none', RX + 755, 420, 440, { size: 34, weight: 700, color: C.dark, align: 'center' });
      A(seg(t, s('h14', 2.6), s('h14', 3.3)), () => para('Eva Weisel, sheltered there: drunken officers threatened the families', RX + 755, 530, 420, { size: 30, weight: 500, color: C.dark }));
      A(seg(t, s('h15', 0.2), s('h15', 0.9)), () => para('his family, Satloff: there was risk', RX + 755, 640, 420, { size: 30, weight: 600, color: C.dark }));
      stamp('DISPUTED', RX + 755, 740, C.stampR, seg(t, s('h15', 4.6), s('h15', 5.1)), 0.06);
    });
  });
}

// ---------- 5: after the liberation ----------
const TLY = 930, TL0 = 1943, TL1 = 1958, tly = (yr) => lerp(RX + 30, RX + RW - 30, (yr - TL0) / (TL1 - TL0));
function years(t, a) {
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = C.faint; ctx.fillRect(RX + 30, TLY - 3, RW - 60, 6);
    for (let y = TL0; y <= TL1; y++) { const x = tly(y); ctx.fillStyle = C.soft; ctx.fillRect(x - 1.5, TLY - 10, 3, 20); }
    for (const y of [1943, 1948, 1956]) txt(String(y), tly(y), TLY + 38, { size: 32, weight: 700, color: C.soft, align: 'center' });
  });
}
function yearMark(yr, label, col, a, { up = 1 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const x = tly(yr);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, TLY, 11, 0, TAU); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, TLY - 14); ctx.lineTo(x, TLY - 40 - up * 44); ctx.stroke();
    const al = x > RX + RW - 260 ? 'right' : x < RX + 160 ? 'left' : 'center';
    txt(label, x + (al === 'right' ? 10 : al === 'left' ? -10 : 0), TLY - 62 - up * 44, { size: 32, weight: 700, color: col, align: al });
  });
}
function partAfter(t) {
  const yA = span(t, s('l10', 0.2), CH[5].at + 1.0, 0.6, 0.6);
  // l1–l2: liberation
  A(span(t, s('l1', 0.2), s('l4', 0.4), 0.5, 0.6), () => {
    dateCard(RX, 150, RW, '7 MAY 1943', 'British troops enter Tunis, Americans Bizerte', C.allied, eout(seg(t, s('l1', 0.3), s('l1', 1.0))));
    A(seg(t, s('l1', 4.0), s('l1', 4.7)), () => chip('the forced labourers come home', RX, 350, { color: C.rose, size: 34, align: 'left' }));
    dateCard(RX, 430, RW, '13 MAY 1943', 'the last Axis armies in Africa surrender', C.allied, eout(seg(t, s('l2', 0.3), s('l2', 1.0))));
    A(seg(t, s('l2', 3.4), s('l2', 4.1)), () => {
      card(RX, 610, RW, 220, { line: C.vichy });
      txtFit('Admiral Esteva', RX + 36, 660, RW - 72, { size: 40, weight: 700, family: DISPLAY, color: C.vichy });
      txtFit('flown to France by the Germans', RX + 36, 724, RW - 72, { size: 34, weight: 500, color: C.ink });
      txtFit('convicted of treason in 1945', RX + 36, 776, RW - 72, { size: 34, weight: 500, color: C.ink });
    });
  });
  // l4–l6: the charge, the exile, the verdict
  A(span(t, s('l4', 0.2), s('l7', 0.4), 0.5, 0.6), () => {
    A(span(t, s('l4', 0.2), s('l5', 0.4), 0.5, 0.5), () => heading('Algiers, May 1943', 1, { sub: 'the French authorities under General Henri Giraud' }));
    // the exile, on a small schematic map; beside it, the dates
    const ex = seg(t, s('l5', 0.2), s('l5', 0.9));
    medMap(QE, EXILE, ex, { labelTop: true });
    if (ex > 0) A(ex, () => {
      ctx.save(); k.rrect(EXILE.x, EXILE.y, EXILE.w, EXILE.h, 22); ctx.clip();
      leg(QE, 'Tunis', 'Laghouat', eio(seg(t, s('l5', 1.0), s('l5', 3.0))), C.vichy, -30);
      medPlace(QE, 'Tunis', 1, { dx: -16, align: 'right', dy: -22 });
      medPlace(QE, 'Laghouat', seg(t, s('l5', 2.6), s('l5', 3.2)), { dx: -16, align: 'right', dy: 0 });
      medPlace(QE, 'Ténès', seg(t, s('l5', 3.6), s('l5', 4.2)), { dy: -22 });
      medPlace(QE, 'Pau', seg(t, s('l5', 4.2), s('l5', 4.8)), { dy: 24 });
      ctx.restore();
      const x0 = EXILE.x + EXILE.w + 30, w0 = RX + RW - x0;
      card(x0, EXILE.y, w0, 200, { line: C.rose });
      txtFit('14 MAY 1943', x0 + 26, EXILE.y + 52, w0 - 52, { size: 40, weight: 800, color: C.rose, spacing: '2px' });
      txtFit('Moncef Bey deposed', x0 + 26, EXILE.y + 112, w0 - 52, { size: 34, weight: 600, color: C.ink });
      txtFit('and flown to Algeria', x0 + 26, EXILE.y + 158, w0 - 52, { size: 30, weight: 500, color: C.soft });
      A(seg(t, s('l5', 4.4), s('l5', 5.0)), () => {
        card(x0, EXILE.y + 230, w0, 210, { line: C.bey });
        txt(fmt(REIGN), x0 + 26, EXILE.y + 300, { size: 72, weight: 800, family: DISPLAY, color: C.bey });
        txtFit('days on the throne', x0 + 26, EXILE.y + 384, w0 - 52, { size: 32, weight: 600, color: C.soft });
      });
    });
    const cy = 620;
    A(eout(seg(t, s('l4', 2.4), s('l4', 3.1))), () => {
      card(RX, cy, 490, 270, { line: C.vichy });
      txt('THE CHARGE', RX + 245, cy + 56, { size: 32, weight: 800, color: C.vichy, align: 'center', spacing: '2px' });
      txtFit('collaborating with the Axis', RX + 245, cy + 140, 440, { size: 38, weight: 700, family: DISPLAY, color: C.ink, align: 'center' });
      txtFit('General Henri Giraud, Algiers', RX + 245, cy + 220, 440, { size: 30, weight: 600, color: C.vichy, align: 'center' });
    });
    A(eout(seg(t, s('l6', 0.3), s('l6', 1.0))), () => {
      card(RX + 510, cy, 490, 270, { bg: C.paper, r: 12 });
      txt('JUIN’S MEMOIRS', RX + 755, cy + 56, { size: 32, weight: 800, color: C.dark, align: 'center', spacing: '2px' });
      txtFit('nothing serious against him', RX + 755, cy + 140, 440, { size: 38, weight: 700, family: DISPLAY, color: C.dark, align: 'center' });
      txtFit('General Alphonse Juin', RX + 755, cy + 220, 440, { size: 30, weight: 600, color: C.roseDk, align: 'center' });
    });
  });
  // l7–l9: what liberation did and didn't change
  A(span(t, s('l7', 0.2), s('l10', 0.4), 0.5, 0.6), () => {
    heading('After the liberation', 1, { sub: 'Tunisia under French rule again' });
    const rows = [['l7', 'Tunisia’s Jews', 'Vichy’s anti-Jewish laws in force until 1944', C.rose], ['l8', 'Tunisia’s Italians', 'their schools and newspapers closed', C.italy], ['l9', 'Habib Bourguiba', 'not charged; an American diplomat spoke for him', C.rose]];
    rows.forEach(([key, who, what, col], i) => {
      const a = eout(seg(t, s(key, 0.2), s(key, 0.9))), y = 270 + i * 210;
      A(a, () => {
        card(RX, y, RW, 180, { line: col });
        txtFit(who, RX + 36, y + 60, RW - 72, { size: 40, weight: 700, family: DISPLAY, color: col });
        txtFit(what, RX + 36, y + 124, RW - 72, { size: 34, weight: 500, color: C.ink });
      });
    });
  });
  // l10–l13: the road to 1956, on a timeline
  A(span(t, s('l10', 0.2), CH[5].at + 1.0, 0.5, 0.6), () => {
    A(span(t, s('l10', 0.2), s('l12', 0.3), 0.5, 0.6), () => {
      heading('A deposed Bey', 1, { sub: 'and a throne many saw as usurped' });
      seal(RX + 250, 420, 100, C.bey, { fill: 0.15 });
      txtFit('Moncef Bey', RX + 250, 580, 460, { size: 44, weight: 700, family: DISPLAY, color: C.bey, align: 'center' });
      txtFit('a symbol', RX + 250, 636, 460, { size: 34, weight: 600, color: C.soft, align: 'center' });
      A(seg(t, s('l10', 3.2), s('l10', 3.9)), () => {
        seal(RX + 750, 420, 100, C.vichy, { fill: 0.08 });
        txtFit('Lamine Bey', RX + 750, 580, 460, { size: 44, weight: 700, family: DISPLAY, color: C.vichy, align: 'center' });
        txtFit('seen by many as a usurper', RX + 750, 636, 460, { size: 34, weight: 600, color: C.soft, align: 'center' });
      });
      A(seg(t, s('l11', 0.3), s('l11', 1.0)), () => chip('1948: dies in Pau; thousands at his funeral in Tunis', RCX, 740, { color: C.bey, size: 32 }));
    });
    A(span(t, s('l12', 0.2), CH[5].at + 1.0, 0.5, 0.6), () => {
      heading('The road to independence', 1, { sub: 'Habib Bourguiba and the Neo-Destour' });
      A(span(t, s('l12', 0.2), s('l13', 0.4), 0.5, 0.5), () => {
        dateCard(RX, 260, RW, '1945', 'Bourguiba takes Tunisia’s cause to Cairo', C.rose, eout(seg(t, s('l12', 0.3), s('l12', 1.0))));
        dateCard(RX, 440, RW, '1952 TO 1954', 'in French prisons again', C.vichy, eout(seg(t, s('l12', 1.8), s('l12', 2.5))));
        dateCard(RX, 620, RW, '1954', 'France promises self-rule', C.allied, eout(seg(t, s('l12', 3.6), s('l12', 4.3))));
      });
      A(seg(t, s('l13', 0.2), s('l13', 1.2)), () => {
        // the flag of Tunisia: red, a white disc, a red crescent and star
        const fx = RCX - 210, fy = 300, fw = 420, fh = 280;
        ctx.fillStyle = '#d7263d'; ctx.fillRect(fx, fy, fw, fh);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(fx + fw / 2, fy + fh / 2, fh * 0.25, 0, TAU); ctx.fill();
        ctx.fillStyle = '#d7263d'; ctx.beginPath(); ctx.arc(fx + fw / 2 - 8, fy + fh / 2, fh * 0.19, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(fx + fw / 2 + 4, fy + fh / 2, fh * 0.155, 0, TAU); ctx.fill();
        ctx.fillStyle = '#d7263d'; ctx.beginPath();
        for (let i = 0; i < 10; i++) { const ang = -Math.PI / 2 + (i / 10) * TAU + Math.PI / 2 * 0, rr = i % 2 ? 9 : 22, cx = fx + fw / 2 + 12, cy = fy + fh / 2; i ? ctx.lineTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr) : ctx.moveTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr); }
        ctx.closePath(); ctx.fill();
        txt('20 MARCH 1956', RCX, 650, { size: 56, weight: 800, family: DISPLAY, color: C.rose, align: 'center' });
        txtFit('Tunisia independent', RCX, 716, 900, { size: 38, weight: 600, color: C.ink, align: 'center' });
      });
    });
    years(t, yA);
    yearMark(1943.37, 'deposed', C.vichy, seg(t, s('l10', 0.6), s('l10', 1.2)), { up: 0 });
    yearMark(1948.67, 'dies in exile', C.bey, seg(t, s('l11', 0.3), s('l11', 0.9)), { up: 0 });
    yearMark(1945.2, 'Bourguiba to Cairo', C.rose, seg(t, s('l12', 0.3), s('l12', 0.9)), { up: 1 });
    yearMark(1954.58, 'self-rule promised', C.allied, seg(t, s('l12', 3.6), s('l12', 4.2)), { up: 1 });
    A(seg(t, s('l12', 1.8), s('l12', 2.4)), () => { ctx.fillStyle = C.vichy; ctx.fillRect(tly(1952.1), TLY - 7, tly(1954.4) - tly(1952.1), 14); txt('prison', tly(1953.25), TLY + 38, { size: 32, weight: 700, color: C.vichy, align: 'center' }); });
    yearMark(1956.22, 'independence', C.rose, seg(t, s('l13', 0.3), s('l13', 0.9)), { up: 0 });
    yearMark(1957.56, 'republic', C.rose, seg(t, s('l13', 3.6), s('l13', 4.2)), { up: 2 });
  });
}

// ---------- 6: many stories ----------
const STORIES = [
  ['r2', 'Tunisia’s Jews', 'forced labour, fines and fear', C.rose],
  ['r3', 'Muslim and European families', 'air raids and shortages', C.soft],
  ['r4', 'The Bey', 'protected his subjects where he could', C.bey],
  ['r5', 'Nationalists and neighbours', 'chose sides; helped, or betrayed', C.allied],
];
function partStories(t) {
  A(span(t, s('r1', 0.2), s('r6', 0.4), 0.5, 0.6), () => {
    heading('Many stories', 1, { sub: 'each on its own terms' });
    STORIES.forEach(([key, who, what, col], i) => {
      const a = eout(seg(t, s(key, 0.2), s(key, 0.9))), x = RX + (i % 2) * 510, y = 270 + Math.floor(i / 2) * 330;
      A(a, () => {
        card(x, y, 490, 300, { line: col });
        seal(x + 245, y + 64, 36, col, { fill: 0.14, lw: 3 });
        para(who, x + 245, y + 156, 440, { size: 34, weight: 700, family: DISPLAY, color: col, lh: 1.15 });
        para(what, x + 245, y + 244, 462, { size: 30, weight: 500, color: C.ink, lh: 1.2 });
      });
    });
  });
  A(span(t, s('r6', 0.2), s('r7', 0.4), 0.5, 0.6), () => {
    heading('Remembered', 1);
    dateCard(RX, 260, RW, '9 DECEMBER 1942', 'the Tunis roundup, commemorated in Paris and Tunis', C.rose, eout(seg(t, s('r6', 0.3), s('r6', 1.0))));
    dateCard(RX, 450, RW, 'LA MARSA, 2012', 'a square named after Moncef Bey', C.bey, eout(seg(t, s('r6', 4.0), s('r6', 4.7))));
  });
  A(span(t, s('r7', 0.2), e('r7', 2.4), 0.5, 0.8), () => {
    stamp('DOCUMENTED', RCX - 230, 420, C.stampG, eout(seg(t, s('r7', 0.6), s('r7', 1.2))), -0.06, 44);
    stamp('DISPUTED', RCX + 250, 420, C.rose, eout(seg(t, s('r7', 2.4), s('r7', 3.0))), 0.05, 44);
    A(seg(t, s('r7', 4.2), s('r7', 5.0)), () => txtFit('telling them apart is part of remembering', RCX, 580, 960, { size: 40, weight: 600, color: C.soft, align: 'center' }));
  });
}

// ---------- title cards and credits ----------
const CARD_SUB = [null, 'Tunis, 1940 to 1943', 'November 1942 to May 1943', 'Marseille, Rome, Tunis', 'Tunis, Zaghouan, Mahdia', 'May 1943 to 1957', null];
function titleCards(t) {
  CH.forEach((ch, i) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.88, () => { ctx.fillStyle = 'rgba(14,6,11,0.93)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8)), y = 470 + (1 - p) * 20;
      txt(`PART ${ch.n}`, W / 2, y - 120, { size: 36, weight: 700, color: C.rose, align: 'center', spacing: '6px' });
      const title = ch.title.toUpperCase();
      txt(title, W / 2, y, { size: fit(title, 1500, 120, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
      const sub = CARD_SUB[i + 1];
      if (sub) txt(sub, W / 2, y + 110, { size: fit(sub, 1400, 48), weight: 600, color: C.soft, align: 'center' });
      // the six chapters as seals, this one lit
      const y2 = y + 220;
      for (let j = 0; j < CH.length; j++) seal(W / 2 - (CH.length - 1) * 70 + j * 140, y2, 26, C.rose, { fill: j === i ? 0.9 : 0.08, lw: 3 });
    });
  });
}
const MUSIC = ['“Despair and Triumph” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“A Very Brady Special” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Danse Morialta” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  'Yad Vashem; US Holocaust Memorial Museum; Mémorial de la Shoah; Montreal Holocaust Museum;',
  'Foreign Relations of the United States, 1943; Robert Satloff, Among the Righteous (2006);',
  'Sarah Abrevaya Stein and Aomar Boum; Eva Weisel (New York Times, 2011); Posen Library;',
  'Documentation Center of North African Jews during WWII; Larousse; Kapitalis; Webdo; Christian Science Monitor;',
  'Wikipedia: Moncef Bey; Lamine Bey; Jean-Pierre Esteva; Habib Bourguiba; Khaled Abdul-Wahab; Italian Tunisians.',
  'Map outlines: Natural Earth (public domain), simplified.',
];
function credits(t) {
  ctx.fillStyle = '#10070c'; ctx.fillRect(0, 0, W, H);
  txt('SIX MONTHS UNDER OCCUPATION', W / 2, 190, { size: fit('SIX MONTHS UNDER OCCUPATION', 1600, 84, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
  txt('Tunisia 1943 · original animation', W / 2, 276, { size: 40, weight: 600, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 366, { size: 32, weight: 800, color: C.rose, align: 'center', spacing: '4px' });
  MUSIC.forEach((m, j) => txt(m, W / 2, 414 + j * 44, { size: 32, weight: 500, align: 'center' }));
  txt('SOURCES', W / 2, 588, { size: 32, weight: 800, color: C.rose, align: 'center', spacing: '4px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, 638 + j * 46, 1700, { size: 32, weight: 500, align: 'center', color: j > 4 ? C.soft : C.ink }));
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [DISPLAY, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    drawMap(t);
    const parts = [partOpen, partPowers, partJews, partNationalists, partHelp, partAfter, partStories];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    titleCards(t);
    A(seg(t, e('r7', 1.4), e('r7', 2.4)), () => credits(t));
  },
});
