// Explainer for literature-hohe-minne: "Das Spiel der hohen Minne", its roles and its endless round.
// Look: a page from an illuminated songbook. Warm parchment inside a Manesse-style frame (green band,
// gold rule, vermilion line), flat-coloured Gothic figures with ink outlines, a lady in a pointed
// window with a starry blue ground, and a wheel diagram like a medieval rota. Uncial Antiqua for the
// title and labels, EB Garamond for the captions. German captions for B1 learners.
//
// Scene plan (58.5 s). Everything important sits above y = 930; captions are centred at y = 832.
//  A  0.0–20.8  The roles. Title; a singer below the lady's tower sings, his notes never reach her;
//               she stays out of reach; the court listens; the lord gives coins.
//  B 20.6–45.6  The round: loben → dienen → hoffen → kein Lohn → klagen, then it starts again.
//  C 45.4–54.8  Why: the service is meant to make him better (triuwe, stæte, diemüete, hôher muot);
//               his real reward is standing at court, like a win in a tournament.
//  D 54.6–58.5  End card: "Hohe Minne – ein Spiel mit festen Regeln" and the sources.
//
// Facts (German Wikipedia): "Hohe Minne": the male speaker courts an idealised lady without success,
// he is presented as her "dienstman" (servant, as in feudal service), his reward exists only in ideal
// values (recognition from the lady, society or himself), he strives for moral self-perfection.
// "Minnesang": Minne = "liebevolles Gedenken"; songs for a usually high-born lady; performed at court,
// a successful song is a proof of skill "ähnlich einem Jagderfolg oder einem Sieg im Ritterturnier";
// the genre of the Minneklage (lament). "Ritterlichkeit": in the hohe Minne the singer assures the
// lady of his hôher muot, staete, diemüete and triuwe (Hochstimmung, Beständigkeit, Demut, Treue).
// "Heinrich von Morungen": a pension from his patron (Gönner), so lords did support singers.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  parchLight: '#F6EBD0', parch: '#ECDAB2', parchEdge: '#D3B985', paper: '#FBF3DF',
  ink: '#2E2016', inkSoft: 'rgba(46,32,22,0.66)', inkFaint: 'rgba(46,32,22,0.28)',
  red: '#B4361F', redDeep: '#7E2416', green: '#3D6B3B', greenDeep: '#23412B', greenLight: '#6E9A55',
  blue: '#2B4C9B', blueDeep: '#1A2F66', gold: '#C8992F', goldLight: '#EBCB6E', goldDeep: '#8C6A1A',
  rose: '#D49A98', roseDeep: '#9E4F5A', skin: '#F5DEC9', cheek: 'rgba(214,104,92,0.55)',
  hair: '#9A6A33', hairDark: '#5C3B1E', veil: '#FBF8F0', stone: '#DCD0B8', stoneDark: '#B7A98B',
  wood: '#8A5A2B', woodDark: '#5E3A1A',
};
const TITLE = 'Uncial Antiqua', TEXT = 'EB Garamond';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- timeline ----------
const T = { A: [0, 20.8], B: [20.6, 45.6], C: [45.4, 54.8], D: [54.6, 58.5] };
const CUES = [
  [0.5, 4.4, 'Wie funktioniert die *hohe Minne*? Ein Spiel mit vier Rollen.'],
  [4.6, 8.6, 'Ein ~Sänger~ singt für eine adlige Dame, seine *frouwe* (Herrin).'],
  [8.8, 12.6, 'Sie steht hoch über ihm. Er kann sie *nicht erreichen*.'],
  [12.8, 16.6, 'Der ~Hof~ hört zu. Das Lied ist ein Auftritt vor allen.'],
  [16.8, 20.5, 'Der *Herr* des Hofes ist oft ein Gönner. Er gibt Geld und Geschenke.'],
  [20.9, 24.9, '*1. Loben:* Er lobt ihre Schönheit und ihre Güte.'],
  [25.0, 29.0, '*2. Dienen:* Er nennt sich ihr Diener, wie ein Ritter seinem Herrn.'],
  [29.1, 33.1, '*3. Hoffen:* Er hofft auf Lohn, auf ein freundliches Zeichen von ihr.'],
  [33.2, 37.2, '*4. Kein Lohn:* Sie bleibt fern und sagt nicht Ja.'],
  [37.3, 41.3, '*5. Klagen:* Er klagt über seinen Schmerz – und singt weiter.'],
  [41.4, 45.3, 'Dann beginnt alles ~von vorn~. Das Spiel hat kein Ende.'],
  [45.6, 50.0, 'Warum? Der Dienst soll ihn zu einem ~besseren Menschen~ machen.'],
  [50.1, 54.6, 'Sein Lohn ist *Ansehen* am Hof, wie ein Sieg im Turnier.'],
];

// ---------- static page, painted once ----------
let page = null;
function paintPage() {
  page = document.createElement('canvas'); page.width = W; page.height = H;
  const g = page.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 470, 60, W / 2, 520, 780);
  rad.addColorStop(0, C.parchLight); rad.addColorStop(0.6, C.parch); rad.addColorStop(1, C.parchEdge);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  // soft stains, so it reads as old skin rather than flat paper
  const rnd = mulberry32(11);
  for (let i = 0; i < 26; i++) {
    const x = rnd() * W, y = rnd() * H, r = 60 + rnd() * 180, a = 0.025 + rnd() * 0.04;
    const st = g.createRadialGradient(x, y, 0, x, y, r);
    st.addColorStop(0, `rgba(150,108,52,${a})`); st.addColorStop(1, 'rgba(150,108,52,0)');
    g.fillStyle = st; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  // the frame: green band, gold rule, vermilion line, gold squares at the corners
  g.fillStyle = C.green; g.fillRect(20, 20, W - 40, 12); g.fillRect(20, H - 32, W - 40, 12);
  g.fillRect(20, 20, 12, H - 40); g.fillRect(W - 32, 20, 12, H - 40);
  g.strokeStyle = C.gold; g.lineWidth = 6; g.strokeRect(37, 37, W - 74, H - 74);
  g.strokeStyle = C.red; g.lineWidth = 2; g.strokeRect(46, 46, W - 92, H - 92);
  for (const [x, y] of [[26, 26], [W - 26, 26], [26, H - 26], [W - 26, H - 26]]) {
    g.fillStyle = C.gold; g.fillRect(x - 11, y - 11, 22, 22);
    g.fillStyle = C.red; g.fillRect(x - 5, y - 5, 10, 10);
  }
}

function background() {
  if (!page) paintPage();
  ctx.drawImage(page, 0, 0);
  font(700, 21); text('LESEFUTTER · LITERATUR', 72, 92, { color: C.red, spacing: '3px' });
}

// ---------- small drawing helpers ----------
const outline = (w = 3) => { ctx.lineWidth = w; ctx.strokeStyle = C.ink; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
function circle(x, y, r, fill, stroke = 3) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) outline(stroke);
}
/** A four-pointed star, as painted on blue manuscript grounds. */
function star(x, y, r, color) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2, rr = i % 2 ? r * 0.32 : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill();
}
/** A scroll ribbon (banderole) with notched ends. */
function ribbon(cx, cy, w, h = 44, fill = C.paper) {
  const x0 = cx - w / 2, x1 = cx + w / 2, n = h * 0.32;
  ctx.beginPath();
  ctx.moveTo(x0 - 14, cy - h / 2 + 6); ctx.lineTo(x1 + 14, cy - h / 2 + 6);
  ctx.lineTo(x1 + 14 - n, cy + 3); ctx.lineTo(x1 + 14, cy + h / 2); ctx.lineTo(x0 - 14, cy + h / 2);
  ctx.lineTo(x0 - 14 + n, cy + 3); ctx.closePath();
  ctx.fillStyle = 'rgba(140,106,26,0.55)'; ctx.fill(); outline(2.5);
  ctx.beginPath(); ctx.moveTo(x0, cy - h / 2); ctx.quadraticCurveTo(cx, cy - h / 2 - 6, x1, cy - h / 2);
  ctx.lineTo(x1, cy + h / 2 - 4); ctx.quadraticCurveTo(cx, cy + h / 2 - 10, x0, cy + h / 2 - 4); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); outline(2.5);
}
function label(s, cx, cy, { size = 28, color = C.red, w } = {}) {
  font(700, size);
  const tw = w ?? ctx.measureText(s).width + 34;
  ribbon(cx, cy, tw, size + 20);
  text(s, cx, cy - 1, { color, align: 'center', base: 'middle' });
}

// ---------- figures ----------
/** A face in three-quarter view. look: -1 left .. 1 right. */
function face(x, y, r, look = 1, { mouth = 0 } = {}) {
  circle(x, y, r, C.skin, 2.5);
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(x + look * r * 0.32 - r * 0.18, y - r * 0.12, r * 0.08, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x + look * r * 0.32 + r * 0.22, y - r * 0.12, r * 0.08, 0, TAU); ctx.fill();
  ctx.fillStyle = C.cheek; ctx.beginPath(); ctx.arc(x + look * r * 0.3 + r * 0.02, y + r * 0.28, r * 0.2, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.redDeep; ctx.lineWidth = 2;
  if (mouth > 0.05) { ctx.fillStyle = C.redDeep; ctx.beginPath(); ctx.ellipse(x + look * r * 0.36, y + r * 0.5, r * 0.12, r * 0.12 * (0.5 + mouth), 0, 0, TAU); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(x + look * r * 0.36 - r * 0.14, y + r * 0.5); ctx.lineTo(x + look * r * 0.36 + r * 0.14, y + r * 0.5); ctx.stroke(); }
}
/** Curly hair behind and on top of a head. */
function curls(x, y, r, color, look = 1) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y - r * 0.15, r * 1.08, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * (0.55 + i * 0.13) * (look > 0 ? 1 : -1) + (look > 0 ? 0 : TAU);
    const px = x - look * Math.abs(Math.cos(a)) * r * 0.95, py = y + Math.sin(Math.PI * (0.05 + i * 0.12)) * r * 0.2 - r * 0.15 + i * r * 0.12;
    ctx.beginPath(); ctx.arc(px, py, r * 0.3, 0, TAU); ctx.fill();
  }
}
/** A crown with fleurons and jewels. */
function crown(x, y, w, h = w * 0.55) {
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  for (let i = 0; i <= 4; i++) {
    const px = x - w / 2 + (w * i) / 4;
    ctx.lineTo(px - (i ? w * 0.05 : 0), y - h * 0.45);
    ctx.lineTo(px, y - h);
    ctx.lineTo(px + (i < 4 ? w * 0.05 : 0), y - h * 0.45);
  }
  ctx.lineTo(x + w / 2, y); ctx.closePath();
  const gg = ctx.createLinearGradient(x - w / 2, y - h, x + w / 2, y);
  gg.addColorStop(0, C.goldLight); gg.addColorStop(0.5, C.gold); gg.addColorStop(1, C.goldDeep);
  ctx.fillStyle = gg; ctx.fill(); outline(2);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = i === 1 ? C.blue : C.red; ctx.beginPath(); ctx.arc(x - w * 0.25 + i * w * 0.25, y - h * 0.22, w * 0.06, 0, TAU); ctx.fill(); }
}

/** The lady: upper body with veil, crown and a rose; head centre at (x, y). */
function ladyBust(x, y, s = 1, { look = -1, rose = true } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // gown and sleeves
  ctx.beginPath(); ctx.moveTo(-18, 18); ctx.quadraticCurveTo(-46, 30, -50, 92); ctx.lineTo(50, 92); ctx.quadraticCurveTo(46, 30, 18, 18); ctx.closePath();
  ctx.fillStyle = C.rose; ctx.fill(); outline(2.5);
  ctx.strokeStyle = 'rgba(158,79,90,0.6)'; ctx.lineWidth = 2;
  for (const fx of [-20, 0, 20]) { ctx.beginPath(); ctx.moveTo(fx * 0.6, 34); ctx.quadraticCurveTo(fx, 60, fx * 1.2, 90); ctx.stroke(); }
  ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-15, 24); ctx.quadraticCurveTo(0, 32, 15, 24); ctx.stroke();
  // veil behind the head, falling onto the shoulders
  ctx.beginPath(); ctx.moveTo(-28, -6); ctx.quadraticCurveTo(-34, 22, -30, 40); ctx.lineTo(30, 40); ctx.quadraticCurveTo(34, 22, 28, -6);
  ctx.arc(0, -4, 28, 0, Math.PI, true); ctx.closePath(); ctx.fillStyle = C.veil; ctx.fill(); outline(2.5);
  face(0, 0, 21, look);
  // wimple line under the chin
  ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 2, 24, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  crown(0, -22, 40, 22);
  if (rose) {
    ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(30, 82); ctx.lineTo(38, 44); ctx.stroke();
    ctx.fillStyle = C.green; ctx.beginPath(); ctx.ellipse(41, 62, 7, 3.5, -0.6, 0, TAU); ctx.fill();
    circle(38, 40, 8, C.red, 2); circle(38, 40, 3.5, C.redDeep, 0);
    circle(30, 84, 6, C.skin, 2);
  }
  ctx.restore();
}

/** The singer's free arm: shoulder, length, and where the hand is (relative to his feet). */
const ARM = { x: -16, y: -170, len: 74 };
function handAt(reach) {
  const th = lerp(Math.PI / 2 + 0.12, -0.95, eio(clamp(reach)));
  return [ARM.x + Math.cos(th) * ARM.len, ARM.y + Math.sin(th) * ARM.len];
}
/** The singer, standing, feet at (x, fy). play: bowing the fiddle; reach: 0..1 raises his free arm. */
function singer(x, fy, t, { play = 1, reach = 0, sing = 0, halo = 0 } = {}) {
  ctx.save(); ctx.translate(x, fy);
  if (halo > 0) {
    const hg = ctx.createRadialGradient(4, -150, 10, 4, -150, 170);
    hg.addColorStop(0, `rgba(235,203,110,${0.55 * halo})`); hg.addColorStop(1, 'rgba(235,203,110,0)');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(4, -150, 170, 0, TAU); ctx.fill();
  }
  // legs and pointed shoes
  ctx.lineCap = 'round';
  for (const [lx, sx] of [[-11, -20], [11, 26]]) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(lx, -72); ctx.lineTo(lx + (lx < 0 ? -3 : 3), -8); ctx.stroke();
    ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(lx, -72); ctx.lineTo(lx + (lx < 0 ? -3 : 3), -8); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(lx + (sx - lx) * 0.5, -4, 15, 5, 0, 0, TAU); ctx.fill();
  }
  // tunic
  ctx.beginPath(); ctx.moveTo(-26, -178); ctx.quadraticCurveTo(-34, -120, -46, -66); ctx.quadraticCurveTo(0, -56, 46, -66); ctx.quadraticCurveTo(34, -120, 26, -178); ctx.closePath();
  ctx.fillStyle = C.blue; ctx.fill(); outline(3);
  ctx.strokeStyle = 'rgba(20,30,70,0.55)'; ctx.lineWidth = 2;
  for (const fx of [-18, 0, 18]) { ctx.beginPath(); ctx.moveTo(fx * 0.5, -150); ctx.quadraticCurveTo(fx * 1.1, -105, fx * 1.6, -64); ctx.stroke(); }
  ctx.fillStyle = C.gold; ctx.fillRect(-31, -124, 62, 7); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(-31, -124, 62, 7);
  ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(-22, -178); ctx.quadraticCurveTo(0, -164, 22, -178); ctx.lineTo(16, -184); ctx.lineTo(-16, -184); ctx.closePath(); ctx.fill();
  // the free arm: hanging, or reaching up towards the lady
  const [ex, ey] = handAt(reach);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(ARM.x, ARM.y); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = C.blue; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(ARM.x, ARM.y); ctx.lineTo(ex, ey); ctx.stroke();
  circle(ex, ey, 7, C.skin, 2);
  // head
  curls(4, -205, 22, C.hair, 1);
  face(4, -205, 22, 1, { mouth: sing });
  ctx.fillStyle = C.hair; ctx.beginPath(); ctx.arc(4, -213, 22, Math.PI * 1.1, Math.PI * 1.75); ctx.lineTo(4, -212); ctx.closePath(); ctx.fill();
  // fiddle against the chest, bow moving
  ctx.save(); ctx.translate(26, -138); ctx.rotate(-0.95);
  ctx.beginPath(); ctx.ellipse(0, 0, 34, 15, 0, 0, TAU); ctx.fillStyle = C.wood; ctx.fill(); outline(2.5);
  ctx.fillStyle = C.woodDark; ctx.beginPath(); ctx.ellipse(-4, 0, 3, 2.4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(10, 0, 3, 2.4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C.woodDark; ctx.fillRect(30, -4, 26, 8); ctx.beginPath(); ctx.ellipse(60, 0, 7, 6, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(251,243,223,0.8)'; ctx.lineWidth = 1; for (const dy of [-3, 0, 3]) { ctx.beginPath(); ctx.moveTo(-26, dy); ctx.lineTo(58, dy); ctx.stroke(); }
  ctx.restore();
  // bowing hand and bow
  const bw = play * Math.sin(t * 5.2) * 18;
  ctx.save(); ctx.translate(26, -138);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(-4, -32); ctx.lineTo(16 + bw * 0.5, 4); ctx.stroke();
  ctx.strokeStyle = C.blue; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-4, -32); ctx.lineTo(16 + bw * 0.5, 4); ctx.stroke();
  ctx.strokeStyle = C.woodDark; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-30 + bw, 26 - bw * 0.2); ctx.quadraticCurveTo(0 + bw, -4, 52 + bw, -22 - bw * 0.2); ctx.stroke();
  circle(16 + bw * 0.5, 6, 7, C.skin, 2);
  ctx.restore();
  ctx.restore();
}

/** A seated listener; head centre at (x, y). */
function listener(x, y, { gown, look = -1, veil = false, cap = null, hair = C.hairDark, nod = 0 } = {}) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(-14, 16); ctx.quadraticCurveTo(-30, 50, -32, 116); ctx.lineTo(32, 116); ctx.quadraticCurveTo(30, 50, 14, 16); ctx.closePath();
  ctx.fillStyle = gown; ctx.fill(); outline(2.5);
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(-12, 120, 11, 4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(12, 120, 11, 4, 0, 0, TAU); ctx.fill();
  ctx.translate(0, nod);
  if (veil) { ctx.beginPath(); ctx.arc(0, -2, 21, Math.PI, 0); ctx.lineTo(22, 22); ctx.lineTo(-22, 22); ctx.closePath(); ctx.fillStyle = C.veil; ctx.fill(); outline(2); }
  else curls(0, 0, 17, hair, look);
  face(0, 0, 17, look);
  if (cap) { ctx.beginPath(); ctx.ellipse(0, -15, 19, 8, 0, Math.PI, 0); ctx.fillStyle = cap; ctx.fill(); outline(2); }
  ctx.restore();
}

/** The lord: seated, crowned, red mantle with an ermine collar, a purse in his hand. */
function lord(x, y, look = -1) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(-16, 18); ctx.quadraticCurveTo(-38, 60, -38, 136); ctx.lineTo(38, 136); ctx.quadraticCurveTo(38, 60, 16, 18); ctx.closePath();
  ctx.fillStyle = C.red; ctx.fill(); outline(2.5);
  ctx.beginPath(); ctx.moveTo(-26, 22); ctx.quadraticCurveTo(0, 46, 26, 22); ctx.lineTo(20, 14); ctx.quadraticCurveTo(0, 30, -20, 14); ctx.closePath();
  ctx.fillStyle = C.paper; ctx.fill(); outline(2);
  ctx.fillStyle = C.ink; for (const ex of [-14, 0, 14]) { ctx.beginPath(); ctx.ellipse(ex, 24 + (ex ? 0 : 6), 1.6, 3.2, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(-13, 140, 12, 4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(13, 140, 12, 4, 0, 0, TAU); ctx.fill();
  // purse
  ctx.beginPath(); ctx.moveTo(-30, 74); ctx.quadraticCurveTo(-48, 92, -40, 104); ctx.quadraticCurveTo(-28, 112, -18, 102); ctx.quadraticCurveTo(-14, 88, -24, 74); ctx.closePath();
  ctx.fillStyle = C.wood; ctx.fill(); outline(2);
  circle(-22, 72, 6, C.skin, 2);
  curls(0, 0, 19, C.hairDark, look);
  face(0, 0, 19, look);
  ctx.fillStyle = C.hairDark; ctx.beginPath(); ctx.moveTo(-12, 12); ctx.quadraticCurveTo(0, 30, 12, 12); ctx.quadraticCurveTo(0, 20, -12, 12); ctx.fill();
  crown(0, -14, 36, 20);
  ctx.restore();
}

function coin(x, y, r = 8) {
  circle(x, y, r, C.gold, 2);
  ctx.fillStyle = C.goldLight; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, TAU); ctx.fill();
}

// ---------- the stage: tower, window, ground ----------
const WIN = { x0: 337, x1: 527, ys: 300, floor: 404 };
const LADY = { x: 432, y: 252 };
const SING = { x: 200, fy: 700 };
const BENCH = [{ x: 528, gown: C.green, cap: C.red, look: -1 }, { x: 592, gown: C.blue, veil: true, look: -1 }, { x: 656, gown: C.rose, look: -1 }];
const LORD = { x: 734, y: 548 };
const COURT_LABEL = 592;

/** Pointed-arch path for the window. */
function archPath(x0, x1, ys, yb) {
  const w = x1 - x0, r = 0.7 * w, th = Math.acos((w / 2 - r) / r);
  ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x0, ys);
  ctx.arc(x0 + r, ys, r, Math.PI, TAU - th);
  ctx.arc(x1 - r, ys, r, th - Math.PI, 0);
  ctx.lineTo(x1, yb); ctx.closePath();
}

let starField = null;
function tower(t, glow = 0) {
  // shaft down to the ground, then the wide top with battlements
  ctx.fillStyle = C.stone;
  ctx.beginPath(); ctx.rect(392, 404, 80, 296); ctx.fill(); outline(3);
  ctx.beginPath(); ctx.rect(302, 140, 260, 280); ctx.fill(); outline(3);
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.rect(302 + i * 56, 118, 36, 24); ctx.fillStyle = C.stone; ctx.fill(); outline(3); }
  ctx.strokeStyle = C.stoneDark; ctx.lineWidth = 2;
  for (let row = 0; row < 15; row++) {
    const y = 160 + row * 20;
    const inTop = y < 420;
    const xa = inTop ? 304 : 394, xb = inTop ? 560 : 470;
    if (y > 690) break;
    ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke();
    for (let x = xa + (row % 2 ? 18 : 38); x < xb; x += 40) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 20); ctx.stroke(); }
  }
  for (let y = 440; y < 700; y += 20) { ctx.beginPath(); ctx.moveTo(394, y); ctx.lineTo(470, y); ctx.stroke(); }
  // window with a blue, starry ground
  if (glow > 0) {
    const gg = ctx.createRadialGradient(LADY.x, LADY.y + 20, 20, LADY.x, LADY.y + 20, 230);
    gg.addColorStop(0, `rgba(235,203,110,${0.6 * glow})`); gg.addColorStop(1, 'rgba(235,203,110,0)');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(LADY.x, LADY.y + 20, 230, 0, TAU); ctx.fill();
  }
  archPath(WIN.x0 - 14, WIN.x1 + 14, WIN.ys, WIN.floor); ctx.fillStyle = C.stoneDark; ctx.fill(); outline(3);
  archPath(WIN.x0, WIN.x1, WIN.ys, WIN.floor);
  ctx.save(); ctx.clip();
  ctx.fillStyle = C.blueDeep; ctx.fillRect(WIN.x0, 140, WIN.x1 - WIN.x0, 280);
  if (!starField) { const r = mulberry32(5); starField = Array.from({ length: 16 }, () => [WIN.x0 + 12 + r() * (WIN.x1 - WIN.x0 - 24), 186 + r() * 150]); }
  for (const [sx, sy] of starField) star(sx, sy, 6, C.goldLight);
  ladyBust(LADY.x, LADY.y, 1);
  ctx.restore();
  archPath(WIN.x0, WIN.x1, WIN.ys, WIN.floor); outline(3);
  // a red cloth hung over the parapet
  const cy0 = 340, cy1 = 414;
  ctx.beginPath(); ctx.moveTo(WIN.x0 - 20, cy0); ctx.lineTo(WIN.x1 + 20, cy0); ctx.lineTo(WIN.x1 + 20, cy1);
  for (let i = 8; i >= 0; i--) { const x = WIN.x0 - 20 + ((WIN.x1 - WIN.x0 + 40) * i) / 8; ctx.lineTo(x + 13, cy1 + 12); ctx.lineTo(x, cy1); }
  ctx.closePath(); ctx.fillStyle = C.red; ctx.fill(); outline(3);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(WIN.x0 - 18, cy0 + 8); ctx.lineTo(WIN.x1 + 18, cy0 + 8); ctx.stroke();
  for (let i = 0; i < 5; i++) star(WIN.x0 + 4 + i * 47, 380, 9, C.goldLight);
  // her hands on the parapet
  circle(LADY.x - 32, cy0 - 2, 7, C.skin, 2);
}

function ground() {
  ctx.fillStyle = C.green;
  ctx.beginPath(); ctx.moveTo(52, 716);
  for (let x = 52; x <= 812; x += 19) ctx.quadraticCurveTo(x + 5, 694 + ((x * 7) % 9), x + 10, 704);
  ctx.lineTo(812, 716); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.greenLight;
  for (let x = 66; x < 812; x += 38) { ctx.beginPath(); ctx.moveTo(x, 706); ctx.lineTo(x + 4, 692); ctx.lineTo(x + 8, 706); ctx.fill(); }
}

function bench(alpha = 1, nodT = 0) {
  withAlpha(alpha, () => {
    ctx.fillStyle = C.wood; ctx.beginPath(); ctx.rect(492, 640, 202, 18); ctx.fill(); outline(2.5);
    for (const lx of [502, 680]) { ctx.beginPath(); ctx.rect(lx, 658, 8, 42); ctx.fillStyle = C.woodDark; ctx.fill(); outline(2); }
    BENCH.forEach((b, i) => listener(b.x, 566, { ...b, nod: Math.max(0, Math.sin(nodT * 3.2 + i * 1.3)) * 3 }));
  });
}

// ---------- notes that rise from the singer and never reach the lady ----------
const NOTE_FROM = [SING.x + 30, SING.fy - 214], NOTE_CTRL = [250, 320], NOTE_TO = [LADY.x - 34, LADY.y + 30];
function notes(t, a0, a1) {
  for (let i = 0; ; i++) {
    const born = a0 + i * 0.55;
    if (born > a1) break;
    const p = (t - born) / 2.6;
    if (p < 0 || p > 1) continue;
    const u = p * 0.78; // they stop well short of her
    const x = (1 - u) * (1 - u) * NOTE_FROM[0] + 2 * (1 - u) * u * NOTE_CTRL[0] + u * u * NOTE_TO[0] + Math.sin(p * 7 + i) * 8;
    const y = (1 - u) * (1 - u) * NOTE_FROM[1] + 2 * (1 - u) * u * NOTE_CTRL[1] + u * u * NOTE_TO[1];
    withAlpha(seg(p, 0, 0.12) * (1 - seg(p, 0.6, 1)), () => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(0.12 * Math.sin(p * 5 + i));
      ctx.fillStyle = i % 3 === 1 ? C.red : C.ink; ctx.fillRect(-7, -7, 14, 14);
      if (i % 2 === 0) { ctx.fillRect(5, -7, 3, 28); }
      ctx.restore();
    });
  }
}

// ---------- scene A: the roles ----------
function sceneA(t) {
  const glow = seg(t, 8.9, 9.6) * (1 - seg(t, 12.4, 13.0));
  withAlpha(eout(seg(t, 0.1, 0.9)), () => tower(t, glow));
  ground();
  // the title, on a scroll across the stage
  withAlpha(span(t, 0.3, 4.7, 0.6, 0.4), () => {
    const rise = (1 - eout(seg(t, 0.3, 1.1))) * 14;
    ctx.save(); ctx.translate(0, rise);
    ribbon(W / 2, 566, 600, 168);
    font(400, 50, TITLE); text('Das Spiel der', W / 2, 532, { color: C.ink, align: 'center', base: 'middle' });
    font(400, 66, TITLE); text('hohen Minne', W / 2, 600, { color: C.red, align: 'center', base: 'middle' });
    ctx.restore();
  });
  // the singer walks in
  const sIn = eout(seg(t, 4.6, 5.4));
  const reach = seg(t, 9.0, 9.8) * (1 - seg(t, 12.6, 13.3));
  withAlpha(sIn, () => {
    ctx.save(); ctx.translate((1 - sIn) * -40, 0);
    const sing = t > 5 ? 0.5 + 0.5 * Math.sin(t * 6.3) : 0;
    singer(SING.x, SING.fy, t, { play: 1 - reach, reach, sing });
    ctx.restore();
    label('der Sänger', SING.x, 744);
  });
  notes(t, 5.0, 20.2);
  // out of reach: a dotted line from his hand that stops short of her
  withAlpha(span(t, 9.4, 12.6, 0.3, 0.4), () => {
    const p = eout(seg(t, 9.5, 10.6));
    const [hx, hy] = handAt(1);
    const [x0, y0] = [SING.x + hx + 8, SING.fy + hy - 8], [x1, y1] = [LADY.x - 60, LADY.y + 40];
    ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.setLineDash([2, 12]); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, 0.62 * p), lerp(y0, y1, 0.62 * p)); ctx.stroke(); ctx.setLineDash([]);
    if (p > 0.9) {
      const mx = lerp(x0, x1, 0.72), my = lerp(y0, y1, 0.72), s = back(seg(t, 10.6, 11.0)) * 13;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(mx - s, my - s); ctx.lineTo(mx + s, my + s); ctx.moveTo(mx + s, my - s); ctx.lineTo(mx - s, my + s); ctx.stroke();
    }
  });
  withAlpha(eout(seg(t, 4.8, 5.6)), () => label('die frouwe', LADY.x, 452, { color: C.red }));
  // the court
  const cIn = eout(seg(t, 12.8, 13.6));
  bench(cIn, t);
  withAlpha(cIn, () => label('der Hof', COURT_LABEL, 744));
  // the lord and his coins
  const lIn = eout(seg(t, 16.8, 17.5));
  withAlpha(lIn, () => { ctx.save(); ctx.translate(0, (1 - lIn) * 16); lord(LORD.x, LORD.y); ctx.restore(); label('der Herr', LORD.x, LORD.y - 62, { size: 24 }); });
  for (let i = 0; i < 6; i++) {
    const a = 17.6 + i * 0.42, p = seg(t, a, a + 0.9);
    if (p <= 0) continue;
    const [x0, y0] = [LORD.x - 22, LORD.y + 88], [x1, y1] = [SING.x + 44 + (i % 3) * 16, 694 - Math.floor(i / 3) * 9];
    const e = eio(p);
    withAlpha(seg(p, 0, 0.1), () => coin(lerp(x0, x1, e), lerp(y0, y1, e) - Math.sin(Math.PI * e) * 210, 8));
  }
}

// ---------- scene B: the round ----------
const WH = { x: 432, y: 455, R: 232, r: 62, hub: 80 };
const STATIONS = ['loben', 'dienen', 'hoffen', 'kein Lohn', 'klagen'];
const ST_T = [21.0, 25.1, 29.2, 33.3, 37.4];
const angOf = (i) => -Math.PI / 2 + (i * TAU) / 5;
const stPos = (i) => [WH.x + Math.cos(angOf(i)) * WH.R, WH.y + Math.sin(angOf(i)) * WH.R];
const SPIN = [41.5, 44.6];

/** The pointer's angle along the rim, unwrapped (it keeps growing on the second lap). */
function pointerAngle(t) {
  let a = angOf(0);
  for (let i = 1; i < 5; i++) a = lerp(a, angOf(i), eio(seg(t, ST_T[i] - 0.25, ST_T[i] + 0.45)));
  const extra = TAU / 5 + TAU;
  return a + extra * eio(seg(t, SPIN[0], SPIN[1]));
}

function icon(i, x, y, s = 1, on = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.globalAlpha *= lerp(0.3, 1, on);
  if (i === 0) { // loben: neumes on a red staff
    ctx.strokeStyle = C.red; ctx.lineWidth = 2;
    for (let l = 0; l < 4; l++) { ctx.beginPath(); ctx.moveTo(-34, -15 + l * 10); ctx.lineTo(34, -15 + l * 10); ctx.stroke(); }
    ctx.fillStyle = C.ink;
    for (const [nx, ny] of [[-22, 0], [-6, -10], [10, -5], [24, 5]]) ctx.fillRect(nx - 6, ny - 5, 12, 10);
    ctx.fillRect(28, 5, 3, 22);
  } else if (i === 1) { // dienen: a kneeling man, hands raised
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const limb = (pts, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([px, py], j) => (j ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke(); };
    for (const [w, col] of [[13, C.ink], [8, C.blue]]) {
      limb([[-8, -14], [-2, 10]], w + 4, col);
      limb([[-2, 10], [16, 12], [16, 30]], w, col);
      limb([[-2, 10], [-10, 30], [-26, 30]], w, col);
      limb([[-6, -10], [10, -16], [22, -26]], w - 2, col);
    }
    circle(22, -27, 5, C.skin, 1.5);
    circle(-11, -26, 10, C.skin, 2);
    ctx.fillStyle = C.hair; ctx.beginPath(); ctx.arc(-11, -28, 10, Math.PI * 0.9, Math.PI * 1.9); ctx.fill();
  } else if (i === 2) { // hoffen: a heart with rays
    ctx.beginPath(); ctx.moveTo(0, 22); ctx.bezierCurveTo(-34, -2, -22, -30, 0, -14); ctx.bezierCurveTo(22, -30, 34, -2, 0, 22); ctx.closePath();
    ctx.fillStyle = C.red; ctx.fill(); outline(2.5);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (const a of [-2.2, -1.57, -0.94]) { ctx.beginPath(); ctx.moveTo(Math.cos(a) * 32, -6 + Math.sin(a) * 32); ctx.lineTo(Math.cos(a) * 44, -6 + Math.sin(a) * 44); ctx.stroke(); }
  } else if (i === 3) { // kein Lohn: an empty bowl, struck through
    ctx.beginPath(); ctx.moveTo(-30, -2); ctx.quadraticCurveTo(0, 40, 30, -2); ctx.closePath();
    ctx.fillStyle = C.gold; ctx.fill(); outline(2.5);
    ctx.beginPath(); ctx.ellipse(0, -2, 30, 7, 0, 0, TAU); ctx.fillStyle = C.goldDeep; ctx.fill(); outline(2);
    ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-34, -32); ctx.lineTo(34, 30); ctx.stroke();
  } else { // klagen: tears
    const tear = (tx, ty, ts) => { ctx.beginPath(); ctx.moveTo(tx, ty - 26 * ts); ctx.bezierCurveTo(tx + 18 * ts, ty - 2 * ts, tx + 16 * ts, ty + 16 * ts, tx, ty + 16 * ts); ctx.bezierCurveTo(tx - 16 * ts, ty + 16 * ts, tx - 18 * ts, ty - 2 * ts, tx, ty - 26 * ts); ctx.closePath(); ctx.fillStyle = C.blue; ctx.fill(); outline(2.5); };
    tear(-8, 2, 1); tear(18, 12, 0.55);
  }
  ctx.restore();
}

function sceneB(t) {
  const pa = pointerAngle(t);
  // spokes, rim and hub
  ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) { const [x, y] = stPos(i); ctx.beginPath(); ctx.moveTo(WH.x, WH.y); ctx.lineTo(x, y); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(WH.x, WH.y, WH.R + 9, 0, TAU); outline(2.5);
  ctx.beginPath(); ctx.arc(WH.x, WH.y, WH.R - 9, 0, TAU); outline(2.5);
  ctx.fillStyle = C.red; for (let i = 0; i < 60; i++) { const a = (i * TAU) / 60; ctx.beginPath(); ctx.arc(WH.x + Math.cos(a) * WH.R, WH.y + Math.sin(a) * WH.R, 2.2, 0, TAU); ctx.fill(); }
  // the path walked so far, in red
  const a0 = angOf(0), a1 = Math.min(pa, a0 + TAU - 0.001);
  if (t > ST_T[0] + 0.1) {
    ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(WH.x, WH.y, WH.R, a0, a1); ctx.stroke();
  }
  // hub: the lady at the centre of it all
  ctx.save(); ctx.beginPath(); ctx.arc(WH.x, WH.y, WH.hub, 0, TAU); ctx.fillStyle = C.blueDeep; ctx.fill(); ctx.clip();
  for (const [sx, sy] of [[-50, -40], [48, -46], [-58, 18], [56, 22], [-24, -62], [26, -64]]) star(WH.x + sx, WH.y + sy, 6, C.goldLight);
  ladyBust(WH.x, WH.y - 14, 1.05, { look: 1, rose: false });
  ctx.restore();
  ctx.beginPath(); ctx.arc(WH.x, WH.y, WH.hub, 0, TAU); ctx.strokeStyle = C.gold; ctx.lineWidth = 7; ctx.stroke(); outline(2);
  // the pointer: a gold arrowhead running along the rim, passing behind the stations
  withAlpha(seg(t, ST_T[0] - 0.2, ST_T[0] + 0.2), () => {
    const px = WH.x + Math.cos(pa) * WH.R, py = WH.y + Math.sin(pa) * WH.R;
    ctx.save(); ctx.translate(px, py); ctx.rotate(pa + Math.PI / 2);
    ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-12, -15); ctx.lineTo(-5, 0); ctx.lineTo(-12, 15); ctx.closePath();
    ctx.fillStyle = C.goldLight; ctx.fill(); outline(2.5);
    ctx.restore();
  });
  // stations
  for (let i = 0; i < 5; i++) {
    const [x, y] = stPos(i);
    const on = eout(seg(t, ST_T[i], ST_T[i] + 0.4));
    // a glint as the pointer passes on the second lap
    const lapA = angOf(i) + TAU;
    const glint = Math.max(0, 1 - Math.abs(pa - lapA) / 0.5) * seg(t, SPIN[0], SPIN[0] + 0.2);
    const cur = i === activeStation(t) && t < SPIN[0] ? 1 : 0;
    const pop = 1 + 0.08 * back(seg(t, ST_T[i], ST_T[i] + 0.45)) * (1 - seg(t, ST_T[i] + 0.45, ST_T[i] + 0.9)) + 0.06 * glint;
    ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
    ctx.beginPath(); ctx.arc(0, 0, WH.r, 0, TAU); ctx.fillStyle = C.paper; ctx.fill();
    if (on > 0) { ctx.strokeStyle = C.gold; ctx.lineWidth = 9 * on; ctx.stroke(); }
    if (cur || glint > 0) { ctx.strokeStyle = `rgba(180,54,31,${Math.max(cur * 0.9, glint)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, WH.r + 9, 0, TAU); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, 0, WH.r, 0, TAU); outline(3);
    icon(i, 0, 2, 1.05, on);
    ctx.restore();
    withAlpha(lerp(0.45, 1, on), () => label(STATIONS[i], x, y + WH.r + 30, { size: 25, color: on > 0.5 ? C.red : C.inkSoft }));
  }
}
function activeStation(t) { let a = -1; for (let i = 0; i < 5; i++) if (t >= ST_T[i]) a = i; return a; }

// ---------- scene C: why ----------
const VIRTUES = [['triuwe', 'Treue'], ['stæte', 'Beständigkeit'], ['diemüete', 'Demut'], ['hôher muot', 'Hochstimmung']];
function sceneC(t) {
  ground();
  const better = seg(t, 46.0, 49.0);
  singer(SING.x, SING.fy, t, { play: 1, sing: 0.5 + 0.5 * Math.sin(t * 6.3), halo: eio(better) * (0.7 + 0.3 * Math.sin(t * 2)) });
  label('der Sänger', SING.x, 744);
  withAlpha(span(t, 45.7, 50.3, 0.4, 0.4), () => {
    font(700, 44); text('Tugenden', 575, 194, { color: C.red, align: 'center', base: 'middle' });
    font(500, 28); text('(gute Eigenschaften)', 575, 236, { color: C.inkSoft, align: 'center', base: 'middle' });
    VIRTUES.forEach(([mhd, nhd], i) => {
      const a = 46.0 + i * 0.6, p = eout(seg(t, a, a + 0.5));
      withAlpha(p, () => {
        const y = 318 + i * 96, x = 575 + (1 - p) * 30;
        ribbon(x, y, 420, 62);
        font(700, 31); text(mhd, x - 186, y - 1, { color: C.red, base: 'middle' });
        font(600, 31); text(nhd, x + 186, y - 1, { color: C.ink, align: 'right', base: 'middle' });
      });
    });
  });
  // his reward: standing at court
  const cIn = eout(seg(t, 50.2, 50.9));
  bench(cIn, t * 1.6);
  withAlpha(cIn, () => { lord(LORD.x, LORD.y); label('der Hof', COURT_LABEL, 744); label('der Herr', LORD.x, LORD.y - 62, { size: 24 }); });
  withAlpha(span(t, 50.6, 54.8, 0.4, 0.3), () => {
    // applause marks above the listeners, and a gold star over the singer
    for (const [i, b] of [...BENCH, { x: LORD.x }].entries()) {
      const ph = (t * 2.4 + i * 0.37) % 1;
      withAlpha(1 - ph, () => {
        ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(b.x + d * 14, 520 - ph * 24); ctx.lineTo(b.x + d * 20, 506 - ph * 24); ctx.stroke(); }
      });
    }
    const s = 18 + 3 * Math.sin(t * 4);
    star(SING.x + 4, SING.fy - 286, s * eout(seg(t, 50.6, 51.2)), C.gold);
    font(700, 34); text('Ansehen', SING.x + 4, SING.fy - 324, { color: C.red, align: 'center', base: 'middle' });
  });
}

// ---------- scene D: end card ----------
function sceneD(t) {
  const p = eout(seg(t, 54.7, 55.4));
  withAlpha(p, () => {
    ctx.save(); ctx.translate(W / 2, 430 + (1 - p) * 20);
    const bw = 620, bh = 440;
    ctx.fillStyle = C.paper; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 8; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
    ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.strokeRect(-bw / 2 + 12, -bh / 2 + 12, bw - 24, bh - 24);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(-bw / 2 - 4, -bh / 2 - 4, bw + 8, bh + 8);
    font(400, 80, TITLE); text('Hohe Minne', 0, -112, { color: C.red, align: 'center', base: 'middle' });
    font(600, 40); text('ein Spiel mit festen Regeln', 0, -36, { color: C.ink, align: 'center', base: 'middle' });
    for (let i = 0; i < 5; i++) {
      const x = -224 + i * 112, y = 82;
      ctx.beginPath(); ctx.arc(x, y, 40, 0, TAU); ctx.fillStyle = C.parchLight; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.stroke(); outline(2);
      icon(i, x, y + 1, 0.66, 1);
      if (i < 4) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(x + 50, y - 7); ctx.lineTo(x + 62, y); ctx.lineTo(x + 50, y + 7); ctx.closePath(); ctx.fill(); }
      font(700, 21); text(STATIONS[i], x, y + 62, { color: C.ink, align: 'center', base: 'middle' });
    }
    ctx.restore();
    font(500, 25);
    text('Quellen: Wikipedia, „Hohe Minne“,', W / 2, 840, { color: C.inkSoft, align: 'center', base: 'middle' });
    text('„Minnesang“ und „Ritterlichkeit“', W / 2, 874, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- captions, with balanced lines ----------
const CAP = { size: 44, lh: 54, weight: 700, maxW: 736 };
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
    k.captions(t, [cue], { x: W / 2, y: 832, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.red, '~': C.green } });
  }
}

Kit.scene({
  width: W, height: H, duration: 58.5,
  fonts: [
    { family: TITLE, file: 'UncialAntiqua.woff2', weight: '400' },
    { family: TEXT, file: 'EBGaramond.woff2', weight: '400 800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    const scenes = [[sceneA, T.A, 0, 0.35], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D, 0.4, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
