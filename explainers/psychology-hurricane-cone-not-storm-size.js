// Explainer for psychology-hurricane-cone-not-storm-size: what the hurricane forecast cone shows and why people
// misread it, told through Hurricane Isaias in October 2026. Look: a forecaster's chart at night, deep sea teal with
// a dark olive coast, the cone in translucent white, the forecast track in yellow, past misses as coral dots and the
// storm's winds as a violet halo. Noto Sans for captions and labels, Fraunces (a soft display serif) for headings.
//
// Facts: NHC, "Definition of the NHC Track Forecast Cone": the cone represents the probable track of the centre of
// a tropical cyclone, formed by the area swept by circles along the forecast track at 12, 24, 36, 48, 60, 72, 96 and
// 120 hours; each circle is sized so that two-thirds of historical official forecast errors over a 5-year sample
// fall within it; 2026 Atlantic radii from 2021–2025 errors: 25, 39, 49, 62, 77, 95, 134, 200 nautical miles.
// NHC Isaias advisories (6–10 October 2026): Tropical Depression Nine on 6 October, Tropical Storm Isaias on
// 7 October, Hurricane Isaias on 8 October; landfall as a 90-kt hurricane near Destin, Florida, at 0130 UTC on
// 10 October (8:30 PM CDT on 9 October); advisory 13 (4 PM CDT 9 October): maximum sustained winds 115 mph
// (185 km/h), hurricane-force winds up to 35 miles (55 km) from the centre and tropical-storm-force winds up to
// 205 miles (335 km). NHC 2026 Atlantic archive: Isaias was the season's first hurricane. Ray, Merle and Johnson,
// "Uncertain about the New Cone? How Nonexperts Perceive NHC's Experimental Track-Forecast Product", Weather,
// Climate, and Society 18(3), 2026: an online experiment with 398 residents of Florida and Georgia; those shown
// the cone with inland watches and warnings rated their ability to identify the storm's size higher, though the
// graphic doesn't show it; FSU news (11 August 2026): "people often mistake a wider cone for a bigger storm";
// the researchers suggest using the cone with local forecasts and impact information.
// 1 nautical mile = 1.852 km. The misses drawn here are simulated, scaled so two-thirds fall inside each circle.
//
// Scene plan (64.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Isaias and the cone.
//  B  9.2–18.4  The misreading: a wider cone, a bigger storm?
//  C 18.4–41.4  How it's built: past misses, a circle with two-thirds, circles that grow, the cone; one in three.
//  D 41.4–50.6  The storm is bigger: winds to 335 km.
//  E 50.6–64.4  The 2026 study; read the cone for the eye.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  sea: '#0b2733', sea2: '#123a49', land: '#34412d', land2: '#4a5a3c', ink: '#eef5f7', soft: 'rgba(238,245,247,0.74)', faint: 'rgba(238,245,247,0.30)',
  cone: 'rgba(255,255,255,0.20)', coneEdge: 'rgba(255,255,255,0.85)', track: '#ffd84d', miss: '#ff7f66', wind: 'rgba(181,140,255,0.30)', windEdge: '#b58cff',
  panel: 'rgba(6,24,31,0.86)',
};
const SANS = 'Noto Sans', SERIF = 'Fraunces';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers (NHC) ----------
const NM = 1.852;
const HOURS = [0, 12, 24, 36, 48, 60, 72, 96, 120];
const RADII_NM = [0, 25, 39, 49, 62, 77, 95, 134, 200];
const RADII_KM = RADII_NM.map((r) => r * NM);
const WIND_TS_KM = 335, WIND_H_KM = 55, STUDY_N = 398;
const km = (v) => Math.round(v);
const PX = 0.42; // px per km, so radii, and the storm's winds, are to scale with each other

// forecast track: schematic, from the lower left to the upper right
const P0 = { x: 150, y: 600 }, P1 = { x: 630, y: 350 };
const at = (h) => ({ x: lerp(P0.x, P1.x, h / 120), y: lerp(P0.y, P1.y, h / 120) });
const radiusAt = (h) => { for (let i = 1; i < HOURS.length; i++) if (h <= HOURS[i]) return lerp(RADII_KM[i - 1], RADII_KM[i], (h - HOURS[i - 1]) / (HOURS[i] - HOURS[i - 1])) * PX; return RADII_KM.at(-1) * PX; };

/** Simulated misses around a forecast point: n dots, scaled so that exactly two-thirds lie inside radius r. */
function misses(n, r, seed) {
  let s = seed; const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts = Array.from({ length: n }, () => { const a = rand() * Math.PI * 2, d = Math.sqrt(-2 * Math.log(1 - rand() * 0.999)); return { a, d }; });
  const sorted = [...pts].map((p) => p.d).sort((a, b) => a - b), q = sorted[Math.ceil((2 * n) / 3) - 1];
  return pts.map((p) => ({ dx: Math.cos(p.a) * (p.d / q) * r, dy: Math.sin(p.a) * (p.d / q) * r * 0.999, inside: p.d <= q }));
}
const MISSES = misses(60, 1, 11);

const CUES = [
  [0.4, 4.6, 'On 9 October 2026, Hurricane Isaias, the Atlantic’s first of the year, struck Florida near Destin.'],
  [4.8, 9.0, 'For days, the US National Hurricane Center had mapped its path with a famous shape: the *cone*.'],
  [9.2, 13.6, 'Many people read a wider cone as a ~bigger storm~. That isn’t what it shows.'],
  [13.8, 18.2, 'The cone shows where the storm’s *centre*, its eye, will probably go. Here is how it’s built.'],
  [18.4, 22.8, 'Take five years of forecasts, and mark where each storm’s centre really was a day later.'],
  [23.0, 27.4, `Two-thirds of those misses were within *${km(RADII_KM[2])} km* of the forecast point, 24 hours ahead.`],
  [27.6, 32.0, 'Draw that circle: the centre should end up inside it about *2 times in 3*.'],
  [32.2, 36.6, `Further ahead, forecasts miss by more. At five days, the circle’s radius is *${km(RADII_KM.at(-1))} km*.`],
  [36.8, 41.2, 'Join the circles along the forecast track, and you have the cone. Its width is ~uncertainty~.'],
  [41.4, 45.8, `And a storm is far bigger than its eye: Isaias had tropical-storm-force winds *${WIND_TS_KM} km* out.`],
  [46.0, 50.4, 'So danger reaches well outside the cone, and the centre misses its circle about one time in three.'],
  [50.6, 55.0, `In a 2026 study, ${STUDY_N} people in Florida and Georgia saw either the cone or a newer version of it.`],
  [55.2, 59.6, 'Those shown the newer cone felt *better able* to judge the storm’s size, which neither map shows.'],
  [59.8, 64.2, 'The researchers’ advice: use the cone alongside local forecasts, which say what will reach you.'],
];

// ---------- background: a chart of sea and coast ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sea2); lg.addColorStop(1, C.sea);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // a schematic coast across the top
  g.fillStyle = C.land;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 170);
  for (let x = 0; x <= W; x += 12) g.lineTo(x, 170 + Math.sin(x / 70) * 18 + Math.sin(x / 23) * 6 + (x > 520 ? (x - 520) * 0.05 : 0));
  g.lineTo(W, 0); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(238,245,247,0.06)'; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 54) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 760); g.stroke(); }
  for (let y = 0; y <= 760; y += 54) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

// ---------- drawing helpers ----------
function storm(x, y, s = 1, spin = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin); ctx.scale(s, s);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 2; i++) { ctx.rotate(Math.PI); ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 0.9); ctx.stroke(); }
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
/** The cone's outline as a path: the circles' outer edges on both sides of the track, round at the far end. */
function conePath(upTo) {
  const dir = { x: P1.x - P0.x, y: P1.y - P0.y }, len = Math.hypot(dir.x, dir.y), nx = -dir.y / len, ny = dir.x / len;
  const ang = Math.atan2(ny, nx);
  ctx.beginPath();
  for (let h = 0; h <= upTo; h += 2) { const p = at(h), r = Math.max(1.5, radiusAt(h)); const x = p.x + nx * r, y = p.y + ny * r; h ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  const pe = at(upTo); ctx.arc(pe.x, pe.y, Math.max(1.5, radiusAt(upTo)), ang, ang - Math.PI, true);
  for (let h = upTo; h >= 0; h -= 2) { const p = at(h), r = Math.max(1.5, radiusAt(h)); ctx.lineTo(p.x - nx * r, p.y - ny * r); }
  ctx.closePath();
}
function cone(upTo = 120, alpha = 1) {
  if (upTo <= 0) return;
  A(alpha, () => { conePath(upTo); ctx.fillStyle = C.cone; ctx.fill(); });
}
function coneOutline(upTo = 120) {
  conePath(upTo); ctx.strokeStyle = C.coneEdge; ctx.lineWidth = 2; ctx.stroke();
}
function track(upTo = 120) {
  ctx.strokeStyle = C.track; ctx.lineWidth = 4; ctx.setLineDash([2, 10]); ctx.lineCap = 'round';
  const a = at(0), b = at(upTo); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = C.track;
  for (const h of HOURS) if (h <= upTo) { const p = at(h); ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill(); }
}

// ---------- A: the hook ----------
function hook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 24); text('schematic chart', 40, 220, { color: C.faint, align: 'left' });
    const g = eio(seg(t, 0.4, 3.2));
    // the storm moves to the coast
    const sx = lerp(260, 470, g), sy = lerp(640, 200, g);
    if (t < 4.8) {
      storm(sx, sy, 1.6, t * 2);
      A(seg(t, 2.6, 3.2), () => {
        ctx.fillStyle = C.panel; k.rrect(500, 250, 320, 112, 18); ctx.fill();
        font(700, 34, SERIF); text('Hurricane Isaias', 660, 290, { align: 'center' });
        font(500, 22); text('landfall near Destin, Florida', 660, 330, { color: C.soft, align: 'center' });
      });
    } else {
      cone(120 * eio(seg(t, 5.0, 7.4)));
      track(120 * eio(seg(t, 5.0, 7.4)));
      storm(at(0).x, at(0).y, 1.2, t * 2);
      A(seg(t, 7.2, 7.8), () => { font(700, 34, SERIF); text('the forecast cone', 600, 560, { color: C.ink, align: 'center' }); });
    }
  });
}

// ---------- B: the misreading ----------
function misread(t) {
  const a = span(t, 9.2, 18.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    cone(120); coneOutline(120); track(120);
    if (t < 13.8) {
      // a storm swelling to fill the cone: the wrong reading
      const grow = eio(seg(t, 9.8, 11.6));
      [24, 72, 120].forEach((h) => {
        const p = at(h);
        ctx.strokeStyle = C.miss; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
        ctx.beginPath(); ctx.arc(p.x, p.y, radiusAt(h) * grow, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      });
      A(seg(t, 11.6, 12.2), () => {
        ctx.fillStyle = C.panel; k.rrect(80, 640, 380, 64, 16); ctx.fill();
        font(700, 26); text('“the storm will grow”', 270, 672, { color: C.miss, align: 'center' });
        ctx.strokeStyle = C.miss; ctx.lineWidth = 6;
        const x = eio(seg(t, 12.6, 13.2));
        ctx.beginPath(); ctx.moveTo(96, 690); ctx.lineTo(lerp(96, 444, x), lerp(690, 654, x)); ctx.stroke();
      });
    } else {
      // the eye's possible paths
      for (let i = -3; i <= 3; i++) {
        ctx.strokeStyle = `rgba(255,216,77,${0.55 - Math.abs(i) * 0.12})`; ctx.lineWidth = 3;
        ctx.beginPath();
        for (let h = 0; h <= 120; h += 4) { const p = at(h), r = radiusAt(h) * (i / 3) * 0.8; const dir = { x: -(P1.y - P0.y), y: P1.x - P0.x }, l = Math.hypot(dir.x, dir.y); const x = p.x + (dir.x / l) * r, y = p.y + (dir.y / l) * r; h ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      }
      storm(at(0).x, at(0).y, 1.2, t * 2);
      A(seg(t, 14.4, 15.0), () => { font(700, 26); text('possible paths of the eye', 560, 600, { color: C.track, align: 'center' }); });
    }
  });
}

// ---------- C: how it is built ----------
const P24 = { x: 432, y: 430 };
function built(t) {
  const a = span(t, 18.4, 32.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const R = radiusAt(24) * 3.4; // zoomed in: 3.4 times the chart scale
    font(700, 30, SERIF); text('24 hours ahead, zoomed in', W / 2, 250, { align: 'center' });
    font(500, 20); text('dots: simulated misses, spread like the real ones', W / 2, 288, { color: C.soft, align: 'center' });
    // the forecast point
    ctx.fillStyle = C.track; ctx.beginPath(); ctx.arc(P24.x, P24.y, 9, 0, Math.PI * 2); ctx.fill();
    const shown = Math.floor(MISSES.length * eio(seg(t, 18.8, 21.6)));
    MISSES.slice(0, shown).forEach((m) => {
      const lit = t > 23.4 ? (m.inside ? 1 : 0.45) : 1;
      ctx.globalAlpha = lit; ctx.fillStyle = C.miss; ctx.beginPath(); ctx.arc(P24.x + m.dx * R, P24.y + m.dy * R, 6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    });
    // the two-thirds circle
    const g = eio(seg(t, 23.4, 25.0));
    if (g > 0) {
      ctx.strokeStyle = C.coneEdge; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(P24.x, P24.y, R * g, 0, Math.PI * 2); ctx.stroke();
      A(seg(t, 25.0, 25.6), () => {
        ctx.strokeStyle = C.coneEdge; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P24.x, P24.y); ctx.lineTo(P24.x + R, P24.y); ctx.stroke();
        font(700, 26); text(`${km(RADII_KM[2])} km`, P24.x, P24.y + R + 30, { align: 'center' });
        font(500, 20); text(`(${RADII_NM[2]} nautical miles)`, P24.x, P24.y + R + 62, { color: C.soft, align: 'center' });
      });
    }
    A(seg(t, 27.8, 28.4), () => {
      const inside = MISSES.filter((m) => m.inside).length;
      ctx.fillStyle = C.panel; k.rrect(170, 660, 524, 70, 16); ctx.fill();
      font(700, 28); text(`${inside} of ${MISSES.length} inside: 2 in 3`, W / 2, 695, { color: C.ink, align: 'center' });
    });
  });
}
function growing(t) {
  const a = span(t, 32.2, 41.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 20); text('circles and cone to scale; track schematic', 40, 220, { color: C.faint, align: 'left' });
    const n = t < 36.8 ? Math.floor(HOURS.length * eio(seg(t, 32.4, 35.0))) : HOURS.length;
    if (t > 36.8) { cone(120, eio(seg(t, 37.0, 38.6))); }
    for (let i = 1; i < n; i++) {
      const p = at(HOURS[i]), r = RADII_KM[i] * PX;
      ctx.strokeStyle = t > 36.8 ? 'rgba(255,255,255,0.35)' : C.coneEdge; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
      if (t < 36.8 && (HOURS[i] === 24 || HOURS[i] === 72 || HOURS[i] === 120)) {
        font(600, 20); text(`${HOURS[i]} h: ${km(RADII_KM[i])} km`, p.x, p.y + r + 22, { color: C.soft, align: 'center' });
      }
    }
    if (t > 37.6) coneOutline(120);
    track(120);
    storm(at(0).x, at(0).y, 1.1, t * 2);
  });
}

// ---------- D: the storm is bigger ----------
function bigger(t) {
  const a = span(t, 41.4, 50.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 20); text('to scale: the cone near the start, and Isaias’s winds', 40, 220, { color: C.faint, align: 'left' });
    cone(48); coneOutline(48); track(48);
    const p = at(0), g = eout(seg(t, 41.8, 43.6));
    ctx.fillStyle = C.wind; ctx.strokeStyle = C.windEdge; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.x + 60, p.y - 30, WIND_TS_KM * PX * g, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(181,140,255,0.45)'; ctx.beginPath(); ctx.arc(p.x + 60, p.y - 30, WIND_H_KM * PX * g, 0, Math.PI * 2); ctx.fill();
    storm(p.x + 60, p.y - 30, 1.1, t * 2);
    A(seg(t, 43.6, 44.2), () => {
      ctx.fillStyle = C.panel; k.rrect(430, 610, 400, 100, 16); ctx.fill();
      font(700, 22); text(`tropical-storm-force winds: ${WIND_TS_KM} km`, 630, 642, { color: C.windEdge, align: 'center' });
      font(500, 20); text(`hurricane-force: up to ${WIND_H_KM} km (NHC, 9 Oct)`, 630, 678, { color: C.soft, align: 'center' });
    });
    if (t > 46.0) A(seg(t, 46.2, 46.8), () => {
      // a center that ends up outside
      const q = at(48), r = radiusAt(48);
      ctx.strokeStyle = C.miss; ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(at(24).x, at(24).y); ctx.quadraticCurveTo(q.x - 40, q.y - r * 0.4, q.x + r * 0.6, q.y - r * 1.25); ctx.stroke(); ctx.setLineDash([]);
      storm(q.x + r * 0.6, q.y - r * 1.25, 0.8, t * 2);
      font(600, 22); text('1 time in 3: outside', q.x + r * 0.6 + 34, q.y - r * 1.25, { color: C.miss, align: 'left' });
    });
  });
}

// ---------- E: the study ----------
function study(t) {
  const a = span(t, 50.6, 59.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 30, SERIF); text(`${STUDY_N} people in Florida and Georgia, 2026`, W / 2, 250, { align: 'center' });
    font(500, 20); text('Weather, Climate, and Society, Florida State University', W / 2, 290, { color: C.soft, align: 'center' });
    // two little maps
    const maps = [{ x: 240, label: 'the cone' }, { x: 624, label: 'cone + inland warnings' }];
    maps.forEach((m, i) => {
      const g = eout(seg(t, 51.0 + i * 0.4, 51.6 + i * 0.4));
      A(g, () => {
        ctx.fillStyle = 'rgba(52,65,45,0.9)'; k.rrect(m.x - 150, 340, 300, 200, 14); ctx.fill();
        ctx.fillStyle = C.sea; ctx.fillRect(m.x - 150, 440, 300, 100);
        ctx.fillStyle = C.cone; ctx.beginPath(); ctx.moveTo(m.x - 10, 530); ctx.lineTo(m.x - 100, 360); ctx.lineTo(m.x + 100, 360); ctx.lineTo(m.x + 10, 530); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = C.coneEdge; ctx.lineWidth = 2; ctx.stroke();
        if (i) { ctx.strokeStyle = '#ff5a5a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(m.x - 150, 440); ctx.lineTo(m.x + 150, 440); ctx.stroke(); ctx.fillStyle = 'rgba(255,90,90,0.25)'; ctx.fillRect(m.x - 120, 360, 240, 76); }
        font(600, 22); text(m.label, m.x, 572, { color: C.ink, align: 'center' });
      });
    });
    A(seg(t, 55.4, 56.0), () => {
      ctx.fillStyle = C.panel; k.rrect(120, 610, 624, 110, 16); ctx.fill();
      font(700, 24); text('rated themselves better at judging storm size:', W / 2, 645, { color: C.ink, align: 'center' });
      font(700, 24); text('the newer map’s viewers', W / 2, 682, { color: C.track, align: 'center' });
    });
  });
}
function advice(t) {
  const a = eout(seg(t, 59.8, 60.4));
  if (a <= 0) return;
  A(a, () => {
    cone(120); coneOutline(120); track(120);
    storm(at(0).x, at(0).y, 1.2, t * 2);
    ctx.fillStyle = C.panel; k.rrect(420, 560, 400, 140, 16); ctx.fill();
    font(700, 26, SERIF); text('cone: where the eye may go', 620, 600, { color: C.ink, align: 'center' });
    font(500, 22); text('local forecasts and warnings:', 620, 642, { color: C.soft, align: 'center' });
    text('what will reach you', 620, 672, { color: C.soft, align: 'center' });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.4, fonts: [SANS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    hook(t);
    misread(t);
    built(t);
    growing(t);
    bigger(t);
    study(t);
    advice(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.track, '~': C.miss } });
  },
});
