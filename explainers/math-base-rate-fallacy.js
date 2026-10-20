// Explainer for math-base-rate-fallacy: a 99%-accurate alarm is wrong 99 times in 100 when it rings.
// Look: a clean clinical lab report. Near-white paper with a faint blueprint grid and a margin ruler,
// slate and steel-blue ink, one alarm red for everyone the camera flags, hairlines, IBM Plex Sans
// for captions and IBM Plex Mono for every label and number.
//
// Scene plan (53.5 s). Everything important sits above y = 930; captions are centred at y = 830.
//  A  0.0–15.0  Hook: the camera's spec sheet (spots 99% of terrorists, wrongly flags 1% of everyone
//               else), the alarm lamp fires, a readout asks how likely a flagged person is a terrorist.
//               "The tempting answer: 99%."
//  B 14.8–27.2  The city: 1,000,000 people as 10,000 dots of 100, revealed by a scan line. The 100
//               terrorists are one dot; a detail view shows it as 100 people, 99 of them flagged.
//  C 26.9–34.4  False alarms: a red scan line flags 1% of the 999,900 others, 9,999 people (100 dots,
//               the last holding 99). The counter runs up as it passes.
//  D 34.2–47.0  Flagged only: everyone else fades, the flagged dots gather and open up into single
//               people: 9,999 innocent dots against one small block of 99 terrorists. 99 / 10,098 =
//               0.98%, under 1%.
//  E 46.8–53.5  Payoff card: 0.98%, 99 ÷ 10,098, "base rate fallacy", the source.
//
// Facts (Wikipedia, "Base rate fallacy", terrorist-identification example): a city of 1 million with
// 100 terrorists and 999,900 non-terrorists; the bell rings for 99% of terrorists and for 1% of
// non-terrorists; about 99 terrorists and about 9,999 non-terrorists trigger it, about 10,098 in all;
// so the chance that someone who triggers it is a terrorist is about 99 in 10,098, under 1%, far
// below "the initial guess of 99%". All counts below are computed from those rates.
const W = 864, H = 1080;
const { clamp, seg, lerp, fmt, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#F5F7F9', gridMinor: 'rgba(62,110,158,0.055)', gridMajor: 'rgba(62,110,158,0.12)',
  ink: '#1C2A3A', slate: '#56677A', hair: 'rgba(28,42,58,0.28)', dot: '#B3BFCC',
  steel: '#2F6496', steelSoft: 'rgba(47,100,150,0.10)', red: '#D3263B', redSoft: 'rgba(211,38,59,0.10)', card: '#FFFFFF',
};
const SANS = 'IBM Plex Sans', MONO = 'IBM Plex Mono';

let k, ctx;
const font = (weight, size, family = SANS) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const mono = (weight, size) => font(weight, size, MONO);

// ---------- the numbers, from the source's rates ----------
const POP = 1_000_000, TERR = 100, INNOCENT = POP - TERR; // 999,900
const HIT = 0.99, FALSE_RATE = 0.01;
const CAUGHT = Math.round(TERR * HIT); // 99
const FALSE_ALARMS = Math.round(INNOCENT * FALSE_RATE); // 9,999
const ALARMS = CAUGHT + FALSE_ALARMS; // 10,098
const SHARE = (100 * CAUGHT) / ALARMS; // 0.98 %
const PER_DOT = 100;
const FALSE_DOTS = Math.ceil(FALSE_ALARMS / PER_DOT); // 100 dots, the last one holding 99 people
const pct = (x) => `${x.toFixed(2)}%`;

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the city grid: 100 × 100 dots, each 100 people ----------
const G = { x: 64, y: 168, n: 100, pitch: 5.4, r: 1.75 };
const cellXY = (c, r) => [G.x + G.pitch / 2 + c * G.pitch, G.y + G.pitch / 2 + r * G.pitch];
const TERR_CELL = [58, 40];
const FALSE_CELLS = [];
{
  const rnd = mulberry32(2024), used = new Set([TERR_CELL[1] * G.n + TERR_CELL[0]]);
  while (FALSE_CELLS.length < FALSE_DOTS) {
    const id = Math.floor(rnd() * G.n * G.n);
    if (used.has(id)) continue;
    used.add(id); FALSE_CELLS.push(id);
  }
  FALSE_CELLS.sort((a, b) => a - b);
}
// people in each flagged dot: 100 each, with the remainder in one of them (9,999 = 99 × 100 + 99)
const DOTS = FALSE_CELLS.map((id, i) => ({ c: id % G.n, r: Math.floor(id / G.n), people: i === FALSE_DOTS - 1 ? FALSE_ALARMS - PER_DOT * (FALSE_DOTS - 1) : PER_DOT }));
// the 100 terrorists in the detail view: 99 flagged, one missed
const DETAIL_ORDER = [];
{
  const rnd = mulberry32(99);
  const ids = [...Array(TERR).keys()];
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  DETAIL_ORDER.push(...ids);
}
const MISSED = DETAIL_ORDER[TERR - 1];
const FLAG_AT = new Map(DETAIL_ORDER.slice(0, CAUGHT).map((id, i) => [id, 23.5 + (i / CAUGHT) * 1.5]));

// ---------- timeline ----------
// B, C and D hand over without a crossfade (they draw the same grid), so nothing dips.
const T = { A: [0, 15.0], B: [14.8, 27.0], C: [27.0, 34.3], D: [34.3, 47.0], E: [46.8, 53.5] };
const CUES = [
  [0.4, 3.9, 'A camera spots ~99%~ of terrorists.'],
  [4.0, 7.6, 'It wrongly flags only *1%* of everyone else.'],
  [7.7, 12.1, 'The alarm goes off. What are the odds it caught a terrorist?'],
  [12.2, 15.0, 'The tempting answer: ~99%~.'],
  [15.1, 19.4, `Picture a city of ${fmt(POP)}. Each dot is ${PER_DOT} people.`],
  [19.5, 22.9, `Just ~${TERR}~ are terrorists: a single dot.`],
  [23.0, 26.9, `The alarm catches ~${CAUGHT}~ of them.`],
  [27.0, 31.0, `But it also flags 1% of the *${fmt(INNOCENT)}* others…`],
  [31.1, 34.3, `…that’s *${fmt(FALSE_ALARMS)}* false alarms.`],
  [34.4, 38.3, `Now keep only the *${fmt(ALARMS)}* people the alarm flagged.`],
  [38.4, 42.2, `~${CAUGHT}~ terrorists. *${fmt(FALSE_ALARMS)}* innocent people.`],
  [42.3, 46.9, 'So when it rings, it’s a terrorist less than ~1%~ of the time.'],
  [47.0, 51.4, 'Forgetting how ~rare~ the target is: the *base rate fallacy*.'],
];

// ---------- painted once ----------
let bg = null, cityImg = null, blockRed = null, blockRedPartial = null, blockTerr = null;
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function paintOnce() {
  bg = canvas(W, H);
  let g = bg.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  g.lineWidth = 1;
  for (let x = 0.5; x < W; x += 18) { g.strokeStyle = Math.round((x - 0.5) / 18) % 5 === 0 ? C.gridMajor : C.gridMinor; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0.5; y < H; y += 18) { g.strokeStyle = Math.round((y - 0.5) / 18) % 5 === 0 ? C.gridMajor : C.gridMinor; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // margin ruler
  g.strokeStyle = 'rgba(28,42,58,0.25)';
  for (let y = 144, i = 0; y <= 900; y += 9, i++) { const len = i % 10 === 0 ? 14 : i % 5 === 0 ? 9 : 5; g.beginPath(); g.moveTo(26, y + 0.5); g.lineTo(26 + len, y + 0.5); g.stroke(); }
  g.beginPath(); g.moveTo(26.5, 144); g.lineTo(26.5, 900); g.stroke();
  const vg = g.createRadialGradient(W / 2, H / 2, 380, W / 2, H / 2, 780);
  vg.addColorStop(0, 'rgba(47,100,150,0)'); vg.addColorStop(1, 'rgba(47,100,150,0.07)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);

  cityImg = canvas(W, H);
  g = cityImg.getContext('2d');
  g.fillStyle = C.dot;
  for (let r = 0; r < G.n; r++) for (let c = 0; c < G.n; c++) { const [x, y] = cellXY(c, r); g.beginPath(); g.arc(x, y, G.r, 0, Math.PI * 2); g.fill(); }

  const block = (n, colour, rad) => {
    const b = canvas(50, 50), bg2 = b.getContext('2d');
    bg2.fillStyle = colour;
    for (let i = 0; i < n; i++) { const c = i % 10, r = Math.floor(i / 10); bg2.beginPath(); bg2.arc(2.5 + c * 5, 2.5 + r * 5, rad, 0, Math.PI * 2); bg2.fill(); }
    return b;
  };
  blockRed = block(100, C.red, 1.65);
  blockRedPartial = block(DOTS[FALSE_DOTS - 1].people, C.red, 1.65);
  blockTerr = block(CAUGHT, C.ink, 1.85);
}

function background() {
  if (!bg) paintOnce();
  ctx.drawImage(bg, 0, 0);
  mono(600, 22); text('RECKON', 64, 80, { color: C.ink, spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 18;
  mono(400, 22); text('SCREENING REPORT · MATH', 64 + w + 18, 80, { color: C.slate, spacing: '1px' });
  ctx.strokeStyle = C.hair; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(64, 100.5); ctx.lineTo(712, 100.5); ctx.stroke();
}

// ---------- scene A: the spec sheet and the question ----------
function sceneA(t) {
  const card = eout(seg(t, 0.2, 0.9));
  withAlpha(card, () => {
    const x = 96, y = 146 + (1 - card) * 12, w = 672, h = 292;
    ctx.fillStyle = C.card; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.hair; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    mono(600, 22); text('CAMERA SPECIFICATION', x + 28, y + 42, { color: C.steel, spacing: '2px' });
    ctx.strokeStyle = C.hair; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 28, y + 62.5); ctx.lineTo(x + w - 28, y + 62.5); ctx.stroke();
    const rows = [
      ['Terrorists it spots', 'TRUE ALARM RATE', `${Math.round(HIT * 100)}%`, C.steel, 0.6],
      ['Innocent people it flags', 'FALSE ALARM RATE', `${Math.round(FALSE_RATE * 100)}%`, C.red, 4.1],
    ];
    rows.forEach(([label, sub, value, colour, at], i) => {
      const ry = y + 76 + i * 108, p = eout(seg(t, at, at + 0.5));
      withAlpha(p, () => {
        font(500, 32); text(label, x + 28, ry + 44 + (1 - p) * 8, { color: C.ink });
        mono(400, 22); text(sub, x + 28, ry + 80 + (1 - p) * 8, { color: C.slate, spacing: '1px' });
        mono(600, 76); text(value, x + w - 28, ry + 78 + (1 - p) * 8, { color: colour, align: 'right' });
      });
      if (i === 0) withAlpha(seg(t, 4.0, 4.4), () => { ctx.strokeStyle = C.hair; ctx.beginPath(); ctx.moveTo(x + 28, ry + 104.5); ctx.lineTo(x + w - 28, ry + 104.5); ctx.stroke(); });
    });
  });

  // the alarm lamp
  const fire = seg(t, 7.8, 8.1);
  withAlpha(eout(seg(t, 1.0, 1.6)), () => lamp(196, 600, fire, t));

  // the question readout
  withAlpha(eout(seg(t, 8.0, 8.6)), () => {
    const x = 316, y = 494, w = 452, h = 196;
    ctx.fillStyle = C.card; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.hair; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    mono(400, 22); text('IF THE ALARM RINGS,', x + 26, y + 40, { color: C.slate, spacing: '1px' });
    text('CHANCE IT IS A TERRORIST', x + 26, y + 70, { color: C.slate, spacing: '1px' });
    const hide = seg(t, 12.2, 12.45), guess = seg(t, 12.45, 12.8);
    mono(600, 84);
    withAlpha(1 - hide, () => {
      text('??', x + 26, y + 164, { color: C.ink });
      if (Math.sin(ambient * 7) > -0.2) { ctx.fillStyle = C.steel; ctx.fillRect(x + 26 + ctx.measureText('??').width + 10, y + 104, 6, 64); }
    });
    withAlpha(guess, () => text('99%?', x + 26, y + 164 + (1 - eout(guess)) * 10, { color: 'rgba(47,100,150,0.55)' }));
  });
}

/** A beacon lamp; fire 0..1 lights it and sends out pulses. */
function lamp(cx, cy, fire, t) {
  // pulses
  if (fire > 0) {
    for (let i = 0; i < 3; i++) {
      const ph = ((t - 7.8) * 0.9 + i / 3) % 1;
      ctx.strokeStyle = `rgba(211,38,59,${0.5 * (1 - ph) * fire})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy - 26, 52 + ph * 70, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    }
  }
  // base
  ctx.fillStyle = C.ink; rrect(cx - 62, cy + 30, 124, 26, 4); ctx.fill();
  ctx.fillStyle = C.slate; rrect(cx - 50, cy + 18, 100, 14, 3); ctx.fill();
  // dome
  const on = fire * (0.75 + 0.25 * Math.sin(ambient * 12));
  ctx.beginPath(); ctx.moveTo(cx - 44, cy + 18); ctx.lineTo(cx - 44, cy - 20); ctx.arc(cx, cy - 20, 44, Math.PI, 0); ctx.lineTo(cx + 44, cy + 18); ctx.closePath();
  const dg = ctx.createLinearGradient(cx - 44, 0, cx + 44, 0);
  dg.addColorStop(0, `rgba(${Math.round(lerp(220, 211, fire))},${Math.round(lerp(228, 38, fire))},${Math.round(lerp(236, 59, fire))},1)`);
  dg.addColorStop(1, `rgba(${Math.round(lerp(196, 160, fire))},${Math.round(lerp(206, 20, fire))},${Math.round(lerp(218, 40, fire))},1)`);
  ctx.fillStyle = dg; ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
  if (on > 0) {
    const gl = ctx.createRadialGradient(cx, cy - 20, 4, cx, cy - 20, 120);
    gl.addColorStop(0, `rgba(255,120,130,${0.35 * on})`); gl.addColorStop(1, 'rgba(255,120,130,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy - 20, 120, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; rrect(cx - 26, cy - 46, 10, 40, 5); ctx.fill();
  mono(600, 22); text(fire > 0.5 ? 'ALARM' : 'STANDBY', cx, cy + 92, { color: fire > 0.5 ? C.red : C.slate, align: 'center', spacing: '2px' });
}

// ---------- the city (scenes B, C, D share these layers) ----------
function figLabel(s, a) {
  withAlpha(a, () => { mono(500, 22); text(s, G.x, 150, { color: C.steel, spacing: '1px' }); });
}
function panelRow(i, label, value, colour, a, y0 = 190) {
  withAlpha(a, () => {
    const y = y0 + i * 92 + (1 - eout(clamp(a))) * 8;
    mono(400, 22); text(label, 636, y, { color: C.slate, spacing: '1px' });
    mono(600, 30); text(value, 636, y + 38, { color: colour });
    ctx.strokeStyle = C.hair; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(636, y + 56.5); ctx.lineTo(800, y + 56.5); ctx.stroke();
  });
}
function scanLine(y, colour, a) {
  withAlpha(a, () => {
    const lg = ctx.createLinearGradient(0, y - 26, 0, y);
    lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(1, colour === C.red ? 'rgba(211,38,59,0.16)' : 'rgba(47,100,150,0.16)');
    ctx.fillStyle = lg; ctx.fillRect(G.x - 8, y - 26, G.n * G.pitch + 16, 26);
    ctx.fillStyle = colour; ctx.fillRect(G.x - 8, y - 1, G.n * G.pitch + 16, 2);
  });
}
const GRID_H = G.n * G.pitch;
const SCAN1 = [15.0, 16.8], SCAN2 = [27.4, 31.0];
const scanY = (t, [a, b]) => G.y + eio(seg(t, a, b)) * GRID_H;
const passedAt = (y, [a, b]) => {
  // time at which the scan line reaches height y (inverse of the eased sweep, by bisection)
  let lo = a, hi = b;
  for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (scanY(m, [a, b]) < y) lo = m; else hi = m; }
  return hi;
};
const DOT_FLAG_T = DOTS.map((d) => passedAt(cellXY(d.c, d.r)[1], SCAN2));
const [TX, TY] = cellXY(...TERR_CELL);

function cityGrid(t, fade = 1) {
  const reveal = scanY(t, SCAN1);
  withAlpha(fade, () => {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, reveal); ctx.clip();
    ctx.drawImage(cityImg, 0, 0);
    ctx.restore();
  });
}

function terrDot(x, y, r, flagged, alpha = 1) {
  withAlpha(alpha, () => {
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    if (flagged > 0) { ctx.strokeStyle = `rgba(211,38,59,${flagged})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, r + 2.2, 0, Math.PI * 2); ctx.stroke(); }
  });
}

function sceneB(t) {
  cityGrid(t);
  scanLine(scanY(t, SCAN1), C.steel, span(t, SCAN1[0], SCAN1[1] + 0.2, 0.2, 0.3));
  figLabel(`FIG. 1 · 1 DOT = ${PER_DOT} PEOPLE`, seg(t, 15.2, 15.7));
  panelRow(0, 'PEOPLE', fmt(POP), C.ink, seg(t, 15.4, 15.9));
  panelRow(1, 'TERRORISTS', fmt(TERR), C.steel, seg(t, 19.6, 20.1));
  panelRow(2, 'CAUGHT', String(CAUGHT), C.steel, seg(t, 24.8, 25.3));

  // the one dot that holds all 100 terrorists
  const hl = eout(seg(t, 19.6, 20.1));
  if (hl > 0) {
    terrDot(TX, TY, lerp(G.r, 2.6, hl), seg(t, 24.6, 25.0));
    const ph = ((t - 19.6) * 0.8) % 1;
    ctx.strokeStyle = `rgba(47,100,150,${0.7 * (1 - ph) * hl * (1 - seg(t, 25.8, 26.6))})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(TX, TY, 6 + ph * 22, 0, Math.PI * 2); ctx.stroke();
    // label
    const lab = seg(t, 19.9, 20.4) * (1 - seg(t, 22.7, 23.1));
    withAlpha(lab, () => {
      ctx.strokeStyle = C.steel; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(TX + 7, TY - 7); ctx.lineTo(TX + 40, TY - 40); ctx.lineTo(TX + 60, TY - 40); ctx.stroke();
      mono(600, 22); const s = `${TERR} TERRORISTS`, w = ctx.measureText(s).width;
      ctx.fillStyle = C.card; ctx.fillRect(TX + 60, TY - 58, w + 20, 34);
      ctx.strokeStyle = C.steel; ctx.strokeRect(TX + 60.5, TY - 57.5, w + 19, 33);
      text(s, TX + 70, TY - 34, { color: C.steel });
    });
  }
  // detail view of that dot: 100 people, 99 flagged
  const dv = eout(seg(t, 22.9, 23.4)) * (1 - seg(t, 26.6, 27.0));
  withAlpha(dv, () => {
    const x = 96, y = 430, w = 360, h = 300;
    ctx.strokeStyle = 'rgba(47,100,150,0.55)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(TX, TY); ctx.lineTo(x + w, y); ctx.moveTo(TX, TY); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.shadowColor = 'rgba(28,42,58,0.16)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 4;
    ctx.fillStyle = C.card; ctx.fillRect(x, y, w, h); ctx.restore();
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    mono(500, 22); text('DETAIL · THAT ONE DOT', x + 20, y + 34, { color: C.steel, spacing: '1px' });
    const pitch = 19, gx = x + (w - 10 * pitch) / 2 + pitch / 2, gy = y + 60;
    for (let i = 0; i < TERR; i++) {
      const cx = gx + (i % 10) * pitch, cy = gy + Math.floor(i / 10) * pitch;
      const ft = FLAG_AT.get(i);
      const f = ft === undefined ? 0 : seg(t, ft, ft + 0.15);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      if (f > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(cx, cy, 5 + 2.8 * back(f), 0, Math.PI * 2); ctx.stroke(); }
    }
    // the one it missed: no red ring, picked out after the others are drawn
    withAlpha(seg(t, 25.1, 25.5), () => {
      const cx = gx + (MISSED % 10) * pitch, cy = gy + Math.floor(MISSED / 10) * pitch;
      ctx.fillStyle = C.card; ctx.fillRect(cx - pitch / 2, cy - pitch / 2, pitch, pitch);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.steel; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
      ctx.strokeRect(cx - pitch / 2 + 1, cy - pitch / 2 + 1, pitch - 2, pitch - 2); ctx.setLineDash([]);
    });
    const n = [...FLAG_AT.values()].filter((ft) => t >= ft).length;
    mono(500, 22);
    text(`FLAGGED ${String(n).padStart(2, ' ')}`, x + 20, y + h - 22, { color: C.red });
    withAlpha(seg(t, 25.1, 25.5), () => text('MISSED 1', x + w - 20, y + h - 22, { color: C.steel, align: 'right' }));
  });
}

function sceneC(t) {
  cityGrid(t);
  figLabel(`FIG. 1 · 1 DOT = ${PER_DOT} PEOPLE`, 1);
  panelRow(0, 'PEOPLE', fmt(POP), C.ink, 1);
  panelRow(1, 'TERRORISTS', fmt(TERR), C.steel, 1);
  panelRow(2, 'CAUGHT', String(CAUGHT), C.steel, 1);
  let falseCount = 0;
  DOTS.forEach((d, i) => {
    const ft = DOT_FLAG_T[i];
    if (t < ft) return;
    falseCount += d.people;
    const [x, y] = cellXY(d.c, d.r);
    const p = seg(t, ft, ft + 0.18);
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(x, y, G.r + 0.5 * p, 0, Math.PI * 2); ctx.fill();
    const q = seg(t, ft, ft + 0.6);
    if (q < 1) { ctx.strokeStyle = `rgba(211,38,59,${0.7 * (1 - q)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 3 + 10 * eout(q), 0, Math.PI * 2); ctx.stroke(); }
  });
  terrDot(TX, TY, 2.6, 1);
  scanLine(scanY(t, SCAN2), C.red, span(t, SCAN2[0], SCAN2[1] + 0.2, 0.2, 0.3));
  panelRow(3, 'FALSE ALARMS', fmt(falseCount), C.red, seg(t, 27.3, 27.7));
  panelRow(4, 'ALL ALARMS', fmt(ALARMS), C.red, seg(t, 31.3, 31.8));
}

// ---------- scene D: only the flagged ----------
const BLOCK = { pitch: 54 };
const blockXY = (i) => [G.x + 2 + (i % 10) * BLOCK.pitch, G.y + 2 + Math.floor(i / 10) * BLOCK.pitch];
const TB = { x: 650, y: 318 }; // where the terrorists' block lands in the panel

function sceneD(t) {
  const ghost = 1 - 0.93 * eio(seg(t, 34.5, 35.5));
  cityGrid(t, ghost);
  figLabel(`FIG. 1 · 1 DOT = ${PER_DOT} PEOPLE`, 1 - seg(t, 34.6, 35.0));
  figLabel('FIG. 2 · FLAGGED ONLY · 1 DOT = 1 PERSON', seg(t, 37.6, 38.1));
  // left panel rows fade, new ones come in
  const out = 1 - seg(t, 34.6, 35.1);
  panelRow(0, 'PEOPLE', fmt(POP), C.ink, out);
  panelRow(1, 'TERRORISTS', fmt(TERR), C.steel, out);
  panelRow(2, 'CAUGHT', String(CAUGHT), C.steel, out);
  panelRow(3, 'FALSE ALARMS', fmt(FALSE_ALARMS), C.red, out);
  panelRow(0, 'ALL ALARMS', fmt(ALARMS), C.red, 1, lerp(190 + 4 * 92, 190, eio(seg(t, 35.0, 36.0))));
  // gather and open up
  const opened = seg(t, 37.0, 37.9);
  DOTS.forEach((d, i) => {
    const [x0, y0] = cellXY(d.c, d.r);
    const [bx, by] = blockXY(i);
    const st = 35.4 + (i / FALSE_DOTS) * 0.5;
    const e = eio(seg(t, st, st + 1.2));
    const x = lerp(x0, bx + 25, e), y = lerp(y0, by + 25, e), r = lerp(G.r + 0.5, 25, e);
    withAlpha(1 - opened, () => { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
    withAlpha(opened, () => ctx.drawImage(d.people === PER_DOT ? blockRed : blockRedPartial, bx, by));
  });
  // the terrorists' dot goes to the panel
  {
    const e = eio(seg(t, 35.6, 36.9));
    const x = lerp(TX, TB.x + 25, e), y = lerp(TY, TB.y + 25, e), r = lerp(2.6, 25, e);
    withAlpha(1 - opened, () => terrDot(x, y, r, 1 - e));
    withAlpha(opened, () => {
      ctx.drawImage(blockTerr, TB.x, TB.y);
    });
  }
  withAlpha(seg(t, 38.3, 38.8), () => {
    mono(600, 22); text('TERRORISTS', 636, TB.y - 18, { color: C.ink, spacing: '1px' });
    mono(600, 34); text(String(CAUGHT), TB.x + 66, TB.y + 37, { color: C.ink });
    ctx.strokeStyle = C.hair; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(636, TB.y + 70.5); ctx.lineTo(800, TB.y + 70.5); ctx.stroke();
    mono(600, 22); text('INNOCENT', 636, TB.y + 108, { color: C.red, spacing: '1px' });
    mono(600, 34); text(fmt(FALSE_ALARMS), 636, TB.y + 148, { color: C.red });
    // arrow to the big block
    ctx.strokeStyle = C.red; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(630, TB.y + 136); ctx.lineTo(614, TB.y + 136); ctx.stroke();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(610, TB.y + 136); ctx.lineTo(618, TB.y + 131); ctx.lineTo(618, TB.y + 141); ctx.closePath(); ctx.fill();
  });
  withAlpha(seg(t, 42.4, 42.9), () => {
    ctx.fillStyle = C.steelSoft; ctx.fillRect(630, 504, 172, 104);
    mono(400, 22); text('REAL HITS', 640, 536, { color: C.steel, spacing: '1px' });
    mono(600, 40); text(pct(SHARE), 640, 584, { color: C.steel });
  });
}

// ---------- scene E: the finding ----------
function sceneE(t) {
  const p = eout(seg(t, 46.9, 47.6));
  withAlpha(p, () => {
    const x = 96, y = 150 + (1 - p) * 12, w = 672, h = 520;
    ctx.fillStyle = C.card; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.hair; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    mono(600, 22); text('FINDING', x + 32, y + 46, { color: C.steel, spacing: '2px' });
    ctx.strokeStyle = C.hair; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 32, y + 66.5); ctx.lineTo(x + w - 32, y + 66.5); ctx.stroke();
    mono(600, 132); text(pct(SHARE), W / 2, y + 206, { color: C.steel, align: 'center' });
    font(500, 32); text('of the people it flags are terrorists', W / 2, y + 262, { color: C.ink, align: 'center' });
    mono(400, 30); text(`${CAUGHT} ÷ ${fmt(ALARMS)}`, W / 2, y + 314, { color: C.slate, align: 'center' });
    ctx.strokeStyle = C.hair; ctx.beginPath(); ctx.moveTo(x + 32, y + 356.5); ctx.lineTo(x + w - 32, y + 356.5); ctx.stroke();
    withAlpha(seg(t, 47.4, 47.9), () => {
      font(700, 52); text('Base rate fallacy', W / 2, y + 434, { color: C.red, align: 'center' });
      font(500, 28); text('ignoring how rare the thing you hunt is', W / 2, y + 478, { color: C.slate, align: 'center' });
    });
    mono(400, 22); text('Source: Wikipedia, “Base rate fallacy”', W / 2, y + h + 42, { color: C.slate, align: 'center' });
  });
}

// ---------- captions with balanced lines ----------
const CAP = { size: 44, lh: 56, weight: 600, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 830, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SANS, ink: C.ink, marks: { '*': C.red, '~': C.steel } });
  }
}

// The clip's own time, from tools.clock: it runs on while a step holds for reading, so the decorative
// motion below uses it; the story itself uses t.
let ambient = 0;

Kit.scene({
  width: W, height: H, duration: 53.5,
  fonts: [
    { family: SANS, file: 'IBMPlexSans.woff2', weight: '400 700' },
    { family: MONO, file: 'IBMPlexMono-Regular.woff2', weight: '400' },
    { family: MONO, file: 'IBMPlexMono-SemiBold.woff2', weight: '600' },
  ],
  draw(t, tools) {
    ambient = tools.clock;
    k = tools; ctx = tools.ctx;
    background();
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B, 0.35, 0], [sceneC, T.C, 0, 0], [sceneD, T.D, 0, 0.35], [sceneE, T.E, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
