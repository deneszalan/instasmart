// Explainer for earth-bordj-cedria-german-war-cemetery (Tunisia 1943): the German war cemetery at Bordj Cedria, near
// Hammam-Lif, kept by the Volksbund (Germany's war graves commission): 8,562 German soldiers of the Tunisian campaign,
// gathered in the 1970s from six makeshift cemeteries and field graves into ossuaries in six courtyards on a
// hillside; and what it means to remember the dead of an army that occupied the country. Look: a stone hillside
// at dusk with cypresses, terraces, a plain stone, and a wall of blue and yellow tiles. EB Garamond for titles and
// inscriptions, Inter for captions and labels.
//
// Facts:
// - Volksbund, "Kriegsgräberstätte Bordj-Cedria" (kriegsgraeberstaetten.volksbund.de/friedhof/bordj-cedria): about
//   25 km from Tunis, reached past Hammam Lif; "More than 8,500 German soldiers who lost their lives in combat or as
//   prisoners of war during the Tunisian campaign"; on the Keddel foothills, "six staggered individual courtyards,
//   where the remains of the dead are buried in ossuaries"; a stone in Arabic, German and French: "In this cemetery
//   rest 8,562 German soldiers from 1939 to 1945"; it also commemorates 104 soldiers whose graves were not found;
//   first buried in six provisional collective cemeteries, at Nassen (Cap Bon), Bizerta, La Mornaghia, El M'Dou,
//   Mateur and Sfax, and in field graves; the German-Tunisian war graves agreement came into force on 28 March 1966;
//   the cemetery was built from 1973 to 1975, then the reburials; "a large number of the approximately 2,000 unknown
//   dead were identified"; opened to the public on 28 September 1977; a visitors' room with glazed tiles fired in
//   Nabeul showing the outline of Tunisia and the original burial sites. The surrender of the German-Italian forces
//   near Tunis on 13 May 1943.
// - Volksbund, "Volkstrauertag": held every year two Sundays before the first Sunday of Advent. Webdo (Tunis, 2015):
//   for the German national day of mourning the German ambassador lays a wreath at Bordj Cedria, which hosts the day
//   every year; the Volksbund keeps 827 cemeteries in 45 countries for the German government.
// - Volksbund teaching module "Wie gehen wir mit unserer Vergangenheit um?" (Nordbaden): after 1945, "angesichts der
//   von Deutschen verübten Kriegsverbrechen war ein offizielles 'Heldengedenken' ... tabu"; the question of victims
//   lying beside perpetrators; war cemeteries now seen as "Lernorte", places of learning.
// - USHMM: the German occupation of Tunisia, November 1942 to May 1943; about 5,000 Tunisian Jewish men in forced
//   labour.
// No inscription is copied: the stone's three languages are shown as plain lines, labelled.
//
// Scene plan (65.2 s). Captions centred at y = 846.
//  A  0.0– 9.4  The hillside; 8,562.
//  B  9.6–23.2  An occupying army; the surrender; six makeshift cemeteries and field graves.
//  C 23.4–37.0  1966 agreement; 1973-75 building and reburial; the unknown identified.
//  D 37.2–50.8  Ossuaries in six courtyards; the stone; the tiles from Nabeul; opened 1977.
//  E 51.0–65.2  Kept by the Volksbund; the November wreath; no heroes; a place to learn.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky1: '#1b222b', sky2: '#4a4552', sky3: '#9a7b6a', hill: '#3e4234', hill2: '#2f3329', stone: '#d9d2c3', stoneShade: '#aaa293',
  cypress: '#22362b', ink: '#f3efe7', soft: 'rgba(243,239,231,0.76)', faint: 'rgba(243,239,231,0.22)', accent: '#e9c27a',
  tileBlue: '#2f6f9e', tileYellow: '#e2b13c', tileGreen: '#3f7d5a', panel: 'rgba(20,24,30,0.9)', grey: '#8f948c',
};
const SERIF = 'EB Garamond', SANS = 'Inter';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- numbers (Volksbund) ----------
const BURIED = 8562, NOT_FOUND = 104, UNKNOWN_ABOUT = 2000, SITES = 6, AGREEMENT = 1966, BUILT = [1973, 1975], OPENED = 1977, SURRENDER = 1943;
if (BURIED !== 8562 || NOT_FOUND !== 104 || SITES !== 6 || OPENED - SURRENDER !== 34 || BUILT[1] - BUILT[0] !== 2) throw new Error('numbers');
const OLD_SITES = ['Nassen (Cap Bon)', 'Bizerte', 'La Mornaghia', 'El M’Dou', 'Mateur', 'Sfax'];

function panel(x, y, w, h) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.stroke(); }
function skyBg() {
  const g = ctx.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, C.sky1); g.addColorStop(0.65, C.sky2); g.addColorStop(1, C.sky3);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 760);
}
function cypress(x, y, s) { ctx.fillStyle = C.cypress; ctx.beginPath(); ctx.moveTo(x, y - 150 * s); ctx.quadraticCurveTo(x + 26 * s, y - 60 * s, x + 14 * s, y); ctx.lineTo(x - 14 * s, y); ctx.quadraticCurveTo(x - 26 * s, y - 60 * s, x, y - 150 * s); ctx.fill(); }
/** The hillside with six staggered courtyards, from the lower right up to the upper left. */
const COURTS = Array.from({ length: SITES }, (_, i) => ({ x: 600 - i * 86, y: 640 - i * 62, w: 170, h: 40 }));
function hillside(courtsShown = 1, fill = 0) {
  ctx.fillStyle = C.hill; ctx.beginPath(); ctx.moveTo(0, 760); ctx.lineTo(0, 300); ctx.quadraticCurveTo(300, 240, 864, 560); ctx.lineTo(864, 760); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.hill2; ctx.fillRect(0, 700, W, 60);
  COURTS.forEach((c, i) => {
    const a = clamp(courtsShown * SITES - i);
    if (a <= 0) return;
    A(a, () => {
      ctx.fillStyle = C.stoneShade; ctx.fillRect(c.x - c.w / 2, c.y, c.w, 16);
      ctx.fillStyle = C.stone; ctx.fillRect(c.x - c.w / 2, c.y - c.h, c.w, c.h);
      // ossuary slabs
      ctx.fillStyle = `rgba(110,104,92,${0.25 + 0.6 * clamp(fill * SITES - i)})`;
      for (let j = 0; j < 4; j++) ctx.fillRect(c.x - c.w / 2 + 14 + j * 38, c.y - c.h + 10, 28, 20);
    });
  });
  for (const [x, s] of [[80, 1.1], [130, 1.3], [770, 1.2], [820, 1.0], [700, 0.9]]) cypress(x, 720, s);
}

// ---------- A ----------
function sceneOpen(t) {
  const a = span(t, 0, 9.6, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    skyBg(); hillside(eio(seg(t, 0.4, 2.4)), 1);
    A(seg(t, 0.8, 1.4), () => {
      font(500, 58, SERIF); text('Bordj Cedria', 48, 140, { align: 'left', color: C.ink });
      font(500, 24, SANS); text('German war cemetery, near Hammam-Lif, Tunisia', 50, 192, { align: 'left', color: C.accent });
    });
    A(seg(t, 5.0, 5.6), () => {
      panel(470, 250, 360, 150);
      font(600, 54, SERIF); text(fmt(BURIED), 650, 312, { align: 'center', color: C.ink });
      font(500, 22, SANS); text('German soldiers of 1942–43', 650, 360, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B: occupiers; six makeshift cemeteries ----------
const OUTLINE = [[36.95, 8.76], [37.23, 9.22], [37.27, 9.87], [37.17, 10.2], [36.8, 10.18], [36.9, 10.4], [37.08, 11.04], [36.85, 11.1], [36.4, 10.62], [35.83, 10.64], [35.77, 10.83], [35.5, 11.07], [35.24, 11.11], [34.74, 10.76], [34.4, 10.35], [33.88, 10.1], [33.7, 10.4], [33.5, 11.11], [33.17, 11.57], [32.4, 11.45], [31.7, 10.6], [30.24, 9.53], [31.6, 8.9], [32.3, 8.3], [33.2, 7.7], [34.0, 7.9], [34.6, 8.25], [35.3, 8.3], [36.0, 8.35], [36.6, 8.35]];
const MX = (lon) => 90 + (lon - 7.5) * 70, MY = (lat) => 130 + (37.5 - lat) * 85;
function sceneSites(t) {
  const a = span(t, 9.4, 23.4, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = C.sky1; ctx.fillRect(0, 0, W, 760);
    // the country, with the Axis-held north and east shaded (schematic)
    ctx.fillStyle = '#3c4148'; ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
    ctx.beginPath(); OUTLINE.forEach(([la, lo], i) => (i ? ctx.lineTo(MX(lo), MY(la)) : ctx.moveTo(MX(lo), MY(la)))); ctx.closePath(); ctx.fill(); ctx.stroke();
    A(seg(t, 9.8, 10.6) * (1 - seg(t, 18.2, 18.8)), () => {
      ctx.save(); ctx.beginPath(); OUTLINE.forEach(([la, lo], i) => (i ? ctx.lineTo(MX(lo), MY(la)) : ctx.moveTo(MX(lo), MY(la)))); ctx.closePath(); ctx.clip();
      ctx.fillStyle = 'rgba(169,120,110,0.55)'; ctx.beginPath(); ctx.moveTo(MX(9.2), MY(37.4)); ctx.lineTo(MX(11.3), MY(37.4)); ctx.lineTo(MX(11.6), MY(33.0)); ctx.lineTo(MX(10.0), MY(33.6)); ctx.lineTo(MX(9.6), MY(35.6)); ctx.lineTo(MX(9.0), MY(36.6)); ctx.closePath(); ctx.fill(); ctx.restore();
      font(600, 32, SERIF); text('An occupying army', 420, 200, { align: 'left', color: C.ink });
      font(500, 23, SANS); text('Axis troops held Tunis, Bizerte', 422, 244, { align: 'left', color: C.soft }); text('and the east, Nov 1942–May 1943', 422, 276, { align: 'left', color: C.soft });
      text('schematic', 120, 700, { align: 'left', color: C.soft });
      A(seg(t, 14.2, 14.8), () => {
        panel(410, 330, 420, 150);
        font(500, 23, SANS); text('Under the occupation, about', 432, 368, { align: 'left', color: C.ink }); text('5,000 Jewish men of Tunisia', 432, 400, { align: 'left', color: C.ink }); text('were put to forced labour (USHMM)', 432, 432, { align: 'left', color: C.ink });
      });
    });
    A(seg(t, 18.8, 19.4), () => {
      font(600, 32, SERIF); text('After 13 May 1943', 420, 160, { align: 'left', color: C.ink });
      font(500, 23, SANS); text('six makeshift cemeteries', 422, 204, { align: 'left', color: C.accent }); text('and scattered field graves', 422, 236, { align: 'left', color: C.soft });
      OLD_SITES.forEach((n, i) => A(seg(t, 19.4 + i * 0.25, 19.8 + i * 0.25), () => {
        const y = 300 + i * 62;
        ctx.strokeStyle = C.stone; ctx.lineWidth = 2; ctx.strokeRect(430, y - 22, 40, 44);
        ctx.fillStyle = C.stone; ctx.fillRect(446, y - 14, 8, 28); ctx.fillRect(438, y - 6, 24, 8);
        font(500, 26, SANS); text(n, 490, y, { align: 'left', color: C.ink });
      }));
    });
  });
}

// ---------- C: the agreement, the building, the reburial ----------
function sceneBuild(t) {
  const a = span(t, 23.2, 37.2, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    skyBg();
    const build = eio(seg(t, 28.0, 31.6));
    hillside(build, seg(t, 31.6, 35.0));
    A(seg(t, 23.4, 24.0) * (1 - seg(t, 27.6, 28.0)), () => {
      panel(150, 200, 564, 260);
      ctx.fillStyle = C.stone; ctx.fillRect(330, 236, 200, 130);
      ctx.fillStyle = 'rgba(40,40,40,0.4)'; for (let i = 0; i < 6; i++) ctx.fillRect(350, 256 + i * 16, 160 - (i === 5 ? 60 : 0), 6);
      font(600, 34, SERIF); text('28 March 1966', CX, 400, { align: 'center', color: C.ink });
      font(500, 23, SANS); text('a German–Tunisian war graves agreement', CX, 436, { align: 'center', color: C.soft });
    });
    A(seg(t, 28.0, 28.6), () => {
      font(600, 40, SERIF); text('1973–1975', 48, 140, { align: 'left', color: C.ink });
      font(500, 24, SANS); text('built on a slope of the Keddel hills', 50, 184, { align: 'left', color: C.accent });
    });
    A(seg(t, 32.6, 33.2), () => {
      panel(470, 210, 360, 150);
      font(600, 34, SERIF); text('about 2,000 unknown', 650, 258, { align: 'center', color: C.ink });
      font(500, 22, SANS); text('many identified', 650, 300, { align: 'center', color: C.accent }); text('when they were reburied', 650, 330, { align: 'center', color: C.soft });
    });
  });
}

// ---------- D: design: courtyards, the stone, the tiles; 1977 ----------
function tiles(x, y, cols, rows, s) {
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const tx = x + c * s, ty = y + r * s;
    ctx.fillStyle = (r + c) % 2 ? C.tileBlue : '#f1ead8'; ctx.fillRect(tx, ty, s - 2, s - 2);
    ctx.fillStyle = (r + c) % 2 ? C.tileYellow : C.tileGreen; ctx.beginPath(); ctx.arc(tx + s / 2 - 1, ty + s / 2 - 1, s * 0.18, 0, TAU); ctx.fill();
  }
}
function sceneDesign(t) {
  const a = span(t, 37.0, 51.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    skyBg(); hillside(1, 1);
    A(seg(t, 37.2, 37.8) * (1 - seg(t, 41.4, 41.8)), () => {
      font(600, 38, SERIF); text('No rows of crosses', 48, 140, { align: 'left', color: C.ink });
      font(500, 24, SANS); text('ossuaries in six staggered courtyards', 50, 184, { align: 'left', color: C.accent });
      COURTS.forEach((c) => { ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.strokeRect(c.x - c.w / 2 - 4, c.y - c.h - 4, c.w + 8, c.h + 8); });
    });
    // the stone
    A(seg(t, 41.8, 42.4) * (1 - seg(t, 46.0, 46.4)), () => {
      ctx.fillStyle = 'rgba(20,24,30,0.6)'; ctx.fillRect(0, 0, W, 760);
      ctx.fillStyle = C.stone; k.rrect(180, 150, 504, 420, 10); ctx.fill();
      ctx.fillStyle = C.stoneShade; ctx.fillRect(180, 540, 504, 30);
      const langs = ['Arabic', 'German', 'French'];
      langs.forEach((l, i) => {
        const y = 210 + i * 110;
        ctx.fillStyle = 'rgba(60,56,48,0.55)'; for (let j = 0; j < 3; j++) ctx.fillRect(230, y + j * 22, 300 - j * 40, 9);
        font(600, 24, SANS); text(l, 640, y + 20, { align: 'right', color: '#4a463d' });
      });
      font(600, 40, SERIF); text(fmt(BURIED), CX, 620, { align: 'center', color: C.ink });
      font(500, 23, SANS); text(`and ${NOT_FOUND} never found, remembered too`, CX, 666, { align: 'center', color: C.soft });
    });
    // the tiles from Nabeul
    A(seg(t, 46.4, 47.0), () => {
      ctx.fillStyle = 'rgba(20,24,30,0.7)'; ctx.fillRect(0, 0, W, 760);
      tiles(132, 150, 10, 7, 60);
      ctx.save(); ctx.translate(310, 160); ctx.scale(0.62, 0.62); ctx.translate(-90, -130);
      ctx.fillStyle = 'rgba(241,234,216,0.92)'; ctx.strokeStyle = C.tileBlue; ctx.lineWidth = 4;
      ctx.beginPath(); OUTLINE.forEach(([la, lo], i) => (i ? ctx.lineTo(MX(lo), MY(la)) : ctx.moveTo(MX(lo), MY(la)))); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      font(600, 30, SERIF); text('Tiles fired in Nabeul', CX, 610, { align: 'center', color: C.ink });
      font(500, 23, SANS); text('Tunisia’s outline and the old burial places', CX, 650, { align: 'center', color: C.soft });
      A(seg(t, 48.6, 49.2), () => { font(600, 26, SANS); text('Opened to the public, 28 September 1977', CX, 700, { align: 'center', color: C.accent }); });
    });
  });
}

// ---------- E: who keeps it, the wreath, what it means ----------
function wreath(x, y, s) {
  ctx.strokeStyle = '#3f5f3f'; ctx.lineWidth = 22 * s; ctx.beginPath(); ctx.arc(x, y, 60 * s, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#c9a24a'; for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 60 * s, y + Math.sin(a) * 60 * s, 6 * s, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#e9e2d2'; ctx.fillRect(x - 10 * s, y + 50 * s, 20 * s, 60 * s);
}
function sceneMeaning(t) {
  const a = span(t, 50.8, 65.2, 0.5, 0);
  if (a <= 0) return;
  A(a, () => {
    skyBg(); hillside(1, 1);
    A(seg(t, 51.0, 51.6) * (1 - seg(t, 55.0, 55.4)), () => {
      panel(48, 110, 768, 170);
      font(600, 34, SERIF); text('Kept by the Volksbund', 76, 160, { align: 'left', color: C.ink });
      font(500, 23, SANS); text('Germany’s war graves commission, for the German', 78, 204, { align: 'left', color: C.soft }); text('government: 827 cemeteries in 45 countries (2015)', 78, 236, { align: 'left', color: C.soft });
    });
    A(seg(t, 55.6, 56.2) * (1 - seg(t, 59.6, 60.0)), () => {
      wreath(CX + 160, 470, 1.1);
      panel(48, 110, 768, 170);
      font(600, 34, SERIF); text('Each November', 76, 160, { align: 'left', color: C.ink });
      font(500, 23, SANS); text('the German ambassador lays a wreath here,', 78, 204, { align: 'left', color: C.soft }); text('on Germany’s national day of mourning', 78, 236, { align: 'left', color: C.soft });
    });
    A(seg(t, 60.2, 60.8), () => {
      ctx.fillStyle = 'rgba(20,24,30,0.65)'; ctx.fillRect(0, 0, W, 760);
      panel(70, 160, W - 140, 400);
      font(600, 34, SERIF); text('Not heroes’ graves', CX, 230, { align: 'center', color: C.accent });
      font(500, 25, SANS);
      text('After 1945, the Volksbund writes, honouring', CX, 300, { align: 'center', color: C.ink });
      text('fallen soldiers as heroes became taboo,', CX, 338, { align: 'center', color: C.ink });
      text('given the crimes Germans had committed.', CX, 376, { align: 'center', color: C.ink });
      text('It now calls its cemeteries places to learn,', CX, 440, { align: 'center', color: C.soft });
      text('where victims may lie beside perpetrators.', CX, 478, { align: 'center', color: C.soft });
    });
  });
}

const CUES = [
  [0.4, 4.8, 'Bordj Cedria, near Hammam-Lif, some 25 km from Tunis: a *German war cemetery*.'],
  [5.0, 9.4, 'Here lie *8,562* German soldiers who died in 1942–43, in battle or as prisoners.'],
  [9.6, 14.0, 'They came as occupiers: for six months Axis troops held Tunis, Bizerte and the east.'],
  [14.2, 18.6, 'Under that occupation, about 5,000 Tunisian Jewish men were put to forced labour.'],
  [18.8, 23.2, 'After the surrender of 13 May 1943, they lay in six makeshift cemeteries and field graves.'],
  [23.4, 27.8, 'In 1966 a German–Tunisian agreement on war graves came into force.'],
  [28.0, 32.4, 'From 1973 to 1975 this cemetery was built on a slope of the Keddel hills.'],
  [32.6, 37.0, 'The dead were moved here, and many of about 2,000 unknown were identified.'],
  [37.2, 41.6, 'There are no rows of crosses: the remains lie in *ossuaries*, in six staggered courtyards.'],
  [41.8, 46.2, 'A stone in Arabic, German and French gives the number, and remembers 104 never found.'],
  [46.4, 50.8, 'Tiles fired in Nabeul map the old burial places. It opened to the public in 1977.'],
  [51.0, 55.4, 'It is kept by the *Volksbund*, Germany’s war graves commission.'],
  [55.6, 60.0, 'Each November, on Germany’s day of mourning, its ambassador lays a wreath here.'],
  [60.2, 64.6, 'The Volksbund itself says these are not heroes’ graves, but ~places to learn~ from.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    ctx.fillStyle = '#12161b'; ctx.fillRect(0, 0, W, H);
    sceneOpen(t); sceneSites(t); sceneBuild(t); sceneDesign(t); sceneMeaning(t);
    const g = ctx.createLinearGradient(0, 740, 0, H); g.addColorStop(0, 'rgba(18,22,27,0)'); g.addColorStop(0.2, '#12161b'); g.addColorStop(1, '#0d1014');
    ctx.fillStyle = g; ctx.fillRect(0, 740, W, H - 740);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 35, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.accent, '~': '#9fc6a6' } });
  },
});
