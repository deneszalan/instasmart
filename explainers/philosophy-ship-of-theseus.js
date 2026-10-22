// Explainer for philosophy-ship-of-theseus: replace every plank, then rebuild the old ones: two ships.
// Look: a Greek galley in profile on Aegean blue, warm honey wood against weathered grey-brown, a stone
// quay where the old planks pile up, harbour water below for the captions. Alegreya for captions,
// Alegreya Sans for labels.
//
// Scene plan (62 s). Captions centred at y = 846 on the harbour water; everything above y = 930.
//  A  0.0–11.0  The ship rows in: thirty oars (fifteen on this side), a square sail, an eye on the bow.
//               "Plutarch tells of the thirty-oared ship of the hero Theseus, kept by the Athenians." /
//               "As its old planks decayed, they put in new, strong timber."
//  B  8.6–27.4  The 38 hull planks are replaced one by one (faster and faster); each old plank slides
//               out onto a pile on the quay. "Imagine it goes on until none of the old wood is left." /
//               "Was it still the same ship? Plutarch says philosophers took both sides." / Hobbes, 1655.
//  C 27.4–38.8  Hobbes's twist: the old planks fly back together, in the same order, into a second ship
//               on the quay. "Now there are two ships. Which one is the ship of Theseus?"
//  D 38.8–62.0  Form or matter: labels on each ship; Hobbes: two ships the same would be absurd; the
//               question still drives debates about identity, personal identity included.
//
// Facts (Wikipedia, "Ship of Theseus"): Plutarch, Life of Theseus 23.1: the ship in which Theseus returned
// from Crete had thirty oars and was preserved by the Athenians down to the time of Demetrius Phalereus;
// they took away the old planks as they decayed, putting in new and strong timber; philosophers disputed
// it, "one side holding that the ship remained the same, and the other contending that it was not the
// same". Thomas Hobbes, De Corpore (1655): if someone kept the old planks and put them together again in
// the same order, there would be "two Ships Numerically the same, which is absurd"; the two ships
// illustrate identity by form (persisting through complete replacement) and by matter. The thought
// experiment is used in debates about identity over time and personal identity.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const SERIF = 'Alegreya', SANS = 'AlegreyaSans';

const C = {
  text: '#FFF8EC', textSoft: 'rgba(255,248,236,0.76)', gold: '#FFC872', sky: '#8FD3FF',
  ink: '#3A2614', rope: '#6B4E33', pitch: '#2B211A', bronze: '#B9853C', sail: '#F1E4C8', sailStripe: '#B5492F',
};

const CUES = [
  [0.5, 6.0, 'Plutarch tells of the thirty-oared ship of the mythical king *Theseus*, kept by the Athenians.'],
  [6.2, 11.0, 'As its old planks decayed, they put in new, strong timber.'],
  [11.2, 16.6, 'Imagine it goes on until none of the old wood is left.'],
  [16.8, 22.2, 'Was it still the same ship? Plutarch says philosophers took both sides.'],
  [22.4, 27.4, 'Then, in 1655, the philosopher *Thomas Hobbes* added a twist.'],
  [27.6, 33.2, 'Suppose someone kept every old plank and, in the same order, rebuilt a ship.'],
  [33.4, 38.8, 'Now there are *two* ships. Which one is the ship of Theseus?'],
  [39.0, 44.4, 'If what counts is its ~form~, it’s the repaired ship at sea.'],
  [44.6, 49.8, 'If what counts is its *matter*, it’s the one built from the old wood.'],
  [50.0, 55.4, 'Both at once, Hobbes wrote, would make two ships *the same*, which is absurd.'],
  [55.6, 61.6, 'Philosophers still use it to ask what keeps anything, even a person, the same.'],
];

let k, ctx;
const font = (weight, size, family = SERIF) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.text, ...opts });
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the hull: strakes and planks in unit space (u from stern 0 to bow 1, y in px at L = 600) ----------
const L = 600;
const smooth = (a, b, x) => { const s = clamp((x - a) / (b - a)); return s * s * (3 - 2 * s); };
const gun = (u) => -(50 + 34 * smooth(0.2, 0.0, u) + 16 * smooth(0.82, 1.0, u)); // gunwale, above the waterline
const keel = (u) => 40 * Math.pow(Math.sin(Math.PI * clamp((u - 0.03) / 0.94)), 0.65); // below the waterline
const BANDS = [0, 0.26, 0.5, 0.75, 1];
const U0 = 0.035, U1 = 0.975, PER = 9;
const PLANKS = [];
for (let b = 0; b < 4; b++) {
  const off = (b % 2) * 0.5, step = (U1 - U0) / PER;
  const cuts = [U0];
  for (let j = 1 - off; j < PER; j += 1) cuts.push(U0 + j * step);
  cuts.push(U1);
  for (let j = 0; j + 1 < cuts.length; j++) if (cuts[j + 1] - cuts[j] > 0.01) PLANKS.push({ band: b, a: cuts[j], b: cuts[j + 1] });
}
const NP = PLANKS.length; // 38
const yAt = (u, f) => lerp(gun(u), keel(u), f);
const SAMPLES = 8;
/** Polygon of plank i in unit space: 2 * SAMPLES points (top edge, then bottom edge back). */
function plankUnit(p) {
  const pts = [];
  for (let s = 0; s < SAMPLES; s++) { const u = lerp(p.a, p.b, s / (SAMPLES - 1)); pts.push([u * L, yAt(u, BANDS[p.band]) + 0.6]); }
  for (let s = SAMPLES - 1; s >= 0; s--) { const u = lerp(p.a, p.b, s / (SAMPLES - 1)); pts.push([u * L, yAt(u, BANDS[p.band + 1]) - 0.6]); }
  return pts;
}
const PLANK_UNIT = PLANKS.map(plankUnit);
// plank colours: weathered old wood and fresh new wood, each plank a little different
const rnd = mulberry32(17);
PLANKS.forEach((p) => { p.old = [120 + rnd() * 22, 104 + rnd() * 18, 86 + rnd() * 14]; p.fresh = [214 + rnd() * 20, 156 + rnd() * 18, 88 + rnd() * 16]; p.grain = rnd(); });
// the order of replacement (and of rebuilding): a fixed shuffle
const ORDER = PLANKS.map((_, i) => i);
{ const r = mulberry32(5); for (let i = ORDER.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ORDER[i], ORDER[j]] = [ORDER[j], ORDER[i]]; } }
const RANK = []; ORDER.forEach((p, n) => { RANK[p] = n; });
const REPLACE_AT = (n) => 8.8 + 14.6 * Math.pow(n / (NP - 1), 0.7);
const REBUILD_AT = (n) => 28.2 + 8.0 * (n / (NP - 1));

// ---------- placement ----------
const SHIP_A = { x: 132, y: 420, s: 1 }; // stern x, waterline y, scale
const SHIP_B = { x: 132, y: 646, s: 1 };
const place = (pts, P, bob = 0, tilt = 0) => pts.map(([x, y]) => [P.x + x * P.s, P.y + (y + Math.sin(tilt) * (x - L / 2) * 0.02) * P.s + bob]);
// pile slots on the quay, a pyramid of planks lying flat
const PILE = [];
{ const rows = [8, 7, 7, 6, 5, 3, 2]; let n = 0; rows.forEach((cnt, r) => { for (let i = 0; i < cnt && n < NP; i++, n++) PILE.push([430 + (i - (cnt - 1) / 2) * 80, 712 - r * 12]); }); }
function pilePoly(slot) {
  const [cx, cy] = PILE[slot], pts = [];
  for (let s = 0; s < SAMPLES; s++) pts.push([cx - 38 + (76 * s) / (SAMPLES - 1), cy - 5]);
  for (let s = SAMPLES - 1; s >= 0; s--) pts.push([cx - 38 + (76 * s) / (SAMPLES - 1), cy + 5]);
  return pts;
}
const mixPts = (a, b, x, lift = 0) => a.map((p, i) => [lerp(p[0], b[i][0], x), lerp(p[1], b[i][1], x) - Math.sin(Math.PI * x) * lift]);

// ---------- scenery ----------
let BG = null;
function paintScene() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#E9D3AE'); sky.addColorStop(0.6, '#EFDDBE'); sky.addColorStop(1, '#BCD6E2');
  g.fillStyle = sky; g.fillRect(0, 0, W, 262);
  const sun = g.createRadialGradient(650, 170, 10, 650, 170, 260);
  sun.addColorStop(0, 'rgba(255,246,220,0.9)'); sun.addColorStop(0.15, 'rgba(255,236,200,0.5)'); sun.addColorStop(1, 'rgba(255,236,200,0)');
  g.fillStyle = sun; g.fillRect(0, 0, W, 262);
  // distant island
  g.fillStyle = 'rgba(120,140,150,0.55)';
  g.beginPath(); g.moveTo(0, 262); g.bezierCurveTo(60, 236, 150, 226, 240, 244); g.bezierCurveTo(290, 252, 330, 256, 360, 262); g.closePath(); g.fill();
  const sea = g.createLinearGradient(0, 260, 0, 560);
  sea.addColorStop(0, '#5FA3C9'); sea.addColorStop(0.25, '#2C7DB5'); sea.addColorStop(1, '#165A8D');
  g.fillStyle = sea; g.fillRect(0, 260, W, 300);
  // quay: warm stone blocks
  const qy = 556, qh = 172;
  const qg = g.createLinearGradient(0, qy, 0, qy + qh);
  qg.addColorStop(0, '#DDBF92'); qg.addColorStop(1, '#B8946A');
  g.fillStyle = qg; g.fillRect(0, qy, W, qh);
  g.fillStyle = 'rgba(255,240,215,0.5)'; g.fillRect(0, qy, W, 5);
  const r = mulberry32(3);
  g.strokeStyle = 'rgba(110,80,50,0.35)'; g.lineWidth = 2;
  for (let row = 0; row < 4; row++) {
    const y = qy + 14 + row * 40; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    for (let x = (row % 2) * 60 + r() * 30; x < W; x += 110 + r() * 40) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 40); g.stroke(); }
  }
  g.fillStyle = 'rgba(60,40,20,0.30)'; g.fillRect(0, qy + qh - 10, W, 10);
  // harbour water below
  const hw = g.createLinearGradient(0, qy + qh, 0, H);
  hw.addColorStop(0, '#0F4774'); hw.addColorStop(1, '#082A48');
  g.fillStyle = hw; g.fillRect(0, qy + qh, W, H - qy - qh);
  const img = g.getImageData(0, 0, W, H), d = img.data; const rr = mulberry32(9);
  for (let p = 0; p < d.length; p += 4) { const n = (rr() - 0.5) * 8; d[p] += n; d[p + 1] += n; d[p + 2] += n; }
  g.putImageData(img, 0, 0);
  return c;
}
function waves(t) {
  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const y = 278 + i * 18 + (i % 3) * 3, a = 0.10 + 0.012 * i;
    ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 1.6 + i * 0.08;
    ctx.beginPath();
    for (let x = -20; x <= W + 20; x += 12) {
      const yy = y + Math.sin(x * 0.03 + t * (0.9 + i * 0.05) + i * 1.7) * (1.5 + i * 0.15);
      x === -20 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.setLineDash([22 + i * 3, 30 + i * 2]); ctx.lineDashOffset = -t * (8 + i) - i * 40; ctx.stroke();
  }
  ctx.setLineDash([]);
  for (let i = 0; i < 9; i++) { // ripples on the harbour water, low and dim
    const y = 742 + i * 34;
    ctx.strokeStyle = `rgba(160,210,240,${0.05 + 0.01 * i})`; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -20; x <= W + 20; x += 14) { const yy = y + Math.sin(x * 0.022 + t * 0.7 + i) * 3; x === -20 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
    ctx.setLineDash([40, 50]); ctx.lineDashOffset = t * 6 + i * 30; ctx.stroke();
  }
  ctx.setLineDash([]);
}

// ---------- drawing the ship ----------
function polyPath(pts) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
function plankFill(pts, rgbv, p, light = 1) {
  polyPath(pts);
  const [r, g, b] = rgbv.map((v) => Math.min(255, v * light));
  ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`; ctx.fill();
  ctx.strokeStyle = 'rgba(40,25,12,0.75)'; ctx.lineWidth = 1.6; ctx.stroke();
  // two grain lines
  const n = pts.length / 2;
  ctx.strokeStyle = `rgba(60,35,15,${0.18 + 0.1 * p.grain})`; ctx.lineWidth = 1;
  for (const f of [0.35 + 0.1 * p.grain, 0.7]) {
    ctx.beginPath();
    for (let s = 0; s < n; s++) { const top = pts[s], bot = pts[2 * n - 1 - s]; const x = lerp(top[0], bot[0], f), y = lerp(top[1], bot[1], f); s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  }
}
/** Hull silhouette (the pitch-dark backing behind the planks, the stern post and bow). */
function hullBack(P, bob) {
  const pts = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([u * L, gun(u) - 2]); }
  for (let i = 40; i >= 0; i--) { const u = i / 40; pts.push([u * L, keel(u) + 2]); }
  ctx.fillStyle = C.pitch; polyPath(place(pts, P, bob)); ctx.fill();
}
function shipFurniture(P, bob, t, rowing, mast, oars = 1) {
  const X = (u) => P.x + u * L * P.s, Y = (y) => P.y + y * P.s + bob;
  // stern post curling up (aphlaston) and bow post
  ctx.strokeStyle = C.pitch; ctx.lineWidth = 14 * P.s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(X(0.02), Y(gun(0.02))); ctx.bezierCurveTo(X(-0.03), Y(-112), X(-0.02), Y(-150), X(0.035), Y(-152)); ctx.stroke();
  ctx.lineWidth = 9 * P.s; ctx.beginPath(); ctx.moveTo(X(0.035), Y(-152)); ctx.quadraticCurveTo(X(0.06), Y(-146), X(0.05), Y(-132)); ctx.stroke();
  ctx.lineWidth = 11 * P.s; ctx.beginPath(); ctx.moveTo(X(0.975), Y(gun(0.975))); ctx.quadraticCurveTo(X(1.0), Y(-80), X(0.985), Y(-92)); ctx.stroke();
  // ram
  ctx.fillStyle = C.bronze;
  ctx.beginPath(); ctx.moveTo(X(0.955), Y(-2)); ctx.lineTo(X(1.075), Y(10)); ctx.lineTo(X(0.955), Y(22)); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(70,40,10,0.6)'; ctx.lineWidth = 2; ctx.stroke();
  // rail
  ctx.strokeStyle = '#5A3B22'; ctx.lineWidth = 6 * P.s; ctx.lineCap = 'round';
  ctx.beginPath(); for (let i = 0; i <= 30; i++) { const u = 0.03 + (i / 30) * 0.94; i ? ctx.lineTo(X(u), Y(gun(u) - 3)) : ctx.moveTo(X(u), Y(gun(u) - 3)); } ctx.stroke();
  // the eye on the bow
  const ex = X(0.9), ey = Y(-30);
  ctx.fillStyle = '#F4EBDD'; ctx.beginPath(); ctx.ellipse(ex, ey, 15 * P.s, 8 * P.s, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = C.pitch; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = C.pitch; ctx.beginPath(); ctx.arc(ex + 2, ey, 5 * P.s, 0, 7); ctx.fill();
  // fifteen oars on this side, sweeping together
  if (rowing !== null && oars > 0) k.alpha(oars, () => {
    for (let i = 0; i < 15; i++) {
      const u = 0.2 + (i / 14) * 0.62, px = X(u), py = Y(gun(u) + 12);
      const ph = rowing;
      const ang = 0.35 + 0.32 * Math.sin(ph), dip = Math.max(0, Math.sin(ph + 1.2));
      const len = 128 * P.s, bx = px - Math.sin(ang) * len, by = py + Math.cos(ang) * len * 0.82 + dip * 6;
      ctx.strokeStyle = '#8A5E36'; ctx.lineWidth = 3 * P.s; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
      ctx.fillStyle = '#7A5230'; ctx.beginPath(); ctx.ellipse(bx + Math.sin(ang) * 10, by - 8, 4 * P.s, 13 * P.s, ang, 0, 7); ctx.fill();
      ctx.fillStyle = C.pitch; ctx.beginPath(); ctx.arc(px, py, 4.5 * P.s, 0, 7); ctx.fill();
    }
  });
  if (!mast) return;
  // mast, yard and square sail
  const mx = X(0.52), top = Y(-300), yardY = Y(-282);
  ctx.strokeStyle = '#6E4A2A'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(mx, Y(gun(0.52))); ctx.lineTo(mx, top); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(mx - 128, yardY + 4); ctx.quadraticCurveTo(mx, yardY - 10, mx + 128, yardY + 4); ctx.stroke();
  const billow = 10 + 4 * Math.sin(t * 0.8);
  ctx.fillStyle = C.sail;
  ctx.beginPath(); ctx.moveTo(mx - 124, yardY + 6); ctx.quadraticCurveTo(mx, yardY - 6, mx + 124, yardY + 6);
  ctx.quadraticCurveTo(mx + 130 + billow, yardY + 80, mx + 116, yardY + 160); ctx.quadraticCurveTo(mx, yardY + 172 + billow, mx - 116, yardY + 160);
  ctx.quadraticCurveTo(mx - 130 - billow * 0.5, yardY + 80, mx - 124, yardY + 6); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = C.sailStripe; for (const dx of [-62, 52]) ctx.fillRect(mx + dx, yardY - 10, 14, 200);
  const sh = ctx.createLinearGradient(mx - 124, 0, mx + 124, 0); sh.addColorStop(0, 'rgba(120,90,50,0.22)'); sh.addColorStop(0.6, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(120,90,50,0.15)');
  ctx.fillStyle = sh; ctx.fillRect(mx - 140, yardY - 20, 280, 200); ctx.restore();
  ctx.strokeStyle = 'rgba(90,60,35,0.55)'; ctx.lineWidth = 2; // stays
  ctx.beginPath(); ctx.moveTo(mx, top); ctx.lineTo(X(0.04), Y(-140)); ctx.moveTo(mx, top); ctx.lineTo(X(0.97), Y(-90)); ctx.stroke();
}

// ---------- the story's state ----------
function shipA(t) {
  const bob = Math.sin(t * 1.1) * 3, enter = eout(seg(t, 0, 2.4));
  const P = { ...SHIP_A, x: SHIP_A.x + (1 - enter) * -90 };
  const rowing = t * 2.2;
  // water shadow under the ship
  ctx.fillStyle = 'rgba(10,40,70,0.25)'; ctx.beginPath(); ctx.ellipse(P.x + L / 2, P.y + 36, L * 0.52, 14, 0, 0, 7); ctx.fill();
  hullBack(P, bob);
  PLANKS.forEach((p, i) => {
    const n = RANK[i], at = REPLACE_AT(n);
    const base = place(PLANK_UNIT[i], P, bob);
    // the old plank stays until it is taken out at `at`; the new one grows in just after
    if (t < at + 0.05) plankFill(base, p.old, p);
    const g = eout(seg(t, at + 0.25, at + 0.75));
    if (g > 0) {
      const cy = base.reduce((s, q) => s + q[1], 0) / base.length;
      k.alpha(g, () => plankFill(base.map(([x, y]) => [x, cy + (y - cy) * lerp(0.4, 1, g)]), p.fresh, p, 1 + 0.25 * (1 - seg(t, at + 0.75, at + 2.0))));
    }
  });
  shipFurniture(P, bob, t, rowing, true, 1 - seg(t, 7.6, 8.6));
  // the waterline: a strip of sea in front of the hull bottom
  ctx.fillStyle = 'rgba(22,90,141,0.78)';
  ctx.beginPath(); ctx.moveTo(P.x - 40, P.y + 8 + bob * 0.3);
  for (let x = P.x - 40; x <= P.x + L + 70; x += 12) ctx.lineTo(x, P.y + 8 + Math.sin(x * 0.05 + t * 2) * 2.5);
  ctx.lineTo(P.x + L + 70, P.y + 70); ctx.lineTo(P.x - 40, P.y + 70); ctx.closePath(); ctx.fill();
  return { P, bob };
}
/** Old planks: in flight from ship A to the pile, on the pile, then in flight to ship B, then in ship B. */
function oldPlanks(t, A) {
  const B = SHIP_B;
  const stocks = eout(seg(t, 27.6, 28.4));
  if (stocks > 0) k.alpha(stocks, () => { // building stocks on the quay for ship B
    ctx.fillStyle = '#6A4A2C';
    for (const u of [0.18, 0.4, 0.62, 0.84]) { const x = B.x + u * L; ctx.fillRect(x - 14, B.y + keel(u) + 2, 28, 724 - (B.y + keel(u) + 2)); }
  });
  const builtAll = seg(t, REBUILD_AT(NP - 1) + 0.9, REBUILD_AT(NP - 1) + 1.6);
  if (builtAll > 0) k.alpha(builtAll, () => hullBack(B, 0));
  // draw pile planks bottom-up (slot order), then flying ones on top
  const flying = [];
  for (let slot = 0; slot < NP; slot++) {
    const i = ORDER[slot], p = PLANKS[i], at = REPLACE_AT(slot), rb = REBUILD_AT(slot);
    if (t < at) continue;
    const fromHull = place(PLANK_UNIT[i], A.P, A.bob), pile = pilePoly(slot), inB = place(PLANK_UNIT[i], B);
    const x1 = eio(seg(t, at, at + 0.9)), x2 = eio(seg(t, rb, rb + 0.9));
    if (x1 < 1) flying.push(() => plankFill(mixPts(fromHull, pile, x1, 60), p.old, p));
    else if (x2 <= 0) plankFill(pile, p.old, p, 0.95);
    else if (x2 < 1) flying.push(() => plankFill(mixPts(pile, inB, x2, 70), p.old, p));
    else plankFill(inB, p.old, p);
  }
  for (const f of flying) f();
  if (builtAll > 0) k.alpha(builtAll, () => shipFurniture(B, 0, t, null, false));
}

function counter(t) {
  const a = span(t, 8.8, 27.0, 0.5, 0.5);
  if (a <= 0) return;
  let n = 0; for (let s = 0; s < NP; s++) if (t >= REPLACE_AT(s) + 0.4) n++;
  k.alpha(a, () => {
    font(700, 26, SANS); text('NEW PLANKS', 60, 148, { color: C.ink, spacing: '2px' });
    font(800, 54, SERIF); text(`${n}`, 60, 204, { color: C.ink }); const w = ctx.measureText(`${n}`).width;
    font(500, 30, SERIF); text(`of ${NP}`, 60 + w + 10, 204, { color: 'rgba(58,38,20,0.72)' });
  });
}
function tags(t) {
  const fa = span(t, 39.2, 62, 0.5, 0.01), mb = span(t, 44.8, 62, 0.5, 0.01);
  const tag = (s, sub, x, y, a, col) => k.alpha(a, () => {
    font(800, 26, SANS); const w = Math.max(ctx.measureText(s).width, (font(500, 24, SANS), ctx.measureText(sub).width)) + 36;
    ctx.fillStyle = 'rgba(20,30,40,0.72)'; k.rrect(x - w / 2, y - 34, w, 70, 14); ctx.fill();
    font(800, 26, SANS); text(s, x, y - 6, { align: 'center', color: col, spacing: '2px' });
    font(500, 24, SANS); text(sub, x, y + 24, { align: 'center', color: C.text });
  });
  if (fa > 0) tag('FORM', 'all new wood, same ship shape', 432, 512, fa, C.sky);
  if (mb > 0) tag('MATTER', 'the original planks, rebuilt', 432, 758, mb, C.gold);
  const q = span(t, 33.8, 38.8, 0.4, 0.4);
  if (q > 0) k.alpha(q, () => { font(800, 64, SERIF); text('?', 824, 400, { align: 'center', color: C.ink }); text('?', 824, 650, { align: 'center', color: C.ink }); });
}

// ---------- captions with balanced lines ----------
const CAP = { size: 44, lh: 56, weight: 700, maxW: 740 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((x) => ctx.measureText(x.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const x of words) { if (lw + x > maxW && any) { n++; lw = 0; } lw += x + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 862, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SERIF, ink: C.text, marks: { '*': C.gold, '~': C.sky } });
  }
}

Kit.scene({
  width: W, height: H, duration: 62,
  fonts: [
    { family: SERIF, file: 'Alegreya.woff2', weight: '400 900' },
    { family: SANS, file: 'AlegreyaSans-Medium.woff2', weight: '500' },
    { family: SANS, file: 'AlegreyaSans-ExtraBold.woff2', weight: '800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) BG = paintScene();
    ctx.drawImage(BG, 0, 0);
    waves(t);
    font(800, 22, SANS); text('RECKON · PHILOSOPHY', 60, 80, { color: 'rgba(58,38,20,0.78)', spacing: '3px' });
    const A = shipA(t);
    oldPlanks(t, A);
    counter(t);
    tags(t);
    captions(t);
  },
});
