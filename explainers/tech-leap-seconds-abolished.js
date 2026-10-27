// Explainer for tech-leap-seconds-abolished: on 15 October 2026 the General Conference on Weights and Measures
// voted to stop leap seconds, so that UTC runs on without them from 20 May 2027. Look: night-time LED displays,
// amber digits on a dark teal-black, a cyan caesium atom for atomic time, a blue-green Earth for the day, and
// magenta for the extra (or missing) second. Bungee for clock digits and big labels, Barlow for captions.
//
// Computed here: the 27 leap seconds placed from the published table (end of June or December, 1972–2016,
// 11 in June and 16 in December); 3 ms a day over 365.25 days, about 1.1 s a year; a stopwatch read on a clock
// that repeats 23:59:59, which gives a negative time.
// Facts: BIPM, Resolution 5 of the 28th CGPM (2026): continuous UTC from 20 May 2027; |UT1 − UTC| may reach
// 3,600 s (1 hour); a negative leap second has never been applied and is considered a high risk; a 2025 CCTF/IERS
// workshop estimated its probability reaches 30% by 2035. Euronews (16 October 2026): the vote was on Thursday
// 15 October 2026 at the 28th meeting in Versailles; 27 leap seconds since 1972, the last at the end of 2016.
// Wikipedia, "Leap second": UTC was kept within 0.9 s of UT1; a positive leap second is 23:59:60; Linux gives
// it the counter value of 23:59:59; average day about 86,400.003 s in 1972 and 86,400.001 s in 2016; the
// shortest day recorded, 29 June 2022, was 1.59 ms short of 24 hours; leap-second bugs in 2012 hit Reddit,
// Mozilla and Qantas, and Cloudflare's DNS computed a negative time at the 2016 one. Wikipedia, "Second": since
// 1967 the second is 9,192,631,770 periods of the caesium-133 hyperfine transition.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The vote, and a minute with 61 seconds.
//  B  9.2–23.0  Atomic seconds against the Earth's spin; days a few milliseconds long.
//  C 23.0–37.0  The drift adds up; UTC waits for the Earth; 27 leap seconds on a timeline.
//  D 37.0–51.0  Computers repeat 23:59:59; a timer reads less than zero; the 2012 and 2016 bugs.
//  E 51.0–64.6  A faster Earth and the risk of a negative leap second; from 20 May 2027, up to an hour.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#081016', bg2: '#0f2430', ink: '#f2f5f7', soft: 'rgba(242,245,247,0.70)', faint: 'rgba(242,245,247,0.20)',
  amber: '#ffb21a', amberDim: 'rgba(255,178,26,0.10)', cyan: '#4fd8e8', magenta: '#ff4f7b', earth: '#2f74c8', land: '#3fb37f',
  panel: 'rgba(4,10,14,0.78)', sun: '#ffd36b',
};
const BIG = 'Bungee', SANS = 'Barlow';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const fmt = (n) => n.toLocaleString('en-US');

// ---------- the numbers ----------
// Leap seconds by year: [year, at the end of 30 June, at the end of 31 December]
const TABLE = [[1972, 1, 1], [1973, 0, 1], [1974, 0, 1], [1975, 0, 1], [1976, 0, 1], [1977, 0, 1], [1978, 0, 1], [1979, 0, 1],
  [1981, 1, 0], [1982, 1, 0], [1983, 1, 0], [1985, 1, 0], [1987, 0, 1], [1989, 0, 1], [1990, 0, 1], [1992, 1, 0], [1993, 1, 0],
  [1994, 1, 0], [1995, 0, 1], [1997, 1, 0], [1998, 0, 1], [2005, 0, 1], [2008, 0, 1], [2012, 1, 0], [2015, 1, 0], [2016, 0, 1]];
const LEAPS = TABLE.flatMap(([y, jun, dec]) => [...(jun ? [y + 0.5] : []), ...(dec ? [y + 1] : [])]); // moments, in years
const N_LEAPS = LEAPS.length; // 27
const CAESIUM = 9192631770;
const DAY_1972_MS = 3, DAY_2016_MS = 1, SHORTEST_MS = 1.59;
const DRIFT_PER_YEAR = (DAY_1972_MS / 1000) * 365.25; // ≈ 1.1 s
const TOLERANCE_OLD = 0.9, TOLERANCE_NEW = 3600;

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 15 October 2026, the General Conference on Weights and Measures voted to end *leap seconds*.'],
  [4.8, 9.0, 'A leap second gives a minute *61 seconds*: 23:59:59, then ~23:59:60~, then midnight.'],
  [9.2, 13.6, `*Coordinated Universal Time* (UTC) runs on ^atomic clocks^: ${fmt(CAESIUM)} caesium ticks a second.`],
  [13.8, 18.2, 'But the day comes from the *Earth’s spin*, and that is not quite as steady.'],
  [18.4, 22.8, `In 1972 an average day ran about *${DAY_1972_MS} ms* past 86,400 seconds; in 2016, about ${DAY_2016_MS} ms.`],
  [23.0, 27.4, `Milliseconds add up: ${DAY_1972_MS} ms a day comes to over *a second a year*.`],
  [27.6, 32.0, `To stay within *${TOLERANCE_OLD} s* of the Earth, UTC waited a second for it, in June or December.`],
  [32.2, 36.6, `That happened *${N_LEAPS} times*, from 1972 to the last one, on 31 December 2016.`],
  [36.8, 41.2, 'Many computers can’t show 23:59:60. The Linux system, for one, repeats ~23:59:59~.'],
  [41.4, 45.8, 'So the clock steps back a second, and a timer can measure ~less than zero~.'],
  [46.0, 50.4, 'In 2012, leap-second bugs hit Reddit and the airline Qantas; in 2016, the web firm Cloudflare.'],
  [50.6, 55.0, `Lately the Earth has spun ^faster^: on 29 June 2022 the day was *${SHORTEST_MS} ms* short.`],
  [55.2, 59.6, 'A 2025 meeting of time experts put the odds of a first ~negative~ leap second at 30% by 2035.'],
  [59.8, 64.2, 'So from *20 May 2027* UTC simply runs on, and may drift up to *an hour* from the Earth.'],
];

// ---------- background: a field of faint LED dots ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,178,26,0.045)';
  for (let y = 12; y < H; y += 18) for (let x = 12; x < W; x += 18) { g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill(); }
}

/** A clock face in LED digits; `hot` marks characters to draw in magenta. */
function led(s, x, y, size, { color = C.amber, hot = [], align = 'center', ghost = true } = {}) {
  k.font(400, size, BIG);
  ctx.textBaseline = 'middle'; ctx.letterSpacing = '0px';
  const widths = [...s].map((ch) => ctx.measureText(ch).width), total = widths.reduce((a, b) => a + b, 0);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  [...s].forEach((ch, i) => {
    if (ghost && /\d/.test(ch)) { ctx.fillStyle = C.amberDim; ctx.textAlign = 'left'; ctx.fillText('8', cx, y); }
    ctx.fillStyle = hot.includes(i) ? C.magenta : color; ctx.textAlign = 'left'; ctx.fillText(ch, cx, y);
    cx += widths[i];
  });
}

function panel(x, y, w, h, r = 14) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, r); ctx.fill(); }

// ---------- A: the vote and the 61-second minute ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.5);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 0.9)), () => {
      font(700, 26); text('28TH GENERAL CONFERENCE ON WEIGHTS AND MEASURES', W / 2, 150, { color: C.soft, align: 'center', spacing: '1px' });
      font(600, 26); text('Versailles · 15 October 2026', W / 2, 190, { color: C.soft, align: 'center' });
    });
    // the display: 23:59:60 as the hook, then the minute ticking through it
    let s = '23:59:60', hot = [6, 7];
    if (t > 5.0) {
      const steps = ['23:59:58', '23:59:59', '23:59:60', '00:00:00'];
      const i = clamp(Math.floor((t - 5.0) / 1.0), 0, 3);
      s = steps[i]; hot = i === 2 ? [6, 7] : [];
    }
    A(eout(seg(t, 0.4, 1.1)), () => {
      panel(70, 280, 724, 200, 22);
      led(s, W / 2, 384, 118, { hot });
    });
    A(span(t, 0.8, 4.8, 0.4, 0.4), () => { k.font(400, 34, BIG); text('LEAP SECOND', W / 2, 540, { color: C.magenta, align: 'center', spacing: '3px' }); });
    // 61 ticks of one minute
    A(eout(seg(t, 5.0, 5.6)), () => {
      const x0 = 92, w = 680, n = 61;
      for (let i = 0; i < n; i++) {
        const x = x0 + (i / (n - 1)) * w, lit = i <= Math.floor((t - 5.0) * 15);
        ctx.fillStyle = i === 60 ? C.magenta : lit ? C.amber : C.faint;
        ctx.fillRect(x - 3, 560, 6, i % 5 === 0 || i === 60 ? 40 : 24);
      }
      font(600, 24); text('second 61', x0 + w, 630, { color: C.magenta, align: 'right' });
      text('second 1', x0, 630, { color: C.soft });
    });
  });
}

// ---------- B: atomic seconds against the spinning Earth ----------
function earth(x, y, r, rot) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = C.earth; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  // continents as blobs that slide past as it turns
  for (let i = 0; i < 6; i++) {
    const lon = ((rot + i * 1.05) % (Math.PI * 2)) - Math.PI;
    if (Math.abs(lon) > Math.PI / 2 + 0.4) continue;
    const bx = x + Math.sin(lon) * r * 0.9, by = y + (i % 3 - 1) * r * 0.42;
    ctx.fillStyle = C.land; ctx.beginPath(); ctx.ellipse(bx, by, Math.max(1, r * 0.22 * Math.cos(Math.min(1.5, Math.abs(lon) * 0.8))), r * 0.16, 0.3 * i, 0, Math.PI * 2); ctx.fill();
  }
  // night side
  const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.55, 'rgba(0,0,0,0.05)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
}

function atom(x, y, r, t) {
  ctx.strokeStyle = 'rgba(79,216,232,0.55)'; ctx.lineWidth = 2.5;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.36, (i * Math.PI) / 3, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(x, y, r * 0.18, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 3; i++) {
    const ang = t * 5 + i * 2.1, rot = (i * Math.PI) / 3;
    const ex = Math.cos(ang) * r, ey = Math.sin(ang) * r * 0.36;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x + ex * Math.cos(rot) - ey * Math.sin(rot), y + ex * Math.sin(rot) + ey * Math.cos(rot), 5, 0, Math.PI * 2); ctx.fill();
  }
}

function sceneClocks(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // atomic clock, left
    A(eout(seg(t, 9.3, 10.0)), () => {
      panel(48, 120, 372, 430, 18);
      atom(234, 260, 96, t);
      font(700, 26); text('ATOMIC TIME', 234, 400, { color: C.cyan, align: 'center', spacing: '2px' });
      const ticks = Math.floor(((t - 9.4) % 2.2) / 2.2 * CAESIUM);
      led(fmt(Math.max(0, ticks)).padStart(13, ' '), 234, 460, 30, { color: C.cyan, ghost: false });
      font(500, 22); text('ticks, then 1 second', 234, 510, { color: C.soft, align: 'center' });
    });
    // the Earth, right
    A(eout(seg(t, 13.8, 14.5)), () => {
      panel(444, 120, 372, 430, 18);
      ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(474, 190, 16, 0, Math.PI * 2); ctx.fill();
      earth(630, 272, 104, t * 0.9);
      font(700, 26); text('THE EARTH’S DAY', 630, 420, { color: C.land, align: 'center', spacing: '2px' });
      led('24:00:00', 630, 470, 34, { color: C.ink, ghost: false });
      font(500, 22); text('one turn, from noon to noon', 630, 514, { color: C.soft, align: 'center' });
    });
    // day lengths: 86,400 s plus a few milliseconds
    A(span(t, 18.4, 23.0, 0.4, 0.4), () => {
      panel(48, 580, 768, 150, 14);
      const base = 150, x0 = 300, msPx = 120;
      font(600, 24);
      [[1972, DAY_1972_MS, 622], [2016, DAY_2016_MS, 682]].forEach(([yr, ms, y], i) => {
        const g = eout(seg(t, 18.8 + i * 0.6, 19.6 + i * 0.6));
        text(String(yr), 76, y, { color: C.soft });
        ctx.fillStyle = 'rgba(242,245,247,0.25)'; ctx.fillRect(160, y - 14, x0 - 160, 28);
        text('86,400 s', 172, y, { color: C.ink });
        ctx.fillStyle = C.amber; ctx.fillRect(x0, y - 14, ms * msPx * g, 28);
        A(g, () => text(`+ ${ms} ms`, x0 + ms * msPx + 14, y, { color: C.amber }));
      });
    });
  });
}

// ---------- C: the drift adds up; leap seconds keep UTC close ----------
const GRAPH = { x0: 96, x1: 780, y0: 190, y1: 560 }; // years 1972 → 2017 on x, UT1 − UTC from +0.9 to −0.9 on y
const gx = (yr) => lerp(GRAPH.x0, GRAPH.x1, (yr - 1972) / 45);
const gy = (v) => lerp(GRAPH.y0, GRAPH.y1, (0.9 - v) / 1.8);

function sceneDrift(t) {
  const a = span(t, 23.0, 37.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // a year of 3 ms days
    A(span(t, 23.0, 27.6, 0.4, 0.4), () => {
      panel(60, 160, 744, 380, 18);
      const p = eio(seg(t, 23.6, 26.6)), days = Math.round(p * 365);
      font(600, 26); text('days', 110, 230, { color: C.soft });
      led(String(days).padStart(3, '0'), 300, 230, 54, {});
      font(600, 26); text('Earth behind the atomic clock', 110, 330, { color: C.soft });
      led(((days * DAY_1972_MS) / 1000).toFixed(2), 650, 330, 54, { align: 'right' });
      k.font(400, 40, BIG); text('S', 668, 330, { color: C.amber });
      ctx.fillStyle = C.faint; ctx.fillRect(110, 420, 640, 30);
      ctx.fillStyle = C.amber; ctx.fillRect(110, 420, 640 * Math.min(1, (days * DAY_1972_MS) / 1000 / 1.2), 30);
      ctx.fillStyle = C.magenta; ctx.fillRect(110 + 640 / 1.2 - 2, 410, 4, 50);
      font(600, 22); text('1 s', 110 + 640 / 1.2, 480, { color: C.magenta, align: 'center' });
    });
    // UT1 − UTC staying inside ±0.9 s (schematic: a steady drift between the real leap-second dates)
    A(seg(t, 27.6, 28.2), () => {
      font(600, 22);
      ctx.fillStyle = 'rgba(255,79,123,0.10)'; ctx.fillRect(GRAPH.x0, gy(0.9), GRAPH.x1 - GRAPH.x0, gy(-0.9) - gy(0.9));
      ctx.strokeStyle = C.magenta; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
      for (const v of [0.9, -0.9]) { ctx.beginPath(); ctx.moveTo(GRAPH.x0, gy(v)); ctx.lineTo(GRAPH.x1, gy(v)); ctx.stroke(); }
      ctx.setLineDash([]);
      text('+0.9 s', GRAPH.x0 - 10, gy(0.9), { color: C.magenta, align: 'right' });
      text('−0.9 s', GRAPH.x0 - 10, gy(-0.9), { color: C.magenta, align: 'right' });
      text('Earth minus UTC (schematic)', GRAPH.x0, GRAPH.y0 - 44, { color: C.soft });
      // the sawtooth: falls steadily, jumps up by a second at each leap
      const upTo = 1972 + 45 * eio(seg(t, 28.2, 31.6));
      ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.beginPath();
      let prev = 1972, v = 0.4; ctx.moveTo(gx(1972), gy(v));
      for (const L of [...LEAPS, 2017]) {
        const end = Math.min(L, upTo), slope = -1 / Math.max(0.5, L - prev);
        ctx.lineTo(gx(end), gy(0.4 + slope * (end - prev)));
        if (L > upTo) break;
        if (L < 2017) { ctx.lineTo(gx(L), gy(0.4)); }
        prev = L;
      }
      ctx.stroke();
      // the leap seconds as dots on the years axis, and the count
      const yAxis = GRAPH.y1 + 60;
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(GRAPH.x0, yAxis); ctx.lineTo(GRAPH.x1, yAxis); ctx.stroke();
      for (const yr of [1972, 1980, 1990, 2000, 2010, 2016]) text(String(yr), gx(yr), yAxis + 30, { color: C.soft, align: 'center' });
      const shown = LEAPS.filter((L) => L <= upTo).length;
      LEAPS.slice(0, shown).forEach((L) => { ctx.fillStyle = C.magenta; ctx.beginPath(); ctx.arc(gx(L), yAxis, 6, 0, Math.PI * 2); ctx.fill(); });
      A(seg(t, 32.2, 32.8), () => {
        panel(GRAPH.x1 - 250, GRAPH.y0 + 20, 250, 90, 12);
        led(String(shown), GRAPH.x1 - 196, GRAPH.y0 + 66, 54, { color: C.magenta, ghost: false });
        font(600, 24); text('leap seconds', GRAPH.x1 - 150, GRAPH.y0 + 66, { color: C.ink });
      });
    });
  });
}

// ---------- D: how computers trip ----------
function sceneBugs(t) {
  const a = span(t, 36.8, 50.6, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    const rows = [['23:59:58', '23:59:58'], ['23:59:59', '23:59:59'], ['23:59:60', '23:59:59'], ['00:00:00', '00:00:00']];
    const shown = clamp(Math.floor((t - 37.2) / 0.8) + 1, 0, 4);
    A(span(t, 36.8, 46.0, 0.4, 0.4), () => {
      panel(60, 120, 744, 400, 18);
      font(700, 26); text('UTC', 250, 168, { color: C.amber, align: 'center', spacing: '2px' });
      text('LINUX CLOCK', 614, 168, { color: C.cyan, align: 'center', spacing: '2px' });
      rows.slice(0, shown).forEach(([u, l], i) => {
        const y = 230 + i * 74;
        led(u, 250, y, 46, { hot: i === 2 ? [6, 7] : [] });
        led(l, 614, y, 46, { color: C.cyan, hot: i === 2 ? [0, 1, 2, 3, 4, 5, 6, 7] : [], ghost: false });
      });
      A(seg(t, 40.4, 40.9), () => { font(700, 24); text('the same second twice', 614, 494, { color: C.magenta, align: 'center' }); });
    });
    // the stopwatch: start 0.2 s before the leap second, stop 0.3 s into it
    A(span(t, 41.4, 46.0, 0.4, 0.4), () => {
      panel(60, 540, 744, 170, 16);
      font(600, 24); text('start', 100, 590, { color: C.soft });
      led('23:59:59.8', 400, 590, 34, { color: C.cyan, ghost: false });
      font(600, 24); text('stop, 0.5 s later', 100, 650, { color: C.soft });
      led('23:59:59.3', 400, 650, 34, { color: C.cyan, ghost: false, hot: [9] });
      A(seg(t, 42.6, 43.2), () => {
        font(600, 22); text('timer says', 650, 580, { color: C.soft, align: 'center' });
        led('-0.5', 650, 632, 56, { color: C.magenta, ghost: false });
        k.font(400, 30, BIG); text('S', 718, 640, { color: C.magenta });
      });
    });
    // who was hit
    A(span(t, 46.0, 50.6, 0.4, 0.4), () => {
      const cards = [['30 JUNE 2012', 'Reddit, Qantas, Mozilla', 'and many Linux servers'], ['31 DEC 2016', 'Cloudflare', 'its servers worked out a negative time']];
      cards.forEach(([when, who, what], i) => {
        const g = eout(seg(t, 46.2 + i * 0.9, 46.9 + i * 0.9)), y = 150 + i * 250;
        A(g, () => {
          panel(90, y + (1 - g) * 30, 684, 210, 18);
          k.font(400, 32, BIG); text(when, 130, y + 56, { color: C.magenta });
          font(800, 44); text(who, 130, y + 116, { color: C.ink });
          font(500, 26); text(what, 130, y + 166, { color: C.soft });
        });
      });
    });
  });
}

// ---------- E: the faster Earth, the negative leap second, and the decision ----------
function sceneNow(t) {
  const a = span(t, 50.6, 64.6, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    // day length around 86,400 s
    A(span(t, 50.6, 55.4, 0.4, 0.4), () => {
      panel(60, 150, 744, 420, 18);
      const mid = 360, msPx = 52;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(110, mid); ctx.lineTo(760, mid); ctx.stroke();
      font(600, 24); text('exactly 86,400 s', 110, mid - 22, { color: C.soft });
      const marks = [[1972, DAY_1972_MS, 400, C.amber], [2016, DAY_2016_MS, 540, C.amber], ['29 Jun 2022', -SHORTEST_MS, 680, C.cyan]];
      marks.forEach(([lab, ms, x, col], i) => {
        const g = eout(seg(t, 51.0 + i * 0.7, 51.7 + i * 0.7));
        ctx.fillStyle = col; ctx.fillRect(x - 26, ms > 0 ? mid - ms * msPx * g : mid, 52, Math.abs(ms) * msPx * g);
        A(g, () => {
          font(700, 26); text(`${ms > 0 ? '+' : '−'}${Math.abs(ms)} ms`, x, ms > 0 ? mid - ms * msPx - 26 : mid + Math.abs(ms) * msPx + 28, { color: col, align: 'center' });
          font(600, 22); text(String(lab), x, ms > 0 ? mid + 30 : mid - 30, { color: C.soft, align: 'center' });
        });
      });
    });
    // a negative leap second skips 23:59:59
    A(span(t, 55.2, 59.9, 0.4, 0.4), () => {
      panel(60, 150, 744, 420, 18);
      k.font(400, 32, BIG); text('NEGATIVE LEAP SECOND', W / 2, 210, { color: C.magenta, align: 'center', spacing: '2px' });
      const seq = ['23:59:58', '23:59:59', '00:00:00'];
      seq.forEach((s, i) => {
        const y = 290 + i * 80, skipped = i === 1;
        A(skipped ? 0.45 : 1, () => led(s, W / 2, y, 50, { color: skipped ? C.soft : C.amber, ghost: false }));
        if (skipped) A(eout(seg(t, 56.2, 56.8)), () => {
          ctx.strokeStyle = C.magenta; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(W / 2 - 170, y); ctx.lineTo(W / 2 - 170 + 340 * eout(seg(t, 56.2, 56.8)), y); ctx.stroke();
        });
      });
      A(seg(t, 57.0, 57.5), () => { font(700, 26); text('never done before', W / 2, 530, { color: C.soft, align: 'center' }); });
    });
    // the decision
    A(span(t, 59.8, 64.8, 0.4, 0.01), () => {
      panel(60, 130, 744, 470, 18);
      font(700, 24); text('CONTINUOUS UTC FROM', W / 2, 180, { color: C.soft, align: 'center', spacing: '2px' });
      led('20.05.2027', W / 2, 250, 70, {});
      font(600, 26); text('allowed gap between clocks and the Earth', W / 2, 340, { color: C.soft, align: 'center' });
      const g = eio(seg(t, 60.8, 62.8));
      // a log scale from 0.1 s to 10,000 s
      const L = (v) => lerp(110, 754, (Math.log10(v) + 1) / 5);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(110, 430); ctx.lineTo(754, 430); ctx.stroke();
      for (const [v, lab] of [[0.1, '0.1 s'], [1, '1 s'], [10, '10 s'], [100, '100 s'], [1000, '1,000 s']]) { ctx.fillStyle = C.faint; ctx.fillRect(L(v) - 1, 420, 2, 20); font(500, 20); text(lab, L(v), 466, { color: C.soft, align: 'center' }); }
      ctx.fillStyle = C.magenta; ctx.beginPath(); ctx.arc(L(TOLERANCE_OLD), 430, 10, 0, Math.PI * 2); ctx.fill();
      font(700, 22); text('0.9 s', L(TOLERANCE_OLD), 396, { color: C.magenta, align: 'center' });
      const v = 10 ** lerp(Math.log10(TOLERANCE_OLD), Math.log10(TOLERANCE_NEW), g);
      ctx.fillStyle = C.amber; ctx.fillRect(L(TOLERANCE_OLD), 424, L(v) - L(TOLERANCE_OLD), 12);
      ctx.beginPath(); ctx.arc(L(v), 430, 12, 0, Math.PI * 2); ctx.fill();
      A(seg(t, 62.6, 63.0), () => { font(800, 30); text('3,600 s = 1 hour', L(TOLERANCE_NEW), 520, { color: C.amber, align: 'right' }); });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [BIG, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneClocks(t);
    sceneDrift(t);
    sceneBugs(t);
    sceneNow(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 41, weight: 700, family: SANS, ink: C.ink, marks: { '*': C.amber, '~': C.magenta, '^': C.cyan } });
  },
});
