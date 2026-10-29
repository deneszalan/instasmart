// Explainer for space-mars-meteorite-rubidium-clock: on 29 October 2026 NASA reported, from a study in Science,
// that the meteorite Teghaza 001 is a piece of Mars's crust more than 4.1 billion years old, dated in part with
// rubidium and strontium in single mineral grains. Look: a dusk desert of rust and rose, the rock as a rose-pink
// stone, rubidium in violet and strontium-87 in teal, then an isochron plot on dark slate that tilts like a clock
// hand. Oswald (a condensed gothic) for numbers and headings, Lora (a calligraphic serif) for captions.
//
// Facts: NASA/JPL, "NASA-funded Study Details One of Oldest Mars Meteorites Ever Found" (29 October 2026, release
// 2026-079): a rose-coloured meteorite found in the Sahara in 2022, named Teghaza 001 after the salt plain in Mali
// where it was found; nearly 2 pounds (800 grams); a piece of Mars that formed more than 4.1 billion years ago;
// one of roughly 435 meteorites from Mars and one of the three most ancient found on Earth; identified as Martian
// by its oxygen isotopes (University of New Mexico); zircon crystals in it can be used to date it; Caltech
// coauthor François Tissot's lab did in-situ rubidium-strontium dating of single mineral grains on a piece
// smaller than a fingernail, one of very few labs able to do it; the rock was altered by Martian water around
// 4.1 billion years ago, so it formed even earlier; its igneous minerals tell how the crust formed from cooling
// magma before subsurface water altered it; 13 locations on Mars match its mineralogy and chemistry; Mars
// meteorites were blasted off the surface by impacts. The paper: Science, doi 10.1126/science.adz5646, lead
// author Yang Liu (NASA JPL). Wikipedia, "Rubidium–strontium dating": rubidium-87 beta-decays to strontium-87 with
// a half-life of 49.23 billion years; the isochron equation 87Sr/86Sr = (87Sr/86Sr)0 + (87Rb/86Sr)(e^(λt) − 1);
// subsamples (minerals) start with different Rb/Sr; the slope of the line gives the age.
//
// Computed here: λ = ln 2 / 49.23 Gyr; after 4.1 Gyr, 1 − e^(−λt) = 5.6% of the rubidium-87 has decayed, and the
// isochron's slope is e^(λt) − 1 = 0.059. The universe's age, 13.8 billion years, is 0.28 half-lives. The five
// grains and the starting ratio 0.700 are made up for the drawing; the paper's measured values are not shown.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The news: Teghaza 001, from Mars, over 4.1 billion years old.
//  B  9.4–23.2  Atomic clocks: rubidium-87 → strontium-87, half-life 49 billion years, 5.6% in 4.1 billion.
//  C 23.2–46.2  The isochron: grains, axes, the flat line, the tilt, slope and intercept.
//  D 46.2–64.8  Tissot's single-grain dating, water at 4.1 billion years, the crust, 13 matching places.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky0: '#1a0d0b', sky1: '#3a1812', dune: '#5a2a1b', dune2: '#7a3a22', ink: '#fbf1ea', soft: 'rgba(251,241,234,0.74)',
  faint: 'rgba(251,241,234,0.30)', rose: '#e8a3a0', rose2: '#c97b78', rb: '#a88bff', sr: '#4fd1c5', sr86: '#a9b4be',
  gold: '#f2c14e', water: '#6fb7ff', slate: 'rgba(16,10,12,0.90)', mars: '#c8553d', mars2: '#8f3a28',
};
const NUM = 'Oswald', SERIF = 'Lora';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the clock ----------
const HALF = 49.23, LAMBDA = Math.LN2 / HALF; // per billion years
const AGE = 4.1, UNIVERSE = 13.8;
const decayed = (t) => 1 - Math.exp(-LAMBDA * t);
const slopeAt = (t) => Math.exp(LAMBDA * t) - 1;
const R0 = 0.700; // illustrative starting 87Sr/86Sr
const GRAINS = [0.12, 0.45, 0.85, 1.35, 1.95]; // illustrative starting 87Rb/86Sr
const GRAIN_COL = ['#f6d6c8', '#e8a3a0', '#d98a7a', '#c86f62', '#b25549'];

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'On 29 October 2026, NASA said *Teghaza 001*, a rock found in the Sahara in 2022, came from *Mars*.'],
  [5.0, 9.4, `It formed more than *${AGE} billion years* ago: one of the three oldest Martian meteorites known.`],
  [9.6, 14.0, 'How do you date a rock? Some atoms are *clocks*: they turn into other atoms at a steady rate.'],
  [14.2, 18.6, `~Rubidium-87~ turns into ^strontium-87^ so slowly that half of it takes *${Math.round(HALF)} billion years*.`],
  [18.8, 23.2, `In ${AGE} billion years only *${(decayed(AGE) * 100).toFixed(1)}%* of a rock’s rubidium-87 changes: a slow clock for long times.`],
  [23.4, 27.8, 'As the rock cooled, its grains got the same mix of strontium but different amounts of ~rubidium~.'],
  [28.0, 32.4, 'Plot each grain: ~rubidium~ across, ^strontium-87^ up, each counted against steady strontium-86.'],
  [32.6, 37.0, 'At first the grains lie on a *flat line*. Then, as rubidium decays, every grain climbs.'],
  [37.2, 41.6, 'More rubidium means more new strontium-87, so the line *tilts*: the older the rock, the steeper.'],
  [41.8, 46.2, 'The slope gives the age; where the line starts gives the original mix. Nothing has to be guessed.'],
  [46.4, 50.8, 'Caltech geochemist *François Tissot*’s lab dates single grains on a chip smaller than a fingernail.'],
  [51.0, 55.4, `Its minerals showed water altered it about *${AGE} billion years* ago, so it formed even earlier.`],
  [55.6, 60.0, 'Its minerals record how Mars’s early crust cooled from magma, and how water later seeped through.'],
  [60.2, 64.6, 'Researchers found *13 places* on Mars whose rocks match it. An impact once blasted it into space.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sky0); lg.addColorStop(0.55, C.sky1); lg.addColorStop(1, '#120806');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 160; i++) { const a = r(); g.fillStyle = `rgba(251,241,234,${0.08 + a * 0.35})`; g.beginPath(); g.arc(r() * W, r() * 420, 0.5 + a, 0, Math.PI * 2); g.fill(); }
}
function dunes(a) {
  A(a, () => {
    ctx.fillStyle = C.dune; ctx.beginPath(); ctx.moveTo(0, 640);
    for (let x = 0; x <= W; x += 24) ctx.lineTo(x, 640 - 40 * Math.sin(x / 150) - 18 * Math.sin(x / 61));
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.dune2; ctx.beginPath(); ctx.moveTo(0, 700);
    for (let x = 0; x <= W; x += 24) ctx.lineTo(x, 700 - 26 * Math.sin(x / 110 + 1) - 10 * Math.sin(x / 37));
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  });
}
/** The rose-coloured stone. */
function stone(cx, cy, s = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  const pts = [[-120, -20], [-90, -78], [-20, -98], [60, -84], [118, -40], [126, 22], [80, 70], [0, 84], [-82, 66], [-126, 24]];
  const g = ctx.createRadialGradient(-30, -40, 10, 0, 0, 140);
  g.addColorStop(0, '#f6c9c2'); g.addColorStop(0.6, C.rose); g.addColorStop(1, C.rose2);
  ctx.fillStyle = g; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(60,20,16,0.5)'; ctx.lineWidth = 3; ctx.stroke();
  let q = 9; const r = () => ((q = (q * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) {
    const x = (r() - 0.5) * 200, y = (r() - 0.5) * 140;
    ctx.fillStyle = r() < 0.5 ? 'rgba(90,40,36,0.45)' : 'rgba(255,240,235,0.55)';
    ctx.beginPath(); ctx.arc(x, y, 2 + r() * 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function chip(x, y, w, h, fn) { ctx.fillStyle = C.slate; k.rrect(x, y, w, h, 14); ctx.fill(); fn(); }

// ---------- A: the news ----------
function sceneA(t) {
  const a = span(t, 0, 9.6, 0.01, 0.5);
  if (a <= 0) return;
  A(a, () => {
    dunes(1);
    font(600, 58); text('A clock in a rock from Mars', 52, 100, { color: C.ink });
    font(400, 24, SERIF); text('NASA · Science · 29 October 2026', 54, 152, { color: C.rose });
    stone(432, 470, 0.9 + 0.1 * eout(seg(t, 0.4, 2.0)));
    A(seg(t, 1.6, 2.4), () => {
      chip(520, 560, 300, 120, () => {
        font(500, 30); text('Teghaza 001', 544, 596, { color: C.rose });
        font(400, 22, SERIF); text('about 800 g, found 2022', 544, 634, { color: C.soft });
        text('in the Sahara', 544, 662, { color: C.soft });
      });
    });
    // a time bar: billions of years ago
    A(span(t, 5.0, 9.6, 0.4, 0.4), () => {
      const x0 = 80, x1 = 784, y = 230, X = (g) => lerp(x0, x1, (4.5 - g) / 4.5);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      font(400, 22);
      for (const g of [4, 3, 2, 1, 0]) { ctx.beginPath(); ctx.moveTo(X(g), y - 8); ctx.lineTo(X(g), y + 8); ctx.stroke(); text(g ? `${g}` : 'now', X(g), y + 28, { color: C.soft, align: 'center' }); }
      text('billion years ago', x1, y + 58, { color: C.soft, align: 'right' });
      const p = eout(seg(t, 5.2, 6.4));
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(X(AGE), y, 10 * p, 0, Math.PI * 2); ctx.fill();
      font(600, 28); text(`over ${AGE}`, X(AGE) + 18, y - 30, { color: C.gold });
    });
  });
}

// ---------- B: atoms as clocks ----------
function sceneB(t) {
  const a = span(t, 9.6, 23.4, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // a block of 400 rubidium-87 atoms; some turn into strontium-87 as time runs to 4.1 billion years
    const cols = 25, rows = 14, x0 = 132, y0 = 290, d = 24;
    const g = t < 18.8 ? 0 : AGE * eio(seg(t, 19.0, 22.0));
    const n = cols * rows, flipped = Math.round(n * decayed(g));
    let s = 21; const order = Array.from({ length: n }, (_, i) => i).map((i) => [i, (s = (s * 16807) % 2147483647)]).sort((p, q) => p[1] - q[1]).map((p) => p[0]);
    const isSr = new Set(order.slice(0, flipped));
    // one atom flipping, slowly, in cue 4
    const demo = t > 14.2 && t < 18.8 ? seg(t, 15.0, 16.4) : 0;
    for (let i = 0; i < n; i++) {
      const x = x0 + (i % cols) * d, y = y0 + Math.floor(i / cols) * d;
      const sr = isSr.has(i) || (i === 212 && demo > 0.5);
      ctx.fillStyle = sr ? C.sr : C.rb;
      ctx.beginPath(); ctx.arc(x, y, sr ? 9 : 8, 0, Math.PI * 2); ctx.fill();
    }
    if (demo > 0 && demo < 1) {
      const x = x0 + (212 % cols) * d, y = y0 + Math.floor(212 / cols) * d;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 18 + 10 * demo, 0, Math.PI * 2); ctx.stroke();
    }
    // legend
    font(500, 26);
    ctx.fillStyle = C.rb; ctx.beginPath(); ctx.arc(150, 230, 10, 0, Math.PI * 2); ctx.fill();
    text('rubidium-87', 170, 230, { color: C.rb });
    ctx.fillStyle = C.sr; ctx.beginPath(); ctx.arc(420, 230, 10, 0, Math.PI * 2); ctx.fill();
    text('strontium-87', 440, 230, { color: C.sr });
    A(span(t, 9.6, 14.2, 0.4, 0.4), () => { font(400, 26, SERIF); text(`${n} atoms in a grain, drawn big`, 132, 660, { color: C.soft }); });
    // the half-life against the universe's age
    A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
      chip(110, 640, 644, 126, () => {
        const xa = 136, xb = 728, X = (v) => lerp(xa, xb, v / 50);
        ctx.fillStyle = C.rb; ctx.fillRect(xa, 676, X(HALF) - xa, 22);
        ctx.fillStyle = C.gold; ctx.fillRect(xa, 714, X(UNIVERSE) - xa, 22);
        font(500, 24); text(`half-life of rubidium-87: ${HALF} billion years`, xa, 660, { color: C.rb });
        text(`age of the universe: ${UNIVERSE}`, X(UNIVERSE) + 12, 725, { color: C.gold });
      });
    });
    // 4.1 billion years: 5.6%
    A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
      chip(110, 650, 644, 110, () => {
        font(400, 24, SERIF); text('time passed', 136, 684, { color: C.soft });
        font(600, 40); text(`${g.toFixed(1)} billion years`, 136, 728, { color: C.ink });
        font(400, 24, SERIF); text('changed', 520, 684, { color: C.soft });
        font(600, 40); text(`${(decayed(g) * 100).toFixed(1)}%`, 520, 728, { color: C.sr });
      });
    });
  });
}

// ---------- C: the isochron ----------
const PX0 = 150, PX1 = 790, PY0 = 640, PY1 = 230; // plot box: x 0–2.2, y 0.69–0.83
const XR = [0, 2.2], YR = [0.69, 0.83];
const PX = (v) => lerp(PX0, PX1, (v - XR[0]) / (XR[1] - XR[0]));
const PY = (v) => lerp(PY0, PY1, (v - YR[0]) / (YR[1] - YR[0]));
function sceneC(t) {
  const a = span(t, 23.4, 46.4, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = C.slate; k.rrect(60, 150, 760, 600, 20); ctx.fill();
    // cue 6: grains as crystals in the rock, more or less violet
    A(span(t, 23.4, 28.0, 0.4, 0.4), () => {
      font(400, 26, SERIF); text('five grains of the rock (made up)', 432, 200, { color: C.soft, align: 'center' });
      GRAINS.forEach((rb, i) => {
        const x = 170 + i * 130, y = 430;
        ctx.fillStyle = GRAIN_COL[i]; ctx.beginPath();
        for (let j = 0; j < 6; j++) { const an = (j / 6) * Math.PI * 2 + 0.3; ctx.lineTo(x + Math.cos(an) * 52, y + Math.sin(an) * 52); }
        ctx.closePath(); ctx.fill();
        // rubidium dots: more for richer grains
        const nRb = Math.round(rb * 9);
        for (let j = 0; j < nRb; j++) { const an = j * 2.4, rr = 8 + (j % 4) * 9; ctx.fillStyle = C.rb; ctx.beginPath(); ctx.arc(x + Math.cos(an) * rr, y + Math.sin(an) * rr, 5, 0, Math.PI * 2); ctx.fill(); }
        // strontium: the same in each
        for (let j = 0; j < 4; j++) { const an = j * 1.57 + 0.8; ctx.fillStyle = C.sr86; ctx.beginPath(); ctx.arc(x + Math.cos(an) * 36, y + Math.sin(an) * 36, 5, 0, Math.PI * 2); ctx.fill(); }
      });
      font(500, 24); text('less rubidium', 170, 530, { color: C.rb, align: 'center' }); text('more rubidium', 690, 530, { color: C.rb, align: 'center' });
      font(400, 24, SERIF); text('grey: strontium, the same mix in every grain', 432, 600, { color: C.sr86, align: 'center' });
    });
    // the plot from cue 7 on
    A(span(t, 28.0, 46.4, 0.4, 0.5), () => {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(PX0, PY1 - 10); ctx.lineTo(PX0, PY0); ctx.lineTo(PX1 + 10, PY0); ctx.stroke();
      font(400, 22);
      for (const v of [0, 0.5, 1, 1.5, 2]) text(v.toFixed(1), PX(v), PY0 + 24, { color: C.soft, align: 'center' });
      for (const v of [0.70, 0.74, 0.78, 0.82]) text(v.toFixed(2), PX0 - 12, PY(v), { color: C.soft, align: 'right' });
      font(500, 24); text('rubidium-87 ÷ strontium-86', PX1, PY0 + 60, { color: C.rb, align: 'right' });
      ctx.save(); ctx.translate(92, (PY0 + PY1) / 2); ctx.rotate(-Math.PI / 2);
      text('strontium-87 ÷ strontium-86', 0, 0, { color: C.sr, align: 'center' }); ctx.restore();
      // time runs from cue 8's middle to cue 9's end
      const g = t < 34.2 ? 0 : AGE * eio(seg(t, 34.4, 40.6));
      const f = Math.exp(-LAMBDA * g);
      // grain paths (arrows) in cue 8
      A(span(t, 34.0, 37.4, 0.3, 0.4), () => {
        GRAINS.forEach((x0) => {
          ctx.strokeStyle = 'rgba(251,241,234,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
          ctx.beginPath(); ctx.moveTo(PX(x0), PY(R0)); ctx.lineTo(PX(x0 * Math.exp(-LAMBDA * AGE)), PY(R0 + x0 * decayed(AGE))); ctx.stroke(); ctx.setLineDash([]);
        });
      });
      // the line through the grains
      const sl = slopeAt(g);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(PX(0), PY(R0)); ctx.lineTo(PX(2.15), PY(R0 + 2.15 * sl)); ctx.stroke();
      GRAINS.forEach((x0, i) => {
        const x = x0 * f, y = R0 + x0 * (1 - f);
        ctx.fillStyle = GRAIN_COL[i]; ctx.beginPath(); ctx.arc(PX(x), PY(y), 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#2a1410'; ctx.lineWidth = 2; ctx.stroke();
      });
      // readouts
      chip(170, 240, 340, 96, () => {
        font(400, 22, SERIF); text('age', 192, 266, { color: C.soft }); text('slope', 352, 266, { color: C.soft });
        font(600, 34); text(`${g.toFixed(1)} bn yr`, 192, 306, { color: C.ink });
        text(sl.toFixed(3), 352, 306, { color: C.gold });
      });
      // cue 10: slope and intercept
      A(span(t, 41.8, 46.4, 0.4, 0.4), () => {
        ctx.fillStyle = C.sr; ctx.beginPath(); ctx.arc(PX(0), PY(R0), 10, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = C.sr; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PX(0) + 10, PY(R0) + 6); ctx.lineTo(PX(0.33), 618); ctx.stroke();
        font(500, 24); text('start: the original mix', PX(0.35), 620, { color: C.sr });
        const xs = 1.4, ys = R0 + xs * sl;
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(PX(xs), PY(ys)); ctx.lineTo(PX(xs + 0.5), PY(ys)); ctx.lineTo(PX(xs + 0.5), PY(ys + 0.5 * sl)); ctx.stroke(); ctx.setLineDash([]);
        font(500, 24); text('slope gives the age', PX(xs + 0.25), PY(ys) + 60, { color: C.gold, align: 'center' });
      });
    });
  });
}

// ---------- D: Teghaza 001 ----------
function sceneD(t) {
  const a = span(t, 46.4, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    // a chip under a fingernail outline, grains analysed one by one
    A(span(t, 46.4, 51.0, 0.4, 0.4), () => {
      const cx = 432, cy = 450;
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
      k.rrect(cx - 150, cy - 190, 300, 380, 140); ctx.stroke(); ctx.setLineDash([]);
      font(400, 24, SERIF); text('a fingernail, for scale', cx, cy - 220, { color: C.soft, align: 'center' });
      stone(cx, cy, 0.85);
      let s = 13; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 9; i++) {
        const x = cx + (r() - 0.5) * 170, y = cy + (r() - 0.5) * 110, on = seg(t, 47.0 + i * 0.35, 47.3 + i * 0.35);
        if (on <= 0) continue;
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 9 + 6 * on, 0, Math.PI * 2); ctx.stroke();
      }
      font(500, 26); text('single grains, dated in place', cx, cy + 236, { color: C.gold, align: 'center' });
    });
    // water at 4.1 billion years
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      const cx = 432, cy = 450;
      stone(cx, cy, 1.1);
      const p = eio(seg(t, 51.4, 54.0));
      ctx.strokeStyle = `rgba(111,183,255,${0.75 * p})`; ctx.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(cx - 120 + i * 45, cy - 100);
        for (let j = 1; j <= 8; j++) ctx.lineTo(cx - 120 + i * 45 + 10 * Math.sin(j + i), cy - 100 + j * 25 * p);
        ctx.stroke();
      }
      chip(222, 170, 420, 104, () => {
        font(400, 24, SERIF); text('altered by water', 432, 200, { color: C.water, align: 'center' });
        font(600, 40); text(`about ${AGE} billion years ago`, 432, 244, { color: C.ink, align: 'center' });
      });
    });
    // the crust from magma
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      const cx = 432, cy = 470, p = eio(seg(t, 55.8, 58.6));
      const g = ctx.createLinearGradient(0, cy - 160, 0, cy + 160);
      g.addColorStop(0, `rgba(255,140,60,${0.8 * (1 - p)})`); g.addColorStop(1, `rgba(200,60,30,${0.9 * (1 - p) + 0.2})`);
      ctx.fillStyle = g; k.rrect(cx - 300, cy - 160, 600, 320, 30); ctx.fill();
      let s = 17; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 40; i++) {
        const x = cx + (r() - 0.5) * 560, y = cy + (r() - 0.5) * 280, sz = (6 + r() * 22) * p, an = r() * 3;
        ctx.fillStyle = GRAIN_COL[i % 5]; ctx.save(); ctx.translate(x, y); ctx.rotate(an); ctx.fillRect(-sz, -sz / 2.5, sz * 2, sz / 1.25); ctx.restore();
      }
      font(500, 26); text('magma cools, crystals grow', cx, cy - 196, { color: C.gold, align: 'center' });
      font(400, 22, SERIF); text('schematic', cx + 296, cy + 186, { color: C.faint, align: 'right' });
    });
    // Mars, 13 matching places, an impact
    A(span(t, 60.2, 64.8, 0.4, 0.01), () => {
      const cx = 360, cy = 470, R = 210;
      const g = ctx.createRadialGradient(cx - 70, cy - 70, 20, cx, cy, R);
      g.addColorStop(0, '#e07a55'); g.addColorStop(0.7, C.mars); g.addColorStop(1, C.mars2);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      let s = 31; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 13; i++) {
        const an = r() * Math.PI * 2, d = Math.sqrt(r()) * R * 0.85, on = seg(t, 60.4 + i * 0.12, 60.6 + i * 0.12);
        ctx.fillStyle = `rgba(242,193,78,${on})`; ctx.beginPath(); ctx.arc(cx + Math.cos(an) * d, cy + Math.sin(an) * d * 0.9, 9, 0, Math.PI * 2); ctx.fill();
      }
      font(600, 32); text('13 matching places', 590, 290, { color: C.gold });
      font(400, 22, SERIF); text('positions illustrative', 590, 326, { color: C.soft });
      // a rock flung off
      const p = eio(seg(t, 62.0, 64.4));
      ctx.fillStyle = C.rose; ctx.beginPath(); ctx.arc(lerp(cx + 120, 780, p), lerp(cy - 140, 180, p), 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(232,163,160,${0.6 * p})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + 120, cy - 140); ctx.lineTo(lerp(cx + 120, 780, p), lerp(cy - 140, 180, p)); ctx.stroke();
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [NUM, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t); sceneB(t); sceneC(t); sceneD(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 40, weight: 600, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.rb, '^': C.sr } });
  },
});
