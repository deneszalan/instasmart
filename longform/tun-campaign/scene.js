// "The Tunisian campaign" (« La campagne de Tunisie »): the long film of Tunisia 1943's Campaign section, 16:9, 1920x1080.
// The campaign as one chronological story. On the left, the series' schematic map of Tunisia: the ground the Axis held
// (a rust hatch) grows from Tunis in November 1942, spreads down the east, bulges at Kasserine, shrinks north after
// Mareth and the Wadi Akarit, splits and vanishes in May 1943; Allied moves in blue, Axis moves in terracotta. On the
// right, above every chapter, the film's motif: a month ribbon from November 1942 to May 1943 with a moving date marker.
// Below it, insets, zoomed maps and plain cards. Casualty and prisoner figures are shown only as text with their source.
// Look: the series' layout, cards, fonts (Fraunces for titles, Barlow for labels) and map style (see tun-visit), on a
// deep olive ground like a staff map; accent colour olive-lime (#c9d36a).
// The same scene plays the French version: kit.js swaps every whole string for its labels-fr.json entry, so words and
// numbers are drawn as separate strings. Map outline: Natural Earth (public domain), simplified; the rough coastlines of
// the Mediterranean insets come from the post history-race-for-tunis-1942; everything else is drawn here.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
/** A moment a fraction u of the way through a line. */
const at = (key, u) => lerp(T[key][0], T[key][1], u);
const TAU = Math.PI * 2, RAD = Math.PI / 180;

const C = {
  bg0: '#10130b', bg1: '#272d1b', contour: 'rgba(214,222,170,0.05)',
  sea: '#1b3a40', sea2: '#24505a', land: '#e4d3ab', neigh: '#4d5544', hill: 'rgba(120,92,58,0.8)', chott: '#cfd2c4',
  ink: '#f4efdc', soft: 'rgba(244,239,220,0.76)', faint: 'rgba(244,239,220,0.22)', dark: '#2a2620', dark2: 'rgba(42,38,32,0.72)',
  acc: '#c9d36a', accDk: '#7f8a2a', allied: '#88c2e4', alliedDk: '#2f6a8c', axis: '#de7a5c', axisDk: '#9c4128', grey: '#a7a49a',
  card: 'rgba(13,16,9,0.92)', panel: 'rgba(13,16,9,0.8)', night: 'rgba(8,12,24,0.5)',
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
function fit(str, maxW, size, o = {}) { let z = size; while (z > 32 && textW(str, { ...o, size: z }) > maxW) z -= 2; return z; }
/** Text that shrinks to fit maxW (never below 32 px). */
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** A rounded label as wide as its text. */
function chip(str, cx, cy, { color = C.ink, bg = C.card, size = 34, weight = 700, a = 1, align = 'center', line = true, family = TEXT, spacing = '0px', fill = null } = {}) {
  const w = textW(str, { size, weight, family, spacing }), pad = size * 0.62, h = size * 1.6;
  const x0 = align === 'left' ? cx : align === 'right' ? cx - w - pad * 2 : cx - w / 2 - pad;
  A(a, () => {
    k.rrect(x0, cy - h / 2, w + pad * 2, h, h / 2); ctx.fillStyle = fill ?? bg; ctx.fill();
    if (line) { ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke(); }
    txt(str, x0 + pad + w / 2, cy + 1, { size, weight, color: fill ? C.bg0 : color, align: 'center', family, spacing });
  });
  return w + pad * 2;
}
function card(x, y, w, h, { bg = C.card, r = 18, line = null } = {}) {
  k.rrect(x, y, w, h, r); ctx.fillStyle = bg; ctx.fill();
  if (line) { ctx.lineWidth = 3; ctx.strokeStyle = line; ctx.stroke(); }
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
/** A short blue bar across a road: where the Allies held. */
function heldBar(x, y, ang, a = 1, col = C.allied, len = 46) {
  if (a <= 0) return;
  A(a, () => {
    const dx = Math.cos(ang + Math.PI / 2) * len / 2, dy = Math.sin(ang + Math.PI / 2) * len / 2;
    ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.lineTo(x + dx, y + dy); ctx.stroke(); ctx.lineCap = 'butt';
  });
}
/** A pulsing ring, to point at a place. */
function ring(x, y, a, t, col = C.acc, r0 = 22) {
  if (a <= 0) return;
  A(a, () => {
    ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r0, 0, TAU); ctx.stroke();
    const p = (t * 0.7) % 1; ctx.globalAlpha *= 1 - p; ctx.beginPath(); ctx.arc(x, y, r0 + p * 26, 0, TAU); ctx.stroke();
  });
}

// ---------- geography ----------
const hav = ([la1, lo1], [la2, lo2]) => {
  const a = Math.sin((la2 - la1) * RAD / 2) ** 2 + Math.cos(la1 * RAD) * Math.cos(la2 * RAD) * Math.sin((lo2 - lo1) * RAD / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
};
const pathKm = (pts) => pts.slice(1).reduce((d, p, i) => d + hav(pts[i], p), 0);
// Places [lat, lon], from Wikipedia's coordinates (rounded) and the posts' scenes.
const PL = {
  tunis: [36.806, 10.181], bizerte: [37.274, 9.874], aouina: [36.851, 10.227], djedeida: [36.85, 9.93], tebourba: [36.83, 9.84],
  medjez: [36.65, 9.61], beja: [36.73, 9.18], mateur: [37.04, 9.665], souk: [36.5, 8.78], tabarka: [36.95, 8.76], algiers: [36.75, 3.05],
  longstop: [36.735, 9.641], hill609: [36.98, 9.47], pontdufahs: [36.37, 9.9], ousseltia: [35.85, 9.6], robaa: [36.0, 9.45],
  faid: [34.96, 9.66], sidi: [34.87, 9.5], sbeitla: [35.23, 9.13], kasserine: [35.17, 8.83], pass: [35.24, 8.73], thala: [35.57, 8.67],
  sbiba: [35.55, 9.07], hamra: [35.23, 8.56], tebessa: [35.40, 8.12], feriana: [34.95, 8.57], gafsa: [34.42, 8.78], guettar: [34.34, 8.95],
  gabes: [33.883, 10.117], medenine: [33.355, 10.505], mareth: [33.62, 10.29], zarat: [33.69, 10.36], matmata: [33.54, 9.97],
  tebaga: [33.72, 9.67], hamma: [33.89, 9.79], ksar: [32.98, 9.64], akarit: [34.1, 10.05], sfax: [34.74, 10.76], sousse: [35.825, 10.636],
  enfidaville: [36.135, 10.381], takrouna: [36.15, 10.3275], zaghouan: [36.40, 10.14], hammamlif: [36.73, 10.34], hammamet: [36.40, 10.617],
  kelibia: [36.85, 11.1], kairouan: [35.678, 10.1], monastir: [35.77, 10.83], mahdia: [35.5, 11.06], nabeul: [36.45, 10.735],
  kef: [36.18, 8.71], siliana: [36.08, 9.37], tozeur: [33.92, 8.13], djerba: [33.875, 10.857], tataouine: [32.93, 10.45],
};
// Computed distances, checked against the narration's rounded figures.
const ALGIERS_TUNIS = hav(PL.algiers, PL.tunis); // "more than 600 kilometres" (about 636)
const DJ_AOUINA = hav(PL.djedeida, PL.aouina), DJ_SOUK = hav(PL.djedeida, PL.souk); // the post's lab: about 17 and 68 miles
const RETREAT = hav(PL.faid, PL.pass); // "about 80 kilometres" (the post: about 50 miles)
const near = (x, to, tol) => Math.abs(x - to) <= tol;
if (!near(ALGIERS_TUNIS, 636, 8) || !near(DJ_AOUINA, 27, 3) || !near(DJ_SOUK, 110, 6) || !near(RETREAT, 85, 10)) {
  throw new Error(`distances ${[ALGIERS_TUNIS, DJ_AOUINA, DJ_SOUK, RETREAT].map(Math.round)}`);
}
// The left hook (schematic, as in the post history-mareth-line-left-hook): from the Eighth Army's front by Medenine,
// south round the Matmata hills, past Ksar Rhilane, north to the Tebaga Gap; "some 200 kilometres".
const HOOK = [[33.3, 10.45], [33.12, 10.3], [32.98, 10.0], [32.98, 9.7], [33.15, 9.5], [33.4, 9.45], [33.6, 9.55], [33.72, 9.67]];
const HOOK_KM = pathKm(smooth(HOOK, 8));
if (!near(HOOK_KM, 200, 30)) throw new Error(`hook ${Math.round(HOOK_KM)}`);
// Numbers drawn on screen (sources in script.mjs).
const N = {
  torch: 125000, ger: 15000, ita: 9000, fr: 72802, frNA: 50651, tanks: 98, med0: 44, med1: 56,
  pw0: 238243, pw1: 275000, cas0: 70000, cas1: 76020, killed: 6233 + 2156 + 2715, axisGer: 8500, axisIta: 3700, jews: 5000,
};
if (N.killed !== 11104 || Math.round((N.frNA / N.fr) * 100) !== 70) throw new Error('numbers');

// ---------- the map (Natural Earth, simplified) ----------
const MAPDATA = {"TUN":[[[33.181,11.504],[32.902,11.457],[32.637,11.45],[32.507,11.562],[32.435,11.547],[32.369,11.443],[32.136,10.874],[32.004,10.773],[31.962,10.705],[31.974,10.629],[31.954,10.608],[31.84,10.586],[31.744,10.5],[31.715,10.428],[31.715,10.316],[31.68,10.266],[31.518,10.132],[31.428,10.107],[31.079,10.244],[30.986,10.244],[30.915,10.269],[30.842,10.255],[30.731,10.194],[30.641,10.1],[30.354,9.873],[30.331,9.743],[30.229,9.52],[32.072,9.045],[32.105,9.02],[32.526,8.332],[32.837,8.282],[33.095,8.087],[33.108,8.001],[33.184,7.871],[33.208,7.749],[33.232,7.724],[33.414,7.709],[33.659,7.555],[33.801,7.497],[33.894,7.479],[34.095,7.519],[34.199,7.63],[34.245,7.767],[34.414,7.832],[34.53,8.095],[34.637,8.228],[34.681,8.21],[34.763,8.271],[34.902,8.249],[35.067,8.3],[35.241,8.433],[35.29,8.318],[35.326,8.293],[35.403,8.289],[35.508,8.336],[35.621,8.329],[35.685,8.307],[35.751,8.257],[35.827,8.242],[36.036,8.275],[36.146,8.318],[36.244,8.307],[36.351,8.354],[36.43,8.357],[36.469,8.296],[36.491,8.167],[36.526,8.17],[36.663,8.429],[36.732,8.462],[36.768,8.408],[36.785,8.411],[36.803,8.555],[36.837,8.642],[36.94,8.602],[36.974,8.717],[36.979,8.825],[37.021,8.905],[37.153,9.038],[37.193,9.16],[37.234,9.211],[37.235,9.344],[37.276,9.419],[37.267,9.455],[37.31,9.553],[37.3,9.574],[37.345,9.743],[37.328,9.859],[37.271,9.862],[37.213,9.772],[37.154,9.808],[37.149,9.88],[37.197,9.927],[37.213,9.923],[37.234,9.862],[37.227,9.819],[37.262,9.866],[37.246,9.981],[37.266,10.05],[37.178,10.273],[37.159,10.212],[37.175,10.204],[37.171,10.147],[37.159,10.129],[37.143,10.136],[37.129,10.219],[37.095,10.226],[37.11,10.219],[37.077,10.176],[37.028,10.183],[36.977,10.219],[36.881,10.348],[36.822,10.298],[36.847,10.255],[36.839,10.219],[36.798,10.19],[36.786,10.248],[36.817,10.273],[36.749,10.32],[36.73,10.356],[36.729,10.438],[36.756,10.518],[36.773,10.539],[36.864,10.568],[36.896,10.734],[37.006,10.888],[37.05,10.903],[37.087,11.032],[37.063,11.061],[37.021,11.047],[36.918,11.094],[36.871,11.137],[36.854,11.13],[36.788,11.022],[36.452,10.798],[36.378,10.55],[36.337,10.518],[36.217,10.478],[36.112,10.474],[35.981,10.518],[35.922,10.582],[35.842,10.622],[35.77,10.744],[35.78,10.824],[35.766,10.842],[35.734,10.824],[35.699,10.842],[35.638,11.04],[35.614,11.054],[35.603,11.018],[35.555,11.014],[35.518,11.04],[35.506,11.086],[35.459,11.05],[35.334,11.043],[35.266,11.101],[35.238,11.162],[35.219,11.158],[35.206,11.112],[35.093,11.014],[35.033,11.018],[34.957,10.917],[34.873,10.917],[34.838,10.86],[34.797,10.87],[34.768,10.813],[34.655,10.701],[34.633,10.626],[34.532,10.582],[34.497,10.431],[34.424,10.377],[34.414,10.287],[34.372,10.248],[34.304,10.104],[34.213,10.053],[34.171,10.006],[33.983,10.05],[33.828,10.172],[33.684,10.366],[33.647,10.489],[33.706,10.716],[33.671,10.741],[33.603,10.737],[33.546,10.672],[33.483,10.716],[33.485,10.78],[33.539,10.91],[33.575,10.932],[33.617,10.906],[33.637,10.935],[33.627,10.96],[33.644,10.986],[33.618,11.043],[33.541,11.112],[33.49,11.115],[33.455,11.09],[33.392,11.112],[33.363,11.101],[33.372,11.13],[33.331,11.169],[33.287,11.295],[33.311,11.133],[33.281,11.122],[33.222,11.169],[33.184,11.418],[33.206,11.428],[33.259,11.353],[33.181,11.504]],[[33.841,10.993],[33.801,11.061],[33.738,10.971],[33.698,10.957],[33.733,10.957],[33.728,10.942],[33.64,10.888],[33.654,10.87],[33.688,10.878],[33.735,10.809],[33.703,10.78],[33.715,10.741],[33.759,10.726],[33.813,10.748],[33.885,10.737],[33.897,10.773],[33.88,10.899],[33.897,10.932],[33.841,10.993]],[[34.657,10.964],[34.672,10.986],[34.67,11.101],[34.66,11.112],[34.647,11.097],[34.621,11.054],[34.657,10.964]],[[34.773,11.266],[34.743,11.306],[34.73,11.299],[34.664,11.13],[34.681,11.122],[34.728,11.169],[34.758,11.173],[34.751,11.184],[34.748,11.223],[34.782,11.216],[34.826,11.256],[34.806,11.306],[34.773,11.266]]],"NEIGH":[[[30.0,6.0],[36.855,6.0],[36.903,6.197],[36.947,6.255],[37.024,6.273],[37.07,6.338],[37.094,6.417],[37.083,6.503],[37.058,6.543],[36.974,6.601],[36.953,6.82],[36.893,6.91],[36.891,6.975],[36.926,7.094],[36.915,7.133],[36.915,7.159],[36.994,7.256],[37.023,7.252],[37.083,7.18],[37.09,7.223],[37.07,7.274],[37.083,7.382],[37.051,7.403],[37.041,7.457],[37.055,7.49],[36.987,7.591],[36.987,7.673],[36.964,7.713],[36.97,7.771],[36.994,7.799],[36.889,7.774],[36.854,7.868],[36.877,8.051],[36.958,8.231],[36.926,8.289],[36.901,8.462],[36.94,8.602],[36.891,8.609],[36.849,8.642],[36.803,8.555],[36.785,8.411],[36.768,8.408],[36.732,8.462],[36.663,8.429],[36.526,8.17],[36.491,8.167],[36.469,8.296],[36.43,8.357],[36.351,8.354],[36.244,8.307],[36.146,8.318],[36.036,8.275],[35.827,8.242],[35.751,8.257],[35.685,8.307],[35.621,8.329],[35.508,8.336],[35.403,8.289],[35.326,8.293],[35.29,8.318],[35.241,8.433],[35.067,8.3],[34.902,8.249],[34.763,8.271],[34.681,8.21],[34.648,8.235],[34.53,8.095],[34.414,7.832],[34.245,7.767],[34.199,7.63],[34.095,7.519],[33.894,7.479],[33.659,7.555],[33.414,7.709],[33.232,7.724],[33.208,7.749],[33.184,7.871],[33.108,8.001],[33.095,8.087],[32.805,8.296],[32.526,8.332],[32.105,9.02],[32.072,9.045],[30.229,9.52],[30.116,9.286],[30.0,9.383]],[[33.181,11.504],[33.166,11.562],[33.108,11.637],[33.081,11.792],[33.136,11.691],[33.083,11.846],[32.921,12.123],[32.833,12.35],[32.798,12.732],[32.805,12.825],[32.867,13.074],[32.913,13.164],[32.919,13.257],[32.904,13.351],[32.835,13.5],[30.0,13.5],[30.0,9.383],[30.116,9.286],[30.331,9.743],[30.354,9.873],[30.641,10.1],[30.731,10.194],[30.842,10.255],[30.915,10.269],[30.986,10.244],[31.079,10.244],[31.428,10.107],[31.518,10.132],[31.68,10.266],[31.715,10.316],[31.715,10.428],[31.744,10.5],[31.84,10.586],[31.954,10.608],[31.974,10.629],[31.962,10.705],[32.004,10.773],[32.136,10.874],[32.369,11.443],[32.435,11.547],[32.507,11.562],[32.637,11.45],[32.902,11.457],[33.181,11.504]]]};
const MAP = { x: 96, y: 72, w: 624, h: 918 };
const LAT_TOP = 37.55, LON_L = 7.75, MSC = 1.58, KX = 111.32 * Math.cos(35 * RAD) * MSC, KY = 110.57 * MSC;
const P = ([la, lo]) => [MAP.x + (lo - LON_L) * KX, MAP.y + (LAT_TOP - la) * KY];
// the two mountain ridges of central Tunisia, the Western and Eastern Dorsal, with gaps at the passes (from the Kasserine post)
const DORSAL_W = [[[34.95, 8.30], [35.07, 8.48], [35.20, 8.66]], [[35.29, 8.79], [35.38, 8.92], [35.44, 9.01]], [[35.51, 9.11], [35.70, 9.35], [35.92, 9.60], [36.15, 9.80], [36.35, 10.05]]];
const DORSAL_E = [[[34.35, 9.42], [34.56, 9.52], [34.75, 9.60], [34.90, 9.63]], [[35.02, 9.69], [35.24, 9.78], [35.45, 9.85], [35.90, 9.95]]];
const TELL = [[[36.95, 8.75], [36.95, 9.05], [37.05, 9.3]], [[36.55, 8.55], [36.6, 8.9], [36.7, 9.05]], [[36.15, 8.6], [36.25, 8.95], [36.3, 9.25]]];
const MATMATA = Array.from({ length: 9 }, (_, i) => [33.55 - i * 0.075, 10.08 + (i % 2) * 0.05]);
const CHOTT = [[33.98, 8.0], [34.05, 8.45], [34.0, 8.95], [33.98, 9.45], [34.06, 9.76], [34.0, 9.83], [33.84, 9.45], [33.62, 9.0], [33.52, 8.5], [33.68, 7.95]];
// The Mareth Line (as in tun-visit), from the sea near Zarat to the Matmata hills.
const MARETH_LINE = [[33.705, 10.39], [33.66, 10.33], [33.6178, 10.2861], [33.56, 10.22], [33.5, 10.16], [33.467, 10.133]];

// ---------- the ground the Axis held (schematic), as polygons of 13 front points (north to south) and 4 sea points ----------
const SEA_E = [[34.2, 10.6], [35.0, 12.2], [37.0, 11.9], [37.65, 10.4]];
const SEA_NE = [[36.1, 11.0], [36.9, 11.6], [37.5, 11.3], [37.65, 10.4]];
const fill = (p, n = 17) => Array.from({ length: n }, () => p);
const S = {
  none: fill([36.84, 10.22]),
  nov: [[37.3, 9.72], [37.15, 9.66], [37.02, 9.76], [36.93, 9.9], [36.86, 10.0], [36.76, 10.08], [36.68, 10.2], [36.7, 10.33], [36.82, 10.36], [36.95, 10.32], [37.05, 10.3], [37.15, 10.35], [37.25, 10.4], [37.45, 10.5], [37.6, 10.4], [37.65, 10.1], [37.55, 9.8]],
  djedeida: [[37.25, 9.5], [37.08, 9.52], [36.95, 9.65], [36.86, 9.85], [36.8, 9.97], [36.62, 10.12], [36.3, 10.38], [35.9, 10.5], [35.45, 10.7], [34.85, 10.62], [34.3, 10.0], [33.9, 9.98], [33.72, 10.42], ...SEA_E],
  dec: [[37.25, 9.3], [37.08, 9.42], [36.92, 9.55], [36.72, 9.72], [36.5, 9.9], [36.25, 10.1], [35.9, 10.25], [35.45, 10.4], [35.0, 10.35], [34.5, 10.15], [34.05, 9.95], [33.45, 10.12], [33.72, 10.42], ...SEA_E],
  winter: [[37.25, 9.25], [37.05, 9.4], [36.85, 9.6], [36.68, 9.72], [36.42, 9.75], [36.2, 9.9], [35.8, 9.75], [35.35, 9.8], [34.95, 9.72], [34.55, 9.62], [34.05, 9.75], [33.45, 10.12], [33.72, 10.42], ...SEA_E],
  eilbote: [[37.25, 9.25], [37.05, 9.4], [36.85, 9.6], [36.68, 9.72], [36.42, 9.75], [36.1, 9.6], [35.8, 9.55], [35.35, 9.8], [34.95, 9.72], [34.55, 9.62], [34.05, 9.75], [33.45, 10.12], [33.72, 10.42], ...SEA_E],
  sidi: [[37.25, 9.25], [37.05, 9.4], [36.85, 9.6], [36.68, 9.72], [36.42, 9.75], [36.2, 9.9], [35.8, 9.75], [35.45, 9.55], [35.25, 9.15], [34.95, 9.0], [34.4, 8.95], [33.45, 10.12], [33.72, 10.42], ...SEA_E],
  kass: [[37.25, 9.25], [37.05, 9.4], [36.85, 9.6], [36.68, 9.72], [36.42, 9.75], [36.2, 9.9], [35.8, 9.75], [35.45, 9.3], [35.38, 8.75], [35.2, 8.55], [34.85, 8.5], [33.45, 10.12], [33.72, 10.42], ...SEA_E],
  akarit: [[37.25, 9.25], [37.05, 9.4], [36.85, 9.6], [36.68, 9.72], [36.42, 9.75], [36.2, 9.9], [35.8, 9.75], [35.35, 9.8], [34.95, 9.72], [34.6, 9.65], [34.25, 9.6], [34.05, 9.95], [34.12, 10.12], [34.4, 10.7], [35.0, 12.2], [37.0, 11.9], [37.65, 10.4]],
  enfida: [[37.23, 9.25], [37.05, 9.42], [36.85, 9.6], [36.7, 9.72], [36.45, 9.78], [36.35, 9.95], [36.28, 10.1], [36.2, 10.25], [36.15, 10.35], [36.12, 10.42], [36.1, 10.48], [36.08, 10.55], [36.06, 10.62], ...SEA_NE],
  may1: [[37.22, 9.6], [37.05, 9.68], [36.88, 9.78], [36.74, 9.86], [36.52, 9.86], [36.38, 9.98], [36.28, 10.1], [36.2, 10.25], [36.15, 10.35], [36.12, 10.42], [36.1, 10.48], [36.08, 10.55], [36.06, 10.62], ...SEA_NE],
  may8: [[36.95, 10.62], [36.8, 10.45], [36.72, 10.36], [36.6, 10.25], [36.5, 10.12], [36.4, 10.06], [36.32, 10.05], [36.24, 10.15], [36.17, 10.28], [36.13, 10.38], [36.1, 10.48], [36.08, 10.55], [36.06, 10.62], [36.45, 11.1], [36.9, 11.5], [37.2, 11.25], [37.1, 10.8]],
  may11: [[36.44, 10.2], [36.4, 10.11], [36.33, 10.09], [36.25, 10.14], [36.18, 10.27], [36.14, 10.39], [36.16, 10.44], [36.19, 10.45], [36.26, 10.43], [36.32, 10.39], [36.38, 10.33], [36.42, 10.27], [36.44, 10.23], ...fill([36.44, 10.21], 4)],
  gone: fill([36.25, 10.3]),
};
for (const [n, p] of Object.entries(S)) if (p.length !== 17) throw new Error(`state ${n}: ${p.length} points`);
/** The morphs: [state, from (s), to (s)], in order. Before the first, nothing. */
const MORPHS = () => [
  ['nov', s('r5', 1.0), s('r6', 1.5)],
  ['djedeida', s('r9', 0.2), s('r9', 2.4)],
  ['dec', s('r11', 0.2), s('r11', 2.6)],
  ['winter', s('w1', 0.4), s('w1', 2.8)],
  ['eilbote', s('w2', 0.6), s('w2', 2.6)],
  ['winter', s('w3', 0.0), s('w3', 1.4)],
  ['sidi', s('k2', 1.0), e('k2', 0)],
  ['kass', s('k5', 0.4), e('k5', 0)],
  ['winter', s('k7', 0.0), s('k7', 2.0)],
  ['akarit', s('m7', 0.4), s('m7', 3.0)],
  ['enfida', s('a3', 1.0), e('a4', 0)],
  ['may1', s('a6', 0.4), e('a6', 0)],
  ['may8', s('e2', 0.4), e('e2', 0.4)],
  ['may11', s('e4', 0.2), e('e4', 0)],
  ['gone', s('e5', 0.6), s('e5', 3.0)],
];
let MORPH = null;
function axisPoly(t) {
  MORPH ??= MORPHS();
  let cur = S.none, alpha = 0;
  for (let i = 0; i < MORPH.length; i++) {
    const [name, a, b] = MORPH[i];
    if (t < a) break;
    const u = eio(seg(t, a, b)), next = S[name];
    cur = cur.map((p, j) => [lerp(p[0], next[j][0], u), lerp(p[1], next[j][1], u)]);
    alpha = i === 0 ? u : 1;
  }
  // fades out once gone
  const end = MORPH.at(-1);
  alpha *= 1 - seg(t, end[2] - 0.4, end[2]);
  return { poly: cur, alpha };
}
let HATCH = null;
function hatchPattern() {
  const c = document.createElement('canvas'); c.width = 22; c.height = 22;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(222,122,92,0.30)'; g.fillRect(0, 0, 22, 22);
  g.strokeStyle = 'rgba(156,65,40,0.85)'; g.lineWidth = 3;
  for (const o of [-22, 0, 22]) { g.beginPath(); g.moveTo(o, 22); g.lineTo(o + 22, 0); g.stroke(); }
  return ctx.createPattern(c, 'repeat');
}
const ringPath = (proj, ring) => { ctx.beginPath(); ring.forEach((p, i) => (i ? ctx.lineTo(...proj(p)) : ctx.moveTo(...proj(p)))); ctx.closePath(); };
/** The Axis-held ground in projection proj, clipped to Tunisia's mainland, with its front edge. */
function drawHeld(t, proj, { lw = 4 } = {}) {
  const { poly, alpha } = axisPoly(t);
  if (alpha <= 0) return;
  HATCH ??= hatchPattern();
  A(alpha, () => {
    ctx.save(); ringPath(proj, MAPDATA.TUN[0]); ctx.clip();
    ringPath(proj, poly); ctx.fillStyle = HATCH; ctx.fill();
    ctx.strokeStyle = C.axisDk; ctx.lineWidth = lw; ctx.lineJoin = 'round';
    ctx.beginPath(); poly.slice(0, 13).forEach((p, i) => (i ? ctx.lineTo(...proj(p)) : ctx.moveTo(...proj(p)))); ctx.stroke();
    ctx.restore();
  });
}

// ---------- the background, painted once ----------
let BG = null;
function hachures(g, proj, line, { len = 9, step = 0.05, col = C.hill, w = 3 } = {}) {
  g.strokeStyle = col; g.lineWidth = w;
  const pts = smooth(line.map((p) => proj(p)), 10);
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], d = Math.hypot(x1 - x0, y1 - y0);
    acc += d;
    if (acc < 14) continue;
    acc = 0;
    const nx = -(y1 - y0) / d, ny = (x1 - x0) / d;
    g.beginPath(); g.moveTo(x1 - nx * len, y1 - ny * len); g.lineTo(x1 + nx * len, y1 + ny * len); g.stroke();
  }
  g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.stroke();
  void step;
}
function paintLand(g, proj, { erg = true, scale = 1 } = {}) {
  g.fillStyle = C.neigh; g.strokeStyle = C.neigh; g.lineWidth = 8; g.lineJoin = 'round';
  for (const r of MAPDATA.NEIGH) { g.beginPath(); r.forEach((p, i) => (i ? g.lineTo(...proj(p)) : g.moveTo(...proj(p)))); g.closePath(); g.fill(); g.stroke(); }
  const top = proj([37.6, 9])[1], bot = proj([32.2, 9])[1];
  const lg = g.createLinearGradient(0, top, 0, bot); lg.addColorStop(0, '#e9dbb6'); lg.addColorStop(1, '#e2c894');
  g.fillStyle = lg;
  for (const r of MAPDATA.TUN) { g.beginPath(); r.forEach((p, i) => (i ? g.lineTo(...proj(p)) : g.moveTo(...proj(p)))); g.closePath(); g.fill(); }
  g.save(); g.beginPath(); MAPDATA.TUN[0].forEach((p, i) => (i ? g.lineTo(...proj(p)) : g.moveTo(...proj(p)))); g.closePath(); g.clip();
  if (erg) {
    g.fillStyle = 'rgba(201,143,82,0.55)';
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 1500; i++) {
      const la = 30.4 + rnd() * 3.0, lo = 7.6 + rnd() * 2.3;
      if (la > 33.35 - (lo - 7.6) * 0.18) continue;
      const [x, y] = proj([la, lo]); g.beginPath(); g.arc(x, y, (1.6 + rnd() * 1.6) * scale, 0, TAU); g.fill();
    }
  }
  // the salt flats (Chott el Djerid and its eastern arm), schematic
  g.fillStyle = C.chott; g.beginPath(); smooth(CHOTT.concat([CHOTT[0]]).map((p) => proj(p)), 6).forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(120,130,120,0.5)'; g.lineWidth = 2; g.stroke();
  // ridges
  const hw = 3 * Math.min(scale, 1.6), hl = 9 * Math.min(scale, 1.6);
  for (const r of [...DORSAL_W, ...DORSAL_E, ...TELL]) hachures(g, proj, r, { len: hl, w: hw });
  g.strokeStyle = C.hill; g.lineWidth = hw;
  for (const [la, lo] of MATMATA) { const [x, y] = proj([la, lo]); const z = 11 * Math.min(scale, 1.3); g.beginPath(); g.moveTo(x - z, y + z * 0.45); g.lineTo(x, y - z * 0.55); g.lineTo(x + z, y + z * 0.45); g.stroke(); }
  g.restore();
  g.strokeStyle = 'rgba(42,38,32,0.45)'; g.lineWidth = 2;
  for (const r of MAPDATA.TUN) { g.beginPath(); r.forEach((p, i) => (i ? g.lineTo(...proj(p)) : g.moveTo(...proj(p)))); g.closePath(); g.stroke(); }
}
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const g = BG.getContext('2d');
  const gr = g.createRadialGradient(W * 0.62, H * 0.45, 100, W * 0.55, H * 0.5, 1300);
  gr.addColorStop(0, C.bg1); gr.addColorStop(1, C.bg0);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // a faint staff-map grid and contour lines
  g.strokeStyle = 'rgba(214,222,170,0.035)'; g.lineWidth = 2;
  for (let x = 760; x < W; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 40; y < H; y += 80) { g.beginPath(); g.moveTo(760, y); g.lineTo(W, y); g.stroke(); }
  g.strokeStyle = C.contour; g.lineWidth = 2;
  for (const [cx, cy, ph] of [[1450, 620, 0.6], [1750, 160, 2.1]]) {
    for (let r = 60; r < 760; r += 42) {
      g.beginPath();
      for (let i = 0; i <= 180; i++) {
        const a = (i / 180) * TAU, wob = 1 + 0.09 * Math.sin(3 * a + ph + r * 0.013) + 0.05 * Math.sin(7 * a - ph * 2 + r * 0.02);
        const x = cx + Math.cos(a) * r * wob * 1.25, y = cy + Math.sin(a) * r * wob * 0.8;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
  }
  // the map panel
  g.save(); g.beginPath(); g.roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 22); g.clip();
  const sg = g.createLinearGradient(0, MAP.y, 0, MAP.y + MAP.h); sg.addColorStop(0, C.sea2); sg.addColorStop(1, C.sea);
  g.fillStyle = sg; g.fillRect(MAP.x, MAP.y, MAP.w, MAP.h);
  paintLand(g, P);
  g.restore();
  g.strokeStyle = 'rgba(201,211,106,0.55)'; g.lineWidth = 3; g.beginPath(); g.roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 22); g.stroke();
}

// ---------- map labels ----------
function townDot(ll, name, a, { dx = 14, dy = 0, align = 'left', color = C.dark, size = 32, proj = P, r = 6 } = {}) {
  if (a <= 0) return;
  const [x, y] = proj(ll);
  A(a, () => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (name) {
      k.font(600, size, TEXT); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(233,219,182,0.88)'; ctx.lineJoin = 'round';
      ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.strokeText(name, x + dx, y + dy);
      txt(name, x + dx, y + dy, { size, weight: 600, color, align });
    }
  });
}
function mapLabel(str, ll, a, { size = 32, color = C.soft, spacing = '4px', weight = 600, align = 'center', rot = 0, proj = P, halo = null } = {}) {
  if (a <= 0) return;
  const [x, y] = proj(ll);
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    if (halo) { k.font(weight, size, TEXT); ctx.letterSpacing = spacing; ctx.lineWidth = 7; ctx.strokeStyle = halo; ctx.lineJoin = 'round'; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.strokeText(str, 0, 0); ctx.letterSpacing = '0px'; }
    txt(str, 0, 0, { size, weight, color, align, spacing }); ctx.restore();
  });
}
const SAND = 'rgba(233,219,182,0.9)';
/** A chip placed at a map point. */
const mapChip = (str, ll, o = {}, proj = P) => chip(str, ...proj(ll), { size: 32, ...o });
/** A schematic arrow along map points. */
const mapArrow = (pts, u, col, o = {}, proj = P) => trace(smooth(pts.map((p) => proj(p)), 10), u, col, { w: 8, headSize: 18, ...o });

// ---------- zoomed maps in the right-hand window ----------
const WIN = { x: 800, y: 250, w: 1000, h: 700 };
const RX = 800, RW = 1000, RCX = RX + RW / 2;
function makeZoom(lat0, lat1, lon0, lon1) {
  const mid = ((lat0 + lat1) / 2) * RAD, kx = 111.32 * Math.cos(mid), ky = 110.57;
  const sc = Math.min(WIN.w / ((lon1 - lon0) * kx), WIN.h / ((lat1 - lat0) * ky));
  const ox = WIN.x + (WIN.w - (lon1 - lon0) * kx * sc) / 2, oy = WIN.y + (WIN.h - (lat1 - lat0) * ky * sc) / 2;
  const Z = ([la, lo]) => [ox + (lo - lon0) * kx * sc, oy + (lat1 - la) * ky * sc];
  return { Z, sc, box: [lat0, lat1, lon0, lon1] };
}
const ZK = makeZoom(34.2, 35.85, 7.7, 10.4);   // central Tunisia: Kasserine
const ZM = makeZoom(32.85, 34.3, 8.9, 11.1);   // the south: Mareth and the Wadi Akarit
const ZN = makeZoom(35.95, 37.4, 9.0, 11.3);   // the north-east: May 1943
const ZBG = new Map();
function zoomBase(z) {
  if (!ZBG.has(z)) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.save(); g.beginPath(); g.roundRect(WIN.x, WIN.y, WIN.w, WIN.h, 22); g.clip();
    const sg = g.createLinearGradient(0, WIN.y, 0, WIN.y + WIN.h); sg.addColorStop(0, C.sea2); sg.addColorStop(1, C.sea);
    g.fillStyle = sg; g.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
    paintLand(g, z.Z, { erg: false, scale: z.sc / 1.3 });
    g.restore();
    ZBG.set(z, c);
  }
  return ZBG.get(z);
}
function windowFrame(fn, { line = 'rgba(201,211,106,0.5)' } = {}) {
  ctx.save(); k.rrect(WIN.x, WIN.y, WIN.w, WIN.h, 22); ctx.clip(); fn(); ctx.restore();
  ctx.strokeStyle = line; ctx.lineWidth = 3; k.rrect(WIN.x, WIN.y, WIN.w, WIN.h, 22); ctx.stroke();
}
function zoomWindow(t, z, fn) {
  windowFrame(() => {
    ctx.drawImage(zoomBase(z), 0, 0);
    drawHeld(t, z.Z, { lw: 6 });
    fn(z.Z);
    txt('schematic map', WIN.x + 26, WIN.y + 34, { size: 32, weight: 500, color: C.dark2 });
  });
}
/** The zoom's area outlined on the left map. */
function zoomBox(z, a) {
  if (a <= 0) return;
  const [la0, la1, lo0, lo1] = z.box, [x0, y0] = P([la1, lo0]), [x1, y1] = P([la0, lo1]);
  A(a, () => { ctx.strokeStyle = C.acc; ctx.lineWidth = 4; ctx.setLineDash([12, 8]); ctx.strokeRect(x0, y0, x1 - x0, y1 - y0); ctx.setLineDash([]); });
}

// ---------- the Mediterranean insets (rough coastlines from the post history-race-for-tunis-1942, [lon, lat]) ----------
const AFRICA = [[-10.5, 29.5], [-9.7, 30.5], [-9.3, 32.5], [-7.6, 33.6], [-6.8, 34.0], [-6.6, 34.3], [-6.15, 35.2], [-5.8, 35.8], [-5.3, 35.9],
  [-4.4, 35.2], [-2.9, 35.3], [-1.9, 35.1], [-0.63, 35.72], [0.1, 35.93], [1.3, 36.5], [3.05, 36.77], [3.9, 36.92], [5.08, 36.76], [5.77, 36.82],
  [6.9, 36.89], [7.76, 36.9], [8.44, 36.9], [8.76, 36.96], [9.2, 37.23], [9.85, 37.34], [9.87, 37.27], [10.19, 37.17], [10.28, 37.18],
  [10.29, 36.92], [10.3, 36.82], [10.34, 36.73], [10.49, 36.7], [10.9, 37.0], [11.04, 37.08], [11.1, 36.85], [10.73, 36.45], [10.6, 36.4],
  [10.64, 35.83], [10.83, 35.77], [11.06, 35.5], [10.76, 34.74], [10.1, 33.88], [10.9, 33.8], [11.1, 33.5], [11.56, 33.17], [13.18, 32.9],
  [15.1, 32.37], [16.6, 31.2], [18.4, 30.4], [19.9, 30.9], [20.1, 32.1], [21.6, 32.9], [23.0, 32.6], [24.0, 32.05], [25.15, 31.56], [27.24, 31.35],
  [28.95, 30.83], [29.92, 31.2], [31.0, 31.5], [32.3, 31.3], [33, 26], [-12, 26]];
const IBERIA = [[-9.0, 37.0], [-7.9, 37.0], [-6.3, 36.53], [-5.6, 36.0], [-5.35, 36.14], [-4.42, 36.72], [-2.46, 36.84], [-2.19, 36.72],
  [-0.98, 37.6], [-0.48, 38.35], [-0.37, 39.47], [0.2, 40.2], [0.9, 41.0], [2.2, 41.4], [3.2, 41.9], [3.2, 46], [-9.5, 46], [-8.9, 41.0], [-9.4, 39.0]];
const SARDINIA = [[9.2, 41.25], [9.7, 40.9], [9.75, 40.0], [9.55, 39.1], [8.85, 38.87], [8.4, 39.1], [8.4, 39.9], [8.15, 40.6], [8.5, 40.95]];
const CORSICA = [[9.4, 43.0], [9.55, 42.1], [9.2, 41.4], [8.7, 41.7], [8.6, 42.4], [9.3, 43.0]];
const SICILY = [[12.5, 38.02], [13.36, 38.12], [14.02, 38.04], [15.55, 38.19], [15.09, 37.5], [15.29, 37.07], [15.13, 36.69], [14.25, 37.06],
  [13.58, 37.3], [12.43, 37.8]];
const ITALY = [[15.65, 38.2], [16.2, 38.9], [15.9, 39.6], [15.7, 40.1], [14.9, 40.6], [14.2, 40.8], [13.0, 41.25], [12.0, 41.9], [10.5, 43.0],
  [10.5, 46], [18, 46], [18, 40.4], [16.6, 40.0], [17.1, 39.4], [16.5, 38.7], [16.1, 38.0]];
const GREECE = [[19.4, 41.9], [20.0, 39.6], [21.1, 38.3], [21.7, 36.8], [22.5, 36.4], [23.2, 36.4], [23.0, 38.0], [24.0, 38.2], [23.0, 39.5], [24.0, 40.7], [26.0, 40.8], [26, 46], [19.4, 46]];
const CRETE = [[23.5, 35.3], [26.3, 35.2], [26.2, 35.0], [24.7, 34.9], [23.5, 35.2]];
/** A plate carrée projection of [lon, lat] into a rectangle. */
function medProj(lon0, lon1, lat0, lat1, x0, y0, w) {
  const c = Math.cos(((lat0 + lat1) / 2) * RAD), sc = w / ((lon1 - lon0) * c);
  return { M: ([lo, la]) => [x0 + (lo - lon0) * c * sc, y0 + (lat1 - la) * sc], h: (lat1 - lat0) * sc };
}
const MED = medProj(-11, 17, 29.6, 42.6, WIN.x, WIN.y, WIN.w);         // Torch (8 November)
const LIB = medProj(7, 33, 28.6, 38.4, WIN.x, WIN.y + 60, WIN.w);       // from Egypt to Tunisia
const SIC = medProj(7.6, 16.4, 33.4, 39.2, WIN.x, WIN.y, WIN.w);        // to Sicily
function medBase(M, { tunisia = 1 } = {}) {
  ctx.fillStyle = C.sea2; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  const poly = (pts, col) => { ctx.fillStyle = col; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...M(p)) : ctx.moveTo(...M(p)))); ctx.closePath(); ctx.fill(); };
  for (const p of [AFRICA, IBERIA, SARDINIA, CORSICA, SICILY, ITALY, GREECE, CRETE]) poly(p, C.neigh);
  // Tunisia itself, in the map's sand colour, from the Natural Earth outline
  A(tunisia, () => { ctx.fillStyle = C.land; ctx.beginPath(); MAPDATA.TUN[0].forEach(([la, lo], i) => (i ? ctx.lineTo(...M([lo, la])) : ctx.moveTo(...M([lo, la])))); ctx.closePath(); ctx.fill(); });
}
const ML = (M, lonlat) => M(lonlat); // readability: insets take [lon, lat]

// ---------- the month ribbon (the film's motif) ----------
const DAY = 86400000, D0 = Date.UTC(1942, 10, 1), D1 = Date.UTC(1943, 5, 1);
const RB = { x0: 830, x1: 1610, y: 136 };
const rx = (ms) => lerp(RB.x0, RB.x1, (ms - D0) / (D1 - D0));
const MONTHS = ['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'];
const d = (y, m, dd) => Date.UTC(y, m - 1, dd);
const CAMPAIGN = [d(1942, 11, 8), d(1943, 5, 13)];
/** The date marker's stops: [time, date, label]. */
const STOPS = () => [
  [s('r1', 0), d(1942, 11, 1), '1942'],
  [s('r3', 0.3), d(1942, 11, 8), '8 NOVEMBER 1942'],
  [s('r5', 0.6), d(1942, 11, 9), '9 NOVEMBER'],
  [s('r6', 0.4), d(1942, 11, 15), 'MID-NOVEMBER'],
  [s('r7', 0.6), d(1942, 11, 19), '19 NOVEMBER'],
  [s('r9', 0.3), d(1942, 11, 28), '28 NOVEMBER'],
  [s('r11', 0.2), d(1942, 12, 10), '10 DECEMBER'],
  [at('r11', 0.6), d(1942, 12, 24), '24 DECEMBER 1942'],
  [s('w1', 0.2), d(1943, 1, 1), 'JANUARY 1943'],
  [s('w2', 0.4), d(1943, 1, 18), '18 JANUARY'],
  [s('w5', 0.2), d(1943, 1, 23), '23 JANUARY · TRIPOLI'],
  [s('k1', 0.2), d(1943, 2, 1), 'FEBRUARY 1943'],
  [s('k2', 0.3), d(1943, 2, 14), '14 FEBRUARY'],
  [s('k5', 0.3), d(1943, 2, 19), '19–20 FEBRUARY'],
  [s('k6', 1.0), d(1943, 2, 22), '22 FEBRUARY'],
  [at('k8', 0.75), d(1943, 3, 6), '6 MARCH'],
  [s('k9', 0.3), d(1943, 3, 23), '23 MARCH'],
  [s('m1', 0.2), d(1943, 3, 1), 'MARCH 1943'],
  [s('m3', 0.3), d(1943, 3, 6), '6 MARCH'],
  [at('m3', 0.7), d(1943, 3, 9), '9 MARCH'],
  [s('m4', 0.3), d(1943, 3, 20), '20 MARCH'],
  [at('m6', 0.45), d(1943, 3, 26), '26 MARCH'],
  [s('m7', 0.4), d(1943, 3, 28), '28 MARCH'],
  [s('a2', 0.3), d(1943, 4, 5), '5–6 APRIL'],
  [at('a3', 0.6), d(1943, 4, 7), '7 APRIL'],
  [s('a5', 0.3), d(1943, 4, 19), '19–20 APRIL'],
  [at('a6', 0.25), d(1943, 4, 26), '26 APRIL'],
  [at('a6', 0.5), d(1943, 5, 1), '1 MAY'],
  [s('e1', 0.3), d(1943, 5, 6), '6 MAY'],
  [s('e2', 0.3), d(1943, 5, 7), '7 MAY'],
  [s('e5', 0.3), d(1943, 5, 13), '13 MAY 1943'],
  [at('p4', 0.4), d(1943, 5, 14), '14 MAY'],
  [at('p5', 0.25), d(1943, 7, 10), '10 JULY 1943'],
];
let STOP = null;
function ribbonState(t) {
  STOP ??= STOPS();
  let i = 0; while (i + 1 < STOP.length && t >= STOP[i + 1][0]) i++;
  const [t0, d0, l0] = STOP[i], prev = STOP[Math.max(0, i - 1)];
  const u = eio(seg(t, t0, t0 + 1.2));
  const date = lerp(prev[1], d0, i === 0 ? 1 : u);
  return { date, label: l0, prevLabel: prev[2], u: i === 0 ? 1 : u };
}
function ribbon(t, a, { marker = 1, fillTo = null, lit = null } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const { date, label, prevLabel, u } = ribbonState(t);
    // month cells
    MONTHS.forEach((mo, j) => {
      const xm = (rx(Date.UTC(1942, 10 + j, 1)) + rx(Date.UTC(1942, 11 + j, 1))) / 2;
      const on = lit ? lit(j) : date >= Date.UTC(1942, 10 + j, 1);
      txt(mo, xm, 96, { size: 32, weight: 700, color: on ? C.ink : C.soft, align: 'center', spacing: '1px' });
    });
    ctx.fillStyle = C.faint; ctx.fillRect(RB.x0, RB.y - 4, RB.x1 - RB.x0, 8);
    for (let m = 0; m <= 7; m++) { const x = rx(Date.UTC(1942, 10 + m, 1)); ctx.fillStyle = C.soft; ctx.fillRect(x - 1.5, RB.y - 14, 3, 28); }
    // the campaign so far, in the accent colour
    const to = fillTo ?? Math.min(date, D1);
    if (to > CAMPAIGN[0]) { ctx.fillStyle = C.acc; ctx.fillRect(rx(CAMPAIGN[0]), RB.y - 5, Math.min(rx(to), RB.x1) - rx(CAMPAIGN[0]), 10); }
    // beyond May: a dashed extension to the date (Sicily)
    if (date > D1) {
      ctx.strokeStyle = C.acc; ctx.lineWidth = 6; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(RB.x1, RB.y); ctx.lineTo(rx(date), RB.y); ctx.stroke(); ctx.setLineDash([]);
    }
    if (marker > 0) A(marker, () => {
      const x = rx(date);
      ctx.fillStyle = C.acc; ctx.beginPath(); ctx.moveTo(x, RB.y + 10); ctx.lineTo(x - 12, RB.y + 28); ctx.lineTo(x + 12, RB.y + 28); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.ink; ctx.fillRect(x - 2, RB.y - 18, 4, 36);
      const show = (str, a2) => {
        if (a2 <= 0) return;
        const w = textW(str, { size: 32, weight: 800 }) + 40, cx = Math.max(RX + w / 2, Math.min(RX + RW - w / 2, x));
        chip(str, cx, RB.y + 58, { color: C.acc, size: 32, weight: 800, a: a2 });
      };
      show(prevLabel, 1 - seg(u, 0, 0.4));
      show(label, seg(u, 0.35, 1));
    });
  });
}

// ---------- the left map: moving parts ----------
const TOWNS_ALL = ['tunis', 'bizerte', 'sousse', 'sfax', 'gabes', 'kairouan', 'beja', 'mateur', 'medjez', 'nabeul', 'monastir', 'mahdia', 'kef',
  'siliana', 'gafsa', 'kasserine', 'tozeur', 'medenine', 'djerba', 'zaghouan', 'enfidaville', 'hammamet', 'tataouine', 'sbeitla', 'kelibia'];
function drawMap(t) {
  ctx.save(); k.rrect(MAP.x, MAP.y, MAP.w, MAP.h, 22); ctx.clip();
  mapLabel('ALGERIA', [35.4, 7.93], 1, { color: 'rgba(244,239,220,0.6)', size: 32, rot: -Math.PI / 2 });
  mapLabel('LIBYA', [32.72, 11.86], 1, { color: 'rgba(244,239,220,0.6)', size: 32, rot: -Math.PI / 2 });
  const big = Math.max(span(t, s('o2', 0), CH[0].at + 0.6, 0.6, 0.8), span(t, s('p8', 0.4), DURATION + 1, 0.8, 0.1));
  mapLabel('TUNISIA', [33.2, 9.1], Math.max(big, span(t, s('r1', 0.2), s('r3', 0), 0.6, 0.8)), { color: 'rgba(42,38,32,0.6)', size: 36, spacing: '6px', weight: 700 });

  // the ground the Axis held
  drawHeld(t, P);
  // its legend, once
  A(span(t, s('r6', 1.6), s('w1', 4.0), 0.6, 0.6), () => {
    const x = MAP.x + 24, y = MAP.y + MAP.h - 50;
    card(x - 12, y - 32, textW('held by the Axis', { size: 32, weight: 600 }) + 96, 64, { bg: 'rgba(13,16,9,0.88)', r: 14 });
    ctx.fillStyle = HATCH ?? 'rgba(222,122,92,0.4)'; ctx.fillRect(x, y - 18, 44, 36); ctx.strokeStyle = C.axisDk; ctx.lineWidth = 3; ctx.strokeRect(x, y - 18, 44, 36);
    txt('held by the Axis', x + 60, y, { size: 32, weight: 600, color: C.ink });
  });

  // cold open: the towns where Tunisians lived (o3), the desert and the hills (o2)
  const townsA = Math.max(span(t, s('o3', 0.6), s('o4', 1.4), 0.6, 0.8), span(t, s('p1', 0.4), s('p5', 0.2), 0.6, 0.8));
  TOWNS_ALL.forEach((key, i) => {
    const a = townsA * seg(t, (t < s('p1') ? s('o3', 0.6) : s('p1', 0.4)) + i * 0.08, (t < s('p1') ? s('o3', 1.0) : s('p1', 0.8)) + i * 0.08);
    if (a <= 0) return;
    const broken = seg(t, s('p2', 0.4 + i * 0.06), s('p2', 0.8 + i * 0.06));
    A(a, () => {
      const [x, y] = P(PL[key]);
      ctx.fillStyle = C.dark; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
      ctx.strokeStyle = broken > 0.5 ? C.axisDk : C.accDk; ctx.lineWidth = 3;
      if (broken > 0) ctx.setLineDash([5, 6]);
      ctx.beginPath(); ctx.arc(x, y, 12 + broken * 3, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    });
  });
  A(span(t, s('o2', 1.0), s('o3', 0.4), 0.6, 0.6), () => {
    mapChip('desert', [32.75, 9.0], { color: C.acc });
    mapChip('hills', [36.55, 8.95], { color: C.acc });
  });

  // ---- chapter 1: the race
  const c1 = span(t, s('r3'), CH[1].at + 1.0, 0.5, 0.8);
  if (c1 > 0) A(c1, () => {
    // r5: Axis troops flown and shipped in from Sicily
    A(span(t, s('r5', 0.6), s('r8', 0), 0.6, 0.8), () => {
      mapArrow([[37.75, 10.9], [37.3, 10.5], [36.88, 10.24]], eout(seg(t, s('r5', 0.8), s('r5', 2.6))), C.axis);
      mapArrow([[37.75, 10.2], [37.36, 9.95]], eout(seg(t, s('r5', 1.2), s('r5', 2.8))), C.axis);
      townDot(PL.tunis, 'Tunis', 1, { dx: -14, dy: 28, align: 'right' });
      townDot(PL.bizerte, 'Bizerte', seg(t, s('r5', 1.6), s('r5', 2.2)), { dx: 16, dy: -16 });
    });
    // r7: the French at Medjez el Bab
    A(span(t, s('r7', 0.2), s('r8', 1.0), 0.6, 0.8), () => {
      townDot(PL.medjez, 'Medjez el Bab', 1, { dx: -14, dy: 30, align: 'right' });
      heldBar(...P([36.66, 9.68]), -0.3, seg(t, s('r7', 1.2), s('r7', 1.8)));
    });
    // r8–r9: the dash from Algeria to Djedeida, along two roads
    const dash = eio(seg(t, s('r8', 0.6), e('r9', -0.6)));
    const back = eio(seg(t, s('r11', 0.2), s('r11', 2.6)));
    A(span(t, s('r8', 0.2), s('w1', 0), 0.6, 0.6), () => {
      const south = [[36.45, 7.8], [36.5, 8.78], [36.73, 9.18], [36.65, 9.61], [36.83, 9.84], [36.85, 9.93]];
      const north = [[36.9, 7.8], [36.95, 8.76], [37.0, 9.1], [37.04, 9.45]];
      mapArrow(south, Math.min(dash, 1 - back * 0.35), C.allied, { w: 10 });
      mapArrow(north, Math.min(dash * 1.1, 1), C.allied, { w: 8 });
      chip('First Army', ...P([36.2, 8.55]), { color: C.allied, size: 32, a: seg(t, s('r8', 1.2), s('r8', 1.8)) * (1 - span(t, s('r10', 0), s('r11', 0.6), 0.5, 0.5)) });
      townDot(PL.djedeida, 'Djedeida', span(t, s('r9', 0.6), s('r11', 0.8), 0.5, 0.6), { dx: 16, dy: 24 });
    });
    // r10: airfields, near and far
    A(span(t, s('r10', 0.2), s('r11', 0.4), 0.5, 0.5), () => {
      const plane = (ll, col) => { const [x, y] = P(ll); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 16, 0, TAU); ctx.fill(); ctx.strokeStyle = C.bg0; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y); ctx.moveTo(x, y - 9); ctx.lineTo(x, y + 9); ctx.stroke(); };
      plane(PL.aouina, C.axis); plane(PL.souk, C.allied);
      mapChip('El Aouina', [37.0, 10.55], { color: C.axis, a: seg(t, s('r10', 0.6), s('r10', 1.2)) });
      mapChip('Souk el Arba', [36.33, 8.85], { color: C.allied, a: seg(t, s('r10', 2.2), s('r10', 2.8)) });
    });
  });

  // ---- chapter 2: the winter front and its sectors; the Eighth Army arrives
  const c2 = span(t, s('w1'), CH[2].at + 1.0, 0.5, 0.8);
  if (c2 > 0) A(c2, () => {
    A(span(t, s('w1', 2.0), s('w5', 0), 0.6, 0.6), () => {
      chip('British', ...P([36.82, 9.05]), { color: C.allied, size: 32, a: seg(t, s('w1', 3.0), s('w1', 3.6)) });
      chip('French', ...P([35.95, 9.05]), { color: C.allied, size: 32, a: seg(t, s('w1', 4.0), s('w1', 4.6)) });
      chip('Americans', ...P([35.0, 8.95]), { color: C.allied, size: 32, a: seg(t, s('w1', 5.0), s('w1', 5.6)) });
    });
    // w2: the January attacks on the French centre
    A(span(t, s('w2', 0.4), s('w3', 1.0), 0.5, 0.6), () => {
      mapArrow([[36.4, 9.95], [36.15, 9.75], [35.88, 9.6]], eout(seg(t, s('w2', 0.6), s('w2', 2.6))), C.axis);
      mapArrow([[36.38, 9.9], [36.12, 9.55]], eout(seg(t, s('w2', 1.0), s('w2', 2.8))), C.axis);
    });
    // w5: the Eighth Army from Libya
    A(span(t, s('w5', 0.2), CH[2].at + 1, 0.5, 0.6), () => {
      mapArrow([[32.3, 11.62], [32.8, 11.3], [33.15, 10.9], [33.35, 10.6]], eout(seg(t, s('w5', 0.4), s('w5', 2.8))), C.allied, { w: 10 });
      chip('Eighth Army', ...P([32.62, 10.62]), { color: C.allied, size: 32, a: seg(t, s('w5', 1.4), s('w5', 2.0)) });
    });
    A(span(t, s('w7', 0.2), CH[2].at + 1, 0.5, 0.6), () => {
      chip('Fifth Panzer Army', ...P([36.5, 10.6]), { color: C.axis, size: 32, a: seg(t, s('w7', 1.4), s('w7', 2.0)) });
      chip('Italian First Army', ...P([34.2, 10.95]), { color: C.axis, size: 32, a: seg(t, s('w7', 2.6), s('w7', 3.2)) });
    });
  });

  // ---- chapters 3, 4 and 6: the zoomed areas outlined
  zoomBox(ZK, span(t, s('k1', 0.4), CH[3].at + 1.0, 0.6, 0.8));
  zoomBox(ZM, span(t, s('m1', 0.4), s('a4', 0.4), 0.6, 0.8));
  zoomBox(ZN, span(t, s('e1', 0.4), s('e6', 0.6), 0.6, 0.8));

  // ---- chapter 5: the two fronts meet; north to Enfidaville; the last hills
  const c5 = span(t, s('a3'), CH[5].at + 1.0, 0.5, 0.8);
  if (c5 > 0) A(c5, () => {
    const meet = [33.98, 9.6];
    A(span(t, s('a3', 0.4), s('a5', 0.3), 0.5, 0.6), () => {
      mapArrow([[34.34, 8.95], [34.2, 9.25], meet], eout(seg(t, at('a3', 0.45), at('a3', 0.85))), C.allied, { w: 9 });
      mapArrow([[33.55, 10.2], [33.8, 9.85], meet], eout(seg(t, at('a3', 0.45), at('a3', 0.85))), C.allied, { w: 9 });
      ring(...P(meet), seg(t, at('a3', 0.85), e('a3', 0)), t, C.acc);
    });
    A(span(t, s('a4', 0.0), s('a6', 0.3), 0.5, 0.6), () => {
      mapArrow([[34.15, 10.05], [34.74, 10.6], [35.3, 10.85], [35.83, 10.55], [36.05, 10.42]], eio(seg(t, s('a4', 0.3), e('a4', -0.3))), C.allied, { w: 10 });
      townDot(PL.sfax, 'Sfax', seg(t, s('a4', 1.4), s('a4', 2.0)), { dx: -14, dy: 0, align: 'right' });
      townDot(PL.sousse, 'Sousse', seg(t, s('a4', 2.0), s('a4', 2.6)), { dx: -14, dy: 0, align: 'right' });
    });
    A(span(t, s('a5', 0.2), CH[5].at + 1, 0.5, 0.6), () => {
      townDot(PL.enfidaville, 'Enfidaville', 1, { dx: 16, dy: 26 });
      ring(...P(PL.takrouna), seg(t, s('a5', 2.4), s('a5', 3.0)) * (1 - seg(t, s('a6', 0), s('a6', 0.6))), t, C.acc, 16);
    });
    A(span(t, s('a6', 0.2), CH[5].at + 1, 0.5, 0.6), () => {
      townDot(PL.longstop, 'Longstop Hill', seg(t, s('a6', 0.6), s('a6', 1.2)), { dx: -14, dy: 28, align: 'right' });
      townDot(PL.hill609, 'Hill 609', seg(t, at('a6', 0.4), at('a6', 0.5)), { dx: -14, dy: -24, align: 'right' });
    });
  });

  // ---- chapter 7: to Sicily
  A(span(t, s('p5', 0.6), s('p6', 0.4), 0.6, 0.6), () => {
    mapArrow([[37.2, 10.0], [37.45, 10.9], [37.7, 11.9]], eout(seg(t, s('p5', 1.6), s('p5', 3.4))), C.allied, { w: 10 });
    mapArrow([[35.9, 10.7], [36.8, 11.5], [37.4, 12.2]], eout(seg(t, s('p5', 2.0), s('p5', 3.8))), C.allied, { w: 8 });
    chip('Sicily', MAP.x + MAP.w - 30, MAP.y + 50, { color: C.allied, size: 32, align: 'right', a: seg(t, s('p5', 2.6), s('p5', 3.2)) });
  });

  ctx.restore();
  A(1, () => {
    k.font(500, 32, TEXT); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(27,58,64,0.85)'; ctx.lineJoin = 'round'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.strokeText('schematic map', MAP.x + 20, MAP.y + 32);
    txt('schematic map', MAP.x + 20, MAP.y + 32, { size: 32, weight: 500, color: 'rgba(244,239,220,0.7)' });
  });
}

// ---------- right-hand panel helpers ----------
/** A heading in the accent colour with spaced capitals. */
const kicker = (str, x, y, { color = C.acc, align = 'left', size = 32 } = {}) => txt(str, x, y, { size, weight: 800, color, align, spacing: '4px' });
/** Chips laid out in rows from (x, y), wrapping at x1; each appears at its own time. */
function chipRows(items, x, y, x1, { color = C.allied, size = 32, gap = 14, row = 66, t = 0, k0 = 0, step = 0.3 } = {}) {
  let cx = x, cy = y;
  items.forEach((n, j) => {
    const w = textW(n, { size, weight: 700 }) + size * 1.24;
    if (cx + w > x1) { cx = x; cy += row; }
    chip(n, cx, cy, { color, size, align: 'left', a: seg(t, k0 + j * step, k0 + 0.4 + j * step) });
    cx += w + gap;
  });
  return cy;
}

// ---------- cold open ----------
function partOpen(t) {
  // o1: November 1942, and a hope of a few weeks
  A(span(t, s('o1', 0.2), s('o2', 0.6), 0.6, 0.6), () => {
    txt('NOVEMBER 1942', RCX, 430, { size: fit('NOVEMBER 1942', 960, 96, { weight: 800, family: DISPLAY }), weight: 800, family: DISPLAY, color: C.ink, align: 'center' });
    txtFit('Tunis, within weeks?', RCX, 540, 960, { size: 48, weight: 600, color: C.soft, align: 'center' });
    for (let i = 0; i < 4; i++) {
      const a = seg(t, s('o1', 1.6 + i * 0.35), s('o1', 2.0 + i * 0.35));
      A(a, () => { card(RCX - 230 + i * 120, 620, 100, 70, { bg: 'rgba(201,211,106,0.18)', r: 10, line: C.acc }); });
    }
  });
  // o2: six months
  A(span(t, s('o2', 0.4), s('o3', 0.4), 0.6, 0.6), () => {
    txt('SIX MONTHS', RCX, 470, { size: fit('SIX MONTHS', 960, 110, { weight: 800, family: DISPLAY }), weight: 800, family: DISPLAY, color: C.acc, align: 'center' });
    txtFit('from the desert to the hills', RCX, 580, 960, { size: 44, weight: 600, color: C.soft, align: 'center' });
  });
  // o3: five continents, and the Tunisians at home
  A(span(t, s('o3', 0.2), s('o4', 0.8), 0.6, 0.6), () => {
    txt('FIVE CONTINENTS', RCX, 380, { size: fit('FIVE CONTINENTS', 960, 84, { weight: 800, family: DISPLAY }), weight: 800, family: DISPLAY, color: C.ink, align: 'center' });
    const names = ['Europe', 'North America', 'Africa', 'Asia', 'Oceania'];
    const ws = names.map((n) => textW(n, { size: 34, weight: 700 }) + 34 * 1.24), tot = ws.reduce((a, b) => a + b, 0) + 14 * 4;
    let x = RCX - tot / 2;
    names.forEach((n, j) => { chip(n, x, 500, { color: C.allied, size: 34, align: 'left', a: seg(t, s('o3', 0.6 + j * 0.3), s('o3', 1.0 + j * 0.3)) }); x += ws[j] + 14; });
    A(seg(t, s('o3', 2.6), s('o3', 3.4)), () => txtFit('the towns, farms and villages of the Tunisians', RCX, 640, 980, { size: 40, weight: 600, family: DISPLAY, color: C.acc, align: 'center' }));
  });
  // o4: the title, until the first chapter card
  const ti = eout(seg(t, s('o4', 1.0), s('o4', 2.2)));
  A(ti, () => title(t, 470 + (1 - ti) * 18, ti));
}
function title(t, y, a = 1) {
  const o = { weight: 800, family: DISPLAY, spacing: '4px' };
  const l1 = 'THE TUNISIAN', l2 = 'CAMPAIGN', z = Math.min(fit(l1, 980, 120, o), fit(l2, 980, 120, o));
  txt(l1, RCX, y - 70, { ...o, size: z, align: 'center' });
  txt(l2, RCX, y + 60, { ...o, size: z, color: C.acc, align: 'center' });
  // the motif: seven months, lit
  for (let j = 0; j < 7; j++) {
    const lit = seg(t, s('o4', 1.6 + j * 0.15), s('o4', 1.9 + j * 0.15)) * a;
    k.rrect(RCX - 245 + j * 70, y + 150, 56, 20, 6); ctx.fillStyle = lit > 0.5 ? C.acc : 'rgba(201,211,106,0.25)'; ctx.fill();
  }
  txtFit('November 1942 to May 1943', RCX, y + 230, 960, { size: 40, weight: 600, color: C.soft, align: 'center' });
}

// ---------- 1: the race for Tunis ----------
function govBox(x, y, w, head, name, sub, a, col = C.acc) {
  if (a <= 0) return;
  A(a, () => {
    card(x, y, w, 250, { line: 'rgba(201,211,106,0.45)' });
    txtFit(head, x + 30, y + 46, w - 60, { size: 32, weight: 800, color: col, spacing: '3px' });
    txtFit(name, x + 30, y + 120, w - 60, { size: 46, weight: 700, family: DISPLAY, color: C.ink });
    txtFit(sub, x + 30, y + 190, w - 60, { size: 32, weight: 500, color: C.soft });
  });
}
function partRace(t) {
  // r1–r2: who governed Tunisia in 1942
  A(span(t, s('r1', 0.2), s('r3', 0.3), 0.5, 0.5), () => {
    txt('1942', RX, 300, { size: 44, weight: 800, color: C.acc });
    txtFit('A French protectorate', RX + 130, 300, RW - 130, { size: 56, weight: 700, family: DISPLAY });
    govBox(RX, 380, 480, 'REIGNED', 'Moncef Bey', 'Bey of Tunis, from June 1942', seg(t, s('r1', 2.0), s('r1', 2.6)));
    const r2 = seg(t, s('r2', 0.3), s('r2', 1.0));
    govBox(RX + 520, 380, 480, 'HELD THE REAL POWER', 'the resident-general', 'for France', seg(t, s('r1', 3.4), s('r1', 4.0)) * (1 - r2));
    govBox(RX + 520, 380, 480, 'HELD THE REAL POWER', 'Admiral Esteva', 'appointed by Vichy France', r2);
    chip('Vichy France: armistice with Germany, June 1940', RCX, 720, { color: C.grey, size: 32, a: seg(t, s('r2', 2.4), s('r2', 3.0)) });
  });
  // r3–r5: Torch, the prize, the Axis airlift: an inset of the western Mediterranean
  const med = span(t, s('r3', 0.0), s('r6', 0.4), 0.6, 0.6);
  if (med > 0) A(med, () => {
    windowFrame(() => {
      medBase(MED.M);
      const M = MED.M;
      const land = [[[-11.5, 34.6], [-8.4, 33.9]], [[-1.2, 37.6], [-0.7, 36.0]], [[3.6, 38.6], [3.1, 37.0]]];
      land.forEach((pts, j) => trace(pts.map((p) => M(p)), eout(seg(t, s('r3', 1.2 + j * 0.4), s('r3', 2.6 + j * 0.4))), C.allied, { w: 9, headSize: 20 }));
      [['Casablanca', [-7.6, 33.6], 'left', 16, 30], ['Oran', [-0.63, 35.72], 'center', 0, 34], ['Algiers', [3.05, 36.77], 'center', 0, 34]].forEach(([n, ll, al, dx, dy], j) => {
        A(seg(t, s('r3', 2.0 + j * 0.4), s('r3', 2.6 + j * 0.4)), () => { const [x, y] = M(ll); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); txt(n, x + dx, y + dy, { size: 32, weight: 700, color: C.ink, align: al }); });
      });
      // r4: Tunisia and Sicily
      A(seg(t, s('r4', 1.6), s('r4', 2.4)), () => {
        const [tx, ty] = M([9.6, 34.5]); ctx.strokeStyle = C.acc; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(tx, ty, 70, 120, 0, 0, TAU); ctx.stroke();
        txt('Tunisia', tx + 82, ty + 70, { size: 32, weight: 800, color: C.acc });
        const [sx, sy] = M([14.0, 37.6]); txt('Sicily', sx + 10, sy - 44, { size: 32, weight: 700, color: C.ink, align: 'center' });
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([4, 10]); ctx.beginPath(); ctx.moveTo(...M([10.3, 37.0])); ctx.lineTo(...M([12.5, 37.8])); ctx.stroke(); ctx.setLineDash([]);
      });
      // r5: the Axis airlift from Sicily to Tunis
      A(seg(t, s('r5', 0.4), s('r5', 1.0)), () => {
        trace([M([13.3, 38.1]), M([11.8, 37.7]), M([10.35, 36.95])], eout(seg(t, s('r5', 0.6), s('r5', 2.2))), C.axis, { w: 9, headSize: 20 });
        trace([M([12.6, 39.6]), M([11.0, 38.5]), M([9.95, 37.4])], eout(seg(t, s('r5', 1.0), s('r5', 2.6))), C.axis, { w: 7, headSize: 18 });
        chip('El Aouina', ...M([6.6, 38.4]), { color: C.axis, size: 32, a: seg(t, s('r5', 2.2), s('r5', 2.8)) });
      });
      txt('schematic map', WIN.x + 26, WIN.y + 34, { size: 32, weight: 500, color: C.soft });
    });
    // the number, under the inset
    A(span(t, s('r3', 2.4), s('r4', 1.4), 0.5, 0.5), () => {
      card(WIN.x + 30, WIN.y + WIN.h - 130, WIN.w - 60, 104, { bg: 'rgba(13,16,9,0.92)', line: 'rgba(136,194,228,0.5)' });
      const n = fmt(N.torch), nw = textW(n, { size: 56, weight: 700, family: DISPLAY });
      txt(n, WIN.x + 60, WIN.y + WIN.h - 76, { size: 56, weight: 700, family: DISPLAY, color: C.allied });
      txtFit('American and British soldiers, sailors and airmen', WIN.x + 84 + nw, WIN.y + WIN.h - 76, WIN.w - 140 - nw, { size: 34, weight: 600 });
    });
    A(span(t, s('r4', 1.8), s('r5', 0.4), 0.5, 0.5), () => chip('the prize', ...MED.M([3.5, 31.3]), { color: C.acc, size: 34 }));
  });
  // r6: the Axis build-up
  A(span(t, s('r6', 0.3), s('r7', 0.3), 0.5, 0.5), () => {
    kicker('BY MID-NOVEMBER', RX, 320);
    [[N.ger, 'German troops'], [N.ita, 'Italian troops']].forEach(([n, l], j) => {
      const a = eout(seg(t, s('r6', 1.4 + j * 1.0), s('r6', 2.0 + j * 1.0))), y = 450 + j * 170;
      A(a, () => {
        txt(fmt(n), RX + 420, y, { size: 104, weight: 800, family: DISPLAY, color: C.axis, align: 'right' });
        txtFit(l, RX + 460, y + 8, 520, { size: 44, weight: 600 });
      });
    });
    A(seg(t, s('r6', 3.4), s('r6', 4.0)), () => txtFit('held Tunis and Bizerte', RX, 790, RW, { size: 40, weight: 600, family: DISPLAY, color: C.soft }));
  });
  // r7: the French turn against the Germans
  A(span(t, s('r7', 0.2), s('r8', 0.4), 0.5, 0.5), () => {
    card(RX, 300, RW, 470, { line: 'rgba(136,194,228,0.5)' });
    kicker('19 NOVEMBER 1942', RX + 40, 360, { color: C.allied });
    txtFit('Medjez el Bab', RX + 40, 450, RW - 80, { size: 64, weight: 700, family: DISPLAY });
    txtFit('General Georges Barré’s French troops', RX + 40, 540, RW - 80, { size: 40, weight: 600 });
    txtFit('turn against the Germans', RX + 40, 600, RW - 80, { size: 40, weight: 500, color: C.soft });
    chip('North African riflemen among them', RX + 40, 700, { color: C.allied, size: 32, align: 'left', a: seg(t, s('r7', 3.0), s('r7', 3.6)) });
  });
  // r8–r9: from Algiers, more than 600 km; stopped 21 km from Tunis
  const bar = span(t, s('r8', 0.2), s('r10', 0.3), 0.5, 0.5);
  if (bar > 0) A(bar, () => {
    const x0 = RX + 40, x1 = RX + RW - 40, y = 560, kmPx = (x1 - x0) / ALGIERS_TUNIS;
    ctx.fillStyle = C.faint; ctx.fillRect(x0, y - 4, x1 - x0, 8);
    for (let km = 0; km <= ALGIERS_TUNIS; km += 100) { ctx.fillStyle = C.soft; ctx.fillRect(x0 + km * kmPx - 1.5, y - 12, 3, 24); }
    [[x0, 'Algiers', 'left'], [x1, 'Tunis', 'right']].forEach(([x, n, al]) => { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill(); txt(n, x, y + 56, { size: 40, weight: 700, align: al }); });
    A(seg(t, s('r8', 0.6), s('r8', 1.2)), () => {
      const n = fmt(Math.round(ALGIERS_TUNIS)), nw = textW(n, { size: 64, weight: 800, family: DISPLAY });
      txt(n, x0, 400, { size: 64, weight: 800, family: DISPLAY, color: C.acc });
      txt('km', x0 + nw + 12, 410, { size: 40, weight: 700, color: C.soft });
      txt('as the crow flies', x0 + nw + 80, 410, { size: 34, weight: 500, color: C.soft });
    });
    const stop = ALGIERS_TUNIS - 21, u = eio(seg(t, s('r8', 1.0), e('r9', -1.4)));
    trace([[x0, y - 46], [x0 + stop * kmPx * u, y - 46]], u > 0.01 ? 1 : 0, C.allied, { w: 12, headSize: 24 });
    A(seg(t, s('r8', 1.6), s('r8', 2.2)), () => txt('First Army', x0 + 10, y - 96, { size: 34, weight: 700, color: C.allied }));
    // r9: the last 21 km
    A(seg(t, s('r9', 1.4), s('r9', 2.2)), () => {
      const xa = x0 + stop * kmPx, ya = y + 250, m0 = RX + 300, m1 = x1;
      ctx.strokeStyle = 'rgba(201,211,106,0.6)'; ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(xa, y + 16); ctx.lineTo(m0, ya - 16); ctx.moveTo(x1, y + 16); ctx.lineTo(m1, ya - 16); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.acc; ctx.fillRect(m0, ya - 5, m1 - m0, 10);
      [[m0, 'Djedeida', 'left', C.allied], [m1, 'Tunis', 'right', C.ink]].forEach(([x, n, al, col]) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, ya, 12, 0, TAU); ctx.fill(); txt(n, x, ya + 50, { size: 40, weight: 700, color: col, align: al }); });
      const n = '21', nw = textW(n, { size: 56, weight: 800, family: DISPLAY });
      txt(n, (m0 + m1) / 2 - 10, ya - 50, { size: 56, weight: 800, family: DISPLAY, color: C.acc, align: 'right' });
      txt('km', (m0 + m1) / 2 + 4, ya - 44, { size: 36, weight: 700, color: C.soft });
      void nw;
    });
  });
  // r10: airfields near and far; rain and mud
  A(span(t, s('r10', 0.2), s('r11', 0.4), 0.5, 0.5), () => {
    kicker('FROM THE FRONT AT DJEDEIDA', RX, 300);
    const x0 = RX + 40, pxKm = 760 / DJ_SOUK;
    const rows = [['Axis fighters', 'hard runways by Tunis', DJ_AOUINA, C.axis, 440], ['Allied planes', 'distant dirt fields', DJ_SOUK, C.allied, 680]];
    rows.forEach(([who, where, km, col, y], j) => {
      const a = eout(seg(t, s('r10', 0.4 + j * 1.8), s('r10', 1.0 + j * 1.8)));
      A(a, () => {
        txt(who, x0, y - 60, { size: 40, weight: 700, color: col });
        txt(where, x0 + textW(who, { size: 40, weight: 700 }) + 24, y - 58, { size: 34, weight: 500, color: C.soft });
        ctx.fillStyle = col; ctx.fillRect(x0, y - 10, km * pxKm * a, 20);
        const n = fmt(Math.round(km));
        txt(n, x0 + km * pxKm + 20, y, { size: 40, weight: 800, color: col });
        txt('km', x0 + km * pxKm + 30 + textW(n, { size: 40, weight: 800 }), y + 4, { size: 32, weight: 700, color: C.soft });
      });
    });
    // rain over the Allied row, and mud
    const rain = seg(t, s('r10', 3.6), s('r10', 4.4));
    if (rain > 0) A(rain, () => {
      ctx.strokeStyle = 'rgba(160,190,220,0.7)'; ctx.lineWidth = 3;
      for (let i = 0; i < 46; i++) {
        const x = x0 + ((i * 97) % 900), y = 560 + (((i * 53) % 90) + t * 260) % 150;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 22); ctx.stroke();
      }
      chip('mud', x0 + DJ_SOUK * pxKm - 40, 770, { color: '#b08850', size: 32 });
    });
  });
  // r11: pushed back; the halt
  A(span(t, s('r11', 0.2), CH[1].at + 1.0, 0.5, 0.6), () => {
    card(RX, 300, RW, 520, { line: 'rgba(201,211,106,0.5)' });
    kicker('10 DECEMBER 1942', RX + 40, 360, { color: C.allied });
    txtFit('pushed back to Medjez el Bab', RX + 40, 430, RW - 80, { size: 44, weight: 600 });
    A(seg(t, at('r11', 0.55), at('r11', 0.7)), () => {
      ctx.fillStyle = C.faint; ctx.fillRect(RX + 40, 500, RW - 80, 2);
      kicker('24 DECEMBER 1942', RX + 40, 570);
      txtFit('Eisenhower calls a halt', RX + 40, 660, RW - 80, { size: 64, weight: 700, family: DISPLAY });
      txtFit('The race for Tunis is lost.', RX + 40, 750, RW - 80, { size: 40, weight: 500, color: C.soft });
    });
  });
}

// ---------- 2: winter in the hills ----------
function partWinter(t) {
  // w1: three national sectors along the front
  A(span(t, s('w1', 2.4), s('w2', 0.4), 0.5, 0.5), () => {
    kicker('THE WINTER FRONT', RX, 300);
    [['British', 'north'], ['French', 'centre'], ['Americans', 'south']].forEach(([n, where], j) => {
      const a = eout(seg(t, s('w1', 3.0 + j * 1.0), s('w1', 3.6 + j * 1.0))), y = 400 + j * 150;
      A(a, () => {
        card(RX, y - 55, RW, 110, { bg: 'rgba(13,16,9,0.88)' });
        ctx.fillStyle = C.allied; ctx.fillRect(RX, y - 55, 14, 110);
        txt(n, RX + 50, y, { size: 48, weight: 700, family: DISPLAY });
        txt(where, RX + RW - 40, y, { size: 36, weight: 600, color: C.soft, align: 'right' });
      });
    });
  });
  // w2: the January attacks on the French
  A(span(t, s('w2', 0.3), s('w3', 0.3), 0.5, 0.5), () => {
    kicker('JANUARY 1943', RX, 320);
    txtFit('German attacks on the French centre', RX, 410, RW, { size: 54, weight: 700, family: DISPLAY });
    let cx = RX;
    ['poorly equipped', 'resisted hard', 'overrun'].forEach((n, j) => { cx += chip(n, cx, 530, { color: j === 2 ? C.axis : C.allied, size: 36, align: 'left', a: seg(t, s('w2', 2.4 + j * 1.2), s('w2', 2.9 + j * 1.2)) }) + 20; });
  });
  // w3–w4: the French army of 1943, mostly North Africans
  A(span(t, s('w3', 0.2), s('w5', 0.3), 0.5, 0.5), () => {
    kicker('FRENCH TROOPS IN TUNISIA, MARCH 1943', RX, 300);
    const tot = Math.round(N.fr / 1000) * 1000, na = Math.round(N.frNA / 5000) * 5000;
    txt(fmt(tot), RX, 400, { size: 96, weight: 800, family: DISPLAY, color: C.allied });
    const x0 = RX, w = RW, y = 500, f = N.frNA / N.fr, g = eio(seg(t, s('w3', 2.6), s('w3', 4.0)));
    ctx.fillStyle = 'rgba(136,194,228,0.25)'; ctx.fillRect(x0, y, w, 50);
    ctx.fillStyle = C.allied; ctx.fillRect(x0, y, w * f * g, 50);
    A(seg(t, s('w3', 3.4), s('w3', 4.2)), () => {
      txt('about', x0, y + 100, { size: 36, weight: 600, color: C.soft });
      const aw = textW('about', { size: 36, weight: 600 }) + 14;
      txt(fmt(na), x0 + aw, y + 100, { size: 44, weight: 800, color: C.allied });
      txt('North Africans', x0 + aw + textW(fmt(na), { size: 44, weight: 800 }) + 16, y + 100, { size: 36, weight: 600 });
    });
    A(seg(t, s('w3', 4.0), s('w3', 4.6)), () => txtFit('French army records, cited by the historian Belkacem Recham', RX, y + 170, RW, { size: 32, weight: 500, color: C.soft }));
    A(seg(t, s('w4', 0.2), s('w4', 0.8)), () => {
      chip('Tunisian riflemen among them', RX, 790, { color: C.acc, size: 34, align: 'left' });
      chip('makeshift equipment', RX + RW, 870, { color: C.soft, size: 32, align: 'right', a: seg(t, s('w4', 1.4), s('w4', 2.0)) });
    });
  });
  // w5: the Eighth Army, from Egypt across Libya
  A(span(t, s('w5', 0.2), s('w6', 0.4), 0.5, 0.5), () => {
    windowFrame(() => {
      medBase(LIB.M);
      const M = LIB.M;
      const coast = [[28.95, 30.83], [25.1, 31.55], [23.9, 32.1], [20.1, 32.1], [19.6, 30.6], [15.1, 32.3], [13.18, 32.95], [11.2, 33.25], [10.5, 33.38]];
      trace(smooth(coast.map((p) => M(p)), 8), eio(seg(t, s('w5', 0.6), e('w5', -0.2))), C.allied, { w: 10, headSize: 22 });
      [['El Alamein', [28.95, 30.83], 'center', 0, 40], ['Tripoli', [13.18, 32.9], 'center', 0, 40]].forEach(([n, ll, al, dx, dy], j) => {
        A(seg(t, s('w5', 1.0 + j * 1.6), s('w5', 1.6 + j * 1.6)), () => { const [x, y] = M(ll); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); txt(n, x + dx, y + dy, { size: 32, weight: 700, color: C.ink, align: al }); });
      });
      [['EGYPT', [28.5, 28.9]], ['LIBYA', [19.5, 28.9]]].forEach(([n, ll]) => txt(n, ...M(ll), { size: 32, weight: 700, color: C.soft, align: 'center', spacing: '4px' }));
      chip('Eighth Army', ...M([21.5, 34.6]), { color: C.allied, size: 34, a: seg(t, s('w5', 1.4), s('w5', 2.0)) });
      txt('schematic map', WIN.x + 26, WIN.y + 34, { size: 32, weight: 500, color: C.soft });
    });
  });
  // w6–w7: who was there
  A(span(t, s('w6', 0.2), CH[2].at + 1.0, 0.5, 0.6), () => {
    kicker('THE ALLIES', RX, 270, { color: C.allied });
    const groups = [['from the west', ['British', 'Americans', 'French']], ['from the east', ['British', 'New Zealanders', 'Indians', 'Free French from Chad', 'Greeks']], ['in the air, among others', ['Australians', 'South Africans']]];
    let y = 330, k0 = s('w6', 0.4);
    groups.forEach(([g, items]) => {
      A(seg(t, k0, k0 + 0.4), () => txt(g, RX, y, { size: 32, weight: 600, color: C.soft }));
      y = chipRows(items, RX, y + 54, RX + RW, { t, k0: k0 + 0.2, step: 0.28 }) + 76;
      k0 += 0.4 + items.length * 0.28;
    });
    A(seg(t, s('w7', 0.2), s('w7', 0.8)), () => {
      kicker('FACING THEM', RX, y + 10, { color: C.axis });
      chip('Fifth Panzer Army · north', RX, y + 74, { color: C.axis, size: 32, align: 'left', a: seg(t, s('w7', 1.2), s('w7', 1.8)) });
      chip('Italian First Army · south', RX + 500, y + 74, { color: C.axis, size: 32, align: 'left', a: seg(t, s('w7', 2.4), s('w7', 3.0)) });
    });
  });
}

// ---------- 3: Kasserine ----------
// The cards laid over the Kasserine map, [x, y, w, h], with when they show: any map label they would cover fades out
// while they show, so nothing peeks out from behind a card.
const K3_CARD = [WIN.x + 6, WIN.y + 410, 372, 276];
const K7_CARD = [WIN.x + 24, WIN.y + WIN.h - 330, WIN.w - 48, 306], K8_CARD = [WIN.x + 24, WIN.y + WIN.h - 300, WIN.w - 48, 276];
const K1_CHIP = 'the US Army’s first campaign against the German army';
const k1ChipA = (t) => span(t, s('k1', 2.6), s('k2', 0.6), 0.5, 0.5);
function kassCovers(t) {
  const w = textW(K1_CHIP, { size: 32, weight: 700 }) + 40;
  return [[[RCX - w / 2, WIN.y + WIN.h - 86, w, 52], k1ChipA(t)], [K3_CARD, span(t, s('k3', 0.2), s('k4', 0.3), 0.5, 0.5)], [K7_CARD, span(t, s('k7', 0.2), s('k8', 0.3), 0.5, 0.5)], [K8_CARD, span(t, s('k8', 0.2), s('k9', 0.3), 0.5, 0.5)]];
}
/** How much of a box [x, y, w, h] is covered by a card now (0–1), with a margin. */
const coveredBy = (covers, [bx, by, bw, bh], m = 10) => covers.reduce((v, [[x, y, w, h], a]) => (a > 0 && bx < x + w + m && bx + bw > x - m && by < y + h + m && by + bh > y - m ? Math.max(v, a) : v), 0);
/** The box of a town's dot and label. */
function townBox(xy, name, dx, dy, align, size = 32) {
  const [x, y] = xy, w = textW(name, { size, weight: 600 }) + 8, lx = align === 'left' ? x + dx : align === 'right' ? x + dx - w : x + dx - w / 2;
  const x0 = Math.min(x - 8, lx), x1 = Math.max(x + 8, lx + w), y0 = Math.min(y - 8, y + dy - size * 0.6), y1 = Math.max(y + 8, y + dy + size * 0.6);
  return [x0, y0, x1 - x0, y1 - y0];
}
/** The box of a rotated label. */
function rotBox(xy, str, rot, size = 32) {
  const w = textW(str, { size, weight: 700, spacing: '2px' }), h = size * 1.2, c = Math.abs(Math.cos(rot)), sn = Math.abs(Math.sin(rot));
  const hw = (c * w + sn * h) / 2, hh = (sn * w + c * h) / 2;
  return [xy[0] - hw, xy[1] - hh, hw * 2, hh * 2];
}
function partKass(t) {
  const covers = kassCovers(t), keep = (box) => 1 - coveredBy(covers, box);
  zoomWindow(t, ZK, (Z) => {
    // k2–k3: while the three hills are drawn, Sidi Bou Zid's name moves out of their ring
    const ringA = span(t, s('k2', 0.4), s('k4', 0.4), 0.5, 0.5);
    const towns = [['tebessa', 'Tébessa', 0, 30, 'center'], ['kasserine', 'Kasserine', 14, 26, 'left'], ['thala', 'Thala', 14, -20, 'left'], ['sbiba', 'Sbiba', 14, -20, 'left'],
      ['sbeitla', 'Sbeitla', 14, -22, 'left'], ['sidi', 'Sidi Bou Zid', lerp(-22, -92, eio(ringA)), 0, 'right'], ['faid', 'Faïd', 14, -20, 'left'], ['gafsa', 'Gafsa', -14, 0, 'right'],
      ['guettar', 'El Guettar', -14, 24, 'right'], ['feriana', 'Feriana', -14, 0, 'right']];
    towns.forEach(([key, n, dx, dy, al]) => townDot(PL[key], n, keep(townBox(Z(PL[key]), n, dx, dy, al)), { proj: Z, dx, dy, align: al, size: 32 }));
    // the ridges' names, placed where no town name is: the Western Dorsal by the Algerian border, the Eastern Dorsal east of its crest
    const ridge = (str, ll, rot) => mapLabel(str, ll, keep(rotBox(Z(ll), str, rot)), { proj: Z, color: 'rgba(90,60,30,0.95)', size: 32, spacing: '2px', rot, weight: 700, halo: SAND });
    ridge('Western Dorsal', [35.173, 8.283], -0.70);
    ridge('Eastern Dorsal', [35.4, 10.05], -1.29);
    // k1: the first campaign
    chip('US II Corps', ...Z([34.75, 8.95]), { color: C.alliedDk, fill: C.allied, size: 32, a: span(t, s('k1', 1.0), s('k2', 0.6), 0.5, 0.5) });
    // k2: three hills too far apart to help each other
    const hills = [[35.0, 9.5], [34.8, 9.64], [34.74, 9.42]];
    A(span(t, s('k2', 0.4), s('k4', 0.4), 0.5, 0.5), () => {
      hills.forEach((ll, j) => {
        const [x, y] = Z(ll), a = seg(t, s('k2', 1.6 + j * 0.3), s('k2', 2.0 + j * 0.3));
        A(a, () => {
          ctx.fillStyle = 'rgba(120,92,58,0.85)'; ctx.beginPath(); ctx.moveTo(x - 44, y + 18); ctx.quadraticCurveTo(x, y - 34, x + 44, y + 18); ctx.closePath(); ctx.fill();
          ctx.fillStyle = C.allied; ctx.fillRect(x - 12, y - 14, 24, 24); ctx.strokeStyle = C.alliedDk; ctx.lineWidth = 3; ctx.strokeRect(x - 12, y - 14, 24, 24);
          ctx.strokeStyle = 'rgba(47,106,140,0.9)'; ctx.lineWidth = 3; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.arc(x, y, 52, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        });
      });
      const u = eout(seg(t, s('k2', 3.0), e('k2', 0.6)));
      trace(smooth([Z([35.05, 9.9]), Z([35.12, 9.6]), Z([35.05, 9.38]), Z([34.92, 9.33])]), u, C.axis, { w: 9, headSize: 20 });
      trace(smooth([Z([34.88, 9.85]), Z([34.66, 9.68]), Z([34.64, 9.38]), Z([34.78, 9.3])]), u, C.axis, { w: 9, headSize: 20 });
      chip('14 FEB', ...Z([34.93, 10.05]), { color: C.axis, size: 32, a: seg(t, s('k2', 1.0), s('k2', 1.6)) });
    });
    // k4: the fall back, about 80 km
    A(span(t, s('k4', 0.2), s('k5', 1.0), 0.5, 0.6), () => {
      trace(smooth([Z([34.95, 9.55]), Z([35.15, 9.3]), Z([35.23, 9.0]), Z([35.24, 8.78])]), eio(seg(t, s('k4', 0.4), e('k4', -0.6))), C.allied, { w: 10, headSize: 22 });
      chip('about 80 km', ...Z([35.46, 9.2]), { color: C.allied, size: 32, a: seg(t, s('k4', 1.6), s('k4', 2.2)) });
    });
    // k5: through the pass; towards Sbiba, Thala and Tébessa
    A(span(t, s('k5', 0.2), s('k7', 0.3), 0.5, 0.5), () => {
      const u = eout(seg(t, s('k5', 1.0), e('k5', 0.4)));
      trace(smooth([Z([35.2, 9.05]), Z([35.24, 8.78]), Z([35.34, 8.71]), Z([35.42, 8.69])]), u, C.axis, { w: 10, headSize: 22 });
      trace(smooth([Z([35.24, 8.74]), Z([35.23, 8.62])]), u, C.axis, { w: 8, headSize: 18 });
      trace(smooth([Z([35.26, 9.12]), Z([35.34, 9.1]), Z([35.4, 9.08])]), u, C.axis, { w: 8, headSize: 18 });
      // on the empty Algerian ground at the top left, clear of every town name
      chip('Kasserine Pass', WIN.x + 30, WIN.y + 110, { color: C.axis, size: 32, align: 'left', a: seg(t, s('k5', 2.4), s('k5', 3.0)) });
    });
    // k6: held at Sbiba, Djebel el Hamra and Thala
    A(span(t, s('k6', 0.2), s('k8', 0.4), 0.5, 0.6), () => {
      // bars across the roads, just short of each place: north of the attack on Sbiba and Thala, west of it at Djebel el Hamra
      [['sbiba', -1.6, 0.6, 0, 40], ['hamra', 0, 1.6, 0, 0], ['thala', -1.45, 2.6, 4, 40]].forEach(([key, ang, d0, ox, oy]) => {
        const [x, y] = Z(PL[key]); heldBar(x + ox, y + oy, ang, seg(t, s('k6', d0), s('k6', d0 + 0.5)), C.allied, 56);
      });
      chip('22 FEB · massed guns at Thala', WIN.x + WIN.w - 24, WIN.y + 46, { color: C.allied, size: 32, align: 'right', a: seg(t, s('k6', 3.6), s('k6', 4.2)) });
    });
    // k9: El Guettar, 23 March
    A(span(t, s('k9', 0.2), CH[3].at + 1.0, 0.5, 0.6), () => {
      const [x, y] = Z(PL.guettar);
      trace([[x + 220, y + 10], [x + 60, y + 4]], eout(seg(t, s('k9', 0.6), s('k9', 2.0))), C.axis, { w: 10, headSize: 22 });
      heldBar(x + 34, y + 4, 0, seg(t, s('k9', 1.8), s('k9', 2.4)), C.allied, 60);
      chip('23 MARCH · held', x + 170, y - 70, { color: C.allied, size: 32, a: seg(t, s('k9', 2.2), s('k9', 2.8)) });
    });
  });
  // k1: the first campaign (above the map)
  A(k1ChipA(t), () => chip(K1_CHIP, RCX, WIN.y + WIN.h - 60, { color: C.acc, size: 32 }));
  // k3: the losses at Sidi Bou Zid, as a number, on the empty ground at the bottom left
  A(span(t, s('k3', 0.2), s('k4', 0.3), 0.5, 0.5), () => {
    const [cx, cy, cw, ch] = K3_CARD, x = cx + 20, mw = cw - 40;
    card(cx, cy, cw, ch, { bg: 'rgba(13,16,9,0.96)', line: 'rgba(244,239,220,0.4)' });
    txtFit('1st Armored Division', x, cy + 40, mw, { size: 32, weight: 700, color: C.acc });
    const n = fmt(N.tanks), nw = textW(n, { size: 84, weight: 800, family: DISPLAY });
    txt(n, x, cy + 112, { size: 84, weight: 800, family: DISPLAY, color: C.ink });
    txtFit('tanks', x + nw + 14, cy + 120, mw - nw - 14, { size: 40, weight: 700, color: C.soft });
    txtFit('and about half', x, cy + 176, mw, { size: 34, weight: 600 });
    txtFit('its strength', x, cy + 214, mw, { size: 34, weight: 600 });
    txtFit('by Martin Blumenson', x, cy + 252, mw, { size: 32, weight: 500, color: C.soft });
  });
  // k7: the causes
  A(span(t, s('k7', 0.2), s('k8', 0.3), 0.5, 0.5), () => {
    card(...K7_CARD, { bg: 'rgba(13,16,9,0.96)', line: 'rgba(201,211,106,0.5)' });
    kicker('WHY', WIN.x + 60, WIN.y + WIN.h - 286);
    txt('The National WWII Museum', WIN.x + WIN.w - 60, WIN.y + WIN.h - 286, { size: 32, weight: 500, color: C.soft, align: 'right' });
    ['commanders had not seen the ground', 'divisions split up', 'poor coordination', 'inexperience'].forEach((n, j) => {
      A(seg(t, s('k7', 1.4 + j * 1.1), s('k7', 1.9 + j * 1.1)), () => {
        const x = WIN.x + 60, y = WIN.y + WIN.h - 222 + j * 54;
        ctx.fillStyle = C.acc; ctx.beginPath(); ctx.arc(x + 10, y, 8, 0, TAU); ctx.fill();
        txtFit(n, x + 32, y, WIN.w - 140, { size: 34, weight: 600 });
      });
    });
  });
  // k8: the changes
  A(span(t, s('k8', 0.2), s('k9', 0.3), 0.5, 0.5), () => {
    card(...K8_CARD, { bg: 'rgba(13,16,9,0.96)', line: 'rgba(201,211,106,0.5)' });
    [['ONE ALLIED COMMAND', 'Harold Alexander', '20 February', 0.8], ['US II CORPS', 'George S. Patton', '6 March', 3.4]].forEach(([h, n, when, d0], j) => {
      A(seg(t, s('k8', d0), s('k8', d0 + 0.6)), () => {
        const y = WIN.y + WIN.h - 240 + j * 120;
        kicker(h, WIN.x + 60, y, { size: 32 });
        txtFit(n, WIN.x + 60, y + 50, 560, { size: 40, weight: 700, family: DISPLAY });
        txt(when, WIN.x + WIN.w - 60, y + 50, { size: 34, weight: 600, color: C.soft, align: 'right' });
      });
    });
  });
}

// ---------- 4: Mareth and the left hook ----------
function partMareth(t) {
  const night = span(t, s('m4', 0.2), s('m5', 0.6), 0.8, 0.8);
  zoomWindow(t, ZM, (Z) => {
    [['gabes', 'Gabès', 14, -22, 'left'], ['medenine', 'Medenine', 14, 24, 'left'], ['mareth', 'Mareth', -14, -20, 'right'], ['zarat', 'Zarat', 14, -22, 'left'],
      ['hamma', 'El Hamma', -14, -22, 'right'], ['ksar', 'Ksar Rhilane', 14, 26, 'left']].forEach(([key, n, dx, dy, al]) => townDot(PL[key], n, 1, { proj: Z, dx, dy, align: al }));
    mapLabel('Matmata hills', [33.28, 10.06], 1, { proj: Z, color: 'rgba(90,60,30,0.95)', size: 32, spacing: '1px', weight: 700 });
    mapLabel('LIBYA', [33.0, 11.0], 1, { proj: Z, color: 'rgba(244,239,220,0.6)', size: 32 });
    // the line
    const lineU = Math.max(eio(seg(t, s('m1', 1.2), s('m1', 3.6))), t > s('m2') ? 1 : 0);
    ctx.strokeStyle = C.axis; ctx.lineWidth = 9; ctx.setLineDash([16, 8]);
    const lp = MARETH_LINE.map((p) => Z(p));
    if (lineU > 0) { ctx.beginPath(); ctx.moveTo(...lp[0]); for (let i = 1; i < lp.length; i++) { const f = Math.min(1, Math.max(0, lineU * (lp.length - 1) - (i - 1))); if (f <= 0) break; ctx.lineTo(lerp(lp[i - 1][0], lp[i][0], f), lerp(lp[i - 1][1], lp[i][1], f)); } ctx.stroke(); }
    ctx.setLineDash([]);
    chip('Mareth Line', ...Z([33.96, 10.78]), { color: C.axis, size: 32, a: span(t, s('m1', 2.6), s('m3', 0.2), 0.5, 0.5) });
    chip('Italian First Army · Giovanni Messe', ...Z([34.12, 10.15]), { color: C.axis, size: 32, a: span(t, s('m1', 1.2), s('m2', 0.2), 0.5, 0.5) });
    // m2: built against Italian Libya; now facing the British from Libya
    A(span(t, s('m2', 0.2), s('m3', 0.4), 0.5, 0.5), () => {
      const turn = seg(t, s('m2', 3.0), s('m2', 3.8));
      A(1 - turn, () => { trace([Z([33.6, 10.3]), Z([33.25, 10.85])], eout(seg(t, s('m2', 0.6), s('m2', 2.0))), C.grey, { w: 10, headSize: 22 }); chip('built by France · 1930s', ...Z([33.38, 10.55]), { color: C.grey, size: 32, a: seg(t, s('m2', 0.4), s('m2', 1.0)) }); });
      A(turn, () => { trace([Z([33.05, 10.95]), Z([33.32, 10.55])], eout(seg(t, s('m2', 3.2), s('m2', 4.6))), C.allied, { w: 10, headSize: 22 }); chip('Eighth Army', ...Z([33.0, 10.5]), { color: C.allied, size: 32 }); });
    });
    // m3: Medenine, 6 March
    A(span(t, s('m3', 0.2), s('m4', 0.3), 0.5, 0.5), () => {
      const [x, y] = Z(PL.medenine);
      trace(smooth([Z([33.55, 10.15]), Z([33.45, 10.3]), [x - 20, y - 30]]), eout(seg(t, s('m3', 0.6), s('m3', 2.2))), C.axis, { w: 10, headSize: 22 });
      heldBar(x - 10, y - 18, 0.7, seg(t, s('m3', 2.0), s('m3', 2.6)), C.allied, 64);
    });
    // m4: the frontal attack at night, thrown back
    if (night > 0) A(night * 0.85, () => { ctx.fillStyle = C.night; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h); });
    A(span(t, s('m4', 0.4), s('m6', 0.2), 0.5, 0.6), () => {
      const [ax, ay] = Z([33.6, 10.48]), [bx, by] = Z([33.7, 10.33]);
      const back = seg(t, e('m4', -1.8), e('m4', -0.4));
      trace([[ax + 30, ay + 30], [lerp(bx, ax + 10, back), lerp(by, ay + 10, back)]], eout(seg(t, s('m4', 0.8), s('m4', 2.6))), C.allied, { w: 12, headSize: 26 });
    });
    // m5–m6: the left hook
    A(span(t, s('m5', 0.2), s('m7', 1.2), 0.5, 0.6), () => {
      trace(smooth(HOOK.map((p) => Z(p)), 8), eio(seg(t, s('m5', 0.6), e('m5', -0.2))), C.allied, { w: 10, dash: [3, 14], headSize: 24 });
      chip('New Zealand Corps and Free French', ...Z([32.93, 9.55]), { color: C.allied, size: 32, a: seg(t, s('m5', 1.6), s('m5', 2.2)) });
      chip('some 200 km', ...Z([33.32, 9.18]), { color: C.acc, size: 32, a: seg(t, e('m5', -1.4), e('m5', -0.8)) });
      mapLabel('Tebaga Gap', [33.86, 9.5], seg(t, s('m5', 2.4), s('m5', 3.0)), { proj: Z, color: C.dark, size: 32, spacing: '1px', weight: 700 });
    });
    A(span(t, s('m6', 0.2), s('m7', 1.6), 0.5, 0.6), () => {
      const [gx, gy] = Z(PL.tebaga);
      // the sun low in the west, behind the attack
      A(seg(t, at('m6', 0.45), at('m6', 0.6)), () => {
        const sx = WIN.x + 70, sy = gy + 30;
        ctx.fillStyle = 'rgba(255,214,120,0.95)'; ctx.beginPath(); ctx.arc(sx, sy, 34, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,214,120,0.7)'; ctx.lineWidth = 4;
        for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * 44, sy + Math.sin(a) * 44); ctx.lineTo(sx + Math.cos(a) * 58, sy + Math.sin(a) * 58); ctx.stroke(); }
      });
      trace([[gx - 40, gy + 10], [gx + 120, gy - 50]], eout(seg(t, at('m6', 0.6), e('m6', 0.4))), C.allied, { w: 12, headSize: 26 });
      ring(gx, gy, seg(t, at('m6', 0.5), at('m6', 0.65)), t, C.acc, 30);
      chip('26 MARCH · 4 P.M.', gx + 40, gy + 80, { color: C.acc, size: 32, a: seg(t, at('m6', 0.5), at('m6', 0.65)) });
    });
    // m7: the Axis pulls back north to the Wadi Akarit
    A(span(t, s('m7', 0.2), CH[4].at + 1.0, 0.5, 0.6), () => {
      const u = eout(seg(t, s('m7', 0.6), s('m7', 2.6)));
      trace([Z([33.6, 10.25]), Z([34.02, 10.06])], u, C.axis, { w: 10, headSize: 22 });
      trace([Z([33.85, 9.85]), Z([34.06, 9.98])], u, C.axis, { w: 8, headSize: 18 });
      mapLabel('Wadi Akarit', [34.2, 9.75], seg(t, s('m7', 1.6), s('m7', 2.2)), { proj: Z, color: C.dark, size: 32, spacing: '1px', weight: 700 });
    });
  });
  // m3: the tank count and Rommel's departure
  A(span(t, s('m3', 1.2), s('m4', 0.3), 0.5, 0.5), () => {
    card(WIN.x + WIN.w - 520, WIN.y + 24, 496, 250, { line: 'rgba(244,239,220,0.4)' });
    const x = WIN.x + WIN.w - 490;
    kicker('6 MARCH · MEDENINE', x, WIN.y + 70, { size: 32 });
    const n0 = fmt(N.med0), n1 = fmt(N.med1);
    txt(n0, x, WIN.y + 140, { size: 64, weight: 800, family: DISPLAY });
    txt('–', x + textW(n0, { size: 64, weight: 800, family: DISPLAY }) + 8, WIN.y + 140, { size: 64, weight: 800, family: DISPLAY });
    txt(n1, x + textW(n0, { size: 64, weight: 800, family: DISPLAY }) + 48, WIN.y + 140, { size: 64, weight: 800, family: DISPLAY });
    txt('tanks', x + textW(n0 + n1, { size: 64, weight: 800, family: DISPLAY }) + 66, WIN.y + 146, { size: 36, weight: 700, color: C.soft });
    txtFit('lost, by the British count', x, WIN.y + 214, 450, { size: 32, weight: 500, color: C.soft });
  });
  A(span(t, at('m3', 0.7), s('m4', 0.3), 0.5, 0.5), () => chip('9 MARCH · Rommel leaves Africa', RCX, WIN.y + WIN.h - 56, { color: C.acc, size: 32 }));
  // m7: the verdict
  A(span(t, s('m7', 2.4), CH[4].at + 1.0, 0.5, 0.6), () => {
    card(WIN.x + 24, WIN.y + WIN.h - 200, WIN.w - 48, 176, { line: 'rgba(201,211,106,0.5)' });
    txtFit('“won the battle but could not make a victory of it”', RCX, WIN.y + WIN.h - 132, WIN.w - 100, { size: 40, weight: 600, family: DISPLAY, align: 'center' });
    txt('the British official history', RCX, WIN.y + WIN.h - 70, { size: 32, weight: 500, color: C.soft, align: 'center' });
  });
}

// ---------- 5: the last hills ----------
/** The Gabès gap seen from the south: salt marshes, the hills behind the wadi, the sea. */
function drawGap(t, { night = 0 } = {}) {
  const sky = ctx.createLinearGradient(0, WIN.y, 0, WIN.y + 480);
  sky.addColorStop(0, night > 0.5 ? '#0d1530' : '#7fa5b8'); sky.addColorStop(1, night > 0.5 ? '#2a2f4a' : '#e6d4a8');
  ctx.fillStyle = sky; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  if (night > 0) A(night, () => { ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(WIN.x + ((i * 151) % 980) + 10, WIN.y + 20 + ((i * 67) % 260), 2, 0, TAU); ctx.fill(); } });
  const base = WIN.y + 520;
  // ground
  ctx.fillStyle = night > 0.5 ? '#3b3528' : '#cdb284'; ctx.fillRect(WIN.x, base, WIN.w, WIN.h - (base - WIN.y));
  // salt marshes (left) and the sea (right)
  ctx.fillStyle = night > 0.5 ? '#8c8f88' : C.chott; ctx.fillRect(WIN.x, base, 280, WIN.h);
  ctx.fillStyle = night > 0.5 ? '#16323a' : C.sea2; ctx.fillRect(WIN.x + WIN.w - 200, base - 6, 200, WIN.h);
  // the hills: Djebel Fatnassa (left), Djebel Roumana (centre)
  const hill = (x0, x1, h, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0, base); ctx.bezierCurveTo(x0 + (x1 - x0) * 0.25, base - h, x0 + (x1 - x0) * 0.6, base - h * 1.05, x1, base); ctx.closePath(); ctx.fill(); };
  const hc = night > 0.5 ? '#222a33' : '#8a6a46';
  hill(WIN.x + 230, WIN.x + 560, 230, hc);
  hill(WIN.x + 520, WIN.x + 800, 150, hc);
  // the wadi in front of them
  ctx.strokeStyle = C.axis; ctx.lineWidth = 6; ctx.setLineDash([14, 8]); ctx.beginPath(); ctx.moveTo(WIN.x + 280, base + 40); ctx.bezierCurveTo(WIN.x + 500, base + 70, WIN.x + 650, base + 30, WIN.x + WIN.w - 200, base + 46); ctx.stroke(); ctx.setLineDash([]);
  return { base, fat: [WIN.x + 395, base - 175], rou: [WIN.x + 660, base - 110] };
}
function partHills(t) {
  // a1–a3: the Wadi Akarit
  const gapA = span(t, s('a1', 0.2), s('a4', 0.4), 0.6, 0.6);
  if (gapA > 0) A(gapA, () => windowFrame(() => {
    const night = span(t, s('a2', 0.2), at('a3', 0.5), 0.8, 0.8);
    const g = drawGap(t, { night: night > 0.5 ? night : 0 });
    if (night > 0 && night <= 0.5) A(night, () => drawGap(t, { night: 1 }));
    A(span(t, s('a1', 1.4), s('a2', 0.6), 0.5, 0.5), () => {
      txt('salt marshes', WIN.x + 140, g.base + 100, { size: 32, weight: 700, color: C.dark, align: 'center' });
      txt('sea', WIN.x + WIN.w - 100, g.base + 100, { size: 32, weight: 700, color: C.ink, align: 'center' });
      txt('Wadi Akarit', WIN.x + 560, g.base + 120, { size: 32, weight: 700, color: C.axisDk, align: 'center' });
      chip('north of Gabès', WIN.x + 40, WIN.y + 60, { color: C.acc, size: 32, align: 'left' });
    });
    // a2: climbing in silence; divisions beside them
    A(span(t, s('a2', 0.6), at('a3', 0.6), 0.5, 0.5), () => {
      const u = seg(t, s('a2', 1.0), e('a2', 0.2));
      for (let i = 0; i < 9; i++) {
        const f = Math.max(0, Math.min(1, u * 1.5 - i * 0.06));
        const x = lerp(WIN.x + 300 + i * 10, g.fat[0] - 30 + i * 8, f), y = lerp(g.base + 60, g.fat[1] + 20 + (i % 3) * 10, f);
        ctx.fillStyle = C.allied; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
      }
      chip('4th Indian Division', WIN.x + 40, WIN.y + 60, { color: C.allied, size: 32, align: 'left', a: seg(t, s('a2', 1.6), s('a2', 2.2)) });
      const v = eout(seg(t, s('a2', 3.2), e('a2', 0)));
      trace([[WIN.x + 640, WIN.y + WIN.h - 30], [WIN.x + 640, g.base + 10]], v, C.allied, { w: 10, headSize: 22 });
      trace([[WIN.x + 760, WIN.y + WIN.h - 30], [WIN.x + 760, g.base + 10]], v, C.allied, { w: 10, headSize: 22 });
      chip('51st Highland', WIN.x + WIN.w - 40, WIN.y + 60, { color: C.allied, size: 32, align: 'right', a: seg(t, s('a2', 3.6), s('a2', 4.2)) });
      chip('50th Northumbrian', WIN.x + WIN.w - 40, WIN.y + 130, { color: C.allied, size: 32, align: 'right', a: seg(t, s('a2', 4.0), s('a2', 4.6)) });
    });
    // a3: the Axis withdraws; the Eighth Army meets the Americans
    A(span(t, s('a3', 0.2), s('a4', 0.4), 0.5, 0.5), () => {
      const u = eout(seg(t, s('a3', 1.0), at('a3', 0.5)));
      trace([[WIN.x + 420, g.base - 40], [WIN.x + 420, WIN.y + 120]], u, C.axis, { w: 10, headSize: 22 });
      trace([[WIN.x + 680, g.base - 30], [WIN.x + 680, WIN.y + 140]], u, C.axis, { w: 10, headSize: 22 });
      chip('7 APRIL · the Eighth Army meets the Americans', RCX, WIN.y + WIN.h - 50, { color: C.acc, size: 32, a: seg(t, at('a3', 0.6), at('a3', 0.75)) });
    });
  }));
  // a4: north, more than 200 km; one front
  A(span(t, s('a4', 0.2), s('a5', 0.3), 0.5, 0.5), () => {
    kicker('NORTH, MORE THAN 200 KM', RX, 300);
    ['Gabès', 'Sfax', 'Sousse', 'Enfidaville'].forEach((n, i) => {
      const a = eout(seg(t, s('a4', 0.6 + i * 0.7), s('a4', 1.1 + i * 0.7))), y = 860 - i * 150;
      A(a, () => {
        ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(RX + 40, y, 24, 0, TAU); ctx.fill(); ctx.strokeStyle = C.allied; ctx.lineWidth = 4; ctx.stroke();
        txt(n, RX + 90, y, { size: 44, weight: 700, family: DISPLAY });
        if (i) { ctx.fillStyle = 'rgba(136,194,228,0.6)'; for (let q = 0; q < 6; q++) ctx.fillRect(RX + 37, y + 36 + q * 16, 6, 8); }
      });
    });
    chip('the two fronts become one', RX + RW, 470, { color: C.acc, size: 34, align: 'right', a: seg(t, e('a4', -1.6), e('a4', -1.0)) });
  });
  // a5–a6: the last hills
  A(span(t, s('a5', 0.2), CH[5].at + 1.0, 0.5, 0.6), () => windowFrame(() => {
    const sky = ctx.createLinearGradient(0, WIN.y, 0, WIN.y + WIN.h); sky.addColorStop(0, '#41503a'); sky.addColorStop(1, '#c8b58a');
    ctx.fillStyle = sky; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
    const base = WIN.y + 560;
    ctx.fillStyle = '#9c8461'; ctx.fillRect(WIN.x, base, WIN.w, WIN.h);
    const hills = [
      { x: 190, name: 'Takrouna', when: '19–20 APRIL', who: 'Eighth Army', key: ['a5', 2.4], draw: (x) => { ctx.beginPath(); ctx.moveTo(x - 150, base); ctx.lineTo(x - 70, base - 120); ctx.lineTo(x - 60, base - 230); ctx.lineTo(x + 60, base - 236); ctx.lineTo(x + 74, base - 120); ctx.lineTo(x + 150, base); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(240,232,210,0.9)'; for (let i = 0; i < 5; i++) ctx.fillRect(x - 50 + i * 20, base - 262 + (i % 2) * 6, 16, 26 - (i % 2) * 6); } },
      { x: 500, name: 'Longstop Hill', when: '26 APRIL', who: 'British', key: ['a6', 0.8], draw: (x) => { ctx.beginPath(); ctx.moveTo(x - 190, base); ctx.quadraticCurveTo(x - 110, base - 220, x - 60, base - 200); ctx.quadraticCurveTo(x, base - 150, x + 50, base - 175); ctx.quadraticCurveTo(x + 120, base - 210, x + 190, base); ctx.closePath(); ctx.fill(); } },
      { x: 810, name: 'Hill 609', when: '1 MAY', who: 'Americans', key: [null, 0.42], draw: (x) => { ctx.beginPath(); ctx.moveTo(x - 180, base); ctx.lineTo(x - 90, base - 240); ctx.lineTo(x + 80, base - 250); ctx.lineTo(x + 180, base); ctx.closePath(); ctx.fill(); } },
    ];
    hills.forEach((h) => {
      const t0 = h.key[0] ? s(h.key[0], h.key[1]) : at('a6', h.key[1]);
      const lit = seg(t, t0, t0 + 0.8);
      ctx.fillStyle = lit > 0.5 ? '#5a4630' : 'rgba(90,70,48,0.55)';
      h.draw(WIN.x + h.x);
      A(lit, () => {
        txtFit(h.name, WIN.x + h.x, base + 50, 300, { size: 40, weight: 700, family: DISPLAY, align: 'center' });
        chip(h.when, WIN.x + h.x, base + 112, { color: C.acc, size: 32 });
      });
    });
    A(seg(t, at('a6', 0.75), at('a6', 0.9)), () => txtFit('a heavy cost on both sides', RCX, WIN.y + 70, WIN.w - 80, { size: 36, weight: 600, color: C.ink, align: 'center' }));
  }));
}

// ---------- 6: the end in Africa ----------
function partEnd(t) {
  const zoomA = span(t, s('e1', 0), s('e6', 0.4), 0.6, 0.6);
  if (zoomA > 0) A(zoomA, () => zoomWindow(t, ZN, (Z) => {
    [['tunis', 'Tunis', -20, -28, 'right'], ['bizerte', 'Bizerte', -14, -22, 'right'], ['mateur', 'Mateur', 16, 4, 'left'], ['medjez', 'Medjez el Bab', 14, 24, 'left'],
      ['hammamet', 'Hammamet', 16, 0, 'left'], ['zaghouan', 'Zaghouan', -16, -26, 'right'], ['enfidaville', 'Enfidaville', 16, 22, 'left'], ['hammamlif', 'Hammam-Lif', 18, -28, 'left']].forEach(([key, n, dx, dy, al]) => townDot(PL[key], n, 1, { proj: Z, dx, dy, align: al }));
    mapLabel('CAP BON', [36.88, 10.88], 1, { proj: Z, color: 'rgba(42,38,32,0.6)', size: 32, spacing: '3px', weight: 700, rot: 0.75 });
    // e1: the breakthrough towards Tunis
    const u1 = eio(seg(t, s('e1', 0.6), e('e2', -0.6)));
    trace(smooth([Z([36.66, 9.68]), Z([36.7, 9.9]), Z([36.76, 10.05]), Z([36.8, 10.15])]), u1, C.allied, { w: 12, headSize: 26 });
    chip('First Army', ...Z([36.5, 9.6]), { color: C.allied, size: 32, a: span(t, s('e1', 1.0), s('e3', 0), 0.5, 0.5) });
    // e2: Bizerte, from the American front by Mateur
    trace(smooth([Z([36.95, 9.5]), Z([37.06, 9.68]), Z([37.24, 9.84])]), eio(seg(t, s('e2', 1.6), e('e2', 0))), C.allied, { w: 10, headSize: 22 });
    ring(...Z(PL.tunis), span(t, at('e2', 0.4), s('e3', 0.6), 0.4, 0.6), t, C.acc, 18);
    ring(...Z(PL.bizerte), span(t, at('e2', 0.8), s('e3', 0.6), 0.4, 0.6), t, C.acc, 18);
    // e3: Cap Bon sealed off at Hammam-Lif; the French round Zaghouan
    A(span(t, s('e3', 0.2), s('e5', 0.6), 0.5, 0.6), () => {
      trace(smooth([Z([36.79, 10.2]), Z([36.73, 10.34]), Z([36.55, 10.48]), Z([36.42, 10.58])]), eio(seg(t, s('e3', 1.6), s('e3', 3.6))), C.allied, { w: 10, headSize: 22 });
      const [hx, hy] = Z(PL.hammamlif); heldBar(hx + 6, hy + 8, 0.9, seg(t, s('e3', 2.4), s('e3', 3.0)), C.acc, 60);
      trace(smooth([Z([36.2, 9.75]), Z([36.3, 9.95]), Z([36.38, 10.06])]), eio(seg(t, s('e3', 3.4), e('e3', 0))), C.allied, { w: 10, headSize: 22 });
      trace(smooth([Z([36.58, 9.95]), Z([36.48, 10.08]), Z([36.43, 10.12])]), eio(seg(t, s('e3', 3.8), e('e3', 0.3))), C.allied, { w: 8, headSize: 18 });
      chip('French XIX Corps', ...Z([36.05, 9.5]), { color: C.allied, size: 32, a: seg(t, s('e3', 3.6), s('e3', 4.2)) });
    });
    // e4: the sea watched day and night
    A(span(t, s('e4', 0.2), s('e5', 1.0), 0.5, 0.6), () => {
      ctx.strokeStyle = C.allied; ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.lineDashOffset = -t * 30;
      for (const [la, lo, rx2, ry] of [[37.2, 10.75, 120, 46], [36.95, 11.2, 70, 110], [37.32, 10.2, 90, 30]]) { const [x, y] = Z([la, lo]); ctx.beginPath(); ctx.ellipse(x, y, rx2, ry, 0.3, 0, TAU); ctx.stroke(); }
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
      chip('a few hundred escaped', WIN.x + WIN.w - 24, WIN.y + 60, { color: C.ink, size: 32, align: 'right', a: seg(t, s('e4', 3.2), s('e4', 3.8)) });
    });
    // e5: the last Axis army in Africa surrenders
    A(span(t, s('e5', 1.0), s('e6', 0.4), 0.5, 0.5), () => chip('13 MAY 1943 · Messe surrenders', ...Z([36.05, 10.15]), { color: C.acc, size: 34 }));
  }));
  // e6–e7: whose count of prisoners
  A(span(t, s('e6', 0.2), s('e8', 0.3), 0.5, 0.5), () => {
    kicker('PRISONERS', RX, 300);
    const lo = 200000, hi = 300000, x0 = RX + 40, x1 = RX + RW - 40, y = 600, X = (n) => lerp(x0, x1, (n - lo) / (hi - lo));
    ctx.fillStyle = C.faint; ctx.fillRect(x0, y - 3, x1 - x0, 6);
    [200000, 250000, 300000].forEach((n) => { ctx.fillStyle = C.soft; ctx.fillRect(X(n) - 1.5, y - 14, 3, 28); txt(fmt(n), X(n), y + 44, { size: 32, weight: 600, color: C.soft, align: 'center' }); });
    const band = eio(seg(t, s('e6', 3.6), s('e6', 5.0)));
    if (band > 0) { ctx.fillStyle = 'rgba(201,211,106,0.35)'; ctx.fillRect(X(N.pw0), y - 16, (X(N.pw1) - X(N.pw0)) * band, 32); }
    /** A centred label kept inside the panel. */
    const label = (str, x, yy, o) => { const w = textW(str, o); txt(str, Math.max(RX + w / 2, Math.min(RX + RW - w / 2, x)), yy, { ...o, align: 'center' }); };
    [[N.pw0, 'British official history', 1.6, -1], [N.pw1, 'US Army official historian', 3.4, 1]].forEach(([n, who, d0, side]) => {
      A(seg(t, s('e6', d0), s('e6', d0 + 0.6)), () => {
        const x = X(n);
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + side * 20); ctx.lineTo(x, y + side * (side < 0 ? 110 : 90)); ctx.stroke();
        const ny = side < 0 ? y - 175 : y + 135, wy = side < 0 ? y - 125 : y + 185;
        label(fmt(n), x, side < 0 ? wy : ny, { size: 48, weight: 800, family: DISPLAY });
        label(who, x, side < 0 ? ny : wy, { size: 32, weight: 500, color: C.soft });
      });
    });
    A(seg(t, s('e7', 0.2), s('e7', 1.0)), () => {
      txtFit('about a quarter of a million', RX, 870, RW, { size: 44, weight: 700, family: DISPLAY, color: C.acc });
      txtFit('what historians usually say', RX, 922, RW, { size: 32, weight: 500, color: C.soft });
      const x = X(250000); ctx.strokeStyle = C.acc; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x, y + 20); ctx.stroke();
    });
    chip('compared, in Germany, with Stalingrad', RX + RW, 300, { color: C.grey, size: 32, align: 'right', a: seg(t, s('e7', 3.0), s('e7', 3.6)) });
  });
  // e8–e9: the cost in soldiers' lives, as text with its sources
  A(span(t, s('e8', 0.2), CH[6].at + 1.0, 0.5, 0.6), () => {
    /** Strings drawn side by side, each whole (for the French labels). */
    const row = (parts, x, y, o) => { let cx = x; parts.forEach(([p, oo]) => { const q = { ...o, ...oo }; txt(p, cx, y, q); cx += textW(p, q) + 14; }); };
    const big = { size: 64, weight: 800, family: DISPLAY, color: C.ink }, mid = { size: 36, weight: 600, color: C.ink }, small = { size: 32, weight: 500, color: C.soft };
    A(seg(t, s('e8', 0.4), s('e8', 1.0)), () => {
      card(RX, 280, RW, 320, { line: 'rgba(136,194,228,0.45)' });
      kicker('ALLIES', RX + 36, 330, { color: C.allied });
      row([[fmt(N.cas0), big], ['–', big], [fmt(Math.round(N.cas1 / 1000) * 1000), big]], RX + 36, 420, {});
      txtFit('killed, wounded or missing', RX + 36, 490, RW - 72, mid);
      txtFit('by American and British counts', RX + 36, 536, RW - 72, small);
      A(seg(t, at('e8', 0.75), at('e8', 0.9)), () => row([['more than', mid], [fmt(Math.floor(N.killed / 1000) * 1000), { ...mid, size: 44, weight: 800 }], ['killed', mid]], RX + RW - 420, 420, {}));
    });
    A(seg(t, s('e9', 0.3), s('e9', 0.9)), () => {
      card(RX, 630, RW, 300, { line: 'rgba(222,122,92,0.45)' });
      kicker('GERMANS AND ITALIANS', RX + 36, 680, { color: C.axis });
      txt('less certain', RX + RW - 36, 680, { ...small, align: 'right' });
      A(seg(t, s('e9', 3.4), s('e9', 4.0)), () => {
        row([['about', mid], [fmt(N.axisGer), { ...mid, size: 48, weight: 800 }], ['German dead', mid]], RX + 36, 760, {});
        row([['about', mid], [fmt(N.axisIta), { ...mid, size: 48, weight: 800 }], ['Italian dead', mid]], RX + 36, 830, {});
        txtFit('Rick Atkinson’s estimate', RX + 36, 892, RW - 72, small);
      });
    });
  });
}

// ---------- 7: Tunisia and beyond ----------
function partAfter(t) {
  // p1–p2: the Tunisians
  A(span(t, s('p1', 0.2), s('p3', 0.3), 0.5, 0.5), () => {
    card(RX, 290, RW, 420, { line: 'rgba(201,211,106,0.5)' });
    kicker('THE TUNISIANS', RX + 40, 350);
    txtFit('civilians caught between the two sides', RX + 40, 440, RW - 80, { size: 50, weight: 700, family: DISPLAY });
    A(seg(t, s('p1', 3.6), s('p1', 4.4)), () => txtFit('tremendous losses', RX + 40, 530, RW - 80, { size: 44, weight: 700, color: C.axis }));
    txtFit('Mark Willis, historian, 2015', RX + 40, 640, RW - 80, { size: 32, weight: 500, color: C.soft });
    A(seg(t, s('p2', 0.4), s('p2', 1.0)), () => chip('cities and towns destroyed or badly damaged', RX, 790, { color: C.axis, size: 34, align: 'left' }));
    A(seg(t, s('p2', 3.0), s('p2', 3.6)), () => chip('economy wrecked', RX, 880, { color: C.axis, size: 34, align: 'left' }));
  });
  // p3: forced labour
  A(span(t, s('p3', 0.2), s('p4', 0.3), 0.5, 0.5), () => {
    card(RX, 300, RW, 460, { line: 'rgba(244,239,220,0.35)' });
    kicker('UNDER THE GERMAN OCCUPATION', RX + 40, 360);
    const n = 'about', nw = textW(n, { size: 44, weight: 600 }) + 16;
    txt(n, RX + 40, 470, { size: 44, weight: 600, color: C.soft });
    txt(fmt(N.jews), RX + 40 + nw, 466, { size: 96, weight: 800, family: DISPLAY });
    txtFit('Jewish men forced into labour camps', RX + 40, 570, RW - 80, { size: 44, weight: 700, family: DISPLAY });
    txtFit('many of them near the front', RX + 40, 630, RW - 80, { size: 36, weight: 500, color: C.soft });
    txtFit('US Holocaust Memorial Museum · Mémorial de la Shoah', RX + 40, 710, RW - 80, { size: 32, weight: 500, color: C.soft });
  });
  // p4: the Bey deposed
  A(span(t, s('p4', 0.2), s('p5', 0.3), 0.5, 0.5), () => {
    card(RX, 300, RW, 420, { line: 'rgba(201,211,106,0.5)' });
    kicker('14 MAY 1943', RX + 40, 360);
    txtFit('Moncef Bey deposed by the French', RX + 40, 460, RW - 80, { size: 54, weight: 700, family: DISPLAY });
    txtFit('accused of collaboration', RX + 40, 540, RW - 80, { size: 38, weight: 500, color: C.soft });
    chip('French rule returns', RX + 40, 640, { color: C.grey, size: 34, align: 'left', a: seg(t, s('p4', 0.8), s('p4', 1.4)) });
  });
  // p5: Sicily
  A(span(t, s('p5', 0.2), s('p6', 0.4), 0.5, 0.5), () => windowFrame(() => {
    medBase(SIC.M);
    const M = SIC.M;
    [[[9.9, 37.3], [12.2, 37.0], [13.9, 36.95]], [[10.3, 36.9], [12.6, 36.6], [14.3, 36.85]], [[10.7, 35.9], [13.2, 36.1], [15.0, 36.7]]].forEach((pts, j) => {
      trace(smooth(pts.map((p) => M(p)), 8), eout(seg(t, s('p5', 1.6 + j * 0.4), s('p5', 3.4 + j * 0.4))), C.allied, { w: 9, headSize: 20 });
    });
    txt('Sicily', ...M([14.1, 37.75]), { size: 40, weight: 700, family: DISPLAY, align: 'center' });
    txt('Tunisia', ...M([9.4, 35.2]), { size: 40, weight: 700, family: DISPLAY, color: C.dark, align: 'center' });
    chip('10 JULY 1943', ...M([14.6, 35.6]), { color: C.acc, size: 34, a: seg(t, s('p5', 2.4), s('p5', 3.0)) });
    chip('25 JULY · Mussolini falls', ...M([14.6, 34.85]), { color: C.grey, size: 32, a: seg(t, e('p5', -1.6), e('p5', -1.0)) });
    txt('schematic map', WIN.x + 26, WIN.y + 34, { size: 32, weight: 500, color: C.soft });
  }));
  // p6: the US Army's lessons
  A(span(t, s('p6', 0.2), s('p7', 0.3), 0.5, 0.5), () => {
    kicker('LESSONS', RX, 300);
    const rows = [['units close enough to help each other', 'help'], ['tanks kept together', 'mass'], ['infantry, tanks, guns and aircraft as one team', 'team']];
    rows.forEach(([label, icon], j) => {
      const a = eout(seg(t, s('p6', 1.0 + j * 2.0), s('p6', 1.6 + j * 2.0))), y = 410 + j * 150, ix = RX + 70;
      A(a, () => {
        card(RX, y - 60, RW, 120, { bg: 'rgba(13,16,9,0.85)' });
        ctx.strokeStyle = C.allied; ctx.fillStyle = C.allied; ctx.lineWidth = 4;
        if (icon === 'help') { [[-22, 0], [22, 0]].forEach(([dx]) => { ctx.beginPath(); ctx.arc(ix + dx, y, 30, 0, TAU); ctx.stroke(); }); }
        if (icon === 'mass') { for (let i = 0; i < 6; i++) { k.rrect(ix - 40 + (i % 3) * 28, y - 24 + Math.floor(i / 3) * 28, 22, 20, 4); ctx.fill(); } }
        if (icon === 'team') { for (let i = 0; i < 4; i++) { const a2 = (i / 4) * TAU; ctx.beginPath(); ctx.arc(ix + Math.cos(a2) * 26, y + Math.sin(a2) * 26, 9, 0, TAU); ctx.fill(); } ctx.beginPath(); ctx.arc(ix, y, 26, 0, TAU); ctx.stroke(); }
        txtFit(label, RX + 150, y, RW - 190, { size: 36, weight: 600 });
      });
    });
    A(seg(t, s('p6', 6.0), s('p6', 6.6)), () => txtFit('US Army Center of Military History', RX, 870, RW, { size: 32, weight: 500, color: C.soft }));
  });
  // p7: seasoned soldiers and commanders, on to Sicily
  A(span(t, s('p7', 0.2), s('p8', 0.4), 0.5, 0.5), () => {
    txtFit('thousands of seasoned soldiers', RCX, 400, RW, { size: 60, weight: 700, family: DISPLAY, align: 'center' });
    ['Patton', 'Bradley'].forEach((n, j) => chip(n, RCX - 150 + j * 300, 540, { color: C.allied, size: 40, a: seg(t, s('p7', 2.6 + j * 0.4), s('p7', 3.1 + j * 0.4)) }));
    A(seg(t, s('p7', 4.0), s('p7', 4.6)), () => txtFit('then Sicily', RCX, 660, RW, { size: 44, weight: 600, color: C.acc, align: 'center' }));
  });
  // p8: the end
  const fin = eout(seg(t, s('p8', 0.4), s('p8', 1.8)));
  A(fin, () => title(t, 470 + (1 - fin) * 18, 1));
}

// ---------- title cards and credits ----------
const CARD_SUB = [null, 'November – December 1942', 'January – February 1943', 'February 1943', 'March 1943', 'April 1943', 'May 1943', '1943 and after'];
const CARD_MONTHS = [null, [0, 1], [2, 3], [3], [4], [5], [6], [0, 1, 2, 3, 4, 5, 6]];
function titleCards(t) {
  CH.forEach((ch, i) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.86, () => { ctx.fillStyle = 'rgba(8,10,5,0.93)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8)), y = 470 + (1 - p) * 20;
      txt(`PART ${ch.n}`, W / 2, y - 120, { size: 36, weight: 700, color: C.acc, align: 'center', spacing: '6px' });
      const tt = ch.title.toUpperCase();
      txt(tt, W / 2, y, { size: fit(tt, 1500, 120, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
      const sub = CARD_SUB[ch.n];
      if (sub) txt(sub, W / 2, y + 110, { size: fit(sub, 1400, 48), weight: 600, color: C.soft, align: 'center' });
      // the motif: the seven months, this chapter's lit
      const y2 = y + 210, lit = CARD_MONTHS[ch.n] ?? [];
      MONTHS.forEach((mo, j) => {
        const x = W / 2 - 420 + j * 140, on = lit.includes(j);
        k.rrect(x - 60, y2 - 30, 120, 60, 12); ctx.fillStyle = on ? C.acc : 'rgba(13,16,9,0.9)'; ctx.fill();
        ctx.strokeStyle = C.acc; ctx.lineWidth = 3; ctx.stroke();
        txt(mo, x, y2 + 2, { size: 32, weight: 800, color: on ? C.bg0 : C.acc, align: 'center', spacing: '1px' });
      });
    });
  });
}
const MUSIC = ['“Night Vigil” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Lost Frontier” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Sad Trio” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  'US Army Center of Military History: Algeria-French Morocco; Tunisia (CMH Pubs 72-11, 72-12); G. F. Howe, Northwest Africa.',
  'I. S. O. Playfair, The Mediterranean and Middle East, vol. IV; The National WWII Museum; Martin Blumenson.',
  'Wikipedia: Tunisian campaign; Operation Torch; Run for Tunis; Battle of Kasserine Pass; Battle of the Mareth Line;',
  'Battle of Wadi Akarit; Operation Vulcan; Operation Strike; Allied invasion of Sicily; Moncef Bey; Jean-Pierre Esteva.',
  'Mark W. Willis, The Journal of North African Studies (2015); USHMM; Mémorial de la Shoah; Belkacem Recham.',
  'Map outline: Natural Earth (public domain), simplified.',
];
function credits(t) {
  ctx.fillStyle = '#0b0d07'; ctx.fillRect(0, 0, W, H);
  txt('THE TUNISIAN CAMPAIGN', W / 2, 200, { size: fit('THE TUNISIAN CAMPAIGN', 1600, 84, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
  txt('Tunisia 1943 · original animation', W / 2, 286, { size: 40, weight: 600, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 376, { size: 32, weight: 800, color: C.acc, align: 'center', spacing: '4px' });
  MUSIC.forEach((m, j) => txt(m, W / 2, 426 + j * 44, { size: 32, weight: 500, align: 'center' }));
  const y0 = 426 + Math.max(1, MUSIC.length) * 44 + 50;
  txt('SOURCES', W / 2, y0, { size: 32, weight: 800, color: C.acc, align: 'center', spacing: '4px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, y0 + 50 + j * 46, 1700, { size: 32, weight: 500, align: 'center', color: j > 4 ? C.soft : C.ink }));
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [DISPLAY, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    drawMap(t);
    // the month ribbon: drawn in the cold open as the six months fill, then live from the first chapter
    const ribA = Math.min(seg(t, s('o2', 0.2), s('o2', 1.0)), 1 - seg(t, e('p8', 1.0), e('p8', 2.0)));
    const fillTo = t < CH[0].at ? lerp(CAMPAIGN[0], CAMPAIGN[1], eio(seg(t, s('o2', 0.6), s('o2', 3.4)))) : t > s('p8', 0.2) ? CAMPAIGN[1] : null;
    const markerA = t < CH[0].at ? 0 : 1 - seg(t, s('p8', 0.2), s('p8', 1.0));
    ribbon(t, ribA, { marker: markerA, fillTo, lit: fillTo ? (j) => fillTo >= Date.UTC(1942, 10 + j, 1) : null });
    const parts = [partOpen, partRace, partWinter, partKass, partMareth, partHills, partEnd, partAfter];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    titleCards(t);
    A(seg(t, e('p8', 1.4), e('p8', 2.4)), () => credits(t));
  },
});
