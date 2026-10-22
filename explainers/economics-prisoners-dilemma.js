// Explainer for economics-prisoners-dilemma: logic tells both suspects to betray, so both serve longer,
// and in the repeated game a simple reciprocating strategy, tit for tat, comes out on top.
// Look: a film-noir interrogation room. Charcoal walls crossed by venetian-blind light, a hanging lamp
// with drifting smoke, fedora silhouettes (simple shapes). Amber lamplight marks silence, brick red marks
// betrayal, steel blue marks suspect B. Oswald for display and captions, Space Mono for typed case labels.
//
// Sources: Wikipedia, "Prisoner's dilemma" (the post's source): Poundstone's version of the story, 1 year
// each if both stay silent, 2 each if both betray, 0 for a lone betrayer and 3 for the partner; betraying
// is strictly dominant for both; mutual betrayal is the only strong Nash equilibrium; Axelrod invited
// computer strategies for the repeated game; tit for tat by Anatol Rapoport won; it cooperates first, then
// copies. Wikipedia, "Tit for tat": "Robert Axelrod's two tournaments, held around 1980", it won both.
// Wikipedia, "The Evolution of Cooperation": each pair played 200 iterations.
// The mini-tournament below is our own simulation (fixed seed), and the captions say so.
//
// Scene plan (64 s; captions centred at y = 835, everything important above y = 930):
//  A  0.0–12.9  Hook. Two rooms split by a wall, a suspect in each. Each weighs SILENT or BETRAY; both
//               betray and get 2 years, with the 1 year they could have had greyed out.
//  B 12.6–39.0  The payoff board. Cells appear (1·1, 3·0 / 0·3, 2·2). Column by column, arrows show A does
//               better by betraying (0 < 1, 2 < 3); then both betray, stamped 2 + 2, with 1 + 1 left unused.
//  C 38.7–59.2  Repeated game. A strip of rounds: tit for tat against always betray (silent first, then
//               copies). Our mini-tournament: 5 strategies, each plays all 5 (itself included) for 200 rounds;
//               15 matches fill the scoreboard of total years. Always betray never serves more than its
//               rival in any match, yet ranks below tit for tat; the board sorts, tit for tat on top.
//  D 58.9–64.0  Payoff card: tit for tat, Anatol Rapoport, won both of Axelrod's tournaments; footnote.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#0B0A09', bg1: '#191512', bg2: '#241E19', amber: '#E9B45A', amberDeep: '#9C6A22', amberSoft: 'rgba(233,180,90,0.16)',
  red: '#C9473A', redText: '#EE7464', blue: '#8DB6D2', cream: '#EFE5D0', creamSoft: 'rgba(239,229,208,0.72)', creamDim: 'rgba(239,229,208,0.45)',
  ink: '#120F0D', panel: '#1F1A16',
};
const DISPLAY = 'Oswald', MONO = 'Space Mono';

let k, ctx;
const font = (w, s, f = DISPLAY) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.cream, ...o });
const rrect = (...a) => k.rrect(...a);
const A_ = (a, fn) => k.alpha(a, fn);

// ---------- the mini-tournament (computed) ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const YEARS = { SS: [1, 1], SB: [3, 0], BS: [0, 3], BB: [2, 2] };
const STRATS = [
  { id: 'ALLC', name: 'ALWAYS SILENT', play: () => 'S' },
  { id: 'ALLD', name: 'ALWAYS BETRAY', play: () => 'B' },
  { id: 'RAND', name: 'COIN FLIP', play: (me, op, r) => (r() < 0.5 ? 'S' : 'B') },
  { id: 'TFT', name: 'TIT FOR TAT', play: (me, op) => (op.length ? op[op.length - 1] : 'S') },
  { id: 'TF2T', name: 'TIT FOR TWO TATS', play: (me, op) => (op.length >= 2 && op[op.length - 1] === 'B' && op[op.length - 2] === 'B' ? 'B' : 'S') },
];
const ROUNDS = 200;
function playMatch(i, j, seed) {
  const r = mulberry32(seed), ha = [], hb = [];
  let ya = 0, yb = 0;
  for (let n = 0; n < ROUNDS; n++) {
    const x = STRATS[i].play(ha, hb, r), y = STRATS[j].play(hb, ha, r);
    ha.push(x); hb.push(y);
    const [p, q] = YEARS[x + y]; ya += p; yb += q;
  }
  return { i, j, ya, yb, ha, hb };
}
const MATCHES = [];
{
  let seed = 101;
  for (let i = 0; i < STRATS.length; i++) for (let j = i; j < STRATS.length; j++) MATCHES.push(playMatch(i, j, seed++));
}
// A strategy's total: its own years in every match (a match against its twin counts once).
const TOTAL = STRATS.map((_, s) => MATCHES.reduce((sum, m) => sum + (m.i === s ? m.ya : 0) + (m.j === s && m.i !== s ? m.yb : 0), 0));
const RANK = STRATS.map((_, s) => s).sort((a, b) => TOTAL[a] - TOTAL[b]);
const IDX = Object.fromEntries(STRATS.map((s, i) => [s.id, i]));
const ALLD = IDX.ALLD, TFT = IDX.TFT;
// Always betray against each rival: its years and the rival's.
const H2H = STRATS.map((_, o) => {
  const m = MATCHES.find((x) => (x.i === ALLD && x.j === o) || (x.j === ALLD && x.i === o));
  return m.i === ALLD ? [m.ya, m.yb] : [m.yb, m.ya];
});
if (RANK[0] !== TFT || H2H.some(([a, b]) => a > b)) console.error('unexpected tournament result', TOTAL, RANK);
const ALLD_PLACE = ['first', 'second', 'third', 'fourth', 'fifth'][RANK.indexOf(ALLD)];
// The strip: tit for tat against always betray, first rounds.
const STRIP = playMatch(TFT, ALLD, 1);

// ---------- timeline ----------
const T = { A: [0, 12.9], B: [12.6, 39.0], C: [38.7, 59.2], D: [58.9, 64.0] };
const CUES = [
  [0.5, 4.2, 'Two suspects, questioned in ~separate rooms~.'],
  [4.3, 8.2, 'Each can stay *silent* or ^betray^ the other.'],
  [8.3, 12.6, 'Both reason perfectly, and both end up worse off. Why?'],
  [12.9, 16.4, 'Both stay silent: *1 year* each.'],
  [16.5, 21.2, 'One betrays? The betrayer walks free; the silent one gets ^3 years^.'],
  [21.3, 24.6, 'Both betray: ^2 years^ each.'],
  [24.7, 29.4, 'If B stays silent, A does better betraying: *0* years, not 1.'],
  [29.5, 33.9, 'If B betrays, A still does better betraying: *2*, not 3.'],
  [34.0, 38.7, 'Betrayal always pays, so both serve ^2 years^ instead of *1*.'],
  [39.0, 44.3, 'Around 1980, Robert Axelrod ran tournaments where strategies played this game *over and over*.'],
  [44.4, 49.0, 'Here, five strategies each play all five, themselves included, for 200 rounds.'],
  [49.1, 53.7, `^Always betray^ never serves more than its rival, yet comes ${ALLD_PLACE}.`],
  [53.8, 59.0, 'Fewest years: *tit for tat*. Silent first, then copy the other’s last move.'],
  [59.2, 63.6, 'Entered by Anatol Rapoport, it won both of Axelrod’s real tournaments.'],
];

// ---------- background ----------
let bg = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 330, 30, W / 2, 420, 820);
  rad.addColorStop(0, C.bg2); rad.addColorStop(0.55, C.bg1); rad.addColorStop(1, C.bg0);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  // plaster grain
  const rnd = mulberry32(9);
  for (let i = 0; i < 4200; i++) {
    const x = rnd() * W, y = rnd() * H, a = rnd() * 0.05;
    g.fillStyle = rnd() < 0.5 ? `rgba(255,235,200,${a})` : `rgba(0,0,0,${a * 1.6})`;
    g.fillRect(x, y, 1.5, 1.5);
  }
  // vignette
  const vg = g.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 720);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

/** Venetian-blind light: diagonal warm bands from a window off to the upper left. */
function blinds(t, a = 1) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.translate(-120 + Math.sin(t * 0.15) * 10, 40);
  ctx.transform(1, 0.42, -0.62, 1, 0, 0);
  const flick = 0.92 + 0.08 * Math.sin(t * 7.3) * Math.sin(t * 2.1);
  for (let i = 0; i < 13; i++) {
    const y = 60 + i * 50;
    const lg = ctx.createLinearGradient(0, 0, 900, 0);
    const s = 0.11 * a * flick * (1 - i / 16);
    lg.addColorStop(0, `rgba(233,180,90,${s})`); lg.addColorStop(0.7, `rgba(233,180,90,${s * 0.55})`); lg.addColorStop(1, 'rgba(233,180,90,0)');
    ctx.fillStyle = lg; ctx.fillRect(80, y, 860, 27);
  }
  ctx.restore();
}

function smoke(t) {
  const rnd = mulberry32(21);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 7; i++) {
    const x0 = rnd() * W, y0 = 300 + rnd() * 500, r = 90 + rnd() * 120, v = 6 + rnd() * 8, ph = rnd() * 6;
    const x = x0 + Math.sin(t * 0.2 + ph) * 40, y = ((y0 - t * v) % 900 + 900) % 900 + 60;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(210,200,185,0.035)'); gr.addColorStop(1, 'rgba(210,200,185,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function lamp(t, x = W / 2, y = 148, a = 1) {
  A_(a, () => {
    const sway = Math.sin(t * 0.7) * 0.025;
    ctx.save(); ctx.translate(x, 0); ctx.rotate(sway);
    // light cone
    const cone = ctx.createLinearGradient(0, y, 0, y + 560);
    cone.addColorStop(0, 'rgba(233,180,90,0.16)'); cone.addColorStop(1, 'rgba(233,180,90,0)');
    ctx.fillStyle = cone;
    ctx.beginPath(); ctx.moveTo(-44, y + 24); ctx.lineTo(44, y + 24); ctx.lineTo(300, y + 560); ctx.lineTo(-300, y + 560); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3A322A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, y - 18); ctx.stroke();
    const sh = ctx.createLinearGradient(-60, 0, 60, 0);
    sh.addColorStop(0, '#2A241E'); sh.addColorStop(0.5, '#4A3F33'); sh.addColorStop(1, '#1E1915');
    ctx.fillStyle = sh;
    ctx.beginPath(); ctx.moveTo(-16, y - 20); ctx.lineTo(16, y - 20); ctx.lineTo(52, y + 24); ctx.lineTo(-52, y + 24); ctx.closePath(); ctx.fill();
    const bulb = ctx.createRadialGradient(0, y + 24, 2, 0, y + 24, 40);
    bulb.addColorStop(0, 'rgba(255,236,190,0.95)'); bulb.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = bulb; ctx.beginPath(); ctx.arc(0, y + 24, 40, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

function header() {
  font(600, 24); text('RECKON', 64, 84, { color: C.amber, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 3 * 6;
  font(400, 20, MONO); text('CASE FILE', 64 + w + 20, 83, { color: C.creamDim });
}

// ---------- figures ----------
/** A fedora silhouette seen from the front: shoulders, head, hat. rim: lamp light on the edges. */
function suspect(cx, cy, s, rim = 0.5, tint = C.amber) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  const body = new Path2D();
  body.moveTo(-1.15, 1.25); body.bezierCurveTo(-1.1, 0.62, -0.78, 0.42, -0.3, 0.36);
  body.lineTo(-0.18, 0.18); body.lineTo(0.18, 0.18); body.lineTo(0.3, 0.36);
  body.bezierCurveTo(0.78, 0.42, 1.1, 0.62, 1.15, 1.25); body.closePath();
  const head = new Path2D(); head.ellipse(0, -0.12, 0.34, 0.42, 0, 0, Math.PI * 2);
  const hat = new Path2D();
  hat.ellipse(0, -0.42, 0.66, 0.12, 0, 0, Math.PI * 2);
  hat.moveTo(-0.38, -0.44); hat.bezierCurveTo(-0.4, -0.86, -0.22, -0.92, 0, -0.84);
  hat.bezierCurveTo(0.22, -0.92, 0.4, -0.86, 0.38, -0.44); hat.closePath();
  ctx.fillStyle = '#070606';
  ctx.fill(body); ctx.fill(head); ctx.fill(hat);
  ctx.strokeStyle = tint; ctx.globalAlpha *= rim; ctx.lineWidth = 0.035;
  ctx.stroke(hat); ctx.stroke(body);
  ctx.restore();
}

function chip(label, cx, cy, { bg = C.amber, fg = C.ink, size = 24, family = DISPLAY, weight = 600, padX = 18, h = 44, alpha = 1, scale = 1, stroke = null } = {}) {
  A_(alpha, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
    font(weight, size, family);
    const w = ctx.measureText(label).width + 2 * padX;
    rrect(-w / 2, -h / 2, w, h, 6);
    if (bg) { ctx.fillStyle = bg; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2.5; ctx.stroke(); }
    text(label, 0, 1, { color: fg, align: 'center', base: 'middle', spacing: '1px' });
    ctx.restore();
  });
}

/** A rubber stamp, tilted, with a rough edge. */
function stamp(label, cx, cy, p, { color = C.red, size = 40, rot = -0.12 } = {}) {
  if (p <= 0) return;
  const sc = lerp(1.6, 1, eout(clamp(p * 1.6)));
  A_(clamp(p * 2.2), () => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
    font(700, size);
    const w = ctx.measureText(label).width + 36, h = size * 1.5;
    ctx.strokeStyle = color; ctx.lineWidth = 4; rrect(-w / 2, -h / 2, w, h, 6); ctx.stroke();
    ctx.lineWidth = 1.5; rrect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 4); ctx.stroke();
    text(label, 0, 2, { color, align: 'center', base: 'middle', spacing: '2px' });
    ctx.restore();
  });
}

// ---------- scene A: two rooms ----------
const ROOM = { y0: 170, y1: 740, wall: 432 };
function sceneA(t) {
  // the dividing wall
  const wallIn = eout(seg(t, 0.2, 1.2));
  ctx.fillStyle = '#060505'; ctx.fillRect(ROOM.wall - 9, lerp(ROOM.y1, ROOM.y0, wallIn), 18, (ROOM.y1 - ROOM.y0) * wallIn);
  ctx.fillStyle = 'rgba(233,180,90,0.18)'; ctx.fillRect(ROOM.wall - 9, lerp(ROOM.y1, ROOM.y0, wallIn), 2, (ROOM.y1 - ROOM.y0) * wallIn);
  for (const [i, cx, name, tint] of [[0, 216, 'SUSPECT A', C.amber], [1, 648, 'SUSPECT B', C.blue]]) {
    const p = eout(seg(t, 0.5 + i * 0.3, 1.6 + i * 0.3));
    A_(p, () => {
      // table
      const tg = ctx.createLinearGradient(0, 560, 0, 600);
      tg.addColorStop(0, '#3A2C20'); tg.addColorStop(1, '#1A130E');
      ctx.fillStyle = tg; ctx.fillRect(cx - 170, 560, 340, 30);
      ctx.fillStyle = 'rgba(233,180,90,0.35)'; ctx.fillRect(cx - 170, 560, 340, 2);
      suspect(cx, 418 + (1 - p) * 20, 100, 0.55, tint);
      font(400, 22, MONO); text(name, cx, 628, { color: tint, align: 'center', base: 'middle', spacing: '2px' });
    });
    // the choice: both weigh silent against betray, then both betray
    const q = eout(seg(t, 4.6 + i * 0.25, 5.2 + i * 0.25));
    const decide = eio(seg(t, 9.0 + i * 0.3, 9.6 + i * 0.3));
    const wobble = (1 - decide) * (0.5 + 0.5 * Math.sin((t - 5) * 3.2 + i * 1.7));
    const sAlpha = q * lerp(0.55 + 0.45 * wobble, 0.25, decide);
    const bAlpha = q * lerp(0.55 + 0.45 * (1 - wobble), 1, decide);
    chip('SILENT', cx - 72, 690, { bg: C.cream, fg: C.ink, alpha: sAlpha, scale: 1 - 0.08 * decide });
    chip('BETRAY', cx + 72, 690, { bg: C.red, fg: C.cream, alpha: bAlpha, scale: 1 + 0.1 * back(decide) * decide });
    // the sentence
    stamp('2 YEARS', cx, 232, seg(t, 10.0 + i * 0.25, 10.6 + i * 0.25), { color: C.redText, size: 38, rot: i ? 0.1 : -0.1 });
    A_(seg(t, 11.0, 11.5), () => {
      font(400, 22, MONO); text('both silent: 1 year', cx, 292, { color: C.creamDim, align: 'center', base: 'middle' });
    });
  }
}

// ---------- scene B: the payoff board ----------
const GRID = { x0: 262, y0: 300, cw: 250, ch: 186 };
const cellX = (c) => GRID.x0 + c * GRID.cw, cellY = (r) => GRID.y0 + r * GRID.ch;
// rows: A's choice, columns: B's choice; 0 = silent, 1 = betray
const CELLS = [[YEARS.SS, YEARS.SB], [YEARS.BS, YEARS.BB]];
const REVEAL = [[13.0, 16.8], [16.8, 21.5]];
function numberPair(r, c, a, { dimA = 0, dimB = 0, hiA = 0 } = {}) {
  const [ya, yb] = CELLS[r][c];
  const x = cellX(c), y = cellY(r);
  A_(a, () => {
    font(400, 22, MONO);
    text('A', x + 64, y + 48, { color: C.amber, align: 'center', base: 'middle' });
    text('B', x + 186, y + 48, { color: C.blue, align: 'center', base: 'middle' });
    A_(1 - dimA * 0.7, () => {
      ctx.save(); ctx.translate(x + 64, y + 112); const s = 1 + 0.18 * hiA; ctx.scale(s, s);
      font(600, 76); text(String(ya), 0, 0, { color: C.amber, align: 'center', base: 'middle' });
      ctx.restore();
    });
    A_(1 - dimB * 0.7, () => { font(600, 76); text(String(yb), x + 186, y + 112, { color: C.blue, align: 'center', base: 'middle' }); });
  });
}
function arrow(x0, y0, x1, y1, p, color, w = 5) {
  if (p <= 0) return;
  const x = lerp(x0, x1, p), y = lerp(y0, y1, p);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
  const ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-14, -11); ctx.lineTo(-14, 11); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function sceneB(t) {
  // headers
  const hp = eout(seg(t, 12.8, 13.5));
  A_(hp, () => {
    font(400, 22, MONO);
    text('YEARS IN PRISON FOR', 64, 178, { color: C.creamSoft, base: 'middle' });
    const w0 = ctx.measureText('YEARS IN PRISON FOR ').width;
    text('A', 64 + w0, 178, { color: C.amber, base: 'middle' });
    text(' AND', 64 + w0 + 14, 178, { color: C.creamSoft, base: 'middle' });
    text('B', 64 + w0 + 14 + ctx.measureText(' AND ').width, 178, { color: C.blue, base: 'middle' });
    chip('B SILENT', cellX(0) + GRID.cw / 2, 250, { bg: C.cream, fg: C.ink, size: 24 });
    chip('B BETRAYS', cellX(1) + GRID.cw / 2, 250, { bg: C.red, fg: C.cream, size: 24 });
    chip('A SILENT', 160, cellY(0) + GRID.ch / 2, { bg: C.cream, fg: C.ink, size: 24 });
    chip('A BETRAYS', 160, cellY(1) + GRID.ch / 2, { bg: C.red, fg: C.cream, size: 24 });
  });
  // column highlights for the reasoning
  const col0 = span(t, 24.8, 29.4, 0.4, 0.3), col1 = span(t, 29.6, 34.0, 0.4, 0.3);
  for (const [c, a] of [[0, col0], [1, col1]]) {
    A_(a, () => {
      rrect(cellX(c) - 6, cellY(0) - 6, GRID.cw + 12, 2 * GRID.ch + 12, 16);
      ctx.fillStyle = 'rgba(233,180,90,0.08)'; ctx.fill(); ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.stroke();
    });
  }
  // cells
  const endFocus = seg(t, 34.2, 35.0);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
    const a0 = r === 1 && c === 1 ? 21.4 : r === c ? REVEAL[0][0] : REVEAL[1][0];
    const a = eout(seg(t, a0, a0 + 0.6));
    A_(a, () => {
      ctx.save(); ctx.translate(0, (1 - a) * 12);
      rrect(cellX(c) + 6, cellY(r) + 6, GRID.cw - 12, GRID.ch - 12, 12);
      ctx.fillStyle = 'rgba(20,17,14,0.82)'; ctx.fill();
      ctx.strokeStyle = 'rgba(239,229,208,0.28)'; ctx.lineWidth = 2; ctx.stroke();
      const inCol = c === 0 ? col0 : col1;
      const dimA = r === 0 ? Math.max(c === 0 ? col0 : col1, 0) * 0.8 : 0;
      const hiA = r === 1 ? inCol : 0;
      const dimEnd = endFocus * (r === 1 && c === 1 ? 0 : r === 0 && c === 0 ? 0.35 : 0.85);
      A_(1 - dimEnd * 0.75, () => numberPair(r, c, 1, { dimA: (c === 0 ? col0 : col1) * (r === 0 ? 1 : 0), dimB: inCol * 0.6, hiA }));
      ctx.restore();
    });
  }
  // arrows: A switches from silent to betray in each column
  for (const [c, a0, a1, lbl] of [[0, 25.3, 29.4, '0 < 1'], [1, 30.0, 34.0, '2 < 3']]) {
    const p = eio(seg(t, a0, a0 + 0.8));
    A_(span(t, a0, a1, 0.2, 0.3), () => {
      arrow(cellX(c) + 64, cellY(0) + 150, cellX(c) + 64, cellY(1) + 64, p, C.amber, 6);
      chip(lbl, cellX(c) + 160, cellY(1) - 4, { bg: C.amber, fg: C.ink, size: 26, alpha: seg(t, a0 + 0.7, a0 + 1.0) });
    });
  }
  // the end: both betray, the better deal left on the table
  const e = seg(t, 34.4, 35.2);
  A_(e, () => {
    // B's reasoning too: arrows to the right
    const pr = eio(seg(t, 34.4, 35.2));
    arrow(cellX(0) + 186, cellY(0) + 164, cellX(1) + 168, cellY(0) + 164, pr, C.blue, 5);
    arrow(cellX(0) + 186, cellY(1) + 164, cellX(1) + 168, cellY(1) + 164, pr, C.blue, 5);
    arrow(cellX(1) + 64, cellY(0) + 150, cellX(1) + 64, cellY(1) + 64, pr, C.amber, 5);
    arrow(cellX(0) + 64, cellY(0) + 150, cellX(0) + 64, cellY(1) + 64, pr, C.amber, 5);
  });
  A_(seg(t, 35.6, 36.2), () => {
    rrect(cellX(1) + 2, cellY(1) + 2, GRID.cw - 4, GRID.ch - 4, 14); ctx.strokeStyle = C.redText; ctx.lineWidth = 4; ctx.stroke();
  });
  stamp('BOTH BETRAY: 2 + 2', cellX(1) + GRID.cw / 2 - 40, cellY(1) + GRID.ch + 54, seg(t, 35.6, 36.3), { color: C.redText, size: 30, rot: -0.05 });
  A_(seg(t, 36.4, 37.0), () => {
    ctx.setLineDash([10, 8]); ctx.strokeStyle = C.amber; ctx.lineWidth = 3;
    rrect(cellX(0) + 2, cellY(0) + 2, GRID.cw - 4, GRID.ch - 4, 14); ctx.stroke(); ctx.setLineDash([]);
    chip('BETTER DEAL: 1 + 1', cellX(0) + GRID.cw / 2, cellY(0) + 2, { bg: C.ink, fg: C.amber, size: 22, family: MONO, weight: 400, h: 36, stroke: C.amber });
  });
}

// ---------- scene C: the repeated game ----------
const STRIP_N = 12;
function moveChip(m, x, y, a, s = 40) {
  A_(a, () => {
    rrect(x - s / 2, y - s / 2, s, s, 7);
    ctx.fillStyle = m === 'S' ? C.cream : C.red; ctx.fill();
    font(600, 22); text(m === 'S' ? 'S' : 'B', x, y + 1, { color: m === 'S' ? C.ink : C.cream, align: 'center', base: 'middle' });
  });
}
function strip(t) {
  const a = span(t, 39.0, 44.4, 0.4, 0.4);
  A_(a, () => {
    font(400, 22, MONO); text('ROUND', 64, 300, { color: C.creamDim, base: 'middle' });
    const x0 = 352, dx = 40;
    for (let n = 0; n < STRIP_N; n++) {
      const tn = 39.8 + n * 0.32;
      font(400, 22, MONO); A_(seg(t, tn, tn + 0.2), () => text(String(n + 1), x0 + n * dx, 300, { color: C.creamDim, align: 'center', base: 'middle' }));
      moveChip(STRIP.ha[n], x0 + n * dx, 370, seg(t, tn, tn + 0.2), 34);
      moveChip(STRIP.hb[n], x0 + n * dx, 446, seg(t, tn, tn + 0.2), 34);
    }
    font(600, 30); text('TIT FOR TAT', 64, 370, { color: C.amber, base: 'middle' });
    text('ALWAYS BETRAY', 64, 446, { color: C.redText, base: 'middle' });
    // "copies" ticks: B's move in round n reappears as A's move in round n + 1
    const cp = seg(t, 41.6, 42.2);
    A_(cp, () => {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5;
      for (let n = 0; n < 3; n++) arrow(x0 + n * dx + 8, 426, x0 + (n + 1) * dx - 8, 392, 1, 'rgba(233,180,90,0.85)', 2.5);
      font(400, 22, MONO); text('copies the last move', x0 + 3.2 * dx, 504, { color: C.amber, base: 'middle' });
    });
    // legend
    moveChip('S', 352, 590, 1, 30); font(400, 22, MONO); text('silent', 378, 591, { color: C.creamSoft, base: 'middle' });
    moveChip('B', 520, 590, 1, 30); text('betray', 546, 591, { color: C.creamSoft, base: 'middle' });
    font(400, 22, MONO); text(`… and so on, for ${ROUNDS} rounds`, 64, 670, { color: C.creamDim, base: 'middle' });
  });
}

const BOARD = { y0: 210, pitch: 70, x0: 64, bar0: 340, barMax: 380 };
const MATCH_T0 = 44.8, MATCH_DT = 0.27;
const matchTime = (n) => MATCH_T0 + n * MATCH_DT;
const MAXTOT = Math.max(...TOTAL);
function board(t) {
  const a = span(t, 44.2, 59.2, 0.45, 0.35);
  A_(a, () => {
    // ticker
    let done = 0;
    for (let n = 0; n < MATCHES.length; n++) if (t >= matchTime(n)) done = n + 1;
    font(400, 22, MONO);
    if (done > 0 && done <= MATCHES.length) {
      const m = MATCHES[Math.max(0, done - 1)];
      const label = t < matchTime(MATCHES.length - 1) + 0.6
        ? `MATCH ${done}/${MATCHES.length}: ${STRATS[m.i].name.toLowerCase()} v ${m.i === m.j ? 'its twin' : STRATS[m.j].name.toLowerCase()}`
        : `${MATCHES.length} MATCHES · ${ROUNDS} ROUNDS EACH`;
      text(label, 64, 166, { color: C.creamSoft, base: 'middle' });
    } else text(`TOTAL YEARS SERVED · FEWEST WINS`, 64, 166, { color: C.creamSoft, base: 'middle' });
    // running totals, eased between matches
    const run = STRATS.map((_, s) => {
      let v = 0;
      MATCHES.forEach((m, n) => {
        const add = (m.i === s ? m.ya : 0) + (m.j === s && m.i !== s ? m.yb : 0);
        if (add) v += add * eio(seg(t, matchTime(n), matchTime(n) + 0.45));
      });
      return v;
    });
    const sortP = eio(seg(t, 53.9, 55.0));
    STRATS.forEach((st, s) => {
      const y = lerp(BOARD.y0 + s * BOARD.pitch, BOARD.y0 + RANK.indexOf(s) * BOARD.pitch, sortP) + 16;
      const isT = s === TFT, isD = s === ALLD;
      const glowD = span(t, 49.1, 53.8, 0.4, 0.4), glowT = seg(t, 54.6, 55.2);
      const dim = Math.max(glowD * (isD ? 0 : 0.55), glowT * (isT ? 0 : 0.55));
      A_(1 - dim, () => {
        rrect(BOARD.x0 - 12, y - 30, 760, 60, 10);
        ctx.fillStyle = isT && glowT ? `rgba(233,180,90,${0.16 * glowT})` : 'rgba(239,229,208,0.05)'; ctx.fill();
        font(600, 28); text(st.name, BOARD.x0, y + 1, { color: isT ? C.amber : isD ? C.redText : C.cream, base: 'middle', spacing: '1px' });
        const w = (run[s] / (MAXTOT * 1.04)) * BOARD.barMax;
        rrect(BOARD.bar0, y - 13, Math.max(2, w), 26, 5);
        ctx.fillStyle = isT ? C.amber : isD ? C.red : 'rgba(239,229,208,0.55)'; ctx.fill();
        font(500, 28); text(Kit.fmt(run[s]), BOARD.bar0 + w + 12, y + 1, { color: C.cream, base: 'middle' });
        if (sortP > 0.98) {
          font(400, 22, MONO);
          A_(seg(t, 55.0, 55.4), () => text(`#${RANK.indexOf(s) + 1}`, BOARD.x0 + 712, y + 1, { color: C.creamDim, align: 'right', base: 'middle' }));
        }
      });
    });
    // always betray, head to head
    A_(span(t, 49.3, 53.8, 0.4, 0.35), () => {
      const y0 = 566;
      rrect(52, y0, 760, 196, 14); ctx.fillStyle = 'rgba(12,10,9,0.86)'; ctx.fill(); ctx.strokeStyle = 'rgba(201,71,58,0.7)'; ctx.lineWidth = 2; ctx.stroke();
      font(400, 22, MONO); text('ALWAYS BETRAY v EACH RIVAL', 76, y0 + 30, { color: C.redText, base: 'middle' });
      text('its years – rival’s', 788, y0 + 30, { color: C.creamDim, align: 'right', base: 'middle' });
      const order = [IDX.ALLC, IDX.RAND, IDX.TFT, IDX.TF2T, IDX.ALLD];
      order.forEach((o, n) => {
        const x = 76, y = y0 + 66 + n * 28;
        A_(seg(t, 49.6 + n * 0.25, 49.9 + n * 0.25), () => {
          font(400, 22, MONO);
          text(o === ALLD ? 'v its twin' : `v ${STRATS[o].name.toLowerCase()}`, x, y, { color: C.creamSoft, base: 'middle' });
          text(`${H2H[o][0]} – ${H2H[o][1]}`, x + 440, y, { color: C.cream, align: 'right', base: 'middle' });
        });
      });
      A_(seg(t, 51.2, 51.6), () => {
        font(600, 28); text('never more', 640, y0 + 100, { color: C.amber, align: 'center', base: 'middle' });
        text('than its rival', 640, y0 + 136, { color: C.amber, align: 'center', base: 'middle' });
      });
    });
    // tit for tat's rule
    A_(span(t, 55.2, 59.2, 0.4, 0.35), () => {
      const y0 = 600;
      rrect(52, y0, 760, 160, 14); ctx.fillStyle = 'rgba(12,10,9,0.86)'; ctx.fill(); ctx.strokeStyle = 'rgba(233,180,90,0.7)'; ctx.lineWidth = 2; ctx.stroke();
      font(600, 30); text('TIT FOR TAT', 80, y0 + 40, { color: C.amber, base: 'middle', spacing: '1px' });
      font(400, 22, MONO);
      text('round 1: stay silent', 80, y0 + 84, { color: C.cream, base: 'middle' });
      text('after that: copy the other’s last move', 80, y0 + 120, { color: C.cream, base: 'middle' });
    });
  });
}
function sceneC(t) { strip(t); board(t); }

// ---------- scene D: payoff card ----------
function sceneD(t) {
  const p = eout(seg(t, 59.0, 59.8));
  A_(p, () => {
    ctx.save(); ctx.translate(W / 2, 420 + (1 - p) * 20);
    rrect(-330, -210, 660, 420, 16);
    const g = ctx.createLinearGradient(0, -210, 0, 210); g.addColorStop(0, '#2A221B'); g.addColorStop(1, '#16120F');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.stroke();
    font(400, 22, MONO); text('THE WINNER', 0, -150, { color: C.creamDim, align: 'center', base: 'middle', spacing: '4px' });
    font(700, 96); text('TIT FOR TAT', 0, -60, { color: C.amber, align: 'center', base: 'middle', spacing: '2px' });
    font(500, 34); text('entered by Anatol Rapoport', 0, 30, { color: C.cream, align: 'center', base: 'middle' });
    text('won both of Robert Axelrod’s', 0, 88, { color: C.creamSoft, align: 'center', base: 'middle' });
    text('tournaments, around 1980', 0, 132, { color: C.creamSoft, align: 'center', base: 'middle' });
    ctx.restore();
    font(400, 22, MONO);
    text('Mini-tournament simulated here:', W / 2, 676, { color: C.creamDim, align: 'center', base: 'middle' });
    text('5 strategies, 200 rounds, fixed seed.', W / 2, 706, { color: C.creamDim, align: 'center', base: 'middle' });
    text('Source: Wikipedia, “Prisoner’s dilemma”', W / 2, 744, { color: C.creamDim, align: 'center', base: 'middle' });
  });
  stamp('CASE CLOSED', W / 2 + 200, 214, seg(t, 60.4, 61.0), { color: C.redText, size: 30, rot: 0.16 });
}

// ---------- captions ----------
const CAP = { size: 46, lh: 58, weight: 500, maxW: 740 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~^]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  // a soft dark band behind the captions so the blind light never fights the text
  ctx.fillStyle = 'rgba(8,7,6,0.35)'; ctx.fillRect(0, 780, W, 110);
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 835, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: DISPLAY, ink: C.cream, marks: { '*': C.amber, '^': C.redText, '~': C.blue } });
  }
}

Kit.scene({
  width: W, height: H, duration: 64,
  fonts: [
    { family: DISPLAY, file: 'Oswald.woff2', weight: '200 700' },
    { family: MONO, file: 'SpaceMono-Regular.woff2', weight: '400' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintBackground();
    ctx.drawImage(bg, 0, 0);
    blinds(t, eout(seg(t, 0, 1.5)));
    lamp(t, W / 2, 104, span(t, 0, 12.9, 1.2, 0.5));
    smoke(t);
    header();
    const scenes = [[sceneA, T.A, 0.01], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D, 0.4, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      A_(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
