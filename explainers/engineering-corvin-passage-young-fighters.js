// Explainer for engineering-corvin-passage-young-fighters (Hungary 1956, The freedom fight): the armed resistance in
// Budapest from 24 October 1956: the Soviet troops already stationed in Hungary drawn into street fighting, the
// Corvin köz and the Kilián barracks, the tactic of wide avenues and narrow side streets, the groups at Széna tér and
// Móricz Zsigmond körtér, the young people who fought, the ceasefire of 28 October and what the fighting cost. Look:
// a dusk-grey schematic plan of the blocks around the Corvin cinema, tanks as plain grey blocks, fighters as amber
// dots, movements as arrows; no explosions, no weapons drawn, no falling figures. Bitter for headings, Jost for
// the captions.
//
// Facts:
// - UN Special Committee on the Problem of Hungary, Report (A/3592, 1957): before October the 2nd and 17th Soviet
//   mechanized divisions were stationed in Hungary, "about 20,000 men and 600 tanks"; petrol bombs ("Molotov
//   cocktails") "proved highly effective against the power of Soviet armour, which found it difficult to manoeuvre,
//   especially in narrow streets, and to compete with the mobility of the young Hungarian fighters, who included
//   some not yet out of childhood"; Soviet units had "insufficient infantry support"; some Soviet soldiers "disliked
//   the task assigned to them", "a number of cases of fraternization"; "people of all ages and occupations", "the
//   youth of the capital played a leading part"; Csepel factory workers went to help in the city; the Kilián
//   barracks, "an old and strong brick structure on Üllői Avenue", where a Hungarian army unit under Colonel Pál
//   Maléter "took sides with the insurgents"; the Corvin cinema, "a strong, circular structure" where Üllői út, József
//   körút and Kisfaludy köz meet, about fifty yards away, ringed by four-storey buildings; on 28 October Imre Nagy's
//   government ordered a ceasefire. Footnote: of those who died in the fighting from 23 October to 30 November
//   (registered by 1 January 1957), more than one fifth were under twenty and 28 per cent were 20 to 29.
// - 1956 Institute (rev.hu), lesson 2 and chronology: Soviet units ordered at 9 p.m. on 23 October to advance on
//   Budapest, arriving at dawn on the 24th; their tanks lacked infantry support and had not expected resistance; the
//   groups "keep a constant watch on the main thoroughfares and attack the Soviet military units travelling along
//   them. After each attack they would withdraw into the narrower side streets, where the Soviet tanks could not or
//   dared not follow", supported by the local people; the Corvin köz group (László Iván Kovács, later Gergely
//   Pongrátz), the Tompa utca group, Széna tér (János Szabó), Móricz Zsigmond körtér; people tried to persuade Soviet
//   soldiers in "the sparse school Russian they had learnt"; 28 October, a Soviet attack on the Corvin köz group at
//   dawn is repelled; 29 October, the Corvin köz groups combine, 1,000–1,200 organized rebels; the Soviet forces begin
//   to withdraw from Budapest on 29–30 October.
// - Hungarian Central Statistical Office (KSH), infographic of 23 October 2024 from its 1957 data: dwellings damaged,
//   8th district 18.27%, 9th district 22.98% (Budapest overall 4.1%).
// The street plan is schematic: the blocks, widths and positions are simplified.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0–14.0  24 October: Soviet troops already in Hungary roll into Budapest; who met them.
//  B 14.2–37.0  The Corvin köz and the Kilián barracks; avenues and side streets.
//  C 37.2–46.2  Buda and Csepel; Soviet soldiers who did not want the fight.
//  D 46.4–55.4  28–30 October: the attack fails, the ceasefire, the withdrawal.
//  E 55.6–64.6  The cost: the young dead; the damaged homes.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#1d1b20', bg2: '#0e0d10', ink: '#f2eee8', soft: 'rgba(242,238,232,0.74)', faint: 'rgba(242,238,232,0.26)', line: 'rgba(242,238,232,0.05)',
  block: '#3b3741', blockEdge: '#57515f', street: '#141317', tank: '#a3acb7', fighter: '#eab04c', red: '#cf4b40', green: '#5c9a66', panel: 'rgba(12,11,14,0.86)',
};
const HEAD = 'Bitter', TXT = 'Jost';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the street plan around the Corvin köz (schematic) ----------
// Üllői út runs from the upper left to the lower right; the Grand Boulevard (József körút / Ferenc körút) crosses it.
const ULLOI = [[60, 250], [800, 640]];
const KORUT = [[470, 170], [430, 760]];
const along = (seg2, u) => [lerp(seg2[0][0], seg2[1][0], u), lerp(seg2[0][1], seg2[1][1], u)];
const CROSS = [452, 466];         // where they meet
const CORVIN = [372, 520];        // the round cinema, west of the crossing, south of Üllői út
const KILIAN = [540, 388];        // the barracks across Üllői út
const BLOCKS = [ // [x, y, w, h], drawn under the streets
  [80, 150, 330, 70], [500, 150, 300, 110], [90, 300, 300, 120], [560, 300, 250, 30],
  [100, 470, 180, 260], [300, 590, 110, 150], [490, 480, 150, 120], [660, 470, 160, 80], [480, 640, 300, 110],
];
function street(seg2, w, col = C.street) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(...seg2[0]); ctx.lineTo(...seg2[1]); ctx.stroke();
}
function plan(a) {
  A(a, () => {
    for (const [x, y, w, h] of BLOCKS) { ctx.fillStyle = C.block; ctx.fillRect(x, y, w, h); ctx.strokeStyle = C.blockEdge; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h); }
    street(ULLOI, 54); street(KORUT, 58);
    // narrow side streets and the passage
    for (const s of [[[290, 330], [250, 760]], [[150, 270], [120, 760]], [[620, 330], [700, 760]], [[372, 520], [300, 560]], [[372, 520], [330, 480]]]) street(s, 16);
    // the Corvin cinema: a circle in its ring of houses
    ctx.fillStyle = '#4a4552'; ctx.fillRect(CORVIN[0] - 70, CORVIN[1] - 60, 140, 120);
    ctx.fillStyle = C.street; ctx.beginPath(); ctx.arc(CORVIN[0], CORVIN[1], 44, 0, TAU); ctx.fill();
    ctx.fillStyle = '#6a6474'; ctx.beginPath(); ctx.arc(CORVIN[0], CORVIN[1], 34, 0, TAU); ctx.fill();
    // the Kilián barracks: a long brick block
    ctx.fillStyle = '#6b4a3c'; ctx.fillRect(KILIAN[0] - 60, KILIAN[1] - 40, 150, 70);
    ctx.strokeStyle = '#8a6250'; ctx.lineWidth = 2; ctx.strokeRect(KILIAN[0] - 60, KILIAN[1] - 40, 150, 70);
    font(600, 22); text('Üllői út', ...along(ULLOI, 0.12), { color: C.soft, align: 'center' });
    ctx.save(); ctx.translate(...along(KORUT, 0.08)); ctx.rotate(-1.5); font(600, 22); text('Grand Boulevard', 0, 0, { color: C.soft, align: 'center' }); ctx.restore();
    font(500, 22); text('Schematic plan', 70, 780, { color: C.faint });
  });
}
/** A tank: a plain grey block with a short barrel, pointing along `ang`. */
function tank(x, y, ang, a = 1) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = C.tank; k.rrect(-26, -15, 52, 30, 4); ctx.fill();
    ctx.fillStyle = '#7d858f'; ctx.beginPath(); ctx.arc(2, 0, 10, 0, TAU); ctx.fill();
    ctx.fillRect(8, -2.5, 26, 5);
    ctx.restore();
  });
}
function fighters(pts, a = 1) {
  A(a, () => { ctx.fillStyle = C.fighter; for (const [x, y] of pts) { ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill(); } });
}
function arrow(from, to, g, col, w = 6) {
  if (g <= 0) return;
  const x = lerp(from[0], to[0], g), y = lerp(from[1], to[1], g), d = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1, ux = (to[0] - from[0]) / d, uy = (to[1] - from[1]) / d;
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash([12, 9]);
  ctx.beginPath(); ctx.moveTo(...from); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  const s = w * 2.3; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + ux * s, y + uy * s); ctx.lineTo(x - uy * s * 0.7, y + ux * s * 0.7); ctx.lineTo(x + uy * s * 0.7, y - ux * s * 0.7); ctx.closePath(); ctx.fill();
}

// ---------- A: 24 October ----------
// a schematic Budapest: the Danube, Buda to the west, Pest to the east
const DANUBE = [[300, 150], [330, 260], [360, 360], [372, 440], [384, 540], [420, 650], [470, 760]];
function danube(a, w = 30) {
  A(a, () => {
    ctx.strokeStyle = '#2f4b63'; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); DANUBE.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke(); ctx.lineCap = 'butt';
  });
}
function sceneCity(t) {
  A(span(t, 0.2, 14.2, 0.5, 0.5), () => {
    danube(1);
    font(700, 30, HEAD); text('BUDA', 150, 230, { align: 'center', color: C.soft, spacing: '3px' }); text('PEST', 700, 230, { align: 'center', color: C.soft, spacing: '3px' });
    font(500, 22); text('Schematic map', 70, 780, { color: C.faint });
    // tanks coming in along the roads from the east and south-east (cue 1)
    const roads = [[[860, 300], [520, 420]], [[860, 520], [520, 470]], [[760, 780], [500, 520]]];
    roads.forEach((r, i) => {
      const g = eio(seg(t, 0.8 + i * 0.4, 4.4 + i * 0.4));
      arrow(r[0], r[1], g, C.tank, 5);
      const [x, y] = along(r, g * 0.92); tank(x, y, Math.atan2(r[1][1] - r[0][1], r[1][0] - r[0][0]), seg(t, 0.8 + i * 0.4, 1.2 + i * 0.4));
    });
    A(seg(t, 1.0, 1.6), () => { font(700, 30, HEAD); text('24 October 1956', 70, 112, { color: C.ink }); font(500, 23); text('dawn', 70, 148, { color: C.soft }); });
    // what was stationed in Hungary (cue 2)
    A(span(t, 5.0, 9.6, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(470, 590, 360, 150, 14); ctx.fill();
      font(600, 22); text('already stationed in Hungary', 490, 620, { color: C.soft });
      font(700, 40, HEAD); text(fmt(20000), 490, 664, { color: C.tank });
      font(600, 23); text('Soviet troops', 490 + 140, 666, { color: C.ink });
      font(700, 30, HEAD); text(fmt(600), 490, 712, { color: C.tank });
      font(600, 23); text('tanks', 490 + 70, 714, { color: C.ink });
    });
    // who met them (cue 3): amber dots appear along the streets of Pest
    A(seg(t, 9.8, 10.6), () => {
      const pts = [[480, 330], [520, 360], [600, 400], [640, 470], [560, 520], [500, 560], [700, 360], [610, 600], [450, 600]];
      pts.forEach((p, i) => A(seg(t, 9.8 + i * 0.15, 10.2 + i * 0.15), () => fighters([p])));
      ctx.fillStyle = C.panel; k.rrect(470, 590, 360, 150, 14); ctx.fill();
      font(700, 26, HEAD); text('Armed groups', 490, 626, { color: C.fighter });
      font(500, 22); text('young workers and students,', 490, 662, { color: C.ink });
      text('some barely past childhood', 490, 692, { color: C.ink });
      text('formed overnight', 490, 722, { color: C.soft });
    });
  });
}

// ---------- B: Corvin köz and Kilián ----------
function sceneCorvin(t) {
  A(span(t, 14.0, 37.2, 0.6, 0.5), () => {
    plan(1);
    font(700, 30, HEAD); text('Corvin köz · 8th district', 70, 112, { color: C.ink });
    // labels (cues 4–6)
    A(seg(t, 15.0, 15.6), () => {
      ctx.strokeStyle = C.fighter; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(CORVIN[0], CORVIN[1], 52 + 3 * Math.sin(t * 3), 0, TAU); ctx.stroke();
      font(700, 24, HEAD); text('Corvin cinema', CORVIN[0] - 4, CORVIN[1] + 92, { align: 'center', color: C.fighter });
    });
    A(seg(t, 19.4, 20.0) * (1 - seg(t, 27.6, 28.0)), () => {
      font(500, 22); text('a round building', 100, 210, { color: C.ink }); text('ringed by four-storey houses', 100, 238, { color: C.soft });
      ctx.fillStyle = C.panel; k.rrect(88, 186, 330, 72, 10); ctx.globalCompositeOperation = 'destination-over'; ctx.fill(); ctx.globalCompositeOperation = 'source-over';
    });
    A(seg(t, 23.8, 24.4), () => {
      font(700, 24, HEAD); text('Kilián barracks', KILIAN[0] + 15, KILIAN[1] - 62, { align: 'center', color: '#e0a48b' });
      font(500, 21); text('Colonel Pál Maléter', KILIAN[0] + 15, KILIAN[1] + 54, { align: 'center', color: C.ink });
    });
    // the fighters in the passage
    fighters([[CORVIN[0] - 20, CORVIN[1] - 60], [CORVIN[0] + 30, CORVIN[1] - 58], [300, 560], [330, 480], [262, 640], [130, 600]], seg(t, 16.0, 16.8));
    // the tactic (cues 7–8): a tank on the avenue, a strike from the side street, a withdrawal into it
    const go = eio(seg(t, 28.4, 32.0));
    const [tx, ty] = along(ULLOI, lerp(0.02, 0.36, go));
    tank(tx, ty, Math.atan2(ULLOI[1][1] - ULLOI[0][1], ULLOI[1][0] - ULLOI[0][0]), seg(t, 28.2, 28.6) * (1 - seg(t, 36.4, 37.0)));
    A(seg(t, 29.4, 30.0) * (1 - seg(t, 36.4, 37.0)), () => {
      // watch: dashed sight lines from the side streets onto the avenue
      ctx.strokeStyle = 'rgba(234,176,76,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(290, 340); ctx.lineTo(260, 330); ctx.moveTo(150, 290); ctx.lineTo(190, 300); ctx.stroke(); ctx.setLineDash([]);
    });
    const back = eio(seg(t, 33.0, 35.0));
    A(seg(t, 32.6, 33.0) * (1 - seg(t, 36.4, 37.0)), () => {
      arrow([290, 360], [270, 360 + 260 * back], 1, C.fighter, 5);
      arrow([150, 300], [135, 300 + 300 * back], 1, C.fighter, 5);
    });
    A(span(t, 28.2, 37.0, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(470, 620, 370, 130, 14); ctx.fill();
      font(700, 24, HEAD); text('wide avenue', 490, 652, { color: C.tank });
      font(500, 21); text('tanks pass, with almost no infantry', 490, 682, { color: C.ink });
      A(seg(t, 32.8, 33.4), () => { font(700, 24, HEAD); text('narrow streets', 490, 716, { color: C.fighter }); font(500, 21); text('where tanks could not follow', 490, 740, { color: C.ink }); });
    });
  });
}

// ---------- C: Buda, Csepel, and the Soviet soldiers ----------
function sceneCity2(t) {
  A(span(t, 37.0, 46.4, 0.5, 0.5), () => {
    danube(1);
    font(700, 30, HEAD); text('BUDA', 150, 230, { align: 'center', color: C.soft, spacing: '3px' }); text('PEST', 700, 230, { align: 'center', color: C.soft, spacing: '3px' });
    font(500, 22); text('Schematic map', 70, 780, { color: C.faint });
    const spots = [[[250, 300], 'Széna tér', 'right'], [[300, 560], 'Móricz Zsigmond körtér', 'right'], [[470, 520], 'Corvin köz', 'left'], [[560, 380], 'Baross tér', 'left']];
    spots.forEach(([[x, y], name, side], i) => A(seg(t, 37.6 + i * 0.4, 38.2 + i * 0.4), () => {
      fighters([[x, y]]);
      ctx.strokeStyle = C.fighter; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 16, 0, TAU); ctx.stroke();
      font(600, 23); text(name, x + (side === 'left' ? 24 : -24), y, { align: side, color: C.ink });
    }));
    // Csepel workers coming north
    A(seg(t, 39.6, 40.2), () => {
      font(600, 23); text('Csepel', 520, 740, { align: 'center', color: C.fighter });
      arrow([500, 715], [480, 590], eio(seg(t, 39.8, 41.2)), C.fighter, 5);
    });
    font(700, 30, HEAD); text('24–28 October', 70, 112, { color: C.ink });
    // the Soviet soldiers (cue 10)
    A(seg(t, 41.8, 42.6), () => {
      tank(650, 640, Math.PI, 1);
      ctx.fillStyle = C.panel; k.rrect(80, 600, 420, 150, 14); ctx.fill();
      font(700, 24, HEAD); text('Soviet soldiers', 100, 634, { color: C.tank });
      font(500, 21); text('many disliked the task;', 100, 666, { color: C.ink });
      text('people argued with them', 100, 694, { color: C.ink });
      text('in the Russian learnt at school', 100, 722, { color: C.soft });
    });
  });
}

// ---------- D: 28–30 October ----------
function sceneCeasefire(t) {
  A(span(t, 46.2, 55.6, 0.5, 0.4), () => {
    plan(0.7);
    font(700, 30, HEAD); text('28–30 October', 70, 112, { color: C.ink });
    // the dawn attack on 28 October that failed (cue 11): tanks coming down the boulevard and stopping
    const g = eio(seg(t, 46.8, 48.6));
    tank(...along(KORUT, lerp(0.62, 0.48, g)), -Math.PI / 2 - 0.07, seg(t, 46.6, 47.0) * (1 - seg(t, 51.0, 51.6)));
    A(seg(t, 48.8, 49.4), () => {
      ctx.fillStyle = C.panel; k.rrect(500, 180, 330, 100, 12); ctx.fill();
      font(700, 24, HEAD); text('28 October', 520, 214, { color: C.ink });
      font(500, 21); text('a dawn attack fails;', 520, 244, { color: C.soft }); text('the government orders a ceasefire', 520, 268, { color: C.ink });
    });
    // the withdrawal (cue 12)
    A(seg(t, 51.0, 51.6), () => {
      arrow([520, 420], [830, 300], eio(seg(t, 51.2, 52.8)), C.tank, 5);
      arrow([520, 500], [830, 560], eio(seg(t, 51.4, 53.0)), C.tank, 5);
      fighters([[CORVIN[0] - 20, CORVIN[1] - 60], [CORVIN[0] + 30, CORVIN[1] - 58], [300, 560], [330, 480], [262, 640], [130, 600], [200, 520], [350, 620], [240, 460], [410, 600], [180, 680], [300, 700]]);
      ctx.fillStyle = C.panel; k.rrect(470, 620, 360, 120, 12); ctx.fill();
      font(700, 24, HEAD); text('29–30 October', 490, 652, { color: C.tank });
      font(500, 21); text('Soviet troops pull out of Budapest', 490, 682, { color: C.ink });
      text('the Corvin groups: about 1,000', 490, 710, { color: C.fighter });
    });
  });
}

// ---------- E: the cost ----------
function sceneCost(t) {
  A(span(t, 55.4, 65.2, 0.5, 0), () => {
    font(700, 30, HEAD); text('The cost', 70, 112, { color: C.ink });
    // ages of the dead, from the UN report's footnote (cue 13): bars, no figures falling
    A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
      font(600, 23); text('Those who died in the fighting, by age', 92, 220, { color: C.soft });
      const rows = [['under 20', 20, C.fighter, 'more than one in five'], ['20 to 29', 28, C.fighter, '28 in 100'], ['40 to 49', 15, C.faint, '15 in 100']];
      rows.forEach(([name, pct, col, note], i) => {
        const y = 290 + i * 110, w = 560 * (pct / 30) * eio(seg(t, 56.0 + i * 0.3, 57.2 + i * 0.3));
        font(700, 26, HEAD); text(name, 92, y, { color: C.ink });
        ctx.fillStyle = col; ctx.fillRect(92, y + 24, w, 30);
        font(500, 21); text(note, 92 + w + 14, y + 40, { color: C.soft });
      });
      font(500, 21); text('UN Special Committee, 1957, from Hungarian statistics', 92, 640, { color: C.faint });
    });
    // homes damaged (cue 14): the blocks of the 8th and 9th districts, one in five shaded
    A(seg(t, 60.2, 60.8), () => {
      plan(0.5);
      const shade = eio(seg(t, 60.8, 62.0));
      BLOCKS.forEach(([x, y, w, h], i) => { if (i % 5 === 1) { ctx.fillStyle = `rgba(207,75,64,${0.55 * shade})`; ctx.fillRect(x, y, w, h); } });
      ctx.fillStyle = C.panel; k.rrect(470, 180, 360, 130, 12); ctx.fill();
      font(700, 24, HEAD); text('homes damaged', 490, 214, { color: C.red });
      font(500, 21); text('8th district: 18%', 490, 248, { color: C.ink }); text('9th district: 23%', 490, 278, { color: C.ink });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, 'Budapest, dawn of 24 October 1956: Soviet tanks roll in to crush the uprising begun the night before.'],
  [5.0, 9.4, 'They came from bases in Hungary itself: about 20,000 Soviet troops and 600 tanks, a UN inquiry found.'],
  [9.6, 14.0, 'They meet armed groups formed overnight: young workers and students, some *barely past childhood*.'],
  [14.2, 18.6, 'The biggest stronghold is the *Corvin köz*, a passage round a cinema in Pest’s 8th district.'],
  [18.8, 23.2, 'The round Corvin cinema stands where Üllői út meets the Grand Boulevard, ringed by tall houses.'],
  [23.4, 27.8, 'Across Üllői út, Hungarian soldiers in the ~Kilián barracks~ under Colonel Pál Maléter take their side.'],
  [28.0, 32.4, 'The tactic: watch the wide avenues, strike at a passing tank, then vanish into the side streets.'],
  [32.6, 37.0, 'Tanks with almost no infantry could not follow there. The fighters used petrol bombs and barricades.'],
  [37.2, 41.6, 'Buda has its groups too, at Széna tér and Móricz Zsigmond körtér; workers come in from Csepel.'],
  [41.8, 46.2, 'Many Soviet soldiers dislike the task. People argue with them in the Russian they learnt at school.'],
  [46.4, 50.8, '28 October: a dawn attack on the Corvin köz fails, and Imre Nagy’s government orders a *ceasefire*.'],
  [51.0, 55.4, 'On 29–30 October the Soviet tanks pull out of Budapest. The Corvin groups now number about a thousand.'],
  [55.6, 60.0, 'The cost: more than one in five of those who died in the fighting were ~under twenty~.'],
  [60.2, 64.6, 'In the 8th and 9th districts, around the Corvin köz, about one home in five was damaged.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneCity(t);
    sceneCorvin(t);
    sceneCity2(t);
    sceneCeasefire(t);
    sceneCost(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.fighter, '~': C.red } });
  },
});
