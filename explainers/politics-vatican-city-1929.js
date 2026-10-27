// Explainer for politics-vatican-city-1929 (Roma): on 20 September 1870 Italian troops took Rome and ended the Papal
// States; the popes refused to accept it (the "Roman Question") and stayed inside the Vatican until the Lateran Treaty
// of 11 February 1929 created Vatican City, a state of 0.44 km² under the sovereignty of the Holy See; how it works
// today. Look: a night-blue map of Rome in papal gold and white, Italy's green, the breach in red; the real border of
// Vatican City from OpenStreetMap. Lora for captions, IBM Plex Sans for labels.
//
// Facts:
// - Wikipedia, "Capture of Rome": on 20 September 1870 forces of the Kingdom of Italy took Rome; artillery fired on the
//   Aurelian Walls from 5 a.m. and breached them after a few hours near Porta Pia; General Raffaele Cadorna, about
//   50,000 troops; the French garrison had been recalled in August 1870; Rome was made capital on 3 February 1871;
//   the Law of Guarantees (13 May 1871) was rejected by Pius IX, who called himself a "prisoner in the Vatican".
// - Wikipedia, "Prisoner in the Vatican": from 1870 to the Lateran Treaty of 1929 the popes (Pius IX to Pius XI)
//   stayed inside the Vatican and did not appear on St Peter's Square, so as not to seem to accept Italian rule.
// - Wikipedia, "Papal States": legally established in 756 (Donation of Pepin); area before 1859 about 44,000 km²;
//   the eastern two-thirds were annexed in 1860; Rome was captured on 20 September 1870.
// - The Lateran Treaty (vatican.va, Italian text): signed by Cardinal Pietro Gasparri, Secretary of State, for Pope
//   Pius XI and by Benito Mussolini, Prime Minister and Head of Government, for King Victor Emmanuel III; preamble:
//   to assure the Holy See "absolute and visible independence"; art. 2 Italy recognises the Holy See's sovereignty in
//   the international field; art. 3 full ownership and sovereign jurisdiction over the Vatican, creating Vatican City;
//   St Peter's Square, though part of Vatican City, stays open to the public and subject to the Italian police, who
//   stop at the foot of the basilica's steps; art. 13 and 15 the basilicas of St John Lateran, Santa Maria Maggiore
//   and St Paul and other palaces belong to the Holy See and, though in Italy, have the immunities of embassies;
//   art. 26 the Roman Question is settled and the Holy See recognises the Kingdom of Italy with Rome as its capital.
// - vatican state.va: territory 0.44 km² (44 hectares), partly walled, including St Peter's Square up to the strip
//   that joins the ground to the colonnade, under Italian police supervision; an absolute monarchy whose head of state,
//   the pope, has full legislative, executive and judicial power; laws are also made in his name by the Pontifical
//   Commission of cardinals (five-year terms), the executive is its President, the President of the Governorate,
//   whose bodies run security, health, the post and philately, the museums; own stamps and coins (the euro); the
//   Pontifical Swiss Guard, founded in 1506, and the Gendarmerie guard the pope and the state.
// - The border: OpenStreetMap relation 36989 (Nominatim, simplified). Rome's walls and the Tiber: gates and bridges
//   geocoded with Nominatim, joined by straight lines (schematic).
// Computed here: 44,000 / 0.44 = 100,000; 1929 − 1870 = 59 years.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  Rome, 20 September 1870: the walls, the Tiber, the Vatican; the breach at Porta Pia.
//  B  9.6–18.6  Rome capital; the popes stay inside the Vatican, 1870 → 1929.
//  C 18.8–28.0  The Roman Question; the Lateran Treaty of 11 February 1929 and its signatories.
//  D 28.0–41.6  Italy recognises Vatican City, the Holy See recognises Italy; 0.44 km² against 44,000 km².
//  E 41.8–60.0  The border across St Peter's Square; the Italian police; how the state is governed.
//  F 60.2–65.0  Stamps, euro coins, the Swiss Guard.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  night: '#0f1628', night2: '#1b2744', ink: '#f4f1ea', soft: 'rgba(244,241,234,0.74)', faint: 'rgba(244,241,234,0.22)',
  gold: '#f2c14e', gold2: '#b88a22', white: '#ffffff', red: '#e0524f', green: '#5fb37d', river: '#3f74ad', wall: '#c9b48a', stone: '#d8d2c4',
};
const SERIF = 'Lora', SANS = 'IBM Plex Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const AREA = 0.44, PAPAL = 44000, RATIO = PAPAL / AREA, TAKEN = 1870, TREATY = 1929, GUARD = 1506;
const YEARS = TREATY - TAKEN;
if (Math.round(RATIO) !== 100000 || YEARS !== 59) throw new Error('numbers');

// ---------- geography (lat, lon) ----------
const VATICAN = [[41.90197, 12.44579], [41.90164, 12.44655], [41.9018, 12.44672], [41.9014, 12.44734], [41.901, 12.44797], [41.90085, 12.44779], [41.90069, 12.44795], [41.90082, 12.44877], [41.901, 12.44878], [41.90083, 12.45087], [41.90059, 12.45084], [41.90036, 12.45181], [41.90028, 12.45279], [41.90049, 12.45283], [41.9002, 12.45452], [41.90041, 12.4545], [41.90059, 12.45449], [41.90071, 12.45435], [41.9014, 12.45433], [41.90144, 12.45442], [41.90144, 12.45481], [41.9015, 12.45481], [41.90167, 12.45626], [41.90141, 12.45652], [41.90126, 12.4568], [41.90117, 12.45716], [41.90117, 12.45736], [41.9012, 12.45755], [41.90125, 12.45774], [41.90136, 12.45795], [41.90151, 12.45813], [41.90166, 12.45825], [41.90178, 12.45827], [41.90199, 12.45834], [41.90226, 12.45837], [41.90253, 12.45832], [41.90276, 12.45821], [41.90298, 12.45808], [41.90316, 12.45783], [41.90325, 12.45755], [41.90329, 12.45734], [41.90328, 12.45712], [41.90325, 12.45694], [41.90319, 12.45675], [41.90314, 12.45664], [41.903, 12.45646], [41.90279, 12.4563], [41.90276, 12.45618], [41.90301, 12.45633], [41.90312, 12.45653], [41.9032, 12.45668], [41.90328, 12.45692], [41.90335, 12.45708], [41.90333, 12.45756], [41.90582, 12.45766], [41.9063, 12.45566], [41.90738, 12.4554], [41.90698, 12.45383], [41.9068, 12.45388], [41.90667, 12.45315], [41.90668, 12.45263], [41.90653, 12.45206], [41.90637, 12.45143], [41.90658, 12.45137], [41.90649, 12.45051], [41.90599, 12.45032], [41.90584, 12.45052], [41.90504, 12.44945], [41.90518, 12.44927], [41.90504, 12.44894], [41.90473, 12.44889], [41.90468, 12.4491], [41.90435, 12.44894], [41.90361, 12.44865], [41.9037, 12.44839], [41.90342, 12.44791], [41.90312, 12.44764], [41.90299, 12.44786], [41.90219, 12.44687], [41.90235, 12.44662]];
// the square's open side: the strip of stone between the two arms of the colonnade
const STRIP = [[41.90166, 12.45825], [41.90178, 12.45827], [41.90199, 12.45834], [41.90226, 12.45837], [41.90253, 12.45832], [41.90276, 12.45821]];
const TIBER = [[41.9316, 12.4596], [41.9187, 12.4708], [41.9144, 12.4707], [41.9097, 12.4724], [41.905, 12.4743], [41.9027, 12.4713], [41.9019, 12.4665], [41.9011, 12.4643], [41.8998, 12.4635], [41.8961, 12.466], [41.8923, 12.4707], [41.8911, 12.4745], [41.8905, 12.4778], [41.8891, 12.4792], [41.8829, 12.4756], [41.8754, 12.4705], [41.8719, 12.4719], [41.8601, 12.4705]];
// the Aurelian Walls on the left bank, through their gates (schematic)
const WALLS = [[41.9115, 12.4735], [41.9115, 12.476], [41.9095, 12.4882], [41.9108, 12.4981], [41.9092, 12.501], [41.9068, 12.506], [41.902, 12.5065], [41.8975, 12.5103], [41.8914, 12.5152], [41.8859, 12.5093], [41.8823, 12.4986], [41.8765, 12.5025], [41.8735, 12.5014], [41.8732, 12.4971], [41.8767, 12.4814], [41.8772, 12.4728]];
const PORTA_PIA = [41.9092, 12.501];
const LAT0 = 41.8925, LON0 = 12.479, COSL = Math.cos((LAT0 * Math.PI) / 180), KM = 111.32;
// a view: centre (lat, lon) and pixels per km, on screen centre (vx, vy)
let VIEW = { lat: LAT0, lon: LON0, px: 96, vx: CX + 10, vy: 430 };
const P = ([la, lo]) => [VIEW.vx + (lo - VIEW.lon) * COSL * KM * VIEW.px, VIEW.vy - (la - VIEW.lat) * KM * VIEW.px];
function poly(pts, close = true) { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = P(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); if (close) ctx.closePath(); }
const VAT_C = [41.9036, 12.4522];

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'On 20 September 1870 Italian troops broke through the walls of Rome near *Porta Pia*.'],
  [5.0, 9.4, 'It ended the ~Papal States~, which the popes had ruled in central Italy since AD 756.'],
  [9.6, 14.0, 'Rome became Italy’s capital in 1871. Pope Pius IX refused to accept the loss of his city.'],
  [14.2, 18.6, `The popes then stayed inside the Vatican, calling themselves ^prisoners^, for ${YEARS} years.`],
  [18.8, 23.2, `This was the ‘Roman Question’. On 11 February ${TREATY} the *Lateran Treaty* settled it.`],
  [23.4, 27.8, 'Cardinal Pietro Gasparri signed for Pope Pius XI, Prime Minister Benito Mussolini for the King.'],
  [28.0, 32.4, 'Italy recognised the sovereignty of the Holy See over a new state: *Vatican City*.'],
  [32.6, 37.0, 'In return the Holy See recognised the Kingdom of Italy, with Rome as its capital.'],
  [37.2, 41.6, `Vatican City covers just *${AREA} km²*: the Papal States had been ${(RATIO).toLocaleString('en-US')} times bigger.`],
  [41.8, 46.2, 'The border runs along walls, then across St Peter’s Square on a strip of stone.'],
  [46.4, 50.8, 'The square stays open to everyone, and the ~Italian police~ keep order in it.'],
  [51.0, 55.4, 'Its head of state, the pope, makes laws, governs and judges: an *absolute monarchy*.'],
  [55.6, 60.0, 'Cardinals on a commission make most laws; a governorate runs police, post and museums.'],
  [60.2, 64.6, `It issues stamps and euro coins; the Swiss Guard, founded in ${GUARD}, protects the pope.`],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.night); lg.addColorStop(0.7, C.night2); lg.addColorStop(1, '#0b1120');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(244,241,234,0.045)'; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 36) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y <= H; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}
function label(str, x, y, { size = 22, col = C.ink, align = 'left', weight = 500, fam = SANS } = {}) { font(weight, size, fam); text(str, x, y, { align, base: 'middle', color: col }); }
function pill(str, x, y, col, { align = 'center', size = 22 } = {}) {
  font(600, size); const w = ctx.measureText(str).width, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.fillStyle = 'rgba(15,22,40,0.86)'; k.rrect(x0 - 10, y - size * 0.8, w + 20, size * 1.6, 8); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
  text(str, x0, y, { base: 'middle', color: col });
}
function keys(x, y, s, col = C.gold) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (const sd of [-1, 1]) {
    ctx.save(); ctx.rotate(sd * 0.7);
    ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, 30); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -42, 9, 9, 0, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(10, 22); ctx.moveTo(0, 30); ctx.lineTo(12, 30); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ---------- the map of Rome ----------
function rome(a, { breach = 0, vatGlow = 0, wallsA = 1 } = {}) {
  A(a, () => {
    // the Tiber
    ctx.strokeStyle = C.river; ctx.lineWidth = Math.max(4, 0.09 * VIEW.px); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    poly(TIBER, false); ctx.stroke();
    // the walls
    A(wallsA, () => {
      ctx.strokeStyle = C.wall; ctx.lineWidth = 3; ctx.setLineDash([]);
      poly(WALLS, false); ctx.stroke();
      for (const g of WALLS.slice(1, -1)) { const [x, y] = P(g); ctx.fillStyle = C.wall; ctx.fillRect(x - 3, y - 3, 6, 6); }
    });
    // Vatican City
    poly(VATICAN); ctx.fillStyle = `rgba(242,193,78,${0.35 + 0.4 * vatGlow})`; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
    if (breach > 0) {
      const [x, y] = P(PORTA_PIA);
      A(breach, () => {
        ctx.fillStyle = C.red; for (let i = 0; i < 8; i++) { const r = 6 + 22 * breach + (i % 3) * 4, an = i * 0.8; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(x + Math.cos(an) * r * 0.6, y + Math.sin(an) * r * 0.6, 4, 0, TAU); ctx.fill(); }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = C.red; ctx.fillStyle = C.red; ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
          const go = clamp(breach * 1.4 - i * 0.2), sx = x + 46 + i * 12, sy = y - 44 + i * 16, ex = lerp(sx, x - 26 - i * 6, go), ey = lerp(sy, y + 22 + i * 8, go);
          if (go <= 0) continue;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
          const an = Math.atan2(ey - sy, ex - sx); ctx.beginPath(); ctx.moveTo(ex + Math.cos(an) * 10, ey + Math.sin(an) * 10); ctx.lineTo(ex + Math.cos(an + 2.5) * 12, ey + Math.sin(an + 2.5) * 12); ctx.lineTo(ex + Math.cos(an - 2.5) * 12, ey + Math.sin(an - 2.5) * 12); ctx.fill();
        }
      });
    }
  });
}

// ---------- A, B: 1870 ----------
function scene1870(t) {
  const a = span(t, 0, 18.8, 0.5, 0.4);
  if (a <= 0) return;
  const z = eio(seg(t, 14.0, 15.6));
  // zoom from the city towards the Vatican
  VIEW = { lat: lerp(LAT0, VAT_C[0], z), lon: lerp(LON0, VAT_C[1], z), px: 96 * Math.pow(3.6, z), vx: lerp(CX + 10, CX, z), vy: lerp(430, 370, z) };
  rome(a, { breach: seg(t, 1.6, 3.6), wallsA: 1 - z, vatGlow: seg(t, 15.0, 16.0) });
  A(a, () => {
    A(seg(t, 0.6, 1.4) * (1 - z), () => {
      ctx.fillStyle = 'rgba(15,22,40,0.85)'; k.rrect(40, 74, 400, 84, 10); ctx.fill();
      label('ROME · 20 SEPTEMBER 1870', 56, 100, { size: 26, weight: 700, col: C.ink });
      label('schematic map: the Tiber and the walls', 56, 134, { size: 22, col: C.soft, fam: SERIF });
      const [px, py] = P(PORTA_PIA); pill('Porta Pia', px + 20, py - 70, C.red);
      const [vx, vy] = P(VAT_C); pill('the Vatican', vx - 10, vy - 74, C.gold);
      const [tx, ty] = P([41.8935, 12.4685]); label('Tiber', tx - 8, ty + 8, { size: 22, col: C.river, align: 'right', weight: 600 });
    });
    A(seg(t, 5.4, 6.2) * (1 - seg(t, 9.2, 9.8)), () => {
      const x = 470, y = 560;
      ctx.fillStyle = 'rgba(15,22,40,0.88)'; k.rrect(x - 14, y - 26, 380, 140, 10); ctx.fill();
      label('THE PAPAL STATES', x, y, { size: 22, weight: 700, col: C.gold });
      label('ruled by the popes, AD 756–1870', x, y + 32, { size: 22, col: C.soft });
      label('about 44,000 km² before 1859', x, y + 60, { size: 22, col: C.soft });
      label('most lost in 1860, Rome in 1870', x, y + 88, { size: 22, col: C.soft });
    });
    A(seg(t, 9.8, 10.6) * (1 - z), () => {
      const x = 470, y = 560; ctx.fillStyle = 'rgba(15,22,40,0.88)'; k.rrect(x - 14, y - 26, 380, 84, 10); ctx.fill();
      ctx.fillStyle = C.green; ctx.fillRect(x, y - 12, 10, 24); ctx.fillStyle = C.white; ctx.fillRect(x + 10, y - 12, 10, 24); ctx.fillStyle = C.red; ctx.fillRect(x + 20, y - 12, 10, 24);
      label('capital of the Kingdom of Italy', x + 42, y, { size: 22, weight: 600 });
      label('from 1871', x + 42, y + 30, { size: 22, col: C.soft });
    });
    if (z > 0) A(z, () => {
      keys(CX, 380, 1.0, C.night);
      const yr = Math.round(lerp(TAKEN, TREATY, eio(seg(t, 15.6, 18.2))));
      label(`${yr}`, CX, 640, { size: 56, weight: 700, col: C.gold, align: 'center', fam: SERIF });
      label('the popes stay inside the Vatican', CX, 694, { size: 24, col: C.ink, align: 'center' });
    });
  });
}

// ---------- C: the treaty ----------
function sceneTreaty(t) {
  const a = span(t, 18.8, 28.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const x0 = 132, y0 = 150, w = 600, h = 600;
    ctx.fillStyle = '#f1ead8'; k.rrect(x0, y0, w, h, 6); ctx.fill();
    ctx.strokeStyle = C.gold2; ctx.lineWidth = 3; k.rrect(x0 + 12, y0 + 12, w - 24, h - 24, 4); ctx.stroke();
    const ink = '#2a2430';
    label('TRATTATO', x0 + w / 2, y0 + 70, { size: 34, weight: 700, col: ink, align: 'center', fam: SERIF });
    label('fra la Santa Sede e l’Italia', x0 + w / 2, y0 + 112, { size: 24, col: ink, align: 'center', fam: SERIF });
    label('Treaty between the Holy See and Italy', x0 + w / 2, y0 + 146, { size: 22, col: 'rgba(42,36,48,0.7)', align: 'center' });
    ctx.strokeStyle = 'rgba(42,36,48,0.25)'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const yy = y0 + 196 + i * 28; ctx.beginPath(); ctx.moveTo(x0 + 60, yy); ctx.lineTo(x0 + w - 60 - (i % 3) * 40, yy); ctx.stroke(); }
    label(`Rome, 11 February ${TREATY}`, x0 + w / 2, y0 + 380, { size: 24, col: ink, align: 'center', fam: SERIF });
    const sign = (sx, name, role, start) => {
      const p = eio(seg(t, start, start + 1.4));
      ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let i = 0; i <= 40 * p; i++) { const u = i / 40; const xx = sx - 90 + u * 180, yy = y0 + 452 + Math.sin(u * 19) * 8 * Math.sin(u * 3.1 + 1); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.stroke();
      A(seg(t, start + 0.8, start + 1.4), () => { label(name, sx, y0 + 492, { size: 22, weight: 700, col: ink, align: 'center' }); role.split('\n').forEach((r, i) => label(r, sx, y0 + 522 + i * 26, { size: 22, col: 'rgba(42,36,48,0.75)', align: 'center' })); });
    };
    sign(x0 + 150, 'Pietro Gasparri', 'for Pope Pius XI', 24.0);
    sign(x0 + w - 150, 'Benito Mussolini', 'for King\nVictor Emmanuel III', 25.4);
    // seals
    A(seg(t, 26.6, 27.2), () => {
      for (const [sx, col] of [[CX - 30, C.gold2], [CX + 30, '#b0413e']]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(sx, y0 + h - 44, 22, 0, TAU); ctx.fill(); }
    });
    A(seg(t, 19.6, 20.4) * (1 - seg(t, 23.2, 23.8)), () => pill('the Roman Question: 1870–1929', CX, 110, C.gold));
  });
}

// ---------- D: recognition and size ----------
const VIEW_VAT = { lat: 41.9038, lon: 12.4521, px: 640, vx: CX, vy: 390 };
function sceneState(t) {
  const a = span(t, 28.0, 41.8, 0.4, 0.4);
  if (a <= 0) return;
  // 37.2–41.6: zoom out by √100,000 from the city to a square of the Papal States' size
  const zo = eio(seg(t, 38.0, 40.6)), f = Math.pow(Math.sqrt(RATIO), zo);
  VIEW = { ...VIEW_VAT, px: VIEW_VAT.px / f };
  A(a, () => {
    // the small square of 0.44 km² and the big one of 44,000 km²
    const side = (km2) => Math.sqrt(km2) * VIEW.px, [cx, cy] = P([41.9040, 12.4522]);
    const sSmall = side(AREA), sBig = side(PAPAL);
    if (t > 37.2) A(seg(t, 37.4, 38.0), () => {
      ctx.strokeStyle = C.white; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.strokeRect(cx - sSmall / 2, cy - sSmall / 2, sSmall, sSmall); ctx.setLineDash([]);
      A(1 - zo, () => label(`a square of ${AREA} km²`, cx - sSmall / 2, cy - sSmall / 2 - 18, { size: 22, col: C.white }));
      A(seg(t, 39.0, 39.8), () => {
        ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.strokeRect(cx - sBig / 2, cy - sBig / 2, sBig, sBig);
        ctx.fillStyle = 'rgba(95,179,125,0.12)'; ctx.fillRect(cx - sBig / 2, cy - sBig / 2, sBig, sBig);
        label(`${PAPAL.toLocaleString('en-US')} km²: the Papal States before 1859`, CX, cy - sBig / 2 - 20, { size: 22, col: C.green, align: 'center', weight: 600 });
        label('(as a square)', CX, cy + sBig / 2 + 24, { size: 22, col: C.soft, align: 'center', fam: SERIF });
        pill(`× ${RATIO.toLocaleString('en-US')}`, cx + 40, cy + 40, C.gold, { align: 'left', size: 26 });
      });
    });
    poly(VATICAN); ctx.fillStyle = 'rgba(242,193,78,0.55)'; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke();
    if (zo > 0.6) { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, TAU); ctx.fill(); }
    A(seg(t, 28.6, 29.4) * (1 - seg(t, 37.0, 37.6)), () => {
      label('VATICAN CITY', 56, 112, { size: 28, weight: 700, col: C.gold });
      label('its border, from OpenStreetMap', 56, 146, { size: 22, col: C.soft, fam: SERIF });
      pill('St Peter’s Basilica', P([41.9022, 12.4535])[0], P([41.9022, 12.4535])[1], C.ink);
      pill('St Peter’s Square', P([41.9022, 12.4572])[0] + 20, P([41.9022, 12.4572])[1] + 60, C.ink);
      pill('gardens', P([41.9046, 12.4495])[0], P([41.9046, 12.4495])[1], C.ink);
    });
    A(seg(t, 29.6, 30.4) * (1 - seg(t, 37.0, 37.6)), () => {
      label('Holy See: the pope and the central', 56, 668, { size: 22, col: C.soft });
      label('government of the Catholic Church', 56, 698, { size: 22, col: C.soft });
    });
    A(seg(t, 33.0, 33.8) * (1 - seg(t, 37.0, 37.6)), () => {
      const x = 56, y = 750;
      ctx.fillStyle = C.green; ctx.fillRect(x, y - 12, 10, 24); ctx.fillStyle = C.white; ctx.fillRect(x + 10, y - 12, 10, 24); ctx.fillStyle = C.red; ctx.fillRect(x + 20, y - 12, 10, 24);
      label('Kingdom of Italy, capital Rome: recognised', x + 42, y, { size: 22, weight: 600 });
    });
  });
}

// ---------- E: the border across the square, the police, the government ----------
const VIEW_SQ = { lat: 41.90215, lon: 12.4572, px: 1700, vx: CX - 70, vy: 400 };
function sceneSquare(t) {
  const a = span(t, 41.8, 51.0, 0.4, 0.4);
  if (a <= 0) return;
  const z = eio(seg(t, 41.8, 43.2));
  VIEW = { lat: lerp(VIEW_VAT.lat, VIEW_SQ.lat, z), lon: lerp(VIEW_VAT.lon, VIEW_SQ.lon, z), px: VIEW_VAT.px * Math.pow(VIEW_SQ.px / VIEW_VAT.px, z), vx: lerp(VIEW_VAT.vx, VIEW_SQ.vx, z), vy: lerp(VIEW_VAT.vy, VIEW_SQ.vy, z) };
  A(a, () => {
    poly(VATICAN); ctx.fillStyle = 'rgba(242,193,78,0.35)'; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.stroke();
    // the strip across the open side of the square
    A(seg(t, 43.6, 44.4), () => {
      ctx.strokeStyle = C.white; ctx.lineWidth = 7; poly(STRIP, false); ctx.stroke();
      const [x, y] = P(STRIP[3]); pill('the border: a strip of stone', x + 30, y - 120, C.white, { align: 'left' });
      ctx.strokeStyle = C.white; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 4, y - 8); ctx.lineTo(x + 50, y - 104); ctx.stroke();
      label('ITALY', x + 70, y + 40, { size: 26, weight: 700, col: C.green });
      label('VATICAN CITY', x - 260, y + 140, { size: 26, weight: 700, col: C.gold });
    });
    // people walking in, and the Italian police
    A(seg(t, 46.6, 47.4), () => {
      for (let i = 0; i < 18; i++) {
        const u = ((t - 46.6) * 0.18 + i / 18) % 1, la = 41.90205 + ((i * 37) % 11 - 5) * 0.00008, lo = lerp(12.4605, 12.4572, u);
        const [x, y] = P([la, lo]); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill();
      }
      for (const [la, lo] of [[41.90175, 12.4579], [41.9026, 12.4579], [41.9022, 12.4562]]) { const [x, y] = P([la, lo]); ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill(); ctx.strokeStyle = C.white; ctx.lineWidth = 2; ctx.stroke(); }
      pill('Italian police (green)', 56, 640, C.green, { align: 'left' });
      label('they stop at the foot of the basilica’s steps', 56, 690, { size: 22, col: C.soft });
    });
  });
}
function sceneGovern(t) {
  const a = span(t, 51.0, 60.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    keys(CX, 200, 0.9);
    label('THE POPE', CX, 290, { size: 28, weight: 700, col: C.gold, align: 'center' });
    label('head of state', CX, 322, { size: 22, col: C.soft, align: 'center' });
    const cols = [['makes laws', 160], ['governs', CX], ['judges', W - 160]];
    cols.forEach(([s, x], i) => A(seg(t, 52.2 + i * 0.5, 52.8 + i * 0.5), () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(CX, 340); ctx.lineTo(x, 400); ctx.stroke();
      pill(s, x, 424, C.gold, { size: 24 });
    }));
    A(seg(t, 56.0, 56.8), () => {
      ctx.strokeStyle = C.soft; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(160, 446); ctx.lineTo(160, 510); ctx.moveTo(CX, 446); ctx.lineTo(CX, 510); ctx.moveTo(W - 160, 446); ctx.lineTo(W - 160, 510); ctx.stroke();
      label('Pontifical', 160, 534, { size: 22, align: 'center', weight: 600 }); label('Commission', 160, 560, { size: 22, align: 'center', weight: 600 });
      label('of cardinals', 160, 586, { size: 22, align: 'center', col: C.soft });
      label('Governorate', CX, 534, { size: 22, align: 'center', weight: 600 });
      label('police, post,', CX, 562, { size: 22, align: 'center', col: C.soft }); label('museums…', CX, 588, { size: 22, align: 'center', col: C.soft });
      label('courts', W - 160, 534, { size: 22, align: 'center', weight: 600 });
      label('in his name', W - 160, 562, { size: 22, align: 'center', col: C.soft });
    });
    A(seg(t, 51.6, 52.4), () => label('ABSOLUTE MONARCHY', CX, 660, { size: 26, weight: 700, col: C.ink, align: 'center' }));
  });
}

// ---------- F: stamps, coins, the guard ----------
function sceneThings(t) {
  const a = span(t, 60.2, 65.0, 0.4, 0.0);
  if (a <= 0) return;
  A(a, () => {
    // a stamp
    A(seg(t, 60.4, 61.0), () => {
      const x = 120, y = 300, w = 170, h = 210;
      ctx.fillStyle = '#f1ead8'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = C.night2; for (let i = 0; i < 9; i++) for (const yy of [y, y + h]) { ctx.beginPath(); ctx.arc(x + 10 + i * 19, yy, 5, 0, TAU); ctx.fill(); }
      ctx.fillStyle = C.gold; ctx.fillRect(x + 16, y + 18, w - 32, h - 70);
      keys(x + w / 2, y + 80, 0.6, '#ffffff');
      label('its own stamps', x + w / 2, y + h + 40, { size: 22, align: 'center', weight: 600 });
    });
    // a coin
    A(seg(t, 61.0, 61.6), () => {
      const x = CX, y = 405;
      ctx.fillStyle = '#c9a646'; ctx.beginPath(); ctx.arc(x, y, 80, 0, TAU); ctx.fill();
      ctx.fillStyle = '#d9d4c7'; ctx.beginPath(); ctx.arc(x, y, 58, 0, TAU); ctx.fill();
      label('€', x, y + 2, { size: 64, weight: 700, col: '#5a4a1e', align: 'center' });
      label('euro coins', x, y + 145, { size: 22, align: 'center', weight: 600 });
      label('minted in Italy', x, y + 175, { size: 22, align: 'center', col: C.soft });
    });
    // a halberd for the Swiss Guard
    A(seg(t, 61.6, 62.2), () => {
      const x = W - 170, y = 520;
      ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 260); ctx.stroke();
      ctx.fillStyle = C.stone; ctx.beginPath(); ctx.moveTo(x, y - 300); ctx.lineTo(x + 8, y - 255); ctx.lineTo(x - 8, y - 255); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 3, y - 250); ctx.quadraticCurveTo(x + 50, y - 245, x + 46, y - 205); ctx.lineTo(x + 3, y - 215); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 3, y - 245); ctx.lineTo(x - 30, y - 255); ctx.lineTo(x - 3, y - 228); ctx.closePath(); ctx.fill();
      // the guard's stripes
      for (let i = 0; i < 5; i++) { ctx.fillStyle = ['#1f4aa8', '#e0a227', '#c0392b', '#e0a227', '#1f4aa8'][i]; ctx.fillRect(x - 60 + i * 12, y - 140, 12, 120); }
      label('Swiss Guard', x - 30, y + 40, { size: 22, align: 'center', weight: 600 });
      label(`since ${GUARD}`, x - 30, y + 70, { size: 22, align: 'center', col: C.soft });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 65, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    scene1870(t);
    sceneTreaty(t);
    sceneState(t);
    sceneSquare(t);
    sceneGovern(t);
    sceneThings(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 500, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.green, '^': C.red } });
  },
});
