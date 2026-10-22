// Explainer for history-calendar-1752: the Julian year ran about 11 minutes long, the error piled up,
// Gregory's 1582 reform fixed it, and Britain caught up in 1752 by dropping 11 days.
// Look: an 18th-century printed almanac page. Laid paper with chain lines and foxing, a double-rule
// border, black letterpress with red-letter Sundays, a woodcut sun. Libre Caslon Text (Caslon being the
// English type of the period) in roman, italic and bold; one family only.
//
// Facts:
//  Wikipedia, "Gregorian calendar": the average Julian year is 365.25 days, "almost 11 minutes longer than
//  the mean tropical year" (365.24219 days), a drift of about three days every 400 years; by the reform a
//  drift of 10 days had built up since the Council of Nicaea (325), the vernal equinox falling "on 10 or 11
//  March instead of the ecclesiastically fixed date of 21 March"; Pope Gregory XIII's reform: Thursday
//  4 October 1582 was followed by Friday 15 October; "every year divisible by four is a leap year, except
//  for years that are divisible by 100 but not also divisible by 400" (97 leap days in 400 years, an
//  average of 365.2425 days); Britain adopted it in 1752, when the gap had grown to 11 days.
//  Wikipedia, "Calendar (New Style) Act 1750": Wednesday 2 September 1752 was followed by Thursday
//  14 September 1752, omitting 11 days.
// Computed below: the minutes per year (365.25 - 365.24219), the drift from 325 to 1582, the weekdays
// (Julian and Gregorian day numbers), the leap-year tests, the 97 leap days in 400 years and the Julian-
// Gregorian gap (10 days until February 1700, then 11).
//
// Scene plan (63 s; captions at y = 830, key elements above y = 750):
//  A  0.0–9.2   Hook. The September 1752 almanac page builds: 1, 2, 14, 15 … 30, nineteen days.
//               "Britain's September 1752 had only 19 days." / "Wednesday the 2nd … Thursday the 14th."
//  B1 9.0–19.8  Why. Four year slips 365, 365, 365, 366: average 365¼. The Sun's year 365.2422 days; a
//               clock dial fills an 11-minute wedge.
//  B2 19.6–29.0 The drift. A year counter runs AD 325 → 1582 while a woodcut sun (the spring equinox)
//               slides back along a March strip from the 21st to the 11th; drift counter to 9.8 days.
//  C1 28.8–34.2 October 1582: days 5–14 are lifted out; Thursday 4 meets Friday 15.
//  C2 34.0–46.2 The new rule: 1600 … 2000 tested for ÷4, ÷100, ÷400; tally 100 vs 97 leap days.
//  D  46.0–52.6 Britain waits: two timelines 1582 → 1752, the gap counter turns from 10 to 11 days at the
//               Julian-only leap day of 1700.
//  E  52.4–62.8 September 1752 again in the old layout; days 3–13 are struck out and fall away, 14–30
//               close up; the Wed and Thu columns light up.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  paper: '#F2E6CB', paperEdge: '#D9C49A', ink: '#2B1D12', inkSoft: 'rgba(43,29,18,0.66)',
  inkFaint: 'rgba(43,29,18,0.28)', red: '#A31D18', redSoft: 'rgba(163,29,24,0.45)', redWash: 'rgba(163,29,24,0.10)',
};
const SERIF = 'Caslon', ITAL = 'CaslonItalic';

let k, ctx;
const font = (weight, size, family = SERIF) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- the numbers ----------
const JULIAN_YEAR = (3 * 365 + 366) / 4;                  // 365.25
const TROPICAL = 365.24219;                               // mean tropical year, days
const MIN_PER_YEAR = (JULIAN_YEAR - TROPICAL) * 24 * 60;  // ≈ 11.2 minutes
const driftDays = (y) => (y - 325) * (JULIAN_YEAR - TROPICAL);
const DRIFT_1582 = driftDays(1582);                       // ≈ 9.8 days
const isLeapG = (y) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
let LEAP_G = 0;
for (let y = 1601; y <= 2000; y++) if (isLeapG(y)) LEAP_G++;  // 97
const LEAP_J = 400 / 4;                                    // 100
// Days between the calendars, valid from 1 March of a century year: floor(Y/100) - floor(Y/400) - 2.
const gap = (y) => Math.floor(y / 100) - Math.floor(y / 400) - 2;
const GAP_1582 = gap(1582), GAP_1752 = gap(1752);          // 10, 11
// Julian day numbers, for weekdays.
const jdJ = (y, m, d) => { const a = Math.floor((14 - m) / 12), Y = y + 4800 - a, M = m + 12 * a - 3; return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - 32083; };
const jdG = (y, m, d) => { const a = Math.floor((14 - m) / 12), Y = y + 4800 - a, M = m + 12 * a - 3; return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045; };
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const wday = (jd) => DAYS[jd % 7];
const SEPT1_COL = (jdJ(1752, 9, 1) + 1) % 7;               // column with Sunday first: Tuesday → 2
const OCT_4 = wday(jdJ(1582, 10, 4)), OCT_15 = wday(jdG(1582, 10, 15));   // Thursday, Friday
const SEP_2 = wday(jdJ(1752, 9, 2)), SEP_14 = wday(jdG(1752, 9, 14));     // Wednesday, Thursday
const DROPPED = 14 - 2 - 1;                                 // 11
const DAYS_LEFT = 30 - DROPPED;                             // 19

// ---------- timeline ----------
const T = { A: [0, 9.2], B1: [9.0, 19.8], B2: [19.6, 29.0], C1: [28.8, 34.2], C2: [34.0, 46.2], D: [46.0, 52.6], E: [52.4, 62.8] };
const CUES = [
  [0.4, 4.4, `Britain’s September 1752 had only *${DAYS_LEFT} days*.`],
  [4.6, 9.0, `${SEP_2} the *2nd* was followed by ${SEP_14} the *14th*.`],
  [9.2, 14.0, 'Why? The old Julian calendar added a leap day every fourth year.'],
  [14.2, 19.6, `That makes its average year *365¼ days*: about *${Math.round(MIN_PER_YEAR)} minutes* too long for the Sun.`],
  [19.8, 23.2, 'Year after year, those minutes piled up.'],
  [23.4, 28.8, 'By 1582 the spring equinox fell on *10 or 11 March*, not the 21st.'],
  [29.0, 34.0, `In 1582, Pope Gregory XIII’s reform cut *${GAP_1582} days* to put it right.`],
  [34.2, 40.4, 'It also changed the rule: a century year is a leap year only if it divides by *400*.'],
  [40.6, 46.0, `So 1700, 1800 and 1900 lost their leap days: *${LEAP_G}* in 400 years, not ${LEAP_J}.`],
  [46.2, 52.2, 'Britain kept the old calendar, and in 1700 it added a leap day the new one skipped.'],
  [52.4, 57.6, `By 1752 the gap was *${GAP_1752} days*, so Parliament dropped them all at once.`],
  [57.8, 62.6, `Only the dates jumped: the weekdays ran on, *${SEP_2}* then *${SEP_14}*.`],
];

// ---------- seeded noise ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the page, painted once ----------
let bg = null;
function paintPage() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(W / 2, H * 0.42, 120, W / 2, H / 2, 820);
  rad.addColorStop(0, '#F6ECD4'); rad.addColorStop(0.7, C.paper); rad.addColorStop(1, C.paperEdge);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  // laid lines and chain lines
  g.strokeStyle = 'rgba(120,90,50,0.035)'; g.lineWidth = 1;
  for (let y = 0; y < H; y += 3) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  g.strokeStyle = 'rgba(120,90,50,0.07)'; g.lineWidth = 2;
  for (let x = 18; x < W; x += 27) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  // fibres and specks
  const rnd = mulberry32(1752);
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * W, y = rnd() * H, a = 0.03 + rnd() * 0.07;
    g.fillStyle = `rgba(90,60,30,${a})`; g.fillRect(x, y, 1 + rnd() * 1.5, 1);
  }
  // foxing
  for (let i = 0; i < 22; i++) {
    const x = rnd() * W, y = rnd() * H, r = 6 + rnd() * 26;
    const fg = g.createRadialGradient(x, y, 0, x, y, r);
    fg.addColorStop(0, `rgba(150,95,40,${0.05 + rnd() * 0.07})`); fg.addColorStop(1, 'rgba(150,95,40,0)');
    g.fillStyle = fg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  // double-rule border
  g.strokeStyle = C.ink; g.lineWidth = 3; g.strokeRect(30, 30, W - 60, H - 60);
  g.lineWidth = 1.2; g.strokeRect(40, 40, W - 80, H - 80);
  // rule under the header and above the captions
  g.lineWidth = 1.2; g.strokeStyle = C.inkSoft;
  for (const y of [112, 742]) {
    g.beginPath(); g.moveTo(64, y); g.lineTo(W - 64, y); g.stroke();
    g.beginPath(); g.moveTo(64, y + 5); g.lineTo(W - 64, y + 5); g.stroke();
  }
  // a small printer's ornament in the middle of the caption rule
  g.fillStyle = C.paper; g.fillRect(W / 2 - 34, 736, 68, 16);
  g.fillStyle = C.red;
  for (const dx of [-20, 0, 20]) { g.beginPath(); g.moveTo(W / 2 + dx, 738); g.lineTo(W / 2 + dx + 6, 744.5); g.lineTo(W / 2 + dx, 751); g.lineTo(W / 2 + dx - 6, 744.5); g.closePath(); g.fill(); }
}

function header() {
  font(700, 22); text('RECKON', 66, 84, { color: C.red, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 3 * 6;
  font(400, 22, ITAL); text('History · the Calendar', 66 + w + 18, 84, { color: C.inkSoft });
}

// ---------- small drawing helpers ----------
function line(x0, y0, x1, y1, color = C.ink, w = 2) { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
function tick(x, y, s, p, color = C.ink) {
  // a hand-inked check mark drawn as it appears (p 0..1)
  if (p <= 0) return;
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const a = [x - s * 0.42, y], b = [x - s * 0.1, y + s * 0.34], c = [x + s * 0.48, y - s * 0.4];
  const q = clamp(p * 2), r = clamp(p * 2 - 1);
  ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(lerp(a[0], b[0], q), lerp(a[1], b[1], q));
  if (r > 0) ctx.lineTo(lerp(b[0], c[0], r), lerp(b[1], c[1], r));
  ctx.stroke();
}
function cross(x, y, s, p, color = C.red) {
  if (p <= 0) return;
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.15; ctx.lineCap = 'round';
  const q = clamp(p * 2), r = clamp(p * 2 - 1);
  ctx.beginPath(); ctx.moveTo(x - s * 0.36, y - s * 0.36); ctx.lineTo(x - s * 0.36 + s * 0.72 * q, y - s * 0.36 + s * 0.72 * q); ctx.stroke();
  if (r > 0) { ctx.beginPath(); ctx.moveTo(x + s * 0.36, y - s * 0.36); ctx.lineTo(x + s * 0.36 - s * 0.72 * r, y - s * 0.36 + s * 0.72 * r); ctx.stroke(); }
}
/** A woodcut sun: a disc with alternating straight and wavy rays. */
function sun(x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = C.red; ctx.strokeStyle = C.red; ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    ctx.save(); ctx.rotate(a);
    if (i % 2 === 0) { ctx.beginPath(); ctx.moveTo(r * 1.08, -r * 0.16); ctx.lineTo(r * 1.75, 0); ctx.lineTo(r * 1.08, r * 0.16); ctx.closePath(); ctx.fill(); }
    else {
      ctx.lineWidth = r * 0.09; ctx.beginPath(); ctx.moveTo(r * 1.1, 0);
      for (let j = 1; j <= 8; j++) ctx.lineTo(r * (1.1 + j * 0.06), Math.sin(j * 1.6) * r * 0.08);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, TAU); ctx.fill();
  // hatching inside, like a woodcut
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * 0.66, 0, TAU); ctx.clip();
  ctx.strokeStyle = C.redSoft; ctx.lineWidth = Math.max(1, r * 0.05);
  for (let u = -r; u <= r; u += r * 0.17) { ctx.beginPath(); ctx.moveTo(u, -r); ctx.lineTo(u + r * 0.4, r); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, TAU); ctx.fill();
  ctx.restore();
}
/** A small almanac slip (a card with a double border). */
function slip(x, y, w, h, { fill = 'rgba(255,250,236,0.75)', stroke = C.ink, red = false } = {}) {
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = red ? C.red : stroke; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 0.8; ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
}

// ---------- the September 1752 grid (scenes A and E) ----------
const GRID = { x0: 132, dx: 100, y0: 410, dy: 72 };
const cellX = (c) => GRID.x0 + c * GRID.dx, cellY = (r) => GRID.y0 + r * GRID.dy;
const oldPos = (d) => { const i = d - 1 + SEPT1_COL; return [i % 7, Math.floor(i / 7)]; };
const newPos = (d) => (d <= 2 ? oldPos(d) : (() => { const i = d - 14 + SEPT1_COL + 2; return [i % 7, Math.floor(i / 7)]; })());
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function monthTitle(name, year, a = 1, y = 196) {
  withAlpha(a, () => {
    font(400, 66); text(name, W / 2, y, { align: 'center', spacing: '10px' });
    font(700, 38); text(String(year), W / 2, y + 60, { color: C.red, align: 'center', spacing: '6px' });
    line(W / 2 - 150, y + 86, W / 2 + 150, y + 86, C.inkSoft, 1.2);
  });
}
function weekdayRow(hl = 0, y = 338) {
  font(400, 26, ITAL);
  for (let c = 0; c < 7; c++) {
    const lit = (c === 3 || c === 4) ? hl : 0;
    if (lit > 0) withAlpha(lit, () => { ctx.fillStyle = C.redWash; ctx.fillRect(cellX(c) - 44, y - 30, 88, 44 + 3 * GRID.dy + 20); });
    text(WD[c], cellX(c), y, { color: c === 0 ? C.red : lit > 0.5 ? C.red : C.inkSoft, align: 'center', base: 'middle' });
  }
  line(GRID.x0 - 56, y + 26, cellX(6) + 56, y + 26, C.inkSoft, 1.2);
}
function dayNum(d, x, y, sunday, a = 1, size = 48) {
  withAlpha(a, () => { font(400, size); text(String(d), x, y, { color: sunday ? C.red : C.ink, align: 'center', base: 'middle' }); });
}

function sceneA(t) {
  monthTitle('SEPTEMBER', 1752, eout(seg(t, 0.1, 0.8)));
  withAlpha(eout(seg(t, 0.4, 1.0)), () => weekdayRow(0));
  const days = [1, 2, ...Array.from({ length: 17 }, (_, i) => 14 + i)];
  days.forEach((d, i) => {
    const [c, r] = newPos(d);
    const p = eout(seg(t, 0.8 + i * 0.09, 1.3 + i * 0.09));
    dayNum(d, cellX(c), cellY(r) + (1 - p) * 14, c === 0, p);
  });
  // rings round the 2nd and the 14th, with an arc between them
  const ring = eout(seg(t, 5.0, 5.8));
  if (ring > 0) {
    ctx.strokeStyle = C.red; ctx.lineWidth = 3.5;
    for (const d of [2, 14]) { const [c, r] = newPos(d); ctx.beginPath(); ctx.arc(cellX(c), cellY(r), 36, -Math.PI / 2, -Math.PI / 2 + TAU * ring); ctx.stroke(); }
    const [c2] = newPos(2), [c14] = newPos(14);
    const arc = eout(seg(t, 5.8, 6.6));
    if (arc > 0) {
      ctx.lineWidth = 3; ctx.beginPath();
      const x0 = cellX(c2) + 10, x1 = cellX(c14) - 10, y = cellY(0) - 44;
      for (let j = 0; j <= 24 * arc; j++) { const u = j / 24; const x = lerp(x0, x1, u), yy = y - Math.sin(Math.PI * u) * 30; j ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.stroke();
    }
  }
  // a tally of the days actually printed
  withAlpha(eout(seg(t, 2.6, 3.2)) * (1 - seg(t, 8.6, 9.1)), () => {
    font(400, 26, ITAL); text(`${DAYS_LEFT} days in all`, W / 2, 680, { color: C.red, align: 'center', base: 'middle' });
  });
}

// ---------- B1: the leap cycle and the 11 minutes ----------
function sceneB1(t) {
  font(400, 30, ITAL); withAlpha(eout(seg(t, 9.2, 9.8)), () => text('The Julian calendar, every four years', W / 2, 168, { color: C.inkSoft, align: 'center', base: 'middle' }));
  const vals = [365, 365, 365, 366];
  for (let i = 0; i < 4; i++) {
    const p = eout(seg(t, 9.6 + i * 0.45, 10.3 + i * 0.45));
    const x = 120 + i * 162, y = 206;
    withAlpha(p, () => {
      ctx.save(); ctx.translate(0, (1 - p) * 18);
      slip(x, y, 136, 150, { red: i === 3 });
      font(400, 54); text(String(vals[i]), x + 68, y + 72, { color: i === 3 ? C.red : C.ink, align: 'center', base: 'middle' });
      font(400, 22, ITAL); text(i === 3 ? 'leap year' : 'days', x + 68, y + 120, { color: i === 3 ? C.red : C.inkSoft, align: 'center', base: 'middle' });
      ctx.restore();
    });
  }
  // the average
  withAlpha(eout(seg(t, 12.2, 12.9)), () => {
    font(400, 30, ITAL); text('average', 300, 420, { color: C.inkSoft, align: 'right', base: 'middle' });
    font(700, 44); text(`${JULIAN_YEAR.toFixed(2)} days`, 320, 420, { base: 'middle' });
  });
  withAlpha(eout(seg(t, 14.4, 15.1)), () => {
    font(400, 30, ITAL); text('the Sun', 300, 478, { color: C.inkSoft, align: 'right', base: 'middle' });
    font(700, 44); text(`${TROPICAL.toFixed(4)} days`, 320, 478, { color: C.red, base: 'middle' });
  });
  // a clock dial: the extra minutes as a red wedge
  const dp = eout(seg(t, 15.4, 16.2));
  withAlpha(dp, () => {
    const cx = W / 2, cy = 616, r = 82;
    ctx.fillStyle = 'rgba(255,250,236,0.8)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r - 7, 0, TAU); ctx.stroke();
    for (let m = 0; m < 60; m++) {
      const a = (m / 60) * TAU - Math.PI / 2, l = m % 5 === 0 ? 12 : 5;
      line(cx + Math.cos(a) * (r - 8), cy + Math.sin(a) * (r - 8), cx + Math.cos(a) * (r - 8 - l), cy + Math.sin(a) * (r - 8 - l), C.ink, m % 5 === 0 ? 2.4 : 1);
    }
    const wedge = (MIN_PER_YEAR / 60) * eio(seg(t, 16.2, 17.8));
    ctx.fillStyle = 'rgba(163,29,24,0.75)'; ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r - 22, -Math.PI / 2, -Math.PI / 2 + wedge * TAU); ctx.closePath(); ctx.fill();
    const ha = -Math.PI / 2 + wedge * TAU;
    line(cx, cy, cx + Math.cos(ha) * (r - 18), cy + Math.sin(ha) * (r - 18), C.ink, 3.5);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, TAU); ctx.fill();
    withAlpha(eout(seg(t, 17.4, 18.0)), () => {
      font(700, 34); text(`+${Math.round(MIN_PER_YEAR)} min`, cx + r + 26, cy - 12, { color: C.red, base: 'middle' });
      font(400, 24, ITAL); text('every year', cx + r + 26, cy + 22, { color: C.inkSoft, base: 'middle' });
    });
  });
}

// ---------- B2: the equinox drifts back ----------
const STRIP = { d0: 8, d1: 23, x0: 92, dx: 45, y: 520 };
const stripX = (d) => STRIP.x0 + (d - STRIP.d0) * STRIP.dx;
function sceneB2(t) {
  const run = eio(seg(t, 20.4, 27.4));
  const year = Math.round(lerp(325, 1582, run));
  const drift = driftDays(lerp(325, 1582, run));
  // the year counter
  font(400, 30, ITAL); text(year < 1000 ? 'AD' : '', W / 2 - 118, 238, { color: C.inkSoft, align: 'right', base: 'middle' });
  font(400, 108); text(String(year), W / 2, 236, { align: 'center', base: 'middle' });
  font(400, 26, ITAL);
  withAlpha(1 - seg(t, 20.6, 21.2), () => text('the Council of Nicaea', W / 2, 314, { color: C.inkSoft, align: 'center', base: 'middle' }));
  withAlpha(seg(t, 20.8, 21.4), () => text(`calendar ahead of the Sun by ${drift.toFixed(1)} days`, W / 2, 314, { color: C.red, align: 'center', base: 'middle' }));
  // the March strip
  font(700, 24); text('MARCH', STRIP.x0 - 22, STRIP.y - 64, { color: C.ink, spacing: '4px', base: 'middle' });
  for (let d = STRIP.d0; d <= STRIP.d1; d++) {
    const x = stripX(d);
    ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 1; ctx.strokeRect(x - STRIP.dx / 2, STRIP.y - 26, STRIP.dx, 52);
    font(400, 26); text(String(d), x, STRIP.y + 2, { color: d === 21 ? C.red : C.ink, align: 'center', base: 'middle' });
  }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(stripX(STRIP.d0) - STRIP.dx / 2, STRIP.y - 26, (STRIP.d1 - STRIP.d0 + 1) * STRIP.dx, 52);
  // the fixed date, 21 March
  const fx = stripX(21);
  line(fx, STRIP.y + 30, fx, STRIP.y + 70, C.red, 2);
  font(400, 22, ITAL); text('21 March, fixed', fx, STRIP.y + 92, { color: C.red, align: 'center', base: 'middle' });
  text('by the Church', fx, STRIP.y + 118, { color: C.red, align: 'center', base: 'middle' });
  // the sun: the real equinox, sliding back along the calendar
  const sx = stripX(21 - drift);
  sun(sx, STRIP.y - 88, 20, t * 0.15);
  font(400, 22, ITAL); text('spring equinox', sx, STRIP.y - 136, { color: C.ink, align: 'center', base: 'middle' });
  if (drift > 0.3) {
    ctx.setLineDash([6, 7]); line(sx + 26, STRIP.y - 88, fx, STRIP.y - 88, C.redSoft, 2); ctx.setLineDash([]);
  }
}

// ---------- C1: October 1582 ----------
function sceneC1(t) {
  monthTitle('OCTOBER', 1582, 1, 186);
  const lift = seg(t, 30.4, 32.2);
  const close = eio(seg(t, 31.8, 33.0));
  const n = 12, dx = 58, x0 = W / 2 - ((n - 1) * dx) / 2, y = 420;
  for (let i = 0; i < n; i++) {
    const d = 4 + i;
    if (d === 4 || d === 15) continue;
    const p = eio(clamp((lift - (i - 1) * 0.05) / 0.55));
    withAlpha(1 - p, () => {
      ctx.save(); ctx.translate(x0 + i * dx, y - p * 90); ctx.rotate((i % 2 ? 1 : -1) * p * 0.4);
      slip(-24, -32, 48, 64, { fill: 'rgba(255,250,236,0.6)', stroke: C.inkSoft });
      font(400, 26); text(String(d), 0, 2, { color: C.inkSoft, align: 'center', base: 'middle' });
      ctx.restore();
    });
  }
  const xa = lerp(x0, W / 2 - 92, close), xb = lerp(x0 + (n - 1) * dx, W / 2 + 92, close);
  for (const [x, d, wd] of [[xa, 4, OCT_4], [xb, 15, OCT_15]]) {
    const big = close;
    const w = lerp(48, 168, big), h = lerp(64, 196, big);
    slip(x - w / 2, y - h / 2, w, h, { red: d === 15 && big > 0.5 });
    font(400, lerp(26, 80, big)); text(String(d), x, y - lerp(0, 18, big), { color: d === 15 ? C.red : C.ink, align: 'center', base: 'middle' });
    withAlpha(seg(big, 0.6, 1), () => { font(400, 26, ITAL); text(wd, x, y + 58, { color: C.inkSoft, align: 'center', base: 'middle' }); });
  }
  withAlpha(eout(seg(t, 32.6, 33.2)), () => {
    font(400, 28, ITAL); text(`${GAP_1582} days omitted`, W / 2, 600, { color: C.red, align: 'center', base: 'middle' });
  });
}

// ---------- C2: the century rule ----------
const CENT = [1600, 1700, 1800, 1900, 2000];
function sceneC2(t) {
  font(400, 30, ITAL); withAlpha(eout(seg(t, 34.3, 34.9)), () => text('The Gregorian rule for century years', W / 2, 160, { color: C.inkSoft, align: 'center', base: 'middle' }));
  const rows = [['÷ 4', 4], ['÷ 100', 100], ['÷ 400', 400]];
  withAlpha(eout(seg(t, 35.0, 35.6)), () => {
    font(400, 26, ITAL);
    rows.forEach(([lab], j) => text(lab, 112, 318 + j * 56, { color: C.inkSoft, align: 'right', base: 'middle' }));
  });
  CENT.forEach((y, i) => {
    const x = 196 + i * 132;
    const p = eout(seg(t, 34.6 + i * 0.2, 35.3 + i * 0.2));
    withAlpha(p, () => {
      slip(x - 56, 200, 112, 70);
      font(700, 32); text(String(y), x, 237, { align: 'center', base: 'middle' });
    });
    rows.forEach(([, n], j) => {
      const q = seg(t, 36.0 + j * 1.0 + i * 0.12, 36.5 + j * 1.0 + i * 0.12);
      if (y % n === 0) tick(x, 318 + j * 56, 30, q); else cross(x, 318 + j * 56, 30, q, C.inkSoft);
    });
    const leap = isLeapG(y);
    const v = eout(seg(t, 39.4 + i * 0.18, 39.9 + i * 0.18));
    withAlpha(v, () => {
      ctx.save(); ctx.translate(x, 500); ctx.scale(0.8 + 0.2 * back(v), 0.8 + 0.2 * back(v));
      font(700, 24); text(leap ? 'LEAP' : 'NOT', 0, -12, { color: leap ? C.ink : C.red, align: 'center', base: 'middle', spacing: '2px' });
      text(leap ? 'YEAR' : 'LEAP', 0, 16, { color: leap ? C.ink : C.red, align: 'center', base: 'middle', spacing: '2px' });
      ctx.strokeStyle = leap ? C.ink : C.red; ctx.lineWidth = 2; ctx.strokeRect(-48, -34, 96, 68);
      ctx.restore();
    });
  });
  // the tally: leap days in 400 years
  const tp = eout(seg(t, 41.4, 42.2));
  withAlpha(tp, () => {
    line(120, 568, W - 120, 568, C.inkFaint, 1);
    font(400, 26, ITAL); text('leap days in 400 years', W / 2, 600, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(400, 30); text('Julian', W / 2 - 160, 646, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(700, 56); text(String(LEAP_J), W / 2 - 160, 698, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(400, 30); text('Gregorian', W / 2 + 160, 646, { color: C.red, align: 'center', base: 'middle' });
    const shown = Math.round(lerp(LEAP_J, LEAP_G, eio(seg(t, 42.4, 43.6))));
    font(700, 56); text(String(shown), W / 2 + 160, 698, { color: C.red, align: 'center', base: 'middle' });
    font(400, 40); text('→', W / 2, 690, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- D: Britain waits ----------
const D_RUN = [47.0, 51.4];
const yearD = (t) => lerp(1582, 1752, eio(seg(t, ...D_RUN)));
let T1700 = D_RUN[0];
while (yearD(T1700) < 1700) T1700 += 0.01;   // when the marker passes 1700
function sceneD(t) {
  const x0 = 130, x1 = 734, yOld = 300, yNew = 470;
  const X = (y) => lerp(x0, x1, (y - 1582) / (1752 - 1582));
  const yr = yearD(t);
  font(700, 24); text('BRITAIN · OLD STYLE', x0, yOld - 46, { spacing: '2px', base: 'middle' });
  text('GREGORIAN · NEW STYLE', x0, yNew - 46, { color: C.red, spacing: '2px', base: 'middle' });
  for (const [y, col] of [[yOld, C.ink], [yNew, C.red]]) {
    line(x0, y, x1, y, col, 3);
    for (const yy of [1582, 1600, 1650, 1700, 1752]) {
      line(X(yy), y - 10, X(yy), y + 10, col, 2);
    }
  }
  font(400, 22, ITAL);
  for (const yy of [1582, 1700, 1752]) text(String(yy), X(yy), yNew + 36, { color: C.inkSoft, align: 'center', base: 'middle' });
  // the moving marker
  const mx = X(yr);
  line(mx, yOld - 4, mx, yNew + 4, C.inkSoft, 1.5);
  for (const [y, col] of [[yOld, C.ink], [yNew, C.red]]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(mx, y, 8, 0, TAU); ctx.fill(); }
  // 29 February 1700: in the old calendar only; it pops up as the marker passes 1700
  const leapP = eout(seg(t, T1700 - 0.1, T1700 + 0.5));
  withAlpha(leapP, () => {
    const lx = X(1700);
    ctx.save(); ctx.translate(lx, yOld - 96); ctx.scale(0.8 + 0.2 * back(leapP), 0.8 + 0.2 * back(leapP));
    slip(-50, -34, 100, 68, { red: true });
    font(700, 26); text('29 Feb', 0, -6, { color: C.red, align: 'center', base: 'middle' });
    font(400, 20, ITAL); text('1700', 0, 18, { color: C.inkSoft, align: 'center', base: 'middle' });
    ctx.restore();
    font(400, 22, ITAL); text('no 29 Feb', lx, yNew + 84, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
  // the gap counter, from the year under the marker
  const bump = seg(t, T1700, T1700 + 0.3) * (1 - seg(t, T1700 + 0.3, T1700 + 0.9));
  ctx.save(); ctx.translate(W / 2, 676); ctx.scale(1 + 0.12 * bump, 1 + 0.12 * bump);
  font(400, 26, ITAL); text('gap between the calendars', 0, -44, { color: C.inkSoft, align: 'center', base: 'middle' });
  font(700, 64); text(`${gap(Math.floor(yr))} days`, 0, 12, { color: C.red, align: 'center', base: 'middle' });
  ctx.restore();
}

// ---------- E: the eleven days drop out ----------
function sceneE(t) {
  monthTitle('SEPTEMBER', 1752);
  const hl = eout(seg(t, 58.2, 58.9));
  weekdayRow(hl);
  const strike = seg(t, 53.4, 55.0), fall = seg(t, 54.8, 56.6);
  const rnd = mulberry32(11);
  const flying = [];
  for (let d = 1; d <= 30; d++) {
    const [c0, r0] = oldPos(d);
    const dropped = d >= 3 && d <= 13;
    const sx = rnd() * 2 - 1, rot = rnd() * 2 - 1;
    if (dropped) {
      const s = clamp((strike - (d - 3) * 0.06) / 0.4);
      const f = eio(clamp((fall - (d - 3) * 0.05) / 0.6));
      withAlpha(1 - f, () => {
        ctx.save(); ctx.translate(cellX(c0) + sx * 40 * f, cellY(r0) + f * 160); ctx.rotate(rot * 0.7 * f);
        font(400, 48); text(String(d), 0, 0, { color: c0 === 0 ? C.red : C.ink, align: 'center', base: 'middle' });
        if (s > 0) line(-28, 4, -28 + 56 * eout(s), -4, C.red, 4);
        ctx.restore();
      });
      continue;
    }
    const [c1, r1] = newPos(d);
    // each day moves once the day before it has, so it always lands on a free square
    const m = d < 14 ? 0 : eio(seg(t, 55.9 + (d - 14) * 0.13, 56.45 + (d - 14) * 0.13));
    const lift = Math.sin(Math.PI * m);
    const x = lerp(cellX(c0), cellX(c1), m), y = lerp(cellY(r0), cellY(r1), m) - lift * 16;
    const sundayNow = (m < 0.5 ? c0 : c1) === 0;
    const draw = () => {
      if (lift > 0.02) withAlpha(lift, () => { ctx.fillStyle = 'rgba(255,250,236,0.92)'; ctx.fillRect(x - 34, y - 30, 68, 60); ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 1; ctx.strokeRect(x - 34, y - 30, 68, 60); });
      dayNum(d, x, y, sundayNow, 1, 48 + lift * 6);
    };
    if (lift > 0.02) flying.push(draw); else draw();
  }
  for (const draw of flying) draw();
  const ring = eout(seg(t, 58.6, 59.4));
  if (ring > 0) {
    ctx.strokeStyle = C.red; ctx.lineWidth = 3.5;
    for (const d of [2, 14]) { const [c, r] = newPos(d); ctx.beginPath(); ctx.arc(cellX(c), cellY(r), 36, -Math.PI / 2, -Math.PI / 2 + TAU * ring); ctx.stroke(); }
  }
  withAlpha(eout(seg(t, 59.4, 60.0)), () => {
    font(400, 26, ITAL); text(`${DROPPED} days omitted, the weekdays unbroken`, W / 2, 680, { color: C.red, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 40, lh: 52, weight: 400, maxW: 760 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SERIF, ink: C.ink, marks: { '*': C.red } });
  }
}

Kit.scene({
  width: W, height: H, duration: 62.8,
  fonts: [
    { family: SERIF, file: 'LibreCaslonText-Regular.woff2', weight: '400' },
    { family: SERIF, file: 'LibreCaslonText-Bold.woff2', weight: '700' },
    { family: ITAL, file: 'LibreCaslonText-Italic.woff2', weight: '400' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintPage();
    ctx.drawImage(bg, 0, 0);
    header();
    const scenes = [[sceneA, T.A, 0], [sceneB1, T.B1], [sceneB2, T.B2], [sceneC1, T.C1], [sceneC2, T.C2], [sceneD, T.D], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
