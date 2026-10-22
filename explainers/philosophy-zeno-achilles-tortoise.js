// Explainer for philosophy-zeno-achilles-tortoise: infinitely many catch-up steps, a finite time.
// Look: white marble with soft grey veins, laurel green and Greek-pottery terracotta, a minimalist
// Greek key border top and bottom. Cinzel for headings and numbers, Jost for captions.
//
// Scene plan (62.4 s). Captions centred at y = 830; key elements above y = 770.
//  A  0.0–15.6  Hook. Achilles and the tortoise on a marble track, a 100 m head start, and the
//               example's speeds (Achilles 10 m/s, the tortoise 1 m/s). Zeno says he never catches it.
//  B 15.3–35.9  Zeno's steps. Achilles runs to where the tortoise was; it has crept on. Then the
//               view zooms in 10× about the meeting point, and the picture is the same again:
//               100 m, 10 m, 1 m, 10 cm… The zoom speeds up as the steps pile up (step counter).
//  C 35.6–48.4  The sum. A ledger of the step times (10 s, 1 s, 0.1 s…) and a time bar that fills
//               towards a dashed line at 11.1 s: 10 + 1 + 0.1 + … = 10 / (1 − 0.1).
//  C2 48.1–52.9 Replay at constant speed with a clock: they draw level at 111.1 m after 11.1 s.
//  D 52.6–62.4  Payoff in a laurel wreath, and the hedge: limits are one common answer; some
//               philosophers say mathematics doesn't settle every issue Zeno raised.
//
// Facts (Wikipedia, "Zeno's paradoxes"): Zeno of Elea, c. 490–430 BC; Aristotle, Physics VI:9,
// "the quickest runner can never overtake the slowest, since the pursuer must first reach the
// point whence the pursued started"; the article's example uses a 100 m head start. "Some
// mathematicians and historians, such as Carl Benjamin Boyer" hold that calculus provides a
// mathematical solution; limits (Cauchy, Weierstrass) "resolved the mathematics involving infinite
// processes"; "Some philosophers, however" (Kevin Brown, Francis Moorcroft) hold that solving the
// mathematical issues "does not solve every issue the paradoxes raise". The speeds (10 m/s and
// 1 m/s) are this animation's example; every distance, time and sum below is computed from them.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  marble: '#F3F0EA', marbleIn: '#FBFAF6', marbleOut: '#E2DED4',
  ink: '#25282B', soft: 'rgba(37,40,43,0.66)', faint: 'rgba(37,40,43,0.28)',
  laurel: '#3A6630', laurelDeep: '#284A22', laurelLight: '#8FAE78', leaf: '#55804A',
  terra: '#A3401F', terraLight: '#D9825C', terraSoft: 'rgba(163,64,31,0.16)',
};
const DISPLAY = 'Cinzel', TEXT = 'Jost';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- the race, computed ----------
const HEAD = 100, VA = 10, VT = 1, R = VT / VA; // head start (m), speeds (m/s), ratio
const MEET = HEAD / (1 - R);                       // 111.11 m: where they draw level
const T_MEET = MEET / VA;                          // 11.11 s
const A_N = (n) => MEET * (1 - Math.pow(R, n));    // Achilles after n steps: 0, 100, 110, 111…
const STEP_TIME = (n) => (HEAD / VA) * Math.pow(R, n - 1); // 10 s, 1 s, 0.1 s…
const tortoiseAt = (achilles) => HEAD + achilles * R;      // they run at the same time
function dist(m) {
  if (m >= 1) return `${+m.toPrecision(3)} m`;
  if (m >= 0.01) return `${+(m * 100).toPrecision(3)} cm`;
  if (m >= 0.001) return `${+(m * 1000).toPrecision(3)} mm`;
  if (m >= 1e-4) return `${+(m * 1000).toPrecision(2)} mm`;
  return `${+(m * 1e6).toPrecision(3)} µm`;
}
const secs = (s) => `${+s.toPrecision(3)} s`;

// ---------- screen mapping: a zoom about the meeting point ----------
const TY = 600, PL = 150, PR = 640, FIG = 1.35, S0 = (PR - PL) / HEAD; // track y, Achilles/tortoise start px
const PSTAR = PL + MEET * S0;
const px = (m, z) => PSTAR + (m - MEET) * S0 * Math.pow(10, z);

// ---------- timeline ----------
const T = { A: [0, 15.6], B: [15.3, 35.9], C: [35.6, 48.4], C2: [48.1, 52.9], D: [52.6, 62.4] };
const CUES = [
  [0.4, 4.3, '*Achilles*, the fastest runner, races a ~tortoise~.'],
  [4.4, 7.8, 'The ~tortoise~ gets a 100 metre head start.'],
  [7.9, 11.6, 'Say Achilles runs *10 times* as fast as it.'],
  [11.7, 15.6, 'Zeno argued that he can *never* catch it. Why?'],
  [15.7, 19.8, 'First, Achilles must reach the spot where the tortoise *was*.'],
  [19.9, 23.6, 'By then, it has crept ~10 metres~ further on.'],
  [23.7, 28.0, 'He runs those 10 metres. It has moved ~1 metre~ on.'],
  [28.1, 32.4, 'Then 10 cm, then 1 cm. Each gap leaves *another gap*.'],
  [32.5, 36.0, 'Infinitely many steps. Does that take ~forever~?'],
  [36.1, 40.4, 'Time the steps: *10 s*, then *1 s*, then *0.1 s*…'],
  [40.5, 44.6, 'Each step takes a tenth as long as the last.'],
  [44.7, 48.6, `Infinitely many steps add up to just ~${secs(T_MEET)}~.`],
  [48.7, 52.8, `At *${MEET.toFixed(1)} metres*, Achilles draws level, then passes.`],
  [52.9, 57.2, 'A common answer uses *limits*: an infinite sum can be finite.'],
  [57.3, 61.8, 'Some philosophers say maths doesn’t settle ~all~ that Zeno raised.'],
];

// Step schedule for scene B: [runStart, runEnd, zoomStart, zoomEnd] for step n = 1, 2, …
const STEPS = [[16.4, 19.4, 21.6, 23.4], [23.8, 25.4, 26.0, 27.4], [27.8, 28.9, 29.1, 30.1], [30.3, 31.0, 31.1, 31.7]];
{
  let t0 = 31.8, d = 0.5;
  while (t0 + 2 * d < 35.3) { STEPS.push([t0, t0 + d, t0 + d * 1.05, t0 + d * 1.95]); t0 += d * 2.05; d *= 0.82; }
}
const FLAG_AT = 15.6;

/** Achilles' position (m), the zoom level and whether he is running, at time t in scene B. */
function raceState(t) {
  let a = 0, z = 0, amp = 0, n = 0, phase = 0;
  for (let i = 0; i < STEPS.length; i++) {
    const [r0, r1, z0, z1] = STEPS[i];
    if (t < r0) break;
    n = i + 1;
    const p = seg(t, r0, r1);
    a = lerp(A_N(i), A_N(i + 1), i === 0 ? eio(p) : p);
    amp = clamp(Math.min(p, 1 - p) * (i === 0 ? 6 : 4));
    phase = (i === 0 ? eio(p) : p) * (i === 0 ? 5.5 : 3) * TAU;
    z = i + eio(seg(t, z0, z1));
  }
  return { a, z, amp, n, phase };
}

// ---------- seeded randomness ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), a | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- background: marble, veins, Greek key bands ----------
let bg = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(W * 0.45, H * 0.38, 60, W / 2, H / 2, 820);
  rad.addColorStop(0, C.marbleIn); rad.addColorStop(0.55, C.marble); rad.addColorStop(1, C.marbleOut);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const r = rng(11);
  // soft cloudy patches
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = r() * H, rr = 80 + r() * 220;
    const cg = g.createRadialGradient(x, y, 0, x, y, rr);
    cg.addColorStop(0, `rgba(170,166,154,${0.035 + r() * 0.04})`); cg.addColorStop(1, 'rgba(170,166,154,0)');
    g.fillStyle = cg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  // veins: wandering diagonal strokes, a blurred halo and a crisp core
  for (let i = 0; i < 11; i++) {
    let x = -60 + r() * (W + 120), y = -40;
    const pts = [[x, y]];
    let dir = 1.05 + (r() - 0.5) * 0.7;
    while (y < H + 40 && x > -100 && x < W + 100) {
      dir += (r() - 0.5) * 0.5;
      dir = clamp(dir, 0.55, 2.3);
      x += Math.cos(dir) * 26; y += Math.sin(dir) * 26;
      pts.push([x, y]);
    }
    const lw = 0.8 + r() * 2.4, a = 0.09 + r() * 0.12;
    for (const [blur, w, al] of [[6, lw * 5, a * 0.35], [0, lw, a]]) {
      g.save(); g.filter = blur ? `blur(${blur}px)` : 'none';
      g.strokeStyle = `rgba(105,103,96,${al})`; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); pts.forEach(([px1, py1], j) => (j ? g.lineTo(px1, py1) : g.moveTo(px1, py1))); g.stroke();
      g.restore();
    }
  }
  meander(g, 126, 30);
  meander(g, 916, 30);
  g.font = `700 22px ${DISPLAY}`; g.fillStyle = C.laurelDeep; g.textBaseline = 'alphabetic'; g.letterSpacing = '3px';
  g.fillText('RECKON', 64, 86);
  const w = g.measureText('RECKON').width;
  g.font = `500 22px ${TEXT}`; g.fillStyle = C.soft; g.letterSpacing = '2px';
  g.fillText('PHILOSOPHY · PARADOX', 64 + w + 22, 86);
  g.letterSpacing = '0px';
}

/** A Greek key (meander) band: hooked frets standing on a base line, between two rules. */
function meander(g, y, h) {
  const u = h / 4, unit = u * 5, x0 = 40, x1 = W - 40;
  g.save();
  g.strokeStyle = C.laurel; g.globalAlpha = 0.78; g.lineWidth = u * 0.62; g.lineJoin = 'miter'; g.lineCap = 'square';
  g.beginPath(); g.moveTo(x0, y - u * 0.9); g.lineTo(x1, y - u * 0.9); g.stroke();
  g.beginPath(); g.moveTo(x0, y + h + u * 0.9); g.lineTo(x1, y + h + u * 0.9); g.stroke();
  const n = Math.floor((x1 - x0) / unit), start = x0 + ((x1 - x0) - n * unit) / 2;
  g.beginPath();
  g.moveTo(start, y + h);
  for (let i = 0; i < n; i++) {
    const x = start + i * unit;
    g.lineTo(x, y); g.lineTo(x + u * 4, y); g.lineTo(x + u * 4, y + u * 3); g.lineTo(x + u * 2, y + u * 3);
    g.lineTo(x + u * 2, y + u * 1.6); g.moveTo(x, y + h); g.lineTo(x + unit, y + h);
  }
  g.stroke();
  g.restore();
}

function background() {
  if (!bg) paintBackground();
  ctx.drawImage(bg, 0, 0);
}

// ---------- figures ----------
/** Achilles: a running figure of simple strokes with a crested helmet, facing right. */
function runner(x, yb, phase, amp, alpha = 1) {
  withAlpha(alpha, () => {
    ctx.save();
    ctx.translate(x, yb); ctx.scale(FIG, FIG);
    ctx.strokeStyle = C.laurel; ctx.fillStyle = C.laurel; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const bob = amp * Math.abs(Math.sin(phase)) * 4;
    const hip = [0, -48 - bob], sh = [7 + amp * 4, -82 - bob], head = [12 + amp * 5, -99 - bob];
    const limb = (from, a1, a2, l1, l2, w) => {
      const kx = from[0] + Math.sin(a1) * l1, ky = from[1] + Math.cos(a1) * l1;
      const fx = kx + Math.sin(a2) * l2, fy = ky + Math.cos(a2) * l2;
      ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    };
    for (const s of [Math.PI, 0]) {
      const p = phase + s;
      const th = amp * 0.75 * Math.sin(p);
      const bend = amp * (0.35 + 0.75 * Math.max(0, -Math.cos(p)));
      ctx.globalAlpha = s ? 0.55 : 1;
      limb(hip, th, th - bend, 25, 25, 9);
      const ar = -amp * 0.85 * Math.sin(p);
      limb(sh, ar, ar + 1.3 * amp + 0.15, 18, 16, 7);
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(sh[0], sh[1]); ctx.stroke();
    ctx.beginPath(); ctx.arc(head[0], head[1], 12, 0, TAU); ctx.fill();
    // helmet crest
    ctx.strokeStyle = C.terra; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(head[0] + 6, head[1] - 12); ctx.quadraticCurveTo(head[0] - 6, head[1] - 26, head[0] - 22, head[1] - 10 + amp * 3 * Math.sin(phase * 2)); ctx.stroke();
    ctx.restore();
  });
}

/** The tortoise: a domed shell, little legs that paddle, facing right. */
function tortoise(x, yb, phase, amp, alpha = 1) {
  withAlpha(alpha, () => {
    ctx.save();
    ctx.translate(x, yb); ctx.scale(FIG, FIG);
    ctx.fillStyle = C.terra;
    for (let i = 0; i < 4; i++) {
      const lx = -22 + i * 14, off = amp * 3 * Math.sin(phase + i * Math.PI / 2);
      k.rrect(lx - 5 + off, -10, 10, 12, 4); ctx.fill();
    }
    ctx.beginPath(); ctx.moveTo(26, -10); ctx.quadraticCurveTo(36, -24, 42, -18); ctx.lineTo(40, -9); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(44, -17, 8, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-30, -8); ctx.lineTo(-40, -5); ctx.lineTo(-30, -3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -8, 34, 28, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.terraLight; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(0, -8, 34, 28, 0, Math.PI, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-32, -8); ctx.lineTo(32, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, -8); ctx.lineTo(-8, -22); ctx.lineTo(8, -22); ctx.lineTo(12, -8);
    ctx.moveTo(-8, -22); ctx.lineTo(-18, -30); ctx.moveTo(8, -22); ctx.lineTo(18, -30); ctx.stroke();
    ctx.fillStyle = C.marbleIn; ctx.beginPath(); ctx.arc(47, -19, 1.8, 0, TAU); ctx.fill();
    ctx.restore();
  });
}

function flag(x, yb, alpha) {
  withAlpha(alpha, () => {
    ctx.strokeStyle = C.terra; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, yb); ctx.lineTo(x, yb - 74); ctx.stroke();
    ctx.fillStyle = C.terraLight;
    ctx.beginPath(); ctx.moveTo(x, yb - 74); ctx.lineTo(x + 26, yb - 66); ctx.lineTo(x, yb - 58); ctx.closePath(); ctx.fill();
  });
}

/** A bracket above the track between two pixels, with a label. */
function bracket(x0, x1, y, label, alpha, color = C.ink) {
  if (x1 - x0 < 4) return;
  withAlpha(alpha, () => {
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y + 14); ctx.lineTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1, y + 14); ctx.stroke();
    font(600, 30); text(label, (x0 + x1) / 2, y - 14, { align: 'center', color });
  });
}

/** Track line with ruler ticks that follow the zoom (finer ticks fade in as we magnify). */
function track(z, alpha) {
  withAlpha(alpha, () => {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(40, TY); ctx.lineTo(W - 40, TY); ctx.stroke();
    const zi = Math.floor(z), fr = z - zi;
    const mAt = (p) => MEET + (p - PSTAR) / (S0 * Math.pow(10, z));
    for (const [lvl, a, len] of [[zi, 1, 16], [zi + 1, fr, 9]]) {
      if (a <= 0.01) continue;
      const step = Math.pow(10, 1 - lvl);
      const m0 = Math.ceil(mAt(40) / step), m1 = Math.floor(mAt(W - 40) / step);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.globalAlpha = alpha * a;
      ctx.beginPath();
      for (let i = m0; i <= m1; i++) { const p = px(i * step, z); ctx.moveTo(p, TY); ctx.lineTo(p, TY + len); }
      ctx.stroke();
    }
  });
}

function nameTags(xa, xt, alpha) {
  withAlpha(alpha, () => {
    font(600, 24); ctx.letterSpacing = '2px';
    text('ACHILLES', xa, TY + 52, { align: 'center', color: C.laurelDeep, spacing: '2px' });
    text('TORTOISE', xt + 4, TY + 52, { align: 'center', color: C.terra, spacing: '2px' });
  });
}

function heading(s, sub, y, alpha) {
  withAlpha(alpha, () => {
    font(700, 44, DISPLAY); text(s, W / 2, y, { align: 'center', color: C.laurelDeep, spacing: '2px' });
    if (sub) { font(400, 28); text(sub, W / 2, y + 48, { align: 'center', color: C.soft }); }
  });
}

// ---------- scenes ----------
function sceneA(t) {
  heading('ACHILLES AND THE TORTOISE', 'a paradox of Zeno of Elea, c. 490–430 BC', 262, span(t, 0.2, 99, 0.8));
  const on = eout(seg(t, 0.3, 1.4));
  track(0, on);
  runner(PL, TY - 4, 0, 0, on);
  tortoise(PR, TY - 4, t * 3, 0.4, eout(seg(t, 0.8, 1.9)));
  nameTags(PL, PR, eout(seg(t, 1.2, 2.2)));
  bracket(PL, PR, TY - 215, `${HEAD} m head start`, eout(seg(t, 4.6, 5.3)));
  withAlpha(eout(seg(t, 8.1, 8.8)), () => {
    pill(PL, TY + 98, `${VA} m/s`, C.laurel);
    pill(PR + 4, TY + 98, `${VT} m/s`, C.terra);
  });
}

function pill(x, y, s, color) {
  font(600, 26); const w = ctx.measureText(s).width + 26;
  ctx.fillStyle = color; k.rrect(x - w / 2, y - 19, w, 38, 19); ctx.fill();
  text(s, x, y + 1, { align: 'center', base: 'middle', color: C.marbleIn });
}

function sceneB(t) {
  const st = raceState(t);
  const z = st.z;
  const xa = px(st.a, z), tm = tortoiseAt(st.a), xt = px(tm, z);
  track(z, 1);
  // a flag at the spot the tortoise held when each of the first steps began
  for (let j = 1; j <= 4; j++) {
    const from = j === 1 ? FLAG_AT : STEPS[j - 2][3], z0j = STEPS[j - 1][2];
    flag(px(A_N(j), z), TY - 2, seg(t, from, from + 0.4) * (1 - seg(t, z0j - 0.4, z0j)));
  }
  const i = Math.max(0, st.n - 1);
  const [, r1, z0] = STEPS[i];
  runner(xa, TY - 4, st.phase, st.amp);
  tortoise(xt, TY - 4, t * 6, 0.3 + 0.7 * st.amp);
  nameTags(xa, xt, 1 - seg(t, 16.6, 17.3));
  // the gap after each of the first steps
  const gap = HEAD * Math.pow(R, st.n);
  if (st.n >= 1 && st.n <= 4) bracket(xa, xt, TY - 215, dist(gap), seg(t, r1 + 0.1, r1 + 0.4) * (1 - seg(t, z0 + 0.2, z0 + 0.5)));
  if (st.n === 0) bracket(xa, xt, TY - 215, `${HEAD} m head start`, 1 - seg(t, 16.0, 16.4));
  // the live gap between them
  withAlpha(seg(t, 16.8, 17.5), () => {
    font(500, 28); text('gap', W / 2, TY + 74, { align: 'center', color: C.soft });
    font(700, 56); text(dist(tm - st.a), W / 2, TY + 134, { align: 'center', color: C.terra });
  });
  // step counter and magnification
  withAlpha(seg(t, 15.4, 16.0), () => {
    font(700, 64, DISPLAY);
    text(`STEP ${Math.max(1, st.n)}`, W / 2, 268, { align: 'center', color: C.laurelDeep, spacing: '3px' });
    font(400, 28);
    const mag = Math.pow(10, Math.round(z * 100) / 100);
    const label = z < 0.02 ? 'actual size' : `magnified ×${mag < 10 ? mag.toFixed(1) : Kit.fmt(mag)}`;
    text(label, W / 2, 318, { align: 'center', color: C.soft });
  });
}

const LEDGER_N = 5;
function sceneC(t) {
  heading('THE TIME FOR EACH STEP', null, 236, 1);
  // rows: step, distance, time, a bar for the time
  for (let i = 0; i < LEDGER_N; i++) {
    const a = eout(seg(t, 35.9 + i * 0.7, 36.5 + i * 0.7));
    const y = 300 + i * 46;
    withAlpha(a, () => {
      font(500, 28);
      text(`Step ${i + 1}`, 92, y, { color: C.soft });
      text(dist(HEAD * Math.pow(R, i)), 300, y, { align: 'right', color: C.ink });
      font(700, 30);
      text(secs(STEP_TIME(i + 1)), 470, y, { align: 'right', color: C.laurelDeep });
      ctx.fillStyle = C.laurelLight;
      const bw = Math.max(1.5, (STEP_TIME(i + 1) / STEP_TIME(1)) * 280 * eout(seg(t, 36.0 + i * 0.7, 36.8 + i * 0.7)));
      k.rrect(500, y - 20, bw, 16, 3); ctx.fill();
    });
  }
  withAlpha(seg(t, 39.6, 40.2), () => { font(500, 30); text('…', 92, 300 + LEDGER_N * 46 - 10, { color: C.soft }); });
  // the time bar
  const X0 = 92, X1 = 772, SMAX = 12, sx = (s) => X0 + (s / SMAX) * (X1 - X0), BY = 684;
  withAlpha(seg(t, 36.0, 36.6), () => {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(X0, BY + 28); ctx.lineTo(X1, BY + 28); ctx.stroke();
    font(500, 24);
    for (let s = 0; s <= SMAX; s += 2) {
      ctx.beginPath(); ctx.moveTo(sx(s), BY + 28); ctx.lineTo(sx(s), BY + 38); ctx.stroke();
      text(`${s} s`, sx(s), BY + 66, { align: 'center', color: C.soft });
    }
  });
  // segments fill in turn; each one is a tenth of the last
  const fill = (n) => clamp((t - 36.4 - n * 1.25) / 1.1);
  let sum = 0, shown = 0;
  for (let n = 0; n < 14; n++) {
    const d = STEP_TIME(n + 1), f = eio(fill(n));
    if (f <= 0) break;
    ctx.fillStyle = n % 2 ? C.leaf : C.laurelDeep;
    ctx.fillRect(sx(sum), BY - 8, Math.max(0.6, sx(sum + d * f) - sx(sum)), 32);
    sum += d * f; shown = n + 1;
  }
  // running total and the closed form
  withAlpha(seg(t, 36.4, 36.9), () => {
    font(600, 30);
    text(`running total: ${sum.toFixed(shown > 4 ? 6 : 3)} s`, X0, BY - 40, { color: C.ink });
  });
  withAlpha(eout(seg(t, 44.1, 44.8)), () => {
    ctx.strokeStyle = C.terra; ctx.lineWidth = 3; ctx.setLineDash([8, 7]);
    ctx.beginPath(); ctx.moveTo(sx(T_MEET), BY - 24); ctx.lineTo(sx(T_MEET), BY + 40); ctx.stroke(); ctx.setLineDash([]);
    font(700, 28); text(secs(T_MEET), sx(T_MEET) + 12, BY - 40, { color: C.terra });
    font(600, 34);
    text(`10 + 1 + 0.1 + 0.01 + … = ${T_MEET.toFixed(3)}… s`, W / 2, 576, { align: 'center', color: C.laurelDeep });
  });
}

function sceneC2(t) {
  heading('THE WHOLE RACE', null, 236, 1);
  const tau = Math.min(13, Math.max(0, (t - 48.7) * 3.9));
  const a = VA * tau, tm = HEAD + VT * tau;
  track(0, 1);
  const metM = eout(seg(tau, T_MEET, T_MEET + 0.6));
  withAlpha(metM, () => {
    const x = px(MEET, 0);
    ctx.strokeStyle = C.terra; ctx.lineWidth = 3; ctx.setLineDash([7, 6]);
    ctx.beginPath(); ctx.moveTo(x, TY + 20); ctx.lineTo(x, TY - 200); ctx.stroke(); ctx.setLineDash([]);
    font(700, 30); text(`${MEET.toFixed(1)} m`, x, TY - 214, { align: 'center', color: C.terra });
  });
  const amp = clamp(tau / 0.5) * clamp((13 - tau) / 0.8);
  runner(px(a, 0), TY - 4, a * 0.42, amp);
  tortoise(px(tm, 0), TY - 4, tau * 4, amp);
  nameTags(px(a, 0), px(tm, 0), 1 - seg(tau, 6.2, 7.2));
  font(700, 68);
  const shownT = tau >= T_MEET && tau < T_MEET + 1.6 ? T_MEET : tau;
  text(`${shownT.toFixed(1)} s`, W / 2, 330, { align: 'center', color: tau >= T_MEET ? C.terra : C.ink });
}

function laurelWreath(cx, cy, r, prog) {
  const leaves = 15;
  for (const side of [-1, 1]) {
    for (let i = 0; i < leaves; i++) {
      const f = i / (leaves - 1);
      const a = eout(seg(prog, f * 0.8, f * 0.8 + 0.2));
      if (a <= 0) continue;
      const ang = Math.PI / 2 + side * (0.35 + f * 2.35); // from the bottom up each side
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      const tang = ang + side * Math.PI / 2;
      for (const o of [-0.55, 0.55]) {
        ctx.save();
        ctx.translate(x, y); ctx.rotate(tang + o * side + (side < 0 ? Math.PI : 0)); ctx.globalAlpha *= a;
        ctx.fillStyle = o < 0 ? C.laurel : C.leaf;
        ctx.beginPath(); ctx.ellipse(0, -16 * a, 7.5, 17 * a, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }
    ctx.strokeStyle = C.laurelDeep; ctx.lineWidth = 3;
    ctx.beginPath();
    if (side < 0) ctx.arc(cx, cy, r, Math.PI / 2 + 0.35, Math.PI / 2 + 0.35 + 2.35 * clamp(prog / 0.9)); else ctx.arc(cx, cy, r, Math.PI / 2 - 0.35 - 2.35 * clamp(prog / 0.9), Math.PI / 2 - 0.35);
    ctx.stroke();
  }
}

function sceneD(t) {
  const cx = W / 2, cy = 452;
  laurelWreath(cx, cy, 232, seg(t, 52.8, 55.0));
  withAlpha(eout(seg(t, 53.3, 54.2)), () => {
    font(700, 36, DISPLAY);
    text('INFINITELY MANY', cx, cy - 64, { align: 'center', color: C.laurelDeep, spacing: '2px' });
    text('STEPS', cx, cy - 20, { align: 'center', color: C.laurelDeep, spacing: '2px' });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 90, cy + 12); ctx.lineTo(cx + 90, cy + 12); ctx.stroke();
    font(700, 36, DISPLAY);
    text('A FINITE TIME', cx, cy + 62, { align: 'center', color: C.terra, spacing: '2px' });
    font(500, 26);
    text(`${MEET.toFixed(1)} m in ${secs(T_MEET)}`, cx, cy + 108, { align: 'center', color: C.soft });
  });
  withAlpha(eout(seg(t, 55.0, 55.8)), () => {
    font(400, 24); text('Source: Wikipedia, “Zeno’s paradoxes”', cx, 738, { align: 'center', color: C.soft });
  });
}

// ---------- captions: balanced lines ----------
const CAP = { size: 44, lh: 56, weight: 500, maxW: 720 };
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
    k.captions(t, [cue], { x: W / 2, y: 830, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.laurel, '~': C.terra } });
  }
}

Kit.scene({
  width: W, height: H, duration: 62.4,
  fonts: [
    { family: DISPLAY, file: 'Cinzel.woff2', weight: '400 900' },
    { family: TEXT, file: 'Jost.woff2', weight: '100 900' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneC2, T.C2], [sceneD, T.D, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
