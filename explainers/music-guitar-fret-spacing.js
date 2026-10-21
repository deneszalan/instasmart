// Explainer for music-guitar-fret-spacing: frets crowd together because each one shortens the
// vibrating string by the same ratio, the twelfth root of 2.
// Look: a luthier's bench under an amber lamp. A guitar seen from the front, neck to the left: a
// rosewood fretboard with drawn grain, nickel-silver frets, pearl dot inlays, a sunburst spruce top
// with a rosette, a rosewood bridge and a bone saddle. Oswald (condensed) for numbers and labels,
// Lora for captions.
//
// Geometry (all computed below): the string runs from the nut (x = 72) to the saddle (x = 792), an
// ideal 650 mm scale. Fret n sits at 650 / 2^(n/12) mm from the bridge, so the 12th fret is exactly
// halfway. The vibrating length, frequency ratio, gaps and the "5.6% narrower" figure all come from
// that formula. The neck is drawn wider than a real one so the vibrating string can be seen: it is
// a diagram, and the alt text says so.
//
// Scene plan (53.5 s). Everything important sits above y = 930; captions are centred at y = 834.
//  A  0.0– 4.8  Hook. The guitar fades in; brackets mark a wide gap (fret 1), a narrower one (12)
//               and a narrow one (18).          "Why do guitar frets get closer together up the neck?"
//  B  4.8–12.8  The frets dim to ghosts; the string is plucked and vibrates along its whole length;
//               LENGTH / FREQUENCY readouts and a little trace. A stop slides from the nut towards
//               the middle: the length shrinks and the frequency climbs (f ∝ 1/L).
//                                                "Pluck a string, and its whole length vibrates."
//                                                "Its pitch depends on that length: shorter means higher."
//  C 12.8–21.2  The stop arrives at the halfway point: 325.0 mm, ×2.0000, an OCTAVE tag.
//                                                "Stop it at the halfway point, and the frequency doubles."
//                                                "That's one octave up: the same note, higher."
//  D 21.2–40.0  A pitch ruler of 12 equal steps; a ×1.0595 bracket hops along it. Then the frets are
//               placed one by one (30.5–35.8), each stopping the string at 1/1.0595 of the length
//               before; a bar shows the vibrating length shrinking; fret 12 lands on the halfway point.
//                                                "Modern tuning splits each octave into 12 equal steps."
//                                                "Each step multiplies the frequency by 1.0595, the twelfth root of 2."
//                                                "So each fret shortens the vibrating length by that same ratio."
//                                                "After 12 steps, the string is exactly half as long."
//  E 40.0–48.5  Bars under the neck measure the 12 gaps, 36.5 mm down to 19.3 mm; their tops lie
//               on one straight line aimed at the bridge (each gap is a fixed share of what's left).
//                                                "A fixed ratio of a shrinking length makes shrinking gaps."
//                                                "Each gap is about 5.6% narrower than the one before."
//  F 48.5–53.5  Payoff. Lines fan from the equal pitch steps to the unequal frets; frets 13–19 return.
//                                                "Equal steps in pitch mean shrinking steps in length."
//
// Facts: Wikipedia "Fret": the ratio of the distances of two consecutive frets to the bridge is the
// twelfth root of two, about 1.059463; each fret is one semitone, twelve to the octave; "the twelfth
// fret should divide the string in two exact halves", and the bridge is adjusted slightly to
// compensate for the extra tension of a pressed string (so these are ideal positions).
// Wikipedia "Equal temperament": semitone ratio 12th root of 2 ≈ 1.05946; twelve make an octave.
// Wikipedia "Octave": double the frequency; the ear hears both notes as essentially "the same".
// Wikipedia "Mersenne's laws": frequency inversely proportional to length; half the length is an
// octave higher. Wikipedia "Scale length": Torres's classical scale of about 650 mm (25.6 in).
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  ink: '#FBEFD9', soft: 'rgba(251,239,217,0.72)', faint: 'rgba(251,239,217,0.32)',
  amber: '#FFB547', amberLight: '#FFD9A0', amberDeep: '#C9771E', pearl: '#9EDBD6',
  bone: '#F1E4C8', steel: '#DADDE0', bronze: '#C99A5B',
};
const NUM = 'Oswald', TXT = 'Lora';

let k, ctx;
const font = (weight, size, family = NUM) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const SCALE_MM = 650;
const RATIO = Math.pow(2, 1 / 12);                           // 1.059463…
const RATIO_TXT = RATIO.toFixed(4);                           // "1.0595"
const NARROWER = (Math.round((1 - 1 / RATIO) * 1000) / 10).toFixed(1); // "5.6": each gap vs the one before
const NUT_X = 72, BR_X = 792, LPX = BR_X - NUT_X;            // 720 px stand for 650 mm
const MM = LPX / SCALE_MM;
const LAST = 19;                                              // frets on the board
const FX = Array.from({ length: LAST + 1 }, (_, n) => BR_X - LPX / Math.pow(2, n / 12)); // FX[0] is the nut
const lenMM = (n) => SCALE_MM / Math.pow(2, n / 12);         // vibrating length when stopped at fret n
const gapMM = (n) => lenMM(n - 1) - lenMM(n);                // fret n-1 to fret n
const Y0 = 430;                                               // the strings' centre line
const BOARD_END = FX[LAST] + 13;
const hw = (x) => lerp(58, 70, clamp((x - NUT_X) / (BOARD_END - NUT_X)));   // half-width of the neck
const strY = (i, x) => Y0 + (i - 2.5) * lerp(16.5, 21, clamp((x - NUT_X) / LPX));
const HI = 2;                                                 // the string we pluck
const INLAYS = [3, 5, 7, 9, 12, 15, 17, 19];

// ---------- timeline ----------
const T = { A: [0, 4.9] };
const PLACE = [null, 30.5, 31.4, 32.2];
for (let n = 4; n <= 12; n++) PLACE[n] = 32.9 + (n - 4) * 0.36; // fret 12 lands at 35.8
const PLUCK = 5.7, GLIDE = [9.6, 15.4], RELEASE = [21.4, 22.4], LIFT = [40.4, 41.2];
const BARS = 40.4, FAN = [48.9, 50.7], UPPER = 49.6, END = 53.5;
const CUES = [
  [0.4, 4.7, 'Why do guitar frets get *closer together* up the neck?'],
  [4.9, 8.7, 'Pluck a string, and its whole length vibrates.'],
  [8.8, 12.8, 'Its pitch depends on that length: *shorter* means *higher*.'],
  [12.9, 17.2, 'Stop it at the *halfway* point, and the frequency *doubles*.'],
  [17.3, 21.0, 'That’s one ~octave~ up: the same note, higher.'],
  [21.2, 25.3, 'Modern tuning splits each octave into ~12 equal steps~.'],
  [25.4, 30.1, `Each step multiplies the frequency by ~${RATIO_TXT},~ the twelfth root of 2.`],
  [30.2, 35.6, 'So each fret shortens the vibrating length by that *same ratio*.'],
  [35.8, 39.8, 'After 12 steps, the string is exactly *half* as long.'],
  [40.0, 44.2, 'A fixed ratio of a shrinking length makes *shrinking gaps*.'],
  [44.3, 48.4, `Each gap is about *${NARROWER}% narrower* than the one before.`],
  [48.6, 53.2, 'Equal steps in ~pitch~ mean shrinking steps in *length*.'],
];

// ---------- seeded randomness ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const canvas = () => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return cv; };

// ---------- the bench, the body and the fretboard, painted once ----------
function paintBench() {
  const cv = canvas(), g = cv.getContext('2d');
  const base = g.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, '#1D110A'); base.addColorStop(0.6, '#140B06'); base.addColorStop(1, '#0B0603');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  // dark walnut grain, running across the bench
  const rnd = rng(3);
  for (let i = 0; i < 170; i++) {
    const y0 = rnd() * H, amp = 2 + rnd() * 9, fr = 0.002 + rnd() * 0.006, ph = rnd() * TAU;
    g.strokeStyle = rnd() < 0.5 ? `rgba(90,52,28,${0.10 + rnd() * 0.16})` : `rgba(0,0,0,${0.12 + rnd() * 0.2})`;
    g.lineWidth = 0.6 + rnd() * 2.4;
    g.beginPath();
    for (let x = -10; x <= W + 10; x += 12) {
      const y = y0 + amp * Math.sin(x * fr + ph) + 3 * Math.sin(x * fr * 3.1 + ph * 2);
      x < 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
  // the lamp: a warm pool of light, upper left
  const lamp = g.createRadialGradient(260, 330, 20, 300, 380, 760);
  lamp.addColorStop(0, 'rgba(255,170,80,0.20)'); lamp.addColorStop(0.5, 'rgba(255,140,50,0.07)'); lamp.addColorStop(1, 'rgba(255,140,50,0)');
  g.fillStyle = lamp; g.fillRect(0, 0, W, H);
  return cv;
}

/** The body outline: upper bout from the 12th fret, a waist, the lower bout running off the right edge. */
function bodyPath(g) {
  const top = [[426, Y0 - 44], [426, Y0 - 150], [486, Y0 - 186], [568, Y0 - 186], [640, Y0 - 186], [668, Y0 - 160], [728, Y0 - 160], [800, Y0 - 160], [850, Y0 - 228], [930, Y0 - 236]];
  g.beginPath();
  g.moveTo(top[0][0], top[0][1]);
  for (let i = 1; i < top.length; i += 3) g.bezierCurveTo(...top[i], ...top[i + 1], ...top[i + 2]);
  g.lineTo(930, Y0 + 236);
  for (let i = top.length - 2; i >= 1; i -= 3) {
    const p = top[i], q = top[i - 1], r = top[i - 2];
    g.bezierCurveTo(p[0], 2 * Y0 - p[1], q[0], 2 * Y0 - q[1], r[0], 2 * Y0 - r[1]);
  }
  g.closePath();
}
const HOLE = { x: 640, r: 54 };

function paintBody() {
  const cv = canvas(), g = cv.getContext('2d');
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 40; g.shadowOffsetY = 14;
  bodyPath(g); g.fillStyle = '#2A1309'; g.fill();
  g.restore();
  g.save(); bodyPath(g); g.clip();
  // sunburst: honey in the middle of the lower bout, darkening to the edges
  const sb = g.createRadialGradient(830, Y0, 30, 800, Y0, 520);
  sb.addColorStop(0, '#F2BE68'); sb.addColorStop(0.32, '#E09A45'); sb.addColorStop(0.6, '#A65A22'); sb.addColorStop(0.82, '#5A2A10'); sb.addColorStop(1, '#241006');
  g.fillStyle = sb; g.fillRect(380, 0, W, H);
  // spruce grain along the length
  const rnd = rng(17);
  for (let y = Y0 - 240; y < Y0 + 240; y += 3 + rnd() * 5) {
    g.strokeStyle = `rgba(70,30,8,${0.06 + rnd() * 0.12})`; g.lineWidth = 0.6 + rnd() * 1.2;
    g.beginPath(); g.moveTo(400, y); g.bezierCurveTo(560, y + rnd() * 4 - 2, 720, y + rnd() * 4 - 2, 900, y + rnd() * 3 - 1.5); g.stroke();
  }
  // lamp sheen
  const sh = g.createLinearGradient(420, Y0 - 240, 700, Y0 + 200);
  sh.addColorStop(0, 'rgba(255,220,160,0.14)'); sh.addColorStop(0.5, 'rgba(255,220,160,0.0)');
  g.fillStyle = sh; g.fillRect(380, 0, W, H);
  g.restore();
  // binding
  bodyPath(g); g.strokeStyle = '#E9D8B4'; g.lineWidth = 5; g.stroke();
  bodyPath(g); g.strokeStyle = 'rgba(30,12,4,0.8)'; g.lineWidth = 1.2; g.stroke();
  // rosette and sound hole
  const { x, r } = HOLE;
  for (const [rr, col, lw] of [[r + 24, '#E9D8B4', 2], [r + 21, '#1A0B04', 3], [r + 6, '#1A0B04', 3], [r + 3, '#E9D8B4', 2]]) {
    g.beginPath(); g.arc(x, Y0, rr, 0, TAU); g.strokeStyle = col; g.lineWidth = lw; g.stroke();
  }
  const segs = 72;
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * TAU, a1 = ((i + 1) / segs) * TAU;
    g.beginPath(); g.arc(x, Y0, r + 19, a0, a1); g.arc(x, Y0, r + 8, a1, a0, true); g.closePath();
    g.fillStyle = ['#7A3B16', '#D8B47A', '#3B1A0A', '#B57A3C'][i % 4]; g.fill();
  }
  const hole = g.createRadialGradient(x - 10, Y0 - 12, 4, x, Y0, r);
  hole.addColorStop(0, '#1A0D06'); hole.addColorStop(1, '#070302');
  g.beginPath(); g.arc(x, Y0, r, 0, TAU); g.fillStyle = hole; g.fill();
  // the bridge: rosewood with wings, a bone saddle and six pins
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 10; g.shadowOffsetX = 4; g.shadowOffsetY = 5;
  g.beginPath();
  g.moveTo(770, Y0 - 66);
  g.bezierCurveTo(770, Y0 - 96, 790, Y0 - 112, 806, Y0 - 112);
  g.bezierCurveTo(826, Y0 - 112, 842, Y0 - 92, 848, Y0 - 66);
  g.lineTo(848, Y0 + 66);
  g.bezierCurveTo(842, Y0 + 92, 826, Y0 + 112, 806, Y0 + 112);
  g.bezierCurveTo(790, Y0 + 112, 770, Y0 + 96, 770, Y0 + 66);
  g.closePath();
  const bg = g.createLinearGradient(770, 0, 848, 0);
  bg.addColorStop(0, '#4A2416'); bg.addColorStop(0.5, '#3A1A0F'); bg.addColorStop(1, '#2A120A');
  g.fillStyle = bg; g.fill();
  g.restore();
  g.fillStyle = C.bone; g.fillRect(BR_X - 3, Y0 - 64, 6, 128);
  for (let i = 0; i < 6; i++) {
    const y = strY(i, BR_X);
    g.beginPath(); g.arc(826, y, 5, 0, TAU); g.fillStyle = '#EFE3C9'; g.fill();
    g.beginPath(); g.arc(826, y, 1.8, 0, TAU); g.fillStyle = '#2A120A'; g.fill();
  }
  return cv;
}

function boardPath(g, x0 = NUT_X, x1 = BOARD_END) {
  g.beginPath();
  g.moveTo(x0, Y0 - hw(x0)); g.lineTo(x1, Y0 - hw(x1)); g.lineTo(x1, Y0 + hw(x1)); g.lineTo(x0, Y0 + hw(x0)); g.closePath();
}
function paintBoard() {
  const cv = canvas(), g = cv.getContext('2d');
  // headstock running off the left edge
  g.beginPath(); g.moveTo(NUT_X, Y0 - hw(NUT_X)); g.lineTo(-4, Y0 - hw(NUT_X) - 12); g.lineTo(-4, Y0 + hw(NUT_X) + 12); g.lineTo(NUT_X, Y0 + hw(NUT_X)); g.closePath();
  g.fillStyle = '#1C0D07'; g.fill();
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 18; g.shadowOffsetY = 8;
  boardPath(g); g.fillStyle = '#3A1D12'; g.fill();
  g.restore();
  g.save(); boardPath(g); g.clip();
  const base = g.createLinearGradient(0, Y0 - 70, 0, Y0 + 70);
  base.addColorStop(0, '#4A2617'); base.addColorStop(0.5, '#3B1E12'); base.addColorStop(1, '#2C150C');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  // rosewood grain: long wavy streaks along the neck, with darker figure and open pores
  const rnd = rng(29);
  for (let i = 0; i < 230; i++) {
    const y0 = Y0 - 76 + rnd() * 152, amp = 0.6 + rnd() * 3.2, fr = 0.004 + rnd() * 0.02, ph = rnd() * TAU;
    const dark = rnd() < 0.62;
    g.strokeStyle = dark ? `rgba(18,6,2,${0.12 + rnd() * 0.3})` : `rgba(122,62,34,${0.08 + rnd() * 0.22})`;
    g.lineWidth = 0.5 + rnd() * (dark ? 2.6 : 1.6);
    const xa = NUT_X - 10 + rnd() * 200, xb = xa + 120 + rnd() * 420;
    g.beginPath();
    for (let x = xa; x <= xb; x += 6) {
      const y = y0 + amp * Math.sin(x * fr + ph) + 0.8 * Math.sin(x * 0.07 + ph);
      x === xa ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
  for (let i = 0; i < 520; i++) {
    g.fillStyle = `rgba(10,3,1,${0.25 + rnd() * 0.35})`;
    g.beginPath(); g.ellipse(NUT_X + rnd() * (BOARD_END - NUT_X), Y0 - 70 + rnd() * 140, 1.2 + rnd() * 2.4, 0.5 + rnd() * 0.5, 0, 0, TAU); g.fill();
  }
  // a soft lamp highlight along the upper edge
  const hl = g.createLinearGradient(0, Y0 - 70, 0, Y0);
  hl.addColorStop(0, 'rgba(255,190,120,0.10)'); hl.addColorStop(1, 'rgba(255,190,120,0)');
  g.fillStyle = hl; g.fillRect(0, 0, W, H);
  g.restore();
  // edges
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(NUT_X, Y0 + hw(NUT_X)); g.lineTo(BOARD_END, Y0 + hw(BOARD_END)); g.stroke();
  g.strokeStyle = 'rgba(255,200,150,0.18)';
  g.beginPath(); g.moveTo(NUT_X, Y0 - hw(NUT_X)); g.lineTo(BOARD_END, Y0 - hw(BOARD_END)); g.stroke();
  return cv;
}

let BENCH, BODY, BOARD;
const MOTES = (() => { const r = rng(41); return Array.from({ length: 36 }, () => ({ x: r() * W, y: r() * H, s: 0.6 + r() * 1.8, v: 4 + r() * 10, p: r() * TAU })); })();

// ---------- what the string is doing ----------
/** Where the string is stopped (the vibrating part runs from here to the saddle). */
function stopX(t) {
  let x = NUT_X;
  x = lerp(x, FX[12], eio(seg(t, GLIDE[0], GLIDE[1])));
  x = lerp(x, NUT_X, eio(seg(t, RELEASE[0], RELEASE[1])));
  for (let n = 1; n <= 12; n++) x = lerp(x, FX[n], eio(seg(t, PLACE[n], PLACE[n] + 0.3)));
  x = lerp(x, NUT_X, eio(seg(t, LIFT[0], LIFT[1])));
  return x;
}
const ratioAt = (t) => LPX / (BR_X - stopX(t));
const pluckEnv = (t, t0) => (t < t0 ? 0 : clamp((t - t0) / 0.12) * (0.55 + 0.45 * Math.exp(-(t - t0) / 1.1)));
function amplitude(t) {
  let a = pluckEnv(t, PLUCK);
  a = Math.max(a, pluckEnv(t, GLIDE[1]) * 0.9);
  for (let n = 1; n <= 12; n++) a = Math.max(a, pluckEnv(t, PLACE[n] + 0.15));
  return a * (1 - 0.8 * seg(t, LIFT[0], LIFT[1] + 0.4)) * (1 - 0.2 * seg(t, 51.5, END));
}
/** The vibration's phase: the integral of a slowed-down frequency, so speed changes never jump. */
const BASE_HZ = 1.8;
function phase(t) {
  const dt = 1 / 120;
  let p = 0;
  for (let s = 0; s < t; s += dt) p += BASE_HZ * ratioAt(s) * Math.min(dt, t - s);
  return TAU * p;
}

// ---------- drawing pieces ----------
const ghostAlpha = (t) => lerp(1, 0.13, eio(seg(t, 5.0, 5.8)));
/** How solid fret n is: ghosted from scene B on, placed again in D (1–12) or F (13–19). */
function fretAlpha(n, t) {
  const ghost = ghostAlpha(t);
  if (n <= 12) return Math.max(ghost, seg(t, PLACE[n], PLACE[n] + 0.25));
  return lerp(ghost, 1, eio(seg(t, UPPER + 0.12 * (n - 13), UPPER + 0.12 * (n - 13) + 0.45)));
}
function fret(x, a, grow = 1) {
  if (a <= 0.01) return;
  withAlpha(a, () => {
    const h = hw(x) + 1.5, top = Y0 - h * grow, bot = Y0 + h * grow;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x + 2, top + 2, 3, bot - top);
    const g = ctx.createLinearGradient(x - 3, 0, x + 3, 0);
    g.addColorStop(0, '#61666D'); g.addColorStop(0.35, '#F4F5F2'); g.addColorStop(0.6, '#B9BDC2'); g.addColorStop(1, '#5A5F66');
    ctx.fillStyle = g; ctx.fillRect(x - 2.6, top, 5.2, bot - top);
  });
}
function pearl(x, y, r, t, a) {
  withAlpha(a, () => {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 0.5, x, y, r);
    const sh = 0.5 + 0.5 * Math.sin(t * 0.8 + x * 0.05);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.45, `rgb(${Math.round(lerp(236, 214, sh))},${Math.round(lerp(226, 236, sh))},${Math.round(lerp(238, 240, sh))})`);
    g.addColorStop(1, '#AFC4CF');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.stroke();
  });
}
function strings(t) {
  const widths = [3.3, 2.9, 2.5, 2.0, 1.5, 1.2];
  const xs = stopX(t), A = 17 * amplitude(t) * Math.sqrt((BR_X - xs) / LPX), ph = phase(t);
  for (let i = 0; i < 6; i++) {
    const wound = i < 4;
    ctx.lineCap = 'round';
    // shadow on the board
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = widths[i];
    ctx.beginPath(); ctx.moveTo(-4, strY(i, NUT_X) + 3 + (i - 2.5) * -1.5); ctx.lineTo(NUT_X, strY(i, NUT_X) + 3); ctx.lineTo(BR_X, strY(i, BR_X) + 4); ctx.stroke();
    if (i === HI && A > 0.05) continue;
    ctx.strokeStyle = wound ? C.bronze : C.steel; ctx.lineWidth = widths[i];
    ctx.beginPath(); ctx.moveTo(-4, strY(i, NUT_X) + (i - 2.5) * -1.5); ctx.lineTo(NUT_X, strY(i, NUT_X)); ctx.lineTo(BR_X, strY(i, BR_X)); ctx.lineTo(826, strY(i, BR_X)); ctx.stroke();
    if (wound) { ctx.strokeStyle = 'rgba(255,240,210,0.35)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(NUT_X, strY(i, NUT_X) - widths[i] * 0.25); ctx.lineTo(BR_X, strY(i, BR_X) - widths[i] * 0.25); ctx.stroke(); }
  }
  if (A <= 0.05) return;
  // the vibrating string: a blurred envelope plus the moving line
  const y = (x) => strY(HI, x);
  ctx.strokeStyle = C.bronze; ctx.lineWidth = widths[HI];
  ctx.beginPath(); ctx.moveTo(-4, y(NUT_X) + 1.5); ctx.lineTo(NUT_X, y(NUT_X)); ctx.lineTo(xs, y(xs)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(BR_X, y(BR_X)); ctx.lineTo(826, y(BR_X)); ctx.stroke();
  const N = 70, len = BR_X - xs;
  ctx.beginPath();
  for (let j = 0; j <= N; j++) { const u = j / N, x = xs + u * len; const yy = y(x) - A * Math.sin(Math.PI * u); j ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
  for (let j = N; j >= 0; j--) { const u = j / N, x = xs + u * len; ctx.lineTo(x, y(x) + A * Math.sin(Math.PI * u)); }
  ctx.closePath(); ctx.fillStyle = 'rgba(255,181,71,0.34)'; ctx.fill();
  ctx.save();
  ctx.shadowColor = 'rgba(255,181,71,0.9)'; ctx.shadowBlur = 10;
  ctx.strokeStyle = C.amberLight; ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let j = 0; j <= N; j++) { const u = j / N, x = xs + u * len; const yy = y(x) + A * Math.sin(Math.PI * u) * Math.cos(ph); j ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
  ctx.stroke();
  ctx.restore();
}
/** The stop: a soft amber pad pressing the string just behind the stopping point. */
function stopPad(t) {
  const xs = stopX(t);
  const on = Math.max(seg(t, GLIDE[0] - 0.3, GLIDE[0]) * (1 - seg(t, RELEASE[0], RELEASE[0] + 0.4)), seg(t, PLACE[1], PLACE[1] + 0.2) * (1 - seg(t, LIFT[0], LIFT[0] + 0.4)));
  if (on <= 0) return;
  withAlpha(on, () => {
    const x = xs - 9, y = strY(HI, xs);
    const g = ctx.createRadialGradient(x, y, 1, x, y, 18);
    g.addColorStop(0, 'rgba(255,214,150,0.95)'); g.addColorStop(0.55, 'rgba(255,170,70,0.55)'); g.addColorStop(1, 'rgba(255,170,70,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 16, 13, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#FFE7BF'; ctx.beginPath(); ctx.ellipse(x, y, 6.5, 5, 0, 0, TAU); ctx.fill();
  });
}

function guitar(t) {
  ctx.drawImage(BODY, 0, 0);
  ctx.drawImage(BOARD, 0, 0);
  // frets and their inlays
  for (let n = 1; n <= LAST; n++) {
    const a = fretAlpha(n, t);
    if (n <= 12 && t >= PLACE[n]) {
      // the ghost stays underneath while the placed fret grows in from the middle
      fret(FX[n], ghostAlpha(t));
      fret(FX[n], seg(t, PLACE[n], PLACE[n] + 0.2), lerp(0.25, 1, back(seg(t, PLACE[n], PLACE[n] + 0.35))));
    } else fret(FX[n], a);
    if (n <= 12 && t >= PLACE[n]) {
      const fl = 1 - seg(t, PLACE[n], PLACE[n] + 0.6);
      if (fl > 0) withAlpha(fl, () => {
        const g = ctx.createRadialGradient(FX[n], Y0, 2, FX[n], Y0, 60);
        g.addColorStop(0, 'rgba(255,200,120,0.55)'); g.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = g; ctx.fillRect(FX[n] - 60, Y0 - 80, 120, 160);
      });
    }
    if (INLAYS.includes(n)) {
      const x = (FX[n - 1] + FX[n]) / 2, r = Math.min(6.2, (FX[n] - FX[n - 1]) * 0.36);
      if (n === 12) { pearl(x, Y0 - 30, r, t, a); pearl(x, Y0 + 30, r, t, a); } else pearl(x, Y0, r, t, a);
    }
  }
  // nut
  ctx.fillStyle = C.bone; ctx.fillRect(NUT_X - 5, Y0 - hw(NUT_X) - 2, 7, 2 * hw(NUT_X) + 4);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(NUT_X + 2, Y0 - hw(NUT_X) - 2, 2, 2 * hw(NUT_X) + 4);
  strings(t);
  stopPad(t);
}

/** A small pill tag. */
function tag(s, x, y, { bg = C.amber, fg = '#2A1208', size = 24, a = 1, outline = false } = {}) {
  withAlpha(a, () => {
    font(600, size);
    const w = ctx.measureText(s).width + 24, h = size + 14;
    k.rrect(x - w / 2, y - h / 2, w, h, h / 2);
    if (outline) { ctx.fillStyle = 'rgba(20,10,5,0.75)'; ctx.fill(); ctx.strokeStyle = bg; ctx.lineWidth = 2; ctx.stroke(); }
    else { ctx.fillStyle = bg; ctx.fill(); }
    text(s, x, y + 1, { color: outline ? bg : fg, align: 'center', base: 'middle', spacing: '0.5px' });
  });
}
/** A bracket over a gap, drawn from its middle outwards. */
function bracket(x0, x1, y, a, p) {
  withAlpha(a, () => {
    const m = (x0 + x1) / 2, h = ((x1 - x0) / 2) * p;
    ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(m - h, y + 9); ctx.lineTo(m - h, y); ctx.lineTo(m + h, y); ctx.lineTo(m + h, y + 9); ctx.stroke();
    ctx.shadowBlur = 0;
  });
}

// ---------- scenes ----------
function sceneA(t) {
  const gaps = [[1, 1.3], [12, 2.0], [18, 2.7]];
  for (const [n, t0] of gaps) {
    const y = Y0 - hw(FX[n]) - 14;
    bracket(FX[n - 1] + 2, FX[n] - 2, y, eout(seg(t, t0, t0 + 0.3)), eout(seg(t, t0, t0 + 0.45)));
  }
}

const RO = { lx: 64, fx: 300, yl: 132, yv: 180, scopeY: 220 };
function readouts(t, a) {
  withAlpha(a, () => {
    const r = ratioAt(t), L = SCALE_MM / r;
    font(500, 20); text('VIBRATING LENGTH', RO.lx, RO.yl, { color: C.soft, spacing: '2.5px' });
    text('FREQUENCY', RO.fx, RO.yl, { color: C.soft, spacing: '2.5px' });
    font(500, 50); text(`${L.toFixed(1)}`, RO.lx, RO.yv, { color: C.ink });
    const lw = ctx.measureText(`${L.toFixed(1)}`).width;
    font(400, 26); text('mm', RO.lx + lw + 8, RO.yv, { color: C.soft });
    font(500, 50); text(`×${r.toFixed(4)}`, RO.fx, RO.yv, { color: C.amber });
    // a little trace: twice the frequency, twice the waves
    const A = 13 * clamp(amplitude(t) * 1.4), ph = phase(t), x0 = RO.lx, x1 = 520, cyc = 3.2 * r;
    ctx.strokeStyle = 'rgba(251,239,217,0.14)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, RO.scopeY); ctx.lineTo(x1, RO.scopeY); ctx.stroke();
    ctx.strokeStyle = C.amberLight; ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 2) {
      const u = (x - x0) / (x1 - x0), fade = Math.min(1, u * 8, (1 - u) * 8);
      const y = RO.scopeY - A * fade * Math.sin(TAU * cyc * u - ph);
      x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
}

function sceneC(t) {
  // the halfway mark and the octave tag
  // shown when the stop reaches the middle, and again when the 12th fret lands there
  const a = Math.max(span(t, 13.6, 21.2, 0.4, 0.4), span(t, PLACE[12] + 0.2, 40.2, 0.4, 0.4));
  withAlpha(a, () => {
    const x = FX[12];
    ctx.setLineDash([6, 7]); ctx.strokeStyle = C.pearl; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, Y0 - hw(x) - 12); ctx.lineTo(x, Y0 + hw(x) + 26); ctx.stroke(); ctx.setLineDash([]);
    font(500, 22); text('HALFWAY', x - 12, Y0 + hw(x) + 40, { color: C.pearl, align: 'right', base: 'middle', spacing: '2.5px' });
  });
  const b = Math.max(span(t, 17.4, 21.2, 0.35, 0.4) * (0.85 + 0.15 * back(seg(t, 17.4, 17.9))), span(t, PLACE[12] + 0.4, 40.2, 0.35, 0.4));
  tag('OCTAVE  ×2', FX[12], 338, { bg: C.pearl, a: b });
}

const RULER = { x0: NUT_X, step: 27.5, y: 300 };
const tickX = (k) => RULER.x0 + k * RULER.step;
function ruler(t, a) {
  withAlpha(a, () => {
    font(500, 20); text('PITCH: 12 EQUAL STEPS PER OCTAVE', RULER.x0, RULER.y - 36, { color: C.soft, spacing: '2.5px' });
    const grow = eout(seg(t, 21.8, 23.4));
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tickX(0), RULER.y); ctx.lineTo(lerp(tickX(0), tickX(12), grow), RULER.y); ctx.stroke();
    for (let n = 0; n <= 12; n++) {
      const p = eout(seg(t, 21.9 + n * 0.12, 22.2 + n * 0.12));
      if (p <= 0) continue;
      const lit = n === 0 ? 1 : seg(t, PLACE[n], PLACE[n] + 0.2);
      ctx.strokeStyle = lit > 0.5 ? C.amber : C.ink; ctx.lineWidth = n === 0 || n === 12 ? 3.5 : 2.5;
      const h = (n === 0 || n === 12 ? 11 : 7) * p;
      ctx.beginPath(); ctx.moveTo(tickX(n), RULER.y - h); ctx.lineTo(tickX(n), RULER.y + h); ctx.stroke();
    }
    // a ×1.0595 bracket hopping from step to step
    const hop = seg(t, 25.9, 29.8);
    if (hop > 0 && hop < 1) {
      const f = hop * 12, i = Math.min(11, Math.floor(f)), p = f - i;
      const xa = tickX(i), xb = tickX(i + 1);
      const ha = span(t, 25.9, 29.9, 0.2, 0.3);
      withAlpha(ha, () => {
        ctx.strokeStyle = C.pearl; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        const hgt = Math.sin(Math.PI * eio(p)) * 0 + 16;
        ctx.beginPath(); ctx.moveTo(xa + 2, RULER.y - 4); ctx.quadraticCurveTo((xa + xb) / 2, RULER.y - hgt - 8, xb - 2, RULER.y - 4); ctx.stroke();
        ctx.fillStyle = C.pearl; ctx.beginPath(); ctx.arc(lerp(xa, xb, eio(p)), RULER.y - 4 - Math.sin(Math.PI * eio(p)) * 10, 4, 0, TAU); ctx.fill();
      });
    }
    withAlpha(span(t, 25.7, 30.2, 0.3, 0.3), () => {
      font(600, 24); text(`×${RATIO_TXT} EACH STEP`, (tickX(0) + tickX(12)) / 2, RULER.y + 36, { color: C.pearl, align: 'center', base: 'middle', spacing: '1px' });
    });
  });
}

function lengthBar(t, a) {
  withAlpha(a, () => {
    const xs = stopX(t), y = 704;
    ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(255,181,71,0.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(xs, Y0 + hw(xs) + 6); ctx.lineTo(xs, y - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(BR_X, 640); ctx.lineTo(BR_X, y - 8); ctx.stroke();
    ctx.setLineDash([]);
    const g = ctx.createLinearGradient(0, y - 7, 0, y + 7);
    g.addColorStop(0, C.amberLight); g.addColorStop(1, C.amberDeep);
    k.rrect(xs, y - 7, BR_X - xs, 14, 7); ctx.fillStyle = g; ctx.fill();
    font(500, 20); text('VIBRATING LENGTH', BR_X, y + 34, { color: C.soft, align: 'right', spacing: '2.5px' });
    const ta = seg(t, PLACE[1], PLACE[1] + 0.25) * (1 - seg(t, PLACE[12] + 0.4, PLACE[12] + 0.8));
    tag(`÷ ${RATIO_TXT}`, Math.max(xs, 128), y - 34, { a: ta, size: 22 });
  });
}

const BAR = { base: 740, scale: 4.2 };
function gapBars(t, a) {
  withAlpha(a, () => {
    // guides down from each fret
    for (let n = 0; n <= 12; n++) {
      const g = eout(seg(t, BARS - 0.2 + n * 0.05, BARS + 0.4 + n * 0.05));
      if (g <= 0) continue;
      ctx.strokeStyle = 'rgba(251,239,217,0.22)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(FX[n], Y0 + hw(FX[n]) + 6); ctx.lineTo(FX[n], lerp(Y0 + hw(FX[n]) + 6, BAR.base, g)); ctx.stroke();
    }
    for (let n = 1; n <= 12; n++) {
      const p = eout(seg(t, BARS + 0.15 * n, BARS + 0.15 * n + 0.5));
      if (p <= 0) continue;
      const x0 = FX[n - 1] + 3, x1 = FX[n] - 3, h = gapMM(n) * BAR.scale * p;
      const g = ctx.createLinearGradient(0, BAR.base - h, 0, BAR.base);
      g.addColorStop(0, C.amber); g.addColorStop(1, C.amberDeep);
      k.rrect(x0, BAR.base - h, x1 - x0, h, 3); ctx.fillStyle = g; ctx.fill();
    }
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(NUT_X, BAR.base + 1); ctx.lineTo(FX[12], BAR.base + 1); ctx.stroke();
    const la = seg(t, BARS + 0.8, BARS + 1.2), lb = seg(t, BARS + 2.4, BARS + 2.8);
    font(600, 28);
    withAlpha(la, () => text(`${gapMM(1).toFixed(1)} mm`, NUT_X, BAR.base - gapMM(1) * BAR.scale - 14, { color: C.ink }));
    withAlpha(lb, () => text(`${gapMM(12).toFixed(1)} mm`, FX[12] + 34, BAR.base - gapMM(12) * BAR.scale - 36, { color: C.ink, align: 'right' }));
    // the bar tops lie on one line that reaches zero at the bridge: each gap is a fixed share of what's left
    const lp = eio(seg(t, 44.6, 46.4));
    if (lp > 0) {
      const share = RATIO - 1;
      const yAt = (x) => BAR.base - BAR.scale * share * SCALE_MM * (BR_X - x) / LPX;
      const xe = lerp(NUT_X, BR_X, lp);
      ctx.setLineDash([8, 7]); ctx.strokeStyle = C.pearl; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(NUT_X, yAt(NUT_X)); ctx.lineTo(xe, yAt(xe)); ctx.stroke(); ctx.setLineDash([]);
      withAlpha(seg(lp, 0.85, 1), () => {
        ctx.fillStyle = C.pearl; ctx.beginPath(); ctx.arc(BR_X, BAR.base, 5, 0, TAU); ctx.fill();
        font(500, 20); text('BRIDGE', BR_X, BAR.base + 28, { color: C.pearl, align: 'right', spacing: '2.5px' });
      });
    }
  });
}

function fan(t, a) {
  withAlpha(a, () => {
    for (let n = 0; n <= 12; n++) {
      const p = eio(seg(t, FAN[0] + n * 0.1, FAN[0] + n * 0.1 + 0.6));
      if (p <= 0) continue;
      const xa = tickX(n), ya = RULER.y + 8, xb = FX[n], yb = Y0 - hw(FX[n]) - 4;
      ctx.strokeStyle = 'rgba(255,181,71,0.75)'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(lerp(xa, xb, p), lerp(ya, yb, p)); ctx.stroke();
    }
  });
}

function notes(t) {
  withAlpha(span(t, 40.6, END, 0.5, 0), () => {
    font(500, 20); text('IDEAL FRET POSITIONS · 650 MM SCALE', RO.lx, RO.yl, { color: C.soft, spacing: '2.5px' });
  });
  withAlpha(span(t, 49.8, END, 0.5, 0), () => {
    font(500, 25, TXT); text('Real guitars shift the bridge slightly to compensate.', RO.lx, RO.yl + 38, { color: C.ink });
    font(400, 20, TXT); text('Source: Wikipedia, “Fret”', RO.lx, RO.yl + 72, { color: C.soft });
  });
}

// Captions with balanced lines: the narrowest width that keeps the same number of lines.
const CAP = { size: 44, lh: 56, weight: 600, maxW: 760 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size, TXT);
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
    k.captions(t, [cue], { x: W / 2, y: 834, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TXT, ink: C.ink, marks: { '*': C.amber, '~': C.pearl } });
  }
}

function background(t) {
  ctx.drawImage(BENCH, 0, 0);
  for (const m of MOTES) {
    const y = ((m.y - t * m.v) % H + H) % H, x = m.x + Math.sin(t * 0.3 + m.p) * 12;
    const lit = clamp(1 - Math.hypot(x - 280, y - 360) / 520);
    if (lit <= 0) continue;
    ctx.fillStyle = `rgba(255,214,150,${0.35 * lit})`; ctx.beginPath(); ctx.arc(x, y, m.s, 0, TAU); ctx.fill();
  }
  font(600, 22); text('RECKON', 64, 80, { color: C.amber, spacing: '3px' });
  const rw = ctx.measureText('RECKON').width + 6 * 3;
  font(400, 22); text('MUSIC · STRINGS', 64 + rw + 18, 80, { color: C.soft, spacing: '3px' });
}
function vignette() {
  const g = ctx.createRadialGradient(W / 2, H * 0.45, 360, W / 2, H * 0.5, 820);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

Kit.scene({
  width: W, height: H, duration: END,
  fonts: [
    { family: NUM, file: 'Oswald.woff2', weight: '200 700' },
    { family: TXT, file: 'Lora.woff2', weight: '400 700' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BENCH) { BENCH = paintBench(); BODY = paintBody(); BOARD = paintBoard(); }
    background(t);
    withAlpha(eout(seg(t, 0, 1.1)), () => {
      ctx.save(); const s = lerp(0.985, 1, eout(seg(t, 0, 1.4))); ctx.translate(W / 2, Y0); ctx.scale(s, s); ctx.translate(-W / 2, -Y0);
      guitar(t);
      ctx.restore();
    });
    withAlpha(span(t, T.A[0], T.A[1], 0, 0.4), () => sceneA(t));
    readouts(t, span(t, 5.3, 40.4, 0.5, 0.45));
    sceneC(t);
    ruler(t, seg(t, 21.6, 22.0));
    lengthBar(t, span(t, 30.2, 40.4, 0.4, 0.45));
    gapBars(t, seg(t, BARS - 0.3, BARS));
    fan(t, 1);
    notes(t);
    vignette();
    captions(t);
  },
});
