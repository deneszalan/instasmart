// Explainer for psychology-phi-phenomenon: two flashing dots, and the motion your brain adds.
// Look: a black stage with neon dots (electric cyan, magenta accents), a thin geometric sans
// (Jost), a faint static film grain and scanlines, a hairline "screen" frame with corner ticks.
//
// The animation is the demonstration. Every flash is scheduled in whole frames of this 30 fps
// clip, and the on-screen timings are computed from those frame counts (at 1x speed).
//   slow    each dot on 9 frames (300 ms), then 15 frames (500 ms) with neither lit
//   sweet   on 3 frames (100 ms), gap 2 frames (67 ms): the dots seem to be one dot jumping
//   fast    the dots swap every frame (33 ms each, no gap): both seem lit at once
//   ring    eight discs, each hidden for 3 frames (100 ms) in turn, an 800 ms lap (Magni-phi style)
//   flip    twelve drawings of a bouncing ball, flipped at 3 and then 10 pages a second
//
// Scene plan (54.2 s). Everything important sits above y = 930; captions are centred at y = 830.
//  A  0.0– 6.7  Hook: two neon dots, both lit and still.       "Two dots. Neither one ever moves." /
//                                                             "Watch what your brain does with them."
//  S  6.7–10.8  Slow alternation, with a scrolling timing trace "Slow flashes: you see two dots taking turns."
//  M 10.8–21.0  The sweet spot; then a dashed box marks the     "Faster, and one dot seems to jump across." /
//               empty middle                                   "Psychologists call it beta movement." /
//                                                             "Yet nothing is ever drawn in between."
//  F 21.0–29.0  Fast alternation                               "Faster still: both seem lit at once." /
//                                                             "Here, Wertheimer described a ghostly motion
//                                                              with no object: pure phi."
//  R 28.9–33.9  A ring of discs blinking off in turn           "In a ring, a shadow may seem to race round."
//  E 33.8–45.6  Flip-book: 12 stills in a grid, stacked and     "A flip-book is just still pictures, …" /
//               flipped; then the same bounce drawn every       "Flip them fast enough and they move." /
//               frame, with a strip of this clip's own frames   "This clip, too, is 30 still frames a second."
//  P 45.5–50.1  "persistence of vision" struck through         "Not “persistence of vision”: …built by your brain."
//  G 50.0–54.2  The two dots again at the sweet spot, sources  "The dot never moved. Your brain moved it."
//
// Facts: Wikipedia "Beta movement": two short projections of similar figures in neighbouring places
// are "experienced as one figure moving"; Wertheimer (1912) found successive figures at low
// frequencies, one moving figure ("optimal motion", later "beta movement") at medium ones with "no
// shape ... seen in between", and at higher speeds, with both seen "more or less simultaneously",
// an objectless motion he called "pure phi". Wikipedia "Phi phenomenon": the Magni-phi ring of
// identical discs, hidden one at a time, "makes it easier to observe the kind of shadow-like
// movement Wertheimer discovered"; pure phi needs a gap of at most about 150 ms and under 40% of
// the period (the ring here: 100 ms of 800). Wikipedia "Persistence of vision": psychologists and
// physiologists "have rejected the relevance of the theory of retinal persistence" for film.
// Wikipedia "Flip book": a flip-book's pages are flipped fast "for the illusion to work".
const W = 864, H = 1080, FPS = 30;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#030407', ink: '#EAF6FB', soft: 'rgba(234,246,251,0.66)', faint: 'rgba(234,246,251,0.24)',
  cyan: '#2BEBFF', cyanRGB: '43,235,255', magenta: '#FF3DCB', magRGB: '255,61,203', magSoft: '#FF8ADF',
};
const F = 'Jost';

let k, ctx;
const font = (weight, size) => k.font(weight, size, F);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
const ms = (frames) => Math.round((frames * 1000) / FPS);
const frameOf = (t) => Math.round(t * FPS);

// ---------- the flash schedule, in frames ----------
const SLOW = { on: 9, gap: 15 }, SWEET = { on: 3, gap: 2 }, FAST = { on: 1, gap: 0 };
const RING = { n: 8, off: 3 };
const S0 = frameOf(6.7), M0 = frameOf(10.8), F0 = frameOf(21.0), R0 = frameOf(29.0), G0 = frameOf(50.0);
/** Which dots are lit at frame f: two alternating dots, each on for `on` frames, then a gap. */
function alternate(f, start, { on, gap }) {
  const c = (f - start) % (2 * (on + gap));
  return { a: c < on, b: c >= on + gap && c < 2 * on + gap };
}
function dotState(f) {
  if (f < S0) return { a: true, b: true };
  if (f < M0) return alternate(f, S0, SLOW);
  if (f < F0) return alternate(f, M0, SWEET);
  if (f < R0) return alternate(f, F0, FAST);
  if (f >= G0) return alternate(f, G0, SWEET);
  return { a: false, b: false };
}
const stageOf = (f) => (f < S0 ? null : f < M0 ? SLOW : f < F0 ? SWEET : f < R0 ? FAST : null);

// ---------- timeline ----------
const T = { A: [0, 6.8], R: [28.9, 33.9], E: [33.75, 45.6], P: [45.5, 50.1], G: [49.95, 54.2] };
const CUES = [
  [0.4, 3.3, 'Two dots. *Neither one* ever moves.'],
  [3.4, 6.6, 'Watch what your brain does with them.'],
  [6.7, 10.6, 'Slow flashes: you see *two dots* taking turns.'],
  [10.8, 14.6, 'Faster, and *one dot* seems to jump across.'],
  [14.7, 17.7, 'Psychologists call it ~beta movement~.'],
  [17.8, 21.0, 'Yet nothing is ever drawn in between.'],
  [21.1, 24.6, 'Faster still: both seem *lit at once*.'],
  [24.7, 29.1, 'Here, Wertheimer described a ghostly motion with no object: ~pure phi~.'],
  [29.2, 33.6, 'In a ring, a *shadow* may seem to race round.'],
  [33.8, 37.9, 'A flip-book is just *still pictures*, each a little different.'],
  [38.0, 41.6, 'Flip them fast enough and they *move*.'],
  [41.7, 45.5, 'This clip, too, is *30 still frames* a second.'],
  [45.6, 50.0, 'Not “persistence of vision”: the motion is built by *your brain*.'],
  [50.1, 53.9, 'The dot never moved. *Your brain* moved it.'],
];

// ---------- seeded randomness ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- textures, made once: the stage and a static grain + scanline overlay ----------
function makeStage() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const lift = g.createRadialGradient(W / 2, 430, 20, W / 2, 430, 640);
  lift.addColorStop(0, 'rgba(26,40,62,0.55)'); lift.addColorStop(0.55, 'rgba(12,16,30,0.35)'); lift.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = lift; g.fillRect(0, 0, W, H);
  return cv;
}
function makeOverlay() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  // scanlines: a dark line every 4 px
  g.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1);
  // grain: sparse soft specks, light and dark
  const rnd = rng(31);
  for (let i = 0; i < 5200; i++) {
    const x = rnd() * W, y = rnd() * H, light = rnd() < 0.5;
    g.fillStyle = light ? `rgba(200,230,255,${0.025 + rnd() * 0.04})` : `rgba(0,0,0,${0.08 + rnd() * 0.1})`;
    g.fillRect(x, y, 1 + (rnd() < 0.3 ? 1 : 0), 1);
  }
  // vignette
  const vg = g.createRadialGradient(W / 2, H / 2, 280, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return cv;
}
const STAGE = makeStage(), OVERLAY = makeOverlay();

// ---------- drawing helpers ----------
const FR = { x: 64, y: 168, w: 736, h: 584 };   // the "screen" frame
function screenFrame(a) {
  withAlpha(a, () => {
    ctx.strokeStyle = `rgba(${C.cyanRGB},0.16)`; ctx.lineWidth = 1.5;
    rrect(FR.x, FR.y, FR.w, FR.h, 18); ctx.stroke();
    // corner ticks
    ctx.strokeStyle = `rgba(${C.cyanRGB},0.55)`; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    const L = 26, x0 = FR.x, y0 = FR.y, x1 = FR.x + FR.w, y1 = FR.y + FR.h;
    for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      ctx.beginPath(); ctx.moveTo(x, y + dy * L); ctx.lineTo(x, y); ctx.lineTo(x + dx * L, y); ctx.stroke();
    }
  });
}
function stageTag(label, a) {
  withAlpha(a, () => {
    font(500, 22); text(label, FR.x + 30, FR.y + 44, { color: C.magenta, spacing: '3px' });
  });
}

/** A neon dot: halo, core and a hot centre. lit 0..1; the dim socket always shows. */
function neonDot(x, y, r, lit, rgb = C.cyanRGB, socket = 0.22) {
  if (socket > 0) {
    ctx.strokeStyle = `rgba(${rgb},${socket})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  }
  if (lit <= 0) return;
  const halo = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 3.6);
  halo.addColorStop(0, `rgba(${rgb},${0.42 * lit})`); halo.addColorStop(0.4, `rgba(${rgb},${0.12 * lit})`); halo.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, r * 3.6, 0, TAU); ctx.fill();
  ctx.fillStyle = `rgba(${rgb},${lit})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  const hot = ctx.createRadialGradient(x, y, 0, x, y, r * 0.8);
  hot.addColorStop(0, `rgba(255,255,255,${0.9 * lit})`); hot.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hot; ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, TAU); ctx.fill();
}

/** A thin neon line with a soft glow. */
function glowStroke(rgb, width, a = 1) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgba(${rgb},${0.18 * a})`; ctx.lineWidth = width * 4; ctx.stroke();
  ctx.strokeStyle = `rgba(${rgb},${a})`; ctx.lineWidth = width; ctx.stroke();
}

function header() {
  font(600, 22); text('RECKON', 64, 84, { color: C.cyan, spacing: '6px' });
  const w = ctx.measureText('RECKON').width + 6 * 6;
  font(400, 22); text('PSYCHOLOGY · PERCEPTION', 64 + w + 20, 84, { color: C.soft, spacing: '3px' });
}

// ---------- the two dots (scenes A, S, M, F, G) ----------
const DOT = { y: 380, xa: 282, xb: 582, r: 26 };
function dotsLayer(t) {
  const f = frameOf(t);
  const on = eout(seg(t, 0.3, 1.1)) * (1 - seg(t, 28.85, 29.25)) + eout(seg(t, 50.0, 50.5));
  if (on <= 0) return;
  const s = dotState(f);
  withAlpha(on, () => {
    const grow = 0.6 + 0.4 * back(seg(t, 0.3, 1.0));
    const r = t < 2 ? DOT.r * grow : DOT.r;
    neonDot(DOT.xa, DOT.y, r, s.a ? 1 : 0);
    neonDot(DOT.xb, DOT.y, r, s.b ? 1 : 0);
  });
  // "Neither one ever moves": pin marks under each dot during the hook
  withAlpha(span(t, 1.2, 6.6, 0.4, 0.4), () => {
    for (const x of [DOT.xa, DOT.xb]) {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(x, DOT.y + 52); ctx.lineTo(x, DOT.y + 112); ctx.stroke(); ctx.setLineDash([]);
      font(500, 22); text(x === DOT.xa ? 'A' : 'B', x, DOT.y + 142, { color: C.soft, align: 'center', base: 'middle', spacing: '2px' });
    }
    font(400, 24); text('both fixed in place', W / 2, DOT.y + 196, { color: C.soft, align: 'center', base: 'middle', spacing: '1px' });
  });
  // "Nothing is ever drawn in between": the empty middle, outlined
  withAlpha(span(t, 17.9, 21.0, 0.4, 0.35), () => {
    const x0 = DOT.xa + 58, x1 = DOT.xb - 58, y0 = DOT.y - 40, y1 = DOT.y + 40;
    const p = eout(seg(t, 17.9, 18.6));
    ctx.setLineDash([8, 8]); ctx.lineDashOffset = -t * 20;
    rrect(lerp((x0 + x1) / 2, x0, p), y0, (x1 - x0) * p, y1 - y0, 12);
    ctx.strokeStyle = `rgba(${C.magRGB},0.85)`; ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]);
    font(500, 22); text('NO FRAME EVER DRAWS HERE', W / 2, y1 + 34, { color: C.magenta, align: 'center', base: 'middle', spacing: '2px' });
  });
}

/** Scrolling oscilloscope traces of the two dots, and the timing readout (scenes S, M, F). */
const TR = { x0: 150, x1: 714, ya: 534, yb: 598, h: 30, win: 48 };
function tracesLayer(t) {
  const a = span(t, 6.75, 29.0, 0.45, 0.35);
  if (a <= 0) return;
  const f = frameOf(t);
  withAlpha(a, () => {
    const dx = (TR.x1 - TR.x0) / TR.win;
    for (const [key, y, label] of [['a', TR.ya, 'A'], ['b', TR.yb, 'B']]) {
      font(500, 22); text(label, TR.x0 - 34, y - TR.h / 2, { color: C.soft, align: 'center', base: 'middle' });
      ctx.strokeStyle = 'rgba(234,246,251,0.10)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(TR.x0, y); ctx.lineTo(TR.x1, y); ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i <= TR.win; i++) {
        const g = f - TR.win + i;
        const lit = dotState(g)[key];
        const yy = lit ? y - TR.h : y, x = TR.x0 + i * dx;
        if (i === 0) ctx.moveTo(x, yy);
        else {
          const prevLit = dotState(g - 1)[key];
          if (prevLit !== lit) ctx.lineTo(x, prevLit ? y - TR.h : y);
          ctx.lineTo(x, yy);
        }
        if (i < TR.win) ctx.lineTo(x + dx, yy);
      }
      glowStroke(C.cyanRGB, 2.5, 0.9);
    }
    // playhead at "now"
    ctx.strokeStyle = `rgba(${C.magRGB},0.8)`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(TR.x1 + 4, TR.ya - TR.h - 12); ctx.lineTo(TR.x1 + 4, TR.yb + 10); ctx.stroke();
    font(400, 22); text('now', TR.x1 + 4, TR.yb + 30, { color: C.magSoft, align: 'center', base: 'middle' });
    font(400, 22); text('last 1.6 s', TR.x0, TR.yb + 30, { color: C.faint, base: 'middle' });
    // readout, computed from the frame schedule
    const st = stageOf(f) ?? FAST;
    readout(st);
  });
}
/** Width of a label drawn with letter spacing (canvas measureText leaves the spacing out). */
const spacedWidth = (s, px) => ctx.measureText(s).width + px * s.length;
/** A row of LABEL value pairs, centred, computed from the frame schedule. */
function readoutRow(parts, y = 682, note = true) {
  const sp = 46;
  const widths = parts.map(([l, v]) => { font(400, 24); const a = spacedWidth(l, 3) + 10; font(500, 30); return a + ctx.measureText(v).width; });
  let x = W / 2 - (widths.reduce((s, w) => s + w, 0) + sp * (parts.length - 1)) / 2;
  parts.forEach(([l, v], i) => {
    font(400, 24); text(l, x, y, { color: C.soft, base: 'middle', spacing: '3px' });
    const lw = spacedWidth(l, 3) + 10;
    font(500, 30); text(v, x + lw, y, { color: C.magenta, base: 'middle' });
    x += widths[i] + sp;
  });
  if (note) { font(400, 22); text('timings at 1× speed', W / 2, y + 40, { color: C.faint, align: 'center', base: 'middle', spacing: '1px' }); }
}
function readout(st) { readoutRow([['ON', `${ms(st.on)} ms`], ['GAP', `${ms(st.gap)} ms`]]); }

function stageTags(t) {
  const tags = [
    [6.75, 10.8, 'SLOW'], [10.8, 21.0, 'THE SWEET SPOT'], [21.0, 29.0, 'FAST'], [28.95, 33.9, 'A RING OF DISCS'],
    [33.8, 41.65, 'FLIP-BOOK'], [41.65, 45.6, 'THIS CLIP'], [45.55, 50.1, 'THE OLD EXPLANATION'], [50.0, 54.2, 'ONCE MORE'],
  ];
  for (const [a, b, label] of tags) stageTag(label, span(t, a, b, 0.3, 0.3));
}

// ---------- the ring (scene R) ----------
const RG = { cx: W / 2, cy: 420, rad: 160, r: 22 };
function sceneR(t) {
  const f = frameOf(t);
  const lap = RING.n * RING.off;
  const hidden = Math.floor(((f - R0) % lap + lap) % lap / RING.off);
  const grow = eout(seg(t, 28.9, 29.6));
  for (let i = 0; i < RING.n; i++) {
    const th = -Math.PI / 2 + (i / RING.n) * TAU;
    const rad = RG.rad * (0.7 + 0.3 * grow);
    const x = RG.cx + rad * Math.cos(th), y = RG.cy + rad * Math.sin(th);
    neonDot(x, y, RG.r, f >= R0 && i === hidden ? 0 : 1, C.cyanRGB, 0.2);
  }
  // clockwise hint
  withAlpha(seg(t, 29.6, 30.2) * 0.8, () => {
    ctx.beginPath(); ctx.arc(RG.cx, RG.cy, RG.rad - 64, -Math.PI * 0.9, -Math.PI * 0.35);
    ctx.strokeStyle = `rgba(${C.magRGB},0.6)`; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.stroke(); ctx.setLineDash([]);
    const th = -Math.PI * 0.35, rr = RG.rad - 64, ax = RG.cx + rr * Math.cos(th), ay = RG.cy + rr * Math.sin(th);
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(th + Math.PI / 2);
    ctx.fillStyle = `rgba(${C.magRGB},0.8)`; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-6, -7); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  readoutRow([['EACH DISC OFF', `${ms(RING.off)} ms`], ['LAP', `${ms(lap)} ms`]]);
}

// ---------- the flip-book (scene E) ----------
const PAGES = 12, BOUNCE = 1.2;   // twelve drawings make one bounce; at 10 pages/s that is 1.2 s
/** Ball in a card at phase u (0..1 of one bounce): height and squash. */
function ballAt(u) {
  const h = 4 * u * (1 - u);
  const contact = Math.max(0, 1 - Math.min(u, 1 - u) / 0.05);
  const sx = 1 + 0.28 * contact - 0.08 * (1 - contact) * seg(h, 0.2, 0.6) * (1 - seg(h, 0.85, 1));
  return { h, sx, sy: 1 / sx };
}
function card(x, y, w, h, u, { label = null, a = 1, border = 0.55 } = {}) {
  withAlpha(a, () => {
    rrect(x, y, w, h, Math.max(6, w * 0.035)); ctx.fillStyle = '#0A0E18'; ctx.fill();
    ctx.strokeStyle = `rgba(${C.cyanRGB},${border})`; ctx.lineWidth = Math.max(1.5, w * 0.006); ctx.stroke();
    const floor = y + h * 0.84, r = w * 0.065;
    ctx.strokeStyle = `rgba(${C.cyanRGB},0.35)`; ctx.lineWidth = Math.max(1.5, w * 0.006);
    ctx.beginPath(); ctx.moveTo(x + w * 0.14, floor); ctx.lineTo(x + w * 0.86, floor); ctx.stroke();
    const { h: bh, sx, sy } = ballAt(u);
    const cy = floor - r * sy - bh * h * 0.56;
    // shadow on the floor
    ctx.fillStyle = `rgba(${C.magRGB},${0.10 + 0.18 * (1 - bh)})`;
    ctx.beginPath(); ctx.ellipse(x + w / 2, floor + 2, r * (1.3 - 0.5 * bh), r * 0.22, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(x + w / 2, cy + r * sy); ctx.scale(sx, sy); ctx.translate(0, -r);
    neonDot(0, 0, r, 1, C.magRGB, 0);
    ctx.restore();
    if (label) { font(500, Math.max(22, Math.round(w * 0.075))); text(label, x + w - w * 0.06, y + h * 0.16, { color: C.soft, align: 'right', base: 'middle' }); }
  });
}
const GRID = { w: 150, h: 112, gap: 18, x0: W / 2 - (4 * 150 + 3 * 18) / 2, y0: 250 };
const gridPos = (i) => [GRID.x0 + (i % 4) * (GRID.w + GRID.gap), GRID.y0 + Math.floor(i / 4) * (GRID.h + 22)];
const STACK = { x: 242, y: 232, w: 380, h: 285 };
const FL0 = frameOf(38.5), FL1 = frameOf(40.1), SLOWP = 10, FASTP = 3;   // 3 pages/s, then 10 pages/s
function pageAt(f) {
  if (f < FL0) return { p: 0, since: 99 };
  if (f < FL1) return { p: Math.floor((f - FL0) / SLOWP), since: (f - FL0) % SLOWP };
  const p0 = Math.floor((FL1 - FL0) / SLOWP);
  return { p: p0 + Math.floor((f - FL1) / FASTP), since: 99 };
}
function sceneE(t) {
  const f = frameOf(t);
  const gather = (i) => eio(seg(t, 37.95 + (PAGES - 1 - i) * 0.025, 38.45 + (PAGES - 1 - i) * 0.025));
  const E3 = 41.65;
  const shrink = eio(seg(t, E3, E3 + 0.6));
  const sx = lerp(STACK.x, 282, shrink), sy = lerp(STACK.y, 208, shrink), sw = lerp(STACK.w, 300, shrink), sh = lerp(STACK.h, 225, shrink);
  // stack edges behind
  withAlpha(seg(t, 38.2, 38.6), () => {
    for (const o of [14, 7]) { rrect(sx + o, sy + o, sw, sh, 12); ctx.fillStyle = '#070A12'; ctx.fill(); ctx.strokeStyle = `rgba(${C.cyanRGB},0.22)`; ctx.lineWidth = 1.5; ctx.stroke(); }
  });
  if (t < 38.6) {
    for (let i = PAGES - 1; i >= 0; i--) {
      const [gx, gy] = gridPos(i);
      const appear = eout(seg(t, 34.0 + i * 0.16, 34.5 + i * 0.16));
      const g = gather(i);
      const x = lerp(gx, sx, g), y = lerp(gy, sy, g) + (1 - appear) * 18, w = lerp(GRID.w, sw, g), h = lerp(GRID.h, sh, g);
      card(x, y, w, h, i / PAGES, { label: String(i + 1), a: appear });
    }
  } else if (t < E3 + 0.05) {
    const { p, since } = pageAt(f);
    card(sx, sy, sw, sh, (p % PAGES) / PAGES, { label: String((p % PAGES) + 1) });
    // in the slow part, the page just turned flicks up and away
    if (f >= FL0 + SLOWP && f < FL1 && since < 4) {
      const q = since / 4;
      card(sx, sy - q * 120, sw, sh, ((p - 1 + PAGES) % PAGES) / PAGES, { label: String(((p - 1 + PAGES) % PAGES) + 1), a: 1 - q });
    }
  } else {
    // the same bounce, now drawn fresh for every frame of this clip
    const u = (((t - E3) / BOUNCE) % 1 + 1) % 1;
    card(sx, sy, sw, sh, u);
    filmStrip(t, f);
  }
  // readouts
  withAlpha(span(t, 38.5, 40.1, 0.2, 0.15), () => rate('3 PAGES PER SECOND', `each page ${ms(SLOWP)} ms`));
  withAlpha(span(t, 40.1, E3, 0.15, 0.2), () => rate('10 PAGES PER SECOND', `each page ${ms(FASTP)} ms`));
  withAlpha(span(t, E3 + 0.1, 45.6, 0.3, 0.3), () => {
    rate(`${FPS} FRAMES PER SECOND`, `this is frame ${(f + 1).toLocaleString('en-US')}`);
  });
}
function rate(main, sub) {
  font(500, 30); text(main, W / 2, 664, { color: C.magenta, align: 'center', base: 'middle', spacing: '3px' });
  font(400, 24); text(sub, W / 2, 706, { color: C.soft, align: 'center', base: 'middle', spacing: '1px' });
}
/** A strip of the last five frames of this clip, each a still. */
function filmStrip(t, f) {
  const a = eout(seg(t, 41.85, 42.4));
  withAlpha(a, () => {
    const n = 5, cw = 112, ch = 84, gap = 20, x0 = W / 2 - (n * cw + (n - 1) * gap) / 2, y0 = 478;
    rrect(x0 - 18, y0 - 26, n * cw + (n - 1) * gap + 36, ch + 52, 10); ctx.fillStyle = '#05070D'; ctx.fill();
    ctx.strokeStyle = 'rgba(234,246,251,0.14)'; ctx.lineWidth = 1.5; ctx.stroke();
    // sprocket holes
    ctx.fillStyle = 'rgba(234,246,251,0.18)';
    for (let i = 0; i < 22; i++) {
      const x = x0 - 8 + i * ((n * cw + (n - 1) * gap + 4) / 21);
      rrect(x - 4, y0 - 18, 8, 8, 2); ctx.fill(); rrect(x - 4, y0 + ch + 12, 8, 8, 2); ctx.fill();
    }
    for (let j = 0; j < n; j++) {
      const g = f - (n - 1 - j);
      const u = ((((g / FPS) - 41.65) / BOUNCE) % 1 + 1) % 1;
      card(x0 + j * (cw + gap), y0, cw, ch, u, { border: j === n - 1 ? 0.9 : 0.4 });
    }
    font(400, 22); text('the last five frames', W / 2, y0 + ch + 48, { color: C.faint, align: 'center', base: 'middle', spacing: '1px' });
  });
}

// ---------- persistence of vision (scene P) ----------
function sceneP(t) {
  const p = eout(seg(t, 45.6, 46.2));
  withAlpha(p, () => {
    font(400, 24); text('“IMAGES LINGER ON THE RETINA”', W / 2, 330, { color: C.soft, align: 'center', base: 'middle', spacing: '3px' });
    font(300, 62); text('persistence of vision', W / 2, 420 + (1 - p) * 14, { color: C.ink, align: 'center', base: 'middle' });
    const w = ctx.measureText('persistence of vision').width;
    const s = eio(seg(t, 46.9, 47.5));
    if (s > 0) {
      ctx.beginPath(); ctx.moveTo(W / 2 - w / 2 - 16, 424); ctx.lineTo(W / 2 - w / 2 - 16 + (w + 32) * s, 418);
      glowStroke(C.magRGB, 4, 1);
    }
    withAlpha(eout(seg(t, 47.4, 47.9)), () => {
      font(500, 28); text('rejected by psychologists', W / 2, 510, { color: C.magenta, align: 'center', base: 'middle', spacing: '1px' });
      font(400, 24); text('as the reason films seem to move', W / 2, 552, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

// ---------- payoff (scene G) ----------
function sceneG(t) {
  withAlpha(eout(seg(t, 50.3, 50.9)), () => readoutRow([['ON', `${ms(SWEET.on)} ms`], ['GAP', `${ms(SWEET.gap)} ms`]], 520));
  withAlpha(eout(seg(t, 50.6, 51.2)), () => {
    font(400, 22);
    text('Sources: Wikipedia, “Beta movement”, “Phi phenomenon”,', W / 2, 660, { color: 'rgba(234,246,251,0.5)', align: 'center', base: 'middle' });
    text('“Persistence of vision”, “Flip book”', W / 2, 692, { color: 'rgba(234,246,251,0.5)', align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 400, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: F, ink: C.ink, marks: { '*': C.cyan, '~': C.magenta } });
  }
}

Kit.scene({
  width: W, height: H, duration: 54.2,
  fonts: [{ family: F, file: 'Jost.woff2', weight: '100 900' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    ctx.drawImage(STAGE, 0, 0);
    header();
    screenFrame(eout(seg(t, 0.1, 0.9)));
    stageTags(t);
    dotsLayer(t);
    tracesLayer(t);
    const scenes = [[sceneR, T.R, 0.4, 0.3], [sceneE, T.E, 0.3, 0.3], [sceneP, T.P, 0.3, 0.3], [sceneG, T.G, 0.3, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    ctx.drawImage(OVERLAY, 0, 0);
    captions(t);
  },
});
