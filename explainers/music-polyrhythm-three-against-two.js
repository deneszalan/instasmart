// Explainer for music-polyrhythm-three-against-two: 3 even beats against 2 fit on a grid of 6.
// Look: a vibrant geometric poster. A deep indigo ground with big translucent circles in coral, cyan
// and magenta; a drum head in the middle with a mottled skin, a dark rim and tension lugs. Two coloured
// tracks on the skin rotate under a fixed strike point at the top; each marker flashes and sends a
// ripple as it passes. Outfit for captions, Bungee for numbers and labels.
//
// Scene plan (58.5 s). Captions centred at y = 842; the grid's last row ends at y = 769.
//  A  0.0–10.3  Hook. The drum appears; the 3-track starts turning, the 2-track joins.
//  B 10.0–24.0  Thirds and halves: wedges on each track; the two only meet on beat one (big flash).
//  C 23.7–38.4  Counting: the lowest common multiple of 3 and 2 (computed) gives a 6-step ring and a
//               6-cell grid; the 3 lands on steps 1, 3, 5, the 2 on 1 and 4, together 1, 3, 4, 5. A
//               playhead follows the rotation.
//  D 38.1–48.6  Mnemonics on the "together" row: "not dif-fi-cult", then "cold cup of tea".
//  E 48.3–58.5  The rule again: 4 against 3 needs lcm(4, 3) = 12 steps; grid and tracks switch to 4:3.
// One cycle lasts 2.4 clip seconds (1.8 scene seconds at pace 0.75) for 3:2, 3.2 for 4:3.
//
// Facts (Wikipedia, "Polyrhythm"; "Tuplet"): polyrhythm is the simultaneous use of two or more rhythms
// that are not readily perceived as deriving from one another; 3 evenly spaced notes against 2 (3:2) is a
// cross-rhythm also known as a hemiola; the counting for polyrhythms is determined by the lowest common
// multiple, so 2 against 3 is counted in 6 beats; the 3 against 2 rhythm has the same rhythm as the phrase
// "not difficult", and "cold cup of tea" is another such phrase. No culture is credited in the clip.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const PACE = 0.75;

const C = {
  bg: '#1A1036', bgDeep: '#0E0822', coral: '#FF6A45', coralDeep: '#D8401F', cyan: '#3FD6E8', cyanDeep: '#0D8FA3',
  magenta: '#F0408F', magentaDeep: '#B0105A', sun: '#FFC94A', cream: '#FFF4E2', creamSoft: 'rgba(255,244,226,0.72)',
  skin: '#EFDDBB', skinDark: '#CBB38A', rim: '#2A1A3D', ink: '#2B1830',
};
const TEXT = 'Outfit', NUM = 'Bungee';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.cream, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- rhythm maths ----------
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a * b) / gcd(a, b);
/** Grid steps (1-based) where n even beats land in a cycle of `steps` steps. */
const hitsOn = (n, steps) => Array.from({ length: n }, (_, i) => 1 + (i * steps) / n);
const R32 = { a: 3, b: 2, steps: lcm(3, 2) };
const R43 = { a: 4, b: 3, steps: lcm(4, 3) };
for (const r of [R32, R43]) { r.hitsA = hitsOn(r.a, r.steps); r.hitsB = hitsOn(r.b, r.steps); r.both = [...new Set([...r.hitsA, ...r.hitsB])].sort((x, y) => x - y); }

// ---------- timeline ----------
const T = { A: [0, 10.3], B: [10.0, 24.0], C: [23.7, 38.4], D: [38.1, 48.6], E: [48.3, 58.5] };
const SWITCH = [49.2, 50.4]; // 3:2 → 4:3
const CYCLE32 = 2.4 * PACE, CYCLE43 = 3.2 * PACE; // scene seconds per turn
const speed = (t) => eio(seg(t, 1.0, 2.0)) * lerp(1 / CYCLE32, 1 / CYCLE43, eio(seg(t, SWITCH[0], SWITCH[1])));
const DT = 0.004, CYC = [0];
for (let i = 1; i * DT <= 60; i++) CYC.push(CYC[i - 1] + speed((i - 0.5) * DT) * DT);
/** Turns completed at scene time t. */
const cyc = (t) => { const x = clamp(t, 0, 59.99) / DT, i = Math.floor(x); return lerp(CYC[i], CYC[i + 1], x - i); };
const frac = (x) => x - Math.floor(x);
/** Scene seconds since a marker at cycle position p last passed the strike point (Infinity before). */
function since(t, p) {
  const c = cyc(t) - p;
  if (c < 0) return Infinity;
  return frac(c) / Math.max(speed(t), 1 / CYCLE43);
}
const flash = (t, p) => { const s = since(t, p); return s === Infinity ? 0 : Math.exp(-s / 0.16); };

// ---------- background ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const DX = 432, DY = 350, R_OUT = 194, R_MID = 154, R_IN = 114, R_RIM = 228;
let bgCanvas = null, skinCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const rg = g.createRadialGradient(DX, DY, 60, DX, DY, 820);
  rg.addColorStop(0, '#2A1752'); rg.addColorStop(0.55, C.bg); rg.addColorStop(1, C.bgDeep);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // big geometric circles
  const circ = (x, y, r, col, a, w) => { g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; };
  const disc = (x, y, r, col, a) => { g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; };
  disc(-40, 980, 300, C.magenta, 0.10); disc(900, 760, 220, C.cyan, 0.08); disc(40, 120, 150, C.coral, 0.08);
  for (let i = 0; i < 6; i++) circ(-40, 980, 120 + i * 46, C.sun, 0.06, 3);
  for (let i = 0; i < 5; i++) circ(900, 760, 60 + i * 40, C.cream, 0.05, 2);
  circ(DX, DY, R_RIM + 40, C.coral, 0.16, 2); circ(DX, DY, R_RIM + 70, C.cyan, 0.10, 2); circ(DX, DY, R_RIM + 104, C.magenta, 0.07, 2);
  // fine dot grid
  g.fillStyle = 'rgba(255,244,226,0.05)';
  for (let y = 20; y < H; y += 28) for (let x = 14; x < W; x += 28) { g.beginPath(); g.arc(x, y, 1.4, 0, Math.PI * 2); g.fill(); }

  // drum head: rim, lugs and a mottled skin
  skinCanvas = document.createElement('canvas'); skinCanvas.width = W; skinCanvas.height = H;
  const s = skinCanvas.getContext('2d');
  s.fillStyle = 'rgba(0,0,0,0.35)'; s.beginPath(); s.ellipse(DX, DY + 18, R_RIM + 10, R_RIM + 6, 0, 0, Math.PI * 2); s.fill();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    s.save(); s.translate(DX + Math.cos(a) * (R_RIM + 6), DY + Math.sin(a) * (R_RIM + 6)); s.rotate(a);
    s.fillStyle = '#C9A24A'; s.beginPath(); s.roundRect(-8, -14, 22, 28, 6); s.fill();
    s.fillStyle = 'rgba(0,0,0,0.3)'; s.fillRect(4, -10, 4, 20); s.restore();
  }
  const rimG = s.createRadialGradient(DX, DY, R_RIM - 26, DX, DY, R_RIM);
  rimG.addColorStop(0, '#3E2759'); rimG.addColorStop(1, C.rim);
  s.fillStyle = rimG; s.beginPath(); s.arc(DX, DY, R_RIM, 0, Math.PI * 2); s.fill();
  const sk = s.createRadialGradient(DX - 60, DY - 70, 20, DX, DY, R_RIM - 16);
  sk.addColorStop(0, '#FBF0D8'); sk.addColorStop(0.7, C.skin); sk.addColorStop(1, C.skinDark);
  s.fillStyle = sk; s.beginPath(); s.arc(DX, DY, R_RIM - 16, 0, Math.PI * 2); s.fill();
  s.save(); s.beginPath(); s.arc(DX, DY, R_RIM - 16, 0, Math.PI * 2); s.clip();
  const rnd = mulberry32(5);
  for (let i = 0; i < 520; i++) { // mottling
    const x = DX + (rnd() - 0.5) * 2 * R_RIM, y = DY + (rnd() - 0.5) * 2 * R_RIM, r = 4 + rnd() * 26;
    s.fillStyle = rnd() < 0.5 ? `rgba(150,110,60,${0.03 + rnd() * 0.05})` : `rgba(255,255,240,${0.04 + rnd() * 0.06})`;
    s.beginPath(); s.arc(x, y, r, 0, Math.PI * 2); s.fill();
  }
  for (let i = 0; i < 260; i++) { // fibres
    const x = DX + (rnd() - 0.5) * 2 * R_RIM, y = DY + (rnd() - 0.5) * 2 * R_RIM, a = rnd() * Math.PI, l = 10 + rnd() * 40;
    s.strokeStyle = `rgba(120,85,45,${0.05 + rnd() * 0.07})`; s.lineWidth = 1;
    s.beginPath(); s.moveTo(x, y); s.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); s.stroke();
  }
  const shade = s.createRadialGradient(DX, DY, R_RIM * 0.55, DX, DY, R_RIM);
  shade.addColorStop(0, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(60,30,10,0.25)');
  s.fillStyle = shade; s.fillRect(0, 0, W, H);
  s.restore();
}

// ---------- the drum ----------
/** Angle (clockwise from the top) of cycle position p at time t. */
const ang = (t, p) => 2 * Math.PI * (p - frac(cyc(t)));
const pos = (r, a) => [DX + r * Math.sin(a), DY - r * Math.cos(a)];

function track(t, r, n, color, deep, a, { wedges = 0, label = true } = {}) {
  if (a <= 0) return;
  withAlpha(a, () => {
    ctx.strokeStyle = deep; ctx.lineWidth = 5; ctx.globalAlpha *= 0.55;
    ctx.beginPath(); ctx.arc(DX, DY, r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha /= 0.55;
    // wedges: coloured arcs between consecutive markers
    if (wedges > 0) withAlpha(wedges, () => {
      for (let i = 0; i < n; i++) {
        const a0 = ang(t, i / n), a1 = ang(t, (i + 1) / n);
        ctx.fillStyle = i % 2 ? `${color}30` : `${color}55`;
        ctx.beginPath(); ctx.moveTo(DX, DY);
        ctx.arc(DX, DY, r, a0 - Math.PI / 2, a1 - Math.PI / 2 + (a1 < a0 ? Math.PI * 2 : 0)); ctx.closePath(); ctx.fill();
        const mid = a0 + Math.PI / n;
        const [lx, ly] = pos(r * 0.62, mid);
        font(400, 30, NUM); text(`1/${n}`, lx, ly, { color: deep, align: 'center', base: 'middle' });
      }
    });
    for (let i = 0; i < n; i++) {
      const p = i / n, [x, y] = pos(r, ang(t, p)), f = flash(t, p);
      if (f > 0.02) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 46);
        g.addColorStop(0, `${color}cc`); g.addColorStop(1, `${color}00`);
        ctx.fillStyle = g; ctx.globalAlpha *= f; ctx.beginPath(); ctx.arc(x, y, 46, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha /= f;
      }
      const rr = 17 + 7 * f;
      ctx.fillStyle = deep; ctx.beginPath(); ctx.arc(x, y + 2, rr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
      if (label) { font(400, 20, NUM); text(`${i + 1}`, x, y + 1, { color: C.ink, align: 'center', base: 'middle' }); }
    }
    // ripple from the strike point after each hit
    for (let i = 0; i < n; i++) {
      const s = since(t, i / n);
      if (s > 0.6) continue;
      const q = s / 0.6;
      ctx.strokeStyle = color; ctx.lineWidth = 4 * (1 - q); ctx.globalAlpha *= 1 - q;
      ctx.beginPath(); ctx.arc(DX, DY - r, 18 + 60 * q, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha /= 1 - q || 1;
    }
  });
}
function stepRing(t, steps, a) {
  if (a <= 0) return;
  withAlpha(a, () => {
    ctx.strokeStyle = 'rgba(43,24,48,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([3, 7]);
    ctx.beginPath(); ctx.arc(DX, DY, R_MID, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < steps; i++) {
      const [x, y] = pos(R_MID, ang(t, i / steps));
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, steps > 6 ? 5 : 7, 0, Math.PI * 2); ctx.fill();
    }
  });
}
function strikePoint(a) {
  withAlpha(a, () => {
    ctx.fillStyle = C.cream;
    ctx.beginPath(); ctx.moveTo(DX - 16, DY - R_RIM - 30); ctx.lineTo(DX + 16, DY - R_RIM - 30); ctx.lineTo(DX, DY - R_RIM - 8); ctx.closePath(); ctx.fill();
  });
}
/** Centre medallion: shows the ratio, flashes magenta on beat one. */
function hub(t, label, a) {
  withAlpha(a, () => {
    const f = Math.min(flash(t, 0), 1);
    ctx.fillStyle = C.rim; ctx.beginPath(); ctx.arc(DX, DY, 70 + 8 * f, 0, Math.PI * 2); ctx.fill();
    if (f > 0.02) withAlpha(f, () => { ctx.fillStyle = C.magenta; ctx.beginPath(); ctx.arc(DX, DY, 70 + 8 * f, 0, Math.PI * 2); ctx.fill(); });
    font(400, 46, NUM); text(label, DX, DY + 4, { color: C.cream, align: 'center', base: 'middle' });
  });
}

// ---------- the grid below the drum ----------
const GY0 = 660, ROW = 46;
const gridGeom = (n) => { const cw = n > 6 ? 44 : 76, gap = n > 6 ? 4 : 8; const total = n * cw + (n - 1) * gap; return { cw, gap, x0: W / 2 + 30 - total / 2 }; };
/** The step grid: rows for the two rhythms and for all hits; rowA gives each row's opacity. */
function grid(t, r, a, rowA = [1, 1, 1]) {
  if (a <= 0) return;
  withAlpha(a, () => {
    const n = r.steps, { cw, gap, x0 } = gridGeom(n);
    const cur = Math.floor(frac(cyc(t)) * n); // the step under the strike point
    const rows = [[`${r.a}`, r.hitsA, C.coral], [`${r.b}`, r.hitsB, C.cyan], ['ALL', r.both, C.magenta]];
    rows.forEach(([lab, hits, col], ri) => withAlpha(rowA[ri], () => {
      const y = GY0 + ri * ROW;
      font(400, ri === 2 ? 22 : 28, NUM); text(lab, x0 - 22, y + 2, { color: col, align: 'right', base: 'middle' });
      for (let i = 0; i < n; i++) {
        const x = x0 + i * (cw + gap), on = hits.includes(i + 1), isCur = i === cur;
        ctx.fillStyle = on ? col : 'rgba(255,244,226,0.10)';
        k.rrect(x, y - 17, cw, 34, 8); ctx.fill();
        if (isCur) { ctx.strokeStyle = C.cream; ctx.lineWidth = 3; k.rrect(x - 2, y - 19, cw + 4, 38, 9); ctx.stroke(); }
        if (on && isCur) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; k.rrect(x, y - 17, cw, 34, 8); ctx.fill(); }
      }
    }));
    font(400, 22, NUM);
    for (let i = 0; i < n; i++) {
      if (n > 6 && i % 3) continue;
      text(`${i + 1}`, x0 + i * (cw + gap) + cw / 2, GY0 - 34, { color: C.creamSoft, align: 'center', base: 'middle' });
    }
  });
}
/** Words on the ALL row, one per hit; the one being hit grows. */
function gridWords(t, r, words, a) {
  if (a <= 0) return;
  withAlpha(a, () => {
    const n = r.steps, { cw, gap, x0 } = gridGeom(n), y = GY0 + 2 * ROW;
    words.forEach((w, j) => {
      const step = r.both[j], x = x0 + (step - 1) * (cw + gap) + cw / 2;
      const pop = flash(t, (step - 1) / n);
      font(700, 26 + 6 * pop); text(w, x, y + 1, { color: C.ink, align: 'center', base: 'middle' });
    });
  });
}
function gridLayer(t) {
  const g = eout(seg(t, 24.6, 25.6));
  if (g <= 0) return;
  const sw = eio(seg(t, SWITCH[0], SWITCH[1]));
  const allA = eout(seg(t, 33.5, 34.3));
  withAlpha(1 - sw, () => grid(t, R32, g, [1, 1, allA]));
  withAlpha(sw, () => grid(t, R43, 1));
  withAlpha(span(t, 24.0, 33.6, 0.4, 0.3), () => {
    font(400, 26, NUM); text(`LCM(3, 2) = ${R32.steps}`, W / 2 + 30, GY0 + 2 * ROW + 2, { color: C.sun, align: 'center', base: 'middle' });
  });
  gridWords(t, R32, ['not', 'dif', 'fi', 'cult'], span(t, 38.4, 43.3, 0.4, 0.3));
  gridWords(t, R32, ['cold', 'cup', 'of', 'tea'], span(t, 43.3, 48.7, 0.4, 0.4));
  withAlpha(sw * span(t, 50.4, 53.6, 0.4, 0.4), () => {
    font(400, 24, NUM); text('LCM(4, 3)', 776, 548, { color: C.sun, align: 'center', base: 'middle' });
    font(400, 34, NUM); text(`= ${R43.steps}`, 776, 588, { color: C.sun, align: 'center', base: 'middle' });
  });
  withAlpha(eout(seg(t, 54.0, 55.0)), () => {
    font(500, 22); text('Source: Wikipedia, “Polyrhythm” · steps computed in code', W / 2, 912, { color: 'rgba(255,244,226,0.6)', align: 'center', base: 'middle' });
  });
}

// ---------- scenes ----------
function drumLayer(t) {
  const on = eout(seg(t, 0.1, 1.0));
  const sw = eio(seg(t, SWITCH[0], SWITCH[1]));
  withAlpha(on, () => {
    ctx.drawImage(skinCanvas, 0, 0);
    strikePoint(1);
    const wA = span(t, 10.3, 14.6, 0.5, 0.5), wB = span(t, 14.7, 18.6, 0.5, 0.5);
    const stepA = eout(seg(t, 24.2, 25.4));
    withAlpha(1 - sw, () => {
      stepRing(t, R32.steps, stepA);
      track(t, R_IN, 2, C.cyan, C.cyanDeep, eout(seg(t, 3.0, 3.8)), { wedges: wB });
      track(t, R_OUT, 3, C.coral, C.coralDeep, eout(seg(t, 0.8, 1.6)), { wedges: wA });
      hub(t, '3:2', eout(seg(t, 5.2, 6.0)));
    });
    withAlpha(sw, () => {
      stepRing(t, R43.steps, 1);
      track(t, R_IN, 3, C.cyan, C.cyanDeep, 1);
      track(t, R_OUT, 4, C.coral, C.coralDeep, 1);
      hub(t, '4:3', 1);
    });
  });
}

// ---------- captions ----------
const CUES = [
  [0.5, 5.2, 'Can you fit *3 even beats* and ~2 even beats~ into the same time?'],
  [5.3, 10.1, 'That clash is a polyrhythm: *3* against ~2~, also called a hemiola.'],
  [10.3, 14.6, 'Three hits split each cycle into *thirds*…'],
  [14.7, 18.6, '…two hits split it into ~halves~.'],
  [18.7, 23.8, 'They land together only once per cycle, on *beat one*.'],
  [24.0, 28.7, 'To count it, cut the cycle into the lowest common multiple: *6* steps.'],
  [28.8, 33.4, 'The 3 lands on steps *1, 3, 5*. The 2 lands on ~1 and 4~.'],
  [33.5, 38.2, 'Together you hear hits on steps 1, 3, 4 and 5.'],
  [38.4, 43.2, 'Say *“not difficult”*: it has exactly that rhythm.'],
  [43.3, 48.4, 'So does ~“cold cup of tea”~: one word per hit.'],
  [48.6, 53.4, 'The rule works for any pair: *4 against 3* needs ~12~ steps.'],
  [53.5, 58.4, 'Find the lowest common multiple, and both rhythms share one grid.'],
];
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
    k.captions(t, [cue], { x: W / 2, y: 842, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.cream, marks: { '*': C.coral, '~': C.cyan } });
  }
}

Kit.scene({
  width: W, height: H, duration: 58.5, pace: PACE,
  fonts: [
    { family: TEXT, file: 'Outfit.woff2', weight: '100 900' },
    { family: NUM, file: 'Bungee.woff2', weight: '400' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    font(400, 22, NUM); text('RECKON', 64, 84, { color: C.coral, spacing: '2px' });
    const rw = ctx.measureText('RECKON').width + 12;
    font(600, 22); text('MUSIC · RHYTHM', 64 + rw + 16, 84, { color: C.creamSoft, spacing: '2px' });
    drumLayer(t);
    gridLayer(t);
    captions(t);
  },
});
