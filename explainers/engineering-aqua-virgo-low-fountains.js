// Explainer for engineering-aqua-virgo-low-fountains (Roma): the Trevi Fountain is the end of the Aqua Virgo, the
// aqueduct Marcus Agrippa brought to Rome in 19 BC. Its springs are low and its channel falls only a few metres, and
// water in a pipe rises no higher than where it comes from, so the fountains on it have no tall jets: Pietro
// Bernini's Barcaccia sits below the street, and Nicola Salvi sank the Trevi into the ground and let the water tumble.
// Look: night water, travertine and teal, an engineer's long profile with the ground drawn as rolling hills.
// Cormorant Garamond for titles and inscriptions, Jost for captions and labels.
//
// Facts:
// - Frontinus, De aquaeductu 10 (Bennett's translation, LacusCurtius): Agrippa brought the Virgo to Rome in the
//   consulship of Gaius Sentius and Quintus Lucretius (19 BC); it first flowed in the City on 9 June; named after a
//   girl who showed soldiers the springs; intake at the eighth milestone of the Via Collatina; length 14,105 paces,
//   12,865 of them underground, 1,240 above ground (540 on substructures, 700 on arches). Frontinus 18 ranks the
//   aqueducts by height: Virgo comes after Old Anio, followed only by Appia and Alsietina.
// - Karmon, "Restoring the ancient water supply system in Renaissance Rome" (The Waters of Rome 3, 2005): springs
//   at Salone, about 10 km outside Rome; the low spring dictated the height of the system, so it could only reach
//   the lower parts of Rome, such as the Campus Martius; 21 km long, 19 km underground (Tolomeo 1986).
// - Wikipedia, "Aqua Virgo": the source only about 24 m above sea level; the channel drops only about 4 m to its end.
//   Wikipedia, "List of fountains in Rome", after Rinne and Symmes: only about a 7 m drop from the source to the
//   Navona fountains, so the water could only fall or trickle, not jet high; Salvi compensated at the Trevi by
//   sinking the fountain into the ground and designing a churning, tumbling cascade.
// - Turismo Roma, "Fontana della Barcaccia": Pietro Bernini, 1626–1629, for Pope Urban VIII; the Acqua Vergine's
//   pressure was too low for jets or cascades, so the boat-shaped fountain sits below the street.
// - Wikipedia, "Trevi Fountain": Nicola Salvi, begun 1732, completed by Giuseppe Pannini in 1762; the terminal show
//   fountain of the Acqua Vergine; coins go to Caritas. Finestre sull'Arte: in 2022 over 33,000 kg of coins, worth
//   over 1.4 million euros, went to Caritas di Roma. Italian Wikipedia, "Aqua Virgo": the Acqua Vergine still feeds
//   the Barcaccia, the Trevi and the Fountain of the Four Rivers.
// Computed here: 14,105 paces × 1.48 m ≈ 21 km; 12,865 / 14,105 ≈ 91% underground. The profile is schematic (heights
// exaggerated); the fountains are simplified.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: the Trevi Fountain; its basin sits below the street.
//  B  9.2–18.4  Agrippa's aqueduct: 9 June 19 BC; 21 km, 91% underground.
//  C 18.4–32.0  A low spring, a gentle fall; water rises no higher than its source.
//  D 32.2–41.2  The Barcaccia: sunk below the street, the water spills over.
//  E 41.4–50.4  The Trevi: Salvi sinks the basin and lets the water tumble.
//  F 50.6–64.6  Still running: Barcaccia, Four Rivers; the coins.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  night: '#0d1f25', night2: '#173a44', stone: '#e6dcc8', stone2: '#c9bca2', shade: '#9e9077', ink: '#eef6f4',
  soft: 'rgba(238,246,244,0.70)', faint: 'rgba(238,246,244,0.24)', water: '#3fa7b5', water2: '#2b7f8c', foam: '#d9f3f3',
  gold: '#f2c14e', coral: '#ef7a5a', earth: '#3a4a3c', earth2: '#2c3a2f',
};
const TITLE = 'Cormorant Garamond', SANS = 'Jost';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const PACES = 14105, UNDER = 12865, PACE = 1.48;
const KM = Math.round((PACES * PACE) / 1000); // ≈ 21
const UNDER_PCT = Math.round((UNDER / PACES) * 100); // ≈ 91
const SPRING = 24; // metres above sea level
if (KM !== 21 || UNDER_PCT !== 91) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'Rome’s *Trevi Fountain* runs on water from an aqueduct first opened in *19 BC*.'],
  [4.8, 9.0, 'Its basin lies below the street, down some steps. The reason is plumbing, not style.'],
  [9.2, 13.6, 'Augustus’s general Marcus Agrippa brought the *Aqua Virgo* to Rome on 9 June 19 BC.'],
  [13.8, 18.2, `By the Roman writer Frontinus’s figures it ran ~${KM} km~, ~${UNDER_PCT}%~ of it *underground*.`],
  [18.4, 22.8, `Its springs lie only about *${SPRING} m* above sea level, low for a Roman aqueduct.`],
  [23.0, 27.4, 'It falls just a few metres on the way, so it can reach only the *low* parts of Rome.'],
  [27.6, 32.0, 'Piped water can’t rise above its source, so this water has little height to spare.'],
  [32.2, 36.6, 'By the Spanish Steps, sculptor Pietro Bernini sank his *Barcaccia* fountain low.'],
  [36.8, 41.2, 'The boat of 1626–29 sits below the street, and its water spills over the sides.'],
  [41.4, 45.8, 'At the Trevi, built 1732–62, architect Nicola Salvi sank the basin into the ground.'],
  [46.0, 50.4, 'Instead of shooting up, the water *tumbles* over carved rocks into the low pool.'],
  [50.6, 55.0, 'It still feeds Gian Lorenzo Bernini’s Four Rivers fountain in Piazza Navona, too.'],
  [55.2, 59.6, 'Coins thrown into the Trevi go to the charity *Caritas*: over ^1.4 million euros^ in 2022.'],
  [59.8, 64.2, 'Two thousand years on, a low Roman spring still decides how these fountains look.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.night); lg.addColorStop(0.7, C.night2); lg.addColorStop(1, '#0a171b');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2400; i++) { g.fillStyle = `rgba(180,230,235,${r() * 0.035})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1); }
}

// ---------- water helpers ----------
function ripples(x0, x1, y, t, col = C.foam) {
  ctx.strokeStyle = col; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 6) ctx.lineTo(x, y + 6 + i * 9 + Math.sin(x * 0.05 + t * 3 + i) * 2.4);
    A(0.5 - i * 0.12, () => ctx.stroke());
  }
}
function cascade(x, yTop, yBot, w, t) {
  // falling water as moving streaks
  ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2, yTop, w, yBot - yTop); ctx.clip();
  ctx.fillStyle = 'rgba(63,167,181,0.55)'; ctx.fillRect(x - w / 2, yTop, w, yBot - yTop);
  ctx.strokeStyle = C.foam; ctx.lineWidth = 2;
  for (let i = 0; i < w / 7; i++) {
    const xx = x - w / 2 + 4 + i * 7, ph = (t * 140 + i * 37) % (yBot - yTop + 40);
    ctx.beginPath(); ctx.moveTo(xx, yTop + ph - 40); ctx.lineTo(xx, yTop + ph); ctx.stroke();
  }
  ctx.restore();
}

// ---------- the Trevi, in elevation ----------
const STREET = 600, POOL = 668; // y of the street and of the water in the sunk basin
function trevi(t, a, { notes = 0 } = {}) {
  A(a, () => {
    const cx = 432;
    // Palazzo Poli's façade with the central triumphal arch
    ctx.fillStyle = C.stone2; ctx.fillRect(60, 170, 744, STREET - 170);
    ctx.fillStyle = C.stone; ctx.fillRect(300, 150, 264, STREET - 150);
    ctx.fillStyle = C.stone; ctx.fillRect(280, 130, 304, 34);
    for (const x of [318, 362, 502, 546]) { ctx.fillStyle = '#f1e9d7'; ctx.fillRect(x - 9, 170, 18, STREET - 260); }
    // windows on the wings
    ctx.fillStyle = 'rgba(13,31,37,0.75)';
    for (const x0 of [90, 190, 620, 720]) for (const y0 of [210, 320]) ctx.fillRect(x0, y0, 44, 66);
    // the central niche and the figure of Oceanus (simplified)
    ctx.fillStyle = '#2a3f45'; ctx.beginPath(); ctx.moveTo(cx - 54, 430); ctx.lineTo(cx - 54, 270); ctx.arc(cx, 270, 54, Math.PI, 0); ctx.lineTo(cx + 54, 430); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f4eee0';
    ctx.beginPath(); ctx.arc(cx, 300, 14, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 22, 318); ctx.lineTo(cx + 22, 318); ctx.lineTo(cx + 30, 420); ctx.lineTo(cx - 30, 420); ctx.closePath(); ctx.fill();
    font(700, 26, TITLE); text('AQVA VIRGO', cx, 148, { align: 'center', base: 'middle', color: '#5a4d38', spacing: '4px' });
    // the rocks (scogliera)
    ctx.fillStyle = '#d6cbb3';
    ctx.beginPath(); ctx.moveTo(150, STREET + 30); ctx.lineTo(210, 500); ctx.lineTo(300, 460); ctx.lineTo(360, 432); ctx.lineTo(504, 432); ctx.lineTo(570, 462); ctx.lineTo(660, 500); ctx.lineTo(714, STREET + 30); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.shade; ctx.lineWidth = 2; ctx.stroke();
    // the water tumbling over the rocks into the sunk pool
    cascade(cx, 432, POOL, 120, t);
    cascade(cx - 150, 520, POOL, 46, t + 0.7);
    cascade(cx + 150, 520, POOL, 46, t + 1.3);
    // street, steps down to the pool, the pool itself
    ctx.fillStyle = '#4b5b5b'; ctx.fillRect(0, STREET, W, 16);
    ctx.fillStyle = C.water2; ctx.fillRect(100, POOL, 664, 60);
    ctx.fillStyle = C.water; ctx.fillRect(100, POOL, 664, 10);
    ripples(110, 754, POOL, t);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#b9ad94' : '#cfc3a9'; ctx.fillRect(40 + i * 14, STREET + 16 + i * 14, 60, 14); ctx.fillRect(764 - i * 14, STREET + 16 + i * 14, 60, 14); }
    ctx.fillStyle = '#cfc3a9'; ctx.fillRect(96, POOL - 4, 8, 64); ctx.fillRect(760, POOL - 4, 8, 64);
    A(notes, () => {
      ctx.strokeStyle = C.coral; ctx.lineWidth = 2.5; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(30, STREET); ctx.lineTo(160, STREET); ctx.stroke(); ctx.setLineDash([]);
      font(600, 24); text('street', 40, STREET - 18, { base: 'middle', color: C.coral });
      text('pool, below the street', 120, POOL + 86, { base: 'middle', color: C.water });
      ctx.strokeStyle = C.coral; ctx.beginPath(); ctx.moveTo(80, STREET + 6); ctx.lineTo(80, POOL); ctx.stroke();
    });
  });
}

// ---------- B/C: the long profile ----------
// distance 0 (the springs, east) … 21 km (the city, west), drawn right to left; heights exaggerated
const PX0 = 800, PX1 = 70, BASE = 640;
const dx = (km) => lerp(PX0, PX1, km / KM);
const ground = (km) => 520 - 60 * Math.sin(km * 0.55) - 36 * Math.sin(km * 1.3 + 1) + (km > 17 ? (km - 17) * 18 : 0);
const chan = (km) => lerp(560, 600, km / KM); // the channel: a gentle, steady fall
function profile(t, a, { level = 0, tube = 0 } = {}) {
  A(a, () => {
    // ground with hills
    ctx.fillStyle = C.earth; ctx.beginPath(); ctx.moveTo(PX0 + 30, BASE + 60);
    for (let km = -1; km <= KM + 1; km += 0.25) ctx.lineTo(dx(km), ground(km));
    ctx.lineTo(PX1 - 40, BASE + 60); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6f8a70'; ctx.lineWidth = 3; ctx.beginPath();
    for (let km = -1; km <= KM + 1; km += 0.25) ctx.lineTo(dx(km), ground(km)); ctx.stroke();
    // the channel, drawn as it fills
    const fill = seg(t, 9.6, 12.8);
    ctx.strokeStyle = C.water; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); for (let km = 0; km <= KM * fill; km += 0.2) ctx.lineTo(dx(km), chan(km)); ctx.stroke();
    // the city's last stretch on arches
    if (fill > 0.97) {
      ctx.strokeStyle = C.stone2; ctx.lineWidth = 3;
      for (let km = KM - 1.1; km <= KM; km += 0.22) { ctx.beginPath(); ctx.moveTo(dx(km), chan(km) + 6); ctx.lineTo(dx(km), ground(km)); ctx.stroke(); }
    }
    // springs and city
    ctx.fillStyle = C.water; ctx.beginPath(); ctx.arc(dx(0), chan(0), 12, 0, TAU); ctx.fill();
    font(600, 24); text('springs', dx(0) + 4, chan(0) + 34, { align: 'center', base: 'middle', color: C.water });
    text('ROME', dx(KM) + 10, ground(KM) - 40, { align: 'center', base: 'middle', color: C.ink, spacing: '3px' });
    // the level of the source, and what water can do below it
    A(level, () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(dx(0), chan(0)); ctx.lineTo(dx(KM) - 20, chan(0)); ctx.stroke(); ctx.setLineDash([]);
      font(600, 24); text('level of the springs', dx(KM * 0.3), chan(0) - 20, { align: 'center', base: 'middle', color: C.gold });
    });
    A(tube, () => {
      // a pipe that tries to rise above the source level: the water stops at it
      const x = dx(KM) + 40, y0 = chan(KM), yTop = chan(0) - 90;
      ctx.strokeStyle = C.stone; ctx.lineWidth = 3;
      ctx.strokeRect(x - 12, yTop, 24, y0 - yTop);
      const lvl = lerp(y0, chan(0), eout(seg(t, 28.0, 30.0)));
      ctx.fillStyle = C.water; ctx.fillRect(x - 10, lvl, 20, y0 - lvl);
      font(600, 22); text('water stops here', x + 22, chan(0), { base: 'middle', color: C.gold });
    });
  });
}

// ---------- D: the Barcaccia ----------
function barcaccia(t, a) {
  A(a, () => {
    const cx = 432, street = 560, pool = 610;
    // the Spanish Steps behind, simplified
    ctx.fillStyle = C.stone2;
    for (let i = 0; i < 12; i++) ctx.fillRect(170 + i * 10, street - 24 - i * 26, 524 - i * 20, 24);
    ctx.fillStyle = C.stone; ctx.fillRect(300, 150, 264, 40);
    ctx.fillStyle = C.stone2; ctx.fillRect(320, 60 + 60, 40, 30); ctx.fillRect(504, 120, 40, 30);
    // street and the sunk basin
    ctx.fillStyle = '#4b5b5b'; ctx.fillRect(0, street, W, 14);
    ctx.fillStyle = '#1b3036'; ctx.fillRect(170, street + 14, 524, 110);
    ctx.fillStyle = C.water2; ctx.beginPath(); ctx.ellipse(cx, pool + 30, 250, 46, 0, 0, TAU); ctx.fill();
    ripples(200, 664, pool + 14, t);
    // the boat, half sunk
    ctx.fillStyle = C.stone;
    ctx.beginPath(); ctx.moveTo(cx - 170, pool - 22); ctx.quadraticCurveTo(cx - 190, pool - 60, cx - 150, pool - 64); ctx.lineTo(cx + 150, pool - 64); ctx.quadraticCurveTo(cx + 190, pool - 60, cx + 170, pool - 22); ctx.quadraticCurveTo(cx, pool + 8, cx - 170, pool - 22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.shade; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.water; ctx.fillRect(cx - 130, pool - 60, 260, 12);
    // spills over the sides
    for (const s of [-1, 1]) cascade(cx + s * 120, pool - 48, pool + 10, 40, t + (s > 0 ? 0.5 : 0));
    // the central baluster with a low spout
    ctx.fillStyle = C.stone; ctx.fillRect(cx - 12, pool - 120, 24, 60);
    ctx.fillStyle = C.foam; ctx.beginPath(); ctx.ellipse(cx, pool - 126, 20, 8, 0, 0, TAU); ctx.fill();
    // annotations
    ctx.strokeStyle = C.coral; ctx.lineWidth = 2.5; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(40, street); ctx.lineTo(160, street); ctx.stroke(); ctx.setLineDash([]);
    font(600, 24); text('street', 44, street - 18, { base: 'middle', color: C.coral });
    text('basin below the street', 690, pool + 70, { align: 'right', base: 'middle', color: C.water });
    font(700, 34, TITLE); text('Fontana della Barcaccia', 52, 70, { base: 'middle' });
    font(500, 22); text('PIETRO BERNINI, 1626–1629, AT THE SPANISH STEPS', 52, 104, { base: 'middle', color: C.soft, spacing: '1px' });
  });
}

// ---------- F: three fountains on one aqueduct ----------
function network(t, a) {
  A(a, () => {
    font(700, 34, TITLE); text('Still on the Aqua Virgo', 52, 70, { base: 'middle' });
    font(500, 22); text('SCHEMATIC, NOT TO SCALE', 52, 104, { base: 'middle', color: C.soft, spacing: '2px' });
    // conduit from the north-east, under the Pincian, to the Trevi; branches to the Barcaccia and to Navona
    const P = { pincio: [700, 210], barcaccia: [560, 300], trevi: [520, 470], navona: [190, 420] };
    const grow = seg(t, 50.8, 53.0);
    ctx.strokeStyle = C.water; ctx.lineWidth = 6; ctx.lineCap = 'round';
    const seg2 = (p, q, f) => { if (f <= 0) return; ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(lerp(p[0], q[0], f), lerp(p[1], q[1], f)); ctx.stroke(); };
    seg2([820, 150], P.pincio, clamp(grow * 3));
    seg2(P.pincio, P.barcaccia, clamp(grow * 3 - 1));
    seg2(P.pincio, P.trevi, clamp(grow * 3 - 1));
    seg2(P.trevi, P.navona, clamp(grow * 3 - 2));
    for (const [key, lab, sub] of [['trevi', 'Trevi Fountain', 'Salvi, 1732–1762'], ['barcaccia', 'Barcaccia', 'P. Bernini, 1626–1629'], ['navona', 'Four Rivers', 'G. L. Bernini, 1651']]) {
      const [x, y] = P[key];
      ctx.fillStyle = C.foam; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.water; ctx.lineWidth = 3; ctx.stroke();
      font(600, 26); text(lab, x + (key === 'navona' ? 0 : 24), y + (key === 'navona' ? 40 : -6), { align: key === 'navona' ? 'center' : 'left', base: 'middle' });
      font(500, 22); text(sub, x + (key === 'navona' ? 0 : 24), y + (key === 'navona' ? 70 : 22), { align: key === 'navona' ? 'center' : 'left', base: 'middle', color: C.soft });
    }
  });
}
function coins(t, a) {
  A(a, () => {
    ctx.fillStyle = 'rgba(13,31,37,0.86)'; ctx.fillRect(0, 0, W, 760);
    trevi(t, 0.22);
    // coins falling into the pool
    for (let i = 0; i < 14; i++) {
      const p = ((t * 0.7 + i * 0.37) % 1.6) / 1.6, x = 160 + ((i * 97) % 560), y = lerp(120, POOL + 10, p * p);
      A(1 - seg(p, 0.85, 1), () => { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.ellipse(x, y, 9, 9 * Math.abs(Math.cos(t * 6 + i)) + 1, 0, 0, TAU); ctx.fill(); });
    }
    ctx.fillStyle = 'rgba(13,31,37,0.88)'; k.rrect(112, 196, 640, 236, 18); ctx.fill();
    font(700, 92, TITLE); text('€1.4 million', 432, 290, { align: 'center', base: 'middle', color: C.gold });
    font(600, 28); text('IN COINS, 2022, TO CARITAS DI ROMA', 432, 360, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
    font(500, 24); text('over 33 tonnes of them', 432, 400, { align: 'center', base: 'middle', color: C.soft });
  });
}

// ---------- scenes ----------
function sceneHook(t) {
  const a = span(t, 0, 9.4, 0.5, 0.4);
  trevi(t, a, { notes: seg(t, 5.0, 5.8) });
  A(a * (1 - seg(t, 4.6, 5.0)), () => {
    font(700, 44, TITLE); text('Trevi Fountain', 52, 70, { base: 'middle' });
    font(500, 22); text('ROME · NICOLA SALVI, 1732–1762', 52, 106, { base: 'middle', color: C.soft, spacing: '2px' });
  });
}
function sceneProfile(t) {
  const a = span(t, 9.2, 32.2, 0.5, 0.4);
  profile(t, a, { level: seg(t, 18.6, 19.4), tube: seg(t, 27.6, 28.2) });
  A(span(t, 9.2, 18.6, 0.4, 0.4), () => {
    font(700, 36, TITLE); text('Aqua Virgo', 52, 70, { base: 'middle', color: C.water });
    font(500, 22); text('MARCUS AGRIPPA · FIRST FLOWED 9 JUNE 19 BC', 52, 106, { base: 'middle', color: C.soft, spacing: '1px' });
  });
  A(span(t, 13.8, 18.6, 0.4, 0.4), () => {
    font(700, 56, TITLE); text(`${KM} km`, 432, 250, { align: 'center', base: 'middle', color: C.ink });
    font(600, 26); text(`${UNDER_PCT}% UNDERGROUND`, 432, 310, { align: 'center', base: 'middle', color: C.water, spacing: '2px' });
    font(500, 22); text(`${PACES.toLocaleString('en-US')} paces, by Frontinus`, 432, 348, { align: 'center', base: 'middle', color: C.soft });
  });
  A(span(t, 18.4, 27.6, 0.4, 0.4), () => {
    font(700, 36, TITLE); text('A low spring', 52, 70, { base: 'middle', color: C.gold });
    font(500, 22); text(`ABOUT ${SPRING} M ABOVE SEA LEVEL · HEIGHTS EXAGGERATED`, 52, 106, { base: 'middle', color: C.soft, spacing: '1px' });
    A(seg(t, 23.2, 23.8), () => {
      font(600, 24); text('falls only a few metres in 21 km', dx(KM * 0.5), chan(KM * 0.5) + 40, { align: 'center', base: 'middle', color: C.water });
    });
  });
  A(span(t, 27.6, 32.2, 0.4, 0.4), () => {
    font(700, 36, TITLE); text('No higher than its source', 52, 70, { base: 'middle', color: C.gold });
    font(500, 22); text('AT MOST UP TO THE DASHED LINE, LESS WITH FRICTION', 52, 106, { base: 'middle', color: C.soft, spacing: '1px' });
  });
}
function sceneBarcaccia(t) { barcaccia(t, span(t, 32.2, 41.4, 0.5, 0.4)); }
function sceneTrevi(t) {
  const a = span(t, 41.4, 50.6, 0.5, 0.4);
  trevi(t, a, { notes: 1 });
  A(a, () => {
    font(700, 34, TITLE); text('Sunk into the ground', 52, 70, { base: 'middle' });
    font(500, 22); text('NICOLA SALVI · BEGUN 1732, FINISHED 1762', 52, 106, { base: 'middle', color: C.soft, spacing: '1px' });
  });
  A(span(t, 46.0, 50.6, 0.4, 0.4), () => {
    font(600, 24); text('tumbling, not jetting', 760, POOL + 86, { align: 'right', base: 'middle', color: C.foam });
  });
}
function sceneEnd(t) {
  network(t, span(t, 50.6, 55.2, 0.5, 0.4));
  coins(t, span(t, 55.2, 59.8, 0.5, 0.4));
  A(span(t, 59.8, 64.6, 0.5, 0.0), () => {
    trevi(t, 1);
    font(700, 40, TITLE); text('19 BC → today', 52, 70, { base: 'middle', color: C.water });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneProfile(t);
    sceneBarcaccia(t);
    sceneTrevi(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.water, '~': C.foam, '^': C.gold } });
  },
});
