// Explainer for engineering-longstop-hill-three-names (Tunisia 1943, Visit): Longstop Hill, the ridge of Djebel el
// Ahmera and Djebel Rhar north of Medjez el Bab, named for a cricket fielder by British soldiers and "Christmas Hill" by
// German ones after the fighting of December 1942; taken in April 1943. What a visitor sees from the road today.
// Look: the ridge in profile like a landscape painter's study, cold blue-grey for December and spring green for April,
// a cricket field seen from above. Bitter for titles, Barlow for captions and labels.
//
// Facts:
// - Wikipedia, "Battle of Longstop Hill": the massif is known as Longstop Hill and vicinity; the Germans called it
//   "Der Weihnachtsberg"; the name Longstop comes from the lay-back position behind the wicket keeper in cricket;
//   north of Medjez el Bab, some 30 miles (48 km) from Tunis, in the Medjerda valley; Djebel Rhar is the higher,
//   western-to-northern peak, Djebel el Ahmera the other; "the last great natural barrier on the road to Tunis", held by
//   the Germans. On the night of 22/23 December 1942 the 2nd Battalion, Coldstream Guards took the massif in heavy rain
//   and were relieved by the US 18th Regimental Combat Team; a German counter-attack forced the Americans off Djebel el
//   Ahmera; the Guards retook it, but a German counter-attack on Christmas Day drove them off; Allied progress toward
//   Tunis was halted. April 1943 (21–26 April), Operation Vulcan, 78th Division with Churchill tanks of the North Irish
//   Horse: the 8th Argyll and Sutherland Highlanders took Djebel el Ahmera; their commander Colin McNabb was killed and
//   Major John "Jock" Anderson took over and was awarded the Victoria Cross: he "captured Longstop Hill with a total
//   force of only four officers and less than forty other ranks"; on 26 April Churchill tanks climbed the steep slopes,
//   one reaching the summit first; the battle was over by 11:00; about 650 prisoners.
// - Wikipedia, "Fielding (cricket)": the long stop stands behind the wicket-keeper towards the boundary, used when the
//   keeper is thought weak; almost never seen in professional cricket today.
// The ridge profile, the plan and the arrows are schematic. No casualty figures are animated.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  Where: north of Medjez el Bab, 48 km from Tunis; two summits.
//  B  9.6–18.6  The long stop in cricket; the last barrier on the road to Tunis.
//  C 18.8–37.0  December 1942: the Guards, the Americans, Christmas Day; Weihnachtsberg.
//  D 37.2–55.4  April 1943: the 78th Division, the Argylls, Anderson's Victoria Cross, 26 April.
//  E 55.6–65.2  Today, from the road; three names.
const W = 864, H = 1080, CX = W / 2;
const { seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  winter0: '#1c2733', winter1: '#43566a', spring0: '#2a4a5e', spring1: '#9cc3c9',
  ridgeW: '#4f5b4f', ridgeS: '#6f8a4a', ridgeS2: '#56703a', field: '#7b8f4a', fieldW: '#3f4a3c',
  ink: '#f6f3ea', soft: 'rgba(246,243,234,0.8)', faint: 'rgba(246,243,234,0.3)',
  gold: '#f2c14e', blue: '#8ec5ff', us: '#bfe0ff', red: '#ff8c69', green: '#a8e07a', river: '#6fa8c8', pitch: '#d9c48a', grass: '#4f8a3f',
};
const TITLE = 'Bitter', SANS = 'Barlow';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const TO_TUNIS_KM = 48, OFFICERS = 4, MEN = 40, OVER_BY = 11;
if (TO_TUNIS_KM !== Math.round(30 * 1.609)) throw new Error('miles');

// ---------- the ridge in profile, seen from the south ----------
const BASE = 600;
const RIDGE = [[0, BASE], [80, 560], [170, 470], [250, 360], [300, 330], [350, 350], [420, 410], [470, 430], [520, 400], [580, 368], [630, 380], [700, 450], [790, 520], [W, 560], [W, BASE]];
const RHAR = [300, 330], AHMERA = [580, 368];
function ridge(spring) {
  ctx.fillStyle = spring > 0.5 ? C.ridgeS : C.ridgeW;
  ctx.beginPath(); ctx.moveTo(0, BASE); for (const [x, y] of RIDGE) ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
  if (spring > 0) A(spring, () => { ctx.fillStyle = C.ridgeS2; for (let i = 0; i < 40; i++) { const x = (i * 71) % W, y = 470 + ((i * 37) % 110); ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill(); } });
  // the valley floor, the road and the river
  ctx.fillStyle = spring > 0.5 ? C.field : C.fieldW; ctx.fillRect(0, BASE, W, 180);
  ctx.strokeStyle = '#2f2f2f'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 640); ctx.quadraticCurveTo(CX, 620, W, 650); ctx.stroke();
  ctx.strokeStyle = C.river; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 720); ctx.bezierCurveTo(260, 690, 520, 760, W, 710); ctx.stroke();
}
function summitTags(a, which = 'both') {
  A(a, () => {
    const tagAt = ([x, y], s, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y - 60); ctx.stroke(); font(700, 26, TITLE); text(s, x, y - 78, { align: 'center', base: 'middle', color: col }); };
    if (which !== 'ahmera') tagAt(RHAR, 'Djebel Rhar', C.ink);
    if (which !== 'rhar') tagAt(AHMERA, 'Djebel el Ahmera', C.gold);
  });
}
function arrow(x0, y0, x1, y1, col, u = 1, wdt = 9) {
  const x = lerp(x0, x1, u), y = lerp(y0, y1, u), a = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = col; ctx.lineWidth = wdt; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 20, y + Math.sin(a) * 20); ctx.lineTo(x + Math.cos(a + 2.4) * 20, y + Math.sin(a + 2.4) * 20); ctx.lineTo(x + Math.cos(a - 2.4) * 20, y + Math.sin(a - 2.4) * 20); ctx.closePath(); ctx.fill();
}
function banner(s, sub, a, col = C.gold) {
  A(a, () => {
    ctx.fillStyle = 'rgba(16,22,30,0.86)'; k.rrect(60, 40, 680, sub ? 116 : 76, 14); ctx.fill();
    font(700, 36, TITLE); text(s, 84, 80, { base: 'middle', color: col });
    if (sub) { font(500, 24); text(sub, 84, 126, { base: 'middle', color: C.ink }); }
  });
}
let sky = null;
function paintSky() {
  const mk = (a, b) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const lg = g.createLinearGradient(0, 0, 0, BASE); lg.addColorStop(0, a); lg.addColorStop(1, b); g.fillStyle = lg; g.fillRect(0, 0, W, BASE); g.fillStyle = '#11161b'; g.fillRect(0, 780, W, H - 780); return c; };
  sky = { winter: mk(C.winter0, C.winter1), spring: mk(C.spring0, C.spring1) };
}

// ---------- A: where ----------
function sceneWhere(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    // a schematic plan first
    const plan = 1 - seg(t, 4.6, 5.4);
    A(plan, () => {
      ctx.fillStyle = '#2b3a2f'; ctx.fillRect(0, 0, W, 780);
      ctx.strokeStyle = C.river; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(60, 700); ctx.bezierCurveTo(260, 600, 420, 520, 820, 220); ctx.stroke();
      const dot = (x, y, s, col, dx = 16, dy = 0) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); font(600, 26); text(s, x + dx, y + dy, { base: 'middle', color: col }); };
      dot(240, 640, 'Medjez el Bab', C.ink);
      ctx.fillStyle = C.ridgeW; ctx.beginPath(); ctx.ellipse(300, 470, 110, 34, -0.3, 0, TAU); ctx.fill();
      font(700, 26, TITLE); text('the ridge', 300, 470, { align: 'center', base: 'middle', color: C.gold });
      arrow(420, 430, 760, 200, C.ink, eout(seg(t, 1.6, 3.4)), 6);
      font(600, 26); text(`Tunis, ${TO_TUNIS_KM} km`, 640, 180, { base: 'middle', color: C.ink });
      text('Medjerda river', 480, 600, { base: 'middle', color: C.river });
      font(400, 22); text('schematic plan', 40, 750, { base: 'middle', color: C.faint });
    });
    A(1 - plan, () => { ridge(0); summitTags(seg(t, 5.6, 6.4)); });
    banner('LONGSTOP HILL', 'north of Medjez el Bab, in the Medjerda valley', seg(t, 0.6, 1.4) * (1 - seg(t, 4.6, 5.0)));
    banner('ONE RIDGE, TWO SUMMITS', 'and, by 1943, three names', seg(t, 5.4, 6.0) * (1 - seg(t, 9.2, 9.6)));
  });
}

// ---------- B: the long stop ----------
function sceneCricket(t) {
  A(span(t, 9.4, 18.8, 0.4, 0.4), () => {
    ctx.fillStyle = '#20301f'; ctx.fillRect(0, 0, W, 780);
    const cx = CX, cy = 430, R = 300;
    A(1 - seg(t, 13.8, 14.4), () => {
      ctx.fillStyle = C.grass; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.92, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
      // the pitch, bowler at the top, batter at the bottom
      ctx.fillStyle = C.pitch; ctx.fillRect(cx - 14, cy - 90, 28, 180);
      const stumps = (y) => { ctx.fillStyle = C.ink; ctx.fillRect(cx - 9, y - 3, 18, 6); };
      stumps(cy - 84); stumps(cy + 84);
      const fig = (x, y, col, s) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill(); font(600, 22); text(s, x + 18, y, { base: 'middle', color: col }); };
      fig(cx + 20, cy - 110, C.ink, 'bowler');
      fig(cx + 22, cy + 70, C.ink, 'batter');
      fig(cx, cy + 124, C.blue, 'wicketkeeper');
      const ls = eout(seg(t, 10.4, 12.0));
      fig(cx, lerp(cy + 124, cy + 250, ls), C.gold, 'long stop');
      // a ball that gets past the keeper
      const u = seg(t, 12.0, 13.4);
      if (u > 0 && u < 1) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(cx + 6, lerp(cy - 84, cy + 240, u), 7, 0, TAU); ctx.fill(); }
    });
    banner('LONG STOP', 'in cricket: far behind the wicketkeeper', seg(t, 9.8, 10.4) * (1 - seg(t, 13.8, 14.2)));
    // the last barrier on the road to Tunis
    A(seg(t, 14.0, 14.6), () => {
      ridge(0); summitTags(1);
      arrow(40, 640, lerp(40, 380, eout(seg(t, 14.6, 16.0))), 640, C.blue, 1, 8);
      font(600, 26); text('road to Tunis', 60, 680, { base: 'middle', color: C.ink });
      font(700, 26, TITLE); text('German troops hold the ridge', CX, 530, { align: 'center', base: 'middle', color: C.red });
    });
    banner('THE LAST BARRIER', 'the last great natural barrier on the road to Tunis', seg(t, 14.4, 15.0) * (1 - seg(t, 18.2, 18.6)), C.blue);
  });
}

// ---------- C: December 1942 ----------
function rain(t, a) {
  A(a, () => { ctx.strokeStyle = 'rgba(200,220,240,0.35)'; ctx.lineWidth = 2; for (let i = 0; i < 90; i++) { const x = (i * 97 + t * 260) % (W + 60) - 30, y = ((i * 53 + t * 900) % 760); if (x > 740 && y < 120) continue; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 22); ctx.stroke(); } });
}
function sceneDecember(t) {
  A(span(t, 18.6, 37.2, 0.4, 0.4), () => {
    ridge(0); summitTags(1);
    rain(t, seg(t, 18.8, 19.6) * (1 - seg(t, 31.0, 32.0)));
    A(seg(t, 18.8, 19.6) * (1 - seg(t, 32.0, 32.4)), () => { ctx.fillStyle = 'rgba(5,10,20,0.35)'; ctx.fillRect(0, 0, W, 780); });
    // the Guards take the massif
    A(seg(t, 19.0, 19.6) * (1 - seg(t, 23.2, 23.6)), () => {
      arrow(500, 700, AHMERA[0], AHMERA[1] + 30, C.blue, eout(seg(t, 19.2, 21.4)));
      arrow(360, 700, RHAR[0] + 10, RHAR[1] + 40, C.blue, eout(seg(t, 19.6, 21.8)));
    });
    banner('22–23 DECEMBER 1942', 'night, heavy rain: the Coldstream Guards take it', seg(t, 19.0, 19.6) * (1 - seg(t, 23.0, 23.4)), C.blue);
    // the Americans hold; a counter-attack
    A(seg(t, 23.6, 24.2) * (1 - seg(t, 27.6, 28.0)), () => {
      ctx.fillStyle = C.us; ctx.beginPath(); ctx.arc(AHMERA[0], AHMERA[1] + 24, 14, 0, TAU); ctx.fill();
      arrow(860, 300, AHMERA[0] + 30, AHMERA[1] + 10, C.red, eout(seg(t, 24.6, 26.4)));
    });
    banner('23 DECEMBER', 'US 18th Infantry take over; pushed off el Ahmera', seg(t, 23.6, 24.2) * (1 - seg(t, 27.6, 28.0)), C.us);
    // the Guards come back; Christmas Day
    A(seg(t, 28.2, 28.8) * (1 - seg(t, 32.2, 32.6)), () => {
      arrow(500, 700, AHMERA[0], AHMERA[1] + 30, C.blue, eout(seg(t, 28.4, 29.8)));
      arrow(860, 280, AHMERA[0] + 30, AHMERA[1] + 6, C.red, eout(seg(t, 30.4, 31.8)));
    });
    banner('25 DECEMBER 1942', 'the Guards retake it; a counter-attack drives them off', seg(t, 28.2, 28.8) * (1 - seg(t, 32.2, 32.6)), C.red);
    // Weihnachtsberg
    A(seg(t, 32.8, 33.4), () => {
      ctx.fillStyle = 'rgba(16,22,30,0.86)'; k.rrect(132, 200, 600, 150, 16); ctx.fill();
      font(700, 44, TITLE); text('Der Weihnachtsberg', CX, 254, { align: 'center', base: 'middle', color: C.gold });
      font(500, 24); text('“Christmas Hill”, the German name', CX, 306, { align: 'center', base: 'middle', color: C.ink });
    });
    banner('THE ALLIED ADVANCE STOPS', 'the push on Tunis halts for months', seg(t, 32.8, 33.4) * (1 - seg(t, 36.6, 37.0)), C.ink);
  });
}

// ---------- D: April 1943 ----------
function tank(x, y, s, col) {
  ctx.fillStyle = col; k.rrect(x - 30 * s, y - 14 * s, 60 * s, 18 * s, 6 * s); ctx.fill();
  ctx.fillRect(x - 12 * s, y - 26 * s, 24 * s, 12 * s); ctx.fillRect(x + 12 * s, y - 22 * s, 22 * s, 4 * s);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x - 30 * s, y - 2 * s, 60 * s, 6 * s);
}
function sceneApril(t) {
  A(span(t, 37.0, 55.6, 0.4, 0.4), () => {
    A(1, () => ctx.drawImage(sky.spring, 0, 0));
    ridge(1); summitTags(1);
    banner('APRIL 1943', 'the British 78th Division attacks again', seg(t, 37.4, 38.0) * (1 - seg(t, 41.4, 41.8)), C.green);
    A(seg(t, 37.6, 38.2) * (1 - seg(t, 41.4, 41.8)), () => {
      for (let i = 0; i < 3; i++) tank(lerp(560 + i * 70, 520 + i * 40, eout(seg(t, 38.4, 41.0))), lerp(700, 560 - i * 20, eout(seg(t, 38.4, 41.0))), 0.9, '#3b4a2c');
      font(600, 24); text('Churchill tanks, North Irish Horse', 520, 760, { align: 'center', base: 'middle', color: C.ink });
    });
    // the Argylls take el Ahmera
    A(seg(t, 42.0, 42.6) * (1 - seg(t, 50.6, 51.0)), () => {
      arrow(640, 700, AHMERA[0] + 6, AHMERA[1] + 24, C.gold, eout(seg(t, 42.2, 44.4)));
      font(600, 24); text('Argyll and Sutherland Highlanders', 840, 748, { align: 'right', base: 'middle', color: C.gold });
    });
    banner('DJEBEL EL AHMERA TAKEN', 'their commander, Lt-Col Colin McNabb, is killed', seg(t, 42.0, 42.6) * (1 - seg(t, 46.0, 46.4)), C.gold);
    A(seg(t, 46.6, 47.2) * (1 - seg(t, 50.6, 51.0)), () => {
      ctx.fillStyle = 'rgba(16,22,30,0.88)'; k.rrect(132, 180, 600, 160, 16); ctx.fill();
      font(700, 36, TITLE); text('Victoria Cross', CX, 224, { align: 'center', base: 'middle', color: C.gold });
      font(500, 24); text('Major John Anderson, 8th Argylls', CX, 270, { align: 'center', base: 'middle', color: C.ink });
      text(`${OFFICERS} officers and fewer than ${MEN} men`, CX, 306, { align: 'center', base: 'middle', color: C.soft });
    });
    // 26 April, the summit
    A(seg(t, 51.2, 51.8), () => {
      const u = eout(seg(t, 51.4, 54.0));
      tank(lerp(420, RHAR[0] + 10, u), lerp(560, RHAR[1] + 2, u), 0.9, '#3b4a2c');
    });
    banner('26 APRIL 1943', `a tank reaches the summit; over by ${OVER_BY}:00`, seg(t, 51.2, 51.8) * (1 - seg(t, 55.0, 55.4)), C.green);
  });
}

// ---------- E: today ----------
function sceneToday(t) {
  A(span(t, 55.4, 65.2, 0.4, 0), () => {
    ctx.drawImage(sky.spring, 0, 0);
    ridge(1);
    // a car on the road
    const u = ((t - 55.4) * 0.07) % 1;
    ctx.fillStyle = '#d9d2c1'; k.rrect(lerp(-80, W + 80, u), 624, 70, 22, 8); ctx.fill();
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(lerp(-80, W + 80, u) + 16, 648, 7, 0, TAU); ctx.arc(lerp(-80, W + 80, u) + 54, 648, 7, 0, TAU); ctx.fill();
    banner('FROM THE ROAD', 'north of Medjez el Bab · ask locally before walking up', seg(t, 55.8, 56.4) * (1 - seg(t, 59.8, 60.2)), C.ink);
    // three names
    A(seg(t, 60.4, 61.0), () => {
      const names = [['Djebel el Ahmera', 'Tunisian name', C.gold], ['Longstop Hill', 'British name', C.blue], ['Der Weihnachtsberg', 'German name', C.red]];
      names.forEach(([n, who, col], i) => {
        const y = 110 + i * 92, a = seg(t, 60.6 + i * 0.6, 61.2 + i * 0.6);
        A(a, () => {
          ctx.fillStyle = 'rgba(16,22,30,0.86)'; k.rrect(140, y - 36, 584, 76, 14); ctx.fill();
          font(700, 32, TITLE); text(n, 164, y - 2, { base: 'middle', color: col });
          font(500, 22); text(who, 700, y, { align: 'right', base: 'middle', color: C.soft });
        });
      });
    });
  });
}

const CUES = [
  [0.4, 4.8, `North of Medjez el Bab, about ${TO_TUNIS_KM} km from Tunis, a long ridge rises over the Medjerda valley.`],
  [5.0, 9.4, 'Its two summits are *Djebel el Ahmera* and Djebel Rhar. British soldiers called it ~Longstop Hill~.'],
  [9.6, 14.0, 'In cricket, the *long stop* stands far behind the wicketkeeper, to stop the balls that get past.'],
  [14.2, 18.6, 'The ridge was the last great natural barrier on the road to Tunis, and German troops held it.'],
  [18.8, 23.2, 'On the night of 22 to 23 December 1942, in heavy rain, British Coldstream Guards took it.'],
  [23.4, 27.8, 'American soldiers of the 18th Infantry took over; a German counter-attack pushed them off Djebel el Ahmera.'],
  [28.0, 32.4, 'The Guards came back and took it again. On Christmas Day another counter-attack drove them off.'],
  [32.6, 37.0, 'The Germans called it *der Weihnachtsberg*, Christmas Hill. The Allied push on Tunis stopped for months.'],
  [37.2, 41.6, 'In April 1943 the British 78th Division attacked again, with Churchill tanks of the North Irish Horse.'],
  [41.8, 46.2, 'The Argyll and Sutherland Highlanders took Djebel el Ahmera. Their commander, Colin McNabb, was killed.'],
  [46.4, 50.8, `With ${OFFICERS} officers and fewer than ${MEN} men, Major John Anderson took the hill: he won the *Victoria Cross*.`],
  [51.0, 55.4, `On 26 April a British tank reached the top, and by ${OVER_BY} in the morning the battle was over.`],
  [55.6, 60.0, 'Today you see the ridge from the road north of Medjez el Bab. Ask locally before walking up.'],
  [60.2, 64.6, 'One hill, three names: Tunisian, British and German, each left by the people who were there.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!sky) paintSky();
    ctx.drawImage(sky.winter, 0, 0);
    sceneWhere(t);
    sceneCricket(t);
    sceneDecember(t);
    sceneApril(t);
    sceneToday(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 36, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.blue } });
  },
});
