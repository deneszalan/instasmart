// Explainer for earth-san-clemente-three-levels (Roma): under the Basilica of San Clemente in Rome lie a church of
// the 4th century and, below it, Roman buildings of the 1st and 2nd centuries with a temple of Mithras, because each
// time the site was rebuilt the old buildings were filled with earth and rubble and used as foundations. Look: a
// cutaway section through the ground, from today's church down to an underground stream; each era is built, then
// buried by a rising layer of rubble. IBM Plex Mono for dates and labels (like an excavation log), Fraunces for
// captions.
//
// Facts:
// - basilicasanclemente.com (History; The Basilica and the Excavations): three levels: the present 12th-century
//   basilica, the older 4th-century basilica below it, and 1st-century buildings below that; excavations revealed
//   buildings destroyed in the fire of AD 64; the ruins were abandoned, filled with earth and used as foundations;
//   two 1st-century buildings separated by a narrow lane were built at a level more or less that of the floor of the
//   Colosseum today; around the end of the 2nd century an underground area became a Mithraic temple, installed in a
//   semi-subterranean gallery of a 1st-century house; the lower basilica was abandoned about 1100, filled with rubble
//   to the height of its capitals, and its walls used to build the smaller 12th-century basilica; in 1857 the prior,
//   Father Joseph Mullooly, realised the ground level had been much deeper and excavated (1857–1870); in 1912–14
//   Father Louis Nolan built a drainage tunnel between San Clemente and the Colosseum to carry away water flooding
//   the lower levels; "the lost waters of ancient Rome" flow round the foundations of the 1st-century public building.
// - Wikipedia, "San Clemente, Rome": the present basilica was rebuilt by Cardinal Anastasius, c. 1099–c. 1120; a
//   mithraeum was built c. 200 in the courtyard of the insula; its main room, about 9.6 m by 6 m, was found in 1867
//   but could not be investigated until 1914 for lack of drainage; its altar shows the tauroctony, Mithras slaying a
//   bull; its apse was trimmed with pumice to look more like a cave; in the 4th century the lower level of the
//   industrial building was filled with dirt and rubble, and the domus's lowest floor with the mithraeum was filled
//   in; the "first basilica" existed in 392, when St Jerome wrote of the church of St Clement.
// - Jerome, De viris illustribus 15 (quoted in Italian Wikipedia): "nominis eius memoriam usque hodie Romae exstructa
//   ecclesia custodit", a church built in Rome guards the memory of his name to this day.
// - Italian Wikipedia, "Basilica di San Clemente al Laterano" (citing Junyent 1930): the old basilica was demolished
//   in its upper part and filled in to about 4 m, its old structures used as foundations of the new.
// - turismoroma.it, "Mitreo di San Clemente": the mithraeum was set up at the end of the 2nd or start of the 3rd
//   century, abandoned at the end of the 4th century, and the whole complex filled in.
// - Subterranea Britannica, "Basilica of St Clement" (2025): at the deepest level can be heard the flow of an
//   underground stream.
// Not given here: the depth of each level below the street, for which no consistent reliable figure was found; the
// section is schematic except that the last rebuilding raised the floor by about 4 m.
//
// Scene plan (62.4 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: today's church near the Colosseum; the section opens on two levels below.
//  B  9.2–18.0  AD 64: fire, earth fill, two Roman buildings on top.
//  C 18.0–26.8  The Mithraeum: a cave-like room, an altar with Mithras and the bull.
//  D 26.8–35.6  4th century: the Roman floors filled, a church built above; St Jerome, 392.
//  E 35.6–44.4  c. 1100: rubble to the column tops, a new church about 4 m higher.
//  F 44.4–53.2  Deeper is older; 1857, Father Mullooly digs.
//  G 53.2–62.4  The flood, the 1912–14 tunnel, the stream still heard.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  earth: '#1b1511', earth2: '#2a2019', ink: '#f3e9d6', soft: 'rgba(243,233,214,0.72)', faint: 'rgba(243,233,214,0.25)',
  upper: '#e9dcc0', upperDark: '#c9b993', lower: '#bfae8d', lowerDark: '#8f7f63', tufa: '#c9a86a', tufaDark: '#9a7c45',
  brick: '#a4553a', rubble: '#6a5d4d', fire: '#f08a3c', fire2: '#ffd27a', water: '#4fa3c7', water2: '#8fd0ea',
  fresco: '#b4472f', amber: '#f0b35a', green: '#7fae6a', sky: '#24303f',
};
const MONO = 'IBM Plex Mono', SERIF = 'Fraunces';

let k, ctx;
const font = (w, s, f = MONO) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the section, in canvas pixels (schematic; 30 px ≈ 1 m only for the last rise) ----------
const PX_PER_M = 30;
const RISE_1100 = 4; // m, the fill of about 1100 (Junyent 1930, via Italian Wikipedia)
const STREET = 290;                       // floor of today's church
const LOWER = STREET + RISE_1100 * PX_PER_M; // floor of the 4th-century church: 410
const ROMAN = 600;                        // floor of the 1st–2nd-century level
const OLDEST = 680;                       // ruins of before AD 64
const L = 232, R = 800;                   // the section's left and right edges
const LANE = [430, 462];                  // the narrow lane between the two Roman buildings
if (LOWER !== 410) throw new Error('layout');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'The *Basilica of San Clemente* stands near Rome’s Colosseum. Beneath it lie two older levels.'],
  [4.8, 9.0, 'Today’s church was built around 1100. Stairs lead down beneath it, ~level by level~.'],
  [9.2, 13.4, 'The story starts at the bottom: in the great fire of *AD 64*, the buildings here burned.'],
  [13.6, 17.8, 'Their ruins were filled with earth, and two new Roman buildings rose on top.'],
  [18.0, 22.2, 'Around AD 200, a room in one of them became a *Mithraeum*, a temple of the god Mithras.'],
  [22.4, 26.6, 'His followers met in a cave-like room. The altar shows Mithras killing a bull.'],
  [26.8, 31.0, 'In the 4th century the lower floors were filled with rubble, and a church built above.'],
  [31.2, 35.4, 'The scholar Saint Jerome wrote of this church of Saint Clement in *AD 392*.'],
  [35.6, 39.8, 'Around 1100, that church was filled with rubble up to the ~tops of its columns~.'],
  [40.0, 44.2, `Its walls became the foundations of a new church, with a floor about *${RISE_1100} metres* higher.`],
  [44.4, 48.6, 'Each rebuilding buried the floor below it: the deeper you go, the ~older~ the level.'],
  [48.8, 53.0, 'In 1857 the prior, Father *Joseph Mullooly*, began digging out the buried church.'],
  [53.2, 57.4, 'Water flooded the lowest level, until in 1912–14 a tunnel drained it to the Colosseum.'],
  [57.6, 61.8, 'At the deepest level you can still hear an ~underground stream~ running.'],
];

// ---------- seeded randomness and textures ----------
let seed = 3;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
let bg = null, rubbleTex = null, earthTex = null;
function paintTextures() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  let g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sky); lg.addColorStop(0.23, C.earth2); lg.addColorStop(1, C.earth);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(200,170,130,${rnd() * 0.05})`; g.fillRect(rnd() * W, 260 + rnd() * 520, 2 + rnd() * 3, 2); }
  const tex = (col, stones) => {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const t = c.getContext('2d');
    t.fillStyle = col; t.fillRect(0, 0, W, H);
    for (let i = 0; i < stones; i++) {
      t.fillStyle = `rgba(${140 + rnd() * 50},${125 + rnd() * 45},${100 + rnd() * 40},${0.2 + rnd() * 0.3})`;
      t.beginPath(); t.ellipse(rnd() * W, rnd() * H, 2 + rnd() * 7, 2 + rnd() * 5, rnd() * 3, 0, TAU); t.fill();
    }
    return c;
  };
  rubbleTex = tex(C.rubble, 6000);
  earthTex = tex('#4a3b2c', 4000);
}
/** Fill a rectangle with a texture, rising from its bottom: p from 0 (empty) to 1 (full). */
function fillUp(tex, x0, y0, x1, y1, p) {
  if (p <= 0) return;
  const top = lerp(y1, y0, clamp(p));
  ctx.save(); ctx.beginPath(); ctx.rect(x0, top, x1 - x0, y1 - top); ctx.clip();
  ctx.globalAlpha *= 0.66; ctx.drawImage(tex, 0, 0); ctx.globalAlpha /= 0.66;
  ctx.strokeStyle = 'rgba(243,233,214,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x1, top); ctx.stroke();
  ctx.restore();
}

// ---------- the buildings ----------
function oldRuins(a) {
  A(a, () => {
    ctx.fillStyle = C.brick;
    for (const [x, h] of [[244, 50], [300, 34], [360, 58], [440, 28], [530, 46], [616, 38], [700, 54], [766, 30]]) ctx.fillRect(x, OLDEST - h, 22, h);
  });
}
function flames(t, a) {
  A(a, () => {
    for (let i = 0; i < 16; i++) {
      const x = 200 + i * 37, h = 40 + 30 * Math.sin(t * 9 + i * 1.7) + 20 * Math.sin(t * 13 + i);
      const g = ctx.createLinearGradient(0, OLDEST - h - 40, 0, OLDEST);
      g.addColorStop(0, 'rgba(255,210,122,0)'); g.addColorStop(0.5, C.fire2); g.addColorStop(1, C.fire);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x - 18, OLDEST); ctx.quadraticCurveTo(x - 10, OLDEST - h * 0.6, x, OLDEST - h - 30); ctx.quadraticCurveTo(x + 10, OLDEST - h * 0.6, x + 18, OLDEST); ctx.fill();
    }
  });
}
/** The 1st-century buildings: a tufa building with vaulted cells on the left, a house on the right. */
function romanLevel(grow, t) {
  const top = lerp(ROMAN, LOWER, eio(grow));
  if (grow <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(L, top, R - L, ROMAN - top); ctx.clip();
  // the tufa building
  ctx.fillStyle = C.tufa; ctx.fillRect(L, LOWER, LANE[0] - L, ROMAN - LOWER);
  ctx.strokeStyle = C.tufaDark; ctx.lineWidth = 1.5;
  for (let y = LOWER + 18; y < ROMAN; y += 18) { ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(LANE[0], y); ctx.stroke(); }
  for (let y = LOWER, r = 0; y < ROMAN; y += 18, r++) for (let x = L + (r % 2) * 22; x < LANE[0]; x += 44) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 18); ctx.stroke(); }
  ctx.fillStyle = C.earth2;
  for (let i = 0; i < 4; i++) { const x = L + 16 + i * 60; ctx.fillRect(x, LOWER + 90, 42, ROMAN - LOWER - 90); ctx.beginPath(); ctx.arc(x + 21, LOWER + 90, 21, Math.PI, TAU); ctx.fill(); }
  // the house, with its lower gallery
  ctx.fillStyle = C.brick; ctx.fillRect(LANE[1], LOWER, R - LANE[1], ROMAN - LOWER);
  ctx.strokeStyle = 'rgba(40,20,10,0.35)'; ctx.lineWidth = 1;
  for (let y = LOWER + 8; y < ROMAN; y += 8) { ctx.beginPath(); ctx.moveTo(LANE[1], y); ctx.lineTo(R, y); ctx.stroke(); }
  ctx.fillStyle = C.earth2; ctx.fillRect(LANE[1] + 18, LOWER + 24, 90, 70); // an upper room
  ctx.restore();
}
/** The Mithraeum: a vaulted room in the house's lower floor, with side benches and the altar at the far end. */
const MITH = { x0: 560, x1: 780, top: ROMAN - 98, floor: ROMAN };
function mithraeum(t, light) {
  const { x0, x1, top, floor } = MITH;
  ctx.fillStyle = '#2b1d15';
  ctx.beginPath(); ctx.moveTo(x0, floor); ctx.lineTo(x0, top + 30); ctx.quadraticCurveTo((x0 + x1) / 2, top - 30, x1, top + 30); ctx.lineTo(x1, floor); ctx.closePath(); ctx.fill();
  A(light, () => {
    const g = ctx.createRadialGradient(x1 - 40, floor - 40, 10, x1 - 40, floor - 40, 220);
    g.addColorStop(0, 'rgba(240,179,90,0.55)'); g.addColorStop(1, 'rgba(240,179,90,0)');
    ctx.fillStyle = g; ctx.fillRect(x0, top - 30, x1 - x0, floor - top + 30);
    // stars on the vault
    ctx.fillStyle = C.fire2;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(x0 + 24 + i * 22, top + 22 + 8 * Math.sin(i * 1.3), 2, 0, TAU); ctx.fill(); }
  });
  ctx.fillStyle = C.lowerDark; ctx.fillRect(x0 + 6, floor - 22, x1 - x0 - 70, 22); // the bench
  ctx.fillStyle = C.upper; ctx.fillRect(x1 - 52, floor - 46, 40, 46); // the altar
}
/** The altar, large: a tall marble block, the relief of Mithras kneeling on the bull, his cloak flying. */
function altarRelief(cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = C.upper;
  ctx.fillRect(-120, -150, 240, 26); // top moulding
  ctx.beginPath(); ctx.arc(-92, -168, 18, 0, TAU); ctx.arc(92, -168, 18, 0, TAU); ctx.fill(); // two small heads on top
  ctx.fillRect(-104, -124, 208, 230); // the block
  ctx.fillRect(-120, 106, 240, 30); // base
  ctx.strokeStyle = C.upperDark; ctx.lineWidth = 4; ctx.strokeRect(-104, -124, 208, 230);
  ctx.fillStyle = '#d8c9a8'; ctx.beginPath(); ctx.moveTo(-84, 96); ctx.lineTo(-84, -60); ctx.arc(0, -60, 84, Math.PI, TAU); ctx.lineTo(84, 96); ctx.closePath(); ctx.fill(); // the arched niche
  ctx.fillStyle = '#9d8b6a';
  // the bull, low, its head to the left
  ctx.beginPath(); ctx.ellipse(6, 62, 66, 24, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-62, 52, 18, 14, 0.4, 0, TAU); ctx.fill();
  // Mithras: cap, cloak blowing back, one knee on the bull, an arm pulling its head
  ctx.fillStyle = C.fresco; ctx.beginPath(); ctx.moveTo(4, -30); ctx.quadraticCurveTo(-50, -70, -70, -40); ctx.quadraticCurveTo(-40, -36, -6, -8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7a6a4e';
  ctx.beginPath(); ctx.ellipse(12, 0, 20, 34, 0.5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(20, -44, 14, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(8, -50); ctx.quadraticCurveTo(22, -76, 36, -48); ctx.closePath(); ctx.fill(); // Phrygian cap
  ctx.strokeStyle = '#7a6a4e'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(2, -14); ctx.lineTo(-52, 44); ctx.stroke(); // arm to the bull's head
  ctx.beginPath(); ctx.moveTo(22, 20); ctx.lineTo(50, 50); ctx.stroke(); // leg on the bull
  ctx.restore();
}
/** The 4th-century church on top of the Roman building: columns, walls, roof, and an apse over the house. */
function lowerChurch(grow, filled) {
  const top = lerp(LOWER, STREET - 20, eio(grow));
  if (grow <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(L - 10, top - 40, R - L + 20, LOWER - top + 40); ctx.clip();
  ctx.fillStyle = 'rgba(191,174,141,0.25)'; ctx.fillRect(L, STREET - 10, R - L, LOWER - STREET + 10);
  ctx.fillStyle = C.lower; ctx.fillRect(L, STREET - 20, 14, LOWER - STREET + 20); ctx.fillRect(R - 14, STREET - 20, 14, LOWER - STREET + 20);
  for (let i = 0; i < 7; i++) {
    const x = L + 62 + i * 74;
    ctx.fillStyle = C.lower; ctx.fillRect(x - 7, STREET + 18, 14, LOWER - STREET - 18);
    ctx.fillStyle = C.lowerDark; ctx.fillRect(x - 13, STREET + 10, 26, 10); // capital
  }
  // frescoes on the walls
  ctx.fillStyle = C.fresco; ctx.fillRect(L + 20, STREET + 50, 26, 50);
  ctx.fillStyle = '#3e6a8a'; ctx.fillRect(R - 46, STREET + 50, 26, 50);
  ctx.fillStyle = C.lowerDark; ctx.fillRect(L - 6, STREET - 24, R - L + 12, 10); // the old roof line
  ctx.restore();
}
/** Today's church, standing on the walls of the old one. */
function upperChurch(grow) {
  if (grow <= 0) return;
  const top = lerp(STREET, STREET - 156, eio(grow));
  const E = 720, eave = STREET - 100;
  ctx.save(); ctx.beginPath(); ctx.rect(L - 30, top, R - L + 40, STREET - top + 2); ctx.clip();
  // roof and walls
  ctx.fillStyle = C.upperDark; ctx.beginPath(); ctx.moveTo(L - 6, eave); ctx.lineTo((L + E) / 2, STREET - 152); ctx.lineTo(E + 6, eave); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.upper; ctx.fillRect(L, eave, E - L, STREET - eave);
  // the apse at the east end, with its mosaic
  ctx.beginPath(); ctx.moveTo(E, eave); ctx.quadraticCurveTo(790, eave + 10, 792, STREET); ctx.lineTo(E, STREET); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(E + 6, eave + 14); ctx.quadraticCurveTo(774, eave + 22, 778, STREET - 12); ctx.lineTo(E + 6, STREET - 12); ctx.closePath(); ctx.fill();
  // arcade and windows
  ctx.fillStyle = 'rgba(60,45,30,0.55)';
  const step = (E - L - 30) / 6;
  for (let i = 0; i < 6; i++) {
    const x = L + 22 + i * step;
    ctx.fillRect(x, STREET - 54, 44, 54); ctx.beginPath(); ctx.arc(x + 22, STREET - 54, 22, Math.PI, TAU); ctx.fill();
    ctx.fillRect(x + 13, STREET - 90, 18, 22);
  }
  ctx.restore();
}
function colosseum(x, y, s, a) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#b9a58a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -60); ctx.quadraticCurveTo(60, -80, 120, -60); ctx.lineTo(120, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.sky;
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { ctx.fillRect(8 + i * 19, -52 + r * 17, 10, 11); }
    ctx.restore();
  });
}
function water(t, level, a = 1) {
  A(a, () => {
    ctx.fillStyle = 'rgba(79,163,199,0.75)'; ctx.fillRect(L, level, R - L, OLDEST + 30 - level);
    ctx.strokeStyle = C.water2; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let x = L; x <= R; x += 8) { const y = level + 6 + i * 14 + 3 * Math.sin(x / 30 - t * 4 + i); x === L ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    }
  });
}
function gauge(labels, a) {
  A(a, () => {
    font(600, 22);
    for (const [y, s1, s2, col] of labels) {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(26, y); ctx.lineTo(L - 6, y); ctx.stroke();
      text(s1, 26, y - 30, { base: 'middle', color: col || C.ink });
      if (s2) { font(400, 20); text(s2, 26, y - 10, { base: 'middle', color: C.soft }); font(600, 22); }
    }
  });
}
function year(label, a) {
  A(a, () => { font(700, 40); text(label, 40, 70, { base: 'middle', color: C.amber }); });
}

// ---------- the scene ----------
function draw(t) {
  // the ground: earth below the street
  ctx.fillStyle = 'rgba(90,70,50,0.35)'; ctx.fillRect(0, STREET, W, OLDEST + 40 - STREET);
  ctx.strokeStyle = 'rgba(243,233,214,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, STREET); ctx.lineTo(W, STREET); ctx.stroke();

  // which moment of the story we are drawing
  const hook = t < 9.2, rebuild = t >= 9.2 && t < 44.4, late = t >= 44.4;
  if (hook) {
    // A: the full section as it is today, then the levels picked out
    const open = eio(seg(t, 1.0, 2.6));
    oldRuins(1);
    fillUp(earthTex, L, ROMAN, R, OLDEST, 1);
    romanLevel(1, t); mithraeum(t, 0);
    lowerChurch(1);
    fillUp(rubbleTex, L, STREET + 12, R, LOWER, 1 - open * 0.8);
    upperChurch(1);
    // stairs going down
    A(seg(t, 5.0, 6.0), () => {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 5; ctx.beginPath();
      let x = 470, y = STREET;
      ctx.moveTo(x, y);
      for (let i = 0; i < 12; i++) { x -= 10; ctx.lineTo(x, y); y += (ROMAN - 30 - STREET) / 12; ctx.lineTo(x, y); }
      ctx.stroke();
    });
    gauge([[STREET, 'TODAY’S CHURCH', 'c. 1100–1120'], [LOWER, '4TH-CENTURY', 'church'], [ROMAN, 'ROMAN', '1st–2nd century']], seg(t, 2.4, 3.4));
  }
  if (rebuild) {
    // B: AD 64 and the Roman buildings
    oldRuins(1 - 0.0);
    flames(t, span(t, 9.4, 13.4, 0.4, 0.6));
    year('AD 64', span(t, 9.4, 13.4, 0.3, 0.3));
    fillUp(earthTex, L, ROMAN, R, OLDEST, eio(seg(t, 13.6, 15.2)));
    romanLevel(seg(t, 15.2, 17.4), t);
    A(seg(t, 16.0, 16.8) * (1 - seg(t, 17.8, 18.2)), () => {
      ctx.fillStyle = 'rgba(27,21,17,0.85)'; k.rrect(L + 40, ROMAN + 16, 480, 40, 10); ctx.fill();
      font(600, 22); text('about the Colosseum’s floor level', L + 280, ROMAN + 36, { align: 'center', base: 'middle', color: C.ink });
    });
    year('late 1st century', span(t, 13.8, 17.9, 0.3, 0.3));
    // C: the Mithraeum
    if (t >= 18.0) mithraeum(t, span(t, 18.2, 30.0, 0.6, 0.6));
    year('c. AD 200', span(t, 18.2, 26.6, 0.3, 0.3));
    A(span(t, 18.6, 26.8, 0.5, 0.4), () => {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.strokeRect(MITH.x0 - 6, MITH.top - 36, MITH.x1 - MITH.x0 + 12, MITH.floor - MITH.top + 40);
      ctx.fillStyle = 'rgba(27,21,17,0.85)'; k.rrect(MITH.x0 - 6, MITH.top - 80, 170, 36, 8); ctx.fill();
      font(600, 24); text('MITHRAEUM', MITH.x0 + 6, MITH.top - 62, { base: 'middle', color: C.amber });
    });
    A(span(t, 22.4, 26.8, 0.5, 0.4), () => {
      ctx.fillStyle = 'rgba(27,21,17,0.9)'; k.rrect(CX + 40 - 150, 70, 300, 296, 16); ctx.fill();
      altarRelief(CX + 40, 210, 0.78);
      font(600, 22); text('the altar: Mithras and the bull', CX + 40, 344, { align: 'center', base: 'middle', color: C.ink });
    });
    // D: the 4th century
    fillUp(rubbleTex, L, LOWER, R, ROMAN, eio(seg(t, 27.0, 28.8)));
    lowerChurch(seg(t, 28.6, 30.8));
    year('4th century', span(t, 27.0, 31.0, 0.3, 0.3));
    year('AD 392', span(t, 31.2, 35.4, 0.3, 0.3));
    A(span(t, 31.4, 35.4, 0.4, 0.3), () => {
      ctx.fillStyle = 'rgba(27,21,17,0.88)'; k.rrect(196, 118, 520, 124, 12); ctx.fill();
      font(600, 20); text('JEROME, ON FAMOUS MEN', 218, 144, { base: 'middle', color: C.amber });
      font(400, 28, SERIF); text('“a church built in Rome guards the', 218, 180, { base: 'middle', color: C.ink });
      text('memory of his name to this day”', 218, 216, { base: 'middle', color: C.ink });
    });
    // E: about 1100
    const fill1100 = eio(seg(t, 35.8, 38.0));
    fillUp(rubbleTex, L, STREET + 12, R, LOWER, fill1100);
    year('c. 1100', span(t, 35.8, 44.2, 0.3, 0.3));
    upperChurch(seg(t, 40.0, 42.2));
    A(seg(t, 41.0, 41.8), () => {
      // the rise of about 4 m
      ctx.strokeStyle = C.amber; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(L - 22, LOWER); ctx.lineTo(L - 22, STREET); ctx.stroke();
      for (const y of [LOWER, STREET]) { ctx.beginPath(); ctx.moveTo(L - 32, y); ctx.lineTo(L - 12, y); ctx.stroke(); }
      font(700, 30); text(`≈ ${RISE_1100} m`, L - 32, (LOWER + STREET) / 2, { align: 'right', base: 'middle', color: C.amber });
    });
  }
  if (late) {
    // F, G: everything stacked; then digging, flood, tunnel, stream
    const dig = eio(seg(t, 49.4, 52.4));
    oldRuins(1);
    fillUp(earthTex, L, ROMAN, R, OLDEST, 1);
    romanLevel(1, t); mithraeum(t, seg(t, 53.4, 54.4) * 0.6);
    fillUp(rubbleTex, L, LOWER, R, ROMAN, 1 - eio(seg(t, 51.6, 53.2)));
    lowerChurch(1);
    fillUp(rubbleTex, L, STREET + 12, R, LOWER, 1 - dig * 0.85);
    upperChurch(1);
    // dig out the Roman level too, a little later
    gauge([[STREET, 'c. 1100–1120', ''], [LOWER, '4th century', ''], [ROMAN, 'c. 70–400', ''], [OLDEST, 'before AD 64', '']], span(t, 44.6, 49.0, 0.4, 0.4));
    A(span(t, 45.4, 49.0, 0.4, 0.4), () => {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(204, STREET - 40); ctx.lineTo(204, OLDEST + 30); ctx.stroke();
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(190, OLDEST + 22); ctx.lineTo(218, OLDEST + 22); ctx.lineTo(204, OLDEST + 48); ctx.closePath(); ctx.fill();
      font(700, 30); text('older', 204, OLDEST + 76, { align: 'center', base: 'middle', color: C.amber });
    });
    // Father Mullooly with a lantern
    A(span(t, 49.0, 53.2, 0.4, 0.4), () => {
      const x = lerp(300, 520, dig), y = LOWER;
      ctx.fillStyle = '#2a211a'; ctx.beginPath(); ctx.arc(x, y - 62, 11, 0, TAU); ctx.fill();
      ctx.fillRect(x - 12, y - 50, 24, 50);
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x + 22, y - 34, 7, 0, TAU); ctx.fill();
      const g = ctx.createRadialGradient(x + 22, y - 34, 4, x + 22, y - 34, 90); g.addColorStop(0, 'rgba(240,179,90,0.45)'); g.addColorStop(1, 'rgba(240,179,90,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 80, y - 130, 200, 130);
      year('1857', 1);
    });
    // G: the flood and the tunnel
    const flood = seg(t, 53.4, 54.8) * (1 - eio(seg(t, 55.6, 57.4)) * 0.85);
    if (t >= 53.2) water(t, lerp(OLDEST + 20, ROMAN - 70, flood), 1);
    A(span(t, 54.8, 62.4, 0.5, 0), () => {
      // the tunnel to the Colosseum
      ctx.fillStyle = '#121010'; ctx.fillRect(0, OLDEST - 6, L, 26);
      const flow = (t * 60) % 40;
      ctx.fillStyle = C.water;
      for (let x = L - flow; x > 0; x -= 40) ctx.fillRect(x - 20, OLDEST + 2, 18, 10);
      colosseum(40, STREET, 1.1, 1);
      font(600, 22); text('Colosseum', 106, STREET + 24, { align: 'center', base: 'middle', color: C.soft });
      font(600, 24); text('← tunnel to the Colosseum', 26, OLDEST + 54, { base: 'middle', color: C.water2 });
    });
    year('1912–14', span(t, 53.4, 57.4, 0.3, 0.3));
    // the stream, heard
    A(seg(t, 57.8, 58.6), () => {
      for (let i = 0; i < 3; i++) {
        const r = 22 + i * 16 + ((t * 30) % 16);
        ctx.strokeStyle = `rgba(143,208,234,${0.8 - i * 0.22})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(640, OLDEST - 10, r, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke();
      }
    });
  }
}

Kit.scene({
  width: W, height: H, duration: 62.4, fonts: [MONO, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintTextures();
    ctx.drawImage(bg, 0, 0);
    draw(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 39, weight: 500, family: SERIF, ink: C.ink, marks: { '*': C.amber, '~': C.water2, '^': C.fresco } });
  },
});
