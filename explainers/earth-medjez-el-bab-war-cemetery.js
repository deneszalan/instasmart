// Explainer for earth-medjez-el-bab-war-cemetery (Tunisia 1943): Medjez-el-Bab War Cemetery and the Medjez-el-Bab
// Memorial (Commonwealth War Graves Commission), about 60 km west of Tunis: why there, who is buried and who is named,
// and why some Eighth Army soldiers are named in Egypt instead. Look: pale Portland stone on a morning sky, a lawn of
// headstones as a quiet grid (each mark stands for ten burials), the memorial's pergola panels of names as unreadable
// lines, the Cross of Sacrifice and the Stone of Remembrance; a schematic map of the front at Medjez in the winter of
// 1942–43. No soldiers, no fighting. Cinzel for inscriptions and titles, Source Sans 3 for captions and labels.
//
// Facts, from the CWGC pages (cemetery 47314 and memorial 2054200):
// - Medjez-el-Bab is about 60 km west of Tunis; the cemetery is 5 km west of the town on the road to Le Kef (GP5);
//   it is the largest Commonwealth war cemetery in Tunisia.
// - Medjez-el-Bab "was at the limit of the Allied advance in December 1942 and remained on the front line until the
//   decisive Allied advances of April and May 1943"; the war in North Africa ended in Tunisia in May 1943.
// - 2,903 Commonwealth servicemen of the Second World War are buried or commemorated in the cemetery; 385 of the
//   burials are unidentified; five First World War burials were brought in in 1950.
// - The Medjez-el-Bab Memorial, within the cemetery, bears the names of almost 2,000 men of the First Army who died
//   in Algeria and Tunisia between 8 November 1942 and 19 February 1943, and of the First and Eighth Armies who died
//   there between 20 February and 13 May 1943, who have no known graves.
// - CWGC, Alamein Memorial (131900): it names soldiers of the Eighth Army who died in operations in Tunisia up to
//   19 February 1943 and have no known grave.
// - The cemetery and memorial were designed by Sir J. Hubert Worthington; the Stone of Remembrance faces the
//   entrance, the Cross of Sacrifice stands at the far end, with the memorial's pergolas, columns and engraved panels
//   on either side of it. A landscape redesign with the landscape architect Joe Perkins will cut irrigated turf by
//   75% and use drought-tolerant planting.
// Computed here: one mark per ten burials, 290 marks for 2,903, of which 39 for the 385 unidentified (rounded).
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  Where: 60 km west of Tunis; the largest Commonwealth war cemetery in Tunisia.
//  B  9.6–18.6  2,903 buried or commemorated; 385 unidentified.
//  C 18.8–27.8  Why here: the front at Medjez, December 1942 to April 1943.
//  D 28.0–50.8  No known grave: the memorial; its dates; the Eighth Army and the Alamein Memorial.
//  E 51.0–64.6  The design; the new planting for a drier climate.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky1: '#c9d6dc', sky2: '#eef0ea', stone: '#f4f1e8', stoneEdge: '#c9c2b2', ink: '#2b3030', soft: 'rgba(43,48,48,0.7)', faint: 'rgba(43,48,48,0.2)',
  lawn: '#7f9f6a', lawnDark: '#5f7f4e', olive: '#8a8f5a', green: '#2f5d43', blue: '#3e6e8e', rust: '#a4573c', sand: '#e7dcc2', panel: 'rgba(244,241,232,0.94)',
};
const CAPS = 'Cinzel', SANS = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers (CWGC) ----------
const BURIED = 2903, UNIDENTIFIED = 385, PER_MARK = 10;
const MARKS = Math.round(BURIED / PER_MARK), UNKNOWN_MARKS = Math.round(UNIDENTIFIED / PER_MARK);
if (MARKS !== 290 || UNKNOWN_MARKS !== 39) throw new Error('marks');
const KM_TO_TUNIS = 60;

// ---------- a schematic map of northern Tunisia ----------
const P = (lon, lat) => [80 + (lon - 8.6) * 330, 250 + (37.4 - lat) * 390];
const COAST = [[8.6, 36.95], [9.2, 37.15], [9.87, 37.33], [10.2, 37.2], [10.25, 36.95], [10.3, 36.85], [10.55, 36.9], [11.05, 37.07], [10.9, 36.75], [10.55, 36.45]];
const TOWNS = { tunis: [10.18, 36.81], medjez: [9.61, 36.65], beja: [9.18, 36.73], tebourba: [9.84, 36.83], kef: [8.71, 36.18] };
const XY = Object.fromEntries(Object.entries(TOWNS).map(([n, [lo, la]]) => [n, P(lo, la)]));

function map(t, a) {
  A(a, () => {
    ctx.save(); ctx.beginPath(); ctx.rect(40, 214, W - 80, 560); ctx.clip();
    ctx.fillStyle = 'rgba(62,110,142,0.16)';
    ctx.beginPath(); ctx.moveTo(P(8.6, 37.8)[0], P(8.6, 37.8)[1]); COAST.forEach((p) => ctx.lineTo(...P(...p))); ctx.lineTo(P(11.2, 36.4)[0], P(11.2, 36.4)[1]); ctx.lineTo(P(11.2, 37.8)[0], P(11.2, 37.8)[1]); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5; ctx.beginPath(); COAST.forEach((p, i) => (i ? ctx.lineTo(...P(...p)) : ctx.moveTo(...P(...p)))); ctx.stroke();
    // the Medjerda river, roughly, and the road from Le Kef through Béja and Medjez to Tunis
    ctx.strokeStyle = 'rgba(62,110,142,0.6)'; ctx.lineWidth = 3;
    ctx.beginPath(); [[8.75, 36.5], [9.2, 36.55], [9.61, 36.66], [9.85, 36.8], [10.1, 37.0], [10.2, 37.1]].forEach((p, i) => (i ? ctx.lineTo(...P(...p)) : ctx.moveTo(...P(...p)))); ctx.stroke();
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
    ctx.beginPath(); [XY.kef, XY.beja, XY.medjez, XY.tebourba, XY.tunis].forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke(); ctx.setLineDash([]);
    for (const [n, name, dx, dy, al] of [['tunis', 'Tunis', 0, -26, 'center'], ['medjez', 'Medjez-el-Bab', 0, 30, 'center'], ['beja', 'Béja', 0, -26, 'center'], ['kef', 'Le Kef', 14, 0, 'left']]) {
      const [x, y] = XY[n];
      ctx.fillStyle = n === 'medjez' ? C.green : C.ink; ctx.beginPath(); ctx.arc(x, y, n === 'medjez' ? 9 : 6, 0, TAU); ctx.fill();
      font(n === 'medjez' ? 700 : 600, n === 'medjez' ? 26 : 23); text(name, x + dx, y + dy, { align: al, color: n === 'medjez' ? C.green : C.ink });
    }
    font(600, 22); text('Mediterranean Sea', P(9.4, 37.42)[0], P(9.4, 37.42)[1], { align: 'center', color: C.blue });
    ctx.restore();
    font(500, 21); text('Schematic map', 80, 760, { color: C.soft });
  });
}

/** A headstone: the CWGC shape, a rounded top. */
function headstone(x, y, w, h, col) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h + w * 0.3); ctx.quadraticCurveTo(x - w / 2, y - h, x, y - h); ctx.quadraticCurveTo(x + w / 2, y - h, x + w / 2, y - h + w * 0.3); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
}
function crossOfSacrifice(x, y, s) {
  ctx.fillStyle = C.stone; ctx.strokeStyle = C.stoneEdge; ctx.lineWidth = 2;
  ctx.fillRect(x - 40 * s, y - 20 * s, 80 * s, 20 * s); ctx.strokeRect(x - 40 * s, y - 20 * s, 80 * s, 20 * s);
  ctx.fillRect(x - 9 * s, y - 230 * s, 18 * s, 210 * s); ctx.strokeRect(x - 9 * s, y - 230 * s, 18 * s, 210 * s);
  ctx.fillRect(x - 50 * s, y - 180 * s, 100 * s, 16 * s); ctx.strokeRect(x - 50 * s, y - 180 * s, 100 * s, 16 * s);
  // the bronze sword on the cross
  ctx.strokeStyle = '#6b5a3a'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(x, y - 210 * s); ctx.lineTo(x, y - 120 * s); ctx.moveTo(x - 14 * s, y - 196 * s); ctx.lineTo(x + 14 * s, y - 196 * s); ctx.stroke();
}
function stoneOfRemembrance(x, y, s) {
  ctx.fillStyle = C.stone; ctx.strokeStyle = C.stoneEdge; ctx.lineWidth = 2;
  ctx.fillRect(x - 130 * s, y - 16 * s, 260 * s, 16 * s); ctx.strokeRect(x - 130 * s, y - 16 * s, 260 * s, 16 * s);
  ctx.fillRect(x - 110 * s, y - 70 * s, 220 * s, 54 * s); ctx.strokeRect(x - 110 * s, y - 70 * s, 220 * s, 54 * s);
}
/** A memorial panel: a stone slab with lines standing for engraved names. */
function panel(x, y, w, h, fill = 1) {
  ctx.fillStyle = C.stone; ctx.strokeStyle = C.stoneEdge; ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = 'rgba(43,48,48,0.28)';
  const rows = Math.floor((h - 30) / 13);
  for (let r = 0; r < rows * fill; r++) ctx.fillRect(x + 12, y + 20 + r * 13, (w - 24) * (0.55 + 0.4 * ((r * 37) % 10) / 10), 4);
}

// ---------- A: where ----------
function sceneWhere(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    font(700, 40, CAPS); text('MEDJEZ-EL-BAB', CX, 116, { align: 'center', color: C.green, spacing: '3px' });
    font(600, 26); text('War Cemetery and Memorial · Tunisia', CX, 160, { align: 'center', color: C.ink });
    map(t, seg(t, 0.6, 1.4));
    // 60 km to Tunis
    A(seg(t, 2.0, 2.8), () => {
      const [x1, y1] = XY.medjez, [x2, y2] = XY.tunis;
      ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y1 - 54); ctx.lineTo(x2, y2 - 54); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1 - 64); ctx.lineTo(x1, y1 - 44); ctx.moveTo(x2, y2 - 64); ctx.lineTo(x2, y2 - 44); ctx.stroke();
      font(700, 24); text(`about ${fmt(KM_TO_TUNIS)} km`, (x1 + x2) / 2 - 20, (y1 + y2) / 2 - 92, { align: 'center', color: C.green });
    });
    A(seg(t, 5.4, 6.2), () => {
      ctx.fillStyle = C.panel; k.rrect(130, 590, 604, 120, 14); ctx.fill();
      font(700, 26, CAPS); text('THE LARGEST', CX, 628, { align: 'center', color: C.green, spacing: '2px' });
      font(500, 24); text('Commonwealth war cemetery in Tunisia', CX, 672, { align: 'center', color: C.ink });
    });
  });
}

// ---------- B: the graves ----------
function sceneGraves(t) {
  A(span(t, 9.4, 18.8, 0.4, 0.4), () => {
    font(700, 34, CAPS); text(`${fmt(BURIED)}`, CX, 140, { align: 'center', color: C.green, spacing: '2px' });
    font(600, 24); text('Commonwealth servicemen buried or commemorated', CX, 186, { align: 'center', color: C.ink });
    // a lawn of 290 headstones, ten burials each
    ctx.fillStyle = C.lawn; ctx.fillRect(70, 230, W - 140, 470);
    const cols = 29, rows = 10, gx = (W - 180) / (cols - 1), gy = 44;
    let n = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = n++, appear = seg(t, 9.8 + (i / MARKS) * 2.6, 10.0 + (i / MARKS) * 2.6);
      if (appear <= 0) continue;
      const unknown = i >= MARKS - UNKNOWN_MARKS;
      const tint = unknown ? seg(t, 14.4, 15.2) : 0;
      A(appear, () => headstone(90 + c * gx, 280 + r * gy, 16, 26, tint > 0 ? `rgba(${Math.round(lerp(244, 214, tint))},${Math.round(lerp(241, 196, tint))},${Math.round(lerp(232, 150, tint))},1)` : C.stone));
    }
    font(500, 21); text(`each mark: ${fmt(PER_MARK)} burials`, 80, 730, { color: C.soft });
    A(seg(t, 14.6, 15.4), () => {
      ctx.fillStyle = C.panel; k.rrect(440, 708, 360, 50, 10); ctx.fill();
      font(700, 23); text(`${fmt(UNIDENTIFIED)} unidentified`, 620, 733, { align: 'center', color: C.rust });
    });
  });
}

// ---------- C: why here ----------
function sceneWhy(t) {
  A(span(t, 18.6, 28.0, 0.4, 0.4), () => {
    font(700, 34, CAPS); text('WHY HERE?', CX, 140, { align: 'center', color: C.green, spacing: '3px' });
    map(t, 1);
    // the front at Medjez, winter 1942–43 (schematic)
    const g = eio(seg(t, 19.4, 20.8));
    const [mx, my] = XY.medjez;
    ctx.strokeStyle = C.rust; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(mx + 30, my - 150 * g); ctx.quadraticCurveTo(mx + 46, my, mx + 30, my + 150 * g); ctx.stroke(); ctx.lineCap = 'butt';
    A(seg(t, 20.4, 21.0), () => {
      ctx.fillStyle = C.panel; k.rrect(440, 600, 360, 120, 12); ctx.fill();
      font(700, 24); text('the front line', 620, 632, { align: 'center', color: C.rust });
      font(500, 22); text('December 1942 to April 1943', 620, 668, { align: 'center', color: C.ink });
      text('(schematic)', 620, 698, { align: 'center', color: C.soft });
    });
    // the advances of April and May 1943 towards Tunis
    A(seg(t, 23.6, 24.2), () => {
      const g2 = eio(seg(t, 23.8, 26.0));
      ctx.strokeStyle = C.green; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(mx + 50, my - 6); ctx.lineTo(lerp(mx + 50, XY.tunis[0] - 24, g2), lerp(my - 6, XY.tunis[1] + 4, g2)); ctx.stroke(); ctx.lineCap = 'butt';
      font(600, 22); text('April–May 1943', (mx + XY.tunis[0]) / 2 + 40, my + 12, { align: 'center', color: C.green });
    });
  });
}

// ---------- D: the memorial ----------
function sceneMemorial(t) {
  A(span(t, 27.8, 51.0, 0.4, 0.4), () => {
    // cue 7–8: the memorial and its names
    A(span(t, 27.8, 37.4, 0.4, 0.4), () => {
      font(700, 32, CAPS); text('NO KNOWN GRAVE', CX, 140, { align: 'center', color: C.green, spacing: '3px' });
      // a pergola: columns and panels either side of the cross
      ctx.fillStyle = C.lawn; ctx.fillRect(60, 640, W - 120, 60);
      crossOfSacrifice(CX, 640, 1.5);
      for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
        const x = CX + side * (130 + i * 92) - 40;
        A(seg(t, 28.6 + i * 0.3, 29.2 + i * 0.3), () => panel(x, 330, 80, 300, eio(seg(t, 29.0 + i * 0.3, 31.0 + i * 0.3))));
      }
      A(seg(t, 32.6, 33.2), () => {
        ctx.fillStyle = C.panel; k.rrect(140, 196, 584, 96, 12); ctx.fill();
        font(700, 28); text('almost 2,000 names', CX, 226, { align: 'center', color: C.ink });
        font(500, 22); text('of men with no known grave', CX, 264, { align: 'center', color: C.soft });
      });
    });
    // cues 9–11: whose names, by date and army
    A(span(t, 37.2, 51.0, 0.4, 0.4), () => {
      const L = 110, R = 790, X = (ms) => L + ((ms - Date.UTC(1942, 10, 1)) / (Date.UTC(1943, 4, 31) - Date.UTC(1942, 10, 1))) * (R - L);
      const d = (y, m, dd) => Date.UTC(y, m - 1, dd);
      font(700, 30, CAPS); text('WHO IS NAMED HERE', CX, 140, { align: 'center', color: C.green, spacing: '2px' });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, 560); ctx.lineTo(R, 560); ctx.stroke();
      [['Nov', 11], ['Dec', 12], ['Jan', 1], ['Feb', 2], ['Mar', 3], ['Apr', 4], ['May', 5]].forEach(([m, mm]) => {
        const x = X(d(mm >= 11 ? 1942 : 1943, mm, 1)); ctx.fillStyle = C.ink; ctx.fillRect(x - 1, 552, 2, 16);
        font(500, 20); text(m, x + 22, 588, { align: 'center', color: C.soft });
      });
      // First Army: 8 Nov 1942 – 13 May 1943 at Medjez
      const g1 = eio(seg(t, 37.6, 39.2));
      ctx.fillStyle = C.green; ctx.fillRect(X(d(1942, 11, 8)), 300, (X(d(1943, 5, 13)) - X(d(1942, 11, 8))) * g1, 46);
      font(700, 23); text('First Army', X(d(1942, 11, 8)), 280, { color: C.green });
      font(500, 21); text('8 Nov 1942 – 13 May 1943 · Medjez-el-Bab', X(d(1942, 11, 8)), 370, { color: C.ink });
      // Eighth Army: Alamein Memorial before 20 Feb, Medjez from 20 Feb
      A(seg(t, 41.8, 42.4), () => {
        const g2 = eio(seg(t, 42.0, 43.4));
        ctx.fillStyle = C.green; ctx.fillRect(X(d(1943, 2, 20)), 440, (X(d(1943, 5, 13)) - X(d(1943, 2, 20))) * g2, 46);
        font(700, 23); text('Eighth Army', X(d(1943, 2, 20)), 420, { color: C.green });
        font(500, 21); text('from 20 Feb 1943 · Medjez-el-Bab', X(d(1943, 2, 20)), 510, { color: C.ink });
      });
      A(seg(t, 46.6, 47.2), () => {
        const x0 = X(d(1942, 11, 8)), x1 = X(d(1943, 2, 19));
        ctx.fillStyle = 'rgba(164,87,60,0.75)'; ctx.fillRect(x0, 440, (x1 - x0) * eio(seg(t, 46.8, 47.8)), 46);
        font(600, 21); text('up to 19 Feb 1943: named on the', (x0 + x1) / 2 - 10, 640, { align: 'center', color: C.rust });
        text('Alamein Memorial, in Egypt', (x0 + x1) / 2 - 10, 668, { align: 'center', color: C.rust });
      });
      A(seg(t, 46.4, 47.0), () => {
        const x = X(d(1943, 5, 13));
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(x, 260); ctx.lineTo(x, 600); ctx.stroke(); ctx.setLineDash([]);
        font(700, 22); text('13 May 1943', x, 620, { align: 'right', color: C.ink });
      });
    });
  });
}

// ---------- E: the design and the new planting ----------
function sceneDesign(t) {
  A(span(t, 50.8, 65.2, 0.4, 0), () => {
    // cue 12: Worthington's design
    A(span(t, 50.8, 55.6, 0.4, 0.4), () => {
      font(700, 30, CAPS); text('SIR HUBERT WORTHINGTON', CX, 140, { align: 'center', color: C.green, spacing: '2px' });
      font(500, 22); text('architect of the cemetery and the memorial', CX, 182, { align: 'center', color: C.soft });
      ctx.fillStyle = C.lawn; ctx.fillRect(60, 620, W - 120, 80);
      crossOfSacrifice(560, 640, 1.35);
      stoneOfRemembrance(250, 640, 0.9);
      for (let i = 0; i < 4; i++) headstone(400 + i * 34, 660, 18, 30, C.stone);
      font(600, 22); text('Cross of Sacrifice', 640, 300, { color: C.ink });
      text('Stone of Remembrance', 250, 540, { align: 'center', color: C.ink });
    });
    // cues 13–14: a drier climate; the lawn cut by three quarters
    A(seg(t, 55.6, 56.2), () => {
      font(700, 30, CAPS); text('A GARDEN FOR A DRIER CLIMATE', CX, 140, { align: 'center', color: C.green, spacing: '1px' });
      const x0 = 120, w = W - 240, y0 = 260, h = 300;
      const cut = eio(seg(t, 60.6, 62.4));
      // the lawn before, then three quarters replaced by drought-tolerant planting
      ctx.fillStyle = C.lawn; ctx.fillRect(x0, y0, w, h);
      ctx.fillStyle = C.sand; ctx.fillRect(x0 + w * 0.25, y0, w * 0.75 * cut, h);
      if (cut > 0) {
        for (let i = 0; i < 60; i++) {
          const px = x0 + w * 0.25 + ((i * 53) % 100) / 100 * w * 0.75, py = y0 + 20 + ((i * 37) % 100) / 100 * (h - 40);
          if (px > x0 + w * 0.25 + w * 0.75 * cut) continue;
          ctx.fillStyle = i % 3 ? C.olive : '#b6a46a'; ctx.beginPath(); ctx.arc(px, py, 7 + (i % 4), 0, TAU); ctx.fill();
        }
      }
      for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++) headstone(x0 + 30 + c * ((w - 60) / 11), y0 + 70 + r * 66, 14, 24, C.stone);
      font(600, 23); text('watered lawn', x0, y0 + h + 34, { color: C.lawnDark });
      A(seg(t, 61.8, 62.4), () => {
        font(700, 26); text('−75% irrigated turf', x0 + w, y0 + h + 34, { align: 'right', color: C.rust });
        font(500, 22); text('drought-tolerant planting', x0 + w, y0 + h + 68, { align: 'right', color: C.ink });
      });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.sky1); lg.addColorStop(0.55, C.sky2); lg.addColorStop(1, '#e3e6dc');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, '*Medjez-el-Bab*, Tunisia, about 60 km west of Tunis, on the road from Le Kef.'],
  [5.0, 9.4, 'Its war cemetery is the largest *Commonwealth war cemetery* in the country.'],
  [9.6, 14.0, '*2,903* Commonwealth servicemen of the Second World War are buried or commemorated here.'],
  [14.2, 18.6, '~385~ of the burials are unidentified: soldiers whose names could not be found.'],
  [18.8, 23.2, 'Why here? From December 1942, ~Medjez-el-Bab~ marked the limit of the Allied advance on Tunis.'],
  [23.4, 27.8, 'It stayed on the front line until the Allied advances of *April and May 1943*.'],
  [28.0, 32.4, 'Many who died in the campaign have *no known grave*: they were never found or identified.'],
  [32.6, 37.0, 'So a memorial in the cemetery bears almost *2,000 names*.'],
  [37.2, 41.6, 'It names men of the British *First Army* who died in Algeria and Tunisia from 8 November 1942.'],
  [41.8, 46.2, 'From 20 February 1943 it also names men of the *Eighth Army*, which came from Egypt and Libya.'],
  [46.4, 50.8, 'Eighth Army men missing in Tunisia before then are named on the ~Alamein Memorial~ in Egypt.'],
  [51.0, 55.4, 'Sir Hubert Worthington designed it: a *Cross of Sacrifice* and a *Stone of Remembrance*.'],
  [55.6, 60.0, 'The Commonwealth War Graves Commission is replanting it for a *drier climate*.'],
  [60.2, 64.6, 'The new design cuts the watered lawn by *three quarters*, with plants that need little water.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [CAPS, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneWhere(t);
    sceneGraves(t);
    sceneWhy(t);
    sceneMemorial(t);
    sceneDesign(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.green, '~': C.rust } });
  },
});
