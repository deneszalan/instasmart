// Explainer for math-school-of-athens-vanishing-point (Roma): in Raphael's School of Athens (1509–1511) the receding
// lines of the painted hall meet at one vanishing point between Plato and Aristotle, which fixes the painter's eye
// height; the diagonals of the square floor tiles meet at two distance points, whose spacing gives the viewing
// distance: about 9 m, in a room about 8 m long. Look: an architect's construction drawing on dark slate, the
// fresco as a schematic in warm stone, sky blue and robe colours, construction lines in vermilion and gold.
// Crimson Pro for captions, IBM Plex Sans for labels.
//
// Facts:
// - Wikipedia, "The School of Athens": fresco by Raphael, painted 1509–1511 for Pope Julius II in the Stanza della
//   Segnatura of the Apostolic Palace; 500 × 770 cm; Plato and Aristotle stand at the centre, at the architecture's
//   central vanishing point; Plato points up, Aristotle holds his hand out flat; the architecture was inspired by
//   Bramante; statues of Apollo and Athena (Minerva) in niches.
// - C. Tyler and M. Kubovy, "The Rise of Renaissance Perspective", webexhibits.org/sciartperspective, pages 3–5:
//   the central vanishing point is accurate but about half a metre below Aristotle's outstretched hand (Bärtschi
//   1976); it is no less than 4 m above the ground, and the painting's bottom edge is 2 m above the ground; assuming
//   square floor tiles, the centre of projection is about 9 m from the painting, while the room is only 8 m long, so
//   it lies behind the far wall (the natural place would be the middle of the room, 4 m away); with rectangular
//   tiles of 2:1 it would not; because the frame starts above the spectators' eye height, a literal construction
//   would show none of the floor; Raphael may have chosen the construction so the floor shows into the distance.
// The scene draws a schematic hall built in true one-point perspective with those numbers: picture 7.7 m wide, its
// bottom 2 m above the room's floor, the eye 4.2 m up ("at least 4 m") and 9 m back; the hall's own dimensions are
// illustrative. Computed here: every projected point, the vanishing point, and the distance points at ±9 m.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The fresco, drawn as a schematic: the hall, the steps, the philosophers.
//  B  9.2–27.6  Receding edges extended: the vanishing point between Plato and Aristotle, below Aristotle's hand.
//  C 27.6–36.8  The horizon at the eye height: side view of the room, horizon at least 4 m up.
//  D 36.8–50.4  Zoom out: tile diagonals run to two distance points, 9 m either side.
//  E 50.4–59.6  Plan of the room: 8 m long, the eye 9 m back; why the floor would vanish from a real eye.
//  F 59.8–64.6  The lines lead to Plato and Aristotle.
const W = 864, H = 1080, CX = W / 2;
const HAND_ABOVE = 0.5; // Aristotle's hand, above the vanishing point on the picture (Bärtschi, via Tyler and Kubovy)
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  slate: '#17222a', slate2: '#223039', ink: '#f2ebdd', soft: 'rgba(242,235,221,0.72)', faint: 'rgba(242,235,221,0.22)',
  stone: '#d9c7a3', stone2: '#c2ab83', stone3: '#a88f68', shade: '#8f7656', sky: '#9fc4dd', floor: '#c9b089', tile: '#a7865f',
  red: '#e0573d', gold: '#f0b54a', blue: '#3e6fa3', robeR: '#b8432f', robeB: '#3f6ea8', robeG: '#5f8a4f', robeY: '#d6a23e', skin: '#e2b48d',
};
const SERIF = 'Crimson Pro', SANS = 'IBM Plex Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the geometry, in metres ----------
const FRESCO_W = 7.7, BOTTOM = 2, TOP = 7; // the picture on the wall, its edges above the room's floor
const EYE = 4.2, DIST = 9, ROOM = 8; // the painter's eye: height and distance; the room's length
// Plato and Aristotle, 1.8 m tall, stand on the platform; Aristotle's hand (at 0.75 of his height) is HAND_ABOVE over
// the vanishing point on the picture, which sets the platform's height
const PA_Z = 4.2, PA_H = 1.8, HAND_AT = 0.75, PA_S = DIST / (DIST + PA_Z);
const PLATFORM = EYE - (HAND_AT * PA_H - HAND_ABOVE / PA_S);
const STEP_N = 5, STEP_RISE = (PLATFORM - BOTTOM) / STEP_N, STEP_RUN = 0.36, STEPS_AT = 1.2;
const HALL = 2.6, SPRING = 4.75; // half-width of the hall, height where the arches spring
const BAYS = [1.2, 5, 9, 13], SKY_AT = 17;
const TILE = 0.6, TILE_ROWS = [0, 0.6, 1.2]; // square tiles on the lower floor
// the picture's coordinates of a point in the painted world: X across, Y up from the room floor, Z behind the wall
const proj = (X, Y, Z) => { const s = DIST / (DIST + Z); return [X * s, EYE + (Y - EYE) * s, s]; };
if (Math.abs(proj(0, 100, 1e9)[1] - EYE) > 1e-6 || DIST <= ROOM) throw new Error('geometry');

// the camera: picture metres to canvas pixels, around the vanishing point's place on the canvas
let cam = { px: 92, vx: CX, vy: 498 };
const toC = (x, y) => [cam.vx + x * cam.px, cam.vy - (y - EYE) * cam.px];
const P = (X, Y, Z) => { const [x, y] = proj(X, Y, Z); return toC(x, y); };

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'In 1509–1511 Raphael painted The School of Athens on a wall in the Vatican Palace.'],
  [4.8, 9.0, `The fresco is about *${FRESCO_W} m* wide, yet its painted hall seems to run deep into the wall.`],
  [9.2, 13.6, 'Edges that run straight back, like cornices and floor lines, are painted as converging lines.'],
  [13.8, 18.2, 'Extend them and they all meet at a single point, the ~vanishing point~.'],
  [18.4, 22.8, 'Here it lies between Plato and Aristotle, the two philosophers at the centre.'],
  [23.0, 27.4, 'One measurement puts it about half a metre below Aristotle’s outstretched hand.'],
  [27.6, 32.0, 'The vanishing point marks the painter’s eye height. A line through it is the *horizon*.'],
  [32.2, 36.6, `Raphael’s horizon is at least ${Math.floor(EYE)} m above the room’s floor; the fresco itself starts ${BOTTOM} m up.`],
  [36.8, 41.2, 'If the floor’s tiles are square, their diagonals meet at two more points: the *distance points*.'],
  [41.4, 45.8, 'How far these lie from the vanishing point is how far back the painter’s eye stood.'],
  [46.0, 50.4, `For The School of Athens, Christopher Tyler and Michael Kubovy reconstruct about ^${DIST} m^.`],
  [50.6, 55.0, `But the room is only about ${ROOM} m long: the ideal viewing spot is behind the opposite wall.`],
  [55.2, 59.6, 'Raphael may have meant it: at a visitor’s real eye height, none of the painted floor would show.'],
  [59.8, 64.2, 'Instead the floor and the vaults draw the eye in, to Plato and Aristotle at the centre.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.slate2); lg.addColorStop(1, C.slate);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(220,230,240,${r() * 0.035})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1); }
  g.strokeStyle = 'rgba(242,235,221,0.04)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 36) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

// ---------- drawing the fresco ----------
function pill(str, x, y, col, align = 'left', size = 24) {
  font(700, size); const w = ctx.measureText(str).width, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.fillStyle = 'rgba(23,34,42,0.86)'; k.rrect(x0 - 10, y - size * 0.75, w + 20, size * 1.5, 8); ctx.fill();
  text(str, x0, y, { base: 'middle', color: col });
}
function poly(pts, fill, stroke, lw = 1.5) {
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function frameClip() {
  // the lunette: a rectangle with a round arch, on the wall
  const r = FRESCO_W / 2, spring = TOP - r;
  const [x0, y0] = toC(-r, BOTTOM), [x1] = toC(r, BOTTOM), [, ys] = toC(0, spring), [cx, cy] = toC(0, spring);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, ys); ctx.arc(cx, cy, r * cam.px, Math.PI, 0); ctx.lineTo(x1, y0); ctx.closePath();
}
function arch(Z, r = HALL, fill = null, stroke = C.shade, lw = 2) {
  const [cx, cy, s] = (() => { const [x, y, s] = proj(0, SPRING, Z); const [a, b] = toC(x, y); return [a, b, s]; })();
  ctx.beginPath(); ctx.arc(cx, cy, r * s * cam.px, Math.PI, 0);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
}
function figure(X, Z, h, robe, { arm = null, head = C.skin, base = PLATFORM } = {}) {
  const [fx, fy, s] = (() => { const [x, y, s] = proj(X, base, Z); const [a, b] = toC(x, y); return [a, b, s]; })();
  const hh = h * s * cam.px, wd = hh * 0.2;
  ctx.fillStyle = robe; ctx.beginPath(); ctx.moveTo(fx - wd * 0.7, fy); ctx.lineTo(fx - wd * 0.5, fy - hh * 0.84); ctx.lineTo(fx + wd * 0.5, fy - hh * 0.84); ctx.lineTo(fx + wd * 0.7, fy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = head; ctx.beginPath(); ctx.arc(fx, fy - hh * 0.92, hh * 0.075, 0, TAU); ctx.fill();
  if (arm) { ctx.strokeStyle = arm.colour || robe; ctx.lineWidth = Math.max(2, wd * 0.3); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(fx, fy - hh * 0.78); ctx.lineTo(fx + arm.dx * hh, fy - hh * arm.at); ctx.stroke(); }
  return { x: fx, y: fy, h: hh };
}
// where Aristotle's hand is on the picture
const ARI_X = 0.3, ARM_DX = 0.32;
const handPicture = () => [proj(ARI_X, 0, PA_Z)[0] + ARM_DX * PA_H * PA_S, proj(0, PLATFORM + HAND_AT * PA_H, PA_Z)[1]];
if (Math.abs(handPicture()[1] - EYE - HAND_ABOVE) > 1e-9) throw new Error('hand');
function fresco(a, { lines = 0, vp = 0 } = {}) {
  A(a, () => {
    ctx.save(); frameClip(); ctx.clip();
    // the far opening: sky
    const [sx0, sy0] = toC(-FRESCO_W / 2, TOP + 1), [sx1, sy1] = toC(FRESCO_W / 2, BOTTOM);
    ctx.fillStyle = C.stone2; ctx.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
    arch(SKY_AT, HALL, C.sky, C.stone3, 1.5);
    const [ox0, oy0] = P(-HALL, PLATFORM, SKY_AT), [ox1] = P(HALL, PLATFORM, SKY_AT), [, oys] = P(0, SPRING, SKY_AT);
    ctx.fillStyle = C.sky; ctx.fillRect(ox0, oys, ox1 - ox0, oy0 - oys);
    // side walls of the hall, bay by bay, and the vaults
    for (let i = BAYS.length - 1; i >= 0; i--) {
      const z0 = BAYS[i], z1 = i + 1 < BAYS.length ? BAYS[i + 1] : SKY_AT;
      for (const sd of [-1, 1]) {
        poly([P(sd * HALL, PLATFORM, z0), P(sd * HALL, PLATFORM, z1), P(sd * HALL, SPRING, z1), P(sd * HALL, SPRING, z0)], i % 2 ? C.stone2 : C.stone3, C.shade, 1.2);
        poly([P(sd * HALL, SPRING, z0), P(sd * HALL, SPRING, z1), P(sd * (HALL + 1.2), SPRING + 0.3, z1), P(sd * (HALL + 1.2), SPRING + 0.3, z0)], C.stone, null);
      }
      // the barrel vault between the arches: concentric arcs (coffers)
      for (let f = 0; f < 1; f += 0.25) arch(lerp(z0, z1, f), HALL, null, 'rgba(143,118,86,0.6)', 1.2);
    }
    // the platform floor, the steps and the lower floor
    poly([P(-HALL, PLATFORM, STEPS_AT + STEP_N * STEP_RUN), P(HALL, PLATFORM, STEPS_AT + STEP_N * STEP_RUN), P(HALL, PLATFORM, SKY_AT), P(-HALL, PLATFORM, SKY_AT)], C.floor, null);
    poly([P(-FRESCO_W, PLATFORM, STEPS_AT + STEP_N * STEP_RUN), P(-HALL, PLATFORM, STEPS_AT + STEP_N * STEP_RUN), P(-HALL, PLATFORM, SKY_AT), P(-FRESCO_W, PLATFORM, SKY_AT)], C.floor, null);
    poly([P(HALL, PLATFORM, STEPS_AT + STEP_N * STEP_RUN), P(FRESCO_W, PLATFORM, STEPS_AT + STEP_N * STEP_RUN), P(FRESCO_W, PLATFORM, SKY_AT), P(HALL, PLATFORM, SKY_AT)], C.floor, null);
    for (let n = STEP_N - 1; n >= 0; n--) {
      const z = STEPS_AT + n * STEP_RUN, y = BOTTOM + n * STEP_RISE;
      poly([P(-FRESCO_W, y, z), P(FRESCO_W, y, z), P(FRESCO_W, y + STEP_RISE, z), P(-FRESCO_W, y + STEP_RISE, z)], n % 2 ? C.stone : C.stone2, C.shade, 1);
      poly([P(-FRESCO_W, y + STEP_RISE, z), P(FRESCO_W, y + STEP_RISE, z), P(FRESCO_W, y + STEP_RISE, z + STEP_RUN), P(-FRESCO_W, y + STEP_RISE, z + STEP_RUN)], C.floor, null);
    }
    // the lower floor's square tiles
    for (let r = 0; r < TILE_ROWS.length - 1; r++) for (let c = -7; c < 7; c++) {
      if ((r + c) % 2) continue;
      poly([P(c * TILE, BOTTOM, TILE_ROWS[r]), P((c + 1) * TILE, BOTTOM, TILE_ROWS[r]), P((c + 1) * TILE, BOTTOM, TILE_ROWS[r + 1]), P(c * TILE, BOTTOM, TILE_ROWS[r + 1])], C.tile, null);
    }
    // the front arch and its piers, with niches for Apollo and Athena
    for (const sd of [-1, 1]) {
      poly([P(sd * HALL, BOTTOM, BAYS[0]), P(sd * (FRESCO_W / 2 + 0.2), BOTTOM, BAYS[0]), P(sd * (FRESCO_W / 2 + 0.2), TOP + 1, BAYS[0]), P(sd * HALL, TOP + 1, BAYS[0])], C.stone, C.shade, 1.5);
      const [nx, ny] = P(sd * 3.2, PLATFORM + 0.3, BAYS[0]), s = proj(0, 0, BAYS[0])[2] * cam.px;
      ctx.fillStyle = C.stone3; k.rrect(nx - 0.32 * s, ny - 2.2 * s, 0.64 * s, 2.2 * s, 0.32 * s); ctx.fill();
      ctx.fillStyle = '#ece0c6'; ctx.beginPath(); ctx.ellipse(nx, ny - 0.95 * s, 0.16 * s, 0.8 * s, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(nx, ny - 1.86 * s, 0.11 * s, 0, TAU); ctx.fill();
    }
    ctx.beginPath(); { const [cx, cy, s] = (() => { const [x, y, s] = proj(0, SPRING, BAYS[0]); const [a, b] = toC(x, y); return [a, b, s]; })();
      ctx.arc(cx, cy, (HALL + 0.5) * s * cam.px, Math.PI, 0); ctx.arc(cx, cy, HALL * s * cam.px, 0, Math.PI, true); ctx.closePath(); ctx.fillStyle = C.stone; ctx.fill(); ctx.strokeStyle = C.shade; ctx.lineWidth = 1.5; ctx.stroke(); }
    // the philosophers: groups on the steps and the platform, Plato and Aristotle at the centre
    const R1 = BOTTOM + 2 * STEP_RISE, R2 = BOTTOM + 4 * STEP_RISE;
    const crowd = [[-2.3, 3.6, C.robeG, PLATFORM], [-1.6, 4.8, C.robeY, PLATFORM], [-1.0, 5.6, C.robeG, PLATFORM], [1.0, 5.4, C.robeY, PLATFORM], [1.6, 4.6, C.robeR, PLATFORM], [2.3, 3.8, C.robeB, PLATFORM],
      [-3.1, 0.5, C.robeB, BOTTOM], [-2.6, 0.9, C.robeR, BOTTOM], [2.6, 0.7, C.robeG, BOTTOM], [3.1, 0.4, C.robeY, BOTTOM], [-1.7, STEPS_AT + 2.5 * STEP_RUN, C.robeR, R1], [1.8, STEPS_AT + 4.5 * STEP_RUN, C.robeB, R2]];
    for (const [X, Z, col, base] of crowd.sort((p, q) => q[1] - p[1])) figure(X, Z, 1.75, col, { base });
    figure(-0.3, PA_Z, PA_H, C.robeR, { arm: { dx: 0.04, dy: 0, at: 1.08, colour: C.skin } });
    figure(ARI_X, PA_Z, PA_H, C.robeB, { arm: { dx: ARM_DX, at: HAND_AT, colour: C.skin } });
    ctx.restore();
    frameClip(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    // construction lines: receding edges extended towards the vanishing point
    if (lines > 0) A(lines, () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.setLineDash([]);
      for (const [X, Y, z0] of ORTHO) {
        const [x0, y0] = P(X, Y, z0), [x1, y1] = P(X, Y, z0 + 8);
        const [vx, vy] = toC(0, EYE), f = eio(clamp(lines * 1.4 - Math.abs(X) * 0.04));
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x1, vx, f), lerp(y1, vy, f)); ctx.stroke();
      }
    });
    if (vp > 0) A(vp, () => {
      const [vx, vy] = toC(0, EYE);
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(vx, vy, 8, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.slate; ctx.lineWidth = 2; ctx.stroke();
    });
  });
}
// receding edges used as construction lines: [X, Y, Z where the edge starts]
const ORTHO = [
  [-HALL, SPRING, BAYS[0]], [HALL, SPRING, BAYS[0]], [-HALL, PLATFORM, STEPS_AT + STEP_N * STEP_RUN], [HALL, PLATFORM, STEPS_AT + STEP_N * STEP_RUN],
  [0, SPRING + HALL, BAYS[0]], [-3 * TILE, BOTTOM, 0], [3 * TILE, BOTTOM, 0], [-5 * TILE, BOTTOM, 0], [5 * TILE, BOTTOM, 0], [-TILE, BOTTOM, 0], [TILE, BOTTOM, 0], [-HALL, PLATFORM + 0.01, STEPS_AT + STEP_N * STEP_RUN],
];

// ---------- A and B: the fresco and its vanishing point ----------
function sceneFresco(t) {
  const a = span(t, 0, 27.8, 0.5, 0.4);
  if (a <= 0) return;
  cam = { px: 92, vx: CX, vy: 498 };
  const lines = seg(t, 10.0, 16.4);
  fresco(a, { lines, vp: seg(t, 15.4, 16.2) });
  A(a * seg(t, 0.8, 1.8), () => {
    font(600, 22); text('THE SCHOOL OF ATHENS · RAPHAEL · 1509–1511', CX, 176, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
  });
  A(a * seg(t, 5.0, 5.8) * (1 - seg(t, 9.2, 9.8)), () => {
    const [x0] = toC(-FRESCO_W / 2, 0), [x1] = toC(FRESCO_W / 2, 0), y = toC(0, BOTTOM)[1] + 34;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    for (const x of [x0, x1]) { ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10); ctx.stroke(); }
    font(700, 28); text(`${FRESCO_W} m`, CX, y + 30, { align: 'center', base: 'middle', color: C.gold });
  });
  // labels for Plato, Aristotle, the hand and the vanishing point
  const [vx, vy] = toC(0, EYE);
  A(a * seg(t, 16.0, 16.8), () => { ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(vx + 6, vy + 8); ctx.lineTo(vx + 90, vy + 150); ctx.stroke(); pill('vanishing point', vx + 60, vy + 168, C.gold); });
  A(a * seg(t, 18.8, 19.6), () => {
    const [px, py] = P(-0.3, PLATFORM + PA_H, PA_Z), [qx, qy] = P(ARI_X, PLATFORM + PA_H, PA_Z);
    font(700, 24); text('Plato', px - 40, py - 40, { align: 'right', base: 'middle', color: C.ink }); text('Aristotle', qx + 40, qy - 40, { base: 'middle', color: C.ink });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(px - 36, py - 34); ctx.lineTo(px - 6, py - 6); ctx.moveTo(qx + 36, qy - 34); ctx.lineTo(qx + 6, qy - 6); ctx.stroke();
  });
  A(a * seg(t, 23.4, 24.2), () => {
    const [hx, hy] = toC(...handPicture());
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(hx + 26, hy); ctx.lineTo(hx + 26, vy); ctx.stroke(); ctx.setLineDash([]);
    for (const y of [hy, vy]) { ctx.beginPath(); ctx.moveTo(hx + 18, y); ctx.lineTo(hx + 34, y); ctx.stroke(); }
    pill('≈ 0.5 m', hx + 44, (hy + vy) / 2 + 6, C.gold);
    pill('Aristotle’s hand', hx + 44, hy - 40, C.ink, 'left', 22);
  });
}

// ---------- C: the horizon is the eye height ----------
function sceneHorizon(t) {
  const a = span(t, 27.6, 37.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // first: the fresco with its horizon line
    const f1 = 1 - seg(t, 31.6, 32.4);
    if (f1 > 0) {
      cam = { px: 92, vx: CX, vy: 498 };
      fresco(f1, { lines: 1, vp: 1 });
      A(f1 * seg(t, 28.2, 29.2), () => {
        const [, vy] = toC(0, EYE);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(40, vy); ctx.lineTo(W - 40, vy); ctx.stroke();
        font(700, 24); text('HORIZON = THE PAINTER’S EYE HEIGHT', CX, 200, { align: 'center', base: 'middle', color: C.gold, spacing: '1px' });
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(110, 216); ctx.lineTo(70, vy - 6); ctx.stroke();
      });
    }
    // then: a side view of the room
    A(seg(t, 32.2, 33.0), () => {
      const s = 62, floor = 720, wall = 690, X = (m) => wall - m * s, Y = (m) => floor - m * s;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(X(ROOM - 0.2), floor); ctx.lineTo(wall, floor); ctx.lineTo(wall, Y(7.6)); ctx.stroke();
      ctx.fillStyle = C.stone; ctx.fillRect(wall, Y(TOP), 22, (TOP - BOTTOM) * s);
      font(600, 22); text('fresco', wall + 32, Y(6), { base: 'middle', color: C.stone });
      ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
      ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.moveTo(X(ROOM - 0.2), Y(EYE)); ctx.lineTo(wall + 22, Y(EYE)); ctx.stroke();
      ctx.strokeStyle = C.soft; ctx.beginPath(); ctx.moveTo(X(2.6), Y(BOTTOM)); ctx.lineTo(wall, Y(BOTTOM)); ctx.stroke();
      ctx.setLineDash([]);
      font(700, 24); text(`horizon: ${Math.floor(EYE)} m or more`, X(ROOM - 0.3), Y(EYE) - 22, { base: 'middle', color: C.gold });
      font(600, 22); text(`fresco starts ${BOTTOM} m up`, wall - 12, Y(BOTTOM) - 20, { align: 'right', base: 'middle', color: C.soft });
      const vxm = X(4), vh = 1.7 * s;
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.moveTo(vxm - 14, floor); ctx.lineTo(vxm - 10, floor - vh * 0.84); ctx.lineTo(vxm + 10, floor - vh * 0.84); ctx.lineTo(vxm + 14, floor); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(vxm, floor - vh * 0.92, 9, 0, TAU); ctx.fill();
      font(600, 22); text('a visitor, mid-room', vxm, floor + 26, { align: 'center', base: 'middle', color: C.soft });
      A(seg(t, 33.6, 34.4), () => {
        ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(vxm + 4, floor - vh * 0.92); ctx.lineTo(wall, Y(EYE)); ctx.stroke();
        font(600, 22); text('looks up at it', vxm - 20, floor - vh - 24, { align: 'right', base: 'middle', color: C.red });
      });
    });
  });
}

// ---------- D: the distance points ----------
function sceneDistance(t) {
  const a = span(t, 36.8, 50.6, 0.4, 0.4);
  if (a <= 0) return;
  const z = eio(seg(t, 37.2, 39.4));
  cam = { px: lerp(92, 38, z), vx: CX, vy: lerp(498, 380, z) };
  fresco(a, { lines: 0, vp: 1 });
  A(a, () => {
    const [vx, vy] = toC(0, EYE);
    // the horizon
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, vy); ctx.lineTo(W - 20, vy); ctx.stroke();
    // diagonals of the lower floor's tiles, extended to the distance points
    const d = eio(seg(t, 39.6, 42.6));
    ctx.lineWidth = 1.8;
    for (const sd of [-1, 1]) {
      const [dx, dy] = toC(sd * DIST, EYE);
      for (let c = -6; c <= 6; c++) {
        const [x0, y0] = P(c * TILE, BOTTOM, 0), [x1, y1] = P(c * TILE + sd * TILE_ROWS.at(-1), BOTTOM, TILE_ROWS.at(-1));
        ctx.strokeStyle = sd < 0 ? C.red : 'rgba(224,87,61,0.75)';
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x1, dx, d), lerp(y1, dy, d)); ctx.stroke();
      }
      A(seg(t, 42.0, 42.8), () => {
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(dx, dy, 9, 0, TAU); ctx.fill();
        font(700, 22); text('distance', dx, dy - 46, { align: 'center', base: 'middle', color: C.red }); text('point', dx, dy - 22, { align: 'center', base: 'middle', color: C.red });
      });
    }
    // the spacing: 9 m on the picture's scale
    A(seg(t, 43.4, 44.4), () => {
      const [dx] = toC(DIST, EYE), y = vy + 230 * 1;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(vx, y); ctx.lineTo(dx, y); ctx.stroke();
      for (const x of [vx, dx]) { ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10); ctx.stroke(); }
      ctx.setLineDash([4, 5]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx, y); ctx.moveTo(dx, vy); ctx.lineTo(dx, y); ctx.stroke(); ctx.setLineDash([]);
      const n = Math.round(lerp(0, DIST, eio(seg(t, 46.2, 47.6))));
      font(700, 30); text(t < 46.2 ? '= viewing distance' : `= ${n} m back`, (vx + dx) / 2, y + 32, { align: 'center', base: 'middle', color: C.gold });
    });
    A(seg(t, 46.4, 47.2), () => {
      const [x0] = toC(-FRESCO_W / 2, 0), [x1] = toC(FRESCO_W / 2, 0), y = toC(0, TOP)[1] - 24;
      font(600, 22); text(`the fresco: ${FRESCO_W} m wide`, (x0 + x1) / 2, y, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- E: the plan of the room ----------
function scenePlan(t) {
  const a = span(t, 50.4, 55.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const s = 56, wallY = 150, X0 = CX;
    const Y = (m) => wallY + m * s;
    const half = FRESCO_W / 2 * s, roomHalf = 5 * s;
    // the room, schematic width
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
    ctx.strokeRect(X0 - roomHalf, wallY, 2 * roomHalf, ROOM * s); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X0 - roomHalf, Y(ROOM)); ctx.lineTo(X0 + roomHalf, Y(ROOM)); ctx.stroke();
    ctx.fillStyle = C.stone; ctx.fillRect(X0 - half, wallY - 10, 2 * half, 12);
    font(700, 22); text('THE SCHOOL OF ATHENS', X0, wallY - 30, { align: 'center', base: 'middle', color: C.stone, spacing: '1px' });
    font(600, 22); text('opposite wall', X0 + roomHalf - 8, Y(ROOM) - 20, { align: 'right', base: 'middle', color: C.soft });
    // the room's length
    ctx.strokeStyle = C.soft; ctx.lineWidth = 2; const lx = X0 - roomHalf - 34;
    ctx.beginPath(); ctx.moveTo(lx, wallY); ctx.lineTo(lx, Y(ROOM)); ctx.stroke();
    font(700, 26); text(`${ROOM} m`, lx - 10, Y(ROOM / 2), { align: 'right', base: 'middle', color: C.soft });
    // the painter's eye, 9 m back
    const e = eio(seg(t, 51.4, 52.8));
    A(e, () => {
      const ey = Y(DIST);
      ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X0 - half, wallY); ctx.lineTo(X0, ey); ctx.lineTo(X0 + half, wallY); ctx.stroke();
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(X0, ey, 10, 0, TAU); ctx.fill();
      font(700, 24); text(`the painter’s eye, ${DIST} m back`, X0 + 20, ey + 30, { base: 'middle', color: C.red });
      const rx = X0 + roomHalf + 30;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rx, wallY); ctx.lineTo(rx, ey); ctx.stroke();
      font(700, 26); text(`${DIST} m`, rx + 10, Y(DIST / 2), { base: 'middle', color: C.gold });
    });
    // the middle of the room: where a visitor would naturally stand
    A(seg(t, 53.2, 54.0), () => {
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(X0, Y(ROOM / 2), 10, 0, TAU); ctx.fill();
      font(600, 22); text('a visitor, mid-room', X0 + 20, Y(ROOM / 2), { base: 'middle', color: C.sky });
    });
  });
}

// ---------- E2: from a real eye, the painted floor would be hidden ----------
function sceneHidden(t) {
  const a = span(t, 55.0, 60.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const s = 50, floor = 690, wall = 420, X = (m) => wall + m * s, Y = (m) => floor - m * s;
    const eyeX = X(-4), eyeY = 1.6; // a visitor in the middle of the room, eyes at about head height
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(X(-7.6), floor); ctx.lineTo(wall, floor); ctx.lineTo(wall, Y(7.8)); ctx.stroke();
    ctx.fillStyle = C.stone; ctx.fillRect(wall - 16, Y(TOP), 16, (TOP - BOTTOM) * s);
    font(600, 22); text('fresco', wall - 26, Y(6), { align: 'right', base: 'middle', color: C.stone });
    // the painted floor, as if it really ran on behind the wall at the frame's bottom edge
    ctx.strokeStyle = C.floor; ctx.lineWidth = 3; ctx.setLineDash([10, 7]);
    ctx.beginPath(); ctx.moveTo(wall, Y(BOTTOM)); ctx.lineTo(X(8), Y(BOTTOM)); ctx.stroke(); ctx.setLineDash([]);
    font(600, 22); text('the painted floor, “behind” the wall', X(0.4), Y(BOTTOM) - 22, { base: 'middle', color: C.floor });
    // the visitor
    const vh = 1.7 * s;
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.moveTo(eyeX - 13, floor); ctx.lineTo(eyeX - 9, floor - vh * 0.84); ctx.lineTo(eyeX + 9, floor - vh * 0.84); ctx.lineTo(eyeX + 13, floor); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(eyeX, Y(eyeY), 8, 0, TAU); ctx.fill();
    font(600, 22); text('a visitor', eyeX, floor + 26, { align: 'center', base: 'middle', color: C.soft });
    // rays to the floor cross the wall below the frame
    const r = eio(seg(t, 55.8, 57.4));
    let lo = Infinity;
    for (const z of [1, 2.5, 5, 8]) {
      const hit = eyeY + (BOTTOM - eyeY) * 4 / (4 + z); lo = Math.min(lo, hit);
      ctx.strokeStyle = C.red; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(eyeX, Y(eyeY)); ctx.lineTo(lerp(eyeX, X(z), r), lerp(Y(eyeY), Y(BOTTOM), r)); ctx.stroke();
      if (r > 0.6) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(wall, Y(hit), 4, 0, TAU); ctx.fill(); }
    }
    A(seg(t, 57.2, 58.0), () => {
      ctx.fillStyle = 'rgba(224,87,61,0.25)'; ctx.fillRect(wall - 16, Y(BOTTOM), 16, (BOTTOM - lo) * s + 4);
      font(700, 24); text('a true picture would put', wall + 26, Y(1.25), { base: 'middle', color: C.red });
      text('the floor here: below the frame', wall + 26, Y(1.25) + 30, { base: 'middle', color: C.red });
    });
  });
}

// ---------- F: the lines lead to Plato and Aristotle ----------
function sceneEnd(t) {
  const a = span(t, 59.8, 64.6, 0.5, 0.0);
  if (a <= 0) return;
  cam = { px: 92, vx: CX, vy: 498 };
  fresco(a, { lines: eio(seg(t, 60.2, 62.4)), vp: seg(t, 62.0, 62.6) });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneFresco(t);
    sceneHorizon(t);
    sceneDistance(t);
    scenePlan(t);
    sceneHidden(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 600, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.red, '^': C.sky } });
  },
});
