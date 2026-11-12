// Explainer for economics-reburial-16-june-1989 (Hungary 1956): the reburial of Imre Nagy and his fellow martyrs on
// Heroes' Square on 16 June 1989, thirty-one years to the day after his execution; plot 301; the proclamation of the
// Republic of Hungary on 23 October 1989; 23 October as a national day. Look: dusk over a schematic Heroes' Square,
// the column and colonnades, six coffins on the steps of the Műcsarnok (one empty), candlelight, a crowd as quiet
// points, the numbered plot, the Parliament balcony. EB Garamond for headings, Outfit for labels and captions.
//
// Facts:
// - OSA Archivum, programme "Kegyetlenség és kegyelet" (Galeria Centralis): of the ten accused in the Nagy trial five
//   were executed; Losonczy Géza died in custody on 21 December 1957; Szilágyi József was tried separately and executed
//   in April 1958; Nagy, Maléter and Gimes were sentenced on Sunday 15 June 1958 and executed at dawn the next day in
//   the Gyűjtőfogház; everything in the greatest secrecy; the remains were sought and exhumed in plot 301 of the
//   Rákoskeresztúr New Public Cemetery by April 1989; reburial on 16 June 1989 of Nagy (former prime minister),
//   Maléter (former defence minister), Gimes (journalist), Szilágyi (head of Nagy's secretariat) and Losonczy (minister
//   of state); "A Hősök terén 250 ezer ember részvételével"; speakers Vásárhelyi Miklós, Rácz Sándor, Mécs Imre,
//   Király Béla, Orbán Viktor; at the cemetery the list of the executed was read out.
// - Index.hu, "25 éve temették újra Nagy Imrét" (16 June 2014): 250,000 people; the coffins on the steps of the
//   Műcsarnok, with a sixth, empty coffin as the symbol of all the dead; radio and television broadcast everything live;
//   prepared by the Committee for Historical Justice (TIB); the coffins taken to plot 301.
// - Infostart, 16 June 2020 (MTI): Orbán Viktor, a seven-minute speech: "a demokrácia és a kommunizmus
//   összeegyeztethetetlenek". GOV.UK (17 November 2011), British diplomat Greg Dorey, present among 200,000: "We heard
//   a call for Soviet troops quartered in the country to withdraw and for democratic elections to take place."
// - 444.hu (23 October 2019): at noon on 23 October 1989, from the balcony of Parliament, Speaker Szűrös Mátyás
//   proclaimed the Republic, dropping "People's Republic"; tens of thousands present.
// - Act XXVIII of 1990 (net.jogtar.hu): 23 October, the start of the 1956 revolution and freedom fight and the day the
//   Republic of Hungary was proclaimed in 1989, is a national holiday.
// Computed here: 31 years from 16 June 1958 to 16 June 1989; 33 years from 23 October 1956 to 23 October 1989.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0–18.6  16 June 1958: the executions after a secret trial; plot 301.
//  B 18.8–37.0  Exhumation; 16 June 1989: six coffins, one empty, 250,000 people.
//  C 37.2–55.4  The speeches; the burial in plot 301 with names.
//  D 55.6–64.6  23 October 1989: the Republic; 23 October a national day.
const W = 864, H = 1080, CX = W / 2;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#151a20', bg2: '#0a0d11', ink: '#f1eee8', soft: 'rgba(241,238,232,0.74)', faint: 'rgba(241,238,232,0.22)',
  candle: '#f2c879', candleSoft: 'rgba(242,200,121,0.2)', stone: '#c9c2b2', stoneDim: 'rgba(201,194,178,0.35)',
  red: '#d24b4b', green: '#4f8a5e', wood: '#3d3027', panel: 'rgba(6,8,10,0.86)',
};
const HEAD = 'EB Garamond', TXT = 'Outfit';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

const years = (a, b) => Math.round((Date.UTC(...b) - Date.UTC(...a)) / (365.25 * 864e5));
const TO_THE_DAY = years([1958, 5, 16], [1989, 5, 16]);
const REPUBLIC = years([1956, 9, 23], [1989, 9, 23]);
if (TO_THE_DAY !== 31 || REPUBLIC !== 33) throw new Error('years');
const CROWD = 250000;

function tag(s, x, y, col, { size = 21, align = 'center' } = {}) {
  font(600, size);
  const tw = ctx.measureText(s).width, pad = 12;
  const bx = align === 'center' ? x - tw / 2 - pad : align === 'left' ? x - pad : x - tw - pad;
  ctx.fillStyle = C.panel; k.rrect(bx, y - size * 0.8, tw + pad * 2, size * 1.6, 8); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  text(s, x, y + 1, { align, color: col });
}
function calendar(x, y, month, day, year, a = 1, col = C.red) {
  A(a, () => {
    ctx.fillStyle = '#ece6da'; ctx.fillRect(x - 110, y - 90, 220, 190);
    ctx.fillStyle = col; ctx.fillRect(x - 110, y - 90, 220, 44);
    font(700, 21); text(year ? `${month} ${year}` : month, x, y - 67, { align: 'center', color: '#ece6da' });
    font(700, 84, HEAD); text(String(day), x, y + 30, { align: 'center', color: '#1d1a16' });
  });
}
function candle(x, y, t, i) {
  ctx.fillStyle = '#e9e2d2'; ctx.fillRect(x - 4, y - 18, 8, 18);
  const f = 1 + 0.15 * Math.sin(t * 9 + i * 1.7);
  ctx.fillStyle = C.candle; ctx.beginPath(); ctx.ellipse(x, y - 24, 4 * f, 8 * f, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C.candleSoft; ctx.beginPath(); ctx.arc(x, y - 24, 16 * f, 0, TAU); ctx.fill();
}
/** Plot 301: rows of low mounds; `named` 0–1 adds a small marker with a name plate to each. */
function plot(x0, y0, named, a) {
  A(a, () => {
    ctx.fillStyle = 'rgba(201,194,178,0.05)'; ctx.fillRect(x0 - 20, y0 - 40, 560, 300);
    font(700, 26); text('301', x0 + 520, y0 - 16, { align: 'right', color: C.stone });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) {
      const x = x0 + c * 60, y = y0 + r * 50;
      ctx.fillStyle = '#3a3329'; ctx.beginPath(); ctx.ellipse(x + 20, y + 14, 24, 9, 0, 0, TAU); ctx.fill();
      if (named > 0) A(seg(named, (r * 9 + c) / 45 * 0.8, (r * 9 + c) / 45 * 0.8 + 0.2), () => {
        ctx.fillStyle = C.stone; ctx.fillRect(x + 17, y - 14, 6, 22); ctx.fillRect(x + 10, y - 8, 20, 5);
      });
    }
  });
}

// ---------- A: 1958 and plot 301 ----------
function scene1958(t) {
  A(span(t, 0, 18.8, 0.4, 0.4), () => {
    A(span(t, 0, 5.0, 0.4, 0.4), () => {
      font(600, 40, HEAD); text('Heroes’ Square, Budapest', 70, 96);
      font(500, 24); text('16 June 1989', 70, 138, { color: C.candle });
      for (let i = 0; i < 9; i++) A(seg(t, 0.8 + i * 0.2, 1.2 + i * 0.2), () => candle(180 + i * 64, 520, t, i));
      font(500, 24); text('a funeral 31 years late', CX, 600, { align: 'center', color: C.soft });
    });
    A(span(t, 5.0, 14.2, 0.4, 0.4), () => {
      calendar(250, 360, 'JUNE', 16, 1958, 1);
      font(600, 22); text('after a secret trial, executed:', 430, 300, { color: C.soft });
      [['Imre Nagy', 'prime minister in 1956'], ['Pál Maléter', 'defence minister'], ['Miklós Gimes', 'journalist']].forEach(([n, r], i) => {
        A(seg(t, (i ? 9.8 : 5.8) + i * 0.4, (i ? 10.4 : 6.4) + i * 0.4), () => {
          font(700, 24); text(n, 430, 352 + i * 64, { color: C.ink });
          font(500, 19); text(r, 430, 378 + i * 64, { color: C.soft });
        });
      });
    });
    A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
      plot(180, 360, 0, 1);
      font(600, 22); text('Rákoskeresztúr cemetery, Budapest', 160, 290, { color: C.soft });
      tag('buried in secret, without names', CX, 680, C.stone);
    });
  });
}

// ---------- B: exhumation and the six coffins ----------
const COFFINS = ['Imre Nagy', 'Pál Maléter', 'Miklós Gimes', 'Géza Losonczy', 'József Szilágyi', ''];
// a deterministic crowd on the square
const PEOPLE = Array.from({ length: 1100 }, (_, i) => {
  const r1 = Math.sin(i * 12.9898) * 43758.5453, r2 = Math.sin(i * 78.233) * 12345.6789;
  return [60 + (r1 - Math.floor(r1)) * 744, 560 + (r2 - Math.floor(r2)) * 200, i];
});
function square(t, a) {
  A(a, () => {
    // the Millennium column and the two colonnades, schematic
    ctx.fillStyle = C.stoneDim;
    ctx.fillRect(CX - 8, 230, 16, 210); ctx.beginPath(); ctx.arc(CX, 222, 12, 0, TAU); ctx.fill();
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) {
      const a2 = Math.PI / 2 + s * (0.35 + i * 0.12), x = CX + Math.cos(a2) * 330, y = 470 - Math.sin(a2) * 150;
      ctx.fillRect(x - 5, y - 70, 10, 70);
    }
    ctx.fillRect(110, 396, 160, 8); ctx.fillRect(594, 396, 160, 8);
    font(500, 18); text('Millennium Monument', CX, 452, { align: 'center', color: C.faint });
  });
}
function sceneCoffins(t) {
  // spring 1989: the graves opened
  A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
    plot(180, 360, 0, 1);
    for (const [c, r] of [[1, 1], [3, 1], [5, 2], [2, 3], [6, 3]]) {
      const x = 180 + c * 60, y = 360 + r * 50;
      A(seg(t, 19.4 + c * 0.1, 20.0 + c * 0.1), () => { ctx.strokeStyle = C.candle; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x + 20, y + 14, 30, 13, 0, 0, TAU); ctx.stroke(); });
    }
    tag('spring 1989: the remains found and exhumed', CX, 680, C.candle, { size: 20 });
  });
  // 16 June 1989: the coffins on the steps of the Műcsarnok
  A(span(t, 23.4, 37.4, 0.4, 0.4), () => {
    // the Műcsarnok: a portico with columns, schematic
    ctx.fillStyle = 'rgba(201,194,178,0.16)';
    ctx.beginPath(); ctx.moveTo(90, 260); ctx.lineTo(CX, 196); ctx.lineTo(774, 260); ctx.closePath(); ctx.fill();
    ctx.fillRect(90, 262, 684, 12);
    for (let i = 0; i < 8; i++) ctx.fillRect(116 + i * 88, 280, 22, 150);
    font(600, 22); text('Műcsarnok', CX, 240, { align: 'center', color: C.stone });
    // steps
    for (let i = 0; i < 3; i++) { ctx.fillStyle = `rgba(201,194,178,${0.10 + i * 0.05})`; ctx.fillRect(70 + i * 12, 430 + i * 16, 724 - i * 24, 16); }
    COFFINS.forEach((name, i) => {
      const g = eout(seg(t, 24.0 + i * 0.35, 24.7 + i * 0.35)), x = 96 + i * 116, y = 452 - (1 - g) * 20;
      A(g, () => {
        if (name) { ctx.fillStyle = C.wood; ctx.fillRect(x, y - 30, 96, 34); ctx.fillStyle = '#efe9dc'; for (let f = 0; f < 5; f++) { ctx.beginPath(); ctx.arc(x + 12 + f * 18, y - 34, 7, 0, TAU); ctx.fill(); } }
        else { ctx.strokeStyle = C.candle; ctx.lineWidth = 3; ctx.setLineDash([7, 6]); ctx.strokeRect(x, y - 30, 96, 34); ctx.setLineDash([]); }
      });
      A(seg(t, 28.2 + i * 0.3, 28.8 + i * 0.3) * (1 - seg(t, 32.4, 32.8)), () => {
        ctx.save(); ctx.translate(x + 60, y + 40); ctx.rotate(-0.55);
        font(600, 20); text(name || 'for all the dead', 0, 0, { align: 'right', color: name ? C.soft : C.candle });
        ctx.restore();
      });
    });
    // the crowd
    const fill = seg(t, 32.6, 35.4);
    for (const [x, y, i] of PEOPLE) {
      if (i / PEOPLE.length > fill) continue;
      ctx.fillStyle = 'rgba(241,238,232,0.5)'; ctx.beginPath(); ctx.arc(x, y, 2.8, 0, TAU); ctx.fill();
    }
    A(seg(t, 33.4, 34.0), () => {
      ctx.fillStyle = C.panel; k.rrect(170, 500, 524, 92, 14); ctx.fill(); ctx.strokeStyle = C.candle; ctx.lineWidth = 2; ctx.stroke();
      font(700, 24); text(`about ${fmt(CROWD)} people · broadcast live`, CX, 532, { align: 'center', color: C.candle });
      font(500, 19); text('figure from the Open Society Archives', CX, 566, { align: 'center', color: C.soft });
    });
  });
}

// ---------- C: the speeches, plot 301 ----------
function sceneSpeeches(t) {
  A(span(t, 37.2, 46.6, 0.4, 0.4), () => {
    square(t, 0.5);
    for (const [x, y, i] of PEOPLE) { ctx.fillStyle = 'rgba(241,238,232,0.3)'; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill(); void i; }
    // a microphone and the words
    const mx = 200, my = 300;
    ctx.fillStyle = C.stone; k.rrect(mx - 10, my - 30, 20, 40, 10); ctx.fill(); ctx.fillRect(mx - 2, my + 10, 4, 60);
    A(span(t, 37.4, 42.0, 0.3, 0.3), () => {
      ctx.fillStyle = C.panel; k.rrect(260, 250, 520, 130, 14); ctx.fill(); ctx.strokeStyle = C.candle; ctx.lineWidth = 2; ctx.stroke();
      font(600, 22); text('speakers call for:', 286, 284, { color: C.soft });
      font(700, 24); text('Soviet troops to leave', 286, 318, { color: C.ink }); text('free elections', 286, 350, { color: C.ink });
    });
    A(span(t, 41.8, 46.6, 0.3, 0.3), () => {
      ctx.fillStyle = C.panel; k.rrect(260, 250, 520, 130, 14); ctx.fill(); ctx.strokeStyle = C.candle; ctx.lineWidth = 2; ctx.stroke();
      font(600, 22); text('Viktor Orbán, for the young:', 286, 284, { color: C.soft });
      font(700, 23); text('“democracy and communism', 286, 318, { color: C.candle }); text('are incompatible”', 286, 350, { color: C.candle });
    });
  });
  A(span(t, 46.4, 55.8, 0.4, 0.4), () => {
    font(600, 22); text('Rákoskeresztúr cemetery, plot 301', 160, 290, { color: C.soft });
    plot(180, 360, seg(t, 47.4, 50.0), 1);
    A(seg(t, 50.4, 51.0), () => tag('buried again, with their names', CX, 680, C.candle));
    A(seg(t, 51.8, 52.4), () => {
      const L = 140, R = 724, y = 170;
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
      for (const [x, s] of [[L, '16 June 1958'], [R, '16 June 1989']]) { ctx.fillStyle = C.candle; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); font(600, 18); text(s, x, y - 22, { align: 'center', color: C.soft }); }
      font(700, 20); text(`${fmt(TO_THE_DAY)} years to the day`, CX, y + 24, { align: 'center', color: C.candle });
    });
  });
}

// ---------- D: the Republic and the national day ----------
function sceneRepublic(t) {
  A(span(t, 55.6, 60.4, 0.4, 0.4), () => {
    // Parliament, schematic: a long facade, a dome, a balcony
    ctx.fillStyle = 'rgba(201,194,178,0.22)';
    ctx.fillRect(110, 360, 644, 150); ctx.beginPath(); ctx.ellipse(CX, 360, 80, 90, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(CX - 6, 250, 12, 30);
    for (let i = 0; i < 14; i++) ctx.fillRect(126 + i * 46, 380, 12, 110);
    ctx.fillStyle = C.candle; ctx.fillRect(CX - 70, 420, 140, 10);
    person(CX, 416, 0.6);
    font(700, 24); text('23 October 1989, noon', CX, 200, { align: 'center', color: C.candle });
    A(seg(t, 56.4, 57.0), () => {
      font(600, 40, HEAD); text('Republic of Hungary', CX, 580, { align: 'center' });
      font(500, 19); text('no longer a “People’s Republic” · proclaimed by Mátyás Szűrös', CX, 624, { align: 'center', color: C.soft });
    });
  });
  A(span(t, 60.2, 65.2, 0.4, 0), () => {
    calendar(CX, 360, 'OCTOBER', 23, '', 1, C.red);
    font(700, 26); text('a national day', CX, 520, { align: 'center', color: C.candle });
    font(500, 20); text('Act XXVIII of 1990: for 1956, and for the Republic of 1989', CX, 560, { align: 'center', color: C.soft });
    A(seg(t, 61.0, 61.6), () => tag(`from 1956 to the Republic: ${fmt(REPUBLIC)} years`, CX, 640, C.stone, { size: 20 }));
  });
}
function person(x, y, s) {
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y - 30 * s, 12 * s, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 22 * s, y + 14 * s); ctx.quadraticCurveTo(x - 22 * s, y - 14 * s, x, y - 14 * s); ctx.quadraticCurveTo(x + 22 * s, y - 14 * s, x + 22 * s, y + 14 * s); ctx.closePath(); ctx.fill();
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
  [0.4, 4.8, 'Budapest, 16 June 1989: Heroes’ Square fills for a funeral held *31 years late*.'],
  [5.0, 9.4, 'On 16 June 1958, after a secret trial, *Imre Nagy*, prime minister in 1956, was executed.'],
  [9.6, 14.0, 'With him died defence minister *Pál Maléter* and journalist *Miklós Gimes*.'],
  [14.2, 18.6, 'They were buried in secret, without names, in *plot 301* of a Budapest cemetery.'],
  [18.8, 23.2, 'In the spring of 1989, as Hungary was changing, their remains were *found and exhumed*.'],
  [23.4, 27.8, '16 June 1989: six coffins lie on the steps of the Műcsarnok, the art hall on *Heroes’ Square*.'],
  [28.0, 32.4, 'Nagy, Maléter, Gimes, Géza Losonczy, József Szilágyi, and a sixth, *empty coffin*.'],
  [32.6, 37.0, 'It stood for all the dead of 1956. About *250,000 people* came, and it was broadcast live.'],
  [37.2, 41.6, 'Speakers called for the Soviet troops to leave, and for *free elections*.'],
  [41.8, 46.2, 'For the young, *Viktor Orbán* said that democracy and communism are incompatible.'],
  [46.4, 50.8, 'Then the dead were buried again in plot 301, this time *with their names*.'],
  [51.0, 55.4, 'The reburial fell on the anniversary of the executions: *31 years to the day*.'],
  [55.6, 60.0, 'On 23 October 1989 Mátyás Szűrös proclaimed the *Republic of Hungary* from Parliament.'],
  [60.2, 64.6, 'Since 1990, by law, *23 October* is a national day: for 1956, and for the Republic.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    scene1958(t);
    sceneCoffins(t);
    sceneSpeeches(t);
    sceneRepublic(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.candle } });
  },
});
