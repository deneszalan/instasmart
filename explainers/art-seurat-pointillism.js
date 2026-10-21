// Explainer for art-seurat-pointillism: Seurat's dots were meant to mix in the viewer's eye.
// Look: a painter's canvas. Off-white linen with a woven texture; dots in Seurat-like emerald
// greens, ochres, zinc yellow, cobalt blues, violets and a little vermilion; a white frame (Seurat
// first showed La Grande Jatte in one); a light humanist sans, Fira Sans (Light and Medium).
//
// Facts: Wikipedia, "A Sunday Afternoon on the Island of La Grande Jatte": painted May 1884 – March
// 1885 and October 1885 – May 1886; about 2 by 3 metres; held by the Art Institute of Chicago; first
// exhibited at the eighth Impressionist exhibition in May 1886; dots "unified optically in the human
// eye"; he believed it "would make the colors more brilliant". Wikipedia, "Georges Seurat": 207.5 ×
// 308.1 cm; "It took Seurat two years to complete"; the eye blends the colours optically; "Seurat
// called this language Chromoluminarism"; Chevreul: two colours close together look like another
// colour from a distance. Wikipedia, "Pointillism": the name was coined by critics in the late 1880s
// to ridicule it. Wikipedia, "Divisionism": "the luminosity of two pigments next to each other is just
// the average of their individual luminosities"; his colours don't truly mix additively, and
// simultaneous contrast "creates a mild shimmering appearance". Wikipedia, "Color mixing": dots too
// small for the eye to resolve "combine to a mixture with the average brightness".
// Computed here: the far-away colour of the red and yellow dots (their average in linear light) and
// the brightness of each (relative luminance), and the size diagram from 207.5 × 308.1 cm.
// The riverside scene is my own, not a copy of the painting, and is labelled as such.
//
// Scene plan (49.5 s). Captions centred at y = 836 on the linen band; pictures sit above y = 770.
//  A  0.0– 4.5  Hook: a close-up of large dots in a window on the linen.
//  B  4.4–14.4  The camera pulls back (log zoom) until ~15,500 dots merge into a framed riverside scene.
//  C 14.5–32.2  Two dots, two colours: red and yellow dots shrink until they read as orange, beside
//               the computed average; then a brightness scale puts the mix exactly halfway, and the
//               dots come back to mid size, where they shimmer.
//  D 32.3–42.2  La Grande Jatte: a size diagram (painting vs a 1.7 m person), then a timeline of
//               the two working spells and the first showing, and the museum.
//  E 42.3–49.5  Payoff on the riverside scene: the name pointillism, and Seurat's own word.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  linen: '#EEE7D8', ground: '#F4F0E6', ink: '#2A2836', soft: 'rgba(42,40,54,0.66)', faint: 'rgba(42,40,54,0.28)',
  red: '#B4361C', green: '#2E6B35', cobalt: '#2C559E', violet: '#5E3F8F', orange: '#A4520E', ochre: '#7F5E0C',
  frame: '#FBF9F3', frameEdge: '#D8D0BF',
};
const F = 'FiraSans';

let k, ctx;
const font = (weight, size) => k.font(weight, size, F);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

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

// ---------- colour maths ----------
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const lum = (h) => { const [r, g, b] = hex(h).map(toLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
/** The colour two dots make from far away: the average of their light. */
function averageColour(a, b) {
  const la = hex(a).map(toLin), lb = hex(b).map(toLin);
  return '#' + la.map((v, i) => Math.round(clamp(toSrgb((v + lb[i]) / 2)) * 255).toString(16).padStart(2, '0')).join('');
}
const DOT_RED = '#E1452E', DOT_YELLOW = '#F1D23C';
const MIX = averageColour(DOT_RED, DOT_YELLOW);
const Y = { red: lum(DOT_RED), yellow: lum(DOT_YELLOW), mix: lum(MIX) };

// ---------- timeline ----------
const T = { A: [0, 4.6], B: [4.4, 14.6], C: [14.5, 32.4], D: [32.3, 42.4], E: [42.3, 49.5] };
const CUES = [
  [0.5, 4.3, 'Up close, it’s only *dots* of unmixed colour.'],
  [4.4, 8.9, 'Step back, and they melt into ~grass~, ^water^ and %sky%.'],
  [9.0, 14.4, 'Georges Seurat painted this way: colours mix in your *eye*, not on the palette.'],
  [14.5, 18.2, 'Put *red* and $yellow$ dots side by side…'],
  [18.3, 22.4, '…step back, and they read as one colour: &orange&.'],
  [22.5, 26.6, 'Seurat believed this would make his colours more ^brilliant^.'],
  [26.7, 32.2, 'In practice, side-by-side dots only *average* their light, and often seem to ~shimmer~.'],
  [32.3, 37.0, 'His %La Grande Jatte% (1884–86) is about 2 by 3 metres.'],
  [37.1, 42.2, 'It took him two years. It hangs in the Art Institute of Chicago.'],
  [42.3, 47.6, 'Critics coined *pointillism* to mock it. Seurat called his method ^chromoluminarism^.'],
];

// ---------- the riverside scene, in painting pixels (720 × 540) ----------
const PW = 720, PH = 540, PITCH = 5.4;
const PAL = {
  sky: [['#A9C8E8', 4], ['#F3EEDC', 3], ['#F0D7A2', 1.5], ['#E9BBA9', 1], ['#C9D9E6', 2]],
  far: [['#3F6E46', 3], ['#41589E', 2.5], ['#6E5296', 1.5], ['#7FA35A', 1]],
  farbank: [['#C9B46A', 2], ['#8FB25B', 2], ['#E7D9A1', 1]],
  water: [['#2E5DAE', 4], ['#6FA2D8', 3], ['#F1EEE2', 1.2], ['#3E8C78', 1.2], ['#7E66A8', 0.8]],
  sun: [['#56A04A', 4], ['#A8C64B', 3], ['#E8D24A', 2], ['#D79F3C', 1], ['#F0E6B0', 0.6]],
  shade: [['#2F6B45', 4], ['#3A54A2', 2.5], ['#6A4B94', 2], ['#4E8F55', 1.5], ['#C79A3A', 0.4]],
  crown: [['#2E5F3C', 4], ['#3D529C', 2], ['#6A4C90', 1.5], ['#5E9A48', 1.5], ['#A9C24C', 0.6]],
  trunk: [['#5B3F7A', 3], ['#8A5A2E', 2], ['#3A4A8C', 1.5], ['#C08A3A', 0.6]],
  sail: [['#F6F2E6', 4], ['#F1DFA3', 2], ['#EBC48E', 1], ['#C7D4E6', 1]],
  hull: [['#D2452C', 4], ['#E87A3A', 2], ['#7E3A7A', 1]],
  mast: [['#4A3A6A', 1]],
};
const inTri = (x, y, a, b, c) => {
  const s = (p, q, r) => (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1]);
  const d1 = s([x, y], a, b), d2 = s([x, y], b, c), d3 = s([x, y], c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};
const inEll = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
function region(x, y) {
  if (inEll(x, y, 120, 70, 150, 150) || inEll(x, y, 250, 30, 115, 100) || inEll(x, y, 50, 210, 90, 90)) return 'crown';
  if (y > 150 && y < 430 && x > 128 + 0.06 * (y - 150) && x < 160 + 0.09 * (y - 150)) return 'trunk';
  if (x > 497 && x < 502 && y > 138 && y < 264) return 'mast';
  if (inTri(x, y, [502, 148], [502, 262], [566, 262]) || inTri(x, y, [496, 170], [496, 262], [452, 262])) return 'sail';
  if (y > 262 && y < 278 && x > 446 + (y - 262) * 0.8 && x < 578 - (y - 262) * 0.8) return 'hull';
  if (y > 288 && y < 297 && x > 226 + (y - 288) && x < 300 - (y - 288)) return 'hull';
  if (y < 150 + 10 * Math.sin(x * 0.03) + 6 * Math.sin(x * 0.11)) return 'sky';
  if (y < 204 + 4 * Math.sin(x * 0.07)) return 'far';
  if (y < 212) return 'farbank';
  if (y < 340 - 0.12 * x + 8 * Math.sin(x * 0.02)) return 'water';
  if (inEll(x, y, 270, 452, 270, 82) || inEll(x, y, 650, 528, 210, 46)) return 'shade';
  return 'sun';
}
const DOTS = [];
{
  const r = rng(7);
  const rowH = PITCH * 0.866;
  for (let j = 0; j * rowH < PH + PITCH; j++) {
    for (let i = 0; i * PITCH < PW + PITCH; i++) {
      const x = i * PITCH + (j % 2 ? PITCH / 2 : 0) + (r() - 0.5) * PITCH * 0.4;
      const y = j * rowH + (r() - 0.5) * PITCH * 0.4;
      if (x < -1 || y < -1 || x > PW + 1 || y > PH + 1) { r(); r(); r(); continue; }
      const pal = PAL[region(clamp(x, 0, PW), clamp(y, 0, PH))];
      let tot = 0; for (const [, w] of pal) tot += w;
      let pick = r() * tot, color = pal[0][0];
      for (const [c, w] of pal) { if ((pick -= w) <= 0) { color = c; break; } }
      DOTS.push({ x, y, rx: PITCH * (0.56 + r() * 0.12), ry: PITCH * (0.44 + r() * 0.1), rot: r() * Math.PI, color });
    }
  }
}

// ---------- textures, painted once ----------
const OS = 3;           // the scene bitmap's pixels per painting pixel
let linenBg = null, sceneBmp = null, paleDots = null;
function paintOnce() {
  // linen: a soft weave and gentle mottling (kept low in fine detail, so the clip stays small)
  linenBg = document.createElement('canvas'); linenBg.width = W; linenBg.height = H;
  const g = linenBg.getContext('2d');
  g.fillStyle = C.linen; g.fillRect(0, 0, W, H);
  const r = rng(3);
  for (let i = 0; i < 70; i++) {
    const x = r() * W, y = r() * H, rad = 80 + r() * 160;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    const light = r() < 0.5;
    gr.addColorStop(0, light ? 'rgba(255,253,245,0.07)' : 'rgba(150,125,85,0.035)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
  }
  const weave = document.createElement('canvas'); weave.width = W; weave.height = H;
  const wv = weave.getContext('2d');
  for (let y = 0; y < H; y += 6) { wv.fillStyle = `rgba(120,100,70,${0.03 + r() * 0.02})`; wv.fillRect(0, y, W, 3); }
  for (let x = 0; x < W; x += 6) { wv.fillStyle = `rgba(120,100,70,${0.022 + r() * 0.018})`; wv.fillRect(x, 0, 3, H); }
  g.filter = 'blur(1.2px)'; g.drawImage(weave, 0, 0); g.filter = 'none';
  const vg = g.createRadialGradient(W / 2, H * 0.42, 300, W / 2, H * 0.5, 800);
  vg.addColorStop(0, 'rgba(90,70,40,0)'); vg.addColorStop(1, 'rgba(90,70,40,0.16)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);

  // the riverside scene, dot by dot
  sceneBmp = document.createElement('canvas'); sceneBmp.width = PW * OS; sceneBmp.height = PH * OS;
  const s = sceneBmp.getContext('2d');
  s.fillStyle = C.ground; s.fillRect(0, 0, sceneBmp.width, sceneBmp.height);
  s.scale(OS, OS);
  for (const d of DOTS) { s.fillStyle = d.color; s.beginPath(); s.ellipse(d.x, d.y, d.rx, d.ry, d.rot, 0, TAU); s.fill(); }

  // pale dots that fill the size diagram (not the painting itself)
  paleDots = document.createElement('canvas'); paleDots.width = 524; paleDots.height = 353;
  const p = paleDots.getContext('2d');
  const r2 = rng(19), cols = ['#56A04A', '#3A54A2', '#6A4B94', '#E8D24A', '#D79F3C', '#6FA2D8', '#D2452C'];
  for (let i = 0; i < 2600; i++) { p.fillStyle = cols[Math.floor(r2() * cols.length)]; p.globalAlpha = 0.35 + r2() * 0.3; p.beginPath(); p.arc(r2() * 524, r2() * 353, 2.4 + r2() * 1.6, 0, TAU); p.fill(); }
}

// ---------- the zoom ----------
const VIEW = { x: 36, y: 136, w: 792, h: 604, r: 18 };
const VC = { x: 432, y: 438 };            // screen centre of the window
const S0 = 14, S1 = 0.86;                 // screen px per painting px: close-up, whole scene
const FOCUS0 = { x: 362, y: 300 }, FOCUS1 = { x: PW / 2, y: PH / 2 };
function zoomAt(t) {
  const u = eio(seg(t, 4.6, 11.4));
  const s = Math.exp(lerp(Math.log(S0 * (1 + 0.06 * (1 - seg(t, 0, 4.6)))), Math.log(S1), u));
  // keep the motion natural: the focus moves in proportion to 1/s
  const w = (1 / s - 1 / S0) / (1 / S1 - 1 / S0);
  return { s, x: lerp(FOCUS0.x, FOCUS1.x, clamp(w)), y: lerp(FOCUS0.y, FOCUS1.y, clamp(w)) };
}

function drawPainting(z, blur = 0) {
  const ox = VC.x - z.x * z.s, oy = VC.y - z.y * z.s;   // screen position of the painting's corner
  const pw = PW * z.s, ph = PH * z.s;
  // white frame once it comes into view
  const fr = Math.max(10, 16 * z.s);
  ctx.save();
  ctx.shadowColor = 'rgba(70,50,20,0.22)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.fillStyle = C.frame; ctx.fillRect(ox - fr, oy - fr, pw + 2 * fr, ph + 2 * fr);
  ctx.restore();
  ctx.strokeStyle = C.frameEdge; ctx.lineWidth = 1.5; ctx.strokeRect(ox - fr, oy - fr, pw + 2 * fr, ph + 2 * fr);
  ctx.strokeRect(ox - 1, oy - 1, pw + 2, ph + 2);
  if (z.s > OS) {
    // close up: draw the visible dots one by one
    ctx.save(); ctx.beginPath(); ctx.rect(ox, oy, pw, ph); ctx.clip();
    ctx.fillStyle = C.ground; ctx.fillRect(ox, oy, pw, ph);
    const x0 = (VIEW.x - ox) / z.s - PITCH, x1 = (VIEW.x + VIEW.w - ox) / z.s + PITCH;
    const y0 = (VIEW.y - oy) / z.s - PITCH, y1 = (VIEW.y + VIEW.h - oy) / z.s + PITCH;
    ctx.translate(ox, oy); ctx.scale(z.s, z.s);
    for (const d of DOTS) {
      if (d.x < x0 || d.x > x1 || d.y < y0 || d.y > y1) continue;
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.ellipse(d.x, d.y, d.rx, d.ry, d.rot, 0, TAU); ctx.fill();
    }
    ctx.restore();
  } else {
    ctx.save();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    if (blur > 0.05) ctx.filter = `blur(${blur.toFixed(2)}px)`;
    ctx.drawImage(sceneBmp, ox, oy, pw, ph);
    ctx.restore();
  }
}

function windowFrame(t, a) {
  if (a <= 0) return;
  withAlpha(a, () => {
    k.rrect(VIEW.x, VIEW.y, VIEW.w, VIEW.h, VIEW.r);
    ctx.strokeStyle = 'rgba(120,100,70,0.45)'; ctx.lineWidth = 2; ctx.stroke();
  });
}

function sceneAB(t) {
  const z = zoomAt(t);
  ctx.save();
  k.rrect(VIEW.x, VIEW.y, VIEW.w, VIEW.h, VIEW.r); ctx.clip();
  drawPainting(z, 1.1 * clamp((2.8 - z.s) / (2.8 - S1)));
  ctx.restore();
  windowFrame(t, 1 - seg(t, 10.5, 12.5));
}

// ---------- C: two colours side by side ----------
const SQ = { y: 200, size: 340, left: 62, right: 462 };
function dotPatch(x, y, size, p, seed, t, shimmer = 0) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, size, size); ctx.clip();
  ctx.fillStyle = C.ground; ctx.fillRect(x, y, size, size);
  const r = rng(seed), rowH = p * 0.866;
  for (let j = 0; j * rowH < size + p; j++) {
    for (let i = 0; i * p < size + p; i++) {
      const jx = (r() - 0.5) * p * 0.3, jy = (r() - 0.5) * p * 0.3, red = r() < 0.5, rot = r() * Math.PI;
      const dx = x + i * p + (j % 2 ? p / 2 : 0) + jx, dy = y + j * rowH + jy;
      const tw = shimmer > 0 ? 1 + shimmer * 0.12 * Math.sin(t * 5 + i * 1.7 + j * 2.3) : 1;
      ctx.fillStyle = red ? DOT_RED : DOT_YELLOW;
      ctx.beginPath(); ctx.ellipse(dx, dy, p * 0.64 * tw, p * 0.55 * tw, rot, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}
function squareLabel(s, x, y, a) {
  withAlpha(a, () => { font(500, 24); text(s, x, y, { color: C.soft, align: 'center', spacing: '3px' }); });
}
function sceneC(t) {
  const enter = eout(seg(t, 14.5, 15.2));
  // the dot pitch: big, then "stepping back", then back to a middle distance
  const shrink = eio(seg(t, 18.4, 21.2));
  const p = Math.exp(lerp(Math.log(48), Math.log(2.4), shrink));
  // as the dots get too small to tell apart, the patch settles into their average colour
  const flat = (t < 24 ? clamp((9 - p) / 6) : 1) * 0.92;
  const mid = eio(seg(t, 26.9, 27.5));   // then a middle distance: dots of 13 px
  const lx = lerp((W - SQ.size) / 2, SQ.left, eio(seg(t, 20.2, 21.0))), rx = SQ.right;
  withAlpha(enter, () => {
    ctx.save(); ctx.translate(0, (1 - enter) * 20);
    ctx.shadowColor = 'rgba(70,50,20,0.18)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
    ctx.fillStyle = C.frame; ctx.fillRect(lx - 10, SQ.y - 10, SQ.size + 20, SQ.size + 20);
    ctx.restore();
    ctx.save(); ctx.translate(0, (1 - enter) * 20);
    if (mid < 1) {
      dotPatch(lx, SQ.y, SQ.size, p, 23, t);
      withAlpha(flat, () => { ctx.fillStyle = MIX; ctx.fillRect(lx, SQ.y, SQ.size, SQ.size); });
    }
    if (mid > 0) withAlpha(mid, () => dotPatch(lx, SQ.y, SQ.size, 13, 23, t));
    ctx.restore();
    const dip = (at) => 1 - span(t, at - 0.25, at + 0.25, 0.25, 0.25);
    squareLabel(t < 18.4 ? 'UP CLOSE' : t < 27 ? 'STEPPING BACK' : 'MIDDLE DISTANCE', lx + SQ.size / 2, SQ.y - 28, Math.min(dip(18.4), dip(27)));
  });
  // the computed far-away colour
  const far = eout(seg(t, 20.6, 21.3));
  withAlpha(far, () => {
    ctx.save(); ctx.translate((1 - far) * 30, 0);
    ctx.shadowColor = 'rgba(70,50,20,0.18)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
    ctx.fillStyle = C.frame; ctx.fillRect(rx - 10, SQ.y - 10, SQ.size + 20, SQ.size + 20);
    ctx.restore();
    ctx.save(); ctx.translate((1 - far) * 30, 0);
    ctx.fillStyle = MIX; ctx.fillRect(rx, SQ.y, SQ.size, SQ.size);
    // Seurat's hope: more brilliant colour
    const hope = span(t, 22.7, 26.7, 0.5, 0.5);
    if (hope > 0) withAlpha(hope, () => {
      const cx = rx + SQ.size / 2, cy = SQ.y + SQ.size / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + t * 0.4, r0 = 46 + 6 * Math.sin(t * 3 + i), r1 = r0 + 34;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke();
      }
      font(500, 44); text('?', cx, cy + 2, { color: '#FFFFFF', align: 'center', base: 'middle' });
    });
    ctx.restore();
    squareLabel('FROM AFAR', rx + SQ.size / 2, SQ.y - 28, 1);
  });
  // the brightness scale: the mix lands exactly halfway
  const sc = eout(seg(t, 27.3, 28.0));
  withAlpha(sc, () => {
    const x0 = 110, x1 = 754, y = 622;
    const X = (v) => lerp(x0, x1, v);
    font(500, 22); text('BRIGHTNESS', x0, y - 34, { color: C.soft, spacing: '3px' });
    text('relative luminance', x1, y - 34, { color: C.faint, align: 'right' });
    const gr = ctx.createLinearGradient(x0, 0, x1, 0);
    gr.addColorStop(0, '#3A3346'); gr.addColorStop(1, '#FFFDF6');
    k.rrect(x0, y - 7, x1 - x0, 14, 7); ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = 'rgba(42,40,54,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    const mark = (v, col, lab, a, below = true) => withAlpha(a, () => {
      ctx.fillStyle = col; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(X(v), y, 14, 0, TAU); ctx.fill(); ctx.stroke();
      font(500, 23); text(lab, X(v), below ? y + 46 : y - 30, { align: 'center' });
    });
    mark(Y.red, DOT_RED, 'red', 1);
    mark(Y.yellow, DOT_YELLOW, 'yellow', 1);
    const ma = eout(seg(t, 28.2, 28.8));
    // the mix slides in from the "hoped for" bright end to where it really sits
    const v = lerp(0.9, Y.mix, eio(seg(t, 28.2, 29.6)));
    mark(v, MIX, 'the mix', ma);
    withAlpha(seg(t, 29.6, 30.0), () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([4, 5]);
      for (const vv of [Y.red, Y.yellow]) { ctx.beginPath(); ctx.moveTo(X(vv), y + 70); ctx.lineTo(X(vv), y + 80); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(X(Y.red), y + 76); ctx.lineTo(X(Y.yellow), y + 76); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(Y.mix), y + 70); ctx.lineTo(X(Y.mix), y + 82); ctx.stroke();
      font(300, 22); text('exactly halfway', X(Y.mix), y + 104, { color: C.soft, align: 'center' });
    });
  });
}

// ---------- D: La Grande Jatte, in numbers ----------
const CM = 246 / 207.5;   // px per cm in the size diagram
function sizeDiagram(t, a) {
  withAlpha(a, () => {
    const w = 308.1 * CM, h = 207.5 * CM, x = 176, floor = 470, y = floor - h;
    font(500, 26); text('A Sunday Afternoon on the Island of La Grande Jatte', 432, 166, { align: 'center' });
    font(300, 22); text('Georges Seurat · 1884–86 · drawn to scale', 432, 198, { color: C.soft, align: 'center' });
    ctx.save(); ctx.shadowColor = 'rgba(70,50,20,0.2)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
    ctx.fillStyle = C.frame; ctx.fillRect(x - 8, y - 8, w + 16, h + 16); ctx.restore();
    ctx.fillStyle = C.ground; ctx.fillRect(x, y, w, h);
    withAlpha(0.55, () => ctx.drawImage(paleDots, x, y, w, h));
    // a 1.7 m person for scale
    const ph = 170 * CM, px = 650;
    ctx.fillStyle = C.violet;
    ctx.beginPath(); ctx.arc(px, floor - ph + 15, 15, 0, TAU); ctx.fill();
    k.rrect(px - 21, floor - ph + 34, 42, ph * 0.46, 18); ctx.fill();
    k.rrect(px - 17, floor - ph * 0.56, 15, ph * 0.56, 7); ctx.fill();
    k.rrect(px + 2, floor - ph * 0.56, 15, ph * 0.56, 7); ctx.fill();
    font(300, 22); text('1.7 m', px, floor + 34, { color: C.soft, align: 'center' });
    // floor and dimension lines
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(110, floor + 8); ctx.lineTo(754, floor + 8); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    const dim = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
    dim(x, floor + 34, x + w, floor + 34); dim(x, floor + 24, x, floor + 44); dim(x + w, floor + 24, x + w, floor + 44);
    font(500, 26); text('3.08 m', x + w / 2, floor + 70, { align: 'center' });
    dim(x - 30, y, x - 30, floor); dim(x - 40, y, x - 20, y); dim(x - 40, floor, x - 20, floor);
    ctx.save(); ctx.translate(x - 46, y + h / 2); ctx.rotate(-Math.PI / 2); font(500, 26); text('2.08 m', 0, 0, { align: 'center' }); ctx.restore();
  });
}
function workTimeline(t, a) {
  withAlpha(a, () => {
    const x0 = 112, x1 = 752, y = 622, months = 36;
    const X = (m) => lerp(x0, x1, m / months);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    for (let yr = 0; yr <= 3; yr++) {
      ctx.beginPath(); ctx.moveTo(X(yr * 12), y - 8); ctx.lineTo(X(yr * 12), y + 8); ctx.stroke();
      if (yr < 3) { font(500, 24); text(String(1884 + yr), X(yr * 12 + 6), y + 40, { color: C.soft, align: 'center' }); }
    }
    // the two working spells: May 1884 – March 1885 and October 1885 – May 1886
    const spells = [[4, 15], [21, 29]];
    spells.forEach(([m0, m1], i) => {
      const g = eio(seg(t, 38.2 + i * 0.7, 39.0 + i * 0.7));
      k.rrect(X(m0), y - 30, (X(m1) - X(m0)) * g, 22, 6); ctx.fillStyle = i ? C.violet : C.cobalt; ctx.fill();
    });
    withAlpha(seg(t, 39.6, 40.0), () => { font(300, 22); text('painting', X(4), y - 44, { color: C.soft }); });
    // first shown: the eighth Impressionist exhibition, 15 May 1886
    const sh = eout(seg(t, 40.0, 40.4));
    withAlpha(sh, () => {
      const xm = X(28.5);
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(xm, y - 34); ctx.lineTo(xm - 9, y - 50); ctx.lineTo(xm + 9, y - 50); ctx.closePath(); ctx.fill();
      font(500, 22); text('first shown, May 1886', xm + 14, y - 62, { color: C.red, align: 'center' });
    });
    // where it hangs
    withAlpha(eout(seg(t, 40.6, 41.1)), () => {
      const cx = 432, cy = 722;
      font(500, 26); const s = 'Art Institute of Chicago', w = ctx.measureText(s).width;
      const px = cx - w / 2 - 20;
      ctx.fillStyle = C.red;
      ctx.beginPath(); ctx.arc(px, cy - 8, 10, Math.PI, 0); ctx.lineTo(px, cy + 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.frame; ctx.beginPath(); ctx.arc(px, cy - 8, 4, 0, TAU); ctx.fill();
      text(s, px + 18, cy, { base: 'middle' });
    });
  });
}
function sceneD(t) {
  sizeDiagram(t, eout(seg(t, 32.3, 33.0)));
  workTimeline(t, eout(seg(t, 37.3, 37.9)));
}

// ---------- E: payoff ----------
function sceneE(t) {
  drawPainting({ s: S1, x: PW / 2, y: PH / 2 }, 1.1);
  withAlpha(eout(seg(t, 47.7, 48.3)), () => {
    font(300, 22); text('Sources: Wikipedia, “Pointillism”, “Divisionism”, “Georges Seurat”', W / 2, 912, { color: C.soft, align: 'center' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 54, weight: 500, maxW: 760 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~^%$&]/g, '')).width);
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
    k.captions(t, [cue], {
      x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: F, ink: C.ink,
      marks: { '*': C.red, '~': C.green, '^': C.cobalt, '%': C.violet, '$': C.ochre, '&': C.orange },
    });
  }
}

function header(t) {
  font(500, 22); text('SEURAT · POINTILLISM', 56, 78, { color: C.ink, spacing: '3px' });
  const note = Math.max(span(t, 0.2, 14.4, 0.4, 0.35), span(t, 42.3, 49.6, 0.4, 0));
  withAlpha(note, () => { font(300, 22); text('An imagined scene, painted in dots for this clip', 56, 108, { color: C.soft }); });
}

Kit.scene({
  width: W, height: H, duration: 49.5,
  fonts: [
    { family: F, file: 'FiraSans-Light.woff2', weight: '300' },
    { family: F, file: 'FiraSans-Medium.woff2', weight: '500' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!sceneBmp) paintOnce();
    ctx.drawImage(linenBg, 0, 0);
    const scenes = [[sceneAB, [0, T.B[1]], 0, 0.35], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.4, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    header(t);
    captions(t);
  },
});
