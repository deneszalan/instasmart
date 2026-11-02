// Explainer for art-wedding-song-albou-tunis-1942 (Tunisia 1943): Le Chant des mariées (The Wedding Song, 2008), a
// film by Karin Albou about two 16-year-old girls in Tunis under the German occupation, one Muslim, one Jewish. The
// girls and their story are invented; the orders that shape their lives are history. Look: a film strip on warm
// black, with a teal-and-cream tile band; two tracks, THE FILM (invented) above and HISTORY (dated) below, joined by
// threads where a scene echoes a real order. People are simple figures; no film stills are used. Fraunces for titles,
// Fira Sans for captions and labels.
//
// Facts:
// - Torino Film Festival (26th edition, 2008), "Le Chant des mariées": France, 2008, 100 minutes; Tunis, 1942, two
//   16-year-old friends, Nour and Myriam, in a poor neighbourhood where Jews and Muslims live side by side; after the
//   Nazi army enters Tunis and anti-Jewish laws take effect, Myriam's mother Tita, barred from working, arranges her
//   marriage to a wealthy doctor; Karin Albou (born 1968) wrote and directed it and plays Tita.
// - Africultures: released in France on 17 December 2008; languages French, Arabic and German; produced by Gloria
//   Films with France 3 Cinéma and Cinétéfilms.
// - Hommes & migrations no. 1277 (A. Videau, 2009): a Franco-Tunisian film; Nour (Olympe Borval), Muslim, and Myriam
//   (Lizzie Brocheré), Jewish, both 16; Khaled (Najib Oudghiri); Raoul (Simon Abkarian), a rich doctor; the hammam and
//   the wedding preparations; Khaled may become "indic pour les nazis".
// - The Christian Science Monitor (P. Rainer, 13 November 2009): the wedding is arranged because "money is needed to
//   pay the huge fine newly levied on Jewish residents"; "The Nazis, claiming solidarity with the Muslims, scatter
//   scurrilous leaflets about the Jews"; Khaled takes up with the Nazis and forbids Nour to see Myriam; the doctor is
//   taken to a quarry.
// - FRUS 1943 vol. II, doc. 258 (North African Economic Board, 15 June 1943): on 6 December 1942 the Germans demanded
//   2,000 Jewish workers, then 1,000 more; from 9 December a "reign of terror"; about 4,000 workers supplied, sent
//   to sites under frequent Allied air attack; on 22 December 1942 a levy of 20,000,000 francs on the Jewish
//   community, said to "pay" for Anglo-American bombing of non-Jewish property.
// - USHMM, "Hajj Amin al-Husayni: Wartime Propagandist": he broadcast anti-Allied and anti-Jewish propaganda by
//   radio to the Arab world. USHMM, "Anti-Jewish Legislation in North Africa": German occupation of Tunisia after the
//   Allied landings; forced labour, confiscations, the yellow star.
// - Kapitalis (December 2017): the film was screened at the Institut français de Tunisie, with Karin Albou present,
//   for the 75th anniversary of the roundup of Tunis's Jews by the SS on 9 December 1942.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  The film; the two girls in a Tunis courtyard.
//  B  9.6–18.6  Invented: the girls, Khaled, Raoul.
//  C 18.8–41.6  History: November 1942; forced labour; the levy; the threads to the film's scenes.
//  D 41.8–55.4  Propaganda; the friendship strained; bombs and May 1943.
//  E 55.6–64.6  Albou plays Tita; Tunis, 2017.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#1e1612', bg2: '#0f0b09', ink: '#f7eedf', soft: 'rgba(247,238,223,0.74)', faint: 'rgba(247,238,223,0.22)',
  amber: '#e7a84a', teal: '#3f9c94', tealDim: 'rgba(63,156,148,0.35)', cream: '#efe1c4', rose: '#d8846a', red: '#d0563f', panel: 'rgba(12,9,7,0.85)',
};
const TITLE = 'Fraunces', SANS = 'Fira Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the dates ----------
const D = (y, m, d) => Date.UTC(y, m - 1, d);
const T0 = D(1942, 11, 1), T1 = D(1943, 5, 31);
const LEVY_FRANCS = 20e6, WORKERS = 4000, DEMANDED = 2000;
const HISTORY = [
  { key: 'arrive', at: D(1942, 11, 9), label: 'German troops in Tunis', when: 'Nov 1942' },
  { key: 'labour', at: D(1942, 12, 6), label: 'Jewish men to forced labour', when: '6–9 Dec 1942' },
  { key: 'levy', at: D(1942, 12, 22), label: '20 million francs levied', when: '22 Dec 1942' },
  { key: 'end', at: D(1943, 5, 10), label: 'the Axis surrenders', when: 'May 1943' },
];
if (LEVY_FRANCS !== 20000000 || WORKERS / DEMANDED !== 2) throw new Error('numbers');
const TX = (ms) => 90 + ((ms - T0) / (T1 - T0)) * 684;

/** A simple figure; `scarf` draws a head covering, as Nour wears in public in the film. */
function girl(x, y, s, col, scarf) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 112 * s, 20 * s, 0, TAU); ctx.fill();
  if (scarf) { ctx.beginPath(); ctx.arc(x, y - 114 * s, 25 * s, Math.PI * 0.9, Math.PI * 2.1); ctx.lineTo(x + 27 * s, y - 80 * s); ctx.lineTo(x - 27 * s, y - 80 * s); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.ellipse(x, y - 122 * s, 24 * s, 16 * s, 0, Math.PI, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(x - 20 * s, y - 88 * s); ctx.lineTo(x + 20 * s, y - 88 * s); ctx.lineTo(x + 46 * s, y); ctx.lineTo(x - 46 * s, y); ctx.closePath(); ctx.fill();
}
function man(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 116 * s, 20 * s, 0, TAU); ctx.fill();
  ctx.fillRect(x - 28 * s, y - 92 * s, 56 * s, 92 * s);
}

/** A film frame: a rounded card with sprocket holes above and below. */
function frame(x, y, w, h, fill = 'rgba(247,238,223,0.06)') {
  ctx.fillStyle = '#060504'; k.rrect(x - 10, y - 26, w + 20, h + 52, 8); ctx.fill();
  ctx.fillStyle = 'rgba(247,238,223,0.75)';
  for (let sx = x + 6; sx < x + w - 6; sx += 26) { ctx.fillRect(sx, y - 19, 12, 10); ctx.fillRect(sx, y + h + 9, 12, 10); }
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
}

/** Tile band: interlocking teal and cream diamonds, as on Tunis walls. */
function tiles(y, a = 1) {
  A(a, () => {
    for (let x = 0; x < W; x += 36) {
      ctx.fillStyle = (x / 36) % 2 ? C.tealDim : 'rgba(239,225,196,0.18)';
      ctx.beginPath(); ctx.moveTo(x + 18, y - 14); ctx.lineTo(x + 36, y); ctx.lineTo(x + 18, y + 14); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
    }
  });
}

// ---------- A: the film, the girls ----------
function sceneOpen(t) {
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    font(700, 52, TITLE); text('Le Chant des mariées', CX, 140, { align: 'center', color: C.amber });
    font(500, 26); text('The Wedding Song · Karin Albou · 2008', CX, 190, { align: 'center', color: C.soft });
    frame(130, 270, 604, 400);
    // a courtyard: an arch and tiles
    ctx.strokeStyle = C.tealDim; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(300, 670); ctx.lineTo(300, 420); ctx.arc(CX, 420, 132, Math.PI, 0); ctx.lineTo(564, 670); ctx.stroke();
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? C.tealDim : 'rgba(239,225,196,0.14)'; ctx.fillRect(130 + i * 37.75, 640, 37.75, 30); }
    const g = eout(seg(t, 1.0, 2.4));
    girl(lerp(250, 360, g), 630, 1.3, C.cream, true);
    girl(lerp(614, 504, g), 630, 1.3, C.rose, false);
    A(seg(t, 5.4, 6.2), () => {
      font(700, 27); text('Nour', 360, 712, { align: 'center', color: C.cream });
      text('Myriam', 504, 712, { align: 'center', color: C.rose });
      font(500, 21); text('Muslim, 16', 360, 740, { align: 'center', color: C.soft });
      text('Jewish, 16', 504, 740, { align: 'center', color: C.soft });
      font(600, 25); text('Tunis, 1942', CX, 300, { align: 'center', color: C.amber });
    });
  });
}

// ---------- B: invented ----------
function sceneInvented(t) {
  A(span(t, 9.4, 18.8, 0.4, 0.4), () => {
    font(700, 40, TITLE); text('INVENTED', CX, 140, { align: 'center', color: C.amber });
    font(500, 24); text('the characters and their story', CX, 186, { align: 'center', color: C.soft });
    const cast = [['Nour', 'a Muslim girl', C.cream, 'g1'], ['Myriam', 'a Jewish girl', C.rose, 'g0'], ['Khaled', 'Nour’s fiancé', C.cream, 'm'], ['Raoul', 'a rich, older doctor', C.rose, 'm']];
    cast.forEach(([n, d, col, kind], i) => A(seg(t, 9.8 + i * 0.5, 10.4 + i * 0.5), () => {
      const x = 162 + i * 180, y = 480;
      frame(x - 70, 270, 140, 240);
      if (kind === 'm') man(x, y, 1.15, col); else girl(x, y, 1.15, col, kind === 'g1');
      font(700, 26); text(n, x, 580, { align: 'center', color: col });
      font(500, 21); text(d, x, 614, { align: 'center', color: C.soft });
    }));
    A(seg(t, 14.4, 15.0), () => {
      font(500, 23); text('played by Olympe Borval, Lizzie Brocheré,', CX, 690, { align: 'center', color: C.soft });
      text('Najib Oudghiri and Simon Abkarian', CX, 720, { align: 'center', color: C.soft });
    });
  });
}

// ---------- the two tracks ----------
const FILM = [
  { key: 'levy', label: 'a marriage to pay the fine', t0: 32.6 },
  { key: 'labour', label: 'Raoul in forced labour', t0: 37.2 },
];
function tracks(t, a) {
  A(a, () => {
    // the history axis, November 1942 to May 1943
    const y = 560;
    ctx.fillStyle = 'rgba(208,86,63,0.16)'; ctx.fillRect(TX(D(1942, 11, 9)), y - 16, TX(D(1943, 5, 10)) - TX(D(1942, 11, 9)), 32);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(90, y); ctx.lineTo(774, y); ctx.stroke();
    for (let m = 0; m <= 7; m++) {
      const ms = D(1942, 11 + m, 1), x = TX(ms);
      ctx.fillStyle = C.ink; ctx.fillRect(x - 1, y - 8, 2, 16);
      if (m < 7) { font(500, 20); text(['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'][m], x + (TX(D(1942, 12 + m, 1)) - x) / 2, y - 32, { align: 'center', color: C.soft }); }
    }
    font(700, 22); text('HISTORY', 90, y - 70, { color: C.red, spacing: '3px' });
    text('THE FILM · INVENTED', 90, 270, { color: C.amber, spacing: '3px' });
    ctx.strokeStyle = 'rgba(231,168,74,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(90, 300); ctx.lineTo(774, 300); ctx.stroke(); ctx.setLineDash([]);
  });
}
/** A dated event: a dot on the axis, and a label box below it at x `bx`, joined by a leader line. */
function historyMark(t, ev, t0, bx, lines) {
  const a = seg(t, t0, t0 + 0.6);
  if (a <= 0) return;
  A(a, () => {
    const x = TX(ev.at), y = 560, by = 676;
    ctx.strokeStyle = 'rgba(208,86,63,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(bx, by - 40); ctx.stroke();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
    ctx.fillStyle = C.panel; k.rrect(bx - 92, by - 40, 184, 104, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(208,86,63,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    font(700, 21); text(ev.when, bx, by - 18, { align: 'center', color: C.red });
    font(500, 21); lines.forEach((s, i) => text(s, bx, by + 12 + i * 26, { align: 'center', color: C.ink }));
  });
}
function filmCard(t, f, x, a) {
  A(a, () => {
    const y = 360, w = 250, h = 70;
    frame(x - w / 2, y, w, h, 'rgba(231,168,74,0.14)');
    font(600, 21); text(f.label, x, y + h / 2, { align: 'center', color: C.amber });
  });
}
function thread(x1, y1, x2, y2, g) {
  if (g <= 0) return;
  ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, g), lerp(y1, y2, g)); ctx.stroke(); ctx.setLineDash([]);
}

// ---------- C: history and the threads ----------
function sceneHistory(t) {
  A(span(t, 18.6, 55.6, 0.4, 0.4), () => {
    tracks(t, 1);
    historyMark(t, HISTORY[0], 19.0, 152, ['German troops', 'in Tunis']);
    historyMark(t, HISTORY[1], 23.6, 346, [`${DEMANDED.toLocaleString('en-US')} demanded,`, `about ${WORKERS.toLocaleString('en-US')} sent`]);
    historyMark(t, HISTORY[2], 28.2, 540, ['20 million francs', 'levied on Jews']);
    A(seg(t, 28.8, 29.4) * (1 - seg(t, 32.2, 32.6)), () => {
      font(500, 21); text('“to pay” for Allied bombing, said the Germans', 540, 762, { align: 'center', color: C.soft });
    });
    // the film's scenes, joined to the real orders they echo
    const lx = TX(HISTORY[2].at), bx = TX(HISTORY[1].at);
    filmCard(t, FILM[0], 560, seg(t, 32.8, 33.4));
    thread(560, 466, lx, 548, eio(seg(t, 33.6, 34.8)));
    filmCard(t, FILM[1], 230, seg(t, 37.4, 38.0));
    thread(230, 466, bx, 548, eio(seg(t, 38.2, 39.4)));
  });
}

// ---------- D: propaganda, strain, bombs, May 1943 ----------
function sceneLater(t) {
  // cue 10: propaganda (a leaflet and a radio), drawn over the tracks
  A(span(t, 41.8, 46.4, 0.4, 0.4), () => {
    ctx.fillStyle = C.panel; ctx.fillRect(60, 230, W - 120, 540);
    frame(130, 300, 260, 300, 'rgba(239,225,196,0.85)');
    ctx.fillStyle = 'rgba(30,22,18,0.55)';
    for (let i = 0; i < 9; i++) ctx.fillRect(150, 330 + i * 28, 220 * (i % 3 === 2 ? 0.6 : 1), 10);
    // a radio
    ctx.fillStyle = '#5b4434'; k.rrect(480, 380, 230, 160, 18); ctx.fill();
    ctx.fillStyle = 'rgba(239,225,196,0.6)'; ctx.beginPath(); ctx.arc(550, 460, 46, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5b4434'; for (let i = -2; i <= 2; i++) ctx.fillRect(520, 456 + i * 14, 60, 4);
    for (let i = 0; i < 3; i++) { const r = 30 + i * 24 + ((t * 30) % 24); ctx.strokeStyle = `rgba(231,168,74,${0.5 - i * 0.15})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(690, 400, r, -1.0, -0.2); ctx.stroke(); }
    font(600, 23); text('leaflets in the film', 260, 660, { align: 'center', color: C.amber });
    text('Nazi radio in Arabic, in history', 595, 660, { align: 'center', color: C.red });
  });
  // cue 11: the friendship strained (the two girls drift apart)
  A(span(t, 46.4, 51.0, 0.4, 0.4), () => {
    ctx.fillStyle = C.panel; ctx.fillRect(60, 230, W - 120, 540);
    const g = eio(seg(t, 46.8, 49.0));
    girl(lerp(380, 250, g), 620, 1.4, C.cream, true);
    girl(lerp(484, 614, g), 620, 1.4, C.rose, false);
    man(lerp(380, 250, g) - 130, 620, 1.3, 'rgba(247,238,223,0.45)');
    font(600, 25); text('Khaled forbids Nour to see Myriam', CX, 700, { align: 'center', color: C.amber });
  });
  // cue 12: bombs and May 1943, back on the tracks
  A(span(t, 51.0, 55.6, 0.4, 0.4), () => {
    historyMark(t, HISTORY[3], 51.4, 744, ['the Axis', 'surrenders']);
    // the raids as a band over the occupation (no dates are drawn: the sources give none)
    A(seg(t, 51.4, 52.2), () => {
      const x0 = TX(D(1942, 11, 15)), x1 = TX(D(1943, 5, 7)), y = 594;
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y - 12, (x1 - x0) * eio(seg(t, 51.4, 52.6)), 24); ctx.clip();
      ctx.strokeStyle = 'rgba(208,86,63,0.7)'; ctx.lineWidth = 3;
      for (let x = x0 - 24; x < x1; x += 14) { ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.lineTo(x + 24, y - 12); ctx.stroke(); }
      ctx.restore();
      font(500, 21); text('Allied air raids on Tunis', 420, 624, { align: 'center', color: C.soft });
    });
  });
}

// ---------- E: Albou; Tunis, 2017 ----------
function sceneEnd(t) {
  A(span(t, 55.4, 65.2, 0.4, 0), () => {
    // cue 13: Karin Albou wrote, directed and plays Tita
    A(span(t, 55.4, 60.2, 0.4, 0.4), () => {
      frame(232, 270, 400, 320);
      girl(CX, 560, 1.6, C.rose, false);
      font(700, 30, TITLE); text('Karin Albou', CX, 150, { align: 'center', color: C.amber });
      font(500, 23); text('writer and director, born 1968', CX, 194, { align: 'center', color: C.soft });
      font(600, 25); text('plays Tita, Myriam’s mother', CX, 660, { align: 'center', color: C.ink });
    });
    // cue 14: Tunis, December 2017
    A(seg(t, 60.0, 60.6), () => {
      font(700, 44, TITLE); text('Tunis, December 2017', CX, 150, { align: 'center', color: C.amber });
      frame(132, 270, 600, 330, 'rgba(231,168,74,0.12)');
      // a screen and rows of seats
      ctx.fillStyle = 'rgba(247,238,223,0.85)'; ctx.fillRect(220, 300, 424, 170);
      font(700, 30, TITLE); text('Le Chant des mariées', CX, 385, { align: 'center', color: '#2a1f18' });
      ctx.fillStyle = 'rgba(247,238,223,0.35)';
      for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(180 + i * 46 + (r % 2) * 20, 510 + r * 30, 11, Math.PI, TAU); ctx.fill(); }
      font(500, 23); text('75 years after the roundup of 9 December 1942', CX, 670, { align: 'center', color: C.ink });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(CX, 420, 40, CX, 460, 720); rg.addColorStop(0, C.bg1); rg.addColorStop(1, C.bg2);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
}

const CUES = [
  [0.4, 4.8, '*The Wedding Song* (Le Chant des mariées) is a 2008 film by the director *Karin Albou*.'],
  [5.0, 9.4, 'Tunis, 1942: Nour, a Muslim girl, and Myriam, a Jewish girl, are 16 and best friends.'],
  [9.6, 14.0, 'They are ~invented~, like Khaled, Nour’s fiancé, and Raoul, the rich doctor Myriam must marry.'],
  [14.2, 18.6, 'But the orders that shape their lives are history, and the film draws on them.'],
  [18.8, 23.2, 'In November 1942, *German troops* arrived in Tunis and stayed for six months.'],
  [23.4, 27.8, 'On 6 December they demanded 2,000 Jewish men for *forced labour*; about 4,000 were sent.'],
  [28.0, 32.4, 'On 22 December they levied *20 million francs* on Tunis’s Jews, blaming Allied bombing.'],
  [32.6, 37.0, 'In the film, Myriam’s mother marries her off because money is needed ~to pay the fine~.'],
  [37.2, 41.6, 'And Raoul ends up in ~forced labour~: the film puts real orders into invented lives.'],
  [41.8, 46.2, 'German leaflets in the film court Muslims and blame Jews, as Nazi radio did in Arabic.'],
  [46.4, 50.8, 'The friendship strains: Khaled works for the Germans and forbids Nour to see Myriam.'],
  [51.0, 55.4, 'Allied bombs fall on Tunis; the occupation ends when the Axis surrenders in May 1943.'],
  [55.6, 60.0, 'Karin Albou wrote and directed the film, and plays *Tita*, Myriam’s mother.'],
  [60.2, 64.6, 'In 2017 it was shown in Tunis to mark *75 years* since the roundup of 9 December 1942.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    tiles(40);
    tiles(790);
    sceneOpen(t);
    sceneInvented(t);
    sceneHistory(t);
    sceneLater(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 862, maxW: 800, size: 38, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.amber, '~': C.red } });
  },
});
