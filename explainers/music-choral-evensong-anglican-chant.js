// Explainer for music-choral-evensong-anglican-chant: on 7 October 2026 BBC radio's Choral Evensong turned 100;
// the first broadcast came live from Westminster Abbey on 7 October 1926. The music of its psalms and canticles
// is Anglican chant: a short harmonised tune of 7 bars per verse that fits verses of any length, because its
// reciting notes hold as many words as needed. Look: slate-blue stone and candle-gold, a parchment psalter page
// with crimson pointing marks, and a staff whose reciting notes stretch like elastic. Cardo (a scholarly
// old-style serif) for the psalter and titles, Fira Sans for captions.
//
// Facts:
// - The Guardian, Jonathan Davies MP, "Abide with me: English choral music is a living part of our cultural
//   heritage" (7 October 2026): "This year marks the centenary of choral evensong on BBC radio. On 7 October
//   1926 ... listeners heard a live service broadcast from Westminster Abbey"; evensong can still be heard on
//   Radio 3 every week from cathedrals, churches, chapels and abbeys; "the BBC's longest running outside
//   broadcast"; around 3,000 children and young people sing as choristers in the UK's cathedrals, churches and
//   chapels.
// - Wikipedia, "Anglican chant": a way to sing unmetrical texts, including psalms and canticles, by matching the
//   natural speech-rhythm of the words to the notes of a simple harmonised melody; the reciting notes are in the
//   first, fourth, eighth, eleventh (etc.) bars; melodies of 7, 14, 21 or 28 bars (single, double, triple,
//   quadruple chants); Parish Psalter rules (Sydney Nicholson): each verse is sung to seven bars; bar lines =
//   pointing marks (shown as apostrophes); the double bar = the colon; one note (semibreve) to a bar: all the
//   words for that part are sung to it; two notes (minims): all the words except the last syllable go on the
//   first; double chants, the most commonly used, repeat for every pair of verses, reflecting the Hebrew poetry:
//   each verse in two halves, the second answering the first, and verses in pairs. The pointed Magnificat,
//   verses 1-4: "My soul doth ' magnify the ' Lord : And my spirit hath re'joiced in ' God my ' Saviour." / "For '
//   he hath re'garded : the ' lowliness ' of his ' handmaiden." / "For be'hold from ' henceforth : all gene '
//   rations shall ' call me ' blessed." / "For he that is mighty hath ' magnified ' me : and ' holy ' is his '
//   Name." Earliest known examples by John Blow, Henry Purcell and their contemporaries; earliest double chants
//   from about 1700.
// The chant's notes drawn and sung here are an invented example; the pointing and words are the Wikipedia
// example's. Syllables on the reciting notes are counted in code.
//
// Scene plan (60 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0–13.6  7 October 1926, Westminster Abbey, to 7 October 2026: 100 years, weekly on Radio 3.
//  B 13.8–22.8  Verses of every length, one 7-bar tune; reciting notes.
//  C 23.0–32.0  Two-note bars; the pointing in a psalter.
//  D 32.2–50.4  The Magnificat, verses 1, 4 and 2: the reciting note stretches; double chants.
//  E 50.6–60.0  Pairs of verses; music bending to speech.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#1c2030', bg1: '#0c0e16', ink: '#f3ede0', soft: 'rgba(243,237,224,0.74)', faint: 'rgba(243,237,224,0.26)', line: 'rgba(243,237,224,0.14)',
  gold: '#f2c46d', parch: '#efe3c8', parchInk: '#2c2418', crimson: '#c0394a', recite: '#8fd0ae', stone: '#2b3044', panel: 'rgba(8,10,18,0.78)',
};
const SERIF = 'Cardo', SANS = 'Fira Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the chant and the Magnificat ----------
// 7 bars: [notes in the bar]; 'r' marks a reciting bar. An invented example melody (staff steps, 0 = bottom line).
const BARS = [{ notes: [4], r: true }, { notes: [4.5, 4] }, { notes: [3.5] }, { notes: [4], r: true }, { notes: [3.5, 3] }, { notes: [3, 2.5] }, { notes: [3] }];
const SLOTS = BARS.flatMap((b, i) => b.notes.map((n) => ({ bar: i, n, r: !!b.r, two: b.notes.length === 2 })));
// the first four verses of the Magnificat, one entry per note, as syllables (pointing as in the Parish Psalter rules)
const VERSES = [
  [['My', 'soul', 'doth'], ['mag', '-ni', '-fy'], ['the'], ['Lord'], ['And', 'my', 'spi', '-rit', 'hath', 're-'], ['-joiced'], ['in'], ['God'], ['my'], ['Sa', '-viour']],
  [['For'], ['he', 'hath'], ['re-'], ['-gar', '-ded'], ['the'], ['low', '-li-'], ['-ness'], ['of'], ['his'], ['hand', '-mai', '-den']],
  [['For', 'be-'], ['-hold'], ['from'], ['hence', '-forth'], ['all', 'ge', '-ne-'], ['-ra', '-tions'], ['shall'], ['call'], ['me'], ['blessed']],
  [['For', 'he', 'that', 'is', 'migh', '-ty', 'hath'], ['mag', '-ni-'], ['-fied'], ['me'], ['and'], ['ho-'], ['-ly'], ['is'], ['his'], ['Name']],
];
// syllables that continue a word start with '-'; a word that runs on to the next note ends with '-'
const show = (syl) => syl.join(' ').replace(/ -/g, '');
// words per verse, with the pieces of a word that runs across notes joined up
const WORDS = VERSES.map((v) => v.map(show).join(' ').replace(/- -/g, '').split(' ').length);
if (WORDS.join() !== '15,9,10,13') throw new Error(`words per verse: ${WORDS}`);
if (SLOTS.length !== 10 || VERSES.some((v) => v.length !== SLOTS.length)) throw new Error('each verse needs one entry per note');
const reciting = (v) => SLOTS.map((s, i) => (s.r ? VERSES[v][i].length : null)).filter((x) => x !== null);
const R1 = reciting(0), R2 = reciting(1), R4 = reciting(3);
if (R4[0] !== 7 || R2[0] !== 1 || R1[0] !== 3) throw new Error('reciting counts');
// the pointed text, as a psalter prints it
const POINTED = ['My soul doth ’ magnify the ’ Lord :', 'And my spirit hath re’joiced in ’ God my ’ Saviour.'];

const CUES = [
  [0.4, 4.6, 'On 7 October 2026, Choral Evensong on BBC radio turned 100.'],
  [4.8, 9.0, 'The first broadcast came live from London’s Westminster Abbey on 7 October 1926.'],
  [9.2, 13.6, 'It is the BBC’s longest-running outside broadcast, heard on Radio 3 every week.'],
  [13.8, 18.2, 'Its psalms aren’t in regular metre: verses come in every length. Yet one short tune fits them all.'],
  [18.4, 22.8, 'That tune is an *Anglican chant*: 7 bars, sung once for each verse.'],
  [23.0, 27.4, 'Bars 1 and 4 hold ^reciting notes^: one chord that carries as many words as needed.'],
  [27.6, 32.0, 'In a bar of two notes, everything but the last syllable goes on the first note.'],
  [32.2, 36.6, 'Psalters mark the fit: each ~’~ is a bar line, and the ~colon~ splits the verse in two.'],
  [36.8, 41.2, 'Take the Magnificat. ‘My soul doth’ is recited on one note, then ‘magnify the Lord’.'],
  [41.4, 45.8, `In verse 4 the same note carries ^${R4[0]} syllables^: ‘For he that is mighty hath’.`],
  [46.0, 50.4, `In verse 2 it carries ^just ${R2[0]}^: ‘For’. The tune stays the same; the words stretch it.`],
  [50.6, 55.0, 'Most chants are double: 14 bars for each pair of verses, as one verse answers the other.'],
  [55.2, 60.0, 'So the music bends to the words, sung the way a careful speaker would say them.'],
];

// ---------- background: a stone arch ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d'), lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg0); lg.addColorStop(1, C.bg1); g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // a faint Gothic arch
  g.strokeStyle = 'rgba(243,237,224,0.06)'; g.lineWidth = 18;
  g.beginPath(); g.moveTo(90, 1080); g.lineTo(90, 520); g.quadraticCurveTo(110, 170, 432, 110); g.quadraticCurveTo(754, 170, 774, 520); g.lineTo(774, 1080); g.stroke();
  let s = 4; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(242,196,109,${rnd() * 0.03})`; g.fillRect(rnd() * W, rnd() * H, 2, 2); }
}

// ---------- a staff with the chant ----------
const ST = { x0: 60, x1: 804, y: 360, gap: 24 }; // y of the bottom line, line spacing
/** Widths of the 10 note slots, from syllables per slot (reciting slots stretch). */
function slotWidths(sylls, total, stretch) {
  const base = SLOTS.map((s, i) => (s.r ? lerp(1.2, 0.6 + sylls[i] * 0.95, stretch) : 1));
  const sum = base.reduce((a, b) => a + b, 0);
  return base.map((b) => (b / sum) * total);
}
function staff(widths, a = 1, o = {}) {
  A(a, () => {
    const { x0, x1, y, gap } = ST;
    ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    for (let l = 0; l < 5; l++) { ctx.beginPath(); ctx.moveTo(x0, y - l * gap); ctx.lineTo(x1, y - l * gap); ctx.stroke(); }
    let x = x0;
    const xs = [];
    SLOTS.forEach((s, i) => {
      const w = widths[i], cx = x + w / 2, ny = y - s.n * gap;
      xs.push([x, w]);
      if (s.r) { ctx.fillStyle = 'rgba(143,208,174,0.18)'; k.rrect(x + 4, y - 4 * gap - 14, w - 8, 4 * gap + 28, 8); ctx.fill(); }
      const lit = o.at === i;
      ctx.strokeStyle = lit ? C.gold : s.r ? C.recite : C.ink; ctx.lineWidth = 3;
      // semibreve: open oval; minim: open oval with a stem
      ctx.beginPath(); ctx.ellipse(cx, ny, 16, 11, -0.3, 0, 7); ctx.stroke();
      if (lit) { ctx.fillStyle = 'rgba(242,196,109,0.5)'; ctx.fill(); }
      if (s.two) { ctx.beginPath(); ctx.moveTo(cx + 15, ny - 3); ctx.lineTo(cx + 15, ny - 74); ctx.stroke(); }
      x += w;
      const next = SLOTS[i + 1];
      if (!next || next.bar !== s.bar) {
        ctx.strokeStyle = C.soft; ctx.lineWidth = s.bar === 2 ? 4 : 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 4 * gap); ctx.stroke();
        if (s.bar === 2 || s.bar === 6) { ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x - 7, y - 4 * gap); ctx.stroke(); }
      }
    });
    if (o.barNumbers) BARS.forEach((b, i) => {
      const first = SLOTS.findIndex((s) => s.bar === i), last = SLOTS.length - 1 - [...SLOTS].reverse().findIndex((s) => s.bar === i);
      const mid = (xs[first][0] + xs[last][0] + xs[last][1]) / 2;
      font(600, 22); text(`${i + 1}`, mid, y - 4 * gap - 32, { align: 'center', color: b.r ? C.recite : C.soft });
    });
    return xs;
  });
}
/** Syllables under each note slot. */
function lyrics(v, widths, y, o = {}) {
  let x = ST.x0;
  SLOTS.forEach((s, i) => {
    const w = widths[i], syl = VERSES[v][i];
    const lit = o.at === i;
    font(lit ? 700 : 400, 24, SERIF);
    text(show(syl), x + w / 2, y + (s.r ? 0 : i % 2 ? 30 : 0), { align: 'center', color: lit ? C.gold : s.r ? C.recite : C.ink });
    x += w;
  });
}

// ---------- A: a hundred years ----------
function sceneCentenary(t) {
  const a = span(t, 0, 13.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('CHORAL EVENSONG · BBC RADIO', W / 2, 128, { align: 'center', color: C.soft, spacing: '3px' });
    // a radio, with waves
    const rx = W / 2, ry = 330;
    A(eout(seg(t, 0.4, 1.2)), () => {
      ctx.fillStyle = '#5a3a24'; k.rrect(rx - 150, ry - 90, 300, 180, 24); ctx.fill();
      ctx.fillStyle = '#d9c08a'; k.rrect(rx - 120, ry - 60, 150, 120, 60); ctx.fill();
      ctx.strokeStyle = '#5a3a24'; ctx.lineWidth = 3; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(rx - 45 + i * 12, ry - 52); ctx.lineTo(rx - 45 + i * 12, ry + 52); ctx.stroke(); }
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(rx + 85, ry - 25, 18, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(rx + 85, ry + 30, 18, 0, 7); ctx.fill();
      for (let i = 1; i <= 3; i++) { const p = ((t * 0.6 + i / 3) % 1); A(1 - p, () => { ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(rx, ry - 90, 40 + p * 140, -2.4, -0.74); ctx.stroke(); }); }
    });
    // the timeline
    const y = 590, xa = 130, xb = 734, p = eio(seg(t, 5.0, 8.6));
    A(seg(t, 4.8, 5.2), () => {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke();
      ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(lerp(xa, xb, p), y); ctx.stroke();
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(xa, y, 10, 0, 7); ctx.fill();
      font(700, 34, SERIF); text('7 October 1926', xa, y + 46, { align: 'left', color: C.ink });
      font(500, 22); text('live from Westminster Abbey', xa, y + 84, { color: C.soft });
      const yr = Math.round(lerp(1926, 2026, p));
      font(700, 30, SERIF); text(`${yr}`, lerp(xa, xb, p), y - 34, { align: 'center', color: C.gold });
      A(seg(t, 8.6, 9.0), () => { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(xb, y, 10, 0, 7); ctx.fill(); font(700, 34, SERIF); text('7 October 2026', xb, y + 46, { align: 'right', color: C.ink }); font(500, 22); text('100 years', xb, y + 84, { align: 'right', color: C.soft }); });
    });
    A(seg(t, 9.6, 10.1), () => {
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 290, 700, 580, 64, 14); ctx.fill();
      font(600, 26); text('every week on Radio 3, from a different church', W / 2, 733, { align: 'center', color: C.gold });
    });
  });
}

// ---------- B, C: verses of any length, one tune ----------
function sceneTune(t) {
  const a = span(t, 13.6, 32.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text(t < 18.4 ? 'VERSES OF EVERY LENGTH' : 'ONE ANGLICAN CHANT · 7 BARS', W / 2, 128, { align: 'center', color: C.soft, spacing: '3px' });
    if (t < 18.4) {
      // verse lengths of the four Magnificat verses, in syllables
      WORDS.forEach((n, i) => A(eout(seg(t, 14.0 + i * 0.4, 14.5 + i * 0.4)), () => {
        const y = 230 + i * 90, w = n * 40;
        ctx.fillStyle = 'rgba(239,227,200,0.85)'; k.rrect(W / 2 - w / 2, y - 24, w, 48, 10); ctx.fill();
        font(600, 24); text(`verse ${i + 1}: ${n} words`, W / 2, y + 1, { align: 'center', color: C.parchInk });
      }));
      A(seg(t, 16.0, 16.5), () => { font(500, 24); text('the Magnificat, sung at evensong', W / 2, 600, { align: 'center', color: C.soft }); });
      return;
    }
    const w = slotWidths(VERSES[0].map((s) => s.length), ST.x1 - ST.x0, 0);
    staff(w, eout(seg(t, 18.6, 19.2)), { barNumbers: true });
    A(seg(t, 19.6, 20.1), () => {
      font(500, 24); text('first half of the verse', (ST.x0 + ST.x0 + w[0] + w[1] + w[2] + w[3]) / 2, ST.y + 50, { align: 'center', color: C.soft });
      text('second half', (ST.x0 + w[0] + w[1] + w[2] + w[3] + ST.x1) / 2, ST.y + 50, { align: 'center', color: C.soft });
      font(500, 20); text('(an invented example tune)', W / 2, ST.y + 90, { align: 'center', color: C.faint });
    });
    if (t >= 23.0) A(seg(t, 23.2, 23.7), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 480, 684, 136, 14); ctx.fill();
      font(700, 30); text('reciting notes: bars 1 and 4', W / 2, 518, { align: 'center', color: C.recite });
      font(500, 24); text('one note for all the words of that part,', W / 2, 558, { align: 'center', color: C.ink });
      text('two words or ten', W / 2, 590, { align: 'center', color: C.ink });
    });
    if (t >= 27.6) A(seg(t, 27.8, 28.3), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 632, 684, 136, 14); ctx.fill();
      font(700, 30); text('bars of two notes', W / 2, 670, { align: 'center', color: C.gold });
      font(500, 24); text('first note: everything but the last syllable', W / 2, 710, { align: 'center', color: C.ink });
      text('second note: the last syllable', W / 2, 742, { align: 'center', color: C.ink });
    });
  });
}

// ---------- the psalter page ----------
function scenePointing(t) {
  const a = span(t, 32.0, 36.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('POINTING: HOW A PSALTER PRINTS IT', W / 2, 128, { align: 'center', color: C.soft, spacing: '2px' });
    ctx.fillStyle = C.parch; k.rrect(70, 190, 724, 470, 12); ctx.fill();
    font(700, 30, SERIF); text('Magnificat', W / 2, 240, { align: 'center', color: C.crimson });
    font(400, 22, SERIF); text('the Song of the Blessed Virgin Mary', W / 2, 276, { align: 'center', color: 'rgba(44,36,24,0.6)' });
    // the verse, with the marks in crimson
    const lines = [POINTED[0], POINTED[1]];
    lines.forEach((ln, i) => {
      const y = 360 + i * 70; font(400, 30, SERIF);
      const parts = ln.split(/(’|:)/), total = ctx.measureText(ln).width;
      let x = W / 2 - total / 2;
      parts.forEach((p) => { font(400, 30, SERIF); const mark = p === '’' || p === ':'; const g = mark ? eout(seg(t, 33.0, 33.6)) : 1; text(p, x, y, { color: mark ? C.crimson : C.parchInk }); if (mark) A(g, () => { ctx.strokeStyle = 'rgba(192,57,74,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + ctx.measureText(p).width / 2, y - 2, 12, 0, 7); ctx.stroke(); }); x += ctx.measureText(p).width; });
    });
    A(seg(t, 34.2, 34.7), () => {
      font(600, 26); text('’  =  a bar line', W / 2 - 150, 540, { align: 'center', color: C.crimson });
      text(':  =  the middle of the verse', W / 2 + 140, 540, { align: 'center', color: C.crimson });
      font(400, 22); text('the marks as given in Wikipedia’s example of Parish Psalter pointing', W / 2, 610, { align: 'center', color: 'rgba(44,36,24,0.6)' });
    });
  });
}

// ---------- D: sing the verses ----------
/** Where the singing is at time u (0..1) through verse v: a slot index, weighting each syllable equally and final notes longer. */
function cursor(v, u) {
  const dur = SLOTS.map((s, i) => VERSES[v][i].length * (s.r ? 0.6 : 1) + (s.bar === 2 || s.bar === 6 ? 1 : 0));
  const total = dur.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < dur.length; i++) { acc += dur[i]; if (u * total < acc) return i; }
  return dur.length - 1;
}
function sceneSing(t) {
  const a = span(t, 36.6, 50.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const [v, t0] = t < 41.4 ? [0, 36.8] : t < 46.0 ? [3, 41.4] : [1, 46.0];
    font(600, 24); text(`THE MAGNIFICAT · VERSE ${v + 1}`, W / 2, 128, { align: 'center', color: C.soft, spacing: '3px' });
    const prev = t < 41.4 ? 0 : t < 46.0 ? 0 : 3, morph = eio(seg(t, t0, t0 + 0.8));
    const wa = slotWidths(VERSES[prev].map((s) => s.length), ST.x1 - ST.x0, 1), wb = slotWidths(VERSES[v].map((s) => s.length), ST.x1 - ST.x0, 1);
    const w = wa.map((x, i) => lerp(x, wb[i], morph));
    const at = t > t0 + 1.0 && t < t0 + 4.2 ? cursor(v, seg(t, t0 + 1.0, t0 + 4.2)) : -1;
    staff(w, 1, { at });
    A(morph, () => lyrics(v, w, ST.y + 56, { at }));
    // the count on the first reciting note
    const n = VERSES[v][0].length;
    A(seg(t, t0 + 1.2, t0 + 1.6), () => {
      ctx.fillStyle = C.panel; k.rrect(W / 2 - 250, 510, 500, 120, 14); ctx.fill();
      font(700, 64, SERIF); text(`${n}`, W / 2 - 150, 570, { align: 'center', color: C.recite });
      font(600, 26); text(n === 1 ? 'syllable on the first' : 'syllables on the first', W / 2 + 40, 554, { align: 'center', color: C.ink });
      text('reciting note', W / 2 + 40, 590, { align: 'center', color: C.ink });
    });
    A(seg(t, t0 + 1.6, t0 + 2.0), () => { font(500, 22); text('same tune, same 7 bars, every verse', W / 2, 680, { align: 'center', color: C.soft }); });
  });
}

// ---------- E: double chants; the end ----------
function sceneEnd(t) {
  const a = eout(seg(t, 50.6, 51.2));
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text(t < 55.2 ? 'A DOUBLE CHANT · 14 BARS' : 'MUSIC THAT BENDS TO WORDS', W / 2, 128, { align: 'center', color: C.soft, spacing: '3px' });
    // two verses as four quarters: call and answer
    const q = [['verse 1, first half', 'bars 1–3'], ['verse 1, second half', 'bars 4–7'], ['verse 2, first half', 'bars 8–10'], ['verse 2, second half', 'bars 11–14']];
    q.forEach(([lab, bars], i) => A(eout(seg(t, 51.0 + i * 0.5, 51.5 + i * 0.5)), () => {
      const x = 92 + (i % 2) * 350, y = 220 + Math.floor(i / 2) * 200;
      ctx.fillStyle = i % 2 ? 'rgba(242,196,109,0.18)' : 'rgba(143,208,174,0.18)'; k.rrect(x, y, 330, 160, 14); ctx.fill();
      font(700, 28, SERIF); text(lab, x + 165, y + 56, { align: 'center', color: C.ink });
      font(500, 24); text(bars, x + 165, y + 100, { align: 'center', color: i % 2 ? C.gold : C.recite });
    }));
    A(seg(t, 53.4, 53.9), () => { font(500, 24); text('each half answers the one before', W / 2, 640, { align: 'center', color: C.soft }); });
    A(seg(t, 55.4, 56.0), () => {
      ctx.fillStyle = C.panel; k.rrect(92, 680, 680, 80, 14); ctx.fill();
      font(700, 28, SERIF); text('the rhythm of a careful speaker, set to a chord', W / 2, 720, { align: 'center', color: C.gold });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneCentenary(t);
    sceneTune(t);
    scenePointing(t);
    sceneSing(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 41, weight: 700, family: SANS, ink: C.ink, marks: { '*': C.gold, '~': C.crimson, '^': C.recite } });
  },
});
