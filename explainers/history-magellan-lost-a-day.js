// Explainer for history-magellan-lost-a-day: sailing west round the world, the Victoria's log fell one
// day behind.
// Look: a vellum portolan chart. Mottled vellum, a network of rhumb lines in black, green and red
// radiating from compass roses (sparse, to keep the clip small), sepia ink, a gilded Sun, a carrack
// silhouette. Cinzel for the chart's capitals and numbers, EB Garamond for captions and labels.
//
// Facts:
//  Wikipedia, "Magellan expedition": the five-ship fleet left Spain on 20 September 1519 with about 270
//  men; Magellan died in battle in the Philippines in April 1521 and Elcano led the Victoria home; on
//  9 July 1522 Elcano put into Portuguese Cape Verde, where the crew learned that the ship's date was one
//  day behind; "They lost one day because they travelled west during their circumnavigation of the
//  globe, in the same direction as the apparent motion of the sun across the sky"; 18 men returned to
//  Spain on 6 September 1522.
//  Wikipedia, "International Date Line": Cape Verde "on Wednesday, 9 July 1522 (ship's time)"; "the
//  locals told them that it was actually Thursday, 10 July 1522"; the crew "had recorded each day of the
//  three-year journey without omission"; crossing the date line westbound increases the date.
//  Wikipedia, "Antonio Pigafetta": he kept the voyage's journal, a daily record; Pigafetta's account (as
//  quoted at webspace.science.uu.nl/~gent0113/idl/idl_discovery.htm): "every day I ... had written down
//  each day without any intermission."
// Computed below: weekdays (Julian day numbers), 1,024 days from 20 September 1519 to 10 July 1522, the
// route on a north-polar azimuthal diagram, and the noon counts in the sped-up demonstration (the Sun
// moves 360° a day; the ship 360° per lap; a noon is the Sun crossing a place's meridian).
//
// Scene plan (62.4 s; captions at y = 836, key elements above y = 750):
//  A  0.0–15.2  Hook. The Victoria sails to the Cape Verde islands; the log says Wednesday 9 July, the
//               shore Thursday 10 July; Pigafetta's journal lists every day.
//  B  15.0–26.0 The route, westward on a polar diagram of the globe; Magellan killed in the Philippines;
//               Elcano brings the Victoria home.
//  C  25.8–51.8 Why. The Sun circles the globe once a day; a noon at Spain. Sped up: one lap while five
//               days pass in Spain; counters 5 against 4. One lap west always costs one day.
//  D  51.6–62.4 The real voyage: 1,024 days ashore, 1,023 in the log; the date line today.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2, DEG = Math.PI / 180;

const C = {
  vellum: '#EEDDB9', vellumLight: '#F7EBD2', vellumDark: '#CFB27F', ink: '#2A2016', inkSoft: 'rgba(42,32,22,0.70)',
  inkFaint: 'rgba(42,32,22,0.22)', red: '#A8321E', green: '#3F6B3A', gold: '#B8862B', goldLight: '#E9C46A',
  sea: 'rgba(64,112,120,0.16)', night: 'rgba(36,58,92,0.22)',
};
const CAPS = 'Cinzel', TEXT = 'Garamond';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- dates (Julian calendar, in use in 1519–1522) ----------
const jdJ = (y, m, d) => { const a = Math.floor((14 - m) / 12), Y = y + 4800 - a, M = m + 12 * a - 3; return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - 32083; };
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const wday = (jd) => DAYS[jd % 7];
const DEPART = jdJ(1519, 9, 20), ASHORE = jdJ(1522, 7, 10);
const LAPS = 1;                                   // one lap westward by Cape Verde
const DAYS_ASHORE = ASHORE - DEPART;              // 1,024
const DAYS_LOG = DAYS_ASHORE - LAPS;              // 1,023
const LOG_JD = ASHORE - LAPS;                     // what the log said: 9 July
const LOG_DAY = wday(LOG_JD), SHORE_DAY = wday(ASHORE);   // Wednesday, Thursday
const fmt = (n) => n.toLocaleString('en-US');

// ---------- the globe: a north-polar azimuthal diagram ----------
const G = { cx: 432, cy: 430, R: 228 };
const rOf = (lat) => (G.R * (90 - lat)) / 150;
const P = (lon, lat, R = null) => { const r = R ?? rOf(lat); return [G.cx + r * Math.sin(lon * DEG), G.cy + r * Math.cos(lon * DEG)]; };
// The route, with longitudes unwrapped so that west keeps decreasing (east positive).
const ROUTE = [
  { lon: -6.4, lat: 36.8, name: 'Spain' },
  { lon: -15, lat: 12 }, { lon: -38, lat: -10 }, { lon: -48, lat: -30 },
  { lon: -70, lat: -53, name: 'Strait' },
  { lon: -95, lat: -38 }, { lon: -140, lat: -12 }, { lon: -190, lat: 8 },
  { lon: -236, lat: 10.3, name: 'Philippines' },
  { lon: -232.6, lat: 0.7, name: 'Moluccas' },
  { lon: -260, lat: -12 }, { lon: -300, lat: -30 },
  { lon: -341.5, lat: -34.4, name: 'Good Hope' },
  { lon: -360, lat: -12 },
  { lon: -383.5, lat: 15, name: 'Cape Verde' },
];
const ROUTE_LEN = []; { let s = 0; ROUTE.forEach((p, i) => { if (i) { const [a, b] = [P(ROUTE[i - 1].lon, ROUTE[i - 1].lat), P(p.lon, p.lat)]; s += Math.hypot(b[0] - a[0], b[1] - a[1]); } ROUTE_LEN.push(s); }); }
function routeAt(f) {
  const s = f * ROUTE_LEN.at(-1);
  let i = 1; while (i < ROUTE.length - 1 && ROUTE_LEN[i] < s) i++;
  const u = (s - ROUTE_LEN[i - 1]) / (ROUTE_LEN[i] - ROUTE_LEN[i - 1] || 1);
  return { lon: lerp(ROUTE[i - 1].lon, ROUTE[i].lon, u), lat: lerp(ROUTE[i - 1].lat, ROUTE[i].lat, u), i };
}
const SPAIN = ROUTE[0];

// ---------- the demonstration: noons counted at Spain and on the ship ----------
const DEMO = { a: 30.6, b: 44.6, days: 5, lead: 10 };   // lead: the Sun starts 10° east of Spain
const demoDays = (t) => DEMO.days * seg(t, DEMO.a, DEMO.b);
const sunLon = (d) => SPAIN.lon + DEMO.lead - 360 * d;              // the Sun moves west, 360° a day
const shipLonDemo = (d) => SPAIN.lon - 360 * (d / DEMO.days);       // one lap west in DEMO.days
// Noons at a place = how many times the Sun has crossed its meridian since d = 0.
const noons = (relStart, relNow) => Math.floor(relStart / 360) - Math.floor(relNow / 360);
const homeNoons = (d) => noons(sunLon(0) - SPAIN.lon, sunLon(d) - SPAIN.lon);
const shipNoons = (d) => noons(sunLon(0) - shipLonDemo(0), sunLon(d) - shipLonDemo(d));
const HOME_END = homeNoons(DEMO.days), SHIP_END = shipNoons(DEMO.days);   // 5 and 4

// ---------- timeline ----------
const T = { A: [0, 15.2], B: [15.0, 26.0], C: [25.8, 51.8], D: [51.6, 62.4] };
const CUES = [
  [0.4, 5.6, 'In July 1522, after nearly three years at sea, the *Victoria* reached Cape Verde.'],
  [5.8, 10.2, `Its log said *${LOG_DAY} 9 July*. Ashore it was ~${SHORE_DAY} 10 July~.`],
  [10.4, 15.0, 'Yet Pigafetta, the voyage’s chronicler, had written down every single day.'],
  [15.2, 20.8, 'They had left Spain in 1519 and sailed west, all the way round the world.'],
  [21.0, 25.8, 'Magellan was killed in the Philippines in 1521; *Elcano* brought the Victoria home.'],
  [26.0, 30.0, 'A day is the Sun coming round to noon again.'],
  [30.2, 36.0, `Sped up: here the ship sails once round the globe while ~${DEMO.days} days~ pass in Spain.`],
  [36.2, 41.6, 'Sailing west, it moves *with* the Sun, so each of its days runs a little long.'],
  [41.8, 46.6, `Spain counts ~${HOME_END} noons~. The ship, chasing the Sun, counts only *${SHIP_END}*.`],
  [46.8, 51.6, 'However slow the voyage, one full lap westward costs exactly *one day*.'],
  [51.8, 56.6, `From 20 September 1519: ~${fmt(DAYS_ASHORE)} days~ ashore, but *${fmt(DAYS_LOG)}* in the log.`],
  [56.8, 62.2, 'Today, ships crossing the *date line* westward add a day to stay in step.'],
];

// ---------- vellum and rhumb lines, painted once ----------
let bg = null;
function paintChart() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(W * 0.45, H * 0.38, 80, W / 2, H / 2, 820);
  rad.addColorStop(0, C.vellumLight); rad.addColorStop(0.6, C.vellum); rad.addColorStop(1, C.vellumDark);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(1522);
  for (let i = 0; i < 40; i++) {
    const x = rnd() * W, y = rnd() * H, r = 30 + rnd() * 120;
    const fg = g.createRadialGradient(x, y, 0, x, y, r);
    fg.addColorStop(0, `rgba(160,110,50,${0.03 + rnd() * 0.05})`); fg.addColorStop(1, 'rgba(160,110,50,0)');
    g.fillStyle = fg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  // rhumb lines: 16 roses on a circle, each radiating 32 lines (black, green, red as on portolans)
  // (kept sparse: fine static detail is costly in every keyframe of the clip)
  const roses = [[W / 2, 430]];
  for (let i = 0; i < 8; i++) roses.push([W / 2 + Math.cos((i / 8) * TAU) * 380, 430 + Math.sin((i / 8) * TAU) * 380]);
  g.lineWidth = 1.2;
  for (const [x, y] of roses) {
    for (let j = 0; j < 16; j++) {
      const a = (j / 16) * TAU;
      g.strokeStyle = j % 4 === 0 ? 'rgba(42,32,22,0.14)' : j % 2 === 0 ? 'rgba(63,107,58,0.14)' : 'rgba(168,50,30,0.12)';
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 1200, y + Math.sin(a) * 1200); g.stroke();
    }
  }
  // border: a double frame with a checked band, like a chart's edge
  g.strokeStyle = C.ink; g.lineWidth = 2.5; g.strokeRect(26, 26, W - 52, H - 52);
  g.lineWidth = 1; g.strokeRect(38, 38, W - 76, H - 76);
  for (let x = 38, i = 0; x < W - 38; x += 18, i++) if (i % 2) { g.fillStyle = 'rgba(168,50,30,0.55)'; g.fillRect(x, 26, 18, 12); g.fillRect(x, H - 38, 18, 12); }
  for (let y = 38, i = 0; y < H - 38; y += 18, i++) if (i % 2) { g.fillStyle = 'rgba(168,50,30,0.55)'; g.fillRect(26, y, 12, 18); g.fillRect(W - 38, y, 12, 18); }
  // caption scroll band
  g.strokeStyle = C.inkSoft; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(70, 750); g.lineTo(W - 70, 750); g.stroke();
}
function header() {
  font(700, 22, CAPS); text('RECKON', 66, 84, { color: C.red, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 3 * 6;
  font(500, 24); text('History · Exploration', 66 + w + 16, 84, { color: C.inkSoft });
}

// ---------- drawing helpers ----------
function compassRose(x, y, r, rot = 0, a = 1) {
  withAlpha(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * TAU, len = i % 4 === 0 ? r : i % 2 === 0 ? r * 0.68 : r * 0.45, wd = i % 4 === 0 ? r * 0.16 : r * 0.1;
      ctx.save(); ctx.rotate(ang);
      for (const side of [-1, 1]) {
        ctx.fillStyle = side < 0 ? (i % 4 === 0 ? C.ink : i % 2 === 0 ? C.green : C.red) : C.vellumLight;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(side * wd, -len * 0.3); ctx.lineTo(0, -len); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.restore();
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, TAU); ctx.stroke();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(0, 0, r * 0.08, 0, TAU); ctx.fill();
    ctx.restore();
  });
}
function sunIcon(x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const glow = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.6);
  glow.addColorStop(0, 'rgba(233,196,106,0.55)'); glow.addColorStop(1, 'rgba(233,196,106,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, r * 2.6, 0, TAU); ctx.fill();
  ctx.fillStyle = C.gold;
  for (let i = 0; i < 12; i++) {
    ctx.save(); ctx.rotate((i / 12) * TAU);
    ctx.beginPath(); ctx.moveTo(r * 0.9, -r * 0.2); ctx.lineTo(r * (i % 2 ? 1.55 : 1.85), 0); ctx.lineTo(r * 0.9, r * 0.2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = C.goldLight; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}
/** A carrack in silhouette: hull, three masts, square sails. */
function ship(x, y, s, a = 1, flip = false) {
  withAlpha(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(-1.0, -0.12); ctx.lineTo(1.05, -0.2); ctx.lineTo(0.78, 0.22); ctx.lineTo(-0.72, 0.22); ctx.lineTo(-1.08, -0.32); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 0.05; ctx.strokeStyle = C.ink;
    for (const [mx, mh] of [[-0.55, 0.9], [0.05, 1.15], [0.55, 0.85]]) { ctx.beginPath(); ctx.moveTo(mx, -0.12); ctx.lineTo(mx, -0.12 - mh); ctx.stroke(); }
    ctx.fillStyle = C.vellumLight; ctx.strokeStyle = C.ink; ctx.lineWidth = 0.04;
    for (const [mx, w, top, h] of [[-0.55, 0.42, -0.95, 0.5], [0.05, 0.56, -1.2, 0.62], [0.05, 0.4, -0.55, 0.34], [0.55, 0.38, -0.88, 0.44]]) {
      ctx.beginPath(); ctx.moveTo(mx - w / 2, top); ctx.quadraticCurveTo(mx, top + 0.08, mx + w / 2, top); ctx.lineTo(mx + w / 2 + 0.04, top + h); ctx.quadraticCurveTo(mx, top + h + 0.1, mx - w / 2 - 0.04, top + h); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = C.red; ctx.fillRect(-0.03, -1.4, 0.24, 0.12);
    ctx.restore();
  });
}
function cartouche(x, y, w, h, title, line1, line2, { color = C.ink, a = 1 } = {}) {
  withAlpha(a, () => {
    ctx.fillStyle = C.vellumLight; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
    ctx.lineWidth = 1; ctx.strokeRect(x + 7, y + 7, w - 14, h - 14);
    font(700, 22, CAPS); text(title, x + w / 2, y + 36, { color, align: 'center', base: 'middle', spacing: '2px' });
    font(600, 40); text(line1, x + w / 2, y + 86, { color, align: 'center', base: 'middle' });
    font(500, 30); text(line2, x + w / 2, y + 128, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- A: the hook ----------
function island(x, y, s, seed) {
  const rnd = mulberry32(seed);
  ctx.beginPath();
  for (let i = 0; i <= 14; i++) { const a = (i / 14) * TAU, r = s * (0.75 + rnd() * 0.4); const px = x + Math.cos(a) * r * 1.3, py = y + Math.sin(a) * r * 0.8; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fillStyle = 'rgba(63,107,58,0.35)'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
}
function sceneA(t) {
  compassRose(170, 600, 70, 0, 0.9 * (1 - seg(t, 5.6, 6.2)));
  // the Cape Verde islands
  const isl = [[560, 300, 26, 1], [640, 270, 18, 2], [690, 330, 22, 3], [600, 370, 30, 4], [700, 410, 16, 5], [520, 400, 14, 6]];
  for (const [x, y, s, seed] of isl) island(x, y, s, seed);
  font(700, 26, CAPS); text('CAPE VERDE', 612, 222, { color: C.green, align: 'center', base: 'middle', spacing: '3px' });
  // the Victoria sails in from the left
  const sx = lerp(120, 410, eio(seg(t, 0.2, 4.6))), bob = Math.sin(t * 2.2) * 3;
  // wake
  ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
  ctx.beginPath(); ctx.moveTo(60, 380); ctx.quadraticCurveTo(sx - 120, 380, sx - 30, 372); ctx.stroke(); ctx.setLineDash([]);
  ship(sx, 360 + bob, 46);
  // the two dates
  const dp = eout(seg(t, 6.0, 6.7)), sp = eout(seg(t, 7.4, 8.1));
  const gone = 1 - seg(t, 10.4, 10.9);
  cartouche(84, 470, 330, 160, 'SHIP’S LOG', `${LOG_DAY}`, '9 July 1522', { a: dp * gone });
  cartouche(450, 470, 330, 160, 'ASHORE', `${SHORE_DAY}`, '10 July 1522', { color: C.red, a: sp * gone });
  // Pigafetta's journal: every day written down
  const jp = eout(seg(t, 10.6, 11.2));
  withAlpha(jp * (1 - seg(t, 14.6, 15.1)), () => {
    ctx.fillStyle = C.vellumLight; ctx.fillRect(84, 470, 696, 236); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(84, 470, 696, 236);
    font(700, 22, CAPS); text('THE JOURNAL', W / 2, 500, { color: C.inkSoft, align: 'center', base: 'middle', spacing: '3px' });
    for (let i = 0; i < 4; i++) {
      const jd = LOG_JD - 3 + i;
      const q = eout(seg(t, 11.0 + i * 0.5, 11.5 + i * 0.5));
      withAlpha(q, () => {
        font(500, 32); text(`${wday(jd)}, ${6 + i} July 1522`, 140, 548 + i * 44, { base: 'middle' });
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(660, 548 + i * 44); ctx.lineTo(676, 560 + i * 44); ctx.lineTo(704, 532 + i * 44); ctx.stroke();
      });
    }
  });
}

// ---------- the globe ----------
function globe({ night = null, dateLine = 0 } = {}) {
  const { cx, cy, R } = G;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fillStyle = C.vellumLight; ctx.fill();
  ctx.fillStyle = C.sea; ctx.fill();
  ctx.clip();
  // meridians every 30° and latitude rings
  ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 1.2;
  for (let lon = 0; lon < 360; lon += 30) { const [x, y] = P(lon, -60); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); }
  for (const lat of [60, 30, -30]) { ctx.beginPath(); ctx.arc(cx, cy, rOf(lat), 0, TAU); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(168,50,30,0.55)'; ctx.setLineDash([10, 8]); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, rOf(0), 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  if (dateLine > 0) withAlpha(dateLine, () => {
    const [x, y] = P(180, -60);
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
  });
  // night: the half turned away from the Sun
  if (night !== null) {
    const a = night * DEG; // the Sun's longitude
    const dx = Math.sin(a), dy = Math.cos(a);
    ctx.fillStyle = C.night;
    ctx.beginPath();
    const base = Math.atan2(dy, dx);
    ctx.arc(cx, cy, R + 2, base + Math.PI / 2, base + Math.PI * 1.5); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R + 8, 0, TAU); ctx.stroke();
  // the pole
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, TAU); ctx.fill();
}
function placeMark(lon, lat, name, { color = C.ink, dx = 0, dy = -22, a = 1, size = 24, align = 'center' } = {}) {
  withAlpha(a, () => {
    const [x, y] = P(lon, lat);
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.vellumLight; ctx.lineWidth = 2; ctx.stroke();
    if (name) { font(600, size); text(name, x + dx, y + dy, { color, align, base: 'middle' }); }
  });
}

// ---------- B: the route ----------
function sceneB(t) {
  globe();
  font(500, 22); withAlpha(eout(seg(t, 15.2, 15.8)), () => text('diagram: the globe seen from above the North Pole', W / 2, 140, { color: C.inkSoft, align: 'center', base: 'middle' }));
  const f = eio(seg(t, 16.0, 25.0));
  // the track so far
  ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  const steps = 160;
  for (let j = 0; j <= steps * f; j++) { const p = routeAt(j / steps); const [x, y] = P(p.lon, p.lat); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  const lab = { Spain: [0, -24], Strait: [-50, 0], Philippines: [-8, -26], Moluccas: [-58, 18], 'Good Hope': [40, 30], 'Cape Verde': [-30, 30] };
  const total = ROUTE_LEN.at(-1);
  ROUTE.forEach((p, i) => {
    if (!p.name) return;
    const reached = ROUTE_LEN[i] / total;
    const a = eout(seg(f, reached - 0.02, reached + 0.03)) * (i === 0 ? 1 : 1);
    const [dx, dy] = lab[p.name];
    placeMark(p.lon, p.lat, p.name, { a: i === 0 ? 1 : a, dx, dy, color: p.name === 'Cape Verde' ? C.red : C.ink });
  });
  // Magellan's death in the Philippines: a small cross and a date
  const iPh = ROUTE.findIndex((p) => p.name === 'Philippines');
  const ph = eout(seg(f, ROUTE_LEN[iPh] / total, ROUTE_LEN[iPh] / total + 0.06));
  withAlpha(ph, () => {
    const [x, y] = P(ROUTE[iPh].lon, ROUTE[iPh].lat);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 52, y - 66); ctx.lineTo(x + 52, y - 40); ctx.moveTo(x + 43, y - 58); ctx.lineTo(x + 61, y - 58); ctx.stroke();
    font(600, 22); text('Magellan, April 1521', x + 70, y - 52, { align: 'left', base: 'middle' });
  });
  // the ship rides along the track
  const p = routeAt(f);
  const [x, y] = P(p.lon, p.lat);
  ship(x, y - 14, 20);
  // the year
  // the latest dated event passed (dates from the source)
  const passed = (name) => f >= ROUTE_LEN[ROUTE.findIndex((q) => q.name === name)] / total - 0.02;
  const label = passed('Cape Verde') ? 'JULY 1522' : passed('Moluccas') ? 'DEC 1521' : passed('Philippines') ? 'APRIL 1521' : 'SEPT 1519';
  font(700, 34, CAPS); text(label, 84, 690, { color: C.red, base: 'middle', spacing: '2px' });
  withAlpha(seg(t, 21.2, 21.8), () => { font(500, 24); text('the Victoria, under Elcano', 84, 722, { color: C.inkSoft, base: 'middle' }); });
  compassRose(746, 650, 46, 0, 0.9);
}

// ---------- C: why a day goes missing ----------
function counter(x, y, title, n, color, pulse) {
  ctx.fillStyle = 'rgba(247,235,210,0.94)'; ctx.fillRect(x - 110, y - 50, 220, 108);
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.strokeRect(x - 110, y - 50, 220, 108);
  font(700, 22, CAPS); text(title, x, y - 24, { color, align: 'center', base: 'middle', spacing: '2px' });
  ctx.save(); ctx.translate(x, y + 22); ctx.scale(1 + 0.18 * pulse, 1 + 0.18 * pulse);
  font(700, 44, CAPS); text(`${n} ${n === 1 ? 'noon' : 'noons'}`, 0, 0, { color, align: 'center', base: 'middle' });
  ctx.restore();
}
function sceneC(t) {
  // the Sun: one slow turn first (26–30), then the sped-up demonstration
  let sLon, d = 0;
  if (t < DEMO.a) sLon = SPAIN.lon + DEMO.lead + 360 * (1 - eio(seg(t, 26.2, 30.0)));
  else { d = demoDays(t); sLon = sunLon(d); }
  globe({ night: sLon });
  const [sx, sy] = P(sLon, 0, G.R + 46);
  sunIcon(sx, sy, 20, t * 0.4);
  // a line from the Sun to the pole marks the meridian where it is noon
  ctx.strokeStyle = 'rgba(184,134,43,0.75)'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(G.cx, G.cy); ctx.stroke(); ctx.setLineDash([]);
  font(600, 22); text('noon', sx, sy - 34, { color: C.gold, align: 'center', base: 'middle' });
  // Spain
  placeMark(SPAIN.lon, SPAIN.lat, 'Spain', { dx: 0, dy: -24 });
  // the ship, on its lap
  const demoOn = seg(t, DEMO.a - 0.6, DEMO.a);
  const shipLon = t < DEMO.a ? SPAIN.lon : shipLonDemo(d);
  const lat = 8;
  withAlpha(demoOn, () => {
    if (t >= DEMO.a) {
      ctx.strokeStyle = 'rgba(168,50,30,0.6)'; ctx.lineWidth = 3; ctx.beginPath();
      const n = Math.max(1, Math.round(90 * (d / DEMO.days)));
      for (let j = 0; j <= n; j++) { const [x, y] = P(SPAIN.lon - 360 * (d / DEMO.days) * (j / n), lat); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    const [x, y] = P(shipLon, lat);
    ship(x, y - 12, 18);
  });
  // counters, with a pulse at each new noon
  const hn = t >= DEMO.a ? homeNoons(d) : 0, sn = t >= DEMO.a ? shipNoons(d) : 0;
  const pulseOf = (fn) => { if (t < DEMO.a) return 0; for (let back2 = 0; back2 < 0.3; back2 += 0.02) { const dd = demoDays(t - back2); if (t - back2 >= DEMO.a && fn(dd) !== fn(demoDays(t - back2 - 0.02))) return 1 - back2 / 0.3; } return 0; };
  withAlpha(demoOn, () => {
    counter(186, 180, 'SPAIN', hn, C.green, pulseOf(homeNoons));
    counter(668, 180, 'THE SHIP', sn, C.red, pulseOf(shipNoons));
  });
  // the noon flash at Spain during the first, slow turn
  if (t < DEMO.a) {
    const rel = ((sLon - SPAIN.lon) % 360 + 360) % 360;
    const near = clamp(1 - Math.min(rel, 360 - rel) / 14);
    if (near > 0) withAlpha(near, () => { const [x, y] = P(SPAIN.lon, SPAIN.lat); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 16, 0, TAU); ctx.stroke(); });
  }
  // the verdict
  withAlpha(eout(seg(t, 46.8, 47.4)), () => {
    ctx.save(); ctx.translate(W / 2, 700); const s = 0.9 + 0.1 * back(seg(t, 46.8, 47.3)); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(247,235,210,0.95)'; ctx.fillRect(-250, -30, 500, 60); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.strokeRect(-250, -30, 500, 60);
    font(700, 28, CAPS); text('ONE LAP WEST = ONE DAY', 0, 2, { color: C.red, align: 'center', base: 'middle', spacing: '1px' });
    ctx.restore();
  });
}

// ---------- D: the real voyage, and the date line ----------
function sceneD(t) {
  const run = eio(seg(t, 52.0, 55.2));
  const a = Math.round(DAYS_ASHORE * run), b = Math.round(DAYS_LOG * run);
  const out = eio(seg(t, 56.6, 57.3));
  withAlpha(1 - out, () => {
    font(500, 26); text('20 September 1519 to Cape Verde, July 1522', W / 2, 170, { color: C.inkSoft, align: 'center', base: 'middle' });
    cartouche(84, 230, 330, 200, 'DAYS ASHORE', fmt(a), `to ${SHORE_DAY} 10 July`, { color: C.green });
    cartouche(450, 230, 330, 200, 'DAYS IN THE LOG', fmt(b), `to ${LOG_DAY} 9 July`, { color: C.red });
    ship(W / 2, 560 + Math.sin(t * 2) * 3, 40);
  });
  // the date line: a ship crossing it westbound gains a date
  const dl = eout(seg(t, 57.0, 57.8));
  if (dl > 0) withAlpha(dl, () => {
    globe({ dateLine: 1 });
    const [lx, ly] = P(180, -40);
    font(700, 24, CAPS); text('DATE LINE', lx - 16, ly + 40, { color: C.red, align: 'right', base: 'middle', spacing: '2px' });
    const f = eio(seg(t, 58.0, 61.0));
    const lon = lerp(-150, -210, f), lat = 10;
    const [x, y] = P(lon, lat);
    ship(x, y - 12, 20);
    const crossed = lon < -180;
    withAlpha(seg(f, 0.5, 0.62), () => {
      font(700, 34, CAPS); text('+1 DAY', x, y + 34, { color: C.red, align: 'center', base: 'middle' });
    });
    font(500, 24); text(crossed ? 'westbound: the date goes forward' : 'heading west', W / 2, 700, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 54, weight: 600, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.red, '~': C.green } });
  }
}

Kit.scene({
  width: W, height: H, duration: 62.4,
  fonts: [
    { family: CAPS, file: 'Cinzel.woff2', weight: '400 900' },
    { family: TEXT, file: 'EBGaramond.woff2', weight: '400 800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintChart();
    ctx.drawImage(bg, 0, 0);
    header();
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
