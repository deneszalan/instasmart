// Explainer for art-aventine-keyhole-view (Roma): through the keyhole of the Priory of the Knights of Malta on the
// Aventine Hill you see the dome of St Peter's, about 3 km away, at the end of a hedge-lined garden path. The dome
// spans only about 0.8°, one and a half full Moons; the keyhole does not magnify, it frames: the near hedges fill the
// view and hide the city in between. Look: dusk on the Aventine, Piranesi's wall of obelisks, a keyhole-shaped
// window, a map line across Rome and angle diagrams. Exo 2 for labels and numbers, Nunito for captions.
//
// Facts:
// - Wikipedia, "Villa del Priorato di Malta": the villa, one of the two seats of the Sovereign Military Order of
//   Malta, is granted extraterritorial status by Italy; Via Santa Sabina ends in the Piazza dei Cavalieri di Malta,
//   with the screen of obelisks and stele built in 1765 to designs by Giovanni Battista Piranesi, the etcher of Roman
//   views; the keyhole in the central door of the entrance, also by Piranesi, shows the dome of St Peter's at the end
//   of a garden allée; people queue to look; the church of Santa Maria del Priorato was redesigned by Piranesi.
// - Wikipedia, "Santa Maria del Priorato": renovated 1764–66 to Piranesi's designs, his only architectural work; he
//   also designed the piazza in front, with paired obelisks and stelae.
// - orderofmalta.int, "Magistral Villa": in the Order's possession since the 14th century; one of its two
//   institutional seats; it enjoys rights of extraterritoriality; the church is the only architectural example by
//   Piranesi (1720–1778), whose ashes lie in a niche there; visitors climb the Aventine to see the "Buco della
//   Serratura", a keyhole framing the dome of St Peter's.
// - Wikipedia, "Sovereign Military Order of Malta": a Catholic lay religious order, known for medical and
//   humanitarian work; the Magistral Villa on the Aventine is recognised by Italy as having extraterritorial status;
//   the Order does not exercise territorial sovereignty over it (Karski 2012): it is extraterritorial property.
// - Wikipedia, "St. Peter's Basilica": outer diameter of the dome 137.7 ft (42 m).
// - Wikipedia, "Moon": the Moon's mean angular diameter is about 0.52°.
// Measured on OpenStreetMap: the keyhole gate (node 3512305861) to the centre of the dome (way 117968816), 2,976 m on a
// bearing of 316°; the garden drive behind the gate (way 202975628) runs on that same line, within a metre, for about
// 90 m. Computed here: the dome's angular width 2·atan(21 / 2976) = 0.81°, 1.55 times the Moon's 0.52°.
// Schematic: the drawings of the piazza, the hedges and the map; the angles in diagram D are exaggerated, and say so.
//
// Scene plan (62.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The Piazza dei Cavalieri di Malta: Piranesi's wall, the door, the queue.
//  B  9.2–13.4  Through the keyhole: the hedge path and the dome.
//  C 13.6–22.2  A line across Rome: 90 m of path, 2,976 m to the dome.
//  D 22.4–31.0  Angular size: 42 m at 2,976 m is 0.8°, one and a half Moons.
//  E 31.2–48.6  No magnifying: the same dome over the city; the near frame fills the view and hides the city.
//  F 48.8–62.4  Piranesi; the Order of Malta; extraterritorial, not a country.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  night: '#0e1c24', night2: '#1b3040', ink: '#f4efe6', soft: 'rgba(244,239,230,0.74)', faint: 'rgba(244,239,230,0.24)',
  hedge: '#2f5d3a', hedge2: '#3f7a4a', hedge3: '#1f3f28', sky1: '#f2b179', sky2: '#7b97c4', dome: '#93a7a6', domeDark: '#5f7372',
  wall: '#d9cbb0', wall2: '#bfae8d', door: '#24432f', bronze: '#c9a36a', moon: '#f4f1e4', gold: '#ffd27a', tiber: '#4f8fb3', red: '#e0705f',
};
const LAB = 'Exo 2', TEXT = 'Nunito';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
const rad = (d) => (d * Math.PI) / 180;

// ---------- numbers ----------
const DIST = 2976;          // m, keyhole to the dome's centre (OpenStreetMap)
const PATH = 90;            // m, the garden drive behind the gate, on the same line (OpenStreetMap)
const DOME = 42;            // m, outer diameter of the dome
const MOON = 0.52;          // °, the full Moon's mean width
const ANGLE = 2 * Math.atan(DOME / 2 / DIST) * 180 / Math.PI; // 0.81°
const MOONS = ANGLE / MOON; // 1.55
if (Math.round(ANGLE * 100) !== 81 || Math.round(MOONS * 10) !== 16) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On Rome’s *Aventine Hill*, people queue at a green door to look through its ~keyhole~.'],
  [4.8, 9.0, 'The gate of the Knights of Malta’s priory stands on a square *Piranesi* designed in the 1760s.'],
  [9.2, 13.4, 'Through the keyhole: a garden path between hedges, and at its end the dome of *St Peter’s*.'],
  [13.6, 17.8, `The path runs straight at the dome. It is about ${PATH} m long; the dome is about *3 km* away.`],
  [18.0, 22.2, 'How big does the dome look? That depends on its size and on its distance.'],
  [22.4, 26.6, `The dome is about ${DOME} m wide. From ${Kit.fmt(DIST)} m away it spans just *${ANGLE.toFixed(1)} degrees*.`],
  [26.8, 31.0, 'That is about ~one and a half times~ the width of the full Moon in the sky.'],
  [31.2, 35.4, 'The keyhole does not magnify: the dome looks this size from anywhere 3 km away.'],
  [35.6, 39.8, 'What the keyhole changes is the frame. Up close, the hedges fill most of your view.'],
  [40.0, 44.2, 'A frame close to your eye looks huge, a far dome looks small, and they line up.'],
  [44.4, 48.6, 'And the keyhole hides the city in between: only the path and the dome are left.'],
  [48.8, 53.0, 'Giovanni Battista *Piranesi*, famed for his etchings of Rome, also rebuilt the church inside.'],
  [53.2, 57.4, 'The villa belongs to the *Order of Malta*, a Catholic order known for medical and aid work.'],
  [57.6, 61.8, 'It is not a country, but Italy recognises the villa as the Order’s ~extraterritorial~ property.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.night2); lg.addColorStop(1, C.night);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(244,239,230,${r() * 0.35})`; g.fillRect(r() * W, r() * 420, 1.6, 1.6); }
}

// ---------- pieces ----------
function obelisk(x, base, h) {
  ctx.fillStyle = C.wall2; ctx.fillRect(x - 12, base - 26, 24, 26);
  ctx.fillStyle = C.wall;
  ctx.beginPath(); ctx.moveTo(x - 8, base - 26); ctx.lineTo(x + 8, base - 26); ctx.lineTo(x + 5, base - h); ctx.lineTo(x, base - h - 14); ctx.lineTo(x - 5, base - h); ctx.closePath(); ctx.fill();
}
function piranesiWall(t, a) {
  A(a, () => {
    const base = 600;
    ctx.fillStyle = C.wall; ctx.fillRect(40, base - 150, 784, 150);
    ctx.fillStyle = C.wall2; ctx.fillRect(40, base - 158, 784, 10);
    // panels with stele between pairs of obelisks
    for (const x of [96, 236, 628, 768]) {
      obelisk(x - 22, base - 150, 120); obelisk(x + 22, base - 150, 120);
      ctx.strokeStyle = C.wall2; ctx.lineWidth = 3; ctx.strokeRect(x - 38, base - 128, 76, 100);
      ctx.fillStyle = C.wall2; ctx.beginPath(); ctx.arc(x, base - 82, 18, 0, TAU); ctx.fill();
    }
    // the central gate with its arched door
    ctx.fillStyle = C.wall2; ctx.fillRect(CX - 130, base - 260, 260, 260);
    ctx.fillStyle = C.wall; ctx.fillRect(CX - 116, base - 246, 232, 246);
    ctx.fillStyle = C.door;
    ctx.beginPath(); ctx.moveTo(CX - 70, base); ctx.lineTo(CX - 70, base - 160); ctx.arc(CX, base - 160, 70, Math.PI, TAU); ctx.lineTo(CX + 70, base); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#173022'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(CX, base); ctx.lineTo(CX, base - 230); ctx.stroke();
    keyholeShape(CX + 30, base - 100, 0.32); ctx.fillStyle = '#0b1410'; ctx.fill();
    ctx.strokeStyle = C.bronze; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(CX + 30, base - 100, 20, 0, TAU); ctx.stroke();
    // cypresses behind
    for (const x of [176, 330, 534, 690]) {
      ctx.fillStyle = C.hedge3; ctx.beginPath(); ctx.ellipse(x, base - 210, 22, 70, 0, 0, TAU); ctx.fill();
    }
  });
}
/** A keyhole: a circle above a flared slot. (x, y) is the circle's centre; s scales a 100 px circle. */
function keyholeShape(x, y, s, begin = true) {
  if (begin) ctx.beginPath();
  else ctx.moveTo(x + 50 * s * Math.cos(rad(118)), y + 50 * s * Math.sin(rad(118)));
  ctx.arc(x, y, 50 * s, rad(118), rad(62) + TAU, false);
  ctx.lineTo(x + 38 * s, y + 190 * s);
  ctx.lineTo(x - 38 * s, y + 190 * s);
  ctx.closePath();
}
function queue(t, a) {
  A(a, () => {
    const base = 640;
    for (let i = 0; i < 7; i++) {
      const x = CX + 60 + i * 52 + Math.sin(t * 1.3 + i) * 2;
      ctx.fillStyle = 'rgba(14,28,36,0.92)';
      ctx.beginPath(); ctx.arc(x, base - 92, 13, 0, TAU); ctx.fill();
      k.rrect(x - 15, base - 78, 30, 78, 10); ctx.fill();
    }
  });
}
/** The view through the keyhole: a tunnel of clipped hedges over a path, and at its far end the dome against the sky. */
function keyholeView(cx, cy, r, t, { city = 0 } = {}) {
  ctx.save();
  // the hedges fill everything around
  ctx.fillStyle = C.hedge3; ctx.fillRect(cx - r * 2, cy - r * 2, r * 4, r * 4);
  // rings of hedge, nearest (largest) first, each a little lighter, framing an opening that shrinks with distance
  const far = { w: r * 0.34, top: cy - r * 0.42, bot: cy + r * 0.08 };
  const arch = (w, top, bot) => { ctx.beginPath(); ctx.moveTo(cx - w, bot); ctx.lineTo(cx - w, top + w * 0.6); ctx.quadraticCurveTo(cx - w, top, cx, top); ctx.quadraticCurveTo(cx + w, top, cx + w, top + w * 0.6); ctx.lineTo(cx + w, bot); ctx.closePath(); };
  for (let i = 0; i < 8; i++) {
    const p = Math.pow(i / 7, 0.7);
    const w = lerp(r * 1.25, far.w * 1.18, p), top = lerp(cy - r * 1.45, far.top - 6, p), bot = lerp(cy + r * 1.6, far.bot, p);
    ctx.fillStyle = i % 2 ? C.hedge : C.hedge2;
    arch(w, top, bot); ctx.fill();
    ctx.fillStyle = 'rgba(15,40,25,0.35)'; arch(w * 0.94, top + 6, bot); ctx.fill();
  }
  // the opening at the far end: sky, the city (when not hidden) and the dome
  ctx.save(); arch(far.w, far.top, far.bot); ctx.clip();
  const sg = ctx.createLinearGradient(0, far.top, 0, far.bot);
  sg.addColorStop(0, C.sky2); sg.addColorStop(1, C.sky1);
  ctx.fillStyle = sg; ctx.fillRect(cx - far.w, far.top, far.w * 2, far.bot - far.top);
  const d = r * 0.075, base = far.bot - r * 0.02;
  A(city, () => {
    ctx.fillStyle = '#c49a7c';
    for (let i = -24; i <= 24; i++) { const w = 7 + ((i * 37 + 100) % 7); const h = 5 + ((i * 53 + 100) % 9); ctx.fillRect(cx + i * 11 - w / 2, base - h, w, h + 6); }
  });
  ctx.restore();
  ctx.fillStyle = C.domeDark; ctx.fillRect(cx - d * 1.15, base - d * 0.7, d * 2.3, d * 0.7);
  ctx.fillStyle = C.dome; ctx.beginPath(); ctx.ellipse(cx, base - d * 0.7, d, d * 1.05, 0, Math.PI, TAU); ctx.fill();
  ctx.fillRect(cx - d * 0.12, base - d * 2.05, d * 0.24, d * 0.35);
  // the path, gravel between the hedges
  ctx.fillStyle = '#c8b48d';
  ctx.beginPath(); ctx.moveTo(cx - r * 0.9, cy + r * 1.6); ctx.lineTo(cx - far.w * 0.6, far.bot); ctx.lineTo(cx + far.w * 0.6, far.bot); ctx.lineTo(cx + r * 0.9, cy + r * 1.6); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ---------- scenes ----------
function scenePiazza(t) {
  const a = span(t, 0, 9.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    piranesiWall(t, 1);
    queue(t, seg(t, 0.8, 1.8));
    A(seg(t, 1.0, 2.0) * (1 - seg(t, 4.6, 5.0)), () => { font(700, 36); text('Piazza dei Cavalieri di Malta', CX, 200, { align: 'center', base: 'middle', color: C.gold }); });
    A(seg(t, 5.2, 6.0), () => {
      font(600, 26); text('Piranesi’s wall of obelisks, 1765', CX, 200, { align: 'center', base: 'middle', color: C.soft });
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(CX + 30, 500, 34, 0, TAU); ctx.stroke();
      font(700, 26); text('the keyhole', CX + 30, 690, { align: 'center', base: 'middle', color: C.gold });
      ctx.beginPath(); ctx.moveTo(CX + 30, 668); ctx.lineTo(CX + 30, 540); ctx.stroke();
    });
  });
}
function sceneThrough(t) {
  const a = span(t, 9.2, 13.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = '#060c0a'; ctx.fillRect(0, 0, W, 780);
    ctx.save(); keyholeShape(CX, 300, 3.0); ctx.clip();
    keyholeView(CX, 300, 210, t);
    ctx.restore();
    A(seg(t, 10.6, 11.4), () => {
      font(700, 26); text('St Peter’s dome', CX + 150, 140, { align: 'left', base: 'middle', color: C.gold });
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(CX + 146, 148); ctx.lineTo(CX + 22, 282); ctx.stroke();
      text('hedges', 170, 470, { align: 'left', base: 'middle', color: C.gold });
      ctx.beginPath(); ctx.moveTo(250, 460); ctx.lineTo(330, 400); ctx.stroke();
    });
  });
}
function sceneMap(t) {
  const a = span(t, 13.6, 22.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a schematic map of central Rome: the keyhole low right, St Peter's up left, on a bearing of 316°
    const K = { x: 640, y: 640 }, s = 0.17; // px per metre
    const b = rad(316 - 360);
    const D = { x: K.x + Math.sin(b) * DIST * s, y: K.y - Math.cos(b) * DIST * s };
    // the Tiber
    ctx.strokeStyle = C.tiber; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(250, 120); ctx.bezierCurveTo(420, 260, 300, 420, 470, 520); ctx.bezierCurveTo(560, 580, 520, 700, 600, 760); ctx.stroke();
    font(600, 22); text('Tiber', 330, 330, { align: 'center', base: 'middle', color: C.tiber });
    // Aventine and Vatican
    ctx.fillStyle = 'rgba(63,122,74,0.35)'; ctx.beginPath(); ctx.ellipse(K.x + 20, K.y + 10, 90, 60, 0.4, 0, TAU); ctx.fill();
    font(700, 24); text('Aventine', K.x + 60, K.y + 60, { align: 'center', base: 'middle', color: C.ink });
    ctx.fillStyle = 'rgba(147,167,166,0.35)'; ctx.beginPath(); ctx.ellipse(D.x - 30, D.y, 80, 52, 0, 0, TAU); ctx.fill();
    text('St Peter’s', D.x - 10, D.y - 56, { align: 'center', base: 'middle', color: C.ink });
    ctx.fillStyle = C.dome; ctx.beginPath(); ctx.arc(D.x, D.y, 10, 0, TAU); ctx.fill();
    // the line of sight, drawn out
    const p = eio(seg(t, 14.0, 16.4));
    ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
    ctx.beginPath(); ctx.moveTo(K.x, K.y); ctx.lineTo(lerp(K.x, D.x, p), lerp(K.y, D.y, p)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(K.x, K.y, 9, 0, TAU); ctx.fill();
    font(700, 24); text('keyhole', K.x + 18, K.y - 18, { align: 'left', base: 'middle', color: C.gold });
    // the garden path, 90 m: tiny at this scale
    ctx.strokeStyle = C.hedge2; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(K.x, K.y); ctx.lineTo(K.x + Math.sin(b) * PATH * s, K.y - Math.cos(b) * PATH * s); ctx.stroke();
    A(seg(t, 16.2, 17.0), () => {
      const mx = (K.x + D.x) / 2, my = (K.y + D.y) / 2;
      ctx.fillStyle = 'rgba(14,28,36,0.88)'; k.rrect(mx - 20, my - 30, 190, 60, 12); ctx.fill();
      font(800, 34); text(`${Kit.fmt(DIST)} m`, mx + 75, my, { align: 'center', base: 'middle', color: C.gold });
      ctx.fillStyle = 'rgba(14,28,36,0.88)'; k.rrect(K.x - 210, K.y + 30, 196, 44, 10); ctx.fill();
      font(700, 24); text(`path: ${PATH} m`, K.x - 112, K.y + 52, { align: 'center', base: 'middle', color: C.hedge2 });
      font(500, 20); text('measured on OpenStreetMap', CX, 760, { align: 'center', base: 'middle', color: C.soft });
    });
    // 18–22: size and distance
    A(seg(t, 18.2, 19.0), () => {
      ctx.fillStyle = 'rgba(14,28,36,0.9)'; k.rrect(80, 120, 360, 90, 14); ctx.fill();
      font(800, 34); text('angle ≈ size ÷ distance', 260, 165, { align: 'center', base: 'middle', color: C.ink });
    });
  });
}
function sceneAngle(t) {
  const a = span(t, 22.4, 31.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a long thin triangle from the eye to the dome, drawn 20 times wider so it shows
    const ex = 90, ey = 330, dx = 780, half = Math.tan(rad(ANGLE / 2)) * (dx - ex) * 20;
    ctx.fillStyle = 'rgba(255,210,122,0.16)';
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(dx, ey - half); ctx.lineTo(dx, ey + half); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
    // the eye and the dome
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(ex - 12, ey, 18, 11, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.night; ctx.beginPath(); ctx.arc(ex - 6, ey, 5, 0, TAU); ctx.fill();
    ctx.fillStyle = C.dome; ctx.beginPath(); ctx.ellipse(dx + 6, ey, 14, half, 0, 0, TAU); ctx.fill();
    font(700, 24); text(`${DOME} m`, dx - 8, ey - half - 22, { align: 'right', base: 'middle', color: C.ink });
    text(`${Kit.fmt(DIST)} m`, (ex + dx) / 2, ey + half + 40, { align: 'center', base: 'middle', color: C.soft });
    font(500, 20); text('angle drawn 20 times wider', (ex + dx) / 2, ey + half + 74, { align: 'center', base: 'middle', color: C.soft });
    A(seg(t, 23.6, 24.4), () => {
      const v = lerp(0, ANGLE, eio(seg(t, 23.8, 25.2)));
      font(800, 64); text(`${v.toFixed(2)}°`, CX, 160, { align: 'center', base: 'middle', color: C.gold });
    });
    // the dome and the full Moon side by side, at the same angular scale
    A(seg(t, 26.9, 27.8), () => {
      const pxPerDeg = 150, y = 650;
      ctx.fillStyle = 'rgba(14,28,36,0.9)'; k.rrect(150, y - 110, 564, 210, 18); ctx.fill();
      ctx.fillStyle = C.moon; ctx.beginPath(); ctx.arc(320, y, (MOON / 2) * pxPerDeg, 0, TAU); ctx.fill();
      const d = (ANGLE / 2) * pxPerDeg;
      ctx.fillStyle = C.dome; ctx.beginPath(); ctx.ellipse(560, y + 10, d, d * 1.05, 0, Math.PI, TAU); ctx.fill();
      ctx.fillStyle = C.domeDark; ctx.fillRect(560 - d * 1.15, y + 10, d * 2.3, d * 0.5);
      font(700, 24); text(`full Moon ${MOON}°`, 320, y + 76, { align: 'center', base: 'middle', color: C.moon });
      text(`dome ${ANGLE.toFixed(1)}°`, 560, y + 76, { align: 'center', base: 'middle', color: C.dome });
      font(800, 32); text(`× ${MOONS.toFixed(2)}`, CX, y - 86, { align: 'center', base: 'middle', color: C.gold });
    });
  });
}
function sceneFrame(t) {
  const a = span(t, 31.2, 48.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // 31–35: the city view, dome the same small size, then the keyhole crop; 35–48: the frame and the hidden city
    const cityA = 1 - seg(t, 44.6, 46.2);
    const hole = seg(t, 33.0, 34.2);
    ctx.fillStyle = '#060c0a'; ctx.fillRect(0, 0, W, 780);
    // the full scene
    keyholeView(CX, 340, 240, t, { city: t < 44.4 ? 1 : cityA });
    // darken everything outside the keyhole as it closes in
    A(hole * 0.92, () => {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, 780); keyholeShape(CX, 300, 3.2, false); ctx.clip('evenodd');
      ctx.fillStyle = '#060c0a'; ctx.fillRect(0, 0, W, 780);
      ctx.restore();
    });
    A(span(t, 31.6, 35.4, 0.4, 0.3), () => { font(700, 26); text('same dome, same size', CX, 120, { align: 'center', base: 'middle', color: C.gold }); });
    A(span(t, 35.8, 44.2, 0.4, 0.3), () => {
      // side view: eye, near arch, far dome, the angles they fill
      const y = 690, ex = 110;
      ctx.fillStyle = 'rgba(14,28,36,0.92)'; k.rrect(60, y - 120, 744, 190, 16); ctx.fill();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(ex, y, 14, 9, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.hedge2; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(250, y, 80, -Math.PI / 2 - 0.9, -Math.PI / 2 + 0.9); ctx.stroke(); // the arch, near
      ctx.fillStyle = C.dome; ctx.beginPath(); ctx.arc(760, y, 6, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
      for (const yy of [y - 64, y + 64]) { ctx.beginPath(); ctx.moveTo(ex, y); ctx.lineTo(320, yy + (yy - y) * 0.4); ctx.stroke(); }
      ctx.strokeStyle = C.gold; for (const yy of [y - 6, y + 6]) { ctx.beginPath(); ctx.moveTo(ex, y); ctx.lineTo(760, yy); ctx.stroke(); }
      font(700, 26); text('near hedges: a wide angle', 270, y - 92, { align: 'center', base: 'middle', color: '#8fcf8f' });
      text('far dome: a tiny one', 640, y - 92, { align: 'center', base: 'middle', color: C.gold });
      font(500, 20); text('schematic', 780, y + 52, { align: 'right', base: 'middle', color: C.soft });
    });
    A(span(t, 44.6, 48.8, 0.4, 0.3), () => { font(700, 26); text('the city in between: hidden', CX, 120, { align: 'center', base: 'middle', color: C.gold }); });
  });
}
function sceneOrder(t) {
  const a = span(t, 48.8, 62.4, 0.5, 0);
  if (a <= 0) return;
  A(a, () => {
    if (t < 53.2) {
      // Piranesi and his church: a front with a low pediment and paired pilasters
      const x = CX, y = 560;
      ctx.fillStyle = C.wall; ctx.fillRect(x - 170, y - 300, 340, 300);
      ctx.fillStyle = C.wall2; ctx.beginPath(); ctx.moveTo(x - 190, y - 300); ctx.lineTo(x, y - 370); ctx.lineTo(x + 190, y - 300); ctx.closePath(); ctx.fill();
      for (const px of [x - 150, x - 116, x + 116, x + 150]) { ctx.fillStyle = C.wall2; ctx.fillRect(px - 10, y - 290, 20, 290); }
      ctx.fillStyle = C.door; ctx.fillRect(x - 46, y - 150, 92, 150);
      ctx.fillStyle = C.wall2; ctx.beginPath(); ctx.arc(x, y - 210, 34, 0, TAU); ctx.fill();
      font(700, 28); text('Santa Maria del Priorato', x, y + 40, { align: 'center', base: 'middle', color: C.ink });
      font(600, 24); text('rebuilt 1764–66 to Piranesi’s designs', x, y + 78, { align: 'center', base: 'middle', color: C.soft });
      return;
    }
    // the Order's cross and the villa's grounds, inside Rome
    const cx = CX, cy = 380, s = 120;
    ctx.fillStyle = C.red;
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-s * 0.5, -s); ctx.lineTo(0, -s * 0.72); ctx.lineTo(s * 0.5, -s); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    A(seg(t, 57.8, 58.8), () => {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.ellipse(cx, cy, 200, 160, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      font(700, 26); text('extraterritorial property, inside Italy', cx, cy + 200, { align: 'center', base: 'middle', color: C.gold });
    });
    font(700, 28); text('Sovereign Military Order of Malta', cx, 150, { align: 'center', base: 'middle', color: C.ink });
  });
}

Kit.scene({
  width: W, height: H, duration: 62.4, fonts: [LAB, TEXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    scenePiazza(t);
    sceneThrough(t);
    sceneMap(t);
    sceneAngle(t);
    sceneFrame(t);
    sceneOrder(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 700, family: TEXT, ink: C.ink, marks: { '*': C.gold, '~': '#9fd3c7', '^': C.red } });
  },
});
