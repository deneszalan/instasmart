// Explainer for politics-nagy-ousted-rakosi-returns-1955 (Hungary 1956, The road to October): 1955, the year Mátyás
// Rákosi pushed Imre Nagy out and took back control, while next door Austria signed its State Treaty, saw the Soviet
// troops leave and became neutral; Hungary joined the Warsaw Pact and the United Nations. Look: a slate-blue night;
// a balance beam between the two men, Nagy's offices struck off one by one, then a schematic map of Austria and
// Hungary with the Soviet supply line that kept Red Army troops in Hungary, Austria in red-white-red, a UN ring. No
// portraits. Playfair Display for headings, Fira Sans for the captions.
//
// Facts:
// - 1956 Institute (rev.hu), "Crisis and a search for solutions, 1953–1956" and its chronology: June 1953, Moscow
//   ends Rákosi's monopoly, Imre Nagy becomes prime minister (programme speech 4 July 1953), Rákosi stays first
//   secretary and works "from the first moment to restore his authority"; 8 January 1955, the Soviet Presidium
//   criticizes Nagy's policy, Nagy does not admit to being in the wrong; 14 April 1955, the Central Committee accuses
//   him of anti-party activity and removes him from the Political Committee and the Central Committee; 18 April, András
//   Hegedüs prime minister on Rákosi's proposal; 29 April, Nagy gives up his seats in Parliament and the Budapest
//   council, his Academy membership and his professorship; his expulsion from the party in December 1955; 14 May 1955,
//   Hegedüs signs the Warsaw Treaty; 15 May, the Austrian State Treaty "turns Austria into an independent, democratic,
//   neutral country", "from which the Soviet occupation forces withdrew"; 14 December 1955, sixteen new members of the
//   United Nations, Hungary among them; in November 1956 people trusted that the Soviets would withdraw as they had
//   from Finland and Austria; 1 November 1956, the government withdraws from the Warsaw Pact, declares neutrality and
//   appeals to the UN; the Hungarian National Revolutionary Committee had declared neutrality "after the Austrian
//   pattern".
// - UN Special Committee on the Problem of Hungary, Report (A/3592, 1957), paras 306–315: the Peace Treaty of 1947
//   (art. 22) let the USSR keep troops in Hungary "for the maintenance of the lines of communication of the Soviet Army
//   with the Soviet zone of occupation in Austria"; the Austrian State Treaty of 15 May 1955 (in force 27 July) ended
//   the occupation, "The last Soviet units left Vienna on 19 September 1955"; on 14 May 1955, "one day before", the
//   Warsaw Treaty, with a joint command; before October 1956 two Soviet mechanized divisions stood in Hungary.
// - A. Steiger, Wissenschaftliche Arbeiten aus dem Burgenland 105 (2001): Austria's permanent neutrality was voted on
//   26 October 1955.
// - Wilson Center, "Loyalty amidst Treachery: Austrian-Hungarian Relations, 1955–1956" (Bianca Adair, meeting report
//   239): "many believed that the Red Army would have to leave Hungary as a consequence of its neighbor's
//   independence".
// The map is schematic: borders simplified, the Soviet zone of Austria and the supply line drawn roughly.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  1953: Nagy prime minister, Rákosi still party leader: the balance.
//  B  9.6–23.2  1955: Moscow condemns Nagy; his offices struck off; Hegedüs.
//  C 23.4–46.2  The map: the Warsaw Pact; the State Treaty; the supply line; Soviet troops leave Austria, stay in Hungary.
//  D 46.4–55.4  Nagy expelled; Hungary in the UN.
//  E 55.6–64.6  1956: Austria's example; 1 November, neutrality.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#162231', bg2: '#0a111a', ink: '#eef1f5', soft: 'rgba(238,241,245,0.74)', faint: 'rgba(238,241,245,0.26)', line: 'rgba(238,241,245,0.06)',
  nagy: '#5fc0b2', rakosi: '#d4744f', soviet: '#e6a84a', red: '#e05252', white: '#f4f4f4', un: '#7fb6e6', hu: 'rgba(95,192,178,0.16)', at: 'rgba(224,82,82,0.16)', panel: 'rgba(8,13,20,0.86)',
};
const HEAD = 'Playfair Display', TXT = 'Fira Sans';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the map: Austria and Hungary (schematic) ----------
const KX = 58, KY = 85;
const P = (lon, lat) => [42 + (lon - 9.5) * KX, 230 + (49.1 - lat) * KY];
const HUNGARY = [[16.11, 46.87], [16.28, 47.0], [16.45, 47.15], [16.48, 47.4], [16.43, 47.56], [16.64, 47.75], [16.9, 47.7], [17.05, 47.82], [17.16, 48.01],
  [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.87, 47.82], [19.05, 48.05], [19.48, 48.1], [19.75, 48.2], [20.05, 48.17], [20.3, 48.27], [20.55, 48.53],
  [21.12, 48.5], [21.45, 48.57], [21.72, 48.35], [22.15, 48.41], [22.4, 48.25], [22.9, 47.95], [22.7, 47.82], [22.3, 47.7], [22.02, 47.53], [21.95, 47.12],
  [21.65, 46.95], [21.4, 46.62], [21.05, 46.28], [20.7, 46.18], [20.26, 46.12], [19.85, 46.17], [19.4, 46.05], [18.95, 45.95], [18.8, 45.88], [18.45, 45.77],
  [18.15, 45.78], [17.7, 45.9], [17.4, 45.95], [17.15, 46.15], [16.88, 46.36], [16.6, 46.47], [16.38, 46.63]];
const AUSTRIA = [[9.53, 47.05], [9.6, 47.55], [10.5, 47.55], [11.5, 47.6], [12.2, 47.7], [13.0, 47.5], [12.9, 48.0], [13.4, 48.55], [13.8, 48.75], [14.7, 48.6],
  [15.0, 49.0], [16.0, 48.78], [16.9, 48.7], [17.15, 48.0], [16.9, 47.7], [16.45, 47.4], [16.5, 47.0], [16.11, 46.87], [15.0, 46.6], [14.5, 46.42], [13.7, 46.52],
  [12.4, 46.7], [12.1, 47.0], [11.0, 46.77], [10.45, 46.85], [9.6, 46.95]];
const SOVIET_ZONE = [[13.8, 48.75], [14.7, 48.6], [15.0, 49.0], [16.0, 48.78], [16.9, 48.7], [17.15, 48.0], [16.9, 47.7], [16.45, 47.4], [16.5, 47.0], [16.11, 46.87],
  [15.9, 47.3], [15.0, 47.8], [14.4, 48.1], [13.8, 48.35]];
const VIENNA = P(16.37, 48.21), BUDAPEST = P(19.04, 47.5), GYOR = P(17.63, 47.69), ZAHONY = P(22.18, 48.41);

function poly(pts, fill, stroke, w = 2.5, dash = null) {
  ctx.beginPath(); pts.forEach(([lo, la], i) => (i ? ctx.lineTo(...P(lo, la)) : ctx.moveTo(...P(lo, la)))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); }
}
/** The Soviet supply line from the Soviet border through Hungary to Vienna, drawn to fraction g; `cut` hides the Austrian part. */
function supplyLine(g, cut = 0) {
  const pts = [ZAHONY, BUDAPEST, GYOR, VIENNA];
  const lens = [], total = pts.slice(1).reduce((s, p, i) => { const l = Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]); lens.push(l); return s + l; }, 0);
  let left = total * g;
  ctx.lineCap = 'round';
  for (let i = 0; i < lens.length && left > 0; i++) {
    const f = Math.min(1, left / lens[i]), a = pts[i], b = [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
    const inAustria = i === 2;
    A(inAustria ? 1 - cut : 1, () => {
      ctx.strokeStyle = C.soviet; ctx.lineWidth = 7; ctx.setLineDash([16, 10]);
      ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.setLineDash([]);
    });
    left -= lens[i];
  }
  ctx.lineCap = 'butt';
}
function city(xy, name, { dx = 12, dy = 0, align = 'left', col = C.ink } = {}) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xy[0], xy[1], 6, 0, TAU); ctx.fill();
  font(600, 23); text(name, xy[0] + dx, xy[1] + dy, { align, color: col });
}

// ---------- A: the balance ----------
function sceneBalance(t) {
  A(span(t, 0.2, 14.2, 0.5, 0.5), () => {
    // the tilt: Nagy up in 1953, Rákosi up from 1955
    const tilt = lerp(0.16, -0.2, eio(seg(t, 10.0, 12.6))); // the one in charge sits higher
    const cx = CX, cy = 470, L = 300;
    ctx.fillStyle = C.faint; ctx.beginPath(); ctx.moveTo(cx - 40, cy + 120); ctx.lineTo(cx + 40, cy + 120); ctx.lineTo(cx, cy + 8); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
    ctx.fillStyle = C.ink; ctx.fillRect(-L, -5, 2 * L, 10);
    ctx.restore();
    const end = (s) => [cx + s * L * Math.cos(tilt), cy + s * L * Math.sin(tilt)];
    const [nx, ny] = end(-1), [rx, ry] = end(1);
    for (const [x, y, col, name, role] of [[nx, ny, C.nagy, 'Imre Nagy', 'prime minister'], [rx, ry, C.rakosi, 'Mátyás Rákosi', 'party leader']]) {
      ctx.fillStyle = col; k.rrect(x - 110, y - 92, 220, 80, 12); ctx.fill();
      font(700, 27, HEAD); text(name, x, y - 64, { align: 'center', color: '#0a111a' });
      font(600, 21); text(role, x, y - 34, { align: 'center', color: '#0a111a' });
    }
    A(seg(t, 1.2, 1.8) * (1 - seg(t, 9.2, 9.6)), () => { font(700, 30, HEAD); text('July 1953', CX, 250, { align: 'center', color: C.nagy }); font(500, 23); text('after Stalin’s death, Moscow’s choice', CX, 288, { align: 'center', color: C.soft }); });
    A(seg(t, 10.0, 10.6), () => { font(700, 30, HEAD); text('January 1955', CX, 250, { align: 'center', color: C.rakosi }); font(500, 23); text('Moscow condemns Nagy’s course', CX, 288, { align: 'center', color: C.soft }); });
  });
}

// ---------- B: struck off ----------
const OFFICES = ['Political Committee', 'Central Committee', 'prime minister', 'member of parliament', 'Academy of Sciences', 'university professor'];
function sceneOffices(t) {
  A(span(t, 14.2, 23.6, 0.4, 0.4), () => {
    font(700, 32, HEAD); text('Imre Nagy, April 1955', 92, 214, { color: C.nagy });
    OFFICES.forEach((o, i) => {
      const y = 290 + i * 62, at = 14.8 + i * 0.6 + (i >= 3 ? 3.4 : 0);
      font(600, 27); text(o, 120, y, { color: C.ink });
      const g = eio(seg(t, at, at + 0.4));
      if (g > 0) { const w = ctx.measureText(o).width; ctx.strokeStyle = C.rakosi; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(110, y); ctx.lineTo(110 + (w + 20) * g, y); ctx.stroke(); }
    });
    A(seg(t, 16.4, 17.0), () => { font(600, 22); text('14–18 April', 560, 352, { color: C.rakosi }); });
    A(seg(t, 19.6, 20.2), () => { font(600, 22); text('29 April', 560, 538, { color: C.rakosi }); });
    A(seg(t, 18.8, 19.4), () => {
      ctx.fillStyle = C.panel; k.rrect(540, 380, 280, 96, 12); ctx.fill();
      font(600, 21); text('new prime minister:', 560, 410, { color: C.soft });
      font(700, 26, HEAD); text('András Hegedüs', 560, 446, { color: C.rakosi });
    });
  });
}

// ---------- C: the map ----------
function sceneMap(t) {
  A(span(t, 23.4, 46.4, 0.6, 0.5), () => {
    const free = eio(seg(t, 28.6, 30.0)); // Austria's treaty
    poly(AUSTRIA, `rgba(224,82,82,${0.10 + 0.22 * free})`, C.soft);
    A(1 - eio(seg(t, 37.4, 38.6)), () => poly(SOVIET_ZONE, 'rgba(230,168,74,0.18)', C.soviet, 2, [8, 6]));
    poly(HUNGARY, C.hu, C.soft);
    // Austria's flag stripes, faint, once free
    A(free * 0.9, () => {
      font(700, 30, HEAD); text('AUSTRIA', ...P(13.0, 47.15), { align: 'center', color: C.red, spacing: '2px' });
    });
    font(700, 30, HEAD); text('HUNGARY', ...P(20.2, 46.62), { align: 'center', color: C.nagy, spacing: '2px' });
    A(seg(t, 24.0, 24.6) * (1 - seg(t, 37.4, 38.2)), () => { font(600, 21); text('Soviet zone', ...P(15.2, 48.95), { align: 'center', color: C.soviet }); });
    city(VIENNA, 'Vienna', { dy: -24, dx: 0, align: 'center' });
    city(BUDAPEST, 'Budapest', { dy: 26, dx: 0, align: 'center' });
    font(500, 22); text('Schematic map', 60, 600, { color: C.faint });
    // the Warsaw Pact (cue 6)
    A(span(t, 23.6, 28.4, 0.4, 0.3), () => {
      ctx.fillStyle = C.panel; k.rrect(470, 140, 360, 92, 12); ctx.fill();
      font(700, 27, HEAD); text('14 May 1955 · Warsaw', 490, 172, { color: C.soviet });
      font(500, 21); text('alliance under a Soviet commander', 490, 206, { color: C.soft });
    });
    // the State Treaty (cue 7)
    A(span(t, 28.0, 32.8, 0.4, 0.3), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 140, 380, 92, 12); ctx.fill();
      font(700, 27, HEAD); text('15 May 1955 · Vienna', 80, 172, { color: C.red });
      font(500, 21); text('Austrian State Treaty', 80, 206, { color: C.soft });
    });
    // the supply line (cue 8), cut at the Austrian border (cue 9)
    supplyLine(eio(seg(t, 33.0, 35.4)), eio(seg(t, 37.6, 38.8)));
    A(span(t, 33.2, 37.4, 0.4, 0.3), () => {
      ctx.fillStyle = C.panel; k.rrect(420, 620, 410, 120, 12); ctx.fill();
      font(700, 24, HEAD); text('Peace Treaty, 1947, article 22', 440, 650, { color: C.soviet });
      font(500, 21); text('Soviet troops may stay in Hungary', 440, 684, { color: C.ink });
      text('to keep their lines to Austria open', 440, 712, { color: C.ink });
    });
    A(span(t, 37.6, 42.0, 0.4, 0.3), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 620, 380, 120, 12); ctx.fill();
      font(700, 24, HEAD); text('19 September 1955', 80, 650, { color: C.red });
      font(500, 21); text('last Soviet units leave Vienna', 80, 684, { color: C.ink });
      A(seg(t, 39.6, 40.2), () => { text('26 October: Austria neutral', 80, 714, { color: C.ink }); });
    });
    // they stay in Hungary (cue 10)
    A(span(t, 41.8, 46.4, 0.4, 0.3), () => {
      ctx.fillStyle = C.panel; k.rrect(420, 620, 410, 120, 12); ctx.fill();
      font(700, 24, HEAD); text('Soviet troops stay in Hungary', 440, 650, { color: C.soviet });
      font(500, 21); text('now under the Warsaw Pact', 440, 684, { color: C.ink });
      text('two mechanized divisions', 440, 712, { color: C.soft });
    });
  });
}

// ---------- D: December 1955 ----------
function sceneDecember(t) {
  A(span(t, 46.4, 55.8, 0.4, 0.4), () => {
    font(700, 32, HEAD); text('December 1955', 92, 214, { color: C.ink });
    A(span(t, 46.6, 51.2, 0.4, 0.3), () => {
      ctx.fillStyle = C.panel; k.rrect(92, 270, 680, 150, 14); ctx.fill();
      font(700, 30, HEAD); text('Imre Nagy', 122, 316, { color: C.nagy });
      font(600, 26); text('expelled from the party', 122, 358, { color: C.ink });
      font(500, 22); text('Rákosi is back in control', 122, 394, { color: C.rakosi });
    });
    // the UN ring with sixteen new members (cue 12)
    A(seg(t, 51.0, 51.6), () => {
      const cx = CX, cy = 470, r = 150;
      ctx.strokeStyle = C.un; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
      for (let i = 0; i < 16; i++) {
        const a = -Math.PI / 2 + (i / 16) * TAU, on = seg(t, 51.6 + i * 0.08, 51.9 + i * 0.08);
        const x = cx + Math.cos(a) * (r + 34), y = cy + Math.sin(a) * (r + 34);
        A(on, () => { ctx.fillStyle = i === 0 ? C.nagy : C.un; ctx.beginPath(); ctx.arc(x, y, i === 0 ? 12 : 8, 0, TAU); ctx.fill(); });
      }
      A(seg(t, 53.2, 53.8), () => {
        ctx.fillStyle = C.panel; k.rrect(cx - 150, cy - 56, 300, 124, 14); ctx.fill();
        font(700, 26, HEAD); text('14 December 1955', cx, cy - 22, { align: 'center', color: C.un });
        font(600, 22); text('16 new UN members', cx, cy + 16, { align: 'center', color: C.ink });
        text('Hungary among them', cx, cy + 46, { align: 'center', color: C.nagy });
      });
    });
  });
}

// ---------- E: 1956 ----------
function scene1956(t) {
  A(span(t, 55.6, 65.2, 0.5, 0), () => {
    poly(AUSTRIA, 'rgba(224,82,82,0.30)', C.soft);
    poly(HUNGARY, C.hu, C.soft);
    font(700, 30, HEAD); text('AUSTRIA', ...P(13.0, 47.15), { align: 'center', color: C.red, spacing: '2px' });
    text('HUNGARY', ...P(20.2, 46.62), { align: 'center', color: C.nagy, spacing: '2px' });
    font(600, 22); text('neutral since 1955', ...P(13.0, 46.85), { align: 'center', color: C.soft });
    // the example, an arrow across the border
    const g = eio(seg(t, 56.4, 57.8));
    ctx.strokeStyle = C.white; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
    const [ax, ay] = P(14.8, 47.9), [bx, by] = P(18.6, 47.2);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, bx, g), lerp(ay, by, g)); ctx.stroke(); ctx.setLineDash([]);
    A(seg(t, 57.6, 58.2) * (1 - seg(t, 60.0, 60.4)), () => { font(600, 23); text('an example next door', CX, 200, { align: 'center', color: C.ink }); });
    A(seg(t, 60.6, 61.4), () => {
      ctx.fillStyle = C.panel; k.rrect(130, 140, 604, 110, 14); ctx.fill();
      font(700, 30, HEAD); text('1 November 1956', CX, 178, { align: 'center', color: C.nagy });
      font(600, 23); text('Imre Nagy declares Hungary neutral', CX, 216, { align: 'center', color: C.ink });
      ctx.save(); const [hx, hy] = P(18.6, 47.3); ctx.translate(hx, hy); ctx.rotate(-0.12);
      ctx.strokeStyle = C.nagy; ctx.lineWidth = 4; ctx.strokeRect(-96, -26, 192, 52);
      font(700, 26, HEAD); text('NEUTRAL', 0, 2, { align: 'center', color: C.nagy, spacing: '2px' });
      ctx.restore();
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
  g.strokeStyle = C.line; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 54) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 780); g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'Hungary, July 1953: after Stalin’s death, Moscow makes the reformer *Imre Nagy* prime minister.'],
  [5.0, 9.4, 'But ~Mátyás Rákosi~ stays party leader, and works from the first day to win his power back.'],
  [9.6, 14.0, 'January 1955, Moscow: Soviet leaders condemn Nagy’s course. Nagy refuses to admit he was wrong.'],
  [14.2, 18.6, '14 April 1955: the party throws Nagy out of its leadership. Four days later he is no longer premier.'],
  [18.8, 23.2, 'Rákosi’s choice, ~András Hegedüs~, takes over. Nagy must give up his seat, his chair, his Academy place.'],
  [23.4, 27.8, '14 May 1955, Warsaw: Hungary signs the *Warsaw Pact*, a military alliance under Soviet command.'],
  [28.0, 32.4, 'The next day, 15 May, in Vienna, the *Austrian State Treaty* ends the occupation of Austria.'],
  [32.6, 37.0, 'Since 1947, Soviet troops had stayed in Hungary to guard their supply lines to their zone in Austria.'],
  [37.2, 41.6, 'In September the last Soviet units leave Vienna. In October Austria declares itself *neutral*.'],
  [41.8, 46.2, 'Many Hungarians expect the Red Army to leave Hungary too. It stays, now under the Warsaw Pact.'],
  [46.4, 50.8, 'December 1955: Imre Nagy is expelled from the party. ~Rákosi~ seems to hold Hungary again.'],
  [51.0, 55.4, '14 December 1955: Hungary joins the *United Nations*, with fifteen other countries.'],
  [55.6, 60.0, 'In 1956 Hungarians remember both: a neutral Austria next door, and the United Nations.'],
  [60.2, 64.6, 'On 1 November 1956 Imre Nagy declares Hungary *neutral* and appeals to the United Nations.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    A(span(t, 0, 23.6, 0.4, 0.4), () => {
      font(700, 34, HEAD); text('Hungary, 1953–1955', 70, 112, { color: C.ink });
    });
    sceneBalance(t);
    sceneOffices(t);
    sceneMap(t);
    sceneDecember(t);
    scene1956(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 39, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.nagy, '~': C.rakosi } });
  },
});
