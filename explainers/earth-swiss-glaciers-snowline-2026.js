// Explainer for earth-swiss-glaciers-snowline-2026: why Swiss glaciers lost 5.5% of their ice in 2026, told as a
// glacier's yearly budget of snow gained and ice melted. Look: a sunlit Alpine slope on a pale sky, a glacier in
// ice blue under a white snow blanket, the freezing level as a red dashed line that climbs; losses in red-orange.
// Nunito (a soft rounded sans) for captions, Jost (a geometric sans) for numbers and labels.
//
// Facts: GLAMOS (Glacier Monitoring Switzerland), "Annual mass balance of Swiss glaciers in 2025/2026" (Huss,
// Bauder, Linsbauer, Barandun; 23 September 2026, doi 10.18752/annualrep_2026): 23 glaciers measured in September
// 2026; the annual mass balance is winter snow accumulation plus summer melt over the hydrological year
// (1 October to 30 September); average for all Swiss glaciers −2.86 m water equivalent (record 2022: −3.13), i.e.
// a 5.5% fall in ice volume; 2022–2026 melt more than twice as fast as in any earlier 5-year period, almost 20% of
// the volume lost since 2021; snow deficit on glaciers of 25% on 30 April (2022: 32%); June–August the hottest on
// record (MeteoSwiss); 76 days with the zero-degree line above 4,000 m between May and September, more than twice
// the average and a record; the "glacier loss day", when all snow gained in winter has melted, was 2 July on
// average for 13 glaciers, the second earliest after 2022, typically in August; all winter snow had gone even at
// the highest stakes, over 3,300 m, and no new firn was observed; less Saharan dust than in 2022, when dust
// lowered the snow's albedo and sped up the melt. University of Fribourg / SCNAT news (1 October 2026): more than
// 5% of the ice gone; by September no snow remained even at 3,500 m. NASA Earth Observatory: fresh snow has an
// albedo of about 0.9, bare ice about 0.5.
//
// Scene plan (64.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  5.5% in one year, almost 20% since 2021.
//  B  9.2–23.0  The budget: snow gained up high, ice lost low down, the line where they balance.
//  C 23.0–46.0  2026: a thin winter, record heat, the freezing level above 4,000 m, the glacier loss day, no snow left.
//  D 46.0–55.2  Albedo: snow reflects, ice absorbs; Saharan dust.
//  E 55.2–64.4  Second only to 2022; no new ice formed.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  sky: '#d7e8f1', sky2: '#a9c9db', ink: '#10222e', soft: 'rgba(16,34,46,0.72)', faint: 'rgba(16,34,46,0.30)',
  rock: '#7d7268', rock2: '#5f564e', ice: '#7cc6e0', ice2: '#4a9fc0', snow: '#ffffff', loss: '#d9532f', sun: '#f2b632',
  panel: 'rgba(255,255,255,0.82)', freeze: '#c0392b', dust: '#c9a46a',
};
const ROUND = 'Nunito', GEO = 'Jost';

let k, ctx;
const font = (w, s, f = GEO) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers (GLAMOS 2026) ----------
const LOSS = 5.5, SINCE_2021 = 20, MB = -2.86, MB_2022 = -3.13, DEFICIT = 25, DEFICIT_2022 = 32, DAYS = 76;
const SNOW_ALB = 0.9, ICE_ALB = 0.5;
const ABSORB_X = (1 - ICE_ALB) / (1 - SNOW_ALB); // 5

const CUES = [
  [0.4, 4.6, `On 1 October 2026, Swiss glacier scientists reported that the glaciers lost *${LOSS}%* of their ice in a year.`],
  [4.8, 9.0, `That makes almost *${SINCE_2021}%* gone since 2021, melting twice as fast as in any earlier five years.`],
  [9.2, 13.6, 'A glacier keeps a budget: snow is added in winter, and snow and ice melt away in summer.'],
  [13.8, 18.2, 'High up, some snow outlasts the summer and turns to ice. Low down, more melts than falls.'],
  [18.4, 22.8, 'Between the two is the line where the year *breaks even*. A healthy glacier gains above it.'],
  [23.0, 27.4, `Winter 2025–26 was thin: on 30 April, the glaciers held about *${DEFICIT}%* less snow than normal.`],
  [27.6, 32.0, 'Then came the hottest June, July and August on record in Switzerland, one heatwave after another.'],
  [32.2, 36.6, `The freezing level rose above *4,000 m* on ${DAYS} days: more than twice the average, and a record.`],
  [36.8, 41.2, 'By *2 July*, the winter’s snow had all melted away on average. That usually takes until August.'],
  [41.4, 45.8, 'By September, no snow was left even at the highest stakes: the whole glacier was ~losing~ ice.'],
  [46.0, 50.4, `Snow reflects about 90% of sunlight; bare ice about half. So ice soaks up about *${Math.round(ABSORB_X)} times* as much.`],
  [50.6, 55.0, 'Dust blown from the Sahara darkens snow too. In 2022 it sped up the melt; in 2026 there was less.'],
  [55.2, 59.6, 'So 2026 came second only to 2022: on average, a layer of water *2.9 m* deep melted off each glacier.'],
  [59.8, 64.2, 'At the measuring stakes, no snow survived the summer to become new ice. No glacier lasts like that.'],
];

// ---------- background: sky ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sky); lg.addColorStop(0.7, C.sky2); lg.addColorStop(1, '#93b6ca');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

// ---------- the mountain and its glacier ----------
const Z0 = 1800, Z1 = 4400, YB = 720, YT = 190; // elevations at the bottom and top of the slope view
const yOf = (z) => lerp(YB, YT, (z - Z0) / (Z1 - Z0));
const zOf = (y) => lerp(Z0, Z1, (YB - y) / (YB - YT));
const GL_BOT = 2000, GL_TOP = 3600; // the glacier's range in this picture (schematic)
/** The slope's surface at x: a mountain rising to the right. */
const slopeY = (x) => lerp(YB + 10, YT + 40, Math.pow(clamp((x - 40) / 760), 0.9));
const xOfZ = (z) => { let lo = 40, hi = 800; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; slopeY(m) > yOf(z) ? (lo = m) : (hi = m); } return (lo + hi) / 2; };
/** Ice thickness (px) at x, thickest in the middle of the glacier. */
const iceAt = (x, shrink = 0) => {
  const a = xOfZ(GL_BOT), b = xOfZ(GL_TOP);
  if (x < a || x > b) return 0;
  const u = (x - a) / (b - a);
  return Math.sin(Math.PI * Math.pow(u, 0.8)) * 46 * (1 - shrink) + 6;
};
function mountain(t, { shrink = 0, snowTo = GL_TOP + 200, snowDepth = 1, freeze = null, dust = 0, axis = true } = {}) {
  // rock
  ctx.fillStyle = C.rock;
  ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, slopeY(40)); for (let x = 40; x <= 800; x += 8) ctx.lineTo(x, slopeY(x)); ctx.lineTo(W, YT + 30); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.rock2; ctx.fillRect(0, 770, W, H - 770);
  // ice
  ctx.fillStyle = C.ice; ctx.beginPath();
  const a = xOfZ(GL_BOT), b = xOfZ(GL_TOP);
  ctx.moveTo(a, slopeY(a));
  for (let x = a; x <= b; x += 4) ctx.lineTo(x, slopeY(x) - iceAt(x, shrink));
  for (let x = b; x >= a; x -= 4) ctx.lineTo(x, slopeY(x));
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.ice2; ctx.lineWidth = 2; ctx.stroke();
  // snow on top of the ice (and the rock) above the snowline
  if (snowDepth > 0) {
    const xs = xOfZ(Math.min(snowTo, Z1));
    ctx.fillStyle = dust ? `rgb(${Math.round(lerp(255, 201, dust))},${Math.round(lerp(255, 164, dust))},${Math.round(lerp(255, 106, dust))})` : C.snow;
    ctx.beginPath();
    for (let x = xs; x <= 800; x += 4) { const y = slopeY(x) - iceAt(x, shrink); x === xs ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    for (let x = 800; x >= xs; x -= 4) ctx.lineTo(x, slopeY(x) - iceAt(x, shrink) - 14 * snowDepth);
    ctx.closePath(); ctx.fill();
  }
  // elevation axis
  if (axis) {
    font(500, 22);
    for (const z of [2000, 3000, 4000]) {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.setLineDash([4, 8]);
      ctx.beginPath(); ctx.moveTo(30, yOf(z)); ctx.lineTo(W - 30, yOf(z)); ctx.stroke(); ctx.setLineDash([]);
      text(`${z.toLocaleString('en-US')} m`, 30, yOf(z) - 16, { color: C.soft, align: 'left' });
    }
  }
  if (freeze !== null) {
    const y = yOf(freeze);
    ctx.strokeStyle = C.freeze; ctx.lineWidth = 4; ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke(); ctx.setLineDash([]);
    font(700, 22); text('freezing level', 40, y - 18, { color: C.freeze, align: 'left' });
  }
}

// ---------- A: the loss ----------
function hook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    mountain(t, { shrink: 0.2 * eio(seg(t, 5.0, 7.4)), axis: false });
    ctx.fillStyle = C.panel; k.rrect(230, 130, 404, 200, 22); ctx.fill();
    font(500, 19); text('Glacier Monitoring Switzerland (GLAMOS)', W / 2, 306, { color: C.soft, align: 'center' });
    if (t < 4.8) {
      font(500, 24); text('Swiss glacier ice lost in one year', W / 2, 176, { color: C.soft, align: 'center' });
      font(800, 96); text(`${(LOSS * eio(seg(t, 0.8, 2.6))).toFixed(1)}%`, W / 2, 250, { color: C.loss, align: 'center' });
    } else {
      font(500, 24); text('lost since 2021', W / 2, 176, { color: C.soft, align: 'center' });
      font(800, 96); text(`almost ${SINCE_2021}%`, W / 2, 250, { color: C.loss, align: 'center' });
    }
  });
}

// ---------- B: the budget ----------
function budget(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const ela = 2900;
    const winter = t < 13.8;
    mountain(t, { snowTo: winter ? GL_BOT - 200 : lerp(GL_BOT - 200, ela, eio(seg(t, 14.0, 16.0))), snowDepth: winter ? eio(seg(t, 9.6, 12.0)) * 1.6 + 0.01 : 1.2 });
    // falling snow in winter
    if (winter) {
      ctx.fillStyle = C.snow;
      for (let i = 0; i < 60; i++) { const x = (i * 131) % W, y = ((t * 90 + i * 53) % 560) + 120; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); }
      A(seg(t, 10.0, 10.5), () => { font(700, 28); text('winter: snow added', W / 2, 150, { color: C.ink, align: 'center' }); });
    } else {
      // the sun, and melt drips below the line
      ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(130, 150, 40, 0, Math.PI * 2); ctx.fill();
      font(700, 28); text('summer: snow and ice melt', W / 2, 150, { color: C.ink, align: 'center' });
      ctx.fillStyle = C.loss;
      for (let i = 0; i < 10; i++) {
        const x = lerp(xOfZ(GL_BOT) + 20, xOfZ(ela) - 20, i / 9), y0 = slopeY(x) - iceAt(x) - 30, p = (t * 1.3 + i * 0.37) % 1;
        ctx.globalAlpha = 1 - p; ctx.beginPath(); ctx.arc(x, y0 + p * 26, 5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }
    }
    A(seg(t, 16.4, 17.0), () => {
      font(700, 24);
      text('gains: snow lasts', xOfZ(3350) - 40, yOf(3350) - 40, { color: C.ice2, align: 'right' });
      text('losses: ice melts', 40, yOf(2350) - 60, { color: C.loss, align: 'left' });
    });
    A(seg(t, 18.6, 19.2), () => {
      const y = yOf(ela);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xOfZ(ela) - 70, y); ctx.lineTo(xOfZ(ela) + 70, y); ctx.stroke();
      ctx.fillStyle = C.panel; k.rrect(xOfZ(ela) - 330, y - 32, 230, 64, 14); ctx.fill();
      font(700, 22); text('break-even line', xOfZ(ela) - 215, y - 12, { color: C.ink, align: 'center' });
      font(500, 19); text('gain = loss here', xOfZ(ela) - 215, y + 14, { color: C.soft, align: 'center' });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xOfZ(ela) - 100, y); ctx.lineTo(xOfZ(ela) - 70, y); ctx.stroke();
    });
  });
}

// ---------- C: 2026 ----------
function thinWinter(t) {
  const a = span(t, 23.0, 27.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 26); text('snow on the glaciers, 30 April', W / 2, 150, { color: C.ink, align: 'center' });
    const L = 220, R = 700, y1 = 300, y2 = 470, full = R - L;
    const g = eio(seg(t, 23.4, 25.0));
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; k.rrect(L, y1 - 40, full, 80, 14); ctx.fill(); k.rrect(L, y2 - 40, full, 80, 14); ctx.fill();
    ctx.fillStyle = C.snow; k.rrect(L, y1 - 40, full * g, 80, 14); ctx.fill();
    ctx.fillStyle = C.snow; k.rrect(L, y2 - 40, full * (1 - DEFICIT / 100) * g, 80, 14); ctx.fill();
    ctx.strokeStyle = C.ice2; ctx.lineWidth = 2; k.rrect(L, y1 - 40, full, 80, 14); ctx.stroke(); k.rrect(L, y2 - 40, full, 80, 14); ctx.stroke();
    font(700, 26); text('normal', L - 20, y1, { align: 'right' }); text('2026', L - 20, y2, { align: 'right' });
    A(seg(t, 25.0, 25.5), () => { font(800, 34); text(`−${DEFICIT}%`, L + full * (1 - DEFICIT / 100) + 18, y2, { color: C.loss, align: 'left' }); });
    A(seg(t, 25.6, 26.2), () => { font(500, 22); text(`(the record year 2022: −${DEFICIT_2022}%)`, W / 2, 590, { color: C.soft, align: 'center' }); });
  });
}
function heat(t) {
  const a = span(t, 27.6, 32.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 26); text('June, July and August 2026: the hottest on record', W / 2, 150, { color: C.ink, align: 'center' });
    // a strip of summer days, heatwaves in red (schematic)
    const L = 80, R = 784, n = 92;
    for (let d = 0; d < n; d++) {
      const g = seg(t, 27.8 + d * 0.025, 28.0 + d * 0.025);
      const hot = Math.sin(d * 0.35) + Math.sin(d * 0.11) > -0.6;
      ctx.fillStyle = hot ? C.loss : C.sun; ctx.globalAlpha = g;
      const x = lerp(L, R, d / n), h = 60 + (hot ? 160 : 70) * (0.6 + 0.4 * Math.sin(d * 1.7) ** 2);
      ctx.fillRect(x, 560 - h, (R - L) / n - 1.5, h); ctx.globalAlpha = 1;
    }
    font(600, 22); text('June', lerp(L, R, 15 / 92), 600, { color: C.soft, align: 'center' }); text('July', lerp(L, R, 45 / 92), 600, { color: C.soft, align: 'center' }); text('August', lerp(L, R, 76 / 92), 600, { color: C.soft, align: 'center' });
    font(500, 20); text('schematic: heatwaves in red', W / 2, 650, { color: C.soft, align: 'center' });
  });
}
function freezing(t) {
  const a = span(t, 32.2, 46.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const fz = lerp(3300, 4200, eio(seg(t, 32.6, 34.6)));
    // the snowline climbs: by the glacier loss day the winter snow is used up; by September it is gone at the top
    const snowTo = t < 36.8 ? 2400 : lerp(2400, GL_TOP + 400, eio(seg(t, 37.0, 43.0)));
    mountain(t, { freeze: fz, snowTo, snowDepth: lerp(0.9, 0.3, seg(t, 37, 43)), shrink: 0.12 * seg(t, 41.4, 45.0) });
    ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(130, 140, 40, 0, Math.PI * 2); ctx.fill();
    A(seg(t, 34.6, 35.2) * (1 - seg(t, 36.6, 37.0)), () => {
      ctx.fillStyle = C.panel; k.rrect(50, 300, 470, 64, 16); ctx.fill();
      font(700, 24); text(`above 4,000 m on ${DAYS} days, May to September`, 285, 332, { color: C.freeze, align: 'center' });
    });
    // the calendar of the glacier loss day
    A(seg(t, 37.0, 37.5) * (1 - seg(t, 41.0, 41.4)), () => {
      ctx.fillStyle = C.panel; k.rrect(50, 290, 470, 130, 16); ctx.fill();
      font(700, 22); text('glacier loss day: all winter snow melted', 285, 318, { color: C.ink, align: 'center' });
      const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep'], L = 80, R = 490;
      font(600, 20); months.forEach((m, i) => text(m, lerp(L, R, (i + 0.5) / 5), 350, { color: C.soft, align: 'center' }));
      const x = (m, d) => lerp(L, R, (m + d / 31) / 5);
      ctx.fillStyle = C.loss; ctx.beginPath(); ctx.arc(x(2, 2), 378, 10, 0, Math.PI * 2); ctx.fill();
      font(700, 20); text('2 July 2026', x(2, 2), 404, { color: C.loss, align: 'center' });
      ctx.strokeStyle = C.ice2; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x(3, 0), 378); ctx.lineTo(x(4, 0), 378); ctx.stroke();
      font(600, 20); text('usually', x(3, 15), 404, { color: C.ice2, align: 'center' });
    });
    A(seg(t, 43.0, 43.6), () => {
      ctx.fillStyle = C.panel; k.rrect(50, 300, 470, 64, 16); ctx.fill();
      font(700, 24); text('September: bare ice even at the top', 285, 332, { color: C.loss, align: 'center' });
    });
  });
}

// ---------- D: albedo, dust ----------
function albedo(t) {
  const a = span(t, 46.0, 50.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 26); text('of 10 parts of sunlight…', W / 2, 150, { color: C.ink, align: 'center' });
    const panelW = 330, xs = [100, 434], names = ['fresh snow', 'bare ice'], alb = [SNOW_ALB, ICE_ALB];
    xs.forEach((x0, i) => {
      ctx.fillStyle = i ? C.ice : C.snow; ctx.fillRect(x0, 520, panelW, 60);
      ctx.strokeStyle = C.ice2; ctx.lineWidth = 2; ctx.strokeRect(x0, 520, panelW, 60);
      font(700, 26); text(names[i], x0 + panelW / 2, 610, { align: 'center' });
      const g = eio(seg(t, 46.4, 48.0));
      for (let r = 0; r < 10; r++) {
        const reflect = r < Math.round(alb[i] * 10);
        const x = x0 + 30 + r * 30, top = 230, yHit = 516;
        const down = Math.min(1, g * 2), up = Math.max(0, g * 2 - 1);
        ctx.strokeStyle = C.sun; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, lerp(top, yHit, down)); ctx.stroke();
        if (down >= 1) {
          if (reflect) { ctx.strokeStyle = 'rgba(242,182,50,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, yHit); ctx.lineTo(x + 14 * up, yHit - 120 * up); ctx.stroke(); }
          else { ctx.fillStyle = C.loss; ctx.beginPath(); ctx.arc(x, yHit + 22, 8 * up, 0, Math.PI * 2); ctx.fill(); }
        }
      }
      A(seg(t, 48.2, 48.8), () => {
        font(700, 22); text(`reflects ${Math.round(alb[i] * 10)}, absorbs ${10 - Math.round(alb[i] * 10)}`, x0 + panelW / 2, 650, { color: i ? C.loss : C.ice2, align: 'center' });
      });
    });
    font(500, 19); text('albedo: about 0.9 for fresh snow, 0.5 for bare ice (NASA)', W / 2, 700, { color: C.soft, align: 'center' });
  });
}
function dust(t) {
  const a = span(t, 50.6, 55.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const d = eio(seg(t, 51.0, 52.4)) * (1 - eio(seg(t, 53.2, 54.2)) * 0.7);
    mountain(t, { snowTo: 2600, snowDepth: 1, dust: d });
    // dust drifting in from the left
    ctx.fillStyle = C.dust;
    for (let i = 0; i < 70; i++) { const p = (t * 0.35 + i * 0.137) % 1, x = p * W, y = 160 + ((i * 47) % 260) + p * 80; ctx.globalAlpha = 0.6 * (t < 53.2 ? 1 : 0.3); ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.panel; k.rrect(220, 110, 424, 70, 16); ctx.fill();
    font(700, 24); text(t < 53.2 ? 'Saharan dust: darker snow, faster melt' : '2026: less dust than in 2022', W / 2, 145, { color: C.ink, align: 'center' });
  });
}

// ---------- E: the result ----------
function result(t) {
  const a = span(t, 55.2, 59.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 26); text('average mass balance of all Swiss glaciers', W / 2, 150, { color: C.ink, align: 'center' });
    font(500, 22); text('metres of water lost over each glacier’s area', W / 2, 186, { color: C.soft, align: 'center' });
    const rows = [['2022', MB_2022], ['2026', MB]], top = 240, scale = 110;
    rows.forEach(([yr, v], i) => {
      const x = 290 + i * 290, g = eio(seg(t, 55.6 + i * 0.4, 56.8 + i * 0.4)), h = -v * scale * g;
      ctx.fillStyle = 'rgba(74,159,192,0.25)'; ctx.fillRect(x - 70, top, 140, -v * scale);
      ctx.fillStyle = i ? C.loss : 'rgba(217,83,47,0.55)'; ctx.fillRect(x - 70, top, 140, h);
      font(700, 30); text(yr, x, top - 26, { align: 'center' });
      font(800, 40); text(`−${(-v * g).toFixed(2)} m`, x, top + h + 34, { color: i ? C.loss : C.soft, align: 'center' });
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(150, top); ctx.lineTo(714, top); ctx.stroke();
  });
}
function finale(t) {
  const a = eout(seg(t, 59.8, 60.4));
  if (a <= 0) return;
  A(a, () => {
    mountain(t, { snowTo: Z1, snowDepth: 0, shrink: 0.25, axis: false });
    ctx.fillStyle = C.panel; k.rrect(190, 120, 484, 120, 18); ctx.fill();
    font(700, 26); text('snow that survived summer 2026', W / 2, 155, { color: C.ink, align: 'center' });
    font(500, 22); text('to become new ice: none at the measuring stakes', W / 2, 200, { color: C.loss, align: 'center' });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.4, fonts: [ROUND, GEO],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    hook(t);
    budget(t);
    thinWinter(t);
    heat(t);
    freezing(t);
    albedo(t);
    dust(t);
    result(t);
    finale(t);
    // a pale band behind the captions, so they read on rock
    ctx.fillStyle = 'rgba(215,232,241,0.92)'; ctx.fillRect(0, 770, W, 160);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 700, family: ROUND, ink: C.ink, marks: { '*': C.loss, '~': C.ice2 } });
  },
});
