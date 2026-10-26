// Explainer for politics-us-midterm-penalty: since 1946 the president's party has lost House seats in 18 of
// 20 midterms. Look: off-white ballot paper with a faint printed grid, navy ink, bars in the conventional party
// colours (blue for a Democratic president, red for a Republican one), gold for headings. Archivo for numbers
// and labels, Bitter (a readable slab serif) for captions.
//
// Facts: seat changes for the president's party in every midterm 1946–2022 from the American Presidency
// Project (UCSB), "Seats in Congress Gained/Lost by the President's Party in Mid-Term Elections". The counts
// and the average are computed here from that table: House losses in 18 of 20 (gains in 1998 and 2002), an
// average change of −25.65 seats, the largest loss 63 in 2010; Senate losses in 13 of 20. Wikipedia ("United
// States midterm election"): midterms are regarded as a referendum on the sitting president's performance;
// since World War II the president's party has lost about 26 House and 4 Senate seats on average. 2026: all
// 435 House seats and 35 Senate seats (33 regular, plus special elections in Ohio and Florida) on 3 November.
//
// Scene plan (61 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: the Capitol and 435 seats.
//  B  9.0–32.4  The record: 20 bars, 18 losses, the two gains, the average, the worst year.
//  C 32.4–41.6  Why: a referendum on the president (a ballot card).
//  D 41.6–55.4  The Senate: 100 seats in three classes; 35 up in 2026; 13 of 20 losses there too.
//  E 55.4–61.0  A pattern, not a law.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#f3efe6', paper2: '#e9e3d6', grid: 'rgba(31,42,68,0.06)', ink: '#1f2a44', soft: 'rgba(31,42,68,0.68)',
  faint: 'rgba(31,42,68,0.35)', gold: '#b7861f', D: '#2f5fa7', R: '#b8352e', Dsoft: 'rgba(47,95,167,0.28)', Rsoft: 'rgba(184,53,46,0.28)',
  stone: '#d9d3c4', stoneDark: '#b9b1a0', sky: '#e6ecf2',
};
const NUM = 'Archivo', SERIF = 'Bitter';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the record (American Presidency Project, UCSB) ----------
const MIDTERMS = [
  [1946, 'D', -56, -12], [1950, 'D', -28, -6], [1954, 'R', -18, -1], [1958, 'R', -48, -13], [1962, 'D', -4, 3],
  [1966, 'D', -47, -4], [1970, 'R', -12, 2], [1974, 'R', -48, -5], [1978, 'D', -15, -3], [1982, 'R', -26, 1],
  [1986, 'R', -5, -8], [1990, 'R', -8, -1], [1994, 'D', -54, -8], [1998, 'D', 4, 0], [2002, 'R', 8, 2],
  [2006, 'R', -30, -6], [2010, 'D', -63, -6], [2014, 'D', -13, -9], [2018, 'R', -41, 2], [2022, 'D', -9, 1],
].map(([year, party, house, senate]) => ({ year, party, house, senate }));
const HOUSE_LOSSES = MIDTERMS.filter((m) => m.house < 0).length; // 18
const SENATE_LOSSES = MIDTERMS.filter((m) => m.senate < 0).length; // 13
const AVG = MIDTERMS.reduce((s, m) => s + m.house, 0) / MIDTERMS.length; // −25.65
const WORST = MIDTERMS.reduce((a, m) => (m.house < a.house ? m : a)); // 2010, −63

// ---------- chart geometry ----------
const CH = { l: 104, r: 800, zero: 262, perSeat: 5.2 };
const NOTE_Y = 690; // one band below the chart for every callout
const slot = (CH.r - CH.l) / MIDTERMS.length, barW = slot * 0.64;
const bx = (i) => CH.l + slot * i + slot / 2;
const by = (seats) => CH.zero - seats * CH.perSeat;

// ---------- timeline ----------
const T = { A: [0, 9.0], B: [9.0, 32.4], C: [32.4, 41.6], D: [41.6, 55.4], E: [55.4, 61] };
const BAR_T0 = 9.6, BAR_DT = 0.32;
const CUES = [
  [0.4, 4.6, 'On 3 November 2026, Americans elect all *435* members of the House.'],
  [4.8, 9.0, 'In these *midterm* elections, history shows a strong pattern.'],
  [9.2, 13.8, 'Each bar: the House seats won or lost by the *president’s party*.'],
  [14.0, 18.6, `Since 1946 it has *lost* seats in ${HOUSE_LOSSES} of ${MIDTERMS.length} midterms.`],
  [18.8, 23.2, 'The only gains came in ~1998~ and ~2002~.'],
  [23.4, 27.8, `On average, the president’s party lost about *${Math.round(-AVG)} House seats*.`],
  [28.0, 32.4, `The biggest loss since 1946: *${-WORST.house} seats*, in ${WORST.year}.`],
  [32.6, 37.0, 'Midterms are widely read as a *referendum* on the president.'],
  [37.2, 41.6, 'The president isn’t on the ballot. The party’s *candidates* are.'],
  [41.8, 46.2, 'The Senate is different: senators serve *six years*, in three staggered classes.'],
  [46.4, 50.8, 'So only about a third is elected at once: in 2026, *35 seats*, two of them special elections.'],
  [51.0, 55.4, `There, too, the president’s party lost seats in ${SENATE_LOSSES} of the ${MIDTERMS.length} midterms.`],
  [55.6, 60.6, 'A pattern is not a law, though: in ~1998~ and ~2002~ it broke.'],
];

// ---------- paper, painted once ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.paper); lg.addColorStop(1, C.paper2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.grid; g.lineWidth = 1;
  for (let x = 0; x < W; x += 24) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
  for (let y = 0; y < H; y += 24) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 7000; i++) { g.fillStyle = `rgba(80,70,50,${r() * 0.04})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
  // a ballot's printed border
  g.strokeStyle = 'rgba(31,42,68,0.25)'; g.lineWidth = 3; g.strokeRect(22, 22, W - 44, H - 44);
  g.lineWidth = 1; g.strokeRect(32, 32, W - 64, H - 64);
}

// ---------- the Capitol, drawn simply ----------
function capitol(cx, base, s, a) {
  A(a, () => {
    ctx.save(); ctx.translate(cx, base); ctx.scale(s, s);
    ctx.fillStyle = C.stone; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    // wings
    ctx.fillRect(-300, -120, 600, 120); ctx.strokeRect(-300, -120, 600, 120);
    for (let x = -280; x <= 280; x += 28) { if (Math.abs(x) < 70) continue; ctx.beginPath(); ctx.moveTo(x, -112); ctx.lineTo(x, -8); ctx.stroke(); }
    // portico and pediment
    ctx.fillRect(-80, -170, 160, 170); ctx.strokeRect(-80, -170, 160, 170);
    ctx.beginPath(); ctx.moveTo(-96, -170); ctx.lineTo(0, -214); ctx.lineTo(96, -170); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let x = -64; x <= 64; x += 32) { ctx.beginPath(); ctx.moveTo(x, -160); ctx.lineTo(x, -6); ctx.stroke(); }
    // drum, dome, lantern
    ctx.fillRect(-110, -280, 220, 66); ctx.strokeRect(-110, -280, 220, 66);
    for (let x = -96; x <= 96; x += 24) { ctx.beginPath(); ctx.moveTo(x, -276); ctx.lineTo(x, -218); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-100, -280); ctx.bezierCurveTo(-100, -400, 100, -400, 100, -280); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.stoneDark; ctx.lineWidth = 2;
    for (const f of [-0.6, -0.3, 0, 0.3, 0.6]) { ctx.beginPath(); ctx.moveTo(f * 100, -280); ctx.quadraticCurveTo(f * 70, -350, 0, -370); ctx.stroke(); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.fillStyle = C.stone; ctx.fillRect(-16, -410, 32, 44); ctx.strokeRect(-16, -410, 32, 44);
    ctx.beginPath(); ctx.moveTo(0, -410); ctx.lineTo(0, -440); ctx.stroke();
    // steps
    ctx.fillStyle = C.stoneDark;
    for (let i = 0; i < 4; i++) ctx.fillRect(-130 - i * 14, -6 + i * 6, 260 + i * 28, 6);
    ctx.restore();
  });
}

// ---------- the bar chart ----------
function chart(t) {
  const shown = eout(seg(t, 9.0, 9.8)) * (1 - seg(t, 32.2, 33.0));
  if (shown <= 0) return;
  A(shown, () => {
    // zero line, gridlines and the axis labels
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5;
    for (const v of [-20, -40, -60]) { ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(CH.l, by(v)); ctx.lineTo(CH.r, by(v)); ctx.stroke(); }
    ctx.setLineDash([]);
    font(600, 22); for (const v of [0, -20, -40, -60]) text(v === 0 ? '0' : `${v}`, CH.l - 14, by(v), { color: C.soft, align: 'right', base: 'middle' });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(CH.l, CH.zero); ctx.lineTo(CH.r, CH.zero); ctx.stroke();
    font(700, 24); text('House seats won or lost', CH.l - 40, 150, { color: C.ink, base: 'middle' });
    // legend
    const lg = (x, color, s) => { ctx.fillStyle = color; k.rrect(x, 182, 22, 22, 4); ctx.fill(); font(500, 22); text(s, x + 32, 194, { color: C.soft, base: 'middle' }); };
    lg(CH.l - 40, C.D, 'Democratic president'); lg(CH.l + 270, C.R, 'Republican president');
    // bars, one by one
    MIDTERMS.forEach((m, i) => {
      const g = eout(seg(t, BAR_T0 + i * BAR_DT, BAR_T0 + i * BAR_DT + 0.45));
      if (g <= 0) return;
      const hl = (m.house > 0 && t > 18.8 && t < 23.4) || (m === WORST && t > 28.0) || (m.house > 0 && t > 55.6);
      const dim = (t > 18.8 && t < 23.4 && m.house < 0) || (t > 28.0 && m !== WORST);
      const y0 = CH.zero, y1 = by(m.house * g);
      ctx.fillStyle = m.party === 'D' ? (dim ? C.Dsoft : C.D) : (dim ? C.Rsoft : C.R);
      k.rrect(bx(i) - barW / 2, Math.min(y0, y1), barW, Math.max(2, Math.abs(y1 - y0)), 4); ctx.fill();
      if (hl) {
        ctx.strokeStyle = C.gold; ctx.lineWidth = 4;
        k.rrect(bx(i) - barW / 2 - 5, Math.min(y0, y1) - 5, barW + 10, Math.abs(y1 - y0) + 10, 7); ctx.stroke();
      }
    });
    // year labels every third midterm
    font(600, 21);
    MIDTERMS.forEach((m, i) => { if (i % 3 === 0) text(`’${String(m.year).slice(2)}`, bx(i), by(-66) + 26, { color: C.soft, align: 'center', base: 'middle' }); });
    // callouts, all in one band below the chart
    A(span(t, 14.2, 18.6), () => {
      font(800, 60); text(`${HOUSE_LOSSES} of ${MIDTERMS.length}`, W / 2 - 20, NOTE_Y, { color: C.R, align: 'right', base: 'middle' });
      font(500, 26); text('midterms with a loss', W / 2, NOTE_Y + 2, { color: C.ink, base: 'middle' });
    });
    A(span(t, 19.0, 23.2), () => {
      font(800, 40); const gains = MIDTERMS.filter((m) => m.house > 0);
      text(gains.map((m) => `${m.year}: +${m.house}`).join('    '), W / 2, NOTE_Y, { color: C.gold, align: 'center', base: 'middle' });
    });
    A(span(t, 28.2, 32.4), () => {
      font(800, 40); text(`${WORST.year}: −${-WORST.house} seats`, W / 2, NOTE_Y, { color: C.gold, align: 'center', base: 'middle' });
    });
    // the average line
    const av = eio(seg(t, 23.6, 24.6)) * (1 - seg(t, 27.6, 28.2));
    A(av, () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(CH.l, by(AVG)); ctx.lineTo(lerp(CH.l, CH.r, av), by(AVG)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(243,239,230,0.92)'; k.rrect(CH.r - 210, by(AVG) + 10, 210, 40, 8); ctx.fill();
      font(800, 26); text(`average −${Math.round(-AVG)}`, CH.r - 10, by(AVG) + 30, { color: C.gold, align: 'right', base: 'middle' });
    });
  });
}

// ---------- the referendum card ----------
function ballot(t) {
  const a = span(t, 32.6, 41.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const lift = 1 - eout(seg(t, 32.6, 33.4));
    ctx.save(); ctx.translate(W / 2, 430 + 40 * lift); ctx.rotate(-0.03);
    ctx.shadowColor = 'rgba(31,42,68,0.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#fffdf8'; k.rrect(-290, -230, 580, 460, 10); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = C.ink; ctx.fillRect(-290, -230, 580, 70);
    font(800, 32); text('OFFICIAL BALLOT', 0, -195, { color: '#fffdf8', align: 'center', base: 'middle', spacing: '4px' });
    font(700, 30, SERIF); text('How is the president doing?', 0, -110, { color: C.ink, align: 'center', base: 'middle' });
    const rows = [['Keep going', 0], ['Change course', 1]];
    rows.forEach(([s, i]) => {
      const y = -20 + i * 90;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(-220, y - 26, 52, 52);
      font(600, 34, SERIF); text(s, -140, y, { color: C.ink, base: 'middle' });
    });
    // a pencil mark appears in one box, then the other: the vote can go either way
    const m1 = seg(t, 34.4, 35.0), m2 = seg(t, 38.0, 38.6);
    const mark = (cx, cy, p) => { ctx.strokeStyle = C.gold; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 18, cy - 18); ctx.lineTo(cx - 18 + 36 * p, cy - 18 + 36 * p); ctx.moveTo(cx + 18, cy - 18); if (p > 0.5) ctx.lineTo(cx + 18 - 72 * (p - 0.5), cy - 18 + 72 * (p - 0.5)); ctx.stroke(); };
    if (m1 > 0 && t < 37.6) mark(-194, 70, m1);
    if (m2 > 0) mark(-194, -20, m2);
    font(500, 24); text('No real ballot asks this question,', 0, 172, { color: C.soft, align: 'center', base: 'middle' });
    text('but the result is often read as its answer.', 0, 202, { color: C.soft, align: 'center', base: 'middle' });
    ctx.restore();
  });
}

// ---------- the Senate's three classes ----------
const CLASS_SIZES = [33, 33, 34]; // classes I, II and III
function senate(t) {
  const a = span(t, 41.6, 55.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 26); text('The Senate: 100 seats in three classes', W / 2, 150, { color: C.ink, align: 'center', base: 'middle' });
    const names = ['Class I · up in 2030', 'Class II · up in 2026', 'Class III · up in 2028'];
    CLASS_SIZES.forEach((n, c) => {
      const rowY = 250 + c * 150;
      const on = c === 1 && t > 46.6;
      font(700, 24); text(names[c], 110, rowY - 46, { color: on ? C.gold : C.soft, base: 'middle' });
      for (let i = 0; i < n; i++) {
        const col = i % 17, row = Math.floor(i / 17);
        const x = 124 + col * 37, y = rowY + row * 38;
        const appear = eout(seg(t, 42.0 + c * 0.6 + i * 0.012, 42.4 + c * 0.6 + i * 0.012));
        // Ohio's and Florida's seats are class III seats filled by special election in 2026
        const special = c === 2 && i < 2 && t > 47.6;
        ctx.fillStyle = on || special ? C.gold : 'rgba(31,42,68,0.22)';
        ctx.beginPath(); ctx.arc(x, y, 14 * appear, 0, Math.PI * 2); ctx.fill();
        if (special) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.stroke(); }
      }
    });
    A(span(t, 47.6, 55.6), () => {
      font(600, 22); text('Specials: Ohio and Florida', 124, 718, { color: C.ink, base: 'middle' });
    });
    A(span(t, 51.0, 55.6), () => {
      ctx.fillStyle = 'rgba(243,239,230,0.94)'; k.rrect(470, 664, 300, 96, 12); ctx.fill();
      ctx.strokeStyle = C.R; ctx.lineWidth = 3; ctx.stroke();
      font(800, 44); text(`${SENATE_LOSSES} of ${MIDTERMS.length}`, 620, 700, { color: C.R, align: 'center', base: 'middle' });
      font(500, 20); text('midterms with a Senate loss', 620, 738, { color: C.ink, align: 'center', base: 'middle' });
    });
  });
}

// ---------- the hook and the end ----------
function hook(t) {
  const a = 1 - seg(t, 8.6, 9.2);
  if (a <= 0) return;
  A(a, () => {
    capitol(W / 2, 700, 0.86, eout(seg(t, 0, 0.9)));
    A(eout(seg(t, 0.8, 1.6)), () => {
      font(800, 120); text('435', W / 2, 160, { color: C.ink, align: 'center', base: 'middle' });
      font(600, 28); text('House seats on the ballot', W / 2, 238, { color: C.soft, align: 'center', base: 'middle' });
    });
    A(eout(seg(t, 4.8, 5.6)), () => {
      font(800, 40, SERIF); text('3 November 2026', W / 2, 756, { color: C.gold, align: 'center', base: 'middle' });
    });
  });
}
function ending(t) {
  const a = eout(seg(t, 55.6, 56.4));
  if (a <= 0) return;
  A(a, () => {
    const rows = MIDTERMS.filter((m) => m.house > 0);
    font(700, 26); text('The exceptions', W / 2, 200, { color: C.soft, align: 'center', base: 'middle' });
    rows.forEach((m, i) => {
      const y = 300 + i * 190, x = W / 2;
      ctx.fillStyle = '#fffdf8'; k.rrect(x - 280, y - 70, 560, 140, 14); ctx.fill();
      ctx.strokeStyle = m.party === 'D' ? C.D : C.R; ctx.lineWidth = 4; ctx.stroke();
      font(800, 54); text(String(m.year), x - 250, y, { color: C.ink, base: 'middle' });
      font(600, 26); text(`House +${m.house}`, x + 250, y - 20, { color: C.ink, align: 'right', base: 'middle' });
      text(`Senate ${m.senate > 0 ? '+' : ''}${m.senate}`, x + 250, y + 20, { color: C.soft, align: 'right', base: 'middle' });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 61, fonts: [NUM, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    hook(t);
    chart(t);
    ballot(t);
    senate(t);
    ending(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 40, weight: 700, family: SERIF, ink: C.ink, marks: { '*': C.R, '~': C.gold } });
  },
});
