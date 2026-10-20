// Explainer for economics-hungary-hyperinflation: in 1946 Hungary's prices at one stage doubled about every 15 hours.
// Look: an engraved 1940s banknote. Cream paper, fine green guilloche rosettes and bands drawn by code,
// bottle-green and oxblood ink, ornamental double-rule borders. Playfair Display for numbers and headings,
// Libre Franklin for captions and labels.
//
// Scene plan (prices on the clock are computed: price = 2^(hours / 15), starting from 1 pengő):
//   A  0.0–8.4   Hook: a 24-hour clock and a price tag reading 1 pengő.
//                "How fast can prices really rise?" / "In 1946 Hungary, prices at one stage doubled about every 15 hours."
//   B  8.4–22.8  The clock runs: 2 pengő at hour 15, about 3 after one day, then ten days fly by: 16 doublings, 65,536.
//                "Start the clock with a price of 1 pengő." / "15 hours later: 2 pengő." /
//                "At that pace, prices roughly tripled every day." / "Ten days: 16 doublings, 65,536 pengő."
//   C 22.6–33.8  The biggest note issued: 100 quintillion pengő written out runs out of room on the note, then
//                collapses to "100 000 000 B.-PENGŐ". "Hungary's biggest note issued, July 1946: 100 quintillion pengő." /
//                "To cut the zeros, it read 100 million b.-pengő…" / "…and one b.-pengő meant a trillion pengő."
//   D 33.6–42.4  Black-market price of one US dollar, July 1945 to late July 1946, written out in full: a staircase
//                of digits from 1,320 to 4.6 nonillion (31 digits). "On the black market, $1 cost 1,320 pengő
//                in July 1945…" / "…and 4.6 nonillion by late July 1946: a 31-digit number."
//   E 42.2–50.0  The reset: 1 forint = 400 octillion pengő, 29 zeros dropped. "On 1 August 1946, Hungary switched to
//                the forint…" / "…at 400 octillion pengő each: 29 zeros gone."
//   F 49.8–54.5  End card. "The most extreme hyperinflation ever recorded."
// Facts: Wikipedia, "Hungarian pengő" (lead; Hyperinflation section; Banknotes section; black-market exchange-rate table).
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const SERIF = 'Playfair Display', SANS = 'Libre Franklin';

const C = {
  paper: '#EFE6CC', paperDeep: '#E5D9B8', note: '#E4E5CC', ink: '#1A3327', green: '#1F5A40', greenSoft: 'rgba(31,90,64,0.55)',
  line: 'rgba(31,90,64,0.24)', faint: 'rgba(31,90,64,0.10)', ox: '#7E1F2A', oxSoft: 'rgba(126,31,42,0.16)', soft: 'rgba(26,51,39,0.68)',
};

let k, ctx;
const font = (weight, size, family = SANS, style = '') => { ctx.font = `${style} ${weight} ${size}px ${family}`; };
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- numbers ----------
const group = (digits, sep = ' ') => digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
const DOUBLING_HOURS = 15;
const price = (hours) => Math.pow(2, hours / DOUBLING_HOURS);
const fmtPrice = (v) => (v < 1000 ? v.toFixed(2) : Math.round(v).toLocaleString('en-US'));
// Black-market price of US$1 in pengő (Wikipedia, "Hungarian pengő", black market exchange rates table).
const DOLLAR = [
  ['Jul 1945', '1320'], ['Aug 1945', '1510'], ['Sep 1945', '5400'], ['Oct 1945', '23500'],
  ['Nov 1945', '108000'], ['Dec 1945', '290000'], ['Jan 1946', '795000'], ['Feb 1946', '2850000'],
  ['Mar 1946', '17750000'], ['Apr 1946', '232000000'], ['May 1946', '59' + '0'.repeat(9)],
  ['early Jun 1946', '76' + '0'.repeat(11)], ['late Jun 1946', '42' + '0'.repeat(15)],
  ['Jul 1946, wk 1', '22' + '0'.repeat(18)], ['Jul 1946, wk 2', '4815' + '0'.repeat(20)],
  ['Jul 1946, wk 3', '58' + '0'.repeat(23)], ['Jul 1946, wk 4', '46' + '0'.repeat(29)],
];
const BIG_NOTE_ZEROS = 20;   // 100 million b.-pengő = 10^20 pengő
const B_PENGO_ZEROS = 12;    // 1 b.-pengő = 10^12 pengő
const FORINT_ZEROS = 29;     // 1 forint = 4 × 10^29 pengő

// ---------- guilloche ----------
/** A guilloche rosette: rings of phase-shifted wavy loops that weave into a lattice. */
function rosette(g, cx, cy, R, color, { lw = 0.7, strands = 8, rings = [[0.6, 1, 24], [0.26, 0.64, 12]] } = {}) {
  g.save(); g.strokeStyle = color; g.lineWidth = lw;
  for (const [a, b, n] of rings) {
    for (let s = 0; s < strands; s++) {
      const ph = (s / strands) * TAU;
      g.beginPath();
      for (let i = 0; i <= 960; i++) {
        const th = (i / 960) * TAU, r = R * (a + (b - a) * (0.5 + 0.5 * Math.sin(n * th + ph)));
        i ? g.lineTo(cx + r * Math.cos(th), cy + r * Math.sin(th)) : g.moveTo(cx + r * Math.cos(th), cy + r * Math.sin(th));
      }
      g.closePath(); g.stroke();
    }
  }
  g.beginPath(); g.arc(cx, cy, R * 0.18, 0, TAU); g.stroke();
  g.restore();
}
/** Interlaced sine waves between two rails: the classic banknote border band. */
function band(g, x0, y0, x1, y1, color, waves = 6, lw = 0.7) {
  g.save(); g.strokeStyle = color; g.lineWidth = lw;
  const horiz = Math.abs(x1 - x0) > Math.abs(y1 - y0);
  const len = horiz ? x1 - x0 : y1 - y0, thick = horiz ? y1 - y0 : x1 - x0, lam = 22;
  for (let w = 0; w < waves; w++) {
    g.beginPath();
    for (let s = 0; s <= len; s += 2) {
      const off = thick / 2 + (thick / 2 - 2) * Math.sin((s / lam) * TAU + (w / waves) * TAU);
      const x = horiz ? x0 + s : x0 + off, y = horiz ? y0 + off : y0 + s;
      s ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
  }
  g.restore();
}
function frame(g, x, y, w, h, color, { bandW = 22, gap = 5 } = {}) {
  g.strokeStyle = color; g.lineWidth = 2; g.strokeRect(x, y, w, h);
  g.lineWidth = 0.8; g.strokeRect(x + 4, y + 4, w - 8, h - 8);
  const ix = x + 4 + gap, iy = y + 4 + gap, iw = w - 8 - 2 * gap, ih = h - 8 - 2 * gap;
  band(g, ix + bandW, iy, ix + iw - bandW, iy + bandW, color);
  band(g, ix + bandW, iy + ih - bandW, ix + iw - bandW, iy + ih, color);
  band(g, ix, iy + bandW, ix + bandW, iy + ih - bandW, color);
  band(g, ix + iw - bandW, iy + bandW, ix + iw, iy + ih - bandW, color);
  for (const [cx, cy] of [[ix + bandW / 2, iy + bandW / 2], [ix + iw - bandW / 2, iy + bandW / 2], [ix + bandW / 2, iy + ih - bandW / 2], [ix + iw - bandW / 2, iy + ih - bandW / 2]]) {
    g.lineWidth = 0.7; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(cx, cy, bandW * 0.48, bandW * 0.16, (i * Math.PI) / 8, 0, TAU); g.stroke(); }
  }
  g.lineWidth = 0.8; g.strokeRect(ix + bandW + 3, iy + bandW + 3, iw - 2 * bandW - 6, ih - 2 * bandW - 6);
  g.lineWidth = 1.6; g.strokeRect(ix + bandW + 7, iy + bandW + 7, iw - 2 * bandW - 14, ih - 2 * bandW - 14);
}

function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

let BG, DIAL, NOTE;
function makeBackground() {
  const c = canvas(W, H), g = c.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  const rnd = mulberry(1946);
  for (let i = 0; i < 70; i++) { // soft mottling
    const x = rnd() * W, y = rnd() * H, r = 60 + rnd() * 220;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rnd() < 0.5 ? 'rgba(160,130,70,0.05)' : 'rgba(255,255,240,0.08)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  g.lineWidth = 0.6;
  for (let i = 0; i < 900; i++) { // paper fibres
    const x = rnd() * W, y = rnd() * H, a = rnd() * TAU, l = 4 + rnd() * 12;
    g.strokeStyle = `rgba(110,90,50,${0.04 + rnd() * 0.06})`;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.6 + 2, y + Math.sin(a) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // a large faint rosette behind everything, for depth
  rosette(g, W / 2, 430, 330, 'rgba(31,90,64,0.075)', { lw: 0.8, strands: 5, rings: [[0.62, 1, 20], [0.28, 0.66, 10]] });
  // the outer border of the "note"
  frame(g, 20, 20, W - 40, H - 40, 'rgba(31,90,64,0.55)', { bandW: 24 });
  // caption cartouche
  g.save();
  g.beginPath(); g.roundRect(68, 756, W - 136, 154, 30); g.fillStyle = 'rgba(250,245,228,0.84)'; g.fill();
  g.strokeStyle = 'rgba(31,90,64,0.6)'; g.lineWidth = 1.6; g.stroke();
  g.beginPath(); g.roundRect(75, 763, W - 150, 140, 24); g.lineWidth = 0.7; g.stroke();
  g.restore();
  // header
  g.font = `700 22px ${SANS}`; g.letterSpacing = '4px'; g.fillStyle = C.ink; g.textBaseline = 'alphabetic';
  g.fillText('RECKON', 96, 104);
  g.font = `500 22px ${SANS}`; g.letterSpacing = '2px'; g.fillStyle = C.soft;
  g.fillText('ECONOMICS · HUNGARY 1945–46', 236, 104);
  g.letterSpacing = '0px';
  return c;
}

const CLOCK = { x: 282, y: 390, r: 178 };
function makeDial() {
  const s = 2 * CLOCK.r + 20, c = canvas(s, s), g = c.getContext('2d'), o = s / 2, R = CLOCK.r;
  g.beginPath(); g.arc(o, o, R, 0, TAU); g.fillStyle = '#F6F0DC'; g.fill();
  // guilloche ring
  g.save(); g.beginPath(); g.arc(o, o, R - 4, 0, TAU); g.arc(o, o, R - 34, 0, TAU, true); g.clip();
  g.strokeStyle = 'rgba(31,90,64,0.45)'; g.lineWidth = 0.7;
  for (let w = 0; w < 7; w++) {
    g.beginPath();
    for (let i = 0; i <= 1440; i++) {
      const th = (i / 1440) * TAU, rr = R - 19 + 13 * Math.sin(th * 48 + (w / 7) * TAU);
      i ? g.lineTo(o + rr * Math.cos(th), o + rr * Math.sin(th)) : g.moveTo(o + rr * Math.cos(th), o + rr * Math.sin(th));
    }
    g.stroke();
  }
  g.restore();
  g.strokeStyle = C.green; g.lineWidth = 2.5; g.beginPath(); g.arc(o, o, R, 0, TAU); g.stroke();
  g.lineWidth = 1; g.beginPath(); g.arc(o, o, R - 4, 0, TAU); g.stroke();
  g.beginPath(); g.arc(o, o, R - 34, 0, TAU); g.stroke();
  g.lineWidth = 1.6; g.beginPath(); g.arc(o, o, R - 38, 0, TAU); g.stroke();
  // small rosette in the centre
  rosette(g, o, o, 80, 'rgba(31,90,64,0.16)', { lw: 0.6, strands: 6, rings: [[0.3, 1, 16]] });
  // hour ticks and numerals (24-hour dial, 0 at the top)
  for (let h = 0; h < 24; h++) {
    const a = (h / 24) * TAU - Math.PI / 2, major = h % 3 === 0;
    const r0 = R - 42, r1 = major ? R - 60 : R - 52;
    g.strokeStyle = C.ink; g.lineWidth = major ? 3 : 1.5;
    g.beginPath(); g.moveTo(o + r0 * Math.cos(a), o + r0 * Math.sin(a)); g.lineTo(o + r1 * Math.cos(a), o + r1 * Math.sin(a)); g.stroke();
    if (major) {
      g.font = `700 26px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = h === 15 ? C.ox : C.ink;
      g.fillText(String(h), o + (R - 82) * Math.cos(a), o + (R - 82) * Math.sin(a) + 1);
    }
  }
  return c;
}

const NW = 720, NH = 330;
function makeNote() {
  const c = canvas(NW, NH), g = c.getContext('2d');
  g.fillStyle = C.note; g.fillRect(0, 0, NW, NH);
  const gr = g.createRadialGradient(NW / 2, NH / 2, 40, NW / 2, NH / 2, NW * 0.6);
  gr.addColorStop(0, 'rgba(255,255,245,0.5)'); gr.addColorStop(1, 'rgba(120,140,100,0.12)');
  g.fillStyle = gr; g.fillRect(0, 0, NW, NH);
  const small = { lw: 0.8, strands: 4, rings: [[0.62, 1, 14], [0.3, 0.66, 7]] };
  rosette(g, 96, NH / 2, 60, 'rgba(31,90,64,0.6)', small);
  rosette(g, NW - 96, NH / 2, 60, 'rgba(31,90,64,0.6)', small);
  // the denomination panel between the rosettes
  g.fillStyle = 'rgba(250,248,232,0.78)'; g.beginPath(); g.roundRect(168, 70, NW - 336, NH - 140, 24); g.fill();
  g.strokeStyle = 'rgba(31,90,64,0.7)'; g.lineWidth = 1.2; g.stroke();
  g.beginPath(); g.roundRect(174, 76, NW - 348, NH - 152, 19); g.lineWidth = 0.6; g.stroke();
  g.strokeStyle = 'rgba(31,90,64,0.12)'; g.lineWidth = 0.6;
  for (let i = 0; i < 40; i++) { // fine wavy underprint
    g.beginPath();
    for (let x = 30; x <= NW - 30; x += 3) { const y = 40 + i * 6.3 + 3 * Math.sin(x / 17 + i * 0.7); x > 30 ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  frame(g, 6, 6, NW - 12, NH - 12, 'rgba(31,90,64,0.85)', { bandW: 20, gap: 4 });
  return c;
}

// ---------- shared pieces ----------
function captions(t) {
  k.captions(t, CUES, { x: W / 2, y: 833, maxW: 700, size: 40, lh: 50, weight: 700, family: SANS, ink: C.ink, marks: { '*': C.ox, '~': C.green } });
}
function label(s, x, y, { align = 'left', color = C.soft, size = 22, weight = 600, spacing = '2px' } = {}) {
  font(weight, size); text(s, x, y, { color, align, spacing });
}
/** Draw a string squeezed horizontally to fit maxW; returns the squeeze factor. */
function fitText(s, x, y, maxW, { color = C.ink, align = 'center', base = 'alphabetic' } = {}) {
  const w = ctx.measureText(s).width, sx = Math.min(1, maxW / w);
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1); text(s, 0, 0, { color, align, base }); ctx.restore();
  return sx;
}

// ---------- timeline ----------
const T = { AB: [0, 22.8], C: [22.6, 33.8], D: [33.6, 42.4], E: [42.2, 50.0], F: [49.8, 54.5] };
const CUES = [
  [0.4, 3.6, 'How fast can prices *really* rise?'],
  [3.7, 8.4, 'In 1946 Hungary, prices at one stage doubled about every *15 hours*.'],
  [8.5, 12.4, 'Start the clock with a price of ~1 pengő~.'],
  [12.5, 15.0, '15 hours later: *2 pengő*.'],
  [15.6, 19.0, 'At that pace, prices roughly *tripled* every day.'],
  [19.2, 22.7, `Ten days: ${240 / DOUBLING_HOURS} doublings, *${fmtPrice(price(240))} pengő*.`],
  [23.0, 26.6, 'Hungary’s biggest note issued, July 1946: *100 quintillion* pengő.'],
  [26.7, 30.4, 'To cut the zeros, it read ~100 million b.-pengő~…'],
  [30.5, 33.6, '…and one b.-pengő meant *a trillion* pengő.'],
  [33.8, 38.4, 'On the black market, $1 cost ~1,320 pengő~ in July 1945…'],
  [38.5, 42.2, '…and *4.6 nonillion* by late July 1946: a 31-digit number.'],
  [42.4, 45.9, 'On 1 August 1946, Hungary switched to the ~forint~…'],
  [46.0, 49.8, `…at *400 octillion* pengő each: ${FORINT_ZEROS} zeros gone.`],
  [50.0, 54.3, 'The most extreme *hyperinflation* ever recorded.'],
];

// simulated hours on the clock
// (4 hours a second through day 1, a pause at the first doubling and at the end of the day, then nine days fly by)
function hoursAt(t) {
  if (t < 8.8) return 0;
  if (t < 13.6) return 15 * seg(t, 8.8, 12.55);
  if (t < 16.4) return 15 + 9 * seg(t, 13.6, 15.85);
  return 24 + 216 * eio(seg(t, 16.4, 20.6));
}

// ---------- A + B: the clock and the price tag ----------
function sceneClock(t) {
  const hrs = hoursAt(t);
  const intro = eout(seg(t, 0, 0.7));
  // dial
  withAlpha(intro, () => {
    const s = 0.94 + 0.06 * intro;
    ctx.save(); ctx.translate(CLOCK.x, CLOCK.y); ctx.scale(s, s);
    ctx.drawImage(DIAL, -DIAL.width / 2, -DIAL.height / 2);
    // progress towards the next doubling
    const since = hrs % DOUBLING_HOURS, last = hrs - since;
    const a0 = (last / 24) * TAU - Math.PI / 2, a1 = (hrs / 24) * TAU - Math.PI / 2;
    if (hrs > 0.05) {
      ctx.strokeStyle = 'rgba(126,31,42,0.55)'; ctx.lineWidth = 12; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.arc(0, 0, CLOCK.r - 116, a0, a1); ctx.stroke();
    }
    // hand
    const a = (hrs / 24) * TAU - Math.PI / 2;
    ctx.save(); ctx.rotate(a);
    ctx.fillStyle = C.ox; ctx.beginPath(); ctx.moveTo(-26, -5); ctx.lineTo(CLOCK.r - 64, -2); ctx.lineTo(CLOCK.r - 50, 0); ctx.lineTo(CLOCK.r - 64, 2); ctx.lineTo(-26, 5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(-26, 0, 9, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fillStyle = C.ink; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fillStyle = '#F6F0DC'; ctx.fill();
    ctx.restore();
    const day = Math.max(1, Math.ceil(hrs / 24 - 1e-9));
    font(600, 22); text(`DAY ${day}  ·  HOUR ${Math.floor(hrs)}`, CLOCK.x, CLOCK.y + CLOCK.r + 42, { color: C.soft, align: 'center', spacing: '3px' });
  });

  // price tag
  const doublings = Math.floor(hrs / DOUBLING_HOURS + 1e-9);
  const sinceDouble = (() => { // seconds since the last doubling, for the pulse
    if (!doublings) return 99;
    let lo = 8.8, hi = t; // find when hours crossed the last multiple of 15
    const target = doublings * DOUBLING_HOURS;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (hoursAt(m) >= target) hi = m; else lo = m; }
    return t - hi;
  })();
  const pulse = sinceDouble < 0.45 ? Math.sin((sinceDouble / 0.45) * Math.PI) : 0;
  const tagIn = eout(seg(t, 0.2, 0.9));
  withAlpha(tagIn, () => {
    const tx = 664, ty = 232 + (1 - tagIn) * -30;
    // string
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(tx, ty + 30); ctx.bezierCurveTo(tx - 30, ty - 20, tx + 40, ty - 60, tx + 6, ty - 90); ctx.stroke();
    ctx.save(); ctx.translate(tx, ty + 150); ctx.rotate(Math.sin(t * 1.3) * 0.015 + pulse * 0.03); ctx.scale(1 + 0.05 * pulse, 1 + 0.05 * pulse); ctx.translate(-tx, -(ty + 150));
    const x0 = tx - 122, x1 = tx + 122, y0 = ty, y1 = ty + 300;
    const tag = () => { ctx.beginPath(); ctx.moveTo(tx - 50, y0); ctx.lineTo(tx + 50, y0); ctx.lineTo(x1, y0 + 56); ctx.lineTo(x1, y1 - 14); ctx.quadraticCurveTo(x1, y1, x1 - 14, y1); ctx.lineTo(x0 + 14, y1); ctx.quadraticCurveTo(x0, y1, x0, y1 - 14); ctx.lineTo(x0, y0 + 56); ctx.closePath(); };
    tag(); ctx.fillStyle = '#F7F1DE'; ctx.fill();
    ctx.save(); tag(); ctx.clip();
    ctx.strokeStyle = 'rgba(31,90,64,0.13)'; ctx.lineWidth = 0.7;
    for (let i = 0; i < 26; i++) { ctx.beginPath(); for (let x = x0; x <= x1; x += 3) { const y = y0 + 70 + i * 9 + 3 * Math.sin(x / 13 + i); x > x0 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    ctx.restore();
    tag(); ctx.strokeStyle = C.green; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(tx, y0 + 30, 11, 0, TAU); ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.stroke();
    font(700, 22); text('PRICE', tx, y0 + 96, { color: C.soft, align: 'center', spacing: '4px' });
    const v = price(hrs);
    font(800, 74, SERIF); fitText(fmtPrice(v), tx, y0 + 190, 214, { color: pulse > 0.2 ? C.ox : C.ink });
    font(400, 34, SERIF, 'italic'); text('pengő', tx, y0 + 246, { color: C.green, align: 'center' });
    ctx.restore();
    // ×2 stamp
    if (pulse > 0) withAlpha(pulse, () => {
      ctx.save(); ctx.translate(tx - 162, y0 + 214); ctx.rotate(-0.18);
      ctx.strokeStyle = C.ox; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.stroke();
      font(800, 34, SERIF); text('×2', 0, 2, { color: C.ox, align: 'center', base: 'middle' });
      ctx.restore();
    });
  });

  // doublings so far
  const dIn = seg(t, 0.5, 1.1);
  withAlpha(dIn, () => {
    label('DOUBLINGS', 110, 652);
    font(800, 30, SERIF); text(String(doublings), 268, 654, { color: C.ox });
    for (let i = 0; i < 16; i++) {
      const x = 126 + i * 41, y = 694, on = i < doublings ? 1 : 0;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = on ? C.ox : 'rgba(126,31,42,0.06)'; ctx.fillRect(-11, -11, 22, 22);
      ctx.strokeStyle = on ? C.ox : 'rgba(126,31,42,0.4)'; ctx.lineWidth = 1.5; ctx.strokeRect(-11, -11, 22, 22);
      ctx.restore();
    }
  });
}

// ---------- C: the biggest note ----------
function sceneNote(t) {
  const inP = eout(seg(t, 22.7, 23.5));
  const nx = (W - NW) / 2, ny = 222 + (1 - inP) * 30;
  withAlpha(inP, () => {
    ctx.save(); ctx.shadowColor = 'rgba(40,40,20,0.25)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    ctx.drawImage(NOTE, nx, ny); ctx.restore();
    // the denomination grows digit by digit, then collapses into b.-pengő
    const n = 1 + Math.round(BIG_NOTE_ZEROS * seg(t, 23.4, 26.0));
    const collapse = eio(seg(t, 26.9, 28.6));
    const digits = '1' + '0'.repeat(n - 1);
    const cy = ny + 172, maxW = NW - 370;
    if (collapse <= 0) {
      font(800, 64, SERIF);
      const sx = fitText(group(digits), W / 2, cy, maxW, { color: C.ink });
      font(700, 30, SERIF); text('PENGŐ', W / 2, cy + 58, { color: C.green, align: 'center', spacing: '6px' });
      withAlpha(seg(t, 24.6, 25.0), () => label(`${n} digits${sx < 0.999 ? ': no room' : ''}`, W / 2, ny + NH + 44, { align: 'center', color: sx < 0.999 ? C.ox : C.soft }));
    } else {
      // keep "100 000 000", let the last 12 zeros fade out and the unit become B.-PENGŐ
      const keep = group('1' + '0'.repeat(BIG_NOTE_ZEROS - B_PENGO_ZEROS)), drop = ' ' + group('0'.repeat(B_PENGO_ZEROS)).trim();
      font(800, 64, SERIF);
      const full = keep + drop;
      const wFull = ctx.measureText(full).width, wKeep = ctx.measureText(keep).width;
      const sx = lerp(Math.min(1, maxW / wFull), Math.min(1, maxW / wKeep), collapse);
      const totalW = lerp(wFull, wKeep, collapse) * sx;
      ctx.save(); ctx.translate(W / 2 - totalW / 2, cy); ctx.scale(sx, 1);
      text(keep, 0, 0, { color: C.ink });
      withAlpha(1 - collapse, () => text(drop, wKeep, 0, { color: C.ink }));
      ctx.restore();
      font(700, 30, SERIF);
      const unitP = seg(t, 27.6, 28.6);
      ctx.letterSpacing = '2px'; const wB = ctx.measureText('B.-').width;
      ctx.letterSpacing = '6px'; const wP = ctx.measureText('PENGŐ').width - 6; ctx.letterSpacing = '0px';
      const ux = W / 2 + (wB / 2) * unitP;
      text('PENGŐ', ux, cy + 58, { color: C.green, align: 'center', spacing: '6px' });
      withAlpha(unitP, () => text('B.-', ux - wP / 2 - 2, cy + 58, { color: C.ox, align: 'right', spacing: '2px' }));
      withAlpha(1 - seg(t, 26.9, 27.2), () => label('21 digits: no room', W / 2, ny + NH + 44, { align: 'center', color: C.ox }));
    }
    withAlpha(seg(t, 23.6, 24.0), () => { font(500, 22, SANS, 'italic'); text('Drawing, not the real design', nx + NW, ny - 14, { color: C.soft, align: 'right' }); });
    // the equation
    const eq = eout(seg(t, 30.6, 31.2));
    withAlpha(eq, () => {
      const y = ny + NH + 104 + (1 - eq) * 12;
      font(700, 34, SERIF);
      const left = '1 B.-PENGŐ  =  ', right = group('1' + '0'.repeat(B_PENGO_ZEROS)) + ' PENGŐ';
      const wl = ctx.measureText(left).width, wr = ctx.measureText(right).width, x = W / 2 - (wl + wr) / 2;
      text(left, x, y, { color: C.ox });
      text(right, x + wl, y, { color: C.ink });
      label('a trillion', x + wl + wr / 2, y + 38, { align: 'center', color: C.green });
    });
  });
}

// ---------- D: the dollar ledger ----------
function sceneLedger(t) {
  const x0 = 84, xn = 252, y0 = 196, rh = 29.5;
  withAlpha(eout(seg(t, 33.7, 34.2)), () => {
    font(700, 32, SERIF); text('One US dollar, in pengő', x0, 160, { color: C.green });
    label('BLACK MARKET', W - x0, 158, { align: 'right' });
    ctx.strokeStyle = C.green; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, 174); ctx.lineTo(W - x0, 174); ctx.stroke();
    ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x0, 178); ctx.lineTo(W - x0, 178); ctx.stroke();
  });
  DOLLAR.forEach(([date, digits], i) => {
    const a = 34.2 + i * 0.3, p = seg(t, a, a + 0.42);
    if (p <= 0) return;
    const y = y0 + i * rh + 20;
    const last = i === DOLLAR.length - 1, first = i === 0;
    withAlpha(Math.min(1, p * 2.5), () => {
      if (i % 2 === 0) { ctx.fillStyle = 'rgba(31,90,64,0.05)'; ctx.fillRect(x0 - 8, y - 21, W - 2 * x0 + 16, rh); }
      font(500, 22); text(date, x0, y, { color: C.soft });
      font(700, 24, SERIF);
      const s = group(digits, ',');
      ctx.save(); ctx.beginPath(); ctx.rect(xn - 2, y - 30, (ctx.measureText(s).width + 8) * eout(p), 40); ctx.clip();
      text(s, xn, y, { color: last ? C.ox : first ? C.green : C.ink });
      ctx.restore();
    });
  });
  // the last row: count its digits
  const q = eout(seg(t, 39.6, 40.2));
  withAlpha(q, () => {
    const i = DOLLAR.length - 1, y = y0 + i * rh + 20;
    font(700, 24, SERIF); const w = ctx.measureText(group(DOLLAR[i][1], ',')).width;
    ctx.strokeStyle = C.ox; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(xn, y + 12); ctx.lineTo(xn, y + 20); ctx.lineTo(xn + w * q, y + 20); ctx.lineTo(xn + w * q, y + 12); ctx.stroke();
    label(`${DOLLAR[i][1].length} digits`, xn + w / 2, y + 48, { align: 'center', color: C.ox });
  });
}

// ---------- E: the forint ----------
function sceneForint(t) {
  const p = eout(seg(t, 42.4, 43.1));
  withAlpha(p, () => {
    // 400 octillion = 4 followed by 29 zeros
    const s = group('4' + '0'.repeat(FORINT_ZEROS));
    font(800, 46, SERIF);
    const w = ctx.measureText(s).width, sx = Math.min(1, 700 / w);
    const y = 290;
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(sx, 1); text(s, 0, 0, { color: C.ink, align: 'center' }); ctx.restore();
    font(700, 28, SERIF); text('PENGŐ', W / 2, y + 50, { color: C.ink, align: 'center', spacing: '6px' });
    // a bracket over the 29 zeros, counting them
    const z = eio(seg(t, 46.1, 47.8));
    if (z > 0) {
      const x0 = W / 2 - (w * sx) / 2;
      font(800, 46, SERIF);
      const xa = x0 + (ctx.measureText('40').width - ctx.measureText('0').width) * sx, xb = x0 + w * sx;
      const xe = lerp(xa, xb, z);
      ctx.strokeStyle = C.ox; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(xa, y - 44); ctx.lineTo(xa, y - 54); ctx.lineTo(xe, y - 54); if (z > 0.99) ctx.lineTo(xe, y - 44); ctx.stroke();
      const n = Math.round(FORINT_ZEROS * z);
      label(`${n} zero${n === 1 ? '' : 's'}`, (xa + xe) / 2, y - 70, { align: 'center', color: C.ox });
    }
    // equals one forint
    const f = eout(seg(t, 43.2, 44.0));
    withAlpha(f, () => {
      font(400, 40, SERIF, 'italic'); text('=', W / 2, 430, { color: C.green, align: 'center' });
      // a coin-like seal
      const cy = 556, r = 96 * (0.9 + 0.1 * back(f));
      ctx.beginPath(); ctx.arc(W / 2, cy, r, 0, TAU); ctx.fillStyle = '#F6F0DC'; ctx.fill();
      ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.stroke();
      ctx.lineWidth = 0.7;
      ctx.save(); ctx.beginPath(); ctx.arc(W / 2, cy, r - 8, 0, TAU); ctx.clip();
      for (let i = 0; i < 24; i++) { ctx.beginPath(); ctx.ellipse(W / 2, cy, r * 0.85, r * 0.3, (i * Math.PI) / 24, 0, TAU); ctx.strokeStyle = 'rgba(31,90,64,0.16)'; ctx.stroke(); }
      ctx.restore();
      ctx.beginPath(); ctx.arc(W / 2, cy, r - 10, 0, TAU); ctx.strokeStyle = C.green; ctx.lineWidth = 1; ctx.stroke();
      font(800, 84, SERIF); text('1', W / 2, cy + 8, { color: C.green, align: 'center' });
      font(700, 22); text('FORINT', W / 2, cy + 48, { color: C.green, align: 'center', spacing: '4px' });
      label('1 August 1946', W / 2, cy + r + 40, { align: 'center' });
    });
  });
}

// ---------- F: end card ----------
function sceneEnd(t) {
  const p = eout(seg(t, 49.9, 50.6));
  withAlpha(p, () => {
    const y = 300 + (1 - p) * 16;
    font(800, 72, SERIF); text('The pengő', W / 2, y, { color: C.ink, align: 'center' });
    font(400, 40, SERIF, 'italic'); text('1927 – 1946', W / 2, y + 62, { color: C.green, align: 'center' });
    // ornamental rule
    ctx.strokeStyle = C.ox; ctx.lineWidth = 1.5;
    const rw = 220 * eout(seg(t, 50.3, 51.0));
    ctx.beginPath(); ctx.moveTo(W / 2 - rw, y + 104); ctx.lineTo(W / 2 + rw, y + 104); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, y + 104, 6, 0, TAU); ctx.fillStyle = C.ox; ctx.fill();
    font(600, 26); text('prices doubled about every 15 hours at the peak', W / 2, y + 158, { color: C.ink, align: 'center' });
    label('Source: Wikipedia, “Hungarian pengő”', W / 2, 680, { align: 'center', weight: 500, spacing: '0px' });
  });
}

Kit.scene({
  width: W, height: H, duration: 54.5,
  fonts: [{ family: SERIF, file: 'PlayfairDisplay.woff2', weight: '400 900' }, { family: SANS, file: 'LibreFranklin.woff2', weight: '400 800' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) { BG = makeBackground(); DIAL = makeDial(); NOTE = makeNote(); }
    ctx.drawImage(BG, 0, 0);
    const scenes = [[sceneClock, T.AB, 0], [sceneNote, T.C], [sceneLedger, T.D], [sceneForint, T.E], [sceneEnd, T.F, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
