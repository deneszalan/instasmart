// Explainer for biology-mendel-pea-ratios: wrinkled peas vanish for a generation, then return 1 seed in 4.
// Look: a hand-coloured botanical plate. Cream laid paper with fibres and foxing, sepia-green ink line-work,
// watercolour washes in garden greens, a climbing pea vine in the margin, open pods with round and
// wrinkled peas. Cormorant Garamond for plate titles and numbers, Alegreya for captions and labels.
//
// Sources: Wikipedia, "Gregor Mendel" (the post's source): 1856–1863, some 28,000 plants, mostly peas;
// friar of St. Thomas' Abbey in Brno; recessive trait vanishes in the first generation and returns 1 in 4;
// paper "Versuche über Pflanzenhybriden" published 1866, ignored, rediscovered 1900; "father of modern
// genetics"; 1822–1884. Wikipedia, "Mendelian inheritance": two alleles per trait, one from each parent;
// dominant and recessive; self-fertilisation of the F1; Punnett squares (Reginald Punnett, so not Mendel's
// own tool, and the scene does not say it was). Seed-shape counts from Mendel's paper (English translation
// by Abbott & Fairbanks, Genetics 204, 2016): 253 hybrids gave 7,324 seeds, 5,474 round and 1,850
// wrinkled, ratio 2.96:1. The ratio and the pea tallies below are computed from those counts.
//
// Scene plan (62.6 s; captions centred at y = 835, nothing important below y = 930):
//  A  0.0–27.9  Hook and data. 28 sprigs (1 = 1,000 plants). Round × wrinkled parents in open pods; the
//               first generation pod: all round. Self-fertilised, the next generation pours into two trays,
//               1 drawn pea = 50 seeds, counters run to 5,474 and 1,850; the ratio 2.96 : 1.
//  B 27.6–53.2  Why. Alleles as tokens: R dominant, r recessive; RR × rr gives Rr, all round; an animated
//               Punnett square of Rr pollen and egg cells fills RR, Rr, rR, rr: three round, one wrinkled.
//  C 52.9–62.6  The 1866 paper, ignored until 1900; the closing plate.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#F2EAD3', paperDeep: '#E2D3AE', ink: '#2C2818', inkSoft: 'rgba(44,40,24,0.72)', inkDim: 'rgba(44,40,24,0.5)',
  green: '#3F6E2A', greenDeep: '#26461A', leaf: '#6F9A40', leafLight: '#A9C46E', podIn: '#D7E3A6',
  pea: '#D2C95A', peaHi: '#F0E9A0', peaEdge: '#7D7A2A', terra: '#A44A26', terraLight: '#C9683F', gold: '#B98A2E',
};
const SERIF = 'Cormorant Garamond', TEXT = 'Alegreya';

let k, ctx;
const font = (w, s, f = TEXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const rrect = (...a) => k.rrect(...a);
const A_ = (a, fn) => k.alpha(a, fn);

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- Mendel's counts (seed shape, second year) ----------
const ROUND = 5474, WRINKLED = 1850, SEEDS = ROUND + WRINKLED; // 7,324
const RATIO = (ROUND / WRINKLED).toFixed(2); // "2.96"
const PER = 50; // seeds per drawn pea
const N_R = Math.round(ROUND / PER), N_W = Math.round(WRINKLED / PER); // 109 and 37
// the order the drawn peas fall in: shuffled, as in a real harvest
const FALL = [];
{
  const r = mulberry32(5);
  const bag = [...Array(N_R).fill('R'), ...Array(N_W).fill('W')];
  for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
  let nr = 0, nw = 0;
  bag.forEach((kind, i) => FALL.push({ kind, slot: kind === 'R' ? nr++ : nw++, i }));
}
const FALL_A = 19.0, FALL_B = 22.6;
const fallStart = (i) => FALL_A + (FALL_B - FALL_A) * (i / (FALL.length - 1));

// ---------- timeline ----------
const T = { A: [0, 27.9], B: [27.6, 53.2], C: [52.9, 62.6] };
const CUES = [
  [0.5, 5.8, 'From 1856 to 1863, Gregor Mendel grew some *28,000* plants, most of them peas.'],
  [5.9, 10.3, 'Cross a plant with *round* seeds and one with ~wrinkled~ seeds…'],
  [10.4, 14.2, '…and every seed of the next generation is *round*.'],
  [14.3, 18.6, 'Let those plants fertilise themselves, and ~wrinkled~ seeds come back.'],
  [18.7, 23.4, `Mendel counted ${Kit.fmt(SEEDS)} of them: *${Kit.fmt(ROUND)}* round, ~${Kit.fmt(WRINKLED)}~ wrinkled.`],
  [23.5, 27.6, `That’s *${RATIO} to 1*: very close to 3 to 1.`],
  [28.0, 33.0, 'Why? Each plant carries *two* copies of the gene, one from each parent.'],
  [33.1, 37.9, 'Round, *R*, is dominant: one copy is enough. Wrinkled, ~r~, is recessive.'],
  [38.0, 43.3, 'First generation: *R* from one parent, ~r~ from the other. All Rr, all round.'],
  [43.4, 48.4, 'Each Rr plant passes on *R* or ~r~, half the time each.'],
  [48.5, 53.0, 'Four equally likely pairs; only ~rr~ is wrinkled: *3 to 1*.'],
  [53.3, 57.9, 'Mendel published in 1866. His work was ignored until *1900*.'],
  [58.0, 62.4, 'Today he is known as the *father of modern genetics*.'],
];

// ---------- paper ----------
let bg = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 420, 80, W / 2, 520, 820);
  rad.addColorStop(0, '#F7F0DC'); rad.addColorStop(0.7, C.paper); rad.addColorStop(1, C.paperDeep);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const r = mulberry32(3);
  // laid lines
  g.strokeStyle = 'rgba(120,100,60,0.05)'; g.lineWidth = 1;
  for (let y = 0; y < H; y += 7) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  // fibres
  for (let i = 0; i < 260; i++) {
    const x = r() * W, y = r() * H, a = r() * 6.28, l = 6 + r() * 18;
    g.strokeStyle = `rgba(110,90,50,${0.05 + r() * 0.07})`; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // specks and foxing
  for (let i = 0; i < 2200; i++) { g.fillStyle = `rgba(90,70,40,${r() * 0.06})`; g.fillRect(r() * W, r() * H, 1.4, 1.4); }
  for (let i = 0; i < 9; i++) {
    const x = r() * W, y = r() * H, rr = 10 + r() * 30;
    const f = g.createRadialGradient(x, y, 0, x, y, rr); f.addColorStop(0, 'rgba(170,120,60,0.10)'); f.addColorStop(1, 'rgba(170,120,60,0)');
    g.fillStyle = f; g.beginPath(); g.arc(x, y, rr, 0, 6.29); g.fill();
  }
  // plate rule
  g.strokeStyle = 'rgba(44,40,24,0.35)'; g.lineWidth = 1.5; g.strokeRect(30, 120, W - 60, 900);
  g.lineWidth = 0.8; g.strokeRect(38, 128, W - 76, 884);
  // vignette
  const vg = g.createRadialGradient(W / 2, H / 2, 380, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(90,60,20,0)'); vg.addColorStop(1, 'rgba(90,60,20,0.18)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

/** A watercolour wash: a soft blotch with a darker rim. */
function wash(x, y, rx, ry, color, a, seed = 1) {
  if (a <= 0) return;
  const r = mulberry32(seed);
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const n = 28, ph = r() * 6.28;
    for (let j = 0; j <= n; j++) {
      const th = (j / n) * Math.PI * 2, wob = 1 + 0.07 * Math.sin(th * 3 + ph) + 0.04 * Math.sin(th * 7 + ph * 2);
      const px = x + Math.cos(th) * rx * wob * (1 - i * 0.12), py = y + Math.sin(th) * ry * wob * (1 - i * 0.12);
      j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.fillStyle = color; ctx.globalAlpha *= 0.55; ctx.fill();
  }
  ctx.restore();
}

/** The margin vine: a stem climbing the left rule, with leaves and tendrils, growing in. */
function vine(t) {
  const grow = eout(seg(t, 0.2, 3.5));
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineCap = 'round';
  const pts = [];
  for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push([46 + Math.sin(u * 14) * 9, lerp(1004, 150, u)]); }
  const n = Math.floor(pts.length * grow);
  ctx.lineWidth = 2.2; ctx.globalAlpha *= 0.7;
  ctx.beginPath(); pts.slice(0, n).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  for (let i = 4; i < n; i += 7) {
    const [x, y] = pts[i], side = (i / 7) % 2 < 1 ? 1 : -1;
    const sz = 1 - i / 90;
    ctx.save(); ctx.translate(x, y); ctx.rotate(side * 0.9 - 0.3);
    ctx.fillStyle = C.leaf; ctx.globalAlpha *= 0.55;
    ctx.beginPath(); ctx.ellipse(side * 14 * sz, 0, 14 * sz, 7 * sz, 0, 0, 6.29); ctx.fill();
    ctx.restore();
    if (i % 3 === 0) {
      ctx.lineWidth = 1.2; ctx.beginPath();
      for (let j = 0; j < 24; j++) { const th = j * 0.45, rr = 10 - j * 0.38; const px = x - side * (4 + Math.cos(th) * rr), py = y - 6 + Math.sin(th) * rr; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    }
  }
  ctx.restore();
}

function header() {
  font(700, 26, SERIF); text('RECKON', 64, 84, { color: C.greenDeep, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 18;
  font(500, 24, SERIF); text('· Biology · Plate on heredity', 64 + w + 10, 84, { color: C.inkSoft });
}

// ---------- peas, pods, sprigs ----------
function pea(x, y, r, kind, seed = 1, a = 1) {
  if (a <= 0) return;
  A_(a, () => {
    ctx.save(); ctx.translate(x, y);
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1);
    if (kind === 'R') {
      g.addColorStop(0, C.peaHi); g.addColorStop(0.55, C.pea); g.addColorStop(1, '#A59E38');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.29); ctx.fill();
      ctx.strokeStyle = C.peaEdge; ctx.lineWidth = Math.max(1, r * 0.09); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,240,0.7)'; ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.38, r * 0.22, r * 0.14, -0.6, 0, 6.29); ctx.fill();
    } else {
      const rnd = mulberry32(seed * 7 + 1), ph = rnd() * 6.28, ph2 = rnd() * 6.28;
      ctx.beginPath();
      for (let j = 0; j <= 40; j++) {
        const th = (j / 40) * 6.283, rr = r * (0.9 + 0.07 * Math.sin(th * 5 + ph) + 0.05 * Math.sin(th * 9 + ph2));
        j ? ctx.lineTo(Math.cos(th) * rr, Math.sin(th) * rr) : ctx.moveTo(Math.cos(th) * rr, Math.sin(th) * rr);
      }
      ctx.closePath();
      g.addColorStop(0, '#E4D985'); g.addColorStop(0.6, '#BDB24A'); g.addColorStop(1, '#8E8830');
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = C.peaEdge; ctx.lineWidth = Math.max(1, r * 0.09); ctx.stroke();
      ctx.strokeStyle = 'rgba(80,75,20,0.6)'; ctx.lineWidth = Math.max(0.8, r * 0.07);
      for (let c = 0; c < 4; c++) {
        const a0 = ph + c * 1.6, rr = r * (0.25 + 0.15 * c);
        ctx.beginPath(); ctx.arc(Math.cos(a0) * r * 0.15, Math.sin(a0) * r * 0.15, rr, a0, a0 + 1.3); ctx.stroke();
      }
    }
    ctx.restore();
  });
}

/** An open pea pod lying at angle ang, with its peas showing. open: 0 closed .. 1 open. */
function pod(cx, cy, len, kinds, { ang = 0, open = 1, a = 1, seed = 1 } = {}) {
  if (a <= 0) return;
  A_(a, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    const L = len / 2, h = len * 0.17;
    const lens = (hh, inset = 0) => {
      ctx.beginPath(); ctx.moveTo(-L + inset, 0);
      ctx.bezierCurveTo(-L * 0.4, -hh, L * 0.5, -hh, L - inset, -hh * 0.1);
      ctx.bezierCurveTo(L * 0.5, hh, -L * 0.4, hh, -L + inset, 0); ctx.closePath();
    };
    // shadow wash
    wash(6, h * 0.9, L * 1.02, h * 0.55, 'rgba(70,90,40,0.25)', 1, seed + 3);
    // outer shell
    const sh = ctx.createLinearGradient(0, -h, 0, h);
    sh.addColorStop(0, C.leafLight); sh.addColorStop(0.5, C.leaf); sh.addColorStop(1, C.green);
    ctx.fillStyle = sh; lens(h); ctx.fill();
    ctx.strokeStyle = C.greenDeep; ctx.lineWidth = 2; ctx.stroke();
    // inside
    ctx.fillStyle = C.podIn; lens(h * 0.62, L * 0.08); ctx.fill();
    ctx.strokeStyle = 'rgba(38,70,26,0.5)'; ctx.lineWidth = 1.2; ctx.stroke();
    // peas
    const n = kinds.length, pr = Math.min(h * 0.5, (len * 0.78) / n / 2.1);
    kinds.forEach((kd, i) => {
      const x = lerp(-L * 0.62, L * 0.58, n === 1 ? 0.5 : i / (n - 1));
      pea(x, 0, pr, kd, seed * 10 + i, 1);
    });
    // the upper valve, swinging open
    if (open < 1) {
      ctx.save(); ctx.globalAlpha *= 1 - eio(open); ctx.translate(0, -h * 0.9 * eio(open));
      ctx.fillStyle = sh; lens(h * 0.95); ctx.fill(); ctx.strokeStyle = C.greenDeep; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }
    // calyx and stalk
    ctx.fillStyle = C.green;
    for (const s of [-1, 0, 1]) { ctx.beginPath(); ctx.ellipse(-L - 4, s * 6, 12, 4, s * 0.5, 0, 6.29); ctx.fill(); }
    ctx.strokeStyle = C.greenDeep; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-L - 10, 0); ctx.quadraticCurveTo(-L - 26, -8, -L - 34, -22); ctx.stroke();
    // tip
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L - 2, -h * 0.1); ctx.quadraticCurveTo(L + 10, -h * 0.2, L + 12, -h * 0.6); ctx.stroke();
    ctx.restore();
  });
}

function sprig(x, y, s, p) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = C.green; ctx.lineCap = 'round'; ctx.lineWidth = 0.08;
  const h = eout(p);
  ctx.beginPath(); ctx.moveTo(0, 0.5); ctx.quadraticCurveTo(0.1, 0, 0, -0.5 * h); ctx.stroke();
  ctx.fillStyle = C.leaf;
  if (p > 0.3) for (const [lx, ly, rot] of [[-0.18, 0.05, -0.6], [0.2, -0.15, 0.6]]) {
    ctx.save(); ctx.translate(lx * eout(seg(p, 0.3, 1)), ly); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, 0, 0.2 * eout(seg(p, 0.3, 1)), 0.09, 0, 0, 6.29); ctx.fill(); ctx.restore();
  }
  if (p > 0.6) { ctx.lineWidth = 0.04; ctx.beginPath(); ctx.arc(0.08, -0.5, 0.08, 3.2, 3.2 + 4 * seg(p, 0.6, 1)); ctx.stroke(); }
  ctx.restore();
}

function label(s, x, y, { size = 28, color = C.ink, align = 'center', weight = 600, family = SERIF, italic = false } = {}) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
}

/** An allele token. */
function token(ch, x, y, a = 1, s = 1, r = 26) {
  if (a <= 0) return;
  A_(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = ch === 'R' ? C.green : C.terra; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.29); ctx.fill();
    ctx.strokeStyle = 'rgba(44,40,24,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
    font(700, Math.round(r * 1.25)); text(ch, 0, 2, { color: '#FBF6E6', align: 'center', base: 'middle' });
    ctx.restore();
  });
}

function arrowDown(x, y0, y1, p, color = C.inkSoft) {
  if (p <= 0) return;
  const y = lerp(y0, y1, eout(p));
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x - 9, y - 10); ctx.lineTo(x + 9, y - 10); ctx.closePath(); ctx.fill();
}

// ---------- scene A ----------
const TRAY = { pitch: 25, r: 10.5, cols: 11, bottom: 612, xR: 118, xW: 474 };
const slotXY = (kind, slot) => {
  const col = slot % TRAY.cols, row = Math.floor(slot / TRAY.cols);
  const x0 = kind === 'R' ? TRAY.xR : TRAY.xW;
  return [x0 + 18 + col * TRAY.pitch, TRAY.bottom - 16 - row * TRAY.pitch];
};
function sceneA(t) {
  // 28 sprigs, one per 1,000 plants
  A_(span(t, 0.4, 5.9, 0.4, 0.5), () => {
    for (let i = 0; i < 28; i++) {
      const col = i % 7, row = Math.floor(i / 7);
      sprig(212 + col * 74, 270 + row * 96, 70, seg(t, 0.8 + i * 0.07, 1.8 + i * 0.07));
    }
    label('each sprig = 1,000 plants', W / 2, 668, { size: 30, italic: true, color: C.inkSoft, weight: 500 });
    label('Brno, 1856–1863', W / 2, 200, { size: 34, weight: 600, color: C.greenDeep });
  });
  // the parents
  const par = span(t, 5.9, 15.0, 0.5, 0.6);
  A_(par, () => {
    const o = eio(seg(t, 6.6, 7.6));
    wash(226, 300, 170, 90, 'rgba(169,196,110,0.35)', eout(seg(t, 5.9, 6.6)), 11);
    wash(640, 300, 170, 90, 'rgba(169,196,110,0.35)', eout(seg(t, 6.1, 6.8)), 12);
    pod(226, 290, 250, ['R', 'R', 'R', 'R', 'R'], { ang: -0.12, open: o, seed: 1 });
    pod(640, 290, 250, ['W', 'W', 'W', 'W', 'W'], { ang: 0.12, open: o, seed: 2 });
    label('round', 226, 380, { size: 34, italic: true, color: C.greenDeep });
    label('wrinkled', 640, 380, { size: 34, italic: true, color: C.terra });
    label('×', W / 2, 296, { size: 64, weight: 500, color: C.inkSoft });
    label('parents', W / 2, 200, { size: 30, weight: 600, color: C.inkSoft });
    // first generation
    const f1 = seg(t, 10.5, 11.4);
    arrowDown(W / 2, 400, 488, f1);
    A_(eout(seg(t, 11.0, 11.8)), () => {
      wash(W / 2, 560, 190, 80, 'rgba(169,196,110,0.4)', 1, 13);
      pod(W / 2, 552, 280, ['R', 'R', 'R', 'R', 'R', 'R'], { ang: 0, open: eio(seg(t, 11.4, 12.3)), seed: 3 });
      label('first generation: all round', W / 2, 650, { size: 32, italic: true, color: C.greenDeep });
    });
  });
  // self-fertilisation: the first-generation pod rises, and the next generation pours out
  const self = span(t, 14.4, 27.9, 0.4, 0.4);
  A_(self, () => {
    const up = eio(seg(t, 14.4, 15.4));
    const y = lerp(552, 230, up);
    pod(W / 2, y, lerp(280, 220, up), ['R', 'R', 'R', 'R', 'R'], { ang: 0, open: 1, seed: 3, a: 1 - seg(t, 23.2, 23.7) });
    // a loop arrow: fertilises itself
    A_(span(t, 15.0, 18.6, 0.4, 0.4), () => {
      ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      const p = eout(seg(t, 15.0, 16.0));
      ctx.beginPath(); ctx.arc(W / 2 + 170, 230, 36, -2.6, -2.6 + 5.2 * p); ctx.stroke();
      if (p > 0.95) { const ax = W / 2 + 170 + Math.cos(2.6) * 36, ay = 230 + Math.sin(2.6) * 36; ctx.fillStyle = C.inkSoft; ctx.beginPath(); ctx.moveTo(ax - 2, ay + 10); ctx.lineTo(ax - 12, ay - 4); ctx.lineTo(ax + 6, ay - 4); ctx.closePath(); ctx.fill(); }
      label('self-fertilised', W / 2 + 170, 296, { size: 28, italic: true, color: C.inkSoft, weight: 500 });
    });
    // trays
    const tr = eout(seg(t, 16.6, 17.4));
    A_(tr, () => {
      const rowsR = Math.ceil(N_R / TRAY.cols);
      for (const [x0, rows, col] of [[TRAY.xR, rowsR, C.greenDeep], [TRAY.xW, rowsR, C.terra]]) {
        const w = TRAY.cols * TRAY.pitch + 12, h = rows * TRAY.pitch + 14;
        ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x0, TRAY.bottom - h); ctx.lineTo(x0, TRAY.bottom); ctx.lineTo(x0 + w, TRAY.bottom); ctx.lineTo(x0 + w, TRAY.bottom - h); ctx.stroke();
      }
    });
    // falling peas
    let landedR = 0, landedW = 0;
    for (const f of FALL) {
      const s0 = fallStart(f.i);
      if (t < s0) continue;
      const p = seg(t, s0, s0 + 0.55), e = eio(p);
      const [sx, sy] = slotXY(f.kind, f.slot);
      const fx = W / 2 + (f.i % 5 - 2) * 18, fy = 250;
      const x = lerp(fx, sx, e), yy = lerp(fy, sy, e) - Math.sin(Math.PI * e) * 60;
      pea(x, yy, TRAY.r, f.kind, f.i, seg(p, 0, 0.15));
      if (p >= 1) f.kind === 'R' ? landedR++ : landedW++;
    }
    // counters
    A_(tr, () => {
      const cR = Math.round(ROUND * (landedR / N_R)), cW = Math.round(WRINKLED * (landedW / N_W));
      const midR = TRAY.xR + (TRAY.cols * TRAY.pitch + 12) / 2, midW = TRAY.xW + (TRAY.cols * TRAY.pitch + 12) / 2;
      label(Kit.fmt(cR), midR, 662, { size: 50, weight: 700, color: C.greenDeep, family: TEXT });
      label(Kit.fmt(cW), midW, 662, { size: 50, weight: 700, color: C.terra, family: TEXT });
      label('round', midR, 712, { size: 30, italic: true, color: C.greenDeep, weight: 600 });
      label('wrinkled', midW, 712, { size: 30, italic: true, color: C.terra, weight: 600 });
      A_(seg(t, 18.9, 19.4) * (1 - seg(t, 23.4, 23.8)), () => label(`each pea drawn = ${PER} seeds`, midW, 404, { size: 26, italic: true, color: C.inkSoft, weight: 500 }));
    });
    // the ratio
    const rp = seg(t, 23.6, 24.3);
    A_(rp, () => {
      ctx.save(); ctx.translate(W / 2, 246); const s = 0.85 + 0.15 * back(rp); ctx.scale(s, s);
      rrect(-140, -54, 280, 108, 14); ctx.fillStyle = 'rgba(242,234,211,0.92)'; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke();
      label(`${RATIO} : 1`, 0, -8, { size: 58, weight: 700, color: C.ink, family: TEXT });
      label('round : wrinkled', 0, 34, { size: 24, italic: true, color: C.inkSoft, weight: 600 });
      ctx.restore();
    });
  });
}

// ---------- scene B: the Punnett square ----------
const PS = { x0: 312, y0: 330, cell: 150 };
const colX = (c) => PS.x0 + PS.cell * (c + 0.5), rowY = (r) => PS.y0 + PS.cell * (r + 0.5);
function parentCard(x, y, alleles, kind, a, title) {
  A_(a, () => {
    rrect(x - 130, y - 70, 260, 140, 14); ctx.fillStyle = 'rgba(255,250,235,0.6)'; ctx.fill();
    ctx.strokeStyle = 'rgba(44,40,24,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    pea(x - 66, y + 6, 30, kind, 4);
    token(alleles[0], x + 22, y + 6); token(alleles[1], x + 80, y + 6);
    label(title, x, y - 92, { size: 28, italic: true, color: C.inkSoft, weight: 600 });
  });
}
function sceneB(t) {
  // 28–43.3: parents RR × rr, then the first generation Rr
  const top = span(t, 27.9, 43.4, 0.5, 0.4);
  A_(top, () => {
    const p = eout(seg(t, 28.2, 29.0));
    parentCard(226, 290 + (1 - p) * 16, ['R', 'R'], 'R', p, 'round parent');
    parentCard(640, 290 + (1 - p) * 16, ['r', 'r'], 'W', eout(seg(t, 28.5, 29.3)), 'wrinkled parent');
    A_(seg(t, 29.6, 30.2) * (1 - seg(t, 33.0, 33.4)), () => {
      label('two copies each', W / 2, 410, { size: 30, italic: true, color: C.inkSoft, weight: 600 });
    });
    // the key: dominance
    A_(span(t, 33.1, 38.0, 0.4, 0.4), () => {
      const rows = [['R', 'R', 'R', 'round'], ['R', 'r', 'R', 'round'], ['r', 'r', 'W', 'wrinkled']];
      rows.forEach(([a1, a2, kind, word], i) => {
        const y = 470 + i * 84, q = eout(seg(t, 33.4 + i * 0.6, 34.0 + i * 0.6));
        A_(q, () => {
          token(a1, 300, y); token(a2, 358, y);
          label('→', 432, y, { size: 40, weight: 600, color: C.inkSoft });
          pea(506, y, 26, kind, 9 + i);
          label(word, 554, y, { size: 32, italic: true, align: 'left', color: kind === 'R' ? C.greenDeep : C.terra });
        });
      });
    });
    // first generation: one allele from each parent
    A_(span(t, 38.0, 43.4, 0.3, 0.4), () => {
      const m = eio(seg(t, 38.6, 39.8));
      token('R', lerp(306, 402, m), lerp(296, 520, m), 1, 1);
      token('r', lerp(720, 462, m), lerp(296, 520, m), 1, 1);
      A_(seg(t, 39.8, 40.4), () => {
        pea(W / 2 - 110, 520, 30, 'R', 6);
        label('first generation: all Rr, all round', W / 2, 610, { size: 32, italic: true, color: C.greenDeep });
      });
    });
  });
  // 43.4–53.2: the Punnett square of an Rr plant fertilising itself
  const sq = span(t, 43.4, 53.2, 0.5, 0.4);
  A_(sq, () => {
    const g = eout(seg(t, 43.5, 44.3));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    rrect(PS.x0, PS.y0, PS.cell * 2, PS.cell * 2, 10); ctx.globalAlpha *= g; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PS.x0 + PS.cell, PS.y0); ctx.lineTo(PS.x0 + PS.cell, PS.y0 + 2 * PS.cell);
    ctx.moveTo(PS.x0, PS.y0 + PS.cell); ctx.lineTo(PS.x0 + 2 * PS.cell, PS.y0 + PS.cell); ctx.stroke();
    label('pollen', PS.x0 + PS.cell, 214, { size: 30, italic: true, color: C.inkSoft, weight: 600 });
    ctx.save(); ctx.translate(PS.x0 - 108, PS.y0 + PS.cell); ctx.rotate(-Math.PI / 2);
    label('egg cell', 0, 0, { size: 30, italic: true, color: C.inkSoft, weight: 600 }); ctx.restore();
    const hp = (i) => eout(seg(t, 44.0 + i * 0.3, 44.5 + i * 0.3));
    token('R', colX(0), 276, hp(0)); token('r', colX(1), 276, hp(1));
    token('R', PS.x0 - 46, rowY(0), hp(2)); token('r', PS.x0 - 46, rowY(1), hp(3));
    A_(seg(t, 45.6, 46.2), () => {
      for (const c of [0, 1]) label('½', colX(c) + 46, 260, { size: 28, color: C.inkSoft, weight: 700 });
      for (const r of [0, 1]) label('½', PS.x0 - 46, rowY(r) + 46, { size: 28, color: C.inkSoft, weight: 700 });
    });
    // cells fill
    const pairs = [['R', 'R'], ['R', 'r'], ['r', 'R'], ['r', 'r']];
    pairs.forEach(([top, left], n) => {
      const c = n % 2, r = Math.floor(n / 2);
      const s0 = 48.6 + n * 0.55, m = eio(seg(t, s0, s0 + 0.6));
      const cx = colX(c), cy = rowY(r);
      const wr = top === 'r' && left === 'r';
      if (m > 0) {
        if (wr) A_(seg(t, s0 + 0.5, s0 + 0.9), () => { ctx.fillStyle = 'rgba(164,74,38,0.12)'; ctx.fillRect(PS.x0 + c * PS.cell + 4, PS.y0 + r * PS.cell + 4, PS.cell - 8, PS.cell - 8); });
        token(top, lerp(colX(c), cx - 26, m), lerp(276, cy - 34, m), 1, lerp(1, 0.8, m));
        token(left, lerp(PS.x0 - 46, cx + 26, m), lerp(rowY(r), cy - 34, m), 1, lerp(1, 0.8, m));
        pea(cx, cy + 32, 26, wr ? 'W' : 'R', 20 + n, seg(t, s0 + 0.4, s0 + 0.8));
      }
    });
    const res = seg(t, 51.0, 51.6);
    A_(res, () => {
      label('3', 718, 430, { size: 68, weight: 700, color: C.greenDeep, family: TEXT });
      label('round', 718, 478, { size: 28, italic: true, color: C.greenDeep });
      label(':', 718, 520, { size: 48, weight: 700, color: C.inkSoft });
      label('1', 718, 566, { size: 68, weight: 700, color: C.terra, family: TEXT });
      label('wrinkled', 718, 614, { size: 28, italic: true, color: C.terra });
    });
  });
}

// ---------- scene C ----------
function sceneC(t) {
  const p = eout(seg(t, 53.0, 53.8));
  A_(p * (1 - seg(t, 57.7, 58.2)), () => {
    ctx.save(); ctx.translate(W / 2, 360 + (1 - p) * 16); ctx.rotate(-0.025);
    rrect(-190, -170, 380, 300, 4); ctx.fillStyle = '#FBF5E4'; ctx.fill();
    ctx.strokeStyle = 'rgba(44,40,24,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeRect(-172, -152, 344, 264);
    label('Versuche', 0, -100, { size: 40, weight: 700 });
    label('über Pflanzenhybriden', 0, -56, { size: 34, weight: 600 });
    ctx.strokeStyle = 'rgba(44,40,24,0.4)'; ctx.beginPath(); ctx.moveTo(-60, -22); ctx.lineTo(60, -22); ctx.stroke();
    label('Gregor Mendel', 0, 14, { size: 30, italic: true, weight: 500 });
    label('Brno, 1866', 0, 60, { size: 30, weight: 600, color: C.inkSoft });
    ctx.restore();
    // timeline 1866 → 1900
    const tl = eio(seg(t, 54.6, 56.4));
    const x0 = 150, x1 = 714, y = 600;
    ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 3; ctx.setLineDash([4, 8]);
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, tl), y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.greenDeep; ctx.beginPath(); ctx.arc(x0, y, 9, 0, 6.29); ctx.fill();
    label('1866', x0, y + 42, { size: 32, weight: 700, color: C.greenDeep, family: TEXT });
    A_(seg(t, 55.0, 55.6), () => label('ignored', (x0 + x1) / 2, y - 30, { size: 30, italic: true, color: C.inkSoft, weight: 600 }));
    A_(seg(t, 56.2, 56.7), () => {
      ctx.fillStyle = C.terra; ctx.beginPath(); ctx.arc(x1, y, 9, 0, 6.29); ctx.fill();
      label('1900', x1, y + 42, { size: 32, weight: 700, color: C.terra, family: TEXT });
      label('rediscovered', x1 - 40, y + 82, { size: 26, italic: true, color: C.inkSoft, weight: 600 });
    });
  });
  const q = eout(seg(t, 58.0, 58.8));
  A_(q, () => {
    wash(W / 2, 350, 250, 150, 'rgba(169,196,110,0.35)', 1, 30);
    pod(W / 2, 300, 300, ['R', 'R', 'W', 'R', 'R', 'R'], { seed: 7 });
    label('3 : 1', W / 2, 440, { size: 88, weight: 700, color: C.ink, family: TEXT });
    label('Gregor Mendel, 1822–1884', W / 2, 530, { size: 36, weight: 600, color: C.greenDeep });
    label('friar of St Thomas’ Abbey, Brno', W / 2, 574, { size: 30, italic: true, weight: 500, color: C.inkSoft });
    font(500, 22);
    text('Counts: seed shape, from Mendel’s 1866 paper', W / 2, 666, { color: C.inkSoft, align: 'center', base: 'middle' });
    text('(English translation, Genetics, 2016)', W / 2, 694, { color: C.inkSoft, align: 'center', base: 'middle' });
    text('Source: Wikipedia, “Gregor Mendel”', W / 2, 728, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 46, lh: 58, weight: 600, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 835, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.green, '~': C.terra } });
  }
}

Kit.scene({
  width: W, height: H, duration: 62.6,
  fonts: [
    { family: SERIF, file: 'CormorantGaramond.woff2', weight: '300 700' },
    { family: TEXT, file: 'Alegreya.woff2', weight: '400 900' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintBackground();
    ctx.drawImage(bg, 0, 0);
    vine(t);
    header();
    const scenes = [[sceneA, T.A, 0.01], [sceneB, T.B], [sceneC, T.C, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      A_(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
