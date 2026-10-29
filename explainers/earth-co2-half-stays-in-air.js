// Explainer for earth-co2-half-stays-in-air: on 27 October 2026 the World Meteorological Organization's
// Greenhouse Gas Bulletin reported a record 426.8 ppm of carbon dioxide in 2025. Why it keeps rising: the air
// is a bathtub that fills whenever the tap (emissions) runs faster than the drains (land and ocean). Look: a
// pale bathroom wall of tiles, a white enamel tub, CO₂ as rust-orange beads, a green drain for land and a blue
// one for the ocean. Rubik for numbers and labels, Bitter for captions.
//
// Facts: WMO press release "Greenhouse gas levels once again reach record high" (27 October 2026, Bulletin
// No. 22): globally averaged surface CO₂ in 2025 was 426.8 ppm, 153% of the 1750 pre-industrial level; the
// Bulletin reports concentrations, the amount that accumulates in the atmosphere, not annual emissions; about
// half of the CO₂ emitted each year remains in the atmosphere and the rest is absorbed by land ecosystems and
// oceans; growth rates have tripled since the 1960s, from 0.8 ppm a year to 2.4 ppm a year in 2011–2020; from
// 2024 to 2025 CO₂ rose by 2.8 ppm, above the decadal average but slightly less than the surge of 2023/2024;
// Oksana Tarasova: the more modest rise reflects recovery of the land carbon sinks and reduced fire emissions
// in 2025 after the strong 2023/2024 El Niño, which reduced the efficiency of the biosphere through drought,
// drier vegetation and more wildfires; Ko Barrett: CO₂ has a very long lifetime and will affect the climate for
// decades and even centuries; 179 stations. WMO press release for Bulletin No. 21 (15 October 2025): from 2023
// to 2024 CO₂ rose by 3.5 ppm, the largest increase since modern measurements started in 1957; 423.9 ppm in
// 2024; as global temperature rises, oceans absorb less CO₂ because of decreased solubility at higher
// temperatures.
// Computed here: the 1750 level, 426.8 / 1.53 ≈ 279 ppm (said as "about 280"); the extra since 1750, ≈ 148 ppm;
// 426.8 per million = 4.27 per 10,000. The closing tap demonstration is a simplified model that holds the drains
// at what they took in 2025, about half of that year's emissions (≈ 2.8 of ≈ 5.6 ppm); it is labelled so.
//
// Scene plan (65.0 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0–14.2  Hook: 426.8 ppm; what ppm means (4 dots in 10,000); 1750 vs 2025.
//  B 14.2–28.0  The bathtub: the tap pours CO₂ in, land and ocean drain about half, the rest stays.
//  C 28.0–51.0  The yearly rise: 0.8 (1960s), 2.4 (2011–2020), 3.5 (2023→24, El Niño), 2.8 (2024→25).
//  D 51.0–65.0  Warmer seawater holds less; what stays piles up; the level steadies only when in = out.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  wall: '#e3eae7', wall2: '#d6dfdb', grout: 'rgba(255,255,255,0.75)', ink: '#1d2a36', soft: 'rgba(29,42,54,0.72)',
  faint: 'rgba(29,42,54,0.28)', co2: '#c4521f', co2Soft: 'rgba(196,82,31,0.20)', co2Mid: 'rgba(196,82,31,0.45)',
  land: '#3d8a4f', landSoft: 'rgba(61,138,79,0.20)', sea: '#2d6aa0', seaSoft: 'rgba(45,106,160,0.18)',
  enamel: '#fbfcfb', shade: 'rgba(29,42,54,0.10)', chrome: '#8d9aa5', chrome2: '#c7d0d6', panel: 'rgba(251,252,251,0.94)',
  sun: '#e8a21a', fire: '#d9431b',
};
const NUM = 'Rubik', CAP = 'Bitter';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers (WMO) ----------
const PPM = 426.8, SHARE_OF_1750 = 1.53, RISE_2025 = 2.8, RISE_2024 = 3.5, RISE_1960S = 0.8, RISE_2010S = 2.4;
const PRE = PPM / SHARE_OF_1750; // ≈ 279
const EXTRA = PPM - PRE; // ≈ 148
const PER_10K = PPM / 100; // 4.27
const STAYS = 0.5; // about half of each year's emissions stays in the air
const IN_2025 = RISE_2025 / STAYS; // ≈ 5.6 ppm a year put in, in this simple picture
const OUT_2025 = IN_2025 - RISE_2025; // ≈ 2.8 taken up
/** The yearly change in the simplified model: drains held at 2025's uptake, tap at `share` of 2025's flow. */
const change = (share) => share * IN_2025 - OUT_2025;
const r1 = (v) => v.toFixed(1);
const r0 = (v) => String(Math.round(v));

const CUES = [
  [0.4, 4.8, `On 27 October 2026, the World Meteorological Organization reported a CO₂ record: *${r1(PPM)} ppm*.`],
  [5.0, 9.4, `Parts per million: in 2025, *${r0(PPM)}* of every million molecules of dry air were CO₂.`],
  [9.6, 14.0, `In 1750 it was about *280*. Now it’s 53% higher, and in 2025 alone it rose *${r1(RISE_2025)} ppm*.`],
  [14.2, 18.6, 'Picture the air as a *bathtub*. Burning coal, oil and gas pours CO₂ in at the tap.'],
  [18.8, 23.2, 'Plants on ~land~ and the ^ocean^ drain some away: together they take up about *half*.'],
  [23.4, 27.8, 'The other half stays. A tub fills whenever the tap runs faster than the drain.'],
  [28.0, 32.4, `And the tap has opened up: in the 1960s, CO₂ rose about *${r1(RISE_1960S)} ppm* a year.`],
  [32.6, 37.0, `From 2011 to 2020 it rose *${r1(RISE_2010S)} ppm* a year on average: three times as fast.`],
  [37.2, 41.6, `From 2023 to 2024 it jumped *${r1(RISE_2024)} ppm*, the most since measurements began in 1957.`],
  [41.8, 46.2, 'A strong El Niño brought drought and wildfires, so ~plants on land~ took up less.'],
  [46.4, 50.8, `In 2025 the ~land~ drain recovered and the rise eased to *${r1(RISE_2025)} ppm*, still above average.`],
  [51.0, 55.4, 'The ^ocean^ drain is at risk too: warmer seawater holds less dissolved CO₂.'],
  [55.6, 60.0, 'What stays lasts decades, even centuries, so each year’s extra piles onto the last.'],
  [60.2, 64.6, 'The level stops rising only when the tap is turned down to what the drains take out.'],
];

// ---------- background: a tiled wall ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.wall); lg.addColorStop(1, C.wall2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.grout; g.lineWidth = 3;
  for (let x = 0; x <= W; x += 72) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 780); g.stroke(); }
  for (let y = 0; y <= 780; y += 72) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2200; i++) { g.fillStyle = `rgba(40,60,70,${r() * 0.03})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
}

// ---------- small drawings ----------
function bead(x, y, r = 7, color = C.co2) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.32, 0, Math.PI * 2); ctx.fill();
}
function leaf(x, y, s, color = C.land) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6);
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.8, 0, 0, s); ctx.quadraticCurveTo(-s * 0.8, 0, 0, -s); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -s * 0.8); ctx.lineTo(0, s * 0.9); ctx.stroke();
  ctx.restore();
}
function waves(x, y, w, color = C.sea, t = 0) {
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let j = 0; j < 3; j++) {
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) { const u = i / 24, xx = x - w / 2 + u * w; const yy = y + j * 14 + Math.sin(u * Math.PI * 4 + t * 2 + j) * 4; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.stroke();
  }
}
function arrow(x0, y0, x1, y1, color, w = 6, head = 16) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head); ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head); ctx.closePath(); ctx.fill();
}
const rnd = (i, j = 0) => { const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------- the bathtub ----------
// The tub's level shows ppm: the bottom of the water is 0 ppm, the tub's rim 480 ppm.
const TUB = { x0: 176, x1: 688, top: 350, bot: 610 };
const RIM = 480;
const levelY = (ppm) => lerp(TUB.bot, TUB.top, ppm / RIM);
const TAP = { x: 262, y: 262 };
const PIPE_Y = TUB.bot + 84;
const DR = { land: { x: 290, end: 150, color: C.land }, sea: { x: 574, end: 714, color: C.sea } };

function pipePath(d) {
  const dir = Math.sign(d.end - d.x);
  ctx.beginPath(); ctx.moveTo(d.x, TUB.bot + 14); ctx.lineTo(d.x, PIPE_Y - 30); ctx.quadraticCurveTo(d.x, PIPE_Y, d.x + dir * 30, PIPE_Y); ctx.lineTo(d.end, PIPE_Y);
}
/** tap: 0–1 flow; land, sea: 0–1 how open each drain is; ppm: water level; marks: show the 1750 and 2025 lines. */
function tub(t, { tap = 1, land = 1, sea = 1, ppm = PPM, marks = 0 } = {}) {
  const { x0, x1, top, bot } = TUB;
  // pipes from the drains
  ctx.lineCap = 'butt';
  for (const [key, d] of Object.entries(DR)) {
    const open = key === 'land' ? land : sea;
    ctx.strokeStyle = C.chrome; ctx.lineWidth = 30; pipePath(d); ctx.stroke();
    ctx.strokeStyle = d.color; ctx.lineWidth = 6 + 16 * open; ctx.globalAlpha = 0.25 + 0.75 * Math.min(1, open * 2); pipePath(d); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // tub body
  ctx.fillStyle = C.shade; k.rrect(x0 - 10, top + 14, x1 - x0 + 20, bot - top + 14, 46); ctx.fill();
  ctx.fillStyle = C.enamel; k.rrect(x0 - 18, top - 12, x1 - x0 + 36, bot - top + 22, 44); ctx.fill();
  ctx.strokeStyle = C.faint; ctx.lineWidth = 3; k.rrect(x0 - 18, top - 12, x1 - x0 + 36, bot - top + 22, 44); ctx.stroke();
  // water: the CO₂ in the air
  ctx.save(); k.rrect(x0, top, x1 - x0, bot - top, 32); ctx.clip();
  const ly = levelY(ppm);
  ctx.fillStyle = C.co2Soft; ctx.fillRect(x0, ly, x1 - x0, bot - ly);
  ctx.strokeStyle = C.co2Mid; ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 6) { const yy = ly + Math.sin(x * 0.04 + t * 3) * 2.5; x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
  ctx.stroke();
  for (let i = 0; i < 34; i++) {
    const bx = x0 + 20 + rnd(i, 1) * (x1 - x0 - 40), by = ly + 16 + rnd(i, 2) * (bot - ly - 30) + Math.sin(t * 1.3 + i) * 3;
    bead(bx, by, 5, 'rgba(196,82,31,0.55)');
  }
  ctx.restore();
  ctx.strokeStyle = C.faint; ctx.lineWidth = 3; k.rrect(x0, top, x1 - x0, bot - top, 32); ctx.stroke();
  // drains and feet
  for (const d of Object.values(DR)) { ctx.fillStyle = C.chrome; ctx.beginPath(); ctx.ellipse(d.x, bot - 4, 26, 8, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = C.chrome; for (const fx of [x0 + 30, x1 - 30]) { ctx.beginPath(); ctx.ellipse(fx, bot + 22, 18, 12, 0, 0, Math.PI * 2); ctx.fill(); }
  // level marks
  if (marks > 0) A(marks, () => {
    for (const [v, label, color] of [[PRE, '1750', C.soft], [PPM, '2025', C.co2]]) {
      const y = levelY(v);
      ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(x0 + 6, y); ctx.lineTo(x1 - 6, y); ctx.stroke(); ctx.setLineDash([]);
      font(700, 24); text(label, x1 + 28, y, { color, align: 'left' });
    }
  });
  // the tap: a pipe from the wall, a spout and a round handle
  ctx.strokeStyle = C.chrome; ctx.lineWidth = 24; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(30, 226); ctx.lineTo(TAP.x - 26, 226); ctx.quadraticCurveTo(TAP.x, 226, TAP.x, TAP.y - 14); ctx.stroke();
  ctx.fillStyle = C.chrome2; ctx.beginPath(); ctx.ellipse(TAP.x, TAP.y - 8, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.chrome; ctx.fillRect(122, 186, 16, 30);
  const hw = 46 * (0.35 + 0.65 * Math.abs(Math.cos(tap * 1.2)));
  ctx.fillStyle = C.chrome; k.rrect(130 - hw, 174, hw * 2, 20, 10); ctx.fill();
  ctx.fillStyle = C.co2; ctx.beginPath(); ctx.arc(130, 184, 7, 0, Math.PI * 2); ctx.fill();
  // stream of beads from the tap into the water
  if (tap > 0) {
    const n = 14, ly2 = levelY(ppm);
    for (let i = 0; i < n; i++) {
      if (rnd(i, 7) > tap) continue;
      const u = (t * 0.9 + i / n) % 1;
      bead(TAP.x + Math.sin(i * 2.1) * 5, lerp(TAP.y, ly2 + 8, u), 7);
    }
  }
  // beads leaving through the drains
  for (const [key, d] of Object.entries(DR)) {
    const open = key === 'land' ? land : sea;
    if (open <= 0) continue;
    const dir = Math.sign(d.end - d.x), n = 6, down = PIPE_Y - TUB.bot, along = Math.abs(d.end - d.x);
    for (let i = 0; i < n; i++) {
      if (rnd(i, key === 'land' ? 3 : 4) > open) continue;
      const u = ((t * 0.55 + i / n) % 1) * (down + along);
      const x = u < down ? d.x : d.x + dir * (u - down), y = u < down ? TUB.bot + 10 + u : PIPE_Y;
      bead(x, y, 6, d.color);
    }
  }
}
function drainLabels(a) {
  A(a, () => {
    const y = PIPE_Y + 52;
    leaf(DR.land.end - 30, y, 20);
    font(700, 26); text('land', DR.land.end + 4, y, { color: C.land, align: 'left' });
    waves(DR.sea.end - 6, y - 14, 64, C.sea, 0);
    font(700, 26); text('ocean', DR.sea.end - 44, y, { color: C.sea, align: 'right' });
  });
}

// ---------- A: the record ----------
function hook(t) {
  const a = span(t, 0, 5.0, 0, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const g = back(seg(t, 0.3, 1.1));
    ctx.save(); ctx.translate(W / 2, 400); ctx.scale(0.6 + 0.4 * g, 0.6 + 0.4 * g);
    ctx.fillStyle = C.panel; k.rrect(-300, -200, 600, 400, 40); ctx.fill();
    ctx.strokeStyle = C.co2; ctx.lineWidth = 6; k.rrect(-300, -200, 600, 400, 40); ctx.stroke();
    font(600, 30); text('carbon dioxide, CO₂', 0, -130, { color: C.soft, align: 'center' });
    font(800, 150); text(r1(PPM * eout(seg(t, 0.5, 2.2))), 0, -10, { color: C.co2, align: 'center' });
    font(700, 44); text('ppm', 0, 100, { color: C.co2, align: 'center' });
    font(500, 24); text('global average, 2025 · a new record', 0, 156, { color: C.soft, align: 'center' });
    ctx.restore();
    // beads rising around the card
    for (let i = 0; i < 18; i++) {
      const u = (t * 0.12 + rnd(i, 5)) % 1;
      const x = 60 + rnd(i, 6) * 744, y = 760 - u * 640;
      if (x > 120 && x < 744 && y > 180 && y < 620) continue;
      A(Math.sin(u * Math.PI) * 0.8, () => bead(x, y, 6 + rnd(i, 8) * 5));
    }
  });
}
function perMillion(t) {
  const a = span(t, 5.0, 9.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const n = 100, p = 5.0, side = n * p, x0 = W / 2 - side / 2, y0 = 186;
    font(600, 26); text('10,000 molecules of dry air', W / 2, 160, { color: C.soft, align: 'center' });
    const lit = eio(seg(t, 5.2, 6.6));
    ctx.fillStyle = 'rgba(29,42,54,0.22)';
    for (let i = 0; i < n * n; i++) {
      if (i / (n * n) > lit) break;
      ctx.fillRect(x0 + (i % n) * p, y0 + Math.floor(i / n) * p, p - 1.6, p - 1.6);
    }
    const spots = [[23, 17], [71, 38], [40, 66], [84, 81]];
    A(seg(t, 6.6, 7.1), () => {
      spots.forEach(([cx, cy], i) => {
        const x = x0 + cx * p + p / 2, y = y0 + cy * p + p / 2;
        ctx.fillStyle = C.co2; ctx.fillRect(x - p / 2, y - p / 2, p - 1.6, p - 1.6);
        const g = eout(seg(t, 6.7 + i * 0.25, 7.3 + i * 0.25));
        ctx.strokeStyle = C.co2; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 8 + 22 * g, 0, Math.PI * 2); ctx.stroke();
      });
    });
    A(seg(t, 7.6, 8.1), () => {
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 300, y0 + side + 18, 600, 74, 18); ctx.fill();
      font(700, 32); text(`${PER_10K.toFixed(2)} of them are CO₂`, W / 2, y0 + side + 55, { color: C.co2, align: 'center' });
    });
  });
}
function then(t) {
  const a = span(t, 9.6, 14.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('CO₂ in the air, parts per million', W / 2, 160, { color: C.soft, align: 'center' });
    const base = 680, scale = 1.0, w = 170;
    const cols = [[250, PRE, '1750', 'about 280', C.soft], [614, PPM, '2025', r1(PPM), C.co2]];
    cols.forEach(([x, v, yr, lab, color], i) => {
      const g = eio(seg(t, 9.9 + i * 0.6, 11.2 + i * 0.6));
      const h = v * scale * g;
      ctx.fillStyle = C.enamel; k.rrect(x - w / 2 - 10, base - RIM * scale - 10, w + 20, RIM * scale + 20, 24); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; k.rrect(x - w / 2 - 10, base - RIM * scale - 10, w + 20, RIM * scale + 20, 24); ctx.stroke();
      ctx.fillStyle = i ? C.co2Mid : 'rgba(29,42,54,0.25)'; ctx.fillRect(x - w / 2, base - h, w, h);
      font(700, 30); text(yr, x, base + 40, { color: C.ink, align: 'center' });
      A(seg(t, 10.8 + i * 0.6, 11.3 + i * 0.6), () => { font(800, 40); text(lab, x, base - h - 30, { color, align: 'center' }); });
    });
    // the extra 53%
    A(seg(t, 11.8, 12.4), () => {
      const yTop = base - PPM * scale, yPre = base - PRE * scale;
      ctx.strokeStyle = C.co2; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(250 + w / 2, yPre); ctx.lineTo(614 - w / 2 - 14, yPre); ctx.stroke(); ctx.setLineDash([]);
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(614 - w / 2 - 26, yTop); ctx.lineTo(614 - w / 2 - 34, yTop); ctx.lineTo(614 - w / 2 - 34, yPre); ctx.lineTo(614 - w / 2 - 26, yPre); ctx.stroke();
      font(800, 32); text('+53%', 432, (yTop + yPre) / 2, { color: C.co2, align: 'center' });
    });
  });
}

// ---------- B: the bathtub ----------
function bath(t) {
  const a = span(t, 14.2, 28.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    const tap = eio(seg(t, 14.6, 15.4));
    const drains = eio(seg(t, 19.0, 19.8));
    tub(t, { tap, land: drains, sea: drains, ppm: PPM - RISE_2025 + RISE_2025 * eio(seg(t, 23.6, 27.0)) });
    A(seg(t, 14.8, 15.3), () => {
      ctx.fillStyle = C.panel; k.rrect(320, 150, 290, 84, 16); ctx.fill();
      font(700, 26); text('in: burning coal,', 465, 178, { color: C.co2, align: 'center' });
      text('oil and gas', 465, 208, { color: C.co2, align: 'center' });
      arrow(318, 200, 286, 236, C.co2, 4, 12);
    });
    drainLabels(drains);
    A(seg(t, 20.4, 20.9), () => {
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 112, PIPE_Y - 28, 224, 56, 16); ctx.fill();
      font(700, 26); text('out: about half', W / 2, PIPE_Y, { color: C.ink, align: 'center' });
    });
    A(seg(t, 23.6, 24.1), () => {
      const y = 490;
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 170, y - 46, 340, 92, 18); ctx.fill();
      font(700, 26); text('stays in the air', W / 2 + 22, y - 16, { color: C.co2, align: 'center' });
      font(800, 30); text(`+${r1(RISE_2025)} ppm in 2025`, W / 2 + 22, y + 20, { color: C.co2, align: 'center' });
      arrow(W / 2 - 138, y + 30, W / 2 - 138, y - 34, C.co2, 6, 18);
    });
  });
}

// ---------- C: the yearly rise ----------
const RISES = [
  { v: RISE_1960S, a: '1960s', b: 'average', at: 28.4 },
  { v: RISE_2010S, a: '2011–2020', b: 'average', at: 33.0 },
  { v: RISE_2024, a: '2023 to', b: '2024', at: 37.6 },
  { v: RISE_2025, a: '2024 to', b: '2025', at: 46.8 },
];
const XS = [138, 314, 490, 666], BASE = 680, PX = 118, BW = 120;
function rises(t) {
  const a = span(t, 28.0, 51.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('rise of CO₂ in the air in one year, ppm', W / 2, 150, { color: C.soft, align: 'center' });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(60, BASE); ctx.lineTo(804, BASE); ctx.stroke();
    RISES.forEach((r, i) => {
      const g = eio(seg(t, r.at, r.at + 1.2));
      if (g <= 0) return;
      const x = XS[i], h = r.v * PX * g;
      const hot = i === 2 && t > 41.8 && t < 46.4;
      A(Math.min(1, g * 3), () => {
        ctx.strokeStyle = C.faint; ctx.lineWidth = 3; k.rrect(x - BW / 2 - 7, BASE - 4.0 * PX, BW + 14, 4.0 * PX, [16, 16, 0, 0]); ctx.stroke();
        font(600, 24); text(r.a, x, BASE + 30, { color: C.ink, align: 'center' });
        font(500, 22); text(r.b, x, BASE + 58, { color: C.soft, align: 'center' });
      });
      ctx.fillStyle = hot ? 'rgba(217,67,27,0.8)' : i === 3 && t > 46.4 ? C.co2 : C.co2Mid;
      ctx.fillRect(x - BW / 2, BASE - h, BW, h);
      font(800, 40); text(r1(r.v * g), x, BASE - h - 30, { color: C.co2, align: 'center' });
    });
    // three times as fast
    A(span(t, 34.4, 37.2, 0.4, 0.4), () => {
      arrow(XS[0] + 30, BASE - RISE_1960S * PX - 70, XS[1] - 76, BASE - RISE_2010S * PX - 20, C.ink, 4, 14);
      font(800, 34); text('× 3', XS[0] + 6, BASE - 1.7 * PX - 30, { color: C.ink, align: 'center' });
    });
    // the 1957 record
    A(span(t, 38.8, 41.8, 0.4, 0.3), () => {
      ctx.fillStyle = C.panel; k.rrect(568, 300, 240, 110, 14); ctx.fill();
      font(700, 22); text('biggest one-year', 688, 328, { color: C.ink, align: 'center' });
      text('rise since records', 688, 356, { color: C.ink, align: 'center' });
      font(500, 22); text('began in 1957', 688, 384, { color: C.soft, align: 'center' });
      arrow(568, 356, XS[2] + BW / 2 + 10, 356, C.ink, 4, 12);
    });
    // El Niño: drought and fires weaken the land drain
    A(span(t, 41.8, 46.4, 0.4, 0.4), () => elNino(t));
    // 2025: the land drain recovered
    A(span(t, 47.6, 51.0, 0.4, 0.4), () => {
      const y = BASE - RISE_2025 * PX + 70;
      leaf(XS[3] - 26, y, 16, '#ffffff'); leaf(XS[3] + 22, y - 6, 14, '#ffffff');
      font(700, 22); text('land drain', XS[3], y + 44, { color: '#ffffff', align: 'center' });
      text('recovered', XS[3], y + 72, { color: '#ffffff', align: 'center' });
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(XS[1] - BW / 2, BASE - RISE_2010S * PX); ctx.lineTo(XS[3] + BW / 2, BASE - RISE_2010S * PX); ctx.stroke(); ctx.setLineDash([]);
    });
  });
}
function elNino(t) {
  // on the right, where the 2025 bar will stand: a hot sun, cracked ground and flames
  const cx = 690, cy = 300;
  ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(cx + 40, cy - 70, 28, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = C.sun; ctx.lineWidth = 5;
  for (let i = 0; i < 10; i++) { const an = (i / 10) * Math.PI * 2 + t * 0.4; ctx.beginPath(); ctx.moveTo(cx + 40 + Math.cos(an) * 38, cy - 70 + Math.sin(an) * 38); ctx.lineTo(cx + 40 + Math.cos(an) * 50, cy - 70 + Math.sin(an) * 50); ctx.stroke(); }
  ctx.fillStyle = '#b89a6a'; k.rrect(cx - 90, cy + 6, 180, 30, 8); ctx.fill();
  ctx.strokeStyle = '#7a5f36'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx - 60, cy + 6); ctx.lineTo(cx - 46, cy + 20); ctx.lineTo(cx - 54, cy + 36); ctx.moveTo(cx, cy + 6); ctx.lineTo(cx + 12, cy + 22); ctx.lineTo(cx + 30, cy + 28); ctx.moveTo(cx + 60, cy + 6); ctx.lineTo(cx + 52, cy + 24); ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const fx = cx - 56 + i * 56, fy = cy + 6, s = 20 + 6 * Math.sin(t * 9 + i * 2);
    ctx.fillStyle = C.fire; ctx.beginPath(); ctx.moveTo(fx - 12, fy); ctx.quadraticCurveTo(fx - 14, fy - s, fx, fy - s * 1.6); ctx.quadraticCurveTo(fx + 14, fy - s, fx + 12, fy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f4b53f'; ctx.beginPath(); ctx.moveTo(fx - 6, fy); ctx.quadraticCurveTo(fx - 6, fy - s * 0.6, fx, fy - s); ctx.quadraticCurveTo(fx + 6, fy - s * 0.6, fx + 6, fy); ctx.closePath(); ctx.fill();
  }
  font(700, 24); text('El Niño 2023/24', cx, cy + 68, { color: C.fire, align: 'center' });
  font(500, 21); text('drought, drier plants,', cx, cy + 96, { color: C.soft, align: 'center' });
  text('more wildfires', cx, cy + 122, { color: C.soft, align: 'center' });
  font(700, 22); text('land drain weaker', cx, cy + 162, { color: C.land, align: 'center' });
  arrow(cx - 96, cy + 150, XS[2] + BW / 2 + 12, BASE - RISE_2024 * PX + 60, C.fire, 4, 14);
}

// ---------- D: the ocean, what stays, the tap turned down ----------
function ocean(t) {
  const a = span(t, 51.0, 55.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('dissolved CO₂ in seawater (illustration)', W / 2, 150, { color: C.soft, align: 'center' });
    const warm = eio(seg(t, 52.0, 53.6));
    const glasses = [[250, 'cooler', 0], [614, 'warmer', 1]];
    glasses.forEach(([x, lab, hot]) => {
      const top = 250, bot = 640, w = 230;
      ctx.fillStyle = C.enamel; k.rrect(x - w / 2 - 10, top - 10, w + 20, bot - top + 20, 26); ctx.fill();
      ctx.fillStyle = hot ? `rgba(45,106,160,${0.22 - 0.06 * warm})` : C.seaSoft; ctx.fillRect(x - w / 2, top + 50, w, bot - top - 50);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.strokeRect(x - w / 2, top, w, bot - top);
      const n = 30, keep = hot ? Math.round(n - 10 * warm) : n;
      for (let i = 0; i < n; i++) {
        const bx = x - w / 2 + 18 + rnd(i, 11) * (w - 36);
        let by = top + 70 + rnd(i, 12) * (bot - top - 90);
        if (i >= keep) { // bubbling out of the warmer water
          const u = clamp((warm * 10 - (i - keep)) / 3, 0, 1);
          by = lerp(by, top - 40 - rnd(i, 13) * 30, eout(seg(t, 52.4 + (i % 10) * 0.12, 53.8 + (i % 10) * 0.12)));
          A(1 - seg(t, 54.0, 54.6) * u, () => bead(bx, by, 7));
          continue;
        }
        bead(bx, by, 7);
      }
      // thermometer
      const tx = x + w / 2 + 34, ty0 = 300, ty1 = 600;
      ctx.fillStyle = C.enamel; k.rrect(tx - 12, ty0, 24, ty1 - ty0, 12); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; k.rrect(tx - 12, ty0, 24, ty1 - ty0, 12); ctx.stroke();
      const lvl = hot ? lerp(0.45, 0.85, warm) : 0.45;
      ctx.fillStyle = hot ? C.fire : C.sea; ctx.fillRect(tx - 6, lerp(ty1 - 6, ty0 + 10, lvl), 12, lerp(ty1 - 6, ty0 + 10, 0) - lerp(ty1 - 6, ty0 + 10, lvl));
      ctx.beginPath(); ctx.arc(tx, ty1 + 6, 18, 0, Math.PI * 2); ctx.fill();
      font(700, 28); text(lab, x, bot + 46, { color: hot ? C.fire : C.sea, align: 'center' });
    });
  });
}
function piles(t) {
  const a = span(t, 55.6, 60.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    tub(t, { tap: 1, land: 1, sea: 1, ppm: PPM, marks: eout(seg(t, 55.9, 56.5)) });
    drainLabels(1);
    A(seg(t, 56.8, 57.4), () => {
      const y0 = levelY(PPM), y1 = levelY(PRE);
      ctx.fillStyle = 'rgba(196,82,31,0.25)'; ctx.fillRect(TUB.x0 + 6, y0, TUB.x1 - TUB.x0 - 12, y1 - y0);
      const y = y1 + 70;
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 190, y - 44, 380, 88, 16); ctx.fill();
      font(800, 30); text(`+${r0(EXTRA)} ppm since 1750`, W / 2, y - 14, { color: C.co2, align: 'center' });
      font(500, 22); text('lasts decades to centuries', W / 2, y + 20, { color: C.soft, align: 'center' });
      arrow(W / 2, y - 46, W / 2, (y0 + y1) / 2 + 14, C.co2, 4, 12);
    });
  });
}
function steady(t) {
  const a = seg(t, 60.2, 60.7);
  if (a <= 0) return;
  A(a, () => {
    const share = lerp(1, STAYS, eio(seg(t, 60.8, 63.0)));
    const d = Math.max(0, change(share));
    tub(t, { tap: share, land: 1, sea: 1, ppm: PPM });
    drainLabels(1);
    ctx.fillStyle = C.panel; k.rrect(330, 128, 400, 182, 18); ctx.fill();
    font(600, 24);
    text('in', 356, 160, { color: C.co2, align: 'left' }); text(`≈ ${r1(share * IN_2025)} ppm a year`, 704, 160, { color: C.co2, align: 'right' });
    text('out', 356, 196, { color: C.ink, align: 'left' }); text(`≈ ${r1(OUT_2025)} ppm a year`, 704, 196, { color: C.ink, align: 'right' });
    font(800, 26);
    const still = d < 0.05;
    text('level', 356, 238, { color: C.ink, align: 'left' }); text(still ? 'steady' : `+${r1(d)} ppm a year`, 704, 238, { color: still ? C.land : C.co2, align: 'right' });
    font(500, 18); text('simplified: drains held at what they took in 2025', 530, 284, { color: C.soft, align: 'center' });
  });
}

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [NUM, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    hook(t);
    perMillion(t);
    then(t);
    bath(t);
    rises(t);
    ocean(t);
    piles(t);
    steady(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 38, weight: 500, family: CAP, ink: C.ink, marks: { '*': C.co2, '~': C.land, '^': C.sea } });
  },
});
