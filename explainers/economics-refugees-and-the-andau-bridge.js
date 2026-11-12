// Explainer for economics-refugees-and-the-andau-bridge (Hungary 1956, Consequences): the flight of nearly 200,000
// people from Hungary in 1956–57, most of them across the Austrian border, tens of thousands over the small bridge at
// Andau; who they were, how Austria and the UN's refugee agency took them in, and where in the world they went. Look:
// a snowy night-blue schematic of the border by Lake Neusiedl, the Einser canal and its little bridge, people as
// small warm lights moving west, then a grid of a hundred, then arcs across a schematic world. Crimson Pro for
// headings and numbers, Outfit for the captions.
//
// Facts:
// - László Hablicsek and Sándor Illés, "Az 1956-os kivándorlás népességi hatásai", Statisztikai Szemle 85/2 (2007),
//   on the Central Statistical Office's (KSH) confidential report of 1957: 193,885 people fled to Austria and
//   Yugoslavia, matching the Austrian and Yugoslav official data; 11,447 had returned by the end of May 1957; about
//   10,000 children under 15 left without their parents; nearly two-thirds of those who left were men; about 176,000
//   left for good (1956–1959); in Austria 180,288 had arrived by 30 April 1957; to Yugoslavia about 19,900.
// - 1956 Institute (rev.hu), lesson 5: large numbers left after 4 November; in December, as the reprisals began, a
//   second, bigger flight; most fled to Austria, the rest through Yugoslavia.
// - James P. Niessen, "God Brought the Hungarians", Hungarian Historical Review 6/3 (2017): on 28 October, with 10,000
//   refugees already in Austria, Austria's interior minister Oskar Helmer declared that Austria would grant asylum to
//   any Hungarian who asked; on 4 November he asked the countries of the UNHCR and ICEM to take refugees; the UN's
//   Secretary-General assigned refugee relief to the UNHCR, which relied on the Red Cross, ICEM and voluntary agencies;
//   more than 80 per cent had last lived in Budapest or further west.
// - Austria-Forum, "Andau" (from J. Sachslehner, Schicksalsorte Österreichs, 2009): a narrow wooden bridge over the
//   Einser canal near the Hungarian border; "the first of 70,000 refugees" crossed it on 6 November 1956; it was
//   blown up, and many still crossed over its ruins. A. Steiger, Wissenschaftliche Arbeiten aus dem Burgenland 105
//   (2001): from 6 November ever more refugees reached Austria at the Andau bridge and the Einser canal; on 19 November
//   the collecting points of Stoob and Oberpullendorf cared for 750, that of Eisenstadt for 2,000.
// - Tadeusz Kopyś, Studia Społeczno-Polityczne 2024/1 (Jagiellonian University), citing a 1960 study for the UN: the
//   United States received 44,110, Canada 39,190, Australia 15,390, West Germany 14,400, the United Kingdom 13,670,
//   Switzerland 10,480; 66% men, 70% aged 15 to 39, 15% under 18; 10.6% of all Hungary's engineers and 4.9% of its
//   doctors left (Dövényi and Vukovich, 1994).
// The maps are schematic: the border, the lake, the canal and the world simplified.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0–14.0  The border, November 1956; Austria's asylum; the Einser canal and the Andau bridge.
//  B 14.2–32.4  70,000 over the bridge; Burgenland's help; the bridge blown up; the second wave.
//  C 32.6–50.8  193,885; who they were; the UNHCR.
//  D 51.0–64.6  Where they went; who came back.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#152030', bg2: '#0a1018', ink: '#f1efe9', soft: 'rgba(241,239,233,0.74)', faint: 'rgba(241,239,233,0.26)', line: 'rgba(241,239,233,0.05)',
  land: 'rgba(241,239,233,0.06)', water: '#3c6f99', person: '#f4ddb0', red: '#d9534f', white: '#f4f4f4', green: '#5f9e6e', un: '#7fb6e6', panel: 'rgba(9,14,21,0.86)',
};
const HEAD = 'Crimson Pro', TXT = 'Outfit';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const FLED = 193885, RETURNED = 11447, STAYED = 176000, CHILDREN = 10000, ANDAU = 70000;
const DEST = [['United States', 44110], ['Canada', 39190], ['Australia', 15390], ['West Germany', 14400], ['Britain', 13670], ['Switzerland', 10480]];
if (RETURNED / FLED < 0.055 || RETURNED / FLED > 0.065) throw new Error('returned share'); // "nearly 6%"

// ---------- the border by Lake Neusiedl (schematic) ----------
const BORDER = [[600, 150], [560, 260], [610, 360], [590, 470], [640, 560], [620, 700]];
const LAKE = [[180, 210], [300, 190], [360, 260], [330, 380], [250, 430], [170, 360]];
const CANAL = [[300, 420], [420, 470], [520, 500], [600, 520], [700, 540]];
const BRIDGE = [470, 486];
const ANDAU_V = [370, 600];
function landscape(a, broken = 0) {
  A(a, () => {
    // Austria and Hungary
    ctx.fillStyle = 'rgba(217,83,79,0.07)'; ctx.fillRect(0, 140, 600, 640);
    ctx.fillStyle = 'rgba(95,158,110,0.07)'; ctx.fillRect(600, 140, 264, 640);
    ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
    ctx.beginPath(); BORDER.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke(); ctx.setLineDash([]);
    font(700, 30, HEAD); text('AUSTRIA', 120, 520, { color: C.soft, spacing: '3px' });
    ctx.letterSpacing = '3px'; const hw = ctx.measureText('HUNGARY').width; ctx.letterSpacing = '0px';
    text('HUNGARY', Math.min(690, W - 20 - hw), 300, { color: C.soft, spacing: '3px' }); // stays inside the frame in a longer language
    // Lake Neusiedl and the Einser canal
    ctx.fillStyle = C.water; ctx.beginPath(); LAKE.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.fill();
    font(500, 21); text('Lake Neusiedl', 255, 310, { align: 'center', color: C.ink });
    ctx.strokeStyle = C.water; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); CANAL.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke(); ctx.lineCap = 'butt';
    font(500, 21); text('Einser canal', 640, 570, { color: C.soft });
    // the bridge: two planks, which part when it is blown up
    const [bx, by] = BRIDGE;
    ctx.fillStyle = '#b8935f';
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.3);
    ctx.fillRect(-10 - broken * 10, -26, 20, 22); ctx.fillRect(-10 + broken * 10, 4, 20, 22);
    if (broken < 0.5) ctx.fillRect(-10, -4, 20, 8);
    ctx.restore();
    font(700, 24, HEAD); text('Andau bridge', bx + 18, by - 40, { color: '#e3c08a' });
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(...ANDAU_V, 7, 0, TAU); ctx.fill();
    font(600, 22); text('Andau', ANDAU_V[0] - 14, ANDAU_V[1], { align: 'right', color: C.ink });
    font(500, 21); text('Schematic map', 60, 180, { color: C.faint });
  });
}
/** People walking west at night: small warm lights from the Hungarian side over the bridge to Andau. */
function walkers(t, t0, t1, n, { ruins = false } = {}) {
  for (let i = 0; i < n; i++) {
    const phase = ((t - t0) * 0.16 + i / n) % 1;
    if (t < t0 || t > t1) continue;
    const a = span(t, t0, t1, 0.6, 0.6);
    const path = [[820 - (i % 5) * 18, 380 + ((i * 37) % 260)], [560, 470 + (i % 3) * 8], BRIDGE, [420, 560], ANDAU_V];
    const seg_ = Math.min(3, Math.floor(phase * 4)), f = phase * 4 - seg_;
    const x = lerp(path[seg_][0], path[seg_ + 1][0], f), y = lerp(path[seg_][1], path[seg_ + 1][1], f) + (ruins && seg_ === 1 ? Math.sin(f * Math.PI) * 6 : 0);
    A(a * (0.55 + 0.45 * Math.sin(i * 1.7) ** 2), () => { ctx.fillStyle = C.person; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, TAU); ctx.fill(); });
  }
}

function sceneBorder(t) {
  A(span(t, 0.2, 32.6, 0.6, 0.5), () => {
    landscape(1, eio(seg(t, 23.6, 24.6)));
    font(700, 36, HEAD); text('November 1956', 70, 112, { color: C.ink });
    walkers(t, 1.0, 32.6, 34, { ruins: t > 24.6 });
    // Austria's asylum (cue 2)
    A(span(t, 5.0, 9.6, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 640, 520, 120, 14); ctx.fill();
      font(700, 26, HEAD); text('28 October 1956', 100, 676, { color: C.ink });
      font(500, 21); text('Austria will give asylum to any Hungarian who asks,', 100, 708, { color: C.soft });
      text('says its interior minister, Oskar Helmer', 100, 734, { color: C.soft });
    });
    // 70,000 (cue 4)
    A(span(t, 14.2, 19.0, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 640, 520, 120, 14); ctx.fill();
      font(700, 40, HEAD); text(`${fmt(ANDAU)}`, 100, 684, { color: C.person });
      font(500, 21); text('over this bridge, from 6 November', 280, 680, { color: C.ink }); text('Austrian accounts', 280, 708, { color: C.soft });
    });
    // Burgenland's help (cue 5)
    A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 640, 520, 120, 14); ctx.fill();
      font(700, 26, HEAD); text('19 November', 100, 676, { color: C.ink });
      font(500, 21); text('the Eisenstadt collecting point cares for 2,000,', 100, 708, { color: C.soft });
      text('Stoob and Oberpullendorf for 750', 100, 734, { color: C.soft });
    });
    A(span(t, 23.4, 28.0, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 640, 520, 120, 14); ctx.fill();
      font(700, 26, HEAD); text('The bridge is blown up', 100, 676, { color: C.red });
      font(500, 21); text('people cross over its ruins', 100, 708, { color: C.soft });
    });
    A(span(t, 28.0, 32.6, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 640, 520, 120, 14); ctx.fill();
      font(700, 26, HEAD); text('December', 100, 676, { color: C.ink });
      font(500, 21); text('the reprisals begin: a second, bigger wave', 100, 708, { color: C.soft });
    });
  });
}

// ---------- C: who they were ----------
function grid100(x0, y0, s, fill) {
  for (let i = 0; i < 100; i++) {
    const c = i % 10, r = Math.floor(i / 10), x = x0 + c * s, y = y0 + r * s;
    ctx.fillStyle = fill(i); ctx.beginPath(); ctx.arc(x, y, s * 0.32, 0, TAU); ctx.fill();
  }
}
function sceneWho(t) {
  A(span(t, 32.4, 51.2, 0.5, 0.5), () => {
    font(700, 36, HEAD); text('Who left', 70, 112, { color: C.ink });
    A(span(t, 32.6, 37.4, 0.4, 0.4), () => {
      const n = Math.round(FLED * eout(seg(t, 33.0, 35.0)));
      font(700, 80, HEAD); text(fmt(n), CX, 330, { align: 'center', color: C.person });
      font(600, 26); text('fled to Austria and Yugoslavia, 1956–57', CX, 400, { align: 'center', color: C.ink });
      font(500, 22); text('count of Hungary’s Central Statistical Office, 1957', CX, 440, { align: 'center', color: C.soft });
      A(seg(t, 34.6, 35.2), () => {
        font(600, 23); text('about 180,000 into Austria', CX, 520, { align: 'center', color: C.ink });
        text('about 20,000 into Yugoslavia', CX, 556, { align: 'center', color: C.soft });
      });
    });
    // men, young, children (cue 9): a grid of 100
    A(span(t, 37.2, 46.4, 0.4, 0.4), () => {
      const x0 = 120, y0 = 230, s = 42;
      const men = seg(t, 37.8, 39.0), young = seg(t, 39.6, 40.8);
      // first by sex, then by age: one property at a time
      grid100(x0, y0, s, (i) => {
        const bySex = i < 66 * men ? [127, 182, 230, 0.9] : [244, 221, 176, 0.35];
        const byAge = i < 70 ? [244, 221, 176, 0.95] : [244, 221, 176, 0.25];
        const m = (j) => lerp(bySex[j], byAge[j], young);
        return `rgba(${Math.round(m(0))},${Math.round(m(1))},${Math.round(m(2))},${m(3)})`;
      });
      font(600, 22); text('of every 100 who left:', x0 - 20, 190, { color: C.soft });
      A(men * (1 - young * 0.6), () => { font(700, 24, HEAD); text('66 men', 560, 250, { color: C.un }); });
      A(young, () => { font(700, 24, HEAD); text('70 aged 15 to 39', 560, 290, { color: C.person }); });
      A(seg(t, 41.0, 41.6), () => {
        ctx.fillStyle = C.panel; k.rrect(80, 660, 700, 100, 14); ctx.fill();
        font(600, 23); text('about 10,000 children under 15 left without their parents', 100, 696, { color: C.ink }); // CHILDREN
        font(500, 21); text('and one engineer in ten, one doctor in twenty', 100, 730, { color: C.soft });
      });
    });
    // the UN (cue 11)
    A(span(t, 46.4, 51.2, 0.4, 0.4), () => {
      const cx = CX, cy = 380, r = 110;
      ctx.strokeStyle = C.un; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, r * 0.6, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
      ctx.fillStyle = C.panel; k.rrect(cx - 200, cy - 34, 400, 68, 12); ctx.fill();
      font(700, 30, HEAD); text('UNHCR', cx, cy, { align: 'center', color: C.un, spacing: '2px' });
      font(500, 22); text('the UN’s refugee agency coordinates the relief,', cx, 560, { align: 'center', color: C.ink });
      text('with the Red Cross, the migration committee ICEM and charities', cx, 592, { align: 'center', color: C.soft });
    });
  });
}

// ---------- D: where they went ----------
// a schematic world: continents as soft blobs, Austria as the hub
const HUB = [470, 300];
const WORLD = { 'United States': [180, 330], Canada: [200, 230], Australia: [740, 600], 'West Germany': [445, 262], Britain: [405, 240], Switzerland: [452, 318] };
function sceneWhere(t) {
  A(span(t, 50.8, 65.2, 0.5, 0), () => {
    font(700, 36, HEAD); text('Where they went', 70, 112, { color: C.ink });
    // continents, schematic
    ctx.fillStyle = C.land;
    for (const [x, y, rx, ry] of [[190, 280, 140, 110], [230, 470, 70, 110], [470, 280, 80, 60], [520, 420, 90, 110], [640, 270, 160, 90], [740, 600, 70, 45]]) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill(); }
    font(500, 21); text('Schematic world', 60, 180, { color: C.faint });
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(...HUB, 8, 0, TAU); ctx.fill();
    font(600, 21); text('Austria', HUB[0] + 14, HUB[1] + 4, { color: C.ink });
    const max = DEST[0][1];
    DEST.forEach(([name, n], i) => {
      const at = i < 3 ? 51.4 + i * 0.6 : 55.8 + (i - 3) * 0.6, g = eio(seg(t, at, at + 1.2));
      const [x, y] = WORLD[name], w = 2 + 12 * (n / max);
      // an arc from Austria
      const mx = (HUB[0] + x) / 2, my = Math.min(HUB[1], y) - 60 - Math.abs(HUB[0] - x) * 0.15;
      ctx.strokeStyle = C.person; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(...HUB);
      for (let s = 1; s <= 24; s++) { const u = (g * s) / 24; ctx.lineTo((1 - u) ** 2 * HUB[0] + 2 * (1 - u) * u * mx + u * u * x, (1 - u) ** 2 * HUB[1] + 2 * (1 - u) * u * my + u * u * y); }
      ctx.stroke(); ctx.lineCap = 'butt';
    });
    // the list, in two halves (cues 12 and 13)
    DEST.forEach(([name, n], i) => {
      const at = i < 3 ? 52.0 + i * 0.6 : 56.4 + (i - 3) * 0.6;
      A(seg(t, at, at + 0.5) * (i < 3 ? 1 - seg(t, 59.8, 60.2) : 1 - seg(t, 59.8, 60.2)), () => {
        const y = 560 + (i % 3) * 52, x = i < 3 ? 100 : 480;
        font(700, 30, HEAD); text(fmt(n), x, y, { color: C.person });
        font(500, 22); text(name, x + 120, y, { color: C.ink });
      });
    });
    A(seg(t, 52.0, 52.6) * (1 - seg(t, 59.8, 60.2)), () => { font(500, 21); text('by 1960, a study for the UN', 100, 720, { color: C.soft }); });
    // who came back (cue 14)
    A(seg(t, 60.2, 60.8), () => {
      ctx.fillStyle = C.panel; k.rrect(80, 540, 704, 200, 14); ctx.fill();
      font(700, 34, HEAD); text(fmt(RETURNED), 110, 590, { color: C.ink });
      font(500, 22); text('had come home by the end of May 1957', 300, 590, { color: C.soft });
      font(700, 34, HEAD); text(`~${fmt(STAYED)}`, 110, 660, { color: C.person });
      font(500, 22); text('stayed abroad for good', 300, 660, { color: C.soft });
      font(500, 21); text('Hungarian Central Statistical Office', 110, 712, { color: C.faint });
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
  // a few snowflakes, fixed
  g.fillStyle = 'rgba(241,239,233,0.10)';
  for (let i = 0; i < 90; i++) { g.beginPath(); g.arc((i * 97.3) % W, (i * 53.9) % 790, 1.5 + (i % 3), 0, TAU); g.fill(); }
}

const CUES = [
  [0.4, 4.8, 'The Austrian–Hungarian border, November 1956: after the Soviet attack of 4 November, people start to leave.'],
  [5.0, 9.4, 'Austria opened its door early: on 28 October it offered asylum to *any Hungarian* who asked.'],
  [9.6, 14.0, 'At Andau, a narrow wooden bridge crosses the Einser canal, a little way from the border.'],
  [14.2, 18.6, 'From 6 November, about *70,000 people* cross it into Austria, by Austrian accounts.'],
  [18.8, 23.2, 'Burgenland’s villages take them in. On 19 November Eisenstadt alone cares for 2,000.'],
  [23.4, 27.8, 'Later in November the bridge is ~blown up~. People still cross over its ruins.'],
  [28.0, 32.4, 'In December, as the reprisals begin in Hungary, a second, bigger wave leaves.'],
  [32.6, 37.0, 'In all, *193,885 people* fled to Austria and Yugoslavia, Hungary’s own statistics office counted.'],
  [37.2, 41.6, 'Two in three were men, and most were young: seven in ten were aged 15 to 39.'],
  [41.8, 46.2, 'About 10,000 children under 15 left without their parents, and one engineer in ten.'],
  [46.4, 50.8, 'The UN gave the coordination of relief to its refugee agency, the *UNHCR*, with the Red Cross and charities.'],
  [51.0, 55.4, 'Countries around the world took them in: the United States 44,110, Canada 39,190, Australia 15,390.'],
  [55.6, 60.0, 'West Germany took 14,400, Britain 13,670 and Switzerland 10,480, among many others.'],
  [60.2, 64.6, 'By the end of May 1957, 11,447 had gone home. About 176,000 stayed abroad for good.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneBorder(t);
    sceneWho(t);
    sceneWhere(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.person, '~': C.red } });
  },
});
