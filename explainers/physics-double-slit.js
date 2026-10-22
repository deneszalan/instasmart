// Explainer for physics-double-slit: particles sent one at a time each land as a single dot, yet thousands
// of dots build up interference stripes.
// Look: a phosphor detector in a dark lab. Blue-black glass with a faint grid and scan lines, hits that
// flash and fade to green phosphor dots, cyan wave crests in the diagram. Space Grotesk for captions,
// JetBrains Mono for counters and labels.
//
// Sources: Wikipedia, "Double-slit experiment" (the post's source): at low intensity single particles are
// detected as dots and "an interference pattern emerges when these particles are allowed to build up one by
// one"; the modulus squared of the wave gives the probability of detection at each place; far-field
// intensity = cos² fringes × sinc² single-slit envelope; with which-path information the pattern becomes the
// sum of two single-slit patterns; Feynman: "the heart of quantum mechanics"; Merli, Missiroli and Pozzi
// (1974) used single electrons and a biprism. The 1989 work is Tonomura, Endo, Matsuda, Kawasaki and Ezawa,
// "Demonstration of single-electron buildup of an interference pattern", American Journal of Physics 57, 117.
// The scene says what quantum mechanics predicts, and takes no side on what happens between source and screen.
//
// Every hit is sampled in code from that intensity (fixed seed), so the stripes in the dots match the curve.
//
// Scene plan (60 s; captions centred at y = 835, nothing important below y = 930):
//  A  0.0–13.1  Hook. Diagram from above: source, barrier with two slits, screen line; below, the screen
//               face-on. Single hits arrive slowly, each a flash then a dot. "Where would they pile up?"
//  B 13.0–31.7  Build-up: the count accelerates to 12,000; stripes emerge, many bands, dark gaps.
//  C 31.5–45.7  Why: wave crests spread from both slits and overlap; the intensity curve is traced over the
//               dots; bright where the waves reinforce, dark where they cancel; each hit is still one dot.
//  D 45.5–60.0  Which-path detectors: stripes give way to the smooth sum of two single-slit patterns.
//               Then the electron experiments (1974, 1989) and Feynman's line.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#02060A', bg1: '#06121A', glass: '#081A22', grid: 'rgba(120,255,190,0.06)',
  phos: '#7CFFB2', phosDeep: '#2FCB7E', phosSoft: 'rgba(124,255,178,0.7)', cyan: '#6FD6FF', cyanSoft: 'rgba(111,214,255,0.55)',
  text: '#E4F7EE', textSoft: 'rgba(228,247,238,0.7)', textDim: 'rgba(228,247,238,0.48)', amber: '#FFC867',
};
const SANS = 'Space Grotesk', MONO = 'JetBrains Mono';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.text, ...o });
const rrect = (...a) => k.rrect(...a);
const A_ = (a, fn) => k.alpha(a, fn);
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- geometry (diagram seen from above; the screen face-on below shares its x axis) ----------
const G = { src: 128, barrier: 176, line: 336, cx: W / 2, d: 80, a: 20, x0: 92, x1: 772 };
const FACE = { y0: 448, y1: 704 };
const FRINGE = 52;                      // bright-to-bright spacing on the screen, px
const LAMBDA = (FRINGE * G.d) / (G.line - G.barrier); // wavelength in the diagram, px (far-field relation)
const sinc = (u) => (Math.abs(u) < 1e-6 ? 1 : Math.sin(u) / u);
// Far-field two-slit intensity at screen offset u (px from centre): cos² fringes × sinc² envelope.
const I2 = (u) => Math.cos((Math.PI * u) / FRINGE) ** 2 * sinc((Math.PI * u * G.a) / (FRINGE * G.d)) ** 2;
// With which-path information: the sum of two single-slit patterns (each offset by its slit).
const I1 = (u) => 0.5 * (sinc((Math.PI * (u - G.d / 2) * G.a) / (FRINGE * G.d)) ** 2 + sinc((Math.PI * (u + G.d / 2) * G.a) / (FRINGE * G.d)) ** 2);

function sampler(I, seed, n) {
  const bins = 1360, xs = [], cdf = [];
  let acc = 0;
  for (let i = 0; i < bins; i++) { const u = lerp(G.x0 - G.cx, G.x1 - G.cx, (i + 0.5) / bins); acc += I(u); xs.push(u); cdf.push(acc); }
  const r = mulberry32(seed), out = [];
  for (let j = 0; j < n; j++) {
    const v = r() * acc;
    let lo = 0, hi = bins - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cdf[mid] < v) lo = mid + 1; else hi = mid; }
    const u = xs[lo] + (r() - 0.5) * ((G.x1 - G.x0) / bins);
    // height on the face: the slits are long, so hits spread evenly up and down, fading at the edges
    let y = 0; for (let q = 0; q < 3; q++) y += r(); y = (y / 3 - 0.5) * 1.55;
    out.push([G.cx + u, lerp(FACE.y0, FACE.y1, 0.5 + y * 0.5), r()]);
  }
  return out;
}
const N = 12000, N_SLOW = 14;
const HITS = sampler(I2, 1801, N);
const HITS_WP = sampler(I1, 1909, 6000);
// arrival times: 14 single hits slowly, then faster and faster
const ARR = HITS.map((_, i) => (i < N_SLOW ? 5.0 + i * 0.58 : 13.4 + 14.0 * Math.pow((i - N_SLOW + 1) / (N - N_SLOW), 1 / 2.6)));
const ARR_WP = HITS_WP.map((_, i) => 46.4 + 3.0 * Math.pow((i + 1) / HITS_WP.length, 1 / 1.8));
const countAt = (t, arr) => { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) lo = m + 1; else hi = m; } return lo; };

// ---------- timeline ----------
const CUES = [
  [0.5, 4.6, 'Fire particles at two narrow slits, *one at a time*.'],
  [4.7, 8.8, 'Each one lands on the screen as a *single dot*.'],
  [8.9, 13.0, 'Where would you expect them to pile up?'],
  [13.2, 17.4, 'The first dots look random.'],
  [17.5, 22.0, 'But as thousands arrive, *stripes* appear.'],
  [22.1, 27.0, 'Many bright bands, not just two, with dark gaps where almost nothing lands.'],
  [27.1, 31.6, 'That’s an *interference pattern*, the mark of overlapping waves.'],
  [31.8, 36.4, 'Quantum mechanics describes each particle with a ~wave~ that passes both slits.'],
  [36.5, 41.2, 'Where the two waves *reinforce*, hits are likely; where they cancel, rare.'],
  [41.3, 45.6, 'The wave sets the odds; each particle lands in *one* spot.'],
  [45.8, 50.4, 'Detect which slit each one goes through, and the stripes *vanish*.'],
  [50.5, 55.0, 'Electrons do it too, *one at a time*, as experiments showed.'],
  [55.2, 59.8, 'Richard Feynman said it has in it “the heart of quantum mechanics”.'],
];

// ---------- background ----------
let bg = null, glow = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 520, 60, W / 2, 560, 760);
  rad.addColorStop(0, C.bg1); rad.addColorStop(1, C.bg0);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const r = mulberry32(4);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(150,255,210,${r() * 0.035})`; g.fillRect(r() * W, r() * H, 1.3, 1.3); }
  // the screen face
  const { y0, y1 } = FACE;
  g.save();
  g.beginPath(); g.roundRect(G.x0 - 20, y0 - 26, G.x1 - G.x0 + 40, y1 - y0 + 52, 22);
  const sg = g.createLinearGradient(0, y0, 0, y1);
  sg.addColorStop(0, '#071820'); sg.addColorStop(1, '#040E14');
  g.fillStyle = sg; g.fill();
  g.strokeStyle = 'rgba(124,255,178,0.22)'; g.lineWidth = 2; g.stroke();
  g.clip();
  g.strokeStyle = C.grid; g.lineWidth = 1;
  for (let x = G.cx % FRINGE; x < W; x += FRINGE / 2) { g.beginPath(); g.moveTo(x, y0 - 30); g.lineTo(x, y1 + 30); g.stroke(); }
  for (let y = y0; y < y1 + 30; y += 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  for (let y = y0 - 26; y < y1 + 26; y += 3) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, y, W, 1); }
  g.restore();
  // a dot sprite with glow
  glow = document.createElement('canvas'); glow.width = 24; glow.height = 24;
  const q = glow.getContext('2d');
  const gr = q.createRadialGradient(12, 12, 0, 12, 12, 12);
  gr.addColorStop(0, 'rgba(225,255,240,1)'); gr.addColorStop(0.18, 'rgba(124,255,178,0.95)'); gr.addColorStop(0.45, 'rgba(47,203,126,0.35)'); gr.addColorStop(1, 'rgba(47,203,126,0)');
  q.fillStyle = gr; q.fillRect(0, 0, 24, 24);
}

function header() {
  font(700, 24); text('RECKON', 64, 84, { color: C.phos, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 18;
  font(400, 22, MONO); text('PHYSICS · QUANTUM', 64 + w + 16, 83, { color: C.textDim });
}

// ---------- diagram from above ----------
function diagram(t, { wp = 0 } = {}) {
  const { src, barrier, line, cx, d, a } = G;
  // the source
  let flash = 0.6 * seg(t, 13.2, 14.0) * (1 - seg(t, 27.4, 28.4));
  for (let i = 0; i < N_SLOW; i++) flash = Math.max(flash, span(t, ARR[i] - 0.32, ARR[i] - 0.02, 0.08, 0.2));
  flash = Math.max(flash, 0.6 * span(t, 46.4, 49.4, 0.3, 0.4));
  ctx.fillStyle = '#1C3340'; rrect(cx - 30, src - 26, 60, 26, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(124,255,178,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
  const fl = ctx.createRadialGradient(cx, src, 0, cx, src, 22);
  fl.addColorStop(0, `rgba(200,255,230,${0.25 + 0.75 * flash})`); fl.addColorStop(1, 'rgba(124,255,178,0)');
  ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(cx, src, 22, 0, 6.29); ctx.fill();
  font(400, 22, MONO); text('source', cx + 46, src - 10, { color: C.textDim, base: 'middle' });
  // the barrier with two slits
  ctx.fillStyle = '#9FB7C2';
  const gaps = [cx - d / 2 - a / 2, cx - d / 2 + a / 2, cx + d / 2 - a / 2, cx + d / 2 + a / 2];
  ctx.fillRect(G.x0, barrier - 4, gaps[0] - G.x0, 8);
  ctx.fillRect(gaps[1], barrier - 4, gaps[2] - gaps[1], 8);
  ctx.fillRect(gaps[3], barrier - 4, G.x1 - gaps[3], 8);
  text('two slits', G.x0, barrier - 22, { color: C.textDim, base: 'middle' });
  // which-path detectors
  if (wp > 0) A_(wp, () => {
    for (const sx of [cx - d / 2, cx + d / 2]) {
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(sx, barrier + 20, 8, 0, 6.29); ctx.fill();
      const pulse = 0.5 + 0.5 * Math.sin(t * 9 + sx);
      ctx.strokeStyle = `rgba(255,200,103,${0.3 + 0.4 * pulse})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, barrier + 20, 14, 0, 6.29); ctx.stroke();
    }
    font(400, 22, MONO); text('which-slit detectors', cx + d / 2 + 30, barrier + 22, { color: C.amber, base: 'middle' });
  });
  // the screen line
  ctx.fillStyle = 'rgba(124,255,178,0.45)'; ctx.fillRect(G.x0, line - 2, G.x1 - G.x0, 4);
  text('screen', G.x0, line + 24, { color: C.textDim, base: 'middle' });
  text('SEEN FROM ABOVE', G.x1, line + 24, { color: C.textDim, align: 'right', base: 'middle' });
}

/** Wave crests from the two slits (and the plane wave above them), drawn on a coarse grid. */
let waveCv = null, waveImg = null;
const WG = { cell: 4 };
function waves(t, a) {
  if (a <= 0) return;
  const w = Math.ceil((G.x1 - G.x0) / WG.cell), h = Math.ceil((G.line - G.src + 10) / WG.cell);
  if (!waveCv) { waveCv = document.createElement('canvas'); waveCv.width = w; waveCv.height = h; waveImg = waveCv.getContext('2d').createImageData(w, h); }
  const kk = (2 * Math.PI) / LAMBDA, om = 2 * Math.PI * 0.9;
  const s1 = G.cx - G.d / 2, s2 = G.cx + G.d / 2;
  const data = waveImg.data;
  for (let j = 0; j < h; j++) {
    const y = G.src - 4 + j * WG.cell;
    for (let i = 0; i < w; i++) {
      const x = G.x0 + i * WG.cell;
      let v = 0;
      if (y < G.barrier) v = Math.cos(kk * (y - G.src) - om * t) * (Math.abs(x - G.cx) < 60 ? 1 : Math.max(0, 1 - (Math.abs(x - G.cx) - 60) / 40));
      else {
        const r1 = Math.hypot(x - s1, y - G.barrier) + 1, r2 = Math.hypot(x - s2, y - G.barrier) + 1;
        const amp = (rr) => 1 / Math.sqrt(1 + rr / 40);
        v = (Math.cos(kk * r1 - om * t) * amp(r1) + Math.cos(kk * r2 - om * t) * amp(r2)) * 0.8;
      }
      const b = Math.max(0, v) ** 1.4;
      const o = (j * w + i) * 4;
      data[o] = 111; data[o + 1] = 214; data[o + 2] = 255; data[o + 3] = Math.min(255, b * 170);
    }
  }
  waveCv.getContext('2d').putImageData(waveImg, 0, 0);
  A_(a, () => {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(waveCv, G.x0, G.src - 4, w * WG.cell, h * WG.cell);
  });
}

// ---------- the screen, face-on ----------
function hits(t, list, arr, { a = 1, recent = true } = {}) {
  const n = countAt(t, arr);
  A_(a, () => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(124,255,178,0.55)';
    const dense = n > 3000;
    for (let i = 0; i < n; i++) {
      const [x, y] = list[i];
      const age = t - arr[i];
      if (recent && age < 0.6) {
        const big = i < 300;
        if (!big && age > 0.3) { ctx.globalAlpha = dense ? 0.55 : 0.85; ctx.fillRect(x - 1.1, y - 1.1, 2.2, 2.2); continue; }
        const s = big ? lerp(3.2, 1, eout(seg(age, 0, 0.6))) : lerp(1.6, 0.8, seg(age, 0, 0.3));
        ctx.globalAlpha = big ? 1 : 0.4; ctx.drawImage(glow, x - 6 * s, y - 6 * s, 12 * s, 12 * s);
        // the same hit on the screen line in the diagram
        if (i < 400) { ctx.globalAlpha = 1 - seg(age, 0.1, 0.6); ctx.drawImage(glow, x - 8, G.line - 8, 16, 16); }
      } else {
        ctx.globalAlpha = dense ? 0.55 : 0.85;
        ctx.fillRect(x - 1.1, y - 1.1, 2.2, 2.2);
      }
    }
    ctx.restore();
  });
  return n;
}
function counter(n, label = 'HITS') {
  font(400, 22, MONO);
  text(label, G.x0, FACE.y0 - 40, { color: C.textDim, base: 'middle' });
  font(600, 30, MONO); text(Kit.fmt(n), G.x0 + 74, FACE.y0 - 40, { color: C.phos, base: 'middle' });
  font(400, 22, MONO); text('SCREEN, FACE-ON', G.x1, FACE.y0 - 40, { color: C.textDim, align: 'right', base: 'middle' });
}
function curve(I, a, color = C.cyan, ink = 1) {
  if (a <= 0) return;
  A_(a, () => {
    ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 12;
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath();
    const n = 340;
    for (let i = 0; i <= n * ink; i++) {
      const x = lerp(G.x0, G.x1, i / n), y = FACE.y1 - 4 - I(x - G.cx) * (FACE.y1 - FACE.y0 - 40);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke(); ctx.restore();
  });
}

// ---------- the frame: one continuous picture, with overlays that come and go ----------
const wpOn = (t) => span(t, 45.6, 50.6, 0.5, 0.5);
function picture(t) {
  const wp = wpOn(t);
  diagram(t, { wp });
  waves(t, span(t, 31.8, 45.7, 0.8, 0.4));
  // the interference hits: dimmed under the curve, swapped out while the detectors are on, faint under the cards
  const mainA = lerp(1, 0.55, seg(t, 36.5, 37.5) * (1 - seg(t, 45.2, 45.8))) * (1 - wp) * lerp(1, 0.3, seg(t, 50.6, 51.4));
  const n = hits(t, HITS, ARR, { a: mainA, recent: t < 31 });
  const nW = hits(t, HITS_WP, ARR_WP, { a: wp });
  A_(wp, () => counter(nW));
  A_(1 - wp, () => counter(n));
}
function overlays(t) {
  // the guess: two bands behind the slits
  A_(span(t, 9.4, 13.4, 0.5, 0.5), () => {
    ctx.setLineDash([8, 8]); ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5;
    for (const sx of [G.cx - G.d / 2, G.cx + G.d / 2]) { rrect(sx - 26, FACE.y0 + 6, 52, FACE.y1 - FACE.y0 - 12, 10); ctx.stroke(); }
    ctx.setLineDash([]);
    font(400, 22, MONO); text('just two bands?', G.cx + G.d / 2 + 44, FACE.y0 + 40, { color: C.amber, base: 'middle' });
  });
  // the bright bands, marked once they show
  A_(span(t, 22.4, 31.7, 0.5, 0.3), () => {
    font(400, 22, MONO);
    for (let m = -3; m <= 3; m++) {
      const x = G.cx + m * FRINGE;
      ctx.fillStyle = C.phos; ctx.beginPath(); ctx.moveTo(x, FACE.y1 + 6); ctx.lineTo(x - 7, FACE.y1 + 18); ctx.lineTo(x + 7, FACE.y1 + 18); ctx.closePath(); ctx.fill();
    }
    text('bright', G.cx + 3 * FRINGE + 22, FACE.y1 + 13, { color: C.phos, base: 'middle' });
  });
  // the wave's odds, traced over the dots
  curve(I2, seg(t, 36.6, 37.2) * (1 - seg(t, 45.2, 45.7)), C.cyan, eio(seg(t, 36.6, 38.6)));
  A_(seg(t, 38.6, 39.2) * (1 - seg(t, 45.2, 45.7)), () => {
    font(400, 22, MONO);
    text('reinforce', G.cx, FACE.y0 + 28, { color: C.cyan, align: 'center', base: 'middle' });
    text('cancel', G.cx + FRINGE * 2.5, FACE.y0 + 28, { color: C.textSoft, align: 'center', base: 'middle' });
    ctx.strokeStyle = C.textSoft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(G.cx + FRINGE * 2.5, FACE.y0 + 44); ctx.lineTo(G.cx + FRINGE * 2.5, FACE.y1 - 14); ctx.stroke();
  });
  // one new hit, big: still a single dot
  A_(span(t, 41.6, 45.6, 0.2, 0.4), () => {
    const [x, y] = [G.cx + FRINGE, (FACE.y0 + FACE.y1) / 2 - 20];
    const p = seg(t, 42.0, 42.6);
    if (p > 0) {
      const s = lerp(4, 1.6, eout(p));
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glow, x - 6 * s, y - 6 * s, 12 * s, 12 * s); ctx.restore();
      ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 18, 0, 6.29); ctx.stroke();
      font(400, 22, MONO); text('one particle, one spot', x + 28, y - 30, { color: C.text, base: 'middle' });
    }
  });
  // which-path: the smooth sum of two single-slit patterns
  curve(I1, seg(t, 48.6, 49.2) * (1 - seg(t, 50.0, 50.5)), C.amber, eio(seg(t, 48.6, 49.8)));
  A_(seg(t, 49.0, 49.5) * (1 - seg(t, 50.0, 50.5)), () => {
    font(400, 22, MONO); text('no stripes: two single-slit patterns, added', G.cx, FACE.y0 + 28, { color: C.amber, align: 'center', base: 'middle' });
  });
  // cards
  const card = (a0, a1, draw) => {
    const p = eout(seg(t, a0, a0 + 0.6)) * (a1 < 60 ? 1 - seg(t, a1 - 0.4, a1) : 1);
    if (p <= 0) return;
    A_(p, () => {
      ctx.save(); ctx.translate(0, (1 - p) * 14);
      rrect(84, 430, W - 168, 290, 18); ctx.fillStyle = 'rgba(3,10,14,0.9)'; ctx.fill();
      ctx.strokeStyle = 'rgba(124,255,178,0.45)'; ctx.lineWidth = 2; ctx.stroke();
      draw(); ctx.restore();
    });
  };
  card(50.6, 55.2, () => {
    font(400, 22, MONO); text('SINGLE ELECTRONS', W / 2, 474, { color: C.textDim, align: 'center', base: 'middle', spacing: '3px' });
    font(700, 40); text('1974', 140, 540, { color: C.phos, base: 'middle' });
    font(500, 28); text('Merli, Missiroli and Pozzi,', 262, 528, { color: C.text, base: 'middle' });
    text('Bologna', 262, 562, { color: C.textSoft, base: 'middle' });
    font(700, 40); text('1989', 140, 640, { color: C.phos, base: 'middle' });
    font(500, 28); text('Tonomura and colleagues,', 262, 622, { color: C.text, base: 'middle' });
    text('Hitachi: “single-electron', 262, 656, { color: C.textSoft, base: 'middle' });
    text('buildup of an interference pattern”', 262, 690, { color: C.textSoft, base: 'middle' });
  });
  card(55.2, 61, () => {
    font(500, 34); text('“…impossible […] to explain', W / 2, 520, { color: C.text, align: 'center', base: 'middle' });
    text('in any classical way, and which', W / 2, 564, { color: C.text, align: 'center', base: 'middle' });
    text('has in it the heart of', W / 2, 608, { color: C.text, align: 'center', base: 'middle' });
    font(700, 34); text('quantum mechanics.”', W / 2, 652, { color: C.phos, align: 'center', base: 'middle' });
    font(400, 22, MONO); text('Richard Feynman', W / 2, 700, { color: C.textDim, align: 'center', base: 'middle' });
  });
  A_(seg(t, 55.8, 56.4), () => { font(400, 22, MONO); text('Source: Wikipedia, “Double-slit experiment”', W / 2, 760, { color: C.textDim, align: 'center', base: 'middle' }); });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 500, maxW: 760 };
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
    k.captions(t, [cue], { x: W / 2, y: 838, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SANS, ink: C.text, marks: { '*': C.phos, '~': C.cyan } });
  }
}

Kit.scene({
  width: W, height: H, duration: 60,
  fonts: [
    { family: SANS, file: 'SpaceGrotesk.woff2', weight: '300 700' },
    { family: MONO, file: 'JetBrainsMono.woff2', weight: '100 800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintBackground();
    ctx.drawImage(bg, 0, 0);
    header();
    A_(eout(seg(t, 0, 0.8)), () => picture(t));
    overlays(t);
    captions(t);
  },
});
