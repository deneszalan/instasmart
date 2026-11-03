// "Remembering 1943" (« Se souvenir de 1943 »): the long film of Tunisia 1943's Remembrance section, 16:9, 1920x1080.
// A schematic map of Tunisia on the left zooms between the whole country, the north and the Gulf of Tunis; the four
// cemeteries are pins with their own marker. On the right, each cemetery has three tabs (WHO RUNS IT, LAYOUT, WHAT IT
// HOLDS) above a drawing: a view of the place, its plan from above, its markers, its numbers, each counted in code.
// Look: the series' map and cards (Fraunces for titles, Barlow for labels) on a deep slate ground with faint rows;
// limestone land, quiet sea; accent colour: oleander rose (#e9a0ae); motif: four grave markers (a cross, a headstone,
// a stele, a stone block), one per cemetery, as map pins and on the title cards. No people, no fighting.
// The same scene plays the French version: kit.js swaps every whole string for its labels-fr.json entry, so words and
// numbers are drawn as separate strings. Map outline: Natural Earth (public domain), simplified; everything else drawn.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const TAU = Math.PI * 2, RAD = Math.PI / 180;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

const C = {
  bg0: '#0f141b', bg1: '#202a35', rows: 'rgba(233,226,212,0.035)',
  sea: '#1b3a4a', sea2: '#23495c', land: '#e7dfcb', land2: '#ddd1b5', neigh: '#3f4955',
  ink: '#f4efe6', soft: 'rgba(244,239,230,0.76)', faint: 'rgba(244,239,230,0.22)', dark: '#2a2722',
  rose: '#e9a0ae', roseDk: '#b8677b', stone: '#efebe1', stone2: '#cfc7b6', sage: '#9cc3a5', lawn: '#5c8459', lawn2: '#77a06c',
  allied: '#8fc1e3', axis: '#de7a5c', gold: '#e8c66e', blue: '#8fc1e3',
  card: 'rgba(12,17,23,0.92)', panel: 'rgba(14,20,27,0.86)',
};
const DISPLAY = 'Fraunces', TEXT = 'Barlow';
// The title's second line: « SE SOUVENIR / DE 1943 » in French ('1943' alone is also a year label elsewhere).
const TITLE2 = window.TR ? 'DE 1943' : '1943';

let k, ctx;
const A = (a, fn) => { if (a > 0) k.alpha(a, fn); };
function txt(str, x, y, { size = 36, weight = 600, family = TEXT, color = C.ink, align = 'left', spacing = '0px', base = 'middle' } = {}) {
  k.font(weight, size, family);
  k.text(str, x, y, { color, align, base, spacing });
}
function textW(str, { size = 36, weight = 600, family = TEXT, spacing = '0px' } = {}) {
  k.font(weight, size, family); ctx.letterSpacing = spacing; const w = ctx.measureText(str).width; ctx.letterSpacing = '0px'; return w;
}
/** The largest size up to `size` at which str fits in maxW. */
function fit(str, maxW, size, o = {}) { let z = size; while (z > 24 && textW(str, { ...o, size: z }) > maxW) z -= 2; return z; }
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** A rounded label as wide as its text (in French, as wide as the French). */
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
function trace(pts, u, col, { w = 8, dash = null, head = true, headSize = 22 } = {}) {
  if (u <= 0) return;
  let tot = 0; const L = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let left = u * tot, tip = pts[0], ang = 0;
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
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
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
/** Mix two colours (#rrggbb) by u. */
const rgbOf = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (c1, c2, u) => { const a = rgbOf(c1), b = rgbOf(c2); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(',')})`; };

// ---------- the four markers (the film's motif) ----------
// y is the foot of the marker, s its height.
function latinCross(x, y, s, col) {
  const w = Math.max(2, s * 0.15);
  ctx.fillStyle = col; ctx.fillRect(x - w / 2, y - s, w, s); ctx.fillRect(x - s * 0.3, y - s * 0.74, s * 0.6, w);
}
function starDavid(x, y, s, col, lw = null) {
  const cx = x, cy = y - s / 2, r = s * 0.5;
  ctx.strokeStyle = col; ctx.lineWidth = lw ?? Math.max(1.5, s * 0.11); ctx.lineJoin = 'round';
  for (const rot of [-Math.PI / 2, Math.PI / 2]) {
    ctx.beginPath();
    for (let i = 0; i < 3; i++) { const a = rot + (i * TAU) / 3; i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    ctx.closePath(); ctx.stroke();
  }
}
function headstone(x, y, s, col) {
  const w = s * 0.62, r = w * 0.5;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - s + r * 0.55);
  ctx.quadraticCurveTo(x - w / 2, y - s, x, y - s); ctx.quadraticCurveTo(x + w / 2, y - s, x + w / 2, y - s + r * 0.55);
  ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
}
/** A stele: round-topped (Jewish and other), pointed-arch (Muslim) or plain. */
function stele(x, y, s, col, top = 'round') {
  const w = s * 0.56;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - w / 2, y);
  if (top === 'pointed') { ctx.lineTo(x - w / 2, y - s * 0.7); ctx.quadraticCurveTo(x - w / 2, y - s * 0.92, x, y - s); ctx.quadraticCurveTo(x + w / 2, y - s * 0.92, x + w / 2, y - s * 0.7); }
  else { ctx.lineTo(x - w / 2, y - s + w / 2); ctx.arc(x, y - s + w / 2, w / 2, Math.PI, TAU); }
  ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
}
/** A stone block, seen a little from above. */
function block(x, y, s, col) {
  const w = s * 1.1, h = s * 0.55, d = s * 0.32;
  ctx.fillStyle = mix(col.startsWith('#') ? col : '#efebe1', '#000000', 0.18); ctx.fillRect(x - w / 2, y - h, w, h);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - w / 2, y - h); ctx.lineTo(x - w / 2 + d, y - h - d); ctx.lineTo(x + w / 2 + d, y - h - d); ctx.lineTo(x + w / 2, y - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = mix(col.startsWith('#') ? col : '#efebe1', '#000000', 0.32); ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y - h); ctx.lineTo(x + w / 2 + d, y - h - d); ctx.lineTo(x + w / 2 + d, y - d); ctx.closePath(); ctx.fill();
}
const KINDS = ['cross', 'headstone', 'stele', 'block'];
function marker(kind, x, y, s, col) {
  if (kind === 'cross') latinCross(x, y, s, col);
  else if (kind === 'headstone') headstone(x, y, s * 0.82, col);
  else if (kind === 'stele') stele(x, y, s * 0.8, col);
  else block(x - s * 0.08, y, s * 0.62, col);
}

// ---------- geography ----------
const hav = ([la1, lo1], [la2, lo2]) => {
  const a = Math.sin((la2 - la1) * RAD / 2) ** 2 + Math.cos(la1 * RAD) * Math.cos(la2 * RAD) * Math.sin((lo2 - lo1) * RAD / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
};
const bearing = ([la1, lo1], [la2, lo2]) => {
  const y = Math.sin((lo2 - lo1) * RAD) * Math.cos(la2 * RAD);
  const x = Math.cos(la1 * RAD) * Math.sin(la2 * RAD) - Math.sin(la1 * RAD) * Math.cos(la2 * RAD) * Math.cos((lo2 - lo1) * RAD);
  return (Math.atan2(y, x) / RAD + 360) % 360;
};
// ABMC brochure (GPS), CWGC, Volksbund; Gammarth on the heights above La Marsa (approximate, schematic).
const CEM = [
  { name: 'Carthage', ll: [36.8653, 10.3313], kind: 'cross', side: 'below', dx: 22 },
  { name: 'Medjez-el-Bab', ll: [36.6267, 9.5704], kind: 'headstone', side: 'below' },
  { name: 'Gammarth', ll: [36.912, 10.284], kind: 'stele', side: 'left' },
  { name: 'Bordj Cedria', ll: [36.6968, 10.3964], kind: 'block', side: 'below' },
];
const TOWNS = { tunis: [36.8065, 10.1815], bizerte: [37.274, 9.874], mateur: [37.04, 9.665], enfidha: [36.1353, 10.3808], sousse: [35.825, 10.636], sfax: [34.74, 10.76], hammamlif: [36.73, 10.335], lamarsa: [36.878, 10.325] };
// The Commission's eight war cemeteries in Tunisia, with their history texts' figures (CWGC, read 2 November 2026).
const CWGC = [
  { name: 'Medjez-el-Bab', ll: [36.62588, 9.57115], n: 2903 },
  { name: 'Massicault', ll: [36.72199, 9.9105], n: 1576 },
  { name: 'Enfidaville', ll: [36.13406, 10.37435], n: 1551 },
  { name: 'Sfax', ll: [34.72069, 10.73326], n: 1253 },
  { name: 'Tabarka Ras Rajel', ll: [36.95336, 8.86642], n: 500 },
  { name: 'Beja', ll: [36.72744, 9.18648], n: 396 },
  { name: 'Oued Zarga', ll: [36.67692, 9.41363], n: 247 },
  { name: 'Thibar Seminary', ll: [36.52748, 9.10518], n: 99 },
];
const CWGC_SUM = CWGC.reduce((a, c) => a + c.n, 0); // 8,525: "about 8,500"
const KM = CEM.map((c) => hav(TOWNS.tunis, c.ll));
const near = (x, to, tol) => Math.abs(x - to) <= tol;
if (!near(CWGC_SUM, 8500, 60) || !near(KM[1], 60, 4) || Math.max(KM[0], KM[2], KM[3]) > 26) {
  throw new Error(`checks: sum ${CWGC_SUM} km ${KM.map(Math.round)}`);
}
// Numbers drawn, from the bodies that run the cemeteries.
const N = {
  abmcGraves: 2833, abmcCross: 2777, abmcStar: 56, abmcMissing: 3724, abmcFeet: 364, abmcAcres: 27,
  cwgcMedjez: 2903, cwgcUnknown: 385, cwgcMemorial: 2000,
  frGraves: 1875, frBoxes: 1220, frEnfidha: 235,
  deDead: 8562, deMissing: 104, deUnknown: 2000,
};
if (N.abmcCross + N.abmcStar !== N.abmcGraves) throw new Error('ABMC headstones');
const FEET_M = Math.round(N.abmcFeet * 0.3048), HA = Math.round(N.abmcAcres * 0.40469); // 111 m, 11 ha
if (FEET_M !== 111) throw new Error('feet');

// ---------- the map (Natural Earth, simplified), with a camera ----------
const MAPDATA = {"TUN":[[[33.181,11.504],[32.902,11.457],[32.637,11.45],[32.507,11.562],[32.435,11.547],[32.369,11.443],[32.136,10.874],[32.004,10.773],[31.962,10.705],[31.974,10.629],[31.954,10.608],[31.84,10.586],[31.744,10.5],[31.715,10.428],[31.715,10.316],[31.68,10.266],[31.518,10.132],[31.428,10.107],[31.079,10.244],[30.986,10.244],[30.915,10.269],[30.842,10.255],[30.731,10.194],[30.641,10.1],[30.354,9.873],[30.331,9.743],[30.229,9.52],[32.072,9.045],[32.105,9.02],[32.526,8.332],[32.837,8.282],[33.095,8.087],[33.108,8.001],[33.184,7.871],[33.208,7.749],[33.232,7.724],[33.414,7.709],[33.659,7.555],[33.801,7.497],[33.894,7.479],[34.095,7.519],[34.199,7.63],[34.245,7.767],[34.414,7.832],[34.53,8.095],[34.637,8.228],[34.681,8.21],[34.763,8.271],[34.902,8.249],[35.067,8.3],[35.241,8.433],[35.29,8.318],[35.326,8.293],[35.403,8.289],[35.508,8.336],[35.621,8.329],[35.685,8.307],[35.751,8.257],[35.827,8.242],[36.036,8.275],[36.146,8.318],[36.244,8.307],[36.351,8.354],[36.43,8.357],[36.469,8.296],[36.491,8.167],[36.526,8.17],[36.663,8.429],[36.732,8.462],[36.768,8.408],[36.785,8.411],[36.803,8.555],[36.837,8.642],[36.94,8.602],[36.974,8.717],[36.979,8.825],[37.021,8.905],[37.153,9.038],[37.193,9.16],[37.234,9.211],[37.235,9.344],[37.276,9.419],[37.267,9.455],[37.31,9.553],[37.3,9.574],[37.345,9.743],[37.328,9.859],[37.271,9.862],[37.213,9.772],[37.154,9.808],[37.149,9.88],[37.197,9.927],[37.213,9.923],[37.234,9.862],[37.227,9.819],[37.262,9.866],[37.246,9.981],[37.266,10.05],[37.178,10.273],[37.159,10.212],[37.175,10.204],[37.171,10.147],[37.159,10.129],[37.143,10.136],[37.129,10.219],[37.095,10.226],[37.11,10.219],[37.077,10.176],[37.028,10.183],[36.977,10.219],[36.881,10.348],[36.822,10.298],[36.847,10.255],[36.839,10.219],[36.798,10.19],[36.786,10.248],[36.817,10.273],[36.749,10.32],[36.73,10.356],[36.729,10.438],[36.756,10.518],[36.773,10.539],[36.864,10.568],[36.896,10.734],[37.006,10.888],[37.05,10.903],[37.087,11.032],[37.063,11.061],[37.021,11.047],[36.918,11.094],[36.871,11.137],[36.854,11.13],[36.788,11.022],[36.452,10.798],[36.378,10.55],[36.337,10.518],[36.217,10.478],[36.112,10.474],[35.981,10.518],[35.922,10.582],[35.842,10.622],[35.77,10.744],[35.78,10.824],[35.766,10.842],[35.734,10.824],[35.699,10.842],[35.638,11.04],[35.614,11.054],[35.603,11.018],[35.555,11.014],[35.518,11.04],[35.506,11.086],[35.459,11.05],[35.334,11.043],[35.266,11.101],[35.238,11.162],[35.219,11.158],[35.206,11.112],[35.093,11.014],[35.033,11.018],[34.957,10.917],[34.873,10.917],[34.838,10.86],[34.797,10.87],[34.768,10.813],[34.655,10.701],[34.633,10.626],[34.532,10.582],[34.497,10.431],[34.424,10.377],[34.414,10.287],[34.372,10.248],[34.304,10.104],[34.213,10.053],[34.171,10.006],[33.983,10.05],[33.828,10.172],[33.684,10.366],[33.647,10.489],[33.706,10.716],[33.671,10.741],[33.603,10.737],[33.546,10.672],[33.483,10.716],[33.485,10.78],[33.539,10.91],[33.575,10.932],[33.617,10.906],[33.637,10.935],[33.627,10.96],[33.644,10.986],[33.618,11.043],[33.541,11.112],[33.49,11.115],[33.455,11.09],[33.392,11.112],[33.363,11.101],[33.372,11.13],[33.331,11.169],[33.287,11.295],[33.311,11.133],[33.281,11.122],[33.222,11.169],[33.184,11.418],[33.206,11.428],[33.259,11.353],[33.181,11.504]],[[33.841,10.993],[33.801,11.061],[33.738,10.971],[33.698,10.957],[33.733,10.957],[33.728,10.942],[33.64,10.888],[33.654,10.87],[33.688,10.878],[33.735,10.809],[33.703,10.78],[33.715,10.741],[33.759,10.726],[33.813,10.748],[33.885,10.737],[33.897,10.773],[33.88,10.899],[33.897,10.932],[33.841,10.993]],[[34.657,10.964],[34.672,10.986],[34.67,11.101],[34.66,11.112],[34.647,11.097],[34.621,11.054],[34.657,10.964]],[[34.773,11.266],[34.743,11.306],[34.73,11.299],[34.664,11.13],[34.681,11.122],[34.728,11.169],[34.758,11.173],[34.751,11.184],[34.748,11.223],[34.782,11.216],[34.826,11.256],[34.806,11.306],[34.773,11.266]]],"NEIGH":[[[30.0,6.0],[36.855,6.0],[36.903,6.197],[36.947,6.255],[37.024,6.273],[37.07,6.338],[37.094,6.417],[37.083,6.503],[37.058,6.543],[36.974,6.601],[36.953,6.82],[36.893,6.91],[36.891,6.975],[36.926,7.094],[36.915,7.133],[36.915,7.159],[36.994,7.256],[37.023,7.252],[37.083,7.18],[37.09,7.223],[37.07,7.274],[37.083,7.382],[37.051,7.403],[37.041,7.457],[37.055,7.49],[36.987,7.591],[36.987,7.673],[36.964,7.713],[36.97,7.771],[36.994,7.799],[36.889,7.774],[36.854,7.868],[36.877,8.051],[36.958,8.231],[36.926,8.289],[36.901,8.462],[36.94,8.602],[36.891,8.609],[36.849,8.642],[36.803,8.555],[36.785,8.411],[36.768,8.408],[36.732,8.462],[36.663,8.429],[36.526,8.17],[36.491,8.167],[36.469,8.296],[36.43,8.357],[36.351,8.354],[36.244,8.307],[36.146,8.318],[36.036,8.275],[35.827,8.242],[35.751,8.257],[35.685,8.307],[35.621,8.329],[35.508,8.336],[35.403,8.289],[35.326,8.293],[35.29,8.318],[35.241,8.433],[35.067,8.3],[34.902,8.249],[34.763,8.271],[34.681,8.21],[34.648,8.235],[34.53,8.095],[34.414,7.832],[34.245,7.767],[34.199,7.63],[34.095,7.519],[33.894,7.479],[33.659,7.555],[33.414,7.709],[33.232,7.724],[33.208,7.749],[33.184,7.871],[33.108,8.001],[33.095,8.087],[32.805,8.296],[32.526,8.332],[32.105,9.02],[32.072,9.045],[30.229,9.52],[30.116,9.286],[30.0,9.383]],[[33.181,11.504],[33.166,11.562],[33.108,11.637],[33.081,11.792],[33.136,11.691],[33.083,11.846],[32.921,12.123],[32.833,12.35],[32.798,12.732],[32.805,12.825],[32.867,13.074],[32.913,13.164],[32.919,13.257],[32.904,13.351],[32.835,13.5],[30.0,13.5],[30.0,9.383],[30.116,9.286],[30.331,9.743],[30.354,9.873],[30.641,10.1],[30.731,10.194],[30.842,10.255],[30.915,10.269],[30.986,10.244],[31.079,10.244],[31.428,10.107],[31.518,10.132],[31.68,10.266],[31.715,10.316],[31.715,10.428],[31.744,10.5],[31.84,10.586],[31.954,10.608],[31.974,10.629],[31.962,10.705],[32.004,10.773],[32.136,10.874],[32.369,11.443],[32.435,11.547],[32.507,11.562],[32.637,11.45],[32.902,11.457],[33.181,11.504]]]};
const MAP = { x: 96, y: 72, w: 624, h: 918 };
const KX0 = 111.32 * Math.cos(35 * RAD) * 1.58, KY0 = 110.57 * 1.58; // the series' scale (tun-visit) at zoom 1
const VIEW = {
  full: { la: 34.9226, lo: 9.9156, z: 1 },
  north: { la: 36.72, lo: 9.984, z: 3.4 },
  northW: { la: 36.72, lo: 9.85, z: 3.4 },
  gulf: { la: 36.80, lo: 10.27, z: 7 },
};
let CAM = VIEW.full;
const P = ([la, lo]) => [MAP.x + MAP.w / 2 + (lo - CAM.lo) * KX0 * CAM.z, MAP.y + MAP.h / 2 - (la - CAM.la) * KY0 * CAM.z];
const kmPx = (km) => (km / 110.57) * KY0 * CAM.z;
/** The camera's keyframes, keyed to lines: each move takes 2.2 s. */
function camera(t) {
  const keys = [
    [0, VIEW.north], [s('a1', 0.3), VIEW.full], [s('a6', 0.1), VIEW.north],
    [CH[1].at + 1.0, VIEW.gulf], [CH[2].at + 1.0, VIEW.northW], [s('m8', 0.1), VIEW.full],
    [CH[3].at + 1.0, VIEW.gulf], [CH[4].at + 1.0, { la: 36.78, lo: 10.29, z: 6.2 }],
    [CH[5].at + 1.0, VIEW.full], [CH[6].at + 1.0, VIEW.north],
  ];
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t0, to] = keys[i];
    if (t < t0) break;
    const u = eio(seg(t, t0, t0 + 2.2)), from = v;
    v = { la: lerp(from.la, to.la, u), lo: lerp(from.lo, to.lo, u), z: Math.exp(lerp(Math.log(from.z), Math.log(to.z), u)) };
  }
  return v;
}
/** How zoomed in the camera is, 0 (whole country) to 1 (the gulf). */
const zoomness = () => clamp(Math.log(CAM.z) / Math.log(7));
function ringPath(r) {
  const pts = r.map(P), n = pts.length;
  ctx.beginPath(); ctx.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  ctx.closePath();
}
function mapBase() {
  const sg = ctx.createLinearGradient(0, MAP.y, 0, MAP.y + MAP.h); sg.addColorStop(0, C.sea2); sg.addColorStop(1, C.sea);
  ctx.fillStyle = sg; ctx.fillRect(MAP.x, MAP.y, MAP.w, MAP.h);
  // faint lines on the sea, as on a chart
  ctx.strokeStyle = 'rgba(233,226,212,0.05)'; ctx.lineWidth = 2;
  for (let y = MAP.y + 30; y < MAP.y + MAP.h; y += 46) { ctx.beginPath(); ctx.moveTo(MAP.x, y); ctx.lineTo(MAP.x + MAP.w, y); ctx.stroke(); }
  ctx.fillStyle = C.neigh; ctx.strokeStyle = C.neigh; ctx.lineWidth = 8; ctx.lineJoin = 'round';
  for (const r of MAPDATA.NEIGH) { ringPath(r); ctx.fill(); ctx.stroke(); }
  const lg = ctx.createLinearGradient(0, MAP.y, 0, MAP.y + MAP.h); lg.addColorStop(0, '#ece5d3'); lg.addColorStop(1, '#ddd1b5');
  ctx.fillStyle = lg;
  for (const r of MAPDATA.TUN) { ringPath(r); ctx.fill(); }
  ctx.strokeStyle = 'rgba(42,38,32,0.45)'; ctx.lineWidth = 2;
  for (const r of MAPDATA.TUN) { ringPath(r); ctx.stroke(); }
}
function townDot(ll, name, a, { dx = 14, dy = 0, align = 'left', color = C.dark, size = 32, r = 6 } = {}) {
  if (a <= 0) return;
  const [x, y] = P(ll);
  A(a, () => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (name) {
      k.font(600, size, TEXT); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(236,229,211,0.85)'; ctx.lineJoin = 'round';
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
/** A cemetery's pin: its marker in a disc; lit = filled with the accent. */
function pin(i, { a = 1, lit = 0, t = 0, name = 0 } = {}) {
  if (a <= 0) return;
  const c = CEM[i], [x, y] = P(c.ll), r = CAM.z < 3.4 ? lerp(7, 17, clamp((CAM.z - 1) / 2.4)) : lerp(17, 21, clamp((CAM.z - 3.4) / 3.6));
  A(a, () => {
    if (lit > 0) A(lit, () => {
      const p = (t * 0.7) % 1;
      ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.globalAlpha *= 1 - p;
      ctx.beginPath(); ctx.arc(x, y, r + 2 + p * 26, 0, TAU); ctx.stroke();
    });
    ctx.fillStyle = lit > 0.5 ? C.rose : C.bg0; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = C.rose; ctx.stroke();
    if (r > 12) marker(c.kind, x, y + r * 0.55, r * 1.05, lit > 0.5 ? C.bg0 : C.rose);
    if (name > 0) A(name, () => {
      const dx = c.side === 'right' ? r + 12 : c.side === 'left' ? -r - 12 : (c.dx ?? 0), dy = c.side === 'below' ? r + 26 : 0;
      const al = c.side === 'right' ? 'left' : c.side === 'left' ? 'right' : 'center';
      k.font(700, 32, TEXT); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(15,20,27,0.85)'; ctx.lineJoin = 'round';
      ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.strokeText(c.name, x + dx, y + dy);
      txt(c.name, x + dx, y + dy, { size: 32, weight: 700, color: C.ink, align: al });
    });
  });
}
const cwgcIcon = (x, y, sz, col) => { ctx.fillStyle = 'rgba(15,20,27,0.85)'; ctx.beginPath(); ctx.arc(x, y, sz * 0.7, 0, TAU); ctx.fill(); headstone(x, y + sz * 0.42, sz * 0.85, col); };
// The Axis-held north and east, November 1942 to May 1943 (schematic; the front moved).
const AXIS_ZONE = [[37.6, 9.5], [37.0, 9.45], [36.62, 9.62], [36.3, 9.85], [35.75, 9.75], [35.0, 9.62], [34.35, 9.45], [33.7, 9.75], [33.3, 10.4], [33.0, 11.6], [37.6, 11.6]];
// The war's field graves and temporary cemeteries, schematic: seeded points in the north and east, where they fought.
const FIELD = (() => {
  const r = rng(11), out = [];
  while (out.length < 70) {
    const la = 33.4 + r() * 3.9, lo = 8.4 + r() * 2.4;
    if (lo < 8.6 + (37.3 - la) * 0.0 && la > 36.9) continue;
    if (la < 34.2 && lo < 9.6) continue;
    if (lo > 10.2 + (la - 33.4) * 0.12 && la < 36.0) continue;
    out.push([la, lo]);
  }
  return out;
})();
/** In the last chapter, a pin is lit while its ceremony is named. */
function lit7(i, t) {
  const L = [
    [['r2', 1.0, 'r2', 3.4], ['r5', 0.2, 'r6', 0.2]],
    [['r3', 2.6, 'r4', 0.2]],
    [['r2', -2.4, 'r3', 0.4], ['r3', 0.6, 'r3', 2.6]],
    [['r4', 0.2, 'r5', 0.2]],
  ][i];
  return Math.min(1, L.reduce((m, [k0, d0, k1, d1]) => Math.max(m, span(t, d0 < 0 ? e(k0, d0) : s(k0, d0), s(k1, d1), 0.4, 0.4)), 0));
}
const SITES_1943 = [['Tunis', TOWNS.tunis], ['Bizerte', TOWNS.bizerte], ['Mateur', TOWNS.mateur], ['Enfidaville', TOWNS.enfidha]];
function drawMap(t) {
  CAM = camera(t);
  ctx.save(); k.rrect(MAP.x, MAP.y, MAP.w, MAP.h, 22); ctx.clip();
  mapBase();
  const zf = zoomness(), full = 1 - clamp(zf * 2.5);
  mapLabel('ALGERIA', [35.4, 7.93], full, { color: 'rgba(244,239,230,0.6)', size: 32, rot: -Math.PI / 2 });
  mapLabel('LIBYA', [32.72, 11.86], full, { color: 'rgba(244,239,230,0.6)', size: 32, rot: -Math.PI / 2 });
  mapLabel('TUNISIA', [34.95, 9.25], full * span(t, s('a1', 0.4), s('a2', 0.6), 0.6, 0.6), { color: 'rgba(42,38,32,0.55)', size: 40, spacing: '8px', weight: 700 });
  mapLabel('Gulf of Tunis', [37.06, 10.42], clamp((zf - 0.75) * 5), { color: 'rgba(244,239,230,0.7)', size: 32, spacing: '1px', weight: 600 });

  // ---- chapter 1: the occupied north and east; field graves gathered to the cemeteries
  const c1 = span(t, s('a2', 0.2), s('a5', 0.6), 0.8, 0.8);
  if (c1 > 0) A(c1 * 0.9, () => {
    ctx.save(); for (const r of MAPDATA.TUN) ringPath(r); ctx.clip();
    ctx.beginPath(); AXIS_ZONE.forEach((p, i) => (i ? ctx.lineTo(...P(p)) : ctx.moveTo(...P(p)))); ctx.closePath();
    ctx.fillStyle = 'rgba(222,122,92,0.22)'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(222,122,92,0.5)'; ctx.lineWidth = 3;
    for (let d = -900; d < 1400; d += 22) { ctx.beginPath(); ctx.moveTo(MAP.x + d, MAP.y); ctx.lineTo(MAP.x + d + 700, MAP.y + 700 * 1.3); ctx.stroke(); }
    ctx.restore(); ctx.restore();
    A(seg(t, s('a2', 1.2), s('a2', 1.8)), () => {
      chip('held by the Axis', ...P([35.3, 10.95]), { color: C.axis, size: 32, align: 'right' });
    });
  });
  const tw = span(t, s('a3', 0.2), s('a5', 0.4), 0.6, 0.6);
  if (tw > 0) {
    const towns = [TOWNS.tunis, TOWNS.bizerte, [36.45, 10.735], TOWNS.sousse, [35.678, 10.1], [35.5, 11.06], TOWNS.sfax, [33.883, 10.117], [33.875, 10.857], [33.355, 10.505], [36.18, 8.71], [36.73, 9.18], [34.425, 8.784], [35.17, 8.83], [35.77, 10.83], [36.4, 10.14], [33.92, 8.13], [36.95, 8.76], [35.03, 9.48], [36.08, 9.37], [34.3, 10.08]];
    towns.forEach((ll, i) => {
      const a = tw * seg(t, s('a3', 0.2 + i * 0.12), s('a3', 0.6 + i * 0.12));
      A(a, () => { const [x, y] = P(ll); ctx.fillStyle = C.dark; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill(); ctx.strokeStyle = C.roseDk; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.stroke(); });
    });
  }
  // a5: field graves appear, then are gathered towards the cemeteries near Tunis
  const fg = span(t, s('a5', 0.0), s('a6', 0.6), 0.6, 0.6);
  if (fg > 0) A(fg, () => {
    const g = eio(seg(t, s('a5', 2.4), e('a5', 0.2)));
    FIELD.forEach((ll, i) => {
      const a = seg(t, s('a5', 0.1 + (i % 23) * 0.05), s('a5', 0.4 + (i % 23) * 0.05));
      if (a <= 0) return;
      const to = CEM[i % 4].ll, [x0, y0] = P(ll), [x1, y1] = P(to);
      const x = lerp(x0, x1, g), y = lerp(y0, y1, g);
      A(a * (1 - 0.7 * g), () => { ctx.fillStyle = '#6d6455'; ctx.fillRect(x - 3, y - 7, 6, 14); ctx.fillRect(x - 6, y - 3, 12, 4); });
    });
    A(seg(t, s('a5', 0.6), s('a5', 1.2)) * (1 - seg(t, s('a5', 2.2), s('a5', 2.8))), () => chip('field graves', ...P([33.75, 9.0]), { color: C.ink, size: 32 }));
  });
  // a6: the four within about 60 km of Tunis
  const ring = span(t, s('a6', 1.6), s('c1', 0), 0.6, 0.6);
  if (ring > 0) A(ring, () => {
    const [x, y] = P(TOWNS.tunis);
    ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.setLineDash([10, 10]);
    ctx.beginPath(); ctx.arc(x, y, kmPx(60) * eio(seg(t, s('a6', 1.6), s('a6', 3.0))), 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  });

  // ---- chapter 3: the front at Medjez, December 1942 to April 1943 (schematic)
  const c3 = span(t, s('m1', 0.2), s('m3', 0.4), 0.6, 0.6);
  if (c3 > 0) A(c3, () => {
    trace([P([36.7, 9.28]), P([36.65, 9.5])], eout(seg(t, s('m1', 0.6), s('m1', 2.2))), C.allied, { w: 9, headSize: 20 });
    A(seg(t, s('m1', 2.0), s('m1', 2.6)), () => {
      ctx.strokeStyle = C.axis; ctx.lineWidth = 6; ctx.setLineDash([12, 8]); ctx.beginPath();
      [[37.05, 9.45], [36.85, 9.58], [36.66, 9.66], [36.45, 9.72], [36.25, 9.8]].forEach((p, i) => (i ? ctx.lineTo(...P(p)) : ctx.moveTo(...P(p)))); ctx.stroke(); ctx.setLineDash([]);
      chip('front, winter 1942–43', MAP.x + 24, P([36.3, 9.4])[1], { color: C.axis, size: 32, align: 'left' });
    });
  });
  // m8–m9: the Commission's eight war cemeteries
  const c8 = span(t, s('m8', 1.2), CH[3].at + 1.0, 0.5, 0.6);
  if (c8 > 0) A(c8, () => {
    CWGC.forEach((c, j) => {
      const a = seg(t, s('m8', 1.4 + j * 0.3), s('m8', 1.8 + j * 0.3));
      A(a, () => { const [x, y] = P(c.ll); cwgcIcon(x, y, 19, C.stone); });
    });
    A(seg(t, s('m8', 4.0), s('m8', 4.6)), () => {
      townDot(CWGC[4].ll, 'Tabarka', 1, { dx: 0, dy: 36, align: 'center', r: 0 });
      townDot(CWGC[3].ll, 'Sfax', 1, { dx: -28, dy: 0, align: 'right', r: 0 });
    });
  });

  // ---- chapter 6: forced labour sites (FRUS, June 1943), and towns bombed
  const lab = span(t, s('w6', 0.2), s('w9', 0.4), 0.6, 0.6);
  if (lab > 0) A(lab, () => {
    SITES_1943.forEach(([name, ll], j) => {
      const a = seg(t, s('w6', 0.6 + j * 0.4), s('w6', 1.0 + j * 0.4)), [x, y] = P(ll);
      A(a, () => {
        for (let r = 0; r < 2; r++) { const p = ((t * 0.5 + r * 0.5 + j * 0.2) % 1); ctx.strokeStyle = `rgba(244,239,230,${0.5 * (1 - p)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 12 + p * 30, 0, TAU); ctx.stroke(); }
        ctx.fillStyle = C.rose; ctx.fillRect(x - 8, y - 8, 16, 16); ctx.strokeStyle = C.bg0; ctx.lineWidth = 2; ctx.strokeRect(x - 8, y - 8, 16, 16);
      });
      const dx = name === 'Bizerte' ? 22 : name === 'Mateur' ? -22 : 22, al = name === 'Mateur' ? 'right' : 'left';
      townDot(ll, name, a, { dx, dy: name === 'Enfidaville' ? 0 : 0, align: al, r: 0 });
    });
  });
  const bomb = span(t, s('w9', 0.2), s('w12', 0.4), 0.6, 0.6);
  if (bomb > 0) A(bomb, () => {
    [['Bizerte', TOWNS.bizerte], ['Sousse', TOWNS.sousse]].forEach(([name, ll], j) => {
      const a = seg(t, s(j ? 'w10' : 'w9', 0.4), s(j ? 'w10' : 'w9', 1.0)), [x, y] = P(ll);
      A(a, () => {
        for (let r = 0; r < 3; r++) { const p = ((t * 0.45 + r / 3) % 1); ctx.strokeStyle = `rgba(232,198,110,${0.75 * (1 - p)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10 + p * 40, 0, TAU); ctx.stroke(); }
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
      });
      townDot(ll, name, a, { dx: 26, align: 'left', r: 0 });
    });
  });

  // ---- the four cemeteries
  const cur = CH.findIndex((c, i) => t >= c.at + 1 && (i + 1 >= CH.length || t < CH[i + 1].at + 1)); // chapter index
  townDot(TOWNS.tunis, 'Tunis', Math.max(clamp((zf - 0.4) * 4) * (1 - span(t, s('m8', 0.2), CH[3].at + 1, 0.6, 0.6)), 0) * (1 - span(t, CH[5].at + 1, CH[6].at + 1, 0.6, 0.6)), { dx: -12, dy: 0, align: 'right' });
  townDot(TOWNS.hammamlif, 'Hammam-Lif', span(t, s('b1', 1.0), s('b11', 0.4), 0.6, 0.6), { dx: -14, dy: 0, align: 'right' });
  CEM.forEach((c, i) => {
    const openA = seg(t, s(`o${i + 1}`, 0.2), s(`o${i + 1}`, 0.8));
    const inCh = cur === i + 1 ? span(t, CH[i + 1].at + 1, (CH[i + 2]?.at ?? DURATION) + 1, 0.5, 0.5) : 0;
    const openLit = t < CH[0].at + 1 ? span(t, s(`o${i + 1}`, 0.2), s(i < 3 ? `o${i + 2}` : 'o6', 0.2), 0.4, 0.4) : 0;
    const lit = Math.max(inCh, openLit, cur === 6 ? lit7(i, t) : 0);
    const vis = Math.max(openA, t > s('o6') ? 1 : 0) * (1 - span(t, s('a1', 0.4), s('a5', 0.4), 0.6, 0.6)) * (1 - span(t, s('m8', 0.4), CH[3].at + 1, 0.6, 0.6)) * (1 - span(t, CH[5].at + 1, CH[6].at + 1, 0.6, 0.6));
    const name = Math.max(clamp((zf - 0.3) * 4) * (cur === i + 1 || t < CH[0].at + 1 || t > s('a6') && t < CH[1].at + 1 || cur === 6 ? 1 : 0), 0);
    pin(i, { a: vis, lit: Math.min(1, lit), t, name });
  });
  ctx.restore();
  chip('schematic map', MAP.x + 12, MAP.y + 32, { size: 32, weight: 500, color: 'rgba(244,239,230,0.7)', align: 'left', line: false, bg: 'rgba(15,20,27,0.6)' });
  ctx.strokeStyle = 'rgba(233,160,174,0.5)'; ctx.lineWidth = 3; k.rrect(MAP.x, MAP.y, MAP.w, MAP.h, 22); ctx.stroke();
}

// ---------- the right-hand panel ----------
const RX = 800, RW = 1000, RCX = RX + RW / 2;
const WIN = { x: 800, y: 250, w: 1000, h: 700 };
/** Draw fn in the window's own coordinates (0..1000 × 0..700), clipped, with a frame. */
function windowFrame(fn, { line = 'rgba(233,160,174,0.5)' } = {}) {
  ctx.save(); k.rrect(WIN.x, WIN.y, WIN.w, WIN.h, 22); ctx.clip(); ctx.translate(WIN.x, WIN.y); fn(); ctx.restore();
  ctx.strokeStyle = line; ctx.lineWidth = 3; k.rrect(WIN.x, WIN.y, WIN.w, WIN.h, 22); ctx.stroke();
}
const PLACE = ['North Africa American Cemetery', 'Medjez-el-Bab War Cemetery', 'French military cemetery, Gammarth', 'German war cemetery, Bordj Cedria'];
/** The cemetery's header: its number, its name, and three tabs, the current one lit. */
function header(t, i, tabs) {
  txt('CEMETERY', RX, 112, { size: 32, weight: 700, color: C.rose, spacing: '4px' });
  const wS = textW('CEMETERY', { size: 32, weight: 700, spacing: '4px' });
  txt(String(i + 1), RX + wS + 12, 112, { size: 32, weight: 800, color: C.rose });
  txt('/', RX + wS + 34, 112, { size: 32, weight: 500, color: C.soft });
  txt('4', RX + wS + 50, 112, { size: 32, weight: 700, color: C.soft });
  txtFit(PLACE[i], RX, 190, RW, { size: 60, weight: 700, family: DISPLAY, color: C.ink });
  const lit = tabs.map(([, from], j) => {
    const on = seg(t, s(from, -0.1), s(from, 0.4));
    const next = tabs.filter(([, f2]) => s(f2) > s(from)).map(([, f2]) => seg(t, s(f2, -0.1), s(f2, 0.4)));
    return on * (1 - Math.max(0, ...next));
  });
  let x = RX + RW;
  for (let j = tabs.length - 1; j >= 0; j--) {
    const str = tabs[j][0], w = textW(str, { size: 32, weight: 700 }) + 40;
    x -= w;
    const l = lit[j];
    k.rrect(x, 86, w, 52, 26);
    ctx.fillStyle = l > 0 ? `rgba(233,160,174,${0.15 + 0.85 * l})` : 'rgba(15,20,27,0.8)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = C.rose; ctx.stroke();
    txt(str, x + w / 2, 113, { size: 32, weight: 700, color: l > 0.5 ? C.bg0 : C.rose, align: 'center' });
    x -= 14;
  }
}
const TABS = [
  [['WHO RUNS IT', 'c2'], ['LAYOUT', 'c4'], ['WHAT IT HOLDS', 'c5']],
  [['WHO RUNS IT', 'm3'], ['LAYOUT', 'm5'], ['WHAT IT HOLDS', 'm4']],
  [['WHO RUNS IT', 'g9'], ['LAYOUT', 'g5'], ['WHAT IT HOLDS', 'g3']],
  [['WHO RUNS IT', 'b8'], ['LAYOUT', 'b6'], ['WHAT IT HOLDS', 'b2']],
];
/** Chips laid left to right from x, as wide as their text, wrapping at the panel's right edge. */
function chipRow(list, x, y, { color = C.ink, size = 34, gap = 16, right = RX + RW, dy = 70, t = 0, key = null, d0 = 0, step = 0.8 } = {}) {
  let cx = x, cy = y;
  list.forEach((str, j) => {
    const w = textW(str, { size, weight: 700 }) + size * 1.24;
    if (cx + w > right && cx > x) { cx = x; cy += dy; }
    chip(str, cx, cy, { color, size, align: 'left', a: key ? seg(t, s(key, d0 + j * step), s(key, d0 + 0.5 + j * step)) : 1 });
    cx += w + gap;
  });
}
/** Chips in a row centred on cx, each as wide as its text. */
function chipsCentered(list, cx, y, { color = C.ink, size = 34, gap = 28, t = 0, key = null, d0 = 0, step = 0.8 } = {}) {
  const ws = list.map((str) => textW(str, { size, weight: 700 }) + size * 1.24), tot = ws.reduce((a, b) => a + b, 0) + gap * (list.length - 1);
  let x = cx - tot / 2;
  list.forEach((str, j) => { chip(str, x, y, { color, size, align: 'left', a: key ? seg(t, s(key, d0 + j * step), s(key, d0 + 0.5 + j * step)) : 1 }); x += ws[j] + gap; });
}
/** A card in the window: a big number and a label under it. */
function numberCard(x, y, w, n, label, { a = 1, color = C.rose, size = 96, sub = null, h = null } = {}) {
  A(a, () => {
    const hh = h ?? (sub ? 220 : 180);
    card(x, y, w, hh, { bg: 'rgba(15,20,27,0.88)', line: 'rgba(233,160,174,0.45)' });
    txt(fmt(n), x + w / 2, y + 74, { size, weight: 800, family: DISPLAY, color, align: 'center' });
    txtFit(label, x + w / 2, y + 140, w - 40, { size: 34, weight: 600, color: C.ink, align: 'center' });
    if (sub) txtFit(sub, x + w / 2, y + 184, w - 40, { size: 32, weight: 500, color: C.soft, align: 'center' });
  });
}
/** A label with a thin leader line to a point. */
function callout(str, x, y, px, py, a, { color = C.ink, size = 32, align = 'left', bg = 'rgba(15,20,27,0.85)' } = {}) {
  if (a <= 0) return;
  A(a, () => {
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU); ctx.fill();
    chip(str, x, y, { color, size, align, bg });
  });
}
function runBy(str, sub, a) {
  A(a, () => {
    const w = Math.max(textW(str, { size: 38, weight: 700 }), textW(sub, { size: 32, weight: 500 })) + 60;
    card(30, 520, Math.min(940, w), 140, { bg: 'rgba(15,20,27,0.9)', line: 'rgba(233,160,174,0.6)' });
    txt('RUN BY', 60, 552, { size: 32, weight: 800, color: C.rose, spacing: '3px' });
    txtFit(str, 60, 596, 880, { size: 38, weight: 700 });
    txtFit(sub, 60, 636, 880, { size: 32, weight: 500, color: C.soft });
  });
}

// ---------- views of the four cemeteries (window coordinates; schematic) ----------
function sky(top, bottom, h = 700) { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, h); }
function cypress(x, y, h, col = '#1f3527') { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y - h / 2, h * 0.13, h / 2, 0, 0, TAU); ctx.fill(); }
/** Carthage at dusk: lawns, rows of white crosses with a few Stars of David, a pool, trees, the sea beyond. */
function viewCarthage() {
  sky('#2d3654', '#e9b38c', 300);
  ctx.fillStyle = '#3e6c86'; ctx.fillRect(0, 250, 1000, 50);
  ctx.fillStyle = 'rgba(255,230,200,0.35)'; for (let i = 0; i < 14; i++) ctx.fillRect(30 + i * 70, 262 + (i % 3) * 10, 30, 2);
  ctx.fillStyle = '#27412f'; for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.ellipse(i * 40 + 10, 300, 34, 20 + (i % 3) * 6, 0, Math.PI, TAU); ctx.fill(); }
  const lg = ctx.createLinearGradient(0, 300, 0, 700); lg.addColorStop(0, '#46704a'); lg.addColorStop(1, '#6b9761'); ctx.fillStyle = lg; ctx.fillRect(0, 298, 1000, 402);
  // a pool where the paths cross
  ctx.fillStyle = '#9ec5d3'; ctx.beginPath(); ctx.ellipse(500, 405, 120, 18, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#d9d2c2'; ctx.fillRect(380, 404, 240, 4);
  for (let r = 0; r < 8; r++) {
    const d = r / 7, y = 318 + 380 * d ** 1.6, sc = 0.3 + 1.05 * d ** 1.3, n = Math.round(20 - r * 1.6);
    for (let i = 0; i < n; i++) {
      const x = 500 + (i - (n - 1) / 2) * 62 * sc * 1.5;
      if ((r === 2 || r === 3) && Math.abs(x - 500) < 150) continue;
      const star = (r * 7 + i * 5) % 29 === 3;
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x - 10 * sc, y, 20 * sc, 3 * sc);
      if (star) starDavid(x, y - 6 * sc, 34 * sc, '#f6f3ec', 4 * sc); else latinCross(x, y, 46 * sc, '#f6f3ec');
    }
  }
}
/** Medjez-el-Bab: a lawn, rows of matching headstones, the Cross of Sacrifice at the far end between the memorial's pergolas. */
function viewMedjez() {
  sky('#a9c7d8', '#efe9d8', 330);
  ctx.fillStyle = '#86a07a'; ctx.fillRect(0, 290, 1000, 40);
  // the memorial: pergolas of stone columns either side of the Cross
  ctx.fillStyle = '#e4ddcc';
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 140 : 560;
    ctx.fillRect(x0, 236, 300, 14);
    for (let i = 0; i <= 8; i++) ctx.fillRect(x0 + 4 + i * 36, 250, 9, 56);
    ctx.fillStyle = '#d6cdb8'; ctx.fillRect(x0, 300, 300, 10); ctx.fillStyle = '#e4ddcc';
  }
  ctx.fillStyle = '#f3efe5'; ctx.fillRect(492, 130, 16, 180); ctx.fillRect(462, 170, 76, 14); ctx.fillStyle = '#d9d2c2'; ctx.fillRect(470, 300, 60, 12);
  const lg = ctx.createLinearGradient(0, 310, 0, 700); lg.addColorStop(0, '#5f8a57'); lg.addColorStop(1, '#79a46b'); ctx.fillStyle = lg; ctx.fillRect(0, 310, 1000, 390);
  // the central avenue
  ctx.fillStyle = 'rgba(232,226,210,0.35)'; ctx.beginPath(); ctx.moveTo(470, 312); ctx.lineTo(530, 312); ctx.lineTo(640, 700); ctx.lineTo(360, 700); ctx.closePath(); ctx.fill();
  for (let r = 0; r < 7; r++) {
    const d = r / 6, y = 330 + 360 * d ** 1.55, sc = 0.32 + 1.0 * d ** 1.3, n = Math.round(16 - r * 1.2);
    for (const side of [-1, 1]) for (let i = 0; i < n / 2; i++) {
      const x = 500 + side * (110 * sc + 60 + i * 64 * sc * 1.35);
      if (x < -30 || x > 1030) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x - 13 * sc, y, 26 * sc, 3 * sc);
      headstone(x, y, 44 * sc, '#f3efe6');
    }
  }
  return { cross: [500, 140], pergola: [290, 270] };
}
/** Gammarth: a hillside of white crosses and steles in rows, the sea on the left. */
function viewGammarth() {
  sky('#9fb9cf', '#f2dcc2', 300);
  ctx.fillStyle = '#4a7f97'; ctx.fillRect(0, 262, 1000, 70);
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; for (let i = 0; i < 9; i++) ctx.fillRect(20 + i * 50, 280 + (i % 3) * 14, 24, 2);
  // the hillside, rising to the right
  const hill = (x) => 360 - 0.22 * x;
  ctx.fillStyle = '#7d9466'; ctx.beginPath(); ctx.moveTo(0, 700); ctx.lineTo(0, hill(0)); for (let x = 0; x <= 1000; x += 50) ctx.lineTo(x, hill(x) - 8 * Math.sin(x * 0.01)); ctx.lineTo(1000, 700); ctx.closePath(); ctx.fill();
  const lg = ctx.createLinearGradient(0, 200, 0, 700); lg.addColorStop(0, 'rgba(120,150,100,0)'); lg.addColorStop(1, 'rgba(95,130,80,0.9)'); ctx.fillStyle = lg; ctx.fillRect(0, 150, 1000, 550);
  [[640, 210, 120], [700, 196, 140], [930, 150, 130], [140, 360, 110]].forEach(([x, y, h]) => cypress(x, y + 20, h));
  for (let r = 0; r < 7; r++) {
    const sc = 0.42 + r * 0.14, y0 = 330 + r * 54 + r * r * 3;
    for (let i = 0; i < 16; i++) {
      const x = 60 + i * 60 + (r % 2) * 30, y = y0 - 0.2 * x + 40;
      if (y < hill(x) + 24) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x - 10 * sc, y, 20 * sc, 3 * sc);
      if ((i + r * 3) % 5 === 2) stele(x, y, 40 * sc, '#f3efe6'); else latinCross(x, y, 48 * sc, '#f3efe6');
    }
  }
}
/** Bordj Cedria at dusk: six stone courtyards stepping up a hillside, from lower right to upper left; no graves. */
const COURTS = [[690, 560], [560, 492], [700, 420], [430, 412], [560, 336], [420, 262]];
function viewCedria(t, { num = 0, glow = 0 } = {}) {
  sky('#2c2b40', '#d79b6e', 330);
  ctx.fillStyle = '#4b4636'; ctx.beginPath(); ctx.moveTo(0, 700); ctx.lineTo(0, 210); ctx.quadraticCurveTo(260, 150, 520, 230); ctx.quadraticCurveTo(800, 330, 1000, 420); ctx.lineTo(1000, 700); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5f5a43'; ctx.beginPath(); ctx.moveTo(0, 700); ctx.lineTo(0, 300); ctx.quadraticCurveTo(300, 240, 600, 330); ctx.quadraticCurveTo(820, 400, 1000, 520); ctx.lineTo(1000, 700); ctx.closePath(); ctx.fill();
  [[200, 330, 150], [240, 345, 120], [880, 500, 140], [930, 520, 110], [330, 300, 120]].forEach(([x, y, h]) => cypress(x, y, h, '#1d2a20'));
  // steps up the slope
  ctx.strokeStyle = '#b9ab8d'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(780, 690); for (const [x, y] of COURTS) ctx.lineTo(x - 40, y + 30); ctx.stroke();
  COURTS.forEach(([x, y], j) => {
    const w = 210 - j * 10, d = 70 - j * 4, h = 40 - j * 2;
    ctx.fillStyle = '#8f8670'; ctx.fillRect(x - w / 2, y, w, h);                      // front wall
    ctx.fillStyle = '#c9bea2'; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2 + d * 0.6, y - d * 0.5); ctx.lineTo(x + w / 2 + d * 0.6, y - d * 0.5); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill(); // floor
    ctx.strokeStyle = '#7a7260'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2 + d * 0.6, y - d * 0.5); ctx.lineTo(x + w / 2 + d * 0.6, y - d * 0.5); ctx.stroke();
    ctx.fillStyle = '#9b927a'; ctx.fillRect(x - w / 2 + d * 0.6 - 4, y - d * 0.5 - 14, w, 14);   // back wall
    if (glow > 0) A(glow, () => { ctx.fillStyle = 'rgba(233,160,174,0.35)'; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2 + d * 0.6, y - d * 0.5); ctx.lineTo(x + w / 2 + d * 0.6, y - d * 0.5); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill(); });
    if (num > 0) A(num * seg(t, s('b6', 0.6 + j * 0.35), s('b6', 1.0 + j * 0.35)), () => {
      ctx.fillStyle = C.rose; ctx.beginPath(); ctx.arc(x + d * 0.3, y - d * 0.25, 22, 0, TAU); ctx.fill();
      txt(String(j + 1), x + d * 0.3, y - d * 0.25 + 2, { size: 32, weight: 800, color: C.bg0, align: 'center' });
    });
  });
  // the central courtyard's stone
  ctx.fillStyle = '#e7e0cf'; ctx.fillRect(500, 304, 34, 20);
  return { stone: [517, 304], court: COURTS[0] };
}
const VIEWS = [viewCarthage, viewMedjez, viewGammarth, viewCedria];
const OPEN_NAMES = ['Carthage', 'Medjez-el-Bab', 'Gammarth', 'Bordj Cedria'];

// ---------- cold open ----------
function partOpen(t) {
  const keys = ['o1', 'o2', 'o3', 'o4', 'o6'];
  for (let i = 0; i < 4; i++) {
    const a = span(t, s(keys[i], -0.2), i < 3 ? s(keys[i + 1], 0.5) : s('o6', 1.6), 0.6, 0.6);
    A(a, () => {
      windowFrame(() => { VIEWS[i](t, {}); chip(OPEN_NAMES[i], 30, 50, { color: C.ink, size: 34, align: 'left' }); });
    });
  }
  // o6: the title, beside the map, until the first chapter card
  const ti = eout(seg(t, s('o6', 1.6), s('o6', 2.8)));
  A(ti, () => {
    txt('REMEMBERING', RCX, 420 + (1 - ti) * 18, { size: fit('REMEMBERING', 980, 120, { weight: 800, family: DISPLAY, spacing: '4px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '4px' });
    txt(TITLE2, RCX, 560 + (1 - ti) * 18, { size: fit(TITLE2, 980, 120, { weight: 800, family: DISPLAY, spacing: '4px' }), weight: 800, family: DISPLAY, color: C.rose, align: 'center', spacing: '4px' });
    KINDS.forEach((kind, j) => marker(kind, RCX - 150 + j * 100, 686, 46, C.rose));
    txtFit('Four war cemeteries in Tunisia, and the dead without one', RCX, 760, 960, { size: 40, weight: 600, color: C.soft, align: 'center' });
  });
}

// ---------- 1: the war and its dead ----------
function partWar(t) {
  A(span(t, s('a1', 0.2), s('a2', 0.3), 0.5, 0.5), () => {
    card(860, 330, 880, 300, { line: 'rgba(233,160,174,0.6)' });
    txt('1942–1943', RCX, 400, { size: 44, weight: 800, color: C.rose, align: 'center' });
    txtFit('A French protectorate', RCX, 476, 820, { size: 60, weight: 700, family: DISPLAY, align: 'center' });
    txtFit('under the Bey of Tunis', RCX, 556, 820, { size: 40, weight: 500, color: C.soft, align: 'center' });
  });
  A(span(t, s('a2', 0.2), s('a3', 0.3), 0.5, 0.5), () => {
    txt('Axis', RX + 60, 330, { size: 40, weight: 800, color: C.axis, spacing: '3px' });
    ['Germany', 'Italy'].forEach((n, j) => chip(n, RX + 60, 410 + j * 76, { color: C.axis, size: 36, align: 'left', a: seg(t, s('a2', 0.6 + j * 0.3), s('a2', 1.0 + j * 0.3)) }));
    txt('Allies', RX + 520, 330, { size: 40, weight: 800, color: C.allied, spacing: '3px' });
    ['Britain', 'the Commonwealth', 'United States', 'France'].forEach((n, j) => chip(n, RX + 520, 410 + j * 76, { color: C.allied, size: 36, align: 'left', a: seg(t, s('a2', 2.6 + j * 0.35), s('a2', 3.0 + j * 0.35)) }));
  });
  A(span(t, s('a3', 0.2), s('a5', 0.2), 0.5, 0.5), () => {
    txtFit('Tunisians of every faith', RCX, 380, 960, { size: 56, weight: 700, family: DISPLAY, align: 'center' });
    ['Muslims', 'Jews', 'Christians'].forEach((n, j) => chip(n, RCX + (j - 1) * 290, 490, { color: C.rose, size: 38, a: seg(t, s('a3', 1.0 + j * 0.4), s('a3', 1.5 + j * 0.4)) }));
    ['the occupation', 'the bombing', 'the fighting'].forEach((n, j) => A(seg(t, s('a3', 3.4 + j * 0.5), s('a3', 3.9 + j * 0.5)), () => txtFit(n, RCX + (j - 1) * 320, 610, 300, { size: 36, weight: 500, color: C.soft, align: 'center' })));
  });
  // a5: gathered, and marked
  A(span(t, s('a5', 0.1), s('a6', 0.3), 0.5, 0.5), () => {
    txtFit('Gathered and marked', RCX, 330, 960, { size: 56, weight: 700, family: DISPLAY, align: 'center' });
    chipsCentered(['field graves', 'makeshift cemeteries'], RCX, 440, { color: C.ink, size: 34, t, key: 'a5', d0: 0.6, step: 0.6 });
    KINDS.forEach((kind, j) => {
      const x = RX + 125 + j * 250, ap = eout(seg(t, s('a5', 2.6 + j * 0.35), s('a5', 3.0 + j * 0.35)));
      A(ap, () => marker(kind, x, 650 + (1 - ap) * 14, 130, C.stone));
    });
    A(seg(t, s('a5', 3.6), s('a5', 4.2)), () => txtFit('each country, its own way', RCX, 730, 960, { size: 38, weight: 500, color: C.soft, align: 'center' }));
  });
  // a6: the four, and how far each lies from Tunis (computed)
  A(span(t, s('a6', 0.3), CH[1].at + 1.0, 0.5, 0.6), () => {
    txt(fmt(60), RX, 220, { size: 96, weight: 800, family: DISPLAY, color: C.rose });
    const w60 = textW(fmt(60), { size: 96, weight: 800, family: DISPLAY });
    txt('km', RX + w60 + 16, 236, { size: 44, weight: 700, color: C.soft });
    txtFit('from Tunis, at most', RX, 300, 980, { size: 38, weight: 500, color: C.soft });
    const order = [0, 2, 3, 1];
    order.forEach((i, j) => {
      const a = eout(seg(t, s('a6', 0.8 + j * 0.45), s('a6', 1.3 + j * 0.45))), y = 410 + j * 124;
      A(a, () => {
        card(RX, y - 50, RW, 100, { bg: 'rgba(15,20,27,0.85)', line: 'rgba(233,160,174,0.4)' });
        ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(RX + 54, y, 32, 0, TAU); ctx.fill(); ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.stroke();
        marker(CEM[i].kind, RX + 54, y + 18, 36, C.rose);
        txtFit(CEM[i].name, RX + 110, y + 2, 520, { size: 40, weight: 700 });
        const km = String(Math.round(KM[i]));
        txt('km', RX + RW - 30, y + 4, { size: 34, weight: 700, color: C.soft, align: 'right' });
        txt(km, RX + RW - 30 - textW('km', { size: 34, weight: 700 }) - 12, y + 2, { size: 44, weight: 800, color: C.rose, align: 'right' });
      });
    });
  });
}

// ---------- 2: Carthage ----------
// The plan, from above (after ABMC's brochure; schematic): nine plots A–I north of the mall; the memorial at its west
// end; the Tablets of the Missing on its south side; pools where the paths cross. Marks computed: 2,833, of them 56 stars.
const PLAN = { x: 60, y: 40, w: 880, h: 420, gap: 26 };
const PLOTS = (() => {
  const pw = (PLAN.w - 2 * PLAN.gap) / 3, ph = (PLAN.h - 2 * PLAN.gap) / 3, out = [];
  const letters = [['G', 'D', 'A'], ['H', 'E', 'B'], ['I', 'F', 'C']]; // as in the brochure's drawing, north up
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) out.push({ x: PLAN.x + c * (pw + PLAN.gap), y: PLAN.y + r * (ph + PLAN.gap), w: pw, h: ph, L: letters[c][r] });
  return out;
})();
const GRAVES = (() => {
  const out = [], cols = 21, rows = 15;
  PLOTS.forEach((p, j) => {
    const n = j < 8 ? 315 : N.abmcGraves - 8 * 315;
    for (let i = 0; i < n; i++) { const c = i % cols, r = Math.floor(i / cols); out.push([p.x + 8 + (c + 0.5) * ((p.w - 16) / cols), p.y + 6 + (r + 0.6) * ((p.h - 12) / rows)]); }
  });
  const rr = rng(1943), star = new Set();
  while (star.size < N.abmcStar) star.add(Math.floor(rr() * out.length));
  return out.map((p, i) => [...p, star.has(i)]);
})();
if (GRAVES.length !== N.abmcGraves || GRAVES.filter((g) => g[2]).length !== N.abmcStar) throw new Error('graves');
function planCarthage(t, { marks = 0, stars = 0, wall = 0, letters = 0 } = {}) {
  ctx.fillStyle = '#1b232c'; ctx.fillRect(0, 0, 1000, 700);
  ctx.fillStyle = '#d8d0bf'; ctx.fillRect(PLAN.x - 14, PLAN.y - 14, PLAN.w + 28, PLAN.h + 28);
  for (const p of PLOTS) { ctx.fillStyle = '#5d8a57'; ctx.fillRect(p.x, p.y, p.w, p.h); }
  // pools at the four inner crossings
  for (const [cx, cy] of [[1, 1], [2, 1], [1, 2], [2, 2]]) {
    const x = PLAN.x + cx * (PLAN.w / 3) + (cx - 1.5) * 0, y = PLAN.y + cy * (PLAN.h / 3);
    ctx.fillStyle = '#8fc0d2'; ctx.beginPath(); ctx.arc(x - (cx === 1 ? 4 : -4), y, 18, 0, TAU); ctx.fill();
  }
  if (letters > 0) A(letters, () => PLOTS.forEach((p) => txt(p.L, p.x + p.w / 2, p.y + p.h / 2 + 2, { size: 56, weight: 800, family: DISPLAY, color: 'rgba(255,255,255,0.28)', align: 'center' })));
  // the mall, the memorial at its west end, the tablets on its south side
  ctx.fillStyle = '#cfc6b3'; ctx.fillRect(PLAN.x - 14, 500, PLAN.w + 28, 70);
  ctx.fillStyle = '#e9e3d4'; ctx.fillRect(PLAN.x - 40, 470, 80, 130);
  ctx.fillStyle = 'rgba(40,50,40,0.5)'; for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.arc(PLAN.x + 80 + i * 52, 535, 12, 0, TAU); ctx.fill(); }
  const wl = PLAN.x + 60, wr = PLAN.x + PLAN.w + 10;
  ctx.fillStyle = wall > 0 ? mix('#b8b0a0', '#e9a0ae', wall) : '#b8b0a0'; ctx.fillRect(wl, 574, (wr - wl), 10);
  if (marks > 0) {
    const n = Math.floor(GRAVES.length * marks);
    for (let i = 0; i < n; i++) {
      const [x, y, st] = GRAVES[i];
      if (st && stars > 0) { ctx.fillStyle = C.rose; ctx.beginPath(); ctx.arc(x, y - 3, 4.5, 0, TAU); ctx.fill(); }
      else { ctx.fillStyle = '#f6f3ec'; ctx.fillRect(x - 1, y - 7, 2.4, 9); ctx.fillRect(x - 3.2, y - 5, 6.4, 2); }
    }
  }
  return { wall: [wl, wr, 579], memorial: [PLAN.x, 535] };
}
/** The Tablets of the Missing, close up: panels of names (unreadable lines); a few rosettes. */
function viewWall(t, { fill = 1, rosettes = 0 } = {}) {
  sky('#26303d', '#3b4653');
  ctx.fillStyle = '#e8e2d3'; ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(1000, 230); ctx.lineTo(1000, 560); ctx.lineTo(0, 640); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7c8c6c'; ctx.beginPath(); ctx.moveTo(0, 640); ctx.lineTo(1000, 560); ctx.lineTo(1000, 700); ctx.lineTo(0, 700); ctx.closePath(); ctx.fill();
  const rr = rng(7);
  for (let p = 0; p < 9; p++) {
    const x0 = 30 + p * 108, sc = 1 - p * 0.035;
    const top = lerp(170, 238, (x0 + 50) / 1000), bot = lerp(620, 552, (x0 + 50) / 1000);
    ctx.strokeStyle = 'rgba(120,110,95,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 - 6, top); ctx.lineTo(x0 - 6, bot); ctx.stroke();
    const rows = Math.floor((bot - top - 20) / 13);
    for (let r = 0; r < rows; r++) {
      if ((p * rows + r) / (9 * rows) > fill) break;
      const y = top + 14 + r * 13, w = (40 + rr() * 50) * sc;
      ctx.fillStyle = 'rgba(90,82,70,0.55)'; ctx.fillRect(x0 + 6, y, w, 4);
      if (rosettes > 0 && (p * 31 + r * 7) % 41 === 5) A(rosettes, () => {
        ctx.fillStyle = C.gold; for (let q = 0; q < 6; q++) { const a = (q * TAU) / 6; ctx.beginPath(); ctx.arc(x0 + Math.cos(a) * 5, y + 2 + Math.sin(a) * 5, 4.5, 0, TAU); ctx.fill(); }
        ctx.fillStyle = '#9c7a2c'; ctx.beginPath(); ctx.arc(x0, y + 2, 3.5, 0, TAU); ctx.fill();
      });
    }
  }
}
function partCarthage(t) {
  header(t, 0, TABS[0]);
  const vA = span(t, s('c1', -0.4), s('c4', 0.4), 0.6, 0.6);
  A(vA, () => windowFrame(() => {
    viewCarthage();
    callout('part of Roman Carthage', 960, 190, 760, 280, span(t, s('c1', 2.0), s('c2', 0.2), 0.5, 0.5), { color: C.ink, align: 'right' });
    runBy('American Battle Monuments Commission', 'an agency of the US government', span(t, s('c2', 0.4), s('c3', 0.2), 0.5, 0.5));
    // c3: 1948, the land, 1960
    A(span(t, s('c3', 0.2), s('c4', 0.4), 0.5, 0.5), () => {
      card(30, 470, 940, 200, { bg: 'rgba(15,20,27,0.9)', line: 'rgba(233,160,174,0.6)' });
      const yy = 560, x0 = 120, x1 = 880;
      ctx.fillStyle = C.faint; ctx.fillRect(x0, yy - 3, x1 - x0, 6);
      [[x0, '1948', 'set up', 'c3', 0.4], [x1, '1960', 'dedicated', 'c3', 3.4]].forEach(([x, y1, l, key, d]) => A(seg(t, s(key, d), s(key, d + 0.5)), () => {
        ctx.fillStyle = C.rose; ctx.beginPath(); ctx.arc(x, yy, 12, 0, TAU); ctx.fill();
        txt(y1, x, yy - 46, { size: 40, weight: 800, color: C.rose, align: 'center' });
        txt(l, x, yy + 44, { size: 32, weight: 600, color: C.ink, align: 'center' });
      }));
      A(seg(t, s('c3', 1.8), s('c3', 2.4)), () => txtFit('land granted by Tunisia, free, for ever', 500, 512, 640, { size: 32, weight: 600, color: C.soft, align: 'center' }));
    });
  }));
  // c4–c7: the plan
  const pA = span(t, s('c4', 0.0), s('c8', 0.4), 0.6, 0.6);
  A(pA, () => windowFrame(() => {
    const marks = eio(seg(t, s('c4', 1.4), s('c4', 4.4)));
    const pl = planCarthage(t, { marks, stars: seg(t, s('c5', 0.2), s('c5', 0.8)), wall: seg(t, s('c7', 0.3), s('c7', 1.0)), letters: span(t, s('c4', 0.6), s('c5', 0.2), 0.5, 0.5) });
    A(span(t, s('c4', 0.3), s('c5', 0.2), 0.5, 0.5), () => {
      let x = 40;
      [[fmt(N.abmcAcres), C.rose], ['acres', C.ink], [fmt(HA), C.rose], ['ha', C.ink], ['9 plots', C.ink]].forEach(([str, col], j) => {
        x += chip(str, x, 650, { color: col, size: 34, align: 'left', line: j === 4 }) + (j === 1 || j === 3 ? 26 : 4);
      });
    });
    // c5: crosses and stars, counted
    A(span(t, s('c5', 0.2), s('c7', 0.2), 0.5, 0.5), () => {
      card(560, 600, 420, 90, { bg: 'rgba(15,20,27,0.9)', line: 'rgba(233,160,174,0.5)' });
      latinCross(600, 668, 46, '#f6f3ec'); txt(fmt(N.abmcCross), 630, 646, { size: 40, weight: 800 });
      starDavid(800, 666, 40, C.rose, 5); txt(fmt(N.abmcStar), 834, 646, { size: 40, weight: 800, color: C.rose });
    });
    // c6: from North Africa to the Persian Gulf
    A(span(t, s('c6', 0.2), s('c7', 0.2), 0.5, 0.5), () => {
      card(30, 600, 510, 90, { bg: 'rgba(15,20,27,0.9)', line: 'rgba(143,193,227,0.5)' });
      txtFit('North Africa', 60, 632, 200, { size: 32, weight: 700, color: C.blue });
      txtFit('Persian Gulf', 510, 632, 200, { size: 32, weight: 700, color: C.blue, align: 'right' });
      trace([[70, 668], [500, 668]], eout(seg(t, s('c6', 1.4), s('c6', 3.4))), C.blue, { w: 5, headSize: 14 });
    });
    // c7: the wall along the mall
    A(span(t, s('c7', 0.3), s('c8', 0.4), 0.5, 0.5), () => {
      const [wl, wr, wy] = pl.wall;
      ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wl, wy + 22); ctx.lineTo(wl, wy + 40); ctx.lineTo(wr, wy + 40); ctx.lineTo(wr, wy + 22); ctx.stroke();
      chip('Tablets of the Missing', 500, 646, { color: C.rose, size: 34, bg: 'rgba(15,20,27,0.95)' });
      const ft = fmt(N.abmcFeet), m = fmt(FEET_M), wm = textW('m', { size: 32, weight: 600 });
      txt(ft, 60, 646, { size: 34, weight: 800, color: C.ink }); txt('ft', 60 + textW(ft, { size: 34, weight: 800 }) + 8, 646, { size: 32, weight: 600, color: C.soft });
      txt('m', 940, 646, { size: 32, weight: 600, color: C.soft, align: 'right' }); txt(m, 940 - wm - 8, 646, { size: 34, weight: 800, color: C.ink, align: 'right' });
    });
  }));
  // c8–c9: the names; more than the graves
  const wA = span(t, s('c8', 0.0), CH[2].at + 1.0, 0.6, 0.6);
  A(wA, () => windowFrame(() => {
    viewWall(t, { fill: eio(seg(t, s('c8', 0.4), s('c8', 3.4))), rosettes: seg(t, s('c9', 0.6), s('c9', 1.4)) });
    A(seg(t, s('c8', 1.4), s('c8', 2.0)), () => {
      card(30, 30, 940, 150, { bg: 'rgba(15,20,27,0.92)', line: 'rgba(233,160,174,0.5)' });
      const max = N.abmcMissing, bw = 520;
      [['names of the missing', N.abmcMissing, C.rose], ['graves', N.abmcGraves, C.stone]].forEach(([l, n, col], j) => {
        const y = 72 + j * 62, u = eout(seg(t, s('c8', 1.6 + j * 0.4), s('c8', 2.6 + j * 0.4)));
        txtFit(l, 60, y, 270, { size: 32, weight: 600, color: C.soft });
        ctx.fillStyle = col; ctx.fillRect(340, y - 14, bw * (n / max) * u, 28);
        txt(fmt(n), 340 + bw * (n / max) * u + 14, y + 1, { size: 36, weight: 800, color: col });
      });
    });
    A(seg(t, s('c9', 1.2), s('c9', 1.8)), () => chip('found and identified since', 500, 650, { color: C.gold, size: 34, bg: 'rgba(15,20,27,0.92)' }));
  }));
}

// ---------- 3: Medjez-el-Bab ----------
/** The front at Medjez, Nov 1942 to May 1943, as a strip of months. */
function frontStrip(t) {
  ctx.fillStyle = '#1b232c'; ctx.fillRect(0, 0, 1000, 700);
  const M = ['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'], x0 = 80, x1 = 920, mx = (m) => lerp(x0, x1, m / 7), y = 360;
  ctx.fillStyle = C.faint; ctx.fillRect(x0, y - 3, x1 - x0, 6);
  M.forEach((m, j) => { ctx.fillStyle = C.soft; ctx.fillRect(mx(j) - 1.5, y - 14, 3, 28); txt(m, (mx(j) + mx(j + 1)) / 2, y + 46, { size: 32, weight: 700, color: C.soft, align: 'center', spacing: '2px' }); });
  ctx.fillStyle = C.soft; ctx.fillRect(mx(7) - 1.5, y - 14, 3, 28);
  txt('1942', mx(0), y - 50, { size: 32, weight: 700, color: C.rose }); txt('1943', mx(2), y - 50, { size: 32, weight: 700, color: C.rose });
  const u = eio(seg(t, s('m1', 2.4), e('m1', -1.0)));
  ctx.fillStyle = C.axis; ctx.fillRect(mx(1.2), y - 10, (mx(5.4) - mx(1.2)) * u, 20);
  A(seg(t, s('m1', 1.8), s('m1', 2.4)), () => txtFit('front line at Medjez-el-Bab', 500, 200, 880, { size: 44, weight: 700, family: DISPLAY, color: C.ink, align: 'center' }));
  A(seg(t, e('m1', -1.6), e('m1', -1.0)), () => chip('Allied advances', mx(5.9), 520, { color: C.allied, size: 34 }));
}
/** The cemetery as a grid of marks, one per ten burials (CWGC figures): 290 marks, 39 of them for the unidentified. */
const PER = 10, MARKS = Math.round(N.cwgcMedjez / PER), UNK = Math.round(N.cwgcUnknown / PER);
const UNK_SET = (() => { const r = rng(385), set = new Set(); while (set.size < UNK) set.add(Math.floor(r() * MARKS)); return set; })();
function gridMedjez(t) {
  ctx.fillStyle = '#1b232c'; ctx.fillRect(0, 0, 1000, 700);
  ctx.fillStyle = '#5c8459'; ctx.fillRect(60, 60, 880, 400);
  const cols = 29, rows = 10, u = seg(t, s('m4', 0.4), s('m4', 3.0)), un = seg(t, s('m4', 4.0), s('m4', 4.8));
  for (let i = 0; i < MARKS; i++) {
    if (i >= u * MARKS) break;
    const c = i % cols, r = Math.floor(i / cols), x = 92 + c * 29.5, y = 104 + r * 38;
    headstone(x, y + 14, 26, UNK_SET.has(i) && un > 0 ? mix('#efebe1', '#e9a0ae', un) : '#efebe1');
  }
  A(seg(t, s('m4', 1.0), s('m4', 1.6)), () => { headstone(90, 540, 34, '#efebe1'); txt('=', 120, 528, { size: 36, weight: 700, color: C.soft }); txt(fmt(PER), 150, 528, { size: 36, weight: 800 }); txt('burials', 150 + textW(fmt(PER), { size: 36, weight: 800 }) + 12, 528, { size: 34, weight: 600, color: C.soft }); });
  numberCard(560, 490, 200, N.cwgcMedjez, 'servicemen', { a: seg(t, s('m4', 1.2), s('m4', 1.8)), size: 64, h: 180 });
  numberCard(780, 490, 190, N.cwgcUnknown, 'unidentified', { a: un, size: 64, h: 180 });
}
/** A CWGC headstone, close up (schematic: no real name). */
function headstoneClose(t) {
  ctx.fillStyle = '#26303b'; ctx.fillRect(0, 0, 1000, 700);
  ctx.fillStyle = '#5f8a57'; ctx.fillRect(0, 560, 1000, 140);
  const x = 330, y = 600, sc = 1;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x - 130, y, 260, 12);
  headstone(x, y, 500, '#f1ede3');
  ctx.strokeStyle = '#b9b2a2'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y - 400, 46, 0, TAU); ctx.stroke(); // the badge
  ctx.fillStyle = '#b9b2a2'; for (let i = 0; i < 4; i++) ctx.fillRect(x - (90 - i * 12), y - 320 + i * 30, (180 - i * 24), 8); // name, rank, unit, date
  latinCross(x, y - 120, 80, '#b9b2a2'); // a religious symbol
  ctx.fillRect(x - 70, y - 70, 140, 6); ctx.fillRect(x - 54, y - 52, 108, 6); // words from the family
  callout('a badge', 640, 190, x + 46, y - 400, seg(t, s('m5', 2.4), s('m5', 3.0)));
  callout('a name', 640, 300, x + 90, y - 300, seg(t, s('m5', 3.2), s('m5', 3.8)));
  callout('a religious symbol', 640, 420, x + 30, y - 160, seg(t, s('m5', 4.0), s('m5', 4.6)));
  A(seg(t, s('m5', 0.6), s('m5', 1.2)), () => { txtFit('all alike', 640, 560, 340, { size: 44, weight: 700, family: DISPLAY, color: C.rose }); txtFit('any rank, race or faith', 640, 610, 340, { size: 32, weight: 600, color: C.soft }); });
  void sc;
}
/** The Medjez-el-Bab Memorial: panels of names in pergolas, either side of the Cross of Sacrifice. */
function viewMemorial(t) {
  sky('#9fbfd1', '#ece6d6', 420);
  ctx.fillStyle = '#76a06a'; ctx.fillRect(0, 420, 1000, 280);
  ctx.fillStyle = '#f3efe5'; ctx.fillRect(490, 110, 20, 300); ctx.fillRect(452, 160, 96, 18); ctx.fillStyle = '#d9d2c2'; ctx.fillRect(470, 400, 60, 16);
  const fillU = eio(seg(t, s('m7', 0.8), s('m7', 4.0)));
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 40 : 580;
    ctx.fillStyle = '#e4ddcc'; ctx.fillRect(x0, 200, 380, 18);
    for (let i = 0; i <= 5; i++) ctx.fillRect(x0 + 6 + i * 72, 218, 14, 220);
    for (let p = 0; p < 5; p++) {
      const px = x0 + 26 + p * 72;
      ctx.fillStyle = '#ece6d8'; ctx.fillRect(px, 240, 46, 180);
      for (let r = 0; r < 20; r++) { if ((p + (side > 0 ? 5 : 0) + r / 20) / 10 > fillU) break; ctx.fillStyle = 'rgba(90,82,70,0.5)'; ctx.fillRect(px + 6, 248 + r * 8.4, 22 + ((p * 13 + r * 7) % 14), 3); }
    }
    ctx.fillStyle = '#d6cdb8'; ctx.fillRect(x0, 436, 380, 12);
  }
  numberCard(250, 500, 500, N.cwgcMemorial, 'names, no known grave', { a: seg(t, s('m7', 1.2), s('m7', 1.8)), size: 72, h: 170 });
  A(seg(t, s('m7', 1.2), s('m7', 1.8)), () => { const w = textW(fmt(N.cwgcMemorial), { size: 72, weight: 800, family: DISPLAY }); txt('almost', 500 - w / 2 - 14, 568, { size: 32, weight: 600, color: C.soft, align: 'right' }); });
  A(seg(t, s('m7', 3.4), s('m7', 4.0)), () => { chip('First Army', 120, 60, { color: C.allied, size: 32, align: 'left' }); chip('Eighth Army', 880, 60, { color: C.allied, size: 32, align: 'right' }); });
}
/** The Commission's eight war cemeteries, as bars, and their sum (computed). */
function listCWGC(t) {
  ctx.fillStyle = '#1b232c'; ctx.fillRect(0, 0, 1000, 700);
  const max = CWGC[0].n, bw = 440;
  CWGC.forEach((c, j) => {
    const y = 60 + j * 60, a = eout(seg(t, s('m8', 1.4 + j * 0.3), s('m8', 2.0 + j * 0.3)));
    A(a, () => {
      cwgcIcon(46, y, 22, C.stone);
      txtFit(c.name, 80, y, 300, { size: 32, weight: 600, color: C.ink });
      ctx.fillStyle = j === 0 ? C.rose : C.stone2; ctx.fillRect(400, y - 12, bw * (c.n / max) * a, 24);
      txt(fmt(c.n), 400 + bw * (c.n / max) * a + 12, y + 1, { size: 32, weight: 800, color: j === 0 ? C.rose : C.ink });
    });
  });
  A(seg(t, e('m8', -1.8), e('m8', -1.2)), () => {
    ctx.fillStyle = C.faint; ctx.fillRect(40, 548, 920, 3);
    txtFit('in all, by the Commission’s figures', 40, 610, 520, { size: 34, weight: 600, color: C.soft });
    const tot = Math.round(lerp(0, CWGC_SUM, eout(seg(t, e('m8', -1.8), e('m8', -0.2)))));
    txt(fmt(tot), 960, 608, { size: 80, weight: 800, family: DISPLAY, color: C.rose, align: 'right' });
  });
}
function partMedjez(t) {
  header(t, 1, TABS[1]);
  const fA = span(t, s('m1', -0.4), s('m3', 0.4), 0.6, 0.6);
  A(fA, () => windowFrame(() => frontStrip(t)));
  const vA = span(t, s('m3', 0.0), s('m4', 0.4), 0.6, 0.6);
  A(vA, () => windowFrame(() => {
    const v = viewMedjez();
    callout('Cross of Sacrifice', 640, 80, v.cross[0] + 10, v.cross[1] + 20, seg(t, s('m3', 2.2), s('m3', 2.8)), { color: C.bg0, bg: 'rgba(244,239,230,0.92)' });
    runBy('Commonwealth War Graves Commission', 'for Britain and the Commonwealth', seg(t, s('m3', 3.4), s('m3', 4.0)));
  }));
  A(span(t, s('m4', 0.0), s('m5', 0.4), 0.6, 0.6), () => windowFrame(() => gridMedjez(t)));
  A(span(t, s('m5', 0.0), s('m7', 0.4), 0.6, 0.6), () => windowFrame(() => headstoneClose(t)));
  A(span(t, s('m7', 0.0), s('m8', 0.6), 0.6, 0.6), () => windowFrame(() => viewMemorial(t)));
  A(span(t, s('m8', 0.2), CH[3].at + 1.0, 0.6, 0.6), () => windowFrame(() => listCWGC(t)));
}

// ---------- 4: Gammarth ----------
/** The French army's dead, buried by faith: Gammarth, and Muslim cemeteries (schematic diagram). */
function faithDiagram(t) {
  ctx.fillStyle = '#1b232c'; ctx.fillRect(0, 0, 1000, 700);
  const g2 = span(t, s('g2', 0.0), s('g3', 0.3), 0.5, 0.5);
  A(g2, () => {
    txtFit('The French army in Tunisia', 500, 90, 900, { size: 46, weight: 700, family: DISPLAY, align: 'center' });
    const L = ['Tunisian', 'Algerian', 'Moroccan'];
    L.forEach((n, j) => chip(n, 200 + j * 300, 230, { color: C.rose, size: 36, a: seg(t, s('g2', 1.6 + j * 0.4), s('g2', 2.0 + j * 0.4)) }));
    A(seg(t, s('g2', 3.0), s('g2', 3.6)), () => txt('tirailleurs', 500, 320, { size: 40, weight: 600, family: DISPLAY, color: C.ink, align: 'center' }));
    chip('Europeans', 500, 440, { color: C.ink, size: 36, a: seg(t, s('g2', 4.4), s('g2', 5.0)) });
  });
  const g3 = span(t, s('g3', 0.0), s('g5', 0.3), 0.5, 0.5);
  A(g3, () => {
    txtFit('Buried by faith', 500, 80, 900, { size: 46, weight: 700, family: DISPLAY, align: 'center' });
    ctx.fillStyle = C.faint; ctx.beginPath(); ctx.arc(500, 170, 10, 0, TAU); ctx.fill();
    trace([[500, 180], [500, 230], [250, 300], [250, 340]], eout(seg(t, s('g3', 0.8), s('g3', 2.0))), C.rose, { w: 5, headSize: 14 });
    A(seg(t, s('g3', 1.8), s('g3', 2.4)), () => {
      card(60, 360, 380, 270, { bg: 'rgba(15,20,27,0.9)', line: 'rgba(233,160,174,0.6)' });
      txt('Gammarth', 250, 400, { size: 40, weight: 700, family: DISPLAY, color: C.rose, align: 'center' });
      ['Christians', 'Jews', 'other non-Muslims'].forEach((n, j) => A(seg(t, s('g3', 2.6 + j * 0.5), s('g3', 3.0 + j * 0.5)), () => txtFit(n, 250, 466 + j * 50, 340, { size: 34, weight: 600, align: 'center' })));
    });
    A(seg(t, s('g4', 0.2), s('g4', 0.8)), () => {
      trace([[500, 180], [500, 230], [750, 300], [750, 340]], eout(seg(t, s('g4', 0.2), s('g4', 1.4))), C.sage, { w: 5, headSize: 14 });
      A(seg(t, s('g4', 1.2), s('g4', 1.8)), () => {
        card(560, 360, 380, 270, { bg: 'rgba(15,20,27,0.9)', line: 'rgba(156,195,165,0.6)' });
        txtFit('Muslim cemeteries', 750, 400, 340, { size: 38, weight: 700, family: DISPLAY, color: C.sage, align: 'center' });
        ['Haffouz', 'Tarf ech-Chena'].forEach((n, j) => A(seg(t, s('g4', 3.6 + j * 0.6), s('g4', 4.0 + j * 0.6)), () => txtFit(n, 750, 476 + j * 56, 340, { size: 34, weight: 600, align: 'center' })));
        A(seg(t, s('g4', 3.0), s('g4', 3.6)), () => txt('such as', 750, 442, { size: 32, weight: 500, color: C.soft, align: 'center' }));
      });
    });
  });
}
/** French war graves' emblems (Wikipédia, "Nécropole nationale"). */
function emblems(t) {
  ctx.fillStyle = '#26303b'; ctx.fillRect(0, 0, 1000, 700);
  ctx.fillStyle = '#5f8a57'; ctx.fillRect(0, 470, 1000, 230);
  const items = [
    ['Christian', (x, y) => latinCross(x, y, 230, '#f1ede3')],
    ['Jewish', (x, y) => { stele(x, y, 220, '#f1ede3'); starDavid(x, y - 120, 64, '#9a9384', 6); }],
    ['Muslim', (x, y) => { stele(x, y, 220, '#f1ede3', 'pointed'); ctx.strokeStyle = '#9a9384'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(x - 4, y - 140, 26, 0.6, TAU - 0.6); ctx.stroke(); }],
    ['other or none', (x, y) => stele(x, y, 220, '#f1ede3')],
  ];
  items.forEach(([label, draw], j) => {
    const x = 140 + j * 240, a = eout(seg(t, s('g5', 1.0 + j * 0.9), s('g5', 1.5 + j * 0.9)));
    A(a, () => {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x - 70, 500, 140, 10);
      draw(x, 500 + (1 - a) * 10);
      txtFit(label, x, 570, 220, { size: 34, weight: 700, color: C.ink, align: 'center' });
    });
  });
  A(seg(t, s('g5', 4.8), s('g5', 5.4)), () => { ctx.fillStyle = 'rgba(38,48,59,0.6)'; ctx.fillRect(520 + 0, 230, 200, 290); chip('not at Gammarth', 620, 640, { color: C.sage, size: 32 }); });
}
/** 1966–68: graves from town cemeteries gathered at Gammarth (schematic). Then 1,875 graves and 1,220 boxes, as marks. */
function gathered(t) {
  ctx.fillStyle = '#1b232c'; ctx.fillRect(0, 0, 1000, 700);
  const g7 = span(t, s('g7', 0.0), s('g8', 0.4), 0.5, 0.5);
  A(g7, () => {
    const u = eio(seg(t, s('g7', 1.2), e('g7', -0.3)));
    const r = rng(66);
    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI, d = 360 + r() * 160, x0 = 500 + Math.cos(a) * d * 1.2, y0 = 260 + Math.sin(a) * d * 0.9;
      const c = i % 15, row = Math.floor(i / 15), x1 = 290 + c * 30, y1 = 270 + row * 34;
      const x = lerp(x0, x1, u), y = lerp(y0, y1, u);
      if ((i % 5) === 2) stele(x, y + 12, 24, '#efebe1'); else latinCross(x, y + 12, 26, '#efebe1');
    }
    card(40, 30, 920, 160, { bg: 'rgba(15,20,27,0.96)', line: 'rgba(233,160,174,0.4)' });
    txt('1966–1968', 500, 82, { size: 52, weight: 800, family: DISPLAY, color: C.rose, align: 'center' });
    txtFit('from town cemeteries across Tunisia', 500, 146, 880, { size: 36, weight: 600, color: C.soft, align: 'center' });
    A(seg(t, s('g7', 3.0), s('g7', 3.6)), () => chip('Gammarth', 500, 540, { color: C.rose, size: 36 }));
  });
  const g8 = span(t, s('g8', 0.0), CH[4].at + 1.0, 0.5, 0.5);
  A(g8, () => {
    const u = seg(t, s('g8', 0.6), s('g8', 3.0)), cols = 75;
    for (let i = 0; i < N.frGraves; i++) {
      if (i >= u * N.frGraves) break;
      const c = i % cols, r = Math.floor(i / cols), x = 52 + c * 12.1, y = 70 + r * 13;
      ctx.fillStyle = (i % 5) === 2 ? '#d8d3c6' : '#efebe1'; ctx.fillRect(x, y, 6, 8);
    }
    A(seg(t, s('g8', 1.0), s('g8', 1.6)), () => {
      txt(fmt(N.frGraves), 52, 438, { size: 64, weight: 800, family: DISPLAY, color: C.rose });
      txtFit('individual graves: both world wars and Indochina', 52 + textW(fmt(N.frGraves), { size: 64, weight: 800, family: DISPLAY }) + 20, 442, 640, { size: 32, weight: 600, color: C.soft });
    });
    // g9: the ossuary's 1,220 boxes
    const v = seg(t, s('g9', 0.4), s('g9', 2.6)), bc = 61;
    for (let i = 0; i < N.frBoxes; i++) {
      if (i >= v * N.frBoxes) break;
      const c = i % bc, r = Math.floor(i / bc), x = 52 + c * 14.8, y = 490 + r * 7.4;
      ctx.fillStyle = '#a99f8a'; ctx.fillRect(x, y, 12, 5.6);
    }
    A(seg(t, s('g9', 1.0), s('g9', 1.6)), () => {
      card(440, 600, 540, 84, { bg: 'rgba(15,20,27,0.92)', line: 'rgba(233,160,174,0.5)' });
      txt(fmt(N.frBoxes), 470, 642, { size: 44, weight: 800, color: C.rose });
      txtFit('boxes of unknown remains', 470 + textW(fmt(N.frBoxes), { size: 44, weight: 800 }) + 14, 644, 360, { size: 32, weight: 600, color: C.ink });
    });
  });
}
function partGammarth(t) {
  header(t, 2, TABS[2]);
  A(span(t, s('g1', -0.4), s('g2', 0.4), 0.6, 0.6), () => windowFrame(() => {
    viewGammarth();
    A(seg(t, s('g1', 2.6), s('g1', 3.2)), () => {
      card(30, 560, 520, 110, { bg: 'rgba(15,20,27,0.9)', line: 'rgba(233,160,174,0.6)' });
      txt('opened', 60, 596, { size: 32, weight: 600, color: C.soft });
      txtFit('5 January 1944', 60, 640, 460, { size: 44, weight: 800, color: C.rose });
    });
  }));
  A(span(t, s('g2', 0.0), s('g5', 0.4), 0.6, 0.6), () => windowFrame(() => faithDiagram(t)));
  A(span(t, s('g5', 0.0), s('g7', 0.4), 0.6, 0.6), () => windowFrame(() => emblems(t)));
  A(span(t, s('g7', 0.0), CH[4].at + 1.0, 0.6, 0.6), () => windowFrame(() => {
    gathered(t);
    A(seg(t, s('g9', 3.0), s('g9', 3.6)), () => chip('kept by the French embassy', 30, 34, { color: C.rose, size: 32, align: 'left', bg: 'rgba(15,20,27,0.95)' }));
  }));
}

// ---------- 5: Bordj Cedria ----------
function timelineDE(t) {
  ctx.fillStyle = '#1b232c'; ctx.fillRect(0, 0, 1000, 700);
  const y0 = 1943, y1 = 1980, x0 = 90, x1 = 910, X = (y) => lerp(x0, x1, (y - y0) / (y1 - y0)), Y = 330;
  ctx.fillStyle = C.faint; ctx.fillRect(x0, Y - 3, x1 - x0, 6);
  [1950, 1960, 1970, 1980].forEach((y) => { ctx.fillStyle = C.soft; ctx.fillRect(X(y) - 1.5, Y - 10, 3, 20); txt(String(y), X(y), Y + 40, { size: 32, weight: 600, color: C.soft, align: 'center' }); });
  const ev = [
    [1943.36, '13 May 1943', 'surrender', 'b4', 0.0, true],
    [1966.24, '1966', 'agreement', 'b4', 0.4, false],
    [1974, '1973–1975', 'built; the dead moved', 'b4', 3.0, true],
    [1977.74, '1977', 'opened', 'b8', 0.4, false],
  ];
  ev.forEach(([y, date, label, key, d, up]) => {
    const a = seg(t, s(key, d), s(key, d + 0.6));
    A(a, () => {
      const x = X(y);
      ctx.fillStyle = C.rose; ctx.beginPath(); ctx.arc(x, Y, 12, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, Y + (up ? -16 : 16)); ctx.lineTo(x, Y + (up ? -90 : 90)); ctx.stroke();
      const al = x > 800 ? 'right' : x < 200 ? 'left' : 'center', xx = x + (al === 'right' ? 14 : al === 'left' ? -14 : 0);
      txt(date, xx, Y + (up ? -150 : 130), { size: 36, weight: 800, color: C.rose, align: al });
      txt(label, xx, Y + (up ? -110 : 172), { size: 32, weight: 600, color: C.ink, align: al });
    });
  });
}
/** The stone: plain lines for the three languages (no inscription copied), the number, and the 104 never found. */
function stoneDE(t) {
  sky('#2c2b40', '#c98f68');
  ctx.fillStyle = '#5f5a43'; ctx.fillRect(0, 520, 1000, 180);
  ctx.fillStyle = '#e8e1d0'; ctx.fillRect(200, 140, 600, 400);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(200, 520, 600, 20);
  const L = [['Arabic', 'right'], ['German', 'left'], ['French', 'left']];
  L.forEach(([lang, al], j) => {
    const y = 190 + j * 110, a = seg(t, s('b7', 0.6 + j * 0.5), s('b7', 1.0 + j * 0.5));
    A(a, () => {
      ctx.fillStyle = '#8d8574';
      for (let r = 0; r < 2; r++) { const w = 360 - r * 80; ctx.fillRect(al === 'right' ? 760 - w : 240, y + r * 22, w, 7); }
      chip(lang, 814, y + 12, { color: C.ink, size: 32, align: 'left' });
    });
  });
  A(seg(t, s('b7', 1.8), s('b7', 2.4)), () => txt(fmt(N.deDead), 500, 470, { size: 72, weight: 800, family: DISPLAY, color: '#5c5547', align: 'center' }));
  A(seg(t, s('b7', 3.4), s('b7', 4.0)), () => {
    card(250, 580, 500, 90, { bg: 'rgba(15,20,27,0.9)', line: 'rgba(233,160,174,0.5)' });
    txt(fmt(N.deMissing), 290, 626, { size: 44, weight: 800, color: C.rose });
    txtFit('never found', 290 + textW(fmt(N.deMissing), { size: 44, weight: 800 }) + 16, 628, 300, { size: 34, weight: 600 });
  });
}
function partCedria(t) {
  header(t, 3, TABS[3]);
  A(span(t, s('b1', -0.4), s('b4', 0.4), 0.6, 0.6), () => windowFrame(() => {
    viewCedria(t);
    numberCard(560, 470, 410, N.deDead, 'German soldiers', { a: span(t, s('b2', 0.4), s('b4', 0.2), 0.5, 0.5), size: 84, sub: '1942–43, in battle or as prisoners' });
  }));
  A(span(t, s('b4', 0.0), s('b6', 0.4), 0.6, 0.6), () => windowFrame(() => timelineDE(t)));
  A(span(t, s('b6', 0.0), s('b7', 0.4), 0.6, 0.6), () => windowFrame(() => {
    viewCedria(t, { num: 1, glow: seg(t, s('b6', 0.4), s('b6', 1.2)) });
    A(seg(t, s('b6', 3.2), s('b6', 3.8)), () => chip('ossuaries, in six courtyards', 500, 650, { color: C.rose, size: 34 }));
    A(seg(t, s('b6', 0.8), s('b6', 1.4)), () => chip('no rows of graves', 30, 50, { color: C.ink, size: 34, align: 'left' }));
  }));
  A(span(t, s('b7', 0.0), s('b8', 0.4), 0.6, 0.6), () => windowFrame(() => stoneDE(t)));
  A(span(t, s('b8', 0.0), s('b9', 0.4), 0.6, 0.6), () => windowFrame(() => {
    timelineDE(t);
    runBy('Volksbund', 'Germany’s war graves commission', seg(t, s('b8', 2.0), s('b8', 2.6)));
  }));
  // b9–b10: what the Volksbund says
  A(span(t, s('b9', 0.0), s('b11', 0.4), 0.6, 0.6), () => windowFrame(() => {
    viewCedria(t);
    ctx.fillStyle = 'rgba(15,20,27,0.72)'; ctx.fillRect(0, 0, 1000, 700);
    A(seg(t, s('b9', 0.6), s('b9', 1.4)), () => {
      txt('after', 500, 170, { size: 36, weight: 600, color: C.soft, align: 'center' });
      txt('1945', 500, 230, { size: 64, weight: 800, family: DISPLAY, color: C.ink, align: 'center' });
      txtFit('“hero worship” was taboo', 500, 320, 880, { size: 52, weight: 700, family: DISPLAY, color: C.ink, align: 'center' });
      txtFit('given German war crimes', 500, 380, 880, { size: 36, weight: 600, color: C.soft, align: 'center' });
    });
    A(seg(t, s('b10', 0.4), s('b10', 1.2)), () => {
      txtFit('places to learn', 500, 500, 880, { size: 76, weight: 800, family: DISPLAY, color: C.rose, align: 'center' });
      txt('Lernorte', 500, 570, { size: 34, weight: 600, color: C.soft, align: 'center' });
    });
    A(seg(t, s('b9', 0.6), s('b9', 1.4)), () => txtFit('Volksbund, teaching module (translated)', 500, 650, 880, { size: 32, weight: 500, color: C.soft, align: 'center' }));
  }));
  // b11: Italy brought its dead home
  A(span(t, s('b11', 0.0), CH[5].at + 1.0, 0.6, 0.6), () => windowFrame(() => {
    ctx.fillStyle = '#1b232c'; ctx.fillRect(0, 0, 1000, 700);
    ctx.fillStyle = C.sea; ctx.fillRect(0, 0, 1000, 700);
    ctx.fillStyle = C.land; k.rrect(60, 380, 300, 260, 30); ctx.fill();
    ctx.fillStyle = C.land; k.rrect(640, 60, 300, 260, 30); ctx.fill();
    txt('TUNISIA', 210, 510, { size: 36, weight: 700, color: C.dark, align: 'center', spacing: '4px' });
    txt('ITALY', 790, 190, { size: 36, weight: 700, color: C.dark, align: 'center', spacing: '4px' });
    trace(smooth3([[260, 430], [480, 330], [720, 230]]), eout(seg(t, s('b11', 1.2), s('b11', 3.0))), C.rose, { w: 6, dash: [12, 12], headSize: 20 });
    A(seg(t, s('b11', 3.0), s('b11', 3.6)), () => {
      card(380, 420, 580, 220, { bg: 'rgba(15,20,27,0.94)', line: 'rgba(233,160,174,0.6)' });
      txt('Bari', 420, 470, { size: 48, weight: 700, family: DISPLAY, color: C.rose });
      txt('1967', 940, 472, { size: 40, weight: 800, color: C.ink, align: 'right' });
      txtFit('a memorial to the fallen overseas', 420, 536, 500, { size: 34, weight: 600 });
      txtFit('Italian Ministry of Defence', 420, 596, 500, { size: 32, weight: 500, color: C.soft });
    });
    chip('the sea', 300, 200, { color: C.soft, size: 32, line: false, bg: 'rgba(0,0,0,0)' });
  }));
}
function smooth3(p) { const out = []; for (let i = 0; i <= 20; i++) { const u = i / 20; out.push([0, 1].map((c) => (1 - u) ** 2 * p[0][c] + 2 * (1 - u) * u * p[1][c] + u * u * p[2][c])); } return out; }

// ---------- 6: without a cemetery ----------
function partWithout(t) {
  // w1: the four ways, side by side
  A(span(t, s('w1', 0.2), s('w3', 0.3), 0.5, 0.5), () => {
    const L = [['crosses and stars', 'United States'], ['headstones', 'Commonwealth'], ['crosses and steles', 'France'], ['stone courtyards', 'Germany']];
    const fig = [[N.abmcGraves, N.abmcMissing, 'graves', 'missing'], [CWGC_SUM, N.cwgcMemorial, 'in 8 cemeteries', 'no known grave'], [N.frGraves, N.frBoxes, 'graves, 3 wars', 'unknown'], [N.deDead, N.deMissing, 'soldiers', 'never found']];
    L.forEach(([way, who], j) => {
      const x = RX + 125 + j * 250, a = eout(seg(t, s('w1', 0.8 + j * 0.9), s('w1', 1.3 + j * 0.9)));
      A(a, () => {
        marker(KINDS[j], x, 330, 120, C.stone);
        if (j === 0) starDavid(x + 54, 330, 46, C.stone, 5);
        if (j === 2) stele(x - 52, 330, 70, C.stone);
        txtFit(who, x, 380, 236, { size: 34, weight: 700, color: C.rose, align: 'center' });
        txtFit(way, x, 424, 236, { size: 32, weight: 500, color: C.soft, align: 'center' });
      });
      // w2: each body's own figures, which count different things
      A(seg(t, s('w2', 0.8 + j * 0.5), s('w2', 1.3 + j * 0.5)), () => {
        card(x - 120, 480, 240, 260, { bg: 'rgba(15,20,27,0.85)', line: 'rgba(233,160,174,0.35)' });
        txt(fmt(fig[j][0]), x, 530, { size: 44, weight: 800, color: C.ink, align: 'center' });
        txtFit(fig[j][2], x, 574, 220, { size: 32, weight: 500, color: C.soft, align: 'center' });
        txt(fmt(fig[j][1]), x, 640, { size: 40, weight: 800, color: C.rose, align: 'center' });
        txtFit(fig[j][3], x, 684, 220, { size: 32, weight: 500, color: C.soft, align: 'center' });
      });
    });
    A(seg(t, s('w2', 3.6), s('w2', 4.2)), () => chip('each body counts its own way', RCX, 820, { color: C.rose, size: 36 }));
  });
  // w3–w4: no war cemetery
  A(span(t, s('w3', 0.2), s('w5', 0.2), 0.5, 0.5), () => {
    txtFit('No war cemetery', RCX, 360, 980, { size: 64, weight: 700, family: DISPLAY, align: 'center' });
    A(seg(t, s('w4', 0.4), s('w4', 1.0)), () => {
      txtFit('Tunisians', RCX, 480, 980, { size: 48, weight: 700, color: C.rose, align: 'center' });
      chip('soldiers in the French army', RCX, 590, { color: C.ink, size: 36, a: seg(t, s('w4', 1.4), s('w4', 2.0)) });
      chip('civilians in their own towns', RCX, 680, { color: C.ink, size: 36, a: seg(t, s('w4', 3.0), s('w4', 3.6)) });
    });
  });
  // w5–w8: Tunisia's Jews under the German occupation
  A(span(t, s('w5', 0.2), s('w9', 0.2), 0.5, 0.5), () => {
    txtFit('Under the German occupation', RX, 150, RW, { size: 48, weight: 700, family: DISPLAY });
    A(seg(t, s('w5', 0.8), s('w5', 1.4)), () => {
      txt('about', RX, 250, { size: 36, weight: 600, color: C.soft });
      txt(fmt(5000), RX, 330, { size: 96, weight: 800, family: DISPLAY, color: C.rose });
      txtFit('Jewish men sent to forced labour', RX + 300, 330, 690, { size: 40, weight: 600 });
    });
    A(seg(t, s('w5', 4.0), s('w5', 4.6)), () => {
      const n1 = fmt(32), n2 = fmt(40);
      let x = RX; txt(n1, x, 420, { size: 44, weight: 800, color: C.ink }); x += textW(n1, { size: 44, weight: 800 }) + 12;
      txt('to about', x, 422, { size: 34, weight: 600, color: C.soft }); x += textW('to about', { size: 34, weight: 600 }) + 12;
      txt(n2, x, 420, { size: 44, weight: 800, color: C.ink }); x += textW(n2, { size: 44, weight: 800 }) + 12;
      txt('camps', x, 422, { size: 34, weight: 600, color: C.soft });
      txtFit('USHMM; Mémorial de la Shoah', RX, 474, 980, { size: 32, weight: 500, color: C.soft });
    });
    A(seg(t, s('w6', 0.4), s('w6', 1.0)), () => {
      card(RX, 520, RW, 120, { bg: 'rgba(15,20,27,0.88)', line: 'rgba(233,160,174,0.4)' });
      txtFit('US report, June 1943', RX + 30, 556, 940, { size: 32, weight: 700, color: C.rose });
      txtFit('work sites under nearly constant Allied air attack', RX + 30, 604, 940, { size: 34, weight: 600 });
    });
    chipRow(['some were killed', 'some deported to camps in Europe'], RX, 700, { color: C.ink, t, key: 'w7', d0: 0.4, step: 1.6 });
  });
  // w9–w11: the bombed towns
  A(span(t, s('w9', 0.2), s('w12', 0.2), 0.5, 0.5), () => {
    txtFit('The bombed towns', RX, 150, RW, { size: 48, weight: 700, family: DISPLAY });
    chipRow(['ports', 'stations', 'factories'], RX, 250, { color: C.gold, t, key: 'w9', d0: 2.0, step: 0.4 });
    A(seg(t, s('w10', 0.3), s('w10', 0.9)), () => {
      txt('Sousse', RX, 350, { size: 44, weight: 700, family: DISPLAY, color: C.ink });
      for (let i = 0; i < 39; i++) {
        const a = seg(t, s('w10', 0.8 + i * 0.07), s('w10', 1.0 + i * 0.07)), c = i % 13, r = Math.floor(i / 13);
        A(a, () => { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(RX + 20 + c * 40, 420 + r * 40, 12, 0, TAU); ctx.fill(); });
      }
      A(seg(t, s('w10', 3.6), s('w10', 4.2)), () => { txt(fmt(39), RX + 560, 460, { size: 72, weight: 800, family: DISPLAY, color: C.gold }); txtFit('raids, Dec 1942 – May 1943', RX + 560, 520, 440, { size: 32, weight: 600, color: C.soft }); txtFit('by one count', RX + 560, 560, 440, { size: 32, weight: 500, color: C.soft }); });
    });
    A(seg(t, s('w11', 0.4), s('w11', 1.0)), () => {
      card(RX, 620, RW, 220, { bg: 'rgba(15,20,27,0.88)', line: 'rgba(232,198,110,0.45)' });
      txtFit('Mark W. Willis, historian (2015)', RX + 30, 660, 940, { size: 32, weight: 700, color: C.gold });
      txtFit('most major towns destroyed or badly damaged', RX + 30, 716, 940, { size: 38, weight: 600 });
      A(seg(t, s('w11', 4.0), s('w11', 4.6)), () => txtFit('the civilian toll largely forgotten', RX + 30, 780, 940, { size: 38, weight: 600, color: C.rose }));
    });
  });
  // w12: where their memory lives
  A(span(t, s('w12', 0.2), CH[6].at + 1.0, 0.5, 0.6), () => {
    txtFit('No war cemetery gathers them', RCX, 380, 980, { size: 52, weight: 700, family: DISPLAY, align: 'center' });
    ['families', 'towns', 'archives'].forEach((n, j) => chip(n, RCX + (j - 1) * 300, 520, { color: C.rose, size: 40, a: seg(t, s('w12', 2.8 + j * 0.6), s('w12', 3.3 + j * 0.6)) }));
  });
}

// ---------- 7: remembering today ----------
const MON = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']; // initials: the same in English and French
function partToday(t) {
  // r1: memorials came down
  A(span(t, s('r1', 0.2), s('r2', 0.3), 0.5, 0.5), () => {
    const x = RCX, y = 640, lower = eio(seg(t, s('r1', 4.0), s('r1', 5.6)));
    txt('1956', RX + 120, 300, { size: 56, weight: 800, family: DISPLAY, color: C.ink, align: 'center' });
    txtFit('independence', RX + 120, 360, 300, { size: 34, weight: 600, color: C.soft, align: 'center' });
    A(seg(t, s('r1', 3.4), s('r1', 4.0)), () => { txt('1957', RX + RW - 160, 300, { size: 56, weight: 800, family: DISPLAY, color: C.rose, align: 'center' }); txtFit('Tunis', RX + RW - 160, 360, 300, { size: 34, weight: 600, color: C.soft, align: 'center' }); });
    ctx.save(); ctx.beginPath(); ctx.rect(RX, 200, RW, y - 200); ctx.clip();
    A(1 - 0.6 * lower, () => {
      ctx.fillStyle = C.stone2; ctx.fillRect(x - 70, y - 70 + lower * 300, 140, 70);
      ctx.beginPath(); ctx.moveTo(x - 40, y - 70 + lower * 300); ctx.lineTo(x - 22, y - 330 + lower * 300); ctx.lineTo(x, y - 360 + lower * 300); ctx.lineTo(x + 22, y - 330 + lower * 300); ctx.lineTo(x + 40, y - 70 + lower * 300); ctx.closePath(); ctx.fill();
    });
    ctx.restore();
    ctx.fillStyle = C.faint; ctx.fillRect(RX + 200, y, RW - 400, 4);
    A(seg(t, s('r1', 4.6), s('r1', 5.2)), () => txtFit('monument to the dead of both wars, taken down', RCX, y + 60, 980, { size: 34, weight: 600, color: C.soft, align: 'center' }));
  });
  // r2–r4: a year of ceremonies
  A(span(t, s('r2', 0.1), s('r5', 0.3), 0.5, 0.5), () => {
    txtFit('Ceremonies through the year', RX, 150, RW, { size: 48, weight: 700, family: DISPLAY });
    const x0 = RX + 10, x1 = RX + RW - 10, mx = (m) => lerp(x0, x1, m / 12), Y = 290;
    ctx.fillStyle = C.faint; ctx.fillRect(x0, Y - 3, x1 - x0, 6);
    MON.forEach((m, j) => { ctx.fillStyle = C.soft; ctx.fillRect(mx(j) - 1.5, Y - 12, 3, 24); txt(m, (mx(j) + mx(j + 1)) / 2, Y + 40, { size: 34, weight: 700, color: j === 4 || j === 10 ? C.rose : C.soft, align: 'center' }); });
    ctx.fillStyle = C.soft; ctx.fillRect(mx(12) - 1.5, Y - 12, 3, 24);
    const ev = [
      ['Memorial Day', 'Carthage', 0, 4.8, 'r2', 1.2, 0],
      ['8 May', 'Gammarth', 2, 4.25, 'r2', -2.2, 1],
      ['11 November', 'Gammarth', 2, 10.35, 'r3', 1.0, 0],
      ['Remembrance', 'Medjez-el-Bab', 1, 10.5, 'r3', 2.8, 1],
      ['day of mourning', 'Bordj Cedria', 3, 10.6, 'r4', 0.6, 2],
    ];
    // leaders first, then the cards over them; each leader runs down the left of its column to its card
    for (const pass of [0, 1]) ev.forEach(([what, where, kind, m, key, d, lane]) => {
      const t0 = d < 0 ? e(key, d) : s(key, d), a = seg(t, t0, t0 + 0.6);
      A(a, () => {
        // each month's cards stand in a column under its initial
        const x = mx(m), col = m < 6 ? mx(4.5) : Math.min(mx(10.5), RX + RW - 165), cx = col - 15, y = 420 + lane * 130;
        if (pass === 0) {
          ctx.fillStyle = C.rose; ctx.beginPath(); ctx.arc(x, Y, 11, 0, TAU); ctx.fill();
          if (lane === 0) { ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(col, Y + 62); ctx.lineTo(col, y - 46); ctx.stroke(); }
          return;
        }
        card(cx - 150, y - 46, 330, 108, { bg: 'rgba(15,20,27,0.94)', line: 'rgba(233,160,174,0.45)' });
        marker(KINDS[kind], cx - 110, y + 30, 54, C.rose);
        txtFit(what, cx - 70, y - 12, 240, { size: 34, weight: 700 });
        txtFit(where, cx - 70, y + 30, 240, { size: 32, weight: 500, color: C.soft });
      });
    });
  });
  // r5: identifying the unknown
  A(span(t, s('r5', 0.2), s('r6', 0.3), 0.5, 0.5), () => {
    txt('2022', RCX, 300, { size: 96, weight: 800, family: DISPLAY, color: C.rose, align: 'center' });
    txtFit('United States and Tunisia', RCX, 400, 980, { size: 44, weight: 700, align: 'center' });
    txtFit('unknown soldiers at Carthage, to be identified', RCX, 470, 980, { size: 38, weight: 500, color: C.soft, align: 'center' });
    A(seg(t, s('r5', 3.0), s('r5', 3.6)), () => { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(RCX, 590, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#9c7a2c'; ctx.beginPath(); ctx.arc(RCX, 590, 8, 0, TAU); ctx.fill(); txtFit('a rosette, when a name is found', RCX, 660, 980, { size: 34, weight: 600, color: C.gold, align: 'center' }); });
  });
  // r6: the records online
  A(span(t, s('r6', 0.2), s('r7', 0.3), 0.5, 0.5), () => {
    txtFit('Look up a name', RX, 150, RW, { size: 48, weight: 700, family: DISPLAY });
    const R = [['American Battle Monuments Commission', 'burial search', 0], ['Commonwealth War Graves Commission', 'Find War Dead', 1], ['French Ministry of the Armed Forces', 'Mémoire des hommes', 2], ['Volksbund', 'Gräbersuche online', 3]];
    R.forEach(([who, what, kind], j) => {
      const y = 280 + j * 150, a = eout(seg(t, s('r6', 0.6 + j * 0.5), s('r6', 1.1 + j * 0.5)));
      A(a, () => {
        card(RX, y - 60, RW, 124, { bg: 'rgba(15,20,27,0.85)', line: 'rgba(233,160,174,0.4)' });
        marker(KINDS[kind], RX + 60, y + 30, 66, C.rose);
        txtFit(who, RX + 120, y - 18, 860, { size: 34, weight: 700 });
        txtFit(what, RX + 120, y + 28, 860, { size: 34, weight: 500, color: C.rose });
      });
    });
  });
  // r7–r11: what is documented, and where
  A(span(t, s('r7', 0.1), s('r12', 0.3), 0.5, 0.5), () => {
    txtFit('Documented', RX, 150, RW, { size: 48, weight: 700, family: DISPLAY });
    A(seg(t, s('r7', 0.6), s('r7', 1.2)), () => txtFit('the persecution of Tunisia’s Jews, 1942–43', RX, 210, RW, { size: 34, weight: 600, color: C.soft }));
    const D = [
      ['Tunis', '1943', 'Paul Ghez’s diary', 'Six mois sous la botte', 'r8'],
      ['Jerusalem', null, 'Yad Ben-Zvi documentation centre', 'North African Jews: documents, testimonies', 'r9'],
      ['Washington', null, 'US Holocaust Memorial Museum', 'recorded testimonies', 'r10'],
      ['Paris', null, 'Mémorial de la Shoah', 'the roundup of Tunis, 9 December 1942', 'r11'],
    ];
    D.forEach(([where, when, what, sub, key], j) => {
      const y = 320 + j * 150, a = eout(seg(t, s(key, 0.2), s(key, 0.8)));
      A(a, () => {
        card(RX, y - 60, RW, 124, { bg: 'rgba(15,20,27,0.85)', line: 'rgba(233,160,174,0.4)' });
        txtFit(where, RX + 30, y - 14, 240, { size: 38, weight: 700, family: DISPLAY, color: C.rose });
        if (when) txt(when, RX + 30, y + 30, { size: 32, weight: 700, color: C.soft });
        txtFit(what, RX + 290, y - 18, 690, { size: 34, weight: 700 });
        txtFit(sub, RX + 290, y + 26, 690, { size: 32, weight: 500, color: C.soft });
      });
    });
  });
  // r12: the rows, and the people outside them
  A(span(t, s('r12', 0.1), s('r13', 0.4), 0.5, 0.6), () => {
    const r = rng(12);
    for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) marker(KINDS[(row + i) % 4], RX + 280 + i * 55, 470 + row * 70, 44, C.stone);
    const out = eout(seg(t, s('r12', 2.6), s('r12', 4.0)));
    for (let i = 0; i < 60; i++) {
      const a = r() * TAU, d = 300 + r() * 160, x = RCX + Math.cos(a) * d * 1.3, y = 540 + Math.sin(a) * d * 0.62;
      if (y < 250 || y > 900) continue;
      A(out * seg(t, s('r12', 2.6 + (i % 20) * 0.06), s('r12', 3.0 + (i % 20) * 0.06)), () => { ctx.fillStyle = C.rose; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); });
    }
  });
  A(span(t, s('r13', 0.1), s('r14', 0.4), 0.5, 0.5), () => {
    ['check access locally', 'go quietly'].forEach((n, j) => chip(n, RCX, 470 + j * 100, { color: C.ink, size: 40, a: seg(t, s('r13', 0.8 + j * 1.6), s('r13', 1.3 + j * 1.6)) }));
  });
  A(seg(t, s('r14', 0.6), s('r14', 1.8)), () => {
    KINDS.forEach((kind, j) => marker(kind, RCX - 150 + j * 100, 560, 46, C.rose));
    txt('REMEMBERING', RCX, 300, { size: fit('REMEMBERING', 980, 104, { weight: 800, family: DISPLAY, spacing: '4px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '4px' });
    txt(TITLE2, RCX, 420, { size: fit(TITLE2, 980, 104, { weight: 800, family: DISPLAY, spacing: '4px' }), weight: 800, family: DISPLAY, color: C.rose, align: 'center', spacing: '4px' });
  });
}

// ---------- title cards and credits ----------
const CARD_PLACE = [null, 'North Africa American Cemetery, Carthage', 'Medjez-el-Bab War Cemetery', 'French military cemetery, Gammarth', 'German war cemetery, Bordj Cedria', null, null];
function titleCards(t) {
  CH.forEach((ch, i) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.88, () => { ctx.fillStyle = 'rgba(10,14,19,0.93)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8)), y = 470 + (1 - p) * 20;
      txt('PART', W / 2 - 8, y - 120, { size: 36, weight: 700, color: C.rose, align: 'right', spacing: '6px' });
      txt(String(ch.n), W / 2 + 8, y - 120, { size: 36, weight: 700, color: C.rose, align: 'left', spacing: '6px' });
      const title = ch.title.toUpperCase();
      txt(title, W / 2, y, { size: fit(title, 1500, 120, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
      if (CARD_PLACE[i]) txt(CARD_PLACE[i], W / 2, y + 110, { size: fit(CARD_PLACE[i], 1400, 48), weight: 600, color: C.soft, align: 'center' });
      // the four markers, this chapter's lit
      const y2 = y + 250;
      KINDS.forEach((kind, j) => {
        const x = W / 2 - 240 + j * 160, lit = i - 1 === j || i === 6;
        ctx.fillStyle = lit ? C.rose : C.bg0; ctx.beginPath(); ctx.arc(x, y2 - 26, 36, 0, TAU); ctx.fill(); ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.stroke();
        marker(kind, x, y2 - 4, 44, lit ? C.bg0 : C.rose);
      });
    });
  });
}
const MUSIC = ['“Peace of Mind” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Immersed” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  'American Battle Monuments Commission; Commonwealth War Graves Commission; Volksbund;',
  'French consulate in Tunis and Ministry of the Armed Forces; Italian Ministry of Defence;',
  'US Holocaust Memorial Museum; Mémorial de la Shoah; Montreal Holocaust Museum; FRUS 1943;',
  'M. W. Willis, The Journal of North African Studies (2015); H. Kazdaghli, Hespéris-Tamuda (2018);',
  'Wikipedia; Webdo; Le Courrier de l’Atlas; Stars and Stripes; Yad Ben-Zvi.',
  'Map outline: Natural Earth (public domain), simplified.',
];
function credits() {
  ctx.fillStyle = '#0b1016'; ctx.fillRect(0, 0, W, H);
  txt('REMEMBERING 1943', W / 2, 200, { size: fit('REMEMBERING 1943', 1600, 84, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
  txt('Tunisia 1943 · original animation', W / 2, 286, { size: 40, weight: 600, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 380, { size: 32, weight: 800, color: C.rose, align: 'center', spacing: '4px' });
  MUSIC.forEach((m, j) => txt(m, W / 2, 430 + j * 44, { size: 32, weight: 500, align: 'center' }));
  txt('SOURCES', W / 2, 570, { size: 32, weight: 800, color: C.rose, align: 'center', spacing: '4px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, 620 + j * 46, 1700, { size: 32, weight: 500, align: 'center', color: j > 4 ? C.soft : C.ink }));
}

// ---------- the background, painted once ----------
let BG = null;
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const g = BG.getContext('2d');
  const gr = g.createRadialGradient(W * 0.62, H * 0.45, 100, W * 0.55, H * 0.5, 1300);
  gr.addColorStop(0, C.bg1); gr.addColorStop(1, C.bg0);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // faint rows of small marks, like a cemetery plan seen from above
  g.fillStyle = C.rows;
  for (let y = 60; y < H; y += 44) for (let x = 760 + ((y / 44) % 2) * 22; x < W; x += 44) { g.beginPath(); g.roundRect(x, y, 10, 16, [5, 5, 1, 1]); g.fill(); }
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [DISPLAY, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    drawMap(t);
    const parts = [partOpen, partWar, partCarthage, partMedjez, partGammarth, partCedria, partWithout, partToday];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    titleCards(t);
    A(seg(t, e('r14', 1.4), e('r14', 2.4)), () => credits());
  },
});
