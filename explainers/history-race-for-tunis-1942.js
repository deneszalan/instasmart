// Explainer for history-race-for-tunis-1942 (Tunisia 1943): Operation Torch put Allied troops ashore in Morocco and
// Algeria on 8 November 1942; the Axis flew troops into Tunis from 9 November; the Allied dash overland from Algeria
// stopped at Djedeida, 13 miles from Tunis, and by Christmas the race was lost, so the fight for Tunisia lasted until
// May 1943. Look: a map-room at night, land in dark olive, sea in deep slate; Allied moves in amber, Axis moves in
// lavender; everything schematic. Oswald for place names and titles, Fira Sans for captions and notes.
//
// Facts:
// - US Army Center of Military History, CMH Pub 72-11 "Algeria-French Morocco" (C. R. Anderson, 1993; read at
//   archive.org/details/AlgeriafrenchMorocco): D-day 8 November 1942; landings at Casablanca (Patton), Oran
//   (Fredendall) and Algiers (Ryder for the first landings, Anderson's Eastern Task Force); "One hundred twenty-five
//   thousand soldiers, sailors, and airmen participated in the operation, 82,600 of them U.S. Army personnel";
//   cease-fires at Algiers 8 Nov, Oran 10 Nov, Casablanca order 10 Nov.
// - CMH Pub 72-12 "Tunisia" (archive.org/details/TunisiaCmh72-12): Tunisia "some 400 miles east of Algiers";
//   Bizerte and Tunis "only forty miles apart"; "Djedeida left only a thirteen-mile run to Tunis"; 10 Nov 28 Italian
//   fighters to Tunis, then an airlift of over 15,000 men; "By mid-November about 15,000 German and 9,000 Italian
//   troops" held two beachheads around Bizerte and Tunis; Allied attack from the night of 24-25 Nov; Medjez el Bab
//   taken 26 Nov, Tebourba 27 Nov; on 28 Nov the 11th Brigade Group stopped at Djedeida, "thirteen miles west of
//   Tunis"; "The decisive Axis advantage ... was above the battlefield": Luftwaffe squadrons "often flew several
//   on-call missions each day from fields on the outskirts of Tunis, while Allied squadrons had time for only one
//   planned daylight mission from more distant fields"; Allied pilots west of the Atlas "lost many days to rain";
//   counterattack 1 Dec; by 10 Dec the Allies held a line just east of Medjez el Bab; Longstop Hill attack from
//   22 Dec, stopped by the 26th; "The run for Tunis had been stopped"; campaign to 13 May 1943.
// - G. F. Howe, "Northwest Africa: Seizing the Initiative in the West" (CMH, 1957; archive.org copy): 9 Nov the
//   first German planes landed at El Aouina airdrome near Tunis; 19 Nov the German ultimatum to General Georges Barré
//   at Medjez el Bab, then the first fighting with French troops (among Barré's units, mixed zouaves and tirailleurs,
//   i.e. North African riflemen); Anderson's air support from Souk el Arba (80 miles from Tunis), Bône (135) and
//   Youks-les-Bains (155); trains from Algiers to the railhead at Souk el Arba took four to six days; Eisenhower:
//   in "protracted rain ... every field we have becomes unusable except the tiny one at Bone"; on 24 Dec Eisenhower
//   and Anderson agreed the weather "dictated an indefinite deferment"; the race "had been lost".
// The maps are schematic, drawn from rounded coordinates; front lines and arrows are simplified.
//
// Scene plan (65.2 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0–14.0  Torch: three landings; Tunisia and its ports facing Sicily.
//  B 14.2–23.2  The Axis air bridge to El Aouina; 15,000 + 9,000 by mid-November.
//  C 23.4–37.0  The overland dash; French troops from 19 Nov; Djedeida, 13 miles from Tunis.
//  D 37.2–50.8  Why it stalled: airfields near and far; rain, mud, slow trains.
//  E 51.0–64.6  Pushed back; Longstop Hill; 24 December halt; six more months, to 13 May 1943.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sea: '#13212a', sea2: '#182a35', land: '#3d4b3e', land2: '#4d5e48', coast: '#a3b18e', hill: '#2f3b30',
  ink: '#f4ecd6', soft: 'rgba(244,236,214,0.74)', faint: 'rgba(244,236,214,0.22)', grid: 'rgba(163,177,142,0.10)',
  allied: '#f2a541', axis: '#b7a3f0', rain: '#8fc3e6', mud: '#7a6a4f', panel: 'rgba(15,26,33,0.88)',
};
const HEAD = 'Oswald', SANS = 'Fira Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const TORCH_TOTAL = 125000, GERMANS_MID_NOV = 15000, ITALIANS_MID_NOV = 9000;
const DJEDEIDA_TO_TUNIS_MI = 13, ALGIERS_TO_TUNISIA_MI = 400;
const FIELDS_MI = { souk: 80, bone: 135, youks: 155 };
if (GERMANS_MID_NOV + ITALIANS_MID_NOV !== 24000) throw new Error('numbers');

// ---------- projections ----------
function projector(lon0, lon1, lat0, lat1, x0, x1, yTop) {
  const c = Math.cos(((lat0 + lat1) / 2) * Math.PI / 180);
  const s = (x1 - x0) / ((lon1 - lon0) * c);
  return { P: (lon, lat) => [x0 + (lon - lon0) * c * s, yTop + (lat1 - lat) * s], h: (lat1 - lat0) * s, s };
}
const BIG = projector(-11, 17, 29.6, 42.6, 20, 844, 190);
const ZOOM = projector(7.5, 10.6, 35.95, 37.45, 30, 834, 150);
const BIG_BOX = [20, 150, 824, 560], ZOOM_BOX = [30, 150, 804, 486];
/** Draw inside a map frame, clipped. */
function framed([x, y, w, h], fn) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); fn(); ctx.restore();
  ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
}

// ---------- coastlines, rough (lon, lat) ----------
const AFRICA = [[-10.5, 29.5], [-9.7, 30.5], [-9.3, 32.5], [-7.6, 33.6], [-6.8, 34.0], [-6.6, 34.3], [-6.15, 35.2], [-5.8, 35.8], [-5.3, 35.9],
  [-4.4, 35.2], [-2.9, 35.3], [-1.9, 35.1], [-0.63, 35.72], [0.1, 35.93], [1.3, 36.5], [3.05, 36.77], [3.9, 36.92], [5.08, 36.76], [5.77, 36.82],
  [6.9, 36.89], [7.76, 36.9], [8.44, 36.9], [8.76, 36.96], [9.2, 37.23], [9.85, 37.34], [9.87, 37.27], [10.19, 37.17], [10.28, 37.18],
  [10.29, 36.92], [10.3, 36.82], [10.34, 36.73], [10.49, 36.7], [10.9, 37.0], [11.04, 37.08], [11.1, 36.85], [10.73, 36.45], [10.6, 36.4],
  [10.64, 35.83], [10.83, 35.77], [11.06, 35.5], [10.76, 34.74], [10.1, 33.88], [10.9, 33.8], [11.1, 33.5], [11.56, 33.17], [13.18, 32.9],
  [15.1, 32.37], [17.5, 31.0], [18, 26], [-12, 26]];
const IBERIA = [[-9.0, 37.0], [-7.9, 37.0], [-6.3, 36.53], [-5.6, 36.0], [-5.35, 36.14], [-4.42, 36.72], [-2.46, 36.84], [-2.19, 36.72],
  [-0.98, 37.6], [-0.48, 38.35], [-0.37, 39.47], [0.2, 40.2], [0.9, 41.0], [2.2, 41.4], [3.2, 41.9], [3.2, 46], [-9.5, 46], [-8.9, 41.0], [-9.4, 39.0]];
const SARDINIA = [[9.2, 41.25], [9.7, 40.9], [9.75, 40.0], [9.55, 39.1], [8.85, 38.87], [8.4, 39.1], [8.4, 39.9], [8.15, 40.6], [8.5, 40.95]];
const CORSICA = [[9.4, 43.0], [9.55, 42.1], [9.2, 41.4], [8.7, 41.7], [8.6, 42.4], [9.3, 43.0]];
const SICILY = [[12.5, 38.02], [13.36, 38.12], [14.02, 38.04], [15.55, 38.19], [15.09, 37.5], [15.29, 37.07], [15.13, 36.69], [14.25, 37.06],
  [13.58, 37.3], [12.43, 37.8]];
const ITALY = [[15.65, 38.2], [16.2, 38.9], [15.9, 39.6], [15.7, 40.1], [14.9, 40.6], [14.2, 40.8], [13.0, 41.25], [12.0, 41.9], [10.5, 43.0],
  [10.5, 46], [18, 46], [18, 40.4], [16.6, 40.0], [17.1, 39.4], [16.5, 38.7], [16.1, 38.0]];
const WEST = [[-0.63, 35.72], [-4, 33.8], [-7.6, 33.6]];
void WEST;

// places
const PL = {
  casablanca: [-7.6, 33.6], oran: [-0.63, 35.7], algiers: [3.05, 36.75], tunis: [10.18, 36.81], bizerte: [9.87, 37.27], sicily: [14.2, 37.6],
  aouina: [10.23, 36.85], sidiAhmed: [9.79, 37.25], djedeida: [9.93, 36.85], tebourba: [9.84, 36.83], medjez: [9.61, 36.65], beja: [9.18, 36.73],
  mateur: [9.665, 37.04], souk: [8.78, 36.5], bone: [7.72, 36.85], youks: [8.0, 35.38], longstop: [9.70, 36.72], tabarka: [8.76, 36.95],
};
const MEDJERDA = [[7.9, 36.25], [8.4, 36.42], [8.78, 36.5], [9.06, 36.61], [9.35, 36.6], [9.61, 36.65], [9.75, 36.76], [9.84, 36.83], [9.93, 36.85], [10.05, 36.97], [10.15, 37.08]];

function poly(P, pts, close = true) {
  ctx.beginPath();
  pts.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  if (close) ctx.closePath();
}
function landmass(P, fill = C.land) {
  ctx.fillStyle = fill; ctx.strokeStyle = C.coast; ctx.lineWidth = 2;
  for (const p of [AFRICA, IBERIA, SARDINIA, CORSICA, SICILY, ITALY]) { poly(P, p); ctx.fill(); ctx.stroke(); }
}
function graticule(P, lon0, lon1, lat0, lat1, step) {
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let lo = Math.ceil(lon0 / step) * step; lo <= lon1; lo += step) { const [a, b] = P(lo, lat0), [c2, d] = P(lo, lat1); ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c2, d); ctx.stroke(); }
  for (let la = Math.ceil(lat0 / step) * step; la <= lat1; la += step) { const [a, b] = P(lon0, la), [c2, d] = P(lon1, la); ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c2, d); ctx.stroke(); }
}
function town(P, key, label, { dx = 12, dy = -12, align = 'left', size = 22, color = C.ink, dot = C.ink, r = 5 } = {}) {
  const [x, y] = P(...PL[key]);
  ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (label) { font(500, size, HEAD); text(label, x + dx, y + dy, { align, base: 'middle', color, spacing: '1px' }); }
  return [x, y];
}
/** An arrow along points, drawn up to fraction p, with a head. */
function arrow(pts, p, color, width = 7) {
  if (p <= 0) return;
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let left = tot * clamp(p), x = pts[0][0], y = pts[0][1], ang = 0;
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x, y);
  for (let i = 1; i < pts.length && left > 0; i++) {
    const f = Math.min(1, left / L[i - 1]);
    x = lerp(pts[i - 1][0], pts[i][0], f); y = lerp(pts[i - 1][1], pts[i][1], f);
    ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    ctx.lineTo(x, y); left -= L[i - 1];
  }
  ctx.stroke(); ctx.lineCap = 'butt';
  const hs = width * 2.6;
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(x + Math.cos(ang) * hs, y + Math.sin(ang) * hs);
  ctx.lineTo(x + Math.cos(ang + 2.5) * hs, y + Math.sin(ang + 2.5) * hs);
  ctx.lineTo(x + Math.cos(ang - 2.5) * hs, y + Math.sin(ang - 2.5) * hs);
  ctx.closePath(); ctx.fill();
}
function plane(x, y, ang, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(14 * s, 0); ctx.lineTo(-10 * s, -2.5 * s); ctx.lineTo(-10 * s, 2.5 * s); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(3 * s, 0); ctx.lineTo(-3 * s, -13 * s); ctx.lineTo(-6 * s, -13 * s); ctx.lineTo(-3 * s, 0); ctx.lineTo(-6 * s, 13 * s); ctx.lineTo(-3 * s, 13 * s); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-8 * s, 0); ctx.lineTo(-12 * s, -6 * s); ctx.lineTo(-13 * s, -6 * s); ctx.lineTo(-11 * s, 0); ctx.lineTo(-13 * s, 6 * s); ctx.lineTo(-12 * s, 6 * s); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/** Several strings on one line, each drawn (and translated) on its own: words stay whole for other languages, numbers can change. */
function words(parts, x, y, { align = 'center', color } = {}) {
  const sp = ctx.measureText(' ').width, ws = parts.map((p) => ctx.measureText(p).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  parts.forEach((p, i) => { text(p, cx, y, { align: 'left', base: 'middle', ...(color ? { color } : {}) }); cx += ws[i] + sp; });
}
function title(s, sub, a, y = 92, color = C.ink) {
  A(a, () => {
    font(600, 40, HEAD); text(s, CX, y, { align: 'center', base: 'middle', color, spacing: '2px' });
    if (sub) { font(400, 25); text(sub, CX, y + 44, { align: 'center', base: 'middle', color: C.soft }); }
  });
}
function chip(x, y, s, color, { size = 22, bg = C.panel } = {}) {
  font(500, size, HEAD);
  const w = ctx.measureText(s).width + 22;
  ctx.fillStyle = bg; k.rrect(x - w / 2, y - size * 0.8, w, size * 1.6, 8); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  text(s, x, y + 1, { align: 'center', base: 'middle', color });
}

// ---------- A: Torch ----------
function sceneTorch(t) {
  A(span(t, 0, 23.4, 0.4, 0.6), () => {
    const P = BIG.P;
    framed(BIG_BOX, () => { graticule(P, -12, 18, 27, 45, 2); landmass(P); hiTunisia(t, P); });
  });
  A(span(t, 0, 23.4, 0.4, 0.6), () => {
    const P = BIG.P;
    torchLabels(t, P);
  });
}
function hiTunisia(t, P) {
    A(seg(t, 9.6, 10.6), () => {
      ctx.fillStyle = C.land2; ctx.strokeStyle = C.allied; ctx.lineWidth = 2;
      poly(P, [[8.4, 36.95], [8.76, 36.96], [9.2, 37.23], [9.85, 37.34], [10.19, 37.17], [10.28, 37.18], [10.29, 36.92], [10.34, 36.73], [10.49, 36.7], [10.9, 37.0], [11.04, 37.08],
        [11.1, 36.85], [10.6, 36.4], [10.64, 35.83], [11.06, 35.5], [10.76, 34.74], [10.1, 33.88], [10.9, 33.8], [11.1, 33.5], [11.56, 33.17], [10.2, 31.5], [9.5, 30.2], [9.2, 32.0], [7.5, 33.2], [8.25, 34.6], [8.4, 35.8]]);
      ctx.fill();
    });
}
function torchLabels(t, P) {
    A(seg(t, 9.6, 10.6), () => {
      font(600, 30, HEAD); const [tx, ty] = P(9.4, 33.9); text('TUNISIA', tx, ty, { align: 'center', base: 'middle', color: C.ink, spacing: '3px' });
      font(400, 22); text('French protectorate', tx, ty + 32, { align: 'center', base: 'middle', color: C.soft });
    });
    // labels for countries
    A(seg(t, 0.4, 1.2) * (1 - 0.6 * seg(t, 9.6, 10.4)), () => {
      font(500, 22, HEAD);
      let [x, y] = P(-6.2, 31.8); text('MOROCCO', x, y, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
      [x, y] = P(2.5, 32.8); text('ALGERIA', x, y, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
      [x, y] = P(-4.5, 39.6); text('SPAIN', x, y, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
      [x, y] = P(14.6, 31.2); text('LIBYA', x, y, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    });
    // three landings
    const land = [
      ['casablanca', [[-14, 35.2], [-11, 34.6], [-8.3, 33.8]], 'CASABLANCA', -1, 1.0],
      ['oran', [[-4.6, 36.3], [-2.4, 36.15], [-0.8, 35.85]], 'ORAN', 1, 1.6],
      ['algiers', [[0.0, 37.9], [1.6, 37.45], [2.9, 36.95]], 'ALGIERS', 1, 2.2],
    ];
    for (const [key, path, name, side, t0] of land) {
      const pts = path.map(([lo, la]) => P(lo, la));
      A(1 - seg(t, 9.6, 10.6) * 0.65, () => arrow(pts, eio(seg(t, t0, t0 + 1.6)), C.allied, 6));
      A(seg(t, t0 + 1.3, t0 + 1.8), () => {
        const [x, y] = town(P, key, null, { dot: C.allied, r: 6 });
        font(600, 22, HEAD); text(name, x + (side < 0 ? 14 : 0), y + 30, { align: side < 0 ? 'left' : 'center', base: 'middle', color: C.allied, spacing: '1px' });
      });
    }
    title('8 NOVEMBER 1942 · OPERATION TORCH', null, seg(t, 0.6, 1.4) * (1 - seg(t, 9.2, 9.6)));
    // 125,000
    A(seg(t, 5.2, 5.8) * (1 - seg(t, 9.2, 9.6)), () => {
      const n = Math.round(TORCH_TOTAL * eout(seg(t, 5.2, 7.2)) / 1000) * 1000;
      ctx.fillStyle = C.panel; k.rrect(132, 186, 600, 128, 14); ctx.fill();
      font(700, 60, HEAD); text(Kit.fmt(n), CX, 236, { align: 'center', base: 'middle', color: C.allied });
      font(400, 24); text('American and British soldiers, sailors and airmen', CX, 284, { align: 'center', base: 'middle', color: C.soft });
    });
    // Tunis, Bizerte facing Sicily
    A(seg(t, 10.6, 11.4), () => {
      const [tx, ty] = town(P, 'tunis', null, { r: 6 }), [bx, by] = town(P, 'bizerte', null, { r: 6 });
      font(600, 22, HEAD); text('TUNIS', tx - 12, ty + 14, { align: 'right', base: 'middle', color: C.ink, spacing: '1px' });
      text('BIZERTE', bx - 10, by - 22, { align: 'right', base: 'middle', color: C.ink, spacing: '1px' });
      const [sx, sy] = P(...PL.sicily);
      font(600, 22, HEAD); text('SICILY', sx, sy - 34, { align: 'center', base: 'middle', color: C.axis, spacing: '2px' });
      ctx.setLineDash([6, 8]); ctx.strokeStyle = C.axis; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx - 20, sy + 6); ctx.lineTo(tx + 12, ty - 6); ctx.stroke(); ctx.setLineDash([]);
    });
    title('THE PRIZE: TUNIS AND BIZERTE', 'two ports facing Sicily, 40 miles apart', seg(t, 10.2, 11.0) * (1 - seg(t, 13.8, 14.2)));
    // B: the air bridge
    sceneAirBridge(t, P);
}

// ---------- B: the air bridge ----------
function sceneAirBridge(t, P) {
  const a = seg(t, 14.2, 14.8);
  if (a <= 0) return;
  const [sx, sy] = P(13.4, 37.9), [ax, ay] = P(...PL.aouina);
  A(a, () => {
    // planes along the bridge
    for (let i = 0; i < 7; i++) {
      const u = ((t - 14.4) * 0.28 + i / 7) % 1;
      if (t < 14.4 + i * 0.4) continue;
      const x = lerp(sx, ax, u), y = lerp(sy, ay, u) - Math.sin(u * Math.PI) * 30;
      A(Math.min(1, u * 6, (1 - u) * 6), () => plane(x, y, Math.atan2(ay - sy, ax - sx) + Math.PI * 0, 1.1, C.axis));
    }
    const [x, y] = [ax, ay];
    ctx.strokeStyle = C.axis; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 14 + 3 * Math.sin(t * 4), 0, TAU); ctx.stroke();
    font(600, 22, HEAD); text('EL AOUINA AIRFIELD', x, y + 52, { align: 'center', base: 'middle', color: C.axis, spacing: '1px' });
  });
  title('FROM 9 NOVEMBER: THE AXIS FLIES IN', 'German planes land at El Aouina, by Tunis', seg(t, 14.4, 15.2) * (1 - seg(t, 18.6, 19.0)), 92, C.axis);
  // mid-November strength: two bars
  A(seg(t, 18.9, 19.5), () => {
    ctx.fillStyle = C.panel; k.rrect(132, 56, 600, 140, 14); ctx.fill();
    font(600, 28, HEAD); text('MID-NOVEMBER 1942, AROUND TUNIS AND BIZERTE', CX, 86, { align: 'center', base: 'middle', color: C.axis, spacing: '1px' });
    const g = eout(seg(t, 19.2, 20.6)), i2 = eout(seg(t, 19.8, 21.2));
    const L = 300, unit = 260 / 15000;
    ctx.fillStyle = C.axis; ctx.fillRect(L, 116, unit * GERMANS_MID_NOV * g, 26);
    ctx.globalAlpha *= 0.65; ctx.fillRect(L, 152, unit * ITALIANS_MID_NOV * i2, 26); ctx.globalAlpha /= 0.65;
    font(500, 22); text('German troops', L - 14, 129, { align: 'right', base: 'middle', color: C.ink });
    text('Italian troops', L - 14, 165, { align: 'right', base: 'middle', color: C.ink });
    font(600, 22, HEAD);
    words(['about', Kit.fmt(Math.round(GERMANS_MID_NOV * g / 100) * 100)], L + unit * GERMANS_MID_NOV * g + 12, 129, { align: 'left', color: C.axis });
    words(['about', Kit.fmt(Math.round(ITALIANS_MID_NOV * i2 / 100) * 100)], L + unit * ITALIANS_MID_NOV * i2 + 12, 165, { align: 'left', color: C.axis });
  });
}

// ---------- the zoomed map of northern Tunisia ----------
function zoomMap(t, { dim = 0 } = {}) {
  const P = ZOOM.P;
  framed(ZOOM_BOX, () => zoomBody(P));
  void dim; void t;
  font(400, 22); const [x, y] = P(7.56, 36.02); text('schematic', x, y, { align: 'left', base: 'middle', color: C.faint });
}
function zoomBody(P) {
  graticule(P, 7.5, 10.6, 35.95, 37.45, 0.5);
  landmass(P);
  // the Algerian border, schematic
  ctx.setLineDash([3, 7]); ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
  poly(P, [[8.62, 36.95], [8.45, 36.6], [8.35, 36.2], [8.3, 35.7], [8.25, 35.25]], false); ctx.stroke(); ctx.setLineDash([]);
  font(500, 24, HEAD);
  let [x, y] = P(7.85, 36.15); text('ALGERIA', x, y, { align: 'center', base: 'middle', color: C.faint, spacing: '3px' });
  [x, y] = P(9.4, 36.1); text('TUNISIA', x, y, { align: 'center', base: 'middle', color: C.faint, spacing: '3px' });
  // the Medjerda valley
  ctx.strokeStyle = 'rgba(143,195,230,0.45)'; ctx.lineWidth = 3; poly(P, MEDJERDA, false); ctx.stroke();
  // hills, schematic: small chevrons along the Dorsale and the northern hills
  ctx.strokeStyle = 'rgba(20,30,22,0.55)'; ctx.lineWidth = 3;
  const ridge = [[8.0, 35.4], [8.5, 35.7], [8.9, 35.95], [9.3, 36.2], [9.7, 36.35], [10.1, 36.45]];
  const north = [[8.9, 36.85], [9.2, 36.95], [9.45, 36.9]];
  for (const line of [ridge, north]) for (let i = 0; i < line.length; i++) {
    const [px, py] = P(...line[i]);
    for (const dx of [-14, 8]) { ctx.beginPath(); ctx.moveTo(px + dx - 9, py + 6); ctx.lineTo(px + dx, py - 6); ctx.lineTo(px + dx + 9, py + 6); ctx.stroke(); }
  }
}
const ZP = (key) => ZOOM.P(...PL[key]);

// ---------- C: the dash ----------
function sceneDash(t) {
  A(span(t, 23.2, 51.0, 0.6, 0.5), () => {
    zoomMap(t);
    const P = ZOOM.P;
    // towns
    const towns = [['tunis', 'TUNIS', 14, 6, 'left'], ['bizerte', 'BIZERTE', -12, -20, 'right'], ['mateur', 'MATEUR', 12, -14, 'left'],
      ['beja', 'BÉJA', 0, -22, 'center'], ['souk', 'SOUK EL ARBA', 0, 26, 'center'], ['medjez', 'MEDJEZ EL BAB', -10, 28, 'center'],
      ['tebourba', 'TEBOURBA', -10, -24, 'center'], ['djedeida', 'DJEDEIDA', 20, -28, 'left'], ['bone', 'BÔNE', -6, -22, 'center']];
    for (const [key, name, dx, dy, align] of towns) {
      const a = key === 'tunis' || key === 'bizerte' ? 1 : seg(t, 24.0, 25.0);
      A(a, () => town(P, key, name, { dx, dy, align, size: 22, r: key === 'tunis' ? 7 : 5 }));
    }
    // Axis bridgehead around Tunis and Bizerte (from 23.4)
    A(seg(t, 23.6, 24.6) * (1 - seg(t, 50.4, 50.8)), () => {
      ctx.fillStyle = 'rgba(183,163,240,0.16)'; ctx.strokeStyle = 'rgba(183,163,240,0.6)'; ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      poly(P, [[9.75, 37.38], [10.3, 37.25], [10.4, 36.7], [10.05, 36.66], [9.95, 36.8], [9.7, 37.0], [9.6, 37.2]]); ctx.fill(); ctx.stroke();
      ctx.setLineDash([]);
    });
    // the route from Algiers (off map, left) and the three axes
    const off = P(7.45, 36.6);
    const axes = [
      [[P(8.62, 36.9), P(9.1, 36.98), P(9.5, 37.08)], 'north'],
      [[P(8.9, 36.62), P(9.3, 36.85), P(9.62, 36.95), P(9.82, 36.88)], 'centre'],
      [[off, ZP('souk'), ZP('beja'), ZP('medjez'), ZP('tebourba'), ZP('djedeida')], 'south'],
    ];
    A(seg(t, 23.6, 24.4) * (1 - seg(t, 36.6, 37.2)), () => {
      // from Algiers, about 400 miles
      arrow([P(7.5, 36.66), P(7.95, 36.6)], 1, C.allied, 6);
      font(500, 22); const [x, y] = P(7.56, 36.78); text(`from Algiers, about ${ALGIERS_TO_TUNISIA_MI} miles`, x, y, { align: 'left', base: 'middle', color: C.allied });
    });
    axes.forEach(([pts], i) => A(1 - 0.5 * seg(t, 37.0, 37.6), () => arrow(pts, eio(seg(t, 24.6 + i * 0.5, 31.0 + (i === 2 ? 1.8 : 0))), C.allied, 7)));
    title('THE DASH FOR TUNIS', 'British First Army, with American and French units', seg(t, 23.6, 24.4) * (1 - seg(t, 27.6, 28.0)), 92, C.allied);
    // French troops at Medjez el Bab, 19 November
    A(seg(t, 28.0, 28.6) * (1 - seg(t, 32.2, 32.6)), () => {
      const [x, y] = ZP('medjez');
      ctx.strokeStyle = C.allied; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.stroke();
      ctx.fillStyle = C.panel; k.rrect(140, 56, 584, 112, 14); ctx.fill();
      font(600, 28, HEAD); text('19 NOVEMBER · MEDJEZ EL BAB', CX, 88, { align: 'center', base: 'middle', color: C.allied, spacing: '1px' });
      font(400, 23); text('French troops under General Georges Barré,', CX, 124, { align: 'center', base: 'middle', color: C.ink });
      text('zouaves and North African riflemen, fight the Germans', CX, 152, { align: 'center', base: 'middle', color: C.ink });
    });
    // Djedeida: 13 miles from Tunis
    A(seg(t, 32.8, 33.6) * (1 - seg(t, 36.8, 37.2)), () => {
      const [x0, y0] = ZP('djedeida'), [x1, y1] = ZP('tunis');
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([5, 6]);
      ctx.beginPath(); ctx.moveTo(x0, y0 + 34); ctx.lineTo(x1, y1 + 34); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(x0, y0 + 26); ctx.lineTo(x0, y0 + 42); ctx.moveTo(x1, y1 + 26); ctx.lineTo(x1, y1 + 42); ctx.stroke();
      chip((x0 + x1) / 2, y0 + 78, `${DJEDEIDA_TO_TUNIS_MI} MILES`, C.ink, { size: 22 });
      ctx.fillStyle = C.panel; k.rrect(162, 56, 540, 100, 14); ctx.fill();
      font(600, 30, HEAD); text('28 NOVEMBER · DJEDEIDA', CX, 88, { align: 'center', base: 'middle', color: C.allied, spacing: '1px' });
      font(400, 23); text('the closest the dash came to Tunis', CX, 126, { align: 'center', base: 'middle', color: C.soft });
    });
    sceneWhy(t);
  });
}

// ---------- D: why ----------
function sceneWhy(t) {
  if (t < 37.0) return;
  const P = ZOOM.P;
  // Axis fields near the front, Allied fields far away
  const axisFields = [['aouina', 'EL AOUINA'], ['sidiAhmed', 'SIDI AHMED']];
  const allied = [['souk', FIELDS_MI.souk, 0, 56], ['bone', FIELDS_MI.bone, 60, 40], ['youks', FIELDS_MI.youks, 112, 16]];
  const fieldAt = (key) => key === 'youks' ? [ZP('youks')[0], ZOOM_BOX[1] + ZOOM_BOX[3] - 70] : ZP(key);
  const front = ZP('djedeida');
  A(seg(t, 37.2, 37.8) * (1 - seg(t, 50.4, 50.8)), () => {
    title('AIRFIELDS: NEAR AND FAR', null, seg(t, 37.2, 37.8) * (1 - seg(t, 46.0, 46.4)));
    for (const [key, name] of axisFields) {
      const [x, y] = ZP(key);
      ctx.fillStyle = C.axis; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
      if (key === 'aouina') { font(600, 22, HEAD); text(name, x + 4, y - 26, { align: 'center', base: 'middle', color: C.axis }); }
      // short hops to the front, several times
      for (let i = 0; i < 3; i++) {
        const u = ((t - 37.6) * 0.9 + i / 3) % 1, out = u < 0.5 ? u * 2 : 2 - u * 2;
        if (t < 37.6) continue;
        const px = lerp(x, front[0], out), py = lerp(y, front[1], out) - Math.sin(out * Math.PI) * 18;
        plane(px, py, Math.atan2(front[1] - y, front[0] - x) + (u < 0.5 ? 0 : Math.PI), 0.8, C.axis);
      }
    }
    // Allied fields: one long trip
    A(seg(t, 41.8, 42.4), () => {
      for (const [key, mi, dx, dy] of allied) {
        const [x, y] = fieldAt(key);
        const wet = key !== 'bone' ? seg(t, 46.6, 47.6) : 0;
        ctx.fillStyle = wet > 0 ? mix(C.allied, C.mud, wet) : C.allied; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
        font(600, 22, HEAD); text(`${mi} MI FROM TUNIS`, x + dx, y + dy, { align: 'center', base: 'middle', color: wet > 0.5 ? C.mud : C.allied });
        const u = ((t - 42.2) * 0.22 + (key === 'bone' ? 0.33 : key === 'youks' ? 0.66 : 0)) % 1, out = u < 0.5 ? u * 2 : 2 - u * 2;
        if (wet < 0.5) A(1 - wet * 2, () => plane(lerp(x, front[0], out), lerp(y, front[1], out), Math.atan2(front[1] - y, front[0] - x) + (u < 0.5 ? 0 : Math.PI), 0.8, C.allied));
      }
      const [yx] = ZP('youks'), yy = ZOOM_BOX[1] + ZOOM_BOX[3] - 70;
      font(600, 22, HEAD); text('YOUKS-LES-BAINS', yx + 22, yy - 12, { align: 'left', base: 'middle', color: C.allied });
    });
    // the comparison panel
    A(seg(t, 38.0, 38.6) * (1 - seg(t, 46.0, 46.4)), () => {
      ctx.fillStyle = C.panel; k.rrect(84, 640, 696, 132, 14); ctx.fill();
      font(600, 24, HEAD); text('AXIS', 120, 676, { align: 'left', base: 'middle', color: C.axis, spacing: '2px' });
      font(400, 22); text('fields by Tunis: several missions a day', 196, 676, { align: 'left', base: 'middle', color: C.ink });
      A(seg(t, 42.0, 42.6), () => {
        font(600, 24, HEAD); text('ALLIES', 120, 734, { align: 'left', base: 'middle', color: C.allied, spacing: '2px' });
        font(400, 22); text('distant fields: often one mission a day', 214, 734, { align: 'left', base: 'middle', color: C.ink });
      });
    });
    // rain over the west, mud, slow trains
    const rain = seg(t, 46.4, 47.2);
    if (rain > 0) A(rain, () => {
      ctx.strokeStyle = C.rain; ctx.lineWidth = 2;
      const [rx0] = P(7.5, 36), [rx1] = P(9.5, 36);
      for (let i = 0; i < 120; i++) {
        const x = rx0 + ((i * 97.3) % (rx1 - rx0)), y0 = 150 + ((i * 53.7 + t * 420) % 470);
        ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x - 5, y0 + 16); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      title('RAIN, MUD AND A LONG RAILWAY', null, 1, 92, C.rain);
      ctx.fillStyle = C.panel; k.rrect(84, 640, 696, 132, 14); ctx.fill();
      font(400, 22); text('Rain closed dirt airfields; only Bône’s stayed usable.', CX, 676, { align: 'center', base: 'middle', color: C.ink });
      text('Trains from Algiers to Souk el Arba took 4 to 6 days.', CX, 734, { align: 'center', base: 'middle', color: C.ink });
      // the railway into Souk el Arba
      const [sx, sy] = ZP('souk');
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([12, 6]);
      ctx.beginPath(); ctx.moveTo(P(7.5, 36.3)[0], P(7.5, 36.3)[1]); ctx.lineTo(sx, sy); ctx.stroke(); ctx.setLineDash([]);
      const u = ((t - 46.4) * 0.12) % 1;
      ctx.fillStyle = C.ink; const [qx, qy] = [lerp(P(7.5, 36.3)[0], sx, u), lerp(P(7.5, 36.3)[1], sy, u)]; k.rrect(qx - 12, qy - 7, 24, 14, 3); ctx.fill();
    });
  });
}
function mix(a, b, x) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  return `rgb(${Math.round(lerp(r1, r2, x))},${Math.round(lerp(g1, g2, x))},${Math.round(lerp(b1, b2, x))})`;
}

// ---------- E: pushed back, the halt, six more months ----------
function sceneEnd(t) {
  A(span(t, 50.8, 65.2, 0.5, 0), () => {
    const map = 1 - seg(t, 60.0, 60.8);
    A(map, () => {
      zoomMap(t);
      const P = ZOOM.P;
      for (const [key, name, dx, dy, align] of [['tunis', 'TUNIS', 14, 6, 'left'], ['bizerte', 'BIZERTE', -12, -20, 'right'], ['medjez', 'MEDJEZ EL BAB', -10, 28, 'center'], ['tebourba', 'TEBOURBA', -10, -24, 'center'], ['djedeida', 'DJEDEIDA', 20, -28, 'left']])
        town(P, key, name, { dx, dy, align, size: 22, r: key === 'tunis' ? 7 : 5 });
      // the front line slides back from Djedeida to just east of Medjez el Bab
      const back = eio(seg(t, 51.6, 54.8));
      const fx = lerp(ZP('djedeida')[0] - 18, ZP('medjez')[0] + 26, back);
      ctx.strokeStyle = C.allied; ctx.lineWidth = 5; ctx.setLineDash([14, 8]);
      ctx.beginPath(); ctx.moveTo(fx + 40, ZP('mateur')[1] - 40); ctx.quadraticCurveTo(fx - 10, ZP('tebourba')[1], fx + 10, ZP('medjez')[1] + 70); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < 3; i++) {
        const y = ZP('tebourba')[1] - 60 + i * 60;
        arrow([[fx + 120, y], [fx + 46, y + 6]], seg(t, 51.4 + i * 0.3, 53.0 + i * 0.3) * (1 - seg(t, 55.0, 55.6)), C.axis, 6);
      }
      A(seg(t, 51.2, 51.8) * (1 - seg(t, 55.2, 55.6)), () => {
        ctx.fillStyle = C.panel; k.rrect(132, 56, 600, 100, 14); ctx.fill();
        font(600, 28, HEAD); text('1–10 DECEMBER: PUSHED BACK', CX, 88, { align: 'center', base: 'middle', color: C.axis, spacing: '1px' });
        font(400, 22); text('German and Italian counter-attacks retake Tebourba', CX, 124, { align: 'center', base: 'middle', color: C.ink });
      });
      // Longstop Hill
      A(seg(t, 55.6, 56.2), () => {
        const [x, y] = ZP('longstop');
        ctx.fillStyle = C.hill; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 30, y + 14); ctx.lineTo(x - 6, y - 16); ctx.lineTo(x + 8, y - 6); ctx.lineTo(x + 30, y + 14); ctx.closePath(); ctx.fill(); ctx.stroke();
        font(600, 22, HEAD); text('LONGSTOP HILL', x - 34, y - 40, { align: 'right', base: 'middle', color: C.ink });
        font(400, 22); text('22–25 December, in rain', x - 34, y - 14, { align: 'right', base: 'middle', color: C.soft });
        ctx.fillStyle = C.panel; k.rrect(132, 56, 600, 100, 14); ctx.fill();
        font(600, 28, HEAD); text('24 DECEMBER: THE HALT', CX, 88, { align: 'center', base: 'middle', color: C.allied, spacing: '1px' });
        font(400, 22); text('Eisenhower and Anderson: wait for the weather', CX, 124, { align: 'center', base: 'middle', color: C.ink });
      });
    });
    // six more months: a calendar strip
    A(seg(t, 60.4, 61.2), () => {
      const months = ['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'];
      const L = 102, R = 762, y = 470, mw = (R - L) / months.length;
      font(600, 38, HEAD); text('NOT A DASH, BUT SIX MONTHS', CX, 300, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
      months.forEach((m, i) => {
        const x = L + i * mw;
        const on = seg(t, 61.0 + i * 0.25, 61.4 + i * 0.25);
        ctx.fillStyle = i < 2 ? 'rgba(242,165,65,0.25)' : 'rgba(244,236,214,0.10)';
        k.rrect(x + 4, y - 40, mw - 8, 80, 8); ctx.fill();
        A(on, () => { ctx.fillStyle = i < 2 ? C.allied : C.ink; k.rrect(x + 4, y - 40, (mw - 8), 80, 8); ctx.globalAlpha *= 0.25; ctx.fill(); });
        font(500, 24, HEAD); text(m, x + mw / 2, y, { align: 'center', base: 'middle', color: C.ink, spacing: '1px' });
      });
      font(400, 22); text('1942', L + mw, y + 70, { align: 'center', base: 'middle', color: C.soft });
      text('1943', L + mw * 4.5, y + 70, { align: 'center', base: 'middle', color: C.soft });
      A(seg(t, 62.8, 63.4), () => {
        const x = L + mw * 6.6;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 60); ctx.lineTo(x, y + 50); ctx.stroke();
        font(600, 26, HEAD); text('13 MAY 1943', x, y - 84, { align: 'center', base: 'middle', color: C.ink, spacing: '1px' });
      });
      font(400, 22); text('the race (amber), then the long campaign', CX, 620, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

const CUES = [
  [0.4, 4.8, '*8 November 1942*: Allied troops land in Morocco and Algeria, in *Operation Torch*.'],
  [5.0, 9.4, 'About *125,000* American and British soldiers, sailors and airmen took part.'],
  [9.6, 14.0, 'The prize lay east: Tunisia, a French protectorate whose ports, Tunis and Bizerte, face Sicily.'],
  [14.2, 18.6, 'From *9 November*, German planes landed near Tunis. The Axis got there first, by air.'],
  [18.8, 23.2, 'By mid-November about ~15,000 German~ and ~9,000 Italian~ troops held Tunis and Bizerte.'],
  [23.4, 27.8, 'The Allies came overland from Algiers, some 400 miles, under British General Kenneth Anderson.'],
  [28.0, 32.4, 'French troops in Tunisia, North African riflemen among them, fought the Germans from 19 November.'],
  [32.6, 37.0, 'On 28 November the Allies reached *Djedeida*, just 13 miles from Tunis. No closer.'],
  [37.2, 41.6, 'Why? German fighters flew from fields beside Tunis, ~several missions a day~.'],
  [41.8, 46.2, 'Allied planes flew from fields 80 to 155 miles from Tunis: often *one mission a day*.'],
  [46.4, 50.8, 'Then rain turned dirt airfields and roads to mud. Trains from Algiers took four to six days.'],
  [51.0, 55.4, 'German counter-attacks from 1 December pushed the Allies back to Medjez el Bab.'],
  [55.6, 60.0, 'Longstop Hill was lost in the rain. On 24 December, Allied commander Dwight Eisenhower called a halt.'],
  [60.2, 64.6, 'The race was lost. The fight for Tunisia lasted until *13 May 1943*.'],
];

let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.sea2); lg.addColorStop(1, '#0c161c');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneTorch(t);
    sceneDash(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.allied, '~': C.axis } });
  },
});
