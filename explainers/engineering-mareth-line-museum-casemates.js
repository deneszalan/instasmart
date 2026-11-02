// Explainer for engineering-mareth-line-museum-casemates (Tunisia 1943, Visit): the Mareth Line Military Museum
// near Mareth, between Gabès and Medenine, on a hill above the Wadi Zigzaou among the casemates of the line that
// French forces built in 1936–40 against Italian Libya, which Axis troops held against the Eighth Army in March 1943.
// Look: a schematic map in sand and slate, a casemate in cross-section like an engineer's drawing, then a compass on
// the museum's hill. Oswald for headings and numbers, IBM Plex Sans for captions and labels.
//
// Facts:
// - La Presse (Tunis), 19 March 2026, "Histoire militaire tunisienne : quatre musées à découvrir gratuitement
//   demain": the Musée militaire de la ligne défensive de Mareth, Mareth–Toujane area, Gabès governorate, one of four
//   museums under the Ministry of National Defence; French forces built the line between 1936 and 1940 against a
//   possible Italian attack from Libya, the "Maginot line of the desert"; 45 km long from the sea to the Matmata hills,
//   along the Wadi Zigzaou; 40 infantry casemates, 8 large artillery casemates, 15 command posts and 28 support
//   points; after the defeat of 1940 a German-Italian commission demilitarised it; the Axis rearmed it from November
//   1942; the British offensive began on 16 March 1943; the Axis forces were commanded by General Messe; the battle
//   ended on 28 March after the outflanking through the El Hamma–Tebaga gap; the museum opened free on 20 March 2026.
// - Wikipedia, "Mareth Line" (after Playfair's official history and Kaufmann, Fortress France): planned from 1934,
//   built from 1936; ran along the north side of the Wadi Zigzaou, whose sides were steepened, with an anti-tank
//   obstacle of vertical rails; eight artillery casemates, forty infantry casemates, fifteen command posts; length
//   given as 40 km (infobox) and about 50 km (text); demilitarised after the armistice of June 1940; the Axis
//   refurbished it after Operation Torch; outflanked through the Tebaga Gap; the Axis withdrew to Wadi Akarit.
// - Wikipedia, "Mareth Museum": between Gabès and Medenine, on a hill overlooking the Wadi Zigzaou near several
//   casemates; command posts and anti-tank and anti-aircraft guns displayed outside; 33°37′04″N 10°17′10″E.
// - La Presse, 24 November 2025 (S. Hamrouni): the museum shows maps, archive photographs, uniforms and artillery
//   pieces found on the spot, and aims "to explain without glorifying".
// - Wikipedia coordinates: Gabès 33.883 N 10.117 E; Mareth 33.633 N 10.300 E; Medenine 33.355 N 10.505 E; Toujane
//   33.467 N 10.133 E. The coast and the line on the map are schematic; the casemate drawing is generic, not a plan.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  The museum on its hill near Mareth; the Mareth Line.
//  B  9.6–23.2  Built against Italian Libya; from the sea to the Matmata hills, behind the wadi; 40 + 8 + 15.
//  C 23.4–41.6  Disarmed 1940; rearmed 1942; March 1943; outflanked through the Tebaga Gap.
//  D 41.8–55.4  The museum today; a casemate in section; face south-east.
//  E 55.6–65.2  Compass from the hill; one line, three armies.
const W = 864, H = 1080, CX = W / 2;
const { seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#1f2421', bg1: '#2d332c', sand: '#d8c49a', sand2: '#b9a375', hill: '#8d7a58', sea: '#2f5d6e', sea2: '#3f7487',
  concrete: '#b8b6ad', concrete2: '#8e8c84', ink: '#f4f1e8', soft: 'rgba(244,241,232,0.78)', faint: 'rgba(244,241,232,0.28)',
  line: '#f0b44c', axis: '#e07a64', allied: '#8cc6e8', it: '#9bd18b', grey: '#9a9a96', wadi: '#5a7a74',
};
const HEAD = 'Oswald', SANS = 'IBM Plex Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const BUILT = [1936, 1940];
const INFANTRY = 40, ARTILLERY = 8, COMMAND = 15;
const P = { museum: [33.6178, 10.2861], gabes: [33.883, 10.117], mareth: [33.633, 10.3], medenine: [33.355, 10.505], toujane: [33.467, 10.133] };
const rad = (d) => (d * Math.PI) / 180;
/** Initial great-circle bearing from a to b, degrees clockwise from north. */
function bearing([la1, lo1], [la2, lo2]) {
  const y = Math.sin(rad(lo2 - lo1)) * Math.cos(rad(la2));
  const x = Math.cos(rad(la1)) * Math.sin(rad(la2)) - Math.sin(rad(la1)) * Math.cos(rad(la2)) * Math.cos(rad(lo2 - lo1));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
function kmBetween([la1, lo1], [la2, lo2]) {
  const a = Math.sin(rad(la2 - la1) / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(rad(lo2 - lo1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}
const B = { medenine: bearing(P.museum, P.medenine), gabes: bearing(P.museum, P.gabes), toujane: bearing(P.museum, P.toujane) };
const D = { medenine: kmBetween(P.museum, P.medenine), gabes: kmBetween(P.museum, P.gabes), toujane: kmBetween(P.museum, P.toujane) };
if (Math.round(B.medenine / 10) !== 15 || Math.round(B.gabes / 10) !== 33 || Math.round(B.toujane / 10) !== 22) throw new Error('bearings');

// ---------- the map ----------
const LAT0 = 33.62, LON0 = 10.3, SC = 7.5; // pixels per km
const map = ([la, lo]) => [CX + 40 + (lo - LON0) * 111.32 * Math.cos(rad(LAT0)) * SC, 450 - (la - LAT0) * 110.57 * SC];
// schematic coast: Gabès south-east to the shore near Zarat, then east
const COAST = [[34.05, 10.02], [33.883, 10.117], [33.78, 10.25], [33.71, 10.37], [33.69, 10.52], [33.66, 10.7], [33.6, 10.9]];
// the line, schematic: from the shore along the wadi past the museum to the hills near Toujane
const LINE = [[33.705, 10.39], [33.66, 10.33], [33.6178, 10.2861], [33.56, 10.22], [33.5, 10.16], [33.467, 10.133]];
function drawMap(t, { line = 1, hills = 1 } = {}) {
  // land
  ctx.fillStyle = C.sand2; ctx.fillRect(0, 0, W, 780);
  // the sea, north-east of the coast
  ctx.fillStyle = C.sea; ctx.beginPath();
  const c0 = map(COAST[0]); ctx.moveTo(c0[0], -10);
  for (const p of COAST) { const [x, y] = map(p); ctx.lineTo(x, y); }
  ctx.lineTo(W + 10, map(COAST.at(-1))[1]); ctx.lineTo(W + 10, -10); ctx.closePath(); ctx.fill();
  font(500, 24); text('Gulf of Gabès', 610, 160, { color: '#cfe6ee', align: 'center', base: 'middle' });
  // the Matmata hills, south-west
  A(hills, () => {
    ctx.fillStyle = C.hill;
    for (let i = 0; i < 9; i++) {
      const [x, y] = map([33.52 - i * 0.03, 10.08 - (i % 3) * 0.03]);
      ctx.beginPath(); ctx.moveTo(x - 46, y + 18); ctx.lineTo(x, y - 26); ctx.lineTo(x + 46, y + 18); ctx.closePath(); ctx.fill();
    }
    font(600, 24); text('Matmata hills', 150, 690, { color: C.ink, align: 'center', base: 'middle' });
  });
  // the wadi
  ctx.strokeStyle = C.wadi; ctx.lineWidth = 5; ctx.beginPath();
  LINE.forEach((p, i) => { const [x, y] = map(p); i ? ctx.lineTo(x + 6, y + 8) : ctx.moveTo(x + 6, y + 8); }); ctx.stroke();
  // the line
  if (line > 0) A(line, () => {
    ctx.strokeStyle = C.line; ctx.lineWidth = 7; ctx.setLineDash([16, 8]); ctx.beginPath();
    LINE.forEach((p, i) => { const [x, y] = map(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.setLineDash([]);
  });
  const town = (p, name, dx, dy, col = C.ink) => { const [x, y] = map(p); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); font(600, 24); text(name, x + dx, y + dy, { color: col, base: 'middle' }); };
  town(P.gabes, 'Gabès', 14, -4);
  town(P.mareth, 'Mareth', 14, -14);
  town(P.medenine, 'Medenine', 14, 0);
  town(P.toujane, 'Toujane', -110, 16);
  font(400, 22); text('schematic map', 40, 750, { color: C.faint, base: 'middle' });
}
/** The partial line, drawn from the sea to the hills up to u. */
function lineUpTo(u) {
  const pts = LINE.map(map); let tot = 0; const L = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  ctx.strokeStyle = C.line; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(...pts[0]);
  let left = u * tot;
  for (let i = 1; i < pts.length && left > 0; i++) {
    const f = Math.min(1, left / L[i - 1]); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); left -= L[i - 1];
  }
  ctx.stroke();
}
function museumPin(a) {
  A(a, () => {
    const [x, y] = map(P.museum);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y - 30, 14, Math.PI, 0); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(x, y - 30, 6, 0, TAU); ctx.fill();
    font(700, 26, HEAD); text('MUSEUM', x - 24, y - 58, { color: C.ink, align: 'right', base: 'middle', spacing: '1px' });
  });
}
function arrow(x0, y0, x1, y1, col, wdt = 8, u = 1) {
  const x = lerp(x0, x1, u), y = lerp(y0, y1, u), a = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = col; ctx.lineWidth = wdt; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18); ctx.lineTo(x + Math.cos(a + 2.4) * 18, y + Math.sin(a + 2.4) * 18); ctx.lineTo(x + Math.cos(a - 2.4) * 18, y + Math.sin(a - 2.4) * 18); ctx.closePath(); ctx.fill();
}
function banner(s, sub, a, col = C.line) {
  A(a, () => {
    ctx.fillStyle = 'rgba(25,29,26,0.86)'; k.rrect(60, 40, 660, sub ? 112 : 74, 14); ctx.fill();
    font(600, 38, HEAD); text(s, 84, 78, { color: col, base: 'middle', spacing: '1px' });
    if (sub) { font(500, 24); text(sub, 84, 124, { color: C.ink, base: 'middle' }); }
  });
}

// ---------- A, B, C: the map ----------
function sceneMap(t) {
  A(span(t, 0, 41.8, 0.5, 0.4), () => {
    const disarmed = seg(t, 23.6, 24.4) * (1 - seg(t, 28.2, 29.0));
    drawMap(t, { line: 0, hills: seg(t, 14.2, 15.0) });
    // the line drawn from the sea to the hills
    if (t > 5.2) {
      ctx.save();
      if (disarmed > 0) ctx.globalAlpha = 1 - 0.75 * disarmed;
      lineUpTo(eio(seg(t, 5.4, 8.0)));
      ctx.restore();
    }
    museumPin(seg(t, 0.8, 1.6));
    banner('MARETH LINE MILITARY MUSEUM', 'near Mareth, between Gabès and Medenine', seg(t, 1.0, 1.8) * (1 - seg(t, 9.2, 9.6)));
    banner(`BUILT ${BUILT[0]}–${BUILT[1]} BY FRANCE`, 'a belt of concrete casemates', seg(t, 5.4, 6.0) * (1 - seg(t, 9.2, 9.6)));
    // Italian Libya, south-east
    A(seg(t, 9.8, 10.6) * (1 - seg(t, 14.0, 14.4)), () => {
      arrow(850, 750, 730, 630, C.it, 10, eout(seg(t, 10.0, 11.6)));
      font(600, 30, HEAD); text('ITALIAN LIBYA', 840, 540, { color: C.it, align: 'right', base: 'middle', spacing: '1px' });
      font(500, 22); text('to the south-east', 840, 572, { color: C.ink, align: 'right', base: 'middle' });
    });
    banner('FACING SOUTH-EAST', 'the way an Italian attack was expected', seg(t, 10.2, 10.8) * (1 - seg(t, 13.8, 14.2)), C.it);
    banner('FROM THE SEA TO THE HILLS', 'about 40–50 km, behind the Wadi Zigzaou (sources differ)', seg(t, 14.4, 15.0) * (1 - seg(t, 18.4, 18.8)));
    // the works along the line, as icons
    A(seg(t, 18.8, 19.4) * (1 - seg(t, 23.0, 23.4)), () => {
      ctx.fillStyle = 'rgba(25,29,26,0.88)'; k.rrect(60, 40, 744, 170, 14); ctx.fill();
      const rows = [[INFANTRY, 'infantry casemates', C.concrete], [ARTILLERY, 'artillery casemates', C.line], [COMMAND, 'command posts', C.allied]];
      rows.forEach(([n, name, col], r) => {
        const y = 80 + r * 48, shown = Math.round(n * seg(t, 19.0 + r * 0.6, 20.4 + r * 0.6));
        font(600, 36, HEAD); text(Kit.fmt(n), 84, y, { color: col, base: 'middle' });
        font(500, 22); text(name, 144, y, { color: C.ink, base: 'middle' });
        for (let i = 0; i < shown; i++) { ctx.fillStyle = col; ctx.fillRect(400 + (i % 20) * 19, y - 14 + Math.floor(i / 20) * 15, 13, 11); }
      });
    });
    // 1940: disarmed
    banner('1940: DISARMED', 'by an Italian-German commission, after France’s defeat', seg(t, 23.6, 24.2) * (1 - seg(t, 27.6, 28.0)), C.grey);
    // November 1942: rearmed by the Axis
    banner('FROM NOVEMBER 1942: REARMED', 'by Axis forces, now facing the Allies', seg(t, 28.2, 28.8) * (1 - seg(t, 32.2, 32.6)), C.axis);
    // March 1943: the attack and the hook to the west
    A(seg(t, 32.8, 33.4) * (1 - seg(t, 36.8, 37.2) * 0.999), () => {
      const [mx, my] = map(P.medenine);
      arrow(mx + 10, my - 10, mx - 70, my - 140, C.allied, 10, eout(seg(t, 33.0, 34.6)));
      font(600, 26, HEAD); text('EIGHTH ARMY', mx + 30, my + 40, { color: C.allied, base: 'middle', spacing: '1px' });
      font(600, 24, HEAD); text('ITALIAN AND GERMAN', 40, 330, { color: C.axis, base: 'middle', spacing: '1px' });
      font(500, 22); text('troops under General Messe', 40, 360, { color: C.ink, base: 'middle' });
    });
    banner('MARCH 1943', 'the Eighth Army attacks the line', seg(t, 32.8, 33.4) * (1 - seg(t, 37.0, 37.4)), C.allied);
    A(seg(t, 37.2, 37.8), () => {
      // the hook through the Tebaga Gap, off the map to the west
      ctx.strokeStyle = C.allied; ctx.lineWidth = 8; ctx.setLineDash([2, 14]); ctx.lineCap = 'round';
      const u = eio(seg(t, 37.4, 40.2));
      ctx.beginPath(); ctx.moveTo(560, 760); ctx.bezierCurveTo(lerp(560, 300, u), 800, lerp(560, -20, u), lerp(760, 700, u), lerp(560, 30, u), lerp(760, 330, u)); ctx.stroke();
      ctx.setLineDash([]); ctx.lineCap = 'butt';
      font(600, 24, HEAD); text('TO THE TEBAGA GAP', 40, 300, { color: C.allied, base: 'middle', spacing: '1px' });
      font(500, 22); text('west of the hills', 40, 330, { color: C.ink, base: 'middle' });
    });
    banner('OUTFLANKED', 'the Axis withdraws north at the end of March', seg(t, 37.4, 38.0) * (1 - seg(t, 41.2, 41.6)), C.allied);
  });
}

// ---------- D: the museum; a casemate in section ----------
function casemate(x, y, s, a = 1) {
  A(a, () => {
    // earth over and around the concrete
    ctx.fillStyle = C.hill; ctx.beginPath(); ctx.moveTo(x - 300 * s, y + 10 * s); ctx.quadraticCurveTo(x - 60 * s, y - 210 * s, x + 170 * s, y - 40 * s); ctx.lineTo(x + 230 * s, y + 10 * s); ctx.closePath(); ctx.fill();
    // the concrete box
    ctx.fillStyle = C.concrete; ctx.fillRect(x - 170 * s, y - 150 * s, 330 * s, 160 * s);
    ctx.fillStyle = C.concrete2; ctx.fillRect(x - 130 * s, y - 112 * s, 240 * s, 104 * s);
    // the embrasure, facing right (south-east)
    ctx.fillStyle = '#1b1d1a'; ctx.fillRect(x + 110 * s, y - 84 * s, 50 * s, 26 * s);
    // the gun inside, simplified
    ctx.fillStyle = '#3a3c38'; ctx.fillRect(x + 20 * s, y - 76 * s, 120 * s, 10 * s); ctx.fillRect(x - 10 * s, y - 70 * s, 50 * s, 40 * s);
    // the door at the back
    ctx.fillStyle = '#1b1d1a'; ctx.fillRect(x - 170 * s, y - 70 * s, 14 * s, 70 * s);
  });
}
function sceneMuseum(t) {
  A(span(t, 41.6, 55.6, 0.4, 0.4), () => {
    // a ground section: the hill, the casemate, the wadi with its rails
    const g = ctx.createLinearGradient(0, 0, 0, 780); g.addColorStop(0, '#3b4a52'); g.addColorStop(1, '#c79f6c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 780);
    // the hill the museum stands on
    ctx.fillStyle = C.hill; ctx.beginPath(); ctx.moveTo(0, 560); ctx.lineTo(0, 430); ctx.quadraticCurveTo(140, 400, 260, 420); ctx.quadraticCurveTo(330, 450, 470, 560); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.sand2; ctx.beginPath(); ctx.moveTo(0, 560); ctx.lineTo(470, 560); ctx.lineTo(560, 640); ctx.lineTo(680, 640); ctx.lineTo(720, 590); ctx.lineTo(W, 590); ctx.lineTo(W, 780); ctx.lineTo(0, 780); ctx.closePath(); ctx.fill();
    // the wadi's steepened bank and the rails
    ctx.fillStyle = C.wadi; ctx.fillRect(560, 632, 120, 8);
    ctx.fillStyle = '#4a4a46'; for (let i = 0; i < 5; i++) ctx.fillRect(578 + i * 22, 600, 6, 36);
    casemate(320, 560, 0.95, seg(t, 42.0, 42.8));
    // the museum building on the hilltop
    A(seg(t, 42.6, 43.4), () => {
      ctx.fillStyle = '#e8e2d4'; ctx.fillRect(50, 336, 170, 84); ctx.fillStyle = '#2d332c'; for (let i = 0; i < 4; i++) ctx.fillRect(66 + i * 38, 362, 22, 34);
      font(600, 22); text('museum', 135, 318, { color: C.ink, align: 'center', base: 'middle' });
    });
    banner('THE MUSEUM TODAY', 'run by Tunisia’s defence ministry, beside casemates', seg(t, 42.0, 42.6) * (1 - seg(t, 46.0, 46.4)));
    A(seg(t, 46.6, 47.2) * (1 - seg(t, 50.6, 51.0)), () => {
      ctx.fillStyle = 'rgba(25,29,26,0.86)'; k.rrect(60, 40, 744, 200, 14); ctx.fill();
      font(600, 30, HEAD); text('INSIDE', 84, 80, { color: C.line, base: 'middle', spacing: '1px' });
      font(500, 24); text('maps, photographs, uniforms, weapons found here', 84, 118, { color: C.ink, base: 'middle' });
      font(600, 30, HEAD); text('OUTSIDE', 84, 170, { color: C.line, base: 'middle', spacing: '1px' });
      font(500, 24); text('guns and command posts', 84, 208, { color: C.ink, base: 'middle' });
    });
    // labels on the section
    A(seg(t, 43.4, 44.2), () => {
      font(600, 22); text('casemate (generic section)', 160, 610, { color: C.ink, base: 'middle' });
      text('Wadi Zigzaou', 620, 680, { color: C.ink, align: 'center', base: 'middle' });
      text('rails against tanks', 620, 708, { color: C.soft, align: 'center', base: 'middle' });
    });
    // face south-east
    A(seg(t, 51.2, 51.8), () => {
      arrow(500, 470, 780, 470, C.it, 9, eout(seg(t, 51.4, 52.6)));
      font(600, 30, HEAD); text('SOUTH-EAST', 780, 420, { color: C.it, align: 'right', base: 'middle', spacing: '1px' });
      font(500, 22); text('toward Medenine and Libya', 780, 520, { color: C.ink, align: 'right', base: 'middle' });
      ctx.fillStyle = 'rgba(25,29,26,0.86)'; k.rrect(60, 40, 660, 74, 14); ctx.fill();
      font(600, 34, HEAD); text('WHERE THE SLITS LOOK', 84, 78, { color: C.it, base: 'middle', spacing: '1px' });
    });
  });
}

// ---------- E: a compass on the hill ----------
function sceneCompass(t) {
  A(span(t, 55.4, 65.2, 0.4, 0), () => {
    ctx.fillStyle = C.bg1; ctx.fillRect(0, 0, W, 780);
    const cx = CX, cy = 410, R = 250;
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    for (let d = 0; d < 360; d += 15) {
      const a = rad(d - 90), r0 = d % 90 ? R - 12 : R - 26;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
    }
    font(600, 30, HEAD);
    [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([n, d]) => { const a = rad(d - 90); text(n, cx + Math.cos(a) * (R + 30), cy + Math.sin(a) * (R + 30), { align: 'center', base: 'middle', color: C.soft }); });
    const target = (key, name, col, t0) => A(seg(t, t0, t0 + 0.6), () => {
      const a = rad(B[key] - 90), u = eout(seg(t, t0, t0 + 1.2));
      arrow(cx, cy, cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86, col, 8, u);
      const lx = cx + Math.cos(a) * (R * 0.55), ly = cy + Math.sin(a) * (R * 0.55);
      ctx.fillStyle = 'rgba(25,29,26,0.85)'; k.rrect(lx - 96, ly - 34, 192, 68, 10); ctx.fill();
      font(600, 24, HEAD); text(name, lx, ly - 12, { align: 'center', base: 'middle', color: col });
      font(500, 20); text(`${Kit.fmt(Math.round(B[key]))}° · ${Kit.fmt(Math.round(D[key]))} km`, lx, ly + 16, { align: 'center', base: 'middle', color: C.ink });
    });
    target('medenine', 'Medenine', C.it, 55.8);
    target('gabes', 'Gabès', C.allied, 56.6);
    target('toujane', 'Toujane, hills', C.line, 57.4);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, TAU); ctx.fill();
    font(500, 22); text('from the museum’s hill · straight lines', cx, 745, { align: 'center', base: 'middle', color: C.soft });
    A(seg(t, 60.4, 61.0), () => {
      ctx.fillStyle = 'rgba(25,29,26,0.9)'; k.rrect(60, 40, 744, 74, 14); ctx.fill();
      font(600, 30, HEAD); text('FRENCH CONCRETE · AXIS DEFENDERS · ALLIED ATTACK', CX, 78, { color: C.line, align: 'center', base: 'middle' });
    });
  });
}

const CUES = [
  [0.4, 4.8, 'Near *Mareth*, between Gabès and Medenine in southern Tunisia, a military museum stands on a hill.'],
  [5.0, 9.4, `It explains the *Mareth Line*, a belt of concrete bunkers that France built from ${BUILT[0]} to ${BUILT[1]}.`],
  [9.6, 14.0, 'France, then ruling Tunisia, feared an attack from ~Italian Libya~, so the line faced south-east.'],
  [14.2, 18.6, 'It ran some 40 to 50 km from the sea to the Matmata hills, behind the *Wadi Zigzaou*.'],
  [18.8, 23.2, `Along it: *${INFANTRY}* infantry casemates, *${ARTILLERY}* artillery casemates and *${COMMAND}* command posts.`],
  [23.4, 27.8, 'After France’s defeat in 1940, an Italian-German commission disarmed the line.'],
  [28.0, 32.4, 'After the Allied landings of November 1942, Axis forces rearmed it, now against the Allies.'],
  [32.6, 37.0, 'In March 1943 Italian and German troops under General Giovanni Messe held it against Britain’s Eighth Army.'],
  [37.2, 41.6, 'The Eighth Army went round it through the *Tebaga Gap*, to the west, and the Axis pulled back.'],
  [41.8, 46.2, 'Today the museum, run by Tunisia’s defence ministry, stands beside casemates of the line.'],
  [46.4, 50.8, 'Inside: maps, photographs, uniforms and weapons found here. Outside: guns and command posts.'],
  [51.0, 55.4, 'Find a casemate’s firing slit: it looks ~south-east~, the way its builders expected the enemy.'],
  [55.6, 60.0, 'From the hill, Medenine lies south-east, Gabès north-west, and the Matmata hills south-west.'],
  [60.2, 64.6, 'One line, three armies: built by France, held by the Axis, taken by the Allies.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    ctx.fillStyle = C.bg0; ctx.fillRect(0, 0, W, H);
    sceneMap(t);
    sceneMuseum(t);
    sceneCompass(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 36, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.line, '~': C.it } });
  },
});
