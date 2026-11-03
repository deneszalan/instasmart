// "On the trail of 1943" (« Sur les traces de 1943 »): the long film of Tunisia 1943's Visit section, 16:9, 1920x1080.
// A schematic map of Tunisia on the left grows from chapter to chapter: the trail from south to north, a numbered pin
// for each stop. On the right, each stop has three tabs (1943, TODAY, ON THE SPOT) above a drawing of the place.
// Look: a traveller's map: deep teal ground with faint contour lines, sand-coloured land, an ochre dotted trail; Allied
// arrows blue, Axis arrows terracotta; Fraunces for titles, Barlow (a road-sign grotesk) for labels.
// The same scene plays the French version: kit.js swaps every whole string for its labels-fr.json entry, so words and
// numbers are drawn as separate strings. Map outline: Natural Earth (public domain), simplified; everything else drawn.
// Distances are computed from coordinates here and checked against the narration's rounded figures.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const TAU = Math.PI * 2, RAD = Math.PI / 180;

const C = {
  bg0: '#0a1f1d', bg1: '#123d39', contour: 'rgba(232,214,170,0.055)',
  sea: '#174850', sea2: '#1d5961', land: '#e4d3ab', land2: '#d9c193', erg: '#c98f52', neigh: '#4f5a4c', neighLine: '#6f7a66',
  ink: '#f6eedc', soft: 'rgba(246,238,220,0.76)', faint: 'rgba(246,238,220,0.22)', dark: '#2a2620', dark2: 'rgba(42,38,32,0.72)',
  ochre: '#e3a53b', ochreDk: '#a16207', allied: '#88c2e4', axis: '#de7a5c', green: '#93c27a', mint: '#9fdcc9', grey: '#a7a49a',
  card: 'rgba(9,29,27,0.92)', panel: 'rgba(9,29,27,0.78)', paper: '#efe4c8', paper2: '#e2d4b0', stampG: '#3f7d55', stampO: '#b5761c', stampR: '#b0472f',
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
function fit(str, maxW, size, o = {}) { let z = size; while (z > 24 && textW(str, { ...o, size: z }) > maxW) z -= 2; return z; }
/** Text that shrinks to fit maxW. */
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** A decimal the reader's way (0.4, in French 0,4). */
const dec = (x, d = 1) => x.toLocaleString(window.TR?.locale ?? 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
/** A rounded label as wide as its text. */
function chip(str, cx, cy, { color = C.ink, bg = C.card, size = 34, weight = 700, a = 1, align = 'center', line = true, family = TEXT, spacing = '0px' } = {}) {
  const w = textW(str, { size, weight, family, spacing }), pad = size * 0.62, h = size * 1.6;
  const x0 = align === 'left' ? cx : align === 'right' ? cx - w - pad * 2 : cx - w / 2 - pad;
  A(a, () => {
    k.rrect(x0, cy - h / 2, w + pad * 2, h, h / 2); ctx.fillStyle = bg; ctx.fill();
    if (line) { ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke(); }
    txt(str, x0 + pad + w / 2, cy + 1, { size, weight, color, align: 'center', family, spacing });
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
/** Stamps on archive cards, as in the short post: DOCUMENTED, REPORTED, TOLD. */
function stamp(str, x, y, col, a = 1, rot = -0.08, size = 34) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const w = textW(str, { size, weight: 800, spacing: '3px' }) + 36;
    ctx.strokeStyle = col; ctx.lineWidth = 4; k.rrect(-w / 2, -size * 0.85, w, size * 1.7, 6); ctx.stroke();
    txt(str, 0, 2, { size, weight: 800, color: col, align: 'center', spacing: '3px' });
    ctx.restore();
  });
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
// Wikipedia coordinates: Ksar Ghilane (infobox), the Mareth Museum, Takrouna, Hammamet, Longstop Hill.
const STOPS = [
  { name: 'Ksar Ghilane', ll: [32.9808, 9.6364], key: 'k1', side: 'right' },
  { name: 'Mareth', ll: [33.6178, 10.2861], key: 'm1', side: 'right' },
  { name: 'Takrouna', ll: [36.15, 10.3275], key: 't1', side: 'left' },
  { name: 'Hammamet', ll: [36.40, 10.6167], key: 'v1', side: 'right' },
  { name: 'Longstop Hill', ll: [36.735, 9.6412], key: 'l1', side: 'left' },
];
const TOWNS = {
  tunis: [36.806, 10.181], bizerte: [37.274, 9.874], medjez: [36.65, 9.61], gabes: [33.883, 10.117], medenine: [33.355, 10.505],
  enfidha: [36.1353, 10.3808], sousse: [35.825, 10.636], sfax: [34.74, 10.76], kairouan: [35.678, 10.1], douz: [33.457, 9.02],
  toujane: [33.467, 10.133], hergla: [36.0333, 10.5],
};
const FORT_LAMY = [12.105, 15.045], SABHA = [27.039, 14.426];
const LEG = STOPS.slice(1).map((st, i) => hav(STOPS[i].ll, st.ll));
const TOTAL_KM = LEG.reduce((a, b) => a + b, 0);
const FROM_CHAD = hav(FORT_LAMY, STOPS[0].ll);
const TO_MEDENINE = bearing(STOPS[1].ll, TOWNS.medenine), TO_GABES = bearing(STOPS[1].ll, TOWNS.gabes);
// The narration's rounded figures: about 90, 40 and 100 km between stops, some 500 in all, about 2,400 from Chad; south-east.
const near = (x, to, tol) => Math.abs(x - to) <= tol;
if (!near(LEG[0], 90, 6) || !near(LEG[2], 40, 4) || !near(LEG[3], 100, 8) || !near(TOTAL_KM, 500, 15) || !near(FROM_CHAD, 2400, 30) || !near(TO_MEDENINE, 145, 10)) {
  throw new Error(`distances: ${LEG.map(Math.round)} total ${Math.round(TOTAL_KM)} chad ${Math.round(FROM_CHAD)} bearing ${Math.round(TO_MEDENINE)}`);
}
const COMMODUS_END = 192, FIGHT_YEAR = 1943, YEARS_APART = FIGHT_YEAR - COMMODUS_END; // "at least 1,750 years"
// Rommel's window (Wikipedia, "Erwin Rommel"): command of Army Group Africa from 23 February 1943, left Africa 9 March.
const DAY = 86400000, D0 = Date.UTC(1942, 10, 1), D1 = Date.UTC(1943, 4, 31);
const ROMMEL = [Date.UTC(1943, 1, 23), Date.UTC(1943, 2, 9)], ROMMEL_DAYS = Math.round((ROMMEL[1] - ROMMEL[0]) / DAY);
if (ROMMEL_DAYS !== 14) throw new Error('Rommel days');
// The view from Takrouna's edge (as in the post's lab): a flat top, a vertical cliff of 40 m, eyes 1.6 m above the
// ground. Standing d metres back from the edge, the ground is hidden for H*d/e metres out from the cliff's foot.
const CLIFF_H = 40, EYE = 1.6, hidden = (d) => (CLIFF_H * d) / EYE;
if (Math.abs(hidden(0.4) - 10) > 1e-9) throw new Error('sightline');

// ---------- the map (Natural Earth, simplified) ----------
const MAPDATA = {"TUN":[[[33.181,11.504],[32.902,11.457],[32.637,11.45],[32.507,11.562],[32.435,11.547],[32.369,11.443],[32.136,10.874],[32.004,10.773],[31.962,10.705],[31.974,10.629],[31.954,10.608],[31.84,10.586],[31.744,10.5],[31.715,10.428],[31.715,10.316],[31.68,10.266],[31.518,10.132],[31.428,10.107],[31.079,10.244],[30.986,10.244],[30.915,10.269],[30.842,10.255],[30.731,10.194],[30.641,10.1],[30.354,9.873],[30.331,9.743],[30.229,9.52],[32.072,9.045],[32.105,9.02],[32.526,8.332],[32.837,8.282],[33.095,8.087],[33.108,8.001],[33.184,7.871],[33.208,7.749],[33.232,7.724],[33.414,7.709],[33.659,7.555],[33.801,7.497],[33.894,7.479],[34.095,7.519],[34.199,7.63],[34.245,7.767],[34.414,7.832],[34.53,8.095],[34.637,8.228],[34.681,8.21],[34.763,8.271],[34.902,8.249],[35.067,8.3],[35.241,8.433],[35.29,8.318],[35.326,8.293],[35.403,8.289],[35.508,8.336],[35.621,8.329],[35.685,8.307],[35.751,8.257],[35.827,8.242],[36.036,8.275],[36.146,8.318],[36.244,8.307],[36.351,8.354],[36.43,8.357],[36.469,8.296],[36.491,8.167],[36.526,8.17],[36.663,8.429],[36.732,8.462],[36.768,8.408],[36.785,8.411],[36.803,8.555],[36.837,8.642],[36.94,8.602],[36.974,8.717],[36.979,8.825],[37.021,8.905],[37.153,9.038],[37.193,9.16],[37.234,9.211],[37.235,9.344],[37.276,9.419],[37.267,9.455],[37.31,9.553],[37.3,9.574],[37.345,9.743],[37.328,9.859],[37.271,9.862],[37.213,9.772],[37.154,9.808],[37.149,9.88],[37.197,9.927],[37.213,9.923],[37.234,9.862],[37.227,9.819],[37.262,9.866],[37.246,9.981],[37.266,10.05],[37.178,10.273],[37.159,10.212],[37.175,10.204],[37.171,10.147],[37.159,10.129],[37.143,10.136],[37.129,10.219],[37.095,10.226],[37.11,10.219],[37.077,10.176],[37.028,10.183],[36.977,10.219],[36.881,10.348],[36.822,10.298],[36.847,10.255],[36.839,10.219],[36.798,10.19],[36.786,10.248],[36.817,10.273],[36.749,10.32],[36.73,10.356],[36.729,10.438],[36.756,10.518],[36.773,10.539],[36.864,10.568],[36.896,10.734],[37.006,10.888],[37.05,10.903],[37.087,11.032],[37.063,11.061],[37.021,11.047],[36.918,11.094],[36.871,11.137],[36.854,11.13],[36.788,11.022],[36.452,10.798],[36.378,10.55],[36.337,10.518],[36.217,10.478],[36.112,10.474],[35.981,10.518],[35.922,10.582],[35.842,10.622],[35.77,10.744],[35.78,10.824],[35.766,10.842],[35.734,10.824],[35.699,10.842],[35.638,11.04],[35.614,11.054],[35.603,11.018],[35.555,11.014],[35.518,11.04],[35.506,11.086],[35.459,11.05],[35.334,11.043],[35.266,11.101],[35.238,11.162],[35.219,11.158],[35.206,11.112],[35.093,11.014],[35.033,11.018],[34.957,10.917],[34.873,10.917],[34.838,10.86],[34.797,10.87],[34.768,10.813],[34.655,10.701],[34.633,10.626],[34.532,10.582],[34.497,10.431],[34.424,10.377],[34.414,10.287],[34.372,10.248],[34.304,10.104],[34.213,10.053],[34.171,10.006],[33.983,10.05],[33.828,10.172],[33.684,10.366],[33.647,10.489],[33.706,10.716],[33.671,10.741],[33.603,10.737],[33.546,10.672],[33.483,10.716],[33.485,10.78],[33.539,10.91],[33.575,10.932],[33.617,10.906],[33.637,10.935],[33.627,10.96],[33.644,10.986],[33.618,11.043],[33.541,11.112],[33.49,11.115],[33.455,11.09],[33.392,11.112],[33.363,11.101],[33.372,11.13],[33.331,11.169],[33.287,11.295],[33.311,11.133],[33.281,11.122],[33.222,11.169],[33.184,11.418],[33.206,11.428],[33.259,11.353],[33.181,11.504]],[[33.841,10.993],[33.801,11.061],[33.738,10.971],[33.698,10.957],[33.733,10.957],[33.728,10.942],[33.64,10.888],[33.654,10.87],[33.688,10.878],[33.735,10.809],[33.703,10.78],[33.715,10.741],[33.759,10.726],[33.813,10.748],[33.885,10.737],[33.897,10.773],[33.88,10.899],[33.897,10.932],[33.841,10.993]],[[34.657,10.964],[34.672,10.986],[34.67,11.101],[34.66,11.112],[34.647,11.097],[34.621,11.054],[34.657,10.964]],[[34.773,11.266],[34.743,11.306],[34.73,11.299],[34.664,11.13],[34.681,11.122],[34.728,11.169],[34.758,11.173],[34.751,11.184],[34.748,11.223],[34.782,11.216],[34.826,11.256],[34.806,11.306],[34.773,11.266]]],"NEIGH":[[[30.0,6.0],[36.855,6.0],[36.903,6.197],[36.947,6.255],[37.024,6.273],[37.07,6.338],[37.094,6.417],[37.083,6.503],[37.058,6.543],[36.974,6.601],[36.953,6.82],[36.893,6.91],[36.891,6.975],[36.926,7.094],[36.915,7.133],[36.915,7.159],[36.994,7.256],[37.023,7.252],[37.083,7.18],[37.09,7.223],[37.07,7.274],[37.083,7.382],[37.051,7.403],[37.041,7.457],[37.055,7.49],[36.987,7.591],[36.987,7.673],[36.964,7.713],[36.97,7.771],[36.994,7.799],[36.889,7.774],[36.854,7.868],[36.877,8.051],[36.958,8.231],[36.926,8.289],[36.901,8.462],[36.94,8.602],[36.891,8.609],[36.849,8.642],[36.803,8.555],[36.785,8.411],[36.768,8.408],[36.732,8.462],[36.663,8.429],[36.526,8.17],[36.491,8.167],[36.469,8.296],[36.43,8.357],[36.351,8.354],[36.244,8.307],[36.146,8.318],[36.036,8.275],[35.827,8.242],[35.751,8.257],[35.685,8.307],[35.621,8.329],[35.508,8.336],[35.403,8.289],[35.326,8.293],[35.29,8.318],[35.241,8.433],[35.067,8.3],[34.902,8.249],[34.763,8.271],[34.681,8.21],[34.648,8.235],[34.53,8.095],[34.414,7.832],[34.245,7.767],[34.199,7.63],[34.095,7.519],[33.894,7.479],[33.659,7.555],[33.414,7.709],[33.232,7.724],[33.208,7.749],[33.184,7.871],[33.108,8.001],[33.095,8.087],[32.805,8.296],[32.526,8.332],[32.105,9.02],[32.072,9.045],[30.229,9.52],[30.116,9.286],[30.0,9.383]],[[33.181,11.504],[33.166,11.562],[33.108,11.637],[33.081,11.792],[33.136,11.691],[33.083,11.846],[32.921,12.123],[32.833,12.35],[32.798,12.732],[32.805,12.825],[32.867,13.074],[32.913,13.164],[32.919,13.257],[32.904,13.351],[32.835,13.5],[30.0,13.5],[30.0,9.383],[30.116,9.286],[30.331,9.743],[30.354,9.873],[30.641,10.1],[30.731,10.194],[30.842,10.255],[30.915,10.269],[30.986,10.244],[31.079,10.244],[31.428,10.107],[31.518,10.132],[31.68,10.266],[31.715,10.316],[31.715,10.428],[31.744,10.5],[31.84,10.586],[31.954,10.608],[31.974,10.629],[31.962,10.705],[32.004,10.773],[32.136,10.874],[32.369,11.443],[32.435,11.547],[32.507,11.562],[32.637,11.45],[32.902,11.457],[33.181,11.504]]]};
const MAP = { x: 96, y: 72, w: 624, h: 918 };
const LAT_TOP = 37.55, LON_L = 7.75, MSC = 1.58, KX = 111.32 * Math.cos(35 * RAD) * MSC, KY = 110.57 * MSC;
const P = ([la, lo]) => [MAP.x + (lo - LON_L) * KX, MAP.y + (LAT_TOP - la) * KY];

// ---------- the background, painted once ----------
let BG = null;
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const g = BG.getContext('2d');
  const gr = g.createRadialGradient(W * 0.62, H * 0.45, 100, W * 0.55, H * 0.5, 1300);
  gr.addColorStop(0, C.bg1); gr.addColorStop(1, C.bg0);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // faint contour lines, like a survey map
  g.strokeStyle = C.contour; g.lineWidth = 2;
  const centres = [[1350, 520, 0.0], [1700, 180, 1.7], [900, 930, 3.1]];
  for (const [cx, cy, ph] of centres) {
    for (let r = 60; r < 900; r += 38) {
      g.beginPath();
      for (let i = 0; i <= 180; i++) {
        const a = (i / 180) * TAU, wob = 1 + 0.09 * Math.sin(3 * a + ph + r * 0.013) + 0.05 * Math.sin(7 * a - ph * 2 + r * 0.02);
        const x = cx + Math.cos(a) * r * wob * 1.25, y = cy + Math.sin(a) * r * wob * 0.8;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
  }
  // the map panel: sea, neighbours, Tunisia
  g.save();
  g.beginPath(); g.roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 22); g.clip();
  const sg = g.createLinearGradient(0, MAP.y, 0, MAP.y + MAP.h); sg.addColorStop(0, C.sea2); sg.addColorStop(1, C.sea);
  g.fillStyle = sg; g.fillRect(MAP.x, MAP.y, MAP.w, MAP.h);
  // neighbours (Algeria, Libya), outlined thickly so no sea shows along the shared border
  g.fillStyle = C.neigh; g.strokeStyle = C.neigh; g.lineWidth = 8; g.lineJoin = 'round';
  for (const r of MAPDATA.NEIGH) { g.beginPath(); r.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p)))); g.closePath(); g.fill(); g.stroke(); }
  const ring = MAPDATA.TUN[0];
  // Tunisia
  const lg = g.createLinearGradient(0, MAP.y, 0, MAP.y + MAP.h); lg.addColorStop(0, '#e9dbb6'); lg.addColorStop(1, '#e2c894');
  g.fillStyle = lg;
  for (const r of MAPDATA.TUN) { g.beginPath(); r.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p)))); g.closePath(); g.fill(); }
  // the Grand Erg Oriental, stippled, in the south-west of the land
  g.save(); g.beginPath(); ring.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p)))); g.closePath(); g.clip();
  g.fillStyle = 'rgba(201,143,82,0.55)';
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1500; i++) {
    const la = 30.4 + rnd() * 3.0, lo = 7.6 + rnd() * 2.3;
    if (la > 33.35 - (lo - 7.6) * 0.18) continue;
    const [x, y] = P([la, lo]); g.beginPath(); g.arc(x, y, 1.6 + rnd() * 1.6, 0, TAU); g.fill();
  }
  g.restore();
  // coast line
  g.strokeStyle = 'rgba(42,38,32,0.45)'; g.lineWidth = 2;
  for (const r of MAPDATA.TUN) { g.beginPath(); r.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p)))); g.closePath(); g.stroke(); }
  // the Matmata hills, as small ridges
  g.strokeStyle = 'rgba(120,92,58,0.8)'; g.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    const [x, y] = P([33.55 - i * 0.075, 10.08 + (i % 2) * 0.05]);
    g.beginPath(); g.moveTo(x - 11, y + 5); g.lineTo(x, y - 6); g.lineTo(x + 11, y + 5); g.stroke();
  }
  g.restore();
  g.strokeStyle = 'rgba(227,165,59,0.55)'; g.lineWidth = 3; g.beginPath(); g.roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 22); g.stroke();
}

// ---------- the map's moving parts ----------
const MARETH_LINE = [[33.705, 10.39], [33.66, 10.33], [33.6178, 10.2861], [33.56, 10.22], [33.5, 10.16], [33.467, 10.133]];
function pin(x, y, n, { a = 1, on = 0, t = 0 } = {}) {
  A(a, () => {
    if (on > 0) A(on, () => {
      const p = (t * 0.8) % 1;
      ctx.strokeStyle = C.ochre; ctx.lineWidth = 3; ctx.globalAlpha *= 1 - p;
      ctx.beginPath(); ctx.arc(x, y, 24 + p * 26, 0, TAU); ctx.stroke();
    });
    ctx.fillStyle = on > 0.5 ? C.ochre : C.bg0; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = C.ochre; ctx.stroke();
    txt(String(n), x, y + 2, { size: 32, weight: 800, color: on > 0.5 ? C.bg0 : C.ochre, align: 'center' });
  });
}
function townDot(ll, name, a, { dx = 14, dy = 0, align = 'left', color = C.dark, size = 32 } = {}) {
  if (a <= 0) return;
  const [x, y] = P(ll);
  A(a, () => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
    if (name) {
      // a soft halo so the name reads on land and on sea
      k.font(600, size, TEXT); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(233,219,182,0.85)'; ctx.lineJoin = 'round';
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
/** When stop i becomes the current stop (its chapter's first line), and how far the trail to it is drawn. */
const arrive = (i, t) => seg(t, s(STOPS[i].key, 0.2), s(STOPS[i].key, 2.4));
function drawMap(t) {
  ctx.save(); k.rrect(MAP.x, MAP.y, MAP.w, MAP.h, 22); ctx.clip();
  const end = CH.at(-1).at; // the last chapter: everything at once
  // neighbours and the sea
  mapLabel('ALGERIA', [35.4, 7.93], 1, { color: 'rgba(246,238,220,0.6)', size: 32, rot: -Math.PI / 2 });
  mapLabel('LIBYA', [32.72, 11.86], 1, { color: 'rgba(246,238,220,0.6)', size: 32, rot: -Math.PI / 2 });
  mapLabel('TUNISIA', [34.95, 9.25], span(t, s('a1', 0.2), CH[1].at + 1, 0.6, 0.8), { color: 'rgba(42,38,32,0.55)', size: 40, spacing: '8px', weight: 700 });
  mapLabel('GRAND ERG', [32.62, 8.5], span(t, s('k1', 0.6), CH[2].at + 1, 0.6, 0.8), { color: 'rgba(110,60,25,0.95)', size: 32, spacing: '3px', weight: 700, align: 'left' });
  mapLabel('ORIENTAL', [32.44, 8.5], span(t, s('k1', 0.6), CH[2].at + 1, 0.6, 0.8), { color: 'rgba(110,60,25,0.95)', size: 32, spacing: '3px', weight: 700, align: 'left' });

  // ---- chapter 1: the six months
  const c1 = span(t, s('a1'), CH[1].at + 1.0, 0.5, 0.8);
  if (c1 > 0) A(c1, () => {
    // a2: Axis troops into Tunis from the north (Sicily); a3: Allied armies from the west and from Libya
    A(seg(t, s('a2', 1.6), s('a2', 2.2)), () => {
      trace([P([37.75, 10.4]), P([37.25, 10.3]), P([36.86, 10.2])], eout(seg(t, s('a2', 1.6), s('a2', 3.2))), C.axis, { w: 9 });
      trace([P([37.75, 9.98]), P([37.34, 9.9])], eout(seg(t, s('a2', 1.9), s('a2', 3.2))), C.axis, { w: 9 });
      chip('Axis troops', ...P([37.0, 11.15]), { color: C.axis, size: 32, a: seg(t, s('a2', 2.4), s('a2', 3.0)) });
    });
    A(seg(t, s('a3', 0.2), s('a3', 0.8)), () => {
      trace(smooth([P([36.5, 7.6]), P([36.58, 8.5]), P([36.66, 9.2]), P([36.68, 9.5])]), eout(seg(t, s('a3', 0.3), s('a3', 2.2))), C.allied, { w: 10 });
      trace(smooth([P([32.3, 12.2]), P([32.8, 11.75]), P([33.15, 11.15]), P([33.32, 10.72])]), eout(seg(t, s('a3', 1.0), s('a3', 2.9))), C.allied, { w: 10 });
      chip('First Army', ...P([36.25, 8.95]), { color: C.allied, size: 32, a: seg(t, s('a3', 1.4), s('a3', 2.0)) });
      chip('Eighth Army', ...P([32.55, 10.75]), { color: C.allied, size: 32, a: seg(t, s('a3', 2.0), s('a3', 2.6)) });
    });
    // a4: the towns and villages where Tunisians lived through it
    const towns = [[36.806, 10.181], [37.274, 9.874], [36.45, 10.735], [35.825, 10.636], [35.678, 10.1], [35.5, 11.06], [34.74, 10.76],
      [33.883, 10.117], [33.875, 10.857], [33.355, 10.505], [32.93, 10.45], [36.18, 8.71], [36.73, 9.18], [34.425, 8.784], [35.17, 8.83],
      [35.77, 10.83], [36.4, 10.14], [33.92, 8.13], [36.95, 8.76], [35.03, 9.48], [33.7, 8.97], [36.08, 9.37], [34.3, 10.08]];
    towns.forEach((ll, i) => {
      const a = seg(t, s('a4', 0.2 + i * 0.12), s('a4', 0.6 + i * 0.12)) * (1 - seg(t, s('a6', 0.0), s('a6', 0.8)));
      if (a > 0) A(a, () => { const [x, y] = P(ll); ctx.fillStyle = C.dark; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); ctx.strokeStyle = C.ochre; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.stroke(); });
    });
    townDot(TOWNS.tunis, 'Tunis', seg(t, s('a2', 0.4), s('a2', 1.0)) * (1 - seg(t, s('a6', 0), s('a6', 0.8))), { dx: 16 });
  });

  // ---- the Mareth Line (drawn from the oasis chapter on, bright in its own)
  const lineA = Math.max(0.55 * seg(t, s('k3', 0.4), s('k3', 1.2)), seg(t, s('m2', 0.2), s('m2', 1.0)));
  if (lineA > 0) A(lineA, () => {
    ctx.strokeStyle = C.axis; ctx.lineWidth = 6; ctx.setLineDash([10, 6]); ctx.beginPath();
    MARETH_LINE.forEach((p, i) => (i ? ctx.lineTo(...P(p)) : ctx.moveTo(...P(p)))); ctx.stroke(); ctx.setLineDash([]);
  });

  // ---- chapter 2: Force L and the desert flank
  const c2 = span(t, s('k2'), CH[2].at + 1.0, 0.5, 0.8);
  if (c2 > 0) A(c2, () => {
    const [kx, ky] = P(STOPS[0].ll);
    trace(smooth([P([32.22, 11.1]), P([32.45, 10.6]), P([32.8, 10.05]), [kx + 26, ky + 8]]), eout(seg(t, s('k2', 0.4), s('k2', 2.6))), C.allied, { w: 9 });
    chip('Force L', ...P([32.5, 10.42]), { color: C.allied, size: 32, a: seg(t, s('k2', 1.6), s('k2', 2.2)) });
    // 10 March: a German armoured group, stopped short of the oasis
    const u = eout(seg(t, s('k4', 0.3), s('k4', 2.2)));
    A(seg(t, s('k4', 0.2), s('k4', 0.6)), () => trace(smooth([P([33.5, 10.15]), P([33.3, 9.95]), P([33.1, 9.76])]), u * 0.85, C.axis, { w: 9 }));
  });

  // ---- chapter 3: the frontal attack and the hook round the hills, at map scale
  const c3 = span(t, s('m5'), CH[3].at + 1.0, 0.5, 0.8);
  if (c3 > 0) A(c3, () => {
    const back = seg(t, e('m5', -1.0), e('m5', 0.2));
    const [fx0, fy0] = P([33.42, 10.68]), [fx1, fy1] = P([33.645, 10.38]);
    trace([[fx0, fy0], [lerp(fx1, lerp(fx0, fx1, 0.6), back), lerp(fy1, lerp(fy0, fy1, 0.6), back)]], eout(seg(t, s('m5', 0.4), s('m5', 2.0))), C.allied, { w: 8, headSize: 18 });
    const hook = smooth([P([33.05, 10.4]), P([32.97, 9.95]), P([33.08, 9.6]), P([33.4, 9.55]), P([33.68, 9.66]), P([33.86, 9.86]), P([33.9, 10.0])]);
    trace(hook, eio(seg(t, s('m6', 0.3), e('m6', -0.2))), C.allied, { w: 7, dash: [2, 12], headSize: 18 });
    A(seg(t, s('m7', 0.6), s('m7', 1.2)), () => trace([P([33.95, 10.15]), P([34.25, 10.15])], eout(seg(t, s('m7', 0.8), s('m7', 2.4))), C.axis, { w: 8, headSize: 18 }));
  });

  // ---- chapter 4: north to Enfidha
  const c4 = span(t, s('t1'), CH[4].at + 1.0, 0.5, 0.8);
  if (c4 > 0) A(c4, () => {
    trace(smooth([P([34.0, 10.05]), P([34.8, 10.35]), P([35.6, 10.5]), P([36.02, 10.42])]), eout(seg(t, s('t1', 0.3), s('t1', 2.6))), C.axis, { w: 8, headSize: 18 });
    // the Axis's last front, schematic: from the hills west of Enfidaville to the coast
    A(seg(t, s('t1', 2.0), s('t1', 2.8)), () => {
      ctx.strokeStyle = C.axis; ctx.lineWidth = 6; ctx.setLineDash([10, 6]); ctx.beginPath();
      [[36.22, 9.95], [36.17, 10.15], [36.16, 10.3], [36.13, 10.45]].forEach((p, i) => (i ? ctx.lineTo(...P(p)) : ctx.moveTo(...P(p)))); ctx.stroke(); ctx.setLineDash([]);
    });
    townDot(TOWNS.enfidha, 'Enfidha', seg(t, s('t1', 2.4), s('t1', 3.0)), { dx: 34, dy: 26 });
  });

  // ---- chapter 6: December and April on the road to Tunis
  const c6 = span(t, s('l1'), CH[6].at + 1.0, 0.5, 0.8);
  if (c6 > 0) A(c6, () => {
    townDot(TOWNS.tunis, 'Tunis', seg(t, s('l1', 1.0), s('l1', 1.6)), { dx: 16 });
    townDot(TOWNS.medjez, 'Medjez el Bab', seg(t, s('l1', 1.6), s('l1', 2.2)), { dx: -8, dy: 40, align: 'right' });
    A(span(t, s('l5', 0.2), s('l7', 0), 0.5, 0.5), () => trace([P([36.62, 8.8]), P([36.71, 9.5])], eout(seg(t, s('l5', 0.3), s('l5', 2.0))), C.allied, { w: 8, headSize: 18 }));
    A(seg(t, s('l8', 3.4), s('l8', 4.0)), () => trace(smooth([P([36.75, 9.75]), P([36.79, 9.95]), P([36.8, 10.1])]), eout(seg(t, s('l8', 3.6), s('l8', 5.0))), C.allied, { w: 8, headSize: 16 }));
  });

  // ---- the trail and the stops
  const preview = span(t, s('o4', 0.6), CH[1].at + 0.4, 0.8, 0.6) * 0.5 + span(t, s('a6', 0.2), s('a7', 2), 0.5, 1.2) * 0.5;
  const pts = STOPS.map((st) => P(st.ll));
  for (let i = 1; i < STOPS.length; i++) {
    const seg0 = smooth([pts[i - 1], [lerp(pts[i - 1][0], pts[i][0], 0.5) + (i % 2 ? 26 : -26), lerp(pts[i - 1][1], pts[i][1], 0.5)], pts[i]], 10);
    const done = Math.max(arrive(i, t), t >= end ? 1 : 0);
    if (preview > 0) A(preview * 0.6, () => trace(seg0, eio(seg(t, s('a6', 0.3 + i * 0.4), s('a6', 1.2 + i * 0.4))) || (t < s('a6') ? 1 : 0), C.ochre, { w: 5, dash: [3, 12], head: false }));
    if (done > 0) trace(seg0, eio(done), C.ochre, { w: 6, dash: [3, 11], head: false });
  }
  const cur = CH.findIndex((c, i) => t >= c.at && (i + 1 >= CH.length || t < CH[i + 1].at)) - 1; // stop index of the current chapter
  STOPS.forEach((st, i) => {
    const [x, y] = pts[i];
    const seen = Math.max(preview, seg(t, s(st.key, 1.8), s(st.key, 2.4)), t > s(st.key) ? 1 : 0);
    const on = cur === i ? span(t, s(st.key, 1.8), (CH[i + 3]?.at ?? DURATION) + 0.5, 0.5, 0.5) : 0;
    const last = seg(t, s('r1', 0.4 + i * 0.4), s('r1', 1.0 + i * 0.4));
    pin(x, y, i + 1, { a: Math.max(seen, last), on: Math.max(on, 0), t });
    const nameA = Math.max(on, last, span(t, s('o4', 0.8), CH[0].at, 0.6, 0.6) * 0);
    if (nameA > 0) {
      const right = st.side === 'right';
      A(nameA, () => {
        k.font(700, 32, TEXT); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(10,31,29,0.85)'; ctx.lineJoin = 'round';
        ctx.textAlign = right ? 'left' : 'right'; ctx.textBaseline = 'middle'; ctx.strokeText(st.name, x + (right ? 34 : -34), y);
        txt(st.name, x + (right ? 34 : -34), y, { size: 32, weight: 700, color: C.ink, align: right ? 'left' : 'right' });
      });
    }
  });
  ctx.restore();
  A(1, () => txt('schematic map', MAP.x + 20, MAP.y + 32, { size: 32, weight: 500, color: 'rgba(246,238,220,0.55)' }));
}

// ---------- the right-hand panel ----------
const RX = 800, RW = 1000, RCX = RX + RW / 2; // x 800–1800
const WIN = { x: 800, y: 250, w: 1000, h: 700 };
function windowFrame(fn, { line = 'rgba(227,165,59,0.5)' } = {}) {
  ctx.save(); k.rrect(WIN.x, WIN.y, WIN.w, WIN.h, 22); ctx.clip(); fn(); ctx.restore();
  ctx.strokeStyle = line; ctx.lineWidth = 3; k.rrect(WIN.x, WIN.y, WIN.w, WIN.h, 22); ctx.stroke();
}
/** The stop's header: its number, its name, and three tabs, the current one lit. */
function header(t, i, tabs) {
  const st = STOPS[i];
  const a = 1;
  A(a, () => {
    txt('STOP', RX, 112, { size: 32, weight: 700, color: C.ochre, spacing: '4px' });
    const wS = textW('STOP', { size: 32, weight: 700, spacing: '4px' });
    txt(String(i + 1), RX + wS + 12, 112, { size: 32, weight: 800, color: C.ochre });
    txt('/', RX + wS + 34, 112, { size: 32, weight: 500, color: C.soft });
    txt(String(STOPS.length), RX + wS + 50, 112, { size: 32, weight: 700, color: C.soft });
    txtFit(PLACE[i], RX, 190, RW, { size: 62, weight: 700, family: DISPLAY, color: C.ink });
    // tabs, right-aligned
    const lit = tabs.map(([, from], j) => {
      const on = seg(t, s(from, -0.1), s(from, 0.4));
      const next = tabs[j + 1] ? seg(t, s(tabs[j + 1][1], -0.1), s(tabs[j + 1][1], 0.4)) : 0;
      return on * (1 - next);
    });
    let x = RX + RW;
    for (let j = tabs.length - 1; j >= 0; j--) {
      const str = tabs[j][0], w = textW(str, { size: 32, weight: 700 }) + 40;
      x -= w;
      const l = lit[j];
      k.rrect(x, 86, w, 52, 26);
      ctx.fillStyle = l > 0 ? `rgba(227,165,59,${0.15 + 0.85 * l})` : 'rgba(9,29,27,0.8)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = C.ochre; ctx.stroke();
      txt(str, x + w / 2, 113, { size: 32, weight: 700, color: l > 0.5 ? C.bg0 : C.ochre, align: 'center' });
      x -= 14;
    }
  });
}
const PLACE = ['Ksar Ghilane', 'Mareth', 'Takrouna', 'Dar Sebastian, Hammamet', 'Longstop Hill'];

// ---------- drawings of the places ----------
function sky(top, bottom) { const g = ctx.createLinearGradient(0, WIN.y, 0, WIN.y + WIN.h); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h); }
/** Mix two colours (#rrggbb or rgb(...)) by u. */
const rgbOf = (c) => (c[0] === '#' ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.match(/[\d.]+/g).slice(0, 3).map(Number));
const mix = (c1, c2, u) => { const a = rgbOf(c1), b = rgbOf(c2); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(',')})`; };
function palm(x, y, hgt, col = '#24402c') {
  ctx.strokeStyle = '#4a3a28'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 8, y - hgt * 0.5, x + 4, y - hgt); ctx.stroke();
  ctx.fillStyle = col;
  for (let j = 0; j < 7; j++) {
    const a = -Math.PI / 2 + (j - 3) * 0.48;
    ctx.beginPath(); ctx.moveTo(x + 4, y - hgt);
    ctx.quadraticCurveTo(x + 4 + Math.cos(a) * 46, y - hgt + Math.sin(a) * 46 - 14, x + 4 + Math.cos(a) * 78, y - hgt + Math.sin(a) * 50 + 22);
    ctx.quadraticCurveTo(x + 4 + Math.cos(a) * 40, y - hgt + Math.sin(a) * 30, x + 4, y - hgt + 4); ctx.fill();
  }
}
/** Ksar Ghilane: dunes, palms round a spring, the Roman fort on a rise, the slim stele. dusk 0..1 (1 = dusk). */
function drawOasis(t, { dusk = 1, steam = 0 } = {}) {
  sky(mix('#8fb3c4', '#2a2340', dusk), mix('#f0d9a8', '#d98a52', dusk));
  // the sun low in the west
  A(dusk, () => { ctx.fillStyle = 'rgba(255,214,150,0.9)'; ctx.beginPath(); ctx.arc(WIN.x + 170, WIN.y + 420, 46, 0, TAU); ctx.fill(); });
  // dune bands
  const bands = [['#d9a45e', '#a8653a', 470, 40, 0.004, 1.2], ['#c98b4a', '#8f4f2c', 540, 32, 0.006, 2.6], ['#e3b46f', '#b0703d', 610, 26, 0.008, 0.4]];
  for (const [day, dk, y0, amp, f, ph] of bands) {
    ctx.fillStyle = mix(day, dk, dusk); ctx.beginPath(); ctx.moveTo(WIN.x, WIN.y + WIN.h);
    for (let x = 0; x <= WIN.w; x += 10) ctx.lineTo(WIN.x + x, WIN.y + y0 - amp * Math.sin(x * f + ph) - amp * 0.5 * Math.sin(x * f * 2.7 + ph * 2));
    ctx.lineTo(WIN.x + WIN.w, WIN.y + WIN.h); ctx.closePath(); ctx.fill();
  }
  const base = WIN.y + 640;
  // the spring
  ctx.fillStyle = mix('#5fb2b0', '#3b6f78', dusk); ctx.beginPath(); ctx.ellipse(WIN.x + 360, base + 8, 90, 18, 0, 0, TAU); ctx.fill();
  if (steam > 0) A(steam, () => {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let j = 0; j < 3; j++) { const x = WIN.x + 320 + j * 40, ph = t * 1.4 + j; ctx.beginPath(); ctx.moveTo(x, base - 6); ctx.bezierCurveTo(x + 10 * Math.sin(ph), base - 40, x - 10 * Math.sin(ph), base - 60, x + 6 * Math.sin(ph + 1), base - 90); ctx.stroke(); }
    ctx.lineCap = 'butt';
  });
  // palms
  const pc = mix('#3c6b3f', '#1f3527', dusk);
  [[220, 150], [270, 190], [320, 165], [410, 200], [460, 160], [510, 180], [250, 120]].forEach(([dx, h]) => palm(WIN.x + dx, base, h, pc));
  // Tisavar, the Roman fort, on a rise to the right
  const fx = WIN.x + 720, fy = base - 30;
  ctx.fillStyle = mix('#d8b47a', '#8a5a3a', dusk); ctx.beginPath(); ctx.ellipse(fx, fy + 40, 190, 50, 0, Math.PI, TAU); ctx.fill();
  ctx.fillStyle = mix('#b99467', '#6b4a33', dusk);
  ctx.beginPath(); ctx.moveTo(fx - 120, fy + 10); ctx.lineTo(fx - 120, fy - 50); ctx.lineTo(fx - 90, fy - 50); ctx.lineTo(fx - 80, fy - 30); ctx.lineTo(fx - 30, fy - 34); ctx.lineTo(fx - 20, fy - 58); ctx.lineTo(fx + 20, fy - 58);
  ctx.lineTo(fx + 30, fy - 30); ctx.lineTo(fx + 90, fy - 26); ctx.lineTo(fx + 110, fy - 44); ctx.lineTo(fx + 120, fy + 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(fx - 8, fy - 30, 16, 34);
  // the stele, slim, east of the palms
  const sx = WIN.x + 880;
  ctx.fillStyle = mix('#f2ead8', '#d9cdb4', dusk);
  ctx.beginPath(); ctx.moveTo(sx - 14, base + 6); ctx.lineTo(sx - 10, base - 150); ctx.lineTo(sx, base - 172); ctx.lineTo(sx + 10, base - 150); ctx.lineTo(sx + 14, base + 6); ctx.closePath(); ctx.fill();
  ctx.fillRect(sx - 26, base - 4, 52, 12);
  return { spring: [WIN.x + 360, base + 8], fort: [fx, fy - 60], stele: [sx, base - 172], base, palms: [WIN.x + 360, base - 200] };
}
/** The museum's hill above the wadi, with a casemate in section and its slit facing right (south-east). */
function drawMarethHill(t, { day = 1, museum = 1, cut = 1 } = {}) {
  sky(mix('#33465a', '#9cc1d3', day), mix('#a8845c', '#e9d3a3', day));
  const gx = WIN.x, gy = WIN.y;
  // the hill and the plain
  ctx.fillStyle = '#9b8259'; ctx.beginPath(); ctx.moveTo(gx, gy + 470); ctx.quadraticCurveTo(gx + 210, gy + 330, gx + 430, gy + 360); ctx.quadraticCurveTo(gx + 560, gy + 380, gx + 640, gy + 520); ctx.lineTo(gx, gy + 520); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c9ae7c'; ctx.beginPath(); ctx.moveTo(gx, gy + 520); ctx.lineTo(gx + 640, gy + 520); ctx.lineTo(gx + 700, gy + 590); ctx.lineTo(gx + 820, gy + 590); ctx.lineTo(gx + 860, gy + 540); ctx.lineTo(gx + WIN.w, gy + 540); ctx.lineTo(gx + WIN.w, gy + WIN.h); ctx.lineTo(gx, gy + WIN.h); ctx.closePath(); ctx.fill();
  // the wadi bed and the anti-tank rails on its steepened bank
  ctx.fillStyle = '#5a7a74'; ctx.fillRect(gx + 700, gy + 580, 120, 10);
  ctx.fillStyle = '#4a4a46'; for (let i = 0; i < 5; i++) ctx.fillRect(gx + 712 + i * 22, gy + 548, 6, 38);
  // the museum on the hilltop
  if (museum > 0) A(museum, () => {
    ctx.fillStyle = '#ece6d6'; ctx.fillRect(gx + 150, gy + 290, 220, 80); ctx.fillStyle = '#ece6d6'; ctx.fillRect(gx + 230, gy + 262, 60, 30);
    ctx.fillStyle = '#2d3b39'; for (let i = 0; i < 5; i++) ctx.fillRect(gx + 166 + i * 40, gy + 312, 22, 36);
  });
  // the casemate, in section, dug into the slope
  if (cut > 0) A(cut, () => {
    const cx = gx + 470, cy = gy + 500;
    ctx.fillStyle = '#7c6747'; ctx.beginPath(); ctx.moveTo(cx - 170, cy + 20); ctx.quadraticCurveTo(cx - 20, cy - 170, cx + 150, cy - 30); ctx.lineTo(cx + 170, cy + 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#bab7ad'; ctx.fillRect(cx - 110, cy - 110, 230, 124);
    ctx.fillStyle = '#8f8d85'; ctx.fillRect(cx - 82, cy - 82, 170, 82);
    ctx.fillStyle = '#1b1d1a'; ctx.fillRect(cx + 88, cy - 62, 34, 20); // the firing slit, facing right
    ctx.fillStyle = '#1b1d1a'; ctx.fillRect(cx - 110, cy - 54, 12, 54); // the door at the back
  });
  return { slit: [gx + 590, gy + 448], museum: [gx + 260, gy + 262], wadi: [gx + 760, gy + 600], cas: [gx + 470, gy + 450] };
}
/** Takrouna's rock in profile: the cliff on its left, the ledge, houses on top; night 0..1. */
const ROCK = (() => {
  const x0 = WIN.x, y0 = WIN.y;
  return [[x0 + 120, y0 + 640], [x0 + 300, y0 + 600], [x0 + 340, y0 + 560], [x0 + 352, y0 + 330], [x0 + 372, y0 + 300], [x0 + 420, y0 + 296], [x0 + 432, y0 + 250],
    [x0 + 470, y0 + 200], [x0 + 600, y0 + 190], [x0 + 680, y0 + 220], [x0 + 760, y0 + 330], [x0 + 860, y0 + 520], [x0 + 960, y0 + 640]];
})();
const LEDGE = [WIN.x + 396, WIN.y + 298];
function drawRock(t, { night = 0, day = 1 } = {}) {
  sky(mix(mix('#e7a46a', '#9ec2d6', day), '#121a30', night), mix(mix('#f3d39b', '#e8dcc0', day), '#2a2f4f', night));
  ctx.fillStyle = mix('#565b36', '#1e2219', night); ctx.fillRect(WIN.x, WIN.y + 600, WIN.w, 100);
  // olive trees on the plain
  ctx.fillStyle = mix('#6f7446', '#262a1d', night);
  for (let i = 0; i < 18; i++) { const x = WIN.x + 20 + i * 56, y = WIN.y + 650 + (i % 3) * 12; ctx.beginPath(); ctx.ellipse(x, y, 20, 12, 0, 0, TAU); ctx.fill(); }
  // the rock
  ctx.fillStyle = mix('#c7a77a', '#3b3546', night); ctx.beginPath(); ROCK.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.fill();
  ctx.fillStyle = mix('#9c7e57', '#2b2736', night); ctx.beginPath(); ctx.moveTo(...ROCK[2]); ctx.lineTo(...ROCK[3]); ctx.lineTo(...ROCK[4]); ctx.lineTo(WIN.x + 400, WIN.y + 560); ctx.closePath(); ctx.fill();
  // the houses on top, and the shrine's dome
  const hc = mix('#efe6d6', '#6a6478', night);
  [[470, 180, 50, 26], [520, 170, 44, 34], [566, 172, 56, 24], [626, 182, 40, 30], [490, 200, 70, 20]].forEach(([x, y, w, h]) => { ctx.fillStyle = hc; ctx.fillRect(WIN.x + x, WIN.y + y - h, w, h + 14); });
  ctx.fillStyle = hc; ctx.beginPath(); ctx.arc(WIN.x + 600, WIN.y + 150, 20, Math.PI, TAU); ctx.fill(); ctx.fillRect(WIN.x + 580, WIN.y + 150, 40, 14);
  ctx.fillStyle = mix('#3d6f9e', '#2b2f45', night); ctx.fillRect(WIN.x + 530, WIN.y + 156, 10, 16); ctx.fillRect(WIN.x + 580, WIN.y + 160, 9, 12);
  // stars at night
  if (night > 0) A(night, () => { ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 40; i++) { const x = WIN.x + ((i * 397) % WIN.w), y = WIN.y + 20 + ((i * 131) % 200); ctx.fillRect(x, y, 2.5, 2.5); } });
}
/** A cemetery, drawn plainly: rows of headstones in perspective and a Cross of Sacrifice. */
function drawCemetery({ green = '#6f8f5a' } = {}) {
  sky('#9cc1d3', '#e8e2cc');
  ctx.fillStyle = green; ctx.beginPath(); ctx.moveTo(WIN.x, WIN.y + 330); ctx.lineTo(WIN.x + WIN.w, WIN.y + 330); ctx.lineTo(WIN.x + WIN.w, WIN.y + WIN.h); ctx.lineTo(WIN.x, WIN.y + WIN.h); ctx.closePath(); ctx.fill();
  for (let r = 0; r < 6; r++) {
    const y = WIN.y + 360 + r * r * 9 + r * 26, sc = 0.45 + r * 0.16, n = 14 - r;
    for (let i = 0; i < n; i++) {
      const x = WIN.x + WIN.w / 2 + (i - (n - 1) / 2) * 64 * sc * 1.15;
      ctx.fillStyle = '#ece8dd'; k.rrect(x - 12 * sc, y - 34 * sc, 24 * sc, 34 * sc, 8 * sc); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x - 12 * sc, y, 24 * sc, 4 * sc);
    }
  }
  // the Cross of Sacrifice
  const cx = WIN.x + WIN.w / 2, cy = WIN.y + 330;
  ctx.fillStyle = '#f2efe6'; ctx.fillRect(cx - 9, cy - 190, 18, 190); ctx.fillRect(cx - 50, cy - 150, 100, 16);
  ctx.fillStyle = '#d9d4c6'; ctx.fillRect(cx - 34, cy - 12, 68, 12);
}
/** Dar Sebastian: a white house with arcades and a small dome, garden, sea; the open-air theatre beside it. */
function drawVilla(t, { theatre = 0 } = {}) {
  sky('#9ccbe0', '#e9f1ec');
  ctx.fillStyle = '#2f7590'; ctx.fillRect(WIN.x, WIN.y + 300, WIN.w, 90);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 12; i++) ctx.fillRect(WIN.x + 40 + i * 82, WIN.y + 330 + (i % 3) * 18, 36, 3);
  ctx.fillStyle = '#4f8a4a'; ctx.fillRect(WIN.x, WIN.y + 390, WIN.w, 310);
  // the house
  const hx = WIN.x + 230, hy = WIN.y + 520;
  ctx.fillStyle = '#f7f4ec'; ctx.fillRect(hx, hy - 150, 360, 150); ctx.fillRect(hx + 120, hy - 200, 140, 52);
  ctx.beginPath(); ctx.arc(hx + 190, hy - 200, 40, Math.PI, TAU); ctx.fill();
  ctx.fillStyle = '#3a6f8f';
  for (let i = 0; i < 5; i++) { const ax = hx + 30 + i * 66; ctx.beginPath(); ctx.moveTo(ax, hy); ctx.lineTo(ax, hy - 64); ctx.arc(ax + 22, hy - 64, 22, Math.PI, TAU); ctx.lineTo(ax + 44, hy); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#dfe7e4'; ctx.fillRect(hx - 20, hy, 400, 12);
  // garden: cypresses, palms, shrubs
  ctx.fillStyle = '#2f5a35';
  [[150, 560, 120], [620, 560, 140], [660, 600, 110], [120, 640, 90]].forEach(([x, y, h]) => { ctx.beginPath(); ctx.ellipse(WIN.x + x, y + WIN.y - h / 2 - 40, 18, h / 2, 0, 0, TAU); ctx.fill(); });
  palm(WIN.x + 70, WIN.y + 640, 170, '#2f5a35'); palm(WIN.x + 700, WIN.y + 650, 190, '#2f5a35');
  ctx.fillStyle = '#6aa05c'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(WIN.x + 120 + i * 70, WIN.y + 640 + (i % 2) * 20, 34, 18, 0, 0, TAU); ctx.fill(); }
  // the open-air theatre: tiers of a half-circle
  if (theatre > 0) A(theatre, () => {
    const tx = WIN.x + 850, ty = WIN.y + 560;
    for (let r = 5; r >= 1; r--) { ctx.fillStyle = r % 2 ? '#e6dcc4' : '#d6c9aa'; ctx.beginPath(); ctx.ellipse(tx, ty, 40 + r * 22, 16 + r * 9, 0, Math.PI, TAU); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#c8b68e'; ctx.fillRect(tx - 60, ty, 120, 14);
  });
  return { house: [hx + 190, hy - 250], theatre: [WIN.x + 850, WIN.y + 470] };
}
/** The ridge from the south: Djebel Rhar higher on the left (west), Djebel el Ahmera on the right; the valley in front. */
function drawRidge(t, { rain = 0, spring = 0 } = {}) {
  const top = mix(mix('#a9c4d4', '#4f5d6c', rain), '#9fcde3', spring), bot = mix(mix('#e7dcc0', '#8d97a0', rain), '#e9f0d8', spring);
  sky(top, bot);
  const slope = mix(mix('#9a8a62', '#5d6460', rain), '#7fa05a', spring), slope2 = mix(mix('#857652', '#4c5350', rain), '#6a8d4a', spring);
  const pts = [[0, 540], [120, 470], [250, 330], [330, 290], [400, 320], [520, 410], [600, 380], [680, 340], [740, 360], [860, 450], [1000, 520]];
  ctx.fillStyle = slope2; ctx.beginPath(); ctx.moveTo(WIN.x, WIN.y + WIN.h);
  smooth(pts.map(([x, y]) => [WIN.x + x, WIN.y + y])).forEach((p) => ctx.lineTo(...p)); ctx.lineTo(WIN.x + WIN.w, WIN.y + WIN.h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = slope; ctx.beginPath(); ctx.moveTo(WIN.x, WIN.y + WIN.h);
  smooth(pts.map(([x, y]) => [WIN.x + x, WIN.y + y + 40 + 0.08 * (x - 500)])).forEach((p) => ctx.lineTo(...p)); ctx.lineTo(WIN.x + WIN.w, WIN.y + WIN.h); ctx.closePath(); ctx.fill();
  // the valley: the river and the road
  ctx.fillStyle = mix('#c8b98f', '#8b9083', rain); ctx.fillRect(WIN.x, WIN.y + 600, WIN.w, 100);
  ctx.strokeStyle = mix('#4f8fa8', '#4a6470', rain); ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(WIN.x, WIN.y + 640);
  for (let x = 0; x <= WIN.w; x += 20) ctx.lineTo(WIN.x + x, WIN.y + 640 + 10 * Math.sin(x * 0.012)); ctx.stroke();
  ctx.strokeStyle = '#5b5750'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(WIN.x, WIN.y + 680); ctx.lineTo(WIN.x + WIN.w, WIN.y + 668); ctx.stroke();
  ctx.strokeStyle = '#e8e2cc'; ctx.lineWidth = 2; ctx.setLineDash([18, 16]); ctx.beginPath(); ctx.moveTo(WIN.x, WIN.y + 680); ctx.lineTo(WIN.x + WIN.w, WIN.y + 668); ctx.stroke(); ctx.setLineDash([]);
  if (rain > 0) A(rain, () => {
    ctx.strokeStyle = 'rgba(220,230,240,0.45)'; ctx.lineWidth = 2;
    for (let i = 0; i < 90; i++) { const x = WIN.x + ((i * 173 + t * 260) % WIN.w), y = WIN.y + ((i * 97 + t * 900) % WIN.h); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 26); ctx.stroke(); }
  });
  return { rhar: [WIN.x + 330, WIN.y + 290], ahmera: [WIN.x + 680, WIN.y + 340], road: [WIN.x + 860, WIN.y + 672], river: [WIN.x + 200, WIN.y + 630] };
}

// ---------- cold open ----------
function partOpen(t) {
  const v1 = span(t, s('o1', 0), s('o2', 0.2), 0.6, 0.6), v2 = span(t, s('o2', 0), s('o3', 0.2), 0.6, 0.6), v3 = span(t, s('o3', 0), s('o4', 0.6), 0.6, 0.6);
  if (v1 > 0) A(v1, () => { windowFrame(() => { const o = drawOasis(t, { dusk: 1 }); A(seg(t, s('o1', 1.5), s('o1', 2.2)), () => { ctx.strokeStyle = C.ochre; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(o.stele[0], o.stele[1] + 80, 110, 0, TAU); ctx.stroke(); }); }); });
  if (v2 > 0) A(v2, () => windowFrame(() => {
    const m = drawMarethHill(t, { day: 1 });
    A(seg(t, s('o2', 1.0), s('o2', 1.6)), () => { trace([m.slit, [m.slit[0] + 220, m.slit[1] + 110]], eout(seg(t, s('o2', 1.0), s('o2', 2.4))), C.ochre, { w: 8 }); });
  }));
  if (v3 > 0) A(v3, () => windowFrame(() => {
    drawRock(t, { night: 0.5 * (1 - seg(t, s('o3', 0.6), s('o3', 2.6))), day: 0 });
    const n = 6, u = seg(t, s('o3', 0.8), e('o3', 0.2));
    for (let i = 0; i < n; i++) { const f = Math.max(0, Math.min(1, u * 1.6 - i * 0.12)); const y = lerp(WIN.y + 560, LEDGE[1] + 10, f); ctx.fillStyle = C.mint; ctx.beginPath(); ctx.arc(WIN.x + 346 - 4 * Math.sin(f * 6), y, 7, 0, TAU); ctx.fill(); }
  }));
  // o4: the title, beside the map, until the first chapter card
  const ti = eout(seg(t, s('o4', 1.2), s('o4', 2.4)));
  A(ti, () => {
    txt('ON THE TRAIL', RCX, 420 + (1 - ti) * 18, { size: fit('ON THE TRAIL', 980, 120, { weight: 800, family: DISPLAY, spacing: '4px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '4px' });
    txt('OF 1943', RCX, 560 + (1 - ti) * 18, { size: 120, weight: 800, family: DISPLAY, color: C.ochre, align: 'center', spacing: '4px' });
    ctx.fillStyle = C.ochre; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(RCX - 160 + i * 40, 660, 5, 0, TAU); ctx.fill(); }
    txtFit('Five places in Tunisia that tell the story of the war', RCX, 740, 960, { size: 40, weight: 600, color: C.soft, align: 'center' });
  });
}

// ---------- 1: six months of war ----------
const MONTHS = ['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'];
const TLX0 = 830, TLX1 = 1770, tlx = (ms) => lerp(TLX0, TLX1, (ms - D0) / (D1 - D0));
function timeline(t, y, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.faint; ctx.fillRect(TLX0, y - 3, TLX1 - TLX0, 6);
    for (let m = 0; m <= 7; m++) { const x = tlx(Date.UTC(1942, 10 + m, 1)); ctx.fillStyle = C.soft; ctx.fillRect(x - 1.5, y - 14, 3, 28); }
    MONTHS.forEach((mo, j) => { const x = (tlx(Date.UTC(1942, 10 + j, 1)) + tlx(Date.UTC(1942, 11 + j, 1))) / 2; txt(mo, x, y + 44, { size: 32, weight: 700, color: C.soft, align: 'center', spacing: '2px' }); });
    txt('1942', tlx(Date.UTC(1942, 10, 1)), y - 46, { size: 32, weight: 700, color: C.ochre });
    txt('1943', tlx(Date.UTC(1943, 0, 1)), y - 46, { size: 32, weight: 700, color: C.ochre });
  });
}
function tlMark(ms, y, label, sub, col, a, { up = true } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const x = tlx(ms);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + (up ? -16 : 16)); ctx.lineTo(x, y + (up ? -120 : 120)); ctx.stroke();
    const al = x > 1500 ? 'right' : 'left', xx = x + (al === 'right' ? -14 : 14);
    txt(label, xx, y + (up ? -150 : 150), { size: 36, weight: 800, color: col, align: al });
    if (sub) txt(sub, xx, y + (up ? -108 : 192), { size: 32, weight: 500, color: C.ink, align: al });
  });
}
function partWar(t) {
  // a1: the protectorate
  A(span(t, s('a1', 0.2), s('a2', 0.3), 0.5, 0.5), () => {
    card(860, 330, 880, 300, { line: 'rgba(227,165,59,0.6)' });
    txt('1942', RCX, 400, { size: 44, weight: 800, color: C.ochre, align: 'center' });
    txtFit('A French protectorate', RCX, 476, 820, { size: 60, weight: 700, family: DISPLAY, align: 'center' });
    txtFit('ruled in name by the Bey of Tunis', RCX, 556, 820, { size: 40, weight: 500, color: C.soft, align: 'center' });
  });
  // a2 onwards: the six months as a timeline
  const tlA = span(t, s('a2', 0.1), s('a6', 0.4), 0.6, 0.6);
  const Y = 640;
  timeline(t, Y, tlA);
  if (tlA > 0) A(tlA, () => {
    tlMark(Date.UTC(1942, 10, 8), Y, '8 NOV 1942', 'Allied landings', C.allied, seg(t, s('a2', 0.3), s('a2', 1.0)));
    tlMark(Date.UTC(1942, 10, 9), Y, 'Axis troops', 'into Tunis', C.axis, seg(t, s('a2', 2.6), s('a2', 3.3)), { up: false });
    tlMark(Date.UTC(1943, 4, 13), Y, '13 MAY 1943', 'surrender', C.ochre, seg(t, s('a5', 0.3), s('a5', 1.0)));
    // the six months, filled in
    const fill = eio(seg(t, s('a5', 0.2), s('a5', 1.8)));
    if (fill > 0) { ctx.fillStyle = C.ochre; ctx.fillRect(tlx(Date.UTC(1942, 10, 8)), Y - 4, (tlx(Date.UTC(1943, 4, 13)) - tlx(Date.UTC(1942, 10, 8))) * fill, 8); }
    // a3: soldiers of many nations
    A(span(t, s('a3', 0.6), s('a4', 0.2), 0.5, 0.5), () => {
      const L = ['Britain', 'France', 'United States', 'New Zealand', 'India', 'Australia', 'South Africa'], R = ['Germany', 'Italy'];
      let x = 840, y = 300;
      txt('Allies', 840, 240, { size: 34, weight: 800, color: C.allied, spacing: '3px' });
      L.forEach((n, j) => {
        const a = seg(t, s('a3', 0.8 + j * 0.25), s('a3', 1.2 + j * 0.25)), w = textW(n, { size: 32, weight: 700 }) + 40;
        if (x + w > 1520) { x = 840; y += 66; }
        chip(n, x, y, { color: C.allied, size: 32, a, align: 'left' }); x += w + 14;
      });
      txt('Axis', 1580, 240, { size: 34, weight: 800, color: C.axis, spacing: '3px' });
      R.forEach((n, j) => chip(n, 1580, 300 + j * 66, { color: C.axis, size: 32, a: seg(t, s('a3', 2.6 + j * 0.25), s('a3', 3.0 + j * 0.25)), align: 'left' }));
    });
    // a4: the people of Tunisia
    A(span(t, s('a4', 0.2), s('a5', 0.2), 0.5, 0.5), () => {
      txtFit('Tunisians of every faith', RCX, 290, 960, { size: 54, weight: 700, family: DISPLAY, align: 'center' });
      ['Muslims', 'Jews', 'Christians'].forEach((n, j) => chip(n, RCX + (j - 1) * 290, 390, { color: C.ochre, size: 36, a: seg(t, s('a4', 1.0 + j * 0.4), s('a4', 1.5 + j * 0.4)) }));
    });
  });
  // a6: the trail, south to north, as a list from the bottom up
  A(span(t, s('a6', 0.3), s('a7', 0.2), 0.5, 0.5), () => {
    STOPS.forEach((st, i) => {
      const a = eout(seg(t, s('a6', 0.5 + i * 0.4), s('a6', 1.0 + i * 0.4))), y = 860 - i * 120;
      A(a, () => {
        ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(RX + 40, y, 24, 0, TAU); ctx.fill(); ctx.strokeStyle = C.ochre; ctx.lineWidth = 4; ctx.stroke();
        txt(String(i + 1), RX + 40, y + 2, { size: 32, weight: 800, color: C.ochre, align: 'center' });
        txt(PLACE[i], RX + 86, y, { size: 40, weight: 700, color: C.ink });
        if (i) { ctx.fillStyle = 'rgba(227,165,59,0.6)'; for (let d = 0; d < 4; d++) ctx.fillRect(RX + 37, y + 34 + d * 16, 6, 8); }
      });
    });
    A(seg(t, s('a6', 2.4), s('a6', 3.0)), () => {
      txt(fmt(Math.round(TOTAL_KM / 100) * 100), RX + RW - 70, 560, { size: 120, weight: 800, family: DISPLAY, color: C.ochre, align: 'right' });
      txt('km', RX + RW, 574, { size: 48, weight: 700, color: C.soft, align: 'right' });
      txt('as the crow flies', RX + RW, 660, { size: 36, weight: 500, color: C.soft, align: 'right' });
    });
  });
  // a7: three questions at every stop
  A(span(t, s('a7', 0.1), CH[1].at + 1.0, 0.5, 0.6), () => {
    const tabs = [['1943', 'what happened'], ['TODAY', 'what you see'], ['ON THE SPOT', 'how to read it']];
    tabs.forEach(([h, sub], j) => {
      const a = eout(seg(t, s('a7', 0.4 + j * 0.9), s('a7', 1.0 + j * 0.9)));
      const cx = RX + 170 + j * 330;
      chip(h, cx, 480 + (1 - a) * 12, { color: C.ochre, size: 38, a });
      A(a, () => txtFit(sub, cx, 570, 310, { size: 36, weight: 500, color: C.ink, align: 'center' }));
    });
  });
}

// ---------- 2: the oasis ----------
const TABS = [
  [['1943', 'k1'], ['TODAY', 'k5'], ['ON THE SPOT', 'k7']],
  [['1943', 'm1'], ['TODAY', 'm8'], ['ON THE SPOT', 'm9']],
  [['1943', 't1'], ['TODAY', 't8'], ['ON THE SPOT', 't10']],
  [['TODAY', 'v1'], ['1943', 'v4'], ['ON THE SPOT', 'v10']],
  [['1943', 'l1'], ['TODAY', 'l9'], ['ON THE SPOT', 'l11']],
];
/** A label with a thin leader line to a point in a drawing. */
function callout(str, x, y, px, py, a, { color = C.ink, size = 32, align = 'left', bg = 'rgba(9,29,27,0.82)' } = {}) {
  if (a <= 0) return;
  A(a, () => {
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x + (align === 'right' ? 0 : 0), y); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU); ctx.fill();
    chip(str, x, y, { color, size, align, bg });
  });
}
function partOasis(t) {
  header(t, 0, TABS[0]);
  // the route inset (k2–k3): Chad, the Fezzan, the oasis, on a small schematic map of the Sahara
  const inset = span(t, s('k2', 0.1), s('k4', 0.2), 0.6, 0.6);
  const scene = 1 - inset;
  const dusk = 1 - seg(t, s('k5', -0.2), s('k5', 1.2));
  windowFrame(() => {
    const o = drawOasis(t, { dusk, steam: seg(t, s('k5', 0.6), s('k5', 1.6)) });
    // k4: 10 March, the attack stopped short of the palms, aircraft overhead
    A(span(t, s('k4', 0.1), s('k5', 0.1), 0.5, 0.6), () => {
      const u = eout(seg(t, s('k4', 0.3), s('k4', 2.4)));
      trace([[WIN.x + WIN.w + 10, WIN.y + 330], [lerp(WIN.x + WIN.w + 10, WIN.x + 600, u), lerp(WIN.y + 330, WIN.y + 420, u)]], 1, C.axis, { w: 12, headSize: 26 });
      chip('German armoured group', WIN.x + WIN.w - 30, WIN.y + 270, { color: C.axis, size: 32, align: 'right', a: seg(t, s('k4', 0.8), s('k4', 1.4)) });
      const fly = seg(t, s('k4', 2.4), s('k4', 5.0));
      for (let j = 0; j < 4; j++) {
        const x = lerp(WIN.x - 60, WIN.x + WIN.w + 80, fly) - j * 70, y = WIN.y + 120 + j * 34;
        ctx.fillStyle = C.allied; ctx.beginPath(); ctx.moveTo(x + 24, y); ctx.lineTo(x - 16, y - 14); ctx.lineTo(x - 6, y); ctx.lineTo(x - 16, y + 14); ctx.closePath(); ctx.fill();
      }
      chip('Allied aircraft', WIN.x + 40, WIN.y + 70, { color: C.allied, size: 32, align: 'left', a: seg(t, s('k4', 3.0), s('k4', 3.6)) });
      chip('beaten off', WIN.x + 640, WIN.y + 600, { color: C.ochre, size: 34, a: seg(t, e('k4', -1.4), e('k4', -0.8)) });
      A(seg(t, s('k4', 0.2), s('k4', 0.8)), () => { card(WIN.x + 330, WIN.y + 20, 340, 70, { bg: 'rgba(9,29,27,0.85)' }); txt('10 MARCH 1943', WIN.x + 500, WIN.y + 56, { size: 36, weight: 800, color: C.ochre, align: 'center', spacing: '2px' }); });
    });
    // k1: what's here
    A(span(t, s('k1', 1.2), s('k2', 0.3), 0.5, 0.5), () => {
      callout('palms and a spring', WIN.x + 40, WIN.y + 60, ...o.palms, 1, { size: 32 });
      callout('Roman fort', WIN.x + 560, WIN.y + 130, ...o.fort, seg(t, s('k1', 2.0), s('k1', 2.6)), { size: 32 });
      callout('the stele', WIN.x + 980, WIN.y + 290, ...o.stele, seg(t, s('k1', 2.8), s('k1', 3.4)), { size: 32, align: 'right' });
    });
    // k5–k6: today
    A(span(t, s('k5', 0.6), s('k7', 0.2), 0.5, 0.5), () => {
      callout('warm spring', WIN.x + 40, WIN.y + 520, ...o.spring, 1, { size: 32, color: C.mint });
      callout('Tisavar', WIN.x + 380, WIN.y + 150, ...o.fort, seg(t, s('k5', 2.4), s('k5', 3.0)), { size: 32, color: C.mint });
      A(seg(t, s('k5', 3.0), s('k5', 3.6)), () => txtFit('Roman fort · Commodus, 180–192, or earlier', WIN.x + 380, WIN.y + 212, WIN.w - 400, { size: 32, weight: 600, color: C.dark }));
    });
    A(span(t, s('k6', 0.2), s('k7', 0.2), 0.5, 0.5), () => {
      // about one kilometre west of the stele: where they fought (not to scale)
      ctx.fillStyle = 'rgba(9,29,27,0.82)'; ctx.fillRect(WIN.x, WIN.y + WIN.h - 96, WIN.w, 96);
      const y = WIN.y + WIN.h - 34, x1 = o.stele[0], x0 = WIN.x + 520;
      ctx.strokeStyle = C.ochre; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.moveTo(x0, y - 12); ctx.lineTo(x0, y + 12); ctx.moveTo(x1, y - 12); ctx.lineTo(x1, y + 12); ctx.stroke();
      txt('about 1 km', (x0 + x1) / 2, y - 30, { size: 32, weight: 700, color: C.ochre, align: 'center' });
      txt('the fighting', x0 - 20, y - 10, { size: 32, weight: 700, color: C.ink, align: 'right' });
      callout('General Leclerc’s column', WIN.x + 980, WIN.y + 290, ...o.stele, 1, { size: 32, align: 'right', color: C.ochre });
    });
    // k7: two frontier posts, at least 1,750 years apart
    A(span(t, s('k7', 0.2), CH[2].at + 1, 0.5, 0.6), () => {
      card(WIN.x + 40, WIN.y + 30, WIN.w - 80, 150, { bg: 'rgba(9,29,27,0.88)' });
      const x0 = WIN.x + 120, x1 = WIN.x + WIN.w - 120, y = WIN.y + 120, u = eio(seg(t, s('k7', 0.4), s('k7', 2.2)));
      ctx.fillStyle = C.ochre; ctx.fillRect(x0, y - 4, (x1 - x0) * u, 8);
      ctx.beginPath(); ctx.arc(x0, y, 12, 0, TAU); ctx.fill(); A(seg(t, s('k7', 2.0), s('k7', 2.4)), () => { ctx.beginPath(); ctx.arc(x1, y, 12, 0, TAU); ctx.fill(); });
      txt(String(COMMODUS_END), x0, y - 40, { size: 32, weight: 800, color: C.ink, align: 'center' });
      txt(String(FIGHT_YEAR), x1, y - 40, { size: 32, weight: 800, color: C.ink, align: 'center' });
      A(seg(t, s('k7', 2.2), s('k7', 2.8)), () => { txt('at least', RCX - 12, y - 40, { size: 32, weight: 500, color: C.soft, align: 'right' }); txt(fmt(Math.floor(YEARS_APART / 50) * 50), RCX, y - 40, { size: 40, weight: 800, color: C.ochre }); txt('years', RCX + 110, y - 40, { size: 32, weight: 500, color: C.soft }); });
    });
  });
  // the route from Chad, over the drawing
  if (inset > 0) A(inset, () => windowFrame(() => {
    ctx.fillStyle = '#d9c08a'; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
    const LA0 = 34.9, LO0 = 13.2, KS = 0.245; // px per km
    const Q = ([la, lo]) => [WIN.x + WIN.w / 2 + (lo - LO0) * 111.32 * Math.cos(22 * RAD) * KS, WIN.y + 40 + (LA0 - la) * 110.57 * KS];
    // the Mediterranean, schematic, along the top
    const coast = [[37.35, 9.85], [36.8, 10.2], [36.4, 10.6], [35.8, 10.65], [34.75, 10.8], [33.9, 10.1], [33.6, 10.5], [33.15, 11.6], [32.9, 13.2], [32.4, 15.1], [31.2, 16.6], [30.4, 19.0], [31.0, 20.2], [32.1, 20.1], [32.8, 21.0]];
    ctx.fillStyle = '#2f6d78'; ctx.beginPath(); ctx.moveTo(WIN.x, WIN.y);
    coast.forEach((p) => ctx.lineTo(...Q(p))); ctx.lineTo(WIN.x + WIN.w, WIN.y); ctx.closePath(); ctx.fill();
    // Lake Chad
    const lc = Q([13.3, 14.2]); ctx.fillStyle = '#2f6d78'; ctx.beginPath(); ctx.ellipse(lc[0], lc[1], 26, 18, 0.4, 0, TAU); ctx.fill();
    txt('SAHARA', ...Q([22.5, 10.0]), { size: 44, weight: 700, color: 'rgba(120,80,40,0.6)', align: 'center', spacing: '10px' });
    const pts = [Q(FORT_LAMY), Q(SABHA), Q(STOPS[0].ll)];
    trace(smooth([pts[0], [pts[0][0] - 10, (pts[0][1] + pts[1][1]) / 2], pts[1], [(pts[1][0] + pts[2][0]) / 2 + 20, (pts[1][1] + pts[2][1]) / 2], pts[2]], 10), eio(seg(t, s('k2', 0.6), s('k3', 0.2))), C.allied, { w: 7, dash: [3, 12], headSize: 18 });
    [[pts[0], 'Fort-Lamy, Chad', 'left'], [pts[1], 'Fezzan', 'left'], [pts[2], 'Ksar Ghilane', 'right']].forEach(([[x, y], n, side], j) => {
      const a = seg(t, s('k2', 0.6 + j * 1.2), s('k2', 1.0 + j * 1.2));
      A(a, () => { ctx.fillStyle = C.dark; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); txt(n, x + (side === 'left' ? 22 : -22), y, { size: 34, weight: 700, color: C.dark, align: side }); });
    });
    // k3: the straight-line distance
    A(seg(t, s('k3', 0.4), s('k3', 1.0)), () => {
      ctx.strokeStyle = C.dark; ctx.lineWidth = 3; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[2]); ctx.stroke(); ctx.setLineDash([]);
      card(WIN.x + 50, WIN.y + 380, 420, 150, { bg: 'rgba(9,29,27,0.9)' });
      txt(fmt(Math.round(FROM_CHAD / 100) * 100), WIN.x + 250, WIN.y + 442, { size: 64, weight: 800, color: C.ochre, align: 'right' });
      txt('km', WIN.x + 266, WIN.y + 446, { size: 44, weight: 700, color: C.ink });
      txt('in a straight line', WIN.x + 260, WIN.y + 500, { size: 32, weight: 500, color: C.soft, align: 'center' });
    });
    txt('schematic map', WIN.x + 30, WIN.y + WIN.h - 34, { size: 32, weight: 500, color: C.dark2 });
  }));
  // k8: a caution
  A(span(t, s('k8', 0.2), CH[2].at + 1, 0.5, 0.6), () => {
    card(WIN.x + 60, WIN.y + WIN.h - 220, WIN.w - 120, 170, { bg: 'rgba(9,29,27,0.94)', line: C.axis });
    txtFit('CHECK THE TRAVEL ADVICE FIRST', RCX, WIN.y + WIN.h - 166, WIN.w - 200, { size: 40, weight: 800, color: C.axis, align: 'center', spacing: '2px' });
    txtFit('France’s advice warns against desert areas (2026)', RCX, WIN.y + WIN.h - 100, WIN.w - 200, { size: 34, weight: 500, color: C.ink, align: 'center' });
  });
  void scene;
}

// ---------- 3: the line ----------
// a zoomed schematic map of the Mareth battlefield (lat 32.9–33.95, lon 9.25–11.05)
const ZLA = 33.95, ZLO = 9.2, ZK = 5.8;
const Z = ([la, lo]) => [WIN.x + (lo - ZLO) * 111.32 * Math.cos(33.5 * RAD) * ZK, WIN.y + (ZLA - la) * 110.57 * ZK];
function drawZoom(t) {
  ctx.fillStyle = '#1d5961'; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  ctx.fillStyle = '#e4d3ab';
  for (const r of MAPDATA.TUN) { ctx.beginPath(); r.forEach((p, i) => (i ? ctx.lineTo(...Z(p)) : ctx.moveTo(...Z(p)))); ctx.closePath(); ctx.fill(); }
  // Libya beyond the border (schematic)
  ctx.fillStyle = C.neigh; ctx.beginPath(); ctx.moveTo(...Z([33.181, 11.504])); ctx.lineTo(...Z([32.637, 11.45])); ctx.lineTo(...Z([32.45, 11.567])); ctx.lineTo(...Z([32.4, 12.0])); ctx.lineTo(...Z([33.2, 12.0])); ctx.closePath(); ctx.fill();
  // the Matmata hills
  ctx.fillStyle = '#b39467';
  for (let i = 0; i < 14; i++) { const [x, y] = Z([33.62 - i * 0.05, 10.0 + (i % 3) * 0.05 + i * 0.012]); ctx.beginPath(); ctx.moveTo(x - 30, y + 14); ctx.lineTo(x, y - 18); ctx.lineTo(x + 30, y + 14); ctx.closePath(); ctx.fill(); }
  // Djebel Tebaga, west of the gap
  for (let i = 0; i < 5; i++) { const [x, y] = Z([33.72 - i * 0.03, 9.42 + i * 0.05]); ctx.beginPath(); ctx.moveTo(x - 26, y + 12); ctx.lineTo(x, y - 16); ctx.lineTo(x + 26, y + 12); ctx.closePath(); ctx.fill(); }
  // the line
  ctx.strokeStyle = C.axis; ctx.lineWidth = 9; ctx.setLineDash([16, 8]); ctx.beginPath(); MARETH_LINE.forEach((p, i) => (i ? ctx.lineTo(...Z(p)) : ctx.moveTo(...Z(p)))); ctx.stroke(); ctx.setLineDash([]);
  const dot = (ll, n, dx, dy, al = 'left', col = C.dark) => { const [x, y] = Z(ll); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill(); txt(n, x + dx, y + dy, { size: 32, weight: 700, color: col, align: al }); };
  dot(TOWNS.gabes, 'Gabès', 16, -18);
  dot(TOWNS.medenine, 'Medenine', 16, 20);
  dot(STOPS[1].ll, 'museum', -18, -22, 'right');
  dot(STOPS[0].ll, 'Ksar Ghilane', 16, 26);
  txt('Matmata hills', ...Z([33.2, 10.36]), { size: 32, weight: 700, color: 'rgba(90,60,30,0.95)', align: 'left' });
  txt('Tebaga Gap', ...Z([33.82, 9.56]), { size: 32, weight: 700, color: C.dark, align: 'center' });
  txt('schematic map', WIN.x + 30, WIN.y + 36, { size: 32, weight: 500, color: C.dark2 });
  // m5: the frontal attack, thrown back
  A(span(t, s('m5', 0.2), s('m8', 0.3), 0.4, 0.6), () => {
    const [ax, ay] = Z([33.6, 10.46]), [bx, by] = Z([33.672, 10.355]);
    const back = seg(t, e('m5', -1.6), e('m5', -0.2));
    trace([[ax + 60, ay + 50], [lerp(bx - 10, ax + 10, back), lerp(by - 10, ay + 6, back)]], eout(seg(t, s('m5', 0.4), s('m5', 2.4))), C.allied, { w: 12, headSize: 26 });
    chip('20 MARCH', ax + 80, ay + 110, { color: C.allied, size: 32, a: seg(t, s('m5', 0.6), s('m5', 1.2)) });
    chip('Italian and German troops', ...Z([33.52, 10.62]), { color: C.axis, size: 32, a: seg(t, s('m5', 2.0), s('m5', 2.6)) });
  });
  // m6: the hook round the hills, through the gap; m7: through, and the Axis pulls back
  A(span(t, s('m6', 0.1), s('m8', 0.3), 0.4, 0.6), () => {
    const hook = smooth([Z([33.05, 10.45]), Z([32.97, 9.95]), Z([33.1, 9.62]), Z([33.42, 9.56]), Z([33.7, 9.66]), Z([33.86, 9.86]), Z([33.92, 10.02])]);
    trace(hook, eio(seg(t, s('m6', 0.3), e('m6', 0.4))), C.allied, { w: 9, dash: [3, 14], headSize: 24 });
    chip('New Zealanders and Force L', ...Z([33.07, 9.27]), { color: C.allied, size: 32, a: seg(t, s('m6', 0.8), s('m6', 1.4)), align: 'left' });
    A(seg(t, s('m7', 0.2), s('m7', 0.8)), () => { const [x, y] = Z([33.72, 9.67]); ctx.strokeStyle = C.ochre; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 34, 0, TAU); ctx.stroke(); });
    chip('26 MARCH', ...Z([33.62, 9.36]), { color: C.ochre, size: 32, a: seg(t, s('m7', 0.3), s('m7', 0.9)) });
    A(seg(t, s('m7', 2.0), s('m7', 2.4)), () => trace([Z([33.7, 10.3]), Z([33.93, 10.25])], eout(seg(t, s('m7', 2.0), s('m7', 3.4))), C.axis, { w: 10, headSize: 24 }));
  });
}
function bunkerIcons(t, x, y, n, col, k0, a, step = 24) {
  for (let i = 0; i < n; i++) {
    const u = seg(t, k0 + i * 0.03, k0 + 0.3 + i * 0.03); if (u <= 0) continue;
    A(a * u, () => { ctx.fillStyle = col; ctx.fillRect(x + (i % 20) * step, y + Math.floor(i / 20) * 20, step * 0.75, 15); });
  }
}
function partLine(t) {
  header(t, 1, TABS[1]);
  const zoom = span(t, s('m5', 0), s('m8', 0.2), 0.7, 0.7);
  const hill = 1 - zoom;
  if (hill > 0) A(hill, () => windowFrame(() => {
    const m = drawMarethHill(t, { day: 1, cut: Math.max(seg(t, s('m1', 1.4), s('m1', 2.2)), 0) });
    A(span(t, s('m1', 0.8), s('m2', 0.2), 0.5, 0.5), () => { callout('museum', WIN.x + 40, WIN.y + 60, ...m.museum, 1); callout('casemate', WIN.x + 560, WIN.y + 80, ...m.cas, seg(t, s('m1', 1.8), s('m1', 2.4))); callout('Wadi Zigzaou', WIN.x + 960, WIN.y + 660, ...m.wadi, seg(t, s('m1', 2.6), s('m1', 3.2)), { align: 'right' }); });
    // m2: built by France, facing Italian Libya
    A(span(t, s('m2', 0.2), s('m3', 0.2), 0.5, 0.5), () => {
      chip('BUILT BY FRANCE · 1936–1940', WIN.x + 40, WIN.y + 60, { color: C.ochre, size: 34, align: 'left' });
      trace([m.slit, [m.slit[0] + 260, m.slit[1] + 120]], eout(seg(t, s('m2', 1.6), s('m2', 3.0))), C.green, { w: 10, headSize: 24 });
      chip('Italian Libya', WIN.x + 960, WIN.y + 640, { color: C.green, size: 34, align: 'right', a: seg(t, s('m2', 2.4), s('m2', 3.0)) });
    });
    // m3: the works along the line
    A(span(t, s('m3', 0.2), s('m4', 0.2), 0.5, 0.5), () => {
      card(WIN.x + 30, WIN.y + 24, WIN.w - 60, 250, { bg: 'rgba(9,29,27,0.9)' });
      txt('40–50 km', WIN.x + 70, WIN.y + 70, { size: 40, weight: 800, color: C.ochre });
      txt('from the sea to the hills', WIN.x + 90 + textW('40–50 km', { size: 40, weight: 800 }), WIN.y + 72, { size: 32, weight: 500, color: C.soft });
      const rows = [[40, 'infantry casemates', C.paper], [8, 'artillery casemates', C.ochre], [15, 'command posts', C.allied]];
      const ix = WIN.x + 130 + Math.max(...rows.map(([, name]) => textW(name, { size: 32, weight: 600 }))) + 24;
      rows.forEach(([n, name, col], r) => {
        const y = WIN.y + 130 + r * 48, a = seg(t, s('m3', 1.2 + r * 0.9), s('m3', 1.6 + r * 0.9));
        A(a, () => { txt(fmt(n), WIN.x + 110, y, { size: 38, weight: 800, color: col, align: 'right' }); txt(name, WIN.x + 130, y, { size: 32, weight: 600, color: C.ink }); });
        bunkerIcons(t, ix, y - 18, n, col, s('m3', 1.2 + r * 0.9), 1, Math.min(24, (WIN.x + WIN.w - 50 - ix) / 20));
      });
    });
    // m4: disarmed, rearmed
    A(span(t, s('m4', 0.2), s('m5', 0.4), 0.5, 0.5), () => {
      chip('1940 · DISARMED', WIN.x + 40, WIN.y + 60, { color: C.grey, size: 34, align: 'left' });
      chip('1942 · REARMED BY THE AXIS', WIN.x + 40, WIN.y + 130, { color: C.axis, size: 34, align: 'left', a: seg(t, s('m4', 2.0), s('m4', 2.6)) });
    });
    // m8: the museum today
    A(span(t, s('m8', 0.2), s('m9', 0.2), 0.5, 0.5), () => {
      card(WIN.x + 30, WIN.y + 24, 560, 220, { bg: 'rgba(9,29,27,0.9)' });
      txt('INSIDE', WIN.x + 60, WIN.y + 66, { size: 32, weight: 800, color: C.mint, spacing: '3px' });
      txt('maps, photographs, uniforms', WIN.x + 60, WIN.y + 110, { size: 32, weight: 500, color: C.ink });
      txt('OUTSIDE', WIN.x + 60, WIN.y + 164, { size: 32, weight: 800, color: C.mint, spacing: '3px' });
      txt('guns, command posts', WIN.x + 60, WIN.y + 208, { size: 32, weight: 500, color: C.ink });
      chip('run by the defence ministry', WIN.x + 960, WIN.y + 660, { color: C.mint, size: 32, align: 'right', a: seg(t, s('m8', 1.0), s('m8', 1.6)) });
    });
    // m9: the firing slit faces south-east; a compass from the hill
    A(span(t, s('m9', 0.2), CH[3].at + 1, 0.5, 0.6), () => {
      A(seg(t, s('m9', 0.2), s('m9', 0.8)), () => { ctx.strokeStyle = C.ochre; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(m.slit[0] - 8, m.slit[1] + 2, 34, 0, TAU); ctx.stroke(); });
      trace([m.slit, [m.slit[0] + 260, m.slit[1] + 120]], eout(seg(t, s('m9', 0.8), s('m9', 2.2))), C.ochre, { w: 10, headSize: 24 });
      // compass, top right
      const cx = WIN.x + WIN.w - 160, cy = WIN.y + 170, R = 110;
      card(cx - R - 40, cy - R - 40, 2 * R + 80, 2 * R + 130, { bg: 'rgba(9,29,27,0.9)', r: 24 });
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
      [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([n, d]) => { const a = (d - 90) * RAD; txt(n, cx + Math.cos(a) * (R - 22), cy + Math.sin(a) * (R - 22), { size: 32, weight: 700, color: C.soft, align: 'center' }); });
      const u = eout(seg(t, s('m9', 1.6), s('m9', 3.0))), a = (TO_MEDENINE - 90) * RAD;
      trace([[cx, cy], [cx + Math.cos(a) * R * 0.95 * Math.max(u, 0.01), cy + Math.sin(a) * R * 0.95 * Math.max(u, 0.01)]], 1, C.ochre, { w: 8, headSize: 18 });
      A(seg(t, s('m9', 2.6), s('m9', 3.2)), () => { txt(fmt(Math.round(TO_MEDENINE)), cx - 44, cy + R + 50, { size: 34, weight: 800, color: C.ochre, align: 'right' }); txt('° · Medenine', cx - 42, cy + R + 50, { size: 32, weight: 600, color: C.ink }); });
    });
    // the end of m9: one line, three armies
    A(span(t, e('m9', -1.6), CH[3].at + 1, 0.5, 0.6), () => {
      card(WIN.x + 30, WIN.y + WIN.h - 150, WIN.w - 60, 120, { bg: 'rgba(9,29,27,0.92)' });
      [['built by France', C.paper], ['held by the Axis', C.axis], ['outflanked by the Allies', C.allied]].forEach(([n, col], j) => {
        A(seg(t, e('m9', -1.4 + j * 0.5), e('m9', -0.9 + j * 0.5)), () => txtFit(n, WIN.x + 180 + j * 320, WIN.y + WIN.h - 90, 300, { size: 34, weight: 700, color: col, align: 'center' }));
      });
    });
  }));
  if (zoom > 0) A(zoom, () => windowFrame(() => drawZoom(t)));
}

// ---------- 4: the rock ----------
function sightline(t) {
  // not to scale: a flat top, a vertical cliff, an eye above the ground; geometry in drawing units, numbers from the formula
  sky('#a9cfe0', '#efe6cf');
  const gx = WIN.x + 260, top = WIN.y + 250, foot = WIN.y + 590, Hd = foot - top, Ed = 70;
  ctx.fillStyle = '#c7a77a'; ctx.fillRect(WIN.x, top, gx - WIN.x, WIN.h);
  ctx.fillStyle = '#6d7246'; ctx.fillRect(gx, foot, WIN.w, WIN.h);
  const d = 2.4 * eio(seg(t, s('t10', 0.6), e('t10', -0.6)));     // metres stepped back, 0 → 2.4
  const dd = d * 34;                                               // in drawing units
  const ex = gx - 10 - dd, ey = top - Ed;
  // the walker, as a simple marker
  ctx.fillStyle = C.bg0; k.rrect(ex - 12, top - Ed - 6, 24, Ed + 6, 12); ctx.fill(); ctx.beginPath(); ctx.arc(ex, top - Ed - 22, 16, 0, TAU); ctx.fill();
  // the line of sight over the edge, and the ground it can't see
  const hx = gx + (Hd * (dd + 10)) / Ed;                           // where the grazing line meets the ground
  ctx.fillStyle = 'rgba(176,71,47,0.55)'; ctx.fillRect(gx, foot - 6, Math.min(WIN.x + WIN.w, hx) - gx, 16);
  ctx.strokeStyle = C.ochre; ctx.lineWidth = 4; ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.moveTo(ex, ey - 22); ctx.lineTo(Math.min(hx, WIN.x + WIN.w + 200), foot); ctx.stroke(); ctx.setLineDash([]);
  // labels on the drawing
  const hd = Math.min(WIN.x + WIN.w, hx);
  if (hd > gx + 90) txt('hidden', (gx + hd) / 2 + 20, foot - 34, { size: 32, weight: 700, color: C.stampR, align: 'center' });
  ctx.strokeStyle = C.dark; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx + 26, top); ctx.lineTo(gx + 26, foot); ctx.stroke();
  txt('40 m', gx + 40, (top + foot) / 2, { size: 32, weight: 700, color: C.dark });
  card(WIN.x + 420, WIN.y + 40, 540, 170, { bg: 'rgba(9,29,27,0.9)' });
  txt('step back', WIN.x + 450, WIN.y + 90, { size: 32, weight: 600, color: C.soft });
  txt(dec(d), WIN.x + 840, WIN.y + 90, { size: 40, weight: 800, color: C.ink, align: 'right' }); txt('m', WIN.x + 852, WIN.y + 92, { size: 32, weight: 600, color: C.soft });
  txt('ground hidden', WIN.x + 450, WIN.y + 160, { size: 32, weight: 600, color: C.soft });
  txt(fmt(hidden(d)), WIN.x + 840, WIN.y + 160, { size: 40, weight: 800, color: C.ochre, align: 'right' }); txt('m', WIN.x + 852, WIN.y + 162, { size: 32, weight: 600, color: C.soft });
  txtFit('simplified, not to scale: a 40 m cliff, eyes at 1.6 m', WIN.x + WIN.w / 2, WIN.y + WIN.h - 40, WIN.w - 80, { size: 32, weight: 500, color: C.ink, align: 'center' });
}
function partRock(t) {
  header(t, 2, TABS[2]);
  const diag = span(t, s('t10', 0), s('t11', 0.1), 0.6, 0.6), cem = span(t, s('t11', 0), CH[4].at + 2, 0.6, 0.6);
  const rock = 1 - Math.max(diag, cem);
  const night = seg(t, s('t3', 1.0), s('t3', 2.0)) * (1 - seg(t, s('t4', 0.2), s('t4', 1.6)));
  const day = seg(t, s('t8', -0.3), s('t8', 1.0));
  if (rock > 0) A(rock, () => windowFrame(() => {
    drawRock(t, { night, day });
    // t2: the height and the town
    A(span(t, s('t2', 0.4), s('t3', 0.4), 0.5, 0.5), () => {
      // the summit's height above the sea, as a level line from the top
      const y1 = WIN.y + 190;
      ctx.strokeStyle = C.dark; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(WIN.x + 640, y1); ctx.lineTo(WIN.x + WIN.w - 30, y1); ctx.stroke(); ctx.setLineDash([]);
      chip('summit about 200 m above sea level', WIN.x + WIN.w - 30, y1 + 50, { color: C.dark, bg: 'rgba(246,238,220,0.92)', size: 32, align: 'right' });
      chip('Enfidha, 5 km', WIN.x + 960, WIN.y + 60, { color: C.ink, size: 32, align: 'right' });
    });
    // t3: who held it; the attack at night
    A(span(t, s('t3', 0.3), s('t4', 0.6), 0.5, 0.5), () => {
      chip('Italian troops, Folgore paratroopers', WIN.x + 480, WIN.y + 46, { color: C.axis, size: 32 });
      chip('and a German company', WIN.x + 480, WIN.y + 104, { color: C.axis, size: 32, a: seg(t, s('t3', 0.8), s('t3', 1.4)) });
      A(seg(t, s('t3', 2.4), s('t3', 3.0)), () => {
        trace([[WIN.x + 980, WIN.y + 660], [WIN.x + 820, WIN.y + 600]], eout(seg(t, s('t3', 2.4), s('t3', 3.8))), C.allied, { w: 10, headSize: 24 });
        chip('New Zealand Division', WIN.x + 960, WIN.y + 560, { color: C.allied, size: 32, align: 'right' });
        chip('19 APRIL', WIN.x + 960, WIN.y + 490, { color: C.ochre, size: 32, align: 'right' });
      });
    });
    // t4: the climb at dawn; t5: lost and won back
    const climb = seg(t, s('t4', 0.4), e('t4', -0.2));
    const lost = seg(t, s('t5', 0.2), s('t5', 1.2)) * (1 - seg(t, s('t5', 2.4), s('t5', 3.4)));
    A(span(t, s('t4', 0), s('t6', 0.3), 0.4, 0.6), () => {
      ctx.strokeStyle = 'rgba(159,220,201,0.7)'; ctx.lineWidth = 3; ctx.setLineDash([4, 10]); ctx.beginPath(); ctx.moveTo(WIN.x + 336, WIN.y + 590); ctx.lineTo(WIN.x + 350, WIN.y + 420); ctx.lineTo(LEDGE[0] - 30, LEDGE[1] + 6); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < 6; i++) {
        const f = Math.max(0, Math.min(1, climb * 1.5 - i * 0.1));
        const path = [[WIN.x + 336, WIN.y + 590], [WIN.x + 350, WIN.y + 420], [LEDGE[0] - 30 + i * 10, LEDGE[1] + 6]];
        const p = f < 0.75 ? [lerp(path[0][0], path[1][0], f / 0.75), lerp(path[0][1], path[1][1], f / 0.75)] : [lerp(path[1][0], path[2][0], (f - 0.75) / 0.25), lerp(path[1][1], path[2][1], (f - 0.75) / 0.25)];
        A(1 - lost * 0.8, () => { ctx.fillStyle = C.mint; ctx.beginPath(); ctx.arc(p[0] - 8, p[1] - 4, 10, 0, TAU); ctx.fill(); ctx.strokeStyle = C.bg0; ctx.lineWidth = 3; ctx.stroke(); });
      }
      callout('the ledge', WIN.x + 40, WIN.y + 200, LEDGE[0] - 10, LEDGE[1], seg(t, s('t4', 2.6), s('t4', 3.2)), { color: C.mint });
      chip('Haane Manahi · 28th Māori Battalion', WIN.x + 40, WIN.y + 60, { color: C.mint, size: 32, align: 'left', a: seg(t, s('t4', 1.0), s('t4', 1.6)) });
      chip('21 APRIL', WIN.x + 960, WIN.y + 60, { color: C.ochre, size: 32, align: 'right', a: seg(t, s('t5', 0.2), s('t5', 0.8)) });
      A(seg(t, s('t5', 2.8), s('t5', 3.6)), () => callout('and the village', WIN.x + 960, WIN.y + 130, WIN.x + 560, WIN.y + 170, 1, { color: C.mint, align: 'right' }));
    });
    // t6–t7: the medal cards
    A(span(t, s('t6', 0.1), s('t8', 0.1), 0.5, 0.5), () => {
      ctx.fillStyle = 'rgba(9,29,27,0.6)'; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
      const c1 = eout(seg(t, s('t6', 0.2), s('t6', 0.9))), c2 = eout(seg(t, s('t6', 2.4), s('t6', 3.1))), c3 = eout(seg(t, s('t7', 0.2), s('t7', 0.9)));
      const cardAt = (x, y, a, lines, col) => A(a, () => { card(x, y + (1 - a) * 20, 440, 250, { bg: C.paper, line: col }); lines.forEach(([str, size, w, c], j) => txtFit(str, x + 220, y + 60 + j * 58 + (1 - a) * 20, 400, { size, weight: w, color: c, align: 'center' })); });
      cardAt(WIN.x + 40, WIN.y + 60, c1, [['VICTORIA CROSS', 36, 800, C.dark], ['recommended', 32, 600, C.dark], ['backed by four generals', 32, 500, C.dark2]], C.ochre);
      cardAt(WIN.x + 520, WIN.y + 60, c2, [['DISTINGUISHED', 36, 800, C.dark], ['CONDUCT MEDAL', 36, 800, C.dark], ['awarded, 1943', 32, 500, C.dark2]], C.grey);
      cardAt(WIN.x + 280, WIN.y + 380, c3, [['2007 · ROTORUA', 36, 800, C.dark], ['a sword and a letter', 32, 600, C.dark], ['from the Queen, for his sons', 32, 500, C.dark2]], C.ochre);
    });
    // t8–t9: today
    A(span(t, s('t8', 0.6), s('t10', 0.1), 0.5, 0.5), () => {
      callout('stone houses with vaulted rooms', WIN.x + 40, WIN.y + 60, WIN.x + 540, WIN.y + 172, 1, { color: C.dark, bg: 'rgba(246,238,220,0.92)' });
      callout('the shrine of Sidi Abdelkader', WIN.x + 960, WIN.y + 120, WIN.x + 600, WIN.y + 140, seg(t, s('t9', 0.2), s('t9', 0.8)), { color: C.dark, bg: 'rgba(246,238,220,0.92)', align: 'right' });
      A(seg(t, s('t9', 2.0), s('t9', 2.6)), () => { trace([[WIN.x + 720, WIN.y + 560], [WIN.x + 960, WIN.y + 560]], eout(seg(t, s('t9', 2.0), s('t9', 3.2))), C.dark, { w: 6, headSize: 18 }); txt('east, to the sea', WIN.x + 960, WIN.y + 520, { size: 32, weight: 700, color: C.dark, align: 'right' }); });
      chip('on foot', WIN.x + 40, WIN.y + 130, { color: C.dark, bg: 'rgba(246,238,220,0.92)', size: 32, align: 'left', a: seg(t, s('t8', 1.0), s('t8', 1.6)) });
    });
  }));
  if (diag > 0) A(diag, () => windowFrame(() => sightline(t)));
  if (cem > 0) A(cem, () => windowFrame(() => {
    drawCemetery();
    card(WIN.x + WIN.w - 450, WIN.y + 40, 410, 190, { bg: 'rgba(9,29,27,0.9)' });
    txt(fmt(1551), WIN.x + WIN.w - 420, WIN.y + 104, { size: 64, weight: 800, color: C.ochre });
    txtFit('Commonwealth graves', WIN.x + WIN.w - 420, WIN.y + 170, 360, { size: 34, weight: 600, color: C.ink });
    chip('Enfidaville War Cemetery', WIN.x + WIN.w / 2, WIN.y + WIN.h - 46, { color: C.ink, size: 32 });
  }));
}

// ---------- 5: the villa ----------
function archiveCard(x, y, w, lines, stampStr, stampCol, a, sa) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(0, (1 - a) * 18);
    card(x, y, w, 190, { bg: C.paper, r: 10 });
    ctx.fillStyle = 'rgba(42,38,32,0.12)'; ctx.fillRect(x, y + 60, w, 2);
    lines.forEach((str, j) => txtFit(str, x + 22, y + 32 + j * 58, w - 44, { size: j ? 32 : 34, weight: j ? 500 : 800, color: j ? C.dark2 : C.dark }));
    ctx.restore();
    if (sa > 0) stamp(stampStr, x + w - 20 - textW(stampStr, { size: 30, weight: 800, spacing: '3px' }) / 2 - 18, y + 146, stampCol, sa, -0.06, 30);
  });
}
function partVilla(t) {
  header(t, 3, TABS[3]);
  const desk = span(t, s('v4', 0), CH[5].at + 2, 0.6, 0.6);
  if (desk < 1) A(1 - desk, () => windowFrame(() => {
    const v = drawVilla(t, { theatre: seg(t, s('v3', 0.2), s('v3', 1.2)) });
    A(span(t, s('v2', 0.2), s('v4', 0.2), 0.5, 0.5), () => archiveCard(WIN.x + 30, WIN.y + 30, 450, ['BUILT ABOUT 1930', 'sources give 1927 to 1934'], 'DOCUMENTED', C.stampG, 1, seg(t, s('v2', 1.6), s('v2', 2.2))));
    A(span(t, s('v3', 0.2), s('v4', 0.2), 0.5, 0.5), () => archiveCard(WIN.x + 520, WIN.y + 30, 450, ['THEATRE OPENED 1964', 'by President Habib Bourguiba'], 'DOCUMENTED', C.stampG, 1, seg(t, s('v3', 1.6), s('v3', 2.2))));
    callout('Dar Sebastian', WIN.x + 40, WIN.y + 240, ...v.house, span(t, s('v1', 1.6), s('v2', 0.4), 0.5, 0.5), { color: C.dark, bg: 'rgba(246,238,220,0.92)' });
  }));
  if (desk > 0) A(desk, () => windowFrame(() => {
    ctx.fillStyle = '#20352f'; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
    ctx.strokeStyle = 'rgba(246,238,220,0.05)'; ctx.lineWidth = 2; for (let y = WIN.y + 20; y < WIN.y + WIN.h; y += 28) { ctx.beginPath(); ctx.moveTo(WIN.x, y); ctx.lineTo(WIN.x + WIN.w, y); ctx.stroke(); }
    const sortU = eio(seg(t, s('v10', 0.2), s('v10', 2.0)));
    // the cards, then sorted into three columns at v10
    const cards = [
      ['v4', ['ROMMEL’S HEADQUARTERS?', 'what guides say'], 'TOLD', C.stampR, [30, 20]],
      ['v5', ['REQUISITIONED', 'by the German army'], 'REPORTED', C.stampO, [520, 20]],
      ['v6', ['ROMMEL “MAY HAVE” STAYED', 'a few nights'], 'REPORTED', C.stampO, [520, 225]],
      ['v9', ['CHURCHILL’S MEMOIRS?', 'no date, no document'], 'TOLD', C.stampR, [30, 225]],
    ];
    const sorted = [['DOCUMENTED', C.stampG], ['REPORTED', C.stampO], ['TOLD', C.stampR]];
    for (const [key, lines, st, col, [x, y]] of cards) {
      const a = seg(t, s(key, 0.2), s(key, 0.9)), sa = seg(t, s(key, 1.6), s(key, 2.2));
      archiveCard(WIN.x + x, WIN.y + y, 450, lines, st, col, a * (1 - sortU), sa);
    }
    // v10: everything sorted into three columns
    const bins = [['DOCUMENTED', C.stampG, ['the house, 1930', 'the theatre, 1964']], ['REPORTED', C.stampO, ['requisitioned', 'Rommel “may have”']], ['TOLD', C.stampR, ['headquarters', 'Churchill’s memoirs']]];
    A(sortU, () => bins.forEach(([n, col, items], j) => {
      const cx = WIN.x + 170 + j * 330;
      card(cx - 160, WIN.y + 200, 320, 300, { bg: C.paper, r: 10 });
      stamp(n, cx, WIN.y + 260, col, 1, -0.04, 30);
      items.forEach((it, q) => txtFit(it, cx, WIN.y + 350 + q * 70, 300, { size: 32, weight: 600, color: C.dark, align: 'center' }));
    }));
    // v7–v8: the dates
    A(span(t, s('v7', 0.1), s('v10', 0.2), 0.5, 0.5), () => {
      card(WIN.x + 30, WIN.y + 430, WIN.w - 60, 255, { bg: 'rgba(9,29,27,0.95)' });
      const x0 = WIN.x + 90, x1 = WIN.x + WIN.w - 90, y = WIN.y + 560, X = (ms) => lerp(x0, x1, (ms - D0) / (D1 - D0));
      ctx.fillStyle = C.faint; ctx.fillRect(x0, y - 3, x1 - x0, 6);
      MONTHS.forEach((mo, j) => { const xm = (X(Date.UTC(1942, 10 + j, 1)) + X(Date.UTC(1942, 11 + j, 1))) / 2; txt(mo, xm, y + 42, { size: 32, weight: 700, color: C.soft, align: 'center' }); });
      for (let m = 0; m <= 7; m++) { const xm = X(Date.UTC(1942, 10 + m, 1)); ctx.fillStyle = C.soft; ctx.fillRect(xm - 1.5, y - 12, 3, 24); }
      txt('Axis troops in the area', WIN.x + 90, WIN.y + 470, { size: 32, weight: 600, color: C.axis });
      ctx.fillStyle = 'rgba(222,122,92,0.45)'; ctx.fillRect(X(Date.UTC(1942, 10, 15)), y - 8, X(Date.UTC(1943, 4, 10)) - X(Date.UTC(1942, 10, 15)), 16);
      const u = eout(seg(t, s('v7', 1.4), s('v7', 2.6)));
      ctx.fillStyle = C.ochre; ctx.fillRect(X(ROMMEL[0]), y - 22, (X(ROMMEL[1]) - X(ROMMEL[0])) * u, 44);
      A(seg(t, s('v7', 2.0), s('v7', 2.6)), () => {
        txt('23 FEB', X(ROMMEL[0]) - 10, y - 46, { size: 32, weight: 800, color: C.ochre, align: 'right' });
        txt('9 MAR', X(ROMMEL[1]) + 10, y - 46, { size: 32, weight: 800, color: C.ochre });
        const lead = 'Rommel at the head of Army Group Africa', wl = textW(lead, { size: 32, weight: 600 });
        txt(lead, WIN.x + 90, y + 92, { size: 32, weight: 600, color: C.ink });
        txt(fmt(ROMMEL_DAYS), WIN.x + 90 + wl + 16, y + 90, { size: 40, weight: 800, color: C.ochre });
        txt('days', WIN.x + 90 + wl + 26 + textW(fmt(ROMMEL_DAYS), { size: 40, weight: 800 }), y + 92, { size: 32, weight: 600, color: C.ochre });
      });
    });
    // v8: no wartime document, in the empty slot (Churchill's card comes there at v9)
    A(span(t, s('v8', 0.6), s('v9', 0.3), 0.5, 0.4), () => {
      card(WIN.x + 30, WIN.y + 225, 450, 190, { bg: 'rgba(176,71,47,0.16)', line: C.axis, r: 10 });
      txtFit('NO WARTIME DOCUMENT', WIN.x + 255, WIN.y + 290, 410, { size: 36, weight: 800, color: C.axis, align: 'center' });
      txtFit('in these sources', WIN.x + 255, WIN.y + 350, 410, { size: 32, weight: 600, color: C.ink, align: 'center' });
    });
    // v10: the questions
    A(seg(t, s('v10', 2.2), s('v10', 2.8)), () => {
      ['Who tells it?', 'When?', 'From what evidence?'].forEach((q, j) => chip(q, WIN.x + 170 + j * 330, WIN.y + 90, { color: C.ink, size: 32, a: seg(t, s('v10', 2.6 + j * 0.6), s('v10', 3.1 + j * 0.6)) }));
    });
  }));
}

// ---------- 6: the ridge ----------
function cricket(t) {
  ctx.fillStyle = '#5f8f4c'; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  const cx = WIN.x + WIN.w / 2, cy = WIN.y + WIN.h / 2 + 10;
  ctx.fillStyle = '#6fa058'; ctx.beginPath(); ctx.ellipse(cx, cy, 460, 320, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(cx, cy, 460, 320, 0, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#d9c99a'; ctx.fillRect(cx - 160, cy - 18, 320, 36);
  const who = (x, y, n, col, lx, ly, al = 'center', a = 1) => A(a, () => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill(); txt(n, lx, ly, { size: 32, weight: 700, color: '#fdfbf3', align: al }); });
  who(cx + 190, cy, 'bowler', '#f6eedc', cx + 190, cy - 44);
  who(cx - 150, cy + 30, 'batter', '#f6eedc', cx - 150, cy + 70);
  who(cx - 220, cy, 'wicketkeeper', '#f6eedc', cx - 220, cy - 44);
  const ls = seg(t, s('l3', 2.2), s('l3', 3.2));
  who(cx - 400, cy, 'long stop', C.ochre, cx - 340, cy + 64, 'center', ls);
  A(ls, () => { ctx.strokeStyle = C.ochre; ctx.lineWidth = 4; ctx.setLineDash([6, 10]); ctx.beginPath(); ctx.moveTo(cx + 170, cy); ctx.lineTo(cx - 390, cy); ctx.stroke(); ctx.setLineDash([]); });
  txt('a cricket field from above', WIN.x + 30, WIN.y + WIN.h - 34, { size: 32, weight: 500, color: 'rgba(253,251,243,0.8)' });
}
function partRidge(t) {
  header(t, 4, TABS[4]);
  const cr = span(t, s('l3', 0), s('l5', 0.1), 0.6, 0.6), cem = span(t, s('l10', 0), s('l11', 0.1), 0.6, 0.6), names = span(t, s('l11', 0), CH[6].at + 2, 0.6, 0.6);
  const ridge = 1 - Math.max(cr, cem, names);
  const rain = span(t, s('l5', 0), s('l7', 0.2), 1.0, 1.4), spring = seg(t, s('l7', -0.4), s('l7', 1.2));
  if (ridge > 0) A(ridge, () => windowFrame(() => {
    const r = drawRidge(t, { rain, spring });
    A(span(t, s('l2', 0.4), s('l3', 0.2), 0.5, 0.5), () => {
      callout('Djebel Rhar', WIN.x + 40, WIN.y + 80, ...r.rhar, 1, { color: C.dark, bg: 'rgba(246,238,220,0.92)' });
      callout('Djebel el Ahmera', WIN.x + 960, WIN.y + 120, ...r.ahmera, seg(t, s('l2', 0.6), s('l2', 1.2)), { color: C.dark, bg: 'rgba(246,238,220,0.92)', align: 'right' });
      chip('Medjerda valley', WIN.x + 40, WIN.y + 560, { color: C.dark, bg: 'rgba(246,238,220,0.92)', size: 32, align: 'left', a: seg(t, s('l2', 2.6), s('l2', 3.2)) });
    });
    A(span(t, s('l4', 0.2), s('l5', 0.2), 0.5, 0.5), () => {
      chip('the last great barrier', WIN.x + 500, WIN.y + 80, { color: C.ochre, size: 36 });
      trace([[WIN.x + 40, WIN.y + 690], [WIN.x + 960, WIN.y + 690]], eout(seg(t, s('l4', 0.6), s('l4', 2.2))), C.ochre, { w: 6, headSize: 18 });
      txt('to Tunis', WIN.x + 960, WIN.y + 640, { size: 32, weight: 700, color: C.dark, align: 'right' });
    });
    // l5–l6: December
    A(span(t, s('l5', 0.2), s('l7', 0.2), 0.5, 0.6), () => {
      chip('22–25 DECEMBER 1942', WIN.x + 500, WIN.y + 60, { color: C.ink, size: 34 });
      trace(smooth([[WIN.x + 120, WIN.y + 600], [WIN.x + 260, WIN.y + 450], [r.rhar[0] - 10, r.rhar[1] + 30]]), eout(seg(t, s('l5', 0.6), s('l5', 2.4))), C.allied, { w: 10, headSize: 24 });
      chip('Coldstream Guards', WIN.x + 40, WIN.y + 400, { color: C.allied, size: 32, align: 'left', a: seg(t, s('l5', 1.0), s('l5', 1.6)) });
      A(seg(t, s('l5', 4.0), s('l5', 4.6)), () => trace(smooth([[WIN.x + 980, WIN.y + 240], [WIN.x + 820, WIN.y + 280], [r.ahmera[0] + 20, r.ahmera[1] + 20]]), eout(seg(t, s('l5', 4.0), s('l5', 5.6))), C.axis, { w: 10, headSize: 24 }));
      A(seg(t, s('l6', 0.2), s('l6', 0.8)), () => { card(WIN.x + 520, WIN.y + 440, 440, 150, { bg: C.paper, line: C.axis }); txt('DER WEIHNACHTSBERG', WIN.x + 740, WIN.y + 494, { size: 34, weight: 800, color: C.dark, align: 'center' }); txt('Christmas Hill', WIN.x + 740, WIN.y + 548, { size: 32, weight: 600, color: C.dark2, align: 'center' }); });
      chip('four months', WIN.x + 740, WIN.y + 640, { color: C.ochre, size: 34, a: seg(t, s('l6', 2.4), s('l6', 3.0)) });
    });
    // l7–l8: April
    A(span(t, s('l7', 0.4), s('l9', 0.2), 0.5, 0.6), () => {
      chip('APRIL 1943', WIN.x + 500, WIN.y + 60, { color: C.ink, size: 34 });
      trace(smooth([[WIN.x + 980, WIN.y + 660], [WIN.x + 820, WIN.y + 520], [r.ahmera[0] + 10, r.ahmera[1] + 40]]), eout(seg(t, s('l7', 0.6), s('l7', 2.4))), C.allied, { w: 10, headSize: 24 });
      chip('78th Division', WIN.x + 960, WIN.y + 450, { color: C.allied, size: 32, align: 'right', a: seg(t, s('l7', 1.2), s('l7', 1.8)) });
      A(seg(t, s('l7', 3.6), s('l7', 4.2)), () => callout('Argyll and Sutherland Highlanders', WIN.x + 40, WIN.y + 160, ...r.ahmera, 1, { color: C.dark, bg: 'rgba(246,238,220,0.92)' }));
      A(seg(t, s('l8', 0.2), s('l8', 0.8)), () => { card(WIN.x + 40, WIN.y + 220, 460, 130, { bg: C.paper, line: C.ochre }); txt('Major John Anderson', WIN.x + 270, WIN.y + 262, { size: 34, weight: 800, color: C.dark, align: 'center' }); txt('Victoria Cross', WIN.x + 270, WIN.y + 312, { size: 32, weight: 600, color: C.dark2, align: 'center' }); });
      chip('7 MAY · Tunis', WIN.x + 960, WIN.y + 640, { color: C.allied, size: 32, align: 'right', a: seg(t, s('l8', 3.6), s('l8', 4.2)) });
    });
    // l9: today, from the road
    A(span(t, s('l9', 0.3), s('l10', 0.1), 0.5, 0.5), () => {
      chip('seen from the road', WIN.x + 960, WIN.y + 600, { color: C.dark, bg: 'rgba(246,238,220,0.92)', size: 32, align: 'right' });
      chip('ask locally before walking up', WIN.x + 500, WIN.y + 80, { color: C.mint, size: 34, a: seg(t, s('l9', 2.4), s('l9', 3.0)) });
    });
  }));
  if (cr > 0) A(cr, () => windowFrame(() => cricket(t)));
  if (cem > 0) A(cem, () => windowFrame(() => {
    drawCemetery({ green: '#7a9a5e' });
    card(WIN.x + WIN.w - 450, WIN.y + 40, 410, 190, { bg: 'rgba(9,29,27,0.9)' });
    txt(fmt(2903), WIN.x + WIN.w - 420, WIN.y + 104, { size: 64, weight: 800, color: C.ochre });
    txtFit('buried or commemorated', WIN.x + WIN.w - 420, WIN.y + 170, 360, { size: 34, weight: 600, color: C.ink });
    chip('Medjez-el-Bab War Cemetery', WIN.x + WIN.w / 2, WIN.y + WIN.h - 46, { color: C.ink, size: 32 });
  }));
  if (names > 0) A(names, () => windowFrame(() => {
    drawRidge(t, { spring: 1 });
    ctx.fillStyle = 'rgba(9,29,27,0.55)'; ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
    const cards = [['Djebel el Ahmera', 'Djebel Rhar', 'Tunisian'], ['Longstop Hill', 'from cricket', 'British'], ['der Weihnachtsberg', 'Christmas Hill', 'German']];
    cards.forEach(([n, sub, who], j) => {
      const a = eout(seg(t, s('l11', 1.2 + j * 0.9), s('l11', 1.8 + j * 0.9)));
      A(a, () => {
        const x = WIN.x + j * 340, y = WIN.y + 240 + (1 - a) * 20;
        card(x, y, 320, 230, { bg: C.paper, line: C.ochre, r: 12 });
        txt(who, x + 160, y + 46, { size: 32, weight: 800, color: C.ochreDk, align: 'center', spacing: '2px' });
        txtFit(n, x + 160, y + 118, 296, { size: 36, weight: 800, color: C.dark, align: 'center' });
        txtFit(sub, x + 160, y + 176, 296, { size: 32, weight: 500, color: C.dark2, align: 'center' });
      });
    });
  }));
}

// ---------- 7: reading the land ----------
function partReading(t) {
  const cues = [['Ksar Ghilane', 'a stone'], ['Mareth', 'a firing slit'], ['Takrouna', 'a cliff edge'], ['Hammamet', 'a date'], ['Longstop Hill', 'a name']];
  A(span(t, s('r1', 0.2), s('r3', 0.3), 0.5, 0.6), () => {
    txtFit('Five stops', RX, 130, 980, { size: 64, weight: 700, family: DISPLAY });
    A(seg(t, s('r1', 1.0), s('r1', 1.6)), () => { const n = fmt(Math.round(TOTAL_KM / 100) * 100); txt(n, RX, 214, { size: 48, weight: 800, color: C.ochre }); txt('km', RX + textW(n, { size: 48, weight: 800 }) + 12, 218, { size: 36, weight: 700, color: C.soft }); });
    cues.forEach(([place, cue], j) => {
      const a = eout(seg(t, s('r2', 0.6 + j * 0.8), s('r2', 1.2 + j * 0.8)));
      A(a, () => {
        const y = 330 + j * 124 + (1 - a) * 14;
        card(RX, y - 50, RW, 104, { bg: 'rgba(9,29,27,0.85)', line: 'rgba(227,165,59,0.45)' });
        ctx.fillStyle = C.ochre; ctx.beginPath(); ctx.arc(RX + 54, y + 2, 24, 0, TAU); ctx.fill(); txt(String(j + 1), RX + 54, y + 4, { size: 32, weight: 800, color: C.bg0, align: 'center' });
        txtFit(place, RX + 100, y + 2, 400, { size: 36, weight: 700, color: C.ink });
        txtFit(cue, RX + RW - 30, y + 2, 440, { size: 40, weight: 600, family: DISPLAY, color: C.ochre, align: 'right' });
      });
    });
  });
  A(span(t, s('r3', 0.2), s('r4', 0.2), 0.5, 0.5), () => {
    txtFit('For the people who live here', RCX, 360, 980, { size: 52, weight: 700, family: DISPLAY, align: 'center' });
    ['an oasis', 'a village', 'a garden', 'a valley'].forEach((n, j) => chip(n, RX + 125 + j * 250, 500, { color: C.mint, size: 36, a: seg(t, s('r3', 2.4 + j * 0.4), s('r3', 2.9 + j * 0.4)) }));
  });
  A(span(t, s('r4', 0.2), s('r5', 0.2), 0.5, 0.5), () => { windowFrame(() => drawCemetery()); chip('war cemeteries', WIN.x + 40, WIN.y + 60, { color: C.ink, size: 32, align: 'left' }); });
  A(span(t, s('r5', 0.2), s('r6', 0.3), 0.5, 0.5), () => {
    ['check access locally', 'travel gently', 'leave it as you found it'].forEach((n, j) => chip(n, RCX, 380 + j * 120, { color: C.mint, size: 40, a: seg(t, s('r5', 0.4 + j * 1.0), s('r5', 0.9 + j * 1.0)) }));
  });
  A(seg(t, s('r6', 0.4), s('r6', 1.6)), () => {
    txt('ON THE TRAIL', RCX, 430, { size: fit('ON THE TRAIL', 980, 110, { weight: 800, family: DISPLAY, spacing: '4px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '4px' });
    txt('OF 1943', RCX, 560, { size: 110, weight: 800, family: DISPLAY, color: C.ochre, align: 'center', spacing: '4px' });
  });
}

// ---------- title cards and credits ----------
const CARD_PLACE = [null, 'Ksar Ghilane', 'Mareth', 'Takrouna, near Enfidha', 'Dar Sebastian, Hammamet', 'Longstop Hill, near Medjez el Bab', null];
function titleCards(t) {
  CH.forEach((ch, i) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.86, () => { ctx.fillStyle = 'rgba(6,20,19,0.92)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8)), y = 470 + (1 - p) * 20;
      txt(`PART ${ch.n}`, W / 2, y - 120, { size: 36, weight: 700, color: C.ochre, align: 'center', spacing: '6px' });
      const title = ch.title.toUpperCase();
      txt(title, W / 2, y, { size: fit(title, 1500, 120, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
      if (CARD_PLACE[i]) txt(CARD_PLACE[i], W / 2, y + 110, { size: fit(CARD_PLACE[i], 1400, 48), weight: 600, color: C.soft, align: 'center' });
      // the five stops as dots on a dotted trail, this one lit
      const y2 = y + 210;
      ctx.fillStyle = 'rgba(227,165,59,0.5)'; for (let j = 0; j < 33; j++) ctx.fillRect(W / 2 - 330 + j * 20, y2 - 2, 8, 4);
      for (let j = 0; j < 5; j++) {
        const x = W / 2 - 320 + j * 160, lit = i - 1 === j || i === 6;
        ctx.fillStyle = lit ? C.ochre : C.bg0; ctx.beginPath(); ctx.arc(x, y2, 18, 0, TAU); ctx.fill(); ctx.strokeStyle = C.ochre; ctx.lineWidth = 3; ctx.stroke();
        txt(String(j + 1), x, y2 + 2, { size: 32, weight: 800, color: lit ? C.bg0 : C.ochre, align: 'center' });
      }
    });
  });
}
const MUSIC = ['“Wood and Metal and Water” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Music for Manatees” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  'Wikipedia: Tunisian campaign; Ksar Ghilane; Battle of the Mareth Line; Mareth Line; Mareth Museum;',
  'Takrouna; Haane Manahi; Battle of Wadi Akarit; Battle of Longstop Hill; Erwin Rommel.',
  'French Ministry of the Armed Forces, Chemins de mémoire; 3 Squadron RAAF Association;',
  'La Presse (Tunis); Hatem Bourial, Webdo; Kapitalis/TAP; Le Petit Journal Tunis; CWGC.',
  'Travel advice: UK FCDO; French Ministry for Europe and Foreign Affairs (2026).',
  'Map outline: Natural Earth (public domain), simplified.',
];
function credits(t) {
  ctx.fillStyle = '#071816'; ctx.fillRect(0, 0, W, H);
  txt('ON THE TRAIL OF 1943', W / 2, 210, { size: fit('ON THE TRAIL OF 1943', 1600, 84, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
  txt('Tunisia 1943 · original animation', W / 2, 296, { size: 40, weight: 600, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 390, { size: 32, weight: 800, color: C.ochre, align: 'center', spacing: '4px' });
  MUSIC.forEach((m, j) => txt(m, W / 2, 440 + j * 44, { size: 32, weight: 500, align: 'center' }));
  txt('SOURCES', W / 2, 580, { size: 32, weight: 800, color: C.ochre, align: 'center', spacing: '4px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, 630 + j * 46, 1680, { size: 32, weight: 500, align: 'center', color: j > 3 ? C.soft : C.ink }));
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [DISPLAY, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    drawMap(t);
    const parts = [partOpen, partWar, partOasis, partLine, partRock, partVilla, partRidge, partReading];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    titleCards(t);
    A(seg(t, e('r6', 1.4), e('r6', 2.4)), () => credits(t));
  },
});
