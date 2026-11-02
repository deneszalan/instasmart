// Explainer for literature-keith-douglas-alamein-to-zem-zem (Tunisia 1943): Keith Douglas (1920–1944), British poet
// and tank officer, fought from El Alamein across Libya, was wounded at Wadi Zem Zem in January 1943, fought again in
// Tunisia in 1943 and wrote his best-known poems there and then; his memoir Alamein to Zem Zem came out in 1946, after
// he was killed in Normandy on 9 June 1944. Look: a cream notebook page in pencil and ink, a route drawn along a
// schematic coast of North Africa, Douglas's memoir as a plain drawn book (not its real cover), a photograph left in
// the sand, and blue forget-me-nots. No body is drawn. Crimson Pro for titles and the quoted line, IBM Plex Mono for
// the notebook labels and captions.
//
// Facts:
// - Merton College, Oxford, "Captain Keith Castellain Douglas": born 24 January 1920 in Tunbridge Wells; 2nd
//   Derbyshire Yeomanry, attached to the Nottinghamshire (Sherwood Rangers) Yeomanry; killed in action 9 June 1944,
//   aged 24; buried at Tilly-sur-Seulles War Cemetery, Calvados.
// - CWGC, "Remembering the poets of World War Two": From Alamein to Zem Zem, "one of the most expressive descriptions
//   of the North Africa campaign"; Vergissmeinnicht follows a photo of Steffi, a German tank crewman's sweetheart,
//   found beside his body; Douglas was killed in June 1944, three days after D-Day, near Tilly-sur-Seulles, by mortar
//   fire on a reconnaissance on foot.
// - Sherwood Rangers Yeomanry, "Keith Douglas": at El Alamein (from 24 October 1942) he left divisional HQ without
//   orders and reported to his regiment; badly wounded at the battle of Zem Zem; the book about the regiment was
//   published after the war.
// - PN Review 47 (1986), introduction by Desmond Graham: Douglas recovered at a hospital from "the wounds he received
//   at Wadi Zem Zem in January 1943"; there he wrote the first of the war poems on which his reputation rests.
// - New Zealand official history (NZETC) and others: Wadi Zem Zem lies in Tripolitania, Libya, on the Buerat line
//   the Eighth Army broke on 15 January 1943; Tripoli fell on 23 January.
// - British Academy, Tim Kendall, "The Vision of Keith Douglas" (Chatterton Lecture, 2001): Alamein to Zem Zem is his
//   prose memoir of the desert campaign; "Vergissmeinnicht" lingers over a three-week-dead German soldier, Steffi is
//   the girl in his photograph; the gunner "hit my tank with one / like the entry of a demon"; "How to Kill".
// - Engelsberg Ideas (B. Appleyard, 2025) quotes the line "For here the lover and killer are mingled".
// - BYU Library exhibit "Anthem for Doomed Youth": Douglas's "Aristocrats" is dated "Tunisia 1943" (an earlier
//   version, "Sportsmen", "Tunisia [May-June] 1943"), with the lines "How can I live among this gentle /
//   obsolescent breed of heroes, and not weep?".
// - Wikipedia, "Keith Douglas" and "Alamein to Zem Zem": the memoir was first published in 1946 by Editions Poetry
//   London, illustrated with his own drawings; he returned to England in December 1943.
// The map is schematic.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  Keith Douglas, poet and tank officer; El Alamein, October 1942.
//  B  9.6–27.8  Across Libya; wounded at Wadi Zem Zem, January 1943; the memoir, 1946, with his drawings.
//  C 28.0–55.4  Tunisia, 1943: "Vergissmeinnicht" and "Aristocrats".
//  D 55.6–64.6  England, December 1943; Normandy, 9 June 1944.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  paper: '#efe5cf', paper2: '#e4d6b8', ink: '#2b2620', soft: 'rgba(43,38,32,0.68)', faint: 'rgba(43,38,32,0.18)', rule: 'rgba(91,143,214,0.22)',
  pencil: '#6b6358', blue: '#4f84cf', ochre: '#b07a32', red: '#a8442f', sand: '#d9c39a',
};
const SERIF = 'Crimson Pro', MONO = 'IBM Plex Mono';

let k, ctx;
const font = (w, s, f = MONO) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- a schematic coast of North Africa, Tunisia to Egypt ----------
const P = (lon, lat) => [52 + (lon - 8.4) * 33.5, 290 + (37.6 - lat) * 44];
const COAST = [[9.0, 37.2], [9.87, 37.27], [10.3, 36.9], [11.05, 37.05], [10.6, 36.4], [10.64, 35.83], [11.1, 35.2], [10.76, 34.74], [10.1, 33.88], [10.9, 33.8], [11.6, 33.15], [13.18, 32.89], [15.1, 32.4], [15.4, 31.6], [16.6, 31.2], [18.5, 30.4], [19.2, 30.3], [20.07, 32.12], [21.7, 32.9], [22.6, 32.76], [23.96, 32.08], [25.15, 31.57], [27.24, 31.35], [28.95, 30.83], [29.92, 31.2], [31.0, 31.5]];
const PLACES = { alamein: [28.95, 30.83], zemzem: [15.35, 31.25], tripoli: [13.18, 32.89], tunisia: [10.3, 35.6] };
const XY = Object.fromEntries(Object.entries(PLACES).map(([n, [lo, la]]) => [n, P(lo, la)]));
// the route, pencilled west along the coast
const ROUTE = [XY.alamein, P(27.24, 31.1), P(25.0, 31.4), P(23.9, 31.9), P(21.5, 32.5), P(20.0, 31.8), P(19.0, 30.5), P(16.6, 31.0), XY.zemzem];
const ROUTE2 = [XY.zemzem, P(14.2, 32.5), XY.tripoli, P(11.4, 33.0), P(10.2, 34.0), XY.tunisia];

/** A wobbly pencil line along points, drawn to fraction g. */
function pencil(pts, g, col = C.pencil, w = 3, dash = null) {
  if (g <= 0) return;
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let left = lens.reduce((a, b) => a + b, 0) * clamp(g);
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 0; i < lens.length && left > 0; i++) {
    const f = Math.min(1, left / lens[i]);
    ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f));
    left -= lens[i];
  }
  ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
}

function coastMap(a) {
  A(a, () => {
    // hatched sea along the coast, as in a pencil sketch
    ctx.strokeStyle = 'rgba(79,132,207,0.25)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < COAST.length - 1; i++) {
      const [x1, y1] = P(...COAST[i]), [x2, y2] = P(...COAST[i + 1]);
      for (let j = 0; j < 4; j++) { const f = j / 4; const x = lerp(x1, x2, f), y = lerp(y1, y2, f); ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + 8, y - 22); ctx.stroke(); }
    }
    pencil(COAST.map((p) => P(...p)), 1, C.ink, 2.5);
    font(500, 22); text('MEDITERRANEAN SEA', P(19.5, 34.9)[0], P(19.5, 34.9)[1], { align: 'center', color: C.blue, spacing: '3px' });
    for (const [name, lon, lat] of [['TUNISIA', 9.4, 34.4], ['LIBYA', 21.0, 29.6], ['EGYPT', 28.4, 29.6]]) { font(500, 21); text(name, ...P(lon, lat), { align: 'center', color: C.soft, spacing: '2px' }); }
    font(400, 20); text('schematic map', 52, 660, { color: C.soft });
  });
}
function dot(n, name, { dx = 0, dy = -26, align = 'center', col = C.ink } = {}) {
  const [x, y] = XY[n];
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
  font(600, 22);
  const tw = ctx.measureText(name).width, bx = align === 'center' ? x + dx - tw / 2 : align === 'left' ? x + dx : x + dx - tw;
  ctx.fillStyle = 'rgba(239,229,207,0.85)'; ctx.fillRect(bx - 4, y + dy - 14, tw + 8, 28);
  text(name, x + dx, y + dy, { align, color: col });
}

/** A forget-me-not: five round blue petals and a yellow eye. */
function flower(x, y, r, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.blue;
    for (let i = 0; i < 5; i++) { const ang = -Math.PI / 2 + i * TAU / 5; ctx.beginPath(); ctx.arc(x + Math.cos(ang) * r * 0.62, y + Math.sin(ang) * r * 0.62, r * 0.48, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#f1d36b'; ctx.beginPath(); ctx.arc(x, y, r * 0.26, 0, TAU); ctx.fill();
  });
}

/** A simple standing figure with a beret, in pencil. */
function figure(x, y, s) {
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3 * s; ctx.fillStyle = C.paper;
  ctx.beginPath(); ctx.arc(x, y - 120 * s, 22 * s, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(x + 4 * s, y - 140 * s, 26 * s, 9 * s, -0.15, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 40 * s, y); ctx.lineTo(x - 34 * s, y - 80 * s); ctx.quadraticCurveTo(x, y - 98 * s, x + 34 * s, y - 80 * s); ctx.lineTo(x + 40 * s, y); ctx.stroke();
}

/** A plain drawn book (not the real cover). */
function book(x, y, w, h, title, sub) {
  ctx.fillStyle = '#3c4a3a'; k.rrect(x, y, w, h, 6); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 12, y, 6, h);
  font(600, 36, SERIF);
  title.split('\n').forEach((line, i) => text(line, x + w / 2 + 6, y + h * 0.28 + i * 44, { align: 'center', color: C.paper }));
  font(400, 20); text(sub, x + w / 2 + 6, y + h * 0.28 + 110, { align: 'center', color: C.sand });
}

/** A tank in side view, pencil outline only. */
function tankSketch(x, y, s, g = 1) {
  const pts = [[-90, 0], [90, 0], [110, -22], [80, -40], [-80, -40], [-110, -22], [-90, 0]].map(([a, b]) => [x + a * s, y + b * s]);
  pencil(pts, g, C.pencil, 2.5);
  pencil([[x - 45 * s, y - 40 * s], [x - 40 * s, y - 70 * s], [x + 30 * s, y - 70 * s], [x + 40 * s, y - 40 * s]], g, C.pencil, 2.5);
  for (let i = 0; i < 6; i++) { const cx = x + (-75 + i * 30) * s; if (g > 0.6) { ctx.strokeStyle = C.pencil; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, y - 12 * s, 10 * s, 0, TAU); ctx.stroke(); } }
}

// ---------- A ----------
function sceneIntro(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    font(600, 64, SERIF); text('Keith Douglas', CX, 150, { align: 'center', color: C.ink });
    font(500, 24); text('1920–1944 · poet · tank officer', CX, 204, { align: 'center', color: C.ochre });
    A(1 - seg(t, 4.6, 5.2), () => { figure(CX, 600, 1.9); });
    A(seg(t, 5.0, 5.8), () => {
      coastMap(1);
      dot('alamein', 'El Alamein', { col: C.red });
      font(500, 22); text('October 1942', XY.alamein[0], XY.alamein[1] + 32, { align: 'center', color: C.red });
      tankSketch(560, 700, 0.8, eio(seg(t, 6.0, 8.0)));
    });
  });
}

// ---------- B ----------
function sceneLibya(t) {
  A(span(t, 9.4, 28.0, 0.4, 0.4), () => {
    font(600, 44, SERIF); text('Alamein to Zem Zem', CX, 150, { align: 'center', color: C.ink });
    coastMap(1);
    dot('alamein', 'El Alamein');
    pencil(ROUTE, eio(seg(t, 9.8, 13.6)), C.red, 4, [10, 8]);
    A(seg(t, 13.4, 14.0), () => {
      dot('zemzem', 'Wadi Zem Zem, Libya', { col: C.red, dy: 36 });
    });
    // wounded by a mine, January 1943: a small red cross mark
    A(seg(t, 14.6, 15.2), () => {
      const [x, y] = XY.zemzem;
      ctx.strokeStyle = C.red; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x - 14, y - 14); ctx.lineTo(x + 14, y + 14); ctx.moveTo(x + 14, y - 14); ctx.lineTo(x - 14, y + 14); ctx.stroke();
      font(600, 23); const tw = ctx.measureText('wounded, January 1943').width;
      ctx.fillStyle = 'rgba(239,229,207,0.85)'; ctx.fillRect(x - tw / 2 - 4, y + 52, tw + 8, 28);
      text('wounded, January 1943', x, y + 66, { align: 'center', color: C.red });
    });
    // the memoir, 1946, with his drawings
    A(seg(t, 19.0, 19.8), () => {
      ctx.fillStyle = 'rgba(239,229,207,0.92)'; ctx.fillRect(40, 220, W - 80, 560);
      book(110, 300, 280, 380, 'Alamein\nto Zem Zem', 'prose memoir · 1946');
      font(500, 22); text('published after his death', 250, 720, { align: 'center', color: C.soft });
      A(seg(t, 23.6, 24.2), () => {
        ctx.fillStyle = C.paper; ctx.fillRect(440, 300, 330, 380); ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.strokeRect(440, 300, 330, 380);
        tankSketch(605, 470, 0.95, eio(seg(t, 24.2, 26.4)));
        // a little figure sketched beside it
        A(seg(t, 25.4, 26.2), () => { ctx.save(); ctx.globalAlpha *= 0.8; figure(520, 610, 0.55); ctx.restore(); });
        font(500, 21); text('drawn in his own hand', 605, 650, { align: 'center', color: C.pencil });
      });
    });
  });
}

// ---------- C: Tunisia, 1943 ----------
function sceneTunisia(t) {
  A(span(t, 27.8, 55.6, 0.4, 0.4), () => {
    // cue 7: on to Tunisia
    A(span(t, 27.8, 32.6, 0.3, 0.4), () => {
      font(600, 44, SERIF); text('Tunisia, 1943', CX, 150, { align: 'center', color: C.ink });
      coastMap(1);
      dot('alamein', 'El Alamein', { col: C.soft });
      pencil(ROUTE, 1, 'rgba(168,68,47,0.4)', 4, [10, 8]);
      pencil(ROUTE2, eio(seg(t, 28.4, 30.6)), C.red, 4, [10, 8]);
      dot('zemzem', 'Wadi Zem Zem', { col: C.soft, dy: 30 });
      A(seg(t, 30.4, 31.0), () => dot('tunisia', 'back in the fight, 1943', { col: C.red, dx: 56, dy: 18, align: 'left' }));
    });
    // cues 8–10: the battlefield revisited, the photograph
    A(span(t, 32.4, 46.4, 0.4, 0.4), () => {
      font(600, 50, SERIF); text('“Vergissmeinnicht”', CX, 150, { align: 'center', color: C.blue });
      font(500, 22); text('a poem of 1943', CX, 196, { align: 'center', color: C.soft });
      // sand, a ring of sandbags (a gun pit), long shadows; no body is drawn
      ctx.fillStyle = C.sand; ctx.beginPath(); ctx.ellipse(CX, 560, 360, 120, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.pencil; ctx.lineWidth = 3;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; ctx.beginPath(); ctx.ellipse(CX + Math.cos(a) * 190, 560 + Math.sin(a) * 66, 26, 13, a, 0, TAU); ctx.stroke(); }
      A(seg(t, 33.0, 33.6), () => { font(600, 26, SERIF); text('three weeks after the fight', CX, 300, { align: 'center', color: C.ink }); });
      // the photograph, lying in the sand
      A(seg(t, 37.4, 38.2), () => {
        ctx.save(); ctx.translate(CX + 30, 560); ctx.rotate(-0.12);
        ctx.fillStyle = '#fbf6ea'; ctx.fillRect(-90, -60, 180, 120);
        ctx.fillStyle = '#cdbfa4'; ctx.fillRect(-76, -48, 152, 76);
        // a portrait in outline only
        ctx.strokeStyle = C.pencil; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -16, 16, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-30, 28); ctx.quadraticCurveTo(0, -4, 30, 28); ctx.stroke();
        A(seg(t, 41.8, 42.6), () => { font(600, 20, SERIF); ctx.font = `italic 600 20px "${SERIF}"`; text('Steffi. Vergissmeinnicht', 0, 46, { align: 'center', color: C.ink }); });
        ctx.restore();
      });
      A(seg(t, 38.0, 38.6), () => {
        font(500, 22); text('a German gunner’s photograph', CX, 720, { align: 'center', color: C.ink });
      });
      A(seg(t, 42.4, 43.0), () => {
        font(600, 26, SERIF); text('Vergissmeinnicht = forget me not', CX, 360, { align: 'center', color: C.blue });
        for (let i = 0; i < 6; i++) flower(140 + i * 116, 460 + (i % 2) * 220, 18, seg(t, 42.6 + i * 0.2, 43.2 + i * 0.2));
      });
    });
    // cue 11: the line
    A(span(t, 46.2, 51.0, 0.4, 0.4), () => {
      for (let i = 0; i < 9; i++) flower(80 + i * 88, 640 + (i % 3) * 30, 14, 0.8);
      font(600, 46, SERIF); ctx.font = `italic 600 46px "${SERIF}"`;
      text('“For here the lover', CX, 330, { align: 'center', color: C.ink });
      text('and killer are mingled”', CX, 392, { align: 'center', color: C.ink });
      font(500, 22); text('Keith Douglas, “Vergissmeinnicht”, 1943', CX, 470, { align: 'center', color: C.soft });
    });
    // cue 12: Aristocrats
    A(span(t, 50.8, 55.6, 0.4, 0.4), () => {
      font(600, 50, SERIF); text('“Aristocrats”', CX, 170, { align: 'center', color: C.ochre });
      font(500, 22); text('dated Tunisia 1943', CX, 216, { align: 'center', color: C.soft });
      // three officers in pencil, fading as the poem mourns them
      for (let i = 0; i < 3; i++) A(seg(t, 51.2 + i * 0.3, 51.8 + i * 0.3) * (1 - 0.35 * i), () => figure(CX + (i - 1) * 170, 560, 1.15));
      A(seg(t, 52.0, 52.6), () => {
        font(600, 30, SERIF); ctx.font = `italic 600 30px "${SERIF}"`;
        text('“this gentle / obsolescent breed of heroes”', CX, 650, { align: 'center', color: C.ink });
      });
    });
  });
}

// ---------- D: England and Normandy ----------
function sceneEnd(t) {
  A(span(t, 55.4, 65.2, 0.4, 0), () => {
    // a small schematic map of the Channel
    const Q = (lon, lat) => [CX + (lon + 0.5) * 150, 420 + (49.8 - lat) * 200];
    A(1, () => {
      ctx.strokeStyle = 'rgba(79,132,207,0.3)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 24; i++) { const x = 90 + i * 27; ctx.beginPath(); ctx.moveTo(x, 350); ctx.lineTo(x + 10, 332); ctx.stroke(); }
      pencil([[60, 284], [300, 304], [560, 288], [810, 262]], 1, C.ink, 2.5);
      pencil([[60, 470], ...[[-1.9, 49.7], [-1.3, 49.65], [-1.15, 49.35], [-0.6, 49.34], [0.1, 49.3], [0.2, 49.45], [1.0, 49.95], [1.6, 50.2]].map(([a, b]) => Q(a, b)), [810, 330]], 1, C.ink, 2.5);
      font(500, 22); text('ENGLAND', 80, 258, { color: C.soft, spacing: '2px' });
      text('FRANCE', 640, 560, { color: C.soft, spacing: '2px' });
      text('schematic map', 60, 760, { color: C.soft });
    });
    A(seg(t, 55.8, 56.4) * (1 - seg(t, 59.8, 60.2)), () => {
      font(600, 40, SERIF); text('December 1943', 300, 150, { align: 'center', color: C.ink });
      font(500, 22); text('back to England, to prepare', 300, 196, { align: 'center', color: C.soft });
      text('the invasion of France', 300, 226, { align: 'center', color: C.soft });
    });
    const [tx, ty] = Q(-0.62, 49.18);
    A(seg(t, 60.2, 60.8), () => {
      pencil([[300, 300], [tx - 10, ty - 30], [tx, ty]], eio(seg(t, 60.2, 61.4)), C.red, 4, [10, 8]);
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(tx, ty, 8, 0, TAU); ctx.fill();
      font(600, 23); text('Tilly-sur-Seulles, Normandy', tx, ty + 40, { align: 'center', color: C.red });
      font(600, 40, SERIF); text('9 June 1944', CX, 150, { align: 'center', color: C.ink });
      font(500, 22); text('killed three days after D-Day, aged 24', CX, 196, { align: 'center', color: C.soft });
      A(seg(t, 61.8, 62.6), () => {
        for (let i = 0; i < 5; i++) flower(tx - 120 + i * 60, ty + 100 + (i % 2) * 16, 16, seg(t, 61.8 + i * 0.2, 62.4 + i * 0.2));
        font(500, 21); text('buried at Tilly-sur-Seulles War Cemetery', tx, ty + 176, { align: 'center', color: C.ink });
      });
    });
  });
}

// ---------- background: a notebook page ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.paper); lg.addColorStop(1, C.paper2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.rule; g.lineWidth = 1.5;
  for (let y = 120; y < 790; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.strokeStyle = 'rgba(168,68,47,0.25)'; g.beginPath(); g.moveTo(36, 0); g.lineTo(36, H); g.stroke();
}

const CUES = [
  [0.4, 4.8, '*Keith Douglas*, a British poet, was a tank officer in North Africa at 22.'],
  [5.0, 9.4, 'El Alamein, Egypt, October 1942: against orders, he drove to the front to join his tanks.'],
  [9.6, 14.0, 'With the Sherwood Rangers Yeomanry he crossed Libya, westwards towards Tunisia.'],
  [14.2, 18.6, 'In January 1943 he was ~wounded~ by a mine at *Wadi Zem Zem*, in Libya.'],
  [18.8, 23.2, 'His prose memoir of those months, *Alamein to Zem Zem*, came out in 1946.'],
  [23.4, 27.8, 'He drew as well as wrote: the book carries his own sketches.'],
  [28.0, 32.4, 'Back with his regiment, he fought in *Tunisia* in 1943 and wrote poems there.'],
  [32.6, 37.0, 'In ~“Vergissmeinnicht”~, soldiers return to a battlefield three weeks after the fight.'],
  [37.2, 41.6, 'They find the dead German gunner whose gun had hit the narrator’s tank, and his photograph.'],
  [41.8, 46.2, 'It is signed *Steffi*, with the German word ~Vergissmeinnicht~: forget me not.'],
  [46.4, 50.8, 'One man, both a lover and a killer: that is what the poem makes us look at.'],
  [51.0, 55.4, 'In *“Aristocrats”*, dated Tunisia 1943, he mourns officers he fought beside.'],
  [55.6, 60.0, 'In December 1943 he went back to England, to prepare for the invasion of France.'],
  [60.2, 64.6, 'He was killed in Normandy on *9 June 1944*, three days after D-Day. He was 24.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [SERIF, MONO],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneIntro(t);
    sceneLibya(t);
    sceneTunisia(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 850, maxW: 790, size: 42, lh: 50, weight: 500, family: SERIF, ink: C.ink, marks: { '*': C.ochre, '~': C.blue } });
  },
});
