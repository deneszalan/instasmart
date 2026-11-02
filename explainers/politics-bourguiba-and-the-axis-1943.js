// Explainer for politics-bourguiba-and-the-axis-1943 (Tunisia 1943): Habib Bourguiba, leader of the Neo-Destour, was
// a prisoner of the French from 1938; in August 1942, from a French prison in Marseille, he wrote that Germany would
// not win the war and told his party to work with the Free French; the Germans freed him late in 1942 and the
// Italians received him in Rome in January 1943, but he would not speak for the Axis; back in Tunis in April 1943 he
// told his party to support the Allies; after the Allies took Tunis he was not charged, unlike Moncef Bey, and in
// 1945 he left for Cairo. Look: a schematic map of the Mediterranean at night, his route drawn as a line whose colour
// says who held him (France blue, Germany grey, Italy green, Axis-occupied Tunis rust, free gold), and his August 1942
// letter on paper. Libre Caslon Text for titles and the letter, Inter for captions and labels.
//
// Facts:
// - Larousse, "Habib ibn Ali Bourguiba": jailed again in April 1938 with the party's leaders "pour complot contre la
//   sûreté de l'État"; held at Fort Saint-Nicolas in Marseille; freed by the Germans in December 1942 and taken to Rome;
//   "Les forces de l'Axe demandent à Bourguiba de coopérer. Persuadé de la victoire des Alliés, celui-ci refuse", and
//   he secretly urged the Destourians to contact the Free French; brought back to Tunis in April 1943, a month before
//   the British entered the city; put under watch by the French after the liberation; left secretly for Cairo.
// - Wikipedia, "Habib Bourguiba" (citing Martel, Belkhodja, Bessis): arrested on 10 April 1938 after the riots of
//   9 April; moved to Fort Saint-Nicolas, Marseille, on 26 May 1940; letter of 10 August 1942 to Habib Thameur:
//   "Germany will not win the war and cannot win it ... The order is given ... to make contact with Gaullist French
//   ... Our support must be unconditional"; moved to Montluc prison in Lyon on 18 November 1942; received with honours
//   in Rome in January 1943 at Mussolini's request; the Italian foreign ministry tried to get a declaration in their
//   favour; back in Tunis on 8 April 1943 he made sure his 1942 message reached the activists; so he escaped the fate of
//   Moncef Bey, deposed in May 1943 by General Juin on a charge of collaboration; crossed into Libya in disguise on
//   23 March 1945 and reached Cairo in April 1945; prime minister on 11 April 1956, president from 25 July 1957.
// - Encyclopedia of World Biography (encyclopedia.com): the Axis tried to recruit him, "However, Bourguiba declined";
//   back in Tunisia in April 1943 "he convinced Neo-Destour militants to support the Allies".
// - David D. Newsom, "The unsung diplomat" (Christian Science Monitor, 12 April 2000): the Germans freed him from prison
//   in Lyon and handed him to the Italians, who let him return to Tunis; when General Juin ordered proceedings against
//   him, the US consul Hooker Doolittle urged Juin to drop them, and Juin agreed; in March 1945 he fled in disguise to
//   Egypt.
// - US State Department, FRUS 1981-88 vol. 24, memo of 23 May 1981: Bourguiba recalled a letter smuggled out of his
//   Marseille prison by his son, saying the Allies would win.
// - Wikipedia, "Tunisian independence": independence on 20 March 1956, after negotiations led by Bourguiba.
// - Académie des sciences d'outre-mer, review of Fayçal Cherif's thesis (2015): in Rome Bourguiba handled the Italians
//   carefully while trying not to give them pledges. So the scene says he would not speak for the Axis, not more.
// The map is schematic: a simplified coastline, and straight lines between the places he was held.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  Bourguiba and the Neo-Destour; arrested after 9 April 1938.
//  B  9.6–23.2  Marseille, 1940; the letter of August 1942.
//  C 23.4–41.6  Freed by the Germans; Rome, January 1943; back in Tunis, April 1943.
//  D 41.8–55.4  May 1943: the Allies in Tunis; Moncef Bey deposed; Bourguiba not charged.
//  E 55.6–64.8  Cairo, 1945; independence, 1956.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  night1: '#0e1428', night2: '#1b2440', land: '#46536f', land2: '#4f5c78', coast: 'rgba(239,228,204,0.55)',
  ink: '#f4ecda', soft: 'rgba(244,236,218,0.78)', faint: 'rgba(244,236,218,0.25)', paper: '#efe4cc', paperInk: '#2a2420',
  france: '#7ea6ea', germany: '#b7b7b7', italy: '#86c993', axis: '#d0693f', free: '#e9c65e', rust: '#b5532e',
};
const SERIF = 'Libre Caslon Text', SANS = 'Inter';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the dates ----------
const ARRESTED = 1938, MARSEILLE = 1940, LETTER = 1942, ROME = 1943, CAIRO = 1945, INDEPENDENCE = 1956;
if (CAIRO - ARRESTED !== 7 || INDEPENDENCE - ROME !== 13) throw new Error('dates');

// ---------- the map ----------
const LON0 = -1, LAT0 = 47.5, KMLON = 87.5, KMLAT = 111, PXKM = 0.2775, MX = 20, MY = 150;
const P = (lat, lon) => [MX + (lon - LON0) * KMLON * PXKM, MY + (LAT0 - lat) * KMLAT * PXKM];
// Simplified coasts (schematic): Africa from west to east, then southern Europe from Spain round Italy and Greece to Turkey.
const AFRICA = [[35.7, -1], [36.8, 3.0], [36.9, 7.8], [37.3, 9.9], [37.1, 11.0], [35.8, 10.6], [34.7, 10.8], [33.9, 10.1], [32.9, 13.2], [32.4, 15.1], [31.2, 16.6], [30.4, 19.2], [32.1, 20.1], [32.9, 22.0], [32.1, 24.0], [31.6, 25.1], [31.2, 29.9], [31.3, 32.3], [31.1, 33.5]];
const EUROPE = [[37.6, -1], [39.5, -0.3], [40.7, 0.9], [41.4, 2.2], [42.3, 3.3], [43.5, 3.9], [43.4, 4.8], [43.3, 5.4], [43.1, 5.9], [43.7, 7.3], [44.4, 8.9], [44.1, 9.8], [43.5, 10.3], [42.9, 10.5], [42.1, 11.8], [41.7, 12.3], [41.2, 13.6], [40.8, 14.2], [40.6, 14.8], [40.0, 15.6], [39.4, 16.0], [38.1, 15.6], [38.4, 16.5], [39.0, 17.1], [40.4, 17.2], [39.8, 18.4], [40.6, 17.9], [41.1, 16.9], [41.9, 16.1], [42.4, 14.2], [43.6, 13.5], [44.1, 12.6], [45.4, 12.3], [45.6, 13.8], [45.0, 13.9], [43.5, 16.4], [42.6, 18.1], [41.3, 19.4], [40.5, 19.4], [39.6, 20.1], [38.3, 21.3], [36.8, 21.7], [36.4, 22.5], [37.0, 23.0], [37.9, 23.7], [38.5, 24.1], [40.6, 22.9], [40.9, 24.6], [40.9, 26.0], [40.0, 26.2], [38.4, 26.8], [37.0, 27.3], [36.6, 28.0], [36.3, 30.5], [36.6, 32.0], [36.2, 33.5]];
const ISLANDS = [
  [[38.2, 12.4], [38.3, 15.6], [36.7, 15.1], [37.6, 12.6]],
  [[41.2, 9.2], [40.0, 9.8], [39.1, 9.5], [38.9, 8.6], [40.0, 8.4], [41.0, 8.2]],
  [[43.0, 9.4], [42.0, 9.5], [41.4, 9.2], [41.9, 8.6], [42.7, 8.6]],
  [[35.6, 23.5], [35.3, 26.3], [35.0, 24.7]],
];
const PLACES = {
  Tunis: [36.8, 10.18], 'Téboursouk': [36.46, 9.25], Marseille: [43.3, 5.37], Lyon: [45.76, 4.84], Rome: [41.9, 12.5], Cairo: [30.04, 31.24],
};
// The route and who held him on each leg: [from, to, holder, start, end]
const LEGS = [
  ['Tunis', 'Téboursouk', 'france', 6.0, 7.2],
  ['Téboursouk', 'Marseille', 'france', 10.0, 12.0],
  ['Marseille', 'Lyon', 'france', 24.0, 25.4],
  ['Lyon', 'Rome', 'italy', 30.0, 32.0],
  ['Rome', 'Tunis', 'axis', 37.6, 39.4],
  ['Tunis', 'Cairo', 'free', 56.0, 58.6],
];

function poly(pts, close = true) { ctx.beginPath(); pts.forEach(([la, lo], i) => { const [x, y] = P(la, lo); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); if (close) ctx.closePath(); }
function map(a) {
  A(a, () => {
    // Africa: the coast, then down to the bottom of the map
    ctx.beginPath(); AFRICA.forEach(([la, lo], i) => { const [x, y] = P(la, lo); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.lineTo(W + 10, P(28, 33)[1] + 40); ctx.lineTo(-10, P(28, 33)[1] + 40); ctx.closePath();
    ctx.fillStyle = C.land; ctx.fill();
    // Europe: the coast, then up to the top
    ctx.beginPath(); EUROPE.forEach(([la, lo], i) => { const [x, y] = P(la, lo); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.lineTo(W + 10, MY - 40); ctx.lineTo(-10, MY - 40); ctx.closePath();
    ctx.fillStyle = C.land2; ctx.fill();
    for (const isl of ISLANDS) { poly(isl); ctx.fillStyle = C.land2; ctx.fill(); }
    ctx.strokeStyle = C.coast; ctx.lineWidth = 2;
    poly(AFRICA, false); ctx.stroke(); poly(EUROPE, false); ctx.stroke();
    for (const isl of ISLANDS) { poly(isl); ctx.stroke(); }
    // fade the map's top and bottom edges into the night
    const g1 = ctx.createLinearGradient(0, MY - 40, 0, MY + 30); g1.addColorStop(0, C.night1); g1.addColorStop(1, 'rgba(14,20,40,0)');
    ctx.fillStyle = g1; ctx.fillRect(0, MY - 40, W, 70);
    const yb = P(28, 0)[1];
    const g2 = ctx.createLinearGradient(0, yb - 60, 0, yb + 40); g2.addColorStop(0, 'rgba(14,20,40,0)'); g2.addColorStop(1, C.night1);
    ctx.fillStyle = g2; ctx.fillRect(0, yb - 60, W, 100);
    font(400, 20); text('schematic map', 34, 760, { base: 'middle', color: C.faint });
    font(500, 22); text('MEDITERRANEAN SEA', ...P(34.4, 19.6), { align: 'center', base: 'middle', color: 'rgba(244,236,218,0.35)', spacing: '4px' });
  });
}
function placeDot(name, a, { dx = 14, dy = 0, align = 'left', color = C.ink, size = 26 } = {}) {
  A(a, () => {
    const [x, y] = P(...PLACES[name]);
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
    font(600, size); text(name, x + dx, y + dy, { align, base: 'middle', color });
  });
}
function leg([from, to, holder, a, b], t, fade = 1) {
  const g = eio(seg(t, a, b));
  if (g <= 0) return;
  const [x0, y0] = P(...PLACES[from]), [x1, y1] = P(...PLACES[to]);
  // a gentle arc
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * len * 0.18, cy = my + (dx / len) * len * 0.18;
  A(fade, () => {
    ctx.strokeStyle = C[holder]; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([2, 12]);
    ctx.beginPath();
    const N = 40;
    for (let i = 0; i <= N * g; i++) {
      const u = i / N, x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  });
}
/** The traveller: a small figure in a coat and fez, standing at (x, y). */
function figure(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 30 * s, 8 * s, 0, TAU); ctx.fill();
  ctx.fillRect(x - 6 * s, y - 46 * s, 12 * s, 8 * s); // fez
  ctx.beginPath(); ctx.moveTo(x - 11 * s, y - 20 * s); ctx.lineTo(x + 11 * s, y - 20 * s); ctx.lineTo(x + 9 * s, y); ctx.lineTo(x - 9 * s, y); ctx.closePath(); ctx.fill();
}
function where(t) {
  // position along the route at time t
  let at = PLACES.Tunis, holder = 'france';
  for (const [from, to, h, a, b] of LEGS) {
    if (t < a) break;
    const g = eio(seg(t, a, b));
    const [la0, lo0] = PLACES[from], [la1, lo1] = PLACES[to];
    at = [lerp(la0, la1, g), lerp(lo0, lo1, g)]; holder = h;
  }
  if (t >= 26.4 && t < 30.0) holder = 'germany';
  return { at, holder };
}
const HOLDER = {
  france: 'prisoner of France', germany: 'freed by the Germans', italy: 'in Italian hands', axis: 'in Axis-occupied Tunis', free: 'free, watched by the French',
};
function badge(t, a) {
  A(a, () => {
    let h = where(t).holder;
    if (t >= 41.8 && t < 56.0) h = 'free';
    ctx.fillStyle = 'rgba(14,20,40,0.85)'; k.rrect(34, 30, 600, 96, 12); ctx.fill();
    ctx.fillStyle = C[h]; ctx.beginPath(); ctx.arc(70, 78, 16, 0, TAU); ctx.fill();
    font(600, 30); text(HOLDER[h], 100, 64, { base: 'middle', color: C[h] });
    font(400, 22); text(yearAt(t), 100, 102, { base: 'middle', color: C.soft });
  });
}
function yearAt(t) {
  if (t < 9.6) return 'April 1938';
  if (t < 14.2) return 'May 1940';
  if (t < 23.4) return 'August 1942';
  if (t < 28.0) return 'November–December 1942';
  if (t < 37.2) return 'January–March 1943';
  if (t < 41.8) return 'April 1943';
  if (t < 51.0) return 'May 1943';
  if (t < 55.6) return '1943–1945';
  return 'March 1945';
}

// ---------- A–E: the route ----------
function sceneRoute(t) {
  const out = 1 - seg(t, 59.4, 60.2);
  A(span(t, 0, 65, 0.6, 0) * out, () => {
    map(1);
    const dimForLetter = seg(t, 14.2, 14.8) * (1 - seg(t, 22.8, 23.4));
    for (const l of LEGS) leg(l, t);
    // places
    placeDot('Tunis', seg(t, 0.6, 1.2), { dx: 14, dy: 24, color: C.free });
    placeDot('Téboursouk', seg(t, 5.8, 6.4) * (1 - seg(t, 12.0, 12.6)), { dx: -14, dy: 26, align: 'right', size: 22 });
    placeDot('Marseille', seg(t, 10.0, 10.6), { dx: -14, dy: 24, align: 'right' });
    placeDot('Lyon', seg(t, 23.6, 24.2), { dx: 16, dy: 4 });
    placeDot('Rome', seg(t, 29.8, 30.4), { dx: 16, dy: 22 });
    placeDot('Cairo', seg(t, 55.8, 56.4), { dx: -16, dy: 30, align: 'right' });
    // the traveller
    const { at, holder } = where(t);
    const [x, y] = P(...at);
    A(seg(t, 1.0, 1.6), () => {
      ctx.fillStyle = 'rgba(14,20,40,0.6)'; ctx.beginPath(); ctx.arc(x, y - 22, 34, 0, TAU); ctx.fill();
      ctx.strokeStyle = C[holder]; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y - 22, 34, 0, TAU); ctx.stroke();
      figure(x, y - 4, 0.9, C.ink);
    });
    badge(t, seg(t, 1.6, 2.2));
    // the letter of August 1942
    A(dimForLetter, () => { ctx.fillStyle = 'rgba(14,20,40,0.55)'; ctx.fillRect(0, 140, W, 640); letter(t); });
    // Rome: what was asked
    A(seg(t, 33.0, 33.6) * (1 - seg(t, 36.8, 37.2)), () => {
      ctx.fillStyle = 'rgba(14,20,40,0.88)'; k.rrect(120, 470, 624, 190, 14); ctx.fill();
      ctx.strokeStyle = C.italy; ctx.lineWidth = 2; ctx.stroke();
      font(600, 30, SERIF); text('Asked: a declaration for the Axis', CX, 530, { align: 'center', base: 'middle', color: C.italy });
      font(500, 30, SERIF); text('He did not give one', CX, 600, { align: 'center', base: 'middle', color: C.ink });
    });
    // Tunis, May 1943
    A(seg(t, 42.2, 42.8) * (1 - seg(t, 55.0, 55.6)), () => tunis1943(t));
  });
}
function letter(t) {
  const x = 150, y = 190, w = 564, h = 520;
  ctx.save(); ctx.translate(CX, y + h / 2); ctx.rotate(-0.02); ctx.translate(-CX, -(y + h / 2));
  ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(42,36,32,0.12)'; ctx.lineWidth = 1;
  for (let ly = y + 70; ly < y + h - 20; ly += 34) { ctx.beginPath(); ctx.moveTo(x + 30, ly); ctx.lineTo(x + w - 30, ly); ctx.stroke(); }
  font(400, 22, SERIF); text('Fort Saint-Nicolas, Marseille', x + w - 36, y + 44, { align: 'right', base: 'middle', color: C.paperInk });
  text('August 1942', x + w - 36, y + 76, { align: 'right', base: 'middle', color: C.paperInk });
  font(400, 24, SERIF); text('To Habib Thameur', x + 40, y + 128, { base: 'middle', color: C.paperInk });
  const q = seg(t, 15.0, 15.6);
  A(q, () => {
    font('italic 500', 40, SERIF);
    text('“Germany will not', CX, y + 220, { align: 'center', base: 'middle', color: C.rust });
    text('win the war …”', CX, y + 274, { align: 'center', base: 'middle', color: C.rust });
  });
  A(seg(t, 19.6, 20.2), () => {
    font(400, 26, SERIF);
    text('Contact the Free French.', CX, y + 360, { align: 'center', base: 'middle', color: C.paperInk });
    text('Our support must be unconditional.', CX, y + 400, { align: 'center', base: 'middle', color: C.paperInk });
  });
  font(400, 20, SANS); text('Habib Bourguiba, in English translation', CX, y + h - 30, { align: 'center', base: 'middle', color: 'rgba(42,36,32,0.6)' });
  ctx.restore();
}
function tunis1943(t) {
  ctx.fillStyle = 'rgba(14,20,40,0.88)'; k.rrect(60, 380, W - 120, 330, 16); ctx.fill();
  font(600, 34, SERIF); text('Tunis, May 1943', CX, 430, { align: 'center', base: 'middle', color: C.ink });
  const rows = [
    [42.6, 'The Allies take Tunis, 7 May', C.free],
    [46.8, 'Moncef Bey deposed by the French', C.axis],
    [51.4, 'Bourguiba not charged; watched', C.france],
  ];
  rows.forEach(([t0, s, col], i) => A(seg(t, t0, t0 + 0.6), () => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(130, 500 + i * 70, 10, 0, TAU); ctx.fill();
    font(500, 30); text(s, 156, 500 + i * 70, { base: 'middle', color: C.ink });
  }));
}

// ---------- E: independence ----------
function sceneEnd(t) {
  A(seg(t, 59.8, 60.6), () => {
    font(600, 120, SERIF); text(`${INDEPENDENCE}`, CX, 380, { align: 'center', base: 'middle', color: C.free });
    font(500, 34); text('Tunisia independent, 20 March', CX, 480, { align: 'center', base: 'middle', color: C.ink });
    font(400, 28); text('Habib Bourguiba, prime minister, then president', CX, 540, { align: 'center', base: 'middle', color: C.soft });
    // the flag of Tunisia, drawn simply
    A(seg(t, 61.0, 61.8), () => {
      ctx.fillStyle = '#c8102e'; ctx.fillRect(CX - 90, 600, 180, 120);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(CX, 660, 40, 0, TAU); ctx.fill();
      ctx.fillStyle = '#c8102e'; ctx.beginPath(); ctx.arc(CX - 3, 660, 30, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(CX + 5, 660, 24, 0, TAU); ctx.fill();
      ctx.fillStyle = '#c8102e'; ctx.beginPath();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 15, a = -Math.PI / 2 + (i * Math.PI) / 5; ctx.lineTo(CX + 9 + Math.cos(a) * r, 661 + Math.sin(a) * r); }
      ctx.closePath(); ctx.fill();
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.night2); lg.addColorStop(1, C.night1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, '*Habib Bourguiba*, a lawyer, led the Neo-Destour party, which wanted Tunisia free from France.'],
  [5.0, 9.4, 'After protests in Tunis on 9 April 1938, the French arrested him and charged him with plotting.'],
  [9.6, 14.0, 'In May 1940 he was moved to a prison in France: Fort Saint-Nicolas in Marseille.'],
  [14.2, 18.6, 'In August 1942 he wrote from there to a party leader: ~Germany will not win the war~.'],
  [18.8, 23.2, 'He told his party to work with de Gaulle’s Free French: “Our support must be unconditional.”'],
  [23.4, 27.8, 'Late in 1942 the Germans, now occupying all of France, freed him from a prison in Lyon.'],
  [28.0, 32.4, 'They handed him to their Italian allies. In January 1943 *Rome* received him with honours.'],
  [32.6, 37.0, 'Mussolini’s government wanted him to speak for the Axis. He ~would not~.'],
  [37.2, 41.6, 'In April 1943 he was brought back to Tunis, still held by German and Italian troops.'],
  [41.8, 46.2, 'There he told his party to support the Allies. On *7 May 1943* the Allies took Tunis.'],
  [46.4, 50.8, 'The French deposed Tunisia’s ruler, Moncef Bey, accusing him of collaboration.'],
  [51.0, 55.4, 'Bourguiba was not charged; an American diplomat spoke up for him. The French watched him.'],
  [55.6, 60.0, 'In March 1945 he slipped away in disguise to *Cairo*, to plead Tunisia’s cause abroad.'],
  [60.2, 64.6, 'Unlike the Bey, he was never accused of collaboration. In *1956* he led Tunisia to independence.'],
];

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneRoute(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 812, size: 34, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.free, '~': C.axis } });
  },
});
