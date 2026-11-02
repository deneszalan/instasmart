// Explainer for art-patton-el-guettar (Tunisia 1943): the film Patton (1970) stages its Tunisian battle at El Guettar as
// General George S. Patton outwitting Field Marshal Erwin Rommel. What really happened on 23 March 1943: Rommel had
// left Africa on 9 March; the German 10th Panzer Division attacked the US 1st Infantry Division and was stopped by a
// minefield, artillery and tank destroyers; the fighting went on into April without a breakthrough. Look: a dark
// cinema with a wide screen in amber for the film, then a schematic plan of the El Guettar valley in sand and steel
// blue for the record. Archivo for titles and numbers, Playfair Display for the film's side.
//
// Facts:
// - Wikipedia, "Patton (film)": a 1970 film directed by Franklin J. Schaffner, with George C. Scott as Patton and Karl
//   Michael Vogler as Rommel, written by Francis Ford Coppola and Edmund H. North from Ladislas Farago's biography and
//   Omar Bradley's memoir; seven Academy Awards including Best Picture; "Patton leads the corps to redemption at the
//   Battle of El Guettar"; "The scenes set in Tunisia and Sicily were shot in Almeria in the south of Spain."
// - Wikipedia, "Panzer Greift An" and "Infantry Attacks": in the film a book titled "Panzer greift an" (The Tank in
//   Attack) lies on Patton's nightstand when his aides wake him with news that Rommel is about to attack near El
//   Guettar; during the tank battle Patton exclaims that he read Rommel's book; Rommel never completed that book; his
//   real book was "Infanterie greift an" (Infantry Attacks, 1937), which Patton is reported to have read.
// - Wikipedia, "Erwin Rommel": on 9 March 1943 he returned to Germany and command of Army Group Africa passed to
//   von Arnim; Wikipedia, "Battle of El Guettar": "Rommel had departed Tunisia for Germany on 9 March before the
//   battle"; the battle lasted from 23 March to 3 April 1943 and is listed as indecisive; American attacks on the hills
//   from 28-30 March ran into mines and fire; on 7 April Benson Force met the Eighth Army on the El Guettar-Gabès road.
// - National WWII Museum, M. T. Calhoun, "US II Corps at El Guettar" (2023): Patton took command of II Corps on
//   6 March 1943; on 23 March the 10th Panzer Division attacked along the road from Gabès toward Gafsa; Major General
//   Terry de la Mesa Allen's 1st Infantry Division saw the panzers before dawn; at the Keddab wadi "a dense minefield
//   immobilized eight German tanks"; American artillery and tank destroyers destroyed another 30; by midday the Germans
//   pulled back, and artillery stopped the evening attack.
// The valley plan is schematic; the cinema scenes are drawn for this clip, not taken from the film.
//
// Scene plan (65 s). Important things stay above y = 790; captions are centred at y = 846.
//  A  0.0–18.6  The film: Patton, the warning, the book, the battle watched from a hill.
//  B 18.8–27.8  The record: Patton in command from 6 March; Rommel gone on 9 March.
//  C 28.0–46.2  23 March 1943 in the valley: 10th Panzer, the minefield, the guns; midday; evening.
//  D 46.4–55.4  Into April: attacks on the hills; 7 April.
//  E 55.6–64.8  What the film changed: one morning, Rommel, Spain.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  black: '#121212', screen: '#2a2116', amber: '#e0a43a', amberSoft: 'rgba(224,164,58,0.7)', ink: '#f3eee4', soft: 'rgba(243,238,228,0.76)',
  faint: 'rgba(243,238,228,0.25)', sand: '#c9b48a', sand2: '#b29c70', hill: '#8f7b55', steel: '#7fa6c9', rust: '#c0583a', mine: '#3b2f22',
};
const HEAD = 'Archivo', FILM = 'Playfair Display';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the dates ----------
const COMMAND = 6, ROMMEL_LEFT = 9, ATTACK = 23, STUCK = 8, KNOCKED = 30;
if (ATTACK - ROMMEL_LEFT !== 14 || ATTACK - COMMAND !== 17) throw new Error('dates');

// ---------- A: the film ----------
const SX = 40, SY = 150, SW = W - 80, SH = 360; // the screen, wide like 70 mm film
function cinema(t, a) {
  A(a, () => {
    // seats
    ctx.fillStyle = '#1c1b1a';
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { k.rrect(30 + i * 92 + (r % 2) * 46, 560 + r * 70, 74, 50, 14); ctx.fill(); }
    // the screen
    ctx.fillStyle = C.screen; ctx.fillRect(SX, SY, SW, SH);
    ctx.strokeStyle = 'rgba(224,164,58,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(SX, SY, SW, SH);
    font(700, 26, HEAD); text('PATTON · 1970', SX, SY - 26, { base: 'middle', color: C.amber, spacing: '4px' });
    font(400, 20, HEAD); text('drawn for this clip, not a still from the film', SX + SW, SY - 26, { align: 'right', base: 'middle', color: C.faint });
  });
}
/** Inside the screen: shot 1 a bedside with a book, shot 2 a hill with a figure and binoculars, tanks below. */
function filmShots(t) {
  ctx.save(); ctx.beginPath(); ctx.rect(SX, SY, SW, SH); ctx.clip();
  // shot 1: night, a lamp, a nightstand and a book
  A(span(t, 1.0, 9.6, 0.6, 0.5), () => {
    ctx.fillStyle = '#20180f'; ctx.fillRect(SX, SY, SW, SH);
    const lamp = 0.6 + 0.4 * seg(t, 5.0, 5.6);
    const g = ctx.createRadialGradient(560, 260, 10, 560, 260, 300); g.addColorStop(0, `rgba(224,164,58,${0.45 * lamp})`); g.addColorStop(1, 'rgba(224,164,58,0)');
    ctx.fillStyle = g; ctx.fillRect(SX, SY, SW, SH);
    ctx.fillStyle = '#3a2c1c'; ctx.fillRect(470, 390, 220, 120); // nightstand
    ctx.fillStyle = '#5a4630'; ctx.fillRect(540, 300, 12, 90); ctx.beginPath(); ctx.moveTo(510, 300); ctx.lineTo(582, 300); ctx.lineTo(566, 262); ctx.lineTo(526, 262); ctx.closePath(); ctx.fill();
    // the book
    A(seg(t, 5.4, 6.0), () => {
      ctx.save(); ctx.translate(620, 382); ctx.rotate(-0.06);
      ctx.fillStyle = '#7a1f1a'; ctx.fillRect(-60, -16, 120, 18); ctx.fillStyle = '#d9c9a3'; ctx.fillRect(-56, -14, 112, 3);
      ctx.restore();
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(660, 368); ctx.lineTo(760, 250); ctx.stroke();
      font('italic 600', 28, FILM); text('“The Tank in Attack”', SX + SW - 24, SY + 50, { align: 'right', base: 'middle', color: C.amber });
      font(400, 22, HEAD); text('by Erwin Rommel', SX + SW - 24, SY + 84, { align: 'right', base: 'middle', color: C.soft });
    });
    // the bed and a waking figure
    ctx.fillStyle = '#2c2318'; ctx.fillRect(90, 400, 340, 80);
    ctx.fillStyle = '#4a3c2b'; ctx.fillRect(100, 380, 90, 30);
    ctx.fillStyle = C.ink; ctx.globalAlpha *= 0.9; ctx.beginPath(); ctx.arc(160, 360 - 14 * seg(t, 2.0, 2.8), 18, 0, TAU); ctx.fill();
    A(seg(t, 2.2, 2.8) * (1 - seg(t, 8.6, 9.2)), () => { font('italic 500', 28, FILM); text('Rommel is about to attack', 120, 230, { base: 'middle', color: C.ink }); });
  });
  // shot 2: dawn on a ridge; the general watches tanks in the valley below
  A(span(t, 9.4, 18.8, 0.6, 0.5), () => {
    const sky = ctx.createLinearGradient(0, SY, 0, SY + SH); sky.addColorStop(0, '#3b2a1a'); sky.addColorStop(1, '#a8733a');
    ctx.fillStyle = sky; ctx.fillRect(SX, SY, SW, SH);
    ctx.fillStyle = '#6b5233'; ctx.beginPath(); ctx.moveTo(SX, SY + 250); ctx.lineTo(SX + 300, SY + 200); ctx.lineTo(SX + SW, SY + 260); ctx.lineTo(SX + SW, SY + SH); ctx.lineTo(SX, SY + SH); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a1f14'; ctx.beginPath(); ctx.moveTo(SX, SY + 200); ctx.quadraticCurveTo(SX + 140, SY + 150, SX + 260, SY + 210); ctx.lineTo(SX + 260, SY + SH); ctx.lineTo(SX, SY + SH); ctx.closePath(); ctx.fill();
    // the general with binoculars, a silhouette
    const gx = SX + 150, gy = SY + 180;
    ctx.fillStyle = '#120d08';
    ctx.beginPath(); ctx.arc(gx, gy - 52, 11, 0, TAU); ctx.fill();
    ctx.fillRect(gx - 14, gy - 66, 28, 6); // helmet brim
    ctx.beginPath(); ctx.moveTo(gx - 13, gy - 40); ctx.lineTo(gx + 13, gy - 40); ctx.lineTo(gx + 10, gy); ctx.lineTo(gx - 10, gy); ctx.closePath(); ctx.fill();
    ctx.fillRect(gx + 8, gy - 56, 16, 8);
    // tanks far below, small boxes moving left
    for (let i = 0; i < 7; i++) {
      const x = SX + SW - ((t - 9.4) * 26 + i * 70) % (SW - 260) - 20, y = SY + 290 + (i % 2) * 18;
      ctx.fillStyle = '#2e2a24'; ctx.fillRect(x - 14, y - 7, 28, 12); ctx.fillRect(x - 6, y - 13, 12, 6);
    }
    A(seg(t, 14.4, 15.0), () => { font('italic 500', 28, FILM); text('“… I read your book!”', SX + SW - 30, SY + 60, { align: 'right', base: 'middle', color: C.ink }); });
  });
  ctx.restore();
}

// ---------- B: the record ----------
function sceneRecord(t) {
  A(span(t, 18.6, 28.0, 0.5, 0.4), () => {
    font(700, 36, HEAD); text('THE RECORD, MARCH 1943', CX, 120, { align: 'center', base: 'middle', color: C.steel, spacing: '3px' });
    const L = 90, R = 774, y = 380, X = (d) => L + (R - L) * ((d - 1) / 30);
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
    for (const d of [1, 10, 20, 31]) { font(400, 22, HEAD); text(`${d}`, X(d), y + 34, { align: 'center', base: 'middle', color: C.soft }); ctx.fillStyle = C.faint; ctx.fillRect(X(d) - 1, y - 8, 2, 16); }
    font(500, 22, HEAD); text('March 1943', R, y + 70, { align: 'right', base: 'middle', color: C.soft });
    const marks = [[COMMAND, 19.0, 'Patton takes command of US II Corps', C.steel, -1, 90], [ROMMEL_LEFT, 23.6, 'Rommel leaves Africa for good', C.rust, 1, 140], [ATTACK, 25.2, 'German attack at El Guettar', C.amber, -1, 190]];
    marks.forEach(([d, t0, s, col, side, off]) => A(seg(t, t0, t0 + 0.6), () => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(d), y, 12, 0, TAU); ctx.fill();
      const ty = y + side * off;
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(d), y + side * 14); ctx.lineTo(X(d), ty - side * 26); ctx.stroke();
      font(700, 30, HEAD); text(`${d} March`, X(d), ty - side * 2 - 16, { align: d > 20 ? 'right' : 'left', base: 'middle', color: col });
      font(500, 24, HEAD); text(s, X(d), ty + 18, { align: d > 20 ? 'right' : 'left', base: 'middle', color: C.ink });
    }));
    // the gap
    A(seg(t, 26.0, 26.6), () => {
      ctx.fillStyle = 'rgba(192,88,58,0.25)'; ctx.fillRect(X(ROMMEL_LEFT), y - 6, X(ATTACK) - X(ROMMEL_LEFT), 12);
      font(600, 28, HEAD); text(`${ATTACK - ROMMEL_LEFT} days apart`, (X(ROMMEL_LEFT) + X(ATTACK)) / 2, 640, { align: 'center', base: 'middle', color: C.rust });
    });
  });
}

// ---------- C, D: the valley ----------
// a schematic valley, west (El Guettar) on the left, east (Gabès) on the right
const ROAD_Y = 470, MINE_X = 460;
function valley(t) {
  ctx.fillStyle = C.sand; ctx.fillRect(0, 150, W, 620);
  // hills, north and south of the road
  ctx.fillStyle = C.hill;
  ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(W, 150); ctx.lineTo(W, 260); ctx.quadraticCurveTo(620, 360, 420, 300); ctx.quadraticCurveTo(220, 250, 0, 330); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 770); ctx.lineTo(W, 770); ctx.lineTo(W, 690); ctx.quadraticCurveTo(640, 580, 430, 630); ctx.quadraticCurveTo(220, 680, 0, 610); ctx.closePath(); ctx.fill();
  // the road
  ctx.strokeStyle = C.sand2; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, ROAD_Y + 10); ctx.quadraticCurveTo(430, ROAD_Y - 20, W, ROAD_Y + 6); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([14, 12]); ctx.stroke(); ctx.setLineDash([]);
  font(600, 24, HEAD);
  text('El Guettar', 24, ROAD_Y - 34, { base: 'middle', color: '#3a2f1e' });
  text('← to Gafsa', 24, ROAD_Y + 44, { base: 'middle', color: '#3a2f1e' });
  text('to Gabès →', W - 24, ROAD_Y + 44, { align: 'right', base: 'middle', color: '#3a2f1e' });
  font(400, 20, HEAD); text('schematic plan', W - 24, 752, { align: 'right', base: 'middle', color: 'rgba(58,47,30,0.7)' });
}
function minefield(a) {
  A(a, () => {
    ctx.fillStyle = 'rgba(59,47,34,0.18)'; ctx.fillRect(MINE_X - 40, 300, 80, 330);
    ctx.fillStyle = C.mine;
    for (let i = 0; i < 26; i++) { const x = MINE_X - 30 + ((i * 37) % 60), y = 320 + ((i * 53) % 300); ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill(); }
    font(600, 22, HEAD); text('minefield, Keddab wadi', MINE_X, 288, { align: 'center', base: 'middle', color: '#3a2f1e' });
  });
}
function tank(x, y, col, stopped) {
  ctx.fillStyle = col; ctx.fillRect(x - 18, y - 8, 36, 16); ctx.fillRect(x - 8, y - 16, 16, 8); ctx.fillRect(x - 26, y - 13, 18, 3);
  if (stopped) { ctx.strokeStyle = '#3a2f1e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 14, y - 14); ctx.lineTo(x + 14, y + 10); ctx.moveTo(x + 14, y - 14); ctx.lineTo(x - 14, y + 10); ctx.stroke(); }
}
function sceneValley(t) {
  A(span(t, 27.8, 55.6, 0.5, 0.4), () => {
    valley(t);
    font(700, 34, HEAD); text('EL GUETTAR, 23 MARCH 1943', CX, 112, { align: 'center', base: 'middle', color: C.steel, spacing: '2px' });
    // American positions on the hills: 1st Infantry Division, guns and tank destroyers
    A(seg(t, 28.4, 29.0), () => {
      const pos = [[180, 290], [330, 270], [210, 650], [360, 640]];
      for (const [x, y] of pos) { ctx.fillStyle = C.steel; ctx.beginPath(); ctx.moveTo(x - 22, y + 12); ctx.lineTo(x, y - 14); ctx.lineTo(x + 22, y + 12); ctx.closePath(); ctx.fill(); }
      font(700, 24, HEAD); text('US 1st Infantry Division', 250, 214, { align: 'center', base: 'middle', color: '#1f3550' });
      text('guns and tank destroyers', 280, 704, { align: 'center', base: 'middle', color: '#1f3550' });
    });
    // the German column comes down the road from the east
    const go = eio(seg(t, 29.0, 33.6));
    const stop = seg(t, 33.6, 34.2), hit = seg(t, 37.2, 38.4), back = eio(seg(t, 41.8, 44.0));
    A(seg(t, 28.8, 29.4), () => {
      font(700, 24, HEAD); text('German 10th Panzer Division', W - 24, 412, { align: 'right', base: 'middle', color: '#7a2c18' });
      for (let i = 0; i < 12; i++) {
        const row = i % 2, col = Math.floor(i / 2);
        const front = lerp(W + 40, MINE_X + 46, go) + back * 320;
        const x = front + col * 54, y = ROAD_Y - 12 + row * 30 + (col % 2) * 6;
        const stopped = (i < 4 && stop > 0.5) || (i >= 4 && i < 10 && hit > 0.5 && i % 2 === 0);
        if (x < W + 40) tank(x, y, C.rust, stopped);
      }
    });
    minefield(seg(t, 32.6, 33.2));
    // fire from the hills: thin lines, no explosions
    A(seg(t, 37.2, 37.6) * (1 - seg(t, 41.4, 41.8)), () => {
      ctx.strokeStyle = 'rgba(31,53,80,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t * 40;
      for (const [x, y] of [[180, 290], [330, 270], [210, 650], [360, 640]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(MINE_X + 120, ROAD_Y); ctx.stroke(); }
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
    });
    // counts
    A(seg(t, 34.0, 34.6) * (1 - seg(t, 41.4, 41.8)), () => {
      ctx.fillStyle = 'rgba(18,18,18,0.82)'; k.rrect(470, 560, 370, 150, 12); ctx.fill();
      font(800, 36, HEAD); text(`${STUCK} stopped by mines`, 655, 610, { align: 'center', base: 'middle', color: C.amber });
      A(hit, () => { font(600, 28, HEAD); text(`about ${KNOCKED} more by gunfire`, 655, 664, { align: 'center', base: 'middle', color: C.ink }); });
    });
    A(seg(t, 42.0, 42.6) * (1 - seg(t, 46.0, 46.4)), () => {
      ctx.fillStyle = 'rgba(18,18,18,0.82)'; k.rrect(470, 560, 360, 150, 12); ctx.fill();
      font(700, 32, HEAD); text('midday: they pull back', 650, 610, { align: 'center', base: 'middle', color: C.amber });
      font(500, 26, HEAD); text('evening: stopped again', 650, 660, { align: 'center', base: 'middle', color: C.ink });
    });
    // D: into April
    A(seg(t, 46.6, 47.2), () => {
      ctx.fillStyle = C.black; ctx.fillRect(0, 60, W, 710);
      font(700, 34, HEAD); text('THEN, UNTIL EARLY APRIL', CX, 230, { align: 'center', base: 'middle', color: C.steel, spacing: '2px' });
      const L = 90, R = 774, y = 400, X = (d) => L + (R - L) * ((d - 23) / 16);
      ctx.fillStyle = C.faint; ctx.fillRect(L, y - 3, R - L, 6);
      ctx.fillStyle = C.amber; ctx.fillRect(L, y - 6, (R - L) * eio(seg(t, 47.2, 49.6)), 12);
      font(500, 22, HEAD);
      text('23 March', X(23), y + 36, { align: 'center', base: 'middle', color: C.soft });
      text('7 April', X(39), y + 36, { align: 'center', base: 'middle', color: C.soft });
      A(seg(t, 48.0, 48.6), () => { font(500, 28, HEAD); text('American attacks on the hills, at a cost', CX, 320, { align: 'center', base: 'middle', color: C.ink }); });
      A(seg(t, 51.2, 51.8), () => {
        ctx.fillStyle = C.steel; ctx.beginPath(); ctx.arc(X(39), y, 14, 0, TAU); ctx.fill();
        font(500, 28, HEAD); text('US tanks meet the British Eighth Army', CX, 520, { align: 'center', base: 'middle', color: C.ink });
        text('on the road to Gabès', CX, 562, { align: 'center', base: 'middle', color: C.soft });
      });
    });
  });
}

// ---------- E: what the film changed ----------
function sceneChanges(t) {
  A(span(t, 55.4, 65.0, 0.4, 0), () => {
    font(700, 36, HEAD); text('WHAT THE FILM CHANGES', CX, 130, { align: 'center', base: 'middle', color: C.amber, spacing: '3px' });
    const rows = [['Rommel in command', 'Rommel had left Africa'], ['one morning’s victory', 'two weeks, no breakthrough'], ['Tunisia', 'Almería, Spain']];
    font(600, 24, HEAD); text('ON SCREEN', 230, 220, { align: 'center', base: 'middle', color: C.amber }); text('IN 1943', 634, 220, { align: 'center', base: 'middle', color: C.steel });
    rows.forEach(([a, b], i) => A(seg(t, 56.0 + i * 1.6, 56.6 + i * 1.6), () => {
      const y = 310 + i * 130;
      ctx.fillStyle = 'rgba(224,164,58,0.14)'; k.rrect(40, y - 48, 380, 96, 10); ctx.fill();
      ctx.fillStyle = 'rgba(127,166,201,0.16)'; k.rrect(444, y - 48, 380, 96, 10); ctx.fill();
      font('italic 600', 30, FILM); text(a, 230, y, { align: 'center', base: 'middle', color: C.ink });
      font(600, 28, HEAD); text(b, 634, y, { align: 'center', base: 'middle', color: C.ink });
      font(700, 30, HEAD); text('→', 432, y, { align: 'center', base: 'middle', color: C.soft });
    }));
    A(seg(t, 61.0, 61.6), () => { font(500, 24, HEAD); text('The defence was the work of the 1st Infantry Division’s gunners and riflemen.', CX, 712, { align: 'center', base: 'middle', color: C.soft }); });
  });
}

const CUES = [
  [0.4, 4.8, 'In the film *Patton* (1970), George C. Scott plays US General George S. Patton in Tunisia.'],
  [5.0, 9.4, 'His aides wake him with the news: Rommel is about to attack. A book lies by his bed.'],
  [9.6, 14.0, 'It is ~The Tank in Attack~, by Erwin Rommel, a book Rommel planned but never finished.'],
  [14.2, 18.6, 'Watching German tanks driven back at El Guettar, Patton cries out that he read Rommel’s book.'],
  [18.8, 23.2, 'What happened? Patton took command of the US II Corps in Tunisia on *6 March 1943*.'],
  [23.4, 27.8, 'On *9 March* Field Marshal Erwin Rommel left Africa for good. He was not at El Guettar.'],
  [28.0, 32.4, 'On *23 March* the German 10th Panzer Division attacked the US 1st Infantry Division there.'],
  [32.6, 37.0, 'At the Keddab wadi a minefield stopped *eight* tanks in their tracks.'],
  [37.2, 41.6, 'American artillery and tank destroyers on the hills knocked out about *thirty* more.'],
  [41.8, 46.2, 'By midday the Germans pulled back; that evening, artillery broke up a second attack.'],
  [46.4, 50.8, 'The fighting went on into April: costly American attacks on the hills, and no breakthrough.'],
  [51.0, 55.4, 'On *7 April* American tanks met the British Eighth Army on the road to Gabès.'],
  [55.6, 60.0, 'The film turns weeks of fighting into one morning, and a German division into ~Rommel~.'],
  [60.2, 64.6, 'And it was shot in Almería, in Spain: Tunisia’s El Guettar valley never appears on screen.'],
];

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [HEAD, FILM],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    ctx.fillStyle = C.black; ctx.fillRect(0, 0, W, H);
    A(span(t, 0, 18.8, 0.4, 0.4), () => { cinema(t, 1); filmShots(t); });
    sceneRecord(t);
    sceneValley(t);
    sceneChanges(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 36, weight: 500, family: HEAD, ink: C.ink, marks: { '*': C.amber, '~': C.steel } });
  },
});
