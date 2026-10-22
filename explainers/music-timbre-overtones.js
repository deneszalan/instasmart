// Explainer for music-timbre-overtones: the same note sounds different because of its harmonics.
// Look: a vintage oscilloscope. A brushed olive-steel bezel with screws, a dark CRT with a green
// phosphor graticule, glowing traces and segmented spectrum bars; a second channel in amber.
// Saira for captions and titles, JetBrains Mono for the scope's readouts.
//
// Scene plan (59 s). Captions are centred at y = 830, below the screen; the screen ends at y = 716.
//  A  0.0–9.7   Hook. The scope warms up; CH1 and CH2 show two tones with the same 440 Hz period
//               but different shapes. "Two sounds, same note…" / "So why do they sound different?"
//  B  9.4–23.7  Additive synthesis. One pure 440 Hz sine and its spectrum bar; then harmonics 2–8
//               (880 … 3520 Hz) are added one by one: each appears as a faint sine, then merges into
//               the summed trace while its bar grows. The trace is the real sum, computed per pixel.
//  C 23.4–38.2  Two recipes. Tone A (strengths 1/n) and tone B (a strong 2nd harmonic), scaled to the
//               same RMS loudness, on two channels with paired bars. Then period markers every
//               1/440 s = 2.27 ms show both repeat at the same rate: same pitch.
//  D 37.9–48.5  Envelope. Timebase 50 ms/div: a note with a sharp attack and decay, then one that
//               swells slowly, drawn as dense 440 Hz bands inside their envelopes.
//  E 48.2–59.0  Payoff on the screen: TIMBRE, the three ingredients and the source.
//
// Facts (Wikipedia, "Timbre"; "Additive synthesis"): timbre, also called tone colour, is the difference
// between e.g. a guitar and a piano playing the same note at the same volume; harmonics are whole-number
// multiples of the fundamental, so an A at 440 Hz is a combination of 440, 880, 1320, 1760 Hz and so on;
// the balance of their amplitudes is a major factor in each instrument's sound; timbre depends primarily
// on the frequency spectrum and is also greatly affected by the envelope (attack, decay…). Additive
// synthesis creates timbre by adding sine waves together. Tones A and B are made-up recipes, not
// instruments, and are labelled that way.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bezelHi: '#2C3127', bezelLo: '#11140F', edge: '#4A5242', screen: '#020B05',
  grid: 'rgba(120,255,150,0.11)', gridMajor: 'rgba(120,255,150,0.30)',
  ph: '#7DFF8A', phCore: '#E2FFE6', phGlow: 'rgba(90,255,120,0.85)', phDim: 'rgba(125,255,138,0.40)',
  amber: '#FFC65A', amberCore: '#FFF1D2', amberGlow: 'rgba(255,180,60,0.85)',
  ink: '#ECF6EA', inkSoft: 'rgba(236,246,234,0.70)', label: '#A6F0B0',
};
const TEXT = 'Saira', MONO = 'JetBrains Mono';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- the sound: additive synthesis ----------
const F0 = 440, N = 8;
const HZ = Array.from({ length: N }, (_, i) => F0 * (i + 1));
const rms = (a) => Math.sqrt(a.reduce((s, x) => s + x * x, 0) / 2);
const TONE_A = HZ.map((_, i) => 1 / (i + 1));
const TONE_B_RAW = [0.45, 1.0, 0.3, 0.12, 0.08, 0.05, 0.03, 0.02];
const TONE_B = TONE_B_RAW.map((x) => (x * rms(TONE_A)) / rms(TONE_B_RAW)); // same loudness (RMS) as A
/** The summed wave at time s (seconds): Σ a_n sin(2π n f0 s). */
const wave = (amps, s) => amps.reduce((sum, a, i) => sum + a * Math.sin(2 * Math.PI * HZ[i] * s), 0);
const PERIOD_MS = 1000 / F0;

// ---------- screen geometry ----------
const SX = 56, SY = 150, SW = 752, SH = 566;
const GX = 92, GY = 160, DIV = 68, COLS = 10, ROWS = 8; // graticule: 680 × 544
const GW = DIV * COLS, GH = DIV * ROWS;
const MS_PER_DIV = 0.5; // fast timebase: 5 ms across the screen
const xToMs = (x) => ((x - GX) / DIV) * MS_PER_DIV;
const BASE = GY + DIV * 7; // spectrum baseline
const barX = (i) => GX + DIV * (0.5 + i * (COLS - 1) / (N - 1)) - 0; // bar centres spread over the screen

// ---------- timeline ----------
const T = { A: [0, 9.7], B: [9.4, 23.7], C: [23.4, 38.2], D: [37.9, 48.5], E: [48.2, 59.0] };
const ADD0 = 14.4, ADD_GAP = 1.05, ADD_LEN = 0.8; // harmonic n (2..8) ramps in from ADD0 + (n-2)·ADD_GAP
const addStart = (n) => ADD0 + (n - 2) * ADD_GAP;
const CUES = [
  [0.5, 4.6, 'Two sounds, same note: *A at 440 Hz*.'],
  [4.7, 9.4, 'Same pitch, same loudness. So why do they sound ~different~?'],
  [9.8, 13.8, 'Start with a pure tone: one *sine wave*.'],
  [13.9, 18.6, 'Most notes also carry ~harmonics~ at 2, 3, 4… times the frequency.'],
  [18.7, 23.5, '880, 1320, 1760 Hz… added up, they make *one wave*.'],
  [23.8, 28.4, 'Tone A and tone B use the *same harmonics*…'],
  [28.5, 33.0, '…at ~different strengths~. That mix changes the shape.'],
  [33.1, 38.0, 'Both still repeat 440 times a second, so the *pitch* is the same.'],
  [38.3, 42.8, 'Timbre also lives in how a note *starts* and fades.'],
  [42.9, 48.2, 'A sharp ~attack~ or a slow swell changes the sound too.'],
  [48.6, 53.4, 'That sound fingerprint is *timbre*, or tone colour.'],
  [53.5, 58.8, 'It depends mostly on the ~mix of harmonics~, and on the note’s start and fade.'],
];

// ---------- static background ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bezelHi); lg.addColorStop(0.55, '#1A1E17'); lg.addColorStop(1, C.bezelLo);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // brushed-metal streaks
  const rnd = mulberry32(7);
  for (let i = 0; i < 900; i++) {
    const y = rnd() * H, x = rnd() * W, len = 60 + rnd() * 260;
    g.strokeStyle = rnd() < 0.5 ? `rgba(255,255,240,${0.015 + rnd() * 0.025})` : `rgba(0,0,0,${0.03 + rnd() * 0.05})`;
    g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y + (rnd() - 0.5) * 2); g.stroke();
  }
  // screws
  for (const [x, y] of [[26, 26], [W - 26, H - 26], [26, H - 26]]) {
    const sg = g.createRadialGradient(x - 3, y - 3, 1, x, y, 11);
    sg.addColorStop(0, '#8A9180'); sg.addColorStop(1, '#2A2F25');
    g.fillStyle = sg; g.beginPath(); g.arc(x, y, 10, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - 6, y - 3); g.lineTo(x + 6, y + 3); g.stroke();
  }
  // recessed screen frame
  g.fillStyle = '#060806';
  g.beginPath(); g.roundRect(SX - 16, SY - 16, SW + 32, SH + 32, 34); g.fill();
  g.strokeStyle = C.edge; g.lineWidth = 2;
  g.beginPath(); g.roundRect(SX - 16, SY - 16, SW + 32, SH + 32, 34); g.stroke();
  // CRT glass
  const sg = g.createRadialGradient(W / 2, SY + SH / 2, 60, W / 2, SY + SH / 2, 520);
  sg.addColorStop(0, '#062014'); sg.addColorStop(0.7, '#03100A'); sg.addColorStop(1, '#010503');
  g.fillStyle = sg; g.beginPath(); g.roundRect(SX, SY, SW, SH, 26); g.fill();
  // decorative panel legends below the safe area
  g.font = `500 20px ${MONO}`; g.fillStyle = 'rgba(200,215,190,0.30)'; g.textAlign = 'center';
  ['VOLTS/DIV', 'TIME/DIV', 'TRIGGER', 'INTENSITY'].forEach((s, i) => g.fillText(s, 150 + i * 188, 990));
}

function graticule(on) {
  ctx.save();
  ctx.beginPath(); ctx.roundRect(SX, SY, SW, SH, 26); ctx.clip();
  ctx.globalAlpha = on;
  ctx.lineWidth = 1;
  for (let c = 0; c <= COLS; c++) {
    ctx.strokeStyle = c === COLS / 2 ? C.gridMajor : C.grid;
    ctx.beginPath(); ctx.moveTo(GX + c * DIV, GY); ctx.lineTo(GX + c * DIV, GY + GH); ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.strokeStyle = r === 4 ? C.gridMajor : C.grid;
    ctx.beginPath(); ctx.moveTo(GX, GY + r * DIV); ctx.lineTo(GX + GW, GY + r * DIV); ctx.stroke();
  }
  // minor ticks on the centre axes
  ctx.strokeStyle = C.gridMajor;
  for (let i = 0; i <= COLS * 5; i++) { const x = GX + (i * DIV) / 5; ctx.beginPath(); ctx.moveTo(x, GY + GH / 2 - 4); ctx.lineTo(x, GY + GH / 2 + 4); ctx.stroke(); }
  for (let i = 0; i <= ROWS * 5; i++) { const y = GY + (i * DIV) / 5; ctx.beginPath(); ctx.moveTo(GX + GW / 2 - 4, y); ctx.lineTo(GX + GW / 2 + 4, y); ctx.stroke(); }
  ctx.restore();
}

function screenOverlay() {
  ctx.save();
  ctx.beginPath(); ctx.roundRect(SX, SY, SW, SH, 26); ctx.clip();
  // scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  for (let y = SY; y < SY + SH; y += 3) ctx.fillRect(SX, y, SW, 1);
  // glass curvature: dark corners and a soft reflection
  const vg = ctx.createRadialGradient(W / 2, SY + SH / 2, 220, W / 2, SY + SH / 2, 500);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vg; ctx.fillRect(SX, SY, SW, SH);
  const rg = ctx.createLinearGradient(SX, SY, SX + 260, SY + 220);
  rg.addColorStop(0, 'rgba(255,255,255,0.06)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = rg; ctx.fillRect(SX, SY, SW, SH);
  ctx.restore();
}

// ---------- phosphor drawing ----------
function clipScreen(fn) { ctx.save(); ctx.beginPath(); ctx.roundRect(SX, SY, SW, SH, 26); ctx.clip(); fn(); ctx.restore(); }

/** A glowing trace: y(x) for x across the graticule. */
function trace(fy, { color = C.ph, core = C.phCore, glow = C.phGlow, width = 3, x0 = GX, x1 = GX + GW, step = 1.5 } = {}) {
  const path = new Path2D();
  for (let x = x0; x <= x1 + 0.01; x += step) { const y = fy(x); if (x === x0) path.moveTo(x, y); else path.lineTo(x, y); }
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.shadowColor = glow; ctx.shadowBlur = 16;
  ctx.strokeStyle = color; ctx.lineWidth = width + 2.5; ctx.globalAlpha *= 0.55; ctx.stroke(path);
  ctx.restore();
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = core; ctx.lineWidth = Math.max(1.2, width - 1.4); ctx.stroke(path);
  ctx.restore();
}

/** A waveform of the given harmonic strengths across the fast timebase. */
function waveTrace(amps, cy, scale, opts = {}) {
  trace((x) => cy - scale * wave(amps, xToMs(x) / 1000), opts);
}

/** Segmented phosphor bar from the baseline. */
function bar(cx, w, h, color, glow, a = 1) {
  if (h <= 0.5) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.shadowColor = glow; ctx.shadowBlur = 12; ctx.fillStyle = color;
  const segH = 7, gap = 3;
  for (let y = 0; y < h; y += segH + gap) ctx.fillRect(cx - w / 2, BASE - Math.min(h, y + segH), w, Math.min(segH, h - y));
  ctx.restore();
}

function readout(s, x, y, color = C.label, align = 'left', size = 22) {
  font(500, size, MONO); text(s, x, y, { color, align, base: 'middle' });
}

// ---------- scenes ----------
function sceneA(t) {
  const on = eout(seg(t, 0.2, 1.4));
  const s1 = eout(seg(t, 0.9, 2.2)), s2 = eout(seg(t, 1.6, 2.9));
  clipScreen(() => {
    withAlpha(s1, () => {
      waveTrace(TONE_A, 296, 52 * s1 + 2, {});
      readout('CH1 · TONE A', GX + 12, GY + 26);
    });
    withAlpha(s2, () => {
      waveTrace(TONE_B, 524, 52 * s2 + 2, { color: C.amber, core: C.amberCore, glow: C.amberGlow });
      readout('CH2 · TONE B', GX + 12, GY + DIV * 4 + 26, C.amber);
    });
    withAlpha(on * seg(t, 2.6, 3.4), () => {
      readout('440 Hz', GX + GW - 12, GY + DIV * 3 + 40, C.label, 'right');
      readout('440 Hz', GX + GW - 12, GY + DIV * 7 + 40, C.amber, 'right');
    });
  });
}

function sceneB(t) {
  // strengths so far: the fundamental, then harmonic n ramps in
  const amps = TONE_A.map((a, i) => (i === 0 ? a : a * eio(seg(t, addStart(i + 1), addStart(i + 1) + ADD_LEN))));
  const appear = eout(seg(t, 9.6, 10.6));
  clipScreen(() => {
    // the harmonic about to join, drawn alone and faint
    for (let n = 2; n <= N; n++) {
      const a0 = addStart(n) - 0.55;
      const fa = span(t, a0, addStart(n) + ADD_LEN + 0.2, 0.3, 0.5);
      if (fa <= 0) continue;
      const one = HZ.map((_, i) => (i === n - 1 ? TONE_A[i] : 0));
      withAlpha(fa * 0.8, () => waveTrace(one, 296, 62, { color: C.phDim, core: 'rgba(200,255,210,0.55)', glow: 'rgba(90,255,120,0.4)', width: 2 }));
      withAlpha(fa, () => readout(`+ ${n}× = ${HZ[n - 1]} Hz`, GX + 12, GY + DIV * 3 + 34, C.ph));
    }
    withAlpha(appear, () => {
      waveTrace(amps, 296, 62 * appear + 1, {});
      readout('CH1 · Σ SINE WAVES', GX + 12, GY + 26);
      readout(`${MS_PER_DIV} ms/div`, GX + GW - 12, GY + 26, C.label, 'right');
    });
    // spectrum bars
    withAlpha(eout(seg(t, 10.0, 10.8)), () => {
      for (let i = 0; i < N; i++) {
        const grow = i === 0 ? eout(seg(t, 10.2, 11.0)) : eio(seg(t, addStart(i + 1), addStart(i + 1) + ADD_LEN));
        const x = barX(i);
        bar(x, 40, 140 * amps[i], C.ph, C.phGlow);
        withAlpha(i === 0 ? 1 : seg(t, addStart(i + 1) - 0.4, addStart(i + 1) + 0.1), () => {
          readout(`${i + 1}×`, x, BASE + 22, C.ph, 'center');
          readout(`${HZ[i]}`, x, BASE + 50, C.inkSoft, 'center');
        });
        void grow;
      }
      readout('STRENGTH', GX + 12, GY + DIV * 4 + 30, C.label);
      readout('Hz', GX + GW - 12, GY + DIV * 4 + 30, C.label, 'right');
    });
  });
}

function sceneC(t) {
  const sep = eio(seg(t, 23.5, 24.6));
  const cyA = lerp(296, 236, sep);
  const fb = eout(seg(t, 23.8, 25.2));
  clipScreen(() => {
    waveTrace(TONE_A, cyA, lerp(62, 40, sep), {});
    readout('CH1 · TONE A', GX + 12, GY + 26);
    withAlpha(fb, () => {
      waveTrace(TONE_B, 392, 40 * fb + 1, { color: C.amber, core: C.amberCore, glow: C.amberGlow });
      readout('CH2 · TONE B', GX + 12, GY + DIV * 4 + 6, C.amber);
    });
    // bars: A stays, B grows beside it
    const gb = eio(seg(t, 28.4, 30.2));
    for (let i = 0; i < N; i++) {
      const x = barX(i);
      bar(x - lerp(0, 13, gb), lerp(40, 22, gb), 140 * TONE_A[i], C.ph, C.phGlow);
      withAlpha(gb, () => bar(x + 13, 22, 140 * TONE_B[i] * gb, C.amber, C.amberGlow));
      readout(`${i + 1}×`, x, BASE + 22, C.ph, 'center');
      readout(`${HZ[i]}`, x, BASE + 50, C.inkSoft, 'center');
    }
    withAlpha(gb, () => {
      readout('same loudness (RMS)', GX + GW - 12, GY + DIV * 5 + 6, C.inkSoft, 'right');
      font(500, 22, MONO); const lw = ctx.measureText('same loudness (RMS)').width;
      readout('A', GX + GW - 12 - lw - 62, GY + DIV * 5 + 6, C.ph);
      readout('B', GX + GW - 12 - lw - 34, GY + DIV * 5 + 6, C.amber);
    });
    // period markers: both channels repeat every 1/440 s
    const pm = span(t, 33.2, 38.3, 0.5, 0.4);
    withAlpha(pm, () => {
      const px = (PERIOD_MS / MS_PER_DIV) * DIV;
      ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = C.phCore; ctx.lineWidth = 2;
      for (let x = GX; x <= GX + GW; x += px) {
        const grow = eout(seg(t, 33.3 + (x - GX) / px * 0.25, 33.9 + (x - GX) / px * 0.25));
        ctx.beginPath(); ctx.moveTo(x, GY + 40); ctx.lineTo(x, lerp(GY + 40, GY + DIV * 4.6, grow)); ctx.stroke();
      }
      ctx.restore();
      const y = GY + 52;
      ctx.save(); ctx.strokeStyle = C.phCore; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(GX + px + 6, y); ctx.lineTo(GX + 2 * px - 6, y); ctx.stroke(); ctx.restore();
      font(600, 22, MONO);
      const label = `${PERIOD_MS.toFixed(2)} ms = 1/440 s`;
      const lw = ctx.measureText(label).width + 20;
      ctx.fillStyle = 'rgba(2,11,5,0.85)'; ctx.fillRect(GX + 1.5 * px - lw / 2, y - 16, lw, 32);
      readout(label, GX + 1.5 * px, y, C.phCore, 'center');
    });
  });
}

// note envelopes at the slow timebase (50 ms/div: 0.5 s across)
const SLOW_MS = 50;
const envSharp = (ms) => (ms < 0 ? 0 : ms < 25 ? ms / 25 : Math.exp(-(ms - 25) / 140));
const envSwell = (ms) => (ms < 0 ? 0 : ms < 220 ? Math.pow(ms / 220, 1.6) : ms < 330 ? 1 : Math.max(0, 1 - (ms - 330) / 120));
function envelopeBand(env, cy, amp, color, glow, reveal) {
  const x1 = GX + GW * reveal;
  if (x1 <= GX + 1) return;
  const top = [], bot = [];
  for (let x = GX; x <= x1; x += 2) {
    const ms = ((x - GX) / DIV) * SLOW_MS - 30;
    const e = env(ms) * amp;
    top.push([x, cy - e]); bot.push([x, cy + e]);
  }
  ctx.save();
  // the 440 Hz carrier is far too dense to resolve at this timebase: it fills the envelope
  ctx.globalAlpha *= 0.45; ctx.fillStyle = color; ctx.shadowColor = glow; ctx.shadowBlur = 10;
  ctx.beginPath(); top.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha *= 0.55;
  for (let i = 0; i < top.length; i++) { ctx.beginPath(); ctx.moveTo(top[i][0], top[i][1]); ctx.lineTo(bot[i][0], bot[i][1]); ctx.stroke(); }
  ctx.restore();
  trace((x) => { const ms = ((x - GX) / DIV) * SLOW_MS - 30; return cy - env(ms) * amp; }, { color, glow, x1, width: 2.4, core: color });
  trace((x) => { const ms = ((x - GX) / DIV) * SLOW_MS - 30; return cy + env(ms) * amp; }, { color, glow, x1, width: 2.4, core: color });
}
function sceneD(t) {
  clipScreen(() => {
    readout(`${SLOW_MS} ms/div`, GX + GW - 12, GY + 26, C.label, 'right');
    const r1 = eio(seg(t, 38.6, 40.6));
    readout('NOTE 1 · SHARP ATTACK', GX + 12, GY + 26);
    envelopeBand(envSharp, 300, 110, C.ph, C.phGlow, r1);
    withAlpha(span(t, 40.4, 48.6, 0.5, 0.3), () => {
      const ax = GX + (55 / SLOW_MS) * DIV;
      ctx.save(); ctx.strokeStyle = C.phCore; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(ax, 176); ctx.lineTo(ax, 424); ctx.stroke(); ctx.restore();
      readout('ATTACK', ax + 12, 430, C.phCore);
      readout('DECAY', GX + DIV * 4.6, 250, C.ph);
    });
    const r2 = eio(seg(t, 43.2, 45.4));
    withAlpha(seg(t, 42.9, 43.4), () => readout('NOTE 2 · SLOW SWELL', GX + 12, GY + DIV * 4 + 30, C.amber));
    envelopeBand(envSwell, 548, 92, C.amber, C.amberGlow, r2);
  });
}

function sceneE(t) {
  clipScreen(() => {
    withAlpha(0.22, () => waveTrace(TONE_A, 296, 40, {}));
    withAlpha(0.22, () => waveTrace(TONE_B, 296, 40, { color: C.amber, core: C.amberCore, glow: C.amberGlow }));
    const a = eout(seg(t, 48.5, 49.6));
    withAlpha(a, () => {
      ctx.save(); ctx.shadowColor = C.phGlow; ctx.shadowBlur = 24;
      font(800, 116); text('TIMBRE', W / 2, 300 + (1 - a) * 16, { color: C.phCore, align: 'center', base: 'middle', spacing: '10px' });
      ctx.restore();
    });
    const items = [['1', 'which harmonics', 49.6], ['2', 'how strong each one is', 50.4], ['3', 'how the note starts and fades', 51.2]];
    items.forEach(([n, s, at], i) => withAlpha(eout(seg(t, at, at + 0.6)), () => {
      const y = 420 + i * 64;
      font(600, 30, MONO); text(n, 180, y, { color: i === 2 ? C.amber : C.ph, base: 'middle' });
      font(600, 38); text(s, 228, y, { color: C.ink, base: 'middle' });
    }));
    withAlpha(eout(seg(t, 52.2, 53.0)), () => {
      readout('Source: Wikipedia, “Timbre”', W / 2, 640, 'rgba(236,246,234,0.62)', 'center');
      readout('Waves built in code by adding sines', W / 2, 672, 'rgba(236,246,234,0.62)', 'center');
    });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 600, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 832, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.ph, '~': C.amber } });
  }
}

Kit.scene({
  width: W, height: H, duration: 59,
  fonts: [
    { family: TEXT, file: 'Saira.woff2', weight: '100 900' },
    { family: MONO, file: 'JetBrainsMono.woff2', weight: '100 800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    font(700, 22); text('RECKON', 64, 84, { color: C.ph, spacing: '3px' });
    const rw = ctx.measureText('RECKON').width + 18;
    font(500, 22, MONO); text('MUSIC · ACOUSTICS', 64 + rw + 16, 84, { color: C.inkSoft, spacing: '1px' });
    graticule(eout(seg(t, 0.1, 1.0)));
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    screenOverlay();
    captions(t);
  },
});
