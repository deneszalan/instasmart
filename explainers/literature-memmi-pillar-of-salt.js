// Explainer for literature-memmi-pillar-of-salt (Tunisia 1943): Albert Memmi's first novel, La Statue de sel (The
// Pillar of Salt, 1953), follows Alexandre Mordekhaï Benillouche from an alley by the Hara, Tunis's old Jewish quarter,
// through the French lycée to a German forced-labour camp in 1943. Much is Memmi's own life; the ending is not.
// Look: cream paper and indigo ink like a printed page, with Tunis blue and terracotta; two coloured threads, the
// life (blue) and the novel (terracotta), run together and then part. Alegreya for titles, Alegreya Sans for text.
// No book cover is shown; the title plate is drawn here.
//
// Facts:
// - France Culture, Z. Sfez, "Retournez-vous sur La statue de sel" (16 June 2020): Memmi born in 1920 at the gates of
//   the Hara, the Jewish quarter of Tunis, son of a Jewish-Italian saddler and an illiterate mother; the novel, a
//   barely fictionalised autobiography, published in 1953 with a preface by Albert Camus ("Voici un écrivain français
//   de Tunisie qui n'est ni Français ni Tunisien"); its narrator, Alexandre Mordekhaï Benillouche, lives in an alley
//   ("l'impasse"), goes on a scholarship to the French lycée of Tunis, "Je me découvris étranger dans ma ville natale";
//   the conquest of French; Vichy shows him he will never be French; the Germans occupy Tunisia and Memmi is sent to a
//   forced-labour camp; there the stories part: the narrator flees to South America, Memmi goes to Algiers to study
//   philosophy, then to the Sorbonne; independence in 1956; he left for Paris.
// - H. Saadoun, "Nouvelle lecture de La Statue de sel", Revue d'histoire de la Shoah 205 (2016): the three parts are
//   L'Impasse, La Ville, Le Monde; in the novel Benillouche resigns from the lycée, works in the community's offices,
//   then decides to go to the labour camps ("J'ai demandé à partir parce qu'il m'était intolérable de rester"); in the
//   camp he organises a service and a study circle and keeps a diary; he escapes with a group of friends; Memmi
//   returned to teach in Tunisia in 1951; the book is based on Memmi's diary; the title refers to Lot's wife (final
//   page: "Comme la femme de Loth, que Dieu changea en statue ...").
// - French Wikipedia (Hagège and Zarca; Marzouki): Memmi experienced the forced-labour camps in 1942–43, "à peu près
//   volontairement" in his own words; his mother tongue was Judeo-Arabic; his Journal de guerre (1939–1943) and
//   Journal d'un travailleur forcé were published by CNRS Éditions in 2019.
//
// Scene plan (65.2 s). Captions centred at y = 846.
//  A  0.0– 9.4  Title plate, 1953; the alley by the Hara and the narrator.
//  B  9.6–32.4  Memmi's life as material; three parts; the lycée; two languages; Vichy.
//  C 32.6–50.8  November 1942; the camp in the novel; Memmi's own camp.
//  D 51.0–60.0  The threads part: South America vs Algiers, Paris, Tunis, France.
//  E 60.2–64.6  Lot's wife: the pillar of salt.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  paper: '#f2ead9', paper2: '#e6dbc3', ink: '#1f2440', soft: 'rgba(31,36,64,0.72)', faint: 'rgba(31,36,64,0.18)',
  blue: '#2f6f9f', terra: '#b5543c', salt: '#ffffff', wall: '#d8cbb0', wall2: '#c4b496', shadow: 'rgba(31,36,64,0.10)',
};
const SERIF = 'Alegreya', SANS = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

const BORN = 1920, PUBLISHED = 1953, INDEPENDENCE = 1956;
if (PUBLISHED - BORN !== 33) throw new Error('numbers');

/** A plain standing figure; `look` turns the head (−1 left … 1 right). */
function person(x, y, s, color, { look = 0, book = false } = {}) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x + look * 3 * s, y - 34 * s, 9 * s, 0, TAU); ctx.fill();
  k.rrect(x - 10 * s, y - 23 * s, 20 * s, 34 * s, 7 * s); ctx.fill();
  ctx.fillRect(x - 8 * s, y + 9 * s, 6 * s, 22 * s); ctx.fillRect(x + 2 * s, y + 9 * s, 6 * s, 22 * s);
  if (book) { ctx.fillStyle = C.paper; ctx.fillRect(x + 6 * s, y - 14 * s, 14 * s, 10 * s); ctx.strokeStyle = color; ctx.lineWidth = 1.5 * s; ctx.strokeRect(x + 6 * s, y - 14 * s, 14 * s, 10 * s); }
}

/** Several strings on one line, each drawn (and translated) on its own: words stay whole for other languages, numbers can change. */
function words(parts, x, y, { align = 'center', color } = {}) {
  const sp = ctx.measureText(' ').width, ws = parts.map((p) => ctx.measureText(p).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  parts.forEach((p, i) => { text(p, cx, y, { align: 'left', base: 'middle', ...(color ? { color } : {}) }); cx += ws[i] + sp; });
}
// ---------- A: the title plate and the alley ----------
function plate(a, y = 200) {
  A(a, () => {
    ctx.fillStyle = C.paper2; k.rrect(CX - 320, y - 150, 640, 330, 6); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; k.rrect(CX - 304, y - 134, 608, 298, 4); ctx.stroke();
    font(400, 30, SANS); text('Albert Memmi', CX, y - 80, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    font(700, 68, SERIF); text('La Statue de sel', CX, y - 4, { align: 'center', base: 'middle' });
    font(400, 30, SERIF); text('The Pillar of Salt', CX, y + 56, { align: 'center', base: 'middle', color: C.terra });
    font(400, 24, SANS); text('Paris, 1953 · preface by Albert Camus', CX, y + 120, { align: 'center', base: 'middle', color: C.soft });
  });
}
function alley(t, a, { boy = 1 } = {}) {
  A(a, () => {
    // a dead-end alley drawn in perspective: two walls closing on an end wall with a blue door
    const top = 400, bot = 760, vx = CX;
    ctx.fillStyle = C.wall; ctx.beginPath(); ctx.moveTo(90, bot); ctx.lineTo(330, top + 60); ctx.lineTo(330, top - 30); ctx.lineTo(90, top - 160); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.wall2; ctx.beginPath(); ctx.moveTo(774, bot); ctx.lineTo(534, top + 60); ctx.lineTo(534, top - 30); ctx.lineTo(774, top - 160); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8dcc2'; ctx.fillRect(330, top - 30, 204, 90);
    ctx.fillStyle = C.blue; k.rrect(vx - 26, top - 4, 52, 64, 26); ctx.fill(); ctx.fillRect(vx - 26, top + 26, 52, 34);
    // windows with blue grilles
    for (const [x, y, w, h] of [[150, 470, 50, 60], [640, 470, 50, 60], [260, 470, 30, 40], [590, 470, 30, 40]]) {
      ctx.fillStyle = C.blue; ctx.fillRect(x, y, w, h); ctx.strokeStyle = C.paper; ctx.lineWidth = 2;
      for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + (w * i) / 3, y); ctx.lineTo(x + (w * i) / 3, y + h); ctx.stroke(); }
    }
    ctx.fillStyle = C.shadow; ctx.beginPath(); ctx.moveTo(90, bot); ctx.lineTo(330, top + 60); ctx.lineTo(534, top + 60); ctx.lineTo(774, bot); ctx.closePath(); ctx.fill();
    A(boy, () => person(CX, 650, 2.2, C.terra, { book: true }));
  });
}
function sceneOpen(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    plate(seg(t, 0.3, 1.2) * (1 - seg(t, 4.6, 5.0)), 300);
    A(seg(t, 4.8, 5.6), () => {
      alley(t, 1, { boy: seg(t, 5.6, 6.4) });
      font(700, 34, SERIF); text('Tunis, by the Hara', CX, 96, { align: 'center', base: 'middle' });
      font(400, 24); text('the old Jewish quarter', CX, 136, { align: 'center', base: 'middle', color: C.soft });
      A(seg(t, 6.4, 7.0), () => {
        font(600, 26); text('the narrator: Alexandre Mordekhaï Benillouche', CX, 184, { align: 'center', base: 'middle', color: C.terra });
      });
    });
  });
}

// ---------- B: life as material; three parts; lycée; languages; Vichy ----------
function threads(t, p, { y0 = 300, part = 1 } = {}) {
  // two threads, life (blue) and novel (terracotta), side by side from 1920 to 1943
  const L = 110, R = 754;
  const X = (yr) => L + (R - L) * ((yr - BORN) / (1943 - BORN));
  ctx.lineCap = 'round';
  ctx.strokeStyle = C.blue; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(L, y0 - 9); ctx.lineTo(lerp(L, R, p), y0 - 9); ctx.stroke();
  ctx.strokeStyle = C.terra; ctx.beginPath(); ctx.moveTo(L, y0 + 9); ctx.lineTo(lerp(L, R, p), y0 + 9); ctx.stroke();
  ctx.lineCap = 'butt';
  font(600, 24); text('his life', L - 4, y0 - 40, { align: 'left', base: 'middle', color: C.blue });
  text('the novel', L - 4, y0 + 42, { align: 'left', base: 'middle', color: C.terra });
  font(400, 22);
  for (const yr of [1920, 1930, 1940]) { const x = X(yr); if (x <= lerp(L, R, p) + 1) text(String(yr), x, y0 + 80, { align: 'center', base: 'middle', color: C.soft }); }
  void part;
}
function sceneLife(t) {
  A(span(t, 9.4, 32.6, 0.4, 0.4), () => {
    // the two threads stay on top all through B
    font(700, 36, SERIF); text('A novel built on a life', CX, 96, { align: 'center', base: 'middle' });
    threads(t, eio(seg(t, 9.8, 13.6)) * (t < 23 ? 0.45 : lerp(0.45, 0.95, seg(t, 23, 31))), { y0: 230 });
    A(seg(t, 10.2, 10.8) * (1 - seg(t, 13.8, 14.2)), () => {
      font(400, 26); text('Albert Memmi, born 1920, son of a saddler', CX, 420, { align: 'center', base: 'middle', color: C.ink });
      person(CX - 120, 600, 2.0, C.blue); person(CX + 120, 600, 2.0, C.terra);
      font(600, 22); text('Memmi', CX - 120, 690, { align: 'center', base: 'middle', color: C.blue });
      text('Alexandre', CX + 120, 690, { align: 'center', base: 'middle', color: C.terra });
    });
    // three parts, widening frames
    A(seg(t, 14.2, 14.8) * (1 - seg(t, 18.4, 18.8)), () => {
      const parts = [['L’Impasse', 'the alley', 170, 170], ['La Ville', 'the city', 230, 230], ['Le Monde', 'the world', 290, 290]];
      let x = (W - (170 + 230 + 290 + 2 * 28)) / 2;
      parts.forEach(([fr, en, w, h], i) => {
        const cx = x + w / 2; x += w + 28;
        A(seg(t, 14.4 + i * 0.8, 15.0 + i * 0.8), () => {
          const y = 560;
          ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(cx - w / 2, y - h / 2, w, h);
          font(700, 30, SERIF); text(fr, cx, y - 16, { align: 'center', base: 'middle' });
          font(400, 22); text(en, cx, y + 22, { align: 'center', base: 'middle', color: C.soft });
          font(600, 22); text(['Part 1', 'Part 2', 'Part 3'][i], cx, y + h / 2 + 30, { align: 'center', base: 'middle', color: C.soft });
        });
      });
    });
    // the lycée: a stranger in his own city
    A(seg(t, 18.8, 19.4) * (1 - seg(t, 23.0, 23.4)), () => {
      ctx.fillStyle = C.wall; ctx.fillRect(212, 430, 440, 280);
      ctx.fillStyle = C.wall2; ctx.fillRect(192, 410, 480, 40);
      font(700, 28, SERIF); text('LYCÉE', CX, 432, { align: 'center', base: 'middle', color: C.ink, spacing: '6px' });
      for (let i = 0; i < 5; i++) { ctx.fillStyle = C.blue; k.rrect(240 + i * 82, 480, 46, 70, 20); ctx.fill(); }
      const cols = [C.soft, C.soft, C.terra, C.soft, C.soft, C.soft];
      cols.forEach((c, i) => person(262 + i * 68, 650, 1.4, c));
      font(400, 24); text('“a stranger in my own city”', CX, 750, { align: 'center', base: 'middle', color: C.terra });
    });
    // two languages
    A(seg(t, 23.4, 24.0) * (1 - seg(t, 27.6, 28.0)), () => {
      const bub = (x, y, w, s, sub, c) => {
        ctx.fillStyle = C.paper2; k.rrect(x - w / 2, y - 50, w, 100, 22); ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.stroke();
        font(700, 28, SERIF); text(s, x, y - 12, { align: 'center', base: 'middle', color: c });
        font(400, 22); text(sub, x, y + 22, { align: 'center', base: 'middle', color: C.soft });
      };
      bub(250, 470, 300, 'at home', 'the Arabic of Tunis’s Jews', C.terra);
      bub(614, 470, 300, 'at school', 'French, won word by word', C.blue);
      person(CX, 680, 2.0, C.ink);
    });
    // Vichy
    A(seg(t, 28.0, 28.6), () => {
      ctx.save(); ctx.translate(CX, 540); ctx.rotate(-0.06);
      ctx.strokeStyle = '#8a2f2f'; ctx.lineWidth = 6; k.rrect(-260, -80, 520, 160, 10); ctx.stroke();
      font(700, 34, SERIF); text('VICHY, 1940–1941', 0, -24, { align: 'center', base: 'middle', color: '#8a2f2f', spacing: '3px' });
      font(600, 26); text('anti-Jewish laws in Tunisia too', 0, 28, { align: 'center', base: 'middle', color: '#8a2f2f' });
      ctx.restore();
    });
  });
}

// ---------- C: the war and the camp ----------
function camp(t, x0, y0, s = 1) {
  // a fenced row of huts, schematic
  ctx.strokeStyle = C.soft; ctx.lineWidth = 2;
  for (let i = 0; i <= 12; i++) { const x = x0 + i * 46 * s; ctx.beginPath(); ctx.moveTo(x, y0 - 70 * s); ctx.lineTo(x, y0 + 10 * s); ctx.stroke(); }
  for (const dy of [-60, -35, -10]) { ctx.beginPath(); ctx.moveTo(x0, y0 + dy * s); ctx.lineTo(x0 + 552 * s, y0 + dy * s); ctx.stroke(); }
  for (let i = 0; i < 4; i++) {
    const x = x0 + 30 * s + i * 135 * s, y = y0 - 150 * s;
    ctx.fillStyle = C.wall2; ctx.fillRect(x, y, 110 * s, 60 * s);
    ctx.fillStyle = C.wall; ctx.beginPath(); ctx.moveTo(x - 6 * s, y); ctx.lineTo(x + 55 * s, y - 30 * s); ctx.lineTo(x + 116 * s, y); ctx.closePath(); ctx.fill();
  }
  void t;
}
function sceneWar(t) {
  A(span(t, 32.4, 51.0, 0.4, 0.4), () => {
    A(seg(t, 32.6, 33.2) * (1 - seg(t, 36.8, 37.2)), () => {
      font(700, 36, SERIF); text('November 1942', CX, 96, { align: 'center', base: 'middle', color: C.terra });
      font(400, 24); text('German troops in Tunis; Jewish men ordered to forced labour', CX, 140, { align: 'center', base: 'middle', color: C.soft });
      alley(t, 0.55, { boy: 0 });
      ctx.fillStyle = C.paper; ctx.fillRect(282, 520, 300, 150); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(282, 520, 300, 150);
      font(700, 26, SERIF); text('NOTICE', CX, 556, { align: 'center', base: 'middle', color: '#8a2f2f', spacing: '4px' });
      font(400, 22); text('Jewish men: report', CX, 600, { align: 'center', base: 'middle' }); text('for labour', CX, 632, { align: 'center', base: 'middle' });
    });
    // in the novel: from the office to the camp
    A(seg(t, 37.2, 37.8) * (1 - seg(t, 45.8, 46.2)), () => {
      font(700, 34, SERIF); text('In the novel', CX, 96, { align: 'center', base: 'middle', color: C.terra });
      camp(t, 156, 640);
      const walk = eio(seg(t, 38.0, 41.2));
      person(lerp(60, 330, walk), 700, 1.8, C.terra);
      A(seg(t, 37.6, 38.2) * (1 - seg(t, 41.4, 41.8)), () => {
        ctx.fillStyle = C.paper2; k.rrect(132, 220, 600, 120, 14); ctx.fill();
        font(400, 26, SERIF); text('“I asked to go because', CX, 262, { align: 'center', base: 'middle', color: C.ink });
        text('it was intolerable to stay.”', CX, 300, { align: 'center', base: 'middle', color: C.ink });
      });
      A(seg(t, 41.8, 42.4), () => {
        const items = ['a service', 'a study circle', 'a diary, three notebooks'];
        items.forEach((s, i) => { font(600, 26); text(s, CX, 230 + i * 44, { align: 'center', base: 'middle', color: C.terra }); });
        // escape: a dashed path out through the fence
        A(seg(t, 43.6, 44.2), () => {
          ctx.strokeStyle = C.terra; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
          ctx.beginPath(); ctx.moveTo(400, 680); ctx.quadraticCurveTo(620, 760, 790, 610); ctx.stroke(); ctx.setLineDash([]);
          font(600, 24); text('escape, with friends', 700, 740, { align: 'center', base: 'middle', color: C.terra });
        });
      });
    });
    // Memmi's own camp
    A(seg(t, 46.2, 46.8), () => {
      font(700, 34, SERIF); text('In life', CX, 96, { align: 'center', base: 'middle', color: C.blue });
      camp(t, 156, 640);
      person(420, 700, 1.8, C.blue, { book: true });
      ctx.fillStyle = C.paper2; k.rrect(112, 210, 640, 160, 14); ctx.fill();
      font(400, 26); text('Memmi was in a forced labour camp, 1942–43,', CX, 252, { align: 'center', base: 'middle', color: C.ink });
      font(400, 26, SERIF); text('“more or less voluntarily”', CX, 294, { align: 'center', base: 'middle', color: C.blue });
      font(400, 22); text('his diary was published in 2019', CX, 336, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- D: the threads part ----------
function sceneFork(t) {
  A(span(t, 50.8, 60.2, 0.4, 0.4), () => {
    font(700, 36, SERIF); text('Here the stories part', CX, 96, { align: 'center', base: 'middle' });
    const y0 = 330, xs = 110, xf = 360;
    ctx.lineCap = 'round'; ctx.lineWidth = 8;
    ctx.strokeStyle = C.blue; ctx.beginPath(); ctx.moveTo(xs, y0 - 9); ctx.lineTo(xf, y0 - 9); ctx.stroke();
    ctx.strokeStyle = C.terra; ctx.beginPath(); ctx.moveTo(xs, y0 + 9); ctx.lineTo(xf, y0 + 9); ctx.stroke();
    font(600, 22); text('1943', xf, y0 - 46, { align: 'center', base: 'middle', color: C.soft });
    const p = eio(seg(t, 51.4, 54.0));
    // the novel goes off to sea
    ctx.strokeStyle = C.terra; ctx.beginPath(); ctx.moveTo(xf, y0 + 9);
    ctx.bezierCurveTo(lerp(xf, 520, p), y0 + 9 + 80 * p, lerp(xf, 640, p), y0 + 200 * p, lerp(xf, 760, p), y0 + 9 + 250 * p); ctx.stroke();
    // the life: Algiers, Paris, Tunis, France
    ctx.strokeStyle = C.blue; ctx.beginPath(); ctx.moveTo(xf, y0 - 9); ctx.lineTo(lerp(xf, 760, eio(seg(t, 55.6, 58.6))), y0 - 9); ctx.stroke();
    ctx.lineCap = 'butt';
    A(seg(t, 53.4, 54.0), () => {
      // a ship
      const sx = 740, sy = 600;
      ctx.fillStyle = C.terra; ctx.beginPath(); ctx.moveTo(sx - 60, sy); ctx.lineTo(sx + 60, sy); ctx.lineTo(sx + 44, sy + 26); ctx.lineTo(sx - 44, sy + 26); ctx.closePath(); ctx.fill();
      ctx.fillRect(sx - 20, sy - 30, 40, 30); ctx.fillRect(sx - 6, sy - 52, 12, 22);
      font(600, 26); text('the novel: Alexandre sails', 470, 640, { align: 'center', base: 'middle', color: C.terra });
      text('for South America', 470, 674, { align: 'center', base: 'middle', color: C.terra });
    });
    const stops = [['Algiers', 460, 55.8], ['Paris', 580, 56.6], ['Tunis, 1953', 705, 57.4]];
    for (const [s, x, t0] of stops) A(seg(t, t0, t0 + 0.5), () => {
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(x, y0 - 9, 10, 0, TAU); ctx.fill();
      font(600, 23); text(s, x, y0 - 50, { align: 'center', base: 'middle', color: C.blue });
    });
    A(seg(t, 58.2, 58.8), () => {
      font(600, 24); text('then France, after independence in 1956', 580, y0 - 100, { align: 'center', base: 'middle', color: C.blue });
    });
    font(600, 24); text('his life', xs - 4, y0 - 46, { align: 'left', base: 'middle', color: C.blue });
    text('the novel', xs - 4, y0 + 50, { align: 'left', base: 'middle', color: C.terra });
  });
}

// ---------- E: the pillar of salt ----------
function sceneSalt(t) {
  A(span(t, 60.0, 65.2, 0.5, 0), () => {
    const turn = eio(seg(t, 60.8, 62.6));
    const col = mix('#b5543c', '#ffffff', turn);
    const dusk = ctx.createRadialGradient(CX, 600, 40, CX, 600, 300); dusk.addColorStop(0, 'rgba(31,36,64,0.92)'); dusk.addColorStop(1, 'rgba(31,36,64,0)');
    ctx.fillStyle = dusk; ctx.beginPath(); ctx.arc(CX, 600, 300, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(CX, 740, 120 * turn + 10, 18, 0, 0, TAU); ctx.fill();
    person(CX, 680, 3.6, col, { look: -1 * turn });
    font(700, 40, SERIF); text('Lot’s wife looked back', CX, 160, { align: 'center', base: 'middle' });
    A(seg(t, 62.2, 62.8), () => { font(400, 26); text('and became a pillar of salt: the novel’s title', CX, 210, { align: 'center', base: 'middle', color: C.soft }); });
  });
}
function mix(a, b, x) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  return `rgb(${Math.round(lerp(r1, r2, x))},${Math.round(lerp(g1, g2, x))},${Math.round(lerp(b1, b2, x))})`;
}

const CUES = [
  [0.4, 4.8, 'Tunis, *1953*: Albert Memmi publishes his first novel, *La Statue de sel*, The Pillar of Salt.'],
  [5.0, 9.4, 'Its narrator, *Alexandre Mordekhaï Benillouche*, grows up in an alley by the Hara, Tunis’s Jewish quarter.'],
  [9.6, 14.0, 'So did ~Memmi~, born there in 1920, a saddler’s son. The novel is built on his own life.'],
  [14.2, 18.6, 'Its three parts widen like his world: L’Impasse, La Ville, Le Monde. The alley, the city, the world.'],
  [18.8, 23.2, 'A scholarship takes him to the French lycée, where he finds himself a stranger in his own city.'],
  [23.4, 27.8, 'At home he speaks the Arabic of Tunis’s Jews; at school he wins French word by word.'],
  [28.0, 32.4, 'Then Vichy France’s anti-Jewish laws tell him that he will never be fully French.'],
  [32.6, 37.0, '*November 1942*: German troops occupy Tunis and order Jewish men to *forced labour*.'],
  [37.2, 41.6, 'In the novel, *Alexandre* asks to be sent to a labour camp: staying behind feels intolerable.'],
  [41.8, 46.2, 'In the camp he holds a service and a study circle, keeps a diary, then escapes with friends.'],
  [46.4, 50.8, '~Memmi~ too was in a forced labour camp in 1942–43, “more or less voluntarily”, as he put it.'],
  [51.0, 55.4, 'Here the stories part. At the end of the novel, *Alexandre* sails for South America.'],
  [55.6, 60.0, 'Memmi studied in Algiers and Paris, taught in Tunis, and moved to France after independence.'],
  [60.2, 64.6, 'The title is Lot’s wife, turned to a *pillar of salt* for looking back, as the novel does.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = C.paper2; ctx.fillRect(0, 790, W, H - 790);
    sceneOpen(t);
    sceneLife(t);
    sceneWar(t);
    sceneFork(t);
    sceneSalt(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.terra, '~': C.blue } });
  },
});
