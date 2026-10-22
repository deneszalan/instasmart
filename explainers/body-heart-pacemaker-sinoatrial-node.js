// Explainer for body-heart-pacemaker-sinoatrial-node: every beat starts in the SA node and follows one path.
// Look: an anatomical heart diagram in deep reds on near-black, with the conduction system as glowing amber
// paths, and a monitor-style ECG drawn in step underneath. Saira for captions, IBM Plex Mono for labels.
//
// Scene plan (62.8 s). Captions centred at y = 836; everything important sits above y = 930.
//  A  0.0–9.6   Hook. The heart beats at a resting pace, each beat flashing from one bright point; an ECG
//               sweeps along below in step. "Every heartbeat starts with a spark…" / "the sinoatrial node".
//  B  9.4–19.8  The node. A pointer labels it (about 15 mm, in the right atrium wall); the ECG panel turns
//               into one pacemaker cell's voltage: a slow climb to threshold, a spike, reset, again.
//  C 19.6–45.4  One beat in slow motion, with the ECG drawn from the same clock: the wave crosses the atria
//               (P wave), waits at the AV node (flat PR segment), runs down the bundle of His and the
//               bundle branches into the Purkinje fibres, the ventricles activate from the apex up (QRS),
//               then reset (T wave).
//  D 45.2–55.4  Normal speed again, beat after beat: 60–100 a minute at rest; nerves only adjust the pace.
//  E 55.2–62.8  Discovery card: Martin Flack, a mole's heart, published with Arthur Keith in 1907.
//
// Facts (Wikipedia, "Sinoatrial node"): an oval region of specialised muscle in the upper back wall of the right
// atrium, about 15 mm long, 3 mm wide and 1 mm thick, beside the superior vena cava; pacemaker cells have no
// resting potential: after repolarisation the voltage climbs automatically to a threshold and fires; resting
// heart rate 60–100 beats a minute; sympathetic nerves speed it up, the vagus nerve slows it; discovered by
// Martin Flack in a mole's heart while Sir Arthur Keith was out cycling, published 1907. ("Electrical conduction
// system of the heart"): SA node → atria (P wave) → AV node delay (much of the PR segment) → bundle of His →
// left and right bundle branches → Purkinje fibres; ventricles contract from the apex upwards (QRS);
// ventricular repolarisation gives the T wave. The ECG is a simple sum-of-bumps model, labelled as a diagram.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  bg0: '#050102', bg1: '#140407', bg2: '#2A0910', ink: '#FCEDEA', soft: 'rgba(252,226,222,0.74)', faint: 'rgba(252,210,205,0.4)',
  muscle: '#8E1A22', muscleHi: '#B7262E', muscleDeep: '#4E0A10', cavity: '#2A060B', vessel: '#6E1520', vesselBlue: '#3A2140',
  glow: '#FFB347', glowHot: '#FFE2A8', path: 'rgba(255,179,71,0.24)', ecg: '#FF6B5E', ecgGlow: 'rgba(255,107,94,0.35)', ring: '#E8C9B8', cool: '#7FB2FF',
};
const TEXT = 'Saira', MONO = 'IBM Plex Mono';

let k, ctx;
const font = (w, s, f = TEXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const label = (s, x, y, { size = 22, color = C.soft, align = 'center', weight = 500 } = {}) => { font(weight, size, MONO); text(s, x, y, { color, align }); };

const T = { A: [0, 9.6], B: [9.4, 19.8], C: [19.6, 45.4], D: [45.2, 55.4], E: [55.2, 62.8] };
const CUES = [
  [0.4, 5.0, 'Every heartbeat starts with a *spark* in one small patch of muscle.'],
  [5.1, 9.4, 'It’s called the *sinoatrial node*, or SA node.'],
  [9.6, 14.4, 'About *15 mm* long, it sits in the wall of the right atrium.'],
  [14.5, 19.6, 'Its cells never rest: their voltage creeps up until it ~fires~ by itself.'],
  [20.0, 25.3, 'The pulse spreads across both *atria*, which squeeze. On the ECG: the ~P wave~.'],
  [25.4, 30.6, 'At the *AV node* it waits a moment, so the ventricles can fill.'],
  [30.7, 36.0, 'Then it races down the *bundle of His* and the *Purkinje fibres*.'],
  [36.1, 40.7, 'The signal sweeps the ventricles from the bottom up: the tall ~QRS~ spike.'],
  [40.8, 45.0, 'Then the ventricles reset, drawing the ~T wave~.'],
  [45.4, 50.4, 'At rest, the whole cycle repeats about *60 to 100* times a minute.'],
  [50.5, 55.0, 'Nerves can only speed the pacemaker up or slow it down.'],
  [55.6, 62.4, 'Martin Flack first spotted it in a *mole’s heart*. He and Arthur Keith published it in 1907.'],
];

// ---------- the beat clock ----------
const BEAT = 0.8; // seconds per beat at the resting pace shown (75 a minute)
const g = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
/** ECG voltage at beat time b (0..0.8 s): P, Q, R, S, T bumps. */
const ecg = (b) => 0.15 * g(b, 0.12, 0.034) - 0.09 * g(b, 0.262, 0.008) + 1.0 * g(b, 0.29, 0.011) - 0.24 * g(b, 0.316, 0.01) + 0.3 * g(b, 0.53, 0.048);
// slow-motion map: scene time → beat time
const SLOW = [[20.0, 0.03], [24.8, 0.19], [30.6, 0.243], [33.2, 0.258], [39.0, 0.345], [40.7, 0.44], [44.6, 0.7]];
function slowBeat(t) {
  if (t <= SLOW[0][0]) return SLOW[0][1];
  for (let i = 1; i < SLOW.length; i++) if (t <= SLOW[i][0]) return lerp(SLOW[i - 1][1], SLOW[i][1], (t - SLOW[i - 1][0]) / (SLOW[i][0] - SLOW[i - 1][0]));
  return SLOW.at(-1)[1];
}
/** The heart's state at beat time b: each stage's progress 0..1. */
function stages(b) {
  return {
    sa: span(b, 0.02, 0.09, 0.01, 0.04),
    atria: seg(b, 0.05, 0.18),
    atriaGlow: span(b, 0.05, 0.3, 0.04, 0.1),
    av: seg(b, 0.16, 0.2) * (1 - seg(b, 0.26, 0.3)),
    his: seg(b, 0.243, 0.258),
    branches: seg(b, 0.252, 0.272),
    purk: seg(b, 0.265, 0.33),
    vent: seg(b, 0.27, 0.34),
    reset: seg(b, 0.46, 0.64),
    squeezeA: Math.sin(Math.PI * seg(b, 0.1, 0.26)),
    squeezeV: Math.sin(Math.PI * seg(b, 0.3, 0.6)),
    atrialLit: 1 - seg(b, 0.19, 0.25),
    hisLit: 1 - seg(b, 0.34, 0.44),
    ventLit: 1 - seg(b, 0.4, 0.55),
  };
}

// ---------- background ----------
let bg = null;
function rnd(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const c = bg.getContext('2d');
  const rg = c.createRadialGradient(432, 340, 30, 432, 400, 820);
  rg.addColorStop(0, C.bg2); rg.addColorStop(0.45, C.bg1); rg.addColorStop(1, C.bg0);
  c.fillStyle = rg; c.fillRect(0, 0, W, H);
  const r = rnd(5);
  for (let i = 0; i < 8000; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,200,200,0.022)' : 'rgba(0,0,0,0.08)'; c.fillRect(r() * W, r() * H, 1.5, 1.5); }
  // faint monitor grid in the ECG band
  c.strokeStyle = 'rgba(255,107,94,0.06)'; c.lineWidth = 1;
  for (let x = 72; x <= 792; x += 24) { c.beginPath(); c.moveTo(x, 616); c.lineTo(x, 760); c.stroke(); }
  for (let y = 616; y <= 760; y += 24) { c.beginPath(); c.moveTo(72, y); c.lineTo(792, y); c.stroke(); }
}
function background() {
  if (!bg) paintBg();
  ctx.drawImage(bg, 0, 0);
  font(600, 22); text('BODY · HEART', 64, 84, { color: C.ecg, spacing: '3px' });
}
function diagramNote(a) { A(a, () => label('heart · diagram', 604, 610, { size: 22, color: C.faint, align: 'left' })); }

// ---------- heart geometry (front view: the right atrium is on the viewer's left) ----------
const HC = { x: 432, y: 345 };
const P = {
  sa: [262, 182], av: [418, 334], hisEnd: [430, 392],
};
function heartOutline() {
  ctx.beginPath();
  ctx.moveTo(244, 206);
  ctx.bezierCurveTo(196, 270, 196, 400, 268, 470);
  ctx.bezierCurveTo(328, 528, 410, 584, 478, 600);
  ctx.bezierCurveTo(560, 560, 652, 470, 664, 364);
  ctx.bezierCurveTo(672, 286, 628, 214, 548, 200);
  ctx.bezierCurveTo(488, 190, 440, 214, 392, 206);
  ctx.bezierCurveTo(340, 198, 296, 186, 244, 206);
  ctx.closePath();
}
const VALVE_Y = 330;
function atriaClip() { ctx.beginPath(); ctx.rect(150, 100, 560, VALVE_Y - 100 + 6); }
function ventClip() { ctx.beginPath(); ctx.rect(150, VALVE_Y + 6, 560, 320); }
const PATHS = {
  internodal: [[262, 182], [300, 230], [350, 286], [418, 334]],
  bachmann: [[262, 182], [340, 190], [440, 206], [540, 222]],
  his: [[418, 334], [424, 362], [430, 392]],
  left: [[432, 392], [450, 450], [466, 530], [478, 590], [540, 560], [610, 480], [636, 400]],
  right: [[428, 392], [424, 450], [440, 530], [470, 592], [396, 560], [300, 490], [250, 410]],
};
const PURKINJE = [
  [[466, 530], [520, 520], [560, 488]], [[478, 590], [520, 600]], [[540, 560], [580, 520], [600, 540]], [[610, 480], [590, 430], [610, 400]],
  [[440, 530], [380, 520], [340, 480]], [[396, 560], [360, 560]], [[300, 490], [320, 450], [300, 420]], [[470, 592], [450, 615]],
];
function polyAt(pts, u) {
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
  let d = clamp(u) * tot; const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (d >= L[i - 1]) { out.push(pts[i]); d -= L[i - 1]; continue; }
    const f = d / L[i - 1]; out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); break;
  }
  return out;
}
function strokePts(pts, color, w) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
}
function glowPath(pts, u, w = 5, a = 1) {
  if (u <= 0 || a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const part = polyAt(pts, u);
  ctx.save();
  ctx.shadowColor = C.glow; ctx.shadowBlur = 18;
  strokePts(part, 'rgba(255,179,71,0.9)', w);
  ctx.shadowBlur = 0;
  strokePts(part, C.glowHot, w * 0.4);
  if (u < 1) { const [hx, hy] = part.at(-1); dot(hx, hy, 9, 1); }
  ctx.restore();
  ctx.restore();
}
function dot(x, y, r, a) {
  const gg = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  gg.addColorStop(0, `rgba(255,236,190,${a})`); gg.addColorStop(0.3, `rgba(255,179,71,${0.7 * a})`); gg.addColorStop(1, 'rgba(255,179,71,0)');
  ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, TAU); ctx.fill();
}

/** The heart at beat state s; dimPaths: how visible the resting conduction paths are. */
function heart(s, { paths = 1, scale = 1 } = {}) {
  const sq = 1 - 0.012 * s.squeezeA - 0.025 * s.squeezeV;
  ctx.save();
  ctx.translate(HC.x, HC.y); ctx.scale(scale * sq, scale * sq); ctx.translate(-HC.x, -HC.y);
  // great vessels behind
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = C.vesselBlue; ctx.lineWidth = 46; ctx.beginPath(); ctx.moveTo(266, 112); ctx.lineTo(266, 210); ctx.stroke(); // superior vena cava
  ctx.strokeStyle = C.vessel; ctx.lineWidth = 50; ctx.beginPath(); ctx.moveTo(420, 260); ctx.bezierCurveTo(400, 150, 430, 96, 520, 96); ctx.bezierCurveTo(590, 96, 610, 140, 612, 190); ctx.stroke(); // aorta
  ctx.strokeStyle = '#5A1A2E'; ctx.lineWidth = 40; ctx.beginPath(); ctx.moveTo(470, 270); ctx.bezierCurveTo(480, 200, 520, 170, 580, 160); ctx.stroke(); // pulmonary trunk
  ctx.restore();
  // muscle
  heartOutline();
  const mg = ctx.createRadialGradient(380, 300, 40, 440, 380, 330);
  mg.addColorStop(0, C.muscleHi); mg.addColorStop(0.6, C.muscle); mg.addColorStop(1, C.muscleDeep);
  ctx.fillStyle = mg; ctx.fill();
  ctx.strokeStyle = 'rgba(255,190,180,0.25)'; ctx.lineWidth = 2; ctx.stroke();
  // chambers
  ctx.fillStyle = C.cavity;
  ctx.beginPath(); ctx.ellipse(304, 270, 58, 62, 0, 0, TAU); ctx.fill(); // right atrium
  ctx.beginPath(); ctx.ellipse(548, 260, 70, 46, 0, 0, TAU); ctx.fill(); // left atrium
  ctx.beginPath(); ctx.moveTo(290, 350); ctx.bezierCurveTo(330, 344, 392, 344, 406, 356); ctx.bezierCurveTo(410, 430, 430, 500, 446, 548); ctx.bezierCurveTo(380, 520, 290, 450, 290, 350); ctx.fill(); // right ventricle
  ctx.beginPath(); ctx.moveTo(458, 356); ctx.bezierCurveTo(500, 342, 600, 342, 612, 362); ctx.bezierCurveTo(612, 450, 540, 530, 482, 556); ctx.bezierCurveTo(472, 480, 462, 410, 458, 356); ctx.fill(); // left ventricle
  // insulating fibrous ring between atria and ventricles
  ctx.save(); ctx.strokeStyle = 'rgba(232,201,184,0.45)'; ctx.lineWidth = 6; ctx.setLineDash([14, 8]);
  ctx.beginPath(); ctx.moveTo(232, VALVE_Y); ctx.bezierCurveTo(330, VALVE_Y + 6, 520, VALVE_Y + 6, 660, VALVE_Y - 4); ctx.stroke(); ctx.restore();
  // activation glows
  if (s.atriaGlow > 0) {
    ctx.save(); heartOutline(); ctx.clip(); atriaClip(); ctx.clip();
    const rr = 30 + 420 * eout(s.atria);
    const ag = ctx.createRadialGradient(P.sa[0], P.sa[1], Math.max(0, rr - 140), P.sa[0], P.sa[1], rr);
    ag.addColorStop(0, `rgba(255,140,70,${0.28 * s.atriaGlow})`); ag.addColorStop(0.85, `rgba(255,190,100,${0.55 * s.atriaGlow})`); ag.addColorStop(1, 'rgba(255,190,100,0)');
    ctx.fillStyle = ag; ctx.fillRect(150, 100, 560, 260);
    ctx.restore();
  }
  if (s.vent > 0) {
    const fade = 1 - s.reset;
    ctx.save(); heartOutline(); ctx.clip(); ventClip(); ctx.clip();
    const top = lerp(620, 300, eout(s.vent));
    const vg = ctx.createLinearGradient(0, top - 60, 0, 620);
    vg.addColorStop(0, 'rgba(255,170,90,0)'); vg.addColorStop(0.25, `rgba(255,170,90,${0.5 * fade})`); vg.addColorStop(1, `rgba(255,120,60,${0.3 * fade})`);
    ctx.fillStyle = vg; ctx.fillRect(150, top - 60, 560, 700);
    // reset sweeps a cool tint back over the muscle
    if (s.reset > 0 && s.reset < 1) { ctx.fillStyle = `rgba(127,178,255,${0.12 * Math.sin(Math.PI * s.reset)})`; ctx.fillRect(150, VALVE_Y, 560, 320); }
    ctx.restore();
  }
  // conduction paths, dim at rest
  A(paths, () => {
    ctx.save();
    for (const pts of Object.values(PATHS)) strokePts(pts, C.path, 4);
    for (const pts of PURKINJE) strokePts(pts, C.path, 2.5);
    ctx.restore();
  });
  // live signal along the paths
  glowPath(PATHS.internodal, s.atria, 5, s.atrialLit);
  glowPath(PATHS.bachmann, s.atria, 5, s.atrialLit);
  const avA = Math.max(s.av * (0.75 + 0.25 * Math.sin(s.av * 40)), s.his > 0 ? s.hisLit : 0);
  if (avA > 0) dot(...P.av, 8, avA);
  glowPath(PATHS.his, s.his, 5, s.hisLit);
  glowPath(PATHS.left, s.branches, 5, s.ventLit);
  glowPath(PATHS.right, s.branches, 5, s.ventLit);
  for (const pts of PURKINJE) glowPath(pts, s.purk, 3, s.ventLit);
  // the SA node itself
  ctx.save(); ctx.fillStyle = '#E0A070'; ctx.beginPath(); ctx.ellipse(P.sa[0], P.sa[1], 15, 8, -0.9, 0, TAU); ctx.fill(); ctx.restore();
  if (s.sa > 0) dot(P.sa[0], P.sa[1], 16, s.sa);
  ctx.restore();
}

// ---------- the ECG panel ----------
const EX0 = 84, EX1 = 780, EBASE = 716, EAMP = 92;
function ecgSlow(t, b) {
  // one beat across the panel, drawn up to beat time b
  const n = 400;
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.shadowColor = C.ecg; ctx.shadowBlur = 10; ctx.strokeStyle = C.ecg; ctx.lineWidth = 3.5;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const bb = (i / n) * BEAT; if (bb > b) break;
    const x = lerp(EX0, EX1, bb / BEAT), y = EBASE - ecg(bb) * EAMP;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke(); ctx.restore();
  const xb = lerp(EX0, EX1, Math.min(b, BEAT) / BEAT);
  dot(xb, EBASE - ecg(Math.min(b, BEAT)) * EAMP, 5, 0.9);
  // part labels
  const xs = (bb) => lerp(EX0, EX1, bb / BEAT);
  const lab = (s, bb, show, y = EBASE + 34) => A(seg(b, show, show + 0.02), () => label(s, xs(bb), y, { size: 22, color: C.glowHot }));
  lab('P', 0.12, 0.16, EBASE - 34);
  A(seg(b, 0.2, 0.22), () => { ctx.save(); ctx.strokeStyle = 'rgba(255,226,168,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xs(0.18), EBASE + 14); ctx.lineTo(xs(0.255), EBASE + 14); ctx.stroke(); ctx.restore(); label('PR', xs(0.217), EBASE + 40, { size: 22, color: C.glowHot }); });
  lab('QRS', 0.29, 0.3, EBASE - EAMP - 14);
  lab('T', 0.53, 0.58, EBASE - 44);
}
function ecgSweep(t, t0, { fadeIn = 0 } = {}) {
  // a monitor sweep at the resting pace: the newest 3.2 s of trace, a gap ahead of the cursor
  const spanS = 3.2;
  const now = t - t0;
  const xOfTime = (tt) => EX0 + (((tt % spanS) + spanS) % spanS) / spanS * (EX1 - EX0);
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = C.ecg; ctx.lineWidth = 3.5; ctx.shadowColor = C.ecg; ctx.shadowBlur = 10;
  const steps = 360;
  let prevX = null;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const tt = now - spanS + 0.25 + (i / steps) * (spanS - 0.25);
    if (tt < fadeIn) { prevX = null; continue; }
    const x = xOfTime(tt), y = EBASE - ecg(((tt % BEAT) + BEAT) % BEAT) * EAMP;
    if (prevX === null || x < prevX) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    prevX = x;
  }
  ctx.stroke(); ctx.restore();
  const cx = xOfTime(now);
  dot(cx, EBASE - ecg(((now % BEAT) + BEAT) % BEAT) * EAMP, 5, 0.9);
}
function ecgLabel(a, s = 'ECG · diagram') { A(a, () => label(s, EX0, 642, { size: 22, color: C.faint, align: 'left' })); }

// ---------- scenes ----------
function sceneA(t) {
  const b = ((t - 0.6) % BEAT + BEAT) % BEAT;
  const live = t > 0.6 ? stages(b) : stages(-1);
  A(eio(seg(t, 0, 1.2)), () => { heart(live, { paths: 0.5 }); diagramNote(1); });
  A(seg(t, 0.6, 1.4), () => { ecgSweep(t, 0.6, { fadeIn: 0 }); ecgLabel(1); });
}
function sceneB(t) {
  heart(stages(beatB(t)), { paths: 0.5 });
  diagramNote(1);
  const fade = seg(t, 9.6, 10.6);
  // pointer to the node
  A(seg(t, 10.0, 10.8), () => {
    ctx.save(); ctx.strokeStyle = C.glowHot; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(P.sa[0], P.sa[1], 30, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(P.sa[0] - 26, P.sa[1] + 12); ctx.lineTo(170, 236); ctx.lineTo(40, 236); ctx.stroke(); ctx.restore();
    label('SA node', 40, 224, { size: 26, color: C.glowHot, align: 'left', weight: 600 });
    label('≈ 15 mm long', 40, 266, { size: 22, color: C.soft, align: 'left' });
    label('right atrium', 304, 276, { size: 22, color: C.soft });
  });
  if (fade > 0) dot(P.sa[0], P.sa[1], 12, fade * (0.4 + 0.6 * pacemakerFire(t)));
  // the ECG becomes one pacemaker cell's voltage
  A(1 - seg(t, 9.6, 10.4), () => ecgSweep(t, 0.6));
  A(seg(t, 14.4, 15.2), () => pacemakerTrace(t));
  A(1 - seg(t, 9.4, 9.8), () => ecgLabel(1));
  A(seg(t, 9.8, 10.4) * (1 - seg(t, 14.0, 14.4)), () => ecgLabel(1, 'ECG · paused'));
}
// pacemaker potential: slow climb to threshold, fast upstroke, repolarise
const PM_START = 14.8, PM_CYCLE = 1.6, PM_FIRE = 0.66;
/** Beat time in scene B: resting beats until 13.4 s, then one beat after each pacemaker firing. */
function beatB(t) {
  if (t < 13.4) return ((t - 0.6) % BEAT + BEAT) % BEAT;
  const u = t - PM_START - PM_FIRE * PM_CYCLE;
  if (u < 0) return -1;
  const b = u % PM_CYCLE;
  return b < BEAT ? b : -1;
}
function pacemakerV(tt) {
  const u = ((tt % PM_CYCLE) + PM_CYCLE) % PM_CYCLE / PM_CYCLE;
  if (u < 0.62) return lerp(-0.62, -0.25, eio(u / 0.62) * 0.4 + (u / 0.62) * 0.6); // slow climb
  if (u < 0.7) return lerp(-0.25, 0.55, eout((u - 0.62) / 0.08)); // spike
  return lerp(0.55, -0.62, eio((u - 0.7) / 0.3)); // reset
}
function pacemakerFire(t) { if (t < PM_START) return 0; const u = ((t - PM_START) % PM_CYCLE) / PM_CYCLE; return span(u, 0.62, 0.8, 0.02, 0.1); }
function pacemakerTrace(t) {
  label('voltage of one pacemaker cell · diagram', EX0, 642, { size: 22, color: C.faint, align: 'left' });
  const yOf = (v) => EBASE - 20 - v * 80;
  ctx.save(); ctx.setLineDash([6, 8]); ctx.strokeStyle = 'rgba(255,226,168,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(EX0, yOf(-0.25)); ctx.lineTo(EX1, yOf(-0.25)); ctx.stroke(); ctx.restore();
  label('threshold', EX1, yOf(-0.25) - 10, { size: 22, color: C.glowHot, align: 'right' });
  const dur = t - PM_START; if (dur <= 0) return;
  const sweep = 4.8;
  ctx.save(); ctx.strokeStyle = C.glow; ctx.lineWidth = 3.5; ctx.shadowColor = C.glow; ctx.shadowBlur = 8; ctx.lineJoin = 'round';
  ctx.beginPath();
  const n = 300;
  for (let i = 0; i <= n; i++) {
    const tt = (i / n) * Math.min(dur, sweep);
    const x = lerp(EX0, EX1, tt / sweep), y = yOf(pacemakerV(tt));
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke(); ctx.restore();
}
function sceneC(t) {
  const b = slowBeat(t);
  const s = stages(b);
  heart(s, { paths: 1 });
  diagramNote(1);
  const lab = (str, x, y, a, o = {}) => A(a, () => label(str, x, y, { size: 22, ...o }));
  lab('right atrium', 304, 276, span(t, 20.2, 25.4));
  lab('left atrium', 548, 266, span(t, 20.2, 25.4));
  lab('AV node', 418, 300, span(t, 25.6, 30.8), { color: C.glowHot, weight: 600 });
  lab('bundle of His', 552, 392, span(t, 30.8, 36.0), { color: C.glowHot, align: 'left', weight: 600 });
  A(span(t, 30.8, 36.0), () => { ctx.save(); ctx.strokeStyle = 'rgba(255,226,168,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(440, 380); ctx.lineTo(546, 386); ctx.stroke(); ctx.restore(); });
  lab('Purkinje fibres', 700, 520, span(t, 33.4, 40.6), { color: C.glowHot, align: 'center', weight: 600 });
  lab('ventricles', 432, 470, span(t, 36.2, 45.2), { color: C.ink });
  A(1, () => { ecgSlow(t, b); ecgLabel(1, 'ECG · one beat, slowed down'); });
}
function sceneD(t) {
  const t0 = 45.2;
  const b = ((t - t0) % BEAT + BEAT) % BEAT;
  heart(stages(b), { paths: 0.7 });
  diagramNote(1);
  ecgSweep(t, t0);
  ecgLabel(1, 'ECG · diagram');
  label('75 beats a minute', EX1, 642, { size: 22, color: C.glowHot, align: 'right', weight: 600 });
}
function sceneE(t) {
  const a = eout(seg(t, 55.4, 56.2));
  // dim heart behind
  A(0.35, () => heart(stages(-1), { paths: 0.6 }));
  A(a, () => {
    ctx.save(); k.rrect(112, 170 + (1 - a) * 20, 640, 390, 28); ctx.fillStyle = 'rgba(16,4,7,0.86)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,179,71,0.4)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    mole(432, 330 + (1 - a) * 20, 1);
    font(700, 64, TEXT); text('1907', 432, 476 + (1 - a) * 20, { align: 'center', color: C.glowHot });
    label('the Keith–Flack node', 432, 520 + (1 - a) * 20, { size: 24, color: C.soft });
  });
}
function mole(x, y, s) {
  // a simple mole silhouette: body, snout, digging paw
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#E8C9B8';
  ctx.beginPath(); ctx.ellipse(0, 0, 120, 64, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(100, -30); ctx.quadraticCurveTo(170, -10, 178, 8); ctx.quadraticCurveTo(150, 30, 96, 34); ctx.fill();
  ctx.fillStyle = '#FF8FA0'; ctx.beginPath(); ctx.arc(178, 6, 8, 0, TAU); ctx.fill();
  ctx.fillStyle = '#E8C9B8';
  ctx.beginPath(); ctx.ellipse(70, 56, 30, 14, -0.4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-70, 56, 26, 12, 0.4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-118, 6); ctx.quadraticCurveTo(-150, 14, -160, 30); ctx.lineTo(-150, 34); ctx.quadraticCurveTo(-140, 20, -116, 20); ctx.fill();
  // a tiny heart where the heart would be
  ctx.fillStyle = C.ecg; ctx.beginPath(); ctx.moveTo(40, 0); ctx.bezierCurveTo(40, -14, 20, -14, 20, 0); ctx.bezierCurveTo(20, 12, 40, 20, 40, 26); ctx.bezierCurveTo(40, 20, 60, 12, 60, 0); ctx.bezierCurveTo(60, -14, 40, -14, 40, 0); ctx.fill();
  ctx.restore();
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 600, maxW: 760 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (m) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > m && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 846, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.glow, '~': C.ecg } });
  }
}

Kit.scene({
  width: W, height: H, duration: 62.8,
  fonts: [
    { family: TEXT, file: 'Saira.woff2' },
    { family: MONO, file: 'IBMPlexMono-Regular.woff2', weight: '400 500' },
    { family: MONO, file: 'IBMPlexMono-SemiBold.woff2', weight: '600' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    const scenes = [[sceneA, T.A, 0, 0], [sceneB, T.B, 0, 0.3], [sceneC, T.C, 0.3, 0.3], [sceneD, T.D, 0.3, 0.3], [sceneE, T.E, 0.3, 0]];
    for (const [fn, [a, b], fi = 0.3, fo = 0.3] of scenes) {
      if (t < a || t > b) continue;
      if (fn === sceneA && t >= T.B[0]) continue; // B takes over the same picture without a fade
      A(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
