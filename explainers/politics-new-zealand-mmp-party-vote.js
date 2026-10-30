// Explainer for politics-new-zealand-mmp-party-vote: advance voting opened on 26 October 2026 for New Zealand's
// general election of 7 November. Under MMP each voter has a party vote and an electorate vote; the party vote
// shares out the 120 seats in proportion, local winners count inside each party's share and its list tops it up;
// only parties with 5% of the party vote or one electorate share in the seats. 2008: New Zealand First's 4.07% won
// nothing, ACT's 3.65% won 5 seats because it held Epsom, and the Māori Party's 5 electorates beat its 3-seat share
// and added 2 overhang seats. Look: a night-ocean blue with a pale silver accent, the two-column ballot paper, a
// hemicycle of seats. Space Grotesk for numbers and labels, Nunito for captions.
//
// Facts:
// - Reuters (via The Star, 26 October 2026), "Voting opens in New Zealand for November 7 election with no clear
//   frontrunner": voting opened Monday 26 October, 207 voting places that day; overseas voting from 21 October;
//   5% threshold to enter parliament under MMP; enrolment closed 25 October.
// - Wikipedia, "Electoral system of New Zealand": two votes, electorate vote (plurality in each electorate) and
//   party vote (pooled nationwide, decides each party's share of the nominally 120 seats); a party shares in the
//   seats with 5% of the party vote or one electorate seat; electorate MPs are allocated first, then list MPs top
//   up; list seats by the Sainte-Laguë method; overhang when a party wins more electorates than its share; 2008:
//   ACT won 3.6% but five seats because its candidate won Epsom ("coat-tailing").
// - Wikipedia, "2026 New Zealand general election": 7 November 2026; 120 members, 71 from electorates and 49 from
//   lists; the threshold is 5% of the party vote or one electorate seat.
// - Wikipedia, "2008 New Zealand general election" (Electoral Commission figures): party votes National 1,053,398
//   (44.93%), Labour 796,880 (33.99%), Green 157,613 (6.72%), ACT 85,496 (3.65%), Māori Party 55,980 (2.39%),
//   Progressive 21,241, United Future 20,497, New Zealand First 95,356 (4.07%); seats National 58, Labour 43,
//   Green 9, ACT 5 (1 electorate, 4 list), Māori 5 (5 electorates, an overhang of two), Progressive 1,
//   United Future 1, New Zealand First 0 (no electorate, under 5%); Rodney Hide retained Epsom for ACT.
// Computed here: the 2008 Sainte-Laguë allocation of 120 seats among the qualifying parties (checked against the
// seats above: the Māori Party's share is 3, so 5 − 3 = 2 overhang, 122 in all).
//
// Scene plan (60.4 s). Important things stay above y = 760; captions are centred at y = 846.
//  A  0.0– 9.4  New Zealand, 26 October 2026: the two-column ballot paper.
//  B  9.6–23.2  Electorate vote and party vote; an example party's 36 seats = 20 local + 16 list.
//  C 23.4–27.8  The threshold: 5% or one electorate.
//  D 28.0–46.2  2008: New Zealand First 4.07% → 0; ACT 3.65% + Epsom → 5.
//  E 46.4–60.4  Overhang: the Māori Party's 5 electorates on a 3-seat share; 122 seats.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#0f2236', bg2: '#06101c', ink: '#eef4f6', soft: 'rgba(238,244,246,0.72)', faint: 'rgba(238,244,246,0.22)',
  line: 'rgba(238,244,246,0.12)', silver: '#cfdde3', party: '#5ec2b7', elect: '#f3b562', gate: '#f3b562', paper: '#f4f1ea',
  paperInk: '#1d2733', panel: 'rgba(0,0,0,0.3)', empty: 'rgba(238,244,246,0.12)', bad: '#ff8f85',
};
const PC = { National: '#4a8fe0', Labour: '#e5554b', Green: '#62b865', ACT: '#f0c43a', Maori: '#b0485e', Progressive: '#8c7fe0', United: '#b07ad6', NZFirst: '#9aa7b0' };
const NUM = 'Space Grotesk', CAP = 'Nunito';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- 2008 ----------
const VOTES = { National: 1053398, Labour: 796880, Green: 157613, ACT: 85496, Maori: 55980, Progressive: 21241, United: 20497, NZFirst: 95356 };
const ELECTORATES = { National: 41, Labour: 21, Green: 0, ACT: 1, Maori: 5, Progressive: 1, United: 1, NZFirst: 0 };
const TOTAL_VOTES = 2344566; // valid party votes in 2008 (shares: NZ First 95,356 = 4.07%, ACT 85,496 = 3.65%)
const share = (p) => (VOTES[p] / TOTAL_VOTES) * 100;
const qualifies = (p) => share(p) >= 5 || ELECTORATES[p] > 0;
/** Sainte-Laguë: each seat goes to the party with the highest votes ÷ (2 × seats so far + 1). */
function sainteLague(parties, seats = 120) {
  const got = Object.fromEntries(parties.map((p) => [p, 0]));
  for (let s = 0; s < seats; s++) {
    let best = parties[0];
    for (const p of parties) if (VOTES[p] / (2 * got[p] + 1) > VOTES[best] / (2 * got[best] + 1)) best = p;
    got[best]++;
  }
  return got;
}
const IN = Object.keys(VOTES).filter(qualifies);
const ENTITLED = sainteLague(IN);
const SEATS = Object.fromEntries(Object.keys(VOTES).map((p) => [p, IN.includes(p) ? Math.max(ENTITLED[p], ELECTORATES[p]) : 0]));
const OVERHANG = Object.keys(VOTES).reduce((n, p) => n + Math.max(0, SEATS[p] - (ENTITLED[p] ?? 0)), 0);
const HOUSE = 120 + OVERHANG;
const want = { National: 58, Labour: 43, Green: 9, ACT: 5, Maori: 5, Progressive: 1, United: 1, NZFirst: 0 };
for (const p in want) if (SEATS[p] !== want[p]) throw new Error(`2008: ${p} should have ${want[p]} seats, got ${SEATS[p]}`);
if (ENTITLED.Maori !== 3 || OVERHANG !== 2 || HOUSE !== 122) throw new Error('2008: overhang should be 2, house 122');
if (Math.abs(share('NZFirst') - 4.07) > 0.005 || Math.abs(share('ACT') - 3.65) > 0.005) throw new Error('shares');

const CUES = [
  [0.4, 4.8, 'On 26 October 2026, advance voting opened in New Zealand, for the general election of 7 November.'],
  [5.0, 9.4, 'Every voter has *two votes*: a ~party vote~ for a party, and an ^electorate vote^ for a local candidate.'],
  [9.6, 14.0, 'The ^electorate vote^ elects one local MP in each of 71 electorates: whoever comes first wins.'],
  [14.2, 18.6, 'The ~party vote~ decides how many of the 120 seats each party gets, in proportion.'],
  [18.8, 23.2, 'A party’s local winners count inside its share, and MPs from its list fill the rest.'],
  [23.4, 27.8, 'But only parties with ^5%^ of the party vote, or ^one electorate^, share in the seats.'],
  [28.0, 32.4, 'In 2008, New Zealand First got 4.07% of the party vote and won no electorate.'],
  [32.6, 37.0, 'So its 95,356 party votes elected no one: it won no seats at all.'],
  [37.2, 41.6, 'ACT got fewer votes, 3.65%. But its leader, Rodney Hide, held the Epsom electorate.'],
  [41.8, 46.2, 'That one seat let ACT share in the seats by party vote: 5 MPs, 4 of them from its list.'],
  [46.4, 50.8, 'The Māori Party won 5 electorates, while its party vote was worth only 3 seats.'],
  [51.0, 55.4, 'It kept all 5. The 2 extra seats, called ^overhang^, made a parliament of 122.'],
  [55.6, 60.0, 'So under this system, winning one local seat can bring a party’s whole list into play.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // long swells
  g.strokeStyle = 'rgba(207,221,227,0.05)'; g.lineWidth = 2;
  for (let j = 0; j < 9; j++) {
    g.beginPath();
    for (let i = 0; i <= 60; i++) { const x = (i / 60) * W, y = 120 + j * 80 + Math.sin(i / 6 + j) * 10; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  let s = 17; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(220,240,255,${r() * 0.03})`; g.fillRect(r() * W, r() * H, 1 + r(), 1 + r()); }
}

// ---------- drawings ----------
function header(s, y = 132, color = C.soft) { font(600, 24); text(s, CX, y, { align: 'center', color, spacing: '2px' }); }
/** Seat positions for n seats in a hemicycle centred at (cx, cy). */
function hemicycle(n, cx, cy, r0, r1, rows) {
  const rs = Array.from({ length: rows }, (_, i) => lerp(r0, r1, i / (rows - 1)));
  const total = rs.reduce((a, b) => a + b, 0);
  const per = rs.map((r) => Math.round((n * r) / total));
  per[rows - 1] += n - per.reduce((a, b) => a + b, 0);
  const pts = [];
  rs.forEach((r, i) => { for (let j = 0; j < per[i]; j++) { const a = Math.PI - (Math.PI * (j + 0.5)) / per[i]; pts.push({ x: cx + r * Math.cos(a), y: cy - r * Math.sin(a), a }); } });
  return pts.sort((p, q) => q.a - p.a);
}
const H122 = hemicycle(122, CX, 560, 120, 320, 7);
const H120 = hemicycle(120, CX, 560, 120, 320, 7);
const ORDER = ['Green', 'Labour', 'Progressive', 'Maori', 'United', 'ACT', 'National'];
function seats(pts, counts, p = 1, size = 11, extra = null) {
  let i = 0;
  const list = [];
  for (const party of ORDER) for (let j = 0; j < (counts[party] ?? 0); j++) list.push(party);
  pts.forEach((pt, idx) => {
    const party = list[idx];
    const on = idx < pts.length * p;
    ctx.fillStyle = party && on ? PC[party] : C.empty;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, size, 0, 7); ctx.fill();
    if (extra && extra(idx, party)) { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(pt.x, pt.y, size + 3, 0, 7); ctx.stroke(); }
  });
}
function tick(x, y, s, col) { ctx.strokeStyle = col; ctx.lineWidth = s * 0.18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - s * 0.4, y); ctx.lineTo(x - s * 0.1, y + s * 0.3); ctx.lineTo(x + s * 0.45, y - s * 0.35); ctx.stroke(); }

// ---------- A: the ballot paper ----------
function sceneBallot(t) {
  const a = 1 - seg(t, 9.2, 9.6);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { header('NEW ZEALAND · GENERAL ELECTION · 7 NOVEMBER 2026'); header('ADVANCE VOTING FROM 26 OCTOBER', 170, C.silver); });
    const g = eout(seg(t, 0.6, 1.6));
    const x = 132, y = 220, w = 600, h = 500;
    A(g, () => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; k.rrect(x + 8, y + 10, w, h, 10); ctx.fill();
      ctx.fillStyle = C.paper; k.rrect(x, y, w, h, 10); ctx.fill();
      ctx.fillStyle = 'rgba(29,39,51,0.12)'; ctx.fillRect(x + w / 2 - 1, y + 20, 2, h - 40);
      const hl = seg(t, 5.2, 5.8);
      ctx.fillStyle = `rgba(94,194,183,${0.25 * hl})`; k.rrect(x + 10, y + 10, w / 2 - 20, h - 20, 8); ctx.fill();
      ctx.fillStyle = `rgba(243,181,98,${0.3 * hl})`; k.rrect(x + w / 2 + 10, y + 10, w / 2 - 20, h - 20, 8); ctx.fill();
      font(700, 26); text('PARTY VOTE', x + w / 4, y + 48, { align: 'center', color: C.paperInk });
      text('ELECTORATE VOTE', x + (3 * w) / 4, y + 48, { align: 'center', color: C.paperInk });
      font(500, 18); text('tick one party', x + w / 4, y + 80, { align: 'center', color: 'rgba(29,39,51,0.6)' }); text('tick one candidate', x + (3 * w) / 4, y + 80, { align: 'center', color: 'rgba(29,39,51,0.6)' });
      for (let i = 0; i < 8; i++) {
        const ry = y + 130 + i * 44;
        for (const side of [0, 1]) {
          const bx = x + side * (w / 2) + 30;
          ctx.fillStyle = 'rgba(29,39,51,0.2)'; ctx.fillRect(bx, ry - 5, 170 - (i % 3) * 22, 10);
          ctx.strokeStyle = 'rgba(29,39,51,0.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx + 230, ry, 13, 0, 7); ctx.stroke();
        }
      }
      A(seg(t, 2.4, 2.8), () => tick(x + 30 + 230, y + 130 + 2 * 44, 30, C.party));
      A(seg(t, 3.2, 3.6), () => tick(x + w / 2 + 30 + 230, y + 130 + 5 * 44, 30, C.elect));
    });
  });
}

// ---------- B: two votes, an example party ----------
function sceneTwoVotes(t) {
  const a = span(t, 9.4, 23.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 9.6–14: 71 electorates, one winner each
    A(1 - seg(t, 14.0, 14.4), () => {
      header('ELECTORATE VOTE · 71 ELECTORATES');
      for (let i = 0; i < 71; i++) {
        const c = i % 10, r = Math.floor(i / 10);
        const g = eout(seg(t, 9.8 + i * 0.03, 10.2 + i * 0.03));
        A(g, () => {
          const xx = 152 + c * 58, yy = 220 + r * 58;
          ctx.fillStyle = 'rgba(243,181,98,0.18)'; k.rrect(xx, yy, 50, 50, 8); ctx.fill();
          A(seg(t, 11.4 + (i % 13) * 0.08, 11.8 + (i % 13) * 0.08), () => { ctx.fillStyle = C.elect; ctx.beginPath(); ctx.arc(xx + 25, yy + 25, 10, 0, 7); ctx.fill(); });
        });
      }
      A(seg(t, 12.0, 12.6), () => { font(600, 26); text('one local MP each: most votes wins', CX, 700, { align: 'center', color: C.elect }); });
    });
    // 14.2–23.2: the party vote shares out 120 seats; an example party
    A(seg(t, 14.2, 14.6), () => {
      header('PARTY VOTE · 120 SEATS IN PROPORTION');
      const p = eio(seg(t, 14.6, 16.4));
      const ex = { A: 36, B: 30, C: 24, D: 18, E: 12 };
      const cols = { A: C.party, B: '#8fb3d9', C: '#b8a0d9', D: '#d9a08f', E: '#a0d9a5' };
      const bars = Object.entries(ex);
      let x0 = 92;
      const w = 680;
      bars.forEach(([name, n]) => {
        const ww = (w * n) / 120;
        ctx.fillStyle = cols[name]; ctx.fillRect(x0, 250, ww * p, 70);
        A(seg(t, 16.2, 16.8), () => { font(700, 24); text(`${n}`, x0 + ww / 2, 285, { align: 'center', color: '#06101c' }); font(500, 18); text(`party ${name}`, x0 + ww / 2, 342, { align: 'center', color: C.soft }); });
        x0 += ww;
      });
      A(seg(t, 16.4, 17.0), () => { font(500, 20); text('example: party A has 30% of the party vote = 36 of 120 seats', CX, 212, { align: 'center', color: C.soft }); });
      // party A's 36 = 20 electorates + 16 list
      A(seg(t, 19.0, 19.6), () => {
        ctx.fillStyle = C.panel; k.rrect(92, 400, 680, 300, 16); ctx.fill();
        font(700, 28); text('Party A: 36 seats', 122, 446, { color: C.party });
        for (let i = 0; i < 36; i++) {
          const c = i % 12, r = Math.floor(i / 12);
          const isLocal = i < 20;
          const g = eout(seg(t, 19.4 + i * 0.04, 19.8 + i * 0.04));
          A(g, () => { ctx.fillStyle = isLocal ? C.elect : C.party; ctx.beginPath(); ctx.arc(150 + c * 52, 510 + r * 52, 19, 0, 7); ctx.fill(); });
        }
        A(seg(t, 21.0, 21.6), () => {
          font(700, 24); text('20 won electorates', 122, 676, { color: C.elect });
          text('+ 16 from its list', 470, 676, { color: C.party });
        });
      });
    });
  });
}

// ---------- C: the threshold ----------
function sceneGate(t) {
  const a = span(t, 23.2, 28.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('TO SHARE IN THE 120 SEATS, A PARTY NEEDS');
    const card = (x, title, sub, g) => A(g, () => {
      ctx.fillStyle = C.panel; k.rrect(x - 170, 260, 340, 260, 18); ctx.fill();
      ctx.strokeStyle = C.gate; ctx.lineWidth = 3; k.rrect(x - 170, 260, 340, 260, 18); ctx.stroke();
      font(700, 64); text(title, x, 360, { align: 'center', color: C.gate });
      font(500, 26); text(sub, x, 440, { align: 'center', color: C.ink });
    });
    card(232, '5%', 'of the party vote', eout(seg(t, 23.6, 24.4)));
    A(seg(t, 24.6, 25.0), () => { font(800, 40); text('or', CX, 390, { align: 'center', color: C.soft }); });
    card(632, '1', 'electorate won', eout(seg(t, 25.0, 25.8)));
    A(seg(t, 26.0, 26.6), () => { font(500, 24); text('otherwise its party votes elect no one', CX, 600, { align: 'center', color: C.soft }); });
  });
}

// ---------- D: 2008 ----------
function scene2008(t) {
  const a = span(t, 27.8, 46.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('2008 · PARTY VOTE');
    const x0 = 250, w = 480, max = 8;
    const X = (v) => x0 + (w * v) / max;
    const rows = [['NZFirst', 'New Zealand First', 300, 28.2], ['ACT', 'ACT', 420, 37.4]];
    // 5% line
    A(seg(t, 28.2, 28.6), () => {
      ctx.strokeStyle = C.gate; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(X(5), 230); ctx.lineTo(X(5), 480); ctx.stroke(); ctx.setLineDash([]);
      font(700, 22); text('5%', X(5), 212, { align: 'center', color: C.gate });
    });
    for (const [p, name, y, t0] of rows) {
      A(seg(t, t0, t0 + 0.4), () => {
        font(700, 24); text(name, x0 - 16, y, { align: 'right', color: C.ink });
        const g = eio(seg(t, t0 + 0.2, t0 + 1.4));
        ctx.fillStyle = PC[p]; ctx.fillRect(x0, y - 26, (X(share(p)) - x0) * g, 52);
        font(700, 24); text(`${share(p).toFixed(2)}%`, X(share(p)) * g + x0 * (1 - g) + 12, y, { color: C.ink });
      });
    }
    // New Zealand First: no electorate, no seats
    A(seg(t, 30.0, 30.6), () => { font(600, 22); text('electorates won: 0', x0, 356, { color: C.soft }); });
    A(seg(t, 33.0, 33.6), () => {
      font(800, 26); text('0 seats', X(5) + 30, 300, { color: C.bad });
      font(500, 20); text(`${VOTES.NZFirst.toLocaleString('en-US')} party votes`, X(5) + 30, 332, { color: C.soft });
    });
    // ACT: Epsom
    A(seg(t, 39.0, 39.6), () => { font(600, 22); text('electorates won: 1 (Epsom)', x0, 476, { color: C.elect }); });
    A(seg(t, 42.0, 42.6), () => {
      ctx.fillStyle = C.panel; k.rrect(92, 540, 680, 190, 16); ctx.fill();
      font(700, 28); text('ACT: 5 seats', 122, 584, { color: PC.ACT });
      for (let i = 0; i < 5; i++) {
        const g = back(seg(t, 42.6 + i * 0.25, 43.2 + i * 0.25));
        ctx.fillStyle = i === 0 ? C.elect : PC.ACT;
        ctx.beginPath(); ctx.arc(150 + i * 70, 652, 26 * g, 0, 7); ctx.fill();
      }
      A(seg(t, 43.8, 44.4), () => { font(600, 22); text('1 for Epsom + 4 from the list', 500, 652, { color: C.soft }); });
    });
  });
}

// ---------- E: overhang ----------
function sceneOverhang(t) {
  const a = eout(seg(t, 46.2, 47.0));
  if (a <= 0) return;
  A(a, () => {
    header('2008 · THE HOUSE OF REPRESENTATIVES');
    const grow = eio(seg(t, 46.6, 48.4));
    const full = seg(t, 51.2, 52.4);
    const pts = full > 0 ? H122 : H120;
    const counts = full > 0 ? SEATS : { ...SEATS, Maori: ENTITLED.Maori };
    seats(pts, counts, grow, 11, (idx, party) => full > 0 && party === 'Maori');
    // labels of the parties
    A(seg(t, 48.0, 48.6), () => {
      const items = ORDER.map((p) => [p, counts[p]]);
      font(600, 18);
      items.forEach(([p, n], i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const x = 120 + col * 170, y = 610 + row * 36;
        ctx.fillStyle = PC[p]; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill();
        text(`${{ Maori: 'Māori Party', United: 'United Future', Progressive: 'Progressive' }[p] ?? p} ${n}`, x + 16, y, { color: C.soft });
      });
    });
    A(seg(t, 48.8, 49.4) * (1 - seg(t, 51.0, 51.4)), () => { font(700, 26); text(`Māori Party: share worth ${ENTITLED.Maori} seats, ${ELECTORATES.Maori} electorates won`, CX, 200, { align: 'center', color: PC.Maori === '#b0485e' ? '#e27a90' : PC.Maori }); });
    A(seg(t, 51.4, 52.0), () => {
      font(800, 34); text(`${HOUSE} seats`, CX, 520, { align: 'center', color: C.ink });
      font(600, 22); text(`120 + ${OVERHANG} overhang`, CX, 556, { align: 'center', color: C.elect });
    });
    if (t < 51.2) A(grow, () => { font(800, 34); text('120 seats', CX, 520, { align: 'center', color: C.ink }); });
  });
}

Kit.scene({
  width: W, height: H, duration: 60.4, fonts: [NUM, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneBallot(t);
    sceneTwoVotes(t);
    sceneGate(t);
    scene2008(t);
    sceneOverhang(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 700, family: CAP, ink: C.ink, marks: { '*': C.silver, '~': C.party, '^': C.elect } });
  },
});
