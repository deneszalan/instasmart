// Explainer for art-caravaggio-calling-light (Roma): how the light works in Caravaggio's The Calling of Saint
// Matthew (1599–1600) in San Luigi dei Francesi: one strong light from high up in a dark room (Giulio Mancini's
// description of his method), deep shadows with little in between (tenebrism), a beam from the upper right that
// runs along Jesus's pointing hand to the men at the table. Look: a schematic of the composition, not a copy of the
// painting: umber dark, figures as simple shapes with heads shaded like spheres, warm light. Cormorant Garamond for
// titles, Alegreya Sans for captions and labels.
//
// Facts:
// - Wikipedia, "The Calling of Saint Matthew": oil on canvas, 322 × 340 cm, 1599–1600, for the Contarelli Chapel in
//   San Luigi dei Francesi, where it still hangs; Matthew 9:9, Jesus sees Matthew at the custom house and says
//   "Follow me"; Matthew at a table with four other men; Jesus and Saint Peter have come in, Jesus points; a beam of
//   light lights the faces of the men at the table; art historians generally identify Matthew as the bearded man in
//   the centre, pointing to his chest ("Me?"); an alternative reading makes him the young man at the far left.
// - Wikipedia, "Contarelli Chapel": the contract was signed on 23 July 1599, the two side paintings installed by July
//   1600, the altarpiece by 1602; Caravaggio's first major public commission; the Calling hangs on the left wall;
//   each side painting is lit by a beam coming from the chapel's only source of natural light.
// - Web Gallery of Art commentary: the group is lit from a source at the upper right; the visible window, covered
//   with oilskin, gives only diffused light; the two figures on the left keep counting money; Christ's hand, like
//   Adam's in Michelangelo's Creation, bridges the void between the standing group and the seated one.
// - Wikipedia, "The Lute Player (Caravaggio)", quoting Giulio Mancini (Considerazioni sulla pittura, c. 1617–21):
//   Caravaggio's method was "a strong light from above with a single window and the walls painted black". Wikipedia,
//   "Giulio Mancini": physician, art collector and writer on the artists of his day. Wikipedia, "Caravaggio":
//   tenebrism, a heightened chiaroscuro, light to dark with little intermediate value. Wikipedia, "San Luigi dei
//   Francesi": the church near Piazza Navona.
// The figures, their places and the beam are a simplified schematic of the composition.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: the painting in the dark chapel; title.
//  B  9.2–18.4  The story: Jesus and Peter come in; the men at the table.
//  C 18.4–32.0  Mancini's description: one high window, black walls; tenebrism.
//  D 32.2–50.4  The beam: from the upper right, not from the painted window; the hand; "Me?"; the two counting.
//  E 50.6–55.0  The two blocks, bridged by the hand.
//  F 55.2–64.6  The chapel's one window; who is Matthew.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  black: '#0b0806', wall: '#241c15', lit: '#7a6448', light: '#f6dcab', ink: '#f3e6cf', soft: 'rgba(243,230,207,0.70)',
  faint: 'rgba(243,230,207,0.22)', skin: '#e9c79c', cloth: '#3a2e25', red: '#b53a2e', ochre: '#d29a46', gold: '#f2c35a',
  green: '#4f6b4a', blue: '#7fa6c9',
};
const TITLE = 'Cormorant Garamond', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the painting's frame (322 × 340 cm), and positions inside it as fractions ----------
const FW = 600, FH = Math.round((FW * 322) / 340), FX = (W - FW) / 2, FY = 150;
const P = (u, v) => [FX + u * FW, FY + v * FH];
// light from the upper right, a little toward us
const L = (() => { const v = [0.62, -0.55, 0.56]; const n = Math.hypot(...v); return v.map((x) => x / n); })();

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'In Rome’s church of *San Luigi dei Francesi* hangs Caravaggio’s *The Calling of Saint Matthew*.'],
  [4.8, 9.0, 'The painter made it in 1599–1600 for the Contarelli Chapel, his first big public commission.'],
  [9.2, 13.6, 'In the Gospel, Jesus sees the tax collector Matthew at his table and says: ‘Follow me.’'],
  [13.8, 18.2, 'Here Jesus and Saint Peter come in from the right. Jesus points at the men round a table.'],
  [18.4, 22.8, 'Giulio Mancini, a doctor who wrote about the painters of his day, described his method:'],
  [23.0, 27.4, '‘a strong light from above with a *single window* and the walls painted *black*’.'],
  [27.6, 32.0, 'Black walls bounce back almost no light, so shadows stay deep. This is ~tenebrism~.'],
  [32.2, 36.6, 'Here the light falls from high on the right, above Jesus, onto the faces at the table.'],
  [36.8, 41.2, 'Not from the painted window: the beam enters from outside the picture.'],
  [41.4, 45.8, 'Jesus’s hand points along the beam. A bearded man touches his chest, as if to say ‘Me?’'],
  [46.0, 50.4, 'Two men at the left keep counting money and never look up.'],
  [50.6, 55.0, 'Like Adam’s hand in Michelangelo’s *Creation of Adam*, it bridges the gap between the groups.'],
  [55.2, 59.6, 'Both side paintings in the chapel are lit as if from its one real window.'],
  [59.8, 64.2, 'Most historians see Matthew in the bearded man; some say he is the youth at the end.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createRadialGradient(W * 0.5, 420, 60, W * 0.5, 460, 760);
  lg.addColorStop(0, '#1a1410'); lg.addColorStop(1, C.black);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 19; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(200,160,110,${r() * 0.025})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1); }
}

// ---------- shading ----------
/** A head as a lit sphere: amb is the light bounced back from the room (0 for black walls). */
function head(x, y, r, { amb = 0.08, lit = 1, tint = C.skin, beard = false, hat = null } = {}) {
  const hx = x + L[0] * r * 0.55, hy = y + L[1] * r * 0.55;
  const g = ctx.createRadialGradient(hx, hy, r * 0.1, x - L[0] * r * 0.2, y - L[1] * r * 0.2, r * 1.15);
  const shade = (f) => { const c = parseInt(tint.slice(1), 16); const m = (v) => Math.round(clamp(v * f, 0, 255)); return `rgb(${m(c >> 16)},${m((c >> 8) & 255)},${m(c & 255)})`; };
  g.addColorStop(0, shade(lerp(amb, 1.05, lit)));
  g.addColorStop(0.55, shade(lerp(amb, 0.55, lit)));
  g.addColorStop(1, shade(amb));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (beard) { ctx.fillStyle = 'rgba(40,28,18,0.85)'; ctx.beginPath(); ctx.ellipse(x - r * 0.1, y + r * 0.55, r * 0.55, r * 0.45, 0, 0, Math.PI); ctx.fill(); }
  if (hat) { ctx.fillStyle = hat; ctx.beginPath(); ctx.ellipse(x, y - r * 0.75, r * 1.05, r * 0.38, -0.1, 0, TAU); ctx.fill(); }
}
function body(pts, col) { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([u, v]) => ctx.lineTo(...P(u, v))); ctx.closePath(); ctx.fill(); }

// ---------- the composition, schematic ----------
function painting(t, a, { beam = 1, amb = 0.08, dim = 0 } = {}) {
  A(a, () => {
    ctx.save(); ctx.beginPath(); ctx.rect(FX, FY, FW, FH); ctx.clip();
    // dark room
    ctx.fillStyle = C.wall; ctx.fillRect(FX, FY, FW, FH);
    // the lit band on the back wall: below a diagonal from the upper right
    A(beam, () => {
      const g = ctx.createLinearGradient(...P(1, 0.25), ...P(0.45, 0.6));
      g.addColorStop(0, 'rgba(246,220,171,0.6)'); g.addColorStop(1, 'rgba(246,220,171,0.0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(...P(1, 0.18)); ctx.lineTo(...P(0.55, 0.47)); ctx.lineTo(...P(0.42, 0.62)); ctx.lineTo(...P(1, 0.62)); ctx.closePath(); ctx.fill();
    });
    // the painted window, upper right, half shuttered
    ctx.fillStyle = '#5a4d3c'; ctx.fillRect(...P(0.5, 0.0), 0.3 * FW, 0.33 * FH);
    ctx.fillStyle = '#2a2018'; ctx.fillRect(...P(0.5, 0.0), 0.09 * FW, 0.33 * FH);
    ctx.strokeStyle = '#1b140f'; ctx.lineWidth = 5; ctx.strokeRect(...P(0.5, 0.0), 0.3 * FW, 0.33 * FH);
    ctx.beginPath(); ctx.moveTo(...P(0.69, 0.0)); ctx.lineTo(...P(0.69, 0.33)); ctx.moveTo(...P(0.59, 0.16)); ctx.lineTo(...P(0.8, 0.16)); ctx.stroke();
    // the table
    body([[0.03, 0.59], [0.5, 0.59], [0.5, 0.64], [0.03, 0.64]], '#5a4632');
    body([[0.05, 0.64], [0.48, 0.64], [0.48, 0.98], [0.05, 0.98]], '#2c2119');
    // the seated group (left), lit by the beam
    const lit = beam;
    body([[0.06, 0.5], [0.2, 0.52], [0.22, 0.62], [0.04, 0.64]], C.cloth);               // youth bent over the coins
    head(...P(0.12, 0.49), 21, { amb, lit: lit * 0.7 });
    body([[0.15, 0.45], [0.26, 0.46], [0.27, 0.6], [0.14, 0.6]], '#30261e');             // old man in spectacles
    head(...P(0.21, 0.43), 20, { amb, lit: lit * 0.75, tint: '#d9b48a' });
    body([[0.25, 0.47], [0.38, 0.47], [0.4, 0.6], [0.24, 0.6]], '#3d2f24');             // the bearded man
    head(...P(0.31, 0.42), 23, { amb, lit, beard: true, hat: '#1a1410' });
    body([[0.38, 0.48], [0.5, 0.49], [0.52, 0.62], [0.37, 0.62]], '#8c3a2a');           // youth in a plumed hat
    head(...P(0.45, 0.44), 20, { amb, lit, hat: '#d8cfc0' });
    body([[0.54, 0.55], [0.68, 0.55], [0.7, 0.88], [0.53, 0.88]], '#2b2420');           // youth on a stool, back to us
    head(...P(0.62, 0.5), 21, { amb, lit: lit * 0.8, hat: '#1e1712' });
    // coins
    for (const [u, v] of [[0.1, 0.605], [0.14, 0.61], [0.18, 0.605], [0.23, 0.608]]) { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.ellipse(...P(u, v), 7, 3, 0, 0, TAU); ctx.fill(); }
    // Jesus (behind) and Peter (in front), standing at the right
    body([[0.84, 0.4], [0.96, 0.4], [1.0, 1.0], [0.86, 1.0]], '#251c16');
    head(...P(0.9, 0.37), 22, { amb, lit: lit * 0.5 });
    body([[0.72, 0.46], [0.86, 0.46], [0.9, 1.0], [0.7, 1.0]], '#7a6a4a');
    head(...P(0.79, 0.41), 22, { amb, lit: lit * 0.6, beard: true });
    // Jesus's arm and hand, pointing along the beam
    ctx.strokeStyle = '#8c3a2a'; ctx.lineWidth = 15; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(...P(0.86, 0.42)); ctx.lineTo(...P(0.68, 0.41)); ctx.stroke();
    head(...P(0.665, 0.41), 9, { amb, lit });
    // the bearded man's hand at his chest
    head(...P(0.34, 0.5), 8, { amb, lit });
    A(dim, () => { ctx.fillStyle = 'rgba(11,8,6,0.6)'; ctx.fillRect(FX, FY, FW, FH); });
    ctx.restore();
    // frame
    ctx.strokeStyle = '#6a5235'; ctx.lineWidth = 10; ctx.strokeRect(FX - 5, FY - 5, FW + 10, FH + 10);
  });
}

// ---------- C: Mancini's studio ----------
function studio(t, a) {
  A(a, () => {
    const x0 = 150, y0 = 150, w = 564, h = 560;
    const black = eio(seg(t, 23.6, 25.6));
    const wall = `rgb(${Math.round(lerp(196, 22, black))},${Math.round(lerp(186, 18, black))},${Math.round(lerp(168, 14, black))})`;
    ctx.fillStyle = wall; ctx.fillRect(x0, y0, w, h);
    // the single high window, upper right, and its beam
    ctx.fillStyle = C.light; ctx.fillRect(x0 + w - 18, y0 + 30, 18, 120);
    ctx.fillStyle = 'rgba(246,220,171,0.28)';
    ctx.beginPath(); ctx.moveTo(x0 + w - 18, y0 + 30); ctx.lineTo(x0 + w - 18, y0 + 150); ctx.lineTo(x0 + 150, y0 + h); ctx.lineTo(x0 + 20, y0 + h); ctx.closePath(); ctx.fill();
    // floor and a sitter at a table
    ctx.fillStyle = '#3a2c20'; ctx.fillRect(x0, y0 + h - 20, w, 20);
    ctx.fillStyle = '#5a4632'; ctx.fillRect(x0 + 120, y0 + 380, 300, 18); ctx.fillRect(x0 + 140, y0 + 398, 12, 142); ctx.fillRect(x0 + 388, y0 + 398, 12, 142);
    ctx.fillStyle = C.cloth; ctx.beginPath(); ctx.moveTo(x0 + 220, y0 + 300); ctx.lineTo(x0 + 320, y0 + 300); ctx.lineTo(x0 + 330, y0 + 380); ctx.lineTo(x0 + 210, y0 + 380); ctx.closePath(); ctx.fill();
    const amb = lerp(0.5, 0.05, black);
    head(x0 + 270, y0 + 262, 46, { amb, lit: 1, beard: true });
    // labels
    font(700, 26); text('one window, high up', x0 + w - 30, y0 + 16, { align: 'right', base: 'middle', color: black > 0.5 ? C.light : '#3a2c20' });
    A(seg(t, 23.4, 24.0), () => { font(700, 26); text('walls painted black', x0 + 20, y0 + 36, { base: 'middle', color: black > 0.5 ? C.ochre : '#3a2c20' }); });
    font(600, 22); text('shadow side', x0 + 170, y0 + 262, { align: 'right', base: 'middle', color: black > 0.5 ? C.soft : '#3a2c20' });
    font(700, 34, TITLE); text('Mancini’s description', 52, 70, { base: 'middle' });
    font(500, 22); text('CONSIDERAZIONI SULLA PITTURA, c. 1617–21', 52, 106, { base: 'middle', color: C.soft, spacing: '2px' });
  });
}
function tenebrism(t, a) {
  A(a, () => {
    // the same head with white walls and with black walls
    const v = eout(seg(t, 27.8, 28.8));
    for (const [x, amb, lab, sub] of [[262, 0.5, 'white walls', 'soft shadows'], [602, 0.05, 'black walls', 'deep shadows']]) {
      ctx.fillStyle = amb > 0.2 ? '#c4baa8' : '#161210'; k.rrect(x - 150, 200, 300, 300, 14); ctx.fill();
      head(x, 340, 70 * v + 1, { amb, lit: 1, beard: true });
      font(700, 26); text(lab, x, 540, { align: 'center', base: 'middle', color: amb > 0.2 ? C.ink : C.ochre });
      font(500, 22); text(sub, x, 572, { align: 'center', base: 'middle', color: C.soft });
    }
    // a tone scale: light against dark, with little in between
    const x0 = 112, y0 = 640, w = 640, n = 16;
    for (let i = 0; i < n; i++) {
      const g = Math.round(lerp(12, 246, i / (n - 1)));
      ctx.fillStyle = `rgb(${g},${Math.round(g * 0.9)},${Math.round(g * 0.72)})`; ctx.fillRect(x0 + (i * w) / n, y0, w / n + 1, 36);
    }
    font(600, 22); text('dark', x0, y0 + 60, { base: 'middle', color: C.soft });
    text('light', x0 + w, y0 + 60, { align: 'right', base: 'middle', color: C.soft });
    text('tenebrism: mostly the two ends', x0 + w / 2, y0 + 60, { align: 'center', base: 'middle', color: C.ochre });
  });
}

// ---------- D/E/F: reading the beam ----------
function arrow(x1, y1, x2, y2, col, w = 3) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 14 * Math.cos(a - 0.4), y2 - 14 * Math.sin(a - 0.4)); ctx.lineTo(x2 - 14 * Math.cos(a + 0.4), y2 - 14 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
}
function chapelPlan(t, a) {
  A(a, () => {
    ctx.fillStyle = 'rgba(11,8,6,0.94)'; ctx.fillRect(0, 0, W, 780);
    font(700, 34, TITLE); text('The Contarelli Chapel', 52, 70, { base: 'middle' });
    font(500, 22); text('PLAN, SIMPLIFIED', 52, 106, { base: 'middle', color: C.soft, spacing: '2px' });
    const cx = 432, top = 230, w = 400, d = 380;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx - w / 2, top + d); ctx.lineTo(cx - w / 2, top); ctx.lineTo(cx + w / 2, top); ctx.lineTo(cx + w / 2, top + d); ctx.stroke();
    // the paintings on the three walls
    ctx.lineWidth = 12;
    ctx.strokeStyle = C.ochre; ctx.beginPath(); ctx.moveTo(cx - w / 2 + 8, top + 90); ctx.lineTo(cx - w / 2 + 8, top + 300); ctx.stroke();
    ctx.strokeStyle = C.red; ctx.beginPath(); ctx.moveTo(cx + w / 2 - 8, top + 90); ctx.lineTo(cx + w / 2 - 8, top + 300); ctx.stroke();
    ctx.strokeStyle = C.faint; ctx.beginPath(); ctx.moveTo(cx - 90, top + 8); ctx.lineTo(cx + 90, top + 8); ctx.stroke();
    font(600, 24);
    text('The Calling', cx - w / 2 - 14, top + 180, { align: 'right', base: 'middle', color: C.ochre });
    text('left wall', cx - w / 2 - 14, top + 210, { align: 'right', base: 'middle', color: C.soft });
    text('The Martyrdom', cx + w / 2 + 14, top + 180, { base: 'middle', color: C.red });
    text('right wall', cx + w / 2 + 14, top + 210, { base: 'middle', color: C.soft });
    text('altar: The Inspiration', cx, top + 44, { align: 'center', base: 'middle', color: C.soft });
    font(600, 24); text('lit as if by the chapel’s window', cx, top + d - 60, { align: 'center', base: 'middle', color: C.light });
    text('you stand here', cx, top + d + 30, { align: 'center', base: 'middle', color: C.soft });
  });
}

function sceneOpen(t) {
  const a = span(t, 0, 18.6, 0.6, 0.4);
  const reveal = eio(seg(t, 0.6, 3.4));
  painting(t, a, { beam: reveal, amb: 0.08 });
  A(span(t, 0, 9.4, 0.4, 0.4), () => {
    font(700, 38, TITLE); text('The Calling of Saint Matthew', 52, 66, { base: 'middle' });
    font(500, 22); text('CARAVAGGIO · 1599–1600 · SAN LUIGI DEI FRANCESI, ROME', 52, 104, { base: 'middle', color: C.soft, spacing: '1px' });
  });
  A(span(t, 13.8, 18.6, 0.4, 0.4), () => {
    font(700, 24);
    const [jx, jy] = P(0.9, 0.37), [px_, py_] = P(0.79, 0.41), [mx, my] = P(0.31, 0.42);
    text('Jesus', jx, jy - 40, { align: 'center', base: 'middle', color: C.light });
    text('Saint Peter', px_, py_ + 50, { align: 'center', base: 'middle', color: C.light });
    text('men at a table', mx - 30, FY + FH + 34, { align: 'center', base: 'middle', color: C.light });
    arrow(FX + FW, FY - 24, px_ - 20, FY - 24, C.ochre, 3);
    font(600, 22); text('they come in from the right', px_ - 34, FY - 24, { align: 'right', base: 'middle', color: C.ochre });
  });
  A(span(t, 9.2, 13.8, 0.4, 0.4), () => {
    font(700, 30, TITLE); text('Matthew 9:9', 52, 66, { base: 'middle', color: C.ochre });
    font(500, 22); text('“FOLLOW ME”', 52, 104, { base: 'middle', color: C.soft, spacing: '3px' });
  });
}
function sceneStudio(t) {
  studio(t, span(t, 18.4, 27.8, 0.5, 0.4));
  A(span(t, 27.6, 32.2, 0.5, 0.4), () => {
    tenebrism(t, 1);
    font(700, 40, TITLE); text('Tenebrism', 52, 70, { base: 'middle', color: C.ochre });
    font(500, 22); text('FROM THE ITALIAN TENEBROSO, ‘DARK’', 52, 106, { base: 'middle', color: C.soft, spacing: '2px' });
  });
}
function sceneBeam(t) {
  const a = span(t, 32.2, 55.4, 0.5, 0.4);
  painting(t, a, { beam: 1, amb: 0.06 });
  A(span(t, 32.2, 36.8, 0.4, 0.4), () => {
    arrow(...P(1.0, 0.02), ...P(0.6, 0.36), C.light, 5);
    arrow(...P(1.0, 0.12), ...P(0.5, 0.4), C.light, 3);
    font(700, 24); text('light from the upper right', P(1.0, 0)[0], FY - 44, { align: 'right', base: 'middle', color: C.light });
  });
  A(span(t, 36.8, 41.4, 0.4, 0.4), () => {
    const [x, y] = P(0.65, 0.16);
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 30, y - 30); ctx.lineTo(x + 30, y + 30); ctx.moveTo(x + 30, y - 30); ctx.lineTo(x - 30, y + 30); ctx.stroke();
    font(700, 24); text('painted window: not the source', x, FY - 24, { align: 'center', base: 'middle', color: C.red });
  });
  A(span(t, 41.4, 46.0, 0.4, 0.4), () => {
    arrow(...P(0.64, 0.41), ...P(0.38, 0.42), C.light, 4);
    font(700, 26, TITLE); text('‘Me?’', P(0.31, 0.42)[0], P(0.31, 0.42)[1] - 56, { align: 'center', base: 'middle', color: C.light });
  });
  A(span(t, 46.0, 50.6, 0.4, 0.4), () => {
    const [x, y] = P(0.16, 0.6);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y - 30, 100, 70, 0, 0, TAU); ctx.stroke();
    font(700, 24); text('still counting', x, FY + FH + 34, { align: 'center', base: 'middle', color: C.gold });
  });
  A(span(t, 50.6, 55.4, 0.4, 0.4), () => {
    ctx.strokeStyle = C.ochre; ctx.lineWidth = 3; ctx.setLineDash([10, 7]);
    ctx.strokeRect(...P(0.7, 0.34), 0.29 * FW, 0.65 * FH);
    ctx.strokeRect(...P(0.02, 0.38), 0.5 * FW, 0.3 * FH);
    ctx.setLineDash([]);
    font(700, 24); text('standing', P(0.85, 0.3)[0], P(0.85, 0.3)[1], { align: 'center', base: 'middle', color: C.ochre });
    text('seated', P(0.27, 0.34)[0], P(0.27, 0.34)[1], { align: 'center', base: 'middle', color: C.ochre });
    arrow(...P(0.66, 0.41), ...P(0.53, 0.41), C.light, 5);
    font(700, 24); text('the hand bridges the gap', W / 2, FY + FH + 34, { align: 'center', base: 'middle', color: C.light });
  });
}
function sceneChapel(t) {
  chapelPlan(t, span(t, 55.2, 59.8, 0.5, 0.4));
  A(span(t, 59.8, 64.6, 0.5, 0.0), () => {
    painting(t, 1, { beam: 1, amb: 0.06 });
    const [mx, my] = P(0.31, 0.42), [yx, yy] = P(0.12, 0.49);
    ctx.strokeStyle = C.light; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(mx, my, 40, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.blue; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.arc(yx, yy, 38, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    font(700, 24); text('most historians: Matthew', mx + 10, FY - 24, { align: 'center', base: 'middle', color: C.light });
    text('another reading', yx + 20, FY + FH + 34, { align: 'center', base: 'middle', color: C.blue });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneOpen(t);
    sceneStudio(t);
    sceneBeam(t);
    sceneChapel(t);
    font(500, 22); A(span(t, 0.6, 64.6, 0.5, 0) * (t < 18.4 || (t > 32.2 && t < 55.2) || t > 59.8 ? 1 : 0), () => text('schematic, not the painting', FX + 14, FY + FH - 20, { align: 'left', base: 'middle', color: 'rgba(243,230,207,0.42)' }));
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.ochre, '~': C.light, '^': C.red } });
  },
});
