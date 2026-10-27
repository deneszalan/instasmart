// Explainer for economics-monte-testaccio-amphorae (Roma): Monte Testaccio, a 35-metre hill in Rome, is made of
// broken olive-oil jars, mostly Dressel 20 amphorae from Baetica in southern Spain; why they were smashed rather than
// reused, how the hill was built in terraces, and what tens of millions of jars say about Rome's oil supply. Look:
// a bright Mediterranean day, terracotta sherds, olive green, an engineer's cut through the terraces. Oswald for
// titles and numbers, Alegreya Sans for captions and labels.
//
// Facts:
// - Wikipedia, "Monte Testaccio": almost entirely fragments of amphorae, many with tituli picti; about 35 m high,
//   nearly a kilometre round; mostly 70-litre Dressel 20 jars from Baetica (the Guadalquivir region of Spain), fewer
//   from Tripolitania and Byzacena, all for olive oil; the oil was probably decanted into bulk containers at the
//   port; Dressel 20s broke into large curved pieces that could not readily be crushed for opus signinum; oil-soaked
//   pieces may also have been unsuitable, as oil and lime make soap; terraces with retaining walls of nearly intact
//   amphorae filled with sherds; jars probably carried up intact on donkeys or mules and broken on the spot; lime
//   sprinkled, apparently against the smell of rancid oil; tituli picti record the empty weight, the exporter, the
//   weight of oil, the weighers and the farm's district; the oil came under state authority for the annona;
//   studies suggest up to 130,000 amphorae a year at the peak, late in the 2nd century AD; an estimated 53 million
//   amphorae (cited by Bryan Ward-Perkins, OUP blog, 2005).
// - Archaeology magazine, "Trash Talk" (2009): José Remesal of the University of Barcelona, who co-directs the
//   excavations, estimates "something like 25 million complete ones", adding that it is difficult to be exact;
//   more than 85% are Dressel 20s from Baetica; dumping from Augustus's time until AD 265; terraces of jars without
//   bases filled with sherds, sherds dumped behind, the next row set back; lime against the smell; a sample label
//   gives 216 Roman pounds of oil in a jar whose empty weight was 82 Roman pounds.
// Computed here: 82 / 216 ≈ 0.38 (over a third); 25 million × 70 L ≈ 1.75 billion litres, 53 million × 70 L ≈ 3.7
// billion litres, "roughly 2 to 4 billion litres". The hill, the map and the terraces are schematic.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: the hill; it is made of pottery.
//  B  9.2–18.4  The Dressel 20, from Baetica to Rome.
//  C 18.4–32.0  The painted labels; one jar's weights; why not reuse.
//  D 32.2–50.4  Soap and mortar; donkeys and smashing; terraces; lime.
//  E 50.6–64.6  How many jars, and how much oil.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  sky: '#cfe3ea', sky2: '#f1e7d2', cream: '#f4ecdc', ink: '#3b2a1e', soft: 'rgba(59,42,30,0.70)', faint: 'rgba(59,42,30,0.2)',
  terra: '#c4673d', terra2: '#a9512d', terra3: '#dd8b5c', olive: '#6f7d3a', olive2: '#4f5a28', sea: '#4f8fae', lime: '#f7f4ea',
  white: '#ffffff', red: '#b33a2a',
};
const TITLE = 'Oswald', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const HEIGHT = 35, LITRES = 70, OIL_LB = 216, EMPTY_LB = 82;
const LOW = 25e6, HIGHEST = 53e6;
const SHARE = EMPTY_LB / OIL_LB; // ≈ 0.38
const BILLION_LOW = (LOW * LITRES) / 1e9, BILLION_HIGH = (HIGHEST * LITRES) / 1e9; // ≈ 1.75, 3.71
if (!(SHARE > 1 / 3) || Math.round(BILLION_LOW) !== 2 || Math.round(BILLION_HIGH) !== 4) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, `*Monte Testaccio* in Rome is a hill about ${HEIGHT} m high and nearly 1 km round.`],
  [4.8, 9.0, 'It is not rock. It is almost all broken pottery: Roman oil jars, or *amphorae*.'],
  [9.2, 13.6, `Most are round jars of about ~${LITRES} litres~, made in Baetica, southern Spain, for olive oil.`],
  [13.8, 18.2, 'From Emperor Augustus’s time to about AD 260 they came to Rome. Their oil was probably poured off.'],
  [18.4, 22.8, 'Painted labels, *tituli picti*, record the jar’s empty weight, the merchant and the oil.'],
  [23.0, 27.4, `One label: ${OIL_LB} Roman pounds of oil in a jar weighing ${EMPTY_LB}, over a third as much.`],
  [27.6, 32.0, 'Why not reuse them? These jars broke into big curved pieces, hard to crush for building.'],
  [32.2, 36.6, 'Oil-soaked clay may also have spoiled mortar: oil and lime together make *soap*.'],
  [36.8, 41.2, 'So the empties went up the hill, probably on donkeys or mules, and were smashed there.'],
  [41.4, 45.8, 'Workers built terraces: walls of jars packed with sherds, then more sherds behind.'],
  [46.0, 50.4, 'They sprinkled ^lime^ over the pieces, it seems against the smell of rancid oil.'],
  [50.6, 55.0, 'How many jars? Estimates run from ~25 million~ (excavator José Remesal) to ~53 million~.'],
  [55.2, 59.6, `At ${LITRES} litres a jar, that is roughly *2 to 4 billion litres* of olive oil.`],
  [59.8, 64.2, 'Most of it came for the state’s food supply. At the peak, up to 130,000 jars a year.'],
];

// ---------- background ----------
let bg = null, sherdTex = null;
const rand = (seed) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sky); lg.addColorStop(0.62, C.sky2); lg.addColorStop(0.72, C.cream); lg.addColorStop(1, '#eadfc8');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // a texture of curved sherds, for the hill
  sherdTex = document.createElement('canvas'); sherdTex.width = W; sherdTex.height = 800;
  const h = sherdTex.getContext('2d'), r = rand(13);
  h.fillStyle = C.terra2; h.fillRect(0, 0, W, 800);
  for (let i = 0; i < 2600; i++) {
    const x = r() * W, y = r() * 800, rr = 6 + r() * 14, a0 = r() * TAU;
    h.strokeStyle = [C.terra, C.terra3, '#b85c35', '#8f4426'][Math.floor(r() * 4)];
    h.lineWidth = 3 + r() * 4; h.beginPath(); h.arc(x, y, rr, a0, a0 + 1 + r() * 1.4); h.stroke();
  }
}

// ---------- drawing pieces ----------
/** A Dressel 20 amphora: globular body, short neck, two handles, a small toe. */
function amphora(x, y, s, { fill = C.terra3, labels = 0, broken = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = fill; ctx.strokeStyle = C.terra2; ctx.lineWidth = 3 / s;
  ctx.beginPath(); ctx.ellipse(0, 0, 60, 56, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillRect(-14, -82, 28, 30); ctx.strokeRect(-14, -82, 28, 30);
  ctx.beginPath(); ctx.ellipse(0, -84, 20, 7, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 8; ctx.strokeStyle = fill;
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 14, -74); ctx.quadraticCurveTo(sd * 40, -76, sd * 34, -46); ctx.stroke(); }
  ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(-8, 54); ctx.lineTo(8, 54); ctx.lineTo(0, 66); ctx.closePath(); ctx.fill();
  if (labels > 0) {
    A(labels, () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2;
      const rows = [[-56, -40, 18], [-46, -16, 26], [-30, 8, 22], [-38, 26, 14], [18, -6, 24]];
      for (const [x0, y0, len] of rows) { ctx.beginPath(); for (let i = 0; i <= len; i++) ctx.lineTo(x0 + i * 2.2, y0 + Math.sin(i * 1.7) * 2.2); ctx.stroke(); }
    });
  }
  if (broken > 0) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-50, -20); ctx.lineTo(-10, 6 * broken); ctx.lineTo(10, -30); ctx.lineTo(46, 10 * broken); ctx.stroke();
  }
  ctx.restore();
}
function hill(a, { cross = 1 } = {}) {
  A(a, () => {
    const base = 680;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(60, base);
    // terraced profile: steps up to the summit and down
    const pts = [[60, base], [130, 640], [170, 640], [220, 580], [260, 580], [300, 520], [340, 520], [380, 460], [430, 446], [500, 470], [540, 470], [580, 530], [620, 530], [680, 600], [720, 600], [800, base]];
    pts.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.closePath(); ctx.clip();
    ctx.drawImage(sherdTex, 0, 0);
    ctx.restore();
    ctx.strokeStyle = C.olive2; ctx.lineWidth = 3; ctx.beginPath(); pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.stroke();
    // grass and trees on top
    ctx.fillStyle = C.olive; for (const [x, y] of [[230, 576], [310, 516], [470, 446], [600, 526], [690, 596]]) { ctx.beginPath(); ctx.arc(x, y - 10, 14, 0, TAU); ctx.fill(); }
    // the cross on the summit
    A(cross, () => { ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(430, 446); ctx.lineTo(430, 380); ctx.moveTo(412, 400); ctx.lineTo(448, 400); ctx.stroke(); });
    // houses at the foot
    ctx.fillStyle = '#e9cfa6'; ctx.strokeStyle = C.terra2; ctx.lineWidth = 2;
    for (const [x, w, h] of [[20, 60, 70]]) { ctx.fillRect(x, base - h, w, h); ctx.strokeRect(x, base - h, w, h); }
    ctx.fillStyle = '#d8c7a8'; ctx.fillRect(0, base, W, 16);
  });
}

// ---------- scenes ----------
function sceneHook(t) {
  const a = span(t, 0, 9.4, 0.5, 0.4);
  hill(a);
  A(a, () => {
    font(700, 52, TITLE); text('MONTE TESTACCIO', 52, 82, { base: 'middle', color: C.ink, spacing: '2px' });
    font(600, 24); text('ROME', 52, 128, { base: 'middle', color: C.soft, spacing: '3px' });
    // the height
    A(seg(t, 1.0, 1.8), () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(830, 680); ctx.lineTo(830, 446); ctx.stroke();
      for (const y of [680, 446]) { ctx.beginPath(); ctx.moveTo(820, y); ctx.lineTo(840, y); ctx.stroke(); }
      font(700, 34, TITLE); text(`${HEIGHT} m`, 816, 540, { align: 'right', base: 'middle', color: C.red });
    });
    // zoom: a magnifier on the slope shows sherds
    A(seg(t, 5.0, 5.8), () => {
      const x = 560, y = 280, r = 110;
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
      ctx.drawImage(sherdTex, 200, 200, 220, 220, x - r, y - r, 2 * r, 2 * r); ctx.restore();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 60, y + 92); ctx.lineTo(500, 480); ctx.stroke();
      font(700, 26); text('broken jars', x, y + r + 26, { align: 'center', base: 'middle', color: C.terra2 });
    });
  });
}
function sceneJar(t) {
  const a = span(t, 9.2, 18.6, 0.5, 0.4);
  A(a, () => {
    font(700, 40, TITLE); text('DRESSEL 20', 52, 76, { base: 'middle', color: C.terra2, spacing: '2px' });
    font(600, 22); text('TYPE 20 IN ARCHAEOLOGIST HEINRICH DRESSEL’S LIST OF JARS', 52, 116, { base: 'middle', color: C.soft, spacing: '1px' });
    amphora(250, 430, 1.9 * eout(seg(t, 9.4, 10.4)) + 0.01);
    A(seg(t, 10.6, 11.4), () => {
      font(700, 64, TITLE); text(`≈ ${LITRES} L`, 250, 640, { align: 'center', base: 'middle', color: C.olive2 });
    });
    // a schematic sea route: Baetica to Rome
    A(seg(t, 13.8, 14.6), () => {
      const sx = 520, sy = 560, rx = 780, ry = 300;
      ctx.fillStyle = 'rgba(79,143,174,0.25)'; k.rrect(470, 230, 360, 380, 24); ctx.fill();
      ctx.strokeStyle = C.sea; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(600, 380, rx, ry); ctx.stroke(); ctx.setLineDash([]);
      const p = eio(seg(t, 14.4, 17.4)), qx = (1 - p) * (1 - p) * sx + 2 * (1 - p) * p * 600 + p * p * rx, qy = (1 - p) * (1 - p) * sy + 2 * (1 - p) * p * 380 + p * p * ry;
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(qx - 18, qy); ctx.lineTo(qx + 18, qy); ctx.lineTo(qx + 10, qy + 10); ctx.lineTo(qx - 10, qy + 10); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(qx, qy - 22); ctx.lineTo(qx + 12, qy - 6); ctx.closePath(); ctx.fill();
      for (const [x, y, lab, sub] of [[sx, sy, 'Baetica', 'southern Spain'], [rx, ry, 'Rome', '']]) {
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
        font(700, 26); text(lab, x, y + (lab === 'Rome' ? -26 : 30), { align: lab === 'Rome' ? 'right' : 'left', base: 'middle' });
        if (sub) { font(500, 22); text(sub, x, y + 58, { base: 'middle', color: C.soft }); }
      }
      font(600, 22); text('schematic route', 650, 256, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}
function sceneLabels(t) {
  const a = span(t, 18.4, 32.2, 0.5, 0.4);
  A(a, () => {
    font(700, 40, TITLE); text('TITULI PICTI', 52, 76, { base: 'middle', color: C.terra2, spacing: '2px' });
    font(600, 22); text('PAINTED LABELS, ON A JAR (SCHEMATIC)', 52, 116, { base: 'middle', color: C.soft, spacing: '1px' });
    const jarX = 250, jarY = 400;
    amphora(jarX, jarY, 2.2, { labels: seg(t, 18.8, 19.6), broken: seg(t, 28.0, 28.8) });
    const notes = [['empty weight', -40], ['merchant', -16], ['weight of the oil', 8], ['weighers, farm', 26]];
    notes.forEach(([lab, dy], i) => A(seg(t, 19.4 + i * 0.4, 19.9 + i * 0.4) * (1 - seg(t, 27.4, 27.8)), () => {
      const y = jarY + dy * 2.2;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(jarX + 20, y); ctx.lineTo(470, 240 + i * 56); ctx.stroke();
      font(700, 26); text(lab, 480, 240 + i * 56, { base: 'middle' });
    }));
    // one label's weights, as a balance of bars
    A(span(t, 23.0, 27.8, 0.4, 0.4), () => {
      const x0 = 480, w = 330;
      ctx.fillStyle = C.olive; ctx.fillRect(x0, 500, w, 40);
      ctx.fillStyle = C.terra; ctx.fillRect(x0, 560, w * SHARE * eout(seg(t, 23.4, 24.6)), 40);
      font(700, 24); text(`oil: ${OIL_LB} Roman pounds`, x0, 484, { base: 'middle', color: C.olive2 });
      text(`jar: ${EMPTY_LB}`, x0 + w * SHARE + 12, 580, { base: 'middle', color: C.terra2 });
      font(600, 22); text('one label (Archaeology magazine)', x0, 630, { base: 'middle', color: C.soft });
    });
    A(span(t, 27.6, 32.2, 0.4, 0.4), () => {
      // big curved sherds
      const r = rand(3);
      for (let i = 0; i < 7; i++) {
        const x = 520 + (i % 4) * 80, y = 300 + Math.floor(i / 4) * 120, a0 = r() * TAU;
        ctx.strokeStyle = [C.terra, C.terra3, C.terra2][i % 3]; ctx.lineWidth = 18; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(x, y, 34, a0, a0 + 1.6); ctx.stroke();
      }
      font(700, 26); text('big, curved, thick pieces', 640, 520, { align: 'center', base: 'middle', color: C.terra2 });
      font(600, 22); text('hard to crush into building rubble', 640, 554, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}
function sceneSoap(t) {
  A(span(t, 32.2, 36.8, 0.5, 0.4), () => {
    font(700, 40, TITLE); text('OIL + LIME = SOAP', 52, 76, { base: 'middle', color: C.terra2, spacing: '2px' });
    font(600, 22); text('A LIKELY REASON, NOT A RECORDED ONE', 52, 116, { base: 'middle', color: C.soft, spacing: '1px' });
    // a bucket of mortar with oily sherds and bubbles
    ctx.fillStyle = '#d8d2c2'; ctx.beginPath(); ctx.moveTo(250, 380); ctx.lineTo(614, 380); ctx.lineTo(580, 640); ctx.lineTo(284, 640); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.lime; ctx.fillRect(262, 380, 340, 40);
    const r = rand(9);
    for (let i = 0; i < 26; i++) {
      const x = 290 + r() * 280, y = 420 + r() * 180, rr = 6 + r() * 14;
      const b = clamp((t - 32.8 - r() * 2.4) * 1.6);
      A(b * (1 - seg(t, 36.0, 36.6)), () => { ctx.strokeStyle = 'rgba(79,143,174,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - b * 40, rr, 0, TAU); ctx.stroke(); });
    }
    for (const [x, y] of [[330, 470], [430, 520], [520, 460]]) { ctx.strokeStyle = C.terra; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(x, y, 26, 0.3, 1.9); ctx.stroke(); }
    font(700, 26); text('poor mortar', 432, 690, { align: 'center', base: 'middle', color: C.ink });
  });
}
function donkey(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#7a6a5a';
  ctx.beginPath(); ctx.ellipse(0, 0, 34, 16, 0, 0, TAU); ctx.fill();
  ctx.fillRect(-30, 6, 6, 26); ctx.fillRect(-16, 6, 6, 26); ctx.fillRect(14, 6, 6, 26); ctx.fillRect(26, 6, 6, 26);
  ctx.beginPath(); ctx.moveTo(26, -6); ctx.lineTo(44, -28); ctx.lineTo(54, -22); ctx.lineTo(38, 2); ctx.closePath(); ctx.fill();
  ctx.fillRect(44, -40, 4, 14); ctx.fillRect(50, -38, 4, 12);
  ctx.restore();
  amphora(x - 14, y - 34, 0.32);
  amphora(x + 12, y - 34, 0.32);
}
function sceneBuild(t) {
  const a = span(t, 36.8, 50.6, 0.5, 0.4);
  A(a, () => {
    font(700, 40, TITLE); text('BUILDING THE HILL', 52, 76, { base: 'middle', color: C.terra2, spacing: '2px' });
    font(600, 22); text('A CUT THROUGH THE TERRACES (SCHEMATIC)', 52, 116, { base: 'middle', color: C.soft, spacing: '1px' });
    const base = 690;
    // the slope, built in terraces from the right
    const rows = 4, rowH = 92, setback = 120;
    const grow = seg(t, 41.4, 45.6);
    for (let i = 0; i < rows; i++) {
      const v = clamp(grow * rows - i);
      if (i > 0 && v <= 0) continue;
      const x0 = 150 + i * setback, y0 = base - (i + 1) * rowH;
      // sherd fill behind (left of) the wall
      A(i === 0 ? 1 : v, () => {
        ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, 700 - x0, rowH); ctx.clip();
        ctx.drawImage(sherdTex, 0, i * 120, W, 300, 0, y0 - 60, W, 300); ctx.restore();
      });
      // the retaining wall: a row of jars on end, packed with sherds
      A(i === 0 ? 1 : v, () => { for (let j = 0; j < 4; j++) amphora(x0 + 6, y0 + 20 + j * 18, 0.36, { fill: C.terra3 }); });
    }
    ctx.fillStyle = '#d8c7a8'; ctx.fillRect(0, base, W, 16);
    // a donkey climbing with whole jars
    A(span(t, 36.8, 41.6, 0.4, 0.4), () => {
      const p = seg(t, 37.0, 40.8);
      donkey(lerp(120, 560, p), lerp(base - 20, base - 3 * rowH - 20, p), 1.2);
      A(seg(t, 39.6, 40.4), () => { font(700, 30, TITLE); text('SMASH', 640, base - 3 * rowH - 80, { align: 'center', base: 'middle', color: C.red }); });
    });
    A(span(t, 41.6, 46.2, 0.4, 0.4), () => {
      font(700, 24); text('walls of jars, packed with sherds', 470, 228, { align: 'center', base: 'middle' });
      text('each new row set back', 470, 262, { align: 'center', base: 'middle', color: C.soft });
    });
    // lime dusted over the top
    A(seg(t, 46.0, 46.8), () => {
      const r = rand(21);
      for (let i = 0; i < 160; i++) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; const x = 150 + r() * 560, y = base - 4 * rowH - 20 + r() * 4 * rowH; ctx.fillRect(x, y, 3, 3); }
      font(700, 26); text('lime', 760, base - 2 * rowH, { align: 'right', base: 'middle', color: C.ink });
    });
  });
}
function sceneCount(t) {
  A(span(t, 50.6, 64.6, 0.5, 0.0), () => {
    font(700, 40, TITLE); text('HOW MANY JARS?', 52, 76, { base: 'middle', color: C.terra2, spacing: '2px' });
    font(600, 22); text('ESTIMATES, NOT COUNTS', 52, 116, { base: 'middle', color: C.soft, spacing: '1px' });
    // two bars: the two estimates
    const x0 = 80, w = 700, sc = w / 60e6;
    for (const [n, lab, who, y, at] of [[LOW, '25 million', 'José Remesal, excavation co-director', 200, 50.8], [HIGHEST, '53 million', 'cited by historian Bryan Ward-Perkins', 330, 51.6]]) {
      const v = eout(seg(t, at, at + 1.2));
      ctx.fillStyle = C.terra; ctx.fillRect(x0, y, n * sc * v, 56);
      font(700, 40, TITLE); text(lab, x0 + 12, y + 28, { base: 'middle', color: C.white });
      font(600, 22); text(who, x0, y + 82, { base: 'middle', color: C.soft });
    }
    // litres
    A(seg(t, 55.2, 56.0), () => {
      font(700, 64, TITLE); text(`${BILLION_LOW.toFixed(2).replace(/0$/, '')}–${BILLION_HIGH.toFixed(1)} billion L`, 432, 530, { align: 'center', base: 'middle', color: C.olive2 });
      font(600, 24); text(`at about ${LITRES} litres a jar`, 432, 586, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 59.8, 60.6), () => {
      font(700, 30, TITLE); text('PEAK: UP TO 130,000 JARS A YEAR', 432, 660, { align: 'center', base: 'middle', color: C.red, spacing: '1px' });
      font(600, 22); text('late 2nd century AD, mostly for the state’s food supply', 432, 700, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneJar(t);
    sceneLabels(t);
    sceneSoap(t);
    sceneBuild(t);
    sceneCount(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.terra2, '~': C.olive2, '^': C.sea } });
  },
});
