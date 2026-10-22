// Explainer for body-cochlea-pitch-map: the basilar membrane is tuned along its length (tonotopy).
// Look: a seashell spiral in pearl and warm pink on a deep plum ground with a soft nacre sheen. Cormorant
// Garamond for titles and labels, Nunito for captions. High notes are pink, low notes gold throughout.
//
// Scene plan (62.4 s). Captions centred at y = 836; everything important sits above y = 930.
//  A  0.0–9.8   Hook. A pearl spiral of 2.75 turns draws in, sound ripples arrive at its base.
//  B  9.6–20.0  The spiral unrolls into a straight tube; the basilar membrane inside tapers the other way:
//               narrow and stiff at the base, wide and floppy at the apex.
//  C 19.8–36.0  Tones. A travelling wave rolls from the base and peaks at one place: 8,000 Hz near the base,
//               200 Hz near the apex, then a glide from high to low sweeps the peak along. Places from the
//               Greenwood function for humans, f = 165.4 (10^(2.1x) − 0.88), x measured from the apex.
//  D 35.8–46.8  Hair cells along the strip light up under the peak and send pulses up their own nerve fibres.
//  E 46.6–62.4  Békésy: strobe flashes freeze the ripple, silver flakes glint; card with the 1961 Nobel Prize;
//               hedge: living hair cells boost the wave, details still debated.
//
// Facts (Wikipedia, "Cochlea"): spiral canal approximately 30 mm long, 2¾ turns; waves run from the base (oval
// window) to the apex; the membrane is stiffest at the base, so high frequencies move it there and lower ones
// travel farther; this is tonotopy. ("Basilar membrane"): widest (0.42–0.65 mm) and least stiff at the apex,
// narrowest (0.08–0.16 mm) and stiffest at the base; motion generally described as a travelling wave; outer
// hair cells amplify it by up to 65 dB. ("Georg von Békésy"): strobe photography and silver flakes showed the
// membrane moving like a surface wave; 1961 Nobel Prize for research on the cochlea; Kemp later showed active
// feedback is needed. ("Greenwood function"): the place–frequency formula above. The wave shape is a diagram.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  bg0: '#1A0614', bg1: '#2F0F26', bg2: '#4E1F40', pearl: '#F8ECF2', pearlShade: '#D7B8CA', pearlDeep: '#A98199', ink: '#FFF4F8',
  soft: 'rgba(255,236,245,0.76)', faint: 'rgba(255,220,235,0.42)', pink: '#FF9DB8', pinkHot: '#FFC6D6', coral: '#FF7389', gold: '#FFD3A1', goldHot: '#FFE7C7', lilac: '#CDB8FF',
  membrane: '#FF8FAE',
};
const DISPLAY = 'Cormorant Garamond', TEXT = 'Nunito';

let k, ctx;
const font = (w, s, f = TEXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const label = (s, x, y, { size = 26, color = C.soft, align = 'center', weight = 600, family = DISPLAY } = {}) => { font(weight, size, family); text(s, x, y, { color, align }); };

const T = { A: [0, 9.8], B: [9.6, 20.0], C: [19.8, 36.0], D: [35.8, 46.8], E: [46.6, 62.4] };
const CUES = [
  [0.4, 5.0, 'Deep in your ear is a coiled tube, shaped like a snail shell.'],
  [5.1, 9.6, 'It’s the *cochlea*: about 30 mm of canal, coiled 2¾ times.'],
  [9.8, 14.4, 'Unroll it, and inside runs the *basilar membrane*.'],
  [14.5, 19.8, 'Near the *base* it’s narrow and stiff; at the ~apex~, wide and floppy.'],
  [20.1, 25.3, 'A *high* note sets up a wave that peaks close to the base.'],
  [25.4, 30.5, 'A ~low~ note rolls farther along and peaks near the apex.'],
  [30.6, 35.8, 'Every pitch has its own place. This map is called *tonotopy*.'],
  [36.0, 41.0, 'Hair cells at each spot excite their own nerve fibres.'],
  [41.1, 46.4, 'So a *high* note and a ~low~ note reach the brain along different fibres.'],
  [46.8, 52.2, 'Georg von Békésy watched this ripple using strobe light and silver flakes.'],
  [52.3, 56.8, 'His work on the cochlea won the *1961 Nobel Prize*.'],
  [56.9, 62.2, 'Living hair cells boost the wave too, and the details are still debated.'],
];

// ---------- the place map (Greenwood, humans) ----------
const placeFromBase = (f) => 1 - Math.log10(f / 165.4 + 0.88) / 2.1;
const freqAt = (s) => 165.4 * (Math.pow(10, 2.1 * (1 - s)) - 0.88);
const HI = 8000, LO = 200, MID = 1000;
const fmtHz = (f) => `${Kit.fmt(f)} Hz`;

// ---------- geometry: spiral ↔ straight strip ----------
const SP = { x: 452, y: 400, R0: 290, R1: 34, turns: 2.75, th0: Math.PI * 0.98 };
const LINE = { x0: 96, x1: 776, y: 420 };
function spiralPt(s) {
  const th = SP.th0 + s * SP.turns * TAU;
  const r = SP.R0 * Math.pow(SP.R1 / SP.R0, s);
  return [SP.x + Math.cos(th) * r, SP.y + Math.sin(th) * r * 0.92];
}
const linePt = (s) => [lerp(LINE.x0, LINE.x1, s), LINE.y];
const N = 260;
function centre(m) {
  const pts = [];
  for (let i = 0; i <= N; i++) { const s = i / N; const a = spiralPt(s), b = linePt(s); pts.push([lerp(a[0], b[0], m), lerp(a[1], b[1], m)]); }
  return pts;
}
function normals(pts) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  });
}
const tubeW = (s, m) => lerp(lerp(64, 18, s), lerp(120, 58, s), m); // the canal narrows toward the apex
const memW = (s) => lerp(8, 40, s); // the membrane widens toward the apex
function band(pts, nr, wf, from = 0, to = 1) {
  const i0 = Math.round(from * N), i1 = Math.round(to * N);
  ctx.beginPath();
  for (let i = i0; i <= i1; i++) { const w = wf(i / N) / 2; ctx.lineTo(pts[i][0] + nr[i][0] * w, pts[i][1] + nr[i][1] * w); }
  for (let i = i1; i >= i0; i--) { const w = wf(i / N) / 2; ctx.lineTo(pts[i][0] - nr[i][0] * w, pts[i][1] - nr[i][1] * w); }
  ctx.closePath();
}

// ---------- background ----------
let bg = null;
function rnd(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(440, 380, 40, 440, 440, 860);
  rg.addColorStop(0, C.bg2); rg.addColorStop(0.5, C.bg1); rg.addColorStop(1, C.bg0);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // nacre sheen: soft diagonal bands of pink and lilac
  for (let i = 0; i < 7; i++) {
    const lg = g.createLinearGradient(0, i * 160 - 200, W, i * 160 + 200);
    const c = i % 2 ? '205,184,255' : '255,157,184';
    lg.addColorStop(0, `rgba(${c},0)`); lg.addColorStop(0.5, `rgba(${c},0.045)`); lg.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
  }
  const r = rnd(9);
  for (let i = 0; i < 8000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,235,245,0.03)' : 'rgba(0,0,0,0.06)'; g.fillRect(r() * W, r() * H, 1.5, 1.5); }
  const vg = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,0,8,0.5)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function background() {
  if (!bg) paintBg();
  ctx.drawImage(bg, 0, 0);
  font(700, 22); text('BODY · HEARING', 64, 84, { color: C.pink, spacing: '3px' });
}

// ---------- the travelling wave ----------
/** Displacement of the membrane at s for a tone peaking at sc, at time tt (diagram units, −1..1). */
function wave(s, sc, tt, speed) {
  if (s > sc + 0.12) return 0;
  const rise = Math.exp(-(((s - sc) / (0.5 * sc + 0.08)) ** 2));
  const fall = Math.exp(-(((s - sc) / 0.035) ** 2));
  const env = s < sc ? rise : fall;
  const phase = speed * tt - 2 * Math.PI * 3.2 * Math.pow(s / sc, 1.7);
  return env * Math.sin(phase);
}
function drawStrip(m, { tone = null, amp = 0, tt = 0, color = C.pink, flakes = 0, cells = 0, cellLit = null } = {}) {
  const pts = centre(m), nr = normals(pts);
  // canal (pearl tube)
  band(pts, nr, (s) => tubeW(s, m));
  const tg = ctx.createLinearGradient(0, LINE.y - 70, 0, LINE.y + 70);
  tg.addColorStop(0, 'rgba(248,236,242,0.30)'); tg.addColorStop(0.5, 'rgba(248,236,242,0.14)'); tg.addColorStop(1, 'rgba(215,184,202,0.28)');
  ctx.fillStyle = m > 0.5 ? tg : 'rgba(248,236,242,0.18)'; ctx.fill();
  ctx.strokeStyle = 'rgba(248,236,242,0.75)'; ctx.lineWidth = 3; ctx.stroke();
  // membrane, displaced by the wave
  const disp = pts.map((p, i) => [p[0], p[1] + (tone === null ? 0 : wave(i / N, tone, tt, 1) * amp)]);
  ctx.save();
  band(disp, nr.map(() => [0, 1]), memW);
  ctx.fillStyle = C.membrane; ctx.globalAlpha *= 0.9; ctx.fill();
  ctx.restore();
  if (tone !== null && amp > 0) {
    // the envelope: how far each place moves at most
    ctx.save(); ctx.setLineDash([5, 7]); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.globalAlpha *= 0.7;
    for (const sign of [-1, 1]) {
      ctx.beginPath();
      for (let i = 0; i <= N; i++) { const s = i / N; const env = s < tone ? Math.exp(-(((s - tone) / (0.5 * tone + 0.08)) ** 2)) : Math.exp(-(((s - tone) / 0.035) ** 2)); ctx.lineTo(pts[i][0], pts[i][1] + sign * (env * amp + memW(s) / 2 + 4)); }
      ctx.stroke();
    }
    ctx.restore();
  }
  if (flakes > 0) {
    const r = rnd(3);
    for (let i = 0; i < 90; i++) {
      const s = r(), jitter = (r() - 0.5) * memW(s) * 0.7;
      const ii = Math.round(s * N);
      ctx.fillStyle = `rgba(240,244,255,${flakes * (0.5 + 0.5 * r())})`;
      ctx.fillRect(disp[ii][0] - 1.5, disp[ii][1] + jitter - 1.5, 3, 3);
    }
  }
  if (cells > 0) {
    // hair cells on top of the membrane, nerve fibres rising to the brain
    for (let j = 0; j < 34; j++) {
      const s = (j + 0.5) / 34, ii = Math.round(s * N);
      const [x, y] = disp[ii];
      const lit = cellLit ? cellLit(s) : 0;
      A(cells, () => {
        ctx.strokeStyle = `rgba(255,236,245,${0.18 + 0.6 * lit})`; ctx.lineWidth = 1.5 + 1.5 * lit;
        ctx.beginPath(); ctx.moveTo(x, y - memW(s) / 2 - 8); ctx.bezierCurveTo(x, 250, lerp(x, 432, 0.5), 200, lerp(x, 432, 0.85), 168); ctx.stroke();
        ctx.fillStyle = lit > 0.1 ? (cellColor ?? C.pinkHot) : C.pearl;
        ctx.beginPath(); ctx.arc(x, y - memW(s) / 2 - 6, 5 + 2 * lit, 0, TAU); ctx.fill();
      });
    }
  }
  return { pts, disp };
}
let cellColor = null;

function stapes(t, a, push) {
  // the oval window and a stapes piston at the base, pushing in and out
  A(a, () => {
    const x = LINE.x0 - 46 + push * 10, y = LINE.y - 26;
    ctx.save(); ctx.fillStyle = C.pearlShade; k.rrect(x - 26, y - 8, 30, 16, 6); ctx.fill();
    ctx.fillStyle = C.pearl; k.rrect(x + 2, y - 20, 10, 40, 4); ctx.fill(); ctx.restore();
    label('oval', LINE.x0 - 44, LINE.y + 36, { size: 22, color: C.faint });
    label('window', LINE.x0 - 44, LINE.y + 60, { size: 22, color: C.faint });
  });
}

// ---------- scenes ----------
function spiralDraw(t, draw) {
  const pts = centre(0), nr = normals(pts);
  const to = eio(draw);
  if (to <= 0) return;
  // shell shading
  band(pts, nr, (s) => tubeW(s, 0) * 1.25, 0, to);
  const sg = ctx.createRadialGradient(SP.x - 80, SP.y - 80, 20, SP.x, SP.y, SP.R0 + 60);
  sg.addColorStop(0, '#FFF6FA'); sg.addColorStop(0.5, C.pearl); sg.addColorStop(1, C.pearlShade);
  ctx.fillStyle = sg; ctx.fill();
  ctx.strokeStyle = 'rgba(169,129,153,0.9)'; ctx.lineWidth = 2; ctx.stroke();
  // ridges
  ctx.save(); ctx.strokeStyle = 'rgba(169,129,153,0.35)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < N * to; i += 6) { const w = tubeW(i / N, 0) * 0.6; ctx.beginPath(); ctx.moveTo(pts[i][0] + nr[i][0] * w, pts[i][1] + nr[i][1] * w); ctx.lineTo(pts[i][0] - nr[i][0] * w, pts[i][1] - nr[i][1] * w); ctx.stroke(); }
  ctx.restore();
  // pink membrane line along the inside
  ctx.save(); ctx.strokeStyle = C.membrane; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i <= N * to; i++) i ? ctx.lineTo(...pts[i]) : ctx.moveTo(...pts[i]);
  ctx.stroke(); ctx.restore();
}
function ripples(t, x, y, a) {
  A(a, () => {
    for (let i = 0; i < 4; i++) {
      const p = ((t * 0.7 + i / 4) % 1);
      ctx.strokeStyle = `rgba(255,198,214,${0.6 * (1 - p)})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x - 160 + p * 120, y, 30 + p * 40, -0.6, 0.6); ctx.stroke();
    }
  });
}
function sceneA(t) {
  spiralDraw(t, seg(t, 0.2, 3.6));
  const [bx, by] = spiralPt(0);
  ripples(t, bx, by, span(t, 3.4, 9.6, 0.6, 0.5));
  A(seg(t, 5.0, 5.8) * (1 - seg(t, 9.1, 9.6)), () => {
    label('base', bx - 10, by + 64, { size: 26, color: C.pinkHot });
    const [ax, ay] = spiralPt(1);
    ctx.save(); ctx.strokeStyle = 'rgba(255,231,199,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax + 4, ay + 6); ctx.lineTo(640, 640); ctx.stroke(); ctx.restore();
    label('apex', 660, 668, { size: 26, color: C.goldHot });
    label('cochlea · diagram', 300, 712, { size: 24, color: C.faint });
  });
}
function sceneB(t) {
  const m = eio(seg(t, 10.0, 13.6));
  if (m < 0.02) { spiralDraw(t, 1); return; }
  A(1 - seg(t, 10.0, 10.8), () => spiralDraw(t, 1));
  drawStrip(m);
  stapes(t, seg(t, 13.6, 14.4), 0);
  A(seg(t, 13.6, 14.4), () => {
    label('base', LINE.x0, LINE.y - 84, { size: 28, color: C.pinkHot });
    label('apex', LINE.x1, LINE.y - 84, { size: 28, color: C.goldHot });
    label('basilar membrane · unrolled diagram', W / 2, 600, { size: 24, color: C.faint });
  });
  A(seg(t, 14.8, 15.6), () => {
    label('narrow, stiff', LINE.x0 + 10, LINE.y + 104, { size: 24, color: C.pinkHot, align: 'left' });
    label('0.08–0.16 mm', LINE.x0 + 10, LINE.y + 134, { size: 22, color: C.soft, align: 'left' });
  });
  A(seg(t, 16.6, 17.4), () => {
    label('wide, floppy', LINE.x1, LINE.y + 104, { size: 24, color: C.goldHot, align: 'right' });
    label('0.42–0.65 mm', LINE.x1, LINE.y + 134, { size: 22, color: C.soft, align: 'right' });
  });
}
/** Which tone plays in scene C, and how loud: returns { f, amp, color }. */
function toneC(t) {
  if (t < 25.4) return { f: HI, amp: 46 * span(t, 20.4, 25.4, 0.8, 0.5), color: C.pink, speed: 9 };
  if (t < 30.7) return { f: LO, amp: 52 * span(t, 25.4, 30.7, 0.8, 0.5), color: C.gold, speed: 5 };
  const g = eio(seg(t, 31.1, 35.4));
  const f = Math.exp(lerp(Math.log(HI), Math.log(LO), g));
  return { f, amp: 48 * span(t, 30.7, 36.2, 0.6, 0.6), color: g < 0.5 ? C.pink : C.gold, speed: lerp(9, 5, g) };
}
function sceneC(t) {
  const { f, amp, color, speed } = toneC(t);
  const sc = placeFromBase(f);
  drawStrip(1, { tone: sc, amp, tt: t * speed, color });
  stapes(t, 1, Math.sin(t * speed) * clamp(amp / 40));
  label('base', LINE.x0, LINE.y - 84, { size: 28, color: C.pinkHot });
  label('apex', LINE.x1, LINE.y - 84, { size: 28, color: C.goldHot });
  // frequency ticks from the Greenwood map
  A(seg(t, 20.2, 21.0), () => {
    for (const [fq, col] of [[HI, C.pinkHot], [MID, C.soft], [LO, C.goldHot]]) {
      const x = lerp(LINE.x0, LINE.x1, placeFromBase(fq));
      ctx.strokeStyle = 'rgba(255,236,245,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, LINE.y + 66); ctx.lineTo(x, LINE.y + 80); ctx.stroke();
      label(fmtHz(fq), x, LINE.y + 108, { size: 24, color: col, family: TEXT, weight: 700 });
    }
    label('peak places: Greenwood’s map for human ears', W / 2, LINE.y + 150, { size: 22, color: C.faint });
  });
  // the tone readout
  A(clamp(amp / 30), () => {
    const x = 432, y = 214;
    note(x - 120, y - 8, color);
    font(800, 44, TEXT); text(fmtHz(Math.round(f / (f > 1000 ? 100 : 10)) * (f > 1000 ? 100 : 10)), x - 80, y + 6, { color, align: 'left' });
    label(f > 1500 ? 'high note' : f < 500 ? 'low note' : '', x - 80, y + 44, { size: 24, color: C.soft, align: 'left' });
  });
}
function note(x, y, color) {
  ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(x, y + 18, 13, 10, -0.4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 11, y + 14); ctx.lineTo(x + 11, y - 30); ctx.quadraticCurveTo(x + 30, y - 18, x + 30, y - 4); ctx.stroke(); ctx.restore();
}
function sceneD(t) {
  const hi = t < 41.1;
  const f = hi ? HI : LO, sc = placeFromBase(f);
  const amp = 40 * (hi ? span(t, 36.0, 41.1, 0.6, 0.4) : span(t, 41.1, 46.8, 0.6, 0.4));
  const color = hi ? C.pink : C.gold;
  cellColor = hi ? C.pinkHot : C.goldHot;
  const lit = (s) => clamp(amp / 30) * Math.exp(-(((s - sc) / 0.05) ** 2));
  const { disp } = drawStrip(1, { tone: sc, amp, tt: t * (hi ? 9 : 5), color, cells: seg(t, 36.0, 36.8), cellLit: lit });
  cellColor = null;
  label('base', LINE.x0, LINE.y + 84, { size: 26, color: C.pinkHot });
  label('apex', LINE.x1, LINE.y + 84, { size: 26, color: C.goldHot });
  label('hair cells and their nerve fibres · diagram', W / 2, 560, { size: 22, color: C.faint });
  // pulses climbing the lit fibres, and the brain end
  A(seg(t, 36.4, 37.0), () => {
    ctx.save(); ctx.fillStyle = 'rgba(205,184,255,0.25)'; ctx.beginPath(); ctx.ellipse(432, 150, 70, 28, 0, 0, TAU); ctx.fill(); ctx.restore();
    label('to the brain', 432, 118, { size: 26, color: C.lilac });
    for (let j = 0; j < 34; j++) {
      const s = (j + 0.5) / 34, l = lit(s);
      if (l < 0.2) continue;
      const [x, y] = disp[Math.round(s * N)];
      for (let q = 0; q < 2; q++) {
        const u = ((t * 0.9 + q * 0.5 + j * 0.07) % 1);
        const bx = Math.pow(1 - u, 3) * x + 3 * Math.pow(1 - u, 2) * u * x + 3 * (1 - u) * u * u * lerp(x, 432, 0.5) + u * u * u * lerp(x, 432, 0.85);
        const by = Math.pow(1 - u, 3) * (y - 20) + 3 * Math.pow(1 - u, 2) * u * 250 + 3 * (1 - u) * u * u * 200 + u * u * u * 168;
        const gg = ctx.createRadialGradient(bx, by, 0, bx, by, 10); gg.addColorStop(0, hi ? 'rgba(255,198,214,0.95)' : 'rgba(255,231,199,0.95)'); gg.addColorStop(1, 'rgba(255,198,214,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(bx, by, 10, 0, TAU); ctx.fill();
      }
    }
  });
}
function sceneE(t) {
  // under a strobe the fast ripple looks slowed right down, so it is drawn in slow motion, with a soft pulse of light
  const sc = placeFromBase(MID);
  const show = 1 - seg(t, 52.0, 52.8);
  A(show, () => {
    drawStrip(1, { tone: sc, amp: 40 * seg(t, 46.6, 47.4), tt: t * 1.6, color: C.pearl, flakes: 1 });
    ctx.fillStyle = `rgba(240,244,255,${0.04 * (0.5 + 0.5 * Math.sin(t * 5))})`; ctx.fillRect(0, 0, W, H);
    label('strobe light, silver flakes · diagram', W / 2, 560, { size: 22, color: C.faint });
  });
  const a = eout(seg(t, 52.3, 53.1));
  A(a, () => {
    const y0 = 220 + (1 - a) * 16;
    ctx.save(); k.rrect(120, y0, 624, 360, 30); ctx.fillStyle = 'rgba(30,8,24,0.78)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,211,161,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    // a small medal
    ctx.save(); const mg = ctx.createRadialGradient(432 - 12, y0 + 92, 4, 432, y0 + 100, 52);
    mg.addColorStop(0, '#FFF1D6'); mg.addColorStop(0.6, C.gold); mg.addColorStop(1, '#B9864E'); ctx.fillStyle = mg;
    ctx.beginPath(); ctx.arc(432, y0 + 100, 48, 0, TAU); ctx.fill(); ctx.restore();
    font(700, 34, DISPLAY); text('1961', 432, y0 + 112, { align: 'center', color: '#5A3216' });
    label('Georg von Békésy', 432, y0 + 212, { size: 46, color: C.ink, weight: 700 });
    label('Nobel Prize in Physiology or Medicine', 432, y0 + 258, { size: 28, color: C.goldHot });
    label('for his research on how the cochlea works', 432, y0 + 300, { size: 24, color: C.soft });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 700, maxW: 760 };
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
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.pink, '~': C.gold } });
  }
}

Kit.scene({
  width: W, height: H, duration: 62.4,
  fonts: [
    { family: DISPLAY, file: 'CormorantGaramond.woff2' },
    { family: TEXT, file: 'Nunito.woff2' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    const scenes = [[sceneA, T.A, 0, 0], [sceneB, T.B, 0, 0.4], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.4, 0]];
    for (const [fn, [a, b], fi = 0.4, fo = 0.4] of scenes) {
      if (t < a || t > b) continue;
      if (fn === sceneA && t >= T.B[0]) continue; // B continues the same spiral
      A(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
