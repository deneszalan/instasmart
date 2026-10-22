// Explainer for psychology-mental-rotation: the further a shape is turned, the longer it takes to judge.
// Look: isometric block figures in coral and teal on warm off-white paper with a faint isometric dot grid.
// The figures are real 3D cube sets (ten cubes, three bends, so they have a handedness), rotated about
// the vertical axis and drawn with a painter's sort. Outfit for captions, Space Mono for labels.
//
// Scene plan (54.5 s). Captions centred at y = 846; everything important above y = 930.
//  A  0.0–9.5   Hook: a coral figure and a teal one turned 120°. "Are these the same shape, or mirror
//               images?" / "To check, you probably turn one of them in your head."
//  B  9.5–20.3  The teal one turns back 120° and lines up: same. A mirror image sweeps past and never does.
//  C 20.3–36.7  The study. Shepard and Metzler (1971) timed people on such pairs. Dots for larger angles
//               climb; a straight line through them. The time axis has no numbers: the source gives none,
//               so the dots show the pattern only.
//  D 36.7–42.5  Why: two copies turn at the same steady pace, one by 60°, one by 180°; its timer bar runs
//               three times as long.
//  E 42.5–54.5  Mental rotation in stages (picture, turn, compare, decide), and the 1978 Mental Rotations
//               Test card: one figure, four choices, two correct.
//
// Facts (Wikipedia, "Mental rotation"): Roger Shepard and Jacqueline Metzler (1971, Science) showed subjects
// pairs of three-dimensional, asymmetrical cube objects and measured how long they took to decide whether
// the two were the same object or mirror images (enantiomorphs); the reaction time was linearly proportional
// to the angle of rotation. Stages: create a mental image, rotate it, compare, decide, report. Vandenberg
// and Kuse (1978) built the Mental Rotations Test on their work: 20 items, four figures compared with a
// criterion figure, two of them correct.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TEXT = 'Outfit', MONO = 'SpaceMono';

const C = {
  paper: '#F6F1E8', ink: '#2B2A33', inkSoft: 'rgba(43,42,51,0.66)', grid: 'rgba(43,42,51,0.12)',
  coral: [240, 106, 87], teal: [20, 160, 152], coralText: '#C9402F', tealText: '#0E7C75',
};
const rgb = (c, f = 1) => `rgb(${Math.round(Math.min(255, c[0] * f))},${Math.round(Math.min(255, c[1] * f))},${Math.round(Math.min(255, c[2] * f))})`;

const CUES = [
  [0.5, 4.6, 'Are these the same shape, or mirror images?'],
  [4.8, 9.4, 'To check, you probably turn one of them in your head.'],
  [9.6, 14.8, 'Turn the teal one back *120°*, and it lines up: the ~same~ shape.'],
  [15.0, 20.2, 'A *mirror image* never lines up, however far you turn it.'],
  [20.4, 25.8, 'In 1971, Roger Shepard and Jacqueline Metzler timed people on pairs like these.'],
  [26.0, 31.0, 'The bigger the angle between the two, the longer people took.'],
  [31.2, 36.6, 'The time grew in a ~straight line~ with the angle.'],
  [36.8, 42.4, 'As if people turned the shape in their mind at a steady pace.'],
  [42.6, 48.0, 'Psychologists call it *mental rotation*: picture, turn, compare, decide.'],
  [48.2, 54.2, 'In 1978 their figures became a test of spatial ability: the *Mental Rotations Test*.'],
];

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });

// ---------- the figure: ten cubes in four arms ----------
const CUBES = [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [3, 0, 1], [3, 0, 2], [3, 1, 2], [3, 2, 2], [3, 3, 2], [2, 3, 2]];
const MIRROR = CUBES.map(([x, y, z]) => [-x, y, z]);
const centre = (cs) => cs.reduce((a, c) => [a[0] + c[0] / cs.length, a[1] + c[1] / cs.length, a[2] + c[2] / cs.length], [0, 0, 0]);
const FACES = [ // normal, then four corner offsets (unit cube from 0 to 1)
  [[1, 0, 0], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]], [[-1, 0, 0], [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]]],
  [[0, 1, 0], [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]]], [[0, -1, 0], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]],
  [[0, 0, 1], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]], [[0, 0, -1], [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]]],
];
const ELEV = (30 * Math.PI) / 180, AZ0 = 32;
const LIGHT = (() => { const v = [0.45, 0.85, 0.55]; const n = Math.hypot(...v); return v.map((x) => x / n); })();
function xf(p, az) { // rotate about the vertical axis, then tilt toward the viewer
  const a = (az * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const x = p[0] * ca + p[2] * sa, z = -p[0] * sa + p[2] * ca, y = p[1];
  const ce = Math.cos(ELEV), se = Math.sin(ELEV);
  return [x, y * ce - z * se, y * se + z * ce];
}
/** Draw the cube set `cs` turned by `deg` (about the vertical axis), centred at cx, cy, s px per cube. */
function figure(cs, deg, cx, cy, s, col, alpha = 1) {
  if (alpha <= 0) return;
  const c0 = centre(cs), az = AZ0 + deg, has = new Set(cs.map((c) => c.join(',')));
  const order = cs.map((c) => ({ c, z: xf([c[0] + 0.5 - c0[0] - 0.5, c[1] + 0.5 - c0[1] - 0.5, c[2] + 0.5 - c0[2] - 0.5], az)[2] })).sort((a, b) => a.z - b.z);
  k.alpha(alpha, () => {
    ctx.lineJoin = 'round';
    for (const { c } of order) {
      for (const [n, corners] of FACES) {
        if (has.has([c[0] + n[0], c[1] + n[1], c[2] + n[2]].join(','))) continue;
        const nn = xf(n, az);
        if (nn[2] <= 0.001) continue;
        const pts = corners.map((o) => xf([c[0] + o[0] - c0[0] - 0.5, c[1] + o[1] - c0[1] - 0.5, c[2] + o[2] - c0[2] - 0.5], az));
        const lit = 0.62 + 0.5 * Math.max(0, nn[0] * LIGHT[0] + nn[1] * LIGHT[1] + nn[2] * LIGHT[2]);
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x * s, cy - y * s) : ctx.moveTo(cx + x * s, cy - y * s)));
        ctx.closePath();
        ctx.fillStyle = rgb(col, lit); ctx.fill();
        ctx.strokeStyle = rgb(col, 0.55); ctx.lineWidth = Math.max(1.2, s * 0.05); ctx.stroke();
      }
    }
  });
}

// ---------- paper ----------
let PAPER = null;
function paintPaper() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  g.fillStyle = C.grid; // isometric dot grid
  const dx = 36, dy = 36 * Math.tan(Math.PI / 6) * 2;
  for (let row = 0, y = 10; y < H; row++, y += dy / 2) for (let x = (row % 2) * (dx / 2); x < W; x += dx) { g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
  const vg = g.createRadialGradient(W / 2, H * 0.42, 260, W / 2, H / 2, 800);
  vg.addColorStop(0, 'rgba(255,255,255,0)'); vg.addColorStop(1, 'rgba(150,120,90,0.16)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}

function badge(s, x, y, color, a) {
  if (a <= 0) return;
  k.alpha(a, () => {
    font(700, 30, MONO); const w = ctx.measureText(s).width + 44;
    ctx.fillStyle = color; k.rrect(x - w / 2, y - 30, w, 54, 27); ctx.fill();
    text(s, x, y + 7, { align: 'center', color: '#FFFFFF' });
  });
}

// ---------- A + B: the pair ----------
function scenePair(t) {
  const fl = Math.sin(t * 1.4) * 4;
  figure(CUBES, 0, 226, 470 + fl, 46, C.coral);
  // teal: the same shape at 120°, turned back to 0°; then swapped for its mirror image, which sweeps past
  const back1 = eio(seg(t, 10.2, 12.8));
  // the same one fades out, then the mirror image fades in (one after the other, never overlapping)
  const outSame = eio(seg(t, 14.7, 15.15)), inMirror = eio(seg(t, 15.2, 15.7));
  const sweep = eio(seg(t, 15.8, 19.4));
  const sameDeg = lerp(120, 0, back1), mirDeg = lerp(150, -150, sweep);
  figure(CUBES, sameDeg, 638, 470 - fl, 46, C.teal, 1 - outSame);
  figure(MIRROR, mirDeg, 638, 470 - fl, 46, C.teal, inMirror);
  // an arc showing the angle at the start
  const arcA = span(t, 1.2, 10.4, 0.5, 0.4);
  k.alpha(arcA, () => { font(700, 34, MONO); text('120°', 638, 236, { align: 'center', color: C.tealText }); });
  k.alpha(span(t, 0.8, 9.8, 0.5, 0.4), () => { font(700, 90); text('?', W / 2, 500, { align: 'center', color: C.inkSoft }); });
  badge('same', 638, 700, rgb(C.teal, 0.85), span(t, 13.0, 15.0, 0.35, 0.3));
  badge('mirror image', 638, 700, rgb(C.coral, 0.9), span(t, 18.6, 20.4, 0.35, 0.3));
}

// ---------- C: the study and the graph ----------
const G = { x0: 150, x1: 740, y0: 630, y1: 340 };
const ANG = [0, 30, 60, 90, 120, 150, 180];
const dotAt = (i) => 25.9 + i * 0.7;
const TY = (ang) => lerp(G.y0 - 60, G.y1 + 20, ang / 180); // schematic: a straight rise, no numbers
function sceneStudy(t) {
  // the pair, small, at the top: the teal one shows the angle of the newest dot
  let ang = 0;
  ANG.forEach((a, i) => { if (t >= dotAt(i)) ang = a; });
  const tween = t < dotAt(0) ? 0 : ang;
  const intro = eout(seg(t, 20.6, 21.6));
  k.alpha(intro, () => {
    figure(CUBES, 0, 330, 206, 22, C.coral);
    figure(CUBES, tween, 534, 206, 22, C.teal);
    font(700, 28, MONO); text(`${tween}°`, 646, 216, { color: C.tealText });
  });
  const ax = eout(seg(t, 21.2, 22.2));
  k.alpha(ax, () => {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(G.x0, G.y1 - 10); ctx.lineTo(G.x0, G.y0); ctx.lineTo(G.x1 + 10, G.y0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(G.x0 - 9, G.y1 + 4); ctx.lineTo(G.x0, G.y1 - 12); ctx.lineTo(G.x0 + 9, G.y1 + 4); ctx.stroke();
    font(600, 26, MONO);
    for (const a of [0, 60, 120, 180]) { const x = lerp(G.x0, G.x1, a / 180); text(`${a}°`, x, G.y0 + 40, { align: 'center', color: C.inkSoft }); ctx.beginPath(); ctx.moveTo(x, G.y0); ctx.lineTo(x, G.y0 + 10); ctx.stroke(); }
    text('angle between the two', (G.x0 + G.x1) / 2, G.y0 + 80, { align: 'center', color: C.ink });
    ctx.save(); ctx.translate(G.x0 - 30, (G.y0 + G.y1) / 2); ctx.rotate(-Math.PI / 2);
    text('time to answer', 0, 0, { align: 'center', color: C.ink }); ctx.restore();
  });
  ANG.forEach((a, i) => {
    const p = back(clamp(seg(t, dotAt(i), dotAt(i) + 0.45)));
    if (p <= 0) return;
    const x = lerp(G.x0, G.x1, a / 180), y = TY(a);
    ctx.fillStyle = rgb(C.teal, 0.9); ctx.beginPath(); ctx.arc(x, y, 11 * p, 0, 7); ctx.fill();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.stroke();
  });
  const ln = eio(seg(t, 31.4, 33.0));
  if (ln > 0) {
    ctx.strokeStyle = rgb(C.coral, 0.95); ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(G.x0, TY(0)); ctx.lineTo(lerp(G.x0, G.x1, ln), TY(180 * ln)); ctx.stroke();
  }
  k.alpha(eout(seg(t, 33.2, 34.0)), () => { font(400, 24, MONO); text('the pattern only; the source gives no times', G.x1, G.y1 - 16, { align: 'right', color: C.inkSoft }); });
}

// ---------- D: same steady pace, three times the turn ----------
function scenePace(t) {
  const t0 = 37.4, dur = 4.2; // 180° in dur seconds: the same pace for both
  const deg = (max) => Math.min(max, 180 * clamp((t - t0) / dur));
  const rows = [[60, 330], [180, 560]];
  for (const [max, y] of rows) {
    const d = deg(max);
    figure(CUBES, 0, 152, y, 24, C.coral);
    figure(CUBES, max - d, 312, y, 24, C.teal);
    const x0 = 420, x1 = 760, bw = (x1 - x0) * (d / 180);
    ctx.fillStyle = 'rgba(43,42,51,0.08)'; k.rrect(x0, y - 16, x1 - x0, 32, 16); ctx.fill();
    ctx.fillStyle = rgb(C.coral, 0.95); k.rrect(x0, y - 16, Math.max(32, bw + 16), 32, 16); ctx.fill();
    font(700, 30, MONO); text(`${Math.round(d)}°`, 312, y + 118, { align: 'center', color: C.tealText });
    font(600, 26, MONO); text('time', x0, y - 32, { color: C.inkSoft });
  }
}

// ---------- E: stages, then the test card ----------
function sceneStages(t) {
  const chips = ['picture', 'turn', 'compare', 'decide'];
  const a = span(t, 42.5, 48.4, 0.4, 0.4);
  if (a <= 0) return;
  k.alpha(a, () => {
    figure(CUBES, 90 * Math.sin((t - 42.5) * 0.9), W / 2, 330, 34, C.teal);
    chips.forEach((s, i) => {
      const x = 132 + i * 200, y = 600;
      const on = seg(t, 43.4 + i * 0.9, 43.8 + i * 0.9);
      font(700, 28, MONO); const w = ctx.measureText(s).width + 36;
      ctx.fillStyle = on > 0 ? rgb(C.coral, lerp(1.35, 0.95, on)) : 'rgba(43,42,51,0.08)';
      k.rrect(x - w / 2, y - 30, w, 56, 28); ctx.fill();
      text(s, x, y + 7, { align: 'center', color: on > 0.5 ? '#FFFFFF' : C.ink });
      if (i < 3) { ctx.fillStyle = C.inkSoft; ctx.beginPath(); ctx.moveTo(x + 92, y - 8); ctx.lineTo(x + 104, y); ctx.lineTo(x + 92, y + 8); ctx.closePath(); ctx.fill(); }
    });
  });
}
function sceneTest(t) {
  const a = eout(seg(t, 48.4, 49.4));
  if (a <= 0) return;
  k.alpha(a, () => {
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = 'rgba(43,42,51,0.25)'; ctx.lineWidth = 2;
    k.rrect(70, 200, 724, 520, 22); ctx.fill(); ctx.stroke();
    font(700, 28, MONO); text('MENTAL ROTATIONS TEST · 1978', W / 2, 252, { align: 'center', color: C.ink });
    figure(CUBES, 20, 196, 470, 26, C.coral);
    text('target', 196, 640, { align: 'center', color: C.inkSoft });
    ctx.strokeStyle = 'rgba(43,42,51,0.2)'; ctx.beginPath(); ctx.moveTo(320, 300); ctx.lineTo(320, 680); ctx.stroke();
    const opts = [[CUBES, 140], [MIRROR, 60], [MIRROR, 200], [CUBES, 270]];
    opts.forEach(([cs, deg], i) => {
      const x = 440 + (i % 2) * 220, y = 380 + Math.floor(i / 2) * 200;
      figure(cs, deg + 20 * Math.sin(t * 0.6 + i), x, y, 20, C.teal);
      font(700, 26, MONO); text('ABCD'[i], x - 90, y - 60, { color: C.inkSoft });
    });
    font(500, 26, MONO); text('20 items · 4 choices · 2 are the target', W / 2, 700, { align: 'center', color: C.inkSoft });
  });
}

// ---------- captions with balanced lines ----------
const CAP = { size: 44, lh: 56, weight: 600, maxW: 740 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((x) => ctx.measureText(x.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const x of words) { if (lw + x > maxW && any) { n++; lw = 0; } lw += x + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 846, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.coralText, '~': C.tealText } });
  }
}

const T = { pair: [0, 20.4], study: [20.3, 36.8], pace: [36.7, 42.6], stages: [42.5, 48.4], test: [48.3, 54.5] };
Kit.scene({
  width: W, height: H, duration: 54.5,
  fonts: [
    { family: TEXT, file: 'Outfit.woff2', weight: '100 900' },
    { family: MONO, file: 'SpaceMono-Regular.woff2', weight: '400' },
    { family: MONO, file: 'SpaceMono-Bold.woff2', weight: '700' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!PAPER) PAPER = paintPaper();
    ctx.drawImage(PAPER, 0, 0);
    font(600, 22); text('RECKON · PSYCHOLOGY', 60, 80, { color: C.inkSoft, spacing: '3px' });
    for (const [fn, [a, b], fi = 0.4, fo = 0.4] of [[scenePair, T.pair, 0.6], [sceneStudy, T.study], [scenePace, T.pace], [sceneStages, T.stages, 0.01, 0.01], [sceneTest, T.test, 0.01, 0.01]]) {
      if (t < a || t > b) continue;
      k.alpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
