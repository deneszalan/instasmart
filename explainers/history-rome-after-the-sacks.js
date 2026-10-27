// Explainer for history-rome-after-the-sacks (Roma): how the city of perhaps a million shrank to some tens of
// thousands by about AD 550-600, and why what was left gathered by the river while the ancient city sank under
// metres of earth. Look: a night map of Rome inside the Aurelian Walls, the Tiber's bend in blue, every dot 10,000
// people (solid: the low estimate; rings: the rest up to the high one); then a cross-section of the ground rising.
// Oswald for numbers and labels, Outfit for captions.
//
// Facts:
// - G. R. Storey, "The population of ancient Rome", Antiquity 71 (1997): many have believed in as many as one million
//   inhabitants, the figure in standard accounts; estimates in the favoured range of 750,000-1,000,000; Storey argues
//   for roughly 450,000. The Aurelian Walls enclose 13.86 km²; a million inside them would be 72,150 per km².
// - Wikipedia, "Sack of Rome (410)": 24 August 410, the Visigoths under King Alaric entered by the Salarian Gate and
//   pillaged for three days, the first fall to a foreign enemy in almost 800 years; the seat of government had moved
//   to Milan in 286 and to Ravenna in 402; Bertrand Lançon estimates the population fell from 800,000 in 408 to
//   500,000 by 419.
// - Wikipedia, "Sack of Rome (455)": the Vandals under Gaiseric sailed from Carthage and sacked the city for two
//   weeks, 2-16 June 455; the population had fallen from 700,000-1,000,000 at the end of the 4th century to
//   300,000-500,000 by 455.
// - Wikipedia, "Siege of Rome (537-538)": the Goths under Vitiges blocked the aqueducts that supplied water for
//   drinking and for the mills on the Janiculum, which made most of the city's bread; Belisarius built floating mills
//   on the Tiber; by one estimate the population fell to around 30,000 by 550.
// - R. Coates-Stephens, JRS 88 (1998), n. 30: Durliat's 60,000 at the end of the Ostrogothic period; Krautheimer's
//   maximum of 90,000 at the time of Gregory the Great (pope 590-604); one estimate as low as 5,000. The usual model of
//   people crowding into the Tiber bend for water rests on little evidence; Pope Hadrian I restored the Aqua Virgo.
// - Wikipedia, "Campus Martius": about 2 km²; after the aqueducts were cut, the dwindling population left the hills
//   and concentrated there, relying on the Tiber for water. Wikipedia, "Roman Forum": flood sediments of the Tiber and
//   erosion of the hills raised the floor; residents paved over debris they could not remove. Wikipedia, "Trajan's
//   Forum" (Carandini): by the late 16th century the imperial fora lay 3-4 m below ground.
// The map is schematic: the walls, river and hills are simplified, and the dots are placed at random. The three
// layers of the cross-section stand for causes, not a measured sequence.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0–14.0  Rome at its height: 450,000 to a million; each dot 10,000 people inside the Aurelian Walls.
//  B 14.2–18.6  The emperors move away: Milan 286, Ravenna 402.
//  C 18.8–37.0  The sacks: 410 (Alaric, three days; 800,000 to 500,000), 455 (the Vandals; 300,000-500,000).
//  D 37.2–55.4  The siege of 537-538: aqueducts cut, mills afloat; 30,000-90,000 by 550-600; people move to the bend.
//  E 55.6–64.6  The ground rises: silt, eroded hillsides, rubble; the imperial fora 3-4 m down by the late 1500s.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0f1b1d', bg2: '#1c2a27', land: '#1b2a27', hill: '#263a33', ink: '#f3efe4', soft: 'rgba(243,239,228,0.74)', faint: 'rgba(243,239,228,0.22)',
  river: '#4aa3c7', wall: '#cfae6d', dot: '#ffcf73', red: '#e8604f', water: '#7cc6e6', silt: '#8a7a5a', rubble: '#6e6a62', erosion: '#a5774c', stone: '#d9d0bd',
};
const NUM = 'Oswald', SANS = 'Outfit';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
const fmt = (n) => Math.round(n).toLocaleString('en-US');

// ---------- the numbers ----------
const PER_DOT = 10000, WALLS_KM2 = 13.86;
const EST = [ // [label year, low, high]
  [100, 450000, 1000000], [408, 800000, 800000], [419, 500000, 500000], [455, 300000, 500000], [575, 30000, 90000],
];
if (Math.round(1e6 / WALLS_KM2) !== 72150) throw new Error('density'); // Storey's 72,150 per km²
const dots = (n) => Math.round(n / PER_DOT);

// ---------- the map ----------
const WALLS = [[468, 168], [585, 160], [690, 236], [742, 360], [728, 500], [664, 618], [560, 688], [440, 704], [356, 700], [270, 664], [214, 590], [222, 520], [290, 488], [300, 420], [262, 352], [300, 262], [380, 196]];
const RIVER = [[430, 96], [404, 190], [336, 238], [262, 292], [236, 360], [262, 432], [332, 484], [366, 540], [358, 612], [330, 700], [312, 790]];
const HILLS = [['QUIRINAL', 520, 300, 62], ['VIMINAL', 590, 352, 46], ['ESQUILINE', 640, 440, 70], ['CAPITOLINE', 420, 474, 34], ['PALATINE', 476, 548, 44], ['AVENTINE', 420, 630, 50], ['CAELIAN', 590, 580, 54]];
const BEND = { x: 330, y: 360, rx: 62, ry: 92 }; // the Campus Martius, inside the river's bend

function inPoly(x, y, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
// 100 places for dots, seeded; and a place in the bend for each of the last ten
let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const SPOTS = [];
while (SPOTS.length < 100) {
  const x = 200 + rnd() * 560, y = 150 + rnd() * 560;
  if (inPoly(x, y, WALLS) && SPOTS.every(([a, b]) => Math.hypot(a - x, b - y) > 26)) SPOTS.push([x, y]);
}
// order: the dots that disappear first are far from the river, so the last ones are nearest the bend
SPOTS.sort((a, b) => Math.hypot(a[0] - BEND.x, a[1] - BEND.y) - Math.hypot(b[0] - BEND.x, b[1] - BEND.y));
const BEND_SPOTS = Array.from({ length: 10 }, (_, i) => {
  const a = i * 2.4, r = 0.25 + 0.6 * ((i * 0.37) % 1);
  return [BEND.x + Math.cos(a) * BEND.rx * r, BEND.y + Math.sin(a) * BEND.ry * r];
});

function riverPath() {
  ctx.beginPath(); ctx.moveTo(...RIVER[0]);
  for (let i = 1; i < RIVER.length - 1; i++) { const [x, y] = RIVER[i], [nx, ny] = RIVER[i + 1]; ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2); }
  ctx.lineTo(...RIVER[RIVER.length - 1]);
}
function map(t, { walls = 1, labels = 0, water = 1 } = {}) {
  // hills
  for (const [n, x, y, r] of HILLS) {
    const g = ctx.createRadialGradient(x, y, 4, x, y, r); g.addColorStop(0, '#30463d'); g.addColorStop(1, 'rgba(38,58,51,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    A(labels, () => { font(500, 22, NUM); text(n, x, y + r * 0.15, { align: 'center', base: 'middle', color: 'rgba(243,239,228,0.4)', spacing: '2px' }); });
  }
  // the river
  ctx.strokeStyle = C.river; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; riverPath(); ctx.stroke();
  ctx.lineCap = 'butt';
  // Tiber island
  ctx.fillStyle = C.land; ctx.beginPath(); ctx.ellipse(352, 512, 6, 14, -0.4, 0, TAU); ctx.fill();
  // the walls
  A(walls, () => {
    ctx.strokeStyle = C.wall; ctx.lineWidth = 4; ctx.setLineDash([14, 6]);
    ctx.beginPath(); WALLS.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
  });
  void t; void water;
}
/** Draw the population as dots: `low` solid and `high` (≥ low) in all, in dots; `toBend` 0–1 moves the last ones to the bend. */
function people(low, high, { toBend = 0, a = 1 } = {}) {
  A(a, () => {
    const n = Math.min(100, Math.ceil(high - 1e-9));
    for (let i = 0; i < n; i++) {
      // the remaining dots are the nearest to the bend; index from the near end
      const [sx, sy] = SPOTS[i];
      const [bx, by] = i < BEND_SPOTS.length ? BEND_SPOTS[i] : [sx, sy];
      const x = lerp(sx, bx, eio(toBend)), y = lerp(sy, by, eio(toBend));
      const part = clamp(high - i); // a partly faded dot for fractions
      const solid = i < low - 1e-9;
      A(part, () => {
        if (solid) { ctx.fillStyle = C.dot; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill(); }
        else { ctx.strokeStyle = C.dot; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.stroke(); }
      });
    }
  });
}
function counter(year, low, high, a = 1, who = '') {
  A(a, () => {
    font(500, 30, NUM); text(year, 60, 92, { base: 'middle', color: C.soft, spacing: '2px' });
    font(700, 60, NUM);
    const r = (n) => Math.round(n / PER_DOT) * PER_DOT;
    const s = r(low) === r(high) ? fmt(r(low)) : `${fmt(r(low))}–${fmt(r(high))}`;
    text(s, 60, 150, { base: 'middle', color: C.dot });
    if (who) { font(400, 24); who.split('\n').forEach((l, i) => text(l, 60, 196 + i * 30, { base: 'middle', color: C.soft })); }
  });
}

function legend(a) {
  A(a, () => {
    ctx.fillStyle = C.dot; ctx.beginPath(); ctx.arc(54, 700, 8, 0, TAU); ctx.fill();
    font(400, 24); text('= 10,000 people', 72, 701, { base: 'middle', color: C.ink });
    ctx.strokeStyle = C.dot; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(54, 736, 7, 0, TAU); ctx.stroke();
    text('= up to the high estimate', 72, 737, { base: 'middle', color: C.soft });
  });
}
const MAP_DX = 60, MAP_DY = 40;
/** Draw in map coordinates (the map is shifted right and down, clear of the counter). */
const mapStart = () => { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 784); ctx.clip(); ctx.translate(MAP_DX, MAP_DY); };
const onMap = (fn) => { mapStart(); fn(); ctx.restore(); };

// ---------- A: at its height ----------
function sceneHeight(t) {
  A(span(t, 0, 14.2, 0.5, 0.0), () => {
    const grow = seg(t, 0.8, 3.6);
    const hollow = seg(t, 5.4, 6.4);
    onMap(() => { map(t, { walls: seg(t, 9.8, 10.6), labels: seg(t, 1.0, 2.0) }); people(100 - 55 * hollow, 100 * grow); });
    legend(seg(t, 10.0, 10.8));
    counter('AD 1st–2nd CENTURIES', hollow > 0 ? lerp(1000000, 450000, hollow) : 1000000 * grow, 1000000 * grow, seg(t, 0.6, 1.2), hollow > 0.5 ? 'Glenn Storey: about 450,000\nstandard accounts: a million' : 'up to a million,\nin standard accounts');
    A(seg(t, 10.0, 10.8), () => {
      font(600, 24, NUM); text('AURELIAN WALLS · 13.9 km²', 650, 772, { align: 'center', base: 'middle', color: C.wall, spacing: '1px' });
    });
  });
}

// ---------- B: the emperors move away ----------
function sceneCapital(t) {
  A(span(t, 14.0, 18.8, 0.2, 0.0), () => {
    onMap(() => { map(t, { labels: 1 }); people(45, 100); });
    legend(1);
    counter('AD 286–402', 450000, 1000000, 1, '');
    mapStart();
    const go = eio(seg(t, 14.6, 16.4));
    ctx.strokeStyle = C.wall; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(470, 300); ctx.quadraticCurveTo(520, 200, lerp(470, 600, go), lerp(300, 80, go)); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    A(seg(t, 15.6, 16.4), () => {
      ctx.fillStyle = 'rgba(15,27,29,0.88)'; ctx.fillRect(420, 236, 380, 100);
      font(600, 28, NUM); text('MILAN, 286 · RAVENNA, 402', 610, 270, { align: 'center', base: 'middle', color: C.wall, spacing: '1px' });
      font(400, 24); text('the West’s seat of government', 610, 308, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- C: the sacks ----------
function flames(x, y, s, t, a = 1) {
  A(a, () => {
    for (let i = 0; i < 3; i++) {
      const wob = Math.sin(t * 8 + i * 2) * 4 * s, hh = (36 - i * 9) * s, ww = (16 - i * 4) * s;
      ctx.fillStyle = ['#e8604f', '#f59a4a', '#ffd27a'][i];
      ctx.beginPath(); ctx.moveTo(x - ww, y); ctx.quadraticCurveTo(x - ww * 0.8, y - hh * 0.5, x + wob, y - hh); ctx.quadraticCurveTo(x + ww * 0.8, y - hh * 0.5, x + ww, y); ctx.closePath(); ctx.fill();
    }
  });
}
function ship(x, y, s, col) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - 30 * s, y); ctx.lineTo(x + 30 * s, y); ctx.lineTo(x + 20 * s, y + 12 * s); ctx.lineTo(x - 20 * s, y + 12 * s); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - 2 * s, y - 34 * s, 4 * s, 34 * s);
  ctx.beginPath(); ctx.moveTo(x + 2 * s, y - 32 * s); ctx.lineTo(x + 24 * s, y - 8 * s); ctx.lineTo(x + 2 * s, y - 6 * s); ctx.closePath(); ctx.fill();
}
function sceneSacks(t) {
  A(span(t, 18.6, 37.2, 0.0, 0.0), () => {
    legend(1);
    mapStart();
    map(t, { labels: 1 });
    // 410
    const f410 = seg(t, 18.8, 19.4) * (1 - seg(t, 27.4, 28.0));
    flames(640, 214, 1.2, t, f410);
    A(f410, () => { font(600, 24, NUM); text('SALARIAN GATE', 640, 246, { align: 'center', base: 'middle', color: C.red, spacing: '1px' }); });
    const drop = eio(seg(t, 24.0, 26.6));
    // 455
    const sail = eio(seg(t, 28.0, 31.0));
    A(seg(t, 28.0, 28.4) * (1 - seg(t, 36.6, 37.0)), () => {
      ship(lerp(300, 345, sail), lerp(760, 600, sail), 1.1, C.red);
    });
    let low, high, label, who;
    if (t < 28.0) { low = lerp(80, 50, drop); high = low; label = t < 24 ? 'AD 408' : 'AD 410–419'; who = t < 23.6 ? 'Alaric’s Visigoths:\nthree days of looting' : 'estimate by\nBertrand Lançon'; }
    else { const g = eio(seg(t, 32.8, 34.8)); low = lerp(50, 30, g); high = 50; label = 'AD 455'; who = t < 32.6 ? 'Vandals from Carthage:\ntwo weeks of looting' : 'one estimate, by 455'; }
    people(low, high);
    ctx.restore();
    counter(label, low * PER_DOT, high * PER_DOT, 1, who);
  });
}

// ---------- D: aqueducts cut; the bend ----------
const AQUEDUCTS = [[[860, 330], [742, 380]], [[860, 470], [736, 450]], [[860, 560], [714, 540]], [[800, 720], [664, 618]]];
function millWheel(x, y, r, ang, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  for (let i = 0; i < 8; i++) { const a = ang + (i * TAU) / 8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke(); }
}
function sceneSiege(t) {
  A(span(t, 37.0, 55.8, 0.0, 0.4), () => {
    legend(1);
    mapStart();
    map(t, { labels: 1 - seg(t, 50.0, 51.0) });
    // aqueducts coming in from the hills to the east, then cut
    const cut = seg(t, 38.4, 39.2);
    AQUEDUCTS.forEach(([[x0, y0], [x1, y1]], i) => {
      ctx.strokeStyle = cut > 0 ? `rgba(124,198,230,${0.9 - 0.6 * cut})` : C.water; ctx.lineWidth = 6; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
      A(seg(t, 38.4 + i * 0.2, 38.8 + i * 0.2), () => {
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(mx - 12, my - 12); ctx.lineTo(mx + 12, my + 12); ctx.moveTo(mx + 12, my - 12); ctx.lineTo(mx - 12, my + 12); ctx.stroke();
      });
    });
    A(seg(t, 38.0, 38.6) * (1 - seg(t, 45.6, 46.2)), () => {
      font(600, 26, NUM); text('AQUEDUCTS CUT, 537', 784, 250, { align: 'right', base: 'middle', color: C.red, spacing: '1px' });
    });
    // mills: a wheel on the Janiculum stops; wheels float on the Tiber
    A(seg(t, 41.8, 42.4) * (1 - seg(t, 45.6, 46.2)), () => {
      const spin = t < 42.8 ? t * 3 : 42.8 * 3;
      millWheel(170, 560, 30, spin, 'rgba(243,239,228,0.5)');
      font(500, 22, NUM); text('JANICULUM MILLS', 170, 612, { align: 'center', base: 'middle', color: C.soft, spacing: '1px' });
      A(seg(t, 43.6, 44.2), () => {
        millWheel(250, 420, 20, t * 3, C.water); millWheel(300, 490, 20, t * 3 + 1, C.water);
        font(500, 22, NUM); text('FLOATING MILLS', 150, 450, { align: 'center', base: 'middle', color: C.water, spacing: '1px' });
      });
    });
    // the population falls, then gathers in the bend
    const g = eio(seg(t, 46.6, 48.6));
    const low = lerp(30, 3, g), high = lerp(50, 9, g);
    const toBend = seg(t, 51.2, 53.6);
    people(low, high, { toBend });
    ctx.restore();
    counter(t < 46.4 ? 'AD 537–538' : 'ABOUT AD 550–600', low * PER_DOT, high * PER_DOT, 1, t < 46.4 ? 'the Goths besiege the city' : 'estimates: 30,000\nto at most 90,000');
    onMap(() => A(seg(t, 51.0, 51.8), () => {
      ctx.strokeStyle = C.dot; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.ellipse(BEND.x, BEND.y, BEND.rx + 18, BEND.ry + 14, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      font(600, 26, NUM); text('CAMPUS MARTIUS', 470, 380, { base: 'middle', color: C.dot, spacing: '1px' });
      font(400, 24); text('by the river’s water', 470, 414, { base: 'middle', color: C.soft });
    }));
  });
}

// ---------- E: the ground rises ----------
function sceneGround(t) {
  A(span(t, 55.4, 65.2, 0.4, 0.0), () => {
    const G = 640, PXM = 70; // the Roman pavement and pixels per metre
    const Y = (m) => G - m * PXM;
    // a Roman column base and pavement
    ctx.fillStyle = C.stone; ctx.fillRect(80, G, 700, 14);
    ctx.fillRect(250, Y(4.6), 54, 4.6 * PXM); ctx.fillRect(236, Y(0.5), 82, 0.5 * PXM);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(282, Y(4.6), 14, 4.6 * PXM);
    font(500, 22, NUM); text('ROMAN PAVEMENT', 560, G + 36, { align: 'center', base: 'middle', color: C.soft, spacing: '1px' });
    // layers
    const L = [[56.0, 1.2, C.silt, 'TIBER FLOOD SILT'], [57.4, 1.0, C.erosion, 'EARTH WASHED OFF THE HILLS'], [58.8, 1.3, C.rubble, 'RUBBLE, PAVED OVER']];
    let top = 0;
    for (const [t0, hm, col, name] of L) {
      const g = eio(seg(t, t0, t0 + 1.2));
      if (g > 0) {
        ctx.fillStyle = col; ctx.fillRect(80, Y(top + hm * g), 700, hm * g * PXM);
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 30; i++) ctx.fillRect(90 + ((i * 97) % 680), Y(top) - ((i * 37) % Math.max(1, hm * g * PXM - 6)) - 6, 6, 3);
        A(seg(t, t0 + 0.6, t0 + 1.2), () => { font(600, 24, NUM); text(name, 560, Y(top + hm / 2), { align: 'center', base: 'middle', color: '#1a1612', spacing: '1px' }); });
      }
      top += hm * g;
    }
    // the column, buried
    ctx.fillStyle = C.stone; ctx.fillRect(250, Y(4.6), 54, Math.max(0, (4.6 - top)) * PXM);
    // a person on the new street
    A(seg(t, 59.8, 60.4), () => {
      const px = 680, py = Y(top);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py - 108, 12, 0, TAU); ctx.fill(); ctx.fillRect(px - 9, py - 94, 18, 56);
      ctx.fillRect(px - 9, py - 40, 7, 40); ctx.fillRect(px + 2, py - 40, 7, 40);
      // the depth
      ctx.strokeStyle = C.dot; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(140, Y(0)); ctx.lineTo(140, Y(top)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(128, Y(0)); ctx.lineTo(152, Y(0)); ctx.moveTo(128, Y(top)); ctx.lineTo(152, Y(top)); ctx.stroke();
      font(700, 44, NUM); text('3–4 m', 160, Y(top / 2), { base: 'middle', color: C.dot });
    });
    A(seg(t, 60.4, 61.2), () => {
      font(600, 30, NUM); text('LATE 1500s: THE IMPERIAL FORUMS', CX, 140, { align: 'center', base: 'middle', color: C.ink, spacing: '1px' });
      font(400, 26); text('lay 3 to 4 metres under the ground', CX, 184, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(0.7, C.bg2); lg.addColorStop(1, '#0b1213');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, 'In the 1st and 2nd centuries AD, *Rome* may have held up to *a million* people.'],
  [5.0, 9.4, 'Estimates differ: the archaeologist Glenn Storey argued for about *450,000*.'],
  [9.6, 14.0, 'Here each dot is 10,000 people, inside the 13.9 km² ringed by the Aurelian Walls.'],
  [14.2, 18.6, 'Emperors had left: the West was ruled from Milan from 286, from Ravenna from 402.'],
  [18.8, 23.2, 'In AD 410 the Visigoths of King Alaric looted Rome for three days.'],
  [23.4, 27.8, 'Historian Bertrand Lançon estimates a fall from 800,000 in 408 to *500,000* by 419.'],
  [28.0, 32.4, 'In AD 455 the Vandals, sailing from Carthage, plundered the city for two weeks.'],
  [32.6, 37.0, 'By then, one estimate goes, perhaps *300,000 to 500,000* people were left.'],
  [37.2, 41.6, 'In the siege of 537–538, the Goths ~cut the aqueducts~ that fed the city.'],
  [41.8, 46.2, 'The water mills that ground the city’s bread stopped; mills had to float on the Tiber.'],
  [46.4, 50.8, 'By about 550 to 600, estimates run from about *30,000* to at most 90,000 people.'],
  [51.0, 55.4, 'The few who stayed gathered in the ~Campus Martius~, close to the Tiber’s water.'],
  [55.6, 60.0, 'Floods, earth washed off the hills and rubble raised the ground, year by year.'],
  [60.2, 64.6, 'By the late 1500s the imperial forums lay *3 to 4 metres* under the ground.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [NUM, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    if (t < 14.2) sceneHeight(t);
    else if (t < 18.8) sceneCapital(t);
    else if (t < 37.2) sceneSacks(t);
    else if (t < 55.8) sceneSiege(t);
    if (t > 55.4) sceneGround(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.dot, '~': C.water } });
  },
});
