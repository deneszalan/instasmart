// Explainer for politics-khaled-abdul-wahab-mahdia (Tunisia 1943): Khaled Abdul-Wahab, a Tunisian landowner in
// Mahdia, took two Jewish families, about two dozen people, to his farm during the German occupation; how the story
// came to light through Robert Satloff, and what Yad Vashem decided when he was nominated as a Righteous Among the
// Nations. Look: lamplight on whitewashed walls and olive trees at night, a schematic map of Tunisia, then Yad
// Vashem's four tests as four lamps, of which one, risk, is the one the Commission found missing. Lora for titles
// and names, Source Sans 3 for captions and labels.
//
// Facts:
// - Associated Press, "First Arab nominated for Holocaust recognition" (30 January 2007, nbcnews.com/id/wbna16892399):
//   he came from an aristocratic family, acted as a go-between for Mahdia's population and the German forces; after
//   learning that German officers planned to rape Odette Boukris he took her family and several other Jewish
//   families, about two dozen people, to his farm outside Mahdia and hid them for four months; Anny Boukris was 11 in
//   1943; he died in 1997; Robert Satloff, director of the Washington Institute for Near East Policy, nominated him;
//   no Arab had been nominated before.
// - Robert Satloff, "Remembering the Holocaust in Tunisia" (Washington Institute, 14 December 2013): Anny Boukhris,
//   living in Los Angeles, wrote to him about ten years earlier; "Two weeks after Anny told her story, she died"; the
//   Germans took her family's house; Khaled Abdul Wahab, son of the writer Hassan Husni Abdul Wahab, took them in the
//   middle of the night to his farm in the village of Tlelsa; Satloff met her childhood friends in Mahdia and found
//   the farm as she had described it.
// - Reuters via Ynet (14 November 2010): some 25 people, the Buchris family and neighbours, stayed four months; they
//   went home in April 1943 when the British entered Mahdia; Yad Vashem did not grant the title.
// - Yad Vashem, Irena Steinfeldt, "Abdelwahab: the full picture" (Yad Vashem blog, 29 December 2011): the Commission
//   for the Designation of the Righteous examined the file; he hosted the Boukris and Ouzzan families on his estate
//   after their house had been billeted by the Germans; "he broke no law and the Jews stayed on his farm with the full
//   knowledge of the Germans"; Edmee Masliah (Ouzzan): when Germans came to check, they put on their yellow badges and
//   waited to be counted; "the Commission concluded that in the absence of risk, he was not eligible"; his solidarity
//   "commands our deep appreciation"; Yad Vashem published his story in Hebrew.
// - Yad Vashem, Righteous FAQ: the four criteria: active involvement in saving Jews from death or deportation; risk
//   to the rescuer's life, liberty or position; the motive of helping, not payment or other reward; testimony or
//   unequivocal documentation.
// The map is schematic; the people are drawn as simple figures, not portraits.
//
// Scene plan (65.2 s). Captions centred at y = 846.
//  A  0.0– 9.4  Tunisia, Mahdia, November 1942; Khaled Abdul-Wahab.
//  B  9.6–28.0  The Boukris house taken; the night drive to the farm at Tlelsa; about two dozen people, four months.
//  C 28.0–41.6  He dies in 1997; Anny Boukris tells Satloff; Satloff checks in Mahdia.
//  D 41.8–60.0  Yad Vashem's four tests; the Commission's finding on risk.
//  E 60.2–65.2  "Deep appreciation"; the story published in Hebrew.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  night: '#16202b', night2: '#22303f', ink: '#f6f1e6', soft: 'rgba(246,241,230,0.76)', faint: 'rgba(246,241,230,0.22)',
  wall: '#ece4d4', wallShade: '#cdbfa6', window: '#f4c56b', olive: '#7d8f4e', oliveDark: '#4f5e31', trunk: '#6b5640',
  lamp: '#f4c56b', rose: '#ef9a80', sea: '#20465a', land: '#5c5440', grey: '#9aa0a6', family: '#f0b48a', panel: 'rgba(16,22,30,0.88)',
};
const SERIF = 'Lora', SANS = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- numbers ----------
const BORN = 1911, DIED = 1997, PEOPLE_ABOUT = 24, MONTHS = 4, NOMINATED = 2007, ANNY_AGE_1943 = 11;
if (DIED - BORN !== 86 || PEOPLE_ABOUT !== 24 || MONTHS !== 4 || NOMINATED !== 2007 || ANNY_AGE_1943 !== 11) throw new Error('numbers');

// ---------- a schematic map of Tunisia ----------
const OUTLINE = [[36.95, 8.76], [37.23, 9.22], [37.27, 9.87], [37.17, 10.2], [36.8, 10.18], [36.9, 10.4], [37.08, 11.04], [36.85, 11.1], [36.4, 10.62], [35.83, 10.64], [35.77, 10.83], [35.5, 11.07], [35.24, 11.11], [34.74, 10.76], [34.4, 10.35], [33.88, 10.1], [33.7, 10.4], [33.5, 11.11], [33.17, 11.57], [32.4, 11.45], [31.7, 10.6], [30.24, 9.53], [31.6, 8.9], [32.3, 8.3], [33.2, 7.7], [34.0, 7.9], [34.6, 8.25], [35.3, 8.3], [36.0, 8.35], [36.6, 8.35]];
const MAP = { x0: 300, y0: 140, s: 92 }; // px per degree
const MX = (lon) => MAP.x0 + (lon - 7.5) * MAP.s * 0.82, MY = (lat) => MAP.y0 + (37.6 - lat) * MAP.s;
function tunisia(a, { x = 0, y = 0, s = 1 } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = C.land; ctx.strokeStyle = 'rgba(246,241,230,0.5)'; ctx.lineWidth = 2.5 / s;
    ctx.beginPath(); OUTLINE.forEach(([la, lo], i) => (i ? ctx.lineTo(MX(lo), MY(la)) : ctx.moveTo(MX(lo), MY(la)))); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(MX(10.9), MY(33.8), 14, 11, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
}

// ---------- drawing helpers ----------
function person(x, y, s, color, a = 1) {
  A(a, () => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y - 34 * s, 9 * s, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 12 * s, y); ctx.quadraticCurveTo(x - 13 * s, y - 24 * s, x, y - 24 * s); ctx.quadraticCurveTo(x + 13 * s, y - 24 * s, x + 12 * s, y); ctx.closePath(); ctx.fill();
  });
}
function house(x, y, w, h, { lit = 0, dome = false } = {}) {
  ctx.fillStyle = C.wall; ctx.fillRect(x, y - h, w, h);
  ctx.fillStyle = C.wallShade; ctx.fillRect(x + w - 10, y - h, 10, h);
  if (dome) { ctx.fillStyle = C.wall; ctx.beginPath(); ctx.arc(x + w / 2, y - h, w * 0.3, Math.PI, 0); ctx.fill(); }
  ctx.fillStyle = lit > 0 ? `rgba(244,197,107,${0.35 + 0.65 * lit})` : '#2a3442';
  ctx.fillRect(x + w * 0.25, y - h * 0.62, w * 0.18, h * 0.22); ctx.fillRect(x + w * 0.58, y - h * 0.62, w * 0.18, h * 0.22);
  ctx.fillStyle = '#3a4656'; ctx.fillRect(x + w * 0.42, y - h * 0.34, w * 0.16, h * 0.34);
}
function olive(x, y, s) {
  ctx.fillStyle = C.trunk; ctx.fillRect(x - 4 * s, y - 34 * s, 8 * s, 34 * s);
  ctx.fillStyle = C.oliveDark; ctx.beginPath(); ctx.ellipse(x, y - 52 * s, 34 * s, 24 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C.olive; ctx.beginPath(); ctx.ellipse(x - 8 * s, y - 58 * s, 22 * s, 15 * s, 0, 0, TAU); ctx.fill();
}
function panel(x, y, w, h) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.stroke(); }
function heading(big, small, a, { y = 150, color = C.lamp } = {}) {
  A(a, () => {
    font(600, 44, SERIF); text(big, 48, y, { align: 'left', color: C.ink });
    if (small) { font(500, 25, SANS); text(small, 50, y + 44, { align: 'left', color }); }
  });
}
let stars = null;
function sky() {
  if (!stars) { stars = []; for (let i = 0; i < 70; i++) stars.push([(i * 137.5) % W, 60 + ((i * 89.3) % 380), 0.5 + (i % 3) * 0.5]); }
  const g = ctx.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, C.night); g.addColorStop(1, C.night2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 760);
  ctx.fillStyle = 'rgba(246,241,230,0.55)'; for (const [x, y, r] of stars) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
}

// ---------- A: the map ----------
function sceneMap(t) {
  const a = span(t, 0, 9.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    sky();
    tunisia(1);
    const mx = MX(11.07), my = MY(35.5);
    A(seg(t, 0.8, 1.4), () => {
      ctx.fillStyle = C.lamp; ctx.beginPath(); ctx.arc(mx, my, 9, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.lamp; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my, 18 + 6 * Math.sin(t * 3), 0, TAU); ctx.stroke();
      font(600, 30, SERIF); text('Mahdia', mx + 28, my, { align: 'left', color: C.lamp });
      font(500, 24, SANS); text('Tunis', MX(10.18) - 14, MY(36.8), { align: 'right', color: C.soft });
      ctx.fillStyle = C.soft; ctx.beginPath(); ctx.arc(MX(10.18), MY(36.8), 5, 0, TAU); ctx.fill();
      font(500, 22, SANS); text('schematic map', 60, 720, { align: 'left', color: C.soft });
    });
    heading('November 1942', 'German troops occupy Tunisia’s coast', seg(t, 1.2, 1.8) * (1 - seg(t, 4.6, 5.0)), { y: 120 });
    A(seg(t, 5.0, 5.6), () => {
      panel(470, 470, 360, 190);
      font(600, 32, SERIF); text('Khaled Abdul-Wahab', 490, 512, { align: 'left', color: C.ink });
      font(500, 24, SANS); text('1911–1997', 492, 552, { align: 'left', color: C.lamp });
      text('landowner, of a prominent', 492, 590, { align: 'left', color: C.soft });
      text('Tunisian Muslim family', 492, 622, { align: 'left', color: C.soft });
    });
  });
}

// ---------- B: the house, the night drive, the farm ----------
function sceneTown(t) {
  const a = span(t, 9.4, 28.2, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    sky();
    // the sea and the town of Mahdia on the left
    ctx.fillStyle = C.sea; ctx.fillRect(0, 560, W, 200);
    const shift = -eio(seg(t, 18.6, 21.6)) * 520; // pan from the town to the farm
    ctx.save(); ctx.translate(shift, 0);
    ctx.fillStyle = '#2b3a2c'; ctx.fillRect(-20, 600, 1500, 160);
    house(60, 610, 120, 130, { lit: 0.6 }); house(190, 610, 150, 170, { lit: seg(t, 9.6, 10.4) * (1 - seg(t, 11.4, 12.2)) });
    house(350, 610, 110, 120, { lit: 0.4, dome: true });
    A(seg(t, 9.8, 10.6), () => { font(500, 24, SANS); text('the Boukris house', 265, 410, { align: 'center', color: C.ink }); });
    // grey soldiers arrive; the family walks out
    const come = eio(seg(t, 10.4, 12.4));
    for (let i = 0; i < 3; i++) person(lerp(600 + i * 56, 210 + i * 50, come), 680, 1.6, C.grey);
    const out = eio(seg(t, 12.2, 14.0));
    for (let i = 0; i < 4; i++) person(lerp(230 + i * 34, 20 + i * 44, out), 690, 1.45 - (i > 1 ? 0.3 : 0), C.family, seg(t, 11.8, 12.4));
    // the road to Tlelsa and the farm, 520 px to the right
    ctx.strokeStyle = 'rgba(246,241,230,0.25)'; ctx.lineWidth = 3; ctx.setLineDash([18, 14]);
    ctx.beginPath(); ctx.moveTo(40, 690); ctx.lineTo(1300, 690); ctx.stroke(); ctx.setLineDash([]);
    for (const [x, s] of [[860, 1.1], [960, 1.3], [1090, 1.2], [1240, 1.4], [1340, 1.0]]) olive(x, 640, s);
    house(1010, 640, 170, 110, { lit: seg(t, 21.0, 22.0) }); house(1180, 640, 110, 90, { lit: seg(t, 21.4, 22.4) });
    // the car at night
    const drive = eio(seg(t, 18.8, 21.6));
    const cx = lerp(120, 940, drive);
    A(seg(t, 18.6, 19.0), () => {
      ctx.fillStyle = '#3c3f44'; k.rrect(cx - 50, 664, 100, 30, 10); ctx.fill(); ctx.fillRect(cx - 28, 646, 56, 22);
      ctx.fillStyle = C.lamp; ctx.beginPath(); ctx.moveTo(cx + 50, 676); ctx.lineTo(cx + 170, 660); ctx.lineTo(cx + 170, 700); ctx.closePath(); ctx.globalAlpha *= 0.35; ctx.fill();
    });
    ctx.restore();
    heading('Anny Boukris, then 11', 'later told how a German officer threatened her mother', seg(t, 14.2, 14.8) * (1 - seg(t, 18.4, 18.8)), { color: C.rose });
    heading('By night, to Tlelsa', 'the Abdul-Wahab farm, outside Mahdia', seg(t, 19.0, 19.6) * (1 - seg(t, 23.0, 23.4)));
    // the farm: about two dozen people, about four months
    A(seg(t, 23.4, 24.0), () => {
      panel(48, 100, 768, 300);
      font(600, 40, SERIF); text('about two dozen people', 76, 148, { align: 'left', color: C.ink });
      font(500, 24, SANS); text('the Boukris and Ouzzan families', 78, 190, { align: 'left', color: C.soft });
      for (let i = 0; i < PEOPLE_ABOUT; i++) person(92 + i * 30, 270, 0.62, C.family, seg(t, 24.0 + i * 0.04, 24.4 + i * 0.04));
      for (let m = 0; m < MONTHS; m++) {
        const f = seg(t, 25.0 + m * 0.5, 25.5 + m * 0.5);
        ctx.strokeStyle = C.lamp; ctx.lineWidth = 2; ctx.strokeRect(78 + m * 82, 304, 70, 40);
        ctx.fillStyle = C.lamp; ctx.fillRect(78 + m * 82, 304, 70 * f, 40);
      }
      font(500, 24, SANS); text('about four months, to April 1943', 420, 324, { align: 'left', color: C.lamp });
    });
  });
}

// ---------- C: the story nearly lost, then found ----------
function tape(x, y, s) {
  ctx.fillStyle = '#d9d1c1'; k.rrect(x - 90 * s, y - 55 * s, 180 * s, 110 * s, 10 * s); ctx.fill();
  ctx.fillStyle = '#2a3442'; k.rrect(x - 66 * s, y - 34 * s, 132 * s, 48 * s, 8 * s); ctx.fill();
  ctx.fillStyle = '#d9d1c1';
  for (const dx of [-36, 36]) { ctx.beginPath(); ctx.arc(x + dx * s, y - 10 * s, 15 * s, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = '#2a3442'; ctx.lineWidth = 3 * s;
  for (const dx of [-36, 36]) for (let i = 0; i < 3; i++) { const a = t0 * 2 + i * 2.1; ctx.beginPath(); ctx.moveTo(x + dx * s, y - 10 * s); ctx.lineTo(x + dx * s + Math.cos(a) * 12 * s, y - 10 * s + Math.sin(a) * 12 * s); ctx.stroke(); }
}
let t0 = 0;
function sceneMemory(t) {
  const a = span(t, 27.8, 41.8, 0.5, 0.5);
  if (a <= 0) return;
  t0 = t;
  A(a, () => {
    sky();
    // 1997: a frame with name and dates, no portrait
    A(seg(t, 28.0, 28.6) * (1 - seg(t, 32.2, 32.6)), () => {
      panel(170, 230, 524, 300);
      ctx.strokeStyle = C.lamp; ctx.lineWidth = 2; ctx.strokeRect(190, 250, 484, 260);
      font(600, 40, SERIF); text('Khaled Abdul-Wahab', CX, 340, { align: 'center', color: C.ink });
      font(500, 30, SANS); text('1911–1997', CX, 396, { align: 'center', color: C.lamp });
      font(500, 24, SANS); text('his story, nearly lost', CX, 450, { align: 'center', color: C.soft });
    });
    // Anny's recording and Satloff
    A(seg(t, 32.6, 33.2) * (1 - seg(t, 36.8, 37.2)), () => {
      tape(250, 380, 1.2);
      font(600, 30, SERIF); text('Anny Boukris', 430, 330, { align: 'left', color: C.rose });
      font(500, 24, SANS); text('records her story for', 430, 372, { align: 'left', color: C.ink });
      text('the historian Robert Satloff,', 430, 404, { align: 'left', color: C.ink });
      text('early 2000s', 430, 436, { align: 'left', color: C.soft });
      text('She died two weeks later.', 430, 488, { align: 'left', color: C.lamp });
    });
    // Satloff checks: Mahdia, her friends, the farm
    A(seg(t, 37.2, 37.8), () => {
      font(600, 34, SERIF); text('Checked in Mahdia', 300, 170, { align: 'left', color: C.ink });
      const items = ['her childhood friends', 'the farm at Tlelsa', 'its trees, houses and pool'];
      items.forEach((s, i) => A(seg(t, 38.0 + i * 0.7, 38.5 + i * 0.7), () => {
        ctx.strokeStyle = C.lamp; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(306, 250 + i * 60); ctx.lineTo(318, 262 + i * 60); ctx.lineTo(340, 234 + i * 60); ctx.stroke();
        font(500, 28, SANS); text(s, 360, 250 + i * 60, { align: 'left', color: C.ink });
      }));
      A(seg(t, 39.8, 40.4), () => { for (const [x, s] of [[380, 1.0], [470, 1.2], [580, 1.1], [700, 1.3]]) olive(x, 640, s); house(500, 640, 150, 90, { lit: 0.8 }); ctx.fillStyle = '#3b6c86'; ctx.fillRect(660, 646, 120, 18); });
    });
  });
}

// ---------- D: Yad Vashem's four tests ----------
const TESTS = [['Active help', 'saving Jews from death or deportation'], ['Risk', 'to the rescuer’s life, liberty or position'], ['Motive', 'to help, not for pay or reward'], ['Testimony', 'or clear documents']];
function sceneTests(t) {
  const a = span(t, 41.6, 60.2, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    sky();
    heading('Yad Vashem, Jerusalem', 'Israel’s Holocaust memorial', seg(t, 41.8, 42.4) * (1 - seg(t, 46.0, 46.4)));
    A(seg(t, 42.4, 43.0) * (1 - seg(t, 46.0, 46.4)), () => {
      panel(150, 330, 564, 200);
      font(600, 34, SERIF); text('2007: nominated by Satloff', CX, 390, { align: 'center', color: C.ink });
      font(500, 26, SANS); text('as a Righteous Among the Nations', CX, 440, { align: 'center', color: C.lamp });
      text('the first Arab to be put forward', CX, 482, { align: 'center', color: C.soft });
    });
    // the four lamps
    const show = seg(t, 46.4, 47.2);
    const focus = seg(t, 48.4, 49.2);
    const dim = seg(t, 53.0, 54.4);
    A(show, () => {
      font(600, 34, SERIF); text('Four tests for the title', 48, 140, { align: 'left', color: C.ink });
      TESTS.forEach(([name, sub], i) => {
        const y = 220 + i * 100, isRisk = i === 1;
        A(isRisk ? 1 : 1 - 0.6 * focus, () => {
          const glow = isRisk ? 1 - dim : 0.5;
          ctx.fillStyle = `rgba(244,197,107,${0.15 + 0.5 * glow})`; ctx.beginPath(); ctx.arc(90, y, 30, 0, TAU); ctx.fill();
          ctx.strokeStyle = isRisk ? C.lamp : C.soft; ctx.lineWidth = 3; ctx.stroke();
          font(600, 32, SERIF); text(name, 140, y - 14, { align: 'left', color: isRisk ? C.lamp : C.ink });
          font(500, 24, SANS); text(sub, 140, y + 22, { align: 'left', color: C.soft });
        });
      });
    });
    // what the testimonies said
    const cards = ['No law forbade hosting Jews', 'The Germans knew they were there', 'They came to count them, and', 'the families wore yellow badges'];
    A(seg(t, 51.0, 51.6) * (1 - seg(t, 59.4, 60.0)), () => {
      panel(462, 520, 370, 176);
      font(600, 24, SANS); text('THE COMMISSION FOUND', 484, 550, { align: 'left', color: C.rose, spacing: '1px' });
      cards.forEach((s, i) => A(seg(t, 51.4 + i * 0.6, 51.9 + i * 0.6), () => { font(500, 22, SANS); text(s, 482, 588 + i * 30, { align: 'left', color: C.ink }); }));
    });
    A(seg(t, 55.6, 56.2), () => {
      panel(48, 612, 410, 112);
      font(600, 29, SERIF); text('“in the absence of risk,', 70, 648, { align: 'left', color: C.rose });
      text('he was not eligible”', 70, 686, { align: 'left', color: C.rose });
    });
  });
}

// ---------- E: appreciation ----------
function book(x, y, s) {
  ctx.fillStyle = '#7a4b3a'; k.rrect(x - 70 * s, y - 95 * s, 140 * s, 190 * s, 6 * s); ctx.fill();
  ctx.fillStyle = '#efe6d2'; ctx.fillRect(x + 62 * s, y - 88 * s, 8 * s, 176 * s);
  ctx.strokeStyle = C.lamp; ctx.lineWidth = 2 * s; ctx.strokeRect(x - 52 * s, y - 70 * s, 100 * s, 50 * s);
}
function sceneEnd(t) {
  const a = span(t, 60.0, 65.2, 0.5, 0);
  if (a <= 0) return;
  A(a, () => {
    sky();
    for (const [x, s] of [[110, 1.3], [250, 1.1], [640, 1.2], [780, 1.4]]) olive(x, 700, s);
    panel(90, 170, W - 180, 300);
    font(500, 32, SERIF);
    text('“The account of this honorable', CX, 236, { align: 'center', color: C.ink });
    text('Tunisian’s solidarity with the Jewish', CX, 280, { align: 'center', color: C.ink });
    text('victims commands our deep appreciation.”', CX, 324, { align: 'center', color: C.ink });
    font(500, 24, SANS); text('Yad Vashem, 29 December 2011', CX, 392, { align: 'center', color: C.lamp });
    A(seg(t, 62.0, 62.6), () => { book(CX, 600, 0.9); font(500, 24, SANS); text('his story, published by Yad Vashem in Hebrew', CX, 730, { align: 'center', color: C.soft }); });
  });
}

const CUES = [
  [0.4, 4.8, 'Mahdia, on Tunisia’s east coast, November 1942: German troops occupy the town.'],
  [5.0, 9.4, '*Khaled Abdul-Wahab*, of a prominent Tunisian Muslim family, is a go-between with them.'],
  [9.6, 14.0, 'The Germans take over the house of a Jewish family, the Boukris, and turn them out.'],
  [14.2, 18.6, 'Anny Boukris, then 11, later said a German officer planned to rape her mother, Odette.'],
  [18.8, 23.2, 'By night, Abdul-Wahab takes her family and the Ouzzans to his farm at *Tlelsa*.'],
  [23.4, 27.8, 'About two dozen people stay there some four months, until the British arrive in April 1943.'],
  [28.0, 32.4, 'Khaled Abdul-Wahab dies in 1997, and his story is nearly lost.'],
  [32.6, 37.0, 'In the early 2000s Anny tells it to the American historian *Robert Satloff*, and dies weeks later.'],
  [37.2, 41.6, 'Satloff finds her childhood friends in Mahdia, and the farm just as she described it.'],
  [41.8, 46.2, 'In 2007 he puts Abdul-Wahab forward to *Yad Vashem*, Israel’s Holocaust memorial.'],
  [46.4, 50.8, 'Its title, *Righteous Among the Nations*, has four tests. One is ~risk~ to the rescuer.'],
  [51.0, 55.4, 'Its Commission finds he broke no law, and the Germans knew the families were on the farm.'],
  [55.6, 60.0, 'In the absence of risk, it rules, he is not eligible. His family and Satloff disagree.'],
  [60.2, 64.6, 'Yad Vashem calls his solidarity worthy of “deep appreciation”, and publishes his story in Hebrew.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    ctx.fillStyle = '#11171f'; ctx.fillRect(0, 0, W, H);
    sceneMap(t); sceneTown(t); sceneMemory(t); sceneTests(t); sceneEnd(t);
    const g = ctx.createLinearGradient(0, 740, 0, H); g.addColorStop(0, 'rgba(17,23,31,0)'); g.addColorStop(0.2, '#11171f'); g.addColorStop(1, '#0c1117');
    ctx.fillStyle = g; ctx.fillRect(0, 740, W, H - 740);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.lamp, '~': C.rose } });
  },
});
