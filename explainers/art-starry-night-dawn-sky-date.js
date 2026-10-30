// Explainer for art-starry-night-dawn-sky-date: on 22 October 2026 a paper in Scientific Reports argued that the
// sky of Vincent van Gogh's The Starry Night (1889) is a real dawn sky over Saint-Rémy-de-Provence, about 22 July
// 1889, not the June usually given. The method is forensic astronomy: the Moon's shape and its place beside
// Venus change every day, so together they pin down a date. Look: the deep ultramarine of the painting, a
// schematic sketch after it (not the painting itself), chrome-yellow stars and Moon, a pale Venus, and a chart
// of the eastern dawn sky. Cormorant Garamond for titles and dates, Alegreya Sans for captions and labels.
//
// Facts:
// - E. J.-h. Kim et al., "The actual sky of Van Gogh's Starry Night: a multidisciplinary reconstruction",
//   Scientific Reports (published 22 October 2026), nature.com/articles/s41598-026-73025-5: the date "has been
//   June 1889"; Letter 782 (18 June 1889) mentions "a new study of a starry sky"; Letter 777 (about 31 May-6
//   June): from his window before sunrise "nothing but the morning star, which looked very big"; on 19 June
//   1889 the Moon "had a phase of 63.10% (as of 02:27)", between last quarter and full, while the painting
//   shows a sharp waning crescent; the narrow frame from the drawing F1541v, matched to a ridge south-west of
//   the asylum: diagonal 18.4 ± 0.9°, horizontal 14.8°, vertical 10.9°; "In the painting, the Moon stands above
//   Venus, having risen first"; "Among the dawns of June and July 1889 that meet this condition, the Moon and
//   Venus both fall within the recovered narrow frame on 23 June and on 22 and 23 July (at 03:00)"; on 22 July
//   "the Hyades cluster lies at the center of the frame"; Moon-Venus separation at 03:00: 21 July 29.7°, 22
//   July 18.6°, 23 July 7.66°, 24 July 3.20°; on 22 July the lunar phase "falls to 28.44%"; Venus reached 3°
//   altitude at 02:27 on 19 June, 03:06 on 31 May, 03:04 on 1 June, 02:57 on 4 June; the authors "assume that
//   repeated observational impressions over several adjacent nights may have been integrated".
// - The Guardian, "Astronomers challenge dating of Van Gogh's Starry Night" (22 October 2026): first author
//   Elijah Jeong-hyun Kim, an astronomer at Kyung Hee University in Yongin, South Korea; Van Gogh was living at
//   the asylum in Saint-Rémy-de-Provence; the Van Gogh Museum in Amsterdam, not involved, said its experts had
//   established that he painted it in June 1889, on a roll of canvas he received in early June; on 2 July he
//   sent Theo a drawing based on it; he had a severe breakdown on about 22 July; "Van Gogh was not concerned
//   with exact likenesses". Donald Olson, professor emeritus of physics and astronomy at Texas State
//   University, was not convinced: the positions of Venus and the Hyades in the painting do not match their
//   calculated positions, and the narrow field of view is inconsistent with the wider one the hills need.
// Computed here: the Moon, Venus and the Sun from a standard low-precision method (P. Schlyter's orbital
// elements with the Moon's main perturbations and parallax), the Hyades from their catalogue positions
// precessed to 1889, all at 03:00 local mean time at Saint-Rémy (43.79° N, 4.83° E). It reproduces the paper's
// numbers (separations 29.7°, 18.6°, 7.6°, 3.2°; 63% lit on 19 June; Venus at 3° at 02:27 on 19 June) and finds
// the same three dawns. The painting sketch is schematic; the star places are approximate.
//
// Scene plan (60 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.0  The painting (a sketch after it), Saint-Rémy 1889; the news.
//  B  9.2–13.6  The Moon as a clock: one dawn after another in July 1889.
//  C 13.8–18.2  In the painting: a waning crescent above Venus.
//  D 18.4–27.4  The June date: the letter of 18 June; the real Moon of 19 June, 63% lit.
//  E 27.6–32.0  The narrow frame from his sketch of the hills.
//  F 32.2–45.8  Sweeping the dawns of June and July: three fit; 21-24 July; the Hyades on 22 July.
//  G 46.0–55.0  The Van Gogh Museum and Donald Olson disagree.
//  H 55.2–60.0  Several nights in one sky.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#071230', bg1: '#030817', ink: '#f4f1e6', soft: 'rgba(244,241,230,0.74)', faint: 'rgba(244,241,230,0.26)',
  line: 'rgba(244,241,230,0.12)', ultra: '#1f3c8f', cobalt: '#3d67c9', pale: '#9fb8ec', star: '#f4d35e', moon: '#f6c945',
  venus: '#f3f6ff', june: '#ff9a76', july: '#8be3c6', panel: 'rgba(3,8,23,0.80)', cypress: '#0d2216', hill: '#13245a',
};
const SERIF = 'Cormorant Garamond', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const R = Math.PI / 180;

// ---------- the sky over Saint-Rémy in 1889 ----------
const LAT = 43.789, LON = 4.832, LMT = 3.0;
const rev = (x) => ((x % 360) + 360) % 360;
const jd = (y, m, d) => { if (m <= 2) { y -= 1; m += 12; } const a = Math.floor(y / 100); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + 2 - a + Math.floor(a / 4) - 1524.5; };
function kepler(M, e) { let E = M + e * Math.sin(M) * (1 + e * Math.cos(M)); for (let i = 0; i < 20; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; }
function orbit(N, i, w, a, e, M) {
  const E = kepler(rev(M) * R, e), xv = a * (Math.cos(E) - e), yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv), r = Math.hypot(xv, yv), n = N * R, inc = i * R, u = v + w * R;
  return [r * (Math.cos(n) * Math.cos(u) - Math.sin(n) * Math.sin(u) * Math.cos(inc)), r * (Math.sin(n) * Math.cos(u) + Math.cos(n) * Math.sin(u) * Math.cos(inc)), r * Math.sin(u) * Math.sin(inc)];
}
function sunLon(d) {
  const w = 282.9404 + 4.70935e-5 * d, e = 0.016709 - 1.151e-9 * d, M = 356.047 + 0.9856002585 * d;
  const E = kepler(rev(M) * R, e);
  return { lon: rev(Math.atan2(Math.sqrt(1 - e * e) * Math.sin(E), Math.cos(E) - e) / R + w), r: Math.hypot(Math.cos(E) - e, Math.sqrt(1 - e * e) * Math.sin(E)), L: M + w };
}
function moonEcl(d) {
  const N = 125.1228 - 0.0529538083 * d, w = 318.0634 + 0.1643573223 * d, M = 115.3654 + 13.0649929509 * d;
  const [x, y, z] = orbit(N, 5.1454, w, 60.2666, 0.0549, M);
  let lon = Math.atan2(y, x) / R, lat = Math.atan2(z, Math.hypot(x, y)) / R, r = Math.hypot(x, y, z);
  const s = sunLon(d), Ms = 356.047 + 0.9856002585 * d, Lm = M + w + N, D = Lm - s.L, F = Lm - N, sn = (a) => Math.sin(a * R), cs = (a) => Math.cos(a * R);
  lon += -1.274 * sn(M - 2 * D) + 0.658 * sn(2 * D) - 0.186 * sn(Ms) - 0.059 * sn(2 * M - 2 * D) - 0.057 * sn(M - 2 * D + Ms) + 0.053 * sn(M + 2 * D) + 0.046 * sn(2 * D - Ms) + 0.041 * sn(M - Ms) - 0.035 * sn(D) - 0.031 * sn(M + Ms) - 0.015 * sn(2 * F - 2 * D) + 0.011 * sn(M - 4 * D);
  lat += -0.173 * sn(F - 2 * D) - 0.055 * sn(M - F - 2 * D) - 0.046 * sn(M + F - 2 * D) + 0.033 * sn(F + 2 * D) + 0.017 * sn(2 * M + F);
  r += -0.58 * cs(M - 2 * D) - 0.46 * cs(2 * D);
  return { lon: rev(lon), lat, r };
}
function venusEcl(d) {
  const [x, y, z] = orbit(76.6799 + 2.4659e-5 * d, 3.3946 + 2.75e-8 * d, 54.891 + 1.38374e-5 * d, 0.72333, 0.006773 - 1.302e-9 * d, 48.0052 + 1.6021302244 * d);
  const s = sunLon(d), X = x + s.r * Math.cos(s.lon * R), Y = y + s.r * Math.sin(s.lon * R);
  return { lon: rev(Math.atan2(Y, X) / R), lat: Math.atan2(z, Math.hypot(X, Y)) / R };
}
function toEq(lon, lat, d) {
  const e = (23.4393 - 3.563e-7 * d) * R, x = Math.cos(lat * R) * Math.cos(lon * R), y = Math.cos(lat * R) * Math.sin(lon * R), z = Math.sin(lat * R);
  const ye = y * Math.cos(e) - z * Math.sin(e), ze = y * Math.sin(e) + z * Math.cos(e);
  return { ra: rev(Math.atan2(ye, x) / R), dec: Math.atan2(ze, Math.hypot(x, ye)) / R };
}
function toHor({ ra, dec }, lst) {
  const h = (lst - ra) * R, dr = dec * R, p = LAT * R, x = Math.cos(h) * Math.cos(dr), y = Math.sin(h) * Math.cos(dr), z = Math.sin(dr);
  const xh = x * Math.sin(p) - z * Math.cos(p), zh = x * Math.cos(p) + z * Math.sin(p);
  return { az: rev(Math.atan2(y, xh) / R + 180), alt: Math.atan2(zh, Math.hypot(xh, y)) / R };
}
const sepDeg = (a, b) => Math.acos(Math.min(1, Math.sin(a.dec * R) * Math.sin(b.dec * R) + Math.cos(a.dec * R) * Math.cos(b.dec * R) * Math.cos((a.ra - b.ra) * R))) / R;
// The Hyades' five brightest (catalogue positions for 2000, in hours, minutes, seconds and degrees, minutes, seconds)
const HYADES = { gamma: [4, 19, 47.6, 15, 37, 39.5], delta: [4, 22, 56.09, 17, 32, 33.0], epsilon: [4, 28, 37.0, 19, 10, 49.6], theta: [4, 28, 39.74, 15, 52, 15.1], aldebaran: [4, 35, 55.24, 16, 30, 33.5] };
function starEq([h, m, s, dd, dm, ds], d) {
  const ra = (h + m / 60 + s / 3600) * 15 * R, de = (dd + dm / 60 + ds / 3600) * R, e = 23.4393 * R;
  const x = Math.cos(de) * Math.cos(ra), y = Math.cos(de) * Math.sin(ra), z = Math.sin(de);
  const lon = Math.atan2(y * Math.cos(e) + z * Math.sin(e), x) / R + (1.396971 * d) / 36525, lat = Math.asin(-y * Math.sin(e) + z * Math.cos(e)) / R;
  return toEq(lon, lat, d);
}
/** The sky at `hrs` local mean time on day `day` of `month` 1889. */
function sky(month, day, hrs = LMT) {
  const ut = hrs - LON / 15, d = jd(1889, month, day) - 2451543.5 + ut / 24, s = sunLon(d), lst = s.L + 180 + ut * 15 + LON;
  const me = moonEcl(d), moonEq = toEq(me.lon, me.lat, d), sunEq = toEq(s.lon, 0, d), venEq = (() => { const v = venusEcl(d); return toEq(v.lon, v.lat, d); })();
  // the Moon's parallax: seen from Saint-Rémy, not from Earth's centre
  const par = Math.asin(1 / me.r) / R, ha = rev(lst - moonEq.ra), g = Math.atan(Math.tan(LAT * R) / Math.cos(ha * R)) / R;
  const topo = { ra: moonEq.ra - (par * Math.cos(LAT * R) * Math.sin(ha * R)) / Math.cos(moonEq.dec * R), dec: moonEq.dec - (par * Math.sin(LAT * R) * Math.sin((g - moonEq.dec) * R)) / Math.sin(g * R) };
  const lit = (1 - Math.cos(sepDeg(topo, sunEq) * R)) / 2;
  const stars = Object.fromEntries(Object.entries(HYADES).map(([n, c]) => [n, toHor(starEq(c, d), lst)]));
  return { moon: toHor(topo, lst), venus: toHor(venEq, lst), sun: toHor(sunEq, lst), sep: sepDeg(topo, venEq), lit, stars };
}
// the frame from the sketch F1541v (14.8° × 10.9°, with its stated uncertainty)
const FRAME = { w: 14.8, h: 10.9, dw: 0.7, dh: 0.5, diag: 18.4 };
/** The Moon above Venus, both inside the frame, both risen. */
function fits(s) {
  const wd = Math.abs(s.moon.az - s.venus.az) * Math.cos(((s.moon.alt + s.venus.alt) / 2) * R), hd = s.moon.alt - s.venus.alt;
  return s.moon.alt > 3 && s.venus.alt > 3 && hd > 0 && wd <= FRAME.w + FRAME.dw && hd <= FRAME.h + FRAME.dh;
}
const DAYS = [];
for (let i = 0; i < 61; i++) { const m = i < 30 ? 6 : 7, d = i < 30 ? i + 1 : i - 29; DAYS.push({ m, d, s: sky(m, d) }); }
const HITS = DAYS.filter((x) => fits(x.s));
const J19 = sky(6, 19), J19early = sky(6, 19, 2 + 27 / 60), JUL = [21, 22, 23, 24].map((d) => ({ d, s: sky(7, d) }));
// checks against the paper
const near = (a, b, tol, what) => { if (Math.abs(a - b) > tol) throw new Error(`${what}: ${a.toFixed(2)}, the paper has ${b}`); };
near(J19early.lit * 100, 63.1, 1, 'Moon lit on 19 June at 02:27');
near(J19early.venus.alt, 3, 0.2, 'Venus altitude at 02:27 on 19 June');
[29.7, 18.6, 7.66, 3.2].forEach((v, i) => near(JUL[i].s.sep, v, 0.25, `Moon-Venus on ${JUL[i].d} July`));
near(JUL[1].s.lit * 100, 28.44, 1, 'Moon lit on 22 July');
if (HITS.map((x) => `${x.d}/${x.m}`).join(' ') !== '23/6 22/7 23/7') throw new Error(`fitting dawns: ${HITS.map((x) => `${x.d}/${x.m}`).join(' ')}`);
const PCT19 = Math.round(J19.lit * 100), PCT22 = Math.round(JUL[1].s.lit * 100);

const CUES = [
  [0.4, 4.6, 'In 1889 Vincent van Gogh painted *The Starry Night* at an asylum in Saint-Rémy, southern France.'],
  [4.8, 9.0, 'On 22 October 2026, a team led by astronomer Elijah Jeong-hyun Kim argued it shows a *real dawn sky*.'],
  [9.2, 13.6, 'Their clock is the Moon: from one dawn to the next it moves about 13° and changes shape.'],
  [13.8, 18.2, 'In the painting, a thin *crescent Moon* hangs above ^Venus^, the bright morning star.'],
  [18.4, 22.8, 'The usual date is June: on 18 June 1889 he wrote of ‘a new study of a starry sky’.'],
  [23.0, 27.4, `But at dawn on 19 June the real Moon was ~${PCT19}% lit~: past half, not a crescent.`],
  [27.6, 32.0, 'The team matched his sketch of the hills to a ridge: his view was only about 18° corner to corner.'],
  [32.2, 36.6, 'Over June and July 1889, the Moon stood above Venus inside that frame on just three dawns.'],
  [36.8, 41.2, `Day by day it closed in on Venus: ${Math.round(JUL[0].s.sep)}° apart on 21 July, ${Math.round(JUL[1].s.sep)}° on the 22nd, ${Math.round(JUL[2].s.sep)}° on the 23rd.`],
  [41.4, 45.8, `On 22 July the V of stars called the ^Hyades^ sat in the middle, and the Moon was *${PCT22}% lit*.`],
  [46.0, 50.4, 'The Van Gogh Museum disagrees: it dates the painting to June, and his breakdown to about 22 July.'],
  [50.6, 55.0, 'Astronomer Donald Olson says the painted Venus and Hyades don’t sit where the real ones were.'],
  [55.2, 60.0, 'The authors think he may have blended several nights. Either way, a painted sky can be checked.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg0); lg.addColorStop(1, C.bg1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 420; i++) { g.fillStyle = `rgba(244,241,230,${0.05 + rnd() * 0.25})`; g.beginPath(); g.arc(rnd() * W, rnd() * H, rnd() * 1.3, 0, 7); g.fill(); }
}

// ---------- a sketch after the painting (schematic, not the painting) ----------
const PX = 52, PY = 166, PW = 760, PH = 600;
// approximate places of the painted stars, as fractions of the canvas; the big one by the cypress is Venus
const PSTARS = [[0.104, 0.046, 1], [0.229, 0.033, 0.8], [0.344, 0.039, 1], [0.411, 0.063, 0.8], [0.234, 0.171, 1.1], [0.609, 0.086, 1.1], [0.706, 0.23, 1.1], [0.325, 0.326, 0.9], [0.044, 0.451, 0.8], [0.13, 0.476, 1]];
const PVENUS = [0.354, 0.526], PMOON = [0.906, 0.171];
let sketch = null;
function paintSketch() {
  sketch = document.createElement('canvas'); sketch.width = PW; sketch.height = PH;
  const g = sketch.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, PH); lg.addColorStop(0, '#16307a'); lg.addColorStop(0.7, '#244aa6'); lg.addColorStop(1, '#162a66');
  g.fillStyle = lg; g.fillRect(0, 0, PW, PH);
  // brushstrokes along a flow: two whirls and a long horizontal wave
  let s = 5; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const whirls = [[0.47, 0.36, 0.17], [0.68, 0.47, 0.11]];
  const flow = (x, y) => {
    let ang = Math.sin(y * 9 + x * 3) * 0.35 - 0.12;
    for (const [cx, cy, r] of whirls) { const dx = x - cx, dy = (y - cy) * 1.25, d = Math.hypot(dx, dy); if (d < r * 1.6) { const w = clamp(1 - (d - r * 0.3) / (r * 1.3)); ang = lerp(ang, Math.atan2(dy, dx) + Math.PI / 2, w); } }
    return ang;
  };
  const cols = ['#5d86df', '#86a8ee', '#2f56b8', '#c9d9f6', '#3c66c9', '#a9c1f0', '#e9e3a6'];
  for (let i = 0; i < 2600; i++) {
    const x = rnd(), y = rnd() * 0.7, a = flow(x, y), len = 10 + rnd() * 16;
    g.strokeStyle = cols[Math.floor(rnd() * (y > 0.45 && rnd() < 0.3 ? 7 : 6))]; g.globalAlpha = 0.35 + rnd() * 0.4; g.lineWidth = 2 + rnd() * 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x * PW, y * PH); g.quadraticCurveTo(x * PW + Math.cos(a) * len * 0.5, y * PH + Math.sin(a) * len * 0.5 + 2, x * PW + Math.cos(a) * len, y * PH + Math.sin(a) * len); g.stroke();
  }
  g.globalAlpha = 1;
  // hills, village and church
  g.fillStyle = C.hill; g.beginPath(); g.moveTo(0, PH * 0.74); g.bezierCurveTo(PW * 0.3, PH * 0.66, PW * 0.55, PH * 0.7, PW * 0.72, PH * 0.6); g.bezierCurveTo(PW * 0.85, PH * 0.53, PW * 0.95, PH * 0.52, PW, PH * 0.53); g.lineTo(PW, PH); g.lineTo(0, PH); g.fill();
  g.fillStyle = '#1b3f86'; g.beginPath(); g.moveTo(0, PH * 0.82); g.bezierCurveTo(PW * 0.4, PH * 0.74, PW * 0.7, PH * 0.78, PW, PH * 0.7); g.lineTo(PW, PH); g.lineTo(0, PH); g.fill();
  for (let i = 0; i < 26; i++) {
    const x = PW * (0.42 + rnd() * 0.56), y = PH * (0.83 + rnd() * 0.14), w = 14 + rnd() * 22, h = 10 + rnd() * 12;
    g.fillStyle = '#2b3c6e'; g.fillRect(x, y, w, h); g.fillStyle = '#3d4f86'; g.beginPath(); g.moveTo(x - 2, y); g.lineTo(x + w / 2, y - 7); g.lineTo(x + w + 2, y); g.fill();
    if (rnd() < 0.55) { g.fillStyle = '#f4d35e'; g.fillRect(x + w * 0.3, y + h * 0.35, 4, 4); }
  }
  g.fillStyle = '#3d4f86'; g.beginPath(); g.moveTo(PW * 0.56, PH * 0.64); g.lineTo(PW * 0.575, PH * 0.84); g.lineTo(PW * 0.545, PH * 0.84); g.fill();
  // the cypress, a dark flame
  // left and right edges of the flame, with tongues
  const edge = (side) => { const pts = []; for (let i = 0; i <= 40; i++) { const f = i / 40, y = PH * (1 - f * 0.94), half = PW * (0.12 * Math.pow(1 - f, 0.8) + 0.004) * (side > 0 ? 1.35 : 1), tongue = Math.sin(f * 34 + side) * PW * 0.012 * (1 - f); pts.push([PW * (0.2 + 0.05 * (1 - f)) + side * (half + tongue), y]); } return pts; };
  const L = edge(-1), Rr = edge(1).reverse();
  g.fillStyle = C.cypress; g.beginPath(); g.moveTo(...L[0]); for (const p of [...L, ...Rr]) g.lineTo(...p); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(70,98,52,0.55)'; g.lineWidth = 2.2;
  for (let i = 0; i < 70; i++) { const f = rnd() * 0.9, y = PH * (1 - f * 0.94), x = PW * (0.2 + 0.05 * (1 - f)) + (rnd() - 0.4) * PW * 0.2 * (1 - f); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 5, y - 16, x + 1, y - 34); g.stroke(); }
}
function haloStar(g, x, y, r, col, a = 1) {
  for (let i = 3; i >= 1; i--) { g.strokeStyle = `rgba(250,240,190,${0.22 * a})`; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r * (1 + i * 0.55), 0, 7); g.stroke(); }
  g.fillStyle = col; g.globalAlpha = a; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.globalAlpha = 1;
}
/** Draw the Moon at x, y with radius r, `lit` of it lit, the lit side facing `ang` (radians, screen). */
function moonDisc(x, y, r, lit, ang, col = C.moon) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = 'rgba(160,170,200,0.20)'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  const rx = r * (1 - 2 * lit);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
  if (rx >= 0) ctx.ellipse(0, 0, Math.max(0.01, rx), r, 0, Math.PI / 2, -Math.PI / 2, true);
  else ctx.ellipse(0, 0, -rx, r, 0, Math.PI / 2, (3 * Math.PI) / 2, false);
  ctx.fill(); ctx.restore();
}
function drawSketch(t, o = {}) {
  ctx.drawImage(sketch, PX, PY);
  ctx.strokeStyle = 'rgba(244,241,230,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(PX, PY, PW, PH);
  const tw = (i) => 0.85 + 0.15 * Math.sin(t * 2.2 + i * 1.7);
  PSTARS.forEach(([fx, fy, sz], i) => haloStar(ctx, PX + fx * PW, PY + fy * PH, 7 * sz * tw(i), '#fbe9a0', o.dimStars ?? 1));
  haloStar(ctx, PX + PVENUS[0] * PW, PY + PVENUS[1] * PH, 9 * tw(20), C.venus, 1);
  // the painted crescent: a waning crescent, lit on its right
  const mx = PX + PMOON[0] * PW, my = PY + PMOON[1] * PH;
  for (let i = 3; i >= 1; i--) { ctx.fillStyle = `rgba(246,201,69,${0.07 * i})`; ctx.beginPath(); ctx.arc(mx, my, 34 + i * 16, 0, 7); ctx.fill(); }
  moonDisc(mx, my, 34, 0.22, 0.55);
  font(500, 20); text('a schematic sketch after the painting', PX + PW - 10, PY + PH - 16, { align: 'right', color: 'rgba(244,241,230,0.6)' });
}

// ---------- the chart of the eastern dawn sky ----------
const CH = { x0: 60, x1: 804, y0: 196, y1: 712, az0: 62, az1: 110 };
const KPX = (CH.x1 - CH.x0) / (CH.az1 - CH.az0); // px per degree
const AZC = (CH.az0 + CH.az1) / 2;
const sx = (p) => CH.x0 + (CH.x1 - CH.x0) / 2 + (p.az - AZC) * Math.cos(p.alt * R) * KPX;
const sy = (p) => CH.y1 - p.alt * KPX;
const clipChart = (fn) => { ctx.save(); ctx.beginPath(); ctx.rect(CH.x0, 150, CH.x1 - CH.x0, CH.y1 + 40 - 150); ctx.clip(); fn(); ctx.restore(); };
function chart(t, a = 1) {
  A(a, () => {
    // dawn glow low in the north-east
    const g = ctx.createLinearGradient(0, CH.y1 - 200, 0, CH.y1); g.addColorStop(0, 'rgba(61,103,201,0)'); g.addColorStop(1, 'rgba(120,150,220,0.22)');
    ctx.fillStyle = g; ctx.fillRect(CH.x0, CH.y1 - 200, CH.x1 - CH.x0, 200);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
    for (let alt = 10; alt <= 30; alt += 10) { ctx.beginPath(); ctx.moveTo(CH.x0, sy({ alt })); ctx.lineTo(CH.x1, sy({ alt })); ctx.stroke(); font(500, 22); text(`${alt}°`, CH.x0 + 4, sy({ alt }) - 14, { color: C.faint }); }
    // the horizon, hills
    ctx.fillStyle = '#0a1638'; ctx.beginPath(); ctx.moveTo(CH.x0, CH.y1);
    for (let x = CH.x0; x <= CH.x1; x += 8) ctx.lineTo(x, CH.y1 - 10 - 12 * Math.sin(x / 70) - 8 * Math.sin(x / 23));
    ctx.lineTo(CH.x1, CH.y1 + 40); ctx.lineTo(CH.x0, CH.y1 + 40); ctx.fill();
    font(600, 22);
    for (const [az, lab] of [[67.5, 'ENE'], [90, 'E'], [101, 'ESE']]) { const x = sx({ az, alt: 0 }); text(lab, x, CH.y1 + 24, { align: 'center', color: C.soft }); }
  });
}
function hyades(s, a, label = true) {
  A(a, () => {
    const st = s.stars, P = (n) => [sx(st[n]), sy(st[n])];
    ctx.strokeStyle = 'rgba(139,227,198,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(...P('epsilon')); ctx.lineTo(...P('delta')); ctx.lineTo(...P('gamma')); ctx.lineTo(...P('theta')); ctx.lineTo(...P('aldebaran')); ctx.stroke(); ctx.setLineDash([]);
    for (const n of Object.keys(st)) { ctx.fillStyle = n === 'aldebaran' ? '#ffd1a8' : C.ink; ctx.beginPath(); ctx.arc(...P(n), n === 'aldebaran' ? 5 : 3.4, 0, 7); ctx.fill(); }
    if (label) { font(700, 24); text('Hyades', P('epsilon')[0] - 14, P('epsilon')[1] - 22, { align: 'center', color: C.july }); }
  });
}
function bodies(s, a, o = {}) {
  A(a, () => {
    const v = [sx(s.venus), sy(s.venus)], m = [sx(s.moon), sy(s.moon)];
    for (let i = 3; i >= 1; i--) { ctx.fillStyle = `rgba(243,246,255,${0.06 * i})`; ctx.beginPath(); ctx.arc(...v, 6 + i * 6, 0, 7); ctx.fill(); }
    ctx.fillStyle = C.venus; ctx.beginPath(); ctx.arc(...v, 6.5, 0, 7); ctx.fill();
    // the lit side faces the Sun, below the horizon in the north-east
    const sun = [sx(s.sun), sy(s.sun)], ang = Math.atan2(sun[1] - m[1], sun[0] - m[0]);
    if (s.moon.alt > -2) moonDisc(...m, o.r ?? 16, s.lit, ang);
    if (o.labels) {
      const below = s.moon.alt < s.venus.alt;
      font(700, 24); text('Venus', below ? v[0] + 4 : v[0] - 16, below ? v[1] - 30 : v[1] + 28, { align: below ? 'center' : 'right', color: C.venus });
      if (s.moon.alt > 0) text(o.moonLabel ?? 'Moon', m[0], below ? m[1] + 36 : m[1] - 34, { align: 'center', color: C.moon });
    }
  });
}
function frameAt(s, a, col) {
  A(a, () => {
    const cx = (sx(s.moon) + sx(s.venus)) / 2, cy = (sy(s.moon) + sy(s.venus)) / 2, w = FRAME.w * KPX, h = FRAME.h * KPX;
    ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  });
}
const dname = (m, d) => `${d} ${m === 6 ? 'June' : 'July'} 1889`;

// ---------- A: the painting ----------
function sceneOpen(t) {
  const a = span(t, 0, 9.2, 0.6, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('SAINT-RÉMY-DE-PROVENCE · 1889', W / 2, 118, { align: 'center', color: C.soft, spacing: '3px' });
    drawSketch(t);
    A(seg(t, 5.0, 5.6), () => {
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 250, 590, 500, 62, 12); ctx.fill();
      font(600, 28, SERIF); text('Scientific Reports · 22 October 2026', W / 2, 621, { align: 'center', color: C.star });
    });
  });
}

// ---------- B: the Moon as a clock ----------
function sceneClock(t) {
  const a = span(t, 9.0, 13.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('THE EASTERN SKY AT 3 A.M., SAINT-RÉMY, JULY 1889', W / 2, 136, { align: 'center', color: C.soft, spacing: '2px' });
    chart(t);
    const days = DAYS.filter((x) => x.m === 7 && x.d >= 19 && x.d <= 24), step = clamp((t - 9.6) / 0.62, 0, days.length - 1);
    const i = Math.floor(step);
    clipChart(() => {
      days.forEach((x, j) => { if (j < i) A(0.35, () => bodies(x.s, 1, { r: 12 })); });
      bodies(days[i].s, 1, { labels: true });
      hyades(days[i].s, 0.8, false);
      font(600, 24); text(`${Math.round(days[i].s.lit * 100)}% lit`, sx(days[i].s.moon) + 34, sy(days[i].s.moon) + 4, { color: C.moon });
    });
    ctx.fillStyle = C.panel; k.rrect(W / 2 - 150, 160, 300, 52, 10); ctx.fill();
    font(700, 30, SERIF); text(dname(7, days[i].d), W / 2, 187, { align: 'center', color: C.moon });
  });
}

// ---------- C: in the painting ----------
function scenePainted(t) {
  const a = span(t, 13.6, 18.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('THE STARRY NIGHT, 1889', W / 2, 118, { align: 'center', color: C.soft, spacing: '3px' });
    drawSketch(t, { dimStars: 0.6 });
    const mx = PX + PMOON[0] * PW, my = PY + PMOON[1] * PH, vx = PX + PVENUS[0] * PW, vy = PY + PVENUS[1] * PH;
    A(eout(seg(t, 14.4, 15.0)), () => {
      ctx.strokeStyle = C.moon; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx, my, 64, 0, 7); ctx.stroke();
      ctx.fillStyle = C.panel; k.rrect(mx - 250, my + 76, 260, 76, 10); ctx.fill();
      font(700, 26); text('a crescent Moon', mx - 120, my + 100, { align: 'center', color: C.moon });
      font(500, 22); text('a sharp, waning crescent', mx - 120, my + 132, { align: 'center', color: C.soft });
    });
    A(eout(seg(t, 15.6, 16.2)), () => {
      ctx.strokeStyle = C.venus; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(vx, vy, 38, 0, 7); ctx.stroke();
      ctx.fillStyle = C.panel; k.rrect(vx + 50, vy - 34, 250, 68, 10); ctx.fill();
      font(700, 26); text('Venus', vx + 70, vy - 10, { color: C.venus });
      font(500, 22); text('below and left of the Moon', vx + 70, vy + 18, { color: C.soft });
    });
  });
}

// ---------- D: the June date ----------
function sceneJune(t) {
  const a = span(t, 18.2, 27.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the letter
    A(1 - seg(t, 22.6, 23.0), () => {
      const y0 = 200, g = eout(seg(t, 18.5, 19.3));
      ctx.save(); ctx.translate(0, (1 - g) * 30);
      ctx.fillStyle = '#efe6cf'; k.rrect(132, y0, 600, 430, 10); ctx.fill();
      ctx.strokeStyle = 'rgba(60,40,20,0.18)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(172, y0 + 150 + i * 30); ctx.lineTo(692 - (i % 3) * 40, y0 + 150 + i * 30); ctx.stroke(); }
      font(600, 30, SERIF); text('Saint-Rémy, 18 June 1889', 172, y0 + 56, { color: '#3a2a1a' });
      font(500, 24); text('Vincent van Gogh to his brother Theo', 172, y0 + 96, { color: 'rgba(58,42,26,0.7)' });
      ctx.fillStyle = 'rgba(244,211,94,0.55)'; ctx.fillRect(168, y0 + 222, 476, 52);
      font(700, 36, SERIF); text('“…a new study of a starry sky”', W / 2, y0 + 250, { align: 'center', color: '#20160c' });
      font(500, 22); text('Letter 782, as quoted in the 2026 paper', W / 2, y0 + 398, { align: 'center', color: 'rgba(58,42,26,0.65)' });
      ctx.restore();
    });
    // the painted crescent beside the real Moon of 19 June
    A(seg(t, 23.0, 23.5), () => {
      font(600, 24); text('THE MOON AT DAWN', W / 2, 136, { align: 'center', color: C.soft, spacing: '2px' });
      const cy = 400;
      for (const [x, lit, ang, title, sub, col] of [[236, 0.22, 0.55, 'in the painting', 'a thin waning crescent', C.moon], [628, J19.lit, Math.PI * 0.86, '19 June 1889, 3 a.m.', `${PCT19}% lit, past half`, C.june]]) {
        ctx.fillStyle = C.panel; k.rrect(x - 180, 200, 360, 440, 16); ctx.fill();
        for (let i = 3; i >= 1; i--) { ctx.fillStyle = `rgba(246,201,69,${0.05 * i})`; ctx.beginPath(); ctx.arc(x, cy, 96 + i * 14, 0, 7); ctx.fill(); }
        moonDisc(x, cy, 96, lit, ang);
        font(700, 30, SERIF); text(title, x, 556, { align: 'center', color: col });
        font(500, 24); text(sub, x, 596, { align: 'center', color: C.soft });
      }
      A(seg(t, 24.6, 25.2), () => { font(600, 24); text('computed for Saint-Rémy; lit side towards the Sun, still below the horizon', W / 2, 690, { align: 'center', color: C.soft }); });
    });
  });
}

// ---------- E: the narrow frame ----------
function sceneFrame(t) {
  const a = span(t, 27.4, 32.2, 0.4, 0.3);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('HIS VIEW, FROM A SKETCH OF THE HILLS', W / 2, 136, { align: 'center', color: C.soft, spacing: '2px' });
    // a wide view of the ridge, with the narrow frame inside it
    const y0 = 230, h = 420;
    ctx.fillStyle = 'rgba(31,60,143,0.35)'; k.rrect(60, y0, 744, h, 12); ctx.fill();
    ctx.strokeStyle = C.pale; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 60; x <= 804; x += 6) { const yy = y0 + h - 90 - 60 * Math.exp(-(((x - 520) / 120) ** 2)) - 28 * Math.sin(x / 50) - 20 * Math.exp(-(((x - 260) / 70) ** 2)); if (x === 60) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
    ctx.stroke();
    font(500, 22); text('the ridge south-west of the asylum (drawn schematically)', 80, y0 + h - 24, { color: C.soft });
    const g = eio(seg(t, 28.4, 29.6)), fw = lerp(744, FRAME.w * KPX, g), fh = lerp(h, FRAME.h * KPX, g), cx = lerp(432, 500, g), cy = lerp(y0 + h / 2, y0 + 190, g);
    ctx.strokeStyle = C.star; ctx.lineWidth = 4; ctx.strokeRect(cx - fw / 2, cy - fh / 2, fw, fh);
    A(seg(t, 29.6, 30.1), () => {
      ctx.strokeStyle = 'rgba(244,211,94,0.6)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - fw / 2, cy + fh / 2); ctx.lineTo(cx + fw / 2, cy - fh / 2); ctx.stroke(); ctx.setLineDash([]);
      font(700, 28); text(`${FRAME.diag}° corner to corner`, cx, cy - fh / 2 - 26, { align: 'center', color: C.star });
      font(500, 22); text(`${FRAME.w}° wide × ${FRAME.h}° high`, cx, cy + fh / 2 + 24, { align: 'center', color: C.soft });
    });
  });
}

// ---------- F: the sweep of the dawns ----------
function sceneSweep(t) {
  const a = span(t, 32.0, 46.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('THE EASTERN SKY AT 3 A.M., SAINT-RÉMY', W / 2, 124, { align: 'center', color: C.soft, spacing: '2px' });
    chart(t);
    const stamp = (x, i) => { ctx.fillStyle = C.panel; k.rrect(78, 236 + i * 56, 170, 46, 10); ctx.fill(); font(700, 26, SERIF); text(`${x.d} ${x.m === 6 ? 'June' : 'July'}`, 163, 259 + i * 56, { align: 'center', color: C.star }); };
    if (t < 36.8) {
      // 32.4–36.4: run through 61 dawns, holding briefly on each hit
      const p = seg(t, 32.6, 36.4), idx = Math.min(DAYS.length - 1, Math.floor(p * DAYS.length)), cur = DAYS[idx];
      HITS.forEach((h, i) => { if (DAYS.indexOf(h) <= idx) stamp(h, i); });
      clipChart(() => bodies(cur.s, 1, { labels: true }));
      const ok = fits(cur.s);
      if (cur.s.sep < 26 && cur.s.moon.alt > 0) frameAt(cur.s, 1, ok ? C.star : 'rgba(255,154,118,0.75)');
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 170, 156, 340, 52, 10); ctx.fill();
      font(700, 30, SERIF); text(dname(cur.m, cur.d), W / 2, 183, { align: 'center', color: ok ? C.star : C.ink });
    } else {
      HITS.forEach((h, i) => stamp(h, i));
      // 36.8–41.2: 21 → 24 July, one dawn at a time; 41.4–45.8: 22 July with the Hyades
      const step = t < 41.2 ? clamp(Math.floor((t - 37.0) / 1.0), 0, 3) : 1, x = JUL[step];
      JUL.forEach((y, j) => { if (j !== step && t < 41.2 && j < step) A(0.3, () => bodies(y.s, 1, { r: 11 })); });
      hyades(x.s, t >= 41.2 ? eout(seg(t, 41.4, 42.0)) : 0.35, t >= 41.2);
      bodies(x.s, 1, { labels: true, moonLabel: `Moon, ${Math.round(x.s.lit * 100)}% lit` });
      frameAt(x.s, 1, fits(x.s) ? C.star : 'rgba(255,154,118,0.75)');
      ctx.strokeStyle = 'rgba(246,201,69,0.5)'; ctx.setLineDash([4, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx(x.s.moon), sy(x.s.moon)); ctx.lineTo(sx(x.s.venus), sy(x.s.venus)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 200, 156, 400, 52, 10); ctx.fill();
      font(700, 30, SERIF); text(`${dname(7, x.d)} · ${Math.round(x.s.sep)}° apart`, W / 2, 183, { align: 'center', color: fits(x.s) ? C.star : C.ink });
      if (x.d === 24) A(1, () => { font(600, 26); text('now the Moon is below Venus', W / 2, 640, { align: 'center', color: C.june }); });
    }
    A(seg(t, 32.6, 33.0), () => { font(500, 21); text('Moon drawn twice its size · computed positions', CH.x1 - 6, CH.y1 + 56, { align: 'right', color: C.faint }); });
  });
}

// ---------- G: the objections ----------
function sceneDoubt(t) {
  const a = span(t, 45.8, 55.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('NOT EVERYONE AGREES', W / 2, 136, { align: 'center', color: C.soft, spacing: '3px' });
    const card = (y, g, title, lines, col) => A(g, () => {
      ctx.save(); ctx.translate(0, (1 - g) * 24);
      ctx.fillStyle = C.panel; k.rrect(70, y, 724, 230, 16); ctx.fill();
      ctx.fillStyle = col; ctx.fillRect(70, y, 8, 230);
      font(700, 32, SERIF); text(title, 104, y + 44, { color: col });
      font(500, 26); lines.forEach((l, i) => text(l, 104, y + 96 + i * 40, { color: C.ink }));
      ctx.restore();
    });
    card(190, eout(seg(t, 46.2, 46.9)), 'Van Gogh Museum, Amsterdam', ['Painted in June 1889, on canvas he got in early June.', 'A drawing after it went to Theo on 2 July.', 'A severe breakdown about 22 July stopped his painting.'], C.june);
    card(450, eout(seg(t, 50.8, 51.5)), 'Donald Olson, Texas State University', ['The painted Venus and Hyades do not match', 'their calculated places, and an 18° view is', 'too narrow for the round hills and cliffs.'], C.pale);
  });
}

// ---------- H: several nights ----------
function sceneEnd(t) {
  const a = eout(seg(t, 55.2, 56.0));
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('OBSERVATION AND IMAGINATION', W / 2, 118, { align: 'center', color: C.soft, spacing: '3px' });
    drawSketch(t);
    A(seg(t, 56.4, 57.2), () => {
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 300, 580, 600, 70, 12); ctx.fill();
      font(600, 28, SERIF); text(`23 June · 22 July · 23 July 1889`, W / 2, 615, { align: 'center', color: C.star });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) { paintBg(); paintSketch(); }
    ctx.drawImage(bg, 0, 0);
    sceneOpen(t);
    sceneClock(t);
    scenePainted(t);
    sceneJune(t);
    sceneFrame(t);
    sceneSweep(t);
    sceneDoubt(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 41, weight: 700, family: SANS, ink: C.ink, marks: { '*': C.star, '~': C.june, '^': C.july } });
  },
});
