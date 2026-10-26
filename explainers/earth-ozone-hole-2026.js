// Explainer for earth-ozone-hole-2026: why the Antarctic ozone hole opens every southern spring, and what the
// 2026 season looks like. Look: polar night in deep navy, the ozone layer as a violet-blue band, polar
// stratospheric clouds in their mother-of-pearl pinks and greens, chlorine in acid green, the returning Sun in
// gold. Outfit (crisp geometric sans) for numbers and labels, Alegreya Sans for captions.
//
// Facts: NOAA CSL, "Twenty Questions and Answers About the Ozone Layer: 2022 Update" (Q10 and others): the
// hole needs temperatures low enough for polar stratospheric clouds (below about −78 °C; Antarctic daily
// minimum temperatures average as low as −92 °C in July and August), air isolated in the polar vortex,
// sunlight and enough chlorine; on the cloud particles the reservoir gases HCl and ClONO2 are converted almost
// completely into reactive chlorine (ClO); its catalytic cycles run when sunlight returns, and one chlorine
// atom can destroy many thousands of ozone molecules; inside the hole total ozone falls to about 120 Dobson
// units, a third of the springtime values of about 350 DU in the early 1970s; the hole is the area below
// 220 DU, and it disappears in November–December as the vortex winds weaken. CAMS, "Ozone hole reaches notable
// threshold early again as area increases above average in 2026" (16 September 2026): 15 million km² by the
// end of August (Antarctica: 14.2 million km²), an estimated 25 million km² on 12 September, about 5 million
// above the average for the period, coinciding with a sudden drop in the minimum temperature about 20 km above
// the South Pole; the ozone column minimum and the ozone mass deficit stayed close to average; the record is
// 29.6 million km² on 9 September 2006. NOAA GML, Ozone Depleting Gas Index (2024 update): at the start of
// 2024 the reactive halogen in the Antarctic stratosphere had fallen 28% of the way from its peak to its 1980
// value. WMO (9 January 2023), on the 2022 assessment: back to 1980 values around 2066 over the Antarctic; the
// hole has been slowly improving in area and depth since 2000.
//
// The map is computed to scale: the hole's circle has the same area, relative to the drawn Antarctica, as
// 25 million km² has to 14.2 million.
//
// Scene plan (64.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  The 2026 hole on the map: 25 million km², about 5 million above average.
//  B  9.0–41.2  How it opens: ozone, the vortex, −78 °C clouds, chlorine freed, sunlight, a third left.
//  C 41.2–50.4  2026: a sudden cold spell; other measures near average.
//  D 50.4–64.4  Recovery: chlorine 28% of the way back; slowly smaller since 2000; around 2066.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  night: '#0a1430', night2: '#17284f', ink: '#eef4ff', soft: 'rgba(238,244,255,0.74)', faint: 'rgba(238,244,255,0.34)',
  ozone: '#8fb8ff', ozoneSoft: 'rgba(143,184,255,0.25)', hole: '#7a3fb0', ice: '#dfe9f5', ice2: '#b8c8dc',
  pink: '#ff9ad5', mint: '#9dffcf', cl: '#c8f04a', sun: '#ffd27a', warm: '#ff8f6b', panel: 'rgba(8,16,40,0.82)',
};
const NUM = 'Outfit', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers ----------
const ANT = 14.2, HOLE = 25, AUG = 15, ABOVE = 5, USUAL = HOLE - ABOVE, RECORD = 29.6; // million km²
const PSC = -78, WINTER_MIN = -92, DU_1970 = 350, DU_HOLE = 120, DU_LINE = 220;
const ODGI_2024 = 72, BACK = 2066;

// ---------- Antarctica, a simplified outline in polar view (Greenwich up) ----------
const OUTLINE = (() => {
  const pts = [];
  for (let i = 0; i < 180; i++) {
    const th = (i / 180) * Math.PI * 2; // clockwise from the top
    const d = (a) => { const x = Math.atan2(Math.sin(th - a), Math.cos(th - a)); return x; };
    let r = 1 + 0.06 * Math.sin(th * 3 + 0.5) + 0.04 * Math.sin(th * 7);
    r -= 0.32 * Math.exp(-(d(3.35) ** 2) / 0.05); // the Ross Sea
    r -= 0.3 * Math.exp(-(d(5.55) ** 2) / 0.04); // the Weddell Sea
    r += 0.55 * Math.exp(-(d(5.0) ** 2) / 0.006); // the Antarctic Peninsula
    r -= 0.08 * Math.exp(-(d(1.6) ** 2) / 0.03);
    pts.push([Math.sin(th) * r, -Math.cos(th) * r]);
  }
  return pts;
})();
const OUT_AREA = OUTLINE.reduce((s, p, i) => { const q = OUTLINE[(i + 1) % OUTLINE.length]; return s + (p[0] * q[1] - q[0] * p[1]) / 2; }, 0);
const MAP = { x: W / 2, y: 470, s: 150 }; // Antarctica drawn at this scale
const kmR = (mkm2) => MAP.s * Math.sqrt((Math.abs(OUT_AREA) * mkm2) / ANT / Math.PI); // radius of a circle of that area

const CUES = [
  [0.4, 4.6, 'On 12 September 2026, the ozone hole over Antarctica covered about *25 million km²*.'],
  [4.8, 9.0, `That is about ~${ABOVE} million km²~ more than usual for the date, and ${(HOLE / ANT).toFixed(1)} times Antarctica.`],
  [9.2, 13.6, 'High in the stratosphere, ozone absorbs much of the Sun’s harmful *ultraviolet* light.'],
  [13.8, 18.2, 'Each winter a ring of strong winds, the *polar vortex*, walls off the air over Antarctica.'],
  [18.4, 22.8, 'In the dark it gets colder than ~−78 °C~, and thin *polar stratospheric clouds* form.'],
  [23.0, 27.4, 'On those clouds, chlorine from *CFCs* breaks out of harmless compounds, ready to react.'],
  [27.6, 32.0, 'When the *Sun* returns in spring, its light sets the chlorine to work on the ozone.'],
  [32.2, 36.6, 'One chlorine atom can destroy *many thousands* of ozone molecules.'],
  [36.8, 41.2, 'Inside the hole, ozone can fall to about ~a third~ of its level in the early 1970s.'],
  [41.4, 45.8, 'This year, the hole’s fast growth came with a sudden *drop in temperature* 20 km up.'],
  [46.0, 50.4, 'But other measures, such as the *lowest ozone* inside it, stayed close to average.'],
  [50.6, 55.0, 'Since CFCs were phased out, chlorine there has fallen ~28%~ of the way back to 1980 levels.'],
  [55.2, 59.6, 'The hole has slowly improved since 2000, though it still changes a lot from year to year.'],
  [59.8, 64.2, 'The UN’s assessment expects the ozone over Antarctica back to *1980 levels* around ~2066~.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.night); lg.addColorStop(1, C.night2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 17; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(220,230,255,${0.05 + r() * 0.3})`; const d = r() < 0.9 ? 1.2 : 2.2; g.fillRect(r() * W, r() * H * 0.8, d, d); }
}

function antarctica(cx, cy, s) {
  ctx.beginPath();
  OUTLINE.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x * s, cy + y * s) : ctx.moveTo(cx + x * s, cy + y * s)));
  ctx.closePath();
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, s * 1.2);
  g.addColorStop(0, C.ice); g.addColorStop(1, C.ice2);
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.stroke();
}
function holeBlob(cx, cy, r, t, a = 1) {
  A(a, () => {
    ctx.beginPath();
    for (let i = 0; i <= 90; i++) {
      const th = (i / 90) * Math.PI * 2, w = 1 + 0.05 * Math.sin(th * 3 + t * 0.6) + 0.03 * Math.sin(th * 5 - t);
      const x = cx + Math.cos(th) * r * w, y = cy + Math.sin(th) * r * w * 0.98;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(122,63,176,0.45)'; ctx.fill();
    ctx.strokeStyle = '#c79bff'; ctx.lineWidth = 3; ctx.stroke();
  });
}

// ---------- A: the map ----------
function sceneA(t) {
  const a = 1 - seg(t, 8.6, 9.3);
  if (a <= 0) return;
  A(a, () => {
    // ozone-rich ring around the hole
    const rg = ctx.createRadialGradient(MAP.x, MAP.y, kmR(HOLE) * 0.9, MAP.x, MAP.y, kmR(HOLE) * 1.7);
    rg.addColorStop(0, 'rgba(143,184,255,0)'); rg.addColorStop(0.4, 'rgba(143,184,255,0.22)'); rg.addColorStop(1, 'rgba(143,184,255,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    antarctica(MAP.x, MAP.y, MAP.s);
    const grow = eio(seg(t, 0.8, 4.2));
    const area = lerp(AUG, HOLE, grow);
    holeBlob(MAP.x + 6, MAP.y - 4, kmR(area), t, eout(seg(t, 0.4, 1.0)));
    A(span(t, 4.8, 9.0), () => {
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2.5; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.arc(MAP.x + 6, MAP.y - 4, kmR(USUAL), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      font(500, 22, NUM); text(`usual for the date: about ${USUAL}`, MAP.x, MAP.y + kmR(HOLE) + 34, { color: C.soft, align: 'center', base: 'middle' });
    });
    font(700, 76, NUM); text(`${Math.round(area)} million km²`, W / 2, 140, { color: C.ink, align: 'center', base: 'middle' });
    font(600, 24, NUM); text(grow <= 0 ? 'end of August 2026' : grow < 1 ? 'growing…' : '12 September 2026', W / 2, 196, { color: '#c79bff', align: 'center', base: 'middle' });
    font(500, 24); text('the ozone hole: where ozone is below 220 Dobson units', W / 2, 232, { color: C.soft, align: 'center', base: 'middle' });
    A(seg(t, 1.4, 2.0) * (1 - seg(t, 4.6, 5.0)), () => { font(500, 22, NUM); text(`Antarctica: ${ANT} million km²`, MAP.x, MAP.y + kmR(HOLE) + 34, { color: C.ice2, align: 'center', base: 'middle' }); });
  });
}

// ---------- B: the cross-section ----------
const GROUND = 690, LAYER = [300, 420]; // the ozone layer band, in canvas y
let ozSeed = 3; const ozR = () => ((ozSeed = (ozSeed * 16807) % 2147483647) / 2147483647);
const OZ = Array.from({ length: 60 }, () => ({ x: 60 + ozR() * 744, y: lerp(LAYER[0], LAYER[1], ozR()), ph: ozR() * 6.3, kill: ozR() }));
const CLOUDS = [[200, 470, 150], [430, 450, 190], [640, 478, 140]];
const CL = Array.from({ length: 9 }, (_, i) => ({ c: CLOUDS[i % 3], dx: (i / 9 - 0.5) * 220, ph: i * 1.7 }));
function molecule(x, y, s, color, a = 1) {
  A(a, () => {
    ctx.fillStyle = color;
    for (const [dx, dy] of [[-7, 4], [7, 4], [0, -7]]) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, 6 * s, 0, Math.PI * 2); ctx.fill(); }
  });
}
function section(t) {
  const a = eout(seg(t, 9.0, 9.8)) * (1 - seg(t, 41.0, 41.6));
  if (a <= 0) return;
  A(a, () => {
    // the Sun: down in winter, up from 27.6
    const sunUp = eio(seg(t, 27.6, 30.0));
    const sunY = lerp(GROUND + 60, 200, sunUp);
    if (t < 13.8 || t > 27.6) {
      const sx = t < 13.8 ? 720 : 120;
      const sy = t < 13.8 ? 180 : sunY;
      const sg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 90);
      sg.addColorStop(0, C.sun); sg.addColorStop(0.4, 'rgba(255,210,122,0.5)'); sg.addColorStop(1, 'rgba(255,210,122,0)');
      A(t < 13.8 ? span(t, 9.2, 13.8) : 1 - 0.7 * seg(t, 32.0, 32.6), () => { ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, 90, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(sx, sy, 34, 0, Math.PI * 2); ctx.fill(); });
    }
    // ultraviolet rays absorbed by the layer (part B1)
    A(span(t, 9.4, 13.8), () => {
      ctx.strokeStyle = 'rgba(200,160,255,0.8)'; ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const x0 = 650 - i * 70, y0 = 210, p = clamp(((t * 0.8 + i * 0.37) % 1.4) / 1.4);
        const yEnd = lerp(y0, LAYER[0] + 50 + (i % 3) * 20, p);
        ctx.beginPath();
        for (let y = y0; y <= yEnd; y += 4) { const x = x0 - (y - y0) * 0.5 + Math.sin(y / 6) * 5; y === y0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      }
      font(600, 24, NUM); text('ultraviolet', 560, 236, { color: '#c8a8ff', base: 'middle' });
    });
    // Antarctic ice and the ground line
    ctx.fillStyle = C.ice2; ctx.beginPath(); ctx.moveTo(0, GROUND + 40); ctx.quadraticCurveTo(W / 2, GROUND - 30, W, GROUND + 40); ctx.lineTo(W, GROUND + 90); ctx.lineTo(0, GROUND + 90); ctx.fill();
    font(500, 22, NUM); text('Antarctica', W / 2, GROUND + 30, { color: C.night, align: 'center', base: 'middle' });
    // the ozone layer band
    ctx.fillStyle = C.ozoneSoft; ctx.fillRect(0, LAYER[0], W, LAYER[1] - LAYER[0]);
    font(600, 22, NUM); text('ozone layer', 150, LAYER[1] + 22, { color: C.ozone, base: 'middle' });
    // ozone molecules; eaten after the Sun returns
    const eat = seg(t, 30.0, 40.0);
    OZ.forEach((o) => {
      const gone = o.kill < eat * 0.68; // about two-thirds go: a third is left
      if (gone) return;
      molecule(o.x + Math.sin(t + o.ph) * 6, o.y + Math.cos(t * 0.8 + o.ph) * 4, 1, C.ozone);
    });
    // the polar vortex: arrows circling
    const vortex = span(t, 13.8, 41.0, 0.6, 0.5);
    A(vortex * 0.9, () => {
      ctx.strokeStyle = 'rgba(238,244,255,0.55)'; ctx.lineWidth = 4;
      for (const side of [-1, 1]) {
        const cx = W / 2 + side * 340, ph = t * 2;
        ctx.beginPath(); ctx.ellipse(cx, 420, 36, 180, 0, 0, Math.PI * 2); ctx.setLineDash([22, 14]); ctx.lineDashOffset = side * ph * 20; ctx.stroke(); ctx.setLineDash([]);
      }
      A(span(t, 14.2, 18.2), () => { font(600, 24, NUM); text('polar vortex', W / 2, 250, { color: C.ink, align: 'center', base: 'middle' }); });
    });
    // the thermometer
    const temp = t < 18.4 ? lerp(-60, -70, seg(t, 13.8, 18.2)) : t < 30 ? lerp(-70, WINTER_MIN, eio(seg(t, 18.4, 21.0))) : lerp(WINTER_MIN, -82, seg(t, 30, 41));
    A(span(t, 18.4, 32.0), () => {
      const y = 620, l = 210, r = 654, T2X = (c) => lerp(l, r, (c + 100) / 60); // −100 to −40 °C
      ctx.fillStyle = 'rgba(238,244,255,0.12)'; k.rrect(l, y - 12, r - l, 24, 12); ctx.fill();
      ctx.fillStyle = C.ozone; k.rrect(l, y - 8, T2X(temp) - l, 16, 8); ctx.fill();
      ctx.strokeStyle = C.pink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(T2X(PSC), y - 24); ctx.lineTo(T2X(PSC), y + 24); ctx.stroke();
      font(600, 22, NUM);
      text(`${Math.round(temp)} °C`, l - 16, y, { color: C.ink, align: 'right', base: 'middle' });
      text(`clouds form below ${PSC} °C`, T2X(PSC) + 14, y - 30, { color: C.pink, base: 'middle' });
    });
    // polar stratospheric clouds below −78 °C
    const psc = eout(seg(t, 20.6, 22.4)) * (1 - seg(t, 36.0, 40.0) * 0.6);
    A(psc, () => {
      for (const [cx, cy, w] of CLOUDS) {
        const g = ctx.createLinearGradient(cx - w / 2, cy, cx + w / 2, cy);
        g.addColorStop(0, 'rgba(255,154,213,0.0)'); g.addColorStop(0.3, 'rgba(255,154,213,0.6)'); g.addColorStop(0.55, 'rgba(157,255,207,0.6)'); g.addColorStop(0.8, 'rgba(160,190,255,0.55)'); g.addColorStop(1, 'rgba(160,190,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, w / 2, 16, 0, 0, Math.PI * 2); ctx.fill();
      }
      A(span(t, 20.8, 23.2), () => { font(600, 22, NUM); text('polar stratospheric clouds', W / 2, 528, { color: C.pink, align: 'center', base: 'middle' }); });
    });
    // chlorine: locked in reservoir molecules, freed on the clouds, then attacking ozone once sunlit
    const free = eout(seg(t, 23.4, 25.6));
    CL.forEach((c, i) => {
      if (t < 23.0) return;
      const [cx, cy] = c.c;
      const wander = t > 28.6 ? seg(t, 28.6, 31.0) : 0;
      const x = cx + c.dx * 0.5 + Math.sin(t * 1.3 + c.ph) * (10 + 60 * wander);
      const y = lerp(cy - 4, lerp(LAYER[0] + 20, LAYER[1] - 20, (i % 3) / 2), wander) + Math.cos(t + c.ph) * 6;
      // reservoir partner, dropping away
      A(1 - free, () => { ctx.fillStyle = 'rgba(238,244,255,0.6)'; ctx.beginPath(); ctx.arc(x + 12, y + 4, 7, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = C.cl; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
      if (t > 30.4) A(0.5 + 0.5 * Math.sin(t * 6 + c.ph), () => { ctx.strokeStyle = C.cl; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.stroke(); });
    });
    A(span(t, 23.4, 27.4), () => { font(600, 22, NUM); text('chlorine set free on the clouds', W / 2, 528, { color: C.cl, align: 'center', base: 'middle' }); });
    // the catalytic cycle
    A(span(t, 32.2, 36.6), () => {
      ctx.fillStyle = C.panel; k.rrect(170, 150, 524, 120, 18); ctx.fill();
      font(600, 30, SANS);
      text('Cl + O₃ → ClO + O₂', W / 2, 192, { color: C.cl, align: 'center', base: 'middle' });
      font(500, 22); text('then ClO gives back its chlorine, which strikes again', W / 2, 236, { color: C.soft, align: 'center', base: 'middle' });
    });
    // the Dobson gauge
    A(span(t, 36.8, 41.0), () => {
      const x0 = 120, x1 = 744, y = 200, X = (du) => lerp(x0, x1, du / 400);
      ctx.fillStyle = C.panel; k.rrect(80, 130, 704, 140, 18); ctx.fill();
      ctx.fillStyle = 'rgba(238,244,255,0.12)'; ctx.fillRect(x0, y - 10, x1 - x0, 20);
      const p = eio(seg(t, 37.0, 38.6));
      ctx.fillStyle = C.ozone; ctx.fillRect(x0, y - 10, X(lerp(DU_1970, DU_HOLE, p)) - x0, 20);
      ctx.strokeStyle = C.pink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(DU_LINE), y - 22); ctx.lineTo(X(DU_LINE), y + 22); ctx.stroke();
      font(600, 22, NUM);
      text(`${DU_1970} DU, early 1970s`, X(DU_1970), y - 38, { color: C.soft, align: 'center', base: 'middle' });
      text(`hole line ${DU_LINE}`, X(DU_LINE), y + 40, { color: C.pink, align: 'center', base: 'middle' });
      A(seg(t, 38.4, 38.8), () => text(`about ${DU_HOLE} DU`, X(DU_HOLE), y + 40, { color: C.ozone, align: 'center', base: 'middle' }));
    });
  });
}

// ---------- C: the 2026 season ----------
function season(t) {
  const a = span(t, 41.4, 50.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('The 2026 season (CAMS, 16 September)', W / 2, 150, { color: C.soft, align: 'center', base: 'middle' });
    // area: end of August and 12 September, against the usual, and the record
    const L = 270, R = 720, X = (v) => lerp(L, R, v / 30);
    const rows = [['end of August', AUG, C.ozone], ['12 September', HOLE, '#c79bff'], ['usual for 12 Sep', USUAL, C.faint], ['record, 2006', RECORD, 'rgba(238,244,255,0.5)']];
    rows.forEach(([lab, v, col], i) => {
      const y = 230 + i * 70, g = eout(seg(t, 41.8 + i * 0.3, 42.6 + i * 0.3));
      ctx.fillStyle = col; k.rrect(L, y, (X(v) - L) * g, 40, 8); ctx.fill();
      font(500, 22); text(lab, L - 14, y + 20, { color: C.soft, align: 'right', base: 'middle' });
      font(600, 22, NUM); text(`${v}`, X(v) * g + (1 - g) * L + 12, y + 20, { color: C.ink, base: 'middle' });
    });
    font(500, 20, NUM); text('million km²', R, 210, { color: C.faint, align: 'right', base: 'middle' });
    // the cold spell at 20 km
    A(span(t, 42.6, 46.0), () => {
      ctx.fillStyle = C.panel; k.rrect(150, 540, 590, 80, 16); ctx.fill();
      font(600, 26, NUM); text('20 km up: a sudden drop in temperature', W / 2, 580, { color: C.pink, align: 'center', base: 'middle' });
    });
    // other measures near average
    A(span(t, 46.2, 50.6), () => {
      const items = [['lowest ozone inside', 'near average'], ['ozone mass deficit', 'near average']];
      items.forEach(([h, v], i) => {
        const x = 150 + i * 300;
        ctx.fillStyle = C.panel; k.rrect(x, 540, 290, 96, 16); ctx.fill();
        font(500, 22); text(h, x + 145, 572, { color: C.soft, align: 'center', base: 'middle' });
        font(600, 26, NUM); text(v, x + 145, 608, { color: C.mint, align: 'center', base: 'middle' });
      });
    });
  });
}

// ---------- D: recovery ----------
function recovery(t) {
  const a = eout(seg(t, 50.6, 51.4));
  if (a <= 0) return;
  A(a, () => {
    // chlorine: from its peak back towards the 1980 level
    const L = 140, R = 724, y = 290;
    font(600, 26); text('Chlorine over Antarctica (NOAA index)', W / 2, 160, { color: C.soft, align: 'center', base: 'middle' });
    ctx.fillStyle = 'rgba(238,244,255,0.12)'; k.rrect(L, y - 18, R - L, 36, 18); ctx.fill();
    const g = eio(seg(t, 51.0, 52.6));
    const done = (100 - ODGI_2024) / 100;
    ctx.fillStyle = C.cl; k.rrect(L, y - 18, Math.max(36, (R - L) * done * g), 36, 18); ctx.fill();
    font(600, 22, NUM);
    text('peak, about 2000', L, y + 48, { color: C.soft, base: 'middle' });
    text('1980 level', R, y + 48, { color: C.soft, align: 'right', base: 'middle' });
    text(`2024: ${100 - ODGI_2024}% of the way back`, L + (R - L) * done, y - 44, { color: C.cl, align: 'center', base: 'middle' });
    // the year the ozone is back
    A(seg(t, 55.4, 56.2), () => {
      const yrX = (yr) => lerp(L, R, (yr - 1980) / (2070 - 1980));
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, 520); ctx.lineTo(R, 520); ctx.stroke();
      font(500, 22, NUM);
      for (const yr of [1980, 2000, 2026, 2050, 2066]) {
        ctx.fillStyle = yr === BACK ? C.sun : C.faint; ctx.fillRect(yrX(yr) - 1.5, 510, 3, 20);
        text(String(yr), yrX(yr), 552, { color: yr === BACK ? C.sun : C.soft, align: 'center', base: 'middle' });
      }
      // slowly improving since 2000; a big year in 2026
      ctx.strokeStyle = '#c79bff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(yrX(2000), 450); ctx.lineTo(yrX(2026), 470); ctx.stroke();
      ctx.setLineDash([8, 8]); ctx.strokeStyle = C.sun; ctx.beginPath(); ctx.moveTo(yrX(2026), 470); ctx.lineTo(yrX(BACK), 500); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#c79bff'; ctx.beginPath(); ctx.arc(yrX(2026), 470, 8, 0, Math.PI * 2); ctx.fill();
      font(600, 22, NUM); text('slowly improving since 2000', yrX(2013), 420, { color: '#c79bff', align: 'center', base: 'middle' });
    });
    A(seg(t, 59.8, 60.6), () => {
      ctx.fillStyle = C.panel; k.rrect(170, 600, 524, 110, 18); ctx.fill();
      font(700, 52, NUM); text(`around ${BACK}`, W / 2, 640, { color: C.sun, align: 'center', base: 'middle' });
      font(500, 22); text('Antarctic ozone back to 1980 values (2022 assessment)', W / 2, 686, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.4, fonts: [NUM, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t);
    section(t);
    season(t);
    recovery(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 42, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.ozone, '~': C.sun } });
  },
});
