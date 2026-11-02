// Explainer for earth-gammarth-french-military-cemetery (Tunisia 1943): the French military cemetery at Gammarth, above
// La Marsa north of Tunis, opened on 5 January 1944 for the non-Muslim dead of the French army of the Tunisian campaign;
// Muslim soldiers, among them many Tunisian, Algerian and Moroccan tirailleurs, were buried in Muslim cemeteries; after
// independence war memorials came down, and in 1966-68 French military graves from town cemeteries were gathered at
// Gammarth. Look: a calm hillside of white headstones and cypresses above the sea at the end of the day, then plain
// panels and a schematic coast of Tunisia. EB Garamond for titles and numbers, Outfit for captions and labels.
//
// Facts:
// - Wikipedia (fr), "Cimetière militaire de Gammarth" (citing the French consulate in Tunis): opened on 5 January 1944;
//   kept by the veterans' service of the French embassy; first for the non-Muslim soldiers of the North African troops
//   killed in the Tunisian campaign (19 November 1942 to 13 May 1943): "des chrétiens, des juifs et des animistes mais
//   pas de musulmans pour respecter la différence religieuse. Ces derniers sont enterrés dans des cimetières musulmans
//   comme à Haffouz et Tarf ech-Chena"; after the military plots of town cemeteries were gathered there in 1966-1968,
//   also the dead of the First and Second World Wars and of Indochina: 1,875 bodies in individual graves; an ossuary of
//   23 coffins of remains and 1,220 boxes of unknown dead; a columbarium of 1971; after independence the tomb of the
//   Unknown Soldier of the Tunisian campaign, the monument to the Corps francs d'Afrique and other memorials were moved
//   there.
// - Le Courrier de l'Atlas (R. Cherif, 8 May 2015): the cemetery holds 1,875 soldiers of the two world wars and
//   Indochina; on 8 May the French embassy held a ceremony there; afterwards an exhibition at La Marsa honoured Tunisian
//   veterans, mostly of the 8th and 4th Tunisian tirailleur regiments.
// - Webdo (4 November 2021): the tomb of the Unknown Soldier stood in central Tunis, between the cathedral and the French
//   embassy, and was moved to Gammarth after independence. Webdo (H. Bourial, 3 May 2019): the military cemetery of
//   Enfidha, created in 1949, holds 235 soldiers of Jewish, Christian and Muslim faith, with a separate mausoleum for
//   Muslim soldiers of Free France.
// - H. Kazdaghli, "Histoire de la mémoire de la Grande Guerre en Tunisie" (Hespéris-Tamuda, 2018): in February 1957 the
//   monument to the dead of both wars in Tunis was taken down by the city, after the one at Ain Draham, whose WWI names
//   were almost all Tunisians of Khroumir origin.
// - French ministry of the armed forces (Chemins de mémoire): photographs of Moroccan tirailleurs at Pont-du-Fahs, May
//   1943, and of the 9th Algerian Tirailleurs, February 1943; les-tirailleurs.fr (É. de Fleurian): battalions of the
//   4th Tunisian Tirailleurs fought from November 1942.
// The hillside and the map are schematic; no photograph is copied.
//
// Scene plan (65 s). Important things stay above y = 790; captions are centred at y = 846.
//  A  0.0– 9.4  The hillside at Gammarth; 5 January 1944; the campaign.
//  B  9.6–14.0  Who served: tirailleurs and Europeans.
//  C 14.2–27.8  Buried by faith: Gammarth for non-Muslims; Muslim cemeteries; Enfidha.
//  D 28.0–41.6  1956-57: memorials come down; 1966-68: graves gathered at Gammarth.
//  E 41.8–55.4  1,875 graves; 1,220 unknown; the Unknown Soldier.
//  F 55.6–64.8  Ceremonies; Tunisian veterans, 2015.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky1: '#f1d9b8', sky2: '#c9d6d8', sea: '#4f7a96', sea2: '#3d6580', slope: '#7f9270', slope2: '#6a7d5c', stone: '#f2eee4', stoneShade: '#cfc8b8',
  cypress: '#2c4535', ink: '#1f2b26', soft: 'rgba(31,43,38,0.72)', light: '#f6f3ea', lightSoft: 'rgba(246,243,234,0.8)', gold: '#c99a3b', panel: 'rgba(23,40,33,0.9)',
};
const SERIF = 'EB Garamond', SANS = 'Outfit';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const OPENED = 1944, GRAVES = 1875, UNKNOWN = 1220, ENFIDHA = 235, ENFIDHA_YEAR = 1949;
if (GRAVES + UNKNOWN !== 3095 || ENFIDHA_YEAR - OPENED !== 5) throw new Error('numbers');

// ---------- the hillside ----------
function cross(x, y, s) {
  ctx.fillStyle = C.stone; ctx.fillRect(x - 3 * s, y - 34 * s, 6 * s, 34 * s); ctx.fillRect(x - 11 * s, y - 26 * s, 22 * s, 6 * s);
  ctx.fillStyle = C.stoneShade; ctx.fillRect(x + 1 * s, y - 34 * s, 2 * s, 34 * s);
}
function stele(x, y, s, star) {
  ctx.fillStyle = C.stone; ctx.beginPath(); ctx.moveTo(x - 9 * s, y); ctx.lineTo(x - 9 * s, y - 22 * s); ctx.arc(x, y - 22 * s, 9 * s, Math.PI, 0); ctx.lineTo(x + 9 * s, y); ctx.closePath(); ctx.fill();
  if (star) {
    ctx.strokeStyle = C.stoneShade; ctx.lineWidth = 1.4 * s;
    for (const r of [0, Math.PI]) { ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = r - Math.PI / 2 + (i * TAU) / 3; ctx.lineTo(x + Math.cos(a) * 5 * s, y - 20 * s + Math.sin(a) * 5 * s); } ctx.closePath(); ctx.stroke(); }
  }
}
function cypress(x, y, s) {
  ctx.fillStyle = C.cypress; ctx.beginPath(); ctx.moveTo(x, y - 120 * s); ctx.quadraticCurveTo(x + 22 * s, y - 50 * s, x + 12 * s, y); ctx.lineTo(x - 12 * s, y); ctx.quadraticCurveTo(x - 22 * s, y - 50 * s, x, y - 120 * s); ctx.fill();
}
/** Rows of headstones on the slope, the kinds mixed as in a regrouped cemetery (schematic). */
const STONES = [];
{
  let s = 11;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let r = 0; r < 6; r++) for (let i = 0; i < 13; i++) {
    const kind = rnd() < 0.7 ? 'cross' : rnd() < 0.5 ? 'star' : 'plain';
    STONES.push({ x: 70 + i * 60 + (r % 2) * 30, y: 520 + r * 46, s: 0.75 + r * 0.09, kind });
  }
}
function hillside(t, dim = 0) {
  const sky = ctx.createLinearGradient(0, 0, 0, 380); sky.addColorStop(0, C.sky2); sky.addColorStop(1, C.sky1);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 400);
  ctx.fillStyle = C.sea; ctx.fillRect(0, 330, W, 120);
  ctx.fillStyle = C.sea2; ctx.fillRect(0, 330, W, 4);
  // far shore of the gulf
  ctx.fillStyle = 'rgba(80,100,110,0.5)'; ctx.beginPath(); ctx.moveTo(520, 332); ctx.quadraticCurveTo(700, 300, W, 318); ctx.lineTo(W, 334); ctx.closePath(); ctx.fill();
  // the slope
  ctx.fillStyle = C.slope; ctx.beginPath(); ctx.moveTo(0, 430); ctx.quadraticCurveTo(430, 400, W, 450); ctx.lineTo(W, 790); ctx.lineTo(0, 790); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.slope2; for (let r = 0; r < 6; r++) ctx.fillRect(40, 524 + r * 46, W - 80, 3);
  for (const [x, y, s] of [[40, 520, 1.1], [820, 540, 1.2], [430, 470, 0.8], [250, 470, 0.7], [640, 480, 0.85]]) cypress(x, y, s);
  for (const st of STONES) { if (st.kind === 'cross') cross(st.x, st.y, st.s); else stele(st.x, st.y, st.s, st.kind === 'star'); }
  if (dim) { ctx.fillStyle = `rgba(23,40,33,${dim})`; ctx.fillRect(0, 0, W, 790); }
  void t;
}
function panel(x, y, w, h) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); }

// ---------- A, B ----------
function sceneOpen(t) {
  A(span(t, 0, 14.2, 0.6, 0.4), () => {
    hillside(t, 0.0);
    A(seg(t, 0.8, 1.6), () => {
      font(600, 60, SERIF); text('Gammarth', CX, 120, { align: 'center', base: 'middle', color: C.ink });
      font(400, 28); text('above La Marsa, north of Tunis', CX, 172, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 2.4, 3.0) * (1 - seg(t, 9.2, 9.6)), () => {
      font(600, 30, SERIF); text(`opened 5 January ${OPENED}`, CX, 232, { align: 'center', base: 'middle', color: C.ink });
    });
    A(seg(t, 5.2, 5.8) * (1 - seg(t, 9.2, 9.6)), () => {
      font(500, 26); text('for the dead of the Tunisian campaign, Nov 1942 – May 1943', CX, 278, { align: 'center', base: 'middle', color: C.ink });
    });
    // B: who served
    A(seg(t, 9.8, 10.4), () => {
      panel(70, 210, W - 140, 300);
      font(600, 32, SERIF); text('The French army in Tunisia, 1942–43', CX, 256, { align: 'center', base: 'middle', color: C.light });
      const who = [['Tunisian', 'tirailleurs'], ['Algerian', 'tirailleurs'], ['Moroccan', 'tirailleurs'], ['European', 'French soldiers']];
      who.forEach(([a, b], i) => A(seg(t, 10.4 + i * 0.5, 10.9 + i * 0.5), () => {
        const x = 160 + i * 182, y = 400;
        ctx.fillStyle = C.lightSoft; ctx.beginPath(); ctx.arc(x, y - 58, 13, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x - 16, y - 40); ctx.lineTo(x + 16, y - 40); ctx.lineTo(x + 12, y); ctx.lineTo(x - 12, y); ctx.closePath(); ctx.fill();
        font(600, 24); text(a, x, y + 34, { align: 'center', base: 'middle', color: C.light });
        font(400, 22); text(b, x, y + 64, { align: 'center', base: 'middle', color: C.lightSoft });
      }));
    });
  });
}

// ---------- C: buried by faith ----------
function sceneFaith(t) {
  A(span(t, 14.0, 28.0, 0.4, 0.4), () => {
    hillside(t, 0.55);
    // Gammarth: non-Muslim soldiers
    A(seg(t, 14.4, 15.0), () => {
      panel(60, 110, 360, 400);
      font(600, 30, SERIF); text('Gammarth', 240, 156, { align: 'center', base: 'middle', color: C.light });
      font(400, 22); text('Christians, Jews and others', 240, 192, { align: 'center', base: 'middle', color: C.lightSoft });
      cross(122, 360, 2.6); stele(240, 360, 2.6, true); stele(358, 360, 2.6, false);
      font(400, 18); text('cross', 122, 392, { align: 'center', base: 'middle', color: C.lightSoft });
      text('Jewish stele', 240, 392, { align: 'center', base: 'middle', color: C.lightSoft });
      text('plain stele', 358, 392, { align: 'center', base: 'middle', color: C.lightSoft });
      font(400, 20); text('one emblem for each faith', 240, 460, { align: 'center', base: 'middle', color: C.lightSoft });
    });
    // Muslim soldiers: in Muslim cemeteries
    A(seg(t, 18.8, 19.4), () => {
      panel(444, 110, 360, 400);
      font(600, 30, SERIF); text('Muslim soldiers', 624, 156, { align: 'center', base: 'middle', color: C.gold });
      font(400, 22); text('buried apart, in', 624, 192, { align: 'center', base: 'middle', color: C.lightSoft });
      text('Muslim cemeteries', 624, 222, { align: 'center', base: 'middle', color: C.lightSoft });
      for (const x of [544, 624, 704]) stele(x, 360, 2.6, false);
      font(500, 24); text('Haffouz', 624, 410, { align: 'center', base: 'middle', color: C.light });
      text('Tarf ech-Chena', 624, 444, { align: 'center', base: 'middle', color: C.light });
    });
    // Enfidha
    A(seg(t, 23.6, 24.2), () => {
      panel(130, 540, W - 260, 200);
      font(600, 30, SERIF); text(`Enfidha, ${ENFIDHA_YEAR}`, CX, 590, { align: 'center', base: 'middle', color: C.light });
      font(700, 52, SERIF); text(fmt(ENFIDHA), CX - 140, 666, { align: 'center', base: 'middle', color: C.gold });
      font(400, 24); text('soldiers of Jewish,', CX + 70, 650, { align: 'center', base: 'middle', color: C.light });
      text('Christian and Muslim faith', CX + 70, 684, { align: 'center', base: 'middle', color: C.light });
    });
  });
}

// ---------- D: memorials down; graves gathered ----------
// a schematic east coast of Tunisia, for the regrouping
const LON0 = 7.6, LAT0 = 37.6, PX = 1.25;
const P = (lat, lon) => [130 + (lon - LON0) * 88 * PX, 96 + (LAT0 - lat) * 111 * PX];
const COAST = [[37.0, 8.8], [37.25, 9.5], [37.33, 9.85], [37.22, 10.1], [37.18, 10.27], [36.95, 10.2], [36.88, 10.33], [36.75, 10.3], [36.7, 10.49], [37.07, 11.03], [36.85, 11.11], [36.45, 10.74], [36.3, 10.47], [35.83, 10.64], [35.5, 11.06], [35.2, 11.15], [34.74, 10.76], [34.3, 10.2], [33.88, 10.1], [33.6, 10.4], [33.15, 11.2]];
const TOWNS = [[37.27, 9.87], [36.73, 9.18], [36.18, 8.71], [35.83, 10.64], [35.68, 10.1], [34.74, 10.76], [33.88, 10.1], [35.5, 11.06], [36.4, 10.62], [35.17, 8.83], [34.42, 8.78], [36.5, 8.78]];
const GAMMARTH = [36.92, 10.29];
function sceneRegroup(t) {
  A(span(t, 27.8, 41.8, 0.4, 0.4), () => {
    ctx.fillStyle = '#1d3129'; ctx.fillRect(0, 0, W, 790);
    // 1957: memorials taken down
    A(seg(t, 28.2, 28.8) * (1 - seg(t, 36.6, 37.0)), () => {
      font(600, 34, SERIF); text('1956: Tunisia independent', CX, 150, { align: 'center', base: 'middle', color: C.light });
      font(500, 28); text('February 1957: Tunis takes down', CX, 230, { align: 'center', base: 'middle', color: C.lightSoft });
      text('its monument to the dead of both wars', CX, 268, { align: 'center', base: 'middle', color: C.lightSoft });
      // a plain monument, lowered
      const g = eio(seg(t, 29.4, 31.4));
      ctx.save(); ctx.translate(CX, 600); ctx.rotate(g * 0.0);
      ctx.fillStyle = 'rgba(242,238,228,0.9)';
      ctx.fillRect(-90, -20 + g * 0, 180, 30); ctx.globalAlpha *= 1 - 0.75 * g; ctx.fillRect(-36, -230 * (1 - 0.0), 72, 210);
      ctx.restore();
      A(seg(t, 32.8, 33.4), () => {
        font(400, 26); text('At Ain Draham, the names were almost all', CX, 680, { align: 'center', base: 'middle', color: C.light });
        text('local Tunisians, Khroumir men of 1914–18', CX, 716, { align: 'center', base: 'middle', color: C.light });
      });
    });
    // 1966–68: graves gathered at Gammarth
    A(seg(t, 37.2, 37.8), () => {
      ctx.strokeStyle = 'rgba(246,243,234,0.6)'; ctx.lineWidth = 3;
      ctx.beginPath(); COAST.forEach(([la, lo], i) => { const [x, y] = P(la, lo); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      font(400, 20); text('schematic coast of Tunisia', 40, 760, { base: 'middle', color: C.lightSoft });
      const [gx, gy] = P(...GAMMARTH);
      const g = eio(seg(t, 38.0, 40.6));
      for (const [la, lo] of TOWNS) {
        const [x, y] = P(la, lo);
        ctx.fillStyle = C.lightSoft; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(201,154,59,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, gx, g), lerp(y, gy, g)); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(gx, gy, 12, 0, TAU); ctx.fill();
      font(600, 28, SERIF); text('Gammarth', gx + 20, gy - 18, { base: 'middle', color: C.gold });
      font(600, 34, SERIF); text('1966–68', 560, 520, { align: 'left', base: 'middle', color: C.light });
      font(400, 24); text('military graves from', 560, 562, { base: 'middle', color: C.lightSoft });
      text('town cemeteries', 560, 594, { base: 'middle', color: C.lightSoft });
      text('moved to Gammarth', 560, 626, { base: 'middle', color: C.lightSoft });
    });
  });
}

// ---------- E: the numbers ----------
function sceneNumbers(t) {
  A(span(t, 41.6, 55.6, 0.4, 0.4), () => {
    hillside(t, 0.6);
    A(seg(t, 42.0, 42.6), () => {
      panel(90, 120, W - 180, 190);
      font(700, 80, SERIF); text(fmt(GRAVES * eout(seg(t, 42.2, 43.6))), CX, 196, { align: 'center', base: 'middle', color: C.gold });
      font(400, 26); text('soldiers in individual graves: two world wars and Indochina', CX, 270, { align: 'center', base: 'middle', color: C.light });
    });
    A(seg(t, 46.6, 47.2), () => {
      panel(90, 340, W - 180, 170);
      font(700, 64, SERIF); text(fmt(UNKNOWN), CX, 404, { align: 'center', base: 'middle', color: C.light });
      font(400, 26); text('boxes of remains of unknown soldiers, in the ossuary', CX, 470, { align: 'center', base: 'middle', color: C.lightSoft });
    });
    A(seg(t, 51.2, 51.8), () => {
      panel(90, 540, W - 180, 190);
      // a simple tomb
      ctx.fillStyle = C.stone; ctx.fillRect(150, 640, 150, 40); ctx.fillRect(170, 610, 110, 34);
      font(600, 30, SERIF); text('The Unknown Soldier', 540, 600, { align: 'center', base: 'middle', color: C.light });
      font(400, 24); text('of the Tunisian campaign, moved', 540, 640, { align: 'center', base: 'middle', color: C.lightSoft });
      text('from central Tunis after independence', 540, 674, { align: 'center', base: 'middle', color: C.lightSoft });
    });
  });
}

// ---------- F: remembrance ----------
function sceneEnd(t) {
  A(span(t, 55.4, 65.0, 0.4, 0), () => {
    hillside(t, 0.15);
    // a wreath at the foot of the slope
    A(seg(t, 56.0, 56.8), () => {
      const x = CX, y = 690;
      ctx.strokeStyle = '#3f6b3f'; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(x, y - 40, 44, 0, TAU); ctx.stroke();
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; ctx.fillStyle = i % 2 ? '#b8323a' : '#e8e2d2'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 44, y - 40 + Math.sin(a) * 44, 6, 0, TAU); ctx.fill(); }
    });
    A(seg(t, 56.2, 56.8), () => {
      panel(110, 100, W - 220, 150);
      font(600, 32, SERIF); text('8 May and 11 November', CX, 150, { align: 'center', base: 'middle', color: C.light });
      font(400, 24); text('ceremonies held by the French embassy', CX, 200, { align: 'center', base: 'middle', color: C.lightSoft });
    });
    A(seg(t, 60.6, 61.2), () => {
      panel(110, 270, W - 220, 120);
      font(500, 26); text('2015: Tunisian veterans of the tirailleur', CX, 314, { align: 'center', base: 'middle', color: C.light });
      text('regiments honoured at La Marsa', CX, 350, { align: 'center', base: 'middle', color: C.light });
    });
  });
}

const CUES = [
  [0.4, 4.8, 'Gammarth, above La Marsa north of Tunis: a French military cemetery opened on *5 January 1944*.'],
  [5.0, 9.4, 'It was made for the French army’s dead of the Tunisian campaign, November 1942 to May 1943.'],
  [9.6, 14.0, 'That army included *Tunisian*, *Algerian* and *Moroccan* tirailleurs as well as Europeans.'],
  [14.2, 18.6, 'Its dead were buried by faith. Gammarth took Christian, Jewish and other non-Muslim soldiers.'],
  [18.8, 23.2, '~Muslim soldiers~ were buried apart, in Muslim cemeteries such as Haffouz and Tarf ech-Chena.'],
  [23.4, 27.8, 'At Enfidha, a smaller military cemetery from 1949 holds *235* soldiers of all three faiths.'],
  [28.0, 32.4, 'After independence in 1956, Tunis took down its monument to the dead of both wars in 1957.'],
  [32.6, 37.0, 'Such memorials named Tunisians too: at Ain Draham, nearly all were local Khroumir men.'],
  [37.2, 41.6, 'From 1966 to 1968, French military graves from town cemeteries were brought to Gammarth.'],
  [41.8, 46.2, 'Today *1,875* soldiers lie there in individual graves, from both world wars and Indochina.'],
  [46.4, 50.8, 'An ossuary holds *1,220* boxes of remains of unknown soldiers.'],
  [51.0, 55.4, 'The tomb of the Unknown Soldier of the Tunisian campaign was moved there from central Tunis.'],
  [55.6, 60.0, 'The French embassy keeps the cemetery and holds ceremonies there, on 8 May and 11 November.'],
  [60.2, 64.6, 'In 2015 an exhibition at La Marsa honoured ~Tunisian veterans~ of the tirailleur regiments.'],
];

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    ctx.fillStyle = '#172821'; ctx.fillRect(0, 0, W, H);
    sceneOpen(t);
    sceneFaith(t);
    sceneRegroup(t);
    sceneNumbers(t);
    sceneEnd(t);
    ctx.fillStyle = '#172821'; ctx.fillRect(0, 790, W, 112);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 34, weight: 500, family: SANS, ink: C.light, marks: { '*': '#e2bd6a', '~': '#9fd0b0' } });
  },
});
