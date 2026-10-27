// Explainer for math-monty-hall: switching doors wins the car 2 games in 3.
// Look: a TV game-show stage. Aubergine velvet with spotlight pools, gold-framed cherry doors,
// a row of chasing marquee bulbs, Bungee for display and numbers, Barlow for captions.
//
// Scene plan (54 s). Everything important sits above y = 930; captions are centred at y = 830.
//  A  0.0–18.6  Hook. Three doors rise. "Three doors. Behind one, a car…" / "You pick door 1." /
//               the host opens door 3: a goat / "Stay with door 1, or switch to door 2?" /
//               "Most people say it doesn't matter: 50/50."
//  B 18.3–34.4  Demonstration. 300 games, simulated below with a fixed seed (4). Games 1–3 play
//               out slowly on small doors (car hidden, pick, the host opens a goat door, reveal);
//               then fast-forward to game 300 by 30.6 s. Every game drops one tile into the STAY
//               or SWITCH bar, whichever choice would have won: 98 and 202, i.e. 33% and 67%.
//  C 34.1–49.0  Why. Your pick holds 1/3; the other two doors together hold 2/3. The host opens
//               the goat among those two, so the whole 2/3 slides onto door 2.
//  D 48.7–54.0  Payoff card on a marquee sign: "SWITCH!", wins 2 games in 3, the host-knows
//               caveat and the source.
//
// Facts (Wikipedia, "Monty Hall problem"): one car and two goats behind three doors; the host
// knows where the car is, always opens another door with a goat, and offers the switch; switching
// wins with probability 2/3, staying 1/3; the first pick is right 1 time in 3; "most people
// conclude that switching does not matter" (50/50). The 300-game tally is computed here.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bgIn: '#3D1247', bgMid: '#22092A', bgOut: '#110316', gold: '#F4C152', goldDeep: '#B87E26', goldLight: '#FFE6A0',
  cherry: '#D9283A', cherryDeep: '#8F0F22', cherryText: '#FF6E78', cream: '#FFF3DD', creamSoft: 'rgba(255,243,221,0.74)',
  inside: '#0D0310', ink: '#2A0B30',
};
const DISPLAY = 'Bungee', TEXT = 'Barlow';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.cream, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- the simulation: 300 games with a fixed seed ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const GAMES = [];
{
  const rnd = mulberry32(4);
  for (let i = 0; i < 300; i++) {
    const car = Math.floor(rnd() * 3), pick = Math.floor(rnd() * 3);
    // The host opens a door that is neither your pick nor the car; with two goats left, he picks one at random.
    const choices = [0, 1, 2].filter((d) => d !== pick && d !== car);
    const open = choices[Math.floor(rnd() * choices.length)];
    const other = 3 - pick - open; // the door you would switch to
    GAMES.push({ car, pick, open, other, stay: pick === car });
  }
  let s = 0, w = 0;
  for (const g of GAMES) g.slot = g.stay ? s++ : w++;
}
const N_STAY = GAMES.filter((g) => g.stay).length, N_SWITCH = GAMES.length - N_STAY;
const PCT_STAY = Math.round((100 * N_STAY) / GAMES.length), PCT_SWITCH = 100 - PCT_STAY;

// When each game's result is known (its tile is launched), and how long a tile flies.
const SLOW = [19.2, 21.6, 24.0], SLOW_LEN = 2.4, SLOW_RES = 1.6;
const FAST_A = 26.7, FAST_D = 3.9;
const RES = GAMES.map((g, i) => (i < 3 ? SLOW[i] + SLOW_RES : FAST_A + FAST_D * Math.sqrt((i - 2) / (GAMES.length - 3))));
const FLY = GAMES.map((g, i) => (i < 3 ? 0.55 : 0.36));

// ---------- timeline ----------
const T = { A: [0, 18.6], B: [18.3, 34.4], C: [34.1, 49.0], D: [48.7, 54.0] };
const CUES = [
  [0.4, 4.5, 'Three doors. Behind one, a ~car~. Behind the others, goats.'],
  [4.6, 6.9, 'You pick *door 1*.'],
  [7.0, 11.7, 'The game-show host, who knows where the car is, opens a goat door.'],
  [11.8, 15.3, '*Stay* with door 1, or ~switch~ to door 2?'],
  [15.4, 18.5, 'Most people say it doesn’t matter: *50/50*.'],
  [18.7, 22.0, 'Let’s play ~300 games~ and keep score.'],
  [22.1, 26.5, 'Each game: hide the car, pick a door, open a goat door.'],
  [26.6, 30.7, 'Then faster. In every game, either *staying* or ~switching~ wins.'],
  [30.8, 34.5, `After 300 games: ~switch~ won ${N_SWITCH}, *stay* won ${N_STAY}.`],
  [34.6, 38.7, 'Why? Your first pick is right only *1 time in 3*.'],
  [38.8, 43.7, 'So ~2 times in 3~, the car is behind one of the other two.'],
  [43.8, 48.9, 'The host opens the goat one, so that ~2 in 3~ now sits on door 2.'],
];

// ---------- static background, painted once ----------
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 380, 40, W / 2, 420, 820);
  rad.addColorStop(0, C.bgIn); rad.addColorStop(0.5, C.bgMid); rad.addColorStop(1, C.bgOut);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  // velvet folds
  for (let i = 0; i < 18; i++) {
    const x = i * 48;
    const lg = g.createLinearGradient(x, 0, x + 48, 0);
    lg.addColorStop(0, 'rgba(0,0,0,0.10)'); lg.addColorStop(0.45, 'rgba(255,190,240,0.045)'); lg.addColorStop(1, 'rgba(0,0,0,0.10)');
    g.fillStyle = lg; g.fillRect(x, 0, 48, 560);
  }
  // stage floor with perspective boards
  const floorY = 548;
  const fg = g.createLinearGradient(0, floorY, 0, H);
  fg.addColorStop(0, '#2A0B30'); fg.addColorStop(0.35, '#1A0620'); fg.addColorStop(1, '#0C0210');
  g.fillStyle = fg; g.fillRect(0, floorY, W, H - floorY);
  g.strokeStyle = 'rgba(244,193,82,0.30)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, floorY + 0.5); g.lineTo(W, floorY + 0.5); g.stroke();
  g.strokeStyle = 'rgba(255,230,160,0.05)'; g.lineWidth = 1.5;
  for (let i = -8; i <= 8; i++) {
    g.beginPath(); g.moveTo(W / 2 + i * 60, floorY); g.lineTo(W / 2 + i * 210, H); g.stroke();
  }
  for (let j = 1; j < 8; j++) {
    const y = floorY + Math.pow(j / 8, 1.8) * (H - floorY);
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
  }
  // vignette
  const vg = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

function background(t) {
  if (!bgCanvas) paintBackground();
  ctx.drawImage(bgCanvas, 0, 0);
  // spotlight cones from the rig, breathing slowly
  const on = eout(seg(t, 0.1, 1.6));
  for (const [cx, sway] of [[214, 0], [432, 1.7], [650, 3.1]]) {
    const a = on * (0.07 + 0.02 * Math.sin(t * 0.9 + sway));
    const top = cx + Math.sin(t * 0.35 + sway) * 14;
    const lg = ctx.createLinearGradient(0, 0, 0, 600);
    lg.addColorStop(0, `rgba(255,226,170,${a * 1.6})`); lg.addColorStop(1, 'rgba(255,226,170,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(top - 22, 0); ctx.lineTo(top + 22, 0); ctx.lineTo(cx + 150, 600); ctx.lineTo(cx - 150, 600); ctx.closePath(); ctx.fill();
  }
  // header
  font(400, 22, DISPLAY); text('RECKON', 64, 84, { color: C.gold, spacing: '2px' });
  const rw = ctx.measureText('RECKON').width + 2 * 6;
  font(700, 22); text('MATH · PROBABILITY', 64 + rw + 22, 84, { color: C.creamSoft, spacing: '2px' });
  bulbs(t, 132, 56, 808, 24, on);
}

/** A row of marquee bulbs that chase gently. */
function bulbs(t, y, x0, x1, n, on = 1) {
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, i / (n - 1));
    const lit = on * seg(t, 0.15 + i * 0.03, 0.45 + i * 0.03);
    const b = lit * (0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 4.2 - i * 0.85)));
    bulb(x, y, 7, b);
  }
}
function bulb(x, y, r, b) {
  const gl = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4);
  gl.addColorStop(0, `rgba(255,214,120,${0.55 * b})`); gl.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, r * 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgb(${Math.round(lerp(92, 255, b))},${Math.round(lerp(58, 238, b))},${Math.round(lerp(40, 190, b))})`;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${0.7 * b})`; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.32, 0, Math.PI * 2); ctx.fill();
}

// ---------- prizes ----------
function goat(cx, cy, s, alpha = 1) {
  withAlpha(alpha, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    ctx.fillStyle = C.cream; ctx.strokeStyle = C.cream; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // legs
    ctx.lineWidth = 0.07;
    for (const x of [-0.27, -0.15, 0.17, 0.29]) { ctx.beginPath(); ctx.moveTo(x, 0.08); ctx.lineTo(x + (x < 0 ? -0.01 : 0.01), 0.44); ctx.stroke(); }
    // body
    ctx.beginPath(); ctx.ellipse(0.02, 0, 0.38, 0.2, 0, 0, Math.PI * 2); ctx.fill();
    // tail
    ctx.beginPath(); ctx.moveTo(0.36, -0.1); ctx.lineTo(0.47, -0.2); ctx.lineTo(0.4, -0.04); ctx.closePath(); ctx.fill();
    // neck and head
    ctx.beginPath(); ctx.moveTo(-0.24, -0.1); ctx.lineTo(-0.38, -0.34); ctx.lineTo(-0.27, -0.38); ctx.lineTo(-0.12, -0.12); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-0.41, -0.36, 0.13, 0.085, -0.5, 0, Math.PI * 2); ctx.fill();
    // ear
    ctx.beginPath(); ctx.ellipse(-0.25, -0.43, 0.08, 0.03, 0.4, 0, Math.PI * 2); ctx.fill();
    // horns
    ctx.lineWidth = 0.045; ctx.strokeStyle = C.goldLight;
    ctx.beginPath(); ctx.moveTo(-0.36, -0.44); ctx.quadraticCurveTo(-0.3, -0.62, -0.16, -0.58); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-0.41, -0.44); ctx.quadraticCurveTo(-0.38, -0.6, -0.26, -0.62); ctx.stroke();
    // beard
    ctx.fillStyle = C.cream;
    ctx.beginPath(); ctx.moveTo(-0.5, -0.31); ctx.lineTo(-0.47, -0.18); ctx.lineTo(-0.43, -0.3); ctx.closePath(); ctx.fill();
    // eye
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-0.4, -0.39, 0.022, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}
function car(cx, cy, s, alpha = 1) {
  withAlpha(alpha, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    // body
    const bg = ctx.createLinearGradient(0, -0.3, 0, 0.2);
    bg.addColorStop(0, C.goldLight); bg.addColorStop(0.5, C.gold); bg.addColorStop(1, C.goldDeep);
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(-0.5, 0.12); ctx.lineTo(-0.5, -0.02); ctx.quadraticCurveTo(-0.48, -0.08, -0.36, -0.1);
    ctx.lineTo(-0.22, -0.12); ctx.lineTo(-0.12, -0.27); ctx.quadraticCurveTo(-0.08, -0.31, 0.0, -0.31);
    ctx.lineTo(0.16, -0.31); ctx.quadraticCurveTo(0.22, -0.31, 0.26, -0.26); ctx.lineTo(0.36, -0.12);
    ctx.quadraticCurveTo(0.5, -0.1, 0.52, 0.0); ctx.lineTo(0.52, 0.12); ctx.closePath(); ctx.fill();
    // windows
    ctx.fillStyle = 'rgba(42,11,48,0.85)';
    ctx.beginPath(); ctx.moveTo(-0.17, -0.13); ctx.lineTo(-0.09, -0.25); ctx.lineTo(0.03, -0.25); ctx.lineTo(0.03, -0.13); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0.08, -0.13); ctx.lineTo(0.08, -0.25); ctx.lineTo(0.17, -0.25); ctx.lineTo(0.27, -0.13); ctx.closePath(); ctx.fill();
    // stripe
    ctx.fillStyle = C.cherry; ctx.fillRect(-0.5, -0.02, 1.02, 0.045);
    // wheels
    for (const x of [-0.29, 0.31]) {
      ctx.fillStyle = '#1A0820'; ctx.beginPath(); ctx.arc(x, 0.12, 0.11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.goldLight; ctx.beginPath(); ctx.arc(x, 0.12, 0.045, 0, Math.PI * 2); ctx.fill();
    }
    // headlight
    ctx.fillStyle = '#FFFBEA'; ctx.beginPath(); ctx.ellipse(0.48, -0.05, 0.03, 0.022, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

// ---------- a gold-framed door ----------
/**
 * Door with its hinge on the left. open: 0 closed .. 1 swung open. prize: 'car' | 'goat' | null.
 * glow: [colour, amount] for a halo around the frame.
 */
function door(x, y, w, h, { num, open = 0, prize = null, glow = null, dim = 0 } = {}) {
  const f = Math.max(5, w * 0.06);
  ctx.save();
  // floor pool of light
  const pool = ctx.createRadialGradient(x + w / 2, y + h + f, 4, x + w / 2, y + h + f, w * 0.85);
  pool.addColorStop(0, 'rgba(255,214,140,0.22)'); pool.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = pool; ctx.save(); ctx.translate(x + w / 2, y + h + f); ctx.scale(1, 0.18); ctx.translate(-(x + w / 2), -(y + h + f));
  ctx.beginPath(); ctx.arc(x + w / 2, y + h + f, w * 0.85, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  // frame
  if (glow && glow[1] > 0) { ctx.shadowColor = glow[0]; ctx.shadowBlur = 38 * glow[1]; }
  const fr = ctx.createLinearGradient(x - f, y - f, x + w + f, y + h);
  fr.addColorStop(0, C.goldLight); fr.addColorStop(0.35, C.gold); fr.addColorStop(0.7, C.goldDeep); fr.addColorStop(1, C.gold);
  ctx.fillStyle = fr; rrect(x - f, y - f, w + 2 * f, h + f, f * 0.9); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  // recess
  const ins = ctx.createLinearGradient(0, y, 0, y + h);
  ins.addColorStop(0, '#1C0722'); ins.addColorStop(1, C.inside);
  ctx.fillStyle = ins; ctx.fillRect(x, y, w, h);
  if (open > 0.01) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const sp = ctx.createRadialGradient(x + w / 2, y + h * 0.15, 4, x + w / 2, y + h * 0.6, h * 0.7);
    sp.addColorStop(0, `rgba(255,226,170,${0.42 * open})`); sp.addColorStop(1, 'rgba(255,226,170,0)');
    ctx.fillStyle = sp; ctx.fillRect(x, y, w, h);
    if (prize === 'goat') goat(x + w * 0.53, y + h * 0.64, w * 0.78, seg(open, 0.25, 0.8));
    if (prize === 'car') car(x + w / 2, y + h * 0.72, w * 0.9, seg(open, 0.25, 0.8));
    ctx.restore();
  }
  // threshold
  ctx.fillStyle = C.goldDeep; rrect(x - f * 1.5, y + h - 1, w + 3 * f, f * 0.9, f * 0.3); ctx.fill();
  // the panel, swung about the hinge
  const th = eio(clamp(open)) * Math.PI * 0.46;
  const c = Math.cos(th), d = Math.sin(th) * w * 0.12;
  const P = (u, v) => [x + w * c * u, lerp(y - d * u, y + h + d * u, v)];
  const quad = (u0, v0, u1, v1) => {
    const a = P(u0, v0), b = P(u1, v0), cc = P(u1, v1), dd = P(u0, v1);
    ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...cc); ctx.lineTo(...dd); ctx.closePath();
  };
  const pg = ctx.createLinearGradient(x, y, x + w * c, y + h);
  pg.addColorStop(0, '#E8384A'); pg.addColorStop(0.55, C.cherry); pg.addColorStop(1, C.cherryDeep);
  ctx.fillStyle = pg; quad(0, 0, 1, 1); ctx.fill();
  ctx.lineWidth = Math.max(1.5, w * 0.012); ctx.strokeStyle = 'rgba(60,0,12,0.55)';
  quad(0.14, 0.07, 0.86, 0.44); ctx.stroke();
  quad(0.14, 0.52, 0.86, 0.93); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,190,190,0.22)';
  quad(0.16, 0.08, 0.84, 0.43); ctx.stroke();
  quad(0.16, 0.53, 0.84, 0.92); ctx.stroke();
  const kn = P(0.88, 0.5);
  ctx.fillStyle = C.goldLight; ctx.beginPath(); ctx.arc(kn[0], kn[1], Math.max(2.5, w * 0.03), 0, Math.PI * 2); ctx.fill();
  if (open > 0) { ctx.fillStyle = `rgba(10,0,8,${0.5 * eio(clamp(open))})`; quad(0, 0, 1, 1); ctx.fill(); }
  if (dim > 0) { ctx.fillStyle = `rgba(14,3,18,${dim})`; rrect(x - f, y - f, w + 2 * f, h + f, f * 0.9); ctx.fill(); }
  // number plaque
  const r = w * 0.15, px = x + w / 2, py = y - f * 0.4;
  const pl = ctx.createLinearGradient(px - r, py - r, px + r, py + r);
  pl.addColorStop(0, C.goldLight); pl.addColorStop(1, C.goldDeep);
  ctx.fillStyle = pl; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.12); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, r * 0.82, 0, Math.PI * 2); ctx.stroke();
  font(400, Math.round(r * 1.1), DISPLAY); text(String(num), px, py + r * 0.06, { color: C.ink, align: 'center', base: 'middle' });
  if (dim > 0) { ctx.fillStyle = `rgba(14,3,18,${dim})`; ctx.beginPath(); ctx.arc(px, py, r + 1, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

/** A pill label. */
function chip(label, cx, cy, { bg = C.gold, fg = C.ink, size = 22, family = DISPLAY, padX = 20, h = 44, alpha = 1, scale = 1 } = {}) {
  withAlpha(alpha, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
    font(400, size, family);
    const w = ctx.measureText(label).width + 2 * padX;
    rrect(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
    text(label, 0, 2, { color: fg, align: 'center', base: 'middle' });
    ctx.restore();
  });
}

// ---------- big doors (scenes A and C) ----------
const BIG = { w: 200, h: 330, gap: 36, y: 214 };
const bigX = (i) => (W - (3 * BIG.w + 2 * BIG.gap)) / 2 + i * (BIG.w + BIG.gap);
const bigCX = (i) => bigX(i) + BIG.w / 2;

function sceneA(t) {
  const opened = eio(seg(t, 8.4, 9.6));
  const pickGlow = eout(seg(t, 4.7, 5.2));
  for (let i = 0; i < 3; i++) {
    const p = eout(seg(t, 0.3 + i * 0.18, 1.2 + i * 0.18));
    withAlpha(p, () => {
      ctx.save(); ctx.translate(0, (1 - p) * 50);
      const glow = i === 0 ? [C.cherry, pickGlow * (0.75 + 0.25 * Math.sin(t * 3))] : i === 1 ? [C.gold, seg(t, 11.9, 12.4) * 0.8] : null;
      door(bigX(i), BIG.y, BIG.w, BIG.h, { num: i + 1, open: i === 2 ? opened : 0, prize: i === 2 ? 'goat' : null, glow });
      ctx.restore();
    });
  }
  // what is behind the doors
  withAlpha(span(t, 1.6, 4.5, 0.4, 0.4), () => {
    const y = 668;
    car(300, y, 120, eout(seg(t, 1.6, 2.1)));
    font(400, 26, DISPLAY); text('1 CAR', 372, y + 4, { color: C.gold, base: 'middle' });
    goat(520, y - 4, 96, eout(seg(t, 2.1, 2.6)));
    text('2 GOATS', 584, y + 4, { color: C.cream, base: 'middle' });
  });
  // your pick
  const pk = eout(seg(t, 4.7, 5.2));
  const toStay = seg(t, 11.8, 12.2);
  chip('YOUR PICK', bigCX(0), 604 + (1 - pk) * 16, { bg: C.cherry, fg: C.cream, alpha: pk * (1 - toStay) });
  // the host opens door 3
  withAlpha(span(t, 7.2, 11.6, 0.4, 0.4), () => chip('HOST OPENS', bigCX(2), 604, { bg: C.cream, fg: C.ink, scale: 0.9 + 0.1 * eout(seg(t, 7.2, 7.6)) }));
  // the question
  const q = eout(seg(t, 11.8, 12.3));
  const fifty = seg(t, 15.5, 15.9);
  chip(fifty > 0.5 ? '50%?' : 'STAY?', bigCX(0), 604, { bg: C.cherry, fg: C.cream, alpha: q * Math.abs(1 - 2 * fifty) });
  chip(fifty > 0.5 ? '50%?' : 'SWITCH?', bigCX(1), 604, { bg: C.gold, fg: C.ink, alpha: q * Math.abs(1 - 2 * fifty) });
  // a swap arrow between the two closed doors
  withAlpha(q * (1 - fifty * 0.6), () => {
    const a = eout(seg(t, 12.2, 13.0));
    const x0 = bigCX(0) + 6, x1 = bigCX(1) - 6, y0 = 644;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.setLineDash([10, 10]);
    ctx.beginPath();
    const n = 30;
    for (let j = 0; j <= n * a; j++) { const u = j / n; const x = lerp(x0, x1, u), y = y0 + Math.sin(Math.PI * u) * 46; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]);
    if (a > 0.95) {
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(x1 + 4, y0 - 6); ctx.lineTo(x1 - 14, y0 + 2); ctx.lineTo(x1 + 2, y0 + 14); ctx.closePath(); ctx.fill();
    }
  });
}

// ---------- the simulation (scene B) ----------
const MINI = { w: 104, h: 150, gap: 26, y: 252 };
const miniX = (i) => (W - (3 * MINI.w + 2 * MINI.gap)) / 2 + i * (MINI.w + MINI.gap);
const miniCX = (i) => miniX(i) + MINI.w / 2;
const BAR = { x0: 232, pitch: 12, tile: 10, rows: 5, stayY: 494, switchY: 598 };
const slotPos = (g) => {
  const col = Math.floor(g.slot / BAR.rows), row = g.slot % BAR.rows;
  return [BAR.x0 + col * BAR.pitch, (g.stay ? BAR.stayY : BAR.switchY) + row * BAR.pitch];
};
const tileColour = (g) => (g.stay ? C.cherry : C.gold);

function sceneB(t) {
  // which slow game is on the small doors
  let gi = -1;
  for (let i = 0; i < 3; i++) if (t >= SLOW[i] - 0.3) gi = i;
  const fast = seg(t, FAST_A - 0.3, FAST_A + 0.1);
  // game counter
  let played = 0;
  for (let i = 0; i < GAMES.length; i++) if (t >= RES[i]) played = i + 1;
  const shown = Math.max(1, gi < 0 ? 1 : Math.min(GAMES.length, Math.max(played, gi + 1)));
  font(400, 30, DISPLAY);
  text(`GAME ${shown}`, W / 2 - 8, 204, { color: C.gold, align: 'right' });
  text('OF 300', W / 2 + 8, 204, { color: C.creamSoft, align: 'left' });

  // small doors
  const g = gi >= 0 ? GAMES[gi] : GAMES[0];
  const tau = gi >= 0 ? t - SLOW[gi] : -1;
  const closeAll = 1 - eio(seg(tau, 2.02, 2.38));
  for (let d = 0; d < 3; d++) {
    let open = 0;
    if (fast < 1 && gi >= 0) {
      if (d === g.open) open = eio(seg(tau, 0.55, 1.0)) * closeAll;
      else open = eio(seg(tau, 1.15, 1.55)) * closeAll;
    }
    const isWin = d === g.car;
    const glowA = fast < 1 && gi >= 0 ? seg(tau, 1.55, 1.75) * (1 - seg(tau, 2.0, 2.3)) : 0;
    door(miniX(d), MINI.y, MINI.w, MINI.h, {
      num: d + 1, open, prize: d === g.car ? 'car' : 'goat',
      glow: isWin ? [g.stay ? C.cherry : C.gold, glowA] : null, dim: 0.45 * fast,
    });
  }
  if (fast < 1 && gi >= 0) {
    const pk = eout(seg(tau, 0.12, 0.42)) * (1 - seg(tau, 1.55, 1.75));
    chip('PICK', miniCX(g.pick), 432 + (1 - pk) * 10, { bg: C.cherry, fg: C.cream, alpha: pk * (1 - fast), size: 22, h: 40 });
    const rs = seg(tau, 1.6, 1.85) * (1 - seg(tau, 2.15, 2.38));
    chip(g.stay ? 'STAY WINS' : 'SWITCH WINS', W / 2, 432, { bg: g.stay ? C.cherry : C.gold, fg: g.stay ? C.cream : C.ink, alpha: rs * (1 - fast), scale: 0.9 + 0.1 * back(seg(tau, 1.6, 1.9)), h: 40 });
  }
  // fast-forward mark beside the counter
  withAlpha(fast * (1 - seg(t, 30.7, 31.1)), () => {
    font(400, 30, DISPLAY);
    const x = W / 2 - 8 - ctx.measureText(`GAME ${shown}`).width - 46, y = 193;
    ctx.fillStyle = C.gold;
    withAlpha(0.6 + 0.4 * Math.sin(t * 10), () => {
      for (const ox of [0, 16]) { ctx.beginPath(); ctx.moveTo(x + ox, y - 11); ctx.lineTo(x + ox + 16, y); ctx.lineTo(x + ox, y + 11); ctx.closePath(); ctx.fill(); }
    });
  });

  // the two bars
  const landed = { stay: 0, switch: 0 };
  for (let i = 0; i < GAMES.length; i++) if (t >= RES[i] + FLY[i]) landed[GAMES[i].stay ? 'stay' : 'switch']++;
  const maxCols = Math.ceil(Math.max(N_STAY, N_SWITCH) / BAR.rows);
  for (const [key, y, label, col] of [['stay', BAR.stayY, 'STAY', C.cherryText], ['switch', BAR.switchY, 'SWITCH', C.gold]]) {
    rrect(BAR.x0 - 8, y - 8, maxCols * BAR.pitch + 14, BAR.rows * BAR.pitch + 14, 10); ctx.fillStyle = 'rgba(255,243,221,0.06)'; ctx.fill();
    font(400, 24, DISPLAY); text(label, 64, y + 18, { color: col });
    font(400, 40, DISPLAY); text(String(landed[key]), 64, y + 60, { color: C.cream });
  }
  // tiles: landed ones sit in their slot; flying ones arc from the car's door
  for (let i = 0; i < GAMES.length; i++) {
    const gm = GAMES[i];
    if (t < RES[i]) continue;
    const [sx, sy] = slotPos(gm);
    const p = seg(t, RES[i], RES[i] + FLY[i]);
    const e = eio(p);
    const fx = miniCX(gm.car), fy = i < 3 ? MINI.y + MINI.h * 0.66 : MINI.y + MINI.h + 8;
    const x = lerp(fx, sx, e), y = lerp(fy, sy, e) - Math.sin(Math.PI * e) * 70;
    const s = i < 3 ? lerp(2.2, 1, e) : lerp(1.5, 1, e);
    const sz = BAR.tile * s;
    withAlpha(i < 3 ? 1 : seg(p, 0, 0.2), () => {
      rrect(x - (sz - BAR.tile) / 2, y - (sz - BAR.tile) / 2, sz, sz, 2.5 * s); ctx.fillStyle = tileColour(gm); ctx.fill();
    });
  }
  // the split
  const fin = eout(seg(t, 30.9, 31.5));
  withAlpha(fin, () => {
    const ends = { stay: Math.ceil(N_STAY / BAR.rows), switch: Math.ceil(N_SWITCH / BAR.rows) };
    chip(`${PCT_STAY}%`, BAR.x0 + ends.stay * BAR.pitch + 50, BAR.stayY + 29, { bg: C.cherry, fg: C.cream, size: 24, padX: 14, scale: 0.85 + 0.15 * back(fin) });
    chip(`${PCT_SWITCH}%`, BAR.x0 + ends.switch * BAR.pitch + 50, BAR.switchY + 29, { bg: C.gold, fg: C.ink, size: 24, padX: 14, scale: 0.85 + 0.15 * back(fin) });
  });
}

// ---------- why (scene C) ----------
function bracket(x0, x1, y, colour, label, labelFg, a) {
  withAlpha(a, () => {
    const p = eout(clamp(a * 1.4));
    const mid = (x0 + x1) / 2, half = ((x1 - x0) / 2) * p;
    ctx.strokeStyle = colour; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(mid - half, y - 18); ctx.lineTo(mid - half, y); ctx.lineTo(mid + half, y); ctx.lineTo(mid + half, y - 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mid, y); ctx.lineTo(mid, y + 16); ctx.stroke();
    chip(label, mid, y + 48, { bg: colour, fg: labelFg, size: 34, h: 58, padX: 22, scale: 0.8 + 0.2 * back(seg(a, 0.3, 1)) });
  });
}

function sceneC(t) {
  const open3 = eio(seg(t, 44.0, 45.0));
  const slide = eio(seg(t, 45.3, 46.6));
  const otherGlow = seg(t, 39.0, 39.6) * (1 - 0.6 * seg(t, 45.3, 46.0));
  const door2Glow = Math.max(otherGlow, seg(t, 46.2, 46.8) * (0.8 + 0.2 * Math.sin(t * 4)));
  door(bigX(0), BIG.y, BIG.w, BIG.h, { num: 1, glow: [C.cherry, eout(seg(t, 34.8, 35.3)) * 0.7] });
  door(bigX(1), BIG.y, BIG.w, BIG.h, { num: 2, glow: [C.gold, door2Glow] });
  door(bigX(2), BIG.y, BIG.w, BIG.h, { num: 3, open: open3, prize: 'goat', glow: [C.gold, otherGlow * (1 - seg(t, 44.6, 45.4))], dim: 0.35 * seg(t, 45.6, 46.4) });
  const pk = eout(seg(t, 34.8, 35.3));
  bracket(bigX(0) + 10, bigX(0) + BIG.w - 10, 600, C.cherry, '1/3', C.cream, seg(t, 35.4, 36.2));
  // the two other doors share 2/3; after the host's reveal it all sits on door 2
  const r0 = bigX(2) + BIG.w - 10, r1 = bigX(1) + BIG.w - 10;
  bracket(bigX(1) + 10, lerp(r0, r1, slide), 600, C.gold, '2/3', C.ink, seg(t, 38.9, 39.7));
  withAlpha(pk * (1 - seg(t, 48.4, 48.9)), () => {
    font(400, 22, DISPLAY); text('YOUR PICK', bigCX(0), 718, { color: C.cherryText, align: 'center', base: 'middle' });
  });
}

// ---------- payoff (scene D) ----------
function sceneD(t) {
  const p = eout(seg(t, 48.8, 49.5));
  // confetti
  const rnd = mulberry32(7);
  for (let i = 0; i < 70; i++) {
    const x0 = rnd() * W, delay = rnd() * 1.8, v = 150 + rnd() * 160, spin = (rnd() - 0.5) * 8, sw = rnd() * 6.28;
    const col = [C.gold, C.cherry, C.cream, C.goldLight][i % 4];
    const tt = t - 48.9 - delay;
    if (tt < 0) continue;
    const y = -20 + tt * v, x = x0 + Math.sin(tt * 2 + sw) * 24;
    if (y > 940) continue;
    withAlpha(seg(tt, 0, 0.3) * (1 - seg(y, 820, 940)), () => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(spin * tt); ctx.scale(1, Math.abs(Math.cos(tt * 4 + sw)) + 0.2);
      ctx.fillStyle = col; ctx.fillRect(-6, -3.5, 12, 7); ctx.restore();
    });
  }
  withAlpha(p, () => {
    ctx.save(); ctx.translate(W / 2, 420 + (1 - p) * 24); ctx.scale(0.94 + 0.06 * p, 0.94 + 0.06 * p);
    const bw = 680, bh = 400;
    rrect(-bw / 2, -bh / 2, bw, bh, 34);
    const bg = ctx.createLinearGradient(0, -bh / 2, 0, bh / 2);
    bg.addColorStop(0, '#4A1553'); bg.addColorStop(1, '#2A0A31');
    ctx.fillStyle = bg; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = C.gold; ctx.stroke();
    // bulbs around the sign
    const n = 40;
    for (let i = 0; i < n; i++) {
      let d = (i / n) * (2 * (bw - 60) + 2 * (bh - 60));
      let bx, by;
      const iw = bw - 60, ih = bh - 60;
      if (d < iw) { bx = -iw / 2 + d; by = -bh / 2 + 22; }
      else if ((d -= iw) < ih) { bx = bw / 2 - 22; by = -ih / 2 + d; }
      else if ((d -= ih) < iw) { bx = iw / 2 - d; by = bh / 2 - 22; }
      else { d -= iw; bx = -bw / 2 + 22; by = ih / 2 - d; }
      bulb(bx, by, 6, 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 6 - i * 0.7)));
    }
    font(400, 104, DISPLAY); text('SWITCH!', 0, -70, { color: C.gold, align: 'center', base: 'middle' });
    font(700, 44); text('You win the car', 0, 34, { color: C.cream, align: 'center', base: 'middle' });
    font(700, 44); text('2 games in 3', 0, 88, { color: C.gold, align: 'center', base: 'middle' });
    ctx.restore();
    font(500, 30); text('…because the host knows where the car is', W / 2, 700, { color: C.creamSoft, align: 'center', base: 'middle' });
    text('and always opens a goat door.', W / 2, 740, { color: C.creamSoft, align: 'center', base: 'middle' });
    font(500, 22);
    text('Source: Wikipedia, “Monty Hall problem”', W / 2, 860, { color: 'rgba(255,243,221,0.62)', align: 'center', base: 'middle' });
    text('Tally: 300 simulated games, fixed random seed', W / 2, 892, { color: 'rgba(255,243,221,0.62)', align: 'center', base: 'middle' });
  });
}

// Captions with balanced lines: the narrowest width that keeps the same number of lines.
const CAP = { size: 46, lh: 58, weight: 700, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 830, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.cream, marks: { '*': C.cherryText, '~': C.gold } });
  }
}

Kit.scene({
  width: W, height: H, duration: 54,
  fonts: [
    { family: DISPLAY, file: 'Bungee.woff2', weight: '400' },
    { family: TEXT, file: 'Barlow-Medium.woff2', weight: '500' },
    { family: TEXT, file: 'Barlow-Bold.woff2', weight: '700' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D, 0.4, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
