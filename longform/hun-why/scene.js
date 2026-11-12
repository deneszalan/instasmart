// "Why Hungary rose" („Miért kelt fel az ország?”): the long film of Hungary 1956's section Why, 16:9, 1920x1080.
// Six causes, chapter by chapter, and down the right of the screen a list of grievances that grows by one card a
// chapter; at the end each card is matched with a point of the students' sixteen points of 22 October 1956, drawn as a
// typed sheet. A year strip along the top marks the years each chapter covers.
// Look (the series look): deep ink ground with a faint paper grain, Archivo for titles and cards, Alegreya Sans for
// everything else, the 1956 flag with the hole as the series emblem, a tricolour rule under chapter titles; this film's
// accent is ochre (#cfa548). Plain shapes only: no faces, no violence on screen, crowds and soldiers as simple figures.
// The same scene plays the Hungarian version: kit.js swaps every whole string for its labels-fr.json entry (hu-HU), so
// words and numbers are drawn as separate strings, and decimals go through dec(). Hungary is drawn from the series'
// outline (explainers/earth-last-fighting-csepel-dunapentele.js); every map is schematic and says so.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
/** A moment a fraction f of the way through a line, so an animation can follow the words within it. */
const at = (key, f) => T[key][0] + (T[key][1] - T[key][0]) * f;
const TAU = Math.PI * 2;

const C = {
  ink: '#ece6d6', soft: 'rgba(236,230,214,0.74)', faint: 'rgba(236,230,214,0.22)', ghost: 'rgba(236,230,214,0.09)',
  ochre: '#cfa548', ochreDim: 'rgba(207,165,72,0.32)', ochreGlow: 'rgba(207,165,72,0.16)', ochreDk: '#8a6a24',
  red: '#c63a32', white: '#ece6d6', green: '#3f7f52',
  steel: '#8ea3b6', steelDk: '#34414e', steelMid: '#566879', soviet: '#b8494a', sovietDim: 'rgba(184,73,74,0.35)',
  land: '#1e252d', landLine: 'rgba(236,230,214,0.55)', river: '#4b6e8c', night: 'rgba(12,20,40,0.55)',
  paper: '#e7dfc8', paper2: '#d8ceb2', pink: '#2a2620', pinkSoft: 'rgba(42,38,32,0.68)',
  card: 'rgba(13,16,20,0.94)', panel: 'rgba(22,26,32,0.9)', wheat: '#d9b45a', field: '#5d6b3c',
};
const HEAD = 'Archivo', TXT = 'Alegreya Sans';

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
const fin = (t, a, d = 0.6) => eout(seg(t, a, a + d));
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function txt(str, x, y, { size = 36, weight = 500, family = TXT, color = C.ink, align = 'left', spacing = '0px', base = 'middle' } = {}) {
  k.font(weight, size, family);
  k.text(str, x, y, { color, align, base, spacing });
}
function textW(str, { size = 36, weight = 500, family = TXT, spacing = '0px' } = {}) {
  k.font(weight, size, family); ctx.letterSpacing = spacing; const w = ctx.measureText(str).width; ctx.letterSpacing = '0px'; return w;
}
/** The largest size up to `size` at which str fits in maxW (measured in the render's language). */
function fit(str, maxW, size, o = {}) { let z = size; while (z > 22 && textW(str, { ...o, size: z }) > maxW) z -= 1; return z; }
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** A decimal the reader's way (9.2, in Hungarian 9,2): Kit.fmt does whole numbers only. */
const dec = (x, d = 1) => x.toLocaleString(window.TR?.locale ?? 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
function rrect(x, y, w, h, r, fill, line, lw = 3) {
  k.rrect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (line) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); }
}
/** A rounded label as wide as its text. */
function chip(str, cx, cy, { color = C.ink, bg = C.card, size = 34, weight = 700, a = 1, align = 'center', line = true, family = TXT } = {}) {
  const w = textW(str, { size, weight, family }), pad = size * 0.6, h = size * 1.55;
  const x0 = align === 'left' ? cx : align === 'right' ? cx - w - pad * 2 : cx - w / 2 - pad;
  A(a, () => {
    rrect(x0, cy - h / 2, w + pad * 2, h, h / 2, bg, line ? color : null);
    txt(str, x0 + pad + w / 2, cy + 1, { size, weight, color, align: 'center', family });
  });
  return w + pad * 2;
}
function arrowHead(x, y, ang, col, size = 20) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x + Math.cos(ang) * size, y + Math.sin(ang) * size);
  ctx.lineTo(x + Math.cos(ang + 2.5) * size, y + Math.sin(ang + 2.5) * size);
  ctx.lineTo(x + Math.cos(ang - 2.5) * size, y + Math.sin(ang - 2.5) * size);
  ctx.closePath(); ctx.fill();
}
/** A quadratic curve from p to q bowed by `bend`, drawn up to fraction u, with a head at the tip. */
function curve(p, q, u, col, { bend = 0.2, w = 5, dash = null, head = true, headSize = 18 } = {}) {
  if (u <= 0) return;
  const mx = (p[0] + q[0]) / 2 - (q[1] - p[1]) * bend, my = (p[1] + q[1]) / 2 + (q[0] - p[0]) * bend;
  const pt = (v) => [(1 - v) ** 2 * p[0] + 2 * (1 - v) * v * mx + v * v * q[0], (1 - v) ** 2 * p[1] + 2 * (1 - v) * v * my + v * v * q[1]];
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...p);
  const n = 40;
  for (let i = 1; i <= n * u; i++) ctx.lineTo(...pt(i / n));
  const tip = pt(u); ctx.lineTo(...tip); ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  if (head) { const b = pt(Math.max(0, u - 0.03)); arrowHead(tip[0], tip[1], Math.atan2(tip[1] - b[1], tip[0] - b[0]), col, headSize); }
}
/** A plain standing figure: head and body, no face. */
function figure(x, y, h, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - h * 0.82, h * 0.13, 0, TAU); ctx.fill();
  k.rrect(x - h * 0.17, y - h * 0.64, h * 0.34, h * 0.64, h * 0.12); ctx.fill();
}
/** A number, big, with a label under it (drawn as separate strings, so both are translated). */
function counter(num, label, x, y, { a = 1, color = C.ochre, size = 72, sub = null, align = 'left', labelSize = 34, maxW = 340 } = {}) {
  A(a, () => {
    txt(num, x, y, { size, weight: 800, family: HEAD, color, align });
    if (label) txtFit(label, x, y + size * 0.78, maxW, { size: labelSize, weight: 600, color: C.ink, align });
    if (sub) [].concat(sub).forEach((l, j) => txtFit(l, x, y + size * 0.78 + labelSize * 1.25 + j * 38, maxW, { size: 32, weight: 500, color: C.soft, align }));
  });
}

// ---------- the background, painted once: deep ink with a faint paper grain ----------
let BG = null;
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const g = BG.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#181c22'); gr.addColorStop(1, '#111418');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const v = g.createRadialGradient(W * 0.4, H * 0.45, 150, W / 2, H / 2, 1250);
  v.addColorStop(0, 'rgba(236,222,190,0.035)'); v.addColorStop(1, 'rgba(0,0,0,0.22)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30000; i++) {
    const x = rnd(i) * W, y = rnd(i + 99991) * H, l = rnd(i + 7777);
    g.fillStyle = l > 0.55 ? `rgba(236,230,214,${(0.01 + 0.035 * (l - 0.55)).toFixed(3)})` : `rgba(0,0,0,${(0.06 * l).toFixed(3)})`;
    g.fillRect(x, y, 1.5, 1.5);
  }
  g.lineWidth = 1;
  for (let i = 0; i < 260; i++) {
    const x = rnd(i + 5) * W, y = rnd(i + 55) * H, a = rnd(i + 555) * TAU, l = 18 + rnd(i + 5555) * 70;
    g.strokeStyle = 'rgba(236,230,214,0.016)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
}

// ---------- the series emblem: the flag of 1956 with the hole ----------
function flag(x, y, w, h, { hole = 1 } = {}) {
  ctx.fillStyle = C.red; ctx.fillRect(x, y, w, h / 3);
  ctx.fillStyle = C.green; ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
  ctx.beginPath(); ctx.rect(x, y + h / 3, w, h / 3);
  if (hole > 0) { const r = h * 0.14 * hole; ctx.moveTo(x + w / 2 + r, y + h / 2); ctx.arc(x + w / 2, y + h / 2, r, 0, TAU, true); }
  ctx.fillStyle = C.white; ctx.fill('evenodd');
}
function tricolour(cx, y, w = 240, h = 6) {
  ctx.fillStyle = C.red; ctx.fillRect(cx - w / 2, y, w / 3, h);
  ctx.fillStyle = C.white; ctx.fillRect(cx - w / 6, y, w / 3, h);
  ctx.fillStyle = C.green; ctx.fillRect(cx + w / 6, y, w / 3, h);
}

// ---------- the year strip along the top ----------
const Y0 = 1944, Y1 = 1957, YX0 = 150, YX1 = 1380, YY = 112;
const yx = (yr) => lerp(YX0, YX1, (yr - Y0) / (Y1 - Y0));
function yearStrip(a, from, to, { mark = null, markLabel = null } = {}) {
  A(a, () => {
    ctx.fillStyle = C.faint; ctx.fillRect(YX0, YY, YX1 - YX0, 2);
    if (from != null) { ctx.fillStyle = C.ochre; ctx.fillRect(yx(from), YY - 3, yx(to) - yx(from), 8); }
    for (let yr = Y0; yr < Y1; yr++) {
      const on = from != null && yr >= Math.floor(from) && yr < to;
      ctx.fillStyle = on ? C.ochre : C.faint; ctx.fillRect(yx(yr) - 1, YY - 8, 2, 18);
      txt(String(yr), yx(yr + 0.5), YY - 28, { size: 26, weight: on ? 700 : 500, color: on ? C.ochre : C.faint, align: 'center' });
    }
    if (mark != null) {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(yx(mark), YY + 1, 9, 0, TAU); ctx.fill();
      if (markLabel) txt(markLabel, Math.min(yx(mark), YX1 - 60), YY + 40, { size: 32, weight: 700, color: C.ink, align: 'center' });
    }
  });
}

// ---------- the list of grievances (right column) ----------
const LX = 1452, LW = 372, LY = 196, LH = 86, LGAP = 100;
const LEDGER = [
  { key: 'a10', label: 'Fear of the ÁVH', icon: 'eye', pts: [['12', 'f8', 0.62], ['ÁVH', 'f11', 0.3]] },
  { key: 'b11', label: 'Camps without trial', icon: 'wire', pts: [['11', 'f8', 0.12]] },
  { key: 'c10', label: 'Norms and pay', icon: 'gear', pts: [['9', 'f6', 0.12]] },
  { key: 'd9', label: 'Compulsory deliveries', icon: 'wheat', pts: [['10', 'f6', 0.6]] },
  { key: 'e4', label: 'Soviet troops', icon: 'star', pts: [['1', 'f5', 0.05]] },
  { key: 'e7', label: 'Reparations, uranium', icon: 'crate', pts: [['8', 'f5', 0.55]] },
  { key: 'e12', label: 'Foreign symbols', icon: 'flag', pts: [['14', 'f10', 0.4], ['13', 'f10', 0.1]] },
];
const cardY = (i) => LY + i * LGAP;
function icon(kind, x, y, col) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3;
  if (kind === 'eye') {
    ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.quadraticCurveTo(x, y - 16, x + 18, y); ctx.quadraticCurveTo(x, y + 16, x - 18, y); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 5.5, 0, TAU); ctx.fill();
  } else if (kind === 'wire') {
    ctx.beginPath(); ctx.moveTo(x - 20, y - 8); ctx.lineTo(x + 20, y - 8); ctx.moveTo(x - 20, y + 8); ctx.lineTo(x + 20, y + 8); ctx.stroke();
    for (const bx of [-12, 2, 16]) for (const by of [-8, 8]) { ctx.beginPath(); ctx.moveTo(bx - 4 + x, y + by - 4); ctx.lineTo(bx + 4 + x, y + by + 4); ctx.moveTo(bx + 4 + x, y + by - 4); ctx.lineTo(bx - 4 + x, y + by + 4); ctx.stroke(); }
  } else if (kind === 'gear') {
    ctx.beginPath(); for (let i = 0; i < 16; i++) { const r = i % 2 ? 12 : 17, a = (i / 16) * TAU; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.stroke();
  } else if (kind === 'wheat') {
    ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.lineTo(x, y - 16); ctx.stroke();
    for (let j = 0; j < 4; j++) { const yy = y - 12 + j * 8; ctx.beginPath(); ctx.ellipse(x - 6, yy, 6, 3, -0.6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 6, yy, 6, 3, 0.6, 0, TAU); ctx.fill(); }
  } else if (kind === 'star') {
    star(x, y, 17, col);
  } else if (kind === 'crate') {
    ctx.strokeRect(x - 17, y - 14, 34, 28); ctx.beginPath(); ctx.moveTo(x - 17, y - 14); ctx.lineTo(x + 17, y + 14); ctx.moveTo(x + 17, y - 14); ctx.lineTo(x - 17, y + 14); ctx.stroke();
  } else if (kind === 'flag') {
    ctx.beginPath(); ctx.moveTo(x - 16, y + 18); ctx.lineTo(x - 16, y - 18); ctx.stroke();
    ctx.fillRect(x - 14, y - 17, 30, 7); ctx.globalAlpha *= 0.55; ctx.fillRect(x - 14, y - 10, 30, 7); ctx.globalAlpha /= 0.55; ctx.fillRect(x - 14, y - 3, 30, 7);
  }
}
function star(x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r, a = -Math.PI / 2 + (i / 10) * TAU; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
/** The ledger: empty slots from the cold open, a card a chapter, the matching points in the last chapter. */
function ledger(t) {
  // shown from the cold open, hidden under the film's title, back with the first chapter
  const a0 = span(t, s('o3', 0.3), e('f13', 2.4), 0.8, 1.0) * (1 - span(t, e('o4', 0.0), CH[0].at + 3.4, 0.6, 0.6));
  if (a0 <= 0) return;
  A(a0, () => {
    txt('GRIEVANCES', LX + 4, LY - 44, { size: 30, weight: 800, family: HEAD, color: C.ochre, spacing: '4px' });
    LEDGER.forEach((c, i) => {
      const y = cardY(i), on = fin(t, e(c.key, 0.2), 0.8);
      ctx.setLineDash([6, 8]); rrect(LX, y, LW, LH, 12, null, C.faint, 2); ctx.setLineDash([]);
      if (on <= 0) return;
      const newest = span(t, e(c.key, 0.2), e(c.key, 6.0), 0.4, 2.0);
      A(on, () => {
        const dx = (1 - on) * 60;
        rrect(LX + dx, y, LW, LH, 12, C.panel, newest > 0 ? `rgba(207,165,72,${(0.35 + 0.65 * newest).toFixed(3)})` : 'rgba(207,165,72,0.35)', 3);
        ctx.fillStyle = C.ochre; ctx.fillRect(LX + dx, y + 10, 5, LH - 20);
        icon(c.icon, LX + dx + 44, y + LH / 2, C.ochre);
        txtFit(c.label, LX + dx + 80, y + LH / 2 + 1, LW - 96, { size: 33, weight: 700, color: C.ink });
      });
      // the matching points of 22 October, in the last chapter
      c.pts.forEach(([p, key, f], j) => {
        const pa = fin(t, at(key, f), 0.6);
        if (pa <= 0) return;
        const cx = LX - 34 - j * 58, cy = y + LH / 2;
        A(pa, () => {
          const r = 25 + (1 - pa) * 12;
          ctx.fillStyle = p === 'ÁVH' ? C.red : C.ochre; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
          txt(p, cx, cy + 1, { size: p === 'ÁVH' ? 20 : 28, weight: 800, family: HEAD, color: p === 'ÁVH' ? C.ink : '#16181c', align: 'center' });
        });
      });
    });
  });
}

// ---------- maps (schematic): Hungary from the series' outline ----------
const OUTLINE = [[16.11, 46.87], [16.28, 47.0], [16.45, 47.15], [16.48, 47.4], [16.43, 47.56], [16.64, 47.75], [16.9, 47.7], [17.05, 47.82], [17.16, 48.01],
  [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.87, 47.82], [19.05, 48.05], [19.48, 48.1], [19.75, 48.2], [20.05, 48.17], [20.3, 48.27], [20.55, 48.53],
  [21.12, 48.5], [21.45, 48.57], [21.72, 48.35], [22.15, 48.41], [22.4, 48.25], [22.9, 47.95], [22.7, 47.82], [22.3, 47.7], [22.02, 47.53], [21.95, 47.12],
  [21.65, 46.95], [21.4, 46.62], [21.05, 46.28], [20.7, 46.18], [20.26, 46.12], [19.85, 46.17], [19.4, 46.05], [18.95, 45.95], [18.8, 45.88], [18.45, 45.77],
  [18.15, 45.78], [17.7, 45.9], [17.4, 45.95], [17.15, 46.15], [16.88, 46.36], [16.6, 46.47], [16.38, 46.63]];
const DANUBE = [[17.16, 48.0], [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.95, 47.75], [19.06, 47.6], [19.05, 47.45], [18.95, 47.2], [18.93, 46.95], [18.92, 46.6], [18.85, 46.2], [18.8, 45.88]];
const mkP = (x0, y0, sc) => (lon, lat) => [x0 + (lon - 16.05) * sc * 0.682, y0 + (48.62 - lat) * sc];
const P = mkP(100, 300, 196);
const PLACES = {
  budapest: [19.04, 47.5], kistarcsa: [19.26, 47.55], recsk: [20.11, 47.93], tiszalok: [21.38, 48.02], kazinc: [20.62, 48.25],
  hortobagy: [21.12, 47.55], pecs: [18.23, 46.07], vienna: [16.37, 48.21],
};
function hungary(Pr, a = 1, { label = true, labelXY = null } = {}) {
  A(a, () => {
    ctx.beginPath(); OUTLINE.forEach(([lo, la], i) => (i ? ctx.lineTo(...Pr(lo, la)) : ctx.moveTo(...Pr(lo, la)))); ctx.closePath();
    ctx.fillStyle = C.land; ctx.fill(); ctx.strokeStyle = C.landLine; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.strokeStyle = C.river; ctx.lineWidth = 5;
    ctx.beginPath(); DANUBE.forEach(([lo, la], i) => (i ? ctx.lineTo(...Pr(lo, la)) : ctx.moveTo(...Pr(lo, la)))); ctx.stroke();
    if (label) { const [lx, ly] = labelXY ?? [Pr(16.1, 45.72)[0], Pr(16.1, 45.72)[1] + 10]; txt('schematic map', lx, ly, { size: 26, weight: 500, color: C.faint }); }
  });
}
function town(xy, name, { a = 1, dx = 16, dy = 0, align = 'left', col = C.ink, size = 32, r = 8, weight = 700 } = {}) {
  A(a, () => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xy[0], xy[1], r, 0, TAU); ctx.fill();
    if (name) txt(name, xy[0] + dx, xy[1] + dy, { size, weight, color: col, align });
  });
}
function camp(xy, a, col = C.steel, sz = 11, cross = true) {
  A(a, () => {
    ctx.fillStyle = col; ctx.fillRect(xy[0] - sz, xy[1] - sz, sz * 2, sz * 2);
    if (!cross) return;
    ctx.strokeStyle = '#111418'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(xy[0] - sz, xy[1]); ctx.lineTo(xy[0] + sz, xy[1]); ctx.moveTo(xy[0], xy[1] - sz); ctx.lineTo(xy[0], xy[1] + sz); ctx.stroke();
  });
}
// Twelve Hortobágy camps, placed schematically around the plain (seven in June 1950, five more by the end of 1952).
const HCAMPS = Array.from({ length: 12 }, (_, i) => [21.05 + Math.cos(i * 2.4) * (0.18 + 0.3 * rnd(i + 40)), 47.48 + Math.sin(i * 2.4) * (0.08 + 0.16 * rnd(i + 80))]);
// Villages near the southern and western borders (schematic): points just inside the outline.
const BORDER = (() => {
  const out = [], cx = 19.4, cy = 47.1;
  for (let i = 0; i < OUTLINE.length; i++) {
    const [a, b] = [OUTLINE[i], OUTLINE[(i + 1) % OUTLINE.length]];
    const south = a[1] < 46.3 && b[1] < 46.3 && a[0] > 17.0 && a[0] < 20.6, west = a[0] < 16.7 && b[0] < 16.7;
    if (!south && !west) continue;
    for (let j = 0; j < 3; j++) {
      const u = (j + 0.5) / 3, lo = lerp(a[0], b[0], u), la = lerp(a[1], b[1], u);
      out.push([lo + (cx - lo) * 0.05, la + (cy - la) * 0.07]);
    }
  }
  return out;
})();
// The area of the 138 villages (Kis-Kapin): Tápiószentmárton, Gadna, Tiszabecs, Kardoskút; 138 points inside it.
const AREA = [[19.75, 47.34], [20.93, 48.4], [22.82, 48.1], [20.7, 46.5]];
function inPoly(pt, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const VILLAGES = (() => {
  const out = [];
  for (let i = 0; out.length < 138 && i < 20000; i++) {
    const pt = [19.7 + rnd(i + 300) * 3.2, 46.45 + rnd(i + 900) * 2.0];
    if (inPoly(pt, AREA) && inPoly(pt, OUTLINE)) out.push(pt);
  }
  return out;
})();
if (VILLAGES.length !== 138) throw new Error(`villages: ${VILLAGES.length}`);
// Hungary's population on 1 January 1949 (KSH): 9,205,000. The ÁVH's proceedings 1950–53 (1956 Institute): 650,000.
const POP = 9205000, PROC = 650000, PER = 10000, NCELL = Math.round(POP / PER), NLIT = Math.round(PROC / PER);
const LIT = new Set(Array.from({ length: NCELL }, (_, i) => i).sort((p, q) => rnd(p + 4321) - rnd(q + 4321)).slice(0, NLIT));
// Convictions for "crimes against public supply" (KSH yearbook, via Bálint Magyar).
const CONV = [[1948, 23499], [1949, 22502], [1950, 26972], [1951, 47296], [1952, 39560], [1953, 20000], [1954, 3974], [1955, 5968]];
const CONV_SUM = CONV.reduce((n, [, v]) => n + v, 0);
if (CONV_SUM < 185000 || CONV_SUM > 200000) throw new Error('convictions: "almost 200,000"');
// The plan's investment (Domonkos, after Berend), billion forints.
const PLAN = [['1948 draft', 27.6], ['April 1949', 35], ['December 1949', 50.9], ['February 1951', 85]];
// Ikarus 1950: pay fell by 35.5% for the same output, so the norm rose by 1 / (1 − 0.355) − 1 ≈ 55%.
const IKARUS = 0.355, NORM_RISE = 1 / (1 - IKARUS);

// ---------- the sixteen points (cold open and the last chapter) ----------
const POINTS = ['All Soviet troops out', 'New party leaders, by secret ballot', 'A government under Imre Nagy', 'Rákosi and Farkas to answer',
  'Free elections; the right to strike', 'Equality with Moscow and Belgrade', 'The economy reorganized by experts', 'The truth on reparations and uranium',
  'Revise the norms; a minimum wage', 'Deliveries on a new basis', 'Review political trials; free the innocent', 'Free speech; destroy the personnel files',
  'Remove the Stalin statue', 'The Kossuth arms; 15 March a holiday', 'Solidarity with Poland', 'A youth parliament; march tomorrow'];
const SX = 150, SY = 164, SW = 880, SH = 790, SPITCH = 41, SL0 = SY + 132;
const lineY = (n) => SL0 + (n - 1) * SPITCH;
/** The typed sheet. `hl(n)` 0–1 highlights point n; `lines` 0–1 types the lines in; `dim` fades the unlit ones. */
function sheet(t, { a = 1, lines = 1, hl = () => 0, dim = 0, dx = 0, dy = 0 } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(dx, dy);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(SX + 10, SY + 12, SW, SH);
    ctx.fillStyle = C.paper; ctx.fillRect(SX, SY, SW, SH);
    ctx.fillStyle = 'rgba(42,38,32,0.05)'; for (let i = 0; i < 18; i++) ctx.fillRect(SX, SY + 40 + i * 44, SW, 1);
    txt('THE SIXTEEN POINTS', SX + 44, SY + 50, { size: 40, weight: 800, family: HEAD, color: C.pink, spacing: '2px' });
    txt('Budapest · 22 October 1956', SX + 44, SY + 96, { size: 32, weight: 500, color: C.pinkSoft });
    for (let n = 1; n <= 16; n++) {
      const la = seg(lines * 16, n - 1, n);
      if (la <= 0) continue;
      const y = lineY(n), h = hl(n);
      A(la * (1 - dim * (1 - h) * 0.6), () => {
        if (h > 0) { ctx.fillStyle = `rgba(207,165,72,${(0.55 * h).toFixed(3)})`; ctx.fillRect(SX + 28, y - 19, (SW - 56) * eout(h), 38); }
        txt(String(n), SX + 70, y + 1, { size: 30, weight: 800, family: HEAD, color: C.pink, align: 'right' });
        txtFit(POINTS[n - 1], SX + 92, y + 1, SW - 130, { size: 32, weight: 500, color: C.pink });
      });
    }
    ctx.restore();
  });
}

// ---------- cold open ----------
function partOpen(t) {
  const out = 1 - seg(t, e('o4', 0.0), e('o4', 0.8));
  const hl = (n) => ({ 1: 0.1, 9: 0.33, 10: 0.55, 14: 0.75 }[n] != null ? span(t, at('o2', { 1: 0.1, 9: 0.33, 10: 0.55, 14: 0.75 }[n]), e('o3', 0.2), 0.5, 0.8) : 0);
  A(out, () => {
    const up = eout(seg(t, s('o1', 0.1), s('o1', 1.2)));
    sheet(t, { a: up, dy: (1 - up) * 40, lines: eio(seg(t, s('o1', 0.4), e('o1', 0.6))), hl,
      dim: 0 });
    // o3: a tick against every point
    for (let n = 1; n <= 16; n++) {
      const ta = fin(t, at('o3', 0.15 + n * 0.045), 0.4);
      if (ta > 0) A(ta, () => { ctx.fillStyle = C.ochre; ctx.beginPath(); ctx.arc(SX + SW - 40, lineY(n), 7, 0, TAU); ctx.fill(); });
    }
  });
  // o4: the year strip, from October 1956 back to 1949
  const ys = span(t, s('o4', 0.0), e('o4', 1.4), 0.6, 0.8);
  if (ys > 0) {
    const back = eio(seg(t, at('o4', 0.45), e('o4', 0.2)));
    yearStrip(ys, null, null, { mark: lerp(1956.8, 1949.0, back), markLabel: back < 0.5 ? '23 October 1956' : '1949' });
  }
  // the title, until the first chapter card
  const ti = eout(seg(t, e('o4', 0.6), e('o4', 1.6)));
  A(ti, () => {
    flag(W / 2 - 75, 250, 150, 100);
    txt('WHY', W / 2, 420, { size: 36, weight: 700, color: C.ochre, align: 'center', spacing: '8px' });
    const title = 'WHY HUNGARY ROSE';
    txt(title, W / 2, 530 + (1 - ti) * 14, { size: fit(title, 1600, 128, { weight: 800, family: HEAD, spacing: '2px' }), weight: 800, family: HEAD, align: 'center', spacing: '2px' });
    tricolour(W / 2, 622, 300, 6);
    txt('Hungary 1956', W / 2, 690, { size: 42, weight: 500, color: C.soft, align: 'center' });
  });
}

// ---------- 1: the party's fist ----------
function building(x, y, w, h, { floors = 4, cols = 5, col = C.steelDk, win = 'rgba(236,230,214,0.12)', lit = () => 0, roof = 'flat' } = {}) {
  ctx.fillStyle = col; ctx.fillRect(x, y, w, h);
  if (roof === 'gable') { ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + w / 2, y - h * 0.22); ctx.lineTo(x + w + 10, y); ctx.closePath(); ctx.fill(); }
  const pw = w / cols, ph = h / (floors + 0.6);
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
    const l = lit(f, c);
    ctx.fillStyle = win; ctx.fillRect(x + c * pw + pw * 0.25, y + ph * 0.4 + f * ph, pw * 0.5, ph * 0.55);
    if (l > 0) { ctx.fillStyle = `rgba(207,165,72,${(0.9 * l).toFixed(3)})`; ctx.fillRect(x + c * pw + pw * 0.25, y + ph * 0.4 + f * ph, pw * 0.5, ph * 0.55); }
  }
}
function partFist(t) {
  // a1–a4: the party, its fist, the building, who it answered to
  const org = span(t, s('a1', 0.0), at('a5', 0.08), 0.6, 0.6);
  if (org > 0) A(org, () => {
    const pa = fin(t, s('a1', 0.3), 0.8);
    A(pa, () => {
      rrect(170, 190, 780, 140, 16, C.panel, C.ink, 3);
      txtFit('HUNGARIAN WORKERS’ PARTY', 560, 238, 720, { size: 44, weight: 800, family: HEAD, align: 'center' });
      txt('led by Mátyás Rákosi', 560, 290, { size: 34, weight: 500, color: C.soft, align: 'center' });
    });
    const ORGS = ['government', 'parliament', 'army', 'courts', 'press', 'schools'];
    const oa = span(t, at('a1', 0.45), s('a2', 0.4), 0.5, 0.6);
    ORGS.forEach((o, i) => {
      const a = oa * fin(t, at('a1', 0.45 + i * 0.07), 0.5), x = 200 + i * 145;
      if (a <= 0) return;
      A(a, () => {
        ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(560, 330); ctx.lineTo(x, 440); ctx.stroke();
        txtFit(o, x, 468, 140, { size: 32, weight: 600, color: C.ink, align: 'center' });
      });
    });
    // a2: the ÁVH under the party, its fist
    const av = fin(t, s('a2', 0.3), 0.8);
    A(av, () => {
      ctx.fillStyle = C.ochre; ctx.fillRect(552, 330, 16, 108 * av);
      txt('the party’s fist', 590, 386, { size: 34, weight: 700, color: C.ochre });
      rrect(300, 440, 520, 170, 16, C.steelDk, C.steel, 3);
      txt('ÁVH', 560, 492, { size: 70, weight: 800, family: HEAD, color: C.ink, align: 'center' });
      txtFit('State Protection Authority', 560, 548, 480, { size: 34, weight: 600, color: C.ink, align: 'center' });
      txt('political police', 560, 588, { size: 32, weight: 500, color: C.soft, align: 'center' });
    });
    // a3: 60 Andrássy út
    const bd = fin(t, s('a3', 0.2), 0.9);
    A(bd, () => {
      const bx = 1030, by = 250 + (1 - bd) * 20;
      building(bx, by, 330, 420, { floors: 4, cols: 6, col: C.steelMid, lit: (f, c) => (f === 3 ? 0 : 0) });
      ctx.fillStyle = '#111418'; ctx.fillRect(bx + 140, by + 340, 50, 80);
      txt('60 Andrássy út', bx + 165, by + 470, { size: 40, weight: 800, family: HEAD, align: 'center' });
      txt('Budapest', bx + 165, by + 515, { size: 32, weight: 500, color: C.soft, align: 'center' });
      A(fin(t, at('a3', 0.55), 0.6), () => chip('before: Arrow Cross party', bx + 165, by + 580, { color: C.soft, size: 32, weight: 600 }));
    });
    // a4: on paper the government, in practice Rákosi; Soviet advisers
    const pp = fin(t, s('a4', 0.2), 0.7);
    A(pp, () => {
      ctx.setLineDash([10, 9]); ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(420, 610); ctx.lineTo(330, 720); ctx.stroke(); ctx.setLineDash([]);
      rrect(150, 720, 360, 80, 12, C.panel, C.soft, 2);
      txtFit('Council of Ministers', 330, 760, 330, { size: 33, weight: 600, color: C.soft, align: 'center' });
      txt('on paper', 330, 832, { size: 32, weight: 500, color: C.soft, align: 'center' });
    });
    const pr = fin(t, at('a4', 0.45), 0.7);
    A(pr, () => {
      ctx.strokeStyle = C.ochre; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(700, 610); ctx.lineTo(790, 720); ctx.stroke();
      rrect(620, 720, 340, 80, 12, C.panel, C.ochre, 3);
      txt('Rákosi', 790, 760, { size: 38, weight: 800, family: HEAD, color: C.ochre, align: 'center' });
      txt('in practice', 790, 832, { size: 32, weight: 600, color: C.ochre, align: 'center' });
    });
    const sa = fin(t, at('a4', 0.75), 0.7);
    A(sa, () => { star(470, 900, 16, C.soviet); txt('Soviet advisers', 496, 902, { size: 32, weight: 600, color: C.ink }); });
  });

  // a5–a6: 650,000 people, in a country of 9.2 million (each square: 10,000 people)
  const gr = span(t, s('a5', 0.0), at('a6', 0.44), 0.6, 0.6);
  if (gr > 0) A(gr, () => {
    const COLS = 46, P = 27, SQ = 21, X0 = 140, Y0 = 350;
    const popA = fin(t, s('a6', 0.0), 1.0);
    for (let i = 0; i < NCELL; i++) {
      const x = X0 + (i % COLS) * P, y = Y0 + Math.floor(i / COLS) * P;
      if (LIT.has(i)) {
        const order = [...LIT].indexOf(i);
        const la = fin(t, lerp(s('a5', 0.6), e('a5', -0.2), order / NLIT), 0.4);
        if (la > 0) { ctx.fillStyle = C.ochre; ctx.globalAlpha *= la; ctx.fillRect(x, y, SQ, SQ); ctx.globalAlpha /= la; }
      } else if (popA > 0) { ctx.fillStyle = `rgba(236,230,214,${(0.16 * popA).toFixed(3)})`; ctx.fillRect(x, y, SQ, SQ); }
    }
    counter(fmt(PROC), null, X0, 200, { a: fin(t, s('a5', 0.4), 0.7), size: 84 });
    A(fin(t, s('a5', 0.6), 0.7), () => txt('people: ÁVH proceedings, 1950–1953', X0, 282, { size: 34, weight: 600, color: C.ink }));
    A(popA, () => {
      const n = dec(POP / 1e6), w1 = textW(n, { size: 60, weight: 800, family: HEAD }), w2 = textW('million', { size: 40, weight: 700 });
      txt(n, 1380 - w2 - 14 - w1, 206, { size: 60, weight: 800, family: HEAD, color: C.ink });
      txt('million', 1380 - w2, 212, { size: 40, weight: 700, color: C.ink });
      txt('Hungary’s population, 1949', 1380, 268, { size: 32, weight: 500, color: C.soft, align: 'right' });
    });
    A(fin(t, s('a5', 1.0), 0.7), () => txt('each square: 10,000 people', X0, 925, { size: 32, weight: 500, color: C.soft }));
  });

  // a6 (second half) – a7: informers in every building; the words reach the ÁVH within half an hour
  const st = span(t, at('a6', 0.38), at('a8', 0.06), 0.6, 0.6);
  if (st > 0) A(st, () => {
    const G = 800;
    ctx.fillStyle = C.faint; ctx.fillRect(110, G, 1290, 2);
    const B = [['office', 140, 210, 300, 4, 4], ['factory', 390, 250, 230, 3, 5], ['school', 680, 220, 260, 3, 4], ['flats', 940, 200, 380, 5, 3]];
    const informer = (bi, f, c) => (rnd(bi * 31 + f * 7 + c * 3) > 0.8 ? 1 : 0);
    B.forEach(([name, x, w, h, floors, cols], bi) => {
      const ba = fin(t, at('a6', 0.4 + bi * 0.06), 0.6);
      A(ba, () => {
        building(x, G - h, w, h, { floors, cols, col: C.steelDk, lit: (f, c) => informer(bi, f, c) * fin(t, at('a6', 0.62 + bi * 0.06), 0.5) });
        if (name === 'factory') { ctx.fillStyle = C.steelDk; ctx.fillRect(x + w - 50, G - h - 120, 34, 120); }
        txt(name, x + w / 2, G + 40, { size: 32, weight: 600, color: C.soft, align: 'center' });
      });
    });
    A(fin(t, at('a6', 0.7), 0.6), () => chip('informers', 640, 380, { color: C.ochre, size: 36 }));
    // the ÁVH building, small, on the right; a remark travels there from a window in the flats
    const av = fin(t, s('a7', 0.0), 0.6);
    A(av, () => {
      building(1190, G - 300, 190, 300, { floors: 4, cols: 4, col: C.steelMid });
      txt('ÁVH', 1285, G + 40, { size: 32, weight: 800, family: HEAD, color: C.steel, align: 'center' });
      const ck = [1285, 330], m = seg(t, at('a7', 0.15), at('a7', 0.9));
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ck[0], ck[1], 62, 0, TAU); ctx.stroke();
      for (let i = 0; i < 12; i++) { const ang = (i / 12) * TAU; ctx.fillStyle = C.soft; ctx.fillRect(ck[0] + Math.cos(ang) * 52 - 2, ck[1] + Math.sin(ang) * 52 - 2, 4, 4); }
      ctx.fillStyle = C.ochreGlow; ctx.beginPath(); ctx.moveTo(...ck); ctx.arc(ck[0], ck[1], 58, -Math.PI / 2, -Math.PI / 2 + Math.PI * m); ctx.closePath(); ctx.fill();
      const ang = -Math.PI / 2 + Math.PI * m;
      ctx.strokeStyle = C.ochre; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(...ck); ctx.lineTo(ck[0] + Math.cos(ang) * 50, ck[1] + Math.sin(ang) * 50); ctx.stroke();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(...ck); ctx.lineTo(ck[0], ck[1] - 34); ctx.stroke();
      A(fin(t, at('a7', 0.6), 0.6), () => txt('half an hour later', ck[0], ck[1] + 100, { size: 34, weight: 700, color: C.ochre, align: 'center' }));
      // the remark
      const p0 = [1050, 520], p1 = [1240, 560];
      const u = eio(seg(t, at('a7', 0.2), at('a7', 0.85)));
      curve(p0, p1, u, C.ochre, { bend: -0.35, w: 3, dash: [6, 8], head: false });
      if (u > 0 && u < 1) {
        const mx = (p0[0] + p1[0]) / 2 + (p1[1] - p0[1]) * 0.35, my = (p0[1] + p1[1]) / 2 - (p1[0] - p0[0]) * 0.35;
        const bx = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * mx + u * u * p1[0], by = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * my + u * u * p1[1];
        ctx.fillStyle = C.ochre; k.rrect(bx - 22, by - 16, 44, 30, 10); ctx.fill();
        ctx.beginPath(); ctx.moveTo(bx - 8, by + 12); ctx.lineTo(bx - 14, by + 24); ctx.lineTo(bx + 2, by + 12); ctx.fill();
      }
    });
  });

  // a8: Law II of 1952
  const lw = span(t, s('a8', 0.0), at('a9', 0.06), 0.6, 0.6);
  if (lw > 0) A(lw, () => {
    const x = 230, y = 250 + (1 - fin(t, s('a8', 0.0), 0.7)) * 20;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x + 10, y + 12, 900, 470);
    ctx.fillStyle = C.paper; ctx.fillRect(x, y, 900, 470);
    txt('LAW II OF 1952', x + 50, y + 70, { size: 46, weight: 800, family: HEAD, color: C.pink, spacing: '2px' });
    txtFit('shunning an ÁVH informer', x + 50, y + 150, 800, { size: 40, weight: 600, color: C.pink });
    A(fin(t, at('a8', 0.55), 0.6), () => {
      txtFit('up to six months in prison', x + 50, y + 215, 800, { size: 40, weight: 800, color: C.red });
      for (let m = 0; m < 6; m++) {
        const ma = fin(t, at('a8', 0.6 + m * 0.05), 0.4);
        A(ma, () => {
          const cx = x + 50 + m * 135;
          ctx.fillStyle = C.paper2; ctx.fillRect(cx, y + 280, 110, 120); ctx.fillStyle = C.red; ctx.fillRect(cx, y + 280, 110, 26);
          txt(String(m + 1), cx + 55, y + 355, { size: 46, weight: 800, family: HEAD, color: C.pink, align: 'center' });
        });
      }
    });
    txt('UN Special Committee, 1957', x + 900, y + 520, { size: 30, weight: 500, color: C.soft, align: 'right' });
  });

  // a9: the cells
  const cl = span(t, s('a9', 0.0), at('a10', 0.06), 0.6, 0.6);
  if (cl > 0) A(cl, () => {
    rrect(260, 230, 300, 560, 8, C.steelDk, C.steel, 4);
    ctx.fillStyle = '#0c0e11'; ctx.fillRect(370, 320, 80, 46);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = C.steel; ctx.fillRect(380 + i * 18, 320, 5, 46); }
    ctx.fillStyle = C.steel; ctx.beginPath(); ctx.arc(510, 520, 12, 0, TAU); ctx.fill();
    ['beaten', 'starved', 'threatened', 'held alone'].forEach((w, i) => A(fin(t, at('a9', 0.2 + i * 0.12), 0.5), () => txt(w, 680, 300 + i * 80, { size: 48, weight: 700, color: C.ink })));
    A(fin(t, at('a9', 0.78), 0.6), () => chip('a signed confession', 680, 650, { color: C.ochre, size: 40, align: 'left' }));
    txt('as witnesses told the UN in 1957', 680, 760, { size: 32, weight: 500, color: C.soft });
  });

  // a10: László Rajk
  const rj = span(t, s('a10', 0.0), e('a10', 3.0), 0.6, 0.8);
  if (rj > 0) A(rj, () => {
    const x = 260, y = 260;
    rrect(x, y, 860, 420, 14, C.panel, C.soft, 2);
    txt('a Communist, too', x + 50, y + 70, { size: 34, weight: 700, color: C.ochre });
    A(fin(t, at('a10', 0.3), 0.6), () => {
      txt('László Rajk', x + 50, y + 150, { size: 60, weight: 800, family: HEAD });
      txt('former interior minister', x + 50, y + 214, { size: 36, weight: 500, color: C.soft });
      txt('show trial, executed 1949', x + 50, y + 274, { size: 36, weight: 600, color: C.ink });
    });
    A(fin(t, at('a10', 0.75), 0.5), () => {
      ctx.save(); ctx.translate(x + 640, y + 345); ctx.rotate(-0.08);
      const w = textW('INVENTED CHARGES', { size: 34, weight: 800, family: HEAD, spacing: '2px' }) + 40;
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; k.rrect(-w / 2, -30, w, 60, 6); ctx.stroke();
      txt('INVENTED CHARGES', 0, 2, { size: 34, weight: 800, family: HEAD, color: C.red, align: 'center', spacing: '2px' });
      ctx.restore();
    });
    A(fin(t, e('a10', 0.0), 0.6), () => txt('admitted by the regime in 1956', x + 50, y + 480, { size: 32, weight: 500, color: C.soft }));
  });
}

// ---------- 2: without trial ----------
function partTrial(t) {
  // b1–b2: internment, no court
  const nt = span(t, s('b1', 0.0), s('b3', 0.5), 0.6, 0.7);
  if (nt > 0) A(nt, () => {
    txt('INTERNMENT', 760, 220, { size: 60, weight: 800, family: HEAD, align: 'center', spacing: '3px' });
    A(fin(t, s('b1', 0.3), 0.6), () => chip('arrest', 270, 450, { color: C.steel, size: 40 }));
    // the court, bypassed
    A(fin(t, at('b1', 0.35), 0.6), () => {
      const cx = 760, base = 520;
      A(0.45, () => {
        ctx.fillStyle = C.soft; ctx.beginPath(); ctx.moveTo(cx - 130, base - 170); ctx.lineTo(cx, base - 230); ctx.lineTo(cx + 130, base - 170); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 5; i++) ctx.fillRect(cx - 110 + i * 50, base - 160, 20, 150);
        ctx.fillRect(cx - 140, base - 10, 280, 14);
      });
      txt('court', cx, base + 50, { size: 34, weight: 600, color: C.soft, align: 'center' });
    });
    curve([360, 400], [1160, 400], eio(seg(t, at('b1', 0.55), at('b1', 0.95))), C.ochre, { bend: 0.22, w: 6, headSize: 22 });
    A(fin(t, at('b1', 0.9), 0.6), () => chip('camp', 1250, 450, { color: C.ochre, size: 40 }));
    A(fin(t, at('b1', 0.8), 0.6), () => txt('without any trial', 760, 640, { size: 40, weight: 700, color: C.ochre, align: 'center' }));
    const G = ['kulaks', 'Social Democrats', 'churchmen', '“class aliens”'];
    let x = 160;
    G.forEach((g, i) => {
      const w = textW(g, { size: 34, weight: 700 }) + 42;
      chip(g, x, 780, { color: C.ink, size: 34, align: 'left', a: fin(t, at('b2', 0.05 + i * 0.16), 0.5) });
      x += w + 24;
    });
  });

  // b3–b10: the map
  const mp = span(t, s('b3', 0.0), at('b11', 0.1), 0.8, 0.8);
  if (mp > 0) A(mp, () => {
    hungary(P, 1);
    const night = span(t, s('b6', 0.0), e('b8', 0.4), 0.8, 1.0);
    if (night > 0) A(night, () => { ctx.beginPath(); OUTLINE.forEach(([lo, la], i) => (i ? ctx.lineTo(...P(lo, la)) : ctx.moveTo(...P(lo, la)))); ctx.closePath(); ctx.fillStyle = C.night; ctx.fill(); });
    town(P(...PLACES.budapest), 'Budapest', { r: 9, dx: -16, dy: 34, align: 'right', size: 32 });
    // the camps, as they are named
    const CAMPS = [['kistarcsa', 'Kistarcsa', 0.12, { dx: 4, dy: 36 }], ['tiszalok', 'Tiszalök', 0.28, { dx: 18, dy: -26 }], ['kazinc', 'Kazincbarcika', 0.45, { dx: 0, dy: -34, align: 'center' }], ['recsk', 'Recsk', 0.72, { dx: -20, dy: 2, align: 'right' }]];
    const quiet = 1 - 0.75 * span(t, s('b6'), e('b10', 1), 0.5, 0.5);
    CAMPS.forEach(([id, name, f, o]) => {
      const a = fin(t, at('b3', f), 0.5), xy = P(...PLACES[id]);
      camp(xy, a * quiet, id === 'recsk' ? C.ochre : C.steel, id === 'recsk' ? 13 : 11);
      A(a * quiet, () => txt(name, xy[0] + o.dx, xy[1] + o.dy, { size: 32, weight: 700, color: id === 'recsk' ? C.ochre : C.ink, align: o.align ?? 'left' }));
    });
    // b6: the border-zone villages at night
    BORDER.forEach((pt, i) => A(fin(t, at('b6', 0.35 + (i / BORDER.length) * 0.4), 0.4) * (1 - 0.6 * seg(t, e('b8', 0), e('b8', 1))), () => {
      const xy = P(...pt); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(xy[0], xy[1], 5, 0, TAU); ctx.fill();
    }));
    // b7: night arrows to the Hortobágy camps
    const FROM = [[20.1, 46.3], [18.7, 46.05], [17.3, 46.15], [16.55, 47.15]];
    FROM.forEach((f, i) => {
      const u = eio(seg(t, at('b7', 0.05 + i * 0.08), at('b7', 0.55 + i * 0.08)));
      A(1 - seg(t, e('b8', 0.2), e('b8', 1.2)), () => curve(P(...f), P(21.05, 47.45), u, C.ink, { bend: 0.18, w: 4, dash: [10, 8], headSize: 16 }));
    });
    const hq = 1 - 0.7 * span(t, s('b9', 0.2), e('b10', 2), 0.5, 0.5);
    HCAMPS.forEach((pt, i) => camp(P(...pt), hq * fin(t, i < 7 ? at('b7', 0.55 + i * 0.03) : at('b7', 0.85 + (i - 7) * 0.03), 0.4), C.ink, 6, false));
    A(hq * fin(t, at('b7', 0.55), 0.6), () => { const xy = P(21.55, 47.15); txt('Hortobágy', xy[0], xy[1] + 10, { size: 32, weight: 700, color: C.ink }); });
    // b9: from Budapest to the east; b10: the 138 villages
    const ex = span(t, s('b9', 0.0), e('b10', 1.0), 0.5, 0.8);
    if (ex > 0) A(ex, () => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.strokeStyle = C.ochre; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(...P(...PLACES.budapest), 16 + pulse * 6, 0, TAU); ctx.stroke();
      [[20.4, 47.9], [21.0, 47.7], [21.9, 47.9], [20.9, 47.0], [21.4, 47.3], [20.3, 47.25]].forEach((q, i) =>
        curve(P(...PLACES.budapest), P(...q), eio(seg(t, at('b9', 0.15 + i * 0.07), at('b9', 0.6 + i * 0.07))), C.ochre, { bend: -0.12, w: 4, headSize: 15 }));
    });
    VILLAGES.forEach((pt, i) => {
      const a = fin(t, lerp(s('b10', 0.2), at('b10', 0.7), i / 138), 0.3);
      if (a > 0) A(a, () => { const xy = P(...pt); ctx.fillStyle = C.ochre; ctx.beginPath(); ctx.arc(xy[0], xy[1], 4.5, 0, TAU); ctx.fill(); });
    });
  });

  // the panel beside the map
  const PX = 1050, PW = 380;
  /** A panel heading, as large as fits. */
  const head = (str, y, col = C.ink, size = 44) => txt(str, PX, y, { size: fit(str, PW, size, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: col });
  // b4: Recsk
  const rk = span(t, s('b4', 0.0), s('b6', 0.3), 0.6, 0.6);
  if (rk > 0) A(rk, () => {
    ctx.save(); ctx.translate(0, 30);
    rrect(PX, 210, PW, 300, 14, '#1a1f25', C.ochreDim, 2);
    ctx.save(); k.rrect(PX, 210, PW, 300, 14); ctx.clip();
    ctx.fillStyle = '#4a4e52';
    ctx.beginPath(); ctx.moveTo(PX, 300); ctx.lineTo(PX + 120, 300); ctx.lineTo(PX + 120, 360); ctx.lineTo(PX + 220, 360); ctx.lineTo(PX + 220, 420); ctx.lineTo(PX + PW, 420); ctx.lineTo(PX + PW, 510); ctx.lineTo(PX, 510); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5f6468'; for (let i = 0; i < 9; i++) ctx.fillRect(PX + 30 + i * 36, 450 + (i % 2) * 14, 24, 18);
    ctx.strokeStyle = C.soft; ctx.lineWidth = 2;
    for (const yy of [262, 282]) { ctx.beginPath(); ctx.moveTo(PX, yy); ctx.lineTo(PX + PW, yy); ctx.stroke(); }
    for (let i = 0; i < 7; i++) { ctx.fillStyle = C.soft; ctx.fillRect(PX + 20 + i * 52, 248, 4, 50); }
    ctx.fillStyle = C.steel; ctx.fillRect(PX + PW - 70, 225, 40, 26); ctx.fillRect(PX + PW - 62, 251, 6, 60); ctx.fillRect(PX + PW - 42, 251, 6, 60);
    ctx.restore();
    head('RECSK, 1950–1953', 560, C.ochre, 36);
    txt('a secret camp', PX, 604, { size: 32, weight: 500, color: C.soft });
    counter(`${fmt(1200)}–${fmt(1300)}`, 'men at a time', PX, 680, { a: fin(t, at('b4', 0.45), 0.6), size: 58, sub: 'by former prisoners’ counts', maxW: PW });
    ctx.restore();
  });
  // b6–b8: the night of 23 June 1950
  const jn = span(t, s('b6', 0.2), e('b8', 0.6), 0.6, 0.6);
  if (jn > 0) A(jn, () => {
    head('23 JUNE 1950', 250);
    txt('before dawn', PX, 300, { size: 34, weight: 500, color: C.soft });
    A(fin(t, at('b6', 0.6), 0.6), () => txtFit('villages near the borders', PX, 350, PW, { size: 32, weight: 600, color: C.ink }));
    counter(fmt(2446), 'people taken that night', PX, 450, { a: fin(t, at('b7', 0.25), 0.6), size: 64, maxW: PW });
    A(fin(t, at('b7', 0.8), 0.6), () => txt('12 camps by 1953', PX, 560, { size: 34, weight: 700, color: C.ink }));
    counter(fmt(7281), 'released in 1953', PX, 660, { a: fin(t, s('b8', 0.3), 0.6), size: 64, sub: ['official count;', 'more were taken'], maxW: PW });
  });
  // b9–b10: Budapest, 1951
  const bp = span(t, s('b9', 0.2), at('b11', 0.1), 0.6, 0.6);
  if (bp > 0) A(bp, () => {
    head('BUDAPEST, 1951', 250, C.ink, 40);
    txt('21 May – 18 July', PX, 298, { size: 32, weight: 500, color: C.soft });
    counter(fmt(12704), 'people expelled', PX, 380, { a: fin(t, at('b9', 0.3), 0.6), size: 64, sub: ['former nobles,', 'officers, officials'], maxW: PW });
    counter(fmt(138), 'villages in the east', PX, 600, { a: fin(t, s('b10', 0.3), 0.6), size: 64, sub: 'in strangers’ houses', maxW: PW });
  });
  // b11: children barred from study
  const ch = span(t, s('b11', 0.0), e('b11', 4.0), 0.6, 0.8);
  if (ch > 0) A(ch, () => {
    rrect(220, 300, 960, 400, 18, C.card, C.ochreDim, 2);
    const bx = 330, by = 600;
    ctx.fillStyle = C.steelMid; ctx.fillRect(bx, by - 170, 220, 170);
    ctx.beginPath(); ctx.moveTo(bx - 14, by - 170); ctx.lineTo(bx + 110, by - 240); ctx.lineTo(bx + 234, by - 170); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#111418'; ctx.fillRect(bx + 85, by - 90, 50, 90);
    ctx.fillStyle = C.red; ctx.save(); ctx.translate(bx + 110, by - 40); ctx.rotate(-0.12); ctx.fillRect(-150, -9, 300, 18); ctx.restore();
    txt('children of “class aliens”', 640, 440, { size: 40, weight: 700, color: C.ink });
    txt('could be barred', 640, 510, { size: 40, weight: 700, color: C.ochre });
    txt('from further study', 640, 566, { size: 40, weight: 700, color: C.ochre });
  });
}

// ---------- 3: iron and steel ----------
function partIron(t) {
  // c1–c2: from fields to chimneys; the plan and the war
  const sk = span(t, s('c1', 0.0), at('c3', 0.08), 0.6, 0.6);
  if (sk > 0) A(sk, () => {
    const G = 860, grow = eio(seg(t, at('c1', 0.3), e('c1', 0.6)));
    ctx.fillStyle = C.faint; ctx.fillRect(110, G, 1290, 2);
    A(1 - grow * 0.7, () => { ctx.strokeStyle = C.wheat; ctx.lineWidth = 3; for (let i = 0; i < 70; i++) { const x = 120 + i * 18.4, h = 22 + 10 * rnd(i); ctx.beginPath(); ctx.moveTo(x, G); ctx.lineTo(x + 4, G - h); ctx.stroke(); } });
    const CHIM = [[180, 210], [300, 300], [430, 250], [610, 360], [760, 280], [930, 330], [1080, 240], [1230, 310], [1340, 220]];
    CHIM.forEach(([x, h], i) => {
      const g = eio(seg(grow, i * 0.06, 0.5 + i * 0.06));
      if (g <= 0) return;
      ctx.fillStyle = C.steelMid; ctx.fillRect(x - 18, G - h * g, 36, h * g);
      ctx.fillStyle = C.steelDk; ctx.fillRect(x - 70, G - 90 * g, 140, 90 * g);
      if (g > 0.95) for (let j = 0; j < 4; j++) { const ph = (t * 0.25 + j * 0.25 + rnd(i) ) % 1; ctx.fillStyle = `rgba(200,200,200,${(0.13 * (1 - ph)).toFixed(3)})`; ctx.beginPath(); ctx.arc(x + ph * 40, G - h - 20 - ph * 110, 16 + ph * 26, 0, TAU); ctx.fill(); }
    });
    const ti = fin(t, s('c1', 0.5), 0.8);
    A(ti, () => {
      txt('a farming country', 760, 220, { size: 36, weight: 600, color: C.soft, align: 'center' });
      const title = '“A LAND OF IRON AND STEEL”';
      txt(title, 760, 290, { size: fit(title, 1240, 60, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.ochre, align: 'center' });
    });
    // c2: the timeline of the plan
    const tl = fin(t, s('c2', 0.1), 0.6);
    A(tl, () => {
      const X0 = 200, X1 = 1300, Y = 420, m0 = 1950, m1 = 1951.25, xm = (v) => lerp(X0, X1, (v - m0) / (m1 - m0));
      ctx.fillStyle = C.soft; ctx.fillRect(X0, Y, X1 - X0, 3);
      const EV = [[1950.0, 'plan begins', 0.05, -1], [1950.48, 'war in Korea', 0.4, 1], [1951.0, 'Stalin demands more arms', 0.62, -1], [1951.12, 'targets raised', 0.85, 1]];
      EV.forEach(([v, label, f, side]) => A(fin(t, at('c2', f), 0.5), () => {
        const x = xm(v); ctx.fillStyle = C.ochre; ctx.beginPath(); ctx.arc(x, Y + 1, 9, 0, TAU); ctx.fill();
        txt(label, x, Y + side * 44, { size: 32, weight: 700, color: C.ink, align: v > 1951.05 ? 'left' : v < 1950.05 ? 'left' : 'center' });
      }));
      txt('1950', xm(1950), Y + 92, { size: 30, weight: 600, color: C.soft, align: 'center' });
      txt('1951', xm(1951), Y + 92, { size: 30, weight: 600, color: C.soft, align: 'center' });
    });
  });
  // c3: planned investment, version by version; nine-tenths of industry's share to heavy industry
  const iv = span(t, s('c3', 0.0), at('c4', 0.06), 0.6, 0.6);
  if (iv > 0) A(iv, () => {
    const B0 = 820, MAXH = 470, BW = 130, X0 = 170;
    txt('planned investment, billion forints', X0, 200, { size: 36, weight: 700, color: C.ink });
    PLAN.forEach(([label, v], i) => {
      const g = eio(seg(t, at('c3', 0.05 + i * 0.12), at('c3', 0.25 + i * 0.12))), h = (v / 85) * MAXH * g, x = X0 + i * 200;
      ctx.fillStyle = i === 3 ? C.ochre : C.steelMid; ctx.fillRect(x, B0 - h, BW, h);
      A(g, () => {
        txt(Number.isInteger(v) ? fmt(v) : dec(v), x + BW / 2, B0 - h - 30, { size: 40, weight: 800, family: HEAD, color: i === 3 ? C.ochre : C.ink, align: 'center' });
        txtFit(label, x + BW / 2, B0 + 36, 190, { size: 30, weight: 600, color: C.soft, align: 'center' });
      });
    });
    ctx.fillStyle = C.faint; ctx.fillRect(X0 - 20, B0, 820, 2);
    const hv = fin(t, at('c3', 0.62), 0.7);
    A(hv, () => {
      const x = 1080, top = 300, cell = 52;
      txt('industry’s share', x + 30, top - 50, { size: 32, weight: 700, color: C.ink, align: 'center' });
      for (let i = 0; i < 10; i++) {
        const a = fin(t, at('c3', 0.64 + i * 0.025), 0.3);
        A(a, () => { ctx.fillStyle = i < 9 ? C.steel : C.ochre; ctx.fillRect(x, top + (9 - i) * cell, 60, cell - 6); });
      }
      txt('heavy industry', x + 80, top + 240, { size: 34, weight: 700, color: C.steel });
      txt('≈ 9/10', x + 80, top + 290, { size: 40, weight: 800, family: HEAD, color: C.steel });
      txt('the rest', x + 80, top + 9 * cell + 20, { size: 30, weight: 600, color: C.ochre });
    });
  });
  // c4–c5: the norm; Ikarus 1950
  const nm = span(t, s('c4', 0.0), at('c6', 0.06), 0.6, 0.6);
  if (nm > 0) A(nm, () => {
    const B0 = 820, OUT = 320, X = 260, rise = eio(seg(t, at('c5', 0.2), at('c5', 0.55)));
    const norm = OUT * lerp(1, NORM_RISE, rise), pay = OUT * (OUT / norm);
    txt('THE NORM', 160, 200, { size: 48, weight: 800, family: HEAD, color: C.ink, spacing: '2px' });
    txt('pay ≈ output ÷ norm (simplified)', 160, 252, { size: 32, weight: 500, color: C.soft });
    for (let i = 0; i < 8; i++) { ctx.fillStyle = C.steelMid; ctx.fillRect(X, B0 - (i + 1) * (OUT / 8) + 3, 150, OUT / 8 - 6); }
    txt('a day’s output', X + 75, B0 + 40, { size: 32, weight: 600, color: C.soft, align: 'center' });
    ctx.setLineDash([14, 10]); ctx.strokeStyle = C.ochre; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X - 60, B0 - norm); ctx.lineTo(X + 210, B0 - norm); ctx.stroke(); ctx.setLineDash([]);
    txt('NORM', X - 70, B0 - norm, { size: 32, weight: 800, family: HEAD, color: C.ochre, align: 'right' });
    const PXX = 700;
    ctx.fillStyle = C.ink; ctx.fillRect(PXX, B0 - pay, 150, pay);
    A(rise, () => { ctx.setLineDash([8, 8]); ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.strokeRect(PXX, B0 - OUT, 150, OUT); ctx.setLineDash([]); });
    txt('pay', PXX + 75, B0 + 40, { size: 32, weight: 600, color: C.soft, align: 'center' });
    ctx.fillStyle = C.faint; ctx.fillRect(140, B0, 860, 2);
    A(fin(t, at('c5', 0.55), 0.6), () => {
      txt(`−${dec(IKARUS * 100)}%`, PXX + 75, B0 - pay - 40, { size: 48, weight: 800, family: HEAD, color: C.red, align: 'center' });
      txt('Ikarus bus works, 1950', 960, 360, { size: 38, weight: 700, color: C.ink });
      txt('average pay', 960, 412, { size: 34, weight: 500, color: C.soft });
      txt('same output, higher norm', 960, 470, { size: 32, weight: 500, color: C.soft });
    });
  });
  // c6: Peace Loans
  const pl = span(t, s('c6', 0.0), at('c7', 0.06), 0.6, 0.6);
  if (pl > 0) A(pl, () => {
    txt('A YEAR’S PAY', 160, 220, { size: 40, weight: 800, family: HEAD, color: C.ink, spacing: '2px' });
    const lift = eio(seg(t, at('c6', 0.4), at('c6', 0.8)));
    for (let m = 0; m < 12; m++) {
      const x = 160 + m * 100, y = 560 - (m === 11 ? lift * 220 : 0);
      rrect(x, y, 82, 120, 8, m === 11 ? C.ochre : C.steelMid, null);
      txt('Ft', x + 41, y + 62, { size: 32, weight: 800, family: HEAD, color: m === 11 ? '#16181c' : C.ink, align: 'center' });
    }
    A(fin(t, at('c6', 0.7), 0.6), () => {
      rrect(1060, 220, 330, 200, 6, C.paper, C.ochre, 4);
      txtFit('PEACE LOAN', 1225, 280, 290, { size: 40, weight: 800, family: HEAD, color: C.pink, align: 'center' });
      txt('bond', 1225, 330, { size: 32, weight: 500, color: C.pinkSoft, align: 'center' });
      txt('at least one month’s pay a year', 160, 770, { size: 38, weight: 700, color: C.ochre });
      txt('“lent” to the state, 1949–1955', 160, 822, { size: 32, weight: 500, color: C.soft });
    });
  });
  // c7: rationing again
  const rt = span(t, s('c7', 0.0), at('c9', 0.06), 0.6, 0.6);
  if (rt > 0) A(rt, () => {
    txt('1 JANUARY 1951', 160, 220, { size: 48, weight: 800, family: HEAD, color: C.ink });
    txt('food rationed again', 160, 278, { size: 38, weight: 600, color: C.ochre });
    const x0 = 330, y0 = 350, cw = 120, chh = 90;
    rrect(x0 - 20, y0 - 20, cw * 6 + 40, chh * 5 + 40, 6, C.paper, null);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
      const i = r * 6 + c, torn = fin(t, at('c7', 0.3 + i * 0.015), 0.3) * (rnd(i + 17) > 0.62 ? 1 : 0);
      A(1 - torn, () => {
        ctx.setLineDash([4, 5]); ctx.strokeStyle = C.pinkSoft; ctx.lineWidth = 2; ctx.strokeRect(x0 + c * cw, y0 + r * chh, cw, chh); ctx.setLineDash([]);
        txt(String(i + 1), x0 + c * cw + cw / 2, y0 + r * chh + chh / 2, { size: 30, weight: 700, color: C.pink, align: 'center' });
      });
    }
    txt('ration coupons, schematic', x0 - 20, y0 + chh * 5 + 60, { size: 30, weight: 500, color: C.soft });
  });
  // c9: real wages
  const rw = span(t, s('c9', 0.0), at('c10', 0.06), 0.6, 0.6);
  if (rw > 0) A(rw, () => {
    const B0 = 820, FULL = 460, g = eio(seg(t, at('c9', 0.2), at('c9', 0.6)));
    txt('REAL WAGES', 160, 200, { size: 48, weight: 800, family: HEAD, color: C.ink, spacing: '2px' });
    txt('what a wage could buy', 160, 252, { size: 32, weight: 500, color: C.soft });
    ctx.fillStyle = C.steelMid; ctx.fillRect(330, B0 - FULL, 200, FULL);
    ctx.fillStyle = C.ochre; ctx.fillRect(700, B0 - FULL * lerp(1, 0.66, g), 200, FULL * lerp(1, 0.66, g));
    ctx.setLineDash([8, 8]); ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.strokeRect(700, B0 - FULL, 200, FULL * 0.34 * g); ctx.setLineDash([]);
    txt('1938', 430, B0 + 40, { size: 36, weight: 700, color: C.soft, align: 'center' });
    txt('1952', 800, B0 + 40, { size: 36, weight: 700, color: C.ochre, align: 'center' });
    A(fin(t, at('c9', 0.55), 0.6), () => chip('about two-thirds', 1100, B0 - FULL * 0.66 + 10, { color: C.ochre, size: 36, align: 'left' }));
    A(fin(t, at('c9', 0.7), 0.6), () => txt('figures: Ignác Romsics, historian', 160, 920, { size: 30, weight: 500, color: C.soft }));
  });
  // c10: a third below the subsistence minimum (1954)
  const sm = span(t, s('c10', 0.0), e('c10', 3.6), 0.6, 0.8);
  if (sm > 0) A(sm, () => {
    txt('1954 · TRADE UNION SURVEY', 160, 220, { size: 40, weight: 800, family: HEAD, color: C.ink, spacing: '1px' });
    const LINE = 560, drop = eio(seg(t, at('c10', 0.4), at('c10', 0.8)));
    ctx.fillStyle = C.ochre; ctx.fillRect(150, LINE, 1240, 3);
    txt('subsistence minimum', 160, LINE + 40, { size: 34, weight: 700, color: C.ochre });
    for (let i = 0; i < 12; i++) {
      const below = i % 3 === 1, x = 220 + i * 98, y = LINE - 12 + (below ? drop * 250 : 0);
      figure(x, y, 150, below ? C.steel : C.ink);
    }
    A(fin(t, at('c10', 0.8), 0.6), () => txt('one wage earner in three below it', 160, 900, { size: 38, weight: 700, color: C.steel }));
  });
}

// ---------- 4: the villages ----------
function sack(x, y, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.quadraticCurveTo(x - 30, y - 40, x - 10, y - 50); ctx.lineTo(x + 10, y - 50); ctx.quadraticCurveTo(x + 30, y - 40, x + 22, y); ctx.closePath(); ctx.fill(); ctx.fillRect(x - 12, y - 58, 24, 8); }
function farmhouse(x, y, w, col = C.steelMid) {
  ctx.fillStyle = col; ctx.fillRect(x, y - w * 0.55, w, w * 0.55);
  ctx.beginPath(); ctx.moveTo(x - w * 0.08, y - w * 0.55); ctx.lineTo(x + w / 2, y - w * 0.95); ctx.lineTo(x + w * 1.08, y - w * 0.55); ctx.closePath(); ctx.fill();
}
function partVillage(t) {
  // d1: deliveries to the state at low fixed prices
  const dl = span(t, s('d1', 0.0), at('d2', 0.06), 0.6, 0.6);
  if (dl > 0) A(dl, () => {
    txt('COMPULSORY DELIVERIES', 160, 200, { size: 46, weight: 800, family: HEAD, color: C.ink, spacing: '2px' });
    farmhouse(180, 640, 220);
    txt('the farm', 290, 690, { size: 32, weight: 600, color: C.soft, align: 'center' });
    // the state
    ctx.fillStyle = C.steelDk; ctx.fillRect(1060, 400, 300, 240);
    ctx.beginPath(); ctx.moveTo(1040, 400); ctx.lineTo(1210, 320); ctx.lineTo(1380, 400); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 4; i++) { ctx.fillStyle = C.steelMid; ctx.fillRect(1090 + i * 70, 430, 26, 200); }
    star(1210, 368, 18, C.soviet);
    txt('the state', 1210, 690, { size: 32, weight: 600, color: C.soft, align: 'center' });
    ['grain', 'meat', 'other produce'].forEach((w, i) => {
      const u = eio(seg(t, at('d1', 0.3 + i * 0.12), at('d1', 0.75 + i * 0.08)));
      const x = lerp(450, 960, u), y = 470 + i * 70;
      A(fin(t, at('d1', 0.3 + i * 0.12), 0.4), () => {
        if (i === 0) sack(x, y + 20, C.wheat);
        else if (i === 1) { ctx.fillStyle = '#b06a5c'; ctx.beginPath(); ctx.ellipse(x, y, 30, 20, 0.3, 0, TAU); ctx.fill(); }
        else { ctx.fillStyle = C.paper2; k.rrect(x - 18, y - 28, 36, 52, 6); ctx.fill(); }
        txt(w, x, y + 48, { size: 30, weight: 600, color: C.ink, align: 'center' });
      });
    });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([8, 10]); ctx.beginPath(); ctx.moveTo(430, 560); ctx.lineTo(1020, 560); ctx.stroke(); ctx.setLineDash([]);
    A(fin(t, at('d1', 0.8), 0.6), () => chip('low fixed prices', 720, 800, { color: C.ochre, size: 36 }));
  });
  // d2: set by the land, not the harvest
  const qh = span(t, s('d2', 0.0), at('d3', 0.06), 0.6, 0.6);
  if (qh > 0) A(qh, () => {
    txt('SET BY THE LAND, NOT BY THE HARVEST', 160, 200, { size: fit('SET BY THE LAND, NOT BY THE HARVEST', 1230, 44, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.ink });
    const B0 = 800;
    [['good year', 420, 230], ['bad year', 220, 860]].forEach(([label, hv, x], i) => {
      const g = eio(seg(t, at('d2', 0.1 + i * 0.25), at('d2', 0.4 + i * 0.25)));
      ctx.fillStyle = C.field; ctx.fillRect(x, B0 - hv * g, 140, hv * g);
      ctx.fillStyle = C.ochre; ctx.fillRect(x + 170, B0 - 200 * g, 140, 200 * g);
      A(g, () => {
        txt('harvest', x + 70, B0 + 36, { size: 30, weight: 600, color: C.soft, align: 'center' });
        txt('quota', x + 240, B0 + 36, { size: 30, weight: 700, color: C.ochre, align: 'center' });
        txt(label, x + 155, B0 + 90, { size: 36, weight: 700, color: C.ink, align: 'center' });
      });
    });
    ctx.fillStyle = C.faint; ctx.fillRect(160, B0, 1100, 2);
    A(fin(t, at('d2', 0.7), 0.6), () => { ctx.setLineDash([10, 8]); ctx.strokeStyle = C.ochre; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(400, B0 - 200); ctx.lineTo(1200, B0 - 200); ctx.stroke(); ctx.setLineDash([]); txt('the same', 1220, B0 - 200, { size: 32, weight: 700, color: C.ochre }); });
    txt('schematic', 160, 920, { size: 28, weight: 500, color: C.faint });
  });
  // d3: the kulák line, 25 holds
  const kl = span(t, s('d3', 0.0), at('d4', 0.06), 0.6, 0.6);
  if (kl > 0) A(kl, () => {
    const x0 = 180, y0 = 260, c = 76;
    for (let i = 0; i < 25; i++) {
      const a = fin(t, at('d3', 0.05 + i * 0.012), 0.3);
      A(a, () => { ctx.fillStyle = i % 2 ? '#56653a' : C.field; ctx.fillRect(x0 + (i % 5) * c, y0 + Math.floor(i / 5) * c, c - 4, c - 4); });
    }
    const more = fin(t, at('d3', 0.38), 0.5);
    A(more, () => { ctx.fillStyle = C.ochre; ctx.fillRect(x0 + 5 * c + 16, y0 + 4 * c, c - 4, c - 4); txt('+1', x0 + 5 * c + 16 + (c - 4) / 2, y0 + 4 * c + (c - 4) / 2, { size: 30, weight: 800, family: HEAD, color: '#16181c', align: 'center' }); });
    txt('25 holds', x0, y0 + 5 * c + 40, { size: 40, weight: 800, family: HEAD, color: C.ink });
    txt('≈ 14 hectares', x0, y0 + 5 * c + 90, { size: 34, weight: 500, color: C.soft });
    A(fin(t, at('d3', 0.45), 0.6), () => {
      ctx.save(); ctx.translate(760, 340); ctx.rotate(-0.07);
      const w = textW('KULÁK', { size: 64, weight: 800, family: HEAD, spacing: '4px' }) + 50;
      ctx.strokeStyle = C.red; ctx.lineWidth = 5; k.rrect(0, -50, w, 100, 8); ctx.stroke();
      txt('KULÁK', w / 2, 2, { size: 64, weight: 800, family: HEAD, color: C.red, align: 'center', spacing: '4px' });
      ctx.restore();
      txt('“rich peasant”', 760, 440, { size: 34, weight: 500, color: C.soft });
    });
    counter(fmt(61922), 'landowners, 1949', 760, 600, { a: fin(t, at('d3', 0.75), 0.6), size: 72, maxW: 520 });
  });
  // d4–d5: the quota against the harvest, kg of wheat per hold, 1951
  const qb = span(t, s('d4', 0.0), at('d6', 0.06), 0.6, 0.6);
  if (qb > 0) A(qb, () => {
    const B0 = 840, KG = 0.42, X = 360;
    txt('1951 · KILOGRAMS OF WHEAT PER HOLD', 160, 200, { size: fit('1951 · KILOGRAMS OF WHEAT PER HOLD', 1230, 42, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.ink });
    ctx.fillStyle = C.faint; ctx.fillRect(160, B0, 1100, 2);
    for (const v of [0, 500, 1000]) { txt(fmt(v), 300, B0 - v * KG, { size: 28, weight: 500, color: C.faint, align: 'right' }); ctx.fillStyle = C.ghost; ctx.fillRect(310, B0 - v * KG, 950, 1); }
    const qg = eio(seg(t, at('d4', 0.45), at('d4', 0.85)));
    // the quota: a range 700–1,100
    ctx.fillStyle = C.ochreDim; ctx.fillRect(X, B0 - 700 * KG * qg, 200, 700 * KG * qg);
    A(qg, () => {
      ctx.fillStyle = C.ochre; ctx.fillRect(X, B0 - 1100 * KG, 200, 400 * KG);
      txt(fmt(1100), X + 100, B0 - 1100 * KG - 28, { size: 36, weight: 800, family: HEAD, color: C.ochre, align: 'center' });
      txt(fmt(700), X + 100, B0 - 700 * KG + 30, { size: 34, weight: 800, family: HEAD, color: '#16181c', align: 'center' });
      txtFit('quota for a kulák', X + 100, B0 + 40, 300, { size: 32, weight: 700, color: C.ochre, align: 'center' });
    });
    const hg = eio(seg(t, at('d5', 0.25), at('d5', 0.7)));
    ctx.fillStyle = C.field; ctx.fillRect(X + 380, B0 - 970 * KG * hg, 200, 970 * KG * hg);
    A(hg, () => {
      txt(fmt(970), X + 480, B0 - 970 * KG - 28, { size: 36, weight: 800, family: HEAD, color: C.ink, align: 'center' });
      txtFit('average harvest', X + 480, B0 + 40, 300, { size: 32, weight: 700, color: C.ink, align: 'center' });
      ctx.setLineDash([10, 8]); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X - 20, B0 - 970 * KG); ctx.lineTo(X + 600, B0 - 970 * KG); ctx.stroke(); ctx.setLineDash([]);
    });
    A(fin(t, at('d5', 0.8), 0.6), () => {
      ctx.fillStyle = C.red; ctx.fillRect(X, B0 - 1100 * KG, 200, 130 * KG);
      txt('more than the whole crop', X + 640, B0 - 1050 * KG, { size: 34, weight: 700, color: C.red });
      txt('in the best year of the period', X + 640, B0 - 1050 * KG + 48, { size: 30, weight: 500, color: C.soft });
    });
  });
  // d6: attic sweeping
  const as = span(t, s('d6', 0.0), at('d7', 0.06), 0.6, 0.6);
  if (as > 0) A(as, () => {
    const x = 300, G = 700, w = 560;
    ctx.fillStyle = C.steelDk; ctx.fillRect(x, G - 260, w, 260);
    ctx.fillStyle = '#2b333c'; ctx.beginPath(); ctx.moveTo(x - 30, G - 260); ctx.lineTo(x + w / 2, G - 470); ctx.lineTo(x + w + 30, G - 260); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1b2026'; ctx.fillRect(x + 40, G, w - 80, 150);
    ctx.fillStyle = C.faint; ctx.fillRect(110, G, 1290, 2);
    sack(x + 200, G - 280, C.wheat); sack(x + 340, G - 280, C.wheat); sack(x + 120, G + 130, C.wheat);
    // two torch beams, sweeping
    [[x + w / 2, G - 420, 1.2], [x + 120, G + 30, 0.0]].forEach(([bx, by, ph], i) => {
      const a0 = (i === 0 ? Math.PI * 0.5 : Math.PI * 0.15) + 0.5 * Math.sin(t * 1.3 + ph);
      const b = fin(t, at('d6', 0.15 + i * 0.2), 0.6);
      A(b, () => {
        const g2 = ctx.createRadialGradient(bx, by, 10, bx, by, 300);
        g2.addColorStop(0, 'rgba(240,226,170,0.55)'); g2.addColorStop(1, 'rgba(240,226,170,0)');
        ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.arc(bx, by, 300, a0 - 0.28, a0 + 0.28); ctx.closePath(); ctx.fill();
      });
    });
    txt('loft', x + w + 50, G - 330, { size: 32, weight: 600, color: C.soft });
    txt('cellar', x + w + 50, G + 80, { size: 32, weight: 600, color: C.soft });
    A(fin(t, at('d6', 0.6), 0.6), () => {
      txt('“ATTIC SWEEPING”', 1020, 300, { size: fit('“ATTIC SWEEPING”', 390, 48, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.ochre });
      txtFit('hidden grain taken', 1020, 360, 390, { size: 34, weight: 600, color: C.ink });
    });
  });
  // d7: convictions for "crimes against public supply", 1948–1955
  const cv = span(t, s('d7', 0.0), at('d9', 0.06), 0.6, 0.6);
  if (cv > 0) A(cv, () => {
    const B0 = 820, MAXH = 440, BW = 100, X0 = 190;
    const head = 'CONVICTED OF “CRIMES AGAINST PUBLIC SUPPLY”';
    txt(head, 160, 200, { size: fit(head, 1230, 40, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.ink });
    txt('official statistics', 160, 250, { size: 32, weight: 500, color: C.soft });
    CONV.forEach(([yr, v], i) => {
      const g = eio(seg(t, at('d7', 0.1 + i * 0.07), at('d7', 0.3 + i * 0.07))), h = (v / 47296) * MAXH * g, x = X0 + i * 140;
      ctx.fillStyle = yr === 1951 ? C.ochre : C.steelMid; ctx.fillRect(x, B0 - h, BW, h);
      A(g, () => { txt(fmt(v), x + BW / 2, B0 - h - 24, { size: 28, weight: 700, color: yr === 1951 ? C.ochre : C.ink, align: 'center' }); txt(String(yr), x + BW / 2, B0 + 34, { size: 30, weight: 600, color: C.soft, align: 'center' }); });
    });
    ctx.fillStyle = C.faint; ctx.fillRect(170, B0, 1140, 2);
    counter(fmt(CONV_SUM), 'in eight years', 1000, 330, { a: fin(t, at('d7', 0.8), 0.6), size: 60, maxW: 380 });
  });
  // d9: Dobi
  const db = span(t, s('d9', 0.0), e('d9', 4.0), 0.6, 0.8);
  if (db > 0) A(db, () => {
    rrect(200, 300, 1000, 380, 16, C.card, C.ochreDim, 2);
    txt('“', 250, 390, { size: 120, weight: 800, family: HEAD, color: C.ochre });
    k.rich('the villages had *many times more reason to complain* than the towns', 720, 470, { maxW: 820, size: 46, weight: 700, family: TXT, ink: C.ink, marks: { '*': C.ochre } });
    A(fin(t, at('d9', 0.5), 0.6), () => txt('István Dobi, head of state, 1 December 1956', 720, 620, { size: 32, weight: 500, color: C.soft, align: 'center' }));
  });
}

// ---------- 5: a foreign power ----------
function emblemKossuth(cx, cy, r) {
  // a shield: red and silver stripes on the left, a double cross on a triple green mount on the right
  ctx.save();
  ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy - r); ctx.lineTo(cx + r, cy + r * 0.2); ctx.quadraticCurveTo(cx + r, cy + r * 1.15, cx, cy + r * 1.3); ctx.quadraticCurveTo(cx - r, cy + r * 1.15, cx - r, cy + r * 0.2); ctx.closePath();
  ctx.clip();
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? C.white : C.red; ctx.fillRect(cx - r, cy - r + i * (r * 2.4 / 8), r, r * 2.4 / 8 + 1); }
  ctx.fillStyle = C.red; ctx.fillRect(cx, cy - r, r, r * 2.4);
  ctx.fillStyle = C.green; for (const [dx, rr] of [[0.25, 0.28], [0.75, 0.28], [0.5, 0.36]]) { ctx.beginPath(); ctx.arc(cx + r * dx, cy + r * 1.0, r * rr, Math.PI, 0); ctx.fill(); }
  ctx.fillStyle = C.white; ctx.fillRect(cx + r * 0.46, cy - r * 0.8, r * 0.09, r * 1.5); ctx.fillRect(cx + r * 0.3, cy - r * 0.6, r * 0.41, r * 0.08); ctx.fillRect(cx + r * 0.25, cy - r * 0.35, r * 0.51, r * 0.08);
  ctx.restore();
  ctx.strokeStyle = C.ochre; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy - r); ctx.lineTo(cx + r, cy + r * 0.2); ctx.quadraticCurveTo(cx + r, cy + r * 1.15, cx, cy + r * 1.3); ctx.quadraticCurveTo(cx - r, cy + r * 1.15, cx - r, cy + r * 0.2); ctx.closePath(); ctx.stroke();
}
function emblem1949(cx, cy, r) {
  // simplified: a round field with a hammer and an ear of wheat, wreathed in wheat, a red star above
  ctx.fillStyle = '#5d86b0'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.wheat; ctx.lineWidth = r * 0.12;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, -Math.PI * 0.38, Math.PI * 0.38); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.6); ctx.fillRect(-r * 0.05, -r * 0.4, r * 0.1, r * 0.75); ctx.fillRect(-r * 0.2, -r * 0.45, r * 0.4, r * 0.14); ctx.restore();
  ctx.strokeStyle = C.wheat; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + r * 0.25, cy + r * 0.4); ctx.quadraticCurveTo(cx + r * 0.1, cy, cx + r * 0.3, cy - r * 0.35); ctx.stroke();
  ctx.fillStyle = C.red; ctx.fillRect(cx - r * 0.6, cy + r * 0.85, r * 0.4, r * 0.14); ctx.fillStyle = C.white; ctx.fillRect(cx - r * 0.2, cy + r * 0.85, r * 0.4, r * 0.14); ctx.fillStyle = C.green; ctx.fillRect(cx + r * 0.2, cy + r * 0.85, r * 0.4, r * 0.14);
  star(cx, cy - r * 0.95, r * 0.3, C.red);
}
function tank(x, y, sz, col) {
  ctx.fillStyle = col; k.rrect(x - sz, y - sz * 0.3, sz * 2, sz * 0.6, sz * 0.3); ctx.fill();
  ctx.fillRect(x - sz * 0.5, y - sz * 0.65, sz, sz * 0.4); ctx.fillRect(x + sz * 0.4, y - sz * 0.55, sz * 0.9, sz * 0.14);
}
function partForeign(t) {
  const PX = 1050, PW = 380;
  const head = (str, y, col = C.ink, size = 48) => txt(str, PX, y, { size: fit(str, PW, size, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: col });
  // e1–e4: the map
  const mp = span(t, s('e1', 0.0), at('e5', 0.06), 0.8, 0.7);
  if (mp > 0) A(mp, () => {
    // Austria and the Soviet zone (schematic), north-west of the map
    const zone = span(t, s('e2', 0.2), at('e3', 0.6), 0.6, 0.8);
    A(zone, () => {
      const v = P(...PLACES.vienna);
      ctx.save(); ctx.beginPath(); ctx.ellipse(v[0] - 10, v[1] + 40, 90, 110, 0.2, 0, TAU); ctx.clip();
      ctx.strokeStyle = C.sovietDim; ctx.lineWidth = 3; for (let i = -12; i < 12; i++) { ctx.beginPath(); ctx.moveTo(v[0] - 120 + i * 18, v[1] - 120); ctx.lineTo(v[0] + 80 + i * 18, v[1] + 180); ctx.stroke(); }
      ctx.restore();
    });
    hungary(P, 1);
    town(P(...PLACES.budapest), 'Budapest', { r: 9, dx: 16, dy: 30, size: 32 });
    A(fin(t, s('e2', 0.2), 0.6), () => { town(P(...PLACES.vienna), 'Vienna', { r: 8, dx: 0, dy: -32, align: 'center', size: 32 }); txt('AUSTRIA', 104, P(...PLACES.vienna)[1] - 82, { size: 28, weight: 700, color: C.soft, spacing: '2px' }); });
    // 1944–45: the Soviet army comes in from the east
    [[[22.75, 46.55], [20.2, 46.85]], [[22.85, 47.55], [21.0, 47.6]], [[22.6, 48.45], [21.0, 48.1]], [[20.2, 46.85], [19.2, 47.4]]].forEach(([p0, p1], i) =>
      A(1 - 0.6 * seg(t, e('e1', 0.5), e('e1', 1.5)), () => curve(P(...p0), P(...p1), eio(seg(t, at('e1', 0.3 + i * 0.08), at('e1', 0.7 + i * 0.06))), C.soviet, { bend: 0.1, w: 7, headSize: 22 })));
    // the lines of communication to the zone in Austria
    const lc = seg(t, s('e2', 0.4), at('e2', 0.9));
    A(span(t, s('e2', 0.4), at('e3', 0.7), 0.5, 0.8), () => {
      ctx.strokeStyle = C.soviet; ctx.lineWidth = 5; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30;
      const a = P(...PLACES.budapest), b = P(...PLACES.vienna);
      ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(lerp(a[0], b[0], eio(lc)), lerp(a[1], b[1], eio(lc))); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    });
    // e4: the troops stay
    A(fin(t, s('e4', 0.3), 0.6), () => { star(...P(18.3, 47.25), 16, C.soviet); star(...P(20.6, 47.0), 16, C.soviet); });
    // e7 is on the second map; Pécs is marked there
  });
  const pn = (from, to) => span(t, from, to, 0.6, 0.6);
  A(pn(s('e1', 0.3), s('e2', 0.3)), () => {
    head('1944–45', 260, C.soviet);
    txt('the Soviet army', PX, 316, { size: 36, weight: 700, color: C.ink });
    txt('fighting Germany', PX, 362, { size: 32, weight: 500, color: C.soft });
    A(fin(t, at('e1', 0.85), 0.6), () => txt('and it stayed', PX, 440, { size: 38, weight: 700, color: C.ochre }));
  });
  A(pn(s('e2', 0.3), s('e3', 0.2)), () => {
    head('1947', 260);
    txt('peace treaty, article 22', PX, 316, { size: 34, weight: 700, color: C.ink });
    txtFit('troops may stay to guard', PX, 380, PW, { size: 32, weight: 500, color: C.soft });
    txtFit('the lines to the Soviet zone', PX, 420, PW, { size: 32, weight: 500, color: C.soft });
    txtFit('in Austria', PX, 460, PW, { size: 32, weight: 500, color: C.soft });
  });
  A(pn(s('e3', 0.2), s('e4', 0.3)), () => {
    head('MAY 1955', 260);
    A(fin(t, at('e3', 0.1), 0.5), () => { txt('15 May', PX, 330, { size: 34, weight: 800, color: C.soft }); txtFit('Austria’s occupation ends', PX, 372, PW, { size: 32, weight: 500, color: C.soft }); });
    A(fin(t, at('e3', 0.55), 0.5), () => { txt('14 May', PX, 450, { size: 34, weight: 800, color: C.ochre }); txtFit('Warsaw Pact signed', PX, 492, PW, { size: 32, weight: 700, color: C.ochre }); txtFit('a new reason to stay', PX, 534, PW, { size: 32, weight: 500, color: C.ink }); });
  });
  A(pn(s('e4', 0.3), at('e5', 0.06)), () => {
    head('BEFORE OCTOBER 1956', 260, C.ink, 40);
    counter(fmt(20000), 'Soviet soldiers', PX, 340, { size: 64, color: C.soviet, maxW: PW });
    A(fin(t, at('e4', 0.55), 0.6), () => { for (let i = 0; i < 6; i++) tank(PX + 32 + i * 56, 530, 22, C.soviet); txt('600 tanks', PX, 590, { size: 34, weight: 700, color: C.ink }); txtFit('as the UN was told', PX, 636, PW, { size: 30, weight: 500, color: C.soft }); });
  });

  // e5: reparations, goods worth 200 million dollars, by train to the east
  const rp = span(t, s('e5', 0.0), s('e7', 0.3), 0.6, 0.6);
  if (rp > 0) A(rp, () => {
    const G = 780, run = eio(seg(t, at('e5', 0.2), e('e5', 1.5)));
    ctx.fillStyle = C.faint; ctx.fillRect(110, G + 26, 1290, 3);
    for (let i = 0; i < 4; i++) {
      const x = 140 + i * 250 + run * 260;
      ctx.fillStyle = C.steelDk; ctx.fillRect(x, G - 20, 220, 30);
      ctx.fillStyle = '#0c0e11'; for (const wx of [30, 190]) { ctx.beginPath(); ctx.arc(x + wx, G + 14, 14, 0, TAU); ctx.fill(); }
      for (let j = 0; j < 4; j++) {
        const cx = x + 12 + (j % 2) * 100 + (j > 1 ? 50 : 0), cy = G - 20 - (j > 1 ? 160 : 80);
        if (j === 3) continue;
        ctx.fillStyle = '#7a6040'; ctx.fillRect(cx, cy, 92, 78); ctx.strokeStyle = '#4a3a26'; ctx.lineWidth = 3; ctx.strokeRect(cx + 6, cy + 6, 80, 66);
        ctx.beginPath(); ctx.moveTo(cx + 6, cy + 6); ctx.lineTo(cx + 86, cy + 72); ctx.stroke();
      }
    }
    A(fin(t, at('e5', 0.5), 0.6), () => {
      txt('200 million', 160, 260, { size: 64, weight: 800, family: HEAD, color: C.ochre });
      txt('dollars, in goods', 160, 322, { size: 38, weight: 700, color: C.ink });
      txt('armistice, 20 January 1945', 160, 374, { size: 32, weight: 500, color: C.soft });
      curve([1180, 470], [1380, 470], 1, C.soviet, { bend: 0, w: 6, headSize: 22 });
      txt('to the Soviet Union', 1380, 420, { size: 34, weight: 700, color: C.soviet, align: 'right' });
    });
  });
  // e7: secret trade deals; uranium near Pécs
  const ur = span(t, s('e7', 0.0), at('e8', 0.06), 0.6, 0.6);
  if (ur > 0) A(ur, () => {
    const x = 170, y = 260;
    ctx.fillStyle = C.paper; ctx.fillRect(x, y, 420, 540);
    txt('TRADE AGREEMENTS', x + 30, y + 60, { size: fit('TRADE AGREEMENTS', 360, 36, { weight: 800, family: HEAD }), weight: 800, family: HEAD, color: C.pink });
    for (let i = 0; i < 9; i++) { ctx.fillStyle = 'rgba(42,38,32,0.25)'; ctx.fillRect(x + 30, y + 120 + i * 40, 360 - (i % 3) * 60, 10); }
    A(fin(t, at('e7', 0.2), 0.5), () => {
      ctx.save(); ctx.translate(x + 210, y + 300); ctx.rotate(-0.18);
      const w = textW('SECRET', { size: 60, weight: 800, family: HEAD, spacing: '6px' }) + 50;
      ctx.strokeStyle = C.red; ctx.lineWidth = 6; k.rrect(-w / 2, -48, w, 96, 8); ctx.stroke();
      txt('SECRET', 0, 2, { size: 60, weight: 800, family: HEAD, color: C.red, align: 'center', spacing: '6px' });
      ctx.restore();
    });
    const P2 = mkP(700, 300, 120);
    A(fin(t, at('e7', 0.45), 0.6), () => {
      hungary(P2, 1, { labelXY: [700, P2(16.1, 45.72)[1] + 18] });
      const pc = P2(...PLACES.pecs);
      ctx.fillStyle = C.ochre; ctx.beginPath(); ctx.arc(pc[0], pc[1], 12, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.ochre; ctx.lineWidth = 2; for (let r = 18; r < 40; r += 10) { ctx.beginPath(); ctx.arc(pc[0], pc[1], r + ((t * 12) % 10), 0, TAU); ctx.stroke(); }
      txt('Pécs: uranium', pc[0] + 50, pc[1] + 12, { size: 34, weight: 700, color: C.ochre });
      txtFit('believed to go to the Soviet Union', 700, 760, 700, { size: 32, weight: 500, color: C.soft });
    });
  });
  // e8: the emblems
  const em = span(t, s('e8', 0.0), at('e9', 0.08), 0.6, 0.6);
  if (em > 0) A(em, () => {
    const ka = fin(t, s('e8', 0.3), 0.6), sw = eio(seg(t, at('e8', 0.5), at('e8', 0.85)));
    A(ka * (1 - 0.6 * sw), () => { emblemKossuth(400, 450, 120); txt('Kossuth arms', 400, 660, { size: 36, weight: 700, color: C.ink, align: 'center' }); });
    curve([580, 470], [780, 470], sw, C.ochre, { bend: -0.15, w: 5 });
    A(sw, () => { emblem1949(980, 470, 150); txt('1949 emblem', 980, 660, { size: 36, weight: 700, color: C.ink, align: 'center' }); txt('with a red star', 980, 706, { size: 32, weight: 500, color: C.soft, align: 'center' }); });
    txt('SOVIET-STYLE SYMBOLS', 160, 220, { size: 44, weight: 800, family: HEAD, color: C.ink, spacing: '2px' });
  });
  // e9: the uniform and compulsory Russian
  const ru = span(t, s('e9', 0.0), at('e10', 0.06), 0.6, 0.6);
  if (ru > 0) A(ru, () => {
    const ux = 380, uy = 650;
    figure(ux, uy, 330, '#5b6b4e');
    ctx.fillStyle = '#4a5940'; k.rrect(ux - 50, uy - 300, 100, 26, 8); ctx.fill(); ctx.fillRect(ux - 70, uy - 282, 140, 10);
    star(ux, uy - 288, 9, C.soviet);
    txt('uniforms on the Soviet model', ux, uy + 60, { size: 34, weight: 700, color: C.ink, align: 'center' });
    A(fin(t, at('e9', 0.5), 0.6), () => {
      const bx = 820, by = 300;
      rrect(bx, by, 380, 300, 8, '#7a2f2f', null); ctx.fillStyle = '#5c2222'; ctx.fillRect(bx, by, 26, 300);
      txt('Русский язык', bx + 205, by + 150, { size: 42, weight: 700, color: C.ink, align: 'center' });
      txt('Russian: compulsory at school', bx + 190, by + 360, { size: 34, weight: 700, color: C.ink, align: 'center' });
    });
  });
  // e10: 15 March, a working day
  const mr = span(t, s('e10', 0.0), at('e12', 0.06), 0.6, 0.6);
  if (mr > 0) A(mr, () => {
    const x = 340, y = 260;
    ctx.fillStyle = C.paper; ctx.fillRect(x, y, 380, 460); ctx.fillStyle = C.red; ctx.fillRect(x, y, 380, 90);
    txt('MARCH', x + 190, y + 47, { size: 44, weight: 800, family: HEAD, color: C.ink, align: 'center', spacing: '4px' });
    txt('15', x + 190, y + 250, { size: 200, weight: 800, family: HEAD, color: C.pink, align: 'center' });
    txt('1848: the revolution', x + 190, y + 400, { size: 32, weight: 600, color: C.pinkSoft, align: 'center' });
    A(fin(t, at('e10', 0.6), 0.5), () => {
      ctx.save(); ctx.translate(x + 560, y + 230); ctx.rotate(-0.1);
      const w = textW('WORKING DAY', { size: 44, weight: 800, family: HEAD, spacing: '3px' }) + 44;
      ctx.strokeStyle = C.ochre; ctx.lineWidth = 5; k.rrect(-20, -40, w, 80, 8); ctx.stroke();
      txt('WORKING DAY', w / 2 - 20, 2, { size: 44, weight: 800, family: HEAD, color: C.ochre, align: 'center', spacing: '3px' });
      ctx.restore();
      txt('no longer a holiday', x + 560, y + 330, { size: 34, weight: 600, color: C.soft });
    });
  });
  // e12: not the soldiers, the power
  const np = span(t, s('e12', 0.0), e('e12', 3.6), 0.6, 0.8);
  if (np > 0) A(np, () => {
    figure(360, 700, 300, '#6b6f6a');
    txt('Soviet soldiers', 360, 760, { size: 36, weight: 700, color: C.ink, align: 'center' });
    txt('not personally unpopular', 360, 806, { size: 32, weight: 500, color: C.soft, align: 'center' });
    A(fin(t, at('e12', 0.5), 0.6), () => {
      rrect(820, 330, 440, 380, 14, '#2a1f22', C.soviet, 3);
      star(1040, 470, 70, C.soviet);
      txtFit('a foreign power', 1040, 610, 400, { size: 38, weight: 800, family: HEAD, color: C.ink, align: 'center' });
      txtFit('keeping the regime in place', 1040, 760, 520, { size: 32, weight: 600, color: C.soviet, align: 'center' });
    });
    txt('UN Special Committee, 1957', 160, 920, { size: 30, weight: 500, color: C.soft });
  });
}

// ---------- 6: sixteen points ----------
function partPoints(t) {
  // f1: Stalin's death; the camps close
  const sd = span(t, s('f1', 0.0), s('f2', 0.5), 0.6, 0.6);
  if (sd > 0) A(sd, () => {
    txt('5 MARCH 1953', 160, 230, { size: 44, weight: 800, family: HEAD, color: C.ink });
    txt('Stalin dies', 160, 282, { size: 34, weight: 600, color: C.soft });
    const gx = 620, G = 760, open = eio(seg(t, at('f1', 0.5), at('f1', 0.8)));
    A(fin(t, at('f1', 0.35), 0.6), () => {
      ctx.strokeStyle = C.steel; ctx.lineWidth = 3;
      for (const x0 of [gx - 380, gx + 160]) for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * 40, G); ctx.lineTo(x0 + i * 40, G - 220); ctx.stroke(); }
      for (const y of [G - 200, G - 140, G - 80]) { ctx.beginPath(); ctx.moveTo(gx - 380, y); ctx.lineTo(gx - 160, y); ctx.moveTo(gx + 160, y); ctx.lineTo(gx + 380, y); ctx.stroke(); }
      // the gate swings open
      ctx.save(); ctx.translate(gx - 150, G); ctx.scale(lerp(1, 0.15, open), 1);
      ctx.strokeStyle = C.steel; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(i * 37, 0); ctx.lineTo(i * 37, -220); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(0, -110); ctx.lineTo(148, -110); ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.translate(gx + 150, G); ctx.scale(lerp(1, 0.15, open), 1);
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-i * 37, 0); ctx.lineTo(-i * 37, -220); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(0, -110); ctx.lineTo(-148, -110); ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 4; i++) { const w = eio(seg(t, at('f1', 0.65 + i * 0.06), e('f1', 1.2 + i * 0.25))); if (w > 0) A(Math.min(1, w * 4), () => figure(gx - 90 + i * 60 + (i - 1.5) * w * 90, G + 10 + w * 150, 80 + w * 50, C.ink)); }
      ctx.fillStyle = C.faint; ctx.fillRect(110, G, 1290, 2);
    });
    A(fin(t, at('f1', 0.45), 0.6), () => { txt('JULY 1953', 1060, 230, { size: 44, weight: 800, family: HEAD, color: C.ochre }); txt('Imre Nagy, prime minister', 1060, 282, { size: 32, weight: 600, color: C.ink }); txt('internment abolished', 1060, 330, { size: 32, weight: 600, color: C.soft }); });
  });
  // f2: what remained
  const rm = span(t, s('f2', 0.0), s('f3', 0.4), 0.5, 0.6);
  if (rm > 0) A(rm, () => {
    [['the ÁVH remained', C.steel, 0.1], ['Rákosi still led the party', C.steel, 0.35], ['the fear stayed', C.ochre, 0.68]].forEach(([w, col, f], i) => chip(w, 760, 380 + i * 140, { color: col, size: 44, a: fin(t, at('f2', f), 0.5) }));
  });
  // f3: everyone had grievances; the sheet comes in
  const gp = span(t, s('f3', 0.0), at('f3', 0.62), 0.5, 0.5);
  if (gp > 0) A(gp, () => {
    ['workers', 'peasants', 'students', 'writers'].forEach((w, i) => chip(w, 260 + i * 300, 500, { color: C.ink, size: 40, a: fin(t, at('f3', 0.05 + i * 0.08), 0.4) }));
  });
  // the sheet, matched point by point to the grievances
  const MATCH = [[1, 'f5', 0.05, 4], [8, 'f5', 0.55, 5], [9, 'f6', 0.12, 2], [10, 'f6', 0.6, 3], [11, 'f8', 0.12, 1], [12, 'f8', 0.62, 0], [13, 'f10', 0.1, 6], [14, 'f10', 0.4, 6]];
  const sa = span(t, at('f3', 0.55), s('f13', 0.4), 0.8, 0.8);
  if (sa > 0) {
    const hl = (n) => { const m = MATCH.find((q) => q[0] === n); return m ? fin(t, at(m[1], m[2]), 0.6) : 0; };
    const dim = fin(t, s('f5', 0.0), 0.8);
    const fade = 1 - 0.9 * span(t, s('f11', 0.0), e('f12', 1.0), 0.6, 0.0) * (t < s('f13') ? 1 : 0);
    sheet(t, { a: sa * fade, lines: eio(seg(t, at('f3', 0.55), e('f3', 0.9))), hl, dim });
    // the connectors to the ledger
    MATCH.forEach(([n, key, f, card], j) => {
      const u = eio(seg(t, at(key, f), at(key, f) + 0.7));
      if (u <= 0) return;
      const slot = LEDGER[card].pts.findIndex((q) => q[0] === String(n));
      const p0 = [SX + SW + 4, lineY(n)], p1 = [LX - 34 - slot * 58 - 26, cardY(card) + LH / 2];
      A(sa * fade * 0.85, () => curve(p0, [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)], 1, C.ochre, { bend: 0.0, w: 3, head: false }));
    });
  }
  // f11: disband the ÁVH
  const dv = span(t, s('f11', 0.0), s('f12', 0.3), 0.5, 0.6);
  if (dv > 0) A(dv, () => {
    const cx = 590, cy = 560, w = textW('Disband the ÁVH!', { size: 60, weight: 800, family: HEAD }) + 90;
    ctx.fillStyle = C.ink; ctx.fillRect(cx - w / 2 + 30, cy + 60, 8, 200); ctx.fillRect(cx + w / 2 - 38, cy + 60, 8, 200);
    rrect(cx - w / 2, cy - 70, w, 140, 8, C.paper, C.red, 5);
    txt('Disband the ÁVH!', cx, cy + 2, { size: 60, weight: 800, family: HEAD, color: C.red, align: 'center' });
    for (let i = 0; i < 14; i++) figure(cx - 360 + i * 56, 940 + (i % 2) * 14, 110 + (i % 3) * 14, i % 4 === 1 ? C.soft : C.faint);
    A(fin(t, at('f11', 0.3), 0.6), () => curve([cx + w / 2, cy], [LX - 34 - 58 - 26, cardY(0) + LH / 2], eio(seg(t, at('f11', 0.3), at('f11', 0.7))), C.red, { bend: -0.12, w: 3, head: false }));
  });
  // f12: freedom
  const fr = span(t, s('f12', 0.0), s('f13', 0.4), 0.6, 0.7);
  if (fr > 0) A(fr, () => {
    rrect(170, 330, 1120, 360, 16, C.card, C.ochre, 3);
    txt('“', 220, 420, { size: 120, weight: 800, family: HEAD, color: C.ochre });
    k.rich('We wanted *freedom* and not a good comfortable life.', 740, 500, { maxW: 960, size: 54, weight: 700, family: TXT, ink: C.ink, marks: { '*': C.ochre } });
    A(fin(t, at('f12', 0.5), 0.6), () => txt('a student, aged 18, to the UN Special Committee', 740, 632, { size: 32, weight: 500, color: C.soft, align: 'center' }));
  });
  // f13: the road to 23 October
  const rd = span(t, s('f13', 0.0), e('f13', 2.4), 0.8, 1.0);
  if (rd > 0) A(rd, () => {
    flag(760 - 120, 300, 240, 160);
    const u = eio(seg(t, at('f13', 0.2), at('f13', 0.8)));
    const X0 = 260, X1 = 1260, Y = 640;
    ctx.fillStyle = C.faint; ctx.fillRect(X0, Y, X1 - X0, 3);
    ctx.fillStyle = C.ochre; ctx.fillRect(X0, Y - 2, (X1 - X0) * u, 7);
    arrowHead(lerp(X0, X1, u) + 8, Y + 1, 0, C.ochre, 20);
    txt('1953', X0, Y + 50, { size: 34, weight: 700, color: C.soft, align: 'center' });
    A(fin(t, at('f13', 0.75), 0.5), () => txt('23 October 1956', X1, Y + 50, { size: 34, weight: 700, color: C.ochre, align: 'center' }));
    A(fin(t, at('f13', 0.7), 0.6), () => { const ttl = 'THE ROAD TO 23 OCTOBER'; txt(ttl, 760, 790, { size: fit(ttl, 1200, 64, { weight: 800, family: HEAD, spacing: '2px' }), weight: 800, family: HEAD, color: C.ink, align: 'center', spacing: '2px' }); txt('the next film', 760, 860, { size: 34, weight: 500, color: C.soft, align: 'center' }); });
  });
}

// ---------- chapter cards and credits ----------
function titleCards(t) {
  CH.forEach((ch) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.92, () => { ctx.fillStyle = 'rgba(14,16,20,0.96)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8)), y = 500 + (1 - p) * 18;
      txt(`PART ${ch.n}`, W / 2, y - 120, { size: 36, weight: 700, color: C.ochre, align: 'center', spacing: '6px' });
      const title = ch.title.toUpperCase();
      txt(title, W / 2, y, { size: fit(title, 1500, 118, { weight: 800, family: HEAD, spacing: '2px' }), weight: 800, family: HEAD, align: 'center', spacing: '2px' });
      tricolour(W / 2, y + 86, 300 * p, 6);
    });
  });
}
const MUSIC = ['“Metaphysik” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Lost Time” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Eternal Hope” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  'UN Special Committee on the Problem of Hungary, Report (1957); the 1956 Institute;',
  'Géza Böszörményi, Recsk 1950–1953; József Saád, Hortobágy deportees (National Archives);',
  'Róbert Kis-Kapin (Betekintő); Endre Domonkos; Zsombor Bódy; Bálint Magyar; Csaba Kovács;',
  'Ignác Romsics; János Honvári; Hungarian Central Statistical Office (KSH).',
  'Maps: schematic, drawn for this series.',
];
function credits() {
  ctx.drawImage(BG, 0, 0);
  ctx.fillStyle = 'rgba(10,12,15,0.55)'; ctx.fillRect(0, 0, W, H);
  flag(W / 2 - 60, 120, 120, 80);
  const ttl = 'WHY HUNGARY ROSE';
  txt(ttl, W / 2, 290, { size: fit(ttl, 1500, 84, { weight: 800, family: HEAD, spacing: '2px' }), weight: 800, family: HEAD, align: 'center', spacing: '2px' });
  txt('Hungary 1956 · original animation', W / 2, 372, { size: 40, weight: 600, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 470, { size: 32, weight: 800, color: C.ochre, align: 'center', spacing: '4px' });
  MUSIC.forEach((m, j) => txt(m, W / 2, 518 + j * 44, { size: 32, weight: 500, align: 'center' }));
  const sy = 518 + MUSIC.length * 44 + 70;
  txt('SOURCES', W / 2, sy, { size: 32, weight: 800, color: C.ochre, align: 'center', spacing: '4px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, sy + 50 + j * 46, 1700, { size: 32, weight: 500, align: 'center', color: j === SOURCES.length - 1 ? C.soft : C.ink }));
}

// The year span of each part, for the strip along the top.
const SPANS = [null, [1949, 1954], [1950, 1954], [1950, 1955], [1948, 1956], [1944, 1957], [1953, 1957]];
const MARKS = [null, null, ['b6', 1950.47, 'b9', 1951.45], null, null, ['e3', 1955.37], null];

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [HEAD, TXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    const parts = [partOpen, partFist, partTrial, partIron, partVillage, partForeign, partPoints];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      const pa = i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0);
      A(pa, () => {
        if (SPANS[i]) {
          let mark = null;
          const m = MARKS[i];
          if (m) for (let j = 0; j < m.length; j += 2) if (t >= s(m[j])) mark = m[j + 1];
          yearStrip(i === 6 ? 1 - seg(t, s('f13', 0), s('f13', 1)) : 1, SPANS[i][0], SPANS[i][1], { mark });
        }
        fn(t);
      });
    });
    ledger(t);
    titleCards(t);
    A(seg(t, e('f13', 1.4), e('f13', 2.4)), () => credits());
  },
});
