// Explainer for philosophy-deportations-and-kulak-lists (Hungary 1956, Why): Mátyás Rákosi's regime and its "class
// enemies", 1949–1953: the kulák lists and the impossible delivery quotas in the villages, the night deportations
// from the southern border zone to closed family camps on the Hortobágy plain (from 23 June 1950), and the
// expulsion of 12,704 people from Budapest to villages in the east (May–July 1951). Look: night soil-brown, wheat
// gold and a cold police blue; a schematic map of Hungary with arrows; a typed list, a field of holds, a room drawn
// to scale. No faces, no violence on screen. IBM Plex Mono for typed and counted things, Alegreya for the captions.
//
// Facts:
// - Dániel Luka, "Land Policy in Hungary 1944–1967" (University of Pécs): farms over 14.4 ha (25 cadastral holds)
//   were counted as "kulák" estates; 1949 census: almost 1,400,000 farms, "Almost 61 922 landowners were considered
//   as 'kulaks'"; kulaks forced by violence and administrative measures to "waive" their land.
// - 1956 Institute (rev.hu), glossary "Kulaks": collectivization and the struggle against kulaks began in Hungary in
//   1948; the term widened to "actual or assumed rural opponents of collectivization".
// - Bálint Magyar, Kampányok a falusi térben az ötvenes évek elején (1986), from Pál Závada's table: in 1951 "kulaks"
//   were to deliver goods worth about 700–1,100 kg of wheat per hold, while that year, the best of the period, the
//   average wheat harvest was only 9.7 quintals (970 kg) per hold; convictions for "crimes against public supply"
//   (KSH Statistical Yearbook 1949–1955): 1948 23,499; 1949 22,502; 1950 26,972; 1951 47,296; 1952 39,560;
//   1953 20,000; 1954 3,974; 1955 5,968, "almost two hundred thousand" from 1948 to 1955.
// - József Saád, "Hortobágyi deportáltak és 1956" (Telepesek Társadalmi Múzeum Alapítvány, now at the Hungarian
//   National Archives, telepesek.mnl.gov.hu): on 23 June 1950, between 2 and 3 a.m., ÁVH men and police woke
//   several hundred families in villages of the southern and western border zone; that night 2,446 people were
//   moved, families and all, to forced residences; the first seven closed family forced-labour camps were set up on
//   the Hortobágy and Nagykunság plains; 45 more waves followed until April 1953, from towns and villages, more than
//   fifty places in all; five more camps by the end of 1952 (twelve); after the amnesty of 26 July 1953, under
//   Prime Minister Imre Nagy, 7,281 people (2,524 families) were released from the 12 camps by 31 October 1953, the
//   real number taken being higher; those from the border zone could not go home, and most of those who could did
//   not get their houses back. István Hódi, born 1923 in Kübekháza, son of the farmer Ferenc Hódi, was deported with
//   his parents on 23 June 1950 to the "Farm No. 9" camp near Tiszaszentimre.
// - Róbert Kis-Kapin, "»Csendlegyen úr« kálváriája", Betekintő 2011/1: from 21 May to 18 July 1951, 5,182 families,
//   12,704 people, were removed from Budapest and placed in 138 villages in the eastern half of the country, in the
//   area bounded by Tápiószentmárton, Tiszabecs, Gadna and Kardoskút; the targets: former aristocrats, landowners,
//   capitalists, rich peasants, high clergy, senior officials, officers and their families; they were often lodged
//   in a local kulák's house. The hunter and writer Zsigmond Széchenyi had to leave his flat on 21 June 1951 with
//   500 kg of belongings; the order gave him 24 hours to hand it over and one room of 4 × 4 metres on a farmstead,
//   No. 88, at Polgár.
// The map is schematic: towns from their coordinates, the border simplified, the camps placed schematically.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  Hungary 1949–1953: "class enemies"; the kulák list and the 25-hold line.
//  B  9.6–27.8  1949: 61,922 kulaks; the 1951 quota against the harvest; the convictions, year by year.
//  C 28.0–46.2  23 June 1950: the border zone to the Hortobágy; the camps; István Hódi.
//  D 46.4–60.0  Budapest 1951: 12,704 people to 138 villages; Zsigmond Széchenyi's room.
//  E 60.2–64.6  The 1953 amnesty; homes not given back.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#211a15', bg2: '#100c0a', ink: '#f3eadb', soft: 'rgba(243,234,219,0.74)', faint: 'rgba(243,234,219,0.26)', line: 'rgba(243,234,219,0.07)',
  wheat: '#dcb85c', field: '#7f9a5a', night: '#6f97d6', red: '#d0604c', paper: '#efe3c8', paperInk: '#2b221b', land: 'rgba(243,234,219,0.07)', panel: 'rgba(16,12,10,0.84)',
};
const MONO = 'IBM Plex Mono', TXT = 'Alegreya';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- numbers ----------
const KULAKS_1949 = 61922;
const QUOTA = [700, 1100], HARVEST_1951 = 970; // kg of wheat (or its worth) per cadastral hold
const CONVICTIONS = [[1948, 23499], [1949, 22502], [1950, 26972], [1951, 47296], [1952, 39560], [1953, 20000], [1954, 3974], [1955, 5968]];
const CONVICTED = CONVICTIONS.reduce((s, [, n]) => s + n, 0);
if (CONVICTED < 185000 || CONVICTED > 200000) throw new Error(`convictions ${CONVICTED}`); // "almost 200,000"
const HORTOBAGY_NIGHT = 2446, BUDAPEST_PEOPLE = 12704, BUDAPEST_FAMILIES = 5182, VILLAGES = 138;

// ---------- the map (schematic; x from longitude, y from latitude) ----------
const P = (lon, lat) => [46 + (lon - 16.0) * 112, 132 + (48.6 - lat) * 165];
const OUTLINE = [[16.11, 46.87], [16.28, 47.0], [16.45, 47.15], [16.48, 47.4], [16.43, 47.56], [16.64, 47.75], [16.9, 47.7], [17.05, 47.82], [17.16, 48.01],
  [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.87, 47.82], [19.05, 48.05], [19.48, 48.1], [19.75, 48.2], [20.05, 48.17], [20.3, 48.27], [20.55, 48.53],
  [21.12, 48.5], [21.45, 48.57], [21.72, 48.35], [22.15, 48.41], [22.4, 48.25], [22.9, 47.95], [22.7, 47.82], [22.3, 47.7], [22.02, 47.53], [21.95, 47.12],
  [21.65, 46.95], [21.4, 46.62], [21.05, 46.28], [20.7, 46.18], [20.26, 46.12], [19.85, 46.17], [19.4, 46.05], [18.95, 45.95], [18.8, 45.88], [18.45, 45.77],
  [18.15, 45.78], [17.7, 45.9], [17.4, 45.95], [17.15, 46.15], [16.88, 46.36], [16.6, 46.47], [16.38, 46.63]];
const PL = {
  budapest: P(19.04, 47.5), kubek: P(20.28, 46.15), szentimre: P(20.73, 47.49), hortobagy: P(21.15, 47.58), polgar: P(21.12, 47.87),
  szeged: P(20.15, 46.25), debrecen: P(21.63, 47.53),
};
// the area of the 138 villages (Kis-Kapin): Tápiószentmárton, Gadna, Tiszabecs, Kardoskút
const EXILE = [P(19.75, 47.34), P(20.93, 48.4), P(22.83, 48.1), P(20.63, 46.5)];
// twelve camps, placed schematically on the Hortobágy and Nagykunság plains
const CAMPS = [[21.0, 47.62], [21.18, 47.66], [21.3, 47.55], [21.08, 47.5], [20.9, 47.45], [20.73, 47.49], [21.22, 47.45], [20.98, 47.7], [21.36, 47.66], [20.82, 47.58], [21.12, 47.38], [20.68, 47.6]].map(([lo, la]) => P(lo, la));

function hungary(a, { fill = C.land } = {}) {
  A(a, () => {
    ctx.beginPath(); OUTLINE.forEach(([lo, la], i) => (i ? ctx.lineTo(...P(lo, la)) : ctx.moveTo(...P(lo, la)))); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = C.soft; ctx.lineWidth = 2.5; ctx.stroke();
    font(500, 22, MONO); text('Schematic map', 60, 200, { color: C.faint });
  });
}
function place(xy, name, { a = 1, col = C.ink, dx = 12, dy = 0, align = 'left', size = 24 } = {}) {
  A(a, () => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xy[0], xy[1], 6, 0, TAU); ctx.fill();
    font(600, size); text(name, xy[0] + dx, xy[1] + dy, { align, color: col });
  });
}
function arrow(from, to, g, col, { w = 6, bend = 0 } = {}) {
  if (g <= 0) return;
  const mx = (from[0] + to[0]) / 2 - (to[1] - from[1]) * bend, my = (from[1] + to[1]) / 2 + (to[0] - from[0]) * bend;
  const pt = (u) => [(1 - u) * (1 - u) * from[0] + 2 * (1 - u) * u * mx + u * u * to[0], (1 - u) * (1 - u) * from[1] + 2 * (1 - u) * u * my + u * u * to[1]];
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash([12, 9]);
  ctx.beginPath(); ctx.moveTo(...from);
  for (let i = 1; i <= 30; i++) ctx.lineTo(...pt((g * i) / 30));
  ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  const [ex, ey] = pt(g), [px, py] = pt(Math.max(0, g - 0.04)), d = Math.hypot(ex - px, ey - py) || 1, ux = (ex - px) / d, uy = (ey - py) / d, s = w * 2.4;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(ex + ux * s, ey + uy * s); ctx.lineTo(ex - uy * s * 0.7, ey + ux * s * 0.7); ctx.lineTo(ex + uy * s * 0.7, ey - ux * s * 0.7); ctx.closePath(); ctx.fill();
}

// ---------- A–B: the kulák list, the quota, the convictions ----------
function sceneVillage(t) {
  // the typed list (cues 1–2)
  A(span(t, 0.6, 9.8, 0.5, 0.4), () => {
    const x = 470, y = 210, w = 330, h = 330;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(0.03); ctx.translate(-(x + w / 2), -(y + h / 2));
    ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h);
    font(700, 24, MONO); text('KULÁK LIST', x + 24, y + 38, { color: C.paperInk });
    ctx.fillStyle = 'rgba(43,34,27,0.5)';
    for (let r = 0; r < 8; r++) { ctx.fillRect(x + 24, y + 80 + r * 30, 150 + ((r * 47) % 90), 8); ctx.fillRect(x + w - 74, y + 80 + r * 30, 50, 8); }
    A(seg(t, 3.0, 3.6), () => {
      ctx.save(); ctx.translate(x + w - 100, y + h - 60); ctx.rotate(-0.25);
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.strokeRect(-80, -24, 160, 48);
      font(700, 26, MONO); text('KULÁK', 0, 2, { align: 'center', color: C.red });
      ctx.restore();
    });
    ctx.restore();
  });
  // a field of holds: 25 holds, about 14.4 hectares (cue 2)
  A(span(t, 5.0, 14.0, 0.5, 0.4), () => {
    const x0 = 70, y0 = 230, s = 34;
    for (let i = 0; i < 30; i++) {
      const c = i % 6, r = Math.floor(i / 6), on = seg(t, 5.4 + i * 0.07, 5.8 + i * 0.07);
      ctx.fillStyle = i < 25 ? `rgba(127,154,90,${0.25 + 0.6 * on})` : `rgba(208,96,76,${0.25 + 0.6 * on})`;
      ctx.fillRect(x0 + c * (s + 6), y0 + r * (s + 6), s, s);
    }
    A(seg(t, 7.6, 8.2), () => {
      font(700, 26, MONO); text('25 holds', x0, y0 + 5 * (s + 6) + 30, { color: C.field });
      font(500, 23); text('about 14.4 hectares', x0, y0 + 5 * (s + 6) + 62, { color: C.soft });
      text('more: “kulák”', x0, y0 + 5 * (s + 6) + 92, { color: C.red });
    });
  });
  // 1949: 61,922 (cue 3)
  A(span(t, 9.8, 14.0, 0.4, 0.4), () => {
    const n = Math.round(KULAKS_1949 * eout(seg(t, 10.0, 11.6)));
    font(700, 56, MONO); text(fmt(n), 640, 300, { align: 'center', color: C.red });
    font(600, 24); text('landowners counted as kulaks', 640, 350, { align: 'center', color: C.ink });
    text('1949 census', 640, 382, { align: 'center', color: C.soft });
    A(seg(t, 11.8, 12.4), () => { font(500, 23); text('later: any peasant who resisted', 640, 450, { align: 'center', color: C.wheat }); });
  });
  // the quota against the harvest (cues 4–5)
  A(span(t, 14.2, 23.4, 0.4, 0.4), () => {
    font(700, 26, MONO); text('1951 · KG PER HOLD', 92, 196, { color: C.wheat, spacing: '1px' });
    const yBase = 640, kgPx = 0.34, x1 = 200, x2 = 520, bw = 150;
    // the harvest column
    const hv = HARVEST_1951 * eio(seg(t, 14.6, 16.0));
    ctx.fillStyle = C.wheat; ctx.fillRect(x1, yBase - hv * kgPx, bw, hv * kgPx);
    font(700, 30, MONO); text(fmt(Math.round(hv)), x1 + bw / 2, yBase - hv * kgPx - 28, { align: 'center', color: C.wheat });
    font(600, 23); text('average wheat harvest', x1 + bw / 2, yBase + 30, { align: 'center', color: C.soft });
    // the quota range
    A(seg(t, 15.6, 16.4), () => {
      const lo = QUOTA[0] * eio(seg(t, 15.6, 17.0)), hi = QUOTA[1] * eio(seg(t, 15.6, 17.0));
      ctx.fillStyle = 'rgba(208,96,76,0.85)'; ctx.fillRect(x2, yBase - lo * kgPx, bw, lo * kgPx);
      ctx.fillStyle = 'rgba(208,96,76,0.4)'; ctx.fillRect(x2, yBase - hi * kgPx, bw, (hi - lo) * kgPx);
      font(700, 30, MONO); text(`${fmt(QUOTA[0])}–${fmt(QUOTA[1])}`, x2 + bw / 2, yBase - hi * kgPx - 28, { align: 'center', color: C.red });
      font(600, 23); text('demanded from a kulák', x2 + bw / 2, yBase + 30, { align: 'center', color: C.soft });
    });
    // the line of the whole harvest across both
    A(seg(t, 19.2, 19.8), () => {
      const y = yBase - HARVEST_1951 * kgPx;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(x1 - 20, y); ctx.lineTo(x2 + bw + 20, y); ctx.stroke(); ctx.setLineDash([]);
      font(600, 23); text('the whole crop', x1 - 26, y, { align: 'right', color: C.ink });
    });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(150, yBase); ctx.lineTo(720, yBase); ctx.stroke();
  });
  // convictions, year by year (cue 6)
  A(span(t, 23.4, 28.0, 0.4, 0.4), () => {
    font(700, 26, MONO); text('CONVICTED: “CRIMES AGAINST', 92, 196, { color: C.wheat, spacing: '1px' });
    text('PUBLIC SUPPLY”', 92, 230, { color: C.wheat, spacing: '1px' });
    const yBase = 620, x0 = 110, step = 80, max = 50000, hPx = 300;
    CONVICTIONS.forEach(([yr, n], i) => {
      const g = eio(seg(t, 23.8 + i * 0.15, 24.8 + i * 0.15)), hh = (hPx * n) / max * g;
      ctx.fillStyle = yr === 1951 ? C.red : 'rgba(220,184,92,0.75)';
      ctx.fillRect(x0 + i * step, yBase - hh, 56, hh);
      font(500, 22, MONO); text(String(yr), x0 + i * step + 28, yBase + 24, { align: 'center', color: C.soft });
      if (yr === 1951) A(seg(t, 24.8, 25.4), () => { font(700, 24, MONO); text(fmt(n), x0 + i * step + 28, yBase - hh - 22, { align: 'center', color: C.red }); });
    });
    A(seg(t, 25.4, 26.0), () => {
      font(700, 34, MONO); text(fmt(CONVICTED), 520, 300, { color: C.ink });
      font(600, 23); text('in eight years', 520, 338, { color: C.soft });
    });
  });
}

// ---------- C: the border zone to the Hortobágy ----------
function sceneHortobagy(t) {
  A(span(t, 27.8, 46.4, 0.6, 0.5), () => {
    hungary(1);
    // night
    A(seg(t, 28.0, 28.8) * (1 - seg(t, 36.8, 37.6)), () => {
      ctx.fillStyle = C.night; ctx.beginPath(); ctx.arc(760, 200, 26, 0, TAU); ctx.fill();
      ctx.fillStyle = C.bg1; ctx.beginPath(); ctx.arc(772, 192, 24, 0, TAU); ctx.fill();
      font(700, 26, MONO); text('23 JUNE 1950 · 2 A.M.', 70, 112, { color: C.night, spacing: '1px' });
    });
    // the southern border zone, a band of villages
    A(seg(t, 28.6, 29.4), () => {
      ctx.fillStyle = 'rgba(111,151,214,0.85)';
      const pts = [[17.3, 46.0], [17.8, 45.95], [18.3, 45.85], [18.7, 45.95], [19.2, 46.1], [19.6, 46.15], [20.0, 46.2], [20.28, 46.15], [17.0, 46.3], [16.7, 46.5], [16.45, 46.75]];
      pts.forEach(([lo, la]) => { const [x, y] = P(lo, la + 0.08); ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); });
      font(600, 22); text('border zone villages', ...P(17.5, 45.7), { color: C.night });
    });
    // arrows to the plain (cue 8)
    const g = eio(seg(t, 32.8, 35.0));
    arrow(P(18.5, 46.0), P(20.85, 47.45), g, C.night, { bend: 0.15 });
    arrow(P(20.2, 46.25), P(21.0, 47.4), eio(seg(t, 33.2, 35.2)), C.night, { bend: -0.1 });
    arrow(P(16.7, 46.6), P(20.7, 47.55), eio(seg(t, 33.6, 35.6)), C.night, { bend: 0.12 });
    A(seg(t, 34.6, 35.2), () => {
      font(700, 40, MONO); text(fmt(HORTOBAGY_NIGHT), 92, 660, { color: C.ink });
      font(600, 23); text('people in one night,', 92, 700, { color: C.soft });
      text('families and all', 92, 728, { color: C.soft });
    });
    // the camps (cue 9)
    CAMPS.forEach(([x, y], i) => {
      const on = seg(t, (i < 7 ? 35.2 : 38.4) + (i % 7) * 0.18, (i < 7 ? 35.6 : 38.8) + (i % 7) * 0.18);
      A(on, () => { ctx.strokeStyle = C.wheat; ctx.lineWidth = 2.5; ctx.strokeRect(x - 7, y - 7, 14, 14); ctx.fillStyle = 'rgba(220,184,92,0.4)'; ctx.fillRect(x - 7, y - 7, 14, 14); });
    });
    A(seg(t, 35.6, 36.2), () => { font(700, 24); text('Hortobágy', PL.hortobagy[0] + 40, PL.hortobagy[1] - 40, { color: C.wheat }); });
    A(seg(t, 38.6, 39.2) * (1 - seg(t, 41.4, 41.8)), () => {
      font(700, 30, MONO); text('12 CAMPS BY 1953', 440, 660, { color: C.wheat, spacing: '1px' });
      font(600, 23); text('from more than fifty towns and villages', 440, 700, { color: C.soft });
    });
    // István Hódi (cue 10)
    A(span(t, 41.8, 46.4, 0.4, 0.3), () => {
      place(PL.kubek, 'Kübekháza', { col: C.ink, dy: 26, dx: 0, align: 'center' });
      place(PL.szentimre, 'Tiszaszentimre', { col: C.ink, dx: -14, dy: 6, align: 'right' });
      arrow(PL.kubek, PL.szentimre, eio(seg(t, 42.2, 43.6)), C.ink, { w: 4, bend: -0.12 });
      ctx.fillStyle = C.panel; k.rrect(430, 622, 400, 124, 14); ctx.fill();
      font(700, 26); text('István Hódi', 452, 658, { color: C.wheat });
      font(500, 22); text('born 1923, a farmer’s son', 452, 692, { color: C.ink });
      text('taken with his parents', 452, 722, { color: C.soft });
    });
  });
}

// ---------- D: Budapest, 1951 ----------
function sceneBudapest(t) {
  A(span(t, 46.2, 60.4, 0.5, 0.5), () => {
    hungary(1);
    font(700, 26, MONO); text('BUDAPEST · 21 MAY–18 JULY 1951', 70, 112, { color: C.wheat, spacing: '1px' });
    // the area of the 138 villages
    A(seg(t, 46.8, 47.6), () => {
      ctx.beginPath(); EXILE.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath();
      ctx.fillStyle = 'rgba(208,96,76,0.16)'; ctx.fill(); ctx.strokeStyle = 'rgba(208,96,76,0.7)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < VILLAGES; i++) {
        // the villages spread over the area (schematic): a point in the quadrilateral from two pseudo-random weights
        const u = ((i * 0.618034) % 1) * 0.86 + 0.07, v = ((i * 0.414214 + 0.3) % 1) * 0.86 + 0.07;
        const a = [lerp(EXILE[0][0], EXILE[1][0], u), lerp(EXILE[0][1], EXILE[1][1], u)], b = [lerp(EXILE[3][0], EXILE[2][0], u), lerp(EXILE[3][1], EXILE[2][1], u)];
        const x = lerp(a[0], b[0], v), y = lerp(a[1], b[1], v);
        A(seg(t, 48.0 + (i / VILLAGES) * 2.0, 48.3 + (i / VILLAGES) * 2.0), () => { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, TAU); ctx.fill(); });
      }
    });
    place(PL.budapest, 'Budapest', { col: C.ink, dx: -14, align: 'right' });
    [[20.4, 47.9], [21.4, 47.3], [21.9, 47.9], [20.6, 47.0]].forEach(([lo, la], i) => arrow(PL.budapest, P(lo, la), eio(seg(t, 47.0 + i * 0.25, 48.6 + i * 0.25)), C.red, { w: 4, bend: 0.06 }));
    A(span(t, 46.8, 55.6, 0.4, 0.4), () => {
      font(700, 40, MONO); text(fmt(BUDAPEST_PEOPLE), 92, 652, { color: C.ink });
      const nw = ctx.measureText(fmt(BUDAPEST_PEOPLE)).width;
      font(600, 23); text('people', 92 + nw + 12, 654, { color: C.soft });
      font(700, 26, MONO); text(fmt(BUDAPEST_FAMILIES), 92, 698, { color: C.soft });
      const fw = ctx.measureText(fmt(BUDAPEST_FAMILIES)).width;
      font(600, 23); text('families', 92 + fw + 12, 698, { color: C.faint });
      font(700, 26, MONO); text(fmt(VILLAGES), 92, 732, { color: C.soft });
      const vw = ctx.measureText(fmt(VILLAGES)).width;
      font(600, 23); text('villages in the east', 92 + vw + 12, 732, { color: C.faint });
    });
    A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(430, 616, 400, 134, 14); ctx.fill();
      font(600, 22); text('former officers, officials,', 450, 644, { color: C.ink });
      text('nobles, factory owners,', 450, 670, { color: C.ink });
      text('priests, and their families', 450, 696, { color: C.ink });
      text('lodged in strangers’ houses', 450, 726, { color: C.wheat });
    });
    // Zsigmond Széchenyi's room at Polgár (cue 13)
    A(span(t, 55.6, 60.4, 0.4, 0.4), () => {
      place(PL.polgar, 'Polgár', { col: C.wheat, dy: -24, dx: 0, align: 'center' });
      ctx.fillStyle = C.panel; k.rrect(80, 530, 700, 220, 14); ctx.fill();
      const s = 34, x0 = 110, y0 = 556; // one square metre is s pixels
      for (let i = 0; i <= 4; i++) {
        ctx.strokeStyle = 'rgba(243,234,219,0.22)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0 + i * s, y0); ctx.lineTo(x0 + i * s, y0 + 4 * s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0, y0 + i * s); ctx.lineTo(x0 + 4 * s, y0 + i * s); ctx.stroke();
      }
      ctx.strokeStyle = C.wheat; ctx.lineWidth = 4; ctx.strokeRect(x0, y0, 4 * s, 4 * s);
      font(600, 22, MONO); text('4 m', x0 + 2 * s, y0 + 4 * s + 22, { align: 'center', color: C.wheat });
      font(700, 26); text('Zsigmond Széchenyi', 290, 576, { color: C.wheat });
      font(500, 22); text('hunter and writer, aged 53', 290, 608, { color: C.ink });
      text('24 hours to leave his flat', 290, 642, { color: C.soft });
      text('500 kg of belongings', 290, 672, { color: C.soft });
      text('one room on farm No. 88', 290, 702, { color: C.soft });
    });
  });
}

// ---------- E: 1953 ----------
function sceneAfter(t) {
  A(span(t, 60.2, 65.2, 0.5, 0), () => {
    hungary(0.5);
    CAMPS.forEach(([x, y], i) => {
      const off = seg(t, 60.8 + i * 0.12, 61.2 + i * 0.12);
      ctx.strokeStyle = C.wheat; ctx.lineWidth = 2.5; A(1 - 0.75 * off, () => ctx.strokeRect(x - 7, y - 7, 14, 14));
    });
    ctx.fillStyle = C.panel; k.rrect(110, 200, 640, 210, 16); ctx.fill();
    font(700, 30, MONO); text('26 JULY 1953', CX, 248, { align: 'center', color: C.wheat, spacing: '1px' });
    font(600, 24); text('amnesty under Prime Minister Imre Nagy:', CX, 296, { align: 'center', color: C.ink });
    text('the camps close, exile ends', CX, 328, { align: 'center', color: C.ink });
    A(seg(t, 62.2, 62.8), () => { text('most families do not get their homes back', CX, 370, { align: 'center', color: C.red }); });
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
  for (let i = -H; i < W; i += 26) { g.beginPath(); g.moveTo(i, 780); g.lineTo(i + 260, 0); g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'Hungary, 1949–1953: Mátyás Rákosi’s regime makes war on its own *“class enemies”*.'],
  [5.0, 9.4, 'In the villages, owning more than 25 holds, about 14 hectares, puts a farmer on the ~kulák~ list.'],
  [9.6, 14.0, 'In 1949, 61,922 landowners counted as kulaks. Later any peasant who resisted could be one.'],
  [14.2, 18.6, 'Kulák families must deliver ever more. In 1951: goods worth 700 to 1,100 kg of wheat a hold.'],
  [18.8, 23.2, 'That year the average wheat harvest was *970 kg* a hold: the demand could exceed the whole crop.'],
  [23.4, 27.8, 'From 1948 to 1955, almost 200,000 people are convicted of ~“crimes against public supply”~.'],
  [28.0, 32.4, '23 June 1950, 2 a.m.: police wake hundreds of families in villages near the southern border.'],
  [32.6, 37.0, 'That night *2,446 people* are taken, families and all, to closed camps on the Hortobágy plain.'],
  [37.2, 41.6, 'By 1953 there are twelve camps, holding families from more than fifty towns and villages.'],
  [41.8, 46.2, 'Among them: *István Hódi*, born 1923, of Kübekháza, taken with his parents to a camp at Tiszaszentimre.'],
  [46.4, 50.8, 'Budapest, 21 May to 18 July 1951: 12,704 people, 5,182 families, are expelled from the capital.'],
  [51.0, 55.4, 'Former officers, officials and nobles are sent to 138 villages in the east, into strangers’ houses.'],
  [55.6, 60.0, 'The hunter and writer *Zsigmond Széchenyi* gets 24 hours, 500 kg of luggage and one room, 4 by 4 metres.'],
  [60.2, 64.6, 'After Imre Nagy’s amnesty of July 1953 the camps close. Most families never get their homes back.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [MONO, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    A(span(t, 0, 28.0, 0.4, 0.5), () => {
      font(700, 28, MONO); text('“CLASS ENEMIES”', 70, 112, { color: C.ink, spacing: '2px' });
      font(600, 24); text('Hungary, 1949–1953', 70, 148, { color: C.wheat });
    });
    sceneVillage(t);
    sceneHortobagy(t);
    sceneBudapest(t);
    sceneAfter(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.wheat, '~': C.red } });
  },
});
