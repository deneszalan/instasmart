// Explainer for art-villa-jasmin-boughedir-moati (Tunisia 1943): Villa Jasmin (2008), Férid Boughedir's film of Serge
// Moati's novel about his father, a Jewish socialist journalist in Tunis, and what in it is history, what is family
// memory and what is the film's own telling. Look: a white villa with jasmine at dusk, then a timeline braided from
// three coloured strands, blue for history, amber for family memory, rose for the film. Fraunces for titles, Nunito
// for captions and labels.
//
// Facts:
// - Wikipedia (fr), "Villa Jasmin (téléfilm)": by Férid Boughedir, made in 2008, shown on France 3 on 30 May 2009;
//   screenplay by Luc Béraud and Serge Moati, from Moati's autobiographical novel; 85 minutes; Arnaud Giovaninetti
//   as the father, Clément Sibony as the son, Elsa Mollien as Odette. BnF catalogue: Villa Jasmin : roman, Serge
//   Moati, Fayard, 2003. Jüdische Allgemeine (Arte broadcast): the film opens at La Goulette in September 1976, the
//   son returning with his pregnant fiancée Jeanne.
// - Martial Frindéthié, Villa Jasmin (Humanities Institute film guide): the family is called Boccara in the film; the
//   father fights Resident General Peyrouton, is jailed, writes for Tunis Socialiste and Le Petit Matin; under the
//   occupation the villa is requisitioned for the German ambassador; he is arrested, taken via Naples to Berlin and
//   Sachsenhausen; Odette and their daughter wait; he is seen in a newsreel beside General de Gaulle in Paris; he
//   comes home; he dies when the boy is nine, the mother three months later.
// - USHMM oral history RG-50.030.1003, Nine Moati Cariès (30 September 2018): her father Serge Moati (born 1903),
//   Socialist journalist, editor of Tunis socialiste, expelled from Tunisia in 1935 under Resident General
//   Peyrouton; during the occupation (November 1942 to May 1943) the family lived at La Goulette and their house
//   was requisitioned; he was arrested in 1942-43 with other prominent Jews and sent to Sachsenhausen; a German
//   "thought that 'Moati' could be Italian or Corse, not Jewish"; "Apparently, Serge escaped from Sachsenhausen
//   with the help of a dentist"; "the chronology of events is difficult for her to establish"; he died in 1957,
//   aged 54, and her mother three months later; her brother Henry, born 1946, "now goes by the name of Serge".
// - USHMM Holocaust Encyclopedia, "Anti-Jewish Legislation in North Africa": Vichy race laws reached North Africa in
//   October 1940; under the German occupation Jews had to wear the yellow star, property was confiscated, men were
//   drafted for forced labour; "roughly a handful were sent to camps in occupied Poland". "Labor and Internment
//   Camps in North Africa": "roughly 5,000 Tunisian Jewish men were conscripted for forced labor".
// - National Army Museum: the Allies entered Tunis on 7 May 1943.
// No film stills: the villa and figures are drawn plainly.
//
// Scene plan (65.2 s). Captions centred at y = 846.
//  A  0.0– 9.4  The film and the novel.
//  B  9.6–18.6  The son's return in 1976; the father in 1930s Tunis.
//  C 18.8–32.4  History strand: 1940, November 1942, forced labour, 7 May 1943.
//  D 32.6–46.2  The film's arrest; family memory: Sachsenhausen, "Italian", the dentist.
//  E 46.4–60.0  The film's choices; what the family records; 1957.
//  F 60.2–65.2  Three strands.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg: '#13222a', bg2: '#1d3440', ink: '#f6f2ea', soft: 'rgba(246,242,234,0.76)', faint: 'rgba(246,242,234,0.22)',
  wall: '#f3eee2', wallShade: '#d6cdb9', jasmine: '#fffdf6', leaf: '#4f7a5a', door: '#2f6f8f',
  history: '#7cc4e0', memory: '#f2b45a', film: '#f08aa6', panel: 'rgba(14,26,32,0.9)',
};
const SERIF = 'Fraunces', SANS = 'Nunito';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- numbers ----------
const FILM = 2008, NOVEL = 2003, RETURN = 1976, DIED = 1957, FATHER_BORN = 1903, FORCED_LABOUR = 5000;
if (DIED - FATHER_BORN !== 54 || FORCED_LABOUR !== 5000 || FILM - NOVEL !== 5 || RETURN !== 1976) throw new Error('numbers');

function panel(x, y, w, h, edge = C.faint) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, 14); ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke(); }
function sky(t) {
  const g = ctx.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, C.bg); g.addColorStop(1, C.bg2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 760);
}
function jasmine(x, y, s) {
  ctx.fillStyle = C.jasmine;
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 6 * s, y + Math.sin(a) * 6 * s, 5 * s, 2.6 * s, a, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#f2d27a'; ctx.beginPath(); ctx.arc(x, y, 2 * s, 0, TAU); ctx.fill();
}
function villa(x, y, s, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.wall; ctx.fillRect(x - 200 * s, y - 230 * s, 400 * s, 230 * s);
    ctx.fillStyle = C.wallShade; ctx.fillRect(x + 180 * s, y - 230 * s, 20 * s, 230 * s);
    ctx.fillStyle = C.wall; ctx.fillRect(x - 214 * s, y - 246 * s, 428 * s, 18 * s);
    // arched door and windows, Tunisian blue
    ctx.fillStyle = C.door;
    ctx.beginPath(); ctx.moveTo(x - 40 * s, y); ctx.lineTo(x - 40 * s, y - 110 * s); ctx.arc(x, y - 110 * s, 40 * s, Math.PI, 0); ctx.lineTo(x + 40 * s, y); ctx.closePath(); ctx.fill();
    for (const dx of [-140, 100]) { ctx.beginPath(); ctx.moveTo(x + dx * s, y - 70 * s); ctx.lineTo(x + dx * s, y - 150 * s); ctx.arc(x + (dx + 20) * s, y - 150 * s, 20 * s, Math.PI, 0); ctx.lineTo(x + (dx + 40) * s, y - 70 * s); ctx.closePath(); ctx.fill(); }
    // jasmine climbing on the left
    ctx.strokeStyle = C.leaf; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(x - 190 * s, y); ctx.bezierCurveTo(x - 230 * s, y - 120 * s, x - 150 * s, y - 180 * s, x - 190 * s, y - 250 * s); ctx.stroke();
    for (let i = 0; i < 16; i++) { const u = i / 15; jasmine(x - 200 * s + Math.sin(u * 9) * 26 * s, y - u * 240 * s, s * 1.1); }
  });
}
function person(x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y - 36 * s, 10 * s, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 14 * s, y); ctx.quadraticCurveTo(x - 15 * s, y - 26 * s, x, y - 26 * s); ctx.quadraticCurveTo(x + 15 * s, y - 26 * s, x + 14 * s, y); ctx.closePath(); ctx.fill();
}
/** A film-strip frame with a coloured edge: the strand a fact belongs to. */
function frame(x, y, w, h, color, lines, a = 1) {
  A(a, () => {
    ctx.fillStyle = '#0b1418'; k.rrect(x, y, w, h, 10); ctx.fill();
    ctx.fillStyle = 'rgba(246,242,234,0.12)';
    for (let i = 0; i < Math.floor(w / 26); i++) { ctx.fillRect(x + 10 + i * 26, y + 6, 12, 8); ctx.fillRect(x + 10 + i * 26, y + h - 14, 12, 8); }
    ctx.strokeStyle = color; ctx.lineWidth = 4; k.rrect(x, y, w, h, 10); ctx.stroke();
    lines.forEach(([s, sz, col, wt], i) => { font(wt || 600, sz, i === 0 ? SERIF : SANS); text(s, x + 22, y + 44 + i * 36, { align: 'left', color: col || C.ink }); });
  });
}
function tag(x, y, label, color) {
  font(800, 22, SANS); const w = ctx.measureText(label).width + 28;
  ctx.fillStyle = color; k.rrect(x, y - 17, w, 34, 17); ctx.fill();
  text(label, x + 14, y + 1, { align: 'left', color: '#13222a' });
  return w;
}

// ---------- A, B ----------
function sceneOpen(t) {
  const a = span(t, 0, 18.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    sky(t);
    ctx.fillStyle = '#25392f'; ctx.fillRect(0, 640, W, 120);
    villa(CX + 120, 640, 1.0);
    A(seg(t, 0.6, 1.2) * (1 - seg(t, 9.0, 9.6)), () => {
      font(700, 60, SERIF); text('Villa Jasmin', 48, 150, { align: 'left', color: C.ink });
      font(600, 26, SANS); text('a film by Férid Boughedir, 2008', 52, 204, { align: 'left', color: C.film });
      A(seg(t, 5.0, 5.6), () => { text('from Serge Moati’s novel, 2003', 52, 242, { align: 'left', color: C.memory }); text('about his father, also Serge', 52, 280, { align: 'left', color: C.soft }); });
    });
    // the son's return, 1976, and the father in the 1930s
    A(seg(t, 9.8, 10.4) * (1 - seg(t, 14.0, 14.4)), () => {
      person(150, 690, 1.5, C.film); person(205, 690, 1.35, 'rgba(240,138,166,0.75)');
      frame(48, 110, 470, 150, C.film, [['1976: a son comes back', 34, C.ink], ['to Tunis, to find his parents’ past', 24, C.soft, 500], ['in the film', 22, C.film, 700]]);
    });
    A(seg(t, 14.4, 15.0), () => {
      person(150, 690, 1.6, C.memory);
      frame(48, 110, 520, 186, C.memory, [['The father, 1930s Tunis', 34, C.ink], ['Jewish, socialist, a journalist', 24, C.soft, 500], ['expelled by the Resident General,', 24, C.soft, 500], ['1935', 24, C.memory, 700]]);
    });
  });
}

// ---------- C: the history strand ----------
const EVENTS = [
  { t0: 19.0, year: 'October 1940', l1: 'Vichy’s anti-Jewish laws', l2: 'reach North Africa' },
  { t0: 23.6, year: 'November 1942', l1: 'German troops occupy Tunis', l2: '' },
  { t0: 28.2, year: '1942–43', l1: 'About 5,000 Jewish men in', l2: 'forced labour (USHMM estimate)' },
  { t0: 30.4, year: '7 May 1943', l1: 'The Allies enter Tunis', l2: '' },
];
function sceneHistory(t) {
  const a = span(t, 18.6, 32.6, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    sky(t);
    const tw = tag(48, 130, 'HISTORY', C.history);
    font(500, 24, SANS); text('documented by historians', Math.max(200, 48 + tw + 14), 131, { align: 'left', color: C.soft });
    // a strand: a blue line down the left, frames to its right
    const f = eio(seg(t, 18.8, 31.2));
    ctx.strokeStyle = C.history; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(90, 180); ctx.lineTo(90, lerp(180, 720, f)); ctx.stroke();
    EVENTS.forEach((e, i) => {
      const y = 190 + i * 132;
      A(seg(t, e.t0, e.t0 + 0.6), () => {
        ctx.fillStyle = C.history; ctx.beginPath(); ctx.arc(90, y + 50, 11, 0, TAU); ctx.fill();
        frame(130, y, 690, 112, C.history, [[e.year, 30, C.history], [e.l1 + (e.l2 ? ' ' + e.l2 : ''), 24, C.ink, 500]]);
      });
    });
  });
}

// ---------- D: arrest and deportation: film and family memory ----------
function sceneMemory(t) {
  const a = span(t, 32.4, 46.4, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    sky(t);
    // the film: the villa taken, the father arrested
    A(seg(t, 32.6, 33.2) * (1 - seg(t, 36.6, 37.0)), () => {
      villa(CX, 600, 0.9);
      ctx.fillStyle = 'rgba(19,34,42,0.55)'; ctx.fillRect(0, 0, W, 760);
      tag(48, 130, 'IN THE FILM', C.film);
      frame(48, 170, 600, 150, C.film, [['The villa is requisitioned', 32, C.ink], ['for the German envoy, and', 24, C.soft, 500], ['the father is arrested', 24, C.soft, 500]]);
    });
    // family memory
    A(seg(t, 37.2, 37.8), () => {
      const tw = tag(48, 130, 'FAMILY MEMORY', C.memory);
      font(500, 24, SANS); text('the Moati family’s account', Math.max(270, 48 + tw + 14), 131, { align: 'left', color: C.soft });
      frame(48, 180, 768, 130, C.memory, [['Deported to Sachsenhausen', 32, C.ink], ['the camp near Berlin, says the family', 24, C.soft, 500]]);
      A(seg(t, 41.8, 42.4), () => frame(48, 330, 768, 160, C.memory, [['“Moati”: Italian or Corsican?', 32, C.ink], ['a German took the name for a non-Jewish one,', 24, C.soft, 500], ['his daughter Nine Moati recalled in 2018', 24, C.soft, 500]]));
      A(seg(t, 44.0, 44.6), () => frame(48, 510, 768, 130, C.memory, [['“Apparently” helped out by a dentist', 30, C.ink], ['she could not say exactly when or how', 24, C.soft, 500]]));
    });
  });
}

// ---------- E: the film's choices; 1957 ----------
function newsreel(x, y, s) {
  ctx.fillStyle = '#d8d2c4'; ctx.fillRect(x - 150 * s, y - 100 * s, 300 * s, 200 * s);
  ctx.fillStyle = '#6d6a62';
  person(x - 50 * s, y + 80 * s, 2.0 * s, '#6d6a62'); person(x + 50 * s, y + 80 * s, 2.4 * s, '#55524b');
  ctx.strokeStyle = '#13222a'; ctx.lineWidth = 6 * s; ctx.strokeRect(x - 150 * s, y - 100 * s, 300 * s, 200 * s);
}
function sceneChoices(t) {
  const a = span(t, 46.2, 60.2, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    sky(t);
    A(seg(t, 46.4, 47.0) * (1 - seg(t, 50.6, 51.0)), () => {
      tag(48, 130, 'THE FILM’S TELLING', C.film);
      frame(48, 180, 768, 130, C.film, [['The family becomes “Boccara”', 32, C.ink], ['names changed, events condensed', 24, C.soft, 500]]);
      A(seg(t, 48.6, 49.2), () => {
        newsreel(300, 520, 1.0);
        font(600, 26, SANS); text('a scene: the father glimpsed', 480, 480, { align: 'left', color: C.ink });
        text('in a Paris newsreel', 480, 516, { align: 'left', color: C.ink });
      });
    });
    A(seg(t, 51.0, 51.6) * (1 - seg(t, 55.2, 55.6)), () => {
      tag(48, 130, 'FAMILY MEMORY', C.memory);
      frame(48, 180, 768, 160, C.memory, [['Home again, cheered by crowds,', 32, C.ink], ['he did not recognise his little daughter,', 24, C.soft, 500], ['Nine Moati remembered', 24, C.soft, 500]]);
      person(380, 640, 2.2, C.memory); person(470, 640, 1.2, 'rgba(242,180,90,0.75)');
    });
    A(seg(t, 55.6, 56.2), () => {
      tag(48, 130, 'FAMILY MEMORY', C.memory);
      frame(48, 180, 768, 196, C.memory, [['1957', 40, C.memory], ['Serge Moati the father dies at 54;', 26, C.ink, 500], ['his wife Odette three months later', 26, C.ink, 500]]);
      A(seg(t, 57.4, 58.0), () => frame(48, 400, 768, 130, C.memory, [['Their son Henry, born 1946,', 30, C.ink], ['later takes his father’s name: Serge', 26, C.soft, 500]]));
    });
  });
}

// ---------- F: three strands ----------
function sceneEnd(t) {
  const a = span(t, 60.0, 65.2, 0.5, 0);
  if (a <= 0) return;
  A(a, () => {
    sky(t);
    villa(CX, 700, 0.75, 0.5);
    const cols = [[C.history, 'HISTORY'], [C.memory, 'FAMILY MEMORY'], [C.film, 'THE FILM']];
    cols.forEach(([col, name], i) => {
      const x = 150 + i * 280, f = eio(seg(t, 60.4 + i * 0.3, 62.4 + i * 0.3));
      ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let j = 0; j <= 40; j++) { const u = j / 40; if (u > f) break; const y = 180 + u * 380, xx = x + Math.sin(u * 7 + i * 2.1) * 90 * u; j ? ctx.lineTo(xx, y) : ctx.moveTo(xx, y); }
      ctx.stroke(); ctx.lineCap = 'butt';
      font(800, 24, SANS); text(name, x, 150, { align: 'center', color: col });
    });
  });
}

const CUES = [
  [0.4, 4.8, '^Villa Jasmin^ (2008): a film by the Tunisian director Férid Boughedir, set in Tunis.'],
  [5.0, 9.4, 'It adapts a 2003 novel by the French journalist *Serge Moati* about his father, also Serge.'],
  [9.6, 14.0, '^In the film^, a son comes back to Tunis in 1976 to find his long-dead parents’ past.'],
  [14.2, 18.6, 'His father: a Jewish socialist journalist in 1930s Tunis, in conflict with the French rulers.'],
  [18.8, 23.2, '~History~: in October 1940, Vichy France’s anti-Jewish laws reach Tunisia, its protectorate.'],
  [23.4, 27.8, '~History~: in November 1942 German troops occupy Tunis. They hold it until May 1943.'],
  [28.0, 32.4, 'About 5,000 Jewish men are sent to forced labour; the Allies enter Tunis on 7 May 1943.'],
  [32.6, 37.0, '^In the film^, the family villa is taken for the German envoy, and the father is arrested.'],
  [37.2, 41.6, '*Family memory*: the real Serge Moati was deported to Sachsenhausen, near Berlin.'],
  [41.8, 46.2, 'His daughter, Nine Moati, recalled that a German took “Moati” for an Italian name.'],
  [46.4, 50.8, '^The film’s choices^: the family is renamed, and the father reappears in a Paris newsreel.'],
  [51.0, 55.4, '*Family memory*: home again, cheered by crowds, he did not know his little daughter.'],
  [55.6, 60.0, 'He died in 1957, his wife three months later. Their son Henry later took the name Serge.'],
  [60.2, 64.6, 'So ^Villa Jasmin^ braids three strands: ~history~, *a family’s memory*, ^a film’s choices^.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    ctx.fillStyle = '#0e1a20'; ctx.fillRect(0, 0, W, H);
    sceneOpen(t); sceneHistory(t); sceneMemory(t); sceneChoices(t); sceneEnd(t);
    const g = ctx.createLinearGradient(0, 740, 0, H); g.addColorStop(0, 'rgba(14,26,32,0)'); g.addColorStop(0.2, '#0e1a20'); g.addColorStop(1, '#0a1317');
    ctx.fillStyle = g; ctx.fillRect(0, 740, W, H - 740);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 36, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.memory, '~': C.history, '^': C.film } });
  },
});
