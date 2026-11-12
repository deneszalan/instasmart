// Explainer for economics-reprisals-and-the-nagy-trial (Hungary 1956, "Consequences"): the reprisals after 1956,
// from the summary courts of December 1956 to the amnesty of 1963; tens of thousands sentenced; the people executed
// (229, the 1956 Institute's count); the refugees; and the secret trial of Imre Nagy, Pál Maléter and Miklós Gimes,
// executed on 16 June 1958 and buried without a mark, in 1961 in plot 301 of the New Public Cemetery, until their
// reburial on 16 June 1989. Look: night slate with moss green and stone grey; plain documents, a closed courtroom, a
// cemetery plot of unmarked mounds, then wooden grave posts and a candle; no gallows, no figures falling. Alegreya for
// headings, Alegreya Sans for captions and labels.
//
// Facts:
// - Dornbach Alajos, "A pártállam igazságszolgáltatása és a Nagy Imre-per", in A per. Nagy Imre és társai, 1958,
//   1989 (1956 Institute, 2008; mek.oszk.hu/16600/16615): "A bíróságok több mint huszonkétezer embert ítéltek
//   börtönbüntetésre, még többre tehető az internáltak, ítélet nélkül hosszabb-rövidebb ideig fogva tartottak
//   száma"; about half a per cent of the population deprived of liberty; "A forradalomban való részvételéért 229
//   embert ítéltek halálra"; "Több mint kétszázezer ember menekült el"; the trial's very existence made known only
//   after the executions; the executions at dawn on 16 June 1958 in the Gyűjtőfogház; burial in the prison yard,
//   concreted over; in 1961 moved in secret to plot 301 of the Rákoskeresztúr New Public Cemetery, in its farthest,
//   overgrown corner, where those whose bodies were not given to their families were buried; fictitious entries.
// - Rainer M. János, "A kihallgatószobától a vesztőhelyig", same volume: unmarked burial in the prison yard; "1961.
//   február 24-én titokban kiásták a koporsókat ... a 301-es parcellájába, ahol a halottakat hamis nevek alatt ...
//   jeltelen sírba ismét elföldelték"; exhumed spring 1989; "1989. június 16-án egész napos gyászszertartás után
//   ünnepélyesen eltemették ugyanarra a helyre"; the verdict (TB. Nb. 003/1958): death for Nagy, Gimes, Maléter (and
//   Szilágyi, executed 24 April 1958); Donáth 12 years, Tildy 6, Kopácsi life, Jánosi 8, Vásárhelyi 5; trial opened
//   5 February 1958, held in camera at the military court building, Fő utca 70; resumed 9 June; verdict 15 June.
// - 1956 Institute (Szakolczai Attila), lesson 5 (mek.oszk.hu/01900/01937/html/ora5/ora5.htm): special laws around
//   12 December 1956 opened the reprisals, which lasted until the great amnesty of 1963; in summary trials for hidden
//   weapons no adult got less than ten years; internment; about 180,000 left the country for good, most via Austria;
//   "közel kétszázharminc végrehajtott halálos ítélet"; no more than 5% of the convicted could be shown to be
//   "Horthyists" or "class aliens", the great majority were workers, peasants, employees and students; in February
//   1957 the party leaders decided to put Nagy and his companions on trial.
// - UN Special Committee report (1957), paras 80–82: on 22 November 1956 at 6.30 p.m., after written assurances of
//   safe conduct, a bus took Nagy's party from the Yugoslav embassy; Soviet personnel diverted it; the Kádár
//   government said they had gone to Romania.
//
// Scene plan (65 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0–13.8  December 1956 to 1963; summary courts and internment; 22,000 sentenced.
//  B 14.2–27.8  229 executed; who they were; the refugees.
//  C 28.0–46.2  Nagy seized; the decision; the secret trial; the sentences.
//  D 46.4–64.6  16 June 1958; plot 301; silence; 16 June 1989.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#151c24', bg2: '#0c1116', ink: '#efece6', soft: 'rgba(239,236,230,0.74)', faint: 'rgba(239,236,230,0.22)',
  moss: '#7f9a5b', stone: '#a7a39a', candle: '#e9b44c', red: '#b4474b', paper: '#e9e4d8', panel: 'rgba(8,11,14,0.88)',
};
const HEAD = 'Alegreya', TXT = 'Alegreya Sans';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
const rnd = (i) => { const x = Math.sin(i * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); };

const SENTENCED = 22000; // "több mint huszonkétezer" sentenced to prison (Dornbach, 1956 Institute)
const EXECUTED = 229; // the 1956 Institute's count
const FLED_LO = 180000, FLED_HI = 200000; // Szakolczai: about 180,000 for good; Dornbach: more than 200,000 fled

function heading(s, sub, a, subCol = C.moss) {
  A(a, () => {
    font(700, 46, HEAD); text(s, 70, 98, { color: C.ink });
    if (sub) { font(500, 27); text(sub, 70, 144, { color: subCol }); }
  });
}

/** A typed sheet of paper with a heading and lines. */
function sheet(x, y, w, h, title, lines, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = C.paper; k.rrect(-w / 2, -h / 2, w, h, 6); ctx.fill();
  font(700, 26, HEAD); text(title, 0, -h / 2 + 40, { align: 'center', color: '#2a2622' });
  font(500, 21); lines.forEach((s, i) => text(s, -w / 2 + 30, -h / 2 + 90 + i * 34, { color: '#3a352f' }));
  ctx.restore();
}

// ---------- A: the reprisals begin ----------
function sceneA(t) {
  A(span(t, 0, 14.2, 0.5, 0.4), () => {
    heading('HUNGARY, DECEMBER 1956', 'The reprisals begin', 1);
    // a band of years: 1956 to 1963
    const x0 = 110, x1 = 754, y = 300, g = eio(seg(t, 0.8, 3.0));
    ctx.strokeStyle = C.faint; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, g), y); ctx.stroke();
    for (let yr = 1956; yr <= 1963; yr++) {
      const x = lerp(x0, x1, (yr - 1956) / 7);
      font(600, 22); text(String(yr), x, y + 34, { align: 'center', color: C.soft });
    }
    A(seg(t, 3.0, 3.6), () => { font(600, 23); text('until the amnesty of 1963', x1, y - 30, { align: 'right', color: C.ink }); });
    // summary courts and internment (cue 2)
    A(span(t, 5.0, 9.6, 0.4, 0.4), () => {
      sheet(270, 540, 330, 250, 'Summary court', ['a hidden weapon:', 'no adult less than', 'ten years in prison'], -0.03);
      sheet(610, 540, 300, 250, 'Internment', ['no trial needed', 'six months, then', 'renewable'], 0.03);
    });
    // 22,000 (cue 3)
    A(span(t, 9.6, 14.2, 0.4, 0.4), () => {
      ctx.fillStyle = C.panel; k.rrect(110, 420, 644, 260, 18); ctx.fill();
      font(800, 84, HEAD); text(`${fmt(SENTENCED)}+`, CX, 500, { align: 'center', color: C.ink });
      font(500, 26); text('people sentenced to prison by the courts', CX, 568, { align: 'center', color: C.soft });
      A(seg(t, 11.4, 12.0), () => { font(600, 24); text('even more interned or held without trial', CX, 628, { align: 'center', color: C.stone }); });
    });
  });
}

// ---------- B: the executed, who they were, the refugees ----------
function sceneB(t) {
  A(span(t, 14.2, 28.0, 0.4, 0.4), () => {
    A(span(t, 14.2, 18.8, 0.4, 0.4), () => {
      heading('EXECUTED', 'For their part in the revolution', 1, C.red);
      font(800, 150, HEAD); text(fmt(EXECUTED), CX, 450, { align: 'center', color: C.ink });
      font(500, 26); text('by the 1956 Institute’s count', CX, 570, { align: 'center', color: C.soft });
      // a single candle
      const f = 0.85 + 0.15 * Math.sin(t * 6);
      ctx.fillStyle = C.paper; ctx.fillRect(CX - 8, 640, 16, 60);
      ctx.fillStyle = C.candle; ctx.beginPath(); ctx.ellipse(CX, 626, 7, 14 * f, 0, 0, TAU); ctx.fill();
    });
    A(span(t, 18.8, 23.4, 0.4, 0.4), () => {
      heading('WHO THEY WERE', 'In the courts’ own statistics', 1, C.red);
      ['workers', 'peasants', 'clerks', 'students'].forEach((s, i) => A(seg(t, 19.2 + i * 0.4, 19.6 + i * 0.4), () => {
        const x = 200 + (i % 2) * 340, y = 300 + Math.floor(i / 2) * 130;
        ctx.fillStyle = C.stone; ctx.beginPath(); ctx.arc(x - 70, y, 16, 0, TAU); ctx.fill();
        k.rrect(x - 88, y + 20, 36, 50, 10); ctx.fill();
        font(700, 32, HEAD); text(s, x - 30, y + 26, { color: C.ink });
      }));
      A(seg(t, 21.0, 21.6), () => {
        ctx.fillStyle = C.panel; k.rrect(110, 590, 644, 110, 14); ctx.fill();
        font(600, 24); text('“class enemies”, as the regime called them:', CX, 628, { align: 'center', color: C.soft });
        text('no more than 5% even in its own figures', CX, 664, { align: 'center', color: C.red });
      });
    });
    // the refugees (cue 6)
    A(span(t, 23.4, 28.0, 0.4, 0.4), () => {
      heading('REFUGEES', '1956–1957', 1, C.candle);
      // a border line and arrows to the west
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
      ctx.beginPath(); ctx.moveTo(300, 220); ctx.lineTo(320, 400); ctx.lineTo(290, 560); ctx.lineTo(310, 720); ctx.stroke(); ctx.setLineDash([]);
      font(700, 30, HEAD); text('AUSTRIA', 170, 222, { align: 'center', color: C.soft }); text('HUNGARY', 560, 222, { align: 'center', color: C.soft });
      const g = eio(seg(t, 23.8, 25.6));
      for (let i = 0; i < 9; i++) {
        const y = 260 + i * 52, sx = 760 - rnd(i) * 60, ex = 160 + rnd(i + 9) * 60;
        ctx.strokeStyle = 'rgba(233,180,76,0.55)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(lerp(sx, ex, g), y + 8 * Math.sin(i)); ctx.stroke();
      }
      A(seg(t, 25.4, 26.0), () => {
        ctx.fillStyle = C.panel; k.rrect(380, 600, 380, 110, 14); ctx.fill();
        font(800, 34, HEAD); text(`${fmt(FLED_LO)}–${fmt(FLED_HI)}`, 570, 640, { align: 'center', color: C.candle });
        font(500, 21); text('left the country, by the 1956 Institute', 570, 682, { align: 'center', color: C.soft });
      });
    });
  });
}

// ---------- C: Imre Nagy ----------
const DEFENDANTS = [
  ['Imre Nagy', 'death', C.red], ['Pál Maléter', 'death', C.red], ['Miklós Gimes', 'death', C.red],
  ['Sándor Kopácsi', 'life', C.stone], ['Ferenc Donáth', '12 years', C.stone], ['Ferenc Jánosi', '8 years', C.stone],
  ['Zoltán Tildy', '6 years', C.stone], ['Miklós Vásárhelyi', '5 years', C.stone],
];
function sceneC(t) {
  A(span(t, 28.0, 46.4, 0.4, 0.4), () => {
    // 22 November 1956 (cue 7)
    A(span(t, 28.0, 32.6, 0.4, 0.4), () => {
      heading('22 NOVEMBER 1956', 'A promise of safe conduct', 1, C.candle);
      ctx.fillStyle = '#28303b'; ctx.fillRect(100, 320, 240, 200);
      font(600, 22); text('Yugoslav embassy', 220, 550, { align: 'center', color: C.soft });
      const g = eio(seg(t, 29.0, 31.0)), bx = lerp(370, 640, g);
      ctx.fillStyle = C.stone; k.rrect(bx - 70, 440, 140, 60, 10); ctx.fill();
      ctx.fillStyle = '#20262e'; for (let i = 0; i < 4; i++) ctx.fillRect(bx - 58 + i * 30, 452, 22, 18);
      ctx.fillStyle = '#20262e'; ctx.beginPath(); ctx.arc(bx - 40, 502, 10, 0, TAU); ctx.arc(bx + 40, 502, 10, 0, TAU); ctx.fill();
      A(seg(t, 30.4, 31.0), () => { font(700, 26); text('diverted by Soviet officers', 640, 580, { align: 'center', color: C.red }); text('then taken to Romania', 640, 616, { align: 'center', color: C.soft }); });
    });
    // the decision, the secret trial (cues 8 and 9)
    A(span(t, 32.6, 41.8, 0.4, 0.4), () => {
      heading('JUNE 1958, BUDAPEST', 'A trial behind closed doors', 1, C.candle);
      // a closed courtroom: a door with a sign
      ctx.fillStyle = '#28303b'; k.rrect(CX - 160, 240, 320, 420, 8); ctx.fill();
      ctx.strokeStyle = C.stone; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = C.paper; k.rrect(CX - 110, 330, 220, 70, 6); ctx.fill();
      font(800, 26, HEAD); text('CLOSED', CX, 365, { align: 'center', color: C.red });
      ctx.fillStyle = C.stone; ctx.beginPath(); ctx.arc(CX + 110, 470, 10, 0, TAU); ctx.fill();
      A(seg(t, 33.2, 33.8) * (1 - seg(t, 36.8, 37.2)), () => { font(600, 23); text('February 1957: the party decides on a trial', CX, 710, { align: 'center', color: C.soft }); });
      A(seg(t, 37.4, 38.0), () => { font(600, 23); text('announced only after the executions', CX, 710, { align: 'center', color: C.soft }); });
    });
    // the sentences (cue 10)
    A(span(t, 41.8, 46.4, 0.4, 0.4), () => {
      heading('15 JUNE 1958', 'The sentences', 1, C.red);
      DEFENDANTS.forEach(([name, verdict, col], i) => A(seg(t, 42.0 + i * 0.2, 42.4 + i * 0.2), () => {
        const y = 230 + i * 58;
        font(700, 30, HEAD); text(name, 150, y, { color: i < 3 ? C.ink : C.soft });
        font(700, 26); text(verdict, 714, y, { align: 'right', color: col });
        ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(150, y + 26); ctx.lineTo(714, y + 26); ctx.stroke();
      }));
    });
  });
}

// ---------- D: plot 301 ----------
function mounds(a, named) {
  A(a, () => {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      const x = 150 + c * 92 + (r % 2) * 20, y = 360 + r * 80;
      ctx.fillStyle = '#2b3428'; ctx.beginPath(); ctx.ellipse(x, y, 36, 14, 0, 0, TAU); ctx.fill();
      // grass, a few strokes per mound
      ctx.strokeStyle = 'rgba(127,154,91,0.55)'; ctx.lineWidth = 2;
      for (let j = 0; j < 4; j++) { const gx = x - 24 + j * 16 + rnd(r * 7 + c + j) * 6; ctx.beginPath(); ctx.moveTo(gx, y - 6); ctx.lineTo(gx + 3, y - 20 - rnd(j + c) * 10); ctx.stroke(); }
      if (named > 0 && (r * 7 + c) % 5 === 1) A(named, () => {
        // a wooden grave post (kopjafa), schematic
        ctx.fillStyle = '#8b6a43'; ctx.fillRect(x - 5, y - 70, 10, 62);
        ctx.beginPath(); ctx.moveTo(x - 10, y - 70); ctx.lineTo(x, y - 86); ctx.lineTo(x + 10, y - 70); ctx.fill();
      });
    }
  });
}
function sceneD(t) {
  A(span(t, 46.4, 65.2, 0.4, 0), () => {
    // 16 June 1958 (cue 11)
    A(span(t, 46.4, 51.0, 0.4, 0.4), () => {
      heading('16 JUNE 1958, DAWN', 'Executed in a Budapest prison', 1, C.red);
      ctx.fillStyle = '#2a2f36'; ctx.fillRect(110, 300, 644, 300);
      ctx.fillStyle = '#3a4048'; ctx.fillRect(110, 300, 644, 22);
      font(600, 24); text('the prison yard: buried without a mark', CX, 470, { align: 'center', color: C.soft });
      A(seg(t, 48.0, 48.6), () => { font(600, 23); text('Imre Nagy · Pál Maléter · Miklós Gimes', CX, 660, { align: 'center', color: C.ink }); });
    });
    // plot 301 (cues 12 and 13)
    A(span(t, 51.0, 60.2, 0.4, 0.4), () => {
      heading('PLOT 301', 'New Public Cemetery, Budapest', 1, C.moss);
      mounds(1, 0);
      A(seg(t, 51.6, 52.2) * (1 - seg(t, 55.4, 55.8)), () => { font(600, 24); text('1961: moved here in secret, under false names', CX, 700, { align: 'center', color: C.ink }); });
      A(seg(t, 56.0, 56.6), () => {
        font(600, 24); text('the cemetery’s farthest corner, left overgrown', CX, 690, { align: 'center', color: C.ink });
        text('the families were not given the bodies', CX, 726, { align: 'center', color: C.soft });
      });
    });
    // 16 June 1989 (cue 14)
    A(seg(t, 60.2, 60.6), () => {
      heading('16 JUNE 1989', 'Reburied with honour', 1, C.candle);
      mounds(1, seg(t, 60.8, 62.0));
      A(seg(t, 62.2, 62.8), () => {
        const f = 0.85 + 0.15 * Math.sin(t * 6);
        for (const x of [250, 432, 614]) {
          ctx.fillStyle = C.paper; ctx.fillRect(x - 6, 700, 12, 40);
          ctx.fillStyle = C.candle; ctx.beginPath(); ctx.ellipse(x, 690, 5, 11 * f, 0, 0, TAU); ctx.fill();
        }
      });
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
}

const CUES = [
  [0.4, 4.8, 'Hungary, December 1956: János Kádár’s regime begins its *reprisals*. They last until 1963.'],
  [5.0, 9.4, 'Summary courts gave at least ten years for a hidden weapon; others were *interned* without trial.'],
  [9.6, 14.0, 'Courts sentenced more than *22,000 people* to prison; even more were interned or held without trial.'],
  [14.2, 18.6, '~229~ people were executed for their part in the revolution, by the 1956 Institute’s count.'],
  [18.8, 23.2, 'Most were workers, peasants, clerks and students, not the “class enemies” the regime spoke of.'],
  [23.4, 27.8, 'Some 180,000 to 200,000 people *left Hungary*, most of them across the border to Austria.'],
  [28.0, 32.4, '22 November 1956: promised safe conduct, *Imre Nagy’s* group leaves the Yugoslav embassy and is seized.'],
  [32.6, 37.0, 'Held in Romania, they are brought back; in February 1957 the party decides to put them on *trial*.'],
  [37.2, 41.6, 'June 1958, Budapest: a *secret trial*. The public learns of it only after the executions.'],
  [41.8, 46.2, '15 June: death for Imre Nagy, ex-defence minister *Pál Maléter* and journalist *Miklós Gimes*.'],
  [46.4, 50.8, 'They are executed at dawn on ~16 June 1958~ and buried in the prison yard, without a mark.'],
  [51.0, 55.4, 'In 1961 their coffins are secretly moved to *plot 301* of a Budapest cemetery, under false names.'],
  [55.6, 60.0, 'For thirty years the plot lies overgrown in the cemetery’s farthest corner.'],
  [60.2, 64.6, 'On *16 June 1989*, after a public funeral on Heroes’ Square, they are reburied there with honour.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t);
    sceneB(t);
    sceneC(t);
    sceneD(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 40, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.candle, '~': C.red } });
  },
});
