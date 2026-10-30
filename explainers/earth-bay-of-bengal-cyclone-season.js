// Explainer for earth-bay-of-bengal-cyclone-season: Cyclone Arnab came ashore near Kakinada on India's east coast on
// 28 October 2026, the first named storm of the year in the North Indian Ocean. The scene explains why the Bay of
// Bengal has two cyclone seasons, spring and autumn, with hardly any cyclones in the monsoon months between: a
// cyclone needs warm water and low wind shear, and the summer monsoon brings strong shear. Look: a deep-teal sea,
// storm grey, warm amber warnings. Bitter for headings and numbers, Libre Franklin for the captions.
//
// Facts:
// - News On AIR (All India Radio), 28 October 2026: the very severe cyclonic storm Arnab began landfall near
//   Kakinada on the Andhra Pradesh and Yanam coasts at 1:20 AM (IST), says the India Meteorological Department
//   (IMD); sustained winds 115–125 km/h, gusts up to 140 km/h. AFP (Kuwait Times, 28 October): nearly 100,000
//   people evacuated in Andhra Pradesh and Odisha; the Andhra Pradesh chief minister said no deaths had been
//   reported at that point (later reports gave several).
// - NASA Earth Observatory, 29 October 2026, "Arnab Strikes India": the first named storm of the 2026 North Indian
//   Ocean season, which emerged on 25 October, "a rather late start" for a basin that usually produces named
//   cyclones in April or May; sustained winds about 140 km/h on 26 October and 130 km/h at landfall between
//   Bapatla and Visakhapatnam; IMD's "very severe cyclonic storm" is roughly a Category 1 hurricane; the storm
//   formed amid an El Niño, which research links to fewer and weaker Bay of Bengal cyclones.
// - Wikipedia, "2026 North Indian Ocean cyclone season" (citing IMD bulletins): a depression at 12:00 UTC on
//   24 October, a deep depression on the 25th, named Arnab on the 26th, a severe and then a very severe cyclonic
//   storm, landfall between 20:30 UTC on the 27th and 02:30 UTC on the 28th, remnants over Chhattisgarh as a
//   depression on the 29th.
// - Wikipedia, "North Indian Ocean tropical cyclone": cyclones form in March–June and October–December, with
//   peaks in May and November; very few develop from June to September because of high vertical wind shear;
//   most form in the Bay of Bengal, few in the Arabian Sea, partly because of cooler sea surface temperatures and
//   high wind shear there.
// - NOAA Ocean Service, "How do hurricanes form?": warm water of at least 80 °F (26.5 °C), low wind shear, moist
//   air and the Earth's rotation. The summer monsoon's strong south-westerlies near the surface under easterlies
//   aloft (textbook) are the source of the shear.
// Computed here: the calendar of months, the shear picture (a column tilted by the difference between the winds
// at two heights), and Arnab's timeline from the dates above.
//
// Scene plan (60 s). Captions are centred at y = 846; everything important stays above y = 770.
//  A  0.0– 9.0  Landfall, 28 October 2026.
//  B  9.2–18.2  Two seasons: the calendar.
//  C 18.4–32.0  What a cyclone needs: warm water, spin, a seed, calm aloft.
//  D 32.2–45.8  The monsoon's shear; the transition months.
//  E 46.0–55.0  Arnab's week.
//  F 55.2–60.0  The Bay versus the Arabian Sea.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0f2f3a', bg2: '#061418', ink: '#f2f5f3', soft: 'rgba(242,245,243,0.72)', faint: 'rgba(242,245,243,0.24)', line: 'rgba(242,245,243,0.14)',
  sea: '#135d6b', seaWarm: '#1f8d93', land: '#2f3b2a', storm: '#c9d2d6', amber: '#ffb347', red: '#ff6b57', cyan: '#7fe0e8', green: '#8fd3a1', panel: 'rgba(0,0,0,0.35)',
};
const HEAD = 'Bitter', TXT = 'Libre Franklin';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the numbers ----------
const WIND_LO = 115, WIND_HI = 125, GUST = 140, EVACUATED = 100000, SST_MIN = 26.5;
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const SEASON = [0, 0, 1, 1, 2, 0.2, 0.1, 0.1, 0.3, 1, 2, 1]; // schematic: 2 = peak month, 1 = season, 0 = quiet
const TIMELINE = [['24 Oct', 'a depression forms over the central Bay'], ['26 Oct', 'named Arnab'], ['27 Oct', 'a very severe cyclonic storm'], ['28 Oct', 'landfall near Kakinada'], ['29 Oct', 'a depression over Chhattisgarh']];

const CUES = [
  [0.4, 4.6, 'On 28 October 2026, Cyclone *Arnab* came ashore near Kakinada on India’s east coast, from the Bay of Bengal.'],
  [4.8, 9.0, `Winds of ${WIND_LO} to ${WIND_HI} km/h, gusting to ${GUST}, said India’s weather office. About ${fmt(EVACUATED)} people had moved inland.`],
  [9.2, 13.6, 'It was the first named storm of the year in this ocean. Late: the Bay usually sees one by April or May.'],
  [13.8, 18.2, 'Bay of Bengal cyclones come in ^two seasons^: spring, peaking in May, and autumn, peaking in November.'],
  [18.4, 22.8, 'In between, June to September, almost none, though the sea is warm and the monsoon rains pour.'],
  [23.0, 27.4, `A cyclone needs warm water, at least about ~${SST_MIN} °C~ down to some depth, to feed it with moist air.`],
  [27.6, 32.0, 'It needs spin from Earth’s rotation, so not right at the equator, and a seed: a cluster of thunderstorms.'],
  [32.2, 36.6, 'And it needs calm aloft: if winds change sharply with height, ^wind shear^, they tip the storm’s warm core over.'],
  [36.8, 41.2, 'The summer monsoon blows hard from the southwest near the sea and the other way high up: strong shear.'],
  [41.4, 45.8, 'So monsoon storms stay as depressions. When the monsoon turns, in May and in October, the shear drops.'],
  [46.0, 50.4, 'The water is still warm then, so the Bay’s second season opens. Arnab grew from a depression on 24 October.'],
  [50.6, 55.0, 'Named on the 26th, a very severe cyclonic storm by the 27th, ashore on the 28th, a depression over land by the 29th.'],
  [55.2, 60.0, 'The Arabian Sea, cooler and windier aloft, gets far fewer. Most of the ocean’s cyclones are the Bay’s.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(242,245,243,0.05)'; g.lineWidth = 1.5;
  for (let y = 0; y < H; y += 26) { g.beginPath(); for (let x = 0; x <= W; x += 8) g.lineTo(x, y + 4 * Math.sin((x / 40) + y / 30)); g.stroke(); }
}

/** A schematic map of the Bay of Bengal: India to the west, the Bay in the middle, Myanmar to the east. */
function bayMap(x, y, w, h) {
  ctx.fillStyle = C.sea; k.rrect(x, y, w, h, 14); ctx.fill();
  ctx.fillStyle = C.land;
  // India's east coast: a diagonal mass on the left
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * 0.42, y); ctx.lineTo(x + w * 0.36, y + h * 0.3); ctx.lineTo(x + w * 0.28, y + h * 0.55); ctx.lineTo(x + w * 0.2, y + h * 0.78); ctx.lineTo(x + w * 0.16, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
  // Myanmar on the right
  ctx.beginPath(); ctx.moveTo(x + w * 0.74, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h * 0.7); ctx.lineTo(x + w * 0.88, y + h * 0.5); ctx.lineTo(x + w * 0.8, y + h * 0.2); ctx.closePath(); ctx.fill();
  // Sri Lanka
  ctx.beginPath(); ctx.ellipse(x + w * 0.2, y + h * 0.9, w * 0.05, h * 0.07, 0, 0, 7); ctx.fill();
  font(500, 20, TXT); text('INDIA', x + w * 0.14, y + h * 0.3, { align: 'center', color: C.soft }); text('Bay of Bengal', x + w * 0.58, y + h * 0.86, { align: 'center', color: C.cyan }); text('Myanmar', x + w * 0.9, y + h * 0.12, { align: 'center', color: C.soft });
}
/** A storm symbol: spiralling arms around an eye. */
function storm(x, y, r, spin, a = 1) {
  A(a, () => {
    ctx.strokeStyle = C.storm; ctx.lineWidth = Math.max(3, r / 7); ctx.lineCap = 'round';
    for (let arm = 0; arm < 3; arm++) { ctx.beginPath(); for (let i = 0; i <= 30; i++) { const u = i / 30; const ang = spin + arm * (Math.PI * 2 / 3) + u * 2.6; const rr = r * (0.25 + 0.75 * u); ctx.lineTo(x + rr * Math.cos(ang), y + rr * Math.sin(ang)); } ctx.stroke(); }
    ctx.lineCap = 'butt';
    ctx.fillStyle = C.bg2; ctx.beginPath(); ctx.arc(x, y, r * 0.18, 0, 7); ctx.fill();
  });
}

// ---------- A: landfall ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { font(600, 24); text('BAY OF BENGAL · 28 OCTOBER 2026', CX, 136, { align: 'center', color: C.soft, spacing: '3px' }); });
    const mx = 92, my = 180, mw = 680, mh = 420;
    bayMap(mx, my, mw, mh);
    const p = eio(seg(t, 0.6, 3.6));
    storm(lerp(mx + mw * 0.6, mx + mw * 0.3, p), lerp(my + mh * 0.62, my + mh * 0.5, p), lerp(70, 54, p), t * 3);
    A(seg(t, 3.4, 4.0), () => { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(mx + mw * 0.3, my + mh * 0.5, 7, 0, 7); ctx.fill(); font(600, 20); text('Kakinada', mx + mw * 0.3 - 14, my + mh * 0.5 + 26, { align: 'right', color: C.amber }); });
    A(seg(t, 5.0, 5.6), () => {
      ctx.fillStyle = C.panel; k.rrect(92, 630, 680, 126, 12); ctx.fill();
      font(700, 34); text(`${WIND_LO}–${WIND_HI} km/h · gusts ${GUST}`, CX, 668, { align: 'center', color: C.amber });
      font(500, 22, TXT); text('“very severe cyclonic storm” · India Meteorological Department', CX, 706, { align: 'center', color: C.soft });
      text(`about ${fmt(EVACUATED)} people moved inland before it`, CX, 738, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B: the calendar ----------
function calendar(t, y, h, highlight) {
  const x0 = 70, w = (W - 140) / 12;
  MONTHS.forEach((m, i) => {
    const x = x0 + i * w, v = SEASON[i];
    const col = v >= 2 ? C.amber : v >= 1 ? 'rgba(255,179,71,0.55)' : v > 0 ? 'rgba(255,179,71,0.18)' : 'rgba(242,245,243,0.06)';
    ctx.fillStyle = col; k.rrect(x + 3, y + h - h * (0.25 + 0.75 * v / 2), w - 6, h * (0.25 + 0.75 * v / 2), 6); ctx.fill();
    font(600, 20); text(m, x + w / 2, y + h + 22, { align: 'center', color: C.soft });
    if (highlight && v >= 2) { font(600, 18); text('peak', x + w / 2, y + h - h * (0.25 + 0.75 * v / 2) - 16, { align: 'center', color: C.amber }); }
  });
  font(500, 20, TXT); text('JAN', x0 + w / 2, y + h + 46, { align: 'center', color: C.faint }); text('DEC', x0 + 11.5 * w, y + h + 46, { align: 'center', color: C.faint });
}
function sceneCalendar(t) {
  const a = span(t, 9.2, 23.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('WHEN BAY OF BENGAL CYCLONES FORM · SCHEMATIC', CX, 136, { align: 'center', color: C.soft, spacing: '2px' });
    A(seg(t, 9.4, 10.0) * (1 - seg(t, 13.6, 14.0)), () => { font(600, 30); text('2026: the first named storm came on 26 October', CX, 220, { align: 'center', color: C.amber }); font(500, 24, TXT); text('usually there is one by April or May', CX, 262, { align: 'center', color: C.soft }); });
    A(seg(t, 9.6, 10.2), () => calendar(t, 300, 260, t > 15.0));
    A(seg(t, 10.4, 11.0) * (1 - seg(t, 13.6, 14.0)), () => {
      const x0 = 70, w = (W - 140) / 12;
      ctx.fillStyle = 'rgba(143,211,161,0.16)'; k.rrect(x0 + 3 * w + 3, 296, 2 * w - 6, 268, 8); ctx.fill();
      font(600, 20); text('usual first storm', x0 + 4 * w, 640, { align: 'center', color: C.green });
      const xo = x0 + 9.5 * w, top = 300 + 260 - 260 * (0.25 + 0.75 * SEASON[9] / 2);
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(xo, top - 8); ctx.lineTo(xo - 10, top - 26); ctx.lineTo(xo + 10, top - 26); ctx.closePath(); ctx.fill();
      font(700, 20); text('2026: 26 Oct', xo, top - 44, { align: 'center', color: C.amber });
    });
    A(seg(t, 18.6, 19.2), () => { ctx.fillStyle = 'rgba(255,107,87,0.18)'; k.rrect(70 + 5 * ((W - 140) / 12), 290, 4 * ((W - 140) / 12), 280, 10); ctx.fill(); font(600, 26); text('monsoon: June to September · hardly any cyclones', CX, 650, { align: 'center', color: C.red }); font(500, 22, TXT); text('the sea is warm, the rains pour, yet the storms stay weak', CX, 690, { align: 'center', color: C.soft }); });
  });
}

// ---------- C: the ingredients ----------
function sceneNeeds(t) {
  const a = span(t, 23.0, 32.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('WHAT A CYCLONE NEEDS', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    // a cross-section: warm sea at the bottom, a storm column rising
    const seaY = 560;
    const g = ctx.createLinearGradient(0, seaY, 0, 700); g.addColorStop(0, C.seaWarm); g.addColorStop(1, C.sea);
    ctx.fillStyle = g; ctx.fillRect(60, seaY, W - 120, 140);
    font(600, 24); text(`sea ≥ ${SST_MIN} °C`, 90, seaY + 40, { color: C.cyan });
    font(500, 22, TXT); text('warm to some depth: the fuel is moist, rising air', 90, seaY + 78, { color: C.soft });
    // rising moist air arrows and the storm
    for (let i = 0; i < 5; i++) { const u = ((t * 0.4) + i / 5) % 1; A(1 - u, () => { ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(CX - 120 + i * 60, seaY - 20 - u * 220, 6, 0, 7); ctx.fill(); }); }
    storm(CX, 410, 80, t * 2.5);
    A(seg(t, 27.8, 28.4), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 186, 744, 58, 12); ctx.fill();
      font(600, 24); text('spin', 84, 215, { color: C.amber }); font(500, 22, TXT); text('from Earth’s rotation, so weak right at the equator', 180, 215, { color: C.soft });
      ctx.fillStyle = C.panel; k.rrect(60, 256, 744, 58, 12); ctx.fill();
      font(600, 24); text('a seed', 84, 285, { color: C.amber }); font(500, 22, TXT); text('a cluster of thunderstorms to start from', 180, 285, { color: C.soft });
    });
  });
}

// ---------- D: shear ----------
function sceneShear(t) {
  const a = span(t, 32.2, 46.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const monsoon = t < 41.4;
    font(600, 24); text(monsoon ? 'WIND SHEAR · THE MONSOON MONTHS' : 'WIND SHEAR · WHEN THE MONSOON TURNS', CX, 136, { align: 'center', color: C.soft, spacing: '2px' });
    const seaY = 600;
    ctx.fillStyle = C.sea; ctx.fillRect(60, seaY, W - 120, 100);
    // winds at two heights
    const shear = monsoon ? eio(seg(t, 32.6, 35.0)) : 1 - eio(seg(t, 41.6, 44.0));
    const lowV = 1, highV = -1 * shear;
    const arrow = (y, v, lab) => {
      const len = 160 * Math.abs(v); if (len < 6) { font(500, 22, TXT); text('calm', CX, y, { align: 'center', color: C.green }); return; }
      const dir = Math.sign(v);
      ctx.strokeStyle = C.amber; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(CX - dir * len, y); ctx.lineTo(CX + dir * len, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CX + dir * len, y); ctx.lineTo(CX + dir * (len - 22), y - 16); ctx.moveTo(CX + dir * len, y); ctx.lineTo(CX + dir * (len - 22), y + 16); ctx.stroke(); ctx.lineCap = 'butt';
      font(500, 20, TXT); text(lab, 90, y, { color: C.soft });
    };
    arrow(230, highV, 'high up');
    arrow(540, lowV, 'near the sea');
    // the storm column, tilted by the shear
    const tilt = shear * 0.55;
    ctx.save(); ctx.translate(CX, seaY - 10); ctx.rotate(tilt);
    ctx.fillStyle = `rgba(201,210,214,${0.35})`; k.rrect(-60, -300, 120, 300, 30); ctx.fill();
    ctx.restore();
    storm(CX + Math.sin(tilt) * -150, seaY - 10 - Math.cos(tilt) * 150, 60, t * 2, 1 - 0.5 * shear);
    font(600, 24); text(shear > 0.5 ? 'the warm core is tipped and torn: a depression at most' : 'the core stays upright: a cyclone can grow', CX, 740, { align: 'center', color: shear > 0.5 ? C.red : C.green });
  });
}

// ---------- E + F: Arnab's week and the two seas ----------
function sceneWeek(t) {
  const a = eout(seg(t, 46.0, 46.8));
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('ARNAB’S WEEK · AND TWO SEAS', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    TIMELINE.forEach(([d, what], i) => A(eout(seg(t, 46.4 + i * 0.9, 47.0 + i * 0.9)), () => {
      const y = 200 + i * 60;
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(120, y, 7, 0, 7); ctx.fill();
      if (i < TIMELINE.length - 1) { ctx.fillStyle = C.line; ctx.fillRect(118, y + 8, 4, 44); }
      font(700, 24); text(d, 150, y, { color: C.amber }); font(500, 24, TXT); text(what, 260, y, { color: C.ink });
    }));
    A(seg(t, 51.0, 51.6), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 500, 744, 86, 12); ctx.fill();
      font(600, 24); text('it formed in an El Niño year', CX, 528, { align: 'center', color: C.amber });
      font(500, 22, TXT); text('research links El Niño to fewer and weaker Bay of Bengal storms', CX, 562, { align: 'center', color: C.soft });
    });
    A(seg(t, 55.6, 56.2), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 600, 744, 150, 12); ctx.fill();
      font(600, 26); text('Bay of Bengal', 86, 640, { color: C.cyan }); font(500, 22, TXT); text('warmer water, less shear: most of the ocean’s cyclones', 86, 676, { color: C.soft });
      font(600, 26); text('Arabian Sea', 86, 714, { color: C.soft }); font(500, 22, TXT); text('cooler surface, stronger shear: far fewer', 300, 714, { color: C.soft });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneCalendar(t);
    sceneNeeds(t);
    sceneShear(t);
    sceneWeek(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.amber, '~': C.cyan, '^': C.amber } });
  },
});
