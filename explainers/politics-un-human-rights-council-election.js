// Explainer for politics-un-human-rights-council-election: on 13 October 2026 the UN General Assembly elected 15
// members of the Human Rights Council, all of them unopposed, and each still needed a majority of all 193 UN members.
// Look: Geneva-night blue, the Council's 47 seats as a ring coloured by regional group, ballot bars against a pale gold
// line at 97, and a two-thirds line for suspension. Regions have neutral colours. Libre Franklin for labels and numbers,
// Cardo for captions.
//
// Facts:
// - UN press release GA/12795, 13 October 2026 (press.un.org/en/2026/ga12795.doc.htm): 15 seats of the 47-member
//   Council filled by secret ballot in a single round; a third of the membership renewed every year; three-year terms,
//   renewable once, so at most two consecutive terms; China, Côte d'Ivoire, Cuba, France and Malawi were ineligible.
//   Seats: Africa 4, Asia-Pacific 4, Eastern Europe 2, Latin America and Caribbean 3 (three nominees for the group's
//   seats; the release's "two" doesn't match its own list of 15), Western Europe and others 2. Votes: Zambia 177,
//   Ghana 173, Nigeria 172, Burundi 160; Kuwait 173, Nepal 173, Jordan 171, Japan 166; Moldova 168, Ukraine 162;
//   Brazil 170, Dominican Republic 170, Uruguay 165; Ireland 165, Germany 163. Terms start 1 January 2027.
// - General Assembly resolution 60/251 (2006), para 7: 47 members "elected directly and individually by secret ballot
//   by the majority of the members of the General Assembly"; seats: African 13, Asian 13, Eastern European 6, Latin
//   American and Caribbean 8, Western European and other 7. Para 8: the Assembly "by a two-thirds majority of the
//   members present and voting, may suspend" a member.
// - UN News, 10 October 2023: Eastern Europe, Bulgaria 160, Albania 123, Russia 83; Latin America and Caribbean,
//   Cuba 146, Brazil 144, Dominican Republic 137, Peru 108 (Peru failed to win a seat). Elected that year (GA/12543):
//   Bulgaria and Albania; Cuba, Brazil and the Dominican Republic.
// - UN News, 7 April 2022: Russia suspended by 93 in favour, 24 against, 58 abstentions; two-thirds of those voting,
//   abstentions not counted.
// Computed here: 97 as a majority of 193; two-thirds of 117; the 18 members who did not vote in 2022.
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: the ring of 47 seats by region; 15 renewed.
//  B  9.2–13.8  Terms: three years, two in a row at most; five could not run.
//  C 13.8–23.0  15 candidates for 15 seats; still 97 of 193 needed.
//  D 23.0–32.2  The 2026 votes: all 15 over 97.
//  E 32.2–46.0  2023: contested groups; below 97 or outvoted.
//  F 46.0–60.0  Suspension: two-thirds of those voting; 93 of 117.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#0d1b2e', bg2: '#172c48', ink: '#f1f4f8', soft: 'rgba(241,244,248,0.70)', faint: 'rgba(241,244,248,0.22)', seat: 'rgba(241,244,248,0.10)',
  line: '#f3dd8f', no: '#ef7d6a', yes: '#8fd3c1', abst: '#8d9bb0', card: 'rgba(241,244,248,0.06)',
};
const SANS = 'Libre Franklin', SERIF = 'Cardo';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the rules and the votes ----------
const UN = 193;
const ELECT = Math.floor(UN / 2) + 1; // 97: a majority of all members
const REGIONS = [
  { id: 'af', short: ['Africa'], name: 'African States', seats: 13, col: '#eea83e', up: 4, votes: [['Zambia', 177], ['Ghana', 173], ['Nigeria', 172], ['Burundi', 160]] },
  { id: 'ap', short: ['Asia-', 'Pacific'], name: 'Asia-Pacific States', seats: 13, col: '#e46f5e', up: 4, votes: [['Kuwait', 173], ['Nepal', 173], ['Jordan', 171], ['Japan', 166]] },
  { id: 'ee', short: ['Eastern', 'Europe'], name: 'Eastern European States', seats: 6, col: '#93c35d', up: 2, votes: [['Moldova', 168], ['Ukraine', 162]] },
  { id: 'la', short: ['Latin Am.', '& Caribbean'], name: 'Latin America and Caribbean', seats: 8, col: '#5bb8dc', up: 3, votes: [['Brazil', 170], ['Dominican Rep.', 170], ['Uruguay', 165]] },
  { id: 'we', short: ['W. Europe', '& others'], name: 'Western Europe and others', seats: 7, col: '#b493dc', up: 2, votes: [['Ireland', 165], ['Germany', 163]] },
];
const SEATS = REGIONS.reduce((n, r) => n + r.seats, 0); // 47
const UP = REGIONS.reduce((n, r) => n + r.up, 0); // 15
const ALL26 = REGIONS.flatMap((r) => r.votes.map(([n, v]) => ({ n, v, col: r.col })));
if (SEATS !== 47 || UP !== 15 || ALL26.length !== 15) throw new Error('seat counts');
const MIN26 = Math.min(...ALL26.map((x) => x.v)), MAX26 = Math.max(...ALL26.map((x) => x.v));
const Y2023 = [
  { name: 'Eastern European States, 2 seats', seats: 2, col: '#93c35d', votes: [['Bulgaria', 160], ['Albania', 123], ['Russia', 83]] },
  { name: 'Latin America and Caribbean, 3 seats', seats: 3, col: '#5bb8dc', votes: [['Cuba', 146], ['Brazil', 144], ['Dominican Rep.', 137], ['Peru', 108]] },
];
const SUS = { yes: 93, no: 24, abst: 58 };
SUS.away = UN - SUS.yes - SUS.no - SUS.abst; // 18 did not vote
const TWO_THIRDS = (2 / 3) * (SUS.yes + SUS.no); // 78
const OUT = ['China', 'Côte d’Ivoire', 'Cuba', 'France', 'Malawi'];

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, `On 13 October 2026, the United Nations General Assembly elected ${UP} Human Rights Council members.`],
  [4.8, 9.0, `The Council has ${SEATS} seats, shared out among five regions. A third come up every year.`],
  [9.2, 13.6, 'Terms last three years, and two in a row at most, so five members could not run again.'],
  [13.8, 18.2, `This year every region put up as many candidates as it had seats: ^${UP} for ${UP}^.`],
  [18.4, 22.8, `Even unopposed, each needed a majority of all ${UN} UN members, by secret ballot: ~${ELECT}~ votes.`],
  [23.0, 27.4, `They all passed in one round. Zambia had the most votes, ${MAX26}, and Burundi the fewest, ${MIN26}.`],
  [27.6, 32.0, `Unopposed isn’t unanimous: ${UN - MAX26} to ${UN - MIN26} of the ${UN} members didn’t vote for each one.`],
  [32.2, 36.6, 'Contested years are different. In 2023, three countries ran for two Eastern European seats.'],
  [36.8, 41.2, `Bulgaria got 160 votes and Albania 123. Russia got 83, under ~${ELECT}~, and lost.`],
  [41.4, 45.8, `Four ran for three Latin American seats. Peru got 108, over ${ELECT}, but came fourth.`],
  [46.0, 50.4, 'Suspending a member takes a different count: *two-thirds* of those voting yes or no.'],
  [50.6, 55.0, `In April 2022, ${SUS.yes} voted to suspend Russia and ${SUS.no} against. ${SUS.abst} abstentions didn’t count.`],
  [55.2, 60.0, `${SUS.yes} of ${SUS.yes + SUS.no} is over two-thirds: suspended, with fewer votes than it takes to join.`],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(W / 2, 380, 40, W / 2, 380, 760);
  rg.addColorStop(0, C.bg2); rg.addColorStop(1, C.bg);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(241,244,248,0.04)'; g.lineWidth = 2;
  for (let r = 60; r < 900; r += 60) { g.beginPath(); g.arc(W / 2, 400, r, 0, Math.PI * 2); g.stroke(); }
  let s = 3; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(220,230,255,${rnd() * 0.03})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd(), 1 + rnd()); }
}

// ---------- the ring of 47 seats ----------
const RING = { cx: W / 2, cy: 400, r: 230 };
const RING_SEATS = (() => {
  const out = []; let i = 0;
  for (const reg of REGIONS) for (let j = 0; j < reg.seats; j++, i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * (i + 0.5)) / SEATS;
    out.push({ a, x: RING.cx + RING.r * Math.cos(a), y: RING.cy + RING.r * Math.sin(a), reg, up: j < reg.up });
  }
  return out;
})();
function ring(t, fill, pulse) {
  RING_SEATS.forEach((s, i) => {
    const on = seg(fill, (i / SEATS) * 0.7, (i / SEATS) * 0.7 + 0.3);
    ctx.fillStyle = C.seat; ctx.beginPath(); ctx.arc(s.x, s.y, 14, 0, Math.PI * 2); ctx.fill();
    if (on <= 0) return;
    A(on, () => {
      const p = s.up ? pulse : 0;
      ctx.fillStyle = s.reg.col; ctx.beginPath(); ctx.arc(s.x, s.y, 13 + 3 * p, 0, Math.PI * 2); ctx.fill();
      if (p > 0) { ctx.strokeStyle = C.ink; ctx.lineWidth = 3 * p; ctx.beginPath(); ctx.arc(s.x, s.y, 20, 0, Math.PI * 2); ctx.stroke(); }
    });
  });
}

// ---------- vote bars: 0 to 193, a gold line at 97 ----------
function voteBar(x0, x1, y, h, v, col, name, g, o = {}) {
  const X = (n) => lerp(x0, x1, n / UN);
  ctx.fillStyle = 'rgba(241,244,248,0.07)'; ctx.fillRect(x0, y, x1 - x0, h);
  ctx.fillStyle = col; ctx.globalAlpha *= o.dim ? 0.4 : 1; ctx.fillRect(x0, y, (X(v) - x0) * g, h); ctx.globalAlpha = o.dim ? ctx.globalAlpha / 0.4 : ctx.globalAlpha;
  font(600, o.size ?? 24); text(name, x0 - 12, y + h / 2, { align: 'right', base: 'middle', color: o.dim ? C.soft : C.ink });
  if (g > 0.95) { font(700, o.size ?? 24); text(`${v}`, X(v) + 10, y + h / 2, { base: 'middle', color: o.dim ? C.soft : C.ink }); }
}
function line97(x0, x1, y0, y1, label = true) {
  const x = lerp(x0, x1, (ELECT - 0.5) / UN);
  ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.setLineDash([]);
  if (label) { font(700, 24); text(`${ELECT}`, x, y0 - 18, { align: 'center', base: 'middle', color: C.line }); }
}

// ---------- scenes ----------
const CX = W / 2;
function header(s, y = 112) { font(600, 24); text(s, CX, y, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' }); }

function sceneRing(t) {
  const a = 1 - seg(t, 13.6, 14.2);
  if (a <= 0) return;
  A(a, () => {
    header('UN HUMAN RIGHTS COUNCIL · 47 SEATS');
    const pulse = t < 4.8 ? 0 : 0.5 + 0.5 * Math.sin((t - 4.8) * 4) * (t < 9.0 ? 1 : 0);
    A(1 - seg(t, 9.0, 9.6) * 0.75, () => ring(t, eio(seg(t, 0.6, 3.4)), t > 4.8 && t < 9.2 ? pulse : 0));
    // centre: elected this year
    A(span(t, 1.4, 9.2, 0.6, 0.4), () => {
      font(800, 96); text(`${UP}`, CX, RING.cy - 18, { align: 'center', base: 'middle' });
      font(500, 26); text('elected on', CX, RING.cy + 46, { align: 'center', base: 'middle', color: C.soft });
      text('13 October 2026', CX, RING.cy + 80, { align: 'center', base: 'middle', color: C.soft });
    });
    // legend by region
    A(span(t, 4.8, 9.2, 0.5, 0.4), () => {
      font(600, 23);
      [REGIONS.slice(0, 3), REGIONS.slice(3)].forEach((row, ri) => {
        const items = row.map((r) => `${r.name.replace(' States', '')} ${r.seats}`);
        const ws = items.map((s2) => 30 + ctx.measureText(s2).width);
        let x = CX - (ws.reduce((a2, b2) => a2 + b2, 0) + 34 * (row.length - 1)) / 2;
        const y = 676 + ri * 40;
        row.forEach((r, i) => {
          ctx.fillStyle = r.col; ctx.beginPath(); ctx.arc(x + 10, y, 10, 0, Math.PI * 2); ctx.fill();
          text(items[i], x + 28, y + 1, { base: 'middle' }); x += ws[i] + 34;
        });
      });
    });
    // terms: who had to leave
    A(span(t, 9.4, 14.0, 0.5, 0.4), () => {
      font(700, 30); text('3-year terms · 2 in a row at most', CX, RING.cy - 60, { align: 'center', base: 'middle' });
      font(500, 24); text('could not run again:', CX, RING.cy - 14, { align: 'center', base: 'middle', color: C.soft });
      OUT.forEach((n, i) => {
        A(seg(t, 10.2 + i * 0.2, 10.6 + i * 0.2), () => { font(600, 26); text(n, CX, RING.cy + 28 + i * 34, { align: 'center', base: 'middle', color: C.no }); });
      });
    });
  });
}

function sceneSlate(t) {
  const a = span(t, 13.8, 23.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('SEATS UP · CANDIDATES · 2026');
    // five columns: seats (rings) and candidates (filled)
    REGIONS.forEach((r, i) => {
      const x = 112 + i * 160, g = eout(seg(t, 14.0 + i * 0.2, 14.8 + i * 0.2));
      A(g, () => {
        for (let j = 0; j < r.up; j++) {
          const y = 210 + j * 76;
          ctx.strokeStyle = r.col; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2); ctx.stroke();
          const c = eout(seg(t, 15.2 + i * 0.2 + j * 0.1, 15.8 + i * 0.2 + j * 0.1));
          ctx.fillStyle = r.col; ctx.beginPath(); ctx.arc(x, y, 21 * c, 0, Math.PI * 2); ctx.fill();
        }
        font(600, 22);
        r.short.forEach((l, j) => text(l, x, 520 + j * 28, { align: 'center', base: 'middle', color: C.soft }));
      });
    });
    A(seg(t, 16.4, 17.0) * (1 - seg(t, 18.2, 18.6)), () => { font(700, 34); text(`${UP} candidates for ${UP} seats`, CX, 640, { align: 'center', base: 'middle', color: C.line }); });
    // 18.4–23: 193 members, 97 needed
    A(seg(t, 18.6, 19.2), () => {
      const x0 = 80, x1 = 784, y = 640;
      ctx.fillStyle = 'rgba(241,244,248,0.08)'; ctx.fillRect(x0, y, x1 - x0, 40);
      const f = eio(seg(t, 19.2, 20.6));
      ctx.fillStyle = C.yes; ctx.fillRect(x0, y, (lerp(x0, x1, ELECT / UN) - x0) * f, 40);
      line97(x0, x1, y - 16, y + 56);
      font(500, 22); text('0', x0, y + 74, { align: 'center', base: 'middle', color: C.soft }); text(`${UN} UN members`, x1, y + 74, { align: 'right', base: 'middle', color: C.soft });
    });
  });
}

function scene2026(t) {
  const a = span(t, 23.0, 32.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('VOTES, 13 OCTOBER 2026');
    const x0 = 270, x1 = 760, y0 = 150, rh = 36;
    const sorted = [...ALL26].sort((p, q) => q.v - p.v);
    sorted.forEach((c, i) => voteBar(x0, x1, y0 + i * rh, rh - 8, c.v, c.col, c.n, eout(seg(t, 23.2 + i * 0.06, 24.6 + i * 0.06)), { size: 21 }));
    line97(x0, x1, y0 - 4, y0 + 15 * rh, false);
    font(700, 22); text(`${ELECT} needed`, lerp(x0, x1, ELECT / UN), y0 + 15 * rh + 18, { align: 'center', base: 'middle', color: C.line });
    // the members who didn't back each one
    A(seg(t, 27.8, 28.6), () => {
      const X = (n) => lerp(x0, x1, n / UN);
      sorted.forEach((c, i) => { ctx.fillStyle = 'rgba(239,125,106,0.55)'; ctx.fillRect(X(c.v) + 48, y0 + i * rh + 8, X(UN) - X(c.v) - 48 > 0 ? X(UN) - X(c.v) - 48 : 0, rh - 24); });
      font(600, 22); text(`${UN - MAX26}–${UN - MIN26} not for it`, x1, y0 + 15 * rh + 18, { align: 'right', base: 'middle', color: C.no });
    });
  });
}

function scene2023(t) {
  const a = span(t, 32.2, 46.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('2023: CONTESTED REGIONS');
    const x0 = 270, x1 = 740;
    Y2023.forEach((grp, gi) => {
      const y0 = gi === 0 ? 210 : 470, t0 = gi === 0 ? 32.4 : 41.4;
      A(seg(t, t0, t0 + 0.5), () => {
        font(600, 24); text(grp.name, 60, y0 - 34, { base: 'middle', color: grp.col });
        grp.votes.forEach(([n, v], i) => {
          const g = eout(seg(t, t0 + 0.4 + i * 0.25, t0 + 1.6 + i * 0.25));
          const lost = i >= grp.seats, show = t > (gi === 0 ? 37.4 : 42.6);
          voteBar(x0, x1, y0 + i * 52, 40, v, grp.col, n, g, { dim: lost && show });
          if (lost && show) A(seg(t, gi === 0 ? 37.6 : 42.8, gi === 0 ? 38.2 : 43.4), () => {
            ctx.fillStyle = C.no; k.rrect(60, y0 + i * 52 + 4, 70, 32, 16); ctx.fill();
            font(700, 20); text('OUT', 95, y0 + i * 52 + 21, { align: 'center', base: 'middle', color: C.bg });
          });
        });
        // the cut-off between winners and the rest
        A(seg(t, t0 + 1.8, t0 + 2.4), () => {
          const y = y0 + grp.seats * 52 - 6;
          ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(x1 + 60, y); ctx.stroke(); ctx.setLineDash([]);
        });
        line97(x0, x1, y0 - 10, y0 + grp.votes.length * 52, gi === 0);
      });
    });
  });
}

function sceneSuspend(t) {
  const a = eout(seg(t, 46.0, 46.6));
  if (a <= 0) return;
  A(a, () => {
    header('SUSPENDING A MEMBER');
    // the 193 members as dots: yes, no, abstained, didn't vote
    const cols = 16, s = 30, x0 = CX - (cols * s) / 2 + s / 2, y0 = 170;
    const kinds = [...Array(SUS.yes).fill('yes'), ...Array(SUS.no).fill('no'), ...Array(SUS.abst).fill('abst'), ...Array(SUS.away).fill('away')];
    const show = t > 50.6;
    if (show) kinds.forEach((kind, i) => {
      const x = x0 + (i % cols) * s, y = y0 + Math.floor(i / cols) * s;
      const on = show ? seg(t, 50.8 + (i / UN) * 1.4, 51.2 + (i / UN) * 1.4) : 0;
      ctx.fillStyle = C.seat; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
      if (on <= 0) return;
      const col = kind === 'yes' ? C.yes : kind === 'no' ? C.no : kind === 'abst' ? C.abst : null;
      A(on * (t > 53.2 && (kind === 'abst' || kind === 'away') ? 0.35 : 1), () => {
        if (col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke(); }
      });
    });
    // the rule before the numbers
    A(span(t, 46.4, 50.6, 0.4, 0.3), () => {
      font(500, 30); text('to join the Council:', CX, 236, { align: 'center', base: 'middle', color: C.soft });
      font(800, 60); text(`${ELECT} of all ${UN} members`, CX, 300, { align: 'center', base: 'middle', color: C.ink });
      font(500, 30); text('to suspend a member:', CX, 440, { align: 'center', base: 'middle', color: C.soft });
      font(800, 60); text('two-thirds', CX, 504, { align: 'center', base: 'middle', color: C.line });
      font(500, 28); text('of those voting yes or no; abstentions don’t count', CX, 562, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 52.6, 53.2), () => {
      font(600, 24);
      const items = [[`${SUS.yes} yes`, C.yes], [`${SUS.no} no`, C.no], [`${SUS.abst} abstained`, C.abst], [`${SUS.away} didn’t vote`, C.soft]];
      let x = 120;
      items.forEach(([s2, col]) => { text(s2, x, 560, { base: 'middle', color: col }); x += ctx.measureText(s2).width + 44; });
    });
    // the sum: 93 of 117, against two-thirds = 78 and the 97 to join
    A(seg(t, 55.4, 56.0), () => {
      const x0b = 110, x1b = 754, y = 612;
      const X = (n) => lerp(x0b, x1b, n / (SUS.yes + SUS.no));
      ctx.fillStyle = C.yes; ctx.fillRect(x0b, y, X(SUS.yes) - x0b, 44);
      ctx.fillStyle = C.no; ctx.fillRect(X(SUS.yes), y, x1b - X(SUS.yes), 44);
      font(700, 26); text(`${SUS.yes}`, x0b + 12, y + 22, { base: 'middle', color: C.bg }); text(`${SUS.no}`, x1b - 12, y + 22, { align: 'right', base: 'middle', color: C.bg });
      const xt = X(TWO_THIRDS);
      ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(xt, y - 14); ctx.lineTo(xt, y + 58); ctx.stroke(); ctx.setLineDash([]);
      font(600, 22); text(`two-thirds of ${SUS.yes + SUS.no}: ${Math.ceil(TWO_THIRDS)}`, xt, y + 80, { align: 'center', base: 'middle', color: C.line });
      A(seg(t, 56.6, 57.2), () => { font(700, 26); text(`${SUS.yes} < ${ELECT} needed to join`, CX, y + 124, { align: 'center', base: 'middle', color: C.ink }); });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [SANS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneRing(t);
    sceneSlate(t);
    scene2026(t);
    scene2023(t);
    sceneSuspend(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 44, weight: 700, family: SERIF, ink: C.ink, marks: { '~': C.line, '*': C.line, '^': C.yes } });
  },
});
