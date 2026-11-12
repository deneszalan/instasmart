// "Before October: Hungary 1945–1956" („Október előtt: Magyarország 1945–1956”): the long film of Hungary 1956's
// Background section, 16:9, 1920x1080. From the end of the war and the free vote of 1945 to Rákosi's dictatorship and
// Stalin's death in 1953, in six parts. Series look (the six Hungary 1956 films): deep ink ground with a faint paper grain,
// Archivo for titles and headings, Alegreya Sans for everything else, the 1956 flag with the hole as the emblem, a
// tricolour rule under chapter titles, Hungary from the shared outline. This film's accent: slate blue (#7f9cc0); its motif:
// a year ruler along the bottom, 1944 to October 1956, whose marker follows the story towards the revolution.
// Left of the screen the diagram (map, ballot, bars, table, files), right of it the date and a few words, centred.
// The same scene plays the Hungarian version: kit.js swaps every whole string for its labels-fr.json entry, so words
// and numbers are drawn as separate strings, and wrapped text goes through k.rich(), which translates before wrapping.
// Numbers on screen are computed here from the sources' figures (script.mjs's header): vote shares, seats, ministers,
// the doubling of prices, the estimates of false votes, real wages.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt, clamp } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const TAU = Math.PI * 2;
const KEYS = Object.keys(T).sort((a, b) => T[a][0] - T[b][0]);
const nextKey = (key) => KEYS[KEYS.indexOf(key) + 1];

const C = {
  bg0: '#111418', bg1: '#181c22', ink: '#ece6d6', soft: 'rgba(236,230,214,0.76)', faint: 'rgba(236,230,214,0.42)',
  hair: 'rgba(236,230,214,0.16)', ghost: 'rgba(236,230,214,0.07)',
  acc: '#7f9cc0', accDk: '#4a6283', accLt: '#b6c8de', accGlow: 'rgba(127,156,192,0.28)',
  red: '#c63a32', white: '#ece6d6', green: '#3f7f52',
  paper: '#e7e0cd', paper2: '#d9d0b8', pInk: '#2b2823', pSoft: '#6e675b', pLine: 'rgba(43,40,35,0.18)',
  fkgp: '#7aa862', szdp: '#dc8c6c', mkp: '#cf4f43', npp: '#d6b058', pdp: '#9aa3ad', dnp: '#a48fca', mfp: '#c7b183', other: '#737a83',
  soviet: '#d37563', german: '#a3a39a', gold: '#c9a75e', stamp: '#c2453b',
  card: 'rgba(14,17,21,0.94)', panel: 'rgba(31,36,44,0.82)',
};
const HEAD = 'Archivo', TEXT = 'Alegreya Sans';
let k, ctx;
const A = (a, fn) => k.alpha(a, fn);

// ---------- text ----------
function txt(str, x, y, { size = 36, weight = 500, family = TEXT, color = C.ink, align = 'left', spacing = '0px', base = 'middle' } = {}) {
  k.font(weight, size, family);
  k.text(str, x, y, { color, align, base, spacing });
}
function textW(str, { size = 36, weight = 500, family = TEXT, spacing = '0px' } = {}) {
  k.font(weight, size, family); ctx.letterSpacing = spacing; const w = ctx.measureText(str).width; ctx.letterSpacing = '0px'; return w;
}
/** The largest size up to `size` (and not under 32) at which str fits in maxW, measured in the render's language. */
function fit(str, maxW, size, o = {}) { let z = size; while (z > 32 && textW(str, { ...o, size: z }) > maxW) z -= 2; return z; }
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** Wrapped, centred text (translated whole before it is wrapped). */
function para(str, cx, cy, { size = 38, weight = 500, family = TEXT, color = C.soft, maxW = 740, lh = size * 1.25, marks = {} } = {}) {
  k.rich(str, cx, cy, { maxW, size, lh, weight, family, ink: color, marks });
}
/** A decimal the reader's way (95.6, in Hungarian 95,6). */
const dec = (x, d = 1) => x.toLocaleString(window.TR?.locale ?? 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (x, d = 0) => `${d ? dec(x, d) : fmt(x)}%`;

// The right-hand column: rows stacked from y, centred on RCX. A row is [style, text, opts].
const RCX = 1405, RW = 760;
const STY = {
  date: { size: 50, weight: 800, family: HEAD, color: C.accLt, spacing: '3px', lh: 76 },
  big: { size: 128, weight: 800, family: HEAD, color: C.ink, lh: 150 },
  mid: { size: 84, weight: 800, family: HEAD, color: C.ink, lh: 104 },
  h: { size: 46, weight: 700, family: TEXT, color: C.ink, lh: 64 },
  p: { size: 38, weight: 500, family: TEXT, color: C.soft, lh: 50 },
  s: { size: 33, weight: 500, family: TEXT, color: C.faint, lh: 46 },
  q: { size: 56, weight: 'italic 500', family: TEXT, color: C.ink, lh: 70 },
};
function column(y, list, a = 1, cx = RCX) {
  let yy = y;
  for (const r of list) {
    if (!r) continue;
    if (r[0] === 'gap') { yy += r[1]; continue; }
    const st = STY[r[0]], o = r[2] ?? {}, lines = o.lines ?? 1, hgt = st.lh * lines;
    const ra = a * (o.a ?? 1);
    if (ra > 0.001) A(ra, () => {
      if (r[0] === 'date' || r[0] === 'big' || r[0] === 'mid') txtFit(r[1], cx, yy + hgt / 2, o.maxW ?? RW, { size: st.size, weight: st.weight, family: st.family, color: o.color ?? st.color, align: 'center', spacing: st.spacing ?? '0px' });
      else para(r[1], cx, yy + hgt / 2, { size: st.size, weight: st.weight, family: st.family, color: o.color ?? st.color, maxW: o.maxW ?? RW, lh: st.lh, marks: o.marks ?? {} });
    });
    yy += hgt;
  }
  return yy;
}

// ---------- timing ----------
/** Opacity of a beat: from just before its line starts until just before the next line (or `until`) starts. */
function beat(t, key, until = null) {
  const n = nextKey(key);
  const b = until ?? (n ? s(n, -0.2) : DURATION);
  return span(t, s(key, -0.3), b, 0.55, 0.45);
}
/** Eased 0→1 from a line's start (plus d) over dur seconds. */
const from = (t, key, d = 0, dur = 0.8) => eio(seg(t, s(key, d), s(key, d) + dur));
/** Visible from one line's start to another's (inclusive of the later line). */
const during = (t, k1, k2, fi = 0.55, fo = 0.45) => { const n = nextKey(k2); return span(t, s(k1, -0.3), n ? s(n, -0.2) : DURATION, fi, fo); };

// ---------- shapes ----------
function rr(x, y, w, h, r) { k.rrect(x, y, w, h, r); }
function card(x, y, w, h, { bg = C.panel, r = 16, line = null, lw = 2 } = {}) {
  rr(x, y, w, h, r); ctx.fillStyle = bg; ctx.fill();
  if (line) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); }
}
function paper(x, y, w, h, { r = 6, rot = 0, shade = true } = {}) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot);
  if (shade) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; rr(-w / 2 + 8, -h / 2 + 10, w, h, r); ctx.fill(); }
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, C.paper); g.addColorStop(1, C.paper2);
  ctx.fillStyle = g; rr(-w / 2, -h / 2, w, h, r); ctx.fill();
  ctx.restore();
}
function chip(str, cx, cy, { color = C.ink, bg = C.card, size = 32, weight = 700, family = TEXT, line = true, align = 'center' } = {}) {
  const w = textW(str, { size, weight, family }), pad = size * 0.6, h = size * 1.55;
  const x0 = align === 'left' ? cx : align === 'right' ? cx - w - pad * 2 : cx - w / 2 - pad;
  rr(x0, cy - h / 2, w + pad * 2, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  if (line) { ctx.lineWidth = 2.5; ctx.strokeStyle = color; ctx.stroke(); }
  txt(str, x0 + pad + w / 2, cy + 1, { size, weight, color, align: 'center', family });
  return w + pad * 2;
}
/** A rubber stamp: a rotated box with capitals, landing with a small bounce (p from 0 to 1). */
function stamp(str, x, y, p, { col = C.stamp, rot = -0.1, size = 40, maxW = 600 } = {}) {
  if (p <= 0) return;
  const z = fit(str, maxW, size, { weight: 800, family: HEAD, spacing: '3px' });
  const sc = 1 + 0.5 * (1 - eout(clamp(p * 1.6)));
  A(clamp(p * 2.2), () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    const w = textW(str, { size: z, weight: 800, family: HEAD, spacing: '3px' }) + 40;
    ctx.strokeStyle = col; ctx.lineWidth = 5; rr(-w / 2, -z * 0.9, w, z * 1.8, 8); ctx.stroke();
    txt(str, 0, 2, { size: z, weight: 800, family: HEAD, color: col, align: 'center', spacing: '3px' });
    ctx.restore();
  });
}
function arrowHead(x, y, ang, col, size = 22) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x + Math.cos(ang) * size, y + Math.sin(ang) * size);
  ctx.lineTo(x + Math.cos(ang + 2.5) * size, y + Math.sin(ang + 2.5) * size);
  ctx.lineTo(x + Math.cos(ang - 2.5) * size, y + Math.sin(ang - 2.5) * size);
  ctx.closePath(); ctx.fill();
}
/** A polyline drawn up to fraction u of its length, with an arrow head at the tip. */
function trace(pts, u, col, { w = 7, dash = null, head = true, headSize = 20 } = {}) {
  if (u <= 0) return;
  let tot = 0; const L = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let left = u * tot, tip = pts[0], ang = 0;
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i < pts.length && left > 0; i++) {
    const f = Math.min(1, left / L[i - 1]);
    tip = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    ctx.lineTo(...tip); left -= L[i - 1];
  }
  ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  if (head) arrowHead(tip[0] + Math.cos(ang) * 5, tip[1] + Math.sin(ang) * 5, ang, col, headSize);
}
/** A smooth curve through points (Catmull-Rom), as a polyline. */
function smooth(pts, n = 10) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const u = j / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * u + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * u3)));
    }
  }
  out.push(pts.at(-1));
  return out;
}
function star(cx, cy, r, col, rot = -Math.PI / 2) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const rad = i % 2 ? r * 0.42 : r, a = rot + (i * Math.PI) / 5; ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); }
  ctx.closePath(); ctx.fill();
}

// ---------- the series emblem: the 1956 flag, with the hole (or, before it was cut out, the 1949 emblem) ----------
/** Flag of width w centred at (cx, cy). hole: 0..1 (the cut-out circle); emblem: 0..1 (the red-star emblem in the hole). */
function flag(cx, cy, w, { hole = 1 } = {}) {
  const h = w * 0.62, x = cx - w / 2, y = cy - h / 2, bh = h / 3, R = bh * 0.42;
  ctx.fillStyle = C.red; ctx.fillRect(x, y, w, bh + 0.5);
  ctx.fillStyle = C.green; ctx.fillRect(x, y + 2 * bh - 0.5, w, bh + 0.5);
  // the white band, with the hole cut through it (even-odd: the ground shows through)
  ctx.beginPath(); ctx.rect(x, y + bh, w, bh);
  if (hole > 0) { ctx.moveTo(cx + R * hole, cy); ctx.arc(cx, cy, R * hole, 0, TAU, true); }
  ctx.fillStyle = C.white; ctx.fill('evenodd');
  return R;
}
/** The 1949 state emblem, drawn plainly: a sky-blue disc, a wreath of wheat, a hammer, a red star above, a tricolour ribbon. */
function rakosiEmblem(cx, cy, r, rot = 0) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot * 0.5);
  ctx.fillStyle = '#7fb0d9'; ctx.beginPath(); ctx.arc(0, r * 0.05, r * 0.62, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = Math.max(2, r * 0.13); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, r * 0.05, r * 0.8, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, r * 0.05, r * 0.8, -Math.PI * 0.38, Math.PI * 0.38); ctx.stroke();
  // hammer
  ctx.fillStyle = '#3b3a36'; ctx.save(); ctx.rotate(-0.6);
  ctx.fillRect(-r * 0.05, -r * 0.3, r * 0.1, r * 0.62); ctx.fillRect(-r * 0.2, -r * 0.36, r * 0.4, r * 0.15); ctx.restore();
  // ribbon
  ctx.fillStyle = C.red; ctx.fillRect(-r * 0.5, r * 0.76, r * 0.33, r * 0.16);
  ctx.fillStyle = C.white; ctx.fillRect(-r * 0.17, r * 0.76, r * 0.34, r * 0.16);
  ctx.fillStyle = C.green; ctx.fillRect(r * 0.17, r * 0.76, r * 0.33, r * 0.16);
  star(0, -r * 0.86, r * 0.3, C.red);
  ctx.lineCap = 'butt'; ctx.restore();
}
/** The Kossuth arms, drawn plainly: a shield, stripes on the left, the triple hill and double cross on the right. */
function kossuthArms(cx, cy, hgt) {
  const w = hgt * 0.78, x = cx - w / 2, y = cy - hgt / 2;
  const shield = () => {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + hgt * 0.62);
    ctx.quadraticCurveTo(x + w, y + hgt * 0.92, cx, y + hgt); ctx.quadraticCurveTo(x, y + hgt * 0.92, x, y + hgt * 0.62); ctx.closePath();
  };
  ctx.save(); shield(); ctx.clip();
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? C.white : C.red; ctx.fillRect(x, y + (i * hgt) / 8, w / 2, hgt / 8 + 1); }
  ctx.fillStyle = C.red; ctx.fillRect(cx, y, w / 2, hgt);
  ctx.fillStyle = C.green; const hy = y + hgt * 0.82, hx = cx + w / 4;
  ctx.beginPath(); ctx.arc(hx, hy + hgt * 0.06, w * 0.13, Math.PI, 0); ctx.arc(hx - w * 0.14, hy + hgt * 0.12, w * 0.1, Math.PI, 0); ctx.arc(hx + w * 0.14, hy + hgt * 0.12, w * 0.1, Math.PI, 0); ctx.lineTo(cx + w / 2, y + hgt); ctx.lineTo(cx, y + hgt); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.white; const cxs = hx, top = y + hgt * 0.22, bot = hy - hgt * 0.04;
  ctx.fillRect(cxs - w * 0.025, top, w * 0.05, bot - top);
  ctx.fillRect(cxs - w * 0.1, top + hgt * 0.1, w * 0.2, w * 0.045); ctx.fillRect(cxs - w * 0.14, top + hgt * 0.22, w * 0.28, w * 0.045);
  ctx.restore();
  shield(); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.stroke();
}
/** The tricolour rule under chapter titles. */
function tricolour(cx, y, w = 360, hgt = 8) {
  const third = w / 3;
  ctx.fillStyle = C.red; ctx.fillRect(cx - w / 2, y, third, hgt);
  ctx.fillStyle = C.white; ctx.fillRect(cx - w / 2 + third, y, third, hgt);
  ctx.fillStyle = C.green; ctx.fillRect(cx - w / 2 + 2 * third, y, third, hgt);
}

// ---------- background, painted once ----------
let BG = null;
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const b = BG.getContext('2d');
  const g = b.createLinearGradient(0, 0, W * 0.3, H); g.addColorStop(0, C.bg1); g.addColorStop(1, C.bg0);
  b.fillStyle = g; b.fillRect(0, 0, W, H);
  const v = b.createRadialGradient(W / 2, H * 0.45, 200, W / 2, H * 0.5, 1150);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.42)');
  b.fillStyle = v; b.fillRect(0, 0, W, H);
  // a faint paper grain: specks and short fibres, from a fixed seed
  let seed = 1956;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26000; i++) {
    const x = rnd() * W, y = rnd() * H, l = rnd();
    b.fillStyle = l > 0.5 ? `rgba(236,230,214,${0.012 + rnd() * 0.022})` : `rgba(0,0,0,${0.03 + rnd() * 0.05})`;
    b.fillRect(x, y, 1 + rnd() * 1.6, 1 + rnd() * 1.6);
  }
  b.strokeStyle = 'rgba(236,230,214,0.018)'; b.lineWidth = 1;
  for (let i = 0; i < 900; i++) {
    const x = rnd() * W, y = rnd() * H, a = rnd() * TAU, l = 6 + rnd() * 18;
    b.beginPath(); b.moveTo(x, y); b.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); b.stroke();
  }
}

// ---------- Hungary, from the series' outline (explainers/earth-last-fighting-csepel-dunapentele.js) ----------
const OUTLINE = [[16.11, 46.87], [16.28, 47.0], [16.45, 47.15], [16.48, 47.4], [16.43, 47.56], [16.64, 47.75], [16.9, 47.7], [17.05, 47.82], [17.16, 48.01],
  [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.87, 47.82], [19.05, 48.05], [19.48, 48.1], [19.75, 48.2], [20.05, 48.17], [20.3, 48.27], [20.55, 48.53],
  [21.12, 48.5], [21.45, 48.57], [21.72, 48.35], [22.15, 48.41], [22.4, 48.25], [22.9, 47.95], [22.7, 47.82], [22.3, 47.7], [22.02, 47.53], [21.95, 47.12],
  [21.65, 46.95], [21.4, 46.62], [21.05, 46.28], [20.7, 46.18], [20.26, 46.12], [19.85, 46.17], [19.4, 46.05], [18.95, 45.95], [18.8, 45.88], [18.45, 45.77],
  [18.15, 45.78], [17.7, 45.9], [17.4, 45.95], [17.15, 46.15], [16.88, 46.36], [16.6, 46.47], [16.38, 46.63]];
const DANUBE = [[17.16, 48.0], [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.95, 47.75], [19.06, 47.6], [19.05, 47.45], [18.95, 47.2], [18.93, 46.95], [18.92, 46.6], [18.85, 46.2], [18.8, 45.88]];
const TOWN = { budapest: [19.04, 47.5], debrecen: [21.63, 47.53], dunapentele: [18.935, 46.96], szeged: [20.15, 46.25], gyor: [17.63, 47.68], pecs: [18.23, 46.07] };
// Projection: longitude scaled by cos(47.2°) so the country keeps its shape; the map fills x 130–900, y 270–746.
const MK = 164, MKX = MK * Math.cos((47.2 * Math.PI) / 180);
let MAPX = 130, MAPY = 270;
const P = (lon, lat) => [MAPX + (lon - 16.0) * MKX, MAPY + (48.65 - lat) * MK];
function hungary({ a = 1, fill = 'rgba(127,156,192,0.13)', line = C.accLt, river = 1, label = true } = {}) {
  A(a, () => {
    ctx.beginPath(); OUTLINE.forEach(([lo, la], i) => (i ? ctx.lineTo(...P(lo, la)) : ctx.moveTo(...P(lo, la)))); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = line; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
    if (river) A(river, () => {
      ctx.strokeStyle = 'rgba(127,156,192,0.75)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); DANUBE.forEach(([lo, la], i) => (i ? ctx.lineTo(...P(lo, la)) : ctx.moveTo(...P(lo, la)))); ctx.stroke();
      // Lake Balaton, schematic
      const [bx, by] = P(17.75, 46.84); ctx.fillStyle = 'rgba(127,156,192,0.6)';
      ctx.beginPath(); ctx.ellipse(bx, by, 0.4 * MKX, 0.05 * MK, -0.42, 0, TAU); ctx.fill(); ctx.lineCap = 'butt';
    });
    if (label) txt('schematic map', MAPX, P(16, 45.5)[1] + 30, { size: 32, weight: 500, color: C.faint });
  });
}
function town(name, key, a = 1, { dx = 16, dy = 0, align = 'left', col = C.ink, r = 8, size = 34 } = {}) {
  const [x, y] = P(...TOWN[key]);
  A(a, () => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.bg0; ctx.lineWidth = 2.5; ctx.stroke();
    if (name) txt(name, x + dx, y + dy, { size, weight: 700, color: col, align });
  });
}

// ---------- the year ruler (this film's motif): 1944 to October 1956 ----------
const RX0 = 210, RX1 = 1710, RY = 930, Y0 = 1944, Y1 = 1957;
const RXof = (yr) => RX0 + ((yr - Y0) / (Y1 - Y0)) * (RX1 - RX0);
const OCT56 = 1956 + 22.5 / 366 + 9 / 12;
// Where the story stands at each line, in decimal years.
const DATE = {
  o1: 1945.84, o2: 1949.37, o3: 1949.37, o4: 1949.37,
  a1: 1944.21, a2: 1944.5, a3: 1944.95, a4: 1945.28, a5: 1945.3, a6: 1945.32, a7: 1945.33, a8: 1945.05, a9: 1945.06, a10: 1945.2,
  b1: 1945.84, b2: 1945.84, b3: 1945.84, b4: 1945.84, b5: 1945.86, b6: 1945.87, b7: 1945.87, b8: 1945.87, b9: 1945.9, b10: 1946.08, b11: 1946.53, b12: 1946.58,
  c1: 1946.6, c3: 1946.97, c4: 1947.0, c5: 1947.15, c6: 1947.15, c7: 1947.4, c8: 1947.66, c9: 1947.66, c10: 1947.66, c11: 1947.68, c12: 1947.85,
  d1: 1948.23, d2: 1948.45, d3: 1948.6, d5: 1949.37, d6: 1949.37, d7: 1949.37, d9: 1949.63, d10: 1949.63,
  e2: 1948.98, e3: 1948.49, e4: 1949.4, e5: 1949.71, e6: 1949.72, e7: 1949.73, e8: 1949.79, e9: 1949.75, e10: 1951.35, e11: 1956.23,
  g1: 1951.0, g2: 1951.5, g3: 1952.19, g4: 1952.62, g5: 1952.8, g6: 1953.0, g8: 1953.18, g9: 1953.2, g10: OCT56, g11: OCT56,
};
function storyDate(t) {
  let prev = null, cur = null;
  for (const key of KEYS) { if (DATE[key] == null) continue; if (s(key, -0.3) <= t) { prev = cur; cur = key; } else break; }
  if (!cur) return DATE.o1;
  const p = eio(seg(t, s(cur, -0.3), s(cur, 1.1)));
  return prev ? lerp(DATE[prev], DATE[cur], p) : DATE[cur];
}
function ruler(t, a) {
  if (a <= 0) return;
  A(a, () => {
    const yr = storyDate(t), xm = RXof(yr);
    ctx.strokeStyle = C.hair; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(RX0, RY); ctx.lineTo(RX1, RY); ctx.stroke();
    ctx.strokeStyle = C.acc; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(RX0, RY); ctx.lineTo(xm, RY); ctx.stroke();
    for (let y = Y0; y < Y1; y++) {
      const x = RXof(y), lit = yr >= y && yr < y + 1;
      ctx.fillStyle = yr >= y ? C.acc : C.faint; ctx.fillRect(x - 1.5, RY - 9, 3, 18);
      txt(String(y), x + (RXof(y + 1) - x) / 2, RY + 34, { size: 32, weight: lit ? 800 : 500, color: lit ? C.accLt : yr >= y ? C.soft : C.faint, align: 'center' });
    }
    // October 1956 at the far end, marked with the flag of the revolution
    const xo = RXof(OCT56);
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(xo, RY - 10); ctx.lineTo(xo, RY - 34); ctx.stroke(); ctx.setLineDash([]);
    flag(xo, RY - 56, 56);
    // the marker
    ctx.fillStyle = C.accGlow; ctx.beginPath(); ctx.arc(xm, RY, 20, 0, TAU); ctx.fill();
    ctx.fillStyle = C.accLt; ctx.beginPath(); ctx.arc(xm, RY, 9, 0, TAU); ctx.fill();
  });
}

// ---------- ballots ----------
const BALLOT45 = ['Smallholders', 'Social Democrats', 'Communists', 'National Peasants', 'Civic Democrats', 'Radical Party'];
function ballot1945(x, y, w, { hi = -1, hiA = 0, rot = 0, cols = null } = {}) {
  const h = 128 + BALLOT45.length * 62;
  paper(x, y, w, h, { rot });
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2);
  txt('BALLOT', w / 2, 48, { size: 36, weight: 800, family: HEAD, color: C.pInk, align: 'center', spacing: '4px' });
  txt('4 November 1945', w / 2, 92, { size: 32, weight: 500, color: C.pSoft, align: 'center' });
  BALLOT45.forEach((name, i) => {
    const yy = 150 + i * 62;
    ctx.strokeStyle = C.pLine; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(24, yy - 31); ctx.lineTo(w - 24, yy - 31); ctx.stroke();
    if (i === hi && hiA > 0) A(hiA, () => { ctx.fillStyle = 'rgba(207,79,67,0.2)'; ctx.fillRect(12, yy - 29, w - 24, 58); });
    ctx.strokeStyle = C.pInk; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(52, yy, 15, 0, TAU); ctx.stroke();
    if (cols) { ctx.fillStyle = cols[i]; ctx.fillRect(w - 52, yy - 13, 26, 26); }
    txt(name, 86, yy + 2, { size: 33, weight: 700, color: C.pInk });
  });
  ctx.restore();
  return h;
}
function ballot1949(x, y, w, { cross = 0, rot = 0 } = {}) {
  const h = 470;
  paper(x, y, w, h, { rot });
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2);
  txt('BALLOT', w / 2, 48, { size: 36, weight: 800, family: HEAD, color: C.pInk, align: 'center', spacing: '4px' });
  txt('15 May 1949', w / 2, 92, { size: 32, weight: 500, color: C.pSoft, align: 'center' });
  ctx.strokeStyle = C.pInk; ctx.lineWidth = 2.5; ctx.strokeRect(28, 130, w - 56, 190);
  txtFit('Hungarian Independent', w / 2, 178, w - 80, { size: 34, weight: 700, color: C.pInk, align: 'center' });
  txtFit('People’s Front', w / 2, 224, w - 80, { size: 40, weight: 800, family: HEAD, color: C.pInk, align: 'center' });
  txtFit('one list of candidates', w / 2, 276, w - 80, { size: 32, weight: 500, color: C.pSoft, align: 'center' });
  const cx = w / 2, cy = 392;
  ctx.strokeStyle = C.pInk; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, TAU); ctx.stroke();
  if (cross > 0) {
    ctx.strokeStyle = C.stamp; ctx.lineWidth = 6; ctx.lineCap = 'round';
    const l1 = clamp(cross * 2), l2 = clamp(cross * 2 - 1);
    ctx.beginPath(); ctx.moveTo(cx - 44, cy - 44); ctx.lineTo(cx - 44 + 88 * l1, cy - 44 + 88 * l1); ctx.stroke();
    if (l2 > 0) { ctx.beginPath(); ctx.moveTo(cx + 44, cy - 44); ctx.lineTo(cx + 44 - 88 * l2, cy - 44 + 88 * l2); ctx.stroke(); }
    ctx.lineCap = 'butt';
  }
  ctx.restore();
  return h;
}
function ballotBox(cx, y, w = 300) {
  const h = w * 0.62;
  ctx.fillStyle = '#5b4a39'; rr(cx - w / 2, y, w, h, 10); ctx.fill();
  ctx.fillStyle = '#3d3127'; ctx.fillRect(cx - w * 0.32, y + 10, w * 0.64, 12);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; ctx.strokeRect(cx - w / 2 + 14, y + 34, w - 28, h - 48);
}

// ---------- party data (script.mjs's header) ----------
const V45 = [
  { name: 'Smallholders', v: 57.03, col: C.fkgp }, { name: 'Social Democrats', v: 17.41, col: C.szdp },
  { name: 'Communists', v: 16.96, col: C.mkp }, { name: 'National Peasants', v: 6.87, col: C.npp }, { name: 'Civic Democrats', v: 1.62, col: C.pdp },
];
const V47core = [
  { name: 'Communists', v: 22.24, col: C.mkp, coal: true }, { name: 'Democratic People’s Party', v: 16.5, col: C.dnp },
  { name: 'Smallholders', v: 15.34, col: C.fkgp, coal: true }, { name: 'Social Democrats', v: 14.86, col: C.szdp, coal: true },
  { name: 'Independence Party', v: 13.43, col: C.mfp }, { name: 'National Peasants', v: 8.28, col: C.npp, coal: true },
];
const V47 = [...V47core, { name: 'Others', v: +(100 - V47core.reduce((a, p) => a + p.v, 0)).toFixed(2), col: C.other }];
const COALITION47 = V47.filter((p) => p.coal).reduce((a, p) => a + p.v, 0);
const OPPOSITION47 = 100 - COALITION47;
if (Math.abs(OPPOSITION47 - 39.3) > 0.5) throw new Error(`opposition 1947: ${OPPOSITION47}`); // "about 40 percent"
// Cabinet of 15 November 1945 (FRUS doc. 856): 9 Smallholders, 4 Communists, 4 Social Democrats, 1 National Peasant.
const CABINET = [C.mkp, ...Array(9).fill(C.fkgp), ...Array(3).fill(C.mkp), ...Array(4).fill(C.szdp), C.npp];
const INTERIOR = 0; // the Interior Ministry: a Communist's, after Voroshilov vetoed the Smallholder the coalition had agreed on
// Inflation (Hanke & Krus): prices doubled every 15 hours; over 5 days (120 h) that is 2^8 = 256 times.
const DOUBLING_H = 15, DAYS = 5, FACTOR = 2 ** ((DAYS * 24) / DOUBLING_H);
if (FACTOR !== 256) throw new Error('factor');
// False votes in 1947 (Csönge): the police chief's report, the "customary" estimate, the highest estimate.
const FALSE = [{ v: 62981, name: 'police chief’s report' }, { v: 100000, name: '“customary” estimate' }, { v: 200000, name: 'highest estimate' }];
const STRUCK = 466853, ENTITLED = 5064987;
// Real wages, 1949 = 100: a fifth lower by 1953 (the 1956 Institute).
const WAGE53 = 80;

// =============================== parts ===============================
// ---------- cold open: two ballots ----------
function partOpen(t) {
  const under = 1 - seg(t, e('o4', 0.2), e('o4', 1.0));
  if (under > 0) A(under, () => openBallots(t));
  // the title, after the cold open
  const ta = span(t, e('o4', 0.2), CH[0].at + 0.6, 0.8, 0.6);
  if (ta > 0) {
    A(ta * 0.94, () => { ctx.fillStyle = C.card; ctx.fillRect(0, 0, W, H); });
    A(ta, () => {
      const p = eout(seg(t, e('o4', 0.2), e('o4', 1.4)));
      flag(W / 2, 250 - (1 - p) * 10, 120);
      txt('BACKGROUND', W / 2, 380, { size: 38, weight: 700, color: C.acc, align: 'center', spacing: '8px' });
      txt('BEFORE OCTOBER', W / 2, 500 + (1 - p) * 16, { size: fit('BEFORE OCTOBER', 1600, 140, { weight: 800, family: HEAD, spacing: '4px' }), weight: 800, family: HEAD, align: 'center', spacing: '4px' });
      txt('HUNGARY 1945–1956', W / 2, 622, { size: fit('HUNGARY 1945–1956', 1500, 70, { weight: 700, family: HEAD, spacing: '6px' }), weight: 700, family: HEAD, color: C.accLt, align: 'center', spacing: '6px' });
      tricolour(W / 2, 690, 300, 7);
      txt('Hungary 1956', W / 2, 770, { size: 44, weight: 500, color: C.soft, align: 'center' });
    });
  }
}
function openBallots(t) {
  const aA = from(t, 'o1', -0.2, 0.9), aB = from(t, 'o2', -0.2, 0.9);
  const bx = 260, by = 160, bw = 480;
  A(aA, () => {
    ballot1945(bx, by + (1 - aA) * 30, bw, { hi: 2, hiA: from(t, 'o1', 3.2) });
    A(from(t, 'o1', 3.6), () => {
      txt(pct(17), bx + bw / 2, by + 600, { size: 100, weight: 800, family: HEAD, color: C.mkp, align: 'center' });
      txt('Communists', bx + bw / 2, by + 676, { size: 38, weight: 700, color: C.soft, align: 'center' });
    });
  });
  const cx = 1420, cw = 470;
  A(aB, () => {
    ballot1949(cx - cw / 2, by + (1 - aB) * 30, cw);
    A(from(t, 'o2', 3.4), () => chip('no mark = yes', cx + 60, by + 392, { color: C.accLt, size: 34, align: 'left' }));
    A(from(t, 'o3', 0.2), () => {
      txt(pct(95.6, 1), cx, by + 600, { size: 100, weight: 800, family: HEAD, color: C.accLt, align: 'center' });
      txt('for the list, officially', cx, by + 676, { size: 38, weight: 700, color: C.soft, align: 'center' });
    });
  });
  // between them: the slices
  A(from(t, 'o4', 0.2), () => {
    const y = by + 250;
    for (let i = 0; i < 5; i++) {
      const p = eio(seg(t, s('o4', 0.5 + i * 0.35), s('o4', 1.0 + i * 0.35)));
      const x = 830 + i * 64, r = 40 - i * 6;
      A(p, () => { ctx.fillStyle = C.fkgp; ctx.beginPath(); ctx.ellipse(x, y, r * 0.5, r, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(236,230,214,0.25)'; ctx.beginPath(); ctx.ellipse(x, y, r * 0.3, r * 0.7, 0, 0, TAU); ctx.fill(); });
    }
    trace([[800, y + 90], [1120, y + 90]], from(t, 'o4', 1.0, 1.6), C.faint, { w: 4, dash: [10, 10], headSize: 16 });
  });
}

// ---------- 1: the war's end (map) ----------
function partWar(t) {
  MAPX = 130; MAPY = 270;
  hungary({ a: from(t, 'a1', -0.3, 1.2) });
  const [bx, by] = P(...TOWN.budapest);
  // a1: German occupation, March 1944: grey arrows from the west
  const gA = during(t, 'a1', 'a1');
  A(gA, () => {
    trace(smooth([[40, 360], [P(16.6, 47.8)[0], 400], [bx - 30, by - 10]]), from(t, 'a1', 1.0, 1.8), C.german, { w: 7, dash: [14, 10] });
    trace(smooth([[40, 620], [P(16.5, 46.6)[0], 600], [P(18.2, 46.5)[0], P(18.2, 46.5)[1]]]), from(t, 'a1', 1.4, 1.8), C.german, { w: 7, dash: [14, 10] });
    town('Budapest', 'budapest', from(t, 'a1', 0.6));
  });
  A(during(t, 'a2', 'a2'), () => {
    const [x1, y1] = P(19.6, 48.25);
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.setLineDash([3, 9]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + 40 * from(t, 'a2', 0.6, 1.4), y1 - 120 * from(t, 'a2', 0.6, 1.4)); ctx.stroke(); ctx.setLineDash([]);
    A(from(t, 'a2', 1.6), () => txt('to Auschwitz-Birkenau', x1 + 54, y1 - 130, { size: 32, weight: 500, color: C.soft }));
  });
  // a3–a4: the Red Army from the east; the siege of Budapest
  const rA = during(t, 'a3', 'a7');
  A(rA, () => {
    const g = (d) => from(t, 'a3', d, 2.2);
    trace(smooth([[960, 560], [P(21.4, 46.7)[0], P(21.4, 46.7)[1]], [P(20.2, 47.0)[0], P(20.2, 47.0)[1]], [bx + 24, by + 12]]), g(0.6), C.soviet, { w: 8, dash: [16, 10] });
    trace(smooth([[960, 330], [P(21.8, 48.1)[0], P(21.8, 48.1)[1]], [P(20.4, 47.75)[0], P(20.4, 47.75)[1]], [bx + 20, by - 18]]), g(1.0), C.soviet, { w: 8, dash: [16, 10] });
    trace(smooth([[P(20.4, 45.7)[0], 790], [P(19.6, 46.3)[0], P(19.6, 46.3)[1]], [bx + 6, by + 26]]), g(1.4), C.soviet, { w: 8, dash: [16, 10] });
    // the siege ring
    const ring = from(t, 'a3', 2.6, 1.2);
    A(ring * (1 - from(t, 'a4', 1.0)), () => {
      ctx.strokeStyle = C.soviet; ctx.lineWidth = 5; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.arc(bx, by, 34 + 6 * Math.sin(t * 2.4), 0, TAU * ring); ctx.stroke(); ctx.setLineDash([]);
    });
    // a4: on to the western border
    trace(smooth([[bx - 20, by], [P(17.8, 47.4)[0], P(17.8, 47.4)[1]], [P(16.25, 47.2)[0], P(16.25, 47.2)[1]]]), from(t, 'a4', 0.3, 2.0), C.soviet, { w: 8, dash: [16, 10] });
    town('Budapest', 'budapest', 1);
  });
  // a5–a7: Soviet troops in the country, as simple markers
  const tA = during(t, 'a5', 'a10');
  A(tA, () => {
    const pts = [[17.2, 47.6], [18.0, 46.4], [19.6, 47.2], [20.5, 46.6], [21.3, 47.9], [21.9, 47.4], [18.6, 47.3], [20.0, 48.0], [17.0, 46.6], [19.4, 46.4]];
    pts.forEach(([lo, la], i) => A(from(t, 'a5', 0.2 + i * 0.12, 0.5), () => { const [x, y] = P(lo, la); ctx.fillStyle = C.soviet; rr(x - 10, y - 10, 20, 20, 4); ctx.fill(); }));
    town('Budapest', 'budapest', 1);
  });
  // a6: to Soviet camps, off the map to the east
  A(during(t, 'a6', 'a7'), () => {
    trace([[P(21.0, 47.3)[0], P(21.0, 47.3)[1]], [990, 250]], from(t, 'a6', 0.4, 1.6), C.soviet, { w: 6, dash: [6, 10], headSize: 18 });
  });
  // a8: Debrecen; a9: the Control Commission in Budapest
  A(during(t, 'a8', 'a10'), () => town('Debrecen', 'debrecen', from(t, 'a8', 0.3), { dx: 0, dy: -36, align: 'center', col: C.accLt }));
  A(during(t, 'a9', 'a10'), () => {
    const p = from(t, 'a9', 0.6);
    A(p, () => chip('ACC', bx, by - 52, { color: C.soviet, size: 32 }));
  });

  // the right-hand column
  column(270, [['date', '19 MARCH 1944'], ['h', 'German troops occupy Hungary', { lines: 2 }], ['p', 'Germany’s wartime ally', { lines: 1 }]], beat(t, 'a1'));
  column(220, [['date', 'MAY–JULY 1944'], ['big', fmt(437000)], ['h', 'Jews deported from Hungary', { lines: 1 }], ['p', 'most of them murdered at Auschwitz-Birkenau', { lines: 2 }]], beat(t, 'a2'));
  column(260, [['date', 'DEC 1944 – FEB 1945'], ['h', 'The siege of Budapest', { lines: 1 }], ['p', 'the Red Army fights its way across Hungary', { lines: 2 }]], beat(t, 'a3'));
  column(220, [['date', 'APRIL 1945'], ['big', pct(40)], ['h', 'of the nation’s wealth destroyed', { lines: 2 }], ['s', 'estimate']], beat(t, 'a4'));
  column(280, [['h', 'The new occupiers', { lines: 1 }], ['p', 'looting, and the rape of very many women', { lines: 2 }]], beat(t, 'a5'));
  column(220, [['date', '1944–1945'], ['big', fmt(600000)], ['h', 'soldiers and civilians taken to Soviet camps', { lines: 2 }], ['p', 'about a third never came home', { lines: 1 }]], beat(t, 'a6'));
  column(300, [['q', '“a half liberation”', { lines: 1 }], ['s', 'historian György Gyarmati'], ['gap', 30], ['p', 'free of the Nazis, but occupied', { lines: 1 }]], beat(t, 'a7'));
  column(250, [['date', 'DECEMBER 1944'], ['h', 'a provisional government in Debrecen', { lines: 2 }], ['gap', 20], ['date', '20 JANUARY 1945'], ['h', 'armistice', { lines: 1 }]], beat(t, 'a8'));
  A(beat(t, 'a9'), () => {
    column(230, [['h', 'Allied Control Commission', { lines: 1 }], ['p', 'chairman: Marshal Kliment Voroshilov', { lines: 1 }]], 1);
    const rows = [['USSR', C.soviet, 'in control'], ['USA', C.faint, ''], ['UK', C.faint, '']];
    rows.forEach(([n, col, note], i) => {
      const y = 430 + i * 92, p = from(t, 'a9', 0.8 + i * 0.25, 0.6);
      A(p, () => {
        card(RCX - 300, y - 36, 600, 72, { bg: i ? 'rgba(31,36,44,0.5)' : 'rgba(211,117,99,0.16)', line: i ? null : C.soviet });
        txt(n, RCX - 270, y, { size: 40, weight: 800, family: HEAD, color: i ? C.faint : C.ink });
        if (note) txt(note, RCX + 270, y, { size: 34, weight: 700, color: C.soviet, align: 'right' });
      });
    });
  });
  // a10: land reform: a great estate split into strips
  A(beat(t, 'a10'), () => {
    column(210, [['date', 'MARCH 1945'], ['h', 'Land reform', { lines: 1 }]], 1);
    const x0 = RCX - 300, y0 = 380, w = 600, h = 250, n = 14, p = from(t, 'a10', 1.0, 2.2);
    for (let i = 0; i < n; i++) {
      const xs = x0 + (i * w) / n, gap = 7 * p;
      ctx.fillStyle = i % 3 === 0 ? '#5f8a4c' : i % 3 === 1 ? '#76a35f' : '#8bb36d';
      ctx.fillRect(xs + gap / 2, y0 + (i % 2) * 8 * p, w / n - gap, h - 8 * p);
    }
    A(1 - p, () => { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(x0, y0, w, h); txt('great estate', RCX, y0 + h / 2, { size: 38, weight: 700, color: C.ink, align: 'center' }); });
    A(from(t, 'a10', 3.0), () => {
      txt(fmt(640000), RCX, 720, { size: 84, weight: 800, family: HEAD, color: C.ink, align: 'center' });
      txt('poor peasants receive land', RCX, 790, { size: 38, weight: 500, color: C.soft, align: 'center' });
    });
  });
}

// ---------- 2: a free vote ----------
function partVote(t) {
  // b1–b2: the ballot of 1945
  const ba = during(t, 'b1', 'b2');
  A(ba, () => ballot1945(250, 190, 520, { cols: [C.fkgp, C.szdp, C.mkp, C.npp, C.pdp, C.other] }));
  column(250, [['date', '4 NOVEMBER 1945'], ['h', 'General election', { lines: 1 }], ['p', 'six parties approved by the Allied Control Commission', { lines: 2 }]], beat(t, 'b1'));
  column(240, [['date', '4 NOVEMBER 1945'], ['big', pct(92.5, 1)], ['h', 'of registered voters took part', { lines: 2 }], ['s', 'a secret ballot']], beat(t, 'b2'));
  // b3–b5: the result as bars
  const bars = during(t, 'b3', 'b5');
  A(bars, () => {
    txt('THE VOTE · 4 NOVEMBER 1945', 140, 230, { size: 36, weight: 800, family: HEAD, color: C.accLt, spacing: '2px' });
    const x0 = 140, wmax = 760, scale = wmax / 60;
    V45.forEach((p, i) => {
      const y = 300 + i * 100, g = eio(seg(t, s('b3', 0.2 + i * 0.25), s('b3', 1.4 + i * 0.25)));
      const dim = i === 0 ? 1 : 1 - 0.55 * from(t, 'b3', 0) * (1 - from(t, 'b4', 0));
      const lit = (i === 1 || i === 2) ? from(t, 'b4', 0.2) : 0;
      A(dim, () => {
        txt(p.name, x0, y, { size: 34, weight: 700, color: C.soft });
        ctx.fillStyle = p.col; rr(x0, y + 22, Math.max(4, p.v * scale * g), 40, 6); ctx.fill();
        if (lit) A(lit, () => { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; rr(x0 - 4, y + 18, p.v * scale + 8, 48, 8); ctx.stroke(); });
        A(seg(t, s('b3', 1.0 + i * 0.25), s('b3', 1.6 + i * 0.25)), () => txt(pct(p.v, 1), x0 + p.v * scale * g + 16, y + 43, { size: 36, weight: 800, family: HEAD, color: C.ink }));
      });
    });
    txt('final count; Nohlen and Stöver', 140, 820, { size: 32, weight: 500, color: C.faint });
  });
  column(260, [['big', pct(57)], ['h', 'Independent Smallholders’ Party', { lines: 1 }], ['p', 'a majority on its own', { lines: 1 }]], beat(t, 'b3'));
  column(230, [['mid', pct(17.4, 1), { color: C.szdp }], ['p', 'Social Democrats', { lines: 1 }], ['gap', 20], ['mid', pct(17), { color: C.mkp }], ['p', 'Communists · leader: Mátyás Rákosi', { lines: 1 }]], beat(t, 'b4'));
  column(250, [['q', '“no evidence that election was anything but free and untrammeled”', { lines: 3 }], ['gap', 10], ['s', 'US representative in Budapest, 9 November 1945', { lines: 2 }]], beat(t, 'b5'));
  // b6–b9: the cabinet table
  const cab = during(t, 'b6', 'b9');
  A(cab, () => {
    const cx = 510, cy = 500, rx = 300, ry = 170;
    ctx.fillStyle = '#3a3128'; ctx.beginPath(); ctx.ellipse(cx, cy, rx - 70, ry - 60, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(236,230,214,0.2)'; ctx.lineWidth = 2; ctx.stroke();
    txt('18 ministers', cx, cy - 26, { size: 38, weight: 700, color: C.soft, align: 'center' });
    const veto = from(t, 'b7', 0.6), toRed = from(t, 'b8', 0.2);
    CABINET.forEach((col, i) => {
      const ang = -Math.PI / 2 + (i / CABINET.length) * TAU, p = eio(seg(t, s('b6', 0.2 + i * 0.07), s('b6', 0.7 + i * 0.07)));
      let x = cx + Math.cos(ang) * rx, y = cy + Math.sin(ang) * ry;
      if (i === INTERIOR) y -= 70 * veto;
      A(p, () => {
        if (i === INTERIOR && veto > 0 && toRed < 1) {
          // the Smallholder the coalition had agreed on, vetoed
          A(veto * (1 - toRed), () => { ctx.strokeStyle = C.fkgp; ctx.lineWidth = 5; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.stroke(); ctx.setLineDash([]); });
          A(1 - veto + toRed, () => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill(); });
        } else { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill(); }
        if (i === INTERIOR && veto > 0) { ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 30, 0, TAU); ctx.stroke(); }
      });
    });
    const [ix, iy] = [cx, cy - ry - 70];
    A(veto, () => {
      txt('INTERIOR MINISTRY', ix, iy - 62, { size: 36, weight: 800, family: HEAD, color: C.ink, align: 'center', spacing: '2px' });
      txt('the police', ix + 52, iy + 2, { size: 32, weight: 500, color: C.soft });
    });
    stamp('VETO: VOROSHILOV', cx, cy + 34, from(t, 'b7', 1.6, 0.5) * (1 - from(t, 'b8', 0.0, 0.4)), { size: 34, rot: -0.12, maxW: 420 });
    A(toRed, () => txt('Imre Nagy, Communist', ix - 52, iy + 2, { size: 34, weight: 700, color: C.mkp, align: 'right' }));
    // b9: the political police, under the ministry
    A(from(t, 'b9', 0.4), () => {
      chip('political police', cx, cy + ry + 74, { color: C.mkp, size: 34 });
      ctx.strokeStyle = C.mkp; ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(ix + 34, iy); ctx.bezierCurveTo(cx + rx + 120, cy - 80, cx + rx + 120, cy + ry + 40, cx + 150, cy + ry + 74); ctx.stroke(); ctx.setLineDash([]);
    });
    A(from(t, 'b6', 1.2), () => {
      [['Smallholders', C.fkgp, 9], ['Communists', C.mkp, 4], ['Social Democrats', C.szdp, 4], ['National Peasants', C.npp, 1]].forEach(([n, c, m], j) => {
        const x = 140 + (j % 2) * 380, ly = 806 + Math.floor(j / 2) * 50;
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 12, ly, 11, 0, TAU); ctx.fill();
        const w1 = textW(n, { size: 32, weight: 500 });
        txt(n, x + 32, ly, { size: 32, weight: 500, color: C.soft });
        txt(String(m), x + 44 + w1, ly, { size: 32, weight: 800, family: HEAD, color: C.ink });
      });
    });
  });
  column(240, [['date', '15 NOVEMBER 1945'], ['h', 'The coalition government', { lines: 1 }], ['big', `9 / 18`], ['p', 'ministers from the Smallholders', { lines: 1 }]], beat(t, 'b6'));
  column(260, [['h', 'Voroshilov’s veto', { lines: 1 }], ['p', 'no Smallholder at the Interior Ministry, which ran the police', { lines: 2 }]], beat(t, 'b7'));
  column(250, [['h', 'Imre Nagy', { lines: 1 }], ['p', 'Communist, interior minister from November 1945', { lines: 2 }], ['s', 'prime minister in October 1956']], beat(t, 'b8'));
  column(270, [['h', 'The political police', { lines: 1 }], ['p', 'led by Gábor Péter, answering to the Communists', { lines: 2 }]], beat(t, 'b9'));
  // b10: the republic and its arms
  A(during(t, 'b10', 'b10'), () => {
    kossuthArms(510, 480, 360);
    txt('the Kossuth arms', 510, 720, { size: 34, weight: 500, color: C.soft, align: 'center' });
  });
  column(260, [['date', '1 FEBRUARY 1946'], ['h', 'Hungary becomes a republic', { lines: 1 }], ['p', 'President: Zoltán Tildy, Smallholder', { lines: 1 }]], beat(t, 'b10'));
  // b11: prices doubling every 15 hours, for five days
  const inf = during(t, 'b11', 'b12');
  A(inf, () => {
    const x0 = 160, y0 = 760, wch = 700, hch = 440, n = (DAYS * 24) / DOUBLING_H;
    ctx.strokeStyle = C.hair; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0 - hch - 20); ctx.lineTo(x0, y0); ctx.lineTo(x0 + wch + 20, y0); ctx.stroke();
    const grow = from(t, 'b11', 1.6, 4.0);
    for (let i = 0; i <= n; i++) {
      const v = 2 ** i, hh = (v / FACTOR) * hch, x = x0 + 20 + (i * (wch - 40)) / n, show = clamp(grow * (n + 1) - i);
      A(show, () => { ctx.fillStyle = i === n ? C.mkp : C.accLt; ctx.fillRect(x - 24, y0 - Math.max(3, hh * show), 48, Math.max(3, hh * show)); });
    }
    for (let d = 0; d <= DAYS; d++) txt(String(d), x0 + 20 + ((d * 24) / DOUBLING_H) * ((wch - 40) / n), y0 + 30, { size: 32, weight: 500, color: C.soft, align: 'center' });
    txt('days', x0 + wch + 30, y0 + 30, { size: 32, weight: 500, color: C.faint });
    txt('prices', x0, y0 - hch - 48, { size: 34, weight: 700, color: C.soft });
    A(seg(t, s('b11', 5.0), s('b11', 5.6)), () => txt(`×${fmt(FACTOR)}`, x0 + wch - 70, y0 - hch - 4, { size: 64, weight: 800, family: HEAD, color: C.mkp, align: 'right' }));
  });
  column(240, [['date', 'JULY 1946'], ['h', 'prices doubled about every 15 hours', { lines: 2 }], ['p', 'the worst inflation on record', { lines: 1 }], ['s', 'Hanke and Krus, World Hyperinflations']], beat(t, 'b11'));
  A(beat(t, 'b12'), () => {
    column(240, [['date', '1 AUGUST 1946'], ['h', 'a new currency', { lines: 1 }]], 1);
    const p = from(t, 'b12', 0.3, 0.9), cx = RCX, cy = 560;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.25 + 0.75 * p);
    ctx.fillStyle = '#b9b2a2'; ctx.beginPath(); ctx.arc(0, 0, 120, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#8f887a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 104, 0, TAU); ctx.stroke();
    txt('Ft', 0, 6, { size: 96, weight: 800, family: HEAD, color: '#4b463e', align: 'center' });
    ctx.restore();
    txt('forint', cx, 740, { size: 48, weight: 700, color: C.ink, align: 'center' });
    txt('instead of the pengő', cx, 800, { size: 36, weight: 500, color: C.soft, align: 'center' });
  });
}

// ---------- 3: slice by slice ----------
const SPECKS = (() => { let q = 7; const r = () => ((q = (q * 16807) % 2147483647) / 2147483647); return Array.from({ length: 70 }, () => [r(), r(), 3 + r() * 5]); })();
function partSalami(t) {
  // the salami: the Smallholders' 57% of 1945, cut slice by slice
  const sa = during(t, 'c1', 'c7');
  const x0 = 140, scale = 12.4, y = 330, h = 120;
  A(sa, () => {
    const Lfull = 57 * scale, sliceW = 76, land = [250, 500, 750];
    txt('Smallholders, 1945', x0, 236, { size: 36, weight: 700, color: C.soft });
    txt(pct(57), x0 + Lfull, 236, { size: 40, weight: 800, family: HEAD, color: C.fkgp, align: 'right' });
    const cuts = [['c3', 'late 1946'], ['c5', 'Feb 1947'], ['c7', 'May 1947']];
    const sliceShape = (w, hh) => { ctx.fillStyle = C.fkgp; rr(-w / 2, -hh / 2, w, hh, 16); ctx.fill(); ctx.fillStyle = 'rgba(236,230,214,0.2)'; for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.arc(-14 + (j % 3) * 14, -36 + j * 18, 5, 0, TAU); ctx.fill(); } };
    let body = Lfull;
    cuts.forEach(([key, when], i) => {
      const p = from(t, key, 0.5, 0.3), fall = from(t, key, 0.9, 1.5);
      if (p <= 0) return;
      body -= sliceW;
      const xr = x0 + Lfull - i * sliceW, xc = lerp(xr - sliceW / 2, land[i], fall), yc = lerp(y + h / 2, 650, fall);
      ctx.save(); ctx.translate(xc, yc); ctx.rotate(fall * (0.35 - i * 0.3)); sliceShape(sliceW - 8, h); ctx.restore();
      A(fall, () => txt(when, land[i], 760, { size: 34, weight: 800, family: HEAD, color: C.accLt, align: 'center' }));
    });
    ctx.fillStyle = C.fkgp; rr(x0, y, Math.max(30, body), h, 46); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; rr(x0, y + h * 0.62, Math.max(30, body), h * 0.38, [0, 0, 46, 46]); ctx.fill();
    ctx.fillStyle = 'rgba(236,230,214,0.24)';
    SPECKS.forEach(([fx, fy, r]) => { const xx = x0 + 14 + fx * (Lfull - 28); if (xx < x0 + body - 14) { ctx.beginPath(); ctx.ellipse(xx, y + 16 + fy * (h - 32), r * 1.3, r, 0, 0, TAU); ctx.fill(); } });
    // the string at the salami's end
    ctx.strokeStyle = '#b9ab8c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 4, y + h / 2); ctx.lineTo(x0 - 26, y + h / 2 - 14); ctx.moveTo(x0 + 4, y + h / 2); ctx.lineTo(x0 - 24, y + h / 2 + 16); ctx.stroke();
    // the knife, at each cut
    cuts.forEach(([key], i) => {
      const kv = span(t, s(key, 0.0), s(key, 1.5), 0.3, 0.4);
      if (kv <= 0) return;
      const xk = x0 + Lfull - (i + 1) * sliceW, pk = from(t, key, 0.1, 0.45);
      A(kv, () => {
        ctx.fillStyle = '#c9ccd2'; ctx.beginPath(); ctx.moveTo(xk - 3, y - 80 + pk * 80); ctx.lineTo(xk + 3, y - 80 + pk * 80); ctx.lineTo(xk + 3, y + h + 6 * pk); ctx.lineTo(xk - 12, y - 30 + pk * 80); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#5a4636'; rr(xk - 9, y - 150 + pk * 80, 18, 72, 6); ctx.fill();
      });
    });
    A(from(t, 'c1', 1.2), () => txt('one slice at a time', x0, y + h + 56, { size: 36, weight: 500, color: C.faint }));
  });
  column(260, [['q', '“salami tactics”', { lines: 1 }], ['p', 'Mátyás Rákosi’s own name for it, years later', { lines: 2 }]], beat(t, 'c1'));
  column(240, [['date', 'LATE 1946'], ['h', 'a “conspiracy against the republic”', { lines: 2 }], ['p', 'Smallholder deputies arrested', { lines: 1 }]], beat(t, 'c3'));
  column(260, [['h', 'Political police headquarters', { lines: 1 }], ['mid', 'Andrássy út 60', { color: C.ink }], ['p', 'confessions forced by torture', { lines: 1 }]], beat(t, 'c4'));
  column(220, [['date', '25 FEBRUARY 1947'], ['h', 'Béla Kovács', { lines: 1 }], ['p', 'secretary general of the Smallholders', { lines: 1 }], ['p', 'arrested by Soviet soldiers', { lines: 1, color: C.soviet }]], beat(t, 'c5'));
  column(260, [['big', '8'], ['h', 'years in Soviet prisons and camps', { lines: 2 }]], beat(t, 'c6'));
  column(240, [['date', 'MAY 1947'], ['h', 'Prime Minister Ferenc Nagy', { lines: 1 }], ['p', 'accused while abroad; resigns, stays in exile', { lines: 2 }]], beat(t, 'c7'));
  // c8: the voters' rolls
  A(during(t, 'c8', 'c8'), () => {
    txt('VOTERS’ ROLLS · AUGUST 1947', 140, 250, { size: 36, weight: 800, family: HEAD, color: C.accLt, spacing: '2px' });
    const x0b = 140, wb = 740, yb = 380, hb = 110, p = from(t, 'c8', 0.4, 1.2), q = from(t, 'c8', 2.0, 1.2);
    ctx.fillStyle = C.accDk; ctx.fillRect(x0b, yb, wb * p, hb);
    const ws = (STRUCK / ENTITLED) * wb;
    A(q, () => {
      ctx.fillStyle = C.bg0; ctx.fillRect(x0b + wb - ws, yb - 4, ws, hb + 8);
      ctx.strokeStyle = C.stamp; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.strokeRect(x0b + wb - ws, yb, ws, hb); ctx.setLineDash([]);
      for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(194,69,59,0.6)'; ctx.beginPath(); ctx.moveTo(x0b + wb - ws + i * 14, yb + hb); ctx.lineTo(x0b + wb - ws + i * 14 + 30, yb); ctx.stroke(); }
      txt(fmt(STRUCK), x0b + wb, yb + hb + 50, { size: 40, weight: 800, family: HEAD, color: C.stamp, align: 'right' });
      txt('struck off', x0b + wb, yb + hb + 100, { size: 34, weight: 500, color: C.soft, align: 'right' });
    });
    A(p, () => { txt(fmt(ENTITLED), x0b, yb - 34, { size: 36, weight: 800, family: HEAD, color: C.ink }); txt('on the rolls', x0b, yb + hb + 50, { size: 34, weight: 500, color: C.soft }); });
    txt('the political police’s own count', 140, 820, { size: 32, weight: 500, color: C.faint });
  });
  column(240, [['date', '31 AUGUST 1947'], ['h', 'A new election', { lines: 1 }], ['p', 'about 467,000 people struck off the voters’ rolls', { lines: 2 }]], beat(t, 'c8'));
  // c9: one car, many polling stations
  A(during(t, 'c9', 'c9'), () => {
    txt('Schematic district', 140, 230, { size: 32, weight: 500, color: C.faint });
    const loop = smooth([[200, 420], [330, 300], [520, 290], [720, 330], [850, 450], [800, 620], [600, 700], [380, 690], [210, 600], [200, 420]], 12);
    ctx.strokeStyle = 'rgba(236,230,214,0.22)'; ctx.lineWidth = 16; ctx.lineJoin = 'round'; ctx.beginPath(); loop.forEach((pt, i) => (i ? ctx.lineTo(...pt) : ctx.moveTo(...pt))); ctx.stroke();
    const stations = [3, 22, 38, 52, 70, 86, 101].map((i) => loop[Math.min(i, loop.length - 1)]);
    // the car's distance along the loop, laps from the line's start
    const L = []; let tot = 0; for (let i = 1; i < loop.length; i++) { const d = Math.hypot(loop[i][0] - loop[i - 1][0], loop[i][1] - loop[i - 1][1]); L.push(tot += d); }
    const lapT = 3.2, u = Math.max(0, t - s('c9', 0.6)) / lapT, frac = u % 1, laps = Math.floor(u);
    const dist = frac * tot; let idx = L.findIndex((v) => v >= dist); if (idx < 0) idx = L.length - 1;
    const pos = loop[idx + 1] ?? loop[0];
    stations.forEach((st, j) => {
      const sdist = L[Math.max(0, [3, 22, 38, 52, 70, 86, 101][j] - 1)] ?? 0;
      const votes = Math.max(0, laps + (dist >= sdist ? 1 : 0)) * (u > 0 ? 1 : 0);
      ctx.fillStyle = C.paper; rr(st[0] - 34, st[1] - 70, 68, 52, 6); ctx.fill();
      ctx.fillStyle = C.pInk; ctx.fillRect(st[0] - 14, st[1] - 62, 28, 6);
      for (let v = 0; v < Math.min(votes, 6); v++) { ctx.fillStyle = '#5b86c4'; ctx.fillRect(st[0] - 26 + v * 9, st[1] - 46, 6, 20); }
    });
    A(from(t, 'c9', 0.4), () => txt('polling station', stations[3][0] + 44, stations[3][1] - 44, { size: 32, weight: 500, color: C.soft }));
    // the car
    ctx.fillStyle = C.mkp; rr(pos[0] - 22, pos[1] - 13, 44, 26, 7); ctx.fill();
    ctx.fillStyle = '#f2d9d4'; ctx.fillRect(pos[0] - 10, pos[1] - 9, 20, 8);
    // a blue slip
    const bs = from(t, 'c9', 0.2);
    A(bs, () => {
      ctx.save(); ctx.translate(520, 800); ctx.rotate(-0.05);
      ctx.fillStyle = '#9db8dc'; rr(-150, -42, 300, 84, 6); ctx.fill();
      txt('blue slip', 0, 2, { size: 34, weight: 800, color: '#1f2b3d', align: 'center' });
      ctx.restore();
    });
  });
  column(240, [['h', 'Blue slips', { lines: 1, color: '#9db8dc' }], ['p', 'meant for voters away from home', { lines: 1 }], ['p', 'used to vote again and again', { lines: 1 }]], beat(t, 'c9'));
  // c10: the estimates of false votes
  A(during(t, 'c10', 'c10'), () => {
    txt('HOW MANY FALSE VOTES?', 140, 250, { size: 36, weight: 800, family: HEAD, color: C.accLt, spacing: '2px' });
    const x0b = 140, wmax = 640;
    FALSE.forEach((f, i) => {
      const yb = 360 + i * 140, g = eio(seg(t, s('c10', 0.4 + i * 0.6), s('c10', 1.4 + i * 0.6)));
      txt(f.name, x0b, yb, { size: 34, weight: 700, color: C.soft });
      ctx.fillStyle = '#5b86c4'; rr(x0b, yb + 26, (f.v / 200000) * wmax * g, 44, 6); ctx.fill();
      A(g, () => txt(fmt(f.v), x0b + (f.v / 200000) * wmax * g + 16, yb + 50, { size: 38, weight: 800, family: HEAD, color: C.ink }));
    });
    txt('Few records survive; estimates differ.', 140, 820, { size: 32, weight: 500, color: C.faint });
  });
  column(260, [['h', 'Disputed', { lines: 1 }], ['p', 'from nearly 63,000 to about 200,000', { lines: 2 }], ['s', 'Attila Csönge, Múltunk, 2009']], beat(t, 'c10'));
  // c11–c12: the 1947 result
  A(during(t, 'c11', 'c12'), () => {
    txt('THE RESULT · 31 AUGUST 1947', 140, 220, { size: 36, weight: 800, family: HEAD, color: C.accLt, spacing: '2px' });
    const x0b = 140, bx0 = 550, k47 = 6.4;
    V47.forEach((p, i) => {
      const yb = 280 + i * 78, g = eio(seg(t, s('c11', 0.2 + i * 0.15), s('c11', 1.2 + i * 0.15)));
      const opp = from(t, 'c12', 0.3) * (p.coal ? 1 : 0);
      A(1 - 0.55 * opp, () => {
        txtFit(p.name, x0b, yb, 400, { size: 32, weight: 700, color: C.soft });
        if (p.name === 'Smallholders') A(from(t, 'c11', 2.4), () => {
          ctx.strokeStyle = 'rgba(122,168,98,0.7)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; rr(bx0, yb - 17, 57.03 * k47, 34, 6); ctx.stroke(); ctx.setLineDash([]);
          txt('1945: 57%', bx0 + 57.03 * k47 - 12, yb + 1, { size: 32, weight: 700, color: C.fkgp, align: 'right' });
        });
        ctx.fillStyle = p.col; rr(bx0, yb - 17, Math.max(4, p.v * k47 * g), 34, 6); ctx.fill();
        A(g, () => txt(pct(p.v), bx0 + p.v * k47 * g + 14, yb + 1, { size: 32, weight: 800, family: HEAD, color: C.ink }));
      });
    });
    // c12: the opposition's bracket, then the annulled seats
    A(from(t, 'c12', 0.3), () => {
      const xb = 990;
      ctx.strokeStyle = C.accLt; ctx.lineWidth = 3;
      [1, 4, 6].forEach((i) => { const yb = 280 + i * 78; ctx.beginPath(); ctx.moveTo(xb - 20, yb); ctx.lineTo(xb, yb); ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(xb, 280 + 78); ctx.lineTo(xb, 280 + 6 * 78); ctx.stroke();
    });
    A(from(t, 'c12', 4.2), () => { ctx.strokeStyle = C.stamp; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx0 - 10, 280 + 4 * 78); ctx.lineTo(bx0 + 13.43 * k47 + 80, 280 + 4 * 78); ctx.stroke(); });
    stamp('49 SEATS ANNULLED', 520, 856, from(t, 'c12', 4.4, 0.5), { size: 34, rot: -0.04, maxW: 760 });
  });
  column(240, [['mid', pct(22), { color: C.mkp }], ['p', 'Communists, first place', { lines: 1 }], ['gap', 10], ['mid', pct(15), { color: C.fkgp }], ['p', 'Smallholders, from 57% in 1945', { lines: 1 }]], beat(t, 'c11'));
  column(240, [['big', pct(OPPOSITION47)], ['h', 'for parties outside the coalition', { lines: 2 }], ['p', 'then the Independence Party’s 49 seats are annulled', { lines: 2 }]], beat(t, 'c12'));
}

// ---------- 4: one party, one list ----------
function factory(x, y, sc = 1, col = C.faint) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 40 * sc); ctx.lineTo(x + 20 * sc, y - 55 * sc); ctx.lineTo(x + 20 * sc, y - 40 * sc); ctx.lineTo(x + 40 * sc, y - 55 * sc); ctx.lineTo(x + 40 * sc, y - 40 * sc);
  ctx.lineTo(x + 60 * sc, y - 55 * sc); ctx.lineTo(x + 60 * sc, y - 90 * sc); ctx.lineTo(x + 72 * sc, y - 90 * sc); ctx.lineTo(x + 72 * sc, y); ctx.closePath(); ctx.fill();
}
function partOneList(t) {
  // d1: factories taken over in one day
  A(during(t, 'd1', 'd1'), () => {
    for (let i = 0; i < 12; i++) {
      const cx = 170 + (i % 4) * 190, cy = 380 + Math.floor(i / 4) * 170, p = from(t, 'd1', 4.0 + i * 0.25, 0.4);
      factory(cx, cy, 1.4, p > 0.5 ? C.accLt : C.faint);
      if (p > 0) stamp('STATE', cx + 50, cy - 40, p, { size: 32, rot: -0.15, col: C.stamp, maxW: 176 });
    }
    A(from(t, 'd1', 4.0), () => txt('25 March 1948: factories with more than 100 workers', 140, 840, { size: 32, weight: 500, color: C.faint }));
  });
  column(230, [['big', '1948'], ['q', '“the year of the turn”', { lines: 1 }], ['p', 'factories with over 100 workers taken over in a day', { lines: 2 }]], beat(t, 'd1'));
  // d2–d3: two parties become one
  A(during(t, 'd2', 'd3'), () => {
    const m = from(t, 'd2', 1.6, 1.6), cy = 480;
    const xa = lerp(330, 510, m), xb = lerp(690, 510, m), r = lerp(120, 150, m);
    A(1 - m, () => {
      ctx.fillStyle = C.mkp; ctx.beginPath(); ctx.arc(xa, cy, 120, 0, TAU); ctx.fill();
      ctx.fillStyle = C.szdp; ctx.beginPath(); ctx.arc(xb, cy, 120, 0, TAU); ctx.fill();
      txt('Communist', xa, cy - 20, { size: 34, weight: 800, color: C.bg0, align: 'center' });
      txt('Party', xa, cy + 22, { size: 34, weight: 800, color: C.bg0, align: 'center' });
      txt('Social', xb, cy - 20, { size: 34, weight: 800, color: C.bg0, align: 'center' });
      txt('Democrats', xb, cy + 22, { size: 34, weight: 800, color: C.bg0, align: 'center' });
    });
    A(m, () => {
      ctx.fillStyle = C.mkp; ctx.beginPath(); ctx.arc(510, cy, r, 0, TAU); ctx.fill();
      txt('MDP', 510, cy - 10, { size: 72, weight: 800, family: HEAD, color: C.ink, align: 'center' });
      txt('12 June 1948', 510, cy + 54, { size: 32, weight: 700, color: C.ink, align: 'center' });
    });
    // d3: those who refused, pushed out
    const out = from(t, 'd3', 0.3, 2.4);
    for (let i = 0; i < 9; i++) {
      const ang = -0.5 + i * 0.32, d = 170 + out * 190;
      A(out * (1 - 0.4 * out), () => { ctx.fillStyle = C.szdp; ctx.beginPath(); ctx.arc(510 + Math.cos(ang) * d, cy + Math.sin(ang) * d * 0.9, 14, 0, TAU); ctx.fill(); });
    }
  });
  column(240, [['date', 'JUNE 1948'], ['mid', 'MDP'], ['p', 'Hungarian Working People’s Party', { lines: 1 }], ['s', 'Communists and Social Democrats merged']], beat(t, 'd2'));
  column(260, [['h', 'Anna Kéthly', { lines: 1 }], ['p', 'and the Social Democrats who refused: pushed out', { lines: 2 }], ['gap', 20], ['h', 'President Zoltán Tildy', { lines: 1 }], ['p', 'forced to resign', { lines: 1 }]], beat(t, 'd3'));
  // d5–d7: the single list
  const bl = during(t, 'd5', 'd7');
  A(bl, () => {
    const drop = from(t, 'd6', 0.9, 1.8), toBooth = from(t, 'd7', 0.0, 0.8);
    const bw = 420;
    // YES: dropped into the box as it is
    A(1 - toBooth, () => {
      const by = lerp(190, 560, drop), sc = lerp(0.8, 0.3, drop);
      A(from(t, 'd6', 0.0), () => ballotBox(510, 600, 340));
      ctx.save(); ctx.translate(510, by + 235 * sc); ctx.scale(sc, sc); ctx.translate(-510, -235);
      A(1 - clamp((drop - 0.85) * 7), () => ballot1949(510 - bw / 2, 0, bw));
      ctx.restore();
      A(from(t, 'd6', 1.6), () => chip('YES: no mark at all', 510, 866, { color: C.accLt, size: 34 }));
    });
    // NO: behind the curtain, two lines
    A(toBooth, () => {
      ctx.fillStyle = 'rgba(127,156,192,0.12)'; ctx.fillRect(160, 190, 700, 640);
      ctx.fillStyle = '#4a5466';
      for (let i = 0; i < 9; i++) { const x = 160 + i * 18; ctx.fillRect(x, 190, 12, 640); }
      txt('BOOTH', 200 + 150, 230, { size: 34, weight: 800, family: HEAD, color: C.soft, align: 'center' });
      ballot1949(420, 260, 360, { cross: from(t, 'd7', 1.2, 1.6) });
      // the clock: time in the booth could be noted
      const cx = 822, cy = 330, ang = (t - s('d7')) * 1.6;
      ctx.strokeStyle = C.soft; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 36, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang - Math.PI / 2) * 26, cy + Math.sin(ang - Math.PI / 2) * 26); ctx.stroke();
      A(from(t, 'd7', 2.4), () => chip('NO: two lines', 510, 866, { color: C.stamp, size: 34 }));
    });
  });
  column(260, [['date', '15 MAY 1949'], ['h', 'One list', { lines: 1 }], ['p', 'the People’s Front’s, drawn up by the MDP', { lines: 2 }]], beat(t, 'd5'));
  column(280, [['h', 'To vote yes', { lines: 1 }], ['p', 'drop the ballot in as it is', { lines: 1 }]], beat(t, 'd6'));
  column(260, [['h', 'To vote no', { lines: 1 }], ['p', 'cross out the circle with two lines, behind the curtain', { lines: 2 }], ['s', 'taking long could be noted']], beat(t, 'd7'));
  // d9: the constitution
  A(during(t, 'd9', 'd9'), () => {
    paper(270, 230, 480, 560, { rot: -0.02 });
    ctx.save(); ctx.translate(510, 510); ctx.rotate(-0.02);
    txtFit('ACT XX OF 1949', 0, -200, 430, { size: 34, weight: 800, family: HEAD, color: C.pInk, align: 'center', spacing: '2px' });
    txtFit('CONSTITUTION', 0, -140, 430, { size: 44, weight: 800, family: HEAD, color: C.pInk, align: 'center', spacing: '2px' });
    txtFit('of the People’s Republic of Hungary', 0, -86, 420, { size: 32, weight: 500, color: C.pSoft, align: 'center' });
    for (let i = 0; i < 8; i++) { ctx.fillStyle = C.pLine; ctx.fillRect(-180, -30 + i * 30, 360 - (i % 3) * 40, 8); }
    ctx.restore();
    stamp('MODEL: USSR, 1936', 520, 700, from(t, 'd9', 2.0, 0.5), { size: 34, rot: -0.09, maxW: 420 });
  });
  column(260, [['date', '20 AUGUST 1949'], ['h', 'A constitution on the Soviet model', { lines: 2 }], ['p', 'Hungary becomes a People’s Republic', { lines: 1 }]], beat(t, 'd9'));
  // d10: the Kossuth arms give way to the red-star emblem, on the flag too
  A(during(t, 'd10', 'd10'), () => {
    const p = from(t, 'd10', 0.8, 1.4);
    A(1 - p, () => kossuthArms(510, 470, 320));
    A(p, () => { flag(510, 470, 520, { hole: 0 }); rakosiEmblem(510, 470, 86); });
    A(from(t, 'd10', 2.4), () => txt('the state emblem of 1949', 510, 700, { size: 34, weight: 500, color: C.soft, align: 'center' }));
  });
  column(260, [['h', 'A new state emblem', { lines: 1 }], ['p', 'with a red star, instead of the Kossuth arms', { lines: 2 }]], beat(t, 'd10'));
}

// ---------- 5: show trials ----------
/** A case file card: name, lines, and an optional stamp. */
function fileCard(x, y, w, h, title, lines, { rot = -0.015, stampTxt = null, stampP = 0, stampCol = C.stamp } = {}) {
  paper(x, y, w, h, { rot });
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = C.paper2; ctx.fillRect(0, 0, w, 64);
  txt('FILE', 28, 34, { size: 32, weight: 800, family: HEAD, color: C.pSoft, spacing: '3px' });
  txtFit(title, 28, 112, w - 56, { size: 44, weight: 800, family: HEAD, color: C.pInk });
  lines.forEach((l, i) => txtFit(l, 28, 180 + i * 50, w - 56, { size: 33, weight: 500, color: C.pInk }));
  ctx.restore();
  if (stampTxt) stamp(stampTxt, x + w / 2, y + h - 74, stampP, { col: stampCol, size: 34, rot: -0.1, maxW: w - 60 });
}
function partTrials(t) {
  // e2: Mindszenty
  A(during(t, 'e2', 'e2'), () => fileCard(250, 220, 540, 520, 'MINDSZENTY, József', ['Cardinal, Archbishop of Esztergom', 'arrested 26 December 1948', 'sentenced February 1949'], { stampTxt: 'LIFE SENTENCE', stampP: from(t, 'e2', 5.0, 0.5) }));
  column(260, [['date', '26 DECEMBER 1948'], ['h', 'Cardinal József Mindszenty', { lines: 1 }], ['p', 'head of the Catholic Church in Hungary', { lines: 1 }]], beat(t, 'e2'));
  // e3: Moscow, Belgrade, Budapest
  A(during(t, 'e3', 'e3'), () => {
    const M = [800, 250], B = [420, 700], BP = [330, 450];
    txt('schematic map', 140, 820, { size: 32, weight: 500, color: C.faint });
    const br = from(t, 'e3', 1.2, 0.8);
    ctx.strokeStyle = C.soft; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(...M); ctx.lineTo(lerp(M[0], B[0], 0.5 - 0.03 * br), lerp(M[1], B[1], 0.5 - 0.03 * br)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lerp(M[0], B[0], 0.5 + 0.03 * br), lerp(M[1], B[1], 0.5 + 0.03 * br)); ctx.lineTo(...B); ctx.stroke();
    A(br, () => { const mx = lerp(M[0], B[0], 0.5), my = lerp(M[1], B[1], 0.5); ctx.strokeStyle = C.stamp; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(mx - 24, my - 24); ctx.lineTo(mx + 24, my + 24); ctx.moveTo(mx + 24, my - 24); ctx.lineTo(mx - 24, my + 24); ctx.stroke(); txt('1948: the split', mx + 40, my + 6, { size: 34, weight: 700, color: C.stamp }); });
    [[M, 'Moscow', 'Stalin'], [B, 'Belgrade', 'Tito'], [BP, 'Budapest', 'Rajk']].forEach(([p, n, who], i) => {
      ctx.fillStyle = i === 2 ? C.accLt : C.ink; ctx.beginPath(); ctx.arc(p[0], p[1], 11, 0, TAU); ctx.fill();
      txt(n, i === 2 ? p[0] - 22 : p[0] + 22, p[1] - 12, { size: 36, weight: 700, color: C.ink, align: i === 2 ? 'right' : 'left' });
      if (i < 2) txt(who, p[0] + 22, p[1] + 26, { size: 32, weight: 500, color: C.soft });
    });
    A(from(t, 'e3', 3.0), () => { trace([[M[0] - 20, M[1] + 20], [BP[0] + 30, BP[1] - 14]], from(t, 'e3', 3.0, 1.2), C.soviet, { w: 4, dash: [8, 8], headSize: 16 }); txt('hunt for “Titoists”', 160, 520, { size: 34, weight: 700, color: C.soviet }); });
  });
  column(250, [['date', 'JUNE 1948'], ['h', 'Stalin breaks with Tito', { lines: 1 }], ['p', 'every Soviet ally hunts for “Titoists”', { lines: 2 }]], beat(t, 'e3'));
  // e4–e7: the Rajk file, the court, the script
  const rajkLines = ['1909–1949 · Communist', 'fought in the Spanish Civil War', 'interior minister 1946–1948', 'foreign minister 1948–1949'];
  A(during(t, 'e4', 'e4'), () => fileCard(250, 200, 540, 560, 'RAJK, László', rajkLines, { stampTxt: 'ARRESTED · 1949', stampP: from(t, 'e4', 3.0, 0.5) }));
  column(280, [['h', 'László Rajk', { lines: 1 }], ['p', 'veteran Communist, former interior minister', { lines: 2 }]], beat(t, 'e4'));
  A(during(t, 'e5', 'e5'), () => {
    // the People's Court as plain shapes, and a radio microphone
    ctx.fillStyle = '#3a3128'; ctx.fillRect(200, 300, 620, 90);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = C.faint; ctx.beginPath(); ctx.arc(390 + i * 120, 270, 30, 0, TAU); ctx.fill(); }
    ctx.fillStyle = C.soft; ctx.beginPath(); ctx.arc(510, 560, 30, 0, TAU); ctx.fill(); ctx.fillRect(480, 590, 60, 110);
    txt('Rajk', 510, 740, { size: 34, weight: 700, color: C.soft, align: 'center' });
    // microphone
    const mx = 690, my = 520; ctx.fillStyle = '#9aa0a8'; rr(mx - 20, my - 50, 40, 80, 20); ctx.fill(); ctx.fillRect(mx - 3, my + 30, 6, 160); ctx.fillRect(mx - 40, my + 188, 80, 10);
    for (let i = 1; i <= 3; i++) A(0.5 + 0.5 * Math.sin(t * 3 - i), () => { ctx.strokeStyle = C.accLt; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx, my - 10, 40 + i * 26, -0.9, 0.9); ctx.stroke(); });
    A(from(t, 'e5', 1.0), () => txt('broadcast on the radio', 690, 820, { size: 34, weight: 700, color: C.accLt, align: 'center' }));
  });
  column(240, [['date', 'SEPTEMBER 1949'], ['h', 'The People’s Court', { lines: 1 }], ['p', 'charged with spying for the West and a plot with Tito', { lines: 2 }]], beat(t, 'e5'));
  A(during(t, 'e6', 'e7'), () => {
    paper(250, 200, 520, 600, { rot: 0.02 });
    ctx.save(); ctx.translate(510, 500); ctx.rotate(0.02);
    txt('THE SCRIPT', 0, -240, { size: 40, weight: 800, family: HEAD, color: C.pInk, align: 'center', spacing: '3px' });
    for (let i = 0; i < 6; i++) {
      const y = -170 + i * 62, q = i % 2 === 0;
      txt(q ? 'Q' : 'A', -200, y, { size: 34, weight: 800, family: HEAD, color: q ? C.pSoft : C.pInk });
      ctx.fillStyle = C.pLine; ctx.fillRect(-160, y - 6, 300 + ((i * 37) % 60), 10);
    }
    ctx.restore();
    stamp('WRITTEN IN ADVANCE', 510, 680, from(t, 'e6', 2.4, 0.5), { size: 34, rot: -0.08, maxW: 460 });
  });
  column(270, [['h', 'Rajk confesses to everything', { lines: 2 }], ['p', 'every question and answer written beforehand', { lines: 2 }]], beat(t, 'e6'));
  column(220, [['s', 'Witnesses to the UN Special Committee, 1957', { lines: 2 }], ['h', 'the accused were tortured', { lines: 1 }], ['gap', 10], ['h', 'János Kádár', { lines: 1, color: C.accLt }], ['p', 'interior minister, promised Rajk his life for a confession', { lines: 2 }]], beat(t, 'e7'));
  // e8: the verdict
  A(during(t, 'e8', 'e8'), () => {
    txt('15 OCTOBER 1949', 510, 260, { size: 48, weight: 800, family: HEAD, color: C.ink, align: 'center', spacing: '3px' });
    [['László Rajk', 'former interior minister'], ['Tibor Szőnyi', 'party cadre chief'], ['András Szalai', 'his deputy']].forEach(([n, r], i) => {
      const y = 380 + i * 130, p = from(t, 'e8', 0.6 + i * 0.4);
      A(p, () => { card(220, y - 50, 580, 100, { bg: 'rgba(31,36,44,0.9)', line: C.hair }); txt(n, 250, y - 10, { size: 40, weight: 700, color: C.ink }); txt(r, 250, y + 28, { size: 32, weight: 500, color: C.soft }); });
    });
    A(from(t, 'e8', 2.6), () => txt('hanged', 510, 790, { size: 38, weight: 700, color: C.soft, align: 'center' }));
  });
  column(260, [['h', 'Rajk, Szőnyi and Szalai hanged', { lines: 2 }], ['gap', 20], ['p', 'then secret side trials', { lines: 1 }]], beat(t, 'e8'));
  // e9: Rákosi's words
  A(beat(t, 'e9'), () => {
    card(170, 260, 1580, 380, { bg: 'rgba(31,36,44,0.75)', line: C.accDk });
    para('“Behind the mistakes, look for and find the hand of the enemy.”', W / 2, 420, { size: 60, weight: 'italic 500', color: C.ink, maxW: 1400, lh: 76 });
    txt('Mátyás Rákosi, 30 September 1949', W / 2, 590, { size: 36, weight: 700, color: C.accLt, align: 'center' });
  });
  // e10: Kádár, arrested in his turn
  A(during(t, 'e10', 'e10'), () => fileCard(250, 220, 540, 520, 'KÁDÁR, János', ['interior minister 1948–1950', 'arrested 1951', 'invented charges'], { stampTxt: 'LIFE SENTENCE', stampP: from(t, 'e10', 4.2, 0.5) }));
  column(250, [['h', 'If Rajk, then anyone', { lines: 1, color: C.accLt }], ['p', 'nobody was safe', { lines: 1 }], ['gap', 20], ['date', '1951'], ['h', 'Kádár himself arrested', { lines: 1 }]], beat(t, 'e10'));
  // e11: fabricated
  A(during(t, 'e11', 'e11'), () => fileCard(250, 200, 540, 560, 'RAJK, László', rajkLines, { stampTxt: 'FABRICATED', stampP: from(t, 'e11', 2.6, 0.5) }));
  column(260, [['date', '27 MARCH 1956'], ['h', 'The charges against Rajk declared fabricated', { lines: 2 }], ['s', 'six and a half years after his death']], beat(t, 'e11'));
}

// ---------- 6: Rákosi's Hungary ----------
function frame(cx, cy, w, h, name, { dark = 0 } = {}) {
  ctx.strokeStyle = C.gold; ctx.lineWidth = 14; ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  ctx.strokeStyle = 'rgba(201,167,94,0.5)'; ctx.lineWidth = 3; ctx.strokeRect(cx - w / 2 + 16, cy - h / 2 + 16, w - 32, h - 32);
  ctx.fillStyle = 'rgba(201,167,94,0.08)'; ctx.fillRect(cx - w / 2 + 8, cy - h / 2 + 8, w - 16, h - 16);
  txt(name, cx, cy, { size: 40, weight: 800, family: HEAD, color: C.gold, align: 'center', spacing: '3px' });
  if (dark > 0) A(dark, () => { ctx.fillStyle = '#0b0c0e'; ctx.save(); ctx.translate(cx + w / 2 - 40, cy - h / 2 + 40); ctx.rotate(Math.PI / 4); ctx.fillRect(-120, -16, 240, 32); ctx.restore(); });
}
function partRakosi(t) {
  // g1: the pyramid of power
  A(during(t, 'g1', 'g1'), () => {
    const rows = [['Hungary', 760, 'rgba(127,156,192,0.25)'], ['one party, the MDP', 520, 'rgba(207,79,67,0.55)'], ['Mátyás Rákosi', 300, C.mkp]];
    rows.forEach(([n, w, col], i) => {
      const y = 700 - i * 150, p = from(t, 'g1', 0.4 + i * 0.9, 0.7);
      A(p, () => { ctx.fillStyle = col; rr(510 - w / 2, y - 60, w, 120, 10); ctx.fill(); txtFit(n, 510, y, w - 30, { size: 40, weight: 800, family: HEAD, color: C.ink, align: 'center' }); });
    });
  });
  column(280, [['h', 'One party, one man', { lines: 1 }], ['p', 'Mátyás Rákosi, the party’s general secretary', { lines: 2 }]], beat(t, 'g1'));
  // g2–g3: the portraits, and the birthday
  A(during(t, 'g2', 'g4'), () => {
    frame(330, 470, 300, 380, 'STALIN'); frame(690, 470, 300, 380, 'RÁKOSI');
    txt('portraits in pairs', 510, 720, { size: 34, weight: 500, color: C.soft, align: 'center' });
  });
  column(260, [['q', '“Stalin’s best Hungarian disciple”', { lines: 2 }], ['p', 'as the press called him', { lines: 1 }]], beat(t, 'g2'));
  A(beat(t, 'g3'), () => {
    column(220, [['date', '9 MARCH 1952'], ['h', 'his 60th birthday', { lines: 1 }]], 1);
    // a palace filling with gifts
    const x0 = RCX - 320, y0 = 420, w = 640, h = 320, n = 48, p = from(t, 'g3', 1.4, 3.4);
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, y0 + h); ctx.lineTo(x0, y0 + 60); ctx.lineTo(RCX, y0 - 20); ctx.lineTo(x0 + w, y0 + 60); ctx.lineTo(x0 + w, y0 + h); ctx.closePath(); ctx.stroke();
    for (let i = 0; i < Math.floor(n * p); i++) {
      const cx = x0 + 30 + (i % 12) * 50, cy = y0 + h - 30 - Math.floor(i / 12) * 52;
      ctx.fillStyle = [C.mkp, C.gold, C.accLt, C.fkgp][i % 4]; ctx.fillRect(cx - 18, cy - 18, 36, 36);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(cx - 3, cy - 18, 6, 36);
    }
    txt('gifts filled the former Palace of Justice', RCX, 800, { size: 34, weight: 500, color: C.soft, align: 'center' });
  });
  column(280, [['date', '14 AUGUST 1952'], ['h', 'also prime minister', { lines: 1 }]], beat(t, 'g4'));
  // g5: the five-year plan, the Stalin Ironworks on the Danube
  A(during(t, 'g5', 'g6'), () => {
    MAPX = 130; MAPY = 270;
    hungary({ a: 1 });
    const [dx, dy] = P(...TOWN.dunapentele);
    A(from(t, 'g5', 1.6), () => {
      for (let i = 0; i < 4; i++) { ctx.fillStyle = C.ink; ctx.fillRect(dx - 30 + i * 18, dy - 60 - (i % 2) * 14, 10, 60 + (i % 2) * 14); }
      for (let i = 0; i < 4; i++) A(0.4 + 0.3 * Math.sin(t * 1.3 + i), () => { ctx.fillStyle = 'rgba(236,230,214,0.35)'; ctx.beginPath(); ctx.arc(dx - 25 + i * 18 + Math.sin(t + i) * 4, dy - 80 - (i % 2) * 14 - ((t * 10 + i * 9) % 30), 7, 0, TAU); ctx.fill(); });
      txt('Stalin Ironworks', dx + 34, dy + 4, { size: 34, weight: 700, color: C.ink });
    });
    town('Budapest', 'budapest', 1, { col: C.soft });
  });
  column(240, [['date', '1950–1954'], ['h', 'The five-year plan', { lines: 1 }], ['p', 'heavy industry first', { lines: 1 }]], beat(t, 'g5'));
  // g6: three things, and real wages
  A(beat(t, 'g6'), () => {
    const items = ['collective farms', 'the ÁVH', 'prisons and camps'];
    items.forEach((n, i) => A(from(t, 'g6', 0.3 + i * 1.3, 0.6), () => { const y = 250 + i * 86; card(RCX - 320, y - 36, 640, 72, { bg: 'rgba(31,36,44,0.8)', line: C.hair }); txt(n, RCX, y, { size: 38, weight: 700, color: C.ink, align: 'center' }); }));
    A(from(t, 'g6', 4.4), () => {
      txt('real wages, 1949 = 100', RCX, 540, { size: 36, weight: 700, color: C.soft, align: 'center' });
      const base = 790, hmax = 160;
      [[1949, 100], [1953, WAGE53]].forEach(([yr, v], i) => {
        const x = RCX - 120 + i * 240, g = from(t, 'g6', 4.6 + i * 0.5, 0.8), hh = (v / 100) * hmax * g;
        ctx.fillStyle = i ? C.mkp : C.accLt; ctx.fillRect(x - 60, base - hh, 120, hh);
        txt(String(yr), x, base + 30, { size: 32, weight: 700, color: C.soft, align: 'center' });
        A(g, () => txt(String(v), x, base - hh - 26, { size: 38, weight: 800, family: HEAD, color: C.ink, align: 'center' }));
      });
    });
  });
  // g8: Stalin dies
  A(during(t, 'g8', 'g8'), () => {
    frame(330, 470, 300, 380, 'STALIN', { dark: from(t, 'g8', 1.0) }); frame(690, 470, 300, 380, 'RÁKOSI');
  });
  column(240, [['date', '5 MARCH 1953'], ['h', 'Stalin dies', { lines: 1 }], ['p', 'his “immortal memory” written into Hungarian law', { lines: 2 }]], beat(t, 'g8'));
  // g9: the eight years, on a timeline; Soviet troops underneath it all
  A(during(t, 'g9', 'g10'), () => {
    const x0 = 160, x1 = 1760, y = 420, X = (yr) => x0 + ((yr - 1945) / (1957 - 1945)) * (x1 - x0);
    ctx.strokeStyle = C.soft; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    const ms = [[1945.84, 'free vote', C.fkgp], [1947.66, 'blue slips', '#9db8dc'], [1948.45, 'one party', C.mkp], [1949.37, 'one list', C.accLt], [1952.62, 'one man', C.mkp], [1953.18, 'Stalin dies', C.soft]];
    ms.forEach(([yr, n, col], i) => {
      const p = from(t, 'g9', 0.2 + i * 0.5, 0.6), x = X(yr), up = i % 2 === 0;
      A(p, () => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + (up ? -16 : 16)); ctx.lineTo(x, y + (up ? -70 : 70)); ctx.stroke();
        txt(n, x, y + (up ? -96 : 100), { size: 34, weight: 700, color: col, align: 'center' });
      });
    });
    // Soviet troops, the whole time
    A(from(t, 'g9', 4.0), () => {
      ctx.fillStyle = 'rgba(211,117,99,0.25)'; ctx.fillRect(x0, y + 170, X(1956.82) - x0, 40);
      for (let i = 0; i < 30; i++) { ctx.fillStyle = C.soviet; rr(x0 + 10 + i * ((X(1956.82) - x0 - 20) / 30), y + 180, 20, 20, 4); ctx.fill(); }
      txt('Soviet troops in Hungary', x0, y + 250, { size: 34, weight: 700, color: C.soviet });
    });
    // g10: what would bring people out
    const words = ['terror', 'deportations', 'poverty', 'foreign troops'];
    words.forEach((n, i) => A(from(t, 'g10', 0.3 + i * 0.9, 0.6), () => { const x = 300 + i * 360; chip(n, x, 820, { color: C.accLt, size: 36, bg: 'rgba(31,36,44,0.92)' }); }));
    A(from(t, 'g10', 4.2), () => {
      const xo = X(1956.81); flag(xo, y, 90);
      txt('23 OCTOBER 1956', xo, y - 110, { size: 34, weight: 800, family: HEAD, color: C.ink, align: 'right' });
    });
  });
  // g11: the emblem is cut out of the flag
  A(beat(t, 'g11', DURATION + 1), () => {
    const cut = from(t, 'g11', 0.9, 1.6), lift = from(t, 'g11', 2.6, 1.4);
    const w = 900, cx = W / 2, cy = 470, R = ((w * 0.62) / 3) * 0.42;
    flag(cx, cy, w, { hole: lift > 0 ? 1 : 0 });
    if (lift <= 0) rakosiEmblem(cx, cy, R * 1.05);
    if (cut > 0 && lift <= 0) { ctx.strokeStyle = C.bg0; ctx.lineWidth = 5; ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * cut); ctx.stroke(); ctx.setLineDash([]); }
    if (lift > 0) A(1 - lift, () => rakosiEmblem(cx + lift * 260, cy - lift * 420, R * 1.05, lift));
    A(from(t, 'g11', 3.8), () => {
      txt('NEXT: WHY HUNGARY ROSE', cx, 840, { size: fit('NEXT: WHY HUNGARY ROSE', 1400, 52, { weight: 800, family: HEAD, spacing: '4px' }), weight: 800, family: HEAD, color: C.accLt, align: 'center', spacing: '4px' });
    });
  });
}

// ---------- title cards and credits ----------
const CARD_YEARS = ['1944–1945', '1945–1946', '1946–1947', '1948–1949', '1948–1956', '1949–1953'];
function titleCards(t) {
  CH.forEach((ch, i) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.9, () => { ctx.fillStyle = C.card; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8)), y = 470 + (1 - p) * 18;
      txt(`PART ${ch.n}`, W / 2, y - 130, { size: 38, weight: 700, family: HEAD, color: C.acc, align: 'center', spacing: '8px' });
      const title = ch.title.toUpperCase();
      txt(title, W / 2, y, { size: fit(title, 1560, 120, { weight: 800, family: HEAD, spacing: '3px' }), weight: 800, family: HEAD, align: 'center', spacing: '3px' });
      tricolour(W / 2, y + 86, 360, 8);
      txt(CARD_YEARS[i] ?? '', W / 2, y + 160, { size: 44, weight: 500, color: C.soft, align: 'center' });
    });
  });
}
const MUSIC = ['“Penumbra” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Inexorable” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  'UN Special Committee on the Problem of Hungary, Report (1957); US Office of the Historian, FRUS 1945–1949;',
  'Library of Congress, Hungary: A Country Study; Magyarország a XX. században (Babits, 1996–2000);',
  'György Gyarmati (TTE 2019; Betekintő 2015); Attila Csönge (Múltunk 2009); Károly Szerencsés (Rubicon);',
  'US Holocaust Memorial Museum; Tamás Stark (Hungarian Review 2020); Hanke and Krus (Cato, 2012);',
  '1956 Institute (Attila Szakolczai’s lessons); hvg.hu; Museum of Ethnography; Columbia Encyclopedia.',
];
function credits(t) {
  ctx.drawImage(BG, 0, 0);
  ctx.fillStyle = 'rgba(10,12,15,0.55)'; ctx.fillRect(0, 0, W, H);
  flag(W / 2, 120, 96);
  txt('BEFORE OCTOBER', W / 2, 232, { size: fit('BEFORE OCTOBER', 1500, 84, { weight: 800, family: HEAD, spacing: '4px' }), weight: 800, family: HEAD, align: 'center', spacing: '4px' });
  txt('HUNGARY 1945–1956', W / 2, 300, { size: 40, weight: 700, family: HEAD, color: C.accLt, align: 'center', spacing: '5px' });
  txt('Hungary 1956 · original animation', W / 2, 372, { size: 40, weight: 500, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 454, { size: 34, weight: 800, family: HEAD, color: C.acc, align: 'center', spacing: '5px' });
  MUSIC.forEach((m, j) => txtFit(m, W / 2, 504 + j * 46, 1700, { size: 33, weight: 500, align: 'center' }));
  const y0 = 504 + Math.max(1, MUSIC.length) * 46 + 50;
  txt('SOURCES', W / 2, y0, { size: 34, weight: 800, family: HEAD, color: C.acc, align: 'center', spacing: '5px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, y0 + 50 + j * 46, 1720, { size: 32, weight: 500, align: 'center', color: C.soft }));
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [HEAD, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    const parts = [partOpen, partWar, partVote, partSalami, partOneList, partTrials, partRakosi];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    // the year ruler, from the end of the cold open on (under the cards and the credits)
    ruler(t, seg(t, s('o4', 0.2), s('o4', 1.2)) * (1 - seg(t, e('o4', 0.2), e('o4', 0.9))) + seg(t, CH[0].at + 3.0, CH[0].at + 3.8) * (1 - seg(t, s('g11', 0.5), s('g11', 1.5))));
    titleCards(t);
    A(seg(t, e('g11', 1.4), e('g11', 2.6)), () => credits(t));
  },
});
