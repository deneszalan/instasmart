// "What 1956 left behind" („Amit 1956 maga után hagyott”), the long film of Hungary 1956's section Consequences, 16:9.
// The same scene plays the English and the Hungarian version: window.TL is timeline.js or timeline-fr.js, and in
// Hungarian kit.js swaps every whole string drawn for its labels-fr.json entry and Kit.fmt writes 22 000.
// Series look: deep ink with a faint paper grain, Archivo for titles and cards, Alegreya Sans for everything else, the
// 1956 flag with the hole as the emblem, a thin tricolour rule under chapter titles, Hungary from the series' outline.
// This film's accent is pale teal; its motif is absence drawn as a dashed teal outline (the empty coffin, the unmarked
// graves, the people who left, the forbidden word), filled in at the end, when the names come back. A thin ribbon of
// years, 1956 to 1991, runs along the bottom with a teal cursor at the time being told.
// No realistic people: crowds are quiet points, people simple figures; tanks and armoured cars simple shapes; no
// gallows, no falling figures, no explosion (the Andau bridge simply becomes an outline).
const W = 1920, H = 1080;
const { seg, lerp, span, fmt, clamp } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const TAU = Math.PI * 2, RAD = Math.PI / 180;

const C = {
  bg0: '#111418', bg1: '#181c22', ink: '#ece6d6', soft: 'rgba(236,230,214,0.74)', dim: 'rgba(236,230,214,0.5)',
  faint: 'rgba(236,230,214,0.15)', teal: '#6fb8b0', tealSoft: 'rgba(111,184,176,0.4)', tealFaint: 'rgba(111,184,176,0.16)',
  red: '#c63a32', white: '#ece6d6', green: '#3f7f52', steel: '#6c7480', steelDark: '#454c56', stone: '#9a9890',
  candle: '#e4b45e', earth: '#463e35', grass: '#5d7d61', wood: '#7a5a3e', woodDark: '#4a3527', paper: '#e4ddcb',
  paperInk: '#2b2722', land: '#1d232b', landLine: 'rgba(236,230,214,0.55)', water: '#3d5f6e', card: 'rgba(15,18,22,0.9)',
};
const HEAD = 'Archivo', TEXT = 'Alegreya Sans';

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
function txt(str, x, y, { size = 36, weight = 500, family = TEXT, color = C.ink, align = 'left', spacing = '0px', base = 'middle' } = {}) {
  k.font(weight, size, family);
  k.text(str, x, y, { color, align, base, spacing });
}
function textW(str, { size = 36, weight = 500, family = TEXT, spacing = '0px' } = {}) {
  k.font(weight, size, family); ctx.letterSpacing = spacing;
  const w = ctx.measureText(str).width; ctx.letterSpacing = '0px'; return w;
}
/** The largest size up to `size` at which str fits in maxW (as drawn, so in Hungarian too). */
function fit(str, maxW, size, o = {}) {
  let z = size; while (z > 32 && textW(str, { ...o, size: z }) > maxW) z -= 2;
  if (textW(str, { ...o, size: z }) > maxW + 1) (window.__tight ??= new Set()).add(`${Kit.tr(str)} (${Math.round(textW(str, { ...o, size: z }))} > ${maxW})`);
  return z;
}
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** A wrapped paragraph, left-aligned or centred: the whole string is translated first, then broken into lines. */
function para(str, x, y, maxW, { size = 36, weight = 500, family = TEXT, color = C.ink, align = 'left', lh = size * 1.24, valign = 'top', dry = false } = {}) {
  const full = Kit.tr(str), TRL = window.TR?.labels;
  const keep = (piece) => { if (TRL && !(piece in TRL)) TRL[piece] = piece; return piece; };
  k.font(weight, size, family);
  const lines = []; let cur = '';
  for (const w of full.split(' ')) {
    const test = cur ? `${cur} ${w}` : w;
    if (cur && ctx.measureText(keep(test)).width > maxW) { lines.push(cur); cur = w; } else cur = test;
  }
  lines.push(cur);
  if (dry) return lines.length;
  const y0 = valign === 'middle' ? y - ((lines.length - 1) * lh) / 2 : y;
  lines.forEach((ln, i) => txt(keep(ln), x, y0 + i * lh, { size, weight, family, color, align }));
  return lines.length;
}
const dec = (x, d = 1) => x.toLocaleString(window.TR?.locale ?? 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
function rrectFill(x, y, w, h, r, fill, line = null, lw = 2) {
  k.rrect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (line) { ctx.strokeStyle = line; ctx.lineWidth = lw; ctx.stroke(); }
}
function chip(str, cx, cy, { color = C.ink, size = 36, weight = 700, bg = C.card, line = null, pad = 26, a = 1 } = {}) {
  const w = textW(str, { size, weight });
  A(a, () => {
    rrectFill(cx - w / 2 - pad, cy - size * 0.86, w + pad * 2, size * 1.72, size * 0.86, bg, line ?? color, 3);
    txt(str, cx, cy + 1, { size, weight, color, align: 'center' });
  });
}
function dashed(fn, { color = C.teal, w = 3, dash = [12, 9], off = 0 } = {}) {
  ctx.save(); ctx.setLineDash(dash); ctx.lineDashOffset = off; ctx.strokeStyle = color; ctx.lineWidth = w; fn(); ctx.stroke(); ctx.restore();
}
function arrowHead(x, y, ang, col, size = 20) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(size * 0.55, 0); ctx.lineTo(-size * 0.55, -size * 0.5); ctx.lineTo(-size * 0.3, 0); ctx.lineTo(-size * 0.55, size * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/** A quadratic arrow from (x0,y0) to (x1,y1) bending through (cx,cy), drawn to fraction p. */
function arrow(x0, y0, cx, cy, x1, y1, p, col, { w = 6, dash = null, head = 22 } = {}) {
  if (p <= 0) return;
  const pt = (u) => [(1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y1];
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); for (let i = 0; i <= 40; i++) { const [x, y] = pt((i / 40) * p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
  if (head) { const [xa, ya] = pt(Math.max(0, p - 0.02)), [xb, yb] = pt(p); arrowHead(xb, yb, Math.atan2(yb - ya, xb - xa), col, head); }
}
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- the series emblem and rule ----------
/** The flag of 1956: red, white, green, with a round hole in the white band. A gentle wave if amp > 0. */
function flag(x0, y0, w, h, { t = 0, amp = 0, hole = true } = {}) {
  const wave = (x) => amp * Math.sin((x - x0) / w * 5.2 - t * 2.2) * ((x - x0) / w);
  const bands = [C.red, C.white, C.green];
  for (let b = 0; b < 3; b++) {
    ctx.beginPath();
    const n = amp ? 24 : 1;
    for (let i = 0; i <= n; i++) { const x = x0 + (w * i) / n; const y = y0 + (h * b) / 3 + wave(x); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    for (let i = n; i >= 0; i--) { const x = x0 + (w * i) / n; ctx.lineTo(x, y0 + (h * (b + 1)) / 3 + wave(x) + (b < 2 ? 0.6 : 0)); }
    ctx.closePath();
    if (b === 1 && hole) { const hx = x0 + w / 2; ctx.moveTo(hx + h * 0.15, y0 + h / 2 + wave(hx)); ctx.arc(hx, y0 + h / 2 + wave(hx), h * 0.15, 0, TAU, true); }
    ctx.fillStyle = bands[b]; ctx.fill('evenodd');
  }
}
function emblem(cx, cy, w = 120, a = 1) {
  A(a, () => {
    const h = w * 0.62;
    ctx.fillStyle = C.stone; ctx.fillRect(cx - w / 2 - 8, cy - h / 2 - 6, 4, h + 46); // the staff
    flag(cx - w / 2 - 4, cy - h / 2, w, h);
  });
}
function rule(cx, y, w, a = 1) {
  A(a, () => { [C.red, C.white, C.green].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(cx - w / 2 + (i * w) / 3, y - 3, w / 3, 6); }); });
}

// ---------- the background, painted once ----------
let BG = null;
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const g = BG.getContext('2d');
  const gr = g.createRadialGradient(W * 0.5, H * 0.42, 120, W * 0.5, H * 0.5, 1250);
  gr.addColorStop(0, C.bg1); gr.addColorStop(1, C.bg0);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  let seed = 11; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(236,230,214,${(0.012 + r() * 0.03).toFixed(3)})`; g.fillRect(r() * W, r() * H, 1 + r() * 1.4, 1 + r() * 1.4); }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(0,0,0,${(0.04 + r() * 0.06).toFixed(3)})`; g.fillRect(r() * W, r() * H, 1.5, 1.5); }
  g.strokeStyle = 'rgba(236,230,214,0.025)'; g.lineWidth = 1;
  for (let i = 0; i < 160; i++) { const x = r() * W, y = r() * H, a = r() * TAU, l = 20 + r() * 70; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 6, y + Math.sin(a) * l * 0.5 - 6, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  const vg = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------- the ribbon of years ----------
const RIB = { x0: 330, x1: 1590, y: 962, y0: 1956, y1: 1991 };
const rx = (yr) => lerp(RIB.x0, RIB.x1, (clamp(yr, RIB.y0, RIB.y1) - RIB.y0) / (RIB.y1 - RIB.y0));
/** The year at time t, moving between keyed points [time, year]. */
function yearAt(t, pts) {
  // from each point's time, the cursor moves to its year over 1.4 s
  let y = pts[0][1];
  for (let i = 1; i < pts.length; i++) { const [ti, yi] = pts[i]; if (t <= ti) break; y = lerp(y, yi, eio(clamp((t - ti) / 1.4))); }
  return y;
}
function ribbon(yr, a, { band = null, today = 0, arc = 0 } = {}) {
  A(a, () => {
    ctx.fillStyle = C.faint; ctx.fillRect(RIB.x0, RIB.y - 1.5, RIB.x1 - RIB.x0, 3);
    for (let y = RIB.y0; y <= RIB.y1; y++) { const big = y % 5 === 0 || y === 1956 || y === 1991; ctx.fillStyle = big ? C.dim : C.faint; ctx.fillRect(rx(y) - 1, RIB.y - (big ? 9 : 5), 2, big ? 18 : 10); }
    txt('1956', RIB.x0 - 22, RIB.y + 1, { size: 32, weight: 700, color: C.dim, align: 'right' });
    A(1 - today, () => txt('1991', RIB.x1 + 22, RIB.y + 1, { size: 32, weight: 700, color: C.dim }));
    if (band) { ctx.fillStyle = C.tealSoft; ctx.fillRect(rx(band[0]), RIB.y - 7, rx(band[1]) - rx(band[0]), 14); }
    ctx.fillStyle = C.teal; ctx.fillRect(RIB.x0, RIB.y - 2.5, rx(yr) - RIB.x0, 5);
    if (arc > 0) {
      ctx.save(); ctx.strokeStyle = C.teal; ctx.lineWidth = 3; ctx.beginPath();
      const xa = rx(1956), xb = rx(1991), cyA = RIB.y - 8;
      for (let i = 0; i <= 60 * arc; i++) { const u = i / 60, x = lerp(xa, xb, u), y = cyA - Math.sin(Math.PI * u) * 120; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore();
    }
    const x = today > 0 ? lerp(rx(yr), RIB.x1 + 150, eio(today)) : rx(yr);
    if (today > 0) dashed(() => { ctx.beginPath(); ctx.moveTo(RIB.x1, RIB.y); ctx.lineTo(x, RIB.y); }, { w: 3 });
    ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(x, RIB.y, 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.bg0; ctx.lineWidth = 3; ctx.stroke();
    if (today > 0.5) A(seg(today, 0.5, 1), () => txt('today', x, RIB.y - 38, { size: 32, weight: 700, color: C.teal, align: 'center' }));
    else txt(String(Math.floor(yr + 1e-6)), x, RIB.y - 38, { size: 32, weight: 700, color: C.teal, align: 'center' });
  });
}

// ---------- Hungary, from the series' outline (lon, lat) ----------
const OUTLINE = [[16.11, 46.87], [16.28, 47.0], [16.45, 47.15], [16.48, 47.4], [16.43, 47.56], [16.64, 47.75], [16.9, 47.7], [17.05, 47.82], [17.16, 48.01],
  [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.87, 47.82], [19.05, 48.05], [19.48, 48.1], [19.75, 48.2], [20.05, 48.17], [20.3, 48.27], [20.55, 48.53],
  [21.12, 48.5], [21.45, 48.57], [21.72, 48.35], [22.15, 48.41], [22.4, 48.25], [22.9, 47.95], [22.7, 47.82], [22.3, 47.7], [22.02, 47.53], [21.95, 47.12],
  [21.65, 46.95], [21.4, 46.62], [21.05, 46.28], [20.7, 46.18], [20.26, 46.12], [19.85, 46.17], [19.4, 46.05], [18.95, 45.95], [18.8, 45.88], [18.45, 45.77],
  [18.15, 45.78], [17.7, 45.9], [17.4, 45.95], [17.15, 46.15], [16.88, 46.36], [16.6, 46.47], [16.38, 46.63]];
const DANUBE = [[17.16, 48.0], [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.95, 47.75], [19.06, 47.6], [19.05, 47.45], [18.95, 47.2], [18.93, 46.95], [18.92, 46.6], [18.85, 46.2], [18.8, 45.88]];
const BUDAPEST = [19.04, 47.5];
const LON0 = 16.0, LAT1 = 48.65, KX = Math.cos(47.2 * RAD);
function proj(box) { const sc = box.w / (7.0 * KX); return ([lo, la]) => [box.x + (lo - LON0) * KX * sc, box.y + (LAT1 - la) * sc]; }
const mapH = (box) => (box.w / (7.0 * KX)) * 2.95;
/** The map of Hungary in box {x, y, w}; western border highlighted by `west`. Returns the projection. */
function hungary(box, { west = 0, label = true, labelPos = 'below' } = {}) {
  const P = proj(box);
  ctx.save();
  ctx.beginPath(); OUTLINE.forEach((p, i) => (i ? ctx.lineTo(...P(p)) : ctx.moveTo(...P(p)))); ctx.closePath();
  ctx.fillStyle = C.land; ctx.fill(); ctx.strokeStyle = C.landLine; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.beginPath(); DANUBE.forEach((p, i) => (i ? ctx.lineTo(...P(p)) : ctx.moveTo(...P(p)))); ctx.strokeStyle = 'rgba(111,160,176,0.55)'; ctx.lineWidth = 3; ctx.stroke();
  if (west > 0) { ctx.beginPath(); OUTLINE.slice(0, 10).forEach((p, i) => (i ? ctx.lineTo(...P(p)) : ctx.moveTo(...P(p)))); ctx.strokeStyle = C.teal; ctx.lineWidth = 6 * west; ctx.stroke(); }
  ctx.restore();
  const [bx, by] = P(BUDAPEST);
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bx, by, 8, 0, TAU); ctx.fill();
  txt('Budapest', bx + 16, by + 2, { size: 34, weight: 700, color: C.ink });
  if (label) {
    const [, yb] = P([18.5, 45.6]);
    txt('schematic map', box.x, labelPos === 'below' ? yb + 40 : box.y - 30, { size: 32, weight: 500, color: C.dim });
  }
  return P;
}

// ---------- small figures and things ----------
function person(x, y, sz, col, { outline = false } = {}) {
  ctx.beginPath(); ctx.arc(x, y - sz * 1.55, sz * 0.48, 0, TAU);
  ctx.moveTo(x - sz * 0.72, y); ctx.quadraticCurveTo(x - sz * 0.72, y - sz * 1.0, x, y - sz * 1.0); ctx.quadraticCurveTo(x + sz * 0.72, y - sz * 1.0, x + sz * 0.72, y); ctx.closePath();
  if (outline) { ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); }
  else { ctx.fillStyle = col; ctx.fill(); }
}
function candle(x, y, sz, t, lit = 1, seed = 0) {
  ctx.fillStyle = '#d8d0bd'; k.rrect(x - sz * 0.32, y - sz * 1.6, sz * 0.64, sz * 1.6, sz * 0.12); ctx.fill();
  if (lit <= 0) return;
  const fl = 1 + 0.08 * Math.sin(t * 7.3 + seed * 2.1) + 0.05 * Math.sin(t * 12.1 + seed);
  A(lit, () => {
    const gl = ctx.createRadialGradient(x, y - sz * 2.0, 2, x, y - sz * 2.0, sz * 2.4);
    gl.addColorStop(0, 'rgba(228,180,94,0.45)'); gl.addColorStop(1, 'rgba(228,180,94,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y - sz * 2.0, sz * 2.4, 0, TAU); ctx.fill();
    ctx.fillStyle = C.candle; ctx.beginPath(); ctx.ellipse(x, y - sz * 2.0, sz * 0.24, sz * 0.5 * fl, 0, 0, TAU); ctx.fill();
  });
}
function mound(x, y, w, { tag = 0, name = null, a = 1, grass = 1 } = {}) {
  ctx.fillStyle = C.earth; ctx.beginPath(); ctx.ellipse(x, y, w / 2, w * 0.17, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(236,230,214,0.22)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, w / 2, w * 0.17, 0, Math.PI, TAU); ctx.stroke();
  if (grass > 0) {
    ctx.strokeStyle = C.grass; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i < 9; i++) { const gx = x - w / 2 + (w * (i + 0.5)) / 9, hh = (6 + rnd(x * 0.37 + i) * 12) * grass; ctx.moveTo(gx, y); ctx.lineTo(gx + 3, y - hh); }
    ctx.stroke();
  }
  if (tag > 0) {
    // a name plate: a dashed outline while it has no name, solid teal with the name once it has one
    const tw = Math.max(w * 0.9, name ? textW(name, { size: 30, weight: 700 }) + 30 : 0), th = 44, ty = y - w * 0.17 - 58;
    A(tag * a, () => {
      if (name) { rrectFill(x - tw / 2, ty, tw, th, 8, 'rgba(111,184,176,0.18)', C.teal, 2.5); txt(name, x, ty + th / 2 + 1, { size: 30, weight: 700, color: C.ink, align: 'center' }); }
      else { dashed(() => k.rrect(x - tw / 2, ty, tw, th, 8), { w: 2.5 }); txt('?', x, ty + th / 2 + 1, { size: 32, weight: 700, color: C.tealSoft, align: 'center' }); }
    });
  }
}
/** A carved wooden grave post (kopjafa), simplified. */
function post(x, y, h, col = C.wood) {
  const w = h * 0.16;
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h * 0.55); ctx.lineTo(x - w * 0.32, y - h * 0.62); ctx.lineTo(x - w / 2, y - h * 0.7);
  ctx.lineTo(x - w / 2, y - h * 0.82); ctx.lineTo(x, y - h); ctx.lineTo(x + w / 2, y - h * 0.82); ctx.lineTo(x + w / 2, y - h * 0.7);
  ctx.lineTo(x + w * 0.32, y - h * 0.62); ctx.lineTo(x + w / 2, y - h * 0.55); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
  for (const f of [0.3, 0.42]) { ctx.beginPath(); ctx.moveTo(x - w / 2, y - h * f); ctx.lineTo(x + w / 2, y - h * f); ctx.stroke(); }
}
function coffin(x, y, w, h, { empty = false, glow = 0 } = {}) {
  if (empty) {
    if (glow > 0) A(glow, () => { ctx.fillStyle = C.tealFaint; k.rrect(x - 10, y - 10, w + 20, h + 20, 10); ctx.fill(); });
    dashed(() => k.rrect(x, y, w, h, 6), { w: 3 });
    return;
  }
  rrectFill(x, y, w, h, 6, '#6b4f3a', 'rgba(236,230,214,0.55)', 2);
  ctx.fillStyle = '#80614a'; ctx.fillRect(x + 6, y + 6, w - 12, h * 0.28);
  if (glow > 0) A(glow, () => { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; k.rrect(x - 5, y - 5, w + 10, h + 10, 9); ctx.stroke(); });
}
function sheet(x, y, w, h, rot = 0) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-w / 2 + 8, -h / 2 + 10, w, h);
  ctx.fillStyle = C.paper; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
}
/** A calendar page: the year in the band, the day below ("16 June" is one label: "június 16." in Hungarian). */
function calendar(cx, y, day, year, { w = 250, col = C.red, a = 1, sub = null } = {}) {
  A(a, () => {
    const h = w * 0.86;
    rrectFill(cx - w / 2, y, w, h, 12, C.paper);
    ctx.fillStyle = col; k.rrect(cx - w / 2, y, w, h * 0.3, [12, 12, 0, 0]); ctx.fill();
    txt(year, cx, y + h * 0.15 + 2, { size: Math.round(w * 0.17), weight: 800, family: HEAD, color: C.ink, align: 'center' });
    txt(day, cx, y + h * 0.63, { size: fit(day, w - 30, Math.round(w * 0.2), { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.paperInk, align: 'center' });
    if (sub) txt(sub, cx, y + h + 40, { size: fit(sub, w + 120, 34, { weight: 700 }), weight: 700, color: C.soft, align: 'center' });
  });
}
function bigNumber(n, x, y, { size = 140, color = C.ink, align = 'left', family = HEAD } = {}) { txt(fmt(n), x, y, { size, weight: 800, family, color, align }); }
const countUp = (t, a, b, n) => n * eout(seg(t, a, b));

// ---------- Heroes' Square, the art hall and the six coffins (cold open and chapter 5) ----------
const CROWD = (() => {
  const out = [];
  for (let i = 0; i < 1500; i++) {
    const x = 120 + rnd(i * 3.1) * 1680, y = 700 + Math.pow(rnd(i * 7.7 + 1), 0.9) * 200;
    out.push({ x, y, r: 2.6 + rnd(i * 1.9) * 1.8, d: Math.hypot((x - 960) / 1.6, y - 640) + rnd(i) * 80 });
  }
  return out.sort((p, q) => p.d - q.d);
})();
const HALL = { x: 520, y: 210, w: 880 };
const COFFIN = { x0: 560, y: 590, w: 112, h: 44, step: 136 };
function heroesSquare(t, { coffins = 1, five = 0, empty = 0, crowd = 0, names = 0 } = {}) {
  const { x, y, w } = HALL;
  // the art hall: pediment, columns, steps
  ctx.fillStyle = '#262c34';
  ctx.beginPath(); ctx.moveTo(x + 40, y + 110); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w - 40, y + 110); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(236,230,214,0.3)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#2b323b'; ctx.fillRect(x + 20, y + 110, w - 40, 36);
  for (let i = 0; i < 8; i++) {
    const cx = x + 80 + (i * (w - 160)) / 7;
    const gr = ctx.createLinearGradient(cx - 22, 0, cx + 22, 0); gr.addColorStop(0, '#2a3038'); gr.addColorStop(0.5, '#3b434d'); gr.addColorStop(1, '#262b33');
    ctx.fillStyle = gr; ctx.fillRect(cx - 22, y + 146, 44, 200);
  }
  ctx.fillStyle = '#20252c'; ctx.fillRect(x, y + 346, w, 22);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#1c2127' : '#232931'; ctx.fillRect(x - 30 - i * 30, y + 368 + i * 22, w + 60 + i * 60, 22); }
  // six coffins on the steps; the sixth is empty
  for (let i = 0; i < 6; i++) {
    const a = coffins * clamp(coffins * 6 - i);
    if (a <= 0) continue;
    A(a, () => coffin(COFFIN.x0 + i * COFFIN.step, COFFIN.y, COFFIN.w, COFFIN.h, { empty: i === 5, glow: i === 5 ? empty : five }));
  }
  // the crowd, as quiet points, filling from the steps outwards
  if (crowd > 0) {
    const n = Math.floor(CROWD.length * crowd);
    ctx.fillStyle = 'rgba(236,230,214,0.5)';
    for (let i = 0; i < n; i++) { const p = CROWD[i]; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill(); }
  }
}

// ---------- cold open ----------
function partOpen(t) {
  const out = 1 - seg(t, e('o5', 0.0), e('o5', 0.8));
  A(out, () => {
    A(eout(seg(t, s('o1', 0.1), s('o1', 1.4))), () => heroesSquare(t, {
      coffins: seg(t, s('o1', 1.6), e('o1', -0.2)), five: span(t, s('o2', 0.2), e('o2', 0.2), 0.5, 0.6),
      empty: seg(t, s('o3', 0.1), s('o3', 0.9)), crowd: eio(seg(t, s('o4', 0.1), e('o4', 0.6))),
    }));
    A(eout(seg(t, s('o1', 0.3), s('o1', 1.2))), () => {
      txt('Budapest', 110, 150, { size: 40, weight: 700, color: C.soft });
      txt('16 June 1989', 110, 215, { size: fit('16 June 1989', 390, 66, { weight: 800, family: HEAD }), weight: 800, family: HEAD });
      txt('Heroes’ Square', 110, 275, { size: 36, weight: 500, color: C.soft });
    });
    // o2: four executed, one died in prison
    const lab = span(t, s('o2', 0.4), e('o3', 0.3), 0.5, 0.6);
    A(lab, () => {
      const y = COFFIN.y + COFFIN.h + 22, xa = COFFIN.x0, xb = COFFIN.x0 + 3 * COFFIN.step + COFFIN.w;
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xa, y + 12); ctx.lineTo(xb, y + 12); ctx.lineTo(xb, y); ctx.stroke();
      txt('executed', (xa + xb) / 2, y + 44, { size: 34, weight: 700, color: C.ink, align: 'center' });
      const x5 = COFFIN.x0 + 4 * COFFIN.step + COFFIN.w / 2;
      ctx.beginPath(); ctx.moveTo(x5, y); ctx.lineTo(x5, y + 12); ctx.stroke();
      txt('died in prison', x5 + 40, y + 44, { size: 34, weight: 700, color: C.ink, align: 'center' });
    });
    // o3: the empty one
    A(eout(seg(t, s('o3', 0.3), s('o3', 1.1))), () => {
      const x6 = COFFIN.x0 + 5 * COFFIN.step + COFFIN.w, y6 = COFFIN.y + COFFIN.h / 2;
      ctx.strokeStyle = C.teal; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x6 + 14, y6); ctx.lineTo(1470, 470); ctx.lineTo(1500, 470); ctx.stroke();
      txt('empty', 1515, 455, { size: 46, weight: 800, family: HEAD, color: C.teal });
      txt('for all the dead', 1515, 512, { size: 36, weight: 500, color: C.ink });
    });
    // o4: the crowd and the 31 years
    A(eout(seg(t, s('o4', 0.6), s('o4', 1.6))), () => {
      txt('200,000–250,000', 1810, 150, { size: fit('200,000–250,000', 420, 54, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.ink, align: 'right' });
      txt('people came', 1810, 205, { size: 36, weight: 500, color: C.soft, align: 'right' });
    });
    const cal = eout(seg(t, s('o4', 2.0), s('o4', 3.0)));
    calendar(192, 340, '16 June', '1958', { w: 190, col: C.steelDark, a: cal });
    calendar(402, 340, '16 June', '1989', { w: 190, col: C.red, a: eout(seg(t, s('o4', 2.6), s('o4', 3.6))) });
    A(eout(seg(t, s('o4', 3.4), s('o4', 4.2))), () => {
      arrow(212, 540, 297, 595, 382, 540, 1, C.teal, { w: 4, head: 18 });
      txt('31 years', 297, 630, { size: 36, weight: 700, color: C.teal, align: 'center' });
    });
  });
  // the title, until the first chapter card
  const ti = eout(seg(t, e('o5', 0.6), e('o5', 1.7)));
  A(ti, () => {
    ctx.fillStyle = 'rgba(10,12,15,0.55)'; ctx.fillRect(0, 0, W, H);
    emblem(W / 2, 300, 132);
    txt('CONSEQUENCES', W / 2, 438, { size: 38, weight: 700, color: C.teal, align: 'center', spacing: '8px' });
    const title = 'What 1956 left behind';
    txt(title, W / 2, 540 + (1 - ti) * 14, { size: fit(title, 1640, 112, { weight: 800, family: HEAD }), weight: 800, family: HEAD, align: 'center' });
    rule(W / 2, 628, 300);
    txt('Hungary 1956', W / 2, 690, { size: 44, weight: 500, color: C.soft, align: 'center' });
  });
}

// ---------- 1: the reprisals ----------
const SENTENCED = 22000, EXECUTED = 229, LIBERTY_IN = 200;
function partReprisals(t) {
  // A: December 1956, Kádár's government, deportations
  A(span(t, s('r1', -1.0), e('r1', 0.9), 0.8, 0.7), () => {
    const box = { x: 120, y: 220, w: 820 };
    hungary(box);
    A(eout(seg(t, s('r1', 0.2), s('r1', 1.2))), () => {
      txt('December 1956', 1040, 270, { size: 62, weight: 800, family: HEAD });
      txtFit('János Kádár’s government', 1040, 360, 760, { size: 46, weight: 700, color: C.teal });
      txtFit('put in power by the Soviet army', 1040, 420, 760, { size: 38, color: C.soft });
      txtFit('on 4 November 1956', 1040, 470, 760, { size: 38, color: C.soft });
    });
  });
  // B: summary courts and internment
  A(span(t, s('r3', -0.4), e('r4', 0.8), 0.7, 0.7), () => {
    const p = eout(seg(t, s('r3', 0.0), s('r3', 1.0)));
    ctx.save(); ctx.translate(0, (1 - p) * 20);
    sheet(170, 230, 620, 560, -0.02);
    txt('SUMMARY COURT', 480, 300, { size: fit('SUMMARY COURT', 540, 46, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.paperInk, align: 'center' });
    txt('December 1956', 480, 352, { size: 34, weight: 500, color: '#5a5248', align: 'center' });
    const lines = seg(t, s('r3', 0.6), s('r3', 2.6));
    for (let i = 0; i < 6; i++) { const u = clamp(lines * 6 - i); ctx.fillStyle = 'rgba(43,39,34,0.25)'; ctx.fillRect(230, 410 + i * 34, (440 - (i % 3) * 60) * u, 12); }
    A(eout(seg(t, s('r3', 2.2), s('r3', 3.0))), () => {
      txtFit('a hidden weapon', 480, 650, 540, { size: 40, weight: 700, color: C.paperInk, align: 'center' });
      ctx.save(); ctx.translate(480, 715); ctx.rotate(-0.04);
      const sw = textW('at least 10 years in prison', { size: 38, weight: 800 }) + 40;
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; k.rrect(-Math.min(sw, 560) / 2, -32, Math.min(sw, 560), 64, 8); ctx.stroke();
      txtFit('at least 10 years in prison', 0, 2, 520, { size: 38, weight: 800, color: C.red, align: 'center' });
      ctx.restore();
    });
    ctx.restore();
    // internment: a camp fence with figures inside
    A(eout(seg(t, s('r4', 0.1), s('r4', 1.1))), () => {
      const fx = 1040, fy = 260, fw = 700, fh = 300;
      ctx.fillStyle = 'rgba(29,35,43,0.9)'; ctx.fillRect(fx, fy, fw, fh);
      ctx.strokeStyle = C.stone; ctx.lineWidth = 3;
      for (let i = 0; i <= 14; i++) { const x = fx + (i * fw) / 14; ctx.beginPath(); ctx.moveTo(x, fy - 20); ctx.lineTo(x, fy + fh); ctx.stroke(); }
      for (const yy of [fy - 8, fy + 40, fy + 120, fy + 200]) { ctx.beginPath(); for (let x = fx; x <= fx + fw; x += 10) ctx.lineTo(x, yy + Math.sin(x * 0.4) * 2); ctx.stroke(); }
      for (let i = 0; i < 9; i++) person(fx + 70 + i * 70, fy + fh - 30, 26, 'rgba(236,230,214,0.75)');
      txt('internment', fx, fy + fh + 70, { size: 54, weight: 800, family: HEAD, color: C.ink });
      txtFit('without trial', fx, fy + fh + 130, fw, { size: 38, color: C.soft });
      txtFit('for six months, then perhaps a year more', fx, fy + fh + 180, fw, { size: 38, color: C.soft });
    });
  });
  // C: more than 22,000 sentenced; one in 200 lost their liberty
  A(span(t, s('r5', -0.4), e('r6', 0.8), 0.7, 0.7), () => {
    A(eout(seg(t, s('r5', 0.0), s('r5', 0.8))), () => {
      txt('more than', 160, 300, { size: 40, weight: 500, color: C.soft });
      bigNumber(countUp(t, s('r5', 0.2), s('r5', 2.2), SENTENCED), 150, 410, { size: 150 });
      txtFit('sentenced to prison', 160, 520, 740, { size: 46, weight: 700, color: C.ink });
      A(eout(seg(t, e('r5', -2.6), e('r5', -1.6))), () => para('even more were interned or held without trial', 160, 590, 760, { size: 38, color: C.soft }));
      txt('1956 Institute', 160, 720, { size: 34, weight: 500, color: C.dim });
    });
    const g = seg(t, s('r6', 0.0), s('r6', 1.6)), hi = eout(seg(t, s('r6', 1.4), s('r6', 2.2)));
    if (g > 0) {
      const x0 = 1060, y0 = 290, st = 37, cols = 20;
      for (let i = 0; i < LIBERTY_IN; i++) {
        const c = i % cols, r = Math.floor(i / cols);
        if (g * LIBERTY_IN < i) continue;
        const target = i === 137;
        ctx.fillStyle = target ? (hi > 0 ? C.teal : C.dim) : C.dim;
        ctx.beginPath(); ctx.arc(x0 + c * st, y0 + r * st, target ? 9 + 5 * hi : 9, 0, TAU); ctx.fill();
      }
      A(hi, () => para('one Hungarian in 200 lost their liberty', 1050, 700, 740, { size: 40, weight: 700, color: C.teal }));
    }
  });
  // D: 229 executed; who they were
  A(span(t, s('r7', -0.4), e('r8', 0.8), 0.7, 0.7), () => {
    const lit = seg(t, s('r7', 0.3), s('r7', 3.2));
    A(eout(seg(t, s('r7', 0.0), s('r7', 0.8))), () => {
      txt(fmt(EXECUTED), 150, 250, { size: 110, weight: 800, family: HEAD, color: C.candle });
      const n = para('executed for their part in the revolution', 160, 650, 760, { size: 38, weight: 700 });
      txt('1956 Institute’s count', 160, 650 + n * 47 + 8, { size: 34, color: C.dim });
    });
    for (let i = 0; i < EXECUTED; i++) {
      const c = i % 23, r = Math.floor(i / 23), a = clamp(lit * EXECUTED * 0.08 - i * 0.08);
      if (a <= 0) continue;
      const x = 170 + c * 31, y = 350 + r * 27;
      A(a, () => { ctx.fillStyle = 'rgba(228,180,94,0.22)'; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); ctx.fillStyle = C.candle; ctx.beginPath(); ctx.arc(x, y, 3.6, 0, TAU); ctx.fill(); });
    }
    // 100 of those sentenced: at most 5 "class enemies"
    const gq = eout(seg(t, s('r8', 0.2), s('r8', 1.2))), five = eout(seg(t, s('r8', 1.6), s('r8', 2.4))), rest = eout(seg(t, e('r8', -3.4), e('r8', -2.2)));
    A(gq, () => {
      txtFit('of every 100 sentenced', 1060, 250, 740, { size: 40, weight: 700, color: C.soft });
      for (let i = 0; i < 100; i++) {
        const c = i % 20, r = Math.floor(i / 20), x = 1060 + c * 37, y = 300 + r * 37;
        ctx.fillStyle = i < 5 ? (five > 0 ? `rgba(154,152,144,${0.3 + 0.7 * five})` : C.faint) : (rest > 0 ? `rgba(111,184,176,${0.25 + 0.75 * rest})` : C.faint);
        ctx.fillRect(x, y, 29, 29);
      }
      A(five, () => { ctx.fillStyle = C.stone; ctx.fillRect(1060, 520, 29, 29); para('at most 5 were “class enemies”, even by the regime’s own figures', 1106, 516, 690, { size: 36, color: C.ink }); });
      A(rest, () => { ctx.fillStyle = C.teal; ctx.fillRect(1060, 650, 29, 29); para('workers, peasants, clerks and students', 1106, 646, 690, { size: 36, weight: 700, color: C.ink }); });
    });
  });
  // E: the years of reprisals
  A(span(t, s('r10', -0.4), DURATION, 0.7, 0.7), () => {
    const items = [['December 1956', 'summary courts, internment', s('r10', -0.2)], ['1961', 'internment ends', s('r10', 0.6)], ['1963', 'most prisoners freed', s('r10', 2.4)]];
    const xs = [420, 960, 1500];
    A(eout(seg(t, s('r10', 0.1), s('r10', 1.0))), () => { ctx.fillStyle = C.faint; ctx.fillRect(xs[0], 520, xs[2] - xs[0], 4); });
    items.forEach(([when, what, at], i) => A(eout(seg(t, at, at + 0.8)), () => {
      ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(xs[i], 522, 12, 0, TAU); ctx.fill();
      txt(when, xs[i], 450, { size: fit(when, 470, 50, { weight: 800, family: HEAD }), weight: 800, family: HEAD, align: 'center' });
      para(what, xs[i], 600, 440, { size: 38, color: C.soft, align: 'center' });
    }));
  });
  ribbon(yearAt(t, [[s('r1'), 1956.93], [s('r10', 0.6), 1961], [s('r10', 2.4), 1963.2]]), 1);
}

// ---------- 2: those who left ----------
const FLED = 193885, AUSTRIA_ABOUT = 180000, YUGO_ABOUT = 20000, ANDAU = 70000, HOME = 11447, STAYED = 176000;
const SETTLED = [['United States', 44110], ['Canada', 39190], ['Australia', 15390], ['West Germany', 14400], ['Britain', 13670], ['Switzerland', 10480]];
const FLOW = Array.from({ length: 140 }, (_, i) => ({ o: [lerp(17.6, 21.6, rnd(i * 2.3)), lerp(46.3, 48.2, rnd(i * 5.1))], b: 0.12 + rnd(i * 9.7) * 0.76, ph: rnd(i * 13.3), sp: 0.07 + rnd(i * 3.9) * 0.05 }));
const MAP2 = { x: 420, y: 250, w: 820 };
function flowDots(t, P, t0, a, dens = 1) {
  if (a <= 0) return;
  const west = OUTLINE.slice(0, 10);
  for (let i = 0; i < FLOW.length * dens; i++) {
    const f = FLOW[i], u = ((t - t0) * f.sp + f.ph) % 1;
    if (t < t0) continue;
    const seg0 = Math.floor(f.b * 8.999), fr = f.b * 9 - seg0;
    const tgt = [lerp(west[seg0][0], west[seg0 + 1][0], fr) - 0.08, lerp(west[seg0][1], west[seg0 + 1][1], fr)];
    const [x0, y0] = P(i % 3 ? f.o : BUDAPEST), [x1, y1] = P(tgt);
    const x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * 6 + i) * 6;
    A(a * Math.min(1, u * 6, (1 - u) * 6), () => { ctx.fillStyle = C.candle; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill(); });
  }
}
function andau(t) {
  // a schematic of the border by Andau: Austria to the west (left), the Einser canal, the border, Hungary to the east
  const X = 160, Y = 200, Wd = 1600, Hd = 600;
  ctx.save(); k.rrect(X, Y, Wd, Hd, 18); ctx.clip();
  ctx.fillStyle = '#1b2128'; ctx.fillRect(X, Y, Wd, Hd);
  ctx.fillStyle = '#20272f'; ctx.fillRect(X + 1040, Y, Wd - 1040, Hd);
  // the canal
  const cx = 860; ctx.fillStyle = C.water; ctx.fillRect(cx - 34, Y, 68, Hd);
  ctx.strokeStyle = 'rgba(236,230,214,0.12)'; ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) { const yy = Y + 30 + i * 50 + ((t * 8) % 50); ctx.beginPath(); ctx.moveTo(cx - 20, yy); ctx.lineTo(cx + 10, yy + 8); ctx.stroke(); }
  // the border
  dashed(() => { ctx.beginPath(); ctx.moveTo(X + 1040, Y); ctx.lineTo(X + 1040, Y + Hd); }, { color: C.red, w: 3, dash: [14, 10] });
  // Andau: a few houses
  for (let i = 0; i < 7; i++) { const hx = X + 70 + (i % 4) * 70, hy = Y + 120 + Math.floor(i / 4) * 80 + (i % 2) * 10; ctx.fillStyle = '#39414b'; ctx.fillRect(hx, hy, 46, 32); ctx.beginPath(); ctx.moveTo(hx - 6, hy); ctx.lineTo(hx + 23, hy - 22); ctx.lineTo(hx + 52, hy); ctx.closePath(); ctx.fill(); }
  // the path to the bridge
  const by = Y + 360;
  ctx.strokeStyle = 'rgba(236,230,214,0.18)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(X + 260, Y + 250); ctx.quadraticCurveTo(X + 500, by, cx - 40, by); ctx.moveTo(cx + 40, by); ctx.lineTo(X + Wd, by - 30); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = 'rgba(236,230,214,0.3)'; ctx.lineWidth = 2; k.rrect(X, Y, Wd, Hd, 18); ctx.stroke();
  // the bridge, and from f5 its outline only
  const gone = eout(seg(t, s('f5', 0.4), s('f5', 1.6)));
  A(1 - gone, () => { ctx.fillStyle = C.wood; ctx.fillRect(cx - 52, by - 16, 104, 32); ctx.fillStyle = C.woodDark; for (let i = 0; i < 7; i++) ctx.fillRect(cx - 50 + i * 15, by - 16, 3, 32); ctx.fillRect(cx - 52, by - 20, 104, 5); ctx.fillRect(cx - 52, by + 15, 104, 5); });
  A(gone, () => { dashed(() => { ctx.beginPath(); ctx.rect(cx - 52, by - 16, 104, 32); }, { w: 3 }); ctx.fillStyle = C.woodDark; ctx.fillRect(cx - 52, by - 6, 22, 12); ctx.fillRect(cx + 30, by - 4, 22, 10); });
  // people crossing, east to west; after the bridge is gone, fewer and slower
  const t0 = s('f4', 0.0);
  if (t > t0 - 0.5) {
    for (let i = 0; i < 46; i++) {
      const slow = gone > 0.5 && i % 3 !== 0 ? 0 : 1;
      if (!slow) continue;
      const sp = (gone > 0.5 ? 0.035 : 0.06) + rnd(i * 4.1) * 0.02, u = ((t - t0) * sp + rnd(i * 2.7)) % 1;
      const path = (v) => (v < 0.45 ? [lerp(X + Wd + 20, cx + 40, v / 0.45), lerp(by - 40, by, v / 0.45) + (rnd(i) - 0.5) * 24]
        : v < 0.55 ? [lerp(cx + 40, cx - 40, (v - 0.45) / 0.1), by + (rnd(i) - 0.5) * 8]
          : [lerp(cx - 40, X + 290, (v - 0.55) / 0.45), lerp(by, Y + 260, eio((v - 0.55) / 0.45)) + (rnd(i) - 0.5) * 24]);
      const [x, y] = path(u);
      A(Math.min(1, u * 8, (1 - u) * 8) * clamp((t - t0 + 0.5) * 2), () => { ctx.fillStyle = C.candle; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, TAU); ctx.fill(); });
    }
  }
  // labels
  txt('AUSTRIA', X + 60, Y + Hd - 50, { size: 40, weight: 800, family: HEAD, color: C.dim, spacing: '4px' });
  txt('HUNGARY', X + Wd - 60, Y + Hd - 50, { size: 40, weight: 800, family: HEAD, color: C.dim, spacing: '4px', align: 'right' });
  txt('Andau', X + 70, Y + 70, { size: 38, weight: 700, color: C.ink });
  txt('Einser canal', cx + 50, Y + 60, { size: 34, weight: 700, color: 'rgba(160,200,214,0.9)' });
  txt('border', X + 1056, Y + 470, { size: 32, weight: 500, color: 'rgba(198,58,50,0.9)' });
  txt('the bridge', cx, by + 64, { size: 34, weight: 700, color: C.ink, align: 'center' });
  txt('schematic map', X, Y + Hd + 40, { size: 32, color: C.dim });
}
function partLeft(t) {
  // A: the door opens; people set out west
  A(span(t, s('f1', -1.0), e('f2', 0.8), 0.8, 0.7), () => {
    const P = hungary(MAP2, { west: eout(seg(t, s('f1', 2.4), s('f1', 3.4))) });
    txt('AUSTRIA', 150, 330, { size: 40, weight: 800, family: HEAD, color: C.dim, spacing: '4px' });
    flowDots(t, P, s('f2', 0.2), eout(seg(t, s('f2', 0.0), s('f2', 1.0))));
    A(eout(seg(t, s('f1', 2.4), s('f1', 3.4))), () => {
      txt('28 October 1956', 1330, 230, { size: fit('28 October 1956', 480, 48, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.teal });
      para('Austria offers asylum to any Hungarian who asks', 1330, 290, 470, { size: 36, color: C.ink });
    });
    A(eout(seg(t, s('f2', 0.6), s('f2', 1.6))), () => {
      txt('after 4 November', 1330, 600, { size: 40, weight: 700, color: C.candle });
      para('tens of thousands set out west', 1330, 652, 470, { size: 36, color: C.ink });
    });
  });
  // B: the bridge at Andau
  A(span(t, s('f3', -0.4), e('f5', 0.8), 0.7, 0.7), () => {
    andau(t);
    A(eout(seg(t, s('f4', 0.4), s('f4', 1.2))), () => {
      rrectFill(1250, 215, 540, 140, 14, C.card, C.candle, 2);
      bigNumber(countUp(t, s('f4', 0.4), e('f4', 0.0), ANDAU), 1280, 268, { size: 68, color: C.candle });
      txtFit('crossed, by Austrian accounts', 1280, 322, 490, { size: 32, color: C.soft });
    });
    A(eout(seg(t, s('f5', 0.6), s('f5', 1.4))), () => {
      rrectFill(1250, 368, 540, 122, 14, C.card, C.teal, 2);
      txt('21 November', 1280, 410, { size: fit('21 November', 420, 42, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.teal });
      txtFit('blown up; people still crossed', 1280, 458, 490, { size: 32, color: C.soft });
    });
  });
  // C: in all
  A(span(t, s('f6', -0.4), e('f7', 0.8), 0.7, 0.7), () => {
    const P = hungary(MAP2);
    txt('AUSTRIA', 150, 330, { size: 40, weight: 800, family: HEAD, color: C.dim, spacing: '4px' });
    txt('YUGOSLAVIA', 790, 878, { size: 40, weight: 800, family: HEAD, color: C.dim, spacing: '4px' });
    flowDots(t, P, s('f6', -2), eout(seg(t, s('f6', 0.0), s('f6', 1.0))) * (1 - seg(t, s('f7', 0.5), s('f7', 1.5))), 1);
    A(eout(seg(t, s('f6', 0.4), s('f6', 1.2))), () => chip('December: a second, larger wave', 960, 196, { size: 36, color: C.candle }));
    const pa = eio(seg(t, s('f7', 1.0), s('f7', 2.6)));
    const [bx, by] = P(BUDAPEST);
    arrow(bx - 10, by, 520, 380, 250, 420, pa, C.teal, { w: 14, head: 34 });
    arrow(bx, by + 14, 790, 690, 745, 815, pa, C.teal, { w: 6, head: 24 });
    A(seg(pa, 0.8, 1), () => {
      txt('about', 260, 470, { size: 32, color: C.soft, align: 'center' });
      txt(fmt(AUSTRIA_ABOUT), 260, 512, { size: 44, weight: 800, family: HEAD, color: C.teal, align: 'center' });
      txt('about', 790, 770, { size: 32, color: C.soft });
      txt(fmt(YUGO_ABOUT), 790, 815, { size: 40, weight: 800, family: HEAD, color: C.teal });
    });
    A(eout(seg(t, s('f7', 0.2), s('f7', 1.0))), () => {
      bigNumber(countUp(t, s('f7', 0.2), s('f7', 2.4), FLED), 1810, 360, { size: 104, align: 'right' });
      para('fled to Austria and Yugoslavia', 1810, 440, 520, { size: 38, weight: 700, align: 'right' });
      para('Hungarian Central Statistical Office, 1957', 1810, 550, 520, { size: 32, color: C.dim, align: 'right' });
    });
  });
  // D: who they were
  A(span(t, s('f8', -0.4), e('f9', 0.8), 0.7, 0.7), () => {
    const men = eout(seg(t, s('f8', 0.2), s('f8', 1.6))), age = eout(seg(t, s('f8', 2.0), s('f8', 3.0)));
    txtFit('of every 100 who fled', 150, 230, 700, { size: 40, weight: 700, color: C.soft });
    for (let i = 0; i < 100; i++) {
      const c = i % 10, r = Math.floor(i / 10), x = 180 + c * 60, y = 330 + r * 50;
      const m = i < 66, young = (i * 37) % 100 < 70;
      person(x, y + 16, 15, m && men > 0 ? `rgba(111,184,176,${0.35 + 0.65 * men})` : 'rgba(236,230,214,0.55)');
      if (young && age > 0) A(age, () => { ctx.strokeStyle = C.candle; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y + 2, 20, 0, TAU); ctx.stroke(); });
    }
    A(men, () => { ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(170, 860, 10, 0, TAU); ctx.fill(); txt('66 men', 192, 862, { size: 34, weight: 700 }); });
    A(age, () => { ctx.strokeStyle = C.candle; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(430, 860, 12, 0, TAU); ctx.stroke(); txt('70 aged 15 to 39', 452, 862, { size: 34, weight: 700 }); });
    // children and engineers
    A(eout(seg(t, s('f9', 0.0), s('f9', 0.8))), () => {
      bigNumber(10000, 1000, 290, { size: 96, color: C.candle });
      para('children under 15 left without their parents', 1000, 360, 760, { size: 38, color: C.ink });
    });
    const eng = eout(seg(t, s('f9', 2.6), s('f9', 3.4))), gone = eout(seg(t, s('f9', 3.4), s('f9', 4.4)));
    A(eng, () => {
      for (let i = 0; i < 10; i++) { const x = 1030 + i * 74, y = 640; if (i === 9) A(1 - gone, () => person(x, y, 24, C.ink)); else person(x, y, 24, C.ink); if (i === 9) A(gone, () => person(x, y, 24, C.teal, { outline: true })); }
      A(gone, () => para('one engineer in ten left Hungary', 1000, 700, 760, { size: 38, weight: 700, color: C.teal }));
    });
  });
  // E: where they went
  A(span(t, s('f10', -0.4), e('f10', 1.6), 0.7, 0.7), () => {
    A(eout(seg(t, s('f10', 0.1), s('f10', 0.9))), () => {
      txt('UNHCR', 150, 230, { size: 64, weight: 800, family: HEAD, color: C.teal });
      txtFit('the UN’s refugee agency coordinates relief', 420, 232, 1380, { size: 38, color: C.ink });
    });
    const bars = seg(t, s('f10', 2.6), e('f10', 0.6));
    A(eout(seg(t, s('f10', 2.2), s('f10', 3.0))), () => txtFit('where they settled, by 1960', 150, 330, 900, { size: 40, weight: 700, color: C.soft }));
    SETTLED.forEach(([name, v], i) => {
      const a = eout(clamp(bars * 6 - i));
      if (a <= 0) return;
      const y = 410 + i * 76, x0 = 560, len = (v / SETTLED[0][1]) * 980 * a;
      A(Math.min(1, a * 2), () => {
        txt(name, x0 - 24, y, { size: fit(name, 380, 38, { weight: 700 }), weight: 700, align: 'right', color: C.ink });
        ctx.fillStyle = i === 0 ? C.teal : 'rgba(111,184,176,0.6)'; ctx.fillRect(x0, y - 22, len, 44);
        txt(fmt(v), x0 + len + 16, y + 1, { size: 36, weight: 700, color: C.soft });
      });
    });
    A(eout(seg(t, e('f10', -0.6), e('f10', 0.4))), () => para('a 1960 study for the UN, cited by Tadeusz Kopyś (2024)', 150, 880, 1300, { size: 32, color: C.dim }));
  });
  // F: home, or abroad for good
  A(span(t, s('f12', -0.4), DURATION, 0.7, 0.7), () => {
    const a1 = eout(seg(t, s('f12', 0.2), s('f12', 1.2))), a2 = eout(seg(t, s('f12', 2.6), s('f12', 3.6)));
    const R = 230, r1 = R * Math.sqrt(HOME / STAYED);
    A(a1, () => {
      ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(560, 470, r1 * a1, 0, TAU); ctx.fill();
      txt(fmt(HOME), 560, 620, { size: 72, weight: 800, family: HEAD, color: C.teal, align: 'center' });
      para('had come home by the end of May 1957', 560, 680, 560, { size: 36, align: 'center' });
    });
    A(a2, () => {
      dashed(() => { ctx.beginPath(); ctx.arc(1300, 440, R * a2, 0, TAU); }, { w: 3 });
      ctx.fillStyle = C.tealFaint; ctx.beginPath(); ctx.arc(1300, 440, R * a2, 0, TAU); ctx.fill();
      txt('about', 1300, 700, { size: 34, color: C.soft, align: 'center' });
      txt(fmt(STAYED), 1300, 752, { size: 72, weight: 800, family: HEAD, color: C.ink, align: 'center' });
      txt('stayed abroad for good', 1300, 812, { size: 36, align: 'center' });
    });
  });
  ribbon(yearAt(t, [[s('f1'), 1956.82], [s('f2'), 1956.85], [s('f6'), 1956.95], [s('f12'), 1957.4]]), 1);
}

// ---------- 3: the secret trial ----------
function embassy(x, y) {
  ctx.fillStyle = '#2a313a'; ctx.fillRect(x, y, 340, 250);
  ctx.fillStyle = '#323a44'; ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 170, y - 60); ctx.lineTo(x + 354, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(236,230,214,0.25)';
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) ctx.fillRect(x + 34 + c * 76, y + 40 + r * 90, 42, 56);
  ctx.fillStyle = '#1c2127'; ctx.fillRect(x + 145, y + 170, 50, 80);
  ctx.fillStyle = C.stone; ctx.fillRect(x + 168, y - 140, 4, 82);
}
function bus(x, y) {
  rrectFill(x, y - 70, 230, 70, 14, '#7d8a6a');
  ctx.fillStyle = 'rgba(20,24,28,0.7)'; for (let i = 0; i < 5; i++) ctx.fillRect(x + 14 + i * 42, y - 58, 32, 24);
  ctx.fillStyle = '#111'; for (const wx of [x + 44, x + 186]) { ctx.beginPath(); ctx.arc(wx, y, 15, 0, TAU); ctx.fill(); }
}
function armoured(x, y) {
  ctx.fillStyle = C.steelDark; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + 20, y - 54); ctx.lineTo(x + 150, y - 54); ctx.lineTo(x + 176, y - 14); ctx.lineTo(x + 176, y); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.steel; ctx.fillRect(x + 64, y - 74, 46, 20);
  ctx.fillStyle = '#111'; for (const wx of [x + 34, x + 88, x + 142]) { ctx.beginPath(); ctx.arc(wx, y, 13, 0, TAU); ctx.fill(); }
}
function door(x, y, closed) {
  // a double door seen from outside; the leaves swing shut as `closed` goes to 1
  ctx.fillStyle = '#0d1013'; ctx.fillRect(x, y, 240, 330);
  const open = 1 - closed;
  for (const side of [-1, 1]) {
    const w = 120 * (0.25 + 0.75 * closed), xx = side < 0 ? x : x + 240 - w;
    ctx.fillStyle = '#5a4434'; ctx.fillRect(xx, y, w, 330);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3; ctx.strokeRect(xx + 12 * closed, y + 20, w - 24 * closed, 130); ctx.strokeRect(xx + 12 * closed, y + 175, w - 24 * closed, 130);
  }
  if (open > 0.02) A(open, () => { ctx.fillStyle = 'rgba(228,180,94,0.25)'; ctx.fillRect(x + 30, y, 180, 330); });
  ctx.strokeStyle = C.stone; ctx.lineWidth = 6; ctx.strokeRect(x - 6, y - 6, 252, 342);
}
function plot301(t, { rows = 1, tags = 0, names = null, grass = 1, y0 = 520, x0 = 1000, w = 800, sign = 1 } = {}) {
  // rows of mounds in the cemetery's far corner, receding; a post with the plot's number
  const nRows = 4;
  for (let r = nRows - 1; r >= 0; r--) {
    const a = clamp(rows * nRows - r);
    if (a <= 0) continue;
    const sc = 1 - r * 0.16, yy = y0 - r * 72, cnt = 6 + r;
    A(a, () => {
      for (let i = 0; i < cnt; i++) {
        const xx = x0 + (w * (i + 0.5)) / cnt + (r % 2) * 18;
        const nm = r === 0 && names ? names[i] : null;
        mound(xx, yy, 96 * sc, { tag: r === 0 && i < 5 ? tags : 0, name: nm, grass });
      }
    });
  }
  if (sign > 0) A(sign, () => {
    ctx.fillStyle = C.woodDark; ctx.fillRect(x0 - 40, y0 - 210, 8, 210);
    rrectFill(x0 - 90, y0 - 270, 108, 62, 8, C.paper);
    txt('301', x0 - 36, y0 - 238, { size: 40, weight: 800, family: HEAD, color: C.paperInk, align: 'center' });
  });
}
const NAMES = ['Imre Nagy', 'Pál Maléter', 'Miklós Gimes', 'Géza Losonczy', 'József Szilágyi'];
function partTrial(t) {
  // A: the embassy, the promise, the bus
  A(span(t, s('n1', -1.0), e('n4', 0.8), 0.8, 0.7), () => {
    ctx.fillStyle = 'rgba(236,230,214,0.1)'; ctx.fillRect(120, 712, 1690, 8);
    embassy(220, 460);
    A(eout(seg(t, s('n1', 0.3), s('n1', 1.2))), () => {
      txt('Yugoslav embassy', 390, 262, { size: 36, weight: 700, color: C.ink, align: 'center' });
      txt('4 November 1956', 390, 200, { size: fit('4 November 1956', 420, 44, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.teal, align: 'center' });
      for (let i = 0; i < 6; i++) person(268 + i * 50, 700, 16, C.ink);
    });
    A(eout(seg(t, s('n2', 0.2), s('n2', 1.2))), () => {
      rrectFill(1150, 170, 650, 230, 16, C.card, C.steel, 2);
      txt('Pál Maléter', 1180, 220, { size: 46, weight: 800, family: HEAD });
      txtFit('defence minister', 1180, 272, 590, { size: 36, color: C.soft });
      para('arrested at talks with the Soviet army, the night of 3 November', 1180, 312, 590, { size: 34, color: C.ink });
    });
    const pr = eout(seg(t, s('n3', 0.2), s('n3', 1.2)));
    A(pr * (1 - seg(t, s('n4', 0.0), s('n4', 1.0))), () => {
      sheet(640, 420, 300, 190, 0.04);
      txt('in writing', 790, 470, { size: 34, weight: 800, color: C.paperInk, align: 'center' });
      para('free to go home', 790, 520, 260, { size: 34, color: C.paperInk, align: 'center' });
    });
    A(eout(seg(t, s('n3', 2.6), s('n3', 3.4))), () => txt('22 November 1956', 1150, 470, { size: fit('22 November 1956', 640, 48, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.teal }));
    // the bus arrives, Soviet armoured cars join, and they drive away to the right
    const arrive = eio(seg(t, s('n3', 2.4), s('n3', 4.0))), leave = eio(seg(t, s('n4', 2.0), e('n4', 0.4)));
    const bx = lerp(-260, 600, arrive) + leave * 1500;
    if (arrive > 0) { ctx.save(); ctx.beginPath(); ctx.rect(96, 0, 1728, H); ctx.clip(); bus(bx, 710);
      const cars = eout(seg(t, s('n4', 0.2), s('n4', 1.6)));
      if (cars > 0) { armoured(bx - 210 - (1 - cars) * 400, 710); armoured(bx + 250 + (1 - cars) * 900, 710); for (let i = 0; i < 3; i++) A(cars * (1 - seg(t, s('n4', 1.6), s('n4', 2.2))), () => person(bx - 20 - i * 34, 712, 18, C.steel)); }
      ctx.restore(); }
    A(eout(seg(t, s('n4', 2.4), s('n4', 3.4))), () => {
      arrow(1300, 600, 1500, 560, 1700, 600, 1, C.steel, { w: 6, dash: [14, 10], head: 26 });
      txt('to Romania', 1700, 545, { size: 40, weight: 800, family: HEAD, color: C.ink, align: 'right' });
    });
  });
  // B: the decision, the halted trial, the closed doors
  A(span(t, s('n5', -0.4), e('n7', 0.8), 0.7, 0.7), () => {
    const xs = [300, 820, 1340], Y = 300;
    const steps = [['early 1957', 'the decision: Kádár’s party leaders, with Moscow', s('n5', 0.2)], ['February 1958', 'the trial opens, then halts at Moscow’s request', s('n6', 0.2)], ['June 1958', 'it resumes behind closed doors', s('n6', 3.2)]];
    A(eout(seg(t, s('n5', 0.0), s('n5', 0.8))), () => { ctx.fillStyle = C.faint; ctx.fillRect(xs[0], Y, xs[2] - xs[0] + 300, 4); });
    steps.forEach(([when, what, at], i) => A(eout(seg(t, at, at + 0.8)), () => {
      ctx.fillStyle = i === 2 ? C.teal : C.ink; ctx.beginPath(); ctx.arc(xs[i], Y + 2, 11, 0, TAU); ctx.fill();
      txt(when, xs[i] - 10, Y - 50, { size: fit(when, 470, 44, { weight: 800, family: HEAD }), weight: 800, family: HEAD });
      para(what, xs[i] - 10, Y + 50, 440, { size: 34, color: C.soft });
    }));
    A(eout(seg(t, s('n6', 3.0), s('n6', 3.8))), () => door(1420, 470, eio(seg(t, s('n6', 3.6), e('n6', 0.2)))));
    A(eout(seg(t, s('n7', 0.2), s('n7', 1.0))), () => {
      rrectFill(160, 560, 1160, 250, 16, C.card, C.tealSoft, 2);
      para('“a decisive, if not exclusive, responsibility”', 200, 600, 1080, { size: 44, weight: 700, color: C.ink, family: TEXT });
      txt('the historian János Rainer, on Kádár', 200, 760, { size: 34, color: C.dim });
    });
  });
  // C: the verdict and the last word
  A(span(t, s('n8', -0.4), e('n10', 0.8), 0.7, 0.7), () => {
    sheet(170, 200, 700, 640, 0.0);
    txt('15 June 1958', 520, 268, { size: fit('15 June 1958', 600, 50, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.paperInk, align: 'center' });
    txt('the verdict', 520, 320, { size: 34, weight: 500, color: '#5a5248', align: 'center' });
    const rows = [['Imre Nagy', 'death'], ['Pál Maléter', 'death'], ['Miklós Gimes', 'death'], ['five others', 'prison']];
    rows.forEach(([who, what], i) => A(eout(seg(t, s('n8', 1.2 + i * 0.7), s('n8', 1.9 + i * 0.7))), () => {
      const y = 410 + i * 92;
      txt(who, 220, y, { size: fit(who, 400, 42, { weight: 700 }), weight: 700, color: C.paperInk });
      txt(what, 820, y, { size: 40, weight: 800, color: i < 3 ? C.red : '#5a5248', align: 'right' });
      ctx.fillStyle = 'rgba(43,39,34,0.15)'; ctx.fillRect(220, y + 40, 600, 2);
    }));
    const side = [['Géza Losonczy', 'died in custody, December 1957', s('n9', 1.2)], ['József Szilágyi', 'executed in April 1958', s('n9', 3.2)]];
    side.forEach(([who, what, at], i) => A(eout(seg(t, at, at + 0.8)) * (1 - seg(t, s('n10', 0.0), s('n10', 0.8))), () => {
      const y = 280 + i * 190;
      rrectFill(980, y - 50, 800, 150, 14, C.card, C.steel, 2);
      txt(who, 1010, y, { size: 42, weight: 700 });
      txtFit(what, 1010, y + 54, 740, { size: 34, color: C.soft });
    }));
    A(eout(seg(t, s('n10', 1.0), s('n10', 2.0))), () => {
      txt('„Kegyelmet nem kérek.”', 1390, 400, { size: fit('„Kegyelmet nem kérek.”', 820, 66, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.teal, align: 'center' });
      // in Hungarian his words need no translation, so the attribution moves up
      const trans = Kit.tr('“I do not ask for clemency.”');
      if (trans) txtFit('“I do not ask for clemency.”', 1390, 480, 820, { size: 42, weight: 500, color: C.ink, align: 'center' });
      txt('Imre Nagy, 15 June 1958', 1390, trans ? 560 : 480, { size: 34, color: C.dim, align: 'center' });
    });
  });
  // D: 16 June 1958, the prison yard, plot 301
  A(span(t, s('n11', -0.4), DURATION, 0.7, 0.7), () => {
    const yard = 1 - seg(t, s('n13', 0.0), s('n13', 1.2));
    calendar(300, 200, '16 June', '1958', { w: 260, col: C.steelDark, a: eout(seg(t, s('n11', 0.0), s('n11', 0.8))), sub: 'at dawn' });
    A(yard * eout(seg(t, s('n11', 1.0), s('n11', 2.0))), () => {
      ctx.fillStyle = '#262b31'; ctx.fillRect(700, 260, 1100, 300);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(700, 300 + i * 50); ctx.lineTo(1800, 300 + i * 50); ctx.stroke(); }
      ctx.fillStyle = '#1e2227'; ctx.fillRect(700, 560, 1100, 170);
      for (let i = 0; i < 3; i++) dashed(() => { ctx.beginPath(); ctx.ellipse(980 + i * 270, 660, 100, 26, 0, Math.PI, TAU); ctx.closePath(); }, { w: 3 });
      txt('a prison yard in Budapest', 1250, 790, { size: 36, color: C.soft, align: 'center' });
      txt('no mark, no name', 1250, 840, { size: 36, weight: 700, color: C.teal, align: 'center' });
    });
    A(yard * eout(seg(t, s('n12', 0.2), s('n12', 1.0))), () => para('the trial made public only when the executions were announced', 140, 520, 400, { size: 34, color: C.ink }));
    const pl = eout(seg(t, s('n13', 0.6), s('n13', 1.8)));
    A(pl, () => {
      txt('1961', 1300, 200, { size: 64, weight: 800, family: HEAD, color: C.teal, align: 'center' });
      txtFit('moved in secret, buried under false names', 1300, 260, 860, { size: 36, color: C.soft, align: 'center' });
      plot301(t, { rows: eout(seg(t, s('n13', 0.8), s('n13', 4.4))), tags: eout(seg(t, s('n13', 4.0), s('n13', 5.0))), x0: 920, w: 880, y0: 760 });
    });
    A(eout(seg(t, s('n13', 4.2), s('n13', 5.2))), () => para('the farthest corner: many of those executed after 1956, in graves without names', 140, 520, 420, { size: 34, color: C.ink }));
  });
  ribbon(yearAt(t, [[s('n1'), 1956.84], [s('n5'), 1957.1], [s('n6'), 1958.1], [s('n8'), 1958.45], [s('n13'), 1961.15]]), 1);
}

// ---------- 4: the bargain ----------
const WAGES = [[1960, 100], [1965, 109], [1970, 129], [1975, 152], [1980, 158], [1985, 151], [1990, 142]];
function scales(cx, cy, tilt, a = 1) {
  A(a, () => {
    ctx.strokeStyle = C.stone; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 300); ctx.moveTo(cx - 90, cy + 300); ctx.lineTo(cx + 90, cy + 300); ctx.stroke();
    const L = 360, dx = Math.cos(tilt) * L, dy = Math.sin(tilt) * L;
    ctx.beginPath(); ctx.moveTo(cx - dx, cy - dy); ctx.lineTo(cx + dx, cy + dy); ctx.stroke();
    ctx.fillStyle = C.stone; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, TAU); ctx.fill();
    for (const sd of [-1, 1]) {
      const px = cx + sd * dx, py = cy + sd * dy;
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 80, py + 90); ctx.moveTo(px, py); ctx.lineTo(px + 80, py + 90); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(px, py + 92, 100, 16, 0, 0, Math.PI); ctx.fillStyle = C.stone; ctx.fill();
    }
  });
  return [cx - Math.cos(tilt) * 360, cy - Math.sin(tilt) * 360, cx + Math.cos(tilt) * 360, cy + Math.sin(tilt) * 360];
}
function book(x, y, w, h, word, { a = 1, old = null, strike = 0, wordCol = C.red, oldCol = C.red } = {}) {
  A(a, () => {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x + 10, y + 14, w, h);
    ctx.fillStyle = C.paper; ctx.fillRect(x, y, w / 2 - 4, h); ctx.fillRect(x + w / 2 + 4, y, w / 2 - 4, h);
    ctx.fillStyle = '#5a4434'; ctx.fillRect(x + w / 2 - 4, y - 6, 8, h + 12);
    txt('HISTORY', x + w / 4, y + 50, { size: 34, weight: 800, family: HEAD, color: '#6a6258', align: 'center', spacing: '3px' });
    txt('1956', x + w / 4, y + 120, { size: 64, weight: 800, family: HEAD, color: C.paperInk, align: 'center' });
    ctx.fillStyle = 'rgba(43,39,34,0.2)';
    for (let i = 0; i < 6; i++) ctx.fillRect(x + 40, y + 190 + i * 30, w / 2 - 90 - (i % 2) * 40, 10);
    for (let i = 0; i < 9; i++) if (i !== 3) ctx.fillRect(x + w / 2 + 40, y + 50 + i * 34, w / 2 - 90 - (i % 3) * 30, 10);
    const cx = x + (3 * w) / 4, cy = y + 50 + 3 * 34 + 6;
    if (old) A(1 - strike * 0.6, () => { const sz = fit(old, w / 2 - 50, 40, { weight: 800 }); txt(old, cx, cy - (word ? 40 : 0) * strike, { size: sz, weight: 800, color: oldCol, align: 'center' });
      if (strike > 0) { const ww = textW(old, { size: sz, weight: 800 }); ctx.fillStyle = C.paperInk; ctx.fillRect(cx - ww / 2, cy - 2 - 40 * strike, ww * strike, 4); } });
    if (word) A(old ? strike : 1, () => txt(word, cx, cy + (old ? 30 : 0), { size: fit(word, w / 2 - 50, 40, { weight: 800 }), weight: 800, color: wordCol, align: 'center' }));
  });
}
function partBargain(t) {
  // A: 1956 to 1988
  A(span(t, s('k1', -1.0), e('k1', 0.8), 0.8, 0.7), () => {
    const p = eio(seg(t, s('k1', 0.3), s('k1', 2.4))), xa = 220, xb = 1700, Y = 470;
    txtFit('Kádár leads the ruling party', 220, 330, 1300, { size: 48, weight: 800, family: HEAD });
    ctx.fillStyle = C.faint; ctx.fillRect(xa, Y - 22, xb - xa, 44);
    ctx.fillStyle = C.teal; ctx.fillRect(xa, Y - 22, (xb - xa) * p, 44);
    txt('1956', xa, Y + 70, { size: 40, weight: 800, family: HEAD });
    A(seg(p, 0.9, 1), () => txt('1988', xb, Y + 70, { size: 40, weight: 800, family: HEAD, align: 'right' }));
    const yx = (yr) => lerp(xa, xb, (yr - 1956) / 32);
    A(eout(seg(t, s('k1', 2.6), s('k1', 3.6))), () => {
      for (const [a, b] of [[1956.85, 1958.08], [1961.7, 1965.5]]) { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(yx(a), Y + 120); ctx.lineTo(yx(a), Y + 108); ctx.lineTo(yx(b), Y + 108); ctx.lineTo(yx(b), Y + 120); ctx.stroke(); }
      txt('prime minister', yx(1958.5), Y + 165, { size: 34, weight: 700, color: C.soft, align: 'left' });
      txt('twice', yx(1958.5), Y + 210, { size: 34, color: C.dim });
    });
  });
  // B: the bargain: the slogan, the scales, the amnesty
  A(span(t, s('k2', -0.4), e('k4', 1.0), 0.7, 0.7), () => {
    A(eout(seg(t, s('k2', 0.3), s('k2', 1.2))), () => {
      txt('“Whoever is not against us is with us.”', W / 2, 190, { size: fit('“Whoever is not against us is with us.”', 1500, 54, { weight: 800, family: HEAD }), weight: 800, family: HEAD, align: 'center' });
      txt('János Kádár, December 1961', W / 2, 250, { size: 34, color: C.dim, align: 'center' });
    });
    const sa = eout(seg(t, s('k3', 0.0), s('k3', 0.8)));
    const tilt = lerp(0, 0.16, eio(seg(t, s('k3', 1.0), s('k3', 2.4)))) * (1 - eio(seg(t, s('k4', 0.6), s('k4', 2.2))));
    const [lx, ly, rx2, ry] = scales(W / 2, 400, tilt, sa);
    A(sa * eout(seg(t, s('k3', 1.2), s('k3', 2.2))), () => {
      txt('December 1962', lx, ly + 150, { size: 38, weight: 800, family: HEAD, color: C.teal, align: 'center' });
      para('the UN drops “the Hungarian question”', lx, ly + 200, 420, { size: 34, align: 'center' });
    });
    A(sa * eout(seg(t, s('k4', 0.4), s('k4', 1.4))), () => {
      txt('March 1963', rx2, ry + 150, { size: 38, weight: 800, family: HEAD, color: C.teal, align: 'center' });
      para('an amnesty: most go free', rx2, ry + 200, 420, { size: 34, align: 'center' });
    });
    A(eout(seg(t, s('k4', 3.2), s('k4', 4.2))), () => txt('several hundred stay in prison', W / 2, 785, { size: 36, weight: 700, color: C.soft, align: 'center' }));
  });
  // C: 1968 and the wages
  A(span(t, s('k6', -0.4), e('k8', 0.8), 0.7, 0.7), () => {
    const X0 = 240, X1 = 1300, Y0 = 820, Y1 = 290, cx = (yr) => lerp(X0, X1, (yr - 1960) / 30), cy = (v) => lerp(Y0, Y1, (v - 80) / 90);
    txt('real wages, 1960 = 100', X0, 210, { size: 42, weight: 800, family: HEAD });
    txt('Hungarian Statistical Office (KSH)', X0, 262, { size: 32, color: C.dim });
    ctx.fillStyle = C.faint; ctx.fillRect(X0, Y0, X1 - X0, 3);
    for (const yr of [1960, 1970, 1980, 1990]) txt(String(yr), cx(yr), Y0 + 40, { size: 32, weight: 700, color: C.dim, align: 'center' });
    ctx.strokeStyle = 'rgba(236,230,214,0.12)'; ctx.lineWidth = 1; for (const v of [100, 150]) { ctx.beginPath(); ctx.moveTo(X0, cy(v)); ctx.lineTo(X1, cy(v)); ctx.stroke(); txt(String(v), X0 - 16, cy(v), { size: 32, color: C.dim, align: 'right' }); }
    // 1968
    A(eout(seg(t, s('k6', 0.2), s('k6', 1.0))), () => { dashed(() => { ctx.beginPath(); ctx.moveTo(cx(1968), Y0); ctx.lineTo(cx(1968), Y1 + 30); }, { color: C.candle, w: 2 }); txt('1968', cx(1968) + 12, Y1 + 44, { size: 34, weight: 800, family: HEAD, color: C.candle }); });
    A(eout(seg(t, s('k6', 0.6), s('k6', 1.4))), () => para('a reform brings some market rules into the planned economy', 1400, 330, 420, { size: 36, color: C.ink }));
    const p = eio(seg(t, s('k7', 0.2), e('k7', -0.6)));
    if (p > 0) {
      ctx.strokeStyle = C.teal; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath();
      const end = 1960 + 30 * p;
      WAGES.forEach(([yr, v], i) => { if (yr > end && i) { const [y0, v0] = WAGES[i - 1]; if (y0 < end) ctx.lineTo(cx(end), cy(lerp(v0, v, (end - y0) / (yr - y0)))); return; } i ? ctx.lineTo(cx(yr), cy(v)) : ctx.moveTo(cx(yr), cy(v)); });
      ctx.stroke();
      WAGES.forEach(([yr, v]) => { if (yr <= end + 0.01) { ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(cx(yr), cy(v), 8, 0, TAU); ctx.fill(); } });
      for (const [yr, v] of [[1975, 152], [1980, 158], [1990, 142]]) if (end >= yr) A(seg(end, yr, yr + 1.5), () => txt(String(v), cx(yr), cy(v) - 34, { size: 34, weight: 800, color: C.ink, align: 'center' }));
    }
    A(eout(seg(t, s('k8', 0.2), s('k8', 1.0))), () => {
      txt('“goulash communism”', 1400, 600, { size: fit('“goulash communism”', 420, 44, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.candle });
      para('a softer dictatorship, but a dictatorship still', 1400, 660, 420, { size: 36, color: C.ink });
    });
  });
  // D: the silence
  A(span(t, s('k9', -0.4), DURATION, 0.7, 0.7), () => {
    A(eout(seg(t, s('k9', 0.0), s('k9', 0.8))), () => txt('silence', 160, 200, { size: 64, weight: 800, family: HEAD, color: C.teal }));
    book(160, 280, 760, 440, 'the regrettable events', { a: eout(seg(t, s('k9', 0.6), s('k9', 1.6))), old: '“counter-revolution”', strike: eio(seg(t, s('k11', 0.2), s('k11', 1.4))), wordCol: '#5a5248' });
    A(eout(seg(t, e('k9', -1.2), e('k9', -0.2))), () => {
      plot301(t, { rows: 1, tags: 1, x0: 1060, w: 720, y0: 690, sign: 1 });
      para('no names on the graves, false ones in the books', 1060, 760, 720, { size: 34, color: C.soft });
    });
    A(eout(seg(t, s('k11', 2.6), s('k11', 3.4))), () => {
      candle(200, 860, 22, t, 0); txt('public commemoration: forbidden', 240, 830, { size: 36, weight: 700, color: C.ink });
    });
  });
  const yr = yearAt(t, [[s('k1'), 1956.0], [s('k1', 0.6), 1988.4], [s('k2'), 1961.93], [s('k3'), 1962.97], [s('k4'), 1963.22], [s('k6'), 1968], [s('k7', 0.4), 1975], [s('k7', 3), 1985], [s('k9'), 1970], [s('k11'), 1985]]);
  ribbon(yr, 1, { band: [1956.85, 1988.4] });
}

// ---------- 5: breaking the silence ----------
function partSilence(t) {
  // A: 1988
  A(span(t, s('b1', -1.0), e('b3', 0.8), 0.8, 0.7), () => {
    A(eout(seg(t, s('b1', 0.6), s('b1', 1.4))), () => {
      txt('May 1988', 160, 210, { size: 52, weight: 800, family: HEAD, color: C.ink });
      txtFit('Kádár is replaced as party leader', 160, 270, 760, { size: 38, color: C.soft });
    });
    A(eout(seg(t, s('b2', 0.2), s('b2', 1.0))), () => {
      const what = 'former prisoners of 1956 demand rehabilitation', n = para(what, 0, 0, 740, { size: 34, dry: true });
      rrectFill(1000, 160, 800, 118 + n * 42, 16, C.card, C.teal, 2);
      txtFit('Committee for Historical Justice', 1030, 215, 740, { size: 42, weight: 800, family: HEAD, color: C.teal });
      para(what, 1030, 268, 740, { size: 34, color: C.ink });
    });
    // 16 June 1988: candles at the nameless graves
    A(eout(seg(t, s('b3', 0.2), s('b3', 1.2))), () => {
      txt('16 June 1988', 160, 430, { size: 42, weight: 800, family: HEAD, color: C.candle });
      for (let i = 0; i < 5; i++) { mound(230 + i * 140, 700, 110, { tag: 1 }); candle(230 + i * 140, 704, 12, t, eout(seg(t, s('b3', 1.0 + i * 0.3), s('b3', 1.6 + i * 0.3))), i); }
      txtFit('at the nameless graves', 160, 790, 760, { size: 36, color: C.soft });
    });
    // in the city: a line of police facing the demonstrators (schematic)
    A(eout(seg(t, s('b3', 3.6), s('b3', 4.6))), () => {
      for (let i = 0; i < 10; i++) person(1060 + i * 50 + (i % 2) * 8, 610 - (i % 3) * 14, 20, C.candle);
      for (let i = 0; i < 9; i++) person(1060 + i * 58, 770, 26, C.steel);
      txt('demonstrators', 1600, 585, { size: 34, weight: 700, color: C.candle });
      txt('police', 1600, 750, { size: 34, weight: 700, color: C.stone });
      txt('in the city', 1050, 470, { size: 38, weight: 800, family: HEAD, color: C.ink });
    });
  });
  // B: "popular uprising"; the graves opened
  A(span(t, s('b5', -0.4), e('b6', 0.8), 0.7, 0.7), () => {
    book(160, 280, 760, 440, 'popular uprising', { a: 1, old: 'the regrettable events', strike: eio(seg(t, s('b5', 2.2), s('b5', 3.4))), wordCol: '#3a7f78', oldCol: '#5a5248' });
    A(eout(seg(t, s('b5', 2.4), s('b5', 3.2))), () => { txt('28 January 1989', 160, 200, { size: 46, weight: 800, family: HEAD, color: C.teal }); txt('Imre Pozsgay, minister', 160, 790, { size: 34, color: C.soft }); });
    A(eout(seg(t, s('b6', 0.0), s('b6', 1.0))), () => {
      plot301(t, { rows: 1, tags: 1, x0: 1060, w: 720, y0: 650 });
      A(eout(seg(t, s('b6', 1.4), s('b6', 2.4))), () => { ctx.fillStyle = C.tealFaint; ctx.fillRect(1040, 520, 760, 160); });
      txt('spring 1989', 1060, 240, { size: 46, weight: 800, family: HEAD, color: C.teal });
      txtFit('exhumed and identified', 1060, 300, 720, { size: 38, color: C.ink });
    });
  });
  // C: 16 June 1989: the funeral, the speeches, the names
  A(span(t, s('b7', -0.4), e('b9', 0.9), 0.7, 0.8), () => {
    heroesSquare(t, { coffins: 1, crowd: 1, empty: 0.6 });
    A(eout(seg(t, s('b7', 0.2), s('b7', 1.0))), () => {
      txt('16 June 1989', 110, 160, { size: fit('16 June 1989', 400, 60, { weight: 800, family: HEAD }), weight: 800, family: HEAD });
      txt('live on radio', 110, 230, { size: 36, color: C.soft }); txt('and television', 110, 275, { size: 36, color: C.soft });
      // broadcast waves
      ctx.strokeStyle = C.teal; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; A(1 - ph, () => { ctx.beginPath(); ctx.arc(1630, 210, 20 + ph * 90, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke(); }); }
      ctx.fillStyle = C.teal; ctx.fillRect(1626, 210, 8, 60);
    });
    A(eout(seg(t, s('b8', 0.2), s('b8', 1.0))), () => { chip('Soviet troops out', 1600, 400, { size: 34, color: C.ink, line: C.teal }); chip('free elections', 1600, 480, { size: 34, color: C.ink, line: C.teal }); });
    A(eout(seg(t, s('b9', 0.3), s('b9', 1.1))), () => {
      // the card grows with the text (the Hungarian runs to more lines)
      const say = 'for the young: democracy and communism are incompatible', n = para(say, 0, 0, 360, { size: 32, dry: true });
      rrectFill(110, 320, 400, 112 + n * 40, 16, C.card, C.teal, 2);
      txt('Viktor Orbán', 135, 362, { size: 36, weight: 800, family: HEAD, color: C.teal });
      para(say, 135, 408, 360, { size: 32, color: C.ink });
    });
  });
  A(span(t, s('b10', -0.4), e('b10', 1.0), 0.7, 0.8), () => {
    txt('plot 301', 160, 210, { size: 52, weight: 800, family: HEAD, color: C.ink });
    txtFit('the names of the executed read out', 160, 270, 1000, { size: 38, color: C.soft });
    const named = seg(t, s('b10', 1.4), e('b10', -0.4));
    const names = NAMES.map((n, i) => (named * 5 > i ? n : null));
    plot301(t, { rows: 1, tags: 1, names, x0: 260, w: 1500, y0: 700, sign: 1 });
    A(eout(seg(t, e('b10', -1.0), e('b10', 0.0))), () => txt('with their names', W / 2, 820, { size: 44, weight: 800, family: HEAD, color: C.teal, align: 'center' }));
  });
  // D: 6 July 1989
  A(span(t, s('b11', -0.4), DURATION, 0.7, 0.7), () => {
    calendar(560, 260, '6 July', '1989', { w: 300, col: C.red, a: eout(seg(t, s('b11', 0.0), s('b11', 0.8))) });
    A(eout(seg(t, s('b11', 0.6), s('b11', 1.4))), () => { para('the Supreme Court annuls the verdict of 1958', 900, 320, 880, { size: 42, weight: 700, color: C.teal }); });
    A(eout(seg(t, s('b11', 3.2), s('b11', 4.0))), () => { txtFit('the same day, Kádár dies', 900, 470, 900, { size: 42, weight: 700, color: C.soft }); });
  });
  ribbon(yearAt(t, [[s('b1'), 1988.38], [s('b3'), 1988.46], [s('b5'), 1989.08], [s('b6'), 1989.3], [s('b7'), 1989.46], [s('b11'), 1989.51]]), 1);
}

// ---------- 6: remembrance ----------
function parliament(cx, by) {
  ctx.fillStyle = '#323a44';
  ctx.fillRect(cx - 560, by - 150, 1120, 150);
  for (let i = -6; i <= 6; i++) { if (i === 0) continue; const x = cx + i * 84; ctx.beginPath(); ctx.moveTo(x - 10, by - 150); ctx.lineTo(x, by - 200); ctx.lineTo(x + 10, by - 150); ctx.closePath(); ctx.fill(); }
  ctx.fillRect(cx - 150, by - 250, 300, 100);
  ctx.beginPath(); ctx.moveTo(cx - 120, by - 250); ctx.quadraticCurveTo(cx - 120, by - 380, cx, by - 400); ctx.quadraticCurveTo(cx + 120, by - 380, cx + 120, by - 250); ctx.closePath(); ctx.fill();
  ctx.fillRect(cx - 6, by - 470, 12, 72);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sx * 190 - 14, by - 150); ctx.lineTo(cx + sx * 190, by - 300); ctx.lineTo(cx + sx * 190 + 14, by - 150); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = 'rgba(228,180,94,0.3)'; for (let i = 0; i < 18; i++) ctx.fillRect(cx - 530 + i * 61, by - 110, 22, 40);
  // the balcony
  ctx.fillStyle = '#39414b'; ctx.fillRect(cx - 90, by - 70, 180, 14);
}
function tank(x, y, sc = 1) {
  ctx.fillStyle = C.steelDark; k.rrect(x - 70 * sc, y - 26 * sc, 140 * sc, 30 * sc, 12 * sc); ctx.fill();
  ctx.fillStyle = C.steel; ctx.fillRect(x - 30 * sc, y - 46 * sc, 60 * sc, 22 * sc); ctx.fillRect(x + 30 * sc, y - 39 * sc, 52 * sc, 7 * sc);
}
const CANDLES = ['fighters', 'bystanders', 'Hungarian soldiers', 'Soviet soldiers', 'victims of the ÁVH', 'ÁVH men lynched by crowds'];
function partRemember(t) {
  // A: the Republic
  A(span(t, s('m1', -1.0), e('m2', 0.8), 0.8, 0.7), () => {
    A(eout(seg(t, s('m1', 0.0), s('m1', 1.2))), () => parliament(W / 2, 700));
    A(eout(seg(t, s('m1', 0.4), s('m1', 1.2))), () => {
      txt('23 October 1989', 140, 190, { size: fit('23 October 1989', 600, 56, { weight: 800, family: HEAD }), weight: 800, family: HEAD });
      txtFit('33 years after 23 October 1956', 140, 250, 600, { size: 34, color: C.soft });
    });
    const sw = eio(seg(t, s('m1', 3.0), s('m1', 4.4)));
    A(eout(seg(t, s('m1', 1.6), s('m1', 2.4))), () => {
      const old = 'People’s Republic', sz = fit(old, 640, 44, { weight: 800 });
      A(1 - sw * 0.6, () => { txt(old, 1780, 190, { size: sz, weight: 800, color: C.soft, align: 'right' }); const ww = textW(old, { size: sz, weight: 800 }); ctx.fillStyle = C.red; ctx.fillRect(1780 - ww, 188, ww * sw, 5); });
      A(sw, () => txtFit('Republic of Hungary', 1780, 250, 640, { size: 46, weight: 800, family: HEAD, color: C.teal, align: 'right' }));
    });
    const cr = eio(seg(t, s('m2', 0.4), e('m2', 0.4)));
    if (cr > 0) { const n = Math.floor(900 * cr); ctx.fillStyle = 'rgba(236,230,214,0.5)'; for (let i = 0; i < n; i++) { const p = CROWD[i]; if (p.y > 896) continue; ctx.beginPath(); ctx.arc(p.x, p.y + 6, p.r * 0.9, 0, TAU); ctx.fill(); } }
    A(eout(seg(t, s('m2', 0.2), s('m2', 1.0))), () => {
      ctx.strokeStyle = C.teal; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(W / 2 + 90, 632); ctx.lineTo(W / 2 + 320, 360); ctx.lineTo(W / 2 + 350, 360); ctx.stroke();
      txt('Mátyás Szűrös', W / 2 + 360, 345, { size: 38, weight: 800, family: HEAD, color: C.ink });
      para('acting head of state, from the balcony', W / 2 + 360, 392, 470, { size: 32, color: C.soft });
    });
  });
  // B: 1990, 1991, 35 years
  A(span(t, s('m3', -0.4), e('m5', 0.8), 0.7, 0.7), () => {
    const items = [['1990', 'free elections', s('m3', 0.2)], ['1990', '23 October, a national day', s('m3', 2.0)]];
    items.forEach(([yr, what, at], i) => A(eout(seg(t, at, at + 0.8)), () => {
      const y = 260 + i * 150;
      txt(yr, 160, y, { size: 52, weight: 800, family: HEAD, color: C.teal });
      txtFit(what, 330, y + 2, 520, { size: 40, weight: 700 });
    }));
    const box = { x: 1000, y: 230, w: 780 };
    A(eout(seg(t, s('m4', 0.0), s('m4', 0.8))), () => {
      const P = hungary(box);
      const go = eio(seg(t, s('m4', 0.6), e('m4', 0.6)));
      for (let i = 0; i < 3; i++) { const [x, y] = P([lerp(19.9 + i * 0.45, 23.6, go), 47.45 + (i - 1) * 0.28]); A(1 - seg(go, 0.75, 1), () => tank(x, y, 0.55)); }
      arrow(...P([20.5, 47.0]), ...P([22.0, 47.3]), ...P([23.3, 47.9]), 1, C.steel, { w: 4, dash: [12, 8], head: 20 });
      txt('19 June 1991', 160, 560, { size: 46, weight: 800, family: HEAD, color: C.ink });
      txtFit('the last Soviet soldier leaves Hungary', 160, 620, 820, { size: 38, color: C.soft });
    });
    A(eout(seg(t, s('m5', 0.2), s('m5', 1.0))), () => {
      rrectFill(150, 690, 690, 120, 14, C.card, C.teal, 2);
      txtFit('1956, the students’ first demand:', 180, 730, 630, { size: 34, color: C.soft });
      txtFit('Soviet troops out', 180, 778, 630, { size: 40, weight: 800, color: C.ink });
      A(eout(seg(t, s('m5', 2.0), s('m5', 2.8))), () => txt('35 years', rx(1973.5), 806, { size: 36, weight: 800, family: HEAD, color: C.teal, align: 'center' }));
    });
  });
  // C: remembrance today: the flag, the posts, the bridge
  A(span(t, s('m6', -0.4), e('m7', 1.0), 0.7, 0.7), () => {
    A(eout(seg(t, s('m6', 0.0), s('m6', 1.0))), () => {
      ctx.fillStyle = C.stone; ctx.fillRect(230, 200, 8, 600);
      flag(238, 220, 520, 330, { t, amp: 18 });
      txt('23 October', 262, 640, { size: 48, weight: 800, family: HEAD, color: C.ink });
      txtFit('the flag with the hole', 262, 700, 600, { size: 38, color: C.soft });
    });
    const mid = lerp(s('m7'), e('m7'), 0.5), posts = span(t, s('m7', -0.2), mid, 0.8, 0.6), br = eout(seg(t, mid + 0.1, mid + 1.0));
    A(posts, () => {
      for (let i = 0; i < 9; i++) { const x = 1040 + i * 88, y = 720 - (i % 2) * 14; post(x, y, 210 + (i % 3) * 30); mound(x, y + 6, 76, { grass: 0.8 }); }
      txt('plot 301', 1040, 260, { size: 48, weight: 800, family: HEAD, color: C.ink });
      txtFit('a national memorial park; carved grave posts', 1040, 320, 760, { size: 36, color: C.soft });
    });
    A(br, () => {
      const cx = 1410, y = 560;
      ctx.fillStyle = C.water; ctx.fillRect(1000, y + 30, 800, 70);
      ctx.fillStyle = C.wood; ctx.fillRect(cx - 220, y, 440, 34); ctx.fillStyle = C.woodDark;
      for (let i = 0; i < 12; i++) ctx.fillRect(cx - 216 + i * 38, y - 40, 6, 40);
      ctx.fillRect(cx - 220, y - 44, 440, 8);
      txt('the bridge at Andau', 1040, 260, { size: 48, weight: 800, family: HEAD, color: C.ink });
      txtFit('rebuilt in 1996, forty years on', 1040, 320, 760, { size: 36, color: C.soft });
    });
  });
  // D: the candles, and the names
  A(span(t, s('m9', -0.4), DURATION, 0.7, 0.7), () => {
    const fade = 1 - 0.5 * seg(t, s('m10', 0.0), s('m10', 1.0));
    CANDLES.forEach((lab, i) => {
      const x = 330 + i * 252, lit = eout(seg(t, s('m9', 1.0 + i * 0.9), s('m9', 1.6 + i * 0.9)));
      A(fade, () => { candle(x, 520, 26, t, lit, i); A(lit, () => para(lab, x, 590, 230, { size: 32, weight: 700, color: C.ink, align: 'center' })); });
    });
    A(span(t, s('m10', 0.2), e('m10', 0.8), 0.7, 0.8), () => {
      txt(fmt(200000), 560, 790, { size: 64, weight: 800, family: HEAD, color: C.candle, align: 'center' });
      txtFit('lives begun again abroad', 560, 845, 640, { size: 36, color: C.ink, align: 'center' });
      txt('30', 1360, 790, { size: 64, weight: 800, family: HEAD, color: C.teal, align: 'center' });
      txtFit('years of silence at home', 1360, 845, 640, { size: 36, color: C.ink, align: 'center' });
    });
    const nm = eout(seg(t, s('m11', 0.4), s('m11', 1.4)));
    A(nm, () => {
      ctx.fillStyle = 'rgba(12,14,17,0.6)'; ctx.fillRect(0, 640, W, 300);
      NAMES.forEach((n, i) => {
        const a = eout(seg(t, s('m11', 2.0 + i * 0.5), s('m11', 2.6 + i * 0.5))), x = 290 + i * 335, y = 800;
        A(a, () => { const tw = textW(n, { size: 34, weight: 700 }) + 36; rrectFill(x - tw / 2, y - 30, tw, 60, 10, 'rgba(111,184,176,0.18)', C.teal, 2.5); txt(n, x, y + 1, { size: 34, weight: 700, align: 'center' }); });
      });
    });
  });
  const today = eio(seg(t, s('m6', 0.0), s('m6', 1.4)));
  ribbon(yearAt(t, [[s('m1'), 1989.81], [s('m3'), 1990.3], [s('m4'), 1991.47]]), 1, { today, arc: eio(seg(t, s('m5', 0.2), s('m5', 2.4))) * (1 - seg(t, s('m6', 0), s('m6', 1))) });
}

// ---------- chapter cards and credits ----------
const CARD_YEARS = [null, '1956–1963', '1956–1957', '1956–1961', '1956–1988', '1988–1989', '1989–today'];
function chapterCards(t) {
  CH.forEach((ch, i) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.92, () => { ctx.fillStyle = 'rgba(12,14,17,0.95)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8)), y = 500 + (1 - p) * 18;
      txt(`PART ${ch.n}`, W / 2, y - 120, { size: 36, weight: 700, family: HEAD, color: C.teal, align: 'center', spacing: '8px' });
      const title = ch.title.toUpperCase();
      txt(title, W / 2, y, { size: fit(title, 1640, 116, { weight: 800, family: HEAD, spacing: '2px' }), weight: 800, family: HEAD, align: 'center', spacing: '2px' });
      rule(W / 2, y + 92, 300 * eout(seg(t, ch.at + 0.3, ch.at + 1.3)));
      if (CARD_YEARS[ch.n]) txt(CARD_YEARS[ch.n], W / 2, y + 170, { size: 40, weight: 500, color: C.soft, align: 'center' });
    });
  });
}
const MUSIC = ['“Blue Feather” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Thunderbird” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Aretes” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  '1956 Institute: A per. Nagy Imre és társai (2008) and its lessons on 1956; Rainer M. János (2008);',
  'UN Special Committee on the Problem of Hungary, report (1957);',
  'Hablicsek and Illés (2007); Niessen (2017); Kopyś (2024); KSH, Statistical Yearbook 2023;',
  'Békés and Kecskés (eds.); Szénási, Betekintő (2022); OSA Archivum; NORI (plot 301);',
  'Index; HVG; 444; Telex; Infostart.',
  'Maps are schematic.',
];
function credits(t) {
  ctx.drawImage(BG, 0, 0);
  ctx.fillStyle = 'rgba(10,12,15,0.5)'; ctx.fillRect(0, 0, W, H);
  emblem(W / 2, 128, 100);
  const title = 'What 1956 left behind';
  txt(title, W / 2, 262, { size: fit(title, 1500, 80, { weight: 800, family: HEAD }), weight: 800, family: HEAD, align: 'center' });
  txt('Hungary 1956 · original animation', W / 2, 336, { size: 40, weight: 500, color: C.soft, align: 'center' });
  rule(W / 2, 384, 220);
  txt('MUSIC', W / 2, 440, { size: 32, weight: 800, family: HEAD, color: C.teal, align: 'center', spacing: '5px' });
  MUSIC.forEach((m, j) => txtFit(m, W / 2, 488 + j * 44, 1600, { size: 32, weight: 500, align: 'center' }));
  txt('SOURCES', W / 2, 650, { size: 32, weight: 800, family: HEAD, color: C.teal, align: 'center', spacing: '5px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, 698 + j * 44, 1700, { size: 32, weight: 500, align: 'center', color: j === SOURCES.length - 1 ? C.dim : C.ink }));
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [HEAD, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    const parts = [partOpen, partReprisals, partLeft, partTrial, partBargain, partSilence, partRemember];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    chapterCards(t);
    A(seg(t, e('m11', 1.6), e('m11', 2.6)), () => credits(t));
  },
});
