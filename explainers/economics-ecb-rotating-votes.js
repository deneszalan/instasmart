// Explainer for economics-ecb-rotating-votes: when the European Central Bank's Governing Council kept its
// interest rates on 29 October 2026, the 27 people at the table held only 21 votes, and the governor of the
// Banque de France was not one of the voters: the 21 national governors share 15 votes that rotate monthly.
// Look: a deep ECB-blue room, a round table of 27 chairs, euro-yellow for the votes, and a month ticker.
// Space Grotesk for headings and numbers, Barlow for the captions.
//
// Facts, from the ECB:
// - Monetary policy decisions, 29 October 2026: the three key rates unchanged, deposit facility 2.50%, main
//   refinancing operations 2.65%, marginal lending facility 2.90%.
// - ECB explainer "Rotation of voting rights in the Governing Council": six Executive Board members hold
//   permanent voting rights; the 21 governors are ranked by the size of their economies and financial sectors;
//   the top five (currently Germany, France, Italy, Spain and the Netherlands) share four voting rights, the
//   other sixteen (since Bulgaria joined on 1 January 2026) share eleven; they take turns on a monthly rotation;
//   the system started on 1 January 2015, when Lithuania's entry took the number of governors above 18; all
//   members attend and may speak. Euronews (29 Oct 2026): the Council sets rates for the 21 euro-area countries.
// - ECB table "Voting rights in the Governing Council, 2026" (an X marks a month with a vote): the months each
//   governor has no vote are in ROTA below. In October 2026: Banque de France, Latvijas Banka, Lietuvos bankas,
//   Banque centrale du Luxembourg, Central Bank of Malta, Oesterreichische Nationalbank; in November 2026:
//   Banca d'Italia, Malta, Austria, Banco de Portugal, Banka Slovenije, Národná banka Slovenska.
// Computed here: the voters of every month from ROTA (checked: one of the big five and five of the sixteen sit
// out each month), the 21 votes, and the average months with a vote (12 × 4/5 = 9.6 and 12 × 11/16 = 8.25).
//
// Scene plan (60 s). Captions are centred at y = 846; the table and its labels stay above y = 760.
//  A  0.0– 9.0  29 October 2026: the decision; a round table of 27 chairs.
//  B  9.2–18.2  Who sits there: 6 board members, 21 governors; 21 votes.
//  C 18.4–32.0  The two groups and their 4 and 11 votes.
//  D 32.2–45.8  The year's rotation runs month by month and stops at October: France sits out.
//  E 46.0–55.0  Months with a vote per year; everyone speaks.
//  F 55.2–60.0  Since 1 January 2015.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0b1f4d', bg2: '#061030', ink: '#f6f7fb', soft: 'rgba(246,247,251,0.72)', faint: 'rgba(246,247,251,0.24)', line: 'rgba(246,247,251,0.14)',
  yellow: '#ffd23f', board: '#ffd23f', big: '#f6f7fb', small: '#8fc1ff', out: 'rgba(246,247,251,0.16)', red: '#ff7b7b', green: '#7ee0a8', panel: 'rgba(255,255,255,0.07)',
};
const HEAD = 'Space Grotesk', TXT = 'Barlow';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the council ----------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BIG = ['DE', 'FR', 'IT', 'ES', 'NL'];
const SMALL = ['BE', 'BG', 'EE', 'IE', 'GR', 'HR', 'CY', 'LV', 'LT', 'LU', 'MT', 'AT', 'PT', 'SI', 'SK', 'FI'];
const NAME = { DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', NL: 'Netherlands', BE: 'Belgium', BG: 'Bulgaria', EE: 'Estonia', IE: 'Ireland', GR: 'Greece', HR: 'Croatia', CY: 'Cyprus', LV: 'Latvia', LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', AT: 'Austria', PT: 'Portugal', SI: 'Slovenia', SK: 'Slovakia', FI: 'Finland' };
/** The months (0 = January) in which each governor has no vote in 2026 (ECB table). */
const ROTA = {
  DE: [2, 7], FR: [4, 9], IT: [0, 5, 10], ES: [3, 8], NL: [1, 6, 11],
  BE: [0, 1, 6, 11], BG: [1, 6, 7, 11], EE: [1, 2, 6, 7], IE: [1, 2, 7], GR: [2, 7, 8], HR: [2, 3, 7, 8], CY: [2, 3, 8], LV: [3, 8, 9],
  LT: [3, 4, 8, 9], LU: [3, 4, 9], MT: [4, 9, 10], AT: [4, 5, 9, 10], PT: [0, 4, 5, 10], SI: [0, 5, 10, 11], SK: [0, 5, 6, 10, 11], FI: [0, 1, 5, 6, 11],
};
const votes = (code, m) => !ROTA[code].includes(m);
for (let m = 0; m < 12; m++) {
  const bigOut = BIG.filter((c) => !votes(c, m)).length, smallOut = SMALL.filter((c) => !votes(c, m)).length;
  if (bigOut !== 1 || smallOut !== 5) throw new Error(`month ${m}: ${bigOut} of the big five and ${smallOut} of the sixteen sit out`);
}
const BOARD = 6, VOTES = BOARD + 4 + 11; // 21
const OCT = 9, NOV = 10;
const OUT_OCT = [...BIG, ...SMALL].filter((c) => !votes(c, OCT)); // FR, LV, LT, LU, MT, AT
const BIG_MONTHS = (12 * 4) / 5, SMALL_MONTHS = (12 * 11) / 16; // 9.6 and 8.25
const RATE = '2.50%';

const CUES = [
  [0.4, 4.6, `On 29 October 2026, the European Central Bank kept its deposit rate at ^${RATE}^.`],
  [4.8, 9.0, 'The decision belongs to its Governing Council: 27 people around one table in Frankfurt.'],
  [9.2, 13.6, 'Six are the ECB’s ^Executive Board^. Twenty-one are the governors of the national central banks.'],
  [13.8, 18.2, `But the council has only ^${VOTES} votes^. The six board members always vote; the 21 governors share 15.`],
  [18.4, 22.8, 'Governors are ranked by the size of their economy and financial sector, and split into two groups.'],
  [23.0, 27.4, 'The top five, *Germany, France, Italy, Spain, the Netherlands*, share ^4 votes^: one sits out each month.'],
  [27.6, 32.0, 'The other sixteen share ^11 votes^: five of them sit out each month.'],
  [32.2, 36.6, 'Who sits out rotates every month, on a timetable the ECB publishes for the whole year.'],
  [36.8, 41.2, `October 2026 was ~France’s~ month off. ${OUT_OCT.slice(1).map((c) => NAME[c]).join(', ')} sat out too.`],
  [41.4, 45.8, `So the Banque de France’s governor had no vote on 29 October. In ${MONTHS[NOV] === 'Nov' ? 'November' : ''}, it is Italy’s turn.`],
  [46.0, 50.4, `Over a year, a big-five governor votes in ^${BIG_MONTHS}^ months of 12; one of the sixteen in ^${SMALL_MONTHS}^ on average.`],
  [50.6, 55.0, 'Everyone attends and speaks. The rotation only settles who can vote when it comes to a vote.'],
  [55.2, 60.0, 'The rule began on 1 January 2015, when Lithuania’s entry took the governors past 18.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(CX, 430, 60, CX, 430, 900);
  rg.addColorStop(0, C.bg1); rg.addColorStop(1, C.bg2);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // a faint ring of twelve stars
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, x = CX + 330 * Math.cos(a), y = 430 + 250 * Math.sin(a);
    g.fillStyle = 'rgba(255,210,63,0.10)';
    g.beginPath();
    for (let j = 0; j < 10; j++) { const r = j % 2 ? 4 : 10, b = a + (j / 10) * Math.PI * 2; g.lineTo(x + r * Math.cos(b), y + r * Math.sin(b)); }
    g.closePath(); g.fill();
  }
}

// ---------- the table: 27 chairs on an ellipse ----------
const SEATS = [...Array(BOARD).fill(null).map((_, i) => ({ kind: 'board', code: `B${i + 1}` })), ...BIG.map((c) => ({ kind: 'big', code: c })), ...SMALL.map((c) => ({ kind: 'small', code: c }))];
const TABLE = { cx: CX, cy: 440, rx: 300, ry: 174 };
const seatPos = (i) => { const a = -Math.PI / 2 + (i / SEATS.length) * Math.PI * 2; return [TABLE.cx + TABLE.rx * Math.cos(a), TABLE.cy + TABLE.ry * Math.sin(a), a]; };
const seatCol = (s) => (s.kind === 'board' ? C.board : s.kind === 'big' ? C.big : C.small);
/**
 * Draw the table. `grow`: chairs appearing; `month`: -1 for everyone lit, else the month whose non-voters dim;
 * `labels`: show codes; `groups`: 0..1 tints the groups (before that, every chair is plain).
 */
function table(grow, month, labels, groups) {
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.ellipse(TABLE.cx, TABLE.cy, TABLE.rx - 46, TABLE.ry - 40, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
  SEATS.forEach((s, i) => {
    const g = eout(seg(grow, i / SEATS.length, i / SEATS.length + 0.1));
    if (g <= 0) return;
    const [x, y] = seatPos(i);
    const sits = s.kind === 'board' || month < 0 || votes(s.code, month);
    const col = groups > 0 ? seatCol(s) : C.ink;
    ctx.fillStyle = sits ? col : C.out;
    ctx.beginPath(); ctx.arc(x, y, 13 * g, 0, 7); ctx.fill();
    if (!sits) { ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 7, y - 7); ctx.lineTo(x + 7, y + 7); ctx.moveTo(x + 7, y - 7); ctx.lineTo(x - 7, y + 7); ctx.stroke(); }
    if (labels > 0 && s.kind !== 'board') {
      const [, , a] = seatPos(i);
      const lx = x + 30 * Math.cos(a), ly = y + 26 * Math.sin(a);
      A(labels, () => { font(600, 17); text(s.code, lx, ly, { align: 'center', color: sits ? C.soft : C.red }); });
    }
  });
}

// ---------- A: the decision and the table ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { font(600, 24); text('EUROPEAN CENTRAL BANK · 29 OCTOBER 2026', CX, 136, { align: 'center', color: C.soft, spacing: '3px' }); });
    A(eout(seg(t, 0.8, 1.6)) * (1 - seg(t, 4.4, 5.0)), () => {
      font(700, 72); text(`deposit rate ${RATE}`, CX, 206, { align: 'center', color: C.yellow });
      font(500, 26, TXT); text('unchanged · main refinancing 2.65% · marginal lending 2.90%', CX, 262, { align: 'center', color: C.soft });
    });
    A(seg(t, 4.6, 5.2), () => table(seg(t, 4.8, 8.2), -1, 0, 0));
    A(seg(t, 7.6, 8.2), () => { font(700, 44); text('27 chairs', CX, 690, { align: 'center', color: C.ink }); });
  });
}

// ---------- B: who sits there, and the 21 votes ----------
function sceneWho(t) {
  const a = span(t, 9.2, 18.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('THE GOVERNING COUNCIL', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    table(1, -1, 0, 1);
    const rows = [[`${BOARD}`, 'Executive Board members', C.board, 9.6], ['21', 'national central bank governors', C.big, 10.6]];
    rows.forEach(([n, lab, col, at], i) => A(eout(seg(t, at, at + 0.6)), () => { font(700, 30); text(n, 150, 182 + i * 36, { align: 'right', color: col }); font(500, 22, TXT); text(lab, 166, 184 + i * 36, { color: C.ink }); }));
    // the votes: 21 tokens
    A(seg(t, 14.0, 14.6), () => {
      font(700, 40); text(`${VOTES} votes`, CX, 672, { align: 'center', color: C.yellow });
      for (let i = 0; i < VOTES; i++) {
        const g = eout(seg(t, 14.2 + i * 0.08, 14.6 + i * 0.08));
        const x = CX - (VOTES - 1) * 15 + i * 30;
        ctx.fillStyle = i < BOARD ? C.board : 'rgba(255,210,63,0.45)'; ctx.beginPath(); ctx.arc(x, 724, 9 * g, 0, 7); ctx.fill();
      }
      font(500, 22, TXT); text('6 for the board · 15 shared by the 21 governors', CX, 760, { align: 'center', color: C.soft });
    });
  });
}

// ---------- C: the two groups ----------
function sceneGroups(t) {
  const a = span(t, 18.4, 32.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('TWO GROUPS OF GOVERNORS', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    table(1, -1, seg(t, 18.8, 19.6), 1);
    A(eout(seg(t, 23.2, 23.8)), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 668, 360, 96, 12); ctx.fill();
      font(700, 30); text('5 governors', 80, 696, { color: C.big });
      font(500, 22, TXT); text('DE · FR · IT · ES · NL', 80, 736, { color: C.soft });
      font(700, 30); text('4 votes', 400, 736, { align: 'right', color: C.yellow });
    });
    A(eout(seg(t, 27.8, 28.4)), () => {
      ctx.fillStyle = C.panel; k.rrect(444, 668, 360, 96, 12); ctx.fill();
      font(700, 30); text('16 governors', 464, 696, { color: C.small });
      font(500, 22, TXT); text('the other sixteen', 464, 736, { color: C.soft });
      font(700, 30); text('11 votes', 784, 736, { align: 'right', color: C.yellow });
    });
  });
}

// ---------- D: the rotation runs through the year ----------
function sceneRotation(t) {
  const a = span(t, 32.2, 46.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the month ticks from January in 32.6..37.4, then holds at October
    const m = t < 37.4 ? Math.min(OCT, Math.floor(seg(t, 32.6, 37.4) * (OCT + 1))) : t < 43.6 ? OCT : NOV;
    font(600, 24); text(`VOTING RIGHTS IN 2026 · ${MONTHS[m].toUpperCase()}`, CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    table(1, m, 1, 1);
    // month strip
    MONTHS.forEach((mo, i) => {
      const x = 90 + i * 62.5;
      ctx.fillStyle = i === m ? C.yellow : C.panel; k.rrect(x - 26, 176, 52, 30, 6); ctx.fill();
      font(600, 18); text(mo, x, 191, { align: 'center', color: i === m ? C.bg2 : C.soft });
    });
    const out = [...BIG, ...SMALL].filter((c) => !votes(c, m));
    ctx.fillStyle = C.panel; k.rrect(60, 668, 744, 96, 12); ctx.fill();
    font(500, 22, TXT); text(`sitting out in ${MONTHS[m]}:`, 80, 696, { color: C.soft });
    font(700, 28); text(`${NAME[out[0]]}`, 80, 736, { color: C.red });
    const w0 = ctx.measureText(NAME[out[0]]).width;
    font(500, 24, TXT); text(`+ ${out.slice(1).map((c) => NAME[c]).join(', ')}`, 80 + w0 + 16, 737, { color: C.soft });
    font(700, 28); text(`${VOTES} votes`, 784, 696, { align: 'right', color: C.yellow });
  });
}

// ---------- E: months with a vote ----------
function sceneYear(t) {
  const a = span(t, 46.0, 55.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('MONTHS WITH A VOTE, PER YEAR', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    const rows = [['Executive Board', 12, C.board, 46.4], ['big-five governor', BIG_MONTHS, C.big, 47.0], ['one of the sixteen', SMALL_MONTHS, C.small, 47.6]];
    rows.forEach(([lab, n, col, at], i) => {
      const y = 230 + i * 120, g = eout(seg(t, at, at + 0.8));
      A(seg(t, at, at + 0.4), () => {
        font(500, 26, TXT); text(lab, 70, y, { color: C.ink });
        for (let mo = 0; mo < 12; mo++) {
          const fill = clamp(n - mo) * g;
          ctx.fillStyle = C.panel; k.rrect(70 + mo * 60, y + 24, 50, 40, 6); ctx.fill();
          if (fill > 0) { ctx.fillStyle = col; k.rrect(70 + mo * 60, y + 24, 50 * fill, 40, 6); ctx.fill(); }
        }
        font(700, 34); text(`${n}`, 794, y, { align: 'right', color: col });
      });
    });
    A(seg(t, 50.8, 51.4), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 600, 744, 150, 12); ctx.fill();
      font(600, 28); text('all 27 attend and speak', CX, 640, { align: 'center', color: C.ink });
      font(500, 24, TXT); text('the rotation decides only who votes, when a vote is taken', CX, 684, { align: 'center', color: C.soft });
      font(500, 22, TXT); text(`in 2026: ${12 * 4 / 5} = 12 × 4 ÷ 5 and ${SMALL_MONTHS} = 12 × 11 ÷ 16`, CX, 722, { align: 'center', color: C.faint });
    });
  });
}

// ---------- F: since 2015 ----------
function sceneEnd(t) {
  const a = eout(seg(t, 55.2, 56.0));
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('WHY THERE IS A ROTATION', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    table(1, -1, 1, 1);
    A(eout(seg(t, 55.6, 56.4)), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 668, 744, 96, 12); ctx.fill();
      font(700, 30); text('1 January 2015', 80, 696, { color: C.yellow });
      font(500, 24, TXT); text('Lithuania joins the euro: 19 governors, over 18, so the votes rotate', 80, 736, { color: C.soft });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneWho(t);
    sceneGroups(t);
    sceneRotation(t);
    sceneYear(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.big, '~': C.red, '^': C.yellow } });
  },
});
