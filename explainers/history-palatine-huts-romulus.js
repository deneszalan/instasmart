// Explainer for history-palatine-huts-romulus (Roma): legend says Romulus founded Rome on the Palatine Hill on
// 21 April 753 BC, but that year was worked out some 700 years later by counting back the reigns of seven kings,
// while archaeology dates the Palatine by what is cut into its rock: hut floors and post-holes of a village of the
// 9th to 7th centuries BC. Look: dusk over the hill, ochre tuff in section, thatch and woven walls, a gold ribbon for
// the legend's dates and terracotta for the dig. Cormorant Garamond for titles and dates, Barlow for captions and labels.
//
// Facts:
// - Wikipedia, "Founding of Rome": the official date follows the chronology of Varro (late 1st century BC), 753 BC;
//   Plutarch gives 21 April; other ancient dates: Fabius Pictor 748/47, Cincius Alimentus 729/28, Cato 751/50,
//   Timaeus 814 BC; remains of huts on the Palatine date to the 9th or 8th centuries BC; most modern historians treat
//   the single founder and the exact date as fiction (Andrea Carandini's contrary view is a minority one); by about
//   600 BC a process of synoikismos (villages merging) had formed a unified Rome, with a central forum.
// - Wikipedia, "Ab urbe condita": the Varronian chronology put the founding on 21 April 753 BC; Romans named years
//   by their consuls; Cornell: Varro probably reached 753 BC by counting back from his date for the Republic, 509 BC.
// - Livy 1.60 (thelatinlibrary.com): "Regnatum Romae ab condita urbe ad liberatam annos ducentos quadraginta
//   quattuor": kings ruled Rome 244 years from its founding to its liberation. Livy 1.7: Romulus first fortified the
//   Palatine. Wikipedia, "Roman Kingdom": seven kings; an average of almost 35 years each; since Barthold Georg
//   Niebuhr (1800s) modern scholarship has generally discounted this scheme; no contemporary records survive.
// - Plutarch, Romulus 12 (LacusCurtius): the city was founded on 21 April, the day of the shepherds' festival, the
//   Parilia; Varro asked the astrologer Tarutius to fix Romulus's birthday. Dionysius of Halicarnassus 1.74: Timaeus,
//   Cincius, Fabius and Cato gave different dates.
// - Parco archeologico del Colosseo (colosseo.it, "Casa Romuli" model page and "Palatium" itinerary): on the Cermalus,
//   the Palatine's peak towards the Tiber, Salvatore M. Puglisi's 1948 excavations found three huts pressed into the
//   tuff; hut A, the best preserved, about 17.64 m², with post-holes round its edge for the walls, a central hole
//   for a roof beam, the door on a short side with a small porch, and a hearth in the middle; small one-room huts of
//   wattle and daub with straw roofs; the village is dated to about the 9th–7th centuries BC by archaeological data
//   and the study of its pottery, and was used until the late 7th century; a hut in the south-west corner was the
//   so-called dwelling of Romulus. Wikipedia, "Hut of Romulus": foundations about 4.9 × 3.6 m (= 17.64 m²).
// - Dionysius 1.79.11: the hut of Romulus still stood in his day on the flank of the Palatine; Romans added nothing to
//   it and, when storms or time damaged it, restored it as nearly as possible to its former state. Cassius Dio (via
//   Wikipedia, "Hut of Romulus"): fires in 38 BC and 12 BC.
// Computed here: 509 + 244 = 753 BC; 244 / 7 = 34.9 years per king; 4.9 × 3.6 = 17.64 m².
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The Palatine at dusk; 21 April 753 BC; worked out about 700 years later.
//  B  9.6–18.6  Varro and the other ancient dates; the Parilia.
//  C 18.8–32.4  Counting back seven kings: 244 years from 509 BC; almost 35 years each.
//  D 32.6–50.8  The ground in section; hut floors and post-holes in the tuff; the hut rebuilt; hut A in plan; dates.
//  E 51.0–55.4  The hut of Romulus kept up by the Romans.
//  F 55.6–64.6  Villages merging into one city by about 600 BC; legend's date against the evidence.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0f0d0a', bg2: '#2a2114', ink: '#f5eddc', soft: 'rgba(245,237,220,0.72)', faint: 'rgba(245,237,220,0.22)',
  hill: '#3a3020', hill2: '#4a3d28', tuff: '#b8955c', tuff2: '#9a7a48', tuffDark: '#5c4628', soil: '#6b5236', hole: '#1a130b',
  thatch: '#d9b66a', thatch2: '#a8843f', clay: '#b0734a', wood: '#7a5230', fire: '#ff9a3d', fire2: '#ffd36b',
  gold: '#f2c35b', dig: '#e8805a', sky: '#8fbfe0', river: '#3f5f73',
};
const TITLE = 'Cormorant Garamond', SANS = 'Barlow';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const REPUBLIC = 509, KING_YEARS = 244, KINGS = 7;
const FOUNDING = REPUBLIC + KING_YEARS; // 753 BC
const PER_KING = KING_YEARS / KINGS; // 34.9
const HUT_W = 4.9, HUT_D = 3.6, HUT_AREA = HUT_W * HUT_D; // 17.64 m²
const DATES = [[814, 'Timaeus'], [753, 'Varro'], [751, 'Cato'], [748, 'Fabius Pictor'], [728, 'Cincius']];
const KING_NAMES = ['Romulus', 'Numa', 'Tullus', 'Ancus', 'Tarquin', 'Servius', 'Tarquin'];
if (FOUNDING !== 753 || Math.round(PER_KING * 10) !== 349 || Math.round(HUT_AREA * 100) !== 1764) throw new Error('numbers');

// ---------- helpers ----------
const bc = (y) => `${y} BC`;
function label(s, x, y, { size = 24, weight = 600, color = C.soft, align = 'center', family = SANS, spacing = '0px' } = {}) {
  font(weight, size, family); text(s, x, y, { align, base: 'middle', color, spacing });
}
/** The Palatine and its neighbours as a dusk silhouette, with the Tiber in front. */
function skyline(a) {
  A(a, () => {
    ctx.fillStyle = C.hill;
    ctx.beginPath(); ctx.moveTo(0, 700); ctx.bezierCurveTo(80, 660, 120, 620, 190, 620); ctx.lineTo(240, 660); ctx.lineTo(W, 670); ctx.lineTo(W, 760); ctx.lineTo(0, 760); ctx.closePath(); ctx.fill();
    // the Palatine: a broad flat-topped hill
    ctx.fillStyle = C.hill2;
    ctx.beginPath(); ctx.moveTo(220, 760); ctx.bezierCurveTo(260, 620, 300, 530, 380, 522); ctx.lineTo(600, 516); ctx.bezierCurveTo(660, 520, 700, 600, 760, 760); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.river; ctx.fillRect(0, 752, W, 30);
    ctx.fillStyle = 'rgba(143,191,224,0.25)'; for (let i = 0; i < 9; i++) ctx.fillRect(40 + i * 92, 762 + (i % 2) * 8, 46, 3);
    label('PALATINE HILL', 490, 566, { size: 24, weight: 700, color: C.ink, spacing: '4px' });
    label('Tiber', 90, 730, { size: 22, weight: 500 });
  });
}
/** A hut in elevation: posts, woven walls, a steep thatched roof. grow 0..1 builds it (posts, walls, roof). */
function hut(cx, base, s, grow = 1, { fire = 0, t = 0 } = {}) {
  const w = 150 * s, wallH = 70 * s, roofH = 120 * s;
  const posts = clamp(grow * 3), walls = clamp(grow * 3 - 1), roof = clamp(grow * 3 - 2);
  // posts
  ctx.fillStyle = C.wood;
  for (let i = 0; i < 5; i++) {
    const x = cx - w / 2 + (i / 4) * w;
    ctx.fillRect(x - 4 * s, base - wallH * posts, 8 * s, wallH * posts + 12 * s);
  }
  ctx.fillRect(cx - 4 * s, base - (wallH + roofH * 0.9) * posts, 8 * s, (wallH + roofH * 0.9) * posts);
  // woven walls of branches and clay
  A(walls, () => {
    ctx.fillStyle = C.clay; ctx.fillRect(cx - w / 2, base - wallH, w, wallH);
    ctx.strokeStyle = 'rgba(60,35,15,0.45)'; ctx.lineWidth = 2 * s;
    for (let r = 0; r < 5; r++) { const y = base - wallH + (r + 0.5) * wallH / 5; ctx.beginPath(); for (let x = 0; x <= w; x += 8 * s) ctx.lineTo(cx - w / 2 + x, y + Math.sin(x / (8 * s) + r) * 3 * s); ctx.stroke(); }
    ctx.fillStyle = C.hole; ctx.fillRect(cx - 16 * s, base - wallH * 0.85, 32 * s, wallH * 0.85);
  });
  // thatched roof with crossed beams at the ridge, as on hut-shaped urns
  A(roof, () => {
    const top = base - wallH - roofH;
    ctx.fillStyle = C.thatch;
    ctx.beginPath(); ctx.moveTo(cx - w / 2 - 24 * s, base - wallH + 8 * s); ctx.lineTo(cx, top); ctx.lineTo(cx + w / 2 + 24 * s, base - wallH + 8 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.thatch2; ctx.lineWidth = 2 * s;
    for (let i = 1; i < 9; i++) { const f = i / 9; ctx.beginPath(); ctx.moveTo(cx, top + 8 * s); ctx.lineTo(cx - w / 2 - 24 * s + f * (w + 48 * s), base - wallH + 8 * s); ctx.stroke(); }
    ctx.strokeStyle = C.wood; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.moveTo(cx - 22 * s, top - 18 * s); ctx.lineTo(cx + 10 * s, top + 14 * s); ctx.moveTo(cx + 22 * s, top - 18 * s); ctx.lineTo(cx - 10 * s, top + 14 * s); ctx.stroke();
  });
  if (fire > 0) A(fire, () => {
    for (let i = 0; i < 4; i++) {
      const x = cx - 50 * s + i * 32 * s, y = base - wallH - 30 * s - (i % 2) * 30 * s, h = (26 + 8 * Math.sin(t * 9 + i)) * s;
      ctx.fillStyle = i % 2 ? C.fire2 : C.fire;
      ctx.beginPath(); ctx.moveTo(x - 10 * s, y); ctx.quadraticCurveTo(x, y - h * 1.4, x + 10 * s, y); ctx.closePath(); ctx.fill();
    }
  });
}
/** A horizontal time axis, x from x0 to x1 for years BC y0 (older, left) to y1. */
function axis(x0, x1, y, y0, y1, step, a, { labels = true, color = C.soft } = {}) {
  const X = (yr) => x0 + (x1 - x0) * (y0 - yr) / (y0 - y1);
  A(a, () => {
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    for (let yr = Math.ceil(y1 / step) * step; yr <= y0; yr += step) {
      const x = X(yr);
      ctx.fillStyle = C.faint; ctx.fillRect(x - 1, y - 8, 2, 16);
      if (labels) label(bc(yr), x, y + 28, { size: 20, weight: 500, color });
    }
  });
  return X;
}

// ---------- A: the Palatine and its date ----------
function sceneLegend(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    skyline(seg(t, 0, 1.2));
    A(seg(t, 0.8, 1.8), () => {
      label('21 APRIL', CX, 170, { size: 44, weight: 600, family: TITLE, color: C.gold, spacing: '6px' });
      font(700, 130, TITLE); text(bc(FOUNDING), CX, 280, { align: 'center', base: 'middle', color: C.gold });
      label('legend’s date for Romulus’s founding', CX, 372, { size: 26, weight: 500 });
    });
    // about 700 years between the date and the man who fixed it
    A(seg(t, 5.0, 5.6), () => {
      const x0 = 120, x1 = 744, y = 450, p = eio(seg(t, 5.4, 7.6));
      ctx.strokeStyle = C.sky; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, p), y); ctx.stroke();
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x0, y, 9, 0, TAU); ctx.fill();
      A(seg(t, 7.4, 7.8), () => { ctx.fillStyle = C.sky; ctx.beginPath(); ctx.arc(x1, y, 9, 0, TAU); ctx.fill(); });
      label('no records survive', CX, y - 26, { size: 22, weight: 600, color: C.soft });
    });
    A(seg(t, 7.4, 8.0), () => {
      label('about 700 years later: 1st century BC', 744, 486, { size: 24, weight: 600, color: C.sky, align: 'right' });
    });
  });
}

// ---------- B: the ancient dates and the Parilia ----------
function sceneDates(t) {
  A(span(t, 9.4, 18.8, 0.5, 0.4), () => {
    label('FOUNDING DATES IN ANCIENT WRITERS', CX, 110, { size: 24, weight: 700, color: C.soft, spacing: '2px' });
    const X = axis(70, 790, 420, 830, 710, 20, seg(t, 9.6, 10.2));
    DATES.forEach(([yr, who], i) => {
      const a = seg(t, 10.2 + i * 0.5, 10.7 + i * 0.5), x = X(yr), y = 160 + i * 50, main = yr === FOUNDING;
      const col = main ? C.gold : C.ink;
      A(a, () => {
        ctx.strokeStyle = main ? C.gold : C.faint; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, 420); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, main ? 11 : 8, 0, TAU); ctx.fill();
        label(`${who}: ${yr} BC`, x + 18, y, { size: main ? 28 : 24, weight: main ? 800 : 600, color: col, align: 'left' });
      });
    });
    A(seg(t, 12.6, 13.2) * (1 - seg(t, 13.9, 14.2)), () => label('Varro’s date became the standard one', CX, 492, { size: 24, weight: 500, color: C.gold }));
    // the day: the shepherds' festival
    A(seg(t, 14.2, 14.8), () => {
      const x = CX, y = 588, w = 300, h = 190;
      ctx.fillStyle = '#efe3c6'; k.rrect(x - w / 2, y - h / 2, w, h, 14); ctx.fill();
      ctx.fillStyle = '#9c3b26'; k.rrect(x - w / 2, y - h / 2, w, 52, 14); ctx.fill(); ctx.fillRect(x - w / 2, y - h / 2 + 30, w, 22);
      label('APRIL', x, y - h / 2 + 28, { size: 26, weight: 700, color: '#fff3dc', spacing: '4px' });
      font(700, 96, TITLE); text('21', x, y + 32, { align: 'center', base: 'middle', color: '#2a2114' });
      label('PARILIA, the shepherds’ festival', x, y + h / 2 + 34, { size: 26, weight: 700, color: C.gold });
      label('Plutarch, Life of Romulus', x, y + h / 2 + 66, { size: 22, weight: 500 });
      // a small fire and two sheep, schematic
      const fx = x - 250, fy = 640;
      ctx.fillStyle = C.fire; ctx.beginPath(); ctx.moveTo(fx - 22, fy); ctx.quadraticCurveTo(fx, fy - 70 - 6 * Math.sin(t * 8), fx + 22, fy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.fire2; ctx.beginPath(); ctx.moveTo(fx - 11, fy); ctx.quadraticCurveTo(fx, fy - 38, fx + 11, fy); ctx.closePath(); ctx.fill();
      for (const [sx, sy] of [[x + 230, 630], [x + 280, 662]]) {
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(sx, sy, 30, 18, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#2a2114'; ctx.beginPath(); ctx.ellipse(sx - 30, sy - 6, 10, 8, 0, 0, TAU); ctx.fill();
        ctx.fillRect(sx - 16, sy + 12, 5, 16); ctx.fillRect(sx + 12, sy + 12, 5, 16);
      }
    });
  });
}

// ---------- C: counting back seven kings ----------
function sceneKings(t) {
  A(span(t, 18.6, 32.6, 0.5, 0.4), () => {
    label('LIVY: KINGS RULED ROME 244 YEARS', CX, 110, { size: 26, weight: 700, color: C.soft, spacing: '2px' });
    const X = axis(52, 812, 520, 800, 440, 50, seg(t, 18.8, 19.4));
    // the Republic's first year
    A(seg(t, 19.2, 19.8), () => {
      const x = X(REPUBLIC);
      ctx.fillStyle = C.sky; ctx.fillRect(x, 300, 812 - x, 180);
      label('REPUBLIC', (x + 812) / 2, 360, { size: 22, weight: 800, color: '#0f0d0a', spacing: '2px' });
      label('509 BC', (x + 812) / 2, 400, { size: 24, weight: 800, color: '#0f0d0a' });
      label('first consuls', (x + 812) / 2, 438, { size: 20, weight: 600, color: '#0f0d0a' });
    });
    // seven reigns stacked back from 509 BC
    const back = seg(t, 23.6, 27.4) * KINGS;
    for (let i = 0; i < KINGS; i++) {
      const g = clamp(back - i); if (g <= 0) continue;
      const k0 = REPUBLIC + i * PER_KING, k1 = k0 + PER_KING * eout(g); // years BC, counting back
      const xa = X(k1), xb = X(k0);
      ctx.fillStyle = i % 2 ? '#d9a94a' : C.gold; ctx.fillRect(xa + 1, 300, xb - xa - 2, 180);
      A(seg(g, 0.6, 1), () => {
        ctx.save(); ctx.translate((xa + xb) / 2, 390); ctx.rotate(-Math.PI / 2);
        label(KING_NAMES[KINGS - 1 - i], 0, 0, { size: 24, weight: 700, color: '#2a2114' });
        ctx.restore();
      });
    }
    const total = Math.round(clamp(back / KINGS) * KING_YEARS);
    A(seg(t, 23.6, 24.0), () => {
      font(800, 44, SANS); text(`${total} years`, X(REPUBLIC + total / 2), 250, { align: 'center', base: 'middle', color: C.gold });
    });
    A(seg(t, 27.2, 27.8), () => {
      const x = X(FOUNDING);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 290); ctx.lineTo(x, 540); ctx.stroke();
      font(700, 54, TITLE); text(bc(FOUNDING), x, 600, { align: 'center', base: 'middle', color: C.gold });
      label('509 + 244 = 753', x, 652, { size: 24, weight: 600, color: C.soft });
    });
    A(seg(t, 28.2, 28.8), () => {
      font(800, 40, SANS); text(`≈ ${PER_KING.toFixed(1)} years per king`, 560, 620, { align: 'center', base: 'middle', color: C.ink });
      label('doubted by historians since the 1800s', 560, 666, { size: 24, weight: 500 });
    });
  });
}

// ---------- D: the ground, the hut floor, the hut ----------
const G = { top: 420, tuff: 560, bottom: 760 };
function ground(t, a) {
  A(a, () => {
    // layers: later Roman ground above the tuff bedrock
    ctx.fillStyle = C.soil; ctx.fillRect(0, G.top, W, G.tuff - G.top);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 40; i++) ctx.fillRect((i * 97) % W, G.top + 12 + (i * 37) % 120, 18, 6);
    ctx.fillStyle = C.tuff; ctx.fillRect(0, G.tuff, W, G.bottom - G.tuff);
    ctx.fillStyle = C.tuff2; for (let i = 0; i < 60; i++) ctx.fillRect((i * 61) % W, G.tuff + 10 + (i * 53) % 180, 6 + (i % 4) * 3, 4);
    label('later Roman layers', 24, G.top + 30, { size: 22, weight: 600, color: C.ink, align: 'left' });
    label('TUFF, the hill’s soft volcanic rock', 120, G.bottom - 26, { size: 22, weight: 700, color: '#3a2a14', align: 'left' });
  });
}
function sceneDig(t) {
  A(span(t, 32.4, 46.4, 0.5, 0.4), () => {
    label('THE CERMALUS, THE PALATINE’S WESTERN TOP', CX, 110, { size: 24, weight: 700, color: C.soft, spacing: '1px' });
    ground(t, seg(t, 32.6, 33.4));
    // the dig goes down through the layers
    const dig = eio(seg(t, 34.0, 36.6));
    A(seg(t, 33.8, 34.2), () => {
      ctx.fillStyle = C.bg2; ctx.fillRect(250, G.top, 364, (G.tuff - G.top) * dig);
      ctx.strokeStyle = C.dig; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.strokeRect(250, G.top, 364, (G.tuff - G.top) * dig); ctx.setLineDash([]);
    });
    // the hut floor and post-holes cut into the tuff
    const floor = seg(t, 37.2, 38.2);
    A(floor, () => {
      ctx.fillStyle = C.tuffDark; ctx.beginPath(); ctx.moveTo(262, G.tuff); ctx.lineTo(280, G.tuff + 26); ctx.lineTo(584, G.tuff + 26); ctx.lineTo(602, G.tuff); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 5; i++) {
        const x = 290 + i * 71;
        A(seg(t, 38.0 + i * 0.25, 38.4 + i * 0.25), () => { ctx.fillStyle = C.hole; ctx.fillRect(x - 9, G.tuff + 20, 18, 46); });
      }
      A(seg(t, 39.4, 39.9) * (1 - seg(t, 41.6, 42.0)), () => {
        label('post-holes', 432, G.tuff + 104, { size: 28, weight: 800, color: '#3a2a14' });
        label('Salvatore Puglisi, 1948', 432, 360, { size: 28, weight: 700, color: C.dig });
      });
    });
    // build the hut on its floor
    const grow = seg(t, 42.0, 45.4);
    if (grow > 0) hut(432, G.tuff + 18, 1.9, grow);
    A(seg(t, 43.2, 43.8), () => {
      label('woven branches', 730, 480, { size: 22, weight: 700, color: C.ink });
      label('and clay', 730, 508, { size: 22, weight: 700, color: C.ink });
      label('thatch', 700, 330, { size: 24, weight: 700, color: C.thatch, align: 'center' });
    });
  });
}
function scenePlan(t) {
  A(span(t, 46.2, 51.0, 0.4, 0.4), () => {
    label('HUT A, FROM ABOVE', 250, 110, { size: 24, weight: 700, color: C.soft, spacing: '2px' });
    const cx = 250, cy = 300, sc = 60; // px per metre
    const rx = HUT_W * sc / 2, ry = HUT_D * sc / 2;
    ctx.fillStyle = C.tuffDark; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.tuff; ctx.lineWidth = 4; ctx.stroke();
    for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU + 0.3; ctx.fillStyle = C.hole; ctx.beginPath(); ctx.arc(cx + (rx - 10) * Math.cos(a), cy + (ry - 10) * Math.sin(a), 8, 0, TAU); ctx.fill(); }
    ctx.fillStyle = C.hole; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, TAU); ctx.fill();
    ctx.fillStyle = C.fire; ctx.beginPath(); ctx.arc(cx + 36, cy + 8, 11, 0, TAU); ctx.fill();
    ctx.fillStyle = C.tuffDark; ctx.fillRect(cx + rx - 4, cy - 26, 34, 52); // the porch on the short side
    label(`${HUT_W} m`, cx, cy - ry - 24, { size: 24, weight: 700, color: C.ink });
    label(`${HUT_D} m`, cx - rx - 40, cy, { size: 24, weight: 700, color: C.ink });
    label(`about ${HUT_AREA.toFixed(1)} m²`, cx, cy + ry + 32, { size: 24, weight: 600, color: C.soft });
    label('hearth', cx + 36, cy + 36, { size: 20, weight: 700, color: C.fire });
    // the dates: the village against the legend's year
    A(seg(t, 46.8, 47.4), () => {
      const X = axis(70, 790, 610, 950, 550, 100, 1);
      const a = X(900), b = X(600);
      ctx.fillStyle = C.dig; ctx.fillRect(a, 560, b - a, 36);
      label('hut village, 9th–7th centuries BC', (a + b) / 2, 538, { size: 24, weight: 700, color: C.dig });
      const x = X(FOUNDING);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 552); ctx.lineTo(x, 630); ctx.stroke();
      label('753', x, 672, { size: 26, weight: 800, color: C.gold });
      label('dated by its pottery', 640, 300, { size: 24, weight: 600, color: C.soft });
    });
    // a pot sherd
    A(seg(t, 47.4, 48.0), () => {
      ctx.fillStyle = '#7d4a2c'; ctx.beginPath(); ctx.moveTo(590, 210); ctx.lineTo(700, 196); ctx.lineTo(712, 250); ctx.lineTo(640, 270); ctx.lineTo(596, 248); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#c9a47a'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(604 + i * 8, 222 + i * 12); ctx.lineTo(698 - i * 4, 212 + i * 12); ctx.stroke(); }
    });
  });
}

// ---------- E: the hut of Romulus kept up ----------
function sceneKept(t) {
  A(span(t, 50.8, 55.6, 0.4, 0.4), () => {
    label('THE “HUT OF ROMULUS”', CX, 110, { size: 28, weight: 700, color: C.gold, spacing: '2px' });
    const burn1 = span(t, 52.0, 53.0, 0.2, 0.3), burn2 = span(t, 53.6, 54.6, 0.2, 0.3);
    ctx.fillStyle = C.hill2; ctx.fillRect(0, 600, W, 160);
    hut(CX, 600, 1.9, 1, { fire: Math.max(burn1, burn2), t });
    A(seg(t, 52.0, 52.3), () => label('fire, 38 BC', 140, 260, { size: 26, weight: 700, color: C.fire, align: 'left' }));
    A(seg(t, 53.6, 53.9), () => label('fire, 12 BC', 724, 260, { size: 26, weight: 700, color: C.fire, align: 'right' }));
    A(seg(t, 52.6, 53.0), () => label('repaired, nothing added (Dionysius)', CX, 680, { size: 26, weight: 600, color: C.ink }));
  });
}

// ---------- F: villages into a city ----------
function sceneCity(t) {
  A(span(t, 55.4, 60.2, 0.4, 0.4), () => {
    label('VILLAGES ON THE HILLS', CX, 110, { size: 26, weight: 700, color: C.soft, spacing: '2px' });
    const hills = [[230, 470, 'Palatine'], [170, 250, 'Capitoline'], [520, 210, ''], [680, 330, ''], [640, 540, '']];
    const merge = eio(seg(t, 57.0, 59.0));
    hills.forEach(([x, y, n], i) => {
      ctx.fillStyle = C.hill2; ctx.beginPath(); ctx.ellipse(x, y, 110, 70, 0, 0, TAU); ctx.fill();
      for (let j = 0; j < 5; j++) {
        const a = j * 1.3 + i, hx = x + Math.cos(a) * 46, hy = y + Math.sin(a) * 26;
        ctx.fillStyle = C.thatch; ctx.beginPath(); ctx.moveTo(hx - 12, hy + 8); ctx.lineTo(hx, hy - 12); ctx.lineTo(hx + 12, hy + 8); ctx.closePath(); ctx.fill();
      }
      if (n) label(n, x, y - 52, { size: 22, weight: 700, color: C.ink });
    });
    // the valley between them becomes a shared centre, the Forum
    A(merge, () => {
      ctx.strokeStyle = C.dig; ctx.lineWidth = 6; ctx.setLineDash([14, 10]);
      ctx.beginPath(); ctx.ellipse(430, 380, 380 * (0.6 + 0.4 * merge), 236 * (0.6 + 0.4 * merge), 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#cdb68a'; ctx.beginPath(); ctx.ellipse(400, 360, 70, 44, 0, 0, TAU); ctx.fill();
      label('Forum', 400, 362, { size: 22, weight: 800, color: '#2a2114' });
      label('one city by about 600 BC', CX, 690, { size: 30, weight: 800, color: C.dig });
    });
  });
  A(span(t, 60.0, 65.4, 0.4, 0), () => {
    const L = [220, 'counted', bc(FOUNDING), 'the legend’s date', C.gold], R = [644, 'dug', 'post-holes', 'the evidence', C.dig];
    for (const [x, top, big, sub, col] of [L, R]) {
      label(top.toUpperCase(), x, 220, { size: 26, weight: 700, color: col, spacing: '4px' });
      font(700, 74, TITLE); text(big, x, 320, { align: 'center', base: 'middle', color: col });
      label(sub, x, 400, { size: 28, weight: 600, color: C.ink });
    }
    ctx.fillStyle = C.faint; ctx.fillRect(CX - 1, 180, 2, 260);
    A(seg(t, 61.0, 61.6), () => {
      ground(t, 1);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = C.hole; ctx.fillRect(560 + i * 56, G.tuff + 6, 18, 46); }
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(0.6, C.bg2); lg.addColorStop(1, C.bg1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 21; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,236,200,${0.08 + r() * 0.25})`; g.fillRect(r() * W, r() * 260, 1.5, 1.5); }
}

const CUES = [
  [0.4, 4.8, 'Legend says Romulus founded Rome on the *Palatine Hill* on 21 April *753 BC*.'],
  [5.0, 9.4, 'No records survive from that time: the date was worked out some ^700 years later^.'],
  [9.6, 14.0, 'The scholar ^Varro^ fixed it in the 1st century BC. Others said 814, 751, 748 or 728 BC.'],
  [14.2, 18.6, 'The day, 21 April, was the shepherds’ festival, the *Parilia*, says the writer Plutarch.'],
  [18.8, 23.2, 'The year came from counting. The historian Livy gives Rome’s seven kings *244 years*.'],
  [23.4, 27.8, 'Count back 244 years from the first consuls, in ^509 BC^, and you reach *753 BC*.'],
  [28.0, 32.4, 'That is almost *35 years* per king. Since the 1800s, historians have doubted it.'],
  [32.6, 37.0, 'Archaeologists date the Palatine another way: by what is cut into its ~rock~.'],
  [37.2, 41.6, 'In 1948, ~Salvatore Puglisi~ found the floors of three huts cut into the soft tuff.'],
  [41.8, 46.2, 'Holes held the ~posts~ of walls made of woven branches and clay, under a thatched roof.'],
  [46.4, 50.8, 'Its pottery dates the village to the ~9th to 7th centuries BC~, partly before 753.'],
  [51.0, 55.4, 'Romans kept a *hut of Romulus* here, repaired after fires, writes Dionysius of Halicarnassus.'],
  [55.6, 60.0, 'Most historians see no founding day: villages merged into ~one city~ by about 600 BC.'],
  [60.2, 64.6, 'So *753 BC* is the legend’s counted date; the ~post-holes~ are the evidence.'],
];

Kit.scene({
  width: W, height: H, duration: 65, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneLegend(t);
    sceneDates(t);
    sceneKings(t);
    sceneDig(t);
    scenePlan(t);
    sceneKept(t);
    sceneCity(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.dig, '^': C.sky } });
  },
});
