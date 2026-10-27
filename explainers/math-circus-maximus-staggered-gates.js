// Explainer for math-circus-maximus-staggered-gates (Roma): the Circus Maximus's 12 starting gates stood on a curve,
// an arc of a circle centred on a point at the mouth of the first straight, so every chariot had the same distance
// to the break line where drivers could leave their lanes. Then seven laps, counted on eggs and dolphins. Look: a
// surveyor's drawing in brown ink on sand, chalk-white lines, a compass arc, and the four racing colours. Saira for
// labels and numbers, Bitter for captions.
//
// Facts:
// - Wikipedia, "Circus Maximus": chariot-racing stadium in the valley between the Aventine and Palatine hills, about
//   621 m long; the original track is now buried some six metres below the modern surface, and the site is a park;
//   permanent starting stalls from 329 BC, staggered to equalise the distances from each start place to the central
//   barrier; by the late Republic or early Empire twelve stalls with spring-loaded gates that released the chariots
//   at once; stalls allocated by lottery; typically seven laps, counted with large sculpted eggs from at least
//   174 BC, and from 33 BC also with bronze dolphins; seats probably in the order of 150,000, Pliny the Elder's
//   250,000 unlikely (citing Humphrey, Roman Circuses, 1986).
// - Grout, Encyclopaedia Romana, "Circus Maximus": twelve gates (carceres), six on either side of an entrance; to
//   ensure a fair start the gates were built along a slight curve so that the distance to the break line, before
//   which the chariots were not allowed to leave their lanes, was the same for each; the presiding magistrate
//   dropped a white cloth (mappa) and the gates flew open; seven laps run counter-clockwise; Dionysius of
//   Halicarnassus gives 150,000 seats, Pliny the Elder 250,000.
// - Smith, Dictionary of Greek and Roman Antiquities (1875), "Circus": the line of the carceres forms the segment of
//   a circle whose centre is a point on the right hand of the arena, so that all the chariots had, as nearly as
//   possible, an equal distance between the carceres and the mouth of the course.
// - Cassius Dio 49.43: in 33 BC Agrippa, "seeing that in the circus men made mistakes about the number of laps
//   completed", set up the dolphins and egg-shaped objects.
// The plan is schematic, not to scale; the distances compared are computed in the drawing, and no metres are claimed.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The valley between the Palatine and the Aventine; the circus, and the track 6 m down.
//  B  9.6–18.6  Twelve gates; the white cloth; gates fly open.
//  C 18.8–23.2  Lanes to the break line.
//  D 23.4–41.6  A straight row is unfair; the arc round the point; equal strings; lots.
//  E 41.8–55.4  Seven laps round the barrier, counted on eggs and dolphins.
//  F 55.6–65.0  How many watched.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sand: '#ecdcb9', sand2: '#e0cc9f', ink: '#3a2a1c', soft: 'rgba(58,42,28,0.68)', faint: 'rgba(58,42,28,0.22)',
  chalk: '#fffaf0', track: '#d9bb83', track2: '#cfae73', stone: '#bfa27a', hill: 'rgba(110,128,74,0.30)',
  red: '#c0392b', white: '#f8f5ee', green: '#2e7d4f', blue: '#2f64b0', gold: '#b7791f',
};
const FACTIONS = [C.red, C.white, C.green, C.blue];
const LAB = 'Saira', SERIF = 'Bitter';

let k, ctx;
const font = (w, s, f = LAB) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the plan (schematic) ----------
const P = { x: 380, y: 462 }; // the point at the mouth of the first straight, on the break line
const R = 300; // radius of the gates' arc around P
const TOP = 250, BOT = 530, SPINA_Y = 392, SPINA_X0 = 380, SPINA_X1 = 660, END_CX = 610;
// Twelve gates, six either side of the central entrance, spread over the track's width at the open end.
const GATE_Y = (() => {
  const ys = [], y0 = TOP + 14, y1 = BOT - 14, gap = 26, slot = (y1 - y0 - gap) / 12;
  for (let i = 0; i < 12; i++) ys.push(y0 + slot * (i + 0.5) + (i >= 6 ? gap : 0));
  return ys;
})();
const arcX = (y) => P.x - Math.sqrt(R * R - (y - P.y) ** 2);
const STRAIGHT_X = arcX(P.y + (GATE_Y[0] - P.y) * 0.5 + (GATE_Y[11] - P.y) * 0.5); // a straight row through the middle
const gateX = (i, curve) => lerp(STRAIGHT_X, arcX(GATE_Y[i]), curve);
const dist = (i, curve) => Math.hypot(P.x - gateX(i, curve), P.y - GATE_Y[i]);
const STRAIGHT_D = GATE_Y.map((_, i) => dist(i, 0));
const ARC_D = GATE_Y.map((_, i) => dist(i, 1));
const SPREAD_STRAIGHT = Math.max(...STRAIGHT_D) / Math.min(...STRAIGHT_D) - 1; // the outermost gate's extra share
if (Math.max(...ARC_D) - Math.min(...ARC_D) > 1e-9 || SPREAD_STRAIGHT < 0.1) throw new Error('geometry');

// The track's outline: gates on the left, the semicircular end on the right.
function trackPath(curve) {
  ctx.beginPath();
  ctx.moveTo(gateX(0, curve) + 6, TOP);
  ctx.lineTo(END_CX, TOP);
  ctx.arc(END_CX, (TOP + BOT) / 2, (BOT - TOP) / 2, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(gateX(11, curve) + 6, BOT);
  for (let i = 11; i >= 0; i--) ctx.lineTo(gateX(i, curve) + 6, GATE_Y[i]);
  ctx.closePath();
}
function circusPlan(t, { curve = 1, stands = 1, gatesOpen = 0, spina = 1 } = {}) {
  // stands round the track
  A(stands, () => {
    ctx.fillStyle = C.stone;
    ctx.beginPath(); ctx.moveTo(gateX(0, curve) - 30, TOP - 52); ctx.lineTo(END_CX, TOP - 52);
    ctx.arc(END_CX, (TOP + BOT) / 2, (BOT - TOP) / 2 + 52, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(gateX(11, curve) - 30, BOT + 52); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(58,42,28,0.25)'; ctx.lineWidth = 1.2;
    for (let r = 1; r <= 4; r++) {
      const o = r * 10;
      ctx.beginPath(); ctx.moveTo(gateX(0, curve), TOP - o); ctx.lineTo(END_CX, TOP - o);
      ctx.arc(END_CX, (TOP + BOT) / 2, (BOT - TOP) / 2 + o, -Math.PI / 2, Math.PI / 2); ctx.lineTo(gateX(11, curve), BOT + o); ctx.stroke();
    }
  });
  ctx.fillStyle = C.track; trackPath(curve); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
  // the central barrier with its turning posts
  A(spina, () => {
    ctx.fillStyle = C.stone; k.rrect(SPINA_X0, SPINA_Y - 9, SPINA_X1 - SPINA_X0, 18, 6); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    for (const x of [SPINA_X0, SPINA_X1]) for (const dx of [-7, 0, 7]) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(x + dx - 4, SPINA_Y + 6); ctx.lineTo(x + dx, SPINA_Y - 16); ctx.lineTo(x + dx + 4, SPINA_Y + 6); ctx.fill(); }
  });
  // the gates: twelve stalls
  for (let i = 0; i < 12; i++) {
    const x = gateX(i, curve), y = GATE_Y[i], hgt = (BOT - TOP - 40) / 12 - 2;
    ctx.fillStyle = C.ink; ctx.fillRect(x - 34, y - hgt / 2, 34, hgt);
    // the doors, swinging open
    const o = gatesOpen;
    ctx.strokeStyle = C.chalk; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y - hgt / 2 + 1); ctx.lineTo(x + Math.sin(o * 1.3) * hgt * 0.5, y - hgt / 2 + 1 + Math.cos(o * 1.3) * hgt * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + hgt / 2 - 1); ctx.lineTo(x + Math.sin(o * 1.3) * hgt * 0.5, y + hgt / 2 - 1 - Math.cos(o * 1.3) * hgt * 0.5); ctx.stroke();
  }
}
function breakLine(a) {
  A(a, () => {
    ctx.strokeStyle = C.chalk; ctx.lineWidth = 5; ctx.setLineDash([10, 7]);
    ctx.beginPath(); ctx.moveTo(P.x, SPINA_Y + 10); ctx.lineTo(P.x, BOT - 2); ctx.stroke(); ctx.setLineDash([]);
  });
}
function pointP(a, label = true) {
  A(a, () => {
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(P.x, P.y, 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.chalk; ctx.lineWidth = 3; ctx.stroke();
    if (label) { font(700, 24); text('BREAK LINE', P.x + 18, BOT - 20, { base: 'middle', color: C.ink, spacing: '1px' }); }
  });
}
/** Strings from each gate to the point; `curve` sets the gates, `a` the opacity. */
function strings(curve, a, colour = C.ink) {
  A(a, () => {
    ctx.strokeStyle = colour; ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(gateX(i, curve), GATE_Y[i]); ctx.lineTo(P.x, P.y); ctx.stroke(); }
  });
}
/** The twelve distances as bars, laid side by side below the plan. */
function bars(curve, a, y0 = 610) {
  A(a, () => {
    const base = Math.min(...STRAIGHT_D) * 0.9, scale = 520 / (Math.max(...STRAIGHT_D) - base);
    for (let i = 0; i < 12; i++) {
      const d = dist(i, curve), y = y0 + i * 13.5;
      ctx.fillStyle = FACTIONS[i % 4] === C.white ? '#8d7b63' : FACTIONS[i % 4];
      ctx.fillRect(170, y, (d - base) * scale, 9);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(170, y0 - 6); ctx.lineTo(170, y0 + 12 * 13.5); ctx.stroke();
    font(600, 22); text('DISTANCE TO THE POINT', 170, y0 - 22, { base: 'middle', color: C.soft, spacing: '1px' });
  });
}

// ---------- A: the valley ----------
function sceneValley(t) {
  A(span(t, 0, 9.6, 0.4, 0.4), () => {
    // hills as soft contour blobs
    const hill = (cx, cy, rx, ry, name, a) => {
      for (let i = 0; i < 4; i++) { ctx.fillStyle = C.hill; ctx.beginPath(); ctx.ellipse(cx, cy, rx * (1 - i * 0.2), ry * (1 - i * 0.2), -0.2, 0, TAU); ctx.fill(); }
      A(a, () => { font(700, 30); text(name, cx, cy, { align: 'center', base: 'middle', color: C.ink, spacing: '4px' }); });
    };
    A(1 - 0.75 * seg(t, 5.0, 5.8), () => {
      hill(430, 150, 330, 100, 'PALATINE', seg(t, 0.6, 1.4));
      hill(430, 660, 340, 110, 'AVENTINE', seg(t, 0.9, 1.7));
    });
    const g = eout(seg(t, 1.6, 3.0));
    A(g, () => {
      ctx.save(); ctx.translate(CX, 400); ctx.scale(0.8, 0.6); ctx.translate(-CX, -400);
      circusPlan(t, { stands: 1 });
      ctx.restore();
    });
    A(seg(t, 2.8, 3.6), () => {
      font(800, 30); ctx.fillStyle = 'rgba(236,220,185,0.9)'; k.rrect(CX - 150, 432, 300, 44, 10); ctx.fill();
      text('CIRCUS MAXIMUS', CX, 455, { align: 'center', base: 'middle', color: C.ink, spacing: '4px' });
    });
    A(seg(t, 5.0, 5.8), () => {
      const y = 262, x0 = 70, x1 = 784;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y);
      for (const [x, d] of [[x0, 1], [x1, -1]]) { ctx.moveTo(x + d * 14, y - 8); ctx.lineTo(x, y); ctx.lineTo(x + d * 14, y + 8); }
      ctx.stroke();
      ctx.fillStyle = C.sand; ctx.fillRect(CX - 90, y - 20, 180, 40);
      font(800, 30); text('≈ 620 m', CX, y + 1, { align: 'center', base: 'middle', color: C.ink });
    });
    // the buried track
    A(seg(t, 5.4, 6.4), () => {
      const x0 = 120, x1 = 744, yTop = 560, d = 6 * 16;
      ctx.fillStyle = 'rgba(236,220,185,0.94)'; k.rrect(x0 - 20, yTop - 54, x1 - x0 + 40, d + 96, 12); ctx.fill();
      ctx.fillStyle = '#7fa15a'; ctx.fillRect(x0, yTop, x1 - x0, 10);
      ctx.fillStyle = '#b59a72'; ctx.fillRect(x0, yTop + 10, x1 - x0, d - 10);
      ctx.fillStyle = C.track2; ctx.fillRect(x0, yTop + d, x1 - x0, 12);
      font(600, 22); text('TODAY: A PARK', x0, yTop - 22, { base: 'middle', color: C.ink, spacing: '1px' });
      text('ANCIENT TRACK', x0 + 10, yTop + d - 18, { base: 'middle', color: C.chalk, spacing: '1px' });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x1 - 40, yTop + 12); ctx.lineTo(x1 - 40, yTop + d - 2); ctx.stroke();
      font(800, 30); text('≈ 6 m', x1 - 54, yTop + d / 2 + 4, { align: 'right', base: 'middle', color: C.ink });
    });
  });
}

// ---------- B: the gates ----------
function sceneGates(t) {
  A(span(t, 9.4, 23.4, 0.5, 0.4), () => {
    const open = eout(seg(t, 16.4, 17.0));
    circusPlan(t, { curve: 1, gatesOpen: open });
    A(seg(t, 10.0, 10.8) * (1 - seg(t, 14.0, 14.4)), () => {
      font(800, 30); text('12 GATES', 170, 170, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
      font(500, 22, SERIF); text('carceres', 170, 202, { align: 'center', base: 'middle', color: C.soft });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(170, 216); ctx.lineTo(gateX(0, 1) - 20, GATE_Y[0] - 8); ctx.stroke();
    });
    A(seg(t, 11.0, 11.8), () => {
      font(600, 22); text('← ENTRANCE', gateX(6, 1) + 18, (GATE_Y[5] + GATE_Y[6]) / 2, { base: 'middle', color: C.soft });
    });
    // the white cloth, dropped from above the gates
    A(seg(t, 14.4, 14.8) * (1 - seg(t, 17.6, 18.2)), () => {
      const fall = eio(seg(t, 15.4, 16.4));
      const x = 120, y = lerp(150, 236, fall);
      ctx.fillStyle = C.chalk; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - 22, y - 16); ctx.quadraticCurveTo(x, y - 24 + fall * 10, x + 22, y - 16); ctx.lineTo(x + 18, y + 20); ctx.quadraticCurveTo(x, y + 12, x - 18, y + 20); ctx.closePath(); ctx.fill(); ctx.stroke();
      font(700, 22); text('MAPPA', x + 40, 150, { base: 'middle', color: C.ink, spacing: '1px' });
    });
    // chariots leaving, in lanes, to the break line
    const go = seg(t, 16.6, 22.4);
    if (go > 0) {
      breakLine(seg(t, 18.8, 19.6));
      pointP(seg(t, 19.4, 20.2));
      A(seg(t, 18.8, 19.6), () => {
        ctx.strokeStyle = 'rgba(255,250,240,0.7)'; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
        for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(gateX(i, 1), GATE_Y[i]); ctx.lineTo(P.x, lerp(SPINA_Y + 16, BOT - 8, i / 11)); ctx.stroke(); }
        ctx.setLineDash([]);
      });
      for (let i = 0; i < 12; i += 1) {
        const u = eio(clamp((go - 0.0) * 1.15));
        const x = lerp(gateX(i, 1), P.x, u), y = lerp(GATE_Y[i], lerp(SPINA_Y + 16, BOT - 8, i / 11), u);
        chariot(x, y, FACTIONS[i % 4], 0.8);
      }
    }
  });
}
function chariot(x, y, col, s = 1, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 12, 7, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.fillRect(10, -6, 12, 3); ctx.fillRect(10, 3, 12, 3);
  ctx.restore();
}

// ---------- D: the geometry ----------
function sceneGeometry(t) {
  A(span(t, 23.4, 41.8, 0.5, 0.4), () => {
    const curve = eio(seg(t, 32.8, 35.2));
    circusPlan(t, { curve, stands: 0.6 });
    breakLine(1); pointP(1, false);
    strings(curve, seg(t, 24.0, 24.8));
    bars(curve, seg(t, 25.0, 25.8));
    // the straight row: label the farthest and nearest
    A(seg(t, 26.0, 26.8) * (1 - seg(t, 32.4, 32.8)), () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(gateX(0, 0), GATE_Y[0]); ctx.lineTo(P.x, P.y); ctx.stroke();
      font(700, 24); text('FARTHEST', gateX(0, 0) + 30, GATE_Y[0] - 22, { base: 'middle', color: C.red });
      font(600, 24); text(`+${Math.round(SPREAD_STRAIGHT * 100)}% IN THIS SKETCH`, 170 + 400, 600 - 22, { align: 'left', base: 'middle', color: C.red });
    });
    A(seg(t, 28.0, 28.8) * (1 - seg(t, 32.4, 32.8)), () => {
      font(800, 26); text('A STRAIGHT ROW', 150, 160, { base: 'middle', color: C.ink, spacing: '2px' });
    });
    // the compass: radius from P sweeping the arc
    A(seg(t, 33.0, 33.6), () => {
      const sweep = eio(seg(t, 33.2, 35.6));
      const a0 = Math.atan2(GATE_Y[11] - P.y, arcX(GATE_Y[11]) - P.x) - 0.22, a1 = Math.atan2(GATE_Y[0] - P.y, arcX(GATE_Y[0]) - P.x) + TAU + 0.22;
      const a = lerp(a0, a1, sweep);
      ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.setLineDash([10, 6]);
      ctx.beginPath(); ctx.arc(P.x, P.y, R + 3, a0, a, false); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(P.x + R * Math.cos(a), P.y + R * Math.sin(a)); ctx.stroke();
      font(800, 26); text('AN ARC ROUND THE POINT', 150, 160, { base: 'middle', color: C.red, spacing: '2px' });
    });
    A(seg(t, 37.4, 38.2), () => {
      font(800, 30); text('ALL EQUAL', 170 + 400, 600 - 22, { align: 'left', base: 'middle', color: C.green, spacing: '2px' });
    });
  });
}
function sceneLots(t) {
  A(span(t, 41.6, 46.4, 0.4, 0.4), () => {
    circusPlan(t, { curve: 1, stands: 0.6 });
    breakLine(1); pointP(1, false);
    // gates draw lots: colours shuffle, then settle
    const order = [3, 0, 2, 1, 1, 3, 0, 2, 2, 1, 3, 0];
    for (let i = 0; i < 12; i++) {
      const spin = seg(t, 42.0, 44.0);
      const c = spin < 1 ? FACTIONS[(i + Math.floor(t * 12)) % 4] : FACTIONS[order[i]];
      chariot(gateX(i, 1) + 18, GATE_Y[i], c, 0.75);
    }
    A(seg(t, 42.2, 43.0), () => { font(800, 30); text('DRAWN BY LOT', 150, 160, { base: 'middle', color: C.ink, spacing: '2px' }); });
    A(seg(t, 43.4, 44.2), () => {
      font(800, 30, SERIF);
      const labels = [['Reds', C.red], ['Whites', '#8d7b63'], ['Greens', C.green], ['Blues', C.blue]];
      labels.forEach(([s, col], i) => { chariot(150 + i * 165, 650, FACTIONS[i], 1.3); text(s, 178 + i * 165, 650, { base: 'middle', color: col }); });
    });
  });
}

// ---------- E: seven laps ----------
const LAP_T0 = 46.6, LAP_DUR = 1.25;
/** A point on the lap loop around the barrier: 0..1, counter-clockwise on screen, starting at the break line. */
function lapXY(u, lane = 0) {
  const inner = 34 + lane * 12, cy = SPINA_Y;
  const L = SPINA_X1 - SPINA_X0, turn = Math.PI * inner, total = 2 * L + 2 * turn;
  let d = (((u % 1) + 1) % 1) * total;
  if (d < L) return [SPINA_X0 + d, cy + inner];
  d -= L;
  if (d < turn) { const a = Math.PI / 2 - d / inner; return [SPINA_X1 + inner * Math.cos(a), cy + inner * Math.sin(a)]; }
  d -= turn;
  if (d < L) return [SPINA_X1 - d, cy - inner];
  d -= L;
  const a = -Math.PI / 2 - d / inner;
  return [SPINA_X0 + inner * Math.cos(a), cy + inner * Math.sin(a)];
}
/** Position and heading on the lap loop round the barrier (u in laps), counter-clockwise on screen. */
function lapPoint(u, lane = 0) {
  const [x, y] = lapXY(u, lane), [x2, y2] = lapXY(u + 0.002, lane);
  return [x, y, Math.atan2(y2 - y, x2 - x)];
}
function egg(x, y, on) {
  ctx.fillStyle = on ? C.gold : 'rgba(58,42,28,0.18)';
  ctx.beginPath(); ctx.ellipse(x, y, 13, 18, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
}
function dolphin(x, y, on) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(on ? 0 : 0.9);
  ctx.fillStyle = on ? C.blue : 'rgba(58,42,28,0.18)'; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-18, 4); ctx.quadraticCurveTo(-4, -16, 16, -4); ctx.quadraticCurveTo(22, 0, 16, 4); ctx.quadraticCurveTo(0, 8, -18, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-18, 4); ctx.lineTo(-26, -4); ctx.lineTo(-24, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function sceneLaps(t) {
  A(span(t, 46.2, 55.8, 0.4, 0.4), () => {
    circusPlan(t, { curve: 1, stands: 0.6 });
    const lapsDone = clamp(Math.floor((t - LAP_T0) / LAP_DUR), 0, 7);
    // chariots on the loop
    if (t > LAP_T0) {
      for (let c = 0; c < 4; c++) {
        const u = Math.min(7, (t - LAP_T0) / LAP_DUR) - c * 0.05;
        const [x, y, ang] = lapPoint(u, c % 2);
        chariot(x, y, FACTIONS[c], 1.15, ang);
      }
    }
    // the counters: seven eggs, seven dolphins, above the plan
    A(seg(t, 46.6, 47.4), () => {
      font(700, 24); text('EGGS', 90, 650, { base: 'middle', color: C.ink, spacing: '2px' });
      for (let i = 0; i < 7; i++) egg(182 + i * 34, 650, i >= lapsDone);
    });
    A(seg(t, 50.8, 51.6), () => {
      font(700, 24); text('DOLPHINS', 450, 650, { base: 'middle', color: C.ink, spacing: '2px' });
      for (let i = 0; i < 7; i++) dolphin(600 + (i % 4) * 52 + (i >= 4 ? 26 : 0), 632 + (i >= 4 ? 40 : 0), i >= lapsDone);
    });
    A(seg(t, 47.0, 47.6), () => {
      font(800, 50); text(`LAP ${Math.min(7, lapsDone + 1)}`, 300, 140, { align: 'center', base: 'middle', color: C.ink, spacing: '3px' });
      font(500, 24, SERIF); text('of seven, counter-clockwise', 430, 142, { base: 'middle', color: C.soft });
    });
  });
}

// ---------- F: how many ----------
function sceneCrowd(t) {
  A(span(t, 55.6, 65.4, 0.4, 0.0), () => {
    font(700, 26); text('HOW MANY WATCHED?', CX, 120, { align: 'center', base: 'middle', color: C.soft, spacing: '3px' });
    const items = [
      ['DIONYSIUS OF HALICARNASSUS', 150000, C.green, 56.0],
      ['PLINY THE ELDER', 250000, C.red, 57.0],
      ['MODERN ESTIMATE, AT MOST ABOUT', 150000, C.blue, 60.4],
    ];
    const L = 110, max = 260000, wBar = 540;
    items.forEach(([name, v, col, t0], i) => {
      const g = eio(seg(t, t0, t0 + 1.2));
      const y = 230 + i * 150;
      A(seg(t, t0, t0 + 0.4), () => {
        font(700, 22); text(name, L, y - 26, { base: 'middle', color: col, spacing: '1px' });
        ctx.fillStyle = col; ctx.fillRect(L, y, wBar * (v / max) * g, 56);
        font(800, 34); text(Kit.fmt(v * g), L + wBar * (v / max) * g + 14, y + 29, { base: 'middle', color: C.ink });
      });
    });
    A(seg(t, 58.4, 59.0) * (1 - seg(t, 60.0, 60.4)), () => { font(600, 24, SERIF); text('modern scholars think this unlikely', L, 468, { base: 'middle', color: C.red }); });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.sand); lg.addColorStop(1, C.sand2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(90,60,30,${r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r() * 1.5, 1 + r()); }
  g.strokeStyle = 'rgba(58,42,28,0.07)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'The Circus Maximus lay between Rome’s *Palatine* and *Aventine* hills.'],
  [5.0, 9.4, 'Its track was about *620 m* long. Today it is a park, and the old track lies ~6 m~ down.'],
  [9.6, 14.0, 'Races started from *12 gates*, the carceres, six either side of an entrance.'],
  [14.2, 18.6, 'The presiding magistrate dropped a *white cloth*, and the 12 gates sprang open.'],
  [18.8, 23.2, 'Drivers had to stay in their lanes until a white *break line* across the first straight.'],
  [23.4, 27.8, 'Measure from each gate to the middle of the break line: the lengths are not the same.'],
  [28.0, 32.4, 'In a ~straight row~, the outer gates would sit farther away: an unfair start.'],
  [32.6, 37.0, 'So the gates stood on a *curve*: an arc of a circle centred on that point.'],
  [37.2, 41.6, 'Every point of a circle is equally far from its centre: *equal runs* for all.'],
  [41.8, 46.2, 'Gates were drawn by *lot*, among the teams: Reds, Whites, Greens and Blues.'],
  [46.4, 50.8, 'A race was usually *seven laps*, counted off on seven large eggs from at least 174 BC.'],
  [51.0, 55.4, 'People kept miscounting, so in 33 BC the general Marcus Agrippa added seven *dolphins*.'],
  [55.6, 60.0, 'The historian Dionysius wrote of *150,000* seats, the writer Pliny the Elder of ~250,000~.'],
  [60.2, 64.6, 'Modern scholars think about *150,000* at most, in Rome’s largest stadium.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [LAB, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneValley(t);
    sceneGates(t);
    sceneGeometry(t);
    sceneLots(t);
    sceneLaps(t);
    sceneCrowd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 600, family: SERIF, ink: C.ink, marks: { '*': C.red, '~': C.blue } });
  },
});
