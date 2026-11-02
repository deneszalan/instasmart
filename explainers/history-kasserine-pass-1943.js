// Explainer for history-kasserine-pass-1943 (Tunisia 1943): the Battle of Kasserine Pass, February 1943. German
// and Italian forces broke through the passes of central Tunisia; inexperienced US units, spread thin, were pushed
// back about 50 miles before British, American and French troops held at Sbiba, Djebel el Hamra and Thala; then the
// Allies changed their command, training and cooperation. Look: a staff map on dark olive card, the two mountain
// ridges (the Eastern and Western Dorsal) drawn as hachures, Axis moves as rust arrows, Allied positions in steel
// blue; no explosions, no casualty figures. Archivo for headings and labels, Barlow for the captions.
//
// Facts:
// - The National WWII Museum, Keith Huxen, "The Battle of Kasserine Pass" (5 February 2018): the first campaign in
//   which the US Army fought the German armed forces; mid-February 1943 Rommel used the 10th and 21st Panzer
//   divisions to push the Allied lines back from the Eastern to the Western Dorsale; early on 19 February the
//   Germans attacked through Kasserine Pass and the Allies retreated westward about 50 miles; why: commanders had
//   not reconnoitred the ground, American, British and French forces were uncoordinated, Fredendall split his
//   divisions' elements, US troops and equipment showed the army's inexperience; 22 February: II Corps and British
//   reserves regrouped and held, a massive artillery attack halted the offensive; Rommel, overextended, ordered his
//   units back; afterwards: emphasis on air superiority, cover, positioning units to cover each other; Eisenhower
//   created the 18th Army Group under Harold Alexander and put Patton in charge of US II Corps.
// - The National WWII Museum, Mark T. Calhoun, "US II Corps at El Guettar" (22 March 2023): Patton took command
//   of II Corps on 6 March 1943; on 23 March the 10th Panzer Division attacked towards Gafsa, was stopped by US
//   artillery, tank destroyers and a minefield, and withdrew by midday.
// - Martin Blumenson, "Kasserine Pass, Battle of", Dictionary of American History (Encyclopedia.com): 30 January
//   Faïd; 14 February von Arnim attacks; the 1st Armored Division lost "ninety-eight tanks and about half of its
//   combat effectiveness in two days"; the Allies withdrew about fifty miles from the Eastern to the Western Dorsale;
//   Rommel's thrusts towards Tébessa and Thala were halted; he withdrew on 22 February; the Allies retook the pass on
//   25 February; the Americans revised their training programs, Patton restored II Corps' spirit, Alexander
//   improved the ground command system.
// - Wikipedia, "Battle of Kasserine Pass" (from Playfair et al., Westrate, Watson): on 14 February the infantry at
//   Sidi Bou Zid, "poorly sited on three hills and unable to give mutual support", was isolated; Sbiba held and the
//   21st Panzer was driven back by 20 February; Djebel el Hamra held on 21–22 February; at Thala on 22 February a
//   barrage of massed British and US guns, with the 9th Division's artillery just arrived from Morocco, stopped the
//   10th Panzer; lessons: units too far apart for mutual support, shallow scrapes instead of deep foxholes.
// The map is schematic: towns from their coordinates, ridges and arrows simplified.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  Central Tunisia, February 1943; the two ridges and their passes.
//  B  9.6–27.8  Sidi Bou Zid: separate hills, cut off; the 1st Armored Division's losses; back about 50 miles.
//  C 28.0–51.0  Kasserine Pass, 19–20 February; held at Sbiba, Djebel el Hamra and Thala; the Axis pulls back.
//  D 51.0–64.6  One Allied command; Patton for Fredendall; new training; El Guettar, 23 March.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#1f261e', bg2: '#141912', ink: '#f1ead7', soft: 'rgba(241,234,215,0.74)', faint: 'rgba(241,234,215,0.24)', line: 'rgba(241,234,215,0.07)',
  ridge: '#b79c69', ridgeDim: 'rgba(183,156,105,0.45)', axis: '#e2704f', allied: '#7db8e2', gold: '#e9c45c', panel: 'rgba(14,18,13,0.86)',
};
const HEAD = 'Archivo', TXT = 'Barlow';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the map: longitude and latitude to the canvas (schematic, equal-area at 35° N) ----------
const KX = 328, KY = 400, LON0 = 7.95, LAT0 = 35.95;
const P = (lon, lat) => [60 + (lon - LON0) * KX, 80 + (LAT0 - lat) * KY];
const KM_PER_PX = 91 / KX; // one degree of longitude is about 91 km at 35° N
const PLACES = {
  tebessa: [8.12, 35.40], kasserine: [8.83, 35.17], pass: [8.73, 35.24], thala: [8.67, 35.57], sbiba: [9.07, 35.55],
  sbeitla: [9.13, 35.23], sidi: [9.50, 34.87], faid: [9.66, 34.96], feriana: [8.57, 34.95], gafsa: [8.78, 34.42],
  guettar: [8.95, 34.34], hamra: [8.56, 35.23],
};
const XY = Object.fromEntries(Object.entries(PLACES).map(([key, [lo, la]]) => [key, P(lo, la)]));
// the two ridges, with gaps at the passes
const WEST = [[[8.30, 34.95], [8.48, 35.07], [8.66, 35.20]], [[8.79, 35.29], [8.92, 35.38], [9.01, 35.44]], [[9.11, 35.51], [9.35, 35.70], [9.60, 35.92]]];
const EAST = [[[9.42, 34.35], [9.52, 34.56], [9.60, 34.75], [9.63, 34.90]], [[9.69, 35.02], [9.78, 35.24], [9.85, 35.45], [9.95, 35.90]]];
// The retreat of about 50 miles: from the Faïd Pass back to the Kasserine Pass, straight-line, about 80–90 km.
const RETREAT_KM = Math.hypot(XY.faid[0] - XY.pass[0], (XY.faid[1] - XY.pass[1]) * (KX / KY)) * KM_PER_PX;
if (RETREAT_KM < 75 || RETREAT_KM > 95) throw new Error(`retreat ${RETREAT_KM}`);
const TANKS_LOST = 98; // Blumenson: 98 tanks and about half the division's combat effectiveness in two days

/** Hachures along a ridge line: short strokes on both sides, as on an old staff map. */
function ridge(pts, a, col = C.ridge) {
  A(a, () => {
    ctx.strokeStyle = col; ctx.lineCap = 'round';
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = P(...pts[i]), [x2, y2] = P(...pts[i + 1]);
      const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.round(len / 9));
      const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
      ctx.lineWidth = 3;
      for (let j = 0; j <= n; j++) {
        const x = lerp(x1, x2, j / n), y = lerp(y1, y2, j / n), l = 9 + 4 * Math.sin(j * 1.7 + i);
        ctx.beginPath(); ctx.moveTo(x - nx * l, y - ny * l); ctx.lineTo(x + nx * l, y + ny * l); ctx.stroke();
      }
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.lineCap = 'butt';
  });
}

/** An arrow along a polyline, drawn to fraction `g` of its length. */
function arrow(pts, g, col, { w = 9, dash = null } = {}) {
  if (g <= 0) return;
  const seglen = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seglen.push(l); total += l; }
  let left = total * clamp(g), end = pts[0], dir = [1, 0];
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 0; i < seglen.length && left > 0; i++) {
    const f = Math.min(1, left / seglen[i]);
    end = [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
    dir = [(pts[i + 1][0] - pts[i][0]) / seglen[i], (pts[i + 1][1] - pts[i][1]) / seglen[i]];
    ctx.lineTo(...end); left -= seglen[i];
  }
  ctx.stroke(); ctx.setLineDash([]);
  const s = w * 2.3;
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(end[0] + dir[0] * s, end[1] + dir[1] * s);
  ctx.lineTo(end[0] - dir[1] * s * 0.8, end[1] + dir[0] * s * 0.8);
  ctx.lineTo(end[0] + dir[1] * s * 0.8, end[1] - dir[0] * s * 0.8);
  ctx.closePath(); ctx.fill();
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
}

/** A town: a dot and its name. */
function town(key, name, { dx = 14, dy = 0, align = 'left', a = 1, col = C.ink, size = 23 } = {}) {
  A(a, () => {
    const [x, y] = XY[key];
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.bg2; ctx.lineWidth = 2; ctx.stroke();
    font(600, size, TXT); text(name, x + dx, y + dy, { align, color: col });
  });
}
/** A tag: a short label on a dark pill. */
function tag(s, x, y, col, { size = 23, align = 'center', w = 700 } = {}) {
  font(w, size, HEAD);
  const tw = ctx.measureText(s).width, pad = 10, bx = align === 'center' ? x - tw / 2 - pad : align === 'left' ? x - pad : x - tw - pad;
  ctx.fillStyle = C.panel; k.rrect(bx, y - size * 0.75, tw + pad * 2, size * 1.5, 8); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  text(s, x, y + 1, { align, color: col });
}
/** A "held" bar across a road: Allied blue. */
function hold(key, ang, a, len = 46, dx = 0, dy = 0) {
  A(a, () => {
    const x = XY[key][0] + dx, y = XY[key][1] + dy, c = Math.cos(ang), s = Math.sin(ang);
    ctx.strokeStyle = C.allied; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - c * len / 2, y - s * len / 2); ctx.lineTo(x + c * len / 2, y + s * len / 2); ctx.stroke();
    ctx.lineCap = 'butt';
  });
}

function baseMap(t, dim = 0) {
  A(1 - 0.7 * dim, () => {
    // the Algerian border, dashed
    A(0.6, () => {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(...P(8.32, 35.95)); ctx.lineTo(...P(8.27, 35.55)); ctx.lineTo(...P(8.30, 35.15)); ctx.lineTo(...P(8.24, 34.80)); ctx.lineTo(...P(8.05, 34.50)); ctx.stroke(); ctx.setLineDash([]);
      font(600, 22, TXT); text('ALGERIA', 112, 420, { align: 'center', color: C.soft, spacing: '2px' });
      text('TUNISIA', 226, 600, { align: 'center', color: C.soft, spacing: '2px' });
    });
    const r = seg(t, 1.0, 3.0);
    for (const part of WEST) ridge(part, r);
    for (const part of EAST) ridge(part, r);
    town('tebessa', 'Tébessa', { dy: -22, dx: 0, align: 'center', a: seg(t, 1.6, 2.4) });
    town('thala', 'Thala', { dx: -14, align: 'right', a: seg(t, 1.6, 2.4) });
    town('sbiba', 'Sbiba', { dy: -22, dx: 0, align: 'center', a: seg(t, 1.6, 2.4) });
    town('sbeitla', 'Sbeitla', { a: seg(t, 1.6, 2.4) });
    town('kasserine', 'Kasserine', { dy: 4, dx: 14, a: seg(t, 1.6, 2.4) });
    town('sidi', 'Sidi Bou Zid', { dx: -14, dy: 18, align: 'right', a: seg(t, 1.6, 2.4) });
    town('feriana', 'Fériana', { dx: 0, dy: 26, align: 'center', a: seg(t, 1.6, 2.4) });
    town('gafsa', 'Gafsa', { a: seg(t, 1.6, 2.4) });
    // scale and the word "schematic"
    A(seg(t, 2.0, 2.8), () => {
      const L = 70, R = L + 50 / KM_PER_PX, y = 760;
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(L, y - 8); ctx.lineTo(L, y); ctx.lineTo(R, y); ctx.lineTo(R, y - 8); ctx.stroke();
      font(600, 22, TXT); text('50 km', (L + R) / 2, y - 18, { align: 'center', color: C.soft });
      text('Schematic map', L, y + 24, { color: C.soft });
    });
  });
}

function ridgeNames(a) {
  A(a, () => {
    font(700, 24, HEAD);
    ctx.save(); ctx.translate(...P(9.25, 35.66)); ctx.rotate(-0.72); text('WESTERN DORSAL', 0, -46, { align: 'center', color: C.ridge, spacing: '2px' }); ctx.restore();
    ctx.save(); ctx.translate(...P(9.83, 35.30)); ctx.rotate(-1.22); text('EASTERN DORSAL', 0, 48, { align: 'center', color: C.ridge, spacing: '2px' }); ctx.restore();
  });
}

// ---------- A: the place ----------
function sceneIntro(t) {
  A(span(t, 0, 9.6, 0.5, 0.3), () => {
    font(800, 40, HEAD); text('KASSERINE PASS', 70, 108, { color: C.ink, spacing: '2px' });
    font(600, 26, TXT); text('Central Tunisia · February 1943', 70, 148, { color: C.gold });
    A(seg(t, 5.2, 6.0), () => {
      ridgeNames(1);
      // the passes, ringed
      for (const [key, name, dx, dy] of [['pass', 'Kasserine Pass', 18, -30], ['faid', 'Faïd Pass', -28, -14]]) {
        const [x, y] = XY[key];
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 20 + 3 * Math.sin(t * 3), 0, TAU); ctx.stroke();
        font(700, 23, HEAD); text(name, x + dx, y + dy, { color: C.gold, align: key === 'faid' ? 'right' : 'left' });
      }
    });
  });
}

// ---------- B: Sidi Bou Zid ----------
const HILLS = [[9.43, 34.93], [9.57, 34.83], [9.49, 34.74]].map(([lo, la]) => P(lo, la));
function sceneSidi(t) {
  A(span(t, 9.4, 28.0, 0.4, 0.4), () => {
    ridgeNames(0.5);
    // 14 February: two panzer divisions converge on Sidi Bou Zid
    const g1 = eio(seg(t, 10.0, 12.6)), g2 = eio(seg(t, 10.6, 13.2));
    const [sx, sy] = XY.sidi;
    A(1 - seg(t, 26.8, 27.6) * 0.6, () => {
      arrow([[700, 470], XY.faid, [sx + 30, sy - 8]], g1, C.axis);
      arrow([[650, 640], [612, 590], [sx + 24, sy + 26]], g2, C.axis);
    });
    A(seg(t, 11.0, 11.6) * (1 - seg(t, 13.8, 14.2)), () => {
      tag('14 FEBRUARY', 440, 604, C.axis);
      font(600, 22, TXT); text('10th and 21st Panzer divisions', 440, 644, { align: 'center', color: C.axis });
    });
    // the three hills, each with its reach: none overlaps another
    A(seg(t, 14.4, 15.2) * (1 - seg(t, 18.4, 18.8)), () => {
      HILLS.forEach(([x, y], i) => {
        const cut = seg(t, 17.0 + i * 0.3, 17.8 + i * 0.3);
        ctx.strokeStyle = C.allied; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.arc(x, y, 17, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.allied; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
        // encircled
        A(cut, () => { ctx.strokeStyle = C.axis; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU * cut); ctx.stroke(); });
      });
      // a note in a panel, away from the hills
      ctx.fillStyle = C.panel; k.rrect(440, 590, 380, 104, 12); ctx.fill();
      font(700, 24, HEAD); text('THREE SEPARATE HILLS', 630, 622, { align: 'center', color: C.allied });
      font(500, 22, TXT); text('too far apart to support each other', 630, 656, { align: 'center', color: C.ink });
      A(seg(t, 17.4, 18.0), () => { font(600, 22, TXT); text('isolated and cut off', 630, 682, { align: 'center', color: C.axis }); });
    });
    // the 1st Armored Division: about half its strength gone in two days
    A(seg(t, 19.0, 19.6) * (1 - seg(t, 23.0, 23.4)), () => {
      const x0 = 120, y0 = 590, bw = 620;
      ctx.fillStyle = C.panel; k.rrect(x0 - 30, y0 - 64, bw + 60, 190, 14); ctx.fill();
      font(700, 26, HEAD); text('US 1st ARMORED DIVISION', x0, y0 - 30, { color: C.allied, spacing: '1px' });
      const half = 1 - 0.5 * eio(seg(t, 19.8, 21.6));
      ctx.fillStyle = 'rgba(125,184,226,0.18)'; ctx.fillRect(x0, y0, bw, 30);
      ctx.fillStyle = C.allied; ctx.fillRect(x0, y0, bw * half, 30);
      font(600, 22, TXT); text('fighting strength', x0, y0 + 54, { color: C.soft });
      A(seg(t, 21.4, 22.0), () => {
        text('about half, in two days', x0 + bw, y0 + 54, { align: 'right', color: C.gold });
        font(700, 24, HEAD); text(`${fmt(TANKS_LOST)} tanks lost`, x0 + bw, y0 + 92, { align: 'right', color: C.ink });
      });
    });
    // falling back about 50 miles to the Western Dorsal
    const back = eio(seg(t, 23.6, 26.2));
    A(seg(t, 23.4, 23.8), () => {
      arrow([[sx - 18, sy - 14], XY.sbeitla, [XY.pass[0] + 40, XY.pass[1] + 6]], back, C.allied, { w: 7, dash: [16, 12] });
      arrow([XY.gafsa, XY.feriana, [XY.kasserine[0] - 10, XY.kasserine[1] + 14]], back, C.allied, { w: 7, dash: [16, 12] });
      A(seg(t, 25.6, 26.2), () => tag('BACK ABOUT 50 MILES (80 KM)', 520, 300, C.allied, { size: 22 }));
    });
  });
}

// ---------- C: Kasserine Pass ----------
function sceneKasserine(t) {
  A(span(t, 27.8, 51.2, 0.4, 0.5), () => {
    ridgeNames(0.35);
    const [px, py] = XY.pass;
    // 19 February: the attack on the pass, and 21st Panzer towards Sbiba
    const g = eio(seg(t, 28.6, 30.8));
    arrow([[XY.kasserine[0] + 8, XY.kasserine[1] + 44], [px + 12, py + 8]], g, C.axis);
    arrow([[XY.sbeitla[0] + 10, XY.sbeitla[1] + 10], [XY.sbiba[0] + 8, XY.sbiba[1] + 34]], eio(seg(t, 29.2, 31.4)), C.axis);
    A(seg(t, 29.0, 29.6) * (1 - seg(t, 36.6, 37.0)), () => {
      tag('19 FEBRUARY', 436, 584, C.axis);
      font(600, 22, TXT); text('German and Italian troops', 436, 624, { align: 'center', color: C.axis });
      text('under Erwin Rommel', 436, 652, { align: 'center', color: C.axis });
    });
    // 20 February: through the pass, towards Thala and Tébessa
    const b = eio(seg(t, 33.0, 35.6));
    arrow([[px - 2, py - 6], [XY.thala[0] + 6, XY.thala[1] + 40]], b, C.axis, { w: 8 });
    arrow([[px - 8, py + 2], [XY.hamra[0] + 34, XY.hamra[1] + 2]], b, C.axis, { w: 8 });
    A(seg(t, 33.2, 33.8) * (1 - seg(t, 41.6, 42.0)), () => tag('20 FEBRUARY: THE PASS FALLS', 470, 170, C.axis, { size: 22 }));
    // held: Sbiba, Djebel el Hamra, Thala
    hold('sbiba', 0, seg(t, 38.0, 38.6), 50);
    A(seg(t, 38.2, 38.8), () => { font(600, 22, TXT); text('held, 19–20 Feb', XY.sbiba[0] + 34, XY.sbiba[1] + 34, { color: C.allied }); });
    hold('hamra', Math.PI / 2, seg(t, 39.2, 39.8), 50);
    A(seg(t, 39.4, 40.0), () => {
      font(600, 22, TXT); text('Djebel el Hamra', XY.hamra[0] - 18, XY.hamra[1] - 12, { align: 'right', color: C.allied });
      text('held, 21–22 Feb', XY.hamra[0] - 18, XY.hamra[1] + 16, { align: 'right', color: C.allied });
    });
    // Thala, 22 February: massed guns
    const tg = seg(t, 42.0, 42.8);
    hold('thala', 0, tg, 54, 8, 30);
    A(tg, () => {
      const [tx, ty] = XY.thala;
      // a row of gun marks behind the line (schematic), not explosions
      for (let i = 0; i < 9; i++) {
        const gx = tx - 80 + i * 20, gy = ty - 40 + (i % 2) * 8;
        ctx.fillStyle = C.allied; ctx.fillRect(gx - 6, gy - 4, 12, 8);
        ctx.strokeStyle = C.allied; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + 6, gy + 12); ctx.stroke();
      }
      tag('22 FEB · THALA', 230, 120, C.allied, { size: 22 });
      font(600, 22, TXT); text('massed British and US guns', 230, 158, { align: 'center', color: C.allied });
    });
    // the Axis pulls back; the pass retaken
    const pull = seg(t, 46.6, 48.8);
    A(seg(t, 46.4, 47.0), () => {
      arrow([[px + 20, py - 10], [XY.kasserine[0] + 60, XY.kasserine[1] + 70], [XY.sidi[0] - 10, XY.sidi[1] - 40]], eio(pull), C.axis, { w: 6, dash: [10, 10] });
      A(seg(t, 48.4, 49.0), () => tag('PASS RETAKEN, 24–25 FEB', 520, 640, C.allied, { size: 22 }));
    });
  });
}

// ---------- D: what changed ----------
function sceneAfter(t) {
  A(span(t, 51.0, 65.2, 0.4, 0), () => {
    // one command over three nations' forces (cue 12)
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 120, W - 160, 560, 20); ctx.fill();
      font(800, 30, HEAD); text('ONE ALLIED COMMAND', CX, 172, { align: 'center', color: C.gold, spacing: '2px' });
      ctx.fillStyle = 'rgba(233,196,92,0.14)'; k.rrect(170, 220, W - 340, 104, 14); ctx.fill();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
      font(700, 28, HEAD); text('18th Army Group', CX, 258, { align: 'center', color: C.ink });
      font(500, 23, TXT); text('British general Harold Alexander', CX, 294, { align: 'center', color: C.soft });
      const g = seg(t, 52.4, 53.4);
      [['British', 214], ['American', CX], ['French', W - 214]].forEach(([n, x], i) => A(seg(t, 52.4 + i * 0.3, 53.0 + i * 0.3), () => {
        ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(CX, 324); ctx.lineTo(x, 420); ctx.stroke();
        ctx.fillStyle = 'rgba(125,184,226,0.16)'; k.rrect(x - 110, 420, 220, 76, 12); ctx.fill();
        ctx.strokeStyle = C.allied; ctx.lineWidth = 2; ctx.stroke();
        font(700, 25, HEAD); text(n, x, 458, { align: 'center', color: C.allied });
      }));
      void g;
      A(seg(t, 53.2, 53.8), () => { font(500, 23, TXT); text('set up by Allied commander Dwight D. Eisenhower', CX, 590, { align: 'center', color: C.soft }); });
    });
    // Patton for Fredendall, and the lessons (cue 13)
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 120, W - 160, 600, 20); ctx.fill();
      font(800, 30, HEAD); text('US II CORPS, 6 MARCH 1943', CX, 172, { align: 'center', color: C.gold, spacing: '1px' });
      font(600, 25, TXT);
      text('Lloyd Fredendall', CX - 170, 236, { align: 'center', color: C.soft });
      text('George S. Patton', CX + 170, 236, { align: 'center', color: C.allied });
      arrow([[CX - 50, 236], [CX + 40, 236]], seg(t, 56.0, 56.8), C.gold, { w: 5 });
      font(700, 26, HEAD); text('NEW LESSONS', CX, 310, { align: 'center', color: C.ink, spacing: '2px' });
      // three positions now within reach of each other
      const ys = 470, xs = [CX - 150, CX, CX + 150], grow = eout(seg(t, 56.6, 57.8));
      xs.forEach((x) => {
        ctx.strokeStyle = C.allied; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.arc(x, ys, 30 + 128 * grow, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.allied; ctx.beginPath(); ctx.arc(x, ys, 12, 0, TAU); ctx.fill();
      });
      A(seg(t, 57.4, 58.0), () => {
        font(600, 23, TXT);
        text('units close enough to help each other', CX, 640, { align: 'center', color: C.ink });
        text('deep foxholes · guns and aircraft working together', CX, 676, { align: 'center', color: C.soft });
      });
    });
    // El Guettar, 23 March (cue 14)
    A(seg(t, 60.0, 60.6), () => {
      baseMap(99, 0.5);
      const [gx, gy] = XY.guettar;
      town('guettar', 'El Guettar', { a: 1, col: C.gold, dx: 0, dy: 28, align: 'center' });
      arrow([[gx + 200, gy - 6], [gx + 44, gy - 4]], eio(seg(t, 60.8, 62.0)), C.axis, { w: 8 });
      A(seg(t, 62.0, 62.6), () => { ctx.strokeStyle = C.allied; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(gx + 26, gy - 30); ctx.lineTo(gx + 26, gy + 20); ctx.stroke(); ctx.lineCap = 'butt'; });
      A(seg(t, 62.2, 62.8), () => {
        tag('23 MARCH 1943: ATTACK STOPPED', 470, 640, C.allied, { size: 22 });
      });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.line; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 790); g.stroke(); }
  for (let y = 0; y <= 790; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'Central Tunisia, February 1943: the US Army’s first campaign against the *German army*.'],
  [5.0, 9.4, 'Two mountain ridges cross the land, the *Eastern* and the *Western Dorsal*, cut by passes.'],
  [9.6, 14.0, '14 February: two German ~panzer divisions~ strike at Sidi Bou Zid, west of the Faïd Pass.'],
  [14.2, 18.6, 'US troops sat on *separate hills*, too far apart to help each other, and were cut off.'],
  [18.8, 23.2, 'In two days the US 1st Armored Division lost 98 tanks, about *half its strength*.'],
  [23.4, 27.8, 'The Allies fell back about *50 miles*, to the passes of the Western Dorsal.'],
  [28.0, 32.4, '19 February: German and Italian troops under ~Erwin Rommel~ attack the *Kasserine Pass*.'],
  [32.6, 37.0, 'On 20 February they break through and push on towards Thala and Tébessa.'],
  [37.2, 41.6, 'At Sbiba and Djebel el Hamra, British, American and French troops *hold the roads*.'],
  [41.8, 46.2, '22 February, Thala: massed British and US *guns* stop the last German attack.'],
  [46.4, 50.8, 'Short of fuel, facing reinforcements, Rommel pulls back; the Allies *retake the pass*.'],
  [51.0, 55.4, 'Allied commander Dwight D. Eisenhower put British general *Harold Alexander* over all the armies.'],
  [55.6, 60.0, 'On 6 March *George Patton* replaced Lloyd Fredendall at US II Corps, and training changed.'],
  [60.2, 64.6, '23 March, El Guettar: dug in, with their artillery, US troops *stop* a German tank attack.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    const dim = Math.max(seg(t, 50.8, 51.4) * (1 - seg(t, 59.8, 60.4)), 0);
    if (t < 60.2) baseMap(t, dim);
    sceneIntro(t);
    sceneSidi(t);
    sceneKasserine(t);
    sceneAfter(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.gold, '~': C.axis } });
  },
});
