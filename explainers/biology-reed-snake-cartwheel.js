// Explainer for biology-reed-snake-cartwheel: on 19 October 2026 Current Biology published high-speed video
// analysis (Yosuke Kojima and colleagues, Toho University, Japan, with collaborators in Sarawak) showing how dwarf
// reed snakes of the genus Pseudorabdion roll like a wheel to escape, at 1.72 to 3.69 metres a second, about four
// times their fastest slither, while keeping the head steady. The scene explains the stroke and the axle-less
// head. Look: a leaf-litter palette of moss green and bark brown, a copper snake, cream text. Fredoka for the
// headings and numbers, Rubik for the captions.
//
// Facts:
// - Current Biology 36(20), R1061, 19 October 2026, "Locomotor kinematics and head stabilization in rolling snakes"
//   (Kojima, Fukuyama, Hossman, Kaliang, Nishikawa). Reported by Science News (19 October 2026) and ScienceDaily
//   (Toho University release, 24 October 2026): 11 Pseudorabdion saravacense, 1 P. collaris and 1 P. longiceps all
//   cartwheeled on a 2.2 m racetrack; the Calamaria reed snakes tested never did; bodies about 11 to 28 cm; peak
//   rolling speeds 1.72 to 3.69 m/s, about four times their maximum speed in lateral undulation; the snake curls
//   into a C with the head lifted and facing the direction of travel, whips the tail out behind, briefly
//   airborne, swings it forward and down past the head, lands it in front and starts the next roll on the other
//   side (a "stroke"); the head rotates much less than the rear and holds a nearly constant height, higher and
//   steadier at speed; rollers stayed within a track 20 cm wide; rolling is probably energetically expensive and
//   nobody knows how long they can sustain it; P. longiceps was first documented rolling in 2023 (Quah et al.,
//   Biotropica). Jessica Tingle (Brown University, not involved): 19th-century "hoop snake" tales she had dismissed
//   as fantastical, but the footage shows a real animal rolling in a similar way.
// Computed here: speeds in km/h (1.72 m/s = 6.2 km/h, 3.69 m/s = 13.3 km/h), the time to cross the 2.2 m track,
// and the slither speed as a quarter of the roll (the paper's "about four times"). The rolling snake is drawn as
// a schematic loop with a fixed head, not from the paper's tracked points.
//
// Scene plan (60 s). Captions are centred at y = 846; everything important stays above y = 770.
//  A  0.0– 9.0  A rolling snake; who and where.
//  B  9.2–18.2  Slithering versus rolling: the speeds.
//  C 18.4–32.0  The stroke, step by step.
//  D 32.2–45.8  The axle-less head; the 20 cm track.
//  E 46.0–55.0  The test and the cost.
//  F 55.2–60.0  Hoop snakes.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#1f2d12', bg2: '#0d1407', ink: '#f6f0dc', soft: 'rgba(246,240,220,0.72)', faint: 'rgba(246,240,220,0.24)', line: 'rgba(246,240,220,0.14)',
  snake: '#d88a3c', snakeDark: '#8a4f1e', head: '#f2c27a', moss: '#7fb069', leaf: '#4f7a3a', bark: '#3b2a14', cream: '#f6f0dc', red: '#ff7f6e', panel: 'rgba(0,0,0,0.32)',
};
const HEAD = 'Fredoka', TXT = 'Rubik';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the numbers ----------
const ROLL_MIN = 1.72, ROLL_MAX = 3.69, TRACK_M = 2.2, TRACK_W = 0.2, LEN_MIN = 11, LEN_MAX = 28;
const kmh = (ms) => (ms * 3.6).toFixed(1);
const SLITHER_MAX = ROLL_MAX / 4; // about 0.9 m/s, from "about four times"
const ROLLED = 13;

const CUES = [
  [0.4, 4.6, 'On 19 October 2026, biologists showed how a snake does what wheels do: it *rolls* away from danger.'],
  [4.8, 9.0, `Dwarf reed snakes of Southeast Asia, ${LEN_MIN} to ${LEN_MAX} cm long, hide under leaves on the forest floor.`],
  [9.2, 13.6, 'Snakes usually slither: waves run down the body and push sideways against bumps in the ground.'],
  [13.8, 18.2, `Rolling, these snakes hit ^${ROLL_MIN} to ${ROLL_MAX} metres a second^, about four times their fastest slither.`],
  [18.4, 22.8, 'The stroke: the snake curls into a C, head lifted and facing the way it wants to go.'],
  [23.0, 27.4, 'It whips its tail out behind, briefly ~airborne~, then swings it forward and down past its head.'],
  [27.6, 32.0, 'The tail lands in front and starts the next roll, on the other side. Left, right, left: a wheel of loops.'],
  [32.2, 36.6, 'A wheel needs an axle. The snake has none, yet its ^head barely turns^: the rear does the spinning.'],
  [36.8, 41.2, 'The head holds an almost constant height, and at speed the snake lifts it higher and steadier.'],
  [41.4, 45.8, `On a ${TRACK_M}-metre track the rollers stayed inside a strip ${TRACK_W * 100} cm wide: steering, not tumbling.`],
  [46.0, 50.4, `Every one of the ${ROLLED} dwarf reed snakes tested rolled; their cousins of another genus never did.`],
  [50.6, 55.0, 'Rolling is probably costly, and nobody knows how long a snake can keep it up.'],
  [55.2, 60.0, 'Old tales of ‘hoop snakes’ were dismissed as fantasy. The videos show a real animal doing something like it.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 29; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) { // leaves
    const x = rnd() * W, y = rnd() * H, r = 18 + rnd() * 26, a = rnd() * Math.PI;
    g.fillStyle = `rgba(${90 + rnd() * 60},${70 + rnd() * 50},${30 + rnd() * 20},${0.10 + rnd() * 0.08})`;
    g.beginPath(); g.ellipse(x, y, r, r * 0.45, a, 0, 7); g.fill();
  }
}

/** A snake drawn along a parametric path: pts are [x, y] from tail to head. */
function snakeBody(pts, w = 16, headR = 11) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = C.snakeDark; ctx.lineWidth = w + 4; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.strokeStyle = C.snake; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  const [hx, hy] = pts[pts.length - 1];
  ctx.fillStyle = C.head; ctx.beginPath(); ctx.arc(hx, hy, headR, 0, 7); ctx.fill();
  ctx.fillStyle = '#1a1208'; ctx.beginPath(); ctx.arc(hx + 4, hy - 3, 2.5, 0, 7); ctx.fill();
  ctx.lineCap = 'butt';
}
/** A slithering snake: a sine wave moving along x. */
function slither(x0, y0, len, phase, amp = 22) {
  const pts = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([x0 + u * len, y0 + amp * Math.sin(u * Math.PI * 3 - phase)]); }
  return pts;
}
/**
 * A rolling snake, schematic: a loop that rotates about a centre moving forward, with the head held at the front
 * at a steady height. `u` is the cycle phase 0..1.
 */
function roll(cx, groundY, r, u, dir = 1) {
  const pts = [];
  const a0 = u * Math.PI * 2;
  for (let i = 0; i <= 40; i++) {
    const a = a0 + (i / 40) * Math.PI * 1.7;
    pts.push([cx + dir * r * Math.cos(a) * (0.9 + 0.1 * Math.sin(a0)), groundY - r - r * Math.sin(a)]);
  }
  // the head sits ahead of the loop at a steady height
  pts.push([cx + dir * (r + 30), groundY - r * 0.9]);
  return pts;
}

// ---------- A: the roller ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { font(600, 24); text('DWARF REED SNAKES · SOUTHEAST ASIA', CX, 136, { align: 'center', color: C.soft, spacing: '3px' }); });
    ctx.fillStyle = C.bark; ctx.fillRect(0, 500, W, 8);
    const cx = lerp(140, 700, seg(t, 0.6, 7.0));
    snakeBody(roll(cx, 500, 58, (t * 1.6) % 1), 14, 10);
    A(seg(t, 5.0, 5.6), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 580, 684, 160, 14); ctx.fill();
      font(700, 32); text(`${LEN_MIN}–${LEN_MAX} cm long`, CX, 624, { align: 'center', color: C.head });
      font(500, 24, TXT); text('genus Pseudorabdion · forest floor, under the leaf litter', CX, 668, { align: 'center', color: C.soft });
      font(500, 22, TXT); text('Current Biology, 19 October 2026 · Toho University, Japan', CX, 708, { align: 'center', color: C.faint });
    });
  });
}

// ---------- B: slither vs roll ----------
function sceneSpeeds(t) {
  const a = span(t, 9.2, 18.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('TWO WAYS TO MOVE', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    // lane 1: slithering; lane 2: rolling, both started at 9.6 over the 2.2 m track scaled to 600 px
    const x0 = 120, x1 = 740, px = (m) => lerp(x0, x1, clamp(m / TRACK_M));
    [[260, 'slither'], [480, 'roll']].forEach(([y, lab]) => { ctx.fillStyle = C.bark; ctx.fillRect(x0 - 20, y + 40, x1 - x0 + 40, 6); font(600, 22); text(lab, x0 - 30, y, { align: 'right', color: C.soft }); });
    const el = Math.max(0, t - 9.8);
    const sDist = Math.min(TRACK_M, el * SLITHER_MAX), rDist = Math.min(TRACK_M, el * ROLL_MAX);
    snakeBody(slither(px(sDist) - 120, 260, 120, el * 8, 16), 12, 9);
    snakeBody(roll(px(rDist), 520, 40, (el * 3) % 1), 12, 9);
    font(500, 20, TXT); text('0', x0, 560, { align: 'center', color: C.faint }); text(`${TRACK_M} m`, x1, 560, { align: 'center', color: C.faint });
    A(seg(t, 14.0, 14.6), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 600, 684, 150, 14); ctx.fill();
      font(700, 30); text(`rolling: ${ROLL_MIN}–${ROLL_MAX} m/s`, CX, 640, { align: 'center', color: C.head });
      font(500, 24, TXT); text(`that is ${kmh(ROLL_MIN)} to ${kmh(ROLL_MAX)} km/h · about four times their fastest slither`, CX, 684, { align: 'center', color: C.soft });
      font(500, 22, TXT); text('shown here at the maximum, with the slither at a quarter of it', CX, 720, { align: 'center', color: C.faint });
    });
  });
}

// ---------- C: the stroke ----------
function sceneStroke(t) {
  const a = span(t, 18.4, 32.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('ONE STROKE · SCHEMATIC', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    ctx.fillStyle = C.bark; ctx.fillRect(0, 560, W, 8);
    const stage = t < 23.0 ? 0 : t < 27.6 ? 1 : 2;
    const gy = 560;
    if (stage === 0) {
      // a C shape, head lifted, facing right
      const pts = [];
      for (let i = 0; i <= 40; i++) { const an = Math.PI * 0.9 + (i / 40) * Math.PI * 1.1; pts.push([CX - 60 + 110 * Math.cos(an), gy - 110 - 110 * Math.sin(an)]); }
      pts.push([CX + 70, gy - 120]);
      snakeBody(pts, 18, 13);
      font(500, 22, TXT); text('head up, facing forward', CX + 80, gy - 160, { color: C.head });
      font(500, 22, TXT); text('tail on the ground', CX - 180, gy - 20, { align: 'center', color: C.soft });
    } else if (stage === 1) {
      // the tail whips out behind and swings over the head
      const u = eio(seg(t, 23.2, 27.2));
      const pts = [];
      for (let i = 0; i <= 40; i++) { const an = Math.PI * 0.9 + (i / 40) * Math.PI * (1.1 + 1.3 * u); pts.push([CX - 60 + 110 * Math.cos(an), gy - 110 - 110 * Math.sin(an) - 40 * Math.sin(u * Math.PI)]); }
      pts.push([CX + 70, gy - 120]);
      snakeBody(pts, 18, 13);
      font(500, 22, TXT); text(u < 0.5 ? 'the tail whips out behind, airborne' : 'and swings forward over the head', CX, gy - 300, { align: 'center', color: C.head });
      ctx.strokeStyle = C.faint; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(CX - 60, gy - 110, 150, Math.PI, Math.PI * 2.4); ctx.stroke(); ctx.setLineDash([]);
    } else {
      // landing in front; the next loop
      const u = eio(seg(t, 27.8, 31.4));
      snakeBody(roll(lerp(CX - 20, CX + 120, u), gy, 90, 0.75 + u * 0.5), 18, 13);
      font(500, 22, TXT); text('tail lands in front · next roll on the other side', CX, gy - 300, { align: 'center', color: C.head });
      ['left', 'right', 'left'].forEach((s, i) => A(seg(t, 28.4 + i * 0.6, 28.9 + i * 0.6), () => { font(700, 26); text(s, 220 + i * 210, 640, { align: 'center', color: i % 2 ? C.moss : C.head }); }));
    }
  });
}

// ---------- D: the head ----------
function sceneHead(t) {
  const a = span(t, 32.2, 46.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('A WHEEL WITHOUT AN AXLE', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    ctx.fillStyle = C.bark; ctx.fillRect(0, 520, W, 8);
    const el = t - 32.2;
    const cx = 200 + ((el * 110) % 520);
    const pts = roll(cx, 520, 70, (el * 1.5) % 1);
    snakeBody(pts, 16, 12);
    // head height line
    const [hx, hy] = pts[pts.length - 1];
    ctx.strokeStyle = C.moss; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(60, hy); ctx.lineTo(804, hy); ctx.stroke(); ctx.setLineDash([]);
    font(500, 22, TXT); text('head height: nearly constant', 804, hy - 22, { align: 'right', color: C.moss });
    // the rear rotates: an arrow arc around the loop
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, 450, 96, Math.PI * 1.1, Math.PI * 1.8); ctx.stroke();
    font(500, 22, TXT); text('rear: spinning', cx, 330, { align: 'center', color: C.red });
    A(seg(t, 36.9, 37.5), () => { ctx.fillStyle = C.panel; k.rrect(90, 580, 684, 60, 12); ctx.fill(); font(500, 24, TXT); text('faster rolls: head held higher and steadier', CX, 610, { align: 'center', color: C.ink }); });
    A(seg(t, 41.6, 42.2), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 660, 684, 96, 12); ctx.fill();
      ctx.fillStyle = 'rgba(127,176,105,0.35)'; ctx.fillRect(130, 690, 600, 24);
      font(600, 22); text(`${TRACK_M} m track · rollers kept to a strip ${TRACK_W * 100} cm wide`, CX, 738, { align: 'center', color: C.moss });
    });
  });
}

// ---------- E + F ----------
function sceneTest(t) {
  const a = eout(seg(t, 46.0, 46.8));
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('THE TEST', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    const rows = [['Pseudorabdion', `${ROLLED} of ${ROLLED} rolled`, C.head, 46.4], ['Calamaria (cousins)', 'none rolled', C.soft, 47.2]];
    rows.forEach(([n, r, col, at], i) => A(eout(seg(t, at, at + 0.7)), () => {
      const y = 220 + i * 100;
      ctx.fillStyle = C.panel; k.rrect(60, y - 36, 744, 72, 12); ctx.fill();
      font(600, 26); text(n, 86, y, { color: col }); font(700, 28); text(r, 778, y, { align: 'right', color: col });
    }));
    A(eout(seg(t, 50.8, 51.5)), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 430, 744, 130, 12); ctx.fill();
      font(600, 26); text('the cost', 86, 468, { color: C.red });
      font(500, 24, TXT); text('probably expensive · how long can they keep it up? unknown', 86, 516, { color: C.soft });
    });
    A(seg(t, 55.6, 56.2), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 600, 744, 150, 12); ctx.fill();
      font(600, 26); text('“hoop snakes”', 86, 640, { color: C.head });
      font(500, 24, TXT); text('19th-century tales of snakes rolling like hoops, long dismissed', 86, 686, { color: C.ink });
      font(500, 22, TXT); text('Jessica Tingle, Brown University: a real animal rolling in a similar way', 86, 724, { color: C.soft });
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
    sceneSpeeds(t);
    sceneStroke(t);
    sceneHead(t);
    sceneTest(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.head, '~': C.moss, '^': C.head } });
  },
});
