// "The war in Tunisia in words" (« La guerre de Tunisie en mots »): the long film of Tunisia 1943's Literature section,
// 16:9, 1920x1080. Four writers, four places to stand: the series' schematic map of Tunisia on the left shows where each
// writer stood; on the right, each writer's desk and pages, and a timeline with one ink lane per writer, from November
// 1942 to May 1943 and on to the year his book was printed (1943, 1946, 1953).
// Look (the series: Fraunces for titles, Barlow for labels, the title, chapter and credits cards and the map of the
// first film, tun-visit): a deep ink-blue ground with faint ruled lines and a margin line, like a notebook; accent colour
// violet ink (#b9a2ff); motif: four book spines, one per writer, and the four ink lanes. Each writer has a colour:
// Pyle amber, Douglas forget-me-not blue, Ghez rose, Memmi turquoise. Books are drawn as plain volumes, never covers;
// people as plain shapes; no weapons and no casualties are shown.
// The same scene plays the French version: kit.js swaps every whole string for its labels-fr.json entry, so words and
// numbers are drawn as separate strings. Map outline: Natural Earth (public domain), simplified; everything else drawn.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const TAU = Math.PI * 2, RAD = Math.PI / 180;

const C = {
  bg0: '#0a101f', bg1: '#16213b', rule: 'rgba(170,190,255,0.055)', margin: 'rgba(255,130,160,0.09)',
  sea: '#1b3152', sea2: '#23416b', land: '#e4d3ab', neigh: '#4f5a4c',
  ink: '#f3eee2', soft: 'rgba(243,238,226,0.76)', faint: 'rgba(243,238,226,0.22)', dark: '#2a2620', dark2: 'rgba(42,38,32,0.72)',
  vio: '#b9a2ff', vioDk: '#6e55c9', pyle: '#f2c463', doug: '#8dbcff', ghez: '#f19aa6', memmi: '#62d4c6', novel: '#f0a35e',
  card: 'rgba(9,14,28,0.92)', panel: 'rgba(9,14,28,0.8)', paper: '#efe6cf', paper2: '#e0d2b2', pencil: '#5e574c', blueInk: '#34508f',
  axisHatch: 'rgba(120,52,40,0.55)', allied: '#26385f', grey: '#a7a49a',
};
const DISPLAY = 'Fraunces', TEXT = 'Barlow';

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
function txt(str, x, y, { size = 36, weight = 600, family = TEXT, color = C.ink, align = 'left', spacing = '0px', base = 'middle', italic = false } = {}) {
  k.font(weight, size, family);
  if (italic) ctx.font = `italic ${ctx.font}`;
  k.text(str, x, y, { color, align, base, spacing });
}
function textW(str, { size = 36, weight = 600, family = TEXT, spacing = '0px', italic = false } = {}) {
  k.font(weight, size, family); if (italic) ctx.font = `italic ${ctx.font}`;
  ctx.letterSpacing = spacing; const w = ctx.measureText(str).width; ctx.letterSpacing = '0px'; return w;
}
/** The largest size up to `size` at which str fits in maxW (never under 32). */
function fit(str, maxW, size, o = {}) { let z = size; while (z > 32 && textW(str, { ...o, size: z }) > maxW) z -= 2; return z; }
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** A rounded label as wide as its text. */
function chip(str, cx, cy, { color = C.ink, bg = C.card, size = 34, weight = 700, a = 1, align = 'center', line = true, family = TEXT, dash = null, italic = false } = {}) {
  const w = textW(str, { size, weight, family, italic }), pad = size * 0.62, h = size * 1.6;
  const x0 = align === 'left' ? cx : align === 'right' ? cx - w - pad * 2 : cx - w / 2 - pad;
  A(a, () => {
    k.rrect(x0, cy - h / 2, w + pad * 2, h, h / 2); ctx.fillStyle = bg; ctx.fill();
    if (line) { ctx.lineWidth = 3; ctx.strokeStyle = color; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); }
    txt(str, x0 + pad + w / 2, cy + 1, { size, weight, color, align: 'center', family, italic });
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
function trace(pts, u, col, { w = 8, dash = null, head = true, headSize = 22, halo = null } = {}) {
  if (u <= 0) return;
  let tot = 0; const L = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let left = u * tot, tip = pts[0], ang = 0;
  const path = [pts[0]];
  for (let i = 1; i < pts.length && left > 0; i++) {
    const f = Math.min(1, left / L[i - 1]);
    tip = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    path.push(tip); left -= L[i - 1];
  }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [col2, w2] of halo ? [[halo, w + 6], [col, w]] : [[col, w]]) {
    ctx.strokeStyle = col2; ctx.lineWidth = w2; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); path.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.lineCap = 'butt';
  if (head) { if (halo) arrowHead(tip[0] + Math.cos(ang) * 6, tip[1] + Math.sin(ang) * 6, ang, halo, headSize + 5); arrowHead(tip[0] + Math.cos(ang) * 6, tip[1] + Math.sin(ang) * 6, ang, col, headSize); }
}
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
/** A stamp, as on an office paper. */
function stamp(str, x, y, col, a = 1, rot = -0.08, size = 34) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const w = textW(str, { size, weight: 800, spacing: '3px' }) + 36;
    ctx.strokeStyle = col; ctx.lineWidth = 4; k.rrect(-w / 2, -size * 0.85, w, size * 1.7, 6); ctx.stroke();
    txt(str, 0, 2, { size, weight: 800, color: col, align: 'center', spacing: '3px' });
    ctx.restore();
  });
}
/** A label with a thin leader line to a point. */
function callout(str, x, y, px, py, a, { color = C.ink, size = 32, align = 'left', bg = 'rgba(9,14,28,0.86)' } = {}) {
  if (a <= 0) return;
  A(a, () => {
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU); ctx.fill();
    chip(str, x, y, { color, size, align, bg });
  });
}
const rgbOf = (c) => (c[0] === '#' ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.match(/[\d.]+/g).slice(0, 3).map(Number));
const rgba = (c, a) => `rgba(${rgbOf(c).join(',')},${a})`;

// ---------- the four writers ----------
const WR = [
  { name: 'Ernie Pyle', col: C.pyle, book: 'Here Is Your War', printed: 1943, key: 'p1' },
  { name: 'Keith Douglas', col: C.doug, book: 'Alamein to Zem Zem', printed: 1946, key: 'd1' },
  { name: 'Paul Ghez', col: C.ghez, book: 'Six mois sous la botte', printed: 1943, key: 'g1' },
  { name: 'Albert Memmi', col: C.memmi, book: 'La Statue de sel', printed: 1953, key: 'm1' },
];
const SURNAME = ['Pyle', 'Douglas', 'Ghez', 'Memmi'];
const KIND = ['reportage', 'memoir and poems', 'diary', 'novel'];
// Two of the books came out in 1943, one in 1946, one in 1953 (as the narration says).
const YEARS = WR.map((w) => w.printed);
if (YEARS.filter((y) => y === 1943).length !== 2 || !YEARS.includes(1946) || !YEARS.includes(1953)) throw new Error('years');

// ---------- dates and the lanes ----------
const DAY = 86400000, D = (y, m, d) => Date.UTC(y, m - 1, d);
const D0 = D(1942, 11, 1), D1 = D(1943, 6, 1);
const MONTHS = ['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'];
// Each writer's lane: where he was, by date. style: solid (in Tunisia, at it), dash (elsewhere in North Africa), faint
// (away), camp (hatched); fadeA/fadeB: the start or end is not known to the day, so it fades.
const LANES = [
  { segs: [{ a: D(1942, 11, 20), b: D(1943, 2, 1), style: 'dash', label: 'North Africa' }, { a: D(1943, 2, 1), b: D(1943, 5, 13), style: 'solid', label: 'the front' }],
    dots: [D(1943, 2, 16), D(1943, 3, 17), D(1943, 4, 25), D(1943, 5, 7)] },
  { segs: [{ a: D(1942, 11, 1), b: D(1943, 1, 15), style: 'dash', label: 'Egypt, Libya' }, { a: D(1943, 1, 15), b: D(1943, 4, 1), style: 'faint', label: 'hospital' }, { a: D(1943, 3, 22), b: D(1943, 5, 31), style: 'solid', fadeA: true, label: 'Tunisia' }],
    dots: [D(1943, 1, 15)], cross: D(1943, 1, 15) },
  { segs: [{ a: D(1942, 11, 9), b: D(1943, 5, 8), style: 'solid', label: 'Tunis' }],
    dots: [D(1942, 12, 7), D(1942, 12, 14), D(1943, 4, 15), D(1943, 5, 7)] },
  { segs: [{ a: D(1942, 11, 1), b: D(1943, 5, 31), style: 'thin', label: 'Tunis', at: D(1942, 11, 22) }, { a: D(1942, 12, 9), b: D(1943, 5, 10), style: 'camp', fadeA: true, fadeB: true, label: 'camp' }],
    dots: [] },
];
const daysOcc = Math.round((D(1943, 5, 7) - D(1942, 11, 9)) / DAY); // 179 days, 9 Nov to 7 May
if (daysOcc !== 179) throw new Error('days');

/** One writer's lane on an axis from D0 (x0) to D1 (x1) at height y, drawn up to date `upto`. */
function lane(i, x0, x1, y, upto, { a = 1, w = 10, labels = true, labelA = 1 } = {}) {
  if (a <= 0) return;
  const X = (ms) => lerp(x0, x1, (ms - D0) / (D1 - D0)), col = WR[i].col, L = LANES[i];
  A(a, () => {
    for (const sg of L.segs) {
      const b = Math.min(sg.b, upto);
      if (b <= sg.a) continue;
      const xa = X(sg.a), xb = X(b);
      ctx.save();
      if (sg.fadeA || sg.fadeB) {
        const g = ctx.createLinearGradient(X(sg.a), 0, X(sg.b), 0);
        const c0 = rgba(col, sg.fadeA ? 0 : 1), c1 = rgba(col, 1), c2 = rgba(col, sg.fadeB ? 0 : 1);
        g.addColorStop(0, c0); g.addColorStop(0.3, c1); g.addColorStop(0.7, c1); g.addColorStop(1, c2);
        ctx.strokeStyle = g; ctx.fillStyle = g;
      } else { ctx.strokeStyle = col; ctx.fillStyle = col; }
      ctx.lineCap = 'round';
      if (sg.style === 'solid') { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke(); }
      else if (sg.style === 'dash') { ctx.lineWidth = w * 0.6; ctx.setLineDash([w * 0.4, w * 1.4]); ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke(); }
      else if (sg.style === 'faint') { ctx.globalAlpha *= 0.35; ctx.lineWidth = w * 0.4; ctx.setLineDash([2, w]); ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke(); }
      else if (sg.style === 'thin') { ctx.lineWidth = w * 0.4; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke(); }
      else if (sg.style === 'camp') {
        ctx.beginPath(); ctx.rect(xa, y - w * 1.3, xb - xa, w * 2.6); ctx.clip();
        ctx.lineWidth = 3; ctx.lineCap = 'butt';
        for (let x = xa - 30; x < xb + 30; x += 12) { ctx.beginPath(); ctx.moveTo(x, y + w * 1.3); ctx.lineTo(x + w * 2.6, y - w * 1.3); ctx.stroke(); }
      }
      ctx.restore();
      if (labels && sg.label && labelA > 0 && b >= sg.a + (sg.b - sg.a) * 0.4) {
        A(labelA * (sg.style === 'faint' ? 0.7 : 1), () => txt(sg.label, sg.at ? X(sg.at) : (X(sg.a) + X(sg.b)) / 2, y - 34, { size: 32, weight: 600, color: sg.style === 'faint' ? C.soft : col, align: 'center' }));
      }
    }
    for (const d of L.dots) if (d <= upto) {
      const x = X(d);
      if (L.cross === d) { ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 10, y - 10); ctx.lineTo(x + 10, y + 10); ctx.moveTo(x + 10, y - 10); ctx.lineTo(x - 10, y + 10); ctx.stroke(); }
      else { ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(x, y, w * 0.9, 0, TAU); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.stroke(); }
    }
  });
}
/** Month ticks and names along an axis; the years above. */
function monthAxis(x0, x1, y, { a = 1, labelsBelow = true, years = true, ly = 44 } = {}) {
  if (a <= 0) return;
  const X = (ms) => lerp(x0, x1, (ms - D0) / (D1 - D0));
  A(a, () => {
    ctx.fillStyle = C.faint; ctx.fillRect(x0, y - 2, x1 - x0, 4);
    for (let m = 0; m <= 7; m++) { const x = X(D(1942, 11 + m, 1)); ctx.fillStyle = C.soft; ctx.fillRect(x - 1.5, y - 10, 3, 20); }
    MONTHS.forEach((mo, j) => { const x = (X(D(1942, 11 + j, 1)) + X(D(1942, 12 + j, 1))) / 2; txt(mo, x, y + (labelsBelow ? ly : -ly), { size: 32, weight: 700, color: C.soft, align: 'center', spacing: '1px' }); });
    if (years) {
      txt('1942', X(D(1942, 11, 1)), y - 44, { size: 32, weight: 700, color: C.vio });
      txt('1943', X(D(1943, 1, 1)), y - 44, { size: 32, weight: 700, color: C.vio });
    }
  });
}
/** A plain closed book, standing: a spine with a title band, in the writer's colour. */
function spine(x, y, w, h, col, { lit = 1, n = null, a = 1 } = {}) {
  A(a, () => {
    k.rrect(x - w / 2, y - h / 2, w, h, 6);
    ctx.fillStyle = lit > 0.5 ? col : C.bg0; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke();
    ctx.fillStyle = lit > 0.5 ? 'rgba(10,16,31,0.35)' : rgba(col, 0.5);
    ctx.fillRect(x - w / 2 + 5, y - h / 2 + 14, w - 10, 4); ctx.fillRect(x - w / 2 + 5, y + h / 2 - 18, w - 10, 4);
    if (n != null) txt(String(n), x, y + 2, { size: 32, weight: 800, color: lit > 0.5 ? C.bg0 : col, align: 'center' });
  });
}
/** A plain book lying flat, seen from above: just a title band and a year, never a real cover. */
function plainBook(cx, cy, w, h, col, title, year, { a = 1, tilt = -0.04 } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; k.rrect(-w / 2 + 10, -h / 2 + 12, w, h, 10); ctx.fill();
    ctx.fillStyle = C.paper2; k.rrect(-w / 2 + 6, -h / 2 + 4, w, h, 10); ctx.fill();
    ctx.fillStyle = col; k.rrect(-w / 2, -h / 2, w, h, 10); ctx.fill();
    ctx.fillStyle = 'rgba(10,16,31,0.25)'; ctx.fillRect(-w / 2 + 18, -h / 2, 10, h);
    ctx.fillStyle = C.paper; k.rrect(-w / 2 + 46, -h * 0.2, w - 80, h * 0.36, 6); ctx.fill();
    txtFit(title, 12, -h * 0.02, w - 110, { size: 40, weight: 600, family: DISPLAY, color: C.dark, align: 'center', italic: true });
    if (year) txt(String(year), 12, h * 0.32, { size: 32, weight: 700, color: C.bg0, align: 'center' });
    ctx.restore();
  });
}

// ---------- geography (the series' map: Natural Earth, simplified) ----------
const TOWNS = {
  tunis: [36.806, 10.181], bizerte: [37.274, 9.874], sbeitla: [35.23, 9.13], gafsa: [34.42, 8.78], mateur: [37.04, 9.67],
  sousse: [35.825, 10.636], aouina: [36.85, 10.23],
};
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
  // faint ruled lines and a margin line, like a notebook page
  g.fillStyle = C.rule; for (let y = 54; y < H; y += 46) g.fillRect(0, y, W, 2);
  g.fillStyle = C.margin; g.fillRect(762, 0, 3, H);
  // the map panel: sea, neighbours, Tunisia
  g.save();
  g.beginPath(); g.roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 22); g.clip();
  const sg = g.createLinearGradient(0, MAP.y, 0, MAP.y + MAP.h); sg.addColorStop(0, C.sea2); sg.addColorStop(1, C.sea);
  g.fillStyle = sg; g.fillRect(MAP.x, MAP.y, MAP.w, MAP.h);
  g.fillStyle = C.neigh; g.strokeStyle = C.neigh; g.lineWidth = 8; g.lineJoin = 'round';
  for (const r of MAPDATA.NEIGH) { g.beginPath(); r.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p)))); g.closePath(); g.fill(); g.stroke(); }
  const lg = g.createLinearGradient(0, MAP.y, 0, MAP.y + MAP.h); lg.addColorStop(0, '#e9dbb6'); lg.addColorStop(1, '#e2c894');
  g.fillStyle = lg;
  for (const r of MAPDATA.TUN) { g.beginPath(); r.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p)))); g.closePath(); g.fill(); }
  g.strokeStyle = 'rgba(42,38,32,0.45)'; g.lineWidth = 2;
  for (const r of MAPDATA.TUN) { g.beginPath(); r.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p)))); g.closePath(); g.stroke(); }
  g.restore();
  g.strokeStyle = 'rgba(185,162,255,0.5)'; g.lineWidth = 3; g.beginPath(); g.roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 22); g.stroke();
}

// ---------- the map's moving parts ----------
// The Axis-held north-east (schematic): Tunis, Bizerte and the east coast, as in late 1942 to spring 1943.
const AXIS_ZONE = [[37.35, 9.55], [36.75, 9.35], [36.2, 9.6], [35.4, 9.9], [34.5, 10.0], [33.9, 9.85], [33.3, 10.2], [33.1, 11.1], [33.9, 11.2], [34.9, 11.3], [35.9, 10.9], [36.9, 11.2], [37.35, 10.4]];
function mapLabel(str, ll, a, { size = 32, color = C.soft, spacing = '4px', weight = 600, align = 'center', rot = 0 } = {}) {
  if (a <= 0) return;
  const [x, y] = P(ll);
  A(a, () => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); txt(str, 0, 0, { size, weight, color, align, spacing }); ctx.restore(); });
}
function townDot(ll, name, a, { dx = 14, dy = 0, align = 'left', color = C.dark, size = 32 } = {}) {
  if (a <= 0) return;
  const [x, y] = P(ll);
  A(a, () => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
    if (name) {
      k.font(600, size, TEXT); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(233,219,182,0.88)'; ctx.lineJoin = 'round';
      ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.strokeText(name, x + dx, y + dy);
      txt(name, x + dx, y + dy, { size, weight: 600, color, align });
    }
  });
}
/** A writer's pin: a numbered disc in his colour, lit while he is the subject. */
function pin(x, y, i, { a = 1, on = 0, t = 0 } = {}) {
  const col = WR[i].col;
  A(a, () => {
    if (on > 0) A(on, () => {
      const p = (t * 0.8) % 1;
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.globalAlpha *= 1 - p;
      ctx.beginPath(); ctx.arc(x, y, 24 + p * 26, 0, TAU); ctx.stroke();
    });
    ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(x, y, 24, 0, TAU); ctx.fill();
    ctx.fillStyle = on > 0.5 ? col : C.bg0; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
    txt(String(i + 1), x, y + 2, { size: 32, weight: 800, color: on > 0.5 ? C.bg0 : col, align: 'center' });
  });
}
const TUNIS_XY = P(TOWNS.tunis);
// Where each writer's pin stands: Pyle on the central front (Sbeitla), Douglas where the Eighth Army came in from Libya,
// Ghez and Memmi in Tunis (side by side, with leader lines to the city).
const PIN_XY = [P(TOWNS.sbeitla), P([33.05, 11.05]), [TUNIS_XY[0] - 40, TUNIS_XY[1] + 70], [TUNIS_XY[0] + 40, TUNIS_XY[1] + 70]];
const PIN_KEY = ['a7', 'a8', 'a9', 'a10'];
/** The current writer chapter's index (0–3), or -1. */
const writerAt = (t) => { for (let i = 3; i >= 0; i--) if (t >= CH[i + 1].at) return t < CH[i + 2].at ? i : -1; return -1; };
function drawMap(t) {
  ctx.save(); k.rrect(MAP.x, MAP.y, MAP.w, MAP.h, 22); ctx.clip();
  mapLabel('ALGERIA', [35.4, 7.93], 1, { color: 'rgba(243,238,226,0.6)', size: 32, rot: -Math.PI / 2 });
  mapLabel('LIBYA', [32.72, 11.86], 1, { color: 'rgba(243,238,226,0.6)', size: 32, rot: -Math.PI / 2 });
  mapLabel('TUNISIA', [34.75, 9.05], span(t, s('o1', 0.4), s('a7', 0.4), 0.6, 0.8), { color: 'rgba(42,38,32,0.55)', size: 40, spacing: '8px', weight: 700 });

  // ---- chapter 1 (and the cold open): the Axis-held north-east, the Allied approach
  const zoneA = span(t, s('a3', 0.2), s('a6', 0.6), 0.6, 0.8);
  if (zoneA > 0) A(zoneA, () => {
    ctx.save(); ctx.beginPath(); AXIS_ZONE.forEach((p, i) => (i ? ctx.lineTo(...P(p)) : ctx.moveTo(...P(p)))); ctx.closePath();
    ctx.fillStyle = 'rgba(150,70,55,0.12)'; ctx.fill(); ctx.clip();
    ctx.strokeStyle = C.axisHatch; ctx.lineWidth = 3;
    for (let x = MAP.x - 900; x < MAP.x + MAP.w; x += 22) { ctx.beginPath(); ctx.moveTo(x, MAP.y + MAP.h); ctx.lineTo(x + 900, MAP.y); ctx.stroke(); }
    ctx.restore();
    A(seg(t, s('a3', 0.8), s('a3', 1.4)), () => chip('Axis-held', ...P([34.3, 10.55]), { color: '#8a3a2c', bg: 'rgba(239,230,207,0.92)', size: 32 }));
  });
  const c1 = span(t, s('a2'), s('a6', 0.6), 0.5, 0.8);
  if (c1 > 0) A(c1, () => {
    // a2: the landings far to the west, then aircraft into Tunis from Sicily
    A(seg(t, s('a2', 0.3), s('a2', 0.9)), () => trace([P([36.62, 7.6]), P([36.66, 8.25])], eout(seg(t, s('a2', 0.3), s('a2', 1.8))), C.allied, { w: 9, halo: 'rgba(239,230,207,0.8)' }));
    const air = eout(seg(t, e('a2', -2.6), e('a2', -0.6)));
    A(seg(t, e('a2', -2.6), e('a2', -2.0)), () => trace([P([37.75, 10.55]), P([37.2, 10.35]), P([36.88, 10.22])], air, '#8a3a2c', { w: 7, dash: [3, 12], headSize: 18 }));
    // a3: Allied armies from Algeria and from Libya
    A(seg(t, s('a3', 1.6), s('a3', 2.2)), () => {
      trace(smooth([P([36.5, 7.6]), P([36.58, 8.5]), P([36.66, 9.2])]), eout(seg(t, s('a3', 1.8), s('a3', 3.6))), C.allied, { w: 9, halo: 'rgba(239,230,207,0.8)' });
      trace(smooth([P([32.4, 12.2]), P([32.85, 11.6]), P([33.2, 11.0])]), eout(seg(t, s('a3', 2.6), s('a3', 4.4))), C.allied, { w: 9, halo: 'rgba(239,230,207,0.8)' });
      chip('Allies', ...P([35.95, 8.45]), { color: C.allied, bg: 'rgba(239,230,207,0.92)', size: 32, a: seg(t, s('a3', 2.4), s('a3', 3.0)) });
    });
    townDot(TOWNS.tunis, 'Tunis', seg(t, s('a2', 1.6), s('a2', 2.2)) * (1 - seg(t, s('a6', 0), s('a6', 0.6))), { dx: 16, dy: -4 });
    townDot(TOWNS.bizerte, 'Bizerte', seg(t, s('a3', 0.6), s('a3', 1.2)) * (1 - seg(t, s('a6', 0), s('a6', 0.6))), { dx: 16, dy: -6 });
  });

  // ---- chapter 2: Pyle's places
  const c2 = span(t, s('p1'), CH[2].at + 0.6, 0.5, 0.6);
  if (c2 > 0) A(c2, () => {
    const route = [P(TOWNS.sbeitla), P(TOWNS.gafsa), P([35.6, 8.75]), P(TOWNS.mateur), P(TOWNS.bizerte)];
    const u1 = eio(seg(t, s('p2', 3.4), s('p2', 5.4))), u2 = eio(seg(t, s('p3', 0.4), s('p3', 3.0))), u3 = eio(seg(t, s('p3', 4.0), s('p3', 5.4)));
    trace(route.slice(0, 2), u1, C.pyle, { w: 7, dash: [2, 12], head: false, halo: 'rgba(42,38,32,0.5)' });
    if (u1 >= 1) trace(smooth(route.slice(1, 4)), u2, C.pyle, { w: 7, dash: [2, 12], head: false, halo: 'rgba(42,38,32,0.5)' });
    if (u2 >= 1) trace(route.slice(3), u3, C.pyle, { w: 7, dash: [2, 12], head: false, halo: 'rgba(42,38,32,0.5)' });
    // the retreat from Sbeitla, westwards
    A(span(t, s('p2', 0.6), s('p3', 0.2), 0.5, 0.6), () => trace([P([35.22, 9.32]), P([35.18, 8.65])], eout(seg(t, s('p2', 0.8), s('p2', 2.6))), C.pyle, { w: 8, headSize: 18, halo: 'rgba(42,38,32,0.55)' }));
    townDot(TOWNS.sbeitla, 'Sbeitla', seg(t, s('p2', 0.4), s('p2', 1.0)), { dx: 36, dy: -26 });
    townDot(TOWNS.gafsa, 'Gafsa', seg(t, s('p2', 3.6), s('p2', 4.2)), { dx: 16 });
    townDot(TOWNS.mateur, 'Mateur', seg(t, s('p3', 2.4), s('p3', 3.0)), { dx: -14, dy: 8, align: 'right' });
    townDot(TOWNS.bizerte, 'Bizerte', seg(t, s('p3', 4.6), s('p3', 5.2)), { dx: 14, dy: -16 });
  });
  // ---- chapter 3: Douglas came in from Libya
  const c3 = span(t, s('d1'), CH[3].at + 0.6, 0.5, 0.6);
  if (c3 > 0) A(c3, () => {
    A(seg(t, s('d4', 1.0), s('d4', 1.6)), () => trace(smooth([P([32.3, 12.4]), P([32.75, 11.7]), P([33.0, 11.25])]), eout(seg(t, s('d4', 1.2), s('d4', 3.2))), C.doug, { w: 8, headSize: 18, halo: 'rgba(42,38,32,0.5)' }));
  });
  // ---- chapters 4 and 5: Tunis
  const c45 = Math.max(span(t, s('g1'), CH[4].at + 0.6, 0.5, 0.6), span(t, s('m1'), CH[5].at + 0.6, 0.5, 0.6));
  if (c45 > 0) A(c45, () => townDot(TOWNS.tunis, 'Tunis', 1, { dx: -14, dy: -14, align: 'right' }));
  const c4 = span(t, s('g7'), s('g9', 0.4), 0.5, 0.6);
  if (c4 > 0) A(c4, () => {
    townDot(TOWNS.aouina, null, 1);
    townDot(TOWNS.bizerte, 'Bizerte', 1, { dx: 16, dy: -6 });
  });

  // ---- the writers' pins
  const cur = writerAt(t);
  const all = Math.max(span(t, s('r1', 0.2), DURATION + 1, 0.6, 0.1), 0);
  PIN_XY.forEach(([x, y], i) => {
    const seen = Math.max(seg(t, s(PIN_KEY[i], 0.2), s(PIN_KEY[i], 0.8)), t > s(PIN_KEY[i]) ? 1 : 0);
    const inOpen = span(t, s('o4', -1), CH[0].at + 0.5, 0.6, 0.6) * 0;
    const lit = cur === i ? span(t, s(WR[i].key, 0.2), CH[i + 2].at + 0.5, 0.5, 0.5)
      : (i === hiR(t) ? 1 : 0);
    if (i >= 2) A(Math.max(seen, all), () => { ctx.strokeStyle = 'rgba(42,38,32,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.lineTo(TUNIS_XY[0] + (i === 2 ? -4 : 4), TUNIS_XY[1] + 4); ctx.stroke(); });
    pin(x, y, i, { a: Math.max(seen, all, inOpen), on: lit, t });
    // a name beside the pin while it is introduced or lit
    const nameA = Math.max(span(t, s(PIN_KEY[i], 0.3), s(PIN_KEY[i]) + 6.5 + (i === 3 ? 4 : 0), 0.5, 0.6) * (1 - seg(t, s('a11', -0.4), s('a11', 0.2))), 0);
    if (nameA > 0) A(nameA, () => {
      const right = i === 0 || i === 3, nx = x + (right ? 34 : -34), ny = y + (i >= 2 ? 44 : 0);
      k.font(700, 32, TEXT); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(10,16,31,0.88)'; ctx.lineJoin = 'round';
      ctx.textAlign = right ? 'left' : 'right'; ctx.textBaseline = 'middle'; ctx.strokeText(SURNAME[i], nx, ny);
      txt(SURNAME[i], nx, ny, { size: 32, weight: 700, color: WR[i].col, align: right ? 'left' : 'right' });
    });
  });
  ctx.restore();
  txt('schematic map', MAP.x + 20, MAP.y + 32, { size: 32, weight: 500, color: 'rgba(243,238,226,0.6)' });
}
/** In the last chapter, the writer whose line is being spoken (r2: Pyle then Douglas, r3: Ghez, r4: Memmi). */
function hiR(t) {
  if (t < s('r2') || t > e('r4', 0.3)) return -1;
  if (t < s('r3')) return t < (s('r2') + e('r2')) / 2 ? 0 : 1;
  return t < s('r4') ? 2 : 3;
}

// ---------- the right-hand panel ----------
const RX = 800, RW = 1000, RCX = RX + RW / 2; // x 800–1800
const WIN = { x: 800, y: 240, w: 1000, h: 590 };
/** Draw fn in a window's own coordinates (0..1000 × 0..590), clipped, with a frame. */
function windowFrame(fn, { x = WIN.x, y = WIN.y, w = WIN.w, h = WIN.h, line = 'rgba(185,162,255,0.5)', sc = w / WIN.w } = {}) {
  ctx.save(); k.rrect(x, y, w, h, 22); ctx.clip(); ctx.translate(x, y); ctx.scale(sc, sc); fn(); ctx.restore();
  ctx.strokeStyle = line; ctx.lineWidth = 3; k.rrect(x, y, w, h, 22); ctx.stroke();
}
const TABS = ['WHO', 'WHAT KIND', 'FACT OR FICTION'];
// For each writer chapter, the line where each tab lights.
const TAB_AT = [['p1', 'p4', 'p8'], ['d1', 'd5', 'd7'], ['g1', 'g4', 'g11'], ['m1', 'm5', 'm10']];
/** A writer chapter's header: his number and name, the book's title, and three tabs, the current one lit. */
function header(t, i) {
  const w = WR[i], tabs = TAB_AT[i];
  const lit = tabs.map((from, j) => seg(t, s(from, -0.1), s(from, 0.4)) * (1 - (tabs[j + 1] ? seg(t, s(tabs[j + 1], -0.1), s(tabs[j + 1], 0.4)) : 0)));
  let x = RX + RW;
  for (let j = TABS.length - 1; j >= 0; j--) {
    const str = TABS[j], tw = textW(str, { size: 32, weight: 700 }) + 40;
    x -= tw;
    const l = lit[j];
    k.rrect(x, 86, tw, 52, 26);
    ctx.fillStyle = l > 0 ? `rgba(185,162,255,${0.15 + 0.85 * l})` : 'rgba(9,14,28,0.8)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = C.vio; ctx.stroke();
    txt(str, x + tw / 2, 113, { size: 32, weight: 700, color: l > 0.5 ? C.bg0 : C.vio, align: 'center' });
    x -= 14;
  }
  spine(RX + 18, 112, 34, 64, w.col, { lit: 1, n: i + 1 });
  txtFit(w.name.toUpperCase(), RX + 52, 113, x - RX - 70, { size: 34, weight: 800, color: w.col, spacing: '3px' });
  txtFit(w.book, RX, 192, RW, { size: 60, weight: 600, family: DISPLAY, italic: true });
}
/** The writer's own lane, small, along the bottom: November 1942 to May 1943, then the year his book was printed. */
const SX0 = 830, SX1 = 1560, SY = 904;
function strip(t, i, upto, a = 1) {
  if (a <= 0) return;
  A(a, () => {
    monthAxis(SX0, SX1, SY, { ly: 46, years: false });
    lane(i, SX0, SX1, SY, upto, { w: 10, labelA: 1 });
    // the print column, after a break
    ctx.fillStyle = C.soft; for (let j = 0; j < 4; j++) ctx.fillRect(1590 + j * 14, SY - 2, 6, 4);
    const pr = seg(t, s(PRINT_AT[i], 0.2), s(PRINT_AT[i], 1.0));
    A(pr, () => {
      spine(1690, SY - 6, 30, 56, WR[i].col, { lit: 1 });
      txt(String(WR[i].printed), 1740, SY - 6, { size: 34, weight: 800, color: WR[i].col });
      txt('in print', 1690, SY + 46, { size: 32, weight: 600, color: C.soft, align: 'center' });
    });
  });
}
const PRINT_AT = ['p4', 'd6', 'g5', 'm4'];

// ---------- drawings: Pyle ----------
/** A tent by lamplight: a crate for a desk, a portable typewriter, a typed sheet. Returns the sheet's text origin. */
function drawTent(t, { lamp = 1 } = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, 590); g.addColorStop(0, '#2b2a2a'); g.addColorStop(1, '#4a3f30');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 590);
  // the tent's canvas: two slopes and the pole
  ctx.fillStyle = '#5b5240'; ctx.beginPath(); ctx.moveTo(0, 360); ctx.lineTo(500, 30); ctx.lineTo(1000, 360); ctx.lineTo(1000, 0); ctx.lineTo(0, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(500, 30); ctx.lineTo(i * 200 - 100, 360); ctx.stroke(); }
  ctx.fillStyle = '#3a3226'; ctx.fillRect(492, 30, 16, 560);
  // lamplight
  const f = 0.9 + 0.1 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
  const lg = ctx.createRadialGradient(250, 250, 10, 250, 250, 520 * f);
  lg.addColorStop(0, `rgba(255,214,140,${0.45 * lamp})`); lg.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, 1000, 590);
  // the lantern
  ctx.fillStyle = '#2b2620'; ctx.fillRect(232, 180, 36, 10); ctx.fillRect(236, 250, 28, 8);
  ctx.fillStyle = `rgba(255,220,150,${0.9 * lamp})`; k.rrect(238, 190, 24, 60, 8); ctx.fill();
  // the crate
  ctx.fillStyle = '#8a6a42'; ctx.fillRect(560, 420, 380, 170); ctx.strokeStyle = '#5e4628'; ctx.lineWidth = 4;
  for (let y = 420; y < 590; y += 42) { ctx.beginPath(); ctx.moveTo(560, y); ctx.lineTo(940, y); ctx.stroke(); }
  // the typewriter
  ctx.fillStyle = '#26282c'; k.rrect(600, 340, 300, 90, 14); ctx.fill();
  ctx.fillStyle = '#3a3d43'; k.rrect(616, 300, 268, 52, 10); ctx.fill();
  ctx.fillStyle = '#c9c2b2'; for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) { ctx.beginPath(); ctx.arc(632 + c * 26 + r * 8, 372 + r * 18, 7, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#1b1c1f'; k.rrect(590, 292, 320, 20, 8); ctx.fill();
  // the sheet in the roller
  ctx.fillStyle = C.paper; ctx.beginPath(); ctx.moveTo(640, 296); ctx.lineTo(860, 296); ctx.lineTo(850, 40); ctx.lineTo(650, 40); ctx.closePath(); ctx.fill();
  return { x: 662, y: 70 };
}
const DATELINES = [['SBEITLA', 'FEBRUARY 1943', 'p2', 0.4], ['GAFSA', 'MARCH 1943', 'p2', 3.6], ['MATEUR', 'APRIL 1943', 'p3', 1.0], ['BIZERTE', 'MAY 1943', 'p3', 4.4]];
function partPyle(t) {
  header(t, 0);
  const upto = lerp(D(1942, 11, 20), D(1943, 1, 31), seg(t, s('p1', 0.6), e('p1')))
    + (D(1943, 3, 31) - D(1943, 1, 31)) * seg(t, s('p2', 0.4), e('p2', -0.4))
    + (D(1943, 5, 31) - D(1943, 3, 31)) * seg(t, s('p3', 0.4), e('p3', -0.4));
  strip(t, 0, upto);
  // p1–p3: the tent, the typed datelines
  const v1 = span(t, s('p1', -0.4), s('p4', 0.4), 0.5, 0.6);
  if (v1 > 0) A(v1, () => windowFrame(() => {
    const sh = drawTent(t);
    DATELINES.forEach(([place, when, key, d], j) => {
      const a = seg(t, s(key, d), s(key, d + 0.6));
      if (a <= 0) return;
      A(a, () => {
        const y = sh.y + 18 + j * 56;
        txtFit(place, sh.x + 4, y, 170, { size: 32, weight: 800, color: C.dark });
        // the rest of the line as typed strokes
        ctx.fillStyle = 'rgba(42,38,32,0.35)'; ctx.fillRect(sh.x + 4, y + 20, 160 * eout(seg(t, s(key, d), s(key, d + 1.4))), 4);
      });
    });
    A(seg(t, s('p1', 1.0), s('p1', 1.8)), () => chip('Scripps-Howard', 60, 70, { color: C.pyle, size: 32, align: 'left' }));
    DATELINES.forEach(([, when, key, d], j) => A(span(t, s(key, d), (DATELINES[j + 1] ? s(DATELINES[j + 1][2], DATELINES[j + 1][3]) : s('p4', 0.2)), 0.4, 0.4), () => chip(when, 60, 520, { color: C.pyle, size: 34, align: 'left' })));
  }));
  // p4: columns within days, then a book
  const v2 = span(t, s('p4', 0.2), s('p5', 0.4), 0.5, 0.5);
  if (v2 > 0) A(v2, () => windowFrame(() => {
    ctx.fillStyle = '#1c2740'; ctx.fillRect(0, 0, 1000, 590);
    const n = 6, gather = eio(seg(t, s('p4', 3.2), s('p4', 5.0)));
    for (let j = 0; j < n; j++) {
      const x0 = 70 + j * 78, y0 = 80 + (j % 2) * 30, x = lerp(x0, 560, gather), y = lerp(y0, 300, gather);
      A(seg(t, s('p4', 0.4 + j * 0.25), s('p4', 0.8 + j * 0.25)) * (1 - gather * 0.9), () => {
        ctx.fillStyle = C.paper; ctx.save(); ctx.translate(x, y); ctx.rotate((j - 2.5) * 0.03); ctx.fillRect(0, 0, 66, 200);
        ctx.fillStyle = 'rgba(42,38,32,0.4)'; for (let r = 0; r < 12; r++) ctx.fillRect(8, 14 + r * 15, 50 - (r % 3) * 8, 4); ctx.restore();
      });
    }
    A(seg(t, s('p4', 1.2), s('p4', 1.8)) * (1 - gather), () => chip('within days', 160, 380, { color: C.pyle, size: 34 }));
    plainBook(640, 320, 440, 300, C.pyle, 'Here Is Your War', 1943, { a: eout(seg(t, s('p4', 4.4), s('p4', 5.4))) });
  }));
  // p5: 42 newspapers, then 122
  const v3 = span(t, s('p5', 0.0), s('p6', 0.4), 0.5, 0.5);
  if (v3 > 0) A(v3, () => windowFrame(() => {
    ctx.fillStyle = '#1c2740'; ctx.fillRect(0, 0, 1000, 590);
    const n1 = 42, n2 = 122, grow = eio(seg(t, s('p5', 3.0), s('p5', 5.0)));
    const shown = Math.round(lerp(n1, n2, grow)) * Math.min(1, seg(t, s('p5', 0.2), s('p5', 1.6)) * 1.0001);
    const cols = 16;
    for (let j = 0; j < Math.floor(shown); j++) {
      const x = 330 + (j % cols) * 40, y = 70 + Math.floor(j / cols) * 56;
      ctx.fillStyle = j < n1 ? C.paper : C.pyle; ctx.fillRect(x, y, 30, 42);
      ctx.fillStyle = 'rgba(42,38,32,0.5)'; ctx.fillRect(x + 4, y + 5, 22, 5); ctx.fillRect(x + 4, y + 14, 22, 2); ctx.fillRect(x + 4, y + 20, 16, 2);
    }
    txt(fmt(grow < 0.5 ? n1 : n2), 160, 230, { size: 120, weight: 800, family: DISPLAY, color: C.pyle, align: 'center' });
    txt('newspapers', 160, 330, { size: 34, weight: 600, color: C.ink, align: 'center' });
    txt(grow < 0.5 ? 'NOV 1942' : 'APR 1943', 160, 400, { size: 34, weight: 800, color: C.soft, align: 'center', spacing: '2px' });
  }));
  // p6: the worm's-eye view
  const v4 = span(t, s('p6', 0.2), s('p7', 0.4), 0.5, 0.5);
  if (v4 > 0) A(v4, () => {
    windowFrame(() => {
      const g = ctx.createLinearGradient(0, 0, 0, 590); g.addColorStop(0, '#26355a'); g.addColorStop(1, '#4b5e88'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 590);
      // the view from the ground: grass blades, big against the sky
      ctx.fillStyle = '#3d4a2b';
      for (let j = 0; j < 60; j++) { const x = j * 17 + (j % 3) * 4, h = 60 + ((j * 37) % 70); ctx.beginPath(); ctx.moveTo(x, 590); ctx.quadraticCurveTo(x + 6, 590 - h * 0.6, x + 10 + (j % 2 ? 8 : -6), 590 - h); ctx.lineTo(x + 12, 590); ctx.fill(); }
      ctx.fillStyle = '#2f3a22'; ctx.fillRect(0, 560, 1000, 30);
    });
    A(seg(t, s('p6', 2.4), s('p6', 3.2)), () => {
      card(840, 270, 920, 230, { bg: 'rgba(9,14,28,0.95)', line: rgba(C.pyle, 0.7) });
      k.font(500, 44, DISPLAY);
      txtFit('“I only know what we see', 880, 340, 840, { size: 46, weight: 500, family: DISPLAY, italic: true });
      txtFit('from our worm’s-eye view.”', 880, 400, 840, { size: 46, weight: 500, family: DISPLAY, italic: true });
      txt('Ernie Pyle, Here Is Your War (1943)', 880, 462, { size: 32, weight: 600, color: C.pyle });
    });
    chip('the generals’ view', RX + 30, 300, { color: C.soft, size: 32, align: 'left', a: span(t, s('p6', 0.3), s('p6', 2.4), 0.4, 0.4), dash: [6, 8] });
  });
  // p7: names, home towns, streets
  const v5 = span(t, s('p7', 0.0), s('p8', 0.4), 0.5, 0.5);
  if (v5 > 0) A(v5, () => windowFrame(() => {
    ctx.fillStyle = '#1c2740'; ctx.fillRect(0, 0, 1000, 590);
    ctx.fillStyle = C.paper; ctx.fillRect(330, 30, 420, 540);
    ctx.fillStyle = 'rgba(42,38,32,0.38)';
    const rows = [[0, 330], [1, 300], [2, 360], [3, 250], [4, 340], [5, 320], [6, 280], [7, 350], [8, 300], [9, 330], [10, 220], [11, 340], [12, 310]];
    for (const [r, w] of rows) ctx.fillRect(370, 70 + r * 36, w, 8);
    const marks = [[3, 370, 120, 'name', 'p7', 3.2], [3, 500, 110, 'home town', 'p7', 3.8], [3, 620, 100, 'street', 'p7', 4.4], [8, 370, 150, 'name', 'p7', 3.2], [8, 540, 130, 'home town', 'p7', 3.8]];
    marks.forEach(([r, x, w, , key, d]) => { const u = eout(seg(t, s(key, d), s(key, d + 0.5))); ctx.fillStyle = '#c0392b'; ctx.fillRect(x, 70 + r * 36 + 14, w * u, 4); });
    A(seg(t, s('p7', 3.2), s('p7', 3.8)), () => callout('name', 120, 120, 380, 192, 1, { color: C.pyle, align: 'left' }));
    A(seg(t, s('p7', 3.8), s('p7', 4.4)), () => callout('home town', 800, 110, 560, 192, 1, { color: C.pyle, align: 'left' }));
    A(seg(t, s('p7', 4.4), s('p7', 5.0)), () => callout('street', 800, 250, 680, 192, 1, { color: C.pyle, align: 'left' }));
    ['tired men', 'mud', 'fear', 'graves'].forEach((w, j) => chip(w, 160, 330 + j * 62, { color: C.soft, size: 32, a: seg(t, s('p7', 0.6 + j * 0.45), s('p7', 1.0 + j * 0.45)) }));
  }));
  // p8–p9: fact or fiction, the censor, the edges
  const v6 = span(t, s('p8', 0.0), s('p10', 0.3), 0.5, 0.5);
  if (v6 > 0) A(v6, () => windowFrame(() => {
    ctx.fillStyle = '#1c2740'; ctx.fillRect(0, 0, 1000, 590);
    scale(t, 0.04, 'p8', { x: 90, y: 70, w: 820, col: C.pyle });
    // the page: the main text in the middle, the margins
    const edges = seg(t, s('p9', 0.2), s('p9', 1.0));
    ctx.fillStyle = C.paper; ctx.fillRect(300, 150, 400, 420);
    ctx.fillStyle = 'rgba(42,38,32,0.38)'; for (let r = 0; r < 10; r++) ctx.fillRect(380, 180 + r * 38, 240 - (r % 3) * 30, 8);
    // a cut by the censor
    A(seg(t, s('p8', 3.4), s('p8', 4.0)), () => { ctx.fillStyle = '#16181c'; ctx.fillRect(374, 290, 252, 26); ctx.fillRect(374, 328, 180, 26); });
    stamp('CENSOR', 600, 500, '#a8442f', seg(t, s('p8', 3.8), s('p8', 4.4)), -0.12, 32);
    A(edges, () => {
      ctx.strokeStyle = C.pyle; ctx.lineWidth = 4; ctx.setLineDash([8, 8]);
      ctx.strokeRect(306, 156, 64, 408); ctx.strokeRect(630, 156, 64, 408); ctx.setLineDash([]);
      chip('Tunisians', 160, 260, { color: C.pyle, size: 34 });
      chip('at the edges', 160, 330, { color: C.pyle, size: 32, bg: 'rgba(9,14,28,0.9)' });
    });
  }));
  // p10: the prize; the Pacific
  const v7 = span(t, s('p10', 0.0), CH[2].at + 1.0, 0.5, 0.6);
  if (v7 > 0) A(v7, () => windowFrame(() => {
    ctx.fillStyle = '#1c2740'; ctx.fillRect(0, 0, 1000, 590);
    A(seg(t, s('p10', 0.3), s('p10', 1.0)), () => {
      ctx.fillStyle = C.pyle; ctx.beginPath(); ctx.arc(300, 260, 120, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(42,38,32,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(300, 260, 100, 0, TAU); ctx.stroke();
      txt('1944', 300, 266, { size: 56, weight: 800, family: DISPLAY, color: C.dark, align: 'center' });
      txt('Pulitzer Prize', 300, 450, { size: 40, weight: 700, color: C.ink, align: 'center' });
    });
    A(seg(t, s('p10', 3.0), s('p10', 3.8)), () => {
      txt('April 1945', 700, 240, { size: 44, weight: 700, family: DISPLAY, color: C.ink, align: 'center' });
      txt('killed in the Pacific', 700, 310, { size: 34, weight: 600, color: C.soft, align: 'center' });
    });
  }));
}
/** A scale from FACT to FICTION, with this book's marker. */
function scale(t, pos, key, { x, y, w, col, d = 0.6 }) {
  const a = seg(t, s(key, d - 0.4), s(key, d + 0.2));
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = C.faint; ctx.fillRect(x, y - 3, w, 6);
    txt('FACT', x, y - 36, { size: 32, weight: 800, color: C.ink, spacing: '2px' });
    txt('FICTION', x + w, y - 36, { size: 32, weight: 800, color: C.ink, align: 'right', spacing: '2px' });
    const u = eout(seg(t, s(key, d), s(key, d + 1.2)));
    const mx = x + w * lerp(0.5, pos, u);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(mx, y, 16, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.bg0; ctx.lineWidth = 4; ctx.stroke();
  });
}

// ---------- drawings: Douglas ----------
const NA = (lon, lat) => [60 + (lon - 8.4) * 39, 120 + (37.6 - lat) * 52];
const COAST = [[9.0, 37.2], [9.87, 37.27], [10.3, 36.9], [11.05, 37.05], [10.6, 36.4], [10.64, 35.83], [11.1, 35.2], [10.76, 34.74], [10.1, 33.88], [10.9, 33.8], [11.6, 33.15], [13.18, 32.89], [15.1, 32.4], [15.4, 31.6], [16.6, 31.2], [18.5, 30.4], [19.2, 30.3], [20.07, 32.12], [21.7, 32.9], [22.6, 32.76], [23.96, 32.08], [25.15, 31.57], [27.24, 31.35], [28.95, 30.83], [29.92, 31.2], [31.0, 31.5]];
const NPL = { alamein: [28.95, 30.83], zemzem: [15.35, 31.25], tripoli: [13.18, 32.89], tunisia: [10.2, 34.6] };
const NROUTE = [NPL.alamein, [27.24, 31.1], [25.0, 31.4], [23.9, 31.9], [21.5, 32.5], [20.0, 31.8], [19.0, 30.5], [16.6, 31.0], NPL.zemzem];
const NROUTE2 = [NPL.zemzem, [14.2, 32.5], NPL.tripoli, [11.6, 33.0], [10.4, 33.9], NPL.tunisia];
function notebook() {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, 1000, 590);
  ctx.fillStyle = 'rgba(52,80,143,0.16)'; for (let y = 60; y < 590; y += 40) ctx.fillRect(0, y, 1000, 2);
  ctx.fillStyle = 'rgba(168,68,47,0.25)'; ctx.fillRect(70, 0, 3, 590);
}
function pencilPath(pts, u, { col = C.pencil, w = 3, dash = null } = {}) { trace(pts.map((p) => NA(...p)), u, col, { w, dash, head: false }); }
/** A forget-me-not: five round blue petals and a yellow eye. */
function flower(x, y, r, a = 1) {
  A(a, () => {
    ctx.fillStyle = '#5b8fe0';
    for (let i = 0; i < 5; i++) { const ang = -Math.PI / 2 + i * TAU / 5; ctx.beginPath(); ctx.arc(x + Math.cos(ang) * r * 0.62, y + Math.sin(ang) * r * 0.62, r * 0.48, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#f1d36b'; ctx.beginPath(); ctx.arc(x, y, r * 0.26, 0, TAU); ctx.fill();
  });
}
function partDouglas(t) {
  header(t, 1);
  const upto = lerp(D(1942, 11, 1), D(1942, 12, 31), seg(t, s('d2', 0.4), e('d2')))
    + (D(1943, 1, 15) - D(1942, 12, 31)) * seg(t, s('d3', 0.4), e('d3', -1.0))
    + (D(1943, 5, 31) - D(1943, 1, 15)) * seg(t, s('d4', 0.4), e('d4', -0.6));
  strip(t, 1, upto);
  // d1: a notebook page with a pencil sketch of the desert
  const v1 = span(t, s('d1', -0.4), s('d2', 0.5), 0.5, 0.6);
  if (v1 > 0) A(v1, () => windowFrame(() => {
    notebook();
    const u = eio(seg(t, s('d1', 0.4), s('d1', 3.0)));
    trace([[120, 420], [300, 400], [480, 430], [700, 395], [900, 420]], u, C.pencil, { w: 3, head: false });
    trace([[160, 470], [420, 455], [640, 480], [900, 462]], u, C.pencil, { w: 2, head: false });
    // a palm, sketched
    A(seg(t, s('d1', 1.6), s('d1', 2.4)), () => { ctx.strokeStyle = C.pencil; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(760, 410); ctx.quadraticCurveTo(770, 330, 755, 260); ctx.stroke(); for (let j = 0; j < 6; j++) { const ang = Math.PI + j * 0.55 - 0.3; ctx.beginPath(); ctx.moveTo(755, 260); ctx.quadraticCurveTo(755 + Math.cos(ang) * 50, 250 + Math.sin(ang) * 40 - 20, 755 + Math.cos(ang) * 90, 262 + Math.sin(ang) * 50 + 24); ctx.stroke(); } });
    chip('poet', 140, 140, { color: C.doug, size: 34, a: seg(t, s('d1', 0.8), s('d1', 1.4)), bg: 'rgba(9,14,28,0.9)' });
    chip('tank officer', 380, 140, { color: C.doug, size: 34, a: seg(t, s('d1', 2.4), s('d1', 3.0)), bg: 'rgba(9,14,28,0.9)' });
    flower(880, 120, 26, seg(t, s('d1', 3.0), s('d1', 3.6)));
  }));
  // d2–d4: the route along the coast of North Africa, in pencil
  const v2 = span(t, s('d2', 0.3), s('d5', 0.5), 0.5, 0.6);
  if (v2 > 0) A(v2, () => windowFrame(() => {
    notebook();
    ctx.strokeStyle = 'rgba(52,80,143,0.3)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < COAST.length - 1; i++) { const [x1, y1] = NA(...COAST[i]), [x2, y2] = NA(...COAST[i + 1]); for (let j = 0; j < 4; j++) { const f = j / 4, x = lerp(x1, x2, f), y = lerp(y1, y2, f); ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + 8, y - 22); ctx.stroke(); } }
    pencilPath(COAST, 1, { col: C.dark, w: 3 });
    for (const [name, lon, lat] of [['TUNISIA', 9.6, 33.2], ['LIBYA', 19.0, 29.0], ['EGYPT', 28.6, 29.0]]) txt(name, ...NA(lon, lat), { size: 32, weight: 600, color: 'rgba(42,38,32,0.7)', align: 'center', spacing: '3px' });
    const dot = (p, name, a, { dx = 0, dy = -34, align = 'center', col = C.dark } = {}) => A(a, () => {
      const [x, y] = NA(...p); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
      chip(name, x + dx, y + dy, { color: col === C.dark ? C.ink : col, size: 32, align, bg: 'rgba(9,14,28,0.88)' });
    });
    dot(NPL.alamein, 'El Alamein', seg(t, s('d2', 0.4), s('d2', 1.0)), { dx: 10, dy: -50, align: 'right' });
    const u = eio(seg(t, s('d3', 0.6), s('d3', 4.6)));
    pencilPath(NROUTE, u, { col: '#2f5fb0', w: 5 });
    A(seg(t, s('d3', 4.4), s('d3', 5.0)), () => {
      const [x, y] = NA(...NPL.zemzem); ctx.strokeStyle = '#a8442f'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 14, y - 14); ctx.lineTo(x + 14, y + 14); ctx.moveTo(x + 14, y - 14); ctx.lineTo(x - 14, y + 14); ctx.stroke();
      chip('Wadi Zem Zem', x, y + 48, { color: C.ink, size: 32, bg: 'rgba(9,14,28,0.88)' });
    });
    const u2 = eio(seg(t, e('d4', -2.0), e('d4', 0.2)));
    pencilPath(NROUTE2, u2, { col: '#2f5fb0', w: 5, dash: [3, 12] });
    A(seg(t, s('d4', 0.3), s('d4', 0.9)) * (1 - seg(t, e('d4', -1.6), e('d4', -1.0))), () => chip('in hospital: the first war poems', 560, 130, { color: C.doug, size: 32 }));
    A(seg(t, e('d4', -1.2), e('d4', -0.6)), () => chip('spring 1943', 330, 230, { color: C.doug, size: 34 }));
    txt('schematic map', 960, 40, { size: 32, weight: 500, color: 'rgba(42,38,32,0.55)', align: 'right' });
  }));
  // d5–d6: the memoir, with his drawings
  const v3 = span(t, s('d5', 0.2), s('d7', 0.4), 0.5, 0.5);
  if (v3 > 0) A(v3, () => windowFrame(() => {
    ctx.fillStyle = '#1c2740'; ctx.fillRect(0, 0, 1000, 590);
    plainBook(300, 300, 400, 290, C.doug, 'Alamein to Zem Zem', null, { a: eout(seg(t, s('d5', 0.4), s('d5', 1.4))) });
    A(seg(t, s('d5', 2.0), s('d5', 2.8)), () => { chip('OCT 1942 – JAN 1943', 300, 510, { color: C.doug, size: 32 }); });
    // his drawings: loose sheets with pencil sketches
    const dr = eout(seg(t, s('d6', 0.2), s('d6', 1.4)));
    for (let j = 0; j < 3; j++) A(seg(t, s('d6', 0.2 + j * 0.4), s('d6', 0.8 + j * 0.4)), () => {
      ctx.save(); ctx.translate(640 + j * 110, 150 + j * 90); ctx.rotate(-0.08 + j * 0.07);
      ctx.fillStyle = C.paper; ctx.fillRect(-90, -70, 180, 140);
      ctx.strokeStyle = C.pencil; ctx.lineWidth = 2.5; ctx.beginPath();
      if (j === 0) { ctx.moveTo(-70, 30); ctx.lineTo(-20, 10); ctx.lineTo(30, 28); ctx.lineTo(70, 15); ctx.moveTo(-40, 30); ctx.quadraticCurveTo(-36, -20, -44, -40); }
      if (j === 1) { ctx.arc(0, -10, 26, 0, TAU); ctx.moveTo(-40, 50); ctx.quadraticCurveTo(0, 20, 40, 50); }
      if (j === 2) { ctx.moveTo(-70, 40); ctx.lineTo(70, 40); ctx.moveTo(-50, 40); ctx.lineTo(-30, -10); ctx.lineTo(20, -10); ctx.lineTo(40, 40); }
      ctx.stroke(); ctx.restore();
    });
    A(dr, () => chip('his own drawings', 750, 520, { color: C.doug, size: 32 }));
  }));
  // d7: fact or fiction; a nickname
  const v4 = span(t, s('d7', 0.0), s('d8', 0.4), 0.5, 0.5);
  if (v4 > 0) A(v4, () => windowFrame(() => {
    ctx.fillStyle = '#1c2740'; ctx.fillRect(0, 0, 1000, 590);
    scale(t, 0.22, 'd7', { x: 90, y: 90, w: 820, col: C.doug });
    A(seg(t, s('d7', 1.8), s('d7', 2.6)), () => { chip('real events', 250, 220, { color: C.ink, size: 34 }); chip('remembered, chosen', 680, 220, { color: C.doug, size: 34 }); });
    A(seg(t, s('d7', 4.4), s('d7', 5.2)), () => {
      chip('Edward Kellett', 260, 420, { color: C.ink, size: 38 });
      trace([[430, 420], [560, 420]], eout(seg(t, s('d7', 5.0), s('d7', 6.0))), C.doug, { w: 5, headSize: 16 });
      chip('“Piccadilly Jim”', 760, 420, { color: C.doug, size: 38, italic: true, family: DISPLAY, weight: 600 });
      txt('his colonel', 260, 492, { size: 32, weight: 500, color: C.soft, align: 'center' });
      txt('in the memoir', 760, 492, { size: 32, weight: 500, color: C.soft, align: 'center' });
    });
  }));
  // d8–d10: the poem: sand, a photograph, forget-me-nots; the line
  const v5 = span(t, s('d8', 0.2), s('d11', 0.3), 0.5, 0.6);
  if (v5 > 0) A(v5, () => windowFrame(() => {
    const g = ctx.createLinearGradient(0, 0, 0, 590); g.addColorStop(0, '#c9b285'); g.addColorStop(1, '#e3cf9f'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 590);
    ctx.strokeStyle = 'rgba(120,95,55,0.35)'; ctx.lineWidth = 2; for (let j = 0; j < 9; j++) { ctx.beginPath(); ctx.moveTo(0, 80 + j * 60); ctx.bezierCurveTo(300, 60 + j * 60, 600, 110 + j * 60, 1000, 80 + j * 60); ctx.stroke(); }
    chip('three weeks later', 270, 380, { color: C.dark, bg: 'rgba(239,230,207,0.92)', size: 32, a: seg(t, s('d8', 4.8), s('d8', 5.6)) * (1 - seg(t, s('d10'), s('d10', 0.5))) });
    // the photograph, half in the sand
    A(seg(t, s('d9', 2.4), s('d9', 3.2)), () => {
      ctx.save(); ctx.translate(690, 340); ctx.rotate(-0.12);
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-122, -150, 260, 320);
      ctx.fillStyle = '#f6f0e2'; ctx.fillRect(-130, -160, 260, 320);
      const pg = ctx.createLinearGradient(0, -130, 0, 90); pg.addColorStop(0, '#b8ad98'); pg.addColorStop(1, '#8f8571'); ctx.fillStyle = pg; ctx.fillRect(-110, -140, 220, 220);
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(0, -30, 70, 90, 0, 0, TAU); ctx.fill();
      txt('Steffi', 0, 124, { size: 40, weight: 500, family: DISPLAY, italic: true, color: C.blueInk, align: 'center' });
      ctx.restore();
    });
    flower(470, 470, 30, seg(t, s('d8', 1.0), s('d8', 1.6))); flower(530, 525, 24, seg(t, s('d8', 1.3), s('d8', 1.9))); flower(880, 500, 28, seg(t, s('d8', 1.6), s('d8', 2.2))); flower(920, 430, 22, seg(t, s('d8', 1.9), s('d8', 2.5)));
    A(seg(t, s('d8', 0.6), s('d8', 1.4)), () => { chip('Vergissmeinnicht', 270, 200, { color: C.doug, size: 40, family: DISPLAY, italic: true, weight: 600, bg: 'rgba(9,14,28,0.9)' }); });
    A(seg(t, s('d8', 2.0), s('d8', 2.8)), () => chip('forget me not', 270, 280, { color: C.dark, bg: 'rgba(239,230,207,0.92)', size: 32 }));
  }));
  A(span(t, s('d10', 0.0), s('d11', 0.3), 0.5, 0.5), () => {
    card(840, 330, 920, 260, { bg: 'rgba(9,14,28,0.97)', line: rgba(C.doug, 0.7) });
    txtFit('“For here the lover and killer', 880, 410, 840, { size: 48, weight: 500, family: DISPLAY, italic: true });
    txtFit('are mingled”', 880, 472, 840, { size: 48, weight: 500, family: DISPLAY, italic: true });
    txt('Keith Douglas, Vergissmeinnicht (1943)', 880, 540, { size: 32, weight: 600, color: C.doug });
  });
  // d11: England, then Normandy
  const v6 = span(t, s('d11', 0.0), CH[3].at + 1.0, 0.5, 0.6);
  if (v6 > 0) A(v6, () => windowFrame(() => {
    ctx.fillStyle = '#1c2740'; ctx.fillRect(0, 0, 1000, 590);
    A(seg(t, s('d11', 0.3), s('d11', 1.0)), () => { txt('England', 280, 220, { size: 48, weight: 600, family: DISPLAY, align: 'center' }); txt('DEC 1943', 280, 290, { size: 34, weight: 800, color: C.soft, align: 'center', spacing: '2px' }); });
    A(seg(t, s('d11', 2.6), s('d11', 3.4)), () => { txt('Normandy', 720, 220, { size: 48, weight: 600, family: DISPLAY, align: 'center' }); txt('9 JUNE 1944', 720, 290, { size: 34, weight: 800, color: C.soft, align: 'center', spacing: '2px' }); });
    trace([[420, 250], [560, 250]], eout(seg(t, s('d11', 2.2), s('d11', 3.0))), C.doug, { w: 5, headSize: 16 });
    A(seg(t, s('d11', 4.2), s('d11', 5.0)), () => { txt('aged 24', 720, 360, { size: 36, weight: 600, color: C.doug, align: 'center' }); });
    for (let j = 0; j < 5; j++) flower(380 + j * 60, 470 + (j % 2) * 26, 20, seg(t, s('d11', 4.6 + j * 0.2), s('d11', 5.2 + j * 0.2)));
  }));
}

// ---------- drawings: Ghez ----------
/** An office in Tunis: a window on the roofs, a desk, a ledger, a lamp. */
function drawOffice(t) {
  ctx.fillStyle = '#2a2f3d'; ctx.fillRect(0, 0, 1000, 590);
  // the window: white roofs, a dome, a minaret
  ctx.fillStyle = '#7fa4c8'; ctx.fillRect(560, 50, 360, 260);
  ctx.fillStyle = '#eee6d6';
  [[560, 220, 90, 90], [640, 200, 80, 110], [720, 235, 110, 75], [830, 210, 90, 100]].forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
  ctx.beginPath(); ctx.arc(690, 200, 34, Math.PI, 0); ctx.fill();
  ctx.fillRect(860, 120, 26, 100); ctx.fillRect(854, 112, 38, 12);
  ctx.strokeStyle = '#2a2f3d'; ctx.lineWidth = 12; ctx.strokeRect(560, 50, 360, 260); ctx.beginPath(); ctx.moveTo(740, 50); ctx.lineTo(740, 310); ctx.stroke();
  // the desk
  ctx.fillStyle = '#6b4a2f'; ctx.fillRect(0, 400, 1000, 190); ctx.fillStyle = '#563a24'; ctx.fillRect(0, 400, 1000, 14);
  // the ledger and papers
  ctx.fillStyle = C.paper; ctx.save(); ctx.translate(330, 470); ctx.rotate(-0.05); ctx.fillRect(-170, -50, 340, 110); ctx.fillStyle = 'rgba(42,38,32,0.35)'; for (let r = 0; r < 4; r++) ctx.fillRect(-150, -32 + r * 24, 300 - (r % 2) * 60, 5); ctx.restore();
  ctx.fillStyle = '#7a2c2c'; ctx.fillRect(620, 440, 240, 70);
  // the lamp
  ctx.fillStyle = '#2b2620'; ctx.fillRect(150, 300, 10, 100); ctx.beginPath(); ctx.moveTo(110, 300); ctx.lineTo(200, 300); ctx.lineTo(176, 250); ctx.lineTo(134, 250); ctx.closePath(); ctx.fillStyle = '#3f6b4f'; ctx.fill();
  const lg = ctx.createRadialGradient(155, 330, 10, 155, 360, 300); lg.addColorStop(0, 'rgba(255,224,160,0.35)'); lg.addColorStop(1, 'rgba(255,224,160,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 200, 600, 390);
}
/** A plain figure: a round head and a rounded body, in one flat colour. */
function figure(x, y, sc, col) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - 52 * sc, 13 * sc, 0, TAU); ctx.fill();
  k.rrect(x - 15 * sc, y - 36 * sc, 30 * sc, 36 * sc, 10 * sc); ctx.fill();
}
const ENTRIES = [['7 DEC 1942', 'the order, the lists', 'g4', 1.4], ['14 DEC', '3,585 men', 'g4', 1.9], ['15 APR 1943', 'workers moved back', 'g4', 2.4], ['7 MAY', 'the workers come home', 'g4', 2.9], ['8 MAY', 'the flat emptied', 'g4', 3.4]];
function partGhez(t) {
  header(t, 2);
  const upto = lerp(D(1942, 11, 9), D(1942, 12, 7), seg(t, s('g2', 0.4), e('g3')))
    + (D(1942, 12, 15) - D(1942, 12, 7)) * seg(t, s('g6', 0.4), e('g6', -0.4))
    + (D(1943, 4, 16) - D(1942, 12, 15)) * seg(t, s('g8', 0.0), e('g9'))
    + (D(1943, 5, 9) - D(1943, 4, 16)) * seg(t, s('g10', 0.2), s('g10', 3.0));
  strip(t, 2, upto);
  // g1: the office
  const v1 = span(t, s('g1', -0.4), s('g2', 0.4), 0.5, 0.6);
  if (v1 > 0) A(v1, () => windowFrame(() => {
    drawOffice(t);
    const sw = chip('Sousse', 60, 80, { color: C.soft, size: 32, align: 'left', a: seg(t, s('g1', 1.2), s('g1', 1.8)) });
    chip('1898', 74 + sw, 80, { color: C.soft, size: 32, align: 'left', a: seg(t, s('g1', 1.8), s('g1', 2.4)) });
    chip('lawyer', 60, 150, { color: C.ghez, size: 34, align: 'left', a: seg(t, s('g1', 2.6), s('g1', 3.2)) });
    chip('Jewish community council', 60, 220, { color: C.ghez, size: 32, align: 'left', a: seg(t, s('g1', 4.0), s('g1', 4.6)) });
  }));
  // g2–g3: the notices; the committee
  const v2 = span(t, s('g2', 0.2), s('g4', 0.4), 0.5, 0.5);
  if (v2 > 0) A(v2, () => windowFrame(() => {
    ctx.fillStyle = '#2a2f3d'; ctx.fillRect(0, 0, 1000, 590);
    A(1 - seg(t, s('g3', 2.4), s('g3', 3.0)), () => {
      chip('SS · Walter Rauff', 500, 70, { color: C.ink, size: 34, a: seg(t, s('g2', 0.8), s('g2', 1.4)) });
      ['fines', 'confiscations', 'hostage-taking', 'forced labour'].forEach((w, j) => {
        const a = eout(seg(t, s('g2', 4.0 + j * 0.6), s('g2', 4.6 + j * 0.6)));
        A(a, () => {
          const x = 130 + (j % 2) * 430, y = 170 + Math.floor(j / 2) * 190 + (1 - a) * 20;
          ctx.save(); ctx.translate(x + 170, y + 70); ctx.rotate((j % 2 ? 0.02 : -0.025));
          ctx.fillStyle = C.paper; ctx.fillRect(-170, -70, 340, 150);
          ctx.fillStyle = 'rgba(42,38,32,0.3)'; for (let r = 0; r < 3; r++) ctx.fillRect(-140, 10 + r * 18, 280 - r * 50, 5);
          txtFit(w, 0, -26, 300, { size: 36, weight: 800, color: C.dark, align: 'center' });
          ctx.restore();
        });
      });
    });
    // the committee: a table, seats, Ghez at its head
    const cm = seg(t, s('g3', 2.6), s('g3', 3.4));
    A(cm, () => {
      ctx.fillStyle = '#6b4a2f'; k.rrect(220, 270, 560, 120, 16); ctx.fill();
      for (let j = 0; j < 4; j++) { figure(290 + j * 140, 260, 1.1, 'rgba(243,238,226,0.55)'); figure(290 + j * 140, 470, 1.1, 'rgba(243,238,226,0.55)'); }
      figure(170, 370, 1.25, C.ghez);
      callout('Paul Ghez', 120, 140, 170, 300, seg(t, e('g3', -1.4), e('g3', -0.8)), { color: C.ghez, size: 32 });
      chip('recruitment committee', 500, 540, { color: C.ink, size: 34 });
      chip('the SS demand workers', 500, 70, { color: C.ink, size: 32, a: seg(t, s('g3', 0.4), s('g3', 1.0)) });
    });
    A(seg(t, s('g3', 0.4), s('g3', 1.0)) * (1 - cm), () => chip('the SS demand workers', 500, 70, { color: C.ink, size: 32 }));
  }));
  // g4–g6: the diary, its title, the count
  const v3 = span(t, s('g4', 0.2), s('g7', 0.4), 0.5, 0.5);
  if (v3 > 0) A(v3, () => windowFrame(() => {
    ctx.fillStyle = '#2a2f3d'; ctx.fillRect(0, 0, 1000, 590);
    // an open notebook
    ctx.fillStyle = C.paper; ctx.fillRect(40, 40, 450, 510); ctx.fillStyle = C.paper2; ctx.fillRect(490, 40, 6, 510);
    ctx.fillStyle = 'rgba(52,80,143,0.16)'; for (let y = 100; y < 540; y += 40) ctx.fillRect(40, y, 450, 2);
    ENTRIES.forEach(([d, what, key, dd], j) => A(seg(t, s(key, dd), s(key, dd + 0.5)), () => {
      const y = 100 + j * 92;
      txt(d, 70, y, { size: 32, weight: 800, color: '#7a2c2c' });
      txtFit(what, 70, y + 40, 400, { size: 32, weight: 500, color: C.dark });
    }));
    // the title on a plain label, and the place and year
    const ti = seg(t, s('g5', 0.3), s('g5', 1.0));
    A(ti * (1 - seg(t, s('g6', 0.2), s('g6', 0.8))), () => {
      plainBook(750, 230, 400, 280, C.ghez, 'Six mois sous la botte', 1943);
      txt('six months under the boot', 750, 430, { size: 32, weight: 600, color: C.soft, align: 'center' });
      txt('Tunis', 750, 490, { size: 36, weight: 700, color: C.ghez, align: 'center' });
    });
    // g6: the count by 14 December
    const ct = seg(t, s('g6', 0.4), s('g6', 1.0));
    A(ct, () => {
      const n = Math.round(3585 * eio(seg(t, s('g6', 0.8), s('g6', 2.0))));
      txt(fmt(n), 750, 250, { size: 120, weight: 800, family: DISPLAY, color: C.ghez, align: 'center' });
      txt('men recruited', 750, 350, { size: 36, weight: 600, align: 'center' });
      txt('by 14 December 1942', 750, 410, { size: 32, weight: 500, color: C.soft, align: 'center' });
    });
  }));
  // g7–g8: the march to Cheylus, airfields, the front; families at the office
  const v4 = span(t, s('g7', 0.0), s('g9', 0.4), 0.5, 0.5);
  if (v4 > 0) A(v4, () => windowFrame(() => {
    ctx.fillStyle = '#2a2f3d'; ctx.fillRect(0, 0, 1000, 590);
    const fam = seg(t, s('g8', 0.0), s('g8', 0.6));
    A(1 - fam, () => {
      ctx.fillStyle = '#4a4f5c'; ctx.fillRect(0, 330, 1000, 40);
      const walk = seg(t, s('g7', 0.2), e('g8', 0));
      for (let j = 0; j < 9; j++) { const x = 80 + j * 52 + walk * 320; figure(x, 350 + Math.sin(t * 4 + j) * 2, 0.9, '#9a978f'); }
      // the camp: low tents
      ctx.fillStyle = '#c9c2b2'; for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(800 + j * 60, 350); ctx.lineTo(830 + j * 60, 300); ctx.lineTo(860 + j * 60, 350); ctx.fill(); }
      chip('Cheylus', 860, 250, { color: C.ghez, size: 34, a: seg(t, s('g7', 1.4), s('g7', 2.0)) });
      chip('airfields', 300, 480, { color: C.soft, size: 32, a: seg(t, s('g7', 3.0), s('g7', 3.6)) });
      chip('near the front', 640, 480, { color: C.soft, size: 32, a: seg(t, s('g7', 3.6), s('g7', 4.2)) });
    });
    A(fam, () => {
      // his door, families waiting
      ctx.fillStyle = '#6b4a2f'; ctx.fillRect(700, 120, 170, 300); ctx.fillStyle = '#e6c27a'; ctx.beginPath(); ctx.arc(845, 280, 8, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4a4f5c'; ctx.fillRect(0, 420, 1000, 20);
      for (let j = 0; j < 7; j++) figure(120 + j * 78, 420, j % 3 === 1 ? 0.75 : 1.05, ['#c8b8d8', '#b7c9b0', '#d8c3a8'][j % 3]);
      chip('families at his office', 360, 120, { color: C.ghez, size: 34 });
      A(seg(t, s('g8', 3.2), s('g8', 3.8)), () => { chip('the numbers', 360, 220, { color: C.ink, size: 32 }); trace([[540, 200], [540, 270]], eout(seg(t, s('g8', 3.4), s('g8', 4.2))), C.ghez, { w: 6, headSize: 18 }); });
    });
  }));
  // g9: about 5,000 men, some forty camps (USHMM)
  const v5 = span(t, s('g9', 0.0), s('g10', 0.4), 0.5, 0.5);
  if (v5 > 0) A(v5, () => windowFrame(() => {
    ctx.fillStyle = '#2a2f3d'; ctx.fillRect(0, 0, 1000, 590);
    txt('about', 260, 150, { size: 36, weight: 600, color: C.soft, align: 'center' });
    txt(fmt(5000), 260, 250, { size: 120, weight: 800, family: DISPLAY, color: C.ghez, align: 'center' });
    txt('men at forced labour', 260, 350, { size: 34, weight: 600, align: 'center' });
    const nc = 40;
    for (let j = 0; j < nc; j++) A(seg(t, s('g9', 2.4 + j * 0.05), s('g9', 2.7 + j * 0.05)), () => {
      const x = 560 + (j % 8) * 50, y = 120 + Math.floor(j / 8) * 56;
      ctx.fillStyle = '#c9c2b2'; ctx.beginPath(); ctx.moveTo(x, y + 30); ctx.lineTo(x + 18, y); ctx.lineTo(x + 36, y + 30); ctx.fill();
    });
    A(seg(t, s('g9', 4.0), s('g9', 4.6)), () => txt('some forty camps', 740, 430, { size: 34, weight: 600, align: 'center' }));
    A(seg(t, s('g9', 5.4), s('g9', 6.0)), () => txt('estimate: US Holocaust Memorial Museum', 500, 530, { size: 32, weight: 500, color: C.soft, align: 'center' }));
  }));
  // g10: 7 May, home; 8 May, an empty room
  const v6 = span(t, s('g10', 0.0), s('g11', 0.4), 0.5, 0.5);
  if (v6 > 0) A(v6, () => windowFrame(() => {
    ctx.fillStyle = '#2a2f3d'; ctx.fillRect(0, 0, 1000, 590);
    const page = (x, d1, d2, sub, a) => A(a, () => {
      ctx.fillStyle = C.paper; ctx.fillRect(x - 160, 90, 320, 300); ctx.fillStyle = '#7a2c2c'; ctx.fillRect(x - 160, 90, 320, 60);
      txt(d2, x, 120, { size: 32, weight: 800, color: C.paper, align: 'center', spacing: '2px' });
      txt(d1, x, 250, { size: 110, weight: 800, family: DISPLAY, color: C.dark, align: 'center' });
      txtFit(sub, x, 470, 400, { size: 34, weight: 600, color: C.ink, align: 'center' });
    });
    page(270, '7', 'MAY 1943', 'the workers come home', seg(t, s('g10', 0.3), s('g10', 1.0)));
    page(730, '8', 'MAY 1943', 'his flat emptied', seg(t, s('g10', 5.2), s('g10', 5.9)));
  }));
  // g11–g12: one man's view; other accounts
  const v7 = span(t, s('g11', 0.0), CH[4].at + 1.0, 0.5, 0.6);
  if (v7 > 0) A(v7, () => windowFrame(() => {
    ctx.fillStyle = '#2a2f3d'; ctx.fillRect(0, 0, 1000, 590);
    A(1 - seg(t, s('g12', 0.0), s('g12', 0.6)), () => {
      scale(t, 0.04, 'g11', { x: 90, y: 90, w: 820, col: C.ghez });
      A(seg(t, s('g11', 2.6), s('g11', 3.4)), () => {
        ctx.fillStyle = '#6b4a2f'; ctx.fillRect(400, 330, 200, 90); figure(500, 330, 1.2, C.ghez);
        chip('German orders', 190, 300, { color: C.ink, size: 32 }); chip('the families', 810, 300, { color: C.ink, size: 32 });
        trace([[300, 340], [390, 360]], 1, C.soft, { w: 4, headSize: 14 }); trace([[700, 340], [610, 360]], 1, C.soft, { w: 4, headSize: 14 });
        chip('one man’s view', 500, 500, { color: C.ghez, size: 34 });
      });
    });
    A(seg(t, s('g12', 0.2), s('g12', 0.9)), () => {
      plainBook(250, 240, 260, 190, C.ghez, 'Ghez', 1943, { tilt: -0.06 });
      plainBook(560, 250, 260, 190, C.paper2, '?', null, { tilt: 0.04, a: seg(t, s('g12', 0.6), s('g12', 1.2)) });
      plainBook(830, 240, 200, 190, C.paper2, '?', null, { tilt: -0.02, a: seg(t, s('g12', 1.0), s('g12', 1.6)) });
      chip('other accounts', 700, 400, { color: C.ink, size: 32, a: seg(t, s('g12', 1.0), s('g12', 1.6)) });
      chip('do not always agree', 500, 500, { color: C.ghez, size: 34, a: seg(t, s('g12', 4.2), s('g12', 4.8)) });
    });
  }));
}

// ---------- drawings: Memmi ----------
/** An alley by the Hara: whitewashed walls, an arch, a blue door. */
function drawAlley(t) {
  const g = ctx.createLinearGradient(0, 0, 0, 590); g.addColorStop(0, '#8fb6d6'); g.addColorStop(1, '#cfe0ec'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 590);
  ctx.fillStyle = '#efe9dc'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(380, 150); ctx.lineTo(380, 520); ctx.lineTo(0, 590); ctx.fill();
  ctx.beginPath(); ctx.moveTo(1000, 0); ctx.lineTo(620, 150); ctx.lineTo(620, 520); ctx.lineTo(1000, 590); ctx.fill();
  ctx.fillStyle = '#e2dacb'; ctx.fillRect(380, 150, 240, 370);
  ctx.fillStyle = '#d8cdb8'; ctx.beginPath(); ctx.moveTo(380, 150); ctx.lineTo(620, 150); ctx.lineTo(620, 230); ctx.quadraticCurveTo(500, 150, 380, 230); ctx.fill();
  ctx.fillStyle = '#2f6fb5'; k.rrect(455, 330, 90, 190, 40); ctx.fill();
  ctx.fillStyle = '#1f4f86'; for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(478 + i * 44, 380 + j * 44, 5, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#c9bfa8'; ctx.beginPath(); ctx.moveTo(0, 590); ctx.lineTo(380, 520); ctx.lineTo(620, 520); ctx.lineTo(1000, 590); ctx.fill();
  ctx.fillStyle = '#2f6fb5'; ctx.fillRect(120, 220, 70, 90); ctx.fillRect(810, 200, 70, 100);
}
/** The two threads, life (turquoise) and novel (orange), through stations; they part at `part`. */
const STATIONS = [['the alley', 'm6', 0.4], ['the lycée', 'm6', 2.4], ['Vichy laws', 'm7', 0.4], ['the camp', 'm8', 0.6], ['a diary', 'm9', 0.6]];
function threads(t) {
  const x0 = 80, dx = 150, y = 300;
  const grow = seg(t, s('m5', 1.0), s('m9', 3.0));
  const lastX = x0 + dx * 4.6;
  const reach = lerp(x0, lastX, grow);
  for (const [col, off] of [[C.memmi, -9], [C.novel, 9]]) { ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y + off); ctx.lineTo(reach, y + off); ctx.stroke(); }
  STATIONS.forEach(([name, key, d], j) => {
    const a = seg(t, s(key, d), s(key, d + 0.5));
    if (a <= 0) return;
    A(a, () => {
      const x = x0 + j * dx + 40;
      ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
      txtFit(name, x, y + (j % 2 ? 66 : -60), 170, { size: 32, weight: 600, align: 'center' });
    });
  });
  // the parting: the novel to a ship and South America; the life to Algiers, Paris, Tunis, France
  const part = eio(seg(t, s('m11', 0.6), s('m11', 3.4)));
  if (part > 0) {
    const px = lastX;
    trace(smooth([[px, y + 9], [px + 80, y + 60], [px + 150, y + 150]]), part, C.novel, { w: 8, head: false });
    trace(smooth([[px, y - 9], [px + 80, y - 60], [px + 150, y - 150]]), eio(seg(t, s('m11', 3.0), s('m11', 6.0))), C.memmi, { w: 8, head: false });
    A(seg(t, s('m11', 2.4), s('m11', 3.0)), () => { chip('South America', 820, 470, { color: C.novel, size: 32 }); });
    A(seg(t, s('m11', 4.8), s('m11', 5.4)), () => { chip('Algiers · Paris · Tunis · France', 640, 110, { color: C.memmi, size: 32 }); });
  }
}
function partMemmi(t) {
  header(t, 3);
  const upto = lerp(D(1942, 11, 1), D(1943, 5, 31), seg(t, s('m3', 0.2), e('m3', -0.4)));
  strip(t, 3, upto);
  // m1–m2: the alley; two languages
  const v1 = span(t, s('m1', -0.4), s('m3', 0.4), 0.5, 0.6);
  if (v1 > 0) A(v1, () => windowFrame(() => {
    drawAlley(t);
    chip('the Hara, Tunis', 500, 70, { color: C.dark, bg: 'rgba(239,230,207,0.94)', size: 34, a: seg(t, s('m1', 1.6), s('m1', 2.2)) });
    chip('1920', 500, 130, { color: C.dark, bg: 'rgba(239,230,207,0.94)', size: 32, a: seg(t, s('m1', 1.0), s('m1', 1.6)) });
    chip('a saddler’s son', 500, 550, { color: C.dark, bg: 'rgba(239,230,207,0.94)', size: 32, a: seg(t, s('m1', 4.4), s('m1', 5.0)) });
    A(seg(t, s('m2', 0.4), s('m2', 1.0)), () => chip('Judeo-Arabic at home', 230, 440, { color: C.memmi, size: 32 }));
    A(seg(t, s('m2', 3.0), s('m2', 3.6)), () => chip('French at the lycée', 770, 440, { color: C.memmi, size: 32 }));
  }));
  // m3: the camp, 1942–43
  const v2 = span(t, s('m3', 0.2), s('m4', 0.4), 0.5, 0.5);
  if (v2 > 0) A(v2, () => windowFrame(() => {
    const g = ctx.createLinearGradient(0, 0, 0, 590); g.addColorStop(0, '#5a6a8a'); g.addColorStop(1, '#b9a98a'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 590);
    ctx.fillStyle = '#8f7f62'; ctx.fillRect(0, 420, 1000, 170);
    ctx.fillStyle = '#d8d0bf'; for (let j = 0; j < 6; j++) { ctx.beginPath(); ctx.moveTo(140 + j * 130, 430); ctx.lineTo(195 + j * 130, 350); ctx.lineTo(250 + j * 130, 430); ctx.fill(); }
    chip('1942–43', 500, 120, { color: C.memmi, size: 36, a: seg(t, s('m3', 0.4), s('m3', 1.0)) });
    chip('a forced labour camp', 500, 200, { color: C.ink, size: 34, a: seg(t, s('m3', 1.4), s('m3', 2.0)) });
    chip('more or less of his own free will', 500, 520, { color: C.memmi, size: 32, a: seg(t, s('m3', 3.0), s('m3', 3.6)) });
  }));
  // m4: the novel, 1953
  const v3 = span(t, s('m4', 0.2), s('m5', 0.6), 0.5, 0.5);
  if (v3 > 0) A(v3, () => windowFrame(() => {
    ctx.fillStyle = '#1c2740'; ctx.fillRect(0, 0, 1000, 590);
    plainBook(500, 260, 460, 300, C.memmi, 'La Statue de sel', 1953, { a: eout(seg(t, s('m4', 0.4), s('m4', 1.4))) });
    A(seg(t, s('m4', 2.8), s('m4', 3.4)), () => txt('The Pillar of Salt', 500, 460, { size: 40, weight: 500, family: DISPLAY, italic: true, align: 'center' }));
    A(seg(t, s('m4', 4.6), s('m4', 5.2)), () => txt('preface: Albert Camus', 500, 530, { size: 32, weight: 600, color: C.soft, align: 'center' }));
  }));
  // m5–m11: two threads, life and novel
  const v4 = span(t, s('m5', 0.2), s('m12', 0.4), 0.5, 0.5);
  if (v4 > 0) A(v4, () => windowFrame(() => {
    ctx.fillStyle = '#1c2740'; ctx.fillRect(0, 0, 1000, 590);
    A(seg(t, s('m5', 0.6), s('m5', 1.2)), () => {
      chip('Memmi’s life', 40, 470, { color: C.memmi, size: 32, align: 'left' });
      chip('the novel', 40, 540, { color: C.novel, size: 32, align: 'left' });
    });
    A(seg(t, s('m5', 3.0), s('m5', 3.6)), () => chip('Alexandre Mordekhaï Benillouche', 940, 540, { color: C.novel, size: 32, align: 'right' }));
    threads(t);
    A(span(t, s('m10', 0.2), s('m11', 0.6), 0.5, 0.5), () => chip('the novel rests on his camp diary', 500, 172, { color: C.ink, size: 32 }));
  }));
  // m8: the line, over the threads
  A(span(t, s('m8', 2.6), s('m9', 0.4), 0.5, 0.5), () => {
    card(840, 330, 920, 260, { bg: 'rgba(9,14,28,0.98)', line: rgba(C.novel, 0.7) });
    txtFit('“I asked to go because it was', 880, 410, 840, { size: 46, weight: 500, family: DISPLAY, italic: true });
    txtFit('intolerable to stay.”', 880, 470, 840, { size: 46, weight: 500, family: DISPLAY, italic: true });
    txt('Albert Memmi, La Statue de sel (1953), translated', 880, 538, { size: 32, weight: 600, color: C.novel });
  });
  // m10: fact or fiction
  A(span(t, s('m10', 0.0), s('m11', 0.4), 0.5, 0.5), () => { card(RX, 250, RW, 120, { bg: 'rgba(9,14,28,0.94)' }); scale(t, 0.62, 'm10', { x: RX + 100, y: 330, w: 800, col: C.memmi }); });
  // m12: Lot's wife, looking back
  const v5 = span(t, s('m12', 0.0), CH[5].at + 1.0, 0.5, 0.6);
  if (v5 > 0) A(v5, () => windowFrame(() => {
    const g = ctx.createLinearGradient(0, 0, 0, 590); g.addColorStop(0, '#3a2f4f'); g.addColorStop(1, '#c79a72'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 590);
    ctx.fillStyle = '#6f5a48'; ctx.fillRect(0, 440, 1000, 150);
    // a pillar of salt, turned back towards the left
    const u = eout(seg(t, s('m12', 0.4), s('m12', 2.0)));
    ctx.fillStyle = `rgba(240,236,228,${u})`; k.rrect(620, 440 - 260 * u, 70, 260 * u, 30); ctx.fill();
    if (u > 0.9) { ctx.beginPath(); ctx.arc(648, 160, 30, 0, TAU); ctx.fill(); }
    trace([[600, 170], [420, 170]], eout(seg(t, s('m12', 2.4), s('m12', 3.6))), C.memmi, { w: 5, dash: [4, 10], headSize: 16 });
    A(seg(t, s('m12', 1.4), s('m12', 2.0)), () => chip('Lot’s wife', 780, 90, { color: C.ink, size: 34 }));
    A(seg(t, s('m12', 2.0), s('m12', 2.6)), () => chip('Genesis', 780, 160, { color: C.soft, size: 32 }));
    A(seg(t, s('m12', 4.6), s('m12', 5.2)), () => chip('looking back', 280, 260, { color: C.memmi, size: 34 }));
  }));
}

// ---------- cold open ----------
const VIGNETTES = [
  { x: 800, y: 250, key: 'o2', d: 0.2, draw: (t) => { drawTent(t); } },
  { x: 1310, y: 250, key: 'o2', d: 2.6, draw: (t) => { notebook(); trace([[120, 420], [300, 400], [480, 430], [700, 395], [900, 420]], 1, C.pencil, { w: 5, head: false }); flower(700, 230, 60); flower(560, 300, 44); } },
  { x: 800, y: 560, key: 'o3', d: 0.2, draw: (t) => { drawOffice(t); } },
  { x: 1310, y: 560, key: 'o3', d: 3.0, draw: (t) => { drawAlley(t); } },
];
function partOpen(t) {
  // o1: the six months as an ink line, writing itself
  const o1 = span(t, s('o1', 0.2), s('o2', 0.4), 0.6, 0.6);
  if (o1 > 0) A(o1, () => {
    monthAxis(RX + 30, RX + RW - 30, 560, { a: 1 });
    const u = eio(seg(t, s('o1', 0.8), e('o1', -0.6)));
    const X = (ms) => lerp(RX + 30, RX + RW - 30, (ms - D0) / (D1 - D0)), xa = X(D(1942, 11, 8)), xb = X(D(1943, 5, 13));
    ctx.strokeStyle = C.vio; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(xa, 560); ctx.lineTo(lerp(xa, xb, u), 560); ctx.stroke();
    txtFit('Tunisia, 1942–1943', RCX, 380, RW, { size: 64, weight: 600, family: DISPLAY, align: 'center' });
  });
  // o2–o3: four desks, one per writer
  const vg = span(t, s('o2', 0.0), s('o4', 1.0), 0.6, 0.8);
  if (vg > 0) A(vg, () => VIGNETTES.forEach((v, i) => {
    const a = eout(seg(t, s(v.key, v.d), s(v.key, v.d + 0.8)));
    if (a <= 0) return;
    A(a, () => {
      windowFrame(() => v.draw(t), { x: v.x, y: v.y + (1 - a) * 16, w: 490, h: 289, line: WR[i].col });
      spine(v.x + 30, v.y + 40 + (1 - a) * 16, 30, 50, WR[i].col, { n: i + 1 });
    });
  }));
  // o4: the title, beside the map, until the first chapter card
  const ti = eout(seg(t, s('o4', 1.6), s('o4', 2.8)));
  A(ti, () => titleBlock(RCX, 420 + (1 - ti) * 18, 1, 'Four writers, four places to stand'));
}
function titleBlock(x, y, a, sub) {
  A(a, () => {
    txt('THE WAR IN TUNISIA', x, y, { size: fit('THE WAR IN TUNISIA', 980, 100, { weight: 800, family: DISPLAY, spacing: '4px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '4px' });
    txt('IN WORDS', x, y + 130, { size: fit('IN WORDS', 980, 110, { weight: 800, family: DISPLAY, spacing: '4px' }), weight: 800, family: DISPLAY, color: C.vio, align: 'center', spacing: '4px' });
    WR.forEach((w, i) => spine(x - 105 + i * 70, y + 250, 36, 70, w.col, { n: i + 1 }));
    if (sub) txtFit(sub, x, y + 350, 960, { size: 40, weight: 600, color: C.soft, align: 'center' });
  });
}

// ---------- 1: six months, four witnesses ----------
const LX0 = 1010, LX1 = 1600, LY = [430, 540, 650, 760], AXY = 330;
const lx = (ms) => lerp(LX0, LX1, (ms - D0) / (D1 - D0));
/** The four lanes, with names and the print column; `on` per writer (lit), `upto` per writer. */
function lanesChart(t, { a = 1, upto = [D1, D1, D1, D1], lit = [1, 1, 1, 1], print = 1, printYears = [1, 1, 1, 1] } = {}) {
  if (a <= 0) return;
  A(a, () => {
    monthAxis(LX0, LX1, AXY, { labelsBelow: false, years: false, ly: 34 });
    txt('1942', LX0, AXY - 84, { size: 32, weight: 700, color: C.vio });
    txt('1943', lx(D(1943, 1, 1)), AXY - 84, { size: 32, weight: 700, color: C.vio });
    A(print, () => {
      ctx.fillStyle = C.soft; for (let j = 0; j < 4; j++) ctx.fillRect(1626 + j * 12, AXY - 2, 6, 4);
      txt('in print', 1725, AXY - 40, { size: 32, weight: 700, color: C.vio, align: 'center' });
    });
    WR.forEach((w, i) => {
      const y = LY[i], l = lit[i];
      A(0.3 + 0.7 * l, () => {
        txtFit(SURNAME[i], RX, y, 190, { size: 36, weight: 800, color: w.col });
        ctx.fillStyle = 'rgba(243,238,226,0.08)'; ctx.fillRect(LX0, y - 1, LX1 - LX0, 2);
        lane(i, LX0, LX1, y, upto[i], { w: 10, labelA: l });
        A(printYears[i], () => { spine(1690, y, 28, 52, w.col, { lit: 1 }); txt(String(w.printed), 1716, y + 2, { size: 34, weight: 800, color: w.col }); });
      });
    });
  });
}
function partSix(t) {
  // a1: the protectorate
  A(span(t, s('a1', 0.2), s('a2', 0.3), 0.5, 0.5), () => {
    card(860, 330, 880, 300, { line: 'rgba(185,162,255,0.6)' });
    txt('1942', RCX, 400, { size: 44, weight: 800, color: C.vio, align: 'center' });
    txtFit('A French protectorate', RCX, 476, 820, { size: 60, weight: 700, family: DISPLAY, align: 'center' });
    txtFit('ruled in name by the Bey of Tunis', RCX, 556, 820, { size: 40, weight: 500, color: C.soft, align: 'center' });
  });
  // a2–a5: the six months, with their events below the axis
  const axA = span(t, s('a2', 0.1), CH[1].at + 1.0, 0.6, 0.6);
  if (axA <= 0) return;
  A(axA, () => {
    const evA = span(t, s('a2', 0.1), s('a6', 0.6), 0.6, 0.6);
    // before the lanes come, the axis has its years above; afterwards the lanes chart draws its own
    const ev = (ms, label, sub, col, a, dy) => A(a * evA, () => {
      const x = lx(ms);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, AXY, 12, 0, TAU); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, AXY + 16); ctx.lineTo(x, AXY + dy - 30); ctx.stroke();
      const al = x > 1450 ? 'right' : 'left', xx = x + (al === 'right' ? -18 : 18);
      txt(label, xx, AXY + dy, { size: 36, weight: 800, color: col, align: al });
      if (sub) txt(sub, xx, AXY + dy + 44, { size: 32, weight: 500, color: C.ink, align: al });
    });
    const lanesA = seg(t, s('a6', 0.2), s('a6', 1.0));
    A(1 - lanesA, () => { monthAxis(LX0, LX1, AXY, { labelsBelow: false, years: false, ly: 34 }); txt('1942', LX0, AXY - 84, { size: 32, weight: 700, color: C.vio }); txt('1943', lx(D(1943, 1, 1)), AXY - 84, { size: 32, weight: 700, color: C.vio }); });
    ev(D(1942, 11, 8), '8 NOV 1942', 'Allied landings', C.ink, seg(t, s('a2', 0.3), s('a2', 1.0)), 120);
    ev(D(1942, 11, 9), 'Axis troops', 'into Tunis', C.ghez, seg(t, e('a2', -2.4), e('a2', -1.8)), 250);
    ev(D(1943, 5, 7), '7 MAY 1943', 'Tunis, Bizerte', C.ink, seg(t, s('a5', 0.3), s('a5', 1.0)), 250);
    ev(D(1943, 5, 13), '13 MAY', 'surrender', C.vio, seg(t, s('a5', 4.0), s('a5', 4.7)), 380);
    // the occupation, filled in
    const fill = eio(seg(t, s('a3', 0.2), s('a3', 2.2)));
    if (fill > 0) A(evA, () => { ctx.fillStyle = 'rgba(150,70,55,0.55)'; ctx.fillRect(lx(D(1942, 11, 9)), AXY - 5, (lx(D(1943, 5, 7)) - lx(D(1942, 11, 9))) * fill, 10); });
    // a4: Tunisians of every faith
    A(span(t, s('a4', 0.2), s('a5', 0.2), 0.5, 0.5) * evA, () => {
      txtFit('Tunisians of every faith', RCX, 760, 960, { size: 54, weight: 700, family: DISPLAY, align: 'center' });
      ['Muslims', 'Jews', 'Christians'].forEach((n, j) => chip(n, RCX + (j - 1) * 290, 860, { color: C.vio, size: 36, a: seg(t, s('a4', 1.0 + j * 0.4), s('a4', 1.5 + j * 0.4)) }));
    });
    // a6 onwards: the four lanes, one writer at a time
    if (lanesA > 0) {
      const upto = [0, 1, 2, 3].map((i) => lerp(D0, D1, eio(seg(t, s(PIN_KEY[i], 0.4), s(PIN_KEY[i], 4.0)))));
      const lit = [0, 1, 2, 3].map((i) => Math.max(seg(t, s(PIN_KEY[i], 0), s(PIN_KEY[i], 0.5)) * (1 - seg(t, s(PIN_KEY[i + 1] ?? 'a11', 0), s(PIN_KEY[i + 1] ?? 'a11', 0.5)) * 0.6), seg(t, s('a11', 0), s('a11', 0.5))));
      const prY = [0, 1, 2, 3].map((i) => seg(t, s('a11', [0.6, 3.6, 1.2, 4.4][i]), s('a11', [1.2, 4.2, 1.8, 5.0][i])));
      lanesChart(t, { a: lanesA, upto, lit: lit.map((l) => Math.max(l, 0.0001)), print: seg(t, s('a11', 0.2), s('a11', 0.8)), printYears: prY });
      // a12: three questions for every book
      A(seg(t, s('a12', 0.2), s('a12', 0.8)), () => {
        TABS.forEach((h, j) => {
          const a = eout(seg(t, s('a12', 0.6 + j * 1.2), s('a12', 1.2 + j * 1.2)));
          const w = textW(h, { size: 34, weight: 700 }) + 44;
          const xs = [RX + 120, RCX, RX + RW - 160];
          chip(h, xs[j], 880 + (1 - a) * 12, { color: C.vio, size: 34, a });
        });
      });
    }
  });
}

// ---------- 6: reading them together ----------
const STRENGTH = [['fast, close', 'censored'], ['memory shaped', 'chosen'], ['exact dates', 'one desk'], ['how it felt', 'invented']];
const MISSING = ['Muslim families', 'the women of Tunis', 'Italian soldiers', 'German soldiers'];
function partTogether(t) {
  // r1–r4: the lanes again, each lit in turn
  const la = span(t, s('r1', 0.2), s('r5', 0.4), 0.6, 0.6);
  if (la > 0) {
    const h = hiR(t);
    const lit = [0, 1, 2, 3].map((i) => (h < 0 ? 1 : h === i ? 1 : 0.15));
    lanesChart(t, { a: la, lit });
  }
  // r5–r6: what each kind of writing does
  const ka = span(t, s('r5', 0.2), s('r7', 0.4), 0.6, 0.6);
  if (ka > 0) A(ka, () => {
    WR.forEach((w, i) => {
      const a = eout(seg(t, s(i % 2 === 0 ? (i === 0 ? 'r5' : 'r5') : 'r6', [0.2, 0.2, 3.4, 3.0][i]), s(i % 2 === 0 ? 'r5' : 'r6', [0.8, 0.8, 4.0, 3.6][i])));
      const order = [0, 2, 1, 3][i];
      const x = RX + (order % 2) * 510, y = 260 + Math.floor(order / 2) * 330;
      A(a, () => {
        card(x, y + (1 - a) * 14, 490, 300, { bg: 'rgba(9,14,28,0.9)', line: rgba(w.col, 0.7) });
        spine(x + 40, y + 60, 30, 56, w.col, { n: i + 1 });
        txtFit(KIND[i], x + 76, y + 60, 390, { size: 40, weight: 600, family: DISPLAY, color: w.col });
        txt('+', x + 40, y + 160, { size: 44, weight: 800, color: C.ink, align: 'center' });
        txtFit(STRENGTH[i][0], x + 76, y + 160, 390, { size: 34, weight: 600 });
        txt('−', x + 40, y + 236, { size: 44, weight: 800, color: C.soft, align: 'center' });
        txtFit(STRENGTH[i][1], x + 76, y + 236, 390, { size: 34, weight: 600, color: C.soft });
      });
    });
  });
  // r7–r8: the voices four men's books leave out, as empty spines beside the four
  const ma = span(t, s('r7', 0.2), s('r9', 0.3), 0.6, 0.6);
  if (ma > 0) A(ma, () => {
    WR.forEach((w, i) => spine(RX + 70 + i * 74, 560, 56, 300, w.col, { n: i + 1 }));
    MISSING.forEach((m, j) => {
      const a = seg(t, s('r7', 2.0 + j * 1.2), s('r7', 2.6 + j * 1.2));
      A(a, () => {
        const x = RX + 420 + j * 0, y = 330 + j * 120;
        ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); k.rrect(x, y - 40, 56, 80, 6); ctx.stroke(); ctx.setLineDash([]);
        txt(m, x + 90, y, { size: 36, weight: 600, color: C.soft });
      });
    });
    A(seg(t, s('r8', 0.2), s('r8', 0.8)), () => txtFit('read together, with care', RX + RW, 880, 600, { size: 40, weight: 600, family: DISPLAY, italic: true, color: C.vio, align: 'right' }));
  });
  // r9: the questions, and the title
  const qa = seg(t, s('r9', 0.2), s('r9', 1.0));
  A(qa, () => {
    ['who?', 'from where?', 'when?'].forEach((q, j) => chip(q, RX + 150 + j * 340, 250, { color: C.vio, size: 40, a: seg(t, s('r9', 0.8 + j * 0.8), s('r9', 1.4 + j * 0.8)) }));
    A(seg(t, s('r9', 3.6), s('r9', 4.6)), () => titleBlock(RCX, 470, 1, null));
  });
}

// ---------- title cards and credits ----------
const CARD_SUB = [null, null, 'Ernie Pyle · Here Is Your War', 'Keith Douglas · Alamein to Zem Zem', 'Paul Ghez · Six mois sous la botte', 'Albert Memmi · La Statue de sel', null];
function titleCards(t) {
  CH.forEach((ch, i) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.86, () => { ctx.fillStyle = 'rgba(7,11,22,0.93)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8)), y = 470 + (1 - p) * 20;
      txt(`PART ${ch.n}`, W / 2, y - 120, { size: 36, weight: 700, color: C.vio, align: 'center', spacing: '6px' });
      const title = ch.title.toUpperCase();
      txt(title, W / 2, y, { size: fit(title, 1500, 120, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
      const sub = CARD_SUB[i + 1];
      if (sub) txt(sub, W / 2, y + 110, { size: fit(sub, 1400, 48, { italic: true }), weight: 600, color: C.soft, align: 'center', italic: true });
      // the four books, this one lit
      const y2 = y + 230;
      for (let j = 0; j < 4; j++) {
        const lit = i - 1 === j || i === 0 || i === 5;
        spine(W / 2 - 105 + j * 70, y2, 40, 84, WR[j].col, { lit: lit ? 1 : 0, n: j + 1 });
      }
    });
  });
}
const MUSIC = ['“Smoother Move” Kevin MacLeod (incompetech.com) · CC BY 4.0', "“Quinn's Song: First Night” Kevin MacLeod (incompetech.com) · CC BY 4.0", '“Pride” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  'Ernie Pyle, Here Is Your War (1943); Keith Douglas, Alamein to Zem Zem (1946); Paul Ghez, Six mois sous la botte (1943);',
  'Albert Memmi, La Statue de sel (1953). Posen Library; Documentation Center of North African Jews during WWII;',
  'US Holocaust Memorial Museum; H. Saadoun, Revue d’histoire de la Shoah (2016); L. Brozgal, H-France Review (2018);',
  'PN Review; Sherwood Rangers Yeomanry; BYU Library; CWGC; France Culture; Wikipedia: Ernie Pyle; Keith Douglas;',
  'Alamein to Zem Zem; Edward Kellett; Albert Memmi (fr). Map outline: Natural Earth (public domain), simplified.',
];
function credits(t) {
  ctx.fillStyle = '#080c18'; ctx.fillRect(0, 0, W, H);
  txt('THE WAR IN TUNISIA IN WORDS', W / 2, 200, { size: fit('THE WAR IN TUNISIA IN WORDS', 1600, 84, { weight: 800, family: DISPLAY, spacing: '3px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '3px' });
  txt('Tunisia 1943 · original animation', W / 2, 286, { size: 40, weight: 600, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 380, { size: 32, weight: 800, color: C.vio, align: 'center', spacing: '4px' });
  MUSIC.forEach((m, j) => txt(m, W / 2, 430 + j * 44, { size: 32, weight: 500, align: 'center' }));
  txt('SOURCES', W / 2, 610, { size: 32, weight: 800, color: C.vio, align: 'center', spacing: '4px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, 660 + j * 46, 1700, { size: 32, weight: 500, align: 'center', color: j > 3 ? C.soft : C.ink }));
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [DISPLAY, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    drawMap(t);
    const parts = [partOpen, partSix, partPyle, partDouglas, partGhez, partMemmi, partTogether];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    titleCards(t);
    A(seg(t, e('r9', 1.4), e('r9', 2.4)), () => credits(t));
  },
});
