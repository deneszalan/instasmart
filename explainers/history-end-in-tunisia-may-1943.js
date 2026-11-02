// Explainer for history-end-in-tunisia-may-1943 (Tunisia 1943): the last week of the war in Africa. On 6 May 1943 the
// British First Army breaks through west of Tunis; on 7 May British armour enters Tunis and American infantry enters
// Bizerte; the Axis armies are split, the Cap Bon peninsula is sealed off, the sea behind them is watched by Allied
// ships and aircraft, and by 13 May the last Axis army in Africa has surrendered. Then: how many prisoners, by whose
// count, and why so many. Look: a schematic staff map of north-east Tunisia on sand-coloured land and a dark sea, the
// Axis-held ground as a rust hatch that shrinks, Allied advances as pale arrows; then the prisoner counts as bars.
// Oswald for dates and numbers, Fira Sans for captions and labels.
//
// Facts:
// - Wikipedia, "Tunisian campaign" (citing Anderson's 1946 despatch, Playfair's British official history and Atkinson):
//   the final assault began at 3.30 a.m. on 6 May 1943 by IX Corps; "On 7 May, British armour entered Tunis and
//   American infantry from II Corps ... entered Bizerte." Playfair: 238,243 unwounded prisoners, 101,784 German,
//   89,442 Italian and 47,017 others; G. F. Howe, the American official historian, 275,000; an 18th Army Group count
//   244,500 (157,000 Germans); Arnim estimated 100,000 German and 200,000 Italian. Goebbels compared the defeat to
//   Stalingrad, and "Tunisgrad" was coined (Atkinson, p. 537). Allied aircraft (Operation Flax) and destroyers from
//   Malta (Operation Retribution) cut supply and evacuation by air and sea.
// - Wikipedia, "Operation Strike": the line broke within 24 hours; patrols reached the centre of Tunis about 4 p.m. on
//   7 May; the 6th Armoured Division forced the defile at Hammam-Lif (9-10 May) and took Hammamet; by nightfall on
//   11 May the British 4th Division held Cap Bon and the 6th Armoured the road from Hammamet to Bou Ficha; by 9 May
//   the 7th Armoured took some 19,000 prisoners around Porto Farina and at least 12,000 Germans surrendered in the
//   American sector; von Arnim surrendered in the hills north of Sainte-Marie-du-Zit; Messe and von Liebenstein
//   surrendered on 13 May; "only 653 Axis troops managed to escape to Europe" (Walter 2023); 200 tanks, 1,200 guns and
//   about 600 aircraft were abandoned for lack of fuel (Porch 2024). Wikipedia, "Operation Retribution": about 630
//   escaped (Forczyk), 897 captured at sea; Cunningham's order "Sink, burn and destroy. Let nothing pass."
// - US Holocaust Memorial Museum, "Tunisia Campaign": on 7 May the British 7th Armoured Division captured Tunis and US
//   II Corps captured Bizerte; on 13 May the Axis forces surrendered; 267,000 German and Italian soldiers became
//   prisoners of war.
// - French ministry of the armed forces (Chemins de mémoire, "Les campagnes de Tunisie et d'Italie"): about 250,000
//   prisoners since the start of the campaign.
// Von Arnim's surrender is dated 12 May by most accounts and 11 May by the French ministry, so no date is drawn for it.
// The map is schematic: coast, fronts and arrows are simplified from the places named above.
//
// Scene plan (65 s). Important things stay above y = 790; captions are centred at y = 846.
//  A  0.0–13.8  The north-east of Tunisia, the Axis pocket, the Allied armies; 6 May breakthrough.
//  B 13.8–28.0  7 May: Tunis and Bizerte; the pocket is split; Hammam-Lif and Cap Bon.
//  C 28.0–41.6  The sea behind them; a few hundred escape; von Arnim and Messe surrender, 13 May.
//  D 41.6–55.4  Whose count? Five figures as bars.
//  E 55.4–64.8  Why so many: trapped with the sea behind them; "Tunisgrad".
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sea1: '#0f2230', sea2: '#16344a', land: '#cdb98d', land2: '#b9a272', ridge: 'rgba(110,88,52,0.35)',
  ink: '#f6f1e6', soft: 'rgba(246,241,230,0.78)', faint: 'rgba(246,241,230,0.28)', dark: '#1d1a14', darkSoft: 'rgba(29,26,20,0.75)',
  axis: '#a8452c', axisFill: 'rgba(168,69,44,0.42)', allied: '#e9f3f6', brit: '#f3d36b', us: '#8fd0e8', fr: '#b8e39b',
  sea: '#7fb3cf',
};
const NUM = 'Oswald', SANS = 'Fira Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const COUNTS = [
  // [label, whose, value]
  ['British official history', 'unwounded prisoners (Playfair)', 238243],
  ['Allied 18th Army Group', 'its own count', 244500],
  ['US Holocaust Memorial Museum', 'German and Italian prisoners', 267000],
  ['US Army official historian', 'G. F. Howe', 275000],
  ['General von Arnim’s estimate', '100,000 German + 200,000 Italian', 100000 + 200000],
];
const PLAYFAIR_GERMAN = 101784, PLAYFAIR_ITALIAN = 89442;
const ESCAPED = 653; // Walter 2023, via Wikipedia "Operation Strike"
const SICILY_KM = 145; // Strait of Sicily, Cap Bon to Sicily (Wikipedia, "Strait of Sicily")
const TUNIS_DAY = 7, END_DAY = 13;
if (END_DAY - TUNIS_DAY !== 6 || COUNTS[0][2] !== 238243 || COUNTS[4][2] !== 300000) throw new Error('numbers');
// Drawn as whole strings below (so the French render can swap them): 'about 653', 'about 145 km', and Playfair's split.
if (ESCAPED !== 653 || SICILY_KM !== 145 || PLAYFAIR_GERMAN !== 101784 || PLAYFAIR_ITALIAN !== 89442) throw new Error('labels');

// ---------- the map ----------
// Plate carrée around 36.7° N: x from longitude, y from latitude, the same km per pixel both ways.
const LON0 = 9.35, LAT0 = 37.45, KM_LON = 89.4, KM_LAT = 111.0, PXKM = 4.25, MX = 34, MY = 66;
const P = (lat, lon) => [MX + (lon - LON0) * KM_LON * PXKM, MY + (LAT0 - lat) * KM_LAT * PXKM];
// Simplified coast of north-east Tunisia, west to east and round Cap Bon to the south (schematic).
const COAST = [
  [37.24, 9.2], [37.25, 9.5], [37.33, 9.78], [37.3, 9.86], [37.26, 9.95], [37.22, 10.1], [37.18, 10.27], [37.12, 10.22],
  [37.03, 10.18], [36.95, 10.2], [36.9, 10.29], [36.86, 10.34], [36.81, 10.3], [36.76, 10.3], [36.72, 10.36], [36.7, 10.49],
  [36.82, 10.66], [36.95, 10.85], [37.05, 10.97], [37.08, 11.05], [36.97, 11.12], [36.85, 11.11], [36.7, 11.0],
  [36.58, 10.86], [36.45, 10.74], [36.4, 10.62], [36.3, 10.47], [36.15, 10.47], [36.0, 10.5], [35.85, 10.6],
];
const LAKES = [[37.19, 9.86, 0.08, 0.05], [36.8, 10.24, 0.05, 0.025]];
const PLACES = {
  Bizerte: [37.27, 9.87], Tunis: [36.8, 10.18], Mateur: [37.04, 9.67], 'Medjez el Bab': [36.65, 9.61],
  'Hammam-Lif': [36.73, 10.34], Hammamet: [36.4, 10.62], Zaghouan: [36.4, 10.14], Enfidaville: [36.13, 10.38],
  'Porto Farina': [37.17, 10.19], Kelibia: [36.85, 11.1],
};
// The Axis-held ground at three moments, as polygons with the same number of points (clipped to the land).
const POCKET = {
  may5: [[37.6, 9.74], [37.0, 9.72], [36.8, 9.73], [36.62, 9.77], [36.45, 9.93], [36.33, 10.08], [36.18, 10.3], [36.05, 10.6], [36.6, 11.5], [37.6, 11.5], [37.6, 10.6], [37.6, 10.0]],
  may8: [[36.76, 10.38], [36.66, 10.3], [36.5, 10.12], [36.34, 10.05], [36.18, 10.28], [36.05, 10.6], [36.4, 10.9], [36.7, 11.4], [37.3, 11.4], [37.15, 10.9], [36.95, 10.62], [36.8, 10.45]],
  may11: [[36.44, 10.2], [36.4, 10.11], [36.33, 10.09], [36.25, 10.14], [36.18, 10.27], [36.14, 10.39], [36.19, 10.45], [36.26, 10.43], [36.32, 10.39], [36.38, 10.33], [36.42, 10.27], [36.44, 10.23]],
};
const NORTH = [[37.4, 9.95], [37.12, 9.98], [37.0, 10.08], [37.0, 10.22], [37.15, 10.35], [37.4, 10.3]];
// Allied advances: [colour key, path of [lat, lon], start, end]
const ARROWS = [
  ['brit', [[36.65, 9.61], [36.7, 9.8], [36.75, 9.98], [36.8, 10.12]], 9.6, 12.6],
  ['us', [[37.04, 9.67], [37.13, 9.75], [37.24, 9.84]], 14.4, 16.6],
  ['brit', [[36.8, 10.2], [36.74, 10.33], [36.6, 10.5], [36.43, 10.6]], 23.6, 27.2],
  ['fr', [[36.36, 9.88], [36.39, 10.0], [36.4, 10.1]], 24.4, 27.4],
];

function landPath() {
  ctx.beginPath();
  const [x0, y0] = P(COAST[0][0], COAST[0][1]);
  ctx.moveTo(-20, y0); ctx.lineTo(x0, y0);
  for (const [la, lo] of COAST) { const [x, y] = P(la, lo); ctx.lineTo(x, y); }
  const [xe] = P(35.85, 10.6);
  ctx.lineTo(xe, H + 20); ctx.lineTo(-20, H + 20); ctx.closePath();
}
function map(t, { dimLand = 0 } = {}) {
  // land
  landPath(); ctx.fillStyle = C.land; ctx.fill();
  ctx.save(); landPath(); ctx.clip();
  // relief: a few schematic ridges (the Dorsale and the hills round Zaghouan)
  ctx.strokeStyle = C.ridge; ctx.lineWidth = 10; ctx.lineCap = 'round';
  for (const r of [[[36.2, 9.55], [36.33, 9.85], [36.42, 10.12]], [[36.6, 9.5], [36.72, 9.75]], [[36.95, 9.4], [37.05, 9.55]]]) {
    ctx.beginPath(); r.forEach(([la, lo], i) => { const [x, y] = P(la, lo); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.restore();
  // lakes
  ctx.fillStyle = C.sea2;
  for (const [la, lo, rl, rt] of LAKES) { const [x, y] = P(la, lo); ctx.beginPath(); ctx.ellipse(x, y, rl * KM_LON * PXKM, rt * KM_LAT * PXKM, 0, 0, TAU); ctx.fill(); }
  // coastline
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2;
  ctx.beginPath(); COAST.forEach(([la, lo], i) => { const [x, y] = P(la, lo); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
  if (dimLand) { landPath(); ctx.fillStyle = `rgba(15,34,48,${dimLand})`; ctx.fill(); }
  void t;
}
function poly(pts) { ctx.beginPath(); pts.forEach(([la, lo], i) => { const [x, y] = P(la, lo); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); }
function lerpPoly(a, b, x) { return a.map((p, i) => [lerp(p[0], b[i][0], x), lerp(p[1], b[i][1], x)]); }
/** The Axis-held ground, hatched in rust and clipped to the land. */
function pocket(pts, a) {
  A(a, () => {
    ctx.save(); landPath(); ctx.clip();
    poly(pts); ctx.fillStyle = C.axisFill; ctx.fill();
    ctx.clip();
    ctx.strokeStyle = 'rgba(120,40,24,0.55)'; ctx.lineWidth = 3;
    for (let i = -H; i < W + H; i += 18) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i - H, H); ctx.stroke(); }
    ctx.restore();
    ctx.save(); landPath(); ctx.clip();
    poly(pts); ctx.strokeStyle = C.axis; ctx.lineWidth = 4; ctx.setLineDash([12, 7]); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  });
}
function arrow(key, path, g) {
  if (g <= 0) return;
  const pts = path.map(([la, lo]) => P(la, lo));
  let len = 0; const L = [0];
  for (let i = 1; i < pts.length; i++) { len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(len); }
  const upto = len * g;
  ctx.strokeStyle = C[key]; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  let tip = pts[0], dir = [1, 0];
  for (let i = 1; i < pts.length; i++) {
    if (L[i] <= upto) { ctx.lineTo(pts[i][0], pts[i][1]); tip = pts[i]; dir = [pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]; continue; }
    const f = (upto - L[i - 1]) / (L[i] - L[i - 1]);
    tip = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    dir = [pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]];
    ctx.lineTo(tip[0], tip[1]); break;
  }
  ctx.stroke(); ctx.lineCap = 'butt';
  const a = Math.atan2(dir[1], dir[0]);
  ctx.fillStyle = C[key];
  ctx.beginPath(); ctx.moveTo(tip[0] + Math.cos(a) * 24, tip[1] + Math.sin(a) * 24);
  ctx.lineTo(tip[0] + Math.cos(a + 2.3) * 22, tip[1] + Math.sin(a + 2.3) * 22);
  ctx.lineTo(tip[0] + Math.cos(a - 2.3) * 22, tip[1] + Math.sin(a - 2.3) * 22); ctx.closePath(); ctx.fill();
}
function place(name, a, { dx = 12, dy = -12, align = 'left', size = 24, color = C.dark, dot = true } = {}) {
  A(a, () => {
    const [x, y] = P(...PLACES[name]);
    if (dot) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill(); }
    font(600, size); halo(name, x + dx, y + dy, { align, color });
  });
}
/** Dark map lettering with a sand-coloured halo, so it reads over land, sea and hatching alike. */
function halo(s, x, y, { align = 'left', color = C.dark } = {}) {
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(214,196,152,0.92)'; ctx.lineWidth = 7; ctx.strokeText(s, x, y);
  ctx.fillStyle = color; ctx.fillText(s, x, y);
}
function dateTag(s, a) {
  A(a, () => {
    ctx.fillStyle = 'rgba(15,34,48,0.85)'; k.rrect(28, 26, 300, 70, 10); ctx.fill();
    font(600, 44, NUM); text(s, 48, 62, { base: 'middle', color: C.brit, spacing: '1px' });
  });
}
function legend(a) {
  A(a, () => {
    const x = 410, y = 132;
    ctx.fillStyle = 'rgba(15,34,48,0.82)'; k.rrect(x, y, 430, 150, 12); ctx.fill();
    ctx.fillStyle = C.axisFill; ctx.fillRect(x + 18, y + 18, 34, 24); ctx.strokeStyle = C.axis; ctx.lineWidth = 3; ctx.strokeRect(x + 18, y + 18, 34, 24);
    font(500, 22); text('held by German and Italian troops', x + 64, y + 31, { base: 'middle', color: C.ink });
    [['brit', 'British'], ['us', 'American'], ['fr', 'French']].forEach(([key, name], i) => {
      ctx.fillStyle = C[key]; ctx.fillRect(x + 18 + i * 112, y + 74, 34, 12);
      text(name, x + 18 + i * 112, y + 108, { base: 'middle', color: C.ink });
    });
    font(400, 18); text('schematic map', x + 18, y + 136, { base: 'middle', color: C.soft });
  });
}

// ---------- A, B, C: the map ----------
function sceneMap(t) {
  A(span(t, 0, 41.8, 0.6, 0.5), () => {
    const dim = seg(t, 28.2, 29.2) * 0.25;
    map(t, { dimLand: dim });
    // the pocket: 5 May shape, then 8 May (after Tunis and Bizerte), then 11 May (the hills by Zaghouan)
    const g1 = eio(seg(t, 14.4, 18.0)), g2 = eio(seg(t, 24.4, 27.6));
    const shape = g2 > 0 ? lerpPoly(POCKET.may8, POCKET.may11, g2) : lerpPoly(POCKET.may5, POCKET.may8, g1);
    pocket(shape, seg(t, 1.0, 2.2) * (1 - seg(t, 37.6, 39.6)));
    // the northern remnant, gone by 9 May
    pocket(NORTH, seg(t, 14.4, 15.4) * (1 - seg(t, 18.6, 20.4)));
    // Allied armies close in
    A(seg(t, 4.8, 5.8), () => {
      const marks = [['brit', [36.6, 9.5], 'First Army'], ['us', [37.05, 9.52], 'US II Corps'], ['fr', [36.3, 9.78], 'French XIX Corps'], ['brit', [36.05, 10.22], 'Eighth Army']];
      for (const [key, [la, lo], name] of marks) {
        const [x, y] = P(la, lo);
        ctx.fillStyle = C[key]; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
        ctx.strokeStyle = C.dark; ctx.lineWidth = 2; ctx.stroke();
        font(700, 22); halo(name, x, y + 30, { align: 'center' });
      }
    });
    for (const [key, path, a, b] of ARROWS) arrow(key, path, eio(seg(t, a, b)) * (1 - seg(t, 40.0, 41.0)));
    // places
    place('Tunis', seg(t, 0.8, 1.6), { dx: -14, dy: -18, align: 'right', size: 28 });
    place('Bizerte', seg(t, 0.8, 1.6), { dx: -14, dy: 26, align: 'right', size: 28 });
    place('Medjez el Bab', seg(t, 9.0, 9.6) * (1 - seg(t, 13.6, 14.2)), { dx: 0, dy: 28, align: 'center' });
    place('Porto Farina', seg(t, 18.8, 19.4) * (1 - seg(t, 22.6, 23.2)), { dx: 0, dy: 26, align: 'center' });
    place('Hammam-Lif', seg(t, 23.4, 24.0) * (1 - seg(t, 28.0, 28.6)), { dx: 14, dy: -6 });
    place('Hammamet', seg(t, 26.0, 26.6), { dx: 14, dy: 10 });
    place('Zaghouan', seg(t, 25.0, 25.6), { dx: -14, dy: -16, align: 'right' });
    place('Enfidaville', seg(t, 25.0, 25.6), { dx: 14, dy: 18 });
    A(seg(t, 22.0, 22.8) * (1 - seg(t, 28.0, 28.6)), () => {
      const [x, y] = P(36.98, 10.98);
      font(700, 30, NUM); halo('CAP BON', x - 6, y - 4, { align: 'center' });
    });
    legend(seg(t, 2.0, 3.0) * (1 - seg(t, 13.4, 14.0)));
    // dates
    dateTag('5 MAY 1943', seg(t, 0.4, 1.2) * (1 - seg(t, 9.2, 9.6)));
    dateTag('6 MAY 1943', seg(t, 9.4, 9.8) * (1 - seg(t, 14.0, 14.4)));
    dateTag('7 MAY 1943', seg(t, 14.2, 14.6) * (1 - seg(t, 18.6, 19.0)));
    dateTag('9 MAY 1943', seg(t, 18.8, 19.2) * (1 - seg(t, 23.2, 23.6)));
    dateTag('11 MAY 1943', seg(t, 23.4, 23.8) * (1 - seg(t, 32.6, 33.0)));
    dateTag('13 MAY 1943', seg(t, 37.0, 37.4) * (1 - seg(t, 41.2, 41.6)));
    // Tunis and Bizerte taken: a ring
    for (const [name, t0, key] of [['Tunis', 16.0, 'brit'], ['Bizerte', 16.6, 'us']]) {
      A(seg(t, t0, t0 + 0.5) * (1 - seg(t, 40.0, 41.0)), () => {
        const [x, y] = P(...PLACES[name]);
        ctx.strokeStyle = C[key]; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, 16 + 4 * (1 - eout(seg(t, t0, t0 + 0.6))), 0, TAU); ctx.stroke();
      });
    }
    // C: the sea behind them
    sea(t);
    // surrenders
    A(seg(t, 33.0, 33.6) * (1 - seg(t, 36.8, 37.2)), () => card('GENERAL HANS-JÜRGEN VON ARNIM', 'German commander of Army Group Africa', 'surrenders with his staff'));
    A(seg(t, 37.4, 38.0), () => card('MARSHAL GIOVANNI MESSE', 'Italian commander of the First Army', 'surrenders: the last Axis army in Africa'));
  });
}
function card(name, role, what) {
  ctx.fillStyle = 'rgba(15,34,48,0.9)'; k.rrect(70, 520, W - 140, 210, 14); ctx.fill();
  ctx.strokeStyle = C.brit; ctx.lineWidth = 2; ctx.stroke();
  font(600, 36, NUM); text(name, CX, 572, { align: 'center', base: 'middle', color: C.brit, spacing: '1px' });
  font(500, 26); text(role, CX, 626, { align: 'center', base: 'middle', color: C.ink });
  font(400, 26); text(what, CX, 676, { align: 'center', base: 'middle', color: C.soft });
}
function ship(x, y, s) {
  ctx.fillStyle = C.allied;
  ctx.beginPath(); ctx.moveTo(x - 26 * s, y); ctx.lineTo(x + 30 * s, y); ctx.lineTo(x + 20 * s, y + 9 * s); ctx.lineTo(x - 20 * s, y + 9 * s); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - 6 * s, y - 10 * s, 12 * s, 10 * s); ctx.fillRect(x - 1.5 * s, y - 20 * s, 3 * s, 10 * s);
}
function plane(x, y, s, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = C.allied;
  ctx.beginPath(); ctx.moveTo(14 * s, 0); ctx.lineTo(-10 * s, -14 * s); ctx.lineTo(-4 * s, 0); ctx.lineTo(-10 * s, 14 * s); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function sea(t) {
  const a = seg(t, 28.4, 29.2) * (1 - seg(t, 40.4, 41.4));
  if (a <= 0) return;
  A(a, () => {
    // patrol lines off Cap Bon and the Gulf of Tunis
    ctx.strokeStyle = 'rgba(233,243,246,0.55)'; ctx.lineWidth = 3; ctx.setLineDash([10, 10]); ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); const p0 = P(37.4, 10.5), p1 = P(37.25, 11.3), p2 = P(36.75, 11.35); ctx.moveTo(...p0); ctx.quadraticCurveTo(p1[0] + 40, p1[1], p2[0], p2[1]); ctx.stroke();
    ctx.setLineDash([]); ctx.lineDashOffset = 0;
    const ships = [[37.38, 10.55], [37.36, 10.85], [37.28, 11.2], [37.05, 11.38]];
    ships.forEach(([la, lo], i) => { const [x, y] = P(la, lo); ship(x + Math.sin(t * 0.6 + i) * 6, y, 0.9); });
    for (let i = 0; i < 3; i++) { const u = ((t - 28.4) * 0.07 + i / 3) % 1; plane(lerp(470, 840, u), 150 + i * 46 + Math.sin(u * 6) * 10, 1, 0); }
    // to Sicily
    A(seg(t, 29.0, 29.6), () => {
      font(600, 26); text('Sicily', 820, 340, { align: 'right', base: 'middle', color: C.ink });
      font(400, 22); text('about 145 km', 820, 372, { align: 'right', base: 'middle', color: C.soft });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(828, 330); ctx.lineTo(852, 306); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(852, 306); ctx.lineTo(838, 308); ctx.moveTo(852, 306); ctx.lineTo(850, 320); ctx.stroke();
    });
    // a few hundred escape
    A(seg(t, 30.8, 31.4) * (1 - seg(t, 32.8, 33.2)), () => {
      ctx.fillStyle = 'rgba(15,34,48,0.88)'; k.rrect(420, 410, 410, 150, 12); ctx.fill();
      font(600, 60, NUM); text('about 653', 625, 466, { align: 'center', base: 'middle', color: C.sea });
      font(500, 24); text('escaped by sea, most in small boats', 625, 522, { align: 'center', base: 'middle', color: C.ink });
    });
  });
}

// ---------- D: whose count ----------
function sceneCounts(t) {
  A(span(t, 41.6, 55.6, 0.5, 0.4), () => {
    font(600, 40, NUM); text('HOW MANY PRISONERS?', CX, 96, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
    font(400, 24); text('Axis soldiers captured in Tunisia, by whose count', CX, 140, { align: 'center', base: 'middle', color: C.soft });
    const L = 60, R = 804, top = 196, rowH = 100, max = 300000;
    const X = (v) => L + (R - L) * (v / max);
    // scale
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
    for (let v = 0; v <= max; v += 100000) {
      ctx.beginPath(); ctx.moveTo(X(v), top - 12); ctx.lineTo(X(v), top + rowH * COUNTS.length - 20); ctx.stroke();
      font(400, 20); text(fmt(v), X(v), top + rowH * COUNTS.length + 8, { align: v === 0 ? 'left' : v === max ? 'right' : 'center', base: 'middle', color: C.soft });
    }
    COUNTS.forEach(([label, whose, v], i) => {
      const t0 = [42.4, 46.6, 47.4, 48.2, 49.2][i];
      const g = eout(seg(t, t0, t0 + 1.0));
      const y = top + i * rowH;
      A(seg(t, t0 - 0.2, t0 + 0.3), () => {
        const col = i === 4 ? C.axis : i === 0 ? C.brit : i === 3 ? C.us : C.allied;
        ctx.fillStyle = col; ctx.globalAlpha *= i === 4 ? 0.85 : 1;
        ctx.fillRect(L, y + 34, (X(v) - L) * g, 30);
        ctx.globalAlpha = 1;
        font(600, 24); text(label, L, y + 16, { base: 'middle', color: C.ink });
        font(400, 20); text(whose, L, y + 82, { base: 'middle', color: C.soft });
        A(seg(t, t0 + 0.8, t0 + 1.2), () => { font(600, 30, NUM); text(fmt(v), Math.min(X(v), R) - 8, y + 16, { align: 'right', base: 'middle', color: col }); });
      });
    });
    // Playfair's split
    A(seg(t, 43.6, 44.2) * (1 - seg(t, 46.0, 46.4)), () => {
      ctx.fillStyle = 'rgba(15,34,48,0.92)'; k.rrect(120, 430, 624, 130, 12); ctx.fill();
      ctx.strokeStyle = C.brit; ctx.lineWidth = 2; ctx.stroke();
      font(500, 26); text('British official history:', CX, 466, { align: 'center', base: 'middle', color: C.brit });
      text('101,784 German, 89,442 Italian, the rest not split', CX, 516, { align: 'center', base: 'middle', color: C.ink });
    });
  });
}

// ---------- E: why so many ----------
function sceneWhy(t) {
  A(span(t, 55.4, 65.0, 0.5, 0), () => {
    map(t, { dimLand: 0.45 });
    pocket(POCKET.may8, 0.7);
    A(seg(t, 55.8, 56.4), () => {
      ctx.fillStyle = 'rgba(15,34,48,0.88)'; k.rrect(60, 150, W - 120, 300, 16); ctx.fill();
      const rows = [['the sea behind them', C.sea], ['no fuel, few supplies', C.brit], ['no ships or aircraft to take them off', C.ink]];
      rows.forEach(([s, col], i) => A(seg(t, 56.2 + i * 0.9, 56.8 + i * 0.9), () => { font(500, 32); text(s, CX, 220 + i * 84, { align: 'center', base: 'middle', color: col }); }));
    });
    A(seg(t, 60.4, 61.0), () => {
      ctx.fillStyle = 'rgba(15,34,48,0.9)'; k.rrect(60, 500, W - 120, 220, 16); ctx.fill();
      font(600, 64, NUM); text('“TUNISGRAD”', CX, 580, { align: 'center', base: 'middle', color: C.axis, spacing: '3px' });
      font(400, 26); text('compared in Germany with Stalingrad, February 1943', CX, 662, { align: 'center', base: 'middle', color: C.ink });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.sea2); lg.addColorStop(1, C.sea1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // faint swell lines
  g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 2;
  for (let y = 40; y < H; y += 26) { g.beginPath(); for (let x = 0; x <= W; x += 24) g.lineTo(x, y + Math.sin(x / 60 + y) * 3); g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'May 1943: German and Italian armies still hold north-east Tunisia, around *Tunis* and *Bizerte*.'],
  [5.0, 9.4, 'British, American and French armies close in on them from the west and the south.'],
  [9.6, 14.0, 'On *6 May* the British First Army breaks through the line west of Tunis.'],
  [14.2, 18.6, 'On *7 May* British tanks enter *Tunis*, and American infantry enters *Bizerte*.'],
  [18.8, 23.2, 'The Axis armies are cut in two. In the north, tens of thousands surrender by 9 May.'],
  [23.4, 27.8, 'British tanks force the pass at Hammam-Lif and seal off the *Cap Bon* peninsula.'],
  [28.0, 32.4, 'Behind them lies the sea, watched by Allied ships and aircraft. Only a few hundred escape.'],
  [32.6, 37.0, 'The German commander, General Hans-Jürgen von Arnim, surrenders with his staff.'],
  [37.2, 41.6, 'On *13 May* the Italian Marshal Giovanni Messe surrenders. The war in Africa is over.'],
  [41.8, 46.2, 'How many prisoners? The British official history counted *238,243* unwounded men.'],
  [46.4, 50.8, 'The US Army’s official historian wrote about *275,000*; General von Arnim guessed 300,000.'],
  [51.0, 55.4, 'They counted at different times and in different ways: ~about a quarter of a million~.'],
  [55.6, 60.0, 'Why so many? Whole armies were trapped with the sea behind them, short of fuel and supplies.'],
  [60.2, 64.6, 'In Germany the defeat was compared with Stalingrad, three months earlier: ~Tunisgrad~.'],
];

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [NUM, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneMap(t);
    sceneCounts(t);
    sceneWhy(t);
    // a band behind the captions
    ctx.fillStyle = 'rgba(15,34,48,0.78)'; ctx.fillRect(0, 790, W, 112);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 36, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.brit, '~': C.sea } });
  },
});
