// Explainer for economics-tragedy-of-the-commons: Hardin's overgrazed pasture, and Ostrom's finding
// that communities often manage commons well with rules of their own.
// Look: a flat pastoral illustration. A pale morning sky, layered rolling hills in meadow greens,
// a fenced common pasture in the middle with four farms around it (red, blue, yellow and purple
// roofs; each cow wears its farm's colour), and a dark foreground meadow that carries the captions.
// Fredoka for captions and titles, Nunito for labels.
//
// The pasture is simulated, season by season: grass G (1 = full) regrows logistically and each cow
// eats a share, G ← G + r·G·(1 − G) − c·N·G with r = 1 and c = 1/24, so the most milk the
// pasture can give for ever comes from 12 cows. Milk per cow is G; the herd's total is N·G.
// Hardin's run: every herder adds a cow each season (4, 8, …, 32 cows); because the owner keeps all
// of a new cow's milk while the lost grass is shared, each addition still pays its owner (checked
// below), yet the grass and the total milk collapse. Ostrom-style run: the herders' own rule caps
// the herd at 3 cows each, and the grass settles at a steady, green level. The numbers are a
// teaching model, not data; the drawing is a diagram.
//
// Scene plan (66 s). Important things stay above y = 930; captions are centred at y = 852.
//  A  0.0– 8.6  Hook: the common with four farms. "A pasture that everyone may use…" / Hardin
//               (1968) argued it would be ruined.
//  B  8.4–18.8  The logic: one extra cow, all of its milk to its owner; the grass it eats, shared.
//  C 18.6–33.9  Hardin's run: 8 seasons, the herd grows by 4 a season, the grass browns, total milk
//               rises, then falls. "…Hardin called it the tragedy of the commons."
//  D 33.6–54.0  Ostrom: places from Governing the Commons; a Swiss alpine common shared since 1517;
//               users' own rules (limits, watchers, rising fines); the capped run stays green.
//  E 53.8–66.0  2009 Nobel, first woman; "The tragedy can happen, but it isn't inevitable…";
//               end card with Hardin's later regret ("the Tragedy of the Unregulated Commons").
//
// Facts: Wikipedia "Tragedy of the commons": Hardin's 1968 essay in Science; Lloyd's 1833 example of
// herders sharing a common, where each extra animal benefits its owner while the whole group shares
// the damage; Ostrom and others found the tragedy not as prevalent or as difficult to solve as
// Hardin maintained, since locals have often come up with solutions; a Swiss Alps commons run by a
// collective of farmers since 1517; Hardin later said he should have titled it "The Tragedy of the
// Unregulated Commons". Wikipedia "Elinor Ostrom": 2009 Nobel Memorial Prize in Economic Sciences,
// the first woman to win it; Governing the Commons draws on irrigation in Spain and the
// Philippines, mountain villages in Switzerland and Japan, fisheries in Nova Scotia and Indonesia;
// design principles include rules fitted by users, monitoring and graduated sanctions.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  sky: '#f4efd8', sky2: '#d9ecd9', hill1: '#b7dc9a', hill2: '#8fc873', hill3: '#6fb35c',
  lush: [111, 184, 78], green: [140, 200, 95], dry: [201, 181, 106], dirt: [176, 138, 87],
  fence: '#8a5a33', fg: '#2f5e34', fg2: '#244b29', cream: '#fffbe8', ink: '#22402a', inkSoft: 'rgba(34,64,42,0.75)',
  warm: '#ffb38a', lime: '#d6f5a0', brick: '#b8452e',
  farms: ['#d9534f', '#3f7fc4', '#e8b33a', '#8e5bb5'],
};
const F = 'Fredoka', N = 'Nunito';

let k, ctx;
const font = (w, s, f = F) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the pasture model ----------
const R = 1, EAT = 1 / 24, SEASONS = 8, HERDERS = 4, CAP_EACH = 3;
function run(herd) {
  let g = 1;
  const out = [{ n: HERDERS, g: 1, milk: HERDERS }];
  for (let s = 1; s <= SEASONS; s++) {
    const n = herd(s);
    g = clamp(g + R * g * (1 - g) - EAT * n * g, 0, 1);
    out.push({ n, g, milk: n * g });
  }
  return out;
}
const HARDIN = run((s) => HERDERS * s);
const OSTROM = run((s) => Math.min(HERDERS * s, HERDERS * CAP_EACH));
// Hardin's logic holds in the model: in every season the owner of one extra cow ends up with more
// milk (the new cow's share outweighs the owner's part of the lost grass).
const ownerGain = (s) => {
  const prev = HARDIN[s - 1].g, n = HARDIN[s].n, own = n / HERDERS;
  const gWith = clamp(prev + R * prev * (1 - prev) - EAT * (n + 1) * prev, 0, 1);
  return (own + 1) * gWith - own * HARDIN[s].g;
};
const PAYS = Array.from({ length: SEASONS }, (_, i) => ownerGain(i + 1)).every((x) => x > 0);
if (!PAYS) throw new Error('model no longer shows Hardin’s incentive');
const MILK_MAX = Math.max(...HARDIN.map((r) => r.milk), ...OSTROM.map((r) => r.milk));

// season timing for the two runs
const HS = { t0: 19.0, dt: 1.75 }, OS = { t0: 44.2, dt: 1.15 };
// During interval i → i+1 the herd of season i+1 grazes; its new cows arrive as the interval starts.
const seasonAt = (t, S) => clamp((t - S.t0) / S.dt, 0, SEASONS);
function state(t) {
  const hardin = t < 33.9, S = hardin ? HS : OS, R0 = hardin ? HARDIN : OSTROM;
  const s = seasonAt(t, S), i = Math.min(Math.floor(s), SEASONS - 1), f = eio(clamp(s - i));
  const a = R0[i], b = R0[i + 1];
  let g = lerp(a.g, b.g, f);
  if (hardin && t < HS.t0) g = 1 - 0.035 * span(t, 14.2, 18.8, 1.0, 1.0); // scene B's extra cow nibbles
  return { season: i + 1, cows: b.n, g, milk: lerp(a.milk, b.milk, f), run: hardin ? 'H' : 'O' };
}

// ---------- timeline ----------
const T = { A: [0, 8.6], B: [8.4, 18.8], C: [18.6, 33.9], D: [33.6, 54.0], E: [53.8, 66] };
const CUES = [
  [0.4, 4.4, 'A pasture that everyone may use. Who looks after it?'],
  [4.6, 8.4, 'In 1968, Garrett Hardin argued it would be *ruined*.'],
  [8.6, 13.4, 'A herder who adds a cow gets ~all~ of that cow’s milk.'],
  [13.6, 18.8, 'But the grass it eats is shared, so the cost is *split among everyone*.'],
  [19.0, 23.4, 'So every herder keeps adding cows, season after season…'],
  [23.6, 28.4, 'Milk per cow falls, yet each extra cow still pays its owner.'],
  [28.6, 33.6, '…until the grass is gone. Hardin called it the *tragedy of the commons*.'],
  [33.8, 38.2, 'But Elinor Ostrom studied how ~real~ commons are run.'],
  [38.4, 43.2, 'One Swiss alpine pasture has been shared by its farmers since ~1517~.'],
  [43.4, 48.6, 'Often the users make ~their own rules~: limits, watchers, fines that fit the offence.'],
  [48.8, 53.6, 'And the pasture stays green, season after season.'],
  [53.8, 58.6, 'In 2009, Ostrom became the first woman to win the economics Nobel.'],
  [58.8, 63.4, 'The tragedy can happen, but it isn’t inevitable: users often avoid it.'],
];

// ---------- layout ----------
const PAS = { cx: 432, cy: 486, rx: 322, ry: 160 };
const FARMS = [[92, 316], [772, 316], [92, 676], [772, 676]];
let seed = 21;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const SPOTS = [];
while (SPOTS.length < 33) {
  const x = PAS.cx + (rnd() * 2 - 1) * PAS.rx * 0.86, y = PAS.cy + (rnd() * 2 - 1) * PAS.ry * 0.78;
  if (((x - PAS.cx) / (PAS.rx * 0.86)) ** 2 + ((y - PAS.cy) / (PAS.ry * 0.8)) ** 2 > 1) continue;
  if (SPOTS.some(([a, b]) => Math.hypot(a - x, b - y) < 46)) continue;
  SPOTS.push([x, y, rnd() * 6.28, rnd() < 0.5 ? -1 : 1]);
}
const DRAW_ORDER = SPOTS.map((_, i) => i).sort((a, b) => SPOTS[a][1] - SPOTS[b][1]); // back to front
// cow i belongs to farm i % 4; the extra cow of scene B (index 4) belongs to the red farm.
const PATCHES = Array.from({ length: 16 }, () => {
  const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 0.8;
  return [PAS.cx + Math.cos(a) * r * PAS.rx, PAS.cy + Math.sin(a) * r * PAS.ry, 30 + rnd() * 50, rnd()];
});
const TUFTS = Array.from({ length: 90 }, () => {
  const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 0.93;
  return [PAS.cx + Math.cos(a) * r * PAS.rx, PAS.cy + Math.sin(a) * r * PAS.ry, rnd()];
});

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, 420);
  lg.addColorStop(0, C.sky); lg.addColorStop(1, C.sky2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // sun and clouds
  g.fillStyle = 'rgba(255,226,140,0.7)'; g.beginPath(); g.arc(610, 150, 46, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.85)';
  for (const [x, y, s] of [[240, 120, 1], [520, 210, 0.8]]) { for (const [dx, dy, r] of [[0, 0, 26], [28, -10, 30], [58, 0, 24], [30, 8, 24]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); g.fill(); } }
  const hill = (base, amp, col, ph, fr) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) g.lineTo(x, base - amp * Math.sin(x / fr + ph));
    g.lineTo(W, H); g.closePath(); g.fill();
  };
  hill(290, 34, C.hill1, 0.6, 140);
  hill(330, 26, C.hill2, 2.4, 110);
  hill(372, 18, C.hill3, 4.1, 90);
  // trees on the hills
  for (const [x, y, s] of [[60, 286, 1], [180, 300, 0.8], [690, 272, 1.1], [820, 300, 0.9], [420, 318, 0.7]]) {
    g.fillStyle = '#5b3a22'; g.fillRect(x - 3 * s, y, 6 * s, 20 * s);
    g.fillStyle = '#3f8a46'; g.beginPath(); g.arc(x, y - 4 * s, 18 * s, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#4f9d52'; g.beginPath(); g.arc(x - 6 * s, y - 10 * s, 10 * s, 0, Math.PI * 2); g.fill();
  }
  // near meadow around the pasture
  g.fillStyle = '#7dbd5d'; g.fillRect(0, 372, W, 420);
  // foreground meadow carrying the captions
  g.fillStyle = C.fg; g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 8) g.lineTo(x, 772 - 10 * Math.sin(x / 70 + 1));
  g.lineTo(W, H); g.closePath(); g.fill();
  g.fillStyle = C.fg2; g.fillRect(0, 940, W, H - 940);
  // blades in the foreground
  g.strokeStyle = 'rgba(160,210,120,0.25)'; g.lineWidth = 2;
  for (let i = 0; i < 120; i++) { const x = rnd() * W, y = 780 + rnd() * 280; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 10); g.stroke(); }
}

// ---------- drawing pieces ----------
const mix = (a, b, u) => a.map((v, i) => Math.round(lerp(v, b[i], u)));
function grassRGB(g) {
  if (g >= 0.5) return mix(C.green, C.lush, (g - 0.5) / 0.5);
  if (g >= 0.25) return mix(C.dry, C.green, (g - 0.25) / 0.25);
  return mix(C.dirt, C.dry, g / 0.25);
}
function pasture(t, g) {
  const [r, gg, b] = grassRGB(g);
  ctx.fillStyle = `rgb(${r},${gg},${b})`;
  ctx.beginPath(); ctx.ellipse(PAS.cx, PAS.cy, PAS.rx, PAS.ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(PAS.cx, PAS.cy, PAS.rx, PAS.ry, 0, 0, Math.PI * 2); ctx.clip();
  // bare patches as the grass goes
  for (const [x, y, s, q] of PATCHES) {
    const a = clamp((0.62 - g) / 0.45 - q * 0.6);
    if (a <= 0) continue;
    ctx.fillStyle = `rgba(${C.dirt.join(',')},${0.9 * a})`;
    ctx.beginPath(); ctx.ellipse(x, y, s * (0.5 + a * 0.5), s * 0.45 * (0.5 + a * 0.5), 0.3, 0, Math.PI * 2); ctx.fill();
  }
  // tufts, fewer as the grass goes
  for (const [x, y, q] of TUFTS) {
    if (q > g * 1.05) continue;
    ctx.strokeStyle = `rgba(70,140,50,0.75)`; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 5, y + 4); ctx.lineTo(x - 7, y - 6); ctx.moveTo(x, y + 4); ctx.lineTo(x, y - 9); ctx.moveTo(x + 5, y + 4); ctx.lineTo(x + 7, y - 6); ctx.stroke();
  }
  ctx.restore();
  // fence
  ctx.strokeStyle = C.fence; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(PAS.cx, PAS.cy, PAS.rx + 8, PAS.ry + 6, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.fence;
  for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2, x = PAS.cx + Math.cos(a) * (PAS.rx + 8), y = PAS.cy + Math.sin(a) * (PAS.ry + 6); ctx.fillRect(x - 3, y - 14, 6, 16); }
}
function farm(i, a = 1, glow = 0) {
  const [x, y] = FARMS[i], col = C.farms[i];
  A(a, () => {
    if (glow > 0) { ctx.fillStyle = `rgba(255,251,232,${0.6 * glow})`; ctx.beginPath(); ctx.arc(x, y - 6, 58, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#f6ead2'; ctx.fillRect(x - 30, y - 18, 60, 40);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - 38, y - 16); ctx.lineTo(x, y - 48); ctx.lineTo(x + 38, y - 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7a4a2a'; ctx.fillRect(x - 8, y + 2, 16, 20);
    ctx.fillStyle = '#9fd0e8'; ctx.fillRect(x + 12, y - 8, 12, 10); ctx.fillRect(x - 24, y - 8, 12, 10);
  });
}
function cow(x, y, s, dir, collar, a = 1, chew = 0) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.ellipse(0, 14, 20, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a3a'; for (const lx of [-12, -6, 7, 13]) ctx.fillRect(lx - 2, 4, 4, 11);
    ctx.fillStyle = '#fdfbf4'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2f2f2f'; ctx.beginPath(); ctx.ellipse(-5, -3, 6, 4, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(8, 3, 4, 3, -0.3, 0, Math.PI * 2); ctx.fill();
    // head (grazing: lowered and bobbing)
    const hy = 2 + chew;
    ctx.fillStyle = '#fdfbf4'; ctx.beginPath(); ctx.ellipse(-20, hy, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2a7a0'; ctx.beginPath(); ctx.ellipse(-25, hy + 2, 4, 3.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = collar; ctx.fillRect(-16, -5 + chew * 0.3, 4, 11);
    ctx.restore();
  });
}
function chip(s, x, y, a, { bgc = C.cream, fg = C.ink, size = 22, family = N, weight = 800 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    font(weight, size, family); const w = ctx.measureText(s).width + 28;
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; k.rrect(x - w / 2 + 2, y - 18, w, 40, 20); ctx.fill();
    ctx.fillStyle = bgc; k.rrect(x - w / 2, y - 20, w, 40, 20); ctx.fill();
    text(s, x, y + 1, { color: fg, align: 'center', base: 'middle' });
  });
}
function hud(t, st, a) {
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = 'rgba(255,251,232,0.92)'; k.rrect(40, 112, 360, 120, 18); ctx.fill();
    ctx.strokeStyle = 'rgba(34,64,42,0.25)'; ctx.lineWidth = 2; k.rrect(40, 112, 360, 120, 18); ctx.stroke();
    font(800, 22, N);
    text(`SEASON ${st.season}`, 62, 142, { color: C.ink, base: 'middle', spacing: '1px' });
    text(`${st.cows} COWS`, 378, 142, { color: C.ink, align: 'right', base: 'middle', spacing: '1px' });
    const bar = (label, y, v, col) => {
      font(700, 20, N); text(label, 62, y, { color: C.inkSoft, base: 'middle' });
      ctx.fillStyle = 'rgba(34,64,42,0.12)'; k.rrect(198, y - 10, 180, 20, 10); ctx.fill();
      ctx.fillStyle = col; k.rrect(198, y - 10, Math.max(8, 180 * clamp(v)), 20, 10); ctx.fill();
    };
    const [r, g, b] = grassRGB(st.g);
    bar('GRASS', 178, st.g, `rgb(${r},${g},${b})`);
    bar('TOTAL MILK', 208, st.milk / MILK_MAX, '#5aa0d8');
  });
}
function header(a) {
  A(a, () => {
    font(700, 22, N); text('RECKON', 48, 72, { color: C.brick, spacing: '3px' });
    const w = ctx.measureText('RECKON').width + 18;
    font(700, 22, N); text('ECONOMICS · A MODEL PASTURE', 48 + w + 16, 72, { color: C.inkSoft, spacing: '2px' });
  });
}

// ---------- the scene ----------
function meadow(t, a) {
  const st = state(t);
  // crossfade the pasture when the Ostrom run starts
  pasture(t, st.g);
  for (let i = 0; i < 4; i++) farm(i, 1, i === 0 ? span(t, 8.8, 13.4, 0.4, 0.4) : 0);
  // cows
  const shown = (i) => {
    const S = st.run === 'H' ? HS : OS;
    if (st.run === 'O' && i >= HERDERS * CAP_EACH) return 0;
    if (st.run === 'H' && t < HS.t0) return i < 4 ? 1 : i === 4 ? back(seg(t, 9.4, 10.0)) * (1 - seg(t, 18.3, 18.8)) : 0;
    const sc = Math.ceil((i + 1) / HERDERS); // the season this cow arrives in
    if (sc <= 1) return 1;
    const at = S.t0 + (sc - 1) * S.dt + (i % 4) * 0.12;
    return back(seg(t, at, at + 0.5));
  };
  const dim = st.run === 'H' ? clamp((0.3 - st.g) / 0.3) * 0.35 : 0;
  for (const idx of DRAW_ORDER) {
    // in scene B the fifth cow is the red farm's extra cow; in the runs cow i is farm i % 4's
    const v = shown(idx);
    if (v <= 0) continue;
    const [x, y, ph, dir] = SPOTS[idx];
    const farmOf = t < HS.t0 && idx === 4 ? 0 : idx % 4;
    const wander = Math.sin(t * 0.4 + ph) * 6;
    cow(x + wander, y, 1.15 * clamp(v, 0, 1.3), dir, C.farms[farmOf], clamp(v) * (1 - dim), Math.max(0, Math.sin(t * 3 + ph * 2)) * 2);
  }
}

function sceneLabels(t) {
  // scene B: the extra cow's milk goes home; the lost grass is shared
  const [cx, cy] = SPOTS[4];
  chip('+1 cow: all its milk is yours', clamp(cx, 230, 634), cy - 46, span(t, 9.8, 13.4, 0.4, 0.4), { bgc: C.farms[0], fg: '#fff' });
  A(span(t, 14.0, 18.8, 0.4, 0.4), () => {
    chip('the grass it eats: shared by all 4', PAS.cx, PAS.cy - 30, 1);
    ctx.strokeStyle = 'rgba(34,64,42,0.7)'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
    const p = eio(seg(t, 14.4, 15.6));
    for (const [fx, fy] of FARMS) {
      const x0 = PAS.cx, y0 = PAS.cy + 4, x1 = lerp(x0, fx, 0.8 * p), y1 = lerp(y0, fy, 0.8 * p);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const [fx, fy] of FARMS) chip('−¼', lerp(PAS.cx, fx, 0.8), lerp(PAS.cy + 4, fy, 0.8), seg(t, 15.4, 15.9), { bgc: C.brick, fg: '#fff', size: 22 });
  });
  // scene C: the tragedy stamp
  A(span(t, 29.6, 33.8, 0.5, 0.4), () => {
    ctx.save(); ctx.translate(PAS.cx, PAS.cy); ctx.rotate(-0.08);
    const s = 0.9 + 0.1 * back(seg(t, 29.6, 30.1));
    ctx.scale(s, s);
    ctx.strokeStyle = C.brick; ctx.lineWidth = 5; k.rrect(-190, -40, 380, 80, 14); ctx.stroke();
    ctx.fillStyle = 'rgba(255,251,232,0.88)'; k.rrect(-186, -36, 372, 72, 12); ctx.fill();
    font(700, 34); text('THE TRAGEDY', 0, 2, { color: C.brick, align: 'center', base: 'middle', spacing: '3px' });
    ctx.restore();
  });
  // scene D: places from Ostrom's book
  const placesA = span(t, 34.6, 43.2, 0.5, 0.5);
  if (placesA > 0) A(placesA, () => {
    const P = [['Switzerland', 'mountain villages'], ['Japan', 'mountain villages'], ['Spain', 'irrigation'], ['Philippines', 'irrigation'], ['Nova Scotia', 'fisheries'], ['Indonesia', 'fisheries']];
    ctx.fillStyle = 'rgba(255,251,232,0.94)'; k.rrect(52, 386, 760, 200, 20); ctx.fill();
    font(700, 22, N); text('Commons in her book, Governing the Commons', PAS.cx, 414, { color: C.inkSoft, align: 'center', base: 'middle' });
    P.forEach(([a, b], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 240 + col * 340, y = 456 + row * 42;
      const on = eout(seg(t, 35.0 + i * 0.25, 35.5 + i * 0.25));
      const swiss = 0;
      A(on * (1 - 0.55 * seg(t, 38.4, 38.9)), () => {
        if (swiss > 0) { ctx.fillStyle = `rgba(214,245,160,${swiss})`; k.rrect(x - 140, y - 18, 330, 36, 18); ctx.fill(); }
        font(800, 22, N); text(a, x - 8, y, { color: C.ink, align: 'right', base: 'middle' });
        font(600, 22, N); text(b, x + 8, y, { color: C.inkSoft, align: 'left', base: 'middle' });
      });
    });
  });
  A(span(t, 38.6, 43.2, 0.4, 0.4), () => chip('a Swiss alpine common: shared since 1517', 432, 360, 1, { bgc: C.ink, fg: C.lime }));
  // the herders' own rules
  A(span(t, 43.6, 54.0, 0.5, 0.4), () => {
    const x = 470, y = 112, w = 350, h = 120;
    ctx.fillStyle = '#c98e57'; k.rrect(x, y, w, h, 12); ctx.fill();
    ctx.strokeStyle = '#8a5a33'; ctx.lineWidth = 4; k.rrect(x, y, w, h, 12); ctx.stroke();
    font(700, 24); text('OUR RULES', x + w / 2, y + 26, { color: '#3a210f', align: 'center', base: 'middle', spacing: '2px' });
    font(700, 21, N);
    const lines = [`${CAP_EACH} cows per farm`, 'we take turns watching', 'fines that fit the offence'];
    lines.forEach((s, i) => A(seg(t, 44.0 + i * 0.5, 44.4 + i * 0.5), () => text(s, x + w / 2, y + 56 + i * 24, { color: '#3a210f', align: 'center', base: 'middle' })));
  });
}

function sceneE(t) {
  A(span(t, 54.0, 66.0, 0.5, 0), () => {
    ctx.fillStyle = 'rgba(255,251,232,0.94)'; k.rrect(92, 120, 680, 620, 26); ctx.fill();
    ctx.strokeStyle = 'rgba(34,64,42,0.25)'; ctx.lineWidth = 2; k.rrect(92, 120, 680, 620, 26); ctx.stroke();
    // a medal
    const m = back(seg(t, 54.2, 54.9));
    ctx.save(); ctx.translate(432, 260); ctx.scale(m, m);
    ctx.fillStyle = C.farms[1]; ctx.beginPath(); ctx.moveTo(-34, -90); ctx.lineTo(-8, -20); ctx.lineTo(8, -20); ctx.lineTo(-18, -90); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.farms[0]; ctx.beginPath(); ctx.moveTo(34, -90); ctx.lineTo(8, -20); ctx.lineTo(-8, -20); ctx.lineTo(18, -90); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8b33a'; ctx.beginPath(); ctx.arc(0, 20, 52, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f6d27a'; ctx.beginPath(); ctx.arc(0, 20, 40, 0, Math.PI * 2); ctx.fill();
    font(700, 30); text('2009', 0, 22, { color: '#7a5212', align: 'center', base: 'middle' });
    ctx.restore();
    font(700, 44); text('Elinor Ostrom', 432, 392, { color: C.ink, align: 'center', base: 'middle' });
    font(600, 26, N); text('Nobel Memorial Prize in Economic Sciences', 432, 440, { color: C.inkSoft, align: 'center', base: 'middle' });
    A(seg(t, 63.6, 64.4), () => {
      ctx.strokeStyle = 'rgba(34,64,42,0.2)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(170, 500); ctx.lineTo(694, 500); ctx.stroke();
      font(600, 26, N);
      text('Hardin later said he should have', 432, 548, { color: C.ink, align: 'center', base: 'middle' });
      text('called his essay', 432, 584, { color: C.ink, align: 'center', base: 'middle' });
      font(700, 34); text('“The Tragedy of the', 432, 636, { color: C.brick, align: 'center', base: 'middle' });
      text('Unregulated Commons”', 432, 680, { color: C.brick, align: 'center', base: 'middle' });
    });
  });
  A(seg(t, 63.6, 64.4), () => {
    font(600, 21, N);
    text('Source: Wikipedia, “Tragedy of the commons”, “Elinor Ostrom”', W / 2, 860, { color: 'rgba(255,251,232,0.75)', align: 'center', base: 'middle' });
    text('Pasture numbers: a simple teaching model', W / 2, 890, { color: 'rgba(255,251,232,0.75)', align: 'center', base: 'middle' });
  });
}

function draw(t) {
  if (!bg) paintBg();
  ctx.drawImage(bg, 0, 0);
  header(eout(seg(t, 0.1, 1.0)));
  // the meadow: a quick crossfade when the Ostrom run starts afresh
  const swap = span(t, 33.5, 34.3, 0.4, 0.4);
  A(1 - 0.8 * swap, () => meadow(t, 1));
  sceneLabels(t);
  hud(t, state(t), Math.max(span(t, 18.9, 33.8, 0.5, 0.5), span(t, 43.6, 54.0, 0.5, 0.4)));
  sceneE(t);
  captions(t);
}

// Captions with balanced lines.
const CAP = { size: 44, lh: 56, weight: 600, maxW: 760 };
const capW = new Map();
function balanced(s) {
  if (capW.has(s)) return capW.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (m) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > m && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capW.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 852, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: F, ink: C.cream, marks: { '*': C.warm, '~': C.lime } });
  }
}

Kit.scene({
  width: W, height: H, duration: 66,
  fonts: [
    { family: F, file: 'Fredoka.woff2', weight: '300 700' },
    { family: N, file: 'Nunito.woff2', weight: '200 1000' },
  ],
  draw(t, tools) { k = tools; ctx = tools.ctx; draw(t); },
});
