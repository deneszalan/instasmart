// Explainer for literature-ghez-six-mois-sous-la-botte (Tunisia 1943): Paul Ghez, a Jewish lawyer in Tunis, was put at
// the head of the committee that had to recruit Jewish men for the Germans' forced labour during the occupation of
// Tunis (November 1942 to May 1943). His diary, "Six mois sous la botte" (Six months under the boot), was printed in
// Tunis in 1943. Look: a calendar of the six months with two lanes, the war above and the diary below, and a
// notebook page where dated entries are typed in; men walking to a camp as plain grey figures. IBM Plex Mono for
// dates and typed entries, Crimson Pro for titles and captions, on paper with a red-brown stamp colour.
//
// Facts:
// - Posen Library of Jewish Culture and Civilization, "Six Months under the Boot" (Paul Ghez, 1898-1971): born in
//   Sousse; served on the Jewish council and headed the veterans' association; during the Nazi occupation of Tunisia in
//   1942-1943 "he was head of the Committee for the Recruitment of Jewish Manpower", set up by the Jewish leadership
//   to meet Gestapo demands; an excerpt tells of a woman demanding at the president's office the return of her son,
//   working in Djelloula, in the Italian sector.
// - Documentation Center of North African Jews during WWII (Yad Ben-Zvi, Jerusalem), entries on Paul Ghez, "Six mois
//   sous la botte" (Tunis, 1943): 15 and 20 November 1942, confiscation of Jewish possessions (pp. 13-14); 27 November,
//   he leaves his flat on German orders (p. 14); 7 December, the order and the lists of Jewish forced workers (p. 16);
//   Walter Rauff's visit to the synagogue in Tunis (pp. 19-25); 12 December, a forced-labour march from Tunis to the
//   camp at Cheylus (pp. 30-31); 3,585 Jewish men recruited by 14 December (pp. 35-37); 17 December, men sent to work
//   at El Aouina airfield; 6 February 1943, efforts to reduce the numbers recruited (pp. 86-87); 24 February, 30 French
//   citizens arrested, three of them Jewish leaders (p. 104); 15 April, he and others persuade the Germans to evacuate
//   Jewish forced workers because of the fighting (pp. 143-144); 4 May, 30 workers escape from the camp at Bizerte
//   (pp. 154-155); 7 May, he arranges the return of the workers (pp. 156-160); 8 May, back home, the Germans have taken
//   the furniture (pp. 160-161).
// - Montreal Holocaust Museum, "The Holocaust in Tunisia": "approximately 5,000 Jewish men were sent to forced labor
//   and internment camps in Tunisia"; the Comité de recrutement de la main-d'oeuvre juive supplied the workers; the
//   Einsatzkommando was led by the SS commander Walter Rauff.
// - Times of Israel / The Conversation (S. A. Stein, 2022): "under the Nazi boot", as the Tunisian Jewish lawyer Paul
//   Ghez wrote in his diary during the occupation. Wikipedia, "Tunisian campaign": 40 German aircraft at Tunis by
//   9 November 1942; the Battle of Kasserine Pass from 19 February 1943; Tunis taken on 7 May 1943.
// The notebook, the calendar and the figures are drawn for this clip; no page or cover of the book is copied.
//
// Scene plan (65 s). Important things stay above y = 790; captions are centred at y = 846.
//  A  0.0– 9.4  Tunis, November 1942; Paul Ghez and his diary.
//  B  9.6–27.8  December: the demand, the committee, the lists, 3,585 men; the march to Cheylus.
//  C 28.0–41.6  Families at the office; bargaining; about 5,000 men in camps; April, the front comes close.
//  D 41.8–55.4  7 May 1943: the Allies in Tunis, the workers come home; 8 May, an empty flat; the book.
//  E 55.6–64.8  What kind of book it is.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  paper: '#efe6d2', paper2: '#e4d8bf', ink: '#2b2622', soft: 'rgba(43,38,34,0.7)', faint: 'rgba(43,38,34,0.22)',
  stamp: '#9b2c2c', blue: '#3d5a80', grey: '#7d776d', desk: '#3a2c22', light: '#f6efe0',
};
const MONO = 'IBM Plex Mono', SERIF = 'Crimson Pro';

let k, ctx;
const font = (w, s, f = SERIF) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the calendar: days from 9 November 1942 ----------
const DAY0 = Date.UTC(1942, 10, 9);
const day = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - DAY0) / 86400000);
const LAST = day(1943, 5, 13);
const WAR = [
  [day(1942, 11, 9), 'German aircraft land at Tunis'],
  [day(1943, 2, 19), 'Battle of Kasserine Pass'],
  [day(1943, 5, 7), 'The Allies enter Tunis'],
];
const DIARY = [
  [day(1942, 11, 15), '15 Nov', 'Jewish property confiscated'],
  [day(1942, 11, 27), '27 Nov', 'ordered out of his flat'],
  [day(1942, 12, 7), '7 Dec', 'the order, the lists'],
  [day(1942, 12, 12), '12 Dec', 'the march to Cheylus'],
  [day(1942, 12, 14), '14 Dec', '3,585 men recruited'],
  [day(1943, 2, 6), '6 Feb', 'trying to lower the numbers'],
  [day(1943, 4, 15), '15 Apr', 'workers moved from the front'],
  [day(1943, 5, 7), '7 May', 'the workers come home'],
  [day(1943, 5, 8), '8 May', 'his flat emptied'],
];
const RECRUITED = 3585, IN_CAMPS = 5000, BORN = 1898;
if (LAST !== 185 || 1942 - BORN !== 44 || WAR[2][0] !== DIARY[7][0]) throw new Error('dates');

const CAL_L = 200, CAL_R = 806;
function calendar(t, upto, { y = 186, show = 1 } = {}) {
  A(show, () => {
    const L = CAL_L, R = CAL_R, X = (d) => L + (R - L) * (d / LAST);
    ctx.fillStyle = 'rgba(43,38,34,0.06)'; ctx.fillRect(40, y - 64, W - 80, 170);
    // months
    const months = [['NOV', 1942, 11], ['DEC', 1942, 12], ['JAN', 1943, 1], ['FEB', 1943, 2], ['MAR', 1943, 3], ['APR', 1943, 4], ['MAY', 1943, 5]];
    font(500, 20, MONO);
    for (const [name, yy, mm] of months) {
      const d0 = Math.max(0, day(yy, mm, 1));
      ctx.fillStyle = C.faint; ctx.fillRect(X(d0), y - 46, 2, 136);
      text(name, X(d0) + 6, y - 34, { base: 'middle', color: C.soft });
    }
    // lanes
    font(600, 18, MONO);
    text('THE WAR', L - 20, y + 15, { align: 'right', base: 'middle', color: C.blue });
    text('THE DIARY', L - 20, y + 81, { align: 'right', base: 'middle', color: C.stamp });
    ctx.fillStyle = C.faint; ctx.fillRect(L, y + 14, R - L, 2); ctx.fillRect(L, y + 80, R - L, 2);
    for (const [d] of WAR) if (d <= upto) { ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(X(d), y + 15, 8, 0, TAU); ctx.fill(); }
    for (const [d] of DIARY) if (d <= upto) { ctx.fillStyle = C.stamp; ctx.fillRect(X(d) - 5, y + 74, 10, 14); }
    // the day marker
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(upto), y - 20); ctx.lineTo(X(upto), y + 96); ctx.stroke();
  });
}
/** The calendar day shown at scene time t. */
function today(t) {
  const keys = [[0, 0], [9.4, day(1942, 11, 27)], [10.0, day(1942, 12, 7)], [23.4, day(1942, 12, 12)], [24.0, day(1942, 12, 14)],
    [32.6, day(1943, 2, 6)], [37.2, day(1943, 4, 15)], [41.8, day(1943, 5, 7)], [46.4, day(1943, 5, 8)], [65, day(1943, 5, 8)]];
  for (let i = 1; i < keys.length; i++) {
    const [ta, da] = keys[i - 1], [tb, db] = keys[i];
    if (t <= tb) return Math.round(lerp(da, db, eio(seg(t, ta, Math.min(tb, ta + 1.4)))));
  }
  return LAST;
}

/** The open notebook with dated, typed lines. */
function notebook(t, lines, { x = 90, y = 330, w = W - 180, h = 440 } = {}) {
  ctx.fillStyle = C.light; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(43,38,34,0.12)'; ctx.fillRect(x + w / 2 - 2, y, 4, h);
  ctx.strokeStyle = 'rgba(61,90,128,0.18)'; ctx.lineWidth = 1;
  for (let ly = y + 50; ly < y + h - 10; ly += 40) { ctx.beginPath(); ctx.moveTo(x + 20, ly); ctx.lineTo(x + w - 20, ly); ctx.stroke(); }
  lines.forEach(([t0, date, s], i) => {
    const g = seg(t, t0, t0 + 1.2);
    if (g <= 0) return;
    const yy = y + 70 + i * 80;
    font(600, 24, MONO); text(date, x + 30, yy, { base: 'middle', color: C.stamp });
    const n = Math.round(s.length * g);
    font(400, 26, MONO);
    // typed out letter by letter in English; in another language the whole line fades in, as drawn text is swapped whole
    A(g, () => text(Kit.tr(s) === s ? s.slice(0, n) : s, x + 30, yy + 34, { base: 'middle', color: C.ink }));
  });
}
/** A plain standing or walking figure, no face. */
function man(x, y, s, phase, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 58 * s, 10 * s, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 11 * s, y - 46 * s); ctx.lineTo(x + 11 * s, y - 46 * s); ctx.lineTo(x + 9 * s, y - 16 * s); ctx.lineTo(x - 9 * s, y - 16 * s); ctx.closePath(); ctx.fill();
  const sw = Math.sin(phase) * 10 * s;
  ctx.strokeStyle = col; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 16 * s); ctx.lineTo(x - 4 * s + sw, y); ctx.moveTo(x + 4 * s, y - 16 * s); ctx.lineTo(x + 4 * s - sw, y); ctx.stroke();
  ctx.lineCap = 'butt';
}

// ---------- A ----------
function sceneIntro(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    calendar(t, today(t), { show: seg(t, 0.4, 1.2) });
    A(seg(t, 1.2, 2.0), () => {
      font(600, 64, SERIF); text('Tunis', CX, 360, { align: 'center', base: 'middle' });
      font(500, 30, MONO); text('NOVEMBER 1942', CX, 420, { align: 'center', base: 'middle', color: C.stamp, spacing: '3px' });
    });
    A(seg(t, 5.2, 6.0), () => {
      ctx.fillStyle = C.light; k.rrect(170, 490, 524, 240, 12); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.stroke();
      font(600, 40, SERIF); text('Paul Ghez', CX, 548, { align: 'center', base: 'middle' });
      font(400, 26, SERIF); text('lawyer, born in Sousse in 1898', CX, 600, { align: 'center', base: 'middle', color: C.soft });
      text('member of the Jewish community council', CX, 640, { align: 'center', base: 'middle', color: C.soft });
      text('head of the veterans’ association', CX, 680, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- B: December ----------
function sceneDecember(t) {
  A(span(t, 9.4, 28.0, 0.4, 0.4), () => {
    calendar(t, today(t));
    // the demand and the committee
    A(seg(t, 9.8, 10.4) * (1 - seg(t, 18.4, 18.8)), () => {
      font(600, 34, SERIF); text('December 1942', CX, 330, { align: 'center', base: 'middle', color: C.stamp });
      font(500, 30, SERIF); text('The SS demand Jewish men for forced labour', CX, 390, { align: 'center', base: 'middle' });
      A(seg(t, 14.2, 14.8), () => {
        ctx.strokeStyle = C.stamp; ctx.lineWidth = 4; k.rrect(130, 450, 604, 210, 10); ctx.stroke();
        font(600, 30, MONO); text('COMMITTEE FOR THE', CX, 500, { align: 'center', base: 'middle', color: C.stamp, spacing: '2px' });
        text('RECRUITMENT OF', CX, 544, { align: 'center', base: 'middle', color: C.stamp, spacing: '2px' });
        text('JEWISH MANPOWER', CX, 588, { align: 'center', base: 'middle', color: C.stamp, spacing: '2px' });
        font(500, 26, SERIF); text('at its head: Paul Ghez', CX, 632, { align: 'center', base: 'middle', color: C.ink });
      });
    });
    // the lists and the count
    A(seg(t, 18.8, 19.4) * (1 - seg(t, 23.0, 23.4)), () => {
      notebook(t, [[19.2, '7 Dec', 'the order, the lists'], [20.4, '14 Dec', 'men recruited so far:']], { y: 330, h: 330 });
      A(seg(t, 21.0, 21.6), () => {
        const n = Math.round(RECRUITED * eout(seg(t, 21.0, 22.4)));
        font(700, 84, MONO); text(fmt(n), CX, 600, { align: 'center', base: 'middle', color: C.stamp });
      });
    });
    // the march to Cheylus: plain figures crossing the page
    A(seg(t, 23.4, 24.0), () => {
      font(600, 30, SERIF); text('12 December: on foot from Tunis to the camp at Cheylus', CX, 340, { align: 'center', base: 'middle', color: C.ink });
      ctx.fillStyle = C.paper2; ctx.fillRect(0, 600, W, 8);
      for (let i = 0; i < 14; i++) {
        const x = ((t - 23.4) * 40 + i * 62) % (W + 120) - 60;
        man(x, 600, 1.1, (t * 5 + i) * 1.3, i % 3 ? C.grey : '#6b655c');
      }
      font(400, 24, SERIF); text('others at El Aouina airfield, at Bizerte, near the front', CX, 680, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- C: the office, the bargaining, 5,000, April ----------
function sceneOffice(t) {
  A(span(t, 27.8, 41.8, 0.4, 0.4), () => {
    calendar(t, today(t));
    // families waiting at the office
    A(seg(t, 28.2, 28.8) * (1 - seg(t, 32.2, 32.6)), () => {
      ctx.fillStyle = C.desk; ctx.fillRect(560, 380, 180, 300);
      ctx.fillStyle = C.paper2; ctx.fillRect(575, 395, 150, 270);
      font(600, 22, MONO); text('COMMITTEE', 650, 430, { align: 'center', base: 'middle', color: C.stamp });
      const queue = [[150, '#6b655c', 1.0], [230, C.grey, 0.8], [300, '#6b655c', 1.05], [380, C.grey, 0.95], [460, '#8a8379', 0.75]];
      for (const [x, col, s] of queue) man(x, 680, s * 1.5, 0, col);
      font(500, 28, SERIF); text('Families ask for their sons back', 330, 360, { align: 'center', base: 'middle' });
    });
    // bargaining: numbers crossed out
    A(seg(t, 32.8, 33.4) * (1 - seg(t, 36.8, 37.2)), () => {
      notebook(t, [[33.0, '6 Feb', 'trying to lower the numbers']], { y: 330, h: 150 });
      font(500, 28, SERIF); text('In all, about', CX, 540, { align: 'center', base: 'middle', color: C.soft });
      font(700, 96, MONO); text(fmt(IN_CAMPS), CX, 630, { align: 'center', base: 'middle', color: C.stamp });
      font(500, 26, SERIF); text('Jewish men sent to labour and internment camps in Tunisia', CX, 710, { align: 'center', base: 'middle' });
    });
    // April: the front comes close
    A(seg(t, 37.4, 38.0), () => {
      notebook(t, [[37.6, '15 Apr', 'workers moved from the front']], { y: 330, h: 150 });
      font(500, 28, SERIF); text('the fighting comes close to the camps', CX, 560, { align: 'center', base: 'middle', color: C.blue });
    });
  });
}

// ---------- D: 7 and 8 May ----------
function sceneMay(t) {
  A(span(t, 41.6, 55.6, 0.4, 0.4), () => {
    calendar(t, today(t));
    A(seg(t, 42.0, 42.6), () => {
      const X = (d) => CAL_L + (CAL_R - CAL_L) * (d / LAST);
      const x = X(day(1943, 5, 7));
      ctx.strokeStyle = C.stamp; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, 234, 64 + 4 * Math.sin(t * 3), 0, TAU); ctx.stroke();
      notebook(t, [[42.4, '7 May', 'the workers come home'], [46.6, '8 May', 'his flat emptied of furniture']], { y: 340, h: 240 });
      font(500, 30, SERIF); text('7 May 1943: the Allies enter Tunis', CX, 640, { align: 'center', base: 'middle', color: C.blue });
    });
    // the book
    A(seg(t, 51.2, 51.8), () => {
      ctx.fillStyle = 'rgba(239,230,210,0.94)'; ctx.fillRect(0, 300, W, 460);
      ctx.save(); ctx.translate(CX, 520); ctx.rotate(-0.03);
      ctx.fillStyle = '#d8cbb0'; ctx.fillRect(-170, -200, 340, 400);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(-150, -180, 300, 360);
      font(600, 34, SERIF); text('SIX MOIS', 0, -80, { align: 'center', base: 'middle', spacing: '2px' }); text('SOUS LA BOTTE', 0, -36, { align: 'center', base: 'middle', spacing: '2px' });
      font(400, 24, SERIF); text('Paul Ghez', 0, 40, { align: 'center', base: 'middle', color: C.soft }); text('Tunis, 1943', 0, 80, { align: 'center', base: 'middle', color: C.soft });
      ctx.restore();
      font(400, 22, SERIF); text('drawn for this clip, not the real cover', CX, 752, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- E: what kind of book ----------
function sceneEnd(t) {
  A(span(t, 55.4, 65.0, 0.4, 0), () => {
    font(600, 40, SERIF); text('What kind of book?', CX, 150, { align: 'center', base: 'middle' });
    const rows = [['a diary', 'dated entries, November 1942 to May 1943'], ['a witness', 'names, numbers, orders, camps'], ['from the middle', 'German orders on one side, families on the other']];
    rows.forEach(([a, b], i) => A(seg(t, 56.0 + i * 1.2, 56.6 + i * 1.2), () => {
      const y = 280 + i * 140;
      ctx.fillStyle = C.light; k.rrect(90, y - 50, W - 180, 108, 10); ctx.fill();
      font(600, 36, SERIF); text(a, CX, y - 12, { align: 'center', base: 'middle', color: C.stamp });
      font(400, 26, SERIF); text(b, CX, y + 28, { align: 'center', base: 'middle', color: C.ink });
    }));
    A(seg(t, 61.0, 61.6), () => { font(400, 24, SERIF); text('Printed in Tunis in 1943, just after the liberation', CX, 720, { align: 'center', base: 'middle', color: C.soft }); });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  // paper grain
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(90,70,40,${0.03 + rnd() * 0.04})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2); }
  g.fillStyle = 'rgba(43,38,34,0.9)'; g.fillRect(0, 790, W, 112);
}

const CUES = [
  [0.4, 4.8, 'Tunis, November 1942: German and Italian troops occupy the city, and a diary begins.'],
  [5.0, 9.4, 'It is kept by *Paul Ghez*, 44, a lawyer and a member of the Jewish community council.'],
  [9.6, 14.0, 'In December the SS, under Walter Rauff, demand Jewish men for ~forced labour~.'],
  [14.2, 18.6, 'The community’s leaders must set up a recruitment committee, with Paul Ghez at its head.'],
  [18.8, 23.2, 'His diary records the orders and the lists: by 14 December, *3,585* men recruited.'],
  [23.4, 27.8, 'Some march on foot to a camp at Cheylus; others work at airfields and near the front.'],
  [28.0, 32.4, 'Families come to his office to ask for their sons. He tries to lower the numbers.'],
  [32.6, 37.0, 'In all, about *5,000* Jewish men were sent to labour and internment camps in Tunisia.'],
  [37.2, 41.6, 'In April 1943, with the front close, he helps persuade the Germans to move workers back.'],
  [41.8, 46.2, 'On *7 May 1943* the Allies enter Tunis, and he arranges for the workers to come home.'],
  [46.4, 50.8, 'The next day he finds his own flat emptied: the Germans have taken the furniture.'],
  [51.0, 55.4, 'He calls the book ~Six mois sous la botte~: six months under the boot. Tunis, 1943.'],
  [55.6, 60.0, 'It is a diary, not a novel: dated entries, names and numbers, kept by a man in the middle.'],
  [60.2, 64.6, 'It shows the occupation from inside: German orders on one side, families on the other.'],
];

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [MONO, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneIntro(t);
    sceneDecember(t);
    sceneOffice(t);
    sceneMay(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: SERIF, ink: C.light, marks: { '*': '#e8a37d', '~': '#e8c983' } });
  },
});
