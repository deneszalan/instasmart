// Explainer for psychology-adults-outscore-children-creativity: on 21 October 2026 a study in PLOS One from the
// University of Graz tested the belief that children are more creative than adults. Adults' ideas and drawings
// were rated more creative by blind judges; children felt more confident, more motivated and less anxious. Look:
// warm drawing paper with crayon colours, a tin can, five judges with eye masks, and tallies of who-thinks-what.
// Patrick Hand (a neat classroom hand) for labels, Nunito for captions.
//
// Facts: J. Saretzki, I. Fratzl, B. Barbot, M. Benedek, "Are children really more creative than adults? A
// mixed-methods examination of creative performance and experience", PLoS One 21(10): e0346553, published 21
// October 2026, CC BY 4.0:
// - 92 preschool children (mean age 5.67, range 4.66–7.26) from nine kindergartens, and 70 adults (mean 25.31;
//   85% between 20 and 30). Tested individually, August 2021 to April 2022.
// - Tasks in a fixed order: an alternate uses task (as many creative uses as possible for a tin can within 3
//   minutes; a real tin can was provided; answers given aloud); a free drawing (no stated time limit, asked to
//   finish after about 8 minutes); a structured drawing: a fantasy animal that does not exist, in at most 8
//   minutes. Self-reports afterwards on five-point emoticon scales: enjoyment, motivation, self-efficacy,
//   self-appraisal, anxiety.
// - Five experienced raters, blind to age group and task, rated 670 uses and 324 drawings on five-point scales for
//   novelty, effectiveness and overall creativity; for the uses task each score is the average of a person's
//   three highest-rated responses ("max-3"), to reduce the effect of sheer number of ideas.
// - Adults higher on novelty, effectiveness and creativity in the uses task and the structured drawing; in the free
//   drawing adults higher on effectiveness and creativity but not novelty ("adults often chose similarly common
//   drawing topics"). Children: higher motivation (uses, free drawing), higher self-efficacy (both drawings),
//   higher self-appraisal (all three), less anxiety (uses task), more enjoyment (uses, free drawing).
// - Asked who is more creative: adults 78.6% children, 12.9% adults, 8.6% both or undecided; children 46.7%
//   children, 43.5% adults, 9.8% both. Children engage in creative activities more often, most commonly almost
//   every day (parent reports).
// - The Guardian, "Do people become less creative as they get older?" (21 October 2026): senior author Dr Mathias
//   Benedek, University of Graz; with UCLouvain and Yale; limitation: a snapshot comparison of just two age
//   groups, so it is hard to draw conclusions about the impact of ageing.
// Computed here: the head counts from the percentages (55 of 70 adults; 43, 40 and 9 of 92 children). The tin-can
// ideas and their ratings in the scoring example are invented for illustration. No group means are drawn: the
// result panels show only which group scored higher, as the paper reports.
//
// Scene plan (60 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.0  The news; 92 preschoolers and 70 adults.
//  B  9.2–18.2  The tasks: uses for a tin can; a free drawing and a fantasy animal.
//  C 18.4–32.0  Scoring: five blind judges; novelty, effectiveness, creativity; best three ideas.
//  D 32.2–41.2  Results: adults higher; free-drawing novelty a tie.
//  E 41.4–50.4  Feelings: children more confident; who adults think is more creative.
//  F 50.6–60.0  How children take part; the limit of a snapshot.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#f6efe2', paper2: '#efe4cf', ink: '#2b2733', soft: 'rgba(43,39,51,0.68)', faint: 'rgba(43,39,51,0.25)', line: 'rgba(43,39,51,0.12)',
  red: '#d9483b', blue: '#2f6fb3', green: '#3f8f4f', yellow: '#e8b52b', purple: '#7b4aa8', orange: '#e07b2a', tin: '#9aa3ad', card: 'rgba(255,255,255,0.75)',
};
const HAND = 'Patrick Hand', TXT = 'Nunito';

let k, ctx;
// Patrick Hand runs small, so it is set a little larger
const font = (w, s, f = HAND) => k.font(w, f === HAND ? s * 1.14 : s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the study ----------
const KIDS = 92, ADULTS = 70;
const SAY_ADULTS = { kids: 78.6, adults: 12.9, both: 8.6 }, SAY_KIDS = { kids: 46.7, adults: 43.5, both: 9.8 };
const heads = (n, p) => Math.round((n * p) / 100);
const ADULT_HEADS = [heads(ADULTS, SAY_ADULTS.kids), heads(ADULTS, SAY_ADULTS.adults), heads(ADULTS, SAY_ADULTS.both)];
const KID_HEADS = [heads(KIDS, SAY_KIDS.kids), heads(KIDS, SAY_KIDS.adults), heads(KIDS, SAY_KIDS.both)];
if (ADULT_HEADS.reduce((a, b) => a + b, 0) !== ADULTS || KID_HEADS.reduce((a, b) => a + b, 0) !== KIDS) throw new Error('head counts do not add up');
// an invented list of uses for a tin can with invented ratings, to show "best three"
const IDEAS = [['drink from it', 1.4], ['pencil pot', 1.8], ['tiny drum', 3.0], ['string telephone', 3.8], ['flower pot', 2.0], ['robot head', 3.6], ['bug hotel', 3.4]];
const BEST3 = IDEAS.map(([, r]) => r).sort((a, b) => b - a).slice(0, 3);
const BEST3_AVG = BEST3.reduce((a, b) => a + b, 0) / 3;

const CUES = [
  [0.4, 4.6, 'On 21 October 2026, Austrian psychologists tested a common belief: children are more creative.'],
  [4.8, 9.0, `Psychologist Mathias Benedek’s team gave ${KIDS} preschoolers and ${ADULTS} adults the same three tasks.`],
  [9.2, 13.6, 'First: as many creative uses for a *tin can* as you can think of, in three minutes.'],
  [13.8, 18.2, 'Then a free drawing, and a drawing of an *animal that doesn’t exist*, in up to 8 minutes.'],
  [18.4, 22.8, 'Five judges rated every idea and drawing, ^without knowing^ who had made it.'],
  [23.0, 27.4, 'They scored each from 1 to 5: how new it was, how well it worked, and how creative overall.'],
  [27.6, 32.0, 'For the tin, each person’s score was their ^best three^ ideas, so a long list couldn’t win alone.'],
  [32.2, 36.6, 'Adults won: their ideas were newer and worked better, most clearly in the tasks with a goal.'],
  [36.8, 41.2, 'Only in the free drawing did newness tie: many adults drew the same common things.'],
  [41.4, 45.8, 'But the children felt better: more confident, more motivated, and less anxious with the tin.'],
  [46.0, 50.4, `And ~${Math.round(SAY_ADULTS.kids)}%~ of the adults said children are the more creative ones. The children were split.`],
  [50.6, 55.0, 'So children’s edge is in how they take part: confident, playful, and almost every day.'],
  [55.2, 60.0, 'The catch: it compares two age groups at one moment, so it can’t show how a person changes.'],
];

// ---------- background: drawing paper ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  let s = 9; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(120,95,60,${rnd() * 0.05})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1); }
  // a soft band behind the captions
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(0, 790, W, 140);
}
/** A wobbly crayon line through points. */
function crayon(pts, col, w = 5, a = 1) {
  A(a, () => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const off of [0, 1.6]) {
      ctx.globalAlpha *= off ? 0.45 : 1;
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x + off, y - off) : ctx.moveTo(x + off, y - off))); ctx.stroke();
    }
  });
}
const circlePts = (cx, cy, r, n = 28, wob = 0.04, seed = 1) => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; const rr = r * (1 + wob * Math.sin(i * 2.3 + seed)); return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; });
function person(x, y, s, col, kid) {
  const h = kid ? s * 0.8 : s;
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - h * 0.62, h * 0.2, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.roundRect(x - h * 0.2, y - h * 0.38, h * 0.4, h * 0.42, h * 0.12); ctx.fill();
}
function tinCan(x, y, s, a = 1) {
  A(a, () => {
    const w = s * 0.7, h = s;
    ctx.fillStyle = C.tin; ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - w / 2 + w * 0.15, y - h / 2, w * 0.12, h);
    ctx.strokeStyle = '#6f7882'; ctx.lineWidth = 3;
    for (const f of [0.25, 0.5, 0.75]) { ctx.beginPath(); ctx.moveTo(x - w / 2, y - h / 2 + h * f); ctx.lineTo(x + w / 2, y - h / 2 + h * f); ctx.stroke(); }
    ctx.fillStyle = '#c4cbd2'; ctx.beginPath(); ctx.ellipse(x, y - h / 2, w / 2, w * 0.16, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y + h / 2, w / 2, w * 0.16, 0, 0, Math.PI); ctx.stroke();
  });
}
const header = (s, a = 1) => A(a, () => { font(400, 30); text(s, W / 2, 128, { align: 'center', color: C.soft }); });

// ---------- A: the groups ----------
function sceneOpen(t) {
  const a = span(t, 0, 9.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('University of Graz · PLOS One · 21 October 2026');
    A(seg(t, 0.6, 1.2), () => { font(400, 46); text('Are children more creative?', W / 2, 210, { align: 'center', color: C.ink }); crayon([[200, 240], [420, 246], [664, 238]], C.red, 5); });
    const g = (i, n, at) => eout(seg(t, at + (i / n) * 1.4, at + (i / n) * 1.4 + 0.4));
    for (let i = 0; i < KIDS; i++) { const gi = g(i, KIDS, 4.9); if (gi > 0) A(gi, () => person(80 + (i % 12) * 26, 340 + Math.floor(i / 12) * 44, 34, [C.red, C.blue, C.green, C.yellow, C.orange][i % 5], true)); }
    for (let i = 0; i < ADULTS; i++) { const gi = g(i, ADULTS, 5.4); if (gi > 0) A(gi, () => person(490 + (i % 10) * 30, 340 + Math.floor(i / 10) * 50, 40, C.purple, false)); }
    A(seg(t, 6.6, 7.1), () => {
      font(400, 32); text(`${KIDS} preschoolers`, 223, 720, { align: 'center', color: C.ink }); text(`${ADULTS} adults`, 625, 720, { align: 'center', color: C.ink });
      font(400, 24); text('aged 4 to 7', 223, 756, { align: 'center', color: C.soft }); text('most aged 20 to 30', 625, 756, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B: the tasks ----------
function sceneTasks(t) {
  const a = span(t, 9.0, 18.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 13.8) {
      header('Task 1 · uses for a tin can · 3 minutes');
      tinCan(W / 2, 430, 150, eout(seg(t, 9.3, 9.9)));
      // a clock running down
      const p = seg(t, 9.6, 13.4), sec = Math.round(180 * (1 - p));
      font(400, 40); text(`${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`, W / 2, 610, { align: 'center', color: C.red });
      const spots = [[200, 260], [664, 280], [170, 470], [694, 480], [230, 650], [640, 660]];
      IDEAS.slice(0, 6).forEach(([idea], i) => A(eout(seg(t, 10.0 + i * 0.5, 10.4 + i * 0.5)), () => {
        const [x, y] = spots[i];
        ctx.fillStyle = C.card; k.rrect(x - 110, y - 30, 220, 60, 26); ctx.fill();
        font(400, 28); text(idea, x, y + 2, { align: 'center', color: [C.red, C.blue, C.green, C.orange, C.purple, C.red][i] });
      }));
      A(seg(t, 10.2, 10.6), () => { font(400, 22); text('(made-up examples)', W / 2, 700, { align: 'center', color: C.soft }); });
    } else {
      header('Tasks 2 and 3 · drawings');
      const sheet = (x, title, sub, at, draw) => A(eout(seg(t, at, at + 0.5)), () => {
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 170, 200, 340, 420);
        ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.strokeRect(x - 170, 200, 340, 420);
        draw(x, 410, seg(t, at + 0.4, at + 2.4));
        font(400, 32); text(title, x, 660, { align: 'center', color: C.ink });
        font(400, 24); text(sub, x, 700, { align: 'center', color: C.soft });
      });
      sheet(232, 'free drawing', 'anything you like', 14.0, (x, y, p) => {
        // a house and a sun, the kind of common topic the paper mentions
        crayon([[x - 80, y + 120], [x - 80, y + 20], [x, y - 50], [x + 80, y + 20], [x + 80, y + 120], [x - 80, y + 120]].slice(0, 1 + Math.round(p * 5)), C.red, 6);
        if (p > 0.5) crayon(circlePts(x + 90, y - 140, 34), C.yellow, 6, seg(p, 0.5, 0.8));
        if (p > 0.8) crayon([[x - 150, y + 150], [x + 150, y + 150]], C.green, 6);
      });
      sheet(632, 'a fantasy animal', 'that does not exist · 8 min', 15.2, (x, y, p) => {
        crayon(circlePts(x, y + 20, 80, 30, 0.08, 3).slice(0, 1 + Math.round(p * 30)), C.purple, 6);
        if (p > 0.4) { crayon(circlePts(x + 70, y - 80, 36, 20, 0.05, 2), C.blue, 6, seg(p, 0.4, 0.6)); }
        if (p > 0.6) [-50, -15, 20, 55].forEach((dx) => crayon([[x + dx, y + 95], [x + dx - 5, y + 150]], C.orange, 6));
        if (p > 0.8) { crayon([[x - 75, y], [x - 150, y - 60], [x - 120, y + 10]], C.green, 6); crayon([[x + 60, y - 115], [x + 50, y - 160], [x + 90, y - 115], [x + 100, y - 160]], C.red, 5); }
      });
    }
  });
}

// ---------- C: scoring ----------
function sceneScoring(t) {
  const a = span(t, 18.2, 32.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 23.0) {
      header('Five judges, blind to who made what');
      for (let i = 0; i < 5; i++) A(eout(seg(t, 18.6 + i * 0.25, 19.1 + i * 0.25)), () => {
        const x = 152 + i * 140, y = 420;
        person(x, y, 130, [C.blue, C.green, C.purple, C.orange, C.red][i], false);
        // an eye mask: they see the work, not the age of whoever made it
        ctx.fillStyle = C.ink; k.rrect(x - 30, y - 92, 60, 18, 8); ctx.fill();
      });
      A(seg(t, 20.0, 20.5), () => {
        ctx.fillStyle = C.card; k.rrect(110, 520, 644, 160, 16); ctx.fill();
        font(400, 32); text('670 uses for a tin can', W / 2, 568, { align: 'center', color: C.ink });
        text('324 drawings', W / 2, 620, { align: 'center', color: C.ink });
        font(400, 22); text('mixed together; the age of the maker hidden', W / 2, 660, { align: 'center', color: C.soft });
      });
    } else if (t < 27.6) {
      header('Each rated from 1 to 5');
      const rows = [['how new it is', 'novelty', C.blue, 3.8], ['how well it works', 'effectiveness', C.green, 3.2], ['how creative overall', 'creativity', C.purple, 3.6]];
      rows.forEach(([q, name, col, v], i) => A(eout(seg(t, 23.2 + i * 0.6, 23.7 + i * 0.6)), () => {
        const y = 230 + i * 160;
        font(400, 34); text(q, 110, y, { color: col }); font(400, 24); text(`(${name})`, 110, y + 36, { color: C.soft });
        for (let s = 1; s <= 5; s++) {
          const x = 470 + (s - 1) * 66, on = s <= Math.round(v * seg(t, 23.6 + i * 0.6, 24.6 + i * 0.6));
          ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y + 14, 24, 0, 7); ctx.stroke();
          if (on) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y + 14, 18, 0, 7); ctx.fill(); }
          font(400, 22); text(`${s}`, x, y + 56, { align: 'center', color: C.soft });
        }
      }));
      A(seg(t, 25.4, 25.8), () => { font(400, 22); text('one example idea, rated by one judge (illustration)', W / 2, 720, { align: 'center', color: C.soft }); });
    } else {
      header('For the tin: each person’s best three ideas');
      const sorted = IDEAS.map((x, i) => [...x, i]).sort((p, q) => q[1] - p[1]);
      const order = eio(seg(t, 28.4, 29.4));
      IDEAS.forEach(([idea, r], i) => {
        const rank = sorted.findIndex((x) => x[2] === i), y = lerp(206 + i * 66, 206 + rank * 66, order), top = rank < 3 && order > 0.99;
        A(eout(seg(t, 27.8 + i * 0.08, 28.2 + i * 0.08)), () => {
          ctx.fillStyle = top ? 'rgba(232,181,43,0.35)' : C.card; k.rrect(130, y - 26, 604, 52, 12); ctx.fill();
          font(400, 30); text(idea, 154, y + 2, { color: C.ink });
          ctx.fillStyle = top ? C.orange : 'rgba(43,39,51,0.35)'; ctx.fillRect(470, y - 10, (r / 5) * 220, 20);
          font(400, 26); text(r.toFixed(1), 712, y + 2, { align: 'right', color: C.ink });
        });
      });
      A(seg(t, 29.8, 30.3), () => {
        font(400, 32); text(`score = average of the top three = ${BEST3_AVG.toFixed(1)}`, W / 2, 700, { align: 'center', color: C.orange });
        font(400, 22); text('made-up ideas and ratings', W / 2, 740, { align: 'center', color: C.soft });
      });
    }
  });
}

// ---------- D, E: results ----------
function table(t, at, title, rows) {
  // rows: [task, [who scored higher for each column]]; 'A' adults, 'K' children, '=' no difference, '' not reported
  const cols = rows.cols;
  A(eout(seg(t, at, at + 0.5)), () => {
    ctx.fillStyle = C.card; k.rrect(60, 180, 744, 520, 18); ctx.fill();
    font(400, 26); text(title, W / 2, 214, { align: 'center', color: C.soft });
    cols.forEach((c, j) => { font(400, 26); text(c, 380 + j * 150, 266, { align: 'center', color: C.ink }); });
    rows.data.forEach(([task, marks], i) => A(eout(seg(t, at + 0.4 + i * 0.5, at + 0.8 + i * 0.5)), () => {
      const y = 340 + i * 110;
      ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(90, y - 52); ctx.lineTo(774, y - 52); ctx.stroke();
      font(400, 28); text(task, 96, y, { color: C.ink });
      marks.forEach((m, j) => {
        const x = 380 + j * 150;
        if (m === 'A') { person(x - 2, y + 26, 54, C.purple, false); }
        else if (m === 'K') { person(x - 2, y + 26, 54, C.orange, true); }
        else if (m === '=') { font(400, 36); text('=', x, y, { align: 'center', color: C.soft }); }
        else { font(400, 24); text('·', x, y, { align: 'center', color: C.faint }); }
      });
    }));
  });
}
function sceneResults(t) {
  const a = span(t, 32.0, 41.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('Who scored higher, as rated by the judges');
    table(t, 32.4, 'a purple adult: adults higher · = no difference', {
      cols: ['new', 'works', 'creative'],
      data: [['uses for a tin', ['A', 'A', 'A']], ['fantasy animal', ['A', 'A', 'A']], ['free drawing', [t > 37.0 ? '=' : '', t > 37.0 ? 'A' : '', t > 37.0 ? 'A' : '']]],
    });
    A(seg(t, 38.0, 38.5), () => { font(400, 24); text('“adults often chose similarly common drawing topics”', W / 2, 740, { align: 'center', color: C.soft }); });
  });
}
function sceneFeelings(t) {
  const a = span(t, 41.2, 50.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    if (t < 46.0) {
      header('How they felt, in their own words');
      table(t, 41.6, 'an orange child: children higher · · not reported as different', {
        cols: ['tin', 'free', 'animal'],
        data: [['confident beforehand', ['', 'K', 'K']], ['motivated', ['K', 'K', '']], ['less anxious', ['K', '', '']]],
      });
    } else {
      header('Who is more creative, children or adults?');
      const grid = (x0, y0, n, counts, cols, kid) => {
        let i = 0;
        counts.forEach((c, j) => { for (let m = 0; m < c; m++, i++) { const g = eout(seg(t, 46.4 + i * 0.012, 46.8 + i * 0.012)); if (g > 0) A(g, () => person(x0 + (i % 10) * 34, y0 + Math.floor(i / 10) * (kid ? 40 : 46), kid ? 36 : 40, cols[j], kid)); } });
      };
      grid(70, 240, ADULTS, ADULT_HEADS, [C.orange, C.purple, 'rgba(43,39,51,0.3)'], false);
      grid(470, 240, KIDS, KID_HEADS, [C.orange, C.purple, 'rgba(43,39,51,0.3)'], true);
      A(seg(t, 47.4, 47.9), () => {
        font(400, 30); text(`adults: ${ADULT_HEADS[0]} of ${ADULTS} said children`, 223, 640, { align: 'center', color: C.ink });
        text(`children: ${KID_HEADS[0]} children, ${KID_HEADS[1]} adults`, 640, 640, { align: 'center', color: C.ink });
        font(400, 24); text('orange: children · purple: adults · grey: both or unsure', W / 2, 700, { align: 'center', color: C.soft });
      });
    }
  });
}

// ---------- F: the end ----------
function sceneEnd(t) {
  const a = eout(seg(t, 50.6, 51.2));
  if (a <= 0) return;
  A(a, () => {
    if (t < 55.2) {
      header('Two different strengths');
      const card = (x, col, title, lines, at) => A(eout(seg(t, at, at + 0.5)), () => {
        ctx.fillStyle = C.card; k.rrect(x - 180, 200, 360, 470, 18); ctx.fill();
        crayon([[x - 150, 262], [x + 150, 262]], col, 6);
        font(400, 36); text(title, x, 236, { align: 'center', color: col });
        font(400, 28); lines.forEach((l, i) => text(l, x, 320 + i * 64, { align: 'center', color: C.ink }));
      });
      card(232, C.purple, 'adults', ['newer ideas', 'that work better', 'best with a goal', 'more anxious'], 50.8);
      card(632, C.orange, 'children', ['more confident', 'more motivated', 'more enjoyment', 'create almost daily'], 51.6);
    } else {
      header('The limit');
      A(eout(seg(t, 55.4, 56.0)), () => {
        ctx.fillStyle = C.card; k.rrect(110, 220, 644, 400, 18); ctx.fill();
        person(300, 470, 150, C.orange, true); person(564, 470, 190, C.purple, false);
        crayon([[360, 430], [500, 430]], C.soft, 4);
        font(400, 30); text('two groups, one moment', W / 2, 560, { align: 'center', color: C.ink });
        font(400, 26); text('not the same people followed as they grow up', W / 2, 600, { align: 'center', color: C.soft });
      });
    }
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [HAND, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneOpen(t);
    sceneTasks(t);
    sceneScoring(t);
    sceneResults(t);
    sceneFeelings(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 41, weight: 800, family: TXT, ink: C.ink, marks: { '*': C.blue, '~': C.red, '^': C.green } });
  },
});
