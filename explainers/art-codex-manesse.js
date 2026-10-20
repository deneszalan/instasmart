// Explainer for art-codex-manesse: the journey of the Codex Manesse, Zürich -> Heidelberg -> Paris -> Heidelberg.
// Look: an illuminated page. Deep lapis ground, a parchment map framed like a Manesse miniature
// (vermilion rule, chain of gold lozenges), a red leather codex with gold clasps travelling over it,
// and a coloured "where was the book?" bar from 1300 to 1900 below. Grenze Gotisch for names,
// Alegreya for captions and labels. German captions for B1 learners.
//
// Scene plan (58.2 s). Map inset y 140-700, year bar y 718-792, captions centred at y 852.
//  A  0.0-11.2  Hook: a book on the map; it settles in Zürich (um 1300); additions until about 1340.
//  B 11.3-18.8  The trail is lost; at the end of the 16th century a Swiss nobleman owns it.
//  C 18.9-30.7  1607 to Heidelberg; 1622 the town is taken and the Palatina goes to Rome, the codex
//               (probably) escapes; its path is unknown (dashed).
//  D 30.8-37.9  From 1657 the property of the Royal Library in Paris, for over 230 years.
//  E 38.0-53.3  1887/88: a Strasbourg bookseller arranges an exchange; Paris gets back 166 stolen
//               manuscripts (handed over in London); the codex arrives in Heidelberg on 10 April 1888.
//  F 53.4-58.2  It is kept in the University Library to this day (Cod. Pal. germ. 848).
//
// Facts: Universitätsbibliothek Heidelberg, "Codex Manesse" (digi.ub.uni-heidelberg.de/de/bpd/glanzlichter/
// codex_manesse.html): made between about 1300 and about 1340 in Zürich, Grundstock about 1300, additions
// until about 1340; little is known of early ownership; at the end of the 16th century owned by the Swiss
// Calvinist Johann Philipp von Hohensax (1550-1596); Elector Friedrich IV brought it to Heidelberg in 1607;
// before Tilly's capture of Heidelberg in 1622 probably taken to safety by the electoral family, so unlike
// the Bibliotheca Palatina it was not taken to Rome; Jacques Dupuy left it to the Royal Library in Paris,
// officially its property from 4 July 1657, "für über 230 Jahre"; in 1887 the Strasbourg bookseller
// Karl Ignaz Trübner arranged an exchange: the Bibliothèque Nationale got 150,000 francs and 166 valuable
// manuscripts stolen in the 1840s; Trübner handed these over in London on 23 February 1888; couriers
// brought the codex from Paris to Heidelberg, where it arrived on 10 April 1888; kept there to this day.
// Wikipedia, "Codex Manesse": most of the Bibliotheca Palatina went to Rome as war booty in 1622; the
// manuscripts came from Lord Ashburnham's collection, bought by Trübner. Map positions are real
// longitudes and latitudes; coasts and rivers are simplified.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  lapis: '#14284A', lapisDeep: '#0B1830', lapisLight: '#284A80',
  parchment: '#EEDFBE', parchmentDark: '#D9C59A', ink: '#3A2414', inkSoft: 'rgba(58,36,20,0.62)',
  vermilion: '#B8321F', vermilionDeep: '#8A1F14', gold: '#D9A93A', goldLight: '#F3D27A', goldDeep: '#9C7420',
  sea: '#C9D3C2', seaLine: 'rgba(40,74,128,0.28)', river: 'rgba(40,74,128,0.55)',
  green: '#4E7D3A', blue: '#2F5FA8', unknown: 'rgba(58,36,20,0.45)',
  cream: '#F6EBD2', creamSoft: 'rgba(246,235,210,0.72)', creamFaint: 'rgba(246,235,210,0.45)',
};
const NAME = 'Grenze Gotisch', TEXT = 'Alegreya';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the map: an equirectangular view of lon -1.6..10.6, lat 46.6..52.6 ----------
const MAP = { lon0: -1.6, lon1: 10.6, lat0: 46.6, lat1: 52.6, x: 76, y: 150, ky: 90 };
MAP.kx = MAP.ky * Math.cos((49.6 * Math.PI) / 180);
MAP.w = (MAP.lon1 - MAP.lon0) * MAP.kx;
MAP.h = (MAP.lat1 - MAP.lat0) * MAP.ky;
const P = (lon, lat) => [MAP.x + (lon - MAP.lon0) * MAP.kx, MAP.y + (MAP.lat1 - lat) * MAP.ky];

const PLACE = {
  zurich: P(8.54, 47.37),
  sax: P(9.47, 47.23),      // the Hohensax lordship in the Swiss Rhine valley
  heidelberg: P(8.69, 49.41),
  paris: P(2.35, 48.86),
  london: P(-0.13, 51.51),
  strasbourg: P(7.75, 48.58),
};

// Simplified coasts (lon, lat).
const CONTINENT = [[-1.6, 49.65], [-1.25, 49.7], [-1.1, 49.4], [-0.5, 49.33], [-0.2, 49.3], [0.1, 49.42], [0.2, 49.6], [0.4, 49.76],
  [1.08, 49.93], [1.5, 50.15], [1.6, 50.5], [1.6, 50.73], [1.86, 50.95], [2.37, 51.04], [2.92, 51.23], [3.4, 51.37], [3.6, 51.45],
  [3.9, 51.6], [4.0, 51.8], [4.1, 51.98], [4.3, 52.1], [4.6, 52.45], [4.68, 52.6], [10.6, 52.6], [10.6, 46.6], [-1.6, 46.6]];
const BRITAIN = [[-1.6, 50.73], [-1.3, 50.78], [-1.1, 50.79], [-0.8, 50.75], [-0.14, 50.82], [0.28, 50.77], [0.58, 50.85], [0.98, 50.92],
  [1.1, 51.07], [1.31, 51.13], [1.4, 51.3], [1.43, 51.38], [1.0, 51.37], [0.6, 51.45], [0.5, 51.48], [0.71, 51.54], [0.95, 51.6],
  [1.15, 51.79], [1.28, 51.94], [1.55, 52.1], [1.75, 52.48], [1.75, 52.6], [-1.6, 52.6]];
const RIVERS = [
  // Rhine, from Lake Constance to the sea
  [[9.2, 47.66], [8.6, 47.6], [8.23, 47.6], [7.59, 47.56], [7.6, 48.0], [7.75, 48.58], [8.1, 49.0], [8.47, 49.49], [8.35, 49.9],
    [8.27, 50.0], [7.9, 49.97], [7.6, 50.36], [7.1, 50.73], [6.96, 50.94], [6.77, 51.23], [6.6, 51.5], [6.25, 51.85], [5.9, 51.9],
    [5.0, 51.9], [4.5, 51.9], [4.1, 51.98]],
  // Neckar past Heidelberg; Limmat and Aare from Zürich
  [[8.47, 49.49], [8.69, 49.41], [8.95, 49.35], [9.15, 49.2], [9.2, 48.9]],
  [[8.54, 47.37], [8.3, 47.47], [8.23, 47.6]],
  // Seine through Paris; Thames to London
  [[4.0, 48.3], [3.3, 48.4], [2.9, 48.5], [2.35, 48.86], [2.1, 49.0], [1.6, 49.1], [1.1, 49.44], [0.6, 49.4], [0.2, 49.45]],
  [[0.5, 51.48], [0.2, 51.47], [-0.13, 51.51], [-0.5, 51.45], [-1.0, 51.45]],
];

// ---------- the year bar: where was the book? ----------
const BAR = { x0: 100, x1: 764, y: 742, h: 16, y0: 1300, y1: 1900 };
const yearX = (y) => lerp(BAR.x0, BAR.x1, (y - BAR.y0) / (BAR.y1 - BAR.y0));
// [from, to, colour, dashed, grow start, grow end, soft start]
const SPANS = [
  [1300, 1340, C.green, false, 7.8, 9.6],
  [1340, 1590, C.unknown, true, 11.8, 14.4],
  [1590, 1607, C.green, false, 15.6, 18.2, true],
  [1607, 1622, C.blue, false, 20.6, 22.2],
  [1622, 1657, C.unknown, true, 27.2, 30.2],
  [1657, 1888, C.vermilion, false, 34.9, 37.4],
  [1888, 1900, C.blue, false, 49.8, 51.0],
];

// ---------- timeline ----------
const CUES = [
  [0.4, 3.8, 'Ein Buch voller Lieder geht auf eine *lange Reise*.'],
  [3.9, 7.5, 'Um *1300* entsteht in *Zürich* der ~Codex Manesse~.'],
  [7.6, 11.2, 'Bis etwa *1340* kommen neue Lieder und Bilder dazu.'],
  [11.3, 14.9, 'Danach weiß man lange nicht, *wo das Buch ist*.'],
  [15.0, 18.8, 'Ende des 16. Jahrhunderts gehört es einem *Schweizer Adligen*.'],
  [18.9, 22.7, '*1607* holt der Kurfürst von der Pfalz es nach ~Heidelberg~.'],
  [22.8, 26.8, '*1622* wird Heidelberg erobert. Die Bibliothek kommt nach *Rom*.'],
  [26.9, 30.7, 'Der Codex nicht: Er wird wohl vorher *in Sicherheit gebracht*.'],
  [30.8, 34.6, 'Ab *1657* gehört er der Königlichen Bibliothek in *Paris*.'],
  [34.7, 37.9, 'Dort bleibt er *über 230 Jahre*.'],
  [38.0, 41.8, 'Dann plant ein Buchhändler aus Straßburg einen *Tausch*.'],
  [41.9, 46.1, 'Paris bekommt *166 gestohlene Handschriften* zurück.'],
  [46.2, 49.4, 'Dafür gibt Paris den Codex her.'],
  [49.5, 53.3, 'Am *10. April 1888* ist er wieder in ~Heidelberg~.'],
  [53.4, 57.6, 'Dort liegt er bis heute, in der *Universitätsbibliothek*.'],
];
const DURATION = 58.2;

// ---------- static layers, painted once ----------
let bgCanvas = null, mapCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 420, 60, W / 2, 520, 900);
  rad.addColorStop(0, C.lapisLight); rad.addColorStop(0.45, C.lapis); rad.addColorStop(1, C.lapisDeep);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  // a faint diaper pattern of small gold crosses, as on miniature backgrounds
  const rnd = mulberry32(11);
  g.strokeStyle = 'rgba(217,169,58,0.10)'; g.lineWidth = 2;
  for (let y = 24; y < H; y += 48) {
    for (let x = (y / 48) % 2 ? 24 : 48; x < W; x += 48) {
      const s = 4 + rnd() * 1.5;
      g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x, y - s); g.lineTo(x, y + s); g.stroke();
    }
  }
  const vg = g.createRadialGradient(W / 2, H / 2, 320, W / 2, H / 2, 780);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

function poly(g, pts, close = false) {
  g.beginPath();
  pts.forEach(([lon, lat], i) => { const [x, y] = P(lon, lat); i ? g.lineTo(x, y) : g.moveTo(x, y); });
  if (close) g.closePath();
}

function paintMap() {
  mapCanvas = document.createElement('canvas'); mapCanvas.width = W; mapCanvas.height = H;
  const g = mapCanvas.getContext('2d');
  const { x, y, w, h } = MAP;
  // frame: vermilion rule and a chain of gold lozenges
  const fx = x - 22, fy = y - 22, fw = w + 44, fh = h + 44;
  g.fillStyle = C.vermilion; g.fillRect(fx, fy, fw, fh);
  g.fillStyle = C.vermilionDeep; g.fillRect(fx + 5, fy + 5, fw - 10, fh - 10);
  g.fillStyle = C.vermilion; g.fillRect(fx + 7, fy + 7, fw - 14, fh - 14);
  const lozenges = (x0, y0, x1, y1) => {
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.round(len / 26), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
    for (let i = 0; i <= n; i++) {
      const cx = x0 + ux * (len * i) / n, cy = y0 + uy * (len * i) / n, r = 7.5;
      const lg = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      lg.addColorStop(0, C.goldLight); lg.addColorStop(0.6, C.gold); lg.addColorStop(1, C.goldDeep);
      g.fillStyle = lg;
      g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx + r, cy); g.lineTo(cx, cy + r); g.lineTo(cx - r, cy); g.closePath(); g.fill();
    }
  };
  const m = 14.5;
  lozenges(fx + m, fy + m, fx + fw - m, fy + m);
  lozenges(fx + m, fy + fh - m, fx + fw - m, fy + fh - m);
  lozenges(fx + m, fy + m, fx + m, fy + fh - m);
  lozenges(fx + fw - m, fy + m, fx + fw - m, fy + fh - m);
  g.fillStyle = C.lapisDeep; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  // parchment, with blotches
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = C.sea; g.fillRect(x, y, w, h);
  g.fillStyle = C.parchment; poly(g, CONTINENT, true); g.fill(); poly(g, BRITAIN, true); g.fill();
  const rnd = mulberry32(5);
  for (let i = 0; i < 90; i++) {
    const bx = x + rnd() * w, by = y + rnd() * h, r = 20 + rnd() * 70;
    const rg = g.createRadialGradient(bx, by, 0, bx, by, r);
    rg.addColorStop(0, `rgba(150,110,50,${0.03 + rnd() * 0.05})`); rg.addColorStop(1, 'rgba(150,110,50,0)');
    g.fillStyle = rg; g.fillRect(bx - r, by - r, 2 * r, 2 * r);
  }
  // wavy sea lines
  g.strokeStyle = C.seaLine; g.lineWidth = 2;
  for (const [lon, lat] of [[-0.9, 50.2], [0.3, 50.35], [-0.3, 49.95], [2.6, 51.9], [3.3, 52.25], [2.4, 52.4], [1.1, 50.55]]) {
    const [sx, sy] = P(lon, lat);
    g.beginPath();
    for (let j = 0; j <= 24; j++) { const xx = sx + j * 2.2, yy = sy + Math.sin(j * 0.75) * 3.5; j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
    g.stroke();
  }
  // coasts and rivers
  g.strokeStyle = 'rgba(58,36,20,0.55)'; g.lineWidth = 2.5; g.lineJoin = 'round';
  poly(g, CONTINENT.slice(0, 23)); g.stroke(); poly(g, BRITAIN.slice(0, 22)); g.stroke();
  g.strokeStyle = C.river; g.lineWidth = 3; g.lineCap = 'round';
  for (const r of RIVERS) { poly(g, r); g.stroke(); }
  // lakes: Constance and Zürich
  g.fillStyle = 'rgba(40,74,128,0.45)';
  const [bx, by] = P(9.38, 47.6);
  g.beginPath(); g.ellipse(bx, by, 18, 7, -0.45, 0, TAU); g.fill();
  const [zx, zy] = P(8.68, 47.25);
  g.beginPath(); g.ellipse(zx, zy, 9, 3.5, -0.6, 0, TAU); g.fill();
  // river names
  g.fillStyle = 'rgba(40,74,128,0.75)'; g.font = `italic 500 22px ${TEXT}`; g.textBaseline = 'middle';
  g.save(); const [rx, ry] = P(6.95, 51.15); g.translate(rx, ry); g.rotate(-1.05); g.fillText('Rhein', 0, 0); g.restore();
  g.save(); const [sxx, syy] = P(1.55, 49.33); g.translate(sxx, syy); g.rotate(0.35); g.fillText('Seine', 0, 0); g.restore();
  g.restore();
}

function background(t) {
  if (!bgCanvas) paintBackground();
  ctx.drawImage(bgCanvas, 0, 0);
  const a = eout(seg(t, 0.05, 0.9));
  withAlpha(a, () => {
    font(700, 22); text('LESEFUTTER · KUNST', 64, 58, { color: C.goldLight, spacing: '3px' });
    font(700, 46, NAME); text('Codex Manesse', 62, 106, { color: C.cream });
    const w = ctx.measureText('Codex Manesse').width;
    font(500, 26); text('· die Reise eines Buches', 62 + w + 14, 104, { color: C.creamSoft });
  });
}

// ---------- the travelling codex ----------
function codex(x, y, s = 1, { alpha = 1, glow = 0, thick = 0 } = {}) {
  withAlpha(alpha, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (glow > 0) {
      const gl = ctx.createRadialGradient(0, 0, 4, 0, 0, 80);
      gl.addColorStop(0, `rgba(243,210,122,${0.75 * glow})`); gl.addColorStop(1, 'rgba(243,210,122,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.fill();
    }
    const w = 40, h = 52, d = 6 + thick * 6;
    // shadow
    ctx.fillStyle = 'rgba(20,10,4,0.35)'; rrect(-w / 2 + 4, -h / 2 + 6, w + d, h, 5); ctx.fill();
    // page block
    ctx.fillStyle = '#F7EED8'; rrect(-w / 2 + 2, -h / 2 + 3, w + d - 2, h - 4, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(120,90,50,0.5)'; ctx.lineWidth = 1;
    for (let i = 1; i < 4 + thick * 3; i++) { const yy = -h / 2 + 4 + i * ((h - 8) / (4 + thick * 3)); ctx.beginPath(); ctx.moveTo(w / 2, yy); ctx.lineTo(w / 2 + d - 1, yy); ctx.stroke(); }
    // cover
    const cg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    cg.addColorStop(0, '#C84A2E'); cg.addColorStop(0.55, C.vermilion); cg.addColorStop(1, C.vermilionDeep);
    ctx.fillStyle = cg; rrect(-w / 2, -h / 2, w, h, 4); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.2; rrect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 2); ctx.stroke();
    // centre lozenge
    ctx.fillStyle = C.goldLight;
    ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(7, 0); ctx.lineTo(0, 9); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
    // clasps
    ctx.fillStyle = C.gold;
    for (const cy of [-12, 12]) { rrect(w / 2 - 3, cy - 3, d + 5, 6, 2); ctx.fill(); }
    ctx.restore();
  });
}

/** A point along a polyline of [x, y] points, at fraction u of its length. */
function along(pts, u) {
  const lens = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); total += l; }
  let d = clamp(u) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) { const f = lens[i] ? d / lens[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; }
    d -= lens[i];
  }
  return pts[pts.length - 1];
}
/** Sampled quadratic curve from a to b through control c. */
function curve(a, c, b, n = 40) {
  const out = [];
  for (let i = 0; i <= n; i++) { const u = i / n; out.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]); }
  return out;
}
function trail(pts, u, { color = C.vermilion, dash = [], width = 4, alpha = 1 } = {}) {
  if (u <= 0) return;
  withAlpha(alpha, () => {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(dash);
    ctx.beginPath();
    const n = 120;
    for (let i = 0; i <= n * clamp(u); i++) { const [x, y] = along(pts, i / n); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    const [ex, ey] = along(pts, clamp(u)); ctx.lineTo(ex, ey);
    ctx.stroke(); ctx.setLineDash([]);
  });
}
function arrowHead(pts, color, size = 14) {
  const [x1, y1] = along(pts, 1), [x0, y0] = along(pts, 0.97);
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(x1 + Math.cos(a) * 4, y1 + Math.sin(a) * 4);
  ctx.lineTo(x1 + Math.cos(a + 2.5) * size, y1 + Math.sin(a + 2.5) * size);
  ctx.lineTo(x1 + Math.cos(a - 2.5) * size, y1 + Math.sin(a - 2.5) * size);
  ctx.closePath(); ctx.fill();
}

// Routes in canvas coordinates.
const MID = P(4.6, 49.9);
const R = {
  intro: [MID, PLACE.zurich],
  toHeidelberg: curve(PLACE.sax, [PLACE.sax[0] + 40, (PLACE.sax[1] + PLACE.heidelberg[1]) / 2], PLACE.heidelberg),
  toRome: curve(PLACE.heidelberg, [PLACE.heidelberg[0] + 120, PLACE.heidelberg[1] + 110], [MAP.x + MAP.w - 16, MAP.y + MAP.h - 12]),
  lost: curve(PLACE.heidelberg, P(5.2, 51.3), PLACE.paris, 60),
  plan: curve(PLACE.strasbourg, P(4.6, 51.0), PLACE.london),
  stolen: curve(PLACE.london, P(1.9, 50.6), PLACE.paris),
  home: curve(PLACE.paris, P(5.6, 50.0), PLACE.heidelberg),
};

/** Where the codex is at time t, and how it looks. */
function codexState(t) {
  const st = { x: MID[0], y: MID[1], alpha: eout(seg(t, 0.6, 1.2)), glow: 0, thick: 0, s: 1 + 0.25 * (1 - seg(t, 3.9, 5.2)) };
  const move = (pts, a, b) => { const [x, y] = along(pts, eio(seg(t, a, b))); st.x = x; st.y = y; };
  st.y += Math.sin(t * 2.2) * 4 * (1 - seg(t, 3.9, 4.5));
  if (t >= 3.9) move(R.intro, 4.0, 5.2);
  st.thick = eio(seg(t, 7.8, 9.6));
  if (t >= 11.3) st.alpha = 1 - seg(t, 11.4, 12.0);
  if (t >= 15.0) { st.x = PLACE.sax[0]; st.y = PLACE.sax[1]; st.alpha = eout(seg(t, 15.2, 15.8)); }
  if (t >= 18.9) move(R.toHeidelberg, 19.0, 20.6);
  if (t >= 26.9) { move(R.lost, 27.1, 31.6); st.alpha = 1 - 0.45 * seg(t, 27.1, 27.6) + 0.45 * seg(t, 31.4, 31.8); }
  if (t >= 46.2) move(R.home, 46.4, 48.8);
  st.glow = seg(t, 48.6, 49.2) * (0.75 + 0.25 * Math.sin(t * 3)) * (1 - 0.6 * seg(t, 53.4, 54.2));
  return st;
}

// ---------- places ----------
function placeDot(p, t0, { label, sub, side = 'left', dy = 9, color = C.vermilion, size = 30, until = 1e9 } = {}) {
  const t = placeDot.t;
  const a = seg(t, t0, t0 + 0.35) * (1 - seg(t, until, until + 0.4));
  if (a <= 0) return;
  const [x, y] = p;
  const pop = t < until ? back(a) : 1;
  withAlpha(t < until ? 1 : a, () => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 8 * pop, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 12 * pop, 0, TAU); ctx.stroke();
  });
  withAlpha(a, () => {
    const lx = side === 'left' ? x - 26 : side === 'right' ? x + 24 : x;
    const align = side === 'left' ? 'right' : side === 'right' ? 'left' : 'center';
    font(700, size, NAME); text(label, lx, y + dy, { align });
    if (sub) { font(700, 23); text(sub(t), lx, y + dy + 27, { align, color: C.vermilionDeep }); }
  });
}

function places(t) {
  placeDot.t = t;
  placeDot(PLACE.zurich, 4.6, { label: 'Zürich', sub: () => 'um 1300', dy: -2 });
  placeDot(PLACE.sax, 15.1, { label: 'Schweiz', side: 'below', dy: 38, size: 26, color: C.green, sub: null, until: 22.4 });
  placeDot(PLACE.heidelberg, 20.2, { label: 'Heidelberg', sub: (tt) => (tt >= 49.0 ? '1607 · 1888' : '1607'), dy: 2, color: C.blue });
  placeDot(PLACE.paris, 31.4, { label: 'Paris', side: 'right', dy: 16, sub: () => '1657' });
  placeDot(PLACE.strasbourg, 38.2, { label: 'Straßburg', size: 26, dy: 22, color: C.goldDeep, sub: null, until: 47.0 });
  placeDot(PLACE.london, 40.4, { label: 'London', side: 'right', size: 28, dy: 6, color: C.goldDeep, sub: null, until: 47.0 });
}

/** Question marks that float where the trail is lost. */
function lostMarks(t, a, b, pts) {
  withAlpha(span(t, a, b, 0.4, 0.4), () => {
    font(700, 44, NAME);
    pts.forEach(([x, y], i) => {
      const bob = Math.sin(t * 2 + i * 1.7) * 6;
      withAlpha(seg(t, a + i * 0.35, a + i * 0.35 + 0.4), () => text('?', x, y + bob, { color: C.inkSoft, align: 'center', base: 'middle' }));
    });
  });
}

// ---------- the Palatina goes to Rome (1622) ----------
function palatina(t) {
  const a = span(t, 22.9, 27.4, 0.3, 0.5);
  if (a <= 0) return;
  withAlpha(a, () => {
    trail(R.toRome, eio(seg(t, 23.0, 23.8)), { color: C.ink, dash: [2, 9], width: 4 });
    if (t > 23.8) arrowHead(R.toRome, C.ink);
    const rnd = mulberry32(3);
    for (let i = 0; i < 26; i++) {
      const t0 = 23.4 + i * 0.1 + rnd() * 0.05;
      const u = seg(t, t0, t0 + 1.4);
      if (u <= 0 || u >= 1) continue;
      const [x, y] = along(R.toRome, eio(u));
      ctx.fillStyle = i % 3 ? '#6B4A2A' : '#8A6A3E';
      ctx.save(); ctx.translate(x + (rnd() - 0.5) * 14, y + (rnd() - 0.5) * 10); ctx.rotate((rnd() - 0.5) * 0.6);
      ctx.fillRect(-6, -8, 12, 16); ctx.restore();
    }
    withAlpha(seg(t, 23.6, 24.0), () => {
      font(700, 26, NAME); text('nach Rom', MAP.x + MAP.w - 20, MAP.y + MAP.h - 26, { align: 'right', color: C.ink });
    });
  });
}

// ---------- the exchange (1887/88) ----------
const STOLEN = 166;
const STOLEN_T = Array.from({ length: STOLEN }, (_, i) => 42.0 + 3.2 * Math.pow(i / (STOLEN - 1), 0.85));
function exchange(t) {
  // the plan: Strasbourg -> London
  withAlpha(span(t, 38.6, 46.4, 0.3, 0.5), () => {
    trail(R.plan, eio(seg(t, 38.8, 40.6)), { color: C.goldDeep, dash: [3, 10], width: 4 });
  });
  // 166 stolen manuscripts fly from London back to Paris
  let landed = 0;
  const rnd = mulberry32(9);
  for (let i = 0; i < STOLEN; i++) {
    const t0 = STOLEN_T[i], jx = (rnd() - 0.5) * 26, jy = (rnd() - 0.5) * 18, rot = (rnd() - 0.5) * 0.8;
    const u = seg(t, t0, t0 + 0.9);
    if (u >= 1) { landed++; continue; }
    if (u <= 0) continue;
    const [x, y] = along(R.stolen, eio(u));
    const fade = 1 - seg(u, 0.85, 1);
    withAlpha(fade, () => {
      ctx.save(); ctx.translate(x + jx * Math.sin(Math.PI * u), y + jy * Math.sin(Math.PI * u)); ctx.rotate(rot);
      ctx.fillStyle = i % 4 ? '#7B5A33' : C.goldDeep; ctx.fillRect(-5, -7, 10, 14);
      ctx.fillStyle = 'rgba(247,238,216,0.85)'; ctx.fillRect(4, -6, 2, 12);
      ctx.restore();
    });
  }
  // the counter by Paris
  withAlpha(span(t, 41.9, 46.6, 0.3, 0.5), () => {
    const [px, py] = PLACE.paris;
    const bw = 128, bh = 62, bx = px - bw / 2 - 6, by = py + 46;
    rrect(bx, by, bw, bh, 12); ctx.fillStyle = 'rgba(58,36,20,0.86)'; ctx.fill();
    font(800, 40); text(String(landed), bx + bw / 2, by + 30, { color: C.goldLight, align: 'center', base: 'middle' });
    font(600, 18); text('Handschriften', bx + bw / 2, by + 52, { color: C.cream, align: 'center', base: 'middle' });
  });
}

// ---------- the year bar ----------
function yearBar(t) {
  const a = eout(seg(t, 4.0, 4.6)) * (1 - 0.0 * seg(t, 53.4, 54));
  if (a <= 0) return;
  withAlpha(a, () => {
    // base rail
    rrect(BAR.x0 - 10, BAR.y - 6, BAR.x1 - BAR.x0 + 20, BAR.h + 12, 12); ctx.fillStyle = 'rgba(11,24,48,0.55)'; ctx.fill();
    // century ticks
    for (let y = 1300; y <= 1900; y += 100) {
      const x = yearX(y);
      ctx.fillStyle = C.creamFaint; ctx.fillRect(x - 1, BAR.y + BAR.h + 6, 2, 8);
      font(700, 22); text(String(y), x, BAR.y + BAR.h + 32, { color: C.creamSoft, align: 'center', base: 'middle' });
    }
    // where was the book?
    for (const [y0, y1, col, dashed, g0, g1, soft] of SPANS) {
      const u = eio(seg(t, g0, g1));
      if (u <= 0) continue;
      const x0 = yearX(y0), x1 = lerp(x0, yearX(y1), u);
      if (dashed) {
        ctx.fillStyle = 'rgba(246,235,210,0.55)';
        for (let x = x0 + 2; x < x1 - 4; x += 12) { rrect(x, BAR.y + 5, 7, BAR.h - 10, 2); ctx.fill(); }
      } else {
        if (soft) {
          const lg = ctx.createLinearGradient(x0, 0, yearX(y1), 0);
          lg.addColorStop(0, 'rgba(78,125,58,0)'); lg.addColorStop(0.5, col); lg.addColorStop(1, col);
          ctx.fillStyle = lg;
        } else ctx.fillStyle = col;
        rrect(x0, BAR.y, Math.max(2, x1 - x0), BAR.h, 4); ctx.fill();
      }
    }
    // the arrow on to today
    withAlpha(seg(t, 50.8, 51.3), () => {
      const x = yearX(1900) + 4;
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.moveTo(x, BAR.y - 4); ctx.lineTo(x + 16, BAR.y + BAR.h / 2); ctx.lineTo(x, BAR.y + BAR.h + 4); ctx.closePath(); ctx.fill();
      font(700, 20); text('heute', x + 8, BAR.y - 16, { color: C.creamSoft, align: 'center', base: 'middle' });
    });
    // "über 230 Jahre" over the Paris span
    withAlpha(seg(t, 35.8, 36.3) * (1 - seg(t, 53.0, 53.5)), () => {
      const mx = (yearX(1657) + yearX(1888)) / 2;
      font(700, 22); text('Paris: über 230 Jahre', mx, BAR.y - 16, { color: C.goldLight, align: 'center', base: 'middle' });
    });
    // the marker: the story's year so far
    const year = storyYear(t);
    const mx = yearX(year);
    ctx.fillStyle = C.goldLight; ctx.strokeStyle = C.lapisDeep; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(mx, BAR.y - 9); ctx.lineTo(mx + 9, BAR.y + BAR.h / 2); ctx.lineTo(mx, BAR.y + BAR.h + 9); ctx.lineTo(mx - 9, BAR.y + BAR.h / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  });
}
/** The year the story has reached at time t (eased between the known points). */
const YEAR_KEYS = [[4.6, 1300], [7.8, 1300], [9.6, 1340], [11.8, 1340], [14.4, 1590], [18.2, 1607], [20.6, 1607], [22.2, 1622], [27.2, 1622],
  [30.2, 1657], [34.9, 1657], [37.4, 1888], [49.8, 1888], [51.0, 1900]];
function storyYear(t) {
  if (t <= YEAR_KEYS[0][0]) return YEAR_KEYS[0][1];
  for (let i = 1; i < YEAR_KEYS.length; i++) {
    const [ta, ya] = YEAR_KEYS[i - 1], [tb, yb] = YEAR_KEYS[i];
    if (t <= tb) return lerp(ya, yb, eio(seg(t, ta, tb)));
  }
  return YEAR_KEYS[YEAR_KEYS.length - 1][1];
}

// ---------- the closing card ----------
function closing(t) {
  const a = eout(seg(t, 53.6, 54.4));
  if (a <= 0) return;
  withAlpha(a * 0.78, () => { ctx.fillStyle = C.lapis; ctx.fillRect(MAP.x, MAP.y, MAP.w, MAP.h); });
  withAlpha(a, () => {
    ctx.save(); ctx.translate(W / 2, 420 + (1 - a) * 20);
    const bw = 560, bh = 300;
    rrect(-bw / 2, -bh / 2, bw, bh, 18); ctx.fillStyle = C.parchment; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = C.vermilion; ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = C.gold; rrect(-bw / 2 + 12, -bh / 2 + 12, bw - 24, bh - 24, 12); ctx.stroke();
    codex(0, -78, 1.25, { glow: 0.6 });
    font(700, 40, NAME); text('Universitätsbibliothek', 0, 10, { align: 'center', base: 'middle' });
    text('Heidelberg', 0, 54, { align: 'center', base: 'middle' });
    font(600, 24); text('Signatur: Cod. Pal. germ. 848', 0, 100, { align: 'center', base: 'middle', color: C.vermilionDeep });
    ctx.restore();
  });
  withAlpha(seg(t, 54.6, 55.2), () => {
    font(600, 21);
    text('Quellen: Universitätsbibliothek Heidelberg;', W / 2, 616, { color: C.cream, align: 'center', base: 'middle' });
    text('Wikipedia, „Codex Manesse“', W / 2, 644, { color: C.cream, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 700, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 858, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.cream, marks: { '*': C.goldLight, '~': '#F08A6E' } });
  }
}

Kit.scene({
  width: W, height: H, duration: DURATION,
  fonts: [
    { family: TEXT, file: 'Alegreya.woff2', weight: '400 900' },
    { family: NAME, file: 'GrenzeGotisch.woff2', weight: '100 900' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    if (!mapCanvas) paintMap();
    const ma = eout(seg(t, 0.1, 1.1));
    withAlpha(ma, () => {
      ctx.save(); ctx.translate(0, (1 - ma) * 18); ctx.drawImage(mapCanvas, 0, 0);
      // map contents, clipped to the parchment
      ctx.save(); ctx.beginPath(); ctx.rect(MAP.x, MAP.y, MAP.w, MAP.h); ctx.clip();
      ctx.globalAlpha *= 1 - seg(t, 53.6, 54.4);
      // known journeys, in red ink; unknown ones dashed
      trail(R.intro, eio(seg(t, 4.0, 5.2)), { color: C.vermilion, dash: [2, 10], width: 4, alpha: 0.5 * (1 - seg(t, 11.3, 12.0)) });
      trail(R.toHeidelberg, eio(seg(t, 19.0, 20.6)), { color: C.vermilion, width: 5, alpha: 1 - 0.75 * seg(t, 27.0, 28.0) });
      trail(R.lost, eio(seg(t, 27.1, 31.6)), { color: C.ink, dash: [3, 12], width: 4, alpha: 0.75 * (1 - 0.7 * seg(t, 38.0, 39.0)) });
      trail(R.home, eio(seg(t, 46.4, 48.8)), { color: C.vermilion, width: 5 });
      palatina(t);
      exchange(t);
      places(t);
      lostMarks(t, 11.8, 15.2, [P(6.4, 48.3), P(3.6, 47.4), P(7.6, 50.6)]);
      lostMarks(t, 27.6, 31.4, [P(6.3, 51.7), P(3.6, 50.8)]);
      const st = codexState(t);
      codex(st.x, st.y - 40, st.s, { alpha: st.alpha, glow: st.glow, thick: st.thick });
      ctx.restore();
      ctx.restore();
    });
    yearBar(t);
    closing(t);
    captions(t);
  },
});
