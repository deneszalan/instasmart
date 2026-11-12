// Explainer for economics-kadar-era-and-the-silence (Hungary 1956): what came after 1956. János Kádár's regime moved
// from reprisals to a bargain ("whoever is not against us is with us", 1961): an amnesty in 1963 in return for the UN
// dropping "the Hungarian question", the New Economic Mechanism of 1968 and rising living standards ("goulash
// communism"), and in exchange silence: until 1989 school books called 1956 a "counter-revolution". Look: an archive
// in faded paper and olive, a school book whose one word keeps changing, the official statistics as a line chart;
// no faces. Fraunces for headings, IBM Plex Mono for labels, Fraunces for the captions too.
//
// Facts:
// - Hungarian Statistical Office (KSH), Statistical Yearbook of Hungary 2023, table 1.2 (long time series),
//   1960 = 100: real wage index per wage-earner 1965 109, 1970 129, 1975 152, 1980 158, 1985 151, 1990 142; per
//   capita real income index 118, 159, 199, 216, 236, 245.
// - Dorottya Szénási, Betekintő 2022/4 (Historical Archives of the Hungarian State Security): "whoever is not against
//   us is with us" meant a bargain between the regime and society, kept mainly by a slow rise in living standards;
//   in 1968 a reform brought elements of the market economy into the planned economy; the regime was labelled
//   "goulash communism", "the happiest barracks", "soft dictatorship". Hungarian Wikipedia, "Kádár-korszak": the
//   slogan was voiced at the Patriotic People's Front congress of 8 December (1961); about 3,000 political prisoners
//   freed; the 1968 reform scaled back from 1972.
// - Békés Csaba and Kecskés D. Gusztáv (eds.), A forradalom és a magyar kérdés az ENSZ-ben, 1956–1963 (MEK 12960),
//   chronology: 20 October 1962, a secret Hungarian–US understanding: a general amnesty in return for taking the
//   Hungarian question off the UN General Assembly's agenda; 20 December 1962 the Assembly does so; 21 March 1963
//   Kádár announces the general amnesty, which excluded several hundred political prisoners.
// - Ignác Romsics, interview, Infostart, 23 October 2025: in the 1960s 1956 was called a counter-revolution, by the
//   1980s "the regrettable events of October"; from 28 January 1989 (the Pozsgay interview) a "popular uprising";
//   now "revolution and freedom fight". History Teachers' Association (tte.hu): before 1989 textbooks classed 1956
//   as a counter-revolution.
// - Making the History of 1989 (World History Commons): on 27 January 1989 the party's historical subcommittee called
//   1956 a "people's uprising"; Imre Pozsgay, Politburo member and minister of state, said so the next day on the radio
//   programme "168 hours". English Wikipedia, "Imre Nagy": hanged on 16 June 1958; reburied on 16 June 1989 before an
//   estimated 200,000+ people. Encyclopedia.com: Kádár led Hungary until 1988.
//
// Scene plan (65 s). Captions centred at y = 846.
//  A  0.4– 9.4  Kádár's long rule; the reprisals.
//  B  9.6–27.8  the bargain: 1961, the UN deal, the amnesty of 1963.
//  C 28.0–41.6  1968 and goulash communism; the KSH chart.
//  D 41.8–55.4  the other side: the word in the school book; the 1980s.
//  E 55.6–64.6  1989: "popular uprising"; the reburial.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back: eback } = Kit.ease;

const C = {
  bg1: '#1d201a', bg2: '#0d0f0c', ink: '#efe9d8', soft: 'rgba(239,233,216,0.74)', faint: 'rgba(239,233,216,0.2)',
  paper: '#e8e0c8', inkDark: '#2a2a22', olive: '#9db37f', oliveDim: 'rgba(157,179,127,0.22)', paprika: '#e0763c', slate: '#94a3b4', red: '#d0504a', panel: 'rgba(13,15,12,0.86)',
};
const HEAD = 'Fraunces', MONO = 'IBM Plex Mono';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
function fit(s, maxW, size, w = 400, f = MONO) { let z = size; font(w, z, f); while (z > 12 && ctx.measureText(s).width > maxW) { z -= 1; font(w, z, f); } }

// KSH 2023, table 1.2 (1960 = 100)
const YEARS = [1960, 1965, 1970, 1975, 1980, 1985, 1990];
const WAGE = [100, 109, 129, 152, 158, 151, 142];
const INCOME = [100, 118, 159, 199, 216, 236, 245];
if (WAGE.indexOf(Math.max(...WAGE)) !== 4) throw new Error('peak');

// ---------- A ----------
function sceneRule(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    font(700, 44, HEAD); text('Hungary after 1956', 60, 110);
    font(400, 24, MONO); text('the Kádár era, 1956–1988', 60, 152, { color: C.olive });
    // a long bar: 1956 to 1988
    const x0 = 90, x1 = W - 90, y = 360, X = (yr) => lerp(x0, x1, (yr - 1956) / 33);
    const g = eio(seg(t, 0.8, 3.2));
    ctx.fillStyle = C.oliveDim; ctx.fillRect(x0, y - 22, (x1 - x0) * g, 44);
    font(500, 20, MONO);
    for (const yr of [1956, 1961, 1968, 1975, 1980, 1988]) A(seg(t, 1.0 + (yr - 1956) / 16, 1.4 + (yr - 1956) / 16), () => { ctx.fillStyle = C.soft; ctx.fillRect(X(yr) - 1, y + 22, 2, 12); text(String(yr), X(yr), y + 50, { align: 'center', color: C.soft }); });
    A(seg(t, 2.4, 3.0), () => { font(600, 30, HEAD); text('János Kádár', CX, y - 60, { align: 'center', color: C.olive }); });
    // cue 2: the reprisals
    A(seg(t, 5.2, 5.8), () => {
      ctx.fillStyle = C.panel; k.rrect(110, 470, W - 220, 230, 14); ctx.fill();
      font(600, 30, HEAD); text('First, the reprisals', CX, 510, { align: 'center', color: C.red });
      font(400, 23, MONO);
      text('arrests, trials, executions', CX, 560, { align: 'center', color: C.ink });
      text('16 June 1958: Imre Nagy is hanged', CX, 600, { align: 'center', color: C.ink });
      text('buried in secret: plot 301', CX, 640, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B: the bargain ----------
function scale(tilt, a) {
  A(a, () => {
    const cx0 = CX, cy0 = 330;
    ctx.strokeStyle = C.paper; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.lineTo(cx0, cy0 + 260); ctx.stroke();
    ctx.fillStyle = C.paper; ctx.fillRect(cx0 - 60, cy0 + 260, 120, 12);
    const L = 200, dx = Math.cos(tilt) * L, dy = Math.sin(tilt) * L;
    ctx.beginPath(); ctx.moveTo(cx0 - dx, cy0 - dy); ctx.lineTo(cx0 + dx, cy0 + dy); ctx.stroke();
    for (const [sx, sy] of [[cx0 - dx, cy0 - dy], [cx0 + dx, cy0 + dy]]) {
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 60, sy + 90); ctx.moveTo(sx, sy); ctx.lineTo(sx + 60, sy + 90); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(sx, sy + 90, 70, 14, 0, 0, Math.PI); ctx.stroke();
    }
    return [[cx0 - dx, cy0 - dy + 70], [cx0 + dx, cy0 + dy + 70]];
  });
}
function sceneBargain(t) {
  A(span(t, 9.4, 28.0, 0.4, 0.4), () => {
    // cue 3: the slogan
    A(span(t, 9.4, 14.2, 0.4, 0.4), () => {
      font(600, 34, HEAD); text('1961', CX, 260, { align: 'center', color: C.olive });
      const g = eout(seg(t, 10.0, 11.0));
      ctx.save(); ctx.translate(CX, 420); ctx.scale(lerp(0.9, 1, g), lerp(0.9, 1, g));
      A(g, () => {
        ctx.fillStyle = C.paper; ctx.fillRect(-340, -90, 680, 180);
        fit('“Whoever is not against us', 600, 40, 600, HEAD); text('“Whoever is not against us', 0, -26, { align: 'center', color: C.inkDark });
        fit('is with us.”', 600, 40, 600, HEAD); text('is with us.”', 0, 28, { align: 'center', color: C.inkDark });
      });
      ctx.restore();
      A(seg(t, 11.4, 12.0), () => { font(400, 22, MONO); text('Kádár’s offer: a quiet life, if you keep out of politics', CX, 600, { align: 'center', color: C.soft }); });
    });
    // cues 4–5: the UN deal and the amnesty, as two scale pans
    A(span(t, 14.2, 23.4, 0.4, 0.4), () => {
      const tilt = lerp(0.18, 0, eio(seg(t, 18.6, 20.4)));
      scale(tilt, 1);
      const L = 200, dx = Math.cos(tilt) * L, dy = Math.sin(tilt) * L;
      const left = [CX - dx, 330 - dy + 70], right = [CX + dx, 330 + dy + 70];
      const lab = (s, x, y) => { fit(s, 196, 22, 600); text(s, x, y, { align: 'center', color: C.inkDark }); };
      ctx.fillStyle = C.slate; k.rrect(left[0] - 105, left[1] - 70, 210, 64, 8); ctx.fill();
      lab('UN: the “Hungarian', left[0], left[1] - 50); lab('question” dropped', left[0], left[1] - 24);
      A(seg(t, 18.8, 19.4), () => {
        ctx.fillStyle = C.olive; k.rrect(right[0] - 105, right[1] - 70, 210, 64, 8); ctx.fill();
        lab('a general', right[0], right[1] - 50); lab('amnesty', right[0], right[1] - 24);
      });
      font(400, 22, MONO);
      A(span(t, 14.4, 18.8, 0.4, 0.3), () => { fit('20 Dec 1962: off the UN agenda, after a secret US–Hungarian deal', W - 120, 22); text('20 Dec 1962: off the UN agenda, after a secret US–Hungarian deal', CX, 690, { align: 'center', color: C.soft }); });
      A(seg(t, 19.0, 19.6), () => text('21 March 1963: the amnesty is announced', CX, 690, { align: 'center', color: C.olive }));
    });
    // cue 6 (23.4–27.8): who walked free, who stayed
    A(span(t, 23.4, 28.0, 0.4, 0.4), () => {
      font(600, 34, HEAD); text('March 1963', CX, 250, { align: 'center', color: C.olive });
      const n = 50, out = Math.floor(seg(t, 24.0, 26.4) * 46);
      for (let i = 0; i < n; i++) {
        const c = i % 10, r = Math.floor(i / 10), x = 170 + c * 58, y = 330 + r * 62;
        const free = i < out;
        ctx.fillStyle = free ? C.olive : C.slate;
        ctx.globalAlpha = free ? 1 : 0.8;
        ctx.beginPath(); ctx.arc(x, y - 12, 9, 0, TAU); ctx.fill(); ctx.fillRect(x - 9, y, 18, 24);
        ctx.globalAlpha = 1;
        if (!free) { ctx.strokeStyle = C.paper; ctx.lineWidth = 2; for (let b = -1; b <= 1; b++) { ctx.beginPath(); ctx.moveTo(x + b * 9, y - 26); ctx.lineTo(x + b * 9, y + 26); ctx.stroke(); } }
      }
      A(seg(t, 26.0, 26.6), () => { font(400, 22, MONO); text('most of those jailed for 1956 go free', CX, 670, { align: 'center', color: C.olive }); text('several hundred stay in prison', CX, 706, { align: 'center', color: C.slate }); });
      A(seg(t, 26.0, 26.6), () => { font(400, 18, MONO); text('schematic', 760, 300, { align: 'right', color: C.soft }); });
    });
  });
}

// ---------- C: 1968 and the chart ----------
function chart(t, x0, y0, w, h, upto) {
  const X = (i) => x0 + (i / (YEARS.length - 1)) * w, Y = (v) => y0 + h - ((v - 80) / (260 - 80)) * h;
  ctx.strokeStyle = C.faint; ctx.lineWidth = 1;
  for (const v of [100, 150, 200, 250]) { ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x0 + w, Y(v)); ctx.stroke(); font(400, 18, MONO); text(String(v), x0 - 10, Y(v), { align: 'right', color: C.soft }); }
  YEARS.forEach((yr, i) => { font(400, 18, MONO); text(String(yr), X(i), y0 + h + 24, { align: 'center', color: C.soft }); });
  const draw = (vals, col, n) => {
    ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= Math.floor(n) && i < vals.length; i++) (i ? ctx.lineTo(X(i), Y(vals[i])) : ctx.moveTo(X(i), Y(vals[i])));
    const f = n - Math.floor(n), i0 = Math.floor(n);
    if (f > 0 && i0 + 1 < vals.length) ctx.lineTo(lerp(X(i0), X(i0 + 1), f), lerp(Y(vals[i0]), Y(vals[i0 + 1]), f));
    ctx.stroke();
    for (let i = 0; i <= Math.floor(n) && i < vals.length; i++) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(i), Y(vals[i]), 6, 0, TAU); ctx.fill(); }
  };
  return { X, Y, draw };
}
function sceneGoulash(t) {
  A(span(t, 27.8, 55.6, 0.4, 0.4), () => {
    // cue 7: 1968
    A(span(t, 27.8, 32.6, 0.4, 0.4), () => {
      font(600, 40, HEAD); text('1968', CX, 260, { align: 'center', color: C.paprika });
      font(600, 30, HEAD); text('the New Economic Mechanism', CX, 320, { align: 'center', color: C.ink });
      const items = ['less central planning', 'firms decide more', 'some market rules'];
      items.forEach((s, i) => A(seg(t, 29.0 + i * 0.5, 29.6 + i * 0.5), () => { ctx.fillStyle = C.panel; k.rrect(200, 390 + i * 70, W - 400, 54, 10); ctx.fill(); font(500, 24, MONO); text(s, CX, 417 + i * 70, { align: 'center', color: C.paprika }); }));
    });
    // cue 8: goulash communism (a pot, steaming)
    A(span(t, 32.6, 37.2, 0.4, 0.4), () => {
      const px = CX, py = 470;
      ctx.fillStyle = C.paprika; ctx.beginPath(); ctx.ellipse(px, py, 170, 30, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(px - 170, py); ctx.quadraticCurveTo(px - 160, py + 170, px, py + 170); ctx.quadraticCurveTo(px + 160, py + 170, px + 170, py); ctx.fill();
      ctx.strokeStyle = '#2b1a10'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px - 200, py - 10); ctx.lineTo(px + 200, py - 10); ctx.stroke();
      for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; A(1 - ph, () => { ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); const x = px - 60 + i * 60; ctx.moveTo(x, py - 30); ctx.bezierCurveTo(x - 20, py - 70 - ph * 40, x + 20, py - 100 - ph * 40, x, py - 140 - ph * 50); ctx.stroke(); }); }
      font(600, 34, HEAD); text('“goulash communism”', CX, 260, { align: 'center', color: C.paprika });
      font(400, 22, MONO); text('also: “the happiest barracks” of the Soviet bloc', CX, 700, { align: 'center', color: C.soft });
    });
    // cues 9–10: the KSH chart, real wages then real income
    A(span(t, 37.2, 46.4, 0.4, 0.4), () => {
      font(600, 30, HEAD); text('By the official figures', 90, 240, { color: C.ink });
      font(400, 20, MONO); text('Hungarian Statistical Office, 1960 = 100', 90, 274, { color: C.soft });
      const ch = chart(t, 140, 320, W - 240, 360);
      ch.draw(WAGE, C.olive, 3 * eio(seg(t, 37.6, 39.6)));
      A(seg(t, 39.4, 40.0), () => { font(600, 22, MONO); text('real wages: 152 by 1975', ch.X(3) + 14, ch.Y(152) + 26, { color: C.olive }); });
      A(seg(t, 41.8, 42.0), () => {
        ch.draw(INCOME, C.paprika, 3 * eio(seg(t, 42.0, 43.6)));
        A(seg(t, 43.4, 44.0), () => { font(600, 22, MONO); text('real income per head: 199', ch.X(3) - 14, ch.Y(199) - 24, { align: 'right', color: C.paprika }); });
      });
    });
    // cue 11 (46.4–50.8): the other pan: silence
    A(span(t, 46.4, 51.0, 0.4, 0.4), () => {
      scale(0, 1);
      const left = [CX - 200, 400], right = [CX + 200, 400];
      ctx.fillStyle = C.paprika; k.rrect(left[0] - 105, left[1] - 70, 210, 64, 8); ctx.fill();
      fit('a better life', 196, 22, 600); text('a better life', left[0], left[1] - 38, { align: 'center', color: C.inkDark });
      A(seg(t, 47.2, 47.8), () => { ctx.fillStyle = C.slate; k.rrect(right[0] - 105, right[1] - 70, 210, 64, 8); ctx.fill(); fit('silence on 1956', 196, 22, 600); text('silence on 1956', right[0], right[1] - 38, { align: 'center', color: C.inkDark }); });
      font(600, 30, HEAD); text('The bargain', CX, 250, { align: 'center', color: C.ink });
    });
    // cues 12 (51.0–55.4): the school book's word
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      book(CX, 450, '“counter-revolution”', C.red);
      A(seg(t, 51.4, 52.0), () => { font(400, 22, MONO); text('a history book in a Hungarian school, 1960s–1980s', CX, 680, { align: 'center', color: C.soft }); });
    });
  });
}
/** An open book with one word on its right-hand page. */
function book(x, y, word, col, word2 = null) {
  ctx.fillStyle = C.paper;
  ctx.beginPath(); ctx.moveTo(x, y - 150); ctx.quadraticCurveTo(x - 160, y - 180, x - 310, y - 150); ctx.lineTo(x - 310, y + 150); ctx.quadraticCurveTo(x - 160, y + 120, x, y + 150); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y - 150); ctx.quadraticCurveTo(x + 160, y - 180, x + 310, y - 150); ctx.lineTo(x + 310, y + 150); ctx.quadraticCurveTo(x + 160, y + 120, x, y + 150); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#b8ae92'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 150); ctx.lineTo(x, y + 150); ctx.stroke();
  ctx.fillStyle = 'rgba(42,42,34,0.25)'; for (let i = 0; i < 7; i++) ctx.fillRect(x - 280, y - 110 + i * 30, i % 3 === 2 ? 150 : 240, 6);
  font(600, 24, MONO); text('1956', x + 155, y - 90, { align: 'center', color: C.inkDark });
  if (word2) { fit(word, 270, 30, 700, HEAD); text(word, x + 155, y - 26, { align: 'center', color: col }); fit(word2, 270, 30, 700, HEAD); text(word2, x + 155, y + 12, { align: 'center', color: col }); }
  else { fit(word, 270, 30, 700, HEAD); text(word, x + 155, y - 10, { align: 'center', color: col }); }
}

// ---------- D/E: the 1980s and 1989 ----------
function sceneEnd(t) {
  // cue 12 wording is in sceneGoulash; cue 13 (55.6–60.0): the 1980s: the word softens, wages fall
  A(span(t, 55.4, 60.2, 0.4, 0.4), () => {
    book(CX, 400, '“the regrettable', C.slate, 'events of October”');
    A(seg(t, 56.4, 57.0), () => {
      font(400, 22, MONO); text('1980s: the school book’s word softens', CX, 600, { align: 'center', color: C.soft });
      text('and real wages fall: 158 (1980) → 151 → 142 (1990)', CX, 640, { align: 'center', color: C.olive });
    });
  });
  // cue 14 (60.2–64.6): 1989
  A(seg(t, 60.2, 60.8), () => {
    book(CX, 380, '“popular uprising”', C.olive);
    A(seg(t, 60.6, 61.2), () => { font(400, 22, MONO); text('28 January 1989: Imre Pozsgay, on the radio', CX, 570, { align: 'center', color: C.soft }); });
    A(seg(t, 62.0, 62.6), () => {
      ctx.fillStyle = C.panel; k.rrect(110, 610, W - 220, 110, 14); ctx.fill();
      font(600, 28, HEAD); text('16 June 1989', CX, 642, { align: 'center', color: C.paprika });
      font(400, 22, MONO); text('Imre Nagy reburied before about 200,000 people', CX, 684, { align: 'center', color: C.ink });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(239,233,216,0.04)'; g.lineWidth = 1;
  for (let y = 40; y < 790; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'After 1956, *János Kádár*, put in power by the Soviet army, rules Hungary until 1988.'],
  [5.0, 9.4, 'First come reprisals: thousands are jailed, and *Imre Nagy* is hanged on 16 June 1958.'],
  [9.6, 14.0, 'In 1961 Kádár offers a deal: *“whoever is not against us is with us”*.'],
  [14.2, 18.6, 'In December 1962 the UN drops “the Hungarian question”, after a secret US deal.'],
  [18.8, 23.2, 'The other half of the deal: in March 1963 Kádár announces a *general amnesty*.'],
  [23.4, 27.8, 'Most of those jailed for 1956 go free; ~several hundred~ stay in prison.'],
  [28.0, 32.4, 'In 1968 the *New Economic Mechanism* brings some market rules into the planned economy.'],
  [32.6, 37.0, 'Shops fill and life gets easier: people call it *“goulash communism”*.'],
  [37.2, 41.6, 'By official figures, real wages rose by about *half* between 1960 and 1975.'],
  [41.8, 46.2, 'Real income per head almost *doubled*: the regime’s side of the bargain.'],
  [46.4, 50.8, 'The other side: no open talk of 1956, in public or in school.'],
  [51.0, 55.4, 'In school history books, 1956 was a ~“counter-revolution”~.'],
  [55.6, 60.0, 'By the 1980s it had softened to *“the regrettable events”*, and real wages were falling.'],
  [60.2, 64.6, '1989: a minister calls it a *“popular uprising”*; on 16 June Imre Nagy is reburied.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, MONO],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneRule(t);
    sceneBargain(t);
    sceneGoulash(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 37, weight: 400, family: HEAD, ink: C.ink, marks: { '*': C.paprika, '~': C.red } });
  },
});
