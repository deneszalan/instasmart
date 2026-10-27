// Explainer for history-castel-sant-angelo-tomb-fortress (Roma): Castel Sant'Angelo began as Emperor Hadrian's tomb
// and became a fortress, a papal castle, a prison and a museum, each age adding a layer around the Roman core.
// Look: the building as a section drawing on dark Tiber green, each age in its own material: Roman travertine
// and marble, late-antique grey, medieval brick, Renaissance ochre; plan views for the bastions and the Passetto.
// Lora for captions, Source Sans 3 for labels.
//
// Facts:
// - Direzione Musei statali della città di Roma, "Relazione storica" (Museo Nazionale di Castel Sant'Angelo e
//   Passetto di Borgo, 2023): Hadrian began his mausoleum in AD 135; the architect Demetrianus completed it in 139
//   under Antoninus Pius, who moved there the remains of Hadrian (died 138); it held the Antonine emperors and the
//   Severans up to Caracalla (217); the Pons Aelius (134) was built on its axis; it was 47.52 m high on a square
//   podium of about 85 m; ancient walls survive to 44 m above the foundation; a corridor led from the entrance to an
//   inner vestibule, from which a ramp turned anticlockwise one full circle to the burial chamber exactly above the
//   entrance; the drum, in tiers of decreasing diameter, was capped by an earth mound and a rotunda; it was built
//   into Honorius's fortifications (395–423); after 590, when by tradition the angel appeared over it during a
//   procession, a chapel of St Michael crowned it, probably under Boniface IV (608–615); under Boniface IX
//   (1389–1404), with Nicolò Lamberti's works from 1395, the original entrance and the ramp were closed and a new
//   entrance opened about 15 m above the Roman paving, controlled by a drawbridge; Nicholas V (1447–1455) began four
//   corner towers; Alexander VI made four large bastions and a moat (contracts 1494–1495); declared a national
//   museum on 4 May 1925 (earlier a prison and barracks).
// - Turismo Roma, "Mausoleo di Adriano" and "The Passetto di Borgo": construction from 135, finished 139 by
//   Antoninus Pius; incorporated into the Aurelian Walls in 403, possibly under Honorius; the name from the angel
//   seen by Pope Gregory I in about 590; the Passetto, about 800 m, let Alexander VI escape in 1494 and Clement VII
//   in 1527, during the Sack of Rome by Charles V's landsknechts.
// - Wikipedia, "Castel Sant'Angelo" and "Passetto di Borgo": legend holds the Archangel Michael appeared atop the
//   mausoleum, sheathing his sword, as a sign of the end of the plague of 590; Clement VII took refuge there in 1527.
// Drawing: proportions follow the 85 m base and 47.5 m height; the drum's size, the layers' shapes and the plan are
// simplified.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The castle today by the Tiber; Hadrian, AD 135–139.
//  B  9.2–23.0  The tomb: square base, drum, mound; the spiral ramp; emperors to Caracalla.
//  C 23.0–36.8  Fortress in the city walls; the angel legend of 590; the chapel.
//  D 36.8–55.0  Sealed entrance and raised door; bastions and moat (plan); the Passetto and 1527.
//  E 55.2–64.6  Prison, museum; peel back to Hadrian's core, 44 m of Roman walls.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg: '#13292a', bg2: '#1c3a39', ink: '#f3ecdf', soft: 'rgba(243,236,223,0.74)', faint: 'rgba(243,236,223,0.22)',
  marble: '#eee6d6', trav: '#d9cbb0', trav2: '#bfae8e', earth: '#6f7f4a', tree: '#4c6a3b', grey: '#9a9a92', brick: '#b2593c', brick2: '#8f452d',
  ochre: '#d6a14a', gold: '#e9b949', river: '#4f8a8c', red: '#ef6a50', iron: '#2b2b2b',
};
const SERIF = 'Lora', SANS = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const BEGUN = 135, FINISHED = 139, LAST_BURIAL = 217, BASE = 85, HIGH = 47.52, SURVIVES = 44, NEW_DOOR = 15, PASSETTO = 800;
if (FINISHED - BEGUN !== 4 || SURVIVES > HIGH) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, `Castel Sant’Angelo in Rome began as the tomb of Emperor Hadrian, finished in AD ${FINISHED}.`],
  [4.8, 9.0, `Begun by Hadrian in AD ${BEGUN}, it was finished by the next emperor, Antoninus Pius.`],
  [9.2, 13.6, `On a square base about *${BASE} m* wide rose a round drum, topped by an earth mound.`],
  [13.8, 18.2, 'Inside, a ramp spirals one full turn up to the burial chamber, right above the entrance.'],
  [18.4, 22.8, `Emperors were laid here until Caracalla in AD ${LAST_BURIAL}. Then the tomb became a fort.`],
  [23.0, 27.4, 'In the early 400s it was built into Rome’s city walls, a ready-made stronghold.'],
  [27.6, 32.0, 'Legend says the *Archangel Michael* appeared on top in 590, sheathing his sword.'],
  [32.2, 36.6, 'It marked the end of a plague, the story goes. A chapel to St Michael crowned the castle.'],
  [36.8, 41.2, `In the 1390s the Roman entrance was sealed; a new door ~${NEW_DOOR} m up~ had a drawbridge.`],
  [41.4, 45.8, 'In 1494–95 Pope Alexander VI added four bastions and a moat against cannon.'],
  [46.0, 50.4, `A walled corridor about ${PASSETTO} m long, the *Passetto*, links the castle to the Vatican.`],
  [50.6, 55.0, 'In 1527, as Emperor Charles V’s troops sacked Rome, Pope Clement VII fled along it here.'],
  [55.2, 59.6, 'Later a prison and barracks, the castle became a national museum in 1925.'],
  [59.8, 64.2, `Under it all is still Hadrian’s tomb: its Roman walls stand up to ^${SURVIVES} m^ high.`],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg2); lg.addColorStop(1, C.bg);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 13; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(220,240,230,${r() * 0.03})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1); }
}

// ---------- the section: metres to pixels ----------
const SEC = { cx: CX, ground: 690, sc: 7.6 };
const SX = (m) => SEC.cx + m * SEC.sc, SY = (m) => SEC.ground - m * SEC.sc;
// Hadrian's tomb, schematic: base 85 m wide, the drum, the mound and the top, 47.5 m in all
// the drum in two tiers of decreasing diameter (proportions illustrative)
const BASE_H = 12, DRUM_R = 32, DRUM_H = 18, TIER_R = 21, TIER_TOP = 41, MOUND_TOP = 45, TOP_H = HIGH - MOUND_TOP;
const DRUM_TOP = BASE_H + DRUM_H, CHAMBER = 22;
function stones(x, y, w, h, col, col2, row = 3) {
  ctx.fillStyle = col; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = col2; ctx.lineWidth = 1;
  for (let yy = y + row * SEC.sc * 0.5; yy < y + h; yy += row * SEC.sc * 0.5) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
}
function tomb(a, { inside = 0, ramp = 0, mound = 1, top = 1, sealed = 0 } = {}) {
  A(a, () => {
    // the square base (podium)
    stones(SX(-BASE / 2), SY(BASE_H), BASE * SEC.sc, BASE_H * SEC.sc, C.trav, C.trav2);
    ctx.fillStyle = C.marble; ctx.fillRect(SX(-BASE / 2), SY(BASE_H) - 4, BASE * SEC.sc, 6);
    // the drum, in two tiers
    stones(SX(-DRUM_R), SY(DRUM_TOP), 2 * DRUM_R * SEC.sc, DRUM_H * SEC.sc, C.trav, C.trav2);
    stones(SX(-TIER_R), SY(TIER_TOP), 2 * TIER_R * SEC.sc, (TIER_TOP - DRUM_TOP) * SEC.sc, C.trav, C.trav2);
    // the earth mound with trees, and the top with its chariot group
    if (mound > 0) A(mound, () => {
      ctx.fillStyle = C.earth; ctx.beginPath(); ctx.moveTo(SX(-TIER_R), SY(TIER_TOP)); ctx.quadraticCurveTo(SX(0), SY(MOUND_TOP + 4), SX(TIER_R), SY(TIER_TOP)); ctx.fill();
      ctx.fillStyle = C.tree; for (const xm of [-15, -9, 9, 15]) { ctx.beginPath(); ctx.ellipse(SX(xm), SY(TIER_TOP + 2.6), 4, 11, 0, 0, TAU); ctx.fill(); }
    });
    if (top > 0) A(top, () => {
      ctx.fillStyle = C.marble; ctx.fillRect(SX(-5), SY(HIGH - 1.5), 10 * SEC.sc, (HIGH - 1.5 - TIER_TOP) * SEC.sc);
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(SX(-4), SY(HIGH - 1.5)); ctx.lineTo(SX(-2.5), SY(HIGH + 1.5)); ctx.lineTo(SX(2.5), SY(HIGH + 2)); ctx.lineTo(SX(4), SY(HIGH - 1.5)); ctx.fill();
    });
    // the entrance, the corridor, the ramp and the burial chamber
    if (inside > 0) A(inside, () => {
      ctx.fillStyle = 'rgba(19,41,42,0.85)';
      ctx.fillRect(SX(-2), SY(4.5), 4 * SEC.sc, 4.5 * SEC.sc); // the door, on the axis
      ctx.fillStyle = 'rgba(19,41,42,0.7)'; ctx.fillRect(SX(-2.5), SY(CHAMBER + 5), 5 * SEC.sc, 5 * SEC.sc); // the chamber
      font(600, 22);
      text('burial chamber', SX(4), SY(CHAMBER + 2.5), { base: 'middle', color: C.bg });
      if (sealed <= 0) text('entrance', SX(-3), SY(2.5), { align: 'right', base: 'middle', color: C.bg });
    });
    if (ramp > 0) A(1, () => {
      // one full turn, drawn as a projected helix inside the drum
      const n = 80, r0 = DRUM_R * 0.72, y0 = 3, y1 = CHAMBER + 2.5;
      ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i <= n * ramp; i++) {
        const f = i / n, ang = Math.PI / 2 + f * TAU, x = Math.cos(ang) * r0 * -1, y = lerp(y0, y1, f);
        const back = Math.sin(ang) < 0;
        ctx.globalAlpha = back ? 0.45 : 1;
        i ? ctx.lineTo(SX(x), SY(y)) : ctx.moveTo(SX(x), SY(y));
        ctx.stroke(); ctx.beginPath(); ctx.moveTo(SX(x), SY(y));
      }
      ctx.globalAlpha = 1;
    });
    if (sealed > 0) A(sealed, () => {
      ctx.fillStyle = C.brick; ctx.fillRect(SX(-2.2), SY(4.7), 4.4 * SEC.sc, 4.7 * SEC.sc);
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(SX(-3), SY(5.5)); ctx.lineTo(SX(3), SY(-0.5)); ctx.moveTo(SX(3), SY(5.5)); ctx.lineTo(SX(-3), SY(-0.5)); ctx.stroke();
    });
  });
}
function cityWalls(a) {
  A(a, () => {
    for (const sd of [-1, 1]) {
      const x0 = sd < 0 ? 0 : SX(BASE / 2), x1 = sd < 0 ? SX(-BASE / 2) : W;
      ctx.fillStyle = C.grey; ctx.fillRect(Math.min(x0, x1), SY(10), Math.abs(x1 - x0), 10 * SEC.sc);
      for (let x = Math.min(x0, x1); x < Math.max(x0, x1) - 10; x += 22) ctx.fillRect(x, SY(11.6), 12, 1.6 * SEC.sc);
    }
    // battlements on the drum
    ctx.fillStyle = C.grey; for (let x = SX(-TIER_R); x < SX(TIER_R) - 8; x += 22) ctx.fillRect(x, SY(TIER_TOP + 1.6), 12, 1.6 * SEC.sc);
  });
}
function angel(x, y, s, a, sword = 1) {
  A(a, () => {
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(x, y - 40 * s); ctx.lineTo(x - 12 * s, y); ctx.lineTo(x + 12 * s, y); ctx.fill(); // robe
    ctx.beginPath(); ctx.arc(x, y - 46 * s, 6 * s, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 2, y - 36 * s); ctx.quadraticCurveTo(x - 34 * s, y - 60 * s, x - 30 * s, y - 20 * s); ctx.lineTo(x - 4, y - 28 * s); ctx.fill(); // wings
    ctx.beginPath(); ctx.moveTo(x + 2, y - 36 * s); ctx.quadraticCurveTo(x + 34 * s, y - 60 * s, x + 30 * s, y - 20 * s); ctx.lineTo(x + 4, y - 28 * s); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x + 8 * s, y - 30 * s); ctx.lineTo(x + 8 * s + 26 * s * sword, y - 30 * s - 14 * s * sword); ctx.stroke(); // the sword, going into its sheath
  });
}

// ---------- A: today, by the Tiber ----------
function today(a) {
  A(a, () => {
    // the river and the bridge
    ctx.fillStyle = C.river; ctx.fillRect(0, SY(-3), W, 3 * SEC.sc + 40);
    ctx.fillStyle = C.trav2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(80 + i * 170, SY(-3) + 50, 70, Math.PI, 0); ctx.lineTo(80 + i * 170 + 70, SY(-3) + 54); ctx.lineTo(80 + i * 170 - 70, SY(-3) + 54); ctx.fill(); }
    // the bastions, the drum and the top storeys
    ctx.fillStyle = C.ochre; ctx.fillRect(SX(-BASE / 2 - 6), SY(14), (BASE + 12) * SEC.sc, 14 * SEC.sc);
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(SX(sd * (BASE / 2 + 6)), SY(14)); ctx.lineTo(SX(sd * (BASE / 2 + 12)), SY(0)); ctx.lineTo(SX(sd * (BASE / 2 - 4)), SY(0)); ctx.fill(); }
    stones(SX(-DRUM_R), SY(DRUM_TOP), 2 * DRUM_R * SEC.sc, (DRUM_TOP - 14) * SEC.sc, C.trav, C.trav2);
    stones(SX(-TIER_R), SY(TIER_TOP), 2 * TIER_R * SEC.sc, (TIER_TOP - DRUM_TOP) * SEC.sc, C.trav, C.trav2);
    ctx.fillStyle = C.brick; ctx.fillRect(SX(-14), SY(TIER_TOP + 9), 28 * SEC.sc, 9 * SEC.sc);
    ctx.fillStyle = C.brick2; for (let i = 0; i < 5; i++) ctx.fillRect(SX(-12 + i * 5.5), SY(TIER_TOP + 7), 2 * SEC.sc, 4 * SEC.sc);
    ctx.fillStyle = C.brick; ctx.fillRect(SX(-5), SY(TIER_TOP + 14), 10 * SEC.sc, 5 * SEC.sc);
    angel(SX(0), SY(TIER_TOP + 14), 1.1, 1, 0.2);
  });
}
function sceneToday(t) {
  const a = span(t, 0, 9.4, 0.5, 0.5);
  if (a <= 0) return;
  SEC.sc = 7.6;
  today(a);
  A(a * seg(t, 1.0, 2.0), () => {
    font(700, 24); text('CASTEL SANT’ANGELO', 60, 120, { base: 'middle', color: C.ink, spacing: '3px' });
    font(400, 24, SERIF); text('Rome, on the bank of the Tiber', 60, 154, { base: 'middle', color: C.soft });
  });
  A(a * seg(t, 5.0, 5.8), () => {
    font(400, 28, SERIF); text(`Hadrian’s tomb · AD ${BEGUN}–${FINISHED}`, 60, 188, { base: 'middle', color: C.gold });
  });
}

// ---------- B: the tomb ----------
function sceneTomb(t) {
  const a = span(t, 9.2, 23.2, 0.5, 0.4);
  if (a <= 0) return;
  SEC.sc = 7.6;
  const grow = eio(seg(t, 9.4, 11.6));
  ctx.save(); ctx.beginPath(); ctx.rect(0, SY(HIGH + 4) + (1 - grow) * HIGH * SEC.sc, W, H); ctx.clip();
  tomb(a, { inside: seg(t, 14.0, 14.8), ramp: eio(seg(t, 14.6, 17.4)) });
  ctx.restore();
  A(a, () => {
    ctx.fillStyle = C.river; ctx.fillRect(0, SY(0) + 2, W, 20);
    A(seg(t, 11.6, 12.4), () => {
      const y = SY(0) + 46;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(SX(-BASE / 2), y); ctx.lineTo(SX(BASE / 2), y); ctx.stroke();
      for (const x of [SX(-BASE / 2), SX(BASE / 2)]) { ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10); ctx.stroke(); }
      font(700, 26); text(`about ${BASE} m`, CX, y + 30, { align: 'center', base: 'middle', color: C.gold });
      const x = SX(BASE / 2) + 24;
      ctx.beginPath(); ctx.moveTo(x, SY(0)); ctx.lineTo(x, SY(HIGH)); ctx.stroke();
      for (const yy of [SY(0), SY(HIGH)]) { ctx.beginPath(); ctx.moveTo(x - 10, yy); ctx.lineTo(x + 10, yy); ctx.stroke(); }
      font(700, 26); text(`${(Math.round(HIGH * 10) / 10).toFixed(1)} m`, x + 6, SY(HIGH + 3), { align: 'right', base: 'middle', color: C.gold });
    });
    A(seg(t, 18.8, 19.6), () => {
      font(600, 22); const names = ['Hadrian', 'Sabina', 'Antoninus Pius', 'Faustina', 'Marcus Aurelius', 'Commodus', 'Septimius Severus', 'Geta', `Caracalla, ${LAST_BURIAL}`];
      names.forEach((n, i) => A(seg(t, 18.8 + i * 0.25, 19.3 + i * 0.25), () => text(n, 60, 110 + i * 30, { base: 'middle', color: i === names.length - 1 ? C.gold : C.soft })));
    });
  });
}

// ---------- C: fortress, angel, chapel ----------
function sceneFort(t) {
  const a = span(t, 23.0, 37.0, 0.4, 0.4);
  if (a <= 0) return;
  SEC.sc = 7.6;
  tomb(a, { mound: 1 - seg(t, 23.4, 24.4), top: 1 - seg(t, 23.4, 24.4) });
  cityWalls(a * seg(t, 23.6, 24.8));
  A(a * seg(t, 24.2, 25.0), () => { font(700, 24); text('Rome’s city walls', 40, SY(-3), { base: 'middle', color: C.ink }); });
  // the angel over the castle, sheathing his sword
  const ang = seg(t, 28.0, 29.0);
  if (ang > 0) {
    A(a * ang * (1 - seg(t, 32.2, 33.0)), () => {
      const g = ctx.createRadialGradient(SX(0), SY(TIER_TOP + 10), 10, SX(0), SY(TIER_TOP + 10), 160);
      g.addColorStop(0, 'rgba(255,240,200,0.55)'); g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = g; ctx.fillRect(SX(-30), SY(TIER_TOP + 34), 60 * SEC.sc, 36 * SEC.sc);
    });
    angel(SX(0), SY(TIER_TOP + 2), 1.6, a * ang, 1 - eio(seg(t, 29.4, 31.4)));
    A(a * seg(t, 28.4, 29.2), () => { font(600, 22); text('legend: 590', SX(-12), SY(TIER_TOP + 8), { align: 'right', base: 'middle', color: C.gold }); });
  }
  // the chapel on top
  A(a * seg(t, 33.0, 34.0), () => {
    ctx.fillStyle = C.brick; ctx.fillRect(SX(-6), SY(TIER_TOP + 6), 12 * SEC.sc, 6 * SEC.sc);
    ctx.beginPath(); ctx.moveTo(SX(-7), SY(TIER_TOP + 6)); ctx.lineTo(SX(0), SY(TIER_TOP + 10)); ctx.lineTo(SX(7), SY(TIER_TOP + 6)); ctx.fill();
    font(600, 22); text('chapel of St Michael', SX(10), SY(TIER_TOP + 5), { base: 'middle', color: C.ink });
  });
}

// ---------- D: sealed door, bastions, the Passetto ----------
function plan(a, { bastions = 0, passetto = 0, run = -1 } = {}) {
  A(a, () => {
    const cx = 610, cy = 400, s = 2.4; // metres to pixels in plan
    // the Tiber, flowing past the castle's east side
    ctx.strokeStyle = C.river; ctx.lineWidth = 46; ctx.beginPath(); ctx.moveTo(760, 120); ctx.quadraticCurveTo(700 + 70, 400, 720, 740); ctx.stroke();
    font(600, 22); text('Tiber', 800, 600, { align: 'center', base: 'middle', color: C.ink });
    text('plan, not to scale', 70, 720, { base: 'middle', color: C.faint });
    // the moat and bastions
    A(bastions, () => {
      ctx.strokeStyle = 'rgba(79,138,140,0.8)'; ctx.lineWidth = 14; ctx.strokeRect(cx - 75 * s, cy - 75 * s, 150 * s, 150 * s);
      ctx.fillStyle = C.ochre;
      for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const bx = cx + dx * 55 * s, by = cy + dy * 55 * s;
        ctx.beginPath(); ctx.moveTo(bx, by - dy * 22 * s); ctx.lineTo(bx + dx * 18 * s, by - dy * 6 * s); ctx.lineTo(bx + dx * 14 * s, by + dy * 16 * s); ctx.lineTo(bx - dx * 6 * s, by + dy * 18 * s); ctx.lineTo(bx - dx * 22 * s, by); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = C.ochre; ctx.fillRect(cx - 55 * s, cy - 55 * s, 110 * s, 110 * s);
    });
    // Hadrian's square base and the round drum, seen from above
    ctx.fillStyle = C.trav; ctx.fillRect(cx - (BASE / 2) * s, cy - (BASE / 2) * s, BASE * s, BASE * s);
    ctx.fillStyle = C.trav2; ctx.beginPath(); ctx.arc(cx, cy, DRUM_R * s, 0, TAU); ctx.fill();
    ctx.fillStyle = C.brick; ctx.beginPath(); ctx.arc(cx, cy, 10 * s, 0, TAU); ctx.fill();
    // the Passetto, to the Vatican
    if (passetto > 0) {
      const pts = [[cx - 60 * s, cy - 10 * s], [cx - 170, cy - 40], [cx - 330, cy - 60], [130, cy - 70]];
      ctx.strokeStyle = C.brick; ctx.lineWidth = 10; ctx.beginPath();
      const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const upto = L.at(-1) * passetto;
      ctx.moveTo(...pts[0]);
      for (let i = 1; i < pts.length; i++) { if (L[i] <= upto) ctx.lineTo(...pts[i]); else { const f = (upto - L[i - 1]) / (L[i] - L[i - 1]); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); break; } }
      ctx.stroke();
      // the Vatican palace and St Peter's
      ctx.fillStyle = C.trav2; ctx.fillRect(70, cy - 150, 110, 70);
      ctx.fillStyle = C.grey; ctx.beginPath(); ctx.arc(115, cy + 40, 34, 0, TAU); ctx.fill();
      font(600, 22); text('Vatican Palace', 125, cy - 170, { align: 'center', base: 'middle', color: C.ink }); text('St Peter’s', 115, cy + 98, { align: 'center', base: 'middle', color: C.soft });
      A(seg(passetto, 0.9, 1), () => { font(700, 24); text(`Passetto, about ${PASSETTO} m`, 300, cy - 110, { align: 'center', base: 'middle', color: C.brick }); });
      // Clement VII running from the Vatican to the castle
      if (run >= 0) {
        const at = L.at(-1) * (1 - run);
        let i = 1; while (i < L.length - 1 && L[i] < at) i++;
        const f = (at - L[i - 1]) / (L[i] - L[i - 1]), x = lerp(pts[i - 1][0], pts[i][0], f), y = lerp(pts[i - 1][1], pts[i][1], f);
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
        font(700, 22); text('Clement VII, 1527', x, y + 34, { align: 'center', base: 'middle', color: C.ink });
      }
    }
  });
}
function sceneLater(t) {
  // the section: the old door sealed, a raised door with a drawbridge
  const a1 = span(t, 36.8, 41.6, 0.4, 0.4);
  if (a1 > 0) {
    SEC.sc = 7.6;
    tomb(a1, { mound: 0, top: 0, inside: 1, sealed: seg(t, 37.4, 38.4) });
    cityWalls(a1);
    A(a1, () => {
      ctx.fillStyle = C.brick; ctx.fillRect(SX(-6), SY(TIER_TOP + 6), 12 * SEC.sc, 6 * SEC.sc);
      const d = seg(t, 38.6, 39.4), br = eio(seg(t, 39.4, 40.6));
      A(d, () => {
        ctx.fillStyle = 'rgba(19,41,42,0.9)'; ctx.fillRect(SX(-2.2), SY(NEW_DOOR + 4.5), 4.4 * SEC.sc, 4.5 * SEC.sc);
        ctx.save(); ctx.translate(SX(-2.2), SY(NEW_DOOR)); ctx.rotate(-Math.PI / 2 * (1 - br));
        ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-60, -6, 60, 6); ctx.restore();
        ctx.strokeStyle = C.iron; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(SX(-2.2), SY(NEW_DOOR + 4.5)); ctx.lineTo(SX(-2.2) - 60 * Math.cos(Math.PI / 2 * (1 - br)), SY(NEW_DOOR) - 60 * Math.sin(Math.PI / 2 * (1 - br))); ctx.stroke();
        font(700, 22); text(`new door, ${NEW_DOOR} m up`, SX(4), SY(NEW_DOOR + 2), { base: 'middle', color: C.bg });
        text('Roman door sealed', SX(4), SY(2.5), { base: 'middle', color: C.brick2 });
      });
    });
  }
  // plan: bastions and moat, then the Passetto and the pope's flight
  const a2 = span(t, 41.4, 55.2, 0.4, 0.4);
  if (a2 > 0) {
    plan(a2, { bastions: eio(seg(t, 42.0, 43.6)), passetto: eio(seg(t, 46.4, 48.6)), run: t < 50.8 ? -1 : eio(seg(t, 50.8, 54.2)) });
    A(a2 * seg(t, 43.4, 44.2) * (1 - seg(t, 46.0, 46.4)), () => {
      font(700, 24); text('1494–95: four bastions and a moat', 70, 120, { base: 'middle', color: C.ochre });
      font(500, 22); text('Pope Alexander VI', 70, 152, { base: 'middle', color: C.soft });
    });
  }
}

// ---------- E: museum, and the Roman core ----------
function sceneEnd(t) {
  const a1 = span(t, 55.2, 60.0, 0.4, 0.4);
  if (a1 > 0) {
    SEC.sc = 7.6;
    today(a1);
    A(a1 * seg(t, 55.8, 56.6), () => {
      ctx.fillStyle = 'rgba(19,41,42,0.85)'; k.rrect(CX - 270, 150, 540, 120, 10); ctx.fill();
      font(400, 26, SERIF); text('prison and barracks', CX, 190, { align: 'center', base: 'middle', color: C.soft });
      font(700, 28); text('Museo Nazionale · 4 May 1925', CX, 232, { align: 'center', base: 'middle', color: C.gold });
    });
  }
  const a = t < 59.8 ? 0 : span(t, 59.8, 64.6, 0.5, 0.01);
  if (a <= 0) return;
  SEC.sc = 7.6;
  // the later layers fade away, leaving the Roman walls
  const peel = eio(seg(t, 60.2, 62.4));
  A(1 - peel, () => today(a));
  tomb(a * peel, { mound: 0, top: 0 });
  A(a * seg(t, 61.8, 62.6), () => {
    const x = SX(BASE / 2) + 24;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, SY(0)); ctx.lineTo(x, SY(SURVIVES)); ctx.stroke();
    for (const yy of [SY(0), SY(SURVIVES)]) { ctx.beginPath(); ctx.moveTo(x - 10, yy); ctx.lineTo(x + 10, yy); ctx.stroke(); }
    // the surviving Roman walls drawn up to 44 m
    ctx.fillStyle = 'rgba(238,230,214,0.35)'; ctx.fillRect(SX(-TIER_R), SY(SURVIVES), 2 * TIER_R * SEC.sc, (SURVIVES - TIER_TOP) * SEC.sc);
    font(700, 26); text(`${SURVIVES} m of Roman walls`, x - 10, SY(SURVIVES) - 24, { align: 'right', base: 'middle', color: C.gold });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneToday(t);
    sceneTomb(t);
    sceneFort(t);
    sceneLater(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 500, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.red, '^': C.ochre } });
  },
});
