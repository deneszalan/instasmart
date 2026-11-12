// Explainer for history-rajk-show-trial-1949 (Hungary 1956): the show trial of László Rajk, Communist and former
// interior minister, in Budapest in September 1949. He was charged with spying and with a plot with Yugoslavia's
// Tito, confessed to everything on a script written in advance, and was hanged on 15 October 1949 with Tibor Szőnyi
// and András Szalai; in March 1956 the regime admitted the charges were fabricated, and on 6 October 1956 he was
// reburied. Look: a typed police file on paper over a dark office, a red stamp, a court drawn as plain shapes, a
// radio microphone; no violence shown. IBM Plex Mono for the typed file and labels, Source Sans 3 for the captions.
//
// Facts:
// - Columbia Encyclopedia (6th ed., via Encyclopedia.com), "Rajk, László": 1909–49; fought in the Spanish Civil War;
//   returned to Hungary in 1941 and became first secretary of the illegal Communist party; after the war minister
//   of the interior, in 1948 foreign minister; accused of conspiring with Tito to overthrow the government; tried,
//   confessed and executed; in March 1956 the government declared his trial had been "in error".
// - Wikipedia, "László Rajk" (a start only): Interior Minister 20 March 1946 – 5 August 1948.
// - hvg.hu, "A Rajk-per fővádlottjait 60 éve végezték ki" (13 October 2009): the show trial began in Budapest on
//   16 September 1949 and was broadcast on the radio; the verdict was announced on 24 September, death for the main
//   defendants; Rajk (former party leader, interior then foreign minister), Szőnyi Tibor (head of the party's
//   cadre department) and Szalai András; first charged with spying (for the Horthy gendarmerie, then US and British
//   intelligence), then also Trotskyism, serving Tito, a plot to murder Rákosi and preparing a bourgeois
//   restoration; investigation taken over by Rákosi and General Belkin from Moscow; Rajk, Szőnyi and Szalai hanged
//   on 15 October 1949; four army and police officers executed on 24 October; with the secret side trials eight
//   more death sentences and more than eighty prison sentences; legal rehabilitation in 1955, political in spring
//   1956; reburial on 6 October 1956.
// - FRUS 1949 vol. V, doc. 289, US embassy Moscow airgram of 26 September 1949: the "wild, exaggerated" accusations;
//   the trial "appears as Kremlin's most determined and serious public effort since emergence of Titoism"; held in
//   public, reported in the world press.
// - UN Special Committee on the Problem of Hungary, Report (1957), via mek.oszk.hu/01200/01274: para 19 (witnesses
//   accused in the Rajk trial "had undergone extreme torture, had been forced to sign confessions"); para 272 (Kádár
//   succeeded Rajk as interior minister; witnesses: Kádár asked Rajk to make a false statement against himself,
//   promising he could live under a different name; he was one of the four who signed the execution order);
//   para 378 (27 March 1956: Rákosi announced the Supreme Court had found the Rajk trial based on "fabricated
//   charges"; some 300 people released); paras 386–388 (reburial on 6 October 1956, many thousands present).
// Computed here: the 17 days from the reburial (6 October 1956) to 23 October 1956.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.4  Budapest, September 1949; Rajk's file: Spain, the illegal party, the Interior Ministry.
//  B  9.6–23.2  Arrested; the charges; Stalin's break with Tito and the hunt for "Titoists".
//  C 23.4–37.0  The People's Court on the radio; the script written in advance; torture; Kádár's promise.
//  D 37.2–50.8  The verdict; 15 October 1949; the side trials.
//  E 51.0–64.6  Nobody safe; March 1956, "fabricated"; the reburial of 6 October 1956, 17 days before the revolution.
const W = 864, H = 1080, CX = W / 2;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#1f1b18', bg2: '#110f0d', ink: '#f2ece2', soft: 'rgba(242,236,226,0.74)', faint: 'rgba(242,236,226,0.22)', line: 'rgba(242,236,226,0.06)',
  paper: '#ebe2cf', paper2: '#dfd4bd', pInk: '#2b2420', pSoft: 'rgba(43,36,32,0.6)', pLine: 'rgba(43,36,32,0.16)',
  red: '#c0392b', redSoft: 'rgba(192,57,43,0.85)', steel: '#8fb3cf', gold: '#e2b85a', panel: 'rgba(10,9,8,0.82)',
};
const MONO = 'IBM Plex Mono', TXT = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = MONO) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

const REBURIAL = Date.UTC(1956, 9, 6), REVOLUTION = Date.UTC(1956, 9, 23);
const DAYS = Math.round((REVOLUTION - REBURIAL) / 864e5);
if (DAYS !== 17) throw new Error(`days ${DAYS}`);

/** A sheet of paper with a faint ruled texture. */
function paper(x, y, w, h, { rot = 0, col = C.paper } = {}) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(8, 10, w, h);
  ctx.fillStyle = col; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = C.pLine; ctx.lineWidth = 1;
  for (let yy = 70; yy < h - 20; yy += 34) { ctx.beginPath(); ctx.moveTo(24, yy); ctx.lineTo(w - 24, yy); ctx.stroke(); }
  ctx.restore();
}
/** Typed text revealed left to right (clipped, so the whole string is drawn and translated as one). */
function typed(s, x, y, g, { size = 23, w = 500, col = C.pInk, weight = 500, align = 'left' } = {}) {
  if (g <= 0) return;
  font(weight, size);
  const tw = ctx.measureText(s).width;
  const x0 = align === 'center' ? x - tw / 2 : x;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 4, y - size, (tw + 8) * Math.min(1, g), size * 2); ctx.clip();
  text(s, x, y, { color: col, align });
  ctx.restore();
}
/** A rubber stamp: a rotated red box with capitals, landing with a little bounce. */
function stamp(s, x, y, g, { size = 34, rot = -0.14, col = C.red, maxW = 420 } = {}) {
  if (g <= 0) return;
  const sc = lerp(1.6, 1, back(Math.min(1, g)));
  A(Math.min(1, g * 2), () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    font(700, size);
    let tw = ctx.measureText(s).width;
    if (tw > maxW) { size = Math.floor(size * maxW / tw); font(700, size); tw = ctx.measureText(s).width; } // a longer translation shrinks
    ctx.strokeStyle = col; ctx.lineWidth = 4;
    ctx.strokeRect(-tw / 2 - 18, -size * 0.85, tw + 36, size * 1.7);
    text(s, 0, 2, { color: col, align: 'center', spacing: '2px' });
    ctx.restore();
  });
}
/** A simple standing figure: head and shoulders. */
function person(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 30 * s, 13 * s, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 24 * s, y + 12 * s); ctx.quadraticCurveTo(x - 24 * s, y - 14 * s, x, y - 14 * s);
  ctx.quadraticCurveTo(x + 24 * s, y - 14 * s, x + 24 * s, y + 12 * s); ctx.closePath(); ctx.fill();
}
/** A label on a dark pill. */
function tag(s, x, y, col, { size = 22, align = 'center' } = {}) {
  font(600, size);
  const tw = ctx.measureText(s).width, pad = 12;
  const bx = align === 'center' ? x - tw / 2 - pad : align === 'left' ? x - pad : x - tw - pad;
  ctx.fillStyle = C.panel; k.rrect(bx, y - size * 0.8, tw + pad * 2, size * 1.6, 8); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  text(s, x, y + 1, { align, color: col });
}

// ---------- A–B: the file ----------
const FILE = { x: 112, y: 176, w: 640, h: 500 };
const ROLES = [
  ['1936–39', 'fought in the Spanish Civil War'],
  ['1941', 'led the illegal Communist Party'],
  ['1946–48', 'Minister of the Interior'],
  ['1948–49', 'Foreign Minister'],
];
const CHARGES = ['spying for the West', 'a plot with Tito of Yugoslavia', 'planning to kill Rákosi'];

function sceneFile(t) {
  A(span(t, 0, 18.8, 0.5, 0.5), () => {
    const lift = eout(seg(t, 0.2, 1.2));
    const { x, w, h } = FILE, y = FILE.y + (1 - lift) * 60;
    paper(x, y, w, h, { rot: -0.012 });
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(-0.012); ctx.translate(-(x + w / 2), -(y + h / 2));
    font(700, 24); text('FILE', x + 34, y + 40, { color: C.pSoft, spacing: '3px' });
    font(700, 34); text('RAJK, László', x + 34, y + 90, { color: C.pInk });
    font(500, 22); text('1909–1949 · Communist', x + 34, y + 130, { color: C.pSoft });
    ROLES.forEach(([when, what], i) => {
      const g = seg(t, 4.8 + i * 0.9, 5.9 + i * 0.9);
      typed(when, x + 34, y + 196 + i * 50, g, { size: 22, weight: 700 });
      typed(what, x + 164, y + 196 + i * 50, seg(t, 5.0 + i * 0.9, 6.2 + i * 0.9), { size: 22 });
    });
    // the charges, typed under a rule
    A(seg(t, 14.2, 14.6), () => {
      ctx.strokeStyle = C.pSoft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 34, y + 372); ctx.lineTo(x + w - 34, y + 372); ctx.stroke();
      font(700, 22); text('CHARGED WITH', x + 34, y + 404, { color: C.red, spacing: '2px' });
      CHARGES.forEach((c, i) => typed(c, x + 250, y + 404 + i * 32, seg(t, 14.6 + i * 0.8, 15.6 + i * 0.8), { size: 21 }));
    });
    ctx.restore();
    stamp('ARRESTED · 1949', x + w - 178, y + 62, seg(t, 10.2, 10.8), { size: 30, rot: -0.16, maxW: 290 });
  });
  A(span(t, 0, 9.6, 0.5, 0.4), () => {
    font(700, 40, TXT); text('THE RAJK TRIAL', 70, 92, { spacing: '2px' });
    font(500, 26, TXT); text('Budapest · September 1949', 70, 132, { color: C.gold });
  });
  A(span(t, 9.6, 18.8, 0.4, 0.4), () => {
    font(600, 24, TXT); text('Ordered by party leader Mátyás Rákosi’s regime', 70, 118, { color: C.soft });
  });
}

// ---------- B: Stalin, Tito and the "Titoists" ----------
function sceneTito(t) {
  A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
    const MOS = [650, 250], BEL = [330, 600], BUD = [400, 360];
    // Moscow and Belgrade, and the break of 1948 between them
    const node = (p, name, who, col) => {
      ctx.fillStyle = C.panel; ctx.beginPath(); ctx.arc(p[0], p[1], 58, 0, TAU); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
      font(700, 23); text(name, p[0], p[1] - 10, { align: 'center', color: col });
      font(500, 20, TXT); text(who, p[0], p[1] + 20, { align: 'center', color: C.soft });
    };
    const g = eio(seg(t, 19.2, 20.2));
    ctx.strokeStyle = C.faint; ctx.lineWidth = 4; ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.moveTo(MOS[0], MOS[1]); ctx.lineTo(lerp(MOS[0], BEL[0], g), lerp(MOS[1], BEL[1], g)); ctx.stroke(); ctx.setLineDash([]);
    // the crack
    A(seg(t, 20.2, 20.6), () => {
      const mx = (MOS[0] + BEL[0]) / 2 + 40, my = (MOS[1] + BEL[1]) / 2 + 20;
      ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath();
      ctx.moveTo(mx - 22, my - 30); ctx.lineTo(mx + 6, my - 6); ctx.lineTo(mx - 10, my + 4); ctx.lineTo(mx + 20, my + 30); ctx.stroke();
      tag('1948: the split', mx + 120, my + 10, C.red);
    });
    node(MOS, 'Moscow', 'Stalin', C.steel);
    node(BEL, 'Belgrade', 'Tito', C.gold);
    A(seg(t, 21.0, 21.6), () => {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(BUD[0], BUD[1], 9, 0, TAU); ctx.fill();
      font(700, 23); text('Budapest', BUD[0] - 18, BUD[1] - 4, { align: 'right' });
      font(500, 21, TXT); text('Rajk, accused as “Tito’s man”', BUD[0] - 18, BUD[1] + 26, { align: 'right', color: C.gold });
    });
    A(seg(t, 21.6, 22.2), () => tag('every Soviet ally hunts “Titoists”', CX, 720, C.steel));
  });
}

// ---------- C: the court, the script, the promise ----------
function sceneCourt(t) {
  A(span(t, 23.4, 28.2, 0.4, 0.4), () => {
    tag('PEOPLE’S COURT · 16–24 SEPTEMBER 1949', CX, 150, C.gold, { size: 23 });
    // the bench with three judges
    ctx.fillStyle = '#3a312a'; ctx.fillRect(210, 300, 444, 120);
    ctx.fillStyle = '#4a3f36'; ctx.fillRect(196, 286, 472, 22);
    for (let i = 0; i < 3; i++) person(330 + i * 102, 284, 1.0, '#9c8f80');
    // the dock, with one figure, facing the bench
    ctx.strokeStyle = '#6b5d50'; ctx.lineWidth = 6; ctx.strokeRect(372, 560, 120, 90);
    person(432, 570, 1.1, C.ink);
    font(600, 22); text('Rajk', 432, 676, { align: 'center', color: C.soft });
    // the microphone and the radio waves
    const mx = 610, my = 560;
    ctx.fillStyle = C.steel; k.rrect(mx - 12, my - 40, 24, 46, 12); ctx.fill();
    ctx.strokeStyle = C.steel; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(mx, my + 6); ctx.lineTo(mx, my + 70); ctx.moveTo(mx - 26, my + 70); ctx.lineTo(mx + 26, my + 70); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 0.9 + i / 3) % 1);
      A((1 - ph) * seg(t, 24.0, 24.6), () => { ctx.strokeStyle = C.steel; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx, my - 18, 30 + ph * 90, -0.9, 0.9); ctx.stroke(); });
    }
    A(seg(t, 24.6, 25.2), () => { font(600, 22, TXT); text('broadcast on the radio', mx + 30, my + 104, { align: 'center', color: C.steel }); });
    A(seg(t, 25.6, 26.2), () => tag('he confesses to everything', 432, 740, C.ink));
  });
  // the script
  A(span(t, 28.0, 32.8, 0.4, 0.4), () => {
    const slide = eout(seg(t, 28.0, 28.8));
    const x = 150 + (1 - slide) * 80, y = 170;
    paper(x, y, 564, 500, { rot: 0.01, col: C.paper2 });
    font(700, 28); text('THE SCRIPT', x + 34, y + 44, { color: C.pInk, spacing: '3px' });
    font(500, 20); text('written before the trial', x + 34, y + 76, { color: C.pSoft });
    // question and answer lines as grey bars: what was to be said, word for word
    for (let i = 0; i < 6; i++) {
      const yy = y + 130 + i * 52, g = seg(t, 28.6 + i * 0.25, 29.2 + i * 0.25);
      font(700, 22); text(i % 2 ? 'A' : 'Q', x + 34, yy, { color: i % 2 ? C.red : C.pSoft });
      ctx.fillStyle = C.pLine; ctx.fillRect(x + 70, yy - 7, (i % 2 ? 380 : 440) * g, 14);
    }
    stamp('REHEARSED', x + 400, y + 440, seg(t, 30.0, 30.6), { size: 28, rot: -0.1 });
    A(seg(t, 30.6, 31.2), () => tag('a false confession, obtained through torture', CX, 730, C.red, { size: 22 }));
  });
  // the promise, as witnesses told the UN committee
  A(span(t, 32.6, 37.4, 0.4, 0.4), () => {
    ctx.fillStyle = C.panel; k.rrect(80, 150, W - 160, 560, 18); ctx.fill();
    font(600, 22, TXT); text('Witnesses to the UN Special Committee, 1957', CX, 196, { align: 'center', color: C.soft });
    person(250, 400, 1.6, C.steel); person(614, 400, 1.6, C.ink);
    font(700, 23); text('János Kádár', 250, 460, { align: 'center', color: C.steel });
    font(500, 20, TXT); text('then interior minister', 250, 490, { align: 'center', color: C.soft });
    font(700, 23); text('László Rajk', 614, 460, { align: 'center' });
    font(500, 20, TXT); text('in prison', 614, 490, { align: 'center', color: C.soft });
    const g = eio(seg(t, 33.6, 34.6));
    ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(320, 350); ctx.lineTo(lerp(320, 540, g), 350); ctx.stroke();
    A(seg(t, 34.4, 35.0), () => { font(600, 22, TXT); text('asked him to make a false statement', CX, 316, { align: 'center', color: C.gold }); });
    A(seg(t, 35.2, 35.8), () => { font(600, 22, TXT); text('a promise: he would live, under another name', CX, 600, { align: 'center', color: C.ink }); });
  });
}

// ---------- D: the verdict ----------
const ACCUSED = [['László Rajk', 'former interior minister'], ['Tibor Szőnyi', 'party cadre chief'], ['András Szalai', 'his deputy']];
function sceneVerdict(t) {
  A(span(t, 37.2, 46.6, 0.4, 0.4), () => {
    tag('24 SEPTEMBER 1949 · SENTENCED TO DEATH', CX, 150, C.red, { size: 22 });
    ACCUSED.forEach(([name, role], i) => {
      const g = eout(seg(t, 37.6 + i * 0.4, 38.4 + i * 0.4));
      const x = 110 + i * 222, y = 230 + (1 - g) * 40;
      A(g, () => {
        paper(x, y, 200, 250);
        person(x + 100, y + 120, 1.3, C.pSoft);
        font(700, 21); text(name, x + 100, y + 186, { align: 'center', color: C.pInk });
        font(500, 18, TXT); text(role, x + 100, y + 216, { align: 'center', color: C.pSoft });
        // a black mourning band across the corner, from 15 October
        A(seg(t, 42.4 + i * 0.2, 42.9 + i * 0.2), () => {
          ctx.save(); ctx.beginPath(); ctx.rect(x, y, 200, 250); ctx.clip();
          ctx.fillStyle = '#141210'; ctx.beginPath(); ctx.moveTo(x + 140, y); ctx.lineTo(x + 200, y); ctx.lineTo(x + 200, y + 60); ctx.closePath(); ctx.fill();
          ctx.restore();
        });
      });
    });
    A(seg(t, 42.0, 42.6), () => {
      ctx.fillStyle = C.paper; ctx.fillRect(312, 540, 240, 150);
      ctx.fillStyle = C.red; ctx.fillRect(312, 540, 240, 40);
      font(700, 22); text('OCTOBER 1949', 432, 561, { align: 'center', color: C.paper });
      font(700, 66); text('15', 432, 640, { align: 'center', color: C.pInk });
    });
    A(seg(t, 43.6, 44.2), () => { font(600, 22, TXT); text('all three hanged', 432, 724, { align: 'center', color: C.soft }); });
    A(seg(t, 44.4, 45.0), () => { font(600, 22, TXT); text('24 October: four army and police officers', 432, 756, { align: 'center', color: C.soft }); });
  });
  // the side trials, as a quiet ledger
  A(span(t, 46.4, 51.2, 0.4, 0.4), () => {
    paper(132, 190, 600, 470, { col: C.paper2 });
    font(700, 26); text('SIDE TRIALS, IN SECRET', 166, 236, { color: C.pInk, spacing: '2px' });
    const rows = ['more death sentences', 'more than 80 prison sentences'];
    rows.forEach((what, i) => typed(what, 166, 330 + i * 90, seg(t, 47.2 + i * 0.8, 48.0 + i * 0.8), { size: 24 }));
  });
}

// ---------- E: the lesson, the admission, the reburial ----------
function sceneAfter(t) {
  // nobody safe: rows of party members, any of whom could be next
  A(span(t, 51.0, 55.8, 0.4, 0.4), () => {
    tag('IF RAJK, THEN ANYONE', CX, 160, C.gold, { size: 24 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      const x = 162 + c * 90, y = 290 + r * 112, g = seg(t, 51.4 + (r * 7 + c) * 0.04, 51.9 + (r * 7 + c) * 0.04);
      A(g * (0.45 + 0.55 * (r === 1 && c === 3 ? 1 : 0.6)), () => person(x, y, 0.95, r === 1 && c === 3 ? C.ink : '#a99c8c'));
    }
    A(seg(t, 52.6, 53.2), () => { font(600, 22, TXT); text('in the party, in the army, at work: fear', CX, 740, { align: 'center', color: C.soft }); });
  });
  // 27 March 1956: "fabricated"
  A(span(t, 55.6, 60.4, 0.4, 0.4), () => {
    paper(150, 190, 564, 470, { rot: 0.01, col: C.paper2 });
    font(700, 28); text('THE SCRIPT', 184, 236, { color: C.pInk, spacing: '3px' });
    for (let i = 0; i < 6; i++) { ctx.fillStyle = C.pLine; ctx.fillRect(220, 300 + i * 52, i % 2 ? 380 : 440, 14); }
    const g = eio(seg(t, 56.2, 57.2));
    ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(190, 620); ctx.lineTo(lerp(190, 680, g), lerp(620, 280, g)); ctx.stroke(); ctx.lineCap = 'butt';
    stamp('FABRICATED', CX, 470, seg(t, 57.2, 57.8), { size: 40, rot: -0.2 });
    A(seg(t, 57.8, 58.4), () => tag('27 MARCH 1956 · RÁKOSI ADMITS IT', CX, 730, C.red, { size: 22 }));
  });
  // the reburial of 6 October 1956, and 23 October
  A(span(t, 60.2, 65.2, 0.4, 0), () => {
    const cx = 300, cy = 420;
    ctx.fillStyle = '#5a4636';
    ctx.beginPath(); ctx.moveTo(cx - 150, cy - 30); ctx.lineTo(cx + 150, cy - 44); ctx.lineTo(cx + 150, cy + 44); ctx.lineTo(cx - 150, cy + 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a2d23'; ctx.fillRect(cx - 150, cy + 30, 300, 16);
    // flowers
    for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 3 === 0 ? '#e8e2d6' : i % 3 === 1 ? C.red : '#5c8a4e'; ctx.beginPath(); ctx.arc(cx - 80 + i * 20, cy - 44 - (i % 2) * 8, 9, 0, TAU); ctx.fill(); }
    font(700, 23); text('6 OCT 1956', cx, cy + 92, { align: 'center', color: C.gold });
    font(500, 21, TXT); text('reburied before a huge crowd', cx, cy + 124, { align: 'center', color: C.soft });
    const g = eio(seg(t, 61.2, 62.4));
    ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(470, cy); ctx.lineTo(lerp(470, 580, g), cy); ctx.stroke();
    A(seg(t, 62.2, 62.6), () => {
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(598, cy); ctx.lineTo(578, cy - 14); ctx.lineTo(578, cy + 14); ctx.fill();
      font(700, 23); text(`${fmt(DAYS)} days`, 525, cy - 30, { align: 'center', color: C.gold });
      font(700, 26); text('23 OCT', 690, cy - 14, { align: 'center' });
      font(700, 26); text('1956', 690, cy + 18, { align: 'center' });
      font(500, 21, TXT); text('the revolution', 690, cy + 54, { align: 'center', color: C.soft });
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
  // the boards of an office desk, faint
  g.strokeStyle = C.line; g.lineWidth = 2;
  for (let y = 60; y < 800; y += 72) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

const CUES = [
  [0.4, 4.8, 'Budapest, September 1949: *László Rajk*, a Communist and ex-interior minister, goes on trial.'],
  [5.0, 9.4, 'He had fought in Spain, led the illegal party in wartime and run the *Interior Ministry*.'],
  [9.6, 14.0, 'In 1949 the regime of party leader ~Mátyás Rákosi~ had him arrested: a party hero, now an enemy.'],
  [14.2, 18.6, 'Charged with spying for the West and plotting with Yugoslavia’s leader *Tito* against the state.'],
  [18.8, 23.2, 'Stalin had broken with Tito in 1948. Every Soviet ally now hunted its own *“Titoists”*.'],
  [23.4, 27.8, '16 September: the trial opened, broadcast on the radio, and Rajk *confessed to everything*.'],
  [28.0, 32.4, 'His answers had been written in advance: a false confession, obtained through ~torture~.'],
  [32.6, 37.0, 'Witnesses later told the UN that *János Kádár* urged him to confess, promising he would live.'],
  [37.2, 41.6, 'On 24 September Rajk was *sentenced to death*, with Tibor Szőnyi and András Szalai.'],
  [41.8, 46.2, '15 October 1949: all three were ~hanged~. Four officers followed on 24 October.'],
  [46.4, 50.8, 'Secret side trials brought more death sentences, and *more than 80* people were jailed.'],
  [51.0, 55.4, 'The lesson of the trial: if even Rajk could be made to confess, *nobody was safe*.'],
  [55.6, 60.0, '27 March 1956: Rákosi admitted that the charges had been ~fabricated~.'],
  [60.2, 64.6, 'Rajk was reburied on *6 October 1956*. Seventeen days later the revolution began.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [MONO, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneFile(t);
    sceneTito(t);
    sceneCourt(t);
    sceneVerdict(t);
    sceneAfter(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 38, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.gold, '~': '#e8846f' } });
  },
});
