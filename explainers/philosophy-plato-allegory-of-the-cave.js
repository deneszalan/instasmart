// Explainer for philosophy-plato-allegory-of-the-cave: Plato's prisoners take shadows for reality.
// Look: firelight on stone. Deep umber rock with a speckled, layered texture; a flickering orange
// fire; flat black silhouette figures made of simple strokes; a pale daylight world above ground.
// One family: Crimson Pro, an old-style serif.
//
// Facts (Wikipedia, "Allegory of the cave"): Republic 514a–520a, Book VII; a dialogue between
// Glaucon and Socrates, narrated by Socrates; prisoners chained by necks and legs since childhood,
// facing the wall; behind them a fire, and between fire and prisoners a raised walkway with a low
// parapet, behind which people carry objects, including images "of men and other living things";
// only the objects' shadows reach the wall, and for the prisoners they are reality; one is freed,
// the fire's light hurts his eyes; he is dragged "up the rough ascent, the steep way up" into the
// sunlight; his eyes adjust until he can look at the sun (516a); back in the cave he is blind
// (516e); the others infer the journey harmed him and would kill anyone who tried to drag them
// out (517a). Wikipedia, "Republic (Plato)": the allegory "depicts Plato's distinction between the
// world of appearances and the 'real' world of the Forms", building on the Sun and the Divided Line.
// Wikipedia, "Analogy of the Sun": the sun lights the visible as the Good lights the intelligible.
//
// Scene plan (55 s). Captions centred at y = 830; everything else above y = 770.
//  A  0.0– 7.4  Hook, the prisoners' view: shadows of a statue, a horse, a jar and a bird glide
//               across a firelit wall; three chained heads seen from behind.
//  B  6.3–20.4  Pull back to a cutaway diagram: wall, prisoners, low wall, a carried object, the
//               fire and the way out, labelled. Light rays from the fire past the object show how
//               its shadow lands on the wall (the geometry is computed: shadow = ray from the fire).
//  C 20.5–34.8  The freeing: one prisoner's chains fall, he turns, the fire dazzles him; he is led
//               along the path and up the steep tunnel (camera follows), is blinded at the mouth,
//               and his eyes adjust until the sun is crisp.
//  D 34.9–44.5  The return: back down into the dark, which he can't see in; the others are
//               agitated; a way out is drawn and struck through.
//  E 44.6–55.0  Payoff: chips name the parts. Shadows = appearances, the sunlit world = the Forms;
//               the sun echoes the Analogy of the Sun, where it stands for the Good.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  ink: '#F4E6CC', soft: 'rgba(244,230,204,0.72)', faint: 'rgba(244,230,204,0.40)',
  ochre: '#E2AC5C', ochreDeep: '#A8692A', fire: '#FF8F3F', flame: '#FFD98A', ember: '#C2410C',
  rock: '#2A190D', rockDark: '#160D06', air: '#241509', sil: '#0B0604', shadow: '#170D06',
  chain: '#8C6A3E', sky: '#F6E8C6', skyTop: '#EBCF95', sun: '#FFF8E8', hill: '#D2AE6C', hillNear: '#BE904A',
  tree: '#5A3A1C', treeLeaf: '#7C5A28', umberInk: '#3A230F', gold: '#F5D58A',
};
const F = 'CrimsonPro';

let k, ctx;
const font = (weight, size) => k.font(weight, size, F);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

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

// ---------- timeline ----------
const T = { A: [0, 7.4], B: [6.3, 55] };
const CUES = [
  [0.5, 4.3, 'What if *shadows* were all you had ever seen?'],
  [4.4, 10.0, 'In Plato’s ~Republic~, Socrates asks Glaucon to picture prisoners chained since childhood, facing a wall.'],
  [10.1, 15.1, 'Behind them burns a *fire*. People walk behind a low wall, carrying objects.'],
  [15.2, 20.4, 'Only the objects’ *shadows* reach the wall, and the prisoners take them for reality.'],
  [20.5, 25.2, 'Then one is freed. He turns, and the *firelight* hurts his eyes.'],
  [25.3, 29.7, 'He is dragged up the steep, rough path into the ~sunlight~.'],
  [29.8, 34.8, 'Slowly his eyes adjust, until at last he can look at the ~sun~.'],
  [34.9, 40.5, 'Back in the *dark* he can’t see, and the others think the journey harmed him.'],
  [40.6, 44.5, 'They would fight anyone who tried to free them.'],
  [44.6, 49.6, 'Plato uses the cave to contrast *appearances* with the real world of ~Forms~.'],
  [49.7, 54.7, 'The sun echoes Socrates’ image just before, where it stands for ~the Good~.'],
];

// ---------- firelight ----------
/** Deterministic flicker, about 0.25..1. */
const flick = (t) => 0.62 + 0.16 * Math.sin(t * 6.1) + 0.11 * Math.sin(t * 11.7 + 1.3) + 0.07 * Math.sin(t * 19.3 + 0.4) + 0.04 * Math.sin(t * 31.1 + 2.2);
const lightK = (t) => 0.9 + 0.22 * (flick(t) - 0.62);

// ---------- the cave, in world coordinates (the full shot draws them 1:1) ----------
const GROUND = 300;
const HOLLOW = [
  [64, 748], [62, 600], [66, 470], [92, 400], [150, 366], [260, 346], [380, 342], [500, 352], [586, 384], [634, 430],
  [658, 500], [668, 560], [676, 520], [690, 440], [704, 370], [716, 300], [792, 300], [772, 360], [748, 450], [728, 540], [712, 610], [704, 662],
  [548, 662], [544, 712], [352, 712], [348, 745],
];
const FIRE = { x: 600, y: 612, base: 662 };
const WALL_X = 96;            // the wall plane the shadows fall on
const WALL_FACE = 120;        // where the shadows are drawn (a flat, slightly foreshortened face)
const PARAPET = { x0: 356, x1: 374, top: 618, bottom: 712 };
const CARRIER_X = 455, ROAD = 712, FLOOR = 745, FIG = 0.92;
const OBJ = { x: 452, y: 588, size: 36 };
const PRISONERS = [200, 252, 304];
const ROUTE_UP = [[304, 745], [340, 745], [350, 742], [358, 712], [540, 712], [546, 662], [700, 662], [712, 610], [728, 540], [748, 450], [772, 360], [792, 302], [812, 300]];
const ROUTE_DOWN = [...ROUTE_UP].reverse().slice(0, -2).concat([[336, 745]]);
const SUN = { x: 330, y: 205, r: 28 };

/** Where the ray from the fire through (x, y) meets the wall plane. */
const onWall = (x, y, fx = FIRE.x, fy = FIRE.y) => fy + (y - fy) * (WALL_X - fx) / (x - fx);
const magnify = (x, fx = FIRE.x) => (WALL_X - fx) / (x - fx);
/** Below this height the wall lies in the low wall's shadow (computed from the fire and the parapet top). */
const litLine = (fx = FIRE.x, fy = FIRE.y) => onWall((PARAPET.x0 + PARAPET.x1) / 2, PARAPET.top, fx, fy);

function polyPath(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }

/** A point a fraction u of the way along a polyline, by length. */
function along(pts, u) {
  const lens = []; let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); total += l; }
  let d = clamp(u) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) { const f = lens[i] ? clamp(d / lens[i]) : 0; return { x: lerp(pts[i][0], pts[i + 1][0], f), y: lerp(pts[i][1], pts[i + 1][1], f), dist: u * total, dx: pts[i + 1][0] - pts[i][0] }; }
    d -= lens[i];
  }
  return { x: pts.at(-1)[0], y: pts.at(-1)[1], dist: total, dx: 0 };
}

// ---------- textures, painted once ----------
let rockPat = null, wallTex = null, vignette = null;
function paintTextures() {
  // a tile of rock: speckles and faint strata
  const tile = document.createElement('canvas'); tile.width = 256; tile.height = 256;
  const g = tile.getContext('2d');
  g.fillStyle = C.rock; g.fillRect(0, 0, 256, 256);
  const r = rng(11);
  for (let i = 0; i < 1400; i++) {
    const x = r() * 256, y = r() * 256, s = 1 + r() * 2.6, l = r();
    g.fillStyle = l < 0.5 ? `rgba(10,5,2,${0.18 + r() * 0.25})` : `rgba(120,78,40,${0.05 + r() * 0.12})`;
    g.fillRect(x, y, s, s);
  }
  g.strokeStyle = 'rgba(120,80,40,0.10)'; g.lineWidth = 1.5;
  for (let j = 0; j < 7; j++) {
    const y0 = j * 37 + r() * 10;
    g.beginPath();
    for (let x = -4; x <= 260; x += 8) { const y = y0 + Math.sin(x * 0.045 + j) * 4 + Math.sin(x * 0.13 + j * 2) * 1.5; x < 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
  }
  rockPat = ctx.createPattern(tile, 'repeat');

  // the frontal wall for the hook
  wallTex = document.createElement('canvas'); wallTex.width = W; wallTex.height = H;
  const w = wallTex.getContext('2d');
  w.fillStyle = '#3A2414'; w.fillRect(0, 0, W, H);
  const r2 = rng(5);
  for (let i = 0; i < 140; i++) {
    const x = r2() * W, y = r2() * H * 0.8, rx = 40 + r2() * 140, ry = 20 + r2() * 60;
    const gr = w.createRadialGradient(x, y, 0, x, y, rx);
    const dark = r2() < 0.5;
    gr.addColorStop(0, dark ? 'rgba(20,10,4,0.20)' : 'rgba(150,100,55,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    w.fillStyle = gr; w.save(); w.translate(x, y); w.scale(1, ry / rx); w.translate(-x, -y);
    w.beginPath(); w.arc(x, y, rx, 0, TAU); w.fill(); w.restore();
  }
  for (let i = 0; i < 5000; i++) {
    const x = r2() * W, y = r2() * H, s = 1 + r2() * 2.2;
    w.fillStyle = r2() < 0.55 ? `rgba(12,6,2,${0.12 + r2() * 0.22})` : `rgba(170,120,70,${0.05 + r2() * 0.1})`;
    w.fillRect(x, y, s, s);
  }
  w.strokeStyle = 'rgba(16,8,3,0.35)'; w.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    let x = r2() * W, y = r2() * 560;
    w.beginPath(); w.moveTo(x, y);
    for (let j = 0; j < 6; j++) { x += (r2() - 0.5) * 60; y += 14 + r2() * 26; w.lineTo(x, y); }
    w.stroke();
  }

  vignette = document.createElement('canvas'); vignette.width = W; vignette.height = H;
  const v = vignette.getContext('2d');
  const vg = v.createRadialGradient(W / 2, H * 0.44, 260, W / 2, H * 0.48, 780);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  v.fillStyle = vg; v.fillRect(0, 0, W, H);
  const bg = v.createLinearGradient(0, 740, 0, H);
  bg.addColorStop(0, 'rgba(8,4,2,0)'); bg.addColorStop(0.35, 'rgba(8,4,2,0.55)'); bg.addColorStop(1, 'rgba(8,4,2,0.85)');
  v.fillStyle = bg; v.fillRect(0, 740, W, H - 740);
}

// ---------- shapes: the carried objects (unit size, centred, facing left) ----------
function piece(g, fn) { g.beginPath(); fn(); g.fill(); }
const SHAPES = {
  horse(g) {
    piece(g, () => g.ellipse(0.05, 0, 0.42, 0.18, 0, 0, TAU));
    piece(g, () => { g.moveTo(-0.24, -0.06); g.lineTo(-0.42, -0.38); g.lineTo(-0.29, -0.45); g.lineTo(-0.1, -0.12); g.closePath(); });
    piece(g, () => { g.moveTo(-0.33, -0.47); g.lineTo(-0.59, -0.3); g.lineTo(-0.56, -0.23); g.lineTo(-0.37, -0.29); g.lineTo(-0.26, -0.4); g.closePath(); });
    piece(g, () => { g.moveTo(-0.34, -0.44); g.lineTo(-0.31, -0.56); g.lineTo(-0.27, -0.44); g.closePath(); });
    for (const x of [-0.3, -0.18, 0.24, 0.36]) piece(g, () => g.rect(x, 0.04, 0.065, 0.44));
    piece(g, () => { g.moveTo(0.44, -0.09); g.quadraticCurveTo(0.64, 0, 0.58, 0.32); g.lineTo(0.52, 0.32); g.quadraticCurveTo(0.54, 0.06, 0.42, 0.01); g.closePath(); });
  },
  jar(g) {
    piece(g, () => {
      g.moveTo(-0.08, -0.48); g.lineTo(0.08, -0.48); g.lineTo(0.06, -0.36);
      g.bezierCurveTo(0.36, -0.28, 0.38, 0.12, 0.12, 0.4); g.lineTo(0.08, 0.5); g.lineTo(-0.08, 0.5); g.lineTo(-0.12, 0.4);
      g.bezierCurveTo(-0.38, 0.12, -0.36, -0.28, -0.06, -0.36); g.closePath();
    });
    piece(g, () => g.rect(-0.12, -0.53, 0.24, 0.06));
    g.lineWidth = 0.055; g.strokeStyle = g.fillStyle;
    for (const s of [1, -1]) { g.beginPath(); g.moveTo(0.05 * s, -0.42); g.quadraticCurveTo(0.27 * s, -0.46, 0.21 * s, -0.2); g.stroke(); }
  },
  bird(g, t = 0) {
    const flap = Math.sin(t * 7) * 0.22;
    piece(g, () => g.ellipse(0, 0, 0.3, 0.09, -0.08, 0, TAU));
    piece(g, () => g.arc(-0.3, -0.05, 0.085, 0, TAU));
    piece(g, () => { g.moveTo(-0.37, -0.07); g.lineTo(-0.5, -0.03); g.lineTo(-0.37, -0.01); g.closePath(); });
    piece(g, () => { g.moveTo(-0.08, -0.05); g.lineTo(0.12, -0.42 + flap); g.lineTo(0.27, -0.38 + flap); g.lineTo(0.12, -0.02); g.closePath(); });
    piece(g, () => { g.moveTo(0.25, -0.01); g.lineTo(0.5, -0.1); g.lineTo(0.47, 0.08); g.closePath(); });
  },
  statue(g) {
    piece(g, () => g.arc(0, -0.38, 0.085, 0, TAU));
    piece(g, () => g.roundRect(-0.085, -0.28, 0.17, 0.36, 0.05));
    piece(g, () => g.rect(-0.07, 0.06, 0.06, 0.36));
    piece(g, () => g.rect(0.012, 0.06, 0.06, 0.36));
    g.lineWidth = 0.055; g.strokeStyle = g.fillStyle; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-0.05, -0.24); g.lineTo(-0.24, -0.44); g.stroke();
    g.beginPath(); g.moveTo(0.06, -0.22); g.lineTo(0.1, 0.02); g.stroke();
    piece(g, () => g.rect(-0.15, 0.42, 0.3, 0.07));
  },
};
/** Draw a shape with its pole, centred at (x, y), `s` px per unit. */
function drawObject(name, x, y, s, color, t, pole = 1.3) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = color;
  SHAPES[name](ctx, t);
  ctx.fillRect(-0.025, 0.48, 0.05, pole);
  ctx.restore();
}

// ---------- figures: flat silhouettes made of thick strokes ----------
/**
 * A person facing left with its feet at (x, y). pose: 0 seated .. 1 standing. dir: 1 faces left,
 * -1 faces right (values between show the turn). lean > 0 leans back. walk: leg phase in radians.
 */
function person(x, y, { pose = 1, dir = 1, lean = 0, walk = null, shield = 0, hold = 0, color = C.sil, s = FIG, glow = 0, glowRGB = '255,214,140' } = {}) {
  const P = (a, b) => [lerp(a[0], b[0], pose), lerp(a[1], b[1], pose)];
  const sw = walk === null ? 0 : Math.sin(walk) * 13;
  const bob = walk === null ? 0 : -Math.abs(Math.cos(walk)) * 2.5;
  const head = P([-2, -60], [0, -86]), neck = P([0, -50], [0, -74]), hip = P([5, -12], [0, -40]);
  const kneeA = P([-26, -18], [-2 - sw * 0.6, -21]), footA = P([-30, -1], [-3 - sw, 0]);
  const kneeB = P([-24, -16], [-2 + sw * 0.6, -21]), footB = P([-28, 0], [-3 + sw, 0]);
  const shoulder = P([0, -45], [0, -70]);
  let hand = shield > 0 ? [lerp(-20, -12, shield), lerp(-24, -84, shield)] : P([-22, -22], [-4 + sw * 0.4, -44]);
  let elbow = shield > 0 ? [lerp(-12, -18, shield), lerp(-34, -66, shield)] : P([-12, -34], [-2, -56]);
  if (hold) { hand = [-3, -96]; elbow = [-12, -80]; }
  ctx.save();
  ctx.translate(x, y + bob); ctx.scale(s * dir, s); ctx.rotate(lean);
  if (glow > 0) { ctx.shadowColor = `rgba(${glowRGB},${0.9 * glow})`; ctx.shadowBlur = 16 * glow; }
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const seg2 = (a, b, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); };
  const limb = (a, b, c, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.stroke(); };
  limb(hip, kneeB, footB, 10);
  limb(hip, kneeA, footA, 11);
  seg2(neck, hip, 19);
  limb(shoulder, elbow, hand, 7.5);
  ctx.beginPath(); ctx.arc(head[0], head[1], 11.5, 0, TAU); ctx.fill();
  ctx.restore();
}

/** A chain of small oval links from a to b. */
function chain(a, b, alpha = 1, drop = 0) {
  withAlpha(alpha, () => {
    const n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 7));
    ctx.strokeStyle = C.chain; ctx.lineWidth = 2;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + Math.sin(Math.PI * u) * 5 + drop * (0.4 + u) ;
      ctx.beginPath(); ctx.ellipse(x, y, 3.6, 2.2, i % 2 ? 0.9 : -0.3, 0, TAU); ctx.stroke();
    }
  });
}

// ---------- camera ----------
const SC = { x: 432, y: 470 };
const SHOT = {
  B0: { x: 200, y: 590, z: 2.2 },
  DIAG: { x: 437, y: 540, z: 1.12 },
  WIDE: { x: 437, y: 505, z: 1.05 },
  FREE: { x: 440, y: 640, z: 1.55 },
  OUT: { x: 556, y: 262, z: 1.35 },
};
const mix = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) });

// the freed prisoner's journey
const WALK_UP = [25.3, 29.3], WALK_DOWN = [35.2, 38.8];
function freedState(t) {
  const st = { x: PRISONERS[2], y: FLOOR, pose: eio(seg(t, 20.7, 21.5)), dir: 1, lean: 0, walk: null, shield: 0 };
  const turn = eio(seg(t, 21.5, 22.0));
  st.dir = lerp(1, -1, turn);
  // dazzled by the fire
  const daz = seg(t, 22.1, 22.6) * (1 - seg(t, 24.6, 25.2));
  st.lean = 0.2 * eout(daz); st.shield = eout(daz);
  if (t >= WALK_UP[0] && t < WALK_UP[1] + 0.01) {
    const u = eio(seg(t, ...WALK_UP)), p = along(ROUTE_UP, u);
    Object.assign(st, { x: p.x, y: p.y, walk: p.dist / 11, dir: -1 });
  } else if (t >= WALK_UP[1]) {
    const end = ROUTE_UP.at(-1);
    Object.assign(st, { x: end[0], y: end[1], dir: lerp(-1, 1, eio(seg(t, 30.9, 31.5))) });
    st.lean = 0.08 * eio(seg(t, 31.6, 32.6)) * (1 - seg(t, 34.6, 35.2));
    st.shield = (1 - eio(seg(t, 30.0, 32.2)));
  }
  if (t >= WALK_DOWN[0]) {
    const u = eio(seg(t, ...WALK_DOWN)), p = along(ROUTE_DOWN, u);
    Object.assign(st, { x: p.x, y: p.y, walk: t < WALK_DOWN[1] ? p.dist / 11 : null, dir: 1, lean: 0, shield: 0 });
    if (t >= WALK_DOWN[1]) st.lean = -0.05 * Math.sin((t - WALK_DOWN[1]) * 2.2) * (1 - seg(t, 40, 41));
  }
  return st;
}

function camera(t) {
  if (t < 10.0) return mix(SHOT.B0, SHOT.DIAG, eio(seg(t, 6.3, 10.0)));
  if (t < 25.3) return mix(SHOT.DIAG, SHOT.FREE, eio(seg(t, 21.4, 22.6)));
  const follow = () => { const s = freedState(Math.min(t, WALK_UP[1])); return { x: s.x, y: s.y - 46, z: 1.7 }; };
  if (t < WALK_UP[1]) return mix(SHOT.FREE, follow(), eio(seg(t, 25.3, 26.3)));
  if (t < 34.9) {
    const out = { ...SHOT.OUT, x: SHOT.OUT.x - 10 * seg(t, 30.6, 34.9) };
    return mix(follow(), out, eio(seg(t, WALK_UP[1], 30.6)));
  }
  return mix({ ...SHOT.OUT, x: SHOT.OUT.x - 10 }, SHOT.WIDE, eio(seg(t, 34.9, 37.4)));
}
const toScreen = (cam, x, y) => [SC.x + (x - cam.x) * cam.z, SC.y + (y - cam.y) * cam.z];

// ---------- scene A: the prisoners' view ----------
const PARADE = [
  { name: 'statue', x0: -60, y: 440, s: 210 },
  { name: 'horse', x0: 240, y: 452, s: 220 },
  { name: 'jar', x0: 560, y: 430, s: 175 },
  { name: 'bird', x0: 830, y: 372, s: 170 },
];
function sceneA(t) {
  const L = lightK(t);
  ctx.save();
  const z = 1 + 0.05 * eio(seg(t, 0, 7.4));
  ctx.translate(W / 2, 520); ctx.scale(z, z); ctx.translate(-W / 2, -520);
  ctx.drawImage(wallTex, 0, 0);
  // firelight from behind the viewer, flickering
  const lg = ctx.createRadialGradient(W / 2, 760, 40, W / 2, 640, 760);
  lg.addColorStop(0, `rgba(255,150,60,${0.42 * L})`); lg.addColorStop(0.5, `rgba(214,120,50,${0.22 * L})`); lg.addColorStop(1, 'rgba(60,30,10,0)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  // the shadows; the fire's flicker nudges them
  const jx = Math.sin(t * 9.3) * 1.6 + Math.sin(t * 15.1) * 1.0, js = 1 + 0.012 * Math.sin(t * 12.7);
  ctx.save();
  ctx.filter = `blur(${2.2 + 0.8 * Math.sin(t * 8.1)}px)`;
  for (const o of PARADE) {
    const x = o.x0 + 58 * t + jx, y = o.y + Math.sin(t * 2.1 + o.x0) * 3;
    drawObject(o.name, x, y, o.s * js, C.shadow, t, 2.2);
  }
  ctx.restore();
  // the low wall's shadow along the bottom of the wall
  const pg = ctx.createLinearGradient(0, 560, 0, 650);
  pg.addColorStop(0, 'rgba(18,10,5,0)'); pg.addColorStop(1, 'rgba(18,10,5,0.94)');
  ctx.fillStyle = pg; ctx.fillRect(0, 560, W, 90); ctx.fillStyle = 'rgba(18,10,5,0.94)'; ctx.fillRect(0, 650, W, H - 650);
  ctx.restore();
  // three prisoners from behind, chained at the neck
  const heads = [190, 432, 674];
  for (const hx of heads) {
    ctx.fillStyle = C.sil;
    ctx.beginPath(); ctx.ellipse(hx, 690, 48, 54, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - 34, 730); ctx.quadraticCurveTo(hx - 140, 760, hx - 150, 900); ctx.lineTo(hx + 150, 900); ctx.quadraticCurveTo(hx + 140, 760, hx + 34, 730); ctx.closePath(); ctx.fill();
    ctx.fillRect(hx - 30, 720, 60, 40);
    // rim light from the fire behind
    ctx.strokeStyle = `rgba(255,150,70,${0.35 * lightK(t)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(hx, 690, 48, 54, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  }
  chain([150, 748], [472, 748]); chain([472, 748], [714, 748]); chain([20, 760], [150, 748]); chain([714, 748], [860, 760]);
  ctx.fillStyle = 'rgba(8,4,2,0.9)'; ctx.fillRect(0, 900, W, H - 900);
}

// ---------- scene B onwards: the cutaway ----------
const OBJECT_TIMES = [['horse', 6.0, 12.6], ['jar', 12.6, 18.2], ['statue', 18.2, 26.0], ['bird', 26.0, 60]];
function currentObjects(t) {
  const out = [];
  for (const [name, a, b] of OBJECT_TIMES) {
    if (t < a - 0.6 || t > b + 0.6) continue;
    const rise = eout(seg(t, a - 0.6, a)), sink = eio(seg(t, b - 0.2, b + 0.6));
    out.push({ name, dy: 44 * (1 - rise) + 44 * sink, a: Math.min(rise, 1 - sink), slide: 26 * (1 - rise) - 26 * sink });
  }
  return out;
}

function outsideWorld(t, reveal) {
  // sky
  const sg = ctx.createLinearGradient(0, -200, 0, GROUND);
  sg.addColorStop(0, C.skyTop); sg.addColorStop(1, C.sky);
  ctx.fillStyle = sg; ctx.fillRect(-400, -400, 1700, GROUND + 400);
  // the sun: blown out at first, crisp once his eyes adjust
  const crisp = eio(seg(t, 30.6, 33.8));
  const sr = lerp(SUN.r * 3.2, SUN.r, crisp);
  const glow = ctx.createRadialGradient(SUN.x, SUN.y, 0, SUN.x, SUN.y, 190);
  glow.addColorStop(0, 'rgba(255,250,232,0.95)'); glow.addColorStop(0.3, 'rgba(255,240,200,0.45)'); glow.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = glow; ctx.fillRect(SUN.x - 200, SUN.y - 200, 400, 400);
  ctx.strokeStyle = 'rgba(232,170,80,0.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + t * 0.08;
    ctx.beginPath(); ctx.moveTo(SUN.x + Math.cos(a) * (sr + 10), SUN.y + Math.sin(a) * (sr + 10));
    ctx.lineTo(SUN.x + Math.cos(a) * (sr + 24 + 4 * Math.sin(t * 2 + i)), SUN.y + Math.sin(a) * (sr + 24 + 4 * Math.sin(t * 2 + i))); ctx.stroke();
  }
  ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(SUN.x, SUN.y, sr, 0, TAU); ctx.fill();
  ctx.strokeStyle = `rgba(232,170,80,${0.8 * crisp})`; ctx.lineWidth = 2.5; ctx.stroke();
  // hills, a tree, the ground
  ctx.fillStyle = C.hill;
  ctx.beginPath(); ctx.moveTo(-400, GROUND); ctx.quadraticCurveTo(80, 236, 420, GROUND); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(300, GROUND); ctx.quadraticCurveTo(700, 240, 1300, GROUND); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.hillNear;
  ctx.beginPath(); ctx.moveTo(-400, GROUND); ctx.quadraticCurveTo(200, 262, 640, GROUND); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.tree; ctx.fillRect(553, 232, 12, 70);
  ctx.fillStyle = C.treeLeaf;
  for (const [x, y, r] of [[559, 214, 34], [530, 230, 24], [588, 228, 26], [560, 190, 22]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  // veil: the outside is unknown until he reaches it
  if (reveal < 1) { ctx.fillStyle = `rgba(14,8,4,${0.93 * (1 - reveal)})`; ctx.fillRect(-400, -400, 1700, GROUND + 402); }
}

function fireDraw(t, flare = 0) {
  const L = lightK(t), fx = FIRE.x, base = FIRE.base;
  // logs
  ctx.fillStyle = '#120A05';
  ctx.save(); ctx.translate(fx, base - 6); ctx.rotate(0.25); ctx.fillRect(-30, -5, 60, 10); ctx.rotate(-0.5); ctx.fillRect(-30, -5, 60, 10); ctx.restore();
  // flames
  const grow = 1 + 0.45 * flare;
  const tongues = [[-16, 30, 0], [-6, 46, 1.7], [4, 56, 3.1], [14, 40, 4.4], [22, 28, 5.6]];
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [dx, h0, ph] of tongues) {
    const h = h0 * grow * (0.82 + 0.18 * Math.sin(t * 9 + ph) + 0.08 * Math.sin(t * 17 + ph * 2));
    const sway = Math.sin(t * 5 + ph) * 5;
    const x = fx + dx * grow, y = base - 8;
    const fg = ctx.createLinearGradient(x, y, x, y - h);
    fg.addColorStop(0, 'rgba(255,140,50,0.9)'); fg.addColorStop(0.55, 'rgba(255,190,90,0.75)'); fg.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.moveTo(x - 11 * grow, y);
    ctx.quadraticCurveTo(x - 12 * grow, y - h * 0.5, x + sway, y - h);
    ctx.quadraticCurveTo(x + 12 * grow, y - h * 0.5, x + 11 * grow, y); ctx.closePath(); ctx.fill();
  }
  const core = ctx.createRadialGradient(fx, base - 18, 2, fx, base - 18, 26 * grow);
  core.addColorStop(0, 'rgba(255,240,190,0.95)'); core.addColorStop(1, 'rgba(255,200,110,0)');
  ctx.fillStyle = core; ctx.beginPath(); ctx.arc(fx, base - 18, 26 * grow, 0, TAU); ctx.fill();
  const glow = ctx.createRadialGradient(fx, FIRE.y, 10, fx, FIRE.y, 190 + 120 * flare);
  glow.addColorStop(0, `rgba(255,150,60,${(0.32 + 0.3 * flare) * L})`); glow.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(fx, FIRE.y, 190 + 120 * flare, 0, TAU); ctx.fill();
  ctx.restore();
}

function cutaway(t, cam) {
  const L = lightK(t);
  const reveal = seg(t, 29.5, 29.9);
  const flare = eout(seg(t, 22.0, 22.6)) * (1 - eio(seg(t, 24.4, 25.6)));
  const fjx = Math.sin(t * 9.3) * 1.2, fjy = Math.sin(t * 13.7) * 1.0;
  const fx = FIRE.x + fjx, fy = FIRE.y + fjy;
  ctx.save();
  ctx.translate(SC.x, SC.y); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);

  outsideWorld(t, reveal);
  // rock below ground
  ctx.fillStyle = rockPat; ctx.fillRect(-400, GROUND, 1700, 1200);
  ctx.fillStyle = 'rgba(160,110,60,0.5)'; ctx.fillRect(-400, GROUND, 1700, 4);
  // the hollow, lit by the fire
  polyPath(ctx, HOLLOW);
  ctx.fillStyle = C.air; ctx.fill();
  ctx.save(); ctx.clip();
  const ig = ctx.createRadialGradient(fx, fy, 20, fx - 80, fy - 40, 640);
  ig.addColorStop(0, `rgba(196,108,40,${0.85 * L})`); ig.addColorStop(0.35, `rgba(120,62,24,${0.7 * L})`); ig.addColorStop(1, 'rgba(40,22,10,0.3)');
  ctx.fillStyle = ig; ctx.fillRect(0, 280, 900, 520);
  // daylight spilling down the tunnel once the outside is revealed
  const dl = ctx.createLinearGradient(780, 300, 700, 520);
  dl.addColorStop(0, `rgba(255,236,190,${0.55 * reveal})`); dl.addColorStop(1, 'rgba(255,236,190,0)');
  ctx.fillStyle = dl; ctx.fillRect(620, 290, 220, 260);
  // the wall face, and the low wall's shadow across its foot
  const lit = litLine(fx, fy);
  const wf = ctx.createLinearGradient(66, 0, 200, 0);
  wf.addColorStop(0, `rgba(226,160,90,${0.55 * L})`); wf.addColorStop(1, 'rgba(226,160,90,0)');
  ctx.fillStyle = wf; ctx.fillRect(60, 360, 150, lit - 360);
  const sh = ctx.createLinearGradient(0, lit - 6, 0, lit + 10);
  sh.addColorStop(0, 'rgba(14,8,4,0)'); sh.addColorStop(1, 'rgba(14,8,4,0.78)');
  ctx.fillStyle = sh; ctx.fillRect(60, lit - 6, PARAPET.x0 - 60, 800);
  // the shadow of the carried object on the wall, computed from the ray through the fire
  ctx.save(); ctx.beginPath(); ctx.rect(60, 340, 200, lit - 340); ctx.clip();
  for (const o of currentObjects(t)) {
    const ox = OBJ.x + o.slide * 0.2, oy = OBJ.y + o.dy;
    const m = magnify(ox, fx);
    withAlpha(clamp(o.a * 1.2), () => {
      ctx.save(); ctx.translate(WALL_FACE + o.slide * 0.6, onWall(ox, oy, fx, fy)); ctx.scale(0.62, 1);
      ctx.filter = 'blur(1.5px)';
      drawObject(o.name, 0, 0, OBJ.size * m, C.shadow, t, 2.0);
      ctx.restore();
    });
  }
  ctx.restore();
  // light rays: the fire, past the object's edges, to the wall
  const rays = span(t, 15.6, 20.3, 0.6, 0.5);
  if (rays > 0) withAlpha(rays, () => {
    const top = OBJ.y - OBJ.size * 0.5, bot = OBJ.y + OBJ.size * 0.5;
    const yt = onWall(OBJ.x, top, fx, fy), yb = onWall(OBJ.x, bot, fx, fy);
    ctx.fillStyle = 'rgba(255,220,150,0.10)';
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(WALL_FACE, yt); ctx.lineTo(WALL_FACE, yb); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,224,160,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([7, 7]); ctx.lineDashOffset = -t * 30;
    for (const y of [yt, yb]) { ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(WALL_FACE, y); ctx.stroke(); }
    ctx.setLineDash([]);
  });
  ctx.restore(); // hollow clip
  // the cut edge of the rock
  polyPath(ctx, HOLLOW); ctx.strokeStyle = `rgba(214,150,80,${0.35 + 0.1 * L})`; ctx.lineWidth = 2.5; ctx.stroke();

  // prisoners: seated, chained at neck and legs
  for (let i = 0; i < 2; i++) prisoner(t, PRISONERS[i], 1);
  // the freed one
  const st = freedState(t);
  const chainsOn = 1 - seg(t, 20.7, 21.3);
  const drop = 120 * Math.pow(seg(t, 20.7, 21.3), 2);
  chain([PRISONERS[2] + 2, FLOOR - 46], [PRISONERS[2] + 24, FLOOR - 4], chainsOn, drop * 0.3);
  chain([PRISONERS[2] - 26, FLOOR - 3], [PRISONERS[2] - 4, FLOOR - 1], chainsOn, drop * 0.1);
  stake(PRISONERS[2] + 24);
  // carriers and their objects, hidden from the prisoners by the low wall
  for (const o of currentObjects(t)) {
    withAlpha(o.a, () => {
      person(CARRIER_X + o.slide, ROAD + o.dy * 0.15, { walk: t * 1.6, hold: 1, color: '#0E0805' });
      ctx.fillStyle = '#0E0805'; ctx.fillRect(OBJ.x + o.slide * 0.2 - 1.5, OBJ.y + o.dy + 14, 3, ROAD - 88 - (OBJ.y + o.dy + 14));
      drawObject(o.name, OBJ.x + o.slide * 0.2, OBJ.y + o.dy, OBJ.size, '#120A05', t, 0.6);
    });
  }
  // the freed prisoner walks behind the low wall, so he is drawn before it
  const freedGlow = seg(t, 36.0, 37.0) * (1 - seg(t, 44, 46));
  const rim = span(t, 20.5, 29.4, 0.5, 0.4) * 0.75;
  const drawFreed = () => person(st.x, st.y, { pose: st.pose, dir: st.dir, lean: st.lean, walk: st.walk, shield: st.shield, glow: rim, glowRGB: '255,150,70' });
  drawFreed();
  // the low wall
  ctx.fillStyle = rockPat; ctx.fillRect(PARAPET.x0, PARAPET.top, PARAPET.x1 - PARAPET.x0, PARAPET.bottom - PARAPET.top);
  ctx.strokeStyle = `rgba(214,150,80,${0.5 * L})`; ctx.lineWidth = 2; ctx.strokeRect(PARAPET.x0, PARAPET.top, PARAPET.x1 - PARAPET.x0, PARAPET.bottom - PARAPET.top);
  ctx.fillStyle = `rgba(255,170,90,${0.35 * L})`; ctx.fillRect(PARAPET.x1 - 3, PARAPET.top, 3, PARAPET.bottom - PARAPET.top);
  fireDraw(t, flare);

  // his blindness on the way back: the cave goes dark around him
  const dark = seg(t, 36.0, 37.0) * (1 - eio(seg(t, 41.0, 45.0)));
  if (dark > 0) {
    ctx.save(); polyPath(ctx, HOLLOW); ctx.clip();
    ctx.fillStyle = `rgba(6,3,1,${0.8 * dark})`; ctx.fillRect(0, 280, 900, 520);
    ctx.restore();
    person(st.x, st.y, { pose: 1, dir: st.dir, lean: st.lean, walk: st.walk, glow: freedGlow, color: '#1A0F07' });
    // the others, unsettled
    const ag = seg(t, 37.4, 38.0) * (1 - seg(t, 44.0, 44.6));
    withAlpha(ag, () => {
      ctx.strokeStyle = C.fire; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      for (const px of PRISONERS.slice(0, 2)) {
        const hx = px - 2 * FIG, hy = FLOOR - 60 * FIG;
        for (let j = 0; j < 3; j++) {
          const a = -Math.PI / 2 + (j - 1) * 0.55, p = 0.75 + 0.25 * Math.sin(t * 9 + j + px);
          ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * 17, hy + Math.sin(a) * 17); ctx.lineTo(hx + Math.cos(a) * (17 + 11 * p), hy + Math.sin(a) * (17 + 11 * p)); ctx.stroke();
        }
      }
    });
  }
  // a way out, refused
  const wayA = span(t, 40.7, 44.4, 0.3, 0.5);
  if (wayA > 0) withAlpha(wayA, () => {
    const prog = eio(seg(t, 40.7, 42.0));
    ctx.strokeStyle = 'rgba(245,213,138,0.85)'; ctx.lineWidth = 3; ctx.setLineDash([9, 9]); ctx.lineCap = 'round';
    ctx.beginPath();
    const n = 60;
    for (let i = 0; i <= n * prog; i++) { const p = along(ROUTE_UP.slice(1), i / n); i ? ctx.lineTo(p.x, p.y - 30) : ctx.moveTo(p.x, p.y - 30); }
    ctx.stroke(); ctx.setLineDash([]);
    const xa = eout(seg(t, 42.1, 42.5));
    if (xa > 0) {
      ctx.save(); ctx.translate(722, 520); ctx.scale(0.6 + 0.4 * back(seg(t, 42.1, 42.6)), 0.6 + 0.4 * back(seg(t, 42.1, 42.6)));
      ctx.strokeStyle = C.fire; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-26, -26); ctx.lineTo(26, 26); ctx.moveTo(26, -26); ctx.lineTo(-26, 26); ctx.stroke();
      ctx.restore();
    }
  });
  ctx.restore(); // camera

  // the fire dazzles him: a glare in screen space
  if (flare > 0) {
    const [sx, sy] = toScreen(cam, FIRE.x, FIRE.y);
    const gg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 420);
    gg.addColorStop(0, `rgba(255,236,190,${0.5 * flare})`); gg.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = gg; ctx.fillRect(0, 0, W, 770);
  }
  // blinded at the mouth
  const flash = eout(seg(t, 29.0, 29.7)) * (1 - eio(seg(t, 29.9, 32.6)));
  if (flash > 0) {
    const fg = ctx.createLinearGradient(0, 0, 0, 780);
    fg.addColorStop(0, `rgba(255,250,236,${flash})`); fg.addColorStop(0.85, `rgba(255,250,236,${flash * 0.92})`); fg.addColorStop(1, 'rgba(255,250,236,0)');
    ctx.fillStyle = fg; ctx.fillRect(0, 0, W, 780);
  }
}

function prisoner(t, x, chained) {
  person(x, FLOOR, { pose: 0 });
  chain([x + 2, FLOOR - 46], [x + 24, FLOOR - 4], chained);
  chain([x - 26, FLOOR - 3], [x - 4, FLOOR - 1], chained);
  stake(x + 24);
}
function stake(x) { ctx.fillStyle = '#0E0805'; ctx.fillRect(x - 2.5, FLOOR - 12, 5, 14); }

// ---------- labels and chips (screen space, anchored to world points) ----------
function label(cam, s, wx, wy, ax, ay, a, color = C.ochre) {
  if (a <= 0) return;
  const [x, y] = toScreen(cam, wx, wy), [px, py] = toScreen(cam, ax, ay);
  withAlpha(a, () => {
    font(650, 23);
    ctx.strokeStyle = 'rgba(226,172,92,0.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y + (py > y ? 8 : -22)); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, 3.5, 0, TAU); ctx.fill();
    text(s, x, y, { color, align: 'center', spacing: '3px' });
  });
}
function chip(cam, s, wx, wy, a, color, ax = null, ay = null) {
  if (a <= 0) return;
  const [x, y] = toScreen(cam, wx, wy);
  withAlpha(a, () => {
    font(700, 26);
    const w = ctx.measureText(s).width + 3 * s.length + 34;
    if (ax !== null) {
      const [px, py] = toScreen(cam, ax, ay);
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.setLineDash([5, 6]);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, 5, 0, TAU); ctx.fill();
    }
    const sc = 0.85 + 0.15 * back(clamp(a));
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    k.rrect(-w / 2, -24, w, 48, 24); ctx.fillStyle = 'rgba(26,15,7,0.9)'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    text(s, 0, 2, { color, align: 'center', base: 'middle', spacing: '3px' });
    ctx.restore();
  });
}

function overlays(t, cam) {
  // labels for the diagram (B)
  const on = (a) => span(t, a, 20.4, 0.5, 0.5);
  label(cam, 'THE WALL', 128, 330, 112, 420, on(9.2));
  label(cam, 'PRISONERS', 214, 642, 232, 676, on(9.6));
  label(cam, 'FIRE', 650, 540, 604, 598, on(10.6));
  label(cam, 'LOW WALL', 420, 756, 368, 704, on(12.2));
  label(cam, 'OBJECTS', 470, 474, 456, 566, on(13.0));
  label(cam, 'THE WAY OUT', 560, 326, 712, 420, on(14.2));
  // payoff chips (E)
  chip(cam, 'APPEARANCES', 250, 430, eout(seg(t, 45.3, 45.8)), C.fire, 150, 512);
  chip(cam, 'THE FORMS', 712, 238, eout(seg(t, 47.2, 47.7)), C.gold);
  chip(cam, 'THE GOOD', SUN.x - 170, SUN.y + 16, eout(seg(t, 50.6, 51.1)), C.gold, SUN.x - 36, SUN.y + 4);
}

// Captions with balanced lines: the narrowest width that keeps the same number of lines.
const CAP = { size: 46, lh: 55, weight: 600, maxW: 770 };
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
    k.captions(t, [cue], { x: W / 2, y: 830, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: F, ink: C.ink, marks: { '*': C.fire, '~': C.gold } });
  }
}

const mixColor = (a, b, u) => {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], u))).join(',')})`;
};
function header(t) {
  const bright = eio(seg(t, 29.5, 30.3));
  font(650, 22); text('PLATO · REPUBLIC, BOOK VII', 56, 78, { color: mixColor(C.ochre, C.umberInk, bright), spacing: '3px' });
  withAlpha(span(t, 9.0, 55.2, 0.6, 0) * lerp(0.75, 0.85, bright), () => {
    font(500, 22); text('Diagram, not to scale', 56, 110, { color: mixColor(C.ink, C.umberInk, bright) });
  });
  withAlpha(eout(seg(t, 51.0, 51.7)), () => {
    font(500, 22); text('Source: Wikipedia, “Allegory of the cave”', W / 2, 912, { color: C.soft, align: 'center' });
  });
}

Kit.scene({
  width: W, height: H, duration: 55,
  fonts: [{ family: F, file: 'CrimsonPro.woff2', weight: '200 900' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!rockPat) paintTextures();
    ctx.fillStyle = C.rockDark; ctx.fillRect(0, 0, W, H);
    if (t > T.B[0]) {
      const cam = camera(t);
      withAlpha(eio(seg(t, T.B[0], T.A[1])), () => { cutaway(t, cam); overlays(t, cam); });
    }
    if (t < T.A[1]) withAlpha(1 - eio(seg(t, T.B[0], T.A[1])), () => sceneA(t));
    ctx.drawImage(vignette, 0, 0);
    header(t);
    captions(t);
  },
});
