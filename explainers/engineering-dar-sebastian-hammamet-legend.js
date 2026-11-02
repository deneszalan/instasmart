// Explainer for engineering-dar-sebastian-hammamet-legend (Tunisia 1943, Visit): Dar Sebastian in Hammamet, the villa
// that guides say Rommel stayed in or used as a headquarters. What the sources actually support, and what is only told.
// Look: the white villa by the sea drawn in flat whitewash and Hammamet blue, with jasmine-green garden; claims appear
// as cards stamped DOCUMENTED, REPORTED or TOLD, like an archivist's index; a date bar checks the Rommel story.
// Lora for titles, Fira Sans for captions and labels.
//
// Facts:
// - Hatem Bourial, webdo.tn, 1 January 2020, "Hammamet : Dar Sebastian, une villa pas comme les autres": built between
//   1927 and 1932; George Sebastian had settled in Hammamet in 1925; designed with his wife Flora and Porter Woodruff;
//   local style with Art Deco touches; an estate of about ten hectares; Sebastian lived there until the 1960s and sold
//   the estate to the Tunisian state at the start of that decade; it became the International Cultural Centre of
//   Hammamet.
// - Hatem Bourial, webdo.tn, "Hammamet : le fabuleux destin de George Sebastian": some sources suggest building began
//   in 1923; Sebastian left the villa at the start of the war in 1939 and took refuge in the United States; "sa
//   demeure sera d'ailleurs réquisitionnée par l'armée allemande. Rommel y aurait même passé quelques nuits"; resold to
//   the Tunisian government in 1962; "selon la légende", his ashes were scattered in the gardens.
// - Kapitalis (after the TAP agency), 24 September 2024: the house was "achevée en 1934"; Winston Churchill "y a rédigé
//   une partie de ses mémoires" (no date or document given).
// - La Presse (Tunis), 1 August 2026: the open-air theatre was inaugurated in 1964, by President Habib Bourguiba, the
//   year the Hammamet festival began.
// - Wikipedia, "Erwin Rommel": on 23 February 1943 Army Group Africa was created with Rommel in overall command; on
//   9 March he returned to Germany. Wikipedia, "Tunisian campaign": German aircraft were arriving at Tunis by
//   9 November 1942. The Axis held the east of Tunisia, Hammamet included, until May 1943.
// No wartime document placing Rommel at the villa was found in these sources; the post says so.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0–14.0  Hammamet, the villa, built about 1927–34 by George Sebastian; now a cultural centre and theatre.
//  B 14.2–27.8  The war story guides tell; what Hatem Bourial writes: left in 1939, requisitioned by the German army.
//  C 28.0–41.6  Rommel "may have" stayed: check the dates; no document in the sources.
//  D 41.8–55.4  Churchill's memoirs; the ashes; sold to the state.
//  E 55.6–65.2  Sort what you hear: documented, reported, told.
const W = 864, H = 1080, CX = W / 2;
const { seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky0: '#0f2a3f', sky1: '#2f6f8f', sea: '#1f5f7a', sea2: '#2d7d97', white: '#f7f3ea', shade: '#d9d2c1', blue: '#2e6fb5',
  green: '#3f7d4f', green2: '#2f6340', sand: '#e4d3ae', ink: '#fffaf0', soft: 'rgba(255,250,240,0.8)', faint: 'rgba(255,250,240,0.3)',
  doc: '#8fe3a1', rep: '#ffd166', told: '#ff9f80', card: 'rgba(14,30,44,0.88)', paper: '#f4ecd8', paperInk: '#2a2a2a',
};
const TITLE = 'Lora', SANS = 'Fira Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const BUILT = [1927, 1934]; // Bourial gives 1927–1932, Kapitalis/TAP "achevée en 1934"
const THEATRE = 1964;
const DAY = (y, m, d) => Date.UTC(y, m - 1, d) / 86400000;
const AXIS_FROM = DAY(1942, 11, 9), ROMMEL_CMD = DAY(1943, 2, 23), ROMMEL_LEFT = DAY(1943, 3, 9), AXIS_TO = DAY(1943, 5, 13);
const CMD_DAYS = ROMMEL_LEFT - ROMMEL_CMD;
if (CMD_DAYS !== 14) throw new Error('dates');

// ---------- the villa ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, 420); lg.addColorStop(0, C.sky0); lg.addColorStop(1, C.sky1);
  g.fillStyle = lg; g.fillRect(0, 0, W, 420);
  const sg = g.createLinearGradient(0, 300, 0, 470); sg.addColorStop(0, C.sea2); sg.addColorStop(1, C.sea);
  g.fillStyle = sg; g.fillRect(0, 330, W, 140);
  g.fillStyle = C.sand; g.fillRect(0, 460, W, 40);
  g.fillStyle = C.green2; g.fillRect(0, 490, W, 290);
  g.fillStyle = '#0d1a22'; g.fillRect(0, 780, W, H - 780);
}
function cypress(x, y, s) { ctx.fillStyle = '#1f4a33'; ctx.beginPath(); ctx.ellipse(x, y - 60 * s, 14 * s, 62 * s, 0, 0, TAU); ctx.fill(); }
function villa(a = 1, x = 300, y = 640, s = 1) {
  A(a, () => {
    // garden
    ctx.fillStyle = C.green; ctx.beginPath(); ctx.ellipse(x + 120 * s, y + 40 * s, 360 * s, 80 * s, 0, 0, TAU); ctx.fill();
    for (const [dx, sc] of [[-200, 1.1], [-150, 0.9], [420, 1.0], [470, 1.2]]) cypress(x + dx * s, y + 10 * s, sc * s);
    // the house: low white blocks, arcades, a small dome
    ctx.fillStyle = C.white; ctx.fillRect(x - 100 * s, y - 120 * s, 360 * s, 120 * s);
    ctx.fillStyle = C.shade; ctx.fillRect(x + 160 * s, y - 120 * s, 100 * s, 120 * s);
    ctx.fillStyle = C.white; ctx.fillRect(x - 40 * s, y - 170 * s, 160 * s, 50 * s);
    ctx.beginPath(); ctx.arc(x + 40 * s, y - 170 * s, 34 * s, Math.PI, 0); ctx.fill();
    // arcade
    ctx.fillStyle = '#9fb6c4';
    for (let i = 0; i < 5; i++) { const ax = x - 80 * s + i * 50 * s; ctx.beginPath(); ctx.moveTo(ax, y); ctx.lineTo(ax, y - 50 * s); ctx.arc(ax + 18 * s, y - 50 * s, 18 * s, Math.PI, 0); ctx.lineTo(ax + 36 * s, y); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = C.blue; ctx.fillRect(x + 180 * s, y - 70 * s, 26 * s, 70 * s); ctx.fillRect(x + 222 * s, y - 96 * s, 20 * s, 24 * s);
  });
}
function theatre(a) {
  A(a, () => {
    const x = 690, y = 650;
    ctx.fillStyle = '#cbb894';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(x, y, 150 - i * 18, 54 - i * 7, 0, Math.PI, 0); ctx.lineWidth = 8; ctx.strokeStyle = i % 2 ? '#cbb894' : '#b7a27b'; ctx.stroke(); }
    ctx.fillStyle = '#e9dcc0'; ctx.fillRect(x - 60, y - 8, 120, 16);
  });
}
/** A claim card with its stamp: kind is 'doc', 'rep' or 'told'. */
function claim(x, y, w, s, kind, a, stampA = 1) {
  A(a, () => {
    ctx.fillStyle = C.paper; k.rrect(x, y, w, 78, 10); ctx.fill();
    font(500, 24); const tw0 = ctx.measureText(s).width, room = w - 230;
    font(500, tw0 > room ? Math.max(20, Math.floor((24 * room) / tw0)) : 24); text(s, x + 20, y + 40, { color: C.paperInk, base: 'middle' });
    A(stampA, () => {
      const word = kind === 'doc' ? 'DOCUMENTED' : kind === 'rep' ? 'REPORTED' : 'TOLD';
      const col = kind === 'doc' ? '#1f8a45' : kind === 'rep' ? '#b07a00' : '#c0392b';
      ctx.save(); ctx.translate(x + w - 110, y + 40); ctx.rotate(-0.12);
      font(800, 22); const tw = ctx.measureText(word).width;
      ctx.strokeStyle = col; ctx.lineWidth = 3; k.rrect(-tw / 2 - 12, -18, tw + 24, 36, 6); ctx.stroke();
      text(word, 0, 1, { align: 'center', base: 'middle', color: col, spacing: '1px' });
      ctx.restore();
    });
  });
}
function title(s, sub, a, col = C.rep) {
  A(a, () => {
    ctx.fillStyle = C.card; k.rrect(60, 40, 680, sub ? 120 : 76, 14); ctx.fill();
    font(700, 40, TITLE); text(s, 84, 80, { base: 'middle' });
    if (sub) { font(400, 24); text(sub, 84, 128, { base: 'middle', color: col }); }
  });
}

// ---------- A ----------
function sceneVilla(t) {
  A(span(t, 0, 28.0, 0.5, 0.4), () => {
    villa(1);
    theatre(seg(t, 9.8, 10.6));
    title('DAR SEBASTIAN', 'Hammamet, on the Gulf of Hammamet', seg(t, 0.6, 1.4) * (1 - seg(t, 4.6, 5.0)), C.doc);
    title('GEORGE SEBASTIAN’S VILLA', `built around 1930 · sources give ${BUILT[0]} to ${BUILT[1]}`, seg(t, 5.2, 5.8) * (1 - seg(t, 9.2, 9.6)), C.doc);
    title('A CENTRE FOR THE ARTS', `its open-air theatre opened in ${THEATRE}`, seg(t, 9.8, 10.4) * (1 - seg(t, 13.8, 14.2)), C.doc);
    A(seg(t, 10.4, 11.0) * (1 - seg(t, 13.8, 14.2)), () => { font(500, 24); text('open-air theatre', 690, 720, { align: 'center', base: 'middle' }); });
    // the war story
    A(seg(t, 14.4, 15.0) * (1 - seg(t, 18.2, 18.6)), () => {
      ctx.fillStyle = 'rgba(14,30,44,0.92)'; k.rrect(80, 170, 704, 150, 16); ctx.fill();
      font(400, 26); text('what guides often say', CX, 206, { align: 'center', base: 'middle', color: C.soft });
      font(700, 34, TITLE); text('“Rommel’s headquarters”', CX, 262, { align: 'center', base: 'middle', color: C.told });
    });
    title('WHAT THE SOURCES SAY', 'Hatem Bourial, Tunisian writer on Hammamet', seg(t, 18.8, 19.4) * (1 - seg(t, 27.4, 27.8)));
    claim(80, 190, 704, 'Sebastian left in 1939, at the start of the war', 'rep', seg(t, 19.0, 19.6) * (1 - seg(t, 27.4, 27.8)), seg(t, 20.6, 21.2));
    claim(80, 290, 704, 'The German army requisitioned the villa', 'rep', seg(t, 23.6, 24.2) * (1 - seg(t, 27.4, 27.8)), seg(t, 25.0, 25.6));
    A(seg(t, 25.4, 26.0) * (1 - seg(t, 27.4, 27.8)), () => {
      font(400, 22); text('German troops held the area from late 1942 to May 1943', CX, 404, { align: 'center', base: 'middle', color: C.ink });
    });
  });
}

// ---------- C: check the dates ----------
function sceneDates(t) {
  A(span(t, 27.8, 41.8, 0.4, 0.4), () => {
    A(0.35, () => villa(1));
    claim(80, 190, 704, 'Rommel “may have” spent a few nights here', 'told', seg(t, 28.2, 28.8), seg(t, 30.0, 30.6));
    // a date bar from November 1942 to May 1943
    A(seg(t, 32.8, 33.4), () => {
      const L = 90, R = 774, y = 420, X = (d) => L + ((d - AXIS_FROM) / (AXIS_TO - AXIS_FROM)) * (R - L);
      ctx.fillStyle = 'rgba(14,30,44,0.9)'; k.rrect(60, 320, 744, 300, 16); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,240,0.18)'; ctx.fillRect(L, y - 14, R - L, 28);
      font(500, 22); text('Axis troops hold Hammamet', L, y - 36, { base: 'middle', color: C.soft });
      text('Nov 1942', L, y + 40, { base: 'middle', color: C.soft });
      text('May 1943', R, y + 40, { align: 'right', base: 'middle', color: C.soft });
      const g = eio(seg(t, 33.6, 35.0));
      ctx.fillStyle = C.rep; ctx.fillRect(X(ROMMEL_CMD), y - 14, (X(ROMMEL_LEFT) - X(ROMMEL_CMD)) * g, 28);
      A(seg(t, 34.6, 35.2), () => {
        ctx.strokeStyle = C.rep; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(ROMMEL_CMD), y + 16); ctx.lineTo(X(ROMMEL_CMD), y + 70); ctx.lineTo(L, y + 70); ctx.moveTo(X(ROMMEL_LEFT), y + 16); ctx.lineTo(X(ROMMEL_LEFT), y + 116); ctx.lineTo(L, y + 116); ctx.stroke();
        font(600, 24); text('23 Feb 1943: Rommel commands in Tunisia', L, y + 92, { align: 'left', base: 'middle', color: C.rep });
        text('9 Mar 1943: he leaves Africa', L, y + 138, { align: 'left', base: 'middle', color: C.rep });
      });
      A(seg(t, 37.6, 38.2), () => {
        font(600, 26); text('no wartime document in these sources', CX, y + 186, { align: 'center', base: 'middle', color: C.told });
      });
    });
  });
}

// ---------- D: more stories; sold to the state ----------
function sceneMore(t) {
  A(span(t, 41.6, 55.6, 0.4, 0.4), () => {
    villa(1);
    claim(80, 160, 704, 'Churchill wrote part of his memoirs here', 'told', seg(t, 42.0, 42.6), seg(t, 44.2, 44.8));
    claim(80, 260, 704, 'Sebastian’s ashes lie in the garden', 'told', seg(t, 46.6, 47.2), seg(t, 48.4, 49.0));
    claim(80, 360, 704, 'Sold to the Tunisian state in the 1960s', 'doc', seg(t, 51.2, 51.8), seg(t, 52.6, 53.2));
  });
}

// ---------- E: sort what you hear ----------
function sceneSort(t) {
  A(span(t, 55.4, 65.2, 0.4, 0), () => {
    villa(0.5);
    const cols = [
      ['DOCUMENTED', C.doc, [['built by Sebastian,', 'c. 1930'], ['theatre opened', 'in 1964'], ['sold to the state,', '1960s']]],
      ['REPORTED', C.rep, [['left in 1939'], ['requisitioned by', 'the German army']]],
      ['TOLD', C.told, [['Rommel slept here'], ['Churchill wrote', 'his memoirs here'], ['ashes in', 'the garden']]],
    ];
    cols.forEach(([head, col, items], i) => {
      const x = 46 + i * 264, a = seg(t, 55.8 + i * 1.2, 56.4 + i * 1.2);
      A(a, () => {
        ctx.fillStyle = 'rgba(14,30,44,0.9)'; k.rrect(x, 120, 248, 420, 14); ctx.fill();
        ctx.fillStyle = col; ctx.fillRect(x, 120, 248, 8);
        font(800, 26); text(head, x + 124, 166, { align: 'center', base: 'middle', color: col, spacing: '1px' });
        items.forEach((lines, j) => {
          font(500, 22);
          lines.forEach((l, m) => text(l, x + 124, 226 + j * 100 + m * 28, { align: 'center', base: 'middle', color: C.ink }));
        });
      });
    });
    A(seg(t, 60.4, 61.0), () => {
      ctx.fillStyle = 'rgba(14,30,44,0.9)'; k.rrect(46, 570, 776, 60, 12); ctx.fill();
      font(500, 22); text('the house and theatre you can visit; the war years, weigh source by source', CX, 600, { align: 'center', base: 'middle', color: C.ink });
    });
  });
}

const CUES = [
  [0.4, 4.8, 'In *Hammamet*, on Tunisia’s east coast, a white villa stands in a garden by the sea: *Dar Sebastian*.'],
  [5.0, 9.4, `George Sebastian, born in Romania, had it built around 1930; sources give dates from ${BUILT[0]} to ${BUILT[1]}.`],
  [9.6, 14.0, `Today it is the *International Cultural Centre of Hammamet*, with an open-air theatre opened in ${THEATRE}.`],
  [14.2, 18.6, 'Guides often add a war story: that *Rommel*, the German commander, stayed here or ran his headquarters here.'],
  [18.8, 23.2, 'What do the sources say? Sebastian left in 1939, at the start of the war, writes Tunisian author Hatem Bourial.'],
  [23.4, 27.8, 'Bourial writes that the German army ~requisitioned~ the villa. German troops held the area from late 1942 to May 1943.'],
  [28.0, 32.4, 'And Rommel? Bourial says only that he *may* have spent a few nights here.'],
  [32.6, 37.0, 'Check the dates: Rommel took command in Tunisia on 23 February 1943 and left Africa on 9 March.'],
  [37.2, 41.6, 'So the story can only fit a few weeks of early 1943, and none of these sources cites a wartime document.'],
  [41.8, 46.2, 'Another story: that Winston Churchill wrote part of his memoirs here. It is told without a date or a document.'],
  [46.4, 50.8, 'Even Sebastian’s ashes in the garden are, in Bourial’s words, a ~legend~.'],
  [51.0, 55.4, 'What is on record: Sebastian sold the estate to the Tunisian state in the 1960s, and it became a centre for the arts.'],
  [55.6, 60.0, 'On the spot, sort what you hear: what is *documented*, what is reported, and what is only told.'],
  [60.2, 64.6, 'The house, the garden and the theatre you can see. Its war years, you weigh source by source.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneVilla(t);
    sceneDates(t);
    sceneMore(t);
    sceneSort(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 36, weight: 400, family: SANS, ink: C.ink, marks: { '*': C.doc, '~': C.told } });
  },
});
