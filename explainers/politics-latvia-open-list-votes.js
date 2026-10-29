// Explainer for politics-latvia-open-list-votes: in Latvia's parliamentary election of 3 October 2026, voters
// reordered the parties' lists of candidates. On a Latvian ballot each name has a green "for" (PAR) and a red
// "against" (PRET) box; a candidate's votes are the list's ballots plus the for marks minus the against marks,
// and the list's seats go to its highest scores. Look: a dark carmine evening (the red of Latvia's flag), white
// ballot papers with green and red boxes, and a ladder of the 43 names that bends from printed order to final
// place. Archivo for names and numbers, Fira Sans for the captions.
//
// Facts, all from the Central Election Commission of Latvia (CVK), dati.cvk.lv/SV2026:
// - Results (velesanu-rezultati): 100 deputies, 1,428 candidates; turnout 51.79%. Rīga: 38 deputies;
//   "PROGRESĪVIE" 34,294 valid ballots, 6 seats; "APVIENOTAIS SARAKSTS" (United List) 84,160 ballots, 13 seats.
//   Note on the candidate tables: "Votes are calculated from the valid marks on the candidate list by
//   subtracting the candidate's 'Against' marks and adding the 'For' marks." Note on seats: "the number of
//   seats obtained by each list is determined separately in each electoral district".
// - Candidate results, PROGRESĪVIE in Rīga (number, pro, contra, votes, place): 1 Andris Šuvajevs 16,863 /
//   1,219 / 49,938 / 1; 4 Kaspars Briškens 2,841 / 6,502 / 30,633 / 43; 43 Mārtiņš Hiršs 4,577 / 856 /
//   38,015 / 4 (elected); 6 Krista Burāne 37,000, 6th, the last elected. All 43 rows are below (MARKS).
// - United List in Rīga: 38 of its 43 candidates had more against than for marks; 13 elected; Jānis Urtāns,
//   number 28: 1,815 for, 3,097 against, 82,878 votes, 9th, elected. Places 6 to 13 (all elected) had more
//   against than for marks: 8 of the 13.
// - LSM, "Latvian Saeima elections 2026: How the election works" (2 September 2026): one ballot paper per
//   list; a voter "may also choose to colour in a green 'PAR' (for) or red 'PRET' (against) mark opposite the
//   name of a candidate or candidates", "though it still only counts as one vote for one party"; five
//   constituencies.
// Computed here: every score as ballots + for − against, the final places from the scores (checked against
// the CVK's places), the imaginary example list.
//
// Scene plan (60 s). Important things stay above y = 760; captions are centred at y = 846.
//  A  0.0– 9.2  Latvia, 3 October 2026: 14 ballot papers, one per list; one is chosen.
//  B  9.2–23.0  For and against boxes; score = ballots + for − against; seats to the top scores (an example).
//  C 23.0–45.8  The Progressives in Rīga: No. 4 falls to 43rd, No. 43 rises to 4th.
//  D 46.0–50.4  The United List in Rīga: most names had more against than for.
//  E 50.6–55.0  The marks don't change a party's seats.
//  F 55.2–60.0  The printed order and the voters' order, side by side.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#2b1117', bg2: '#13080b', ink: '#f8f2ef', soft: 'rgba(248,242,239,0.72)', faint: 'rgba(248,242,239,0.22)', line: 'rgba(248,242,239,0.13)',
  paper: '#f5f0e7', paperInk: '#2a2023', paperSoft: 'rgba(42,32,35,0.55)', paperLine: 'rgba(42,32,35,0.14)',
  par: '#2a9a5b', pret: '#cc3a3a', yes: '#72d79e', no: '#ff9384', gold: '#f3c45c', carmine: '#a3343f', panel: 'rgba(0,0,0,0.32)',
};
const NUM = 'Archivo', TXT = 'Fira Sans';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the Progressives' list in Rīga (CVK): [for, against] for numbers 1 to 43 ----------
const PROG = {
  ballots: 34294, seats: 6,
  names: { 1: 'Andris Šuvajevs', 2: 'Antoņina Ņenaševa', 3: 'Mairita Lūse', 4: 'Kaspars Briškens', 5: 'Selma Teodora Levrence', 6: 'Krista Burāne', 43: 'Mārtiņš Hiršs' },
  MARKS: [[16863, 1219], [6174, 2293], [5439, 1205], [2841, 6502], [5908, 2987], [3822, 1116], [3117, 1045], [1941, 1064], [2057, 1222], [4382, 1992], [2958, 1230], [2368, 1190], [1750, 1225], [2410, 1050], [2008, 1092], [2512, 959], [1984, 944], [2301, 774], [2030, 1154], [1896, 824], [2576, 1650], [2122, 1061], [1836, 927], [1600, 1005], [1753, 985], [1630, 1317], [2093, 1073], [1375, 832], [1988, 736], [1544, 1253], [1475, 1229], [1676, 862], [1496, 910], [1736, 1006], [1268, 886], [1174, 940], [1527, 912], [1431, 923], [1940, 780], [1789, 770], [1328, 868], [1399, 916], [4577, 856]],
  CVK_PLACES: [1, 3, 2, 43, 5, 6, 8, 24, 26, 7, 9, 14, 34, 12, 22, 10, 18, 11, 25, 16, 21, 17, 23, 31, 28, 39, 19, 33, 13, 40, 41, 27, 32, 29, 38, 42, 30, 35, 15, 20, 37, 36, 4],
};
const N = PROG.MARKS.length; // 43
const score = (i) => PROG.ballots + PROG.MARKS[i][0] - PROG.MARKS[i][1];
const SCORES = PROG.MARKS.map((_, i) => score(i));
const ORDER = SCORES.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).map(([, i]) => i);
const PLACE = Array(N); ORDER.forEach((i, p) => (PLACE[i] = p + 1));
PLACE.forEach((p, i) => { if (p !== PROG.CVK_PLACES[i]) throw new Error(`place of No. ${i + 1} should be ${PROG.CVK_PLACES[i]}`); });
const BR = 3, HI = 42; // indexes of No. 4 and No. 43
const LAST_SEAT = SCORES[ORDER[PROG.seats - 1]]; // 37,000

// ---------- the United List in Rīga (CVK) ----------
const UNITED = { ballots: 84160, seats: 13, names: 43, moreAgainst: 38, negElected: 8, urtans: { no: 28, pro: 1815, con: 3097, place: 9 } };
if (UNITED.ballots + UNITED.urtans.pro - UNITED.urtans.con !== 82878) throw new Error('Urtāns should have 82,878 votes');

// ---------- an imaginary list for the rule ----------
const EX = { ballots: 1000, seats: 2, rows: [['Candidate A', 60, 150], ['Candidate B', 30, 40], ['Candidate C', 180, 20], ['Candidate D', 50, 30], ['Candidate E', 10, 25]] };
const EXS = EX.rows.map(([, p, c]) => EX.ballots + p - c);
const EXORDER = EXS.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).map(([, i]) => i);
const EXPLACE = Array(EXS.length); EXORDER.forEach((i, p) => (EXPLACE[i] = p));

const CUES = [
  [0.4, 4.6, 'On 3 October 2026, Latvia elected the 100 members of its parliament, the Saeima.'],
  [4.8, 9.0, 'Voters take one party’s list as their ballot paper, and may also mark the names on it.'],
  [9.2, 13.6, 'Beside each name are two boxes, *for* and ~against~. A voter can mark as many as they like.'],
  [13.8, 18.2, 'Every ballot gives each name on it one vote. A *for* mark adds one, an ~against~ takes one off.'],
  [18.4, 22.8, 'The party’s seats then go to its ^highest scores^, not to its printed order.'],
  [23.0, 27.4, `In Rīga, ^${fmt(PROG.ballots)}^ voters chose the Progressives’ list of ${N} names. It won ${PROG.seats} seats.`],
  [27.6, 32.0, `Kaspars Briškens, printed 4th, got *${fmt(PROG.MARKS[BR][0])} for* and ~${fmt(PROG.MARKS[BR][1])} against~.`],
  [32.2, 36.6, `That left him ^${fmt(SCORES[BR])}^ votes: last of all ${N}, with no seat.`],
  [36.8, 41.2, `Mārtiņš Hiršs, printed last at No. ${N}, got *${fmt(PROG.MARKS[HI][0])} for* and only ~${fmt(PROG.MARKS[HI][1])} against~.`],
  [41.4, 45.8, `His ^${fmt(SCORES[HI])}^ votes put him ${PLACE[HI]}th, and into parliament.`],
  [46.0, 50.4, `On the United List in Rīga, ${UNITED.moreAgainst} of ${UNITED.names} names got more ~against~ than *for*, and ${UNITED.negElected} of those still won seats.`],
  [50.6, 55.0, 'The marks never change a party’s seats: each ballot still counts once for its list.'],
  [55.2, 60.0, 'So the party proposes the order of its names, and its voters can rewrite it.'],
];

// ---------- background: carmine dusk with the flag's white band, very faint ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // Latvia's flag: carmine, a narrow white band, carmine (2:1:2), as a faint stripe at the top
  g.fillStyle = 'rgba(163,52,63,0.55)'; g.fillRect(0, 0, W, 34); g.fillRect(0, 51, W, 34);
  g.fillStyle = 'rgba(248,242,239,0.16)'; g.fillRect(0, 34, W, 17);
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(255,220,220,${rnd() * 0.03})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd(), 1 + rnd()); }
}

// ---------- a ballot paper ----------
/** A paper slip with a list header and rows of names, each with a green "for" and a red "against" box. */
function ballot(x, y, w, h, o = {}) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; k.rrect(x + 6, y + 8, w, h, 8); ctx.fill();
  ctx.fillStyle = C.paper; k.rrect(x, y, w, h, 8); ctx.fill();
  const rows = o.rows ?? [];
  const head = o.head ?? Math.min(90, h * 0.2);
  if (o.title) {
    ctx.fillStyle = C.paperLine; ctx.fillRect(x + 18, y + head - 4, w - 36, 2);
    font(800, o.titleSize ?? 26); text(o.title, x + 24, y + head * 0.42, { color: C.paperInk });
    if (o.sub) { font(500, (o.titleSize ?? 26) * 0.72); text(o.sub, x + 24, y + head * 0.78, { color: C.paperSoft }); }
  }
  const rh = (h - head - 14) / Math.max(1, rows.length);
  rows.forEach((r, i) => {
    const ry = y + head + 8 + i * rh + rh / 2;
    const fs = o.rowSize ?? Math.min(28, rh * 0.42);
    font(600, fs); text(`${i + 1}.`, x + 24, ry, { color: C.paperSoft });
    font(600, fs); text(r.name, x + 24 + fs * 1.6, ry, { color: C.paperInk });
    const bs = Math.min(34, rh * 0.56);
    const bxF = x + w - 24 - bs * 2 - 20, bxA = x + w - 24 - bs;
    for (const [bx, col, mark, lab] of [[bxF, C.par, r.par ?? 0, 'PAR'], [bxA, C.pret, r.pret ?? 0, 'PRET']]) {
      ctx.strokeStyle = col; ctx.lineWidth = 3; k.rrect(bx, ry - bs / 2, bs, bs, 4); ctx.stroke();
      if (mark > 0) A(mark, () => { ctx.fillStyle = col; k.rrect(bx + 4, ry - bs / 2 + 4, (bs - 8) * clamp(mark * 1.2), bs - 8, 3); ctx.fill(); });
      if (o.boxLabels && i === 0) { font(800, 18); text(lab, bx + bs / 2, y + head - 18, { color: col, align: 'center' }); }
    }
  });
}

// ---------- A: the ballot papers ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => {
      font(600, 26); text('LATVIA · ELECTION OF THE SAEIMA', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
      font(600, 26); text('3 OCTOBER 2026 · 100 SEATS', CX, 176, { align: 'center', color: C.soft, spacing: '3px' });
    });
    // 14 slips, one per list, fanned out
    const pick = 9, z = eio(seg(t, 4.9, 6.6));
    for (let i = 0; i < 14; i++) {
      if (i === pick) continue;
      const g = eout(seg(t, 0.5 + i * 0.12, 1.2 + i * 0.12));
      if (g <= 0) continue;
      const ang = lerp(-0.62, 0.62, i / 13);
      A(g * (1 - z), () => {
        ctx.save(); ctx.translate(CX, 800); ctx.rotate(ang); ctx.translate(0, -360 - (1 - g) * 120);
        ballot(-62, -88, 124, 176, { title: `${i + 1}`, titleSize: 26, head: 42, rows: [0, 1, 2, 3].map(() => ({ name: '———' })), rowSize: 13 });
        ctx.restore();
      });
    }
    // the chosen slip lifts out and grows into a full ballot
    const g = eout(seg(t, 0.5 + pick * 0.12, 1.2 + pick * 0.12));
    const lift = eio(seg(t, 3.0, 4.2));
    if (g > 0) {
      const ang = lerp(-0.62, 0.62, pick / 13) * (1 - lift);
      const w = lerp(124, 560, z), h = lerp(176, 470, z);
      const cy = lerp(lerp(800 - 360, 480, lift), 470, z);
      ctx.save(); ctx.translate(lerp(CX, CX, lift), cy); ctx.rotate(ang * (1 - z));
      if (z < 0.5) ballot(-w / 2, -h / 2, w, h, { title: `${pick + 1}`, titleSize: 26, head: 42, rows: [0, 1, 2, 3].map(() => ({ name: '———' })), rowSize: 13 });
      else A(seg(z, 0.5, 0.8), () => ballot(-w / 2, -h / 2, w, h, { title: 'An example party list', sub: 'one ballot paper for each list', rows: EX.rows.map(([name]) => ({ name })), boxLabels: true }));
      ctx.restore();
    }
  });
}

// ---------- B: the rule, on an imaginary list ----------
function sceneRule(t) {
  const a = span(t, 9.0, 23.0, 0.01, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 9.2–13.8: the ballot, marked
    A(1 - seg(t, 13.6, 14.0), () => {
      const m1 = eio(seg(t, 10.4, 11.0)), m2 = eio(seg(t, 11.6, 12.2));
      ballot(CX - 280, 235, 560, 470, {
        title: 'An example party list', sub: 'one ballot paper for each list', boxLabels: true,
        rows: EX.rows.map(([name], i) => ({ name, par: i === 2 ? m1 : 0, pret: i === 0 ? m2 : 0 })),
      });
      A(seg(t, 9.6, 10.2), () => {
        font(700, 28); text('for', CX + 185, 206, { align: 'center', color: C.yes });
        text('against', CX + 252, 206, { align: 'left', color: C.no });
      });
    });
    // 13.8–23.0: the count
    A(seg(t, 13.8, 14.3), () => {
      font(600, 26); text('AN IMAGINARY LIST · 1,000 BALLOTS · 2 SEATS', CX, 150, { align: 'center', color: C.soft, spacing: '2px' });
      font(700, 34);
      const fy = 210;
      font(700, 28);
      text('ballots', 330, fy, { color: C.gold, align: 'right' });
      text('+ for', 470, fy, { color: C.yes, align: 'right' });
      text('− against', 610, fy, { color: C.no, align: 'right' });
      text('= votes', 740, fy, { color: C.ink, align: 'right' });
      const sort = eio(seg(t, 18.8, 20.4));
      EX.rows.forEach(([name, p, c], i) => {
        const y0 = 300 + i * 84, y1 = 300 + EXPLACE[i] * 84, y = lerp(y0, y1, sort);
        const g = eout(seg(t, 14.2 + i * 0.25, 14.8 + i * 0.25));
        A(g, () => {
          const seat = EXPLACE[i] < EX.seats;
          const lit = seg(t, 20.4, 21.0) * (seat ? 1 : 0);
          ctx.fillStyle = lit > 0 ? `rgba(243,196,92,${0.10 + 0.14 * lit})` : C.panel; k.rrect(70, y - 34, 724, 68, 10); ctx.fill();
          font(600, 28); text(name, 92, y, { color: C.ink });
          const n = seg(t, 15.4 + i * 0.3, 16.6 + i * 0.3);
          font(500, 28);
          text(fmt(EX.ballots), 330, y, { align: 'right', color: C.gold });
          text(`+${fmt(p * n)}`, 470, y, { align: 'right', color: C.yes });
          text(`−${fmt(c * n)}`, 610, y, { align: 'right', color: C.no });
          font(800, 32); text(fmt(EX.ballots + (p - c) * n), 740, y, { align: 'right', color: C.ink });
          A(lit, () => { font(800, 18); text('SEAT', 760, y - 22, { align: 'center', color: C.gold, spacing: '2px' }); });
        });
      });
      A(seg(t, 20.6, 21.2), () => { font(500, 24); text('printed order A, B, C, D, E · the seats go to C and D', CX, 742, { align: 'center', color: C.soft }); });
    });
  });
}

// ---------- C: the ladder of the Progressives' 43 names in Rīga ----------
const LAD = { xl: 230, xr: 634, y0: 236, y1: 620 };
const ly = (p) => lerp(LAD.y0, LAD.y1, (p - 1) / (N - 1));
function ladder(t, bend, hi) {
  // seats band on the right
  ctx.fillStyle = 'rgba(243,196,92,0.16)'; k.rrect(LAD.xr - 14, ly(1) - 9, 76, ly(PROG.seats) - ly(1) + 18, 6); ctx.fill();
  font(800, 20); text(`${PROG.seats} SEATS`, LAD.xr + 74, ly((1 + PROG.seats) / 2), { color: C.gold, spacing: '2px' });
  font(600, 24); text('printed order', LAD.xl, LAD.y0 - 40, { align: 'center', color: C.soft });
  text('final place', LAD.xr, LAD.y0 - 40, { align: 'center', color: C.soft });
  font(600, 18);
  for (const p of [1, 10, 20, 30, 43]) {
    if (p - 1 !== hi.a && p - 1 !== hi.b) text(`${p}`, LAD.xl - 14, ly(p), { align: 'right', color: 'rgba(248,242,239,0.45)' });
    if (p !== 1) text(`${p}`, LAD.xr + 16, ly(p), { color: 'rgba(248,242,239,0.45)' });
  }
  for (let i = 0; i < N; i++) {
    if (i === hi.a || i === hi.b) continue;
    const yl = ly(i + 1), yr = lerp(yl, ly(PLACE[i]), bend);
    ctx.strokeStyle = PLACE[i] <= PROG.seats && bend > 0.99 ? 'rgba(243,196,92,0.55)' : 'rgba(248,242,239,0.20)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(LAD.xl, yl); ctx.bezierCurveTo(lerp(LAD.xl, LAD.xr, 0.5), yl, lerp(LAD.xl, LAD.xr, 0.5), yr, LAD.xr, yr); ctx.stroke();
    ctx.fillStyle = C.soft; ctx.beginPath(); ctx.arc(LAD.xl, yl, 3, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(LAD.xr, yr, 3, 0, 7); ctx.fill();
  }
}
function hiLine(i, col, bend, label) {
  const yl = ly(i + 1), yr = lerp(yl, ly(PLACE[i]), bend);
  ctx.strokeStyle = col; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(LAD.xl, yl); ctx.bezierCurveTo(lerp(LAD.xl, LAD.xr, 0.5), yl, lerp(LAD.xl, LAD.xr, 0.5), yr, LAD.xr, yr); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(LAD.xl, yl, 7, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(LAD.xr, yr, 7, 0, 7); ctx.fill();
  font(800, 22); text(label, LAD.xl - 14, yl, { align: 'right', color: col });
  if (bend > 0.98) { ctx.fillStyle = C.bg2; ctx.fillRect(LAD.xr + 12, yr - 12, 34, 24); font(800, 22); text(`${PLACE[i]}`, LAD.xr + 16, yr, { color: col }); }
}
function sum(i, y, col, a) {
  A(a, () => {
    const [p, c] = PROG.MARKS[i];
    ctx.fillStyle = C.panel; k.rrect(70, y - 52, 724, 104, 12); ctx.fill();
    font(700, 26); text(`No. ${i + 1} · ${PROG.names[i + 1]}`, 96, y - 22, { color: col });
    font(600, 30);
    text(`${fmt(PROG.ballots)}`, 96, y + 20, { color: C.gold });
    text(`+ ${fmt(p)}`, 250, y + 20, { color: C.yes });
    text(`− ${fmt(c)}`, 410, y + 20, { color: C.no });
    font(800, 34); text(`= ${fmt(SCORES[i])}`, 560, y + 20, { color: C.ink });
  });
}
function sceneRiga(t) {
  const a = span(t, 23.0, 46.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text(`RĪGA · THE PROGRESSIVES · ${fmt(PROG.ballots)} BALLOTS`, CX, 132, { align: 'center', color: C.soft, spacing: '2px' });
    const grow = eout(seg(t, 23.2, 24.6));
    const bend = eio(seg(t, 25.0, 27.0));
    A(grow, () => ladder(t, bend, { a: t > 27.6 ? BR : -1, b: t > 36.8 ? HI : -1 }));
    // No. 4 falls
    if (t > 27.6) {
      const b = eio(seg(t, 32.4, 34.0));
      A(seg(t, 27.6, 28.0), () => hiLine(BR, C.no, b, 'No. 4'));
      sum(BR, 694, C.no, span(t, 28.2, 36.6, 0.4, 0.3));
      if (t > 32.2 && t < 36.6) A(seg(t, 34.0, 34.4) * (1 - seg(t, 36.2, 36.6)), () => { font(800, 22); text('last · no seat', LAD.xr + 54, ly(N), { color: C.no }); });
    }
    // No. 43 rises
    if (t > 36.8) {
      const b = eio(seg(t, 41.6, 43.2));
      A(seg(t, 36.8, 37.2), () => hiLine(HI, C.yes, b, 'No. 43'));
      sum(HI, 694, C.yes, span(t, 37.4, 46.0, 0.4, 0.3));
      A(seg(t, 43.2, 43.6), () => { font(800, 22); text('a seat', LAD.xr + 74, ly(PLACE[HI]) + 30, { color: C.yes }); });
    }
  });
}

// ---------- D: the United List in Rīga ----------
function sceneUnited(t) {
  const a = span(t, 46.0, 50.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text(`RĪGA · THE UNITED LIST · ${fmt(UNITED.ballots)} BALLOTS · ${UNITED.seats} SEATS`, CX, 132, { align: 'center', color: C.soft, spacing: '2px' });
    // 43 tiles: red where against beat for
    const cols = 11, s = 58, x0 = CX - (cols * s) / 2 + 4, y0 = 196;
    for (let i = 0; i < UNITED.names; i++) {
      const g = eout(seg(t, 46.2 + i * 0.03, 46.6 + i * 0.03));
      const neg = i >= UNITED.names - UNITED.moreAgainst; // drawn as a count, not by candidate
      A(g, () => {
        ctx.fillStyle = neg ? 'rgba(255,147,132,0.85)' : 'rgba(114,215,158,0.85)';
        k.rrect(x0 + (i % cols) * s, y0 + Math.floor(i / cols) * s, s - 10, s - 10, 6); ctx.fill();
      });
    }
    A(seg(t, 47.2, 47.6), () => {
      font(700, 26);
      text(`${UNITED.names - UNITED.moreAgainst} names: more for than against`, 110, 450, { color: C.yes });
      text(`${UNITED.moreAgainst} names: more against than for`, 110, 492, { color: C.no });
    });
    A(seg(t, 48.0, 48.5), () => {
      const u = UNITED.urtans;
      ctx.fillStyle = C.panel; k.rrect(70, 548, 724, 160, 12); ctx.fill();
      font(700, 26); text(`No. ${u.no} · Jānis Urtāns`, 96, 584, { color: C.ink });
      font(600, 28); text(`${fmt(UNITED.ballots)}  + ${fmt(u.pro)}  − ${fmt(u.con)}  = ${fmt(UNITED.ballots + u.pro - u.con)}`, 96, 630, { color: C.soft });
      font(800, 28); text(`fewer votes than ballots, yet ${u.place}th of ${UNITED.seats} seats`, 96, 676, { color: C.gold });
    });
  });
}

// ---------- E: seats for the party don't move ----------
function sceneSeats(t) {
  const a = span(t, 50.6, 55.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('HOW MANY SEATS A LIST WINS', CX, 132, { align: 'center', color: C.soft, spacing: '2px' });
    const kinds = [['no marks', 0, 0], ['some for', 1, 0], ['some against', 0, 1]];
    // the ballot box
    ctx.fillStyle = 'rgba(248,242,239,0.10)'; k.rrect(90, 470, 684, 40, 8); ctx.fill();
    ctx.fillStyle = C.bg2; ctx.fillRect(120, 486, 624, 8);
    kinds.forEach(([lab, f, ag], i) => {
      const x = 170 + i * 262, drop = eio(seg(t, 51.6 + i * 0.6, 52.4 + i * 0.6));
      const y = lerp(300, 470, drop);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 486); ctx.clip();
      ballot(x - 75, y - 100, 150, 200, { title: '9', titleSize: 22, head: 40, rows: [0, 1, 2, 3].map((r) => ({ name: '———', par: f && r === 1 ? 1 : 0, pret: ag && (r === 0 || r === 2) ? 1 : 0 })), rowSize: 12 });
      ctx.restore();
      A(seg(t, 50.8, 51.3), () => { font(600, 26); text(lab, x, 560, { align: 'center', color: C.soft }); });
      A(seg(drop, 0.8, 1), () => { font(800, 40); text('+1', x, 612, { align: 'center', color: C.gold }); });
    });
    A(seg(t, 53.6, 54.1), () => { font(600, 28); text('each ballot = one vote for its list', CX, 694, { align: 'center', color: C.ink }); font(500, 24); text('(seats are shared out in each of the five districts)', CX, 736, { align: 'center', color: C.soft }); });
  });
}

// ---------- F: printed order and voters' order ----------
function sceneEnd(t) {
  const a = eout(seg(t, 55.2, 56.0));
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('RĪGA · THE PROGRESSIVES · TOP 6', CX, 132, { align: 'center', color: C.soft, spacing: '2px' });
    font(700, 26); text('printed by the party', 236, 196, { align: 'center', color: C.soft }); text('chosen by the voters', 628, 196, { align: 'center', color: C.gold });
    const short = (n) => PROG.names[n].replace('Selma Teodora ', 'Selma T. ');
    for (let p = 0; p < PROG.seats; p++) {
      const y = 254 + p * 74;
      const left = p + 1, right = ORDER[p] + 1;
      A(eout(seg(t, 55.4 + p * 0.12, 55.9 + p * 0.12)), () => {
        ctx.fillStyle = left === 4 ? 'rgba(255,147,132,0.20)' : C.panel; k.rrect(50, y - 30, 372, 60, 8); ctx.fill();
        font(600, 22); text(`${left}. ${short(left)}`, 66, y, { color: left === 4 ? C.no : C.ink });
      });
      A(eout(seg(t, 56.4 + p * 0.12, 56.9 + p * 0.12)), () => {
        ctx.fillStyle = right === 43 ? 'rgba(114,215,158,0.22)' : C.panel; k.rrect(442, y - 30, 372, 60, 8); ctx.fill();
        font(600, 22); text(`No. ${right} · ${short(right)}`, 458, y, { color: right === 43 ? C.yes : C.ink });
      });
    }
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [NUM, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    if (t >= 9.0) sceneRule(t);
    sceneRiga(t);
    sceneUnited(t);
    sceneSeats(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 41, weight: 700, family: TXT, ink: C.ink, marks: { '*': C.yes, '~': C.no, '^': C.gold } });
  },
});
