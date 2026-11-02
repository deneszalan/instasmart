// Explainer for history-mareth-line-left-hook (Tunisia 1943): the Mareth Line in southern Tunisia, built by France
// in the 1930s against an attack from Italian Libya, held in March 1943 by the Italian First Army and German
// divisions against Britain's Eighth Army; Medenine (6 March), the frontal attack across the Wadi Zigzaou
// (20-23 March) and the outflanking "left hook" by the New Zealand Corps through the Tebaga Gap (26 March).
// Look: a night map of the Gulf of Gabès drawn like a staff officer's sketch, sand and slate, the line in
// red-orange; a cross-section of the wadi; the hook as a long dashed blue arrow. Oswald for titles and labels,
// Barlow for captions.
//
// Facts:
// - British official history: I. S. O. Playfair and C. J. C. Molony, The Mediterranean and Middle East, vol. IV
//   (HMSO, 1966), archive.org/details/med-middle-east-vol-4, pp. 325-354. "the French-built defences between
//   the sea and the Matmata hills, and based on the Wadi Zigzaou"; "The front between hills and coast was about
//   twenty-two miles long"; wire over about nineteen miles, "some 100,000 anti-tank and 70,000 anti-personnel
//   mines"; the wadi's banks 8 to 20 feet high, on average 60 feet wide. Medenine, 6 March: 30th Corps had 460
//   anti-tank guns; the Axis "lost between 44 and 56 tanks"; Rommel ended "what was to prove to be his last battle
//   in Africa". Plan: 30th Corps' main attack from the night 20th/21st March; the New Zealand Corps (New Zealand
//   Division, 8th Armoured Brigade, Leclerc's 'L' Force; about 25,600 men and 151 tanks) round the western flank
//   by Ksar Rhilane. By 17 March it was "about fifty miles from Foum Tatahouine"; 19/20 March a move of twenty to
//   thirty miles; 20/21 March "an advance of forty miles would end ten miles short of Tebaga Gap"; 21 March the
//   entrance ('Plum') seized. 50th Division crossed the wadi near the sea; fascines caught fire, the leading tank
//   stuck; 42 Valentines crossed early on 22 March but no anti-tank guns followed; a shower deepened the wadi;
//   the Germans pressed the bridgehead back; about 2 a.m. on 23 March Montgomery made the New Zealand Corps'
//   flanking manoeuvre the main stroke and sent 1st Armoured Division. 26 March: "At 4 p.m. the artillery began
//   its programme"; the time "let the infantry go in when the sun was blinding the enemy's eyes"; the Desert
//   Air Force in close support. 28 March: the enemy "settling into the Wadi Akarit positions"; "the battle of
//   Mareth was over"; 29 March the New Zealand Division through Gabès. Verdict: "The Tebaga Gap attack won the
//   battle but could not make a victory of it." A 1938 French reconnaissance (Catroux and Gautsch) had found the
//   route round.
// - Wikipedia, "Mareth Line": planned from 1934, funded in 1936, to protect Tunisia against an Italian invasion
//   from Libya; disarmed under an Italo-German commission after the armistice of June 1940. "Battle of the Mareth
//   Line": the Italian First Army under General Giovanni Messe with German divisions; Force L mostly African
//   troops from the Régiment de tirailleurs sénégalais du Tchad.
// Computed here: the hook's length from the official history's stages (50 + 25 + 40 + 10 miles ≈ 200 km), the
// front's 22 miles ≈ 35 km. The map is schematic: places from their coordinates, coast and hills simplified.
//
// Scene plan (65.2 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  The map; the line from the sea to the hills; built by France against Italian Libya.
//  B  9.6–18.6  Turned round: the Axis holds it; the Eighth Army arrives.
//  C 18.8–23.2  Medenine, 6 March.
//  D 23.4–37.0  The Wadi Zigzaou in cross-section; the frontal attack, 20-23 March.
//  E 37.2–55.4  The left hook to the Tebaga Gap; 26 March, 4 p.m.
//  F 55.6–65.2  The Axis falls back to the Wadi Akarit; the official history's verdict.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg: '#1b1f1c', sea: '#16303d', sea2: '#1d4152', land: '#3a3527', land2: '#463f2e', hill: '#6f6044', hillLine: 'rgba(214,190,140,0.55)',
  ink: '#f3eee2', soft: 'rgba(243,238,226,0.76)', faint: 'rgba(243,238,226,0.24)', grid: 'rgba(243,238,226,0.06)',
  line: '#e05a3a', allies: '#7fb6e6', axis: '#d8c7a2', gold: '#f2c062', mint: '#9fd8c8', panel: 'rgba(18,20,18,0.86)',
  water: '#3f7f9a', earth: '#6a5a3e', earth2: '#57492f', night: 'rgba(8,12,22,0.55)', sun: '#f6c66a',
};
const HEAD = 'Oswald', TXT = 'Barlow';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers (British official history) ----------
const FRONT_MILES = 22;
const HOOK_STAGES = [50, 25, 40, 10]; // Foum Tatahouine → assembly; 19/20 March (20-30); 20/21 March; to the gap
const MI = 1.609344;
const HOOK_KM = Math.round(HOOK_STAGES.reduce((a, b) => a + b, 0) * MI / 10) * 10; // ≈ 200
const FRONT_KM = Math.round(FRONT_MILES * MI); // 35
const NZ_MEN = 25600, NZ_TANKS = 151, MINES_AT = 100000, MEDENINE_TANKS = [44, 56];
if (HOOK_KM !== 200 || FRONT_KM !== 35 || NZ_MEN !== 25600 || MINES_AT !== 100000 || MEDENINE_TANKS[1] !== 56 || NZ_TANKS !== 151) throw new Error('numbers');

// ---------- the map: a projection with equal kilometres both ways ----------
const LON0 = 9.25, LAT0 = 34.2, PXKM = 4.22;
const X = (lon) => 40 + (lon - LON0) * 92.8 * PXKM;
const Y = (lat) => 120 + (LAT0 - lat) * 111 * PXKM;
const P = (lat, lon) => [X(lon), Y(lat)];
const PL = {
  gabes: P(33.88, 10.10), hamma: P(33.89, 9.80), mareth: P(33.62, 10.30), zarat: P(33.70, 10.37), medenine: P(33.35, 10.50),
  tata: P(32.93, 10.45), matmata: P(33.54, 9.97), toujane: P(33.47, 10.13), ghilane: P(32.99, 9.63), gap: P(33.62, 9.45),
  akarit: P(34.13, 10.02), djerba: P(33.80, 10.90),
};
const COAST = [[34.30, 10.03], [34.12, 10.05], [33.95, 10.08], [33.86, 10.13], [33.78, 10.25], [33.70, 10.39], [33.62, 10.50], [33.55, 10.60], [33.48, 10.72], [33.52, 10.90], [33.50, 11.08], [33.42, 11.20], [33.30, 11.40]].map(([a, o]) => P(a, o));
const MATMATA = [[33.66, 9.72], [33.55, 9.92], [33.42, 10.08], [33.25, 10.20], [33.05, 10.30], [32.85, 10.36]].map(([a, o]) => P(a, o));
const TEBAGA = [[33.77, 9.24], [33.73, 9.33], [33.69, 9.42]].map(([a, o]) => P(a, o));
const MELAB = [[33.58, 9.52], [33.62, 9.64]].map(([a, o]) => P(a, o));
const LINE = [[33.70, 10.37], [33.66, 10.33], [33.62, 10.29], [33.56, 10.22], [33.50, 10.15], [33.47, 10.11]].map(([a, o]) => P(a, o));
// the left hook, schematic: Foum Tatahouine, round the south of the hills, Ksar Rhilane, north to the gap
const HOOK = [PL.tata, P(32.86, 10.20), P(32.90, 9.90), PL.ghilane, P(33.22, 9.52), P(33.45, 9.42), PL.gap];
const HOOK_ON = [PL.gap, P(33.74, 9.62), PL.hamma];

/** Point at fraction f (0-1) along a polyline, and the polyline up to there. */
function along(pts, f) {
  const segs = []; let total = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); total += d; }
  let left = clamp(f) * total; const out = [pts[0]];
  for (let i = 0; i < segs.length; i++) {
    if (left >= segs[i]) { out.push(pts[i + 1]); left -= segs[i]; continue; }
    const u = left / segs[i]; out.push([lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]); break;
  }
  return out;
}

let mapBg = null;
function paintMap() {
  mapBg = document.createElement('canvas'); mapBg.width = W; mapBg.height = H;
  const g = mapBg.getContext('2d');
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  // land everywhere, then the sea north-east of the coast
  const lg = g.createLinearGradient(0, 0, 0, 800); lg.addColorStop(0, C.land2); lg.addColorStop(1, C.land);
  g.fillStyle = lg; g.fillRect(0, 0, W, 800);
  const sg = g.createLinearGradient(W, 0, 400, 500); sg.addColorStop(0, C.sea2); sg.addColorStop(1, C.sea);
  g.fillStyle = sg; g.beginPath(); g.moveTo(COAST[0][0], 0); COAST.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(W, COAST.at(-1)[1]); g.lineTo(W, 0); g.closePath(); g.fill();
  // Djerba
  g.fillStyle = C.land2; g.beginPath(); g.ellipse(PL.djerba[0], PL.djerba[1], 62, 50, -0.2, 0, TAU); g.fill();
  // coastline
  g.strokeStyle = 'rgba(243,238,226,0.45)'; g.lineWidth = 2.5; g.beginPath(); COAST.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  g.beginPath(); g.ellipse(PL.djerba[0], PL.djerba[1], 62, 50, -0.2, 0, TAU); g.stroke();
  // a faint grid, like a staff map
  g.strokeStyle = C.grid; g.lineWidth = 1;
  for (let x = 0; x < W; x += 54) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 800); g.stroke(); }
  for (let y = 0; y < 800; y += 54) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // hills: a broad band with hatching
  const band = (pts, w) => {
    g.strokeStyle = C.hill; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    g.strokeStyle = C.hillLine; g.lineWidth = 1.6;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], d = Math.hypot(x1 - x0, y1 - y0), n = Math.floor(d / 9);
      const nx = -(y1 - y0) / d, ny = (x1 - x0) / d;
      for (let j = 0; j < n; j++) { const u = j / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u); g.beginPath(); g.moveTo(x + nx * w * 0.42, y + ny * w * 0.42); g.lineTo(x + nx * w * 0.12, y + ny * w * 0.12); g.stroke(); g.beginPath(); g.moveTo(x - nx * w * 0.42, y - ny * w * 0.42); g.lineTo(x - nx * w * 0.12, y - ny * w * 0.12); g.stroke(); }
    }
  };
  band(MATMATA, 46); band(TEBAGA, 30); band(MELAB, 26);
  // the bottom strip under the map, for captions
  const bg2 = g.createLinearGradient(0, 760, 0, H); bg2.addColorStop(0, 'rgba(27,31,28,0)'); bg2.addColorStop(0.25, C.bg); bg2.addColorStop(1, '#121512');
  g.fillStyle = bg2; g.fillRect(0, 760, W, H - 760);
}

function town(p, name, { dx = 12, dy = 0, align = 'left', a = 1, size = 23 } = {}) {
  A(a, () => {
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, TAU); ctx.fill();
    font(500, size, TXT); text(name, p[0] + dx, p[1] + dy, { align, color: C.ink });
  });
}
function places(a, only = null) {
  const list = [
    ['gabes', 'Gabès', { dx: 12 }], ['mareth', 'Mareth', { dx: 14, dy: 6 }], ['medenine', 'Medenine', {}],
    ['tata', 'Foum Tatahouine', { dy: 0 }], ['hamma', 'El Hamma', { dy: 26, dx: 0, align: 'center' }], ['matmata', 'Matmata', { dx: -12, align: 'right', dy: 0 }],
    ['ghilane', 'Ksar Rhilane', { dy: 24, dx: -20 }],
  ];
  for (const [id, name, o] of list) if (!only || only.includes(id)) town(PL[id], name, { ...o, a });
}
function hillNames(a) {
  A(a, () => {
    font(500, 21, HEAD); ctx.save(); ctx.translate(PL.matmata[0] + 60, PL.matmata[1] + 150); ctx.rotate(-1.05);
    text('MATMATA HILLS', 0, 0, { align: 'center', color: 'rgba(243,238,226,0.62)', spacing: '3px' }); ctx.restore();
    text('DJEBEL TEBAGA', 100, TEBAGA[0][1] - 40, { align: 'center', color: 'rgba(243,238,226,0.62)', spacing: '2px' });
    font(500, 22, HEAD); text('GULF OF GABÈS', 620, 290, { align: 'center', color: 'rgba(200,225,235,0.6)', spacing: '3px' });
  });
}

/** The Mareth Line: a red band with blockhouses, drawn up to fraction f. */
function marethLine(f, a = 1, { faded = 0 } = {}) {
  if (f <= 0) return;
  A(a * (1 - 0.65 * faded), () => {
    const pts = along(LINE, f);
    ctx.strokeStyle = C.line; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    // blockhouses: little squares along the line, on its north-west side
    const n = 9;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n; if (u > f) break;
      const p = along(LINE, u).at(-1);
      ctx.fillStyle = C.ink; ctx.fillRect(p[0] - 11, p[1] - 15, 9, 9);
    }
  });
}
function arrow(pts, f, color, { width = 7, dash = [], head = 16, a = 1 } = {}) {
  if (f <= 0) return;
  A(a, () => {
    const p = along(pts, f);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(dash);
    ctx.beginPath(); p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]);
    if (p.length >= 2) {
      const [x1, y1] = p.at(-1), [x0, y0] = p.at(-2), ang = Math.atan2(y1 - y0, x1 - x0);
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x1 + Math.cos(ang) * head * 0.6, y1 + Math.sin(ang) * head * 0.6);
      ctx.lineTo(x1 + Math.cos(ang + 2.5) * head, y1 + Math.sin(ang + 2.5) * head); ctx.lineTo(x1 + Math.cos(ang - 2.5) * head, y1 + Math.sin(ang - 2.5) * head); ctx.closePath(); ctx.fill();
    }
  });
}
/** A unit block: a small rectangle with a cross (infantry) or an oval (armour), as on a staff map. */
function unit(x, y, color, kind = 'inf', a = 1) {
  A(a, () => {
    ctx.fillStyle = 'rgba(18,20,18,0.7)'; ctx.fillRect(x - 20, y - 13, 40, 26);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.strokeRect(x - 20, y - 13, 40, 26);
    ctx.lineWidth = 2;
    if (kind === 'inf') { ctx.beginPath(); ctx.moveTo(x - 20, y - 13); ctx.lineTo(x + 20, y + 13); ctx.moveTo(x + 20, y - 13); ctx.lineTo(x - 20, y + 13); ctx.stroke(); }
    else { ctx.beginPath(); ctx.ellipse(x, y, 13, 7, 0, 0, TAU); ctx.stroke(); }
  });
}
function title(t, a, big, small, { y = 160, x = 48, color = C.gold } = {}) {
  A(a, () => {
    font(600, 46, HEAD); text(big, x, y, { align: 'left', color: C.ink, spacing: '2px' });
    if (small) { font(500, 24, TXT); text(small, x + 2, y + 42, { align: 'left', color }); }
  });
}
function panel(x, y, w, h) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.stroke(); }

// ---------- A, B, C: the map ----------
const AXIS_UNITS = [[420, 322, 'inf'], [378, 356, 'inf'], [300, 390, 'arm'], [296, 340, 'arm'], [352, 302, 'inf']];
const ALLIED_UNITS = [[565, 452, 'inf'], [617, 480, 'inf'], [668, 512, 'arm'], [715, 478, 'arm']];
function sceneMap(t) {
  const on = span(t, 0, 23.4, 0.6, 0.4) + span(t, 37.0, 65.2, 0.5, 0);
  if (on <= 0) return;
  A(Math.min(1, on), () => {
    ctx.drawImage(mapBg, 0, 0);
    hillNames(1);
    places(seg(t, 0.8, 1.6));
    // A: the line drawn from the sea to the hills
    const lineF = eio(seg(t, 1.2, 3.6));
    const late = t > 37;
    marethLine(late ? 1 : lineF, 1, { faded: late ? seg(t, 56, 58) : 0 });
    A(seg(t, 2.2, 3.0) * (1 - seg(t, 9.0, 9.6)) * (late ? 0 : 1), () => {
      title(t, 1, 'THE MARETH LINE', 'Southern Tunisia · schematic map');
      font(600, 26, HEAD); text(`ABOUT ${FRONT_KM} KM`, 540, 350, { align: 'left', color: C.line, spacing: '1px' });
      font(500, 22, TXT); text('from the sea to the hills', 540, 380, { align: 'left', color: C.ink });
    });
    // A2: built against Italian Libya: a dashed arrow from the south-east, stopped at the line
    A(seg(t, 5.2, 5.8) * (1 - seg(t, 9.0, 9.6)), () => {
      arrow([[830, 700], [700, 600], [560, 470]], eio(seg(t, 5.4, 7.0)), C.axis, { dash: [14, 10], width: 6 });
      panel(440, 586, 390, 138);
      font(600, 28, HEAD); text('BUILT BY FRANCE, 1930s', 462, 622, { align: 'left', color: C.gold });
      font(500, 23, TXT); text('against an attack from Italian Libya', 462, 660, { align: 'left', color: C.ink });
      text('(off the map, to the south-east)', 462, 694, { align: 'left', color: C.soft });
    });
    // B: turned round. Axis units behind it; Eighth Army arriving
    A(seg(t, 9.8, 10.6) * (1 - seg(t, 22.8, 23.4)) + (late ? 1 - seg(t, 54.8, 56.4) : 0), () => {
      for (const [x, y, kind] of AXIS_UNITS) unit(x, y, C.axis, kind);
    });
    A(seg(t, 10.0, 10.8) * (1 - seg(t, 14.0, 14.4)), () => {
      title(t, 1, 'MARCH 1943: TURNED ROUND', 'Italian First Army (Messe) and German divisions', { color: C.axis });
    });
    const arrive = eio(seg(t, 14.4, 17.2));
    A(seg(t, 14.2, 14.6) * (1 - seg(t, 22.8, 23.4)) + (late ? 1 : 0), () => {
      ALLIED_UNITS.forEach(([x, y, kind]) => unit(lerp(x + 260, x, late ? 1 : arrive), lerp(y + 180, y, late ? 1 : arrive), C.allies, kind));
    });
    A(seg(t, 14.6, 15.2) * (1 - seg(t, 18.6, 19.0)), () => {
      title(t, 1, 'BRITAIN’S EIGHTH ARMY', 'General Bernard Montgomery, coming from Libya', { color: C.allies });
    });
    // C: Medenine, 6 March: amber arrows out of the hills stop at a screen of anti-tank guns
    A(seg(t, 18.8, 19.4) * (1 - seg(t, 22.8, 23.4)), () => {
      const f = eio(seg(t, 19.2, 21.2));
      const stop = 0.82;
      arrow([[PL.toujane[0] + 10, PL.toujane[1] + 10], [470, 520], [PL.medenine[0] - 18, PL.medenine[1] + 6]], Math.min(f, stop), C.axis, { width: 6 });
      arrow([[PL.matmata[0] + 40, PL.matmata[1] + 120], [450, 580], [PL.medenine[0] - 20, PL.medenine[1] + 30]], Math.min(f, stop), C.axis, { width: 6 });
      for (let i = 0; i < 7; i++) { const x = PL.medenine[0] - 80 + i * 7, y = PL.medenine[1] - 40 + i * 14; ctx.fillStyle = C.allies; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); }
      title(t, 1, '6 MARCH · MEDENINE', 'Field Marshal Erwin Rommel’s last battle in Africa', { color: C.axis });
      A(seg(t, 20.6, 21.2), () => {
        panel(440, 584, 390, 170);
        font(600, 34, HEAD); text('44–56', 462, 620, { align: 'left', color: C.axis });
        font(500, 22, TXT); text('Axis tanks lost,', 462, 656, { align: 'left', color: C.ink });
        text('by the British count', 462, 684, { align: 'left', color: C.ink });
        text('460 British anti-tank guns', 462, 726, { align: 'left', color: C.allies });
      });
    });
  });
}

// ---------- D: the Wadi Zigzaou in cross-section ----------
function figure(x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y - 30 * s, 7 * s, 0, TAU); ctx.fill();
  ctx.fillRect(x - 5 * s, y - 22 * s, 10 * s, 22 * s);
  ctx.fillRect(x - 5 * s, y, 4 * s, 12 * s); ctx.fillRect(x + 1 * s, y, 4 * s, 12 * s);
}
function sceneWadi(t) {
  const a = span(t, 23.2, 37.2, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const night = seg(t, 27.8, 28.6);
    // sky
    const sky = ctx.createLinearGradient(0, 120, 0, 520); sky.addColorStop(0, lerp(0, 1, night) > 0.5 ? '#0d1424' : '#2b3a44'); sky.addColorStop(1, '#3a3a33');
    ctx.fillStyle = sky; ctx.fillRect(0, 120, W, 420);
    // the ground: south bank (left, attackers) and north bank (right, defenders), the wadi between
    const G = 470, B = 640, L = 300, R = 520; // ground level, wadi bed, wadi edges
    ctx.fillStyle = C.earth;
    ctx.beginPath(); ctx.moveTo(0, G); ctx.lineTo(L, G); ctx.lineTo(L + 14, B); ctx.lineTo(R - 14, B); ctx.lineTo(R, G - 20); ctx.lineTo(W, G - 20); ctx.lineTo(W, 760); ctx.lineTo(0, 760); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.earth2; ctx.fillRect(0, 700, W, 60);
    // water in the bed, deeper after the rain
    const rain = seg(t, 32.6, 34.6);
    ctx.fillStyle = C.water; ctx.fillRect(L + 18, B - 28 - 26 * rain, R - L - 36, 28 + 26 * rain);
    // wire and mines on the north side
    ctx.strokeStyle = C.soft; ctx.lineWidth = 2;
    for (let x = R + 30; x < R + 190; x += 26) { ctx.beginPath(); ctx.arc(x, G - 34, 11, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = C.line; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(R + 40 + i * 30, G - 10, 4.5, 0, TAU); ctx.fill(); }
    // blockhouses on the north bank
    for (const x of [R + 240, R + 300]) { ctx.fillStyle = '#8c8574'; ctx.fillRect(x, G - 74, 46, 54); ctx.fillStyle = '#222'; ctx.fillRect(x + 8, G - 56, 30, 8); }
    // labels
    A(seg(t, 23.6, 24.4), () => {
      font(600, 40, HEAD); text('THE WADI ZIGZAOU', 48, 176, { align: 'left', color: C.ink, spacing: '2px' });
      font(500, 22, TXT); text('cross-section, schematic · the line’s moat', 50, 214, { align: 'left', color: C.soft });
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L - 24, G); ctx.lineTo(L - 24, B); ctx.stroke();
      font(500, 22, TXT); text('banks', L - 34, (G + B) / 2 - 12, { align: 'right', color: C.gold }); text('2.5–6 m', L - 34, (G + B) / 2 + 14, { align: 'right', color: C.gold });
      text('about 18 m wide', (L + R) / 2, B + 34, { align: 'center', color: C.gold });
      text('wire', R + 108, G - 72, { align: 'center', color: C.soft });
      text('mines', R + 160, G + 16, { align: 'center', color: C.line });
    });
    A(seg(t, 24.6, 25.4) * (1 - seg(t, 27.6, 28.0)), () => {
      panel(470, 560, 360, 104);
      font(600, 28, HEAD); text('ABOUT 100,000', 492, 594, { align: 'left', color: C.line });
      font(500, 22, TXT); text('anti-tank mines along the line', 492, 630, { align: 'left', color: C.ink });
    });
    // night and the crossing
    A(night, () => { ctx.fillStyle = C.night; ctx.fillRect(0, 120, W, 640); });
    A(seg(t, 28.0, 28.6) * (1 - seg(t, 32.2, 32.8)), () => {
      font(600, 30, HEAD); text('NIGHT OF 20–21 MARCH', 48, 270, { align: 'left', color: C.allies });
      font(500, 22, TXT); text('50th (Northumbrian) Division, near the sea', 50, 306, { align: 'left', color: C.ink });
    });
    const cross = seg(t, 28.4, 31.6);
    for (let i = 0; i < 6; i++) {
      const u = clamp(cross * 1.3 - i * 0.08);
      const back = seg(t, 33.6, 35.6);
      let x = lerp(80 + i * 34, R + 30 + i * 22, eio(u));
      x = lerp(x, 80 + i * 34, eio(back) * (u > 0 ? 1 : 0));
      const inWadi = x > L && x < R;
      const y = inWadi ? B - 30 : x >= R ? G - 20 : G;
      A(night > 0 ? 1 : 0, () => figure(x, y, 1.1, C.allies));
    }
    // a tank stuck in the water at the crossing
    A(seg(t, 29.4, 30.0), () => {
      const tx = L + 70, ty = B - 40 - 10 * rain;
      ctx.fillStyle = '#5c6b74'; k.rrect(tx, ty - 26, 92, 34, 8); ctx.fill(); ctx.fillRect(tx + 28, ty - 44, 34, 20);
      font(500, 22, TXT); text('the leading tank sticks fast', tx + 46, ty - 66, { align: 'center', color: C.ink });
    });
    // rain
    A(rain * (1 - seg(t, 36.2, 37.0)), () => {
      ctx.strokeStyle = 'rgba(180,205,230,0.45)'; ctx.lineWidth = 2;
      for (let i = 0; i < 70; i++) { const x = (i * 97.3 + t * 260) % W, y = 130 + ((i * 53.1 + t * 520) % 560); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 22); ctx.stroke(); }
    });
    A(seg(t, 32.8, 33.4), () => {
      font(600, 30, HEAD); text('22–23 MARCH', 48, 270, { align: 'left', color: C.axis });
      font(500, 22, TXT); text('rain, a counter-attack, the bridgehead lost', 50, 306, { align: 'left', color: C.ink });
    });
  });
}

// ---------- E, F: the left hook ----------
function sun(x, y, r, a) {
  A(a, () => {
    ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.sun; ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) { const ang = (i / 12) * TAU; ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * (r + 8), y + Math.sin(ang) * (r + 8)); ctx.lineTo(x + Math.cos(ang) * (r + 20), y + Math.sin(ang) * (r + 20)); ctx.stroke(); }
  });
}
function plane(x, y, s, color) {
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(x + 22 * s, y); ctx.lineTo(x - 18 * s, y - 4 * s); ctx.lineTo(x - 18 * s, y + 4 * s); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - 4 * s, y - 18 * s, 8 * s, 36 * s); ctx.fillRect(x - 20 * s, y - 8 * s, 5 * s, 16 * s);
}
function sceneHook(t) {
  if (t < 37.0) return;
  // the hook drawn, a counter of kilometres
  const f = eio(seg(t, 38.0, 45.6));
  arrow(HOOK, f, C.allies, { width: 7, dash: [16, 10], head: 20 });
  A(seg(t, 37.4, 38.2) * (1 - seg(t, 45.8, 46.4)), () => {
    title(t, 1, 'THE LEFT HOOK', 'New Zealand Corps · Lt-Gen. Bernard Freyberg', { color: C.allies });
    panel(440, 548, 390, 152);
    font(600, 26, HEAD); text('ABOUT 25,600 MEN, 151 TANKS', 460, 582, { align: 'left', color: C.allies });
    font(500, 23, TXT); text('New Zealanders and British,', 460, 618, { align: 'left', color: C.ink });
    text('with the Free French of', 460, 648, { align: 'left', color: C.ink });
    text('General Leclerc’s Force L', 460, 678, { align: 'left', color: C.ink });
  });
  A(seg(t, 41.8, 42.4) * (1 - seg(t, 50.6, 51.0)), () => {
    const km = Math.round(HOOK_KM * clamp((f - 0.0) / 1) / 10) * 10;
    panel(170, 500, 270, 100);
    font(600, 34, HEAD); text(km >= HOOK_KM ? 'ABOUT 200 KM' : 'ON THE MOVE', 190, 534, { align: 'left', color: C.allies });
    font(500, 22, TXT); text('from Foum Tatahouine', 190, 572, { align: 'left', color: C.ink });
    font(600, 24, HEAD); text('TEBAGA GAP', PL.gap[0] + 16, PL.gap[1] + 80, { align: 'left', color: C.gold });
  });
  // 23 March: the hook becomes the main attack; tanks follow
  A(seg(t, 46.4, 47.0) * (1 - seg(t, 50.6, 51.0)), () => {
    title(t, 1, '23 MARCH: THE MAIN ATTACK', 'an armoured division sent after the hook', { color: C.allies });
    arrow(HOOK, eio(seg(t, 47.0, 50.4)), 'rgba(127,182,230,0.55)', { width: 13, head: 24 });
  });
  // 26 March 4 p.m.: sun behind them, aircraft over
  const at = seg(t, 51.0, 51.6);
  A(at * (1 - seg(t, 55.0, 55.6)), () => {
    title(t, 1, '26 MARCH · 4 P.M.', 'the sun behind them, in the defenders’ eyes', { color: C.sun });
    sun(70, 470, 26, 1);
    for (let i = 0; i < 4; i++) { const u = ((t - 51) * 0.22 + i * 0.25) % 1; plane(lerp(60, 330, u), lerp(420, 250, u) + i * 14, 0.9, 'rgba(243,238,226,0.85)'); }
  });
  arrow(HOOK_ON, eio(seg(t, 52.2, 55.0)), C.allies, { width: 9, head: 22 });
  // F: the Axis falls back to the Wadi Akarit
  A(seg(t, 55.6, 56.2), () => {
    for (const [x, y] of [[420, 322], [378, 356], [352, 302]]) arrow([[x, y], [lerp(x, PL.akarit[0], 0.5), lerp(y, PL.akarit[1], 0.5) + 20], [PL.akarit[0] + (x - 400) * 0.3, PL.akarit[1] + 18]], eio(seg(t, 56.0, 58.6)), C.axis, { width: 5, head: 14 });
    town(PL.akarit, 'Wadi Akarit', { dx: 14, dy: -2 });
    A(1 - seg(t, 59.8, 60.4), () => title(t, 1, 'BY 28 MARCH', 'the Axis pulls back from the line', { color: C.axis, y: 600, x: 470 }));
  });
  A(seg(t, 60.4, 61.2), () => {
    panel(70, 470, W - 140, 250);
    font(500, 30, TXT);
    text('“The Tebaga Gap attack won the battle', CX, 540, { align: 'center', color: C.ink });
    text('but could not make a victory of it.”', CX, 584, { align: 'center', color: C.ink });
    font(500, 22, TXT); text('British official history, 1966: the Axis army got away to fight on', CX, 650, { align: 'center', color: C.soft });
  });
}

const CUES = [
  [0.4, 4.8, 'Southern Tunisia, March 1943: the *Mareth Line* runs from the sea to the Matmata hills.'],
  [5.0, 9.4, 'France built it in the 1930s to stop an attack from ~Italian Libya~, to the south-east.'],
  [9.6, 14.0, 'Now it faces the other way: Italy’s First Army and German divisions hold it.'],
  [14.2, 18.6, 'Coming from Libya: Britain’s *Eighth Army*, under General Bernard Montgomery.'],
  [18.8, 23.2, '6 March, Medenine: Field Marshal Erwin Rommel attacks first, and anti-tank guns stop him.'],
  [23.4, 27.8, 'The line’s moat is the *Wadi Zigzaou*: steep banks, wire, and some 100,000 anti-tank mines.'],
  [28.0, 32.4, 'Night of 20–21 March: Montgomery’s infantry cross near the sea, but few tanks get over.'],
  [32.6, 37.0, 'Rain deepens the water, and an Axis counter-attack retakes most of the bridgehead.'],
  [37.2, 41.6, 'Meanwhile the *New Zealand Corps*, with Free French troops, has gone ~round~ the hills.'],
  [41.8, 46.2, 'About 200 km through the desert, to the *Tebaga Gap*: the “left hook”.'],
  [46.4, 50.8, 'On 23 March Montgomery makes the hook his main attack, and sends tanks after it.'],
  [51.0, 55.4, '26 March, 4 p.m.: they attack with the sun behind them and aircraft overhead.'],
  [55.6, 60.0, 'The gap breaks. By 28 March the Axis is pulling back from the line to the Wadi Akarit.'],
  [60.2, 64.6, 'The hook won the battle, says Britain’s official history, but the Axis army got away.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!mapBg) paintMap();
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    sceneMap(t);
    sceneWadi(t);
    if (t >= 37.0) A(span(t, 37.0, 65.2, 0.5, 0), () => sceneHook(t));
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.gold, '~': C.mint } });
  },
});
