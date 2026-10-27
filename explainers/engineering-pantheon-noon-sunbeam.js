// Explainer for engineering-pantheon-noon-sunbeam (Roma): the Pantheon's only direct sunlight comes through the
// oculus, and because the entrance faces north, the noon disc of light runs up and down the north side over a year:
// high on the dome in winter, at the dome's base at the equinoxes, in the doorway around 21 April, on the floor in
// summer. Look: a section through the rotunda in warm concrete against a dusk-blue sky, the inside in deep shadow,
// the sunlight in gold. Jost for labels and captions, Libre Caslon Text for titles and dates.
//
// Facts:
// - Wikipedia, "Pantheon, Rome": rebuilt under Hadrian, probably dedicated c. AD 126; facade faces north; interior
//   43.3 m wide and as high, the drum as high as the radius; the oculus is 30 Roman feet across (Claridge), the
//   doorway 40 Roman feet high; drum wall 6.4 m thick; coffers in five rings of 28; the oculus and the door are the
//   only natural light, and the light from the oculus moves round the space in a "reverse sundial" effect, marking
//   time with light rather than shadow (Wilson Jones 2003).
// - Hannah & Magli, "The role of the sun in the Pantheon's design and meaning" (arXiv 0910.0128; Numen 2011): no
//   direct sunlight enters by the north-facing door, the oculus is the only direct light; at local noon the spot lies
//   on the meridian over the entrance; at the equinoxes it touches the springing of the dome; in autumn and winter it
//   stays on the upper hemisphere, highest at the winter solstice; the entrance is fully lit around 21 April, Rome's
//   traditional founding day; from the end of April to the end of August the midday spot is on the floor; every day
//   it moves in an arc from west to east; not a precision instrument (no markings), but regular visitors gain a rough
//   ability to tell the day and hour; they argue the design and meaning depend on the Sun. Rome lies at 41°54′ N.
// Computed here (a simplified section through the meridian, thin oculus, local noon): the Sun's noon height
// 90° − 41.9° + declination, from about 25° to about 72°; the two edge rays through the oculus and where each meets
// the dome, the north wall or the floor; for the plan view, the central ray for each hour of 21 December.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: the section, the oculus, a beam on the dome.
//  B  9.2–18.4  The door faces north; the noon Sun's height from December to June.
//  C 18.4–36.6  A year at noon: dome, base of the dome, doorway on 21 April.
//  D 36.8–46.0  Summer on the floor; the month marks along the north side: a reverse sundial.
//  E 46.0–55.0  Plan: one winter day, the disc sweeps west to east.
//  F 55.2–64.6  The theory, and the doorway lit.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky1: '#0e1a2b', sky2: '#2a3550', dusk: '#6b5a6e', ink: '#f3ead8', soft: 'rgba(243,234,216,0.70)', faint: 'rgba(243,234,216,0.24)',
  concrete: '#b9a68b', concrete2: '#9c8a71', joint: 'rgba(60,45,30,0.35)', inside: '#17130f', coffer: '#0f0c09',
  gold: '#ffc94d', goldSoft: 'rgba(255,201,77,0.20)', beam: 'rgba(255,214,120,0.16)', sky: '#8cc4ec', terra: '#e07a4f', bronze: '#5b4630',
};
const LAB = 'Jost', CAP = 'Libre Caslon Text';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const RAD = Math.PI / 180;

// ---------- the building, in metres (x north of the centre, y above the floor) ----------
const R = 43.3 / 2;            // interior radius; the drum is as high as the radius
const RO = (30 * 0.296) / 2;   // oculus radius: 30 Roman feet across, about 8.9 m
const WALL = 6.4, DOOR = 40 * 0.296; // drum wall thickness; doorway height, 40 Roman feet ≈ 11.8 m
const YRIM = R + Math.sqrt(R * R - RO * RO); // where the oculus cuts the inner sphere
const LAT = 41.9, TILT = 23.44;
const decl = (n) => TILT * Math.sin((2 * Math.PI * (284 + n)) / 365); // n = day of the year
const noonAlt = (n) => 90 - LAT + decl(n);
const LOW = Math.round(90 - LAT - TILT), HIGH = Math.round(90 - LAT + TILT); // 25°, 72°
if (LOW !== 25 || HIGH !== 72) throw new Error('numbers');

/** Where a ray entering the oculus at x0 with the Sun at alt° meets the inside: the dome, the north wall or the floor. */
function hit(x0, alt) {
  const c = Math.cos(alt * RAD), s = Math.sin(alt * RAD);
  const a = x0, b = YRIM - R, p = a * c - b * s;
  const t = -p + Math.sqrt(p * p - (a * a + b * b - R * R));
  const x = a + t * c, y = YRIM - t * s;
  if (y >= R) return { x, y, u: 2 * R + R * Math.atan2(y - R, x) }; // dome: u runs on along the arc
  const yw = YRIM - ((R - a) / c) * s;
  if (yw >= 0) return { x: R, y: yw, u: R + yw }; // north wall
  const xf = a + (YRIM / s) * c;
  return { x: xf, y: 0, u: xf }; // floor
}
/** A point on the north half of the inside, by u: floor (0…R), wall (R…2R), dome (2R…). */
function along(u) {
  if (u <= R) return [u, 0];
  if (u <= 2 * R) return [R, u - R];
  const th = (u - 2 * R) / R;
  return [R * Math.cos(th), R + R * Math.sin(th)];
}
const spot = (alt) => { const p = hit(-RO, alt).u, q = hit(RO, alt).u; return [Math.min(p, q), Math.max(p, q)]; };
// checks against Hannah and Magli: the equinox spot spans the springing; 21 April (day 111) covers the doorway
{
  const [e0, e1] = spot(noonAlt(80)); if (!(e0 < 2 * R && e1 > 2 * R)) throw new Error('equinox');
  const [d0, d1] = spot(noonAlt(111)); if (!(d0 < R && d1 > R + DOOR)) throw new Error('doorway');
  const [w0] = spot(noonAlt(355)); if (!(w0 > 2 * R)) throw new Error('winter');
}

// ---------- drawing frame ----------
const S = 12, X0 = 404, Y0 = 712;
const X = (m) => X0 + m * S, Y = (m) => Y0 - m * S;

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'Rome’s *Pantheon*, rebuilt under Emperor Hadrian around AD 126, gets its sunlight from one hole.'],
  [4.8, 9.0, 'The *oculus*, about 9 metres across, is open to the sky. Watch where its sunlight lands at noon.'],
  [9.2, 13.6, 'The door faces *north*. At noon the Sun is due south, so its light falls on the door’s side.'],
  [13.8, 18.2, `In Rome the noon Sun stands about ~${LOW}°~ high in December and about *${HIGH}°* in June.`],
  [18.4, 22.8, 'In ~winter~ the low Sun throws its noon disc high up, onto the coffers of the dome.'],
  [23.0, 27.4, 'As the Sun climbs through spring, the disc slides *down*, day by day.'],
  [27.6, 32.0, 'At the *equinoxes*, in March and September, it reaches the base of the dome.'],
  [32.2, 36.6, 'Around *21 April*, Rome’s traditional birthday, it lights the doorway down to the floor.'],
  [36.8, 41.2, 'From May to August it lies on the *floor*. Then it climbs back, until December.'],
  [41.4, 45.8, 'So the wall works as a calendar: a *reverse sundial*, telling time with light, not shadow.'],
  [46.0, 50.4, 'Each day the disc also sweeps from ~west~ to ~east~, opposite to the Sun’s path.'],
  [50.6, 55.0, 'No marks on the floor make it a precise clock, but regular visitors can read it roughly.'],
  [55.2, 59.6, 'Robert Hannah and Giulio Magli argue the building was designed around this sunlight.'],
  [59.8, 64.2, 'It is a theory, not a proven plan, but the moving disc is there on any sunny day.'],
];

// the day of the year at noon, through the scene
const KEYS = [[0, 330], [18.6, 355], [22.6, 355], [27.2, 365 + 48], [31.6, 365 + 80], [32.4, 365 + 80], [35.2, 365 + 111], [36.8, 365 + 111], [40.4, 365 + 200], [41.2, 365 + 200]];
function dayAt(t) {
  for (let i = 1; i < KEYS.length; i++) {
    const [t1, d1] = KEYS[i];
    if (t <= t1) { const [t0, d0] = KEYS[i - 1]; return lerp(d0, d1, eio(seg(t, t0, t1))); }
  }
  return KEYS.at(-1)[1];
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function dateOf(n) {
  let d = ((Math.round(n) - 1) % 365 + 365) % 365;
  for (let m = 0; m < 12; m++) { if (d < LEN[m]) return `${d + 1} ${MONTHS[m]}`; d -= LEN[m]; }
  return '';
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sky1); lg.addColorStop(0.55, C.sky2); lg.addColorStop(0.68, C.dusk); lg.addColorStop(0.7, '#1a1611'); lg.addColorStop(1, '#100d0a');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(240,240,255,${0.1 + rnd() * 0.35})`; g.beginPath(); g.arc(rnd() * W, rnd() * 330, 0.5 + rnd(), 0, Math.PI * 2); g.fill(); }
}

// ---------- the section ----------
function outerPath() {
  // simplified outer profile: the drum, three step rings, a shallow outer dome up to the oculus rim
  const xo = R + WALL, steps = 3, st = 1.7;
  ctx.beginPath();
  ctx.moveTo(X(-xo), Y(-1.2));
  ctx.lineTo(X(-xo), Y(R + 5));
  for (let i = 0; i < steps; i++) { ctx.lineTo(X(-xo + i * st), Y(R + 5 + (i + 1) * st)); ctx.lineTo(X(-xo + (i + 1) * st), Y(R + 5 + (i + 1) * st)); }
  ctx.quadraticCurveTo(X(-RO - 9), Y(2 * R + 2.4), X(-RO), Y(2 * R + 1.4));
  ctx.lineTo(X(RO), Y(2 * R + 1.4));
  ctx.quadraticCurveTo(X(RO + 9), Y(2 * R + 2.4), X(xo - steps * st), Y(R + 5 + steps * st));
  for (let i = steps - 1; i >= 0; i--) { ctx.lineTo(X(xo - i * st), Y(R + 5 + (i + 1) * st)); ctx.lineTo(X(xo - i * st), Y(R + 5 + i * st)); }
  ctx.lineTo(X(xo), Y(-1.2));
  ctx.closePath();
}
function insidePath() {
  ctx.beginPath();
  ctx.moveTo(X(-R), Y(0)); ctx.lineTo(X(-R), Y(R));
  const a0 = Math.PI, a1 = Math.PI * 1.5 - Math.asin(RO / R), a2 = Math.PI * 1.5 + Math.asin(RO / R);
  ctx.arc(X(0), Y(R), R * S, a0, a1);
  ctx.lineTo(X(-RO), Y(2 * R + 1.4)); ctx.lineTo(X(RO), Y(2 * R + 1.4));
  ctx.arc(X(0), Y(R), R * S, a2, 0);
  ctx.lineTo(X(R), Y(0)); ctx.closePath();
}
function building(a, { door = 0 } = {}) {
  A(a, () => {
    // ground line
    ctx.fillStyle = '#2a231b'; ctx.fillRect(0, Y(0), W, Y0 + 36 > H ? 0 : 20);
    // portico on the north side (to the right): vestibule, columns and pediment, simplified
    ctx.fillStyle = C.concrete2; ctx.fillRect(X(R + WALL), Y(26), W - X(R + WALL), 26 * S);
    ctx.fillStyle = '#2b241c'; ctx.fillRect(X(R + WALL) + 6, Y(23), W - X(R + WALL) - 6, 23 * S);
    for (const cx of [X(R + WALL) + 40, X(R + WALL) + 92]) { ctx.fillStyle = C.concrete; ctx.fillRect(cx, Y(20), 16, 20 * S); ctx.fillRect(cx - 5, Y(20.6), 26, 8); }
    // the cut through the walls and dome
    ctx.fillStyle = C.concrete; outerPath(); ctx.fill();
    ctx.save(); outerPath(); ctx.clip();
    ctx.strokeStyle = C.joint; ctx.lineWidth = 1;
    for (let yy = 0; yy < 2 * R + 3; yy += 1.6) { ctx.beginPath(); ctx.moveTo(0, Y(yy)); ctx.lineTo(W, Y(yy)); ctx.stroke(); }
    ctx.restore();
    // the dark inside
    ctx.fillStyle = C.inside; insidePath(); ctx.fill();
    // coffers: five rings, cut into the inside of the dome (seen in section on both sides)
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const th = (8 + i * 11) * RAD, dth = 7.4 * RAD, depth = 0.9 - i * 0.1;
        ctx.fillStyle = C.coffer;
        ctx.beginPath();
        for (const [tt, rr] of [[th, R], [th + dth, R], [th + dth - 0.02, R + depth], [th + 0.02, R + depth]]) {
          ctx.lineTo(X(side * rr * Math.cos(tt)), Y(R + rr * Math.sin(tt)));
        }
        ctx.closePath(); ctx.fill();
      }
    }
    // the doorway in the north wall: bronze doors
    ctx.fillStyle = C.bronze; ctx.fillRect(X(R) - 2, Y(DOOR), WALL * S + 4, DOOR * S);
    A(door, () => { ctx.fillStyle = '#3a2c1d'; ctx.fillRect(X(R) - 2, Y(DOOR), WALL * S + 4, DOOR * S); });
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 2; ctx.strokeRect(X(R) - 2, Y(DOOR), WALL * S + 4, DOOR * S);
    // floor
    ctx.fillStyle = '#4a3e30'; ctx.fillRect(X(-R), Y(0), 2 * R * S, 6);
    font(600, 22); text('SOUTH', X(-R), Y0 + 34, { color: C.soft, base: 'middle', spacing: '2px' });
    text('NORTH · DOOR', X(R + WALL), Y0 + 34, { align: 'right', color: C.soft, base: 'middle', spacing: '2px' });
  });
}
// ---------- the light ----------
function sunPos(alt) {
  const c = Math.cos(alt * RAD), s = Math.sin(alt * RAD);
  const ox = X(0), oy = Y(YRIM);
  const d = Math.min(400, (oy - 64) / s);
  return [ox - c * d, oy - s * d];
}
function light(alt, a, { label = null, spotGlow = 1 } = {}) {
  if (a <= 0) return;
  const c = Math.cos(alt * RAD), s = Math.sin(alt * RAD);
  const [u0, u1] = spot(alt);
  const hs = hit(-RO, alt), hn = hit(RO, alt);
  A(a, () => {
    // the beam coming in from the sky, and inside the building
    const far = 900;
    ctx.fillStyle = C.beam;
    ctx.beginPath();
    ctx.moveTo(X(-RO) - c * far, Y(YRIM + 1.4) - s * far); ctx.lineTo(X(RO) - c * far, Y(YRIM + 1.4) - s * far);
    ctx.lineTo(X(RO), Y(2 * R + 1.4)); ctx.lineTo(X(-RO), Y(2 * R + 1.4)); ctx.closePath(); ctx.fill();
    ctx.save(); insidePath(); ctx.clip();
    ctx.fillStyle = 'rgba(255,214,120,0.22)';
    ctx.beginPath(); ctx.moveTo(X(-RO), Y(YRIM)); ctx.lineTo(X(RO), Y(YRIM));
    ctx.lineTo(X(hn.x), Y(hn.y));
    for (let u = u1; u >= u0; u -= 0.4) { const [px, py] = along(u); ctx.lineTo(X(px), Y(py)); }
    ctx.lineTo(X(hs.x), Y(hs.y)); ctx.closePath(); ctx.fill();
    ctx.restore();
    // the lit patch, along the surface
    ctx.save();
    ctx.shadowColor = C.gold; ctx.shadowBlur = 24 * spotGlow;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let u = u0; u <= u1 + 0.001; u += 0.25) { const [px, py] = along(Math.min(u, u1)); ctx.lineTo(X(px) + (py > 0 && px >= R - 0.01 ? -4 : 0), Y(py) - (py === 0 ? 3 : 0)); }
    ctx.stroke();
    ctx.restore();
    // the Sun
    const [sx, sy] = sunPos(alt);
    ctx.save(); ctx.shadowColor = C.gold; ctx.shadowBlur = 30;
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(sx, sy, 20, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (label) { font(600, 24); text(label, sx + 32, sy + 2, { base: 'middle', color: C.gold }); }
  });
}

// ---------- A: hook ----------
function sceneHook(t) {
  const a = span(t, 0, 9.2, 0.5, 0.4);
  A(a, () => {
    font(700, 44, CAP); text('The Pantheon', 52, 78, { base: 'middle' });
    font(500, 24); text('ROME · REBUILT UNDER HADRIAN, c. AD 126', 52, 118, { base: 'middle', color: C.soft, spacing: '2px' });
  });
  A(seg(t, 5.2, 6.0) * (1 - seg(t, 8.8, 9.2)), () => {
    // point at the oculus
    font(600, 26); text('OCULUS', X(0) + 80, Y(2 * R + 4.6), { base: 'middle', color: C.gold, spacing: '3px' });
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0) + 74, Y(2 * R + 4.6)); ctx.lineTo(X(RO) + 6, Y(2 * R + 2)); ctx.stroke();
    font(500, 22); text('≈ 9 m across', X(0) + 80, Y(2 * R + 4.6) + 30, { base: 'middle', color: C.soft });
  });
}

// ---------- B: north door and the Sun's heights ----------
function sceneHeights(t) {
  A(span(t, 9.2, 13.8, 0.4, 0.4), () => {
    // a small plan: the rotunda, the portico to the north, the Sun to the south
    const cx = 630, cy = 150, r = 38;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.concrete; ctx.fillRect(cx - 26, cy - r - 30, 52, 30);
    font(600, 22); text('N', cx, cy - r - 46, { align: 'center', base: 'middle' });
    text('door', cx + 38, cy - r - 16, { base: 'middle', color: C.soft });
    ctx.save(); ctx.shadowColor = C.gold; ctx.shadowBlur = 14; ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(cx, cy + r + 30, 11, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    text('noon Sun, S', cx + 22, cy + r + 30, { base: 'middle', color: C.gold });
  });
  A(span(t, 13.8, 18.6, 0.4, 0.4), () => {
    // the two extremes of the noon Sun
    for (const [alt, col, lab] of [[90 - LAT - TILT, C.sky, `DECEMBER  ${LOW}°`], [90 - LAT + TILT, C.gold, `JUNE  ${HIGH}°`]]) {
      const c = Math.cos(alt * RAD), s = Math.sin(alt * RAD), ox = X(0), oy = Y(2 * R + 1.4), d = Math.min(330, (oy - 70) / s);
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox - c * d, oy - s * d); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ox - c * d, oy - s * d, 14, 0, Math.PI * 2); ctx.fill();
      font(600, 24); text(lab, ox - c * d + (alt < 40 ? 0 : 24), oy - s * d + (alt < 40 ? 36 : 2), { base: 'middle', color: col, align: alt < 40 ? 'center' : 'left' });
    }
    // horizon line through the oculus, to read the angles
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(30, Y(2 * R + 1.4)); ctx.lineTo(X(0), Y(2 * R + 1.4)); ctx.stroke();
  });
}

// ---------- C/D: the year at noon ----------
function yearLabels(t, n, alt) {
  A(span(t, 18.4, 41.4, 0.4, 0.4), () => {
    font(700, 36, CAP); text(dateOf(n), 728, 70, { align: 'right', base: 'middle' });
    font(500, 24); text(`noon Sun ${Math.round(alt)}° high`, 728, 106, { align: 'right', base: 'middle', color: C.soft });
  });
  // the base of the dome
  A(span(t, 27.8, 32.4, 0.4, 0.4), () => {
    ctx.strokeStyle = C.sky; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(X(-R), Y(R)); ctx.lineTo(X(R), Y(R)); ctx.stroke(); ctx.setLineDash([]);
    font(600, 22); text('BASE OF THE DOME', X(-R) + 14, Y(R) - 16, { base: 'middle', color: C.sky, spacing: '2px' });
  });
  A(span(t, 33.6, 37.0, 0.4, 0.4), () => {
    font(600, 24); text('DOORWAY LIT', X(R) - 16, Y(DOOR) - 22, { align: 'right', base: 'middle', color: C.gold, spacing: '2px' });
  });
  A(span(t, 37.8, 41.4, 0.4, 0.4), () => {
    font(600, 24); text('ON THE FLOOR', X(R) - 90, Y(0) - 70, { align: 'center', base: 'middle', color: C.gold, spacing: '2px' });
  });
}
// month marks: where the centre of the noon disc falls on the 21st of each month
const MARKS = [[355, 'DEC'], [21, 'JAN · NOV'], [52, 'FEB · OCT'], [80, 'MAR · SEP'], [111, 'APR · AUG'], [141, 'MAY · JUL'], [172, 'JUN']].map(([n, lab]) => ({ lab, u: hit(0, noonAlt(n)).u }));
function sceneCalendar(t) {
  A(span(t, 41.4, 46.2, 0.5, 0.4), () => {
    MARKS.forEach((m, i) => {
      A(seg(t, 41.6 + i * 0.3, 42.1 + i * 0.3), () => {
        const [px, py] = along(m.u);
        const onDome = m.u > 2 * R, onFloor = m.u <= R;
        const nx = onDome ? Math.cos((m.u - 2 * R) / R) : onFloor ? 0 : 1, ny = onDome ? Math.sin((m.u - 2 * R) / R) : onFloor ? 1 : 0;
        const len = onFloor && m.lab.startsWith('MAY') ? 62 : 26;
        const x1 = X(px) - nx * 6, y1 = Y(py) + (onFloor ? -6 : ny * 6), x2 = X(px) - nx * len, y2 = Y(py) + (onFloor ? -len : ny * len);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        font(600, 22); text(m.lab, x2 - (onFloor ? 0 : 8), y2 + (onFloor ? -16 : 0), { align: onFloor ? 'center' : 'right', base: 'middle', color: C.gold });
      });
    });
    font(700, 38, CAP); text('A reverse sundial', 728, 70, { align: 'right', base: 'middle', color: C.gold });
    font(500, 22); text('where the noon disc’s centre falls on the 21st', 728, 106, { align: 'right', base: 'middle', color: C.soft });
  });
}

// ---------- E: plan, one winter day ----------
function sun3(hour, n) {
  const d = decl(n) * RAD, phi = LAT * RAD, h = (hour - 12) * 15 * RAD;
  const sa = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(h);
  const alt = Math.asin(sa);
  // direction to the Sun: east, north, up
  const e = -Math.cos(d) * Math.sin(h);
  const nn = Math.cos(phi) * Math.sin(d) - Math.sin(phi) * Math.cos(d) * Math.cos(h);
  return { alt, v: [e, nn, sa] };
}
function hit3(hour, n) {
  const { alt, v } = sun3(hour, n);
  const dx = -v[0], dy = -v[1], dz = -v[2];
  const s = 2 * R * Math.sin(alt); // second meeting with the sphere, from its top
  const z = 2 * R + s * dz;
  if (z >= R) return { x: s * dx, y: s * dy, alt };
  return null;
}
const PCX = 432, PCY = 452, PR = 268;
function scenePlan(t) {
  A(span(t, 46.0, 55.4, 0.5, 0.5), () => {
    ctx.fillStyle = 'rgba(16,13,10,0.92)'; ctx.fillRect(0, 0, W, 760);
    // the dome from above: five rings of 28 coffers
    ctx.fillStyle = C.inside; ctx.beginPath(); ctx.arc(PCX, PCY, PR, 0, Math.PI * 2); ctx.fill();
    for (let ring = 0; ring < 5; ring++) {
      const th0 = (8 + ring * 11) * RAD, th1 = th0 + 7.4 * RAD;
      const r0 = PR * Math.cos(th0), r1 = PR * Math.cos(th1);
      for (let j = 0; j < 28; j++) {
        const a0 = (j / 28) * Math.PI * 2 + 0.03, a1 = ((j + 1) / 28) * Math.PI * 2 - 0.03;
        ctx.fillStyle = 'rgba(185,166,139,0.22)';
        ctx.beginPath(); ctx.arc(PCX, PCY, r0, a0, a1); ctx.arc(PCX, PCY, r1, a1, a0, true); ctx.closePath(); ctx.fill();
      }
    }
    ctx.strokeStyle = C.concrete; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(PCX, PCY, PR, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.sky2; ctx.beginPath(); ctx.arc(PCX, PCY, (RO / R) * PR, 0, Math.PI * 2); ctx.fill();
    // compass and door
    ctx.fillStyle = C.concrete; ctx.fillRect(PCX - 34, PCY - PR - 30, 68, 26);
    font(600, 24);
    text('N · DOOR', PCX, PCY - PR - 48, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    text('W', PCX - PR - 30, PCY, { align: 'center', base: 'middle', color: C.sky });
    text('E', PCX + PR + 30, PCY, { align: 'center', base: 'middle', color: C.sky });
    text('S', PCX, PCY + PR + 28, { align: 'center', base: 'middle', color: C.soft });
    // the path of the disc's centre on 21 December, 9:00 to 15:00 (local solar time)
    const P = (p) => [PCX + (p.x / R) * PR, PCY - (p.y / R) * PR];
    ctx.strokeStyle = 'rgba(255,201,77,0.55)'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath();
    for (let hr = 9; hr <= 15.001; hr += 0.1) { const p = hit3(hr, 355); if (p) ctx.lineTo(...P(p)); }
    ctx.stroke(); ctx.setLineDash([]);
    for (const hr of [9, 12, 15]) {
      const [x, y] = P(hit3(hr, 355));
      font(500, 22); text(`${hr}:00`, x, y + 34, { align: 'center', base: 'middle', color: C.soft });
    }
    const hr = lerp(9, 15, eio(seg(t, 46.6, 50.2)));
    const [x, y] = P(hit3(hr, 355));
    ctx.save(); ctx.shadowColor = C.gold; ctx.shadowBlur = 26; ctx.fillStyle = C.gold;
    ctx.beginPath(); ctx.ellipse(x, y, 30, 24, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    font(700, 34, CAP); text('21 December, seen from above', 52, 62, { base: 'middle' });
    font(500, 22); text('the path of the disc’s centre, local solar time', 52, 100, { base: 'middle', color: C.soft });
  });
}

// ---------- F: the theory ----------
function sceneTheory(t) {
  A(span(t, 55.2, 64.6, 0.5, 0.0), () => {
    font(700, 38, CAP); text('21 April, noon', 728, 70, { align: 'right', base: 'middle', color: C.gold });
    font(500, 22); text('sunlight fills the doorway, seen from inside', 728, 106, { align: 'right', base: 'middle', color: C.soft });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [LAB, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    const n = t < 55 ? dayAt(t) : 365 + 111;
    const alt = noonAlt(((n - 1) % 365) + 1);
    const inBuilding = span(t, 0, 64.6, 0.6, 0);
    const doorLit = seg(t, 33.0, 34.0) * (1 - seg(t, 36.6, 37.4)) + seg(t, 55.4, 56.2);
    building(inBuilding);
    light(alt, seg(t, 1.6, 3.0) * (1 - seg(t, 13.6, 14.2)) + seg(t, 18.2, 18.8) * (t < 46 ? 1 : 0) + seg(t, 55.2, 56.0), { spotGlow: 1 + doorLit });
    sceneHook(t);
    sceneHeights(t);
    yearLabels(t, n, alt);
    sceneCalendar(t);
    scenePlan(t);
    sceneTheory(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 500, family: LAB, ink: C.ink, marks: { '*': C.gold, '~': C.sky, '^': C.terra } });
  },
});
