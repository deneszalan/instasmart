// Explainer for history-nuremberg-judgment-three-votes: 1 October 2026 marked 80 years since the judgment of the
// International Military Tribunal at Nuremberg. How the court decided: four judges, one from each Allied power, four
// counts, and a conviction only with the votes of at least three of the four. A serious subject, drawn soberly: dark
// courtroom wood, the bench of four seats, the dock as 22 empty seats, a verdict grid with no faces and no names but
// the three acquitted. Brass for guilty, pale blue for not convicted. Cinzel (inscriptional capitals) for headings and
// labels, Crimson Pro for captions.
//
// Facts:
// - Charter of the International Military Tribunal (Avalon Project, avalon.law.yale.edu/imt/imtconst.asp): Art. 2,
//   four members, each with an alternate, one of each appointed by each signatory; Art. 4(c), decisions by majority,
//   the President's vote decisive when votes are evenly divided, but "convictions and sentences shall only be imposed
//   by affirmative votes of at least three members of the Tribunal"; Art. 6, crimes against peace, war crimes, crimes
//   against humanity.
// - Case Western Reserve University School of Law, "The legacy of Nuremberg" conference, 1–2 October 2026,
//   commemorating the 80th anniversary of the judgment of 1 October 1946.
// - Wikipedia, "Nuremberg trials": France, the Soviet Union, the UK and the US convened the tribunal in 1945; it tried
//   22 leaders (24 indicted; Bormann tried in absentia, Krupp unfit, Ley dead); the Holocaust was a major focus; all
//   eight judges deliberated but the deputies could not vote; 8 convicted of conspiracy; 12 sentenced to death; Hess,
//   Funk, Raeder (life) and Dönitz, Schirach, Speer, Neurath (terms) went to Spandau; all three acquittals (Papen,
//   Schacht, Fritzsche) were based on a deadlock between the judges (citing Priemel 2016); Nikitchenko's dissent
//   rejected all the acquittals. Judges: Nikitchenko (USSR), Lawrence (UK), Biddle (US), Donnedieu de Vabres (France).
//   Wikipedia, "Geoffrey Lawrence, 1st Baron Oaksey": President of the International Military Tribunal.
// - Wikipedia, "List of defendants at the International Military Tribunal": each defendant's four counts (indicted,
//   guilty or not charged) and sentence; the grid below copies it for the 22 tried, in that list's order. Prison terms:
//   Dönitz 10 years, Neurath 15, Schirach 20, Speer 20.
// Computed here: the convictions per count (8 of 22, 12 of 16, 16 of 18, 16 of 18), 19 convicted, the sentence totals.
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: 80 years; the bench of four powers.
//  B  9.2–13.8  A judge and a deputy for each; deputies cannot vote.
//  C 13.8–27.6  The dock of 22; the four counts.
//  D 27.6–36.8  The rule: three of four votes; 2–2 cannot convict.
//  E 36.8–50.6  The verdict grid; three acquitted after splits; the Soviet dissent.
//  F 50.6–60.0  Sentences; the rule again.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg: '#251a14', bg2: '#33241b', panel: 'rgba(255,230,190,0.035)', ink: '#f2e9d8', soft: 'rgba(242,233,216,0.70)', faint: 'rgba(242,233,216,0.22)',
  brass: '#d4ab5c', acq: '#93b9cb', seat: 'rgba(242,233,216,0.10)', card: 'rgba(242,233,216,0.06)',
};
const CAPS = 'Cinzel', SERIF = 'Crimson Pro';

let k, ctx;
const font = (w, s, f = CAPS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the court and its verdicts ----------
const POWERS = ['United States', 'United Kingdom', 'Soviet Union', 'France'];
const NEEDED = 3; // Charter, Art. 4(c)
// The 22 defendants tried, in the order of Wikipedia's list; for counts 1–4: G guilty, I indicted but not convicted, - not charged.
const GRID = ['I-GG', 'IGG-', 'I-GG', 'IGGG', 'I-II', 'IGGG', 'GGGG', 'GGII', 'GGGG', 'I-GG', 'GGGG', 'GGGG', 'II--', 'GGG-', 'GGGG', 'GGGG', 'IIGG', 'II--', 'I--G', 'IGGG', 'IIGG', 'I--G'];
const ACQUITTED = { 4: 'Hans Fritzsche, radio propagandist', 12: 'Franz von Papen, former chancellor', 17: 'Hjalmar Schacht, former Reichsbank president' };
const COUNTS = ['Conspiracy', 'Crimes against peace', 'War crimes', 'Crimes against humanity'];
const TRIED = GRID.length;
const byCount = [0, 1, 2, 3].map((c) => ({ guilty: GRID.filter((r) => r[c] === 'G').length, charged: GRID.filter((r) => r[c] !== '-').length }));
const CONVICTED = GRID.filter((r) => r.includes('G')).length; // 19
const SENTENCES = { death: 12, life: 3, terms: 4 };
if (TRIED !== 22 || CONVICTED !== 19 || byCount[0].guilty !== 8 || byCount[1].guilty !== 12 || SENTENCES.death + SENTENCES.life + SENTENCES.terms !== CONVICTED) throw new Error('verdicts');
if (Object.keys(ACQUITTED).some((i) => GRID[i].includes('G'))) throw new Error('acquitted rows');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 1 October 2026, it was 80 years since the judgment at the Nuremberg trial of Nazi leaders.'],
  [4.8, 9.0, 'The court, the International Military Tribunal, was set up in 1945 by four Allied powers.'],
  [9.2, 13.6, 'The US, the UK, the Soviet Union and France each named a judge, plus a deputy who could not vote.'],
  [13.8, 18.2, `It tried ${TRIED} leaders of Nazi Germany, one of them in his absence, on up to four counts.`],
  [18.4, 22.8, 'The four counts: conspiracy, crimes against peace, war crimes and crimes against humanity.'],
  [23.0, 27.4, 'Most were charged with war crimes and crimes against humanity; the Holocaust was a major focus.'],
  [27.6, 32.0, `The key rule: a conviction needed the votes of at least ^${NEEDED} of the 4^ judges.`],
  [32.2, 36.6, 'So if the judges split two against two, the accused could not be convicted.'],
  [36.8, 41.2, `On 1 October 1946, the court found ${CONVICTED} of the ${TRIED} *guilty* on at least one count.`],
  [41.4, 45.8, `Three were ~acquitted~. Historians say each acquittal came from a split between the judges.`],
  [46.0, 50.4, 'The Soviet judge dissented: he said all three should have been convicted.'],
  [50.6, 55.0, `Of the ${CONVICTED}, ${SENTENCES.death} were sentenced to death, ${SENTENCES.life} to life in prison and ${SENTENCES.terms} to 10 to 20 years.`],
  [55.2, 60.0, 'One rule shaped every verdict: without three votes of four, there was no conviction.'],
];

// ---------- background: wood panelling ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg2); lg.addColorStop(1, C.bg);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.panel; g.lineWidth = 3;
  for (let x = 36; x < W; x += 132) { g.strokeRect(x, 40, 112, 1000); g.strokeRect(x + 12, 56, 88, 968); }
  let s = 13; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1400; i++) { g.strokeStyle = `rgba(255,220,170,${rnd() * 0.025})`; g.lineWidth = 1; const x = rnd() * W, y = rnd() * H; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 30, y + 80, x - 20, y + 160, x + 10, y + 240); g.stroke(); }
}

// ---------- pieces ----------
const CX = W / 2;
function header(s, y = 112) { font(600, 24); text(s, CX, y, { align: 'center', base: 'middle', color: C.soft, spacing: '3px' }); }
// the bench: four seats, each a judge (and a deputy behind)
function bench(t, y, o = {}) {
  POWERS.forEach((p, i) => {
    const x = 126 + i * 204, g = eout(seg(t, (o.t0 ?? 0) + i * 0.2, (o.t0 ?? 0) + 0.7 + i * 0.2));
    A(g, () => {
      const hi = o.highlight === i;
      if (o.deputies) A(o.deputies, () => {
        ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); k.rrect(x - 74, y - 120, 148, 92, 12); ctx.stroke(); ctx.setLineDash([]);
        font(700, 20); text('DEPUTY', x, y - 88, { align: 'center', base: 'middle', color: C.soft, spacing: '1px' });
        font(400, 24, SERIF); text('no vote', x, y - 56, { align: 'center', base: 'middle', color: C.soft });
      });
      ctx.fillStyle = hi ? 'rgba(212,171,92,0.30)' : C.card; k.rrect(x - 94, y - 10, 188, 210, 14); ctx.fill();
      ctx.strokeStyle = hi ? C.brass : 'rgba(212,171,92,0.55)'; ctx.lineWidth = hi ? 4 : 2.5; k.rrect(x - 94, y - 10, 188, 210, 14); ctx.stroke();
      // a high-backed chair
      ctx.fillStyle = C.brass; ctx.globalAlpha *= 0.85;
      k.rrect(x - 34, y + 14, 68, 86, [18, 18, 5, 5]); ctx.fill(); ctx.fillRect(x - 44, y + 96, 88, 16); ctx.globalAlpha /= 0.85;
      font(700, 21); const words = p.split(' ');
      words.forEach((w, j) => text(w.toUpperCase(), x, y + 150 + j * 28 - (words.length - 1) * 14, { align: 'center', base: 'middle', spacing: '1px' }));
    });
  });
}
function ballot(x, y, s, vote, a = 1) {
  A(a, () => {
    ctx.fillStyle = vote ? C.brass : 'rgba(147,185,203,0.25)'; k.rrect(x, y, s, s, 8); ctx.fill();
    ctx.strokeStyle = vote ? C.brass : C.acq; ctx.lineWidth = 3; k.rrect(x, y, s, s, 8); ctx.stroke();
    font(700, s * 0.27, SERIF); text(vote ? 'guilty' : 'not', x + s / 2, y + s / 2 - (vote ? 0 : s * 0.14), { align: 'center', base: 'middle', color: vote ? C.bg : C.acq });
    if (!vote) text('guilty', x + s / 2, y + s / 2 + s * 0.17, { align: 'center', base: 'middle', color: C.acq });
  });
}

// ---------- scenes ----------
function sceneHook(t) {
  const a = 1 - seg(t, 13.6, 14.2);
  if (a <= 0) return;
  A(a, () => {
    header('NUREMBERG · PALACE OF JUSTICE');
    A(span(t, 0.3, 5.0, 0.6, 0.4), () => {
      font(700, 120); text('80', CX, 330, { align: 'center', base: 'middle', color: C.brass });
      font(600, 30); text('YEARS', CX, 420, { align: 'center', base: 'middle', spacing: '6px' });
      font(400, 32, SERIF); text('1 October 1946 – 1 October 2026', CX, 484, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 4.8, 5.4), () => {
      font(700, 28); text('THE INTERNATIONAL MILITARY TRIBUNAL', CX, 180, { align: 'center', base: 'middle', color: C.brass, spacing: '2px' });
      bench(t, 360, { t0: 5.2, deputies: seg(t, 9.6, 10.4) });
      A(seg(t, 10.8, 11.4), () => { font(700, 30); text('4 JUDGES · 4 VOTES', CX, 640, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' }); });
    });
  });
}

// the dock: 22 seats in two rows
function dock(t, y, fill, o = {}) {
  for (let i = 0; i < TRIED; i++) {
    const x = 118 + (i % 11) * 63, yy = y + Math.floor(i / 11) * 76, on = seg(fill, (i / TRIED) * 0.7, (i / TRIED) * 0.7 + 0.3);
    ctx.fillStyle = C.seat; k.rrect(x - 22, yy, 44, 54, [12, 12, 4, 4]); ctx.fill();
    if (on > 0) A(on, () => {
      const absent = i === 0; // Bormann, tried in his absence
      if (absent) { ctx.strokeStyle = C.brass; ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]); k.rrect(x - 22, yy, 44, 54, [12, 12, 4, 4]); ctx.stroke(); ctx.setLineDash([]); }
      else { ctx.fillStyle = 'rgba(212,171,92,0.55)'; k.rrect(x - 22, yy, 44, 54, [12, 12, 4, 4]); ctx.fill(); }
    });
  }
}
function sceneCharges(t) {
  const a = span(t, 13.8, 27.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('THE DOCK · 22 DEFENDANTS');
    dock(t, 170, eio(seg(t, 14.0, 15.6)));
    A(seg(t, 16.0, 16.6), () => { font(400, 22, SERIF); text('dashed seat: tried in his absence', CX, 346, { align: 'center', base: 'middle', color: C.soft }); });
    COUNTS.forEach((c, i) => {
      const y = 430 + i * 74, g = eout(seg(t, 18.6 + i * 0.5, 19.3 + i * 0.5)), hi = i >= 2 && t > 23.0;
      A(g, () => {
        ctx.fillStyle = hi ? 'rgba(212,171,92,0.22)' : C.card; k.rrect(140, y - 28, 584, 56, 10); ctx.fill();
        font(700, 26); text(`${'I II III IV'.split(' ')[i]}`, 186, y + 1, { align: 'center', base: 'middle', color: C.brass });
        font(600, 26); text(c.toUpperCase(), 236, y + 1, { base: 'middle', spacing: '1px' });
      });
    });
  });
}

function sceneRule(t) {
  const a = span(t, 27.6, 36.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('CHARTER · ARTICLE 4(c)');
    font(700, 40, SERIF); text('a conviction needs', CX, 210, { align: 'center', base: 'middle' });
    font(700, 76); text('3 of 4', CX, 290, { align: 'center', base: 'middle', color: C.brass });
    // three examples of four ballots
    const ex = [[[1, 1, 1, 1], 'convicted'], [[1, 1, 1, 0], 'convicted'], [[1, 1, 0, 0], 'not convicted']];
    ex.forEach(([votes, out], r) => {
      const y = 380 + r * 116, t0 = 28.6 + r * 1.3 + (r === 2 ? 1.6 : 0);
      A(seg(t, t0, t0 + 0.5), () => {
        votes.forEach((v, i) => ballot(150 + i * 92, y, 80, v, seg(t, t0 + i * 0.12, t0 + 0.3 + i * 0.12)));
        A(seg(t, t0 + 0.6, t0 + 1.0), () => {
          font(700, 30); text(out.toUpperCase(), 690, y + 40, { align: 'center', base: 'middle', color: out === 'convicted' ? C.brass : C.acq, spacing: '1px' });
          font(400, 22, SERIF); text(`${votes.filter(Boolean).length} votes to ${4 - votes.filter(Boolean).length}`, 690, y + 74, { align: 'center', base: 'middle', color: C.soft });
        });
      });
    });
  });
}

// the verdict grid: 22 rows × 4 counts
function sceneGrid(t) {
  const a = span(t, 36.8, 50.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('THE JUDGMENT · 1 OCTOBER 1946', 100);
    const x0 = 64, cw = 62, y0 = 150, rh = 22.5;
    ['I', 'II', 'III', 'IV'].forEach((c, j) => { font(700, 22); text(c, x0 + j * cw + cw / 2, y0 - 16, { align: 'center', base: 'middle', color: C.brass }); });
    GRID.forEach((row, i) => {
      const y = y0 + i * rh, on = seg(t, 37.0 + i * 0.06, 37.4 + i * 0.06), acq = ACQUITTED[i] !== undefined;
      A(on * (t > 41.6 && !acq ? 0.45 : 1), () => {
        [...row].forEach((v, j) => {
          const x = x0 + j * cw + 6;
          if (v === 'G') { ctx.fillStyle = C.brass; ctx.fillRect(x, y + 2, cw - 12, rh - 5); }
          else if (v === 'I') { ctx.strokeStyle = C.acq; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 3, cw - 14, rh - 7); }
          else { ctx.fillStyle = C.faint; ctx.fillRect(x + (cw - 12) / 2 - 6, y + rh / 2 - 2, 12, 2); }
        });
      });
      if (acq) A(seg(t, 42.0, 42.6), () => {
        ctx.strokeStyle = C.acq; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 4 * cw + 6, y + rh / 2); ctx.lineTo(x0 + 4 * cw + 30, y + rh / 2); ctx.stroke();
        font(600, 24, SERIF); text(ACQUITTED[i], x0 + 4 * cw + 38, y + rh / 2, { base: 'middle', color: C.acq });
      });
    });
    // tallies per count
    A(seg(t, 38.8, 39.4) * (1 - seg(t, 41.4, 41.8)), () => {
      byCount.forEach((c, j) => { font(700, 20); text(`${c.guilty}/${c.charged}`, x0 + j * cw + cw / 2, y0 + TRIED * rh + 22, { align: 'center', base: 'middle', color: C.brass }); });
      font(400, 22, SERIF); text('guilty / charged, per count', x0 + 4 * cw + 24, y0 + TRIED * rh + 22, { base: 'middle', color: C.soft });
      // legend
      ctx.fillStyle = C.brass; ctx.fillRect(x0 + 4 * cw + 24, 220, 40, 16); font(400, 24, SERIF); text('guilty', x0 + 4 * cw + 76, 228, { base: 'middle' });
      ctx.strokeStyle = C.acq; ctx.lineWidth = 2; ctx.strokeRect(x0 + 4 * cw + 25, 270, 38, 14); text('charged, not guilty', x0 + 4 * cw + 76, 277, { base: 'middle' });
      ctx.fillStyle = C.faint; ctx.fillRect(x0 + 4 * cw + 38, 324, 12, 2); text('not charged', x0 + 4 * cw + 76, 325, { base: 'middle' });
      font(400, 22, SERIF); text('each row: one defendant', x0 + 4 * cw + 24, 384, { base: 'middle', color: C.soft });
    });
    // the Soviet dissent
    A(seg(t, 46.2, 46.8), () => {
      const x = 470, y = 610;
      ctx.fillStyle = 'rgba(212,171,92,0.16)'; k.rrect(x, y, 330, 120, 12); ctx.fill();
      ctx.strokeStyle = C.brass; ctx.lineWidth = 2.5; k.rrect(x, y, 330, 120, 12); ctx.stroke();
      font(700, 20); text('SOVIET JUDGE · DISSENT', x + 165, y + 34, { align: 'center', base: 'middle', color: C.brass, spacing: '1px' });
      font(400, 24, SERIF); text('convict all three', x + 165, y + 78, { align: 'center', base: 'middle' });
    });
  });
}

function sceneSentences(t) {
  const a = eout(seg(t, 50.6, 51.2));
  if (a <= 0) return;
  A(a, () => {
    const rule = seg(t, 55.2, 55.8);
    A(1 - rule, () => {
      header('SENTENCES · 19 CONVICTED');
      const rows = [[SENTENCES.death, 'sentenced to death'], [SENTENCES.life, 'life in prison'], [SENTENCES.terms, '10 to 20 years in prison'], [3, 'acquitted']];
      rows.forEach(([n, lab], r) => {
        const y = 210 + r * 120, g = eout(seg(t, 50.8 + r * 0.4, 51.4 + r * 0.4)), acq = r === 3;
        A(g, () => {
          for (let i = 0; i < n; i++) {
            const x = 110 + i * 50;
            ctx.fillStyle = acq ? 'transparent' : C.brass; if (!acq) { k.rrect(x, y, 40, 52, [10, 10, 3, 3]); ctx.fill(); }
            else { ctx.strokeStyle = C.acq; ctx.lineWidth = 2.5; k.rrect(x, y, 40, 52, [10, 10, 3, 3]); ctx.stroke(); }
          }
          font(700, 38); text(`${n}`, 110, y + 84, { base: 'middle', color: acq ? C.acq : C.brass });
          font(500, 32, SERIF); text(lab, 160, y + 84, { base: 'middle', color: C.ink });
        });
      });
    });
    // the rule once more
    A(rule, () => {
      header('ONE RULE');
      [1, 1, 1, 0].forEach((v, i) => ballot(186 + i * 128, 300, 108, v, seg(t, 55.6 + i * 0.15, 56.0 + i * 0.15)));
      A(seg(t, 56.6, 57.2), () => {
        font(700, 46, SERIF); text('three of four, or no conviction', CX, 520, { align: 'center', base: 'middle', color: C.brass });
      });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [CAPS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneCharges(t);
    sceneRule(t);
    sceneGrid(t);
    sceneSentences(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 44, weight: 700, family: SERIF, ink: C.ink, marks: { '*': C.brass, '~': C.acq, '^': C.brass } });
  },
});
