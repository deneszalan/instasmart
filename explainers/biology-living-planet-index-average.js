// Explainer for biology-living-planet-index-average: what the Living Planet Report's "73% decline" measures,
// and what it doesn't. Look: a dusk forest, deep green with moss and fern tones; populations drawn as clusters of
// dots (one dot, one animal); rising populations in teal, falling ones in amber, the index in pale gold.
// Alegreya (a lively book serif) for captions, Alegreya Sans for numbers and labels.
//
// Facts: ZSL and WWF, "A deep dive into the Living Planet Index 2026: a technical report" (Marconi et al.,
// the LPR 2026 Technical Supplement, osf.io/wravx): the global LPI shows an average decline of 73% in the
// relative abundance of monitored vertebrate populations between 1970 and 2022 (95% confidence limits −78% and
// −67%), based on 35,803 populations of 5,790 species of mammals, birds, reptiles, amphibians and fish;
// freshwater −85%, terrestrial −69%, marine −59%; Latin America and the Caribbean −95%, Africa −80%, Asia and
// the Pacific −49%, North America −28%, Europe and Central Asia −23%. The index is the cumulative average rate of
// change in population size, based on relative, not absolute, change; it does not show numbers of individuals
// lost or extinctions. Figure 4 example: populations of 400, 50 and 33 become 420 (+5%), 20 (−60%) and 33 (0%):
// the average change is −18% while 10 of 483 animals (2%) were lost. The LPI uses a geometric mean, which treats
// a doubling and a halving symmetrically. About half the populations show a stable or increasing trend and half a
// declining one (Figure 3: 43.1% increase, 6.9% stable, 50.0% decrease); the declines are larger than the
// increases, and species-rich groups such as Neotropical amphibians and reptiles and Afrotropical fish weigh more
// and decline more. Removing 10% of the most positive and most negative trends changes −73% to −64%.
// LPI FAQs 2026 (livingplanetindex.org): the report is published every two years; the most recent in October
// 2026. The yearly rate is computed here: 0.27^(1/52).
//
// Scene plan (64.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The headline: −73% since 1970; is it 3 in 4 animals gone? No.
//  B  9.2–18.4  What goes in: 35,803 populations; each one's relative change.
//  C 18.4–36.8  The report's three-population example; the geometric mean; 2.5% a year.
//  D 36.8–46.0  Half the populations are stable or rising; species-rich groups weigh more.
//  E 46.0–59.8  Freshwater, land, sea; regions; the test without extremes.
//  F 59.8–64.4  A quarter of its 1970 size, on average.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#0e1d18', bg2: '#183229', ink: '#eef2e4', soft: 'rgba(238,242,228,0.74)', faint: 'rgba(238,242,228,0.30)',
  up: '#5cc8b2', down: '#f2a84b', gold: '#f3d37a', moss: '#7da35a', panel: 'rgba(8,20,16,0.80)', line: 'rgba(238,242,228,0.16)',
};
const SERIF = 'Alegreya', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const n0 = (v) => v.toLocaleString('en-US');

// ---------- the numbers (LPR 2026 Technical Supplement) ----------
const LPI = -73, YEARS = 2022 - 1970, POPS = 35803, SPECIES = 5790;
const PER_YEAR = (1 - Math.pow(1 + LPI / 100, 1 / YEARS)) * 100; // 2.5% a year
const EXAMPLE = [[400, 420], [50, 20], [33, 33]];
const pct = ([a, b]) => Math.round(((b - a) / a) * 100);
const AVG = Math.round(EXAMPLE.reduce((s, p) => s + pct(p), 0) / EXAMPLE.length); // −18
const BEFORE = EXAMPLE.reduce((s, p) => s + p[0], 0), AFTER_ = EXAMPLE.reduce((s, p) => s + p[1], 0); // 483, 473
const LOST = BEFORE - AFTER_, LOST_PCT = Math.round((LOST / BEFORE) * 100); // 10, 2%
const SHARES = { up: 43.1, flat: 6.9, down: 50.0 };
const SYSTEMS = [['Freshwater', -85], ['On land', -69], ['In the sea', -59]];
const REGIONS = [['Latin America & Caribbean', -95], ['Africa', -80], ['Asia & Pacific', -49], ['North America', -28], ['Europe & Central Asia', -23]];
const TRIMMED = -64;

const CUES = [
  [0.4, 4.6, `In October 2026, the conservation group WWF reported that monitored wildlife fell *${-LPI}%* on average since 1970.`],
  [4.8, 9.0, 'Does that mean almost three in four wild animals are gone? ~No~: it measures something else.'],
  [9.2, 13.6, `Its index, run by the Zoological Society of London, follows *${n0(POPS)}* populations of ${n0(SPECIES)} species.`],
  [13.8, 18.2, 'It averages each population’s *relative change*, not the number of animals.'],
  [18.4, 22.8, 'The index’s makers give an example: 400 animals become 420, 50 become 20, and 33 stay 33.'],
  [23.0, 27.4, `The average change is *${AVG}%*. Yet only ${LOST} of ${BEFORE} animals were lost: ~${LOST_PCT}%~.`],
  [27.6, 32.0, 'The real index averages so that a *doubling* and a *halving* cancel out.'],
  [32.2, 36.6, `Over ${YEARS} years, ${LPI}% works out to an average fall of about *${PER_YEAR.toFixed(1)}% a year*.`],
  [36.8, 41.2, 'About *half* the populations are stable or growing. The declines are just much deeper.'],
  [41.4, 45.8, 'Species-rich groups count for more, and many fall steeply, like amphibians in Latin America.'],
  [46.0, 50.4, 'Freshwater populations fell most, by *85%*. On land, 69%; in the sea, 59%.'],
  [50.6, 55.0, 'Latin America and the Caribbean: *95%*. Africa: 80%. Europe and Central Asia: 23%.'],
  [55.2, 59.6, `Leave out the most extreme rising and falling trends, and it still shows a fall of ~${-TRIMMED}%~.`],
  [59.8, 64.2, 'So it’s not a head count: on average, a monitored population is about *a quarter* of its 1970 size.'],
];

// ---------- background: dusk forest ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg2); lg.addColorStop(1, C.bg);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // a line of conifers along the bottom of the picture area, very faint
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.fillStyle = 'rgba(125,163,90,0.07)';
  for (let i = 0; i < 26; i++) {
    const x = i * 36 + r() * 20, h = 90 + r() * 90, base = 760;
    g.beginPath(); g.moveTo(x, base - h); g.lineTo(x + 26, base); g.lineTo(x - 26, base); g.closePath(); g.fill();
  }
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(238,242,228,${r() * 0.025})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
}

// ---------- dots ----------
/** n dots in a loose round cluster centred on (cx, cy); seed fixes their places. */
function cluster(cx, cy, n, color, { seed = 1, r = 4.2, spread = 6.4, shown = n } = {}) {
  let s = seed * 9301 + 49297; const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    // sunflower layout, jittered
    const a = i * 2.39996, d = Math.sqrt(i + 0.5) * spread;
    const x = cx + Math.cos(a) * d + (rand() - 0.5) * 2, y = cy + Math.sin(a) * d + (rand() - 0.5) * 2;
    if (i >= shown) continue;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- A: the headline ----------
function headline(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    const g = eio(seg(t, 0.6, 3.0));
    font(500, 28); text('Living Planet Report 2026: monitored vertebrate populations', W / 2, 150, { color: C.soft, align: 'center' });
    // two bars: 1970 = 1, 2022 = 0.27
    const L = 150, base = 640, top = 230, bw = 190;
    ctx.save(); ctx.globalAlpha *= 1 - 0.8 * seg(t, 4.8, 5.4);
    ctx.fillStyle = C.faint; ctx.fillRect(L, top, bw, base - top);
    const v = lerp(1, 1 + LPI / 100, g), h = (base - top) * v;
    ctx.fillStyle = C.gold; ctx.fillRect(W - L - bw, base - h, bw, h);
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(L + bw, top); ctx.lineTo(W - L - bw, top); ctx.stroke(); ctx.setLineDash([]);
    font(600, 30); text('1970', L + bw / 2, base + 36, { align: 'center' }); text('2022', W - L - bw / 2, base + 36, { align: 'center' });
    font(800, 66, SERIF); text(`${Math.round((v - 1) * 100)}%`, W - L - bw / 2, base - h - 48, { color: C.gold, align: 'center' });
    font(600, 26); text('1.00', L + bw / 2, top + 30, { color: C.bg, align: 'center' });
    ctx.restore();
    // the question: three in four animals gone?
    A(seg(t, 5.0, 5.6), () => {
      ctx.fillStyle = C.panel; k.rrect(170, 300, 524, 200, 22); ctx.fill();
      for (let i = 0; i < 4; i++) {
        const gone = i < 3;
        ctx.globalAlpha = gone ? 0.25 : 1;
        cluster(250 + i * 120, 380, 1, C.ink, { r: 26 });
        ctx.globalAlpha = 1;
      }
      font(600, 26); text('3 in 4 animals gone?', W / 2, 460, { color: C.soft, align: 'center' });
      const x = eio(seg(t, 6.6, 7.2));
      ctx.strokeStyle = C.down; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(200, 330); ctx.lineTo(lerp(200, 664, x), lerp(330, 480, x)); ctx.stroke();
    });
  });
}

// ---------- B: what goes in ----------
const POP_SPOTS = Array.from({ length: 42 }, (_, i) => ({ x: 110 + (i % 7) * 107, y: 220 + Math.floor(i / 7) * 82, n: 6 + ((i * 37) % 23), up: (i * 53) % 100 < 50 }));
function inputs(t) {
  const a = span(t, 9.2, 18.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 26); text('each cluster: one population, counted year after year', W / 2, 150, { color: C.soft, align: 'center' });
    const grow = seg(t, 9.6, 12.0);
    const rel = eio(seg(t, 14.2, 15.6));
    POP_SPOTS.forEach((p, i) => {
      const shown = i < Math.floor(grow * POP_SPOTS.length) + 1;
      if (!shown) return;
      cluster(p.x, p.y, p.n, rel > 0 ? (p.up ? C.up : C.down) : C.ink, { seed: i + 1, r: 3, spread: 4.4 });
    });
    A(seg(t, 12.0, 12.6) * (1 - rel), () => {
      ctx.fillStyle = C.panel; k.rrect(232, 680, 400, 64, 16); ctx.fill();
      font(700, 30); text(`${n0(POPS)} populations`, W / 2, 712, { color: C.gold, align: 'center' });
    });
    A(rel, () => {
      ctx.fillStyle = C.panel; k.rrect(172, 680, 520, 64, 16); ctx.fill();
      font(600, 26); text('what counts is each one’s % change', W / 2, 712, { color: C.ink, align: 'center' });
    });
  });
}

// ---------- C: the example ----------
function example(t) {
  const a = span(t, 18.4, 27.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 26); text('the report’s example: one dot = one animal', W / 2, 150, { color: C.soft, align: 'center' });
    const xs = [170, 470, 700];
    const ch = eio(seg(t, 19.6, 21.4));
    EXAMPLE.forEach(([b, e], i) => {
      const n = Math.round(lerp(b, e, ch));
      const color = e > b ? C.up : e < b ? C.down : C.ink;
      const spread = i === 0 ? 5.6 : 6.2;
      cluster(xs[i], 370, Math.max(b, e), color, { seed: 11 + i, r: i === 0 ? 3.4 : 4, spread, shown: n });
      font(700, 30); text(`${n}`, xs[i], 560, { color, align: 'center' });
      A(seg(t, 21.4, 21.9), () => { font(800, 34, SERIF); text(`${pct([b, e]) > 0 ? '+' : pct([b, e]) < 0 ? '−' : ''}${Math.abs(pct([b, e]))}%`, xs[i], 606, { color, align: 'center' }); });
      font(400, 22); text(`was ${b}`, xs[i], 646, { color: C.soft, align: 'center' });
    });
    A(seg(t, 23.2, 23.8), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 680, 330, 72, 16); ctx.fill(); k.rrect(444, 680, 330, 72, 16); ctx.fill();
      font(500, 20); text('average change', 255, 700, { color: C.soft, align: 'center' }); text('animals lost', 609, 700, { color: C.soft, align: 'center' });
      font(800, 30, SERIF); text(`${AVG}%`, 255, 732, { color: C.gold, align: 'center' });
      text(`${LOST} of ${BEFORE} = ${LOST_PCT}%`, 609, 732, { color: C.down, align: 'center' });
    });
  });
}
function geometric(t) {
  const a = span(t, 27.6, 32.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 26); text('two populations, ten years', W / 2, 150, { color: C.soft, align: 'center' });
    const g = eio(seg(t, 28.0, 29.6));
    // one doubles, one halves
    cluster(240, 360, 40, C.up, { seed: 3, r: 4, spread: 6, shown: Math.round(lerp(20, 40, g)) });
    cluster(620, 360, 20, C.down, { seed: 4, r: 4, spread: 6, shown: Math.round(lerp(20, 10, g)) });
    font(800, 40, SERIF); text('× 2', 240, 500, { color: C.up, align: 'center' }); text('× ½', 620, 500, { color: C.down, align: 'center' });
    A(seg(t, 29.8, 30.4), () => {
      ctx.fillStyle = C.panel; k.rrect(132, 560, 600, 130, 18); ctx.fill();
      font(600, 26); text('the index multiplies the changes:', W / 2, 594, { color: C.soft, align: 'center' });
      font(800, 38, SERIF); text('√(2 × ½) = 1: no change', W / 2, 648, { color: C.gold, align: 'center' });
    });
  });
}
function perYear(t) {
  const a = span(t, 32.2, 36.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 26); text(`a steady fall of ${PER_YEAR.toFixed(1)}% a year, compounded`, W / 2, 150, { color: C.soft, align: 'center' });
    const L = 120, R = 760, T = 230, B = 640;
    const X = (y) => lerp(L, R, (y - 1970) / YEARS), Y = (v) => lerp(B, T, v);
    ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    font(500, 22);
    for (const v of [0, 0.25, 0.5, 0.75, 1]) text(v.toFixed(2), L - 14, Y(v), { color: C.soft, align: 'right' });
    for (const y of [1970, 1990, 2010]) text(String(y), X(y), B + 28, { color: C.soft, align: 'center' });
    text('2022', X(2022), B + 28, { color: C.soft, align: 'right' });
    const g = eio(seg(t, 32.6, 34.8)), end = 1970 + YEARS * g;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.beginPath();
    for (let y = 1970; y <= end; y += 0.25) { const v = Math.pow(1 - PER_YEAR / 100, y - 1970); y === 1970 ? ctx.moveTo(X(y), Y(v)) : ctx.lineTo(X(y), Y(v)); }
    ctx.stroke();
    A(seg(t, 34.8, 35.4), () => {
      const v = Math.pow(1 - PER_YEAR / 100, YEARS);
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(X(2022), Y(v), 9, 0, Math.PI * 2); ctx.fill();
      font(800, 34, SERIF); text(`${v.toFixed(2)}, or ${LPI}%`, X(2022) - 20, Y(v) + 52, { color: C.gold, align: 'right' });
    });
    font(400, 22); text('illustration: the real index rises and falls from year to year', W / 2, 712, { color: C.soft, align: 'center' });
  });
}

// ---------- D: half are fine; weights ----------
function shares(t) {
  const a = span(t, 36.8, 41.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 26); text('populations by their overall trend, 100 dots', W / 2, 150, { color: C.soft, align: 'center' });
    const up = Math.round(SHARES.up), flat = Math.round(SHARES.flat);
    const g = seg(t, 37.0, 39.0);
    for (let i = 0; i < 100; i++) {
      const x = 192 + (i % 10) * 54, y = 210 + Math.floor(i / 10) * 44;
      if (i > g * 100) continue;
      ctx.fillStyle = i < up ? C.up : i < up + flat ? C.faint : C.down;
      ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
    }
    A(seg(t, 39.0, 39.6), () => {
      font(700, 24);
      text(`${SHARES.up}% increasing`, 120, 688, { color: C.up, align: 'left' });
      text(`${SHARES.flat}% stable`, W / 2, 688, { color: C.soft, align: 'center' });
      text(`${SHARES.down.toFixed(1)}% decreasing`, 744, 688, { color: C.down, align: 'right' });
    });
  });
}
function weights(t) {
  const a = span(t, 41.4, 46.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 26); text('each group’s weight follows how many species it has', W / 2, 150, { color: C.soft, align: 'center' });
    // a balance: the species-rich, falling group outweighs a species-poor, rising one
    const tilt = 0.16 * eio(seg(t, 42.0, 43.6));
    const cx = W / 2, cy = 330, arm = 270;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-tilt);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-arm, 0); ctx.lineTo(arm, 0); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 30, cy + 300); ctx.lineTo(cx + 30, cy + 300); ctx.closePath(); ctx.fill();
    const lx = cx - arm * Math.cos(tilt), ly = cy + arm * Math.sin(tilt), rx = cx + arm * Math.cos(tilt), ry = cy - arm * Math.sin(tilt);
    cluster(lx, ly + 80, 60, C.down, { seed: 21, r: 4, spread: 5.4 });
    cluster(rx, ry + 60, 14, C.up, { seed: 22, r: 4, spread: 5.4 });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 34); ctx.moveTo(rx, ry); ctx.lineTo(rx, ry + 26); ctx.stroke();
    font(600, 22);
    text('species-rich group', lx, ly + 170, { color: C.down, align: 'center' });
    text('species-poor group', rx, ry + 130, { color: C.up, align: 'center' });
    A(seg(t, 43.6, 44.2), () => {
      font(500, 22); text('e.g. amphibians and reptiles in Latin America, fish in Africa', W / 2, 700, { color: C.soft, align: 'center' });
    });
  });
}

// ---------- E: systems, regions, extremes ----------
function bars(t, a0, rows, title, { w0 = 330 } = {}) {
  const a = span(t, a0, a0 + 4.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 26); text(title, W / 2, 150, { color: C.soft, align: 'center' });
    const L = w0, R = 770, gap = rows.length > 3 ? 92 : 130, y0 = rows.length > 3 ? 236 : 260;
    rows.forEach(([name, v], i) => {
      const y = y0 + i * gap, g = eio(seg(t, a0 + 0.4 + i * 0.3, a0 + 1.4 + i * 0.3));
      font(600, rows.length > 3 ? 24 : 30); text(name, L - 20, y, { align: 'right' });
      ctx.fillStyle = 'rgba(238,242,228,0.08)'; k.rrect(L, y - 26, R - L, 52, 10); ctx.fill();
      ctx.fillStyle = C.down; k.rrect(L, y - 26, Math.max(6, (R - L) * (-v / 100) * g), 52, 10); ctx.fill();
      font(800, 30, SERIF); text(`${Math.round(v * g)}%`, L + Math.max(6, (R - L) * (-v / 100) * g) + 12, y, { color: C.gold, align: 'left' });
    });
    font(400, 22); text('average change, 1970–2022 (Living Planet Report 2026)', W / 2, rows.length > 3 ? 720 : 690, { color: C.soft, align: 'center' });
  });
}
function extremes(t) {
  const a = span(t, 55.2, 59.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 26); text('a test: leave out the most extreme trends', W / 2, 150, { color: C.soft, align: 'center' });
    const L = 140, R = 724, T = 240, B = 620;
    // a spread of trends, trimmed at both ends
    const trim = eio(seg(t, 55.8, 57.4));
    for (let i = 0; i < 60; i++) {
      const u = (i + 0.5) / 60, x = lerp(L, R, u), y = lerp(T, B, ((i * 37) % 60) / 60);
      const edge = u < 0.1 || u > 0.9;
      ctx.fillStyle = edge ? `rgba(238,242,228,${0.5 * (1 - trim) + 0.08})` : (u < 0.5 ? C.down : C.up);
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    }
    font(500, 20); text('fastest falling', L, B + 34, { color: C.soft, align: 'left' }); text('fastest rising', R, B + 34, { color: C.soft, align: 'right' });
    A(seg(t, 57.4, 58.0), () => {
      ctx.fillStyle = C.panel; k.rrect(212, 660, 440, 64, 16); ctx.fill();
      font(800, 32, SERIF); text(`${LPI}%  becomes  ${TRIMMED}%`, W / 2, 692, { color: C.gold, align: 'center' });
    });
  });
}

// ---------- F: a quarter ----------
function quarter(t) {
  const a = eout(seg(t, 59.8, 60.5));
  if (a <= 0) return;
  A(a, () => {
    const g = eio(seg(t, 60.4, 62.4));
    const n = 100, keep = Math.round(n * (1 + LPI / 100));
    cluster(W / 2, 420, n, C.faint, { seed: 31, r: 6, spread: 13 });
    cluster(W / 2, 420, n, C.gold, { seed: 31, r: 6, spread: 13, shown: Math.round(lerp(n, keep, g)) });
    font(600, 24); text('an average monitored population, 1970 → 2022', W / 2, 150, { color: C.soft, align: 'center' });
    A(seg(t, 62.4, 63.0), () => { font(800, 40, SERIF); text(`about ${keep} in 100 remain`, W / 2, 700, { color: C.gold, align: 'center' }); });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.4, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    headline(t);
    inputs(t);
    example(t);
    geometric(t);
    perYear(t);
    shares(t);
    weights(t);
    bars(t, 46.0, SYSTEMS, 'by habitat');
    bars(t, 50.6, REGIONS, 'by region', { w0: 350 });
    extremes(t);
    quarter(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 600, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.up } });
  },
});
