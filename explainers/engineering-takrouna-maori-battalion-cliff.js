// Explainer for engineering-takrouna-maori-battalion-cliff (Tunisia 1943, Visit): Takrouna, the Berber village on a
// rock near Enfidha, which New Zealand troops attacked on 19–21 April 1943, and what a visitor sees there today.
// Look: the rock drawn in profile against a dawn sky, whitewashed houses on top, an olive plain; the climb as a dotted
// line of small figures; then the village today, Enfidaville War Cemetery and a schematic map. Alegreya for titles,
// Alegreya Sans for captions and labels.
//
// Facts:
// - Wikipedia, "Takrouna": a hill village about 200 m above sea level (36°09′00″N 10°19′39″E), overlooking the Gulf
//   of Hammamet, Hergla and Sousse to the east; on 19 April 1943 New Zealand forces prepared to assault it, held by
//   the Italian 66th regiment, elements of the Folgore paratroop division, Granatieri and one German company; at dawn
//   on 20 April Lance-Sergeant Haane Te Rauawa Manahi led a platoon up the hill; the New Zealanders lost the hill to a
//   second counter-attack on 21 April, and Manahi retook the ledge and then the village. The last major action by New
//   Zealand troops in North Africa.
// - Wikipedia, "Haane Manahi" (after J. F. Cody, 28 Maori Battalion, 1956, and P. Moon, Victoria Cross at Takrouna,
//   2010): Manahi's party overwhelmed the Italians defending the ledge; recommended for the Victoria Cross for 19–21
//   April 1943, with the support of four generals, but downgraded to the Distinguished Conduct Medal (London Gazette,
//   22 July 1943); in March 2007 Prince Andrew presented an altar cloth, a letter from the Queen and a ceremonial
//   sword to Manahi's sons in Rotorua. 28maoribattalion.org.nz (search excerpt): on the night of 19/20 April a handful
//   of B Company men led by Manahi scaled a sheer cliff face.
// - Le Petit Journal Tunis (May 2021): the rock rises to 200 m; stone houses with vaulted rooms and small courtyards;
//   the zaouia (shrine) of Sidi Abdelkader El Jilani, the village's patron saint; a 13th-century mosque.
// - CWGC text (as reproduced by ww2cemeteries.com): Enfidaville War Cemetery is 1 km west of the town centre on the
//   road to Zaghouan; 1,551 Commonwealth burials of the Second World War, 88 unidentified; most of those buried died
//   in the final battles from March to the beginning of May 1943; the Eighth Army took Enfidaville on 19 April.
// - Wikipedia coordinates: Enfidha 36.1353 N 10.3808 E; Hergla 36.0333 N 10.5000 E. The map is schematic.
// The rock's profile, the ledge and the route are schematic, not a survey.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  Takrouna on its rock; the Axis front of April 1943.
//  B  9.6–23.2  19 April: the attack; night; the cliff; Manahi's party climbs at dawn.
//  C 23.4–32.4  The ledge taken, lost on 21 April, retaken; the village.
//  D 32.6–41.6  Victoria Cross recommended, Distinguished Conduct Medal awarded; Rotorua, 2007.
//  E 41.8–50.8  The village today: on foot, vaulted houses, the shrine, the view east.
//  F 51.0–60.0  Enfidaville War Cemetery.
//  G 60.2–65.2  On the summit: step back from the edge and the cliff drops out of sight.
const W = 864, H = 1080, CX = W / 2;
const { seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky0: '#141a2e', sky1: '#2a2f4f', sky2: '#9a5f5c', sky3: '#e0a868',
  rock: '#c7a77a', rock2: '#9c7e57', rockShade: '#6f5a40', house: '#efe6d6', door: '#3d6f9e',
  plain: '#4a4a30', olive: '#6d7246', ink: '#fbf3e4', soft: 'rgba(251,243,228,0.78)', faint: 'rgba(251,243,228,0.25)',
  gold: '#f2c35b', teal: '#7fd1c7', red: '#e2725b', nz: '#9fd3ff', axis: '#d9a0a0', stone: '#e8e2d4', grass: '#3f5a3a',
};
const TITLE = 'Alegreya', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const ROCK_M = 200; // the rock "culmine à 200 mètres" (Le Petit Journal); Wikipedia: about 200 m above sea level
const GRAVES = 1551, UNIDENTIFIED = 88; // CWGC
const CEMETERY_KM = 1; // west of Enfidha's centre
const PLACES = { takrouna: [36.15, 10.3275], enfidha: [36.1353, 10.3808], hergla: [36.0333, 10.5] };
const LAT0 = 36.1, KM_LON = 111.32 * Math.cos((LAT0 * Math.PI) / 180), KM_LAT = 110.57;
const km = ([la, lo]) => [(lo - 10.3275) * KM_LON, (la - 36.15) * KM_LAT];
const dist = (a, b) => { const [x1, y1] = km(a), [x2, y2] = km(b); return Math.hypot(x2 - x1, y2 - y1); };
const TO_ENFIDHA = dist(PLACES.takrouna, PLACES.enfidha), TO_HERGLA = dist(PLACES.takrouna, PLACES.hergla);
if (Math.round(TO_ENFIDHA) !== 5 || Math.round(TO_HERGLA) !== 20) throw new Error('distances');

// ---------- the rock in profile ----------
const BASE = 640; // the plain
// left slope (gentle, stepped), summit plateau, right side: the cliff, then a scree foot
const ROCK = [[110, BASE], [190, 590], [250, 540], [300, 470], [338, 430], [360, 360], [392, 318], [420, 262], [520, 258], [548, 266], [552, 330], [560, 352], [606, 362], [612, 420], [622, 520], [660, 590], [720, BASE]];
const LEDGE = [560, 352, 606]; // x from, y, x to
const EDGE = [548, 266]; // the summit's cliff edge
function rockPath() { ctx.beginPath(); ctx.moveTo(ROCK[0][0], ROCK[0][1]); for (const [x, y] of ROCK) ctx.lineTo(x, y); ctx.closePath(); }
function houses(t, a = 1, s = 1, ox = 0, oy = 0) {
  A(a, () => {
    const hs = [[426, 262, 30, 26], [454, 260, 26, 34], [478, 262, 34, 24], [506, 260, 22, 30], [396, 318, 26, 22], [372, 360, 22, 20], [566, 352, 24, 20]];
    for (const [x, y, w, h] of hs) {
      const X = ox + x * s, Y = oy + y * s, ww = w * s, hh = h * s;
      ctx.fillStyle = C.house; ctx.fillRect(X, Y - hh, ww, hh);
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(X + ww * 0.7, Y - hh, ww * 0.3, hh);
      ctx.fillStyle = C.door; ctx.fillRect(X + ww * 0.35, Y - hh * 0.5, ww * 0.22, hh * 0.5);
    }
    // the shrine's dome
    const dx = ox + 500 * s, dy = oy + 226 * s;
    ctx.fillStyle = C.house; ctx.fillRect(dx - 14 * s, dy, 28 * s, 34 * s);
    ctx.beginPath(); ctx.arc(dx, dy, 14 * s, Math.PI, 0); ctx.fill();
  });
}
function rock(t, { cliff = 0, ledge = 0 } = {}) {
  const g = ctx.createLinearGradient(0, 250, 0, BASE); g.addColorStop(0, C.rock); g.addColorStop(1, C.rock2);
  ctx.fillStyle = g; rockPath(); ctx.fill();
  // shade on the cliff face
  ctx.fillStyle = C.rockShade;
  ctx.beginPath(); ctx.moveTo(548, 266); ctx.lineTo(552, 330); ctx.lineTo(560, 352); ctx.lineTo(606, 362); ctx.lineTo(612, 420); ctx.lineTo(622, 520); ctx.lineTo(600, 520); ctx.lineTo(592, 420); ctx.lineTo(586, 372); ctx.lineTo(540, 360); ctx.lineTo(532, 300); ctx.closePath(); ctx.fill();
  // strata
  ctx.strokeStyle = 'rgba(70,52,34,0.25)'; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) { const y = 300 + i * 52; ctx.beginPath(); ctx.moveTo(lerp(330, 180, i / 6), y); ctx.lineTo(lerp(540, 640, i / 6), y + 6); ctx.stroke(); }
  if (cliff > 0) A(cliff, () => {
    ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(606, 362); ctx.lineTo(612, 420); ctx.lineTo(622, 520); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(548, 266); ctx.lineTo(552, 330); ctx.lineTo(560, 352); ctx.stroke();
  });
  if (ledge > 0) A(ledge, () => {
    ctx.strokeStyle = C.teal; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(LEDGE[0], LEDGE[1]); ctx.lineTo(LEDGE[2], LEDGE[1] + 8); ctx.stroke();
  });
}
function plain(dark = 0) {
  ctx.fillStyle = C.plain; ctx.fillRect(0, BASE, W, 150);
  ctx.fillStyle = C.olive;
  for (let r = 0; r < 4; r++) for (let i = 0; i < 18; i++) {
    const x = ((i * 53 + r * 27) % (W + 40)) - 20, y = BASE + 18 + r * 30;
    ctx.beginPath(); ctx.ellipse(x, y, 10 + r * 2, 6 + r, 0, 0, TAU); ctx.fill();
  }
  if (dark > 0) A(dark, () => { ctx.fillStyle = 'rgba(8,10,24,0.55)'; ctx.fillRect(0, BASE, W, 150); });
}
/** A small, plain figure: head and body. */
function person(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 15 * s, 4.6 * s, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 5 * s, y); ctx.lineTo(x - 3.6 * s, y - 10 * s); ctx.lineTo(x + 3.6 * s, y - 10 * s); ctx.lineTo(x + 5 * s, y); ctx.closePath(); ctx.fill();
}
const ROUTE = [[690, 640], [650, 600], [628, 540], [618, 470], [614, 410], [608, 366]]; // up the cliff to the ledge
function along(path, u) {
  const L = []; let tot = 0;
  for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); L.push(d); tot += d; }
  let d = u * tot;
  for (let i = 0; i < L.length; i++) { if (d <= L[i]) { const f = d / L[i]; return [lerp(path[i][0], path[i + 1][0], f), lerp(path[i][1], path[i + 1][1], f)]; } d -= L[i]; }
  return path.at(-1);
}

// ---------- background ----------
let bgDay = null, bgNight = null;
function paintSky(col) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, BASE); col.forEach((cc, i) => lg.addColorStop(i / (col.length - 1), cc));
  g.fillStyle = lg; g.fillRect(0, 0, W, BASE);
  g.fillStyle = C.plain; g.fillRect(0, BASE, W, 150);
  const dg = g.createLinearGradient(0, BASE + 140, 0, H); dg.addColorStop(0, '#1a1712'); dg.addColorStop(1, '#0d0c0a');
  g.fillStyle = dg; g.fillRect(0, BASE + 140, W, H - BASE - 140);
  return c;
}
function sky(night) {
  if (!bgDay) { bgDay = paintSky([C.sky0, C.sky1, C.sky2, C.sky3]); bgNight = paintSky(['#05060d', '#0b0f22', '#18203a', '#2a2f4f']); }
  ctx.drawImage(bgDay, 0, 0);
  if (night > 0) A(night, () => ctx.drawImage(bgNight, 0, 0));
}
const nightAt = (t) => seg(t, 13.6, 15.0) * (1 - seg(t, 19.0, 21.0));
function title(s, sub, a, y = 96, col = C.gold) {
  A(a, () => {
    font(800, 40, TITLE); text(s, CX, y, { align: 'center', base: 'middle', spacing: '2px' });
    if (sub) { font(500, 26); text(sub, CX, y + 44, { align: 'center', base: 'middle', color: col }); }
  });
}

// ---------- A, B, C: 1943 ----------
function scene1943(t) {
  A(span(t, 0, 32.6, 0.5, 0.4), () => {
    plain(nightAt(t));
    rock(t, { cliff: seg(t, 15.0, 16.0) * (1 - seg(t, 31.0, 32.4)), ledge: seg(t, 24.0, 24.8) });
    houses(t, 1);
    title('TAKROUNA', 'a village on a rock near Enfidha, Tunisia', seg(t, 0.6, 1.4) * (1 - seg(t, 9.0, 9.5)));
    // a scale bar
    A(seg(t, 1.6, 2.4) * (1 - seg(t, 9.0, 9.5)), () => {
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(60, BASE); ctx.lineTo(60, 262); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(50, 262); ctx.lineTo(70, 262); ctx.moveTo(50, BASE); ctx.lineTo(70, BASE); ctx.stroke();
      font(600, 24); text(`about ${ROCK_M} m`, 76, 440, { color: C.ink, base: 'middle' });
      font(400, 22); text('schematic', 76, 470, { color: C.soft, base: 'middle' });
    });
    // the Axis front, April 1943
    A(seg(t, 5.4, 6.2) * (1 - seg(t, 9.4, 9.8)), () => {
      ctx.strokeStyle = C.axis; ctx.lineWidth = 4; ctx.setLineDash([14, 10]);
      ctx.beginPath(); ctx.moveTo(30, 230); ctx.quadraticCurveTo(300, 190, 470, 236); ctx.quadraticCurveTo(640, 280, 840, 250); ctx.stroke(); ctx.setLineDash([]);
      font(700, 26); text('AXIS FRONT, APRIL 1943', 840, 180, { align: 'right', color: C.axis, base: 'middle', spacing: '1px' });
      font(400, 22); text('Italian and German troops · schematic', 840, 212, { align: 'right', color: C.ink, base: 'middle' });
    });
    // 19 April: the New Zealand Division
    A(seg(t, 9.8, 10.6) * (1 - seg(t, 13.6, 14.2)), () => {
      for (let i = 0; i < 3; i++) {
        const y = 690 + i * 22, x0 = 840, x1 = lerp(840, 700 - i * 30, eio(seg(t, 10.0 + i * 0.3, 12.4)));
        ctx.strokeStyle = C.nz; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
        ctx.fillStyle = C.nz; ctx.beginPath(); ctx.moveTo(x1 - 14, y); ctx.lineTo(x1 + 4, y - 9); ctx.lineTo(x1 + 4, y + 9); ctx.closePath(); ctx.fill();
      }
      font(700, 30, TITLE); text('19 APRIL 1943', CX, 110, { align: 'center', base: 'middle', color: C.nz, spacing: '2px' });
      font(500, 24); text('the New Zealand Division, Eighth Army', CX, 150, { align: 'center', base: 'middle', color: C.ink });
    });
    // night: stars; the cliff named
    A(nightAt(t), () => {
      ctx.fillStyle = 'rgba(255,255,240,0.8)';
      for (let i = 0; i < 40; i++) { const x = (i * 97) % W, y = 30 + ((i * 53) % 200); if (x < 740 || y > 120) ctx.fillRect(x, y, 2, 2); }
    });
    A(seg(t, 15.2, 16.0) * (1 - seg(t, 18.4, 18.8)), () => {
      font(700, 30, TITLE); text('THE CLIFF', 690, 450, { align: 'center', base: 'middle', color: C.gold, spacing: '2px' });
      font(500, 22); text('night of 19 to 20 April', 690, 488, { align: 'center', base: 'middle', color: C.ink });
    });
    // dawn, 20 April: the climb
    const climb = seg(t, 19.2, 23.0);
    A(seg(t, 18.8, 19.4) * (1 - seg(t, 32.0, 32.4)), () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([4, 10]);
      ctx.beginPath(); ROUTE.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < 5; i++) {
        const u = Math.max(0, Math.min(1, climb * 1.15 - i * 0.04));
        const [x, y] = along(ROUTE, u);
        person(x + 6, y, 0.9, C.nz);
      }
    });
    A(seg(t, 19.0, 19.8) * (1 - seg(t, 23.0, 23.4)), () => {
      font(700, 30, TITLE); text('DAWN, 20 APRIL', CX, 110, { align: 'center', base: 'middle', color: C.gold, spacing: '2px' });
      font(500, 24); text('Lance-Sergeant Haane Manahi, 28th Māori Battalion', CX, 150, { align: 'center', base: 'middle', color: C.ink });
    });
    // the ledge taken; lost on 21 April; retaken
    A(seg(t, 23.6, 24.4) * (1 - seg(t, 32.0, 32.4)), () => {
      font(700, 26); text('THE LEDGE', 660, 330, { align: 'left', base: 'middle', color: C.teal, spacing: '1px' });
      const lost = seg(t, 28.2, 28.8) * (1 - seg(t, 30.4, 31.0));
      const state = t < 28.2 ? 'taken, 20 April' : t < 30.4 ? 'lost, 21 April' : 'retaken, 21 April';
      font(500, 22); text(state, 660, 362, { align: 'left', base: 'middle', color: lost > 0.5 ? C.axis : C.ink });
    });
    A(seg(t, 28.2, 28.8) * (1 - seg(t, 30.4, 31.0)), () => {
      ctx.strokeStyle = C.axis; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(470, 240); ctx.quadraticCurveTo(540, 260, 580, 340); ctx.stroke();
      ctx.fillStyle = C.axis; ctx.beginPath(); ctx.moveTo(586, 352); ctx.lineTo(568, 336); ctx.lineTo(590, 330); ctx.closePath(); ctx.fill();
    });
    A(seg(t, 30.6, 31.4) * (1 - seg(t, 32.0, 32.4)), () => {
      font(700, 30, TITLE); text('THE VILLAGE', 470, 200, { align: 'center', base: 'middle', color: C.nz, spacing: '2px' });
    });
  });
}

// ---------- D: the medal; 2007 ----------
function card(x, y, w, h, col) {
  ctx.fillStyle = 'rgba(20,18,30,0.86)'; k.rrect(x, y, w, h, 18); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 3; k.rrect(x, y, w, h, 18); ctx.stroke();
}
function sceneMedal(t) {
  A(span(t, 32.4, 41.8, 0.4, 0.4), () => {
    A(0.35, () => { plain(0); rock(t); houses(t); });
    // the recommendation and what came instead
    A(seg(t, 32.8, 33.4), () => {
      card(92, 160, 680, 170, C.gold);
      font(500, 22); text('RECOMMENDED · 1943', CX, 196, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
      font(800, 40, TITLE); text('Victoria Cross', CX, 246, { align: 'center', base: 'middle', color: C.gold });
      font(500, 22); text('backed by four generals', CX, 292, { align: 'center', base: 'middle', color: C.soft });
      const cut = seg(t, 34.8, 35.6);
      if (cut > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(250, 246); ctx.lineTo(lerp(250, 614, cut), 246); ctx.stroke(); }
    });
    A(seg(t, 35.4, 36.2), () => {
      card(92, 360, 680, 150, C.teal);
      font(500, 22); text('AWARDED · 22 JULY 1943', CX, 396, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
      font(800, 36, TITLE); text('Distinguished Conduct Medal', CX, 444, { align: 'center', base: 'middle', color: C.teal });
    });
    // 2007: a sword and a letter
    A(seg(t, 37.4, 38.2), () => {
      card(92, 540, 680, 210, C.ink);
      // sword
      const sx = 230, sy = 640;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.5);
      ctx.fillStyle = '#d9dde3'; ctx.beginPath(); ctx.moveTo(-90, -5); ctx.lineTo(70, -5); ctx.lineTo(86, 0); ctx.lineTo(70, 5); ctx.lineTo(-90, 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.gold; ctx.fillRect(-98, -18, 8, 36); ctx.fillRect(-130, -5, 32, 10); ctx.beginPath(); ctx.arc(-134, 0, 8, 0, TAU); ctx.fill();
      ctx.restore();
      // letter
      ctx.fillStyle = C.stone; ctx.fillRect(330, 585, 90, 116);
      ctx.fillStyle = 'rgba(60,50,40,0.5)'; for (let i = 0; i < 6; i++) ctx.fillRect(342, 606 + i * 14, i === 5 ? 40 : 66, 4);
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(400, 686, 9, 0, TAU); ctx.fill();
      font(800, 34, TITLE); text('Rotorua, March 2007', 450, 610, { base: 'middle', color: C.ink });
      font(500, 22); text('a sword, a letter from the Queen', 450, 652, { base: 'middle', color: C.soft });
      text('and an altar cloth, for his family', 450, 682, { base: 'middle', color: C.soft });
    });
  });
}

// ---------- E: the village today ----------
function sceneToday(t) {
  A(span(t, 41.6, 51.0, 0.4, 0.4), () => {
    // zoom on the summit
    const z = eio(seg(t, 41.8, 43.4));
    const s = lerp(1, 1.9, z), ox = lerp(0, -440, z), oy = lerp(0, 120, z);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 780); ctx.clip(); ctx.translate(ox, oy); ctx.scale(s, s);
    plain(0); rock(t); houses(t);
    // the footpath zigzag
    A(seg(t, 43.4, 44.4), () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(300, 470); ctx.lineTo(352, 440); ctx.lineTo(330, 420); ctx.lineTo(372, 380); ctx.lineTo(360, 360); ctx.lineTo(394, 330); ctx.lineTo(420, 300); ctx.lineTo(440, 268); ctx.stroke(); ctx.setLineDash([]);
      const u = seg(t, 44.0, 46.2);
      const [px, py] = along([[300, 470], [352, 440], [330, 420], [372, 380], [360, 360], [394, 330], [420, 300], [440, 268]], u);
      person(px, py, 0.7, C.gold);
    });
    ctx.restore();
    title('TAKROUNA TODAY', 'on foot, up through the village', seg(t, 42.4, 43.2) * (1 - seg(t, 46.0, 46.4)));
    A(seg(t, 46.4, 47.2), () => {
      font(700, 30, TITLE); text('Shrine of Sidi Abdelkader', CX, 96, { align: 'center', base: 'middle', color: C.gold });
      font(500, 24); text('the village’s patron saint', CX, 136, { align: 'center', base: 'middle', color: C.soft });
      // the view east
      ctx.strokeStyle = C.teal; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(600, 220); ctx.lineTo(820, 220); ctx.stroke();
      ctx.fillStyle = C.teal; ctx.beginPath(); ctx.moveTo(836, 220); ctx.lineTo(816, 208); ctx.lineTo(816, 232); ctx.closePath(); ctx.fill();
      font(600, 24); text('east: the plain,', 600, 256, { base: 'middle', color: C.teal });
      text('Hergla and the sea', 600, 286, { base: 'middle', color: C.teal });
    });
  });
}

// ---------- F: the cemetery ----------
function sceneCemetery(t) {
  A(span(t, 50.8, 60.2, 0.4, 0.4), () => {
    ctx.fillStyle = C.grass; ctx.fillRect(0, 430, W, 350);
    // rows of headstones in perspective
    const rows = 9;
    const shown = seg(t, 51.4, 54.4);
    for (let r = rows - 1; r >= 0; r--) {
      const f = r / (rows - 1), y = lerp(460, 760, f), s = lerp(0.45, 1.2, f), n = Math.round(lerp(22, 9, f));
      const vis = Math.max(0, Math.min(1, shown * rows - (rows - 1 - r)));
      A(vis, () => {
        for (let i = 0; i < n; i++) {
          const x = CX + (i - (n - 1) / 2) * lerp(32, 84, f);
          ctx.fillStyle = C.stone; k.rrect(x - 13 * s, y - 40 * s, 26 * s, 40 * s, 10 * s); ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x + 6 * s, y - 34 * s, 7 * s, 34 * s);
        }
      });
    }
    // the Cross of Sacrifice
    A(seg(t, 52.0, 52.8), () => {
      ctx.fillStyle = C.stone; ctx.fillRect(CX - 7, 300, 14, 150); ctx.fillRect(CX - 36, 336, 72, 13); ctx.fillRect(CX - 30, 440, 60, 14);
    });
    A(seg(t, 51.2, 52.0), () => {
      font(800, 36, TITLE); text('ENFIDAVILLE WAR CEMETERY', CX, 110, { align: 'center', base: 'middle', color: C.ink, spacing: '1px' });
      font(500, 24); text(`${CEMETERY_KM} km west of Enfidha’s centre, on the Zaghouan road`, CX, 152, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 53.6, 54.4), () => {
      font(800, 52, TITLE); text(Kit.fmt(GRAVES), CX, 214, { align: 'center', base: 'middle', color: C.gold });
      font(500, 24); text(`Commonwealth war graves · ${Kit.fmt(UNIDENTIFIED)} unidentified · CWGC`, CX, 258, { align: 'center', base: 'middle', color: C.ink });
    });
    A(seg(t, 55.8, 56.6), () => {
      ctx.fillStyle = 'rgba(14,16,20,0.82)'; k.rrect(170, 690, 524, 66, 14); ctx.fill();
      font(600, 26); text('most died March to early May 1943', CX, 724, { align: 'center', base: 'middle', color: C.ink });
    });
  });
}

// ---------- G: map; step back from the edge ----------
function sceneEnd(t) {
  A(span(t, 60.0, 65.2, 0.4, 0), () => {
    plain(0); rock(t); houses(t);
    // the observer on the summit steps back; what the sight line over the edge hides
    const back = eio(seg(t, 61.0, 63.4));
    const ex = lerp(EDGE[0] - 4, EDGE[0] - 120, back), ey = EDGE[1] - 30;
    const [gx, gy] = [EDGE[0] + (EDGE[0] - ex) * ((BASE - EDGE[1]) / (EDGE[1] - ey)), BASE];
    A(seg(t, 60.4, 61.0), () => {
      const gxx = Math.min(gx, 2000), gyy = gx > 2000 ? EDGE[1] + (BASE - EDGE[1]) * ((2000 - EDGE[0]) / (gx - EDGE[0])) : gy;
      ctx.fillStyle = 'rgba(16,10,30,0.5)';
      ctx.beginPath(); ctx.moveTo(EDGE[0], EDGE[1]); ctx.lineTo(gxx, gyy); ctx.lineTo(gxx, BASE); ctx.lineTo(720, BASE); ctx.lineTo(660, 590); ctx.lineTo(622, 520); ctx.lineTo(612, 420); ctx.lineTo(606, 362); ctx.lineTo(560, 352); ctx.lineTo(552, 330); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(gxx, gyy); ctx.stroke(); ctx.setLineDash([]);
      person(ex, ey + 30, 1.3, C.gold);
      ctx.fillStyle = 'rgba(14,16,24,0.8)'; k.rrect(640, 440, 200, 80, 12); ctx.fill();
      font(700, 26); text('out of sight', 740, 468, { align: 'center', base: 'middle', color: C.red });
      font(500, 22); text('from a step back', 740, 500, { align: 'center', base: 'middle', color: C.ink });
    });
    // a small schematic map
    A(seg(t, 60.6, 61.4), () => {
      const mx = 24, my = 40, mw = 330, mh = 290, sc = 12.3; // pixels per km
      ctx.fillStyle = 'rgba(14,16,24,0.82)'; k.rrect(mx, my, mw, mh, 14); ctx.fill();
      const P = (p) => { const [x, y] = km(p); return [mx + 50 + x * sc, my + 60 - y * sc]; };
      // the sea east of Hergla, schematic
      const [hx] = P(PLACES.hergla);
      ctx.fillStyle = 'rgba(80,140,190,0.45)'; ctx.fillRect(hx + 8, my, mx + mw - hx - 8, mh);
      const dotAt = (p, col, label, dx = 10, dy = -12) => { const [x, y] = P(p); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill(); font(600, 22); text(label, x + dx, y + dy, { base: 'middle', color: col }); };
      dotAt(PLACES.takrouna, C.gold, 'Takrouna', -30, -20);
      dotAt(PLACES.enfidha, C.ink, 'Enfidha', -30, 26);
      dotAt(PLACES.hergla, C.teal, 'Hergla', -86, -16);
      font(500, 22); text('sea', mx + mw - 46, my + 30, { base: 'middle', color: C.ink });
      font(400, 22); text(`to Enfidha: about ${Kit.fmt(Math.round(TO_ENFIDHA))} km`, mx + 16, my + mh - 46, { base: 'middle', color: C.soft });
      text('schematic map', mx + 16, my + mh - 20, { base: 'middle', color: C.soft });
    });
  });
}

const CUES = [
  [0.4, 4.8, 'Near Enfidha, in Tunisia, the village of *Takrouna* stands on top of a steep rock.'],
  [5.0, 9.4, 'In April 1943 it was part of the Axis’s last front in Tunisia, held by Italian and German troops.'],
  [9.6, 14.0, 'On 19 April 1943 the *New Zealand Division*, part of Britain’s Eighth Army, prepared to attack.'],
  [14.2, 18.6, 'The attack went in that night. On one side, the rock ends in a *sheer cliff*.'],
  [18.8, 23.2, 'At dawn, Lance-Sergeant *Haane Manahi* of the 28th Māori Battalion led a few men up it.'],
  [23.4, 27.8, 'They took the ~ledge~ below the summit from the Italian soldiers holding it.'],
  [28.0, 32.4, 'On 21 April a counter-attack retook the ledge; Manahi helped win it back, then the village.'],
  [32.6, 37.0, 'Four generals backed him for the *Victoria Cross*. London gave him a lesser medal instead.'],
  [37.2, 41.6, 'In 2007 Prince Andrew gave his sons a sword and a letter from the Queen, in Rotorua, New Zealand.'],
  [41.8, 46.2, 'Today you climb Takrouna *on foot*, past stone houses with vaulted rooms.'],
  [46.4, 50.8, 'Near the top is the shrine of ~Sidi Abdelkader~. The plain runs east to the sea.'],
  [51.0, 55.4, `In Enfidha, 1 km west of the centre, is *Enfidaville War Cemetery*: ${Kit.fmt(GRAVES)} graves.`],
  [55.6, 60.0, 'Most of the men buried there died in the last battles, from March to early May 1943.'],
  [60.2, 64.6, 'On the summit, step back from the edge, and the cliff they climbed drops out of sight.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    sky(t < 33 ? nightAt(t) : 0);
    scene1943(t);
    sceneMedal(t);
    sceneToday(t);
    sceneCemetery(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.teal } });
  },
});
