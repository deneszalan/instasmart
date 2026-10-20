// Explainer for body-kidneys-filter-180-litres: your kidneys filter 180 litres a day but you pee only a litre or two.
// Look: water and glass. A deep aqua-to-teal gradient with drifting light and rising bubbles; glassy containers whose
// liquid fills with a wavy surface and highlights; droplets. Filtrate is aqua, urine amber, blood red. Rubik throughout.
//
// Facts (Wikipedia, "Kidney"): about 180 litres of filtrate a day in an adult, most of it reabsorbed; a normal day's
// urine is 800 to 2,000 mL; each adult kidney has around a million nephrons; filtration happens in the glomerulus,
// a tuft of capillaries, and lets small molecules through while cells and large proteins stay in the blood;
// water, sodium and glucose are among what is reabsorbed into the capillaries around the tubules; the kidneys
// help keep the body's water and salt levels. Everything else is arithmetic on those numbers, done below:
// 180 ÷ 1.5 = 120 bottles, 24 h ÷ 120 = one bottle every 12 minutes, 180 − 2 to 180 − 0.8 = 178 to 179 litres back,
// about 119 of the 120 bottles.
//
// Scene plan (52.1 s, 864×1080; captions one at a time, at least 0.3 s per word + 1 s)
// A  0–11.3   Hook. Two glass tanks on the same scale: one fills with 180 L of filtrate, the other gets only a
//             thin amber line, 0.8–2 L. A "?" rises in the empty tank.
//     "Every day, an adult's kidneys filter about 180 litres."
//     "Yet only 0.8 to 2 litres leave as urine."
//     "So where does the rest go?"
// B  11.3–19.3  A day's filtrate as 1.5-litre bottles: 120 of them fill one after another while a clock runs
//             to 24:00 and a counter to 180 L.
//     "That's about one 1.5-litre bottle every 12 minutes."
//     "By the end of the day: 120 bottles."
// C  19.3–27.8  Diagram of one nephron (labelled as a simplified diagram): blood flows into a tuft of capillaries
//             inside a glass cup; droplets of filtrate pass into the tubule while blood cells stay in the vessel.
//     "Each adult kidney has around a million tiny filters: nephrons."
//     "A tuft of capillaries filters out water and small molecules."
// D  27.8–43.2  Reabsorption. Most droplets hop from the tubule back into the blood vessel; then the 120 bottles
//             drain back one after another, all but about one; a measuring glass shows the 0.8–2 L of urine.
//     "Then the tubule takes almost all of it back."
//     "Water, salts and glucose return to the blood."
//     "About 119 of the 120 bottles go back."
//     "What's left, 0.8 to 2 litres, is urine."
// E  43.2–47.8  Why: a glass balance with a water drop and a salt crystal settles level.
//     "Taking back only what's needed keeps water and salt in balance."
// F  47.8–52.1  Payoff card: 180 L filtered, 0.8–2 L of urine, and the source.
//     "Filter 180 litres, keep all but 0.8 to 2."
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const FONT = 'Rubik';

const C = {
  bgA: '#05304A', bgB: '#0A5466', bgC: '#0E7671',
  aqua: '#5DE0E6', aquaDeep: '#1798B8', aquaLight: '#A9F5F3', mark: '#8CF6F2',
  amber: '#FFC857', amberDeep: '#E09A1C',
  blood: '#EE4E5C', bloodDeep: '#A92637', bloodLight: '#FF9AA2', cell: '#7E1526',
  glass: 'rgba(214,250,255,0.72)', glassSoft: 'rgba(214,250,255,0.32)', glassFill: 'rgba(255,255,255,0.06)',
  ink: '#F1FBFC', soft: 'rgba(225,246,249,0.74)', faint: 'rgba(225,246,249,0.22)',
  panel: 'rgba(3,26,38,0.58)',
};

// ---------- the numbers ----------
const FILTRATE_L = 180;                 // litres of filtrate a day
const URINE_L = [0.8, 2];               // normal day's urine, 800 to 2,000 mL
const BOTTLE_L = 1.5;
const BOTTLES = FILTRATE_L / BOTTLE_L;  // 120
const MIN_PER_BOTTLE = (24 * 60) / BOTTLES; // 12
const BACK_L = [FILTRATE_L - URINE_L[1], FILTRATE_L - URINE_L[0]]; // 178 to 179.2
const BACK_BOTTLES = Math.round(((BACK_L[0] + BACK_L[1]) / 2) / BOTTLE_L); // about 119
const fmtL = (v) => String(Math.round(v * 10) / 10);

// ---------- timeline ----------
const B0 = 11.3, C0 = 19.3, D0 = 27.8, E0 = 43.2, F0 = 47.8, END = 52.1;
const CUES = [
  [0.4, 4.2, `Every day, an adult's kidneys filter about *${FILTRATE_L} litres*.`],
  [4.3, 8.1, `Yet only ^${fmtL(URINE_L[0])} to ${fmtL(URINE_L[1])} litres^ leave as urine.`],
  [8.2, 11.2, 'So where does the rest go?'],
  [B0 + 0.1, B0 + 4.2, `That's about one *${fmtL(BOTTLE_L)}-litre bottle* every ${MIN_PER_BOTTLE} minutes.`],
  [B0 + 4.3, B0 + 7.9, `By the end of the day: *${BOTTLES} bottles*.`],
  [C0 + 0.1, C0 + 4.2, 'Each adult kidney has around *a million* tiny filters: nephrons.'],
  [C0 + 4.3, C0 + 8.4, 'A tuft of capillaries filters out *water and small molecules*.'],
  [D0 + 0.1, D0 + 3.9, 'Then the tubule takes *almost all of it* back.'],
  [D0 + 4.0, D0 + 7.6, 'Water, salts and glucose return to the ~blood~.'],
  [D0 + 7.7, D0 + 11.6, `About *${BACK_BOTTLES} of the ${BOTTLES} bottles* go back.`],
  [D0 + 11.7, D0 + 15.3, `What's left, ^${fmtL(URINE_L[0])} to ${fmtL(URINE_L[1])} litres^, is urine.`],
  [E0 + 0.1, E0 + 4.5, "Taking back only what's needed keeps *water and salt* in balance."],
  [F0 + 0.1, END + 1, `Filter *${FILTRATE_L} litres*, keep all but ^${fmtL(URINE_L[0])} to ${fmtL(URINE_L[1])}^.`],
];

// Drawing tools from the kit, bound on the first frame.
let k, ctx;
const font = (weight, size) => k.font(weight, size, FONT);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const rrect = (...a) => k.rrect(...a);
const A = (a, fn) => k.alpha(a, fn);
const ell = (x, y, rx, ry) => { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); };
const hash = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- background ----------
function background(t) {
  const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
  g.addColorStop(0, C.bgA); g.addColorStop(0.55, C.bgB); g.addColorStop(1, C.bgC);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // drifting pools of light
  for (let i = 0; i < 5; i++) {
    const x = W * (0.15 + 0.7 * hash(i)) + Math.sin(t * 0.21 + i * 1.7) * 60;
    const y = H * (0.1 + 0.6 * hash(i + 9)) + Math.cos(t * 0.17 + i) * 40;
    const r = 220 + 90 * hash(i + 3);
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, 'rgba(140,240,240,0.10)'); rg.addColorStop(1, 'rgba(140,240,240,0)');
    ctx.fillStyle = rg; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // caustic lines near the top, like light through a water surface
  ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let j = 0; j < 7; j++) {
    ctx.strokeStyle = `rgba(190,250,250,${0.05 + 0.025 * (j % 3)})`;
    ctx.beginPath();
    for (let x = -20; x <= W + 20; x += 16) {
      const y = 40 + j * 46 + Math.sin(x * 0.012 + t * 0.6 + j * 1.3) * 14 + Math.sin(x * 0.031 - t * 0.9 + j) * 6;
      x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // rising bubbles
  for (let i = 0; i < 26; i++) {
    const r = 3 + 7 * hash(i + 40), sp = 22 + 30 * hash(i + 80);
    const y = H + 40 - ((t * sp + hash(i + 120) * (H + 80)) % (H + 80));
    const x = 30 + (W - 60) * hash(i + 160) + Math.sin(t * 1.2 + i) * 8;
    A(0.22 + 0.2 * hash(i + 200), () => droplet(x, y, r, 'rgba(210,250,255,0.9)', true));
  }
}

/** A bubble or droplet: a ring with a highlight (bubble) or a filled drop. */
function droplet(x, y, r, col, ring = false) {
  ell(x, y, r, r);
  if (ring) { ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, r * 0.22); ctx.stroke(); }
  else { ctx.fillStyle = col; ctx.fill(); }
  ell(x - r * 0.35, y - r * 0.35, r * 0.28, r * 0.22); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
}

function header() {
  font(700, 22); text('RECKON', 56, 58, { spacing: '4px' });
  font(700, 22); const w = ctx.measureText('RECKON').width + 24 + 30;
  font(500, 22); text('BODY', 56 + w, 58, { color: C.soft, spacing: '3px' });
}

// ---------- glass ----------
/** The wavy top of a liquid, from x0 to x1 at height y. */
function wavePath(x0, x1, y, amp, t, ph = 0) {
  ctx.moveTo(x0, y + Math.sin(t * 2.2 + ph) * amp);
  for (let x = x0; x <= x1 + 0.1; x += 8) ctx.lineTo(x, y + Math.sin(x * 0.045 + t * 2.2 + ph) * amp + Math.sin(x * 0.11 - t * 1.6 + ph) * amp * 0.4);
}

/** A glass tank with liquid filled to `level` (0..1) of its height. */
function tank(x, y, w, h, level, t, { top, bottom, ph = 0, amp = 5, a = 1 } = {}) {
  A(a, () => {
    rrect(x, y, w, h, 26); ctx.fillStyle = C.glassFill; ctx.fill();
    if (level > 0.0005) {
      ctx.save(); rrect(x, y, w, h, 26); ctx.clip();
      const sy = y + h * (1 - level);
      const g = ctx.createLinearGradient(0, sy, 0, y + h);
      g.addColorStop(0, top); g.addColorStop(1, bottom);
      ctx.beginPath(); wavePath(x - 10, x + w + 10, sy, Math.min(amp, h * level * 0.5), t, ph);
      ctx.lineTo(x + w + 10, y + h + 10); ctx.lineTo(x - 10, y + h + 10); ctx.closePath();
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); wavePath(x - 10, x + w + 10, sy, Math.min(amp, h * level * 0.5), t, ph);
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3; ctx.stroke();
      // bubbles inside the liquid
      for (let i = 0; i < 10; i++) {
        const span_ = h * level;
        if (span_ < 30) break;
        const by = y + h - ((t * (20 + 20 * hash(i + ph * 7)) + hash(i + 3 + ph) * span_) % span_);
        const bx = x + 20 + (w - 40) * hash(i + 11 + ph);
        A(0.6, () => droplet(bx, by, 2.5 + 4 * hash(i + 5), 'rgba(255,255,255,0.7)', true));
      }
      ctx.restore();
    }
    rrect(x, y, w, h, 26); ctx.strokeStyle = C.glass; ctx.lineWidth = 3; ctx.stroke();
    rrect(x + 12, y + 18, 10, h - 36, 5); ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fill();
    rrect(x + w - 20, y + 30, 5, h * 0.35, 3); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
  });
}

function bottlePath(x, by, h) {
  const bw = h * 0.42, nw = h * 0.2, body = by - h * 0.7, neck = by - h * 0.86, top = by - h * 0.9, r = bw * 0.3;
  ctx.beginPath();
  ctx.moveTo(x - bw / 2, by - r);
  ctx.lineTo(x - bw / 2, body);
  ctx.quadraticCurveTo(x - bw / 2, neck, x - nw / 2, neck);
  ctx.lineTo(x - nw / 2, top); ctx.lineTo(x + nw / 2, top); ctx.lineTo(x + nw / 2, neck);
  ctx.quadraticCurveTo(x + bw / 2, neck, x + bw / 2, body);
  ctx.lineTo(x + bw / 2, by - r);
  ctx.quadraticCurveTo(x + bw / 2, by, x + bw / 2 - r, by);
  ctx.lineTo(x - bw / 2 + r, by);
  ctx.quadraticCurveTo(x - bw / 2, by, x - bw / 2, by - r);
  ctx.closePath();
}
/** A 1.5-litre bottle standing on by, filled to `level` with `col`. */
function bottle(x, by, h, level, t, col = C.aqua, i = 0) {
  bottlePath(x, by, h); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
  if (level > 0.002) {
    ctx.save(); bottlePath(x, by, h); ctx.clip();
    const sy = by - h * 0.86 * level;
    ctx.beginPath(); wavePath(x - h, x + h, sy, level < 0.98 ? 1.6 : 0.8, t * 1.4, i);
    ctx.lineTo(x + h, by + 2); ctx.lineTo(x - h, by + 2); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x - h * 0.15, sy, h * 0.06, by - sy);
    ctx.restore();
  }
  bottlePath(x, by, h); ctx.strokeStyle = C.glassSoft; ctx.lineWidth = 1.6; ctx.stroke();
  rrect(x - h * 0.11, by - h * 1.0, h * 0.22, h * 0.11, 2); ctx.fillStyle = 'rgba(180,240,248,0.75)'; ctx.fill();
}

function pill(label, cx, cy, { size = 22, weight = 600, color = C.ink, bg = 'rgba(214,250,255,0.10)', line = C.glassSoft, pad = 18 } = {}) {
  font(weight, size); const w = ctx.measureText(label).width + pad * 2, h = size + 20;
  rrect(cx - w / 2, cy - h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = line; ctx.lineWidth = 2; ctx.stroke();
  text(label, cx, cy + 1, { color, align: 'center', base: 'middle' });
}

// ---------- A: the hook ----------
const TANK = { y: 200, w: 300, h: 450, xl: 92, xr: 472 };
function sceneA(t) {
  const pop = eout(seg(t, 0.2, 0.9));
  ctx.save(); ctx.translate(0, (1 - pop) * 24);
  const fill = eio(seg(t, 0.7, 3.6));
  font(600, 24);
  text('FILTERED IN A DAY', TANK.xl + TANK.w / 2, TANK.y - 26, { color: C.soft, align: 'center', spacing: '2px' });
  tank(TANK.xl, TANK.y, TANK.w, TANK.h, fill, t, { top: 'rgba(110,232,236,0.85)', bottom: 'rgba(20,150,184,0.92)' });
  A(seg(t, 1.3, 2.0), () => {
    font(700, 96); text(`${Math.round(FILTRATE_L * fill)} L`, TANK.xl + TANK.w / 2, TANK.y + TANK.h / 2 + 10, { align: 'center', base: 'middle' });
  });
  // the urine tank, same scale: a sliver
  A(seg(t, 4.3, 4.8), () => {
    font(600, 24);
    text('LEAVES AS URINE', TANK.xr + TANK.w / 2, TANK.y - 26, { color: C.soft, align: 'center', spacing: '2px' });
  });
  const u = eio(seg(t, 4.5, 5.6));
  tank(TANK.xr, TANK.y, TANK.w, TANK.h, 0, t, {});
  if (u > 0) {
    ctx.save(); rrect(TANK.xr, TANK.y, TANK.w, TANK.h, 26); ctx.clip();
    const bottom = TANK.y + TANK.h;
    const lo = (URINE_L[0] / FILTRATE_L) * TANK.h * u, hi = (URINE_L[1] / FILTRATE_L) * TANK.h * u;
    ctx.fillStyle = 'rgba(255,200,87,0.45)'; ctx.fillRect(TANK.xr, bottom - hi, TANK.w, hi);
    ctx.fillStyle = C.amber; ctx.fillRect(TANK.xr, bottom - lo, TANK.w, lo);
    ctx.restore();
  }
  A(seg(t, 5.2, 5.7), () => {
    const cx = TANK.xr + TANK.w / 2;
    font(700, 64); text(`${fmtL(URINE_L[0])}–${fmtL(URINE_L[1])} L`, cx, TANK.y + TANK.h - 110, { color: C.amber, align: 'center', base: 'middle' });
    ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, TANK.y + TANK.h - 68); ctx.lineTo(cx, TANK.y + TANK.h - 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 9, TANK.y + TANK.h - 28); ctx.lineTo(cx, TANK.y + TANK.h - 16); ctx.lineTo(cx + 9, TANK.y + TANK.h - 28); ctx.stroke();
  });
  A(seg(t, 5.6, 6.2), () => { font(500, 22); text('both tanks drawn to the same scale', W / 2, TANK.y + TANK.h + 44, { color: C.soft, align: 'center' }); });
  // the question
  const q = seg(t, 8.3, 8.9);
  A(q, () => {
    const cx = TANK.xr + TANK.w / 2, cy = TANK.y + 150 + Math.sin(t * 2) * 6;
    const s = 0.7 + 0.3 * back(q);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, 110);
    rg.addColorStop(0, 'rgba(140,246,242,0.35)'); rg.addColorStop(1, 'rgba(140,246,242,0)');
    ctx.fillStyle = rg; ctx.fillRect(-110, -110, 220, 220);
    font(700, 130); text('?', 0, 6, { color: C.mark, align: 'center', base: 'middle' });
    ctx.restore();
  });
  ctx.restore();
}

// ---------- B and D: 120 bottles ----------
const GRID = { cols: 15, rows: 8, x0: 72, y0: 238, dx: 48, dy: 57, h: 50 };
const cellPos = (i) => ({ x: GRID.x0 + GRID.dx * (i % GRID.cols) + GRID.dx / 2, by: GRID.y0 + GRID.dy * Math.floor(i / GRID.cols) + GRID.h });
const fillCount = (t) => BOTTLES * eio(seg(t, B0 + 0.6, B0 + 6.8));
const drainCount = (t) => BACK_BOTTLES * eio(seg(t, D0 + 8.0, D0 + 11.2));

function clock(cx, cy, r, minutes) {
  ell(cx, cy, r, r); ctx.fillStyle = 'rgba(214,250,255,0.10)'; ctx.fill(); ctx.strokeStyle = C.glass; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.lineCap = 'round';
  const hA = (minutes / 720) * Math.PI * 2 - Math.PI / 2, mA = (minutes / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(hA) * r * 0.5, cy + Math.sin(hA) * r * 0.5); ctx.stroke();
  ctx.strokeStyle = C.mark; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(mA) * r * 0.78, cy + Math.sin(mA) * r * 0.78); ctx.stroke();
}

function counterBox(x, y, w, label, value, color = C.ink) {
  rrect(x, y, w, 92, 22); ctx.fillStyle = 'rgba(214,250,255,0.08)'; ctx.fill(); ctx.strokeStyle = C.glassSoft; ctx.lineWidth = 2; ctx.stroke();
  font(600, 22); text(label, x + 22, y + 32, { color: C.soft, spacing: '2px' });
  font(700, 40); text(value, x + 22, y + 72, { color });
}

function grid(t, mode) {
  const n = fillCount(t), d = mode === 'drain' ? drainCount(t) : 0;
  const lastFade = mode === 'drain' ? seg(t, D0 + 11.5, D0 + 12.2) : 0;
  for (let i = 0; i < BOTTLES; i++) {
    if (mode === 'drain' && i === BOTTLES - 1 && t > LAST.t0) continue;
    const { x, by } = cellPos(i);
    const appear = eout(seg(t, (mode === 'fill' ? B0 : D0 + 7.5) + 0.004 * i, (mode === 'fill' ? B0 + 0.45 : D0 + 7.95) + 0.004 * i));
    const level = mode === 'fill' ? clamp(n - i) : 1 - clamp(d - i);
    A(appear * (i === BOTTLES - 1 ? 1 : 1 - 0.8 * lastFade), () => bottle(x, by + (1 - appear) * 10, GRID.h, level, t, C.aqua, i));
    // a droplet leaving each bottle as it drains, back towards the blood
    if (mode === 'drain') {
      const q = clamp(d - i);
      if (q > 0.05 && q < 1) A(Math.sin(Math.PI * q), () => droplet(x, by - GRID.h - 10 - q * 30, 5, C.aqua));
    }
  }
  if (mode === 'fill') {
    const minutes = n * MIN_PER_BOTTLE, hh = Math.floor(minutes / 60), mm = Math.floor(minutes % 60);
    const a = seg(t, B0, B0 + 0.4);
    A(a, () => {
      rrect(72, 120, 340, 92, 22); ctx.fillStyle = 'rgba(214,250,255,0.08)'; ctx.fill(); ctx.strokeStyle = C.glassSoft; ctx.lineWidth = 2; ctx.stroke();
      clock(122, 166, 28, minutes);
      font(600, 22); text('TIME ELAPSED', 168, 152, { color: C.soft, spacing: '2px' });
      font(700, 40); text(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, 168, 192);
      counterBox(452, 120, 340, 'FILTERED', `${Math.round(n * BOTTLE_L)} L`, C.mark);
      font(500, 22); text(`each bottle = ${fmtL(BOTTLE_L)} L`, W / 2, GRID.y0 + GRID.dy * GRID.rows + 24, { color: C.soft, align: 'center' });
    });
  } else {
    A(seg(t, D0 + 7.5, D0 + 7.9) * (1 - seg(t, D0 + 11.5, D0 + 12.0)), () => {
      counterBox(72, 120, 720, 'BACK INTO THE BLOOD', `${Math.round(d)} of ${BOTTLES} bottles`, C.mark);
    });
  }
}

// ---------- C and D: one nephron, as a diagram ----------
function poly(pts) {
  const segs = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const [a, b] = [pts[i - 1], pts[i]]; const d = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, L0: L, d }); L += d; }
  return {
    L,
    at(s) {
      s = clamp(s, 0, L);
      const sg = segs.find((g) => s <= g.L0 + g.d) ?? segs.at(-1);
      const u = sg.d ? (s - sg.L0) / sg.d : 0;
      return [lerp(sg.a[0], sg.b[0], u), lerp(sg.a[1], sg.b[1], u)];
    },
    stroke() { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); },
  };
}
const GLOM = [190, 318];
const VESSEL_Y = 480, TUBE_Y = 318;
const vessel = poly([[72, 196], [140, 262], GLOM, [190, 372], [190, VESSEL_Y], [640, VESSEL_Y], [640, 604], [72, 604]]);
const tube = poly([[GLOM[0] + 6, TUBE_Y], [262, TUBE_Y], [720, TUBE_Y], [720, 668]]);
const tubeCorner = (720 - (GLOM[0] + 6));

function drawVessel(reveal) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.setLineDash([vessel.L * reveal, vessel.L + 10]);
  vessel.stroke(); ctx.strokeStyle = C.bloodDeep; ctx.lineWidth = 26; ctx.stroke();
  vessel.stroke(); ctx.strokeStyle = C.blood; ctx.lineWidth = 19; ctx.stroke();
  vessel.stroke(); ctx.strokeStyle = 'rgba(255,170,178,0.45)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
}
function drawTube(reveal) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.setLineDash([tube.L * reveal, tube.L + 10]);
  tube.stroke(); ctx.strokeStyle = 'rgba(214,250,255,0.6)'; ctx.lineWidth = 36; ctx.stroke();
  tube.stroke(); ctx.strokeStyle = 'rgba(5,48,66,0.9)'; ctx.lineWidth = 30; ctx.stroke();
  tube.stroke(); ctx.strokeStyle = 'rgba(93,224,230,0.16)'; ctx.lineWidth = 30; ctx.stroke();
  ctx.restore();
}
function drawGlomerulus(a, t) {
  A(a, () => {
    const [gx, gy] = GLOM;
    ell(gx, gy, 72, 72); ctx.fillStyle = 'rgba(93,224,230,0.12)'; ctx.fill();
    const loops = [[-20, -18, 19], [16, -22, 18], [26, 8, 17], [4, 24, 18], [-24, 14, 17], [0, -2, 15]];
    for (const [dx, dy, r] of loops) {
      const wob = Math.sin(t * 2 + dx) * 1.2;
      ell(gx + dx, gy + dy + wob, r, r); ctx.strokeStyle = C.bloodDeep; ctx.lineWidth = 11; ctx.stroke();
      ell(gx + dx, gy + dy + wob, r, r); ctx.strokeStyle = C.blood; ctx.lineWidth = 7; ctx.stroke();
    }
    // the glass cup around it, open towards the tubule
    ctx.beginPath(); ctx.arc(gx, gy, 72, 0.3, Math.PI * 2 - 0.3);
    ctx.strokeStyle = C.glass; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  });
}

function diagramLabel(s, x, y, a, align = 'left', color = C.soft) {
  A(a, () => { font(500, 24); text(s, x, y, { color, align, base: 'middle' }); });
}

/** Where filtrate droplet j is at time t: on the tubule, hopping back to the blood, or gone. */
const DROP_DT = 0.17, DROP_V = 95, DROP_T0 = C0 + 4.2;
function dropState(j, t) {
  const tj = DROP_T0 + j * DROP_DT;
  if (t < tj) return null;
  const s = (t - tj) * DROP_V;
  const keeps = j % 12 === 0;              // a few stay in the tubule all the way
  const hopStart = D0 + 0.2;
  let sh = 30 + hash(j) * (tubeCorner - 70);
  if (tj + sh / DROP_V < hopStart) sh = (hopStart - tj) * DROP_V; // already past its spot: hop from where it is now
  const hop = !keeps && sh < tubeCorner - 20;
  if (!hop || s < sh) {
    if (s > tube.L) return null;
    const [x, y] = tube.at(s);
    return { x, y, a: 1 - seg(s, tube.L - 30, tube.L) };
  }
  const u = (s - sh) / 70; // 0.74 s to reach the vessel
  if (u > 1.4) return null;
  const [x0, y0] = tube.at(sh);
  const uu = clamp(u);
  return { x: x0 + Math.sin(uu * Math.PI) * 10, y: lerp(y0, VESSEL_Y, eio(uu)), a: 1 - seg(u, 1, 1.4), hop: true };
}

function diagram(t) {
  const reveal = eio(seg(t, C0 + 0.2, C0 + 1.8));
  A(seg(t, C0, C0 + 0.5), () => {
    font(600, 22); text('DIAGRAM · ONE NEPHRON, SIMPLIFIED', W / 2, 132, { color: C.soft, align: 'center', spacing: '2px' });
  });
  drawVessel(reveal);
  drawTube(eio(seg(t, C0 + 0.9, C0 + 2.4)));
  drawGlomerulus(seg(t, C0 + 0.5, C0 + 1.1), t);
  // blood cells flow through the vessel and stay in it
  const cellsA = seg(t, C0 + 1.6, C0 + 2.2);
  if (cellsA > 0) A(cellsA, () => {
    for (let i = 0; i < 40; i++) {
      const s = (t * 70 + i * (vessel.L / 40)) % vessel.L;
      const [x, y] = vessel.at(s);
      ell(x, y, 6.5, 5); ctx.fillStyle = C.cell; ctx.fill();
      ell(x, y, 6.5, 5); ctx.strokeStyle = 'rgba(255,180,188,0.85)'; ctx.lineWidth = 2; ctx.stroke();
    }
  });
  // droplets of filtrate
  const nDrops = Math.ceil((t - DROP_T0) / DROP_DT) + 1;
  for (let j = Math.max(0, nDrops - 140); j < nDrops; j++) {
    const st = dropState(j, t);
    if (!st) continue;
    A(st.a * (st.hop ? 1 : 1), () => droplet(st.x, st.y, 6, C.aqua));
  }
  // labels
  diagramLabel('blood in', 72, 168, seg(t, C0 + 1.0, C0 + 1.5));
  diagramLabel('tuft of capillaries', 280, 228, seg(t, C0 + 1.3, C0 + 1.8));
  diagramLabel('(glomerulus)', 280, 258, seg(t, C0 + 1.3, C0 + 1.8));
  diagramLabel('tubule', 500, 280, seg(t, C0 + 2.0, C0 + 2.5));
  diagramLabel('to the bladder', 720, 700, seg(t, C0 + 2.2, C0 + 2.7), 'center');
  diagramLabel('blood back to the body', 72, 642, seg(t, C0 + 1.8, C0 + 2.3));
  A(seg(t, C0 + 1.2, C0 + 1.8) * (1 - seg(t, C0 + 8.3, C0 + 8.6)), () => pill('around 1,000,000 in each kidney', 600, 182, { size: 22, color: C.mark }));
  // reabsorption arrows
  A(seg(t, D0 + 0.4, D0 + 1.0), () => {
    ctx.strokeStyle = 'rgba(140,246,242,0.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (const x of [490, 580, 660]) {
      ctx.beginPath(); ctx.moveTo(x, TUBE_Y + 30); ctx.lineTo(x, VESSEL_Y - 28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 8, VESSEL_Y - 38); ctx.lineTo(x, VESSEL_Y - 27); ctx.lineTo(x + 8, VESSEL_Y - 38); ctx.stroke();
    }
    font(600, 24); text('taken back', 272, (TUBE_Y + VESSEL_Y) / 2 - 14, { color: C.mark, base: 'middle' });
  });
  A(seg(t, D0 + 4.0, D0 + 4.6), () => {
    font(500, 22); text('water, salts, glucose…', 272, (TUBE_Y + VESSEL_Y) / 2 + 18, { color: C.soft, base: 'middle' });
  });
}

// ---------- D: the last bottle, poured into a measuring glass ----------
const LAST = { t0: D0 + 11.7, fly: D0 + 12.3, tilt: D0 + 12.7, pour0: D0 + 12.6, pour1: D0 + 13.5, gone: D0 + 13.9 };
function lastBottle(t) {
  if (t <= LAST.t0) return;
  const { x: x0, by: by0 } = cellPos(BOTTLES - 1);
  const f = eio(seg(t, LAST.t0, LAST.fly)), s = lerp(1, 1.8, f), h = GRID.h * s;
  const cx = lerp(x0, 486, f), cy = lerp(by0 - GRID.h / 2, 176, f);
  const th = -2.0 * eio(seg(t, LAST.fly, LAST.tilt));
  const level = 1 - eio(seg(t, LAST.pour0, LAST.pour1));
  const amber = seg(t, LAST.t0 + 0.1, LAST.fly);
  const a = 1 - seg(t, LAST.pour1, LAST.gone);
  A(a, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(th);
    A(1 - amber, () => bottle(0, h / 2, h, level, t, C.aqua, 7));
    A(amber, () => bottle(0, h / 2, h, level, t, C.amber, 7));
    ctx.restore();
    // the stream from the neck into the glass
    const pour = span(t, LAST.pour0, LAST.pour1, 0.15, 0.25);
    if (pour > 0) {
      const r = h * 0.43, nx = cx + r * Math.sin(th), ny = cy - r * Math.cos(th);
      A(pour, () => {
        ctx.strokeStyle = C.amber; ctx.lineWidth = 6; ctx.lineCap = 'round';
        const end = 630 - (URINE_L[0] / 2.5) * 380 * eio(seg(t, LAST.pour0, LAST.pour1)) + 4;
        ctx.beginPath(); ctx.moveTo(nx, ny); ctx.quadraticCurveTo(nx - 6, ny + 40, nx - 6, end); ctx.stroke();
      });
    }
  });
}

// ---------- D: the measuring glass ----------
function beaker(t) {
  const a = seg(t, D0 + 11.8, D0 + 12.3);
  A(a, () => {
    const x = 352, y = 250, w = 180, h = 380, maxL = 2.5;
    const yOf = (L) => y + h - (L / maxL) * h;
    const p = eio(seg(t, LAST.pour0, LAST.pour1)), band = seg(t, LAST.pour1 - 0.2, LAST.pour1 + 0.4);
    ctx.save(); ctx.translate(0, (1 - eout(a)) * 20);
    rrect(x, y, w, h, 20); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill();
    ctx.save(); rrect(x, y, w, h, 20); ctx.clip();
    A(band, () => { ctx.fillStyle = 'rgba(255,200,87,0.32)'; ctx.fillRect(x, yOf(URINE_L[1]), w, yOf(URINE_L[0]) - yOf(URINE_L[1])); });
    const sy = yOf(URINE_L[0] * p);
    const g = ctx.createLinearGradient(0, sy, 0, y + h); g.addColorStop(0, '#FFD777'); g.addColorStop(1, C.amberDeep);
    ctx.beginPath(); wavePath(x - 10, x + w + 10, sy, 3.5, t, 2); ctx.lineTo(x + w + 10, y + h + 10); ctx.lineTo(x - 10, y + h + 10); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); wavePath(x - 10, x + w + 10, sy, 3.5, t, 2); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
    rrect(x, y, w, h, 20); ctx.strokeStyle = C.glass; ctx.lineWidth = 3; ctx.stroke();
    rrect(x + 12, y + 16, 9, h - 32, 5); ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fill();
    // scale
    ctx.strokeStyle = C.glass; ctx.lineWidth = 2;
    for (let L = 0.5; L <= 2.01; L += 0.5) {
      const yy = yOf(L);
      ctx.beginPath(); ctx.moveTo(x + w - 34, yy); ctx.lineTo(x + w, yy); ctx.stroke();
      font(500, 22); text(`${L} L`, x + w + 14, yy, { color: C.soft, base: 'middle' });
    }
    // the range
    A(band, () => {
      const bx = x - 20;
      ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx + 8, yOf(URINE_L[1])); ctx.lineTo(bx, yOf(URINE_L[1])); ctx.lineTo(bx, yOf(URINE_L[0])); ctx.lineTo(bx + 8, yOf(URINE_L[0])); ctx.stroke();
      const my = (yOf(URINE_L[0]) + yOf(URINE_L[1])) / 2;
      font(700, 40); text(`${fmtL(URINE_L[0])}–${fmtL(URINE_L[1])} L`, bx - 16, my - 18, { color: C.amber, align: 'right', base: 'middle' });
      font(500, 22); text('of urine a day,', bx - 16, my + 16, { color: C.soft, align: 'right', base: 'middle' });
      font(500, 22); text('the normal range', bx - 16, my + 44, { color: C.soft, align: 'right', base: 'middle' });
    });
    ctx.restore();
  });
}

// ---------- E: balance ----------
function balance(t) {
  const a = span(t, E0, F0 + 0.1, 0.5, 0.4);
  A(a, () => {
    const cx = W / 2, py = 300, L = 230;
    const te = Math.max(0, t - E0 - 0.3);
    const ang = 0.16 * Math.exp(-te * 0.9) * Math.cos(te * 3.1);
    // stand
    ctx.strokeStyle = C.glass; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(cx, 640); ctx.stroke();
    rrect(cx - 120, 640, 240, 18, 9); ctx.fillStyle = 'rgba(214,250,255,0.25)'; ctx.fill(); ctx.strokeStyle = C.glass; ctx.lineWidth = 2.5; ctx.stroke();
    // level mark
    A(seg(t, E0 + 2.6, E0 + 3.2), () => { ctx.setLineDash([6, 8]); ctx.strokeStyle = 'rgba(140,246,242,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - L - 70, py); ctx.lineTo(cx + L + 70, py); ctx.stroke(); ctx.setLineDash([]); });
    ctx.save(); ctx.translate(cx, py); ctx.rotate(ang);
    rrect(-L - 10, -7, 2 * L + 20, 14, 7); ctx.fillStyle = 'rgba(214,250,255,0.35)'; ctx.fill(); ctx.strokeStyle = C.glass; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
    ell(cx, py, 13, 13); ctx.fillStyle = C.aquaLight; ctx.fill();
    for (const s of [-1, 1]) {
      const ex = cx + Math.cos(ang) * L * s, ey = py + Math.sin(ang) * L * s;
      const pyy = ey + 150;
      ctx.strokeStyle = C.glassSoft; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 70, pyy); ctx.moveTo(ex, ey); ctx.lineTo(ex + 70, pyy); ctx.stroke();
      // the pan: a shallow glass dish
      ctx.beginPath(); ctx.moveTo(ex - 86, pyy); ctx.quadraticCurveTo(ex, pyy + 52, ex + 86, pyy); ctx.closePath();
      ctx.fillStyle = 'rgba(214,250,255,0.14)'; ctx.fill(); ctx.strokeStyle = C.glass; ctx.lineWidth = 3; ctx.stroke();
      if (s < 0) {
        // a big water drop
        const dy = pyy - 8;
        ctx.beginPath(); ctx.moveTo(ex, dy - 92);
        ctx.bezierCurveTo(ex + 18, dy - 60, ex + 44, dy - 36, ex + 44, dy - 18);
        ctx.arc(ex, dy - 18, 44, 0, Math.PI);
        ctx.bezierCurveTo(ex - 44, dy - 36, ex - 18, dy - 60, ex, dy - 92);
        const g = ctx.createLinearGradient(0, dy - 92, 0, dy + 26); g.addColorStop(0, C.aquaLight); g.addColorStop(1, C.aquaDeep);
        ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.stroke();
        ell(ex - 16, dy - 30, 8, 13); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
        font(600, 26); text('water', ex, pyy + 66, { align: 'center', base: 'middle' });
      } else {
        // a salt crystal: a little cube
        const sx = ex, sy = pyy - 14, r = 38;
        ctx.beginPath(); ctx.moveTo(sx - r, sy - r * 0.9); ctx.lineTo(sx, sy - r * 1.35); ctx.lineTo(sx + r, sy - r * 0.9); ctx.lineTo(sx, sy - r * 0.45); ctx.closePath();
        ctx.fillStyle = '#FFFFFF'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(sx - r, sy - r * 0.9); ctx.lineTo(sx, sy - r * 0.45); ctx.lineTo(sx, sy + r * 0.5); ctx.lineTo(sx - r, sy + r * 0.05); ctx.closePath();
        ctx.fillStyle = '#D6EEF2'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(sx + r, sy - r * 0.9); ctx.lineTo(sx, sy - r * 0.45); ctx.lineTo(sx, sy + r * 0.5); ctx.lineTo(sx + r, sy + r * 0.05); ctx.closePath();
        ctx.fillStyle = '#AFD8E0'; ctx.fill();
        font(600, 26); text('salt', ex, pyy + 66, { align: 'center', base: 'middle' });
      }
    }
  });
}

// ---------- F: payoff ----------
function finale(t) {
  const a = seg(t, F0 + 0.1, F0 + 0.7);
  A(a, () => {
    const x = 132, y = 150, w = 600, h = 470;
    ctx.save(); ctx.translate(0, (1 - eout(a)) * 18);
    rrect(x, y, w, h, 34); ctx.fillStyle = 'rgba(214,250,255,0.09)'; ctx.fill(); ctx.strokeStyle = C.glassSoft; ctx.lineWidth = 2.5; ctx.stroke();
    rrect(x + 18, y + 24, 10, h - 48, 5); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
    font(700, 120); text(`${FILTRATE_L} L`, W / 2, y + 120, { color: C.mark, align: 'center', base: 'middle' });
    font(500, 26); text('filtered by your kidneys each day', W / 2, y + 196, { color: C.soft, align: 'center', base: 'middle' });
    // a falling drop between the two numbers
    const dy = y + 248 + ((t * 40) % 40);
    A(1 - ((t * 40) % 40) / 40, () => droplet(W / 2, dy, 9, C.aqua));
    font(700, 92); text(`${fmtL(URINE_L[0])}–${fmtL(URINE_L[1])} L`, W / 2, y + 340, { color: C.amber, align: 'center', base: 'middle' });
    font(500, 26); text('leave as urine', W / 2, y + 408, { color: C.soft, align: 'center', base: 'middle' });
    ctx.restore();
  });
  A(seg(t, F0 + 0.8, F0 + 1.3), () => { font(500, 22); text('Source: Wikipedia, “Kidney”', W / 2, 672, { color: C.soft, align: 'center' }); });
}

function captionPanel(t) {
  A(seg(t, 0.1, 0.5), () => {
    rrect(56, 748, W - 112, 166, 30); ctx.fillStyle = C.panel; ctx.fill();
    ctx.strokeStyle = 'rgba(170,240,245,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    rrect(76, 760, W - 152, 5, 3); ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill();
  });
  k.captions(t, CUES, { x: W / 2, y: 830, maxW: 690, size: 42, lh: 54, weight: 600, family: FONT, ink: C.ink,
    marks: { '*': C.mark, '^': C.amber, '~': C.bloodLight } });
}

Kit.scene({
  width: W, height: H, duration: END,
  fonts: [{ family: FONT, file: 'Rubik.woff2', weight: '400 800' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    header();
    const scenes = [
      [() => sceneA(t), 0, B0 + 0.1, 0, 0.45],
      [() => grid(t, 'fill'), B0, C0 + 0.2, 0.45, 0.45],
      [() => diagram(t), C0, D0 + 7.7, 0.45, 0.45],
      [() => grid(t, 'drain'), D0 + 7.4, E0 + 0.1, 0.45, 0.45],
      [() => beaker(t), D0 + 11.6, E0 + 0.1, 0.3, 0.45],
      [() => lastBottle(t), LAST.t0, E0 + 0.1, 0, 0.45],
      [() => balance(t), E0, F0 + 0.1, 0.45, 0.45],
      [() => finale(t), F0, END + 1, 0.45, 0],
    ];
    for (const [fn, a, b, fi, fo] of scenes) {
      if (t < a || t > b) continue;
      A(span(t, a, b, fi, fo), fn);
    }
    captionPanel(t);
  },
});
