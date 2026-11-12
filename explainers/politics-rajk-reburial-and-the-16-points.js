// Explainer for politics-rajk-reburial-and-the-16-points (Hungary 1956): the seventeen days from the reburial of
// László Rajk (6 October 1956) to the march of 23 October. A huge crowd at the Kerepesi cemetery; Imre Nagy back in
// the party; students in Szeged leave the party's youth league and found MEFESZ (16 October); the Polish October
// (Soviet leaders in Warsaw on 19 October, Władysław Gomułka elected on 21 October); and the students of the Technical
// University in Budapest adopting their sixteen points on 22 October, refused by the radio censors, and calling a
// march to the Bem statue. Look: an October 1956 calendar strip running along the top, autumn navy and amber, the
// students' list on paper, a schematic map and a schematic Budapest. Libre Franklin for headings and labels, Bitter
// for the captions.
//
// Facts:
// - UN Special Committee on the Problem of Hungary, Report (1957), via mek.oszk.hu/01200/01274: para 386–388 (the
//   ceremonial reburial on 6 October of Rajk and other victims of the 1949 trials; "many thousands" gathered; the
//   Gerő regime had brought few of the hoped-for changes); para 389 (14 October: Nagy readmitted to the party; the
//   reburial "had already collected crowds around the symbolic figure of his widow"); para 48 (Nagy premier 1953–55,
//   then expelled from the party and stripped of his offices); para 50 (19 October: compulsory Russian to be
//   abolished; student meetings in Szeged and other towns; news from Poland received with enthusiasm); para 390, 394;
//   para 52 (22 October, Building Industry Technological University: sixteen demands, among them the withdrawal of all
//   Soviet troops, a government under Imre Nagy, free elections; a silent march of sympathy to the statue of General
//   Bem, a hero of 1848–49 of Polish origin); para 56 (the censor would not broadcast the demands for Soviet
//   withdrawal and free elections); para 450 (the original ten points became fourteen and later sixteen); the text of
//   the sixteen points.
// - hvg.hu (13 October 2009): the reburial of 6 October 1956 turned into a mass demonstration against the Stalinist
//   leadership.
// - Fortepan photographs (via Hungaricana): reburial of Rajk László, Pálffy György, Szőnyi Tibor and Szalai András at
//   the Kerepesi cemetery, 6 October 1956.
// - Medgyesi Konstantin, Betekintő 2022/1: 350,000 people remembered Rajk that day; Nagy expressed his sympathy to the
//   widow, Júlia Rajk. Wikipedia, "László Rajk" (citing Frucht 2003): 100,000 mourners. Estimates differ: 100,000 to
//   350,000.
// - Gyula Várallyay, Hungarian Review (2017): on 16 October students at Szeged University set up MEFESZ; on 22 October
//   more than 2,000 people filled the Aula of the Technical University.
// - FRUS 1955–57 vol. XXV, doc. 93: the Polish Central Committee convened on 19 October; Soviet leaders (Khrushchev,
//   Mikoyan, Kaganovich, Molotov) arrived unannounced. Encyclopedia of World Biography: on 21 October Gomułka was
//   elected first secretary; at Warsaw on 19/20 October he convinced Khrushchev that Poland's independence had to be
//   respected.
// Computed here: the days of October 1956 (the 1st was a Monday), 17 days from the reburial to the march.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  6 October 1956: the reburial of Rajk and three others.
//  B  9.6–23.2  The crowd and its estimates; Nagy and Júlia Rajk; a demonstration; Nagy readmitted, 14 October.
//  C 23.4–41.6  Szeged, 16 October: MEFESZ; Warsaw, 19–21 October: Gomułka.
//  D 41.8–64.6  22 October at the Technical University: 10, 14, 16 points; the censor; the march of 23 October.
const W = 864, H = 1080, CX = W / 2;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#131a2b', bg2: '#0a0e18', ink: '#f1ece2', soft: 'rgba(241,236,226,0.74)', faint: 'rgba(241,236,226,0.22)', line: 'rgba(241,236,226,0.06)',
  amber: '#e8a93e', amberSoft: 'rgba(232,169,62,0.25)', red: '#d9485a', paper: '#efe7d4', pInk: '#26221c', pSoft: 'rgba(38,34,28,0.6)',
  blue: '#8fb1d9', green: '#77b38a', panel: 'rgba(7,10,18,0.86)', river: '#2c4a6e',
};
const HEAD = 'Libre Franklin', TXT = 'Bitter';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the calendar strip: October 1956, the 1st a Monday ----------
const FIRST_WEEKDAY = new Date(Date.UTC(1956, 9, 1)).getUTCDay(); // 1 = Monday
if (FIRST_WEEKDAY !== 1) throw new Error('1 October 1956 was a Monday');
const DAYS = Math.round((Date.UTC(1956, 9, 23) - Date.UTC(1956, 9, 6)) / 864e5);
if (DAYS !== 17) throw new Error(`days ${DAYS}`);
/** The day the calendar marks at time t. */
const DAY_AT = [[0, 6], [18.8, 14], [23.4, 16], [32.6, 19], [37.2, 21], [41.8, 22], [60.2, 23]];
const dayAt = (t) => DAY_AT.reduce((d, [a, day]) => (t >= a ? day : d), 6);

function calendar(t) {
  const cw = 31, x0 = CX - (23 * cw) / 2, y = 196, day = dayAt(t);
  font(800, 22); text('OCTOBER 1956', x0, y - 40, { color: C.amber, spacing: '2px' });
  for (let d = 1; d <= 23; d++) {
    const x = x0 + (d - 1) * cw, past = d < day, now = d === day;
    const sunday = (FIRST_WEEKDAY + d - 1) % 7 === 0;
    ctx.fillStyle = now ? C.amber : past ? 'rgba(232,169,62,0.16)' : 'rgba(241,236,226,0.06)';
    k.rrect(x + 1, y - 15, cw - 3, 30, 5); ctx.fill();
    font(now ? 800 : 600, 16); text(String(d), x + cw / 2 - 0.5, y + 1, { align: 'center', color: now ? '#1a1408' : sunday ? C.red : past ? C.soft : C.faint });
  }
}

/** A simple standing figure. */
function person(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 30 * s, 12 * s, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 22 * s, y + 14 * s); ctx.quadraticCurveTo(x - 22 * s, y - 14 * s, x, y - 14 * s);
  ctx.quadraticCurveTo(x + 22 * s, y - 14 * s, x + 22 * s, y + 14 * s); ctx.closePath(); ctx.fill();
}
function tag(s, x, y, col, { size = 22, align = 'center' } = {}) {
  font(700, size);
  const tw = ctx.measureText(s).width, pad = 12;
  const bx = align === 'center' ? x - tw / 2 - pad : align === 'left' ? x - pad : x - tw - pad;
  ctx.fillStyle = C.panel; k.rrect(bx, y - size * 0.8, tw + pad * 2, size * 1.6, 8); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  text(s, x, y + 1, { align, color: col });
}
function arrow(pts, g, col, w = 7, dash = null) {
  if (g <= 0) return;
  let total = 0; const lens = [];
  for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); lens.push(l); total += l; }
  let left = total * Math.min(1, g), end = pts[0], dir = [1, 0];
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 0; i < lens.length && left > 0; i++) {
    const f = Math.min(1, left / lens[i]);
    end = [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
    dir = [(pts[i + 1][0] - pts[i][0]) / lens[i], (pts[i + 1][1] - pts[i][1]) / lens[i]];
    ctx.lineTo(...end); left -= lens[i];
  }
  ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  const s = w * 2.3; ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(end[0] + dir[0] * s, end[1] + dir[1] * s); ctx.lineTo(end[0] - dir[1] * s * 0.8, end[1] + dir[0] * s * 0.8); ctx.lineTo(end[0] + dir[1] * s * 0.8, end[1] - dir[0] * s * 0.8); ctx.fill();
}

// ---------- A–B: the reburial ----------
const BURIED = ['László Rajk', 'Tibor Szőnyi', 'András Szalai', 'György Pálffy'];
// a deterministic crowd: points in the lower part of the picture
const CROWD = Array.from({ length: 900 }, (_, i) => {
  const r1 = Math.sin(i * 12.9898) * 43758.5453, r2 = Math.sin(i * 78.233) * 12345.6789;
  return [70 + (r1 - Math.floor(r1)) * 724, 500 + (r2 - Math.floor(r2)) * 250, i];
});
function sceneReburial(t) {
  A(span(t, 0, 23.4, 0.4, 0.4), () => {
    A(span(t, 0, 9.6, 0.4, 0.4), () => {
      font(800, 34); text('KEREPESI CEMETERY, BUDAPEST', 70, 92, { spacing: '1px' });
    });
    // four coffins on a bier, each with a name
    const show = 1 - seg(t, 13.6, 14.2);
    A(show, () => {
      BURIED.forEach((name, i) => {
        const g = eout(seg(t, 0.8 + i * 0.35, 1.5 + i * 0.35)), x = 128 + i * 160, y = 330 - (1 - g) * 30;
        A(g, () => {
          ctx.fillStyle = '#4b3b2c'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 128, y); ctx.lineTo(x + 120, y + 70); ctx.lineTo(x + 8, y + 70); ctx.closePath(); ctx.fill();
          // the national colours, a ribbon across
          [['#d9485a', 0], ['#f1ece2', 1], ['#4f8a5e', 2]].forEach(([c, j]) => { ctx.fillStyle = c; ctx.fillRect(x + 40 + j * 16, y, 16, 70); });
          // flowers
          for (let f = 0; f < 5; f++) { ctx.fillStyle = f % 2 ? '#f1ece2' : '#d9485a'; ctx.beginPath(); ctx.arc(x + 20 + f * 22, y - 8 - (f % 2) * 6, 8, 0, TAU); ctx.fill(); }
          A(seg(t, 5.2 + i * 0.25, 5.8 + i * 0.25), () => { font(600, 20); text(name, x + 64, y + 100, { align: 'center', color: C.soft }); });
        });
      });
      A(seg(t, 6.4, 7.0), () => { font(500, 21, TXT); text('victims of the 1949 show trials, executed as traitors', CX, 470, { align: 'center', color: C.amber }); });
    });
    // the crowd gathers
    const fill = seg(t, 9.8, 13.2);
    A(seg(t, 9.6, 10.0) * (1 - seg(t, 14.0, 14.6) * 0.75), () => {
      for (const [x, y, i] of CROWD) {
        if (i / CROWD.length > fill) continue;
        ctx.fillStyle = 'rgba(241,236,226,0.55)'; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, TAU); ctx.fill();
      }
    });
    // the estimates
    A(span(t, 12.0, 18.8, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 250, 684, 200, 16); ctx.fill();
      font(700, 22); text('HOW MANY CAME? ESTIMATES DIFFER', CX, 290, { align: 'center', color: C.amber, spacing: '1px' });
      const L = 130, R = 734, X = (n) => lerp(L, R, n / 400000);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L, 360); ctx.lineTo(R, 360); ctx.stroke();
      for (const n of [0, 100000, 200000, 300000, 400000]) { font(500, 18); text(fmt(n), X(n), 392, { align: 'center', color: C.faint }); }
      const g = eio(seg(t, 12.6, 13.8));
      ctx.fillStyle = C.amber; ctx.fillRect(X(100000), 350, (X(350000) - X(100000)) * g, 20);
      A(seg(t, 13.6, 14.2), () => { font(600, 19, TXT); text(fmt(100000), X(100000), 330, { align: 'center', color: C.amber }); text(fmt(350000), X(350000), 330, { align: 'center', color: C.amber }); });
      A(seg(t, 14.2, 14.8), () => { font(500, 19, TXT); text('the UN committee: “many thousands”', CX, 426, { align: 'center', color: C.soft }); });
    });
    // Nagy and the widow
    A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
      person(330, 610, 1.6, C.blue); person(530, 610, 1.6, C.ink);
      font(700, 22); text('Imre Nagy', 330, 668, { align: 'center', color: C.blue });
      font(500, 19, TXT); text('prime minister 1953–55, then expelled', 330, 696, { align: 'center', color: C.soft });
      font(700, 22); text('Júlia Rajk', 530, 668, { align: 'center' });
      font(500, 19, TXT); text('the widow', 530, 696, { align: 'center', color: C.soft });
      A(seg(t, 15.2, 15.8), () => { ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(380, 560); ctx.quadraticCurveTo(430, 530, 480, 560); ctx.stroke(); });
    });
    // a demonstration
    A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
      tag('A MASS DEMONSTRATION', CX, 330, C.amber, { size: 26 });
      font(500, 22, TXT); text('against the Stalinist leaders still in power', CX, 380, { align: 'center', color: C.soft });
      A(seg(t, 19.6, 20.2), () => {
        ctx.fillStyle = C.panel; k.rrect(170, 470, 524, 170, 16); ctx.fill();
        font(800, 30); text('14 OCTOBER', CX, 520, { align: 'center', color: C.blue });
        font(600, 22, TXT); text('Imre Nagy readmitted to the party', CX, 566, { align: 'center' });
        font(500, 20, TXT); text('many want him back as prime minister', CX, 604, { align: 'center', color: C.soft });
      });
    });
  });
}

// ---------- C: Szeged and Warsaw ----------
// a schematic map of the region, from longitude and latitude: Hungary, Poland, and Moscow off to the east
const PM = (lon, lat) => [220 + (lon - 14) * 34, 230 + (54.8 - lat) * 53];
const HUN = [[17.16, 48.01], [16.95, 47.86], [16.45, 47.68], [16.62, 47.45], [16.45, 47.0], [16.11, 46.87], [16.6, 46.48], [17.3, 46.1], [18.1, 45.78], [18.9, 45.93],
  [19.6, 46.17], [20.7, 46.13], [21.3, 46.65], [21.9, 47.4], [22.4, 47.75], [22.9, 47.97], [22.3, 48.3], [21.6, 48.5], [20.8, 48.57], [20.0, 48.2], [19.0, 48.07], [18.7, 47.78], [17.8, 47.75]];
const POL = [[14.1, 53.9], [14.6, 52.6], [14.7, 51.1], [15.0, 50.9], [16.3, 50.6], [16.9, 50.3], [17.7, 50.1], [18.8, 49.5], [19.8, 49.2], [21.0, 49.4], [22.6, 49.1], [23.0, 50.4],
  [24.1, 50.8], [23.6, 51.6], [23.9, 52.7], [23.5, 53.9], [22.8, 54.4], [19.6, 54.4], [18.6, 54.4], [17.0, 54.7], [15.5, 54.2]];
const MAP = { bud: PM(19.04, 47.5), sze: PM(20.15, 46.25), war: PM(21.01, 52.23), mos: [860, 250] };
function shape(pts) { ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(...PM(...q)) : ctx.moveTo(...PM(...q)))); ctx.closePath(); ctx.fill(); ctx.stroke(); }
function sceneNews(t) {
  A(span(t, 23.4, 41.8, 0.4, 0.4), () => {
    ctx.fillStyle = 'rgba(241,236,226,0.06)'; ctx.strokeStyle = C.soft; ctx.lineWidth = 2.5;
    shape(HUN); shape(POL);
    font(700, 19); text('HUNGARY', ...PM(17.6, 46.6), { align: 'center', color: C.faint, spacing: '2px' }); text('POLAND', ...PM(16.5, 53.4), { align: 'center', color: C.faint, spacing: '2px' });
    font(500, 18); text('Schematic map', 70, 760, { color: C.faint });
    const town = (key, name, dx, dy, align = 'left', col = C.ink) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(...MAP[key], 7, 0, TAU); ctx.fill(); font(700, 21); text(name, MAP[key][0] + dx, MAP[key][1] + dy, { align, color: col }); };
    town('bud', 'Budapest', -14, -2, 'right');
    town('sze', 'Szeged', 14, 4, 'left', C.amber);
    town('war', 'Warsaw', -14, -2, 'right', C.red);
    // Szeged, 16 October: MEFESZ
    A(span(t, 23.4, 32.8, 0.3, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(530, 540, 316, 170, 14); ctx.fill(); ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.stroke();
      font(800, 30); text('MEFESZ', 688, 580, { align: 'center', color: C.amber, spacing: '2px' });
      font(500, 17, TXT); text('Federation of Hungarian University', 688, 616, { align: 'center', color: C.soft });
      text('and College Students’ Associations', 688, 640, { align: 'center', color: C.soft });
      A(seg(t, 25.0, 25.6), () => { font(700, 19); text('outside the party’s youth league', 688, 680, { align: 'center', color: C.ink }); });
      // student meetings spread, 19–20 October
      A(seg(t, 28.4, 29.0), () => {
        for (let i = 0; i < 3; i++) {
          const ph = ((t - 28.4) * 0.6 + i / 3) % 1;
          A(1 - ph, () => { ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(MAP.sze[0], MAP.sze[1], 10 + ph * 70, 0, TAU); ctx.stroke(); });
        }
        tag('student meetings in other towns', 688, 500, C.amber, { size: 20 });
      });
    });
    // Warsaw: Soviet leaders fly in, 19 October; Gomułka, 21 October
    A(seg(t, 32.6, 33.0), () => {
      arrow([MAP.mos, [MAP.war[0] + 20, MAP.war[1] - 8]], eio(seg(t, 33.0, 34.4)), C.blue, 5, [12, 10]);
      A(seg(t, 34.0, 34.6), () => tag('19 OCT: SOVIET LEADERS FLY IN', 660, 450, C.blue, { size: 20 }));
      A(seg(t, 37.4, 38.0), () => {
        ctx.fillStyle = C.panel; k.rrect(500, 290, 330, 120, 14); ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.stroke();
        font(700, 22); text('21 OCT: Władysław Gomułka', 665, 326, { align: 'center', color: C.red });
        font(500, 19, TXT); text('elected party leader;', 665, 358, { align: 'center', color: C.soft });
        text('Moscow gives way', 665, 384, { align: 'center', color: C.soft });
      });
      A(seg(t, 39.0, 39.6), () => arrow([[MAP.war[0] - 6, MAP.war[1] + 16], [MAP.bud[0] + 6, MAP.bud[1] - 18]], eio(seg(t, 39.2, 40.4)), C.red, 5, [10, 8]));
      A(seg(t, 40.2, 40.8), () => { font(700, 20); text('hope in Budapest', MAP.bud[0] - 14, MAP.bud[1] - 30, { align: 'right', color: C.red }); });
    });
  });
}

// ---------- D: 22 October, the sixteen points, the march ----------
function sceneAula(t) {
  // the hall full of students, and the list growing
  A(span(t, 41.8, 51.0, 0.4, 0.4), () => {
    tag('22 OCTOBER · TECHNICAL UNIVERSITY, BUDAPEST', CX, 270, C.amber, { size: 20 });
    for (let r = 0; r < 9; r++) for (let c = 0; c < 26; c++) {
      const g = seg(t, 42.0 + (r * 26 + c) * 0.006, 42.4 + (r * 26 + c) * 0.006);
      if (g <= 0) continue;
      ctx.fillStyle = `rgba(241,236,226,${0.25 + 0.35 * g})`;
      ctx.beginPath(); ctx.arc(110 + c * 26 + (r % 2) * 13, 560 + r * 22, 6, 0, TAU); ctx.fill();
    }
    A(seg(t, 43.2, 43.8), () => { font(600, 21, TXT); text('more than 2,000 people in the hall', CX, 520, { align: 'center', color: C.soft }); });
    // the count of points
    const n = t < 46.4 ? 10 : t < 47.8 ? 14 : 16;
    A(seg(t, 46.4, 46.8), () => {
      ctx.fillStyle = C.paper; k.rrect(282, 320, 300, 160, 10); ctx.fill();
      font(900, 96); text(String(n), CX, 396, { align: 'center', color: n === 16 ? C.red : C.pInk });
      font(700, 20); text('POINTS', CX, 460, { align: 'center', color: C.pSoft, spacing: '3px' });
    });
  });
  // the leaflet
  const POINTS = [['1', 'All Soviet troops out'], ['3', 'A government under Imre Nagy'], ['5', 'Free elections, several parties']];
  A(span(t, 51.0, 60.4, 0.4, 0.4), () => {
    ctx.fillStyle = C.paper; ctx.fillRect(150, 250, 564, 440);
    font(800, 28); text('THE 16 POINTS', 184, 296, { color: C.pInk, spacing: '2px' });
    font(500, 18, TXT); text('22 October 1956', 184, 330, { color: C.pSoft });
    POINTS.forEach(([n, s], i) => {
      const g = seg(t, 51.4 + i * 0.9, 52.0 + i * 0.9), y = 392 + i * 74;
      A(g, () => {
        ctx.fillStyle = i === 0 ? C.red : '#2f4a74'; k.rrect(184, y - 24, 48, 48, 8); ctx.fill();
        font(800, 24); text(n, 208, y + 1, { align: 'center', color: '#fff' });
        font(700, 24); text(s, 252, y, { color: C.pInk });
      });
    });
    // the radio says no
    A(seg(t, 56.0, 56.6), () => {
      const x = 620, y = 640;
      ctx.fillStyle = '#5b4632'; k.rrect(x - 70, y - 44, 140, 88, 12); ctx.fill();
      ctx.fillStyle = '#c9b48d'; ctx.beginPath(); ctx.arc(x - 26, y, 26, 0, TAU); ctx.fill();
      ctx.fillStyle = '#2b2118'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 12, y - 24 + i * 14, 40, 5);
      ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - 86, y - 60); ctx.lineTo(x + 86, y + 60); ctx.moveTo(x + 86, y - 60); ctx.lineTo(x - 86, y + 60); ctx.stroke(); ctx.lineCap = 'butt';
      font(700, 20); text('Radio censors: not on air', 184, 640, { color: C.red });
    });
  });
  // the march: a schematic Budapest, the Danube, Buda and Pest
  A(span(t, 60.2, 65.2, 0.4, 0), () => {
    ctx.strokeStyle = C.river; ctx.lineWidth = 34; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(470, 300); ctx.bezierCurveTo(420, 420, 440, 540, 480, 760); ctx.stroke(); ctx.lineCap = 'butt';
    font(700, 22); text('BUDA', 250, 330, { color: C.faint, spacing: '3px' }); text('PEST', 610, 330, { color: C.faint, spacing: '3px' });
    font(500, 18); text('Danube', 500, 470, { color: C.blue });
    text('Schematic map', 70, 760, { color: C.faint });
    const uni = [400, 690], bem = [392, 390];
    for (const [p, name, sub, dy] of [[uni, 'Technical University', '', 0], [bem, 'Bem statue', 'Józef Bem: a Pole, a hero of 1848–49', 0]]) {
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(...p, 9, 0, TAU); ctx.fill();
      font(700, 21); text(name, p[0] - 18, p[1] + dy, { align: 'right', color: C.amber });
      if (sub) { font(500, 17, TXT); text(sub, p[0] - 18, p[1] + 28, { align: 'right', color: C.soft }); }
    }
    arrow([[uni[0] - 14, uni[1] - 16], [360, 560], [350, 440], [bem[0] - 6, bem[1] + 22]], eio(seg(t, 60.8, 62.6)), C.amber, 6, [12, 10]);
    A(seg(t, 62.2, 62.8), () => tag('23 OCTOBER: A MARCH OF SYMPATHY', CX, 264, C.red, { size: 21 }));
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
  [0.4, 4.8, 'Budapest, 6 October 1956: *László Rajk*, hanged in 1949 after a show trial, is reburied with ceremony.'],
  [5.0, 9.4, 'With him lie Tibor Szőnyi, András Szalai and György Pálffy, victims of the same trials.'],
  [9.6, 14.0, 'A *huge crowd* comes to the Kerepesi cemetery: estimates run from 100,000 to 350,000.'],
  [14.2, 18.6, '*Imre Nagy*, ousted as prime minister in 1955, offers his sympathy to Rajk’s widow, Júlia.'],
  [18.8, 23.2, 'The funeral becomes a *mass demonstration*. On 14 October the party takes Nagy back.'],
  [23.4, 27.8, '16 October, Szeged: students leave the party’s youth league and found their own union, *MEFESZ*.'],
  [28.0, 32.4, 'On 19 October the minister promises to end compulsory Russian; student meetings spread.'],
  [32.6, 37.0, 'The same day, Soviet leaders fly *unannounced* to Warsaw, where Poland’s party is changing course.'],
  [37.2, 41.6, 'On 21 October ~Władysław Gomułka~ is elected Poland’s party leader, and Moscow gives way.'],
  [41.8, 46.2, '22 October, Budapest: more than 2,000 people fill the hall of the *Technical University*.'],
  [46.4, 50.8, 'Through the evening their list of demands grows from ten points to fourteen, then *sixteen*.'],
  [51.0, 55.4, 'Point 1: all *Soviet troops* out. Point 3: a government under *Imre Nagy*. Point 5: free elections.'],
  [55.6, 60.0, 'The radio’s censors refuse to broadcast the demands for ~Soviet withdrawal~ and free elections.'],
  [60.2, 64.6, 'So the students call a march for *23 October*, to the statue of General Bem, in sympathy with Poland.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    A(seg(t, 0, 0.6), () => calendar(t));
    sceneReburial(t);
    sceneNews(t);
    sceneAula(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.amber, '~': C.red } });
  },
});
