// Explainer for history-caesar-445-day-year (Roma): in 46 BC Julius Caesar made one year 445 days long to put Rome's
// calendar back in step with the Sun, then gave Rome a 365-day year with a leap day every fourth year. Look: a
// painted Roman calendar (fasti) on plaster, red and black letters, carved Roman capitals, a ring of months turning
// against a ring of seasons. Cinzel for capitals and labels, Cardo for captions.
//
// Facts:
// - Wikipedia, "Roman calendar": the republican year had 355 days: four months of 31 days (Martius, Maius,
//   Quintilis, October), February 28 and the rest 29. The Pontifex Maximus decided when to insert an intercalary
//   month; Macrobius says 22 and 23 days were added in alternate years, so on average every other year. A Pontifex
//   Maximus had an incentive to lengthen a year in which he or his allies held office. The month names come from a
//   year that began in March, so September was the seventh month; the consular year began on 1 January from 153 BC.
// - Wikipedia, "Julian calendar": the pontiffs were often politicians, and could lengthen a year for an ally. Pliny
//   says Caesar was aided by the astronomer Sosigenes of Alexandria. 46 BC was made 445 days long: its regular
//   intercalary month (23 days) plus two extraordinary intercalary months of 67 days between November and December,
//   compensating for intercalations missed during Caesar's pontificate. The new calendar began on 1 January 45 BC:
//   365 days with a leap day every fourth year. The pontiffs at first added the leap day every three years; the error
//   lasted 36 years, and Augustus ordered twelve years without a leap day. The Julian calendar gains a day about every
//   128 years; by 1582, 21 March was ten days out of alignment with the March equinox, and the Gregorian reform left
//   out ten days. Quintilis was renamed for Caesar (July) in 44 BC, Sextilis for Augustus (August) in 8 BC.
// - Wikipedia, "Tropical year": about 365.2422 days.
// Computed here: 355 from the month lengths; 365.2422 − 355 ≈ 10 days; 355 + 23 + 67 = 445; the Julian year's surplus
// 365.25 − 365.2422 = 0.0078 days ≈ 11 minutes, one day in ≈ 128 years.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: a carved tablet, CDXLV = 445 days, 46 BC; Caesar's laurel.
//  B  9.2–18.4  The old calendar: 12 months, 355 days, against the Sun's 365¼.
//  C 18.4–27.6  The extra month, and priests who skipped or stretched it.
//  D 27.6–36.8  A ring of months slips against the seasons; Caesar adds 90 days.
//  E 36.8–46.0  355 + 23 + 67 = 445; then 365 + a leap day every fourth year.
//  F 46.0–55.2  The priests' every-third-year slip; Caesar's year still 11 minutes long.
//  G 55.2–64.6  1582 and the Gregorian reform; July, August and September.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  plaster: '#efe5d1', plaster2: '#e2d4b9', ink: '#1f1a16', soft: 'rgba(31,26,22,0.66)', faint: 'rgba(31,26,22,0.2)',
  red: '#9e2b1d', gold: '#a87422', blue: '#2b5592', stone: '#d8cbb1', stoneDark: '#b9a888',
  spring: '#6d8f3b', summer: '#d29a2a', autumn: '#b4572a', winter: '#4c7aa6', laurel: '#5f7a33',
};
const CAPS = 'Cinzel', SERIF = 'Cardo';

let k, ctx;
const font = (w, s, f = CAPS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
// Months of the republican year, in the order of a year starting on 1 January (as from 153 BC).
const MONTHS = [
  ['IAN', 29], ['FEB', 28], ['MAR', 31], ['APR', 29], ['MAI', 31], ['IVN', 29],
  ['QVIN', 31], ['SEX', 29], ['SEP', 29], ['OCT', 31], ['NOV', 29], ['DEC', 29],
];
const OLD_YEAR = MONTHS.reduce((s, [, d]) => s + d, 0); // 355
const SUN_YEAR = 365.2422;
const SHORT = SUN_YEAR - OLD_YEAR; // about 10 days
const EXTRA = 23, EXTRAORDINARY = 67;
const CONFUSION = OLD_YEAR + EXTRA + EXTRAORDINARY; // 445
const JULIAN = 365.25;
const SURPLUS = JULIAN - SUN_YEAR; // days a year
const MINUTES = Math.round(SURPLUS * 24 * 60); // about 11
const PER_DAY = Math.round(1 / SURPLUS); // about 128 years
if (OLD_YEAR !== 355 || CONFUSION !== 445 || PER_DAY !== 128 || MINUTES !== 11) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'In *46 BC*, one year in Rome lasted ~445 days~.'],
  [4.8, 9.0, 'Julius Caesar ordered it, to put Rome’s calendar back in step with the Sun.'],
  [9.2, 13.6, `Rome’s old calendar had 12 months and only *${OLD_YEAR} days*.`],
  [13.8, 18.2, `The Sun’s year, from one spring equinox to the next, lasts about ~365¼ days~: ten more.`],
  [18.4, 22.8, 'So the chief priest, the *pontifex maximus*, could add an extra month of 22 or 23 days.'],
  [23.0, 27.4, 'Priests were also politicians: they could stretch a year for allies, or skip the month.'],
  [27.6, 32.0, 'Skipped months let the dates run ahead of the seasons, year after year.'],
  [32.2, 36.6, 'Advised by the astronomer *Sosigenes*, Caesar added ~90 days~ to 46 BC to catch up.'],
  [36.8, 41.2, `The usual extra month, ^${EXTRA} days^, plus two new months, *${EXTRAORDINARY} days*: ${CONFUSION} in all.`],
  [41.4, 45.8, 'From 1 January 45 BC: 365 days a year, and a leap day every *fourth* year.'],
  [46.0, 50.4, 'At first the priests added it every ~third~ year, until Augustus skipped 12 years of leap days.'],
  [50.6, 55.0, `Caesar’s year of ${JULIAN} days is still about ${MINUTES} minutes too long: a day every ~${PER_DAY} years~.`],
  [55.2, 59.6, 'By 1582 the equinox fell *10 days* before 21 March, and the Gregorian reform dropped them.'],
  [59.8, 64.2, 'Rome’s year once began in March, so *September* is the ‘seventh’, and Quintilis became ~July~.'],
];

// ---------- background: painted plaster ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W * 0.4, H);
  lg.addColorStop(0, C.plaster); lg.addColorStop(1, C.plaster2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 23; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 7000; i++) { g.fillStyle = `rgba(110,80,40,${rnd() * 0.05})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 1.5); }
  // hairline cracks
  g.strokeStyle = 'rgba(80,60,40,0.10)'; g.lineWidth = 1.2;
  for (let c = 0; c < 5; c++) {
    let x = rnd() * W, y = rnd() * 700; g.beginPath(); g.moveTo(x, y);
    for (let j = 0; j < 9; j++) { x += (rnd() - 0.4) * 40; y += rnd() * 30; g.lineTo(x, y); }
    g.stroke();
  }
  // a painted red border, as on the fasti
  g.strokeStyle = 'rgba(158,43,29,0.55)'; g.lineWidth = 6; g.strokeRect(22, 22, W - 44, 720);
  g.strokeStyle = 'rgba(158,43,29,0.3)'; g.lineWidth = 2; g.strokeRect(34, 34, W - 68, 696);
}

// ---------- helpers ----------
function laurel(cx, cy, r, a) {
  A(a, () => {
    ctx.fillStyle = C.laurel;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 11; i++) {
        const ang = Math.PI / 2 + side * (0.35 + i * 0.22);
        const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang + side * 1.25);
        ctx.beginPath(); ctx.ellipse(0, 0, 22, 8, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }
  });
}

function tablet(x, y, w, h) {
  ctx.fillStyle = C.stone; k.rrect(x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = C.stoneDark; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = 'rgba(31,26,22,0.18)'; ctx.lineWidth = 2; ctx.strokeRect(x + 16, y + 16, w - 32, h - 32);
}

/** A strip of day cells, one cell per day, wrapping at `perRow`. Returns the cell size. */
function dayCells(x, y, n, { cell = 9, gap = 1.5, perRow = 64, color = C.ink, from = 0, shown = n } = {}) {
  ctx.fillStyle = color;
  for (let i = from; i < Math.min(n, shown); i++) {
    const c = i % perRow, r = Math.floor(i / perRow);
    ctx.fillRect(x + c * (cell + gap), y + r * (cell + gap), cell, cell);
  }
  return cell + gap;
}

// ---------- A: the hook ----------
function sceneHook(t) {
  const a = span(t, 0, 9.4, 0.4, 0.5);
  A(a, () => {
    const s = eout(seg(t, 0.2, 1.2));
    tablet(CX - 250, 150 + (1 - s) * 30, 500, 380);
    font(700, 34); text('46 BC', CX, 222, { align: 'center', base: 'middle', color: C.soft, spacing: '4px' });
    font(800, 132); text('CDXLV', CX, 340, { align: 'center', base: 'middle', color: C.red, spacing: '6px' });
    A(seg(t, 1.4, 2.2), () => { font(700, 44); text('445 DIES', CX, 450, { align: 'center', base: 'middle', spacing: '4px' }); });
    laurel(CX, 340, 270, seg(t, 5.0, 6.2));
    A(seg(t, 5.4, 6.4), () => { font(700, 34); text('C · IVLIVS · CAESAR', CX, 640, { align: 'center', base: 'middle', color: C.ink, spacing: '4px' }); });
  });
}

// ---------- B: 355 days against the Sun's year ----------
function yearBar(y, days, label, color, grow, sub) {
  const L = 90, R = 790, scale = (R - L) / 380;
  ctx.fillStyle = color; ctx.fillRect(L, y, days * scale * grow, 44);
  font(700, 26); text(label, L, y - 18, { base: 'middle' });
  if (sub) { font(400, 26, SERIF); text(sub, L + days * scale * grow + 12, y + 22, { base: 'middle', color: C.soft }); }
  return { L, scale };
}
function sceneOld(t) {
  const a = span(t, 9.2, 18.6, 0.4, 0.4);
  A(a, () => {
    // the months as painted columns
    const L = 90, colW = (790 - L) / 12;
    MONTHS.forEach(([m, d], i) => {
      const v = seg(t, 9.4 + i * 0.12, 9.9 + i * 0.12);
      A(v, () => {
        const x = L + i * colW, hgt = d * 6.2;
        ctx.fillStyle = d === 31 ? C.red : d === 28 ? C.blue : C.ink;
        ctx.globalAlpha *= 0.85; ctx.fillRect(x + 6, 430 - hgt, colW - 12, hgt); ctx.globalAlpha /= 0.85;
        font(700, 22); text(m, x + colW / 2, 456, { align: 'center', base: 'middle' });
        font(700, 24); text(String(d), x + colW / 2, 430 - hgt - 18, { align: 'center', base: 'middle', color: C.soft });
      });
    });
    A(seg(t, 11.2, 12.0), () => { font(800, 54); text(`${OLD_YEAR} DAYS`, CX, 120, { align: 'center', base: 'middle', color: C.ink, spacing: '3px' }); });
    // the two years as bars
    A(seg(t, 13.8, 14.6), () => {
      const grow = eio(seg(t, 13.9, 15.2));
      yearBar(560, OLD_YEAR, 'THE CALENDAR', C.ink, grow, `${OLD_YEAR}`);
      const { L: l2, scale } = yearBar(660, SUN_YEAR, 'THE SUN', C.gold, eio(seg(t, 14.6, 15.9)), '365¼');
      A(seg(t, 16.0, 16.8), () => {
        ctx.fillStyle = C.red; ctx.fillRect(l2 + OLD_YEAR * scale, 560, SHORT * scale, 44);
        font(700, 24); text(`${Math.round(SHORT)} days short`, l2 + OLD_YEAR * scale + SHORT * scale / 2, 540 - 6, { align: 'center', base: 'middle', color: C.red });
      });
    });
  });
}

// ---------- C: the extra month ----------
function sceneExtra(t) {
  const a = span(t, 18.4, 27.8, 0.4, 0.4);
  A(a, () => {
    const L = 70, R = 794, ins = eio(seg(t, 18.8, 20.2));
    // the year as a ribbon: Jan, Feb | extra | Mar … Dec
    const extraW = 22 * 1.9 * ins;
    const total = (R - L) - 48;
    const px = total / OLD_YEAR;
    let x = L;
    MONTHS.forEach(([m, d], i) => {
      if (i === 2) {
        A(ins, () => {
          ctx.fillStyle = C.gold; ctx.fillRect(x, 190, extraW, 80);
          font(700, 18); text('+22/23', x + extraW / 2, 230, { align: 'center', base: 'middle', color: '#fff8e8' });
        });
        x += extraW + 2;
      }
      const w = d * px * (1 - 0.06 * ins);
      ctx.fillStyle = i % 2 ? C.stoneDark : C.stone; ctx.fillRect(x, 190, w, 80);
      font(700, 15); text(m, x + w / 2, 230, { align: 'center', base: 'middle', color: C.ink });
      x += w + 2;
    });
    A(seg(t, 19.6, 20.4), () => {
      font(700, 26); text('MENSIS INTERCALARIS', L + 2 * 29 * px + 30, 150, { align: 'left', base: 'middle', color: C.gold, spacing: '2px' });
      font(700, 30); text('PONTIFEX MAXIMVS', CX, 330, { align: 'center', base: 'middle', color: C.red, spacing: '3px' });
      font(400, 26, SERIF); text('the chief priest decides', CX, 370, { align: 'center', base: 'middle', color: C.soft });
    });
    // years: some get the month, some are stretched, some skip it
    A(seg(t, 23.0, 23.8), () => {
      const years = [['plan', 'gold'], ['plan', 'none'], ['plan', 'gold'], ['stretched', 'red'], ['skipped', 'cross'], ['skipped', 'cross']];
      years.forEach(([kind, mark], i) => {
        const v = seg(t, 23.2 + i * 0.35, 23.7 + i * 0.35);
        A(v, () => {
          const x0 = 108 + i * 112, y0 = 440;
          ctx.fillStyle = C.stone; k.rrect(x0, y0, 92, 150, 8); ctx.fill();
          ctx.strokeStyle = C.stoneDark; ctx.lineWidth = 2; ctx.stroke();
          font(700, 20); text(`YEAR ${['I', 'II', 'III', 'IV', 'V', 'VI'][i]}`, x0 + 46, y0 + 26, { align: 'center', base: 'middle' });
          if (mark === 'gold' || mark === 'red') {
            ctx.fillStyle = mark === 'gold' ? C.gold : C.red;
            const hh = mark === 'red' ? 90 : 46;
            ctx.fillRect(x0 + 18, y0 + 50, 56, hh);
          }
          if (mark === 'cross') {
            ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath();
            ctx.moveTo(x0 + 22, y0 + 56); ctx.lineTo(x0 + 70, y0 + 120); ctx.moveTo(x0 + 70, y0 + 56); ctx.lineTo(x0 + 22, y0 + 120); ctx.stroke();
          }
          font(400, 20, SERIF); text(kind === 'plan' ? (mark === 'none' ? 'no extra' : 'extra month') : kind, x0 + 46, y0 + 168, { align: 'center', base: 'middle', color: kind === 'plan' ? C.soft : C.red });
        });
      });
    });
  });
}

// ---------- D: months slip against the seasons ----------
const SEASONS = [['SPRING', C.spring], ['SUMMER', C.summer], ['AUTUMN', C.autumn], ['WINTER', C.winter]];
function rings(cx, cy, r, slip) {
  // seasons, fixed: spring begins at the top (the equinox)
  SEASONS.forEach(([name, col], i) => {
    ctx.strokeStyle = col; ctx.lineWidth = 34;
    ctx.beginPath(); ctx.arc(cx, cy, r - 50, -Math.PI / 2 + i * TAU / 4, -Math.PI / 2 + (i + 1) * TAU / 4); ctx.stroke();
    const ang = -Math.PI / 2 + (i + 0.5) * TAU / 4;
    font(700, 16); text(name, cx + Math.cos(ang) * (r - 50), cy + Math.sin(ang) * (r - 50), { align: 'center', base: 'middle', color: '#fff8e8' });
  });
  // months, turning: Martius should start at the spring equinox
  const start = -Math.PI / 2 - (slip / 365.25) * TAU;
  let acc = 0;
  const order = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];
  for (const i of order) {
    const [m, d] = MONTHS[i];
    const a0 = start + (acc / OLD_YEAR) * TAU, a1 = start + ((acc + d) / OLD_YEAR) * TAU;
    ctx.strokeStyle = m === 'MAR' ? C.red : i % 2 ? C.stoneDark : C.stone; ctx.lineWidth = 46;
    ctx.beginPath(); ctx.arc(cx, cy, r, a0 + 0.01, a1 - 0.01); ctx.stroke();
    const am = (a0 + a1) / 2;
    font(700, 15); text(m, cx + Math.cos(am) * r, cy + Math.sin(am) * r, { align: 'center', base: 'middle', color: m === 'MAR' ? '#fff8e8' : C.ink });
    acc += d;
  }
  // the equinox marker
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(cx, cy - r - 40); ctx.lineTo(cx - 12, cy - r - 62); ctx.lineTo(cx + 12, cy - r - 62); ctx.fill();
  font(700, 20); text('SPRING EQUINOX', cx, cy - r - 80, { align: 'center', base: 'middle' });
}
function sceneDrift(t) {
  const a = span(t, 27.6, 37.0, 0.4, 0.4);
  A(a, () => {
    // the dates slip ahead of the seasons (schematic), then Caesar's 90 days turn them back
    const slip = lerp(0, 90, eio(seg(t, 28.2, 31.6))) - 90 * eio(seg(t, 33.4, 35.6));
    rings(CX, 420, 230, slip);
    A(seg(t, 29.0, 29.6) * (1 - seg(t, 33.2, 33.6)), () => {
      font(700, 26); text('AHEAD OF', CX, 404, { align: 'center', base: 'middle', color: C.red });
      text('THE SEASONS', CX, 438, { align: 'center', base: 'middle', color: C.red });
    });
    A(seg(t, 33.4, 34.0), () => {
      font(700, 30); text('+ 90 DAYS', CX, 405, { align: 'center', base: 'middle', color: C.gold });
      font(400, 24, SERIF); text('Caesar and Sosigenes', CX, 445, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- E: 445, then the Julian rule ----------
function sceneFix(t) {
  const a = span(t, 36.8, 46.2, 0.4, 0.4);
  A(a, () => {
    // 445 day cells: 355 ink, 23 gold, 67 red
    const perRow = 30, cell = 19, gap = 2.5, x0 = (W - perRow * (cell + gap) + gap) / 2, y0 = 90;
    const shown = Math.floor(lerp(0, CONFUSION, eio(seg(t, 37.0, 40.4))));
    const step = dayCells(x0, y0, OLD_YEAR, { cell, gap, perRow, color: C.ink, shown });
    dayCells(x0, y0, OLD_YEAR + EXTRA, { cell, gap, perRow, color: C.gold, from: OLD_YEAR, shown });
    dayCells(x0, y0, CONFUSION, { cell, gap, perRow, color: C.red, from: OLD_YEAR + EXTRA, shown });
    const rows = Math.ceil(CONFUSION / perRow);
    A(seg(t, 39.6, 40.4) * (1 - seg(t, 41.2, 41.6)), () => {
      const y = y0 + rows * step + 36;
      font(700, 30);
      text(`${OLD_YEAR}`, 200, y, { align: 'center', base: 'middle' });
      text('+', 290, y, { align: 'center', base: 'middle', color: C.soft });
      text(`${EXTRA}`, 370, y, { align: 'center', base: 'middle', color: C.gold });
      text('+', 450, y, { align: 'center', base: 'middle', color: C.soft });
      text(`${EXTRAORDINARY}`, 530, y, { align: 'center', base: 'middle', color: C.red });
      text(`= ${CONFUSION}`, 660, y, { align: 'center', base: 'middle' });
    });
  });
  // the four-year cycle
  A(span(t, 41.4, 46.2, 0.4, 0.4), () => {
    ctx.fillStyle = C.plaster; ctx.fillRect(40, 40, W - 80, 684);
    font(700, 30); text('KAL · IAN · 45 BC', CX, 150, { align: 'center', base: 'middle', color: C.red, spacing: '3px' });
    for (let i = 0; i < 4; i++) {
      const v = seg(t, 41.8 + i * 0.5, 42.3 + i * 0.5);
      A(v, () => {
        const x = 110 + i * 166, y = 230;
        tablet(x, y, 142, 250);
        font(700, 22); text(`YEAR ${i + 1}`, x + 71, y + 44, { align: 'center', base: 'middle' });
        font(800, 52); text(i === 3 ? '366' : '365', x + 71, y + 130, { align: 'center', base: 'middle', color: i === 3 ? C.red : C.ink });
        if (i === 3) { font(400, 22, SERIF); text('+1 leap day', x + 71, y + 196, { align: 'center', base: 'middle', color: C.red }); }
      });
    }
    A(seg(t, 44.0, 44.8), () => { font(700, 34); text(`AVERAGE  ${JULIAN} DAYS`, CX, 580, { align: 'center', base: 'middle', color: C.blue, spacing: '2px' }); });
  });
}

// ---------- F: the priests' slip and the 11 minutes ----------
function sceneSlip(t) {
  A(span(t, 46.0, 55.4, 0.4, 0.4), () => {
    // twelve years: leap days every third year (wrong) and every fourth (right)
    const L = 96, colW = 56;
    font(700, 22); text('EVERY 3RD YEAR', L, 140, { base: 'middle', color: C.red });
    text('EVERY 4TH YEAR', L, 280, { base: 'middle', color: C.ink });
    for (let y = 1; y <= 12; y++) {
      const v = seg(t, 46.3 + y * 0.12, 46.7 + y * 0.12);
      A(v, () => {
        const x = L + (y - 1) * colW;
        for (const [row, every, col] of [[170, 3, C.red], [310, 4, C.ink]]) {
          const leap = y % every === 0;
          ctx.fillStyle = leap ? col : C.stone; k.rrect(x, row, colW - 8, 60, 6); ctx.fill();
          font(700, 18); text(String(y), x + (colW - 8) / 2, row + 30, { align: 'center', base: 'middle', color: leap ? '#fff8e8' : C.soft });
        }
      });
    }
    A(seg(t, 48.4, 49.2) * (1 - seg(t, 50.4, 50.8)), () => {
      font(400, 26, SERIF); text('for 36 years; then Augustus left out leap days for 12 years', CX, 430, { align: 'center', base: 'middle', color: C.soft });
    });
    // the 11 minutes and a day every 128 years
    A(seg(t, 50.6, 51.4), () => {
      const bx = 96, bw = 672;
      ctx.fillStyle = C.gold; ctx.fillRect(bx, 470, bw * (SUN_YEAR / JULIAN), 40);
      ctx.fillStyle = C.red; ctx.fillRect(bx + bw * (SUN_YEAR / JULIAN), 470, Math.max(6, bw * (SURPLUS / JULIAN) * 40), 40);
      font(700, 22); text('THE SUN 365.2422', bx, 450, { base: 'middle', color: C.gold });
      text(`+${MINUTES} MIN`, bx + bw, 450, { align: 'right', base: 'middle', color: C.red });
      font(400, 20, SERIF); text('the gap drawn 40 times wider', bx + bw, 532, { align: 'right', base: 'middle', color: C.soft });
      const n = Math.round(lerp(0, PER_DAY, eio(seg(t, 52.0, 54.0))));
      font(800, 56); text(`1 DAY / ${n} YEARS`, CX, 630, { align: 'center', base: 'middle', color: C.ink });
    });
  });
}

// ---------- G: 1582, and the months ----------
const OLD_ORDER = [['MARTIVS', 'I'], ['APRILIS', 'II'], ['MAIVS', 'III'], ['IVNIVS', 'IV'], ['QVINTILIS', 'V'], ['SEXTILIS', 'VI'], ['SEPTEMBER', 'VII'], ['OCTOBER', 'VIII'], ['NOVEMBER', 'IX'], ['DECEMBER', 'X']];
function sceneLegacy(t) {
  A(span(t, 55.2, 59.9, 0.4, 0.4), () => {
    // October 1582: ten days dropped
    font(700, 32); text('OCTOBER 1582', CX, 150, { align: 'center', base: 'middle', color: C.ink, spacing: '3px' });
    for (let d = 1; d <= 21; d++) {
      const day = d <= 4 ? d : d + 10, i = d - 1, x = 120 + (i % 7) * 92, y = 210 + Math.floor(i / 7) * 92;
      A(seg(t, 55.4 + i * 0.04, 55.8 + i * 0.04), () => {
        ctx.fillStyle = C.stone; k.rrect(x, y, 80, 80, 8); ctx.fill();
        font(700, 30); text(String(day), x + 40, y + 40, { align: 'center', base: 'middle', color: day === 15 ? C.red : C.ink });
      });
    }
    A(seg(t, 56.8, 57.6), () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(120 + 3 * 92 + 84, 214); ctx.lineTo(120 + 4 * 92 - 4, 286); ctx.stroke();
      font(400, 26, SERIF); text('Thursday 4 October, then Friday 15 October', CX, 610, { align: 'center', base: 'middle', color: C.soft });
    });
  });
  A(span(t, 59.8, 64.6, 0.4, 0.0), () => {
    font(700, 24); text('WHEN THE YEAR BEGAN IN MARCH', CX, 110, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    OLD_ORDER.forEach(([m, n], i) => {
      const v = seg(t, 60.0 + i * 0.12, 60.5 + i * 0.12);
      A(v, () => {
        const y = 160 + i * 56;
        font(700, 30); text(n, 260, y, { align: 'right', base: 'middle', color: C.red });
        const renamed = m === 'QVINTILIS' ? 'IVLIVS' : m === 'SEXTILIS' ? 'AVGVSTVS' : null;
        const morph = renamed ? seg(t, 61.8 + (m === 'SEXTILIS' ? 0.6 : 0), 62.6 + (m === 'SEXTILIS' ? 0.6 : 0)) : 0;
        font(700, 34);
        A(1 - morph, () => text(m, 300, y, { base: 'middle', color: m === 'SEPTEMBER' ? C.blue : C.ink }));
        if (renamed) A(morph, () => text(renamed, 300, y, { base: 'middle', color: C.gold }));
        if (renamed) A(morph, () => { font(400, 22, SERIF); text(m === 'QVINTILIS' ? 'July, 44 BC' : 'August, 8 BC', 640, y, { base: 'middle', color: C.soft }); });
        if (m === 'SEPTEMBER') A(seg(t, 62.0, 62.6), () => { font(400, 22, SERIF); text('septem = seven', 640, y, { base: 'middle', color: C.blue }); });
      });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [CAPS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneOld(t);
    sceneExtra(t);
    sceneDrift(t);
    sceneFix(t);
    sceneSlip(t);
    sceneLegacy(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 700, family: SERIF, ink: C.ink, marks: { '*': C.red, '~': C.blue, '^': C.gold } });
  },
});
