// Explainer for politics-bulgaria-turnout-runoff: Bulgaria's presidential election of 25 October 2026 went to a
// runoff on 1 November. The constitution sets two conditions for a first-round win: more than half of the valid
// ballots, and more than half of all eligible voters voting. Miss either and the top two meet again, where more
// votes wins whatever the turnout. Look: a deep pine-green night with a white, green and red stripe (Bulgaria's
// flag) as a thin rule, a door with two padlocks, ballot bars against a 50% line and a crowd of 100 voters.
// Archivo for numbers and labels, Lora for captions.
//
// Facts:
// - Constitution of Bulgaria (constituteproject.org, Bulgaria 2015), art. 93: the President is elected directly
//   for five years; "To be elected, a candidate shall require more than one half of the valid ballots, provided that
//   more than half of all eligible voters have cast their ballots in the election. Should none of the candidates for
//   President be elected, a second round vote shall be held within seven days between the two top candidates. The
//   winner shall be the candidate who wins the majority of the vote." Art. 94: the Vice President is elected at the
//   same time and on the same ticket.
// - AP (via the Atlanta Journal-Constitution, 25 October 2026), "Presidential race in Bulgaria heads to runoff due
//   to record low turnout": 27 candidates; "Turnout must be above 50% of 6.6 million registered voters, and the
//   winner needs a majority of votes"; runoff on 1 November.
// - Results (Central Election Commission, as tabulated on Wikipedia's "2026 Bulgarian presidential election";
//   the same shares in Xinhua's report via The Star): Iliana Iotova and Kiril Valchev 528,951 votes, 34.76%;
//   Andrey Gyurov and Georgi Kandev 486,232, 31.95%; 6,637,238 on the rolls; ballots cast ≈ 23% of them (sources
//   give 22.2–23.0%, so the scene says "fewer than 1 in 4"). SBS/AFP: Iotova is the president; Gyurov a banker
//   and former caretaker prime minister.
// - 2006 (Wikipedia, "2006 Bulgarian presidential election", citing the electoral commission and Reuters): Georgi
//   Parvanov 64% in the first round, turnout 44% (44.11%), so a runoff, which he won with 75.95% on 42.62% turnout.
// Computed here: whether each lock opens; 23 of 100 voters drawn lit (22.98% from the commission's totals).
//
// Scene plan (60.4 s). Important things stay above y = 760; captions are centred at y = 846.
//  A  0.0– 9.4  Bulgaria, 25 October 2026: 27 candidate pairs; a president and vice-president on one ticket.
//  B  9.6–23.2  The door to a first-round win has two locks: over half the ballots, over half the voters.
//  C 23.4–37.0  2026: neither lock opens, and with that turnout even 100% couldn't.
//  D 37.2–46.2  Otherwise a runoff within seven days, with no turnout rule.
//  E 46.4–60.4  2006: a 64% majority on 44% turnout still meant a runoff; 1 November 2026.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#13261d', bg2: '#08130d', ink: '#f5f2ea', soft: 'rgba(245,242,234,0.72)', faint: 'rgba(245,242,234,0.24)',
  line: 'rgba(245,242,234,0.12)', white: '#f5f2ea', green: '#2f9e6b', red: '#e0524f', open: '#7fe0a8', shut: '#ff8a80',
  gold: '#f0c45a', panel: 'rgba(0,0,0,0.3)', iot: '#e98b6d', gyu: '#79b8f2', other: 'rgba(245,242,234,0.35)', door: '#2a3d33',
};
const NUM = 'Archivo', SER = 'Lora';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers ----------
const PAIRS = 27;
const IOT = 34.76, GYU = 31.95; // % of valid ballots, 2026 first round
const TURNOUT_2026 = 528951 + 486232 + 190910 + 70127 + 57643 + 36407 + 14840 + 14209 + 8368 + 5783 + 4527 + 4047 + 3818 + 3687 + 2856 + 2810 + 2505 + 2505 + 2460 + 2321 + 1752 + 1563 + 1397 + 1213 + 1165 + 1141 + 1120 + 67353 + 3278;
const ROLL = 6637238;
const T26 = (TURNOUT_2026 / ROLL) * 100; // ≈ 22.98
const PARV = { first: 64, turnout: 44, runoff: 75.95, turnout2: 42.62 };
/** The two locks of art. 93: more than half of the valid ballots, more than half of the eligible voters voting. */
const locks = (share, turnout) => [share > 50, turnout > 50];
if (locks(IOT, T26).some(Boolean)) throw new Error('2026: both locks should stay shut');
if (!locks(PARV.first, PARV.turnout)[0] || locks(PARV.first, PARV.turnout)[1]) throw new Error('2006: only the first lock opens');
if (locks(100, T26)[1]) throw new Error('even 100% fails the turnout lock');
if (Math.round(T26) !== 23) throw new Error('turnout should be about 23%');

const CUES = [
  [0.4, 4.8, `On 25 October 2026, Bulgaria voted for its president. ${PAIRS} pairs of candidates were on the ballot.`],
  [5.0, 9.4, 'Each pair is a president and a vice-president, elected together for five years.'],
  [9.6, 14.0, 'To win in round one, Bulgaria’s constitution sets *two locks*, and both must open.'],
  [14.2, 18.6, 'Lock one: a candidate needs ^more than half^ of the valid ballots.'],
  [18.8, 23.2, 'Lock two: ^more than half^ of all eligible voters must have cast a ballot.'],
  [23.4, 27.8, 'In 2026, President Iliana Iotova got about 35%, Andrey Gyurov about 32%. Lock one stayed ~shut~.'],
  [28.0, 32.4, 'And fewer than a quarter of the 6.6 million registered voters took part. Lock two stayed ~shut~.'],
  [32.6, 37.0, 'With that turnout, even *100%* of the votes could not have won in round one.'],
  [37.2, 41.6, 'If either lock stays shut, the top two meet again within seven days: a *runoff*.'],
  [41.8, 46.2, 'The runoff has no turnout rule: whoever gets more votes wins.'],
  [46.4, 50.8, 'A majority alone is not enough. In 2006, President Georgi Parvanov won *64%* in round one,'],
  [51.0, 55.4, 'but only 44% of voters turned out. He won the runoff with 76%, on 43% turnout.'],
  [55.6, 60.0, 'So Bulgaria’s second round, on 1 November 2026, needs more votes, not more voters.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // the flag's three bands as a thin rule on the left
  const bands = ['rgba(245,242,234,0.5)', 'rgba(47,158,107,0.6)', 'rgba(224,82,79,0.6)'];
  bands.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, 200 + i * 140, 10, 140); });
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(220,255,230,${r() * 0.025})`; g.fillRect(r() * W, r() * H, 1 + r(), 1 + r()); }
}

// ---------- drawings ----------
function header(s, y = 132) { font(600, 24); text(s, CX, y, { align: 'center', color: C.soft, spacing: '2px' }); }
/** A padlock; open 0–1 lifts the shackle; colour shows shut or open. */
function padlock(x, y, s, open, label) {
  const col = open > 0.5 ? C.open : open < 0 ? C.faint : C.shut;
  const o = clamp(open);
  ctx.lineWidth = s * 0.16; ctx.strokeStyle = col; ctx.lineCap = 'butt';
  ctx.beginPath();
  const lift = o * s * 0.35, sw = s * 0.32;
  ctx.moveTo(x - sw, y - s * 0.1); ctx.lineTo(x - sw, y - s * 0.45 - lift);
  ctx.arc(x, y - s * 0.45 - lift, sw, Math.PI, 0);
  ctx.lineTo(x + sw, y - s * 0.45 - lift + (o > 0 ? s * 0.12 : s * 0.35));
  ctx.stroke();
  ctx.fillStyle = col; k.rrect(x - s * 0.5, y - s * 0.12, s, s * 0.8, s * 0.12); ctx.fill();
  ctx.fillStyle = C.bg2; ctx.beginPath(); ctx.arc(x, y + s * 0.22, s * 0.09, 0, 7); ctx.fill(); ctx.fillRect(x - s * 0.035, y + s * 0.22, s * 0.07, s * 0.2);
  if (label) { font(700, 24); text(label, x, y + s * 0.98, { align: 'center', color: col }); }
}
function person(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - s * 0.55, s * 0.26, 0, 7); ctx.fill();
  k.rrect(x - s * 0.32, y - s * 0.24, s * 0.64, s * 0.62, s * 0.22); ctx.fill();
}
/** A bar of vote share from x0 over width w (100%), with a 50% line. */
function shareBar(y, items, w = 600, x0 = 150, p = 1) {
  ctx.fillStyle = C.panel; k.rrect(x0, y - 30, w, 60, 10); ctx.fill();
  let x = x0;
  for (const [v, col] of items) { const ww = (w * v * p) / 100; ctx.fillStyle = col; ctx.fillRect(x, y - 30, ww, 60); x += ww; }
  ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
  ctx.beginPath(); ctx.moveTo(x0 + w / 2, y - 50); ctx.lineTo(x0 + w / 2, y + 50); ctx.stroke(); ctx.setLineDash([]);
  font(700, 20); text('50%', x0 + w / 2, y - 64, { align: 'center', color: C.gold });
}
/** 100 voters in a 20 × 5 grid; the first `lit` of them voted. */
function crowd(x0, y0, lit, p = 1, cell = 30) {
  for (let i = 0; i < 100; i++) {
    const c = i % 20, r = Math.floor(i / 20);
    const on = i < lit * p;
    person(x0 + c * cell + cell / 2, y0 + r * (cell * 1.3), cell * 0.8, on ? C.gyu : 'rgba(245,242,234,0.16)');
  }
  const xm = x0 + 10 * cell;
  ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
  ctx.beginPath(); ctx.moveTo(xm, y0 - 34); ctx.lineTo(xm, y0 + 5 * cell * 1.3 - 6); ctx.stroke(); ctx.setLineDash([]);
  font(700, 20); text('half of all voters', xm, y0 - 48, { align: 'center', color: C.gold });
}

// ---------- A: the ballot ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.2, 9.6);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { header('BULGARIA · PRESIDENTIAL ELECTION'); header('FIRST ROUND · 25 OCTOBER 2026', 170); });
    // the ballot paper: 27 numbered boxes, each a pair
    const bx = 182, by = 230, bw = 500, bh = 470;
    A(eout(seg(t, 0.6, 1.4)), () => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; k.rrect(bx + 8, by + 10, bw, bh, 10); ctx.fill();
      ctx.fillStyle = C.white; k.rrect(bx, by, bw, bh, 10); ctx.fill();
      const cols = 3, rows = 9, cw = (bw - 40) / cols, rh = (bh - 40) / rows;
      for (let i = 0; i < PAIRS; i++) {
        const c = i % cols, r = Math.floor(i / cols);
        const g = seg(t, 1.0 + i * 0.06, 1.3 + i * 0.06);
        A(g, () => {
          const x = bx + 20 + c * cw, y = by + 20 + r * rh;
          ctx.strokeStyle = 'rgba(19,38,29,0.35)'; ctx.lineWidth = 2; k.rrect(x + 4, y + 4, cw - 8, rh - 8, 5); ctx.stroke();
          font(700, 18); text(`${i + 1}`, x + 22, y + rh / 2, { align: 'center', color: '#13261d' });
          ctx.fillStyle = 'rgba(19,38,29,0.22)'; ctx.fillRect(x + 42, y + rh / 2 - 9, cw - 62, 6); ctx.fillRect(x + 42, y + rh / 2 + 4, (cw - 62) * 0.7, 6);
        });
      }
    });
    // a pair: president + vice-president
    A(seg(t, 5.2, 5.8), () => {
      ctx.fillStyle = 'rgba(8,19,13,0.88)'; ctx.fillRect(0, 210, W, 520);
      const g = back(seg(t, 5.4, 6.4));
      person(CX - 110, 470, 150 * g, C.iot);
      person(CX + 110, 470, 150 * g, C.gyu);
      A(seg(t, 6.2, 6.8), () => {
        font(700, 30); text('president', CX - 110, 560, { align: 'center', color: C.ink }); text('vice-president', CX + 110, 560, { align: 'center', color: C.ink });
        font(500, 24); text('one ticket · five years', CX, 620, { align: 'center', color: C.soft });
      });
    });
  });
}

// ---------- B: the two locks ----------
function door(t, x, y, w, h, open1, open2, title = 'WIN IN ROUND ONE') {
  ctx.fillStyle = C.door; k.rrect(x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(245,242,234,0.18)'; ctx.lineWidth = 3; k.rrect(x + 16, y + 16, w - 32, h - 32, 8); ctx.stroke();
  font(800, 26); text(title, x + w / 2, y + 56, { align: 'center', color: C.ink, spacing: '2px' });
  padlock(x + w * 0.3, y + h * 0.48, 92, open1);
  padlock(x + w * 0.7, y + h * 0.48, 92, open2);
}
function sceneLocks(t) {
  const a = span(t, 9.4, 23.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('THE CONSTITUTION, ARTICLE 93');
    const g = eout(seg(t, 9.6, 10.6));
    A(g, () => door(t, 152, 190, 560, 360, -1, -1));
    A(seg(t, 14.4, 15.0), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 590, 340, 150, 14); ctx.fill();
      font(800, 26); text('LOCK ONE', 250, 626, { align: 'center', color: C.gold });
      font(600, 24); text('more than half of', 250, 668, { align: 'center', color: C.ink }); text('the valid ballots', 250, 702, { align: 'center', color: C.ink });
    });
    A(seg(t, 19.0, 19.6), () => {
      ctx.fillStyle = C.panel; k.rrect(444, 590, 340, 150, 14); ctx.fill();
      font(800, 26); text('LOCK TWO', 614, 626, { align: 'center', color: C.gold });
      font(600, 24); text('more than half of all', 614, 668, { align: 'center', color: C.ink }); text('voters cast a ballot', 614, 702, { align: 'center', color: C.ink });
    });
  });
}

// ---------- C: 2026 ----------
function scene2026(t) {
  const a = span(t, 23.2, 37.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('25 OCTOBER 2026 · FIRST ROUND');
    // small door with the two locks, top right of centre
    const l1 = t > 26.4 ? 0 : -1, l2 = t > 31.0 ? 0 : -1;
    ctx.save(); ctx.translate(CX, 250); ctx.scale(0.5, 0.5); door(t, -280, -180, 560, 360, l1, l2); ctx.restore();
    // lock one: the shares
    const p = eio(seg(t, 23.8, 25.4));
    A(seg(t, 23.6, 24.0), () => {
      font(700, 22); text('share of valid ballots', 150, 384, { color: C.soft });
      shareBar(470, [[IOT, C.iot], [GYU, C.gyu], [100 - IOT - GYU, C.other]], 600, 150, p);
      A(seg(t, 25.0, 25.6), () => {
        font(700, 22); text(`Iotova ${IOT.toFixed(2)}%`, 150, 530, { color: C.iot });
        text(`Gyurov ${GYU.toFixed(2)}%`, 150 + (600 * IOT) / 100 + 8, 530, { color: C.gyu });
        text('others', 690, 530, { align: 'center', color: C.soft });
      });
    });
    // lock two: the crowd
    A(seg(t, 28.0, 28.5) * (1 - seg(t, 32.4, 32.8)), () => {
      ctx.fillStyle = '#0f2018'; k.rrect(80, 356, 704, 404, 16); ctx.fill();
      font(700, 22); text('100 registered voters: how many voted?', 112, 398, { color: C.soft });
      crowd(112, 492, Math.round(T26), eio(seg(t, 28.6, 30.4)), 32);
      A(seg(t, 30.4, 31.0), () => { font(800, 26); text('fewer than 1 in 4 voted', 112, 726, { color: C.gyu }); });
    });
    // even 100%
    A(seg(t, 32.6, 33.1), () => {
      ctx.fillStyle = '#0f2018'; k.rrect(80, 356, 704, 404, 16); ctx.fill();
      font(700, 22); text('imagine one pair got every single vote', 150, 404, { color: C.soft });
      shareBar(490, [[100, C.iot]], 600, 150, eio(seg(t, 33.0, 34.0)));
      A(seg(t, 34.0, 34.6), () => {
        padlock(300, 640, 62, 1); padlock(564, 640, 62, 0);
        font(700, 22); text('100% of ballots', 300, 718, { align: 'center', color: C.open }); text('but under half voted', 564, 718, { align: 'center', color: C.shut });
      });
    });
  });
}

// ---------- D: the runoff ----------
function sceneRunoff(t) {
  const a = span(t, 37.0, 46.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('THE SECOND ROUND');
    const g = back(seg(t, 37.4, 38.4));
    person(272, 380, 150 * g, C.iot); person(592, 380, 150 * g, C.gyu);
    A(seg(t, 38.0, 38.6), () => {
      font(700, 28); text('Iotova', 272, 476, { align: 'center', color: C.iot }); text('Gyurov', 592, 476, { align: 'center', color: C.gyu });
      font(800, 44); text('vs', CX, 380, { align: 'center', color: C.soft });
    });
    A(seg(t, 39.0, 39.6), () => {
      ctx.fillStyle = C.panel; k.rrect(232, 196, 400, 64, 32); ctx.fill();
      font(700, 26); text('within seven days', CX, 229, { align: 'center', color: C.gold });
    });
    A(seg(t, 42.0, 42.6), () => {
      ctx.fillStyle = C.panel; k.rrect(110, 540, 644, 180, 16); ctx.fill();
      padlock(220, 612, 62, -1);
      font(700, 28); text('no turnout lock', 290, 596, { color: C.ink });
      font(600, 26); text('more votes than the other = elected', 290, 646, { color: C.open });
      A(seg(t, 42.6, 43.0), () => { ctx.strokeStyle = C.shut; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(180, 580); ctx.lineTo(260, 660); ctx.stroke(); });
    });
  });
}

// ---------- E: 2006 and the close ----------
function scene2006(t) {
  const a = span(t, 46.2, 55.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('2006 · PRESIDENT GEORGI PARVANOV');
    ctx.save(); ctx.translate(CX, 250); ctx.scale(0.5, 0.5);
    door(t, -280, -180, 560, 360, t > 48.4 ? 1 : -1, t > 51.6 ? 0 : -1);
    ctx.restore();
    A(seg(t, 46.6, 47.0), () => {
      font(700, 22); text('round one: share of valid ballots', 150, 384, { color: C.soft });
      shareBar(470, [[PARV.first, C.iot], [100 - PARV.first, C.other]], 600, 150, eio(seg(t, 46.8, 48.2)));
      A(seg(t, 48.0, 48.6), () => { font(800, 26); text(`${PARV.first}%`, 150 + 6 * PARV.first - 12, 530, { align: 'right', color: C.iot }); });
    });
    A(seg(t, 51.2, 51.6), () => {
      font(700, 22); text('turnout', 150, 576, { color: C.soft });
      shareBar(650, [[PARV.turnout, C.gyu]], 600, 150, eio(seg(t, 51.4, 52.4)));
      A(seg(t, 52.4, 53.0), () => { font(800, 26); text(`${PARV.turnout}%`, 150 + 6 * PARV.turnout - 12, 710, { align: 'right', color: C.gyu }); });
      A(seg(t, 53.4, 54.0), () => { font(700, 24); text(`runoff: ${Math.round(PARV.runoff)}% on ${Math.round(PARV.turnout2)}% turnout`, 772, 710, { align: 'right', color: C.open }); });
    });
  });
}
function sceneEnd(t) {
  const a = eout(seg(t, 55.4, 56.2));
  if (a <= 0) return;
  A(a, () => {
    header('BULGARIA · SECOND ROUND');
    // a calendar leaf
    const g = back(seg(t, 55.6, 56.6));
    ctx.save(); ctx.translate(CX, 360); ctx.scale(g, g);
    ctx.fillStyle = C.white; k.rrect(-150, -150, 300, 300, 18); ctx.fill();
    ctx.fillStyle = C.red; k.rrect(-150, -150, 300, 80, { upperLeft: 18, upperRight: 18, lowerLeft: 0, lowerRight: 0 }); ctx.fill();
    font(800, 34); text('NOVEMBER', 0, -110, { align: 'center', color: C.white, spacing: '3px' });
    font(800, 150); text('1', 0, 40, { align: 'center', color: '#13261d' });
    font(600, 26); text('2026', 0, 118, { align: 'center', color: 'rgba(19,38,29,0.7)' });
    ctx.restore();
    A(seg(t, 57.0, 57.6), () => {
      ctx.fillStyle = C.panel; k.rrect(130, 580, 604, 120, 14); ctx.fill();
      font(700, 30); text('more votes wins', CX, 620, { align: 'center', color: C.open });
      font(600, 24); text('however many people vote', CX, 662, { align: 'center', color: C.soft });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60.4, fonts: [NUM, SER],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneLocks(t);
    scene2026(t);
    sceneRunoff(t);
    scene2006(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 600, family: SER, ink: C.ink, marks: { '*': C.gold, '^': C.gold, '~': C.shut } });
  },
});
