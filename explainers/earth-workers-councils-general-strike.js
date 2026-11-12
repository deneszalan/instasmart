// Explainer for earth-workers-councils-general-strike (Hungary 1956): after the Soviet attack of 4 November 1956 the
// workers' councils kept resisting for five weeks: the general strike, the Greater Budapest Central Workers' Council
// (formed 14 November), its talks with János Kádár, the women's silent march of 4 December, the volley at Salgótarján
// on 8 December, the ban of 9 December and the arrest of the council's leaders on 11 December. Look: a winter night in
// charcoal and snow white, the council's blue, the warm yellow of flowers and candles; a calendar strip of the five
// weeks runs along the top as the spine; factories as blocks whose chimneys stop smoking; no faces, no weapons drawn.
// Rubik for headings and labels, EB Garamond for the captions.
//
// Facts:
// - UN Special Committee on the Problem of Hungary, Report (A/3592, 1957; MEK 01274): para 85: Kádár promised
//   factory management by workers' councils and the abolition of compulsory deliveries, but people pressed for the
//   withdrawal of Soviet troops, free elections and the return of Mr. Nagy; production stayed disrupted after
//   4 November as workers refused to resume work. Para 86: on 14 November the factory councils established the
//   Greater Budapest Workers' Council; it was abolished on 9 December; when it declared a 48-hour strike for 11 and
//   12 December, the government abolished all workers' councils above factory level and decreed the death penalty
//   for a large category of offences. Para 87: factories idle for nearly two months; work resumed by mid-December.
//   Paras 646–652: talks with Kádár on 14–17 November ("his word should be enough"); a meeting called for 21 November
//   was forbidden and disbanded, and a 48-hour strike followed; on 25 November Kádár called the Nagy government a
//   camouflage for counter-revolutionaries; on 11 December the council's chairman, Sándor Rácz, and its executive
//   secretary, Sándor Bali, were arrested. Para 621: at Salgótarján Soviet troops and militia fired on a miners'
//   demonstration.
// - Hungarian Wikipedia, "Rácz Sándor (politikus)": born 17 March 1933; elected to the workers' council of the
//   Beloiannisz factory on 29 October; chairman of the Central Workers' Council; invited by Kádár to Parliament on
//   11 December and arrested there; sentenced to life imprisonment on 17 March 1958; freed by the amnesty of 1963.
// - Hungarian Wikipedia, "Asszonyok tüntetése": on 4 December 1956, one month after the Soviet attack, several
//   thousand women and girls walked in silence to the Tomb of the Unknown Soldier on Heroes' Square, with flags,
//   flowers and wreaths, and sang the national anthem.
// - Hungarian Wikipedia, "Salgótarjáni sortűz", and Imre Berki, Rendvédelem-történeti Füzetek 16 (2007): on 8 December
//   about 4,000 people demanded the release of two arrested workers' council leaders; the security forces, police and
//   Soviet soldiers fired; 46 of the dead are known by name; estimates of the total run higher.
//
// Scene plan (65 s). Captions centred at y = 846. The calendar strip (4 Nov to 12 Dec) sits at y ≈ 190.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back: eback } = Kit.ease;

const C = {
  bg1: '#17191d', bg2: '#0a0b0d', ink: '#f2f1ee', soft: 'rgba(242,241,238,0.74)', faint: 'rgba(242,241,238,0.18)',
  blue: '#6fa3d8', blueDim: 'rgba(111,163,216,0.25)', warm: '#f0c36a', warmDim: 'rgba(240,195,106,0.25)', red: '#d9544e', grey: '#5d636c', panel: 'rgba(10,11,13,0.86)',
};
const HEAD = 'Rubik', TXT = 'EB Garamond';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
function fit(s, maxW, size, w = 400, f = TXT) { let z = size; font(w, z, f); while (z > 12 && ctx.measureText(s).width > maxW) { z -= 1; font(w, z, f); } }
function rand(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

// ---------- the calendar strip: 4 November to 12 December 1956 ----------
const DAYS = 39; // 4 Nov … 12 Dec
const day = (m, d) => (m === 11 ? d - 4 : 27 + d - 1 + 0); // index: 4 Nov = 0, 1 Dec = 27
const MARKS = [[day(11, 4), '4 Nov'], [day(11, 14), '14 Nov'], [day(11, 21), '21 Nov'], [day(12, 4), '4 Dec'], [day(12, 9), '9 Dec'], [day(12, 11), '11 Dec']];
if (day(12, 12) !== DAYS - 1) throw new Error('calendar');
const CUE_DAY = [0, 2, 2, 10, 13, 13, 13, 17, day(12, 4), day(12, 8), day(12, 9), day(12, 11), day(12, 12), day(12, 12)];
function calendar(t) {
  const x0 = 60, x1 = W - 140, y = 196, cw = (x1 - x0) / DAYS;
  // where the cursor is: follows the cues
  let cur = 0;
  for (let i = 0; i < CUES.length; i++) if (t >= CUES[i][0] - 0.2) cur = CUE_DAY[i];
  for (let i = 0; i < DAYS; i++) {
    ctx.fillStyle = i <= cur ? C.blueDim : 'rgba(242,241,238,0.06)';
    ctx.fillRect(x0 + i * cw + 1, y - 10, cw - 2, 20);
  }
  ctx.fillStyle = C.warm; ctx.fillRect(x0 + cur * cw, y - 16, cw, 32);
  font(500, 18, HEAD);
  MARKS.forEach(([d, s], i) => { text(s, x0 + d * cw + cw / 2, y + (i % 2 ? 34 : -30), { align: 'center', color: d <= cur ? C.ink : C.soft }); });
}

// ---------- pieces ----------
function factory(x, y, w, h, smoke, col = C.grey) {
  ctx.fillStyle = col; ctx.fillRect(x, y - h, w, h);
  ctx.beginPath(); for (let i = 0; i < 3; i++) { ctx.moveTo(x + (i * w) / 3, y - h); ctx.lineTo(x + ((i + 0.5) * w) / 3, y - h - 22); ctx.lineTo(x + ((i + 1) * w) / 3, y - h); } ctx.fill();
  ctx.fillRect(x + w - 26, y - h - 70, 16, 70);
  if (smoke > 0) A(smoke * 0.5, () => { for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(200,205,212,0.35)'; ctx.beginPath(); ctx.arc(x + w - 18 + i * 10, y - h - 84 - i * 22, 12 + i * 5, 0, TAU); ctx.fill(); } });
}
function person(x, y, col, s = 1) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - 22 * s, 7 * s, 0, TAU); ctx.fill(); k.rrect(x - 7 * s, y - 13 * s, 14 * s, 22 * s, 4 * s); ctx.fill(); }
function stamp(s, x, y, a, col = C.red, rot = -0.18) {
  A(a, () => { const g = eback(clamp(a)); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(g, g); ctx.strokeStyle = col; ctx.lineWidth = 5; font(800, 34, HEAD); const tw = ctx.measureText(s).width; k.rrect(-tw / 2 - 18, -32, tw + 36, 64, 8); ctx.stroke(); text(s, 0, 2, { align: 'center', color: col, spacing: '3px' }); ctx.restore(); });
}

function sceneNov(t) {
  // cue 1: 4 November
  A(span(t, 0, 5.0, 0.5, 0.4), () => {
    font(800, 66, HEAD); text('4 NOVEMBER 1956', CX, 380, { align: 'center', color: C.ink });
    font(400, 28, TXT); text('Soviet troops attack Budapest before dawn', CX, 440, { align: 'center', color: C.soft });
    A(seg(t, 2.0, 2.6), () => { ctx.fillStyle = C.panel; k.rrect(170, 500, W - 340, 90, 14); ctx.fill(); font(600, 26, HEAD); text('a new government: János Kádár', CX, 534, { align: 'center', color: C.warm }); font(400, 22, TXT); text('installed with Soviet support', CX, 568, { align: 'center', color: C.soft }); });
  });
  // cue 2: the factories stand idle
  A(span(t, 4.8, 9.6, 0.4, 0.4), () => {
    const stop = seg(t, 5.6, 7.4);
    for (let i = 0; i < 5; i++) factory(70 + i * 150, 600, 120, 120, 1 - stop);
    stamp('GENERAL STRIKE', CX, 340, seg(t, 7.0, 7.6));
    font(400, 24, TXT); text('production had stopped on 23 October; after 4 November it did not restart', CX, 660, { align: 'center', color: C.soft });
  });
  // cue 3: a factory's workers' council, elected by show of hands
  A(span(t, 9.4, 14.2, 0.4, 0.4), () => {
    factory(90, 600, 230, 200, 0);
    font(600, 24, HEAD); text('a factory', 205, 640, { align: 'center', color: C.soft });
    const hands = seg(t, 10.4, 11.4);
    for (let i = 0; i < 12; i++) {
      const x = 420 + (i % 6) * 62, y = 420 + Math.floor(i / 6) * 110;
      person(x, y, C.blue);
      A(hands, () => { ctx.strokeStyle = C.blue; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 6, y - 8); ctx.lineTo(x + 14, y - 44 * hands); ctx.stroke(); ctx.lineCap = 'butt'; });
    }
    A(seg(t, 11.6, 12.2), () => { font(700, 30, HEAD); text('WORKERS’ COUNCIL', 600, 600, { align: 'center', color: C.blue, spacing: '2px' }); font(400, 22, TXT); text('elected by the workers since late October', 600, 640, { align: 'center', color: C.soft }); });
  });
  // cue 4: the Central Workers' Council
  A(span(t, 14.0, 18.8, 0.4, 0.4), () => {
    const r = rand(5), cx0 = CX, cy0 = 470;
    const g = eio(seg(t, 14.4, 16.6));
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU + 0.1, R = 230 + r() * 40, x = cx0 + Math.cos(a) * R, y = cy0 + Math.sin(a) * R * 0.62;
      ctx.strokeStyle = C.blueDim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, cx0, g * 0.75), lerp(y, cy0, g * 0.75)); ctx.stroke();
      ctx.fillStyle = C.grey; ctx.fillRect(x - 14, y - 12, 28, 24);
    }
    A(seg(t, 15.8, 16.6), () => {
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(cx0, cy0, 125 * eback(seg(t, 15.8, 16.8)), 0, TAU); ctx.fill();
      for (const [s, dy] of [['GREATER BUDAPEST', -30], ['CENTRAL', 0], ['WORKERS’ COUNCIL', 30]]) { fit(s, 210, 22, 700, HEAD); text(s, cx0, cy0 + dy, { align: 'center', color: '#0b1726' }); }
    });
  });
}

// ---------- the talks ----------
function sceneTalks(t) {
  A(span(t, 18.6, 32.6, 0.4, 0.4), () => {
    // the table
    const ty = 470;
    ctx.fillStyle = '#3a3128'; k.rrect(120, ty - 30, W - 240, 60, 10); ctx.fill();
    for (let i = 0; i < 3; i++) { person(200 + i * 70, ty - 40, C.blue, 1.2); person(W - 200 - i * 70, ty - 40, C.warm, 1.2); }
    font(600, 22, HEAD); text('Central Workers’ Council', 270, ty + 60, { align: 'center', color: C.blue }); text('the government', W - 270, ty + 60, { align: 'center', color: C.warm });
    font(400, 21, TXT); text('chairman Sándor Rácz, 23', 270, ty + 92, { align: 'center', color: C.soft }); text('János Kádár', W - 270, ty + 92, { align: 'center', color: C.soft });
    // cue 6: the demands, in a panel above the table
    A(span(t, 23.4, 28.0, 0.3, 0.3), () => {
      const items = ['Soviet troops out', 'free elections', 'Imre Nagy back in office'];
      items.forEach((s, i) => A(seg(t, 23.8 + i * 0.5, 24.4 + i * 0.5), () => {
        ctx.fillStyle = C.blueDim; k.rrect(170, 250 + i * 54, W - 340, 44, 8); ctx.fill();
        font(600, 24, HEAD); text(s, CX, 272 + i * 54, { align: 'center', color: C.ink });
      }));
    });
    // cue 7: "in writing?" – no
    A(span(t, 28.0, 32.6, 0.3, 0.3), () => {
      ctx.save(); ctx.translate(CX, 330); ctx.rotate(-0.04);
      ctx.fillStyle = '#e8e2d2'; ctx.fillRect(-170, -90, 340, 160);
      font(600, 24, HEAD); text('In writing, please', 0, -50, { align: 'center', color: '#24262a' });
      ctx.strokeStyle = '#24262a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-120, 30); ctx.lineTo(120, 30); ctx.stroke();
      font(400, 18, TXT); text('signature', 0, 50, { align: 'center', color: '#5d636c' });
      ctx.restore();
      stamp('NOT SIGNED', CX + 120, 380, seg(t, 29.0, 29.6), C.red, 0.12);
      A(seg(t, 29.8, 30.4), () => { font(400, 26, TXT); text('Kádár: his word should be enough', CX, 640, { align: 'center', color: C.warm }); });
    });
  });
  // cue 8: 21 November: the meeting banned; a 48-hour strike
  A(span(t, 32.6, 37.2, 0.4, 0.4), () => {
    font(800, 40, HEAD); text('21 NOVEMBER', CX, 300, { align: 'center', color: C.ink, spacing: '2px' });
    font(400, 26, TXT); text('the councils’ national meeting', CX, 350, { align: 'center', color: C.soft });
    stamp('BANNED', CX, 450, seg(t, 33.6, 34.2));
    A(seg(t, 34.6, 35.2), () => { font(700, 34, HEAD); text('48-HOUR STRIKE', CX, 570, { align: 'center', color: C.warm, spacing: '2px' }); });
  });
}

// ---------- December ----------
const HU = [[16.11, 46.87], [16.5, 47.4], [16.44, 47.7], [16.9, 47.72], [17.07, 48.03], [17.5, 47.88], [18.1, 47.75], [18.7, 47.88], [18.85, 48.05], [19.5, 48.1], [19.9, 48.17], [20.3, 48.26], [20.8, 48.57], [21.44, 48.58], [21.72, 48.34], [22.15, 48.4], [22.9, 47.95], [22.32, 47.75], [21.95, 47.37], [21.65, 46.95], [21.27, 46.62], [21.18, 46.4], [20.7, 46.17], [20.26, 46.13], [19.57, 46.17], [19.0, 45.98], [18.8, 45.88], [18.3, 45.76], [17.65, 45.95], [17.25, 46.3], [16.88, 46.38], [16.52, 46.5], [16.11, 46.87]];
const HXY = (lon, lat) => [90 + (lon - 16.1) * 101, 330 + (48.6 - lat) * 150];
function sceneDec(t) {
  // cue 9: 4 December: the women's silent march to Heroes' Square
  A(span(t, 37.2, 41.8, 0.4, 0.4), () => {
    font(800, 34, HEAD); text('4 DECEMBER · HEROES’ SQUARE', CX, 280, { align: 'center', color: C.warm, spacing: '2px' });
    // the colonnade, as a curve of columns, and the tomb
    for (let i = 0; i < 14; i++) { const a = Math.PI * (0.1 + 0.8 * (i / 13)), x = CX - Math.cos(a) * 300, y = 470 - Math.sin(a) * 90; ctx.fillStyle = 'rgba(242,241,238,0.3)'; ctx.fillRect(x - 5, y - 70, 10, 70); }
    ctx.fillStyle = 'rgba(242,241,238,0.5)'; ctx.fillRect(CX - 70, 560, 140, 26);
    font(400, 20, TXT); text('Tomb of the Unknown Soldier', CX, 610, { align: 'center', color: C.soft });
    // women walking in, dots in rows; flowers gathering on the tomb
    const walk = seg(t, 37.6, 41.0);
    for (let i = 0; i < 60; i++) { const row = i % 3, col = Math.floor(i / 3); const x = lerp(-40, CX - 90, clamp(walk * 1.6 - col * 0.06)) - col * 2, y = 650 + row * 22; if (x > -20) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); } }
    const fl = Math.floor(seg(t, 38.8, 41.4) * 24);
    for (let i = 0; i < fl; i++) { ctx.fillStyle = i % 3 ? C.warm : C.red; ctx.beginPath(); ctx.arc(CX - 60 + (i % 12) * 11, 552 - Math.floor(i / 12) * 9, 5, 0, TAU); ctx.fill(); }
    A(seg(t, 39.4, 40.0), () => { font(400, 22, TXT); text('several thousand women and girls, in silence', CX, 730, { align: 'center', color: C.ink }); });
  });
  // cue 10: 8 December: Salgótarján
  A(span(t, 41.8, 46.4, 0.4, 0.4), () => {
    font(800, 34, HEAD); text('8 DECEMBER · SALGÓTARJÁN', CX, 290, { align: 'center', color: C.red, spacing: '2px' });
    ctx.fillStyle = 'rgba(242,241,238,0.07)'; ctx.strokeStyle = C.soft; ctx.lineWidth = 2;
    ctx.beginPath(); HU.forEach(([lo, la], i) => (i ? ctx.lineTo(...HXY(lo, la)) : ctx.moveTo(...HXY(lo, la)))); ctx.closePath(); ctx.fill(); ctx.stroke();
    const [bx, by] = HXY(19.04, 47.5), [sx, sy] = HXY(19.80, 48.10);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bx, by, 6, 0, TAU); ctx.fill(); font(500, 20, HEAD); text('Budapest', bx - 12, by + 6, { align: 'right', color: C.soft });
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(sx, sy, 9, 0, TAU); ctx.fill();
    font(600, 22, HEAD); text('Salgótarján', sx + 16, sy - 4, { color: C.red });
    A(seg(t, 42.8, 43.4), () => {
      ctx.fillStyle = C.panel; k.rrect(110, 650, W - 220, 110, 14); ctx.fill();
      fit('about 4,000 demand the release of two arrested council leaders', W - 260, 23); text('about 4,000 demand the release of two arrested council leaders', CX, 682, { align: 'center', color: C.ink });
      font(600, 24, HEAD); text('46 dead known by name; estimates run higher', CX, 724, { align: 'center', color: C.red });
    });
    font(400, 20, TXT); text('Hungary · schematic', 100, 370, { color: C.soft });
  });
  // cue 11: 9 December: the councils banned
  A(span(t, 46.4, 51.0, 0.4, 0.4), () => {
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(CX, 440, 125, 0, TAU); ctx.fill();
    for (const [s, dy] of [['CENTRAL', -16], ['WORKERS’ COUNCIL', 16]]) { fit(s, 210, 22, 700, HEAD); text(s, CX, 440 + dy, { align: 'center', color: '#0b1726' }); }
    stamp('BANNED', CX, 450, seg(t, 47.2, 47.8));
    A(seg(t, 48.2, 48.8), () => { font(400, 24, TXT); text('with every workers’ council above a single factory', CX, 600, { align: 'center', color: C.soft }); text('and the death penalty decreed for more crimes', CX, 636, { align: 'center', color: C.soft }); });
  });
  // cue 12: 11 December: Rácz and Bali arrested at Parliament
  A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
    font(800, 34, HEAD); text('11 DECEMBER · PARLIAMENT', CX, 280, { align: 'center', color: C.ink, spacing: '2px' });
    // Parliament, schematic outline
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.strokeRect(160, 420, 544, 120); ctx.beginPath(); ctx.arc(CX, 420, 70, Math.PI, 0); ctx.stroke();
    for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(180 + i * 38, 440); ctx.lineTo(180 + i * 38, 530); ctx.stroke(); }
    const dim = seg(t, 53.8, 55.0);
    [['Sándor Rácz', 'chairman'], ['Sándor Bali', 'secretary']].forEach(([n, r], i) => A(1 - dim * 0.65, () => {
      const x = CX + (i ? 160 : -160);
      ctx.fillStyle = C.panel; k.rrect(x - 140, 580, 280, 80, 10); ctx.fill(); ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.stroke();
      font(600, 26, HEAD); text(n, x, 606, { align: 'center', color: C.blue }); font(400, 20, TXT); text(r, x, 638, { align: 'center', color: C.soft });
    }));
    A(seg(t, 53.4, 54.0), () => { font(600, 26, HEAD); text('invited to talks, and arrested', CX, 700, { align: 'center', color: C.red }); });
  });
  // cue 13: the last strike; work resumes
  A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
    font(800, 34, HEAD); text('11–12 DECEMBER', CX, 280, { align: 'center', color: C.warm, spacing: '2px' });
    font(400, 24, TXT); text('the last 48-hour strike', CX, 324, { align: 'center', color: C.soft });
    const back = seg(t, 57.2, 59.4);
    for (let i = 0; i < 5; i++) factory(70 + i * 150, 620, 120, 120, back);
    A(seg(t, 57.6, 58.2), () => { font(400, 24, TXT); text('by mid-December the factories were working again', CX, 690, { align: 'center', color: C.ink }); });
  });
  // cue 14: Rácz's sentence and release
  A(seg(t, 60.2, 60.8), () => {
    font(700, 38, HEAD); text('Sándor Rácz', CX, 300, { align: 'center', color: C.blue });
    const x0 = 150, x1 = W - 150, y = 470, X = (yr) => lerp(x0, x1, (yr - 1956) / 8);
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    font(500, 22, HEAD);
    for (let yr = 1956; yr <= 1964; yr += 2) { text(String(yr), X(yr), y + 34, { align: 'center', color: C.soft }); ctx.fillStyle = C.soft; ctx.fillRect(X(yr) - 1, y - 8, 2, 16); }
    const g = eio(seg(t, 61.0, 63.0));
    ctx.fillStyle = C.red; ctx.fillRect(X(1958.2), y - 10, (X(1963.3) - X(1958.2)) * g, 20);
    A(seg(t, 61.0, 61.6), () => { font(600, 24, HEAD); text('1958: life imprisonment', X(1958.2), y - 44, { align: 'left', color: C.red }); });
    A(seg(t, 62.8, 63.4), () => { font(600, 24, HEAD); text('1963: amnesty, free', X(1963.3), y + 80, { align: 'right', color: C.warm }); });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // a light snowfall, fixed
  const r = rand(21); g.fillStyle = 'rgba(242,241,238,0.08)';
  for (let i = 0; i < 160; i++) { g.beginPath(); g.arc(r() * W, r() * 780, 1 + r() * 2, 0, TAU); g.fill(); }
}

const CUES = [
  [0.4, 4.8, 'Hungary, 4 November 1956: Soviet troops attack; *János Kádár* forms a new government.'],
  [5.0, 9.4, 'The fighting dies down within days, but the factories stay idle: a ~general strike~.'],
  [9.6, 14.0, 'Since late October, the workers of each factory had elected *workers’ councils*.'],
  [14.2, 18.6, '14 November: Budapest’s factory councils form a *Central Workers’ Council*.'],
  [18.8, 23.2, 'Its chairman, *Sándor Rácz*, 23, of the Beloiannisz factory, negotiates with Kádár.'],
  [23.4, 27.8, 'They demand Soviet troops out, free elections, and *Imre Nagy* back in office.'],
  [28.0, 32.4, 'Kádár promises much, but will not sign: his word, he says, ~should be enough~.'],
  [32.6, 37.0, '21 November: the councils’ national meeting is banned; a *48-hour strike* follows.'],
  [37.2, 41.6, '4 December: several thousand women walk in *silence* to Heroes’ Square, with flowers.'],
  [41.8, 46.2, '8 December, Salgótarján: troops fire on protesters; ~46~ of the dead are known by name.'],
  [46.4, 50.8, '9 December: the Central Council and every regional council are ~banned~.'],
  [51.0, 55.4, '11 December: Rácz and the council’s secretary, *Sándor Bali*, are arrested at Parliament.'],
  [55.6, 60.0, 'The strike of 11–12 December is the last; by mid-December work resumes.'],
  [60.2, 64.6, 'Rácz was sentenced to *life* in 1958 and freed by the amnesty of 1963.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    font(800, 30, HEAD); text('THE WORKERS’ COUNCILS', 60, 96, { spacing: '2px' });
    font(400, 22, TXT); text('Hungary, November–December 1956', 60, 132, { color: C.warm });
    calendar(t);
    sceneNov(t);
    sceneTalks(t);
    sceneDec(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.warm, '~': C.red } });
  },
});
