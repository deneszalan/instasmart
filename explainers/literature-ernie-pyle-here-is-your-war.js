// Explainer for literature-ernie-pyle-here-is-your-war (Tunisia 1943): the American columnist Ernie Pyle followed the
// US Army through the Tunisian campaign and wrote it as "the worm's-eye view": tired men, named, with their home
// towns. His columns became Here Is Your War (1943); he won the 1944 Pulitzer Prize for his war correspondence of
// 1943. Look: a typewriter by lamplight in an army tent, newsprint, a schematic map of Tunisia with his route, red
// pencil marks. Libre Franklin for captions and headlines, Space Mono for typed text.
//
// Facts:
// - Ernie Pyle, Here Is Your War (Henry Holt, 1943; archive.org/details/in.ernet.dli.2015.268113): left London for
//   Africa by convoy "one late October day"; chapters on the retreat around Sidi bou Zid and Sbeitla ("our cactus
//   patch near Sbeitla"), Gafsa ("the southern town we took back"), the final push ("I attached myself to the First
//   Infantry Division in the front lines before Mateur"), the victory (Bizerte "the most completely wrecked place I
//   had ever seen"); "A salute to the infantry ... I loved the infantry because they were the underdogs"; "I haven't
//   written anything about the 'Big Picture,' because I don't know anything about it. I only know what we see from our
//   worm's-eye view"; soldiers named with home towns and street addresses throughout (e.g. "Private ..., of 631 Payne
//   Avenue, Erie, Pennsylvania"); Tunisian Arabs appear at the edges, often in French officers' words ("One French
//   officer estimated that the Arabs of Gafsa were 85 per cent for the Germans"), and he notes that they "had been
//   cleaned out of the battle area by both sides", some "put in outdoor prison camps".
// - Wikipedia, "Ernie Pyle": born 3 August 1900 near Dana, Indiana; killed on Iejima (Ie Shima) on 18 April 1945;
//   his column ran in 42 newspapers in November 1942 and 122 by April 1943 (citing Ray Boomhower, The Soldier's
//   Friend), 400 daily and 300 weekly papers at his death. Wikipedia, "Pulitzer Prize for Correspondence": 1944,
//   Ernie Pyle, Scripps-Howard, "for distinguished war correspondence during the year 1943".
// - USHMM timeline: the Axis surrender in Tunisia on 13 May 1943.
// The map is schematic, from the places' coordinates; the soldiers are drawn as simple figures.
//
// Scene plan (65.2 s). Captions centred at y = 846.
//  A  0.0– 9.4  The tent, the typewriter, the column and the book.
//  B  9.6–27.8  His route on a map of Tunisia, February to May 1943.
//  C 28.0–46.2  The worm's-eye view: names and home towns; the infantry.
//  D 46.4–55.4  42 to 122 newspapers; the Pulitzer Prize.
//  E 55.6–65.2  Tunisians at the edges; his death in 1945.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg: '#1d1c16', tent: '#34332a', tent2: '#2a2922', ink: '#f4eedf', soft: 'rgba(244,238,223,0.76)', faint: 'rgba(244,238,223,0.22)',
  paper: '#efe8d6', paperInk: '#24221b', paperSoft: 'rgba(36,34,27,0.45)', pencil: '#c8553d', lamp: '#f2c46d', olive: '#7d8146',
  land: '#4c4a37', sea: '#22384a', blue: '#8fb8d8', grey: '#a29f93', panel: 'rgba(20,19,15,0.88)',
};
const HEAD = 'Libre Franklin', MONO = 'Space Mono';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- numbers ----------
const PAPERS_1942 = 42, PAPERS_1943 = 122, PULITZER = 1944, BORN = 1900, KILLED = 1945;
if (PAPERS_1943 - PAPERS_1942 !== 80 || PULITZER !== 1944 || KILLED - BORN !== 45) throw new Error('numbers');

// ---------- the map ----------
const OUTLINE = [[36.95, 8.76], [37.23, 9.22], [37.27, 9.87], [37.17, 10.2], [36.8, 10.18], [36.9, 10.4], [37.08, 11.04], [36.85, 11.1], [36.4, 10.62], [35.83, 10.64], [35.77, 10.83], [35.5, 11.07], [35.24, 11.11], [34.74, 10.76], [34.4, 10.35], [33.88, 10.1], [33.7, 10.4], [33.5, 11.11], [33.17, 11.57], [32.4, 11.45], [31.7, 10.6], [30.24, 9.53], [31.6, 8.9], [32.3, 8.3], [33.2, 7.7], [34.0, 7.9], [34.6, 8.25], [35.3, 8.3], [36.0, 8.35], [36.6, 8.35]];
const MS = 88, MX = (lon) => 60 + (lon - 7.5) * MS * 0.82, MY = (lat) => 120 + (37.5 - lat) * MS;
const P = (lat, lon) => [MX(lon), MY(lat)];
const STOPS = [
  { at: P(35.04, 9.49), name: 'Sidi Bou Zid', t0: 9.8, dx: 14, dy: 22, align: 'left' },
  { at: P(35.23, 9.13), name: 'Sbeitla', t0: 11.0, dx: -14, dy: -16, align: 'right' },
  { at: P(34.42, 8.78), name: 'Gafsa', t0: 14.4, dx: 14, dy: 0, align: 'left' },
  { at: P(37.04, 9.67), name: 'Mateur', t0: 18.8, dx: -14, dy: 8, align: 'right' },
  { at: P(37.27, 9.87), name: 'Bizerte', t0: 23.6, dx: 12, dy: -18, align: 'left' },
];
function tunisia(a) {
  A(a, () => {
    ctx.fillStyle = C.land; ctx.strokeStyle = 'rgba(244,238,223,0.45)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); OUTLINE.forEach(([la, lo], i) => { const [x, y] = P(la, lo); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill(); ctx.stroke();
    const [dx, dy] = P(33.8, 10.9); ctx.beginPath(); ctx.ellipse(dx, dy, 13, 10, 0, 0, TAU); ctx.fill(); ctx.stroke();
  });
}

// ---------- helpers ----------
function panel(x, y, w, h) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.stroke(); }
function soldier(x, y, s, color, a = 1) {
  A(a, () => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(x, y - 40 * s, 13 * s, 7 * s, 0, Math.PI, 0); ctx.fill(); // helmet
    ctx.beginPath(); ctx.arc(x, y - 34 * s, 8 * s, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 13 * s, y); ctx.quadraticCurveTo(x - 14 * s, y - 24 * s, x, y - 24 * s); ctx.quadraticCurveTo(x + 14 * s, y - 24 * s, x + 13 * s, y); ctx.closePath(); ctx.fill();
  });
}
function lantern(x, y, glow) {
  const g = ctx.createRadialGradient(x, y, 4, x, y, 260); g.addColorStop(0, `rgba(242,196,109,${0.45 * glow})`); g.addColorStop(1, 'rgba(242,196,109,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 260, y - 260, 520, 520);
  ctx.fillStyle = '#5a5340'; ctx.fillRect(x - 14, y - 34, 28, 8); ctx.fillRect(x - 12, y + 22, 24, 8);
  ctx.fillStyle = C.lamp; k.rrect(x - 11, y - 26, 22, 48, 8); ctx.fill();
}
function typewriter(x, y) {
  ctx.fillStyle = '#2f2f2b'; k.rrect(x - 190, y - 60, 380, 120, 18); ctx.fill();
  ctx.fillStyle = '#45453f'; k.rrect(x - 210, y - 96, 420, 40, 12); ctx.fill();
  ctx.fillStyle = '#6a685f';
  for (let r = 0; r < 3; r++) for (let i = 0; i < 10 - r; i++) { ctx.beginPath(); ctx.arc(x - 150 + r * 16 + i * 32, y - 20 + r * 26, 10, 0, TAU); ctx.fill(); }
}
function tentBg() {
  const g = ctx.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, C.tent2); g.addColorStop(1, C.tent);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 760);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3;
  for (let i = -2; i < 10; i++) { ctx.beginPath(); ctx.moveTo(CX, 0); ctx.lineTo(i * 110, 760); ctx.stroke(); }
}
/** A sheet of paper with typed lines appearing up to fraction f. */
function sheet(x, y, w, h, lines, f, { size = 24 } = {}) {
  ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(x + w - 6, y, 6, h);
  // typed line by line: each whole line is drawn (so it can be translated) and revealed left to right
  font(400, size, MONO);
  const widths = lines.map((l) => (l ? ctx.measureText(l).width : 0));
  const total = widths.reduce((a, b) => a + b, 0);
  let shown = total * clamp(f);
  lines.forEach((l, i) => {
    if (!l) return;
    const show = Math.min(widths[i], shown); shown -= widths[i];
    if (show <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x + 30, y + 20 + i * size * 1.55, show, size * 1.55); ctx.clip();
    text(l, x + 30, y + 46 + i * size * 1.55, { align: 'left', color: C.paperInk });
    ctx.restore();
  });
}

// ---------- A ----------
function sceneTent(t) {
  const a = span(t, 0, 9.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    tentBg();
    lantern(700, 230, 0.8 + 0.2 * Math.sin(t * 5));
    sheet(212, 150, 440, 330, ['ERNIE PYLE', 'Scripps-Howard', 'Tunisia, 1943', '', 'Here is your war ...'], seg(t, 0.6, 4.2), { size: 28 });
    typewriter(CX, 560);
    A(seg(t, 5.2, 5.8), () => {
      // the book, drawn plainly
      ctx.save(); ctx.translate(150, 360); ctx.rotate(-0.08);
      ctx.fillStyle = '#6f3d2e'; k.rrect(-80, -120, 160, 240, 8); ctx.fill();
      ctx.fillStyle = C.lamp; ctx.fillRect(-60, -86, 120, 3); ctx.fillRect(-60, 70, 120, 3);
      font(700, 22, HEAD); text('HERE IS', 0, -50, { align: 'center', color: C.paper }); text('YOUR WAR', 0, -20, { align: 'center', color: C.paper });
      font(400, 18, MONO); text('Ernie Pyle', 0, 30, { align: 'center', color: C.paper }); text('1943', 0, 56, { align: 'center', color: C.paper });
      ctx.restore();
    });
  });
}

// ---------- B: the route ----------
function sceneRoute(t) {
  const a = span(t, 9.4, 28.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = C.sea; ctx.fillRect(0, 0, W, 760);
    tunisia(1);
    font(400, 22, MONO); text('schematic map', 820, 730, { align: 'right', color: C.soft });
    // the route so far
    let last = null;
    STOPS.forEach((s, i) => {
      const on = seg(t, s.t0, s.t0 + 0.8);
      if (on <= 0) return;
      if (last) {
        ctx.strokeStyle = C.pencil; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(lerp(last[0], s.at[0], eio(on)), lerp(last[1], s.at[1], eio(on))); ctx.stroke(); ctx.setLineDash([]);
      }
      A(on, () => {
        ctx.fillStyle = C.pencil; ctx.beginPath(); ctx.arc(s.at[0], s.at[1], 8, 0, TAU); ctx.fill();
        font(600, 24, HEAD); text(s.name, s.at[0] + s.dx, s.at[1] + s.dy, { align: s.align, color: C.ink });
      });
      last = s.at;
    });
    // the month card on the right
    const cards = [
      [9.8, 18.6, 'FEBRUARY 1943', 'Retreat from Sidi Bou Zid', 'and Sbeitla, central Tunisia'],
      [14.4, 18.6, 'MARCH 1943', 'Gafsa, retaken in the south', ''],
      [18.8, 23.4, 'APRIL–MAY 1943', 'With the 1st Infantry Division', 'in the hills before Mateur'],
      [23.6, 28.0, 'MAY 1943', 'Bizerte and Tunis fall;', 'the Axis surrenders on 13 May'],
    ];
    for (const [a0, a1, head, l1, l2] of cards) {
      A(span(t, a0 + 0.3, a1, 0.4, 0.3), () => {
        const y = a0 === 14.4 ? 470 : 300;
        panel(430, y - 50, 400, 140);
        font(700, 30, HEAD); text(head, 452, y - 12, { align: 'left', color: C.lamp });
        font(500, 24, HEAD); text(l1, 452, y + 26, { align: 'left', color: C.ink }); if (l2) text(l2, 452, y + 58, { align: 'left', color: C.ink });
      });
    }
  });
}

// ---------- C: the worm's-eye view ----------
function sceneWorm(t) {
  const a = span(t, 27.8, 46.4, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    tentBg();
    // the Big Picture: a map, crossed out in pencil
    const big = seg(t, 28.2, 29.0) * (1 - seg(t, 32.2, 32.8));
    A(big, () => {
      ctx.save(); ctx.translate(-30, -40); ctx.scale(0.62, 0.62); ctx.translate(240, 120); tunisia(0.9); ctx.restore();
      font(700, 32, HEAD); text('THE “BIG PICTURE”', 470, 240, { align: 'left', color: C.ink });
      font(400, 22, MONO); text('armies, fronts, maps', 470, 280, { align: 'left', color: C.soft });
      const f = seg(t, 29.4, 30.2);
      ctx.strokeStyle = C.pencil; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(460, 260); ctx.lineTo(lerp(460, 800, f), 260); ctx.stroke();
      A(seg(t, 30.0, 30.6), () => {
        soldier(560, 620, 2.2, C.grey); soldier(660, 630, 2.0, C.grey);
        font(700, 32, HEAD); text('THE WORM’S-EYE VIEW', 470, 380, { align: 'left', color: C.lamp });
      });
    });
    // what he wrote about: a typed sheet, with names and home towns underlined
    A(seg(t, 32.6, 33.2) * (1 - seg(t, 41.4, 41.8)), () => {
      const lines = ['Tired men. Mail. Mud. Fear.', 'Foxholes and graves.', '', 'Private ____, of ____ Street,', '____, Pennsylvania.', 'Sergeant ____, of ____,', 'Oklahoma ...'];
      sheet(102, 140, 660, 480, lines, seg(t, 33.0, 39.6), { size: 30 });
      A(seg(t, 37.6, 38.2), () => {
        ctx.strokeStyle = C.pencil; ctx.lineWidth = 4;
        for (const [x0, x1, i] of [[132, 690, 3], [132, 560, 4], [132, 600, 5]]) { const y = 140 + 46 + i * 46.5 + 18; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
        font(600, 24, HEAD); text('names, home towns, streets', 432, 660, { align: 'center', color: C.pencil });
        font(400, 22, MONO); text('(example lines, not quotations)', 432, 700, { align: 'center', color: C.soft });
      });
    });
    // the infantry
    A(seg(t, 41.8, 42.4), () => {
      for (let i = 0; i < 7; i++) { const u = ((t - 41.8) * 0.04 + i / 7) % 1; soldier(lerp(-40, 900, u), 640 - Math.sin(u * Math.PI) * 60, 1.1, 'rgba(162,159,147,0.8)'); }
      panel(70, 230, W - 140, 220);
      font(500, 34, HEAD); text('“I loved the infantry because', CX, 300, { align: 'center', color: C.ink });
      text('they were the underdogs.”', CX, 346, { align: 'center', color: C.ink });
      font(400, 22, MONO); text('Ernie Pyle, Here Is Your War, 1943', CX, 406, { align: 'center', color: C.lamp });
    });
  });
}

// ---------- D: reach and the prize ----------
function paperIcon(x, y, on) {
  ctx.fillStyle = on ? C.paper : 'rgba(239,232,214,0.14)'; ctx.fillRect(x, y, 26, 32);
  if (on) { ctx.fillStyle = C.paperSoft; ctx.fillRect(x + 4, y + 5, 18, 4); ctx.fillRect(x + 4, y + 13, 18, 2); ctx.fillRect(x + 4, y + 19, 18, 2); ctx.fillRect(x + 4, y + 25, 12, 2); }
}
function sceneReach(t) {
  const a = span(t, 46.2, 55.6, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, 760);
    font(700, 34, HEAD); text('NEWSPAPERS RUNNING HIS COLUMN', 48, 130, { align: 'left', color: C.ink });
    const n = Math.round(lerp(PAPERS_1942, PAPERS_1943, eio(seg(t, 47.8, 50.4))));
    const shown = seg(t, 46.6, 47.4) > 0 ? n : 0;
    for (let i = 0; i < 130; i++) { const c = i % 13, r = Math.floor(i / 13); paperIcon(70 + c * 56, 170 + r * 42, i < shown); }
    A(seg(t, 46.8, 47.4), () => {
      font(700, 40, HEAD); text(t < 48 ? 'NOVEMBER 1942: 42' : n >= PAPERS_1943 ? 'APRIL 1943: 122' : '…', 48, 620, { align: 'left', color: C.lamp });
      font(400, 22, MONO); text('figures from his biographer, Ray Boomhower', 50, 664, { align: 'left', color: C.soft });
    });
    A(seg(t, 51.0, 51.6), () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 100, W, 660);
      ctx.fillStyle = C.lamp; ctx.beginPath(); ctx.arc(CX, 330, 110, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#b8862f'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(CX, 330, 92, 0, TAU); ctx.stroke();
      font(700, 34, HEAD); text('1944', CX, 330, { align: 'center', color: C.paperInk });
      font(700, 36, HEAD); text('THE PULITZER PRIZE', CX, 500, { align: 'center', color: C.ink });
      font(400, 23, MONO); text('“for distinguished war correspondence', CX, 552, { align: 'center', color: C.soft });
      text('during the year 1943”', CX, 586, { align: 'center', color: C.soft });
    });
  });
}

// ---------- E: Tunisians at the edges; 1945 ----------
function sceneEdges(t) {
  const a = span(t, 55.4, 65.2, 0.5, 0);
  if (a <= 0) return;
  A(a, () => {
    tentBg();
    const f = seg(t, 60.0, 60.8);
    A(1 - f, () => {
      sheet(232, 170, 400, 420, ['Americans, named.', 'Their towns.', 'Their streets.', '', '...'], 1, { size: 26 });
      for (const [x, y] of [[120, 300], [150, 560], [760, 260], [740, 520], [110, 440], [770, 400]]) soldier(x, y, 1.0, 'rgba(162,159,147,0.55)');
      font(600, 26, HEAD); text('Tunisians: at the edges of the page', CX, 660, { align: 'center', color: C.ink });
      font(400, 22, MONO); text('often seen through French officers’ eyes', CX, 700, { align: 'center', color: C.soft });
    });
    A(f, () => {
      panel(150, 250, 564, 300);
      font(700, 44, HEAD); text('ERNIE PYLE', CX, 330, { align: 'center', color: C.ink });
      font(400, 26, MONO); text('1900–1945', CX, 386, { align: 'center', color: C.lamp });
      text('killed on Ie Shima, off Okinawa,', CX, 440, { align: 'center', color: C.soft });
      text('18 April 1945', CX, 476, { align: 'center', color: C.soft });
    });
  });
}

const CUES = [
  [0.4, 4.8, 'Tunisia, early 1943: the American columnist *Ernie Pyle* follows the US Army to the front.'],
  [5.0, 9.4, 'His columns run in American newspapers; in 1943 they become a book, *Here Is Your War*.'],
  [9.6, 14.0, 'February 1943: he retreats with the Americans from Sidi Bou Zid and Sbeitla.'],
  [14.2, 18.6, 'March: Gafsa, retaken in the south. Then the final push, in the hills of the north.'],
  [18.8, 23.2, 'He lives with the 1st Infantry Division, in the front lines before Mateur.'],
  [23.4, 27.8, 'May 1943: Bizerte and Tunis fall, and the Axis armies in Africa surrender.'],
  [28.0, 32.4, 'He leaves the “Big Picture” to others. His is the ~worm’s-eye view~.'],
  [32.6, 37.0, 'Tired men, mail, mud, fear and graves, told in the soldiers’ own words.'],
  [37.2, 41.6, 'He names them, with their home towns and often their street addresses.'],
  [41.8, 46.2, '“I loved the infantry because they were the underdogs,” he writes.'],
  [46.4, 50.8, 'Newspapers carrying his column: *42* in November 1942, *122* by April 1943.'],
  [51.0, 55.4, 'In 1944 he wins the *Pulitzer Prize* for his war correspondence of 1943.'],
  [55.6, 60.0, 'Tunisians stay at the edges of his book, often seen through French officers’ eyes.'],
  [60.2, 64.6, 'Pyle was killed in the Pacific in April 1945; his book keeps Tunisia’s soldiers by name.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, MONO],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    sceneTent(t); sceneRoute(t); sceneWorm(t); sceneReach(t); sceneEdges(t);
    const g = ctx.createLinearGradient(0, 740, 0, H); g.addColorStop(0, 'rgba(29,28,22,0)'); g.addColorStop(0.2, C.bg); g.addColorStop(1, '#141310');
    ctx.fillStyle = g; ctx.fillRect(0, 740, W, H - 740);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 36, weight: 500, family: HEAD, ink: C.ink, marks: { '*': C.lamp, '~': C.pencil } });
  },
});
