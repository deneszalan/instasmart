// Explainer for politics-quebec-first-past-the-post: in Quebec's election of 5 October 2026 the CAQ won 13.35% of
// the votes and no seats, while Québec solidaire won 12.42% and 9 seats. First past the post: each riding is a
// separate race, so spread-out votes win nothing and packed votes win seats. Look: a cream ballot paper with ruled
// lines, the 127 ridings as tiles, strip charts of one party's share in every riding. Party colours are neutral
// (not the parties' own): teal PQ, gold Liberals, violet Conservatives, rose QS, green CAQ. Archivo for numbers and
// labels, Crimson Pro for captions.
//
// Facts: Élections Québec, final results of the general election of 5 October 2026
// (electionsquebec.qc.ca/resultats-et-statistiques/resultats-generales/2026-10-05/, data file resultats.json,
// isResultatsFinaux true): 127 ridings; valid votes 4,284,358; turnout 66.93%. PQ 1,200,369 votes (28.02%) 60 seats;
// Liberals (PLQ) 1,037,953 (24.23%) 39; Conservatives (PCQ) 885,337 (20.66%) 19; Québec solidaire 532,114 (12.42%) 9;
// CAQ 572,040 (13.35%) 0. Per riding (same file): Saint-François PQ 26.03%, PLQ 23.86%, PCQ 17.73%, CAQ 16.67%,
// QS 14.52%; the winner had under 50% in 100 of 127 ridings. CAQ: second in 19 ridings, first in none; its best was
// Jonquière, 33.34% (PQ won with 36.34%). QS: won Gouin 62.61%, Mercier 59.20% and 7 more; fifth in 77 ridings.
// 2022 (same source, gen2022-10-03): 125 ridings; CAQ 40.98% and 90 seats; Conservatives 12.91% and 0 seats.
// The per-riding arrays below are the CAQ's, QS's and the winner's share in each of the 127 ridings, in the file's order.
// Computed here: seat shares, votes per seat, the counts above.
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: 127 tiles; CAQ 13.35% and 0 seats, QS 12.42% and 9.
//  B  9.2–23.0  One riding, one race: most votes wins, even at 26%; 100 of 127 winners under half.
//  C 23.0–32.0  The CAQ in every riding: spread thin, 19 seconds, no wins.
//  D 32.2–41.2  QS in every riding: packed, 9 wins, fifth in 77.
//  E 41.4–50.4  Seats don't follow votes; votes per seat.
//  F 50.6–55.0  2022: the Conservatives, 12.91% and no seats.
//  G 55.2–60.0  Same votes, different places.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#f5f1e6', bg2: '#ebe4d2', rule: 'rgba(60,80,90,0.07)', ink: '#1f2a30', soft: 'rgba(31,42,48,0.68)', faint: 'rgba(31,42,48,0.22)',
  empty: 'rgba(31,42,48,0.08)', red: '#c8452f', white: '#fffdf7',
};
const NUM = 'Archivo', SERIF = 'Crimson Pro';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const pc = (x, d = 2) => `${x.toFixed(d)}%`;
const fmt = (n) => Math.round(n).toLocaleString('en-US');

// ---------- official results (Élections Québec) ----------
const SEATS = 127;
const PARTIES = [
  { id: 'PQ', name: 'Parti Québécois', votes: 1200369, share: 28.0175, seats: 60, col: '#2b7a78' },
  { id: 'PLQ', name: 'Liberals', votes: 1037953, share: 24.2266, seats: 39, col: '#c8962e' },
  { id: 'PCQ', name: 'Conservatives', votes: 885337, share: 20.6644, seats: 19, col: '#7457a6' },
  { id: 'QS', name: 'Québec solidaire', votes: 532114, share: 12.4199, seats: 9, col: '#cc5a74' },
  { id: 'CAQ', name: 'Coalition Avenir Québec', votes: 572040, share: 13.3518, seats: 0, col: '#5b9a45' },
];
const P = Object.fromEntries(PARTIES.map((p) => [p.id, p]));
/** Short names for labels: the party's own name, or 'Liberals' and 'Conservatives'. */
const SHORT = { PQ: 'Parti Québécois', PLQ: 'Liberals', PCQ: 'Conservatives', QS: 'Québec solidaire', CAQ: 'CAQ' };
if (PARTIES.reduce((n, p) => n + p.seats, 0) !== SEATS) throw new Error('seats must add up to 127');
const SF = [['PQ', 26.03], ['PLQ', 23.86], ['PCQ', 17.73], ['CAQ', 16.67], ['QS', 14.52]]; // Saint-François
const CAQ = [12.46, 15.36, 5.48, 13.97, 11.45, 13.3, 6.93, 22.43, 19.22, 9.35, 12.3, 15.21, 18.62, 14.42, 21.62, 23.57, 9.38, 13.11, 8.72, 18.87, 17.06, 16.52, 11.79, 17.76, 13.51, 9.77, 16.46, 8.89, 11.46, 16.97, 14.98, 2.56, 14.38, 19.44, 14.36, 22.74, 8.86, 13.49, 10.69, 3.07, 20.65, 17.74, 4.36, 11.87, 12.13, 18.82, 4.34, 2.87, 9.36, 4.44, 8.18, 17.72, 33.34, 18.97, 15.17, 5.98, 9.17, 9.78, 16.6, 16.85, 2.45, 11.72, 15.64, 12.6, 17.13, 9.42, 13.05, 6.95, 13.74, 13.48, 6.72, 19.67, 15.57, 6.6, 8.11, 20.04, 3.25, 9.5, 14.39, 19.93, 12.79, 5.31, 4.88, 16.35, 2.86, 11.89, 11.24, 9.32, 18.66, 5.64, 17.84, 17.47, 17.31, 21.7, 21.49, 13.26, 17.71, 19.69, 3.37, 18.69, 6.83, 12.71, 18.71, 16.67, 4.36, 17.39, 16.9, 16.49, 4.65, 4.2, 12.83, 14.32, 10.86, 13.85, 15.48, 6.61, 14.91, 25.76, 10.35, 20.88, 12.83, 10.61, 17.82, 5.13, 4.77, 12.63, 3.36];
const QS = [9.42, 8.77, 19.63, 14.6, 6.96, 5.04, 3.37, 2.37, 6.35, 4.1, 8.14, 9.04, 11.51, 7.74, 8.53, 10.6, 16.9, 8.95, 20.26, 11.13, 6.7, 8.51, 9.38, 9.21, 8.8, 8.39, 9.85, 10.29, 5.41, 5.7, 8.69, 9.98, 11.11, 6.95, 6.5, 4.92, 9.77, 7.39, 7.78, 62.61, 9.12, 11.1, 52.01, 17.58, 5.6, 8.59, 4.44, 5.53, 35.67, 12.2, 14.11, 8.68, 7.28, 8.13, 6.81, 9.67, 7.11, 11.17, 8.84, 9.45, 50.66, 16.14, 6.83, 8.69, 7.88, 4.14, 7.95, 12.19, 6.89, 20.94, 10.59, 6.81, 8.47, 4.61, 30.09, 7.06, 59.2, 11.51, 7.75, 11.7, 8.67, 20.74, 6.76, 4.47, 17.77, 9.68, 7.08, 14.76, 12.71, 9.57, 6.53, 8.18, 7.35, 9.75, 6.79, 10.57, 15.04, 6.74, 8.8, 5.29, 39.22, 7.15, 14.12, 14.52, 36.43, 8.83, 10.43, 11.71, 16.54, 43.15, 11.59, 8.98, 27.22, 6.03, 14.98, 41.77, 9.44, 11.21, 5.4, 10.43, 8.36, 7.29, 11.62, 35.6, 28.6, 9.75, 15.37];
const WIN = [34.65, 49.59, 49.46, 40.05, 33.13, 40.55, 61.86, 58.19, 44.87, 63.84, 41.59, 43.45, 39.88, 33.69, 46.54, 35.3, 47.39, 32.47, 39.66, 34.28, 29.27, 37.46, 38.49, 38.99, 35.76, 47.88, 39.39, 45.17, 45.74, 42.34, 34.7, 60.74, 36.42, 30.67, 38.63, 47.14, 42.74, 58.81, 41.67, 62.61, 32.95, 32.17, 52.01, 42.5, 30.48, 35.51, 66.54, 73.21, 35.67, 64.06, 31.76, 45.04, 36.34, 39.85, 45.61, 58.86, 48.17, 50.05, 31.01, 41.09, 50.66, 36.38, 31.35, 38.98, 38.53, 54.39, 29.07, 52.62, 36.13, 33.34, 55.29, 31.96, 40.27, 67.77, 31.07, 34.29, 59.2, 44.32, 39.81, 29.62, 43.81, 50.94, 63.7, 41.21, 61.04, 37.8, 30.17, 42.89, 38.08, 61.36, 51.58, 38.61, 50.72, 36.21, 41.26, 29.23, 43.35, 35.29, 65.05, 36.53, 39.22, 44.07, 36.62, 26.03, 37.2, 39.07, 35.62, 39.5, 54.45, 43.15, 37.48, 41.59, 27.22, 35.51, 32.11, 41.77, 39.51, 27.1, 39.23, 27.51, 36.97, 46.75, 39.9, 37.77, 42.45, 42.76, 59.89];
const UNDER_HALF = WIN.filter((w) => w < 50).length; // 100
const CAQ_WINS = CAQ.filter((s, i) => s >= WIN[i]).length; // 0
const QS_WINS = QS.filter((s, i) => s >= WIN[i]).length; // 9
const CAQ_BEST = Math.max(...CAQ); // 33.34, Jonquière
const QS_TOP = [...QS].sort((a, b) => b - a);
if (UNDER_HALF !== 100 || CAQ_WINS !== 0 || QS_WINS !== 9) throw new Error('riding data does not match the totals');
const seatShare = (p) => (100 * p.seats) / SEATS;
const perSeat = (p) => p.votes / p.seats;

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, `On 5 October 2026, Quebec elected the ${SEATS} members of its National Assembly.`],
  [4.8, 9.0, `The ~Coalition Avenir Québec~ (CAQ) won ${pc(P.CAQ.share)} and no seats; *Québec solidaire*, ${pc(P.QS.share)} and ${P.QS.seats}.`],
  [9.2, 13.6, 'Why? Quebec votes by ^first past the post^: each riding, or district, is its own race.'],
  [13.8, 18.2, 'The candidate with the most votes in a riding wins its seat, even with far less than half.'],
  [18.4, 22.8, `In the riding of Saint-François the winner had 26.03%. In ${UNDER_HALF} of ${SEATS}, the winner had under half.`],
  [23.0, 27.4, `The ~CAQ~’s votes were spread thin. Its best riding was Jonquière, with ${pc(CAQ_BEST)}.`],
  [27.6, 32.0, 'It came second in 19 ridings and first in none. Second place wins nothing.'],
  [32.2, 36.6, `*Québec solidaire*’s votes were packed into city ridings: ${pc(QS_TOP[0])} in Gouin, ${pc(QS_TOP[1])} in Mercier.`],
  [36.8, 41.2, `It came fifth in 77 ridings, but won ${QS_WINS} where its voters live close together.`],
  [41.4, 45.8, `So seats don’t follow votes: the Parti Québécois won ${pc(P.PQ.share)} of the votes and ${Math.round(seatShare(P.PQ))}% of the seats.`],
  [46.0, 50.4, `A Parti Québécois seat took about ${fmt(Math.round(perSeat(P.PQ) / 1000) * 1000)} votes, a Québec solidaire seat about ${fmt(Math.round(perSeat(P.QS) / 1000) * 1000)}.`],
  [50.6, 55.0, 'In 2022 it was the Conservative Party of Quebec: 12.91% of the votes, and no seats.'],
  [55.2, 60.0, 'Under first past the post, it matters not just how many votes you win, but ^where^.'],
];

// ---------- background: ballot paper ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W, H);
  lg.addColorStop(0, C.bg); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.rule; g.lineWidth = 2;
  for (let y = 60; y < H; y += 44) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.strokeStyle = 'rgba(200,69,47,0.12)'; g.lineWidth = 3; g.beginPath(); g.moveTo(64, 0); g.lineTo(64, H); g.stroke();
  let s = 5; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(90,70,40,${rnd() * 0.035})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd(), 1 + rnd()); }
}

// ---------- the 127 ridings as tiles, grouped by winner ----------
const GRID = { cols: 16, x: 80, y: 196, s: 44, g: 5 };
const TILE_WINNER = PARTIES.flatMap((p) => Array(p.seats).fill(p));
const tileXY = (i) => ({ x: GRID.x + (i % GRID.cols) * GRID.s, y: GRID.y + Math.floor(i / GRID.cols) * GRID.s });
function tiles(fill, colour = (i) => TILE_WINNER[i].col) {
  for (let i = 0; i < SEATS; i++) {
    const { x, y } = tileXY(i), on = seg(fill, (i / SEATS) * 0.75, (i / SEATS) * 0.75 + 0.25);
    ctx.fillStyle = C.empty; k.rrect(x, y, GRID.s - GRID.g, GRID.s - GRID.g, 6); ctx.fill();
    if (on > 0) A(on, () => { ctx.fillStyle = colour(i); k.rrect(x, y, GRID.s - GRID.g, GRID.s - GRID.g, 6); ctx.fill(); });
  }
}

// ---------- scenes ----------
const CX = W / 2;
function header(s) { font(600, 26); text(s, CX, 150, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' }); }

function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.6);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => header('QUÉBEC · 5 OCTOBER 2026 · 127 SEATS'));
    tiles(eio(seg(t, 0.8, 3.6)));
    // legend, then the two cards
    A(span(t, 2.6, 5.2, 0.5, 0.4), () => {
      font(600, 24);
      const rows = [PARTIES.slice(0, 3), PARTIES.slice(3)];
      rows.forEach((row, r) => {
        const items = row.map((p) => `${p.name} ${p.seats}`);
        const widths = items.map((s) => 30 + ctx.measureText(s).width);
        let x = CX - (widths.reduce((a, b) => a + b, 0) + 36 * (items.length - 1)) / 2;
        items.forEach((s, i) => {
          const y = 596 + r * 44;
          ctx.fillStyle = row[i].col; k.rrect(x, y - 11, 22, 22, 4); ctx.fill();
          text(s, x + 30, y, { base: 'middle' }); x += widths[i] + 36;
        });
      });
    });
    const cards = [[P.CAQ, 226], [P.QS, 638]];
    cards.forEach(([p, x], i) => {
      const g = eout(seg(t, 5.0 + i * 0.4, 5.7 + i * 0.4));
      A(g, () => {
        const y = 584, w = 384, h = 176;
        ctx.fillStyle = C.white; k.rrect(x - w / 2, y, w, h, 16); ctx.fill();
        ctx.strokeStyle = p.col; ctx.lineWidth = 4; k.rrect(x - w / 2, y, w, h, 16); ctx.stroke();
        font(700, 27); text(p.name, x, y + 40, { align: 'center', base: 'middle', color: p.col });
        font(800, 52); text(pc(p.share), x - 64, y + 100, { align: 'center', base: 'middle' });
        font(500, 22); text('of the votes', x - 64, y + 142, { align: 'center', base: 'middle', color: C.soft });
        font(800, 52); text(`${p.seats}`, x + 122, y + 100, { align: 'center', base: 'middle', color: p.seats ? p.col : C.red });
        font(500, 22); text('seats', x + 122, y + 142, { align: 'center', base: 'middle', color: C.soft });
      });
    });
    // highlight the nine QS tiles, and show there are no CAQ tiles
    A(span(t, 6.0, 9.2), () => {
      for (let i = 0; i < SEATS; i++) if (TILE_WINNER[i].id === 'QS') {
        const { x, y } = tileXY(i); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; k.rrect(x - 2, y - 2, GRID.s - GRID.g + 4, GRID.s - GRID.g + 4, 7); ctx.stroke();
      }
    });
  });
}

// one riding's race: bars from 0 to 60%
const RACE = { L: 270, R: 790, y: 226, row: 84, max: 60 };
const rx = (v) => lerp(RACE.L, RACE.R, v / RACE.max);
function sceneRace(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const race = 1 - seg(t, 18.2, 18.8);
    A(race, () => {
      header('SAINT-FRANÇOIS · ONE OF 127 RACES');
      SF.forEach(([id, v], i) => {
        const y = RACE.y + i * RACE.row, g = eout(seg(t, 9.6 + i * 0.2, 11.2 + i * 0.2)), p = P[id];
        ctx.fillStyle = p.col; k.rrect(RACE.L, y, Math.max(1, rx(v * g) - RACE.L), 56, 6); ctx.fill();
        const won = i === 0 && t > 14.6;
        if (won) A(seg(t, 14.6, 15.2), () => { ctx.fillStyle = p.col; k.rrect(36, y + 2, RACE.L - 48, 52, 26); ctx.fill(); });
        font(600, won ? 25 : 28); text(SHORT[p.id], won ? (36 + RACE.L - 12) / 2 : RACE.L - 16, y + 28, { align: won ? 'center' : 'right', base: 'middle', color: won ? C.white : p.col });
        A(seg(t, 11.0, 11.6), () => { font(700, 28); text(pc(v), rx(v) + 12, y + 28, { base: 'middle' }); });
      });
      // 50% line
      A(seg(t, 13.8, 14.6), () => {
        const x = rx(50);
        ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.setLineDash([9, 7]);
        ctx.beginPath(); ctx.moveTo(x, RACE.y - 26); ctx.lineTo(x, RACE.y + 4 * RACE.row + 76); ctx.stroke(); ctx.setLineDash([]);
        font(700, 26); text('half', x, RACE.y - 44, { align: 'center', base: 'middle', color: C.red });
      });
      A(seg(t, 15.6, 16.4), () => {
        font(500, 28); text('The other 74% of the votes here elected no one.', CX, 690, { align: 'center', base: 'middle', color: C.soft });
      });
    });
    // all ridings: winners under half
    A(seg(t, 18.6, 19.2), () => {
      header('THE WINNER’S SHARE IN EACH RIDING');
      tiles(1, (i) => (WIN[i] < 50 ? C.red : C.faint));
      A(seg(t, 19.4, 20.0), () => {
        ctx.fillStyle = C.red; k.rrect(150, 600, 26, 26, 5); ctx.fill();
        font(600, 30); text(`under half: ${UNDER_HALF}`, 188, 614, { base: 'middle' });
        ctx.fillStyle = C.faint; k.rrect(480, 600, 26, 26, 5); ctx.fill();
        text(`half or more: ${SEATS - UNDER_HALF}`, 518, 614, { base: 'middle' });
      });
    });
  });
}

// strip chart: one bar per riding, the party's share, with the winner's share as a tick
const STRIP = { L: 96, R: 800, base: 640, top: 236, max: 75 };
const sy = (v) => lerp(STRIP.base, STRIP.top, v / STRIP.max);
function strip(t0, shares, col, g, o = {}) {
  const order = shares.map((s, i) => i).sort((a, b) => shares[b] - shares[a]);
  const bw = (STRIP.R - STRIP.L) / SEATS;
  // axis
  ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5;
  for (const v of [25, 50, 75]) { ctx.beginPath(); ctx.moveTo(STRIP.L, sy(v)); ctx.lineTo(STRIP.R, sy(v)); ctx.stroke(); font(500, 20); text(`${v}%`, STRIP.L - 8, sy(v), { align: 'right', base: 'middle', color: C.soft }); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(STRIP.L, STRIP.base); ctx.lineTo(STRIP.R, STRIP.base); ctx.stroke();
  font(500, 22); text('127 ridings, from its best to its worst', (STRIP.L + STRIP.R) / 2, STRIP.base + 24, { align: 'center', base: 'middle', color: C.soft });
  order.forEach((i, j) => {
    const x = STRIP.L + j * bw, gg = eout(clamp(g * 1.6 - (j / SEATS) * 0.6)), s = shares[i], won = s >= WIN[i];
    ctx.fillStyle = col; ctx.globalAlpha = won || !o.dimLosers ? 1 : 0.45;
    ctx.fillRect(x + 0.6, sy(s * gg), bw - 1.2, STRIP.base - sy(s * gg)); ctx.globalAlpha = 1;
    // the winner's share in that riding
    if (o.ticks) A(o.ticks, () => { ctx.fillStyle = C.ink; ctx.fillRect(x, sy(WIN[i]) - 1.5, bw, 3); });
  });
  return { order, bw };
}

/** A label on a cream card, with a leader line from (x, y) when dx or dy moves it away. */
function tag(s, x, y, dx, dy) {
  font(600, 26); const w = ctx.measureText(s).width + 24, lx = x + dx, ly = y + dy;
  if (dx || dy > 0) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx, ly); ctx.stroke(); }
  const bx0 = dx ? lx : lx - w / 2;
  ctx.fillStyle = C.white; k.rrect(bx0, ly - 20, w, 40, 8); ctx.fill();
  ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.stroke();
  text(s, bx0 + 12, ly + 1, { base: 'middle' });
}

function sceneCAQ(t) {
  const a = span(t, 23.0, 32.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('THE CAQ’S SHARE IN EACH OF 127 RIDINGS');
    const { order, bw } = strip(23.2, CAQ, P.CAQ.col, seg(t, 23.4, 25.6), { ticks: seg(t, 27.6, 28.6) });
    // Jonquière, its best
    A(seg(t, 25.4, 26.0), () => {
      const x = STRIP.L + bw / 2;
      tag(`best: Jonquière, ${pc(CAQ_BEST)}`, x, sy(CAQ_BEST), 70, -90);
    });
    A(seg(t, 27.8, 28.6), () => {
      ctx.fillStyle = C.ink; ctx.fillRect(470, 708, 34, 5);
      font(500, 26); text('the winner’s share there', 516, 710, { base: 'middle', color: C.soft });
      font(700, 32); text('19 × 2nd · 0 × 1st', STRIP.L, 710, { base: 'middle', color: P.CAQ.col });
    });
  });
}

function sceneQS(t) {
  const a = span(t, 32.2, 41.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('QUÉBEC SOLIDAIRE’S SHARE IN EACH RIDING');
    const { bw } = strip(32.4, QS, P.QS.col, seg(t, 32.6, 34.8), { ticks: 1, dimLosers: t > 35.0 });
    A(seg(t, 34.6, 35.2), () => {
      tag(`Gouin ${pc(QS_TOP[0])}`, STRIP.L + bw / 2, sy(QS_TOP[0]), 90, -40);
      tag(`Mercier ${pc(QS_TOP[1])}`, STRIP.L + 1.5 * bw, sy(QS_TOP[1]), 250, 10);
    });
    A(seg(t, 36.8, 37.6), () => {
      // the long tail: fifth place
      const x0 = STRIP.L + 50 * bw, x1 = STRIP.R;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x0, sy(24)); ctx.lineTo(x0, sy(26)); ctx.lineTo(x1, sy(26)); ctx.lineTo(x1, sy(24)); ctx.stroke();
      tag('5th place in 77 ridings', (x0 + x1) / 2, sy(26), 0, -30);
      font(700, 32); text(`${QS_WINS} wins`, STRIP.L, 710, { base: 'middle', color: P.QS.col });
      font(500, 26); text('bright bars: ridings it won', STRIP.L + 150, 710, { base: 'middle', color: C.soft });
    });
  });
}

function sceneSeats(t) {
  const a = span(t, 41.4, 50.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const name = (p) => SHORT[p.id];
    const L = 280, R = 700;
    // 41.4–46: share of the votes (light) and of the seats (solid)
    A(1 - seg(t, 45.8, 46.3), () => {
      header('SHARE OF THE VOTES AND OF THE SEATS');
      const X = (v) => lerp(L, R, v / 50);
      font(500, 24);
      ctx.fillStyle = C.ink; ctx.globalAlpha = 0.3; ctx.fillRect(L, 204, 26, 16); ctx.globalAlpha = 1; text('votes', L + 34, 212, { base: 'middle', color: C.soft });
      ctx.fillRect(L + 140, 204, 26, 16); text('seats', L + 174, 212, { base: 'middle', color: C.soft });
      PARTIES.forEach((p, i) => {
        const y = 250 + i * 84, g = eout(seg(t, 41.6 + i * 0.15, 43.0 + i * 0.15));
        font(600, 28); text(name(p), L - 18, y + 28, { align: 'right', base: 'middle', color: p.col });
        ctx.fillStyle = p.col; ctx.globalAlpha = 0.35; ctx.fillRect(L, y, (X(p.share) - L) * g, 26); ctx.globalAlpha = 1;
        ctx.fillRect(L, y + 30, Math.max(3, (X(seatShare(p)) - L) * g), 26);
        A(seg(t, 43.0, 43.6), () => {
          font(600, 22); text(pc(p.share, 1), X(p.share) + 8, y + 13, { base: 'middle', color: C.soft });
          font(700, 22); text(pc(seatShare(p), 1), Math.max(X(seatShare(p)), L + 3) + 8, y + 44, { base: 'middle' });
        });
      });
    });
    // 46–50.6: votes per seat won
    A(seg(t, 46.0, 46.6), () => {
      header('VOTES FOR EACH SEAT WON');
      const X = (v) => lerp(L, R - 40, v / 60000);
      PARTIES.forEach((p, i) => {
        const y = 250 + i * 84, g = eout(seg(t, 46.2 + i * 0.15, 47.4 + i * 0.15));
        font(600, 28); text(name(p), L - 18, y + 28, { align: 'right', base: 'middle', color: p.col });
        if (!p.seats) { A(seg(t, 47.6, 48.2), () => { font(700, 28); text(`${fmt(p.votes)} votes, no seat`, L, y + 28, { base: 'middle', color: C.red }); }); return; }
        ctx.fillStyle = p.col; k.rrect(L, y + 4, (X(perSeat(p)) - L) * g, 48, 6); ctx.fill();
        A(seg(t, 47.2, 47.8), () => { font(700, 26); text(fmt(perSeat(p)), X(perSeat(p)) + 10, y + 28, { base: 'middle' }); });
      });
    });
  });
}

function scene2022(t) {
  const a = span(t, 50.6, 55.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('FOUR YEARS EARLIER');
    const cards = [
      ['3 October 2022 · 125 seats', [['Conservatives', 12.91, 0, P.PCQ.col], ['CAQ', 40.98, 90, P.CAQ.col]]],
      ['5 October 2026 · 127 seats', [['Conservatives', P.PCQ.share, P.PCQ.seats, P.PCQ.col], ['CAQ', P.CAQ.share, P.CAQ.seats, P.CAQ.col]]],
    ];
    cards.forEach(([title, rows], i) => {
      const y = 210 + i * 250, g = eout(seg(t, 50.8 + i * 0.8, 51.5 + i * 0.8));
      A(g, () => {
        ctx.fillStyle = C.white; k.rrect(90, y, 684, 220, 16); ctx.fill();
        font(600, 26); text(title, 124, y + 40, { base: 'middle', color: C.soft });
        rows.forEach(([n, v, s, col], j) => {
          const yy = y + 104 + j * 66;
          font(700, 34); text(n, 124, yy, { base: 'middle', color: col });
          font(700, 34); text(pc(v), 540, yy, { align: 'right', base: 'middle' });
          text(`${s} seats`, 744, yy, { align: 'right', base: 'middle', color: s ? C.ink : C.red });
        });
      });
    });
  });
}

function sceneEnd(t) {
  const a = eout(seg(t, 55.2, 56.0));
  if (a <= 0) return;
  A(a, () => {
    header('SAME VOTES, DIFFERENT PLACES');
    // 12 dots of voters: one in each of 12 ridings, or four in each of 3 (where four is enough to win)
    const s = 74, gap = 12;
    for (const [side, x0] of [[0, 72], [1, 476]]) {
      for (let r = 0; r < 12; r++) {
        const x = x0 + (r % 4) * (s + gap), y = 226 + Math.floor(r / 4) * (s + gap);
        const mine = side === 0 ? 1 : r < 3 ? 4 : 0, p = eio(seg(t, 56.0 + r * 0.05, 57.0 + r * 0.05)), win = mine >= 4 && t > 57.4;
        ctx.fillStyle = C.empty; k.rrect(x, y, s, s, 10); ctx.fill();
        if (win) A(seg(t, 57.4, 57.9), () => { ctx.fillStyle = P.QS.col; k.rrect(x, y, s, s, 10); ctx.fill(); });
        for (let d = 0; d < mine; d++) {
          const dx = x + 22 + (d % 2) * 30, dy = y + 22 + Math.floor(d / 2) * 30;
          A(p, () => { ctx.fillStyle = win ? C.white : P.QS.col; ctx.beginPath(); ctx.arc(dx, dy, 11, 0, Math.PI * 2); ctx.fill(); });
        }
      }
      A(seg(t, 57.6, 58.2), () => { font(700, 32); text(side === 0 ? 'spread: 0 seats' : 'packed: 3 seats', x0 + 2 * (s + gap) - gap / 2, 510, { align: 'center', base: 'middle', color: side === 0 ? C.red : P.QS.col }); });
    }
    font(500, 26); text('12 groups of voters each time; 4 groups win a riding', CX, 580, { align: 'center', base: 'middle', color: C.soft });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [NUM, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneRace(t);
    sceneCAQ(t);
    sceneQS(t);
    sceneSeats(t);
    scene2022(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 46, weight: 700, family: SERIF, ink: C.ink, marks: { '~': P.CAQ.col, '*': P.QS.col, '^': C.red } });
  },
});
