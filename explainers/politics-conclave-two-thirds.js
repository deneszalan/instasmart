// Explainer for politics-conclave-two-thirds (Roma): how the cardinals elect a pope in the Sistine Chapel. Only
// cardinals under 80 vote, by secret written ballot, up to four times a day; a candidate needs two thirds of the
// votes, so 45 of 133 can block anyone and no faction wins without winning over others; the 1996 rules let a
// majority drop the two-thirds rule after 33 or 34 ballots, and Benedict XVI restored it in 2007; the ballots are
// burned and chemicals make the smoke black or white. Hook: the conclave of 7–8 May 2025.
// Look: cardinal scarlet and fresco ivory on a dark oxblood ground, smoke in black and white; a schematic plan of
// the chapel, the ballot card, a grid of 133 seats. Cormorant Garamond for captions, Inter for labels.
//
// Facts:
// - Universi Dominici Gregis (John Paul II, 22 February 1996, vatican.va, as amended): art. 33 only cardinals who
//   have not reached their 80th birthday before the day the see falls vacant may elect; art. 51 the election takes
//   place exclusively in the Sistine Chapel; art. 62 at least two thirds of the votes of the electors present and
//   voting; art. 63 one ballot on the first afternoon, then two in the morning and two in the afternoon; art. 64
//   three scrutineers drawn by lot; art. 65 the card reads "Eligo in Summum Pontificem", the name is written in
//   handwriting that cannot be identified as the elector's, the card is folded twice; art. 66 each elector carries
//   it to the altar and says "I call as my witness Christ the Lord who will be my judge, that my vote is given to
//   the one who before God I think should be elected", then puts it in the receptacle; art. 68 the third scrutineer
//   reads each name aloud; art. 69 he pierces each card with a needle through the word "Eligo" and puts it on a
//   thread; art. 70 the cards are burned before the electors leave the chapel, after the second ballot when two
//   follow each other.
// - Wikipedia, "Universi Dominici gregis": in 1996 two thirds was needed for the first 33 ballots (34 with a ballot
//   on the first afternoon); after that an absolute majority of the electors could change the rule, though an
//   absolute majority was still needed; on 11 June 2007 Benedict XVI (De aliquibus mutationibus) restored two thirds
//   however many ballots are taken. Normas nonnullas (vatican.va, 22 February 2013): two thirds stays; after the long
//   series only the two leading names can be elected and they do not vote. Wikipedia, "Papal election reforms of
//   Pope Benedict XVI": Paul Collins (2005) wrote that the 1996 rule would "encourage a small majority to hold out
//   against a large minority".
// - Vatican News, 7 May 2025, "The Conclave begins": the 133 cardinal electors entered the Sistine Chapel; "a
//   two-thirds majority, in this case at least 89 votes"; up to four rounds of voting a day. Vatican News, Sistine
//   Chapel prepared: all ballots are burned and the smoke rises from the chimney; the first ballot on the evening of
//   7 May, then four a day, two in the morning and two in the afternoon. Vatican News, 2025 look back: Robert
//   Francis Prevost elected on 8 May on the fourth ballot; first pope from the United States.
// - Wikipedia, "2025 papal conclave": 7–8 May 2025; 135 cardinals under 80, all but two attended, 133; 89 votes;
//   one ballot on 7 May (black smoke), ballots 2 and 3 on the morning of 8 May (black smoke at 11:51), the fourth in
//   the afternoon, white smoke at 6:07 p.m.; vote counts only "reportedly".
// - EWTN/CNA (H. Brockhaus, 8 May 2025): white smoke from potassium chlorate, lactose and rosin; black from potassium
//   perchlorate, anthracene and sulphur; a second stove added in 2005. Wikipedia, "Papal conclave": the Vatican
//   disclosed the mixtures in 2013; white uses pine rosin.
// Computed here: ⌈2 × 133 / 3⌉ = 89; 133 − 89 + 1 = 45 can block; ⌊133 / 2⌋ + 1 = 67. The blocs 48, 36, 27 and 22
// are an imagined split (no two reach 89; the biggest and any other reach 67), labelled as such on screen.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The Sistine Chapel, 7 May 2025: 133 electors walk in; 135 under 80, two absent.
//  B  9.6–18.6  The card: Eligo in Summum Pontificem; disguised hand; folded; the urn on the altar; the oath.
//  C 18.8–23.2  Three scrutineers read each name; needle and thread.
//  D 23.4–32.4  Two thirds of 133 = 89; 45 can block; an imagined split into four blocs.
//  E 32.6–41.6  1996: after 33 or 34 ballots a majority of 67 could decide; 2007: two thirds again.
//  F 41.8–50.8  The stove and the chimney; chemicals for black and white smoke.
//  G 51.0–65.0  8 May 2025: ballots 1–4, black, black, white; Leo XIV.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg: '#1a0b0e', bg2: '#2a1116', ink: '#f6eee1', soft: 'rgba(246,238,225,0.74)', faint: 'rgba(246,238,225,0.2)',
  scarlet: '#d8283f', scarlet2: '#8f1a2a', ivory: '#f1e6cf', ivory2: '#d9c9a8', gold: '#e8b85a', fresco: '#6d8fb4',
  smokeB: '#3a3533', smokeW: '#fbfaf7', grey: '#a59d94', iron: '#4b4542', stone: '#c9b9a0', ink2: '#2b1e18',
  b1: '#e8b85a', b2: '#6d8fb4', b3: '#b98ad6', b4: '#7cc29a',
};
const SERIF = 'Cormorant Garamond', SANS = 'Inter';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const ELECTORS = 133, ELIGIBLE = 135, AGE = 80;
const need = (n) => Math.ceil((2 * n) / 3), majority = (n) => Math.floor(n / 2) + 1;
const NEED = need(ELECTORS), BLOCK = ELECTORS - NEED + 1, MAJ = majority(ELECTORS);
const BLOCS = [48, 36, 27, 22];
const SWITCH = 34; // 33 ballots, or 34 with a ballot on the first afternoon (as in 2025)
if (NEED !== 89 || BLOCK !== 45 || MAJ !== 67 || BLOCS.reduce((a, b) => a + b) !== ELECTORS) throw new Error('numbers');
// no two blocs reach two thirds; the biggest and the smallest reach a majority
for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (BLOCS[i] + BLOCS[j] >= NEED) throw new Error('blocs');
if (BLOCS[0] + BLOCS[3] < MAJ) throw new Error('majority');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, `On 7 May 2025, ${ELECTORS} cardinals walked into the *Sistine Chapel* in the Vatican to elect a pope.`],
  [5.0, 9.4, `Only cardinals under ${AGE} may vote. ${ELIGIBLE} qualified in 2025; two of them could not come.`],
  [9.6, 14.0, 'Each writes one name on a card headed *Eligo in Summum Pontificem*: I elect as Supreme Pontiff.'],
  [14.2, 18.6, 'He disguises his handwriting, folds the card and puts it in an urn on the altar, under oath.'],
  [18.8, 23.2, 'Three scrutineers, drawn by lot, read out every name and put each card on a needle and thread.'],
  [23.4, 27.8, `To win, a cardinal needs *two thirds* of the votes: with ${ELECTORS} voting, that is *${NEED}*.`],
  [28.0, 32.4, `So any ${BLOCK} cardinals can block a candidate: no faction wins without winning over others.`],
  [32.6, 37.0, 'Pope John Paul II’s rules of 1996 let a majority drop two thirds after 33 or 34 ballots.'],
  [37.2, 41.6, 'Critics said a majority could then simply hold out. In 2007 *Benedict XVI* restored two thirds.'],
  [41.8, 46.2, 'The cards are burned after each morning and afternoon of voting; the smoke rises from a chimney.'],
  [46.4, 50.8, 'Chemicals colour it: ~black~ means no pope yet, ^white^ means a pope has been elected.'],
  [51.0, 55.4, '7 May: one ballot, black smoke. 8 May: two more ballots in the morning, black smoke at 11:51.'],
  [55.6, 60.0, `That afternoon, on the *fourth ballot*, one cardinal had at least ${NEED} votes: white smoke at 6:07 p.m.`],
  [60.2, 64.6, 'It was Robert Francis Prevost, the first pope from the United States. He took the name *Leo XIV*.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg); lg.addColorStop(0.62, C.bg2); lg.addColorStop(1, '#140709');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // a faint marble-floor lattice, as in the chapel's cosmatesque pavement
  g.strokeStyle = 'rgba(246,238,225,0.035)'; g.lineWidth = 1;
  for (let d = -H; d < W + H; d += 48) { g.beginPath(); g.moveTo(d, 0); g.lineTo(d + H, H); g.stroke(); g.beginPath(); g.moveTo(d, H); g.lineTo(d + H, 0); g.stroke(); }
}
function label(str, x, y, { size = 22, col = C.ink, align = 'left', weight = 500, fam = SANS } = {}) { font(weight, size, fam); text(str, x, y, { align, base: 'middle', color: col }); }
function pill(str, x, y, col, { align = 'center', size = 22, fill = 'rgba(26,11,14,0.9)' } = {}) {
  font(600, size); const w = ctx.measureText(str).width, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.fillStyle = fill; k.rrect(x0 - 12, y - size * 0.82, w + 24, size * 1.64, 9); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
  text(str, x0, y, { base: 'middle', color: col });
}
function dot(x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
// a cardinal seen from above: a scarlet zucchetto on a scarlet cape
function cardinal(x, y, s = 1, col = C.scarlet) { dot(x, y, 7 * s, col); dot(x, y, 3.2 * s, '#5a0f19'); }
// deterministic noise
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// smoke from (x, y) in colour col; dens from 0 to 1
function smoke(t, x, y, col, dens, { n = 26, rise = 260, spread = 60 } = {}) {
  if (dens <= 0) return;
  for (let i = 0; i < n; i++) {
    const age = ((t * 0.42 + i / n) % 1);
    const yy = y - age * rise, xx = x + Math.sin(i * 1.7 + t * 0.9) * 6 + age * age * spread * (hash(i) - 0.3);
    ctx.globalAlpha = dens * (1 - age) * 0.75;
    dot(xx, yy, 8 + age * 30, col);
  }
  ctx.globalAlpha = 1;
}

// ---------- A: the chapel and its electors ----------
const PX0 = 92, PX1 = 772, PY0 = 200, PY1 = 470;
const SEATS = (() => {
  const s = [];
  const rows = [[PY0 + 34, 34], [PY0 + 62, 33], [PY1 - 62, 33], [PY1 - 34, 33]];
  for (const [y, n] of rows) for (let i = 0; i < n; i++) s.push([210 + (i * 520) / 33 + (n === 33 ? 8 : 0), y]);
  return s;
})();
if (SEATS.length !== ELECTORS) throw new Error('seats');
function chapelPlan(a, t, { fill = 1, absent = 0, urn = 0 } = {}) {
  A(a, () => {
    // walls
    ctx.fillStyle = 'rgba(241,230,207,0.06)'; ctx.fillRect(PX0, PY0, PX1 - PX0, PY1 - PY0);
    ctx.strokeStyle = C.stone; ctx.lineWidth = 6; ctx.strokeRect(PX0, PY0, PX1 - PX0, PY1 - PY0);
    // the entrance at the far end
    ctx.fillStyle = C.bg2; ctx.fillRect(PX1 - 3, (PY0 + PY1) / 2 - 26, 8, 52);
    // the altar wall: Michelangelo's Last Judgment
    const lg = ctx.createLinearGradient(PX0, 0, PX0 + 26, 0); lg.addColorStop(0, C.fresco); lg.addColorStop(1, 'rgba(109,143,180,0.1)');
    ctx.fillStyle = lg; ctx.fillRect(PX0 + 3, PY0 + 3, 24, PY1 - PY0 - 6);
    ctx.fillStyle = C.ivory2; ctx.fillRect(PX0 + 40, (PY0 + PY1) / 2 - 30, 26, 60); // the altar
    // tables in front of the seats
    ctx.strokeStyle = 'rgba(217,201,168,0.55)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(200, PY0 + 84); ctx.lineTo(748, PY0 + 84); ctx.moveTo(200, PY1 - 84); ctx.lineTo(748, PY1 - 84); ctx.stroke();
    // the electors, walking in from the entrance in order
    const n = Math.round(fill * ELECTORS);
    for (let i = 0; i < n; i++) {
      const [sx, sy] = SEATS[i];
      const walk = clamp(fill * ELECTORS - i, 0, 1), ex = PX1 - 10, ey = (PY0 + PY1) / 2;
      cardinal(lerp(ex, sx, eout(walk)), lerp(ey, sy, eout(walk)), 0.9);
    }
    if (urn > 0) A(urn, () => { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.ellipse(PX0 + 53, (PY0 + PY1) / 2, 10, 10, 0, 0, TAU); ctx.fill(); });
    label('altar', PX0 + 53, PY1 + 26, { size: 22, col: C.soft, align: 'center' });
    label('Last Judgment', PX0 + 4, PY0 - 24, { size: 22, col: C.fresco, weight: 600 });
    label('entrance', PX1, PY1 + 26, { size: 22, col: C.soft, align: 'right' });
    if (absent > 0) A(absent, () => {
      for (let i = 0; i < 2; i++) { ctx.strokeStyle = C.grey; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(PX0 + 10 + i * 30, PY1 + 76, 7, 0, TAU); ctx.stroke(); }
      label('2 could not come', PX0 + 64, PY1 + 76, { size: 22, col: C.grey });
    });
  });
}
function sceneChapel(t) {
  const a = span(t, 0, 9.6, 0.5, 0.4);
  if (a <= 0) return;
  const fill = eio(seg(t, 0.8, 4.4));
  chapelPlan(a, t, { fill, absent: seg(t, 6.0, 6.8), urn: 1 });
  A(a, () => {
    A(seg(t, 0.4, 1.2), () => {
      label('SISTINE CHAPEL · 7 MAY 2025', 56, 92, { size: 26, weight: 700 });
      label('schematic plan, seen from above', 56, 126, { size: 22, col: C.soft });
    });
    const n = Math.round(fill * ELECTORS);
    A(seg(t, 1.0, 1.6), () => {
      label(`${n}`, CX, 600, { size: 88, weight: 600, col: C.scarlet, align: 'center', fam: SERIF });
      label('cardinal electors', CX, 664, { size: 26, col: C.ink, align: 'center' });
    });
    A(seg(t, 5.4, 6.2), () => {
      label(`under ${AGE} when the see fell vacant: ${ELIGIBLE}`, CX, 712, { size: 22, col: C.soft, align: 'center' });
    });
  });
}

// ---------- B: the ballot card ----------
const CARD = { x: 120, y: 190, w: 330, h: 430 };
function card(cx, cy, w, h, { write = 0, fold = 0 } = {}) {
  // fold: 0 flat, 1 folded in half (the top half drops onto the bottom)
  const x = cx - w / 2, y = cy - h / 2;
  const top = lerp(h / 2, 0, fold); // visible height of the top half
  ctx.fillStyle = C.ivory; ctx.fillRect(x, y + h / 2 - top, w, top + h / 2);
  ctx.strokeStyle = C.ivory2; ctx.lineWidth = 2; ctx.strokeRect(x, y + h / 2 - top, w, top + h / 2);
  if (fold < 0.5) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y + h / 2 - top, w, top); ctx.clip();
    const sy = top / (h / 2);
    ctx.translate(cx, y + h / 2); ctx.scale(1, sy); ctx.translate(-cx, -(y + h / 2));
    font(600, w * 0.115, SERIF); text('Eligo in Summum', cx, y + h * 0.2, { align: 'center', base: 'middle', color: C.ink2 });
    text('Pontificem', cx, y + h * 0.31, { align: 'center', base: 'middle', color: C.ink2 });
    ctx.restore();
  }
  ctx.strokeStyle = 'rgba(43,30,24,0.25)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(x + 10, y + h / 2); ctx.lineTo(x + w - 10, y + h / 2); ctx.stroke(); ctx.setLineDash([]);
  // the name, in a deliberately plain, unrecognisable hand
  if (write > 0) {
    ctx.strokeStyle = '#1f2a4a'; ctx.lineWidth = Math.max(2, w * 0.011); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    const N = 60, m = Math.floor(N * write);
    for (let i = 0; i <= m; i++) {
      const u = i / N, xx = x + w * 0.16 + u * w * 0.68, yy = y + h * 0.72 + Math.sin(u * 34) * h * 0.035 * (0.6 + 0.4 * Math.sin(u * 7 + 1));
      i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.stroke();
  }
}
function urnAt(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = C.gold;
  ctx.beginPath(); ctx.moveTo(-70, -60); ctx.quadraticCurveTo(-74, 30, 0, 44); ctx.quadraticCurveTo(74, 30, 70, -60); ctx.closePath(); ctx.fill();
  ctx.fillRect(-12, 40, 24, 36); ctx.beginPath(); ctx.ellipse(0, 80, 46, 10, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#b98a2e'; ctx.beginPath(); ctx.ellipse(0, -60, 70, 14, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C.bg; ctx.beginPath(); ctx.ellipse(0, -60, 58, 9, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function sceneBallot(t) {
  const a = span(t, 9.6, 18.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const write = eio(seg(t, 11.0, 12.8)), fold = eio(seg(t, 14.6, 15.4)), go = eio(seg(t, 15.8, 17.2));
    const cx = lerp(CARD.x + CARD.w / 2, 640, go), cy = lerp(CARD.y + CARD.h / 2, 420, go), sc = lerp(1, 0.32, go);
    urnAt(640, 500, 1);
    A(1 - seg(t, 17.0, 17.4), () => card(cx, cy, CARD.w * sc, CARD.h * sc, { write: 1 * write, fold }));
    // the translation and notes
    A(seg(t, 10.0, 10.8) * (1 - seg(t, 14.4, 14.8)), () => {
      label('“I elect as', 500, 270, { size: 34, col: C.ink, fam: SERIF, weight: 600 });
      label('Supreme Pontiff”', 500, 312, { size: 34, col: C.ink, fam: SERIF, weight: 600 });
      label('one name on each card', 500, 370, { size: 22, col: C.soft });
    });
    A(seg(t, 12.6, 13.2) * (1 - seg(t, 14.4, 14.8)), () => {
      label('in a hand that cannot be recognised', CARD.x + CARD.w / 2, CARD.y + CARD.h + 34, { size: 22, col: C.soft, align: 'center' });
    });
    A(seg(t, 15.0, 15.8), () => {
      label('the urn on the altar', 640, 612, { size: 22, col: C.gold, align: 'center', weight: 600 });
    });
    A(seg(t, 15.6, 16.4), () => {
      font(500, 30, SERIF);
      text('“I call as my witness Christ the Lord,', 56, 112, { base: 'middle', color: C.ivory });
      text('who will be my judge…”', 56, 150, { base: 'middle', color: C.ivory });
      label('the oath each elector says at the altar', 56, 188, { size: 22, col: C.soft });
    });
    A(seg(t, 10.2, 11.0), () => pill('1 ballot on the first afternoon, then up to 4 a day', CX, 724, C.ivory2, { size: 22 }));
  });
}

// ---------- C: the scrutineers ----------
function sceneCount(t) {
  const a = span(t, 18.8, 23.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    urnAt(150, 330, 0.7);
    // the three scrutineers at their table
    ctx.fillStyle = C.ivory2; ctx.fillRect(300, 190, 420, 16);
    for (let i = 0; i < 3; i++) cardinal(360 + i * 150, 160, 2.2);
    label('three scrutineers, drawn by lot', 510, 104, { size: 22, col: C.soft, align: 'center' });
    // cards fly from the urn to the table, one by one, then onto the thread
    const N = 16;
    for (let i = 0; i < N; i++) {
      const t0 = 19.2 + i * 0.22, u = seg(t, t0, t0 + 0.5), v = seg(t, t0 + 0.6, t0 + 1.1);
      if (u <= 0) continue;
      const tx = 660, ty = 230;
      // the thread: a hanging curve from (260, 420) to (760, 420)
      const s = (i + 0.5) / N, hx = lerp(260, 760, s), hy = 420 + Math.sin(s * Math.PI) * 120;
      const x = v > 0 ? lerp(tx, hx, eio(v)) : lerp(150, tx, eio(u)), y = v > 0 ? lerp(ty, hy, eio(v)) : lerp(280, ty, eio(u)) - Math.sin(u * Math.PI) * 60;
      ctx.fillStyle = C.ivory; ctx.fillRect(x - 11, y - 15, 22, 30); ctx.strokeStyle = C.ivory2; ctx.lineWidth = 1; ctx.strokeRect(x - 11, y - 15, 22, 30);
    }
    // the thread
    A(seg(t, 19.6, 20.2), () => {
      ctx.strokeStyle = C.scarlet; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const s = i / 40, x = lerp(260, 760, s), y = 420 + Math.sin(s * Math.PI) * 120; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      // the needle
      ctx.strokeStyle = C.grey; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(760, 420); ctx.lineTo(800, 396); ctx.stroke();
      label('needle and thread, through the word Eligo', CX, 600, { size: 22, col: C.scarlet, align: 'center', weight: 600 });
    });
    // tally
    A(seg(t, 19.4, 20.0), () => {
      const n = Math.round(clamp((t - 19.4) / 3.4) * 16);
      label('each name read out aloud', 300, 262, { size: 22, col: C.ivory });
      for (let i = 0; i < n; i++) {
        const g = Math.floor(i / 5), j = i % 5, x = 300 + g * 52 + j * 9;
        ctx.strokeStyle = C.ivory; ctx.lineWidth = 3; ctx.beginPath();
        if (j < 4) { ctx.moveTo(x, 290); ctx.lineTo(x, 318); } else { ctx.moveTo(x - 40, 312); ctx.lineTo(x - 2, 296); }
        ctx.stroke();
      }
    });
  });
}

// ---------- D: two thirds of 133 ----------
const GX0 = 108, GY0 = 236, GD = 36, COLS = 19; // 19 × 7 = 133
const gridXY = (i) => [GX0 + (i % COLS) * GD, GY0 + Math.floor(i / COLS) * GD];
const BLOC_COL = [C.b1, C.b2, C.b3, C.b4];
const blocOf = (i) => { let s = 0; for (let b = 0; b < 4; b++) { s += BLOCS[b]; if (i < s) return b; } return 3; };
function sceneThird(t) {
  const a = span(t, 23.4, 32.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const gold = Math.round(eio(seg(t, 24.0, 25.8)) * NEED), red = seg(t, 28.4, 29.2), split = seg(t, 30.0, 30.8);
    for (let i = 0; i < ELECTORS; i++) {
      const [x, y] = gridXY(i);
      let col = i < gold ? C.gold : 'rgba(246,238,225,0.28)';
      if (red > 0 && i >= ELECTORS - BLOCK) col = C.scarlet;
      if (split > 0) { ctx.globalAlpha = split; dot(x, y, 12, BLOC_COL[blocOf(i)]); ctx.globalAlpha = 1 - split; }
      dot(x, y, 12, col); ctx.globalAlpha = 1;
    }
    A(seg(t, 23.6, 24.2) * (1 - split), () => label(`${ELECTORS} electors`, GX0 - 12, GY0 - 44, { size: 24, weight: 700 }));
    A(seg(t, 25.0, 25.8) * (1 - seg(t, 27.9, 28.3)), () => {
      label(`${ELECTORS} × ⅔ = ${(ELECTORS * 2 / 3).toFixed(2)}, so ${NEED} votes`, CX, 540, { size: 34, weight: 600, col: C.gold, align: 'center' });
      label('two thirds of the electors present and voting', CX, 586, { size: 22, col: C.soft, align: 'center' });
    });
    A(seg(t, 28.4, 29.0) * (1 - seg(t, 29.7, 30.1)), () => {
      label(`${BLOCK} votes against: the best anyone can get is ${ELECTORS - BLOCK}`, CX, 540, { size: 28, weight: 600, col: C.scarlet, align: 'center' });
      label(`one short of ${NEED}`, CX, 584, { size: 22, col: C.soft, align: 'center' });
    });
    A(seg(t, 30.2, 30.8), () => {
      label('an imagined split into four groups', GX0 - 12, GY0 - 44, { size: 22, col: C.soft });
      BLOCS.forEach((b, i) => { const x = 120 + i * 172; dot(x, 530, 10, BLOC_COL[i]); label(`${b}`, x + 20, 530, { size: 28, weight: 700, col: BLOC_COL[i] }); });
      label(`best two together: ${BLOCS[0]} + ${BLOCS[1]} = ${BLOCS[0] + BLOCS[1]}, short of ${NEED}`, CX, 600, { size: 24, col: C.ink, align: 'center', weight: 600 });
    });
  });
}

// ---------- E: the 1996 rule and its end in 2007 ----------
const BX0 = 90, BX1 = 790, BY = 420;
const bx = (v) => BX0 + (v / ELECTORS) * (BX1 - BX0);
function sceneRule(t) {
  const a = span(t, 32.6, 41.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const drop = eio(seg(t, 35.6, 36.4)), back = eio(seg(t, 39.3, 40.1));
    const line = lerp(lerp(NEED, MAJ, drop), NEED, back);
    // axis
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(BX0, BY + 60); ctx.lineTo(BX1, BY + 60); ctx.stroke();
    label('0', BX0, BY + 88, { size: 22, col: C.soft, align: 'center' }); label(`${ELECTORS}`, BX1, BY + 88, { size: 22, col: C.soft, align: 'center' });
    // the coalition of the biggest and smallest groups
    const grow = eio(seg(t, 33.0, 33.8));
    ctx.fillStyle = C.b1; ctx.fillRect(BX0, BY, (bx(BLOCS[0]) - BX0) * grow, 44);
    ctx.fillStyle = C.b4; ctx.fillRect(bx(BLOCS[0] * grow), BY, (bx(BLOCS[3]) - BX0) * grow, 44);
    const sum = BLOCS[0] + BLOCS[3], wins = sum >= line - 0.01;
    A(grow, () => {
      label(`two imagined groups: ${BLOCS[0]} + ${BLOCS[3]} = ${sum}`, BX0, BY + 122, { size: 24, weight: 700, col: C.ink });
      label(wins ? 'enough to elect' : 'not enough', BX1, BY + 122, { size: 24, weight: 700, col: wins ? C.gold : C.soft, align: 'right' });
    });
    // the threshold line
    const lx = bx(line);
    ctx.strokeStyle = line > MAJ + 0.5 ? C.gold : C.ivory; ctx.lineWidth = 4; ctx.setLineDash([10, 6]);
    ctx.beginPath(); ctx.moveTo(lx, BY - 24); ctx.lineTo(lx, BY + 74); ctx.stroke(); ctx.setLineDash([]);
    A(clamp((line - NEED + 0.6) / 0.6), () => label(`two thirds: ${NEED}`, lx, BY - 48, { size: 26, weight: 700, col: C.gold, align: 'center' }));
    A(clamp((MAJ + 0.6 - line) / 0.6), () => label(`majority: ${MAJ}`, lx, BY - 48, { size: 26, weight: 700, col: C.ivory, align: 'center' }));
    // the ballot counter
    const bn = Math.round(lerp(1, SWITCH, seg(t, 33.0, 35.6)));
    A(seg(t, 32.8, 33.4), () => {
      label('BALLOT', 56, 160, { size: 22, weight: 700, col: C.soft });
      label(`${bn}`, 56, 220, { size: 72, weight: 600, col: C.ink, fam: SERIF });
      label('1996–2007', W - 56, 182, { size: 22, weight: 700, col: C.soft, align: 'right' });
    });
    A(seg(t, 36.2, 36.8) * (1 - seg(t, 38.7, 39.1)), () => {
      label('after 33 or 34 ballots, a majority could decide', CX, 600, { size: 24, col: C.ivory, align: 'center', weight: 600 });
      label('to elect by majority instead', CX, 636, { size: 22, col: C.soft, align: 'center' });
    });
    A(seg(t, 37.6, 38.2) * (1 - seg(t, 38.7, 39.1)), () => label('so a big enough group could just wait for it', CX, 690, { size: 22, col: C.soft, align: 'center' }));
    A(seg(t, 39.3, 39.9), () => {
      pill('11 June 2007: two thirds for every ballot', CX, 620, C.gold, { size: 24 });
      label('Pope Benedict XVI’s change, still in force', CX, 672, { size: 22, col: C.soft, align: 'center' });
    });
  });
}

// ---------- F: the stove and the smoke ----------
function chapelOutside(x0, y0, w, h) {
  // the plain brick box of the chapel with its low roof and a thin chimney
  ctx.fillStyle = '#8b6a55'; ctx.fillRect(x0, y0, w, h);
  ctx.fillStyle = '#6f5444'; for (let i = 0; i < 6; i++) ctx.fillRect(x0 + 30 + i * (w - 60) / 5 - 10, y0 + 40, 20, 70);
  ctx.fillStyle = '#5b4436'; ctx.beginPath(); ctx.moveTo(x0 - 10, y0); ctx.lineTo(x0 + 40, y0 - 34); ctx.lineTo(x0 + w - 40, y0 - 34); ctx.lineTo(x0 + w + 10, y0); ctx.closePath(); ctx.fill();
}
function sceneStove(t) {
  const a = span(t, 41.8, 51.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const x0 = 120, y0 = 300, w = 620, h = 360, chX = 560, chTop = y0 - 120;
    // smoke from the chimney
    const blk = seg(t, 42.8, 43.8) * (1 - seg(t, 48.2, 48.8)), wht = seg(t, 48.4, 49.2);
    smoke(t, chX, chTop, C.smokeB, blk, { rise: 200 });
    smoke(t + 3, chX, chTop, C.smokeW, wht, { rise: 200 });
    chapelOutside(x0, y0, w, h);
    // cutaway: the interior with the stove
    ctx.fillStyle = C.bg2; ctx.fillRect(x0 + 300, y0 + 150, 280, 190);
    ctx.strokeStyle = C.iron; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(chX, y0 + 210); ctx.lineTo(chX, chTop); ctx.stroke();
    ctx.fillStyle = C.iron; k.rrect(chX - 46, y0 + 210, 92, 110, 14); ctx.fill();
    const glow = 0.5 + 0.5 * Math.sin(t * 9);
    ctx.fillStyle = `rgba(232,120,60,${0.45 + 0.35 * glow})`; ctx.fillRect(chX - 26, y0 + 262, 52, 30);
    // the second stove for the chemicals
    ctx.fillStyle = '#5d5652'; k.rrect(chX - 150, y0 + 250, 70, 70, 10); ctx.fill();
    ctx.strokeStyle = '#5d5652'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(chX - 115, y0 + 250); ctx.lineTo(chX - 115, y0 + 196); ctx.lineTo(chX, y0 + 196); ctx.stroke();
    label('SISTINE CHAPEL', x0 + 20, y0 + 160, { size: 22, weight: 700, col: C.ivory });
    label('cut away', x0 + 20, y0 + 190, { size: 22, col: C.soft });
    A(seg(t, 42.4, 43.0), () => {
      label('ballots burn here', chX + 60, y0 + 280, { size: 22, col: C.ivory });
      label('chimney on the roof', chX + 26, chTop + 20, { size: 22, col: C.soft });
    });
    // the threaded cards going into the stove
    for (let i = 0; i < 8; i++) {
      const u = seg(t, 42.0 + i * 0.12, 42.9 + i * 0.12);
      if (u <= 0 || u >= 1) continue;
      ctx.fillStyle = C.ivory; ctx.globalAlpha = 1 - u; ctx.fillRect(lerp(x0 + 340, chX - 8, u) + i * 3, lerp(y0 + 170, y0 + 270, u), 16, 22); ctx.globalAlpha = 1;
    }
    A(seg(t, 46.6, 47.4), () => {
      const y = 116;
      dot(70, y, 12, C.smokeB); ctx.strokeStyle = C.grey; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(70, y, 12, 0, TAU); ctx.stroke();
      label('black: potassium perchlorate,', 96, y - 14, { size: 22, col: C.ivory, weight: 600 }); label('anthracene, sulphur', 96, y + 14, { size: 22, col: C.soft });
      dot(70, y + 80, 12, C.smokeW);
      label('white: potassium chlorate,', 96, y + 66, { size: 22, col: C.ivory, weight: 600 }); label('lactose, pine rosin', 96, y + 94, { size: 22, col: C.soft });
      label('a second stove burns the chemicals', chX - 115, y0 + h + 32, { size: 22, col: C.soft, align: 'center' });
    });
  });
}

// ---------- G: 7–8 May 2025 ----------
const SESS = [
  { day: '7 May', part: 'evening', ballots: [1], white: false, time: '' },
  { day: '8 May', part: 'morning', ballots: [2, 3], white: false, time: '11:51 a.m.' },
  { day: '8 May', part: 'afternoon', ballots: [4], white: true, time: '6:07 p.m.' },
];
function sceneDays(t) {
  const a = span(t, 51.0, 65.2, 0.4, 0.0);
  if (a <= 0) return;
  const out = eio(seg(t, 60.0, 61.0));
  A(a, () => {
    A(1 - out, () => {
      SESS.forEach((s, i) => {
        const x = 160 + i * 272, t0 = [51.4, 53.2, 56.2][i];
        A(seg(t, t0, t0 + 0.6), () => {
          label(s.day, x, 520, { size: 28, weight: 700, col: C.ink, align: 'center' });
          label(s.part, x, 556, { size: 22, col: C.soft, align: 'center' });
          s.ballots.forEach((b, j) => {
            const bxp = x + (j - (s.ballots.length - 1) / 2) * 64;
            ctx.fillStyle = s.white ? C.ivory : 'rgba(241,230,207,0.75)'; ctx.fillRect(bxp - 24, 400, 48, 64);
            label(`${b}`, bxp, 432, { size: 28, weight: 700, col: C.ink2, align: 'center', fam: SERIF });
          });
          // the chimney and its smoke
          ctx.strokeStyle = C.iron; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, 380); ctx.lineTo(x, 330); ctx.stroke();
          smoke(t + i, x, 330, s.white ? C.smokeW : C.smokeB, seg(t, t0 + 0.6, t0 + 1.4), { n: 16, rise: 180, spread: 30 });
          if (s.time) A(seg(t, t0 + 1.0, t0 + 1.6), () => label(s.time, x, 610, { size: 24, weight: 600, col: s.white ? C.smokeW : C.grey, align: 'center' }));
          label('ballot', x, 486, { size: 22, col: C.soft, align: 'center' });
        });
      });
      A(seg(t, 57.0, 57.6), () => pill(`ballot 4: at least ${NEED} of ${ELECTORS}`, CX, 680, C.gold, { size: 24 }));
      A(seg(t, 51.2, 51.8), () => label('THE CONCLAVE OF 2025', 56, 92, { size: 26, weight: 700 }));
    });
    A(out, () => {
      smoke(t, CX, 300, C.smokeW, 1, { n: 30, rise: 260, spread: 90 });
      ctx.strokeStyle = C.iron; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(CX, 380); ctx.lineTo(CX, 300); ctx.stroke();
      ctx.fillStyle = '#5b4436'; ctx.fillRect(CX - 220, 380, 440, 18);
      label('LEO XIV', CX, 500, { size: 96, weight: 600, col: C.ivory, align: 'center', fam: SERIF });
      label('Robert Francis Prevost', CX, 576, { size: 30, weight: 600, col: C.gold, align: 'center' });
      label('elected 8 May 2025, on the fourth ballot', CX, 620, { size: 22, col: C.soft, align: 'center' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 65, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneChapel(t);
    sceneBallot(t);
    sceneCount(t);
    sceneThird(t);
    sceneRule(t);
    sceneStove(t);
    sceneDays(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 40, weight: 600, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.grey, '^': C.smokeW } });
  },
});
