// Explainer for earth-el-nino-record-seas: September 2026's record-warm seas, and how El Niño moves the
// Pacific's warm water east. Look: a cross-section of the equatorial Pacific, Indonesia on the left and South
// America on the right, deep ocean teal under a warm coral surface layer, white trade-wind arrows, a rain
// cloud that travels. Barlow (signage grotesk) for captions, Azeret Mono (instrument-panel mono) for data.
//
// Facts: Copernicus Climate Change Service, "Second warmest September as global temperatures stay above
// 1.5°C" (12 October 2026): global surface air 16.27 °C in September 2026, 1.63 °C above 1850–1900, second
// warmest September after 2023; 60°S–60°N sea surface 21.05 °C, a record for September (previous 20.92 °C,
// 2023); Niño 3.4 monthly SST an all-time high of 29.70 °C, above the peaks of 1982/83, 1997/98 and 2015/16;
// El Niño strengthening, likely one of the strongest ever recorded; the run of months above 1.5 °C is expected
// to last into 2027. NOAA Climate Prediction Center, ENSO diagnostic discussion (8 October 2026): El Niño
// Advisory; SST anomalies above +4.0 °C in parts of the eastern equatorial Pacific; a deeper-than-average
// thermocline; westerly wind anomalies; a strong-to-very strong El Niño likely through January–March 2027.
// NOAA PMEL, "What is an El Niño?": normally the trade winds blow west along the equator from South America
// towards Asia and pile up warm water, so the sea surface is about half a metre higher at Indonesia than at
// Ecuador, and about 8 °C warmer in the west because cold water wells up in the east; the thermocline (the
// 20 °C level) slopes up towards South America; in El Niño the trade winds relax, the thermocline deepens in
// the east and flattens, upwelling cools the surface less, and rainfall follows the warm water east, with
// flooding in Peru and drought in Indonesia and Australia. WMO, El Niño/La Niña Update (May 2026): El Niño
// typically increases global temperatures.
//
// Scene plan (64.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: September's record seas, 21.05 °C, and 1.63 °C above pre-industrial air.
//  B  9.0–41.2  The Pacific: trade winds, warm pool, upwelling; then El Niño: winds weaken, warm water east.
//  C 41.2–55.0  2026: Niño 3.4 at 29.70 °C, +4 °C patches, global temperatures.
//  D 55.0–64.4  NOAA and Copernicus expect it to last into 2027.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  sky: '#0d2a44', sky2: '#16405f', deep: '#05223a', mid: '#0a3a5a', ink: '#f1f7fb', soft: 'rgba(241,247,251,0.74)', faint: 'rgba(241,247,251,0.36)',
  warm: '#ff7b54', warm2: '#ffb26b', cold: '#4cc9f0', land: '#3d5a3c', land2: '#5d7a4f', cloud: '#c9d6e2', panel: 'rgba(4,22,38,0.82)', gold: '#ffd166',
};
const SANS = 'Barlow', MONO = 'Azeret Mono';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers ----------
const SST = 21.05, SST_PREV = 20.92, AIR = 1.63, NINO34 = 29.70, EAST_ANOM = 4.0;
const SLOPE_M = 0.5, WEST_WARMER = 8; // normal year (NOAA PMEL)

// ---------- the cross-section ----------
const X0 = 70, X1 = 794, SURF = 380, DEEPEST = 660;
/** 0 = a normal year, 1 = El Niño. */
const nino = (t) => (t < 27.6 ? 0 : eio(seg(t, 28.0, 33.0)));
/** Sea-surface height (px, up is negative) along the section: tilted up in the west in a normal year. */
const surfY = (x, e) => SURF + lerp(-18, 18, (x - X0) / (X1 - X0)) * (1 - e) - 2 * e;
/** Depth of the warm layer's floor, the thermocline: deep in the west, shallow in the east; flatter in El Niño. */
const thermoY = (x, e) => { const f = (x - X0) / (X1 - X0); return lerp(lerp(560, 410, f), lerp(520, 500, f), e); };
/** Surface colour from cold (east, normal) to warm. */
const surfaceHeat = (x, e) => { const f = (x - X0) / (X1 - X0); return clamp(1 - f * (1 - e * 0.85) * 1.05); };
const mix = (a, b, f) => { const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g).map((h) => parseInt(h, 16)); return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], f))).join(',')})`; };

const CUES = [
  [0.4, 4.6, `In September 2026, the seas between 60°S and 60°N averaged *${SST} °C*, a record for the month.`],
  [4.8, 9.0, `The air was ~${AIR} °C~ warmer than before industry: the second-warmest September yet.`],
  [9.2, 13.6, 'Behind it is *El Niño*, in the Pacific. First, a normal year along the equator.'],
  [13.8, 18.2, 'The *trade winds* blow west, from South America towards Asia.'],
  [18.4, 22.8, 'They pile warm water up in the west: the sea there stands about *half a metre* higher.'],
  [23.0, 27.4, `In the east, cold water wells up from below, so the surface is about ~${WEST_WARMER} °C~ cooler.`],
  [27.6, 32.0, 'In an *El Niño*, the trade winds weaken, and the warm water sloshes back east.'],
  [32.2, 36.6, 'The cold layer sinks deeper in the east, so less cold water reaches the surface.'],
  [36.8, 41.2, 'Rain moves east with it, which can bring floods to Peru and ~drought~ to Indonesia and Australia.'],
  [41.4, 45.8, `This September, the Niño 3.4 patch of ocean averaged *${NINO34.toFixed(2)} °C*, its highest ever.`],
  [46.0, 50.4, `US weather agency NOAA found parts of the eastern Pacific more than ~${EAST_ANOM.toFixed(0)} °C~ warmer than normal.`],
  [50.6, 55.0, 'And El Niño *typically raises* global temperatures.'],
  [55.2, 59.6, 'NOAA expects a *strong to very strong* El Niño to last into early 2027.'],
  [59.8, 64.2, 'Europe’s Copernicus climate service expects months above ~1.5 °C~ to go on into 2027.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sky); lg.addColorStop(0.5, C.sky2); lg.addColorStop(1, '#061a2c');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

// ---------- A: the hook ----------
function sceneA(t) {
  const a = 1 - seg(t, 8.6, 9.3);
  if (a <= 0) return;
  A(a, () => {
    // a wide band of sea, warming
    const g = eio(seg(t, 0.6, 3.0));
    for (let i = 0; i < 24; i++) {
      const y = 290 + i * 13, f = i / 23;
      ctx.fillStyle = mix('4cc9f0', 'ff7b54', clamp(g * (1 - Math.abs(f - 0.5) * 1.6)));
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) { const yy = y + Math.sin(x / 60 + t * 1.5 + i) * 4; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.lineTo(W, y + 13); ctx.lineTo(0, y + 13); ctx.fill();
      ctx.globalAlpha = 1;
    }
    font(500, 22, MONO); text('60°N', 40, 278, { color: C.soft, base: 'middle' }); text('60°S', 40, 610, { color: C.soft, base: 'middle' });
    // the record bars
    A(seg(t, 1.4, 2.2), () => {
      ctx.fillStyle = C.panel; k.rrect(150, 130, 564, 120, 20); ctx.fill();
      font(700, 72); text(`${lerp(SST_PREV, SST, eio(seg(t, 1.6, 3.4))).toFixed(2)} °C`, W / 2, 188, { color: C.warm2, align: 'center', base: 'middle' });
      font(500, 22); text(`September record · the old one: ${SST_PREV} °C, 2023`, W / 2, 232, { color: C.soft, align: 'center', base: 'middle' });
    });
    A(seg(t, 4.8, 5.6), () => {
      ctx.fillStyle = C.panel; k.rrect(150, 640, 564, 90, 20); ctx.fill();
      font(700, 48); text(`+${AIR} °C`, 300, 685, { color: C.gold, align: 'center', base: 'middle' });
      font(500, 22); text('global air, September 2026,', 560, 672, { color: C.ink, align: 'center', base: 'middle' });
      text('against 1850–1900', 560, 700, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

// ---------- B: the section ----------
function section(t) {
  const a = eout(seg(t, 9.0, 9.8)) * (1 - seg(t, 41.0, 41.6));
  if (a <= 0) return;
  const e = nino(t);
  A(a, () => {
    // deep water
    ctx.fillStyle = C.deep; ctx.beginPath(); ctx.moveTo(X0, surfY(X0, e));
    for (let x = X0; x <= X1; x += 8) ctx.lineTo(x, surfY(x, e));
    ctx.lineTo(X1, DEEPEST); ctx.lineTo(X0, DEEPEST); ctx.closePath(); ctx.fill();
    // the warm layer, coloured by its surface heat
    for (let x = X0; x < X1; x += 6) {
      const top = surfY(x, e), bot = thermoY(x, e), heat = surfaceHeat(x, e);
      const g = ctx.createLinearGradient(0, top, 0, bot);
      g.addColorStop(0, mix('4cc9f0', 'ff7b54', heat)); g.addColorStop(1, mix('0a3a5a', 'ff7b54', heat * 0.55));
      ctx.fillStyle = g; ctx.fillRect(x, top, 7, bot - top);
    }
    // the thermocline
    ctx.strokeStyle = C.cold; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
    ctx.beginPath(); for (let x = X0; x <= X1; x += 8) (x === X0 ? ctx.moveTo : ctx.lineTo).call(ctx, x, thermoY(x, e)); ctx.stroke(); ctx.setLineDash([]);
    A(span(t, 23.0, 41.0), () => { font(600, 21, MONO); text('the 20 °C line', X0 + 10, thermoY(X0, e) + 26, { color: C.cold, base: 'middle' }); });
    // upwelling arrows in the east, fading in El Niño
    A(span(t, 23.2, 41.0) * (1 - 0.8 * e), () => {
      ctx.strokeStyle = C.cold; ctx.lineWidth = 4;
      for (let i = 0; i < 3; i++) {
        const x = X1 - 60 - i * 50, ph = ((t * 0.6 + i * 0.33) % 1);
        const y0 = 600, y1 = surfY(x, e) + 16, y = lerp(y0, y1, ph);
        ctx.beginPath(); ctx.moveTo(x, y + 40); ctx.lineTo(x, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 9, y + 10); ctx.lineTo(x, y); ctx.lineTo(x + 9, y + 10); ctx.stroke();
      }
    });
    // land at both ends
    ctx.fillStyle = C.land;
    ctx.beginPath(); ctx.moveTo(0, 330); ctx.lineTo(X0 + 4, 360); ctx.lineTo(X0 + 4, DEEPEST); ctx.lineTo(0, DEEPEST); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W, 300); ctx.lineTo(X1 - 4, 370); ctx.lineTo(X1 - 4, DEEPEST); ctx.lineTo(W, DEEPEST); ctx.fill();
    ctx.fillStyle = '#04182a'; ctx.fillRect(0, DEEPEST, W, 40);
    font(600, 22); text('Indonesia', 16, 312, { color: C.ink, base: 'middle' }); text('South America', W - 12, 282, { color: C.ink, align: 'right', base: 'middle' });
    font(500, 20, MONO); text('west', X0 + 14, 690, { color: C.faint, base: 'middle' }); text('east', X1 - 14, 690, { color: C.faint, align: 'right', base: 'middle' });
    // trade winds
    const wind = (1 - 0.8 * e) * span(t, 13.8, 41.0, 0.5, 0.4);
    A(wind, () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const span_ = 120, x = X1 - 40 - (((t * 90 * (1 - 0.8 * e) + i * 150) % 600)), y = 200 + (i % 2) * 32;
        ctx.beginPath(); ctx.moveTo(x + span_, y); ctx.lineTo(x, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 16, y - 12); ctx.lineTo(x, y); ctx.lineTo(x + 16, y + 12); ctx.stroke();
      }
      font(600, 24); text(e > 0.5 ? 'trade winds, weakened' : 'trade winds', W / 2, 166, { color: C.ink, align: 'center', base: 'middle' });
    });
    // half a metre higher in the west (exaggerated)
    A(span(t, 18.4, 27.4), () => {
      const x = X0 + 30, y0 = surfY(X0 + 30, 0), y1 = surfY(X1 - 30, 0);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(X1 - 30, y1); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(x + 40, y1); ctx.lineTo(x + 40, y0); ctx.stroke();
      font(600, 22, MONO); text(`about ${SLOPE_M} m higher`, x + 54, y0 - 18, { color: C.gold, base: 'middle' });
      font(500, 19); text('(tilt exaggerated)', x + 54, y0 + 8 - 52, { color: C.soft, base: 'middle' });
    });
    // the temperature difference
    A(span(t, 23.2, 27.4), () => {
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 170, 440, 340, 60, 30); ctx.fill();
      font(600, 24, MONO); text(`west about ${WEST_WARMER} °C warmer`, W / 2, 470, { color: C.warm2, align: 'center', base: 'middle' });
    });
    // the rain cloud follows the warmest water
    const rainX = lerp(170, 560, e);
    A(span(t, 13.8, 41.0, 0.5, 0.4), () => {
      ctx.fillStyle = C.cloud;
      for (const [dx, dy, r] of [[-40, 0, 30], [0, -16, 38], [40, 0, 30], [12, 8, 30]]) { ctx.beginPath(); ctx.arc(rainX + dx, 120 + dy, r, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = 'rgba(160,200,240,0.8)'; ctx.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) { const x = rainX - 50 + i * 14, y = 150 + ((t * 120 + i * 23) % 50); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 12); ctx.stroke(); }
    });
    A(span(t, 36.8, 41.2), () => {
      font(600, 24); text('drought', 70, 272, { color: C.gold, align: 'center', base: 'middle' });
      text('floods in Peru', W - 90, 246, { color: C.cold, align: 'center', base: 'middle' });
    });
    A(span(t, 32.2, 36.6), () => {
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 230, 600, 460, 54, 27); ctx.fill();
      font(600, 22); text('deeper warm layer in the east: less cold water rises', W / 2, 627, { color: C.cold, align: 'center', base: 'middle' });
    });
    A(span(t, 9.4, 13.6), () => { font(600, 26); text('The equatorial Pacific, from west to east', W / 2, 130, { color: C.soft, align: 'center', base: 'middle' }); });
  });
}

// ---------- C: 2026 ----------
function nino34(t) {
  const a = span(t, 41.4, 50.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('September 2026 in the Pacific', W / 2, 140, { color: C.soft, align: 'center', base: 'middle' });
    // a thermometer for Niño 3.4
    const x = 250, top = 220, bot = 640, T2Y = (c) => lerp(bot, top, (c - 24) / 7);
    ctx.fillStyle = 'rgba(241,247,251,0.12)'; k.rrect(x - 22, top, 44, bot - top, 22); ctx.fill();
    const v = lerp(26, NINO34, eio(seg(t, 41.8, 43.6)));
    const g = ctx.createLinearGradient(0, bot, 0, top); g.addColorStop(0, C.cold); g.addColorStop(1, C.warm);
    ctx.fillStyle = g; k.rrect(x - 14, T2Y(v), 28, bot - T2Y(v), 14); ctx.fill();
    ctx.fillStyle = C.warm; ctx.beginPath(); ctx.arc(x, bot + 20, 34, 0, Math.PI * 2); ctx.fill();
    font(500, 20, MONO); for (const c of [25, 27, 29, 31]) text(`${c}`, x - 40, T2Y(c), { color: C.faint, align: 'right', base: 'middle' });
    font(700, 52); text(`${v.toFixed(2)} °C`, x + 50, T2Y(v), { color: C.warm2, base: 'middle' });
    A(seg(t, 43.6, 44.2), () => {
      font(500, 22); text('Niño 3.4, monthly average:', x + 50, T2Y(v) - 46, { color: C.soft, base: 'middle' });
      text('above the peaks of 1982–83,', x + 50, T2Y(v) + 44, { color: C.soft, base: 'middle' });
      text('1997–98 and 2015–16', x + 50, T2Y(v) + 72, { color: C.soft, base: 'middle' });
    });
    A(span(t, 46.0, 50.6), () => {
      ctx.fillStyle = C.panel; k.rrect(370, 520, 400, 110, 18); ctx.fill();
      font(700, 48); text(`+${EAST_ANOM.toFixed(1)} °C`, 570, 560, { color: C.warm, align: 'center', base: 'middle' });
      font(500, 22); text('and more, in parts of the east', 570, 604, { color: C.ink, align: 'center', base: 'middle' });
    });
  });
}
function globe(t) {
  const a = span(t, 50.6, 55.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const cx = W / 2, cy = 430, R = 210;
    const g = ctx.createRadialGradient(cx - 60, cy - 70, 30, cx, cy, R);
    g.addColorStop(0, '#3e7fb0'); g.addColorStop(1, '#0b2f4f');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    // a warm band along the equator, glowing outwards
    const w = eio(seg(t, 51.0, 53.0));
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    const bg2 = ctx.createLinearGradient(0, cy - R, 0, cy + R);
    bg2.addColorStop(0, 'rgba(255,123,84,0)'); bg2.addColorStop(0.5 - 0.3 * w, 'rgba(255,123,84,0)'); bg2.addColorStop(0.5, `rgba(255,123,84,${0.75})`); bg2.addColorStop(0.5 + 0.3 * w, 'rgba(255,123,84,0)'); bg2.addColorStop(1, 'rgba(255,123,84,0)');
    ctx.fillStyle = bg2; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    ctx.restore();
    ctx.strokeStyle = 'rgba(241,247,251,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    // an upward arrow: global temperature
    A(seg(t, 52.6, 53.2), () => {
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(cx + R + 40, cy - 40); ctx.lineTo(cx + R + 10, cy + 10); ctx.lineTo(cx + R + 70, cy + 10); ctx.fill();
      ctx.fillRect(cx + R + 30, cy + 10, 20, 60);
      font(600, 22); text('global', cx + R + 40, cy + 100, { color: C.gold, align: 'center', base: 'middle' });
      text('temperature', cx + R + 40, cy + 126, { color: C.gold, align: 'center', base: 'middle' });
    });
  });
}
function outlook(t) {
  const a = eout(seg(t, 55.2, 56.0));
  if (a <= 0) return;
  A(a, () => {
    const L = 120, R = 744, X = (m) => lerp(L, R, m / 9); // months from Aug 2026 to May 2027
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    font(600, 26); text('What forecasters expect', W / 2, 150, { color: C.soft, align: 'center', base: 'middle' });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, 520); ctx.lineTo(R, 520); ctx.stroke();
    font(500, 20, MONO); months.forEach((m, i) => text(m, X(i), 550, { color: i === 2 ? C.ink : C.soft, align: 'center', base: 'middle' }));
    text('2026', X(0), 580, { color: C.faint, align: 'center', base: 'middle' }); text('2027', X(5), 580, { color: C.faint, align: 'center', base: 'middle' });
    // NOAA: strong to very strong El Niño through Jan–Mar 2027
    const g1 = eio(seg(t, 55.6, 57.0));
    ctx.fillStyle = C.warm; k.rrect(X(0), 300, (X(7) - X(0)) * g1, 56, 12); ctx.fill();
    font(600, 22); text('NOAA: strong to very strong El Niño, through Jan–Mar', X(0), 270, { color: C.warm2, base: 'middle' });
    // Copernicus: months above 1.5 °C into 2027
    A(seg(t, 59.8, 60.4), () => {
      const g2 = eio(seg(t, 60.0, 61.4));
      ctx.fillStyle = C.gold; k.rrect(X(0), 420, (X(6) - X(0)) * g2, 56, 12); ctx.fill();
      ctx.fillStyle = 'rgba(255,209,102,0.35)'; k.rrect(X(6), 420, (X(7.5) - X(6)) * g2, 56, 12); ctx.fill();
      font(600, 22); text('Copernicus: months above 1.5 °C, into 2027', X(0), 390, { color: C.gold, base: 'middle' });
    });
    font(500, 20); text('today', X(2.85), 494, { color: C.ink, align: 'center', base: 'middle' });
    ctx.fillStyle = C.ink; ctx.fillRect(X(2.85) - 1, 500, 2, 22);
  });
}

Kit.scene({
  width: W, height: H, duration: 64.4, fonts: [SANS, MONO],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t);
    section(t);
    nino34(t);
    globe(t);
    outlook(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 42, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.warm2, '~': C.cold } });
  },
});
