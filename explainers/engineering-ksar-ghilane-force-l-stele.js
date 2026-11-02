// Explainer for engineering-ksar-ghilane-force-l-stele (Tunisia 1943, Visit): the oasis of Ksar Ghilane on the edge
// of the Grand Erg Oriental, with the Roman fort of Tisavar and a stele recalling General Leclerc's Force L, Free
// French troops from Chad who held the oasis from 23 February to 10 March 1943 and beat off a German attack.
// Look: dunes at dusk drawn in bands of gold and rust, palms, a Roman fort and a slim stele; a schematic map of the
// Sahara from Chad to Tunisia, the route as a dotted line. Cormorant Garamond for titles, Outfit for captions.
//
// Facts:
// - Wikipedia, "Ksar Ghilane": an oasis on the eastern edge of the Grand Erg Oriental, Tataouine governorate,
//   32°58′51″N 9°38′11″E; asphalt road to Douz, 80 km to the north; fed by a hot spring one can bathe in; the
//   ruins of the Roman castellum Tisavar lie less than a kilometre from the palms, built at the latest under Emperor
//   Commodus (reigned 180–192), guarding the empire's southern frontier; about a kilometre east of the battle site
//   stands a commemorative stele, locally known as "General Leclerc's column", inscribed "Here, from February 23rd to
//   March 10th 1943, General Leclerc and Force L, coming from Chad, …" (successfully repelled the enemy attack).
// - French Ministry of the Armed Forces, Chemins de mémoire, "Philippe Leclerc": with his colonial troops from Chad,
//   Leclerc conquered the Fezzan; on 26 January 1943 he joined General Montgomery, commanding the British Eighth
//   Army, and persuaded him to engage him in the Tunisian campaign; "Force L", as Leclerc's units were now called,
//   distinguished itself at the fight of Ksar Rhilane on 10 March; with the Royal Air Force's help it inflicted heavy
//   losses on a German armoured group; the 2nd Free French Division (ex "Force L") officially became the 2nd Armoured
//   Division on 24 August 1943.
// - 3 Squadron RAAF Association, "10 March 1943" (after Watson and Jones, 3 Squadron at War, and pilots' diaries):
//   Leclerc's force had marched from Lake Chad; it was threatened by a German armoured force; Kittyhawks of No. 3
//   Squadron RAAF and No. 450 Squadron attacked it, RAF Hurricanes attacked the tanks; the French signalled thanks for
//   the Wing's "timely and efficient aid".
// - Distances computed from Wikipedia coordinates: N'Djamena (then Fort-Lamy, Chad) 12.105 N 15.045 E; Sabha (Fezzan)
//   27.039 N 14.426 E; Ksar Ghilane 32.981 N 9.636 E; Mareth 33.633 N 10.300 E. The map, the coast and the attack's
//   direction are schematic.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  The oasis at the edge of the sand sea; dunes, the spring, the fort and the stele.
//  B  9.6–18.6  Tisavar, the Roman fort; the stele and its dates.
//  C 18.8–37.0  Force L: from Chad, through the Fezzan, to the flank of the Mareth Line.
//  D 37.2–50.8  10 March 1943: the attack, the aircraft, the oasis held; the 2nd Armoured Division.
//  E 51.0–65.2  Visiting: the stele 1 km east; 2,400 km from Chad; two frontier posts 1,750 years apart.
const W = 864, H = 1080, CX = W / 2;
const { seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky0: '#1a1430', sky1: '#5a2f4a', sky2: '#d07a4a', dune1: '#e2a85a', dune2: '#c4843f', dune3: '#9a5a2c', palm: '#2f5a3c',
  pool: '#5fb3b3', ink: '#fff6e8', soft: 'rgba(255,246,232,0.8)', faint: 'rgba(255,246,232,0.3)', gold: '#ffd27a',
  blue: '#7fb6ff', red: '#ff8a6b', stone: '#e9dcc2', stone2: '#b9a684', map: '#d9b77e', mapSea: '#2b5277', green: '#9fe0a8',
};
const TITLE = 'Cormorant Garamond', SANS = 'Outfit';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const P = { ndjamena: [12.105, 15.045], sabha: [27.039, 14.426], ksar: [32.981, 9.636], mareth: [33.633, 10.3], tunis: [36.806, 10.181] };
const rad = (d) => (d * Math.PI) / 180;
function kmBetween([la1, lo1], [la2, lo2]) {
  const a = Math.sin(rad(la2 - la1) / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(rad(lo2 - lo1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}
const FROM_CHAD = kmBetween(P.ndjamena, P.ksar);
const COMMODUS_END = 192, FIGHT = 1943;
const YEARS = Math.round((FIGHT - COMMODUS_END) / 50) * 50; // "some 1,750 years"
if (Math.round(FROM_CHAD / 100) !== 24 || YEARS !== 1750) throw new Error('numbers');

// ---------- the desert ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, 520); lg.addColorStop(0, C.sky0); lg.addColorStop(0.6, C.sky1); lg.addColorStop(1, C.sky2);
  g.fillStyle = lg; g.fillRect(0, 0, W, 520);
  const band = (y0, amp, col, ph) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 + Math.sin(x / 140 + ph) * amp + Math.sin(x / 53 + ph * 2) * amp * 0.3);
    g.lineTo(W, H); g.closePath(); g.fill();
  };
  band(470, 26, C.dune1, 0.3); band(560, 22, C.dune2, 1.7); band(660, 18, C.dune3, 2.9);
  g.fillStyle = '#16100c'; g.fillRect(0, 780, W, H - 780);
}
function palm(x, y, s) {
  ctx.strokeStyle = '#5b3e25'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 8 * s, y - 50 * s, x + 2 * s, y - 100 * s); ctx.stroke();
  ctx.fillStyle = C.palm;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.5;
    ctx.beginPath(); ctx.ellipse(x + 2 * s + Math.cos(a) * 30 * s, y - 100 * s + Math.sin(a) * 14 * s + 10 * s, 34 * s, 7 * s, a, 0, TAU); ctx.fill();
  }
}
function oasis(a = 1) {
  A(a, () => {
    ctx.fillStyle = C.pool; ctx.beginPath(); ctx.ellipse(470, 640, 90, 16, 0, 0, TAU); ctx.fill();
    for (const [x, y, s] of [[360, 640, 1.0], [420, 650, 1.2], [520, 646, 0.9], [580, 650, 1.1], [300, 655, 0.8], [640, 655, 0.85]]) palm(x, y, s);
  });
}
function fort(x, y, s, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.stone2; ctx.fillRect(x - 70 * s, y - 50 * s, 140 * s, 50 * s);
    ctx.fillStyle = C.stone; for (const dx of [-70, 50]) ctx.fillRect(x + dx * s, y - 66 * s, 20 * s, 66 * s);
    ctx.fillStyle = '#5b4632'; ctx.fillRect(x - 10 * s, y - 28 * s, 20 * s, 28 * s);
    // broken top edge: a ruin
    ctx.fillStyle = C.sky2; for (let i = 0; i < 5; i++) ctx.fillRect(x - 40 * s + i * 20 * s, y - 50 * s, 8 * s, 6 * s + (i % 2) * 6 * s);
  });
}
function stele(x, y, s, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.stone2; ctx.fillRect(x - 26 * s, y - 16 * s, 52 * s, 16 * s);
    ctx.fillStyle = C.stone; ctx.beginPath(); ctx.moveTo(x - 14 * s, y - 16 * s); ctx.lineTo(x - 10 * s, y - 150 * s); ctx.lineTo(x, y - 162 * s); ctx.lineTo(x + 10 * s, y - 150 * s); ctx.lineTo(x + 14 * s, y - 16 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(90,70,50,0.45)'; for (let i = 0; i < 4; i++) ctx.fillRect(x - 7 * s, y - 120 * s + i * 12 * s, 14 * s, 3 * s);
  });
}
function title(s, sub, a, col = C.gold) {
  A(a, () => {
    font(700, 52, TITLE); text(s, CX, 92, { align: 'center', base: 'middle', spacing: '2px' });
    if (sub) { font(400, 26); text(sub, CX, 142, { align: 'center', base: 'middle', color: col }); }
  });
}
function tag(x, y, s, sub, col, a, align = 'center') {
  A(a, () => {
    font(700, 32, TITLE); const w1 = ctx.measureText(s).width; font(400, 22); const w2 = sub ? ctx.measureText(sub).width : 0;
    const w = Math.max(w1, w2) + 36, bx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.fillStyle = 'rgba(26,20,40,0.82)'; k.rrect(bx, y - 30, w, sub ? 92 : 58, 12); ctx.fill();
    font(700, 32, TITLE); text(s, bx + w / 2, y - 2, { align: 'center', base: 'middle', color: col });
    if (sub) { font(400, 22); text(sub, bx + w / 2, y + 34, { align: 'center', base: 'middle', color: C.ink }); }
  });
}

// ---------- A, B ----------
function sceneOasis(t) {
  A(span(t, 0, 18.8, 0.5, 0.4), () => {
    oasis(1);
    fort(170, 560, 1.1, seg(t, 5.2, 6.0));
    stele(720, 600, 1.0, seg(t, 6.0, 6.8));
    title('KSAR GHILANE', 'an oasis on the edge of the Grand Erg Oriental', seg(t, 0.6, 1.4) * (1 - seg(t, 9.2, 9.6)));
    A(seg(t, 1.6, 2.4) * (1 - seg(t, 9.2, 9.6)), () => {
      font(500, 22); text('the great sand sea of the Sahara', CX, 186, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 5.4, 6.2) * (1 - seg(t, 9.2, 9.6)), () => {
      font(500, 24); text('warm spring', 470, 690, { align: 'center', base: 'middle', color: C.ink });
      text('Roman fort', 170, 600, { align: 'center', base: 'middle', color: C.ink });
      text('stele', 720, 640, { align: 'center', base: 'middle', color: C.ink });
    });
    // the fort
    tag(260, 300, 'TISAVAR', `a Roman fort, built by AD ${COMMODUS_END} at the latest`, C.gold, seg(t, 9.8, 10.4) * (1 - seg(t, 13.8, 14.2)), 'left');
    A(seg(t, 9.8, 10.4) * (1 - seg(t, 13.8, 14.2)), () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(280, 392); ctx.lineTo(190, 490); ctx.stroke();
    });
    // the stele
    tag(560, 300, '23 FEB – 10 MAR 1943', 'General Leclerc and Force L, from Chad', C.blue, seg(t, 14.4, 15.0) * (1 - seg(t, 18.2, 18.6)));
    A(seg(t, 14.4, 15.0) * (1 - seg(t, 18.2, 18.6)), () => {
      ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(640, 394); ctx.lineTo(712, 436); ctx.stroke();
    });
  });
}

// ---------- C: the map ----------
const MAP = { x0: 70, y0: 40, w: 724, h: 720, lon0: 4, lon1: 21, lat0: 10, lat1: 38 };
const mp = ([la, lo]) => [MAP.x0 + ((lo - MAP.lon0) / (MAP.lon1 - MAP.lon0)) * MAP.w, MAP.y0 + ((MAP.lat1 - la) / (MAP.lat1 - MAP.lat0)) * MAP.h];
const COAST = [[37.35, 9.85], [36.8, 10.2], [36.4, 10.6], [35.8, 10.65], [34.75, 10.8], [33.9, 10.1], [33.6, 10.5], [33.15, 11.6], [32.9, 13.2], [32.4, 15.1], [31.2, 16.6], [30.4, 19.0], [31.0, 20.2], [32.1, 20.1], [32.8, 21.0]];
function drawMap(t) {
  ctx.fillStyle = '#20182c'; ctx.fillRect(0, 0, W, 780);
  ctx.fillStyle = C.map; ctx.fillRect(MAP.x0, MAP.y0, MAP.w, MAP.h);
  // the sea, north of the coast
  ctx.fillStyle = C.mapSea; ctx.beginPath(); ctx.moveTo(MAP.x0, MAP.y0);
  const c0 = mp(COAST[0]); ctx.lineTo(MAP.x0, c0[1]);
  for (const p of COAST) ctx.lineTo(...mp(p));
  ctx.lineTo(MAP.x0 + MAP.w, mp(COAST.at(-1))[1]); ctx.lineTo(MAP.x0 + MAP.w, MAP.y0); ctx.closePath(); ctx.fill();
  font(400, 22); text('Mediterranean', 560, 80, { align: 'center', base: 'middle', color: '#cfe1ef' });
  font(600, 24); text('TUNISIA', 200, 120, { base: 'middle', color: '#5a3c22', spacing: '2px' });
  text('ITALIAN LIBYA', 560, 250, { base: 'middle', color: '#5a3c22', spacing: '2px' });
  text('FEZZAN', 360, 420, { base: 'middle', color: '#5a3c22', spacing: '2px' });
  text('FRENCH CHAD', 590, 600, { base: 'middle', color: '#5a3c22', spacing: '2px' });
  font(400, 22); text('schematic map', MAP.x0 + 16, MAP.y0 + MAP.h - 20, { base: 'middle', color: '#5a3c22' });
}
function sceneMap(t) {
  A(span(t, 18.6, 37.2, 0.4, 0.4), () => {
    drawMap(t);
    const dot = (p, col, name, dx, dy, r = 8) => { const [x, y] = mp(p); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); if (name) { font(600, 24); text(name, x + dx, y + dy, { base: 'middle', color: '#2a1a10' }); } };
    // the route: Chad, the Fezzan, Ksar Ghilane
    const route = [P.ndjamena, P.sabha, P.ksar].map(mp);
    const u = eio(seg(t, 19.2, 26.0));
    ctx.strokeStyle = '#1d3f7a'; ctx.lineWidth = 6; ctx.setLineDash([3, 12]); ctx.lineCap = 'round';
    const L1 = Math.hypot(route[1][0] - route[0][0], route[1][1] - route[0][1]), L2 = Math.hypot(route[2][0] - route[1][0], route[2][1] - route[1][1]);
    const d = u * (L1 + L2);
    ctx.beginPath(); ctx.moveTo(...route[0]);
    if (d <= L1) ctx.lineTo(lerp(route[0][0], route[1][0], d / L1), lerp(route[0][1], route[1][1], d / L1));
    else { ctx.lineTo(...route[1]); ctx.lineTo(lerp(route[1][0], route[2][0], (d - L1) / L2), lerp(route[1][1], route[2][1], (d - L1) / L2)); }
    ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
    dot(P.ndjamena, '#1d3f7a', 'Fort-Lamy (N’Djamena)', -150, 30);
    A(seg(t, 21.0, 21.6), () => dot(P.sabha, '#1d3f7a', 'Sabha', 16, 0));
    A(seg(t, 24.0, 24.6), () => dot(P.ksar, '#b3261e', 'Ksar Ghilane', -150, 28, 10));
    // the Mareth Line and the Eighth Army
    A(seg(t, 27.8, 28.6), () => {
      const [mx, my] = mp(P.mareth);
      ctx.strokeStyle = '#b3261e'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(mx + 14, my - 8); ctx.lineTo(mx - 10, my + 18); ctx.stroke();
      font(600, 22); text('Mareth Line', mx + 22, my - 18, { base: 'middle', color: '#2a1a10' });
    });
    tag(CX, 560, 'FORCE L', 'General Philippe Leclerc’s Free French', '#ffffff', seg(t, 19.4, 20.0) * (1 - seg(t, 27.4, 27.8)));
    tag(CX, 560, 'THE DESERT FLANK', 'west of the Axis’s Mareth Line', C.gold, seg(t, 28.2, 28.8) * (1 - seg(t, 36.6, 37.0)));
    A(seg(t, 32.8, 33.4) * (1 - seg(t, 36.6, 37.0)), () => {
      font(500, 22); text('where the Eighth Army was getting ready to attack', CX, 680, { align: 'center', base: 'middle', color: '#2a1a10' });
    });
  });
}

// ---------- D: 10 March 1943 ----------
function plane(x, y, s, col) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x - 30 * s, y); ctx.lineTo(x + 26 * s, y - 3 * s); ctx.lineTo(x + 30 * s, y); ctx.lineTo(x + 26 * s, y + 3 * s); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 2 * s, y); ctx.lineTo(x - 12 * s, y - 26 * s); ctx.lineTo(x - 4 * s, y - 26 * s); ctx.lineTo(x + 10 * s, y); ctx.lineTo(x - 4 * s, y + 26 * s); ctx.lineTo(x - 12 * s, y + 26 * s); ctx.closePath(); ctx.fill();
}
function sceneAttack(t) {
  A(span(t, 37.0, 51.0, 0.4, 0.4), () => {
    oasis(1);
    stele(720, 600, 1.0, seg(t, 46.6, 47.4) * 0);
    // the German armoured group, drawn as a red arrow that stops short
    A(seg(t, 37.4, 38.0), () => {
      const u = eout(seg(t, 37.6, 40.6)), back = seg(t, 46.4, 48.4);
      const x0 = 900, y0 = 520, x1 = lerp(900, 660, u) + back * 240, y1 = lerp(520, 600, u) - back * 60;
      ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.lineCap = 'butt';
      if (back < 0.95) { const a = Math.atan2(y1 - y0, x1 - x0); ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(x1 + Math.cos(a) * 22, y1 + Math.sin(a) * 22); ctx.lineTo(x1 + Math.cos(a + 2.4) * 22, y1 + Math.sin(a + 2.4) * 22); ctx.lineTo(x1 + Math.cos(a - 2.4) * 22, y1 + Math.sin(a - 2.4) * 22); ctx.closePath(); ctx.fill(); }
    });
    tag(CX, 130, '10 MARCH 1943', 'a German armoured group attacks the oasis', C.red, seg(t, 37.4, 38.0) * (1 - seg(t, 41.4, 41.8)));
    // aircraft through the day
    A(seg(t, 41.8, 42.4) * (1 - seg(t, 46.6, 47.0)), () => {
      for (let i = 0; i < 5; i++) { const u = ((t - 41.8) * 0.18 + i * 0.21) % 1; plane(lerp(-60, W + 60, u), 250 + (i % 3) * 50, 0.9, 'rgba(255,246,232,0.85)'); }
    });
    tag(CX, 130, 'ALLIED AIRCRAFT', 'RAF Hurricanes; Kittyhawks, some flown by Australians', C.blue, seg(t, 41.8, 42.4) * (1 - seg(t, 46.0, 46.4)));
    tag(CX, 130, 'THE OASIS HELD', 'the attack is beaten off', C.green, seg(t, 46.6, 47.2));
  });
}

// ---------- E: visiting ----------
function sceneVisit(t) {
  A(span(t, 50.8, 65.2, 0.4, 0), () => {
    oasis(0.9);
    fort(170, 560, 1.1);
    stele(720, 600, 1.0);
    tag(CX, 130, '2ND ARMOURED DIVISION', 'Force L becomes its core, 24 August 1943', C.blue, seg(t, 51.0, 51.6) * (1 - seg(t, 55.0, 55.4)));
    A(seg(t, 55.8, 56.4) * (1 - seg(t, 59.6, 60.0)), () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(480, 440); ctx.lineTo(712, 440); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(724, 440); ctx.lineTo(706, 430); ctx.lineTo(706, 450); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(26,20,40,0.8)'; k.rrect(400, 380, 400, 40, 10); ctx.fill();
      font(600, 24); text('about 1 km east of the fighting', 600, 400, { align: 'center', base: 'middle', color: C.ink });
    });
    tag(CX, 130, '“GENERAL LECLERC’S COLUMN”', 'what people at the oasis call the stele', C.gold, seg(t, 55.8, 56.4) * (1 - seg(t, 59.6, 60.0)));
    // two posts, two dates
    A(seg(t, 60.2, 60.8), () => {
      const bar = (x, y0, y1, col) => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); };
      bar(170, 470, 380, C.gold); bar(720, 420, 380, C.blue);
      font(700, 34, TITLE); text(`AD ${COMMODUS_END}`, 170, 350, { align: 'center', base: 'middle', color: C.gold });
      text(`${FIGHT}`, 720, 350, { align: 'center', base: 'middle', color: C.blue });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.moveTo(250, 350); ctx.lineTo(650, 350); ctx.stroke(); ctx.setLineDash([]);
      font(600, 28); text(`at least ${Kit.fmt(YEARS)} years`, CX, 318, { align: 'center', base: 'middle', color: C.ink });
      font(400, 22); text('two frontier posts, one oasis', CX, 386, { align: 'center', base: 'middle', color: C.soft });
    });
    tag(CX, 130, `${Kit.fmt(Math.round(FROM_CHAD / 100) * 100)} KM FROM CHAD`, 'N’Djamena (then Fort-Lamy), as the crow flies', C.blue, seg(t, 60.2, 60.8));
  });
}

const CUES = [
  [0.4, 4.8, 'On the edge of Tunisia’s Grand Erg, a sea of sand dunes, lies the oasis of *Ksar Ghilane*.'],
  [5.0, 9.4, 'People come for the dunes and a warm spring. Near the palms stand a Roman fort and a stele.'],
  [9.6, 14.0, 'The fort, *Tisavar*, guarded Rome’s desert frontier. It dates from Emperor Commodus’s reign or earlier.'],
  [14.2, 18.6, 'The stele recalls ~23 February to 10 March 1943~, when Free French troops held this oasis.'],
  [18.8, 23.2, 'They were *Force L*, led by General Philippe Leclerc, and they had come from Chad.'],
  [23.4, 27.8, 'With colonial troops from Chad, Leclerc had taken the Fezzan, in Italian Libya, from the Italians.'],
  [28.0, 32.4, 'Then he joined Britain’s Eighth Army. Ksar Ghilane lay on the desert flank, west of the Mareth Line.'],
  [32.6, 37.0, 'There the Axis held a line of bunkers, and the Eighth Army was getting ready to attack it.'],
  [37.2, 41.6, 'On *10 March 1943*, a German armoured group attacked Force L at the oasis.'],
  [41.8, 46.2, 'Allied aircraft struck the attackers: RAF Hurricanes, and Kittyhawks, some flown by Australians.'],
  [46.4, 50.8, 'The attack was beaten off, and Force L still held the oasis.'],
  [51.0, 55.4, 'In August 1943 the force became the core of the French *2nd Armoured Division*.'],
  [55.6, 60.0, 'The stele, known here as ~General Leclerc’s column~, stands about 1 km east of the fighting.'],
  [60.2, 64.6, `Chad is about *${Kit.fmt(Math.round(FROM_CHAD / 100) * 100)} km* away, and the Roman fort is at least ${Kit.fmt(YEARS)} years older.`],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneOasis(t);
    sceneMap(t);
    sceneAttack(t);
    sceneVisit(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 400, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.blue } });
  },
});
