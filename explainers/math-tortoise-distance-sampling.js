// Explainer for math-tortoise-distance-sampling: on 7 October 2026 the University of Exeter and the Seychelles
// Islands Foundation reported about 180,000 giant tortoises on Aldabra Atoll (best estimate almost 183,000 adults and
// sub-adults), up from the 1990s figure of 100,000, and warned that this does not mean the population nearly doubled:
// the old surveys did not count the tortoises that were there but not seen. How line-transect distance sampling counts
// the ones you miss. Look: a sun-bleached field notebook in sand and ink, tortoises in olive and umber, scrub in green,
// the transect line in brick red. Fraunces for numbers and titles, Alegreya Sans for captions.
//
// Facts: Hillyard et al., "Inferring the Abundance of an Island Megaherbivore From Semi-Structured Distance Sampling",
// Ecology and Evolution (2026), doi 10.1002/ece3.74282 (PMC13542991): Aldabra's four main islands cover 155.5 km²;
// since 2017 surveyors record the perpendicular distance of each tortoise from a central line transect; 18 transects
// divided into 50 m sections; two observers walk each between sunrise and 09:00, before tortoises seek shade;
// observations truncated at 50 m; a half-normal detection function, whose scale depends on habitat; all tortoises on
// the line assumed seen; tortoises detectable farther in open habitats and less in dense scrub, mangrove and Pemphis;
// density = abundance / (2 x line length x truncation distance), extrapolated by mapped habitat areas; mean estimate
// 2018–2021 of 183,274 (SD 12,172); juveniles hide, so the estimate applies to adults and sub-adults; 1990s estimate
// 100,000; exploitation in the 1800s left fewer than a thousand. University of Exeter news (7 October 2026):
// approximately 180,000, best estimate almost 183,000 adults and sub-adults, more than the human population of the
// Seychelles; "does not mean the population has nearly doubled since 1999", earlier surveys did not account for
// tortoises present but not seen; highest densities in grassland ("tortoise turf").
// Computed here: an illustrative survey of 400 tortoises spread evenly up to 50 m from a line, each seen with the
// half-normal chance exp(-d²/2σ²) (σ = 18 m for open ground, 8 m for scrub, both illustrations); the effective strip
// half-width μ = ∫ g(d) dd over 0–50 m; the corrected count n·50/μ. The atoll map is schematic.
//
// Scene plan (65.0 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0–14.2  Hook: about 180,000 tortoises; 100,000 in the 1990s; nearly double? Not quite.
//  B 14.2–28.0  Walk a line at dawn; note each tortoise's distance at right angles; far ones hide.
//  C 28.0–41.8  The detection curve; the effective strip; density from the strip's area.
//  D 41.8–55.4  Dense scrub: a narrower curve, each sighting counts for more; habitat by habitat; the result.
//  E 55.4–65.0  The old surveys missed hidden tortoises; from under 1,000 to a baseline.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#efe6d2', paper2: '#e5d9bf', ink: '#2b2a24', soft: 'rgba(43,42,36,0.72)', faint: 'rgba(43,42,36,0.30)',
  shell: '#6b5b3a', shell2: '#8a7550', skin: '#9a8b6c', scrub: '#4f7a4a', scrubSoft: 'rgba(79,122,74,0.30)',
  grass: '#a8b86a', line: '#c2452d', curve: '#2f6f8f', strip: 'rgba(47,111,143,0.22)', panel: 'rgba(250,246,236,0.92)',
  missed: 'rgba(107,91,58,0.35)',
};
const NUM = 'Fraunces', CAP = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = CAP) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the facts ----------
const ESTIMATE = 183274, SD = 12172, OLD = 100000, HEADLINE = 180000, AREA_KM2 = 155.5, TRUNC = 50, BEFORE = 1000;
const round1000 = (n) => Math.round(n / 1000) * 1000;

// ---------- the illustrative survey ----------
const g = (d, sigma) => Math.exp(-(d * d) / (2 * sigma * sigma));
/** Effective strip half-width: the area under the detection curve from 0 to the truncation distance. */
function mu(sigma, w = TRUNC) { let s = 0; const n = 500; for (let i = 0; i < n; i++) s += g(((i + 0.5) / n) * w, sigma); return (s / n) * w; }
function survey(sigma, seed = 5, n = 400) {
  let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts = [];
  for (let i = 0; i < n; i++) { const d = r() * TRUNC, x = r(); pts.push({ d, x, side: r() < 0.5 ? -1 : 1, seen: r() < g(d, sigma) }); }
  return pts;
}
const OPEN = 18, SCRUB = 8;
const OPEN_PTS = survey(OPEN), SCRUB_PTS = survey(SCRUB, 11);
const seenCount = (pts) => pts.filter((p) => p.seen).length;
const MU_OPEN = mu(OPEN), MU_SCRUB = mu(SCRUB);

const CUES = [
  [0.4, 4.8, `On 7 October 2026, scientists put Aldabra’s giant tortoises at about *${HEADLINE.toLocaleString('en-US')}*.`],
  [5.0, 9.4, `Aldabra is an atoll in the Seychelles. The last estimate, from the 1990s, was ~${OLD.toLocaleString('en-US')}~.`],
  [9.6, 14.0, 'Nearly double? Not quite: part of the jump comes from counting the tortoises nobody saw.'],
  [14.2, 18.6, `No one can count every tortoise on ${AREA_KM2} km² of atoll. So surveyors walk set lines at dawn.`],
  [18.8, 23.2, 'For each tortoise they see, they note how far it is from the line, at right angles.'],
  [23.4, 27.8, 'Near the line they spot almost every one. Farther out, more hide in shade and bushes.'],
  [28.0, 32.4, 'Sort the sightings by distance and they thin out: that falling line is the *detection curve*.'],
  [32.6, 37.0, 'Squeeze the curve into a strip where you’d see every one: its width is the ^effective strip^.'],
  [37.2, 41.6, 'Tortoises per square kilometre = tortoises seen ÷ the area of that strip, both sides of the line.'],
  [41.8, 46.2, 'In dense scrub the curve drops fast, so each sighting stands for ~more~ tortoises.'],
  [46.4, 50.8, 'The team fitted a curve for each habitat and scaled up by that habitat’s area on the atoll.'],
  [51.0, 55.4, `Result: about *${round1000(ESTIMATE).toLocaleString('en-US')}* adults and sub-adults, give or take some ${round1000(SD).toLocaleString('en-US')}, in 2018–2021.`],
  [55.6, 60.0, `So the rise from ${OLD.toLocaleString('en-US')} is partly a better count: the old surveys missed hidden tortoises.`],
  [60.2, 64.6, `From fewer than ${BEFORE.toLocaleString('en-US')} in the 1800s to a new baseline, worth counting again.`],
];

// ---------- background: paper ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const gg = bg.getContext('2d');
  gg.fillStyle = C.paper; gg.fillRect(0, 0, W, H);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) { gg.fillStyle = `rgba(120,100,60,${0.02 + r() * 0.04})`; gg.fillRect(r() * W, r() * H, 1.5, 1.5); }
  gg.strokeStyle = 'rgba(47,111,143,0.10)'; gg.lineWidth = 1;
  for (let y = 60; y < 800; y += 36) { gg.beginPath(); gg.moveTo(30, y); gg.lineTo(W - 30, y); gg.stroke(); }
}

// ---------- drawings ----------
/** A tortoise seen from above, facing right; `ghost` draws a missed one in outline. */
function tortoise(x, y, s, { ghost = false, dir = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  if (ghost) {
    ctx.strokeStyle = C.missed; ctx.lineWidth = 2.5 / s; ctx.setLineDash([4 / s, 4 / s]);
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 13, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  } else {
    ctx.fillStyle = C.skin;
    ctx.beginPath(); ctx.ellipse(20, 0, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    for (const [lx, ly] of [[11, 11], [11, -11], [-11, 11], [-11, -11]]) { ctx.beginPath(); ctx.ellipse(lx, ly, 4, 4, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.shell; ctx.beginPath(); ctx.ellipse(0, 0, 18, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.shell2; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(-8, 10); ctx.moveTo(8, -10); ctx.lineTo(8, 10); ctx.moveTo(-17, 0); ctx.lineTo(17, 0); ctx.stroke();
  }
  ctx.restore();
}
function bush(x, y, r) {
  ctx.fillStyle = C.scrubSoft;
  for (let i = 0; i < 5; i++) { const a = i * 1.3; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.4, r * 0.6, 0, Math.PI * 2); ctx.fill(); }
}
function panel(x, y, w, h, r = 16) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, r); ctx.fill(); ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; k.rrect(x, y, w, h, r); ctx.stroke(); }
function note(s, y = 770) { font(400, 20); text(s, W / 2, y, { color: C.faint, align: 'center' }); }

// ---------- A: the hook ----------
function hook(t) {
  const a = span(t, 0, 14.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const n = Math.round(HEADLINE * eout(seg(t, 0.6, 3.0)));
    font(800, 104, NUM); text(n.toLocaleString('en-US'), W / 2, 230, { color: C.ink, align: 'center' });
    font(500, 30); text('giant tortoises on Aldabra', W / 2, 310, { color: C.soft, align: 'center' });
    // a herd of tortoises
    for (let i = 0; i < 11; i++) tortoise(150 + i * 58, 380 + (i % 2) * 18, 1.0, { dir: i % 3 ? 1 : -1 });
    // the comparison bars
    A(seg(t, 5.6, 6.2), () => {
      const L = 140, max = 560, y = 480;
      const grow = eout(seg(t, 5.6, 7.0));
      ctx.fillStyle = C.shell2; ctx.fillRect(L, y, (max * OLD / HEADLINE) * grow, 54);
      ctx.fillStyle = C.shell; ctx.fillRect(L, y + 80, max * grow, 54);
      font(700, 26, NUM); text('1990s: 100,000', L + 10, y + 27, { color: C.paper });
      text('2018–21: about 180,000', L + 10, y + 107, { color: C.paper });
    });
    A(seg(t, 9.8, 10.3), () => {
      font(800, 60, NUM); text('×2 ?', 760, 560, { color: C.line, align: 'right' });
      font(600, 24); text('partly the tortoises nobody saw', W / 2, 700, { color: C.line, align: 'center' });
    });
  });
}

// ---------- B: walking the line ----------
const LY = 420; // the transect line's y
const PX = 4.2; // px per metre across the line
function field(t, pts, { x0 = 60, x1 = 804, upto = 1, bushes = 0.4, measure = 0, n = 140 } = {}) {
  // scrub patches
  let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 30 * bushes; i++) bush(x0 + r() * (x1 - x0), LY + (r() * 2 - 1) * TRUNC * PX, 14 + r() * 16);
  // the line
  ctx.strokeStyle = C.line; ctx.lineWidth = 5; ctx.setLineDash([16, 10]);
  ctx.beginPath(); ctx.moveTo(x0, LY); ctx.lineTo(x1, LY); ctx.stroke(); ctx.setLineDash([]);
  // the truncation edges
  ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
  for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x0, LY + sgn * TRUNC * PX); ctx.lineTo(x1, LY + sgn * TRUNC * PX); ctx.stroke(); }
  ctx.setLineDash([]);
  font(500, 20); text(`${TRUNC} m`, x1 - 4, LY - TRUNC * PX - 14, { color: C.faint, align: 'right' });
  // tortoises
  const walker = lerp(x0, x1, upto);
  for (let i = 0; i < Math.min(n, pts.length); i++) {
    const p = pts[i], x = x0 + p.x * (x1 - x0), y = LY + p.side * p.d * PX;
    const passed = x < walker;
    if (p.seen && passed) tortoise(x, y, 0.62, { dir: i % 2 ? 1 : -1 });
    else tortoise(x, y, 0.62, { ghost: true });
    if (measure > 0 && p.seen && passed && i % 6 === 0) A(measure, () => {
      ctx.strokeStyle = C.curve; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, LY); ctx.stroke();
    });
  }
  // the walker
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(walker, LY, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(walker, LY, 5, 0, Math.PI * 2); ctx.fill();
}
function walk(t) {
  const a = span(t, 14.2, 28.0, 0.4, 0.5);
  if (a <= 0) return;
  A(a, () => {
    font(700, 28, NUM); text('a transect at dawn', 60, 150, { color: C.ink });
    font(400, 22); text('surveyors walk the red line and note each tortoise they see', 60, 186, { color: C.soft });
    const upto = eio(seg(t, 14.8, 26.0));
    field(t, OPEN_PTS, { upto, measure: seg(t, 19.2, 19.8) });
    A(seg(t, 19.4, 19.9), () => {
      // one measured distance, labelled
      const p = OPEN_PTS.find((q) => q.seen && q.d > 20 && q.side < 0 && q.x < 0.5);
      const x = 60 + p.x * 744, y = LY + p.side * p.d * PX;
      ctx.strokeStyle = C.curve; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, LY); ctx.stroke();
      font(700, 24, NUM); text(`${Math.round(p.d)} m`, x + 12, (y + LY) / 2, { color: C.curve });
    });
    A(seg(t, 23.8, 24.3), () => {
      font(600, 22); text('solid: seen · dashed: there, but missed', W / 2, 680, { color: C.soft, align: 'center' });
    });
    note('illustration: 140 tortoises within 50 m of a line', 770);
  });
}

// ---------- C: the detection curve and the strip ----------
const GX = 120, GY = 640, GW = 640, GH = 400; // the graph: x = distance 0–50 m, y = share seen
const gx = (d) => GX + (d / TRUNC) * GW, gy = (p) => GY - p * GH;
function axes() {
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(GX, GY - GH - 10); ctx.lineTo(GX, GY); ctx.lineTo(GX + GW + 10, GY); ctx.stroke();
  font(500, 20); for (let d = 0; d <= TRUNC; d += 10) text(String(d), gx(d), GY + 22, { color: C.soft, align: 'center' });
  text('metres from the line', GX + GW / 2, GY + 52, { color: C.soft, align: 'center' });
  text('share seen', GX - 14, GY - GH - 26, { color: C.soft });
  for (const p of [0.5, 1]) text(p === 1 ? 'all' : 'half', GX - 12, gy(p), { color: C.faint, align: 'right' });
}
function histogram(pts, bins = 10) {
  const counts = Array(bins).fill(0), totals = Array(bins).fill(0);
  for (const p of pts) { const b = Math.min(bins - 1, Math.floor((p.d / TRUNC) * bins)); totals[b]++; if (p.seen) counts[b]++; }
  return counts.map((c, i) => c / totals[i]);
}
function curveScene(t) {
  const a = span(t, 28.0, 41.8, 0.4, 0.5);
  if (a <= 0) return;
  A(a, () => {
    axes();
    const hist = histogram(OPEN_PTS);
    const grow = eout(seg(t, 28.4, 30.0));
    hist.forEach((h, i) => {
      const x0 = gx((i * TRUNC) / 10) + 4, x1 = gx(((i + 1) * TRUNC) / 10) - 4;
      ctx.fillStyle = 'rgba(107,91,58,0.55)'; ctx.fillRect(x0, gy(h * grow), x1 - x0, h * grow * GH);
    });
    // the fitted curve
    const c = seg(t, 30.4, 31.8);
    ctx.strokeStyle = C.curve; ctx.lineWidth = 6; ctx.beginPath();
    for (let i = 0; i <= 100 * c; i++) { const d = (i / 100) * TRUNC; i ? ctx.lineTo(gx(d), gy(g(d, OPEN))) : ctx.moveTo(gx(d), gy(g(d, OPEN))); }
    ctx.stroke();
    A(seg(t, 31.0, 31.5), () => { font(700, 26, NUM); text('detection curve', gx(24), gy(0.72), { color: C.curve }); });
    // the effective strip: a box of height 1 and width μ with the same area as under the curve
    const sq = eio(seg(t, 33.0, 35.0));
    if (sq > 0) {
      ctx.fillStyle = C.strip; ctx.beginPath(); ctx.moveTo(gx(0), GY);
      for (let i = 0; i <= 100; i++) { const d = (i / 100) * TRUNC; const y = lerp(g(d, OPEN), d <= MU_OPEN ? 1 : 0, sq); ctx.lineTo(gx(d), gy(y)); }
      ctx.lineTo(gx(TRUNC), GY); ctx.closePath(); ctx.fill();
      A(seg(t, 35.0, 35.5), () => {
        ctx.strokeStyle = C.curve; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.moveTo(gx(MU_OPEN), gy(1.05)); ctx.lineTo(gx(MU_OPEN), GY); ctx.stroke(); ctx.setLineDash([]);
        font(700, 26, NUM); text(`effective strip ≈ ${Math.round(MU_OPEN)} m`, gx(MU_OPEN) + 12, gy(1.0) - 4, { color: C.curve });
        font(400, 20); text('same area as under the curve', gx(MU_OPEN) + 12, gy(1.0) + 26, { color: C.soft });
      });
    }
    // the formula
    A(seg(t, 37.4, 37.9), () => {
      panel(70, 128, 724, 70, 14);
      const seen = seenCount(OPEN_PTS);
      font(700, 22, NUM); text(`${seen} seen × (${TRUNC} m ÷ ${Math.round(MU_OPEN)} m) ≈ ${Math.round((seen * TRUNC) / MU_OPEN)} in the band · really there: 400`, W / 2, 163, { color: C.ink, align: 'center' });
    });
    note(`illustration: 400 tortoises, ${seenCount(OPEN_PTS)} seen; curve shape as in the study (half-normal)`, 770);
  });
}

// ---------- D: dense scrub, habitats, the result ----------
function scrub(t) {
  const a = span(t, 41.8, 46.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    axes();
    const m = eio(seg(t, 42.2, 43.6));
    const draw = (sigma, color, w) => { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const d = (i / 100) * TRUNC; i ? ctx.lineTo(gx(d), gy(g(d, sigma))) : ctx.moveTo(gx(d), gy(g(d, sigma))); } ctx.stroke(); };
    draw(OPEN, 'rgba(47,111,143,0.45)', 4);
    A(m, () => draw(SCRUB, C.scrub, 6));
    font(700, 24, NUM); text('open ground', gx(26), gy(0.5), { color: C.curve });
    A(m, () => {
      text('dense scrub', gx(11), gy(0.22), { color: C.scrub });
      panel(420, 150, 360, 110, 14);
      font(600, 24); text(`strip ≈ ${Math.round(MU_SCRUB)} m instead of ${Math.round(MU_OPEN)} m`, 600, 186, { color: C.scrub, align: 'center' });
      text(`1 sighting stands for about ${(TRUNC / MU_SCRUB).toFixed(0)} tortoises`, 600, 226, { color: C.ink, align: 'center' });
    });
    note('illustration', 770);
  });
}
/** A schematic atoll: a ring of land around a lagoon, in habitat colours. */
function atoll(t, cx, cy, grow = 1) {
  const habs = [[C.grass, 0.0, 0.9], [C.scrub, 0.9, 3.2], ['#c8b98c', 3.2, 3.8], ['#3d6b5a', 3.8, 4.6], [C.scrub, 4.6, 6.0], [C.grass, 6.0, 2 * Math.PI]];
  for (const [col, a0, a1] of habs) {
    ctx.strokeStyle = col; ctx.lineWidth = 46 * grow;
    ctx.beginPath(); ctx.ellipse(cx, cy, 250, 150, 0.15, a0, a1); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(47,111,143,0.25)'; ctx.beginPath(); ctx.ellipse(cx, cy, 218, 120, 0.15, 0, Math.PI * 2); ctx.fill();
  font(500, 22); text('lagoon', cx, cy, { color: C.curve, align: 'center' });
}
function habitats(t) {
  const a = span(t, 46.4, 55.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    atoll(t, W / 2, 380, eout(seg(t, 46.6, 47.6)));
    A(span(t, 47.6, 51.0, 0.3, 0.3), () => {
      font(600, 22); text('grassland: seen far, most tortoises', 640, 200, { color: '#6c7a30', align: 'center' });
      text('dense scrub: hard to see', 190, 590, { color: C.scrub, align: 'center' });
      text('mangrove', 720, 560, { color: '#3d6b5a', align: 'center' });
      font(400, 20); text(`each habitat: its own curve × its own area (atoll land ${AREA_KM2} km²)`, W / 2, 680, { color: C.soft, align: 'center' });
    });
    A(seg(t, 51.2, 51.8), () => {
      panel(170, 270, 524, 220, 18);
      const n = Math.round(ESTIMATE * eout(seg(t, 51.2, 52.8)) / 1000) * 1000;
      font(800, 86, NUM); text(`≈ ${n.toLocaleString('en-US')}`, W / 2, 360, { color: C.ink, align: 'center' });
      font(600, 26); text(`± about ${round1000(SD).toLocaleString('en-US')} · 2018–2021`, W / 2, 430, { color: C.soft, align: 'center' });
      font(400, 20); text('adults and sub-adults: young ones hide too well to count', W / 2, 466, { color: C.faint, align: 'center' });
    });
    note('schematic atoll, not to scale', 770);
  });
}

// ---------- E: the old count, the baseline ----------
function oldCount(t) {
  const a = span(t, 55.6, 60.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the same survey counted the old way (just the ones seen) vs corrected
    const seen = seenCount(SCRUB_PTS), corrected = Math.round((seen * TRUNC) / MU_SCRUB);
    const L = 140, max = 580;
    font(700, 28, NUM); text('one survey in scrub, counted two ways', 100, 170, { color: C.ink });
    const grow = eout(seg(t, 55.9, 57.2));
    ctx.fillStyle = C.shell2; ctx.fillRect(L, 240, max * (seen / 400) * grow, 60);
    ctx.fillStyle = C.curve; ctx.fillRect(L, 340, max * (corrected / 400) * grow, 60);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(L + max, 220); ctx.lineTo(L + max, 420); ctx.stroke(); ctx.setLineDash([]);
    font(600, 24); text(`only those seen: ${seen}`, L, 228 - 6, { color: C.shell });
    text(`corrected: ≈ ${corrected}`, L, 328 - 6, { color: C.curve });
    text('really there: 400', L + max, 440, { color: C.ink, align: 'right' });
    note('illustration', 770);
  });
}
function finale(t) {
  const a = seg(t, 60.2, 60.7);
  if (a <= 0) return;
  A(a, () => {
    const L = 100, R = 764, y = 420;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
    const items = [[L + 10, '1800s', `under ${BEFORE.toLocaleString('en-US')}`, 0.12], [L + 380, '1990s', OLD.toLocaleString('en-US'), 0.6], [R - 10, '2018–21', `≈ ${round1000(ESTIMATE).toLocaleString('en-US')}`, 1]];
    items.forEach(([x, when, what, s], i) => {
      A(seg(t, 60.8 + i * 0.7, 61.3 + i * 0.7), () => {
        tortoise(x, y - 60, 0.6 + 1.2 * s);
        font(700, 30, NUM); text(when, x, y + 40, { color: C.ink, align: i === 0 ? 'left' : i === 2 ? 'right' : 'center' });
        font(500, 24); text(what, x, y + 76, { color: C.soft, align: i === 0 ? 'left' : i === 2 ? 'right' : 'center' });
      });
    });
    A(seg(t, 63.0, 63.5), () => { font(600, 22); text('the new count is a baseline to track the tortoises from', W / 2, 600, { color: C.curve, align: 'center' }); });
  });
}

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [NUM, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    hook(t);
    walk(t);
    curveScene(t);
    scrub(t);
    habitats(t);
    oldCount(t);
    finale(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 38, weight: 500, family: CAP, ink: C.ink, marks: { '*': C.curve, '~': C.line, '^': C.curve } });
  },
});
