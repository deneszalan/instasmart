// Explainer for politics-sweden-negative-parliamentarism: on 15 October 2026 the Riksdag rejected Magdalena
// Andersson as prime minister, 248 votes to 99. In Sweden a candidate does not need a majority for her, only
// no majority against her. Look: a dark Stockholm-evening blue, the Riksdag's 349 seats as a hemicycle of
// dots, and a "no" bar with a gold line at 175. Votes, not parties, have colours: teal for yes, coral for no,
// grey for abstaining. Oswald (condensed) for numbers and labels, Source Sans 3 for captions.
//
// Facts, all from the Riksdag:
// - 15 October 2026 (Riksdag news "No to Magdalena Andersson (SocDem) as Prime Minister", and protocol
//   2026/27:8, data.riksdagen.se/dokument/HE098): 99 yes (99 S), 248 no (70 M, 62 SD, 29 V, 25 C, 22 KD,
//   21 MP, 19 L), 0 abstaining, 2 absent (1 V, 1 MP). A proposal is rejected if more than half of the members,
//   at least 175, vote against it; otherwise it is approved. The Speaker may make four proposals in total; if
//   none is approved, an extraordinary election must be held within three months. The election was on
//   13 September 2026. Seats (from the party breakdown): S 99, M 70, SD 62, V 30, C 25, KD 22, MP 22, L 19 = 349.
// - 18 January 2019 (protocol 2018/19:39, HE60939): Stefan Löfven approved with 115 yes, 153 no, 77
//   abstaining, 4 absent. "Mindre än hälften av riksdagens ledamöter hade röstat mot förslaget."
// - 24 November 2021 (protocol 2021/22:33, H90933): Magdalena Andersson approved with 117 yes, 174 no,
//   57 abstaining, 1 absent.
// - 17 October 2022 (protocol 2022/23:9, HA099): Ulf Kristersson approved, 176 yes to 173 no.
// - 14 November 2018 (HE60916): Kristersson rejected, 154 yes, 195 no. 14 December 2018 (HE60929): Löfven
//   rejected, 116 yes, 200 no, 28 abstaining.
// Computed here: 175 is the smallest number over half of 349; the margins below and above it.
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: the hemicycle fills, 99 yes and 248 no; rejected.
//  B  9.2–23.0  The rule: a no bar with a line at 175; abstaining and absence don't count against.
//  C 23.0–41.4  2019 (more no than yes, approved), 2021 (174 no, one short), 2022 (176–173).
//  D 41.4–46.0  2026: 248 no, far past the line.
//  E 46.0–55.2  Four proposals, then an extra election within three months.
//  F 55.2–60.0  Not a majority for you, but no majority against you.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#101b24', bg2: '#1c2e3b', ink: '#eef3f4', soft: 'rgba(238,243,244,0.70)', faint: 'rgba(238,243,244,0.24)', seat: 'rgba(238,243,244,0.12)',
  yes: '#5cc6b6', no: '#f08b5b', abst: '#93a1ad', line: '#f2cf5b', card: '#1f3442', card2: '#27404f',
};
const NUM = 'Oswald', TXT = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the votes (Riksdag protocols) ----------
const MPS = 349;
const LINE = Math.floor(MPS / 2) + 1; // 175: more than half of all members
const VOTES = {
  y2026: { yes: 99, no: 248, abst: 0, away: 2 },
  y2019: { yes: 115, no: 153, abst: 77, away: 4 },
  y2021: { yes: 117, no: 174, abst: 57, away: 1 },
  y2022: { yes: 176, no: 173, abst: 0, away: 0 },
};
for (const v of Object.values(VOTES)) if (v.yes + v.no + v.abst + v.away !== MPS) throw new Error('votes must add up to 349');
const approved = (v) => v.no < LINE;

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 15 October 2026, Sweden’s parliament voted on a new prime minister.'],
  [4.8, 9.0, `Social Democrat leader Magdalena Andersson got ~${VOTES.y2026.yes} yes~ and *${VOTES.y2026.no} no*. She was rejected.`],
  [9.2, 13.6, 'The odd part: in Sweden, a prime minister doesn’t need a majority voting ~yes~.'],
  [13.8, 18.2, `A candidate is rejected only if more than half of all ${MPS} members (MPs) vote *no*: ^${LINE}^ or more.`],
  [18.4, 22.8, 'MPs who abstain or stay away are simply not counted against the candidate.'],
  [23.0, 27.4, `In January 2019, Social Democrat Stefan Löfven got ~${VOTES.y2019.yes} yes~ and *${VOTES.y2019.no} no*, ${VOTES.y2019.abst} abstaining.`],
  [27.6, 32.0, `More MPs voted against him than for him, but ${VOTES.y2019.no} is under ${LINE}: he became prime minister.`],
  [32.2, 36.6, `In November 2021, Magdalena Andersson got *${VOTES.y2021.no} no* votes, ^one short^, and took office.`],
  [36.8, 41.2, `In October 2022, Moderate leader Ulf Kristersson was approved ${VOTES.y2022.yes} to ${VOTES.y2022.no}, all MPs voting.`],
  [41.4, 45.8, `This time every party except her own voted *no*: ${VOTES.y2026.no} is far past ${LINE}.`],
  [46.0, 50.4, 'After a rejection the parliament’s Speaker tries again, with up to ^four^ proposals in all.'],
  [50.6, 55.0, 'If all four fail, Sweden must hold an extra election within three months.'],
  [55.2, 60.0, 'So you don’t need most MPs on your side, only not most of them against you.'],
];

// ---------- background: evening blue, a faint arc of the chamber ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg2); lg.addColorStop(1, C.bg);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(238,243,244,0.035)'; g.lineWidth = 2;
  for (let r = 420; r < 1100; r += 46) { g.beginPath(); g.arc(W / 2, 1180, r, Math.PI, 0); g.stroke(); }
  let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(200,220,230,${rnd() * 0.03})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd(), 1 + rnd()); }
}

// ---------- the hemicycle: 349 seats in 11 rows, ordered left to right ----------
const HEMI = { cx: W / 2, cy: 600, r0: 128, r1: 352, rows: 11 };
const SEATS = (() => {
  const radii = Array.from({ length: HEMI.rows }, (_, i) => lerp(HEMI.r0, HEMI.r1, i / (HEMI.rows - 1)));
  const sum = radii.reduce((a, b) => a + b, 0);
  const per = radii.map((r) => Math.round((MPS * r) / sum));
  let diff = MPS - per.reduce((a, b) => a + b, 0);
  for (let i = per.length - 1; diff !== 0; i = (i - 1 + per.length) % per.length) { per[i] += Math.sign(diff); diff -= Math.sign(diff); }
  const out = [];
  radii.forEach((r, i) => {
    for (let j = 0; j < per[i]; j++) {
      const a = Math.PI - (Math.PI * (j + 0.5)) / per[i];
      out.push({ a, x: HEMI.cx + r * Math.cos(a), y: HEMI.cy - r * Math.sin(a) });
    }
  });
  return out.sort((p, q) => q.a - p.a); // from the left end to the right end
})();
const DOT = 8.4;
/** The colour of each seat for a vote: yes from the left, then abstaining, then away, then no. */
function seatColours(v) {
  return SEATS.map((_, i) => (i < v.yes ? C.yes : i < v.yes + v.abst ? C.abst : i < v.yes + v.abst + v.away ? null : C.no));
}
function hemicycle(v, fill, o = {}) {
  const cols = seatColours(v);
  SEATS.forEach((p, i) => {
    const on = seg(fill, (i / MPS) * 0.8, (i / MPS) * 0.8 + 0.2);
    ctx.fillStyle = C.seat; ctx.beginPath(); ctx.arc(p.x, p.y, DOT, 0, Math.PI * 2); ctx.fill();
    if (on <= 0) return;
    const col = cols[i];
    if (!col) { ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, DOT - 1, 0, Math.PI * 2); ctx.stroke(); return; }
    A(on, () => { ctx.fillStyle = o.dimNo && col === C.no ? 'rgba(240,139,91,0.35)' : col; ctx.beginPath(); ctx.arc(p.x, p.y, DOT * (0.6 + 0.4 * on), 0, Math.PI * 2); ctx.fill(); });
  });
}

// ---------- the no bar: 0 to 349 no votes, a gold line at 175 ----------
const BAR = { L: 92, R: 772 };
const bx = (n) => lerp(BAR.L, BAR.R, n / MPS);
function noBar(y, v, grow, o = {}) {
  const h = o.h ?? 64;
  ctx.fillStyle = 'rgba(238,243,244,0.08)'; k.rrect(BAR.L, y, BAR.R - BAR.L, h, 10); ctx.fill();
  // no votes from the left, the rest from the right: yes, abstaining, away
  const n = v.no * grow;
  ctx.fillStyle = C.no; k.rrect(BAR.L, y, Math.max(0.1, bx(n) - BAR.L), h, [10, 0, 0, 10]); ctx.fill();
  if (o.rest !== false) {
    let x = BAR.R;
    for (const [m, col] of [[v.yes, C.yes], [v.abst, C.abst], [v.away, 'rgba(238,243,244,0.18)']]) {
      const w = (bx(m * grow) - BAR.L);
      if (w <= 0) continue;
      ctx.fillStyle = col; ctx.fillRect(x - w, y, w, h); x -= w;
    }
  }
  // the line
  ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.setLineDash([9, 7]);
  ctx.beginPath(); ctx.moveTo(bx(LINE - 0.5), y - 22); ctx.lineTo(bx(LINE - 0.5), y + h + 22); ctx.stroke(); ctx.setLineDash([]);
  if (o.label !== false) { font(600, 24); text(`${LINE}`, bx(LINE - 0.5), y - 36, { align: 'center', base: 'middle', color: C.line }); }
  if (grow > 0.98 && o.nums !== false) {
    font(700, 30); text(`${v.no}`, BAR.L + 14, y + h / 2, { base: 'middle', color: C.bg });
    if (v.yes) text(`${v.yes}`, BAR.R - 14, y + h / 2, { align: 'right', base: 'middle', color: C.bg });
  }
}
function verdict(x, y, ok, a, size = 34) {
  A(a, () => {
    const s = 0.8 + 0.2 * back(clamp(a));
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.04);
    const col = ok ? C.yes : C.no, word = ok ? 'APPROVED' : 'REJECTED';
    font(700, size); const w = ctx.measureText(word).width + 44;
    ctx.strokeStyle = col; ctx.lineWidth = 4; k.rrect(-w / 2, -size * 0.85, w, size * 1.7, 8); ctx.stroke();
    text(word, 0, 2, { align: 'center', base: 'middle', color: col, spacing: '3px' });
    ctx.restore();
  });
}

// ---------- scenes ----------
const CX = W / 2;
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.6);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { font(500, 28); text('SWEDEN’S PARLIAMENT, THE RIKSDAG', CX, 132, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' }); text('349 SEATS · 15 OCTOBER 2026', CX, 172, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' }); });
    hemicycle(VOTES.y2026, t < 4.8 ? 0 : eio(seg(t, 5.0, 7.0)));
    // empty seats first, then the vote
    A(seg(t, 6.6, 7.4), () => {
      font(700, 64); text(`${VOTES.y2026.yes}`, 210, 664, { align: 'center', base: 'middle', color: C.yes });
      text(`${VOTES.y2026.no}`, 654, 664, { align: 'center', base: 'middle', color: C.no });
      font(500, 26); text('YES', 210, 714, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
      text('NO', 654, 714, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    });
    verdict(CX, 548, false, seg(t, 7.6, 8.2), 38);
  });
}

function sceneRule(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 28); text('WHAT DECIDES', CX, 150, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    // 9.2–13.8: a "yes" majority crossed out
    A(span(t, 9.4, 13.8, 0.4, 0.4), () => {
      font(500, 30); text('to become prime minister:', CX, 300, { align: 'center', base: 'middle', color: C.soft });
      font(700, 64); text(`${LINE} yes votes`, CX, 400, { align: 'center', base: 'middle', color: C.yes });
      const x = eio(seg(t, 11.0, 12.0));
      ctx.strokeStyle = C.no; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(250, 404); ctx.lineTo(lerp(250, 614, x), 404); ctx.stroke(); ctx.lineCap = 'butt';
      A(seg(t, 11.8, 12.4), () => { font(600, 40); text('not needed', CX, 510, { align: 'center', base: 'middle', color: C.ink }); });
    });
    // 13.8–23: the no bar; a candidate falls only at 175
    A(seg(t, 13.8, 14.4), () => {
      const y = 330;
      const n = t < 18.4 ? lerp(0, MPS, eio(clamp((t - 14.4) / 3.2) )) : 0;
      if (t < 18.4) {
        const v = { yes: 0, no: Math.round(n), abst: 0, away: 0 };
        noBar(y, v, 1, { rest: false, nums: false });
        font(700, 56); text(`${Math.round(n)}`, CX, 470, { align: 'center', base: 'middle', color: n >= LINE ? C.no : C.ink });
        font(500, 26); text('MPs voting no', CX, 520, { align: 'center', base: 'middle', color: C.soft });
        verdict(CX, 620, n < LINE, 1, 32);
        font(500, 24); text('0', BAR.L, y + 100, { align: 'center', base: 'middle', color: C.soft }); text(`${MPS}`, BAR.R, y + 100, { align: 'center', base: 'middle', color: C.soft });
      } else {
        // abstaining and absent MPs sit with yes: "not against"
        const p = eio(seg(t, 18.6, 20.4));
        const v = { yes: 115, abst: 77, away: 4, no: 153 };
        noBar(y, v, 1, { nums: false });
        font(600, 24);
        text(`${v.no} no`, bx(v.no / 2), y + 32, { align: 'center', base: 'middle', color: C.bg });
        text(`${v.abst} abstain`, bx(v.no + v.away + v.abst * 0.64), y + 32, { align: 'center', base: 'middle', color: C.bg });
        text(`${v.yes} yes`, bx(MPS - v.yes / 2), y + 32, { align: 'center', base: 'middle', color: C.bg });
        A(p, () => {
          ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
          const xa = bx(v.no) + 6, xb = BAR.R;
          ctx.beginPath(); ctx.moveTo(xa, y + 86); ctx.lineTo(xa, y + 100); ctx.lineTo(xb, y + 100); ctx.lineTo(xb, y + 86); ctx.stroke();
          font(600, 28); text('not against', (xa + xb) / 2, y + 134, { align: 'center', base: 'middle' });
          ctx.strokeStyle = C.no; ctx.beginPath(); ctx.moveTo(BAR.L, y + 86); ctx.lineTo(BAR.L, y + 100); ctx.lineTo(bx(v.no) - 6, y + 100); ctx.lineTo(bx(v.no) - 6, y + 86); ctx.stroke();
          font(600, 28); text('against', (BAR.L + bx(v.no)) / 2, y + 134, { align: 'center', base: 'middle', color: C.no });
          font(500, 26); text('Only the no votes are counted against the line.', CX, 560, { align: 'center', base: 'middle', color: C.soft });
          font(500, 22); text('(the vote of 18 January 2019)', CX, 600, { align: 'center', base: 'middle', color: C.faint });
        });
      }
    });
  });
}

function sceneHistory(t) {
  const a = span(t, 23.0, 41.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 28); text('EARLIER VOTES', CX, 150, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    const rows = [
      ['18 Jan 2019 · Stefan Löfven', VOTES.y2019, 23.2, 27.6],
      ['24 Nov 2021 · Magdalena Andersson', VOTES.y2021, 32.2, 32.6],
      ['17 Oct 2022 · Ulf Kristersson', VOTES.y2022, 36.8, 37.2],
    ];
    rows.forEach(([name, v, t0, tv], i) => {
      const y = 250 + i * 170;
      const g = eio(seg(t, t0 + 0.2, t0 + 1.8));
      if (g <= 0) return;
      A(seg(t, t0, t0 + 0.4), () => {
        font(600, 28); text(name, BAR.L, y - 40, { base: 'middle' });
        noBar(y, v, g, { h: 54, label: i === 0 });
        verdict(BAR.R - 92, y - 40, approved(v), seg(t, tv + 1.6, tv + 2.2), 22);
      });
      // 2019: more no than yes, and still approved
      if (i === 0) A(span(t, 25.0, 32.2, 0.4, 0.3), () => {
        font(500, 24);
        text(`no ${v.no}  >  yes ${v.yes}`, BAR.L, y + 82, { base: 'middle', color: C.soft });
        text(`abstained ${v.abst}`, BAR.R, y + 82, { align: 'right', base: 'middle', color: C.abst });
      });
      if (i === 1) A(seg(t, 33.4, 34.0), () => {
        font(600, 24); text(`${v.no}: one short of ${LINE}`, bx(v.no) - 8, y + 80, { align: 'right', base: 'middle', color: C.line });
      });
      if (i === 2) A(seg(t, 38.2, 38.8), () => {
        font(500, 24); text(`${v.yes} yes  ·  ${v.no} no  ·  nobody abstained`, BAR.L, y + 80, { base: 'middle', color: C.soft });
      });
    });
  });
}

function scene2026(t) {
  const a = span(t, 41.4, 46.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 28); text('15 OCTOBER 2026 · MAGDALENA ANDERSSON', CX, 150, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    const g = eio(seg(t, 41.6, 43.4));
    noBar(330, VOTES.y2026, g);
    A(seg(t, 43.2, 43.8), () => {
      font(600, 28); text(`${VOTES.y2026.no - LINE} more no votes than the ${LINE} needed to reject`, CX, 470, { align: 'center', base: 'middle', color: C.no });
      font(500, 24); text('Only her own party, the Social Democrats, voted yes · 2 MPs absent', CX, 516, { align: 'center', base: 'middle', color: C.soft });
    });
    verdict(CX, 630, false, seg(t, 43.8, 44.4), 40);
  });
}

function sceneFour(t) {
  const a = span(t, 46.0, 55.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 28); text('PROPOSALS FROM THE SPEAKER', CX, 150, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    const fade = 1 - seg(t, 50.6, 51.2);
    for (let i = 0; i < 4; i++) {
      const x = 132 + i * 200, y = 300, g = eout(seg(t, 46.2 + i * 0.25, 46.9 + i * 0.25));
      A(g, () => {
        ctx.fillStyle = i === 0 ? C.card2 : C.card; k.rrect(x - 82, y, 164, 210, 14); ctx.fill();
        font(700, 76); text(`${i + 1}`, x, y + 84, { align: 'center', base: 'middle', color: i === 0 ? C.ink : C.faint });
        if (i === 0) { font(500, 22); text('15 Oct', x, y + 150, { align: 'center', base: 'middle', color: C.soft }); text('rejected', x, y + 180, { align: 'center', base: 'middle', color: C.no }); }
        else A(fade, () => { font(500, 22); text('?', x, y + 165, { align: 'center', base: 'middle', color: C.faint }); });
        // after 50.6: all four crossed out (a hypothetical)
        const cross = i === 0 ? 1 : eio(seg(t, 50.8 + i * 0.3, 51.3 + i * 0.3));
        if (cross > 0 && (i === 0 || t > 50.6)) {
          ctx.strokeStyle = C.no; ctx.lineWidth = 6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x - 50, y + 40); ctx.lineTo(lerp(x - 50, x + 50, cross), lerp(y + 40, y + 130, cross)); ctx.stroke(); ctx.lineCap = 'butt';
        }
      });
    }
    A(seg(t, 51.8, 52.6), () => {
      // a ballot box and a three-month span
      const y = 600;
      const drop = eio(seg(t, 52.4, 53.4));
      ctx.fillStyle = C.ink; ctx.save(); ctx.beginPath(); ctx.rect(CX - 80, y - 110, 160, 128); ctx.clip();
      k.rrect(CX - 34, lerp(y - 100, y + 20, drop), 68, 84, 5); ctx.fill();
      ctx.strokeStyle = C.bg; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(CX - 20, lerp(y - 74, y + 46, drop)); ctx.lineTo(CX + 20, lerp(y - 74, y + 46, drop)); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = C.card2; k.rrect(CX - 100, y, 200, 130, 12); ctx.fill();
      ctx.fillStyle = C.bg; ctx.fillRect(CX - 46, y + 16, 92, 9);
      font(600, 34); text('extra election', CX + 0, y + 66, { align: 'center', base: 'middle' });
      font(500, 24); text('within three months', CX, y + 104, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

function sceneEnd(t) {
  const a = eout(seg(t, 55.2, 56.0));
  if (a <= 0) return;
  A(a, () => {
    hemicycle(VOTES.y2019, 1);
    font(500, 24); text(`18 January 2019: ${VOTES.y2019.no} no, ${VOTES.y2019.yes} yes, ${VOTES.y2019.abst} abstaining · approved`, CX, 632, { align: 'center', base: 'middle', color: C.soft });
    font(600, 30);
    A(seg(t, 55.8, 56.4), () => {
      text('needed:', CX, 690, { align: 'center', base: 'middle', color: C.soft });
      font(700, 40); text(`fewer than ${LINE} no votes`, CX, 736, { align: 'center', base: 'middle', color: C.line });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [NUM, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneRule(t);
    sceneHistory(t);
    scene2026(t);
    sceneFour(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 42, weight: 700, family: TXT, ink: C.ink, marks: { '*': C.no, '~': C.yes, '^': C.line } });
  },
});
