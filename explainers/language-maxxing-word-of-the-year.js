// Explainer for language-maxxing-word-of-the-year: on 25 October 2026 Dictionary.com named "maxxing" its 2026
// Word of the Year. The mechanism: English keeps making new word endings out of chopped-off pieces of words
// ("libfixes"): the piece is cut in a new place, heard as carrying the meaning, then stuck onto other words, and
// sometimes it stands alone. Look: letter tiles on a deep ink-teal table that split at a glowing cut and snap
// onto new stems; the freed piece in hot pink, new stems in lime. Bungee for the tiles, Inter for captions.
//
// Facts:
// - Dictionary.com, "Dictionary.com's 2026 Word of the Year Is…" (25 October 2026): maxxing "refers to the
//   practice of pursuing an activity to the fullest or optimizing a certain aspect of your life"; used alone
//   ("Everyone is maxxing something…") and combined: looksmaxxing, tokenmaxxing (using as much AI at work as
//   possible), nonnamaxxing, cozymaxxing; its roots "go back to words like maximum ... maximize and max", then
//   "maxing", as in "maxing out credit cards"; then the gaming term min-maxing; "Other words started being subbed
//   in for the min in min-maxing, or maxing broke free from that term entirely and started being added to other
//   words ... oh, and it picked up an extra x"; looksmaxxing arose on Reddit and other forums, attested from
//   2015; "a remarkably productive combining form"; standalone use: "I'm maxxing everything I can"; it closes
//   "Maxxingmaxxing, anyone?" Shortlist: affordability, data center, odyssey, unc.
// - Wikipedia, "Libfix": a libfix ("liberated affix") is a productive bound morpheme created by rebracketing and
//   back-formation, often from a blend; walkathon was coined in 1932 as a blend of walk and marathon (Oxford
//   English Dictionary), and -athon then gave talkathon, telethon, hackathon; -gate < Watergate; -(a)holic <
//   alcoholism, as in shopaholic, workaholic; splinters such as burger (< hamburger) became words; the name
//   libfix was coined by Arnold Zwicky in 2010.
// - Wikipedia, "Workaholic": a portmanteau of work and alcoholic; first known appearance (OED) in the Toronto
//   Daily Star of 5 April 1947. "Watergate scandal": on 17 June 1972 operatives were caught burglarizing the
//   Democratic National Committee headquarters at Washington's Watergate complex. "Hamburger": the term
//   originally derives from Hamburg, Germany.
//
// Scene plan (60 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 9.0  Word of the Year 2026: MAXXING; looks-, token-, cozy-.
//  B  9.2–18.2  From max and maxing out to min-maxing, then a new first half, and an extra x.
//  C 18.4–22.8  A libfix: liberated + affix (Arnold Zwicky, 2010).
//  D 23.0–41.2  alcohol|ic heard as alco|holic → workaholic (1947); Watergate → -gate; walkathon (1932) → -athon.
//  E 41.4–50.4  The trick: a new cut, a piece that carries the meaning; hamburger → burger.
//  F 50.6–60.0  maxxing alone; maxxingmaxxing.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#0f1d27', bg1: '#060d14', ink: '#f2f5f1', soft: 'rgba(242,245,241,0.74)', faint: 'rgba(242,245,241,0.28)', line: 'rgba(242,245,241,0.12)',
  tile: '#f3ead8', tileInk: '#17212b', pink: '#ff4f9a', lime: '#b6f06b', cyan: '#5fd4ff', amber: '#ffcf5a', panel: 'rgba(4,10,16,0.78)',
};
const TILE = 'Bungee', TXT = 'Inter';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

const CUES = [
  [0.4, 4.6, 'On 25 October 2026, Dictionary.com named its Word of the Year: *maxxing*.'],
  [4.8, 9.0, 'It means pushing something to the limit: ^looksmaxxing^, ^tokenmaxxing^, even ^cozymaxxing^.'],
  [9.2, 13.6, 'It grew from *max*, as in ‘maxing out’ a credit card, and from the gamers’ term *min-maxing*.'],
  [13.8, 18.2, 'Swap something else in for *min*, and *maxing* starts to work as an ending. Plus an extra x.'],
  [18.4, 22.8, 'Linguists call a chunk set free like this a ~libfix~. Arnold Zwicky coined the term in 2010.'],
  [23.0, 27.4, 'English has done it before. *Alcoholic* is alcohol + ic, but people heard ~-holic~.'],
  [27.6, 32.0, 'So in 1947 a Toronto newspaper wrote ^workaholic^. Now there are shopaholics too.'],
  [32.2, 36.6, 'The 1972 break-in at the *Watergate* buildings left ~-gate~, now stuck onto other scandals.'],
  [36.8, 41.2, '*Walkathon*, from 1932, mixed walk and marathon. ~-athon~ then gave telethon and hackathon.'],
  [41.4, 45.8, 'The trick: cut a word in a new place, and hear the leftover piece as carrying the meaning.'],
  [46.0, 50.4, 'Some pieces even become words, as *burger* did from *hamburger*, named after Hamburg.'],
  [50.6, 55.0, 'In 2026 maxxing went solo too: ‘I’m maxxing everything I can,’ as Dictionary.com quotes.'],
  [55.2, 60.0, 'Dictionary.com signs off with a word of its own: ~maxxingmaxxing~, anyone?'],
];

// ---------- background: a dark table with a faint grid ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d'), lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg0); lg.addColorStop(1, C.bg1); g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(242,245,241,0.035)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 36) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

// ---------- letter tiles ----------
const STYLE = { base: [C.tile, C.tileInk], free: [C.pink, '#fff6fa'], stem: [C.lime, '#14200a'], dim: ['rgba(243,234,216,0.42)', 'rgba(23,33,43,0.75)'] };
/** One tile, centred at x, y. */
function tile(ch, x, y, s, style = 'base', a = 1, rot = 0) {
  A(a, () => {
    const [fill, ink] = STYLE[style];
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; k.rrect(-s / 2 + 3, -s / 2 + 5, s, s, s * 0.16); ctx.fill();
    ctx.fillStyle = fill; k.rrect(-s / 2, -s / 2, s, s, s * 0.16); ctx.fill();
    font(400, s * 0.58, TILE); text(ch, 0, s * 0.03, { align: 'center', color: ink });
    ctx.restore();
  });
}
/**
 * A word as a row of tiles centred at cx. `parts` is a list of [letters, style]; `gap` px opens between parts;
 * `drop` (0..1) brings the tiles in from above, one by one.
 */
function word(parts, cx, y, s, o = {}) {
  const gap = o.gap ?? 0, step = s * 1.08, n = parts.reduce((a, [p]) => a + p.length, 0);
  const total = n * step + gap * (parts.length - 1);
  let x = cx - total / 2 + step / 2, i = 0;
  const pos = [];
  parts.forEach(([p, style], j) => {
    for (const ch of p) {
      const d = o.drop === undefined ? 1 : clamp(o.drop * (n + 4) - i);
      if (d > 0) tile(ch, x, y - (1 - back(d)) * 60, s, style, Math.min(1, d * 2) * (o.alpha ?? 1));
      pos.push(x); x += step; i++;
    }
    if (j < parts.length - 1) x += gap;
  });
  return { left: cx - total / 2, right: cx + total / 2, pos };
}
/** A glowing cut line between tiles at x. */
function cut(x, y, s, a) {
  A(a, () => {
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 4; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(x, y - s * 0.9); ctx.lineTo(x, y + s * 0.9); ctx.stroke(); ctx.setLineDash([]);
  });
}
const header = (s, a = 1) => A(a, () => { font(700, 24, TXT); text(s, W / 2, 130, { align: 'center', color: C.soft, spacing: '3px' }); });

// ---------- A: the word of the year ----------
function sceneOpen(t) {
  const a = span(t, 0, 9.2, 0.3, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('DICTIONARY.COM · WORD OF THE YEAR 2026');
    word([['MAXXING', 'free']], W / 2, 300, 92, { drop: seg(t, 0.4, 2.2) });
    A(span(t, 2.0, 5.0, 0.5, 0.4), () => {
      font(600, 30); text('“the practice of pursuing an activity', W / 2, 450, { align: 'center', color: C.ink });
      text('to the fullest”', W / 2, 494, { align: 'center', color: C.ink });
      font(500, 22); text('Dictionary.com’s definition', W / 2, 546, { align: 'center', color: C.soft });
    });
    const stems = [['LOOKS', 5.0], ['TOKEN', 6.0], ['COZY', 7.0]];
    stems.forEach(([st, at], i) => {
      const g = eout(seg(t, at, at + 0.7)); if (g <= 0) return;
      word([[st, 'stem'], ['MAXXING', 'free']], W / 2, 460 + i * 104, 50, { alpha: g });
    });
  });
}

// ---------- B: from max to min-maxing to looksmaxxing ----------
function sceneLineage(t) {
  const a = span(t, 9.0, 18.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('WHERE IT CAME FROM');
    const rows = [
      [9.4, [['MAX', 'base']], 'maximum, maximize, max'],
      [10.4, [['MAXING', 'base'], [' OUT', 'dim']], '‘maxing out’ a credit card'],
      [11.6, [['MIN', 'base'], ['-', 'dim'], ['MAXING', 'base']], 'a gaming strategy'],
    ];
    rows.forEach(([at, parts, note], i) => {
      const g = eout(seg(t, at, at + 0.6)); if (g <= 0) return;
      const y = 220 + i * 120;
      word(parts.map(([p, st]) => [p.replace(' ', ''), st]), W / 2, y, 58, { alpha: g, gap: parts.length > 1 ? 10 : 0 });
      A(g, () => { font(500, 24); text(note, W / 2, y + 50, { align: 'center', color: C.soft }); });
    });
    // 13.8–18.2: MIN drops out, LOOKS slides in, the second x appears
    const sw = eio(seg(t, 14.2, 15.4)), xx = eout(seg(t, 16.2, 16.9));
    if (t > 13.8) {
      const y = 600;
      A(seg(t, 13.8, 14.2), () => {
        ctx.fillStyle = C.panel; k.rrect(60, y - 70, 744, 180, 16); ctx.fill();
        const st = 58 * 1.08, x0 = W / 2 - (12 * st) / 2, end = (n) => x0 + n * st;
        word([['MIN', 'dim']], end(5) - 1.5 * st, y - 6 - sw * 40, 58, { alpha: 1 - sw });
        word([['LOOKS', 'stem']], lerp(end(0) - 80, end(2.5), sw), y - 6, 58, { alpha: sw });
        if (xx > 0) word([['MAXXING', 'free']], end(5) + 3.5 * st, y - 6, 58);
        else word([['MAXING', 'free']], end(5) + 3 * st, y - 6, 58);
        A(xx, () => { font(700, 24); text('+ an extra x', end(5) + 3.5 * st, y + 62, { align: 'center', color: C.pink }); });
      });
    }
  });
}

// ---------- C: a libfix ----------
function sceneLibfix(t) {
  const a = span(t, 18.2, 23.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('A NAME FOR IT');
    const m = eio(seg(t, 19.6, 20.8));
    word([['LIB', m > 0 ? 'free' : 'base'], ['ERATED', 'base']], W / 2, 250, 54, { alpha: 1 - m * 0.3 });
    word([['AF', 'base'], ['FIX', m > 0 ? 'free' : 'base']], W / 2, 350, 54, { alpha: 1 - m * 0.3 });
    A(m, () => word([['LIB', 'free'], ['FIX', 'free']], W / 2, 500, 84, { gap: 0 }));
    A(seg(t, 21.0, 21.5), () => {
      font(600, 26); text('a piece of a word, set free to stick onto others', W / 2, 600, { align: 'center', color: C.ink });
      font(500, 24); text('term coined by linguist Arnold Zwicky, 2010', W / 2, 644, { align: 'center', color: C.soft });
    });
  });
}

// ---------- D: three old libfixes ----------
function sceneExamples(t) {
  const a = span(t, 22.8, 41.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('ENGLISH HAS DONE IT BEFORE');
    const S = 56;
    if (t < 32.2) {
      // ALCOHOLIC: its own parts, then the new cut
      const y = 260;
      const own = seg(t, 23.4, 24.0), re = eio(seg(t, 25.0, 26.2));
      const w1 = word([['ALCOHOL', 'base'], ['IC', 'base']], W / 2, y, S, { gap: 22 * own * (1 - re) });
      A(own * (1 - re), () => { font(600, 24); text('alcohol + ic', W / 2, y + 56, { align: 'center', color: C.soft }); });
      if (re > 0) {
        const w2 = word([['ALCO', 'dim'], ['HOLIC', 'free']], W / 2, y + 150, S, { gap: 26 * re, alpha: re });
        cut((w2.pos[3] + w2.pos[4]) / 2, y + 150, S, re);
        A(seg(t, 26.2, 26.7), () => { font(600, 24); text('heard as: alco + holic', W / 2, y + 206, { align: 'center', color: C.pink }); });
      }
      // 27.6–32.0: workaholic (1947), shopaholic
      A(seg(t, 27.8, 28.4), () => {
        word([['WORK', 'stem'], ['A', 'dim'], ['HOLIC', 'free']], W / 2, 560, 50, { gap: 0 });
        font(600, 24); text('Toronto Daily Star, 5 April 1947', W / 2, 612, { align: 'center', color: C.soft });
      });
      A(seg(t, 29.6, 30.2), () => word([['SHOP', 'stem'], ['A', 'dim'], ['HOLIC', 'free']], W / 2, 690, 50, { gap: 0 }));
    } else if (t < 36.8) {
      // WATERGATE → -gate
      const y = 270, c = eio(seg(t, 32.8, 33.8));
      const w1 = word([['WATER', 'dim'], ['GATE', 'free']], W / 2, y, 64, { gap: 26 * c });
      cut((w1.pos[4] + w1.pos[5]) / 2, y, 64, c);
      A(seg(t, 32.4, 32.9), () => { font(600, 24); text('the Watergate buildings, Washington: a break-in, 1972', W / 2, y + 62, { align: 'center', color: C.soft }); });
      A(seg(t, 34.2, 34.8), () => { font(700, 30); text('-gate  =  a scandal', W / 2, 440, { align: 'center', color: C.pink }); });
      // the pattern, without naming real scandals: any word in front
      A(eout(seg(t, 35.2, 35.8)), () => word([['???', 'stem'], ['GATE', 'free']], W / 2, 580, 54));
      A(seg(t, 35.8, 36.2), () => { font(500, 22); text('any word can go in front', W / 2, 642, { align: 'center', color: C.faint }); });
    } else {
      // MARATHON → walkathon (1932) → -athon
      const y = 250, c = eio(seg(t, 37.4, 38.2));
      const w1 = word([['MAR', 'dim'], ['ATHON', 'free']], W / 2, y, 60, { gap: 24 * c });
      cut((w1.pos[2] + w1.pos[3]) / 2, y, 60, c);
      A(seg(t, 37.0, 37.4), () => { font(600, 24); text('marathon: named after a battlefield in Greece', W / 2, y + 60, { align: 'center', color: C.soft }); });
      A(seg(t, 38.2, 38.8), () => { word([['WALK', 'stem'], ['ATHON', 'free']], W / 2, 410, 52); font(600, 24); text('1932', W / 2, 462, { align: 'center', color: C.soft }); });
      A(seg(t, 39.4, 39.9), () => word([['TELE', 'stem'], ['THON', 'free']], W / 2, 560, 46));
      A(seg(t, 40.0, 40.5), () => word([['HACK', 'stem'], ['ATHON', 'free']], W / 2, 660, 46));
    }
  });
}

// ---------- E: the trick; burger ----------
function sceneTrick(t) {
  const a = span(t, 41.2, 50.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header(t < 46.0 ? 'HOW A LIBFIX IS MADE' : 'A PIECE THAT BECAME A WORD');
    if (t < 46.0) {
      const steps = [['1', 'a word everyone knows', C.ink], ['2', 'cut it in a new place', C.cyan], ['3', 'hear the piece as the meaning', C.pink], ['4', 'stick it onto other words', C.lime]];
      steps.forEach(([n, s, col], i) => A(eout(seg(t, 41.6 + i * 0.8, 42.2 + i * 0.8)), () => {
        const y = 230 + i * 128;
        ctx.fillStyle = C.panel; k.rrect(110, y - 46, 644, 92, 14); ctx.fill();
        tile(n, 170, y, 60, i === 2 ? 'free' : i === 3 ? 'stem' : 'base');
        font(700, 32); text(s, 222, y, { color: col });
      }));
    } else {
      const y = 260, c = eio(seg(t, 46.6, 47.4)), own = seg(t, 46.2, 46.6);
      const w1 = word([['HAMBURG', 'base'], ['ER', 'base']], W / 2, y, 56, { gap: 20 * own * (1 - c) });
      A(own * (1 - c), () => { font(600, 24); text('Hamburg + er', W / 2, y + 56, { align: 'center', color: C.soft }); });
      if (c > 0) {
        const w2 = word([['HAM', 'dim'], ['BURGER', 'free']], W / 2, y + 140, 56, { gap: 24 * c, alpha: c });
        cut((w2.pos[2] + w2.pos[3]) / 2, y + 140, 56, c);
      }
      A(seg(t, 48.0, 48.5), () => word([['CHEESE', 'stem'], ['BURGER', 'free']], W / 2, 560, 48));
      A(seg(t, 49.0, 49.5), () => { word([['BURGER', 'free']], W / 2, 670, 60); font(600, 22); text('a word on its own', W / 2, 726, { align: 'center', color: C.pink }); });
    }
  });
}

// ---------- F: maxxing alone ----------
function sceneEnd(t) {
  const a = seg(t, 50.6, 51.0);
  if (a <= 0) return;
  A(a, () => {
    header('2026');
    if (t < 55.2) {
      word([['MAXXING', 'free']], W / 2, 290, 84, { drop: seg(t, 50.8, 52.0) });
      A(seg(t, 52.2, 52.8), () => {
        ctx.fillStyle = C.panel; k.rrect(92, 420, 680, 130, 16); ctx.fill();
        font(600, 32); text('“I’m maxxing everything I can.”', W / 2, 470, { align: 'center', color: C.ink });
        font(500, 22); text('an example Dictionary.com gives of maxxing on its own', W / 2, 516, { align: 'center', color: C.soft });
      });
    } else {
      const g = eout(seg(t, 55.4, 56.4));
      word([['MAXXING', 'free'], ['MAXXING', 'free']], W / 2, 330, 46, { gap: 16 * (1 - g) });
      A(seg(t, 56.6, 57.2), () => {
        font(800, 40); text('?', W / 2, 430, { align: 'center', color: C.pink });
        const short = ['AFFORDABILITY', 'DATA CENTER', 'ODYSSEY', 'UNC'];
        font(600, 22); text('also on the 2026 shortlist:', W / 2, 520, { align: 'center', color: C.soft });
        font(700, 26); text(short.join('  ·  ').toLowerCase(), W / 2, 562, { align: 'center', color: C.ink });
      });
    }
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [TILE, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneOpen(t);
    sceneLineage(t);
    sceneLibfix(t);
    sceneExamples(t);
    sceneTrick(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 41, weight: 700, family: TXT, ink: C.ink, marks: { '*': C.amber, '~': C.pink, '^': C.lime } });
  },
});
