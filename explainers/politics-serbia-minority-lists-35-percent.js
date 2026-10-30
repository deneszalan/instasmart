// Explainer for politics-serbia-minority-lists-35-percent: in Serbia's snap parliamentary election of
// 25 October 2026, the 250 seats were shared by the d'Hondt method in one nationwide constituency, with a 3%
// threshold that lists of national minorities don't have to clear, plus a 35% bonus on their quotients.
// So a list with 38,286 votes won nothing while one with 12,348 won a seat. Look: a midnight-blue chamber
// with a fan of 250 seats, white and red bars (the colours of the flag) and a gold cut line.
// Oswald for the numbers and headings, Source Sans 3 for the captions.
//
// Facts:
// - Republic Electoral Commission (RIK) preliminary results from 8,136 of 8,392 polling stations, published
//   26 October 2026 (reported by Večernje novosti, "Najnoviji presek: oglasio se RIK, obrađeno 8.136 biračkih
//   mesta"): 4,269,403 voters voted (68.81%). Votes: Studentska lista 2,246,423 (52.65%); Aleksandar Vučić –
//   Ujedinjena Srbija 1,673,241 (39.22%); Ivica Dačić – Faktor stabilnosti 92,532 (2.17%); Autentična desnica
//   38,286 (0.9%); Savez vojvođanskih Mađara 34,755 (0.81%); Albanska koalicija 27,664 (0.65%); Rasim Ljajić –
//   Ljudski 20,305 (0.48%); Bogoljub Karić – PSS 19,508 (0.46%); SDA Sandžaka 12,348 (0.29%); Evropska Srbija
//   12,041 (0.28%); Usame Zukorlić – SPP 11,605 (0.27%); the rest under 7,000 each.
// - RIK's later preliminary figures (8,187 stations, reported by Kosovo Online, 27 October): Student List
//   2,267,615 (52.71%) and 140 seats; United Serbia 1,685,022 (39.17%) and 104 seats; Dačić 93,280, below the
//   threshold; four national-minority lists share six seats. Final results were still to come.
// - Law on the Election of Members of Parliament, art. 140: a national-minority list takes part in the
//   distribution of seats "also when it has won less than 3% of the votes cast", and in the highest-quotient
//   allocation "the quotients of national minority electoral lists that have won less than 3% of the votes cast
//   shall be increased by 35%". National Assembly website: 250 MPs, one electoral unit, 3% of the voters who
//   voted, seats by the method of highest quotients (d'Hondt): each list's votes divided by 1 to 250.
// - Reuters (25/26 October): Aleksandar Vučić conceded defeat to the student-led list.
// Computed here: the 3% line, every d'Hondt quotient and the seat count from the 8,136-station table (it gives
// 140 / 104 / 2 + 2 + 1 + 1, matching the commission's 140 / 104 / 6); the lists marked as minority lists are the
// four the count gives seats to, plus Zukorlić's (its seat count is 0 either way).
//
// Scene plan (60 s). Captions are centred at y = 846; everything important stays above y = 770.
//  A  0.0– 9.0  25 October 2026: a fan of 250 seats fills.
//  B  9.2–18.2  The count as bars; the 3% line.
//  C 18.4–27.4  Dačić and the Authentic Right fall short; minority lists pass under the line.
//  D 27.6–45.8  d'Hondt ladders; the price of the last seat; the ×1.35 bonus lifts SDA Sandžak over it.
//  E 46.0–55.0  The seats fill: 140, 104, and 6 for the minority lists.
//  F 55.2–60.0  38,286 votes and no seat; 12,348 votes and a seat.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0c1a3a', bg2: '#050b1c', ink: '#f4f6fb', soft: 'rgba(244,246,251,0.72)', faint: 'rgba(244,246,251,0.24)', line: 'rgba(244,246,251,0.14)',
  white: '#f4f6fb', red: '#e0484f', redSoft: 'rgba(224,72,79,0.35)', blue: '#5b8def', gold: '#f2c14e', green: '#7fd8a4', grey: 'rgba(244,246,251,0.30)',
  panel: 'rgba(255,255,255,0.07)',
};
const NUM = 'Oswald', TXT = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the count (RIK, 8,136 of 8,392 polling stations, 26 October 2026) ----------
const VOTED = 4269403, SEATS = 250, BONUS = 1.35;
const LISTS = [
  { name: 'Student List', votes: 2246423, min: false, col: C.white },
  { name: 'United Serbia', votes: 1673241, min: false, col: C.red },
  { name: 'Dačić – Stability Factor', votes: 92532, min: false, col: C.grey },
  { name: 'Authentic Right', votes: 38286, min: false, col: C.grey },
  { name: 'Hungarians (SVM)', votes: 34755, min: true, col: C.green },
  { name: 'Albanian Coalition', votes: 27664, min: true, col: C.green },
  { name: 'Ljajić – Humanly', votes: 20305, min: true, col: C.green },
  { name: 'Karić – PSS', votes: 19508, min: false, col: C.grey },
  { name: 'SDA Sandžak', votes: 12348, min: true, col: C.green },
  { name: 'European Serbia', votes: 12041, min: false, col: C.grey },
  { name: 'Zukorlić – SPP', votes: 11605, min: true, col: C.green },
];
const THRESHOLD = 0.03 * VOTED; // 128,082 votes
const passes = (l) => l.min || l.votes >= THRESHOLD;
/** The number a list's quotients are built from: its votes, times 1.35 for a minority list under 3%. */
const base = (l) => (l.min && l.votes < THRESHOLD ? l.votes * BONUS : l.votes);
/** d'Hondt: the 250 highest quotients votes/1, votes/2, … among the lists that take part. */
function dhondt(lists, seats) {
  const q = [];
  lists.forEach((l, i) => { if (!passes(l)) return; for (let d = 1; d <= seats; d++) q.push([base(l) / d, i, d]); });
  q.sort((a, b) => b[0] - a[0]);
  const won = lists.map(() => 0);
  for (const [, i] of q.slice(0, seats)) won[i]++;
  return { won, last: q[seats - 1][0], next: q[seats][0] };
}
const R = dhondt(LISTS, SEATS);
if (R.won.reduce((a, b) => a + b, 0) !== SEATS) throw new Error('seats do not add up');
if (R.won[0] !== 140 || R.won[1] !== 104) throw new Error(`expected 140 / 104, got ${R.won[0]} / ${R.won[1]}`);
const MINORITY_SEATS = LISTS.reduce((s, l, i) => s + (l.min ? R.won[i] : 0), 0); // 6
if (MINORITY_SEATS !== 6) throw new Error(`expected 6 minority seats, got ${MINORITY_SEATS}`);
const SDA = LISTS.findIndex((l) => l.name === 'SDA Sandžak'), AR = 3, DAC = 2, SVM = 4, ALB = 5, LJA = 6;
const SDA_BOOSTED = LISTS[SDA].votes * BONUS; // 16,670

const CUES = [
  [0.4, 4.6, 'On 25 October 2026, Serbia elected the 250 members of its National Assembly.'],
  [4.8, 9.0, 'The whole country is one constituency, and lists win seats by the d’Hondt method.'],
  [9.2, 13.6, 'Preliminary count: the *Student List* 52.7%, ~United Serbia~ 39.2%. Then a long tail.'],
  [13.8, 18.2, `To share in the seats, a list needs ^3%^ of the votes cast: about ${fmt(THRESHOLD / 1000)},000 votes.`],
  [18.4, 22.8, `Ivica Dačić’s list got ${fmt(LISTS[DAC].votes)}: short of the line, no seat. The Authentic Right: ${fmt(LISTS[AR].votes)}, none.`],
  [23.0, 27.4, 'But lists of ^national minorities^ skip the line, however few votes they have.'],
  [27.6, 32.0, 'd’Hondt: divide each list’s votes by 1, 2, 3… The 250 biggest numbers take the seats.'],
  [32.2, 36.6, `Here the 250th number is ${fmt(R.last)}: that is the price of the last seat.`],
  [36.8, 41.2, 'A minority list under 3% gets a bonus too: its numbers are multiplied by ^1.35^.'],
  [41.4, 45.8, `SDA Sandžak’s ${fmt(LISTS[SDA].votes)} votes become ${fmt(SDA_BOOSTED)}: just over the price of a seat.`],
  [46.0, 50.4, `By this count, four minority lists share ${MINORITY_SEATS} seats: Hungarians ${R.won[SVM]}, Albanians ${R.won[ALB]}, Ljajić ${R.won[LJA]}, SDA ${R.won[SDA]}.`],
  [50.6, 55.0, `That leaves ${SEATS - MINORITY_SEATS}: the *Student List* ${R.won[0]}, ~United Serbia~ ${R.won[1]}, as the commission counted.`],
  [55.2, 60.0, `So ${fmt(LISTS[AR].votes)} votes won nothing and ${fmt(LISTS[SDA].votes)} won a seat: the rules decide, not just the count.`],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // the flag's three bands, faint, at the top
  g.fillStyle = 'rgba(224,72,79,0.45)'; g.fillRect(0, 0, W, 28);
  g.fillStyle = 'rgba(91,141,239,0.40)'; g.fillRect(0, 28, W, 28);
  g.fillStyle = 'rgba(244,246,251,0.18)'; g.fillRect(0, 56, W, 28);
  let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(200,215,255,${rnd() * 0.035})`; g.fillRect(rnd() * W, 90 + rnd() * (H - 90), 1 + rnd(), 1 + rnd()); }
}

// ---------- the chamber: 250 seats in a fan ----------
const SEAT = []; // [x, y] for 250 seats, in rows from the inside out, left to right
{
  const rows = [26, 32, 38, 44, 50, 60];
  const cx = CX, cy = 420;
  let n = 0;
  rows.forEach((count, r) => {
    const rad = 150 + r * 36;
    for (let i = 0; i < count && n < SEATS; i++) {
      const a = Math.PI + (Math.PI * (i + 0.5)) / count;
      SEAT.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a) * 0.72]);
      n++;
    }
  });
}
/** Seats in party order: the Student List from the left, United Serbia from the right, minorities in between. */
const SEAT_ORDER = (() => {
  const idx = SEAT.map((_, i) => i).sort((a, b) => Math.atan2(SEAT[a][1] - 420, SEAT[a][0] - CX) - Math.atan2(SEAT[b][1] - 420, SEAT[b][0] - CX));
  // angles run from -π (left) through -π/2 (top) to 0 (right): sort by angle gives left to right
  return idx;
})();
function chamber(t, fillA, colourA) {
  // fillA: how many seats have appeared (0..1); colourA: how far the colouring has spread from both ends
  const stud = R.won[0], uni = R.won[1];
  SEAT_ORDER.forEach((si, p) => {
    const g = eout(seg(fillA, p / SEATS, p / SEATS + 0.08));
    if (g <= 0) return;
    const [x, y] = SEAT[si];
    let col = C.faint;
    if (colourA > 0) {
      const fromLeft = p < stud, fromRight = p >= SEATS - uni;
      const dist = fromLeft ? p / stud : fromRight ? (SEATS - 1 - p) / uni : 1;
      const lit = seg(colourA, dist * 0.8, dist * 0.8 + 0.2);
      if (fromLeft) col = lit > 0.5 ? C.white : C.faint;
      else if (fromRight) col = lit > 0.5 ? C.red : C.faint;
      else col = colourA > 0.9 ? C.green : C.faint;
    }
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 7.5 * g, 0, 7); ctx.fill();
  });
}

// ---------- A: the chamber fills ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => {
      font(500, 26); text('SERBIA · NATIONAL ASSEMBLY · 25 OCTOBER 2026', CX, 140, { align: 'center', color: C.soft, spacing: '3px' });
    });
    chamber(t, seg(t, 0.6, 4.4), 0);
    A(eout(seg(t, 3.2, 4.0)), () => { font(700, 64); text('250 seats', CX, 480, { align: 'center', color: C.gold }); });
    A(eout(seg(t, 5.0, 5.8)), () => {
      font(500, 30, TXT); text('one constituency · the d’Hondt method', CX, 548, { align: 'center', color: C.soft });
      font(500, 26, TXT); text('seats in proportion to votes, by the highest quotients', CX, 592, { align: 'center', color: C.faint });
    });
  });
}

// ---------- B + C: the bars and the 3% line ----------
const BAR = { x0: 70, x1: 794, bx: 300, bw: 200, y0: 196, rh: 40 };
const SHOW = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // lists drawn as bars (top nine)
const barW = (v) => BAR.bw * Math.pow(v / LISTS[0].votes, 0.5); // square-root scale, so the tail is visible
function sceneBars(t) {
  const a = span(t, 9.2, 27.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 24); text('PRELIMINARY COUNT · 8,136 OF 8,392 POLLING STATIONS', CX, 140, { align: 'center', color: C.soft, spacing: '2px' });
    font(400, 20, TXT); text('bars on a square-root scale', BAR.x1, 170, { align: 'right', color: C.faint });
    const lineX = BAR.bx + barW(THRESHOLD);
    SHOW.forEach((li, i) => {
      const l = LISTS[li];
      const y = BAR.y0 + i * (BAR.rh + 12);
      const g = eout(seg(t, 9.4 + i * 0.22, 10.2 + i * 0.22));
      if (g <= 0) return;
      const fail = !passes(l), lit = seg(t, 18.6, 19.2);
      const dim = fail && lit > 0 ? 1 - 0.6 * lit : 1;
      A(g * dim, () => {
        font(500, 24); text(l.name, BAR.x0, y + BAR.rh / 2, { color: l.min && t > 23.2 ? C.green : C.ink });
        ctx.fillStyle = l.col; k.rrect(BAR.bx, y + 6, Math.max(4, barW(l.votes) * g), BAR.rh - 12, 5); ctx.fill();
        font(600, 24); text(`${fmt(l.votes)} · ${(100 * l.votes / VOTED).toFixed(l.votes > 1e6 ? 1 : 2)}%`, BAR.bx + BAR.bw + 16, y + BAR.rh / 2, { color: C.soft });
      });
      // the cross for lists that fall short, the hop for minority lists
      if (fail && t > 18.6) A(seg(t, 18.8 + i * 0.1, 19.4 + i * 0.1), () => { font(700, 30); text('no seat', BAR.x1, y + BAR.rh / 2, { align: 'right', color: C.red }); });
      if (l.min && t > 23.2) A(seg(t, 23.4 + i * 0.12, 24.0 + i * 0.12), () => { font(700, 26); text('minority list · takes part', BAR.x1, y + BAR.rh / 2, { align: 'right', color: C.green }); });
    });
    // the 3% line
    A(seg(t, 13.9, 14.5), () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(lineX, BAR.y0 - 14); ctx.lineTo(lineX, BAR.y0 + SHOW.length * (BAR.rh + 12) - 4); ctx.stroke(); ctx.setLineDash([]);
      font(700, 26); text(`3% = ${fmt(THRESHOLD)} votes`, lineX + 10, BAR.y0 + SHOW.length * (BAR.rh + 12) + 14, { color: C.gold });
    });
  });
}

// ---------- D: the ladders of quotients ----------
const LAD = { y0: 216, y1: 690, lo: 15400, hi: 17000 }; // the window of quotients near the cut
const qy = (q) => lerp(LAD.y1, LAD.y0, clamp((q - LAD.lo) / (LAD.hi - LAD.lo)));
function sceneLadders(t) {
  const a = span(t, 27.6, 46.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 24); text('QUOTIENTS NEAR THE LAST SEAT · votes ÷ 1, 2, 3 …', CX, 140, { align: 'center', color: C.soft, spacing: '2px' });
    // axis
    for (const q of [15500, 16000, 16500, 17000]) {
      ctx.fillStyle = C.line; ctx.fillRect(100, qy(q), W - 200, 1);
      font(500, 20); text(fmt(q), 92, qy(q), { align: 'right', color: C.faint });
    }
    const cols = [
      { li: 0, x: 190, label: 'Student List', divs: [138, 139, 140, 141, 142] },
      { li: 1, x: 360, label: 'United Serbia', divs: [102, 103, 104, 105, 106] },
      { li: SVM, x: 530, label: 'SVM', divs: [2, 3] },
      { li: SDA, x: 700, label: 'SDA Sandžak', divs: [1] },
    ];
    const bonus = eio(seg(t, 41.6, 43.2)); // the ×1.35 lift
    cols.forEach((c, ci) => {
      const l = LISTS[c.li];
      A(eout(seg(t, 28.0 + ci * 0.5, 28.8 + ci * 0.5)), () => {
        font(600, 24); text(c.label, c.x, LAD.y0 - 30, { align: 'center', color: l.min ? C.green : l.col });
        c.divs.forEach((d) => {
          const plain = l.votes / d;
          const q = l.min && l.votes < THRESHOLD ? lerp(plain, (l.votes * BONUS) / d, bonus) : plain;
          const out = q > LAD.hi ? 1 : q < LAD.lo ? -1 : 0; // above or below the window: a note at its edge
          const y = out > 0 ? LAD.y0 + 14 : out < 0 ? LAD.y1 - 14 : qy(q);
          const won = q >= R.last - 0.5;
          if (out) {
            font(500, 19); text(`÷${d} = ${fmt(q)} ${out > 0 ? '· above' : '· below'}`, c.x, y, { align: 'center', color: won ? (l.min ? C.green : C.soft) : C.faint });
            return;
          }
          ctx.fillStyle = won ? (l.min ? C.green : l.col) : 'rgba(244,246,251,0.14)';
          k.rrect(c.x - 62, y - 12, 124, 24, 5); ctx.fill();
          font(600, 19); text(`÷${d} = ${fmt(q)}`, c.x, y, { align: 'center', color: won ? C.bg2 : C.soft });
        });
      });
    });
    // the cut line: the 250th quotient
    A(seg(t, 32.4, 33.0), () => {
      const y = qy(R.last);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(110, y); ctx.lineTo(W - 110, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(5,11,28,0.85)'; k.rrect(W - 330, y - 48, 220, 30, 6); ctx.fill();
      font(700, 22); text(`250th: ${fmt(R.last)} · last seat`, W - 220, y - 33, { align: 'center', color: C.gold });
      ctx.fillStyle = 'rgba(5,11,28,0.85)'; k.rrect(W - 330, y + 18, 220, 28, 6); ctx.fill();
      font(500, 19); text(`251st: ${fmt(R.next)} · first to miss`, W - 220, y + 32, { align: 'center', color: C.faint });
    });
    A(seg(t, 36.9, 37.5) * (1 - seg(t, 45.4, 45.8)), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 722, 684, 44, 10); ctx.fill();
      font(600, 24); text(`minority list under 3%: quotients × ${BONUS}`, CX, 744, { align: 'center', color: C.green });
    });
  });
}

// ---------- E: the seats ----------
function sceneSeats(t) {
  const a = span(t, 46.0, 55.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 24); text('250 SEATS · BY THE PRELIMINARY COUNT', CX, 140, { align: 'center', color: C.soft, spacing: '2px' });
    chamber(t, 1, seg(t, 46.2, 52.4));
    const rows = [
      [`${R.won[0]}`, 'Student List', C.white, 46.4],
      [`${R.won[1]}`, 'United Serbia', C.red, 50.8],
      [`${MINORITY_SEATS}`, `four minority lists: ${R.won[SVM]} + ${R.won[ALB]} + ${R.won[LJA]} + ${R.won[SDA]}`, C.green, 47.0],
    ];
    rows.forEach(([n, lab, col, at], i) => {
      A(eout(seg(t, at, at + 0.6)), () => {
        const y = 520 + i * 70;
        font(700, 48); text(n, 250, y, { align: 'right', color: col });
        font(500, 28, TXT); text(lab, 276, y + 2, { color: C.ink });
      });
    });
  });
}

// ---------- F: two numbers ----------
function sceneEnd(t) {
  const a = eout(seg(t, 55.2, 56.0));
  if (a <= 0) return;
  A(a, () => {
    font(500, 24); text('THE SAME ELECTION, TWO LISTS', CX, 140, { align: 'center', color: C.soft, spacing: '2px' });
    const cards = [
      ['Authentic Right', LISTS[AR].votes, 'not a minority list · under 3%', '0 seats', C.red, 55.4],
      ['SDA Sandžak', LISTS[SDA].votes, 'minority list · quotient × 1.35', '1 seat', C.green, 56.2],
    ];
    cards.forEach(([name, v, why, res, col, at], i) => {
      A(eout(seg(t, at, at + 0.7)), () => {
        const x = 70 + i * 372, y = 230;
        ctx.fillStyle = C.panel; k.rrect(x, y, 352, 400, 14); ctx.fill();
        font(600, 28); text(name, x + 176, y + 50, { align: 'center', color: C.ink });
        font(700, 60); text(fmt(v), x + 176, y + 130, { align: 'center', color: C.ink });
        font(500, 24, TXT); text('votes', x + 176, y + 178, { align: 'center', color: C.soft });
        font(400, 22, TXT); text(why, x + 176, y + 236, { align: 'center', color: C.soft });
        font(700, 52); text(res, x + 176, y + 320, { align: 'center', color: col });
      });
    });
    A(seg(t, 57.4, 58.0), () => { font(400, 22, TXT); text('Law on the Election of Members of Parliament, art. 140 · RIK preliminary count', CX, 700, { align: 'center', color: C.faint }); });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [NUM, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneBars(t);
    sceneLadders(t);
    sceneSeats(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.white, '~': C.red, '^': C.gold } });
  },
});
