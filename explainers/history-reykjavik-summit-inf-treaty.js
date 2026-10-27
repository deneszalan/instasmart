// Explainer for history-reykjavik-summit-inf-treaty: on 10 October 2026 Reykjavík opened Höfði house for the 40th
// anniversary of the 1986 Reagan–Gorbachev summit. The summit ended without a deal, but it led to the 1987 INF
// Treaty, which banned a whole class of nuclear missiles. Look: a typewritten, declassified-file paper, the white
// wooden Höfði house, a range ruler and rows of missile glyphs that are crossed off. Steel blue for the United States,
// brick red for the Soviet Union. IBM Plex Mono for labels and numbers, Libre Caslon Text for captions.
//
// Facts:
// - City of Reykjavík, "Open house at Höfði — 40th anniversary of the summit" (reykjavik.is, 2026): open house on
//   Saturday 10 October 2026; US President Ronald Reagan and Soviet leader Mikhail Gorbachev met at Höfði on 11 and
//   12 October 1986 to discuss disarmament and did not reach an agreement. "Reykjavík marks 40th anniversary of the
//   Höfði summit" (reykjavik.is, 2026): the anniversary is marked this autumn.
// - Wikipedia, "Reykjavík Summit": the US proposed eliminating all ballistic missiles within ten years; Gorbachev
//   suggested eliminating all nuclear weapons within a decade; the talks collapsed over the Strategic Defense
//   Initiative (Gorbachev wanted its research confined to laboratories for ten years; Reagan refused); the Soviets
//   accepted the "double zero" proposal to remove INF weapons from Europe; the summit helped lead to the INF Treaty,
//   signed at the Washington summit on 8 December 1987.
// - Wikipedia, "Intermediate-Range Nuclear Forces Treaty": at Reykjavík the leaders agreed in principle to remove INF
//   systems from Europe; the treaty covered ground-launched missiles with ranges of 500–5,500 km (1,000–5,500
//   intermediate, 500–1,000 shorter-range); air- and sea-launched missiles were not covered; by 1 June 1991, 2,692
//   had been destroyed, 846 by the US and 1,846 by the Soviet Union; inspections continued until 31 May 2001; the US
//   withdrew on 2 August 2019.
// - Arms Control Association, "The INF Treaty at a Glance": signed 8 December 1987 by Reagan and Gorbachev, in force
//   1 June 1988; up to 20 short-notice inspections per year in the first three years; on-site inspection rights ended
//   31 May 2001; the US found Russia in "material breach" over the 9M729 missile, which Russia denied; US withdrawal
//   2 August 2019.
// Computed here: 846 + 1,846 = 2,692; one glyph per 20 missiles; 31 years in force (1 June 1988 to 2 August 2019).
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: Höfði house, 2026, then the two leaders, 1986.
//  B  9.2–18.4  What they discussed; no agreement, over missile defence.
//  C 18.4–27.6  The one idea accepted; the treaty signed on 8 December 1987.
//  D 27.6–36.8  What it banned: a range ruler, ground-launched only.
//  E 36.8–46.0  2,692 missiles destroyed by 1 June 1991.
//  F 46.0–60.0  Inspections, withdrawal, 31 years in force.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#ece7da', paper2: '#ddd5c2', ink: '#23292d', soft: 'rgba(35,41,45,0.66)', faint: 'rgba(35,41,45,0.22)',
  us: '#2f5d8a', su: '#b0442f', stamp: '#b3261e', band: '#c7902f', house: '#f8f6f0', roof: '#3b4349', sea: '#7c97a3',
};
const MONO = 'IBM Plex Mono', SERIF = 'Libre Caslon Text';

let k, ctx;
const font = (w, s, f = MONO) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const fmt = (n) => Math.round(n).toLocaleString('en-US');

// ---------- the numbers ----------
const DESTROYED = { us: 846, su: 1846 };
const TOTAL = DESTROYED.us + DESTROYED.su; // 2,692
const PER_GLYPH = 20;
const RANGE = { min: 500, mid: 1000, max: 5500 };
const YEARS_IN_FORCE = 2019 - 1988; // 1 June 1988 to 2 August 2019
if (TOTAL !== 2692) throw new Error('totals');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 10 October 2026, Höfði house in Reykjavík, Iceland, opened its doors for an anniversary.'],
  [4.8, 9.0, 'Forty years earlier, US President *Ronald Reagan* and Soviet leader ~Mikhail Gorbachev~ met here.'],
  [9.2, 13.6, 'They talked about scrapping all ballistic missiles, even all nuclear weapons, within ten years.'],
  [13.8, 18.2, 'The talks collapsed over US research on missile defence, and they left with no agreement.'],
  [18.4, 22.8, 'But the Soviet side had accepted one idea: no ^intermediate-range^ nuclear missiles in Europe.'],
  [23.0, 27.4, 'On 8 December 1987, the two leaders signed the Intermediate-Range Nuclear Forces Treaty.'],
  [27.6, 32.0, `It banned a whole class: missiles launched from the ground, with ranges of ^${fmt(RANGE.min)} to ${fmt(RANGE.max)} km^.`],
  [32.2, 36.6, 'Longer-range missiles, and missiles fired from ships or planes, were not covered.'],
  [36.8, 41.2, `Each side had to destroy every one. By 1 June 1991, ${fmt(TOTAL)} missiles were gone.`],
  [41.4, 45.8, `The United States destroyed *${fmt(DESTROYED.us)}*, the Soviet Union ~${fmt(DESTROYED.su)}~.`],
  [46.0, 50.4, 'Inspectors visited each other’s sites: up to 20 short-notice inspections a year at first.'],
  [50.6, 55.0, 'Inspections ended in 2001. In 2019 the United States withdrew, saying Russia had broken it.'],
  [55.2, 60.0, `Russia denied it. For ${YEARS_IN_FORCE} years, though, a whole class of nuclear missiles had been banned.`],
];

// ---------- background: file paper ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W, H);
  lg.addColorStop(0, C.paper); lg.addColorStop(1, C.paper2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 9; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(80,60,30,${rnd() * 0.04})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 1.5, 1 + rnd()); }
  // punched holes and a fold
  g.fillStyle = 'rgba(35,41,45,0.10)';
  for (const y of [300, 560]) { g.beginPath(); g.arc(34, y, 11, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = 'rgba(35,41,45,0.05)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 520); g.lineTo(W, 500); g.stroke();
}

// ---------- Höfði house ----------
function house(cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  // sea and ground
  ctx.fillStyle = C.sea; ctx.globalAlpha *= 0.35; ctx.fillRect(-330, 120, 660, 30); ctx.globalAlpha /= 0.35;
  ctx.fillStyle = 'rgba(35,41,45,0.14)'; ctx.fillRect(-300, 110, 600, 12);
  // body
  ctx.fillStyle = C.house; ctx.fillRect(-230, -60, 460, 170);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(-230, -60, 460, 170);
  // clapboard lines
  ctx.strokeStyle = 'rgba(35,41,45,0.10)'; ctx.lineWidth = 2;
  for (let y = -48; y < 110; y += 12) { ctx.beginPath(); ctx.moveTo(-228, y); ctx.lineTo(228, y); ctx.stroke(); }
  // roof
  ctx.fillStyle = C.roof; ctx.beginPath(); ctx.moveTo(-252, -60); ctx.lineTo(-170, -140); ctx.lineTo(170, -140); ctx.lineTo(252, -60); ctx.closePath(); ctx.fill();
  // central gable
  ctx.fillStyle = C.house; ctx.beginPath(); ctx.moveTo(-70, -60); ctx.lineTo(0, -150); ctx.lineTo(70, -60); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = C.roof; ctx.beginPath(); ctx.moveTo(-82, -56); ctx.lineTo(0, -162); ctx.lineTo(82, -56); ctx.lineTo(70, -56); ctx.lineTo(0, -146); ctx.lineTo(-70, -56); ctx.closePath(); ctx.fill();
  // chimney
  ctx.fillStyle = C.roof; ctx.fillRect(120, -170, 26, 50);
  // windows
  ctx.fillStyle = '#9fb2ba';
  for (const x of [-200, -150, -100, 60, 110, 160]) { ctx.fillRect(x, -36, 34, 44); ctx.fillRect(x, 40, 34, 44); }
  ctx.fillRect(-14, -120, 28, 34);
  ctx.strokeStyle = C.house; ctx.lineWidth = 3;
  for (const x of [-200, -150, -100, 60, 110, 160]) for (const y of [-36, 40]) { ctx.beginPath(); ctx.moveTo(x + 17, y); ctx.lineTo(x + 17, y + 44); ctx.moveTo(x, y + 22); ctx.lineTo(x + 34, y + 22); ctx.stroke(); }
  // door
  ctx.fillStyle = C.roof; ctx.fillRect(-22, 40, 44, 70);
  ctx.restore();
}

// a typed line that appears character by character
function typed(s, x, y, t0, t, o = {}) {
  const n = Math.floor(clamp((t - t0) / (o.dur ?? 1.2)) * s.length);
  if (n <= 0) return;
  font(o.w ?? 500, o.size ?? 28); text(s.slice(0, n), x, y, { base: 'middle', color: o.color ?? C.ink, align: o.align ?? 'left' });
}
function stamp(s, x, y, a, col = C.stamp, size = 44, rot = -0.08) {
  A(a, () => {
    const sc = 1.25 - 0.25 * eout(clamp(a));
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    font(700, size); const w = ctx.measureText(s).width + 36;
    ctx.strokeStyle = col; ctx.lineWidth = 5; k.rrect(-w / 2, -size * 0.8, w, size * 1.6, 6); ctx.stroke();
    text(s, 0, 2, { align: 'center', base: 'middle', color: col });
    ctx.restore();
  });
}
function header(s) { font(500, 24); text(s, 72, 112, { base: 'middle', color: C.soft, spacing: '1px' }); }

// ---------- scenes ----------
const CX = W / 2;
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.6);
  if (a <= 0) return;
  A(a, () => {
    header(t < 4.8 ? 'HÖFÐI · REYKJAVÍK · 10 OCT 2026' : 'HÖFÐI · REYKJAVÍK · 11–12 OCT 1986');
    const up = eout(seg(t, 4.8, 5.8));
    A(eout(seg(t, 0.2, 1.2)), () => house(CX, 420 - 80 * up, 1.15 - 0.35 * up));
    A(span(t, 1.4, 5.0, 0.5, 0.4), () => {
      font(600, 30); text('open house · 40th anniversary', CX, 640, { align: 'center', base: 'middle', color: C.soft });
    });
    // the two leaders' cards
    [['Ronald Reagan', 'US President', C.us, 230], ['Mikhail Gorbachev', 'Soviet leader', C.su, 634]].forEach(([n, r, col, x], i) => {
      A(eout(seg(t, 5.4 + i * 0.3, 6.2 + i * 0.3)), () => {
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; k.rrect(x - 180, 560, 360, 120, 10); ctx.fill();
        ctx.fillStyle = col; ctx.fillRect(x - 180, 560, 10, 120);
        font(700, 30); text(n, x + 6, 604, { align: 'center', base: 'middle', color: col });
        font(500, 24); text(r, x + 6, 646, { align: 'center', base: 'middle', color: C.soft });
      });
    });
  });
}

function sceneTalks(t) {
  const a = span(t, 9.2, 18.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('MEMO · REYKJAVÍK · 12 OCT 1986');
    font(600, 28); text('ON THE TABLE:', 80, 200, { base: 'middle', color: C.soft });
    typed('1. all ballistic missiles', 80, 270, 9.6, t, { size: 32 });
    typed('   gone in 10 years', 80, 314, 10.2, t, { size: 32, dur: 0.6 });
    typed('2. all nuclear weapons', 80, 384, 10.9, t, { size: 32 });
    typed('   gone in 10 years', 80, 428, 11.5, t, { size: 32, dur: 0.6 });
    typed('3. US missile-defence research', 80, 500, 14.0, t, { size: 32 });
    typed('   only in laboratories? US: no', 80, 544, 14.9, t, { size: 32, color: C.stamp });
    stamp('NO AGREEMENT', CX, 660, seg(t, 16.2, 16.8), C.stamp, 54);
  });
}

function sceneTreaty(t) {
  const a = span(t, 18.4, 27.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 18.4–23: double zero
    A(1 - seg(t, 22.8, 23.3), () => {
      header('ACCEPTED IN PRINCIPLE');
      font(700, 40); text('intermediate-range nuclear', CX, 230, { align: 'center', base: 'middle', color: C.band });
      text('missiles in Europe', CX, 282, { align: 'center', base: 'middle' });
      [[236, C.us, 'United States'], [628, C.su, 'Soviet Union']].forEach(([x, col, lab], i) => {
        A(eout(seg(t, 19.4 + i * 0.3, 20.2 + i * 0.3)), () => {
          ctx.fillStyle = 'rgba(255,255,255,0.5)'; k.rrect(x - 170, 340, 340, 300, 12); ctx.fill();
          ctx.fillStyle = col; ctx.fillRect(x - 170, 340, 340, 10);
          font(800, 170); text('0', x, 500, { align: 'center', base: 'middle', color: col });
          font(600, 28); text(lab, x, 604, { align: 'center', base: 'middle', color: col });
        });
      });
      A(seg(t, 21.0, 21.6), () => { font(500, 26); text('“double zero”: none left on either side', CX, 696, { align: 'center', base: 'middle', color: C.soft }); });
    });
    // 23–27.6: the treaty paper
    A(seg(t, 23.0, 23.6), () => {
      header('WASHINGTON · 8 DECEMBER 1987');
      const g = eout(seg(t, 23.0, 23.8));
      ctx.save(); ctx.translate(CX, 430 + 30 * (1 - g)); ctx.rotate(-0.02);
      ctx.fillStyle = '#fbf9f3'; ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 18; ctx.fillRect(-300, -270, 600, 560); ctx.shadowBlur = 0;
      font(700, 30); text('TREATY', 0, -220, { align: 'center', base: 'middle' });
      font(500, 22);
      ['between the United States of America', 'and the Union of Soviet Socialist', 'Republics on the elimination of their', 'intermediate-range and shorter-range', 'missiles'].forEach((l, i) => text(l, 0, -168 + i * 34, { align: 'center', base: 'middle', color: C.soft }));
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-240, 40 + i * 30); ctx.lineTo(240, 40 + i * 30); ctx.stroke(); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-260, 206); ctx.lineTo(-30, 206); ctx.moveTo(30, 206); ctx.lineTo(260, 206); ctx.stroke();
      font(500, 20); text('for the United States', -145, 234, { align: 'center', base: 'middle', color: C.us }); text('for the USSR', 145, 234, { align: 'center', base: 'middle', color: C.su });
      ctx.restore();
      stamp('SIGNED', CX + 170, 520, seg(t, 24.6, 25.2), C.band, 46, 0.12);
    });
  });
}

// the range ruler: 100 to 10,000 km on a log scale
const RUL = { L: 92, R: 772, y: 360 };
const rx = (km) => lerp(RUL.L, RUL.R, (Math.log10(km) - 2) / 2);
function sceneRange(t) {
  const a = span(t, 27.6, 36.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('WHAT THE TREATY BANNED');
    const g = eio(seg(t, 27.8, 29.0));
    ctx.fillStyle = C.ink; ctx.fillRect(RUL.L, RUL.y - 2, (RUL.R - RUL.L) * g, 4);
    for (const km of [100, 300, 1000, 3000, 10000]) {
      if (rx(km) > lerp(RUL.L, RUL.R, g) + 1) continue;
      ctx.fillStyle = C.ink; ctx.fillRect(rx(km) - 1.5, RUL.y - 12, 3, 24);
      font(500, 22); text(fmt(km), rx(km), RUL.y + 36, { align: 'center', base: 'middle', color: C.soft });
    }
    A(g, () => { font(500, 20); text('range, km (log scale)', RUL.L, RUL.y + 76, { base: 'middle', color: C.soft }); });
    // the banned band
    const b = eout(seg(t, 29.0, 30.0));
    A(b, () => {
      const y = RUL.y - 104, h = 76;
      ctx.fillStyle = 'rgba(199,144,47,0.55)'; ctx.fillRect(rx(RANGE.min), y, (rx(RANGE.mid) - rx(RANGE.min)) * b, h);
      ctx.fillStyle = C.band; ctx.fillRect(rx(RANGE.mid), y, (rx(RANGE.max) - rx(RANGE.mid)) * b, h);
      font(700, 17); text('shorter-', (rx(RANGE.min) + rx(RANGE.mid)) / 2, y + 26, { align: 'center', base: 'middle', color: '#fff' });
      text('range', (rx(RANGE.min) + rx(RANGE.mid)) / 2, y + 50, { align: 'center', base: 'middle', color: '#fff' });
      font(700, 24); text('intermediate-', (rx(RANGE.mid) + rx(RANGE.max)) / 2, y + 26, { align: 'center', base: 'middle', color: '#fff' });
      text('range', (rx(RANGE.mid) + rx(RANGE.max)) / 2, y + 52, { align: 'center', base: 'middle', color: '#fff' });
      font(600, 22);
      for (const km of [RANGE.min, RANGE.mid, RANGE.max]) { ctx.fillStyle = C.ink; ctx.fillRect(rx(km) - 1, y - 8, 2, h + 8 + 104 - 12); text(fmt(km), rx(km), y - 22, { align: 'center', base: 'middle' }); }
    });
    A(seg(t, 32.4, 33.0), () => {
      font(600, 22); text('over 5,500: not covered', RUL.R, RUL.y + 76, { align: 'right', base: 'middle', color: C.soft });
    });
    // basing: ground yes, ship and plane no
    const rows = [['launched from the ground', true], ['fired from a ship', false], ['fired from a plane', false]];
    rows.forEach(([s2, banned], i) => {
      const y = 520 + i * 70, on = seg(t, (banned ? 30.4 : 32.4) + i * 0.3, (banned ? 31.0 : 33.0) + i * 0.3);
      A(on, () => {
        font(600, 30); text(s2, 130, y, { base: 'middle' });
        font(700, 28); text(banned ? 'BANNED' : 'not covered', 772, y, { align: 'right', base: 'middle', color: banned ? C.stamp : C.soft });
        ctx.fillStyle = banned ? C.stamp : C.faint; ctx.beginPath(); ctx.arc(100, y, 11, 0, Math.PI * 2); ctx.fill();
      });
    });
  });
}

// 2,692 missiles: one glyph per 20, crossed off
function glyph(x, y, col, cut) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x + 5, y - 10); ctx.lineTo(x + 5, y + 12); ctx.lineTo(x + 9, y + 18); ctx.lineTo(x - 9, y + 18); ctx.lineTo(x - 5, y + 12); ctx.lineTo(x - 5, y - 10); ctx.closePath(); ctx.fill();
  if (cut > 0) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 11, y + 12); ctx.lineTo(lerp(x - 11, x + 11, cut), lerp(y + 12, y - 12, cut)); ctx.stroke(); }
}
function sceneDestroy(t) {
  const a = span(t, 36.8, 46.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('ELIMINATED BY 1 JUNE 1991');
    const groups = [[DESTROYED.us, C.us, 'United States', 190], [DESTROYED.su, C.su, 'Soviet Union', 400]];
    const cols = 24, dx = 28, dy = 46, x0 = CX - ((cols - 1) * dx) / 2;
    let done = 0;
    groups.forEach(([n, col, name, y0], gi) => {
      const glyphs = Math.ceil(n / PER_GLYPH);
      for (let i = 0; i < glyphs; i++) {
        const x = x0 + (i % cols) * dx, y = y0 + Math.floor(i / cols) * dy + 40;
        const on = seg(t, 37.0 + gi * 0.5 + i * 0.004, 37.4 + gi * 0.5 + i * 0.004);
        const cut = seg(t, 38.6 + (done + i) * 0.012, 38.9 + (done + i) * 0.012);
        A(on * (1 - 0.55 * cut), () => glyph(x, y, col, cut));
      }
      done += glyphs;
      A(seg(t, 41.4 + gi * 0.4, 42.0 + gi * 0.4), () => {
        font(700, 30); text(`${name}: ${fmt(n)}`, 92, y0, { base: 'middle', color: col });
      });
    });
    const count = Math.round(TOTAL * eio(seg(t, 38.6, 38.9 + 141 * 0.012)));
    font(800, 56); text(fmt(count), CX, 700, { align: 'center', base: 'middle' });
    font(500, 22); text(`missiles destroyed · one mark = ${PER_GLYPH} missiles`, CX, 746, { align: 'center', base: 'middle', color: C.soft });
  });
}

function sceneLater(t) {
  const a = eout(seg(t, 46.0, 46.6));
  if (a <= 0) return;
  A(a, () => {
    header('THE TREATY’S LIFE');
    const x = 236, rows = [
      ['8 Dec 1987', 'signed in Washington', 46.2],
      ['1 Jun 1988', 'in force; inspections begin', 46.6],
      ['1 Jun 1991', `all ${fmt(TOTAL)} missiles destroyed`, 47.0],
      ['31 May 2001', 'on-site inspections end', 50.8],
      ['2 Aug 2019', 'the United States withdraws', 52.4],
    ];
    const Y = (i) => 190 + i * 82;
    ctx.fillStyle = C.faint; ctx.fillRect(x - 2, Y(0), 4, Y(4) - Y(0));
    // inspections: from 1988 to 2001; short-notice visits the first three years
    const ins = eout(seg(t, 46.8, 47.8));
    ctx.fillStyle = C.band; ctx.fillRect(x - 7, Y(1), 14, (Y(3) - Y(1)) * ins);
    ctx.fillStyle = C.stamp; ctx.fillRect(x + 12, Y(1), 8, (Y(2) - Y(1)) * seg(t, 48.0, 48.8));
    rows.forEach(([d, s2, t0], i) => {
      A(seg(t, t0, t0 + 0.5), () => {
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, Y(i), 11, 0, Math.PI * 2); ctx.fill();
        font(700, 26); text(d, x - 26, Y(i), { align: 'right', base: 'middle' });
        font(500, 26); text(s2, x + 40, Y(i), { base: 'middle', color: C.ink });
      });
    });
    A(seg(t, 48.4, 49.0), () => { font(600, 22); text('up to 20 short-notice inspections a year', x + 40, (Y(1) + Y(2)) / 2 + 2, { base: 'middle', color: C.stamp }); });
    A(seg(t, 52.8, 53.4), () => {
      font(500, 22); text('US: Russia broke it with its 9M729 missile', x + 40, Y(4) + 40, { base: 'middle', color: C.us });
      text('Russia: denied it', x + 40, Y(4) + 72, { base: 'middle', color: C.su });
    });
    A(seg(t, 55.4, 56.2), () => {
      ctx.fillStyle = 'rgba(236,231,218,0.92)'; k.rrect(CX - 230, 626, 460, 132, 14); ctx.fill();
      ctx.strokeStyle = C.band; ctx.lineWidth = 4; ctx.stroke();
      font(800, 64); text(`${YEARS_IN_FORCE} years`, CX, 676, { align: 'center', base: 'middle', color: C.band });
      font(500, 24); text('in force, 1988–2019', CX, 728, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [MONO, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneTalks(t);
    sceneTreaty(t);
    sceneRange(t);
    sceneDestroy(t);
    sceneLater(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 700, family: SERIF, ink: C.ink, marks: { '*': C.us, '~': C.su, '^': C.band } });
  },
});
