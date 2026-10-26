// Explainer for politics-brazil-runoff-comeback: Brazil elects its president in two rounds, and on
// 25 October 2026 the candidate who came second in round one won the runoff. Look: the cool white concrete
// of Brasília with Niemeyer-like sweeping curves, an electronic voting machine (urna) as the hook, teal for
// Lula and plum for Flávio Bolsonaro (neutral colours, not party colours), grey for the other candidates and a
// coral 50% line. Jost (a modernist geometric sans) for numbers and labels, Lora for captions.
//
// Facts: Constitution of Brazil (planalto.gov.br): Art. 77 — first round on the first Sunday of October, a
// runoff on the last Sunday if needed; a candidate is elected with an absolute majority of the votes, not
// counting blank and null ballots; otherwise the two most voted meet again. Art. 82 (as amended in 2021) — a
// four-year term that starts on 5 January of the year after the election. Art. 14 — voting is compulsory over
// 18 and optional for the illiterate, those over 70 and those aged 16–17. Wikipedia, "Elections in Brazil":
// compulsory for literate citizens over 18 and under 70; electronic voting since 1996.
// Round one, 4 October 2026, TSE totals (via Nexo and meuvoto.app.br): Flávio Bolsonaro 56,104,503 (47.03%),
// Lula 53,879,538 (45.16%), 12 candidates, 119,300,788 valid votes, turnout 125,275,835 of 158,745,502 (78.9%).
// Runoff, 25 October 2026, TSE (via ND Mais): Lula 64,256,232 (51.79%), Flávio Bolsonaro 59,826,041 (48.21%),
// 499,248 voting machines. Reuters (25 October 2026): Lula is the first candidate since Brazil's return to
// democracy in the 1980s to be elected after finishing second in the first round.
// Computed here: the other ten candidates' 9,316,747 votes; the 2,224,965-vote gap; the 61.9% of the others'
// votes Lula would need if nothing else changed; the gains between rounds (+10,376,694 and +3,721,538) and the
// 4,781,485 more valid votes in the runoff.
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: the voting machine; more than half of the valid votes.
//  B  9.0–23.6  Round one: 47.0 / 45.2 / 7.8; nobody over 50%; the top two go on; 9.3 million votes free.
//  C 23.6–37.6  The arithmetic: a 2.2-million gap, an even split, the 62% Lula would need; compulsory voting.
//  D 37.6–51.4  The runoff: gains of 10.4 and 3.7 million; 4.8 million more valid votes; 51.79% to 48.21%.
//  E 51.4–60.0  From second to first; the term starts on 5 January 2027.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#f1f2ee', bg2: '#e4e8e3', curve: 'rgba(18,110,108,0.07)', ink: '#14302c', soft: 'rgba(20,48,44,0.68)', faint: 'rgba(20,48,44,0.28)',
  lula: '#13807d', flavio: '#9b3a72', other: '#a3a69c', line: '#e4572e', machine: '#d8d4c8', machine2: '#bfb9aa', screen: '#d6e6d2',
  key: '#26302e', confirm: '#2f9e44', correct: '#e07a2e', white: '#fbfbf8',
};
const NUM = 'Jost', SERIF = 'Lora';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const M = (n) => (n / 1e6).toFixed(1); // millions, one decimal

// ---------- the official counts (TSE) ----------
const R1 = { flavio: 56104503, lula: 53879538, valid: 119300788, turnout: 125275835, electorate: 158745502 };
const R2 = { lula: 64256232, flavio: 59826041 };
R1.others = R1.valid - R1.flavio - R1.lula; // 9,316,747
R2.valid = R2.lula + R2.flavio; // 124,082,273
const pct = (n, of) => (100 * n) / of;
const GAP = R1.flavio - R1.lula; // 2,224,965
const NEED = (R1.others + GAP) / (2 * R1.others); // 0.619: Lula's share of the others' votes for a tie
const GAIN = { lula: R2.lula - R1.lula, flavio: R2.flavio - R1.flavio }; // +10.4 M, +3.7 M
const MORE_VALID = R2.valid - R1.valid; // 4,781,485
const TURNOUT1 = pct(R1.turnout, R1.electorate); // 78.9%

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 25 October 2026, Brazil chose its president in a ^runoff^, a second round.'],
  [4.8, 9.0, 'To win in round one, a candidate needs ^more than half^ of the valid votes.'],
  [9.2, 13.6, `On 4 October, 12 candidates ran. *Flávio Bolsonaro* led with ${pct(R1.flavio, R1.valid).toFixed(1)}%, ~Lula~ had ${pct(R1.lula, R1.valid).toFixed(1)}%.`],
  [13.8, 18.2, 'Nobody passed 50%, so only the ^top two^ go on, to a runoff three weeks later.'],
  [18.4, 23.6, `The other ten candidates had won ^${M(R1.others)} million^ votes. Where do they go now?`],
  [23.8, 28.2, `~Lula~ trailed by ${M(GAP)} million. If the rest split evenly, *Flávio* still wins.`],
  [28.4, 33.0, `To catch up, Lula needs about ~${Math.round(NEED * 100)}%~ of them, if no other vote changes.`],
  [33.2, 37.6, `Voting is compulsory for literate adults aged 18 to 69: ${Math.round(TURNOUT1)}% turned out.`],
  [37.8, 42.2, `In the runoff, ~Lula~ gained ${M(GAIN.lula)} million votes and *Flávio* ${M(GAIN.flavio)} million.`],
  [42.4, 46.8, `That’s more than ${M(R1.others)} million: the runoff had ^${M(MORE_VALID)} million^ more valid votes.`],
  [47.0, 51.4, `~Lula~ won with ${pct(R2.lula, R2.valid).toFixed(2)}%: ${M(R2.lula)} million votes to ${M(R2.flavio)} million.`],
  [51.6, 55.8, 'He is the first since Brazil’s return to democracy to win from ^second place^.'],
  [56.0, 60.0, 'The new four-year term starts on ^5 January 2027^.'],
];

// ---------- background: white concrete and sweeping curves ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W, H);
  lg.addColorStop(0, C.bg); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.curve; g.lineWidth = 26;
  for (const [cx, cy, rx, ry] of [[-120, 1180, 760, 520], [980, -160, 640, 420], [432, 1500, 900, 560]]) {
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
  }
  g.lineWidth = 3; g.strokeStyle = 'rgba(18,110,108,0.08)';
  for (const [cx, cy, rx, ry] of [[-120, 1180, 820, 580], [980, -160, 700, 480]]) { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke(); }
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 7000; i++) { g.fillStyle = `rgba(40,50,45,${r() * 0.035})`; g.fillRect(r() * W, r() * H, 1 + r(), 1 + r()); }
}

// ---------- the electronic voting machine ----------
function urna(cx, cy, s, t) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(20,48,44,0.12)'; k.rrect(-236, -136, 480, 290, 26); ctx.fill();
  ctx.fillStyle = C.machine; k.rrect(-240, -146, 480, 290, 26); ctx.fill();
  ctx.fillStyle = C.machine2; k.rrect(-224, -130, 236, 258, 14); ctx.fill();
  // screen
  ctx.fillStyle = C.screen; k.rrect(-212, -118, 212, 160, 8); ctx.fill();
  font(600, 22); text('PRESIDENTE', -106, -88, { align: 'center', base: 'middle', color: C.ink });
  const typed = Math.floor(seg(t, 1.6, 3.0) * 2.999);
  for (let i = 0; i < 2; i++) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; k.rrect(-152 + i * 62, -62, 52, 64, 6); ctx.stroke();
    if (i < typed) { font(700, 44); text('?', -126 + i * 62, -28, { align: 'center', base: 'middle' }); }
  }
  font(500, 15); text('CONFIRMA para votar', -106, 26, { align: 'center', base: 'middle', color: C.soft });
  // keypad
  ctx.fillStyle = '#2f3a37'; k.rrect(28, -130, 196, 258, 14); ctx.fill();
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];
  keys.forEach((d, i) => {
    if (!d) return;
    const x = 52 + (i % 3) * 56, y = -114 + Math.floor(i / 3) * 42;
    const press = (d === '1' && t > 1.6 && t < 1.9) || (d === '3' && t > 2.5 && t < 2.8);
    ctx.fillStyle = press ? '#56635f' : C.key; k.rrect(x, y + (press ? 2 : 0), 44, 34, 6); ctx.fill();
    font(600, 22); text(d, x + 22, y + 18 + (press ? 2 : 0), { align: 'center', base: 'middle', color: C.white });
  });
  const btn = [['BRANCO', C.white, C.ink], ['CORRIGE', C.correct, C.white], ['CONFIRMA', C.confirm, C.white]];
  btn.forEach(([l, bgc, fg], i) => {
    const x = 36 + i * 62, y = 60, w = i === 2 ? 64 : 56;
    ctx.fillStyle = bgc; k.rrect(x, y, w, 52, 6); ctx.fill();
    font(700, 10); text(l, x + w / 2, y + 26, { align: 'center', base: 'middle', color: fg });
  });
  ctx.restore();
}

// ---------- scenes ----------
const CX = W / 2;
function sceneHook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.1, 0.8)), () => urna(CX, 390 - 40 * eout(seg(t, 4.8, 5.6)), 1.3 - 0.3 * eout(seg(t, 4.8, 5.6)), t));
    A(eout(seg(t, 0.6, 1.4)), () => { font(600, 28); text('Brazil · president · 2026', CX, 150, { align: 'center', base: 'middle', color: C.soft, spacing: '1px' }); });
    // a bar of valid votes and the line just past half
    const v = eout(seg(t, 4.9, 5.7));
    if (v > 0) A(v, () => {
      const L = 120, R = 744, y = 620, h = 54;
      ctx.fillStyle = 'rgba(20,48,44,0.08)'; k.rrect(L, y, R - L, h, 10); ctx.fill();
      const fill = eio(seg(t, 5.6, 7.4)) * 0.53;
      ctx.fillStyle = C.ink; k.rrect(L, y, (R - L) * fill, h, 10); ctx.fill();
      const x50 = lerp(L, R, 0.5);
      ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.setLineDash([10, 7]);
      ctx.beginPath(); ctx.moveTo(x50, y - 30); ctx.lineTo(x50, y + h + 14); ctx.stroke(); ctx.setLineDash([]);
      font(700, 26); text('50%', x50, y - 46, { align: 'center', base: 'middle', color: C.line });
      font(500, 24); text('valid votes: blank and null ballots don’t count', CX, y + h + 46, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// bar chart shared by round one: share of valid votes
const BAR = { base: 640, top: 230, max: 62, xs: [212, 432, 652], w: 150 };
const by = (v) => BAR.base - (v / BAR.max) * (BAR.base - BAR.top);
function sceneRound1(t) {
  const a = span(t, 9.2, 23.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 34); text('Round one · 4 October', CX, 150, { align: 'center', base: 'middle' });
    const bars = [[pct(R1.flavio, R1.valid), C.flavio, 'Flávio Bolsonaro'], [pct(R1.lula, R1.valid), C.lula, 'Lula'], [pct(R1.others, R1.valid), C.other, '10 others']];
    const leave = eio(seg(t, 18.6, 20.2)); // the others' bar breaks up into votes
    bars.forEach(([v, col, name], i) => {
      const g = eout(seg(t, 9.4 + i * 0.25, 10.4 + i * 0.25)), x = BAR.xs[i];
      if (i === 2 && leave > 0) return;
      const dim = i === 2 ? 1 - 0.55 * seg(t, 13.8, 14.6) : 1;
      A(dim, () => {
        ctx.fillStyle = col; k.rrect(x - BAR.w / 2, by(v * g), BAR.w, BAR.base - by(v * g), 8); ctx.fill();
        if (i < 2) { font(700, 38); text(`${v.toFixed(1)}%`, x, by(v * g) + 34, { align: 'center', base: 'middle', color: C.white }); }
        else { font(700, 38); text(`${v.toFixed(1)}%`, x, by(v * g) - 30, { align: 'center', base: 'middle', color: C.soft }); }
      });
      font(600, 24); text(name, x, BAR.base + 30, { align: 'center', base: 'middle', color: C.soft });
    });
    // the 10 others as votes: 100 squares, each about 1% of them
    if (leave > 0) {
      const x = BAR.xs[2], v = pct(R1.others, R1.valid);
      for (let i = 0; i < 100; i++) {
        const sx = x - BAR.w / 2 + (i % 10) * (BAR.w / 10), sy = BAR.base - (Math.floor(i / 10) + 1) * ((BAR.base - by(v)) / 10);
        const tx = 566 + (i % 10) * 19, ty = 392 + Math.floor(i / 10) * 19;
        const p = eio(clamp(leave * 1.4 - (i / 100) * 0.4));
        ctx.fillStyle = C.other; ctx.fillRect(lerp(sx, tx, p), lerp(sy, ty, p), lerp(BAR.w / 10, 15, p), lerp((BAR.base - by(v)) / 10, 15, p));
      }
      A(seg(t, 19.8, 20.6), () => {
        font(800, 40); text(`${M(R1.others)} million`, 656, 618, { align: 'center', base: 'middle', color: C.ink });
        font(500, 24); text('votes, free again', 656, 656, { align: 'center', base: 'middle', color: C.soft });
      });
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(110, BAR.base); ctx.lineTo(754, BAR.base); ctx.stroke();
    const l = eout(seg(t, 10.6, 11.6));
    A(l, () => {
      ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(110, by(50)); ctx.lineTo(lerp(110, 754, l), by(50)); ctx.stroke(); ctx.setLineDash([]);
      font(700, 26); text('50%', 110, by(50) - 24, { base: 'middle', color: C.line });
    });
    // top two: a bracket over them, and the runoff date
    A(span(t, 13.8, 18.6), () => {
      const y = 702;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(BAR.xs[0] - 70, y - 14); ctx.lineTo(BAR.xs[0] - 70, y); ctx.lineTo(BAR.xs[1] + 70, y); ctx.lineTo(BAR.xs[1] + 70, y - 14); ctx.stroke();
      font(700, 26); text('both go to the runoff · 25 October', (BAR.xs[0] + BAR.xs[1]) / 2 + 40, y + 30, { align: 'center', base: 'middle' });
    });
  });
}

// horizontal bars in millions of votes
const HB = { L: 150, R: 770, max: 74e6 };
const hx = (n) => HB.L + (n / HB.max) * (HB.R - HB.L);
function hbar(y, n, col, label, o = {}) {
  ctx.fillStyle = col; k.rrect(HB.L, y - 26, hx(n) - HB.L, 52, 8); ctx.fill();
  font(700, 26); text(label, HB.L - 14, y, { align: 'right', base: 'middle', color: col });
  if (o.value !== false) { font(700, 26); text(`${M(n)} M`, hx(n) + 12, y, { base: 'middle', color: C.ink }); }
}
function sceneArithmetic(t) {
  const a = span(t, 23.8, 37.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 34); text('Votes, in millions', CX, 150, { align: 'center', base: 'middle' });
    const share = t < 28.4 ? 0.5 : lerp(0.5, 0.62, eio(seg(t, 28.6, 30.4)));
    const add = eio(seg(t, 25.6, 27.4)) * (t < 33.2 ? 1 : 1 - seg(t, 33.2, 33.8));
    const f = R1.flavio + add * R1.others * (1 - share), l = R1.lula + add * R1.others * share;
    A(1 - seg(t, 33.2, 33.8), () => {
      hbar(250, f, C.flavio, 'Flávio');
      hbar(340, l, C.lula, 'Lula');
      // the gap
      A(span(t, 24.0, 25.8, 0.4, 0.3), () => {
        ctx.strokeStyle = C.line; ctx.lineWidth = 3;
        const x1 = hx(R1.lula), x2 = hx(R1.flavio);
        ctx.beginPath(); ctx.moveTo(x1, 310); ctx.lineTo(x1, 286); ctx.moveTo(x1, 298); ctx.lineTo(x2, 298); ctx.moveTo(x2, 286); ctx.lineTo(x2, 310); ctx.stroke();
        font(700, 24); text(`gap ${M(GAP)} M`, x2 + 40, 420, { align: 'right', base: 'middle', color: C.line });
      });
      // the 100 squares of other votes, coloured by where they go
      const G = { x: 252, y: 450, s: 27 };
      for (let i = 0; i < 100; i++) {
        const col = i % 10, row = Math.floor(i / 10), toLula = col + row * 10 < share * 100;
        const filled = add > (i / 100) * 0.6 + 0.2 ? 1 : 0;
        ctx.fillStyle = filled ? (toLula ? C.lula : C.flavio) : C.other;
        ctx.fillRect(G.x + (i % 10) * G.s, G.y + row * (G.s * 0.8), G.s - 5, G.s * 0.8 - 5);
      }
      font(700, 44); text(`${Math.round(share * 100)}%`, 640, 520, { align: 'center', base: 'middle', color: C.lula });
      font(500, 24); text('to Lula', 640, 562, { align: 'center', base: 'middle', color: C.soft });
      font(500, 22); text(`the ${M(R1.others)} M other votes`, G.x + 5 * G.s, G.y + 10 * G.s * 0.8 + 18, { align: 'center', base: 'middle', color: C.soft });
      A(span(t, 28.4, 33.2), () => {
        const lead = l > f ? 'Lula ahead' : f > l ? 'Flávio ahead' : 'a tie';
        font(700, 26); text(lead, 640, 610, { align: 'center', base: 'middle', color: l > f ? C.lula : C.flavio });
      });
    });
    // compulsory voting: 10 people, 8 of them voting
    A(span(t, 33.6, 37.8, 0.4, 0.4), () => {
      for (let i = 0; i < 10; i++) {
        const x = 162 + i * 60, y = 470, on = i < Math.round(TURNOUT1 / 10);
        const g = eout(seg(t, 33.8 + i * 0.08, 34.3 + i * 0.08));
        A(g, () => {
          ctx.fillStyle = on ? C.ink : 'rgba(20,48,44,0.18)';
          ctx.beginPath(); ctx.arc(x, y - 44, 16, 0, Math.PI * 2); ctx.fill();
          k.rrect(x - 20, y - 22, 40, 66, 14); ctx.fill();
        });
      }
      font(800, 60); text(`${TURNOUT1.toFixed(1)}%`, CX, 610, { align: 'center', base: 'middle' });
      font(500, 24); text('turnout on 4 October · compulsory from 18 to 69', CX, 660, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

function sceneRunoff(t) {
  const a = span(t, 37.8, 51.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 34); text('Runoff · 25 October', CX, 150, { align: 'center', base: 'middle' });
    const g = eio(seg(t, 38.2, 40.4));
    const final = eio(seg(t, 47.0, 48.2));
    A(1 - final, () => {
      const lf = R1.flavio + g * GAIN.flavio, ll = R1.lula + g * GAIN.lula;
      // the round-one part solid, the gain lighter
      for (const [y, base, now, col, name, gain] of [[260, R1.flavio, lf, C.flavio, 'Flávio', GAIN.flavio], [370, R1.lula, ll, C.lula, 'Lula', GAIN.lula]]) {
        ctx.fillStyle = col; k.rrect(HB.L, y - 28, hx(base) - HB.L, 56, 8); ctx.fill();
        ctx.globalAlpha *= 0.45; k.rrect(hx(base) - 8, y - 28, hx(now) - hx(base) + 8, 56, 8); ctx.fill(); ctx.globalAlpha /= 0.45;
        font(700, 26); text(name, HB.L - 14, y, { align: 'right', base: 'middle', color: col });
        A(seg(t, 39.4, 40.2), () => { font(700, 26); text(`+${M(gain)} M`, hx(now) + 12, y, { base: 'middle', color: col }); });
      }
      font(500, 22); text('round one', (HB.L + hx(R1.lula)) / 2, 432, { align: 'center', base: 'middle', color: C.soft });
      // where the gains came from
      A(span(t, 42.4, 47.2), () => {
        const y = 540, x0 = 160, sc = 600 / (GAIN.lula + GAIN.flavio);
        const parts = [[R1.others, C.other, `${M(R1.others)} M from the 10 others`], [MORE_VALID, C.ink, `${M(MORE_VALID)} M more valid votes`]];
        let x = x0;
        parts.forEach(([n, col, lab], i) => {
          const w = n * sc * eout(seg(t, 42.6 + i * 0.5, 43.4 + i * 0.5));
          ctx.fillStyle = col; k.rrect(x, y, Math.max(0, w - 4), 40, 6); ctx.fill();
          A(seg(t, 43.2 + i * 0.5, 43.8 + i * 0.5), () => { font(600, 22); text(lab, x + (n * sc) / 2, y + 66 + i * 32, { align: 'center', base: 'middle', color: col === C.ink ? C.ink : C.soft }); });
          x += n * sc;
        });
        font(700, 26); text(`gained in all: ${M(GAIN.lula + GAIN.flavio)} M`, CX, y - 30, { align: 'center', base: 'middle' });
      });
    });
    // the final split of valid votes
    A(final, () => {
      const L = 110, R = 754, y = 330, h = 110, xs = lerp(L, R, R2.lula / R2.valid);
      ctx.fillStyle = C.lula; k.rrect(L, y, xs - L, h, 12); ctx.fill();
      ctx.fillStyle = C.flavio; k.rrect(xs + 4, y, R - xs - 4, h, 12); ctx.fill();
      font(800, 50); text(`${pct(R2.lula, R2.valid).toFixed(2)}%`, L + 24, y + h / 2, { base: 'middle', color: C.white });
      text(`${pct(R2.flavio, R2.valid).toFixed(2)}%`, R - 24, y + h / 2, { align: 'right', base: 'middle', color: C.white });
      font(700, 28); text('Lula', L, y - 30, { base: 'middle', color: C.lula }); text('Flávio Bolsonaro', R, y - 30, { align: 'right', base: 'middle', color: C.flavio });
      font(600, 24); text(`${M(R2.lula)} million`, L, y + h + 34, { base: 'middle', color: C.soft }); text(`${M(R2.flavio)} million`, R, y + h + 34, { align: 'right', base: 'middle', color: C.soft });
      const x50 = lerp(L, R, 0.5);
      ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.setLineDash([10, 7]);
      ctx.beginPath(); ctx.moveTo(x50, y - 60); ctx.lineTo(x50, y + h + 70); ctx.stroke(); ctx.setLineDash([]);
      font(700, 24); text('50%', x50, y + h + 92, { align: 'center', base: 'middle', color: C.line });
      font(500, 24); text(`${(R2.valid / 1e6).toFixed(1)} million valid votes`, CX, 620, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

function sceneEnd(t) {
  const a = eout(seg(t, 51.6, 52.4));
  if (a <= 0) return;
  A(a, () => {
    // slope chart: places in round one and in the runoff
    const fade = 1 - eout(seg(t, 55.8, 56.4));
    A(fade, () => {
      const xL = 250, xR = 614, y1 = 300, y2 = 520;
      font(600, 26); text('round one', xL, 200, { align: 'center', base: 'middle', color: C.soft }); text('runoff', xR, 200, { align: 'center', base: 'middle', color: C.soft });
      font(800, 34); text('1st', 120, y1, { align: 'center', base: 'middle', color: C.faint }); text('2nd', 120, y2, { align: 'center', base: 'middle', color: C.faint });
      const p = eio(seg(t, 52.2, 54.0));
      for (const [from, to, col, name] of [[y1, y2, C.flavio, 'Flávio'], [y2, y1, C.lula, 'Lula']]) {
        ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(xL, from); ctx.lineTo(lerp(xL, xR, p), lerp(from, to, p)); ctx.stroke();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xL, from, 18, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(lerp(xL, xR, p), lerp(from, to, p), 18, 0, Math.PI * 2); ctx.fill();
        A(seg(t, 53.6, 54.2), () => { font(700, 28); text(name, xR + 34, to, { base: 'middle', color: col }); });
      }
      ctx.lineCap = 'butt';
    });
    // the calendar page
    A(eout(seg(t, 56.0, 56.8)), () => {
      const x = CX, y = 400, s = 0.9 + 0.1 * back(seg(t, 56.0, 56.8));
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = 'rgba(20,48,44,0.12)'; k.rrect(-146, -150, 300, 320, 22); ctx.fill();
      ctx.fillStyle = C.white; k.rrect(-150, -156, 300, 320, 22); ctx.fill();
      ctx.fillStyle = C.lula; k.rrect(-150, -156, 300, 84, [22, 22, 0, 0]); ctx.fill();
      font(700, 36); text('JANUARY', 0, -114, { align: 'center', base: 'middle', color: C.white, spacing: '3px' });
      font(700, 150); text('5', 0, 30, { align: 'center', base: 'middle' });
      font(600, 34); text('2027', 0, 128, { align: 'center', base: 'middle', color: C.soft });
      ctx.restore();
      font(500, 24); text('term: four years', CX, 620, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [NUM, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneRound1(t);
    sceneArithmetic(t);
    sceneRunoff(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 42, weight: 700, family: SERIF, ink: C.ink, marks: { '*': C.flavio, '~': C.lula, '^': C.line } });
  },
});
