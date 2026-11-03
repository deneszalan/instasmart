// "The war in Tunisia on screen" (« La guerre de Tunisie à l'écran »): the long film of Tunisia 1943's Film section,
// 16:9, 1920x1080. Four films about the war in Tunisia, in the order they were made. A film strip on the left gains a
// frame per film and lights the one being told; each film has a header with four tabs (MAKERS, ON SCREEN, THE RECORD,
// ITS TIME) that follow the narration's questions. Scenes from the films are drawn in sepia on a lit cinema screen;
// the record is drawn on the dark ground in steel blue (history), amber (family memory) and rose (the film's own
// choices, in the accent red). No stills, posters or likenesses: every picture is drawn, and people are simple figures.
// Look: the series' (tun-visit) Fraunces titles, Barlow labels, PART cards and credits card, and its schematic map of
// Tunisia (Natural Earth, simplified); this film's own accent is a cinema-velvet red (#ec5b62), its motif the film strip.
// The same scene plays the French version: kit.js swaps every whole string for its labels-fr.json entry, so words and
// numbers are drawn as separate strings, and k.rich() wraps the French as it does the English.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const TAU = Math.PI * 2, RAD = Math.PI / 180;

const C = {
  bg0: '#0b0a10', bg1: '#1e1828',
  ink: '#f6eedc', soft: 'rgba(246,238,220,0.76)', faint: 'rgba(246,238,220,0.22)', dark: '#2a2620',
  rose: '#ec5b62', roseDk: '#a8323f', hist: '#8cbbe6', mem: '#e9b85c', allied: '#88c2e4', axis: '#de7a5c', green: '#93c27a',
  card: 'rgba(16,13,22,0.92)', panel: 'rgba(16,13,22,0.8)',
  // the lit screen, in sepia
  sc0: '#f3e3be', sc1: '#dcbf8c', sep: '#3b2a1c', sep2: '#7a5a3a', sep3: '#b48b58',
  // the series' map
  sea: '#174850', sea2: '#1d5961', land: '#e4d3ab', neigh: '#4f5a4c',
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
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** Wrapped, centred text (translated whole, then wrapped). */
function wrap(str, cx, cy, maxW, { size = 32, weight = 600, family = TEXT, color = C.ink, lh } = {}) {
  k.rich(str, cx, cy, { maxW, size, weight, family, ink: color, lh: lh ?? size * 1.22 });
}
/** A rounded label as wide as its text. */
function chip(str, cx, cy, { color = C.ink, bg = C.card, size = 34, weight = 700, a = 1, align = 'center', line = true, family = TEXT, spacing = '0px', fill = null, textColor = null } = {}) {
  const w = textW(str, { size, weight, family, spacing }), pad = size * 0.62, h = size * 1.6;
  const x0 = align === 'left' ? cx : align === 'right' ? cx - w - pad * 2 : cx - w / 2 - pad;
  A(a, () => {
    k.rrect(x0, cy - h / 2, w + pad * 2, h, h / 2); ctx.fillStyle = fill ?? bg; ctx.fill();
    if (line) { ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke(); }
    txt(str, x0 + pad + w / 2, cy + 1, { size, weight, color: textColor ?? color, align: 'center', family, spacing });
  });
  return w + pad * 2;
}
function card(x, y, w, h, { bg = C.card, r = 16, line = null, lw = 3 } = {}) {
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
/** A rubber stamp, as on the series' archive cards. */
function stamp(str, x, y, col, a = 1, rot = -0.08, size = 34) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const w = textW(str, { size, weight: 800, spacing: '3px' }) + 36;
    ctx.strokeStyle = col; ctx.lineWidth = 4; k.rrect(-w / 2, -size * 0.85, w, size * 1.7, 6); ctx.stroke();
    txt(str, 0, 2, { size, weight: 800, color: col, align: 'center', spacing: '3px' });
    ctx.restore();
  });
}
const dot = (x, y, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
const pop = (t, a, d = 0.6) => eout(seg(t, a, a + d));

// ---------- dates and numbers, computed ----------
const DAY = 86400000;
const hav = ([la1, lo1], [la2, lo2]) => {
  const p1 = la1 * RAD, p2 = la2 * RAD, dp = (la2 - la1) * RAD, dl = (lo2 - lo1) * RAD;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};
const EL_GUETTAR = [34.3367, 8.9481], ALMERIA = [36.8381, -2.4597], VOLUBILIS = [34.0722, -5.5547];
const SPAIN_KM = Math.round(hav(EL_GUETTAR, ALMERIA) / 50) * 50; // about 1,050 km
const YEARS = [1944, 1970, 2008, 2008];
const LATER = YEARS[1] - YEARS[0]; // 26: "Twenty-six years later"
const months = (y1, m1, y2, m2) => (y2 - y1) * 12 + (m2 - m1);
const TV_MONTHS = months(1943, 5, 1944, 3); // from the end of the fighting (May 1943) to the release (March 1944): 10
const SONG_GAP = 2008 - 1942, SCREENING = 2017 - 1942; // 66 and 75 years
const STAFF = 300;
const GUETTAR_DAYS = Math.round((Date.UTC(1943, 3, 3) - Date.UTC(1943, 2, 23)) / DAY) + 1; // 23 March to 3 April: 12 days

// ---------- the map (Natural Earth, simplified: the series' map, as in tun-visit) ----------
const MAPDATA = {"TUN":[[[33.181,11.504],[32.902,11.457],[32.637,11.45],[32.507,11.562],[32.435,11.547],[32.369,11.443],[32.136,10.874],[32.004,10.773],[31.962,10.705],[31.974,10.629],[31.954,10.608],[31.84,10.586],[31.744,10.5],[31.715,10.428],[31.715,10.316],[31.68,10.266],[31.518,10.132],[31.428,10.107],[31.079,10.244],[30.986,10.244],[30.915,10.269],[30.842,10.255],[30.731,10.194],[30.641,10.1],[30.354,9.873],[30.331,9.743],[30.229,9.52],[32.072,9.045],[32.105,9.02],[32.526,8.332],[32.837,8.282],[33.095,8.087],[33.108,8.001],[33.184,7.871],[33.208,7.749],[33.232,7.724],[33.414,7.709],[33.659,7.555],[33.801,7.497],[33.894,7.479],[34.095,7.519],[34.199,7.63],[34.245,7.767],[34.414,7.832],[34.53,8.095],[34.637,8.228],[34.681,8.21],[34.763,8.271],[34.902,8.249],[35.067,8.3],[35.241,8.433],[35.29,8.318],[35.326,8.293],[35.403,8.289],[35.508,8.336],[35.621,8.329],[35.685,8.307],[35.751,8.257],[35.827,8.242],[36.036,8.275],[36.146,8.318],[36.244,8.307],[36.351,8.354],[36.43,8.357],[36.469,8.296],[36.491,8.167],[36.526,8.17],[36.663,8.429],[36.732,8.462],[36.768,8.408],[36.785,8.411],[36.803,8.555],[36.837,8.642],[36.94,8.602],[36.974,8.717],[36.979,8.825],[37.021,8.905],[37.153,9.038],[37.193,9.16],[37.234,9.211],[37.235,9.344],[37.276,9.419],[37.267,9.455],[37.31,9.553],[37.3,9.574],[37.345,9.743],[37.328,9.859],[37.271,9.862],[37.213,9.772],[37.154,9.808],[37.149,9.88],[37.197,9.927],[37.213,9.923],[37.234,9.862],[37.227,9.819],[37.262,9.866],[37.246,9.981],[37.266,10.05],[37.178,10.273],[37.159,10.212],[37.175,10.204],[37.171,10.147],[37.159,10.129],[37.143,10.136],[37.129,10.219],[37.095,10.226],[37.11,10.219],[37.077,10.176],[37.028,10.183],[36.977,10.219],[36.881,10.348],[36.822,10.298],[36.847,10.255],[36.839,10.219],[36.798,10.19],[36.786,10.248],[36.817,10.273],[36.749,10.32],[36.73,10.356],[36.729,10.438],[36.756,10.518],[36.773,10.539],[36.864,10.568],[36.896,10.734],[37.006,10.888],[37.05,10.903],[37.087,11.032],[37.063,11.061],[37.021,11.047],[36.918,11.094],[36.871,11.137],[36.854,11.13],[36.788,11.022],[36.452,10.798],[36.378,10.55],[36.337,10.518],[36.217,10.478],[36.112,10.474],[35.981,10.518],[35.922,10.582],[35.842,10.622],[35.77,10.744],[35.78,10.824],[35.766,10.842],[35.734,10.824],[35.699,10.842],[35.638,11.04],[35.614,11.054],[35.603,11.018],[35.555,11.014],[35.518,11.04],[35.506,11.086],[35.459,11.05],[35.334,11.043],[35.266,11.101],[35.238,11.162],[35.219,11.158],[35.206,11.112],[35.093,11.014],[35.033,11.018],[34.957,10.917],[34.873,10.917],[34.838,10.86],[34.797,10.87],[34.768,10.813],[34.655,10.701],[34.633,10.626],[34.532,10.582],[34.497,10.431],[34.424,10.377],[34.414,10.287],[34.372,10.248],[34.304,10.104],[34.213,10.053],[34.171,10.006],[33.983,10.05],[33.828,10.172],[33.684,10.366],[33.647,10.489],[33.706,10.716],[33.671,10.741],[33.603,10.737],[33.546,10.672],[33.483,10.716],[33.485,10.78],[33.539,10.91],[33.575,10.932],[33.617,10.906],[33.637,10.935],[33.627,10.96],[33.644,10.986],[33.618,11.043],[33.541,11.112],[33.49,11.115],[33.455,11.09],[33.392,11.112],[33.363,11.101],[33.372,11.13],[33.331,11.169],[33.287,11.295],[33.311,11.133],[33.281,11.122],[33.222,11.169],[33.184,11.418],[33.206,11.428],[33.259,11.353],[33.181,11.504]],[[33.841,10.993],[33.801,11.061],[33.738,10.971],[33.698,10.957],[33.733,10.957],[33.728,10.942],[33.64,10.888],[33.654,10.87],[33.688,10.878],[33.735,10.809],[33.703,10.78],[33.715,10.741],[33.759,10.726],[33.813,10.748],[33.885,10.737],[33.897,10.773],[33.88,10.899],[33.897,10.932],[33.841,10.993]],[[34.657,10.964],[34.672,10.986],[34.67,11.101],[34.66,11.112],[34.647,11.097],[34.621,11.054],[34.657,10.964]],[[34.773,11.266],[34.743,11.306],[34.73,11.299],[34.664,11.13],[34.681,11.122],[34.728,11.169],[34.758,11.173],[34.751,11.184],[34.748,11.223],[34.782,11.216],[34.826,11.256],[34.806,11.306],[34.773,11.266]]],"NEIGH":[[[30.0,6.0],[36.855,6.0],[36.903,6.197],[36.947,6.255],[37.024,6.273],[37.07,6.338],[37.094,6.417],[37.083,6.503],[37.058,6.543],[36.974,6.601],[36.953,6.82],[36.893,6.91],[36.891,6.975],[36.926,7.094],[36.915,7.133],[36.915,7.159],[36.994,7.256],[37.023,7.252],[37.083,7.18],[37.09,7.223],[37.07,7.274],[37.083,7.382],[37.051,7.403],[37.041,7.457],[37.055,7.49],[36.987,7.591],[36.987,7.673],[36.964,7.713],[36.97,7.771],[36.994,7.799],[36.889,7.774],[36.854,7.868],[36.877,8.051],[36.958,8.231],[36.926,8.289],[36.901,8.462],[36.94,8.602],[36.891,8.609],[36.849,8.642],[36.803,8.555],[36.785,8.411],[36.768,8.408],[36.732,8.462],[36.663,8.429],[36.526,8.17],[36.491,8.167],[36.469,8.296],[36.43,8.357],[36.351,8.354],[36.244,8.307],[36.146,8.318],[36.036,8.275],[35.827,8.242],[35.751,8.257],[35.685,8.307],[35.621,8.329],[35.508,8.336],[35.403,8.289],[35.326,8.293],[35.29,8.318],[35.241,8.433],[35.067,8.3],[34.902,8.249],[34.763,8.271],[34.681,8.21],[34.648,8.235],[34.53,8.095],[34.414,7.832],[34.245,7.767],[34.199,7.63],[34.095,7.519],[33.894,7.479],[33.659,7.555],[33.414,7.709],[33.232,7.724],[33.208,7.749],[33.184,7.871],[33.108,8.001],[33.095,8.087],[32.805,8.296],[32.526,8.332],[32.105,9.02],[32.072,9.045],[30.229,9.52],[30.116,9.286],[30.0,9.383]],[[33.181,11.504],[33.166,11.562],[33.108,11.637],[33.081,11.792],[33.136,11.691],[33.083,11.846],[32.921,12.123],[32.833,12.35],[32.798,12.732],[32.805,12.825],[32.867,13.074],[32.913,13.164],[32.919,13.257],[32.904,13.351],[32.835,13.5],[30.0,13.5],[30.0,9.383],[30.116,9.286],[30.331,9.743],[30.354,9.873],[30.641,10.1],[30.731,10.194],[30.842,10.255],[30.915,10.269],[30.986,10.244],[31.079,10.244],[31.428,10.107],[31.518,10.132],[31.68,10.266],[31.715,10.316],[31.715,10.428],[31.744,10.5],[31.84,10.586],[31.954,10.608],[31.974,10.629],[31.962,10.705],[32.004,10.773],[32.136,10.874],[32.369,11.443],[32.435,11.547],[32.507,11.562],[32.637,11.45],[32.902,11.457],[33.181,11.504]]]};
/** A projection into a box: lat at the top edge, lon at the left edge, scale in px per km. */
function proj(box, latTop, lonL, msc) {
  const KX = 111.32 * Math.cos(35 * RAD) * msc, KY = 110.57 * msc;
  return ([la, lo]) => [box.x + (lo - lonL) * KX, box.y + (latTop - la) * KY];
}
/** Paint the series' map into a box (on an offscreen canvas): sea, neighbours, Tunisia, coast. */
function paintMap(g, box, P, { r = 22 } = {}) {
  g.save(); g.beginPath(); g.roundRect(box.x, box.y, box.w, box.h, r); g.clip();
  const sg = g.createLinearGradient(0, box.y, 0, box.y + box.h); sg.addColorStop(0, C.sea2); sg.addColorStop(1, C.sea);
  g.fillStyle = sg; g.fillRect(box.x, box.y, box.w, box.h);
  g.fillStyle = C.neigh; g.strokeStyle = C.neigh; g.lineWidth = 8; g.lineJoin = 'round';
  for (const ring of MAPDATA.NEIGH) { g.beginPath(); ring.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p)))); g.closePath(); g.fill(); g.stroke(); }
  const lg = g.createLinearGradient(0, box.y, 0, box.y + box.h); lg.addColorStop(0, '#e9dbb6'); lg.addColorStop(1, '#e2c894');
  g.fillStyle = lg;
  for (const ring of MAPDATA.TUN) { g.beginPath(); ring.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p)))); g.closePath(); g.fill(); }
  g.strokeStyle = 'rgba(42,38,32,0.45)'; g.lineWidth = 2;
  for (const ring of MAPDATA.TUN) { g.beginPath(); ring.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p)))); g.closePath(); g.stroke(); }
  g.restore();
  g.strokeStyle = 'rgba(236,91,98,0.55)'; g.lineWidth = 3; g.beginPath(); g.roundRect(box.x, box.y, box.w, box.h, r); g.stroke();
}
// the map of chapter 1: the whole country, left of the stage
const MAP1 = { x: 520, y: 250, w: 470, h: 740 };
const P1 = proj(MAP1, 37.62, 7.35, 1.0);
// the Tunis map of chapter 4: the gulf, from Tunis to Hammam-Lif
const MAP4 = { x: 540, y: 300, w: 560, h: 560 };
const P4 = proj(MAP4, 37.15, 9.95, 7.0);
const TOWNS = { tunis: [36.806, 10.181], bizerte: [37.274, 9.874], goulette: [36.818, 10.305], hammamlif: [36.729, 10.341], gabes: [33.881, 10.098], medjez: [36.65, 9.6] };

// ---------- layout ----------
const STRIP = { x: 96, y: 72, w: 360, h: 918 };
const FR_W = 272, FR_H = 200, FR_X = STRIP.x + (STRIP.w - FR_W) / 2, frY = (i) => 96 + i * 222;
const MX = 520, MW = 1304, MCX = MX + MW / 2; // the main area, x 520–1824
const STAGE = { x: 520, y: 250, w: 1304, h: 740 };
const FILMS = [
  { title: 'Tunisian Victory', short: 'Tunisian Victory' },
  { title: 'Patton', short: 'Patton' },
  { title: 'Villa Jasmin', short: 'Villa Jasmin' },
  { title: 'The Wedding Song', short: 'The Wedding Song' },
];

// ---------- the background, painted once ----------
let BG = null, MAPC = null, MAPC4 = null;
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const g = BG.getContext('2d');
  const gr = g.createRadialGradient(W * 0.62, H * 0.42, 80, W * 0.58, H * 0.5, 1300);
  gr.addColorStop(0, C.bg1); gr.addColorStop(1, C.bg0);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // film grain and a few faint scratches
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(246,238,220,${0.012 + rnd() * 0.03})`; g.fillRect(rnd() * W, rnd() * H, 1.5, 1.5); }
  g.strokeStyle = 'rgba(246,238,220,0.035)'; g.lineWidth = 1.2;
  for (let i = 0; i < 14; i++) { const x = 500 + rnd() * 1400, y0 = rnd() * 600; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (rnd() - 0.5) * 6, y0 + 200 + rnd() * 400); g.stroke(); }
  // the film strip: body and sprocket holes
  g.fillStyle = '#121019'; g.beginPath(); g.roundRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h, 18); g.fill();
  g.strokeStyle = 'rgba(236,91,98,0.45)'; g.lineWidth = 3; g.stroke();
  g.fillStyle = 'rgba(246,238,220,0.13)';
  for (let y = STRIP.y + 22; y < STRIP.y + STRIP.h - 24; y += 34) {
    g.beginPath(); g.roundRect(STRIP.x + 12, y, 22, 15, 4); g.fill();
    g.beginPath(); g.roundRect(STRIP.x + STRIP.w - 34, y, 22, 15, 4); g.fill();
  }
  // the map of chapter 1, ready on its own canvas
  MAPC = document.createElement('canvas'); MAPC.width = W; MAPC.height = H;
  const m = MAPC.getContext('2d');
  paintMap(m, MAP1, P1);
  // its Axis-held north-east (schematic), hatched
  m.save(); m.beginPath(); m.roundRect(MAP1.x, MAP1.y, MAP1.w, MAP1.h, 22); m.clip();
  m.beginPath(); MAPDATA.TUN[0].forEach((p, i) => (i ? m.lineTo(...P1(p)) : m.moveTo(...P1(p)))); m.closePath(); m.clip();
  m.beginPath();
  [[37.6, 9.25], [36.75, 9.35], [36.2, 9.55], [35.6, 9.65], [35.0, 9.8], [34.4, 9.75], [33.9, 9.95], [33.5, 10.25], [33.2, 11.0], [33.0, 12.0], [37.6, 12.0]].forEach((p, i) => (i ? m.lineTo(...P1(p)) : m.moveTo(...P1(p))));
  m.closePath(); m.clip();
  m.strokeStyle = 'rgba(222,122,92,0.5)'; m.lineWidth = 3;
  for (let x = MAP1.x - MAP1.h; x < MAP1.x + MAP1.w; x += 16) { m.beginPath(); m.moveTo(x, MAP1.y + MAP1.h); m.lineTo(x + MAP1.h, MAP1.y); m.stroke(); }
  m.restore();
  // the Tunis map of chapter 4, on its own canvas
  MAPC4 = document.createElement('canvas'); MAPC4.width = W; MAPC4.height = H;
  paintMap(MAPC4.getContext('2d'), MAP4, P4);
}

// ---------- the lit screen ----------
/** A cinema screen: warm light, sepia drawing inside (fn), a soft vignette. */
function screen(x, y, w, h, fn, { glow = 1 } = {}) {
  ctx.save();
  ctx.shadowColor = `rgba(243,227,190,${0.28 * glow})`; ctx.shadowBlur = 50;
  k.rrect(x, y, w, h, 8); ctx.fillStyle = C.sc1; ctx.fill();
  ctx.restore();
  ctx.save(); k.rrect(x, y, w, h, 8); ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, C.sc0); g.addColorStop(1, C.sc1);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  fn();
  const v = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.35, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(59,42,28,0)'); v.addColorStop(1, 'rgba(59,42,28,0.38)');
  ctx.fillStyle = v; ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// ---------- small drawings (simple shapes, no likenesses) ----------
function camera(x, y, sc, col, spin = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 6 / sc * sc; ctx.lineCap = 'round';
  // reels
  for (const cx of [-34, 22]) {
    ctx.beginPath(); ctx.arc(cx, -52, 26, 0, TAU); ctx.lineWidth = 6; ctx.stroke();
    for (let i = 0; i < 3; i++) { const a = spin + (i * TAU) / 3; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 13, -52 + Math.sin(a) * 13, 5, 0, TAU); ctx.fill(); }
  }
  k.rrect(-64, -24, 104, 52, 6); ctx.fill();
  ctx.beginPath(); ctx.moveTo(40, -10); ctx.lineTo(72, -22); ctx.lineTo(72, 22); ctx.lineTo(40, 10); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-12, 28); ctx.lineTo(-48, 112); ctx.moveTo(-12, 28); ctx.lineTo(-12, 116); ctx.moveTo(-12, 28); ctx.lineTo(26, 112); ctx.stroke();
  ctx.restore();
}
function filmCan(cx, cy, r, col, { dashed = false, fill = 'rgba(16,13,22,0.9)' } = {}) {
  ctx.save();
  ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 5; if (dashed) ctx.setLineDash([14, 10]); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 0, TAU); ctx.lineWidth = 2; ctx.stroke();
  for (let i = 0; i < 5; i++) { const a = (i * TAU) / 5 - Math.PI / 2; dot(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5, r * 0.14, col); }
  dot(cx, cy, r * 0.12, col);
  ctx.restore();
}
/** A tank as a plain outline (a flat cut-out when `dummy`). */
function tank(x, y, sc, col, { dummy = false, dir = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc * dir, sc);
  ctx.fillStyle = col; ctx.strokeStyle = col;
  if (dummy) { ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-50, 34); ctx.moveTo(30, 0); ctx.lineTo(50, 34); ctx.stroke(); }
  k.rrect(-60, -6, 120, 30, 14); ctx.fill();
  k.rrect(-34, -28, 60, 24, 6); ctx.fill();
  ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(24, -18); ctx.lineTo(70, -22); ctx.stroke();
  if (!dummy) { ctx.fillStyle = 'rgba(243,227,190,0.5)'; for (let i = 0; i < 5; i++) dot(-44 + i * 22, 10, 6, ctx.fillStyle); }
  ctx.restore();
}
function plane(x, y, sc, col, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.fillStyle = col;
  k.rrect(-50, -7, 100, 14, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-22, -48); ctx.lineTo(-6, -48); ctx.lineTo(18, -6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(-22, 48); ctx.lineTo(-6, 48); ctx.lineTo(18, 6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(-60, -18); ctx.lineTo(-46, -18); ctx.lineTo(-38, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function palm(x, y, hgt, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - hgt * 0.5, x + 4, y - hgt); ctx.stroke();
  ctx.lineWidth = 6;
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.55; ctx.beginPath(); ctx.moveTo(x + 4, y - hgt); ctx.quadraticCurveTo(x + 4 + Math.cos(a) * 40, y - hgt + Math.sin(a) * 30 - 10, x + 4 + Math.cos(a) * 70, y - hgt + Math.sin(a) * 26 + 22); ctx.stroke(); }
}
/** A person as a simple figure: a head and a body (dress = a long robe). */
function figure(x, y, sc, col, { dress = false, arm = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.fillStyle = col;
  dot(0, -88, 16, col);
  ctx.beginPath();
  if (dress) { ctx.moveTo(-12, -68); ctx.lineTo(12, -68); ctx.lineTo(30, 0); ctx.lineTo(-30, 0); }
  else { ctx.moveTo(-16, -68); ctx.lineTo(16, -68); ctx.lineTo(18, 0); ctx.lineTo(-18, 0); }
  ctx.closePath(); ctx.fill();
  if (arm) { ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(10 * Math.sign(arm), -60); ctx.lineTo(34 * Math.sign(arm), -40); ctx.stroke(); }
  ctx.restore();
}
function villa(x, y, sc, { jasmine = 1, dusk = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = '#f7f1e3'; ctx.strokeStyle = C.sep2; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.rect(-180, -150, 360, 150); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.rect(-60, -200, 120, 50); ctx.fill(); ctx.stroke();
  // arched door and windows, Tunis blue
  ctx.fillStyle = '#3f74a6';
  const arch = (cx, w, top, bot) => { ctx.beginPath(); ctx.moveTo(cx - w / 2, bot); ctx.lineTo(cx - w / 2, top + w / 2); ctx.arc(cx, top + w / 2, w / 2, Math.PI, 0); ctx.lineTo(cx + w / 2, bot); ctx.closePath(); ctx.fill(); };
  arch(0, 64, -110, 0); arch(-112, 46, -120, -60); arch(112, 46, -120, -60);
  ctx.fillStyle = 'rgba(59,42,28,0.15)'; ctx.fillRect(-180, -6, 360, 6);
  // jasmine: a green vine with white stars
  if (jasmine > 0) {
    let sd = 5; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 46 * jasmine; i++) {
      const px = -200 + r() * 70, py = -150 + r() * 150;
      dot(px, py, 9, '#58784a');
      if (i % 2) dot(px + 3, py - 3, 4, '#fffaf0');
    }
  }
  ctx.restore();
  if (dusk > 0) { ctx.fillStyle = `rgba(59,42,28,${0.25 * dusk})`; }
}
/** A tile band (the courtyard's zellige), in sepia. */
function tiles(x, y, w, h, col1, col2) {
  const n = Math.ceil(w / h);
  for (let i = 0; i < n; i++) {
    const cx = x + i * h + h / 2, cy = y + h / 2;
    ctx.fillStyle = i % 2 ? col1 : col2; ctx.fillRect(x + i * h, y, h, h);
    ctx.fillStyle = i % 2 ? col2 : col1; ctx.beginPath(); ctx.moveTo(cx, cy - h * 0.36); ctx.lineTo(cx + h * 0.36, cy); ctx.lineTo(cx, cy + h * 0.36); ctx.lineTo(cx - h * 0.36, cy); ctx.closePath(); ctx.fill();
  }
}
function star(x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function microphone(x, y, sc, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round';
  k.rrect(-14, -44, 28, 50, 14); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -14, 24, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, 30); ctx.moveTo(-16, 30); ctx.lineTo(16, 30); ctx.stroke();
  ctx.restore();
}
function book(x, y, w, h, col, label, { labelColor = C.sep } = {}) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = col; k.rrect(-w / 2, -h / 2, w, h, 6); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-w / 2, -h / 2, 14, h);
  ctx.restore();
  if (label) wrap(label, x + 7, y, w - 40, { size: 32, weight: 800, color: labelColor });
}

/** Six tiny scenes of the campaign, in sepia (landings, winter, Kasserine, Mareth, Tunis, surrender). */
function miniScene(j, cx, cy) {
  ctx.fillStyle = C.sep3; ctx.fillRect(cx - 100, cy + 30, 200, 40);
  ctx.fillStyle = C.sep2; ctx.strokeStyle = C.sep2; ctx.lineWidth = 3;
  if (j === 0) { ctx.fillStyle = '#7fa0b2'; ctx.fillRect(cx - 100, cy + 20, 200, 50); ctx.fillStyle = C.sep2; ctx.beginPath(); ctx.moveTo(cx - 50, cy + 10); ctx.lineTo(cx + 40, cy + 10); ctx.lineTo(cx + 30, cy + 28); ctx.lineTo(cx - 40, cy + 28); ctx.closePath(); ctx.fill(); }
  else if (j === 1) { for (let i = 0; i < 12; i++) { const x = cx - 90 + i * 16; ctx.beginPath(); ctx.moveTo(x, cy - 50); ctx.lineTo(x - 8, cy - 10); ctx.stroke(); } ctx.beginPath(); ctx.ellipse(cx, cy - 52, 70, 16, 0, 0, TAU); ctx.fill(); }
  else if (j === 2) { ctx.beginPath(); ctx.moveTo(cx - 100, cy + 30); ctx.lineTo(cx - 40, cy - 30); ctx.lineTo(cx - 10, cy + 30); ctx.lineTo(cx + 30, cy + 30); ctx.lineTo(cx + 70, cy - 36); ctx.lineTo(cx + 100, cy + 30); ctx.closePath(); ctx.fill(); }
  else if (j === 3) { for (let i = 0; i < 4; i++) ctx.fillRect(cx - 80 + i * 44, cy + 6, 30, 24); }
  else if (j === 4) { for (let i = 0; i < 5; i++) ctx.fillRect(cx - 80 + i * 34, cy - 10 - (i % 2) * 20, 26, 40 + (i % 2) * 20); ctx.beginPath(); ctx.arc(cx + 6, cy - 30, 16, Math.PI, 0); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(cx - 20, cy + 30); ctx.lineTo(cx - 20, cy - 50); ctx.stroke(); ctx.fillStyle = '#fffaf0'; ctx.fillRect(cx - 18, cy - 50, 50, 30); }
}

// ---------- the film strip (left) ----------
/** Frame pictograms in a 272 x 110 box centred at (cx, cy), in colour col. */
function picto(i, cx, cy, col, sc = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  if (i === 0) camera(-4, -4, 0.5, col);
  else if (i === 1) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-110, 40); ctx.lineTo(-60, 0); ctx.lineTo(-20, 22); ctx.lineTo(30, -16); ctx.lineTo(110, 40); ctx.closePath(); ctx.fill();
    star(-60, -26, 18, col);
  } else if (i === 2) { ctx.save(); ctx.translate(0, 0); villa(0, 42, 0.36, { jasmine: 1 }); ctx.restore(); }
  else {
    ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-70, 46); ctx.lineTo(-70, -10); ctx.arc(0, -10, 70, Math.PI, 0); ctx.lineTo(70, 46); ctx.stroke();
    figure(-22, 46, 0.5, col, { dress: true }); figure(22, 46, 0.5, col, { dress: true });
  }
  ctx.restore();
}
/** Which film is current, 0–3, or -1: by chapter. */
function currentFilm(t) {
  for (let i = 4; i >= 1; i--) if (t >= CH[i].at + 2.0 && (i === 4 ? t < CH[5].at + 2.0 : t < CH[i + 1].at + 2.0)) return i - 1;
  return -1;
}
function drawStrip(t) {
  const end = CH[5].at;
  const appear = [s('o1', 0.4), s('o2', 0.4), s('o3', 0.6), s('o3', 1.2)];
  const lit = (i) => {
    // cold open: each frame lights as its film is named; afterwards the current film's frame
    if (t < CH[0].at + 2) return i === 0 ? span(t, s('o1', 0.4), s('o2', 0.4), 0.5, 0.5) : i === 1 ? span(t, s('o2', 0.4), s('o3', 0.4), 0.5, 0.5) : span(t, s('o3', 0.6), s('o4', 1.0), 0.5, 0.6);
    if (t > end + 2) return seg(t, rowAt(i), rowAt(i) + 0.6) * (1 - seg(t, s('r6'), s('r6', 0.6)));
    return currentFilm(t) === i ? Math.min(seg(t, CH[i + 1].at + 2, CH[i + 1].at + 3), 1 - seg(t, CH[i + 2].at + 1.4, CH[i + 2].at + 2)) : 0;
  };
  for (let i = 0; i < 4; i++) {
    const a = pop(t, appear[i], 0.7);
    if (a <= 0) continue;
    const y = frY(i), l = lit(i);
    A(a, () => {
      // the frame: dark, or lit like a screen
      k.rrect(FR_X, y, FR_W, FR_H, 8); ctx.fillStyle = '#1b1724'; ctx.fill();
      if (l > 0) A(l, () => { const g = ctx.createLinearGradient(0, y, 0, y + FR_H); g.addColorStop(0, C.sc0); g.addColorStop(1, C.sc1); k.rrect(FR_X, y, FR_W, FR_H, 8); ctx.fillStyle = g; ctx.fill(); });
      ctx.lineWidth = 3; ctx.strokeStyle = l > 0.5 ? C.rose : 'rgba(246,238,220,0.25)'; k.rrect(FR_X, y, FR_W, FR_H, 8); ctx.stroke();
      const ink = l > 0.5 ? C.sep : 'rgba(246,238,220,0.6)';
      picto(i, FR_X + FR_W / 2, y + 62, ink, 0.86);
      txt(String(YEARS[i]), FR_X + FR_W / 2, y + 134, { size: 40, weight: 800, family: DISPLAY, color: l > 0.5 ? C.roseDk : C.rose, align: 'center' });
      txtFit(FILMS[i].short, FR_X + FR_W / 2, y + 176, FR_W - 24, { size: 32, weight: 700, color: l > 0.5 ? C.sep : C.ink, align: 'center' });
    });
  }
}

// ---------- the film header: FILM n/4, the title, four tabs ----------
const TABS = ['MAKERS', 'ON SCREEN', 'THE RECORD', 'ITS TIME'];
function header(t, i, keys) {
  const f = FILMS[i];
  txt('FILM', MX, 112, { size: 32, weight: 700, color: C.rose, spacing: '4px' });
  const wF = textW('FILM', { size: 32, weight: 700, spacing: '4px' });
  txt(String(i + 1), MX + wF + 12, 112, { size: 32, weight: 800, color: C.rose });
  txt('/', MX + wF + 34, 112, { size: 32, weight: 500, color: C.soft });
  txt('4', MX + wF + 50, 112, { size: 32, weight: 700, color: C.soft });
  const tz = fit(f.title, 760, 62, { weight: 700, family: DISPLAY });
  txt(f.title, MX, 190, { size: tz, weight: 700, family: DISPLAY });
  const tw = textW(f.title, { size: tz, weight: 700, family: DISPLAY });
  txt(String(YEARS[i]), MX + tw + 26, 194, { size: 44, weight: 700, family: DISPLAY, color: C.rose });
  // tabs, right-aligned; the current one lit
  const lit = keys.map((key, j) => seg(t, s(key, -0.1), s(key, 0.4)) * (1 - (keys[j + 1] ? seg(t, s(keys[j + 1], -0.1), s(keys[j + 1], 0.4)) : 0)));
  let x = MX + MW;
  for (let j = TABS.length - 1; j >= 0; j--) {
    const str = TABS[j], w = textW(str, { size: 32, weight: 700 }) + 40;
    x -= w;
    const l = lit[j];
    k.rrect(x, 86, w, 52, 26);
    ctx.fillStyle = l > 0 ? `rgba(236,91,98,${0.15 + 0.85 * l})` : 'rgba(16,13,22,0.8)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = C.rose; ctx.stroke();
    txt(str, x + w / 2, 113, { size: 32, weight: 700, color: l > 0.5 ? C.bg0 : C.rose, align: 'center' });
    x -= 14;
  }
}
const win = (t, a, b, fi = 0.5, fo = 0.5) => span(t, a, b, fi, fo);
/** A two-line card: a heading in colour, then wrapped text. */
function infoCard(x, y, w, h, head, body, col, a = 1, { bodySize = 32 } = {}) {
  A(a, () => {
    card(x, y, w, h, { bg: 'rgba(16,13,22,0.9)', line: col });
    txtFit(head, x + w / 2, y + 40, w - 30, { size: 34, weight: 800, color: col, align: 'center', spacing: '1px' });
    wrap(body, x + w / 2, y + 40 + (h - 40) / 2 + 2, w - 34, { size: bodySize, weight: 600 });
  });
}

// ---------- cold open ----------
const SC0 = { x: 640, y: 270, w: 1100, h: 560 };
function partOpen(t) {
  // o1: a re-staged scene: a camera films a flat dummy tank under palms
  const v1 = span(t, s('o1'), s('o2', 0.3), 0.6, 0.6);
  if (v1 > 0) A(v1, () => {
    screen(SC0.x, SC0.y, SC0.w, SC0.h, () => {
      ctx.fillStyle = '#e8cf9c'; ctx.fillRect(SC0.x, SC0.y + 380, SC0.w, 180);
      palm(SC0.x + 900, SC0.y + 420, 230, C.sep2); palm(SC0.x + 990, SC0.y + 430, 190, C.sep3);
      tank(SC0.x + 640, SC0.y + 380, 1.6, C.sep2, { dummy: true });
      camera(SC0.x + 230, SC0.y + 300, 1.1, C.sep, (t - s('o1')) * 4);
      const u = eio(seg(t, s('o1', 0.8), s('o1', 2.0)));
      ctx.fillStyle = `rgba(255,248,225,${0.35 * u})`; ctx.beginPath(); ctx.moveTo(SC0.x + 310, SC0.y + 290); ctx.lineTo(SC0.x + 520, SC0.y + 250); ctx.lineTo(SC0.x + 520, SC0.y + 420); ctx.closePath(); ctx.fill();
    });
    chip('re-staged', SC0.x + 40, SC0.y + 52, { color: C.sep, bg: 'rgba(243,227,190,0.9)', size: 32, align: 'left', a: pop(t, s('o1', 1.2)) });
    chip('Florida', SC0.x + 240, SC0.y + SC0.h + 70, { color: C.rose, size: 36, a: pop(t, s('o1', 3.4)) });
    chip('California', SC0.x + 560, SC0.y + SC0.h + 70, { color: C.rose, size: 36, a: pop(t, s('o1', 4.0)) });
  });
  // o2: a Tunisian battle moved to Spain, and a general who was not there
  const v2 = span(t, s('o2', 0.1), s('o3', 0.3), 0.6, 0.6);
  if (v2 > 0) A(v2, () => {
    screen(SC0.x, SC0.y, SC0.w, SC0.h, () => {
      ctx.fillStyle = C.sep3; ctx.beginPath(); ctx.moveTo(SC0.x, SC0.y + 400); ctx.lineTo(SC0.x + 260, SC0.y + 300); ctx.lineTo(SC0.x + 520, SC0.y + 380); ctx.lineTo(SC0.x + 820, SC0.y + 280); ctx.lineTo(SC0.x + SC0.w, SC0.y + 360); ctx.lineTo(SC0.x + SC0.w, SC0.y + SC0.h); ctx.lineTo(SC0.x, SC0.y + SC0.h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.sep2; ctx.beginPath(); ctx.moveTo(SC0.x, SC0.y + 470); ctx.lineTo(SC0.x + 380, SC0.y + 430); ctx.lineTo(SC0.x + 520, SC0.y + 560); ctx.lineTo(SC0.x, SC0.y + 560); ctx.closePath(); ctx.fill();
      figure(SC0.x + 250, SC0.y + 440, 0.9, C.sep);
      star(SC0.x + 250, SC0.y + 330, 16, C.sep);
    });
    const a = pop(t, s('o2', 1.4));
    chip('set in Tunisia', SC0.x + 330, SC0.y + SC0.h + 70, { color: C.hist, size: 36, a });
    chip('filmed in Spain', SC0.x + 780, SC0.y + SC0.h + 70, { color: C.rose, size: 36, a: pop(t, s('o2', 2.0)) });
    A(pop(t, s('o2', 3.0)), () => {
      card(SC0.x + SC0.w - 330, SC0.y + 40, 290, 90, { bg: 'rgba(243,227,190,0.95)', line: C.sep });
      txt('Rommel', SC0.x + SC0.w - 185, SC0.y + 86, { size: 44, weight: 700, family: DISPLAY, color: C.sep, align: 'center' });
      const u = eio(seg(t, s('o2', 3.6), s('o2', 4.4)));
      if (u > 0.01) { ctx.strokeStyle = C.roseDk; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(SC0.x + SC0.w - 310, SC0.y + 86); ctx.lineTo(SC0.x + SC0.w - 310 + 250 * u, SC0.y + 86); ctx.stroke(); ctx.lineCap = 'butt'; }
    });
  });
  // o3: two screens: a villa, a courtyard
  const v3 = span(t, s('o3', 0.1), s('o4', 0.6), 0.6, 0.6);
  if (v3 > 0) A(v3, () => {
    const L = { x: 580, y: 300, w: 590, h: 470 }, R = { x: 1214, y: 300, w: 590, h: 470 };
    screen(L.x, L.y, L.w, L.h, () => { ctx.fillStyle = '#e6c993'; ctx.fillRect(L.x, L.y + 370, L.w, 100); villa(L.x + 315, L.y + 380, 0.95); });
    A(pop(t, s('o3', 1.2)), () => screen(R.x, R.y, R.w, R.h, () => {
      ctx.fillStyle = '#ead6ac'; ctx.fillRect(R.x, R.y, R.w, R.h);
      ctx.strokeStyle = C.sep2; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(R.x + 125, R.y + 470); ctx.lineTo(R.x + 125, R.y + 200); ctx.arc(R.x + 295, R.y + 200, 170, Math.PI, 0); ctx.lineTo(R.x + 465, R.y + 470); ctx.stroke();
      tiles(R.x, R.y + 405, R.w, 65, '#4f7f86', '#efe2c6');
      figure(R.x + 255, R.y + 405, 1.4, C.sep, { dress: true }); figure(R.x + 335, R.y + 405, 1.4, C.sep2, { dress: true });
    }));
    chip('a villa', L.x + L.w / 2, L.y + L.h + 70, { color: C.mem, size: 36, a: pop(t, s('o3', 1.0)) });
    chip('a courtyard', R.x + R.w / 2, R.y + R.h + 70, { color: C.mem, size: 36, a: pop(t, s('o3', 1.8)) });
    chip('Tunis', MCX + 100, 230, { color: C.ink, size: 36, a: pop(t, s('o3', 2.6)) });
  });
  // o4: the title, until the first chapter card
  const ti = eout(seg(t, s('o4', 1.0), s('o4', 2.2)));
  A(ti, () => {
    const z = fit('THE WAR IN TUNISIA', 1220, 112, { weight: 800, family: DISPLAY, spacing: '4px' });
    txt('THE WAR IN TUNISIA', MCX, 430 + (1 - ti) * 18, { size: z, weight: 800, family: DISPLAY, align: 'center', spacing: '4px' });
    txt('ON SCREEN', MCX, 566 + (1 - ti) * 18, { size: Math.min(z, 112), weight: 800, family: DISPLAY, color: C.rose, align: 'center', spacing: '4px' });
    // a row of sprocket holes
    ctx.fillStyle = C.rose; for (let i = 0; i < 9; i++) { k.rrect(MCX - 196 + i * 44, 654, 20, 13, 3); ctx.fill(); }
    txtFit('Four films, 1944 to 2008', MCX, 740, 1200, { size: 40, weight: 600, color: C.soft, align: 'center' });
  });
}

// ---------- 1: six months, four films ----------
const RC = 1050, RCW = 774, RCX = RC + RCW / 2; // the right column beside the map, x 1050–1824
const M0 = Date.UTC(1942, 10, 1), M1 = Date.UTC(1943, 5, 1);
const TLX0 = 1080, TLX1 = 1790, tlx = (ms) => lerp(TLX0, TLX1, (ms - M0) / (M1 - M0));
const MONTHS = ['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'];
function partWar(t) {
  // the map, a1 to a4
  const mapA = span(t, s('a1', 0), s('a5', 0.4), 0.6, 0.6);
  if (mapA > 0) A(mapA, () => {
    ctx.drawImage(MAPC, MAP1.x, MAP1.y, MAP1.w, MAP1.h, MAP1.x, MAP1.y, MAP1.w, MAP1.h);
    ctx.save(); k.rrect(MAP1.x, MAP1.y, MAP1.w, MAP1.h, 22); ctx.clip();
    txt('schematic map', MAP1.x + 16, MAP1.y + MAP1.h - 26, { size: 24, weight: 500, color: 'rgba(246,238,220,0.75)' });
    const town = (ll, name, a, dx = 14, al = 'left') => A(a, () => { const [x, y] = P1(ll); dot(x, y, 7, C.dark); k.font(700, 32, TEXT); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(233,219,182,0.85)'; ctx.lineJoin = 'round'; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.strokeText(name, x + dx, y); txt(name, x + dx, y, { size: 32, weight: 700, color: C.dark, align: al }); });
    town(TOWNS.tunis, 'Tunis', pop(t, s('a1', 0.6)), -14, 'right');
    town(TOWNS.bizerte, 'Bizerte', pop(t, s('a2', 1.6)), 14, 'left');
    // a2: Axis troops in from Sicily; Allied armies from Algeria and Libya
    A(seg(t, s('a2', 0.8), s('a2', 1.2)), () => trace([P1([37.62, 10.5]), P1([37.2, 10.35]), P1([36.88, 10.22])], eout(seg(t, s('a2', 0.8), s('a2', 2.2))), C.axis, { w: 9 }));
    A(seg(t, s('a2', 3.0), s('a2', 3.4)), () => {
      trace([P1([36.3, 7.35]), P1([36.5, 8.3]), P1([36.65, 9.25])], eout(seg(t, s('a2', 3.0), s('a2', 4.4))), C.allied, { w: 9 });
      trace([P1([32.6, 12.4]), P1([33.0, 11.3]), P1([33.8, 10.3])], eout(seg(t, s('a2', 3.6), s('a2', 5.0))), C.allied, { w: 9 });
    });
    A(pop(t, s('a2', 2.0)), () => { const [x, y] = P1([35.4, 10.55]); chip('Axis-held', x - 10, y, { color: C.axis, size: 32, bg: 'rgba(16,13,22,0.82)' }); });
    ctx.restore();
  });
  // a1: the protectorate
  A(span(t, s('a1', 0.2), s('a2', 0.3), 0.5, 0.5), () => {
    card(RC + 30, 360, RCW - 60, 300, { line: 'rgba(236,91,98,0.6)' });
    txt('1942', RCX, 428, { size: 44, weight: 800, color: C.rose, align: 'center' });
    txtFit('A French protectorate', RCX, 504, RCW - 120, { size: 58, weight: 700, family: DISPLAY, align: 'center' });
    txtFit('ruled in name by the Bey of Tunis', RCX, 584, RCW - 120, { size: 38, weight: 500, color: C.soft, align: 'center' });
  });
  // a2–a4: six months on a timeline
  const tlA = span(t, s('a2', 0.1), s('a5', 0.4), 0.6, 0.6), Y = 640;
  if (tlA > 0) A(tlA, () => {
    ctx.fillStyle = C.faint; ctx.fillRect(TLX0, Y - 3, TLX1 - TLX0, 6);
    for (let m = 0; m <= 7; m++) { const x = tlx(Date.UTC(1942, 10 + m, 1)); ctx.fillStyle = C.soft; ctx.fillRect(x - 1.5, Y - 14, 3, 28); }
    MONTHS.forEach((mo, j) => { const x = (tlx(Date.UTC(1942, 10 + j, 1)) + tlx(Date.UTC(1942, 11 + j, 1))) / 2; txtFit(mo, x, Y + 44, 94, { size: 32, weight: 700, color: C.soft, align: 'center', spacing: '1px' }); });
    txt('1942', tlx(Date.UTC(1942, 10, 1)), Y - 46, { size: 32, weight: 700, color: C.rose });
    txt('1943', tlx(Date.UTC(1943, 0, 1)), Y - 46, { size: 32, weight: 700, color: C.rose });
    const mark = (ms, label, col, a, up) => A(a, () => {
      const x = tlx(ms); dot(x, Y, 12, col);
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, Y + (up ? -16 : 16)); ctx.lineTo(x, Y + (up ? -110 : 110)); ctx.stroke();
      const al = x > 1500 ? 'right' : 'left';
      txt(label, x + (al === 'right' ? -14 : 14), Y + (up ? -130 : 130), { size: 34, weight: 800, color: col, align: al });
    });
    mark(Date.UTC(1942, 10, 9), 'Axis troops into Tunis', C.axis, pop(t, s('a2', 1.0)), true);
    mark(Date.UTC(1943, 4, 13), '13 May 1943', C.rose, pop(t, s('a3', 0.3)), false);
    const fill = eio(seg(t, s('a3', 0.2), s('a3', 1.6)));
    if (fill > 0) { ctx.fillStyle = C.rose; ctx.fillRect(tlx(Date.UTC(1942, 10, 9)), Y - 4, (tlx(Date.UTC(1943, 4, 13)) - tlx(Date.UTC(1942, 10, 9))) * fill, 8); }
    // a4: the people of Tunisia
    A(span(t, s('a4', 0.2), s('a5', 0.4), 0.5, 0.5), () => {
      txtFit('Tunisians of every faith', RCX, 330, RCW - 40, { size: 50, weight: 700, family: DISPLAY, align: 'center' });
      ['Muslims', 'Jews', 'Christians'].forEach((n, j) => chip(n, RCX + (j - 1) * 240, 420, { color: C.mem, size: 36, a: pop(t, s('a4', 1.0 + j * 0.45), 0.5) }));
    });
  });
  // a5: four films on a time line, 1940–2010
  const fA = span(t, s('a5', 0.3), s('a6', 0.2), 0.6, 0.5);
  const yx = (y) => lerp(600, 1760, (y - 1940) / 70), YL = 640;
  if (fA > 0) A(fA, () => {
    ctx.fillStyle = C.faint; ctx.fillRect(600, YL - 3, 1160, 6);
    for (let y = 1940; y <= 2010; y += 10) { const x = yx(y); ctx.fillStyle = C.soft; ctx.fillRect(x - 1.5, YL - 12, 3, 24); txt(String(y), x, YL + 44, { size: 32, weight: 700, color: C.soft, align: 'center' }); }
    YEARS.forEach((yr, i) => {
      const a = pop(t, s('a5', 1.2 + i * 0.5), 0.6), x = yx(yr), up = i % 2 === 0;
      A(a, () => {
        const yy = YL - (i === 2 ? 300 : 150);
        ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, YL); ctx.lineTo(x, yy + 56); ctx.stroke();
        filmCan(x, YL, 22, C.rose);
        const al = x > 1500 ? 'right' : 'center', xx = x + (al === 'right' ? -18 : 0);
        txt(FILMS[i].title, xx, yy, { size: 40, weight: 700, family: DISPLAY, color: C.ink, align: al });
        txt(String(yr), xx, yy + 44, { size: 32, weight: 800, color: C.rose, align: al });
      });
    });
    txt('in the order they were made', 600, 760, { size: 40, weight: 600, color: C.soft });
  });
  // a6: four questions
  A(span(t, s('a6', 0.2), CH[1].at + 1.0, 0.5, 0.6), () => {
    const Q = [['MAKERS', 'who made it, and for whom'], ['ON SCREEN', 'what it shows'], ['THE RECORD', 'what it invents, what is history'], ['ITS TIME', 'what it says about its time']];
    Q.forEach(([h, sub], j) => {
      const a = pop(t, s('a6', 0.4 + j * 1.0), 0.6), cx = MX + 40 + (j % 2) * 640, cy = 390 + Math.floor(j / 2) * 260;
      A(a, () => {
        card(cx, cy - 90, 600, 200, { line: 'rgba(236,91,98,0.55)' });
        chip(h, cx + 300, cy - 30 + (1 - a) * 10, { color: C.rose, size: 36 });
        txtFit(sub, cx + 300, cy + 54, 560, { size: 36, weight: 500, color: C.ink, align: 'center' });
      });
    });
  });
}

// ---------- 2: the armies' story (Tunisian Victory, 1944) ----------
function partTV(t) {
  header(t, 0, ['v1', 'v5', 'v7', 'v11']);
  // v1: a camera at war
  A(win(t, s('v1', 0.1), s('v2', 0.2)), () => {
    camera(860, 640, 2.2, C.ink, (t - s('v1')) * 2.5);
    txtFit('made during the war', 1460, 560, 640, { size: 52, weight: 700, family: DISPLAY, align: 'center' });
    txtFit('by the armies that fought it', 1460, 640, 640, { size: 40, weight: 500, color: C.soft, align: 'center' });
  });
  // v2–v3: two cans, then one joint film
  A(win(t, s('v2', 0.1), s('v4', 0.2)), () => {
    const one = eio(seg(t, s('v3', 0.6), s('v3', 2.4)));
    const c1 = [lerp(820, 1172, one), 520], c2 = [lerp(1520, 1172, one), 520];
    A(pop(t, s('v2', 0.3)) * (1 - one), () => { filmCan(c1[0], c1[1], 110, C.mem); txt('Desert Victory', c1[0], 690, { size: 40, weight: 700, family: DISPLAY, align: 'center' }); txt('1943 · El Alamein', c1[0], 740, { size: 32, weight: 600, color: C.mem, align: 'center' }); });
    A(pop(t, s('v2', 3.6)) * (1 - one), () => { filmCan(c2[0], c2[1], 110, C.mem, { dashed: true }); txt('Africa Freed', c2[0], 690, { size: 40, weight: 700, family: DISPLAY, align: 'center' }); txt('Tunisia · begun', c2[0], 740, { size: 32, weight: 600, color: C.mem, align: 'center' }); });
    A(pop(t, s('v3', 0.2)), () => {
      chip('London', 700, 330, { color: C.hist, size: 36 }); chip('Washington', 1640, 330, { color: C.hist, size: 36 });
      txt('Ministry of Information', 700, 390, { size: 32, weight: 500, color: C.soft, align: 'center' });
      txt('Office of War Information', 1640, 390, { size: 32, weight: 500, color: C.soft, align: 'center' });
    });
    A(one, () => { filmCan(1172, 520, 130, C.rose); txt('Tunisian Victory', 1172, 712, { size: 52, weight: 700, family: DISPLAY, align: 'center' }); txt('one joint film', 1172, 772, { size: 34, weight: 600, color: C.rose, align: 'center' }); });
  });
  // v4: Capra and Stewart, and 300 staff
  A(win(t, s('v4', 0.1), s('v5', 0.3)), () => {
    infoCard(560, 300, 560, 170, 'Frank Capra', 'Hollywood director, US Army colonel', C.hist, pop(t, s('v4', 0.3)));
    infoCard(560, 500, 560, 170, 'Hugh Stewart', 'British Army film officer', C.mem, pop(t, s('v4', 2.4)));
    const n = Math.round(STAFF * eio(seg(t, s('v4', 3.6), s('v4', 6.0))));
    for (let i = 0; i < n; i++) dot(1220 + (i % 25) * 22, 330 + Math.floor(i / 25) * 26, 7, C.rose);
    A(pop(t, s('v4', 3.6)), () => { txt(fmt(STAFF), 1220, 700, { size: 72, weight: 800, family: DISPLAY, color: C.rose }); txt('staff', 1220 + textW(fmt(STAFF), { size: 72, weight: 800, family: DISPLAY }) + 18, 708, { size: 40, weight: 700, color: C.soft }); });
  });
  // v5–v6: on screen: the campaign, voices, and the balance
  A(win(t, s('v5', 0.1), s('v6', 0.2)), () => {
    // the campaign as a strip of frames, landings to surrender
    const fr = ['landings', 'winter', 'Kasserine', 'Mareth', 'Tunis', 'surrender'];
    fr.forEach((f, j) => A(pop(t, s('v5', 0.2 + j * 0.25), 0.5), () => { const x = 560 + j * 212; screen(x, 300, 196, 130, () => miniScene(j, x + 98, 365)); txtFit(f, x + 98, 466, 196, { size: 32, weight: 600, color: C.soft, align: 'center' }); }));
    const V = [['Leo Genn', 'British'], ['Bernard Miles', 'British'], ['Anthony Veiller', 'American'], ['Burgess Meredith', 'American']];
    V.forEach(([n, nat], j) => A(pop(t, s('v5', 3.2 + j * 0.35), 0.5), () => {
      const x = 560 + j * 320, y = 640;
      microphone(x + 40, y + 10, 1.1, nat === 'British' ? C.mem : C.hist);
      txtFit(n, x + 80, y - 14, 220, { size: 32, weight: 700, color: C.ink });
      txt(nat, x + 80, y + 30, { size: 32, weight: 600, color: nat === 'British' ? C.mem : C.hist });
    }));
    A(pop(t, s('v5', 4.6)), () => chip('every voice British or American', MCX, 820, { color: C.rose, size: 36 }));
  });
  A(win(t, s('v6', 0.1), s('v7', 0.2)), () => {
    // a balance tipped to the American side (IWM)
    const tilt = 0.22 * eio(seg(t, s('v6', 1.0), s('v6', 3.0))), cx = MCX, cy = 470;
    ctx.fillStyle = C.soft; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 40, cy + 330); ctx.lineTo(cx + 40, cy + 330); ctx.closePath(); ctx.fill();
    const arm = (sgn) => [cx + sgn * 320 * Math.cos(tilt), cy + sgn * 320 * Math.sin(tilt)];
    ctx.strokeStyle = C.ink; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(...arm(-1)); ctx.lineTo(...arm(1)); ctx.stroke();
    [[-1, 'British effort', C.mem], [1, 'American effort', C.hist]].forEach(([sg, lab, col]) => {
      const [x, y] = arm(sg);
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 80, y + 90); ctx.moveTo(x, y); ctx.lineTo(x + 80, y + 90); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y + 92, 100, 18, 0, 0, TAU); ctx.fill();
      txt(lab, x, y + 150, { size: 36, weight: 700, color: col, align: 'center' });
    });
    A(pop(t, s('v6', 1.2)), () => txt('Imperial War Museum', MCX, 320, { size: 36, weight: 600, color: C.soft, align: 'center' }));
  });
  // v7–v10: the record: the ship, Stevens, Huston, two invented soldiers
  A(win(t, s('v7', 0.1), s('v8', 0.3)), () => {
    // a ship slips below the waterline; its reels float away
    const u = eio(seg(t, s('v7', 2.6), s('v7', 6.0)));
    const sx = 1000, sy = 640 + u * 150;
    ctx.save(); ctx.beginPath(); ctx.rect(STAGE.x, STAGE.y, STAGE.w, 640 - STAGE.y + 8); ctx.clip();
    ctx.translate(sx, sy); ctx.rotate(u * 0.18); ctx.scale(1.4, 1.4);
    ctx.fillStyle = C.soft; ctx.beginPath(); ctx.moveTo(-260, -40); ctx.lineTo(260, -40); ctx.lineTo(200, 40); ctx.lineTo(-210, 40); ctx.closePath(); ctx.fill();
    ctx.fillRect(-120, -100, 160, 60); ctx.fillRect(-60, -150, 40, 50);
    ctx.restore();
    ctx.strokeStyle = C.hist; ctx.lineWidth = 4;
    for (let j = 0; j < 3; j++) { ctx.beginPath(); for (let x = 560; x <= 1790; x += 10) { const y = 648 + j * 26 + 6 * Math.sin(x * 0.03 + t * 1.5 + j); x === 560 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    for (let j = 0; j < 4; j++) { const f = seg(t, s('v7', 3.2 + j * 0.3), s('v7', 7.0)); if (f > 0) A(1 - f * 0.7, () => filmCan(1180 + j * 110 + f * 140, 730 + j * 22 + f * 60, 34, C.mem)); }
    A(pop(t, s('v7', 0.4)), () => chip('filmed in the campaign', 800, 360, { color: C.hist, size: 36 }));
    A(pop(t, s('v7', 3.0)), () => chip('American footage lost at sea', 1440, 360, { color: C.rose, size: 36 }));
  });
  A(win(t, s('v8', 0.1), s('v10', 0.2)), () => {
    const L = { x: 560, y: 290, w: 610, h: 470 }, R = { x: 1214, y: 290, w: 610, h: 470 };
    screen(L.x, L.y, L.w, L.h, () => {
      ctx.fillStyle = '#7fa0b2'; ctx.fillRect(L.x, L.y + 290, L.w, 50);
      ctx.fillStyle = '#e3c590'; ctx.fillRect(L.x, L.y + 340, L.w, 130);
      tank(L.x + 400, L.y + 360, 1.2, C.sep2);
      for (let j = 0; j < 4; j++) figure(L.x + 110 + j * 56, L.y + 410, 0.7, C.sep);
    });
    chip('George Stevens', L.x + L.w / 2, L.y + L.h + 56, { color: C.mem, size: 34 });
    txt('Algiers · two weeks', L.x + L.w / 2, L.y + L.h + 120, { size: 32, weight: 600, color: C.soft, align: 'center' });
    A(pop(t, s('v9', 0.1)), () => {
      screen(R.x, R.y, R.w, R.h, () => {
        ctx.fillStyle = '#e8cf9c'; ctx.fillRect(R.x, R.y + 330, R.w, 140);
        palm(R.x + 520, R.y + 360, 200, C.sep3);
        tank(R.x + 300, R.y + 350, 1.3, C.sep2, { dummy: true });
        plane(R.x + 180 + (t - s('v9')) * 30, R.y + 130, 1.0, C.sep2, 0);
      });
      chip('John Huston', R.x + R.w / 2, R.y + R.h + 56, { color: C.mem, size: 34 });
      txt('Florida · California', R.x + R.w / 2, R.y + R.h + 120, { size: 32, weight: 600, color: C.soft, align: 'center' });
      stamp('USED?', R.x + R.w - 110, R.y + 70, C.roseDk, pop(t, s('v9', 4.4)), 0.1, 36);
    });
    stamp('RE-CREATED', L.x + 160, L.y + 60, C.roseDk, pop(t, s('v8', 0.4)), -0.08, 34);
  });
  A(win(t, s('v10', 0.1), s('v11', 0.2)), () => {
    [[-1, 'a British soldier', C.mem], [1, 'an American soldier', C.hist]].forEach(([sg, lab, col], j) => A(pop(t, s('v10', 0.3 + j * 0.8)), () => {
      const x = MCX + sg * 300;
      card(x - 270, 400, 540, 200, { bg: 'rgba(16,13,22,0.9)', line: col, r: 40 });
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(16,13,22,0.95)'; ctx.beginPath(); ctx.moveTo(x - sg * 40, 598); ctx.lineTo(x - sg * 110, 670); ctx.lineTo(x - sg * 100, 598); ctx.fill(); ctx.stroke();
      microphone(x - 190, 515, 1.1, col);
      txt(lab, x + 30, 472, { size: 38, weight: 700, color: col, align: 'center' });
      txt('voiced by an actor', x + 30, 534, { size: 32, weight: 500, color: C.soft, align: 'center' });
    }));
    stamp('INVENTED', MCX, 800, C.rose, pop(t, s('v10', 2.6)), -0.06, 48);
  });
  // v11–v13: its time
  A(win(t, s('v11', 0.1), s('v12', 0.2)), () => {
    // a calendar from the end of the fighting to the release, and on to the war's end in Europe
    const X0 = 600, X1 = 1760, ms0 = Date.UTC(1943, 4, 1), ms1 = Date.UTC(1945, 5, 1), x = (ms) => lerp(X0, X1, (ms - ms0) / (ms1 - ms0)), Y = 560;
    ctx.fillStyle = C.faint; ctx.fillRect(X0, Y - 3, X1 - X0, 6);
    for (let m = 0; m <= 25; m++) { const xx = x(Date.UTC(1943, 4 + m, 1)); ctx.fillStyle = C.soft; ctx.fillRect(xx - 1, Y - (m % 12 === 8 ? 18 : 8), 2, m % 12 === 8 ? 36 : 16); }
    ['1944', '1945'].forEach((yr, j) => txt(yr, x(Date.UTC(1944 + j, 0, 1)), Y + 50, { size: 32, weight: 700, color: C.soft, align: 'center' }));
    txt('MAY 1943', X0, Y + 50, { size: 32, weight: 700, color: C.soft, align: 'left' });
    const fill = eio(seg(t, s('v11', 0.4), s('v11', 3.2)));
    ctx.fillStyle = C.rose; ctx.fillRect(x(Date.UTC(1943, 4, 13)), Y - 5, (x(Date.UTC(1944, 2, 16)) - x(Date.UTC(1943, 4, 13))) * fill, 10);
    A(pop(t, s('v11', 0.4)), () => { dot(x(Date.UTC(1943, 4, 13)), Y, 12, C.hist); txt('fighting ends', x(Date.UTC(1943, 4, 13)), Y - 60, { size: 34, weight: 700, color: C.hist, align: 'left' }); });
    A(pop(t, s('v11', 1.6)), () => { const xm = (x(Date.UTC(1943, 4, 13)) + x(Date.UTC(1944, 2, 16))) / 2; txt(String(TV_MONTHS), xm - 8, Y - 150, { size: 64, weight: 800, family: DISPLAY, color: C.rose, align: 'right' }); txt('months after the fighting', xm + 4, Y - 144, { size: 34, weight: 700, color: C.soft, align: 'left' }); });
    A(pop(t, s('v11', 4.2)), () => { const xx = x(Date.UTC(1944, 2, 16)); dot(xx, Y, 14, C.rose); txt('film opens', xx, Y + 110, { size: 36, weight: 800, color: C.rose, align: 'center' }); txt('March 1944', xx, Y + 156, { size: 32, weight: 600, color: C.ink, align: 'center' }); });
    A(pop(t, s('v12', 0.0)), () => { const xx = x(Date.UTC(1945, 4, 8)); dot(xx, Y, 10, C.soft); txt('war in Europe ends', xx + 10, Y - 60, { size: 32, weight: 600, color: C.soft, align: 'right' }); });
  });
  A(win(t, s('v12', 0.1), s('v13', 0.2)), () => {
    A(pop(t, s('v12', 0.4)), () => {
      txt('“greatest of combined operations”', MCX, 380, { size: fit('“greatest of combined operations”', 1240, 64, { weight: 600, family: DISPLAY }), weight: 600, family: DISPLAY, color: C.ink, align: 'center' });
      txt('the film’s narrators', MCX, 460, { size: 32, weight: 600, color: C.rose, align: 'center' });
    });
    // two soldiers, then one plan
    const join = eio(seg(t, s('v12', 3.4), s('v12', 5.4)));
    [[-1, C.mem], [1, C.hist]].forEach(([sg, col]) => A(pop(t, s('v12', 3.0)), () => figure(MCX + sg * lerp(380, 70, join), 790, 1.9, col)));
    A(pop(t, s('v12', 5.0)), () => chip('build a better world', MCX, 870, { color: C.rose, size: 38 }));
  });
  A(win(t, s('v13', 0.1), CH[2].at + 1.0), () => {
    camera(MCX - 360, 600, 1.5, C.soft, t);
    chip('for audiences at home', MCX + 220, 470, { color: C.ink, size: 36, a: pop(t, s('v13', 0.3)) });
    chip('while the war went on', MCX + 220, 560, { color: C.ink, size: 36, a: pop(t, s('v13', 1.2)) });
    stamp('THE ARMIES’ STORY', MCX + 220, 700, C.rose, pop(t, s('v13', 2.4)), -0.05, 44);
  });
}

// ---------- 3: one general's story (Patton, 1970) ----------
const MAR0 = Date.UTC(1943, 2, 1), APR10 = Date.UTC(1943, 3, 10);
function partPatton(t) {
  header(t, 1, ['p1', 'p3', 'p6', 'p11']);
  // p1–p2: a wide screen and its credits
  A(win(t, s('p1', 0.1), s('p3', 0.2)), () => {
    // the curved 70 mm screen
    const x0 = 600, x1 = 1750, y0 = 300, y1 = 760, bow = 40;
    ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, y0 + bow, x1, y0); ctx.lineTo(x1, y1); ctx.quadraticCurveTo((x0 + x1) / 2, y1 - bow, x0, y1); ctx.closePath();
    ctx.shadowColor = 'rgba(243,227,190,0.3)'; ctx.shadowBlur = 50; ctx.fillStyle = '#17141e'; ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(243,227,190,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, y0 + bow, x1, y0); ctx.lineTo(x1, y1); ctx.quadraticCurveTo((x0 + x1) / 2, y1 - bow, x0, y1); ctx.closePath(); ctx.stroke();
    A(span(t, s('p1', 0.4), s('p2', 0.2), 0.5, 0.5), () => {
      txt('PATTON', MCX, 500, { size: 120, weight: 800, family: DISPLAY, color: C.sc0, align: 'center', spacing: '12px' });
      txt('20th Century-Fox · 1970', MCX, 600, { size: 36, weight: 600, color: C.soft, align: 'center' });
      txt(String(LATER), 600, 840, { size: 56, weight: 800, family: DISPLAY, color: C.rose });
      txt('years after Tunisian Victory', 600 + textW(String(LATER), { size: 56, weight: 800, family: DISPLAY }) + 16, 846, { size: 34, weight: 600, color: C.soft });
    });
    const roll = [['directed by', 'Franklin J. Schaffner'], ['written by', 'Francis Ford Coppola, Edmund H. North'], ['Patton', 'George C. Scott']];
    roll.forEach(([role, name], j) => A(span(t, s('p2', 0.2 + j * 1.6), s('p3', 0.2), 0.5, 0.4), () => {
      const y = 400 + j * 110;
      txt(role, MCX, y, { size: 32, weight: 600, color: C.rose, align: 'center', spacing: '2px' });
      txtFit(name, MCX, y + 44, 1040, { size: 44, weight: 600, family: DISPLAY, color: C.sc0, align: 'center' });
    }));
  });
  // p3–p5: on screen, in sepia
  const SC = { x: 600, y: 290, w: 1160, h: 520 };
  A(win(t, s('p3', 0.1), s('p6', 0.3)), () => {
    screen(SC.x, SC.y, SC.w, SC.h, () => {
      const p3 = span(t, s('p3', 0), s('p4', 0.4), 0.4, 0.6), p4 = span(t, s('p4', 0), s('p5', 0.4), 0.5, 0.6), p5 = seg(t, s('p5', 0), s('p5', 0.6));
      A(p3, () => {
        ctx.fillStyle = '#e3c590'; ctx.fillRect(SC.x, SC.y + 360, SC.w, 160);
        ctx.fillStyle = C.sep2; ctx.beginPath(); ctx.moveTo(SC.x + 420, SC.y + 400); ctx.lineTo(SC.x + 560, SC.y + 250); ctx.lineTo(SC.x + 700, SC.y + 400); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = C.sep; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(SC.x + 560, SC.y + 250); ctx.lineTo(SC.x + 560, SC.y + 170); ctx.stroke();
        ctx.fillStyle = C.roseDk; ctx.beginPath(); ctx.moveTo(SC.x + 560, SC.y + 170); ctx.lineTo(SC.x + 630, SC.y + 190); ctx.lineTo(SC.x + 560, SC.y + 210); ctx.closePath(); ctx.fill();
        star(SC.x + 594, SC.y + 190, 9, C.sc0);
        txt('II CORPS', SC.x + 560, SC.y + 460, { size: 36, weight: 800, color: C.sep, align: 'center', spacing: '3px' });
      });
      A(p4, () => {
        // a bedside: a lamp, a table, the book
        ctx.fillStyle = '#3e3026'; ctx.fillRect(SC.x, SC.y, SC.w, SC.h);
        ctx.fillStyle = 'rgba(243,227,190,0.25)'; ctx.beginPath(); ctx.moveTo(SC.x + 300, SC.y + 120); ctx.lineTo(SC.x + 120, SC.y + 420); ctx.lineTo(SC.x + 560, SC.y + 420); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#c9a26b'; ctx.fillRect(SC.x + 260, SC.y + 90, 80, 50); ctx.fillRect(SC.x + 294, SC.y + 140, 12, 130);
        ctx.fillStyle = '#6b5038'; ctx.fillRect(SC.x + 120, SC.y + 270, 440, 30); ctx.fillRect(SC.x + 150, SC.y + 300, 20, 220); ctx.fillRect(SC.x + 510, SC.y + 300, 20, 220);
        ctx.fillStyle = '#8a7058'; ctx.fillRect(SC.x + 640, SC.y + 300, 520, 220);
        A(seg(t, s('p4', 2.0), s('p4', 2.8)), () => book(SC.x + 340, SC.y + 232, 440, 72, '#e9d6ae', 'THE TANK IN ATTACK'));
        A(seg(t, s('p4', 0.6), s('p4', 1.2)), () => { chip('“Rommel is about to attack”', SC.x + 860, SC.y + 160, { color: C.sep, bg: 'rgba(243,227,190,0.95)', size: 34 }); });
      });
      A(p5, () => {
        ctx.fillStyle = '#e3c590'; ctx.fillRect(SC.x, SC.y + 300, SC.w, 220);
        ctx.fillStyle = C.sep3; ctx.beginPath(); ctx.moveTo(SC.x, SC.y + 320); ctx.lineTo(SC.x + 400, SC.y + 260); ctx.lineTo(SC.x + 760, SC.y + 330); ctx.lineTo(SC.x + SC.w, SC.y + 290); ctx.lineTo(SC.x + SC.w, SC.y + 340); ctx.lineTo(SC.x, SC.y + 360); ctx.closePath(); ctx.fill();
        const back = eio(seg(t, s('p5', 0.4), e('p5', 0.4)));
        for (let j = 0; j < 5; j++) tank(SC.x + 600 + j * 90 + back * 160, SC.y + 380 + (j % 2) * 30, 0.38, C.sep2, { dir: -1 });
        ctx.fillStyle = C.sep; ctx.beginPath(); ctx.moveTo(SC.x, SC.y + 520); ctx.lineTo(SC.x, SC.y + 420); ctx.lineTo(SC.x + 360, SC.y + 400); ctx.lineTo(SC.x + 470, SC.y + 520); ctx.closePath(); ctx.fill();
        figure(SC.x + 250, SC.y + 410, 1.0, C.sep, { arm: 1 });
      });
    });
    A(span(t, s('p5', 0.8), s('p6', 0.3), 0.5, 0.5), () => {
      txt('“I read your book!”', MCX, 880, { size: 64, weight: 600, family: DISPLAY, color: C.ink, align: 'center' });
      txt('Patton, in the film', MCX, 950, { size: 32, weight: 600, color: C.rose, align: 'center' });
    });
  });
  // p6: the record, March 1943
  const X0 = 600, X1 = 1760, dx = (ms) => lerp(X0, X1, (ms - MAR0) / (APR10 - MAR0)), Y = 470;
  A(win(t, s('p6', 0.1), s('p7', 0.3)), () => {
    ctx.fillStyle = C.faint; ctx.fillRect(X0, Y - 3, X1 - X0, 6);
    for (let d = 1; d <= 41; d++) { const xx = dx(MAR0 + (d - 1) * DAY); ctx.fillStyle = C.soft; ctx.fillRect(xx - 1, Y - 6, 2, 12); }
    txt('MARCH 1943', X0, Y - 44, { size: 32, weight: 700, color: C.soft, spacing: '2px' });
    txt('APRIL', dx(Date.UTC(1943, 3, 1)), Y - 44, { size: 32, weight: 700, color: C.soft, spacing: '2px' });
    const mk = (d, label, sub, col, a, up) => A(a, () => { const xx = dx(Date.UTC(1943, 2, d)); dot(xx, Y, 12, col); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xx, Y + (up ? -16 : 16)); ctx.lineTo(xx, Y + (up ? -96 : 96)); ctx.stroke(); txt(label, xx, Y + (up ? -150 : 130), { size: 36, weight: 800, color: col, align: 'center' }); txt(sub, xx, Y + (up ? -110 : 172), { size: 32, weight: 600, color: C.ink, align: 'center' }); });
    mk(6, '6 MAR', 'Patton takes II Corps', C.hist, pop(t, s('p6', 0.3)), false);
    mk(9, '9 MAR', 'Rommel leaves Africa', C.rose, pop(t, s('p6', 3.4)), true);
    A(pop(t, s('p6', 1.4)), () => { book(1460, 760, 440, 80, '#d8c39b', 'THE TANK IN ATTACK', { labelColor: C.sep }); stamp('NEVER FINISHED', 1460, 860, C.rose, pop(t, s('p6', 2.0)), -0.06, 34); });
  });
  // p7–p8: the El Guettar valley, schematic
  const V = { x: 560, y: 280, w: 1240, h: 620 };
  const road = [[V.x + 40, 610], [V.x + 260, 600], [V.x + 520, 590], [V.x + 800, 610], [V.x + 1200, 640]];
  const wadi = smooth([[V.x + 700, 470], [V.x + 690, 560], [V.x + 720, 640], [V.x + 700, 740]]);
  A(win(t, s('p7', 0.1), s('p9', 0.3)), () => {
    card(V.x, V.y, V.w, V.h, { bg: 'rgba(16,13,22,0.75)', line: 'rgba(140,187,230,0.5)' });
    txt('El Guettar valley · schematic plan', V.x + 24, V.y + 36, { size: 32, weight: 600, color: C.soft });
    // hills
    ctx.fillStyle = 'rgba(140,187,230,0.16)';
    for (const [cx, cy, rx, ry] of [[V.x + 380, 420, 300, 70], [V.x + 980, 420, 220, 60], [V.x + 360, 800, 280, 60], [V.x + 1000, 820, 220, 50]]) { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = 'rgba(246,238,220,0.5)'; ctx.lineWidth = 8; ctx.beginPath(); road.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke();
    txt('Gafsa', V.x + 40, 660, { size: 32, weight: 600, color: C.soft });
    txt('to Gabès', V.x + V.w - 24, 690, { size: 32, weight: 600, color: C.soft, align: 'right' });
    ctx.strokeStyle = C.hist; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.beginPath(); wadi.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke(); ctx.setLineDash([]);
    A(pop(t, s('p8', 0.2)), () => { txt('Keddab wadi', V.x + 720, 450, { size: 32, weight: 700, color: C.hist, align: 'left' }); });
    // US 1st Infantry Division on the hills
    A(pop(t, s('p7', 2.6)), () => {
      for (const [x, y] of [[V.x + 300, 420], [V.x + 440, 410], [V.x + 360, 790], [V.x + 520, 800]]) { k.rrect(x - 30, y - 18, 60, 36, 6); ctx.fillStyle = C.allied; ctx.fill(); }
      chip('US 1st Infantry Division', V.x + 380, 506, { color: C.allied, size: 32 });
    });
    // 10th Panzer from the east
    const adv = eio(seg(t, s('p7', 1.0), s('p8', 1.6))), back = eio(seg(t, s('p8', 6.0), e('p8', 0.4)));
    const stopX = V.x + 740;
    ctx.save(); k.rrect(V.x, V.y, V.w, V.h, 16); ctx.clip();
    for (let j = 0; j < 12; j++) {
      const x0 = V.x + V.w + 40 + j * 46, x = Math.max(stopX + (j % 4) * 6, lerp(x0, stopX - 120 + j * 40, adv)) + back * 300;
      const isStopped = j < 8, gone = !isStopped && seg(t, s('p8', 2.4), s('p8', 4.0)) > 0;
      const y = 600 + ((j % 3) - 1) * 40;
      A(1 - (gone ? seg(t, s('p8', 2.4), s('p8', 4.0)) * 0.7 : 0), () => { k.rrect(x - 20, y - 12, 40, 24, 5); ctx.fillStyle = isStopped && seg(t, s('p8', 0.6), s('p8', 1.6)) > 0.5 ? '#9a8a80' : C.axis; ctx.fill(); });
    }
    ctx.restore();
    A(pop(t, s('p7', 1.4)), () => chip('10th Panzer Division', V.x + V.w - 200, 520, { color: C.axis, size: 32 }));
    // minefield dots
    A(pop(t, s('p8', 0.2)), () => { let sd = 3; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 60; i++) dot(V.x + 690 + r() * 70, 540 + r() * 130, 3, C.mem); });
    // tallies
    A(pop(t, s('p8', 0.8)), () => { txt('8', V.x + 60, 950, { size: 60, weight: 800, family: DISPLAY, color: C.mem, align: 'right' }); txt('stopped by mines', V.x + 76, 954, { size: 32, weight: 600, color: C.ink }); });
    A(pop(t, s('p8', 3.0)), () => { const x0 = V.x + 76 + textW('stopped by mines', { size: 32, weight: 600 }) + 70 + textW('about', { size: 32, weight: 600 }); txt('about', x0, 954, { size: 32, weight: 600, color: C.ink, align: 'right' }); txt('30', x0 + 12, 950, { size: 60, weight: 800, family: DISPLAY, color: C.allied }); txt('more', x0 + 24 + textW('30', { size: 60, weight: 800, family: DISPLAY }), 954, { size: 32, weight: 600, color: C.ink }); });
    A(pop(t, s('p8', 6.0)), () => chip('midday: pulled back', V.x + V.w - 30, 950, { color: C.ink, size: 32, align: 'right' }));
  });
  // p9: weeks against a morning; two divisions against a duel
  A(win(t, s('p9', 0.1), s('p10', 0.2)), () => {
    const y = 420;
    ctx.fillStyle = C.faint; ctx.fillRect(X0, y - 3, X1 - X0, 6);
    txt('IN THE RECORD', X0, y - 70, { size: 32, weight: 800, color: C.hist, spacing: '2px' });
    const u = eio(seg(t, s('p9', 0.3), s('p9', 2.0)));
    ctx.fillStyle = C.hist; ctx.fillRect(dx(Date.UTC(1943, 2, 23)), y - 10, (dx(Date.UTC(1943, 3, 3) + DAY) - dx(Date.UTC(1943, 2, 23))) * u, 20);
    A(pop(t, s('p9', 1.0)), () => { txt(String(GUETTAR_DAYS), dx(Date.UTC(1943, 2, 23)) - 16, y + 60, { size: 48, weight: 800, family: DISPLAY, color: C.hist, align: 'right' }); txt('days of fighting, 23 March – 3 April', dx(Date.UTC(1943, 2, 23)), y + 64, { size: 32, weight: 600, color: C.ink }); });
    txt('IN THE FILM', X0, y + 170, { size: 32, weight: 800, color: C.rose, spacing: '2px' });
    A(pop(t, s('p9', 2.4)), () => { ctx.fillStyle = C.rose; ctx.fillRect(dx(Date.UTC(1943, 2, 23)), y + 230, Math.max(6, (dx(MAR0 + DAY) - dx(MAR0)) * 0.25), 20); txt('one morning', dx(Date.UTC(1943, 2, 23)) + 24, y + 240, { size: 32, weight: 700, color: C.rose }); });
    A(pop(t, s('p9', 4.4)), () => {
      chip('10th Panzer Division', 760, 820, { color: C.axis, size: 32 }); chip('US 1st Infantry Division', 1150, 820, { color: C.allied, size: 32 });
      const u2 = eio(seg(t, s('p9', 5.2), s('p9', 6.6)));
      A(u2, () => { trace([[1380, 820], [1460, 820]], 1, C.soft, { w: 5, headSize: 18 }); chip('Patton', 1560, 790, { color: C.rose, size: 32 }); chip('Rommel', 1560, 860, { color: C.rose, size: 32 }); });
    });
  });
  // p10: filmed in Spain
  A(win(t, s('p10', 0.1), s('p11', 0.2)), () => {
    // a schematic of the western Mediterranean, by coordinates (no outlines)
    const Q = (ll) => [1560 + (ll[1] - EL_GUETTAR[1]) * 60, 700 - (ll[0] - EL_GUETTAR[0]) * 100];
    const g = Q(EL_GUETTAR), a = Q(ALMERIA), v = Q(VOLUBILIS);
    card(560, 290, 1260, 600, { bg: 'rgba(23,72,80,0.5)', line: 'rgba(236,91,98,0.4)' });
    txt('schematic, not to scale', 584, 326, { size: 24, weight: 500, color: 'rgba(246,238,220,0.7)' });
    dot(...g, 14, C.hist); txt('El Guettar, Tunisia', g[0], g[1] + 50, { size: 34, weight: 700, color: C.hist, align: 'center' });
    txt('set here', g[0], g[1] - 44, { size: 32, weight: 600, color: C.soft, align: 'center' });
    A(pop(t, s('p10', 1.6)), () => {
      const u = eio(seg(t, s('p10', 1.6), s('p10', 3.4)));
      trace(smooth([g, [(g[0] + a[0]) / 2, Math.min(g[1], a[1]) - 90], a], 16), u, C.rose, { w: 6, dash: [16, 12], headSize: 20 });
      A(seg(t, s('p10', 3.0), s('p10', 3.6)), () => { dot(...a, 14, C.rose); txt('Almería, Spain', a[0], a[1] + 50, { size: 34, weight: 700, color: C.rose, align: 'center' }); txt('filmed here', a[0], a[1] - 44, { size: 32, weight: 600, color: C.soft, align: 'center' }); });
      A(seg(t, s('p10', 3.4), s('p10', 4.0)), () => { const mx = (g[0] + a[0]) / 2 + 40, my = Math.min(g[1], a[1]) - 104; txt('about', mx - 70, my, { size: 32, weight: 600, color: C.soft, align: 'right' }); txt(fmt(SPAIN_KM), mx - 54, my - 2, { size: 44, weight: 800, family: DISPLAY, color: C.rose }); txt('km', mx - 54 + textW(fmt(SPAIN_KM), { size: 44, weight: 800, family: DISPLAY }) + 10, my, { size: 32, weight: 700, color: C.soft }); });
    });
    A(pop(t, s('p10', 4.4)), () => { dot(...v, 10, C.mem); txt('“Carthage”: Volubilis, Morocco', v[0] + 20, v[1] + 46, { size: 32, weight: 600, color: C.mem, align: 'left' }); });
  });
  // p11–p13: its time
  A(win(t, s('p11', 0.1), s('p12', 0.2)), () => {
    const X = (y) => lerp(600, 1760, (y - 1940) / 40), Yt = 560;
    ctx.fillStyle = C.faint; ctx.fillRect(600, Yt - 3, 1160, 6);
    for (let y = 1940; y <= 1980; y += 10) { ctx.fillStyle = C.soft; ctx.fillRect(X(y) - 1.5, Yt - 12, 3, 24); txt(String(y), X(y), Yt + 46, { size: 32, weight: 700, color: C.soft, align: 'center' }); }
    const u = eio(seg(t, s('p11', 1.6), s('p11', 3.4)));
    A(pop(t, s('p11', 1.6)), () => { ctx.fillStyle = 'rgba(222,122,92,0.35)'; ctx.fillRect(X(1955.8), Yt - 26, (X(1975.3) - X(1955.8)) * u, 52); txt('the Vietnam War', X(1965.5), Yt - 70, { size: 36, weight: 700, color: C.axis, align: 'center' }); });
    A(pop(t, s('p11', 0.3)), () => { dot(X(1970.1), Yt, 14, C.rose); txt('Patton', X(1970.1), Yt + 110, { size: 40, weight: 700, family: DISPLAY, color: C.rose, align: 'center' }); txt('1970', X(1970.1), Yt + 156, { size: 32, weight: 700, color: C.ink, align: 'center' }); });
    A(pop(t, s('p11', 0.3)), () => { dot(X(1944.2), Yt, 10, C.soft); txt('Tunisian Victory', X(1944.2), Yt + 110, { size: 32, weight: 600, color: C.soft, align: 'center' }); });
  });
  A(win(t, s('p12', 0.1), s('p13', 0.2)), () => {
    filmCan(MCX, 520, 120, C.rose); A(1, () => { ctx.save(); ctx.translate(MCX, 520); ctx.rotate((t - s('p12')) * 1.2); ctx.translate(-MCX, -520); filmCan(MCX, 520, 120, C.rose); ctx.restore(); });
    chip('a hero', MCX - 380, 440, { color: C.mem, size: 40, a: pop(t, s('p12', 0.4)) });
    chip('a warning', MCX + 380, 440, { color: C.hist, size: 40, a: pop(t, s('p12', 1.4)) });
    A(pop(t, s('p12', 2.4)), () => { txt('President Nixon, spring 1970', MCX, 720, { size: 40, weight: 700, color: C.ink, align: 'center' }); txt('again and again', MCX, 780, { size: 36, weight: 600, color: C.rose, align: 'center' }); });
  });
  A(win(t, s('p13', 0.1), CH[3].at + 1.0), () => {
    const n = 7;
    for (let j = 0; j < n; j++) A(pop(t, s('p13', 0.3 + j * 0.2), 0.4), () => star(MCX - 300 + j * 100, 420, 34, C.mem));
    A(pop(t, s('p13', 1.4)), () => { txt(String(n), MCX - 20, 540, { size: 56, weight: 800, family: DISPLAY, color: C.mem, align: 'right' }); txt('Oscars, including Best Picture', MCX, 544, { size: 36, weight: 600, color: C.ink }); });
    stamp('ONE GENERAL’S STORY', MCX, 720, C.rose, pop(t, s('p13', 3.0)), -0.05, 44);
  });
}

// ---------- 4: a son's story (Villa Jasmin, 2008) ----------
function tunisMap(t, a, { pins = [] } = {}) {
  A(a, () => {
    ctx.drawImage(MAPC4, MAP4.x, MAP4.y, MAP4.w, MAP4.h, MAP4.x, MAP4.y, MAP4.w, MAP4.h);
    ctx.save(); k.rrect(MAP4.x, MAP4.y, MAP4.w, MAP4.h, 22); ctx.clip();
    txt('schematic map', MAP4.x + 16, MAP4.y + MAP4.h - 24, { size: 24, weight: 600, color: 'rgba(42,38,32,0.7)' });
    { const [gx, gy] = P4([36.97, 10.5]); txt('Gulf of Tunis', gx, gy, { size: 32, weight: 600, color: 'rgba(246,238,220,0.8)', align: 'center' }); }
    for (const [ll, name, col, pa, dx, dy, al] of pins) A(pa, () => {
      const [x, y] = P4(ll); dot(x, y, 10, col); ctx.strokeStyle = C.dark; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.stroke();
      k.font(700, 32, TEXT); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(233,219,182,0.9)'; ctx.lineJoin = 'round'; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.strokeText(name, x + dx, y + dy);
      txt(name, x + dx, y + dy, { size: 32, weight: 700, color: C.dark, align: al });
    });
    ctx.restore();
  });
}
const LANES = [['HISTORY', C.hist], ['FAMILY MEMORY', C.mem], ['THE FILM', C.rose]];
const laneY = (i) => 380 + i * 214, LCX = (j) => 720 + j * 372 + 180, LW = 360;
function partJasmin(t) {
  header(t, 2, ['j1', 'j5', 'j6', 'j11']);
  // j1–j2: Boughedir, near Tunis
  A(win(t, s('j1', 0.1), s('j3', 0.2)), () => {
    tunisMap(t, 1, { pins: [[TOWNS.tunis, 'Tunis', C.ink, pop(t, s('j1', 0.4)), -18, 0, 'right'], [TOWNS.hammamlif, 'Hammam-Lif', C.rose, pop(t, s('j1', 2.2)), 16, 28, 'left'], [TOWNS.goulette, 'La Goulette', C.mem, pop(t, s('j2', 2.6)), 16, -26, 'left']] });
    infoCard(1160, 320, 620, 190, 'Férid Boughedir', 'Tunisian director, born 1944', C.rose, pop(t, s('j1', 1.4)));
    A(pop(t, s('j2', 0.2)), () => txtFit('historian of African and Arab cinema', 1470, 570, 620, { size: 34, weight: 600, color: C.soft, align: 'center' }));
    A(pop(t, s('j2', 2.4)), () => {
      filmCan(1260, 740, 70, C.mem);
      txt('A Summer in La Goulette', 1350, 712, { size: fit('A Summer in La Goulette', 440, 38, { weight: 700, family: DISPLAY }), weight: 700, family: DISPLAY });
      txt('1996', 1350, 766, { size: 32, weight: 700, color: C.mem });
      ['Muslim', 'Jewish', 'Christian'].forEach((n, j) => chip(n, 1240 + j * 190, 860, { color: C.mem, size: 32, a: pop(t, s('j2', 3.4 + j * 0.3)) }));
    });
  });
  // j3–j4: a TV film from a novel about a father
  A(win(t, s('j3', 0.1), s('j5', 0.2)), () => {
    // a television set
    A(pop(t, s('j3', 0.3)), () => {
      card(600, 330, 420, 300, { bg: '#17141e', line: C.soft, r: 28 });
      screen(630, 360, 360, 240, () => villa(810, 560, 0.5));
      ctx.fillStyle = C.soft; ctx.fillRect(760, 630, 100, 20); ctx.fillRect(720, 650, 180, 10);
      txt('French television', 810, 710, { size: 34, weight: 700, color: C.ink, align: 'center' });
      txt('2008', 810, 754, { size: 32, weight: 700, color: C.rose, align: 'center' });
    });
    A(pop(t, s('j3', 3.0)), () => { book(1160, 480, 300, 380, '#e9d6ae', null); txt('Villa Jasmin', 1167, 440, { size: 40, weight: 700, family: DISPLAY, color: C.sep, align: 'center' }); txt('Serge Moati', 1167, 500, { size: 32, weight: 600, color: C.sep2, align: 'center' }); txt('2003', 1167, 560, { size: 32, weight: 700, color: C.roseDk, align: 'center' }); trace([[1040, 480], [1000, 480]], 1, C.soft, { w: 5, headSize: 18 }); });
    A(pop(t, s('j4', 0.3)), () => {
      infoCard(1360, 330, 440, 170, 'the son', 'born in Tunis, 1946', C.mem, 1);
      infoCard(1360, 590, 440, 230, 'the father, Serge', 'Jewish socialist journalist, 1903–1957', C.hist, pop(t, s('j4', 2.6)));
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1580, 500); ctx.lineTo(1580, 590); ctx.stroke();
    });
  });
  // j5: on screen: the son's return, the villa at dusk
  A(win(t, s('j5', 0.1), s('j6', 0.4)), () => {
    const SC = { x: 600, y: 290, w: 1160, h: 560 };
    screen(SC.x, SC.y, SC.w, SC.h, () => {
      const g = ctx.createLinearGradient(0, SC.y, 0, SC.y + SC.h); g.addColorStop(0, '#e9b98f'); g.addColorStop(1, '#f2dcb6'); ctx.fillStyle = g; ctx.fillRect(SC.x, SC.y, SC.w, SC.h);
      ctx.fillStyle = '#9fb3b0'; ctx.fillRect(SC.x, SC.y + 400, SC.w, 160);
      // a ship comes in to La Goulette
      const u = eio(seg(t, s('j5', 0.2), e('j5', 0.4)));
      ctx.fillStyle = C.sep2; const bx = SC.x + 1200 - u * 320; ctx.beginPath(); ctx.moveTo(bx - 120, SC.y + 420); ctx.lineTo(bx + 120, SC.y + 420); ctx.lineTo(bx + 90, SC.y + 450); ctx.lineTo(bx - 100, SC.y + 450); ctx.closePath(); ctx.fill(); ctx.fillRect(bx - 50, SC.y + 390, 80, 30);
      villa(SC.x + 400, SC.y + 420, 1.0);
    });
    chip('1976', SC.x + 80, SC.y + 60, { color: C.sep, bg: 'rgba(243,227,190,0.92)', size: 36 });
    chip('a son’s return', MCX, 900, { color: C.rose, size: 36, a: pop(t, s('j5', 1.4)) });
  });
  // j6–j10: three strands
  A(win(t, s('j6', 0.1), s('j11', 0.3)), () => {
    LANES.forEach(([name, col], i) => A(pop(t, i === 0 ? s('j6', 0.2) : i === 1 ? s('j8', 0.2) : s('j10', 2.2)), () => {
      const y = laneY(i);
      ctx.fillStyle = col; ctx.globalAlpha *= 0.14; ctx.fillRect(MX, y - 100, MW, 200); ctx.globalAlpha /= 0.14;
      ctx.fillStyle = col; ctx.fillRect(MX, y - 100, 6, 200);
      wrap(name, MX + 100, y, 176, { size: 32, weight: 800, color: col });
    }));
    const cards = [
      [0, 0, '1940', 'Vichy’s anti-Jewish laws', s('j6', 1.0)],
      [0, 1, 'NOV 1942', 'German troops hold Tunis', s('j6', 4.4)],
      [0, 2, 'USHMM', 'about 5,000 Jewish men in forced labour', s('j7', 0.4)],
      [1, 0, 'NINE MOATI', 'deported to Sachsenhausen', s('j8', 1.6)],
      [1, 1, '“ITALIAN”', 'a German took “Moati” for an Italian name', s('j9', 0.4)],
      [1, 2, 'ESCAPE', 'helped, “apparently”, by a dentist', s('j9', 3.2)],
      [2, 0, '1976', 'a son’s return frames the story', s('j10', 2.4)],
      [2, 1, 'BOCCARA', 'the family renamed', s('j10', 3.6)],
    ];
    for (const [lane, j, head, body, at] of cards) infoCard(LCX(j) - LW / 2, laneY(lane) - 94, LW, 188, head, body, LANES[lane][1], pop(t, at, 0.5), { bodySize: 32 });
    stamp('DATES?', LCX(2), laneY(2), C.mem, pop(t, s('j10', 0.2)), -0.08, 40);
  });
  // j11–j12: its time
  A(win(t, s('j11', 0.1), CH[4].at + 1.0), () => {
    const X = (y) => lerp(620, 1740, (y - 1940) / 70), Yl = 420;
    ctx.fillStyle = C.faint; ctx.fillRect(620, Yl - 3, 1120, 6);
    const ev = [[1946, 'born in Tunis', C.mem, s('j11', 0.2), false], [1957, 'his parents die; he leaves for Paris', C.hist, s('j11', 1.0), true], [2003, 'the novel', C.mem, s('j11', 4.6), false], [2008, 'the film', C.rose, s('j11', 5.4), true]];
    for (const [yr, lab, col, at, up] of ev) A(pop(t, at), () => {
      const x = X(yr); dot(x, Yl, 12, col);
      txt(String(yr), x, Yl + (up ? -46 : 50), { size: 34, weight: 800, color: col, align: 'center' });
      txtFit(lab, x, Yl + (up ? -92 : 96), x < 1000 ? 540 : 360, { size: 32, weight: 600, color: C.ink, align: 'center' });
    });
    A(pop(t, s('j11', 3.0)), () => {
      const u = eio(seg(t, s('j11', 3.2), s('j11', 4.4)));
      A(1 - u, () => txt('Henry', 920, 640, { size: 60, weight: 700, family: DISPLAY, color: C.ink, align: 'center' }));
      A(u, () => txt('Serge', 920, 640, { size: 60, weight: 700, family: DISPLAY, color: C.mem, align: 'center' }));
      txt('his father’s name', 920, 700, { size: 32, weight: 600, color: C.soft, align: 'center' });
    });
    A(pop(t, s('j12', 0.4)), () => {
      txt('born in and near Tunis', 1460, 620, { size: 36, weight: 700, color: C.ink, align: 'center' });
      txt('1944 · 1946', 1460, 676, { size: 32, weight: 700, color: C.rose, align: 'center' });
    });
    stamp('A SON’S STORY', MCX, 860, C.rose, pop(t, s('j12', 3.0)), -0.05, 44);
  });
}

// ---------- 5: two friends' story (The Wedding Song, 2008) ----------
function courtyard(SC, t, { apart = 0, khaled = 0, dim = 0 } = {}) {
  screen(SC.x, SC.y, SC.w, SC.h, () => {
    ctx.fillStyle = '#ead6ac'; ctx.fillRect(SC.x, SC.y, SC.w, SC.h);
    ctx.strokeStyle = C.sep2; ctx.lineWidth = 14;
    for (const cx of [SC.x + 300, SC.x + 860]) { ctx.beginPath(); ctx.moveTo(cx - 200, SC.y + SC.h - 90); ctx.lineTo(cx - 200, SC.y + 220); ctx.arc(cx, SC.y + 220, 200, Math.PI, 0); ctx.lineTo(cx + 200, SC.y + SC.h - 90); ctx.stroke(); }
    tiles(SC.x, SC.y + SC.h - 90, SC.w, 90, '#4f7f86', '#efe2c6');
    const base = SC.y + SC.h - 90;
    figure(SC.x + SC.w / 2 - 60 - apart * 260, base, 1.6, C.sep, { dress: true });
    figure(SC.x + SC.w / 2 + 60 + apart * 260, base, 1.6, C.sep2, { dress: true });
    if (khaled > 0) A(khaled, () => figure(SC.x + SC.w / 2, base, 1.7, '#5a4a3c'));
    if (dim > 0) { ctx.fillStyle = `rgba(40,30,22,${0.45 * dim})`; ctx.fillRect(SC.x, SC.y, SC.w, SC.h); }
  });
}
const TRK = { film: 420, hist: 720 };
function partSong(t) {
  header(t, 3, ['w1', 'w3', 'w6', 'w11']);
  // w1–w2: the makers
  A(win(t, s('w1', 0.1), s('w3', 0.2)), () => {
    txt('Le Chant des mariées', MCX, 400, { size: fit('Le Chant des mariées', 1200, 90, { weight: 700, family: DISPLAY }), weight: 700, family: DISPLAY, align: 'center' });
    txt('in English: The Wedding Song', MCX, 486, { size: 40, weight: 600, family: DISPLAY, color: C.soft, align: 'center' });
    A(pop(t, s('w1', 3.0)), () => { txt('written and directed by', MCX, 590, { size: 32, weight: 600, color: C.rose, align: 'center', spacing: '2px' }); txt('Karin Albou', MCX, 640, { size: 48, weight: 700, family: DISPLAY, align: 'center' }); });
    const ch = ['French-Tunisian', 'Arabic and French', 'December 2008'];
    let x = MCX - 560;
    ch.forEach((c, j) => { const w = chip(c, x, 790, { color: [C.mem, C.ink, C.rose][j], size: 36, align: 'left', a: pop(t, s('w2', 0.2 + j * 1.2)) }); x += w + 30; });
  });
  // w3–w5: on screen
  const SC = { x: 600, y: 290, w: 1160, h: 540 };
  A(win(t, s('w3', 0.1), s('w6', 0.3)), () => {
    const apart = eio(seg(t, s('w4', 1.4), s('w4', 3.4))), kh = pop(t, s('w4', 0.3)), dim = eio(seg(t, s('w5', 0.2), s('w5', 1.4)));
    courtyard(SC, t, { apart, khaled: kh, dim });
    A(span(t, s('w3', 1.0), s('w4', 1.6), 0.5, 0.5), () => {
      chip('Nour', SC.x + SC.w / 2 - 170, SC.y + SC.h + 56, { color: C.mem, size: 34 });
      chip('Myriam', SC.x + SC.w / 2 + 170, SC.y + SC.h + 56, { color: C.mem, size: 34 });
    });
    A(span(t, s('w4', 0.3), s('w5', 0.4), 0.5, 0.5), () => chip('Khaled', SC.x + SC.w / 2, SC.y + SC.h + 56, { color: C.mem, size: 34 }));
    // w5: the war reaches them: orders, leaflets, bombs
    A(pop(t, s('w5', 1.2)), () => {
      let sd = 9; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 14; i++) { const f = (t - s('w5', 1.2)) * 60 + r() * 400, x = SC.x + 80 + r() * (SC.w - 160), y = SC.y + (f % 420); ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(f * 0.02 + i) * 0.5); ctx.fillStyle = 'rgba(246,238,220,0.9)'; ctx.fillRect(-22, -15, 44, 30); ctx.restore(); }
      ['orders', 'leaflets', 'bombs'].forEach((c, j) => chip(c, SC.x + 260 + j * 320, SC.y + SC.h + 56, { color: C.hist, size: 34, a: pop(t, s('w5', 2.0 + j * 0.5)) }));
      A(pop(t, s('w5', 0.4)), () => chip('the front: far away', SC.x + SC.w - 40, SC.y + 52, { color: C.sep, bg: 'rgba(243,227,190,0.92)', size: 32, align: 'right' }));
    });
    chip('Tunis, 1942', SC.x + 40, SC.y + 52, { color: C.sep, bg: 'rgba(243,227,190,0.92)', size: 34, align: 'left', a: pop(t, s('w3', 0.2)) });
  });
  // w6–w10: two lanes, the film above and history below, joined by threads
  A(win(t, s('w6', 0.1), s('w11', 0.3)), () => {
    const SL = [['THE FILM', TRK.film, C.rose, s('w6', 0.2)], ['HISTORY', TRK.hist, C.hist, s('w7', 0.2)]];
    for (const [name, y, col, at] of SL) A(pop(t, at), () => {
      ctx.fillStyle = col; ctx.globalAlpha *= 0.12; ctx.fillRect(MX, y - 120, MW, 240); ctx.globalAlpha /= 0.12;
      ctx.fillStyle = col; ctx.fillRect(MX, y - 120, 6, 240);
      wrap(name, MX + 100, y, 176, { size: 32, weight: 800, color: col });
    });
    // the film's invented people
    const nA = span(t, s('w6', 0.4), s('w7', 0.8), 0.5, 0.6);
    ['Nour', 'Myriam', 'Khaled', 'Raoul'].forEach((n, j) => chip(n, 850 + j * 250, TRK.film + 20, { color: C.rose, size: 38, a: nA * pop(t, s('w6', 0.6 + j * 0.5)) }));
    stamp('INVENTED', 1660, TRK.film - 66, C.rose, nA * pop(t, s('w6', 2.6)), 0.06, 34);
    // history: the two orders, and who records them
    infoCard(LCX(0) - LW / 2, TRK.hist - 100, LW, 200, '6 DEC 1942', 'Jewish workers demanded in Tunis', C.hist, pop(t, s('w7', 0.4)));
    A(pop(t, s('w7', 4.0)), () => {
      card(LCX(1) - LW / 2, TRK.hist - 100, LW, 200, { bg: 'rgba(16,13,22,0.9)', line: C.hist });
      txt('about', LCX(1), TRK.hist - 56, { size: 32, weight: 600, color: C.ink, align: 'center' });
      txt(fmt(4000), LCX(1), TRK.hist + 2, { size: 60, weight: 800, family: DISPLAY, color: C.hist, align: 'center' });
      wrap('sent to forced labour', LCX(1), TRK.hist + 62, 300, { size: 32, weight: 600 });
    });
    infoCard(LCX(2) - LW / 2, TRK.hist - 100, LW, 200, '22 DEC 1942', '20 million francs levied', C.hist, pop(t, s('w8', 0.4)));
    A(span(t, s('w8', 4.4), s('w10', 2.4), 0.5, 0.5), () => chip('US report, June 1943', MX + MW, TRK.hist + 156, { color: C.hist, size: 32, align: 'right' }));
    // w9: the film's scenes, threaded to the orders they draw on
    const fcard = (j, label, at) => infoCard(LCX(j) - LW / 2, TRK.film - 100, LW, 200, 'IN THE FILM', label, C.rose, pop(t, at));
    const thread = (j, at) => { const u = eio(seg(t, at, at + 1.0)); if (u > 0) { ctx.strokeStyle = C.mem; ctx.lineWidth = 4; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(LCX(j), TRK.hist - 100); ctx.lineTo(LCX(j), lerp(TRK.hist - 100, TRK.film + 100, u)); ctx.stroke(); ctx.setLineDash([]); } };
    fcard(2, 'the marriage, to pay the levy', s('w9', 0.4)); thread(2, s('w9', 1.0));
    fcard(0, 'Raoul in forced labour', s('w9', 3.6)); thread(0, s('w9', 4.2));
    // w10: leaflets, and Nazi radio in Arabic
    fcard(1, 'German leaflets', s('w10', 0.4));
    A(pop(t, s('w10', 2.4)), () => chip('Nazi radio in Arabic', LCX(1), TRK.hist + 156, { color: C.hist, size: 32 }));
  });
  // w11–w12: its time
  A(win(t, s('w11', 0.1), CH[5].at + 1.0), () => {
    A(span(t, s('w11', 0.1), s('w12', 0.3), 0.5, 0.5), () => {
      const X0 = 640, X1 = 1720, Y = 440, u = eio(seg(t, s('w11', 0.4), s('w11', 2.4)));
      ctx.fillStyle = C.faint; ctx.fillRect(X0, Y - 3, X1 - X0, 6);
      ctx.fillStyle = C.rose; ctx.fillRect(X0, Y - 5, (X1 - X0) * u, 10);
      dot(X0, Y, 12, C.hist); dot(X1, Y, 12 * pop(t, s('w11', 2.2)), C.rose);
      txt('1942', X0, Y - 50, { size: 34, weight: 800, color: C.hist, align: 'center' }); txt('2008', X1, Y - 50, { size: 34, weight: 800, color: C.rose, align: 'center' });
      A(pop(t, s('w11', 1.6)), () => { txt(String(SONG_GAP), (X0 + X1) / 2 - 10, Y + 66, { size: 56, weight: 800, family: DISPLAY, color: C.rose, align: 'right' }); txt('years later', (X0 + X1) / 2 + 4, Y + 70, { size: 34, weight: 600, color: C.soft }); });
      A(pop(t, s('w11', 3.0)), () => { figure(MCX - 50, 820, 1.5, C.mem, { dress: true, arm: 1 }); figure(MCX + 50, 820, 1.5, C.mem, { dress: true, arm: -1 }); txt('a friendship at the heart of the war', MCX, 880, { size: 36, weight: 600, color: C.ink, align: 'center' }); });
    });
    A(pop(t, s('w12', 0.3)), () => {
      // a cinema in Tunis: the screen and rows of seats
      screen(760, 320, 820, 300, () => { ctx.fillStyle = '#ead6ac'; ctx.fillRect(760, 320, 820, 300); tiles(760, 560, 820, 60, '#4f7f86', '#efe2c6'); figure(1130, 560, 1.0, C.sep, { dress: true }); figure(1210, 560, 1.0, C.sep2, { dress: true }); });
      for (let r = 0; r < 3; r++) for (let j = 0; j < 14; j++) { k.rrect(640 + j * 76 + (r % 2) * 30, 680 + r * 56, 56, 40, 12); ctx.fillStyle = `rgba(236,91,98,${0.35 + r * 0.15})`; ctx.fill(); }
      txt('Tunis, December 2017', MCX, 890, { size: 40, weight: 700, color: C.ink, align: 'center' });
      A(pop(t, s('w12', 3.0)), () => { const w1 = textW(String(SCREENING), { size: 44, weight: 800, family: DISPLAY }); txt(String(SCREENING), MCX - 260, 950, { size: 44, weight: 800, family: DISPLAY, color: C.rose, align: 'left' }); txt('years since 9 December 1942', MCX - 260 + w1 + 14, 952, { size: 32, weight: 600, color: C.soft }); });
    });
  });
}

// ---------- 6: who tells the story? ----------
// Each film's row sits beside its frame on the strip: who tells the story, and where the camera stands.
const WHO = [
  ['the Allied armies', 'British and American voices', 'the front line', 'r2'],
  ['Hollywood', 'one American general', 'a general’s ridge', 'r3'],
  ['a Tunisian director', 'a Jewish family of Tunis', 'a villa', 'r4'],
  ['a French-Tunisian film', 'two girls of Tunis', 'a courtyard', 'r4'],
];
const rowAt = (i) => (i === 3 ? s('r4', 3.2) : s(WHO[i][3], 0.4));
function partWho(t) {
  A(span(t, s('r1', 0.1), s('r6', 0.3), 0.6, 0.5), () => {
    // r1: the four frames, side by side on the strip; arrows from each to its row
    for (let i = 0; i < 4; i++) A(pop(t, s('r1', 0.6 + i * 0.4)), () => {
      const y = frY(i) + FR_H / 2;
      trace([[MX - 50, y], [MX - 6, y]], 1, C.rose, { w: 4, headSize: 14 });
    });
    A(pop(t, s('r1', 0.4)), () => { txt('told by', MX + 4, frY(0) - 8, { size: 32, weight: 700, color: C.soft }); txt('the camera at', 1304, frY(0) - 8, { size: 32, weight: 700, color: C.soft }); });
    WHO.forEach(([w1, w2, place], i) => {
      const y = frY(i), a = pop(t, rowAt(i));
      A(a, () => {
        card(MX, y + 14, 740, FR_H - 28, { bg: 'rgba(16,13,22,0.9)', line: i < 2 ? C.hist : C.rose });
        txtFit(w1, MX + 30, y + 66, 680, { size: 44, weight: 700, family: DISPLAY, color: i < 2 ? C.hist : C.rose });
        txtFit(w2, MX + 30, y + 130, 680, { size: 34, weight: 600, color: C.ink });
      });
      // r5: where the camera stands
      A(pop(t, s('r5', 0.6 + i * 0.9)), () => {
        card(1300, y + 14, 524, FR_H - 28, { bg: 'rgba(16,13,22,0.9)', line: 'rgba(246,238,220,0.35)' });
        txtFit(place, 1340, y + FR_H / 2, 440, { size: 40, weight: 700, color: C.ink });
      });
    });
    // the camera moves down, from the front line to the courtyard
    const u = eio(seg(t, s('r5', 0.6), s('r5', 0.6 + 3 * 0.9)));
    A(pop(t, s('r5', 0.4)), () => {
      ctx.fillStyle = 'rgba(236,91,98,0.35)'; ctx.fillRect(1272, frY(0) + FR_H / 2, 4, frY(3) - frY(0));
      ctx.save(); ctx.translate(1274, lerp(frY(0), frY(3), u) + FR_H / 2 + 10); camera(0, 0, 0.3, C.rose, t * 4); ctx.restore();
    });
  });
  // r6: a source twice over
  A(span(t, s('r6', 0.2), s('r7', 1.2), 0.5, 0.6), () => {
    screen(MCX - 260, 380, 520, 300, () => picto(3, MCX, 540, C.sep, 1.6));
    chip('about the war', MCX - 440, 530, { color: C.hist, size: 40, a: pop(t, s('r6', 1.6)) });
    chip('about its own time', MCX + 470, 530, { color: C.rose, size: 40, a: pop(t, s('r6', 3.0)) });
  });
  // r7: the title again
  A(seg(t, s('r7', 0.8), s('r7', 2.0)), () => {
    const z = fit('THE WAR IN TUNISIA', 1220, 104, { weight: 800, family: DISPLAY, spacing: '4px' });
    txt('THE WAR IN TUNISIA', MCX, 420, { size: z, weight: 800, family: DISPLAY, align: 'center', spacing: '4px' });
    txt('ON SCREEN', MCX, 550, { size: Math.min(z, 104), weight: 800, family: DISPLAY, color: C.rose, align: 'center', spacing: '4px' });
    ctx.fillStyle = C.rose; for (let i = 0; i < 9; i++) { k.rrect(MCX - 196 + i * 44, 634, 20, 13, 3); ctx.fill(); }
    A(pop(t, s('r7', 4.4)), () => txtFit('Who is telling?', MCX, 720, 1200, { size: 48, weight: 600, family: DISPLAY, color: C.soft, align: 'center' }));
  });
}
// ---------- title cards and credits ----------
const CARD_SUB = [null, 'Tunisian Victory · 1944', 'Patton · 1970', 'Villa Jasmin · 2008', 'The Wedding Song · 2008', null];
function titleCards(t) {
  CH.forEach((ch, i) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.92, () => { ctx.fillStyle = 'rgba(10,8,14,0.96)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8)), y = 470 + (1 - p) * 20;
      txt(`PART ${ch.n}`, W / 2, y - 120, { size: 36, weight: 700, color: C.rose, align: 'center', spacing: '6px' });
      const title = ch.title.toUpperCase();
      txt(title, W / 2, y, { size: fit(title, 1500, 120, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
      if (CARD_SUB[i]) txt(CARD_SUB[i], W / 2, y + 110, { size: fit(CARD_SUB[i], 1400, 48), weight: 600, color: C.soft, align: 'center' });
      // the four films as frames on a strip, this one lit
      const y2 = y + 220;
      ctx.fillStyle = 'rgba(236,91,98,0.45)'; for (let j = 0; j < 30; j++) { k.rrect(W / 2 - 330 + j * 22.5, y2 - 62, 10, 7, 2); ctx.fill(); k.rrect(W / 2 - 330 + j * 22.5, y2 + 55, 10, 7, 2); ctx.fill(); }
      for (let j = 0; j < 4; j++) {
        const x = W / 2 - 240 + j * 160, lit = i - 1 === j || i === 5;
        k.rrect(x - 60, y2 - 42, 120, 84, 6); ctx.fillStyle = lit ? C.sc0 : '#17141e'; ctx.fill(); ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.stroke();
        txt(String(YEARS[j]), x, y2 + 2, { size: 32, weight: 800, color: lit ? C.roseDk : C.rose, align: 'center' });
      }
    });
  });
}
const MUSIC = ['“String Impromptu Number 1” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Heavy Heart” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  'US National Archives, The Unwritten Record; AFI Catalog; Imperial War Museums film record;',
  'National WWII Museum; US Holocaust Memorial Museum; Foreign Relations of the United States, 1943;',
  'Wikipedia: Tunisian Victory; Patton (film); Battle of El Guettar; Erwin Rommel; Panzer Greift An;',
  'Villa Jasmin (téléfilm); Férid Boughedir; Serge Moati; Le Chant des mariées; Karin Albou.',
  'Torino Film Festival; Hommes & migrations; The Christian Science Monitor; Kapitalis; The A.V. Club.',
  'No film stills: every picture is drawn. Map outline: Natural Earth (public domain), simplified.',
];
function credits(t) {
  ctx.fillStyle = '#09080d'; ctx.fillRect(0, 0, W, H);
  txt('THE WAR IN TUNISIA ON SCREEN', W / 2, 200, { size: fit('THE WAR IN TUNISIA ON SCREEN', 1600, 84, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
  txt('Tunisia 1943 · original animation', W / 2, 286, { size: 40, weight: 600, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 380, { size: 32, weight: 800, color: C.rose, align: 'center', spacing: '4px' });
  MUSIC.forEach((m, j) => txt(m, W / 2, 430 + j * 44, { size: 32, weight: 500, align: 'center' }));
  txt('SOURCES', W / 2, 570, { size: 32, weight: 800, color: C.rose, align: 'center', spacing: '4px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, 620 + j * 46, 1680, { size: 32, weight: 500, align: 'center', color: j > 4 ? C.soft : C.ink }));
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [DISPLAY, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    drawStrip(t);
    const parts = [partOpen, partWar, partTV, partPatton, partJasmin, partSong, partWho];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    titleCards(t);
    A(seg(t, e('r7', 1.4), e('r7', 2.4)), () => credits(t));
  },
});
