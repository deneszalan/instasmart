// Explainer for politics-tunisia-jews-forced-labour-1942 (Tunisia 1943): during the six months of German occupation,
// November 1942 to May 1943, an SS unit under Walter Rauff forced Tunisia's Jewish community to supply men for
// forced labour; about 5,000 men worked in some 32 to 40 camps, many near the front, until the Allies took Tunis on
// 7 May 1943. Look: a night-blue room with a wall calendar of the 179 days, one square per day, filling as the story
// goes, beside paper notices and a ledger; people as plain, upright figures; no violence shown. Libre Caslon Text for
// dates and notices (period print), Source Sans 3 for captions.
//
// Facts:
// - United States Holocaust Memorial Museum, "Labor and Internment Camps in North Africa" (S. Abrevaya Stein and
//   A. Boum, 2019): "Some forty German labor and detention camps were constructed in Tunisia after the Allied
//   landings, when Germany began a six month occupation of Tunisia (November 1942-May 1943). It is estimated that
//   roughly 5,000 Tunisian Jewish men were conscripted for forced labor ... Jewish men were inducted into forced labor
//   near the front lines and within cities like Tunis."
// - Mémorial de la Shoah, "Memory of the Tunis roundup (9 December 1942)": 90,000 Jews lived in Tunisia on the eve
//   of the war; the Nazis arrived on 9 November 1942; raids, the largest in Tunis; "nearly 5,000 Jews were sent to
//   forced labor in 32 camps"; first deportations to camps in Europe from April 1943; the ceremony each December.
// - Montreal Holocaust Museum, "The Holocaust in Tunisia": leaders of the Jewish community arrested within two weeks;
//   an Einsatzkommando led by SS commander Walter Rauff; about 5,000 men sent to forced labour and internment camps,
//   supplied through the "Comité de Recrutement de la Main-d'Oeuvre Juive"; thousands required to wear yellow stars;
//   Gilbert-Mardochée Mazouz, 19, killed by a German soldier on his way to the Cheylus camp near Tunis; Vichy's
//   antisemitic laws remained until 1944.
// - Robert Satloff (Commentary, 2004, on the Jewish Virtual Library): forced labour, confiscations, hostage-taking,
//   mass extortion; Jews in the countryside made to wear the star; Judenrat-like committees of Jewish leaders under
//   threat; Jewish workers cleared rubble after Allied bombing of Tunis and Bizerte; Rauff "had earlier invented the
//   mobile death-gas van".
// - Robert Borgel, "Étoile jaune et croix gammée" (Tunis, 1944), as described by the Documentation Center of North
//   African Jews during WWII (Yad Ben-Zvi): on 6 December 1942 Rauff ordered the Tunis community to enlist 2,000
//   workers; other accounts give 3,000. H. Saadoun (Revue d'histoire de la Shoah, 2016): the lawyer Paul Ghez chaired
//   the recruitment committee, Moïse Borgel was president of the community.
// - Tunis was entered by British troops on 7 May 1943 (ABMC; USHMM): 9 Nov 1942 to 7 May 1943 is 179 days.
//
// Scene plan (65.2 s). Captions centred at y = 846.
//  A  0.0– 9.4  Tunis, 9 November 1942; about 90,000 Jews in Tunisia.
//  B  9.6–27.8  Rauff's SS unit; leaders arrested; 6 December order; 9 December roundup.
//  C 28.0–46.2  The committee made to recruit; about 5,000 men; 32–40 camps; labour near the front; fines, star.
//  D 46.4–55.4  Gilbert Mazouz, 19; the dead remembered.
//  E 55.6–64.6  7 May 1943: Tunis freed; 179 days; remembered each December.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#161a2c', bg2: '#202642', paper: '#efe6d2', paper2: '#dcd0b4', ink: '#f3ecdc', soft: 'rgba(243,236,220,0.74)',
  faint: 'rgba(243,236,220,0.20)', dark: '#2a2433', date: '#e2a74a', harm: '#d98b8b', free: '#86cdb8', print: '#3a3140',
};
const SERIF = 'Libre Caslon Text', SANS = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const DAY = 86400000;
const START = Date.UTC(1942, 10, 9), FREED = Date.UTC(1943, 4, 7);
const DAYS = Math.round((FREED - START) / DAY); // 179
const dayOf = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - START) / DAY);
const ORDER = dayOf(1942, 12, 6), ROUNDUP = dayOf(1942, 12, 9);
const MEN = 5000, PER_FIGURE = 100, CAMPS_LOW = 32, CAMPS_HIGH = 40;
if (DAYS !== 179 || ORDER !== 27 || ROUNDUP !== 30) throw new Error('numbers');

// ---------- the calendar: one row per month, one square per day ----------
const MONTH_ROWS = [['NOV 1942', 1942, 11, 9, 30], ['DEC', 1942, 12, 1, 31], ['JAN 1943', 1943, 1, 1, 31], ['FEB', 1943, 2, 1, 28], ['MAR', 1943, 3, 1, 31], ['APR', 1943, 4, 1, 30], ['MAY', 1943, 5, 1, 7]];
const CW = 19, CH = 30, GXP = 3, GYP = 10, LABW = 100;
const GX = (W - (LABW + 31 * (CW + GXP))) / 2 + LABW, GY = 172;
const CELLS = [];
MONTH_ROWS.forEach(([, y, m, d0, d1], r) => { for (let d = d0; d <= d1; d++) CELLS[dayOf(y, m, d)] = [GX + (d - 1) * (CW + GXP), GY + r * (CH + GYP)]; });
const cellXY = (i) => CELLS[i];
const GRID_BOTTOM = GY + MONTH_ROWS.length * (CH + GYP);
if (CELLS.length !== DAYS + 1) throw new Error('calendar');

function calendar(t, filled, { scale = 1, y = 0, marks = [] } = {}) {
  ctx.save();
  ctx.translate(CX, GY + y); ctx.scale(scale, scale); ctx.translate(-CX, -GY);
  for (let i = 0; i <= DAYS; i++) {
    const [x, yy] = cellXY(i);
    const on = clamp(filled - i);
    ctx.fillStyle = C.faint; k.rrect(x, yy, CW, CH, 4); ctx.fill();
    if (on > 0) A(on, () => { ctx.fillStyle = i === DAYS ? C.free : 'rgba(226,167,74,0.6)'; k.rrect(x, yy, CW, CH, 4); ctx.fill(); });
  }
  for (const [i, color] of marks) {
    const [x, yy] = cellXY(i);
    ctx.strokeStyle = color; ctx.lineWidth = 3; k.rrect(x - 3, yy - 3, CW + 6, CH + 6, 6); ctx.stroke();
  }
  font(600, 22);
  MONTH_ROWS.forEach(([name], r) => text(name, GX - 14, GY + r * (CH + GYP) + CH / 2, { align: 'right', base: 'middle', color: C.soft }));
  ctx.restore();
  void t;
}
/** A note under the calendar, with a thin line up to day i. */
function callout(i, s, color, y = GRID_BOTTOM + 34) {
  const [x, yy] = cellXY(i);
  font(600, 24);
  const w = ctx.measureText(s).width;
  const tx = clamp(x + CW / 2, 40 + w / 2, W - 40 - w / 2);
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + CW / 2, yy + CH + 4); ctx.lineTo(x + CW / 2, y - 18); ctx.lineTo(tx, y - 18); ctx.stroke();
  text(s, tx, y, { align: 'center', base: 'middle', color });
}

// ---------- paper notices ----------
function notice(x, y, w, h, rot, lines, { head, headColor = C.print } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h);
  ctx.fillStyle = C.paper; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = C.paper2; ctx.lineWidth = 2; ctx.strokeRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20);
  let yy = -h / 2 + 46;
  if (head) { font(700, 26, SERIF); text(head, 0, yy, { align: 'center', base: 'middle', color: headColor }); yy += 44; }
  for (const [s, size = 22, color = C.print, weight = 400] of lines) {
    font(weight, size, SERIF); text(s, 0, yy, { align: 'center', base: 'middle', color }); yy += size * 1.5;
  }
  ctx.restore();
}

// ---------- figures: plain, upright, respectful ----------
function figure(x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y - 22 * s, 6 * s, 0, TAU); ctx.fill();
  k.rrect(x - 7 * s, y - 14 * s, 14 * s, 26 * s, 5 * s); ctx.fill();
}

/** Several strings on one line, each drawn (and translated) on its own: words stay whole for other languages, numbers can change. */
function words(parts, x, y, { align = 'center', color } = {}) {
  const sp = ctx.measureText(' ').width, ws = parts.map((p) => ctx.measureText(p).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  parts.forEach((p, i) => { text(p, cx, y, { align: 'left', base: 'middle', ...(color ? { color } : {}) }); cx += ws[i] + sp; });
}
// ---------- A ----------
function sceneOpen(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    font(700, 44, SERIF); text('Tunis, November 1942', CX, 96, { align: 'center', base: 'middle', color: C.ink });
    calendar(t, eout(seg(t, 1.0, 2.0)), { marks: [[0, C.date]] });
    A(seg(t, 1.6, 2.4), () => callout(0, '9 November: German forces arrive', C.date));
    // 90,000
    A(seg(t, 5.0, 5.8), () => {
      const n = Math.round(90000 * eout(seg(t, 5.0, 6.8)) / 1000) * 1000;
      ctx.fillStyle = 'rgba(22,26,44,0.88)'; k.rrect(152, 560, 560, 190, 16); ctx.fill();
      font(700, 64, SERIF); words(['about', Kit.fmt(n)], CX, 628);
      font(400, 26); text('Jews in Tunisia, a French protectorate,', CX, 690, { align: 'center', base: 'middle', color: C.soft });
      text('alongside Muslim and European neighbours', CX, 724, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- B ----------
function sceneOrders(t) {
  A(span(t, 9.4, 28.0, 0.5, 0.4), () => {
    const filled = lerp(1, ROUNDUP + 1, eio(seg(t, 14.0, 23.6)));
    calendar(t, filled, { marks: [[0, C.date], ...(t > 18.8 ? [[ORDER, C.harm]] : []), ...(t > 23.4 ? [[ROUNDUP, C.harm]] : [])] });
    font(700, 40, SERIF); text('The SS arrives', CX, 96, { align: 'center', base: 'middle', color: C.harm });
    // the SS unit
    A(seg(t, 9.8, 10.6) * (1 - seg(t, 13.8, 14.2)), () => {
      notice(CX, 650, 600, 190, -0.012, [['SS Einsatzkommando', 30, C.print, 700], ['commander: Walter Rauff', 24], ['earlier: developer of the gas vans', 22, '#7a3b3b']]);
    });
    // leaders arrested
    A(seg(t, 14.2, 14.8) * (1 - seg(t, 18.4, 18.8)), () => {
      for (let i = 0; i < 5; i++) figure(300 + i * 66, 700, 2.0, i === 2 ? C.ink : C.soft);
      ctx.strokeStyle = C.harm; ctx.lineWidth = 4;
      k.rrect(270, 610, 324, 130, 10); ctx.stroke();
      font(600, 26); text('community leaders arrested', CX, 580, { align: 'center', base: 'middle', color: C.harm });
    });
    // the order of 6 December
    A(seg(t, 18.8, 19.4) * (1 - seg(t, 23.0, 23.4)), () => {
      notice(CX, 660, 560, 230, 0.015, [['to the Jewish community of Tunis:', 22], ['supply workers for the', 22], ['German army', 22]], { head: '6 December 1942', headColor: '#7a3b3b' });
      ctx.save(); ctx.translate(CX + 110, 728); ctx.rotate(-0.08);
      font(700, 30, SERIF); words([`${Kit.fmt(2000)}–${Kit.fmt(3000)}`, 'men'], 0, 0, { color: '#9a3030' });
      ctx.restore();
    });
    // 9 December
    A(seg(t, 23.4, 24.0), () => {
      notice(CX, 660, 560, 170, -0.01, [['a roundup of Jewish men', 24], ['in the streets of Tunis', 24]], { head: '9 December 1942', headColor: '#7a3b3b' });
    });
  });
}

// ---------- C ----------
function sceneLabour(t) {
  A(span(t, 27.8, 46.4, 0.5, 0.4), () => {
    const cal = 1 - seg(t, 28.0, 29.0);
    A(cal, () => calendar(t, lerp(ROUNDUP + 1, 150, eio(seg(t, 28, 46))), { scale: 1, marks: [[0, C.date], [ORDER, C.harm], [ROUNDUP, C.harm]] }));
    // the committee and its ledger
    A(seg(t, 28.2, 28.8) * (1 - seg(t, 32.2, 32.6)), () => {
      font(700, 38, SERIF); text('Made to organise it', CX, 96, { align: 'center', base: 'middle', color: C.ink });
      ctx.fillStyle = C.paper; ctx.fillRect(182, 300, 500, 440);
      ctx.strokeStyle = C.paper2; ctx.lineWidth = 2;
      font(700, 24, SERIF); text('Recruitment committee', CX, 340, { align: 'center', base: 'middle', color: C.print });
      font(400, 20, SERIF); text('for Jewish labour', CX, 370, { align: 'center', base: 'middle', color: C.print });
      const rows = Math.floor(14 * seg(t, 29.0, 32.0));
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = i < rows ? 'rgba(58,49,64,0.55)' : 'rgba(58,49,64,0.12)';
        ctx.fillRect(222, 404 + i * 23, 300 * (0.6 + 0.4 * ((i * 37) % 10) / 10), 7);
        ctx.fillRect(560, 404 + i * 23, 80, 7);
      }
    });
    // 5,000 men: 50 figures, each 100 men
    A(seg(t, 32.8, 33.4) * (1 - seg(t, 41.6, 42.0)), () => {
      font(700, 40, SERIF); words(['about', Kit.fmt(MEN), 'men'], CX, 96, { color: C.date });
      font(400, 24); text('sent to forced labour, Dec 1942 – May 1943', CX, 140, { align: 'center', base: 'middle', color: C.soft });
      const n = Math.round((MEN / PER_FIGURE) * eout(seg(t, 33.0, 35.6)));
      for (let i = 0; i < MEN / PER_FIGURE; i++) {
        const col = i % 10, row = Math.floor(i / 10);
        figure(170 + col * 58, 330 + row * 76, 1.5, i < n ? C.ink : 'rgba(243,236,220,0.12)');
      }
      font(400, 22); text('one figure = 100 men', CX, 720, { align: 'center', base: 'middle', color: C.soft });
      // camps: 32 to 40
      A(seg(t, 37.2, 37.8), () => {
        ctx.fillStyle = 'rgba(22,26,44,0.9)'; k.rrect(112, 250, 640, 410, 16); ctx.fill();
        font(700, 34, SERIF); words([String(CAMPS_LOW), 'to about', String(CAMPS_HIGH), 'camps'], CX, 300);
        font(400, 22); text('by different counts: Mémorial de la Shoah, USHMM', CX, 338, { align: 'center', base: 'middle', color: C.soft });
        for (let i = 0; i < CAMPS_HIGH; i++) {
          const x = 170 + (i % 10) * 58, y = 420 + Math.floor(i / 10) * 56, sure = i < CAMPS_LOW;
          A(seg(t, 37.6 + i * 0.03, 37.9 + i * 0.03), () => {
            ctx.fillStyle = sure ? C.paper2 : 'rgba(220,208,180,0.35)';
            ctx.beginPath(); ctx.moveTo(x - 18, y + 14); ctx.lineTo(x - 18, y - 4); ctx.lineTo(x, y - 16); ctx.lineTo(x + 18, y - 4); ctx.lineTo(x + 18, y + 14); ctx.closePath(); ctx.fill();
          });
        }
        font(400, 22); text('many near the front lines, some in Tunis itself', CX, 640, { align: 'center', base: 'middle', color: C.soft });
      });
    });
    // fines, confiscations, the star
    A(seg(t, 42.0, 42.6) * (1 - seg(t, 46.0, 46.4)), () => {
      font(700, 38, SERIF); text('And more', CX, 96, { align: 'center', base: 'middle', color: C.harm });
      const items = [['fines and extortion', 0], ['property confiscated', 0.4], ['hostages taken', 0.8], ['a yellow star, in some towns', 1.2]];
      items.forEach(([s, d], i) => A(seg(t, 42.4 + d, 42.9 + d), () => {
        ctx.fillStyle = 'rgba(22,26,44,0.88)'; k.rrect(172, 300 + i * 100, 520, 76, 12); ctx.fill();
        ctx.strokeStyle = C.harm; ctx.lineWidth = 2; ctx.stroke();
        font(600, 30, SERIF); text(s, CX, 338 + i * 100, { align: 'center', base: 'middle', color: C.ink });
      }));
      // a six-pointed star outline, drawn plainly
      A(seg(t, 43.8, 44.4), () => {
        ctx.strokeStyle = C.date; ctx.lineWidth = 4;
        const sx = 700, sy = 638, r = 22;
        for (const off of [0, Math.PI]) {
          ctx.beginPath();
          for (let j = 0; j < 3; j++) { const a = off - Math.PI / 2 + j * TAU / 3; const px = sx + r * Math.cos(a), py = sy + r * Math.sin(a); j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
          ctx.closePath(); ctx.stroke();
        }
      });
    });
  });
}

// ---------- D: one name ----------
function sceneName(t) {
  A(span(t, 46.2, 55.6, 0.6, 0.5), () => {
    // a candle
    const cx = CX, cy = 520;
    ctx.fillStyle = C.paper; k.rrect(cx - 22, cy - 40, 44, 150, 6); ctx.fill();
    const fl = 1 + 0.06 * Math.sin(t * 9) + 0.04 * Math.sin(t * 13.7);
    const g = ctx.createRadialGradient(cx, cy - 70, 4, cx, cy - 70, 120);
    g.addColorStop(0, 'rgba(255,214,140,0.55)'); g.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy - 70, 120, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffd98c';
    ctx.beginPath(); ctx.moveTo(cx, cy - 92 * fl); ctx.quadraticCurveTo(cx + 15, cy - 60, cx, cy - 44); ctx.quadraticCurveTo(cx - 15, cy - 60, cx, cy - 92 * fl); ctx.fill();
    A(seg(t, 46.8, 47.6), () => {
      font(700, 40, SERIF); text('Gilbert Mazouz, 19', CX, 190, { align: 'center', base: 'middle', color: C.ink });
      font(400, 24); text('shot by a German soldier on the way to a camp near Tunis', CX, 238, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 51.0, 51.8), () => {
      font(400, 24); text('Others were killed in Allied bombing raids.', CX, 700, { align: 'center', base: 'middle', color: C.soft });
      text('A few were deported to camps in Europe.', CX, 736, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- E ----------
function sceneEnd(t) {
  A(span(t, 55.4, 65.2, 0.5, 0), () => {
    const filled = lerp(150, DAYS + 1, eio(seg(t, 55.8, 57.6)));
    calendar(t, filled, { marks: [[0, C.date], [ORDER, C.harm], [ROUNDUP, C.harm], ...(t > 57.4 ? [[DAYS, C.free]] : [])] });
    font(700, 40, SERIF); text('7 May 1943: Tunis is freed', CX, 96, { align: 'center', base: 'middle', color: C.free });
    A(seg(t, 57.6, 58.2), () => callout(DAYS, 'British troops enter Tunis', C.free));
    A(seg(t, 60.2, 61.0), () => {
      ctx.fillStyle = 'rgba(22,26,44,0.9)'; k.rrect(172, 600, 520, 150, 16); ctx.fill();
      font(700, 64, SERIF); words([String(DAYS), 'days'], CX, 660);
      font(400, 24); text('remembered each December, for the Tunis roundup', CX, 716, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

const CUES = [
  [0.4, 4.8, 'On *9 November 1942*, German forces began to arrive in Tunis, capital of the French protectorate of Tunisia.'],
  [5.0, 9.4, 'About 90,000 Jews lived in Tunisia, alongside Muslim and European neighbours.'],
  [9.6, 14.0, 'With the army came an SS unit under ~Walter Rauff~, who had developed gas vans used to murder Jews.'],
  [14.2, 18.6, 'Within two weeks the Germans had arrested leaders of the Jewish community.'],
  [18.8, 23.2, 'On *6 December* Rauff ordered the community to hand over 2,000 to 3,000 men for ~forced labour~.'],
  [23.4, 27.8, 'On *9 December* the SS carried out a roundup of Jewish men in the streets of Tunis.'],
  [28.0, 32.4, 'The community’s own leaders were made to set up a committee to recruit the workers.'],
  [32.6, 37.0, 'About *5,000* Jewish men were sent to forced labour for the German army.'],
  [37.2, 41.6, 'They worked in 32 to about 40 camps, by different counts, many near the front lines.'],
  [41.8, 46.2, 'Jews also faced fines, confiscations and hostage-taking; in some towns, a ~yellow star~.'],
  [46.4, 50.8, 'Some did not come back. Gilbert Mazouz, 19, was shot by a German soldier on his way to a camp.'],
  [51.0, 55.4, 'Others were killed in Allied bombing raids; a few were deported to camps in Europe.'],
  [55.6, 60.0, 'On *7 May 1943*, British troops entered Tunis. The Germans fled, and the forced labour ended.'],
  [60.2, 64.6, 'The occupation had lasted *179 days*. Each December, the Tunis roundup is remembered.'],
];

let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg2); lg.addColorStop(1, C.bg1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneOpen(t);
    sceneOrders(t);
    sceneLabour(t);
    sceneName(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.date, '~': C.harm } });
  },
});
