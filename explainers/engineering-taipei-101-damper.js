// Explainer for engineering-taipei-101-damper: a 660-tonne pendulum calms the tower's sway.
// Look: Taipei by night. A deep indigo sky with stars, a skyline of lit windows, Taipei 101 as a
// dark teal glass silhouette with eight flared tiers, and the damper as a glowing gold sphere.
// Jost for captions, Oswald for numbers and labels.
//
// The sway is simulated, not keyframed: two coupled oscillators, the tower (x1) and the pendulum
// (x2), integrated with RK4. The tower has 3% damping; the pendulum's mass is 2.4% of the tower's
// moving mass, tuned to f = 1/(1+mu) of the tower's frequency with Den Hartog's optimal damping.
// Both towers in scene D get exactly the same gusts (three sines near the tower's frequency under
// a slow envelope). The mass ratio was chosen so the model's peak sway falls by about the 40% the
// source gives as the damper's best case; the video states only the source's figure ("up to
// 40%"), never a number from the model. Sway is exaggerated and sped up (a 2.4 s period here), and
// the drawing is captioned as a diagram.
//
// Scene plan (63 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: the tower at night; a magnifier shows the gold ball between floors 88 and
//               92. "Near the top of Taipei 101 hangs a 660-tonne steel ball." / "It's there to
//               calm the tower's sway in strong winds."
//  B  9.2–24.4  The problem: the tower without the ball, gusts, a growing sway and its trace.
//  C 24.4–40.0  How it works: a close-up of the pendulum between the floors. The building sways,
//               the ball lags 90° behind and pulls against the motion; dampers turn it into heat.
//  D 40.0–54.8  Side by side, same gusts: without and with the damper, with the widest sway so far
//               marked at each top. "…can cut the tower's movement by up to 40%."
//  E 54.8–63.0  Typhoon Soudelor (2015) swung the ball about 1 m, its biggest move. End card.
//
// Facts: Wikipedia "Taipei 101": a 660-tonne steel pendulum serves as a tuned mass damper,
// suspended from the 92nd to the 88th floor; it sways to offset movements caused by strong gusts;
// it can reduce up to 40% of the tower's movements; the ball is 5.5 m across, made of 41 steel
// plates; on 8 August 2015 Typhoon Soudelor swayed it by 1 m, the largest movement recorded; it is
// visible to visitors. Guinness World Records, "Largest tuned mass damper": the counterbalance
// transfers the building's movement to dampers, which dissipate it as heat. Wikipedia "Tuned mass
// damper": tuned to the building's resonant frequency; excess sway can cause motion sickness.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  skyTop: '#050817', skyMid: '#0d1233', skyLow: '#2a1f55', glow: '#6a3f8f',
  city: '#0a0e26', city2: '#11163a', win: '#ffcf7a', winTeal: '#7fe7dc',
  glass: '#0f3b42', glass2: '#1b5c60', edge: '#5fe0d2',
  gold: '#f2c14e', goldLight: '#fff1b8', goldDeep: '#9a6512',
  ink: '#f3f1ff', inkSoft: 'rgba(243,241,255,0.72)', wind: 'rgba(190,220,255,0.55)', red: '#ff7b6b',
};
const F = 'Jost', NUM = 'Oswald';

let k, ctx;
const font = (w, s, f = F) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the simulation ----------
const T1 = 2.4, W1 = (2 * Math.PI) / T1, Z1 = 0.03, MU = 0.024;
const W2 = W1 / (1 + MU), Z2 = Math.sqrt((3 * MU) / (8 * Math.pow(1 + MU, 3)));
function gust(t) {
  const env = Math.min(1, t / 2) * (0.75 + 0.25 * Math.sin(t * 0.7 + 0.4));
  return env * (Math.sin(W1 * t) + 0.5 * Math.sin(1.06 * W1 * t + 1.1) + 0.4 * Math.sin(0.95 * W1 * t + 2.3));
}
/** Returns samples [x1, x2 - x1] every 1/60 s for `len` seconds from rest. */
function simulate(len, withTmd) {
  const f = (t, [x1, v1, x2, v2]) => {
    const rel = withTmd ? W2 * W2 * (x2 - x1) + 2 * Z2 * W2 * (v2 - v1) : 0;
    return [v1, -W1 * W1 * x1 - 2 * Z1 * W1 * v1 + MU * rel + gust(t), v2, withTmd ? -rel : 0];
  };
  let s = [0, 0, 0, 0];
  const dt = 1 / 240, out = [];
  for (let i = 0; i * dt <= len + 1e-9; i++) {
    const t = i * dt;
    if (i % 4 === 0) out.push([s[0], s[2] - s[0]]);
    const k1 = f(t, s), k2 = f(t + dt / 2, s.map((v, j) => v + (dt / 2) * k1[j]));
    const k3 = f(t + dt / 2, s.map((v, j) => v + (dt / 2) * k2[j])), k4 = f(t + dt, s.map((v, j) => v + dt * k3[j]));
    s = s.map((v, j) => v + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
  }
  return out;
}
const B0 = 9.8, D0 = 40.8, DLEN = 14.2;
const RUN_B = simulate(15, false);
const RUN_FREE = simulate(DLEN, false), RUN_TMD = simulate(DLEN, true);
const sample = (run, t0, t) => {
  const u = (t - t0) * 60;
  if (u <= 0) return [0, 0];
  const i = Math.min(run.length - 2, Math.floor(u)), f = Math.min(1, u - i);
  return [lerp(run[i][0], run[i + 1][0], f), lerp(run[i][1], run[i + 1][1], f)];
};
const peakUpTo = (run, t0, t) => { let m = 0; const n = Math.min(run.length, Math.floor((t - t0) * 60)); for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(run[i][0])); return m; };
const PEAK_FREE = peakUpTo(RUN_FREE, 0, DLEN), PEAK_TMD = peakUpTo(RUN_TMD, 0, DLEN);
let REL_MAX = 0; for (const p of RUN_TMD) REL_MAX = Math.max(REL_MAX, Math.abs(p[1]));

// ---------- timeline ----------
const T = { A: [0, 9.2], B: [9.0, 24.6], C: [24.2, 40.2], D: [39.8, 55.0], E: [54.6, 63] };
const CUES = [
  [0.4, 4.6, 'Near the top of Taipei 101 hangs a *660-tonne* steel ball.'],
  [4.8, 9.0, 'It’s there to calm the tower’s *sway* in strong winds.'],
  [9.2, 13.8, 'Picture the tower without its ball. Strong winds make it ~sway~.'],
  [14.0, 19.6, 'Gusts in step with its natural rhythm build the sway up, like pushes on a swing.'],
  [19.8, 24.2, 'Upper floors that sway too much can make people feel seasick.'],
  [24.4, 30.0, 'The ball hangs from cables as a *pendulum*, tuned to the tower’s own rhythm.'],
  [30.2, 34.8, 'When the tower sways one way, the heavy ball lags behind…'],
  [35.0, 39.8, '…and pulls against the motion, while dampers turn the energy into *heat*.'],
  [40.0, 44.8, 'Same gusts, two towers: one without the ball, one with it.'],
  [45.0, 49.4, 'The damper doesn’t stop the sway, but it *calms* it.'],
  [49.6, 54.6, 'Taipei 101’s damper can cut the tower’s movement by *up to 40%*.'],
  [54.8, 60.2, 'In 2015, Typhoon Soudelor swung the ball about *1 metre*, its biggest move yet.'],
];

// ---------- background, painted once ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, 800);
  lg.addColorStop(0, C.skyTop); lg.addColorStop(0.55, C.skyMid); lg.addColorStop(1, C.skyLow);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const hg = g.createRadialGradient(W / 2, 800, 40, W / 2, 800, 560);
  hg.addColorStop(0, 'rgba(160,90,190,0.35)'); hg.addColorStop(1, 'rgba(160,90,190,0)');
  g.fillStyle = hg; g.fillRect(0, 300, W, 600);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 160; i++) { const y = r() * 560; g.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.6 * (1 - y / 700)})`; g.beginPath(); g.arc(r() * W, y, r() * 1.4 + 0.3, 0, Math.PI * 2); g.fill(); }
  // two layers of city with lit windows
  const layer = (base, maxH, col, winA) => {
    let x = -10;
    while (x < W + 10) {
      const w = 26 + r() * 50, h = 40 + r() * maxH;
      g.fillStyle = col; g.fillRect(x, base - h, w, h + 400);
      for (let wy = base - h + 8; wy < base - 6; wy += 11) for (let wx = x + 5; wx < x + w - 6; wx += 9) {
        if (r() < 0.32) { g.fillStyle = r() < 0.8 ? `rgba(255,207,122,${winA * (0.4 + r() * 0.6)})` : `rgba(127,231,220,${winA})`; g.fillRect(wx, wy, 4, 5); }
      }
      x += w + 2 + r() * 8;
    }
  };
  layer(GROUND - 12, 150, C.city2, 0.45);
  layer(GROUND, 90, C.city, 0.8);
  g.fillStyle = '#05071a'; g.fillRect(0, GROUND, W, H - GROUND);
  const fg = g.createLinearGradient(0, GROUND, 0, H);
  fg.addColorStop(0, 'rgba(40,30,80,0.6)'); fg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = fg; g.fillRect(0, GROUND, W, H - GROUND);
}

// ---------- Taipei 101 ----------
// Parts as [h0, h1, halfWidth0, halfWidth1] in units of a 650-tall tower.
const HT = 650, GROUND = 752, SC_A = 0.92; // captions sit on the dark ground below the city
const PARTS = [[0, 90, 76, 70], [90, 200, 58, 52]];
for (let i = 0; i < 8; i++) PARTS.push([200 + 44 * i, 200 + 44 * (i + 1), 46, 60]);
PARTS.push([552, 600, 40, 28], [600, 650, 4.5, 1.2]);
const BALL_H = 530; // the damper sits in the top tier (floors 88–92)
function tower(cx, ground, sc, sway, rel, { ball = 1, glowBall = 0 } = {}) {
  const off = (h) => sway * Math.pow(h / HT, 1.5);
  const P = (h, dx) => [cx + (dx + off(h)) * sc, ground - h * sc];
  ctx.save();
  for (const [h0, h1, w0, w1] of PARTS) {
    const a = P(h0, -w0), b = P(h0, w0), c = P(h1, w1), d = P(h1, -w1);
    const gr = ctx.createLinearGradient(a[0], 0, b[0], 0);
    gr.addColorStop(0, C.glass2); gr.addColorStop(0.55, C.glass); gr.addColorStop(1, '#0a2a30');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.lineTo(...d); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(95,224,210,0.55)'; ctx.lineWidth = Math.max(1, 1.6 * sc); ctx.stroke();
    // window bands
    if (h1 - h0 > 20 && w0 > 10) {
      ctx.strokeStyle = 'rgba(127,231,220,0.18)'; ctx.lineWidth = Math.max(1, sc);
      for (let h = h0 + 8; h < h1 - 4; h += 9) { const l = P(h, -lerp(w0, w1, (h - h0) / (h1 - h0)) + 4), rr = P(h, lerp(w0, w1, (h - h0) / (h1 - h0)) - 4); ctx.beginPath(); ctx.moveTo(...l); ctx.lineTo(...rr); ctx.stroke(); }
    }
  }
  // the damper ball in the top tier
  if (ball > 0) A(ball, () => {
    const [bx, by] = P(BALL_H, rel), r = 13 * sc;
    const [px, py] = P(BALL_H + 18, 0);
    ctx.strokeStyle = 'rgba(255,241,184,0.7)'; ctx.lineWidth = Math.max(1, 1.5 * sc);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    goldBall(bx, by, r, 0.6 + glowBall);
  });
  ctx.restore();
}
function goldBall(x, y, r, glow = 1) {
  const gl = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.2);
  gl.addColorStop(0, `rgba(242,193,78,${0.45 * glow})`); gl.addColorStop(1, 'rgba(242,193,78,0)');
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, Math.PI * 2); ctx.fill();
  const bg2 = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  bg2.addColorStop(0, C.goldLight); bg2.addColorStop(0.45, C.gold); bg2.addColorStop(1, C.goldDeep);
  ctx.fillStyle = bg2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

// wind streaks blowing left to right
function wind(t, a, y0 = 200, y1 = 700, strength = 1) {
  if (a <= 0) return;
  A(a, () => {
    ctx.strokeStyle = C.wind; ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      const per = 1.6 + (i % 4) * 0.25, p = (((t + i * 0.53) / per) % 1 + 1) % 1;
      const y = y0 + ((i * 97) % (y1 - y0)), x = lerp(-120, W + 40, p), len = 60 + (i % 3) * 30;
      ctx.globalAlpha = a * Math.sin(Math.PI * p) * (0.4 + 0.6 * strength);
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + len / 2, y - 6, x + len, y); ctx.stroke();
    }
  });
}

// ---------- scene A: tower and magnifier ----------
function sceneA(t) {
  tower(470, GROUND, SC_A, 0, 0, { ball: 1, glowBall: 0.6 * (0.5 + 0.5 * Math.sin(t * 2)) });
  const m = eout(seg(t, 1.6, 2.6));
  A(m, () => {
    const cx = 200, cy = 330, R = 132;
    const [tx, ty] = [470, GROUND - BALL_H * SC_A];
    ctx.strokeStyle = 'rgba(255,241,184,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx + R * 0.86, cy - R * 0.5); ctx.lineTo(tx - 14, ty - 8); ctx.moveTo(cx + R * 0.86, cy + R * 0.5); ctx.lineTo(tx - 14, ty + 8); ctx.stroke();
    ctx.beginPath(); ctx.arc(tx, ty, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#0b2226'; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    // floors 92 .. 88
    ctx.strokeStyle = 'rgba(127,231,220,0.35)'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) { const y = cy - R + 30 + i * 52; ctx.beginPath(); ctx.moveTo(cx - R, y); ctx.lineTo(cx + R, y); ctx.stroke(); }
    const sw = Math.sin(t * 1.4) * 6;
    ctx.strokeStyle = 'rgba(255,241,184,0.85)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 30, cy - R + 30); ctx.lineTo(cx - 30 + sw, cy + 10); ctx.moveTo(cx + 30, cy - R + 30); ctx.lineTo(cx + 30 + sw, cy + 10); ctx.stroke();
    goldBall(cx + sw, cy + 46, 50, 1);
    ctx.restore();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    font(600, 22, NUM); text('FLOORS 88–92', cx, cy + R + 30, { color: C.gold, align: 'center', base: 'middle', spacing: '2px' });
  });
  A(span(t, 3.0, 9.2, 0.5, 0.4), () => {
    font(600, 64, NUM); text('660 t', 660, 380, { color: C.gold, align: 'left', base: 'middle' });
    font(500, 24); text('steel ball,', 660, 430, { color: C.inkSoft, base: 'middle' });
    text('5.5 m across', 660, 460, { color: C.inkSoft, base: 'middle' });
  });
}

// ---------- scene B: the sway without the ball ----------
const SW_PX = 38; // tower-top offset in px for x1 = PEAK of the free run in scene B
const PEAK_B = peakUpTo(RUN_B, 0, 15);
function sceneB(t) {
  const [x1] = sample(RUN_B, B0, t);
  const sway = (x1 / PEAK_B) * SW_PX;
  tower(300, GROUND, SC_A, sway / SC_A, 0, { ball: 0 });
  wind(t, seg(t, 9.6, 10.6), 180, 720, 0.6 + 0.4 * Math.abs(gust(Math.max(0, t - B0))));
  // trace: the top's sway over the last 6 s
  const X0 = 520, X1 = 820, YC = 430, AMP = 120;
  A(seg(t, 10.0, 10.8), () => {
    ctx.fillStyle = 'rgba(5,8,23,0.6)'; k.rrect(X0 - 16, YC - AMP - 56, X1 - X0 + 32, 2 * AMP + 96, 16); ctx.fill();
    font(500, 22, NUM); text('SWAY AT THE TOP', X0, YC - AMP - 26, { color: C.inkSoft, base: 'middle', spacing: '2px' });
    ctx.strokeStyle = 'rgba(243,241,255,0.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X0, YC); ctx.lineTo(X1, YC); ctx.stroke();
    ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath();
    const span6 = 6;
    for (let i = 0; i <= 150; i++) {
      const tt = t - span6 + (i / 150) * span6;
      if (tt < B0) continue;
      const v = sample(RUN_B, B0, tt)[0] / PEAK_B;
      const x = lerp(X0, X1, i / 150), y = YC - v * AMP * 0.9;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    font(500, 20, NUM); text('time →', X1, YC + AMP + 20, { color: C.inkSoft, align: 'right', base: 'middle' });
  });
  A(span(t, 19.8, 24.4, 0.5, 0.4), () => {
    font(500, 22); text('exaggerated, sped up', 300, 150, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- scene C: close-up of the pendulum ----------
function sceneC(t) {
  const w = W1 * 0.85; // a calm, slow sway for the close-up
  const tt = t - 24.4;
  const amp = eio(seg(t, 25.0, 26.6));
  const xb = 26 * amp * Math.sin(w * tt); // the building
  const xr = -54 * amp * Math.cos(w * tt) * seg(t, 25.6, 27.4); // the ball lags 90° behind
  const vb = Math.cos(w * tt) * amp; // building velocity (sign)
  const L = 270, px = 432 + xb, py = 196;
  // frame: floors 92 to 88 and columns, moving with the building
  ctx.save(); ctx.translate(xb, 0);
  ctx.fillStyle = 'rgba(11,34,38,0.92)'; k.rrect(170, 150, 524, 540, 18); ctx.fill();
  ctx.strokeStyle = 'rgba(95,224,210,0.6)'; ctx.lineWidth = 3; k.rrect(170, 150, 524, 540, 18); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const y = 196 + i * 116;
    ctx.fillStyle = 'rgba(127,231,220,0.22)'; ctx.fillRect(176, y - 5, 512, 10);
    font(600, 22, NUM); text(String(92 - i), 196, y - 22, { color: C.inkSoft, base: 'middle' });
  }
  ctx.fillStyle = 'rgba(127,231,220,0.3)'; ctx.fillRect(176, 150, 10, 540); ctx.fillRect(678, 150, 10, 540);
  ctx.restore();
  // cables and ball
  const ang = Math.asin(clamp(xr / L, -0.5, 0.5));
  const bx = px + L * Math.sin(ang), by = py + L * Math.cos(ang);
  ctx.strokeStyle = 'rgba(255,241,184,0.85)'; ctx.lineWidth = 4;
  for (const d of [-36, 36]) { ctx.beginPath(); ctx.moveTo(px + d, py); ctx.lineTo(bx + d * 0.6, by - 80); ctx.stroke(); }
  // dampers from the ball down to the floor (shown in scene C's last caption)
  A(seg(t, 35.0, 35.8), () => {
    for (const s of [-1, 1]) {
      const fx = px + s * 190, fy = 660, ax = bx + s * 60, ay = by + 60;
      ctx.strokeStyle = '#8a97a8'; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(lerp(fx, ax, 0.55), lerp(fy, ay, 0.55)); ctx.stroke();
      ctx.strokeStyle = '#d4dbe4'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(lerp(fx, ax, 0.45), lerp(fy, ay, 0.45)); ctx.lineTo(ax, ay); ctx.stroke();
      // a heat shimmer on the cylinders
      const h = Math.abs(Math.sin(w * tt)) * seg(t, 35.4, 36.4);
      ctx.fillStyle = `rgba(255,123,107,${0.55 * h})`; ctx.beginPath(); ctx.arc(lerp(fx, ax, 0.3), lerp(fy, ay, 0.3), 14, 0, Math.PI * 2); ctx.fill();
    }
  });
  goldBall(bx, by, 96, 1);
  font(600, 34, NUM); text('660 t', bx, by + 4, { color: '#5a3a06', align: 'center', base: 'middle' });
  // arrows: the building's motion and the ball's pull
  A(span(t, 30.4, 39.8, 0.4, 0.4), () => {
    const dir = Math.sign(vb) || 1, mag = Math.abs(vb);
    arrow(432 + xb, 128, dir * 70 * mag, C.edge, 'tower moves');
    A(seg(t, 35.0, 35.6), () => arrow(bx, by + 150, -dir * 70 * mag, C.gold, 'ball pulls back'));
  });
}
function arrow(x, y, dx, color, label) {
  if (Math.abs(dx) < 4) return;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - dx / 2, y); ctx.lineTo(x + dx / 2, y); ctx.stroke();
  const s = Math.sign(dx);
  ctx.beginPath(); ctx.moveTo(x + dx / 2 + s * 14, y); ctx.lineTo(x + dx / 2 - s * 4, y - 10); ctx.lineTo(x + dx / 2 - s * 4, y + 10); ctx.closePath(); ctx.fill();
  font(600, 22, NUM); text(label.toUpperCase(), x, y - 24, { color, align: 'center', base: 'middle', spacing: '1px' });
}

// ---------- scene D: side by side ----------
const D_SC = 0.8, D_PX = 32; // tower-top offset in px for the free tower's peak
function sceneD(t) {
  const [xf] = sample(RUN_FREE, D0, t), [xt, rel] = sample(RUN_TMD, D0, t);
  const sc = (x) => (x / PEAK_FREE) * D_PX / D_SC;
  const relPx = (rel / REL_MAX) * 30;
  const pf = peakUpTo(RUN_FREE, D0, t), pt = peakUpTo(RUN_TMD, D0, t);
  const towers = [[230, xf, 0, 'NO DAMPER', pf, C.red], [634, xt, relPx, 'WITH DAMPER', pt, C.gold]];
  for (const [cx, x, r, label, peak, col] of towers) {
    tower(cx, GROUND, D_SC, sc(x), r, { ball: label === 'WITH DAMPER' ? 1 : 0, glowBall: 0.5 });
    // the widest sway so far, marked at the top
    const top = GROUND - HT * D_SC, half = (peak / PEAK_FREE) * D_PX;
    A(seg(t, 41.2, 42.0), () => {
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * half, top - 30); ctx.lineTo(cx + s * half, top - 6); ctx.stroke(); }
      ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx - half, top - 18); ctx.lineTo(cx + half, top - 18); ctx.stroke(); ctx.setLineDash([]);
    });
    font(600, 26, NUM); text(label, cx, 170, { color: col, align: 'center', base: 'middle', spacing: '2px' });
  }
  wind(t, seg(t, 40.6, 41.4), 200, 720, 0.6 + 0.4 * Math.abs(gust(Math.max(0, t - D0))));
  A(span(t, 41.2, 55.0, 0.5, 0.4), () => {
    font(500, 22); text('widest sway so far', W / 2, 212, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
  A(span(t, 49.8, 55.0, 0.5, 0.4), () => {
    ctx.fillStyle = 'rgba(5,8,23,0.8)'; k.rrect(282, 420, 300, 130, 18); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; k.rrect(282, 420, 300, 130, 18); ctx.stroke();
    font(600, 64, NUM); text('up to 40%', W / 2, 474, { color: C.gold, align: 'center', base: 'middle' });
    font(500, 22); text('less movement (Taipei 101)', W / 2, 522, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- scene E: Soudelor and the end card ----------
function sceneE(t) {
  const tt = t - 54.8;
  const amp = eio(seg(t, 55.2, 56.4)) * (1 - seg(t, 60.0, 60.8));
  const L = 300, px = 432, py = 150;
  const m = 192 / 5.5; // one metre at the scale of a 5.5 m ball drawn 192 px across
  const ang = Math.asin(m / L) * amp * Math.sin(tt * 2.1); // a swing of 1 m either side

  const bx = px + L * Math.sin(ang), by = py + L * Math.cos(ang);
  A(1 - seg(t, 60.2, 60.8), () => {
    ctx.strokeStyle = 'rgba(255,241,184,0.85)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by - 90); ctx.stroke();
    goldBall(bx, by, 96, 1);
    // the 1 m mark, from the ball's resting centre
    A(seg(t, 56.0, 56.8), () => {
      const y = 600;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(432, y); ctx.lineTo(432 + m, y); ctx.stroke();
      for (const x of [432, 432 + m]) { ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 12); ctx.stroke(); }
      font(600, 30, NUM); text('1 m', 432 + m / 2, y + 36, { color: C.gold, align: 'center', base: 'middle' });
      font(500, 22); text('to scale with the 5.5 m ball', 432 + m / 2, y + 70, { color: C.inkSoft, align: 'center', base: 'middle' });
      wind(t, 1, 160, 560, 1);
    });
  });
  A(seg(t, 60.4, 61.2), () => {
    goldBall(W / 2, 300, 70, 1);
    font(600, 60, NUM); text('A 660-TONNE PENDULUM', W / 2, 460, { color: C.gold, align: 'center', base: 'middle', spacing: '1px' });
    font(500, 32); text('that visitors can watch from the 88th floor up', W / 2, 520, { color: C.ink, align: 'center', base: 'middle' });
    font(400, 21);
    text('Sources: Wikipedia, “Taipei 101”; Guinness World Records', W / 2, 860, { color: 'rgba(243,241,255,0.6)', align: 'center', base: 'middle' });
    text('Sway: a two-oscillator model, exaggerated and sped up', W / 2, 890, { color: 'rgba(243,241,255,0.6)', align: 'center', base: 'middle' });
  });
}

function header(a) {
  A(a, () => {
    font(600, 22, NUM); text('RECKON', 48, 72, { color: C.gold, spacing: '3px' });
    const w = ctx.measureText('RECKON').width + 18;
    font(500, 22, NUM); text('ENGINEERING · DIAGRAM', 48 + w + 16, 72, { color: C.inkSoft, spacing: '2px' });
  });
}

// ---------- draw ----------
function draw(t) {
  if (!bg) paintBg();
  ctx.drawImage(bg, 0, 0);
  header(eout(seg(t, 0.1, 1.0)));
  const scenes = [[sceneA, T.A, 0.6], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.4, 0]];
  for (const [fn, [a, b], fi = 0.4, fo = 0.4] of scenes) {
    if (t < a || t > b) continue;
    A(span(t, a, b, fi, fo), () => fn(t));
  }
  captions(t);
}

// Captions with balanced lines.
const CAP = { size: 46, lh: 58, weight: 500, maxW: 760 };
const capW = new Map();
function balanced(s) {
  if (capW.has(s)) return capW.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (m) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > m && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capW.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 846, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: F, ink: C.ink, marks: { '*': C.gold, '~': C.red } });
  }
}

Kit.scene({
  width: W, height: H, duration: 63,
  fonts: [
    { family: F, file: 'Jost.woff2', weight: '100 900' },
    { family: NUM, file: 'Oswald.woff2', weight: '200 700' },
  ],
  draw(t, tools) { k = tools; ctx = tools.ctx; draw(t); },
});
