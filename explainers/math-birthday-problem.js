// Explainer for math-birthday-problem: with 23 people, a shared birthday is more likely than not.
// Look: a party at night. Deep plum backdrop with paper bunting and drifting confetti, guests as
// round party-hat tokens, and a confetti calendar of 365 day squares (12 month rows). Fredoka for
// display and numbers, Nunito for captions.
//
// Scene plan (58.5 s). Captions centred at y = 836; everything important above y = 930.
//  A  0.0–9.9   Hook. 23 guests pop in around the party. "What are the odds two share a birthday?"
//  B  9.6–24.6  Demonstration. The guests shrink into a row; one by one they drop onto their birthday
//               in the calendar (a party simulated below with a fixed seed, chosen so the first match
//               comes late: guest MATCH_AT). Then 1,000 simulated parties fill a tally grid: N_MATCH
//               of them have a shared birthday.
//  C 24.3–43.8  Why. The 23 guests on a circle; each newcomer adds a line to everyone already there,
//               253 pairs in all. Then a bar for "all birthdays different" shrinks by 364/365,
//               363/365, ... as each guest joins, to 49.3%.
//  D 43.5–58.5  The curve p(n) for n = 1..80, computed exactly: 50.7% at 23, 99.9% at 70.
//
// Facts (Wikipedia, "Birthday problem"): 365 equally likely birthdays, leap years ignored; with 23
// people there are 23 × 22 / 2 = 253 pairs; P(all different) = 365/365 × 364/365 × ... × 343/365
// ≈ 0.4927, so P(shared) ≈ 50.73%; 99.9% at 70 people. All numbers below are computed here.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#12082A', bg1: '#24104A', bg2: '#3A1A66',
  ink: '#FFF7EC', inkSoft: 'rgba(255,247,236,0.76)', inkDim: 'rgba(255,247,236,0.5)',
  coral: '#FF6B6B', sun: '#FFD166', mint: '#06D6A0', sky: '#4CC9F0', pink: '#F72585', lilac: '#B794F6',
  cell: 'rgba(255,247,236,0.09)', cellLine: 'rgba(255,247,236,0.16)',
};
const PARTY = [C.coral, C.sun, C.mint, C.sky, C.pink, C.lilac];
const DISPLAY = 'Fredoka', TEXT = 'Nunito';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
const pct = (p, d = 1) => `${(100 * p).toFixed(d)}%`;
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the maths ----------
const N = 23;
const allDiff = (n) => { let q = 1; for (let i = 0; i < n; i++) q *= (365 - i) / 365; return q; };
const P = (n) => 1 - allDiff(n);
const PAIRS = (N * (N - 1)) / 2; // 253
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayToMD = (d) => { let m = 0; while (d >= DAYS[m]) { d -= DAYS[m]; m++; } return [m, d]; };

// one party with a late first match, found by trying seeds in order
let PARTY_DAYS = [], MATCH_AT = -1, MATCH_WITH = -1;
for (let seed = 1; seed < 5000; seed++) {
  const rnd = mulberry32(seed * 7919);
  const days = Array.from({ length: N }, () => Math.floor(rnd() * 365));
  let first = -1, other = -1;
  for (let i = 0; i < N && first < 0; i++) for (let j = 0; j < i; j++) if (days[j] === days[i]) { first = i; other = j; break; }
  const later = days.slice(first + 1).some((d, i) => days.indexOf(d) !== first + 1 + i);
  if (first >= 15 && first <= 17 && !later) { PARTY_DAYS = days; MATCH_AT = first; MATCH_WITH = other; break; }
}
// 1,000 random parties
const PARTIES = [];
{
  const rnd = mulberry32(2026);
  for (let p = 0; p < 1000; p++) {
    const seen = new Set(); let hit = false;
    for (let i = 0; i < N; i++) { const d = Math.floor(rnd() * 365); if (seen.has(d)) hit = true; seen.add(d); }
    PARTIES.push(hit);
  }
}
const N_MATCH = PARTIES.filter(Boolean).length;
const [MM, MD] = dayToMD(PARTY_DAYS[MATCH_AT]);

// ---------- timeline ----------
const T = { A: [0, 9.9], B: [9.6, 25.5], C: [25.2, 44.5], D: [44.2, 59.2] };
const DROP0 = 10.6, DROP_GAP = 0.34; // guest i drops at DROP0 + i * DROP_GAP
const MATCH_T = DROP0 + MATCH_AT * DROP_GAP + 0.45;
const CUES = [
  [0.4, 5.3, '23 people at a party. What are the odds that two share a *birthday*?'],
  [5.4, 9.7, 'With 365 days to choose from, a match sounds unlikely.'],
  [9.9, MATCH_T - 0.1, 'Drop each guest’s birthday onto a calendar of 365 days.'],
  [MATCH_T, 20.9, `Then guest ${MATCH_AT + 1} lands on a day that’s *already taken*.`],
  [21.0, 25.3, `Now 1,000 random parties of 23: ~${N_MATCH}~ have a shared birthday.`],
  [25.4, 29.7, 'Why so likely? Every *pair* of guests is a chance for a match.'],
  [29.8, 34.3, `23 people make 23 × 22 ÷ 2 = ~${PAIRS} pairs~.`],
  [34.4, 39.3, 'Each newcomer must miss everyone already there, and that gets harder fast.'],
  [39.4, 44.1, `With 23 people, the chance that all birthdays differ is just ~${pct(allDiff(N))}~.`],
  [44.5, 48.6, `So a shared birthday is more likely than not: *${pct(P(N))}*.`],
  [48.7, 53.3, `Add people and it climbs fast. At 70 people it’s ~${pct(P(70))}~.`],
  [53.4, 58.6, `Not so strange after all: ${PAIRS} pairs mean ${PAIRS} chances.`],
];

// ---------- background ----------
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 380, 40, W / 2, 460, 860);
  rad.addColorStop(0, C.bg2); rad.addColorStop(0.5, C.bg1); rad.addColorStop(1, C.bg0);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  // soft polka dots, like a party backdrop
  for (let y = 20; y < H; y += 60) for (let x = (y / 60) % 2 ? 30 : 0; x < W; x += 60) {
    g.fillStyle = 'rgba(255,255,255,0.025)'; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill();
  }
  // settled confetti
  const rnd = mulberry32(42);
  for (let i = 0; i < 120; i++) {
    const x = rnd() * W, y = rnd() * H, a = rnd() * TAU;
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = PARTY[i % PARTY.length]; g.globalAlpha = 0.10 + rnd() * 0.12;
    g.fillRect(-5, -2.5, 10, 5);
    g.restore();
  }
  const vg = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 800);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(6,2,16,0.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function bunting(t, a) {
  withAlpha(a, () => {
    const y0 = 132, n = 15;
    ctx.strokeStyle = 'rgba(255,247,236,0.4)'; ctx.lineWidth = 2;
    const yAt = (x) => y0 + Math.sin((x / W) * Math.PI) * 34;
    ctx.beginPath(); for (let x = 20; x <= W - 20; x += 8) { x === 20 ? ctx.moveTo(x, yAt(x)) : ctx.lineTo(x, yAt(x)); } ctx.stroke();
    for (let i = 0; i < n; i++) {
      const x = lerp(48, W - 48, i / (n - 1)), y = yAt(x), sw = Math.sin(t * 1.8 + i) * 0.06;
      ctx.save(); ctx.translate(x, y); ctx.rotate(sw);
      ctx.fillStyle = PARTY[i % PARTY.length];
      ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.lineTo(0, 34); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  });
}
function fallingConfetti(t, a) {
  withAlpha(a, () => {
    for (let i = 0; i < 34; i++) {
      const r = mulberry32(500 + i), x0 = r() * W, sp = 26 + r() * 30, ph = r() * 900, col = PARTY[i % PARTY.length];
      const y = ((t * sp + ph) % 1000) - 40, x = x0 + Math.sin(t * (0.8 + r()) + i) * 22;
      if (x > 730 && y < 130) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * (1 + r() * 2) + i);
      ctx.scale(1, Math.cos(t * 3 + i)); ctx.fillStyle = col; ctx.globalAlpha *= 0.7; ctx.fillRect(-6, -3, 12, 6);
      ctx.restore();
    }
  });
}
function header() {
  font(600, 22, DISPLAY); text('RECKON', 64, 84, { color: C.sun, spacing: '3px' });
  const rw = ctx.measureText('RECKON').width + 18;
  font(700, 22); text('MATH · PROBABILITY', 64 + rw + 16, 84, { color: C.inkSoft, spacing: '2px' });
}

// ---------- guests ----------
/** A round party guest with a cone hat. */
function guest(x, y, r, col, a = 1, hat = true) {
  withAlpha(a, () => {
    // shoulders
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(x, y + r * 1.55, r * 1.25, r * 0.8, 0, Math.PI, 0); ctx.fill();
    // head
    ctx.fillStyle = '#FFE8D0'; ctx.beginPath(); ctx.arc(x, y, r * 0.72, 0, TAU); ctx.fill();
    if (hat) {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(x - r * 0.5, y - r * 0.45); ctx.lineTo(x + r * 0.5, y - r * 0.45); ctx.lineTo(x + r * 0.08, y - r * 1.55); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(x + r * 0.08, y - r * 1.58, r * 0.16, 0, TAU); ctx.fill();
    }
  });
}
const GCOL = (i) => PARTY[i % PARTY.length];
// party positions in scene A: three gentle arcs
const PARTY_POS = Array.from({ length: N }, (_, i) => {
  const rows = [8, 8, 7], row = i < 8 ? 0 : i < 16 ? 1 : 2, idx = row === 0 ? i : row === 1 ? i - 8 : i - 16;
  const n = rows[row], x = lerp(150, 714, n === 1 ? 0.5 : idx / (n - 1)) + (row === 2 ? 40 * (1 - 2 * (idx / (n - 1))) * 0 : 0);
  const y = 330 + row * 130 + Math.sin((idx / (n - 1)) * Math.PI) * -22 + (row % 2) * 10;
  return [row === 1 ? x + 0 : x, y];
});
const ROW_POS = Array.from({ length: N }, (_, i) => [lerp(84, 780, i / (N - 1)), 210]);

function sceneA(t) {
  bunting(t, eout(seg(t, 0.1, 0.9)));
  fallingConfetti(t, seg(t, 0.2, 1.2));
  for (let i = 0; i < N; i++) {
    const p = back(seg(t, 0.5 + i * 0.12, 1.0 + i * 0.12));
    const [x, y] = PARTY_POS[i];
    if (p <= 0) continue;
    const bob = Math.sin(t * 2 + i * 1.3) * 3;
    ctx.save(); ctx.translate(x, y + bob); ctx.scale(p, p); guest(0, 0, 28, GCOL(i)); ctx.restore();
  }
  // a count
  withAlpha(seg(t, 3.4, 4.0) * (1 - seg(t, 9.4, 9.9)), () => {
    font(600, 30, DISPLAY); text('23 guests', W / 2, 720, { color: C.sun, align: 'center', base: 'middle' });
  });
}

// ---------- B: the calendar ----------
const CAL = { x0: 128, y0: 302, pitch: 22, size: 19, row: 34 };
const cellXY = (day) => { const [m, d] = dayToMD(day); return [CAL.x0 + d * CAL.pitch, CAL.y0 + m * CAL.row]; };
function calendar(t, a) {
  withAlpha(a, () => {
    font(700, 22);
    for (let m = 0; m < 12; m++) {
      text(MONTHS[m], CAL.x0 - 14, CAL.y0 + m * CAL.row + CAL.size / 2 + 1, { color: C.inkDim, align: 'right', base: 'middle' });
      for (let d = 0; d < DAYS[m]; d++) {
        const x = CAL.x0 + d * CAL.pitch, y = CAL.y0 + m * CAL.row;
        ctx.fillStyle = C.cell; rrect(x, y, CAL.size, CAL.size, 4); ctx.fill();
      }
    }
    font(500, 22); text('365 days', CAL.x0 + 31 * CAL.pitch, CAL.y0 - 22, { color: C.inkDim, align: 'right', base: 'middle' });
  });
}
function sceneB(t) {
  const shrink = eio(seg(t, 9.6, 10.6));
  const calA = eout(seg(t, 9.9, 10.6)) * (1 - eio(seg(t, 20.9, 21.5)));
  fallingConfetti(t, 1 - seg(t, 9.6, 10.4));
  calendar(t, calA);
  // guests move from the party into a row, then drop onto their day
  withAlpha(1 - eio(seg(t, 20.9, 21.5)), () => {
    for (let i = 0; i < N; i++) {
      const [px, py] = PARTY_POS[i], [rx, ry] = ROW_POS[i];
      const x = lerp(px, rx, shrink), y = lerp(py, ry, shrink), r = lerp(28, 13, shrink);
      const td = DROP0 + i * DROP_GAP, f = eio(seg(t, td, td + 0.45));
      const [cx, cy] = cellXY(PARTY_DAYS[i]);
      const col = GCOL(i);
      if (f < 1) {
        const gx = lerp(x, cx + CAL.size / 2, f), gy = lerp(y, cy + CAL.size / 2, f) - Math.sin(Math.PI * f) * 40;
        guest(gx, gy, r * (1 - 0.6 * f), col, 1);
      }
      // the empty seat stays as a faint ring
      if (f > 0) withAlpha(0.35, () => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(rx, ry, 8, 0, TAU); ctx.stroke(); });
      if (f >= 1) {
        // a confetti square on the calendar
        const pop = back(seg(t, td + 0.45, td + 0.75));
        ctx.save(); ctx.translate(cx + CAL.size / 2, cy + CAL.size / 2); ctx.scale(pop, pop);
        ctx.fillStyle = col; rrect(-CAL.size / 2 - 1, -CAL.size / 2 - 1, CAL.size + 2, CAL.size + 2, 4); ctx.fill();
        ctx.restore();
      }
    }
    // the match
    const m = seg(t, MATCH_T, MATCH_T + 0.5);
    if (m > 0) {
      const [cx, cy] = cellXY(PARTY_DAYS[MATCH_AT]);
      const x = cx + CAL.size / 2, y = cy + CAL.size / 2;
      // burst
      const b = seg(t, MATCH_T, MATCH_T + 1.2);
      for (let j = 0; j < 16; j++) {
        const a = (j / 16) * TAU, r = 10 + eout(b) * 60;
        withAlpha(1 - b, () => { ctx.fillStyle = PARTY[j % 6]; ctx.save(); ctx.translate(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.rotate(a + b * 4); ctx.fillRect(-5, -2.5, 10, 5); ctx.restore(); });
      }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 18 + 4 * Math.sin(t * 6), 0, TAU); ctx.stroke();
      const sc = back(m);
      ctx.save(); ctx.translate(x, y - 64); ctx.scale(sc, sc);
      font(600, 30, DISPLAY);
      const s = `MATCH! ${MONTHS[MM]} ${MD + 1}`, w = ctx.measureText(s).width + 36;
      ctx.fillStyle = C.coral; rrect(-w / 2, -24, w, 48, 24); ctx.fill();
      text(s, 0, 2, { color: C.ink, align: 'center', base: 'middle' });
      ctx.restore();
      font(700, 22);
      const g = `guests ${MATCH_WITH + 1} and ${MATCH_AT + 1}`, gw = ctx.measureText(g).width + 24;
      ctx.fillStyle = 'rgba(18,8,42,0.9)'; rrect(x - gw / 2, y + 26, gw, 30, 15); ctx.fill();
      text(g, x, y + 42, { color: C.ink, align: 'center', base: 'middle' });
    }
  });
  // 1,000 parties
  withAlpha(eout(seg(t, 21.1, 21.7)), () => {
    const cols = 40, pitch = 15, s = 12, x0 = W / 2 - (cols * pitch) / 2, y0 = 260;
    const shown = Math.floor(1000 * clamp(seg(t, 21.4, 24.2)));
    let hits = 0;
    for (let i = 0; i < 1000; i++) {
      const x = x0 + (i % cols) * pitch, y = y0 + Math.floor(i / cols) * pitch;
      if (i < shown) { if (PARTIES[i]) hits++; ctx.fillStyle = PARTIES[i] ? C.sun : 'rgba(255,247,236,0.22)'; }
      else ctx.fillStyle = 'rgba(255,247,236,0.06)';
      ctx.fillRect(x, y, s, s);
    }
    font(600, 30, DISPLAY);
    text(`${shown.toLocaleString('en-US')} parties`, x0, 222, { color: C.ink, base: 'middle' });
    text(`${hits} with a match`, x0 + cols * pitch - 3, 222, { color: C.sun, align: 'right', base: 'middle' });
    // legend
    font(500, 22);
    ctx.fillStyle = C.sun; ctx.fillRect(x0, 666, 14, 14); text('shared birthday', x0 + 24, 674, { color: C.inkSoft, base: 'middle' });
    ctx.fillStyle = 'rgba(255,247,236,0.3)'; ctx.fillRect(x0 + 240, 666, 14, 14); text('all different', x0 + 264, 674, { color: C.inkSoft, base: 'middle' });
  });
}

// ---------- C: pairs ----------
const RING = { x: 432, y: 404, r: 196 };
const ringXY = (i) => { const a = -Math.PI / 2 + (i / N) * TAU; return [RING.x + Math.cos(a) * RING.r, RING.y + Math.sin(a) * RING.r]; };
const JOIN0 = 25.6, JOIN1 = 33.3;
const joinT = (i) => JOIN0 + (JOIN1 - JOIN0) * Math.pow(i / (N - 1), 0.75); // guest i joins (0-based)
const WALK0 = 34.7, WALK_GAP = 0.3; // guest i (from 1) highlighted at WALK0 + (i - 1) * WALK_GAP
function sceneC(t) {
  // how many guests have joined
  let n = 0; for (let i = 0; i < N; i++) if (t >= joinT(i)) n = i + 1;
  const walk = clamp(Math.floor((t - WALK0) / WALK_GAP) + 2, 1, N); // guests counted in the bar
  const walking = t >= WALK0 - 0.2;
  // lines
  ctx.lineCap = 'round';
  for (let i = 1; i < N; i++) {
    const ti = joinT(i);
    if (t < ti) continue;
    const [xi, yi] = ringXY(i);
    for (let j = 0; j < i; j++) {
      const p = eout(seg(t, ti + j * 0.012, ti + 0.3 + j * 0.012));
      if (p <= 0) continue;
      const [xj, yj] = ringXY(j);
      const hl = walking && i === walk - 1 && t < WALK0 + (N - 1) * WALK_GAP;
      ctx.strokeStyle = hl ? C.sun : GCOL(i);
      ctx.globalAlpha = hl ? 0.95 : walking ? 0.16 : 0.32;
      ctx.lineWidth = hl ? 3 : 1.6;
      ctx.beginPath(); ctx.moveTo(xi, yi); ctx.lineTo(lerp(xi, xj, p), lerp(yi, yj, p)); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  // guests on the ring
  for (let i = 0; i < N; i++) {
    const [x, y] = ringXY(i);
    const pop = back(seg(t, Math.max(25.2, joinT(i) - 0.25), Math.max(25.5, joinT(i) + 0.05)));
    if (pop <= 0) continue;
    const hl = walking && i === walk - 1 && t < WALK0 + (N - 1) * WALK_GAP;
    ctx.save(); ctx.translate(x, y); ctx.scale(pop * (hl ? 1.25 : 1), pop * (hl ? 1.25 : 1));
    ctx.fillStyle = GCOL(i); ctx.beginPath(); ctx.arc(0, 0, 15, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.bg0; ctx.lineWidth = 3; ctx.stroke();
    font(700, 15); text(String(i + 1), 0, 1, { color: C.bg0, align: 'center', base: 'middle' });
    ctx.restore();
  }
  // pair counter in the middle
  const pairs = (n * (n - 1)) / 2;
  withAlpha(1 - seg(t, 34.1, 34.6), () => {
    font(600, 64, DISPLAY); text(String(pairs), RING.x, RING.y - 8, { color: C.sun, align: 'center', base: 'middle' });
    font(700, 26); text('pairs', RING.x, RING.y + 40, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(500, 22); text(`${n} ${n === 1 ? 'guest' : 'guests'}`, RING.x, RING.y + 74, { color: C.inkDim, align: 'center', base: 'middle' });
  });
  // the "all different" bar
  withAlpha(eout(seg(t, 34.3, 34.9)), () => {
    const q = allDiff(walk), x0 = 132, x1 = 732, y = 676;
    font(700, 24); text('Chance that all birthdays differ', x0, y - 26, { color: C.inkSoft, base: 'middle' });
    font(600, 30, DISPLAY); text(pct(q), x1, y - 26, { color: C.sun, align: 'right', base: 'middle' });
    ctx.fillStyle = 'rgba(255,247,236,0.1)'; rrect(x0, y, x1 - x0, 28, 14); ctx.fill();
    // ease between consecutive values so the bar glides
    const f = seg(t, WALK0 + (walk - 2) * WALK_GAP, WALK0 + (walk - 2) * WALK_GAP + 0.25);
    const qs = walk > 1 ? lerp(allDiff(walk - 1), q, eout(f)) : q;
    ctx.fillStyle = C.sky; rrect(x0, y, (x1 - x0) * qs, 28, 14); ctx.fill();
    // 50% tick
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lerp(x0, x1, 0.5), y - 6); ctx.lineTo(lerp(x0, x1, 0.5), y + 34); ctx.stroke();
    font(500, 22); text('50%', lerp(x0, x1, 0.5), y + 50, { color: C.inkDim, align: 'center', base: 'middle' });
    // the factor for the newest guest
    if (walk > 1 && t < WALK0 + (N - 1) * WALK_GAP + 0.6) {
      ctx.fillStyle = 'rgba(18,8,42,0.88)'; rrect(RING.x - 120, RING.y - 34, 240, 96, 20); ctx.fill();
      font(600, 34, DISPLAY);
      text(`× ${366 - walk}/365`, RING.x, RING.y - 4, { color: C.sky, align: 'center', base: 'middle' });
      font(600, 22); text(`guest ${walk} misses all ${walk - 1}`, RING.x, RING.y + 36, { color: C.inkSoft, align: 'center', base: 'middle' });
    } else if (walk === N) {
      withAlpha(seg(t, WALK0 + (N - 1) * WALK_GAP + 0.6, WALK0 + (N - 1) * WALK_GAP + 1.1), () => {
        ctx.fillStyle = 'rgba(18,8,42,0.88)'; rrect(RING.x - 110, RING.y - 50, 220, 116, 22); ctx.fill();
        font(600, 56, DISPLAY); text(pct(allDiff(N)), RING.x, RING.y - 6, { color: C.sky, align: 'center', base: 'middle' });
        font(700, 24); text('no match', RING.x, RING.y + 40, { color: C.inkSoft, align: 'center', base: 'middle' });
      });
    }
  });
}

// ---------- D: the curve ----------
const PL = { x0: 132, x1: 748, y0: 648, y1: 228, n1: 80 };
const PX = (n) => lerp(PL.x0, PL.x1, n / PL.n1), PY = (p) => lerp(PL.y0, PL.y1, p);
function sceneD(t) {
  const grow = eio(seg(t, 44.5, 47.7)) * 23 + eio(seg(t, 48.8, 51.7)) * (70 - 23) + eio(seg(t, 53.3, 54.7)) * 10;
  // axes and grid
  ctx.strokeStyle = 'rgba(255,247,236,0.12)'; ctx.lineWidth = 1.5;
  for (const p of [0.25, 0.5, 0.75, 1]) { ctx.beginPath(); ctx.moveTo(PL.x0, PY(p)); ctx.lineTo(PL.x1, PY(p)); ctx.stroke(); }
  ctx.strokeStyle = C.inkDim; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(PL.x0, PL.y1 - 10); ctx.lineTo(PL.x0, PL.y0); ctx.lineTo(PL.x1, PL.y0); ctx.stroke();
  font(500, 22);
  for (const p of [0, 0.5, 1]) text(`${p * 100}%`, PL.x0 - 12, PY(p), { color: C.inkSoft, align: 'right', base: 'middle' });
  for (const n of [0, 20, 40, 60, 80]) text(String(n), PX(n), PL.y0 + 24, { color: C.inkSoft, align: 'center', base: 'middle' });
  text('people in the room', PL.x1, PL.y0 + 56, { color: C.inkDim, align: 'right', base: 'middle' });
  font(700, 24); text('Chance of a shared birthday', PL.x0, PL.y1 - 40, { color: C.inkSoft, base: 'middle' });
  // the curve, drawn up to `grow` people
  ctx.strokeStyle = C.coral; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  ctx.beginPath();
  const nMax = Math.max(1, grow);
  for (let n = 1; n <= nMax; n += 0.25) {
    const lo = Math.floor(n), f = n - lo, p = lerp(P(lo), P(Math.min(lo + 1, 365)), f);
    n === 1 ? ctx.moveTo(PX(n), PY(p)) : ctx.lineTo(PX(n), PY(p));
  }
  ctx.stroke();
  const pn = lerp(P(Math.floor(nMax)), P(Math.floor(nMax) + 1), nMax - Math.floor(nMax));
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(PX(nMax), PY(pn), 8, 0, TAU); ctx.fill();
  // markers
  const mark = (n, label, a, dx, dy) => withAlpha(a, () => {
    const x = PX(n), y = PY(P(n));
    ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,209,102,0.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, PL.y0); ctx.lineTo(x, y); ctx.lineTo(PL.x0, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
    font(600, 30, DISPLAY); text(label[0], x + dx, y + dy, { color: C.sun, align: dx < 0 ? 'right' : 'left', base: 'middle' });
    font(700, 22); text(label[1], x + dx, y + dy + 32, { color: C.inkSoft, align: dx < 0 ? 'right' : 'left', base: 'middle' });
  });
  mark(23, [pct(P(23)), '23 people'], seg(t, 47.7, 48.2), 22, 26);
  mark(70, [pct(P(70)), '70 people'], seg(t, 51.7, 52.2), -22, 40);
  withAlpha(seg(t, 44.9, 45.5), () => {
    font(500, 22); text('365 equally likely birthdays, no leap days', W / 2, 742, { color: C.inkDim, align: 'center', base: 'middle' });
  });
  withAlpha(seg(t, 55.7, 56.3), () => {
    font(500, 22); text('Source: Wikipedia, “Birthday problem” · parties simulated, fixed seed', W / 2, 902, { color: C.inkDim, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 800, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.coral, '~': C.sun } });
  }
}

Kit.scene({
  width: W, height: H, duration: 59.2,
  fonts: [
    { family: DISPLAY, file: 'Fredoka.woff2', weight: '300 700' },
    { family: TEXT, file: 'Nunito.woff2', weight: '400 800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    header();
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B, 0.4], [sceneC, T.C], [sceneD, T.D, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
