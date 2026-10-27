// Explainer for space-juice-earth-gravity-assist: on 28 September 2026 ESA's Juice probe flew past Earth and
// came away 3.5 km/s faster with almost no fuel. How a gravity assist works: seen from Earth the probe leaves
// as fast as it came, only turned; seen from the Sun, Earth's own motion turns that into a gain. Look: violet
// deep space, a blue Earth, Juice in gold; velocity arrows in teal (Earth's motion), coral (the probe relative
// to Earth) and gold (the probe relative to the Sun). Exo 2 for labels and numbers, Inter for captions.
//
// Facts: ESA, "Successful Earth flyby improves Juice's course to Jupiter" (28 September 2026): closest
// approach 13:45 CEST on 28 September, 8,640 km above the Indian Ocean; the flyby deflected Juice by 20° and
// increased its velocity by 3.5 km/s; one tiny nudge of six opportunities set aside in the four weeks before;
// next and last Earth flyby in January 2029, Jupiter in 2031. ESA, "Juice to fly past Earth for third gravity
// assist" (21 September 2026): April 2023 launch; first ever lunar-Earth flyby (a braking manoeuvre) and a
// Venus flyby; flying straight to Jupiter would need an enormous rocket and fuel, and more fuel to brake;
// Jupiter orbit in 2031 (July 2031), Ganymede in 2034. ESA, "Juice: why's it taking sooo long" (2023): Earth
// moves at about 30 km/s around the Sun; Juice is just over 6,000 kg; a gravity assist can speed up, slow
// down or turn a spacecraft; the planet is deflected by a minuscule amount (Newton's third law); 35 flybys of
// the Galilean moons; the first spacecraft to orbit a moon other than our own. NASA Earth fact sheet: GM =
// 398,600 km³/s², mean radius 6,371 km, mass 5.97 × 10²⁴ kg, mean orbital speed 29.78 km/s.
//
// Computed here (patched conics, Earth's gravity only): a 20° turn at 8,640 km altitude needs an approach
// speed relative to Earth of v∞ = √(μ/r·(1/sin 10° − 1)) ≈ 11.2 km/s; the hyperbola, e = 1/sin(δ/2), drawn
// to scale and timed by Kepler's equation; the speed relative to Earth along it, √(v∞² + 2μ/r). For the
// arrow diagram, an approach direction is solved so that the 20° turn adds 3.5 km/s to the Sun-relative
// speed. v∞ and the direction are not published by ESA; they only shape the drawing and are not shown as
// numbers. The ball-and-train numbers are an ideal elastic bounce.
//
// Scene plan (64.8 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0–14.0  Hook: the flyby, 8,640 km, +3.5 km/s, one nudge of six.
//  B 14.0–23.2  Earth's view: falls in, speeds up, climbs out as fast as it came; turned by 20°.
//  C 23.2–41.6  The Sun's view: Earth moves at 30 km/s; arrows add; the turned arrow makes a longer total; the
//               ball off a train.
//  D 41.6–50.8  Earth pays a minuscule amount; the other side brakes (2024).
//  E 50.8–64.8  The route to Jupiter; 35 moon flybys; Ganymede.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  night: '#07061a', deep: '#140e36', ink: '#f4f1ff', soft: 'rgba(244,241,255,0.72)', faint: 'rgba(244,241,255,0.30)',
  gold: '#ffc23d', teal: '#2ee6b6', coral: '#ff7a6b', violet: '#a78bfa', ocean: '#2f6fd6', land: '#3fbf7f', panel: 'rgba(10,7,30,0.78)',
  sun: '#ffd27a', venus: '#e8c48a', jupiter: '#d9a46c', orbit: 'rgba(167,139,250,0.28)',
};
const LAB = 'Exo 2', CAP = 'Inter';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const rad = (d) => (d * Math.PI) / 180;

// ---------- the flyby, in km and km/s ----------
const MU = 398600, R_E = 6371, ALT = 8640, RP = R_E + ALT, TURN = 20, GAIN = 3.5, V_EARTH = 29.78;
const VINF = Math.sqrt((MU / RP) * (1 / Math.sin(rad(TURN / 2)) - 1)); // ≈ 11.2 km/s, relative to Earth
const ECC = 1 / Math.sin(rad(TURN / 2)), SMA = MU / (VINF * VINF), NMOT = Math.sqrt(MU / SMA ** 3);
const F_INF = Math.acos(-1 / ECC);
// Sun-relative speed for a relative velocity at angle th (deg) to Earth's motion
const sunSpeed = (th) => Math.hypot(V_EARTH + VINF * Math.cos(rad(th)), VINF * Math.sin(rad(th)));
// the approach direction (deg from Earth's motion) whose 20° turn towards it adds 3.5 km/s: the first root
const TH_IN = (() => { let lo = 0, hi = 121; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (sunSpeed(m - TURN) - sunSpeed(m) < GAIN ? (lo = m) : (hi = m)); } return lo; })();
const TH_OUT = TH_IN - TURN;
// screen directions (y down) for the relative velocity, and the hyperbola's frame
const dir = (deg) => ({ x: Math.cos(rad(deg)), y: -Math.sin(rad(deg)) });
const QH = dir((TH_IN + TH_OUT) / 2); // motion at closest approach
const PH = { x: -QH.y * -1, y: QH.x * -1 }; // towards closest approach: Q turned anticlockwise on screen
// position along the hyperbola at time tau (s from closest approach), km in screen axes
function hyper(tau) {
  const M = NMOT * tau; let F = Math.asinh(M / ECC);
  for (let i = 0; i < 30; i++) F -= (ECC * Math.sinh(F) - F - M) / (ECC * Math.cosh(F) - 1);
  const r = SMA * (ECC * Math.cosh(F) - 1);
  const f = 2 * Math.atan(Math.sqrt((ECC + 1) / (ECC - 1)) * Math.tanh(F / 2));
  return { x: r * (Math.cos(f) * PH.x + Math.sin(f) * QH.x), y: r * (Math.cos(f) * PH.y + Math.sin(f) * QH.y), r };
}
const speedAt = (r) => Math.sqrt(VINF * VINF + (2 * MU) / r);
const T_SPAN = 5400; // seconds either side of closest approach shown

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'On 28 September 2026, Europe’s *Juice* probe swept past Earth on its way to Jupiter.'],
  [5.0, 9.4, `It passed *${ALT.toLocaleString('en-US')} km* above the Indian Ocean and came away *${GAIN} km/s* faster.`],
  [9.6, 14.0, 'Its engine barely helped: one small nudge, weeks before. The speed came from *Earth’s gravity*.'],
  [14.2, 18.6, 'Seen from Earth, the probe falls in, speeds up, swings round and climbs out again.'],
  [18.8, 23.2, `It leaves exactly as fast as it came. Only its *direction* has changed: by *${TURN}°*.`],
  [23.4, 27.8, 'But Earth is not standing still. It races round the Sun at about ~30 km/s~.'],
  [28.0, 32.4, 'Seen from the Sun, the probe moves with ~Earth’s speed~ plus its ^speed relative to Earth^.'],
  [32.6, 37.0, 'Turn the ^relative arrow^ towards Earth’s direction of travel, and the *total* grows longer.'],
  [37.2, 41.6, 'A ball bouncing off the front of a moving train speeds up in just the same way.'],
  [41.8, 46.2, 'Earth pays for it: it is slowed by a minuscule amount, as Newton’s third law demands.'],
  [46.4, 50.8, 'Fly past the other way and the trick brakes, as Juice’s 2024 flyby of the Moon and Earth did.'],
  [51.0, 55.4, 'Juice’s route: Moon and Earth in 2024, Venus in 2025, Earth now, Earth again in January 2029.'],
  [55.6, 60.0, 'That brings it to *Jupiter* in July 2031, with fuel left for *35 flybys* of its big moons.'],
  [60.2, 64.6, 'In 2034 it will orbit *Ganymede*: the first spacecraft to circle a moon other than our own.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  let s = 19; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createRadialGradient(W * 0.7, H * 0.25, 40, W * 0.5, H * 0.5, H * 0.8);
  lg.addColorStop(0, C.deep); lg.addColorStop(1, C.night);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 420; i++) { const a = r(); g.fillStyle = `rgba(235,230,255,${0.12 + a * 0.55})`; g.beginPath(); g.arc(r() * W, r() * H, 0.4 + a * 1.1, 0, Math.PI * 2); g.fill(); }
}

function earth(x, y, R, a = 1) {
  A(a, () => {
    const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.35, R * 0.1, x, y, R);
    g.addColorStop(0, '#5fa2ff'); g.addColorStop(1, C.ocean);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = C.land;
    for (const [dx, dy, rx, ry, rot] of [[-0.3, -0.25, 0.32, 0.2, 0.5], [0.25, 0.1, 0.22, 0.36, -0.3], [-0.1, 0.45, 0.3, 0.12, 0.1]]) {
      ctx.beginPath(); ctx.ellipse(x + dx * R, y + dy * R, rx * R, ry * R, rot, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(7,6,26,0.45)'; ctx.beginPath(); ctx.arc(x + R * 0.35, y + R * 0.2, R * 1.02, -0.9, 2.3); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(140,190,255,0.35)'; ctx.lineWidth = Math.max(1.5, R * 0.06); ctx.beginPath(); ctx.arc(x, y, R * 1.04, 0, Math.PI * 2); ctx.stroke();
  });
}

function juice(x, y, s = 1, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = '#2b3a8a'; ctx.strokeStyle = 'rgba(160,180,255,0.8)'; ctx.lineWidth = 1;
  for (const side of [-1, 1]) for (let i = 0; i < 5; i++) {
    const px = side * (14 + i * 13);
    ctx.fillRect(px - (side < 0 ? 12 : 0), -6, 12, 12); ctx.strokeRect(px - (side < 0 ? 12 : 0), -6, 12, 12);
  }
  ctx.fillStyle = C.gold; ctx.fillRect(-11, -11, 22, 22);
  ctx.fillStyle = '#fff3d1'; ctx.beginPath(); ctx.ellipse(0, -15, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function arrow(x0, y0, x1, y1, color, w = 6, head = 18) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  if (L < 2) return;
  const h = Math.min(head, L * 0.5);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * h * 0.7, y1 - Math.sin(a) * h * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.42) * h, y1 - Math.sin(a - 0.42) * h); ctx.lineTo(x1 - Math.cos(a + 0.42) * h, y1 - Math.sin(a + 0.42) * h); ctx.closePath(); ctx.fill();
}

function chip(x, y, w, h, fn) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); fn(); }

// ---------- A + B: the flyby seen from Earth ----------
const EX = 430, EY = 520, SC = 0.0088; // Earth's centre on screen; px per km
// the view is turned so that the probe arrives from the left, passing above Earth
const ROT = rad(TH_IN);
const turnScr = (p) => ({ x: p.x * Math.cos(ROT) - p.y * Math.sin(ROT), y: p.x * Math.sin(ROT) + p.y * Math.cos(ROT) });
const P = (p) => { const q = turnScr(p); return { x: EX + q.x * SC, y: EY + q.y * SC }; };
// scene time -> seconds from closest approach, for the first pass (A) and the replay (B)
const tauA = (t) => lerp(-T_SPAN, T_SPAN, eio(seg(t, 0.8, 8.8)) * 0.15 + seg(t, 0.8, 8.8) * 0.85);
const tauB = (t) => lerp(-T_SPAN, T_SPAN, seg(t, 14.4, 21.4));

function path(t, tauNow, a) {
  A(a, () => {
    ctx.strokeStyle = 'rgba(167,139,250,0.85)'; ctx.lineWidth = 3.5; ctx.setLineDash([2, 9]); ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 160; i++) { const tau = lerp(-T_SPAN, tauNow, i / 160), q = P(hyper(tau)); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
    ctx.stroke(); ctx.setLineDash([]);
  });
}

function sceneFlyby(t) {
  const a = 1 - seg(t, 23.0, 23.8);
  if (a <= 0) return;
  A(a, () => {
    earth(EX, EY, R_E * SC);
    font(600, 22); text('Earth', EX, EY + R_E * SC + 30, { color: C.soft, align: 'center', base: 'middle' });
    const replay = t >= 14.2;
    const tauNow = replay ? tauB(t) : tauA(t);
    path(t, tauNow, 1);
    // closest approach marker
    A(span(t, 5.0, 14.0, 0.5, 0.5), () => {
      const q = P(hyper(0)), e = { x: EX + (q.x - EX) * (R_E / RP), y: EY + (q.y - EY) * (R_E / RP) };
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.setLineDash([]);
      font(700, 30); text(`${ALT.toLocaleString('en-US')} km`, EX - 72, (q.y + e.y) / 2 + 4, { color: C.gold, align: 'right', base: 'middle' });
      font(500, 22); text('above the Indian Ocean', EX - 72, (q.y + e.y) / 2 + 34, { color: C.soft, align: 'right', base: 'middle' });
    });
    // the probe
    const q = P(hyper(tauNow));
    juice(q.x, q.y, 0.9, 0);
    // title chip
    A(span(t, 0.3, 9.4, 0.5, 0.5), () => {
      font(700, 26); text('28 SEPTEMBER 2026 · 11:45 UTC', 52, 96, { color: C.gold, base: 'middle', spacing: '2px' });
      font(800, 54); text('Juice flies past Earth', 52, 150, { color: C.ink, base: 'middle' });
    });
    // results
    A(span(t, 6.4, 14.0, 0.5, 0.5), () => {
      chip(52, 560, 330, 150, () => {
        font(800, 52); text(`+${GAIN} km/s`, 76, 612, { color: C.gold, base: 'middle' });
        font(500, 24); text(`and a ${TURN}° turn`, 78, 664, { color: C.soft, base: 'middle' });
      });
    });
    // one nudge of six
    A(span(t, 9.8, 14.0, 0.4, 0.5), () => {
      chip(52, 64, 600, 120, () => {
        font(600, 24); text('course corrections in the 4 weeks before', 76, 98, { color: C.soft, base: 'middle' });
        for (let i = 0; i < 6; i++) {
          const used = i === 0, x = 90 + i * 70, y = 148;
          ctx.strokeStyle = used ? C.gold : C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.stroke();
          if (used) { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); }
        }
        font(700, 26); text('1 used of 6', 520, 148, { color: C.gold, base: 'middle' });
      });
    });
    // B: speed relative to Earth, and the turn
    A(span(t, 14.2, 23.2, 0.4, 0.5), () => {
      const r = hyper(tauNow).r, v = speedAt(r), vMax = speedAt(RP);
      chip(52, 64, 560, 118, () => {
        font(600, 24); text('speed relative to Earth', 76, 98, { color: C.soft, base: 'middle' });
        const x0 = 76, Lw = 380, f = (u) => (u / vMax) * Lw;
        ctx.fillStyle = 'rgba(255,122,107,0.18)'; ctx.fillRect(x0, 128, Lw, 26);
        ctx.fillStyle = C.coral; ctx.fillRect(x0, 128, f(v), 26);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + f(VINF), 120); ctx.lineTo(x0 + f(VINF), 162); ctx.stroke();
        font(600, 20); text('in = out', x0 + f(VINF), 172, { color: C.ink, align: 'center', base: 'top' });
        const phase = tauNow < -1500 ? 'falling in' : tauNow < 1500 ? 'fastest' : 'climbing out';
        font(700, 24); text(phase, x0 + Lw + 18, 141, { color: C.coral, base: 'middle' });
      });
    });
    A(span(t, 18.8, 23.2, 0.5, 0.5), () => {
      // the two asymptote directions, crossing at their meeting point
      const din = turnScr(dir(TH_IN)), dout = turnScr(dir(TH_OUT));
      const qa = P(hyper(-T_SPAN)), qb = P(hyper(T_SPAN));
      const g = eout(seg(t, 19.0, 20.2));
      ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
      ctx.strokeStyle = 'rgba(255,122,107,0.9)';
      ctx.beginPath(); ctx.moveTo(qa.x, qa.y); ctx.lineTo(qa.x + din.x * 900 * g, qa.y + din.y * 900 * g); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(qb.x, qb.y); ctx.lineTo(qb.x - dout.x * 900 * g, qb.y - dout.y * 900 * g); ctx.stroke();
      ctx.setLineDash([]);
      // the angle, drawn where the two straight lines meet (above the far end of the path)
      // intersection of line a + s·din and line b − u·dout
      const det = din.x * -dout.y - din.y * -dout.x;
      const s = ((qb.x - qa.x) * -dout.y - (qb.y - qa.y) * -dout.x) / det;
      const ix = qa.x + din.x * s, iy = qa.y + din.y * s;
      A(seg(t, 20.0, 20.6), () => {
        const a1 = Math.atan2(din.y, din.x), a2 = Math.atan2(dout.y, dout.x);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ix, iy, 230, Math.min(a1, a2), Math.max(a1, a2)); ctx.stroke();
        font(800, 44); text(`${TURN}°`, ix + Math.cos((a1 + a2) / 2) * 250 + 14, iy + Math.sin((a1 + a2) / 2) * 250, { color: C.gold, base: 'middle' });
      });
    });
  });
}

// ---------- C: the Sun's view ----------
const O = { x: 110, y: 560 }; // where the arrows start
const SUN = { x: O.x + 40, y: O.y + 1500 }; // far below: Earth's orbit is a gentle arc, level at Earth
const KV = 15; // px per km/s
function vec(th, L) { const d = dir(th); return { x: d.x * L, y: d.y * L }; }

function sceneSun(t) {
  const a = span(t, 23.2, 41.8, 0.6, 0.6);
  if (a <= 0) return;
  A(a, () => {
    // Earth's orbit arc and Earth moving along it
    const R0 = Math.hypot(O.x - SUN.x, O.y - SUN.y);
    ctx.strokeStyle = C.orbit; ctx.lineWidth = 3; ctx.setLineDash([3, 10]);
    ctx.beginPath(); ctx.arc(SUN.x, SUN.y, R0, -Math.PI / 2 - 0.3, -Math.PI / 2 + 0.36); ctx.stroke(); ctx.setLineDash([]);
    font(600, 22); A(span(t, 23.6, 28.0), () => text('Earth’s orbit round the Sun', O.x + 70, O.y - 80, { color: C.violet, base: 'middle' }));
    // Earth at O, moving to the right
    const V = { x: V_EARTH * KV, y: 0 };
    earth(O.x, O.y, 34);
    const gV = eout(seg(t, 24.4, 25.8));
    A(gV, () => arrow(O.x + 40, O.y, O.x + 40 + V.x * gV, O.y, C.teal, 8, 22));
    A(span(t, 24.4, 41.8), () => { font(800, 40); text('≈ 30 km/s', O.x + 40 + V.x / 2, O.y + 46, { color: C.teal, align: 'center', base: 'middle' }); });
    A(seg(t, 25.0, 25.6), () => { font(600, 22); text('Earth', O.x, O.y + 58, { color: C.soft, align: 'center', base: 'middle' }); });
    // the vector sum: V, then the relative velocity at the tip of V
    if (t > 28.0) {
      const turn = eio(seg(t, 33.0, 35.0)), th = lerp(TH_IN, TH_OUT, turn);
      const vr = vec(th, VINF * KV), tip = { x: O.x + 40 + V.x, y: O.y };
      const g1 = eout(seg(t, 28.2, 29.4)), g2 = eout(seg(t, 29.8, 31.0));
      // ghost of the first total, once the arrow turns
      const u0 = { x: V.x + vec(TH_IN, VINF * KV).x, y: vec(TH_IN, VINF * KV).y };
      A(seg(t, 33.0, 33.6) * 0.45, () => arrow(O.x + 40, O.y, O.x + 40 + u0.x, O.y + u0.y, C.gold, 5, 16));
      A(g1, () => arrow(tip.x, tip.y, tip.x + vr.x * g1, tip.y + vr.y * g1, C.coral, 7, 20));
      A(g2, () => arrow(O.x + 40, O.y, O.x + 40 + (V.x + vr.x) * g2, O.y + vr.y * g2, C.gold, 8, 22));
      A(span(t, 28.6, 37.0), () => {
        font(700, 24);
        const lx = Math.max(tip.x, tip.x + vr.x) + 24;
        text('probe relative', lx, tip.y + vr.y * 0.5 - 14, { color: C.coral, base: 'middle' });
        text('to Earth', lx, tip.y + vr.y * 0.5 + 16, { color: C.coral, base: 'middle' });
        A(seg(t, 30.6, 31.2), () => {
          const ang = Math.atan2(vr.y, V.x + vr.x);
          ctx.save(); ctx.translate(O.x + 40 + (V.x + vr.x) * 0.42, O.y + vr.y * 0.42); ctx.rotate(ang);
          text('probe relative to the Sun', 0, -22, { color: C.gold, align: 'center', base: 'middle' }); ctx.restore();
        });
      });
      // the gain
      A(span(t, 35.0, 37.2, 0.4, 0.3), () => {
        const L0 = sunSpeed(TH_IN), L1 = sunSpeed(TH_OUT);
        chip(52, 64, 560, 110, () => {
          font(600, 24); text(`after a ${TURN}° turn, the total is longer by`, 76, 98, { color: C.soft, base: 'middle' });
          font(800, 44); text(`${(L1 - L0).toFixed(1)} km/s`, 76, 146, { color: C.gold, base: 'middle' });
        });
        A(seg(t, 33.6, 34.4), () => { ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(tip.x, tip.y, 80, Math.atan2(-Math.sin(rad(TH_IN)), Math.cos(rad(TH_IN))), Math.atan2(-Math.sin(rad(TH_OUT)), Math.cos(rad(TH_OUT)))); ctx.stroke(); });
      });
    }
    // the train
    A(span(t, 37.2, 41.8, 0.4, 0.5), () => {
      ctx.fillStyle = 'rgba(7,6,26,0.9)'; ctx.fillRect(0, 0, W, 780);
      const yT = 470, p = seg(t, 37.6, 40.8), hit = 0.4;
      // train moving right at 50; ball moving left at 20, bouncing to the right at 120 (ideal bounce)
      const front = 300 + p * 260;
      ctx.fillStyle = C.teal; k.rrect(front - 420, yT - 90, 420, 120, 18); ctx.fill();
      ctx.fillStyle = 'rgba(7,6,26,0.55)'; for (let i = 0; i < 4; i++) ctx.fillRect(front - 400 + i * 95, yT - 70, 70, 44);
      ctx.fillStyle = C.ink; for (const wx of [front - 360, front - 260, front - 120, front - 40]) { ctx.beginPath(); ctx.arc(wx, yT + 34, 16, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, yT + 52); ctx.lineTo(W, yT + 52); ctx.stroke();
      const bx = p < hit ? 780 - (p / hit) * (780 - (300 + hit * 260) - 14) : 300 + hit * 260 + 14 + (p - hit) * 260 * (120 / 50);
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(bx, yT - 20, 14, 0, Math.PI * 2); ctx.fill();
      font(700, 32, CAP);
      text('train  50 km/h  →', 60, yT - 150, { color: C.teal, base: 'middle' });
      if (p < hit) text('←  20 km/h  ball', 800, yT - 70, { color: C.gold, align: 'right', base: 'middle' });
      else text('ball  120 km/h  →', 800, yT - 70, { color: C.gold, align: 'right', base: 'middle' });
      A(seg(t, 38.8, 39.4), () => {
        font(600, 28);
        text('seen from the train: in at 70, out at 70', W / 2, yT + 124, { color: C.soft, align: 'center', base: 'middle' });
        text('seen from the ground: 50 + 70 = 120', W / 2, yT + 166, { color: C.ink, align: 'center', base: 'middle' });
        font(500, 22); text('an ideal, perfectly springy bounce', W / 2, yT + 210, { color: C.soft, align: 'center', base: 'middle' });
      });
    });
  });
}

// ---------- D: Earth pays; the other side brakes ----------
function scenePay(t) {
  const a = span(t, 41.6, 51.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 41.6, 46.4, 0.3, 0.4), () => {
      // a see-saw of momentum: tiny Juice, huge Earth
      earth(560, 400, 170);
      juice(170, 400, 1.2, 0);
      font(700, 30); text('Juice', 170, 470, { color: C.gold, align: 'center', base: 'middle' });
      font(500, 24); text('just over 6,000 kg', 170, 506, { color: C.soft, align: 'center', base: 'middle' });
      font(700, 30); text('Earth', 560, 610, { color: C.ink, align: 'center', base: 'middle' });
      font(500, 24); text('5,970,000,000,000,000,000,000,000 kg', 560, 646, { color: C.soft, align: 'center', base: 'middle' });
      A(seg(t, 43.0, 43.6), () => {
        arrow(230, 330, 330, 330, C.gold, 6, 18); font(600, 22); text('gains speed', 280, 300, { color: C.gold, align: 'center', base: 'middle' });
        chip(52, 64, 640, 70, () => { font(700, 28); text('Earth slows by far too little to measure', 76, 99, { color: C.teal, base: 'middle' }); });
      });
    });
    A(span(t, 46.4, 51.0, 0.4, 0.5), () => {
      // two flybys side by side: behind Earth (speeds up) and in front (brakes)
      for (const [cx, side, label, col] of [[230, 1, 'passes behind: faster', C.gold], [634, -1, 'passes in front: slower', C.coral]]) {
        const cy = 470, s = 0.0042;
        earth(cx, cy, R_E * s * 1.6);
        arrow(cx - 50, cy + 250, cx + 60, cy + 250, C.teal, 5, 16);
        font(600, 22); text('Earth moves', cx + 5, cy + 282, { color: C.teal, align: 'center', base: 'middle' });
        ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath();
        let last = null;
        for (let i = 0; i <= 80; i++) {
          const q = hyper(lerp(-T_SPAN * 0.62, T_SPAN * 0.62, i / 80));
          const x = cx + side * q.x * s, y = cy + q.y * s;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); last = [x, y];
        }
        ctx.stroke();
        const q1 = hyper(T_SPAN * 0.62), q0 = hyper(T_SPAN * 0.45);
        arrow(cx + side * q0.x * s, cy + q0.y * s, cx + side * q1.x * s, cy + q1.y * s, col, 4, 16);
        font(700, 26); text(label, cx, 196, { color: col, align: 'center', base: 'middle' });
      }
      chip(52, 64, 700, 70, () => { font(700, 28); text('Aug 2024, Moon and Earth: a braking flyby', 76, 99, { color: C.coral, base: 'middle' }); });
    });
  });
}

// ---------- E: the route (schematic) ----------
const SX = 250, SY = 560; // the Sun, on screen
const RV = 62, RE = 96, RJ = 380; // schematic orbit radii, not to scale
// keyframes: turns round the Sun since launch, distance, and a bulge between this keyframe and the previous
const KEYS = [[0, RE, 0], [1.2, RE, 16], [1.75, RV, 0], [2.5, RE, 0], [4.0, RE, 60], [4.4, RJ, 0]];
const END_ANG = rad(-30), START_ANG = END_ANG - KEYS[5][0] * Math.PI * 2;
function routeAt(turns) {
  let i = 1; while (i < KEYS.length - 1 && turns > KEYS[i][0]) i++;
  const [u0, r0] = KEYS[i - 1], [u1, r1, bump] = KEYS[i], s = clamp((turns - u0) / (u1 - u0));
  const r = lerp(r0, r1, i === KEYS.length - 1 ? s * s : eio(s)) + bump * Math.sin(Math.PI * s);
  const ang = START_ANG + turns * Math.PI * 2;
  return [SX + Math.cos(ang) * r, SY + Math.sin(ang) * r];
}
const STOPS = [['launch, Apr 2023', C.soft], ['Moon + Earth, Aug 2024', C.coral], ['Venus, 2025', C.venus], ['Earth, Sep 2026', C.teal], ['Earth, Jan 2029', C.teal], ['Jupiter, Jul 2031', C.jupiter]];
function sceneRoute(t) {
  const a = span(t, 50.8, 64.8, 0.6, 0.01);
  if (a <= 0) return;
  A(a, () => {
    const g = ctx.createRadialGradient(SX, SY, 0, SX, SY, 34);
    g.addColorStop(0, '#fff6d6'); g.addColorStop(1, 'rgba(255,210,122,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(SX, SY, 34, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = C.orbit;
    for (const r of [RV, RE]) { ctx.beginPath(); ctx.arc(SX, SY, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(SX, SY, RJ, rad(-85), rad(12)); ctx.stroke();
    font(600, 20);
    text('Venus', SX, SY + RV - 14, { color: C.venus, align: 'center', base: 'middle' });
    text('Earth', SX, SY + RE + 18, { color: C.teal, align: 'center', base: 'middle' });
    const total = KEYS[5][0], p = seg(t, 51.2, 59.0), now = p * total;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 600; i++) { const u = (i / 600) * now, [x, y] = routeAt(u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    const [jx, jy] = routeAt(total);
    A(seg(t, 58.4, 59.4), () => {
      ctx.fillStyle = C.jupiter; ctx.beginPath(); ctx.arc(jx, jy, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(120,70,40,0.55)'; ctx.fillRect(jx - 25, jy - 6, 50, 5); ctx.fillRect(jx - 23, jy + 6, 46, 4);
    });
    const [px, py] = routeAt(now);
    if (p > 0 && p < 1) juice(px, py, 0.5, 0);
    // the stops, and a legend that lights up as each is reached
    STOPS.forEach(([label, col], i) => {
      const reached = now >= KEYS[i][0] - 1e-6;
      const [x, y] = routeAt(KEYS[i][0]);
      if (reached) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); }
      const ly = 450 + i * 42;
      A(reached ? 1 : 0.3, () => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(512, ly, 7, 0, Math.PI * 2); ctx.fill();
        font(600, 26); text(label, 530, ly, { color: reached ? col : C.soft, base: 'middle' });
      });
    });
    A(span(t, 55.8, 60.2, 0.4, 0.4), () => {
      chip(52, 64, 470, 70, () => { font(700, 30); text('35 flybys of its big moons', 76, 99, { color: C.gold, base: 'middle' }); });
    });
    A(span(t, 60.2, 64.8, 0.5, 0.01), () => {
      chip(52, 64, 600, 70, () => { font(700, 30); text('2034: orbit round Ganymede', 76, 99, { color: C.gold, base: 'middle' }); });
      const gx = jx + 62 * Math.cos(t * 1.4), gy = jy + 22 * Math.sin(t * 1.4);
      ctx.fillStyle = '#c9c1b1'; ctx.beginPath(); ctx.arc(gx, gy, 8, 0, Math.PI * 2); ctx.fill();
      font(600, 22); text('Ganymede', jx + 70, jy - 40, { color: C.ink, base: 'middle' });
    });
    font(500, 20); text('schematic, not to scale', 52, 760, { color: C.soft, base: 'middle' });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.8, fonts: [LAB, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneFlyby(t);
    sceneSun(t);
    scenePay(t);
    sceneRoute(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 700, family: CAP, ink: C.ink, marks: { '*': C.gold, '~': C.teal, '^': C.coral } });
  },
});
